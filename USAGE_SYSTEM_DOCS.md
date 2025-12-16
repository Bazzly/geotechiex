# GeoTechieX Unified Usage Tracking System

## 🎯 Overview
A centralized payment and usage tracking system that works across all GeoTechieX professional tools.

---

## ✅ What's Been Created

### 1. **Usage Tracker Script** (`js/usage-tracker.js`)
- Tracks usage across all tools
- Manages free usage limits (10 free uses per tool)
- Handles paid credits that work on ALL tools
- Shows usage modals automatically when limit reached
- Stores data in localStorage (persists across sessions)

### 2. **Donation/Payment Page** (`donation.html`)
- Professional donation interface
- Two payment packages:
  - **Basic**: ₦500 = 10 credits
  - **Premium**: ₦1,000 = 25 credits (BEST VALUE!)
- Bank transfer payment instructions
- Activation code redemption system
- Mobile responsive design

---

## 💡 How It Works

### For Users:
1. **Free Usage**: Get 10 free uses of any tool
2. **After Limit**: Modal appears with donation options
3. **Make Payment**: Bank transfer to provided account
4. **Get Code**: WhatsApp payment proof, receive activation code
5. **Activate**: Enter code on donation page
6. **Unlimited**: Credits work across ALL tools!

### For You (Admin):
1. User makes bank transfer
2. User sends payment proof via WhatsApp
3. You generate activation code (format: `GEOX-XXXX-XXXX-XXXX`)
4. User enters code, credits automatically added
5. Credits deducted as user works across tools

---

## 🔧 Integration Status

### ✅ Completed:
- [x] Core usage tracking system created
- [x] Donation page with payment options
- [x] Activation code system
- [x] Polygon tool - Header & Footer added
- [x] Polygon tool - Usage tracker script linked
- [x] Polygon tool - Usage display banner added

### ⏳ Next Steps Needed:
1. **Remove Old Payment Modal UI** from Polygon tool HTML
2. **Update Button Actions** to use new tracker
3. **Test Usage Flow** end-to-end
4. **Integrate into Other Tools** (checkPoint.html, coordTrans.html, etc.)

---

## 📋 To Complete Polygon Tool Integration

### Step 1: Remove Old UI Elements
Find and remove from Polygon/index.html:
- Old payment modal HTML
- Usage counter display elements  
- Old status indicators

### Step 2: Wrap Key Actions
Replace functions that should be tracked:
```javascript
// OLD CODE:
function createPolygon() {
    if (usageCount >= 5) { showPaymentModal(); return; }
    // ... polygon creation
}

// NEW CODE:
function createPolygon() {
    usageTracker.processAction(() => {
        // ... polygon creation logic here
    });
}
```

### Step 3: Key Actions to Wrap:
- `createPolygon()` - Main polygon creation
- `exportPolygonData()` - Data export
- `exportPointsFormat()` - Format export
- `transformSelectedPoints()` - Coordinate transformation

---

## 🚀 Integrate Into Other Tools

### For Each Tool (checkPoint.html, coordTrans.html, etc.):

#### 1. Add Script Reference (before closing `</body>`):
```html
<script src="js/usage-tracker.js"></script>
<script>
    const usageTracker = new UsageTracker('tool_name_here');
</script>
```

#### 2. Add Usage Display Banner:
```html
<div id="usage-tracker-display"></div>
<script>
    // Display after page load
    setTimeout(() => {
        const displayDiv = document.getElementById('usage-tracker-display');
        if (displayDiv) {
            displayDiv.innerHTML = usageTracker.showUsageInfo();
        }
    }, 500);
</script>
```

#### 3. Wrap Main Actions:
```javascript
// Example for coordinate checker
function checkCoordinates() {
    usageTracker.processAction(() => {
        // Your existing check logic here
        performCoordinateCheck();
    });
}
```

---

## 🎨 Tool Names for Tracking

Use these exact names when initializing tracker:

| Tool | Tracker Name |
|------|-------------|
| Polygon Creator | `polygon_creator` |
| Area Delineation | `area_checker` |
| AI Assistant | `ai_assistant` |
| Coordinate Transform | `coord_transform` |
| Ward Checker | `ward_checker` |
| Compass | `compass_tool` |
| Fee Estimator | `fee_estimator` |

---

## 💰 Payment Configuration

