/* ============================================================
   PAGINA "CONFRONTA": la tua build di riferimento contro le
   configurazioni trovate nei negozi (prezzo, componenti, voti, verdetto)
   ============================================================ */
const CMP_KEY = 'buildpc2027_cmp';
const cmp = {
  ref: { cpu: 'r7-9700x', gpu: 'rx9070', mobo: 'b850-atx', ram: 'ram32', ssd: 'ssd2', psu: 'psu850', cooler: 'pa120', case: 'north' },
  refName: 'La mia build (dai PDF)',
  winVal: 100, asmVal: 80, useWin: true, useAsm: true,
  sel: 'c-v8', edit: null, seeded: ['c-v2', 'c-v8'],
  cands: [
    { id: 'c-v2', name: 'Egemone V2 Evo', price: 2490, win: true, asm: true, note: 'Gigabyte UD850GM 850 W Gold · MSI MAG A13 360 mm · Cougar FV150 RGB',
      build: { cpu: 'r7-7800x3d', gpu: 'rtx5070', mobo: 'b850-atx', ram: 'ram32', ssd: 'ssd1', psu: 'psu850', cooler: 'aio360', case: 'fv150' } },
    { id: 'c-v8', name: 'Egemone V8', price: 2599, win: true, asm: true, note: 'Alimentatore MSI MAG A750BN 750 W Bronze · MSI MAG A13 360 mm · Antec C3',
      build: { cpu: 'r7-7800x3d', gpu: 'rx9070xt', mobo: 'b850-atx', ram: 'ram32', ssd: 'ssd1', psu: 'psu750b', cooler: 'aio360', case: 'antec' } },
  ],
};
try { const d = JSON.parse(localStorage.getItem(CMP_KEY) || 'null'); if (d) Object.assign(cmp, d); } catch (e) { /* ignore */ }
cmp.edit = null;
/* configurazioni predefinite aggiunte nelle nuove build: compaiono una sola volta, anche se esiste già un salvataggio */
const CMP_SEEDS = [
  { id: 'c-pcs', name: 'PCSpecialist · 9700X + RX 9070', price: 2944, win: true, asm: true,
    note: 'Prezzo IVA inclusa (2.413,11 € + IVA). Corsair RMx 850 W · LS-360 AIO · PCS Spectrum II Compact · Windows 11 Home · 2 strisce LED (+20 €) e scheda Wi-Fi inclusi. Taglio dell\'SSD non visibile negli screenshot: assunto 1 TB.',
    build: { cpu: 'r7-9700x', gpu: 'rx9070', mobo: 'asus-b850-plus', ram: 'ram32', ssd: 'ssd1', psu: 'rmx850', cooler: 'aio360', case: 'pcs-spectrum' } },
  { id: 'c-afk', name: 'AFK Store · Whale AMD (9600 + RTX 5070)', price: 2469, win: true, asm: true,
    note: 'Ryzen 5 9600 · RTX 5070 Ventus X2 OC 12 GB · 32 GB DDR5 · Adata Legend 860 1 TB · AIO MSI MAG Coreliquid A13 360 · Gigabyte B650 Eagle AX · UD750GM 750 W Gold · MasterBox 520 ARGB · Windows 11 Pro OEM + Office 2019 Pro Plus OEM.',
    build: { cpu: 'r5-9600', gpu: 'rtx5070', mobo: 'b650-eagle', ram: 'ram32', ssd: 'ssd1', psu: 'psu750', cooler: 'aio360', case: 'mb520' } },
  { id: 'c-v8g', name: 'Egemone V8 + alimentatore 850 W Gold', price: 2639, win: true, asm: true,
    note: 'Come la V8 (2.599 €) ma con Gigabyte UD850GM PG5 V2 (850 W Gold ATX 3.1) al posto dell\'MSI A750BN: +40 € confermati dal negozio. 7800X3D · RX 9070 XT · 32 GB · SSD 1 TB · AIO MSI 360 · Antec C3 · Windows 11 Pro.',
    build: { cpu: 'r7-7800x3d', gpu: 'rx9070xt', mobo: 'b850-atx', ram: 'ram32', ssd: 'ssd1', psu: 'psu850', cooler: 'aio360', case: 'antec' } },
];
/* aggiorna la nota della V8 salvata prima che si conoscesse la marca dell'alimentatore */
cmp.cands.forEach(x => { if (x.id === 'c-v8' && /marca non indicata/.test(x.note || '')) x.note = 'Alimentatore MSI MAG A750BN 750 W Bronze · MSI MAG A13 360 mm · Antec C3'; });
CMP_SEEDS.forEach(s => { if (!cmp.seeded.includes(s.id)) { cmp.cands.push(s); cmp.seeded.push(s.id); } });
const cmpSave = () => { try { localStorage.setItem(CMP_KEY, JSON.stringify({ ref: cmp.ref, refName: cmp.refName, winVal: cmp.winVal, asmVal: cmp.asmVal, useWin: cmp.useWin, useAsm: cmp.useAsm, sel: cmp.sel, cands: cmp.cands, seeded: cmp.seeded })); } catch (e) { /* ignore */ } };
cmpSave();
const cmpData = () => ({ ref: cmp.ref, refName: cmp.refName, winVal: cmp.winVal, asmVal: cmp.asmVal, useWin: cmp.useWin, useAsm: cmp.useAsm, cands: cmp.cands, seeded: cmp.seeded });

