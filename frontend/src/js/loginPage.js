/**
 * Login page — JavaScript (validation + submit logic)
 * HTML structure: src/html/login.html
 * CSS: src/css/auth.css
 */

export function validateLogin(username, password) {
  if (!username?.trim() || !password) {
    return 'Username and password are required.';
  }
  return '';
}

export function getLoginRedirectPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'staff') return '/staff';
  return '/dashboard';
}

/** Login submit — called from LoginPage.jsx (small React connector) */
export async function processLogin({
  username,
  password,
  login,
  navigate,
  showToast,
  setError,
  setLoading,
  setUnverifiedEmail,
}) {
  setError('');
  if (setUnverifiedEmail) setUnverifiedEmail('');
  const validationError = validateLogin(username, password);
  if (validationError) {
    showToast(validationError, 'warning');
    setError(validationError);
    return { ok: false };
  }

  setLoading(true);
  try {
    const data = await login(username.trim(), password);
    const name = data.user.full_name || data.user.username;
    showToast(`Welcome back, ${name}! Login successful.`, 'success');
    navigate(getLoginRedirectPath(data.user.role));
    return { ok: true, data };
  } catch (err) {
    const data = err.response?.data;
    const msg = data?.message || 'Login failed.';
    setError(msg);
    showToast(msg, 'error');
    if (data?.requiresVerification) {
      if (setUnverifiedEmail) setUnverifiedEmail(data.email || '');
      return { ok: false, requiresVerification: true, email: data.email };
    }
    return { ok: false };
  } finally {
    setLoading(false);
  }
}
