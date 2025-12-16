-- Complete Database Setup for GeoTechieX
-- Run this ONCE to create all necessary tables
-- Date: 2025-12-16

USE geotechiex_payments;

-- ============================================
-- 1. CREATE CORE PAYMENT TABLES
-- ============================================

-- Payments table (if not exists)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    phone VARCHAR(20),
    amount DECIMAL(10, 2) NOT NULL,
    credits INT NOT NULL,
    package_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    paystack_reference VARCHAR(255),
    paystack_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_reference (reference),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activation codes table (if not exists)
CREATE TABLE IF NOT EXISTS activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activation_code VARCHAR(50) UNIQUE NOT NULL,
    payment_id INT,
    credits INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP NULL,
    activated_by_email VARCHAR(255),
    activated_by_device VARCHAR(255),
    times_used INT DEFAULT 0,
    max_uses INT DEFAULT 1,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_code (activation_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usage log table (if not exists)
CREATE TABLE IF NOT EXISTS usage_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    device_id VARCHAR(100),
    tool_name VARCHAR(100),
    action VARCHAR(100),
    credits_used INT DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_device_id (device_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sync data table (if not exists)
CREATE TABLE IF NOT EXISTS sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50),
    data_content LONGTEXT,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_device_id (device_id),
    UNIQUE KEY unique_email_device_type (email, device_id, data_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. CREATE USER TRACKING TABLES (NEW)
-- ============================================

-- Users table for email tracking
CREATE TABLE IF NOT EXISTS geotechiex_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_free_uses INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_last_active (last_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User devices table (tracks devices per user)
CREATE TABLE IF NOT EXISTS user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES geotechiex_users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (user_id, device_id),
    INDEX idx_device_id (device_id),
    INDEX idx_last_active (last_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. CREATE USER STATISTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.registered_at,
    u.last_active,
    COUNT(DISTINCT ud.device_id) as device_count,
    COUNT(ul.id) as total_actions,
    SUM(CASE WHEN ul.credits_used = 0 THEN 1 ELSE 0 END) as free_uses,
    SUM(ul.credits_used) as paid_uses,
    (SELECT SUM(a.credits) 
     FROM activation_codes a 
     JOIN payments p ON a.payment_id = p.id 
     WHERE p.email = u.email AND a.status IN ('used', 'active')) as total_credits_purchased
FROM geotechiex_users u
LEFT JOIN user_devices ud ON u.id = ud.user_id
LEFT JOIN usage_log ul ON u.email = ul.email
GROUP BY u.id, u.email, u.registered_at, u.last_active;

-- ============================================
-- 4. INSERT TEST DATA (Optional - for testing)
-- ============================================

-- Insert a test activation code for development
INSERT INTO activation_codes (activation_code, payment_id, credits, status)
VALUES ('GEOX-TEST-TEST-TEST', NULL, 10, 'active')
ON DUPLICATE KEY UPDATE status='active';

-- ============================================
-- 5. VERIFY SETUP
-- ============================================

-- Show all tables
SELECT 'Showing all tables in database...' as status;
SHOW TABLES;

-- Show table structures
SELECT 'Checking payments table...' as status;
DESCRIBE payments;

SELECT 'Checking activation_codes table...' as status;
DESCRIBE activation_codes;

SELECT 'Checking usage_log table...' as status;
DESCRIBE usage_log;

SELECT 'Checking geotechiex_users table...' as status;
DESCRIBE geotechiex_users;

SELECT 'Checking user_devices table...' as status;
DESCRIBE user_devices;

-- Count records in each table
SELECT 'payments' as table_name, COUNT(*) as record_count FROM payments
UNION ALL
SELECT 'activation_codes', COUNT(*) FROM activation_codes
UNION ALL
SELECT 'usage_log', COUNT(*) FROM usage_log
UNION ALL
SELECT 'geotechiex_users', COUNT(*) FROM geotechiex_users
UNION ALL
SELECT 'user_devices', COUNT(*) FROM user_devices;

-- Final success message
SELECT '✅ Database setup completed successfully!' as message;
SELECT 'All 6 tables are ready: payments, activation_codes, usage_log, sync_data, geotechiex_users, user_devices' as info;
