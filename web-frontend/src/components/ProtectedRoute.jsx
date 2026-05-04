import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/auth';

const ProtectedRoute = ({ allowedRoles }) => {
  const isAuth = authService.isAuthenticated();
  const userRoles = authService.getRoles().map(r => String(r).toUpperCase());

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const hasRole = allowedRoles.some(r => userRoles.includes(r.toUpperCase()));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
