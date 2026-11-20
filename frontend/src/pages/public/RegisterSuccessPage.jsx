import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { processResendVerification, RESEND_COOLDOWN_SECONDS } from '../../js/registerSuccessPage';
import { useToast } from '../../context/ToastContext';
import '../../css/auth.css';

const RegisterSuccessPage = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resendEmail, setResendEmail] = useState(email);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const { showToast } = useToast();

  const handleResend = async (e) => {
    e.preventDefault();
    const result = await processResendVerification({
      email: resendEmail,
      setLoading,
      setSent,
      setMessage,
      showToast,
      cooldownUntil,
    });
    if (result.ok) {
      setCooldownUntil(Date.now() + (result.cooldownMs || RESEND_COOLDOWN_SECONDS * 1000));
    }
  };

  const coolingDown = Date.now() < cooldownUntil;

  return (
    <div className="auth-page auth-page--centered">
      <div className="register-success-card auth-card auth-narrow-card">
        <div className="auth-mobile-logo" style={{ marginBottom: '1rem' }}>
          <Link to="/">
            <img src="/logo.png" alt="Smart Travel Sri Lanka" className="auth-logo auth-logo--soft" />
          </Link>
        </div>

        <h1 className="auth-header__title" style={{ textAlign: 'center' }}>Check Your Email</h1>
        <p className="auth-header__sub" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          We sent a 6-digit verification code to <strong>{email || 'your email'}</strong>.
          Enter it on the verification page to activate your account.
        </p>

        {sent && message && <div className="auth-alert auth-alert--success" role="status">{message}</div>}
        {!sent && message && <div className="auth-alert auth-alert--error" role="alert">{message}</div>}

        <div className="auth-info-box">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>Check your <strong>inbox</strong> and <strong>Spam</strong> folder. The code expires in 10 minutes.</p>
        </div>

        <form onSubmit={handleResend} className="auth-form" style={{ marginTop: '1.25rem' }}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="resendEmail">Resend to email</label>
            <input
              id="resendEmail"
              className="auth-input"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.lk"
            />
          </div>
          <button type="submit" className="auth-btn auth-btn--outline resend-verification-btn" disabled={loading || coolingDown}>
            {loading ? <span className="auth-spinner" aria-label="Loading" /> : coolingDown ? 'Please wait…' : 'Resend verification code'}
          </button>
        </form>

        <Link to="/verify-email" state={{ email: resendEmail }} className="auth-btn auth-btn--primary" style={{ marginTop: '1rem', textAlign: 'center' }}>
          Enter verification code
        </Link>
        <Link to="/login" className="go-to-login-btn auth-link" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
