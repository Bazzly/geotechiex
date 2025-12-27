/**
 * GeoTechieX Unified Usage Tracking System
 * Tracks tool usage and manages donation-based credits with server-side verification
 */

class UsageTracker {
    constructor(toolName) {
        this.toolName = toolName;
        this.apiEndpoint = '/api/index.php';
        this.storageKey = `geotechiex_usage_${toolName}`;
        this.globalStorageKey = 'geotechiex_global_credits';
        // Prefer the site-wide email key set by index.html; fall back to local tool key
        this.siteEmailKey = 'geotechiex_email';
        this.userEmailKey = 'geotechiex_user_email';
        // Simple legacy/simple credit key used by index.html
        this.simpleCreditsKey = 'geotechiex_credits';
        this.freeLimit = 10;
        // Keep a ready promise so callers can await initialization if needed
        this.ready = this.init();
    }

    async init() {
        // Check for an email stored by index (preferred) or the tool-specific key
        const userEmail = localStorage.getItem(this.userEmailKey) || localStorage.getItem(this.siteEmailKey);
        if (userEmail) {
            // Existing user - sync with server
            await this.syncUserData();
        } else {
            // Do NOT show a modal here; index.html handles email collection centrally.
            // Keep local usage data initialized so the tool can function offline.
        }
        
        // Initialize local usage data if not exists
        if (!localStorage.getItem(this.storageKey)) {
            this.resetUsage();
        }
        
        // Initialize global credits if not exists
        if (!localStorage.getItem(this.globalStorageKey)) {
            localStorage.setItem(this.globalStorageKey, JSON.stringify({
                credits: 0,
                donated: false,
                donationDate: null,
                totalDonations: 0,
                email: userEmail
            }));
        }
    }

    // Email collection modal intentionally disabled here because index.html
    // handles centralized email collection and promo granting.
    async showEmailModal() {
        console.info('showEmailModal called but disabled; index.html manages email collection.');
        return null;
    }

