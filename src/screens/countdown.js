// ═══════════════════════════════════════════════════════
// COUNTDOWN · Memento Mori + Deadlines
//   Zeigt, wie viel Zeit noch bleibt — bis Deadlines UND fürs Leben.
//   Haltung: Fang jetzt an. Die Meinung anderer ist geliehen, deine Zeit nicht.
// ═══════════════════════════════════════════════════════

function cdCfg() { return Object.assign({ birth: '', expectancy: 82 }, ls('los_countdown') || {}); }
function cdSave(v) { ls('los_countdown', v); }

// Core life math from a birth date + life expectancy (years).
function cdLifeStats(cfg) {
  if (!cfg.birth) return null;
  const birth = new Date(cfg.birth);
  if (isNaN(birth)) return null;
  const now = Date.now();
  const DAY = 86400000, WEEK = 7 * DAY, YEAR = 365.25 * DAY;
  const daysLived = Math.floor((now - birth) / DAY);
  const weeksLived = Math.floor((now - birth) / WEEK);
  const ageYears = Math.floor((now - birth) / YEAR);
  const totalWeeks = Math.round(cfg.expectancy * 52.1775);
  const totalDays = Math.round(cfg.expectancy * 365.25);
  const weeksLeft = Math.max(0, totalWeeks - weeksLived);
  const daysLeft = Math.max(0, totalDays - daysLived);
  const pct = Math.min(100, Math.max(0, (weeksLived / totalWeeks) * 100));
  return { daysLived, weeksLived, ageYears, totalWeeks, totalDays, weeksLeft, daysLeft, pct };
}

