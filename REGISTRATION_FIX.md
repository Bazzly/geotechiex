# Database Setup Instructions

## Problem
Registration is failing with "Registration failed. Please try again" because the required database tables (`geotechiex_users` and `user_devices`) don't exist yet.

## Solution

### Step 1: Run Complete Database Setup

Open your terminal and run this command:

```bash
mysql -u YOUR_DB_USERNAME -p geotechiex_payments < api/complete_setup.sql
```

Replace `YOUR_DB_USERNAME` with your actual MySQL username.

**What this does:**
- Creates all 6 required tables:
  1. `payments` - payment records
  2. `activation_codes` - activation codes
  3. `usage_log` - usage tracking
  4. `sync_data` - data synchronization
  5. `geotechiex_users` - user email registry (NEW - needed for registration)
  6. `user_devices` - device tracking per user (NEW - needed for registration)
- Creates indexes for performance
- Adds test activation code
- Verifies everything is set up correctly

### Step 2: Verify Tables Created

After running the SQL file, check if tables exist:

```sql
USE geotechiex_payments;
SHOW TABLES;
```

You should see **6 tables**:
- activation_codes
- geotechiex_users ← **IMPORTANT**
- payments
- sync_data
- usage_log
- user_devices ← **IMPORTANT**

### Step 3: Test Registration

1. Open `user-tracking-test.html` in your browser
2. Enter any email address (e.g., your actual email)
3. Click "Test Registration"
4. Should see: ✅ **Registration Successful!**

### Step 4: Upload Updated PHP File

**IMPORTANT:** The file on your server (`www.bazzlylinks.com/geotechiex.php`) needs to be replaced with the updated version:

```bash
# Upload api/geotechiex_production.php to your server as geotechiex.php
# Remember to add your actual Paystack keys before uploading:
# Line 34: 'paystack_secret' => 'sk_live_YOUR_ACTUAL_SECRET_KEY'
```

### Step 5: Test on Live Site

1. Clear browser cache: `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Clear localStorage: Open browser console and run: `localStorage.clear()`
3. Visit any tool (e.g., compass.html)
4. Email modal should appear
5. Enter your email
6. Should register successfully!

## Troubleshooting

### Error: "Table 'geotechiex_payments.geotechiex_users' doesn't exist"
**Solution:** You didn't run the SQL setup file. Go back to Step 1.

### Error: "Invalid action: register_user"
**Solution:** Server has old PHP file. Go to Step 4 and upload the new file.

### Error: "Access denied for user"
**Solution:** Wrong database credentials. Check your MySQL username/password.

### Registration works locally but not on live site
**Solution:** 
1. Make sure you uploaded the updated PHP file to the server
2. Make sure you added your actual Paystack keys to the PHP file
3. Run the SQL setup on your LIVE database (not local)

## Files You Need

1. **api/complete_setup.sql** - Run this on your database (ONCE)
2. **api/geotechiex_production.php** - Upload to server as geotechiex.php (with your keys)
3. **js/usage-tracker.js** - Already in your site (handles registration)

## Quick Check Command

Run this to verify everything:

```sql
SELECT 
    'geotechiex_users' as table_name, 
    COUNT(*) as records 
FROM geotechiex_users
UNION ALL
SELECT 
    'user_devices', 
    COUNT(*) 
FROM user_devices;
```

If this runs without errors, you're good to go! 🎉

## Need Help?

If registration still fails:
1. Check the error log: `api/geotechiex_errors.log` on your server
2. Use the diagnostic test page: `user-tracking-test.html`
3. Verify API endpoint is working: Open browser console and check for errors
