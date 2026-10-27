import { useQuery } from "@tanstack/react-query";
import { photoService } from "../../services/photoService";
import PhotoGrid from "./PhotoGrid";
import PhotoLightbox from "./PhotoLightbox";
import { useState } from "react";
import GalleryToolBar from "./GalleryToolbar";
type AlbumGalleryProps = {
    albumId: number;
    canDownload: boolean
};

function AlbumGallery({ albumId, canDownload }: AlbumGalleryProps) {
    const photosQuery = useQuery({
        queryKey: ["photos", albumId],
        queryFn: () => photoService.getPhotos(albumId),
    });
    const [openIndex, setOpenIndex] = useState(-1);
    const [showPopular, setShowPopular] = useState(false);
    if (photosQuery.isPending) {
        return <section>טוען תמונות</section>;
    }
    if (photosQuery.isError) {
        return (
            <section>
                <p>{photosQuery.error.message}</p>
            </section>
        );
    }
    const visiblePhotos = showPopular
        ? photosQuery.data.filter((p) => p.likeCount > 0).sort((a, b) => b.likeCount - a.likeCount)
        : photosQuery.data;
    if (photosQuery.data.length === 0) {
        return <section>עוד אין תמונות באלבום</section>;
    }
    return (
        <section>
            <GalleryToolBar photoCount={photosQuery.data.length} showPopular={showPopular} onPopularChange={setShowPopular} />
            <PhotoGrid photos={visiblePhotos} onOpen={setOpenIndex} />
            <PhotoLightbox photos={visiblePhotos} index={openIndex} onClose={() => setOpenIndex(-1)} canDownload={canDownload}/>
        </section>
    );
}

export default AlbumGallery;