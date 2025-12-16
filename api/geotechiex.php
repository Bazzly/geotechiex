<?php
/**
 * GeoTechieX Payment API
 * File: geotechiex.php
 * Host: www.bazzlylinks.com/geotechiex.php
 * 
 * This PHP API handles payment processing, activation code generation,
 * and data persistence for the GeoTechieX platform.
 * 
 * DATABASE STRUCTURE REQUIRED:
 */

/*
-- Create database
CREATE DATABASE IF NOT EXISTS geotechiex_payments;
USE geotechiex_payments;

-- Payments table
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
);

-- Activation codes table
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
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_code (activation_code),
    INDEX idx_status (status)
);

-- Usage log table
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
    INDEX idx_device (device_id),
    INDEX idx_created (created_at)
);

-- Sync data table (for backup/recovery)
CREATE TABLE IF NOT EXISTS sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50),
    data_content LONGTEXT,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_device (email, device_id)
);
*/

// Database configuration
$db_host = 'localhost';
$db_name = 'geotechiex_payments';
$db_user = 'your_db_username';
$db_pass = 'your_db_password';

// Paystack configuration
$paystack_secret_key = 'sk_test_xxxxxxxxxxxxxxxxxxxx'; // TODO: Replace with your secret key

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$action = $data['action'] ?? '';

