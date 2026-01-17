/**
 * Smart Search with Fuse.js
 * Fuzzy search across all pages with relevance ranking
 */

import { showError } from './error-handler.js';

// Fuse.js will be loaded from CDN
let Fuse;

// Search index for all pages
let searchIndex = [];
let fuseInstance = null;

/**
 * Initialize smart search
 */
export async function initSmartSearch() {
    try {
        // Load Fuse.js from CDN
        if (!window.Fuse) {
            await loadFuseJS();
        }
        Fuse = window.Fuse;

        // Build search index from all pages
        await buildSearchIndex();

        // Initialize Fuse instance
        fuseInstance = new Fuse(searchIndex, {
            keys: [
                { name: 'title', weight: 2 },  // Title most important
                { name: 'desc', weight: 1.5 }, // Description second
                { name: 'group', weight: 1 },  // Group/category
                { name: 'page', weight: 0.5 }  // Page least important
            ],
            threshold: 0.4,  // 0 = perfect match, 1 = match anything
            distance: 100,   // Max distance for fuzzy matching
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2,
            shouldSort: true
        });

        console.log('[SmartSearch] Initialized with', searchIndex.length, 'items');
    } catch (error) {
        showError(error, { function: 'initSmartSearch' });
    }
}

/**
 * Load Fuse.js from CDN
 */
function loadFuseJS() {
    return new Promise((resolve, reject) => {
        if (window.Fuse) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Fuse.js'));
        document.head.appendChild(script);
    });
}

/**
 * Build search index from all page data
 */
