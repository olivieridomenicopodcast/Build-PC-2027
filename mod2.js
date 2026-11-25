/* ============================================================
   MODULI 2: Garanzie e assistenza, Manutenzione, Diario, Diagnosi, Manuale e link
   ============================================================ */

/* ===================== DIARIO ===================== */
const LOG_KINDS = ['Acquisto', 'Aggiornamento', 'Manutenzione', 'Modifica', 'Problema', 'Riparazione', 'Nota'];
const logC = coll('log', 'buildpc2027_log', [{ date: '2026-11-25', kind: 'Acquisto', title: 'Ordinato il Gladio VS5 da PJ Digitalstore', details: 'Pagamento in 3 rate con Scalapay.' }]);
COLLS.log = { coll: logC, title: 'Diario', render: () => renderDiario(), defaults: () => ({ date: todayISO(), kind: 'Nota' }), fields: [
  { k: 'date', label: 'Data', type: 'date', req: true }, { k: 'kind', label: 'Tipo', type: 'select', options: LOG_KINDS }, { k: 'title', label: 'Titolo', req: true }, { k: 'details', label: 'Dettagli', type: 'textarea', rows: 4 }] };
const logAdd = (kind, title, details = '') => { logC.items.push({ id: uid(), date: todayISO(), kind, title, details }); logC.save(); };
let logKind = '';
function renderDiario() {
  const items = logC.items.filter(x => !logKind || x.kind === logKind).slice().sort((a, b) => b.date.localeCompare(a.date));
  $('#view-diario').innerHTML = `<div class="head"><span class="chip">${logC.items.length} voci</span><h1>Diario degli interventi</h1><p class="muted">Cosa è successo al PC nel tempo: aggiornamenti, problemi, riparazioni, modifiche. Le manutenzioni «fatte» si scrivono qui da sole.</p></div>
    <div class="panel"><div class="dactions"><button class="btn primary" data-coll="log" data-act="add">＋ Nuova voce</button></div>
      <label class="field"><span>Filtra per tipo</span><select id="log-kind"><option value="">Tutti</option>${LOG_KINDS.map(k => `<option ${k === logKind ? 'selected' : ''}>${k}</option>`).join('')}</select></label></div>
    <ul class="tl">${items.map(x => `<li class="k-${x.kind}"><span class="td">${fmtD(x.date)}</span><div><b>${esc(x.title)}</b> <span class="chip">${esc(x.kind)}</span>${x.details ? `<p class="small">${esc(x.details)}</p>` : ''}${rowActs('log', x.id)}</div></li>`).join('') || '<li class="muted">Ancora niente.</li>'}</ul>`;
}
document.addEventListener('change', e => { if (e.target.id === 'log-kind') { logKind = e.target.value; renderDiario(); } });

/* ===================== MANUTENZIONE ===================== */
const manC = coll('man', 'buildpc2027_man', [
  { title: 'Pulizia della polvere (filtri e ventole)', months: 6, last: '', notes: 'Con aria compressa o pennello; PC spento e scollegato.' },
  { title: 'Controllo della salute dell\'SSD (CrystalDiskInfo)', months: 3, last: '', notes: 'Deve risultare «Buono».' },
  { title: 'Aggiornamento dei driver della scheda video', months: 3, last: '', notes: 'Dal sito AMD (Adrenalin).' },
  { title: 'Controllo aggiornamenti del BIOS', months: 6, last: '', notes: 'Solo se risolvono problemi: aggiornare il BIOS ha dei rischi.' },
  { title: 'Controllo delle temperature sotto carico (HWiNFO)', months: 3, last: '', notes: 'CPU di solito sotto ~85 °C nei giochi.' },
  { title: 'Controllo ventole e pompa dell\'AIO (rumori)', months: 6, last: '', notes: '' },
  { title: 'Backup completo sul disco esterno', months: 1, last: '', notes: 'Oltre a OneDrive.' },
  { title: 'Salvataggio dei dati di questa app (Sync cifrato)', months: 1, last: '', notes: '' },
]);
COLLS.man = { coll: manC, title: 'Manutenzione', render: () => renderMan(), defaults: () => ({ months: 3 }), fields: [
  { k: 'title', label: 'Cosa fare', req: true }, { k: 'months', label: 'Ogni quanti mesi', type: 'number', req: true }, { k: 'last', label: 'Ultima volta', type: 'date' }, { k: 'notes', label: 'Note', type: 'textarea' }] };
