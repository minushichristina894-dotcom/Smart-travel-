/**
 * ============================================================
 * BACKEND SERVER — Smart Travel Planner API
 * Language: JavaScript (Node.js + Express)
 * Database: MySQL
 * Port: 5000
 * ============================================================
 *
 * FOLDER GUIDE:
 *   routes/       → API URLs (what frontend calls)
 *   controllers/  → business logic (register, book, weather...)
 *   config/       → database connection
 *   utils/        → email, weather helpers
 *   database/     → MySQL schema + migrations
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { verifyBrevoConnection, isBrevoConfigured } = require('./utils/emailService');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const email = isBrevoConfigured()
    ? { mode: 'brevo-api', provider: 'brevo' }
    : { mode: 'unconfigured', hint: 'Add BREVO_API_KEY and BREVO_SENDER_EMAIL to backend/.env — see EMAIL_SETUP.md' };
  res.json({ success: true, message: 'Smart Travel Planner API is running.', email });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

app.listen(PORT, async () => {
  console.log(`🌍 Smart Travel Planner API running on port ${PORT}`);
  const emailStatus = await verifyBrevoConnection();
  if (emailStatus.ok) {
    console.log(`📧 Real emails enabled — ${emailStatus.message}`);
  } else if (emailStatus.mode === 'api-error') {
    console.log(`⚠️  Brevo API error: ${emailStatus.message}`);
    console.log('   Fix backend/.env — see EMAIL_SETUP.md (keep the API key on the backend only)');
  } else {
    console.log('📋 Email delivery is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.');
    console.log('   Guide: EMAIL_SETUP.md');
  }
});

module.exports = app;
