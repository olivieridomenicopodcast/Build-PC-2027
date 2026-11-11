/* ============================================================
   PAGINA "POSTAZIONE DUAL PC" (dalla guida PDF)
   Checklist con spunte salvate, schema, nomi personalizzati,
   calcolatore di velocità e diagnosi dei problemi.
   ============================================================ */
const DUAL_KEY = 'buildpc2027_dual';
const dual = { checked: {}, names: { new: 'PC-NUOVO', old: 'PC-VECCHIO', share: 'Condivisione', drive: 'Z' } };
try { const d = JSON.parse(localStorage.getItem(DUAL_KEY) || '{}'); Object.assign(dual.checked, d.checked || {}); Object.assign(dual.names, d.names || {}); } catch (e) { /* ignore */ }
const dualSave = () => { try { localStorage.setItem(DUAL_KEY, JSON.stringify(dual)); } catch (e) { /* ignore */ } };

/* testo con segnaposto: {new} {old} {share} {drive} */
const DUAL = [
  { id: 'g1', num: '1', title: 'Schema e materiali', intro: 'Il collegamento HDMI serve soltanto a scegliere quale computer vedere sul secondo monitor. Mouse, tastiera, appunti e file viaggiano sulla rete.',
    groups: [{ items: [
      'Due PC con Windows 11, entrambi accesi e collegati alla stessa rete domestica.',
      'Due cavi Ethernet dal PC al Powerline (uno per computer).',
      'Powerline TP-Link AV600 già funzionante.',
      'Mouse e tastiera collegati al PC nuovo.',
      'Microsoft PowerToys installato su entrambi i PC.',
      'Uno switch HDMI per alternare sul secondo monitor il segnale del PC nuovo e del PC vecchio.' ] }],
    note: 'Non serve un software di desktop remoto: i due PC restano autonomi. La condivisione riguarda periferiche e file, non fonde le risorse di calcolo.' },
  { id: 'g2', num: '2', title: 'Preparazione della rete', intro: 'Prima di configurare le cartelle, verifica che i due computer si vedano sulla rete locale.',
    groups: [{ items: [
      'Collega entrambi i PC via Ethernet al Powerline AV600.',
      'Verifica che entrambi abbiano accesso alla rete domestica e che il collegamento Ethernet risulti attivo.',
      'Su ciascun PC apri Impostazioni → Rete e Internet → Ethernet.',
      'Imposta il profilo di rete su Privata soltanto se è la tua rete domestica fidata. Mai su reti pubbliche o non controllate.',
      'Annota il nome di ciascun PC: Impostazioni → Sistema → Informazioni → Nome dispositivo.' ] }],
    note: 'Assegna nomi facili da riconoscere, per esempio PC-NUOVO e PC-VECCHIO. Se li cambi, riavvia i computer prima di proseguire.' },
  { id: 'g3', num: '3', title: 'Condivisione dei file pesanti (SMB)', intro: 'Per progetti audio, sessioni, video, librerie di campioni e cartelle grandi. SMB è integrato in Windows: apri la cartella dell\'altro PC da Esplora file.',
    groups: [
      { title: '3A · Crea la cartella da condividere sul PC vecchio', items: [
        'Sul PC vecchio crea una cartella dedicata, per esempio D:\\{share}. Puoi usare un altro disco o percorso.',
        'Clic destro sulla cartella → Proprietà → Condivisione → Condivisione avanzata.',
        'Seleziona Condividi la cartella e assegna un nome semplice, per esempio {share}.',
        'Apri Autorizzazioni e concedi lettura/scrittura soltanto all\'utente o agli utenti che devono trasferire file.',
        'Nella scheda Sicurezza verifica anche i permessi NTFS: i permessi effettivi sono il risultato di condivisione e Sicurezza.',
        'Conferma le modifiche. Evita di condividere l\'intero disco C: o l\'intero profilo utente.' ],
        note: 'Più sicuro: usa un account Windows del PC vecchio con password e autenticati con quelle credenziali. Niente condivisione senza password né accesso a «Everyone».' },
      { title: '3B · Attiva le opzioni di condivisione', items: [
        'Impostazioni → Rete e Internet → Impostazioni di rete avanzate → Impostazioni di condivisione avanzate (il percorso può variare con gli aggiornamenti).',
        'Nel profilo Reti private attiva Individuazione rete.',
        'Attiva Condivisione file e stampanti.',
        'Lascia attiva la condivisione protetta da password, se disponibile.',
        'Controlla che il firewall di Windows consenta la condivisione file e stampanti sulle reti private. Non disattivare il firewall.' ] },
      { title: '3C · Apri la cartella dal PC nuovo', items: [
        'Sul PC nuovo apri Esplora file.',
        'Nella barra degli indirizzi digita \\\\{old}\\{share} (con il nome reale del vecchio PC e della cartella).',
        'Se richiesto, inserisci nome utente e password di un account autorizzato sul PC vecchio. Se serve il formato, prova {old}\\nomeutente.',
        'Verifica di poter creare una cartella di prova, copiarvi un file e cancellarlo.',
        'Per renderla permanente: Esplora file → Questo PC → … → Connetti unità di rete. Scegli la lettera {drive}:, inserisci il percorso di rete e seleziona Riconnetti all\'accesso.' ],
        note: 'Ripeti al contrario soltanto se vuoi che anche il PC vecchio acceda a una cartella del PC nuovo. Non è obbligatorio condividere entrambi.' } ] },
  { id: 'g4', num: '4', title: 'Mouse e tastiera condivisi', intro: 'Microsoft PowerToys → Mouse Without Borders, da installare su entrambi i PC (pagina ufficiale Microsoft o Microsoft Store).',
    groups: [{ items: [
      'Installa la stessa versione aggiornata di PowerToys su entrambi i PC.',
      'Apri PowerToys su entrambi e abilita Mouse Without Borders.',
      'Sul PC principale apri la configurazione e recupera il nome del computer e la chiave di sicurezza.',
      'Sull\'altro PC inserisci il nome del PC principale e la chiave, poi completa l\'associazione.',
      'Accetta eventuali richieste del firewall soltanto per la rete privata domestica.',
      'Disponi i computer nel layout di Mouse Without Borders in modo coerente con la posizione dei monitor.',
      'Prova a spostare il puntatore oltre il bordo dello schermo: deve passare all\'altro PC.',
      'Prova la digitazione e il copia/incolla di una breve frase.' ] }],
    note: 'Limite importante: il trasferimento file di Mouse Without Borders arriva a 100 MB per file. Per file più grandi, cartelle e progetti usa sempre la cartella SMB mappata (per esempio {drive}:). Appunti condivisi per testo e piccoli passaggi; Esplora file → {drive}: per audio, video, ZIP, sessioni DAW. Se un\'app deve lavorare su un file remoto, spesso è meglio copiare prima il progetto sul disco locale del PC che lo elabora.' },
  { id: 'g5', num: '5', title: 'Monitor e switch HDMI', intro: 'Lo switch cambia il segnale video del secondo monitor. Non trasferisce file e non collega i computer: sono funzioni separate.',
    groups: [{ items: [
      'Collega l\'uscita video del PC nuovo a un ingresso dello switch HDMI.',
      'Collega l\'uscita video del PC vecchio all\'altro ingresso dello switch.',
      'Collega l\'uscita dello switch al secondo monitor.',
      'Collega il primo monitor direttamente al PC nuovo.',
      'Verifica che il PC nuovo usi entrambi i monitor quando lo switch seleziona il suo ingresso.',
      'Verifica che il PC vecchio resti raggiungibile in rete anche quando il monitor mostra il PC nuovo.' ] }],
    note: 'Quando lo switch cambia ingresso, Windows può rilevare una configurazione di monitor diversa e il passaggio del mouse può non risultare naturale: correggi il layout in PowerToys o usa una scorciatoia per cambiare computer. Rete e cartelle condivise funzionano comunque.' },
  { id: 'g6', num: '6', title: 'Collaudo e velocità reale', intro: 'AV600 è una classe teorica del powerline, non la velocità effettiva tra i due PC: dipende da impianto elettrico, distanza, interferenze, porte Ethernet e dischi. Se oggi è stabile, prova prima senza comprare nulla.',
    groups: [
      { title: 'Collaudo', items: [
        'Con entrambi i PC accesi, verifica che la cartella di rete si apra senza errori.',
        'Copia un file di prova da 1-5 GB dal PC vecchio al nuovo e cronometra il trasferimento (usa il calcolatore qui sotto).',
        'Ripeti dal PC nuovo al vecchio, se hai abilitato la condivisione in entrambe le direzioni.',
        'Durante il test evita download o streaming pesanti sulla stessa rete.',
        'Controlla che i dischi non siano quasi pieni e che il PC destinatario abbia spazio.',
        'Apri un progetto di prova copiato localmente e verifica che file e cartelle siano integri.' ] },
      { title: 'Se il trasferimento è lento', items: [
        'Controlla che entrambi i PC siano in Ethernet e non usino il Wi-Fi per parlarsi.',
        'Verifica la velocità negoziata della scheda Ethernet nelle impostazioni di rete o nello stato della connessione.',
        'Prova prese a muro dirette, evitando ciabatte e filtri di sovratensione, come indica TP-Link.',
        'Prova un altro cavo Ethernet e un\'altra presa a muro, se disponibili.',
        'Ricorda che un HDD meccanico può essere il collo di bottiglia rispetto a un SSD, soprattutto con tanti file piccoli.' ],
        note: 'Non comprare subito un powerline più veloce o uno switch 2,5 GbE: prima misura la velocità reale e individua cosa limita il trasferimento.' } ] },
  { id: 'g7', num: '7', title: 'Sicurezza e buone pratiche', intro: '',
    groups: [{ items: [
      'Condividi soltanto cartelle specifiche, non interi dischi o cartelle di sistema.',
      'Usa account Windows con password e permessi limitati alle persone/dispositivi autorizzati.',
      'Mantieni attivo Microsoft Defender Firewall e limita la condivisione alla rete privata fidata.',
      'Non attivare SMB 1.0/CIFS: su Windows 11 usa SMB moderno.',
      'Non esporre SMB a Internet e non aprire porte sul router per renderlo accessibile dall\'esterno.',
      'Fai backup dei progetti importanti su un disco separato o su un servizio di backup: una cartella condivisa non è un backup.',
      'Prima di lavorare su un progetto audio/video, verifica se il software supporta il lavoro su rete; per sessioni pesanti o librerie di campioni lavora da SSD locale e usa la rete per trasferimento e archivio.' ] }] },
  { id: 'g8', num: '8', title: 'Checklist finale di attivazione', intro: 'Quando sono tutte spuntate, la postazione è pronta.',
    groups: [{ items: [
      'Entrambi i PC sono aggiornati e collegati via Ethernet al Powerline AV600.',
      'Entrambi i PC sono sulla stessa rete locale e il profilo è Privata.',
      'I nomi dei PC sono stati annotati.',
      'PowerToys è installato su entrambi i PC.',
      'Mouse Without Borders è associato e mouse/tastiera funzionano su entrambi.',
      'La cartella dedicata è stata creata e condivisa sul PC vecchio.',
      'Individuazione rete e Condivisione file e stampanti sono abilitate per la rete privata.',
      'Dal PC nuovo si apre \\\\{old}\\{share}.',
      'Le credenziali funzionano e i permessi consentono solo le operazioni necessarie.',
      'La cartella è stata mappata come unità di rete ({drive}:).',
      'Un file grande è stato copiato e aperto correttamente.',
      'Lo switch HDMI mostra correttamente il PC desiderato sul secondo monitor.',
      'Il PC vecchio resta accessibile in rete anche quando non è visualizzato sul monitor.' ] }] },
];

