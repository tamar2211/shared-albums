import type { AlbumFormData } from "../components/Album/albumSchema";
import {api} from "./api";
import type {Album} from "../types/api";
async function  createAlbum(values:AlbumFormData)
{
    const { data } = await api.post<Album>("/albums", values);
    return data;
}
export const albumService = { createAlbum };