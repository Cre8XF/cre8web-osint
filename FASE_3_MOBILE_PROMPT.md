# 🚀 FASE 3: NYE FEATURES + MOBILOPTIMALISERING

Implementer alle Tier 1 features med mobiloptimalisering inkludert fra starten.

---

## 📱 DEL 1: KRITISKE MOBILFORBEDRINGER (1.5 timer) - GJØR FØRST!

### 1.1 Responsive Navigation med Hamburger Menu (30 min)

**Oppdater `js/components.js` - renderHeader():**

```javascript
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
                <span class="dot"></span>
                <strong>Cre8Web OSINT Hub</strong>
                <span class="version">v8</span>
            </div>
            
            <!-- Desktop Navigation -->
            <nav class="nav desktop-nav" role="navigation">
                ${pages.map(p => `
                    <button class="navlink ${p.id === activePage ? 'active' : ''}" 
                            data-href="${p.href}">
                        ${p.label}
                    </button>
                `).join('')}
                <input type="search" id="searchInput" placeholder="Søk… (Ctrl+K)">
                <button id="refreshBtn">🔄</button>
                <button id="themeToggle">🌓</button>
                <button id="toolsToggle">⚙️</button>
            </nav>
            
            <!-- Mobile Controls -->
            <div class="mobile-controls">
                <button class="mobile-btn" id="mobileSearchBtn">🔍</button>
                <button class="mobile-btn" id="mobileThemeBtn">🌓</button>
                <button class="mobile-btn mobile-menu-toggle" id="mobileMenuBtn">☰</button>
            </div>
        </header>
        
        <!-- Mobile Menu Overlay -->
        <div class="mobile-menu" id="mobileMenu">
            <button class="mobile-menu-close" id="mobileMenuClose">✕</button>
            <nav class="mobile-nav">
                ${pages.map(p => `
                    <a href="${p.href}" class="mobile-navlink ${p.id === activePage ? 'active' : ''}">
                        ${p.label}
                    </a>
                `).join('')}
            </nav>
        </div>
    `;
}
```

**Legg til i `js/components.js` - setupMobileMenu():**

```javascript
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('mobileMenuClose');
    const mobileThemeBtn = document.getElementById('mobileThemeBtn');
    
    if (!menuBtn || !menu || !closeBtn) return;
    
    menuBtn.addEventListener('click', () => {
        menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', closeMobileMenu);
    
    // Close on outside click
    menu.addEventListener('click', (e) => {
        if (e.target === menu) closeMobileMenu();
    });
    
    // Close when clicking link
    document.querySelectorAll('.mobile-navlink').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Mobile theme toggle
    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', () => {
            const currentTheme = document.body.dataset.theme;
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.dataset.theme = newTheme;
            localStorage.setItem('theme', JSON.stringify(newTheme));
        });
    }
    
    function closeMobileMenu() {
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Kall denne i initComponents()
export function initComponents(activePage) {
    // ... existing code ...
    setupMobileMenu();
}
```

**CSS i `css/index-theme.css`:**

```css
/* Mobile Controls */
.mobile-controls {
    display: none;
    gap: 0.5rem;
    align-items: center;
}

.mobile-btn {
    background: rgba(243, 244, 246, 0.9);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

body[data-theme='dark'] .mobile-btn {
    background: rgba(255, 255, 255, 0.08);
}

.mobile-btn:active {
    transform: scale(0.9);
}

/* Mobile Menu */
.mobile-menu {
    position: fixed;
    top: 0;
    left: -100%;
    width: 80%;
    max-width: 320px;
    height: 100vh;
    background: var(--bg-card);
    box-shadow: 2px 0 20px rgba(0,0,0,0.3);
    z-index: 2000;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
}

.mobile-menu.active {
    left: 0;
}

.mobile-menu-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.mobile-menu-close:active {
    transform: scale(0.9);
}

.mobile-nav {
    padding: 4rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.mobile-navlink {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-radius: 12px;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 1.1rem;
    transition: all 0.2s;
}

.mobile-navlink:active {
    transform: scale(0.98);
}

.mobile-navlink.active {
    background: var(--accent-blue);
    color: white;
}

/* Mobile Media Query */
@media (max-width: 768px) {
    .desktop-nav {
        display: none !important;
    }
    
    .mobile-controls {
        display: flex;
    }
    
    .topbar {
        justify-content: space-between;
        padding: 0.8rem 1rem;
    }
    
    .brand {
        font-size: 0.95rem;
    }
    
    .brand .version {
        display: none;
    }
}
```

---

### 1.2 Bottom Navigation Bar (30 min)

**Lag `js/bottom-nav.js` (NY FIL):**

```javascript
export function renderBottomNav(activePage) {
    const items = [
        { id: 'index', href: 'index.html', icon: '🏠', label: 'Hjem' },
        { id: 'ai', href: 'ai.html', icon: '🤖', label: 'AI' },
        { id: 'quick-add', isButton: true, icon: '➕', label: 'Legg til' },
        { id: 'osint', href: 'osint.html', icon: '🕵️', label: 'OSINT' },
        { id: 'more', isButton: true, icon: '⋯', label: 'Mer' }
    ];
    
    return `
        <nav class="bottom-nav" role="navigation">
            ${items.map(item => {
                if (item.isButton) {
                    return `
                        <button class="bottom-nav-item ${item.id === 'quick-add' ? 'quick-add' : ''}" 
                                id="${item.id}Btn">
                            <span class="icon">${item.icon}</span>
                            <span class="label">${item.label}</span>
                        </button>
                    `;
                }
                return `
                    <a href="${item.href}" 
                       class="bottom-nav-item ${item.id === activePage ? 'active' : ''}">
                        <span class="icon">${item.icon}</span>
                        <span class="label">${item.label}</span>
                    </a>
                `;
            }).join('')}
        </nav>
    `;
}

export function initBottomNav() {
    // More button opens sheet with additional pages
    const moreBtn = document.getElementById('moreBtn');
    if (moreBtn) {
        moreBtn.addEventListener('click', showMoreSheet);
    }
}

function showMoreSheet() {
    const sheet = document.createElement('div');
    sheet.className = 'action-sheet';
    sheet.innerHTML = `
        <div class="action-sheet-content">
            <h3>Flere sider</h3>
            <a href="projects.html" class="sheet-item">🧩 Prosjekter</a>
            <a href="news.html" class="sheet-item">📰 Nyheter</a>
            <a href="misc.html" class="sheet-item">🧰 Diverse</a>
            <button class="sheet-item sheet-cancel">Avbryt</button>
        </div>
    `;
    
    document.body.appendChild(sheet);
    setTimeout(() => sheet.classList.add('active'), 10);
    
    sheet.querySelector('.sheet-cancel').addEventListener('click', () => {
        sheet.classList.remove('active');
        setTimeout(() => sheet.remove(), 300);
    });
    
    sheet.addEventListener('click', (e) => {
        if (e.target === sheet) {
            sheet.classList.remove('active');
            setTimeout(() => sheet.remove(), 300);
        }
    });
}
```

**CSS for bottom nav i `css/index-theme.css`:**

```css
/* Bottom Navigation */
.bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-card);
    border-top: 1px solid rgba(0,0,0,0.1);
    padding: 0.5rem 0 max(0.5rem, env(safe-area-inset-bottom));
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
    .bottom-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    
    main {
        padding-bottom: calc(80px + env(safe-area-inset-bottom));
    }
}

.bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 60px;
}

