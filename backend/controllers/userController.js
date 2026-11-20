const bcrypt = require('bcryptjs');
const pool = require('../config/database');

exports.getProfile = async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ success: false, message: 'Customer profile only.' });
  }
  const [rows] = await pool.query(
    'SELECT id, full_name, username, email, phone, profile_picture, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json({ success: true, user: rows[0] });
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const updates = [];
    const values = [];

    if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (password) {
      updates.push('password = ?');
      values.push(await bcrypt.hash(password, 12));
    }
    if (req.file) {
      updates.push('profile_picture = ?');
      values.push(`/uploads/profiles/${req.file.filename}`);
    }
    if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update.' });

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query(
      'SELECT id, full_name, username, email, phone, profile_picture FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
