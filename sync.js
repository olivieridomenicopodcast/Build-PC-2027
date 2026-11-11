/* ============================================================
   SYNC con GitHub (Pull / Push) via API contents.
   Il token resta SOLO nel localStorage di questo browser.
   File sincronizzato: stato del builder (build, prezzi, budget, usi).
   ============================================================ */
const SYNC_KEY = 'buildpc2027_sync';
const SYNC_DEF = { repo: 'olivieridomenicopodcast/build-pc-2027', branch: 'sync-data', path: 'sync/build-pc-state.json', token: '' };
let syncCfg = { ...SYNC_DEF };
try { Object.assign(syncCfg, JSON.parse(localStorage.getItem(SYNC_KEY) || '{}')); } catch (e) { /* ignore */ }
if (syncCfg.branch === 'main' && !syncCfg.v2) { syncCfg.branch = 'sync-data'; }   // vecchio default: il repo non ha un branch main
syncCfg.v2 = true;

const b64enc = s => btoa(unescape(encodeURIComponent(s)));
const b64dec = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));
const syncSave = () => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(syncCfg)); } catch (e) { /* ignore */ } };

function syncSetMsg(text, kind = '') {
  const el = document.getElementById('sync-msg');
  if (el) { el.textContent = text; el.className = 'sync-msg ' + kind; }
}
function syncReadForm() {
  syncCfg.token = document.getElementById('sync-token').value.trim();
  syncCfg.repo = document.getElementById('sync-repo').value.trim();
  syncCfg.branch = document.getElementById('sync-branch').value.trim() || 'main';
  syncCfg.path = document.getElementById('sync-path').value.trim();
  syncSave();
}
function syncUrl() {
  const p = syncCfg.path.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${syncCfg.repo}/contents/${p}`;
}
const encPath = p => p.split('/').map(encodeURIComponent).join('/');
const API = () => `https://api.github.com/repos/${syncCfg.repo}`;
const syncHeaders = () => ({ Authorization: 'Bearer ' + syncCfg.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });

/* Il branch dei dati viene creato da solo (dal branch predefinito del repo) al primo Push. */
async function syncEnsureBranch() {
  const h = syncHeaders();
  let r = await fetch(`${API()}/branches/${encPath(syncCfg.branch)}`, { headers: h, cache: 'no-store' });
  if (r.ok) return;
  if (r.status !== 404) throw await syncErr(r);
  r = await fetch(API(), { headers: h }); if (!r.ok) throw await syncErr(r);
  const def = (await r.json()).default_branch;
  r = await fetch(`${API()}/git/ref/heads/${encPath(def)}`, { headers: h }); if (!r.ok) throw await syncErr(r);
  const sha = (await r.json()).object.sha;
  r = await fetch(`${API()}/git/refs`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: 'refs/heads/' + syncCfg.branch, sha }) });
  if (!r.ok) throw await syncErr(r);
}

