// ═══════════════════════════════════════════════════════
// SYNC · End-to-end-encrypted cloud backup (Supabase + WebCrypto)
//
//   • Password → two keys via PBKDF2+HKDF:
//       authPass  → sent to Supabase as the login secret (server-visible)
//       encKey    → AES-GCM key, NEVER leaves the device
//   • Supabase only ever stores ciphertext → zero-knowledge.
//   • localStorage stays the source of truth (local-first); the cloud is a
//     versioned backup, so a sync bug can never destroy your data.
// ═══════════════════════════════════════════════════════

const SYNC = {
  ready: false,      // logged in + online → pushes allowed
  online: false,
  key: null,         // CryptoKey (AES-GCM)
  token: null,       // Supabase access token
  refreshToken: null,
  email: null,
  timer: null,
  lastHash: null,
};

// Keys that must NEVER be uploaded (device-local / account metadata)
const LOCAL_ONLY_KEYS = ['los_e2e', 'los_synced_at', 'los_local_backup', 'los_autobackup'];
const VERIFIER_TEXT = 'LIFEOS_VERIFY_v1';

// ─── encoding helpers ─────────────────────────────────
const _enc = new TextEncoder();
const _dec = new TextDecoder();
const _b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const _unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function _sha256b64(str) { return _b64(await crypto.subtle.digest('SHA-256', _enc.encode(str))); }

// ─── key derivation ───────────────────────────────────
async function deriveKeys(email, password) {
  const normEmail = email.trim().toLowerCase();
  const saltBuf = await crypto.subtle.digest('SHA-256', _enc.encode(APP_PEPPER + '|' + normEmail));
  const pwKey = await crypto.subtle.importKey('raw', _enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const ikmBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuf, iterations: KDF_ITERATIONS, hash: 'SHA-256' }, pwKey, 256);
  const ikm = await crypto.subtle.importKey('raw', ikmBits, 'HKDF', false, ['deriveBits', 'deriveKey']);

  const authBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: _enc.encode('lifeos-auth') }, ikm, 256);
  const authPass = _b64(authBits);

  const encBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: _enc.encode('lifeos-enc') }, ikm, 256);
  const encKey = await crypto.subtle.importKey('raw', encBits, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

  // encRaw is stored ONLY on this device (los_e2e is in LOCAL_ONLY_KEYS and
  // never synced) so the app can stay unlocked between opens. The cloud stays
  // zero-knowledge — local data is plaintext in localStorage anyway.
  return { authPass, encKey, encRaw: _b64(encBits), normEmail };
}

// ─── persisted device record (los_e2e) ────────────────
function e2eRec() { try { return JSON.parse(localStorage.getItem('los_e2e')) || {}; } catch { return {}; } }
function e2ePatch(p) { try { localStorage.setItem('los_e2e', JSON.stringify(Object.assign(e2eRec(), p))); } catch (e) {} }

async function encryptObj(obj, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, _enc.encode(JSON.stringify(obj)));
  return { ciphertext: _b64(ct), iv: _b64(iv) };
}
async function decryptObj(ciphertext, iv, key) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: _unb64(iv) }, key, _unb64(ciphertext));
  return JSON.parse(_dec.decode(pt));
}

// ─── local snapshot of all syncable los_* keys ────────
function snapshotLocal() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('los_') && !LOCAL_ONLY_KEYS.includes(k)) out[k] = localStorage.getItem(k);
  }
  return out;
}
function restoreLocal(snap) {
  const remove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('los_') && !LOCAL_ONLY_KEYS.includes(k)) remove.push(k);
  }
  remove.forEach(k => localStorage.removeItem(k));
  Object.entries(snap).forEach(([k, v]) => { if (!LOCAL_ONLY_KEYS.includes(k)) localStorage.setItem(k, v); });
}
// Guard: a snapshot without a profile is "blank" — never overwrite the cloud with it.
function snapshotIsMeaningful(snap) { return !!snap['los_profile']; }

