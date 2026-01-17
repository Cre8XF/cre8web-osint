/**
 * Shared UI components for all pages
 * Eliminates 370+ lines of duplicate HTML
 */

/**
 * Render header with navigation
 * @param {string} activePage - Current page ID ('index', 'ai', 'osint', etc.)
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

    // Extra buttons for index page
    const indexButtons = activePage === 'index' ? `
        <button id="toggleFavorites" title="Scroll til topp" aria-label="Scroll til topp">⭐</button>
        <button id="exportBtn" title="Eksporter favoritter" aria-label="Eksporter favoritter">💾</button>
        <button id="importBtn" title="Importer favoritter" aria-label="Importer favoritter">📂</button>
    ` : '';

    return `
        <header class="topbar glass" role="banner">
            <!-- Mobile hamburger menu -->
            <button id="mobileMenuToggle" class="mobile-menu-btn" aria-label="Åpne meny" aria-expanded="false">
                <span class="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            <div class="brand">
                <span class="dot" aria-hidden="true"></span>
                <strong>Cre8Web OSINT Hub</strong>
                <span class="version">v8</span>
            </div>

            <!-- Desktop navigation -->
            <nav class="nav desktop-nav" role="navigation" aria-label="Hovednavigasjon">
                ${pages.map(p => `
                    <button class="navlink ${p.id === activePage ? 'active' : ''}"
                            data-href="${p.href}"
                            aria-label="Gå til ${p.label}"
                            aria-current="${p.id === activePage ? 'page' : 'false'}">
                        ${p.label}
                    </button>
                `).join('')}

                <input type="search"
                       id="searchInput"
                       class="desktop-search"
                       placeholder="Søk… (Ctrl+K)"
                       aria-label="Søk i ${activePage === 'index' ? 'favoritter' : 'lenker'}"
                       autocomplete="off">

                ${indexButtons}
                <button id="refreshBtn" title="Oppdater side" aria-label="Oppdater side">🔄</button>
                <button id="themeToggle" title="Bytt tema (light/dark)" aria-label="Bytt fargetema">🌓</button>
                <button id="toolsToggle" title="Åpne mini-verktøy" aria-label="Åpne verktøypanel">⚙️</button>
            </nav>

            <!-- Mobile search button -->
            <button id="mobileSearchBtn" class="mobile-search-btn" aria-label="Søk">
                🔍
            </button>
        </header>

        <!-- Mobile drawer menu -->
        <div id="mobileDrawer" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigasjonsmeny">
            <div class="mobile-drawer-overlay"></div>
            <div class="mobile-drawer-content">
                <header class="mobile-drawer-header">
                    <h2>Meny</h2>
                    <button id="mobileDrawerClose" aria-label="Lukk meny">✕</button>
                </header>
                <nav class="mobile-drawer-nav" role="navigation">
                    ${pages.map(p => `
                        <a href="${p.href}"
                           class="mobile-nav-item ${p.id === activePage ? 'active' : ''}"
                           aria-current="${p.id === activePage ? 'page' : 'false'}">
                            ${p.label}
                        </a>
                    `).join('')}
                </nav>
                <div class="mobile-drawer-actions">
                    ${indexButtons}
                    <button id="mobileRefreshBtn" aria-label="Oppdater side">🔄 Oppdater</button>
                    <button id="mobileThemeToggle" aria-label="Bytt tema">🌓 Bytt tema</button>
                    <button id="mobileToolsToggle" aria-label="Åpne verktøy">⚙️ Verktøy</button>
                </div>
            </div>
        </div>

        <!-- Mobile search modal -->
        <div id="mobileSearchModal" class="mobile-search-modal" role="dialog" aria-modal="true" aria-label="Søk">
            <div class="mobile-search-modal-overlay"></div>
            <div class="mobile-search-modal-content">
                <div class="mobile-search-header">
                    <input type="search"
                           id="mobileSearchInput"
                           placeholder="Søk i ${activePage === 'index' ? 'favoritter' : 'lenker'}…"
                           aria-label="Søk"
                           autocomplete="off">
                    <button id="mobileSearchClose" aria-label="Lukk søk">✕</button>
                </div>
                <div id="mobileSearchResults" class="mobile-search-results"></div>
            </div>
        </div>
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
                <label for="jsonInput" class="sr-only">JSON eller CSV input</label>
                <textarea id="jsonInput" placeholder="Lim inn JSON eller CSV…"
                          aria-label="Input for konvertering"></textarea>
                <div class="row">
                    <button data-tool="json-to-csv" aria-label="Konverter JSON til CSV">JSON → CSV</button>
                    <button data-tool="csv-to-json" aria-label="Konverter CSV til JSON">CSV → JSON</button>
                </div>
                <label for="jsonOutput" class="sr-only">Konvertert resultat</label>
                <textarea id="jsonOutput" placeholder="Resultat…" readonly
                          aria-label="Output fra konvertering"></textarea>
                <button class="copy" data-copy="#jsonOutput" aria-label="Kopier resultat">
                    📋 Kopier resultat
                </button>
            </section>

            <section class="tool">
                <h4>URL Encode / Decode</h4>
                <label for="urlBox" class="sr-only">URL eller tekst</label>
                <textarea id="urlBox" placeholder="Lim inn tekst eller URL…"
                          aria-label="URL input"></textarea>
                <div class="row">
                    <button data-tool="url-encode" aria-label="URL encode">Encode</button>
                    <button data-tool="url-decode" aria-label="URL decode">Decode</button>
                </div>
            </section>

            <section class="tool">
                <h4>Base64 Encode / Decode</h4>
                <label for="b64Box" class="sr-only">Base64 tekst</label>
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
            <small>© 2025 Cre8Web — OSINT Hub v8.0</small>
            <br>
            <small>
                <a href="https://github.com/cre8web" target="_blank" rel="noopener">GitHub</a> •
                <a href="mailto:kontakt@cre8web.no">Kontakt</a> •
                <a href="#" id="aboutLink">Om prosjektet</a>
            </small>
        </footer>
    `;
}

/**
 * Render bottom navigation bar (mobile only)
 * @param {string} activePage - Current page ID
 * @returns {string} HTML string
 */
