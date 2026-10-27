import type { Photo } from "../../types/api";
import PhotoCard from "./PhotoCard";

type PhotoGridProps={
photos:Photo[];
onOpen:(index: number) => void;
}
function PhotoGrid({photos,onOpen}:PhotoGridProps)
{
    return (
    <div className="photo-grid">
        {photos.map((photo, index) => (
            <PhotoCard
                key={photo.id}
                photo={photo}
                onOpen={() => onOpen(index)}
            />
        ))}
    </div>
);
}
export default PhotoGrid;