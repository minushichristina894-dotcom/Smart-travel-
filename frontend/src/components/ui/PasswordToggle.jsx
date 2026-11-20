const EyeOpen = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a3 3 0 014.243 4.243M3 3l18 18" />
  </svg>
);

const PasswordToggle = ({ visible, onToggle, labelShow = 'Show password', labelHide = 'Hide password' }) => (
  <button
    type="button"
    className="auth-password-toggle"
    onClick={onToggle}
    aria-label={visible ? labelHide : labelShow}
    title={visible ? labelHide : labelShow}
  >
    {visible ? <EyeOff /> : <EyeOpen />}
  </button>
);

export default PasswordToggle;
