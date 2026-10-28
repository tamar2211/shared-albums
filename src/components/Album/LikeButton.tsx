import {useMutation,useQueryClient} from "@tanstack/react-query";
import type { Photo } from "../../types/api"
import { photoService } from "../../services/photoService";

type LikeButtonProps={
    photo:Photo
}
function LikeButton({ photo }:LikeButtonProps ) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () =>
      photo.likedByMe
        ? photoService.unlikePhoto(photo.albumId, photo.id)
        : photoService.likePhoto(photo.albumId, photo.id),
    onSuccess: (state) => {
      queryClient.setQueryData<Photo[]>(["photos", photo.albumId], (old) =>
        old?.map((r) =>
          r.id === state.photoId
            ? { ...r, likeCount: state.likeCount, likedByMe: state.likedByMe }
            : r
        )
      );
    },
    
  });
     return (
       <button
           type="button"
           className={photo.likedByMe ? "like-button is-liked" : "like-button"}
           onClick={() => saveMutation.mutate()}
           disabled={saveMutation.isPending}
       >
           {photo.likedByMe ? "♥" : "♡"} {photo.likeCount}
       </button>
   );
  }
  export default LikeButton;