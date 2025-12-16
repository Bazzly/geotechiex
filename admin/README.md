# GeoTechieX Admin Dashboard

Central management dashboard for monitoring all GeoTechieX tools, payments, and user activities.

## 🎯 Features

### Dashboard Overview
- **Real-time Statistics**
  - Total revenue tracking
  - Payment counts (total & completed)
  - Active user metrics
  - Daily tool usage statistics

- **Visual Analytics**
  - Revenue chart (7-day trend)
  - Tool usage distribution (pie chart)
  - Interactive data visualization

### Data Management
- **Payments Table**
  - Recent payment history
  - Status tracking (completed, pending, failed)
  - Email and amount details
  - Export to CSV

- **Activations Table**
  - Activation code monitoring
  - Credit allocation tracking
  - Status (active/used)
  - Export capabilities

- **Usage Activity Log**
  - Tool-by-tool usage tracking
  - User/device identification
  - Credit consumption monitoring
  - Filter by tool
  - Export to CSV

### System Monitoring
- API status check
- Database connectivity
- Paystack integration status

## 🚀 Quick Start

### 1. Access Admin Dashboard

Navigate to: `https://yourdomain.com/admin/login.html`

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately!

### 2. Dashboard Structure

```
admin/
├── login.html          # Admin login page
├── dashboard.html      # Main dashboard
└── admin-api.js        # Dashboard API client
```

### 3. Backend Setup

The admin dashboard uses the same API endpoint as the payment system:
- Endpoint: `https://www.bazzlylinks.com/geotechiex.php`

**New Admin Actions Added:**
- `admin_stats` - Get dashboard statistics
- `admin_payments` - Retrieve payment records
- `admin_activations` - Get activation codes
- `admin_usage_log` - Fetch usage activity

## 🔐 Security Configuration

### Change Default Credentials

Edit `admin/login.html` (lines 60-62):

```javascript
// REPLACE THIS with secure backend authentication
if (username === 'admin' && password === 'admin123') {
```

### Recommended Security Enhancements

1. **Backend Authentication**
   - Add `admin_login` action to PHP API
   - Store admin credentials in database (hashed)
   - Use secure password hashing (password_hash/password_verify)

2. **Session Management**
   - Use HTTP-only cookies instead of localStorage
   - Implement CSRF protection
   - Add session timeout

3. **Access Control**
   - Add IP whitelist
   - Implement 2FA
   - Log all admin actions

### Secure Backend Auth Example

Add to `geotechiex_production.php`:

```php
case 'admin_login':
    adminLogin($pdo, $data);
    break;

function adminLogin($pdo, $data) {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM admin_users 
            WHERE username = :username AND active = 1
        ");
        $stmt->execute([':username' => $username]);
        $admin = $stmt->fetch();
        
        if ($admin && password_verify($password, $admin['password_hash'])) {
            $token = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            // Store session
            $stmt = $pdo->prepare("
                INSERT INTO admin_sessions (admin_id, token, expires_at)
                VALUES (:admin_id, :token, :expires_at)
            ");
            $stmt->execute([
                ':admin_id' => $admin['id'],
                ':token' => $token,
                ':expires_at' => $expiry
            ]);
            
            sendResponse(true, 'Login successful', [
                'token' => $token,
                'expiry' => $expiry
            ]);
        } else {
            sendResponse(false, 'Invalid credentials');
        }
    } catch (Exception $e) {
        sendResponse(false, 'Login failed');
    }
}
```

## 📊 Dashboard Sections

### 1. Quick Stats Cards
- Total Revenue (₦)
- Total Payments count
- Active Users count
- Tool Usage Today

### 2. Charts
- **Revenue Chart**: 7-day revenue trend line chart
- **Tool Usage Chart**: Doughnut chart showing tool distribution

### 3. Data Tables
- **Recent Payments**: Last 50 payments with export
- **Recent Activations**: Last 50 activation codes
- **Usage Activity Log**: Last 100 tool uses with filtering

### 4. System Status
- API connectivity indicator
- Database status check
- Paystack integration status

## 🔄 Auto-Refresh

- Dashboard data refreshes on load
- Manual refresh button available
- Real-time system status checks

## 📥 Export Features

All data tables support CSV export:
- Click "📥 Export" button
- Downloads formatted CSV file
- Includes all visible data

**Export Files:**
- `payments.csv` - Payment records
- `activations.csv` - Activation codes
- `usage_log.csv` - Activity log

## 🛠️ Customization

### Add New Tool to Filter

Edit `admin/dashboard.html` (line 215):

```html
<select id="tool-filter" onchange="filterUsageLog()">
    <option value="">All Tools</option>
    <option value="Polygon">Polygon Tool</option>
    <option value="YourNewTool">Your New Tool</option>
</select>
```

### Modify Chart Colors

Edit `admin/admin-api.js` (line 320):

```javascript
const colors = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(147, 51, 234, 0.8)',   // Purple
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(251, 146, 60, 0.8)',   // Orange
    'rgba(236, 72, 153, 0.8)'    // Pink
];
```

### Change Data Limits

Edit `admin/admin-api.js`:

```javascript
// In loadPayments()
body: JSON.stringify({ action: 'admin_payments', limit: 100 })

// In loadActivations()
body: JSON.stringify({ action: 'admin_activations', limit: 100 })

// In loadUsageLog()
body: JSON.stringify({ action: 'admin_usage_log', limit: 200 })
```

## 🔍 Troubleshooting

### Dashboard Not Loading Data

1. **Check API Connection**
   - Verify `apiEndpoint` in `admin-api.js`
   - Ensure PHP file is uploaded to server

2. **Check Console Errors**
   - Open browser DevTools (F12)
   - Look for network errors
   - Check API responses

3. **Verify PHP Functions**
   - Ensure admin functions are in `geotechiex_production.php`
   - Check for PHP syntax errors
   - Review error logs

### Charts Not Rendering

1. Check Chart.js is loading:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   ```

2. Verify data format in console
3. Check for JavaScript errors

### Export Not Working

1. Check browser pop-up blocker
2. Verify data exists in tables
3. Check console for errors

## 📱 Mobile Responsive

Dashboard is fully responsive:
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: 4-column grid

## 🎨 Styling

Built with:
- Tailwind CSS (CDN)
- Chart.js for visualizations
- Custom hover effects
- Gradient backgrounds

## 📝 Maintenance

### Regular Tasks

1. **Monitor System Status**
   - Check API/database connectivity
   - Review error logs
   - Monitor payment failures

2. **Review Usage Patterns**
   - Identify popular tools
   - Track user activity trends
   - Optimize tool performance

3. **Financial Oversight**
   - Daily revenue review
   - Payment success rates
   - Activation code usage

### Database Maintenance

```sql
-- Clean old usage logs (older than 90 days)
DELETE FROM usage_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Archive completed payments
CREATE TABLE payments_archive AS SELECT * FROM payments WHERE status = 'completed' AND created_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
DELETE FROM payments WHERE status = 'completed' AND created_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
```

## 🚨 Important Notes

1. **Change Default Password!** - Critical security requirement
2. **Use HTTPS** - Admin dashboard should only be accessed over secure connection
3. **Regular Backups** - Backup database regularly
4. **Monitor Logs** - Check error logs frequently
5. **Update Credentials** - Change API keys periodically

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review PHP error logs
- Verify database connectivity
- Ensure all files are uploaded correctly

## 🎯 Future Enhancements

Potential additions:
- User management interface
- Email notification system
- Advanced analytics
- Revenue forecasting
- Tool performance metrics
- Automated reports
- Role-based access control
- Audit trail logging
