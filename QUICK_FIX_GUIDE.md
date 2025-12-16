# 🚨 Quick Fix Guide - HTTP 500 Error & Failed to Fetch

## Problem Summary
- **Error 1:** HTTP 500 when accessing `https://www.bazzlylinks.com/geotechiex.php`
- **Error 2:** "Payment failed: Failed to fetch" when making payment

---

## 🔧 Immediate Solutions

### Solution 1: Update Database Credentials (MOST COMMON)

The HTTP 500 error is most likely caused by **incorrect database credentials**.

**Step 1:** Open your `geotechiex.php` file on the server

**Step 2:** Find lines 31-34 and update with YOUR actual database info:

```php
$config = [
    'db_host' => 'localhost',              // Usually 'localhost'
    'db_name' => 'geotechiex_payments',    // Your actual database name
    'db_user' => 'YOUR_ACTUAL_USERNAME',   // Replace with real username
    'db_pass' => 'YOUR_ACTUAL_PASSWORD',   // Replace with real password
    'paystack_secret' => 'sk_live_YOUR_SECRET_KEY_HERE'  // Replace with your actual key
];
```

**Step 3:** Save the file and test again

---

### Solution 2: Use the Production-Ready File

I created a better version with error logging. Upload this instead:

**File:** `api/geotechiex_production.php`

**Steps:**
1. Upload `geotechiex_production.php` to your server
2. Rename it to `geotechiex.php` (or update the URL in payment-api.js)
3. Update database credentials (lines 31-34)
4. Test at: `https://www.bazzlylinks.com/geotechiex.php`

This version includes:
- ✅ Better error handling
- ✅ Error logging to file
- ✅ CORS headers fixed
- ✅ More helpful error messages

---

### Solution 3: Check Error Logs

**On your server, check:**

```bash
# Look for error log file
ls -la geotechiex_errors.log

# View errors
cat geotechiex_errors.log

# Or check PHP error log
tail -f /var/log/apache2/error.log  # Ubuntu/Debian
tail -f /var/log/httpd/error_log     # CentOS/RHEL
```

Common errors and fixes:
- `"Database connection failed"` → Update credentials
- `"Call to undefined function curl_init"` → Install PHP curl: `sudo apt-get install php-curl`
- `"Permission denied"` → Fix file permissions: `chmod 644 geotechiex.php`

---

### Solution 4: Use API Tester

**Open:** `api-test.html` in your browser

This tool will:
- ✅ Test API connection
- ✅ Test database connection
- ✅ Show detailed error messages
- ✅ Help diagnose the exact problem

**How to use:**
1. Open `api-test.html` in Chrome/Firefox
2. Click "🔌 Test Connection"
3. Read the error message
4. Follow the suggested fixes

---

## 📋 Step-by-Step Fix Process

### Step 1: Verify PHP File Exists
```bash
# SSH to your server and check
ls -la /path/to/geotechiex.php
```

Should show something like: `-rw-r--r-- 1 user user 15234 Dec 16 10:30 geotechiex.php`

### Step 2: Test Direct Access

Visit in browser: `https://www.bazzlylinks.com/geotechiex.php`

**Expected results:**
- ❌ **HTTP 500** = PHP error (usually database credentials)
- ✅ **{"success":false,"message":"No action specified"}** = Working! Continue to Step 3
- ❌ **404 Not Found** = File not uploaded or wrong URL

### Step 3: Update Credentials

Edit `geotechiex.php` and change:

```php
// FROM THIS (placeholder):
$db_user = 'your_db_username';
$db_pass = 'your_db_password';

// TO THIS (your actual values):
$db_user = 'geotechiex_user';  // Your real DB username
$db_pass = 'SecurePassword123'; // Your real DB password
```

### Step 4: Test Database Connection

**Create test file:** `test_db.php`

```php
<?php
$host = 'localhost';
$db = 'geotechiex_payments';
$user = 'YOUR_USERNAME';  // Same as in geotechiex.php
$pass = 'YOUR_PASSWORD';  // Same as in geotechiex.php

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    echo "✅ Database connection successful!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>
```