// Route to appropriate handler
switch ($action) {
    case 'initiate_payment':
        initiatePayment($pdo, $data);
        break;
    
    case 'verify_payment':
        verifyPayment($pdo, $data, $paystack_secret_key);
        break;
    
    case 'activate_code':
        activateCode($pdo, $data);
        break;
    
    case 'check_code_status':
        checkCodeStatus($pdo, $data);
        break;
    
    case 'get_payment_history':
        getPaymentHistory($pdo, $data);
        break;
    
    case 'sync_data':
        syncData($pdo, $data);
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

/**
 * Initiate payment record
 */
function initiatePayment($pdo, $data) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO payments (reference, email, customer_name, phone, amount, credits, package_name, status)
            VALUES (:reference, :email, :customer_name, :phone, :amount, :credits, :package_name, 'pending')
        ");
        
        $stmt->execute([
            ':reference' => $data['reference'],
            ':email' => $data['email'],
            ':customer_name' => $data['customerName'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':amount' => $data['amount'],
            ':credits' => $data['credits'],
            ':package_name' => $data['packageName'] ?? ''
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment initiated',
            'reference' => $data['reference']
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to initiate payment']);
    }
}

/**
 * Verify payment with Paystack and generate activation code
 */
function verifyPayment($pdo, $data, $secret_key) {
    $reference = $data['reference'];
    
    // Verify with Paystack
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/verify/" . $reference);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $secret_key"
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $paystack_data = json_decode($response, true);
    
    if ($paystack_data['status'] && $paystack_data['data']['status'] === 'success') {
        try {
            // Update payment record
            $stmt = $pdo->prepare("
                UPDATE payments 
                SET status = 'completed', 
                    paystack_reference = :paystack_ref,
                    paystack_status = :paystack_status,
                    verified_at = NOW()
                WHERE reference = :reference
            ");
            
            $stmt->execute([
                ':paystack_ref' => $paystack_data['data']['reference'],
                ':paystack_status' => $paystack_data['data']['status'],
                ':reference' => $reference
            ]);
            
            // Get payment details
            $stmt = $pdo->prepare("SELECT * FROM payments WHERE reference = :reference");
            $stmt->execute([':reference' => $reference]);
            $payment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Generate activation code
            $activation_code = generateActivationCode();
            
            // Store activation code
            $stmt = $pdo->prepare("
                INSERT INTO activation_codes (activation_code, payment_id, credits, status)
                VALUES (:code, :payment_id, :credits, 'active')
            ");
            
            $stmt->execute([
                ':code' => $activation_code,
                ':payment_id' => $payment['id'],
                ':credits' => $payment['credits']
            ]);
            
            // Log usage
            logUsage($pdo, $payment['email'], '', 'payment_completed', 0);
            
            echo json_encode([
                'success' => true,
                'message' => 'Payment verified successfully',
                'activation_code' => $activation_code,
                'credits' => $payment['credits'],
                'amount' => $payment['amount'],
                'reference' => $reference
            ]);
            
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to process payment']);
        }
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Payment verification failed with Paystack'
        ]);
    }
}

/**
 * Activate code and assign credits
 */
function activateCode($pdo, $data) {
    $code = strtoupper(trim($data['activation_code']));
    $device_id = $data['device_id'] ?? '';
    
    try {
        // Check if code exists and is valid
        $stmt = $pdo->prepare("
            SELECT * FROM activation_codes 
            WHERE activation_code = :code 
            AND status = 'active'
            AND (expires_at IS NULL OR expires_at > NOW())
            AND times_used < max_uses
        ");
        
        $stmt->execute([':code' => $code]);
        $activation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$activation) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid or expired activation code'
            ]);
            return;
        }
        
        // Update activation record
        $stmt = $pdo->prepare("
            UPDATE activation_codes 
            SET times_used = times_used + 1,
                activated_at = NOW(),
                activated_by_device = :device_id,
                status = CASE WHEN times_used + 1 >= max_uses THEN 'used' ELSE 'active' END
            WHERE id = :id
        ");
        
        $stmt->execute([
            ':device_id' => $device_id,
            ':id' => $activation['id']
        ]);
        
        // Log usage
        logUsage($pdo, '', $device_id, 'code_activated', 0);
        
        echo json_encode([
            'success' => true,
            'message' => 'Activation successful',
            'credits' => $activation['credits'],
            'activation_code' => $code
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Activation failed']);
    }
}

/**
 * Check activation code status
 */
function checkCodeStatus($pdo, $data) {
    $code = strtoupper(trim($data['activation_code']));
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM activation_codes WHERE activation_code = :code");
        $stmt->execute([':code' => $code]);
        $activation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($activation) {
            echo json_encode([
                'success' => true,
                'status' => $activation['status'],
                'credits' => $activation['credits'],
                'times_used' => $activation['times_used'],
                'max_uses' => $activation['max_uses'],
                'generated_at' => $activation['generated_at']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Code not found'
            ]);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Status check failed']);
    }
}

/**
 * Get payment history
 */
function getPaymentHistory($pdo, $data) {
    $email = $data['email'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT p.*, a.activation_code 
            FROM payments p
            LEFT JOIN activation_codes a ON p.id = a.payment_id
            WHERE p.email = :email
            ORDER BY p.created_at DESC
        ");
        
        $stmt->execute([':email' => $email]);
        $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'payments' => $payments
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to get history']);
    }
}

/**
 * Sync data
 */
function syncData($pdo, $data) {
    $email = $data['email'];
    $device_id = $data['device_id'];
    
    try {
        // Get server data
        $stmt = $pdo->prepare("
            SELECT * FROM sync_data 
            WHERE email = :email AND device_id = :device_id
        ");
        
        $stmt->execute([
            ':email' => $email,
            ':device_id' => $device_id
        ]);
        
        $sync = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Calculate total credits
        $stmt = $pdo->prepare("
            SELECT SUM(a.credits) as total_credits
            FROM activation_codes a
            JOIN payments p ON a.payment_id = p.id
            WHERE p.email = :email AND a.status = 'used'
        ");
        
        $stmt->execute([':email' => $email]);
        $credits = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'server_data' => $sync ? json_decode($sync['data_content'], true) : null,
            'total_credits' => $credits['total_credits'] ?? 0
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Sync failed']);
    }
}

/**
 * Generate activation code
 */
function generateActivationCode() {
    $segments = [];
    for ($i = 0; $i < 4; $i++) {
        $segments[] = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 4));
    }
    return 'GEOX-' . implode('-', $segments);
}

/**
 * Log usage
 */
function logUsage($pdo, $email, $device_id, $action, $credits_used) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO usage_log (email, device_id, action, credits_used, ip_address, user_agent)
            VALUES (:email, :device_id, :action, :credits_used, :ip, :user_agent)
        ");
        
        $stmt->execute([
            ':email' => $email,
            ':device_id' => $device_id,
            ':action' => $action,
            ':credits_used' => $credits_used,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? '',
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
        
    } catch (PDOException $e) {
        // Silent fail for logging
    }
}
?>
