/* ============================================================
   MOTORE: compatibilità, punteggi per uso, pareri pre-programmati
   ============================================================ */

/* Impostazioni dell'utente che cambiano i punteggi. ext = archivio su hard disk esterni (l'SSD resta libero). */
const ENGINE_OPTS = { ext: true };

const PS5_IDX = 37; // potenza GPU di riferimento della PS5 sulla stessa scala

const clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const getItem = (cat, id) => ITEMS[cat].find(x => x.id === id);
const price = (it, mode) => (mode === 'B' && it.p2 != null ? it.p2 : it.p);
const euro = n => Math.round(n).toLocaleString('it-IT') + ' €';

function buildTotal(build, mode) {
  return CATS.reduce((s, c) => s + price(getItem(c.key, build[c.key]), mode), 0);
}

function tier(score) {
  if (score >= 88) return { key: 'top', label: 'Bestia', color: '#34d399' };
  if (score >= 78) return { key: 'great', label: 'Eccellente', color: '#4ade80' };
  if (score >= 66) return { key: 'good', label: 'Solido', color: '#fbbf24' };
  if (score >= 50) return { key: 'mid', label: 'Sufficiente', color: '#fb923c' };
  return { key: 'low', label: 'Debole', color: '#f87171' };
}
const useBand = s => (s >= 85 ? 0 : s >= 70 ? 1 : s >= 55 ? 2 : 3);

/* ---------- punteggi ---------- */
function computeScores(c, g, r, s, m, p, k, cs, draw) {
  const ramS = r.gb >= 64 ? 100 : r.gb >= 32 ? 90 : 60;
  const ramLong = r.gb >= 64 ? 100 : r.gb >= 32 ? 90 : 40;
  const ramGPen = r.gb >= 32 ? 0 : 7;
  const ssdS = (ENGINE_OPTS.ext ? (s.tb >= 4 ? 100 : s.tb >= 2 ? 90 : 85) : (s.tb >= 4 ? 100 : s.tb >= 2 ? 85 : 65)) + (s.spd > 9000 ? 3 : 0);
  const ssdSc = clamp(ssdS);

  const game = (gpuMul, wGpu, vramPen) => {
    const gp = Math.min(100, g.idx * gpuMul);
    const sc = 1 / (wGpu / gp + (1 - wGpu) / c.g);
    return clamp(sc - vramPen - ramGPen);
  };
  const fhd = game(1.25, 0.65, g.vram < 8 ? 15 : g.vram < 12 ? 4 : 0);
  const qhd = game(1.1, 0.8, g.vram < 12 ? 10 : g.vram < 16 ? 3 : 0);
  const uhd = game(0.9, 0.9, g.vram < 16 ? 10 : 0);

  // rumorosità: ventole + case + GPU
  const gpuSil = clamp(100 - (g.tdp - 100) * 0.25);
  let sil = 0.35 * k.silent + 0.35 * cs.silent + 0.3 * gpuSil;
  if (k.cap < c.power * 1.2) sil -= 10;
  sil = clamp(sil);

  const cpuA = 0.5 * c.g + 0.5 * c.mt;
  const audio = clamp(0.35 * cpuA + 0.25 * ramS + 0.1 * ssdSc + 0.3 * sil);

  const gpuV = Math.min(100, g.idx * 1.1) * (g.brand === 'NVIDIA' ? 1.06 : 1) - (g.vram < 12 ? 8 : 0);
  const cpuV = 0.15 * c.g + 0.85 * c.mt;
  const video = clamp(0.35 * cpuV + 0.3 * clamp(gpuV) + 0.2 * ramS + 0.15 * ssdSc);

  const devRaw = 0.35 * cpuA + 0.25 * ramS + 0.15 * ssdSc + 0.25 * Math.min(100, g.idx * 1.4);
  const dev = clamp(35 + 0.65 * devRaw);

  const vramScore = Math.min(100, (g.vram / 24) * 100);
  const aiRaw = 0.6 * vramScore + 0.2 * ramS + 0.2 * g.idx;
  const ai = clamp(aiRaw + (g.brand === 'NVIDIA' && g.idx > 30 ? 12 : -10));

  const platform = c.socket === 'AM5' ? 100 : c.socket === 'LGA1851' ? 80 : 30;
  const psuHead = clamp((p.w / draw - 1) * 200);
  const gpuL = g.idx * (g.vram >= 16 ? 1 : 0.8);
  const future = clamp(0.35 * gpuL + 0.2 * c.g + 0.2 * ramLong + 0.15 * platform + 0.1 * psuHead);

  return { fhd, qhd, uhd, audio, video, dev, ai, future, sil, ssdSc, ramS };
}

