import type { AlbumCategory } from "../types/api";

export const CATEGORY_LABELS: Record<AlbumCategory, string> = {
    family: "אירוע משפחתי",
    trip: "טיול",
    class: "כיתה",
    other: "אחר",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [AlbumCategory, string][];