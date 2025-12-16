# 🚀 Quick Setup Checklist - GeoTechieX Payment Integration

## Pre-requisites
- [ ] PHP 7.4 or higher installed
- [ ] MySQL 5.7 or higher installed
- [ ] Paystack account created (https://paystack.com)
- [ ] Web hosting with PHP & MySQL support
- [ ] SSL certificate (HTTPS) for production

---

## Step 1: Paystack Account Setup (10 minutes)

1. **Create Paystack Account**
   - [ ] Visit https://paystack.com
   - [ ] Sign up with business email
   - [ ] Verify email address
   - [ ] Complete business profile

2. **Get API Keys**
   - [ ] Login to Paystack Dashboard
   - [ ] Go to Settings → API Keys & Webhooks
   - [ ] Copy **Public Key** (starts with `pk_test_` or `pk_live_`)
   - [ ] Copy **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - [ ] Save keys securely (never commit to git!)

3. **Test Mode**
   - [ ] Start with test keys for development
   - [ ] Switch to live keys only when ready for production

---

## Step 2: Database Setup (15 minutes)

1. **Create Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE geotechiex_payments;
   exit;
   ```

2. **Run SQL Script**
   ```bash
   mysql -u root -p geotechiex_payments < api/database_setup.sql
   ```

3. **Verify Tables Created**
   ```bash
   mysql -u root -p geotechiex_payments
   SHOW TABLES;
   ```
   Should show: `payments`, `activation_codes`, `usage_log`, `sync_data`

4. **Create Database User (Production)**
   ```sql
   CREATE USER 'geotechiex_user'@'localhost' IDENTIFIED BY 'secure_password_here';
   GRANT ALL PRIVILEGES ON geotechiex_payments.* TO 'geotechiex_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

## Step 3: Configure PHP API (10 minutes)

1. **Edit api/geotechiex.php**
   
   Find lines 97-101 and update:
   ```php
   $db_host = 'localhost';              // Your database host
   $db_name = 'geotechiex_payments';    // Database name
   $db_user = 'geotechiex_user';        // Database username
   $db_pass = 'your_secure_password';   // Database password
   
   $paystack_secret_key = 'sk_test_YOUR_SECRET_KEY'; // Your Paystack secret key
   ```

2. **Upload to Server**
   - [ ] Upload `api/geotechiex.php` to server
   - [ ] Place at: `https://www.bazzlylinks.com/geotechiex.php`
   - [ ] Set file permissions: `chmod 644 geotechiex.php`

3. **Test API Connection**
   - [ ] Visit: `https://www.bazzlylinks.com/geotechiex.php`
   - [ ] Should show: `{"success":false,"message":"Invalid action"}`
   - [ ] If you see this, API is working! ✅

---

## Step 4: Configure JavaScript (5 minutes)

1. **Edit js/payment-api.js**
   
   Find line 8 and update:
   ```javascript
   this.apiEndpoint = 'https://www.bazzlylinks.com/geotechiex.php';
   ```

   Find line 11 and update:
   ```javascript
   this.paystackPublicKey = 'pk_test_YOUR_PUBLIC_KEY'; // Your Paystack public key
   ```

2. **Verify Files Linked**
   Check that donation.html includes:
   ```html
   <script src="js/usage-tracker.js"></script>
   <script src="js/payment-api.js"></script>
   ```

---

## Step 5: Test Payment Flow (20 minutes)

### Test in Development Mode

1. **Test Database Connection**
   - [ ] Create file: `test_db.php`
   ```php
   <?php
   $pdo = new PDO("mysql:host=localhost;dbname=geotechiex_payments", "user", "pass");
   echo "✅ Connected!";
   ?>
   ```
   - [ ] Visit in browser, should see "✅ Connected!"

2. **Test Payment Flow**
   - [ ] Open `donation.html` in browser
   - [ ] Click "Select Package" on Basic Package
   - [ ] Enter test email: `test@example.com`
   - [ ] Enter test name: `Test User`
   - [ ] Click "Pay with Paystack"

3. **Use Paystack Test Cards**
   
   **Success Card:**
   - Card Number: `4084 0840 8408 4081`
   - CVV: `408`
   - Expiry: `12/30`
   - PIN: `0000`
   
   **Declined Card:**
   - Card Number: `5060 6666 6666 6666 4`
   - CVV: `123`
   - Expiry: `12/30`
   - PIN: `0000`

4. **Verify in Database**
   ```sql
   -- Check payment was created
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
   
   -- Check activation code was generated
   SELECT * FROM activation_codes ORDER BY generated_at DESC LIMIT 1;
   ```

5. **Test Activation Code**
   - [ ] Copy activation code from success modal
   - [ ] Refresh page
   - [ ] Click "Enter Activation Code"
   - [ ] Paste code and activate
   - [ ] Should see success message
   - [ ] Check localStorage has credits

---

## Step 6: Production Deployment (30 minutes)

### Switch to Live Mode

1. **Update Paystack Keys**
   - [ ] Replace `pk_test_` with `pk_live_` in `payment-api.js`
   - [ ] Replace `sk_test_` with `sk_live_` in `geotechiex.php`

2. **Enable HTTPS**
   - [ ] Install SSL certificate on domain
   - [ ] Force HTTPS redirects
   - [ ] Update all URLs to use `https://`

3. **Security Hardening**
   - [ ] Change database password to strong password
   - [ ] Restrict database user permissions
   - [ ] Enable PHP error logging (not display)
   - [ ] Set up firewall rules
   - [ ] Enable CORS only for your domain

4. **Configure Paystack Webhook (Optional)**
   - [ ] Go to Paystack Settings → API Keys & Webhooks
   - [ ] Add webhook URL: `https://www.bazzlylinks.com/webhook.php`
   - [ ] Save webhook secret key

5. **Test Small Transaction**
   - [ ] Make real payment with small amount (₦100)
   - [ ] Verify payment completes
   - [ ] Check activation code received
   - [ ] Verify credits added correctly
   - [ ] Test activation on tool

---

## Step 7: Monitoring & Maintenance

### Daily Checks
- [ ] Monitor payment success rate
- [ ] Check for failed transactions
- [ ] Review error logs

### Weekly Tasks
- [ ] Backup database
   ```bash
   mysqldump -u user -p geotechiex_payments > backup_$(date +%Y%m%d).sql
   ```
- [ ] Review usage statistics
- [ ] Check for suspicious activity

### Monthly Tasks
- [ ] Optimize database tables
   ```sql
   OPTIMIZE TABLE payments, activation_codes, usage_log, sync_data;
   ```
- [ ] Archive old logs
- [ ] Review and update pricing

---

## Troubleshooting Guide

### Problem: "Database connection failed"
**Solutions:**
1. Check database credentials in `geotechiex.php`
2. Verify MySQL service is running
3. Check database user has correct permissions
4. Ensure database name exists

### Problem: "Payment verification failed"
**Solutions:**
1. Verify Paystack secret key is correct
2. Check API endpoint is accessible
3. Review Paystack dashboard for transaction
4. Check server has curl extension enabled

### Problem: "Activation code not working"
**Solutions:**
1. Verify code format: `GEOX-XXXX-XXXX-XXXX`
2. Check code exists in database
3. Verify code status is 'active'
4. Check if code already used (times_used < max_uses)

### Problem: "CORS errors"
**Solutions:**
1. Ensure CORS headers in PHP file
2. Check API endpoint URL is correct
3. Verify domain is allowed in CORS policy
4. Use HTTPS for all requests

### Problem: "Credits not adding"
**Solutions:**
1. Check browser localStorage permissions
2. Verify `usage-tracker.js` is loaded
3. Check browser console for JavaScript errors
4. Clear browser cache and retry

---

## Support Contacts

**Technical Support:**
- Email: support@geotechiex.com
- WhatsApp: +234 XXX XXX XXXX

**Paystack Support:**
- Email: support@paystack.com
- Phone: +234 1 888 9800

**Emergency:**
- Database: Contact your hosting provider
- SSL Issues: Contact domain registrar

---

## Quick Reference

### Important URLs
- Production API: `https://www.bazzlylinks.com/geotechiex.php`
- Donation Page: `https://yoursite.com/donation.html`
- Paystack Dashboard: `https://dashboard.paystack.com`

### Test Credentials
- Test Email: `test@example.com`
- Test Card: `4084 0840 8408 4081`
- Test Code: `GEOX-TEST-TEST-TEST`

### Package Pricing
- Basic Package: ₦500 = 10 credits
- Premium Package: ₦1,000 = 25 credits

---

## Completion Checklist

### Development ✓
- [ ] Database created and tables set up
- [ ] PHP API configured and uploaded
- [ ] JavaScript files configured
- [ ] Test payment completed successfully
- [ ] Activation code tested and working
- [ ] Credits adding to localStorage

### Production ✓
- [ ] Live Paystack keys configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Security measures implemented
- [ ] Real transaction tested
- [ ] Monitoring set up
- [ ] Backup system configured
- [ ] Documentation updated
- [ ] Team trained on system

---

## Success! 🎉

If all boxes are checked, your payment system is ready to use!

**Next Steps:**
1. Update bank details in donation page
2. Customize email notifications
3. Add more payment packages if needed
4. Set up automated backups
5. Monitor first 10 transactions closely

**Remember:**
- Start with test mode
- Test thoroughly before going live
- Monitor regularly
- Keep backups
- Update security regularly

---

**Last Updated:** December 16, 2025  
**Version:** 1.0.0  
**Status:** Ready for Production ✅
