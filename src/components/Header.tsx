import { Link, useNavigate } from 'react-router';
import {useAuth} from "../context/AuthContext"

function Header(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    function handleLogout () {
    logout();
    navigate('/');
  }
  return (
    <header className="site-header">
      <Link to="/" className="site-logo">אלבומים משותפים</Link>

      <nav className="site-nav">
        {user && <span className="site-greeting">שלום, {user.name}</span>}
        {user && <Link to="/albums" className="btn btn-secondary">לאלבומים שלי</Link>}
        <Link to="/albums/new" className="btn btn-primary">פתיחת אלבום חדש</Link>
        {user ? (
          <button onClick={handleLogout} className="btn btn-ghost">התנתקות</button>
        ) : (
          <Link to="/login" className="btn btn-ghost">התחברות</Link>
        )}
      </nav>
    </header>
  );
}

export default Header