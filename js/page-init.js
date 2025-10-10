// page-init.js
import { ls } from './helpers.js';

const $ = (s,r=document)=>r.querySelector(s);

function setupTheme(){
  const t = ls.get('theme','light');
  document.body.dataset.theme = t;
  $('#themeToggle')?.addEventListener('click', ()=>{
    const n = document.body.dataset.theme==='dark' ? 'light' : 'dark';
    document.body.dataset.theme = n; ls.set('theme', n);
  });
}
function setupRefresh(){ $('#refreshBtn')?.addEventListener('click', ()=>location.reload()); }
function setupTools(){
  const panel = $('#toolsPanel');
  $('#toolsToggle')?.addEventListener('click', ()=>panel?.classList.add('active'));
  $('#toolsClose')?.addEventListener('click', ()=>panel?.classList.remove('active'));
}
function setupSearch(){
  const s = $('#searchInput'); if(!s) return;
  s.addEventListener('input', ()=>{
    const q = s.value.trim().toLowerCase();
    document.querySelectorAll('.link-row').forEach(li=>{
      const txt = li.dataset.text || '';
      li.style.display = txt.includes(q) ? '' : 'none';
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  setupTheme(); setupRefresh(); setupTools(); setupSearch();
});
