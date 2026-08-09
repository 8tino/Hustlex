// ═══════════════════════════════════════════════════════
// HABITS · Gewohnheiten im Karten-Style (angelehnt an HabitKit/
//   Habit-Tracker-Apps): farbige Gradient-Karten, Icon, Häkchen zum
//   Abhaken, Wochen-Fortschritt als Segmente, Streak-Feuer, flexible
//   Frequenz (täglich / N× pro Woche / feste Wochentage).
//   Stores: los_habits = [{id,icon,name,color,freq,n,days:[0-6],history:[dateStr]}]
// ═══════════════════════════════════════════════════════

const HABIT_COLORS = ['#30D158', '#0A84FF', '#BF5AF2', '#FF9F0A', '#FF375F', '#5AC8FA', '#FFD60A', '#64D2FF', '#FF6B35'];
const HABIT_WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']; // index = JS getDay() (0=Sonntag)

function getHabits() { return ls('los_habits') || []; }
function saveHabits(a) { ls('los_habits', a); }

// Montag-basierte Woche: 7 Date-Objekte Mo…So der aktuellen Woche.
function habitWeekDates() {
  const now = new Date(); const day = now.getDay(); // 0=So
  const monOffset = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate() + monOffset); mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}
function habitDoneOn(h, d) { return (h.history || []).includes(d.toDateString()); }
function habitScheduledOn(h, d) {
  if (h.freq === 'days') return (h.days || []).includes(d.getDay());
  return true; // daily + week = jeder Tag zählt
}
function habitFreqLabel(h) {
  if (h.freq === 'daily') return 'täglich';
  if (h.freq === 'week') return (h.n || 1) + '× pro Woche';
  if (h.freq === 'days') return (h.days || []).slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(i => HABIT_WD[i]).join(', ') || 'Wochentage';
  return '';
}
// Streak: aufeinanderfolgende geplante Tage erledigt (rückwärts ab heute).
function habitStreak(h) {
  const set = new Set(h.history || []);
  let n = 0; const d = new Date(); d.setHours(0, 0, 0, 0);
  // heute optional: wenn heute geplant & nicht erledigt, zählt ab gestern
  if (habitScheduledOn(h, d) && !set.has(d.toDateString())) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 366; i++) {
    if (!habitScheduledOn(h, d)) { d.setDate(d.getDate() - 1); continue; }
    if (set.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}
function habitToggleToday(h) {
  const a = getHabits(); const it = a.find(x => x.id === h.id); if (!it) return;
  it.history = it.history || [];
  const t = today();
  if (it.history.includes(t)) { it.history = it.history.filter(x => x !== t); if (typeof subXP === 'function') subXP(10, 'discipline'); }
  else { it.history.push(t); haptic('success'); addXP(10, 'discipline'); }
  saveHabits(a);
}

function renderHabits(s) {
  s.className = 'screen on';
  const habits = getHabits();
  const week = habitWeekDates();
  const todayStr = today();

  // Header
  s.innerHTML = '<div class="label" style="margin-bottom:2px;">' + new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase() + '</div>';
  const head = div(''); head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  head.innerHTML = '<div class="h2" style="margin:0;">Meine <span class="gold">Gewohnheiten</span></div>';
  const addBtn = h('button', { textContent: '＋' }); addBtn.className = 'tap';
  addBtn.style.cssText = 'width:38px;height:38px;flex:none;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:var(--t-1);font-size:20px;';
  addBtn.onclick = () => openHabitEdit(null, s);
  head.appendChild(addBtn); s.appendChild(head);

  if (!habits.length) {
    const e = div('glass', '');
    e.style.cssText = 'border-style:dashed;text-align:center;padding:26px 18px;';
    e.innerHTML = '<div style="font-size:34px;margin-bottom:8px;">🌱</div>' +
      '<div style="font-size:15px;font-weight:600;color:var(--t-1);">Noch keine Gewohnheiten</div>' +
      '<div style="font-size:13px;color:var(--t-3);margin-top:6px;line-height:1.6;">Tipp oben auf ＋ und leg deine erste an — mit Icon, Farbe und Rhythmus (täglich, X×/Woche oder feste Wochentage).</div>';
    s.appendChild(e);
    return;
  }

  // Eine Habit-Karte im Screenshot-Style.
  const habitCard = (hb, featured) => {
    const c = hb.color || '#0A84FF';
    const doneToday = (hb.history || []).includes(todayStr);
    const streak = habitStreak(hb);
    const card = div('tap', '');
    card.style.cssText = 'position:relative;border-radius:22px;padding:16px;overflow:hidden;cursor:pointer;' +
      'border:1px solid rgba(255,255,255,.06);' +
      'background:linear-gradient(165deg,' + c + '4d 0%,' + c + '24 45%,' + c + '0f 100%);' +
      (featured ? 'grid-column:1 / -1;' : '');
    // top row: icon tile + check
    const top = div(''); top.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:' + (featured ? '26px' : '20px') + ';';
    top.innerHTML = '<div style="width:38px;height:38px;border-radius:12px;flex:none;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(0,0,0,.3);">' + (hb.icon || '🎯') + '</div>';
    const chk = h('button', { textContent: doneToday ? '✓' : '' }); chk.className = 'tap';
    chk.style.cssText = 'width:32px;height:32px;flex:none;border-radius:50%;font-size:16px;font-weight:800;' +
      (doneToday ? 'background:' + c + ';border:none;color:#0a0b10;box-shadow:0 0 14px ' + c + 'aa;' : 'background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.28);color:var(--t-1);');
    chk.onclick = (e) => { e.stopPropagation(); habitToggleToday(hb); updateStatusBar(); renderHabits(s); };
    top.appendChild(chk); card.appendChild(top);
    // name + freq
    card.insertAdjacentHTML('beforeend',
      '<div style="font-size:' + (featured ? '19px' : '16px') + ';font-weight:700;color:#fff;line-height:1.2;letter-spacing:-.2px;">' + esc(hb.name) + '</div>' +
      '<div style="font-size:12.5px;color:rgba(255,255,255,.6);margin-top:4px;">' + habitFreqLabel(hb) + '</div>');
    // week progress segments (chunky, rounded) + streak
    const foot = div(''); foot.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:14px;';
    const dots = div(''); dots.style.cssText = 'display:flex;gap:5px;flex:1;';
    week.forEach(d => {
      const done = habitDoneOn(hb, d);
      const sched = habitScheduledOn(hb, d);
      const seg = document.createElement('span');
      seg.style.cssText = 'flex:1;height:9px;border-radius:5px;background:' + (done ? c : sched ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.06)') + ';' + (done ? 'box-shadow:0 0 8px ' + c + '80;' : '');
      dots.appendChild(seg);
    });
    foot.appendChild(dots);
    if (streak > 0) foot.insertAdjacentHTML('beforeend', '<span style="font-size:12.5px;font-weight:600;color:rgba(255,255,255,.75);white-space:nowrap;">🔥 ' + streak + '</span>');
    card.appendChild(foot);
    card.onclick = () => openHabitEdit(hb, s);
    return card;
  };

  // erste Karte volle Breite (featured), Rest 2-spaltiges Grid
  const grid = div(''); grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';
  habits.forEach((hb, i) => grid.appendChild(habitCard(hb, i === 0)));
  s.appendChild(grid);

  s.appendChild(div('', '<div style="font-size:11px;color:var(--t-4);text-align:center;padding:12px 0 2px;line-height:1.6;">Häkchen = heute erledigt (+10 XP) · Karte antippen = bearbeiten.<br>Segmente = diese Woche (Mo–So) · 🔥 = Serie.</div>'));
}

// Anlegen / Bearbeiten einer Gewohnheit.
let HABIT_DRAFT = null;
function openHabitEdit(hb, s) {
  HABIT_DRAFT = hb ? Object.assign({}, hb, { days: (hb.days || []).slice() })
    : { id: Date.now(), icon: '🎯', name: '', color: HABIT_COLORS[0], freq: 'daily', n: 3, days: [1, 3, 5], history: [] };
  renderHabitEdit(s, !!hb);
  openOverlay();
}
function renderHabitEdit(s, isEdit) {
  const d = HABIT_DRAFT;
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (isEdit ? 'GEWOHNHEIT BEARBEITEN' : 'NEUE GEWOHNHEIT') + '</div>' +
    '<div class="h2" style="margin-bottom:14px;">Dein <span class="gold">Rhythmus</span></div>');

  // Name
  const nI = h('input', { type: 'text', value: d.name, placeholder: 'z. B. Meditieren', maxLength: 40 });
  nI.className = 'inp'; nI.style.cssText = 'width:100%;font-size:15px;margin-bottom:12px;';
  nI.oninput = e => d.name = e.target.value; inner.appendChild(nI);

  // Icon
  inner.appendChild(div('label', 'ICON'));
  const iRow = div(''); iRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 12px;';
  const iInp = h('input', { type: 'text', value: d.icon, maxLength: 2 });
  iInp.className = 'inp'; iInp.style.cssText = 'width:60px;text-align:center;font-size:20px;flex:none;';
  iInp.oninput = e => d.icon = e.target.value;
  iRow.appendChild(iInp);
  ['🎯', '🏋️', '🧘', '📖', '💧', '🥗', '😴', '🚭', '🧊', '✍️', '🌙', '🏃'].forEach(em => {
    const b = h('button', { textContent: em }); b.className = 'tap';
    b.style.cssText = 'width:38px;height:38px;flex:none;border-radius:10px;background:var(--glass-2);border:1px solid var(--edge);font-size:18px;';
    b.onclick = () => { d.icon = em; iInp.value = em; };
    iRow.appendChild(b);
  });
  inner.appendChild(iRow);

  // Farbe
  inner.appendChild(div('label', 'FARBE'));
  const cRow = div(''); cRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 12px;';
  HABIT_COLORS.forEach(col => {
    const b = h('button', {}); b.className = 'tap';
    b.style.cssText = 'width:32px;height:32px;flex:none;border-radius:50%;background:' + col + ';border:2px solid ' + (d.color === col ? '#fff' : 'transparent') + ';';
    b.onclick = () => { d.color = col; renderHabitEdit(s, isEdit); };
    cRow.appendChild(b);
  });
  inner.appendChild(cRow);

  // Frequenz
  inner.appendChild(div('label', 'RHYTHMUS'));
  const fRow = div(''); fRow.style.cssText = 'display:flex;gap:6px;margin:4px 0 10px;';
  [['daily', 'Täglich'], ['week', 'X / Woche'], ['days', 'Wochentage']].forEach(([k, l]) => {
    const b = h('button', { textContent: l }); b.className = 'itab tap' + (d.freq === k ? ' on' : '');
    b.style.cssText = 'flex:1;font-size:12px;';
    b.onclick = () => { d.freq = k; renderHabitEdit(s, isEdit); };
    fRow.appendChild(b);
  });
  inner.appendChild(fRow);

  if (d.freq === 'week') {
    const wrap = div(''); wrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
    wrap.innerHTML = '<span style="font-size:13px;color:var(--t-2);flex:1;">Tage pro Woche:</span>';
    const nInp = h('input', { type: 'number', value: String(d.n || 3), min: '1', max: '7' });
    nInp.className = 'inp'; nInp.style.cssText = 'width:70px;text-align:center;font-size:15px;';
    nInp.oninput = e => d.n = Math.min(7, Math.max(1, parseInt(e.target.value) || 1));
    wrap.appendChild(nInp); inner.appendChild(wrap);
  } else if (d.freq === 'days') {
    const wdRow = div(''); wdRow.style.cssText = 'display:flex;gap:5px;margin-bottom:12px;';
    [1, 2, 3, 4, 5, 6, 0].forEach(idx => { // Mo…So
      const on = (d.days || []).includes(idx);
      const b = h('button', { textContent: HABIT_WD[idx] }); b.className = 'tap';
      b.style.cssText = 'flex:1;padding:9px 0;border-radius:10px;font-size:12px;font-weight:600;' +
        (on ? 'background:' + d.color + '33;border:1px solid ' + d.color + ';color:' + d.color + ';' : 'background:var(--glass-2);border:1px solid var(--edge);color:var(--t-3);');
      b.onclick = () => { d.days = on ? d.days.filter(x => x !== idx) : [...(d.days || []), idx]; renderHabitEdit(s, isEdit); };
      wdRow.appendChild(b);
    });
    inner.appendChild(wdRow);
  }

  // Speichern
  const sv = h('button', { textContent: isEdit ? '✓ ÄNDERN' : '＋ ANLEGEN' });
  sv.className = 'btn btn-gold tap'; sv.style.marginTop = '6px';
  sv.onclick = () => {
    if (!d.name.trim()) { nI.classList.add('anim-shake'); setTimeout(() => nI.classList.remove('anim-shake'), 450); return; }
    if (d.freq === 'days' && !(d.days || []).length) { showToast('Mindestens einen Wochentag wählen', '⚠'); return; }
    d.name = d.name.trim(); if (!d.icon) d.icon = '🎯';
    const a = getHabits(); const idx = a.findIndex(x => x.id === d.id);
    if (idx >= 0) a[idx] = d; else a.push(d);
    saveHabits(a); haptic('success'); closeOverlay(); renderHabits(s);
  };
  inner.appendChild(sv);

  if (isEdit) {
    const del = h('button', { textContent: 'Löschen' });
    del.className = 'btn btn-ghost tap'; del.style.cssText = 'font-size:12px;margin-top:8px;color:var(--red);border-color:rgba(225,104,104,.25);';
    del.onclick = () => { if (confirm('Gewohnheit „' + d.name + '" löschen?')) { saveHabits(getHabits().filter(x => x.id !== d.id)); closeOverlay(); renderHabits(s); } };
    inner.appendChild(del);
  }
  inner.scrollTop = 0;
}
