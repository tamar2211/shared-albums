import { Link, useNavigate } from 'react-router';
import {useAuth} from "../context/AuthContext"
import { useQueryClient } from '@tanstack/react-query';

function Header(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    function handleLogout () {
    logout();
    queryClient.clear(); // מוחק מהזיכרון את הנתונים של המשתמש הקודם, כדי שמשתמש הבא לא יראה אותם
    navigate('/');
  }
  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label="pixx, לדף הבית">pixx</Link>

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