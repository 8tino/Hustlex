// ═══════════════════════════════════════════════════════
// HOME · Dashboard — directive, current block, NN preview,
//        check-in, stats, gate, priorities, daily challenge
// ═══════════════════════════════════════════════════════

// ─── DAILY CHALLENGE ──────────────────────────────────
// chk() lives only here — localStorage can't persist functions, so we store
// the plain data and re-attach chk by id on every read.
const DC_TYPES = [
  { id: 'h4',   title: 'Habits-Sprint',     desc: '4 Habits heute erledigen', target: 4,    reward: 60, chk: () => STATE.day.habits.length },
  { id: 'wat',  title: 'Hydration-Tag',     desc: '3L Wasser trinken',        target: 3000, reward: 50, chk: () => STATE.day.water },
  { id: 'xp80', title: 'XP-Sammler',        desc: '80 XP heute sammeln',      target: 80,   reward: 55, chk: () => STATE.day.xp },
  { id: 'slp',  title: 'Schlaf-Check',      desc: 'Schlaf eintragen',         target: 1,    reward: 35, chk: () => STATE.day.sleep ? 1 : 0 },
  { id: 'rec2', title: 'Recovery-Tag',      desc: '2 Recovery-Methoden',      target: 2,    reward: 45, chk: () => STATE.day.recovery.length },
  { id: 'sup4', title: 'Supplement-Stack',  desc: '4 Supplements nehmen',     target: 4,    reward: 40, chk: () => Object.keys(STATE.day.supps).length },
];

function getDC() {
  const key = 'los_dc_' + new Date().toDateString();
  let dc = ls(key);
  if (!dc) {
    const t = DC_TYPES[new Date().getDate() % DC_TYPES.length];
    dc = { id: t.id, title: t.title, desc: t.desc, target: t.target, reward: t.reward, done: false };
    ls(key, dc);
  }
  const type = DC_TYPES.find(t => t.id === dc.id) || DC_TYPES[0];
  return { ...dc, chk: type.chk };
}
function completeDC() {
  const dc = getDC();
  if (dc.done) return;
  ls('los_dc_' + new Date().toDateString(), { ...dc, done: true });
  addXP(dc.reward, 'discipline');
  showToast('Challenge: +' + dc.reward + ' XP', '🏅');
}

// Compute the three daily domains (0-100) + overall.
function homeDomains() {
  const cfg = getCfg(), t = getTotals(), sh = getSleepHours();
  const koerper = _avg([
    Math.min(1, t.p / cfg.proteinGoal),
    Math.min(1, STATE.day.water / cfg.waterGoal),
    Math.min(1, t.kcal / cfg.kcalGoal),
    STATE.day.sleep ? Math.min(1, parseFloat(sh) / cfg.sleepGoal) : 0,
    Math.min(1, STATE.day.recovery.length / 2),
  ]) * 100;
  const tasks = (typeof getTasksToday === 'function') ? getTasksToday() : ((typeof getTasks === 'function') ? getTasks() : []);
  const td = (typeof getTasksDone === 'function') ? getTasksDone() : [];
  const nn = getNN(), cats = getCats(), plan = getPlan();
  const parts = [];
  if (tasks.length) parts.push(tasks.filter(x => (typeof taskDone === 'function' ? taskDone(x) : td.includes(x.id))).length / tasks.length);
  if (nn.items.length) parts.push(nn.items.filter(i => i.done).length / nn.items.length);
  parts.push([cats.body, cats.mind, cats.discipline].filter(Boolean).length / 3);
  if (plan.blocks.length) parts.push(plan.blocks.filter(b => b.done).length / plan.blocks.length);
  const aufgaben = _avg(parts) * 100;
  const j = ls('los_j_' + today());
  const jFilled = j && (j.gelernt || j.freitext || (j.dankbar || []).some(Boolean));
  const geist = _avg([cats.mind ? 1 : 0, jFilled ? 1 : 0]) * 100;
  return { koerper, aufgaben, geist, overall: Math.round((koerper + aufgaben + geist) / 3) };
}

