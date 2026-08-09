// ═══════════════════════════════════════════════════════
// FOKUS · Discipline Engine + Day Planner
//   Streak · Non-Negotiables · KI-Tagesplaner · Iron Vows · Abrechnung
//   ⚠ Engine logic is battle-tested — kept verbatim, only styling is new.
// ═══════════════════════════════════════════════════════

// ─── DISCIPLINE STATE ─────────────────────────────────
function getDiscState() {
  return ls('los_disc') || { streak: 0, bestStreak: 0, lastReviewDate: null, lastBreakDate: null, lastBreakReason: null, vows: [] };
}
function saveDiscState(s) { ls('los_disc', s); }

// ─── NON-NEGOTIABLES ──────────────────────────────────
function getNN() { return ls('los_nn_' + today()) || { items: [], reviewed: false, allDone: false }; }
function saveNN(d) { ls('los_nn_' + today(), d); }
function addNN(text) {
  const d = getNN();
  if (d.items.length >= 7) { showToast('Max 7 Non-Negotiables'); return; }
  d.items.push({ id: Date.now(), text: text.trim(), done: false });
  saveNN(d);
}
function toggleNN(id) {
  const d = getNN();
  const it = d.items.find(x => x.id === id);
  if (!it) return;
  it.done = !it.done;
  if (it.done) { haptic('success'); addXP(15, 'discipline'); }
  saveNN(d);
}
function delNN(id) {
  const d = getNN();
  d.items = d.items.filter(x => x.id !== id);
  saveNN(d);
}

// ─── STREAK ───────────────────────────────────────────
function bumpStreak() {
  const s = getDiscState();
  s.streak++;
  if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  s.lastReviewDate = today();
  saveDiscState(s);
  haptic('levelup');
  showToast('Streak +1 → ' + s.streak, '🔥');
  addXP(50, 'discipline');
}
function breakStreak(reason) {
  const s = getDiscState();
  const prev = s.streak;
  s.streak = 0;
  s.lastBreakDate = today();
  s.lastBreakReason = reason || 'Nicht alle NN erledigt';
  s.lastReviewDate = today();
  saveDiscState(s);
  haptic('warn');
  if (prev >= 3) showToast('Streak gebrochen bei ' + prev, '💔');
}
function reviewToday() {
  const nn = getNN();
  const vows = getDiscState().vows.filter(v => v.status === 'active');
  return {
    nnDone: nn.items.length > 0 && nn.items.every(i => i.done),
    nnCount: nn.items.length,
    nnComplete: nn.items.filter(i => i.done).length,
    vows,
  };
}

