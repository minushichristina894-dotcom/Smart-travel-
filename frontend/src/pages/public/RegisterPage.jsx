/**
 * RegisterPage.jsx — SMALL REACT CONNECTOR ONLY
 *
 * HTML structure  →  src/html/register.html
 * CSS styles      →  src/css/auth.css
 * JavaScript      →  src/js/registerPage.js
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateRegisterForm, hasErrors } from '../../js/registerPage';
import PasswordToggle from '../../components/ui/PasswordToggle';
import '../../css/auth.css';

const REGISTER_HERO = '/register-hero.jpg';

const RegisterPage = () => {
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', confirmPassword: '', phone: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      showToast('Please fix the form errors and try again.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await register(form);
      showToast('Check your email for a 6-digit verification code.', 'success');
      navigate('/verify-email', { state: { email: data.email || form.email } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-section auth-page">
      <aside className="auth-hero">
        <img src={REGISTER_HERO} alt="Lush green forest and lake" className="auth-hero__img" />
        <div className="auth-hero__overlay--register" />

        <header className="auth-hero__top auth-hero__top--register">
          <a href="/" className="auth-logo-link">
            <img src="/logo.png" alt="Smart Travel Sri Lanka" className="auth-logo auth-logo--hero" />
          </a>
        </header>

        <div className="auth-hero__bottom auth-hero__bottom--register">
          <div className="auth-hero__text">
            <h2 className="auth-hero__title auth-hero__title--lg">Join Smart Travel Sri Lanka</h2>
            <p className="auth-hero__desc auth-hero__desc--lg">
              For locals and visitors. Book trips, check weather, and explore the island with confidence.
            </p>
          </div>
        </div>
      </aside>

      <main className="auth-form-panel auth-form-panel--register">
        <div className="auth-form-wrap auth-form-wrap--wide">
          <div className="auth-mobile-logo">
            <Link to="/">
              <img src="/logo.png" alt="Smart Travel Sri Lanka" className="auth-logo auth-logo--soft" />
            </Link>
          </div>

          <header className="auth-header auth-header--register">
            <h1 className="auth-header__title">Create Account</h1>
            <p className="auth-header__sub">Fill in your details to register as a customer</p>
          </header>

          <div className="register-form-card auth-card">
            {error && <div className="auth-alert auth-alert--error" role="alert">{error}</div>}

            <div className="auth-info-box">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>
                After registering, a <strong>6-digit verification code</strong> is sent to your email.
                You must enter it before you can login and book trips.
              </p>
            </div>

            <form className="register-form-section auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="full_name">
                  Full Name<span className="auth-required">*</span>
                </label>
                <input id="full_name" className="register-form-field auth-input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nimal Perera" />
                {errors.full_name && <p className="auth-field-error">{errors.full_name}</p>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="username">
                  Username<span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input id="username" className="register-form-field register-form-field--icon auth-input auth-input--icon" name="username" value={form.username} onChange={handleChange} placeholder="nimal" />
                </div>
                {errors.username && <p className="auth-field-error">{errors.username}</p>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">
                  Email<span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input id="email" className="register-form-field register-form-field--icon auth-input auth-input--icon" type="email" name="email" value={form.email} onChange={handleChange} placeholder="nimal@example.lk" />
                </div>
                {errors.email && <p className="auth-field-error">{errors.email}</p>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="phone">
                  Phone Number<span className="auth-required">*</span>
                </label>
                <input id="phone" className="register-form-field auth-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+94771234567" />
                {errors.phone && <p className="auth-field-error">{errors.phone}</p>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password">
                  Password<span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input id="password" className="register-form-field register-form-field--icon auth-input auth-input--icon auth-input--password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
                  <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                </div>
                {errors.password && <p className="auth-field-error">{errors.password}</p>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="confirmPassword">
                  Confirm Password<span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input id="confirmPassword" className="register-form-field register-form-field--icon auth-input auth-input--icon auth-input--password" type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
                  <PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} labelShow="Show confirm password" labelHide="Hide confirm password" />
                </div>
                {errors.confirmPassword && <p className="auth-field-error">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className="register-btn auth-btn auth-btn--primary auth-btn--mt" disabled={loading}>
                {loading ? <span className="auth-spinner" aria-label="Loading" /> : 'Register'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
