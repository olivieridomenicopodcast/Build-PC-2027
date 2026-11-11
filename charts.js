/* ============================================================
   GRAFICI SVG fatti a mano (nessuna libreria)
   ============================================================ */

const scoreColor = s => (s >= 85 ? '#34d399' : s >= 70 ? '#a3e635' : s >= 55 ? '#fbbf24' : s >= 40 ? '#fb923c' : '#f87171');

/* ---------- Gauge circolare ---------- */
function gaugeSvg(score, color, label) {
  const r = 54, C = 2 * Math.PI * r, off = C * (1 - score / 100);
  return `<svg class="gauge" viewBox="0 0 140 140" role="img" aria-label="Punteggio ${score} su 100">
    <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"/>
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="url(#gg)" stroke-width="12" stroke-linecap="round"
      stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 70 70)" class="gauge-arc"/>
    <text x="70" y="70" text-anchor="middle" class="g-num" fill="#fff">${score}</text>
    <text x="70" y="92" text-anchor="middle" class="g-lbl">${label}</text>
  </svg>`;
}

/* ---------- Radar sugli usi ---------- */
function radarSvg(scores, selected) {
  const cx = 160, cy = 150, R = 100, n = USES.length;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)];
  };
  let grid = '';
  [25, 50, 75, 100].forEach(l => {
    grid += `<polygon points="${USES.map((_, i) => pt(i, l).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,${l === 100 ? .18 : .08})"/>`;
  });
  let axes = '', labels = '', dots = '';
  USES.forEach((u, i) => {
    const [x, y] = pt(i, 100), [lx, ly] = pt(i, 122);
    const on = selected.includes(u.key);
    axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.08)"/>`;
    const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
    labels += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${anchor}" class="rl ${on ? 'on' : ''}">${u.short}</text>`;
    const [px, py] = pt(i, scores[u.key]);
    dots += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${on ? 4.5 : 3}" fill="${scoreColor(scores[u.key])}" opacity="${on ? 1 : .45}"><title>${u.label}: ${scores[u.key]}/100</title></circle>`;
  });
  const poly = USES.map((u, i) => pt(i, scores[u.key]).map(v => v.toFixed(1)).join(',')).join(' ');
  return `<svg class="radar" viewBox="0 0 320 300" role="img" aria-label="Radar delle prestazioni per uso">
    ${grid}${axes}
    <polygon points="${poly}" fill="rgba(255,79,216,.18)" stroke="#ff4fd8" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labels}
  </svg>`;
}

/* ---------- Ciambella dei costi ---------- */
function donutSvg(build, mode) {
  const parts = CATS.map(c => ({ c, v: price(getItem(c.key, build[c.key]), mode) }));
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  const r = 60, C = 2 * Math.PI * r;
  let acc = 0, segs = '';
  parts.forEach(p => {
    if (p.v <= 0) return;
    const len = (p.v / total) * C;
    segs += `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${p.c.color}" stroke-width="22"
      stroke-dasharray="${Math.max(len - 1.5, 0.1).toFixed(2)} ${(C - Math.max(len - 1.5, 0.1)).toFixed(2)}"
      stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 80 80)"><title>${p.c.label}: ${euro(p.v)}</title></circle>`;
    acc += len;
  });
  const legend = parts.slice().sort((a, b) => b.v - a.v).map(p =>
    `<li><i style="background:${p.c.color}"></i><span>${p.c.label}</span><b>${euro(p.v)}</b><em>${Math.round((p.v / total) * 100)}%</em></li>`).join('');
  return `<div class="donut-wrap">
    <svg class="donut" viewBox="0 0 160 160" role="img" aria-label="Ripartizione del costo">
      ${segs}
      <text x="80" y="76" text-anchor="middle" class="d-lbl">TOTALE</text>
      <text x="80" y="96" text-anchor="middle" class="d-num">${euro(total)}</text>
    </svg>
    <ul class="legend">${legend}</ul>
  </div>`;
}

