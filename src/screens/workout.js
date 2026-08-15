// ═══════════════════════════════════════════════════════
// WORKOUT · Hevy-Style Gym-Log
//   Übungs-Bibliothek → aktive Session (Sätze: kg × Wdh × ✓) → Historie,
//   persönliche Rekorde (PRs) und speicherbare Routinen. Deutsch als
//   Quellsprache; die i18n-Ebene übersetzt automatisch nach Englisch.
// ═══════════════════════════════════════════════════════

// Built-in exercise library. m = Muskelgruppe.
const WO_EXERCISES = [
  { id: 'bench',    n: 'Bankdrücken',              m: 'Brust' },
  { id: 'inclbench',n: 'Schrägbankdrücken',        m: 'Brust' },
  { id: 'dbbench',  n: 'Kurzhantel-Bankdrücken',   m: 'Brust' },
  { id: 'pushup',   n: 'Liegestütze',              m: 'Brust' },
  { id: 'dips',     n: 'Dips',                     m: 'Brust' },
  { id: 'deadlift', n: 'Kreuzheben',               m: 'Rücken' },
  { id: 'pullup',   n: 'Klimmzüge',                m: 'Rücken' },
  { id: 'bbrow',    n: 'Langhantelrudern',         m: 'Rücken' },
  { id: 'latpull',  n: 'Latzug',                   m: 'Rücken' },
  { id: 'cablerow', n: 'Kabelrudern',              m: 'Rücken' },
  { id: 'rdl',      n: 'Rumänisches Kreuzheben',   m: 'Rücken' },
  { id: 'squat',    n: 'Kniebeuge',                m: 'Beine' },
  { id: 'frontsq',  n: 'Frontkniebeuge',           m: 'Beine' },
  { id: 'legpress', n: 'Beinpresse',               m: 'Beine' },
  { id: 'lunge',    n: 'Ausfallschritte',          m: 'Beine' },
  { id: 'legcurl',  n: 'Beinbeuger',               m: 'Beine' },
  { id: 'legext',   n: 'Beinstrecker',             m: 'Beine' },
  { id: 'calf',     n: 'Wadenheben',               m: 'Beine' },
  { id: 'hipthrust',n: 'Hip Thrust',               m: 'Beine' },
  { id: 'ohp',      n: 'Schulterdrücken',          m: 'Schultern' },
  { id: 'latraise', n: 'Seitheben',                m: 'Schultern' },
  { id: 'facepull', n: 'Face Pull',                m: 'Schultern' },
  { id: 'frontraise',n:'Frontheben',               m: 'Schultern' },
  { id: 'bbcurl',   n: 'Langhantel-Curls',         m: 'Arme' },
  { id: 'dbcurl',   n: 'Kurzhantel-Curls',         m: 'Arme' },
  { id: 'hammer',   n: 'Hammer-Curls',             m: 'Arme' },
  { id: 'pushdown', n: 'Trizepsdrücken',           m: 'Arme' },
  { id: 'skull',    n: 'Skull Crusher',            m: 'Arme' },
  { id: 'plank',    n: 'Plank',                    m: 'Core' },
  { id: 'legraise', n: 'Hängendes Beinheben',      m: 'Core' },
  { id: 'crunch',   n: 'Crunches',                 m: 'Core' },
  { id: 'twist',    n: 'Russian Twist',            m: 'Core' },
];
const WO_MUSCLES = ['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Core'];

function woLib() { return WO_EXERCISES.concat(ls('los_wo_exercises') || []); }
function woExName(id, fallback) { const e = woLib().find(x => x.id === id); return e ? e.n : (fallback || id); }
function getActiveWO() { return ls('los_wo_active'); }
function setActiveWO(w) { ls('los_wo_active', w); }
function getWorkouts() { return ls('los_workouts') || []; }
function saveWorkouts(a) { ls('los_workouts', a); }
function getRoutines() { return ls('los_wo_routines') || []; }
function saveRoutines(a) { ls('los_wo_routines', a); }

// ─── Rest-Timer zwischen Sätzen ───
// Startet automatisch beim Abhaken eines Satzes, läuft im Hintergrund weiter
// (Modul-Variable, überlebt Re-Renders), signalisiert bei 0 mit Ton + Vibration.
let WO_REST = null; // { endAt, dur, fired }
function woRestDur() { return ls('los_wo_rest') || 90; }
function woSetRestDur(sec) { ls('los_wo_rest', Math.max(10, Math.min(600, Math.round(sec)))); }
function woStartRest() { const d = woRestDur(); WO_REST = { endAt: Date.now() + d * 1000, dur: d, fired: false }; }
function woRestLeft() { return WO_REST ? Math.round((WO_REST.endAt - Date.now()) / 1000) : 0; }
function woBeep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(); const g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.value = 0.08; o.start(); setTimeout(() => { o.stop(); a.close(); }, 200); } catch (e) {} }

