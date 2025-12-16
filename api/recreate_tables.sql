-- COMPLETE TABLE RECREATION
-- Use this if ALTER TABLE approach has issues
-- WARNING: This will DELETE ALL EXISTING DATA!

USE geotechiex_payments;

-- Backup existing data (optional - run this first if you have important data)
-- CREATE TABLE payments_backup AS SELECT * FROM payments;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (in any order now)
DROP TABLE IF EXISTS usage_log;
DROP TABLE IF EXISTS sync_data;
DROP TABLE IF EXISTS activation_codes;
DROP TABLE IF EXISTS payments;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Recreate payments table with correct structure
CREATE TABLE payments (
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
);

-- Recreate activation_codes table
CREATE TABLE activation_codes (
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
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_code (activation_code),
    INDEX idx_status (status)
);

-- Recreate usage_log table
CREATE TABLE usage_log (
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
    INDEX idx_device (device_id),
    INDEX idx_created (created_at)
);

-- Recreate sync_data table
CREATE TABLE sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50),
    data_content LONGTEXT,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_device (email, device_id)
);

-- Insert test activation code
INSERT INTO activation_codes (activation_code, payment_id, credits, status)
VALUES ('GEOX-TEST-TEST-TEST', NULL, 10, 'active');

-- Verify tables
SHOW TABLES;
DESCRIBE payments;
DESCRIBE activation_codes;

SELECT 'Tables recreated successfully!' as message;
