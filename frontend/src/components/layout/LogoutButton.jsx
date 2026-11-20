import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../ui/ConfirmModal';

/**
 * Logout with confirmation popup → then redirect to login
 */
const LogoutButton = ({ className = '', children = 'Logout', variant = 'text' }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleConfirm = () => {
    setShowConfirm(false);
    logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  const buttonClass =
    variant === 'outline'
      ? `navbar-logout-btn ${className}`
      : `px-4 py-3 text-red-500 text-sm font-medium w-full text-left hover:bg-red-50 rounded-xl ${className}`;

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} className={buttonClass}>
        {children}
      </button>

      <ConfirmModal
        open={showConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        type="danger"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default LogoutButton;
