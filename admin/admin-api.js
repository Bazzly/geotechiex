/**
 * GeoTechieX Admin Dashboard API
 * Handles all admin data fetching and management
 */

class AdminDashboard {
    constructor() {
        this.apiEndpoint = 'https://www.bazzlylinks.com/geotechiex.php';
        this.data = {
            payments: [],
            activations: [],
            usageLog: [],
            stats: {}
        };
        this.charts = {};
    }

    /**
     * Load all dashboard data
     */
    async loadAllData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadPayments(),
                this.loadActivations(),
                this.loadUsageLog(),
                this.checkSystemStatus()
            ]);
            
            this.renderCharts();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    /**
     * Load statistics
     */
    async loadStats() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'admin_stats' })
            });

            const data = await response.json();
            
            if (data.success) {
                this.data.stats = data.stats;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Stats loading error:', error);
        }
    }

    /**
     * Load payments
     */
    async loadPayments() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'admin_payments', limit: 50 })
            });

            const data = await response.json();
            
            if (data.success) {
                this.data.payments = data.payments;
                this.renderPaymentsTable();
            }
        } catch (error) {
            console.error('Payments loading error:', error);
        }
    }

    /**
     * Load activations
     */
    async loadActivations() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'admin_activations', limit: 50 })
            });

            const data = await response.json();
            
            if (data.success) {
                this.data.activations = data.activations;
                this.renderActivationsTable();
            }
        } catch (error) {
            console.error('Activations loading error:', error);
        }
    }

    /**
     * Load usage log
     */
    async loadUsageLog() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'admin_usage_log', limit: 100 })
            });

            const data = await response.json();
            
            if (data.success) {
                this.data.usageLog = data.usage_log;
                this.renderUsageLogTable();
            }
        } catch (error) {
            console.error('Usage log loading error:', error);
        }
    }

    /**
     * Check system status
     */
    async checkSystemStatus() {
        // Check API
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'test' })
            });

            const data = await response.json();
            
            if (data.success) {
                document.getElementById('api-status').textContent = '✅';
                document.getElementById('api-status-text').textContent = 'API Online';
            } else {
                document.getElementById('api-status').textContent = '⚠️';
                document.getElementById('api-status-text').textContent = 'API Warning';
            }
        } catch (error) {
            document.getElementById('api-status').textContent = '❌';
            document.getElementById('api-status-text').textContent = 'API Offline';
        }

        // Check Database
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check_code_status', activation_code: 'TEST' })
            });

            await response.json();
            document.getElementById('db-status').textContent = '✅';
            document.getElementById('db-status-text').textContent = 'Database Connected';
        } catch (error) {
            document.getElementById('db-status').textContent = '❌';
            document.getElementById('db-status-text').textContent = 'Database Error';
        }
    }

    /**
     * Update stats display
     */
    updateStatsDisplay() {
        const stats = this.data.stats;
        
        document.getElementById('total-revenue').textContent = 
            `₦${(stats.total_revenue || 0).toLocaleString()}`;
        document.getElementById('revenue-change').textContent = 
            `${stats.revenue_change || 0}% from last month`;
        
        document.getElementById('total-payments').textContent = 
            (stats.total_payments || 0).toLocaleString();
        document.getElementById('payments-change').textContent = 
            `${stats.completed_payments || 0} completed`;
        
        document.getElementById('active-users').textContent = 
            (stats.active_users || 0).toLocaleString();
        document.getElementById('users-change').textContent = 
            `${stats.new_users || 0} new this month`;
        
        document.getElementById('tool-usage').textContent = 
            (stats.tool_usage_today || 0).toLocaleString();
        document.getElementById('usage-change').textContent = 
            `${stats.total_tool_usage || 0} total uses`;
    }

    /**
     * Render payments table
     */
    renderPaymentsTable() {
        const tbody = document.getElementById('payments-table');
        
        if (!this.data.payments || this.data.payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-3 py-8 text-center text-gray-400">
                        <div class="text-4xl mb-2">📭</div>
                        No payments yet
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.payments.slice(0, 10).map(payment => {
            const date = new Date(payment.created_at).toLocaleDateString();
            const statusColor = payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                               payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                               'bg-red-100 text-red-700';
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-3 text-xs">${date}</td>
                    <td class="px-3 py-3 text-xs">${payment.email}</td>
                    <td class="px-3 py-3 text-xs font-semibold">₦${parseFloat(payment.amount).toLocaleString()}</td>
                    <td class="px-3 py-3">
                        <span class="text-xs px-2 py-1 rounded-full ${statusColor}">
                            ${payment.status}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render activations table
     */
    renderActivationsTable() {
        const tbody = document.getElementById('activations-table');
        
        if (!this.data.activations || this.data.activations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-3 py-8 text-center text-gray-400">
                        <div class="text-4xl mb-2">📭</div>
                        No activations yet
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.activations.slice(0, 10).map(activation => {
            const date = new Date(activation.generated_at).toLocaleDateString();
            const statusColor = activation.status === 'active' ? 'bg-green-100 text-green-700' : 
                               'bg-gray-100 text-gray-700';
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-3 text-xs font-mono">${activation.activation_code}</td>
                    <td class="px-3 py-3 text-xs font-semibold">${activation.credits}</td>
                    <td class="px-3 py-3">
                        <span class="text-xs px-2 py-1 rounded-full ${statusColor}">
                            ${activation.status}
                        </span>
                    </td>
                    <td class="px-3 py-3 text-xs">${date}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render usage log table
     */
    renderUsageLogTable() {
        const tbody = document.getElementById('usage-log-table');
        
        if (!this.data.usageLog || this.data.usageLog.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-3 py-8 text-center text-gray-400">
                        <div class="text-4xl mb-2">📭</div>
                        No usage data yet
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.usageLog.slice(0, 20).map(log => {
            const date = new Date(log.created_at).toLocaleString();
            const user = log.email || log.device_id || 'Anonymous';
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-3 text-xs">${date}</td>
                    <td class="px-3 py-3 text-xs">${log.tool_name || 'N/A'}</td>
                    <td class="px-3 py-3 text-xs">${log.action}</td>
                    <td class="px-3 py-3 text-xs">${user}</td>
                    <td class="px-3 py-3 text-xs font-semibold">${log.credits_used || 0}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render charts
     */
    renderCharts() {
        this.renderRevenueChart();
        this.renderToolUsageChart();
    }

    /**
     * Render revenue chart
     */
    renderRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        // Prepare data (last 7 days)
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Calculate revenue for this day
            const dayRevenue = this.data.payments
                .filter(p => {
                    const paymentDate = new Date(p.created_at);
                    return paymentDate.toDateString() === date.toDateString() && p.status === 'completed';
                })
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            
            data.push(dayRevenue);
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (₦)',
                    data: data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₦' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render tool usage chart
     */
    renderToolUsageChart() {
        const ctx = document.getElementById('toolUsageChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.toolUsage) {
            this.charts.toolUsage.destroy();
        }

        // Count usage by tool
        const toolCounts = {};
        this.data.usageLog.forEach(log => {
            const tool = log.tool_name || 'Unknown';
            toolCounts[tool] = (toolCounts[tool] || 0) + 1;
        });

        const labels = Object.keys(toolCounts);
        const data = Object.values(toolCounts);
        const colors = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 51, 234, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(236, 72, 153, 0.8)'
        ];

        this.charts.toolUsage = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Filter usage log by tool
     */
    filterUsageLog() {
        const filter = document.getElementById('tool-filter').value;
        
        let filteredLog = this.data.usageLog;
        if (filter) {
            filteredLog = this.data.usageLog.filter(log => log.tool_name === filter);
        }

        const tbody = document.getElementById('usage-log-table');
        tbody.innerHTML = filteredLog.slice(0, 20).map(log => {
            const date = new Date(log.created_at).toLocaleString();
            const user = log.email || log.device_id || 'Anonymous';
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-3 text-xs">${date}</td>
                    <td class="px-3 py-3 text-xs">${log.tool_name || 'N/A'}</td>
                    <td class="px-3 py-3 text-xs">${log.action}</td>
                    <td class="px-3 py-3 text-xs">${user}</td>
                    <td class="px-3 py-3 text-xs font-semibold">${log.credits_used || 0}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Export data to CSV
     */
    exportToCSV(type) {
        let data, filename, headers;

        switch(type) {
            case 'payments':
                data = this.data.payments;
                filename = 'payments.csv';
                headers = ['Date', 'Email', 'Amount', 'Credits', 'Status', 'Reference'];
                break;
            case 'activations':
                data = this.data.activations;
                filename = 'activations.csv';
                headers = ['Code', 'Credits', 'Status', 'Generated', 'Activated'];
                break;
            case 'usage_log':
                data = this.data.usageLog;
                filename = 'usage_log.csv';
                headers = ['Date', 'Tool', 'Action', 'User', 'Credits Used'];
                break;
            default:
                return;
        }

        // Build CSV
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            if (type === 'payments') {
                csv += `${row.created_at},${row.email},${row.amount},${row.credits},${row.status},${row.reference}\n`;
            } else if (type === 'activations') {
                csv += `${row.activation_code},${row.credits},${row.status},${row.generated_at},${row.activated_at || ''}\n`;
            } else if (type === 'usage_log') {
                csv += `${row.created_at},${row.tool_name || ''},${row.action},${row.email || row.device_id},${row.credits_used}\n`;
            }
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Show error message
     */
    showError(message) {
        alert('❌ ' + message);
    }
}
