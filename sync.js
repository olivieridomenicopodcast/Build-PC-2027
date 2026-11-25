/* ============================================================
   SYNC con GitHub (Pull / Push), CIFRATO.
   Il repository è pubblico: i dati escono dal telefono solo cifrati
   (AES-GCM) con la password della cassaforte. Token e password
   restano solo in questo browser.
   ============================================================ */
const SYNC_KEY = 'buildpc2027_sync';
const SYNC_DEF = { repo: 'olivieridomenicopodcast/build-pc-2027', branch: 'sync-data', path: 'sync/build-pc-state.enc.json', token: '' };
let syncCfg = { ...SYNC_DEF };
try { Object.assign(syncCfg, JSON.parse(localStorage.getItem(SYNC_KEY) || '{}')); } catch (e) { /* ignore */ }
if (syncCfg.path === 'sync/build-pc-state.json') syncCfg.path = SYNC_DEF.path;     // il vecchio file in chiaro non si usa più
const syncSave = () => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(syncCfg)); } catch (e) { /* ignore */ } };
const SYNC_EXCL = new Set([SYNC_KEY, VAULT_KEY]);

const u8enc = s => b64e(new TextEncoder().encode(s));
const u8dec = s => new TextDecoder().decode(b64d(s));
function syncSetMsg(text, kind = '') { const el = document.getElementById('sync-msg'); if (el) { el.textContent = text; el.className = 'sync-msg ' + kind; } }
function syncReadForm() {
  syncCfg.token = document.getElementById('sync-token').value.trim(); syncCfg.repo = document.getElementById('sync-repo').value.trim();
  syncCfg.branch = document.getElementById('sync-branch').value.trim() || 'sync-data'; syncCfg.path = document.getElementById('sync-path').value.trim(); syncSave();
}
const encPath = p => p.split('/').map(encodeURIComponent).join('/');
const API = () => `https://api.github.com/repos/${syncCfg.repo}`;
const syncUrl = () => `${API()}/contents/${encPath(syncCfg.path)}`;
const syncHeaders = () => ({ Authorization: 'Bearer ' + syncCfg.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });
async function syncErr(r) {
  const map = { 401: 'Token non valido o scaduto.', 403: 'Token senza permessi (serve «Contents: read & write» sul repo).', 404: 'Repo non trovato: controlla il nome e che il token abbia accesso a quel repo.', 409: 'Conflitto: fai prima un Pull.', 422: 'Richiesta rifiutata da GitHub.' };
  let d = ''; try { d = (await r.json()).message || ''; } catch (e) { /* ignore */ }
  return new Error((map[r.status] || 'Errore GitHub ' + r.status) + (d ? ' (' + d + ')' : ''));
}
async function syncEnsureBranch() {
  const h = syncHeaders();
  let r = await fetch(`${API()}/branches/${encPath(syncCfg.branch)}`, { headers: h, cache: 'no-store' });
  if (r.ok) return; if (r.status !== 404) throw await syncErr(r);
  r = await fetch(API(), { headers: h }); if (!r.ok) throw await syncErr(r); const def = (await r.json()).default_branch;
  r = await fetch(`${API()}/git/ref/heads/${encPath(def)}`, { headers: h }); if (!r.ok) throw await syncErr(r); const sha = (await r.json()).object.sha;
  r = await fetch(`${API()}/git/refs`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: 'refs/heads/' + syncCfg.branch, sha }) });
  if (!r.ok) throw await syncErr(r);
}
async function syncRemote() {
  const r = await fetch(`${syncUrl()}?ref=${encodeURIComponent(syncCfg.branch)}`, { headers: syncHeaders(), cache: 'no-store' });
  if (r.status === 404) return null; if (!r.ok) throw await syncErr(r);
  const j = await r.json(); return { sha: j.sha, data: JSON.parse(u8dec(j.content.replace(/\n/g, ''))) };
}
function syncGuard() {
  syncReadForm();
  if (!syncCfg.token) { syncSetMsg('Incolla prima il token.', 'err'); return false; }
  if (!/^[\w.-]+\/[\w.-]+$/.test(syncCfg.repo) || !syncCfg.path) { syncSetMsg('Controlla repo (owner/nome) e percorso del file.', 'err'); return false; }
  return true;
}
function collectStore() {
  const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('buildpc2027') && !SYNC_EXCL.has(k)) o[k] = localStorage.getItem(k); } return o;
}

