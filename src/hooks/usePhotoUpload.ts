import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UploadItem } from "../types/upload";
import type { Photo } from "../types/api";
import { hashFile } from "../utils/hash";
import { photoService } from "../services/photoService";
import { markDuplicates } from "../utils/markDuplicates";
import { runWithConcurrency } from "../utils/runWithConcurrency";
import { getUploadOutcome, getErrorOutcome } from "../utils/uploadOutcome";

type UploadPhase = "review" | "uploading" | "summary";

export function usePhotoUpload(albumId: number) {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [phase, setPhase] = useState<UploadPhase>("review");
    const [skippedCount, setSkippedCount] = useState(0);
    const queryClient = useQueryClient();

    function updateItem(id: string, changes: Partial<UploadItem>) {
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, ...changes } : i))
        );
    }

    function addFiles(files: File[]) {
        if (phase === "uploading") return;
        const newItems: UploadItem[] = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            status: "checking",
        }));

        if (phase === "summary") {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
            setItems(newItems);
            setPhase("review");
        } else {
            setItems((prev) => [...prev, ...newItems]);
        }

        checkItems(newItems);
    }

    async function checkItems(newItems: UploadItem[]) {
        const hashes: string[] = [];

        for (const item of newItems) {
            const hash = await hashFile(item.file);
            hashes.push(hash);
            updateItem(item.id, { hash });
        }

        const batchIds = new Set(newItems.map((item) => item.id));

        try {
            const existing = await photoService.checkDuplicates(albumId, hashes);
            setItems((prev) => markDuplicates(prev, batchIds, existing));
        } catch {
            setItems((prev) =>
                prev.map((i): UploadItem =>
                    batchIds.has(i.id)
                        ? { ...i, status: "error", error: "בדיקת הכפולים נכשלה" }
                        : i
                )
            );
        }
    }

    function removeItem(id: string) {
        const item = items.find((i) => i.id === id);
        if (item) {
            URL.revokeObjectURL(item.previewUrl);
            setItems((prev) => prev.filter((i) => i.id !== id));
        }
    }

    function clear() {
        items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setItems([]);
        setSkippedCount(0);
        setPhase("review");
    }

    async function startUpload() {

        const toUpload = items.filter((item) => item.status === "ready");
        const skipped = items.filter((item) => item.status !== "ready");

        skipped.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setSkippedCount(skipped.length);
        setPhase("uploading");
        setItems(toUpload.map((i): UploadItem => ({ ...i, status: "uploading" })));
        await runWithConcurrency(toUpload, 5, async (item) => {
            try {
                const result = await photoService.uploadPhotos(albumId, [item.file]);
                updateItem(item.id, getUploadOutcome(result));

                const photo = result.uploaded[0];
                if (photo) {
                    queryClient.setQueryData<Photo[]>(["photos", albumId], (old) =>
                        old ? [...old, photo] : [photo]
                    );
                }
            } catch (error) {
                updateItem(item.id, getErrorOutcome(error));
            }
        });

        queryClient.invalidateQueries({ queryKey: ["photos", albumId] });
        setPhase("summary");
    }

    return { items, phase, skippedCount, addFiles, removeItem, clear, startUpload };
}