// Volume of a session = Σ (weight × reps) over done sets.
function woVolume(w) {
  let v = 0;
  (w.exercises || []).forEach(ex => (ex.sets || []).forEach(st => { if (st.done) v += (+st.weight || 0) * (+st.reps || 0); }));
  return Math.round(v);
}
function woDoneSets(w) { let c = 0; (w.exercises || []).forEach(ex => (ex.sets || []).forEach(st => { if (st.done) c++; })); return c; }
function woE1RM(weight, reps) { weight = +weight || 0; reps = +reps || 0; if (!weight || !reps) return 0; return Math.round(weight * (1 + reps / 30)); }

// Best-ever numbers for an exercise across saved workouts.
function woPR(exId) {
  let maxW = 0, best1rm = 0;
  getWorkouts().forEach(w => (w.exercises || []).forEach(ex => {
    if (ex.exId !== exId) return;
    (ex.sets || []).forEach(st => {
      if (!st.done) return;
      const wgt = +st.weight || 0, r = +st.reps || 0;
      if (wgt > maxW) maxW = wgt;
      const e = woE1RM(wgt, r); if (e > best1rm) best1rm = e;
    });
  }));
  return { maxW, best1rm };
}

// Most recent past performance of an exercise (for the "previous" reference).
function woLastExercise(exId) {
  const ws = getWorkouts().slice().reverse();
  for (const w of ws) {
    const ex = (w.exercises || []).find(e => e.exId === exId);
    if (ex && (ex.sets || []).length) return { date: w.date || w.id, sets: ex.sets };
  }
  return null;
}
// Sets for a new exercise instance: prefilled from last time (with a `prev`
// reference so progression is visible), or one empty set if never trained.
function woSetsFromLast(exId) {
  const last = woLastExercise(exId);
  if (last) return last.sets.map(st => ({ weight: st.weight, reps: st.reps, done: false, prev: { weight: st.weight, reps: st.reps } }));
  return [{ weight: '', reps: '', done: false }];
}
// All exercises that have any recorded set → best weight + e1RM, ranked.
function woAllRecords() {
  const map = {};
  getWorkouts().forEach(w => (w.exercises || []).forEach(ex => (ex.sets || []).forEach(st => {
    if (!st.done) return;
    const wgt = +st.weight || 0, r = +st.reps || 0, e = woE1RM(wgt, r);
    const m = map[ex.exId] || (map[ex.exId] = { exId: ex.exId, name: ex.name, maxW: 0, best1rm: 0 });
    if (wgt > m.maxW) m.maxW = wgt;
    if (e > m.best1rm) m.best1rm = e;
  })));
  return Object.values(map).sort((a, b) => b.best1rm - a.best1rm);
}

// ─── Screen dispatch ───
// WO_VIEW = 'active' shows the running session; 'home' shows the start page even
// while a session runs in the background (so you can leave without ending it).
let WO_VIEW = 'active';
function renderWorkout(s) {
  s.className = 'screen on';
  const active = getActiveWO();
  if (active && WO_VIEW !== 'home') return woRenderActive(s, active);
  woRenderHome(s);
}

