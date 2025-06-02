/**
 * Simple SPA router for navigation
 */
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.defaultRoute = '/dashboard';
        
        // Bind event listeners
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        window.addEventListener('load', this.handleLoad.bind(this));
        
        // Register default routes
        this.registerDefaultRoutes();
    }
    
    registerDefaultRoutes() {
        this.addRoute('/', () => this.navigate('/dashboard'));
        this.addRoute('/dashboard', () => this.renderView('Dashboard'));
        this.addRoute('/campaigns', () => this.renderView('Campaigns'));
        this.addRoute('/campaigns/:id', (params) => this.renderView('CampaignDetail', params));
        this.addRoute('/templates', () => this.renderView('Templates'));
        this.addRoute('/settings', () => this.renderView('Settings'));
        this.addRoute('/profile', () => this.renderView('Profile'));
        this.addRoute('/import/:campaignId', (params) => this.renderView('ImportWizard', params));
    }
    
    addRoute(path, handler) {
        // Convert path with parameters to regex
        const paramNames = [];
        const regexPath = path.replace(/:([^/]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });
        
        this.routes.set(path, {
            regex: new RegExp(`^${regexPath}$`),
            paramNames,
            handler
        });
    }
    
    navigate(path) {
        if (path !== window.location.hash.substring(1)) {
            window.location.hash = path;
        } else {
            this.handleRoute(path);
        }
    }
    
    handleHashChange() {
        const path = window.location.hash.substring(1) || '/';
        this.handleRoute(path);
    }
    
    handleLoad() {
        const path = window.location.hash.substring(1) || '/';
        this.handleRoute(path);
    }
    
    handleRoute(path) {
        let matched = false;
        
        for (const [routePath, route] of this.routes) {
            const match = path.match(route.regex);
            
            if (match) {
                matched = true;
                this.currentRoute = routePath;
                
                // Extract parameters
                const params = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                
                // Update navigation
                this.updateNavigation(path);
                
                // Call handler
                try {
                    route.handler(params);
                } catch (error) {
                    console.error('Route handler error:', error);
                    this.renderError('Failed to load page');
                }
                
                break;
            }
        }
        
        if (!matched) {
            console.warn('No route found for:', path);
            this.navigate(this.defaultRoute);
        }
    }
    
    updateNavigation(currentPath) {
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const route = href ? href.substring(1) : ''; // Remove #
            
            if (currentPath === route || currentPath.startsWith(route + '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    async renderView(viewName, params = {}) {
        const mainContent = document.getElementById('main-content');
        
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }
        
        try {
            // Show loading state
            this.showLoading();
            
            // Get view class
            const ViewClass = window[`${viewName}View`];
            
            if (!ViewClass) {
                throw new Error(`View class ${viewName}View not found`);
            }
            
            // Create and render view
            const view = new ViewClass(params);
            await view.render();
            
            // Update page title
            this.updatePageTitle(viewName);
            
        } catch (error) {
            console.error(`Error rendering view ${viewName}:`, error);
            this.renderError(`Failed to load ${viewName} page`);
        }
    }
    
    showLoading() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p data-i18n="common.loading">Loading...</p>
            </div>
        `;
    }
    
    renderError(message) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="error-container">
                <div class="error-content">
                    <svg class="error-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                    </svg>
                    <h2>Page Error</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.router.navigate('/dashboard')">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        `;
    }
    
    updatePageTitle(viewName) {
        const titleMap = {
            'Dashboard': 'Dashboard',
            'Campaigns': 'Campaigns',
            'CampaignDetail': 'Campaign Details',
            'Templates': 'Email Templates',
            'Settings': 'Settings',
            'ImportWizard': 'Import Contacts'
        };
        
        const baseTitle = 'Survey Tool';
        const pageTitle = titleMap[viewName] || viewName;
        
        document.title = `${pageTitle} - ${baseTitle}`;
    }
    
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    getParams() {
        const path = window.location.hash.substring(1) || '/';
        
        for (const [routePath, route] of this.routes) {
            const match = path.match(route.regex);
            
            if (match) {
                const params = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                return params;
            }
        }
        
        return {};
    }
    
    goBack() {
        window.history.back();
    }
    
    // Utility methods
    buildUrl(path, params = {}) {
        let url = path;
        
        // Replace parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        return url;
    }
    
    isCurrentRoute(path) {
        const currentPath = window.location.hash.substring(1) || '/';
        return currentPath === path || currentPath.startsWith(path + '/');
    }
}

// Add error container styles
const errorStyles = `
.error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
}

.error-content {
    text-align: center;
    max-width: 400px;
}

.error-icon {
    color: #ef4444;
    margin-bottom: 1rem;
}

.error-content h2 {
    color: #374151;
    margin-bottom: 0.5rem;
}

.error-content p {
    color: #6b7280;
    margin-bottom: 1.5rem;
}
`;

// Inject styles
if (!document.getElementById('router-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'router-styles';
    styleSheet.textContent = errorStyles;
    document.head.appendChild(styleSheet);
}

// Create global router instance
window.router = new Router();

console.log('Router initialized');