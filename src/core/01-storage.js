// ═══════════════════════════════════════════════════════
// STORAGE · localStorage helper + service worker
// ═══════════════════════════════════════════════════════

const SW_VERSION = 'los-v41'; // bump on each release to invalidate cache

const ls = (k, v) => {
  if (v === undefined) {
    try { return JSON.parse(localStorage.getItem(k)); }
    catch { return null; }
  }
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  // Trigger an encrypted cloud push (debounced). markDirty() lives in 05-sync.js
  // and is hoisted; it no-ops until the user is logged in.
  if (typeof markDirty === 'function') markDirty();
};

// Today's date as a stable key
function today() { return new Date().toDateString(); }

// Register PWA service worker
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  const sw = `
const C='${SW_VERSION}';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.add(location.href)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
// Network-first: always try the live version, fall back to cache when offline.
// This stops the installed PWA from getting stuck on a stale build.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(C).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request))
  );
});
  `;
  const blob = new Blob([sw], { type: 'application/javascript' });
  navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(() => {});
}