// ─── Home (no active session) ───
function woRenderHome(s) {
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">KÖRPER · GYM</div>' +
    '<div class="h2">Workout-<span class="gold italic">Log</span></div>';

  // Resume banner — a session is running in the background.
  const act = getActiveWO();
  if (act) {
    const resume = div('glass-accent tap');
    resume.style.cssText = 'margin:14px 0 8px;display:flex;align-items:center;gap:12px;border-left:3px solid var(--green,#30D158);';
    resume.innerHTML = '<span style="font-size:22px;">▶</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--t-1);">' + (LANG === 'en' ? 'Resume workout' : 'Workout fortsetzen') + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + esc(act.name || 'Workout') + ' · ' + woDoneSets(act) + ' ' + (LANG === 'en' ? 'sets' : 'Sätze') + '</div></div>' +
      '<span style="color:var(--t-3);font-size:18px;">›</span>';
    resume.onclick = () => { WO_VIEW = 'active'; renderScreen('workout'); };
    s.appendChild(resume);
  }

  const start = h('button', { textContent: act ? (LANG === 'en' ? '＋ New workout' : '＋ Neues Workout') : (LANG === 'en' ? '＋ Start new workout' : '＋ Neues Workout starten') });
  start.className = 'btn tap';
  start.style.cssText = 'width:100%;background:' + (act ? 'var(--glass-2)' : 'var(--blue)') + ';color:' + (act ? 'var(--t-2)' : '#fff') + ';font-weight:600;font-size:15px;padding:14px;border:' + (act ? '1px solid var(--edge)' : 'none') + ';border-radius:var(--r-md);margin:' + (act ? '0 0 8px' : '14px 0 8px') + ';';
  start.onclick = () => {
    if (getActiveWO() && !confirm(LANG === 'en' ? 'A workout is still running. Discard it and start a new one?' : 'Es läuft noch ein Workout. Verwerfen und ein neues starten?')) return;
    setActiveWO({ id: Date.now(), name: 'Workout', startedAt: Date.now(), exercises: [] });
    WO_VIEW = 'active'; renderScreen('workout'); haptic('success');
  };
  s.appendChild(start);

  // Routines
  const routines = getRoutines();
  const rsec = section('Routinen', 'wo_routines', true); const rb = rsec._body;
  if (!routines.length) {
    rb.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;">Noch keine Routinen. Beende ein Workout und speichere es als Routine — dann startest du es mit einem Tap.</div>'));
  }
  routines.forEach(r => {
    const row = div('row');
    row.innerHTML = '<span style="font-size:18px;">📋</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--t-1);">' + esc(r.name) + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + (r.exercises || []).length + ' Übungen</div></div>';
    const go = h('button', { textContent: 'Start' });
    go.className = 'tap'; go.style.cssText = 'font-size:12px;font-weight:600;padding:7px 14px;background:var(--blue);color:#fff;border:none;border-radius:var(--r-sm);';
    go.onclick = () => {
      if (getActiveWO() && !confirm(LANG === 'en' ? 'A workout is still running. Discard it and start this routine?' : 'Es läuft noch ein Workout. Verwerfen und diese Routine starten?')) return;
      setActiveWO({ id: Date.now(), name: r.name, startedAt: Date.now(), exercises: (r.exercises || []).map(e => ({ exId: e.exId, name: e.name, sets: woSetsFromLast(e.exId) })) });
      WO_VIEW = 'active'; renderScreen('workout'); haptic('success');
    };
    const del = h('button', { textContent: '🗑' });
    del.className = 'tap'; del.style.cssText = 'font-size:13px;background:none;color:var(--t-3);padding-left:4px;';
    del.onclick = () => { saveRoutines(getRoutines().filter(x => x.id !== r.id)); renderScreen('workout'); };
    row.appendChild(go); row.appendChild(del);
    rb.appendChild(row);
  });
  s.appendChild(rsec);

  // Records — every trained exercise, best weight + estimated 1RM, searchable.
  const workouts = getWorkouts();
  if (workouts.length) {
    const recs = woAllRecords();
    const prsec = section('Rekorde', 'wo_prs', true); const pb = prsec._body;
    if (recs.length > 6) {
      const rs = h('input', { type: 'search', placeholder: LANG === 'en' ? '🔍 Search exercise…' : '🔍 Übung suchen…' });
      rs.className = 'inp'; rs.style.marginBottom = '8px';
      const list = div(''); list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
      const paintR = () => {
        list.innerHTML = ''; const q = rs.value.toLowerCase().trim();
        recs.filter(r => !q || r.name.toLowerCase().includes(q)).forEach(r => list.appendChild(recRow(r)));
      };
      rs.oninput = paintR; pb.appendChild(rs); pb.appendChild(list); paintR();
    } else {
      recs.forEach(r => pb.appendChild(recRow(r)));
    }
    s.appendChild(prsec);
  }
  function recRow(r) {
    const row = div('row');
    row.innerHTML = '<span style="font-size:16px;">🏆</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(r.name) + '</div></div>' +
      '<div style="text-align:right;"><div style="font-size:13px;font-weight:700;color:var(--gold);">' + r.maxW + ' kg</div>' +
      '<div style="font-size:10px;color:var(--t-3);">e1RM ' + r.best1rm + ' kg</div></div>';
    return row;
  }

  // History — searchable by name/date, full date shown, tap for detail.
  const hsec = section('Verlauf', 'wo_history', true); const hb = hsec._body;
  if (!workouts.length) {
    hb.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;">Noch keine Workouts. Tippe oben auf „Neues Workout starten".</div>'));
  } else {
    const all = workouts.slice().reverse();
    const hs = h('input', { type: 'search', placeholder: LANG === 'en' ? '🔍 Search workout / date…' : '🔍 Workout / Datum suchen…' });
    hs.className = 'inp'; hs.style.marginBottom = '8px';
    const hlist = div(''); hlist.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const fmtDate = d => d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const paintH = () => {
      hlist.innerHTML = ''; const q = hs.value.toLowerCase().trim();
      const items = all.filter(w => { const d = new Date(w.date || w.id); return !q || (w.name || '').toLowerCase().includes(q) || fmtDate(d).toLowerCase().includes(q); }).slice(0, 60);
      if (!items.length) { hlist.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);padding:4px;">' + (LANG === 'en' ? 'No match.' : 'Nichts gefunden.') + '</div>')); return; }
      items.forEach(w => {
        const row = div('row tap');
        const d = new Date(w.date || w.id);
        row.innerHTML = '<span style="font-size:18px;">🏋</span>' +
          '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--t-1);">' + esc(w.name || 'Workout') + '</div>' +
          '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + fmtDate(d) + ' · ' + woDoneSets(w) + ' Sätze · ' + (w.volume || woVolume(w)).toLocaleString(LANG === 'en' ? 'en-US' : 'de-DE') + ' kg Volumen' + (w.durationMin ? ' · ' + w.durationMin + ' min' : '') + '</div></div>' +
          '<span style="color:var(--t-3);font-size:16px;">›</span>';
        row.onclick = () => woOpenDetail(w.id);
        hlist.appendChild(row);
      });
    };
    if (all.length > 6) hb.appendChild(hs);
    hb.appendChild(hlist); paintH();
  }
  s.appendChild(hsec);
}

