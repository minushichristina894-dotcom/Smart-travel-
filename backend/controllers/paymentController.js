const pool = require('../config/database');
const { sendPaymentConfirmationEmail, sendTripReportEmail } = require('../utils/emailService');

/** POST /api/bookings/:id/pay — simulated LKR payment (university demo) */
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_name, card_number, expiry, cvv, method } = req.body;

    if (!card_name || !card_number || !expiry || !cvv) {
      return res.status(400).json({ success: false, message: 'All payment fields are required.' });
    }
    if (!/^\d{16}$/.test(card_number.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Card number must be 16 digits.' });
    }

    const [bookings] = await pool.query(
      `SELECT b.*, d.name AS destination_name, u.email, u.full_name
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );
    if (!bookings.length) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const booking = bookings[0];
    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (booking.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid.' });
    }

    const transactionId = `STP-${Date.now()}-${id}`;
    await pool.query(
      `UPDATE bookings SET payment_status = 'paid', payment_method = ?, transaction_id = ?, paid_at = NOW() WHERE id = ?`,
      [method || 'card', transactionId, id]
    );

    await sendPaymentConfirmationEmail(
      { full_name: booking.full_name, email: booking.email },
      { ...booking, transaction_id: transactionId }
    );

    res.json({
      success: true,
      message: 'Payment successful!',
      transaction_id: transactionId,
      payment_status: 'paid',
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
};

/** GET /api/bookings/:id/report — full trip report */
exports.getTripReport = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, d.name AS destination_name, d.country, d.description AS destination_description,
              a.name AS activity_name, u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN activities a ON b.activity_id = a.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const report = rows[0];
    if (req.user.role === 'customer' && report.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const [weatherLogs] = await pool.query(
      `SELECT * FROM weather_logs WHERE destination_id = ? AND user_id = ? AND travel_date = ?
       ORDER BY created_at DESC LIMIT 1`,
      [report.destination_id, report.user_id, report.travel_date]
    );

    res.json({
      success: true,
      report: {
        ...report,
        travel_date: report.travel_date,
        weather: weatherLogs[0] || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load trip report.' });
  }
};

/** POST /api/bookings/:id/send-report — email trip report to customer */
exports.emailTripReport = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, d.name AS destination_name, a.name AS activity_name, u.full_name, u.email
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN activities a ON b.activity_id = a.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const report = rows[0];
    await sendTripReportEmail(
      { full_name: report.full_name, email: report.email },
      {
        ...report,
        travel_date: new Date(report.travel_date).toLocaleDateString('en-LK'),
      }
    );

    res.json({ success: true, message: 'Trip report sent to customer email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send report.' });
  }
};

module.exports = exports;