const DUAL_DIAG = [
  ['Non riesco ad aprire \\\\{old}\\{share}', ['Entrambi i PC sono in Ethernet, sulla stessa rete e con profilo Privata?', 'Sul PC vecchio: Individuazione rete e Condivisione file e stampanti attive, e firewall che le consente sulle reti private (non disattivarlo).', 'Il nome del PC e della cartella sono scritti esatti? Se hai rinominato il PC, riavvia entrambi.', 'Se chiede le credenziali, prova il formato {old}\\nomeutente con un account che ha la password.']],
  ['Il trasferimento è lento', ['Entrambi i PC devono essere in Ethernet, non in Wi-Fi.', 'Controlla la velocità negoziata della scheda Ethernet.', 'Powerline in presa a muro diretta (niente ciabatte o filtri), prova altro cavo e altra presa.', 'Un HDD meccanico rallenta, soprattutto con tanti file piccoli: misura con un file grande.', 'Non comprare un powerline più veloce o uno switch 2,5 GbE prima di aver misurato cosa limita.']],
  ['Il mouse non passa all\'altro PC dopo aver cambiato switch HDMI', ['Windows può aver rilevato un diverso layout di monitor: correggi la disposizione in PowerToys → Mouse Without Borders.', 'In alternativa usa una scorciatoia per cambiare computer.', 'La rete e le cartelle condivise continuano a funzionare anche se l\'ingresso HDMI è quello sbagliato.']],
  ['Voglio spostare un file da più di 100 MB', ['Mouse Without Borders arriva a 100 MB per file: non usarlo per questo.', 'Usa la cartella SMB mappata ({drive}:) da Esplora file: nessun limite di dimensione, anche per cartelle e progetti completi.']],
  ['Il PC vecchio non si vede quando il monitor mostra il PC nuovo', ['Lo switch HDMI è solo video: non spegne né scollega il PC vecchio.', 'Verifica che il PC vecchio sia acceso, non in sospensione, e ancora in Ethernet.']],
  ['Devo comprare qualcosa?', ['Non subito. AV600 è una velocità teorica: misura prima la velocità reale con un file da 1-5 GB.', 'Solo se il collo di bottiglia è davvero la rete (e non dischi, cavi o prese) valuta un powerline più veloce o uno switch 2,5 GbE.']],
];