// ─── DAY PLANNER ──────────────────────────────────────
// Plans are stored per day (key los_plan_<toDateString>). getPlan()/savePlan()
// default to TODAY so every non-planner caller (home, assistant, achievements,
// goalToToday) stays on today. The planner passes an explicit date (PLAN_DATE)
// to view/edit upcoming days without touching today's logic.
let PLAN_DATE = null; // set to a toDateString() while planning a future day; null = today
function planDate() { return PLAN_DATE || today(); }
function getPlan(dateStr) { return ls('los_plan_' + (dateStr || today())) || { blocks: [], brainDump: [], wakeTime: '07:00', sleepTime: '23:00' }; }
function savePlan(p, dateStr) { ls('los_plan_' + (dateStr || today()), p); }
function timeToMin(t) { const [hh, m] = t.split(':').map(Number); return hh * 60 + m; }
function minToTime(m) { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
function getCurrentBlock() {
  const p = getPlan(today()); // "now" is only meaningful for today
  if (!p.blocks.length) return null;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  return p.blocks.find(b => { const s = timeToMin(b.start), e = timeToMin(b.end); return now >= s && now < e; });
}

// Next open step of the top-priority goal (so the day always moves a goal forward).
function topGoalStep() {
  const ziele = (ls('los_ziele') || []).filter(z => !z.done);
  if (!ziele.length) return null;
  const rank = k => ({ hoch: 0, mittel: 1, niedrig: 2 }[k] != null ? { hoch: 0, mittel: 1, niedrig: 2 }[k] : 1);
  const top = ziele.slice().sort((a, b) =>
    (rank(a.prio) - rank(b.prio)) ||
    ((a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity)))[0];
  const sub = (top.subs || []).find(s => !s.done);
  return { goal: top, text: sub ? sub.text : top.text };
}

async function aiPlanDay() {
  const ds = planDate();
  const p = getPlan(ds);
  const anchors = (typeof anchorsForDate === 'function') ? anchorsForDate(new Date(ds)) : [];
  // Open daily tasks + top goal step feed the plan too, not just the brain dump.
  const openTasks = (typeof getTasks === 'function')
    ? getTasks().filter(t => !(typeof getTasksDone === 'function' ? getTasksDone() : []).includes(t.id)) : [];
  const gs = topGoalStep();
  if (!p.brainDump.length && !anchors.length && !openTasks.length && !gs) {
    showToast('Nichts zu planen – füg Termine, Tasks oder Ideen hinzu', '⚠'); return null;
  }
  const prof = STATE.profile;
  const energy = STATE.day.energy || 3;
  const goalNames = prof?.goalNames || goalP().name;

  const toDo = [
    ...p.brainDump.map(t => '- ' + t.text + (t.duration ? ' (' + t.duration + 'min)' : '') + (t.priority === 'high' ? ' [PRIO]' : '')),
    ...openTasks.map(t => '- ' + t.text + ' [tägliche Aufgabe]'),
    ...(gs ? ['- ' + gs.text + ' [ZIEL-Schritt: ' + gs.goal.text + ']'] : []),
  ].join('\n') || '(keine losen Aufgaben)';

  const feste = anchors.length
    ? anchors.map(a => '- ' + a.start + '–' + a.end + ' ' + a.title + ' (FEST, nicht verschieben)').join('\n')
    : '(keine)';

  const prompt = 'Plane den TAG eines Hochleistungs-Menschen. Baue den Plan UM die festen Termine herum.\n\n' +
    'NUTZER: ' + (prof?.name || '?') + ', Ziel: ' + goalNames + '\nENERGIE HEUTE: ' + energy + '/5\nAUFSTEHEN: ' + p.wakeTime + '\nSCHLAFENGEHEN: ' + p.sleepTime + '\n\n' +
    'FESTE TERMINE (EXAKT so übernehmen, Zeiten nicht ändern):\n' + feste + '\n\n' +
    'EINZUPLANEN (in die freien Lücken):\n' + toDo + '\n\n' +
    'REGELN:\n- Feste Termine bleiben unverändert; plane den Rest in die Lücken dazwischen\n- Der ZIEL-Schritt bekommt einen festen Block (so kommt der Nutzer seinem Ziel näher)\n- Deep Work früh, wenn Energie hoch; Mahlzeiten + Pausen nicht vergessen\n- Realistisch, lieber weniger; Block-Dauer 30–120min; Zeit als HH:MM (24h)\n\n' +
    'AUSGABE: NUR ein JSON-Array (inkl. der festen Termine), kein Text:\n[{"start":"06:30","end":"06:45","title":"Morgenroutine","icon":"☀","type":"routine"}]\n' +
    'icons: ☀ 🧠 💼 🏋 🍳 🍽 📞 📧 🧘 📖 🚶 🌙 📅 🎯\ntypes: routine, work, training, meal, admin, break, deep, social, sleep, goal';

  const txt = await callAI(prompt, 'Du bist ein Tages-Planner. Antworte NUR mit gueltigem JSON-Array, kein Markdown, kein Text drumherum.', 1600);
  let json = txt.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const start = json.indexOf('['), end = json.lastIndexOf(']');
  if (start >= 0 && end >= 0) json = json.slice(start, end + 1);
  try {
    const blocks = JSON.parse(json);
    if (!Array.isArray(blocks)) throw new Error('not array');
    const cleanBlocks = blocks.filter(b => b.start && b.end && b.title).map((b, i) => ({
      id: Date.now() + i, start: b.start, end: b.end, title: b.title,
      icon: b.icon || '◇', type: b.type || 'task', done: false,
    }));
    // Guarantee the fixed anchors survive even if the model dropped one.
    anchors.forEach((a, i) => {
      if (!cleanBlocks.some(b => b.start === a.start && b.title === a.title)) {
        cleanBlocks.push({ id: Date.now() + 500 + i, start: a.start, end: a.end, title: a.title, icon: a.icon, type: a.type, done: false, anchor: a.anchor });
      }
    });
    cleanBlocks.sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
    p.blocks = cleanBlocks;
    p.createdAt = Date.now(); p.materialized = true;
    savePlan(p, ds);
    if (ds === today() && !STATE.day.habits.includes('plan')) {
      STATE.day.habits.push('plan'); STATE.day.xp += 15; addXP(15, 'discipline'); saveDay();
    }
    return cleanBlocks;
  } catch (e) {
    showToast('KI-Antwort nicht parsbar', '⚠');
    return null;
  }
}

// Deterministic day planner — NO AI. Lays out the day by priority around the
// fixed anchors (Kalender + feste Wochenzeiten): high-priority items first,
// filling the gaps between fixed blocks from wake to sleep.
function planDayByPriority() {
  const ds = planDate();
  const p = getPlan(ds);
  const wake = timeToMin(p.wakeTime || '07:00');
  let dayEnd = timeToMin(p.sleepTime || '23:00');
  if (dayEnd <= wake) dayEnd = 1439; // sleep after midnight → plan until end of day

  const anchors = ((typeof anchorsForDate === 'function') ? anchorsForDate(new Date(ds)) : [])
    .map(a => Object.assign({}, a))
    .sort((x, y) => timeToMin(x.start) - timeToMin(y.start));

  // Build the to-schedule queue, sorted by priority.
  const queue = [];
  const gs = topGoalStep && topGoalStep();
  if (gs) queue.push({ title: '🎯 ' + gs.text, icon: '🎯', mins: 60, prio: 0, type: 'goal' });
  p.brainDump.forEach(t => queue.push({ title: t.text, icon: '◇', mins: t.duration || 60, prio: t.priority === 'high' ? 0 : 2, type: 'task' }));
  const openTasks = (typeof getTasks === 'function')
    ? getTasks().filter(t => !((typeof getTasksDone === 'function') ? getTasksDone() : []).includes(t.id)) : [];
  openTasks.forEach(t => queue.push({ title: (t.icon ? t.icon + ' ' : '') + t.text, icon: t.icon || '☑', mins: 30, prio: 1, type: 'task' }));
  queue.sort((a, b) => a.prio - b.prio);

  if (!anchors.length && !queue.length) {
    showToast('Nichts zu planen – füg Termine, Tasks oder Ideen hinzu', '⚠');
    return null;
  }

  const blocks = [];
  let cursor = wake;
  const GAP_MIN = 25;
  const fillUntil = until => {
    while (queue.length && until - cursor >= GAP_MIN) {
      const it = queue.shift();
      const dur = Math.min(it.mins || 60, until - cursor);
      blocks.push({ id: Date.now() + blocks.length, start: minToTime(cursor), end: minToTime(cursor + dur), title: it.title, icon: it.icon, type: it.type, done: false });
      cursor += dur;
    }
    if (cursor < until) cursor = until;
  };

  anchors.forEach(a => {
    const aStart = timeToMin(a.start), aEnd = timeToMin(a.end);
    if (aStart > cursor) fillUntil(aStart);
    blocks.push({ id: Date.now() + blocks.length, start: a.start, end: a.end, title: a.title, icon: a.icon, type: a.type, done: false, anchor: a.anchor });
    if (aEnd > aStart) cursor = Math.max(cursor, aEnd);
  });
  fillUntil(dayEnd);

  blocks.sort((x, y) => timeToMin(x.start) - timeToMin(y.start));
  p.blocks = blocks;
  p.materialized = true;
  p.createdAt = Date.now();
  savePlan(p, ds);
  if (ds === today() && !STATE.day.habits.includes('plan')) {
    STATE.day.habits.push('plan'); STATE.day.xp += 15; addXP(15, 'discipline'); saveDay();
  }
  return blocks;
}

// ─── 1-TAP BLOCK PRESETS ──────────────────────────────
// Planning should cost one tap, not a form. Each preset already knows its
// icon, length and type — tap it and it lands in the next free slot.
const PLAN_PRESETS = [
  { g: 'Arbeit',  items: [
    { t: 'Deep Work',    ic: '🧠', m: 90, ty: 'deep' },
    { t: 'Arbeit',       ic: '💼', m: 120, ty: 'work' },
    { t: 'Meeting',      ic: '📞', m: 60, ty: 'work' },
    { t: 'Admin/Mails',  ic: '📧', m: 45, ty: 'admin' },
    { t: 'Lernen',       ic: '📖', m: 60, ty: 'deep' },
    { t: 'Content',      ic: '🎬', m: 90, ty: 'work' },
  ] },
  { g: 'Körper',  items: [
    { t: 'Training',     ic: '🏋', m: 75, ty: 'training' },
    { t: 'Cardio',       ic: '🏃', m: 40, ty: 'training' },
    { t: 'Spaziergang',  ic: '🚶', m: 30, ty: 'break' },
    { t: 'Mahlzeit',     ic: '🍽', m: 30, ty: 'meal' },
    { t: 'Meal Prep',    ic: '🍳', m: 45, ty: 'meal' },
    { t: 'Sauna/Kälte',  ic: '♨', m: 30, ty: 'break' },
  ] },
  { g: 'Kopf',    items: [
    { t: 'Morgenroutine', ic: '☀', m: 30, ty: 'routine' },
    { t: 'Meditation',    ic: '🧘', m: 15, ty: 'routine' },
    { t: 'Journal',       ic: '✒', m: 15, ty: 'routine' },
    { t: 'Pause',         ic: '☕', m: 15, ty: 'break' },
    { t: 'Familie/Freunde', ic: '💬', m: 90, ty: 'social' },
    { t: 'Runterfahren',  ic: '🌙', m: 30, ty: 'sleep' },
  ] },
];

// Where does the next block start? After the last planned block, else "now"
// rounded up to the next quarter hour, but never before wake time.
function nextFreeStart() {
  const p = getPlan(planDate());
  if (p.blocks.length) {
    return p.blocks.reduce((mx, b) => Math.max(mx, timeToMin(b.end)), 0);
  }
  // For a future day, start at wake time; for today, round "now" up.
  const wake = timeToMin(p.wakeTime || '07:00');
  if (planDate() !== today()) return wake;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const rounded = Math.ceil(now / 15) * 15;
  return Math.max(rounded, wake);
}

function addBlock({ title, icon, mins, type, start }) {
  const p = getPlan(planDate());
  // Keep every block inside the same calendar day — a wrapped end time (00:45)
  // would sort to the top of the timeline.
  const sM = Math.min(start != null ? start : nextFreeStart(), 1425);
  const eM = Math.min(sM + (mins || 60), 1439);
  p.blocks.push({
    id: Date.now() + Math.floor(Math.random() * 999),
    start: minToTime(sM), end: minToTime(eM),
    title: title, icon: icon || '◇', type: type || 'task', done: false,
  });
  p.blocks.sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
  savePlan(p, planDate());
  if (planDate() === today() && !STATE.day.habits.includes('plan')) {
    STATE.day.habits.push('plan'); STATE.day.xp += 15; addXP(15, 'discipline'); saveDay();
  }
  haptic('light');
}

// Edit sheet for a single block — time, length, name, icon. Also used for
// "eigener Block" (blk = null).
function editBlock(blk) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  const isNew = !blk;
  const draft = blk
    ? Object.assign({}, blk)
    : { start: minToTime(nextFreeStart()), end: minToTime(nextFreeStart() + 60), title: '', icon: '◇', type: 'task' };

  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (isNew ? 'NEUER BLOCK' : 'BLOCK BEARBEITEN') + '</div>' +
    '<div class="h2" style="margin-bottom:18px;">Wann & <span class="gold">was</span>?</div>');

  const card = div('glass', '');

  // name
  card.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:6px;">NAME</div>');
  const nameI = h('input', { type: 'text', value: draft.title, placeholder: 'z.B. Deep Work', maxLength: 40 });
  nameI.className = 'inp'; nameI.style.cssText = 'width:100%;margin-bottom:14px;';
  card.appendChild(nameI);

  // icon picker
  card.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:6px;">ICON</div>');
  const icRow = div(''); icRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;';
  const ICONS = ['◇', '🧠', '💼', '📞', '📧', '📖', '🎬', '🏋', '🏃', '🚶', '🍽', '🍳', '♨', '☀', '🧘', '✒', '☕', '💬', '🌙', '💸', '🎯'];
  const icBtns = [];
  ICONS.forEach(ic => {
    const b = h('button', { textContent: ic });
    b.className = 'tap';
    b.style.cssText = 'width:38px;height:38px;border-radius:12px;font-size:17px;background:rgba(255,255,255,.06);border:1px solid var(--edge);';
    b.onclick = () => { draft.icon = ic; icBtns.forEach(x => x.style.borderColor = 'var(--edge)'); b.style.borderColor = pColor(); };
    if (ic === draft.icon) b.style.borderColor = pColor();
    icBtns.push(b); icRow.appendChild(b);
  });
  card.appendChild(icRow);

  // start time
  card.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:6px;">START</div>');
  const startI = h('input', { type: 'time', value: draft.start });
  startI.className = 'inp'; startI.style.cssText = 'width:100%;margin-bottom:14px;';
  card.appendChild(startI);

  // duration chips
  card.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:6px;">DAUER</div>');
  let dur = Math.max(5, timeToMin(draft.end) - timeToMin(draft.start));
  const durRow = div(''); durRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
  const durBtns = [];
  [15, 30, 45, 60, 90, 120, 180, 240].forEach(m => {
    const b = h('button', { textContent: m < 60 ? m + 'm' : (m / 60) + 'h' });
    b.className = 'itab tap';
    b.style.cssText = 'flex:0 0 auto;padding:8px 14px;';
    b.onclick = () => { dur = m; durBtns.forEach(x => x.classList.remove('on')); b.classList.add('on'); };
    if (m === dur) b.classList.add('on');
    durBtns.push(b); durRow.appendChild(b);
  });
  card.appendChild(durRow);
  inner.appendChild(card);

  const save = h('button', { textContent: isNew ? 'BLOCK HINZUFÜGEN' : 'SPEICHERN' });
  save.className = 'btn btn-gold tap'; save.style.marginTop = '12px';
  save.onclick = () => {
    const title = nameI.value.trim() || 'Block';
    if (isNew) addBlock({ title, icon: draft.icon, mins: dur, type: draft.type, start: timeToMin(startI.value || draft.start) });
    else {
      const p = getPlan(planDate()); const b = p.blocks.find(x => x.id === blk.id); if (!b) return closeOverlay();
      b.title = title; b.icon = draft.icon;
      b.start = startI.value || b.start;
      b.end = minToTime(Math.min(timeToMin(b.start) + dur, 1439));
      p.blocks.sort((a, c) => timeToMin(a.start) - timeToMin(c.start));
      savePlan(p, planDate());
    }
    closeOverlay(); renderScreen('fokus');
  };
  inner.appendChild(save);

  if (!isNew) {
    const del = h('button', { textContent: 'BLOCK LÖSCHEN' });
    del.className = 'btn btn-ghost tap';
    del.style.cssText = 'margin-top:8px;color:var(--red);border-color:rgba(225,104,104,.25);font-size:11px;';
    del.onclick = () => {
      const p = getPlan(planDate()); p.blocks = p.blocks.filter(x => x.id !== blk.id); savePlan(p, planDate());
      closeOverlay(); renderScreen('fokus');
    };
    inner.appendChild(del);
  }
  openOverlay();
}

