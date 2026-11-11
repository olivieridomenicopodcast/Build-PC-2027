/* ============================================================
   LISTA DESIDERI: PC e configurazioni trovati nei negozi, con link
   ============================================================ */
const WISH_KEY = 'buildpc2027_wish';
const WISH_STATUS = {
  eval: { label: '💡 Da valutare', c: 'warn' },
  fav: { label: '⭐ Preferito', c: 'good' },
  buy: { label: '✅ Acquistato', c: 'eq' },
};
const wish = {
  items: [
    { id: 'w-v8', title: 'EGEMONE V8 · Ryzen 7 7800X3D, RX 9070 XT 16 GB, 32 GB DDR5-6000', shop: 'PJ DIGITALSTORE', url: 'https://share.google/atLAizxenldQCTldB',
      price: 2639, status: 'fav', cmpId: 'c-v8g', added: '2026-11-11', rev: 2,
      note: 'Arriva con Windows 11 Pro e già montato. Alimentatore: MSI MAG A750BN 750 W Bronze. Da chiedere: passaggio al Gigabyte UD850GM 850 W Gold (come nella V2) e relativo supplemento.' },
  ],
  edit: null,
};
try { const d = JSON.parse(localStorage.getItem(WISH_KEY) || 'null'); if (d && Array.isArray(d.items)) wish.items = d.items; } catch (e) { /* ignore */ }
/* aggiorna la voce della V8 salvata prima della conferma dell'alimentatore (una sola volta) */
wish.items.forEach(x => { if (x.id === 'w-v8' && !x.rev) { x.price = 2639; x.status = x.status === 'eval' ? 'fav' : x.status; x.cmpId = 'c-v8g'; x.rev = 2;
  x.note = 'Con alimentatore Gigabyte UD850GM PG5 V2, 850 W Gold ATX 3.1 (+40 € sul prezzo base di 2.599 €, confermato dal negozio). Arriva con Windows 11 Pro e già montato. Da chiedere ancora: modello SSD, latenza RAM, licenza Windows OEM o retail, garanzia, tempi di consegna.'; wishSave(); } });
const wishSave = () => { try { localStorage.setItem(WISH_KEY, JSON.stringify({ items: wish.items })); } catch (e) { /* ignore */ } };
const wishData = () => ({ items: wish.items });