### Update Bank Details in `donation.html`:
```html
<div class="flex justify-between items-center border-b pb-2">
    <span class="font-semibold">Bank Name:</span>
    <span class="font-mono">YOUR BANK NAME</span>
</div>
<div class="flex justify-between items-center border-b pb-2">
    <span class="font-semibold">Account Number:</span>
    <span class="font-mono text-lg">YOUR ACCOUNT NUMBER</span>
</div>
<div class="flex justify-between items-center border-b pb-2">
    <span class="font-semibold">Account Name:</span>
    <span class="font-mono">YOUR ACCOUNT NAME</span>
</div>
```

### Update WhatsApp Number:
```html
<li>WhatsApp us your payment proof: <strong>+234 YOUR NUMBER</strong></li>
```

---

## 🔐 Activation Code System

### Code Format:
`GEOX-XXXX-XXXX-XXXX` (where X = letters/numbers)

### Example Valid Codes:
- `GEOX-AB12-CD34-EF56`
- `GEOX-1234-5678-9ABC`
- `GEOX-TEST-CODE-HERE`

### Code Validation:
Currently validates codes starting with "GEOX". You can:
1. **Manual**: Generate codes manually and keep a list
2. **Automated**: Build a backend system to generate/validate
3. **Simple**: Use a Google Sheet to track codes and payments

### Quick Code Generator:
```javascript
function generateActivationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generate = (length) => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };
    return `GEOX-${generate(4)}-${generate(4)}-${generate(4)}`;
}

// Usage:
console.log(generateActivationCode()); // GEOX-A1B2-C3D4-E5F6
```

---

## 📊 Credit Packages

### Current Setup:
| Package | Price | Credits | Value |
|---------|-------|---------|-------|
| Basic | ₦500 | 10 uses | ₦50/use |
| Premium | ₦1,000 | 25 uses | ₦40/use (Best!) |

### To Change Packages:
Edit `donation.html` - search for package sections and update amounts/credits.

---

## 🔄 User Flow Example

1. **First Visit**: User gets "0/10 free uses remaining" banner
2. **Uses Tool**: Creates polygon → "9/10 free uses remaining"
3. **Uses More**: After 10 uses → Modal appears automatically
4. **Clicks Donate**: Redirected to donation.html
5. **Selects Package**: Chooses ₦1,000 Premium (25 credits)
6. **Makes Payment**: Bank transfer using displayed details
7. **Gets Code**: WhatsApps you, receives `GEOX-1234-5678-9ABC`
8. **Activates**: Enters code → Success! 25 credits added
9. **Uses Tools**: Credits work on ANY tool, deducted per use
10. **Checks Balance**: Banner shows "24 paid credits remaining"

---

## 📱 Mobile Responsiveness

All components are fully mobile responsive:
- ✅ Donation page
- ✅ Usage modals
- ✅ Usage display banners
- ✅ Payment interface

---

## 🎯 Benefits of This System

### For Users:
- Free trial with 10 uses
- One payment works everywhere
- Clear pricing and transparency
- Credits never expire
- Easy activation process

### For You:
- Centralized payment management
- Track usage across all tools
- Flexible pricing
- Direct bank transfer (no fees)
- Simple code-based activation

---

## 🐛 Troubleshooting

### "Modal not showing"
- Check if `usage-tracker.js` is loaded
- Check browser console for errors
- Verify Tailwind CSS is loaded

### "Credits not deducting"
- Clear browser localStorage and test fresh
- Check `usageTracker` is initialized
- Verify `processAction()` is wrapping the function

### "Code not validating"
- Must start with "GEOX"
- Must match format: XXXX-XXXX-XXXX
- Check for typos/spaces

---

## 📞 Next Steps

1. **Update Bank Details** in donation.html
2. **Test Complete Flow**:
   - Use tool 10 times
   - See modal appear
   - Go to donation page
   - Test activation with code `GEOX-TEST-TEST-TEST`
3. **Integrate Other Tools** using the pattern above
4. **Go Live** and start receiving donations!

---

## 💼 Production Checklist

Before going live:
- [ ] Update bank account details
- [ ] Update WhatsApp number
- [ ] Test payment flow end-to-end
- [ ] Create code generation system
- [ ] Set up payment tracking (spreadsheet/database)
- [ ] Test on mobile devices
- [ ] Update all tool integrations
- [ ] Add backup contact methods
- [ ] Create payment confirmation email template
- [ ] Set up automated code delivery (optional)

---

**Status**: System created and ready for integration!  
**Next**: Complete Polygon tool integration and test the flow.

---

Ready to make adjustments or complete the integration! 🚀
