// ═══════════════════════════════════════════════════════
// INIT · Bootstrap — state, onboarding vs app, SW, timed loops
// ═══════════════════════════════════════════════════════

// Evening review auto-prompt (after 20:00, if NN set and not yet reviewed)
function checkEveningReview() {
  if (!STATE.profile) return;
  const hr = new Date().getHours();
  const nn = getNN();
  const disc = getDiscState();
  if (hr >= 20 && nn.items.length > 0 && disc.lastReviewDate !== today()) {
    const key = 'los_review_prompted_' + today();
    if (!ls(key)) {
      ls(key, true);
      setTimeout(() => {
        const now = new Date();
        if (confirm('Es ist ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + '. Zeit für die abendliche Abrechnung. Jetzt machen?')) openEveningReview();
      }, 1500);
    }
  }
}

// Safety net: on every start, snapshot all los_ data locally (keep last 5).
// A future bug can never silently wipe everything — the previous state is kept.
// Restorable via Settings → „Backup wiederherstellen".
function autoBackup() {
  try {
    const snap = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('los_') && k !== 'los_autobackup') snap[k] = localStorage.getItem(k);
    }
    if (!snap.los_profile) return; // nothing meaningful yet
    const backups = JSON.parse(localStorage.getItem('los_autobackup') || '[]');
    backups.unshift({ at: Date.now(), data: snap });
    localStorage.setItem('los_autobackup', JSON.stringify(backups.slice(0, 5)));
  } catch (e) {}
}

// Gate everything behind the password lock — EXCEPT when this device has a
// stored session (stay signed in): then unlock silently and sync in background.
function boot() {
  registerSW();
  if (typeof SUPABASE_URL === 'string' && SUPABASE_URL) {
    e2eeResume()
      .then(ok => { if (ok) { hideLock(); startApp(); } else { showLock(); } })
      .catch(() => showLock());
  } else {
    startApp();          // cloud not configured → run purely local
  }
}

// Boot the actual app after unlock. localStorage has already been restored
// from the (decrypted) cloud snapshot by the lock flow when applicable.
function startApp() {
  if (window.__appStarted) { updateStatusBar(); renderScreen(STATE.view || 'home'); return; }
  window.__appStarted = true;
  initState();
  if (typeof decayXP === 'function') decayXP(); // use-it-or-lose-it
  autoBackup();
  startSyncLoops();
  initAssistant();

  if (STATE.profile) {
    el('onboard').style.display = 'none';
    updateStatusBar();
    navTo('home');
    // First open of the day → motivational "first sentence of the day" popup.
    setTimeout(() => { try { showDailyStart(); } catch (e) {} }, 500);
    checkEveningReview();
    // Bestehende Nutzer einmalig durchs neue Tutorial führen.
    if (!ls('los_tutorial_seen')) {
      try { ls('los_tutorial_seen', true); } catch (e) {}
      setTimeout(() => { try { openTutorial(false); } catch (e) {} }, 1200);
    }
    // Re-render Fokus & Home every 60s so time-block highlighting stays live.
    setInterval(() => {
      if (STATE.view === 'fokus' || STATE.view === 'home') renderScreen(STATE.view);
    }, 60000);
  } else {
    el('onboard').style.display = 'block';
    renderOnboard();
    obGo(0);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