// ─── SCREEN ───────────────────────────────────────────
let FOKUS_TAB = 'plan'; // plan | disziplin

function renderFokus(s) {
  // Tagesplan vs. Disziplin is driven by the Aufgaben hub sub-tab bar (FOKUS_TAB).
  s.className = 'screen on';
  const panel = div('');
  panel.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
  if (FOKUS_TAB === 'disziplin') renderDisziplin(panel);
  else renderPlanner(panel);
  s.appendChild(panel);
}

// ─── TAB 1 · TAGESPLAN (1 Tap pro Block) ──────────────
function renderPlanner(s) {
  const ds = planDate();
  const isToday = ds === today();

  // ── Day strip: Heute + next 6 days (plan ahead) ──
  const strip = div(''); strip.style.cssText = 'display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:4px;';
  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const dStr = d.toDateString();
    const cnt = (getPlan(dStr).blocks || []).length;
    const active = dStr === ds;
    const b = h('button', {});
    b.className = 'tap';
    b.style.cssText = 'flex:0 0 auto;min-width:52px;padding:8px 6px;border-radius:14px;text-align:center;border:1px solid ' +
      (active ? pColor() : 'var(--edge)') + ';background:' + (active ? pColor() + '22' : 'transparent') + ';';
    b.innerHTML = '<div style="font-size:11px;color:' + (active ? pColor() : 'var(--t-3)') + ';">' + (i === 0 ? 'Heute' : i === 1 ? 'Morgen' : WD[d.getDay()]) + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--t-1);margin-top:2px;">' + d.getDate() + '</div>' +
      (cnt ? '<div style="font-size:10px;color:' + pColor() + ';margin-top:1px;">' + cnt + '</div>' : '<div style="font-size:10px;color:transparent;margin-top:1px;">0</div>');
    b.onclick = () => { PLAN_DATE = (i === 0 ? null : dStr); renderScreen('fokus'); };
    strip.appendChild(b);
  }
  s.appendChild(strip);

  // Beliebiges Datum wählen — auch weit in die Zukunft (nicht nur die Woche).
  const dateRow = div(''); dateRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px;';
  dateRow.insertAdjacentHTML('beforeend', '<span style="font-size:12px;color:var(--t-3);flex:1;">Anderes Datum planen:</span>');
  const dpick = h('input', { type: 'date', value: new Date(ds).toISOString().slice(0, 10), min: new Date().toISOString().slice(0, 10) });
  dpick.className = 'inp'; dpick.style.cssText = 'width:auto;font-size:14px;padding:8px 10px;';
  dpick.onchange = e => { if (!e.target.value) return; const d = new Date(e.target.value + 'T00:00:00'); PLAN_DATE = (d.toDateString() === today() ? null : d.toDateString()); renderScreen('fokus'); };
  dateRow.appendChild(dpick);
  s.appendChild(dateRow);

  // Auto-insert fixed times once per day — only for TODAY (future days on demand).
  let plan = getPlan(ds);
  if (isToday && !plan.materialized && typeof materializeDay === 'function') {
    if (anchorsForDate(new Date(ds)).length) materializeDay(ds);
    plan = getPlan(ds); plan.materialized = true; savePlan(plan, ds);
  }
  const nowM = new Date().getHours() * 60 + new Date().getMinutes();

  if (isToday) {
    // "Jetzt"-Karte — was läuft gerade, ein Tap zum Abhaken
    const cur = getCurrentBlock();
    const nxt = plan.blocks.find(b => timeToMin(b.start) > nowM);
    const now = div('glass-hi', '');
    if (cur) {
      const restM = timeToMin(cur.end) - nowM;
      now.innerHTML = '<div class="label" style="margin-bottom:8px;">JETZT · noch ' + restM + ' Min</div>' +
        '<div style="display:flex;align-items:center;gap:14px;">' +
        '<div style="font-size:34px;line-height:1;">' + (cur.icon || '◇') + '</div>' +
        '<div style="flex:1;min-width:0;"><div style="font-size:19px;font-weight:650;color:var(--t-1);">' + cur.title + '</div>' +
        '<div style="font-size:13px;color:var(--t-3);margin-top:2px;">' + cur.start + ' – ' + cur.end + '</div></div></div>';
      const btn = h('button', { textContent: cur.done ? '✓ ERLEDIGT' : cur.started ? '✓ FERTIG' : '▶ STARTEN' });
      btn.className = 'btn tap ' + (cur.done ? 'btn-success' : 'btn-gold');
      btn.style.marginTop = '12px';
      btn.onclick = () => {
        const p = getPlan(today()); const b = p.blocks.find(x => x.id === cur.id);
        if (!b.started && !b.done) { b.started = true; haptic('light'); }
        else if (!b.done) { b.done = true; haptic('success'); addXP(10, 'discipline'); showToast('Block erledigt', '✓'); }
        else { b.started = false; b.done = false; }
        savePlan(p, today()); renderScreen('fokus');
      };
      now.appendChild(btn);
    } else if (nxt) {
      now.innerHTML = '<div class="label" style="margin-bottom:8px;">ALS NÄCHSTES · ' + (timeToMin(nxt.start) - nowM) + ' Min</div>' +
        '<div style="display:flex;align-items:center;gap:14px;"><div style="font-size:30px;">' + (nxt.icon || '◇') + '</div>' +
        '<div><div style="font-size:17px;font-weight:600;color:var(--t-1);">' + nxt.title + '</div>' +
        '<div style="font-size:13px;color:var(--t-3);">ab ' + nxt.start + '</div></div></div>';
    } else {
      now.innerHTML = '<div class="label" style="margin-bottom:6px;">FREIE ZEIT</div>' +
        '<div style="font-size:14px;color:var(--t-2);line-height:1.5;">' +
        (plan.blocks.length ? 'Kein Block geplant gerade. Tippe unten einen an.' : 'Tippe unten an, was du heute machst — ein Tap pro Block.') + '</div>';
    }
    s.appendChild(now);
  } else {
    // Future day header
    const d = new Date(ds);
    const hd = div('glass-hi', '<div class="label" style="margin-bottom:4px;">PLAN FÜR</div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--t-1);">' + d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>' +
      '<div style="font-size:13px;color:var(--t-3);margin-top:2px;">' + plan.blocks.length + ' Blöcke geplant</div>');
    s.appendChild(hd);
  }

  // Zeitstrahl
  if (plan.blocks.length) {
    const doneN = plan.blocks.filter(b => b.done).length;
    const head = div('');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:6px;';
    head.innerHTML = '<div class="label">ABLAUF · ' + doneN + '/' + plan.blocks.length + '</div>';
    const clr = h('button', { textContent: 'leeren' });
    clr.style.cssText = 'background:none;color:var(--t-3);font-size:12px;';
    clr.onclick = () => { if (confirm('Tagesplan leeren?')) { const p = getPlan(ds); p.blocks = []; savePlan(p, ds); renderScreen('fokus'); } };
    head.appendChild(clr);
    s.appendChild(head);

    plan.blocks.forEach(b => {
      const sM = timeToMin(b.start), eM = timeToMin(b.end);
      const isNow = isToday && nowM >= sM && nowM < eM, isPast = isToday && nowM >= eM;
      const r = div('tblock' + (isNow ? ' tblock-now anim-pulse-glow' : '') + (b.done ? ' tblock-done' : isPast && !b.done ? ' tblock-past' : ''), '');
      r.innerHTML = '<div class="tblock-time">' + b.start + '<br/><span style="font-size:11px;color:var(--t-4);">' + b.end + '</span></div>' +
        '<span class="tblock-ic">' + (b.icon || '◇') + '</span>' +
        '<div class="tblock-info" style="flex:1;min-width:0;"><div class="tblock-title">' + b.title + '</div>' +
        '<div class="tblock-meta">' + (eM - sM) + ' Min' + (b.done ? ' · erledigt' : b.started ? ' · läuft' : '') + '</div></div>';
      // Haken links = erledigt, Tap auf die Zeile = bearbeiten
      const chk = div('check tap' + (b.done ? ' on' : ''), '');
      chk.style.flex = 'none';
      chk.onclick = e => {
        e.stopPropagation();
        const p = getPlan(ds); const bb = p.blocks.find(x => x.id === b.id);
        bb.done = !bb.done; if (bb.done) { bb.started = false; haptic('success'); if (isToday) addXP(10, 'discipline'); }
        savePlan(p, ds); renderScreen('fokus');
      };
      r.appendChild(chk);
      r.onclick = () => editBlock(b);
      s.appendChild(r);
    });
  }

  // Tag automatisch planen — nach Prioritäten, ohne KI (der "App plant den Tag"-Teil)
  const planBtn = h('button', { textContent: '⚡  TAG NACH PRIORITÄTEN PLANEN' });
  planBtn.className = 'btn btn-gold tap';
  planBtn.style.marginTop = '6px';
  planBtn.onclick = () => {
    const blocks = planDayByPriority();
    if (blocks) { haptic('success'); showToast(blocks.length + ' Blöcke geplant', '🗓'); renderScreen('fokus'); }
  };
  s.appendChild(planBtn);
  const planHint = div('', 'Ordnet feste Termine + wichtigste Tasks/Ziele automatisch nach Priorität in den Tag. Danach frei verschiebbar.');
  planHint.style.cssText = 'font-size:12px;color:var(--t-3);margin:-2px 0 2px;line-height:1.5;';
  s.appendChild(planHint);

  const anchors = (typeof anchorsForDate === 'function') ? anchorsForDate(new Date(ds)) : [];
  const missingAnchors = anchors.filter(a => !plan.blocks.some(b => b.anchor === a.anchor));
  if (missingAnchors.length) {
    const useBtn = h('button', { textContent: '↓  ' + missingAnchors.length + ' feste Zeit(en) einsetzen' });
    useBtn.className = 'btn btn-glass tap'; useBtn.style.cssText = 'margin-top:4px;font-size:13px;';
    useBtn.onclick = () => { const n = materializeDay(ds); showToast(n + ' feste Blöcke eingesetzt', '📌'); renderScreen('fokus'); };
    s.appendChild(useBtn);
  }
  const calRow = div(''); calRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
  const calBtn = h('button', { textContent: '📅 Kalender & feste Zeiten' });
  calBtn.className = 'btn btn-glass tap'; calBtn.style.cssText = 'flex:1;min-width:150px;font-size:13px;';
  calBtn.onclick = () => openKalender();
  calRow.appendChild(calBtn);
  const aiBtn = h('button', { textContent: '✦ Mit KI planen' });
  aiBtn.className = 'btn btn-glass tap'; aiBtn.style.cssText = 'flex:1;min-width:150px;font-size:13px;';
  aiBtn.onclick = async () => {
    aiBtn.disabled = true; aiBtn.innerHTML = '<span class="anim-spin">⚙</span> …';
    const blocks = await aiPlanDay();
    aiBtn.disabled = false; aiBtn.textContent = '✦ Mit KI planen';
    if (blocks) { haptic('success'); showToast(blocks.length + ' Blöcke geplant', '🗓'); renderScreen('fokus'); }
  };
  calRow.appendChild(aiBtn);
  // calRow wird unten in den „Kalender, KI-Plan & Ideen"-Abschnitt gehängt.

  // 1-Tap-Bausteine — eingeklappt, damit der Plan oben kompakt bleibt
  const addSec = section('＋ Block hinzufügen · 1 Tap', 'f_add', false); const ab = addSec._body;
  const sub = div('', 'Landet automatisch ab ' + minToTime(nextFreeStart()) + '. Antippen zum Ändern.');
  sub.style.cssText = 'font-size:12px;color:var(--t-3);margin-top:-2px;';
  ab.appendChild(sub);

  PLAN_PRESETS.forEach(grp => {
    const c = div('glass', '<div class="label" style="margin-bottom:8px;">' + grp.g + '</div>');
    const row = div(''); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;';
    grp.items.forEach(it => {
      const b = h('button', { textContent: it.ic + '  ' + it.t + '  ' + (it.m < 60 ? it.m + 'm' : (it.m / 60) + 'h') });
      b.className = 'itab tap';
      b.style.cssText = 'flex:0 0 auto;padding:9px 13px;font-size:13px;letter-spacing:0;text-transform:none;';
      b.onclick = () => { addBlock({ title: it.t, icon: it.ic, mins: it.m, type: it.ty }); renderScreen('fokus'); };
      row.appendChild(b);
    });
    c.appendChild(row);
    ab.appendChild(c);
  });

  const ownBtn = h('button', { textContent: '＋  EIGENER BLOCK' });
  ownBtn.className = 'btn btn-glass tap';
  ownBtn.onclick = () => editBlock(null);
  ab.appendChild(ownBtn);
  if (moduleOn('f_add')) s.appendChild(addSec);

  // Kalender, KI-Plan, Weckzeiten & Ideen — gebündelt & eingeklappt für einen cleanen Plan
  const optSec = section('📅 Kalender, KI-Plan & Ideen', 'f_opt', false);
  const body = optSec._body;
  body.appendChild(calRow);

  const wsRow = div(''); wsRow.style.cssText = 'display:flex;gap:8px;';
  [['wakeTime', '☀ AUFSTEHEN'], ['sleepTime', '🌙 SCHLAFEN']].forEach(([k, l]) => {
    const cell = div('', '<div class="label" style="margin-bottom:4px;">' + l + '</div>');
    cell.style.cssText = 'flex:1;';
    const ti = h('input', { type: 'time', value: plan[k] });
    ti.className = 'inp'; ti.style.cssText = 'width:100%;font-size:15px;';
    ti.onchange = e => { const pp = getPlan(ds); pp[k] = e.target.value; savePlan(pp, ds); };
    cell.appendChild(ti); wsRow.appendChild(cell);
  });
  body.appendChild(wsRow);

  // Ideen (Brain Dump)
  body.appendChild(div('label', 'IDEEN · KI VERPLANT SIE'));
  plan.brainDump.forEach(t => {
    const r = div('row', '<span style="font-size:13px;color:' + (t.priority === 'high' ? 'var(--gold)' : 'var(--t-2)') + ';flex:1;">' +
      (t.priority === 'high' ? '⚡ ' : '') + t.text + (t.duration ? ' <span style="color:var(--t-3);font-size:12px;">(' + t.duration + 'm)</span>' : '') + '</span>');
    const prBtn = h('button', { textContent: t.priority === 'high' ? '★' : '☆' });
    prBtn.style.cssText = 'background:none;color:' + (t.priority === 'high' ? 'var(--gold)' : 'var(--t-3)') + ';font-size:15px;';
    prBtn.onclick = () => { const p = getPlan(ds); const it = p.brainDump.find(x => x.id === t.id); it.priority = it.priority === 'high' ? 'normal' : 'high'; savePlan(p, ds); renderScreen('fokus'); };
    const pl = h('button', { textContent: '→' });
    pl.style.cssText = 'background:none;color:var(--t-2);font-size:15px;';
    pl.title = 'Als Block einplanen';
    pl.onclick = () => {
      addBlock({ title: t.text, icon: '◇', mins: t.duration || 60, type: 'task' });
      const p = getPlan(ds); p.brainDump = p.brainDump.filter(x => x.id !== t.id); savePlan(p, ds); renderScreen('fokus');
    };
    const del = h('button', { textContent: '×' });
    del.style.cssText = 'background:none;color:var(--t-3);font-size:16px;';
    del.onclick = () => { const p = getPlan(ds); p.brainDump = p.brainDump.filter(x => x.id !== t.id); savePlan(p, ds); renderScreen('fokus'); };
    r.appendChild(prBtn); r.appendChild(pl); r.appendChild(del); body.appendChild(r);
  });

  const bdAdd = div(''); bdAdd.style.cssText = 'display:flex;gap:7px;';
  const bdInp = h('input', { type: 'text', placeholder: 'Idee + optional "60m"…' });
  bdInp.className = 'inp'; bdInp.style.cssText = 'flex:1;font-size:13px;';
  const bdBtn = h('button', { textContent: '+' });
  bdBtn.className = 'btn btn-glass tap';
  bdBtn.style.cssText = 'width:44px;height:44px;padding:0;flex:none;border-radius:var(--r-md);font-size:18px;font-weight:700;';
  const addBD = () => {
    const raw = bdInp.value.trim(); if (!raw) return;
    const m = raw.match(/(.+?)\s+(\d+)m\s*$/i);
    const text = m ? m[1].trim() : raw, duration = m ? parseInt(m[2]) : null;
    const p = getPlan(ds); p.brainDump.push({ id: Date.now(), text, duration, priority: 'normal' }); savePlan(p, ds);
    bdInp.value = ''; renderScreen('fokus');
  };
  bdBtn.onclick = addBD; bdInp.onkeydown = e => { if (e.key === 'Enter') addBD(); };
  bdAdd.appendChild(bdInp); bdAdd.appendChild(bdBtn); body.appendChild(bdAdd);
  const bdHint = div('', 'Ideen, offene Tasks und dein Top-Ziel fließen automatisch in „KI plant meinen Tag" oben ein.');
  bdHint.style.cssText = 'font-size:12px;color:var(--t-4);line-height:1.5;';
  body.appendChild(bdHint);

  if (moduleOn('f_opt')) s.appendChild(optSec);
}

