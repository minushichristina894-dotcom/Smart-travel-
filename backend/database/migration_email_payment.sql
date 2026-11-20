-- Run this if database already exists (adds email + payment columns)
USE smart_travel_planner;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verification_token_expires DATETIME DEFAULT NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paid_at DATETIME DEFAULT NULL;

-- Mark seed users as verified
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;
