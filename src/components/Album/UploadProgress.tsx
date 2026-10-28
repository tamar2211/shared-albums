import { useState } from "react";
import type { UploadItem } from "../../types/upload";
import ProgressBar from "../ProgressBar";

type UploadProgressProps = {
    items: UploadItem[];
    phase: "uploading" | "summary";
    skippedCount: number;
    onClose: () => void;
};
function UploadProgress({ items, phase, skippedCount, onClose }: UploadProgressProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const total = items.length;
    const finishedCount = items.filter((x) => x.status !== "uploading").length;
    const doneCount = items.filter((x) => x.status === "done").length;
    const failedCount = items.filter((x) => x.status === "error").length;
    const isUploading = phase === "uploading";
    const totalSkipped = skippedCount + items.filter((x) => x.status === "duplicate").length;
    if (isMinimized) {
        return (
            <button
                type="button"
                className="upload-progress-mini"
                onClick={() => setIsMinimized(false)}
            >
                {isUploading ? `מעלה ${finishedCount}/${total}` : "ההעלאה הסתיימה"}
            </button>
        );
    }
    return (
        <div className="upload-progress" role="status">
            <div className="upload-progress-header">
                <strong>{isUploading ? "מעלה תמונות" : "ההעלאה הסתיימה"}</strong>
                <button className="upload-progress__minimize" type="button" aria-label="מזעור" onClick={() => setIsMinimized(true)}>
                    _
                </button>
            </div>

            {isUploading ? (
                <>
                    <p>{finishedCount} מתוך {total}</p>
                    <ProgressBar value={finishedCount} max={total} />
                </>
            ) : (
                <>
                    <p>הועלו {doneCount} תמונות</p>
                    {totalSkipped > 0 && <p>דולגו {totalSkipped} כפולות</p>}
                    {failedCount > 0 && (  <p>נכשלו {failedCount}. אפשר לבחור שוב את אותן תמונות, ואלה שכבר הועלו ידולגו.</p>
                    )}
                    <button className="btn btn-secondary" type="button" onClick={onClose}>סגור</button>
                </>
            )}
        </div>
    );
}

export default UploadProgress;