/* ============================================================
   APP: stato, viste, eventi
   ============================================================ */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

const state = {
  tab: 'riepilogo',
  build: { ...PRESETS.find(p => p.id === 'b9070').build },
  mode: 'B',
  budget: 2500,
  profile: 'niky',
  uses: [...PROFILES.niky.uses],
};

const EMOJI_TONE = { bad: '⛔', warn: '⚠️', tip: '💡', info: 'ℹ️', good: '✅' };
const ERR_SHORT = { socket: 'Socket diverso', form: 'Non entra nel case', 'cooler-h': 'Troppo alto per il case', 'cooler-rad': 'Radiatore troppo grande', psu: 'Watt insufficienti' };

const evalNow = () => evaluate(state.build, state.mode, state.budget, state.uses);

/* ---------- persistenza (URL + localStorage) ---------- */
function encodeState() {
  const p = new URLSearchParams();
  p.set('t', state.tab);
  p.set('b', CATS.map(c => state.build[c.key]).join(','));
  p.set('m', state.mode);
  p.set('bd', state.budget);
  p.set('u', state.uses.join(','));
  return p.toString();
}
function saveState() {
  const q = encodeState();
  try { history.replaceState(null, '', '#' + q); } catch (e) { /* ignore */ }
  try { localStorage.setItem('buildpc2027', q); } catch (e) { /* ignore */ }
}
function loadState() {
  let q = location.hash.slice(1);
  if (!q) { try { q = localStorage.getItem('buildpc2027') || ''; } catch (e) { q = ''; } }
  if (!q) return;
  const p = new URLSearchParams(q);
  const ids = (p.get('b') || '').split(',');
  if (ids.length === CATS.length && CATS.every((c, i) => getItem(c.key, ids[i])))
    CATS.forEach((c, i) => (state.build[c.key] = ids[i]));
  if (['A', 'B'].includes(p.get('m'))) state.mode = p.get('m');
  const bd = +p.get('bd'); if (bd >= 1000 && bd <= 5000) state.budget = bd;
  const u = (p.get('u') || '').split(',').filter(k => USES.some(x => x.key === k));
  if (u.length) { state.uses = u; state.profile = Object.keys(PROFILES).find(k => PROFILES[k].uses.join() === u.join()) || 'custom'; }
  if (['riepilogo', 'builder', 'mercato'].includes(p.get('t'))) state.tab = p.get('t');
}

/* ============================================================
   RIEPILOGO
   ============================================================ */
function scoreCell(v) {
  const hue = Math.round((clamp(v) / 100) * 130);
  return `<td class="sc" style="background:hsla(${hue},70%,45%,.22);color:hsl(${hue},80%,72%)">${v}</td>`;
}

