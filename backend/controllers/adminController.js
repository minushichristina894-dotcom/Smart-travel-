const bcrypt = require('bcryptjs');
const pool = require('../config/database');

/** Admin: list all customers */
exports.getCustomers = async (req, res) => {
  const [users] = await pool.query(
    'SELECT id, full_name, username, email, phone, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({ success: true, users });
};

/** Staff: view customers (read-only) with booking counts */
exports.getCustomersForStaff = async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.id, u.full_name, u.username, u.email, u.phone, u.created_at,
            COUNT(b.id) AS booking_count
     FROM users u
     LEFT JOIN bookings b ON b.user_id = u.id
     GROUP BY u.id
     ORDER BY u.full_name`
  );
  res.json({ success: true, users });
};

/** Admin: manage staff */
exports.getStaff = async (req, res) => {
  const [staff] = await pool.query(
    'SELECT id, full_name, username, email, phone, department, is_active, created_at FROM staff ORDER BY created_at DESC'
  );
  res.json({ success: true, staff });
};

exports.createStaff = async (req, res) => {
  const { full_name, username, email, password, phone, department } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  const [result] = await pool.query(
    'INSERT INTO staff (full_name, username, email, password, phone, department) VALUES (?,?,?,?,?,?)',
    [full_name, username, email, hashed, phone, department || 'Operations']
  );
  res.status(201).json({ success: true, id: result.insertId });
};

exports.updateStaff = async (req, res) => {
  const { full_name, email, phone, department, is_active } = req.body;
  await pool.query(
    'UPDATE staff SET full_name=?, email=?, phone=?, department=?, is_active=? WHERE id=?',
    [full_name, email, phone, department, is_active, req.params.id]
  );
  res.json({ success: true });
};

/** Admin: delete customer only (NOT staff/admin per spec) */
exports.deleteCustomer = async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Customer deleted.' });
};

/** Admin dashboard stats */
exports.getAdminStats = async (req, res) => {
  const [[users]] = await pool.query('SELECT COUNT(*) AS c FROM users');
  const [[staff]] = await pool.query('SELECT COUNT(*) AS c FROM staff');
  const [[destinations]] = await pool.query('SELECT COUNT(*) AS c FROM destinations');
  const [[activities]] = await pool.query('SELECT COUNT(*) AS c FROM activities');
  const [[bookings]] = await pool.query('SELECT COUNT(*) AS c FROM bookings');
  const [recent] = await pool.query(
    `SELECT b.*, u.full_name AS user_name, d.name AS destination_name
     FROM bookings b JOIN users u ON b.user_id=u.id JOIN destinations d ON b.destination_id=d.id
     ORDER BY b.created_at DESC LIMIT 5`
  );
  res.json({
    success: true,
    stats: {
      totalUsers: users.c,
      totalStaff: staff.c,
      totalDestinations: destinations.c,
      totalActivities: activities.c,
      totalBookings: bookings.c,
      recentBookings: recent,
    },
  });
};

/** Staff dashboard stats */
exports.getStaffStats = async (req, res) => {
  const [[today]] = await pool.query(
    "SELECT COUNT(*) AS c FROM bookings WHERE travel_date = CURDATE() AND status != 'cancelled'"
  );
  const [[pending]] = await pool.query("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending'");
  const [[completed]] = await pool.query("SELECT COUNT(*) AS c FROM bookings WHERE status = 'completed'");
  const [[alerts]] = await pool.query(
    "SELECT COUNT(*) AS c FROM weather_logs WHERE risk_level IN ('moderate','high')"
  );
  const [pendingBookings] = await pool.query(
    `SELECT b.id, b.travel_date, b.status, b.risk_level, b.total_price, b.travelers,
            u.full_name AS user_name, u.phone AS user_phone,
            d.name AS destination_name, a.name AS activity_name
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN destinations d ON b.destination_id = d.id
     LEFT JOIN activities a ON b.activity_id = a.id
     WHERE b.status = 'pending'
     ORDER BY b.created_at DESC LIMIT 8`
  );
  res.json({
    success: true,
    stats: {
      todaysBookings: today.c,
      pendingBookings: pending.c,
      completedBookings: completed.c,
      weatherAlerts: alerts.c,
      customerRequests: pending.c,
      pendingList: pendingBookings,
    },
  });
};

/** Admin: system settings */
exports.getSettings = async (req, res) => {
  const [settings] = await pool.query('SELECT * FROM system_settings');
  res.json({ success: true, settings });
};

exports.updateSetting = async (req, res) => {
  const { setting_key, setting_value } = req.body;
  await pool.query(
    'INSERT INTO system_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
    [setting_key, setting_value]
  );
  res.json({ success: true });
};
