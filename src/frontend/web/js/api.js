/**
 * API client for communicating with the Python backend via PyWebView
 */
class API {
    constructor() {
        this.baseDelay = 100; // ms
        this.isReady = false;
        this.initPromise = this.init();
    }
    
    async init() {
        // Wait for PyWebView to be ready
        if (typeof window.pywebview !== 'undefined') {
            this.isReady = true;
            return;
        }
        
        return new Promise((resolve) => {
            const checkReady = () => {
                if (typeof window.pywebview !== 'undefined') {
                    this.isReady = true;
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
    
    async call(method, ...args) {
        await this.initPromise;
        
        try {
            if (!window.pywebview || !window.pywebview.api) {
                throw new Error('Backend API not available');
            }
            
            console.log(`API call: ${method}`, args);
            const result = await window.pywebview.api[method](...args);
            
            if (result && result.error) {
                throw new Error(result.error);
            }
            
            return result;
            
        } catch (error) {
            console.error(`API call failed: ${method}`, error);
            throw error;
        }
    }
    
    // Authentication
    async login(email, password) {
        return this.call('login', email, password);
    }
    
    async logout() {
        return this.call('logout');
    }
    
    async getCurrentUser() {
        return this.call('get_current_user');
    }
    
    async validateSession() {
        return this.call('validate_session');
    }
    
    // Campaigns
    async getCampaigns(params = {}) {
        return this.call('get_campaigns', params);
    }
    
    async getCampaign(campaignId) {
        return this.call('get_campaign', campaignId);
    }
    
    async createCampaign(data) {
        return this.call('create_campaign', data);
    }
    
    async updateCampaign(campaignId, updates) {
        return this.call('update_campaign', campaignId, updates);
    }
    
    async deleteCampaign(campaignId) {
        return this.call('delete_campaign', campaignId);
    }
    
    async getCampaignStats(campaignId) {
        return this.call('get_campaign_stats', campaignId);
    }
    
    async exportCampaign(campaignId, format = 'xlsx') {
        return this.call('export_campaign', campaignId, format);
    }
    
    // Excel Import
    async validateExcelFile(filePath) {
        return this.call('validate_excel_file', filePath);
    }
    
    async importExcel(campaignId, filePath, mode = 'REPLACE') {
        return this.call('import_excel', campaignId, filePath, mode);
    }
    
    // Contacts
    async getCampaignContacts(campaignId, params = {}) {
        return this.call('get_campaign_contacts', campaignId, params);
    }
    
    async updateContactStatus(campaignId, contactId, status) {
        return this.call('update_contact_status', campaignId, contactId, status);
    }
    
    async searchContacts(campaignId, query, filters = {}) {
        return this.call('search_contacts', campaignId, query, filters);
    }
    
    // Email Templates
    async getTemplates(language = null) {
        return this.call('get_templates', language);
    }
    
    async getTemplate(templateId) {
        return this.call('get_template', templateId);
    }
    
    async createTemplate(template) {
        return this.call('create_template', template);
    }
    
    async updateTemplate(templateId, updates) {
        return this.call('update_template', templateId, updates);
    }
    
    async deleteTemplate(templateId) {
        return this.call('delete_template', templateId);
    }
    
    async previewEmail(templateId, contactId) {
        return this.call('preview_email', templateId, contactId);
    }
    
    // Email Sending
    async createSendWave(campaignId, waveType, templateId, filters = null) {
        return this.call('create_send_wave', campaignId, waveType, templateId, filters);
    }
    
    async startSendWave(waveId) {
        return this.call('start_send_wave', waveId);
    }
    
    async getWaveStatus(waveId) {
        return this.call('get_wave_status', waveId);
    }
    
    async stopSendWave(waveId) {
        return this.call('stop_send_wave', waveId);
    }
    
    // File operations
    async openFileDialog(options = {}) {
        const defaultOptions = {
            file_types: ['Excel files (*.xlsx;*.xls)|*.xlsx;*.xls'],
            multiselect: false,
            directory: null
        };
        
        return this.call('open_file_dialog', { ...defaultOptions, ...options });
    }
    
    async saveFileDialog(options = {}) {
        const defaultOptions = {
            file_types: ['Excel files (*.xlsx)|*.xlsx', 'CSV files (*.csv)|*.csv'],
            default_filename: '',
            directory: null
        };
        
        return this.call('save_file_dialog', { ...defaultOptions, ...options });
    }
    
    // OneDrive integration
    async downloadFromOneDrive(url) {
        return this.call('download_from_onedrive', url);
    }
    
    // Settings
    async getSettings() {
        return this.call('get_settings');
    }
    
    async updateSettings(settings) {
        return this.call('update_settings', settings);
    }
    
    // System
    async getDashboardStats() {
        return this.call('get_dashboard_stats');
    }
    
    async getSystemInfo() {
        return this.call('get_system_info');
    }
    
    async checkOutlookConnection() {
        return this.call('check_outlook_connection');
    }
    
    async getOutlookAccounts() {
        return this.call('get_outlook_accounts');
    }
    
    // Progress tracking
    subscribeToProgress(callback) {
        window.progressCallback = callback;
    }
    
    unsubscribeFromProgress() {
        delete window.progressCallback;
    }
    
    // Real-time updates
    subscribeToUpdates(callback) {
        window.updateCallback = callback;
    }
    
    unsubscribeFromUpdates() {
        delete window.updateCallback;
    }
    
    // Utility methods
    async testEmailConnection(recipient) {
        return this.call('test_email_connection', recipient);
    }
    
    async getAuditLogs(filters = {}) {
        return this.call('get_audit_logs', filters);
    }
    
    async backupDatabase() {
        return this.call('backup_database');
    }
    
    async restoreDatabase(backupPath) {
        return this.call('restore_database', backupPath);
    }
}

// Global API instance
window.api = new API();

// Helper function to show API errors
window.handleApiError = function(error, context = '') {
    console.error('API Error:', error);
    
    let message = error.message || 'An unexpected error occurred';
    
    // Common error handling
    if (message.includes('not available')) {
        message = 'The application backend is not available. Please restart the application.';
    } else if (message.includes('session')) {
        message = 'Your session has expired. Please log in again.';
        // Redirect to login if needed
        if (window.router) {
            window.router.navigate('/login');
        }
    } else if (message.includes('permission')) {
        message = 'You do not have permission to perform this action.';
    }
    
    // Show toast notification
    if (window.Toast) {
        window.Toast.error(message);
    } else {
        alert(message);
    }
    
    return message;
};

// Promise-based wrapper for common patterns
window.apiRequest = async function(apiCall, loadingMessage = 'Processing...') {
    try {
        if (window.LoadingOverlay) {
            window.LoadingOverlay.show(loadingMessage);
        }
        
        const result = await apiCall();
        
        if (window.LoadingOverlay) {
            window.LoadingOverlay.hide();
        }
        
        return result;
        
    } catch (error) {
        if (window.LoadingOverlay) {
            window.LoadingOverlay.hide();
        }
        
        window.handleApiError(error);
        throw error;
    }
};

console.log('API client initialized');