// page-render.js
import { toggleFavorite, isFavorite } from './favorites.js';

const $ = (s,r=document)=>r.querySelector(s);

async function loadSections(){
  const page = document.body.dataset.page;
  const res = await fetch(`data/links_sections_${page}.json`);
  const sections = await res.json();
  render(sections);
}

function rowHTML(link, sectionTitle){
  const url = link.url || link.href;
  const title = link.title || link.name || link.text || url;
  const desc = link.desc || link.description || '';
  const icon = link.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
  const fav = isFavorite(url) ? 'fav' : '';
  return `
    <li class="link-row" data-text="${(title+' '+desc).toLowerCase()}">
      <button class="star ${fav}" data-url="${url}" data-title="${title}" data-group="${sectionTitle}" data-desc="${desc}" data-icon="${icon}" title="Legg til/fjern favoritt">⭐</button>
      <img class="link-icon" src="${icon}" alt="">
      <a href="${url}" target="_blank" rel="noopener">${title}</a>
      ${desc ? `<small>${desc}</small>` : ''}
    </li>
  `;
}

function render(sections){
  const container = $('#sections');
  container.innerHTML = '';
  sections.forEach(sec=>{
    const card = document.createElement('section');
    card.className = 'card section glass';
    card.innerHTML = `<h2>${sec.icon?sec.icon+' ':''}${sec.title}</h2><ul class="link-list"></ul>`;
    const ul = card.querySelector('ul');
    (sec.links||[]).forEach(link=> ul.insertAdjacentHTML('beforeend', rowHTML(link, sec.title)));
    container.appendChild(card);
  });
  bindStars();
}

function bindStars(){
  document.querySelectorAll('.star').forEach(btn=>{
    btn.addEventListener('click', e=>{
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
    });
  });
}

document.addEventListener('DOMContentLoaded', loadSections);
