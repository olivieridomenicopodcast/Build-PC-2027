/* ============================================================
   CHECKLIST DI ARRIVO del PC (Gladio VS5): prima, consegna, primo avvio,
   prova di 14 giorni, migrazione dati, pagamenti, assistenza.
   Si può mettere "in pausa" quando è finita.
   ============================================================ */
const CHK_KEY = 'buildpc2027_chk';
const chk = { checked: {}, paused: false, delivered: '' };
try { const d = JSON.parse(localStorage.getItem(CHK_KEY) || '{}'); Object.assign(chk, d); } catch (e) { /* ignore */ }
const chkSave = () => { try { localStorage.setItem(CHK_KEY, JSON.stringify(chk)); } catch (e) { /* ignore */ } };
const chkData = () => ({ checked: chk.checked, paused: chk.paused, delivered: chk.delivered });

const CHK = [
  { id: 'k1', num: '1', title: 'Prima dell\'arrivo', intro: 'Da fare oggi e nei giorni prima della consegna.', items: [
    'Conferma scritta (WhatsApp o email) della configurazione esatta: Ryzen 5 7500X3D, RX 9060 XT 16 GB Gigabyte Gaming OC Ice, 32 GB Patriot CL30, Kingston SNV3 1 TB, MSI A750BN 750 W Bronze, MSI B850 Gaming Plus WiFi, AIO MSI MAG A13 360 bianco, Cougar FV150 bianco, Windows 11 Pro.',
    'Conferma scritta della spedizione di lunedì 30/11 e non prima.',
    'Screenshot dell\'ordine, della chat con PJ Digitalstore e della conferma Scalapay salvati.',
    'Backup dei progetti importanti su hard disk esterno, oltre a OneDrive.',
    'Controllato su onedrive.com che cartelle e file importanti siano online, e che lo spazio non sia pieno.',
    'Lista di plugin, licenze e account di Pro Tools (Avid, iLok, plugin di terze parti) scritta e pronta.',
    'Pronti i cavi per i monitor (DisplayPort/HDMI) e il cavo Ethernet per il powerline.',
    'Qualcuno a casa nel giorno di consegna, oppure consegna riprogrammata dal tracking.' ] },
  { id: 'k2', num: '2', title: 'Consegna e apertura', intro: 'Il momento più importante per la garanzia: documenta tutto.', items: [
    'Controllato lo scatolone esterno prima di firmare. Se è danneggiato: firma «accetto con riserva» e fai foto.',
    'Video continuo mentre apri lo scatolone.',
    'Imballi e scatole originali conservati (servono per resi e garanzia).',
    'Contenuto: PC, cavo di alimentazione, pennetta USB con Windows, eventuali documenti.',
    'Scheda video già montata (guarda dal vetro laterale) e cavi collegati; niente di staccato o rotto, vetro integro.',
    'Bollini di garanzia presenti e non rimossi.',
    'Data di consegna segnata qui sotto (da lì partono i 14 giorni di recesso).' ] },
  { id: 'k3', num: '3', title: 'Primo avvio e BIOS', intro: 'Collega i monitor alla scheda video, non alla scheda madre.', items: [
    'Monitor collegati alle porte della scheda video (non quelle della scheda madre).',
    'Primo avvio riuscito, Windows configurato con l\'account Microsoft.',
    'Aggiornamenti di Windows installati.',
    'Nel BIOS: CPU e 32 GB di RAM riconosciuti; profilo EXPO attivo a 6000 MHz.',
    'Nel BIOS: Secure Boot e TPM 2.0 attivi (servono a Battlefield 6, Modern Warfare 4, Valorant).',
    'Driver AMD Adrenalin (scheda video) e driver chipset AMD installati dai siti ufficiali.',
    'Con HWiNFO o CPU-Z verificato: Ryzen 5 7500X3D, RAM 2×16 GB DDR5-6000 CL30, RX 9060 XT 16 GB, SSD Kingston SNV3 1 TB.',
    'Temperature a riposo ragionevoli (CPU sotto i 50-55 °C circa) e nessun rumore strano da ventole o pompa dell\'AIO.' ] },
  { id: 'k4', num: '4', title: 'Prova di 14 giorni', intro: 'Prima che scada il recesso, prova il PC come lo userai davvero.', items: [
    'Un gioco pesante per 30-60 minuti (per esempio il benchmark di Cyberpunk 2077): nessun crash, temperature sotto controllo (sotto i 85 °C).',
    'Provati Ace Combat 8 e Modern Warfare 4 (se acquistati): si avviano, nessun errore di Secure Boot.',
    'Test della RAM (Diagnostica memoria di Windows o MemTest) lasciato girare una notte.',
    'Stato di salute dell\'SSD controllato con CrystalDiskInfo («Buono»).',
    'Accensione e spegnimento provati una decina di volte: nessun blocco, il BIOS parte sempre.',
    'Una sessione di Pro Tools aperta, riprodotta e registrata: nessun problema di latenza o audio.',
    'USB, Ethernet/Wi-Fi e uscita audio provati.',
    'Se tutto è a posto, segnata qui la data di fine prova. Se qualcosa non va: scrivi subito al negozio, con foto e video.' ] },
  { id: 'k5', num: '5', title: 'Migrazione dei dati', intro: 'Tieni acceso il vecchio PC finché non hai verificato tutto.', items: [
    'OneDrive collegato con lo stesso account e «File su richiesta» attivo (cartelle visibili, contenuti scaricati solo quando servono).',
    'Cartella OneDrive nel percorso scelto sul nuovo PC.',
    'Per le sessioni da aprire: cartella impostata su «Mantieni sempre su questo dispositivo» prima di aprirla.',
    'Pro Tools, plugin e driver della scheda audio installati e autorizzati.',
    'Una sessione di prova aperta dal nuovo percorso: i file audio ci sono tutti.',
    'Hard disk esterni collegati e riconosciuti.',
    'Solo ora: decidere cosa fare del vecchio PC (secondo computer nella postazione dual PC).' ] },
  { id: 'k6', num: '6', title: 'Pagamenti Scalapay', intro: '3 rate: la prima alla conferma. Tieni i soldi disponibili alle scadenze.', items: [
    'Prima rata pagata alla conferma dell\'ordine.',
    'Date e importi della seconda e della terza rata annotati (nell\'app Scalapay).',
    'Promemoria nel telefono due giorni prima di ogni scadenza.',
    'Soldi disponibili sulla carta alle scadenze (fondo tasse non toccato).',
    'Ricevute dei pagamenti salvate.' ] },
  { id: 'k7', num: '7', title: 'Se qualcosa non va', intro: 'Cosa fare, in ordine.', items: [
    'Scrivere subito a PJ Digitalstore su WhatsApp con foto e video del problema, e salvare le risposte.',
    'Non intervenire sull\'hardware prima di aver parlato con loro (bollino di garanzia).',
    'Chiedere per iscritto sostituzione o riparazione, tempi e chi paga la spedizione.',
    'Entro 14 giorni dalla consegna: valutare il recesso (da privato).',
    'Se non rispondono o è tardi: contestare con Scalapay/carta e usare la garanzia legale di 24 mesi.' ] },
];
const chkAll = () => CHK.flatMap(s => s.items.map((t, i) => ({ id: `${s.id}.${i}`, sec: s.id })));
const chkDate = (iso, days) => { if (!iso) return ''; const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toLocaleDateString('it-IT'); };

