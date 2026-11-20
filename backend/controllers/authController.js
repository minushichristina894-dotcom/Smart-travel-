const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendVerificationEmail, isBrevoConfigured } = require('../utils/emailService');
const { allowRequest } = require('../utils/rateLimit');
const {
  generateOtp,
  hashOtp,
  isOtpFormat,
  otpHashesMatch,
  tokenExpiryDate,
  RESEND_COOLDOWN_MS,
  MAX_RESENDS_PER_HOUR,
  MAX_OTP_ATTEMPTS,
} = require('../utils/verificationTokens');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_RESEND_MESSAGE = 'If that email is registered and unverified, a verification code was sent.';

const generateToken = (account) =>
  jwt.sign(
    { id: account.id, username: account.username, email: account.email, role: account.role, name: account.full_name || account.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return EMAIL_RE.test(email) && email.length <= 150;
}

async function findAccountByUsername(username) {
  const [[user]] = await pool.query(
    'SELECT id, full_name, username, email, password, phone, email_verified, "customer" AS role FROM users WHERE username = ?',
    [username]
  );
  if (user) return user;

  const [[staff]] = await pool.query(
    'SELECT id, full_name, username, email, password, phone, "staff" AS role, is_active FROM staff WHERE username = ?',
    [username]
  );
  if (staff) {
    if (!staff.is_active) return { inactive: true };
    return staff;
  }

  const [[admin]] = await pool.query(
    'SELECT id, full_name, username, email, password, "admin" AS role FROM admins WHERE username = ?',
    [username]
  );
  if (admin) return admin;

  return null;
}

async function insertHashedOtp(conn, userId) {
  const otp = generateOtp();
  const tokenHash = hashOtp(otp, userId);
  const expiresAt = tokenExpiryDate();
  try {
    await conn.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, attempt_count)
       VALUES (?, ?, ?, 0)`,
      [userId, tokenHash, expiresAt]
    );
  } catch (err) {
    if (err.code !== 'ER_BAD_FIELD_ERROR') throw err;
    await conn.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );
  }
  return otp;
}

async function invalidateUnusedTokens(conn, userId) {
  await conn.query(
    'UPDATE email_verification_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
    [userId]
  );
}

exports.register = async (req, res) => {
  let createdUserId = null;
  try {
    const { full_name, username, email, password, confirmPassword, phone } = req.body;

    if (!full_name || !username || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      return res.status(400).json({ success: false, message: 'Username must be 3-50 characters.' });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!isBrevoConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Email delivery is not configured. Registration cannot be completed until the Brevo API key is set.',
      });
    }

    const checks = await Promise.all([
      pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [trimmedUsername, normalizedEmail]),
      pool.query('SELECT id FROM staff WHERE username = ? OR email = ?', [trimmedUsername, normalizedEmail]),
      pool.query('SELECT id FROM admins WHERE username = ? OR email = ?', [trimmedUsername, normalizedEmail]),
    ]);
    if (checks.some(([rows]) => rows.length > 0)) {
      return res.status(409).json({ success: false, message: 'Username or email already in use.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO users (full_name, username, email, password, phone, email_verified)
         VALUES (?, ?, ?, ?, ?, FALSE)`,
        [full_name.trim(), trimmedUsername, normalizedEmail, hashed, phone]
      );
      createdUserId = result.insertId;
      const otp = await insertHashedOtp(conn, createdUserId);
      await conn.commit();

      const sent = await sendVerificationEmail(
        { full_name: full_name.trim(), email: normalizedEmail },
        otp
      );

      if (!sent.ok) {
        await pool.query('DELETE FROM users WHERE id = ?', [createdUserId]);
        createdUserId = null;
        return res.status(502).json({
          success: false,
          message: 'Could not send the verification email. Please try registering again.',
        });
      }
    } catch (inner) {
      try { await conn.rollback(); } catch { /* ignore */ }
      if (createdUserId) {
        try { await pool.query('DELETE FROM users WHERE id = ?', [createdUserId]); } catch { /* ignore */ }
        createdUserId = null;
      }
      throw inner;
    } finally {
      conn.release();
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Enter the 6-digit code sent to your email to verify your account.',
      email: normalizedEmail,
      requiresVerification: true,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Username or email already in use.' });
    }
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (!allowRequest(`verify:${ip}`, { windowMs: 15 * 60 * 1000, max: 30 })) {
      return res.status(429).json({ success: false, message: 'Too many verification attempts. Please try again later.' });
    }

    const email = normalizeEmail(req.body?.email);
    const code = String(req.body?.code || req.body?.token || req.query?.token || '').trim();

    if (!isValidEmail(email) || !isOtpFormat(code)) {
      return res.status(400).json({ success: false, message: 'Enter your email and the 6-digit verification code.' });
    }

    const [users] = await pool.query(
      'SELECT id, email_verified FROM users WHERE email = ?',
      [email]
    );
    if (!users.length) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }
    if (users[0].email_verified) {
      return res.json({ success: true, message: 'Your email address is already verified. You can now login.' });
    }

    const [rows] = await pool.query(
      `SELECT t.id, t.user_id, t.token_hash, t.expires_at, t.used_at, t.attempt_count
       FROM email_verification_tokens t
       WHERE t.user_id = ? AND t.used_at IS NULL
       ORDER BY t.created_at DESC
       LIMIT 1`,
      [users[0].id]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    const record = rows[0];
    if ((record.attempt_count || 0) >= MAX_OTP_ATTEMPTS) {
      await pool.query(
        'UPDATE email_verification_tokens SET used_at = COALESCE(used_at, NOW()) WHERE id = ?',
        [record.id]
      );
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      });
    }
    if (new Date(record.expires_at).getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'This verification code has expired. Please request a new one.' });
    }

    const candidateHash = hashOtp(code, record.user_id);
    if (!otpHashesMatch(record.token_hash, candidateHash)) {
      const nextAttempts = (record.attempt_count || 0) + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await pool.query(
          'UPDATE email_verification_tokens SET attempt_count = ?, used_at = NOW() WHERE id = ?',
          [nextAttempts, record.id]
        );
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Please request a new code.',
        });
      }
      await pool.query(
        'UPDATE email_verification_tokens SET attempt_count = ? WHERE id = ?',
        [nextAttempts, record.id]
      );
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [used] = await conn.query(
        'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL',
        [record.id]
      );
      if (!used.affectedRows) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'This verification code has already been used.' });
      }

      await conn.query(
        'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = ?',
        [record.user_id]
      );
      await conn.query(
        'UPDATE email_verification_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
        [record.user_id]
      );
      await conn.commit();
    } catch (inner) {
      await conn.rollback();
      throw inner;
    } finally {
      conn.release();
    }

    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('Verify email error:', error.message);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (!allowRequest(`resend-ip:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
      return res.status(429).json({ success: false, message: 'Please wait before requesting another verification email.' });
    }

    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!isBrevoConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Email delivery is not configured. Please try again later.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, email, email_verified FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows.length) {
      return res.json({ success: true, message: GENERIC_RESEND_MESSAGE });
    }

    const user = rows[0];
    if (user.email_verified) {
      return res.json({ success: true, message: 'Your email address is already verified.' });
    }

    const [[recent]] = await pool.query(
      `SELECT created_at
       FROM email_verification_tokens
       WHERE user_id = ? AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );
    if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification email.',
      });
    }

    const [[{ hourly }]] = await pool.query(
      `SELECT COUNT(*) AS hourly
       FROM email_verification_tokens
       WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [user.id]
    );
    if (hourly >= MAX_RESENDS_PER_HOUR) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification email.',
      });
    }

    const conn = await pool.getConnection();
    let otp;
    try {
      await conn.beginTransaction();
      await invalidateUnusedTokens(conn, user.id);
      otp = await insertHashedOtp(conn, user.id);
      await conn.commit();
    } catch (inner) {
      await conn.rollback();
      throw inner;
    } finally {
      conn.release();
    }

    const sent = await sendVerificationEmail(user, otp);
    if (!sent.ok) {
      return res.status(502).json({
        success: false,
        message: 'Could not send the verification email. Please try again later.',
      });
    }

    res.json({ success: true, message: 'Verification email sent successfully. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to resend email.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const trimmedUsername = username?.trim();
    if (!trimmedUsername || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const account = await findAccountByUsername(trimmedUsername);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    if (account.inactive) {
      return res.status(403).json({ success: false, message: 'Staff account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    if (account.role === 'customer' && !account.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        requiresVerification: true,
        email: account.email,
      });
    }

    const token = generateToken(account);
    const { password: _, ...safe } = account;

    res.json({ success: true, message: 'Login successful.', token, user: safe });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let table;
    if (role === 'admin') table = 'admins';
    else if (role === 'staff') table = 'staff';
    else table = 'users';

    const fields = role === 'customer'
      ? 'id, full_name, username, email, phone, profile_picture, email_verified, email_verified_at, created_at'
      : role === 'staff'
      ? 'id, full_name, username, email, phone, department, is_active, created_at'
      : 'id, full_name, username, email, created_at';

    const [rows] = await pool.query(`SELECT ${fields} FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Account not found.' });

    res.json({ success: true, user: { ...rows[0], role } });
  } catch (error) {
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      const { id, role } = req.user;
      const [rows] = await pool.query(
        'SELECT id, full_name, username, email, phone, profile_picture, email_verified, created_at FROM users WHERE id = ?',
        [id]
      );
      if (!rows.length) return res.status(404).json({ success: false, message: 'Account not found.' });
      return res.json({ success: true, user: { ...rows[0], role } });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
