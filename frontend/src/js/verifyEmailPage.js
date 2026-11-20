/**
 * Verify email page — JavaScript (6-digit OTP)
 * HTML structure: src/html/verify-email-page.html
 * CSS: src/css/auth.css + src/index.css
 */

import { authAPI } from '../services/api';

export function validateOtpForm(email, code) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) {
    return 'Enter the email address you registered with.';
  }
  if (!/^\d{6}$/.test(String(code || '').trim())) {
    return 'Enter the 6-digit verification code from your email.';
  }
  return '';
}

export async function verifyEmailOtp(email, code) {
  const { data } = await authAPI.verifyEmail({ email: email.trim(), code: String(code).trim() });
  return data;
}

export async function processOtpVerification({
  email,
  code,
  setStatus,
  setMessage,
  setLoading,
  showToast,
}) {
  const validationError = validateOtpForm(email, code);
  if (validationError) {
    setStatus('error');
    setMessage(validationError);
    if (showToast) showToast(validationError, 'warning');
    return { ok: false };
  }

  if (setLoading) setLoading(true);
  setStatus('loading');
  try {
    const data = await verifyEmailOtp(email, code);
    setStatus('success');
    setMessage(data.message);
    if (showToast) showToast(data.message, 'success');
    return { ok: true };
  } catch (err) {
    const msg = err.response?.data?.message || 'Verification failed.';
    setStatus('error');
    setMessage(msg);
    if (showToast) showToast(msg, 'error');
    return { ok: false };
  } finally {
    if (setLoading) setLoading(false);
  }
}
