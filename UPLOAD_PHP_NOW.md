# 🚨 URGENT: Upload PHP File to Server

## The Problem

Your server at `www.bazzlylinks.com/geotechiex.php` is running the **OLD version** of the PHP file that doesn't have the registration endpoints.

That's why you're getting: **"Invalid action: register_user"**

---

## ✅ Solution: Upload Updated PHP File

### Step 1: Edit the PHP File

Open: `api/geotechiex_production.php`

Find lines 29-34 and **UPDATE YOUR CREDENTIALS:**

```php
$config = [
    'db_host' => 'localhost',                          // Usually stays as 'localhost'
    'db_name' => 'geotechiex_payments',                // Your database name
    'db_user' => 'YOUR_ACTUAL_DB_USERNAME',           // ← CHANGE THIS
    'db_pass' => 'YOUR_ACTUAL_DB_PASSWORD',           // ← CHANGE THIS
    'paystack_secret' => 'sk_live_YOUR_ACTUAL_KEY',   // ← CHANGE THIS
    'debug_mode' => true
];
```

**Replace:**
- `YOUR_ACTUAL_DB_USERNAME` → Your MySQL username
- `YOUR_ACTUAL_DB_PASSWORD` → Your MySQL password  
- `YOUR_ACTUAL_KEY` → Your Paystack secret key (`sk_live_...`)

### Step 2: Upload to Server

**Method A - FTP/SFTP (FileZilla, Cyberduck, etc.):**
1. Connect to your server
2. Navigate to where `geotechiex.php` is located
3. Upload `api/geotechiex_production.php`
4. **Rename it to:** `geotechiex.php` (replace existing file)

**Method B - cPanel File Manager:**
1. Log into cPanel
2. Open File Manager
3. Navigate to your website folder (where geotechiex.php is)
4. Upload `api/geotechiex_production.php`
5. Rename it to `geotechiex.php`
6. Overwrite the old file when asked

**Method C - Command Line (SSH):**
```bash
# Upload the file (from your local machine)
scp api/geotechiex_production.php user@yourserver.com:/path/to/webroot/geotechiex.php

# Or if you're already on the server
mv geotechiex_production.php geotechiex.php
```

---

## 🧪 Test After Upload

1. Open `check-registration.html` in your browser
2. All status checks should now be green ✅
3. Click "Test Registration"
4. Should see: **✅ Registration Successful!**

---

## 🔍 How to Find Your Credentials

### Database Username/Password:
- **cPanel:** MySQL Databases → Current Users
- **Plesk:** Databases → User Management
- Check your hosting welcome email

### Paystack Secret Key:
1. Go to: https://dashboard.paystack.com
2. Click Settings → API Keys & Webhooks
3. Copy your **Live Secret Key** (starts with `sk_live_`)

---

## ⚠️ Important Notes

1. **Keep the updated file safe** - Save a backup of `geotechiex_production.php` with your actual credentials somewhere secure
2. **Don't commit secrets to GitHub** - That's why we use placeholder values
3. **File name matters** - Must be named exactly `geotechiex.php` on server
4. **File permissions** - Set to 644: `chmod 644 geotechiex.php`

---

## 🚨 Quick Checklist

Before testing again:

- [ ] Edited `api/geotechiex_production.php` with actual credentials
- [ ] Uploaded to server as `geotechiex.php`
- [ ] File is in the correct location (same as old file)
- [ ] File permissions set to 644
- [ ] Database tables created (ran `complete_setup.sql`)

---

## 🎯 Expected Result

**Before upload:**
```json
{"success":false,"message":"Invalid action: register_user"}
```

**After upload:**
```json
{"success":true,"message":"User registered successfully","user_id":1}
```

---

## 📞 Still Getting Same Error?

1. **Check file location** - Is it at: `www.bazzlylinks.com/geotechiex.php`?
2. **Clear browser cache** - Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
3. **Check error logs** - Look at `geotechiex_errors.log` on server
4. **Verify endpoint** - Visit: `https://www.bazzlylinks.com/geotechiex.php` directly

---

**The file is ready to upload - it just needs your credentials added!** 🚀
