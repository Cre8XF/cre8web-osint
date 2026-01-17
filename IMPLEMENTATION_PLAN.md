# 🤖 Claude Code Implementation Plan
## Cre8Web OSINT Hub - Refactoring Roadmap

---

## 🎯 SPRINT 1: KRITISKE FEIL (Estimat: 16-20 timer)

### Task 1.1: Lag shared components system
**Priority:** 🔴 Kritisk  
**Estimat:** 4 timer

**Files to create:**
- `js/components.js`

**Files to modify:**
- `index.html`
- `ai.html`
- `osint.html`
- `projects.html`
- `news.html`
- `misc.html`

**Implementation steps:**

1. **Create `js/components.js`:**
```javascript
/**
 * Shared UI components for all pages
 * Eliminates 370+ lines of duplicate HTML
 */

/**
 * Render header with navigation
 * @param {string} activePage - Current page ID
 * @returns {string} HTML string
 */
export function renderHeader(activePage = '') {
    const pages = [
        { id: 'index', label: '🏠 Hjem', href: 'index.html' },
        { id: 'ai', label: '🤖 AI', href: 'ai.html' },
        { id: 'osint', label: '🕵️ OSINT', href: 'osint.html' },
        { id: 'projects', label: '🧩 Prosjekter', href: 'projects.html' },
        { id: 'news', label: '📰 Nyheter', href: 'news.html' },
        { id: 'misc', label: '🧰 Diverse', href: 'misc.html' }
    ];
    
    return `
        <header class="topbar glass" role="banner">
            <div class="brand">
                <span class="dot" aria-hidden="true"></span>
                <strong>Cre8Web OSINT Hub</strong>
                <span class="version">v7</span>
            </div>
            <nav class="nav" role="navigation" aria-label="Hovednavigasjon">
                ${pages.map(p => `
                    <button class="navlink ${p.id === activePage ? 'active' : ''}" 
                            data-href="${p.href}"
                            aria-label="Gå til ${p.label}">
                        ${p.label}
                    </button>
                `).join('')}
                <input type="search" 
                       id="searchInput" 
                       placeholder="Søk i lenker…"
                       aria-label="Søk i lenker"
                       autocomplete="off">
                <button id="refreshBtn" title="Oppdater side" aria-label="Oppdater side">🔄</button>
                <button id="themeToggle" title="Bytt tema" aria-label="Bytt fargetema">🌓</button>
                <button id="toolsToggle" title="Åpne verktøy" aria-label="Åpne verktøypanel">⚙️</button>
            </nav>
        </header>
    `;
}

/**
 * Render tools panel (sidebar)
 * @returns {string} HTML string
 */
export function renderToolsPanel() {
    return `
        <aside id="toolsPanel" class="tools-panel glass" role="complementary" aria-label="Verktøypanel">
            <header>
                <h3>🧩 Mini-verktøy</h3>
                <button id="toolsClose" aria-label="Lukk verktøypanel">✕</button>
            </header>
            
            <section class="tool">
                <h4>JSON ⇄ CSV</h4>
                <textarea id="jsonInput" placeholder="Lim inn JSON eller CSV…" 
                          aria-label="Input for konvertering"></textarea>
                <div class="row">
                    <button data-tool="json-to-csv" aria-label="Konverter JSON til CSV">JSON → CSV</button>
                    <button data-tool="csv-to-json" aria-label="Konverter CSV til JSON">CSV → JSON</button>
                </div>
                <textarea id="jsonOutput" placeholder="Resultat…" readonly 
                          aria-label="Output fra konvertering"></textarea>
                <button class="copy" data-copy="#jsonOutput" aria-label="Kopier resultat">
                    📋 Kopier resultat
                </button>
            </section>
            
            <section class="tool">
                <h4>URL Encode / Decode</h4>
                <textarea id="urlBox" placeholder="Lim inn tekst eller URL…" 
                          aria-label="URL input"></textarea>
                <div class="row">
                    <button data-tool="url-encode" aria-label="URL encode">Encode</button>
                    <button data-tool="url-decode" aria-label="URL decode">Decode</button>
                </div>
            </section>
            
            <section class="tool">
                <h4>Base64 Encode / Decode</h4>
                <textarea id="b64Box" placeholder="Lim inn tekst…" 
                          aria-label="Base64 input"></textarea>
                <div class="row">
                    <button data-tool="b64-encode" aria-label="Base64 encode">Encode</button>
                    <button data-tool="b64-decode" aria-label="Base64 decode">Decode</button>
                </div>
            </section>
            
            <section class="tool">
                <h4>LocalStorage</h4>
                <button id="clearLs" aria-label="Tøm all lagret data">
                    🗑️ Tøm lagrede data
                </button>
            </section>
        </aside>
    `;
}

/**
 * Render footer
 * @returns {string} HTML string
 */
export function renderFooter() {
    return `
        <footer class="footer" role="contentinfo">
            <small>© 2025 Cre8Web — OSINT Hub</small>
        </footer>
    `;
}

/**
 * Initialize shared components on page load
 * @param {string} activePage - Current page ID
 */
export function initComponents(activePage) {
    // Insert header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.outerHTML = renderHeader(activePage);
    }
    
    // Insert tools panel
    const toolsPlaceholder = document.getElementById('tools-placeholder');
    if (toolsPlaceholder) {
        toolsPlaceholder.outerHTML = renderToolsPanel();
    }
    
    // Insert footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = renderFooter();
    }
    
    // Setup navigation event listeners
    setupNavigation();
}

/**
 * Setup navigation event listeners
 * Replaces inline onclick handlers
 */
function setupNavigation() {
    document.querySelectorAll('.navlink[data-href]').forEach(btn => {
        btn.addEventListener('click', () => {
            const href = btn.dataset.href;
            if (href) location.href = href;
        });
    });
}
```

