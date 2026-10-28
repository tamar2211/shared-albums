import { useBlocker } from "react-router";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";
import { useWarnBeforeUnload } from "../../hooks/useWarnBeforeUnload";
import UploadTile from "./UploadTile";
import Modal from "../Modal";
import UploadReview from "./UploadReview";
import UploadProgress from "./UploadProgress";

type PhotoUploadProps = {
    albumId: number;
};

function PhotoUpload({ albumId }: PhotoUploadProps) {
    const { items, phase, skippedCount, addFiles, removeItem, clear, startUpload } = usePhotoUpload(albumId);
    const isReviewOpen = phase === "review" && items.length > 0;
    const isUploading = phase === "uploading";
    const blocker = useBlocker(isUploading);
    useWarnBeforeUnload(isUploading);

    return (
        <div className="photo-upload">
            <UploadTile onFiles={addFiles} disabled={isUploading} />
            <Modal open={isReviewOpen} onClose={clear} title="סקירת תמונות">
                <UploadReview
                    items={items}
                    onRemove={removeItem}
                    onCancel={clear}
                    onUpload={startUpload}
                />
            </Modal>
            {phase !== "review" && (
                <UploadProgress
                    items={items}
                    phase={phase}
                    skippedCount={skippedCount}
                    onClose={clear}
                />
            )}
            <Modal
                open={blocker.state === "blocked"}
                onClose={() => blocker.reset?.()}
                title="ההעלאה עדיין מתבצעת"
            >
                <p className="confirm-text">יציאה מהעמוד תמנע מעקב אחר ההתקדמות וניסיון חוזר לקבצים שנכשלו.</p>
                <button className="btn btn-primary" type="button" onClick={() => blocker.reset?.()}>
                    להישאר
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => blocker.proceed?.()}>
                    לצאת בכל זאת
                </button>
            </Modal>
        </div>
    );
}

export default PhotoUpload;