const dualFill = s => s.replace(/\{(new|old|share|drive)\}/g, (_, k) => dual.names[k] || '…');
const dualAll = () => DUAL.flatMap(sec => sec.groups.flatMap((g, gi) => g.items.map((t, i) => ({ id: `${sec.id}.${gi}.${i}`, sec: sec.id }))));

function dualSchema() {
  const box = (x, y, w, h, t1, t2, c) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#12142a" stroke="${c}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" class="sc-t">${t1}</text><text x="${x + w / 2}" y="${y + h / 2 + 15}" text-anchor="middle" class="sc-s">${t2}</text></g>`;
  return `<svg class="schema" viewBox="0 0 760 340" role="img" aria-label="Schema della postazione dual PC">
    <path d="M190 75 H250 M510 75 H570" stroke="#22d3ee" stroke-width="3" fill="none" class="flow"/>
    <path d="M300 75 H460" stroke="#22d3ee" stroke-width="2" stroke-dasharray="3 8" fill="none" class="flow slow" opacity=".7"/>
    <path d="M90 110 V230" stroke="#fbbf24" stroke-width="3" fill="none"/>
    <path d="M150 110 V170 H355 V205" stroke="#fbbf24" stroke-width="3" fill="none" class="flow"/>
    <path d="M645 110 V170 H405 V205" stroke="#fbbf24" stroke-width="3" fill="none" class="flow"/>
    <path d="M380 245 V275" stroke="#fbbf24" stroke-width="3" fill="none" class="flow"/>
    ${box(40, 40, 150, 70, 'PC nuovo', 'Windows 11 · mouse e tastiera', '#ff4fd8')}
    ${box(570, 40, 150, 70, 'PC vecchio', 'Windows 11 · cartella SMB', '#a78bfa')}
    ${box(250, 52, 50, 46, 'AV', '600', '#22d3ee')}${box(460, 52, 50, 46, 'AV', '600', '#22d3ee')}
    <text x="380" y="62" text-anchor="middle" class="sc-s">rete elettrica / casa</text>
    ${box(40, 230, 150, 60, 'Monitor 1', 'diretto al PC nuovo', '#34d399')}
    ${box(325, 205, 110, 40, 'Switch HDMI', '', '#fbbf24')}
    ${box(310, 275, 140, 55, 'Monitor 2', 'sceglie quale PC mostrare', '#34d399')}
    <text x="40" y="20" class="sc-l" fill="#22d3ee">━ Ethernet / rete: mouse, tastiera, appunti, file</text>
    <text x="40" y="333" class="sc-l" fill="#fbbf24">━ HDMI: solo video</text>
  </svg>`;
}

