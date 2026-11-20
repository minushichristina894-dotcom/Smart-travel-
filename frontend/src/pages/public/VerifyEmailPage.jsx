import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { processOtpVerification } from '../../js/verifyEmailPage';
import { processResendVerification, RESEND_COOLDOWN_SECONDS } from '../../js/registerSuccessPage';
import { useToast } from '../../context/ToastContext';
import '../../css/auth.css';

const VerifyEmailPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(location.state?.email || searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const { showToast } = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    await processOtpVerification({
      email,
      code,
      setStatus,
      setMessage,
      setLoading,
      showToast,
    });
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const result = await processResendVerification({
      email,
      setLoading: setResendLoading,
      setSent: () => {},
      setMessage: setResendMessage,
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
      <div className="verify-email-card auth-card auth-narrow-card">
        <Link to="/" className="inline-block mb-6">
          <img src="/logo.png" alt="Smart Travel Sri Lanka" className="auth-logo auth-logo--soft" />
        </Link>
        <h1 className="auth-header__title">Email Verification</h1>
        <p className="auth-header__sub">Enter the 6-digit code sent to your inbox. It expires in 10 minutes.</p>

        {message && (
          <div className={`auth-alert ${status === 'success' ? 'auth-alert--success' : 'auth-alert--error'}`} role="status">
            {message}
          </div>
        )}

        {status === 'success' ? (
          <Link to="/login" className="go-to-login-btn auth-btn auth-btn--primary" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Go to Login
          </Link>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleVerify} style={{ marginTop: '1.25rem' }}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="verifyEmail">Email</label>
                <input
                  id="verifyEmail"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.lk"
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="verifyCode">6-digit code</label>
                <input
                  id="verifyCode"
                  className="auth-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
              <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
                {loading ? <span className="auth-spinner" aria-label="Loading" /> : 'Verify email'}
              </button>
            </form>

            <form onSubmit={handleResend} className="auth-form" style={{ marginTop: '1.25rem' }}>
              {resendMessage && <p className="auth-header__sub">{resendMessage}</p>}
              <button type="submit" className="auth-btn auth-btn--outline resend-verification-btn" disabled={resendLoading || coolingDown}>
                {resendLoading ? 'Sending…' : coolingDown ? 'Please wait…' : 'Resend verification code'}
              </button>
            </form>

            <Link to="/login" className="auth-link" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
