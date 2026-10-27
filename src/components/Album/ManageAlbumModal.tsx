import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Album } from "../../types/api";
import type { AlbumFormData } from "./albumSchema";
import { albumService } from "../../services/albumService";
import Modal from "../Modal";
import AlbumForm from "./AlbumForm";
import JoinLink from "./JoinLink";
import ParticipantsList from "./ParticipantsList";
type ManageAlbumModalProps = {
    album: Album;
    open: boolean;
    onClose: () => void;
};

function ManageAlbumModal({ album, open, onClose }: ManageAlbumModalProps) {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (values: AlbumFormData) => albumService.updateAlbum(album.id, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["album", album.id] });
            queryClient.invalidateQueries({ queryKey: ["albums"] });
            onClose();
        },
    });
    const regenerateMutation = useMutation({
        mutationFn: () => albumService.regenerateJoinCode(album.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["album", album.id] });
        },
    });
    const defaultValues: AlbumFormData = {
        name: album.name,
        description: album.description,
        eventDate: album.eventDate ?? "",
        category: album.category,
        allowUpload: album.allowUpload,
        allowDownload: album.allowDownload,
    };
    return (
        <Modal open={open} onClose={onClose} title="ניהול אלבום">
            <h2>פרטי האלבום</h2>
            <AlbumForm
                submitLabel="שמירה"
                defaultValues={defaultValues}
                onSubmit={(values) => updateMutation.mutate(values)}
                isPending={updateMutation.isPending}
                errorMessage={updateMutation.error?.message}
            />
            <h2>קישור הצטרפות</h2>
            {album.joinCode && (
                <JoinLink
                    joinCode={album.joinCode}
                    onRegenerate={() => regenerateMutation.mutate()}
                />
            )}
            <h2>משתתפים ({album.participantCount})</h2>
            <ParticipantsList albumId={album.id} enabled={open} />
        </Modal>
    );
}

export default ManageAlbumModal;