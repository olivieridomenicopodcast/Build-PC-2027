/* ============================================================
   MODULI 1: Software e licenze, Piano di ripristino, Giochi, Postazione
   ============================================================ */
const CHAT_URL = 'https://claude.ai/code/session_01LYv3ohEmMBLGoH3H874JhE';
const copyTxt = (txt, btn) => { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { if (btn) { const o = btn.textContent; btn.textContent = '✓ Copiato'; setTimeout(() => (btn.textContent = o), 1400); } }, () => alert('Copia non permessa dal browser.')); };
document.addEventListener('click', e => { const c = e.target.closest('[data-copytxt]'); if (c) copyTxt(c.dataset.copytxt, c); });

/* ===================== SOFTWARE ===================== */
const SOFT_CATS = ['Audio e produzione', 'Podcast e video', 'Sviluppo', 'Giochi e launcher', 'Utility', 'Sistema', 'Altro'];
const SOFT_PRIO = ['Essenziale', 'Utile', 'Opzionale', 'Da valutare'];
const SOFT_SEED = [
  { name: 'Pro Tools', category: 'Audio e produzione', priority: 'Essenziale', version: '', where: 'Account Avid (sito ufficiale)', url: 'https://www.avid.com/pro-tools', license: '', renew: '', portable: false, notes: 'Abbonamento Avid: indica qui la data di rinnovo. Plugin e autorizzazioni vanno reinstallati.' },
  { name: 'Godot Engine', category: 'Sviluppo', priority: 'Utile', version: '', where: 'Eseguibile portatile: dove l\'ho messo?', url: 'https://godotengine.org/download', license: '', renew: '', portable: true, notes: 'Non si installa: basta l\'eseguibile.' },
  { name: 'Microsoft OneDrive', category: 'Sistema', priority: 'Essenziale', version: '', where: 'Incluso in Windows 11', url: 'https://www.microsoft.com/it-it/microsoft-365/onedrive/download', license: '', renew: '', portable: false, notes: 'Attivare «File su richiesta». Cartelle progetti e podcast.' },
  { name: 'HWiNFO', category: 'Utility', priority: 'Utile', version: '', where: 'Sito ufficiale', url: 'https://www.hwinfo.com/', license: '', renew: '', portable: true, notes: 'Per controllare temperature e componenti.' },
  { name: 'CrystalDiskInfo', category: 'Utility', priority: 'Utile', version: '', where: 'Sito ufficiale', url: 'https://crystalmark.info/en/software/crystaldiskinfo/', license: '', renew: '', portable: true, notes: 'Salute dell\'SSD.' },
];
const softC = coll('soft', 'buildpc2027_soft', SOFT_SEED);
const SOFT_FIELDS = [
  { k: 'name', label: 'Programma', req: true }, { k: 'category', label: 'Categoria', type: 'select', options: SOFT_CATS },
  { k: 'priority', label: 'Priorità sul PC nuovo', type: 'select', options: SOFT_PRIO }, { k: 'version', label: 'Versione' },
  { k: 'where', label: 'Dove sta l\'installer o l\'eseguibile (cartella, OneDrive, disco esterno…)', type: 'textarea', rows: 2 },
  { k: 'url', label: 'Link per scaricarlo', type: 'url' }, { k: 'license', label: 'Codice / licenza', type: 'secret' },
  { k: 'renew', label: 'Rinnovo / scadenza abbonamento', type: 'date' }, { k: 'portable', label: 'Portatile (non si installa)', type: 'check' },
  { k: 'notes', label: 'Note (impostazioni, come attivarlo…)', type: 'textarea' }];
COLLS.soft = { coll: softC, fields: SOFT_FIELDS, title: 'Software', render: () => renderSoft(), defaults: () => ({ category: SOFT_CATS[0], priority: 'Da valutare' }) };
const softRenewals = () => softC.items.filter(s => s.renew && daysTo(s.renew) >= -7);
let softQ = '', softCat = '', softPrio = '';

