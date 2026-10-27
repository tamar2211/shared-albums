import type { Photo } from "../../types/api";
import Lightbox from "yet-another-react-lightbox";
import { Download, Zoom } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
type PhotoLightboxProps={
    photos:Photo[];
    index:number;
    onClose:()=>void;
    canDownload:boolean;
}
function  PhotoLightbox({photos,index,onClose,canDownload}:PhotoLightboxProps)
{
    return (
    <Lightbox
        open={index >= 0}
        index={index}
        close={onClose}
        slides={photos.map((photo) => ({ src: photo.url }))}
        plugins={canDownload ? [Zoom, Download] : [Zoom]}
    />
);
}
export default PhotoLightbox;