/* metrica per decidere "meglio/peggio" per categoria */
const CMP_METRIC = {
  cpu: x => 0.6 * x.g + 0.4 * x.mt,
  gpu: x => x.idx + (x.vram >= 16 ? 4 : 0),
  mobo: x => x.vrm * 10 + (x.wifi ? 5 : 0),
  ram: x => x.gb,
  ssd: x => x.tb * 100 + x.spd / 1000,
  psu: x => x.w + (x.qual === 'Gold' ? 150 : 0),
  cooler: x => x.cap + x.silent,
  case: x => x.silent + x.air * 0.5 + (x.rgb ? 10 : 0),
};
function cmpArrow(cat, a, b) {   // a = riferimento, b = candidata
  if (a.id === b.id) return { s: '＝', c: 'eq', t: 'uguale' };
  const ma = CMP_METRIC[cat](a), mb = CMP_METRIC[cat](b), d = (mb - ma) / Math.max(1, Math.abs(ma));
  if (Math.abs(d) < 0.02) return { s: '≈', c: 'eq', t: 'simile' };
  return d > 0 ? { s: '▲', c: 'up', t: 'meglio' } : { s: '▼', c: 'dw', t: 'peggio' };
}

function cmpEval(c) {
  const rEv = evaluate(cmp.ref, state.mode, state.budget, state.uses);
  const cEv = evaluate(c.build, state.mode, state.budget, state.uses);
  const refParts = rEv.total, candParts = cEv.total;
  const winV = c.win && cmp.useWin ? cmp.winVal : 0, asmV = c.asm && cmp.useAsm ? cmp.asmVal : 0;
  const equiv = c.price - winV - asmV;            // quanto costano "solo i pezzi" in quel negozio
  const dEur = equiv - refParts, dScore = cEv.overall - rEv.overall;
  return { rEv, cEv, refParts, candParts, winV, asmV, equiv, dEur, dScore, markup: equiv - candParts, v: cmpVerdict(cEv, dEur, dScore) };
}

function cmpVerdict(cEv, de, dp) {
  const ppt = dp > 0 && de > 0 ? ` (${euro(de / dp)} per ogni punto in più)` : '';
  if (cEv.errors.length) return { k: 'bad', t: 'Non si assembla', d: 'Qualche pezzo è incompatibile con un altro: controlla i dettagli.' };
  if (dp >= 2) {
    if (de <= 60) return { k: 'good', t: 'Conviene', d: `Rende di più (+${dp} punti) e costa ${de <= 0 ? 'meno' : 'poco più'} della tua build.` };
    if (de <= 200) return { k: 'warn', t: 'Più prestazioni, ma costa di più', d: `+${dp} punti per ${euro(de)} in più${ppt}. Conviene solo se quei punti sono quello che ti serve.` };
    return { k: 'bad', t: 'Non conviene', d: `+${dp} punti ma ${euro(de)} in più${ppt}: il rapporto non regge.` };
  }
  if (dp > -2) {
    if (de <= 0) return { k: 'good', t: 'Conviene', d: 'Stesso livello di prestazioni, e costa meno.' };
    if (de <= 60) return { k: 'warn', t: 'Pari', d: 'Stesso livello e prezzo molto simile: scegli per comodità (Windows e montaggio) e garanzia.' };
    return { k: 'bad', t: 'Non conviene', d: `Stesso livello, ma costa ${euro(de)} in più.` };
  }
  if (de <= -150) return { k: 'warn', t: 'Risparmi, ma rendi meno', d: `${dp} punti, ma risparmi ${euro(-de)}. Ha senso solo se il budget è la priorità.` };
  return { k: 'bad', t: 'Non conviene', d: `Rende meno (${dp} punti)${de > 0 ? ' e costa di più' : ' senza risparmiare abbastanza'}.` };
}

