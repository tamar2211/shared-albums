type GalleryToolBarProps = {
    photoCount: number;
    showPopular: boolean;
    onPopularChange: (value: boolean) => void;
    selectedCount: number;
    onClearSelection: () => void;
    onSelectAll: () => void;
    onDownload: () => void;
    downloadProgress: { done: number; total: number } | null;
}
function GalleryToolBar({ photoCount, showPopular, onPopularChange, selectedCount, onClearSelection, onSelectAll, onDownload, downloadProgress, }: GalleryToolBarProps) {
    if (selectedCount > 0) {
        return (
            <div className="gallery-toolbar is-selecting">
                <button type="button" aria-label="ביטול בחירה" onClick={onClearSelection}>✕</button>
                <span>{selectedCount} נבחרו</span>
                <button type="button" onClick={onSelectAll}>בחר הכל</button>
                <button type="button" onClick={onDownload} disabled={downloadProgress !== null}>
                    {downloadProgress ? `מכין קובץ… ${downloadProgress.done}/${downloadProgress.total}` : "הורדה"}
                </button>
            </div>
        );
    }
    return (
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