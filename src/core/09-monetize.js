// ═══════════════════════════════════════════════════════
// MONETIZE · Free-Tier-Limit für die Server-KI (Metering) + Pro
//   + Paddle-Checkout. Ziel: BYOK bleibt gratis & unbegrenzt (eigener
//   Key), die kostenlose Server-KI hat ein faires Tageslimit, und Pro
//   (per Paddle bezahlt) hebt das Limit auf.
// ═══════════════════════════════════════════════════════

// ─── Wie viele Server-KI-Aufrufe pro Tag gratis? ───
// Nur relevant, wenn KEIN eigener Key aktiv ist (dann läuft es über
// unseren Server-Key = kostet UNS Geld). Mit BYOK oder Pro: unbegrenzt.
const AI_FREE_DAILY = 12;

function isProActive() { return !!(typeof STATE !== 'undefined' && STATE.isPro); }
function usingOwnKey() { const b = ls('los_byok'); return !!(b && b.on && b.key); }

function _aiUsageToday() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (lokal-nah genug)
  const u = ls('los_ai_usage') || {};
  if (u.date !== today) return { date: today, n: 0 };
  return { date: today, n: u.n || 0 };
}
function aiUsageLeft() {
  if (isProActive() || usingOwnKey()) return Infinity;
  return Math.max(0, AI_FREE_DAILY - _aiUsageToday().n);
}
function aiRecordUse() {
  if (isProActive() || usingOwnKey()) return; // unbegrenzt → nicht zählen
  const u = _aiUsageToday(); u.n += 1; ls('los_ai_usage', u);
}
// Wirft einen freundlichen Fehler, wenn das Gratis-Tageslimit erreicht ist.
function aiQuotaGate() {
  if (isProActive() || usingOwnKey()) return;
  if (_aiUsageToday().n >= AI_FREE_DAILY) {
    const EN = (typeof LANG !== 'undefined' && LANG === 'en');
    const e = new Error(EN
      ? 'Daily free AI limit reached (' + AI_FREE_DAILY + '/day). Add your own key (free, under Connections) or upgrade to Pro.'
      : 'Gratis-Tageslimit erreicht (' + AI_FREE_DAILY + '/Tag). Trag deinen eigenen Key ein (gratis, unter Verbindungen) oder hol dir Pro.');
    e.quota = true;
    throw e;
  }
}

// ─── Paddle (Zahlungen) ───────────────────────────────
// Merchant of Record: Paddle kümmert sich um Umsatzsteuer/Rechnungen weltweit.
// Trag hier deine Werte aus dem Paddle-Dashboard ein, dann funktioniert der
// Checkout automatisch. Solange leer, zeigt die App "bald verfügbar".
//   token   : Client-Token (Paddle → Developer Tools → Authentication → Client-side token)
//   priceId : Price-ID deines Pro-Abos (beginnt mit "pri_")
//   env     : 'sandbox' zum Testen, 'production' wenn live
const PADDLE_CONFIG = {
  token: '',
  priceId: '',
  env: 'sandbox',
  priceLabel: '9,99€ / Monat',
};
function paddleReady() { return !!(PADDLE_CONFIG.token && PADDLE_CONFIG.priceId); }

let _paddleLoaded = null;
function loadPaddle() {
  if (_paddleLoaded) return _paddleLoaded;
  _paddleLoaded = new Promise((resolve, reject) => {
    if (typeof Paddle !== 'undefined') return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    s.onload = () => {
      try {
        if (PADDLE_CONFIG.env === 'sandbox') Paddle.Environment.set('sandbox');
        Paddle.Initialize({
          token: PADDLE_CONFIG.token,
          eventCallback: (ev) => {
            if (ev && ev.name === 'checkout.completed') onProPurchased();
          },
        });
        resolve();
      } catch (e) { reject(e); }
    };
    s.onerror = () => reject(new Error('Paddle konnte nicht geladen werden'));
    document.head.appendChild(s);
  });
  return _paddleLoaded;
}

// Nach erfolgreichem Kauf: Pro lokal freischalten. (Sichere Bestätigung läuft
// später zusätzlich per Paddle-Webhook → Supabase; siehe Launch-Notizen.)
function onProPurchased() {
  STATE.isPro = true; ls('los_pro', true);
  if (typeof updateStatusBar === 'function') updateStatusBar();
  if (typeof showToast === 'function') showToast(LANG === 'en' ? 'Welcome to Pro 🎉' : 'Willkommen bei Pro 🎉', '👑');
  if (typeof closeOverlay === 'function') closeOverlay();
}

