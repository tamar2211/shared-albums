import type { UploadItem } from "../../types/upload";
import ProgressBar from "../ProgressBar";

type UploadReviewProps = {
    items: UploadItem[];
    onRemove: (id: string) => void;
    onCancel: () => void;
    onUpload: () => void;
};

function UploadReview({ items, onRemove, onCancel, onUpload }: UploadReviewProps) {
    const checkedCount = items.filter((item) => item.hash !== undefined).length;
    const readyCount = items.filter((item) => item.status === "ready").length;
    const duplicateCount = items.filter((item) => item.status === "duplicate").length;
    const isChecking = items.some((item) => item.status === "checking");

    return (
        <div>
            {isChecking && (
                <div className="review-progress">
                    <p>בודק תמונות: {checkedCount} מתוך {items.length}</p>
                    <ProgressBar value={checkedCount} max={items.length} />
                </div>
            )}

            <ul className="review-grid">
                {items.map((item) => (
                    <li key={item.id}>
                        <img src={item.previewUrl} alt={item.file.name} loading="lazy" />
                        {item.status === "duplicate" && (
                            <span className="review-badge">
                                {item.duplicateOf === "album" ? "כבר באלבום" : "נבחרה פעמיים"}
                            </span>
                        )}
                        {item.status === "error" && (
                            <span className="review-badge">{item.error}</span>
                        )}
                        <button type="button" aria-label="הסרה" onClick={() => onRemove(item.id)}>
                            ✕
                        </button>
                    </li>
                ))}
            </ul>

            <div className="review-footer">
                <p>{readyCount} תמונות יועלו, {duplicateCount} כפולות ידולגו</p>
                <button type="button" onClick={onCancel}>ביטול</button>
                <button type="button" onClick={onUpload} disabled={isChecking || readyCount === 0}>
                    העלה
                </button>
            </div>
        </div>
    );
}

export default UploadReview;