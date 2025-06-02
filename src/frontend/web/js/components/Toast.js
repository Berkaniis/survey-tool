/**
 * Toast notification system
 */
class Toast {
    static container = null;
    static toasts = new Map();
    static nextId = 1;
    
    static init() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        }
    }
    
    static show(message, type = 'info', options = {}) {
        this.init();
        
        const id = this.nextId++;
        const duration = options.duration || (type === 'error' ? 10000 : 5000);
        const persistent = options.persistent || false;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icon}</div>
                <div class="toast-message">${message}</div>
                ${!persistent ? '<button class="toast-close" aria-label="Close notification">×</button>' : ''}
            </div>
            <div class="toast-progress"></div>
        `;
        
        // Add event listeners
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(id));
        }
        
        // Add to container
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('toast-show'), 10);
        
        // Auto-hide if not persistent
        if (!persistent) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.animationDuration = `${duration}ms`;
                progressBar.classList.add('toast-progress-animate');
            }
            
            setTimeout(() => this.hide(id), duration);
        }
        
        this.toasts.set(id, toast);
        return id;
    }
    
    static hide(id) {
        const toast = this.toasts.get(id);
        if (toast) {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(id);
            }, 300);
        }
    }
    
    static hideAll() {
        this.toasts.forEach((toast, id) => this.hide(id));
    }
    
    static success(message, options = {}) {
        return this.show(message, 'success', options);
    }
    
    static error(message, options = {}) {
        return this.show(message, 'error', options);
    }
    
    static warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }
    
    static info(message, options = {}) {
        return this.show(message, 'info', options);
    }
    
    static getIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>'
        };
        
        return icons[type] || icons.info;
    }
}

// Add CSS styles
const toastStyles = `
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 400px;
}

.toast {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    border-left: 4px solid;
    overflow: hidden;
    position: relative;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
}

.toast.toast-show {
    transform: translateX(0);
    opacity: 1;
}

.toast.toast-hide {
    transform: translateX(100%);
    opacity: 0;
}

.toast-success {
    border-left-color: #10b981;
}

.toast-error {
    border-left-color: #ef4444;
}

.toast-warning {
    border-left-color: #f59e0b;
}

.toast-info {
    border-left-color: #3b82f6;
}

.toast-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
}

.toast-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
}

.toast-success .toast-icon {
    color: #10b981;
}

.toast-error .toast-icon {
    color: #ef4444;
}

.toast-warning .toast-icon {
    color: #f59e0b;
}

.toast-info .toast-icon {
    color: #3b82f6;
}

.toast-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
    color: #374151;
}

.toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    font-size: 18px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toast-close:hover {
    color: #6b7280;
}

.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: currentColor;
    opacity: 0.3;
    transform-origin: left;
    transform: scaleX(0);
}

.toast-progress-animate {
    animation: toast-progress linear forwards;
}

@keyframes toast-progress {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}

@media (max-width: 640px) {
    .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
`;

// Inject styles
if (!document.getElementById('toast-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'toast-styles';
    styleSheet.textContent = toastStyles;
    document.head.appendChild(styleSheet);
}

// Make Toast available globally
window.Toast = Toast;
window.showToast = Toast.show.bind(Toast);

console.log('Toast system initialized');