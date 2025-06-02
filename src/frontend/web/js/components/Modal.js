/**
 * Modal component for dialogs and overlays
 */
class Modal {
    static activeModals = new Set();
    static nextId = 1;
    
    static create(options = {}) {
        const id = options.id || `modal-${this.nextId++}`;
        const {
            title = 'Modal',
            content = '',
            size = 'medium',
            closable = true,
            backdrop = true,
            keyboard = true,
            centered = false,
            className = '',
            onShow = null,
            onHide = null,
            onConfirm = null,
            confirmText = 'OK',
            cancelText = 'Cancel',
            showFooter = true,
            showCancel = true
        } = options;
        
        // Remove existing modal with same ID
        this.remove(id);
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal ${className}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${id}-title`);
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-dialog modal-${size} ${centered ? 'modal-centered' : ''}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="${id}-title">${title}</h3>
                        ${closable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${showFooter ? `
                        <div class="modal-footer">
                            ${showCancel ? `<button class="btn btn-secondary modal-cancel">${cancelText}</button>` : ''}
                            <button class="btn btn-primary modal-confirm">${confirmText}</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const confirmBtn = modal.querySelector('.modal-confirm');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const hide = () => this.hide(id);
        
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hide);
        }
        
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', () => {
                const result = onConfirm();
                if (result !== false) {
                    hide();
                }
            });
        } else if (confirmBtn) {
            confirmBtn.addEventListener('click', hide);
        }
        
        if (backdrop && backdrop) {
            backdrop.addEventListener('click', hide);
        }
        
        if (keyboard) {
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    hide();
                }
            };
            document.addEventListener('keydown', handleKeydown);
            modal._keydownHandler = handleKeydown;
        }
        
        // Store callbacks
        modal._onShow = onShow;
        modal._onHide = onHide;
        
        return modal;
    }
    
    static show(id, animation = true) {
        const modal = document.getElementById(id);
        if (!modal) return false;
        
        // Call onShow callback
        if (modal._onShow) {
            modal._onShow();
        }
        
        // Show modal
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        if (animation) {
            // Trigger animation
            setTimeout(() => {
                modal.classList.add('modal-show');
            }, 10);
        } else {
            modal.classList.add('modal-show');
        }
        
        // Focus management
        this.trapFocus(modal);
        
        // Track active modal
        this.activeModals.add(id);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        return true;
    }
    
    static hide(id, animation = true) {
        const modal = document.getElementById(id);
        if (!modal) return false;
        
        // Call onHide callback
        if (modal._onHide) {
            modal._onHide();
        }
        
        if (animation) {
            modal.classList.remove('modal-show');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.add('hidden');
            }, 300);
        } else {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
        
        // Remove from active modals
        this.activeModals.delete(id);
        
        // Restore body scroll if no modals are open
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }
        
        // Remove keydown handler
        if (modal._keydownHandler) {
            document.removeEventListener('keydown', modal._keydownHandler);
        }
        
        return true;
    }
    
    static remove(id) {
        this.hide(id, false);
        const modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
    }
    
    static hideAll() {
        this.activeModals.forEach(id => this.hide(id));
    }
    
    static trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        firstElement.focus();
        
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
    }
    
    // Convenience methods
    static alert(message, title = 'Alert') {
        return new Promise((resolve) => {
            const modal = this.create({
                id: 'alert-modal',
                title,
                content: `<p>${message}</p>`,
                showCancel: false,
                onConfirm: () => resolve(true)
            });
            
            this.show('alert-modal');
        });
    }
    
    static confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const modal = this.create({
                id: 'confirm-modal',
                title,
                content: `<p>${message}</p>`,
                confirmText: 'Yes',
                cancelText: 'No',
                onConfirm: () => resolve(true),
                onHide: () => resolve(false)
            });
            
            this.show('confirm-modal');
        });
    }
    
    static prompt(message, defaultValue = '', title = 'Input') {
        return new Promise((resolve) => {
            const inputId = 'prompt-input';
            const modal = this.create({
                id: 'prompt-modal',
                title,
                content: `
                    <p>${message}</p>
                    <input type="text" id="${inputId}" class="form-control" value="${defaultValue}" autofocus>
                `,
                onConfirm: () => {
                    const input = document.getElementById(inputId);
                    resolve(input ? input.value : null);
                },
                onHide: () => resolve(null)
            });
            
            this.show('prompt-modal');
        });
    }
}

// Add modal styles
const modalStyles = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal.modal-show {
    opacity: 1;
}

.modal.hidden {
    display: none !important;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
}

.modal-dialog {
    position: relative;
    margin: 1rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    max-height: calc(100vh - 2rem);
    overflow: auto;
    transform: scale(0.9) translateY(-50px);
    transition: transform 0.3s ease;
    width: 100%;
}

.modal-show .modal-dialog {
    transform: scale(1) translateY(0);
}

.modal-small {
    max-width: 400px;
}

.modal-medium {
    max-width: 600px;
}

.modal-large {
    max-width: 900px;
}

.modal-xl {
    max-width: 1200px;
}

.modal-centered {
    align-items: center;
}

.modal-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
}

.modal-close:hover {
    color: #374151;
    background-color: #f3f4f6;
}

.modal-body {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.modal-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
}

@media (max-width: 640px) {
    .modal-dialog {
        margin: 0.5rem;
        max-height: calc(100vh - 1rem);
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }
    
    .modal-footer {
        flex-direction: column-reverse;
    }
    
    .modal-footer .btn {
        width: 100%;
    }
}

/* Dark theme support */
[data-theme="dark"] .modal-dialog {
    background: #1f2937;
    color: #f9fafb;
}

[data-theme="dark"] .modal-header {
    border-bottom-color: #374151;
}

[data-theme="dark"] .modal-footer {
    border-top-color: #374151;
    background-color: #111827;
}

[data-theme="dark"] .modal-title {
    color: #f9fafb;
}

[data-theme="dark"] .modal-close {
    color: #9ca3af;
}

[data-theme="dark"] .modal-close:hover {
    color: #f9fafb;
    background-color: #374151;
}
`;

// Inject styles
if (!document.getElementById('modal-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'modal-styles';
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
}

// Make Modal available globally
window.Modal = Modal;

console.log('Modal component initialized');