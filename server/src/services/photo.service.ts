// לוגיקת התמונות: רשימה וסינון לפי לייקים, בדיקת כפולות, העלאה, מחיקה ולייקים.
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { Actor } from '../utils/currentUser';
import { badRequest, forbidden, notFound } from '../utils/httpError';
import { getAlbumAccess, requireOwner } from './access.service';
import { canDownload, canUpload, type PhotoDto, toPhotoDto } from './mappers';
import { deleteImages, uploadImage } from './storage.service';

export interface UploadFile {
  originalname: string;
  buffer: Buffer;
}

export interface UploadResult {
  uploaded: PhotoDto[];
  skipped: { name: string; reason: 'duplicate' }[];
  failed: { name: string; reason: string }[];
}

export interface LikeState {
  photoId: number;
  likeCount: number;
  likedByMe: boolean;
}

/** אילו שדות לטעון לכל תמונה. likes מסונן למשתתף הנוכחי כדי לדעת אם הוא סימן לייק. */
function photoInclude(participantId: number) {
  return {
    uploadedBy: { select: { id: true, name: true } },
    _count: { select: { likes: true } },
    likes: { where: { participantId }, select: { participantId: true } },
  } satisfies Prisma.PhotoInclude;
}

export const sha256 = (buffer: Buffer): string => crypto.createHash('sha256').update(buffer).digest('hex');

// הדפדפן שולח שמות קבצים ב-UTF-8, אבל multer קורא אותם כ-latin1. מתקנים כדי שעברית תישמר.
// אם השם כבר מכיל תווים מעבר ל-latin1 (כלומר כבר פוענח נכון), משאירים אותו כמו שהוא.
function fixFileName(name: string): string {
  if (/[^\u0000-ÿ]/.test(name)) return name;
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes('�') ? name : decoded;
}

export async function listPhotos(actor: Actor, albumId: number, likedOnly: boolean): Promise<PhotoDto[]> {
  const { album, role, participant } = await getAlbumAccess(albumId, actor);
  const fullSize = canDownload(album, role);

  const photos = await prisma.photo.findMany({
    where: { albumId, ...(likedOnly ? { likes: { some: {} } } : {}) },
    include: photoInclude(participant.id),
    orderBy: likedOnly ? [{ likes: { _count: 'desc' } }, { uploadedAt: 'desc' }] : [{ uploadedAt: 'desc' }],
  });

  return photos.map((photo) => toPhotoDto(photo, fullSize));
}

export async function findExistingHashes(actor: Actor, albumId: number, hashes: string[]): Promise<string[]> {
  await getAlbumAccess(albumId, actor);
  if (hashes.length === 0) return [];

  const existing = await prisma.photo.findMany({
    where: { albumId, hash: { in: hashes } },
    select: { hash: true },
  });
  return existing.map((photo) => photo.hash);
}

export async function uploadPhotos(actor: Actor, albumId: number, files: UploadFile[]): Promise<UploadResult> {
  const { album, role, participant } = await getAlbumAccess(albumId, actor);
  const fullSize = canDownload(album, role);
  if (!canUpload(album, role)) {
    throw forbidden('האלבום נעול להעלאות');
  }
  if (files.length === 0) {
    throw badRequest('לא נבחרו תמונות להעלאה');
  }

  const result: UploadResult = { uploaded: [], skipped: [], failed: [] };
  const seenInRequest = new Set<string>();

  for (const file of files) {
    const name = fixFileName(file.originalname);
    const hash = sha256(file.buffer);

    // כפולות בתוך אותה העלאה, או מול מה שכבר באלבום
    if (seenInRequest.has(hash)) {
      result.skipped.push({ name, reason: 'duplicate' });
      continue;
    }
    seenInRequest.add(hash);

    const existing = await prisma.photo.findUnique({ where: { albumId_hash: { albumId, hash } } });
    if (existing) {
      result.skipped.push({ name, reason: 'duplicate' });
      continue;
    }

    const stored = await uploadImage(file.buffer, albumId).catch((err: unknown) => {
      console.error('העלאה ל-Cloudinary נכשלה', err instanceof Error ? err.message : err);
      return null;
    });
    if (!stored) {
      result.failed.push({ name, reason: 'ההעלאה לשירות התמונות נכשלה' });
      continue;
    }

    try {
      const photo = await prisma.photo.create({
        data: {
          albumId,
          url: stored.url,
          publicId: stored.publicId,
          hash,
          originalName: name,
          width: stored.width,
          height: stored.height,
          uploadedById: participant.id,
        },
        include: photoInclude(participant.id),
      });
      result.uploaded.push(toPhotoDto(photo, fullSize));
    } catch (err) {
      // אילוץ הייחודיות (albumId + hash): מישהו אחר העלה את אותה תמונה באותו רגע
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        await deleteImages([stored.publicId]);
        result.skipped.push({ name, reason: 'duplicate' });
        continue;
      }
      throw err;
    }
  }

  return result;
}

async function getPhotoInAlbum(albumId: number, photoId: number) {
  const photo = await prisma.photo.findFirst({ where: { id: photoId, albumId } });
  if (!photo) {
    throw notFound('התמונה לא נמצאה');
  }
  return photo;
}

export async function deletePhoto(actor: Actor, albumId: number, photoId: number): Promise<void> {
  const access = await getAlbumAccess(albumId, actor);
  requireOwner(access);

  const photo = await getPhotoInAlbum(albumId, photoId);
  await prisma.photo.delete({ where: { id: photo.id } });
  await deleteImages([photo.publicId]);
}

async function likeState(photoId: number, participantId: number): Promise<LikeState> {
  const [likeCount, mine] = await Promise.all([
    prisma.photoLike.count({ where: { photoId } }),
    prisma.photoLike.findUnique({ where: { photoId_participantId: { photoId, participantId } } }),
  ]);
  return { photoId, likeCount, likedByMe: mine !== null };
}

export async function likePhoto(actor: Actor, albumId: number, photoId: number): Promise<LikeState> {
  const { participant } = await getAlbumAccess(albumId, actor);
  await getPhotoInAlbum(albumId, photoId);

  await prisma.photoLike.upsert({
    where: { photoId_participantId: { photoId, participantId: participant.id } },
    create: { photoId, participantId: participant.id },
    update: {},
  });
  return likeState(photoId, participant.id);
}

export async function unlikePhoto(actor: Actor, albumId: number, photoId: number): Promise<LikeState> {
  const { participant } = await getAlbumAccess(albumId, actor);
  await getPhotoInAlbum(albumId, photoId);

  await prisma.photoLike.deleteMany({ where: { photoId, participantId: participant.id } });
  return likeState(photoId, participant.id);
}
