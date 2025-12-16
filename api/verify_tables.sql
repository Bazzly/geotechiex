-- Quick Table Verification and Fix
-- Run this to check if your tables exist and create them if missing

USE geotechiex_payments;

-- Check if tables exist
SELECT 
    TABLE_NAME,
    TABLE_ROWS as 'Rows',
    CREATE_TIME as 'Created'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'geotechiex_payments'
ORDER BY TABLE_NAME;

-- If you see all 4 tables above, you're good!
-- If not, run the CREATE statements below:

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

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

-- Verify tables were created
SHOW TABLES;

-- Insert a test payment to verify INSERT permissions
INSERT INTO payments (reference, email, customer_name, amount, credits, package_name, status)
VALUES ('GEOX-VERIFY-' + UNIX_TIMESTAMP(), 'test@verify.com', 'Verify User', 500, 10, 'Test', 'pending');

-- If above works, check the record
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;

-- Insert test activation code
INSERT INTO activation_codes (activation_code, credits, status)
VALUES ('GEOX-TEST-TEST-TEST', 10, 'active')
ON DUPLICATE KEY UPDATE status='active';

-- Verify test code exists
SELECT * FROM activation_codes WHERE activation_code = 'GEOX-TEST-TEST-TEST';

-- Check permissions
SHOW GRANTS FOR CURRENT_USER();

-- Success message
SELECT 'All tables verified and working!' as Status;
