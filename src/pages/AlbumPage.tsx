import { Link,useParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { albumService } from "../services/albumService"
import AlbumGallery from "../components/Album/AlbumGallery";
import PhotoUpload from "../components/Album/PhotoUpload";
function Album() {
 const {id}=useParams();
 const albumId=Number(id)
 const albumQuery=useQuery({queryKey:["album", albumId],queryFn:()=>albumService.getAlbum(albumId)})
  if(albumQuery.isPending)
  {
    return(<section>טוען אלבום...</section>)
  }
  if(albumQuery.isError)
  {
    return(<section>
     <p>{albumQuery.error.message}</p> 
       <Link to="/albums">חזרה לאלבומים</Link>
       </section>
    )
  }
 return (
    <>
      <p>דף תצוגת אלבום בודד</p>
      <p>{albumQuery.data?.name}</p>
       {albumQuery.data.canUpload && <PhotoUpload albumId={albumId} />}
      <AlbumGallery albumId={albumId} canDownload= {albumQuery.data.canDownload}/>
      <Link to="/albums">חזרה לאלבומים</Link>
    </>
  )
}

export default Album