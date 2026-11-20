/**
 * Apply email-verification columns/table without dropping existing data.
 * Usage: node scripts/migrateEmailVerification.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].c > 0;
}

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].c > 0;
}

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_travel_planner',
    multipleStatements: true,
  });

  try {
    if (!(await columnExists(conn, 'users', 'email_verified'))) {
      await conn.query('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE');
      console.log('Added users.email_verified');
    }

    if (!(await columnExists(conn, 'users', 'email_verified_at'))) {
      await conn.query('ALTER TABLE users ADD COLUMN email_verified_at DATETIME DEFAULT NULL');
      console.log('Added users.email_verified_at');
    }

    if (!(await tableExists(conn, 'email_verification_tokens'))) {
      await conn.query(`
        CREATE TABLE email_verification_tokens (
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
        )
      `);
      console.log('Created email_verification_tokens');
    }

    if (await tableExists(conn, 'email_verification_tokens')
      && !(await columnExists(conn, 'email_verification_tokens', 'attempt_count'))) {
      await conn.query(
        'ALTER TABLE email_verification_tokens ADD COLUMN attempt_count INT NOT NULL DEFAULT 0'
      );
      console.log('Added email_verification_tokens.attempt_count');
    }

    await conn.query(
      `UPDATE users
       SET email_verified_at = COALESCE(email_verified_at, created_at)
       WHERE email_verified = TRUE AND email_verified_at IS NULL`
    );

    console.log('Email verification migration complete. Existing user rows were not deleted.');
  } finally {
    await conn.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.code || '', err.message || err);
  console.error('Start MySQL, then run: npm run migrate:email');
  process.exit(1);
});
