// המרה מרשומות מסד הנתונים לצורה שהלקוח מקבל (DTO).
import type { Album, AlbumStatus } from '@prisma/client';
import type { AlbumRole } from './access.service';
import { thumbUrl } from './storage.service';

export interface AlbumDto {
  id: number;
  name: string;
  description: string;
  eventDate: string | null;
  status: AlbumStatus;
  ownerId: number;
  ownerName: string;
  role: AlbumRole;
  photoCount: number;
  coverUrl: string | null;
  memberEmails?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PhotoDto {
  id: number;
  albumId: number;
  url: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  originalName: string;
  uploadedBy: { id: number; name: string } | null;
  uploadedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

/** תאריך מסוג DATE חוזר כ-"2026-10-21" */
export function formatDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

/** "2026-10-21" -> Date בחצות UTC, כדי שלא יזוז ביום בגלל אזור זמן */
export function parseDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export function toAlbumDto(
  album: Album,
  extra: {
    ownerName: string;
    role: AlbumRole;
    photoCount: number;
    coverPublicId?: string | null;
    memberEmails?: string[];
  },
): AlbumDto {
  return {
    id: album.id,
    name: album.name,
    description: album.description,
    eventDate: formatDate(album.eventDate),
    status: album.status,
    ownerId: album.ownerId,
    ownerName: extra.ownerName,
    role: extra.role,
    photoCount: extra.photoCount,
    coverUrl: extra.coverPublicId ? thumbUrl(extra.coverPublicId) : null,
    ...(extra.memberEmails ? { memberEmails: extra.memberEmails } : {}),
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
  };
}

export interface PhotoRecord {
  id: number;
  albumId: number;
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  originalName: string;
  uploadedAt: Date;
  uploadedBy: { id: number; name: string } | null;
  _count: { likes: number };
  likes: { userId: number }[];
}

export function toPhotoDto(photo: PhotoRecord): PhotoDto {
  return {
    id: photo.id,
    albumId: photo.albumId,
    url: photo.url,
    thumbUrl: thumbUrl(photo.publicId),
    width: photo.width,
    height: photo.height,
    originalName: photo.originalName,
    uploadedBy: photo.uploadedBy,
    uploadedAt: photo.uploadedAt.toISOString(),
    likeCount: photo._count.likes,
    likedByMe: photo.likes.length > 0,
  };
}