const manNext = m => addMonthsISO(m.last || pc.purchased, +m.months || 1);
const manDue = () => manC.items.map(m => ({ ...m, next: manNext(m) })).filter(m => daysTo(m.next) <= 45);
function renderMan() {
  const items = manC.items.map(m => ({ ...m, next: manNext(m) })).sort((a, b) => a.next.localeCompare(b.next));
  $('#view-man').innerHTML = `<div class="head"><span class="chip">${manDue().length} in scadenza</span><h1>Manutenzione</h1><p class="muted">Cose da fare ogni tanto per tenere il PC in salute. Premi «Fatto oggi» e la prossima scadenza si sposta da sola (e la voce finisce nel Diario).</p></div>
    <div class="panel dactions"><button class="btn primary" data-coll="man" data-act="add">＋ Nuova attività</button></div>
    <div class="glist">${items.map(m => { const d = daysTo(m.next), cls = d < 0 ? 'bad' : d <= 30 ? 'warn' : 'good'; return `<article class="gm"><header><b>${esc(m.title)}</b><span class="vchip ${cls}">${d < 0 ? 'in ritardo' : d <= 30 ? 'in arrivo' : 'ok'}</span></header>
      <p class="small">Ogni ${m.months} ${+m.months === 1 ? 'mese' : 'mesi'} · ultima volta: ${m.last ? fmtD(m.last) : '<i class="muted">mai (parte dall\'acquisto)</i>'} · prossima: <b>${fmtD(m.next)}</b> (${dueLabel(m.next)})</p>${m.notes ? `<p class="small muted">${esc(m.notes)}</p>` : ''}
      <div class="dactions"><button class="btn" data-man-done="${m.id}">✓ Fatto oggi</button></div>${rowActs('man', m.id)}</article>`; }).join('')}</div>`;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-man-done]'); if (!b) return; const m = manC.items.find(x => x.id === b.dataset.manDone); if (!m) return; m.last = todayISO(); manC.save(); logAdd('Manutenzione', m.title, 'Segnata come fatta dalla scheda Manutenzione.'); renderMan(); });

/* ===================== GARANZIE E ASSISTENZA ===================== */
const warrC = coll('warr', 'buildpc2027_warr', [
  { item: 'Garanzia legale sul PC (24 mesi)', who: 'PJ Digitalstore', start: '', months: 24, days: 0, notes: 'Parte dalla data di consegna (campo nella Checklist). Vale per il consumatore.' },
  { item: 'Diritto di recesso (14 giorni)', who: 'PJ Digitalstore', start: '', months: 0, days: 14, notes: 'Dalla consegna, da privato. Prova bene il PC prima.' },
]);
COLLS.warr = { coll: warrC, title: 'Garanzia', render: () => renderDocs(), fields: [
  { k: 'item', label: 'Cosa copre', req: true }, { k: 'who', label: 'Chi risponde (negozio o produttore)' }, { k: 'start', label: 'Dal (vuoto = data di consegna)', type: 'date' },
  { k: 'months', label: 'Mesi', type: 'number' }, { k: 'days', label: 'Giorni', type: 'number' }, { k: 'notes', label: 'Note', type: 'textarea' }] };
const docsC = coll('docs', 'buildpc2027_docs', [
  { title: 'Fattura o ricevuta dell\'ordine', where: '', url: '', notes: 'Chiedila da privato, intestata a me.' },
  { title: 'Conferma dell\'ordine e conferma della configurazione (chat con il negozio)', where: '', url: '', notes: 'Screenshot della chat WhatsApp con PJ Digitalstore.' },
  { title: 'Piano delle rate Scalapay', where: 'App Scalapay', url: '', notes: '' },
  { title: 'Foto e video dell\'apertura dello scatolone', where: '', url: '', notes: 'Da conservare almeno per tutto il periodo di garanzia.' },
  { title: 'Contatto del negozio (WhatsApp, email, orari)', where: '', url: 'https://www.pjdigitalstore.com/', notes: 'Rispondono in pochi minuti su WhatsApp.' },
]);
COLLS.docs = { coll: docsC, title: 'Documento', render: () => renderDocs(), fields: [
  { k: 'title', label: 'Documento', req: true }, { k: 'where', label: 'Dove si trova (OneDrive, email, cartella…)' }, { k: 'url', label: 'Link', type: 'url' }, { k: 'notes', label: 'Note', type: 'textarea' }] };