function renderChk() {
  const all = chkAll(), done = all.filter(x => chk.checked[x.id]).length, pct = Math.round((done / all.length) * 100);
  const tabBtn = document.querySelector('.tabs button[data-tab=chk]'); if (tabBtn) tabBtn.textContent = chk.paused ? '⏸ Checklist' : 'Checklist';
  if (chk.paused) {
    $('#view-chk').innerHTML = `<div class="head"><span class="chip">In pausa</span><h1>Checklist di arrivo</h1>
      <p class="muted">La checklist è in pausa. Completata al ${pct}% (${done} di ${all.length} passaggi). La riprendi quando ti serve.</p></div>
      <div class="panel"><div class="bar"><i style="width:${pct}%;background:linear-gradient(90deg,#22d3ee,#34d399)"></i></div>
      <div class="dactions" style="margin-top:14px"><button class="btn primary" data-chk="resume">▶ Riprendi la checklist</button></div></div>`;
    return;
  }
  const sections = CHK.map(s => `<details class="dsec" id="c-${s.id}" open><summary><span class="dn">${s.num}</span><span class="dt">${s.title}</span><span class="dp" data-chk-prog="${s.id}"></span></summary>
    <div class="dbody"><p class="muted">${esc(s.intro)}</p><ul class="chk">${s.items.map((t, i) => { const id = `${s.id}.${i}`;
      return `<li><label><input type="checkbox" data-chk-i="${id}" ${chk.checked[id] ? 'checked' : ''}><span class="box" aria-hidden="true"></span><span class="tx">${esc(t)}</span></label></li>`; }).join('')}</ul></div></details>`).join('');
  $('#view-chk').innerHTML = `
    <div class="head"><span class="chip">Gladio VS5 · PJ Digitalstore</span><h1>Checklist di arrivo</h1>
      <p class="muted">Cosa fare prima, durante e dopo la consegna, passo per passo. Le spunte restano salvate.</p></div>
    <div class="panel dprog"><div><b id="chk-done">${done}</b><span class="muted"> / ${all.length} passaggi completati</span></div>
      <div class="bar"><i id="chk-bar" style="width:${pct}%;background:linear-gradient(90deg,#22d3ee,#34d399)"></i></div>
      <div class="dactions"><button class="btn" data-chk="open">Apri tutte</button><button class="btn" data-chk="close">Chiudi tutte</button><button class="btn" data-chk="pause">⏸ Metti in pausa</button><button class="btn" data-chk="reset">↺ Azzera spunte</button></div></div>
    <div class="panel"><h3>Le date che contano</h3>
      <div class="nm-grid calc"><label class="field"><span>Data di consegna</span><input type="date" id="chk-date" value="${esc(chk.delivered)}"></label></div>
      <p class="muted" id="chk-dl">${chk.delivered ? `Recesso (14 giorni) fino al <b>${chkDate(chk.delivered, 14)}</b> · garanzia legale (24 mesi) fino al <b>${chkDate(chk.delivered, 730)}</b>.` : 'Inserisci la data di consegna per calcolare la scadenza del recesso e della garanzia.'}</p></div>
    <div class="dsecs" style="margin-top:14px">${sections}</div>`;
  chkRefresh();
}
function chkRefresh() {
  const all = chkAll(), done = all.filter(x => chk.checked[x.id]).length;
  const d = $('#chk-done'); if (d) d.textContent = done;
  const b = $('#chk-bar'); if (b) b.style.width = (done / all.length) * 100 + '%';
  CHK.forEach(s => { const ids = all.filter(x => x.sec === s.id), n = ids.filter(x => chk.checked[x.id]).length, el = document.querySelector(`[data-chk-prog="${s.id}"]`);
    if (el) { el.textContent = `${n}/${ids.length}`; el.classList.toggle('full', n === ids.length); } });
}
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset && t.dataset.chkI) { if (t.checked) chk.checked[t.dataset.chkI] = true; else delete chk.checked[t.dataset.chkI]; chkSave(); chkRefresh(); }
  if (t.id === 'chk-date') { chk.delivered = t.value; chkSave(); const p = document.getElementById('chk-dl'); if (p) p.innerHTML = chk.delivered ? `Recesso (14 giorni) fino al <b>${chkDate(chk.delivered, 14)}</b> · garanzia legale (24 mesi) fino al <b>${chkDate(chk.delivered, 730)}</b>.` : 'Inserisci la data di consegna per calcolare la scadenza del recesso e della garanzia.'; }
});
document.addEventListener('click', e => {
  const t = e.target.closest('[data-chk]'); if (!t) return;
  const a = t.dataset.chk;
  if (a === 'open' || a === 'close') document.querySelectorAll('#view-chk .dsec').forEach(d => (d.open = a === 'open'));
  else if (a === 'pause') { chk.paused = true; chkSave(); renderChk(); }
  else if (a === 'resume') { chk.paused = false; chkSave(); renderChk(); }
  else if (a === 'reset' && confirm('Azzerare tutte le spunte della checklist?')) { chk.checked = {}; chkSave(); renderChk(); }
});
