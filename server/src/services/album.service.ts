// לוגיקת האלבומים: רשימה עם חיפוש, יצירה, צפייה, עריכה, מחיקה, וניהול המשתתפים וקישור ההצטרפות.
import crypto from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { AlbumInput } from '../schemas/album.schema';
import type { AuthUser } from '../types/express';
import type { Actor } from '../utils/currentUser';
import { badRequest, notFound } from '../utils/httpError';
import { getAlbumAccess, requireOwner } from './access.service';
import { type AlbumDto, type ParticipantDto, parseDate, toAlbumDto } from './mappers';
import { deleteImages } from './storage.service';

/** קוד אקראי לקישור ההצטרפות: 16 תווים, אי אפשר לנחש אותו */
export const newJoinCode = (): string => crypto.randomBytes(12).toString('base64url');

/** מה טוענים לכל אלבום כדי להציג אותו. במספר המשתתפים לא נספרים מי שהוסרו. */
const albumInclude = {
  owner: { select: { name: true } },
  _count: { select: { photos: true, participants: { where: { removedAt: null } } } },
  photos: { orderBy: { uploadedAt: 'asc' }, take: 1, select: { publicId: true } },
} satisfies Prisma.AlbumInclude;

type AlbumWithInclude = Prisma.AlbumGetPayload<{ include: typeof albumInclude }>;

function dto(album: AlbumWithInclude, role: 'owner' | 'member', me?: { participantId: number; name: string }): AlbumDto {
  return toAlbumDto(album, {
    ownerName: album.owner.name,
    role,
    photoCount: album._count.photos,
    participantCount: album._count.participants,
    coverPublicId: album.photos[0]?.publicId ?? null,
    me,
  });
}

/** האלבומים שפתחתי, והאלבומים שהצטרפתי אליהם עם החשבון שלי */
export async function listAlbums(
  user: AuthUser,
  search?: string,
): Promise<{ owned: AlbumDto[]; shared: AlbumDto[] }> {
  const albums = await prisma.album.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { participants: { some: { userId: user.id, removedAt: null, isOwner: false } } },
      ],
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    },
    include: albumInclude,
    orderBy: { createdAt: 'desc' },
  });

  const dtos = albums.map((album) => dto(album, album.ownerId === user.id ? 'owner' : 'member'));
  return {
    owned: dtos.filter((album) => album.role === 'owner'),
    shared: dtos.filter((album) => album.role === 'member'),
  };
}

async function loadAlbumDto(albumId: number, role: 'owner' | 'member', me?: { participantId: number; name: string }) {
  const album = await prisma.album.findUniqueOrThrow({ where: { id: albumId }, include: albumInclude });
  return dto(album, role, me);
}

export async function createAlbum(user: AuthUser, input: AlbumInput): Promise<AlbumDto> {
  const album = await prisma.album.create({
    data: {
      name: input.name,
      description: input.description,
      eventDate: parseDate(input.eventDate),
      category: input.category,
      allowDownload: input.allowDownload,
      allowUpload: input.allowUpload,
      joinCode: newJoinCode(),
      ownerId: user.id,
      // גם המנהל הוא משתתף, כדי שהעלאות ולייקים שלו יעבדו כמו של כולם
      participants: { create: { name: user.name, userId: user.id, isOwner: true } },
    },
    include: { participants: true },
  });

  const owner = album.participants[0];
  return loadAlbumDto(album.id, 'owner', { participantId: owner.id, name: owner.name });
}

export async function getAlbum(actor: Actor, albumId: number): Promise<AlbumDto> {
  const { role, participant } = await getAlbumAccess(albumId, actor);
  return loadAlbumDto(albumId, role, { participantId: participant.id, name: participant.name });
}

export async function updateAlbum(user: AuthUser, albumId: number, input: AlbumInput): Promise<AlbumDto> {
  const access = await getAlbumAccess(albumId, { kind: 'user', user });
  requireOwner(access);

  await prisma.album.update({
    where: { id: albumId },
    data: {
      name: input.name,
      description: input.description,
      eventDate: parseDate(input.eventDate),
      category: input.category,
      allowDownload: input.allowDownload,
      allowUpload: input.allowUpload,
    },
  });

  return loadAlbumDto(albumId, 'owner', { participantId: access.participant.id, name: access.participant.name });
}

export async function deleteAlbum(user: AuthUser, albumId: number): Promise<void> {
  const access = await getAlbumAccess(albumId, { kind: 'user', user });
  requireOwner(access);

  const photos = await prisma.photo.findMany({ where: { albumId }, select: { publicId: true } });
  // המחיקה מוחקת גם את המשתתפים, התמונות והלייקים (onDelete: Cascade)
  await prisma.album.delete({ where: { id: albumId } });
  await deleteImages(photos.map((photo) => photo.publicId));
}

/** קישור חדש: הקוד מוחלף, והקישור הישן מפסיק לעבוד. מי שכבר הצטרף נשאר באלבום. */
export async function regenerateJoinCode(user: AuthUser, albumId: number): Promise<{ joinCode: string }> {
  const access = await getAlbumAccess(albumId, { kind: 'user', user });
  requireOwner(access);

  const album = await prisma.album.update({ where: { id: albumId }, data: { joinCode: newJoinCode() } });
  return { joinCode: album.joinCode };
}

export async function listParticipants(user: AuthUser, albumId: number): Promise<ParticipantDto[]> {
  const access = await getAlbumAccess(albumId, { kind: 'user', user });
  requireOwner(access);

  const participants = await prisma.participant.findMany({
    where: { albumId, removedAt: null },
    include: { _count: { select: { photos: true } } },
    orderBy: [{ isOwner: 'desc' }, { createdAt: 'asc' }],
  });

  return participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    isOwner: participant.isOwner,
    registered: participant.userId !== null,
    photoCount: participant._count.photos,
    joinedAt: participant.createdAt.toISOString(),
  }));
}

/** הסרת משתתף: הגישה שלו נחסמת מיד. התמונות שהעלה נשארות באלבום. */
export async function removeParticipant(user: AuthUser, albumId: number, participantId: number): Promise<void> {
  const access = await getAlbumAccess(albumId, { kind: 'user', user });
  requireOwner(access);

  const participant = await prisma.participant.findFirst({ where: { id: participantId, albumId, removedAt: null } });
  if (!participant) {
    throw notFound('המשתתף לא נמצא באלבום');
  }
  if (participant.isOwner) {
    throw badRequest('אי אפשר להסיר את מנהל האלבום');
  }

  await prisma.participant.update({ where: { id: participant.id }, data: { removedAt: new Date() } });
}
