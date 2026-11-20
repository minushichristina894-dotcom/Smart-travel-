const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireVerifiedCustomer = async (req, res, next) => {
  if (req.user?.role !== 'customer') return next();
  try {
    const [[user]] = await pool.query('SELECT email_verified FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found.' });
    }
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before accessing this feature.',
        requiresVerification: true,
      });
    }
    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied for your role.' });
  }
  next();
};

const requireAdmin = requireRole('admin');
const requireStaff = requireRole('staff', 'admin');
const requireCustomer = requireRole('customer', 'staff', 'admin');

module.exports = { authenticate, requireRole, requireAdmin, requireStaff, requireCustomer, requireVerifiedCustomer };
