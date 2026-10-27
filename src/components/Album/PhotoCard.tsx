import type { Photo } from "../../types/api"
import LikeButton from "./LikeButton"
type PhotoCardProps={
    onOpen:()=>void;
    photo:Photo;
}
function PhotoCard({photo,onOpen}:PhotoCardProps)
{
    return(
        <div className="photo-card" >
        <button className="photo-card__open" type="button"   onClick={onOpen}> <img src={photo.thumbUrl} alt={photo.originalName} loading="lazy" /></button>
       <div className="photo-card__info">{photo.uploadedBy?.name} <LikeButton photo={photo} /></div>
     </div>
    )
}
export default PhotoCard