.bottom-nav-item .icon {
    font-size: 1.5rem;
    transition: transform 0.2s;
}

.bottom-nav-item .label {
    font-size: 0.75rem;
    font-weight: 500;
}

.bottom-nav-item.active {
    color: var(--accent-blue);
}

.bottom-nav-item.active .icon {
    transform: scale(1.1);
}

.bottom-nav-item:active {
    transform: scale(0.95);
}

/* Quick Add Button (Center) */
.bottom-nav-item.quick-add .icon {
    background: var(--gradient-primary);
    color: white;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: -12px;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
    font-size: 1.8rem;
}

.bottom-nav-item.quick-add:active .icon {
    transform: scale(0.9);
}

/* Action Sheet */
.action-sheet {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 3000;
    display: flex;
    align-items: flex-end;
    opacity: 0;
    transition: opacity 0.3s;
}

.action-sheet.active {
    opacity: 1;
}

.action-sheet-content {
    width: 100%;
    background: var(--bg-card);
    border-radius: 20px 20px 0 0;
    padding: 1.5rem;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-sheet.active .action-sheet-content {
    transform: translateY(0);
}

.action-sheet-content h3 {
    margin: 0 0 1rem;
    text-align: center;
    opacity: 0.7;
}

.sheet-item {
    display: block;
    padding: 1rem;
    text-align: center;
    text-decoration: none;
    color: var(--text-primary);
    border-radius: 12px;
    margin-bottom: 0.5rem;
    background: var(--bg-secondary);
    font-weight: 500;
    border: none;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
}

.sheet-item:active {
    transform: scale(0.98);
}

.sheet-cancel {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}
```

**Oppdater `components.js` - initComponents():**

```javascript
import { renderBottomNav, initBottomNav } from './bottom-nav.js';

export function initComponents(activePage) {
    // ... existing code ...
    
    // Bottom nav (mobile only)
    if (window.innerWidth <= 768) {
        document.body.insertAdjacentHTML('beforeend', renderBottomNav(activePage));
        initBottomNav();
    }
}
```

---

### 1.3 Responsive Tools Panel (15 min)

**Oppdater `css/index-theme.css`:**

```css
.tools-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 380px;
    height: 100vh;
    padding: 1.2rem;
    transition: right var(--transition-slow);
    z-index: 1200;
    overflow-y: auto;
}