2. **Modify all HTML files** to use placeholders:

```html
<!-- BEFORE (370 lines duplicated) -->
<header class="topbar glass">
    <!-- ... 80 lines of HTML ... -->
</header>

<!-- AFTER (1 line) -->
<div id="header-placeholder"></div>

<!-- Add before closing </body> -->
<script type="module">
    import { initComponents } from './js/components.js';
    initComponents('ai'); // or 'osint', 'projects', etc.
</script>
```

**Testing checklist:**
- [ ] All pages render header correctly
- [ ] Active page is highlighted in nav
- [ ] Navigation buttons work without errors
- [ ] Tools panel opens/closes
- [ ] Footer renders on all pages

---

### Task 1.2: Remove inline onclick handlers
**Priority:** 🔴 Kritisk  
**Estimat:** 2 timer

**Why:** Security (CSP violations) + Maintainability

**Files to modify:**
- All HTML files with `onclick="location.href='...'"`
- `js/page-init.js`

**Implementation:**

Replace this pattern everywhere:
```html
<!-- BAD -->
<button onclick="location.href='ai.html'">AI</button>

<!-- GOOD -->
<button data-href="ai.html" class="nav-button">AI</button>
```

Add to `js/page-init.js`:
```javascript
function setupNavigation() {
    // Event delegation for all navigation
    document.addEventListener('click', (e) => {
        const navBtn = e.target.closest('[data-href]');
        if (navBtn) {
            e.preventDefault();
            const href = navBtn.dataset.href;
            if (href) {
                window.location.href = href;
            }
        }
    });
}

// Call in boot function
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    // ... other setup
});
```

**Testing:**
- [ ] All navigation works
- [ ] No console errors
- [ ] CSP headers can be added without breaking functionality

---

### Task 1.3: Fix Service Worker to cache JSON files
**Priority:** 🔴 Kritisk  
**Estimat:** 2 timer

**File:** `service-worker.js`

**Current problem:** JSON files not cached = offline mode broken

**Implementation:**

```javascript
// service-worker.js
const CACHE_VERSION = 'cre8web-v7-premium';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// BEFORE: Missing JSON files
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // ...
];

// AFTER: Include all JSON
const STATIC_ASSETS = [
  // HTML
  '/',
  '/index.html',
  '/ai.html',
  '/osint.html',
  '/projects.html',
  '/news.html',
  '/misc.html',
  
  // CSS
  '/css/index-layout.css',
  '/css/index-theme.css',
  '/css/news.css',
  
  // JavaScript
  '/js/helpers.js',
  '/js/favorites.js',
  '/js/tools.js',
  '/js/news.js',
  '/js/page-init.js',
  '/js/page-render.js',
  '/js/index.js',
  '/js/components.js', // NEW
  
  // Data - MISSING BEFORE!
  '/data/links_sections_index.json',
  '/data/links_sections_ai.json',
  '/data/links_sections_osint.json',
  '/data/links_sections_projects.json',
  '/data/links_sections_news.json',
  '/data/links_sections_misc.json',
  
  // Assets
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png'
];

// Add version bump strategy
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v7.1...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Cache files one by one to see which fails
        return Promise.all(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => 
              console.error(`[SW] Failed to cache ${url}:`, err)
            )
          )
        );
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
  );
});

// Add offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET
  if (request.method !== 'GET') return;
  
  // For JSON files, use cache-first with network fallback
  if (request.url.endsWith('.json')) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          
          return fetch(request)
            .then(response => {
              if (response && response.status === 200) {
                const cache = caches.open(STATIC_CACHE);
                cache.then(c => c.put(request, response.clone()));
              }
              return response;
            })
            .catch(() => {
              // Return empty array if offline and not cached
              return new Response('[]', {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
  }
});
```

