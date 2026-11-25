/* ============================================================
   HOME: il riepilogo del mio PC (Gladio VS5)
   Dati non sensibili sono nel codice; numero d'ordine, date e
   pagamenti vivono solo nel browser (e nel Sync, cifrato).
   ============================================================ */
const PC_KEY = 'buildpc2027_pc';
const PC_DEFAULT = {
  name: 'Gladio VS5', shop: 'PJ Digitalstore', purchased: '2026-11-25', orderNo: '',
  price: 2099.99, shipping: 29.99, payMethod: 'Scalapay', notes: '',
  payments: [
    { date: '2026-11-25', amount: 709.99, paid: true },
    { date: '2026-12-25', amount: 709.99, paid: false },
    { date: '2027-01-25', amount: 710.99, paid: false },
  ],
};
const pc = Object.assign({}, PC_DEFAULT, store.get(PC_KEY, {}));
const pcSave = () => store.set(PC_KEY, pc);

const PC_PARTS = [
  { icon: '🧠', label: 'Processore', name: 'AMD Ryzen 5 7500X3D', spec: '6 core / 12 thread · 3D V-Cache · socket AM5 · fino a 4,5 GHz', cat: 'cpu' },
  { icon: '🎮', label: 'Scheda video', name: 'Gigabyte Radeon RX 9060 XT Gaming OC Ice 16 GB', spec: 'RDNA 4 · 16 GB GDDR6 · ray tracing · FSR 4 · versione bianca', cat: 'gpu' },
  { icon: '🧩', label: 'Scheda madre', name: 'MSI B850 Gaming Plus WiFi', spec: 'AM5 · DDR5 · Wi-Fi e Bluetooth integrati · slot M.2 Gen5', cat: 'mobo' },
  { icon: '⚡', label: 'RAM', name: 'Patriot 32 GB (2×16) DDR5-6000 CL30', spec: 'Profilo EXPO · da attivare nel BIOS', cat: 'ram' },
  { icon: '💾', label: 'SSD', name: 'Kingston SNV3 (NV3) 1 TB NVMe', spec: 'PCIe 4.0 · fino a ~6000 MB/s in lettura', cat: 'ssd' },
  { icon: '🔌', label: 'Alimentatore', name: 'MSI MAG A750BN 750 W', spec: '80 PLUS Bronze · ATX', cat: 'psu' },
  { icon: '❄️', label: 'Dissipatore', name: 'MSI MAG CoreLiquid A13 360 mm (bianco)', spec: 'AIO a liquido · 3 ventole ARGB', cat: 'cooler' },
  { icon: '🖥️', label: 'Case', name: 'Cougar FV150 RGB (bianco)', spec: 'Mid-tower a doppia camera · vetro panoramico · 4 ventole ARGB · 300×400×415 mm', cat: 'case' },
  { icon: '🪟', label: 'Sistema operativo', name: 'Windows 11 Pro 64 bit (OEM)', spec: 'Licenza OEM legata a questo PC', cat: 'os' },
];
const PC_BUILD_IDS = { cpu: 'r5-7500x3d', gpu: 'rx9060xt', mobo: 'b850-atx', ram: 'ram32', ssd: 'ssd1', psu: 'psu750b', cooler: 'aio360', case: 'fv150' };

const pcTotal = () => pc.price + pc.shipping;
const pcPaid = () => pc.payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
const pcPayTotal = () => pc.payments.reduce((s, p) => s + p.amount, 0);

