/**
 * Quick Add - Add links faster
 * Touch-optimized modal with URL title fetching
 */

import { ls } from './helpers.js';
import { showNotification, showError } from './error-handler.js';
import { getFavorites } from './favorites.js';

/**
 * Render Quick Add modal
 */
export function renderQuickAddModal() {
    return `
        <div id="quickAddModal" class="quick-add-modal" role="dialog" aria-modal="true" aria-label="Legg til lenke">
            <div class="quick-add-overlay"></div>
            <div class="quick-add-content">
                <header class="quick-add-header">
                    <h2>➕ Legg til lenke</h2>
                    <button id="quickAddClose" aria-label="Lukk">✕</button>
                </header>

                <form id="quickAddForm" class="quick-add-form">
                    <div class="form-group">
                        <label for="quickAddUrl">URL *</label>
                        <input type="url"
                               id="quickAddUrl"
                               name="url"
                               placeholder="https://example.com"
                               required
                               autocomplete="off"
                               aria-label="URL til lenken">
                        <button type="button"
                                id="fetchTitleBtn"
                                class="fetch-title-btn"
                                aria-label="Hent tittel fra URL">
                            🔍 Hent tittel
                        </button>
                    </div>

                    <div class="form-group">
                        <label for="quickAddTitle">Tittel</label>
                        <input type="text"
                               id="quickAddTitle"
                               name="title"
                               placeholder="Autofylt fra URL eller skriv inn manuelt"
                               autocomplete="off"
                               aria-label="Tittel på lenken">
                    </div>

                    <div class="form-group">
                        <label for="quickAddDesc">Beskrivelse (valgfri)</label>
                        <textarea id="quickAddDesc"
                                  name="desc"
                                  placeholder="Kort beskrivelse..."
                                  rows="2"
                                  aria-label="Beskrivelse"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="quickAddCategory">Kategori *</label>
                        <select id="quickAddCategory"
                                name="category"
                                required
                                aria-label="Velg kategori">
                            <option value="">Velg kategori...</option>
                            <option value="AI">🤖 AI-verktøy</option>
                            <option value="OSINT">🕵️ OSINT</option>
                            <option value="Dev">💻 Utvikling</option>
                            <option value="News">📰 Nyheter</option>
                            <option value="Tools">🧰 Verktøy</option>
                            <option value="Other">📌 Annet</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary" id="quickAddSubmit">
                            ➕ Legg til
                        </button>
                        <button type="button" class="btn-secondary" id="quickAddCancel">
                            Avbryt
                        </button>
                    </div>
                </form>

                <div id="quickAddStatus" class="quick-add-status" role="status" aria-live="polite"></div>
            </div>
        </div>
    `;
}

/**
 * Initialize Quick Add
 */
export function initQuickAdd() {
    // Insert modal into DOM
    if (!document.getElementById('quickAddModal')) {
        document.body.insertAdjacentHTML('beforeend', renderQuickAddModal());
    }

    setupQuickAddEvents();
    setupFloatingButton();
}

/**
 * Setup Quick Add event listeners
 */
function setupQuickAddEvents() {
    const modal = document.getElementById('quickAddModal');
    const form = document.getElementById('quickAddForm');
    const closeBtn = document.getElementById('quickAddClose');
    const cancelBtn = document.getElementById('quickAddCancel');
    const overlay = modal?.querySelector('.quick-add-overlay');
    const fetchTitleBtn = document.getElementById('fetchTitleBtn');
    const urlInput = document.getElementById('quickAddUrl');

    if (!modal || !form) return;

    // Close handlers
    closeBtn?.addEventListener('click', closeQuickAdd);
    cancelBtn?.addEventListener('click', closeQuickAdd);
    overlay?.addEventListener('click', closeQuickAdd);

    // Form submit
    form.addEventListener('submit', handleQuickAddSubmit);

    // Fetch title button
    fetchTitleBtn?.addEventListener('click', async () => {
        const url = urlInput?.value.trim();
        if (!url) {
            showNotification('⚠️ Skriv inn URL først', 'warning');
            return;
        }

        await fetchPageTitle(url);
    });

    // Auto-fetch title when URL loses focus (if title is empty)
    urlInput?.addEventListener('blur', async () => {
        const titleInput = document.getElementById('quickAddTitle');
        const url = urlInput.value.trim();

        if (url && titleInput && !titleInput.value.trim()) {
            await fetchPageTitle(url);
        }
    });

    // Bottom nav button (mobile)
    const quickAddBtn = document.getElementById('quick-addBtn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', openQuickAdd);
    }
}

