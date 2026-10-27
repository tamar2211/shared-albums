import { useParams, Link, Navigate,useNavigate } from "react-router";
import { useQuery ,useMutation, useQueryClient} from "@tanstack/react-query";
import { joinService } from "../services/joinService";
import { guestTokens } from "../services/guestTokens";
import { useAuth } from "../context/AuthContext";
import GuestJoinForm from "../components/Auth/GuestJoinForm";
export default function JoinPage() {
  const { code } = useParams();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const joinQuery = useQuery({
    queryKey: ["join", code],
    queryFn: () => joinService.getJoinInfo(code!),
  });

    const joinMutation = useMutation({
    mutationFn: (name?: string) => joinService.joinAlbum(code!, name),
    onSuccess: (result) => {
      if (result.token) {
        guestTokens.set(result.albumId, result.token);
      } else {
        queryClient.invalidateQueries({ queryKey: ["albums"] });
      }
      navigate(`/albums/${result.albumId}`, { replace: true });
    },
  });
  if (joinQuery.isPending || isLoading) return <p>טוען...</p>;

  if (joinQuery.isError)
    return (
      <div>
        <p>{joinQuery.error.message}</p>
        <Link to="/">לדף הבית</Link>
      </div>
    );

  const info = joinQuery.data;
  if(!user && guestTokens.get(info.albumId) )
  {
    return( <Navigate replace to={`/albums/${info.albumId}`}/>)
  }
   return (
    <div>
      <h1>
        הוזמנת לאלבום {info.name} של {info.ownerName}
      </h1>

      {user ? (
        <button onClick={() => joinMutation.mutate(undefined)} disabled={joinMutation.isPending}>
          כניסה לאלבום
        </button>
      ) : (
        <GuestJoinForm
          onSubmit={(name) => joinMutation.mutate(name)}
          isPending={joinMutation.isPending}
        />
      )}

      {joinMutation.isError && <p>{joinMutation.error.message}</p>}
    </div>
  );
}