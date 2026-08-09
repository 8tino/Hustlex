// ═══════════════════════════════════════════════════════
// TOAST · XP popup, toast notifications, combo bar
// ═══════════════════════════════════════════════════════

function showToast(msg, icon) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.left = '50%';
  t.textContent = (icon || '') + ' ' + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2900);
}

function showXPPopup(xp, extra) {
  const prev = document.querySelector('.xp-pop');
  if (prev) prev.remove();
  const e = document.createElement('div');
  e.className = 'xp-pop';
  e.textContent = '+' + xp + ' XP' + (extra ? ' ' + extra : '');
  document.body.appendChild(e);
  setTimeout(() => e.remove(), 1100);
}

function showComboBar() {
  let b = document.querySelector('.combo-bar');
  if (!b) {
    b = document.createElement('div');
    b.className = 'combo-bar';
    document.body.appendChild(b);
  }
  const lbl = COMBO.count >= 10 ? 'MEGA' :
              COMBO.count >= 5  ? 'EPIC' :
              COMBO.count >= 3  ? 'HOT' : '';
  b.textContent = `${lbl} COMBO ×${COMBO.count}${COMBO.multi > 1 ? ' (' + COMBO.multi + '×)' : ''}`;
}

function hideComboBar() {
  const b = document.querySelector('.combo-bar');
  if (b) {
    b.style.opacity = '0';
    b.style.transition = 'opacity 0.3s';
    setTimeout(() => b.remove(), 300);
  }
}

function addXP(n, cat) {
  if (COMBO.timer) clearTimeout(COMBO.timer);
  COMBO.count++;
  COMBO.multi = COMBO.count >= 10 ? 3 :
                COMBO.count >= 5  ? 2 :
                COMBO.count >= 3  ? 1.5 : 1;
  const earned = Math.round(n * COMBO.multi);
  STATE.totalXP += earned;
  ls('los_xp', STATE.totalXP);

  if (cat) {
    const cx = ls('los_catxp') || { body: { xp: 0, lv: 1 }, mind: { xp: 0, lv: 1 }, discipline: { xp: 0, lv: 1 }, goals: { xp: 0, lv: 1 } };
    if (!cx[cat]) cx[cat] = { xp: 0, lv: 1 };
    cx[cat].xp += n;
    const needed = cx[cat].lv * 100 + Math.floor(cx[cat].lv / 5) * 50;
    if (cx[cat].xp >= needed) {
      cx[cat].xp -= needed;
      cx[cat].lv++;
      haptic('success');
      showToast(cat.charAt(0).toUpperCase() + cat.slice(1) + ' Level Up! Lv' + cx[cat].lv);
    }
    ls('los_catxp', cx);
  }

  showXPPopup(earned, COMBO.count >= 3 ? '×' + COMBO.multi : '');
  if (COMBO.count >= 3) showComboBar();
  COMBO.timer = setTimeout(() => { COMBO.count = 0; COMBO.multi = 1; hideComboBar(); }, 10000);

  const old = getLvl(STATE.totalXP - earned);
  const nw  = getLvl(STATE.totalXP);
  if (nw.l > old.l) {
    haptic('levelup');
    showToast('LEVEL UP! Du bist jetzt ' + nw.n);
  }

  haptic('light');
  checkAchievements();
  if (typeof updateStatusBar === 'function') updateStatusBar();
}
