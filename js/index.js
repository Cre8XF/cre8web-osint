// index.js - Premium Edition
import { ls } from './helpers.js';
import { getFavorites, removeFavorite, setFavorites } from "./favorites.js";

const qs = (s, root=document) => root.querySelector(s);
const qsa = (s, root=document) => [...root.querySelectorAll(s)];

// ============================================
// Render Favorites
// ============================================
function renderFavorites(filter = '') {
  const container = qs('#fav-groups');
  container.innerHTML = '';
  const favs = getFavorites();

  // Filter logic
  const list = filter
    ? favs.filter(f =>
        (f.title || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.desc || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.url || '').toLowerCase().includes(filter.toLowerCase())
      )
    : favs;

  // Show/hide empty state
  const noFavsEl = qs('#noFavs');
  if (!list.length) {
    noFavsEl.style.display = 'block';
    return;
  }
  noFavsEl.style.display = 'none';

  // Group by category
  const groups = [...new Set(list.map(f => f.group || 'Favoritter'))];

  groups.forEach((groupName, index) => {
    const sec = document.createElement('section');
    sec.className = 'fav-group';
    sec.style.animationDelay = `${index * 0.05}s`;
    
    sec.innerHTML = `
      <h2>${groupName}</h2>
      <div class="favorites-grid"></div>
    `;
    
    const grid = sec.querySelector('.favorites-grid');

    list
      .filter(f => (f.group || 'Favoritter') === groupName)
      .forEach((fav, idx) => {
        const card = createFavoriteCard(fav, idx);
        grid.appendChild(card);
      });

    container.appendChild(sec);
  });

  // Bind remove buttons
  bindRemoveButtons();
}

// ============================================
// Create Favorite Card
// ============================================
function createFavoriteCard(fav, index) {
  const card = document.createElement('a');
  card.href = fav.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.className = 'fav-card';
  card.style.animationDelay = `${index * 0.03}s`;
  
  const icon = fav.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${fav.url}`;
  
  card.innerHTML = `
    <button 
      class="remove" 
      data-url="${fav.url}" 
      title="Fjern fra favoritter"
      aria-label="Fjern ${fav.title || fav.url} fra favoritter"
    >
      ✕
    </button>
    <img 
      src="${icon}" 
      alt="${fav.title || fav.url} ikon"
      onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🔗%3C/text%3E%3C/svg%3E'"
    >
    <span>${fav.title || fav.url}</span>
    ${fav.desc ? `<small>${fav.desc}</small>` : ''}
  `;
  
  return card;
}

// ============================================
// Bind Remove Buttons
// ============================================
function bindRemoveButtons() {
  qsa('.fav-card .remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const url = btn.dataset.url;
      
      // Confirm before removing
      if (confirm('Vil du fjerne denne favoritten?')) {
        removeFavorite(url);
        showNotification('✅ Favoritt fjernet', 'success');
        renderFavorites(qs('#searchInput').value.trim());
      }
    });
  });
}

// ============================================
// Export Favorites
// ============================================
function exportFavorites() {
  const favs = getFavorites();
  
  if (!favs.length) {
    alert('Ingen favoritter å eksportere!');
    return;
  }
  
  const dataStr = JSON.stringify(favs, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `cre8web-favoritter-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('💾 Favoritter eksportert!', 'success');
}

// ============================================
// Import Favorites
// ============================================
function importFavorites() {
  const fileInput = qs('#fileInput');
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        if (!Array.isArray(imported)) {
          throw new Error('Ugyldig format');
        }
        
        const currentFavs = getFavorites();
        
        // Merge with existing (avoid duplicates)
        const merged = [...currentFavs];
        let addedCount = 0;
        
        imported.forEach(item => {
          if (!merged.some(f => f.url === item.url)) {
            merged.push(item);
            addedCount++;
          }
        });
        
        setFavorites(merged);
        renderFavorites();
        
        showNotification(`📂 ${addedCount} nye favoritter importert!`, 'success');
      } catch (err) {
        alert('Kunne ikke importere fil: ' + err.message);
      }
    };
    
    reader.readAsText(file);
  };
  
  fileInput.click();
}

// ============================================
// Show Notification
// ============================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// Setup Header Controls
// ============================================
function setupHeader() {
  const themeBtn = qs('#themeToggle');
  const refreshBtn = qs('#refreshBtn');
  const favBtn = qs('#toggleFavorites');
  const exportBtn = qs('#exportBtn');
  const importBtn = qs('#importBtn');
  const search = qs('#searchInput');

  // Theme toggle
  const savedTheme = ls.get('theme', 'light');
  document.body.dataset.theme = savedTheme;
  
  themeBtn.addEventListener('click', () => {
    const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = newTheme;
    ls.set('theme', newTheme);
    showNotification(`🌓 Tema endret til ${newTheme === 'dark' ? 'mørk' : 'lys'}`, 'info');
  });

  // Refresh
  refreshBtn.addEventListener('click', () => {
    showNotification('🔄 Oppdaterer...', 'info');
    setTimeout(() => location.reload(), 500);
  });

  // Scroll to top
  favBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Export favorites
  exportBtn.addEventListener('click', exportFavorites);

  // Import favorites
  importBtn.addEventListener('click', importFavorites);

  // Search
  search.addEventListener('input', () => {
    renderFavorites(search.value.trim());
  });

  // Clear search on ESC
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      search.value = '';
      renderFavorites();
    }
  });
}

// ============================================
// About Modal
// ============================================
function setupAboutModal() {
  const aboutLink = qs('#aboutLink');
  
  if (!aboutLink) return;
  
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content glass">
        <button class="modal-close" aria-label="Lukk">✕</button>
        <h2>Om Cre8Web OSINT Hub</h2>
        <p><strong>Versjon:</strong> 7.0 Premium Edition</p>
        <p><strong>Bygget med:</strong> Vanilla JavaScript, CSS3, HTML5</p>
        <p><strong>Funksjoner:</strong> Favoritt-system, RSS-feeds, mini-verktøy, import/export</p>
        <p><strong>Lisens:</strong> MIT - Fritt å bruke og modifisere</p>
        <hr>
        <p>Inspirert av start.me og bygget for OSINT-miljøet.</p>
        <p>© 2025 Cre8Web. Alle rettigheter reservert.</p>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;
    
    const content = modal.querySelector('.modal-content');
    content.style.cssText = `
      max-width: 500px;
      padding: 2rem;
      position: relative;
      animation: slideUp 0.3s ease;
    `;
    
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: none;
      padding: 0.5rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
    `;
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  });
}

// ============================================
// Statistics
// ============================================
function showStatistics() {
  const favs = getFavorites();
  const groups = [...new Set(favs.map(f => f.group || 'Favoritter'))];
  
  console.log('📊 Statistikk:');
  console.log(`  - Totalt: ${favs.length} favoritter`);
  console.log(`  - Kategorier: ${groups.length}`);
  
  groups.forEach(g => {
    const count = favs.filter(f => (f.group || 'Favoritter') === g).length;
    console.log(`  - ${g}: ${count}`);
  });
}

// ============================================
// Initialize
// ============================================
function boot() {
  setupHeader();
  setupAboutModal();
  renderFavorites();
  showStatistics();
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Cre8Web OSINT Hub Premium initialisert');
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}