// ─── Active session ───
function woFmtClock(secs) { secs = Math.max(0, secs); const m = Math.floor(secs / 60), ss = secs % 60; return m + ':' + String(ss).padStart(2, '0'); }

function woRenderActive(s, w) {
  s.innerHTML = '';
  // Back to the workout start page — the session keeps running in the background.
  const back = h('button', { textContent: '‹ ' + (LANG === 'en' ? 'Back' : 'Zurück') });
  back.className = 'tap'; back.style.cssText = 'background:none;color:var(--gold-soft,#409CFF);font-size:14px;padding:2px 0 10px;';
  back.onclick = () => { WO_VIEW = 'home'; renderScreen('workout'); };
  s.appendChild(back);
  const secs = Math.round((Date.now() - (w.startedAt || Date.now())) / 1000);
  s.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:4px;">LÄUFT · <span id="wo_timer" style="font-variant-numeric:tabular-nums;">' + woFmtClock(secs) + '</span></div>');

  // name
  const nameI = h('input', { type: 'text', value: w.name || 'Workout' });
  nameI.className = 'inp'; nameI.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:6px;';
  nameI.oninput = e => { w.name = e.target.value; setActiveWO(w); };
  s.appendChild(nameI);

  // live stats
  s.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);margin-bottom:12px;">' + woDoneSets(w) + ' Sätze · ' + woVolume(w).toLocaleString('de-DE') + ' kg Volumen</div>'));

  // Rest-Timer-Leiste (nur während einer laufenden Pause).
  if (WO_REST && woRestLeft() > -2) s.appendChild(woRestBar());

  // exercises
  (w.exercises || []).forEach((ex, exi) => {
    const card = div('glass'); card.style.marginBottom = '10px';
    // per-exercise time = span between first and last completed set
    const dts = (ex.sets || []).filter(st => st.done && st.doneAt).map(st => st.doneAt);
    const exMin = dts.length > 1 ? Math.max(0, Math.round((Math.max.apply(null, dts) - Math.min.apply(null, dts)) / 60000)) : 0;
    const timeTag = dts.length ? '<span style="font-size:11px;color:var(--t-3);font-weight:400;"> · ' + (exMin >= 1 ? exMin + ' min' : '< 1 min') + '</span>' : '';
    const head = div(''); head.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
    const nameEl = h('button', {}, '<span style="font-size:15px;font-weight:600;color:var(--t-1);">' + esc(ex.name) + '</span>' + timeTag);
    nameEl.className = 'tap'; nameEl.title = 'Umbenennen';
    nameEl.style.cssText = 'flex:1;text-align:left;background:none;border:none;padding:0;';
    nameEl.onclick = () => { const nn = prompt(LANG === 'en' ? 'Rename exercise:' : 'Übung umbenennen:', ex.name); if (nn && nn.trim()) { ex.name = nn.trim(); setActiveWO(w); renderScreen('workout'); } };
    head.appendChild(nameEl);
    const delEx = h('button', { textContent: '🗑' });
    delEx.className = 'tap'; delEx.style.cssText = 'background:none;color:var(--t-3);font-size:13px;';
    delEx.onclick = () => { w.exercises.splice(exi, 1); setActiveWO(w); renderScreen('workout'); };
    head.appendChild(delEx);
    card.appendChild(head);

    // PR hint + Progressions-Vorschlag
    const pr = woPR(ex.exId);
    const prRow = div(''); prRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
    if (pr.maxW) prRow.appendChild(div('', '<div style="font-size:10px;color:var(--t-3);">Rekord: ' + pr.maxW + ' kg · e1RM ' + pr.best1rm + ' kg</div>')).style.flex = '1';
    else prRow.appendChild(div('', '')).style.flex = '1';
    // Steigern: erhöht alle Satz-Gewichte um 2,5 kg (nur sinnvoll mit Vorwerten).
    if ((ex.sets || []).some(st => st.prev && +st.prev.weight > 0)) {
      const up = h('button', { textContent: '▲ +2,5 kg' }); up.className = 'tap';
      up.title = LANG === 'en' ? 'Add 2.5 kg to all sets' : '2,5 kg auf alle Sätze';
      up.style.cssText = 'flex:none;padding:5px 10px;border-radius:99px;font-size:11px;font-weight:600;border:1px solid rgba(48,209,88,.4);background:rgba(48,209,88,.12);color:var(--green);';
      up.onclick = () => { (ex.sets || []).forEach(st => { const base = +st.weight || +(st.prev && st.prev.weight) || 0; st.weight = base + 2.5; }); setActiveWO(w); haptic('light'); renderScreen('workout'); };
      prRow.appendChild(up);
    }
    card.appendChild(prRow);

    // set header — SET | PREV (last time) | KG | REPS | ✓
    const GRID = 'display:grid;grid-template-columns:24px 1.1fr 1fr 1fr 38px;gap:6px;';
    const hdr = div(''); hdr.style.cssText = GRID + 'font-size:10px;color:var(--t-3);letter-spacing:.5px;margin-bottom:4px;padding:0 2px;';
    hdr.innerHTML = '<div>SATZ</div><div style="text-align:center;">ZUVOR</div><div>KG</div><div>WDH</div><div></div>';
    card.appendChild(hdr);

    (ex.sets || []).forEach((st, si) => {
      const row = div(''); row.style.cssText = GRID + 'align-items:center;margin-bottom:5px;';
      const num = div('', '<div style="font-size:13px;color:var(--t-3);text-align:center;">' + (si + 1) + '</div>');
      // previous performance reference + progression arrow
      const pv = st.prev;
      let prevTxt = pv && (pv.weight || pv.reps) ? (pv.weight || 0) + '×' + (pv.reps || 0) : '–';
      let arrow = '';
      if (pv) { const c = woE1RM(st.weight, st.reps), p = woE1RM(pv.weight, pv.reps); if (c && p) { if (c > p) arrow = ' <span style="color:var(--green);">▲</span>'; else if (c < p) arrow = ' <span style="color:#FF453A;">▼</span>'; } }
      const prevCell = div('', '<div style="font-size:11px;color:var(--t-4);text-align:center;white-space:nowrap;">' + prevTxt + arrow + '</div>');
      // done rows get a green tint but stay fully editable (adjust weight anytime)
      const inpDone = st.done ? 'background:rgba(48,209,88,.10);border-color:rgba(48,209,88,.35);' : '';
      const wI = h('input', { type: 'number', inputMode: 'decimal', value: st.weight, placeholder: pv ? String(pv.weight || '') : '–' });
      wI.className = 'inp'; wI.style.cssText = 'padding:8px 4px;text-align:center;font-size:14px;' + inpDone;
      wI.oninput = e => { st.weight = e.target.value; setActiveWO(w); };
      const rI = h('input', { type: 'number', inputMode: 'numeric', value: st.reps, placeholder: pv ? String(pv.reps || '') : '–' });
      rI.className = 'inp'; rI.style.cssText = 'padding:8px 4px;text-align:center;font-size:14px;' + inpDone;
      rI.oninput = e => { st.reps = e.target.value; setActiveWO(w); };
      const chk = h('button', { textContent: '✓' });
      chk.className = 'tap';
      chk.style.cssText = 'width:36px;height:36px;border-radius:9px;font-size:14px;' +
        (st.done ? 'background:rgba(48,209,88,.18);border:1px solid rgba(48,209,88,.4);color:var(--green);'
                 : 'background:var(--glass-2);border:1px solid var(--edge);color:var(--t-3);');
      chk.onclick = () => { st.done = !st.done; if (st.done) { st.doneAt = Date.now(); woStartRest(); } else delete st.doneAt; setActiveWO(w); renderScreen('workout'); if (st.done) haptic('success'); };
      // tap a set number to remove it
      num.style.cursor = 'pointer'; num.title = 'Satz entfernen';
      num.onclick = () => { if ((ex.sets || []).length > 1) { ex.sets.splice(si, 1); setActiveWO(w); renderScreen('workout'); } };
      row.appendChild(num); row.appendChild(prevCell); row.appendChild(wI); row.appendChild(rI); row.appendChild(chk);
      card.appendChild(row);
    });

    const addSet = h('button', { textContent: '＋ Satz' });
    addSet.className = 'tap'; addSet.style.cssText = 'width:100%;margin-top:6px;font-size:12px;padding:8px;background:var(--glass-1);border:1px solid var(--edge);border-radius:var(--r-sm);color:var(--t-2);';
    addSet.onclick = () => {
      const last = (ex.sets || [])[ex.sets.length - 1];
      ex.sets.push({ weight: last ? last.weight : '', reps: last ? last.reps : '', done: false });
      setActiveWO(w); renderScreen('workout');
    };
    card.appendChild(addSet);
    s.appendChild(card);
  });

  // add exercise
  const addEx = h('button', { textContent: '＋ Übung hinzufügen' });
  addEx.className = 'btn btn-glass tap'; addEx.style.cssText = 'width:100%;font-size:14px;margin-bottom:8px;';
  addEx.onclick = () => woOpenPicker(w);
  s.appendChild(addEx);

  // Werkzeuge: Scheibenrechner · Pausen-Zeit einstellen
  const tools = div(''); tools.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;';
  const plateB = h('button', { textContent: LANG === 'en' ? '🔩 Plates' : '🔩 Scheiben' }); plateB.className = 'btn btn-ghost tap'; plateB.style.cssText = 'flex:1;font-size:12.5px;';
  plateB.onclick = () => woPlateCalc();
  const restB = h('button', { textContent: '⏱️ ' + (LANG === 'en' ? 'Rest ' : 'Pause ') + woRestDur() + 's' }); restB.className = 'btn btn-ghost tap'; restB.style.cssText = 'flex:1;font-size:12.5px;';
  restB.onclick = () => { const v = parseInt(prompt(LANG === 'en' ? 'Rest between sets (seconds):' : 'Pause zwischen Sätzen (Sekunden):', woRestDur()) || ''); if (v > 0) { woSetRestDur(v); showToast((LANG === 'en' ? 'Rest set to ' : 'Pause: ') + woRestDur() + 's', '⏱️'); renderScreen('workout'); } };
  tools.appendChild(plateB); tools.appendChild(restB);
  s.appendChild(tools);

  // finish / routine / discard
  const finish = h('button', { textContent: '✓ Workout beenden' });
  finish.className = 'btn tap'; finish.style.cssText = 'width:100%;background:var(--green,#30D158);color:#062;font-weight:700;padding:14px;border:none;border-radius:var(--r-md);margin-bottom:8px;';
  finish.onclick = () => woFinish(w);
  s.appendChild(finish);

  const saveRoutine = h('button', { textContent: '📋 Als Routine speichern' });
  saveRoutine.className = 'btn btn-glass tap'; saveRoutine.style.cssText = 'width:100%;font-size:13px;margin-bottom:8px;';
  saveRoutine.onclick = () => {
    if (!(w.exercises || []).length) { showToast('Erst Übungen hinzufügen', '⚠️'); return; }
    const name = prompt(LANG === 'en' ? 'Routine name:' : 'Name der Routine:', w.name || 'Routine');
    if (!name) return;
    const routines = getRoutines();
    routines.push({ id: Date.now(), name: name.trim(), exercises: w.exercises.map(e => ({ exId: e.exId, name: e.name, targetSets: (e.sets || []).length })) });
    saveRoutines(routines); showToast('Routine gespeichert', '📋'); haptic('success');
  };
  s.appendChild(saveRoutine);

  const discard = h('button', { textContent: 'Verwerfen' });
  discard.className = 'btn btn-ghost tap'; discard.style.cssText = 'width:100%;font-size:12px;color:var(--red,#FF453A);';
  discard.onclick = () => { if (confirm(LANG === 'en' ? 'Discard workout? Unsaved sets will be lost.' : 'Workout verwerfen? Nicht gespeicherte Sätze gehen verloren.')) { localStorage.removeItem('los_wo_active'); WO_VIEW = 'active'; renderScreen('workout'); } };
  s.appendChild(discard);
}

