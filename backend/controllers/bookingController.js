const pool = require('../config/database');
const { sendTripReportEmail } = require('../utils/emailService');

exports.getBookings = async (req, res) => {
  try {
    let query = `
      SELECT b.*, d.name AS destination_name, d.country, d.image_url,
             a.name AS activity_name, u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings b
      JOIN destinations d ON b.destination_id = d.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN activities a ON b.activity_id = a.id`;
    const params = [];

    if (req.user.role === 'customer') {
      query += ' WHERE b.user_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY b.created_at DESC';
    const [bookings] = await pool.query(query, params);
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUpcomingBookings = async (req, res) => {
  const [bookings] = await pool.query(
    `SELECT b.*, d.name AS destination_name, d.country, d.image_url, a.name AS activity_name
     FROM bookings b JOIN destinations d ON b.destination_id = d.id
     LEFT JOIN activities a ON b.activity_id = a.id
     WHERE b.user_id = ? AND b.travel_date >= CURDATE() AND b.status != 'cancelled'
     ORDER BY b.travel_date ASC LIMIT 5`,
    [req.user.id]
  );
  res.json({ success: true, bookings });
};

exports.createBooking = async (req, res) => {
  try {
    const { destination_id, activity_id, travelers, travel_date, risk_level } = req.body;

    if (!destination_id || !travel_date) {
      return res.status(400).json({ success: false, message: 'Destination and travel date are required.' });
    }

    const [destinations] = await pool.query('SELECT price FROM destinations WHERE id = ?', [destination_id]);
    if (!destinations.length) return res.status(404).json({ success: false, message: 'Destination not found.' });

    let pricePerPerson = parseFloat(destinations[0].price);
    if (activity_id) {
      const [acts] = await pool.query('SELECT price FROM activities WHERE id = ?', [activity_id]);
      if (acts.length) pricePerPerson += parseFloat(acts[0].price);
    }

    const total_price = pricePerPerson * (parseInt(travelers) || 1);

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, destination_id, activity_id, travelers, travel_date, total_price, risk_level, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, destination_id, activity_id || null, travelers || 1, travel_date, total_price, risk_level || null]
    );

    res.status(201).json({ success: true, message: 'Booking submitted!', booking: { id: result.insertId, total_price } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

  const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  if (!bookings.length) return res.status(404).json({ success: false, message: 'Booking not found.' });

  if (req.user.role === 'customer' && bookings[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

  if (status === 'confirmed') {
    const [rows] = await pool.query(
      `SELECT b.*, d.name AS destination_name, a.name AS activity_name, u.full_name, u.email
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN activities a ON b.activity_id = a.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (rows.length) {
      const report = rows[0];
      await sendTripReportEmail(
        { full_name: report.full_name, email: report.email },
        {
          ...report,
          travel_date: new Date(report.travel_date).toLocaleDateString('en-LK'),
        }
      );
    }
  }

  res.json({ success: true, message: status === 'confirmed' ? 'Booking confirmed. Trip report emailed to customer.' : 'Booking status updated.' });
};

exports.cancelBooking = async (req, res) => {
  const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  if (!bookings.length) return res.status(404).json({ success: false, message: 'Booking not found.' });
  if (req.user.role === 'customer' && bookings[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: 'Booking cancelled.' });
};
