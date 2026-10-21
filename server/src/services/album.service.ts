// לוגיקת האלבומים: רשימה עם חיפוש, יצירה, צפייה, עריכה ומחיקה.
import { prisma } from '../db/prisma';
import type { AlbumInput } from '../schemas/album.schema';
import type { AuthUser } from '../types/express';
import { getAlbumAccess, requireOwner } from './access.service';
import { type AlbumDto, parseDate, toAlbumDto } from './mappers';
import { deleteImages } from './storage.service';

/** מסיר כפילויות ואת המייל של המנהל עצמו מרשימת המשתתפים */
function cleanMembers(emails: string[], ownerEmail: string): string[] {
  return [...new Set(emails)].filter((email) => email !== ownerEmail).sort();
}

export async function listAlbums(
  user: AuthUser,
  search?: string,
): Promise<{ owned: AlbumDto[]; shared: AlbumDto[] }> {
  const albums = await prisma.album.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { email: user.email } } }],
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    },
    include: {
      owner: { select: { name: true } },
      _count: { select: { photos: true } },
      photos: { orderBy: { uploadedAt: 'asc' }, take: 1, select: { publicId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const dtos = albums.map((album) =>
    toAlbumDto(album, {
      ownerName: album.owner.name,
      role: album.ownerId === user.id ? 'owner' : 'member',
      photoCount: album._count.photos,
      coverPublicId: album.photos[0]?.publicId ?? null,
    }),
  );

  return {
    owned: dtos.filter((album) => album.role === 'owner'),
    shared: dtos.filter((album) => album.role === 'member'),
  };
}

async function loadAlbumDto(albumId: number, role: 'owner' | 'member'): Promise<AlbumDto> {
  const album = await prisma.album.findUniqueOrThrow({
    where: { id: albumId },
    include: {
      owner: { select: { name: true } },
      members: { select: { email: true }, orderBy: { email: 'asc' } },
      _count: { select: { photos: true } },
      photos: { orderBy: { uploadedAt: 'asc' }, take: 1, select: { publicId: true } },
    },
  });

  return toAlbumDto(album, {
    ownerName: album.owner.name,
    role,
    photoCount: album._count.photos,
    coverPublicId: album.photos[0]?.publicId ?? null,
    memberEmails: album.members.map((member) => member.email),
  });
}

export async function createAlbum(user: AuthUser, input: AlbumInput): Promise<AlbumDto> {
  const members = cleanMembers(input.memberEmails, user.email);

  const album = await prisma.album.create({
    data: {
      name: input.name,
      description: input.description,
      eventDate: parseDate(input.eventDate),
      status: input.status,
      ownerId: user.id,
      members: { create: members.map((email) => ({ email })) },
    },
  });

  return loadAlbumDto(album.id, 'owner');
}

export async function getAlbum(user: AuthUser, albumId: number): Promise<AlbumDto> {
  const { role } = await getAlbumAccess(albumId, user);
  return loadAlbumDto(albumId, role);
}

export async function updateAlbum(user: AuthUser, albumId: number, input: AlbumInput): Promise<AlbumDto> {
  const access = await getAlbumAccess(albumId, user);
  requireOwner(access);

  const members = cleanMembers(input.memberEmails, user.email);

  // טרנזקציה: הפרטים והמשתתפים מתעדכנים יחד, או שלא מתעדכן כלום
  await prisma.$transaction([
    prisma.album.update({
      where: { id: albumId },
      data: {
        name: input.name,
        description: input.description,
        eventDate: parseDate(input.eventDate),
        status: input.status,
      },
    }),
    prisma.albumMember.deleteMany({ where: { albumId } }),
    prisma.albumMember.createMany({ data: members.map((email) => ({ albumId, email })) }),
  ]);

  return loadAlbumDto(albumId, 'owner');
}

export async function deleteAlbum(user: AuthUser, albumId: number): Promise<void> {
  const access = await getAlbumAccess(albumId, user);
  requireOwner(access);

  const photos = await prisma.photo.findMany({ where: { albumId }, select: { publicId: true } });
  // המחיקה מוחקת גם את המשתתפים, התמונות והלייקים (onDelete: Cascade)
  await prisma.album.delete({ where: { id: albumId } });
  await deleteImages(photos.map((photo) => photo.publicId));
}