// ─── Supabase REST (no SDK, plain fetch) ──────────────
async function sbAuth(path, body) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error_description || d.msg || d.error || ('Auth ' + r.status));
  return d;
}
async function sbRefresh() {
  const d = await sbAuth('token?grant_type=refresh_token', { refresh_token: SYNC.refreshToken });
  SYNC.token = d.access_token; SYNC.refreshToken = d.refresh_token;
  // Refresh tokens rotate — persist the new one so the session survives restarts.
  const rec = e2eRec();
  if (rec.session) e2ePatch({ session: Object.assign(rec.session, { r: SYNC.refreshToken }) });
}
async function sbAuthedFetch(url, opts) {
  opts = opts || {};
  opts.headers = Object.assign({ apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SYNC.token }, opts.headers || {});
  let r = await fetch(url, opts);
  if (r.status === 401 && SYNC.refreshToken) {
    try { await sbRefresh(); opts.headers.Authorization = 'Bearer ' + SYNC.token; r = await fetch(url, opts); }
    catch (e) {}
  }
  return r;
}
async function sbGetVault() {
  const r = await sbAuthedFetch(SUPABASE_URL + '/rest/v1/vaults?select=ciphertext,iv,version,updated_at');
  if (!r.ok) throw new Error('Vault GET ' + r.status);
  const rows = await r.json();
  return rows[0] || null;
}
async function sbSaveVault(ciphertext, iv) {
  const r = await sbAuthedFetch(SUPABASE_URL + '/rest/v1/rpc/save_vault', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_ciphertext: ciphertext, p_iv: iv }),
  });
  if (!r.ok) throw new Error('save_vault ' + r.status + ' ' + (await r.text()));
}

