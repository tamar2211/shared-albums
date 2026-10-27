import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Photo } from "../types/api";
import { photoService } from "../services/photoService";
import { runWithConcurrency } from "../utils/runWithConcurrency";

export function usePhotoDelete(albumId: number) {
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function deletePhotos(ids: number[]) {
        setIsDeleting(true);
        setMessage(null);
        let failed = 0;

        await runWithConcurrency(ids, 5, async (id) => {
            try {
                await photoService.deletePhoto(albumId, id);
                queryClient.setQueryData<Photo[]>(["photos", albumId], (old) =>
                    old?.filter((p) => p.id !== id)
                );
            } catch {
                failed++;
            }
        });

        queryClient.invalidateQueries({ queryKey: ["photos", albumId] });
        queryClient.invalidateQueries({ queryKey: ["album", albumId] });
        setIsDeleting(false);
        if (failed > 0) setMessage(`${failed} תמונות לא נמחקו`);
    }

    return { isDeleting, message, deletePhotos };
}