function renderDual() {
  const all = dualAll();
  const done = all.filter(x => dual.checked[x.id]).length;
  const sections = DUAL.map(sec => {
    const body = sec.groups.map((g, gi) => `
      ${g.title ? `<h4 class="dg-t">${g.title}</h4>` : ''}
      <ul class="chk">${g.items.map((t, i) => { const id = `${sec.id}.${gi}.${i}`;
        return `<li><label><input type="checkbox" data-dual-chk="${id}" ${dual.checked[id] ? 'checked' : ''}><span class="box" aria-hidden="true"></span><span class="tx" data-raw="${esc(t)}">${esc(dualFill(t))}</span></label></li>`; }).join('')}</ul>
      ${g.note ? `<p class="dnote" data-raw="${esc(g.note)}">${esc(dualFill(g.note))}</p>` : ''}`).join('');
    return `<details class="dsec" id="d-${sec.id}" open><summary><span class="dn">${sec.num}</span><span class="dt">${sec.title}</span><span class="dp" data-dual-prog="${sec.id}"></span></summary>
      <div class="dbody">${sec.intro ? `<p class="muted">${esc(sec.intro)}</p>` : ''}${body}${sec.note ? `<p class="dnote" data-raw="${esc(sec.note)}">${esc(dualFill(sec.note))}</p>` : ''}</div></details>`;
  }).join('');

  $('#view-dual').innerHTML = `
    <div class="head"><span class="chip">Dalla guida PDF · Windows 11</span><h1>Postazione dual PC</h1>
      <p class="muted">Due computer come un unico ambiente di lavoro: un mouse e una tastiera, copia/incolla e file anche grandi. PC nuovo sul primo monitor, PC vecchio raggiungibile sul secondo tramite switch HDMI.</p></div>

    <div class="take">
      <div class="tk"><span class="ic">🖱️</span><h3>Mouse e tastiera</h3><p>PowerToys → Mouse Without Borders su entrambi i PC: un solo mouse, una tastiera e gli appunti condivisi.</p></div>
      <div class="tk"><span class="ic">📁</span><h3>File pesanti</h3><p>Condivisione cartelle di Windows (SMB), mappata come unità ${dual.names.drive}:. Nessun limite dei 100 MB di Mouse Without Borders.</p></div>
      <div class="tk"><span class="ic">🔌</span><h3>Rete Powerline</h3><p>AV600 è una velocità teorica, non 600 Mbps reali: fai una prova prima di valutare acquisti.</p></div>
      <div class="tk"><span class="ic">📺</span><h3>Switch HDMI</h3><p>Cambia solo il video del secondo monitor. La rete funziona anche se mostra l'altro PC.</p></div>
    </div>

    <h2>Lo schema</h2>
    <div class="panel">${dualSchema()}</div>

    <h2>I tuoi nomi</h2>
    <div class="panel names">
      <p class="muted small">Scrivi i nomi reali: percorsi e checklist qui sotto si aggiornano da soli.</p>
      <div class="nm-grid">
        <label class="field"><span>Nome PC nuovo</span><input data-dual-name="new" value="${esc(dual.names.new)}"></label>
        <label class="field"><span>Nome PC vecchio</span><input data-dual-name="old" value="${esc(dual.names.old)}"></label>
        <label class="field"><span>Cartella condivisa</span><input data-dual-name="share" value="${esc(dual.names.share)}"></label>
        <label class="field"><span>Lettera unità</span><input data-dual-name="drive" maxlength="1" value="${esc(dual.names.drive)}"></label>
      </div>
      <div class="cmds">
        <div class="cmd"><span>Percorso da digitare in Esplora file (sul PC nuovo)</span><code id="cmd-path"></code><button class="btn" data-dual-copy="cmd-path">Copia</button></div>
        <div class="cmd"><span>Alternativa da Prompt dei comandi: mappa l'unità</span><code id="cmd-net"></code><button class="btn" data-dual-copy="cmd-net">Copia</button></div>
      </div>
    </div>

    <h2>La tua checklist</h2>
    <div class="panel dprog"><div><b id="dual-done">${done}</b><span class="muted"> / ${all.length} passaggi completati</span></div>
      <div class="bar"><i id="dual-bar" style="width:${(done / all.length) * 100}%;background:linear-gradient(90deg,#22d3ee,#34d399)"></i></div>
      <div class="dactions"><button class="btn" data-dual-all="open">Apri tutte</button><button class="btn" data-dual-all="close">Chiudi tutte</button><button class="btn" data-dual-reset>↺ Azzera spunte</button></div></div>
    <div class="dsecs">${sections}</div>

    <h2>Quanto è veloce la tua rete?</h2>
    <div class="panel">
      <p class="muted small">Copia un file grande (1-5 GB) tra i due PC, cronometra e inserisci i dati. 1 MB/s ≈ 8 Mbps.</p>
      <div class="nm-grid calc">
        <label class="field"><span>Dimensione file (GB)</span><input type="number" min="0.1" step="0.1" value="2" data-dual-calc="gb"></label>
        <label class="field"><span>Tempo (secondi)</span><input type="number" min="1" step="1" value="60" data-dual-calc="sec"></label>
      </div>
      <div id="calc-out" class="calc-out"></div>
    </div>

    <h2>Qualcosa non va?</h2>
    <div class="diag">${DUAL_DIAG.map(d => `<details><summary data-raw="${esc(d[0])}">${esc(dualFill(d[0]))}</summary><ul>${d[1].map(s => `<li data-raw="${esc(s)}">${esc(dualFill(s))}</li>`).join('')}</ul></details>`).join('')}</div>

    <h2>Riferimenti ufficiali</h2>
    <div class="panel"><ul class="ul small">
      <li><a href="https://learn.microsoft.com/windows/powertoys/mouse-without-borders" target="_blank" rel="noopener">Mouse Without Borders (Microsoft)</a> · <a href="https://learn.microsoft.com/windows/powertoys/" target="_blank" rel="noopener">PowerToys</a></li>
      <li><a href="https://support.microsoft.com/windows/file-sharing-over-a-network-in-windows" target="_blank" rel="noopener">Condivisione file in rete in Windows</a></li>
      <li><a href="https://support.microsoft.com/windows/map-a-network-drive-in-windows" target="_blank" rel="noopener">Mappare un'unità di rete in Windows</a></li>
      <li><a href="https://www.tp-link.com/support/" target="_blank" rel="noopener">Supporto TP-Link Powerline</a>: consulta la guida del modello AV600 esatto per prese, abbinamento e LED.</li></ul></div>
    <p class="muted small">Risultato atteso: il PC nuovo resta la postazione principale, il PC vecchio rimane acceso e raggiungibile. Con un solo mouse e una sola tastiera passi da un computer all'altro; per i trasferimenti importanti usi le cartelle condivise attraverso Ethernet/Powerline.</p>`;
  dualRefresh();
  dualCalc();
}

