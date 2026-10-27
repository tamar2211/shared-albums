import type { UploadResult } from "../types/api";
import type { UploadItem } from "../types/upload";

type Outcome = Pick<UploadItem, "status" | "error" | "duplicateOf">;

/** מתרגמת תשובת שרת של העלאת קובץ אחד לסטטוס של הפריט */
export function getUploadOutcome(result: UploadResult): Outcome {
  if (result.uploaded.length > 0) {
    return { status: "done" };
  }
  if (result.skipped.length > 0) {
    return { status: "duplicate", duplicateOf: "album" };
  }
  return { status: "error", error: result.failed[0]?.reason ?? "ההעלאה נכשלה" };
}

/** מתרגמת שגיאה (רשת, הרשאה, שרת) לסטטוס של הפריט */
export function getErrorOutcome(error: unknown): Outcome {
  const message = error instanceof Error ? error.message : "ההעלאה נכשלה";
  return { status: "error", error: message };
}