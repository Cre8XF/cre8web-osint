import { ls } from './helpers.js';

const qs = (s, root=document)=>root.querySelector(s);

function csvToJson(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(s=>s.trim());
  const rows = lines.map(line=>{
    const cols = line.split(',').map(s=>s.trim());
    return Object.fromEntries(headers.map((h,i)=>[h, cols[i] ?? '']));
  });
  return JSON.stringify(rows, null, 2);
}
function jsonToCsv(json) {
  const obj = JSON.parse(json);
  const arr = Array.isArray(obj) ? obj : [obj];
  const headers = [...new Set(arr.flatMap(o=>Object.keys(o)))];
  const rows = arr.map(o => headers.map(h => (o[h] ?? '')).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function setupToolsPanel() {
  const panel = qs('#toolsPanel');
  const open = qs('#toolsToggle');
  const close = qs('#toolsClose');

  open.addEventListener('click', ()=> panel.classList.add('active'));
  close.addEventListener('click', ()=> panel.classList.remove('active'));

  // actions
  qs('[data-tool="json-to-csv"]').addEventListener('click', ()=>{
    try { qs('#jsonOutput').value = jsonToCsv(qs('#jsonInput').value); }
    catch(e){ alert('Ugyldig JSON: ' + e.message); }
  });
  qs('[data-tool="csv-to-json"]').addEventListener('click', ()=>{
    try { qs('#jsonOutput').value = csvToJson(qs('#jsonInput').value); }
    catch(e){ alert('Ugyldig CSV: ' + e.message); }
  });
  qs('[data-tool="url-encode"]').addEventListener('click', ()=>{
    qs('#urlBox').value = encodeURIComponent(qs('#urlBox').value);
  });
  qs('[data-tool="url-decode"]').addEventListener('click', ()=>{
    try { qs('#urlBox').value = decodeURIComponent(qs('#urlBox').value); }
    catch(e){ alert('Ugyldig encoded tekst'); }
  });
  qs('[data-tool="b64-encode"]').addEventListener('click', ()=>{
    qs('#b64Box').value = btoa(unescape(encodeURIComponent(qs('#b64Box').value)));
  });
  qs('[data-tool="b64-decode"]').addEventListener('click', ()=>{
    try { qs('#b64Box').value = decodeURIComponent(escape(atob(qs('#b64Box').value))); }
    catch(e){ alert('Ugyldig Base64'); }
  });

  qs('.copy').addEventListener('click', (e)=>{
    const targetSel = e.currentTarget.getAttribute('data-copy');
    const el = qs(targetSel);
    el.select();
    document.execCommand('copy');
  });

  qs('#clearLs').addEventListener('click', ()=>{
    if(confirm('Tømme localStorage?')) localStorage.clear();
  });
}

document.addEventListener('DOMContentLoaded', setupToolsPanel);
