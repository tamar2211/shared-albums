type GalleryToolBarProps = {
    photoCount: number;
    showPopular: boolean;
    onPopularChange: (value: boolean) => void;
    selectedCount: number;
    onClearSelection: () => void;
    onSelectAll: () => void;
    onDownload: () => void;
    downloadProgress: { done: number; total: number } | null;
    canDelete: boolean;
    onDelete: () => void;
}
function GalleryToolBar({ onDelete,canDelete,photoCount, showPopular, onPopularChange, selectedCount, onClearSelection, onSelectAll, onDownload, downloadProgress, }: GalleryToolBarProps) {
    if (selectedCount > 0) {
        return (
            <div className="gallery-toolbar is-selecting">
                <button className="toolbar-btn toolbar-btn--clear" type="button" aria-label="ביטול בחירה" onClick={onClearSelection}>✕</button>
                <span className="toolbar-count">{selectedCount} נבחרו</span>
                <button className="toolbar-btn toolbar-btn--all" type="button" onClick={onSelectAll}>בחר הכל</button>
                <button className="toolbar-btn toolbar-btn--download" type="button" onClick={onDownload} disabled={downloadProgress !== null}>
                    {downloadProgress ? `מכין קובץ… ${downloadProgress.done}/${downloadProgress.total}` : "הורדה"}
                </button>
            {canDelete && <button className="toolbar-btn toolbar-btn--delete" type="button" onClick={onDelete}>מחיקה</button>}
            </div>
        );
    }
    return (
        <div className="gallery-toolbar" >
            <span className="toolbar-count">{photoCount} תמונות</span>
            <div className="segmented">
                <button aria-pressed={!showPopular} type="button" onClick={() => onPopularChange(false)}>הכל</button>
                <button aria-pressed={showPopular} type="button" onClick={() => onPopularChange(true)}>פופולריות</button>
            </div>
        </div>
    )
}
export default GalleryToolBar