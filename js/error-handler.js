/**
 * Centralized error handling and user notifications
 */

// Error types
export const ErrorTypes = {
    NETWORK: 'network',
    STORAGE: 'storage',
    PARSE: 'parse',
    UNKNOWN: 'unknown'
};

// Error logger (could send to backend in production)
export class ErrorLogger {
    static logs = [];

    static log(error, context = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            type: this.categorizeError(error),
            context,
            userAgent: navigator.userAgent
        };

        this.logs.push(entry);
        console.error('[ErrorLogger]', entry);

        // In production, send to Sentry or similar
        // this.sendToBackend(entry);

        return entry;
    }

    static categorizeError(error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
            return ErrorTypes.NETWORK;
        }
        if (msg.includes('json') || msg.includes('parse') || msg.includes('unexpected')) {
            return ErrorTypes.PARSE;
        }
        if (msg.includes('storage') || msg.includes('quota')) {
            return ErrorTypes.STORAGE;
        }
        return ErrorTypes.UNKNOWN;
    }

    static getLogs() {
        return this.logs;
    }

    static clearLogs() {
        this.logs = [];
    }
}

// User-friendly error messages
const ERROR_MESSAGES = {
    [ErrorTypes.NETWORK]: 'Kunne ikke laste innhold. Sjekk internettforbindelsen.',
    [ErrorTypes.STORAGE]: 'Kunne ikke lagre data. Nettleserlagring kan være full.',
    [ErrorTypes.PARSE]: 'Ugyldig dataformat. Last siden på nytt.',
    [ErrorTypes.UNKNOWN]: 'En uventet feil oppstod. Prøv igjen.'
};

/**
 * Show user-friendly error notification
 * @param {Error} error
 * @param {Object} context - Additional context
 */
export function showError(error, context = {}) {
    ErrorLogger.log(error, context);

    const type = ErrorLogger.categorizeError(error);
    const message = ERROR_MESSAGES[type];

    showNotification(message, 'error');
}

/**
 * Show notification to user
 * @param {string} message
 * @param {string} type - 'error' | 'success' | 'info' | 'warning'
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');

    const colors = {
        error: '#ef4444',
        success: '#10b981',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-family: inherit;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Loading state manager
 */
export class LoadingManager {
    static loaders = new Set();
    static loaderEl = null;

    static show(id = 'default') {
        this.loaders.add(id);
        this.updateUI();
    }

    static hide(id = 'default') {
        this.loaders.delete(id);
        this.updateUI();
    }

    static updateUI() {
        if (this.loaders.size > 0 && !this.loaderEl) {
            this.loaderEl = document.createElement('div');
            this.loaderEl.id = 'global-loader';
            this.loaderEl.innerHTML = `
                <div class="spinner"></div>
                <p>Laster...</p>
            `;
            this.loaderEl.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-card, white);
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10000;
            `;
            document.body.appendChild(this.loaderEl);
        } else if (this.loaders.size === 0 && this.loaderEl) {
            this.loaderEl.remove();
            this.loaderEl = null;
        }
    }
}

/**
 * Async error wrapper
 * @param {Function} fn - Async function to wrap
 * @param {Object} context - Error context
 * @returns {Function} Wrapped function
 */
export function withErrorHandler(fn, context = {}) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            showError(error, { ...context, args });
            throw error; // Re-throw for caller to handle if needed
        }
    };
}

// Add CSS animations if not already present
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(59, 130, 246, 0.2);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Accessibility: Respect user preferences */
        @media (prefers-reduced-motion: reduce) {
            .notification,
            .spinner {
                animation: none !important;
            }
        }
    `;

    // Only add if not already present
    if (!document.getElementById('error-handler-styles')) {
        style.id = 'error-handler-styles';
        document.head.appendChild(style);
    }
}
