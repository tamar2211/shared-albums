import { Link, useNavigate } from 'react-router';
import {useAuth} from "../context/AuthContext"

function Header(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    function handleLogout () {
    logout();
    navigate('/');
  }
  return(
        <header>
      <Link to="/">אלבןמים שיתופייים או כל שם אחר</Link>
      {user ? (
        <>
          <span>שלום, {user.name}</span>
          <button onClick={handleLogout}>התנתקות</button>
        </>
      ) : (
        <Link to="/login">התחברות</Link>
      )}
    </header>

  )
}

export default Header