function renderRiepilogo() {
  const evs = PRESETS.map(pr => ({ pr, ev: evaluate(pr.build, pr.src, pr.budget, PROFILES.niky.uses) }));
  const rows = evs.map(({ pr, ev }) => ({
    label: pr.src === 'B' ? pr.title.replace('Niky con ', 'Niky · ') : `${pr.budget} € · ${pr.title}`.replace('2500 € · Alternativa RTX 5070 Ti', '2500 € · alt. RTX 5070 Ti'),
    budget: pr.budget, total: ev.total, color: scoreColor(ev.overall),
  }));

  const take = [
    ['🧠', 'La RAM è un terzo del conto', 'Un kit 32 GB DDR5-6000 costa ~680 € in Italia (ott 2025: ~100-200 $). Crisi DRAM per la domanda di server e AI: nessun calo previsto prima del 2027.'],
    ['🎮', 'RX 9070 XT, la scelta giusta', 'Costa molto meno della RTX 5070 Ti (1.150-1.500 €, spesso introvabile): per 2000-2500 € la Nvidia è fuori portata. Va bene su DaVinci Resolve e Premiere.'],
    ['🧾', 'Nessuna build della consulenza rientra', 'Con i prezzi del 27 ottobre le sei build sforano di 60-240 €, soprattutto per la RAM. Sotto i 2.200 € bisognerebbe rinunciare alla 9070 XT.'],
    ['✅', 'La build Niky ci sta (2.310 €)', 'Il PDF del 15 ottobre: 9800X3D + RX 9070 liscia + 32 GB + 2 TB = 2.310 €, con ~190 € di margine. In Full HD la 9070 va quasi quanto la XT.'],
    ['🎙️', 'Attenzione al rumore', 'Per registrare: frontale forato = più aria ma più rumore. Ventole lente da 140 mm, curva gentile e PC lontano dal microfono.'],
    ['🔮', 'GTA 6 e il futuro', 'Su console esce il 19 novembre 2026, su PC solo previsioni fine 2027-2028. Una GPU da 16 GB è la scelta più sicura, e potrai cambiare solo la scheda.'],
  ];

  const card = ({ pr, ev }) => `
    <article class="pcard">
      <header>
        <span class="chip src-${pr.src}">${pr.src === 'A' ? 'Consulenza 27 ott' : 'Build Niky 15 ott'}</span>
        <h4>${esc(pr.title)}</h4>
      </header>
      <ul class="spec">
        <li><span>CPU</span>${esc(ev.c.name)}</li>
        <li><span>GPU</span>${esc(ev.g.name.replace(/ 16 GB| 12 GB/, ''))}</li>
        <li><span>RAM</span>${ev.r.gb} GB</li>
        <li><span>SSD</span>${ev.s.tb} TB</li>
      </ul>
      <div class="pc-foot">
        <div><b class="big">${euro(ev.total)}</b><small>${pr.budget ? 'obiettivo ' + euro(pr.budget) : ''} ${ev.total > pr.budget ? `<em class="over">+${Math.round(ev.total - pr.budget)} €</em>` : `<em class="ok">−${Math.round(pr.budget - ev.total)} €</em>`}</small></div>
        <div class="mini-g" style="--c:${scoreColor(ev.overall)}"><b>${ev.overall}</b><small>${ev.tier.label}</small></div>
      </div>
      <p class="pn">${esc(pr.note)}</p>
      <button class="btn" data-action="open-preset" data-id="${pr.id}">Apri nel builder →</button>
    </article>`;

  const group = src => evs.filter(e => e.pr.src === src).map(card).join('');

  const table = `
    <div class="tbl-wrap"><table class="heat">
      <thead><tr><th>Build</th><th>Totale</th>${USES.map(u => `<th title="${u.label}">${u.short}</th>`).join('')}<th>Voto</th></tr></thead>
      <tbody>${evs.map(({ pr, ev }) => `<tr>
        <th scope="row"><button class="linkbtn" data-action="open-preset" data-id="${pr.id}">${pr.src === 'A' ? pr.budget + ' €' : 'Niky'} · ${esc(pr.title)}</button></th>
        <td class="tot">${euro(ev.total)}</td>
        ${USES.map(u => scoreCell(ev.scores[u.key])).join('')}
        <td class="sc big" style="color:${ev.tier.color}">${ev.overall}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="muted small">Voto calcolato sul profilo «Tuttofare»: Full HD, audio, video, Godot, longevità. L'IA in locale e il 4K non contano (il PDF dice: IA solo online, niente 4K).</p>`;

  $('#view-riepilogo').innerHTML = `
    <div class="hero">
      <div class="hero-txt">
        <span class="chip">Per Niky · aggiornato all'11 novembre 2026</span>
        <h1>Il PC giusto per <em>giocare</em>, <em>registrare</em> e <em>montare</em>.</h1>
        <p>Il riepilogo di 8 build dai tuoi due PDF di consulenza, con prezzi reali del mercato italiano. Poi passa al <b>Builder</b>: scegli ogni componente e il PC ti dice come va, quanto è silenzioso, cosa non si incastra e dove puoi risparmiare.</p>
        <div class="hero-cta">
          <button class="btn primary" data-action="goto" data-tab="builder">Componi la tua build</button>
          <button class="btn" data-action="goto" data-tab="mercato">Prezzi &amp; fonti</button>
        </div>
        <ul class="reqs">
          <li>🎮 Giochi 2026 in Full HD, almeno livello PS5</li><li>🧠 Ryzen 7 + GPU recente 16 GB</li>
          <li>🎙️ Pro Tools, podcast, sound design</li><li>🎬 Video leggeri YouTube</li>
          <li>👾 Godot / GDScript, vibe coding</li><li>💶 Budget 2.000-2.500 €</li>
        </ul>
      </div>
      <div class="hero-pc">${pcSvg(evaluate(PRESETS.find(p => p.id === 'b9070xt').build, 'B', 2500, PROFILES.niky.uses))}</div>
    </div>

    <h2>In sintesi</h2>
    <div class="take">${take.map(t => `<div class="tk"><span class="ic">${t[0]}</span><h3>${t[1]}</h3><p>${t[2]}</p></div>`).join('')}</div>

    <h2>Obiettivo di budget vs prezzo reale</h2>
    <p class="muted">Il cerchio vuoto è il budget, il pieno il totale con i prezzi dei PDF. Rosso = sforamento, verde = dentro.</p>
    <div class="panel">${dumbbellSvg(rows)}</div>

    <h2>Le 8 build</h2>
    <h3 class="sub">Consulenza del 27 ottobre — prezzi reali, 9070 XT, B650, 850 W, case RGB</h3>
    <div class="cards">${group('A')}</div>
    <h3 class="sub">Build Niky del 15 ottobre — prezzi indicativi, B850 Wi-Fi, 750 W, NZXT H7 Flow</h3>
    <div class="cards two">${group('B')}</div>

    <h2>La pagella</h2>
    <p class="muted">Ogni build valutata dal motore del builder, uso per uso (0-100).</p>
    <div class="panel flush">${table}</div>

    <h2>Cosa dicono i PDF</h2>
    <div class="two-col">
      <div class="panel"><h3>Conclusioni</h3><ul class="ul">
        <li><b>Nessuna build rientra nel budget</b> coi prezzi di ottobre: sforamento di 60-240 €, dovuto soprattutto alla RAM (~680 €, circa un terzo del totale).</li>
        <li>Per stare nei budget bassi (2000-2200) la leva sensata è la GPU: la <b>RX 9070 liscia</b>.</li>
        <li>Non scendere a 16 GB di RAM. Il 9800X3D costa ~110 € più del 9700X: per i video, un 9700X con SSD da 2 TB è più utile.</li>
        <li>Con ~2500 € la build 9800X3D + RX 9070 XT + 32 GB + 2 TB è quasi alla portata; sotto 2200 € bisogna rinunciare alla 9070 XT.</li>
        <li>La tua GTX 1660 Super (6 GB) è il motivo dei lag con Hogwarts Legacy, Arc Raiders e AION 2.</li>
      </ul></div>
      <div class="panel"><h3>Prossimi passi</h3><ul class="ul">
        <li>Rifare la ricerca dei prezzi italiani per RX 9070 liscia, SSD, alimentatore e case, per eliminare le stime.</li>
        <li>Ricontrollare i prezzi prima di acquistare: <b>Black Friday (27 novembre)</b> può aiutare su GPU e SSD, non sulla RAM.</li>
        <li>Se vuoi risparmiare ~100 €: SSD da 1 TB ora, secondo disco più avanti.</li>
        <li>Con le NVIDIA: tutto il resto invariato, cambi solo la scheda quando GTA 6 arriverà su PC.</li>
      </ul>
      <button class="btn primary" data-action="goto" data-tab="builder">Prova a cambiare i pezzi →</button></div>
    </div>`;
}