// Exercise picker overlay.
function woOpenPicker(w) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:4px;">ÜBUNG WÄHLEN</div><div class="h2" style="margin-bottom:14px;">Bibliothek</div>');

  const search = h('input', { type: 'text', placeholder: '🔍 Übung suchen…' });
  search.className = 'inp'; search.style.marginBottom = '12px';
  inner.appendChild(search);

  const listWrap = div(''); inner.appendChild(listWrap);
  const addPick = (ex) => {
    w.exercises = w.exercises || [];
    w.exercises.push({ exId: ex.id, name: ex.n, sets: woSetsFromLast(ex.id) });
    setActiveWO(w); closeOverlay(); renderScreen('workout'); haptic('light');
  };
  const paint = (q) => {
    listWrap.innerHTML = '';
    q = (q || '').toLowerCase().trim();
    WO_MUSCLES.forEach(mus => {
      const items = woLib().filter(e => e.m === mus && (!q || e.n.toLowerCase().includes(q)));
      if (!items.length) return;
      listWrap.appendChild(div('label', mus)).style.cssText = 'font-size:10px;margin:10px 0 6px;';
      items.forEach(ex => {
        const row = div('row tap', '<span style="font-size:15px;">🏋</span><div style="flex:1;font-size:14px;color:var(--t-1);">' + esc(ex.n) + '</div><span style="color:var(--blue);font-size:18px;">＋</span>');
        row.onclick = () => addPick(ex);
        listWrap.appendChild(row);
      });
    });
    // custom add
    if (q && !woLib().some(e => e.n.toLowerCase() === q)) {
      const row = div('row tap', '<span style="font-size:15px;">✚</span><div style="flex:1;font-size:14px;color:var(--blue);">„' + esc(q) + '" als eigene Übung anlegen</div>');
      row.onclick = () => {
        const id = 'cx' + Date.now();
        const custom = ls('los_wo_exercises') || []; const n = search.value.trim();
        custom.push({ id, n, m: 'Arme' }); ls('los_wo_exercises', custom);
        addPick({ id, n });
      };
      listWrap.appendChild(row);
    }
  };
  search.oninput = () => paint(search.value);
  paint('');
  openOverlay();
}

