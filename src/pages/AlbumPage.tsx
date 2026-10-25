import { Link } from "react-router"

function Album() {
 

  return (
    <>
      <p>דף תצוגת אלבום בודד</p>
      <Link to="/albums">חזרה לאלבומים</Link>
    </>
  )
}

export default Album