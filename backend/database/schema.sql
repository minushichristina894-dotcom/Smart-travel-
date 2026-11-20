-- Smart Travel Planning and Booking System
-- University Final Year Project - Interim Submission Schema
CREATE DATABASE IF NOT EXISTS smart_travel_planner;
USE smart_travel_planner;

-- Customer accounts
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  profile_picture VARCHAR(500) DEFAULT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at DATETIME DEFAULT NULL,
  verification_token VARCHAR(255) DEFAULT NULL,
  verification_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hashed, single-use email verification tokens (never store the raw token)
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

-- Staff accounts
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  department VARCHAR(100) DEFAULT 'Operations',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin accounts
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sri Lankan destinations
CREATE TABLE IF NOT EXISTS destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  country VARCHAR(100) DEFAULT 'Sri Lanka',
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  gallery JSON DEFAULT NULL,
  price DECIMAL(10, 2) NOT NULL,
  latitude DECIMAL(10, 7) DEFAULT NULL,
  longitude DECIMAL(10, 7) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activities linked to destinations
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration_hours INT DEFAULT 2,
  image_url VARCHAR(500),
  age_category VARCHAR(50) DEFAULT 'All Ages',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Trip bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  destination_id INT NOT NULL,
  activity_id INT DEFAULT NULL,
  travelers INT NOT NULL DEFAULT 1,
  travel_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  risk_level ENUM('safe', 'moderate', 'high') DEFAULT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  payment_method VARCHAR(50) DEFAULT NULL,
  transaction_id VARCHAR(100) DEFAULT NULL,
  paid_at DATETIME DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

-- Weather analysis logs (Python module results)
CREATE TABLE IF NOT EXISTS weather_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  destination_id INT NOT NULL,
  activity_id INT DEFAULT NULL,
  travel_date DATE NOT NULL,
  temperature DECIMAL(5, 2),
  rain_mm DECIMAL(5, 2),
  wind_speed_kmh DECIMAL(5, 2),
  humidity INT,
  risk_level ENUM('safe', 'moderate', 'high') NOT NULL,
  recommendation TEXT,
  python_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

-- System settings (Admin)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