const PS_CMD = "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*,HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*,HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object DisplayName | Select-Object DisplayName,DisplayVersion,Publisher | Sort-Object DisplayName -Unique | ConvertTo-Csv -NoTypeInformation | Set-Clipboard";
function csvLine(l) { const out = []; let cur = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (c === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (c === ',' && !q) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; }
function parseSoftList(text, hideNoise) {
  const noise = /(Visual C\+\+|\.NET|Redistributable|Runtime|Update for|Hotfix|Windows SDK|WebView2|Driver Package|Microsoft Edge|Windows Software Development|Language Pack|vs_|Intel\(R\) Management|Realtek.*Driver)/i;
  const out = [];
  text.split(/\r?\n/).forEach(l => { l = l.trim(); if (!l) return; let name, ver = '', pub = '';
    if (l.startsWith('"')) { const c = csvLine(l); name = c[0]; ver = c[1] || ''; pub = c[2] || ''; if (/^displayname$/i.test(name)) return; }
    else { const c = l.split(/\s{2,}/); name = c[0]; ver = c.length > 2 ? c[2] : ''; if (/^name$/i.test(name) || /^-+$/.test(name)) return; }
    if (!name || (hideNoise && noise.test(name))) return; out.push({ name, version: ver, notes: pub ? 'Editore: ' + pub : '' }); });
  return out;
}
async function softImport() {
  const vals = await openForm({ title: 'Importa i programmi dal vecchio PC', submit: 'Importa', fields: [
    { k: 'text', label: 'Incolla qui l\'elenco (output del comando)', type: 'textarea', rows: 7, req: true },
    { k: 'category', label: 'Categoria per i nuovi programmi', type: 'select', options: SOFT_CATS }, { k: 'hide', label: 'Nascondi runtime, aggiornamenti e driver', type: 'check' }], values: { category: 'Altro', hide: true } });
  if (!vals) return;
  const list = parseSoftList(vals.text, vals.hide); const have = new Set(softC.items.map(s => s.name.toLowerCase())); let n = 0;
  list.forEach(s => { if (have.has(s.name.toLowerCase())) return; have.add(s.name.toLowerCase()); softC.items.push({ id: uid(), name: s.name, category: vals.category, priority: 'Da valutare', version: s.version, where: '', url: '', license: '', renew: '', portable: false, notes: s.notes }); n++; });
  softC.save(); renderSoft(); alert(n ? `Importati ${n} programmi. Ora assegna priorità e percorsi a quelli che ti servono.` : 'Nessun programma nuovo da importare.');
}
function softListHtml() {
  const q = softQ.toLowerCase();
  const items = softC.items.filter(s => (!q || (s.name + ' ' + s.notes + ' ' + s.where).toLowerCase().includes(q)) && (!softCat || s.category === softCat) && (!softPrio || s.priority === softPrio))
    .sort((a, b) => SOFT_PRIO.indexOf(a.priority) - SOFT_PRIO.indexOf(b.priority) || a.name.localeCompare(b.name));
  if (!items.length) return '<p class="muted">Nessun programma con questi filtri.</p>';
  return `<div class="slist">${items.map(s => `<article class="sw p-${SOFT_PRIO.indexOf(s.priority)}"><header><b>${esc(s.name)}</b><span class="chip">${esc(s.priority)}</span>${s.portable ? '<span class="chip">portatile</span>' : ''}<span class="muted small">${esc(s.category)}${s.version ? ' · v' + esc(s.version) : ''}</span></header>
    ${s.where ? `<p><span class="muted small">📂 Dove sta:</span> ${esc(s.where)}</p>` : ''}${s.url ? `<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Scarica ↗</a></p>` : ''}
    ${s.license ? `<p><span class="muted small">🔑 Codice:</span> ${secretCell('soft', s, 'license')}</p>` : ''}${s.renew ? `<p><span class="muted small">🔁 Rinnovo:</span> ${fmtD(s.renew)} <em>(${dueLabel(s.renew)})</em></p>` : ''}${s.notes ? `<p class="small">${esc(s.notes)}</p>` : ''}${rowActs('soft', s.id)}</article>`).join('')}</div>`;
}
function renderSoft() {
  const ess = softC.items.filter(s => s.priority === 'Essenziale').length;
  $('#view-soft').innerHTML = `
    <div class="head"><span class="chip">I programmi che mi porto dietro da sempre</span><h1>Software e licenze</h1>
      <p class="muted">L'elenco di tutto quello che serve sul PC, con <b>dove sta l'installer</b>, il link, le note di attivazione e i <b>codici cifrati</b>. ${softC.items.length} programmi, ${ess} essenziali.</p></div>
    <div class="panel"><div class="dactions"><button class="btn primary" data-coll="soft" data-act="add">＋ Aggiungi</button><button class="btn" data-soft="import">📥 Importa dal vecchio PC</button><button class="btn" data-soft="export">⬇ Esporta elenco (senza codici)</button><button class="btn" data-soft="lock">${vault.key ? '🔓 Cassaforte sbloccata · blocca' : '🔒 Cassaforte bloccata'}</button></div>
      <p class="muted small">I <b>codici</b> sono cifrati con la password della cassaforte: nemmeno nel Sync (repository pubblico) sono leggibili senza. Se perdi la password, i codici non si recuperano.</p></div>
    <details class="panel"><summary><b>Come importare l'elenco dal vecchio PC</b></summary>
      <ol class="ul"><li>Sul <b>vecchio PC</b> apri PowerShell (tasto Windows, scrivi «PowerShell»).</li><li>Incolla questo comando e premi Invio (copia l'elenco negli appunti):</li></ol>
      <pre class="cmdbox">${esc(PS_CMD)}</pre><div class="dactions"><button class="btn" data-copytxt="${esc(PS_CMD)}">Copia il comando</button></div>
      <ol class="ul" start="3"><li>Torna qui, premi <b>«Importa dal vecchio PC»</b> e incolla il risultato.</li><li>In alternativa: <code>winget list</code> e incolla l'output.</li></ol></details>
    <div class="panel"><div class="nm-grid f3"><label class="field"><span>Cerca</span><input id="soft-q" value="${esc(softQ)}" placeholder="Nome, note, percorso…"></label>
      <label class="field"><span>Categoria</span><select id="soft-cat"><option value="">Tutte</option>${SOFT_CATS.map(c => `<option ${c === softCat ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Priorità</span><select id="soft-prio"><option value="">Tutte</option>${SOFT_PRIO.map(c => `<option ${c === softPrio ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div></div>
    <div id="soft-list">${softListHtml()}</div>`;
}
document.addEventListener('input', e => { if (e.target.id === 'soft-q') { softQ = e.target.value; $('#soft-list').innerHTML = softListHtml(); } });
document.addEventListener('change', e => { if (e.target.id === 'soft-cat') { softCat = e.target.value; $('#soft-list').innerHTML = softListHtml(); } if (e.target.id === 'soft-prio') { softPrio = e.target.value; $('#soft-list').innerHTML = softListHtml(); } });
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-soft]'); if (!t) return;
  if (t.dataset.soft === 'import') softImport();
  else if (t.dataset.soft === 'lock') { if (vault.key) { vault.key = null; renderSoft(); } else { await vault.ensure(); renderSoft(); } }
  else if (t.dataset.soft === 'export') { const txt = softC.items.map(s => `${s.name}${s.version ? ' v' + s.version : ''} [${s.priority}] - ${s.category}${s.where ? ' - ' + s.where : ''}${s.url ? ' - ' + s.url : ''}`).join('\n'); const b = new Blob([txt], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'software.txt'; a.click(); }
});

/* ===================== PIANO DI RIPRISTINO ===================== */
const RES_KEY = 'buildpc2027_restore';
const res = Object.assign({ checked: {}, notes: { bios: 'EXPO attivo (RAM a 6000 MHz) · Secure Boot e TPM attivi · Resizable BAR attivo se disponibile', audio: '', win: '' } }, store.get(RES_KEY, {}));
const resSave = () => store.set(RES_KEY, res);
const RES_STEPS = [
  { t: 'Prima di formattare o ripristinare', items: ['Backup dei progetti sull\'hard disk esterno e verifica su onedrive.com che tutto sia online.', 'Esportati i dati di questa app (Sync cifrato o file) e annotati i codici nella cassaforte.', 'Scollegati gli hard disk esterni durante l\'installazione (per non sbagliare disco).', 'Controllati account e password di Windows/Microsoft, Avid, Steam.'] },
  { t: 'Installare Windows', items: ['Windows 11 Pro dalla pennetta USB del negozio o dal sito Microsoft (Media Creation Tool).', 'Account Microsoft: la licenza OEM si riattiva da sola sullo stesso PC.', 'Aggiornamenti di Windows fino in fondo.'] },
  { t: 'Driver, in questo ordine', items: ['Driver del chipset AMD.', 'Driver della scheda video AMD (Adrenalin).', 'Driver audio, LAN e Wi-Fi dal sito MSI della scheda madre.', 'Verificato in Gestione dispositivi che non ci siano punti esclamativi.'] },
  { t: 'BIOS', items: ['EXPO attivo (RAM a 6000 MHz).', 'Secure Boot e TPM 2.0 attivi.', 'Resizable BAR attivo (se presente).'] },
  { t: 'Account e cloud', items: ['OneDrive con «File su richiesta»; cartelle visibili.', 'Steam e altri launcher.', 'Browser (sincronizzazione) e password manager.'] },
  { t: 'Pro Tools e audio', items: ['Driver della scheda audio.', 'Pro Tools e plugin, con le autorizzazioni.', 'Impostazioni audio (buffer, sample rate) come negli appunti.', 'Una sessione di prova aperta e riprodotta.'] },
  { t: 'Verifica finale', items: ['Temperature e rumori normali (HWiNFO).', 'Test di un gioco pesante di mezz\'ora.', 'Backup fatto sul nuovo sistema.'] },
];
function renderRestore() {
  const ess = softC.items.filter(s => s.priority === 'Essenziale');
  const sect = RES_STEPS.map((s, si) => `<details class="dsec" open><summary><span class="dn">${si + 1}</span><span class="dt">${s.t}</span></summary><div class="dbody"><ul class="chk">${s.items.map((t, i) => { const id = `r${si}.${i}`; return `<li><label><input type="checkbox" data-res="${id}" ${res.checked[id] ? 'checked' : ''}><span class="box" aria-hidden="true"></span><span class="tx">${esc(t)}</span></label></li>`; }).join('')}</ul></div></details>`).join('');
  $('#view-restore').innerHTML = `
    <div class="head"><span class="chip">Se il PC si rompe o lo formatto</span><h1>Piano di ripristino</h1>
      <p class="muted">Una guida passo passo, con l'elenco dei software essenziali pronto dalla scheda Software, e i tuoi appunti sulle impostazioni.</p></div>
    <div class="panel dactions"><button class="btn" data-res-act="reset">↺ Azzera le spunte per un nuovo ripristino</button></div>
    <div class="dsecs">${sect}
      <details class="dsec" open><summary><span class="dn">★</span><span class="dt">I software essenziali (${ess.length})</span></summary><div class="dbody">${ess.length ? `<ul class="chk">${ess.map(s => { const id = 'rs.' + s.id; return `<li><label><input type="checkbox" data-res="${id}" ${res.checked[id] ? 'checked' : ''}><span class="box" aria-hidden="true"></span><span class="tx"><b>${esc(s.name)}</b>${s.where ? ' · ' + esc(s.where) : ''}${s.url ? ` · <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">scarica ↗</a>` : ''}</span></label></li>`; }).join('')}</ul>` : '<p class="muted">Nessun software «Essenziale»: assegna la priorità nella scheda Software.</p>'}</div></details></div>
    <h2>Le mie impostazioni da ricordare</h2>
    <div class="panel"><label class="field"><span>BIOS</span><textarea data-resnote="bios" rows="3">${esc(res.notes.bios)}</textarea></label>
      <label class="field"><span>Pro Tools e scheda audio (buffer, sample rate, ingressi…)</span><textarea data-resnote="audio" rows="3" placeholder="Scrivi qui le impostazioni che usi">${esc(res.notes.audio)}</textarea></label>
      <label class="field"><span>Windows (piano energetico, notifiche, scorciatoie…)</span><textarea data-resnote="win" rows="3" placeholder="Scrivi qui">${esc(res.notes.win)}</textarea></label></div>`;
}
document.addEventListener('change', e => { const id = e.target.dataset && e.target.dataset.res; if (id) { if (e.target.checked) res.checked[id] = true; else delete res.checked[id]; resSave(); } });
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.resnote; if (k) { res.notes[k] = e.target.value; resSave(); } });
document.addEventListener('click', e => { if (e.target.closest('[data-res-act=reset]') && confirm('Azzerare le spunte del ripristino?')) { res.checked = {}; resSave(); renderRestore(); } });

/* ===================== GIOCHI ===================== */
const GAMES_SEED = [
  { name: 'Ace Combat 8: Wings of Theve', old: '🔴 Richiede ray tracing hardware', nw: '✅ Full HD, dettagli medio-alti con FSR', state: 'Da giocare', notes: 'Requisiti consigliati: RTX 3070 / RX 6800, 32 GB RAM, 125 GB su SSD. Denuvo, Windows 11.' },
  { name: 'Call of Duty: Modern Warfare 4', old: '🟡 Al minimo, RAM al limite', nw: '✅ Dettagli alti', state: 'Da giocare', notes: 'Serve Secure Boot + TPM 2.0. Consigliati: Ryzen 5 3600, RX 6600 XT, 16 GB.' },
  { name: 'Battlefield 6', old: '🟡/🔴 Sotto il minimo', nw: '✅', state: 'Da giocare', notes: 'Secure Boot obbligatorio. Minimo: RTX 2060 / RX 5600 XT, 16 GB RAM.' },
  { name: 'Valorant', old: '✅', nw: '✅', state: 'In corso', notes: 'Anti-cheat: TPM 2.0 e Secure Boot su Windows 11.' },
  { name: 'Euro Truck Simulator 2', old: '✅', nw: '✅', state: 'In corso', notes: '' },
  { name: 'Rocksmith', old: '✅', nw: '✅', state: 'In corso', notes: 'Conta la latenza audio, non la scheda video.' },
  { name: 'Clone Hero', old: '✅', nw: '✅', state: 'In corso', notes: '' },
  { name: 'Minecraft', old: '✅ (🟡 con shader pesanti)', nw: '✅', state: 'In corso', notes: '' },
  { name: 'Starfield', old: '🟡 Giocato al minimo', nw: '✅ Full HD, dettagli medio-alti', state: 'Finito', notes: 'Pesa molto sulla CPU.' },
  { name: 'Rustler (Grand Theft Horse)', old: '✅', nw: '✅', state: 'In corso', notes: '' },
  { name: 'Cyberpunk 2077', old: '🟡 Dettagli bassi-medi', nw: '✅ alti · 🟡 con ray tracing', state: 'Da giocare', notes: 'Path tracing: no, è il gioco più pesante in assoluto.' },
  { name: 'Alan Wake 2', old: '🔴', nw: '✅ Full HD, medi-alti con FSR (🟡 con ray tracing)', state: 'Da giocare', notes: 'Consigliati: RTX 3070 / RX 6700 XT per Full HD 60 fps medio.' },
  { name: 'AION 2', old: '🟡 Sopra i minimi, sotto i consigliati', nw: '✅', state: 'In corso', notes: 'Consigliati: Ryzen 7 3700X, 16 GB, RTX 2070 8 GB.' },
  { name: 'Palworld', old: '🟡 Finito al minimo', nw: '✅', state: 'Finito', notes: 'Minimo 16 GB di RAM, consigliati 32 GB.' },
  { name: 'Hogwarts Legacy', old: '🟡 Finito, ma con molto lag', nw: '✅ Full HD, dettagli alti', state: 'Finito', notes: '' },
  { name: 'Arc Raiders', old: '🟡 Lag', nw: '✅ Full HD, dettagli alti', state: 'Da giocare', notes: '' },
];
const gamesC = coll('games', 'buildpc2027_games', GAMES_SEED);
COLLS.games = { coll: gamesC, title: 'Gioco', render: () => renderGiochi(), defaults: () => ({ state: 'Da giocare' }), fields: [
  { k: 'name', label: 'Gioco', req: true }, { k: 'old', label: 'Sul vecchio PC' }, { k: 'nw', label: 'Sul nuovo PC (VS5)' },
  { k: 'state', label: 'Stato', type: 'select', options: ['Da giocare', 'In corso', 'Finito', 'Non mi interessa'] }, { k: 'notes', label: 'Requisiti e note', type: 'textarea' }] };
let gamesQ = '';
function gamesListHtml() {
  const q = gamesQ.toLowerCase();
  return gamesC.items.filter(g => !q || g.name.toLowerCase().includes(q)).map(g => `<article class="gm"><header><b>${esc(g.name)}</b><span class="chip">${esc(g.state)}</span></header>
    <div class="gcmp"><div><small>Vecchio PC</small><span>${esc(g.old)}</span></div><div><small>Nuovo PC (VS5)</small><span>${esc(g.nw)}</span></div></div>${g.notes ? `<p class="small muted">${esc(g.notes)}</p>` : ''}${rowActs('games', g.id)}</article>`).join('') || '<p class="muted">Nessun gioco.</p>';
}
function renderGiochi() {
  const prompt = 'Aggiungi [NOME DEL GIOCO] alla web app: cerca i requisiti ufficiali e dimmi come gira sul vecchio PC (Ryzen 5 3600, GTX 1660 Super, 8 GB) e sul nuovo (Gladio VS5: Ryzen 5 7500X3D, RX 9060 XT 16 GB, 32 GB).';
  $('#view-giochi').innerHTML = `
    <div class="head"><span class="chip">${gamesC.items.length} giochi</span><h1>Giochi</h1><p class="muted">Come girano sul vecchio PC e sul nuovo. Stime dai requisiti ufficiali e dalla mia esperienza, non benchmark.</p></div>
    <div class="panel gchat"><h3>🤖 Vuoi aggiungere un gioco?</h3>
      <p>Chiedilo a Claude nella chat: cerca i requisiti, ti dice come gira sui due PC e lo aggiunge alla web app.</p>
      <div class="dactions"><a class="btn primary" href="${CHAT_URL}" target="_blank" rel="noopener noreferrer">Apri la chat ↗</a><button class="btn" data-copytxt="${esc(prompt)}">Copia il messaggio da incollare</button><button class="btn" data-coll="games" data-act="add">＋ Aggiungi a mano</button></div>
      <p class="muted small">Messaggio proposto: «${esc(prompt)}»</p></div>
    <div class="panel"><label class="field"><span>Cerca un gioco</span><input id="games-q" value="${esc(gamesQ)}" placeholder="Nome"></label></div>
    <div id="games-list" class="glist">${gamesListHtml()}</div>`;
}
document.addEventListener('input', e => { if (e.target.id === 'games-q') { gamesQ = e.target.value; $('#games-list').innerHTML = gamesListHtml(); } });

/* ===================== POSTAZIONE ===================== */
const POST_SEED = [
  { name: 'Monitor MSI Optix G27C5 (1)', type: 'Monitor', model: '27" Full HD, curvo', purchased: '', warrantyMonths: '', notes: '' },
  { name: 'Monitor MSI Optix G27C5 (2)', type: 'Monitor', model: '27" Full HD, curvo', purchased: '', warrantyMonths: '', notes: '' },
  { name: 'Powerline TP-Link AV600', type: 'Rete', model: 'Collega i due PC via Ethernet', purchased: '', warrantyMonths: '', notes: 'Vedi la scheda Dual PC.' },
  { name: 'PlayStation 5', type: 'Console', model: '', purchased: '2021-02-01', warrantyMonths: '', notes: 'Per i giochi tripla A.' },
];
const postC = coll('post', 'buildpc2027_post', POST_SEED);
COLLS.post = { coll: postC, title: 'Dispositivo', render: () => renderPost(), fields: [
  { k: 'name', label: 'Dispositivo', req: true }, { k: 'type', label: 'Tipo', type: 'select', options: ['Monitor', 'Scheda audio', 'Microfono', 'Tastiera e mouse', 'Cuffie', 'Disco esterno', 'Rete', 'Console', 'Altro'] },
  { k: 'model', label: 'Marca e modello' }, { k: 'purchased', label: 'Data d\'acquisto', type: 'date' }, { k: 'warrantyMonths', label: 'Garanzia (mesi)', type: 'number' }, { k: 'notes', label: 'Note', type: 'textarea' }] };
function renderPost() {
  $('#view-post').innerHTML = `<div class="head"><span class="chip">${postC.items.length} dispositivi</span><h1>Postazione</h1><p class="muted">Tutto quello che sta intorno al PC: monitor, audio, rete, dischi esterni, console. Con data d'acquisto e scadenza della garanzia.</p></div>
    <div class="panel dactions"><button class="btn primary" data-coll="post" data-act="add">＋ Aggiungi dispositivo</button></div>
    <div class="glist">${postC.items.map(p => { const end = p.purchased && +p.warrantyMonths ? addMonthsISO(p.purchased, +p.warrantyMonths) : ''; return `<article class="gm"><header><b>${esc(p.name)}</b><span class="chip">${esc(p.type)}</span></header>${p.model ? `<p>${esc(p.model)}</p>` : ''}<p class="small muted">${p.purchased ? 'Acquistato il ' + fmtD(p.purchased) : 'Data d\'acquisto non indicata'}${end ? ` · garanzia fino al ${fmtD(end)} (${dueLabel(end)})` : ''}</p>${p.notes ? `<p class="small">${esc(p.notes)}</p>` : ''}${rowActs('post', p.id)}</article>`; }).join('')}</div>`;
}