async function startPaddleCheckout() {
  if (!paddleReady()) { showToast(LANG === 'en' ? 'Checkout not set up yet' : 'Checkout noch nicht eingerichtet', 'ℹ'); return; }
  try {
    await loadPaddle();
    const email = (typeof accountEmail === 'function' && accountEmail()) || (typeof SYNC !== 'undefined' && SYNC.email) || undefined;
    Paddle.Checkout.open({
      items: [{ priceId: PADDLE_CONFIG.priceId, quantity: 1 }],
      customer: email ? { email } : undefined,
      settings: { displayMode: 'overlay', theme: 'dark', locale: (typeof LANG !== 'undefined' ? LANG : 'de') },
    });
  } catch (e) { showToast('Fehler: ' + (e.message || e), '⚠'); }
}

// ─── Upgrade-Screen (Paywall) ─────────────────────────
function openUpgrade() {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">HUSTLEX PRO</div>' +
    '<div class="h2" style="margin-bottom:6px;">' + (EN ? 'Unlock <span class="gold">everything</span>' : 'Alles <span class="gold">freischalten</span>') + '</div>' +
    '<div style="font-size:13px;color:var(--t-3);line-height:1.6;margin-bottom:16px;">' +
      (EN ? 'One membership. Full power. Cancel anytime.' : 'Eine Mitgliedschaft. Volle Power. Jederzeit kündbar.') + '</div>');

  const feats = EN ? [
    ['∞', 'Unlimited AI', 'No daily limit on coach, courses & assistant'],
    ['🎓', 'AI course generator', 'Create your own courses on any topic'],
    ['☁', 'Cloud sync & backup', 'Encrypted across all your devices'],
    ['🔑', 'Or bring your own key', 'Use your Anthropic key — free & unlimited'],
  ] : [
    ['∞', 'Unbegrenzte KI', 'Kein Tageslimit für Coach, Kurse & Assistent'],
    ['🎓', 'KI-Kurs-Generator', 'Eigene Kurse zu jedem Thema erstellen'],
    ['☁', 'Cloud-Sync & Backup', 'Verschlüsselt auf all deinen Geräten'],
    ['🔑', 'Oder eigener Key', 'Anthropic-Key nutzen — gratis & unbegrenzt'],
  ];
  const card = div('glass', ''); card.style.cssText = 'padding:16px;margin-bottom:14px;';
  feats.forEach(f => {
    card.insertAdjacentHTML('beforeend',
      '<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">' +
        '<span style="font-size:20px;width:26px;text-align:center;flex:none;">' + f[0] + '</span>' +
        '<div><div style="font-size:14px;color:var(--t-1);font-weight:600;">' + f[1] + '</div>' +
        '<div style="font-size:12px;color:var(--t-3);margin-top:1px;line-height:1.5;">' + f[2] + '</div></div>' +
      '</div>');
  });
  inner.appendChild(card);

  const priceRow = div(''); priceRow.style.cssText = 'text-align:center;margin-bottom:14px;';
  priceRow.innerHTML = '<span class="serif gold" style="font-size:26px;">' + PADDLE_CONFIG.priceLabel + '</span>';
  inner.appendChild(priceRow);

  if (paddleReady()) {
    const buy = h('button', { textContent: EN ? 'Upgrade to Pro' : 'Jetzt Pro holen' });
    buy.className = 'btn btn-gold tap'; buy.style.cssText = 'font-size:15px;padding:14px;';
    buy.onclick = () => startPaddleCheckout();
    inner.appendChild(buy);
    inner.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-4);text-align:center;margin-top:10px;line-height:1.5;">' +
      (EN ? 'Secure payment via Paddle. Includes VAT. Cancel anytime.' : 'Sichere Zahlung über Paddle. Inkl. MwSt. Jederzeit kündbar.') + '</div>');
  } else {
    inner.insertAdjacentHTML('beforeend', '<div class="glass" style="padding:14px;text-align:center;font-size:13px;color:var(--t-2);line-height:1.6;">' +
      (EN ? '💳 Payments are being set up — coming soon. Meanwhile, add your own key under Connections for free unlimited AI.'
          : '💳 Zahlungen werden gerade eingerichtet — bald verfügbar. Bis dahin: eigenen Key unter Verbindungen eintragen = gratis & unbegrenzt.') + '</div>');
    const conn = h('button', { textContent: EN ? '🔑 Set up my key' : '🔑 Eigenen Key einrichten' });
    conn.className = 'btn btn-glass tap'; conn.style.cssText = 'margin-top:10px;font-size:13px;';
    conn.onclick = () => { if (typeof openConnections === 'function') openConnections(); };
    inner.appendChild(conn);
  }
  openOverlay();
}
