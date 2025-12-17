-- WARNING: This script DROPS tables. BACKUP your database before running.
-- geotechiex_schema.sql - created 2025-12-17

-- Use the correct database (replace with your DB name if different)
-- Example: USE `u642865195_dev`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS admin_config;
DROP TABLE IF EXISTS activation_codes;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS user_devices;
DROP TABLE IF EXISTS geotechiex_users;
DROP TABLE IF EXISTS usage_log;
DROP TABLE IF EXISTS sync_data;

SET FOREIGN_KEY_CHECKS = 1;

-- Recreate schema with safe constraints and indexes
CREATE TABLE admin_config (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(191) NOT NULL,
  config_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_sessions_token (token),
  INDEX idx_admin_sessions_admin_id (admin_id),
  CONSTRAINT fk_admin_sessions_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE geotechiex_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_free_uses INT UNSIGNED NOT NULL DEFAULT 0,
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_geotechiex_users_email (email),
  INDEX idx_geotechiex_users_registered_at (registered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_devices (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_devices_user_device (user_id, device_id),
  INDEX idx_user_devices_user_id (user_id),
  CONSTRAINT fk_user_devices_user FOREIGN KEY (user_id) REFERENCES geotechiex_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  customer_name VARCHAR(255),
  phone VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  credits INT UNSIGNED NOT NULL DEFAULT 0,
  package_name VARCHAR(255),
  status ENUM('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  paystack_reference VARCHAR(191),
  paystack_status VARCHAR(50),
  verified_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_email (email),
  UNIQUE KEY uq_payments_reference (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activation_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  activation_code VARCHAR(191) NOT NULL,
  payment_id BIGINT UNSIGNED NULL,
  credits INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','used','expired') NOT NULL DEFAULT 'active',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated_at DATETIME NULL,
  activated_by_email VARCHAR(191) NULL,
  activated_by_device VARCHAR(255) NULL,
  times_used INT UNSIGNED NOT NULL DEFAULT 0,
  max_uses INT UNSIGNED NOT NULL DEFAULT 1,
  expires_at DATETIME NULL,
  UNIQUE KEY uq_activation_codes_code (activation_code),
  INDEX idx_activation_codes_payment_id (payment_id),
  CONSTRAINT fk_activation_codes_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usage_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  device_id VARCHAR(255) NULL,
  tool_name VARCHAR(191) NULL,
  action VARCHAR(191) NOT NULL DEFAULT 'tool_use',
  credits_used INT UNSIGNED NOT NULL DEFAULT 0,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usage_log_email (email),
  INDEX idx_usage_log_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sync_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  data_content LONGTEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sync_email_device (email, device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
