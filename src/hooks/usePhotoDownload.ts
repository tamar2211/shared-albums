import { useState } from "react";
import type { Photo } from "../types/api";
import { downloadPhotos } from "../utils/downloadPhotos";

export function usePhotoDownload(zipName: string) {
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function download(photos: Photo[]): Promise<boolean> {
        if (photos.length > 200) {
            setMessage("אפשר להוריד עד 200 תמונות בכל פעם");
            return false;
        }
        setMessage(null);
        try {
            const { failed } = await downloadPhotos(photos, zipName, (done, total) =>
                setProgress({ done, total })
            );
            if (failed > 0) setMessage(`${failed} תמונות לא נכללו בקובץ`);
            return true;
        } catch (error) {
            setMessage((error as Error).message);
            return false;
        } finally {
            setProgress(null);
        }
    }

    return { progress, message, download };
}