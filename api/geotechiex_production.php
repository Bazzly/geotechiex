<?php
/**
 * GeoTechieX Payment API - Production Version
 * Error logging enabled for debugging
 */

// Enable error reporting for debugging (disable in production after testing)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to users
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/geotechiex_errors.log');

// CORS headers - MUST be first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

$config = [
    'db_host' => 'localhost',
    'db_name' => 'geotechiex_payments',
    'db_user' => 'your_db_username',        // UPDATE THIS
    'db_pass' => 'your_db_password',        // UPDATE THIS
    'paystack_secret' => 'sk_live_YOUR_SECRET_KEY_HERE', // UPDATE THIS with your actual key
    'debug_mode' => true // Set to false in production
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function sendResponse($success, $message, $data = []) {
    $response = array_merge(['success' => $success, 'message' => $message], $data);
    echo json_encode($response);
    exit();
}

function logError($error) {
    error_log(date('[Y-m-d H:i:s] ') . $error . PHP_EOL, 3, __DIR__ . '/geotechiex_errors.log');
}

function generateActivationCode() {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $segments = [];
    for ($i = 0; $i < 4; $i++) {
        $segment = '';
        for ($j = 0; $j < 4; $j++) {
            $segment .= $chars[rand(0, strlen($chars) - 1)];
        }
        $segments[] = $segment;
    }
    return 'GEOX-' . implode('-', $segments);
}

// ============================================
// DATABASE CONNECTION
// ============================================

try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    logError("Database connection failed: " . $e->getMessage());
    sendResponse(false, 'Database connection failed. Please contact support.');
}

// ============================================
// GET REQUEST DATA
// ============================================

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    logError("JSON decode error: " . json_last_error_msg());
    sendResponse(false, 'Invalid JSON data');
}

$action = $data['action'] ?? '';

if (empty($action)) {
    sendResponse(false, 'No action specified');
}

// ============================================
// ROUTE HANDLER
// ============================================

try {
    switch ($action) {
        case 'test':
            sendResponse(true, 'API is working correctly!', ['timestamp' => date('Y-m-d H:i:s')]);
            break;

        case 'initiate_payment':
            initiatePayment($pdo, $data);
            break;

        case 'verify_payment':
            verifyPayment($pdo, $data, $config['paystack_secret']);
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

        // User tracking endpoints
        case 'register_user':
            registerUser($pdo, $data);
            break;

        case 'sync_user_data':
            syncUserData($pdo, $data);
            break;

        case 'check_user_usage':
            checkUserUsage($pdo, $data);
            break;

        case 'log_usage':
            logUserUsage($pdo, $data);
            break;

        // Admin endpoints
        case 'admin_stats':
            adminGetStats($pdo);
            break;

        case 'admin_payments':
            adminGetPayments($pdo, $data);
            break;

        case 'admin_activations':
            adminGetActivations($pdo, $data);
            break;

        case 'admin_usage_log':
            adminGetUsageLog($pdo, $data);
            break;

        case 'generate_code':
            adminGenerateCode($pdo, $data);
            break;

        default:
            sendResponse(false, 'Invalid action: ' . $action);
    }
} catch (Exception $e) {
    logError("Error in action '$action': " . $e->getMessage());
    sendResponse(false, 'An error occurred. Please try again.');
}

// ============================================
// ACTION FUNCTIONS
// ============================================

