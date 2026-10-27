import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { albumService } from "../services/albumService";
import AlbumSearch from "../components/Album/AlbumSearch";
import AlbumGrid from "../components/Album/AlbumGrid";

function MyAlbumsPage() {
  const [search, setSearch] = useState("");
  const albumsQuery = useQuery({
    queryKey: ["albums"],
    queryFn: albumService.getAlbums,
  });

  if (albumsQuery.isPending) return <p>טוען אלבומים...</p>;
  if (albumsQuery.isError) return <p>{albumsQuery.error.message}</p>;

  const term = search.trim().toLowerCase();
  const albums = [...albumsQuery.data.owned, ...albumsQuery.data.shared]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((album) => album.name.toLowerCase().includes(term));

  return (
    <>
      <h1>האלבומים שלי</h1>
      <AlbumSearch value={search} onChange={setSearch} />
      {term && albums.length === 0 && (
        <p className="album-search-empty">לא נמצאו אלבומים עבור "{search.trim()}"</p>
      )}
      <AlbumGrid albums={albums} />
    </>
  );
}

export default MyAlbumsPage;