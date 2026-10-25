// המרה מרשומות מסד הנתונים לצורה שהלקוח מקבל (DTO).
import type { Album, AlbumCategory } from '@prisma/client';
import type { AlbumRole } from './access.service';
import { thumbUrl, viewUrl } from './storage.service';

export interface AlbumDto {
  id: number;
  name: string;
  description: string;
  eventDate: string | null;
  category: AlbumCategory;
  /** האם משתתפים יכולים להוריד. המנהל תמיד יכול. */
  allowDownload: boolean;
  /** האם מי שמבצע את הבקשה יכול להוריד: מנהל, או משתתף כש-allowDownload פעיל */
  canDownload: boolean;
  /** האם משתתפים יכולים להעלות. המנהל תמיד יכול. */
  allowUpload: boolean;
  /** האם מי שמבצע את הבקשה יכול להעלות: מנהל, או משתתף כש-allowUpload פעיל */
  canUpload: boolean;
  ownerId: number;
  ownerName: string;
  role: AlbumRole;
  photoCount: number;
  participantCount: number;
  coverUrl: string | null;
  /** קוד קישור ההצטרפות. מוחזר רק למנהל. */
  joinCode?: string;
  /** המשתתף שמבצע את הבקשה. מוחזר בצפייה באלבום אחד. */
  me?: { participantId: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PhotoDto {
  id: number;
  albumId: number;
  /** תמונה מלאה. למשתתף באלבום שההורדה בו כבויה: גרסת צפייה מוקטנת */
  url: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  originalName: string;
  /** id הוא מזהה המשתתף שהעלה */
  uploadedBy: { id: number; name: string } | null;
  uploadedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface ParticipantDto {
  id: number;
  name: string;
  isOwner: boolean;
  /** משתמש רשום שהצטרף (ולא אורח) */
  registered: boolean;
  photoCount: number;
  joinedAt: string;
}

/** תאריך מסוג DATE חוזר כ-"2026-10-21" */
export function formatDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

/** "2026-10-21" -> Date בחצות UTC, כדי שלא יזוז ביום בגלל אזור זמן */
export function parseDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

/** המנהל תמיד יכול להוריד. משתתף רק כשההורדה מותרת באלבום */
export function canDownload(album: { allowDownload: boolean }, role: AlbumRole): boolean {
  return role === 'owner' || album.allowDownload;
}

/** המנהל תמיד יכול להעלות. משתתף רק כשההעלאה מותרת באלבום */
export function canUpload(album: { allowUpload: boolean }, role: AlbumRole): boolean {
  return role === 'owner' || album.allowUpload;
}

export function toAlbumDto(
  album: Album,
  extra: {
    ownerName: string;
    role: AlbumRole;
    photoCount: number;
    participantCount: number;
    coverPublicId?: string | null;
    me?: { participantId: number; name: string };
  },
): AlbumDto {
  return {
    id: album.id,
    name: album.name,
    description: album.description,
    eventDate: formatDate(album.eventDate),
    category: album.category,
    allowDownload: album.allowDownload,
    canDownload: canDownload(album, extra.role),
    allowUpload: album.allowUpload,
    canUpload: canUpload(album, extra.role),
    ownerId: album.ownerId,
    ownerName: extra.ownerName,
    role: extra.role,
    photoCount: extra.photoCount,
    participantCount: extra.participantCount,
    coverUrl: extra.coverPublicId ? thumbUrl(extra.coverPublicId) : null,
    ...(extra.role === 'owner' ? { joinCode: album.joinCode } : {}),
    ...(extra.me ? { me: extra.me } : {}),
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
  likes: { participantId: number }[];
}

/** fullSize: false מחזיר גרסת צפייה במקום הקובץ המלא */
export function toPhotoDto(photo: PhotoRecord, fullSize = true): PhotoDto {
  return {
    id: photo.id,
    albumId: photo.albumId,
    url: fullSize ? photo.url : viewUrl(photo.publicId),
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
