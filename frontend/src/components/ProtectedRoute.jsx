import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'customer' && user?.email_verified === false) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />;
  }
  if (roles.length && !roles.includes(user?.role)) {
    const redirect = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return children;
};

export default ProtectedRoute;