const warrEnd = w => { const s = w.start || chk.delivered; return s ? addDaysISO(addMonthsISO(s, +w.months || 0), +w.days || 0) : ''; };
const ASSIST_TYPES = ['Non si accende', 'Schermo nero', 'Si blocca o si riavvia', 'Rumori strani', 'Temperature alte', 'Componente rotto o difettoso', 'Problema di conformità (pezzo diverso dall\'ordine)', 'Altro'];
function assistMsg(v) {
  const dl = chk.delivered ? fmtD(chk.delivered) : 'da indicare';
  return `Buongiorno, vi scrivo per un problema con il mio PC ${pc.name}.\n\nOrdine n° ${pc.orderNo || '[numero ordine]'} · acquistato il ${fmtD(pc.purchased)} · consegnato il ${dl}.\n\nProblema: ${v.type}.\n${v.desc ? v.desc + '\n' : ''}${v.when ? `Da quando: ${v.when}.\n` : ''}${v.tried ? `Cosa ho già provato: ${v.tried}.\n` : ''}\nConfigurazione: ${PC_PARTS.filter(p => p.cat !== 'os').map(p => p.label + ' ' + p.name).join('; ')}.\n${v.media ? 'Allego foto e video del problema.\n' : ''}\nVorrei sapere come procedere (riparazione o sostituzione, tempi e spedizione). Grazie.`;
}
function renderDocs() {
  $('#view-docs').innerHTML = `<div class="head"><span class="chip">Per non perdere niente</span><h1>Garanzie e assistenza</h1><p class="muted">Quanto durano le garanzie, dove sono i documenti e un generatore del messaggio da mandare al negozio.</p></div>
    <h2>Garanzie e scadenze</h2><div class="panel dactions"><button class="btn primary" data-coll="warr" data-act="add">＋ Aggiungi garanzia</button></div>
    <div class="glist">${warrC.items.map(w => { const end = warrEnd(w); return `<article class="gm"><header><b>${esc(w.item)}</b>${end ? `<span class="vchip ${daysTo(end) < 0 ? 'bad' : daysTo(end) < 60 ? 'warn' : 'good'}">${dueLabel(end)}</span>` : '<span class="vchip eq">data da inserire</span>'}</header>
      <p class="small">${esc(w.who || '')}${end ? ` · fino al <b>${fmtD(end)}</b>` : ' · inserisci la data di consegna nella Checklist'}</p>${w.notes ? `<p class="small muted">${esc(w.notes)}</p>` : ''}${rowActs('warr', w.id)}</article>`; }).join('')}</div>
    <h2>Documenti</h2><div class="panel dactions"><button class="btn primary" data-coll="docs" data-act="add">＋ Aggiungi documento</button></div>
    <div class="glist">${docsC.items.map(d => `<article class="gm"><header><b>${esc(d.title)}</b></header><p class="small">${d.where ? '📂 ' + esc(d.where) : '<i class="muted">Dove si trova: da indicare</i>'}${d.url ? ` · <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">apri ↗</a>` : ''}</p>${d.notes ? `<p class="small muted">${esc(d.notes)}</p>` : ''}${rowActs('docs', d.id)}</article>`).join('')}</div>
    <h2>Genera il messaggio di assistenza</h2>
    <div class="panel"><div class="nm-grid f3"><label class="field"><span>Tipo di problema</span><select id="as-type">${ASSIST_TYPES.map(t => `<option>${esc(t)}</option>`).join('')}</select></label>
      <label class="field"><span>Da quando</span><input id="as-when" placeholder="Es. da ieri sera"></label><label class="field"><span>&nbsp;</span><label class="chip-b sm tg"><input type="checkbox" id="as-media" checked> Allego foto e video</label></label></div>
      <label class="field"><span>Cosa succede (descrivilo bene)</span><textarea id="as-desc" rows="3"></textarea></label><label class="field"><span>Cosa ho già provato</span><textarea id="as-tried" rows="2"></textarea></label>
      <div class="dactions"><button class="btn primary" data-as="gen">Genera il messaggio</button></div><pre id="as-out" class="cmdbox" hidden></pre><div class="dactions"><button class="btn" id="as-copy" data-copytxt="" hidden>Copia il messaggio</button></div>
      <p class="muted small">Prima di toccare l'hardware, scrivi al negozio (c'è il bollino di garanzia). Non salvo nulla di quello che scrivi qui.</p></div>`;
}
document.addEventListener('click', e => { if (!e.target.closest('[data-as=gen]')) return;
  const m = assistMsg({ type: $('#as-type').value, desc: $('#as-desc').value.trim(), when: $('#as-when').value.trim(), tried: $('#as-tried').value.trim(), media: $('#as-media').checked });
  const o = $('#as-out'); o.textContent = m; o.hidden = false; const b = $('#as-copy'); b.dataset.copytxt = m; b.hidden = false; });

