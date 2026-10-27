import { useQuery } from "@tanstack/react-query";
import { photoService } from "../../services/photoService";
import PhotoGrid from "./PhotoGrid";
import PhotoLightbox from "./PhotoLightbox";
import { useState } from "react";
import GalleryToolBar from "./GalleryToolbar";
import Modal from "../Modal";
import { useSelection } from "../../hooks/useSelection";
import { usePhotoDownload } from "../../hooks/usePhotoDownload";
import { usePhotoDelete } from "../../hooks/usePhotoDelete";

type AlbumGalleryProps = {
    albumId: number;
    canDownload: boolean;
    albumName: string;
    isOwner: boolean;
};

function AlbumGallery({ albumId, canDownload, albumName, isOwner }: AlbumGalleryProps) {
    const photosQuery = useQuery({
        queryKey: ["photos", albumId],
        queryFn: () => photoService.getPhotos(albumId),
    });
    const [openIndex, setOpenIndex] = useState(-1);
    const [showPopular, setShowPopular] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const selection = useSelection();
    const downloader = usePhotoDownload(albumName);
    const deleter = usePhotoDelete(albumId);

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

    const photos = photosQuery.data;

    if (photos.length === 0) {
        return <section>עוד אין תמונות באלבום</section>;
    }

    const visiblePhotos = showPopular
        ? photos.filter((p) => p.likeCount > 0).sort((a, b) => b.likeCount - a.likeCount)
        : photos;

    function handlePhotoClick(index: number) {
        if (selection.count > 0) {
            selection.toggle(visiblePhotos[index].id);
        } else {
            setOpenIndex(index);
        }
    }

    async function handleDownload() {
        const selected = photos.filter((p) => selection.selectedIds.has(p.id));
        const ok = await downloader.download(selected);
        if (ok) selection.clear();
    }

    async function handleDelete() {
        await deleter.deletePhotos([...selection.selectedIds]);
        selection.clear();
        setIsConfirmDeleteOpen(false);
    }

    return (
        <section>
            <GalleryToolBar
                photoCount={photos.length}
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
                canDelete={isOwner}
                onDelete={() => setIsConfirmDeleteOpen(true)}
            />
            {downloader.message && <p>{downloader.message}</p>}
            {deleter.message && <p>{deleter.message}</p>}
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
            <Modal
                open={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                title="מחיקת תמונות"
            >
                <p>למחוק {selection.count} תמונות? לא ניתן לבטל את הפעולה.</p>
                <button type="button" onClick={() => setIsConfirmDeleteOpen(false)}>
                    ביטול
                </button>
                <button type="button" onClick={handleDelete} disabled={deleter.isDeleting}>
                    {deleter.isDeleting ? "מוחק…" : "מחיקה"}
                </button>
            </Modal>
        </section>
    );
}

export default AlbumGallery;