function renderHome(s) {
  const t = getTotals(), sh = getSleepHours(), gp = goalP(), cfg = getCfg();
  const nn = getNN(), cb = getCurrentBlock(), disc = getDiscState();
  const d = homeDomains();
  s.className = 'screen on stagger';

  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  // ── Greeting ──
  const head = div('');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
  head.innerHTML = '<div><div class="label">' + new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase() + '</div>' +
    '<div class="h2" style="margin-top:1px;">' + greet + ', <span class="gold">' + (STATE.profile?.name || '') + '</span></div></div>';
  const av = h('button', { textContent: STATE.profile?.avatar || '⚡' }, '');
  av.className = 'tap';
  av.style.cssText = 'width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);flex-shrink:0;' + avatarStyle(40);
  av.onclick = showSettings;
  head.appendChild(av);
  s.appendChild(head);

  // ── Hero: 3 SEPARATE gauges (one per life-area) + overall ──
  // Three distinct rings side by side — each its own area, not nested inside
  // one another, so no area looks like "a part of a part".
  const hero = div('glass-hi', '');
  hero.style.cssText = 'padding:18px;';
  hero.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;">' +
    '<div class="label">HEUTE · DEINE 3 BEREICHE</div>' +
    '<div style="font-size:20px;font-weight:800;color:#fff;line-height:1;">' + d.overall + '<span style="font-size:12px;color:var(--t-3);">%</span></div></div>';
  const grid = div('');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;';
  [['#30D158', 'Körper', d.koerper, 'koerper'], ['#0A84FF', 'Aufgaben', d.aufgaben, 'aufgaben'], ['#FF9F0A', 'Geist', d.geist, 'wachstumhub']].forEach(([c, l, pct, view]) => {
    const cell = div('tap', '');
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';
    cell.appendChild(progressRing(pct, pct >= 100 ? '#30D158' : c, 72, 8,
      '<div style="font-size:16px;font-weight:800;color:#fff;line-height:1;">' + Math.round(pct) + '<span style="font-size:10px;color:var(--t-3);">%</span></div>'));
    cell.insertAdjacentHTML('beforeend', '<div style="font-size:12px;color:var(--t-2);font-weight:600;">' + l + '</div>');
    cell.onclick = () => navTo(view);
    grid.appendChild(cell);
  });
  hero.appendChild(grid);
  s.appendChild(hero);

  // ── "Noch offen heute" ──
  const items = [];
  const tasks = (typeof getTasksToday === 'function') ? getTasksToday() : ((typeof getTasks === 'function') ? getTasks() : []);
  const td = (typeof getTasksDone === 'function') ? getTasksDone() : [];
  const tOpen = tasks.filter(x => (typeof taskDone === 'function' ? !taskDone(x) : !td.includes(x.id)));
  if (tOpen.length) items.push({ ic: '☑', title: 'Tasks', sub: (tasks.length - tOpen.length) + '/' + tasks.length + ' · noch: ' + tOpen[0].text, view: 'tasks' });
  if (STATE.day.water < cfg.waterGoal) items.push({ ic: '💧', title: 'Wasser', sub: (STATE.day.water / 1000).toFixed(1) + 'L / ' + (cfg.waterGoal / 1000).toFixed(1) + 'L', water: true });
  if (nn.items.length && !nn.items.every(i => i.done)) items.push({ ic: '◆', title: 'Non-Negotiables', sub: nn.items.filter(i => i.done).length + '/' + nn.items.length + ' erledigt', view: 'fokus', ft: 'disziplin' });
  const cats = getCats();
  if (!(cats.body && cats.mind && cats.discipline)) items.push({ ic: '⚔', title: 'Quests', sub: [cats.body, cats.mind, cats.discipline].filter(Boolean).length + '/3 Kategorien', view: 'quests' });
  if (!STATE.day.sleep) items.push({ ic: '😴', title: 'Schlaf eintragen', sub: 'noch nicht erfasst', view: 'vitals' });
  if (t.p < cfg.proteinGoal) items.push({ ic: '🍽', title: 'Protein', sub: t.p + 'g / ' + cfg.proteinGoal + 'g', view: 'vitals' });
  const j = ls('los_j_' + today());
  if (!(j && (j.gelernt || j.freitext || (j.dankbar || []).some(Boolean)))) items.push({ ic: '✒', title: 'Journal', sub: 'heute noch kein Eintrag', view: 'wachstum' });
  if (typeof kurrNext === 'function') {
    const kn = kurrNext();
    if (kn) items.push({ ic: '🎓', title: 'Kurs: ' + (kn.kurs.kurztitel || kn.kurs.titel), sub: 'Kapitel ' + kn.kap.nr + ': ' + kn.kap.titel, view: 'kurse' });
  }
  if (typeof coursesOpen === 'function') {
    const co = coursesOpen();
    if (co.length) items.push({ ic: '🎓', title: 'Eigener Kurs', sub: co[0].title + ' · ' + courseProgress(co[0]) + '%', view: 'kurse' });
  }

  s.appendChild(div('label', items.length ? 'NOCH OFFEN HEUTE' : 'HEUTE'));
  if (!items.length) {
    const done = div('glass-success', '');
    done.style.cssText = 'text-align:center;padding:22px;';
    done.innerHTML = '<div style="font-size:34px;">🎉</div><div style="font-size:16px;font-weight:700;color:var(--green);margin-top:6px;">Alles erledigt!</div>' +
      '<div style="font-size:13px;color:var(--t-2);margin-top:3px;">Streak +1 heute Abend. Stark, ' + (STATE.profile?.name || '') + '.</div>';
    s.appendChild(done);
  }
  items.slice(0, 6).forEach(it => {
    const row = div('row' + (it.water ? '' : ' tap'), '<span style="font-size:20px;">' + it.ic + '</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:14px;color:var(--t-1);">' + it.title + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:1px;">' + it.sub + '</div></div>');
    if (it.water) {
      // minus (undo) + plus, so water can always be corrected
      const mb = h('button', { textContent: '−' }, '');
      mb.className = 'tap';
      mb.style.cssText = 'width:36px;height:36px;flex:none;border-radius:99px;font-size:16px;font-weight:700;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.25);color:#FF453A;';
      mb.onclick = () => { STATE.day.water = Math.max(0, STATE.day.water - 250); saveDay(); updateStatusBar(); renderScreen('home'); };
      row.appendChild(mb);
      const b = h('button', { textContent: '+250' }, '');
      b.className = 'btn-gold tap';
      b.style.cssText = 'width:auto;padding:8px 14px;border-radius:99px;font-size:13px;font-weight:700;flex:none;';
      b.onclick = () => { STATE.day.water = Math.min(STATE.day.water + 250, 8000); saveDay(); updateStatusBar(); renderScreen('home'); };
      row.appendChild(b);
    } else {
      row.insertAdjacentHTML('beforeend', '<span style="color:var(--t-3);font-size:18px;">›</span>');
      row.onclick = () => { if (it.ft && typeof FOKUS_TAB !== 'undefined') FOKUS_TAB = it.ft; navTo(it.view); };
    }
    s.appendChild(row);
  });

  // ── Streak ──
  const streakCard = div('glass tap', '');
  streakCard.style.cssText = 'display:flex;align-items:center;gap:14px;';
  streakCard.onclick = () => { FOKUS_TAB = 'disziplin'; navTo('fokus'); };
  streakCard.innerHTML = '<span style="font-size:26px;">🔥</span>' +
    '<div style="flex:1;"><div style="font-size:15px;color:var(--t-1);font-weight:600;">Streak · ' + disc.streak + ' Tage</div>' +
    '<div style="font-size:12px;color:var(--t-3);margin-top:1px;">Best: ' + disc.bestStreak + ' · alles schaffen → +1</div></div>' +
    '<span style="color:var(--t-3);font-size:18px;">›</span>';
  s.appendChild(streakCard);

  // ── Ziel im Fokus (weaves goals into the daily hub) ──
  const zieleAll = (ls('los_ziele') || []).filter(z => !z.done);
  if (zieleAll.length && typeof deadlineInfo === 'function') {
    const top = zieleAll.slice().sort((a, b) =>
      (zielPrioRank(a.prio) - zielPrioRank(b.prio)) ||
      ((a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity)))[0];
    const pct = Math.min(100, Math.round(((top.progress || 0) / (top.maxProgress || 10)) * 100));
    const dl = deadlineInfo(top.deadline);
    const gc = div('glass tap', '');
    gc.onclick = () => navTo('ich');
    gc.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span class="label">DEIN ZIEL IM FOKUS</span>' +
      '<span style="font-size:13px;font-weight:700;color:' + pColor() + ';">' + pct + '%</span></div>' +
      '<div style="font-size:15px;font-weight:650;color:var(--t-1);line-height:1.35;">' + top.text + '</div>' +
      (dl ? '<div style="font-size:12px;color:' + dl.c + ';margin-top:4px;">📅 ' + dl.txt + '</div>' : '') +
      (zieleAll.length > 1 ? '<div style="font-size:12px;color:var(--t-3);margin-top:2px;">+ ' + (zieleAll.length - 1) + ' weitere Ziele</div>' : '');
    gc.appendChild(div('bar', '<div class="bar-fill" style="width:' + pct + '%;"></div>'));
    s.appendChild(gc);
    const workBtn = h('button', { textContent: '▶  Heute daran arbeiten' });
    workBtn.className = 'btn btn-glass tap';
    workBtn.style.cssText = 'font-size:13px;margin-top:-4px;';
    workBtn.onclick = e => { e.stopPropagation(); if (typeof goalToToday === 'function') { goalToToday(top); renderScreen('home'); } };
    s.appendChild(workBtn);
  }

  // ── Current time-block (if any) ──
  if (cb) {
    const cbCard = div('glass-accent tap', '');
    cbCard.onclick = () => { FOKUS_TAB = 'plan'; navTo('fokus'); };
    cbCard.innerHTML = '<div style="display:flex;align-items:center;gap:11px;">' +
      '<span style="font-size:24px;">' + cb.icon + '</span>' +
      '<div style="flex:1;min-width:0;"><div class="label gold" style="margin-bottom:2px;">◉ JETZT · ' + cb.start + '–' + cb.end + '</div>' +
      '<div style="font-size:14px;color:var(--t-1);">' + cb.title + '</div></div><span class="gold" style="font-size:14px;">›</span></div>';
    s.appendChild(cbCard);
  }

  // ── Daily challenge (compact) ──
  const dc = getDC();
  const dcPct = Math.min(100, Math.round((Math.min(dc.target, dc.chk()) / dc.target) * 100));
  const dcCard = div(dc.done ? 'glass-success tap' : 'glass tap', '');
  dcCard.onclick = () => { if (!dc.done && dcPct >= 100) { completeDC(); renderScreen('home'); } };
  dcCard.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
    '<span class="label">TAGES-CHALLENGE · +' + dc.reward + ' XP</span>' +
    '<span style="font-size:13px;font-weight:700;color:' + (dc.done ? 'var(--green)' : 'var(--gold)') + ';">' + (dc.done ? '✓' : dcPct + '%') + '</span></div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--t-1);margin-bottom:8px;">' + dc.title + '<span style="font-size:13px;font-weight:400;color:var(--t-3);"> · ' + dc.desc + '</span></div>';
  dcCard.appendChild(div('bar', '<div class="bar-fill" style="width:' + dcPct + '%;' + (dc.done ? 'background:var(--green);' : '') + '"></div>'));
  if (!dc.done && dcPct >= 100) dcCard.insertAdjacentHTML('beforeend', '<div style="text-align:center;font-size:13px;color:var(--green);font-weight:700;margin-top:8px;">Antippen zum Abschließen →</div>');
  s.appendChild(dcCard);

  // ── 7-Tage-Trend (einklappbar, aus den Tagesstatistiken) ──
  s.appendChild(homeTrendCard());

  // ── AI tip ──
  const ctx = 'Nutzer: ' + (STATE.profile?.name || '?') + ', Ziel: ' + gp.name + '. Heute: ' + Math.round(d.overall) + '% erledigt. Offen: ' + (items.map(i => i.title).join(', ') || 'nichts') + '. Energie: ' + (STATE.day.energy || '?') + '/5.';
  s.appendChild(aiBlock('WAS TUE ICH JETZT?', ctx + ' Gib 3 konkrete nächste Schritte. Kein Intro. Deutsch.'));
}

// Last 7 days from the per-day snapshots; today's row uses live values.
function homeWeekStats() {
  const cfg = getCfg(), tot = getTotals();
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(Date.now() - i * 86400000);
    const st = ls('los_daystat_' + dd.toDateString()) || {};
    const live = i === 0;
    out.push({
      d: dd,
      xp: live ? STATE.day.xp : (st.xp || 0),
      p: live ? tot.p : (st.p || 0),
      water: live ? STATE.day.water : (st.water || 0),
      sleep: live ? (parseFloat(getSleepHours()) || 0) : (parseFloat(st.sleepH) || 0),
    });
  }
  return out;
}
// Tiny inline-SVG sparkline.
function sparkline(vals, color, w, h) {
  w = w || 90; h = h || 24; const max = Math.max.apply(null, vals.concat([1]));
  const step = vals.length > 1 ? w / (vals.length - 1) : w;
  const pts = vals.map((v, i) => (i * step).toFixed(1) + ',' + (h - (v / max) * (h - 4) - 2).toFixed(1)).join(' ');
  const last = vals[vals.length - 1], lx = w, ly = h - (last / max) * (h - 4) - 2;
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + (w + 4) + ' ' + h + '" style="overflow:visible;">' +
    '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>' +
    '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="2.6" fill="' + color + '"/></svg>';
}
function homeTrendCard() {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const wk = homeWeekStats();
  const det = document.createElement('details'); det.className = 'glass'; det.style.cssText = 'padding:12px 14px;';
  det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">📈 ' + (EN ? '7-day trend' : '7-Tage-Trend') + '</summary>';
  const body = div(''); body.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:10px;';
  const rows = [
    ['XP', wk.map(x => x.xp), '#FF9F0A', v => Math.round(v)],
    [EN ? 'Sleep' : 'Schlaf', wk.map(x => x.sleep), '#BF5AF2', v => v ? v.toFixed(1) + 'h' : '–'],
    ['Protein', wk.map(x => x.p), '#30D158', v => Math.round(v) + 'g'],
    [EN ? 'Water' : 'Wasser', wk.map(x => x.water), '#0A84FF', v => (v / 1000).toFixed(1) + 'L'],
  ];
  rows.forEach(([label, vals, color, fmt]) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const r = div(''); r.style.cssText = 'display:flex;align-items:center;gap:12px;';
    r.innerHTML = '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);">' + label + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + (EN ? 'today ' : 'heute ') + fmt(vals[vals.length - 1]) + ' · ⌀ ' + fmt(avg) + '</div></div>' +
      '<div style="flex:none;">' + sparkline(vals, color) + '</div>';
    body.appendChild(r);
  });
  det.appendChild(body);
  return det;
}