/**
 * Setup floating button (desktop only)
 */
function setupFloatingButton() {
    // Only show on desktop
    if (window.innerWidth <= 768) return;

    const existingBtn = document.getElementById('quickAddFloating');
    if (existingBtn) return; // Already exists

    const floatingBtn = document.createElement('button');
    floatingBtn.id = 'quickAddFloating';
    floatingBtn.className = 'quick-add-floating';
    floatingBtn.innerHTML = '➕';
    floatingBtn.setAttribute('aria-label', 'Legg til ny lenke');
    floatingBtn.setAttribute('title', 'Legg til ny lenke (Alt+N)');

    document.body.appendChild(floatingBtn);

    floatingBtn.addEventListener('click', openQuickAdd);

    // Keyboard shortcut: Alt+N
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            openQuickAdd();
        }
    });
}

/**
 * Open Quick Add modal
 */
export function openQuickAdd() {
    const modal = document.getElementById('quickAddModal');
    const urlInput = document.getElementById('quickAddUrl');

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus URL input after animation
        setTimeout(() => {
            urlInput?.focus();
        }, 300);
    }
}

/**
 * Close Quick Add modal
 */
export function closeQuickAdd() {
    const modal = document.getElementById('quickAddModal');
    const form = document.getElementById('quickAddForm');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form
        if (form) {
            form.reset();
        }

        // Clear status
        const status = document.getElementById('quickAddStatus');
        if (status) {
            status.textContent = '';
        }
    }
}

/**
 * Handle Quick Add form submit
 */
async function handleQuickAddSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const url = formData.get('url').trim();
    const title = formData.get('title').trim() || url;
    const desc = formData.get('desc').trim();
    const category = formData.get('category');

    if (!url || !category) {
        showNotification('⚠️ URL og kategori er påkrevd', 'warning');
        return;
    }

    // Validate URL
    try {
        new URL(url);
    } catch (error) {
        showNotification('❌ Ugyldig URL', 'error');
        return;
    }

    // Check if already exists
    const favorites = getFavorites();
    if (favorites.some(fav => fav.url === url)) {
        showNotification('⚠️ Denne lenken er allerede i favoritter', 'warning');
        return;
    }

    // Add to favorites
    const newFavorite = {
        url,
        title,
        desc,
        group: category,
        icon: `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`,
        addedAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    ls.set('favorites', favorites);

    showNotification('✅ Lenke lagt til i favoritter!', 'success');

    // Close modal
    closeQuickAdd();

    // Reload if on index page to show new favorite
    if (document.body.dataset.page === 'index') {
        setTimeout(() => location.reload(), 500);
    }
}

/**
 * Fetch page title from URL
 */
async function fetchPageTitle(url) {
    const titleInput = document.getElementById('quickAddTitle');
    const fetchBtn = document.getElementById('fetchTitleBtn');
    const status = document.getElementById('quickAddStatus');

    if (!titleInput || !fetchBtn || !status) return;

    // Show loading state
    fetchBtn.disabled = true;
    fetchBtn.textContent = '⏳ Henter...';
    status.textContent = 'Henter tittel fra URL...';

    try {
        // Try multiple methods to fetch title

        // Method 1: CORS proxy (most reliable for external sites)
        const corsProxy = 'https://api.allorigins.win/get?url=';
        const response = await fetch(corsProxy + encodeURIComponent(url), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch');
        }

        const data = await response.json();

        // Parse HTML to extract title
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        let title = doc.querySelector('title')?.textContent;

        // Try og:title meta tag if no title
        if (!title) {
            title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        }

        // Try twitter:title meta tag
        if (!title) {
            title = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
        }

        // Fallback to URL hostname
        if (!title) {
            const urlObj = new URL(url);
            title = urlObj.hostname.replace('www.', '');
        }

        // Clean up title
        title = title.trim().substring(0, 100); // Max 100 chars

        titleInput.value = title;
        status.textContent = '✅ Tittel hentet!';
        setTimeout(() => {
            status.textContent = '';
        }, 3000);

    } catch (error) {
        console.error('[QuickAdd] Failed to fetch title:', error);

        // Fallback: Use hostname as title
        try {
            const urlObj = new URL(url);
            const fallbackTitle = urlObj.hostname.replace('www.', '');
            titleInput.value = fallbackTitle;
            status.textContent = '⚠️ Kunne ikke hente tittel, bruker domenenavn';
        } catch {
            status.textContent = '❌ Kunne ikke hente tittel';
        }

        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = '🔍 Hent tittel';
    }
}
