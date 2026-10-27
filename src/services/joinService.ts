import {api} from "./api";
import type {JoinInfo,JoinResult} from "../types/api";
export const joinService ={
    async getJoinInfo(code: string) {
        const {data}=await api.get<JoinInfo>(`/join/${code}`);
        return data;
    },
    async joinAlbum(code: string, name?: string)
    {
        const { data } = await api.post<JoinResult>(`/join/${code}`,name ? { name } : {});
        return data;
    }
}