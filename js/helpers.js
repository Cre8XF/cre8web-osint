import { showError } from './error-handler.js';

/**
 * LocalStorage helper with comprehensive error handling
 */
export const ls = {
    /**
     * Get item from localStorage with fallback
     * @param {string} key
     * @param {any} fallback
     * @returns {any}
     */
    get: (key, fallback = null) => {
        try {
            const value = localStorage.getItem(key);

            // Handle null, undefined, and empty string
            if (value === null || value === undefined || value === '') {
                return fallback;
            }

            return JSON.parse(value);
        } catch (error) {
            console.error(`[localStorage] Failed to get "${key}":`, error);
            return fallback;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key
     * @param {any} value
     * @returns {boolean} Success status
     */
    set: (key, value) => {
        try {
            const serialized = JSON.stringify(value);

            // Check if we're approaching quota
            const estimatedSize = new Blob([serialized]).size;
            if (estimatedSize > 4.5 * 1024 * 1024) {
                console.warn('[localStorage] Approaching quota limit');
            }

            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('[localStorage] Quota exceeded');
                showError(
                    new Error('LocalStorage er full. Eksporter data og fjern noe.'),
                    { key, function: 'ls.set' }
                );
                // Attempt to free up space
                ls.cleanup();
            } else {
                console.error(`[localStorage] Failed to set "${key}":`, error);
                showError(error, { key, function: 'ls.set' });
            }
            return false;
        }
    },

    /**
     * Delete item from localStorage
     * @param {string} key
     */
    del: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`[localStorage] Failed to delete "${key}":`, error);
        }
    },

    /**
     * Get current storage usage
     * @returns {Object} { used: number, available: number, percentage: number }
     */
    getUsage: () => {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }

            const totalBytes = total * 2; // UTF-16 = 2 bytes per char
            const limitBytes = 5 * 1024 * 1024; // 5MB typical limit

            return {
                used: totalBytes,
                available: limitBytes,
                percentage: (totalBytes / limitBytes) * 100
            };
        } catch (error) {
            return { used: 0, available: 0, percentage: 0 };
        }
    },

    /**
     * Clean up old/unused data
     */
    cleanup: () => {
        try {
            // Remove temporary data, old caches, etc.
            const keysToRemove = Object.keys(localStorage).filter(key =>
                key.startsWith('temp_') || key.startsWith('cache_')
            );

            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log(`[localStorage] Cleaned up ${keysToRemove.length} keys`);
            return keysToRemove.length;
        } catch (error) {
            console.error('[localStorage] Cleanup failed:', error);
            return 0;
        }
    }
};

/**
 * Storage versioning and migration
 */
const STORAGE_VERSION = 2;
const VERSION_KEY = 'storageVersion';

export function migrateStorage() {
    const currentVersion = ls.get(VERSION_KEY, 1);

    if (currentVersion < STORAGE_VERSION) {
        console.log(`[Migration] Upgrading from v${currentVersion} to v${STORAGE_VERSION}`);

        // Version 1 -> 2: Add timestamps to favorites
        if (currentVersion < 2) {
            const favorites = ls.get('favorites', []);
            const migrated = favorites.map(fav => ({
                ...fav,
                addedAt: fav.addedAt || new Date().toISOString()
            }));
            ls.set('favorites', migrated);
        }

        // Add more migrations as needed

        ls.set(VERSION_KEY, STORAGE_VERSION);
        console.log('[Migration] Complete');
    }
}

// Run migration on load
if (typeof window !== 'undefined') {
    migrateStorage();
}

// Utility functions
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Debounce utility - delays function execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
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

/**
 * Throttle utility - limits function execution to once per limit period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit period in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