**Testing:**
- [ ] Install SW and verify all assets cached (check DevTools > Application > Cache Storage)
- [ ] Disable network, refresh page - should work
- [ ] JSON files load offline
- [ ] No console errors in offline mode

---

### Task 1.4: Add comprehensive error handling
**Priority:** 🔴 Kritisk  
**Estimat:** 4 timer

**Files to create:**
- `js/error-handler.js`

**Files to modify:**
- `js/page-render.js`
- `js/news.js`
- `js/favorites.js`
- `js/index.js`

**Implementation:**

**Create `js/error-handler.js`:**
```javascript
/**
 * Centralized error handling and logging
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
            context
        };
        
        this.logs.push(entry);
        console.error('[ErrorLogger]', entry);
        
        // In production, send to Sentry or similar
        // this.sendToBackend(entry);
        
        return entry;
    }
    
    static categorizeError(error) {
        if (error.message.includes('fetch')) return ErrorTypes.NETWORK;
        if (error.message.includes('JSON')) return ErrorTypes.PARSE;
        if (error.message.includes('localStorage')) return ErrorTypes.STORAGE;
        return ErrorTypes.UNKNOWN;
    }
    
    static getLogs() {
        return this.logs;
    }
}

// User-friendly error messages
const ERROR_MESSAGES = {
    [ErrorTypes.NETWORK]: 'Kunne ikke laste innhold. Sjekk internettforbindelsen.',
    [ErrorTypes.STORAGE]: 'Kunne ikke lagre data. Kontroller nettleserinnstillinger.',
    [ErrorTypes.PARSE]: 'Ugyldig dataformat. Prøv å laste siden på nytt.',
    [ErrorTypes.UNKNOWN]: 'En feil oppstod. Vennligst prøv igjen.'
};

/**
 * Show user-friendly error notification
 * @param {Error} error
 * @param {Object} context - Additional context
 */
export function showError(error, context = {}) {
    ErrorLogger.log(error, context);
    
    const type = ErrorLogger.categorizeError(error);
    const message = ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorTypes.UNKNOWN];
    
    showNotification(message, 'error');
}

/**
 * Show notification to user
 * @param {string} message
 * @param {string} type - 'error' | 'success' | 'info'
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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

/**
 * Loading state manager
 */
export class LoadingManager {
    static loaders = new Set();
    
    static show(id = 'default') {
        this.loaders.add(id);
        this.updateUI();
    }
    
    static hide(id = 'default') {
        this.loaders.delete(id);
        this.updateUI();
    }
    
    static updateUI() {
        const loader = document.getElementById('global-loader');
        
        if (this.loaders.size > 0 && !loader) {
            const div = document.createElement('div');
            div.id = 'global-loader';
            div.className = 'loading-overlay';
            div.innerHTML = `
                <div class="spinner"></div>
                <p>Laster...</p>
            `;
            div.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            document.body.appendChild(div);
        } else if (this.loaders.size === 0 && loader) {
            loader.remove();
        }
    }
}
```

**Update `js/page-render.js`:**
```javascript
import { showError, LoadingManager, withErrorHandler } from './error-handler.js';

// Wrap with error handler
async function loadSections() {
    const page = document.body.dataset.page;
    
    LoadingManager.show('sections');
    
    try {
        const res = await fetch(`data/links_sections_${page}.json`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const sections = await res.json();
        
        if (!Array.isArray(sections)) {
            throw new Error('Invalid JSON format: expected array');
        }
        
        render(sections);
    } catch (error) {
        showError(error, { page, function: 'loadSections' });
        
        // Show fallback UI
        const container = document.getElementById('sections');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>⚠️ Kunne ikke laste innhold</p>
                    <button onclick="location.reload()">Prøv igjen</button>
                </div>
            `;
        }
    } finally {
        LoadingManager.hide('sections');
    }
}
```

**Update `js/favorites.js`:**
```javascript
import { showError } from './error-handler.js';

