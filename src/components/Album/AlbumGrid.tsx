import { Link } from "react-router";
import type { Album } from "../../types/api";
import AlbumCard from "./AlbumCard";

type AlbumGridProps = {
  albums: Album[];
};

function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <ul className="album-grid">
      <li>
        <Link to="/albums/new" className="album-card album-card--add">
          <span className="album-card-add-icon" aria-hidden="true">+</span>
          <span>הוספת אלבום</span>
        </Link>
      </li>
      {albums.map((album) => (
        <li key={album.id}>
          <AlbumCard album={album} />
        </li>
      ))}
    </ul>
  );
}

export default AlbumGrid;