/* ---------- illustrazione animata del MIO PC (basata sulla foto del modello) ---------- */
function vs5Svg() {
  const fan = (cx, cy, r, d = 0, spd = 1.6) => `<g class="vfan" style="animation-duration:${spd}s;animation-delay:${d}s"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#dfe6ff" fill-opacity=".18" stroke="url(#vglow)" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${r * .55}" fill="none" stroke="url(#vglow)" stroke-width="3.5" opacity=".9"/>${[0, 72, 144, 216, 288].map(a => `<path d="M${cx} ${cy} L${cx} ${cy - r * .9}" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="${r * .16}" fill="#fff"/></g>`;
  return `<svg class="vs5" viewBox="0 0 520 480" role="img" aria-label="Illustrazione del mio PC: Cougar FV150 bianco con ventole RGB">
    <defs>
      <linearGradient id="vglow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset=".5" stop-color="#c084fc"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
      <linearGradient id="vglass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".22"/><stop offset="1" stop-color="#7aa2ff" stop-opacity=".05"/></linearGradient>
      <radialGradient id="vhalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#60a5fa" stop-opacity=".55"/><stop offset="1" stop-color="#60a5fa" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="260" cy="260" rx="250" ry="215" fill="url(#vhalo)" class="vhalo"/>
    <!-- telaio bianco -->
    <path d="M70 120 L300 40 L470 100 L470 400 L300 450 L70 390 Z" fill="#0d1020" stroke="#eef2ff" stroke-width="7" stroke-linejoin="round"/>
    <path d="M70 120 L300 40 L470 100" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" opacity=".9"/>
    <path d="M470 100 L500 118 L500 380 L470 400 Z" fill="#e8ecf8" stroke="#fff" stroke-width="4"/>
    <path d="M70 120 L300 40 L470 100 L470 400 L300 450 L70 390 Z" fill="url(#vglass)"/>
    <!-- radiatore con 3 ventole (in alto) -->
    <path d="M110 160 L300 96 L440 142 L440 176 L300 134 L110 196 Z" fill="#eef2ff" fill-opacity=".92"/>
    ${fan(176, 168, 26, 0, 1.4)}${fan(262, 140, 28, .2, 1.5)}${fan(358, 134, 30, .4, 1.6)}
    <path d="M108 168 L430 132" stroke="url(#vglow)" stroke-width="4" class="vstrip"/>
    <!-- tubi bianchi -->
    <path d="M338 168 C338 220 300 232 292 262 M366 164 C372 226 330 244 322 268" fill="none" stroke="#f4f6ff" stroke-width="12" stroke-linecap="round"/>
    <rect x="278" y="258" width="62" height="58" rx="10" fill="#f4f6ff" stroke="#c9d3ff"/><circle cx="309" cy="287" r="16" fill="#0d1020" stroke="url(#vglow)" stroke-width="4" class="vpump"/>
    <!-- RAM -->
    <rect x="364" y="236" width="9" height="70" rx="2" fill="#2a2f55"/><rect x="378" y="236" width="9" height="70" rx="2" fill="#2a2f55"/>
    <rect x="364" y="236" width="9" height="12" rx="2" fill="url(#vglow)" class="vstrip"/><rect x="378" y="236" width="9" height="12" rx="2" fill="url(#vglow)" class="vstrip"/>
    <!-- 3 ventole laterali -->
    ${fan(432, 220, 30, .1, 1.7)}${fan(432, 292, 30, .3, 1.8)}${fan(432, 364, 30, .5, 1.9)}
    <!-- ventola posteriore -->
    ${fan(122, 262, 26, .2, 1.5)}
    <!-- scheda video bianca (AMD) in basso -->
    <path d="M112 338 L388 326 L398 368 L120 384 Z" fill="#f4f6ff" stroke="#c9d3ff" stroke-width="2"/>
    ${fan(176, 360, 17, 0, 1.2)}${fan(250, 356, 17, .15, 1.2)}${fan(324, 352, 17, .3, 1.2)}
    <text x="404" y="372" font-size="11" font-weight="800" fill="#e8ecf8" opacity=".9">RX 9060 XT</text>
    <!-- piedini -->
    <rect x="110" y="392" width="46" height="12" rx="5" fill="#eef2ff"/><rect x="368" y="438" width="46" height="12" rx="5" fill="#eef2ff"/>
    <text x="494" y="430" font-size="10" font-weight="800" fill="#cfd6f5" opacity=".7" transform="rotate(-90 494 430)">COUGAR</text>
  </svg>`;
}

/* ---------- promemoria aggregati (Home + calendario) ---------- */
function pcReminders() {
  const out = [];
  pc.payments.forEach((p, i) => { if (!p.paid) out.push({ date: p.date, title: `Rata Scalapay ${i + 1}/${pc.payments.length}: ${euro2(p.amount)}`, tab: 'home', kind: 'pay' }); });
  const dl = (typeof chk !== 'undefined' && chk.delivered) || '';
  if (dl) { out.push({ date: addDaysISO(dl, 14), title: 'Ultimo giorno di recesso (14 giorni dalla consegna)', tab: 'chk', kind: 'rec' }); out.push({ date: addMonthsISO(dl, 24), title: 'Scadenza della garanzia legale di 24 mesi', tab: 'docs', kind: 'war' }); }
  if (typeof manDue === 'function') manDue().forEach(m => out.push({ date: m.next, title: 'Manutenzione: ' + m.title, tab: 'man', kind: 'man' }));
  if (typeof softRenewals === 'function') softRenewals().forEach(s => out.push({ date: s.renew, title: 'Rinnovo: ' + s.name, tab: 'soft', kind: 'soft' }));
  if (typeof remList === 'function') remList().forEach(r => out.push({ date: r.date, title: r.title, tab: 'home', kind: 'rem' }));
  return out.filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date));
}

/* ---------- pagina Home ---------- */
function renderHome() {
  const ev = evaluate(PC_BUILD_IDS, 'A', 2500, PROFILES.niky.uses);
  const total = pcTotal(), payTot = pcPayTotal(), paid = pcPaid(), left = payTot - paid;
  const age = Math.max(0, -daysTo(pc.purchased));
  const dl = (typeof chk !== 'undefined' && chk.delivered) || '';
  const perDay = total / (6 * 365);
  const rems = pcReminders().filter(r => daysTo(r.date) >= -30).slice(0, 8);
  const mism = Math.abs(payTot - total) > 0.005;
  $('#view-home').innerHTML = `
    <div class="hero home-hero">
      <div class="hero-txt">
        <span class="chip">Il mio computer · centro operativo</span>
        <h1>${esc(pc.name)}</h1>
        <p>Acquistato da <b>${esc(pc.shop)}</b> il <b>${fmtD(pc.purchased)}</b>${age ? ` · ${age} giorni fa` : ' · oggi'}. ${dl ? `Consegnato il <b>${fmtD(dl)}</b>.` : 'Data di consegna da inserire nella Checklist.'}</p>
        <ul class="facts">
          <li><b>${ev.overall}/100</b><span>voto sui miei usi (${ev.tier.label})</span></li>
          <li><b>${ev.ps5}×</b><span>potenza grafica di una PS5</span></li>
          <li><b>${euro2(total)}</b><span>speso in totale</span></li>
          <li><b>${euro2(perDay)}</b><span>al giorno, su 6 anni</span></li>
        </ul>
        <div class="hero-cta"><button class="btn primary" data-pc="edit">✏️ Modifica dati</button><button class="btn" data-pc="print">📄 Scheda tecnica PDF</button><button class="btn" data-pc="ics">📅 Scadenze nel calendario</button></div>
      </div>
      <div class="hero-pc"><div class="pc-tabs"><button class="on" data-pcv="draw">Il mio PC</button><button data-pcv="photo">Foto del modello</button></div>
        <div id="pc-draw">${vs5Svg()}</div>
        <figure id="pc-photo" hidden><img src="assets/pc-photo.jpg" alt="Foto del modello Gladio VS5 (immagine del negozio)" loading="lazy"><figcaption class="muted small">Foto del negozio: la scheda video mostrata (ZOTAC GeForce) non è la mia, che è una Gigabyte Radeon RX 9060 XT bianca.</figcaption></figure></div>
    </div>

    <h2>I componenti</h2>
    <div class="parts">${PC_PARTS.map(p => `<div class="part"><span class="pi">${p.icon}</span><div><small>${p.label}</small><b>${esc(p.name)}</b><span>${esc(p.spec)}</span></div></div>`).join('')}</div>

    <div class="vgrid">
      <div class="panel"><h3>Quanto l'ho pagato</h3>
        <ul class="kv"><li><span>Prezzo del PC</span><b>${euro2(pc.price)}</b></li><li><span>Spedizione</span><b>${euro2(pc.shipping)}</b></li><li class="tot"><span>Totale</span><b>${euro2(total)}</b></li>
          <li><span>Metodo</span><b>${esc(pc.payMethod)} · ${pc.payments.length} rate</b></li><li><span>Ordine n°</span><b>${pc.orderNo ? esc(pc.orderNo) : '<i class="muted">da inserire (resta solo sul mio dispositivo)</i>'}</b></li></ul>
        <h4 class="dg-t">Le rate</h4>
        <ul class="pays">${pc.payments.map((p, i) => `<li class="${p.paid ? 'paid' : ''}"><label><input type="checkbox" data-pay="${i}" ${p.paid ? 'checked' : ''}><span class="box" aria-hidden="true"></span><span class="pdt">Rata ${i + 1} · ${fmtD(p.date)}</span><b>${euro2(p.amount)}</b><em>${p.paid ? 'pagata' : dueLabel(p.date)}</em></label></li>`).join('')}</ul>
        <p class="small ${mism ? 'over' : 'muted'}">Pagato ${euro2(paid)} · da pagare ${euro2(left)}.${mism ? ` Attenzione: le rate sommano ${euro2(payTot)}, il totale è ${euro2(total)} (differenza ${euro2(payTot - total)}): controlla nell'app Scalapay.` : ''}</p></div>
      <div class="panel"><h3>Prossime scadenze</h3>
        ${rems.length ? `<ul class="rems">${rems.map(r => `<li class="k-${r.kind}"><span class="rd">${fmtD(r.date)}</span><span class="rt">${esc(r.title)}</span><em>${dueLabel(r.date)}</em></li>`).join('')}</ul>` : '<p class="muted">Nessuna scadenza in arrivo.</p>'}
        <div class="dactions"><button class="btn" data-pc="addrem">＋ Promemoria</button></div></div>
    </div>

    <div class="vgrid">
      <div class="panel"><h3>Come va, sui miei usi</h3>${USES.filter(u => PROFILES.niky.uses.includes(u.key)).map(u => { const v = ev.scores[u.key]; return `<div class="urow"><div class="u-h"><span>${u.icon} ${u.label}</span><b style="color:${scoreColor(v)}">${v}</b></div><div class="bar sm"><i style="width:${v}%;background:${scoreColor(v)}"></i></div></div>`; }).join('')}
        <p class="muted small">Stime del builder, non benchmark.</p></div>
      <div class="panel"><h3>Il vecchio PC</h3><ul class="kv small"><li><span>CPU</span><b>Ryzen 5 3600</b></li><li><span>Scheda video</span><b>GTX 1660 Super 6 GB</b></li><li><span>RAM</span><b>8 GB</b></li><li><span>SSD</span><b>512 GB</b></li><li><span>Scheda madre</span><b>Gigabyte B450M S2H V2</b></li></ul>
        <p class="muted small">Confronti e vecchie ricerche sono nella scheda <b>Old</b>.</p><div class="dactions"><button class="btn" data-tab="riepilogo">Vai a Old →</button></div></div>
    </div>

    <h2>Vai a</h2>
    <div class="quick">${[['soft', '🧰', 'Software'], ['restore', '🛟', 'Ripristino'], ['docs', '🛡️', 'Garanzie e assistenza'], ['man', '🧹', 'Manutenzione'], ['diario', '📓', 'Diario'], ['diag', '🩺', 'Diagnosi'], ['manual', '📖', 'Manuale e link'], ['giochi', '🎮', 'Giochi'], ['post', '🎛️', 'Postazione']].map(q => `<button class="qk" data-tab="${q[0]}"><span>${q[1]}</span>${q[2]}</button>`).join('')}</div>
    ${pc.notes ? `<div class="panel"><h3>Note</h3><p>${esc(pc.notes)}</p></div>` : ''}`;
}

/* ---------- eventi della Home ---------- */
document.addEventListener('click', async e => {
  const v = e.target.closest('[data-pcv]');
  if (v) { document.querySelectorAll('.pc-tabs button').forEach(b => b.classList.toggle('on', b === v)); document.getElementById('pc-draw').hidden = v.dataset.pcv !== 'draw'; document.getElementById('pc-photo').hidden = v.dataset.pcv !== 'photo'; return; }
  const t = e.target.closest('[data-pc]'); if (!t) return;
  const a = t.dataset.pc;
  if (a === 'edit') {
    const vals = await openForm({ title: 'Dati del PC', fields: [
      { k: 'name', label: 'Nome del PC', req: true }, { k: 'shop', label: 'Negozio' }, { k: 'purchased', label: 'Data di acquisto', type: 'date' },
      { k: 'orderNo', label: 'Numero d\'ordine (solo su questo dispositivo)' }, { k: 'price', label: 'Prezzo del PC (€)', type: 'number', step: '0.01' }, { k: 'shipping', label: 'Spedizione (€)', type: 'number', step: '0.01' },
      { k: 'payMethod', label: 'Metodo di pagamento' }, { k: 'notes', label: 'Note', type: 'textarea' }], values: pc });
    if (vals) { Object.assign(pc, vals, { price: +vals.price || 0, shipping: +vals.shipping || 0 }); pcSave(); renderHome(); }
  } else if (a === 'addrem') {
    const vals = await openForm({ title: 'Nuovo promemoria', fields: [{ k: 'date', label: 'Data', type: 'date', req: true }, { k: 'title', label: 'Cosa ricordare', req: true }], values: { date: todayISO() } });
    if (vals) { const l = store.get('buildpc2027_rem', []); l.push({ id: uid(), ...vals }); store.set('buildpc2027_rem', l); renderHome(); }
  } else if (a === 'ics') {
    const ev = pcReminders().filter(r => daysTo(r.date) >= 0); if (!ev.length) return alert('Nessuna scadenza futura da esportare.');
    icsDownload(ev.map(r => ({ date: r.date, title: `${pc.name}: ${r.title}` })), 'scadenze-pc.ics');
  } else if (a === 'print') { pcPrint(); }
});
document.addEventListener('change', e => {
  const i = e.target.dataset && e.target.dataset.pay; if (i == null || e.target.dataset.pay === undefined) return;
  pc.payments[+i].paid = e.target.checked; pcSave(); renderHome();
});
const remList = () => store.get('buildpc2027_rem', []);

/* ---------- scheda tecnica in PDF (stampa) ---------- */
function pcPrint() {
  const total = pcTotal();
  $('#print-root').innerHTML = `<div class="pr"><header><div><small>SCHEDA TECNICA DEL PC · ${new Date().toLocaleDateString('it-IT')}</small><h1>${esc(pc.name)}</h1><p>${esc(pc.shop)} · acquistato il ${fmtD(pc.purchased)}${pc.orderNo ? ' · ordine ' + esc(pc.orderNo) : ''}</p></div></header>
    <h2>Componenti</h2><table class="pt">${PC_PARTS.map(p => `<tr><th>${p.label}</th><td>${esc(p.name)}<small>${esc(p.spec)}</small></td></tr>`).join('')}</table>
    <h2>Costi</h2><table class="pt"><tr><th>PC</th><td class="r">${euro2(pc.price)}</td></tr><tr><th>Spedizione</th><td class="r">${euro2(pc.shipping)}</td></tr><tr class="tot"><th>Totale</th><td class="r">${euro2(total)}</td></tr></table>
    <h2>Garanzia</h2><p>Consegna: ${fmtD(chk.delivered)} · recesso fino al ${chk.delivered ? fmtD(addDaysISO(chk.delivered, 14)) : '—'} · garanzia legale fino al ${chk.delivered ? fmtD(addMonthsISO(chk.delivered, 24)) : '—'}.</p>
    <footer>Generata dalla web app Build PC 2027, build ${APP_BUILD}.</footer></div>`;
  const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done); document.body.classList.add('printing'); setTimeout(() => window.print(), 80);
}