/* differenze chiave, scritte in anticipo */
function cmpNotes(r, c) {
  const out = [], R = k => getItem(k, cmp.ref[k]), N = k => getItem(k, c.build[k]);
  const rc = R('cpu'), nc = N('cpu'), rg = R('gpu'), ng = N('gpu'), rs = R('ssd'), ns = N('ssd'), rp = R('psu'), np = N('psu'), rk = R('cooler'), nk = N('cooler'), rcs = R('case'), ncs = N('case'), rr = R('ram'), nr = N('ram');
  const add = (t, x) => out.push({ t, x });
  if (rc.id !== nc.id) add(nc.g > rc.g ? 'up' : nc.g < rc.g ? 'dn' : 'eq', `CPU ${nc.name} contro ${rc.name}: ${nc.g > rc.g ? 'meglio nei giochi' : nc.g < rc.g ? 'meno forte nei giochi' : 'pari nei giochi'}${nc.mt - rc.mt > 8 ? ', più forte in multi-core' : rc.mt - nc.mt > 8 ? ', più debole in multi-core (video, render)' : ', stesso livello su audio e video'}.`);
  if (rg.id !== ng.id) {
    const dp = Math.round(((ng.idx - rg.idx) / rg.idx) * 100);
    add(ng.idx >= rg.idx && ng.vram >= rg.vram ? 'up' : 'dn', `Scheda video ${ng.name} contro ${rg.name}: ${dp >= 0 ? '+' : ''}${dp}% di potenza${ng.vram !== rg.vram ? `, VRAM ${ng.vram} GB contro ${rg.vram} GB${ng.vram < rg.vram ? ': i 12 GB nei giochi 2026 e in GTA 6 sono il punto debole' : ''}` : ''}${ng.brand !== rg.brand && ng.brand === 'NVIDIA' ? '. Nvidia porta DLSS, CUDA e un encoder migliore, ma per te contano meno della VRAM' : ''}.`);
  }
  if (rr.gb !== nr.gb) add(nr.gb > rr.gb ? 'up' : 'dn', `RAM ${nr.gb} GB contro ${rr.gb} GB.`);
  if (rs.tb !== ns.tb) add(ns.tb >= rs.tb ? 'up' : (ENGINE_OPTS.ext ? 'eq' : 'dn'), `SSD ${ns.tb} TB contro ${rs.tb} TB: ${ns.tb < rs.tb ? (ENGINE_OPTS.ext ? 'archivi su HDD esterni, quindi 1 TB basta e lasci l\'SSD libero' : 'meno spazio per progetti audio e video') : 'più spazio, che con i tuoi HDD esterni usi poco'}.`);
  if (rp.id !== np.id) add(np.w >= rp.w && np.qual === rp.qual ? 'eq' : 'dn', `Alimentatore ${np.w} W ${np.qual} contro ${rp.w} W ${rp.qual}${np.qual === 'Bronze' && rp.qual === 'Gold' ? ': scendi di qualità e margine proprio dove conviene non risparmiare (marca da verificare)' : np.w < rp.w ? ': meno margine per cambiare scheda in futuro' : ''}.`);
  if (rk.id !== nk.id) add(nk.type === 'liquido' && rk.type === 'aria' ? 'eq' : 'eq', `Dissipatore ${nk.name} contro ${rk.name}${nk.type === 'liquido' && rk.type === 'aria' ? ': raffredda di più, ma con questa CPU un buon dissipatore ad aria basta e la pompa aggiunge rumore (conta se registri)' : ''}.`);
  if (rcs.id !== ncs.id) add(ncs.silent >= rcs.silent ? 'eq' : 'dn', `Case ${ncs.name} contro ${rcs.name}: ${ncs.rgb && !rcs.rgb ? 'ha l\'RGB che volevi' : ''}${ncs.silent < rcs.silent ? '; è meno silenzioso, e per le registrazioni conta' : ''}.`.replace(': ;', ':').replace('; è', ': è'));
  return out;
}

