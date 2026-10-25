// הרשאות לאלבום. כל פעולה על אלבום או תמונה עוברת כאן לפני שהיא מתבצעת.
//
// מי רשאי להיכנס לאלבום:
// - המנהל (המשתמש שיצר את האלבום)
// - משתתף שהצטרף דרך קישור ההצטרפות ולא הוסר: אורח עם טוקן משתתף, או משתמש רשום שהצטרף
import type { Album, Participant } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { Actor } from '../utils/currentUser';
import { forbidden, notFound } from '../utils/httpError';

export type AlbumRole = 'owner' | 'member';

export interface AlbumAccess {
  album: Album;
  role: AlbumRole;
  /** המשתתף שמבצע את הפעולה. אליו משויכות העלאות ולייקים. */
  participant: Participant;
}

const REMOVED = 'מנהל האלבום הסיר אותך מהאלבום';

/** המשתתף של המנהל באלבום. נוצר עם האלבום, ונוצר כאן מחדש אם חסר. */
export async function ownerParticipant(album: Album): Promise<Participant> {
  const existing = await prisma.participant.findFirst({ where: { albumId: album.id, isOwner: true } });
  if (existing) return existing;

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: album.ownerId } });
  return prisma.participant.upsert({
    where: { albumId_userId: { albumId: album.id, userId: owner.id } },
    create: { albumId: album.id, userId: owner.id, name: owner.name, isOwner: true },
    update: { isOwner: true, removedAt: null },
  });
}

/** מחזיר את האלבום, את התפקיד ואת המשתתף. מי שאינו מנהל ואינו משתתף מקבל 403. */
export async function getAlbumAccess(albumId: number, actor: Actor): Promise<AlbumAccess> {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    throw notFound('האלבום לא נמצא');
  }

  if (actor.kind === 'user') {
    if (album.ownerId === actor.user.id) {
      return { album, role: 'owner', participant: await ownerParticipant(album) };
    }
    const participant = await prisma.participant.findUnique({
      where: { albumId_userId: { albumId, userId: actor.user.id } },
    });
    if (participant?.removedAt) throw forbidden(REMOVED);
    if (participant) return { album, role: 'member', participant };
    throw forbidden('אין לך הרשאה לאלבום הזה. כדי להצטרף צריך את קישור ההצטרפות');
  }

  const participant = await prisma.participant.findUnique({ where: { id: actor.participantId } });
  if (!participant || participant.albumId !== albumId) {
    throw forbidden('אין לך הרשאה לאלבום הזה. כדי להצטרף צריך את קישור ההצטרפות');
  }
  if (participant.removedAt) throw forbidden(REMOVED);
  return { album, role: participant.isOwner ? 'owner' : 'member', participant };
}

export function requireOwner(access: AlbumAccess): void {
  if (access.role !== 'owner') {
    throw forbidden('רק מנהל האלבום יכול לבצע את הפעולה');
  }
}