async function syncPush() {
  if (!syncGuard()) return;
  try {
    syncSetMsg('Sblocco la cassaforte…', 'wait'); document.getElementById('sync-dlg').close();
    const ok = await vault.ensure(); document.getElementById('sync-dlg').showModal();
    if (!ok) return syncSetMsg('Servono la password della cassaforte per cifrare.', 'err');
    syncSetMsg('Cifro e carico…', 'wait');
    await syncEnsureBranch(); const rem = await syncRemote();
    const payload = { app: 'build-pc-2027', build: APP_BUILD, savedAt: new Date().toISOString(), store: collectStore() };
    const file = { fmt: 'enc1', app: 'build-pc-2027', build: APP_BUILD, savedAt: payload.savedAt, salt: vault.meta().salt, ct: await vault.encWith(vault.key, JSON.stringify(payload)) };
    const body = { message: 'Sync dati cifrati', branch: syncCfg.branch, content: u8enc(JSON.stringify(file) + '\n') }; if (rem) body.sha = rem.sha;
    const r = await fetch(syncUrl(), { method: 'PUT', headers: { ...syncHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw await syncErr(r);
    syncSetMsg('Push completato ✓ (dati cifrati)', 'ok');
  } catch (e) { syncSetMsg(e.message, 'err'); }
}

async function syncPull() {
  if (!syncGuard()) return;
  try {
    syncSetMsg('Pull in corso…', 'wait');
    const rem = await syncRemote(); if (!rem) return syncSetMsg('Nessun dato sul branch «' + syncCfg.branch + '»: fai prima un Push.', 'err');
    const d = rem.data;
    if (d.fmt !== 'enc1') return syncSetMsg('Il file sul repository è nel vecchio formato non cifrato: fai prima un Push da un dispositivo con i dati aggiornati.', 'err');
    document.getElementById('sync-dlg').close();
    let key = null, text = null; const m = vault.meta();
    if (m && m.salt === d.salt && vault.key) { key = vault.key; try { text = await vault.decWith(key, d.ct); } catch (e) { key = null; } }
    for (let i = 0; i < 3 && text == null; i++) {
      const p = await askPass(i ? 'Password errata, riprova.' : 'Password della cassaforte con cui hai cifrato i dati.'); if (p == null) break;
      try { key = await vault.derive(p, d.salt); text = await vault.decWith(key, d.ct); } catch (e) { text = null; }
    }
    document.getElementById('sync-dlg').showModal();
    if (text == null) return syncSetMsg('Non riesco a decifrare: password errata o annullato.', 'err');
    if (!confirm('Il Pull sostituisce i dati di questo dispositivo con quelli salvati il ' + new Date(d.savedAt).toLocaleString('it-IT') + '. Continuare?')) return syncSetMsg('Pull annullato.', '');
    if (!m || m.salt !== d.salt) { localStorage.setItem(VAULT_KEY, JSON.stringify({ salt: d.salt, check: await vault.encWith(key, 'ok') })); }
    vault.key = key;
    const payload = JSON.parse(text); Object.entries(payload.store || {}).forEach(([k, v]) => { if (k.startsWith('buildpc2027') && !SYNC_EXCL.has(k)) localStorage.setItem(k, v); });
    syncSetMsg('Pull completato ✓ Ricarico…', 'ok'); setTimeout(() => location.reload(), 600);
  } catch (e) { syncSetMsg(e.message, 'err'); }
}

function openSync() {
  const d = document.getElementById('sync-dlg');
  document.getElementById('sync-token').value = syncCfg.token; document.getElementById('sync-repo').value = syncCfg.repo;
  document.getElementById('sync-branch').value = syncCfg.branch; document.getElementById('sync-path').value = syncCfg.path;
  syncSetMsg(''); d.showModal ? d.showModal() : d.setAttribute('open', '');
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-sync]'); if (!t) return; const a = t.dataset.sync;
  if (a === 'open') openSync(); else if (a === 'close') document.getElementById('sync-dlg').close();
  else if (a === 'pull') syncPull(); else if (a === 'push') syncPush();
  else if (a === 'forget') { syncCfg.token = ''; document.getElementById('sync-token').value = ''; syncSave(); syncSetMsg('Token rimosso da questo browser.', 'ok'); }
});
