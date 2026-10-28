import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function BackLink() {
  const { user } = useAuth();

  return user ? (
    <Link className="back-link" to="/albums">חזרה לאלבומים</Link>
  ) : (
    <Link className="back-link" to="/">לדף הבית</Link>
  );
}

export default BackLink;