export function setFavorites(arr) {
    try {
        ls.set(KEY, arr);
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            showError(
                new Error('localStorage is full. Export your favorites and remove some.'),
                { function: 'setFavorites', itemCount: arr.length }
            );
        } else {
            showError(error, { function: 'setFavorites' });
        }
        return false;
    }
}
```

**Testing:**
- [ ] Network errors show user-friendly messages
- [ ] Storage errors handled gracefully
- [ ] Loading states show/hide correctly
- [ ] Errors logged to console for debugging
- [ ] No unhandled promise rejections

---

### Task 1.5: Fix localStorage edge cases
**Priority:** 🔴 Kritisk  
**Estimat:** 2 timer

**File:** `js/helpers.js`

**Problems:**
1. Empty string edge case
2. No quota checking
3. No migration system

**Implementation:**

```javascript
// js/helpers.js

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
            if (estimatedSize > 4.5 * 1024 * 1024) { // 4.5MB warning (5MB typical limit)
                console.warn('[localStorage] Approaching quota limit');
            }
            
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('[localStorage] Quota exceeded');
                // Attempt to free up space
                this.cleanup();
            }
            console.error(`[localStorage] Failed to set "${key}":`, error);
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
        // Remove temporary data, old caches, etc.
        const keysToRemove = Object.keys(localStorage).filter(key =>
            key.startsWith('temp_') || key.startsWith('cache_')
        );
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`[localStorage] Cleaned up ${keysToRemove.length} keys`);
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

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add debounce utility
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

// Add throttle utility
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
```

**Testing:**
- [ ] Empty string handled correctly
- [ ] Quota exceeded handled gracefully
- [ ] Migration runs on first load
- [ ] Usage tracking works
- [ ] Cleanup removes temp data

---

## 📁 Expected file structure after Sprint 1

```
cre8web-osint/
├── index.html (refactored)
├── ai.html (refactored)
├── osint.html (refactored)
├── projects.html (refactored)
├── news.html (refactored)
├── misc.html (refactored)
├── offline.html (NEW)
├── css/
│   ├── index-layout.css
│   ├── index-theme.css
│   └── news.css
├── js/
│   ├── components.js (NEW)
│   ├── error-handler.js (NEW)
│   ├── helpers.js (updated)
│   ├── favorites.js (updated)
│   ├── tools.js
│   ├── news.js (updated)
│   ├── page-init.js (updated)
│   ├── page-render.js (updated)
│   └── index.js (updated)
├── data/
│   ├── links_sections_index.json (fix if empty)
│   ├── links_sections_ai.json
│   ├── links_sections_osint.json
│   ├── links_sections_projects.json
│   ├── links_sections_news.json
│   └── links_sections_misc.json
├── service-worker.js (updated)
└── manifest.json
```

---

## 🧪 Testing checklist for Sprint 1

### Functionality
- [ ] All pages load without errors
- [ ] Navigation works on all pages
- [ ] Favorites can be added/removed
- [ ] Tools panel opens/closes
- [ ] Search functionality works
- [ ] Theme toggle works

### Offline mode
- [ ] Service worker installs correctly
- [ ] All JSON files cached
- [ ] App works offline
- [ ] Offline page shows when no cache

### Error handling
- [ ] Network errors show user-friendly messages
- [ ] Storage errors handled
- [ ] Invalid JSON shows error state
- [ ] Loading states appear

### Performance
- [ ] No memory leaks (check DevTools Memory)
- [ ] No console errors
- [ ] Fast page loads (<2s)
- [ ] Smooth animations

---

## 🚀 Ready to implement?

Run these commands in Claude Code:

```bash
# 1. Create new files
touch js/components.js
touch js/error-handler.js
touch offline.html

# 2. Backup current files
cp js/helpers.js js/helpers.js.backup
cp js/favorites.js js/favorites.js.backup
cp service-worker.js service-worker.js.backup

# 3. Run tests after implementation
npm test  # (add testing framework first)

# 4. Commit changes
git add .
git commit -m "Sprint 1: Fix critical issues - components, error handling, SW"
git push
```

---

## 📞 Next Sprint Preview

**Sprint 2 will cover:**
- RSS proxy backend (Netlify Function)
- Loading states UI
- Memory leak fixes
- Offline page creation
- Manifest cleanup

**Estimated time:** 1 week

---

Want me to proceed with implementing Sprint 1? 🚀
