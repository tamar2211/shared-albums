import type { Album } from "../../types/api";
import { CATEGORY_LABELS } from "../../utils/categories";

type AlbumHeaderProps = {
    album: Album;
    onManage: () => void;
};

function AlbumHeader({ album, onManage }: AlbumHeaderProps) {
    return (
        <header className="album-header">
            <div className="album-header__title">
                <h1>{album.name}</h1>
                <span className="album-header__category">{CATEGORY_LABELS[album.category]}</span>
            </div>

            {album.description && <p className="album-header__description">{album.description}</p>}

            <p className="album-header__meta">
                {album.eventDate && (
                    <span>{new Date(album.eventDate).toLocaleDateString("he-IL")}</span>
                )}
                <span title="משתתפים" aria-label={`${album.participantCount} משתתפים`}>{album.participantCount}</span>
                <span title="תמונות" aria-label={`${album.photoCount} תמונות`}>{album.photoCount}</span>
                <span title="פתח את האלבום">{album.ownerName}</span>
            </p>

            {album.role === "owner" && (
                <button className="album-manage" type="button" onClick={onManage}>
                    ניהול אלבום
                </button>
            )}
        </header>
    );
}

export default AlbumHeader;