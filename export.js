/* ============================================================
   ESPORTA la build: PDF (stampa), testo, immagine PNG, JSON
   ============================================================ */
const slug = () => 'build-pc-2027-' + new Date().toISOString().slice(0, 10);
const xml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const priceTxt = (it, mode) => (price(it, mode) === 0 ? 'già tua' : euro(price(it, mode)));
const modeLabel = () => (state.mode === 'A' ? 'prezzi reali del 27 ottobre' : 'prezzi indicativi del 15 ottobre');

function exportText() {
  const ev = evalNow();
  const L = [`BUILD PC 2027 — ${ev.archetype.name}`, `Voto ${ev.overall}/100 (${ev.tier.label}) · ${modeLabel()} · budget ${euro(state.budget)}`, ''];
  CATS.forEach(c => { const it = getItem(c.key, state.build[c.key]); L.push(`${c.label}: ${it.name} — ${priceTxt(it, state.mode)}${it.v === 'S' && price(it, state.mode) ? ' (stima)' : ''}`); });
  L.push('', `TOTALE: ${euro(ev.total)} (${ev.diff > 0 ? '+' + euro(ev.diff) + ' sopra' : euro(-ev.diff) + ' sotto'} il budget)`, '');
  L.push('Prestazioni: ' + USES.map(u => `${u.short} ${ev.scores[u.key]}`).join(' · '));
  L.push(`Silenziosità ${ev.sil}/100 · ~${Math.round(ev.draw)} W di picco · GPU ${ev.ps5}× una PS5`, '', 'Pareri:');
  ev.pareri.forEach(p => L.push(`${EMOJI_TONE[p.tone]} ${p.title}: ${p.text}`));
  return L.join('\n');
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function exportJson() {
  const ev = evalNow();
  const data = { app: 'build-pc-2027', build: APP_BUILD, exportedAt: new Date().toISOString(), prezzi: modeLabel(), budget: state.budget,
    totale: Math.round(ev.total), voto: ev.overall, usi: state.uses, punteggi: ev.scores,
    componenti: Object.fromEntries(CATS.map(c => { const it = getItem(c.key, state.build[c.key]); return [c.key, { id: it.id, nome: it.name, prezzo: price(it, state.mode), verificato: it.v === 'V' }]; })),
    pareri: ev.pareri.map(p => ({ tipo: p.tone, titolo: p.title, testo: p.text })) };
  download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), slug() + '.json');
}

/* ---------- PDF: report stampabile ---------- */
function printHtml() {
  const ev = evalNow();
  const rows = CATS.map(c => { const it = getItem(c.key, state.build[c.key]);
    return `<tr><th>${c.label}</th><td>${esc(it.name)}<small>${esc(it.spec)}</small></td><td class="r">${priceTxt(it, state.mode)}${it.v === 'S' && price(it, state.mode) ? ' <i>stima</i>' : ''}</td></tr>`; }).join('');
  const bars = USES.map(u => { const v = ev.scores[u.key], on = state.uses.includes(u.key);
    return `<tr class="${on ? '' : 'off'}"><th>${u.label}${on ? '' : ' (non selezionato)'}</th><td><div class="pb"><i style="width:${v}%"></i></div></td><td class="r"><b>${v}</b></td></tr>`; }).join('');
  return `<div class="pr">
    <header><div><small>BUILD PC 2027 · ${new Date().toLocaleDateString('it-IT')}</small><h1>${esc(ev.archetype.name)}</h1><p>${esc(ev.verdict)}</p></div>
      <div class="pscore"><b>${ev.overall}</b><span>${ev.tier.label}</span></div></header>
    <h2>Componenti <small>${modeLabel()}</small></h2>
    <table class="pt">${rows}<tr class="tot"><th colspan="2">Totale · budget ${euro(state.budget)} (${ev.diff > 0 ? '+' + euro(ev.diff) + ' sopra' : euro(-ev.diff) + ' sotto'})</th><td class="r">${euro(ev.total)}</td></tr></table>
    <h2>Prestazioni per uso</h2><table class="pt">${bars}</table>
    <p class="facts">GPU ${ev.ps5}× una PS5 · silenziosità ${ev.sil}/100 · consumo di picco ~${Math.round(ev.draw)} W</p>
    <h2>Giochi</h2><p>${ev.games.map(g => `${esc(g.name)}: <b>${g.status.label}</b>`).join(' · ')}</p>
    <h2>Pareri</h2><ul>${ev.pareri.map(p => `<li class="${p.tone}"><b>${esc(p.title)}.</b> ${esc(p.text)}</li>`).join('')}</ul>
    <footer>Punteggi stimati dal builder, non benchmark. Ricontrolla i prezzi prima di acquistare. Build ${APP_BUILD} dell'app.</footer></div>`;
}
function exportPdf() {
  $('#print-root').innerHTML = printHtml();
  const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  document.body.classList.add('printing');
  setTimeout(() => window.print(), 80);
}

