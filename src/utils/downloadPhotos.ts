import JSZip from "jszip";
import type { Photo } from "../types/api";
import { runWithConcurrency } from "./runWithConcurrency";

const CONCURRENCY = 5;

async function fetchBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.blob();
}

function saveBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "album";
}

function uniqueName(name: string, used: Set<string>): string {
    if (!used.has(name)) {
        used.add(name);
        return name;
    }
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    let i = 2;
    while (used.has(`${base} (${i})${ext}`)) i++;
    const result = `${base} (${i})${ext}`;
    used.add(result);
    return result;
}

export async function downloadPhotos(
    photos: Photo[],
    zipName: string,
    onProgress?: (done: number, total: number) => void
): Promise<{ failed: number }> {
    const total = photos.length;
    if (total === 0) return { failed: 0 };

    if (total === 1) {
        const photo = photos[0];
        try {
            const blob = await fetchBlob(photo.url);
            onProgress?.(1, 1);
            saveBlob(blob, safeFileName(photo.originalName));
            return { failed: 0 };
        } catch {
            throw new Error("הורדת התמונה נכשלה");
        }
    }

    const zip = new JSZip();
    const used = new Set<string>();
    let done = 0;
    let failed = 0;
    onProgress?.(0, total);

    await runWithConcurrency(photos, CONCURRENCY, async (photo) => {
        try {
            const blob = await fetchBlob(photo.url);
            zip.file(uniqueName(safeFileName(photo.originalName), used), blob);
        } catch {
            failed++;
        }
        done++;
        onProgress?.(done, total);
    });

    if (failed === total) throw new Error("הורדת התמונות נכשלה");

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    saveBlob(zipBlob, `${safeFileName(zipName)}.zip`);
    return { failed };
}