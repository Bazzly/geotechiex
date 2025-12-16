/**
 * GeoTechieX Payment API Integration
 * Connects to www.bazzlylinks.com/geotechiex.php for payment processing
 * Handles Paystack integration and activation code generation
 */

class PaymentAPI {
    constructor() {
        // Your PHP API endpoint
        this.apiEndpoint = 'https://www.bazzlylinks.com/geotechiex.php';
        
        // Paystack Public Key (Replace with your actual key)
        this.paystackPublicKey = 'pk_live_YOUR_PUBLIC_KEY_HERE'; // TODO: Replace with actual key
        
        this.storageKey = 'geotechiex_payment_data';
        this.init();
    }

    init() {
        // Load Paystack script dynamically
        if (!document.querySelector('script[src*="paystack"]')) {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            document.head.appendChild(script);
        }
    }

    /**
     * Initialize Paystack payment
     * @param {Object} paymentData - Payment details
     * @returns {Promise}
     */
    async initiatePayment(paymentData) {
        const {
            amount,
            email,
            credits,
            packageName,
            customerName,
            phone
        } = paymentData;

        try {
            // First, register the payment intent with your API
            const reference = this.generateReference();
            const paymentRecord = {
                reference: reference,
                email: email,
                amount: amount,
                credits: credits,
                packageName: packageName,
                customerName: customerName,
                phone: phone,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Save to API before payment
            await this.saveToAPI('initiate_payment', paymentRecord);

            // Initialize Paystack payment
            return new Promise((resolve, reject) => {
                const handler = PaystackPop.setup({
                    key: this.paystackPublicKey,
                    email: email,
                    amount: amount * 100, // Convert to kobo
                    currency: 'NGN',
                    ref: reference,
                    metadata: {
                        custom_fields: [
                            {
                                display_name: "Package",
                                variable_name: "package",
                                value: packageName
                            },
                            {
                                display_name: "Credits",
                                variable_name: "credits",
                                value: credits
                            },
                            {
                                display_name: "Customer Name",
                                variable_name: "customer_name",
                                value: customerName
                            },
                            {
                                display_name: "Phone",
                                variable_name: "phone",
                                value: phone
                            }
                        ]
                    },
                    onClose: function() {
                        reject(new Error('Payment cancelled by user'));
                    },
                    callback: function(response) {
                        if (response.status === 'success') {
                            // Verify payment with your API
                            paymentAPI.verifyPayment(response.reference)
                                .then(result => resolve(result))
                                .catch(error => reject(error));
                        } else {
                            reject(new Error('Payment failed'));
                        }
                    }
                });
                handler.openIframe();
            });

        } catch (error) {
            console.error('Payment initiation error:', error);
            throw error;
        }
    }

    /**
     * Verify payment and get activation code
     * @param {string} reference - Payment reference
     * @returns {Promise<Object>}
     */
    async verifyPayment(reference) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'verify_payment',
                    reference: reference,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Store activation code and payment details locally
                this.storePaymentData(data);
                return data;
            } else {
                throw new Error(data.message || 'Payment verification failed');
            }

        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    }

    /**
     * Activate credits using activation code
     * @param {string} activationCode - The activation code
     * @returns {Promise<Object>}
     */
    async activateCode(activationCode) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'activate_code',
                    activation_code: activationCode.trim().toUpperCase(),
                    device_id: this.getDeviceId(),
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Add credits to local storage
                this.addCreditsToAccount(data.credits);
                this.storeActivationData(data);
                return data;
            } else {
                throw new Error(data.message || 'Activation failed');
            }

        } catch (error) {
            console.error('Activation error:', error);
            throw error;
        }
    }

    /**
     * Check activation code status
     * @param {string} activationCode - The activation code to check
     * @returns {Promise<Object>}
     */
    async checkCodeStatus(activationCode) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'check_code_status',
                    activation_code: activationCode.trim().toUpperCase()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Code status check error:', error);
            throw error;
        }
    }

    /**
     * Get payment history for user
     * @param {string} email - User email
     * @returns {Promise<Array>}
     */
    async getPaymentHistory(email) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_payment_history',
                    email: email,
                    device_id: this.getDeviceId()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.success ? data.payments : [];

        } catch (error) {
            console.error('Payment history error:', error);
            return [];
        }
    }

    /**
     * Save data to API (generic function)
     * @param {string} action - API action
     * @param {Object} data - Data to send
     * @returns {Promise}
     */
    async saveToAPI(action, data) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    ...data
                }),
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }

            return result;

        } catch (error) {
            console.error('API save error:', error);
            
            // More specific error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to payment server. Please check your internet connection or try again later.');
            } else if (error.message.includes('NetworkError')) {
                throw new Error('Network error. Please check your connection and try again.');
            } else if (error.message.includes('HTTP 500')) {
                throw new Error('Server error. Please contact support if this persists.');
            }
            
            throw error;
        }
    }

    /**
     * Generate unique payment reference
     * @returns {string}
     */
    generateReference() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `GEOX-${timestamp}-${random}`;
    }

    /**
     * Get or create device ID for tracking
     * @returns {string}
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('geotechiex_device_id');
        if (!deviceId) {
            deviceId = 'DEV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('geotechiex_device_id', deviceId);
        }
        return deviceId;
    }

    /**
     * Store payment data locally
     * @param {Object} data - Payment data
     */
    storePaymentData(data) {
        const existingData = this.getPaymentData();
        existingData.payments.push({
            ...data,
            stored_at: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    }

    /**
     * Store activation data locally
     * @param {Object} data - Activation data
     */
    storeActivationData(data) {
        const existingData = this.getPaymentData();
        existingData.activations.push({
            ...data,
            activated_at: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    }

    /**
     * Get stored payment data
     * @returns {Object}
     */
    getPaymentData() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            return JSON.parse(data);
        }
        return {
            payments: [],
            activations: [],
            created_at: new Date().toISOString()
        };
    }

    /**
     * Add credits to user account (integrate with existing usage tracker)
     * @param {number} credits - Number of credits to add
     */
    addCreditsToAccount(credits) {
        const globalStorageKey = 'geotechiex_global_credits';
        let creditData = JSON.parse(localStorage.getItem(globalStorageKey) || '{}');
        
        creditData.credits = (creditData.credits || 0) + credits;
        creditData.donated = true;
        creditData.lastDonation = new Date().toISOString();
        creditData.totalDonations = (creditData.totalDonations || 0) + credits;
        
        localStorage.setItem(globalStorageKey, JSON.stringify(creditData));
    }

    /**
     * Get current credit balance
     * @returns {number}
     */
    getCreditBalance() {
        const globalStorageKey = 'geotechiex_global_credits';
        const creditData = JSON.parse(localStorage.getItem(globalStorageKey) || '{}');
        return creditData.credits || 0;
    }

    /**
     * Sync local data with API (recovery/backup)
     * @returns {Promise}
     */
    async syncWithAPI(email) {
        try {
            const localData = this.getPaymentData();
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sync_data',
                    email: email,
                    device_id: this.getDeviceId(),
                    local_data: localData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.server_data) {
                // Update local storage with server data
                localStorage.setItem(this.storageKey, JSON.stringify(data.server_data));
                
                // Update credits
                if (data.total_credits) {
                    const globalStorageKey = 'geotechiex_global_credits';
                    let creditData = JSON.parse(localStorage.getItem(globalStorageKey) || '{}');
                    creditData.credits = data.total_credits;
                    localStorage.setItem(globalStorageKey, JSON.stringify(creditData));
                }
            }

            return data;

        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    }
}

// Create global instance
window.paymentAPI = new PaymentAPI();
