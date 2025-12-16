# User Email Tracking System - Setup Guide

## Overview

The updated credit system now requires users to provide their email address on first use. This prevents credit reset abuse by tracking usage server-side per email address.

---

## 🎯 Key Changes

### What Changed:

1. **Email Collection Modal** - Shows on first tool use
2. **Server-Side Tracking** - Usage tracked by email in database
3. **Refresh-Proof** - Cannot get new credits by refreshing
4. **Cross-Device Sync** - Credits sync across devices using same email
5. **Device Tracking** - Multiple devices per user tracked

### User Flow:

1. User opens any tool for the first time
2. Modal appears requesting email address
3. Email stored in database + localStorage
4. Every action logged to server with email
5. Free limit checked server-side (10 uses per email)
6. After 10 uses, must purchase credits
7. Credits sync across all devices

---

## 📊 New Database Tables

### 1. Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_free_uses INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE
);
```

**Purpose**: Store registered user emails

### 2. User Devices Table

```sql
CREATE TABLE user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Purpose**: Track devices per user

### 3. Modified Usage Log

- Email column now **required** (NOT NULL)
- Better indexing for email lookups
- Tracks both free and paid usage

---

## 🚀 Installation Steps

### Step 1: Update Database

```bash
mysql -u YOUR_USERNAME -p geotechiex_payments < api/add_user_tracking.sql
```

This creates:
- `users` table
- `user_devices` table
- `user_stats` view
- Required indexes

### Step 2: Upload Updated Files

Upload these files to your server:

1. **js/usage-tracker.js** (updated with email collection)
2. **api/geotechiex_production.php** (new user tracking endpoints)

Replace the existing `geotechiex.php` on your server with the updated `geotechiex_production.php`.

### Step 3: Clear Browser Cache (Testing Only)

For testing, users should clear localStorage:

```javascript
// In browser console
localStorage.clear();
```

Then refresh to see email collection modal.

---

## 🔌 New API Endpoints

### 1. Register User

**Action**: `register_user`

**Request**:
```json
{
    "action": "register_user",
    "email": "user@example.com",
    "device_id": "device_123456",
    "timestamp": "2025-12-16T10:00:00Z"
}
```

**Response**:
```json
{
    "success": true,
    "message": "User registered successfully",
    "user_id": 123
}
```

### 2. Sync User Data

**Action**: `sync_user_data`

**Request**:
```json
{
    "action": "sync_user_data",
    "email": "user@example.com",
    "device_id": "device_123456"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Data synced",
    "total_credits": 25,
    "total_usage": 8
}
```

### 3. Check User Usage

**Action**: `check_user_usage`

**Request**:
```json
{
    "action": "check_user_usage",
    "email": "user@example.com"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Usage retrieved",
    "total_usage": 8
}
```

### 4. Log Usage

**Action**: `log_usage`

**Request**:
```json
{
    "action": "log_usage",
    "email": "user@example.com",
    "device_id": "device_123456",
    "tool_name": "polygon_creator",
    "credits_used": 0,
    "timestamp": "2025-12-16T10:00:00Z"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Usage logged"
}
```

---

## 🎨 Email Collection Modal

The modal appears automatically on first tool use:

**Features**:
- Professional design
- Email validation
- Privacy policy checkbox
- Explains why email is needed
- Cannot be closed without entering email
- Shows on every tool until email provided

**Design**:
- Tailwind CSS styling
- Responsive layout
- Smooth animations
- User-friendly messages

---

## 🔐 Privacy & Security

### Data Stored:

- **Email address** (required)
- **Device ID** (auto-generated)
- **Usage timestamps**
- **Tool usage history**
- **Credit balance**

### Privacy Features:

- Email never shared with third parties
- Used only for usage tracking
- Stored securely in database
- Can be deleted on request
- No marketing emails

### User Consent:

- Privacy policy checkbox required
- Clear explanation of data usage
- Transparent about tracking purpose

---

## 📊 Admin Dashboard Updates

The admin dashboard now shows:

### User Statistics:
- Total registered users
- Active users (last 30 days)
- User email list
- Device count per user
- Usage history per user

### New Queries:

```sql
-- Get all users with usage stats
SELECT * FROM user_stats;

-- Get users by usage
SELECT email, free_uses, paid_uses 
FROM user_stats 
ORDER BY free_uses + paid_uses DESC;

-- Get users who hit free limit
SELECT email, free_uses 
FROM user_stats 
WHERE free_uses >= 10;

-- Get multi-device users
SELECT email, device_count 
FROM user_stats 
WHERE device_count > 1;
```

---

## 🧪 Testing Checklist

### Test Email Collection:

- [ ] Clear localStorage
- [ ] Open any tool
- [ ] Email modal appears
- [ ] Enter email and submit
- [ ] Modal closes
- [ ] Tool functions normally
- [ ] Email stored in database

### Test Usage Tracking:

- [ ] Use tool multiple times
- [ ] Check `usage_log` table
- [ ] Verify email logged correctly
- [ ] Check `check_user_usage` returns correct count
- [ ] Verify cannot exceed 10 free uses

### Test Refresh Protection:

- [ ] Use tool 5 times
- [ ] Refresh browser
- [ ] Clear localStorage (simulate cache clear)
- [ ] Re-enter same email
- [ ] Should have 5 remaining uses (not 10)
- [ ] Usage synced from server

### Test Cross-Device:

- [ ] Register with email on Device A
- [ ] Use tool 5 times
- [ ] Open tool on Device B (different browser)
- [ ] Enter same email
- [ ] Should show 5 remaining uses
- [ ] Both devices tracked in `user_devices`

---

## 🐛 Troubleshooting

### Modal Doesn't Appear

**Check**:
- `js/usage-tracker.js` loaded correctly
- No JavaScript errors in console
- localStorage not already set

**Fix**:
```javascript
localStorage.removeItem('geotechiex_user_email');
```

### Email Not Saved

**Check**:
- Database connection working
- `users` table exists
- API endpoint responding

**Test**:
```bash
curl -X POST https://www.bazzlylinks.com/geotechiex.php \
  -H "Content-Type: application/json" \
  -d '{"action":"register_user","email":"test@example.com","device_id":"test123"}'
```

### Usage Not Syncing

**Check**:
- `sync_user_data` endpoint working
- Email matches in database
- `usage_log` table has data

**Debug**:
```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'user@example.com';

-- Check usage log
SELECT * FROM usage_log WHERE email = 'user@example.com';

-- Check user stats
SELECT * FROM user_stats WHERE email = 'user@example.com';
```

---

## 🎓 For Users

### What Users See:

1. **First Visit**: Email collection modal
2. **After Email**: Normal tool usage with usage counter
3. **After 10 Uses**: Payment required modal
4. **After Purchase**: Unlimited usage with credits

### User Benefits:

✅ 10 free uses across all tools  
✅ Credits work on all devices  
✅ No data loss  
✅ Fair usage system  
✅ Support independent development  

---

## 📝 Next Steps

1. Run SQL migration script
2. Upload updated PHP and JS files
3. Test email collection flow
4. Monitor `users` table growth
5. Check admin dashboard for user stats
6. Communicate changes to existing users (optional)

---

## 🔄 Migration for Existing Users

Existing users who used tools before this update:

1. Will see email modal on next visit
2. Can continue with 10 free uses
3. Previous localStorage data preserved
4. Usage now tracked properly

No data loss or disruption.

---

## 📞 Support

For issues:
- Check browser console for errors
- Verify database tables exist
- Test API endpoints manually
- Review server error logs

---

**Version**: 2.0  
**Date**: December 16, 2025  
**Status**: Production Ready ✅
