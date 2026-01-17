// page-init.js - Enhanced with performance optimizations
import { ls, debounce } from './helpers.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => r.querySelectorAll(s);

/**
 * Setup theme toggle
 */
function setupTheme() {
  const savedTheme = ls.get('theme', 'light');
  document.body.dataset.theme = savedTheme;

  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      ls.set('theme', newTheme);

      // Update toggle button aria-label
      themeToggle.setAttribute('aria-label',
        `Bytt til ${newTheme === 'dark' ? 'lyst' : 'mørkt'} tema`
      );
    });

    // Set initial aria-label
    themeToggle.setAttribute('aria-label',
      `Bytt til ${savedTheme === 'dark' ? 'lyst' : 'mørkt'} tema`
    );
  }
}

/**
 * Setup refresh button
 */
function setupRefresh() {
  const refreshBtn = $('#refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => location.reload());
  }
}

/**
 * Setup tools panel
 */
function setupTools() {
  const panel = $('#toolsPanel');
  const toggleBtn = $('#toolsToggle');
  const closeBtn = $('#toolsClose');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      const isActive = panel.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isActive);
      panel.setAttribute('aria-hidden', !isActive);
    });
  }

  if (closeBtn && panel) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('active');
      toggleBtn?.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panel && panel.classList.contains('active')) {
      if (!panel.contains(e.target) && !toggleBtn?.contains(e.target)) {
        panel.classList.remove('active');
        toggleBtn?.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
      }
    }
  });
}

/**
 * Setup debounced search
 * Performance: Delays search until user stops typing (300ms)
 */
function setupSearch() {
  const searchInput = $('#searchInput');
  if (!searchInput) return;

  // Debounced search function
  const performSearch = debounce((query) => {
    const normalizedQuery = query.trim().toLowerCase();

    const linkRows = $$('.link-row');
    let visibleCount = 0;

    linkRows.forEach(row => {
      const text = row.dataset.text || '';
      const matches = text.includes(normalizedQuery);

      row.style.display = matches ? '' : 'none';

      if (matches) {
        visibleCount++;
      }
    });

    // Show "no results" message if needed
    updateSearchResultsMessage(visibleCount, normalizedQuery);
  }, 300);

  // Listen to input events
  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });

  // Clear search on Escape (handled in components.js keyboard shortcuts)
}

/**
 * Update search results message
 * @param {number} count - Number of visible results
 * @param {string} query - Search query
 */
function updateSearchResultsMessage(count, query) {
  let messageEl = $('#search-results-message');

  if (query === '') {
    if (messageEl) messageEl.remove();
    return;
  }

  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'search-results-message';
    messageEl.setAttribute('role', 'status');
    messageEl.setAttribute('aria-live', 'polite');
    messageEl.style.cssText = `
      padding: 1rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.95rem;
    `;

    const sectionsContainer = $('#sections') || document.querySelector('main');
    if (sectionsContainer) {
      sectionsContainer.insertAdjacentElement('beforebegin', messageEl);
    }
  }

  if (count === 0) {
    messageEl.innerHTML = `
      <p>🔍 Ingen resultater for "<strong>${escapeHtml(query)}</strong>"</p>
      <p style="font-size: 0.85rem; margin-top: 0.5rem;">Prøv et annet søkeord</p>
    `;
  } else {
    messageEl.innerHTML = `
      <p>Viser ${count} resultat${count !== 1 ? 'er' : ''} for "<strong>${escapeHtml(query)}</strong>"</p>
    `;
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Lazy load images (favicons)
 * Performance: Only loads images when they enter viewport
 */
function setupLazyLoading() {
  // Only setup if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    $$('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Load the image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');

          // Stop observing this image
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px' // Start loading 50px before entering viewport
  });

  // Observe all images with data-src
  $$('img[data-src]').forEach(img => imageObserver.observe(img));
}

/**
 * Initialize all page features
 */
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupRefresh();
  setupTools();
  setupSearch();
  setupLazyLoading();
});

