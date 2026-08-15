// ═══════════════════════════════════════════════════════
// NATIVE · Capacitor-Brücke für die iOS/Android-App.
//   Lokale Erinnerungen (echte Push-Benachrichtigungen). Läuft NUR in der
//   installierten App; im Browser/PWA sind alle Funktionen No-ops. Da die App
//   ohne Bundler gebaut wird, greifen wir auf die Plugins zur Laufzeit über
//   window.Capacitor.Plugins zu (kein import nötig).
// ═══════════════════════════════════════════════════════

function _cap() { return (typeof window !== 'undefined') ? window.Capacitor : null; }
function isNativeApp() { const c = _cap(); return !!(c && c.isNativePlatform && c.isNativePlatform()); }
function _ln() { const c = _cap(); return c && c.Plugins && c.Plugins.LocalNotifications; }

// Erinnerungen: los_reminders = [{ id, emoji, label, time:'HH:MM', on }].
function getReminders() {
  const r = ls('los_reminders');
  if (r) return r;
  return [
    { id: 'r_water1',  emoji: '💧', label: 'Wasser trinken',    time: '10:00', on: false },
    { id: 'r_water2',  emoji: '💧', label: 'Wasser trinken',    time: '15:00', on: false },
    { id: 'r_supp',    emoji: '💊', label: 'Supplements nehmen', time: '08:00', on: false },
    { id: 'r_workout', emoji: '🏋', label: 'Training',          time: '17:30', on: false },
    { id: 'r_review',  emoji: '🌙', label: 'Tages-Rückblick',    time: '21:30', on: false },
  ];
}
function saveReminders(a) { ls('los_reminders', a); nativeReschedule(); }
function _remIntId(id) { let h = 0; for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0; } return h % 2000000000; }

// Alle geplanten Benachrichtigungen neu setzen (nativ). Im Browser: No-op.
async function nativeReschedule() {
  const LN = _ln(); if (!LN) return;
  try {
    const pend = await LN.getPending();
    if (pend && pend.notifications && pend.notifications.length) {
      await LN.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
    }
  } catch (e) {}
  const on = getReminders().filter(r => r.on);
  if (!on.length) return;
  const notifications = on.map(r => {
    const parts = (r.time || '09:00').split(':').map(Number);
    return {
      id: _remIntId(r.id), title: 'HustleX',
      body: (r.emoji ? r.emoji + ' ' : '') + r.label,
      schedule: { on: { hour: parts[0] || 9, minute: parts[1] || 0 }, allowWhileIdle: true },
    };
  });
  try { await LN.schedule({ notifications }); } catch (e) {}
}

// Beim App-Start (nativ): Berechtigung anfragen + Erinnerungen planen.
async function nativeInit() {
  const LN = _ln(); if (!LN) return;
  try { await LN.requestPermissions(); } catch (e) {}
  nativeReschedule();
}
if (typeof document !== 'undefined') {
  const kick = () => { if (isNativeApp()) nativeInit(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kick);
  else setTimeout(kick, 0);
}

// ─── Erinnerungen-Verwaltung (Overlay) ───
function openReminders() {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (EN ? 'REMINDERS' : 'ERINNERUNGEN') + '</div>' +
    '<div class="h2" style="margin-bottom:10px;">' + (EN ? 'Push <span class="gold">notifications</span>' : 'Push-<span class="gold">Erinnerungen</span>') + '</div>');

  if (!isNativeApp()) {
    inner.insertAdjacentHTML('beforeend', '<div class="glass" style="padding:12px 14px;margin-bottom:14px;font-size:12.5px;color:var(--t-2);line-height:1.6;">' +
      (EN ? '🔔 Reminders fire in the installed iOS/Android app. You can set them up here already — they activate automatically once the app is installed.'
          : '🔔 Erinnerungen kommen in der installierten iOS/Android-App. Du kannst sie hier schon einstellen — sie werden aktiv, sobald die App installiert ist.') + '</div>');
  }

  const listWrap = div(''); listWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:12px;';
  const paint = () => {
    listWrap.innerHTML = '';
    const rems = getReminders();
    rems.forEach(r => {
      const row = div('glass notranslate'); row.style.cssText = 'padding:10px 12px;display:flex;align-items:center;gap:10px;';
      const em = h('input', { type: 'text', value: r.emoji || '🔔', maxLength: 2 }); em.className = 'inp'; em.style.cssText = 'width:44px;text-align:center;font-size:16px;flex:none;padding:8px 2px;';
      em.onchange = () => { const a = getReminders(); const t = a.find(x => x.id === r.id); if (t) { t.emoji = em.value.trim() || '🔔'; saveReminders(a); } };
      const lab = h('input', { type: 'text', value: r.label }); lab.className = 'inp'; lab.style.cssText = 'flex:1;min-width:0;font-size:14px;padding:8px;';
      lab.onchange = () => { const a = getReminders(); const t = a.find(x => x.id === r.id); if (t) { t.label = lab.value.trim() || t.label; saveReminders(a); } };
      const tm = h('input', { type: 'time', value: r.time || '09:00' }); tm.className = 'inp'; tm.style.cssText = 'width:96px;flex:none;font-size:14px;padding:8px 6px;';
      tm.onchange = () => { const a = getReminders(); const t = a.find(x => x.id === r.id); if (t) { t.time = tm.value; saveReminders(a); } };
      const tog = h('button', { textContent: r.on ? (EN ? 'ON' : 'AN') : (EN ? 'OFF' : 'AUS') }); tog.className = 'tap';
      tog.style.cssText = 'width:54px;flex:none;padding:8px 0;border-radius:99px;font-size:11px;font-weight:700;border:1px solid ' + (r.on ? 'var(--green)' : 'var(--edge)') + ';background:' + (r.on ? 'rgba(48,209,88,.15)' : 'var(--glass-2)') + ';color:' + (r.on ? 'var(--green)' : 'var(--t-3)') + ';';
      tog.onclick = () => { const a = getReminders(); const t = a.find(x => x.id === r.id); if (t) { t.on = !t.on; saveReminders(a); haptic('light'); paint(); } };
      const del = h('button', { textContent: '×' }); del.style.cssText = 'background:none;color:var(--t-4);font-size:16px;flex:none;';
      del.onclick = () => { saveReminders(getReminders().filter(x => x.id !== r.id)); paint(); };
      row.appendChild(em); row.appendChild(lab); row.appendChild(tm); row.appendChild(tog); row.appendChild(del);
      listWrap.appendChild(row);
    });
  };
  paint();
  inner.appendChild(listWrap);

  const add = h('button', { textContent: EN ? '＋ New reminder' : '＋ Neue Erinnerung' }); add.className = 'btn btn-glass tap'; add.style.cssText = 'font-size:13px;';
  add.onclick = () => { const a = getReminders(); a.push({ id: 'r' + Date.now(), emoji: '🔔', label: EN ? 'Reminder' : 'Erinnerung', time: '12:00', on: true }); saveReminders(a); paint(); };
  inner.appendChild(add);
  openOverlay();
}
