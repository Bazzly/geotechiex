/**
 * GeoTechieX Unified Usage Tracking System
 * Tracks tool usage and manages donation-based credits with server-side verification
 */

class UsageTracker {
    constructor(toolName) {
        this.toolName = toolName;
        this.apiEndpoint = 'https://www.bazzlylinks.com/geotechiex.php';
        this.storageKey = `geotechiex_usage_${toolName}`;
        this.globalStorageKey = 'geotechiex_global_credits';
        this.userEmailKey = 'geotechiex_user_email';
        this.freeLimit = 10;
        this.init();
    }

    async init() {
        // Check if user email exists
        const userEmail = localStorage.getItem(this.userEmailKey);
        
        if (!userEmail) {
            // First time user - show email collection modal
            await this.showEmailModal();
        } else {
            // Existing user - sync with server
            await this.syncUserData();
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

    async showEmailModal() {
        return new Promise((resolve) => {
            const modalHTML = `
                <div id="email-collection-modal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fadeIn">
                        <div class="text-center mb-6">
                            <div class="text-5xl mb-3">🌍</div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome to GeoTechieX!</h2>
                            <p class="text-gray-600">To get started with your 10 free uses, please enter your email address.</p>
                        </div>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 class="font-bold text-blue-900 mb-2 text-sm">Why we need your email:</h3>
                            <ul class="text-xs text-blue-800 space-y-1">
                                <li>✓ Track your usage across all tools</li>
                                <li>✓ Prevent abuse of free credits</li>
                                <li>✓ Sync your credits across devices</li>
                                <li>✓ Send payment receipts & activation codes</li>
                            </ul>
                        </div>
                        
                        <form id="email-collection-form" class="space-y-4">
                            <div>
                                <label class="block text-gray-700 font-semibold mb-2 text-sm">Email Address *</label>
                                <input type="email" id="user-email-input" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your.email@example.com">
                            </div>
                            
                            <div class="flex items-start">
                                <input type="checkbox" id="privacy-checkbox" required class="mt-1 mr-2">
                                <label for="privacy-checkbox" class="text-xs text-gray-600">
                                    I agree to store my email for usage tracking and accept the 
                                    <a href="#" class="text-blue-600 hover:underline">privacy policy</a>
                                </label>
                            </div>
                            
                            <button type="submit"
                                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg">
                                🚀 Start Using Tools (10 Free Uses)
                            </button>
                        </form>
                        
                        <p class="text-xs text-gray-500 text-center mt-4">
                            🔒 Your email is secure and will never be shared
                        </p>
                    </div>
                </div>
            `;
            
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);
            document.body.style.overflow = 'hidden';
            
            const form = document.getElementById('email-collection-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = document.getElementById('user-email-input');
                const email = emailInput.value.trim();
                
                if (!email) {
                    alert('Please enter a valid email address');
                    return;
                }
                
                // Show loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '⏳ Registering...';
                submitBtn.disabled = true;
                
                // Register user with server
                const registered = await this.registerUser(email);
                
                if (registered) {
                    localStorage.setItem(this.userEmailKey, email);
                    
                    // Update global credits with email
                    const credits = this.getGlobalCredits();
                    credits.email = email;
                    localStorage.setItem(this.globalStorageKey, JSON.stringify(credits));
                    
                    // Close modal
                    document.getElementById('email-collection-modal').remove();
                    document.body.style.overflow = '';
                    
                    resolve(email);
                } else {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    alert('Registration failed. Please try again.');
                }
            });
        });
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
        const email = localStorage.getItem(this.userEmailKey);
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
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    getGlobalCredits() {
        return JSON.parse(localStorage.getItem(this.globalStorageKey));
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
        const email = localStorage.getItem(this.userEmailKey);
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
                    credits_used: 0,
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
