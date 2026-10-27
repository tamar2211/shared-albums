import { Link } from "react-router";
import type { Album } from "../../types/api";

type AlbumCardProps = {
  album: Album;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("he-IL", { timeZone: "UTC" });
}

function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link to={`/albums/${album.id}`} className="album-card">
      {album.coverUrl ? (
        <img src={album.coverUrl} alt="" className="album-card-cover" loading="lazy" />
      ) : (
        <div className="album-card-cover album-card-cover--empty" />
      )}
      <div className="album-card-body">
        <h3 className="album-card-name">{album.name}</h3>
        {album.eventDate && <p className="album-card-date">{formatDate(album.eventDate)}</p>}
        <p className="album-card-count">
          {album.photoCount === 1 ? "תמונה אחת" : `${album.photoCount} תמונות`}
        </p>
        {album.role === "member" && (
          <p className="album-card-owner">נפתח על ידי {album.ownerName}</p>
        )}
      </div>
    </Link>
  );
}

export default AlbumCard;