/* ---------- valutazione completa ---------- */
function evaluate(build, mode, budget, uses) {
  const c = getItem('cpu', build.cpu), g = getItem('gpu', build.gpu), r = getItem('ram', build.ram),
        s = getItem('ssd', build.ssd), m = getItem('mobo', build.mobo), p = getItem('psu', build.psu),
        k = getItem('cooler', build.cooler), cs = getItem('case', build.case);

  const total = buildTotal(build, mode);
  const draw = c.power + g.tdp + 100;
  const ratio = p.w / draw;
  const sc = computeScores(c, g, r, s, m, p, k, cs, draw);

  /* ----- compatibilità ----- */
  const errors = [], warns = [];
  const err = (key, text) => errors.push({ key, tone: 'bad', title: 'Incompatibilità', text });
  if (c.socket !== m.socket)
    err('socket', `La CPU usa il socket ${c.socket} ma la scheda madre è ${m.socket}: non si montano insieme. Scegli una scheda madre ${c.socket}.`);
  if (!cs.forms.includes(m.form))
    err('form', `La scheda madre ${m.form} non entra nel case selezionato (supporta ${cs.forms.join('/')}).`);
  if (k.type === 'aria' && k.h > cs.maxCooler)
    err('cooler-h', `Il dissipatore è alto ${k.h} mm ma il case ne ospita al massimo ${cs.maxCooler}: il pannello laterale non si chiude.`);
  if (k.type === 'liquido' && k.rad > cs.rad)
    err('cooler-rad', `Il radiatore da ${k.rad} mm non entra nel case (massimo ${cs.rad} mm).`);
  if (ratio < 1.1)
    err('psu', `L'alimentatore da ${p.w} W è troppo piccolo: la build può assorbire circa ${Math.round(draw)} W. Servono almeno ${Math.ceil((draw * 1.3) / 50) * 50} W.`);

  /* ----- pareri ----- */
  const P = [];                              // pareri non critici
  const add = (tone, title, text) => P.push({ tone, title, text });

  if (ratio >= 1.1 && ratio < 1.3)
    add('warn', 'Alimentatore al limite', `${p.w} W per un picco stimato di ~${Math.round(draw)} W: funziona ma senza margine, più rumoroso e poco adatto a cambiare GPU in futuro. Meglio ${Math.ceil((draw * 1.35) / 50) * 50} W.`);
  if (k.cap < c.power)
    add('bad', 'Dissipatore sottodimensionato', `${k.name} non smaltisce il calore di ${c.name} (~${c.power} W): throttling garantito. Passa a un AIO 360 o a un dissipatore più grande.`);
  else if (k.cap < c.power * 1.2)
    add('warn', 'Dissipatore giusto giusto', `${k.name} regge ${c.name} ma ventole veloci e rumore sotto carico: non l'ideale per registrare.`);
  if (m.vrm < c.vrm)
    add('warn', 'Alimentazione CPU scarsa', `${c.name} richiede VRM più robusti di quelli della ${m.name}: sotto carico pesante la scheda madre si scalda e può limitare le prestazioni. Prendi una B850 o X870E.`);
  if (c.socket === 'LGA1700')
    add('warn', 'Socket a fine vita', 'LGA1700 non avrà più nuove CPU: cambiare processore in futuro significherà cambiare anche scheda madre.');
  if (r.gb === 16)
    add('warn', '16 GB sono pochi', 'Il PDF lo dice chiaramente: non scendere a 16 GB. Montaggio e giochi moderni ci stanno stretti, e prima o poi dovrai comprarne altra (a prezzi da crisi DRAM).');
  if (g.vram < 12)
    add('bad', 'Poca VRAM', `${g.vram} GB di VRAM sono il motivo dei lag con Hogwarts Legacy, Arc Raiders e AION 2: i giochi 2026 vogliono 12-16 GB.`);
  else if (g.vram < 16)
    add('warn', 'VRAM al limite', 'Con 12 GB oggi si gioca bene, ma nei prossimi anni (GTA 6 incluso) si rischia di dover abbassare le texture. I 16 GB sono la scelta più sicura.');

  if (p.qual === 'Bronze' && g.tdp >= 250)
    add('warn', 'Alimentatore Bronze con scheda potente', `Un ${p.w} W Bronze con una scheda da ${g.tdp} W lavora vicino al limite, con più calore e rumore, e la qualità varia molto da marca a marca. Con una scheda così è meglio un Gold di marca nota.`);

  // sbilanciamenti
  if (g.idx >= 80 && c.g < 80)
    add('warn', 'CPU un po\' troppo cauta', `${g.name} è molto più forte di ${c.name}: in Full HD la CPU può limitare i frame. In 1440p vai meglio.`);
  if (g.idx < 50 && c.g >= 95)
    add('warn', 'Cervello grosso, occhi piccoli', `Un ${c.name} con ${g.name} è sprecato: spendi in CPU quello che ti manca in scheda video. Prima la GPU, poi la CPU.`);
  if (g.idx < 35)
    add('bad', 'Sotto il livello PS5', `Questa scheda video è circa ${(g.idx / PS5_IDX).toFixed(1)}× una PS5: i giochi del 2026 in Full HD non saranno all'altezza dei requisiti di partenza.`);

  // rumore
  if (cs.id === 'h7flow')
    add('tip', 'Registrare con l\'H7 Flow', 'Il frontale forato fa passare aria ma anche rumore. Usa ventole lente da 140 mm, una curva ventole gentile e, se puoi, tieni il PC lontano dal microfono.');
  if (sc.sil < 50)
    add('warn', 'PC rumoroso', `Silenziosità ${Math.round(sc.sil)}/100: per podcast e sound design pesano GPU calda, case aperto e ventole veloci. Valuta un Noctua NH-D15 G2 o un case più chiuso.`);
  if (!cs.rgb)
    add('info', 'Niente RGB', 'Il case selezionato non ha RGB, mentre il PDF prevedeva un case RGB: se ci tieni all\'estetica, scegline un altro.');

  // 3D cache vs video
  if (c.id === 'r7-9800x3d' && sc.video >= 70)
    add('info', 'X3D e montaggio', 'Il 9800X3D è il re dei giochi, ma per il montaggio il PDF suggerisce che un 9700X con SSD da 2 TB sia più utile: ~110 € di differenza che puoi reinvestire.');
  if (c.id === 'r9-9950x' && !uses.includes('video'))
    add('info', 'Overkill', '16 core sono utili per render pesanti. Per i tuoi usi rendono poco: gran parte di quei soldi sono potenza inutilizzata.');
  if (g.brand === 'NVIDIA' && g.idx >= 66)
    add('info', 'Perché Nvidia', 'DLSS, CUDA e NVENC sono un vantaggio vero per IA e video, ma costano più dell\'equivalente AMD. Se l\'IA gira solo online (come nei requisiti), il CUDA ti serve poco.');
  if (g.brand === 'AMD' && g.idx >= 74)
    add('good', 'AMD + DaVinci/Premiere', 'La Radeon va bene su DaVinci Resolve e Premiere per montaggi semplici: Nvidia ha qualcosa in più nell\'encoding, ma a questo budget costa troppo.');

  // RAM
  const ramShare = price(r, mode) / total;
  if (ramShare >= 0.25)
    add('warn', 'La RAM pesa un terzo', `La RAM vale il ${Math.round(ramShare * 100)}% del totale (${euro(price(r, mode))}). Crisi DRAM per la domanda di server/AI: nessun calo previsto prima del 2027 e il Black Friday non aiuta sulla RAM.`);

  // SSD
  if (ENGINE_OPTS.ext) {
    add('tip', 'Archivio su dischi esterni', s.tb >= 2
      ? `Archivi su HDD esterni, quindi ${s.tb} TB di SSD sono più del necessario: con 1 TB risparmieresti ~${Math.max(0, Math.round(price(s, mode) - price(getItem('ssd', 'ssd1'), mode)))} €. Tieni sull'SSD il sistema, i giochi e i progetti in corso.`
      : 'Con l\'archivio su HDD esterni 1 TB di SSD è la scelta giusta: sistema, qualche gioco e i progetti in corso. Lavorare direttamente da un HDD esterno rallenta montaggi e sessioni audio: copia il progetto attivo sull\'SSD.');
  } else if (s.tb === 1)
    add('tip', 'Storage', 'Un SSD da 1 TB ti fa risparmiare ~100 €: aggiungi un secondo disco più avanti per i progetti.');
  if (s.spd > 9000)
    add('info', 'Gen5: serve davvero?', 'Per giochi e montaggio leggero un Gen4 va uguale: il Gen5 scalda di più e costa di più.');

  // Budget
  const diff = total - budget;
  if (diff > 0)
    add('warn', 'Fuori budget', `Sei sopra di ${euro(diff)} rispetto ai ${euro(budget)}. Nel PDF nessuna build rientra con i prezzi di ottobre (sforamento 60-240 €, soprattutto per la RAM).`);
  else
    add('good', 'Dentro il budget', `Totale ${euro(total)}: restano ${euro(-diff)} dei ${euro(budget)} disponibili.`);

  // Black Friday
  if (price(g, mode) >= 600 || price(s, mode) >= 250)
    add('tip', 'Black Friday: 27 novembre', 'Può abbassare i prezzi di GPU e SSD (non della RAM). Se non hai urgenza, controlla Trovaprezzi prima di acquistare.');

  // GTA 6
  if (sc.future >= 70)
    add('good', 'Pronto per GTA 6', 'GTA 6 su console è previsto per il 19 novembre 2026; su PC solo previsioni tra fine 2027 e 2028. Una GPU da 16 GB è la scelta più sicura, e potrai cambiare solo la scheda.');

  // Match con una build del PDF
  const match = PRESETS.find(pr => CATS.every(ct => pr.build[ct.key] === build[ct.key]));
  if (match)
    add('info', 'Build dai PDF', `Questa è esattamente la build "${match.title}" (${SOURCES[match.src].label}).`);

  /* ----- punteggio complessivo ----- */
  const sel = uses.length ? uses : USES.map(u => u.key);
  let overall = sel.reduce((a, k2) => a + sc[k2], 0) / sel.length;
  if (errors.length) overall = Math.min(overall, 35);
  overall = Math.round(overall);

  const order = { bad: 0, warn: 1, tip: 2, info: 3, good: 4 };
  const pareri = [...errors, ...P.sort((a, b) => order[a.tone] - order[b.tone])];

  const scores = {};
  USES.forEach(u => (scores[u.key] = Math.round(sc[u.key])));

  const ctx = { c, g, r, s, m, p, k, cs, total, draw, ratio, diff, overall, scores, sil: Math.round(sc.sil), errors, match };
  ctx.archetype = archetype(ctx);
  ctx.tier = tier(overall);
  ctx.verdict = verdictText(ctx, sel);
  ctx.pareri = pareri;
  ctx.games = GAMES.map(gm => {
    const f = sc.fhd;
    let st;
    if (f >= gm.demand + 15) st = { k: 'ultra', label: 'Ultra fluido', c: '#34d399' };
    else if (f >= gm.demand) st = { k: 'alto', label: 'Alto e fluido', c: '#4ade80' };
    else if (f >= gm.demand - 15) st = { k: 'med', label: 'Dettagli ridotti', c: '#fbbf24' };
    else st = { k: 'low', label: 'Fa fatica', c: '#f87171' };
    return { ...gm, status: st };
  });
  ctx.ps5 = +(g.idx / PS5_IDX).toFixed(1);
  return ctx;
}