function wishHost(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
function wishSafeUrl(u) { try { const x = new URL(u.trim()); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } }

function renderWish() {
  const order = { fav: 0, eval: 1, buy: 2 };
  const items = wish.items.slice().sort((a, b) => order[a.status] - order[b.status]);
  const ed = wish.edit && wish.items.find(i => i.id === wish.edit);
  const card = it => {
    const st = WISH_STATUS[it.status] || WISH_STATUS.eval;
    const c = it.cmpId && cmp.cands.find(x => x.id === it.cmpId);
    let cmpBox = '';
    if (c) {
      const x = cmpEval(c), d = x.dEur;
      cmpBox = `<div class="w-cmp"><span class="vchip ${x.v.k}">${x.v.t}</span><span>Voto <b style="color:${x.cEv.tier.color}">${x.cEv.overall}</b> · pezzi ${d > 0 ? '+' : d < 0 ? '−' : ''}${euro(Math.abs(d))} vs la tua build · prezzi ${state.mode === 'A' ? '27 ott' : '15 ott'}</span></div>`;
    }
    return `<article class="wcard st-${it.status}">
      <header><button class="vchip ${st.c} wst" data-wish-cycle="${it.id}" title="Clicca per cambiare stato">${st.label}</button>${it.shop ? `<span class="chip">${esc(it.shop)}</span>` : ''}</header>
      <h3>${esc(it.title)}</h3>
      <div class="w-price"><b>${it.price ? euro(it.price) : '—'}</b><small>${it.added ? 'aggiunto il ' + new Date(it.added).toLocaleDateString('it-IT') : ''}</small></div>
      ${cmpBox}
      ${it.note ? `<p class="w-note">${esc(it.note)}</p>` : ''}
      <div class="w-act">
        ${it.url ? `<a class="btn primary" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">Apri il link ↗</a>` : ''}
        ${c ? `<button class="btn" data-wish-cmp="${it.cmpId}">Vedi confronto</button>` : ''}
        <button class="btn" data-wish-edit="${it.id}">Modifica</button>
        <button class="btn" data-wish-del="${it.id}">Elimina</button>
      </div>
      ${it.url ? `<p class="w-url muted small">${esc(wishHost(it.url))}</p>` : ''}
    </article>`;
  };
  $('#view-wish').innerHTML = `
    <div class="head"><span class="chip">I PC che ti piacciono</span><h1>Lista desideri</h1>
      <p class="muted">Tieni qui i PC e le configurazioni trovate nei negozi, con il link per tornarci. Se una configurazione è anche nel Confronta, vedi subito se conviene.</p></div>
    <div class="wgrid">${items.length ? items.map(card).join('') : '<div class="panel"><p class="muted">La lista è vuota: aggiungi la prima voce qui sotto.</p></div>'}</div>

    <h2>${ed ? 'Modifica voce' : 'Aggiungi alla lista'}</h2>
    <div class="panel cmpform" id="wish-form">
      <div class="nm-grid f3">
        <label class="field"><span>Nome del PC</span><input id="wf-title" value="${esc(ed ? ed.title : '')}" placeholder="Es. Modello · CPU, GPU, RAM"></label>
        <label class="field"><span>Negozio</span><input id="wf-shop" value="${esc(ed ? ed.shop : '')}" placeholder="Es. PJ DIGITALSTORE"></label>
        <label class="field"><span>Prezzo (€)</span><input id="wf-price" type="number" min="0" step="1" value="${ed ? ed.price || '' : ''}"></label>
      </div>
      <label class="field"><span>Link</span><input id="wf-url" type="url" value="${esc(ed ? ed.url : '')}" placeholder="https://…"></label>
      <div class="nm-grid f3">
        <label class="field"><span>Stato</span><select id="wf-status">${Object.entries(WISH_STATUS).map(([k, v]) => `<option value="${k}" ${(ed ? ed.status : 'eval') === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="field"><span>Collegata al Confronta</span><select id="wf-cmp"><option value="">— nessuna —</option>${cmp.cands.map(c => `<option value="${c.id}" ${ed && ed.cmpId === c.id ? 'selected' : ''}>${esc(c.name)} · ${euro(c.price)}</option>`).join('')}</select></label>
        <label class="field"><span>Note</span><input id="wf-note" value="${esc(ed ? ed.note || '' : '')}" placeholder="Cose da chiedere al negozio…"></label>
      </div>
      <div class="dlg-act"><button class="btn primary" data-wish="save">${ed ? 'Salva modifiche' : 'Aggiungi alla lista'}</button>${ed ? '<button class="btn" data-wish="cancel">Annulla</button>' : ''}</div>
      <p id="wf-msg" class="sync-msg err" role="status"></p>
    </div>`;
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-wish],[data-wish-cycle],[data-wish-edit],[data-wish-del],[data-wish-cmp]');
  if (!t || state.tab !== 'wish') return;
  if (t.dataset.wishCycle) {
    const it = wish.items.find(i => i.id === t.dataset.wishCycle), ks = Object.keys(WISH_STATUS);
    it.status = ks[(ks.indexOf(it.status) + 1) % ks.length]; wishSave(); renderWish();
  } else if (t.dataset.wishEdit) { wish.edit = t.dataset.wishEdit; renderWish(); document.getElementById('wish-form').scrollIntoView({ behavior: 'smooth' }); }
  else if (t.dataset.wishDel) { if (confirm('Togliere questa voce dalla lista?')) { wish.items = wish.items.filter(i => i.id !== t.dataset.wishDel); wishSave(); renderWish(); } }
  else if (t.dataset.wishCmp) { cmp.sel = t.dataset.wishCmp; cmpSave(); showTab('cmp'); }
  else if (t.dataset.wish === 'cancel') { wish.edit = null; renderWish(); }
  else if (t.dataset.wish === 'save') {
    const title = document.getElementById('wf-title').value.trim(), raw = document.getElementById('wf-url').value.trim(), url = raw ? wishSafeUrl(raw) : '';
    const msg = document.getElementById('wf-msg');
    if (!title) { msg.textContent = 'Inserisci il nome del PC.'; return; }
    if (raw && !url) { msg.textContent = 'Il link non è valido: deve iniziare con http:// o https://'; return; }
    const it = { id: wish.edit || 'w-' + Date.now().toString(36), title, shop: document.getElementById('wf-shop').value.trim(), url,
      price: +document.getElementById('wf-price').value || 0, status: document.getElementById('wf-status').value, cmpId: document.getElementById('wf-cmp').value,
      note: document.getElementById('wf-note').value.trim(), added: (wish.items.find(i => i.id === wish.edit) || {}).added || new Date().toISOString().slice(0, 10) };
    const i = wish.items.findIndex(x => x.id === it.id);
    if (i >= 0) wish.items[i] = it; else wish.items.push(it);
    wish.edit = null; wishSave(); renderWish();
  }
});