// Finish → save to history, compute volume, award XP, log entry.
function woFinish(w) {
  const done = woDoneSets(w);
  if (!done) { if (!confirm(LANG === 'en' ? 'No sets checked off. Finish anyway?' : 'Keine Sätze abgehakt. Trotzdem beenden?')) return; }
  const vol = woVolume(w);
  const durationMin = Math.max(1, Math.round((Date.now() - (w.startedAt || Date.now())) / 60000));
  const rec = { id: w.id, date: Date.now(), name: w.name || 'Workout', durationMin, volume: vol,
    exercises: (w.exercises || []).map(e => ({ exId: e.exId, name: e.name, sets: (e.sets || []).filter(st => st.done).map(st => ({ weight: st.weight, reps: st.reps, done: true })) })) };
  const all = getWorkouts(); all.push(rec); saveWorkouts(all);
  localStorage.removeItem('los_wo_active'); WO_VIEW = 'active';
  if (typeof addXP === 'function') addXP(50, 'body');
  // Log-Integration
  try {
    const key = 'los_log_' + today();
    const log = ls(key) || [];
    log.push({ id: Date.now(), text: '🏋 ' + rec.name + ' · ' + done + ' Sätze · ' + vol.toLocaleString('de-DE') + ' kg', folder: '🏋 Training', time: new Date().toTimeString().slice(0, 5), src: 'workout' });
    ls(key, log);
  } catch (e) {}
  showToast('Workout gespeichert · +50 XP', '🏋'); haptic('levelup');
  renderScreen('workout');
}