/* ===================== DIAGNOSI ===================== */
const DIAG = [
  ['Il PC non si accende', ['Controlla il cavo di alimentazione e l\'interruttore dietro l\'alimentatore (deve essere su «I»), poi prova un\'altra presa.', 'Controlla che il cavo del pulsante del case e i cavi dell\'alimentatore alla scheda madre siano ben inseriti.', 'Riposiziona le barrette di RAM (spegni e scollega prima).', 'Azzera il BIOS: scollega il PC e togli la pila a bottone per qualche minuto, poi rimettila.', 'Se non cambia nulla: scrivi al negozio con foto e video (non smontare altro: c\'è il bollino).']],
  ['Si accende ma lo schermo resta nero', ['Il monitor va collegato alla scheda video (le porte nella parte bassa), non alla scheda madre.', 'Prova un altro cavo o un\'altra porta della scheda video.', 'Controlla i cavi di alimentazione della scheda video e che sia ben inserita.', 'Prova con una sola barretta di RAM, poi con l\'altra.', 'Azzera il BIOS (pila a bottone).']],
  ['Il BIOS non parte o l\'avvio è lunghissimo', ['Con la RAM DDR5, dopo un cambio di impostazioni (EXPO, BIOS) il primo avvio può durare parecchi minuti per l\'addestramento della memoria: aspetta, di solito, fino a 5 minuti.', 'Se resta bloccato: spegni a forza, scollega, azzera il BIOS (pila a bottone) e riprova.', 'Prova ad avviare con una sola barretta di RAM.', 'Se capita spesso: annota quando succede (dopo EXPO? dopo un aggiornamento?) e scrivi al negozio.']],
  ['Windows non si spegne o si blocca allo spegnimento', ['Disattiva l\'«Avvio rapido»: Pannello di controllo → Opzioni risparmio energia → Specifica cosa fa il pulsante di accensione.', 'Aggiorna driver del chipset AMD e della scheda video.', 'Aggiorna Windows e riavvia.', 'Se succede solo con un programma, chiudilo prima di spegnere.']],
  ['Lag o scatti nei giochi', ['Controlla di aver installato i driver AMD (Adrenalin) e che i monitor siano sulla scheda video.', 'Nel BIOS: EXPO attivo (6000 MHz) e Resizable BAR attivo, se presente.', 'Piano energetico di Windows su «Prestazioni elevate» (o equilibrato).', 'Guarda le temperature con HWiNFO: oltre ~90 °C costanti la CPU rallenta.', 'Installa il gioco sull\'SSD, non su un disco esterno meccanico.', 'Abbassa le texture se la memoria della scheda video (16 GB) è piena, e attiva FSR.']],
  ['Temperature alte', ['CPU: nei giochi di solito sotto ~85 °C. Costantemente sopra ~90 °C: controlla che la pompa dell\'AIO giri (non sia ferma) e che le ventole del radiatore girino.', 'Verifica il verso delle ventole (aria in ingresso davanti/di lato, in uscita sopra/dietro, secondo come è montato) e che non ci sia polvere.', 'Scheda video: controlla che le ventole partano sotto carico.', 'Se il problema c\'è dal primo giorno, scrivi al negozio: può essere un montaggio del dissipatore da rivedere.']],
  ['Rumori strani o ventole rumorose', ['Distingui l\'origine: ventole, pompa dell\'AIO (gorgoglio), scheda video (sibilo elettrico), HDD.', 'Imposta la curva delle ventole nel BIOS su un profilo più dolce.', 'Il gorgoglio della pompa può essere aria nel circuito: segnalalo al negozio.', 'Per registrare: più lontano dal microfono e curva ventole lenta.']],
  ['Scricchiolii o latenza in Pro Tools', ['Aumenta il buffer (256 o 512) nelle impostazioni dell\'hardware audio.', 'Usa il driver ASIO dell\'interfaccia e una porta USB posteriore, senza hub.', 'Disattiva il risparmio energetico USB («sospensione selettiva») e usa un piano energetico a prestazioni elevate.', 'Chiudi i programmi in background e guarda il carico della CPU in Pro Tools (Finestra → System Usage).', 'Prova a disattivare i plugin più pesanti.']],
  ['La RAM non va a 6000 MHz', ['Nel BIOS attiva il profilo EXPO (a volte si chiama A-XMP o DOCP, dipende dalla scheda).', 'Verifica con CPU-Z (scheda Memory/SPD) o HWiNFO la frequenza reale.', 'Se è instabile (crash): prova una frequenza più bassa o aggiorna il BIOS.']],
  ['Secure Boot o TPM non attivi (giochi online)', ['Nel BIOS: Secure Boot attivo e TPM (fTPM) attivo.', 'In Windows: msinfo32 → «Stato Avvio protetto» deve essere «Attivato».', 'Se non si attiva: il disco deve essere GPT e la modalità UEFI (non Legacy).']],
  ['Il gioco va piano: usa la scheda video giusta?', ['Monitor sulla scheda video, non sulla scheda madre.', 'Impostazioni di Windows → Schermo → Grafica: assegna il gioco alla scheda ad alte prestazioni.', 'Verifica in HWiNFO che la scheda sia in uso (carico alto).']],
  ['SSD lento o quasi pieno', ['Lascia libero almeno il 10-15%: sposta giochi o file grossi su un disco esterno.', 'Controlla la salute con CrystalDiskInfo.', 'Windows esegue da solo il TRIM: non serve intervenire.']],
  ['Rete lenta con il powerline', ['Collega i PC via Ethernet, non Wi-Fi, e gli adattatori direttamente a muro (niente ciabatte).', 'Prova un altro cavo e un\'altra presa.', 'Misura con un file da 1-5 GB (calcolatore nella scheda Dual PC).']],
  ['Quando scrivere al negozio e cosa preparare', ['Scrivi prima di aprire o toccare l\'hardware.', 'Prepara: numero d\'ordine, data di consegna, foto e video, descrizione, cosa hai già provato.', 'Usa il generatore di messaggio nella scheda «Garanzie e assistenza».', 'Entro 14 giorni dalla consegna valuta anche il recesso.']],
];
function renderDiag() {
  $('#view-diag').innerHTML = `<div class="head"><span class="chip">Cosa fare se…</span><h1>Diagnosi dei problemi</h1><p class="muted">Guida rapida per i problemi più comuni, in ordine di prove da fare. Valida in generale: i dettagli (nomi dei menu del BIOS) cambiano da scheda a scheda.</p></div>
    <div class="panel"><label class="field"><span>Cerca nei problemi</span><input id="diag-q" placeholder="Es. schermo nero, rumore, BIOS"></label></div>
    <div class="diag" id="diag-list">${DIAG.map((d, i) => `<details data-t="${esc(d[0].toLowerCase())}"><summary>${esc(d[0])}</summary><ol>${d[1].map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>`).join('')}</div>
    <div class="panel dactions"><button class="btn" data-tab="docs">Genera il messaggio per il negozio →</button></div>`;
}
document.addEventListener('input', e => { if (e.target.id === 'diag-q') { const q = e.target.value.toLowerCase(); document.querySelectorAll('#diag-list details').forEach(d => (d.hidden = q && !(d.dataset.t + ' ' + d.textContent.toLowerCase()).includes(q))); } });

/* ===================== MANUALE E LINK UTILI ===================== */
const manualC = coll('manual', 'buildpc2027_manual', [
  { title: 'Entrare nel BIOS', text: 'All\'avvio premi ripetutamente il tasto Canc (Del), come su molte schede MSI. Da verificare sul PC reale.' },
  { title: 'Attivare EXPO (RAM a 6000 MHz)', text: 'Nel BIOS, nelle impostazioni di overclock/memoria, abilita il profilo EXPO (a volte chiamato A-XMP). Salva ed esci; il primo riavvio può essere lungo.' },
  { title: 'Secure Boot e TPM', text: 'Nel BIOS (sezione Sicurezza/Avvio): Secure Boot attivo e fTPM/TPM attivo. Servono a Battlefield 6, Modern Warfare 4 e Valorant.' },
  { title: 'Dove collegare i monitor', text: 'Alle porte della scheda video (parte bassa), mai a quelle della scheda madre.' },
  { title: 'Il case Cougar FV150', text: 'Doppia camera: alimentatore e cavi stanno nella camera posteriore; il vetro è panoramico. Pulizia: filtri antipolvere (da verificare dove sono).' },
  { title: 'Luci RGB', text: 'Da scrivere: come cambio colore e effetti delle ventole (pulsante del case, software o scheda madre).' },
  { title: 'Porte sul pannello frontale', text: 'Da scrivere: quali porte USB/USB-C/audio ci sono e dove.' },
]);
COLLS.manual = { coll: manualC, title: 'Voce del manuale', render: () => renderManual(), fields: [{ k: 'title', label: 'Titolo', req: true }, { k: 'text', label: 'Testo', type: 'textarea', rows: 4 }] };
const linksC = coll('links', 'buildpc2027_links', [
  { name: 'Driver AMD (Adrenalin e chipset)', cat: 'Driver', url: 'https://www.amd.com/en/support/download/drivers.html', version: '', checked: '' },
  { name: 'MSI: supporto scheda madre (BIOS, driver)', cat: 'Driver', url: 'https://www.msi.com/support', version: '', checked: '' },
  { name: 'Gigabyte: supporto scheda video', cat: 'Driver', url: 'https://www.gigabyte.com/Support', version: '', checked: '' },
  { name: 'Kingston: supporto SSD', cat: 'Driver', url: 'https://www.kingston.com/it/support', version: '', checked: '' },
  { name: 'Patriot Memory', cat: 'Componenti', url: 'https://www.patriotmemory.com/', version: '', checked: '' },
  { name: 'Cougar (case)', cat: 'Componenti', url: 'https://www.cougargaming.com/', version: '', checked: '' },
  { name: 'Windows 11: scarica o ripara', cat: 'Windows', url: 'https://www.microsoft.com/it-it/software-download/windows11', version: '', checked: '' },
  { name: 'HWiNFO (temperature e componenti)', cat: 'Strumenti', url: 'https://www.hwinfo.com/', version: '', checked: '' },
  { name: 'CPU-Z', cat: 'Strumenti', url: 'https://www.cpuid.com/softwares/cpu-z.html', version: '', checked: '' },
  { name: 'CrystalDiskInfo (salute SSD)', cat: 'Strumenti', url: 'https://crystalmark.info/en/software/crystaldiskinfo/', version: '', checked: '' },
  { name: 'MemTest86 (test RAM)', cat: 'Strumenti', url: 'https://www.memtest86.com/', version: '', checked: '' },
  { name: 'Pro Tools (Avid)', cat: 'Audio', url: 'https://www.avid.com/pro-tools', version: '', checked: '' },
  { name: 'PJ Digitalstore', cat: 'Negozio', url: 'https://www.pjdigitalstore.com/', version: '', checked: '' },
]);
COLLS.links = { coll: linksC, title: 'Link', render: () => renderManual(), fields: [
  { k: 'name', label: 'Nome', req: true }, { k: 'cat', label: 'Categoria' }, { k: 'url', label: 'Indirizzo', type: 'url', req: true }, { k: 'version', label: 'Versione installata' }, { k: 'checked', label: 'Ultimo controllo', type: 'date' }] };
function renderManual() {
  $('#view-manual').innerHTML = `<div class="head"><span class="chip">Le cose da ricordare</span><h1>Manuale e link utili</h1><p class="muted">Come si fa… e le pagine ufficiali per driver e aggiornamenti.</p></div>
    <h2>Manuale del mio PC</h2><div class="panel dactions"><button class="btn primary" data-coll="manual" data-act="add">＋ Aggiungi voce</button></div>
    <div class="glist">${manualC.items.map(m => `<article class="gm"><header><b>${esc(m.title)}</b></header><p class="small">${esc(m.text)}</p>${rowActs('manual', m.id)}</article>`).join('')}</div>
    <h2>Link utili</h2><div class="panel dactions"><button class="btn primary" data-coll="links" data-act="add">＋ Aggiungi link</button></div>
    <div class="glist">${linksC.items.map(l => `<article class="gm"><header><b>${esc(l.name)}</b><span class="chip">${esc(l.cat)}</span></header><p><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">Apri ↗</a></p><p class="small muted">${l.version ? 'Versione installata: ' + esc(l.version) + ' · ' : ''}${l.checked ? 'ultimo controllo ' + fmtD(l.checked) : 'mai controllato'}</p>${rowActs('links', l.id)}</article>`).join('')}</div>`;
}
