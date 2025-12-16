-- Fix payments table structure
-- Run this on your database to add missing columns

USE geotechiex_payments;

-- Check current table structure
DESCRIBE payments;

-- Add missing columns if they don't exist
-- (MySQL will error if column exists, but that's safe to ignore)

-- Add reference column
ALTER TABLE payments 
ADD COLUMN reference VARCHAR(100) UNIQUE NOT NULL AFTER id;

-- Add customer_name column if missing
ALTER TABLE payments 
ADD COLUMN customer_name VARCHAR(255) AFTER email;

-- Add phone column if missing
ALTER TABLE payments 
ADD COLUMN phone VARCHAR(20) AFTER customer_name;

-- Add package_name column if missing
ALTER TABLE payments 
ADD COLUMN package_name VARCHAR(50) AFTER credits;

-- Add paystack_reference column if missing
ALTER TABLE payments 
ADD COLUMN paystack_reference VARCHAR(255) AFTER status;

-- Add paystack_status column if missing
ALTER TABLE payments 
ADD COLUMN paystack_status VARCHAR(50) AFTER paystack_reference;

-- Add verified_at column if missing
ALTER TABLE payments 
ADD COLUMN verified_at TIMESTAMP NULL AFTER created_at;

-- Add indexes if missing
ALTER TABLE payments ADD INDEX idx_email (email);
ALTER TABLE payments ADD INDEX idx_reference (reference);
ALTER TABLE payments ADD INDEX idx_status (status);

-- Show final structure
DESCRIBE payments;

-- Test query to verify all columns exist
SELECT 
    id, reference, email, customer_name, phone, 
    amount, credits, package_name, status, 
    paystack_reference, paystack_status, 
    created_at, verified_at
FROM payments 
LIMIT 1;