/* ---------- PNG: scheda da condividere ---------- */
function cardSvg() {
  const ev = evalNow(), W = 1080; let H = 1500;
  const tc = ev.tier.color, r = 82, C = 2 * Math.PI * r;
  let y = 560, rows = '';
  CATS.forEach(c => {
    const it = getItem(c.key, state.build[c.key]);
    rows += `<rect x="60" y="${y - 44}" width="960" height="72" rx="16" fill="#161a33"/><rect x="60" y="${y - 44}" width="8" height="72" rx="4" fill="${c.color}"/>
      <text x="92" y="${y - 12}" class="lb">${xml(c.label.toUpperCase())}</text><text x="92" y="${y + 14}" class="nm">${xml(cut(it.name, 38))}</text>
      <text x="1000" y="${y + 8}" text-anchor="end" class="pr">${xml(priceTxt(it, state.mode))}</text>`;
    y += 84;
  });
  y += 10;
  const sel = USES.filter(u => state.uses.includes(u.key));
  let bars = '', by = y + 62;
  sel.forEach((u, i) => {
    const v = ev.scores[u.key], x = 60 + (i % 2) * 490, yy = by + Math.floor(i / 2) * 62;
    bars += `<text x="${x}" y="${yy}" class="ul">${xml(u.label)}</text><text x="${x + 460}" y="${yy}" text-anchor="end" class="ul" fill="${scoreColor(v)}" font-weight="800">${v}</text>
      <rect x="${x}" y="${yy + 10}" width="460" height="10" rx="5" fill="#252a4d"/><rect x="${x}" y="${yy + 10}" width="${460 * v / 100}" height="10" rx="5" fill="${scoreColor(v)}"/>`;
  });
  H = by + Math.ceil(sel.length / 2) * 62 + 30;
  const over = ev.diff > 0;
  return { H, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
    <style>.lb{font-size:17px;fill:#9aa0c6;font-weight:700;letter-spacing:2px}.nm{font-size:27px;fill:#fff;font-weight:700}.pr{font-size:28px;fill:#fff;font-weight:800}.ul{font-size:24px;fill:#d4d7f5;font-weight:600}</style>
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a0b14"/><stop offset="1" stop-color="#171235"/></linearGradient>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4fd8"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="8" fill="url(#rg)"/>
    <text x="60" y="90" font-size="26" font-weight="800" letter-spacing="5" fill="#fff">BUILD<tspan fill="#ff4fd8">PC</tspan>2027</text>
    <text x="1020" y="90" text-anchor="end" font-size="22" fill="#9aa0c6">${new Date().toLocaleDateString('it-IT')}</text>
    <text x="60" y="210" font-size="62" font-weight="800" fill="#fff">${xml(cut(ev.archetype.name, 26))}</text>
    <text x="60" y="262" font-size="26" fill="#9aa0c6">${xml(cut(ev.archetype.line, 62))}</text>
    <g transform="translate(870 400)"><circle r="${r}" fill="none" stroke="#252a4d" stroke-width="18"/>
      <circle r="${r}" fill="none" stroke="${tc}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - ev.overall / 100)}" transform="rotate(-90)"/>
      <text y="22" text-anchor="middle" font-size="68" font-weight="800" fill="#fff">${ev.overall}</text>
      <text y="${r + 54}" text-anchor="middle" font-size="22" fill="${tc}" font-weight="700" letter-spacing="3">${xml(ev.tier.label.toUpperCase())}</text></g>
    <text x="60" y="360" font-size="22" fill="#9aa0c6" letter-spacing="2">TOTALE</text>
    <text x="60" y="440" font-size="84" font-weight="800" fill="#fff">${xml(euro(ev.total))}</text>
    <text x="60" y="490" font-size="26" font-weight="700" fill="${over ? '#f87171' : '#34d399'}">${over ? '+' + xml(euro(ev.diff)) + ' sopra' : xml(euro(-ev.diff)) + ' sotto'} il budget di ${xml(euro(state.budget))}</text>
    ${rows}
    <text x="60" y="${y + 20}" font-size="22" fill="#9aa0c6" letter-spacing="2">PRESTAZIONI</text>
    ${bars}
    <text x="60" y="${H - 40}" font-size="20" fill="#6b719b">${xml(modeLabel())} · punteggi stimati, non benchmark · Build ${APP_BUILD}</text></svg>` };
}
function exportPng(btn) {
  const img = new Image(), card = cardSvg();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 1080; c.height = card.H;
    c.getContext('2d').drawImage(img, 0, 0);
    c.toBlob(b => b ? download(b, slug() + '.png') : alert('Immagine non generata.'), 'image/png');
  };
  img.onerror = () => alert('Non riesco a generare l\'immagine su questo browser.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(card.svg);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-exp]');
  if (!t) return;
  const a = t.dataset.exp, d = document.getElementById('exp-dlg');
  if (a === 'open') { d.showModal ? d.showModal() : d.setAttribute('open', ''); document.getElementById('exp-msg').textContent = ''; return; }
  if (a === 'close') return d.close();
  const msg = m => (document.getElementById('exp-msg').textContent = m);
  if (a === 'pdf') { d.close(); exportPdf(); }
  else if (a === 'png') { exportPng(); msg('Immagine scaricata ✓'); }
  else if (a === 'json') { exportJson(); msg('File JSON scaricato ✓'); }
  else if (a === 'text') {
    const txt = exportText();
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => msg('Testo copiato ✓'), () => { download(new Blob([txt], { type: 'text/plain' }), slug() + '.txt'); msg('Copia non permessa: scaricato come .txt'); });
  }
});