function initiatePayment($pdo, $data) {
    try {
        // Validate required fields
        $required = ['reference', 'email', 'amount', 'credits'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                sendResponse(false, "Missing required field: $field");
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO payments (reference, email, customer_name, phone, amount, credits, package_name, status)
            VALUES (:reference, :email, :customer_name, :phone, :amount, :credits, :package_name, 'pending')
        ");

        $params = [
            ':reference' => $data['reference'] ?? '',
            ':email' => $data['email'] ?? '',
            ':customer_name' => $data['customerName'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':amount' => $data['amount'] ?? 0,
            ':credits' => $data['credits'] ?? 0,
            ':package_name' => $data['packageName'] ?? ''
        ];

        $result = $stmt->execute($params);

        if ($result) {
            sendResponse(true, 'Payment initiated successfully', [
                'reference' => $data['reference'],
                'payment_id' => $pdo->lastInsertId()
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            throw new Exception('Failed to insert: ' . $errorInfo[2]);
        }

    } catch (PDOException $e) {
        logError("Initiate payment error: " . $e->getMessage());
        
        // Check if it's a duplicate reference error
        if ($e->getCode() == 23000) {
            sendResponse(false, 'Duplicate payment reference. Please try again.');
        }
        
        sendResponse(false, 'Failed to initiate payment: Database error');
    } catch (Exception $e) {
        logError("Initiate payment error: " . $e->getMessage());
        sendResponse(false, 'Failed to initiate payment: ' . $e->getMessage());
    }
}

function verifyPayment($pdo, $data, $secret_key) {
    $reference = $data['reference'] ?? '';

    if (empty($reference)) {
        sendResponse(false, 'Payment reference is required');
    }

    try {
        // Verify with Paystack
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://api.paystack.co/transaction/verify/" . urlencode($reference),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $secret_key",
                "Cache-Control: no-cache"
            ],
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            logError("Curl error: $curlError");
            sendResponse(false, 'Unable to verify payment. Please try again.');
        }

        $paystackData = json_decode($response, true);

        if ($httpCode !== 200 || !$paystackData['status']) {
            logError("Paystack verification failed: " . $response);
            sendResponse(false, 'Payment verification failed');
        }

        if ($paystackData['data']['status'] !== 'success') {
            sendResponse(false, 'Payment was not successful');
        }

        // Update payment in database
        $stmt = $pdo->prepare("
            UPDATE payments 
            SET status = 'completed', 
                paystack_reference = :paystack_ref,
                paystack_status = :paystack_status,
                verified_at = NOW()
            WHERE reference = :reference
        ");

        $stmt->execute([
            ':paystack_ref' => $paystackData['data']['reference'],
            ':paystack_status' => $paystackData['data']['status'],
            ':reference' => $reference
        ]);

        // Get payment details
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE reference = :reference");
        $stmt->execute([':reference' => $reference]);
        $payment = $stmt->fetch();

        if (!$payment) {
            sendResponse(false, 'Payment record not found');
        }

        // Generate activation code
        $activationCode = generateActivationCode();

        // Store activation code
        $stmt = $pdo->prepare("
            INSERT INTO activation_codes (activation_code, payment_id, credits, status)
            VALUES (:code, :payment_id, :credits, 'active')
        ");

        $stmt->execute([
            ':code' => $activationCode,
            ':payment_id' => $payment['id'],
            ':credits' => $payment['credits']
        ]);

        sendResponse(true, 'Payment verified successfully', [
            'activation_code' => $activationCode,
            'credits' => (int)$payment['credits'],
            'amount' => (float)$payment['amount'],
            'reference' => $reference
        ]);

    } catch (Exception $e) {
        logError("Verify payment error: " . $e->getMessage());
        sendResponse(false, 'Payment verification failed');
    }
}

function activateCode($pdo, $data) {
    $code = strtoupper(trim($data['activation_code'] ?? ''));
    $deviceId = $data['device_id'] ?? '';

    if (empty($code)) {
        sendResponse(false, 'Activation code is required');
    }

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
        $activation = $stmt->fetch();

        if (!$activation) {
            sendResponse(false, 'Invalid or expired activation code');
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
            ':device_id' => $deviceId,
            ':id' => $activation['id']
        ]);

        sendResponse(true, 'Activation successful', [
            'credits' => (int)$activation['credits'],
            'activation_code' => $code
        ]);

    } catch (Exception $e) {
        logError("Activate code error: " . $e->getMessage());
        sendResponse(false, 'Activation failed');
    }
}

function checkCodeStatus($pdo, $data) {
    $code = strtoupper(trim($data['activation_code'] ?? ''));

    if (empty($code)) {
        sendResponse(false, 'Activation code is required');
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM activation_codes WHERE activation_code = :code");
        $stmt->execute([':code' => $code]);
        $activation = $stmt->fetch();

        if ($activation) {
            sendResponse(true, 'Code found', [
                'status' => $activation['status'],
                'credits' => (int)$activation['credits'],
                'times_used' => (int)$activation['times_used'],
                'max_uses' => (int)$activation['max_uses'],
                'generated_at' => $activation['generated_at']
            ]);
        } else {
            sendResponse(false, 'Code not found');
        }

    } catch (Exception $e) {
        logError("Check code status error: " . $e->getMessage());
        sendResponse(false, 'Status check failed');
    }
}

function getPaymentHistory($pdo, $data) {
    $email = $data['email'] ?? '';

    if (empty($email)) {
        sendResponse(false, 'Email is required');
    }

    try {
        $stmt = $pdo->prepare("
            SELECT p.*, a.activation_code 
            FROM payments p
            LEFT JOIN activation_codes a ON p.id = a.payment_id
            WHERE p.email = :email
            ORDER BY p.created_at DESC
            LIMIT 50
        ");

        $stmt->execute([':email' => $email]);
        $payments = $stmt->fetchAll();

        sendResponse(true, 'Payment history retrieved', [
            'payments' => $payments
        ]);

    } catch (Exception $e) {
        logError("Get payment history error: " . $e->getMessage());
        sendResponse(false, 'Failed to get payment history');
    }
}

function syncData($pdo, $data) {
    $email = $data['email'] ?? '';
    $deviceId = $data['device_id'] ?? '';

    if (empty($email) || empty($deviceId)) {
        sendResponse(false, 'Email and device ID are required');
    }

    try {
        // Get or create sync record
        $stmt = $pdo->prepare("
            SELECT * FROM sync_data 
            WHERE email = :email AND device_id = :device_id
            LIMIT 1
        ");

        $stmt->execute([
            ':email' => $email,
            ':device_id' => $deviceId
        ]);

        $sync = $stmt->fetch();

        // Calculate total credits from activated codes
        $stmt = $pdo->prepare("
            SELECT SUM(a.credits) as total_credits
            FROM activation_codes a
            JOIN payments p ON a.payment_id = p.id
            WHERE p.email = :email AND a.status IN ('used', 'active')
        ");

        $stmt->execute([':email' => $email]);
        $creditsData = $stmt->fetch();

        sendResponse(true, 'Data synced', [
            'server_data' => $sync ? json_decode($sync['data_content'], true) : null,
            'total_credits' => (int)($creditsData['total_credits'] ?? 0)
        ]);

    } catch (Exception $e) {
        logError("Sync data error: " . $e->getMessage());
        sendResponse(false, 'Sync failed');
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

function adminGetStats($pdo) {
    try {
        // Total revenue
        $stmt = $pdo->query("
            SELECT SUM(amount) as total_revenue, 
                   COUNT(*) as total_payments,
                   SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments
            FROM payments
        ");
        $revenue = $stmt->fetch();

        // Active users (users with payments in last 30 days)
        $stmt = $pdo->query("
            SELECT COUNT(DISTINCT email) as active_users
            FROM payments
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");
        $users = $stmt->fetch();

        // Tool usage today
        $stmt = $pdo->query("
            SELECT COUNT(*) as usage_today,
                   (SELECT COUNT(*) FROM usage_log) as total_usage
            FROM usage_log
            WHERE DATE(created_at) = CURDATE()
        ");
        $usage = $stmt->fetch();

        // Revenue change (compare to last month)
        $stmt = $pdo->query("
            SELECT 
                (SELECT SUM(amount) FROM payments WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status = 'completed') as this_month,
                (SELECT SUM(amount) FROM payments WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND status = 'completed') as last_month
        ");
        $change = $stmt->fetch();
        
        $revenueChange = 0;
        if ($change['last_month'] > 0) {
            $revenueChange = round((($change['this_month'] - $change['last_month']) / $change['last_month']) * 100, 1);
        }

        sendResponse(true, 'Stats retrieved', [
            'stats' => [
                'total_revenue' => (float)($revenue['total_revenue'] ?? 0),
                'total_payments' => (int)($revenue['total_payments'] ?? 0),
                'completed_payments' => (int)($revenue['completed_payments'] ?? 0),
                'active_users' => (int)($users['active_users'] ?? 0),
                'new_users' => (int)($users['active_users'] ?? 0), // Simplified
                'tool_usage_today' => (int)($usage['usage_today'] ?? 0),
                'total_tool_usage' => (int)($usage['total_usage'] ?? 0),
                'revenue_change' => $revenueChange
            ]
        ]);

    } catch (Exception $e) {
        logError("Admin stats error: " . $e->getMessage());
        sendResponse(false, 'Failed to get stats');
    }
}

function adminGetPayments($pdo, $data) {
    $limit = $data['limit'] ?? 50;

    try {
        $stmt = $pdo->prepare("
            SELECT * FROM payments 
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $payments = $stmt->fetchAll();

        sendResponse(true, 'Payments retrieved', [
            'payments' => $payments
        ]);

    } catch (Exception $e) {
        logError("Admin payments error: " . $e->getMessage());
        sendResponse(false, 'Failed to get payments');
    }
}

function adminGetActivations($pdo, $data) {
    $limit = $data['limit'] ?? 50;

    try {
        $stmt = $pdo->prepare("
            SELECT * FROM activation_codes 
            ORDER BY generated_at DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $activations = $stmt->fetchAll();

        sendResponse(true, 'Activations retrieved', [
            'activations' => $activations
        ]);

    } catch (Exception $e) {
        logError("Admin activations error: " . $e->getMessage());
        sendResponse(false, 'Failed to get activations');
    }
}

function adminGetUsageLog($pdo, $data) {
    $limit = $data['limit'] ?? 100;

    try {
        $stmt = $pdo->prepare("
            SELECT * FROM usage_log 
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $usageLog = $stmt->fetchAll();

        sendResponse(true, 'Usage log retrieved', [
            'usage_log' => $usageLog
        ]);

    } catch (Exception $e) {
        logError("Admin usage log error: " . $e->getMessage());
        sendResponse(false, 'Failed to get usage log');
    }
}

// ============================================
// USER TRACKING FUNCTIONS
// ============================================

function registerUser($pdo, $data) {
    $email = $data['email'] ?? '';
    $deviceId = $data['device_id'] ?? '';

    if (empty($email)) {
        sendResponse(false, 'Email is required');
    }

    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM geotechiex_users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            // User exists, just log the device
            $stmt = $pdo->prepare("
                INSERT INTO user_devices (user_id, device_id, last_active)
                VALUES (:user_id, :device_id, NOW())
                ON DUPLICATE KEY UPDATE last_active = NOW()
            ");
            $stmt->execute([
                ':user_id' => $existingUser['id'],
                ':device_id' => $deviceId
            ]);

            sendResponse(true, 'User already registered', [
                'user_id' => $existingUser['id']
            ]);
        } else {
            // Create new user
            $stmt = $pdo->prepare("
                INSERT INTO geotechiex_users (email, registered_at, last_active)
                VALUES (:email, NOW(), NOW())
            ");
            $stmt->execute([':email' => $email]);
            
            $userId = $pdo->lastInsertId();

            // Log device
            $stmt = $pdo->prepare("
                INSERT INTO user_devices (user_id, device_id, last_active)
                VALUES (:user_id, :device_id, NOW())
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':device_id' => $deviceId
            ]);

            sendResponse(true, 'User registered successfully', [
                'user_id' => $userId
            ]);
        }

    } catch (Exception $e) {
        logError("User registration error: " . $e->getMessage());
        logError("Stack trace: " . $e->getTraceAsString());
        sendResponse(false, 'Registration failed: ' . $e->getMessage());
    }
}

function syncUserData($pdo, $data) {
    $email = $data['email'] ?? '';
    $deviceId = $data['device_id'] ?? '';

    if (empty($email)) {
        sendResponse(false, 'Email is required');
    }

    try {
        // Get user ID
        $stmt = $pdo->prepare("SELECT id FROM geotechiex_users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            sendResponse(false, 'User not found');
        }

        // Get total credits from activated codes
        $stmt = $pdo->prepare("
            SELECT SUM(a.credits) as total_credits
            FROM activation_codes a
            JOIN payments p ON a.payment_id = p.id
            WHERE p.email = :email AND a.status IN ('used', 'active')
        ");
        $stmt->execute([':email' => $email]);
        $credits = $stmt->fetch();

        // Get total usage count (only free uses, not paid)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total_usage
            FROM usage_log
            WHERE email = :email AND credits_used = 0
        ");
        $stmt->execute([':email' => $email]);
        $usage = $stmt->fetch();

        // Get credits already used
        $stmt = $pdo->prepare("
            SELECT SUM(credits_used) as used_credits
            FROM usage_log
            WHERE email = :email AND credits_used > 0
        ");
        $stmt->execute([':email' => $email]);
        $usedCredits = $stmt->fetch();

        $totalCredits = (int)($credits['total_credits'] ?? 0);
        $usedCreditsCount = (int)($usedCredits['used_credits'] ?? 0);
        $availableCredits = $totalCredits - $usedCreditsCount;

        sendResponse(true, 'Data synced', [
            'total_credits' => max(0, $availableCredits),
            'total_usage' => (int)($usage['total_usage'] ?? 0)
        ]);

    } catch (Exception $e) {
        logError("Sync user data error: " . $e->getMessage());
        sendResponse(false, 'Sync failed');
    }
}

function checkUserUsage($pdo, $data) {
    $email = $data['email'] ?? '';

    if (empty($email)) {
        sendResponse(false, 'Email is required');
    }

    try {
        // Count total free uses (where credits_used = 0)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total_usage
            FROM usage_log
            WHERE email = :email AND credits_used = 0
        ");
        $stmt->execute([':email' => $email]);
        $usage = $stmt->fetch();

        sendResponse(true, 'Usage retrieved', [
            'total_usage' => (int)($usage['total_usage'] ?? 0)
        ]);

    } catch (Exception $e) {
        logError("Check user usage error: " . $e->getMessage());
        sendResponse(false, 'Usage check failed');
    }
}

function logUserUsage($pdo, $data) {
    $email = $data['email'] ?? '';
    $deviceId = $data['device_id'] ?? '';
    $toolName = $data['tool_name'] ?? '';
    $creditsUsed = $data['credits_used'] ?? 0;

    if (empty($email)) {
        sendResponse(false, 'Email is required');
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO usage_log (email, device_id, tool_name, action, credits_used, ip_address, user_agent, created_at)
            VALUES (:email, :device_id, :tool_name, 'tool_use', :credits_used, :ip, :user_agent, NOW())
        ");

        $stmt->execute([
            ':email' => $email,
            ':device_id' => $deviceId,
            ':tool_name' => $toolName,
            ':credits_used' => $creditsUsed,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? '',
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);

        sendResponse(true, 'Usage logged');

    } catch (Exception $e) {
        logError("Log user usage error: " . $e->getMessage());
        sendResponse(false, 'Usage logging failed');
    }
}

/**
 * Admin: Generate activation code
 */
function adminGenerateCode($pdo, $data) {
    try {
        $credits = isset($data['credits']) ? (int)$data['credits'] : 0;
        $description = isset($data['description']) ? trim($data['description']) : 'Admin Generated';
        
        if ($credits <= 0) {
            sendResponse(false, 'Invalid credit amount');
            return;
        }
        
        // Generate unique code
        $code = generateActivationCode();
        
        // Check if code already exists (very unlikely but safety check)
        $checkStmt = $pdo->prepare("SELECT id FROM activation_codes WHERE code = ?");
        $checkStmt->execute([$code]);
        
        if ($checkStmt->fetch()) {
            // Code exists, generate a new one
            $code = generateActivationCode();
        }
        
        // Insert into database
        $stmt = $pdo->prepare("
            INSERT INTO activation_codes (code, credits, description, status, created_at) 
            VALUES (?, ?, ?, 'active', NOW())
        ");
        
        $stmt->execute([$code, $credits, $description]);
        
        sendResponse(true, 'Activation code generated successfully', [
            'code' => $code,
            'credits' => $credits,
            'description' => $description
        ]);
        
    } catch (PDOException $e) {
        logError("Generate code error: " . $e->getMessage());
        sendResponse(false, 'Failed to generate activation code');
    }
}
?>