const cpri = (it) => (price(it, state.mode) === 0 ? 'già tua' : euro(price(it, state.mode)));

function renderCmp() {
  const rEv = evaluate(cmp.ref, state.mode, state.budget, state.uses);
  const rows = cmp.cands.map(c => ({ c, x: cmpEval(c) }));
  const sel = rows.find(r => r.c.id === cmp.sel) || rows[0];
  const chip = v => `<span class="vchip ${v.k}">${v.t}</span>`;
  const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n));

  const rank = rows.length ? `
    <div class="tbl-wrap panel flush"><table class="plain cmpt">
      <thead><tr><th>Configurazione</th><th class="r">Prezzo negozio</th><th class="r">Solo pezzi*</th><th class="r">Δ € vs tua</th><th class="r">Voto</th><th class="r">Δ voto</th><th>Verdetto</th><th></th></tr></thead>
      <tbody>
        <tr class="refrow"><th>${esc(cmp.refName)}</th><td class="r">—</td><td class="r"><b>${euro(rEv.total)}</b></td><td class="r">—</td><td class="r"><b style="color:${rEv.tier.color}">${rEv.overall}</b></td><td class="r">—</td><td><span class="vchip eq">Riferimento</span></td><td></td></tr>
        ${rows.map(({ c, x }) => `<tr class="${c.id === sel.c.id ? 'seld' : ''}" data-cmp-sel="${c.id}"><th><button class="linkbtn" data-cmp-sel="${c.id}">${esc(c.name)}</button><small>${c.win ? 'Windows ✓ ' : ''}${c.asm ? 'montato ✓' : ''}</small></th>
          <td class="r"><b>${euro(c.price)}</b></td><td class="r">${euro(x.equiv)}</td>
          <td class="r ${x.dEur > 0 ? 'over' : x.dEur < 0 ? 'ok' : ''}">${sgn(x.dEur)} €</td>
          <td class="r"><b style="color:${x.cEv.tier.color}">${x.cEv.overall}</b></td><td class="r ${x.dScore > 0 ? 'ok' : x.dScore < 0 ? 'over' : ''}">${sgn(x.dScore)}</td>
          <td>${chip(x.v)}</td><td class="r"><button class="linkbtn" data-cmp-edit="${c.id}">Modifica</button> · <button class="linkbtn" data-cmp-del="${c.id}">Elimina</button></td></tr>`).join('')}
      </tbody></table></div>
    <p class="muted small">* «Solo pezzi» = prezzo del negozio meno il valore che dai a Windows e al montaggio (impostabile qui sotto): è il numero da confrontare con i pezzi della tua build.</p>`
    : '<div class="panel"><p class="muted">Nessuna configurazione: aggiungine una qui sotto.</p></div>';

  let detail = '';
  if (sel) {
    const { c, x } = sel, cEv = x.cEv;
    const catRows = CATS.map(ct => {
      const a = getItem(ct.key, cmp.ref[ct.key]), b = getItem(ct.key, c.build[ct.key]), ar = cmpArrow(ct.key, a, b);
      return `<tr><th><span class="ic">${ct.icon}</span> ${ct.label}</th><td>${esc(a.name)}<small>${cpri(a)}</small></td><td class="ar ${ar.c}" title="${ar.t}">${ar.s}</td><td>${esc(b.name)}<small>${cpri(b)}</small></td></tr>`;
    }).join('');
    const useRows = USES.filter(u => state.uses.includes(u.key)).map(u => {
      const a = rEv.scores[u.key], b = cEv.scores[u.key], d = b - a;
      return `<div class="urow2"><div class="u-h"><span>${u.icon} ${u.label}</span><b>${a} → <span style="color:${scoreColor(b)}">${b}</span> <em class="${d > 0 ? 'ok' : d < 0 ? 'over' : ''}">${d === 0 ? '＝' : sgn(d)}</em></b></div>
        <div class="bar2"><i style="width:${a}%;background:rgba(255,255,255,.35)"></i><i style="width:${b}%;background:${scoreColor(b)};top:5px"></i></div></div>`;
    }).join('');
    const notes = cmpNotes(rEv, c).map(n => `<li class="n-${n.t}">${esc(n.x)}</li>`).join('');
    const pareri = cEv.pareri.filter(p => ['bad', 'warn', 'tip'].includes(p.tone)).slice(0, 6).map(p => `<li class="t-${p.tone}"><span class="pe">${EMOJI_TONE[p.tone]}</span><div><b>${esc(p.title)}</b><p>${esc(p.text)}</p></div></li>`).join('');
    detail = `
      <h2 id="cmp-detail">Dettaglio: ${esc(c.name)}</h2>
      <div class="vhead panel verd-${x.v.k}">
        <div class="vh-g">${gaugeSvg(cEv.overall, cEv.tier.color, cEv.tier.label)}</div>
        <div class="vh-t"><span class="vchip big ${x.v.k}">${x.v.t}</span><h3>${esc(x.v.d)}</h3>
          <p class="muted">${esc(c.note || '')}</p>
          <ul class="facts">
            <li><b>${euro(c.price)}</b><span>prezzo del negozio</span></li>
            <li><b>${sgn(x.dEur)} €</b><span>pezzi vs la tua build</span></li>
            <li><b>${sgn(x.dScore)}</b><span>punti di voto (${rEv.overall} → ${cEv.overall})</span></li>
            <li><b>${x.markup >= 0 ? '+' : '−'}${euro(Math.abs(x.markup))}</b><span>rispetto ai pezzi stimati (${euro(x.candParts)})</span></li>
          </ul></div></div>

      <div class="panel"><h3>Il prezzo, spiegato</h3><ul class="ul">
        <li>Il negozio chiede <b>${euro(c.price)}</b>. ${c.win ? `Windows incluso: lo valuto ${cmp.useWin ? euro(cmp.winVal) : '0 € (non lo conto)'}. ` : ''}${c.asm ? `Già montato: lo valuto ${cmp.useAsm ? euro(cmp.asmVal) : '0 € (non lo conto)'}.` : ''}</li>
        <li>Resta <b>${euro(x.equiv)}</b> per i soli pezzi. I pezzi di quella configurazione li stimo a <b>${euro(x.candParts)}</b>: ${Math.abs(x.markup) < 40 ? 'il prezzo è in linea' : x.markup > 0 ? `il negozio ci ricarica ${euro(x.markup)}` : `è più economico di ${euro(-x.markup)} rispetto ai pezzi singoli`}.</li>
        <li>I pezzi della tua build valgono <b>${euro(x.refParts)}</b>: la candidata ${x.dEur > 0 ? 'costa' : 'costa meno di'} ${euro(Math.abs(x.dEur))}${x.dEur > 0 ? ' in più' : ''}, a parità di condizioni.</li>
      </ul><p class="muted small">Le stime dei pezzi hanno un margine largo (la RAM pesa molto e nei PDF aveva prezzi diversi). Windows e montaggio sono valori tuoi: cambiali qui sotto.</p></div>

      <div class="vgrid">
        <div class="panel"><h3>Pezzo per pezzo</h3><div class="tbl-wrap"><table class="plain cmpd"><thead><tr><th></th><th>${esc(cmp.refName)}</th><th></th><th>${esc(c.name)}</th></tr></thead><tbody>${catRows}</tbody></table></div></div>
        <div class="panel"><h3>Voti sui tuoi usi <small class="muted">(tua → candidata)</small></h3>${useRows}
          <p class="muted small">Silenziosità: ${rEv.sil} → ${cEv.sil} · Consumo di picco: ~${Math.round(rEv.draw)} W → ~${Math.round(cEv.draw)} W</p></div>
      </div>
      ${notes ? `<div class="panel"><h3>Le differenze che contano</h3><ul class="dnotes">${notes}</ul></div>` : ''}
      ${pareri ? `<div class="panel"><h3>Cosa controllare in questa configurazione</h3><ul class="pareri">${pareri}</ul></div>` : ''}`;
  }

  const editing = cmp.edit && cmp.cands.find(c => c.id === cmp.edit);
  const base = editing ? editing.build : cmp.ref;
  const form = `
    <h2>${editing ? 'Modifica configurazione' : 'Aggiungi una configurazione trovata'}</h2>
    <div class="panel cmpform" id="cmp-form">
      <div class="nm-grid f3">
        <label class="field"><span>Nome (negozio / modello)</span><input id="cf-name" value="${esc(editing ? editing.name : '')}" placeholder="Es. Negozio X · Modello Y"></label>
        <label class="field"><span>Prezzo totale (€, spedizione inclusa)</span><input id="cf-price" type="number" min="0" step="1" value="${editing ? editing.price : ''}"></label>
        <label class="field"><span>Note (marche, garanzia…)</span><input id="cf-note" value="${esc(editing ? editing.note || '' : '')}"></label>
      </div>
      <div class="chips"><label class="chip-b sm tg"><input type="checkbox" id="cf-win" ${!editing || editing.win ? 'checked' : ''}> Windows incluso</label><label class="chip-b sm tg"><input type="checkbox" id="cf-asm" ${!editing || editing.asm ? 'checked' : ''}> Già assemblato</label></div>
      <p class="muted small">Scegli i componenti: sono preselezionati quelli della tua build, cambia solo ciò che è diverso.</p>
      <div class="nm-grid f4">${CATS.map(ct => `<label class="field"><span>${ct.icon} ${ct.label}</span><select id="cf-${ct.key}">${ITEMS[ct.key].map(it => `<option value="${it.id}" ${base[ct.key] === it.id ? 'selected' : ''}>${esc(it.name)} · ${cpri(it)}</option>`).join('')}</select></label>`).join('')}</div>
      <div class="dlg-act"><button class="btn primary" data-cmp="save">${editing ? 'Salva modifiche' : 'Aggiungi al confronto'}</button>${editing ? '<button class="btn" data-cmp="cancel">Annulla</button>' : ''}</div>
      <p id="cf-msg" class="sync-msg err" role="status"></p>
    </div>`;

  $('#view-cmp').innerHTML = `
    <div class="head"><span class="chip">Per decidere dove comprare</span><h1>Confronta</h1>
      <p class="muted">Metti a confronto le configurazioni dei negozi con la tua build: quanto cambia in prestazioni e prezzo, e se conviene. Tieni conto di Windows e del montaggio già fatto, e dei tuoi hard disk esterni.</p></div>

    <h2>La tua build di riferimento</h2>
    <div class="panel refbox">
      <div class="field"><span>Prezzi dei pezzi</span><div class="seg segw">
        <button class="${state.mode === 'A' ? 'on' : ''}" data-cmp-mode="A">27 ott · prezzi reali (RAM ~680 €)</button>
        <button class="${state.mode === 'B' ? 'on' : ''}" data-cmp-mode="B">15 ott · stime (RAM ~500 €)</button></div></div>
      <div class="ref-top"><label class="field"><span>Nome</span><input id="cmp-refname" value="${esc(cmp.refName)}"></label>
        <label class="field"><span>Carica da</span><select id="cmp-refsrc"><option value="">— scegli —</option><option value="builder">La build del Builder</option>${PRESETS.map(p => `<option value="${p.id}">${p.src === 'A' ? p.budget + ' € · ' : ''}${esc(p.title)}</option>`).join('')}</select></label></div>
      <div class="ref-list">${CATS.map(ct => { const it = getItem(ct.key, cmp.ref[ct.key]); return `<div><span>${ct.icon} ${ct.label}</span><b>${esc(it.name)}</b><em>${cpri(it)}</em></div>`; }).join('')}</div>
      <div class="ref-sum"><div><b>${euro(rEv.total)}</b><span>solo pezzi</span></div><div><b style="color:${rEv.tier.color}">${rEv.overall}</b><span>voto sui tuoi usi</span></div><div><b>${rEv.sil}</b><span>silenziosità</span></div>
        <div class="grow"><span class="muted small">Usi: ${state.uses.map(k => USES.find(u => u.key === k).short).join(', ')}${ENGINE_OPTS.ext ? ' · archivio su HDD esterni' : ''} · modificabili nel Builder.</span></div></div>
    </div>

    <h2>Quanto vale per te Windows e il montaggio?</h2>
    <div class="panel"><div class="nm-grid f4">
      <label class="field"><span>Valore di Windows 11 (€)</span><input type="number" min="0" step="10" id="cmp-win" value="${cmp.winVal}"></label>
      <label class="field"><span>Valore del montaggio (€)</span><input type="number" min="0" step="10" id="cmp-asm" value="${cmp.asmVal}"></label>
      <label class="field"><span>&nbsp;</span><label class="chip-b sm tg"><input type="checkbox" id="cmp-usewin" ${cmp.useWin ? 'checked' : ''}> Mi serve Windows</label></label>
      <label class="field"><span>&nbsp;</span><label class="chip-b sm tg"><input type="checkbox" id="cmp-useasm" ${cmp.useAsm ? 'checked' : ''}> Pagherei il montaggio</label></label></div>
      <p class="muted small">Sono stime tue: i prezzi di una licenza Windows variano molto (dalla licenza OEM scontata alla retail) e un montaggio in negozio costa in genere decine di euro. Se Windows ce l'hai già o monti da solo, togli la spunta.</p></div>

    <h2>Classifica</h2>${rank}
    ${detail}
    ${form}`;
}

