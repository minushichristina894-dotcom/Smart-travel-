import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable Button — pass a semantic btnClass for viva-friendly CSS names
 * Example: btnClass="confirm-booking-btn"
 */
const Button = ({
  children,
  type = 'button',
  btnClass = 'book-trip-btn',
  loading = false,
  disabled = false,
  className = '',
  onClick,
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={`${btnClass} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {loading ? <LoadingSpinner size="sm" /> : children}
  </button>
);

export default Button;
