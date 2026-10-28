import { Link } from "react-router"
import {useMutation,useQueryClient} from "@tanstack/react-query"
import {albumService} from "../services/albumService"
import AlbumForm from "../components/Album/AlbumForm"
import type {AlbumFormData} from "../components/Album/albumSchema"
import JoinLink from "../components/Album/JoinLink"
function NewAlbum() {
const queryClient = useQueryClient();
const createMutation = useMutation({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["albums"] }),
  mutationFn:(values: AlbumFormData) => albumService.createAlbum(values) });

   if(createMutation.isSuccess){
    return(
  <>
  <h1 className="page-title">האלבום נוצר בהצלחה</h1>
  {createMutation.data.joinCode && <JoinLink joinCode={createMutation.data.joinCode} />}
  <Link className="btn btn-primary" to ={`/albums/${createMutation.data.id}`}>לאלבום</Link>
  </>
  )}
  return (
    <>
      <h1 className="page-title">אלבום חדש</h1>
      <AlbumForm submitLabel="יצירת אלבום"
       onSubmit={(values) => createMutation.mutate(values)} isPending={createMutation.isPending} errorMessage={createMutation.error?.message}  />
     <Link className="back-link" to="/albums">חזרה לאלבומים</Link>   
    </>
  )
}

export default NewAlbum