/* ---------- Dumbbell: obiettivo di budget vs prezzo reale ---------- */
function dumbbellSvg(rows) {
  const W = 800, left = 250, right = 120, rowH = 38, top = 34, min = 1900, max = 2900;
  const H = top + rows.length * rowH + 26;
  const X = v => left + ((v - min) / (max - min)) * (W - left - right);
  let g = '';
  for (let t = min + 100; t <= max; t += 100) {
    g += `<line x1="${X(t)}" y1="${top - 8}" x2="${X(t)}" y2="${H - 22}" stroke="rgba(255,255,255,${t % 500 === 0 ? .14 : .05})"/>`;
    if (t % 200 === 0 || t === 2500) g += `<text x="${X(t)}" y="${H - 6}" text-anchor="middle" class="ax">${t.toLocaleString('it-IT')}</text>`;
  }
  // fascia budget 2000-2500
  g += `<rect x="${X(2000)}" y="${top - 8}" width="${X(2500) - X(2000)}" height="${H - top - 14}" fill="rgba(34,211,238,.07)"/>
        <text x="${X(2250)}" y="${top - 14}" text-anchor="middle" class="ax cy">fascia 2.000-2.500 €</text>`;
  rows.forEach((r, i) => {
    const y = top + i * rowH + 14;
    const over = r.total > r.budget;
    g += `<text x="${left - 14}" y="${y + 4}" text-anchor="end" class="rw">${r.label}</text>`;
    g += `<line x1="${X(Math.min(r.budget, r.total))}" y1="${y}" x2="${X(Math.max(r.budget, r.total))}" y2="${y}" stroke="${over ? '#f87171' : '#34d399'}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    g += `<circle cx="${X(r.budget)}" cy="${y}" r="6" fill="#0a0b14" stroke="#22d3ee" stroke-width="2.5"><title>Obiettivo: ${euro(r.budget)}</title></circle>`;
    g += `<circle cx="${X(r.total)}" cy="${y}" r="7" fill="${r.color}"><title>Totale: ${euro(r.total)}</title></circle>`;
    const dx = r.total - r.budget;
    g += `<text x="${X(Math.max(r.budget, r.total)) + 14}" y="${y + 4}" class="dv ${over ? 'over' : 'ok'}">${euro(r.total)} (${dx > 0 ? '+' : '−'}${Math.abs(Math.round(dx))})</text>`;
  });
  return `<svg class="dumb" viewBox="0 0 ${W} ${H}" role="img" aria-label="Prezzo reale delle build rispetto al budget">${g}</svg>`;
}

/* ---------- Il PC, illustrato ---------- */
function fan(cx, cy, r, color, speed = 1) {
  return `<g class="spin" style="animation-duration:${(2.4 / speed).toFixed(2)}s">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(0,0,0,.35)" stroke="${color}" stroke-width="2.2"/>
    ${[0, 60, 120].map(a => `<line x1="${cx - r * .8}" y1="${cy}" x2="${cx + r * .8}" y2="${cy}" stroke="${color}" stroke-width="3.2" stroke-linecap="round" opacity=".85" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}
    <circle cx="${cx}" cy="${cy}" r="${Math.max(2, r * .2)}" fill="${color}"/>
  </g>`;
}

function pcSvg(x) {
  const { c, g, r, s, p, k, cs, errors } = x;
  const brand = { AMD: '#ed3b43', NVIDIA: '#76d100', Intel: '#38a3ff' };
  const cpuCol = brand[c.brand] || '#ff4fd8';
  const gpuCol = brand[g.brand] || '#22d3ee';
  const gpuW = 70 + Math.round((g.idx / 100) * 90);          // più grande = più potente
  const hot = clamp((g.tdp - 120) / 240);
  const bad = errors.length > 0;
  const rgb = cs.rgb;
  const frame = bad ? '#f87171' : 'url(#pcrgb)';
  let cooler;
  if (k.type === 'aria') {
    cooler = `<rect x="104" y="48" width="62" height="64" rx="6" fill="#1b2142" stroke="#60a5fa" stroke-width="1.5"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="108" y1="${54 + i * 9}" x2="162" y2="${54 + i * 9}" stroke="rgba(96,165,250,.35)"/>`).join('')}
      ${fan(135, 80, 20, rgb ? '#c084fc' : '#94a3b8', .9)}`;
  } else {
    cooler = `<rect x="62" y="20" width="${k.rad === 360 ? 164 : 112}" height="16" rx="5" fill="#1b2142" stroke="#60a5fa" stroke-width="1.5"/>
      ${(k.rad === 360 ? [78, 144, 210] : [92, 158]).map(cx => fan(cx, 28, 7, '#c084fc', 1.1)).join('')}
      <circle cx="135" cy="80" r="17" fill="#1b2142" stroke="#60a5fa" stroke-width="2"/><circle cx="135" cy="80" r="8" fill="${rgb ? '#c084fc' : '#94a3b8'}" opacity=".8"/>
      <path d="M135 63 C135 50 128 42 120 36 M135 63 C135 50 142 42 150 36" stroke="#60a5fa" stroke-width="3" fill="none" opacity=".7"/>`;
  }
  const sticks = [182, 192, 202, 212].map((xx, i) =>
    `<rect x="${xx}" y="50" width="6" height="64" rx="2" fill="${i < (r.gb >= 64 ? 4 : 2) ? '#fbbf24' : '#252b4d'}" ${i < (r.gb >= 64 ? 4 : 2) ? 'class="led"' : ''}/>`).join('');
  const fanCol = rgb ? '#22d3ee' : '#94a3b8';
  return `<svg class="pc" viewBox="0 0 260 300" role="img" aria-label="Illustrazione della build">
    <defs>
      <linearGradient id="pcrgb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff4fd8"><animate attributeName="stop-color" values="#ff4fd8;#22d3ee;#34d399;#fbbf24;#ff4fd8" dur="8s" repeatCount="indefinite"/></stop>
        <stop offset="1" stop-color="#22d3ee"><animate attributeName="stop-color" values="#22d3ee;#34d399;#fbbf24;#ff4fd8;#22d3ee" dur="8s" repeatCount="indefinite"/></stop>
      </linearGradient>
      <radialGradient id="gpuglow"><stop offset="0" stop-color="${gpuCol}" stop-opacity=".55"/><stop offset="1" stop-color="${gpuCol}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="16" y="6" width="228" height="288" rx="16" fill="#0c0e1d" stroke="${frame}" stroke-width="3"/>
    <rect x="24" y="14" width="212" height="214" rx="10" fill="#080a16"/>
    <!-- ventole frontali -->
    ${[62, 120, 178].map(cy => fan(44, cy, 14, fanCol, .8)).join('')}
    <!-- scheda madre -->
    <rect x="72" y="22" width="156" height="196" rx="6" fill="#161a33" stroke="rgba(255,255,255,.1)"/>
    <rect x="${k.type === 'aria' ? 112 : 117}" y="${k.type === 'aria' ? 56 : 62}" width="40" height="36" rx="4" fill="${cpuCol}" opacity="${k.type === 'aria' ? 0 : .9}"/>
    ${cooler}
    ${sticks}
    <rect x="82" y="124" width="46" height="8" rx="3" fill="#34d399" opacity=".9"/>
    <rect x="132" y="124" width="12" height="8" rx="3" fill="#34d399" opacity=".4"/>
    <!-- GPU -->
    <ellipse cx="${72 + gpuW / 2}" cy="170" rx="${gpuW / 2 + 12}" ry="30" fill="url(#gpuglow)" opacity="${.45 + hot * .5}"/>
    <rect x="72" y="152" width="${gpuW}" height="36" rx="6" fill="#10142b" stroke="${gpuCol}" stroke-width="2"/>
    ${gpuW > 120 ? fan(72 + gpuW * .22, 170, 13, gpuCol, 1.2) : ''}
    ${fan(72 + gpuW * .5, 170, 13, gpuCol, 1.2)}
    ${gpuW > 100 ? fan(72 + gpuW * .78, 170, 13, gpuCol, 1.2) : ''}
    <!-- PSU -->
    <rect x="24" y="236" width="212" height="50" rx="8" fill="#12152b" stroke="rgba(255,255,255,.12)"/>
    <circle cx="62" cy="261" r="16" fill="none" stroke="${p.w >= 850 ? '#fb923c' : '#94a3b8'}" stroke-width="2" stroke-dasharray="4 4" class="spin-slow"/>
    <text x="130" y="258" fill="#fff" class="pc-t">${p.w} W</text>
    <text x="130" y="274" fill="#94a3b8" class="pc-s">${p.qual}</text>
    ${bad ? `<g><rect x="60" y="100" width="140" height="34" rx="8" fill="#7f1d1d" stroke="#f87171"/><text x="130" y="122" text-anchor="middle" fill="#fff" class="pc-t">⚠ Non si assembla</text></g>` : ''}
  </svg>`;
}
