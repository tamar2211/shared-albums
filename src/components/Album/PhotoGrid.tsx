import type { Photo } from "../../types/api";
import PhotoCard from "./PhotoCard";

type PhotoGridProps = {
    photos: Photo[];
    onOpen: (index: number) => void;
    selectable: boolean;
    selectedIds: Set<number>;
    onToggleSelect: (id: number) => void;
}
function PhotoGrid({ photos, onOpen,selectable,selectedIds, onToggleSelect}: PhotoGridProps) {
    return (
        <div className="photo-grid">
            {photos.map((photo, index) => (
                <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onOpen={() => onOpen(index)}
                    selectable={selectable}
                    isSelected={selectedIds.has(photo.id)}
                    onToggleSelect={() => onToggleSelect(photo.id)}
                />
            ))}
        </div>
    );
}
export default PhotoGrid;