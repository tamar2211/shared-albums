import type { AlbumFormData } from "../components/Album/albumSchema";
import {api} from "./api";
import type { Album, Participant } from "../types/api";
async function  createAlbum(values:AlbumFormData)
{
    const { data } = await api.post<Album>("/albums", values);
    return data;
}
async function getAlbum(albumId: number)
{
    const { data } = await api.get<Album>(`/albums/${albumId}`);
    return data;
}
async function getAlbums() {
    const { data } = await api.get<{ owned: Album[]; shared: Album[] }>("/albums");
    return data;
}
async function updateAlbum(albumId: number, values: AlbumFormData) {
    const { data } = await api.put<Album>(`/albums/${albumId}`, values);
    return data;
}

async function regenerateJoinCode(albumId: number) {
    const { data } = await api.post<{ joinCode: string }>(`/albums/${albumId}/join-code`);
    return data.joinCode;
}

async function getParticipants(albumId: number) {
    const { data } = await api.get<{ participants: Participant[] }>(`/albums/${albumId}/participants`);
    return data.participants;
}

async function removeParticipant(albumId: number, participantId: number) {
    await api.delete(`/albums/${albumId}/participants/${participantId}`);
}
export const albumService = { createAlbum, getAlbum, getAlbums, updateAlbum, regenerateJoinCode, getParticipants, removeParticipant };