/* ---------- eventi ---------- */
function cmpRerender() { cmpSave(); renderCmp(); }
document.addEventListener('click', e => {
  const t = e.target.closest('[data-cmp],[data-cmp-sel],[data-cmp-edit],[data-cmp-del],[data-cmp-mode]');
  if (!t || state.tab !== 'cmp') return;
  if (t.dataset.cmpMode) { state.mode = t.dataset.cmpMode; saveState(); renderCmp(); }
  else if (t.dataset.cmpSel) { cmp.sel = t.dataset.cmpSel; cmpRerender(); document.getElementById('cmp-detail')?.scrollIntoView({ behavior: 'smooth' }); }
  else if (t.dataset.cmpEdit) { cmp.edit = t.dataset.cmpEdit; renderCmp(); document.getElementById('cmp-form').scrollIntoView({ behavior: 'smooth' }); }
  else if (t.dataset.cmpDel) { if (confirm('Eliminare questa configurazione?')) { cmp.cands = cmp.cands.filter(c => c.id !== t.dataset.cmpDel); if (cmp.sel === t.dataset.cmpDel) cmp.sel = (cmp.cands[0] || {}).id; cmpRerender(); } }
  else if (t.dataset.cmp === 'cancel') { cmp.edit = null; renderCmp(); }
  else if (t.dataset.cmp === 'save') {
    const name = document.getElementById('cf-name').value.trim(), pr = +document.getElementById('cf-price').value;
    const msg = document.getElementById('cf-msg');
    if (!name || !(pr > 0)) { msg.textContent = 'Inserisci nome e prezzo.'; return; }
    const build = {}; CATS.forEach(ct => (build[ct.key] = document.getElementById('cf-' + ct.key).value));
    const c = { id: cmp.edit || 'c-' + Date.now().toString(36), name, price: pr, note: document.getElementById('cf-note').value.trim(), win: document.getElementById('cf-win').checked, asm: document.getElementById('cf-asm').checked, build };
    const i = cmp.cands.findIndex(x => x.id === c.id);
    if (i >= 0) cmp.cands[i] = c; else cmp.cands.push(c);
    cmp.sel = c.id; cmp.edit = null; cmpRerender();
  }
});
document.addEventListener('change', e => {
  if (state.tab !== 'cmp') return;
  const id = e.target.id;
  if (id === 'cmp-refsrc' && e.target.value) {
    cmp.ref = { ...(e.target.value === 'builder' ? state.build : PRESETS.find(p => p.id === e.target.value).build) };
    cmp.refName = e.target.value === 'builder' ? 'La build del Builder' : PRESETS.find(p => p.id === e.target.value).title;
    cmpRerender();
  } else if (id === 'cmp-win') { cmp.winVal = Math.max(0, +e.target.value || 0); cmpRerender(); }
  else if (id === 'cmp-asm') { cmp.asmVal = Math.max(0, +e.target.value || 0); cmpRerender(); }
  else if (id === 'cmp-usewin') { cmp.useWin = e.target.checked; cmpRerender(); }
  else if (id === 'cmp-useasm') { cmp.useAsm = e.target.checked; cmpRerender(); }
  else if (id === 'cmp-refname') { cmp.refName = e.target.value.trim() || 'La mia build'; cmpRerender(); }
});
