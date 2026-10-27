import type { UploadItem } from "../types/upload";

/**
 * מסמנת את הפריטים של בדיקה אחת כ-ready או duplicate.
 * - כבר באלבום: duplicateOf = 'album'
 * - אותו hash הופיע קודם ברשימה: duplicateOf = 'selection'
 * פריטים שאינם בבדיקה הזו נשארים כמו שהם.
 */
export function markDuplicates(
  items: UploadItem[],
  batchIds: Set<string>,
  existingHashes: string[]
): UploadItem[] {
  const inAlbum = new Set(existingHashes);
  const seen = new Set<string>();

  return items.map((item) => {
    const isInBatch = batchIds.has(item.id);

    if (!isInBatch || !item.hash) {
      // פריט קודם שנשאר להעלאה: ה-hash שלו "תפוס"
      if (item.hash && item.status !== "duplicate" && item.status !== "invalid") {
        seen.add(item.hash);
      }
      return item;
    }

    if (inAlbum.has(item.hash)) {
      return { ...item, status: "duplicate", duplicateOf: "album" };
    }

    if (seen.has(item.hash)) {
      return { ...item, status: "duplicate", duplicateOf: "selection" };
    }

    seen.add(item.hash);
    return { ...item, status: "ready" };
  });
}