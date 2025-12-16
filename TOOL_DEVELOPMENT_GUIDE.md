# GeoTechieX Tool Development Guide
## Credit System Implementation for All Tools

This guide ensures all GeoTechieX tools implement the unified credit/usage tracking system.

---

## ✅ Currently Implemented Tools

### Tools WITH Credit System:
1. ✅ **Polygon Creator** (`Polygon/index.html`) - Professional Survey Tool
2. ✅ **Area Delineation AI** (`areadelAi.html`) - AI-powered checker
3. ✅ **Value Map Fee Estimator** (`valuemap/index.html`) - Fee calculator
4. ✅ **Compass Navigation** (`compass.html`) - Navigation tool
5. ✅ **Coordinate Transformer** (`coordTrans.html`) - Coord conversion
6. ✅ **Area Checker** (`checkPoint.html`) - Point checker
7. ✅ **Donation Page** (`donation.html`) - Payment interface

### Tools WITHOUT Credit System (Non-critical):
- `ngn_wards.html` - Ward checker (static lookup)
- `index.html` - Landing page
- `admin.html` - Admin pages

---

## 🚀 How to Add Credit System to New Tools

### Step 1: Load Usage Tracker Script

Add before closing `</body>` tag:

```html
<script src="js/usage-tracker.js"></script>
<script>
    const usageTracker = new UsageTracker('tool_name_here');
</script>
```

**Tool Name Convention:**
- Use lowercase with underscores
- Be descriptive and unique
- Examples: `polygon_creator`, `coord_transformer`, `compass_navigation`

### Step 2: Add Usage Display (Optional but Recommended)

Add in your tool's main content area, near the top:

```html
<!-- Usage Tracker Display -->
<div id="usage-tracker-display" class="mb-6"></div>
```

### Step 3: Initialize and Display Usage Info

```javascript
window.addEventListener('DOMContentLoaded', () => {
    // Display usage info
    const displayDiv = document.getElementById('usage-tracker-display');
    if (displayDiv && typeof usageTracker !== 'undefined') {
        displayDiv.innerHTML = usageTracker.showUsageInfo();
    }
});
```

### Step 4: Wrap Main Action with Credit Check

**Method A: Direct Function Wrap**

```javascript
function yourMainAction() {
    // Check credit and execute
    usageTracker.processAction(() => {
        // Your actual tool logic here
        performCalculation();
        displayResults();
    });
}
```

**Method B: Button Click Intercept**

```javascript
window.addEventListener('DOMContentLoaded', () => {
    const actionButton = document.getElementById('your-button-id');
    if (actionButton) {
        const originalOnClick = actionButton.onclick;
        actionButton.onclick = function(e) {
            usageTracker.processAction(() => {
                if (originalOnClick) originalOnClick.call(this, e);
            });
        };
    }
});
```

**Method C: Event Listener Wrap**

```javascript
document.getElementById('calculateBtn').addEventListener('click', () => {
    usageTracker.processAction(() => {
        // Your calculation logic
        calculate();
    });
});
```

---

## 📋 Complete Implementation Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GeoTechieX - Your Tool Name</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    
    <!-- Header (use standard GeoTechieX header) -->
    <header class="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-800 text-white shadow-2xl sticky top-0 z-50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between py-4">
                <a href="index.html" class="flex items-center space-x-2">
                    <span class="text-2xl">🌍</span>
                    <h1 class="text-xl sm:text-2xl font-bold">GeoTechieX</h1>
                </a>
                <nav class="flex items-center space-x-2">
                    <a href="index.html" class="hover:bg-white/10 px-3 py-2 rounded-lg transition">Home</a>
                    <a href="donation.html" class="hover:bg-white/10 px-3 py-2 rounded-lg transition">💎 Get Credits</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        
        <!-- Tool Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white text-center mb-8">
            <h1 class="text-4xl font-bold mb-2">Your Tool Name</h1>
            <p class="text-lg">Tool description goes here</p>
            
            <!-- Usage Tracker Display -->
            <div id="usage-tracker-display" class="mt-4"></div>
        </div>

        <!-- Tool Interface -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <!-- Your tool UI here -->
            
            <button id="actionButton" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                Process Action
            </button>
            
            <div id="results"></div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-400 py-6 mt-10">
        <div class="container mx-auto text-center">
            <p>© 2025 GeoTechieX. All Rights Reserved.</p>
        </div>
    </footer>

    <!-- Your tool's main script -->
    <script>
        function processAction() {
            // Your tool logic
            const result = performCalculation();
            displayResults(result);
        }
        
        function performCalculation() {
            // Actual calculation logic
            return "Result data";
        }
        
        function displayResults(result) {
            document.getElementById('results').innerHTML = result;
        }
    </script>

    <!-- Usage Tracker Integration (REQUIRED) -->
    <script src="js/usage-tracker.js"></script>
    <script>
        // Initialize usage tracker with unique tool name
        const usageTracker = new UsageTracker('your_tool_name');
        
        // Display usage info on load
        window.addEventListener('DOMContentLoaded', () => {
            // Show usage info
            const displayDiv = document.getElementById('usage-tracker-display');
            if (displayDiv && typeof usageTracker !== 'undefined') {
                displayDiv.innerHTML = usageTracker.showUsageInfo();
            }
            
            // Wrap action button with credit check
            const actionButton = document.getElementById('actionButton');
            if (actionButton) {
                actionButton.addEventListener('click', () => {
                    usageTracker.processAction(() => {
                        processAction();
                    });
                });
            }
        });
    </script>
