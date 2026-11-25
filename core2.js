/* ============================================================
   CORE 2: utilità, cassaforte cifrata (AES-GCM), form generici,
   collezioni salvate nel browser, calendario .ics
   ============================================================ */
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const fmtD = iso => (iso ? new Date(iso + 'T12:00:00').toLocaleDateString('it-IT') : '—');
const addDaysISO = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const addMonthsISO = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
const daysTo = iso => Math.round((new Date(iso + 'T12:00:00') - new Date(todayISO() + 'T12:00:00')) / 86400000);
const euro2 = n => Number(n).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const dueLabel = iso => { const d = daysTo(iso); return d < 0 ? `scaduto da ${-d} g` : d === 0 ? 'oggi' : d === 1 ? 'domani' : `tra ${d} giorni`; };

/* ---------- base64 ---------- */
const b64e = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
const b64d = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

/* ---------- dialog: password ---------- */
function askPass(msg, confirm = false) {
  return new Promise(res => {
    const d = document.getElementById('pass-dlg');
    document.getElementById('pass-msg').textContent = msg;
    const a = document.getElementById('pass-a'), b = document.getElementById('pass-b');
    a.value = ''; b.value = ''; document.getElementById('pass-b-wrap').hidden = !confirm; document.getElementById('pass-err').textContent = '';
    const done = v => { d.close(); cleanup(); res(v); };
    const ok = () => {
      if (confirm) { if (a.value.length < 8) return (document.getElementById('pass-err').textContent = 'Almeno 8 caratteri (meglio 4-5 parole).'); if (a.value !== b.value) return (document.getElementById('pass-err').textContent = 'Le due password non coincidono.'); }
      if (!a.value) return; done(a.value);
    };
    const cancel = () => done(null);
    const cleanup = () => { document.getElementById('pass-ok').onclick = null; document.getElementById('pass-cancel').onclick = null; d.oncancel = null; };
    document.getElementById('pass-ok').onclick = ok; document.getElementById('pass-cancel').onclick = cancel; d.oncancel = e => { e.preventDefault(); cancel(); };
    d.showModal(); a.focus();
  });
}

/* ---------- cassaforte ---------- */
const VAULT_KEY = 'buildpc2027_vault';
const vault = {
  key: null,
  meta() { try { return JSON.parse(localStorage.getItem(VAULT_KEY) || 'null'); } catch (e) { return null; } },
  exists() { return !!this.meta(); },
  async derive(pass, saltB64) {
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64d(saltB64), iterations: 250000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  },
  async encWith(key, text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
    const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return b64e(out);
  },
  async decWith(key, b64) { const buf = b64d(b64); return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12))); },
  async setup(pass, saltB64) {
    const salt = saltB64 || b64e(crypto.getRandomValues(new Uint8Array(16)));
    this.key = await this.derive(pass, salt);
    localStorage.setItem(VAULT_KEY, JSON.stringify({ salt, check: await this.encWith(this.key, 'ok') }));
  },
  async unlock(pass) {
    const m = this.meta(); if (!m) return false;
    try { const k = await this.derive(pass, m.salt); if ((await this.decWith(k, m.check)) !== 'ok') return false; this.key = k; return true; } catch (e) { return false; }
  },
  async ensure() {
    if (this.key) return true;
    if (!this.exists()) {
      const p = await askPass('Crea la password della cassaforte. Cifra i codici e la sincronizzazione. Se la perdi, i dati cifrati NON si recuperano.', true);
      if (!p) return false; await this.setup(p); return true;
    }
    for (let i = 0; i < 3; i++) { const p = await askPass(i ? 'Password errata, riprova.' : 'Inserisci la password della cassaforte.'); if (p == null) return false; if (await this.unlock(p)) return true; }
    return false;
  },
  async enc(text) { if (!(await this.ensure())) throw new Error('Cassaforte non sbloccata'); return 'enc1:' + (await this.encWith(this.key, text)); },
  async dec(val) { if (!(await this.ensure())) throw new Error('Cassaforte non sbloccata'); return this.decWith(this.key, val.replace(/^enc1:/, '')); },
};

/* ---------- form generico ---------- */
function openForm({ title, fields, values = {}, submit = 'Salva' }) {
  return new Promise(res => {
    const d = document.getElementById('form-dlg');
    document.getElementById('form-title').textContent = title;
    document.getElementById('form-ok').textContent = submit;
    const body = document.getElementById('form-body');
    body.innerHTML = fields.map(f => {
      const v = values[f.k] == null ? '' : values[f.k], id = 'ff-' + f.k;
      let inp;
      if (f.type === 'textarea') inp = `<textarea id="${id}" rows="${f.rows || 3}" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>`;
      else if (f.type === 'select') inp = `<select id="${id}">${f.options.map(o => `<option value="${esc(o)}" ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      else if (f.type === 'check') inp = `<label class="chip-b sm tg"><input type="checkbox" id="${id}" ${v ? 'checked' : ''}> ${esc(f.label)}</label>`;
      else if (f.type === 'secret') inp = `<input id="${id}" type="password" autocomplete="off" placeholder="${v ? 'Lascia vuoto per non cambiare' : esc(f.ph || '')}">`;
      else inp = `<input id="${id}" type="${f.type || 'text'}" ${f.step ? `step="${f.step}"` : ''} value="${esc(v)}" placeholder="${esc(f.ph || '')}" autocomplete="off">`;
      return f.type === 'check' ? `<div class="field">${inp}</div>` : `<label class="field"><span>${esc(f.label)}${f.type === 'secret' ? ' 🔒' : ''}</span>${inp}</label>`;
    }).join('');
    const finish = v => { d.close(); form.onsubmit = null; document.getElementById('form-cancel').onclick = null; d.oncancel = null; res(v); };
    const form = document.getElementById('form-form');
    form.onsubmit = e => {
      e.preventDefault(); const out = {};
      for (const f of fields) { const el = document.getElementById('ff-' + f.k); out[f.k] = f.type === 'check' ? el.checked : f.type === 'number' ? (el.value === '' ? '' : +el.value) : el.value.trim(); }
      for (const f of fields) if (f.req && (out[f.k] === '' || out[f.k] == null)) { document.getElementById('form-err').textContent = `Compila: ${f.label}`; return; }
      document.getElementById('form-err').textContent = ''; finish(out);
    };
    document.getElementById('form-cancel').onclick = () => finish(null); d.oncancel = e => { e.preventDefault(); finish(null); };
    document.getElementById('form-err').textContent = ''; d.showModal();
  });
}

