type GalleryToolBarProps={
    photoCount:number;
    showPopular:boolean;
    onPopularChange: (value: boolean) => void;
}
function GalleryToolBar({photoCount,showPopular,onPopularChange}:GalleryToolBarProps)
{
    return(
        <div className="gallery-toolbar" >
            <span>{photoCount} תמונות</span>
            <div className="segmented">
                <button aria-pressed={!showPopular} type="button" onClick={() => onPopularChange(false)}>הכל</button>
                <button aria-pressed={showPopular} type="button" onClick={() => onPopularChange(true)}>פופולריות</button>
            </div>
        </div>
    )
}
export default GalleryToolBar