function archetype(x) {
  const { c, g, r, total, errors } = x;
  if (errors.length) return { name: 'Cantiere aperto', emoji: '🚧', line: 'Qualche pezzo non si incastra: sistema le incompatibilità e ne riparliamo.' };
  if (g.idx <= 30) return { name: 'Il PC della nostalgia', emoji: '🕰️', line: 'Funziona, ma si ricorda ancora quando i giochi giravano a 30 fps.' };
  if (g.idx >= 80 && c.g >= 95) return { name: 'Bestia da gaming', emoji: '🔥', line: 'I frame sono il tuo secondo nome. Questo PC non gioca: domina.' };
  if (c.mt >= 90 && r.gb >= 64) return { name: 'Workstation creativa', emoji: '🎛️', line: 'Più core che idee... ma tanto le idee le hai già tu.' };
  if (c.g >= 95 && g.idx < 60) return { name: 'Cervello grosso, occhi piccoli', emoji: '🤓', line: 'Una CPU da campione con una GPU da dilettante: bilancia la build.' };
  if (g.idx >= 80 && c.g < 80) return { name: 'La GPU che aspetta', emoji: '🐢', line: 'La scheda video è pronta a correre, la CPU è ancora ai blocchi di partenza.' };
  if (g.idx >= 66 && c.g >= 84) return { name: 'Tuttofare equilibrato', emoji: '⚖️', line: 'Gioca, registra e monta: tutto bene, senza esagerare con nulla. Il PC che serve a uno multipotenziale.' };
  if (total < 1900) return { name: 'Il furbo del budget', emoji: '🧠', line: 'Fa il suo e risparmia: il portafoglio ringrazia.' };
  return { name: 'Buon compromesso', emoji: '👌', line: 'Niente di sbagliato, niente di clamoroso: una base solida.' };
}

