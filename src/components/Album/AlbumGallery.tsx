import { useQuery } from "@tanstack/react-query";
import { photoService } from "../../services/photoService";
import PhotoGrid from "./PhotoGrid";
import PhotoLightbox from "./PhotoLightbox";
import { useState } from "react";
import GalleryToolBar from "./GalleryToolbar";
import { useSelection } from "../../hooks/useSelection";
import { usePhotoDownload } from "../../hooks/usePhotoDownload";

type AlbumGalleryProps = {
    albumId: number;
    canDownload: boolean;
    albumName: string;
};

function AlbumGallery({ albumId, canDownload, albumName }: AlbumGalleryProps) {
    const photosQuery = useQuery({
        queryKey: ["photos", albumId],
        queryFn: () => photoService.getPhotos(albumId),
    });
    const [openIndex, setOpenIndex] = useState(-1);
    const [showPopular, setShowPopular] = useState(false);
    const selection = useSelection();
    const downloader = usePhotoDownload(albumName);

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

    function handlePhotoClick(index: number) {
        if (selection.count > 0) {
            selection.toggle(visiblePhotos[index].id);
        } else {
            setOpenIndex(index);
        }
    }

    async function handleDownload() {
        const selected = photosQuery.data.filter((p) => selection.selectedIds.has(p.id));
        const ok = await downloader.download(selected);
        if (ok) selection.clear();
    }

    return (
        <section>
            <GalleryToolBar
                photoCount={photosQuery.data.length}
                showPopular={showPopular}
                onPopularChange={(value) => {
                    setShowPopular(value);
                    selection.clear();
                }}
                selectedCount={selection.count}
                onClearSelection={selection.clear}
                onSelectAll={() => selection.selectAll(visiblePhotos.map((p) => p.id))}
                onDownload={handleDownload}
                downloadProgress={downloader.progress}
            />
            {downloader.message && <p>{downloader.message}</p>}
            <PhotoGrid
                photos={visiblePhotos}
                onOpen={handlePhotoClick}
                selectable={canDownload}
                selectedIds={selection.selectedIds}
                onToggleSelect={selection.toggle}
            />
            <PhotoLightbox
                photos={visiblePhotos}
                index={openIndex}
                onClose={() => setOpenIndex(-1)}
                canDownload={canDownload}
            />
        </section>
    );
}

export default AlbumGallery;