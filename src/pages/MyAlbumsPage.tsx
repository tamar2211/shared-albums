import { Link } from "react-router"

function MyAlbumPage() {
 

  return (
    <>
      <p>דף האלבומים שלי</p>
      <Link to="/albums/new">ליצירת אלבום חדש</Link>
      <br></br>
      <Link to="albums/:id">לדף אלבום ספציפי</Link>

    </>
  )
}

export default MyAlbumPage