// Read-only detail of a past workout.
function woOpenDetail(id) {
  const w = getWorkouts().find(x => x.id === id); if (!w) return;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  const d = new Date(w.date || w.id);
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:4px;">' + d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>' +
    '<div class="h2" style="margin-bottom:4px;">' + esc(w.name || 'Workout') + '</div>' +
    '<div style="font-size:12px;color:var(--t-3);margin-bottom:16px;">' + woDoneSets(w) + ' Sätze · ' + (w.volume || woVolume(w)).toLocaleString('de-DE') + ' kg Volumen · ' + (w.durationMin || 0) + ' min</div>');
  (w.exercises || []).forEach(ex => {
    const card = div('glass'); card.style.marginBottom = '10px';
    let rows = '';
    (ex.sets || []).forEach((st, i) => { rows += '<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--t-2);padding:3px 0;"><span>' + (LANG === 'en' ? 'Set ' : 'Satz ') + (i + 1) + '</span><span>' + (st.weight || 0) + ' kg × ' + (st.reps || 0) + '</span></div>'; });
    card.innerHTML = '<div style="font-size:15px;font-weight:600;color:var(--t-1);margin-bottom:6px;">' + esc(ex.name) + '</div>' + rows;
    inner.appendChild(card);
  });
  const del = h('button', { textContent: '🗑  Workout löschen' });
  del.className = 'btn tap'; del.style.cssText = 'width:100%;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.3);color:#FF453A;font-weight:600;padding:12px;border-radius:var(--r-md);margin-top:6px;';
  del.onclick = () => { saveWorkouts(getWorkouts().filter(x => x.id !== id)); closeOverlay(); renderScreen('workout'); };
  inner.appendChild(del);
  openOverlay();
}

// Rest-Timer-Leiste (sticky oben in der Session). Läuft über WO_REST + Intervall.
function woRestBar() {
  const bar = div('glass'); bar.id = 'wo_rest_bar';
  bar.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;border:1px solid rgba(10,132,255,.35);position:sticky;top:4px;z-index:5;';
  const left = Math.max(0, woRestLeft());
  bar.innerHTML = '<span style="font-size:18px;">⏱️</span>' +
    '<div style="flex:1;min-width:0;"><div class="label" style="font-size:9px;">' + (LANG === 'en' ? 'REST' : 'PAUSE') + '</div>' +
    '<div id="wo_rest_txt" style="font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--blue);">' + woFmtClock(left) + '</div></div>';
  const mk = (txt, fn) => { const b = h('button', { textContent: txt }); b.className = 'tap'; b.style.cssText = 'flex:none;padding:8px 10px;border-radius:8px;font-size:12px;font-weight:600;background:var(--glass-2);border:1px solid var(--edge);color:var(--t-2);'; b.onclick = fn; return b; };
  bar.appendChild(mk('−15', () => { if (WO_REST) { WO_REST.endAt -= 15000; WO_REST.fired = false; const t = el('wo_rest_txt'); if (t) t.textContent = woFmtClock(Math.max(0, woRestLeft())); } }));
  bar.appendChild(mk('+15', () => { if (WO_REST) { WO_REST.endAt += 15000; WO_REST.fired = false; const t = el('wo_rest_txt'); if (t) t.textContent = woFmtClock(Math.max(0, woRestLeft())); } }));
  bar.appendChild(mk(LANG === 'en' ? 'Skip' : 'Stop', () => { WO_REST = null; const b = el('wo_rest_bar'); if (b) b.remove(); }));
  return bar;
}