Upload and visit: `https://www.bazzlylinks.com/test_db.php`

### Step 5: Verify Tables Exist

```sql
-- Login to MySQL
mysql -u YOUR_USERNAME -p

-- Check database
USE geotechiex_payments;

-- List tables (should show 4 tables)
SHOW TABLES;

-- Should output:
-- +-------------------------------+
-- | Tables_in_geotechiex_payments |
-- +-------------------------------+
-- | activation_codes              |
-- | payments                      |
-- | sync_data                     |
-- | usage_log                     |
-- +-------------------------------+
```

If tables don't exist, run: `database_setup.sql`

### Step 6: Test Payment Flow

1. Open `api-test.html`
2. Click "💳 Test Payment Init"
3. Should see success message
4. Check database: `SELECT * FROM payments;`

---

## 🔍 Common Errors & Solutions

### Error: "Failed to fetch"

**Cause:** CORS or network issue

**Solution:**
1. Ensure API URL is correct in `payment-api.js`
2. Check CORS headers in PHP (already included)
3. Verify HTTPS is working (not HTTP)
4. Try from different network

### Error: HTTP 500

**Cause:** PHP error (usually database)

**Solution:**
1. Check error log: `geotechiex_errors.log`
2. Verify database credentials
3. Test PHP version: `php -v` (need 7.4+)
4. Check MySQL is running: `systemctl status mysql`

### Error: "Database connection failed"

**Cause:** Wrong credentials or DB doesn't exist

**Solution:**
```bash
# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'geotechiex_payments';"

# Create if missing
mysql -u root -p -e "CREATE DATABASE geotechiex_payments;"

# Grant permissions
mysql -u root -p
GRANT ALL ON geotechiex_payments.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Invalid or expired activation code"

**Cause:** Code doesn't exist in database

**Solution:**
```sql
-- Insert test code
INSERT INTO activation_codes (activation_code, credits, status) 
VALUES ('GEOX-TEST-TEST-TEST', 10, 'active');

-- Test again
```

---

## ✅ Verification Checklist

After fixing, verify each step works:

- [ ] Can access PHP file (no 404)
- [ ] No HTTP 500 error
- [ ] Test action returns JSON
- [ ] Database connection works
- [ ] Can create payment record
- [ ] Can generate activation code
- [ ] Can activate code
- [ ] Credits add to localStorage

---

## 📞 Still Not Working?

### Check These:

1. **PHP Extensions:**
```bash
php -m | grep -E 'pdo|mysql|curl|json'
```

Should show: pdo, pdo_mysql, curl, json

2. **File Permissions:**
```bash
chmod 644 geotechiex.php
chown www-data:www-data geotechiex.php  # Ubuntu
chown apache:apache geotechiex.php      # CentOS
```

3. **Apache/Nginx Config:**
Ensure `.php` files are processed by PHP-FPM

4. **Firewall:**
Check if port 443 (HTTPS) is open

---

## 🎯 Quick Test Commands

Copy and run these on your server:

```bash
# Test 1: Check PHP works
echo "<?php phpinfo(); ?>" > test.php
# Visit: https://www.bazzlylinks.com/test.php

# Test 2: Check database connection
mysql -u YOUR_USER -p geotechiex_payments -e "SELECT COUNT(*) FROM payments;"

# Test 3: Check file exists
ls -la geotechiex.php

# Test 4: Check logs
tail -20 geotechiex_errors.log
```

---

## 📧 Contact Support

If still having issues, provide:

1. Error message from `api-test.html`
2. Contents of `geotechiex_errors.log`
3. PHP version: `php -v`
4. MySQL version: `mysql --version`
5. Screenshot of the error

---

## 🚀 Once Fixed

1. Test payment with test card
2. Verify activation code generated
3. Check credits added
4. Switch to live Paystack keys
5. Test with real small payment (₦100)

**Test Cards (Paystack):**
- Success: `4084 0840 8408 4081` | CVV: `408` | PIN: `0000`
- Declined: `5060 6666 6666 6666 4` | CVV: `123` | PIN: `0000`

---

**Last Updated:** December 16, 2025  
**Status:** Ready to fix your issues! 💪
