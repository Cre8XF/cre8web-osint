// index.js
import { ls } from './helpers.js';
import { getFavorites, removeFavorite } from "./favorites.js";

const qs = (s, root=document)=>root.querySelector(s);
const qsa = (s, root=document)=>[...root.querySelectorAll(s)];

function renderFavorites(filter='') {
  const container = qs('#fav-groups');
  container.innerHTML = '';
  const favs = getFavorites();

  const list = filter
    ? favs.filter(f =>
        (f.title || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.desc || '').toLowerCase().includes(filter.toLowerCase())
      )
    : favs;

  if (!list.length) {
    qs('#noFavs').style.display = 'block';
    return;
  }
  qs('#noFavs').style.display = 'none';

  // Gruppér etter kategori
  const groups = [...new Set(list.map(f => f.group || 'Favoritter'))];

  groups.forEach(g => {
    const sec = document.createElement('section');
    sec.className = 'fav-group';
    sec.innerHTML = `<h2>${g}</h2><div class="favorites-grid"></div>`;
    const grid = sec.querySelector('.favorites-grid');

    list
      .filter(f => (f.group || 'Favoritter') === g)
      .forEach(f => {
        const card = document.createElement('a');
        card.href = f.url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'fav-card';
        const icon = f.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${f.url}`;
        card.innerHTML = `
          <button class="remove" data-url="${f.url}" title="Fjern">✕</button>
          <img src="${icon}" alt="">
          <span>${f.title || f.url}</span>
          ${f.desc ? `<small>${f.desc}</small>` : ''}
        `;
        grid.appendChild(card);
      });

    container.appendChild(sec);
  });

  // Fjern-funksjon
  qsa('.fav-card .remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url;
      removeFavorite(url);
      renderFavorites(qs('#searchInput').value.trim());
    });
  });
}

function setupHeader() {
  const themeBtn = qs('#themeToggle');
  const refreshBtn = qs('#refreshBtn');
  const favBtn = qs('#toggleFavorites');
  const search = qs('#searchInput');

  // Tema
  const savedTheme = ls.get('theme', 'light');
  document.body.dataset.theme = savedTheme;
  themeBtn.addEventListener('click', () => {
    const t = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = t;
    ls.set('theme', t);
  });

  // Oppdater
  refreshBtn.addEventListener('click', () => location.reload());

  // Søk
  search.addEventListener('input', () => renderFavorites(search.value.trim()));

  // Favoritt-knapp (scroll til topp)
  favBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}

function boot() {
  setupHeader();
  renderFavorites();
}

document.addEventListener('DOMContentLoaded', boot);
