import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function BackLink() {
  const { user } = useAuth();

  return user ? (
    <Link to="/albums">חזרה לאלבומים</Link>
  ) : (
    <Link to="/">לדף הבית</Link>
  );
}

export default BackLink;