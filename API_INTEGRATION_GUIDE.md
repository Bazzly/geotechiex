# GeoTechieX Payment API Integration Guide

## Overview
Complete integration guide for connecting GeoTechieX tools to Paystack payment gateway and PHP API backend for secure payment processing and activation code management.

---

## 📁 Files Created

### 1. **js/payment-api.js** (Client-Side)
JavaScript class that handles all payment and API interactions.

**Key Features:**
- Paystack payment initialization
- Payment verification
- Activation code management
- Credit balance tracking
- Data synchronization with server
- Local storage management

### 2. **api/geotechiex.php** (Server-Side)
PHP API endpoint that handles backend operations.

**Location:** Upload to `www.bazzlylinks.com/geotechiex.php`

---

## 🗄️ Database Setup

### Required Tables

```sql
-- 1. Payments Table
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
    INDEX idx_reference (reference)
);

-- 2. Activation Codes Table
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
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_code (activation_code)
);

-- 3. Usage Log Table
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
    INDEX idx_created (created_at)
);

-- 4. Sync Data Table
CREATE TABLE sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50),
    data_content LONGTEXT,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_device (email, device_id)
);
```

---

## 🔑 Configuration Steps

### Step 1: Get Paystack API Keys

1. Create account at https://paystack.com
2. Go to Settings → API Keys & Webhooks
3. Get your **Public Key** and **Secret Key**
4. Test keys start with `pk_test_` and `sk_test_`
5. Live keys start with `pk_live_` and `sk_live_`

### Step 2: Update Configuration Files

#### In `js/payment-api.js` (Line 11):
```javascript
this.paystackPublicKey = 'pk_test_YOUR_ACTUAL_PUBLIC_KEY';
```

#### In `api/geotechiex.php` (Lines 97-101):
```php
$db_host = 'localhost';
$db_name = 'geotechiex_payments';
$db_user = 'your_actual_db_username';
$db_pass = 'your_actual_db_password';

$paystack_secret_key = 'sk_test_YOUR_ACTUAL_SECRET_KEY';
```

### Step 3: Upload PHP API

1. Upload `api/geotechiex.php` to your server
2. Place it at: `https://www.bazzlylinks.com/geotechiex.php`
3. Ensure PHP 7.4+ with PDO MySQL extension
4. Set file permissions: `chmod 644 geotechiex.php`

### Step 4: Test Database Connection

Create test script `test_db.php`:
```php
<?php
$db_host = 'localhost';
$db_name = 'geotechiex_payments';
$db_user = 'your_username';
$db_pass = 'your_password';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    echo "✅ Database connection successful!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>
```

---

## 📡 API Endpoints

### 1. **Initiate Payment**
```javascript
POST: https://www.bazzlylinks.com/geotechiex.php

{
    "action": "initiate_payment",
    "reference": "GEOX-1234567890-123456",
    "email": "customer@example.com",
    "customerName": "John Doe",
    "phone": "+234XXXXXXXXXX",
    "amount": 500,
    "credits": 10,
    "packageName": "Basic Package"
}

Response:
{
    "success": true,
    "message": "Payment initiated",
    "reference": "GEOX-1234567890-123456"
}
```

### 2. **Verify Payment**
```javascript
POST: https://www.bazzlylinks.com/geotechiex.php

{
    "action": "verify_payment",
    "reference": "GEOX-1234567890-123456",
    "timestamp": "2025-12-16T10:30:00Z"
}

Response:
{
    "success": true,
    "message": "Payment verified successfully",
    "activation_code": "GEOX-ABCD-EFGH-IJKL",
    "credits": 10,
    "amount": 500,
    "reference": "GEOX-1234567890-123456"
}
```

### 3. **Activate Code**
```javascript
POST: https://www.bazzlylinks.com/geotechiex.php

{
    "action": "activate_code",
    "activation_code": "GEOX-ABCD-EFGH-IJKL",
    "device_id": "DEV-1234567890-abc123",
    "timestamp": "2025-12-16T10:35:00Z"
}

Response:
{
    "success": true,
    "message": "Activation successful",
    "credits": 10,
    "activation_code": "GEOX-ABCD-EFGH-IJKL"
}
```

### 4. **Check Code Status**
```javascript
POST: https://www.bazzlylinks.com/geotechiex.php

{
    "action": "check_code_status",
    "activation_code": "GEOX-ABCD-EFGH-IJKL"
}

Response:
{
    "success": true,
    "status": "active",
    "credits": 10,
    "times_used": 0,
    "max_uses": 1,
    "generated_at": "2025-12-16 10:30:00"
}
```

### 5. **Get Payment History**
```javascript
POST: https://www.bazzlylinks.com/geotechiex.php

{
    "action": "get_payment_history",
    "email": "customer@example.com",
    "device_id": "DEV-1234567890-abc123"
}

Response:
{
    "success": true,
    "payments": [
        {
            "id": 1,
            "reference": "GEOX-1234567890-123456",
            "amount": 500,
            "credits": 10,
            "status": "completed",
            "activation_code": "GEOX-ABCD-EFGH-IJKL",
            "created_at": "2025-12-16 10:30:00"
        }
    ]
}
```

### 6. **Sync Data**
```javascript
POST: https://www.bazzlylinks.com/geotechiex.php

{
    "action": "sync_data",
    "email": "customer@example.com",
    "device_id": "DEV-1234567890-abc123",
    "local_data": { ... }
}

Response:
{
    "success": true,
    "server_data": { ... },
    "total_credits": 25
}
```