/* ============================================================
   MERCATO
   ============================================================ */
function renderMercato() {
  const badge = v => `<span class="vs ${v}" title="${v === 'V' ? 'Verificato su listini italiani' : 'Stima o dato non verificato'}">${v}</span>`;
  $('#view-mercato').innerHTML = `
    <div class="head"><span class="chip">Fonti: due PDF · ottobre 2026</span><h1>Prezzi &amp; mercato</h1>
      <p class="muted">Due fotografie del mercato italiano, a distanza di 12 giorni. Il builder può usare l'una o l'altra (interruttore «Prezzi» nel Builder).</p></div>

    <div class="legend-vs"><span>${badge('V')} verificato su listini italiani (Trovaprezzi/negozi) il 27/10/2026</span><span>${badge('S')} stima o dato non datato/non italiano: non verificato</span></div>

    <h2>Consulenza del 27 ottobre — prezzi reali</h2>
    <div class="panel flush"><div class="tbl-wrap"><table class="plain">
      <thead><tr><th>Componente</th><th class="r">Prezzo</th><th>Stato</th><th>Fonte</th></tr></thead>
      <tbody>${PDF_A_TABLE.map(r => `<tr><td>${esc(r[0])}</td><td class="r"><b>${esc(r[1])}</b></td><td>${badge(r[2])}</td><td class="muted">${esc(r[3])}</td></tr>`).join('')}</tbody></table></div></div>

    <h2>Build Niky del 15 ottobre — prezzi indicativi</h2>
    <div class="panel flush"><div class="tbl-wrap"><table class="plain">
      <thead><tr><th>Componente</th><th>Modello consigliato</th><th class="r">Stima</th><th class="r">Intervallo</th></tr></thead>
      <tbody>${PDF_B_TABLE.map((r, i) => `<tr class="${i >= 9 ? 'sum' : ''}"><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="r"><b>${esc(r[2])}</b></td><td class="r muted">${esc(r[3])}</td></tr>`).join('')}</tbody></table></div></div>
    <p class="muted small">Le stime sono valori centrali realistici; l'intervallo va dal prezzo più basso trovato a quello tipico dei modelli più comuni.</p>

    <h2>Da tenere d'occhio</h2>
    <div class="take">
      <div class="tk"><span class="ic">📈</span><h3>RAM e GPU stanno rincarando</h3><p>Crisi DRAM per la domanda di server/AI. In Francia la RAM è +4,8% in 30 giorni. Ricontrolla i prezzi su Trovaprezzi prima di acquistare.</p></div>
      <div class="tk"><span class="ic">🎮</span><h3>GTA 6 su PC</h3><p>Al 22 luglio 2026 non era stata annunciata. Il gioco esce su console il 19 novembre 2026; il PC è stimato tra fine 2027 e 2028 (solo previsione). Una GPU da 16 GB è la scelta più sicura.</p></div>
      <div class="tk"><span class="ic">🛍️</span><h3>Black Friday</h3><p>Il 27 novembre può aiutare su GPU e SSD, non sulla RAM.</p></div>
      <div class="tk"><span class="ic">⚠️</span><h3>Dati non datati</h3><p>Alcuni prezzi arrivano da fonti non datate o di mesi fa: vanno considerati orientativi.</p></div>
    </div>

    <h2>Fonti principali</h2>
    <div class="panel"><ul class="ul small">${FONTI.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
}

/* ============================================================
   BUILDER
   ============================================================ */
function renderControls() {
  $('#b-controls').innerHTML = `
    <div class="head"><h1>Builder</h1><p class="muted">Scegli ogni componente: il verdetto in basso si aggiorna da solo.</p></div>
    <div class="ctrl panel">
      <label class="field"><span>Parti da una build dei PDF</span>
        <select data-action="preset">
          <option value="">— build personalizzata —</option>
          ${['A', 'B'].map(src => `<optgroup label="${SOURCES[src].label}">${PRESETS.filter(p => p.src === src).map(p =>
            `<option value="${p.id}">${p.src === 'A' ? p.budget + ' € · ' : ''}${esc(p.title)}</option>`).join('')}</optgroup>`).join('')}
        </select></label>
      <div class="field"><span>Prezzi</span>
        <div class="seg">
          <button class="${state.mode === 'A' ? 'on' : ''}" data-action="mode" data-mode="A" title="${SOURCES.A.price}">27 ott · reali</button>
          <button class="${state.mode === 'B' ? 'on' : ''}" data-action="mode" data-mode="B" title="${SOURCES.B.price}">15 ott · stime</button>
        </div></div>
      <label class="field"><span>Budget: <b id="budget-v">${euro(state.budget)}</b></span>
        <input type="range" min="1500" max="3500" step="50" value="${state.budget}" data-action="budget" aria-label="Budget"></label>
      <div class="field wide"><span>Cosa farai col PC?</span>
        <div class="chips">
          ${Object.entries(PROFILES).map(([k, v]) => `<button class="chip-b ${state.profile === k ? 'on' : ''}" data-action="profile" data-profile="${k}">${v.label}</button>`).join('')}
        </div>
        <div class="chips uses">
          ${USES.map(u => `<button class="chip-b sm ${state.uses.includes(u.key) ? 'on' : ''}" data-action="use" data-use="${u.key}" aria-pressed="${state.uses.includes(u.key)}">${u.icon} ${u.label}</button>`).join('')}
        </div></div>
      <div class="field actions">
        <button class="btn" data-action="copy">🔗 Copia link</button>
        <button class="btn" data-action="reset">↺ Reset</button>
      </div>
    </div>`;
  const sel = $('#b-controls select');
  const pm = PRESETS.find(p => CATS.every(c => p.build[c.key] === state.build[c.key]));
  if (sel) sel.value = pm ? pm.id : '';
}

function renderPickers() {
  const cur = evalNow();
  const curKeys = new Set(cur.errors.map(e => e.key));
  const curPrice = {};
  CATS.forEach(c => (curPrice[c.key] = price(getItem(c.key, state.build[c.key]), state.mode)));

  $('#b-pickers').innerHTML = CATS.map(ct => {
    const selId = state.build[ct.key];
    const selItem = getItem(ct.key, selId);
    const opts = ITEMS[ct.key].map(it => {
      const nb = { ...state.build, [ct.key]: it.id };
      const ev = evaluate(nb, state.mode, state.budget, state.uses);
      const newErr = ev.errors.find(e => !curKeys.has(e.key));
      const d = price(it, state.mode) - curPrice[ct.key];
      const pr = price(it, state.mode);
      return `<button class="opt ${it.id === selId ? 'sel' : ''} ${newErr ? 'inc' : ''}" data-action="pick" data-cat="${ct.key}" data-id="${it.id}" aria-pressed="${it.id === selId}">
        <span class="o-top"><b>${esc(it.name)}</b></span>
        <span class="o-spec">${esc(it.spec)}</span>
        <span class="o-bot">
          <span class="o-price">${pr === 0 ? 'già tua' : euro(pr)} <i class="vs ${it.v}" title="${it.v === 'V' ? 'Prezzo verificato' : 'Prezzo stimato'}">${it.v}</i></span>
          ${it.id === selId ? '<span class="o-tag sel">scelto</span>' : newErr ? `<span class="o-tag bad">⚠ ${ERR_SHORT[newErr.key]}</span>` : `<span class="o-d ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d === 0 ? '' : (d > 0 ? '+' : '−') + Math.abs(Math.round(d)) + ' €'}</span>`}
        </span></button>`;
    }).join('');
    return `<section class="cat" id="cat-${ct.key}" style="--cc:${ct.color}">
      <h3><span class="ic">${ct.icon}</span>${ct.label}<small>${esc(selItem.name)}</small></h3>
      <div class="opts">${opts}</div>
      <p class="onote"><b>Parere:</b> ${esc(selItem.note)}</p>
    </section>`;
  }).join('');
}

function renderSide() {
  const ev = evalNow();
  const over = ev.diff > 0;
  const pct = clamp((ev.total / state.budget) * 100, 0, 130);
  $('#b-side').innerHTML = `
    <div class="panel side-in">
      <div class="arch"><span class="arch-e">${ev.archetype.emoji}</span><div><b>${esc(ev.archetype.name)}</b><small>${esc(ev.archetype.line)}</small></div></div>
      <div class="side-pc">${pcSvg(ev)}</div>
      <div class="side-g">${gaugeSvg(ev.overall, ev.tier.color, ev.tier.label)}</div>
      <div class="meter">
        <div class="m-row"><span>Totale</span><b>${euro(ev.total)}</b></div>
        <div class="bar"><i style="width:${Math.min(pct, 100)}%;background:${over ? 'linear-gradient(90deg,#fb923c,#f87171)' : 'linear-gradient(90deg,#22d3ee,#34d399)'}"></i>${pct > 100 ? `<i class="ov" style="left:${(100 / pct) * 100}%;width:${100 - (100 / pct) * 100}%"></i>` : ''}</div>
        <div class="m-row small ${over ? 'over' : 'ok'}"><span>${over ? 'Sopra il budget' : 'Dentro il budget'}</span><b>${over ? '+' : '−'}${euro(Math.abs(ev.diff))}</b></div>
      </div>
      <a class="btn primary full" href="#verdetto" data-action="scroll">Vai al verdetto ↓</a>
    </div>`;
  const mb = $('#mobilebar');
  mb.hidden = state.tab !== 'builder';
  mb.innerHTML = `<div><small>Totale</small><b class="${over ? 'over' : ''}">${euro(ev.total)}</b></div>
    <div class="mb-g" style="--c:${ev.tier.color}"><b>${ev.overall}</b><small>${ev.tier.label}</small></div>
    <a class="btn primary" href="#verdetto" data-action="scroll">Verdetto</a>`;
}

function renderVerdict() {
  const ev = evalNow();
  const sg = suggestions(state.build, state.mode, state.budget, state.uses, ev);
  const sugRow = (o, kind) => `<li><button class="sug" data-action="pick" data-cat="${o.cat.key}" data-id="${o.item.id}">
      <span class="ic">${o.cat.icon}</span>
      <span class="sg-t"><b>${esc(o.item.name)}</b><small>${o.cat.label}</small></span>
      <span class="sg-n ${kind}">${o.dPrice > 0 ? '+' : '−'}${euro(Math.abs(o.dPrice))}<small>${o.dScore > 0 ? '+' : o.dScore < 0 ? '−' : ''}${Math.abs(o.dScore)} punti</small></span></button></li>`;

  const useRows = USES.map(u => {
    const v = ev.scores[u.key], on = state.uses.includes(u.key);
    return `<div class="urow ${on ? '' : 'off'}">
      <div class="u-h"><span>${u.icon} ${u.label}${on ? '' : ' <em>(non selezionato)</em>'}</span><b style="color:${scoreColor(v)}">${v}</b></div>
      <div class="bar sm"><i style="width:${v}%;background:${scoreColor(v)}"></i></div>
      <p>${esc(USE_TEXT[u.key][useBand(v)])}</p></div>`;
  }).join('');

  $('#b-verdict').innerHTML = `
    <h2 id="verdetto">Il verdetto</h2>
    <div class="vhead panel" style="--tc:${ev.tier.color}">
      <div class="vh-g">${gaugeSvg(ev.overall, ev.tier.color, ev.tier.label)}</div>
      <div class="vh-t">
        <span class="chip" style="border-color:${ev.tier.color};color:${ev.tier.color}">${ev.archetype.emoji} ${esc(ev.archetype.name)}</span>
        <h3>${esc(ev.verdict)}</h3>
        <p class="muted">${esc(ev.c.name)} · ${esc(ev.g.name)} · ${ev.r.gb} GB · ${ev.s.tb} TB — ${euro(ev.total)}</p>
        <ul class="facts">
          <li><b>${ev.ps5}×</b><span>potenza GPU di una PS5</span></li>
          <li><b>${ev.sil}</b><span>silenziosità /100</span></li>
          <li><b>~${Math.round(ev.draw)} W</b><span>consumo di picco</span></li>
          <li><b>${euro(ev.total / Math.max(ev.overall, 1) * 10)}</b><span>per 10 punti di voto</span></li>
        </ul>
      </div>
    </div>

    <div class="vgrid">
      <div class="panel"><h3>Radar delle prestazioni</h3><div class="radar-wrap">${radarSvg(ev.scores, state.uses)}</div>
        <p class="muted small">I punti pieni sono gli usi selezionati.</p></div>
      <div class="panel"><h3>Come va, uso per uso</h3><div class="uses-list">${useRows}</div></div>
    </div>

    <div class="vgrid">
      <div class="panel"><h3>I giochi dei tuoi PDF</h3>
        <p class="muted small">Stima in Full HD, impostazioni alte. «Fatica» = sotto lo standard di una build 2026.</p>
        <ul class="games">${ev.games.map(g => `<li><div><b>${esc(g.name)}</b><small>${esc(g.note)}</small></div><span class="pill" style="--pc:${g.status.c}">${g.status.label}</span></li>`).join('')}</ul></div>
      <div class="panel"><h3>Dove vanno i soldi</h3>${donutSvg(state.build, state.mode)}</div>
    </div>

    <div class="panel"><h3>I pareri sulla tua build</h3>
      <ul class="pareri">${ev.pareri.map(p => `<li class="t-${p.tone}"><span class="pe">${EMOJI_TONE[p.tone]}</span><div><b>${esc(p.title)}</b><p>${esc(p.text)}</p></div></li>`).join('')}</ul></div>

    ${sg.fixes.length ? `<div class="panel"><h3>🔧 Per sistemare le incompatibilità</h3><ul class="sugs">${sg.fixes.map(o => sugRow(o, 'up')).join('')}</ul><p class="muted small">Clicca per applicare il cambio che rende la build assemblabile.</p></div>` : `
    <div class="vgrid">
      <div class="panel"><h3>💸 Dove risparmiare</h3>
        ${sg.saves.length ? `<ul class="sugs">${sg.saves.map(o => sugRow(o, 'down')).join('')}</ul><p class="muted small">Cambi che costano pochi punti di voto. Clicca per applicarli.</p>`
          : '<p class="muted">Nessun taglio evidente senza perdere prestazioni: la build è già efficiente.</p>'}</div>
      <div class="panel"><h3>🚀 Dove investire</h3>
        ${sg.ups.length ? `<ul class="sugs">${sg.ups.map(o => sugRow(o, 'up')).join('')}</ul><p class="muted small">Upgrade che stanno nel budget residuo (${euro(Math.max(0, -ev.diff))}).</p>`
          : `<p class="muted">${ev.diff > 0 ? 'Sei già sopra budget: prima i tagli.' : 'Nessun upgrade conveniente nel budget residuo.'}</p>`}</div>
    </div>`}`;
}

function renderBuilder(parts = ['controls', 'pickers', 'side', 'verdict']) {
  if (parts.includes('controls')) renderControls();
  if (parts.includes('pickers')) renderPickers();
  if (parts.includes('side')) renderSide();
  if (parts.includes('verdict')) renderVerdict();
}

/* ============================================================
   NAVIGAZIONE + EVENTI
   ============================================================ */
function showTab(t, scroll = true) {
  state.tab = t;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'view-' + t));
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.toggle('on', b.dataset.tab === t);
    b.setAttribute('aria-selected', b.dataset.tab === t);
  });
  if (t === 'builder') renderBuilder(); else $('#mobilebar').hidden = true;
  if (t === 'riepilogo') renderRiepilogo();
  if (t === 'mercato') renderMercato();
  if (scroll) window.scrollTo({ top: 0 });
  saveState();
}

function setProfile(k) {
  state.profile = k;
  state.uses = [...PROFILES[k].uses];
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-action]');
  if (!t) return;
  if (t.dataset.tab && !t.dataset.action) { e.preventDefault(); showTab(t.dataset.tab); return; }
  const a = t.dataset.action;
  switch (a) {
    case 'goto': showTab(t.dataset.tab); break;
    case 'open-preset': {
      const pr = PRESETS.find(p => p.id === t.dataset.id);
      state.build = { ...pr.build }; state.mode = pr.src; state.budget = pr.budget;
      showTab('builder'); break;
    }
    case 'pick':
      state.build[t.dataset.cat] = t.dataset.id;
      renderBuilder(['controls', 'pickers', 'side', 'verdict']); saveState(); break;
    case 'mode':
      state.mode = t.dataset.mode; renderBuilder(); saveState(); break;
    case 'profile':
      setProfile(t.dataset.profile); renderBuilder(); saveState(); break;
    case 'use': {
      const k = t.dataset.use;
      state.uses = state.uses.includes(k) ? state.uses.filter(x => x !== k) : [...state.uses, k];
      if (!state.uses.length) state.uses = [k];
      state.profile = Object.keys(PROFILES).find(p => PROFILES[p].uses.join() === USES.map(u => u.key).filter(x => state.uses.includes(x)).join() ) || 'custom';
      renderBuilder(); saveState(); break;
    }
    case 'reset':
      state.build = { ...PRESETS.find(p => p.id === 'b9070').build }; state.mode = 'B'; state.budget = 2500; setProfile('niky');
      renderBuilder(); saveState(); break;
    case 'copy': {
      saveState();
      const done = () => { t.textContent = '✓ Link copiato'; setTimeout(() => (t.textContent = '🔗 Copia link'), 1600); };
      (navigator.clipboard ? navigator.clipboard.writeText(location.href).then(done, done) : done()); break;
    }
    case 'scroll':
      e.preventDefault(); document.getElementById('verdetto').scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.action === 'preset' && t.value) {
    const pr = PRESETS.find(p => p.id === t.value);
    state.build = { ...pr.build }; state.mode = pr.src; state.budget = pr.src === 'A' ? Math.max(2000, pr.budget) : 2500;
    renderBuilder(); saveState();
  }
});

document.addEventListener('input', e => {
  if (e.target.dataset.action === 'budget') {
    state.budget = +e.target.value;
    $('#budget-v').textContent = euro(state.budget);
    renderBuilder(['side', 'verdict']); saveState();
  }
});

loadState();
showTab(state.tab, false);

/* ---------- numero di build + ricerca aggiornamenti ---------- */
const ver = { status: 'idle', latest: APP_BUILD };
function renderVer() {
  const s = ver.status;
  const msg = s === 'checking' ? 'Controllo…' : s === 'ok' ? 'Sei aggiornato ✓' : s === 'new' ? `Disponibile la build ${ver.latest}` : s === 'err' ? 'Controllo non riuscito' : '';
  $('#ver').innerHTML = `<span class="ver-n" title="Aggiornata il ${APP_BUILD_DATE}">Build <b>${APP_BUILD}</b></span>
    ${msg ? `<span class="ver-m ${s}">${msg}</span>` : ''}
    ${s === 'new' ? '<button data-action="reload">Aggiorna ora</button>' : `<button data-action="check-update" ${s === 'checking' ? 'disabled' : ''}>↻ Cerca aggiornamenti</button>`}`;
}
async function checkUpdate() {
  ver.status = 'checking'; renderVer();
  try {
    const r = await fetch('version.js?t=' + Date.now(), { cache: 'no-store' });
    const m = /APP_BUILD\s*=\s*(\d+)/.exec(await r.text());
    if (!m) throw new Error('formato');
    ver.latest = +m[1];
    ver.status = ver.latest > APP_BUILD ? 'new' : 'ok';
  } catch (e) { ver.status = 'err'; }
  renderVer();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-action=check-update],[data-action=reload]');
  if (!t) return;
  if (t.dataset.action === 'reload') { saveState(); location.href = location.pathname + '?v=' + ver.latest + location.hash; }
  else checkUpdate();
});
renderVer();
checkUpdate();
