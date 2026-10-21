// הרשאות לאלבום. כל פעולה על אלבום או תמונה עוברת כאן לפני שהיא מתבצעת.
import type { Album } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { AuthUser } from '../types/express';
import { forbidden, notFound } from '../utils/httpError';

export type AlbumRole = 'owner' | 'member';

export interface AlbumAccess {
  album: Album;
  role: AlbumRole;
}

/** מחזיר את האלבום ואת התפקיד של המשתמש בו. מי שאינו מנהל ואינו משתתף מקבל 403. */
export async function getAlbumAccess(albumId: number, user: AuthUser): Promise<AlbumAccess> {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    throw notFound('האלבום לא נמצא');
  }

  if (album.ownerId === user.id) {
    return { album, role: 'owner' };
  }

  const membership = await prisma.albumMember.findUnique({
    where: { albumId_email: { albumId, email: user.email } },
  });
  if (membership) {
    return { album, role: 'member' };
  }

  throw forbidden('אין לך הרשאה לאלבום הזה');
}

export function requireOwner(access: AlbumAccess): void {
  if (access.role !== 'owner') {
    throw forbidden('רק מנהל האלבום יכול לבצע את הפעולה');
  }
}