// Scheibenrechner: welche Hantelscheiben pro Seite für ein Zielgewicht.
function woPlateCalc() {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (EN ? 'PLATE CALCULATOR' : 'SCHEIBENRECHNER') + '</div>' +
    '<div class="h2" style="margin-bottom:14px;">' + (EN ? 'Plates <span class="gold">per side</span>' : 'Scheiben <span class="gold">pro Seite</span>') + '</div>');
  const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  const COL = { 25: '#FF453A', 20: '#0A84FF', 15: '#FFD60A', 10: '#30D158', 5: '#fff', 2.5: '#8E8E93', 1.25: '#C0C0C0' };
  let bar = ls('los_wo_bar') || 20;
  inner.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:4px;">' + (EN ? 'TARGET WEIGHT (kg)' : 'ZIELGEWICHT (kg)') + '</div>');
  const wInp = h('input', { type: 'number', inputmode: 'decimal', placeholder: '100' }); wInp.className = 'inp'; wInp.style.cssText = 'width:100%;font-size:16px;margin-bottom:10px;';
  inner.appendChild(wInp);
  inner.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:4px;">' + (EN ? 'BAR' : 'STANGE') + '</div>');
  const barRow = div(''); barRow.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;';
  [20, 15, 10, 0].forEach(bw => {
    const b = h('button', { textContent: bw + ' kg' }); b.className = 'tap'; b.dataset.bw = bw;
    const paintBar = () => { b.style.cssText = 'flex:1;padding:9px 0;border-radius:8px;font-size:12.5px;font-weight:600;border:1px solid ' + (bar === bw ? 'var(--gold)' : 'var(--edge)') + ';background:' + (bar === bw ? 'rgba(197,164,90,.14)' : 'var(--glass-2)') + ';color:' + (bar === bw ? 'var(--gold)' : 'var(--t-2)') + ';'; };
    paintBar(); b.onclick = () => { bar = bw; ls('los_wo_bar', bw); barRow.querySelectorAll('button').forEach(x => x.dispatchEvent(new Event('_p'))); calc(); };
    b.addEventListener('_p', paintBar);
    barRow.appendChild(b);
  });
  inner.appendChild(barRow);
  const res = div(''); res.style.cssText = 'min-height:60px;'; inner.appendChild(res);
  function calc() {
    const target = parseFloat(wInp.value);
    res.innerHTML = '';
    if (!(target > 0)) return;
    if (target < bar) { res.innerHTML = '<div style="font-size:13px;color:var(--t-3);">' + (EN ? 'Lighter than the bar.' : 'Leichter als die Stange.') + '</div>'; return; }
    let perSide = (target - bar) / 2; const used = [];
    PLATES.forEach(p => { while (perSide >= p - 1e-9) { used.push(p); perSide = Math.round((perSide - p) * 100) / 100; } });
    const chips = used.map(p => '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:44px;margin:3px;border-radius:8px;font-size:13px;font-weight:700;border:2px solid ' + (COL[p] || '#888') + ';color:' + (COL[p] || '#888') + ';background:rgba(255,255,255,.03);">' + (p % 1 === 0 ? p : p) + '</span>').join('');
    const rem = perSide > 0.01 ? '<div style="font-size:11px;color:#FF453A;margin-top:8px;">' + (EN ? 'Not exact — ' : 'Nicht exakt — ') + (perSide * 2).toFixed(2) + (EN ? ' kg short' : ' kg fehlen') + '</div>' : '';
    res.innerHTML = '<div style="font-size:12px;color:var(--t-3);margin-bottom:6px;">' + (EN ? 'Load each side with:' : 'Pro Seite auflegen:') + '</div>' +
      (used.length ? '<div style="display:flex;flex-wrap:wrap;">' + chips + '</div>' : '<div style="font-size:13px;color:var(--t-3);">' + (EN ? 'Just the bar.' : 'Nur die Stange.') + '</div>') + rem;
  }
  wInp.oninput = calc; wInp.focus();
  openOverlay();
}

// Live session timer — ticks every second, updates only the timer element
// (no full re-render, so inputs keep focus). No-op when not in an active session.
setInterval(function () {
  const w = getActiveWO();
  const t = el('wo_timer');
  if (t && w) t.textContent = woFmtClock(Math.round((Date.now() - (w.startedAt || Date.now())) / 1000));
  // Rest-Timer
  if (WO_REST) {
    const left = woRestLeft();
    const rt = el('wo_rest_txt');
    if (rt) rt.textContent = left > 0 ? woFmtClock(left) : (LANG === 'en' ? 'Done ✓' : 'Fertig ✓');
    if (left <= 0 && !WO_REST.fired) { WO_REST.fired = true; woBeep(); if (navigator.vibrate) try { navigator.vibrate([200, 90, 200]); } catch (e) {} }
    if (left <= -3) { WO_REST = null; const bar = el('wo_rest_bar'); if (bar) bar.remove(); }
  }
}, 1000);