    async registerUser(email) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register_user',
                    email: email,
                    device_id: this.getDeviceId(),
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('User registration error:', error);
            return false;
        }
    }

    async syncUserData() {
        const email = localStorage.getItem(this.userEmailKey) || localStorage.getItem(this.siteEmailKey);
        if (!email) return;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sync_user_data',
                    email: email,
                    device_id: this.getDeviceId()
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Update local credits from server
                const credits = this.getGlobalCredits();
                credits.credits = data.total_credits || 0;
                credits.total_usage = data.total_usage || 0;
                localStorage.setItem(this.globalStorageKey, JSON.stringify(credits));
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('geotechiex_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('geotechiex_device_id', deviceId);
        }
        return deviceId;
    }

    resetUsage() {
        const data = {
            count: 0,
            firstUsed: new Date().toISOString(),
            lastUsed: null
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    getUsageData() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) {
            // return a safe default usage object
            return { count: 0, firstUsed: null, lastUsed: null };
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            // If parsing fails, reset usage and return default
            this.resetUsage();
            return { count: 0, firstUsed: null, lastUsed: null };
        }
    }

    getGlobalCredits() {
        // Prefer structured global storage; fall back to simple credits key used by index.html
        const structured = localStorage.getItem(this.globalStorageKey);
        if (structured) return JSON.parse(structured);
        const simple = localStorage.getItem(this.simpleCreditsKey);
        return { credits: parseInt(simple || '0', 10), donated: false, donationDate: null, totalDonations: 0, email: localStorage.getItem(this.siteEmailKey) || null };
    }

    async incrementUsage() {
        const data = this.getUsageData();
        data.count++;
        data.lastUsed = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        
        // Log usage to server
        await this.logUsageToServer();
        
        return data.count;
    }

    async logUsageToServer() {
        const email = localStorage.getItem(this.userEmailKey) || localStorage.getItem(this.siteEmailKey);
            if (!email) return;

        try {
            await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'log_usage',
                    email: email,
                    device_id: this.getDeviceId(),
                    tool_name: this.toolName,
                    credits_used: 1,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Usage logging error:', error);
        }
    }

    async canUseFeature() {
        const usage = this.getUsageData();
        const credits = this.getGlobalCredits();
        const email = localStorage.getItem(this.userEmailKey);
        
        // If no email, something went wrong - force email collection
        if (!email) {
            await this.showEmailModal();
        }
        
        // Check if user has paid credits
        if (credits.credits > 0) {
            return { allowed: true, type: 'paid' };
        }
        
        // Check server-side total usage (to prevent refresh abuse)
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'check_user_usage',
                    email: email
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const totalUsage = data.total_usage || 0;
                
                // Server-side check takes precedence
                if (totalUsage >= this.freeLimit) {
                    return { allowed: false, type: 'limit_reached', used: totalUsage };
                }
                
                return { allowed: true, type: 'free', remaining: this.freeLimit - totalUsage };
            }
        } catch (error) {
            console.error('Usage check error:', error);
        }
        
        // Fallback to local check if server fails
        if (usage.count < this.freeLimit) {
            return { allowed: true, type: 'free', remaining: this.freeLimit - usage.count };
        }
        
        return { allowed: false, type: 'limit_reached', used: usage.count };
    }

    async deductCredit() {
        const credits = this.getGlobalCredits();
        if (credits.credits > 0) {
            credits.credits--;
            localStorage.setItem(this.globalStorageKey, JSON.stringify(credits));
            
            // Log credit usage to server
            await this.logUsageToServer();
            // Reflect the simple credits key used by index.html
            try{ localStorage.setItem(this.simpleCreditsKey, String(credits.credits)); }catch(e){}
            
            return true;
        }
        return false;
    }

    addCredits(amount, donationAmount) {
        const credits = this.getGlobalCredits();
        credits.credits += amount;
        credits.donated = true;
        credits.donationDate = new Date().toISOString();
        credits.totalDonations += donationAmount;
        localStorage.setItem(this.globalStorageKey, JSON.stringify(credits));
    }

    getRemainingFreeUsage() {
        const usage = this.getUsageData();
        return Math.max(0, this.freeLimit - usage.count);
    }

    showUsageModal() {
        const status = this.canUseFeature();
        const credits = this.getGlobalCredits();
        
        // Create modal HTML
        const modalHTML = `
            <div id="usage-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fadeIn">
                    <button onclick="closeUsageModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
                        &times;
                    </button>
                    
                    <div class="text-center mb-6">
                        <div class="text-5xl mb-3">⚠️</div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">Usage Limit Reached</h2>
                    </div>
                    
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p class="text-red-800 text-center">
                            <span class="font-bold">Free usage limit:</span> ${this.freeLimit} uses<br>
                            <span class="font-bold">You have used:</span> ${status.used} times
                        </p>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 class="font-bold text-blue-900 mb-3 text-center">💎 Get More Credits</h3>
                        <div class="space-y-2 text-sm text-blue-800">
                            <p><span class="font-semibold">Minimum Donation:</span> ₦500</p>
                            <p><span class="font-semibold">Credits Received:</span> 10 uses</p>
                            <p><span class="font-semibold">Valid For:</span> All GeoTechieX tools</p>
                            <p class="text-xs text-blue-600 mt-2">✨ Credits work across all professional tools on this site!</p>
                        </div>
                    </div>
                    
                    ${credits.credits > 0 ? `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p class="text-green-800 text-center text-sm">
                                🎉 <span class="font-bold">Current Balance:</span> ${credits.credits} credits remaining
                            </p>
                        </div>
                    ` : ''}
                    
                    <button onclick="openDonationPage()" 
                        class="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg mb-3">
                        🎁 Donate & Get Credits
                    </button>
                    
                    <button onclick="closeUsageModal()" 
                        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition">
                        Cancel
                    </button>
                    
                    <p class="text-xs text-gray-500 text-center mt-4">
                        Your support helps us maintain and improve these tools!
                    </p>
                </div>
            </div>
        `;
        
        // Inject modal into page
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    showUsageInfo() {
        const usage = this.getUsageData();
        const credits = this.getGlobalCredits();
        const remaining = this.getRemainingFreeUsage();
        
        let message = '';
        let bgColor = '';
        
        if (credits.credits > 0) {
            message = `✅ ${credits.credits} paid credits remaining`;
            bgColor = 'bg-green-50 border-green-200 text-green-800';
        } else if (remaining > 0) {
            message = `${remaining}/${this.freeLimit} free uses remaining`;
            bgColor = remaining <= 3 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800';
        } else {
            message = `Free limit reached (${usage.count}/${this.freeLimit})`;
            bgColor = 'bg-red-50 border-red-200 text-red-800';
        }
        
        return `
            <div class="${bgColor} border rounded-lg p-3 mb-4 text-sm font-medium">
                <div class="flex items-center justify-between">
                    <span>📊 ${message}</span>
                    ${credits.credits === 0 && remaining === 0 ? 
                        '<button onclick="usageTracker.showUsageModal()" class="text-xs underline hover:no-underline">Get Credits</button>' 
                        : ''}
                </div>
            </div>
        `;
    }

    async processAction(callback) {
        const status = await this.canUseFeature();
        
        if (!status.allowed) {
            this.showUsageModal();
            return false;
        }
        
        // Increment usage or deduct credit
        if (status.type === 'paid') {
            await this.deductCredit();
        } else {
            await this.incrementUsage();
        }
        
        // Execute the callback
        if (typeof callback === 'function') {
            callback();
        }
        
        return true;
    }
}

// Global functions for modal
window.closeUsageModal = function() {
    const modal = document.getElementById('usage-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

window.openDonationPage = function() {
    window.closeUsageModal();
    window.location.href = '../donation.html';
};

// Add animation styles
if (!document.getElementById('usage-tracker-styles')) {
    const style = document.createElement('style');
    style.id = 'usage-tracker-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
}