async function syncRemote() {          // -> {sha, data} oppure null se il file non esiste
  const r = await fetch(`${syncUrl()}?ref=${encodeURIComponent(syncCfg.branch)}`, { headers: syncHeaders(), cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw await syncErr(r);
  const j = await r.json();
  return { sha: j.sha, data: JSON.parse(b64dec(j.content)) };
}
async function syncErr(r) {
  const map = { 401: 'Token non valido o scaduto.', 403: 'Token senza permessi (serve «Contents: read & write» sul repo).', 404: 'Repo non trovato: controlla il nome e che il token abbia accesso a quel repo.', 409: 'Conflitto: fai prima un Pull.', 422: 'Richiesta rifiutata da GitHub (branch inesistente?).' };
  let d = ''; try { d = (await r.json()).message || ''; } catch (e) { /* ignore */ }
  return new Error((map[r.status] || 'Errore GitHub ' + r.status) + (d ? ' (' + d + ')' : ''));
}
function syncGuard() {
  syncReadForm();
  if (!syncCfg.token) { syncSetMsg('Incolla prima il token.', 'err'); return false; }
  if (!/^[\w.-]+\/[\w.-]+$/.test(syncCfg.repo) || !syncCfg.path) { syncSetMsg('Controlla repo (owner/nome) e percorso del file.', 'err'); return false; }
  return true;
}

async function syncPull() {
  if (!syncGuard()) return;
  syncSetMsg('Pull in corso…', 'wait');
  try {
    const rem = await syncRemote();
    if (!rem) return syncSetMsg('Nessun dato salvato sul branch «' + syncCfg.branch + '»: fai prima un Push.', 'err');
    const s = rem.data.state || {}, ids = s.build || {};
    if (!CATS.every(c => getItem(c.key, ids[c.key]))) throw new Error('File sul repo non valido.');
    CATS.forEach(c => (state.build[c.key] = ids[c.key]));
    if (['A', 'B'].includes(s.mode)) state.mode = s.mode;
    if (s.budget >= 1000 && s.budget <= 5000) state.budget = s.budget;
    const u = (s.uses || []).filter(k => USES.some(x => x.key === k));
    if (u.length) state.uses = u;
    state.profile = Object.keys(PROFILES).find(k => PROFILES[k].uses.join() === state.uses.join()) || 'custom';
    if (typeof s.ext === 'boolean') { state.ext = s.ext; ENGINE_OPTS.ext = s.ext; }
    if (rem.data.cmp && Array.isArray(rem.data.cmp.cands)) { Object.assign(cmp, rem.data.cmp); cmp.edit = null; cmpSave(); }
    if (rem.data.dual) { dual.checked = rem.data.dual.checked || {}; Object.assign(dual.names, rem.data.dual.names || {}); dualSave(); }
    saveState(); showTab(['dual', 'cmp'].includes(state.tab) ? state.tab : 'builder', false);
    syncSetMsg('Pull completato ✓ (salvato il ' + new Date(rem.data.savedAt).toLocaleString('it-IT') + ')', 'ok');
  } catch (e) { syncSetMsg(e.message, 'err'); }
}

async function syncPush() {
  if (!syncGuard()) return;
  syncSetMsg('Push in corso…', 'wait');
  try {
    await syncEnsureBranch();
    const rem = await syncRemote();
    const payload = { app: 'build-pc-2027', build: APP_BUILD, savedAt: new Date().toISOString(),
      state: { build: state.build, mode: state.mode, budget: state.budget, uses: state.uses, ext: state.ext },
      cmp: cmpData(),
      dual: { checked: dual.checked, names: dual.names } };
    const body = { message: 'Sync build PC dal browser', branch: syncCfg.branch, content: b64enc(JSON.stringify(payload, null, 2) + '\n') };
    if (rem) body.sha = rem.sha;
    const r = await fetch(syncUrl(), { method: 'PUT', headers: { ...syncHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw await syncErr(r);
    syncSetMsg('Push completato ✓', 'ok');
  } catch (e) { syncSetMsg(e.message, 'err'); }
}

function openSync() {
  const d = document.getElementById('sync-dlg');
  document.getElementById('sync-token').value = syncCfg.token;
  document.getElementById('sync-repo').value = syncCfg.repo;
  document.getElementById('sync-branch').value = syncCfg.branch;
  document.getElementById('sync-path').value = syncCfg.path;
  syncSetMsg('');
  d.showModal ? d.showModal() : d.setAttribute('open', '');
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-sync]');
  if (!t) return;
  const a = t.dataset.sync;
  if (a === 'open') openSync();
  else if (a === 'close') document.getElementById('sync-dlg').close();
  else if (a === 'pull') syncPull();
  else if (a === 'push') syncPush();
  else if (a === 'forget') { syncCfg.token = ''; document.getElementById('sync-token').value = ''; syncSave(); syncSetMsg('Token rimosso da questo browser.', 'ok'); }
});