// ─── AI proxy (Supabase Edge Function) ────────────────
// Calls the server-side `ai` function with the user's JWT. The Anthropic key
// lives only as a server secret, never in the client.
// Best-effort deletion of the user's cloud data (encrypted vault + backups).
// RLS scopes each DELETE to the signed-in user's own rows. The decisive step is
// clearing the local key afterwards — without it the cloud ciphertext (if any
// remains) is permanently unreadable (true E2EE deletion).
async function deleteAccountData() {
  try { await sbAuthedFetch(SUPABASE_URL + '/rest/v1/vault_backups?created_at=not.is.null', { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); } catch (e) {}
  try { await sbAuthedFetch(SUPABASE_URL + '/rest/v1/vaults?updated_at=not.is.null', { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); } catch (e) {}
}

async function aiFetch(payload) {
  if (!SYNC.token) throw new Error('Bitte zuerst anmelden (KI braucht eine Online-Sitzung).');
  const r = await sbAuthedFetch(SUPABASE_URL + '/functions/v1/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    // d.error may be a string OR an object ({message,type,...}) — never let it
    // stringify to "[object Object]".
    const em = typeof d.error === 'string' ? d.error
             : (d.error && (d.error.message || d.error.msg)) ? (d.error.message || d.error.msg)
             : (d.message || ('KI-Fehler ' + r.status));
    throw new Error(em);
  }
  return d;
}

// ─── high-level flows ─────────────────────────────────

// Sign in (or create the account on first use). One password → both keys.
// Returns { restored: true } if existing cloud data was pulled in.
async function e2eeLogin(email, password) {
  const { authPass, encKey, encRaw, normEmail } = await deriveKeys(email, password);

  let session = null;
  try { session = await sbSignIn(normEmail, authPass); } catch (e) {}
  if (!session || !session.access_token) {
    try { await sbAuth('signup', { email: normEmail, password: authPass }); }
    catch (e) { throw new Error('E-Mail oder Passwort falsch.'); } // account exists → wrong password
    session = await sbSignIn(normEmail, authPass);
  }
  if (!session || !session.access_token) throw new Error('Anmeldung fehlgeschlagen.');

  SYNC.token = session.access_token;
  SYNC.refreshToken = session.refresh_token;
  SYNC.key = encKey;
  SYNC.email = normEmail;
  SYNC.online = true;
  SYNC.ready = true;

  await saveVerifier(encKey, normEmail);
  // Stay signed in on this device: keep refresh token + key material locally.
  e2ePatch({ session: { r: SYNC.refreshToken, k: encRaw } });

  let restored = false;
  try { restored = await pullAndRestore(); }
  catch (e) {
    if (e.message === 'decrypt-failed') throw new Error('Konto existiert, aber das Passwort passt nicht zu den verschlüsselten Daten.');
    console.warn('pull failed:', e.message);
  }
  if (!restored) await pushNow(); // brand-new account → seed cloud with local state
  return { restored };
}
async function sbSignIn(email, authPass) {
  return sbAuth('token?grant_type=password', { email, password: authPass });
}

// Offline / fast unlock using a locally stored verifier (no network needed).
async function e2eeOfflineUnlock(password) {
  const rec = JSON.parse(localStorage.getItem('los_e2e') || 'null');
  if (!rec) return false;
  const { encKey } = await deriveKeys(rec.email, password);
  try {
    if ((await decryptObj(rec.check_ct, rec.check_iv, encKey)) === VERIFIER_TEXT) {
      SYNC.key = encKey; SYNC.email = rec.email; SYNC.online = false; SYNC.ready = false;
      return true;
    }
  } catch (e) {}
  return false;
}

async function saveVerifier(encKey, email) {
  const v = await encryptObj(VERIFIER_TEXT, encKey);
  e2ePatch({ email, check_ct: v.ciphertext, check_iv: v.iv });
}

function hasAccount() { return !!localStorage.getItem('los_e2e'); }
function accountEmail() { return e2eRec().email || ''; }

// ─── stay signed in ───────────────────────────────────
// Restore the device session at boot: import the stored key (no password
// prompt) and reconnect to the cloud in the background.
async function e2eeResume() {
  const rec = e2eRec();
  if (!rec.session || !rec.session.k) return false;
  try {
    SYNC.key = await crypto.subtle.importKey('raw', _unb64(rec.session.k), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  } catch (e) { return false; }
  SYNC.email = rec.email || null;
  SYNC.refreshToken = rec.session.r || null;
  resumeOnline(); // fire & forget — app is usable immediately (local-first)
  return true;
}

async function resumeOnline() {
  if (!SYNC.refreshToken || SYNC.ready) return;
  try {
    await sbRefresh();
    SYNC.online = true;
    SYNC.ready = true;
    // Two-way catch-up: only pull if the cloud is NEWER than our last sync
    // (another device wrote); otherwise push local state up.
    try {
      const row = await sbGetVault();
      const lastSync = Number(localStorage.getItem('los_synced_at') || 0);
      if (row && new Date(row.updated_at).getTime() > lastSync + 2000) {
        await pullAndRestore();
        if (typeof STATE !== 'undefined' && STATE.view) { renderScreen(STATE.view); updateStatusBar(); }
      } else {
        await pushNow();
      }
    } catch (e) { console.warn('resume sync:', e.message); }
  } catch (e) {
    if (/invalid|revoked|expired|not.?found/i.test(String(e.message))) {
      // Refresh token dead → session over; key stays so local data remains usable.
      e2ePatch({ session: null });
      if (typeof showToast === 'function') showToast('Cloud-Anmeldung abgelaufen — bitte neu anmelden', '🔒');
    } else {
      // Probably offline — retry as soon as the connection returns.
      window.addEventListener('online', () => resumeOnline(), { once: true });
    }
  }
}

// Pull remote, decrypt, and restore — keeping a local backup first.
async function pullAndRestore() {
  const row = await sbGetVault();
  if (!row) return false;
  let remote;
  try { remote = await decryptObj(row.ciphertext, row.iv, SYNC.key); }
  catch (e) { throw new Error('decrypt-failed'); }   // wrong key / corrupt → caller must NOT wipe local
  try { localStorage.setItem('los_local_backup', JSON.stringify(snapshotLocal())); } catch (e) {}
  restoreLocal(remote);
  SYNC.lastHash = await _sha256b64(JSON.stringify(snapshotLocal()));
  localStorage.setItem('los_synced_at', String(Date.now()));
  return true;
}

// Encrypt the current local state and push (latest + a history version).
async function pushNow() {
  if (!SYNC.ready || !SYNC.key || !SYNC.token) return;
  const snap = snapshotLocal();
  if (!snapshotIsMeaningful(snap)) return;             // never overwrite cloud with a blank state
  const json = JSON.stringify(snap);
  const hash = await _sha256b64(json);
  if (hash === SYNC.lastHash) return;                  // nothing changed
  const { ciphertext, iv } = await encryptObj(snap, SYNC.key);
  await sbSaveVault(ciphertext, iv);
  SYNC.lastHash = hash;
  localStorage.setItem('los_synced_at', String(Date.now()));
}

// Called from ls() after every write — debounced cloud push.
function markDirty() {
  if (!SYNC.ready) return;
  clearTimeout(SYNC.timer);
  SYNC.timer = setTimeout(() => { pushNow().catch(e => console.warn('sync push failed:', e.message)); }, SYNC_DEBOUNCE_MS);
}

function startSyncLoops() {
  // Flush on tab hide / close so nothing is lost.
  const flush = () => { if (SYNC.ready) pushNow().catch(() => {}); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  // Safety net every 30s.
  setInterval(flush, 30000);
}

function e2eeLogout() {
  SYNC.ready = false; SYNC.online = false; SYNC.key = null; SYNC.token = null; SYNC.refreshToken = null;
  clearTimeout(SYNC.timer);
  // Drop the persisted device session → next open requires the password again.
  e2ePatch({ session: null });
}
