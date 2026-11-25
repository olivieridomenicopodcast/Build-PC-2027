/* ============================================================
   RICERCA in tutta l'app + MENU delle sezioni
   ============================================================ */
const TABS = {
  home: ['🏠', 'Home'], soft: ['🧰', 'Software'], restore: ['🛟', 'Ripristino'], docs: ['🛡️', 'Garanzie e assistenza'], man: ['🧹', 'Manutenzione'], diario: ['📓', 'Diario'],
  diag: ['🩺', 'Diagnosi'], manual: ['📖', 'Manuale e link'], giochi: ['🎮', 'Giochi'], post: ['🎛️', 'Postazione'], builder: ['🛠️', 'Builder'], dual: ['🖥️', 'Dual PC'], chk: ['✅', 'Checklist'],
  riepilogo: ['🗃️', 'Old · Riepilogo'], cmp: ['🗃️', 'Old · Confronta'], wish: ['🗃️', 'Old · Desideri'], mercato: ['🗃️', 'Old · Prezzi e mercato'],
};
const OLD_TABS = ['riepilogo', 'cmp', 'wish', 'mercato'];

function searchIndex() {
  const idx = []; const add = (tab, title, text) => idx.push({ tab, title: String(title || ''), text: (String(title || '') + ' ' + String(text || '')).toLowerCase() });
  softC.items.forEach(s => add('soft', s.name, [s.category, s.notes, s.where, s.version].join(' ')));
  gamesC.items.forEach(g => add('giochi', g.name, [g.old, g.nw, g.notes].join(' ')));
  docsC.items.forEach(d => add('docs', d.title, [d.where, d.notes].join(' ')));
  warrC.items.forEach(w => add('docs', w.item, [w.who, w.notes].join(' ')));
  manC.items.forEach(m => add('man', m.title, m.notes));
  logC.items.forEach(l => add('diario', l.title, [l.kind, l.details].join(' ')));
  linksC.items.forEach(l => add('manual', l.name, l.cat));
  manualC.items.forEach(m => add('manual', m.title, m.text));
  postC.items.forEach(p => add('post', p.name, [p.type, p.model, p.notes].join(' ')));
  DIAG.forEach(d => add('diag', d[0], d[1].join(' ')));
  PC_PARTS.forEach(p => add('home', p.label + ': ' + p.name, p.spec));
  (typeof wish !== 'undefined' ? wish.items : []).forEach(w => add('wish', w.title, [w.shop, w.note].join(' ')));
  (typeof cmp !== 'undefined' ? cmp.cands : []).forEach(c => add('cmp', c.name, c.note || ''));
  CHK.forEach(s => s.items.forEach(t => add('chk', s.title + ': ' + t.slice(0, 70), t)));
  return idx;
}
function runSearch(q) {
  const out = $('#search-out'); q = q.trim().toLowerCase();
  if (q.length < 2) { out.innerHTML = '<p class="muted small">Scrivi almeno due lettere.</p>'; return; }
  const terms = q.split(/\s+/); const res = searchIndex().filter(r => terms.every(t => r.text.includes(t))).slice(0, 40);
  out.innerHTML = res.length ? res.map(r => `<button class="sres" data-tab="${r.tab}"><span class="sr-t">${esc(r.title)}</span><span class="chip">${esc(TABS[r.tab][0] + ' ' + TABS[r.tab][1])}</span></button>`).join('') : '<p class="muted">Nessun risultato.</p>';
}
document.addEventListener('input', e => { if (e.target.id === 'search-q') runSearch(e.target.value); });
document.addEventListener('click', e => {
  const m = e.target.closest('[data-menu]'); if (m) { const d = document.getElementById('menu-dlg'); if (m.dataset.menu === 'close') d.close(); else { document.getElementById('menu-grid').innerHTML = Object.keys(TABS).map(k => `<button class="mi" data-tab="${k}"><span>${TABS[k][0]}</span>${TABS[k][1]}</button>`).join(''); d.showModal(); } return; }
  const s = e.target.closest('[data-search]'); if (s) { const d = document.getElementById('search-dlg'); if (s.dataset.search === 'close') d.close(); else { d.showModal(); const q = document.getElementById('search-q'); q.value = ''; runSearch(''); q.focus(); } }
});