// ─── TAB 2 · DISZIPLIN ────────────────────────────────
function renderDisziplin(s) {
  const disc = getDiscState();
  const nn = getNN();
  const review = reviewToday();
  const broken = disc.lastBreakDate === today();

  // Streak card
  const sc = div(broken ? 'glass-danger' : 'glass-accent', '');
  sc.innerHTML = '<div style="display:flex;align-items:center;gap:14px;">' +
    '<div><div class="streak-display' + (broken ? ' broken' : '') + '" style="font-size:42px;">' + disc.streak + '</div>' +
    '<div class="label" style="margin-top:3px;">' + (broken ? 'GEBROCHEN HEUTE' : 'TAGE 100%') + '</div></div>' +
    '<div style="width:1px;height:42px;background:var(--edge);"></div>' +
    '<div style="flex:1;"><div class="label" style="font-size:10px;margin-bottom:3px;">PERSONAL BEST</div>' +
    '<div class="serif" style="font-size:18px;color:' + (broken ? 'var(--t-3)' : 'var(--gold)') + ';">' + disc.bestStreak + ' Tage</div></div></div>';
  if (broken && disc.lastBreakReason) {
    sc.innerHTML += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(225,104,104,.18);font-size:11px;color:var(--t-2);font-style:italic;">"' + disc.lastBreakReason + '" – Morgen neu starten.</div>';
  }
  s.appendChild(sc);

  // NN section
  const nnLbl = div('label', '◆ NON-NEGOTIABLES HEUTE · ' + review.nnComplete + '/' + review.nnCount);
  nnLbl.style.cssText = 'margin-top:6px;color:' + (review.nnDone ? 'var(--green)' : 'var(--gold)') + ';';
  s.appendChild(nnLbl);
  const nnDesc = div('italic', 'Was MUSS heute passieren. Keine Verschiebung. Max 5.');
  nnDesc.style.cssText = 'font-size:11px;color:var(--t-3);margin-bottom:4px;';
  s.appendChild(nnDesc);

  if (!nn.items.length) {
    const empty = div('glass', 'Noch keine Non-Negotiables für heute gesetzt');
    empty.style.cssText = 'border-style:dashed;text-align:center;font-size:12px;color:var(--t-3);font-style:italic;';
    s.appendChild(empty);
  }
  const nnList = div('sortlist');
  nn.items.forEach(it => {
    const r = div('row', '');
    r.dataset.sortid = it.id;
    const grip = dragHandle();
    const cb = div('check tap' + (it.done ? ' on' : ''), '');
    cb.onclick = () => { toggleNN(it.id); renderScreen('fokus'); updateStatusBar(); };
    const tx = div('serif', it.text);
    tx.style.cssText = 'flex:1;font-size:13px;line-height:1.45;color:' + (it.done ? 'var(--t-3)' : 'var(--t-1)') + ';text-decoration:' + (it.done ? 'line-through' : 'none') + ';';
    const del = h('button', { textContent: '×' }, '');
    del.style.cssText = 'background:none;color:var(--t-3);font-size:14px;';
    del.onclick = () => { delNN(it.id); renderScreen('fokus'); };
    r.appendChild(grip); r.appendChild(cb); r.appendChild(tx); r.appendChild(del);
    nnList.appendChild(r);
  });
  if (nn.items.length) {
    s.appendChild(nnList);
    makeSortable(nnList, ids => { const d = getNN(); d.items = applyOrder(d.items, ids); saveNN(d); });
  }

  if (nn.items.length < 5) {
    const addRow = div('');
    addRow.style.cssText = 'display:flex;gap:7px;margin-top:6px;';
    const inp = h('input', { type: 'text', placeholder: 'Non-Negotiable für heute…', maxLength: 80 }, '');
    inp.className = 'inp inp-serif';
    inp.style.cssText = 'flex:1;font-size:13px;';
    const ab = h('button', { textContent: '+' }, '');
    ab.className = 'btn btn-gold tap';
    ab.style.cssText = 'width:44px;height:44px;padding:0;flex-shrink:0;border-radius:var(--r-md);font-size:18px;font-weight:700;';
    const add = () => { const v = inp.value.trim(); if (!v) return; addNN(v); inp.value = ''; renderScreen('fokus'); };
    ab.onclick = add; inp.onkeydown = e => { if (e.key === 'Enter') add(); };
    addRow.appendChild(inp); addRow.appendChild(ab); s.appendChild(addRow);
  }

  if (nn.items.length > 0) {
    const revBtn = h('button', { textContent: '📋  ABENDLICHE ABRECHNUNG' }, '');
    revBtn.className = 'btn tap ' + (review.nnDone ? 'btn-success' : 'btn-glass');
    revBtn.style.cssText = 'margin-top:6px;font-size:11px;letter-spacing:1.5px;';
    revBtn.onclick = openEveningReview;
    s.appendChild(revBtn);
  }

  // ─── Iron Vows — eingeklappt (langfristig, nicht täglich) ───
  const vowSec = section('⚜ Iron Vows · ' + disc.vows.filter(v => v.status === 'active').length + ' aktiv', 'f_vows', false);
  const vb = vowSec._body;
  const vowsDesc = div('italic', 'Langfristige Versprechen mit WARUM. Brich sie nicht.');
  vowsDesc.style.cssText = 'font-size:11px;color:var(--t-3);';
  vb.appendChild(vowsDesc);

  if (!disc.vows.length) {
    const empty = div('glass', 'Noch keine Vows. Was schwörst du dir?');
    empty.style.cssText = 'border-style:dashed;text-align:center;font-size:12px;color:var(--t-3);font-style:italic;';
    vb.appendChild(empty);
  }
  disc.vows.forEach(v => {
    const c = div(v.status === 'broken' ? 'glass-danger' : 'glass-accent', '');
    const daysSince = v.lastBreak ? Math.floor((Date.now() - v.lastBreak) / 86400000) : null;
    const sinceTxt = v.lastBreak ? daysSince + 'd seit letztem Bruch' : 'Seit ' + Math.floor((Date.now() - v.created) / 86400000) + 'd aktiv';
    c.innerHTML = '<div class="serif" style="font-size:14px;color:' + (v.status === 'broken' ? 'var(--red)' : 'var(--gold)') + ';line-height:1.4;margin-bottom:6px;">' + v.text + '</div>' +
      (v.why ? '<div class="italic" style="font-size:12px;color:var(--t-2);line-height:1.6;margin-bottom:8px;">"' + v.why + '"</div>' : '') +
      '<div style="font-size:11px;letter-spacing:1px;color:var(--t-3);">' + sinceTxt + ' · ' + (v.breaks || 0) + ' Brüche</div>';
    const actionRow = div('');
    actionRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
    const breakBtn = h('button', { textContent: 'GEBROCHEN' }, '');
    breakBtn.className = 'btn-ghost tap';
    breakBtn.style.cssText = 'flex:1;border-color:rgba(225,104,104,.2);color:rgba(225,104,104,.7);font-size:11px;';
    breakBtn.onclick = () => {
      if (!confirm('Diese Vow wirklich brechen? Streak wird genullt.')) return;
      const s2 = getDiscState(); const vv = s2.vows.find(x => x.id === v.id);
      vv.status = 'broken'; vv.lastBreak = Date.now(); vv.breaks = (vv.breaks || 0) + 1;
      saveDiscState(s2); breakStreak('Vow gebrochen: ' + v.text); renderScreen('fokus'); updateStatusBar();
    };
    const reactivateBtn = h('button', { textContent: 'WIEDER AKTIV' }, '');
    reactivateBtn.className = 'btn btn-glass tap';
    reactivateBtn.style.cssText = 'flex:1;font-size:11px;';
    reactivateBtn.onclick = () => { const s2 = getDiscState(); const vv = s2.vows.find(x => x.id === v.id); vv.status = 'active'; saveDiscState(s2); renderScreen('fokus'); };
    const delBtn = h('button', { textContent: '×' }, '');
    delBtn.className = 'btn-ghost tap';
    delBtn.style.cssText = 'width:38px;flex:none;font-size:12px;';
    delBtn.onclick = () => { if (confirm('Vow löschen?')) { const s2 = getDiscState(); s2.vows = s2.vows.filter(x => x.id !== v.id); saveDiscState(s2); renderScreen('fokus'); } };
    if (v.status === 'active') actionRow.appendChild(breakBtn);
    if (v.status === 'broken') actionRow.appendChild(reactivateBtn);
    actionRow.appendChild(delBtn);
    c.appendChild(actionRow);
    vb.appendChild(c);
  });

  const addVowBtn = h('button', { textContent: '+ NEUE VOW SCHWÖREN' }, '');
  addVowBtn.className = 'btn btn-glass tap';
  addVowBtn.style.cssText = 'font-size:11px;';
  addVowBtn.onclick = openAddVow;
  vb.appendChild(addVowBtn);
  if (moduleOn('f_vows')) s.appendChild(vowSec);

  // Tages-Bilanz (Zeit sinnvoll genutzt + Accountability)
  renderTagesBilanz(s);
}