async function buildSearchIndex() {
    const pages = ['index', 'ai', 'osint', 'projects', 'news', 'misc'];
    const pageLabels = {
        index: 'Favoritter',
        ai: 'AI-verktøy',
        osint: 'OSINT',
        projects: 'Prosjekter',
        news: 'Nyheter',
        misc: 'Diverse'
    };

    const index = [];

    for (const page of pages) {
        try {
            const response = await fetch(`data/links_sections_${page}.json`);
            if (!response.ok) continue;

            const sections = await response.json();

            sections.forEach(section => {
                (section.links || []).forEach(link => {
                    index.push({
                        id: `${page}-${link.url}`,
                        url: link.url || link.href,
                        title: link.title || link.name || link.text,
                        desc: link.desc || link.description || '',
                        group: section.title,
                        page: page,
                        pageLabel: pageLabels[page],
                        icon: link.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(link.url || link.href)}`
                    });
                });
            });
        } catch (error) {
            console.warn(`[SmartSearch] Failed to load ${page}:`, error);
        }
    }

    searchIndex = index;
}

/**
 * Perform smart search
 * @param {string} query - Search query
 * @param {number} limit - Max results to return
 * @returns {Array} Search results
 */
export function search(query, limit = 10) {
    if (!fuseInstance) {
        console.warn('[SmartSearch] Not initialized yet');
        return [];
    }

    if (!query || query.trim().length < 2) {
        return [];
    }

    const results = fuseInstance.search(query, { limit });

    // Transform results to usable format
    return results.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches
    }));
}

/**
 * Get all items (for showing all on empty query)
 * @param {number} limit - Max items to return
 * @returns {Array}
 */
export function getAllItems(limit = 20) {
    return searchIndex.slice(0, limit);
}

/**
 * Render search result HTML
 * @param {Object} result - Search result object
 * @returns {string} HTML string
 */
export function renderSearchResult(result) {
    const { title, desc, group, pageLabel, url, icon } = result;

    // Highlight matched text (if matches available)
    const highlightedTitle = highlightMatches(title, result.matches, 'title');
    const highlightedDesc = highlightMatches(desc, result.matches, 'desc');

    return `
        <a href="${escapeHtml(url)}"
           class="search-result-item"
           target="_blank"
           rel="noopener noreferrer">
            <img src="${escapeHtml(icon)}"
                 alt="${escapeHtml(title)} ikon"
                 class="search-result-icon"
                 loading="lazy">
            <div class="search-result-content">
                <div class="search-result-title">${highlightedTitle}</div>
                ${desc ? `<div class="search-result-desc">${highlightedDesc}</div>` : ''}
                <div class="search-result-meta">
                    <span class="search-result-page">${escapeHtml(pageLabel)}</span>
                    <span class="search-result-separator">•</span>
                    <span class="search-result-group">${escapeHtml(group)}</span>
                </div>
            </div>
        </a>
    `;
}

/**
 * Highlight matched text
 * @param {string} text - Original text
 * @param {Array} matches - Fuse.js matches array
 * @param {string} key - Which key to highlight ('title', 'desc', etc.)
 * @returns {string} HTML with <mark> tags
 */
function highlightMatches(text, matches, key) {
    if (!matches || !text) return escapeHtml(text);

    const keyMatches = matches.filter(m => m.key === key);
    if (keyMatches.length === 0) return escapeHtml(text);

    // Get all match indices
    const indices = keyMatches[0].indices || [];

    if (indices.length === 0) return escapeHtml(text);

    // Build highlighted string
    let result = '';
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
        // Add text before match
        result += escapeHtml(text.substring(lastIndex, start));
        // Add highlighted match
        result += `<mark>${escapeHtml(text.substring(start, end + 1))}</mark>`;
        lastIndex = end + 1;
    });

    // Add remaining text
    result += escapeHtml(text.substring(lastIndex));

    return result;
}

/**
 * Escape HTML
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Setup command palette (Ctrl+K)
 */
export function setupCommandPalette() {
    let paletteEl = document.getElementById('command-palette');

    // Create command palette if it doesn't exist
    if (!paletteEl) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="command-palette" class="command-palette" role="dialog" aria-modal="true" aria-label="Søk">
                <div class="command-palette-overlay"></div>
                <div class="command-palette-content">
                    <div class="command-palette-header">
                        <input type="search"
                               id="commandPaletteInput"
                               placeholder="Søk i alle sider..."
                               autocomplete="off"
                               aria-label="Søk i alle sider">
                        <button id="commandPaletteClose" aria-label="Lukk søk">
                            <span>Esc</span>
                        </button>
                    </div>
                    <div id="commandPaletteResults" class="command-palette-results"></div>
                </div>
            </div>
        `);

        paletteEl = document.getElementById('command-palette');

        // Setup event listeners
        setupCommandPaletteEvents();
    }
}

/**
 * Setup command palette event listeners
 */
function setupCommandPaletteEvents() {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('commandPaletteInput');
    const results = document.getElementById('commandPaletteResults');
    const closeBtn = document.getElementById('commandPaletteClose');
    const overlay = palette.querySelector('.command-palette-overlay');

    // Input handler with debounce
    let debounceTimer;
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(e.target.value.trim());
        }, 200);
    });

    // Close handlers
    closeBtn.addEventListener('click', closeCommandPalette);
    overlay.addEventListener('click', closeCommandPalette);

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCommandPalette();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusNextResult();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusPrevResult();
        }
    });

    // Perform search
    function performSearch(query) {
        if (!query || query.length < 2) {
            // Show popular/recent items
            const allItems = getAllItems(10);
            renderResults(allItems, 'Populære lenker');
        } else {
            const searchResults = search(query, 20);
            renderResults(searchResults, searchResults.length > 0 ? `${searchResults.length} resultater` : 'Ingen resultater');
        }
    }

    // Render results
    function renderResults(items, headerText) {
        if (items.length === 0) {
            results.innerHTML = `
                <div class="search-empty-state">
                    <div class="search-empty-icon">🔍</div>
                    <p>Ingen resultater</p>
                    <small>Prøv et annet søkeord</small>
                </div>
            `;
            return;
        }

        const html = `
            <div class="search-results-header">${headerText}</div>
            ${items.map(item => renderSearchResult(item)).join('')}
        `;

        results.innerHTML = html;
    }

    // Focus next result
    function focusNextResult() {
        const items = results.querySelectorAll('.search-result-item');
        const focused = results.querySelector('.search-result-item:focus');

        if (!focused) {
            items[0]?.focus();
        } else {
            const index = Array.from(items).indexOf(focused);
            items[index + 1]?.focus();
        }
    }

    // Focus previous result
    function focusPrevResult() {
        const items = results.querySelectorAll('.search-result-item');
        const focused = results.querySelector('.search-result-item:focus');

        if (focused) {
            const index = Array.from(items).indexOf(focused);
            if (index > 0) {
                items[index - 1].focus();
            } else {
                input.focus();
            }
        }
    }
}

/**
 * Open command palette
 */
export function openCommandPalette() {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('commandPaletteInput');

    if (palette) {
        palette.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            input.focus();
        }, 100);
    }
}

/**
 * Close command palette
 */
export function closeCommandPalette() {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('commandPaletteInput');

    if (palette) {
        palette.classList.remove('active');
        document.body.style.overflow = '';

        // Clear input
        if (input) {
            input.value = '';
        }
    }
}
