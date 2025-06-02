/**
 * Internationalization (i18n) manager
 */
class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.availableLanguages = ['en', 'fr', 'de', 'es'];
        
        this.init();
    }
    
    async init() {
        // Get saved language preference
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.availableLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        } else {
            // Detect browser language
            const browserLang = navigator.language.substring(0, 2);
            if (this.availableLanguages.includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }
        
        // Load translations
        await this.loadTranslations(this.currentLanguage);
        
        // Update language selector
        this.updateLanguageSelector();
        
        // Apply translations
        this.applyTranslations();
    }
    
    async loadTranslations(language) {
        if (this.translations[language]) {
            return;
        }
        
        try {
            const response = await fetch(`i18n/${language}.json`);
            if (response.ok) {
                this.translations[language] = await response.json();
            } else {
                console.warn(`Failed to load translations for ${language}`);
                if (language !== this.fallbackLanguage) {
                    await this.loadTranslations(this.fallbackLanguage);
                }
            }
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            if (language !== this.fallbackLanguage) {
                await this.loadTranslations(this.fallbackLanguage);
            }
        }
    }
    
    async setLanguage(language) {
        if (!this.availableLanguages.includes(language)) {
            console.warn(`Language ${language} is not available`);
            return;
        }
        
        this.currentLanguage = language;
        localStorage.setItem('preferred-language', language);
        
        // Load translations if not already loaded
        await this.loadTranslations(language);
        
        // Update UI
        this.updateLanguageSelector();
        this.applyTranslations();
        
        // Update document language
        document.documentElement.lang = language;
        
        // Emit language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language }
        }));
    }
    
    translate(key, params = {}) {
        const translation = this.getTranslation(key);
        
        // Replace parameters
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }
    
    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                // Fallback to default language
                translation = this.translations[this.fallbackLanguage];
                for (const fallbackKey of keys) {
                    if (translation && typeof translation === 'object' && fallbackKey in translation) {
                        translation = translation[fallbackKey];
                    } else {
                        return key; // Return key if no translation found
                    }
                }
                break;
            }
        }
        
        return typeof translation === 'string' ? translation : key;
    }
    
    applyTranslations() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Handle placeholder translations
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            
            if (translation !== key) {
                element.placeholder = translation;
            }
        });
        
        // Handle title translations
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.getTranslation(key);
            
            if (translation !== key) {
                element.title = translation;
            }
        });
    }
    
    updateLanguageSelector() {
        const selector = document.querySelector('.language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }
    
    // Utility methods
    formatDate(date, options = {}) {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return dateObj.toLocaleDateString(this.currentLanguage, {
            ...defaultOptions,
            ...options
        });
    }
    
    formatDateTime(date, options = {}) {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return dateObj.toLocaleDateString(this.currentLanguage, {
            ...defaultOptions,
            ...options
        });
    }
    
    formatNumber(number, options = {}) {
        if (typeof number !== 'number') return number;
        
        return number.toLocaleString(this.currentLanguage, options);
    }
    
    formatCurrency(amount, currency = 'USD', options = {}) {
        if (typeof amount !== 'number') return amount;
        
        const defaultOptions = {
            style: 'currency',
            currency: currency
        };
        
        return amount.toLocaleString(this.currentLanguage, {
            ...defaultOptions,
            ...options
        });
    }
    
    formatPercent(value, options = {}) {
        if (typeof value !== 'number') return value;
        
        const defaultOptions = {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        };
        
        return (value / 100).toLocaleString(this.currentLanguage, {
            ...defaultOptions,
            ...options
        });
    }
}

// Global i18n instance
window.i18n = new I18n();

// Helper functions
window.t = function(key, params = {}) {
    return window.i18n.translate(key, params);
};

window.formatDate = function(date, options = {}) {
    return window.i18n.formatDate(date, options);
};

window.formatDateTime = function(date, options = {}) {
    return window.i18n.formatDateTime(date, options);
};

window.formatNumber = function(number, options = {}) {
    return window.i18n.formatNumber(number, options);
};

window.formatPercent = function(value, options = {}) {
    return window.i18n.formatPercent(value, options);
};

// Auto-apply translations when DOM changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Apply translations to new elements
                    const elements = node.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-title]');
                    if (elements.length > 0 || node.hasAttribute('data-i18n')) {
                        setTimeout(() => window.i18n.applyTranslations(), 0);
                    }
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('I18n system initialized');