---

## 🔄 Payment Flow

### Complete User Journey

```
1. User visits donation.html
   ↓
2. Selects package (Basic ₦500 or Premium ₦1000)
   ↓
3. Clicks "Select Package"
   ↓
4. Modal appears requesting:
   - Email
   - Full Name
   - Phone (optional)
   ↓
5. Clicks "Pay with Paystack"
   ↓
6. payment-api.js calls initiatePayment()
   ↓
7. API saves payment record (status: pending)
   ↓
8. Paystack popup opens
   ↓
9. User completes payment
   ↓
10. Paystack callback triggers verifyPayment()
    ↓
11. API verifies with Paystack servers
    ↓
12. API generates activation code
    ↓
13. API updates payment (status: completed)
    ↓
14. API stores activation code in database
    ↓
15. Success modal shows activation code
    ↓
16. Credits automatically added to localStorage
    ↓
17. User redirected to tools
```

---

## 💳 Activation Code Format

**Format:** `GEOX-XXXX-XXXX-XXXX`

**Example:** `GEOX-A3K7-M9P2-Q5R8`

**Characteristics:**
- Always starts with `GEOX-`
- 4 segments of 4 characters each
- Uses uppercase letters and numbers (excludes: 0, O, I, 1 for clarity)
- Unique per payment
- Single use (configurable to multi-use)

---

## 🛡️ Security Features

### Client-Side
1. **Device ID**: Unique identifier prevents sharing
2. **Email Validation**: Ensures valid contact
3. **Local Storage**: Encrypted credit balance
4. **HTTPS Only**: Secure communication

### Server-Side
1. **Paystack Verification**: Double-check with Paystack API
2. **SQL Injection Protection**: Prepared statements
3. **CORS Headers**: Controlled access
4. **Usage Logging**: Track all activities
5. **Code Expiration**: Optional time-limited codes
6. **Max Uses**: Prevent unlimited code sharing

---

## 🧪 Testing

### Test Mode Setup
```javascript
// payment-api.js
this.paystackPublicKey = 'pk_test_xxxxxxxxxxxx';
this.apiEndpoint = 'http://localhost/geotechiex.php'; // Local testing
```

### Test Cards (Paystack)
```
Success: 4084 0840 8408 4081 | CVV: 408 | Expiry: 12/30 | PIN: 0000
Declined: 5060 6666 6666 6666 4 | CVV: 123 | Expiry: 12/30 | PIN: 0000
```

### Test Activation Code
```
GEOX-TEST-TEST-TEST
```

---

## 📊 Data Structure Examples

### localStorage Structure

```javascript
// geotechiex_global_credits
{
    "credits": 25,
    "donated": true,
    "lastDonation": "2025-12-16T10:30:00Z",
    "totalDonations": 25
}

// geotechiex_payment_data
{
    "payments": [
        {
            "reference": "GEOX-1234567890-123456",
            "activation_code": "GEOX-ABCD-EFGH-IJKL",
            "credits": 10,
            "amount": 500,
            "stored_at": "2025-12-16T10:30:00Z"
        }
    ],
    "activations": [
        {
            "activation_code": "GEOX-ABCD-EFGH-IJKL",
            "credits": 10,
            "activated_at": "2025-12-16T10:35:00Z"
        }
    ],
    "created_at": "2025-12-15T08:00:00Z"
}

// geotechiex_device_id
"DEV-1734345600-xyz789abc"
```

---

## 🔧 Troubleshooting

### Issue: Payment not verifying
**Solution:**
1. Check Paystack secret key is correct
2. Verify API endpoint is accessible
3. Check database connection
4. Review PHP error logs

### Issue: Activation code not working
**Solution:**
1. Check code format (GEOX-XXXX-XXXX-XXXX)
2. Verify code exists in database
3. Check if code already used
4. Verify device_id tracking

### Issue: Credits not adding
**Solution:**
1. Check localStorage permissions
2. Verify usage-tracker.js loaded
3. Check browser console for errors
4. Clear cache and retry

### Issue: CORS errors
**Solution:**
1. Add CORS headers in PHP
2. Check API endpoint URL
3. Verify HTTPS on production
4. Enable credentials if needed

---

## 🚀 Production Checklist

- [ ] Replace test Paystack keys with live keys
- [ ] Update API endpoint to production URL
- [ ] Create production database
- [ ] Run all database migrations
- [ ] Test payment with real card (small amount)
- [ ] Verify email notifications work
- [ ] Set up SSL certificate (HTTPS)
- [ ] Enable error logging
- [ ] Set up database backups
- [ ] Test activation code generation
- [ ] Verify credit addition works
- [ ] Test on multiple devices
- [ ] Update contact information
- [ ] Test recovery/sync feature
- [ ] Monitor first 10 transactions

---

## 📞 Support

For assistance:
- **Email**: support@geotechiex.com
- **WhatsApp**: +234 XXX XXX XXXX
- **Documentation**: Update this file as needed

---

## 📝 License & Credits

**Developed for:** GeoTechieX Platform  
**Version:** 1.0.0  
**Last Updated:** December 16, 2025  
**Payment Provider:** Paystack (Nigeria)

---

**Note:** Always test thoroughly in development before deploying to production!