function verdictText(x, sel) {
  const { overall, tier: _t, errors, diff, c, g, ps5 } = x;
  if (errors && errors.length)
    return 'Con questa combinazione il PC non si può assemblare: correggi le incompatibilità qui sotto e rivalutiamo.';
  const t = tier(overall).key;
  const lines = {
    top: 'Una build di livello altissimo: per i tuoi usi non manca nulla. Occhio solo a non pagare di più di quello che serve.',
    great: 'Una build molto convincente: gioca, registra e monta senza impegnare il PC. Tra le migliori che puoi comporre con questo budget.',
    good: 'Una build solida: copre quasi tutto bene, con qualche compromesso da conoscere (vedi i pareri).',
    mid: 'Una build sufficiente: funziona, ma alcuni usi sono tirati. Sposta qualche euro dove serve di più.',
    low: 'Una build debole per gli usi che hai scelto: serve un salto di qualità su più componenti.',
  };
  return lines[t];
}

/* ---------- suggerimenti: dove risparmiare / dove investire ---------- */
function suggestions(build, mode, budget, uses, current) {
  const out = [];
  CATS.forEach(ct => {
    ITEMS[ct.key].forEach(alt => {
      if (alt.id === build[ct.key]) return;
      const nb = { ...build, [ct.key]: alt.id };
      const ev = evaluate(nb, mode, budget, uses);
      if (ev.errors.length > current.errors.length) return;
      out.push({
        cat: ct, item: alt,
        nErr: ev.errors.length,
        dPrice: ev.total - current.total,
        dScore: ev.overall - current.overall,
      });
    });
  });
  if (current.errors.length) {
    const fixes = out.filter(o => o.nErr < current.errors.length).sort((a, b) => a.dPrice - b.dPrice).slice(0, 4);
    return { saves: [], ups: [], fixes };
  }
  const saves = out.filter(o => o.dPrice <= -40 && o.dScore >= -4)
    .sort((a, b) => (b.dScore + -b.dPrice / 60) - (a.dScore + -a.dPrice / 60)).slice(0, 3);
  const left = budget - current.total;
  const ups = out.filter(o => o.dPrice > 0 && o.dScore >= 1 && (left <= 0 ? false : o.dPrice <= left))
    .sort((a, b) => b.dScore / b.dPrice - a.dScore / a.dPrice).slice(0, 3);
  return { saves, ups, fixes: [] };
}

if (typeof module !== 'undefined') module.exports = { evaluate, buildTotal, suggestions };
