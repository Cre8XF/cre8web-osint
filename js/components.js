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
            <div class="brand">
                <span class="dot" aria-hidden="true"></span>
                <strong>Cre8Web OSINT Hub</strong>
                <span class="version">v7 Premium</span>
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
                       placeholder="Søk i ${activePage === 'index' ? 'favoritter' : 'lenker'}… (Ctrl+K)"
                       aria-label="Søk i ${activePage === 'index' ? 'favoritter' : 'lenker'}"
                       autocomplete="off">

                ${indexButtons}
                <button id="refreshBtn" title="Oppdater side" aria-label="Oppdater side">🔄</button>
                <button id="themeToggle" title="Bytt tema (light/dark)" aria-label="Bytt fargetema">🌓</button>
                <button id="toolsToggle" title="Åpne mini-verktøy" aria-label="Åpne verktøypanel">⚙️</button>
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
            <small>© 2025 Cre8Web — OSINT Hub Premium Edition</small>
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

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
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
    });
}
