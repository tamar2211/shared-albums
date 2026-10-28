import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

function Protected() {
  const {user, isLoading} = useAuth();
  const location = useLocation();
  if (isLoading) return <p className="page-status">טוען...</p>;
  if (!user) return <Navigate state={ {from:location.pathname}} to="/login" replace />;
  return <Outlet />;
}

export default Protected;