.tools-panel.active {
    right: 0;
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
    .tools-panel {
        right: -100%;
        width: 100%;
        max-width: 100vw;
        padding: 1rem;
    }
    
    .tools-panel.active {
        right: 0;
    }
    
    .tool textarea {
        height: 100px;
        font-size: 14px;
    }
}
```

---

### 1.4 Touch-Friendly Spacing (15 min)

**Oppdater `css/index-layout.css` og `css/index-theme.css`:**

```css
@media (max-width: 768px) {
    /* Større touch targets overalt */
    .fav-card {
        min-height: 150px;
        padding: 1.5rem 1rem;
    }
    
    .fav-card .remove {
        opacity: 1; /* Alltid synlig på mobil */
        top: 8px;
        right: 8px;
        padding: 8px 12px;
        font-size: 1rem;
        min-width: 44px;
        min-height: 44px;
    }
    
    .link-row {
        padding: 1rem 0.5rem;
        gap: 1rem;
        grid-template-columns: auto 48px 1fr;
    }
    
    .link-row .star {
        font-size: 1.6rem;
        padding: 8px;
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Større inputs (forhindrer iOS zoom) */
    input,
    textarea,
    select,
    button {
        min-height: 44px;
        font-size: 16px !important;
    }
    
    /* Grid adjustments */
    .favorites-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
    }
    
    /* Layout single column på små mobiler */
    @media (max-width: 480px) {
        .favorites-grid {
            grid-template-columns: 1fr;
        }
    }
    
    /* Større avstand mellom seksjoner */
    .card {
        padding: 1.5rem 1rem;
        margin-bottom: 1.5rem;
    }
}
```

---

### 1.5 Swipe Gestures (30 min)

**Lag `js/mobile-gestures.js` (NY FIL):**

```javascript
export function initSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }
    
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const diffX = touchEndX - touchStartX;
        const diffY = Math.abs(touchEndY - touchStartY);
        
        // Ignore vertical swipes
        if (diffY > 50) return;
        
        const mobileMenu = document.getElementById('mobileMenu');
        const toolsPanel = document.getElementById('toolsPanel');
        
        // Swipe right from left edge: Open mobile menu
        if (diffX > swipeThreshold && touchStartX < 50) {
            if (mobileMenu && !mobileMenu.classList.contains('active')) {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Swipe left: Close mobile menu or tools panel
        if (diffX < -swipeThreshold) {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (toolsPanel && toolsPanel.classList.contains('active')) {
                toolsPanel.classList.remove('active');
            }
        }
        
        // Swipe left from right edge: Open tools panel
        if (diffX < -swipeThreshold && touchStartX > window.innerWidth - 50) {
            if (toolsPanel && !toolsPanel.classList.contains('active')) {
                toolsPanel.classList.add('active');
            }
        }
    }
}

