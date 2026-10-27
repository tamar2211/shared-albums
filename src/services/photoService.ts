import { api } from "./api";
import type { Photo, UploadResult, LikeState } from "../types/api";
async function getPhotos(albumId: number, liked = false)
{
    const { data } = await api.get<{ photos: Photo[] }>(`/albums/${albumId}/photos`, {
        params: liked ? { liked: true } : undefined,
    });
    return data.photos;
}
async function checkDuplicates(albumId: number, hashes:string[]){
    const { data } = await api.post<{ existing: string[] }>(`/albums/${albumId}/photos/check`, { hashes });
    return data.existing;
}



async function uploadPhotos(albumId: number,files: File[],onProgress?: (percent: number) => void)
{
    const formData = new FormData();
files.forEach((file) => formData.append("photos", file));
const { data } = await api.post<UploadResult>(`/albums/${albumId}/photos`, formData, {
  onUploadProgress: (e) => {
    if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
  },
});

return data;
}
async function likePhoto(albumId: number, photoId: number) {
    const { data } = await api.post<LikeState>(`/albums/${albumId}/photos/${photoId}/like`);
    return data;
}

async function unlikePhoto(albumId: number, photoId: number) {
    const { data } = await api.delete<LikeState>(`/albums/${albumId}/photos/${photoId}/like`);
    return data;
}
export const photoService = { getPhotos, checkDuplicates, uploadPhotos, likePhoto, unlikePhoto };