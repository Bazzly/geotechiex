-- Add Users and User Devices tables for email tracking
-- Run this to add user tracking to existing database

USE geotechiex_payments;

-- Users table
CREATE TABLE IF NOT EXISTS geotechiex_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_free_uses INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_last_active (last_active)
);

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
);

-- Modify usage_log table to ensure email is tracked properly
-- Note: Remove the constraint if it causes issues
ALTER TABLE usage_log 
    MODIFY COLUMN email VARCHAR(255);

-- Add index if not exists (separately to avoid errors)
-- If this fails, the table will still work
CREATE INDEX IF NOT EXISTS idx_email_credits ON usage_log(email, credits_used);

-- Create view for easy user statistics
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

-- Insert test data (optional)
-- INSERT INTO users (email) VALUES ('test@example.com');

-- Show tables to verify
SHOW TABLES;

-- Show structure
DESCRIBE geotechiex_users;
DESCRIBE user_devices;

-- Test query to check everything works
SELECT COUNT(*) as user_count FROM geotechiex_users;
SELECT COUNT(*) as device_count FROM user_devices;

SELECT 'User tracking tables created successfully!' as message;