// ─── TAGES-BILANZ · war die Zeit heute sinnvoll? ──────
function getBilanz() { return ls('los_bilanz_' + today()) || { zeit: 0, getan: null }; }
function saveBilanz(b) { ls('los_bilanz_' + today(), b); }

function renderTagesBilanz(s) {
  const b = getBilanz();
  const lbl = div('label gold', '◑ TAGES-BILANZ'); lbl.style.marginTop = '14px'; s.appendChild(lbl);
  const sub = div('', 'Ehrlicher Tages-Check.'); sub.style.cssText = 'font-size:11px;color:var(--t-3);margin-bottom:4px;'; s.appendChild(sub);

  const c = div('glass', '<div class="label" style="margin-bottom:8px;">Zeit heute sinnvoll genutzt?</div>');
  const qrow = div(''); qrow.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;';
  const stars = [];
  const paint = () => stars.forEach((x, i) => { x.textContent = i < b.zeit ? '★' : '☆'; x.style.color = i < b.zeit ? 'var(--gold)' : 'var(--t-4)'; });
  [1, 2, 3, 4, 5].forEach(v => {
    const st = h('button', {}, ''); st.className = 'tap';
    st.style.cssText = 'flex:1;font-size:28px;line-height:1;background:none;padding:2px 0;';
    st.onclick = () => { b.zeit = v; saveBilanz(b); paint(); haptic('light'); };
    stars.push(st); qrow.appendChild(st);
  });
  paint(); c.appendChild(qrow);

  c.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:8px;">Wirklich getan, was zählt?</div>');
  const arow = div(''); arow.style.cssText = 'display:flex;gap:6px;';
  [['ja', 'Ja', 'var(--green)'], ['teils', 'Teils', 'var(--gold)'], ['nein', 'Nein', 'var(--red)']].forEach(([k, l]) => {
    const btn = h('button', { textContent: l }, '');
    btn.className = 'itab tap' + (b.getan === k ? ' on' : '');
    btn.onclick = () => { b.getan = k; saveBilanz(b); arow.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', ['ja', 'teils', 'nein'][i] === k)); };
    arow.appendChild(btn);
  });
  c.appendChild(arow);
  s.appendChild(c);
}

// ─── OVERLAY: add vow ─────────────────────────────────
function openAddVow() {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  let f = { text: '', why: '' };
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label gold" style="margin-bottom:6px;">⚜ NEUE IRON VOW</div>' +
    '<div class="h1" style="margin-bottom:6px;">Was <span class="gold italic">schwörst</span> du dir?</div>' +
    '<div style="font-size:12px;color:var(--t-2);margin-bottom:18px;line-height:1.6;">Eine Iron Vow ist ein Versprechen an dich selbst. Brichst du sie, wird der Streak genullt.</div>' +
    '<div class="label" style="font-size:10px;margin-bottom:5px;">VERSPRECHEN</div>');

  const ti = h('textarea', { placeholder: 'z.B. "Kein Social Media vor 10 Uhr"', rows: 2 }, '');
  ti.className = 'inp inp-serif';
  ti.style.cssText = 'font-size:14px;margin-bottom:12px;';
  ti.oninput = e => f.text = e.target.value;
  inner.appendChild(ti);

  inner.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin-bottom:5px;">WARUM IST DAS WICHTIG?</div>');
  const wi = h('textarea', { placeholder: 'Dein WHY. Das siehst du wenn du sie brichst.', rows: 3 }, '');
  wi.className = 'inp inp-serif';
  wi.style.cssText = 'font-size:13px;font-style:italic;margin-bottom:18px;';
  wi.oninput = e => f.why = e.target.value;
  inner.appendChild(wi);

  const sv = h('button', { textContent: 'SCHWÖREN' }, '');
  sv.className = 'btn btn-gold tap';
  sv.onclick = () => {
    if (!f.text.trim()) { ti.classList.add('anim-shake'); setTimeout(() => ti.classList.remove('anim-shake'), 450); return; }
    const s = getDiscState();
    s.vows.push({ id: Date.now(), text: f.text.trim(), why: f.why.trim(), created: Date.now(), status: 'active', breaks: 0, lastBreak: null });
    saveDiscState(s); haptic('levelup'); addXP(20, 'discipline');
    closeOverlay(); renderScreen('fokus');
  };
  inner.appendChild(sv);
  openOverlay();
}

