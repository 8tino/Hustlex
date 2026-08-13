// ═══════════════════════════════════════════════════════
// OVERLAY · Modal sheet (open/close) + settings panel
// ═══════════════════════════════════════════════════════

function openOverlay() {
  if (typeof translateTree === 'function') translateTree(el('overlay_inner'));
  el('overlay').classList.add('on');
}
function closeOverlay() {
  el('overlay').classList.remove('on');
}

// Close when tapping the dimmed backdrop.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlay);
} else {
  initOverlay();
}
function initOverlay() {
  const bd = document.querySelector('.overlay-backdrop');
  if (bd) bd.addEventListener('click', closeOverlay);
}

// Small helper: a "← ZURÜCK" button that closes the overlay.
function overlayBackBtn() {
  const back = h('button', { textContent: '← ZURÜCK' }, '');
  back.className = 'btn btn-ghost tap';
  back.style.marginBottom = '24px';
  back.onclick = closeOverlay;
  return back;
}

function showSettings() {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());

  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + t('set.settings', 'EINSTELLUNGEN') + '</div>' +
    '<div class="h2" style="margin-bottom:20px;">' + t('set.profilePlan', 'Profil & Plan') + '</div>');

  if (typeof langPicker === 'function') {
    const langCard = div('glass', '<div class="label" style="margin-bottom:10px;">' + t('set.language', 'SPRACHE') + '</div>');
    langCard.style.marginBottom = '12px';
    const lp = langPicker(false); lp.style.justifyContent = 'flex-start';
    langCard.appendChild(lp);
    inner.appendChild(langCard);
  }

  if (STATE.profile) {
    const pc = div('glass-accent anim-fade-up', '');
    pc.style.marginBottom = '12px';
    pc.innerHTML =
      '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">' +
        '<span style="font-size:28px;">' + (STATE.profile.avatar || '⚡') + '</span>' +
        '<div><div class="serif gold" style="font-size:16px;">' + STATE.profile.name + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + (STATE.profile.titleTxt || '') + (STATE.isPro ? ' · <span class="gold">PRO</span>' : '') + '</div></div>' +
      '</div>' +
      (STATE.profile.quote ? '<div class="serif italic" style="font-size:13px;color:var(--t-2);line-height:1.7;">"' + STATE.profile.quote + '"</div>' : '');
    inner.appendChild(pc);

    if (STATE.profile.plan) {
      const planCard = div('glass', '');
      planCard.style.marginBottom = '12px';
      planCard.innerHTML = '<div class="label" style="margin-bottom:8px;">DEIN MASTERPLAN</div>' +
        '<div style="font-size:12px;color:var(--t-2);line-height:1.8;white-space:pre-line;">' + STATE.profile.plan + '</div>';
      inner.appendChild(planCard);
    }
  }

  if (!STATE.isPro) {
    const upbtn = h('button', { textContent: 'UPGRADE ZU PRO · 9,99€/Mo →' }, '');
    upbtn.className = 'btn btn-gold tap';
    upbtn.style.marginBottom = '10px';
    upbtn.onclick = () => { STATE.isPro = true; ls('los_pro', true); updateStatusBar(); closeOverlay(); };
    inner.appendChild(upbtn);
  }

  const disc = getDiscState();
  const statsRow = div('', '');
  statsRow.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;';
  [
    { l: 'LEVEL',  v: getLvl(STATE.totalXP).l },
    { l: 'XP',     v: STATE.totalXP },
    { l: 'STREAK', v: disc.streak },
    { l: 'BEST',   v: disc.bestStreak },
  ].forEach(st => {
    const b = div('glass', '');
    b.style.cssText = 'padding:10px 4px;text-align:center;';
    b.innerHTML = '<div class="serif gold" style="font-size:16px;font-weight:500;">' + st.v + '</div>' +
      '<div class="label" style="font-size:10px;margin-top:2px;">' + st.l + '</div>';
    statsRow.appendChild(b);
  });
  inner.appendChild(statsRow);

  // ─── Cloud sync (E2EE) ───
  if (typeof SYNC !== 'undefined' && (SYNC.email || hasAccount())) {
    const syncedAt = Number(localStorage.getItem('los_synced_at') || 0);
    const when = syncedAt ? new Date(syncedAt).toLocaleString('de-DE') : 'noch nie';
    const status = SYNC.ready ? 'Verschlüsselt synchronisiert' : (SYNC.key ? 'Offline – synct sobald online' : 'Gesperrt');
    const sc = div('glass', '');
    sc.style.marginBottom = '12px';
    sc.innerHTML =
      '<div class="label" style="margin-bottom:8px;">☁ CLOUD-SYNC · ENDE-ZU-ENDE</div>' +
      '<div style="font-size:12px;color:var(--t-2);line-height:1.6;">' + (SYNC.email || accountEmail()) + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:2px;">' + status + ' · zuletzt: ' + when + '</div>';
    const scRow = div('');
    scRow.style.cssText = 'display:flex;gap:7px;margin-top:10px;';
    const nowBtn = h('button', { textContent: 'JETZT SYNCEN' }, '');
    nowBtn.className = 'btn btn-glass tap';
    nowBtn.style.fontSize = '9px';
    nowBtn.onclick = async () => {
      if (!SYNC.ready) { showToast('Nicht online angemeldet', '☁'); return; }
      nowBtn.textContent = 'SYNCT…';
      try { SYNC.lastHash = null; await pushNow(); showToast('Synchronisiert', '✓'); }
      catch (e) { showToast('Sync fehlgeschlagen', '⚠'); }
      nowBtn.textContent = 'JETZT SYNCEN';
    };
    if (!SYNC.ready) {
      const reBtn = h('button', { textContent: 'ANMELDEN' }, '');
      reBtn.className = 'btn btn-gold tap';
      reBtn.style.fontSize = '9px';
      reBtn.onclick = () => { closeOverlay(); showLock(); };
      scRow.appendChild(reBtn);
    }
    const outBtn = h('button', { textContent: 'ABMELDEN' }, '');
    outBtn.className = 'btn btn-ghost tap';
    outBtn.style.fontSize = '9px';
    outBtn.onclick = () => {
      if (confirm('Abmelden? Die Daten bleiben verschlüsselt in der Cloud; zum Weiterarbeiten meldest du dich wieder mit deinem Passwort an.')) {
        e2eeLogout();
        location.reload();
      }
    };
    scRow.appendChild(nowBtn); scRow.appendChild(outBtn);
    sc.appendChild(scRow);
    inner.appendChild(sc);
  }

  // Restore from the most recent auto-backup
  const backups = (() => { try { return JSON.parse(localStorage.getItem('los_autobackup') || '[]'); } catch { return []; } })();
  if (backups.length > 1) {
    const rb = h('button', { textContent: '↩ BACKUP WIEDERHERSTELLEN' }, '');
    rb.className = 'btn btn-ghost tap';
    rb.style.cssText = 'margin-bottom:8px;font-size:11px;letter-spacing:1.5px;';
    rb.onclick = () => {
      const list = backups.slice(1); // 0 = current start
      const opts = list.map((b, i) => (i + 1) + ') ' + new Date(b.at).toLocaleString('de-DE')).join('\n');
      const pick = parseInt(prompt('Welchen Stand wiederherstellen?\n' + opts, '1') || '');
      const chosen = list[pick - 1];
      if (!chosen) return;
      Object.keys(localStorage).filter(k => k.startsWith('los_') && k !== 'los_autobackup').forEach(k => localStorage.removeItem(k));
      Object.entries(chosen.data).forEach(([k, v]) => localStorage.setItem(k, v));
      showToast('Backup wiederhergestellt', '↩');
      location.reload();
    };
    inner.appendChild(rb);
  }

  const expBtn = h('button', { textContent: 'DATEN EXPORTIEREN' }, '');
  expBtn.className = 'btn btn-ghost tap';
  expBtn.style.cssText = 'margin-bottom:8px;font-size:11px;letter-spacing:1.5px;';
  expBtn.onclick = () => {
    const data = {
      exportDate: new Date().toISOString(),
      profile: STATE.profile, totalXP: STATE.totalXP,
      achievements: getUnlocked(), catXP: ls('los_catxp'),
      discipline: getDiscState(),
      ziele: ls('los_ziele') || [], werte: ls('los_werte') || [],
      gewohnheiten: ls('los_gew') || [], lernen: ls('los_lernen') || {},
      journal: (ls('los_j_list') || []).map(e => Object.assign({}, e, { entry: ls('los_j_' + e.date) })),
      bodyFix: ls('los_bodyfix') || [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HustleX_Export_' + new Date().toLocaleDateString('de-DE').replace(/\./g, '-') + '.json';
    a.click();
    haptic('success'); showToast('Export heruntergeladen!');
  };
  inner.appendChild(expBtn);

  const rbtn = h('button', { textContent: 'PROFIL ZURÜCKSETZEN & NEU STARTEN' }, '');
  rbtn.className = 'btn btn-ghost tap';
  rbtn.style.cssText = 'border-color:rgba(225,104,104,.25);color:var(--red);font-size:11px;letter-spacing:1px;';
  rbtn.onclick = () => {
    if (confirm('Profil löschen und neu starten?')) {
      Object.keys(localStorage).filter(k => k.startsWith('los_')).forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  };
  inner.appendChild(rbtn);

  // Konto & alle Daten endgültig löschen (DSGVO-Betroffenenrecht + Store-Pflicht).
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const dbtn = h('button', { textContent: EN ? '🗑  Delete account & all data' : '🗑  Konto & alle Daten löschen' }, '');
  dbtn.className = 'btn tap';
  dbtn.style.cssText = 'width:100%;margin-top:10px;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.35);color:#FF453A;font-weight:600;padding:12px;border-radius:var(--r-md);';
  dbtn.onclick = async () => {
    if (!confirm(EN ? 'Delete your account and ALL data — in the cloud and on this device? This cannot be undone.' : 'Konto und ALLE Daten löschen — in der Cloud und auf diesem Gerät? Das kann nicht rückgängig gemacht werden.')) return;
    dbtn.disabled = true; dbtn.style.opacity = '.6'; dbtn.textContent = EN ? 'Deleting…' : 'Lösche…';
    try { if (typeof deleteAccountData === 'function') await deleteAccountData(); } catch (e) {}
    try { Object.keys(localStorage).filter(k => k.startsWith('los_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.reload();
  };
  inner.appendChild(dbtn);

  openOverlay();
}
