/**
 * Register success page — JavaScript (resend verification)
 * HTML structure: src/html/register-success-page.html
 * CSS: src/css/auth.css + src/index.css
 */

import { authAPI } from '../services/api';

export const RESEND_COOLDOWN_SECONDS = 60;

export function validateResendEmail(email) {
  if (!email?.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Valid email required.';
  return '';
}

export async function resendVerificationEmail(email) {
  return authAPI.resendVerification(email.trim());
}

/** Resend submit — called from RegisterSuccessPage.jsx / LoginPage.jsx */
export async function processResendVerification({
  email,
  setLoading,
  setSent,
  setMessage,
  showToast,
  cooldownUntil,
}) {
  if (cooldownUntil && Date.now() < cooldownUntil) {
    const msg = 'Please wait before requesting another verification email.';
    showToast(msg, 'warning');
    if (setMessage) setMessage(msg);
    return { ok: false, cooldown: true };
  }

  const validationError = validateResendEmail(email);
  if (validationError) {
    showToast(validationError, 'warning');
    if (setMessage) setMessage(validationError);
    return { ok: false };
  }

  setLoading(true);
  try {
    const { data } = await resendVerificationEmail(email);
    const msg = data?.message || 'Verification email sent successfully. Please check your inbox.';
    if (setSent) setSent(true);
    if (setMessage) setMessage(msg);
    showToast(msg, 'success');
    return { ok: true, message: msg, cooldownMs: RESEND_COOLDOWN_SECONDS * 1000 };
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to resend.';
    if (setMessage) setMessage(msg);
    showToast(msg, 'error');
    return { ok: false, message: msg, status: err.response?.status };
  } finally {
    setLoading(false);
  }
}