export function renderBottomNav(activePage = '') {
    const navItems = [
        { id: 'index', icon: '🏠', label: 'Hjem', href: 'index.html' },
        { id: 'ai', icon: '🤖', label: 'AI', href: 'ai.html' },
        { id: 'osint', icon: '🕵️', label: 'OSINT', href: 'osint.html' },
        { id: 'misc', icon: '🧰', label: 'Mer', href: 'misc.html' }
    ];

    return `
        <nav class="bottom-nav" role="navigation" aria-label="Hovednavigasjon mobil">
            ${navItems.map(item => `
                <a href="${item.href}"
                   class="bottom-nav-item ${item.id === activePage ? 'active' : ''}"
                   aria-label="${item.label}"
                   aria-current="${item.id === activePage ? 'page' : 'false'}">
                    <span class="bottom-nav-icon">${item.icon}</span>
                    <span class="bottom-nav-label">${item.label}</span>
                </a>
            `).join('')}
            <button id="bottomNavMore"
                    class="bottom-nav-item"
                    aria-label="Mer meny">
                <span class="bottom-nav-icon">⋯</span>
                <span class="bottom-nav-label">Mer</span>
            </button>
        </nav>
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

    // Insert bottom nav (mobile only)
    const bottomNavPlaceholder = document.getElementById('bottom-nav-placeholder');
    if (bottomNavPlaceholder) {
        bottomNavPlaceholder.outerHTML = renderBottomNav(activePage);
    } else {
        // If no placeholder, append to body
        document.body.insertAdjacentHTML('beforeend', renderBottomNav(activePage));
    }

    // Setup navigation event listeners
    setupNavigation();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup mobile interactions
    setupMobileInteractions();
}

/**
 * Setup navigation event listeners
 * Replaces inline onclick handlers
 */
function setupNavigation() {
    // Event delegation for all navigation buttons
    document.addEventListener('click', (e) => {
        const navBtn = e.target.closest('[data-href]');
        if (navBtn) {
            const href = navBtn.dataset.href;
            if (href) {
                location.href = href;
            }
        }
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }

        // Escape to close panels or clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            const toolsPanel = document.getElementById('toolsPanel');

            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }

            if (toolsPanel) {
                toolsPanel.classList.remove('active');
            }
        }

        // Ctrl+/ for tools panel
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const toolsPanel = document.getElementById('toolsPanel');
            if (toolsPanel) {
                toolsPanel.classList.toggle('active');
            }
        }

        // Escape to close mobile drawer and modals
        if (e.key === 'Escape') {
            closeMobileDrawer();
            closeMobileSearch();
        }
    });
}

/**
 * Setup mobile interactions (hamburger menu, swipe gestures, search modal)
 */
function setupMobileInteractions() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');
    const mobileDrawerOverlay = document.querySelector('.mobile-drawer-overlay');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchModal = document.getElementById('mobileSearchModal');
    const mobileSearchClose = document.getElementById('mobileSearchClose');
    const mobileSearchOverlay = document.querySelector('.mobile-search-modal-overlay');
    const bottomNavMore = document.getElementById('bottomNavMore');

    // Hamburger menu toggle
    if (mobileMenuToggle && mobileDrawer) {
        mobileMenuToggle.addEventListener('click', () => {
            openMobileDrawer();
        });
    }

    // Close drawer handlers
    if (mobileDrawerClose) {
        mobileDrawerClose.addEventListener('click', closeMobileDrawer);
    }
    if (mobileDrawerOverlay) {
        mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
    }

    // Mobile search modal
    if (mobileSearchBtn && mobileSearchModal) {
        mobileSearchBtn.addEventListener('click', () => {
            openMobileSearch();
        });
    }

    if (mobileSearchClose) {
        mobileSearchClose.addEventListener('click', closeMobileSearch);
    }
    if (mobileSearchOverlay) {
        mobileSearchOverlay.addEventListener('click', closeMobileSearch);
    }

    // Bottom nav "Mer" button opens drawer
    if (bottomNavMore) {
        bottomNavMore.addEventListener('click', openMobileDrawer);
    }

    // Sync mobile search with desktop search
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const desktopSearchInput = document.getElementById('searchInput');

    if (mobileSearchInput && desktopSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            desktopSearchInput.value = e.target.value;
            desktopSearchInput.dispatchEvent(new Event('input'));
        });
    }

    // Swipe gestures for drawer
    setupSwipeGestures();

    // Mirror theme toggle to mobile
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const desktopThemeToggle = document.getElementById('themeToggle');

    if (mobileThemeToggle && desktopThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            desktopThemeToggle.click();
            closeMobileDrawer();
        });
    }

    // Mirror tools toggle to mobile
    const mobileToolsToggle = document.getElementById('mobileToolsToggle');
    const desktopToolsToggle = document.getElementById('toolsToggle');

    if (mobileToolsToggle && desktopToolsToggle) {
        mobileToolsToggle.addEventListener('click', () => {
            desktopToolsToggle.click();
            closeMobileDrawer();
        });
    }

    // Mirror refresh to mobile
    const mobileRefreshBtn = document.getElementById('mobileRefreshBtn');
    if (mobileRefreshBtn) {
        mobileRefreshBtn.addEventListener('click', () => location.reload());
    }
}

/**
 * Open mobile drawer
 */
function openMobileDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const toggle = document.getElementById('mobileMenuToggle');

    if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Close mobile drawer
 */
function closeMobileDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const toggle = document.getElementById('mobileMenuToggle');

    if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scroll
    }

    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Open mobile search modal
 */
function openMobileSearch() {
    const modal = document.getElementById('mobileSearchModal');
    const input = document.getElementById('mobileSearchInput');

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Focus input after animation
    if (input) {
        setTimeout(() => {
            input.focus();
        }, 300);
    }
}

/**
 * Close mobile search modal
 */
function closeMobileSearch() {
    const modal = document.getElementById('mobileSearchModal');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Clear search
    const input = document.getElementById('mobileSearchInput');
    if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
    }
}

/**
 * Setup swipe gestures for mobile drawer
 */
function setupSwipeGestures() {
    const drawer = document.getElementById('mobileDrawer');
    if (!drawer) return;

    let touchStartX = 0;
    let touchEndX = 0;

    drawer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    drawer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 100; // Minimum swipe distance in pixels

        // Swipe left to close drawer
        if (touchEndX < touchStartX - swipeThreshold) {
            closeMobileDrawer();
        }
    }
}
