// ═══════════════════════════════════════════════════════
// STATUS BAR · Avatar, name + level XP-bar, streak, focus ring
// ═══════════════════════════════════════════════════════

// Discipline streak — getDiscState() arrives with fokus.js. Until then,
// read the raw store so the partial build keeps working.
function sbStreak() {
  if (typeof getDiscState === 'function') return getDiscState().streak;
  return (ls('los_disc') || {}).streak || 0;
}

// Builds the static markup once. Values are filled by updateStatusBar().
function renderStatusBar() {
  el('statusbar').innerHTML =
    '<div class="anim-fade-down" style="display:flex;align-items:center;gap:12px;">' +

      // ─── Avatar (opens settings) ───
      '<div id="sb_avatar" class="tap" onclick="showSettings()" ' +
        'style="width:38px;height:38px;border-radius:var(--r-sm);background:var(--glass-2);' +
        'border:1px solid var(--edge-mid);box-shadow:var(--inner-edge);flex-shrink:0;' +
        'display:flex;align-items:center;justify-content:center;overflow:hidden;line-height:1;">⚡</div>' +

      // ─── Name · level · pro + XP-bar ───
      '<div style="flex:1;min-width:0;">' +
        '<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;">' +
          '<span id="sb_name" class="serif gold" style="font-size:14px;letter-spacing:.3px;' +
            'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">HustleX</span>' +
          '<span id="sb_level" class="label" style="font-size:10px;white-space:nowrap;">RECRUIT · LV1</span>' +
          '<span id="sb_pro" class="pill pill-gold" style="font-size:6px;display:none;">PRO</span>' +
        '</div>' +
        '<div class="bar"><div id="sb_xpbar" class="bar-fill" style="width:0%;"></div></div>' +
      '</div>' +

      // ─── Streak + focus ring ───
      '<div style="display:flex;gap:12px;align-items:center;flex-shrink:0;">' +
        '<div class="tap" onclick="document.querySelector(\'.nav-btn[data-view=fokus]\')?.click()" ' +
          'style="text-align:center;">' +
          '<div id="sb_streak" class="serif" style="font-size:16px;font-weight:500;line-height:1;' +
            'color:var(--gold);">0<span style="font-size:10px;"> 🔥</span></div>' +
          '<div class="label" style="font-size:6px;margin-top:3px;">STREAK</div>' +
        '</div>' +
        '<div style="text-align:center;">' +
          '<div id="sb_ring" style="width:40px;height:40px;border-radius:50%;position:relative;' +
            'display:flex;align-items:center;justify-content:center;' +
            'transition:background .8s var(--ease-out);' +
            'background:conic-gradient(var(--gold) 0deg, rgba(255,255,255,.05) 0deg);">' +
            '<div style="position:absolute;inset:3px;border-radius:50%;background:var(--bg-base);"></div>' +
            '<span id="sb_score" class="serif" style="position:relative;font-size:12px;font-weight:600;' +
              'color:var(--gold);">0</span>' +
          '</div>' +
          '<div class="label" style="font-size:6px;margin-top:2px;">FOCUS</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function updateStatusBar() {
  if (!STATE.profile) return;
  if (!el('sb_avatar')) renderStatusBar(); // self-heal if not built yet

  const lvl    = getLvl(STATE.totalXP);
  const score  = getFScore();
  const pc     = pColor();
  const streak = sbStreak();

  // ─── Avatar ───
  el('sb_avatar').textContent  = STATE.profile.avatar || '⚡';
  el('sb_avatar').style.cssText += avatarStyle(38);
  el('sb_avatar').style.borderColor = pc + '55';

  // ─── Name · level · pro ───
  el('sb_name').textContent  = STATE.profile.name;
  el('sb_name').style.color  = pc;
  el('sb_level').textContent = lvl.n.toUpperCase() + ' · LV' + lvl.l;
  el('sb_pro').style.display = STATE.isPro ? 'inline-flex' : 'none';

  // ─── XP bar ───
  const pct = lvl.max === Infinity ? 100 : Math.round(((STATE.totalXP - lvl.min) / (lvl.max - lvl.min)) * 100);
  el('sb_xpbar').style.width = pct + '%';

  // ─── Focus ring (conic-gradient) ───
  const ringColor = score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--gold)' : 'var(--red)';
  const deg = Math.round((score / 100) * 360);
  el('sb_ring').style.background =
    'conic-gradient(' + ringColor + ' ' + deg + 'deg, rgba(255,255,255,.05) ' + deg + 'deg)';
  el('sb_score').textContent = score;
  el('sb_score').style.color = score >= 50 ? ringColor : 'var(--t-3)';

  // ─── Streak ───
  el('sb_streak').innerHTML = streak + '<span style="font-size:10px;"> 🔥</span>';
  el('sb_streak').style.color = streak === 0 ? 'var(--t-3)' : streak >= 7 ? 'var(--green)' : 'var(--gold)';
}
