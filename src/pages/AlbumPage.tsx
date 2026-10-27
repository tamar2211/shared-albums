import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { albumService } from "../services/albumService";
import AlbumGallery from "../components/Album/AlbumGallery";
import PhotoUpload from "../components/Album/PhotoUpload";
import AlbumHeader from "../components/Album/AlbumHeader";
import ManageAlbumModal from "../components/Album/ManageAlbumModal";

function Album() {
  const { id } = useParams();
  const albumId = Number(id);
  const albumQuery = useQuery({ queryKey: ["album", albumId], queryFn: () => albumService.getAlbum(albumId) });
  const [isManageOpen, setIsManageOpen] = useState(false);

  if (albumQuery.isPending) {
    return <section>טוען אלבום...</section>;
  }
  if (albumQuery.isError) {
    return (
      <section>
        <p>{albumQuery.error.message}</p>
        <Link to="/albums">חזרה לאלבומים</Link>
      </section>
    );
  }
  return (
    <>
      <AlbumHeader album={albumQuery.data} onManage={() => setIsManageOpen(true)} />
      {albumQuery.data.canUpload && <PhotoUpload albumId={albumId} />}
      <AlbumGallery
        albumId={albumId}
        albumName={albumQuery.data.name}
        canDownload={albumQuery.data.canDownload}
        isOwner={albumQuery.data.role === "owner"}
      />
      {albumQuery.data.role === "owner" && (
        <ManageAlbumModal
          album={albumQuery.data}
          open={isManageOpen}
          onClose={() => setIsManageOpen(false)}
        />
      )}
      <Link to="/albums">חזרה לאלבומים</Link>
    </>
  );
}

export default Album;