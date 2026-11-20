-- Stage 4: hashed email verification tokens (safe to re-run via scripts/migrateEmailVerification.js)
USE smart_travel_planner;

-- email_verified already exists on users from the original schema.
-- Add verified-at timestamp if missing (applied by the Node migration helper on older MySQL).

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email_verification_token_hash (token_hash),
  INDEX idx_email_verification_user (user_id),
  INDEX idx_email_verification_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
