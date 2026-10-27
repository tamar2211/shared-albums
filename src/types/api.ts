
export type User = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AlbumCategory = 'family' | 'trip' | 'class' | 'other';

export type AlbumInput = {
  name: string;
  description?: string;
  eventDate?: string | null;
  allowUpload?: boolean;
  category?: AlbumCategory;
  allowDownload?: boolean;
};

export type Album = {
  id: number;
  name: string;
  description: string;
  eventDate: string | null;
  allowUpload: boolean;
 canUpload: boolean;
  category: AlbumCategory;
  allowDownload: boolean;
  canDownload: boolean;
  ownerId: number;
  ownerName: string;
  role: 'owner' | 'member';
  photoCount: number;
  participantCount: number;
  coverUrl: string | null;
  joinCode?: string;
  me?: { participantId: number; name: string };
  createdAt: string;
  updatedAt: string;
};

export type AlbumList = {
  owned: Album[];
  shared: Album[];
};

export type Participant = {
  id: number;
  name: string;
  isOwner: boolean;
  registered: boolean;
  photoCount: number;
  joinedAt: string;
};

export type JoinInfo = {
  albumId: number;
  name: string;
  ownerName: string;
  eventDate: string | null;
  allowUpload: boolean;
  photoCount: number;
  coverUrl: string | null;
};

export type JoinResult = {
  albumId: number;
  participant: { id: number; name: string };
  token: string | null;
};

export type Photo = {
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
};

export type UploadResult = {
  uploaded: Photo[];
  skipped: { name: string; reason: 'duplicate' }[];
  failed: { name: string; reason: string }[];
};

export type LikeState = {
  photoId: number;
  likeCount: number;
  likedByMe: boolean;
};

/** שגיאת ולידציה של שדה אחד, כפי שהשרת מחזיר ב-400 */
export type FieldError = {
  field: string;
  message: string;
};
