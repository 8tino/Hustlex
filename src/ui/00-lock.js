// ═══════════════════════════════════════════════════════
// LOCK · Password gate shown before the app boots.
//   First run → create account (e-mail + password).
//   Returning → unlock with password (works offline too).
// ═══════════════════════════════════════════════════════

function showLock() {
  const lock = el('lock');
  lock.style.display = 'block';
  const returning = hasAccount();
  const email = accountEmail();

  lock.innerHTML =
    '<div class="lock-inner anim-fade-up">' +
      '<div style="text-align:center;margin-bottom:28px;">' +
        '<div class="label" style="letter-spacing:7px;margin-bottom:18px;">LIFE OS</div>' +
        '<div class="h1">' + (returning ? 'Willkommen <span class="gold italic">zurück</span>' : 'Dein <span class="gold italic">privater</span> Tresor') + '</div>' +
        '<div style="font-size:12px;color:var(--t-2);line-height:1.6;margin-top:8px;">' +
          (returning
            ? 'Entsperre deine Daten mit deinem Passwort.'
            : 'Erstelle ein Konto. Alles wird Ende-zu-Ende verschlüsselt – nur du kannst es lesen.') +
        '</div>' +
      '</div>' +

      '<div class="glass" style="display:flex;flex-direction:column;gap:12px;">' +
        '<div>' +
          '<div class="label" style="font-size:10px;margin-bottom:6px;">E-MAIL</div>' +
          '<input id="lk_email" class="inp" type="email" autocomplete="username" inputmode="email" placeholder="du@beispiel.de" value="' + (email || '') + '"' + (returning ? ' readonly' : '') + '/>' +
        '</div>' +
        '<div>' +
          '<div class="label" style="font-size:10px;margin-bottom:6px;">PASSWORT</div>' +
          '<input id="lk_pw" class="inp" type="password" autocomplete="' + (returning ? 'current-password' : 'new-password') + '" placeholder="••••••••"/>' +
        '</div>' +
        (returning ? '' :
          '<div>' +
            '<div class="label" style="font-size:10px;margin-bottom:6px;">PASSWORT WIEDERHOLEN</div>' +
            '<input id="lk_pw2" class="inp" type="password" autocomplete="new-password" placeholder="••••••••"/>' +
          '</div>') +
        '<div id="lk_err" style="display:none;font-size:12px;color:var(--red);line-height:1.5;"></div>' +
        '<button id="lk_go" class="btn btn-gold tap" style="margin-top:4px;">' + (returning ? 'ENTSPERREN' : 'KONTO ERSTELLEN & STARTEN') + '</button>' +
      '</div>' +

      '<div style="font-size:11px;color:var(--t-3);line-height:1.6;text-align:center;margin-top:16px;">' +
        (returning
          ? '<span class="tap" id="lk_other" style="color:var(--gold-soft);cursor:pointer;">Anderes Konto / neues Gerät</span>'
          : '⚠ Ende-zu-Ende verschlüsselt: Ohne dein Passwort sind die Daten <b>nicht</b> wiederherstellbar. Notiere es sicher.') +
      '</div>' +
    '</div>';

  const go = el('lk_go');
  const pw = el('lk_pw');
  go.onclick = lockSubmit;
  pw.onkeydown = e => { if (e.key === 'Enter') lockSubmit(); };
  const pw2 = el('lk_pw2');
  if (pw2) pw2.onkeydown = e => { if (e.key === 'Enter') lockSubmit(); };
  const other = el('lk_other');
  if (other) other.onclick = () => { localStorage.removeItem('los_e2e'); showLock(); };
  setTimeout(() => (returning ? pw : el('lk_email')).focus(), 50);
}

function lockErr(msg) {
  const e = el('lk_err');
  if (!e) return;
  e.textContent = msg;
  e.style.display = 'block';
}

async function lockSubmit() {
  const returning = hasAccount();
  const email = (el('lk_email').value || '').trim();
  const pw = el('lk_pw').value || '';
  const pw2El = el('lk_pw2');
  el('lk_err').style.display = 'none';

  if (!email || !/.+@.+\..+/.test(email)) return lockErr('Bitte eine gültige E-Mail eingeben.');
  if (pw.length < 8) return lockErr('Passwort muss mindestens 8 Zeichen haben.');
  if (pw2El && pw !== pw2El.value) return lockErr('Die Passwörter stimmen nicht überein.');

  const go = el('lk_go');
  const original = go.textContent;
  go.disabled = true; go.style.opacity = '.6';
  go.innerHTML = '<span class="anim-spin">⚙</span>  ' + (returning ? 'ENTSPERRE…' : 'ERSTELLE…');

  try {
    await e2eeLogin(email, pw);            // online: sign-in or create + pull/push
    hideLock(); startApp(); return;
  } catch (err) {
    // Network down but returning user with correct password → unlock offline.
    if (hasAccount()) {
      const ok = await e2eeOfflineUnlock(pw).catch(() => false);
      if (ok) {
        showToast('Offline – wird synchronisiert sobald online', '☁');
        hideLock(); startApp(); return;
      }
    }
    go.disabled = false; go.style.opacity = '1'; go.textContent = original;
    let msg = err.message || 'Anmeldung fehlgeschlagen.';
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      msg = 'Server gerade nicht erreichbar. Prüfe deine Internet-Verbindung und versuch es in ein paar Sekunden nochmal.';
    }
    lockErr(msg);
  }
}

function hideLock() {
  const lock = el('lock');
  if (lock) lock.style.display = 'none';
}