function dualRefresh() {
  const all = dualAll();
  const done = all.filter(x => dual.checked[x.id]).length;
  const d = $('#dual-done'); if (d) d.textContent = done;
  const b = $('#dual-bar'); if (b) b.style.width = (done / all.length) * 100 + '%';
  DUAL.forEach(sec => {
    const ids = all.filter(x => x.sec === sec.id), n = ids.filter(x => dual.checked[x.id]).length;
    const el = document.querySelector(`[data-dual-prog="${sec.id}"]`);
    if (el) { el.textContent = `${n}/${ids.length}`; el.classList.toggle('full', n === ids.length); }
  });
  const n = dual.names;
  const p = $('#cmd-path'); if (p) p.textContent = `\\\\${n.old}\\${n.share}`;
  const c = $('#cmd-net'); if (c) c.textContent = `net use ${(n.drive || 'Z').toUpperCase()}: \\\\${n.old}\\${n.share} /persistent:yes`;
  document.querySelectorAll('#view-dual [data-raw]').forEach(el => (el.textContent = dualFill(el.dataset.raw)));
}

function dualCalc() {
  const gb = +(document.querySelector('[data-dual-calc=gb]') || {}).value, sec = +(document.querySelector('[data-dual-calc=sec]') || {}).value;
  const out = $('#calc-out'); if (!out) return;
  if (!(gb > 0) || !(sec > 0)) { out.innerHTML = '<p class="muted">Inserisci dimensione e tempo.</p>'; return; }
  const mbs = (gb * 1000) / sec, mbps = mbs * 8;
  const v = mbs >= 70 ? ['Ottimo', '#34d399', 'Vicino alla velocità di una rete gigabit: ottimo per sessioni e librerie.']
    : mbs >= 30 ? ['Buono', '#a3e635', 'Più che sufficiente per progetti e file grandi: i trasferimenti si fanno senza dolore.']
    : mbs >= 10 ? ['Lento', '#fbbf24', 'Usabile per trasferimenti occasionali. Controlla prese, cavi, Wi-Fi e dischi (vedi «Se il trasferimento è lento»).']
    : ['Molto lento', '#f87171', 'Qualcosa limita il collegamento: probabile Wi-Fi, presa con ciabatta/filtro, cavo difettoso o HDD pieno. Non comprare nulla prima di aver controllato.'];
  const fmt = s => (s < 90 ? Math.round(s) + ' s' : s < 5400 ? Math.round(s / 60) + ' min' : (s / 3600).toFixed(1) + ' h');
  out.innerHTML = `<div class="calc-main"><b style="color:${v[1]}">${mbs.toFixed(1)} MB/s</b><span>≈ ${Math.round(mbps)} Mbps · <em style="color:${v[1]}">${v[0]}</em></span></div>
    <p class="muted">${v[2]} <span class="small">(soglie indicative, non della guida)</span></p>
    <div class="est">${[10, 50, 100].map(g => `<div><b>${g} GB</b><span>${fmt((g * 1000) / mbs)}</span></div>`).join('')}</div>`;
}

