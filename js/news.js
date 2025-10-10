async function loadNews(feedUrl, listId) {
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
    const data = await res.json();
    const list = document.getElementById(listId);
    const items = (data.items || []).slice(0,6);
    list.innerHTML = items.map(n => `
      <li>
        <a href="${n.link}" target="_blank" rel="noopener">${n.title}</a>
      </li>
    `).join('');
  } catch (e) {
    document.getElementById(listId).innerHTML = '<li>Kunne ikke laste nyheter.</li>';
  }
}

function boot() {
  loadNews('https://www.vg.no/rss/feed', 'vgNewsList');
  loadNews('https://www.kode24.no/?service=rss', 'kodeNewsList');
  setInterval(()=>{
    loadNews('https://www.vg.no/rss/feed', 'vgNewsList');
    loadNews('https://www.kode24.no/?service=rss', 'kodeNewsList');
  }, 15*60*1000);
}
document.addEventListener('DOMContentLoaded', boot);
