import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLogo from '../ui/AppLogo';
import LogoutButton from './LogoutButton';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <AppLogo size="xs" variant="soft" />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <Link to="/about" className="hover:text-primary-500">About</Link>
          <Link to="/destinations" className="hover:text-primary-500">Destinations</Link>
          <Link to="/activities" className="hover:text-primary-500">Activities</Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard'} className="text-sm font-medium text-primary-500">Dashboard</Link>
              <LogoutButton variant="outline" />
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login-btn">Login</Link>
              <Link to="/register" className="navbar-register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
