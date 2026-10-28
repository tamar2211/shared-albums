import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { albumService } from "../../services/albumService";

type ParticipantsListProps = {
    albumId: number;
    enabled: boolean;
};

function ParticipantsList({ albumId, enabled }: ParticipantsListProps) {
    const queryClient = useQueryClient();

    const participantsQuery = useQuery({
        queryKey: ["participants", albumId],
        queryFn: () => albumService.getParticipants(albumId),
        enabled,
    });

    const removeMutation = useMutation({
        mutationFn: (participantId: number) => albumService.removeParticipant(albumId, participantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["participants", albumId] });
            queryClient.invalidateQueries({ queryKey: ["album", albumId] });
        },
    });

    function handleRemove(participantId: number, name: string) {
        if (window.confirm(`להסיר את ${name} מהאלבום? התמונות שהעלה יישארו.`)) {
            removeMutation.mutate(participantId);
        }
    }

    if (participantsQuery.isPending) return <p className="participants-status">טוען משתתפים...</p>;
    if (participantsQuery.isError) return <p className="participants-status form-error">{participantsQuery.error.message}</p>;

    return (
        <ul className="participants-list">
            {participantsQuery.data.map((p) => (
                <li key={p.id}>
                    <span className="participant__name">{p.name}</span>
                    <span className="participant__role">{p.isOwner ? "מנהל" : p.registered ? "משתמש רשום" : "אורח"}</span>
                    <span className="participant__count">{p.photoCount} תמונות</span>
                    {!p.isOwner && (
                        <button
                            className="participant__remove"
                            type="button"
                            onClick={() => handleRemove(p.id, p.name)}
                            disabled={removeMutation.isPending}
                        >
                            הסרה
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default ParticipantsList;