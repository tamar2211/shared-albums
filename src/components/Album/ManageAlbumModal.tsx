import { useState } from "react";
import { useNavigate } from "react-router";
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
    const navigate = useNavigate();
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

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
    const deleteMutation = useMutation({
        mutationFn: () => albumService.deleteAlbum(album.id),
        onSuccess: () => {
            // ⚠️ קודם עוברים לדף האלבומים, ורק אחר כך מוחקים מהזיכרון את הנתונים של האלבום.
            // אם נמחק קודם, דף האלבום (שעדיין פתוח) ינסה לטעון אותו מחדש ויקבל שגיאה
            navigate("/albums", { replace: true });
            queryClient.removeQueries({ queryKey: ["album", album.id] });
            queryClient.removeQueries({ queryKey: ["photos", album.id] });
            queryClient.removeQueries({ queryKey: ["participants", album.id] });
            queryClient.invalidateQueries({ queryKey: ["albums"] });
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
        <>
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
                <div className="danger-zone">
                    <div>
                        <strong>מחיקת האלבום</strong>
                        <p>כל התמונות, המשתתפים והלייקים יימחקו לצמיתות.</p>
                    </div>
                    <button className="btn btn-danger-ghost" type="button" onClick={() => setIsConfirmDeleteOpen(true)}>
                        מחיקת אלבום
                    </button>
                </div>
            </Modal>

            {/* ⚠️ חלון האישור הוא Modal נפרד ולא בתוך חלון הניהול, כדי שייפתח מעליו ולא יירש את הפריסה שלו */}
            <Modal
                open={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                title="למחוק את האלבום?"
            >
                <p className="confirm-text">
                    האלבום "{album.name}" וכל {album.photoCount} התמונות שבו יימחקו לצמיתות. אי אפשר לבטל את הפעולה.
                </p>
                {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
                <button className="btn btn-secondary" type="button" onClick={() => setIsConfirmDeleteOpen(false)}>
                    ביטול
                </button>
                <button className="btn btn-danger" type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? "מוחק…" : "מחיקה לצמיתות"}
                </button>
            </Modal>
        </>
    );
}

export default ManageAlbumModal;