document.addEventListener('change', e => {
  const id = e.target.dataset && e.target.dataset.dualChk;
  if (id) { dual.checked[id] = e.target.checked; if (!e.target.checked) delete dual.checked[id]; dualSave(); dualRefresh(); }
});
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.dualName;
  if (k) { dual.names[k] = e.target.value.trim(); dualSave(); dualRefresh(); }
  if (e.target.dataset && e.target.dataset.dualCalc) dualCalc();
});
document.addEventListener('click', e => {
  const t = e.target.closest('[data-dual-copy],[data-dual-reset],[data-dual-all]');
  if (!t) return;
  if (t.dataset.dualCopy) {
    const txt = document.getElementById(t.dataset.dualCopy).textContent;
    const ok = () => { const o = t.textContent; t.textContent = '✓ Copiato'; setTimeout(() => (t.textContent = o), 1400); };
    navigator.clipboard ? navigator.clipboard.writeText(txt).then(ok, ok) : ok();
  } else if (t.dataset.dualAll) document.querySelectorAll('.dsec').forEach(d => (d.open = t.dataset.dualAll === 'open'));
  else if (confirm('Azzerare tutte le spunte della checklist?')) { dual.checked = {}; dualSave(); document.querySelectorAll('[data-dual-chk]').forEach(c => (c.checked = false)); dualRefresh(); }
});
