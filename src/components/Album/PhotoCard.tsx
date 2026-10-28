import type { Photo } from "../../types/api"
import LikeButton from "./LikeButton"
type PhotoCardProps = {
    onOpen: () => void;
    photo: Photo;
    selectable: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
}
function PhotoCard({ photo, onOpen, selectable, isSelected, onToggleSelect }: PhotoCardProps) {
    console.log("thumbUrl:", photo.thumbUrl);
    console.log("originalName:", photo.originalName);
    return (
        <div className={isSelected ? "photo-card is-selected" : "photo-card"}>
            {selectable && (
                <button
                    type="button"
                    className="photo-card__check"
                    aria-label="בחירת תמונה"
                    aria-pressed={isSelected}
                    onClick={onToggleSelect}
                >
                    ✓
                </button>
            )}
            <button className="photo-card__open" type="button" onClick={onOpen}> <img src={photo.thumbUrl} alt={photo.originalName} loading="lazy" /></button>
            <div className="photo-card__info">{photo.uploadedBy?.name} <LikeButton photo={photo} /></div>
        </div>
    )
}
export default PhotoCard