function renderCountdown(s) {
  s.className = 'screen on';
  const cfg = cdCfg();
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">DEINE ZEIT</div>' +
    '<div class="h2">Memento <span class="gold italic">Mori</span></div>';

  const stats = cdLifeStats(cfg);

  // ── SETUP (no birth date yet) ──
  if (!stats) {
    const setup = div('glass', '<div style="font-size:13px;color:var(--t-2);line-height:1.6;margin-bottom:12px;">' +
      'Trag dein Geburtsdatum ein — dann siehst du schwarz auf weiß, wie viel Zeit dir noch bleibt. Das ist keine Drohung, sondern dein stärkster Anschub.</div>');
    const bLbl = div('label', 'GEBURTSDATUM'); bLbl.style.cssText = 'font-size:10px;margin-bottom:6px;';
    const bInp = h('input', { type: 'date', value: cfg.birth || '' }); bInp.className = 'inp'; bInp.style.marginBottom = '12px';
    const eLbl = div('label', 'LEBENSERWARTUNG (JAHRE)'); eLbl.style.cssText = 'font-size:10px;margin-bottom:6px;';
    const eInp = h('input', { type: 'number', value: cfg.expectancy, min: 40, max: 120 }); eInp.className = 'inp'; eInp.style.marginBottom = '14px';
    const save = h('button', { textContent: 'Zeit anzeigen' });
    save.className = 'btn tap'; save.style.cssText = 'width:100%;background:var(--blue);color:#fff;font-weight:600;border:none;padding:13px;border-radius:var(--r-md);';
    save.onclick = () => {
      if (!bInp.value) { showToast('Bitte Geburtsdatum wählen', '⚠️'); return; }
      cdSave({ birth: bInp.value, expectancy: Math.min(120, Math.max(40, +eInp.value || 82)) });
      renderScreen('countdown'); haptic('success');
    };
    setup.appendChild(bLbl); setup.appendChild(bInp); setup.appendChild(eLbl); setup.appendChild(eInp); setup.appendChild(save);
    s.appendChild(setup);
    return;
  }

  // ── HERO · weeks left ──
  const hero = div('glass-hi');
  hero.style.cssText = 'text-align:center;padding:22px 16px;margin-top:8px;';
  hero.innerHTML =
    '<div class="label" style="font-size:10px;margin-bottom:8px;">GESCHÄTZT NOCH ÜBRIG</div>' +
    '<div style="font-size:44px;font-weight:800;color:var(--t-1);line-height:1;letter-spacing:-.02em;">' + stats.weeksLeft.toLocaleString('de-DE') + '</div>' +
    '<div style="font-size:13px;color:var(--t-3);margin-top:4px;">Wochen · das sind ' + stats.daysLeft.toLocaleString('de-DE') + ' Tage</div>' +
    '<div style="height:8px;background:rgba(255,255,255,.08);border-radius:6px;margin:16px 0 6px;overflow:hidden;">' +
      '<div style="height:100%;width:' + stats.pct.toFixed(1) + '%;background:linear-gradient(90deg,var(--blue),#FF453A);border-radius:6px;"></div>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--t-3);">' + stats.pct.toFixed(1) + '% deines Lebens sind vorbei · du bist ' + stats.ageYears + '</div>';
  s.appendChild(hero);

  // ── MANTRA ──
  const mantra = div('glass');
  mantra.style.cssText = 'border-left:3px solid #FF453A;margin-top:12px;';
  mantra.innerHTML = '<div style="font-size:15px;font-weight:700;color:var(--t-1);line-height:1.4;">Fang jetzt an.</div>' +
    '<div style="font-size:12px;color:var(--t-2);line-height:1.6;margin-top:6px;">Niemand kommt, um es für dich zu tun. Die Meinung anderer ist geliehen — deine Zeit nicht. In ' + stats.weeksLeft.toLocaleString('de-DE') + ' Wochen zählt nur, was du getan hast, nicht wer was dachte.</div>';
  s.appendChild(mantra);

  // ── HEUTE · wach-Zeit + CTA ──
  const plan = (typeof getPlan === 'function') ? getPlan() : { sleepTime: '23:00' };
  const now = new Date();
  const [sh, sm] = (plan.sleepTime || '23:00').split(':').map(Number);
  const sleepAt = new Date(); sleepAt.setHours(sh, sm, 0, 0);
  let minsAwake = Math.round((sleepAt - now) / 60000);
  if (minsAwake < 0) minsAwake = Math.round((new Date().setHours(23, 59) - now) / 60000);
  const hAwake = Math.floor(minsAwake / 60), mAwake = minsAwake % 60;
  const today = div('glass');
  today.style.cssText = 'margin-top:12px;display:flex;align-items:center;gap:12px;';
  today.innerHTML = '<div style="font-size:22px;">⏳</div>' +
    '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--t-1);">Heute noch wach: ' + (minsAwake > 0 ? hAwake + ' Std ' + mAwake + ' Min' : 'Zeit für Schlaf') + '</div>' +
    '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">Ein Tag von ' + stats.daysLeft.toLocaleString('de-DE') + '. Nutz ihn.</div></div>';
  const go = h('button', { textContent: 'Los →' });
  go.className = 'tap'; go.style.cssText = 'font-size:12px;font-weight:600;padding:8px 14px;background:var(--blue);color:#fff;border:none;border-radius:var(--r-sm);white-space:nowrap;';
  go.onclick = () => { if (typeof FOKUS_TAB !== 'undefined') FOKUS_TAB = 'plan'; navTo('fokus'); };
  today.appendChild(go);
  s.appendChild(today);

  // ── DEADLINES aus Zielen ──
  const goals = (ls('los_ziele') || []).filter(z => !z.done && z.deadline)
    .map(z => ({ z, info: deadlineInfo(z.deadline) }))
    .filter(x => x.info)
    .sort((a, b) => a.info.days - b.info.days)
    .slice(0, 6);
  if (goals.length) {
    const dl = div('label', 'DEADLINES'); dl.style.cssText = 'font-size:10px;margin-top:16px;margin-bottom:2px;'; s.appendChild(dl);
    goals.forEach(({ z, info }) => {
      const r = div('row tap');
      r.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:' + info.c + ';flex:none;"></span>' +
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(z.text) + '</div></div>' +
        '<span style="font-size:11px;font-weight:600;color:' + info.c + ';white-space:nowrap;">' + info.txt + '</span>';
      r.onclick = () => { if (typeof ICH_TAB !== 'undefined') ICH_TAB = 'ZIELE'; navTo('ich'); };
      s.appendChild(r);
    });
  } else {
    const empty = div('glass');
    empty.style.cssText = 'margin-top:16px;';
    empty.innerHTML = '<div style="font-size:12px;color:var(--t-3);line-height:1.6;">Noch keine Ziele mit Deadline. Ein Ziel ohne Frist ist nur ein Wunsch — setz bei einem Ziel ein Datum, dann läuft hier die Uhr.</div>';
    const b = h('button', { textContent: 'Zu den Zielen →' });
    b.className = 'tap'; b.style.cssText = 'margin-top:10px;font-size:12px;font-weight:600;padding:8px 14px;background:rgba(255,255,255,.06);border:1px solid var(--edge);border-radius:var(--r-sm);color:var(--t-2);';
    b.onclick = () => navTo('ich');
    empty.appendChild(b);
    s.appendChild(empty);
  }

  // ── WOCHEN-GITTER (memento mori) ──
  const grid = section('◫ Dein Leben in Wochen', 'cd_grid', false);
  const dots = [];
  const cap = stats.totalWeeks;
  for (let i = 0; i < cap; i++) {
    const past = i < stats.weeksLived;
    dots.push('<span style="width:5px;height:5px;border-radius:1px;background:' + (past ? 'var(--blue)' : 'rgba(255,255,255,.12)') + ';"></span>');
  }
  grid._body.innerHTML = '<div style="font-size:11px;color:var(--t-3);margin-bottom:10px;line-height:1.5;">Jeder Punkt = eine Woche. Blau ist vorbei. Der Rest ist alles, was du hast.</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:2px;">' + dots.join('') + '</div>';
  grid.style.marginTop = '16px';
  s.appendChild(grid);

  // ── Einstellungen ──
  const edit = h('button', { textContent: '⚙ Geburtsdatum / Erwartung ändern' });
  edit.className = 'btn btn-ghost tap'; edit.style.cssText = 'width:100%;margin-top:14px;font-size:12px;';
  edit.onclick = () => { cdSave({ birth: '', expectancy: cfg.expectancy }); renderScreen('countdown'); };
  s.appendChild(edit);
}