// ─── OVERLAY: evening review ───────────────────────────
function openEveningReview() {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  const nn = getNN();
  const review = reviewToday();
  const disc = getDiscState();
  const alreadyReviewed = disc.lastReviewDate === today();

  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label gold" style="margin-bottom:6px;">◐ ABENDLICHE ABRECHNUNG</div>' +
    '<div class="h1" style="margin-bottom:6px;">Wie war <span class="gold italic">dein Tag</span>?</div>' +
    '<div class="italic" style="font-size:12px;color:var(--t-2);margin-bottom:18px;">Ehrlich. Keine Ausreden. Keine zweiten Chancen.</div>');

  if (alreadyReviewed) {
    const al = div('glass-hi', '<div style="text-align:center;padding:14px;">' +
      '<div style="font-size:32px;margin-bottom:8px;">' + (disc.lastBreakDate === today() ? '💔' : '🔥') + '</div>' +
      '<div class="serif" style="font-size:16px;color:' + (disc.lastBreakDate === today() ? 'var(--red)' : 'var(--green)') + ';">Bereits abgerechnet</div>' +
      '<div style="font-size:12px;color:var(--t-2);margin-top:6px;">Streak: ' + disc.streak + ' Tage</div></div>');
    inner.appendChild(al);
    openOverlay();
    return;
  }

  if (nn.items.length) {
    inner.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin-bottom:6px;">NON-NEGOTIABLES</div>');
    nn.items.forEach(it => {
      const r = div('row', '');
      r.style.marginBottom = '5px';
      const cb = div('check tap' + (it.done ? ' on' : ''), '');
      cb.onclick = () => { toggleNN(it.id); openEveningReview(); };
      const tx = div('serif', it.text);
      tx.style.cssText = 'flex:1;font-size:13px;color:' + (it.done ? 'var(--t-3)' : 'var(--t-1)') + ';text-decoration:' + (it.done ? 'line-through' : 'none') + ';';
      r.appendChild(cb); r.appendChild(tx); inner.appendChild(r);
    });
  } else {
    const noNN = div('glass', 'Keine Non-Negotiables gesetzt. Setze morgens 3-5 fest.');
    noNN.style.cssText = 'border-style:dashed;text-align:center;font-size:12px;color:var(--t-3);font-style:italic;margin-bottom:14px;';
    inner.appendChild(noNN);
  }

  if (review.vows.length) {
    inner.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin-top:14px;margin-bottom:6px;">IRON VOWS HEUTE GEHALTEN?</div>');
    review.vows.forEach(v => {
      const r = div('row', '<span class="serif" style="flex:1;font-size:13px;color:var(--t-1);">' + v.text + '</span>');
      r.style.marginBottom = '5px';
      const yes = h('button', { textContent: '✓' }, '');
      yes.style.cssText = 'width:32px;height:32px;border-radius:var(--r-sm);background:rgba(92,184,117,.12);border:1px solid rgba(92,184,117,.25);color:var(--green);font-size:14px;';
      const no = h('button', { textContent: '✗' }, '');
      no.style.cssText = 'width:32px;height:32px;border-radius:var(--r-sm);background:rgba(225,104,104,.08);border:1px solid rgba(225,104,104,.2);color:var(--red);font-size:14px;';
      no.onclick = () => {
        if (!confirm('Vow "' + v.text + '" gebrochen? Streak wird genullt.')) return;
        const s = getDiscState(); const vv = s.vows.find(x => x.id === v.id);
        vv.status = 'broken'; vv.lastBreak = Date.now(); vv.breaks = (vv.breaks || 0) + 1;
        saveDiscState(s); no.style.background = 'rgba(225,104,104,.25)'; yes.style.opacity = '.3';
      };
      yes.onclick = () => { yes.style.background = 'rgba(92,184,117,.25)'; no.style.opacity = '.3'; };
      r.appendChild(yes); r.appendChild(no); inner.appendChild(r);
    });
  }

  const allDone = nn.items.length > 0 && nn.items.every(i => i.done) && review.vows.every(v => v.status === 'active');
  inner.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin-top:18px;margin-bottom:6px;">BILANZ</div>');

  const result = div(allDone ? 'glass-success' : 'glass-danger', '');
  result.style.textAlign = 'center';
  if (allDone) {
    result.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">🔥</div>' +
      '<div class="serif" style="font-size:18px;color:var(--green);margin-bottom:4px;">100% – Streak +1</div>' +
      '<div style="font-size:12px;color:var(--t-2);">Du wirst zu der Person die du sein willst.</div>';
  } else {
    const brokenItems = nn.items.filter(i => !i.done).map(i => i.text);
    result.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">💔</div>' +
      '<div class="serif" style="font-size:18px;color:var(--red);margin-bottom:4px;">Streak gebrochen</div>' +
      '<div style="font-size:12px;color:var(--t-2);margin-bottom:10px;">Du warst bei ' + disc.streak + '. Zurück auf 0.</div>' +
      (brokenItems.length ? '<div style="font-size:11px;color:var(--t-3);font-style:italic;border-top:1px solid rgba(225,104,104,.18);padding-top:10px;">Nicht erledigt: ' + brokenItems.slice(0, 3).join(' · ') + '</div>' : '') +
      '<div class="serif italic" style="font-size:12px;color:var(--t-2);margin-top:10px;">"Champions stehen einen mehr auf als sie fallen."</div>';
  }
  inner.appendChild(result);

  const closeBtn = h('button', { textContent: allDone ? 'STREAK BESTÄTIGEN' : 'ABRECHNUNG ABSCHLIESSEN' }, '');
  closeBtn.className = 'btn tap ' + (allDone ? 'btn-gold' : 'btn-danger');
  closeBtn.style.cssText = 'margin-top:12px;font-size:12px;';
  closeBtn.onclick = () => {
    if (allDone) bumpStreak();
    else breakStreak(nn.items.filter(i => !i.done).map(i => i.text).join(', ') || 'Vow gebrochen');
    const d = getNN(); d.reviewed = true; d.allDone = allDone; saveNN(d);
    closeOverlay(); updateStatusBar();
  };
  inner.appendChild(closeBtn);
  openOverlay();
}
