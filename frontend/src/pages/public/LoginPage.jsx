/**
 * LoginPage.jsx — SMALL REACT CONNECTOR ONLY
 *
 * HTML structure  →  src/html/login.html
 * CSS styles      →  src/css/auth.css
 * JavaScript      →  src/js/loginPage.js
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { processLogin } from '../../js/loginPage';
import { processResendVerification, RESEND_COOLDOWN_SECONDS } from '../../js/registerSuccessPage';
import PasswordToggle from '../../components/ui/PasswordToggle';
import '../../css/auth.css';

const LOGIN_HERO = '/login-hero.jpg';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    processLogin({
      username,
      password,
      login,
      navigate,
      showToast,
      setError,
      setLoading,
      setUnverifiedEmail,
    });
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const result = await processResendVerification({
      email: unverifiedEmail,
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
    <div className="login-page-section auth-page">
      <aside className="auth-hero">
        <img src={LOGIN_HERO} alt="Sri Lanka beach" className="auth-hero__img" />
        <div className="auth-hero__overlay--login" />
        <header className="auth-hero__top auth-hero__top--login">
          <a href="/" className="auth-logo-link">
            <img src="/logo.png" alt="Smart Travel Sri Lanka" className="auth-logo auth-logo--hero" />
          </a>
        </header>
        <div className="auth-hero__bottom">
          <div className="auth-hero__text">
            <h2 className="auth-hero__title">Travel Sri Lanka — Plan, Book &amp; Go</h2>
            <p className="auth-hero__desc">
              For locals and visitors. Discover places across the island, check weather before you travel, and book your trip in LKR.
            </p>
          </div>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Link to="/">
              <img src="/logo.png" alt="Smart Travel Sri Lanka" className="auth-logo auth-logo--soft" />
            </Link>
          </div>
          <header className="auth-header">
            <h1 className="auth-header__title">Welcome Back</h1>
            <p className="auth-header__sub">Sign in with your username and password</p>
          </header>
          <div className="login-form-card auth-card">
            {error && <div className="auth-alert auth-alert--error" role="alert">{error}</div>}
            <form className="login-form-section auth-form auth-form--login" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="username">
                  Username<span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input id="username" className="login-form-field login-form-field--icon auth-input auth-input--icon" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="password">
                  Password<span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input id="password" className="login-form-field login-form-field--icon auth-input auth-input--icon auth-input--password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
                  <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                </div>
              </div>
              <button type="submit" className="login-btn auth-btn auth-btn--primary" disabled={loading}>
                {loading ? <span className="auth-spinner" aria-label="Loading" /> : 'Login'}
              </button>
            </form>

            {unverifiedEmail && (
              <div className="auth-verify-box" role="status">
                <p>Your email is not verified yet. Enter the 6-digit code from your inbox, or request a new code.</p>
                {resendMessage && <p className="auth-verify-box__msg">{resendMessage}</p>}
                <Link to="/verify-email" state={{ email: unverifiedEmail }} className="auth-btn auth-btn--primary" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  Enter verification code
                </Link>
                <form onSubmit={handleResend} className="auth-form" style={{ marginTop: '0.75rem' }}>
                  <input
                    className="auth-input"
                    type="email"
                    value={unverifiedEmail}
                    onChange={(e) => setUnverifiedEmail(e.target.value)}
                    aria-label="Email for verification resend"
                  />
                  <button type="submit" className="auth-btn auth-btn--outline resend-verification-btn" disabled={resendLoading || coolingDown} style={{ marginTop: '0.75rem' }}>
                    {resendLoading ? 'Sending…' : coolingDown ? 'Please wait…' : 'Resend verification code'}
                  </button>
                </form>
              </div>
            )}

            <p className="auth-footer">
              New customer? <Link to="/register" className="auth-link">Create account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
