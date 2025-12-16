-- GeoTechieX Payment Database Setup
-- Database: geotechiex_payments
-- Created: 2025-12-16
-- 
-- Instructions:
-- 1. Create database: CREATE DATABASE geotechiex_payments;
-- 2. Select database: USE geotechiex_payments;
-- 3. Run this entire script
-- 4. Verify tables created: SHOW TABLES;

-- Use the database
USE geotechiex_payments;

-- Drop existing tables if they exist (for clean reinstall)
-- UNCOMMENT THESE LINES ONLY IF YOU WANT TO RESET EVERYTHING
-- DROP TABLE IF EXISTS usage_log;
-- DROP TABLE IF EXISTS sync_data;
-- DROP TABLE IF EXISTS activation_codes;
-- DROP TABLE IF EXISTS payments;

-- ============================================
-- Table 1: Payments
-- Stores all payment transactions
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique payment reference (GEOX-timestamp-random)',
    email VARCHAR(255) NOT NULL COMMENT 'Customer email address',
    customer_name VARCHAR(255) COMMENT 'Customer full name',
    phone VARCHAR(20) COMMENT 'Customer phone number',
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Payment amount in Naira',
    credits INT NOT NULL COMMENT 'Number of credits purchased',
    package_name VARCHAR(50) COMMENT 'Package name (Basic/Premium)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'Payment status: pending, completed, failed',
    paystack_reference VARCHAR(255) COMMENT 'Paystack transaction reference',
    paystack_status VARCHAR(50) COMMENT 'Paystack payment status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Payment initiated timestamp',
    verified_at TIMESTAMP NULL COMMENT 'Payment verified timestamp',
    
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_reference (reference),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores all payment transactions';

-- ============================================
-- Table 2: Activation Codes
-- Stores generated activation codes
-- ============================================
CREATE TABLE IF NOT EXISTS activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activation_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique activation code (GEOX-XXXX-XXXX-XXXX)',
    payment_id INT COMMENT 'Reference to payment record',
    credits INT NOT NULL COMMENT 'Number of credits this code provides',
    status VARCHAR(20) DEFAULT 'active' COMMENT 'Code status: active, used, expired',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Code generation timestamp',
    activated_at TIMESTAMP NULL COMMENT 'Code activation timestamp',
    activated_by_email VARCHAR(255) COMMENT 'Email of user who activated',
    activated_by_device VARCHAR(255) COMMENT 'Device ID that activated code',
    times_used INT DEFAULT 0 COMMENT 'Number of times code has been used',
    max_uses INT DEFAULT 1 COMMENT 'Maximum number of times code can be used',
    expires_at TIMESTAMP NULL COMMENT 'Code expiration timestamp (NULL = never expires)',
    
    -- Foreign key relationship
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_code (activation_code),
    INDEX idx_status (status),
    INDEX idx_payment_id (payment_id),
    INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores activation codes for credit redemption';

-- ============================================
-- Table 3: Usage Log
-- Tracks all user activities and credit usage
-- ============================================
CREATE TABLE IF NOT EXISTS usage_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) COMMENT 'User email',
    device_id VARCHAR(100) COMMENT 'Device identifier',
    tool_name VARCHAR(100) COMMENT 'Name of tool used',
    action VARCHAR(100) COMMENT 'Action performed',
    credits_used INT DEFAULT 0 COMMENT 'Number of credits consumed',
    ip_address VARCHAR(45) COMMENT 'User IP address (IPv4 or IPv6)',
    user_agent TEXT COMMENT 'Browser user agent string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log entry timestamp',
    
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_device_id (device_id),
    INDEX idx_tool_name (tool_name),
    INDEX idx_created_at (created_at),
    INDEX idx_email_device (email, device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs all user activities and credit usage';

-- ============================================
-- Table 4: Sync Data
-- Stores synchronized data for backup/recovery
-- ============================================
CREATE TABLE IF NOT EXISTS sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL COMMENT 'User email',
    device_id VARCHAR(100) NOT NULL COMMENT 'Device identifier',
    data_type VARCHAR(50) COMMENT 'Type of data being synced',
    data_content LONGTEXT COMMENT 'JSON data content',
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last sync timestamp',
    
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_device_id (device_id),
    INDEX idx_email_device (email, device_id),
    INDEX idx_last_sync (last_sync),
    
    -- Unique constraint to prevent duplicate syncs
    UNIQUE KEY unique_email_device_type (email, device_id, data_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores user data for synchronization and backup';

-- ============================================
-- Insert Test Data (Optional - for development only)
-- UNCOMMENT to add test records
-- ============================================

/*
-- Test payment record
INSERT INTO payments (reference, email, customer_name, phone, amount, credits, package_name, status)
VALUES 
('GEOX-TEST-001', 'test@example.com', 'Test User', '+2348012345678', 500.00, 10, 'Basic Package', 'completed');

-- Test activation code
INSERT INTO activation_codes (activation_code, payment_id, credits, status)
VALUES 
('GEOX-TEST-TEST-TEST', 1, 10, 'active');

-- Test usage log
INSERT INTO usage_log (email, device_id, tool_name, action, credits_used, ip_address)
VALUES 
('test@example.com', 'DEV-TEST-001', 'polygon_creator', 'create_polygon', 1, '127.0.0.1');
*/

-- ============================================
-- Verification Queries
-- Run these to verify everything is set up correctly
-- ============================================

-- Check if all tables exist
SELECT 
    TABLE_NAME, 
    TABLE_ROWS, 
    CREATE_TIME 
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'geotechiex_payments'
ORDER BY 
    TABLE_NAME;

-- Check payments table structure
DESCRIBE payments;

-- Check activation_codes table structure
DESCRIBE activation_codes;

-- Check usage_log table structure
DESCRIBE usage_log;

-- Check sync_data table structure
DESCRIBE sync_data;

-- ============================================
-- Useful Admin Queries
-- ============================================

-- Get all completed payments
-- SELECT * FROM payments WHERE status = 'completed' ORDER BY created_at DESC;

-- Get all active activation codes
-- SELECT * FROM activation_codes WHERE status = 'active' ORDER BY generated_at DESC;

-- Get payment summary
-- SELECT status, COUNT(*) as count, SUM(amount) as total_amount, SUM(credits) as total_credits
-- FROM payments
-- GROUP BY status;

-- Get top customers by credits
-- SELECT email, COUNT(*) as purchases, SUM(credits) as total_credits
-- FROM payments
-- WHERE status = 'completed'
-- GROUP BY email
-- ORDER BY total_credits DESC
-- LIMIT 10;

-- Get recent activity log
-- SELECT * FROM usage_log ORDER BY created_at DESC LIMIT 20;

-- Get codes by status
-- SELECT status, COUNT(*) as count
-- FROM activation_codes
-- GROUP BY status;

-- ============================================
-- Maintenance Queries
-- ============================================

-- Delete old pending payments (older than 24 hours)
-- DELETE FROM payments 
-- WHERE status = 'pending' 
-- AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Delete old usage logs (older than 90 days)
-- DELETE FROM usage_log 
-- WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Optimize tables (run periodically for performance)
-- OPTIMIZE TABLE payments, activation_codes, usage_log, sync_data;

-- ============================================
-- Backup Command (Run from terminal)
-- ============================================
-- mysqldump -u username -p geotechiex_payments > backup_$(date +%Y%m%d).sql

-- ============================================
-- Restore Command (Run from terminal)
-- ============================================
-- mysql -u username -p geotechiex_payments < backup_20251216.sql

-- ============================================
-- Setup Complete!
-- ============================================
SELECT 'Database setup completed successfully! ✅' as message;
