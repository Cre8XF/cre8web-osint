// page-render.js - Enhanced with error handling and lazy loading
import { toggleFavorite, isFavorite } from './favorites.js';
import { showError, LoadingManager } from './error-handler.js';

const $ = (s, r = document) => r.querySelector(s);

/**
 * Load sections data from JSON with error handling
 */
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
    showErrorState();
  } finally {
    LoadingManager.hide('sections');
  }
}

/**
 * Show error state UI
 */
function showErrorState() {
  const container = $('#sections');
  if (container) {
    container.innerHTML = `
      <div class="error-state" style="text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="margin-bottom: 1rem;">Kunne ikke laste innhold</h2>
        <p style="margin-bottom: 2rem; color: var(--text-secondary);">
          Sjekk internettforbindelsen og prøv igjen.
        </p>
        <button onclick="location.reload()"
                style="padding: 0.75rem 1.5rem; background: var(--accent-blue); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
          🔄 Last inn på nytt
        </button>
      </div>
    `;
  }
}

/**
 * Generate HTML for a link row
 * Uses data-src for lazy loading images
 */
function rowHTML(link, sectionTitle) {
  const url = link.url || link.href;
  const title = link.title || link.name || link.text || url;
  const desc = link.desc || link.description || '';
  const icon = link.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
  const fav = isFavorite(url) ? 'fav' : '';

  // Escape HTML to prevent XSS
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);

  return `
    <li class="link-row" data-text="${(title + ' ' + desc).toLowerCase()}" role="listitem">
      <button class="star ${fav}"
              data-url="${escapeHtml(url)}"
              data-title="${safeTitle}"
              data-group="${escapeHtml(sectionTitle)}"
              data-desc="${safeDesc}"
              data-icon="${escapeHtml(icon)}"
              aria-label="${fav ? 'Fjern fra' : 'Legg til i'} favoritter: ${safeTitle}"
              title="${fav ? 'Fjern fra' : 'Legg til i'} favoritter">
        ⭐
      </button>
      <img class="link-icon"
           data-src="${escapeHtml(icon)}"
           alt="${safeTitle} ikon"
           loading="lazy">
      <a href="${escapeHtml(url)}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Åpne ${safeTitle} i ny fane">
        ${safeTitle}
      </a>
      ${desc ? `<small>${safeDesc}</small>` : ''}
    </li>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Render sections to DOM
 */
function render(sections) {
  const container = $('#sections');
  if (!container) {
    console.error('[page-render] No #sections container found');
    return;
  }

  container.innerHTML = '';

  sections.forEach(sec => {
    const card = document.createElement('section');
    card.className = 'card section glass';
    card.setAttribute('aria-labelledby', `section-${sec.title.replace(/\s+/g, '-')}`);

    const sectionIcon = sec.icon ? sec.icon + ' ' : '';
    const sectionTitle = escapeHtml(sec.title);

    card.innerHTML = `
      <h2 id="section-${sec.title.replace(/\s+/g, '-')}">
        ${sectionIcon}${sectionTitle}
      </h2>
      <ul class="link-list" role="list"></ul>
    `;

    const ul = card.querySelector('ul');
    const links = sec.links || [];

    links.forEach(link => {
      ul.insertAdjacentHTML('beforeend', rowHTML(link, sec.title));
    });

    container.appendChild(card);
  });

  bindStars();
  setupImageLazyLoading();
}

/**
 * Setup lazy loading for images in this render
 */
function setupImageLazyLoading() {
  // Trigger lazy loading setup from page-init.js
  const event = new CustomEvent('imagesRendered');
  document.dispatchEvent(event);

  // Load images immediately if no IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('#sections img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  } else {
    // Create observer for newly added images
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll('#sections img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Bind star button event listeners
 */
function bindStars() {
  document.querySelectorAll('.star').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const item = {
        url: btn.dataset.url,
        title: btn.dataset.title,
        group: btn.dataset.group,
        desc: btn.dataset.desc,
        icon: btn.dataset.icon
      };

      toggleFavorite(item);
      btn.classList.toggle('fav');

      // Update aria-label
      const isFav = btn.classList.contains('fav');
      btn.setAttribute('aria-label',
        `${isFav ? 'Fjern fra' : 'Legg til i'} favoritter: ${item.title}`
      );
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadSections);