// Swipe-to-delete for favorites
export function initSwipeToDelete() {
    document.querySelectorAll('.fav-card').forEach(card => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        
        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });
        
        card.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (diff > 0 && diff < 100) {
                card.style.transform = `translateX(-${diff}px)`;
                card.style.opacity = 1 - (diff / 200);
            }
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            const diff = startX - currentX;
            
            if (diff > 80) {
                // Delete
                card.style.transform = 'translateX(-100%)';
                card.style.opacity = '0';
                setTimeout(() => {
                    const url = card.querySelector('a')?.href;
                    if (url) {
                        // Call removeFavorite() from favorites.js
                        card.remove();
                    }
                }, 300);
            } else {
                // Reset
                card.style.transform = '';
                card.style.opacity = '';
            }
            
            isSwiping = false;
        });
    });
}
```

**Oppdater `components.js` - initComponents():**

```javascript
import { initSwipeGestures, initSwipeToDelete } from './mobile-gestures.js';

export function initComponents(activePage) {
    // ... existing code ...
    
    // Mobile gestures
    if (window.innerWidth <= 768) {
        initSwipeGestures();
        setTimeout(initSwipeToDelete, 1000); // Wait for favorites to render
    }
}
```

---

## ✅ MOBILSJEKKLISTE

Etter DEL 1, test:

**Navigation:**
- [ ] Hamburger menu åpner/lukker
- [ ] Bottom nav vises på mobil
- [ ] Bottom nav markerer aktiv side
- [ ] "Mer" knapp viser action sheet
- [ ] Swipe fra venstre kant åpner menu
- [ ] Swipe lukker menu

**Touch:**
- [ ] Alle knapper minimum 44x44px
- [ ] Tools panel full bredde
- [ ] Favoritt-fjern knapp alltid synlig
- [ ] Ingen zoom ved focus på inputs

**Layout:**
- [ ] Single column på <480px
- [ ] Cards passer skjermen
- [ ] Ingen horizontal scroll

---

## 🎨 DEL 2-6: RESTEN AV FASE 3

Fortsett med resten av FASE 3 features fra CLAUDE_CODE_PROMPT.md:

- DEL 2: Smart Search (med mobile search modal)
- DEL 3: Quick Add (integrert med bottom nav)
- DEL 4: Collections (touch-optimized)
- DEL 5: Statistics (responsive dashboard)
- DEL 6: Auto Dark Mode

---

## 🚀 IMPLEMENTER NÅ

Gi denne til Claude Code:

```
Implementer DEL 1: KRITISKE MOBILFORBEDRINGER fra FASE_3_MOBILE_PROMPT.md

1. Responsive navigation med hamburger menu
2. Bottom navigation bar
3. Responsive tools panel
4. Touch-friendly spacing
5. Swipe gestures

Test på:
- iPhone 12 Pro (390x844)
- Pixel 5 (393x851)
- iPad (768x1024)

Når DEL 1 er ferdig og testet, fortsett med DEL 2-6 fra CLAUDE_CODE_PROMPT.md.
```

---

**Alt klart for mobile-first FASE 3!** 🚀📱