/* ---------- collezioni ---------- */
const COLLS = {};   // nome -> { key, fields, title, render }
function coll(name, key, seed) {
  const c = {
    name, key, items: store.get(key, null),
    save() { store.set(key, this.items); },
    all() { return this.items; },
  };
  if (!Array.isArray(c.items)) { c.items = (seed || []).map(x => ({ id: x.id || uid(), ...x })); c.save(); }
  return c;
}
async function encSecretFields(fields, vals, old = {}) {
  for (const f of fields) if (f.type === 'secret') {
    if (vals[f.k]) vals[f.k] = await vault.enc(vals[f.k]); else vals[f.k] = old[f.k] || '';
  }
  return vals;
}
async function collAdd(name) {
  const C = COLLS[name]; const vals = await openForm({ title: 'Aggiungi · ' + C.title, fields: C.fields, values: C.defaults ? C.defaults() : {} }); if (!vals) return;
  try { await encSecretFields(C.fields, vals); } catch (e) { alert('Operazione annullata: la cassaforte non è stata sbloccata.'); return; }
  C.coll.items.push({ id: uid(), ...vals }); C.coll.save(); C.render();
}
async function collEdit(name, id) {
  const C = COLLS[name]; const it = C.coll.items.find(x => x.id === id); if (!it) return;
  const vals = await openForm({ title: 'Modifica · ' + C.title, fields: C.fields, values: it }); if (!vals) return;
  try { await encSecretFields(C.fields, vals, it); } catch (e) { alert('Operazione annullata: la cassaforte non è stata sbloccata.'); return; }
  Object.assign(it, vals); C.coll.save(); C.render();
}
function collDel(name, id) { const C = COLLS[name]; if (!confirm('Eliminare questa voce?')) return; C.coll.items = C.coll.items.filter(x => x.id !== id); C.coll.save(); C.render(); }
async function showSecret(name, id, k, btn) {
  const C = COLLS[name]; const it = C.coll.items.find(x => x.id === id); if (!it || !it[k]) return;
  try { const t = await vault.dec(it[k]); const span = btn.parentElement.querySelector('.sec'); span.textContent = t; btn.textContent = 'Copia'; btn.dataset.copy = t; setTimeout(() => { span.textContent = '••••••'; btn.textContent = 'Mostra'; delete btn.dataset.copy; }, 15000); }
  catch (e) { alert('Non riesco a decifrare (password errata o cassaforte non sbloccata).'); }
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-coll]'); if (!a) return;
  const n = a.dataset.coll, act = a.dataset.act, id = a.dataset.id;
  if (act === 'add') collAdd(n); else if (act === 'edit') collEdit(n, id); else if (act === 'del') collDel(n, id);
  else if (act === 'secret') { if (a.dataset.copy) { navigator.clipboard && navigator.clipboard.writeText(a.dataset.copy); a.textContent = 'Copiato ✓'; } else showSecret(n, id, a.dataset.k, a); }
});
const secretCell = (name, it, k) => (it[k] ? `<span class="secrow"><span class="sec">••••••</span> <button class="linkbtn" data-coll="${name}" data-act="secret" data-id="${it.id}" data-k="${k}">Mostra</button></span>` : '<span class="muted">—</span>');
const rowActs = (name, id) => `<span class="ract"><button class="linkbtn" data-coll="${name}" data-act="edit" data-id="${id}">Modifica</button> · <button class="linkbtn" data-coll="${name}" data-act="del" data-id="${id}">Elimina</button></span>`;

/* ---------- calendario .ics ---------- */
function icsDownload(events, filename) {
  const esc2 = s => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BuildPC2027//IT', 'CALSCALE:GREGORIAN'];
  events.forEach((ev, i) => { const d = ev.date.replace(/-/g, ''), n = addDaysISO(ev.date, 1).replace(/-/g, '');
    L.push('BEGIN:VEVENT', `UID:bpc-${i}-${d}@buildpc2027`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${n}`, `SUMMARY:${esc2(ev.title)}`, ev.note ? `DESCRIPTION:${esc2(ev.note)}` : '', 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc2(ev.title)}`, 'END:VALARM', 'END:VEVENT'); });
  L.push('END:VCALENDAR');
  const blob = new Blob([L.filter(Boolean).join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