</body>
</html>
```

---

## 🎯 What the Credit System Does

### User Experience Flow:

1. **First 10 Uses**: Free for all users
2. **After 10 Uses**: Modal appears prompting for credits
3. **With Credits**: Unlimited usage until credits run out
4. **Credit Purchase**: Redirects to donation page
5. **Activation**: Users enter activation code to add credits

### Credit Deduction Logic:

- **Free users**: Increment usage count (1-10)
- **Paid users**: Deduct 1 credit per action
- **No credits**: Show modal with donation link

### Storage:

- **localStorage**: Client-side credit tracking
- **API Backend**: Server-side payment verification
- **Sync**: Credits sync across all tools

---

## 📊 Tool-Specific Tracking

Each tool has unique identifier for analytics:

```javascript
const usageTracker = new UsageTracker('tool_identifier');
```

### Current Tool Identifiers:

| Tool | Identifier | File |
|------|-----------|------|
| Polygon Creator | `polygon_creator` | Polygon/index.html |
| AI Assistant | `ai_assistant` | areadelAi.html |
| Fee Estimator | `fee_estimator` | valuemap/index.html |
| Compass Navigation | `compass_navigation` | compass.html |
| Coord Transformer | `coord_transformer` | coordTrans.html |
| Area Checker | `area_checker` | checkPoint.html |

---

## 🔧 Customization Options

### Adjust Free Limit

In `js/usage-tracker.js` (line 11):

```javascript
this.freeLimit = 10; // Change to desired free usage count
```

### Custom Modal Styling

The modal uses Tailwind CSS. Modify in `js/usage-tracker.js` (lines 100-165):

```javascript
const modalHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 ...">
        <!-- Customize HTML structure -->
    </div>
`;
```

### Change Credit Packages

Edit `donation.html` packages section (lines 52-113).

---

## 🐛 Testing Checklist

### Before Deployment:

- [ ] Usage tracker script loaded
- [ ] Tool identifier is unique
- [ ] Usage display appears on page
- [ ] Main action wrapped with `processAction()`
- [ ] Modal appears after 10 free uses
- [ ] Donation link works
- [ ] Credits deduct properly
- [ ] Tool functions normally after credit check

### Testing Commands:

```javascript
// In browser console:

// Check current credits
localStorage.getItem('geotechiex_global_credits');

// Reset usage for testing
localStorage.removeItem('geotechiex_usage_your_tool_name');

// Add test credits
const credits = JSON.parse(localStorage.getItem('geotechiex_global_credits'));
credits.credits = 100;
localStorage.setItem('geotechiex_global_credits', JSON.stringify(credits));

// Clear all credits
localStorage.removeItem('geotechiex_global_credits');
```

---

## 🚨 Common Issues & Solutions

### Issue: Modal not appearing
**Solution**: Check `usageTracker.processAction()` is wrapping your action

### Issue: Credits not deducting
**Solution**: Verify tool identifier is set correctly

### Issue: Display not showing
**Solution**: Ensure `usage-tracker-display` div exists and script loads

### Issue: Button stops working
**Solution**: Check you're calling the original onclick handler

---

## 📝 Admin Dashboard Integration

All tool usage is automatically tracked in the admin dashboard:

- **Endpoint**: `admin/dashboard.html`
- **Data Logged**: Tool name, action, user/device, credits used
- **API Action**: `admin_usage_log`

Usage appears in the "Usage Activity Log" table with:
- Timestamp
- Tool name (from identifier)
- Action performed
- User/device ID
- Credits consumed

---

## 🎓 Best Practices

1. **Always use descriptive tool identifiers** - helps with analytics
2. **Show usage display prominently** - transparency builds trust
3. **Wrap only critical actions** - not every button needs credit check
4. **Test thoroughly** - verify free and paid flows
5. **Handle errors gracefully** - usage tracker fails shouldn't break tool
6. **Link to donation page** - make it easy to purchase credits
7. **Document your tool** - add to this guide when creating new tools

---

## 🔄 Future Tool Creation Workflow

1. Create tool HTML/JS
2. Add usage tracker scripts (Step 1-3 above)
3. Wrap main action with credit check (Step 4)
4. Test with 0 credits, <10 uses, and >10 uses
5. Update this guide with new tool identifier
6. Deploy to production

---

## 📞 Support

For implementation help:
- Review `js/usage-tracker.js` for core logic
- Check existing tools as reference
- Test in browser console
- Verify localStorage state

---

## ✨ Summary

**Every new GeoTechieX tool MUST include:**
1. `<script src="js/usage-tracker.js"></script>`
2. `const usageTracker = new UsageTracker('unique_name');`
3. Usage display div with `id="usage-tracker-display"`
4. Main action wrapped with `usageTracker.processAction(() => {})`

This ensures consistent user experience and proper credit tracking across the entire platform.

---

**Last Updated**: December 16, 2025
**Version**: 2.0
**Implemented Tools**: 7/7 critical tools ✅
