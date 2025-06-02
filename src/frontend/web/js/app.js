/**
 * Main application initialization and global functionality
 */
class App {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Survey Tool application...');
        
        try {
            // Wait for PyWebView API to be ready
            await this.waitForApi();
            
            // Check for existing session
            await this.checkAuthentication();
            
            // Initialize global event listeners
            this.initializeEventListeners();
            
            // Initialize theme management
            this.initializeTheme();
            
            // Initialize language selector
            this.initializeLanguageSelector();
            
            // If authenticated, start the router
            if (this.isAuthenticated) {
                this.startRouter();
            } else {
                this.showLoginPrompt();
            }
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application');
        }
    }
    
    async waitForApi() {
        return new Promise((resolve) => {
            const checkApi = () => {
                if (window.api && window.api.isReady) {
                    resolve();
                } else {
                    setTimeout(checkApi, 100);
                }
            };
            checkApi();
        });
    }
    
    async checkAuthentication() {
        try {
            const result = await window.api.validateSession();
            
            if (result.success) {
                this.currentUser = result.data;
                this.isAuthenticated = true;
                this.updateUserInterface();
                console.log('User authenticated:', this.currentUser.email);
            } else {
                this.isAuthenticated = false;
                console.log('No valid session found');
            }
            
        } catch (error) {
            console.log('Authentication check failed:', error);
            this.isAuthenticated = false;
        }
    }
    
    updateUserInterface() {
        if (!this.currentUser) return;
        
        // Update user avatar
        const userAvatar = document.querySelector('.user-avatar .avatar-text');
        if (userAvatar) {
            const initials = this.getInitials(this.currentUser.email);
            userAvatar.textContent = initials;
        }
        
        // Update user info in dropdown
        const userEmail = document.querySelector('.user-email');
        const userRole = document.querySelector('.user-role');
        
        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }
        
        if (userRole) {
            userRole.textContent = this.currentUser.role;
        }
    }
    
    getInitials(email) {
        if (!email) return 'U';
        
        const parts = email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        } else {
            return parts[0].substring(0, 2).toUpperCase();
        }
    }
    
    initializeEventListeners() {
        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                this.handleLogout();
            }
        });
        
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for global search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openGlobalSearch();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
        
        // Handle clicks outside dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });
    }
    
    initializeTheme() {
        // Get saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        this.setTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!savedTheme) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle icon
        const themeToggle = document.querySelector('.theme-toggle svg');
        if (themeToggle) {
            if (theme === 'dark') {
                themeToggle.innerHTML = '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>';
            } else {
                themeToggle.innerHTML = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>';
            }
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    initializeLanguageSelector() {
        const languageSelector = document.querySelector('.language-selector');
        
        if (languageSelector) {
            languageSelector.addEventListener('change', async (e) => {
                const language = e.target.value;
                await window.i18n.setLanguage(language);
                window.Toast.success(`Language changed to ${language.toUpperCase()}`);
            });
        }
    }
    
    startRouter() {
        // Router should already be initialized, just make sure navigation works
        if (window.router) {
            console.log('Router is ready');
        } else {
            console.error('Router not available');
        }
    }
    
    showLoginPrompt() {
        // For now, create a default admin user automatically
        // In a real application, you'd show a proper login form
        this.createDefaultSession();
    }
    
    async createDefaultSession() {
        try {
            const result = await window.api.login('admin@company.com', 'admin123');
            
            if (result.success) {
                this.currentUser = result.data.user;
                this.isAuthenticated = true;
                this.updateUserInterface();
                this.startRouter();
                window.Toast.success('Welcome to Survey Tool!');
            } else {
                this.showError('Failed to authenticate. Please check your credentials.');
            }
            
        } catch (error) {
            console.error('Auto-login failed:', error);
            this.showError('Authentication failed. Please restart the application.');
        }
    }
    
    async handleLogout() {
        try {
            await window.api.logout();
            
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Clear any cached data
            localStorage.removeItem('user-data');
            
            // Show logout message and restart
            window.Toast.success('Logged out successfully');
            
            // In a real app, you'd show login form
            // For this demo, we'll just reload
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Logout error:', error);
            window.Toast.error('Logout failed');
        }
    }
    
    openGlobalSearch() {
        // TODO: Implement global search functionality
        console.log('Global search not implemented yet');
    }
    
    closeModals() {
        // Close any open modals
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <div class="error-content">
                        <svg class="error-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                        </svg>
                        <h2>Application Error</h2>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            Reload Application
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // API error handler
    handleApiError(error, context = '') {
        console.error(`API Error ${context}:`, error);
        
        if (error.message?.includes('session')) {
            this.handleLogout();
            return;
        }
        
        const message = error.message || 'An unexpected error occurred';
        window.Toast.error(message);
    }
}

// Global loading overlay utilities
window.LoadingOverlay = {
    show(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = overlay?.querySelector('.loading-text');
        
        if (overlay) {
            if (text) text.textContent = message;
            overlay.classList.remove('hidden');
        }
    },
    
    hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
};

// Global confirmation dialog utility
window.confirmDialog = function(message, title = 'Confirm') {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirm-dialog');
        const titleEl = dialog?.querySelector('.modal-title');
        const messageEl = dialog?.querySelector('.confirm-message');
        const confirmBtn = dialog?.querySelector('.confirm-btn');
        const cancelBtn = dialog?.querySelector('.cancel-btn');
        const closeBtn = dialog?.querySelector('.modal-close');
        
        if (!dialog) {
            resolve(false);
            return;
        }
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        const cleanup = () => {
            dialog.classList.add('hidden');
            confirmBtn?.removeEventListener('click', handleConfirm);
            cancelBtn?.removeEventListener('click', handleCancel);
            closeBtn?.removeEventListener('click', handleCancel);
        };
        
        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };
        
        confirmBtn?.addEventListener('click', handleConfirm);
        cancelBtn?.addEventListener('click', handleCancel);
        closeBtn?.addEventListener('click', handleCancel);
        
        dialog.classList.remove('hidden');
    });
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (window.app) {
        window.app.handleApiError(event.reason, 'Unhandled Promise');
    }
    
    event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (window.Toast) {
        window.Toast.error('An unexpected error occurred');
    }
});

console.log('Application script loaded');