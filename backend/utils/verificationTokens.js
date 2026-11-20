const crypto = require('crypto');

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_RESENDS_PER_HOUR = 8;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashOtp(rawCode, userId) {
  const secret = process.env.JWT_SECRET || 'smart-travel-otp';
  return crypto.createHash('sha256').update(`${userId}:${String(rawCode).trim()}:${secret}`, 'utf8').digest('hex');
}

function isOtpFormat(rawCode) {
  return /^\d{6}$/.test(String(rawCode || '').trim());
}

function otpHashesMatch(storedHash, candidateHash) {
  const a = Buffer.from(String(storedHash), 'hex');
  const b = Buffer.from(String(candidateHash), 'hex');
  if (a.length !== 32 || b.length !== 32) return false;
  return crypto.timingSafeEqual(a, b);
}

function tokenExpiryDate(fromMs = Date.now()) {
  return new Date(fromMs + TOKEN_TTL_MS);
}

module.exports = {
  TOKEN_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_RESENDS_PER_HOUR,
  MAX_OTP_ATTEMPTS,
  generateOtp,
  hashOtp,
  isOtpFormat,
  otpHashesMatch,
  tokenExpiryDate,
};
