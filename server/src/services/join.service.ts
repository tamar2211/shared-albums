// הצטרפות לאלבום דרך קישור. מי שיש לו את הקישור יכול להצטרף:
// - אורח: כותב שם לתצוגה ומקבל טוקן משתתף, שהדפדפן שומר
// - משתמש רשום ומחובר: מצטרף עם החשבון שלו, והאלבום מופיע אצלו ב"אלבומים ששותפו איתי"
import type { Participant } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { AuthUser } from '../types/express';
import { badRequest, forbidden, notFound } from '../utils/httpError';
import { signParticipantToken } from '../utils/tokens';
import { ownerParticipant } from './access.service';
import { formatDate } from './mappers';
import { thumbUrl } from './storage.service';

/** מגבלה על מספר המשתתפים באלבום, כדי שקישור שהופץ לא ימלא את המסד */
export const MAX_PARTICIPANTS = 500;

export interface JoinInfo {
  albumId: number;
  name: string;
  ownerName: string;
  eventDate: string | null;
  /** האם משתתפים יכולים להעלות */
  allowUpload: boolean;
  photoCount: number;
  coverUrl: string | null;
}

export interface JoinResult {
  albumId: number;
  participant: { id: number; name: string };
  /** טוקן משתתף לאורח. משתמש רשום ממשיך עם הטוקן שלו, ולכן מקבל null. */
  token: string | null;
}

const INVALID_LINK = 'הקישור לא תקין, או שמנהל האלבום החליף אותו בקישור חדש';

async function findAlbumByCode(code: string) {
  const album = await prisma.album.findUnique({
    where: { joinCode: code },
    include: {
      owner: { select: { name: true } },
      _count: { select: { photos: true, participants: { where: { removedAt: null } } } },
      photos: { orderBy: { uploadedAt: 'asc' }, take: 1, select: { publicId: true } },
    },
  });
  if (!album) throw notFound(INVALID_LINK);
  return album;
}

/** מה מציגים בדף ההצטרפות, לפני שמצטרפים */
export async function getJoinInfo(code: string): Promise<JoinInfo> {
  const album = await findAlbumByCode(code);
  return {
    albumId: album.id,
    name: album.name,
    ownerName: album.owner.name,
    eventDate: formatDate(album.eventDate),
    allowUpload: album.allowUpload,
    photoCount: album._count.photos,
    coverUrl: album.photos[0] ? thumbUrl(album.photos[0].publicId) : null,
  };
}

const result = (participant: Participant, token: string | null): JoinResult => ({
  albumId: participant.albumId,
  participant: { id: participant.id, name: participant.name },
  token,
});

export async function joinAlbum(code: string, name: string | undefined, user: AuthUser | undefined): Promise<JoinResult> {
  const album = await findAlbumByCode(code);

  if (user) {
    if (album.ownerId === user.id) {
      return result(await ownerParticipant(album), null);
    }
    const existing = await prisma.participant.findUnique({
      where: { albumId_userId: { albumId: album.id, userId: user.id } },
    });
    if (existing?.removedAt) throw forbidden('מנהל האלבום הסיר אותך מהאלבום');
    if (existing) return result(existing, null);
  } else if (!name) {
    throw badRequest('צריך לכתוב שם לתצוגה כדי להצטרף');
  }

  if (album._count.participants >= MAX_PARTICIPANTS) {
    throw forbidden('האלבום מלא. פני למנהל האלבום');
  }

  const participant = await prisma.participant.create({
    data: {
      albumId: album.id,
      // משתמש רשום מופיע בשם שבחר בהרשמה, אלא אם כתב שם אחר
      name: name ?? (user as AuthUser).name,
      userId: user?.id ?? null,
    },
  });

  return result(participant, user ? null : signParticipantToken(participant.id));
}
