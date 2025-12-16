# 🔧 REGISTRATION ERROR FIX - Step by Step

## Current Status: ❌ Registration Failed

You're seeing **"Registration failed. Please try again"** because the database tables needed for email tracking don't exist yet.

---

## 🎯 Quick Fix (Choose ONE method)

### **Method 1: Run SQL File (Recommended)**

Open your terminal and run:

```bash
mysql -u YOUR_DB_USERNAME -p geotechiex_payments < api/complete_setup.sql
```

**Replace `YOUR_DB_USERNAME`** with your actual MySQL username (e.g., `root` or your hosting username).

When prompted, enter your MySQL password.

✅ **Success message:** You'll see "Database setup completed successfully!"

---

### **Method 2: Using phpMyAdmin**

1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Open **phpMyAdmin**
3. Select database: `geotechiex_payments`
4. Click **Import** tab
5. Choose file: `api/complete_setup.sql`
6. Click **Go**

✅ **Success message:** "Import has been successfully finished"

---

### **Method 3: Manual SQL Copy-Paste**

If you can't upload files:

1. Open `api/complete_setup.sql` in a text editor
2. Copy ALL the SQL code
3. In phpMyAdmin, select `geotechiex_payments` database
4. Click **SQL** tab
5. Paste the code
6. Click **Go**

---

## 🧪 Verify It Worked

### **Option A: Use Diagnostic Tool**

1. Open **`check-registration.html`** in your browser
2. Look at the status checks:
   - ✅ API Connection - should be green
   - ✅ Database Connection - should be green
   - ✅ Registration Endpoint - should be green
   - ✅ User Table - should be green
   - ✅ Device Table - should be green

3. Enter your email and click "Test Registration"
4. Should see: **✅ Registration Successful!**

### **Option B: Check Database Directly**

Run this SQL query:

```sql
USE geotechiex_payments;
SHOW TABLES;
```

**You should see 6 tables:**
- activation_codes
- geotechiex_users ← **Must exist!**
- payments
- sync_data
- usage_log
- user_devices ← **Must exist!**

---

## 🚨 Still Not Working?

### **Problem 1: "Access denied for user"**
**Solution:** Wrong MySQL credentials. Double-check your username/password.

### **Problem 2: "Database 'geotechiex_payments' doesn't exist"**
**Solution:** Create the database first:
```sql
CREATE DATABASE geotechiex_payments;
```
Then run the setup SQL again.

### **Problem 3: "Invalid action: register_user"**
**Solution:** Server has old PHP file. You need to:
1. Open `api/geotechiex_production.php`
2. Add your actual Paystack keys:
   - Line 34: Replace `sk_live_YOUR_SECRET_KEY_HERE` with your actual secret key
3. Upload to your server as `geotechiex.php`

### **Problem 4: Registration works in diagnostic but not in actual tools**
**Solution:** Clear browser data:
1. Clear cache: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Clear localStorage: Open Console (F12) and run:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

---

## 📋 Complete Checklist

Before testing again, verify:

- [ ] Ran `api/complete_setup.sql` on database
- [ ] Database has 6 tables (especially `geotechiex_users` and `user_devices`)
- [ ] Uploaded updated `geotechiex_production.php` to server as `geotechiex.php`
- [ ] Added actual Paystack keys to the PHP file
- [ ] Cleared browser cache and localStorage
- [ ] Diagnostic tool (`check-registration.html`) shows all green

---

## 🎉 Success Indicators

Once everything is working correctly:

1. **First time visiting any tool:**
   - Email modal appears automatically
   - Enter your email
   - Modal closes
   - You can use the tool (10 free uses)

2. **Subsequent visits:**
   - No email modal (email remembered)
   - Usage counter shows remaining uses
   - Credits sync across all tools

3. **After purchasing credits:**
   - Enter activation code
   - Credits added to account
   - Works on all tools
   - Syncs across devices with same email

---

## 📞 Need More Help?

Run the diagnostic tool first: **`check-registration.html`**

It will tell you EXACTLY what's wrong with detailed error messages and fix instructions.

---

## 🔗 Related Files

- **`api/complete_setup.sql`** - Database setup (run this)
- **`api/geotechiex_production.php`** - Updated API (upload to server)
- **`check-registration.html`** - Diagnostic tool (open in browser)
- **`user-tracking-test.html`** - Simple registration test
- **`REGISTRATION_FIX.md`** - Detailed troubleshooting

---

**Last Updated:** December 16, 2025
