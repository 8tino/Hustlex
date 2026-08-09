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

// ─── Screen dispatch ───
function renderWorkout(s) {
  s.className = 'screen on';
  const active = getActiveWO();
  if (active) return woRenderActive(s, active);
  woRenderHome(s);
}

// ─── Home (no active session) ───
function woRenderHome(s) {
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">KÖRPER · GYM</div>' +
    '<div class="h2">Workout-<span class="gold italic">Log</span></div>';

  const start = h('button', { textContent: '＋ Neues Workout starten' });
  start.className = 'btn tap';
  start.style.cssText = 'width:100%;background:var(--blue);color:#fff;font-weight:600;font-size:15px;padding:14px;border:none;border-radius:var(--r-md);margin:14px 0 8px;';
  start.onclick = () => { setActiveWO({ id: Date.now(), name: 'Workout', startedAt: Date.now(), exercises: [] }); renderScreen('workout'); haptic('success'); };
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
      setActiveWO({ id: Date.now(), name: r.name, startedAt: Date.now(), exercises: (r.exercises || []).map(e => ({ exId: e.exId, name: e.name, sets: [{ weight: '', reps: '', done: false }] })) });
      renderScreen('workout'); haptic('success');
    };
    const del = h('button', { textContent: '🗑' });
    del.className = 'tap'; del.style.cssText = 'font-size:13px;background:none;color:var(--t-3);padding-left:4px;';
    del.onclick = () => { saveRoutines(getRoutines().filter(x => x.id !== r.id)); renderScreen('workout'); };
    row.appendChild(go); row.appendChild(del);
    rb.appendChild(row);
  });
  s.appendChild(rsec);

  // PRs
  const workouts = getWorkouts();
  if (workouts.length) {
    const prsec = section('Persönliche Rekorde', 'wo_prs', true); const pb = prsec._body;
    const bigLifts = ['squat', 'bench', 'deadlift', 'ohp', 'pullup'];
    let any = false;
    bigLifts.forEach(id => {
      const pr = woPR(id); if (!pr.maxW && !pr.best1rm) return;
      any = true;
      const row = div('row');
      row.innerHTML = '<span style="font-size:16px;">🏆</span>' +
        '<div style="flex:1;"><div style="font-size:13px;color:var(--t-1);">' + esc(woExName(id)) + '</div></div>' +
        '<div style="text-align:right;"><div style="font-size:13px;font-weight:700;color:var(--gold);">' + pr.maxW + ' kg</div>' +
        '<div style="font-size:10px;color:var(--t-3);">e1RM ' + pr.best1rm + ' kg</div></div>';
      pb.appendChild(row);
    });
    if (!any) pb.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);">Noch keine Rekorde erfasst.</div>'));
    s.appendChild(prsec);
  }

  // History
  const hsec = section('Letzte Workouts', 'wo_history', true); const hb = hsec._body;
  if (!workouts.length) {
    hb.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;">Noch keine Workouts. Tippe oben auf „Neues Workout starten".</div>'));
  }
  workouts.slice().reverse().slice(0, 15).forEach(w => {
    const row = div('row tap');
    const d = new Date(w.date || w.id);
    row.innerHTML = '<span style="font-size:18px;">🏋</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--t-1);">' + esc(w.name || 'Workout') + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' · ' + woDoneSets(w) + ' Sätze · ' + (w.volume || woVolume(w)).toLocaleString('de-DE') + ' kg Volumen' + (w.durationMin ? ' · ' + w.durationMin + ' min' : '') + '</div></div>' +
      '<span style="color:var(--t-3);font-size:16px;">›</span>';
    row.onclick = () => woOpenDetail(w.id);
    hb.appendChild(row);
  });
  s.appendChild(hsec);
}

// ─── Active session ───
function woFmtClock(secs) { secs = Math.max(0, secs); const m = Math.floor(secs / 60), ss = secs % 60; return m + ':' + String(ss).padStart(2, '0'); }

function woRenderActive(s, w) {
  const secs = Math.round((Date.now() - (w.startedAt || Date.now())) / 1000);
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">LÄUFT · <span id="wo_timer" style="font-variant-numeric:tabular-nums;">' + woFmtClock(secs) + '</span></div>';

  // name
  const nameI = h('input', { type: 'text', value: w.name || 'Workout' });
  nameI.className = 'inp'; nameI.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:6px;';
  nameI.oninput = e => { w.name = e.target.value; setActiveWO(w); };
  s.appendChild(nameI);

  // live stats
  s.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);margin-bottom:12px;">' + woDoneSets(w) + ' Sätze · ' + woVolume(w).toLocaleString('de-DE') + ' kg Volumen</div>'));

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

    // PR hint
    const pr = woPR(ex.exId);
    if (pr.maxW) card.appendChild(div('', '<div style="font-size:10px;color:var(--t-3);margin-bottom:8px;">Rekord: ' + pr.maxW + ' kg · e1RM ' + pr.best1rm + ' kg</div>'));

    // set header
    const hdr = div(''); hdr.style.cssText = 'display:grid;grid-template-columns:28px 1fr 1fr 40px;gap:6px;font-size:10px;color:var(--t-3);letter-spacing:.5px;margin-bottom:4px;padding:0 2px;';
    hdr.innerHTML = '<div>SATZ</div><div>KG</div><div>WDH</div><div></div>';
    card.appendChild(hdr);

    (ex.sets || []).forEach((st, si) => {
      const row = div(''); row.style.cssText = 'display:grid;grid-template-columns:28px 1fr 1fr 40px;gap:6px;align-items:center;margin-bottom:5px;';
      const num = div('', '<div style="font-size:13px;color:var(--t-3);text-align:center;">' + (si + 1) + '</div>');
      // done rows get a green tint but stay fully editable (adjust weight anytime)
      const inpDone = st.done ? 'background:rgba(48,209,88,.10);border-color:rgba(48,209,88,.35);' : '';
      const wI = h('input', { type: 'number', inputMode: 'decimal', value: st.weight, placeholder: '–' });
      wI.className = 'inp'; wI.style.cssText = 'padding:8px;text-align:center;font-size:14px;' + inpDone;
      wI.oninput = e => { st.weight = e.target.value; setActiveWO(w); };
      const rI = h('input', { type: 'number', inputMode: 'numeric', value: st.reps, placeholder: '–' });
      rI.className = 'inp'; rI.style.cssText = 'padding:8px;text-align:center;font-size:14px;' + inpDone;
      rI.oninput = e => { st.reps = e.target.value; setActiveWO(w); };
      const chk = h('button', { textContent: '✓' });
      chk.className = 'tap';
      chk.style.cssText = 'width:36px;height:36px;border-radius:9px;font-size:14px;' +
        (st.done ? 'background:rgba(48,209,88,.18);border:1px solid rgba(48,209,88,.4);color:var(--green);'
                 : 'background:var(--glass-2);border:1px solid var(--edge);color:var(--t-3);');
      chk.onclick = () => { st.done = !st.done; if (st.done) st.doneAt = Date.now(); else delete st.doneAt; setActiveWO(w); renderScreen('workout'); if (st.done) haptic('success'); };
      // long-press a set number to remove it
      num.style.cursor = 'pointer'; num.title = 'Satz entfernen';
      num.onclick = () => { if ((ex.sets || []).length > 1) { ex.sets.splice(si, 1); setActiveWO(w); renderScreen('workout'); } };
      row.appendChild(num); row.appendChild(wI); row.appendChild(rI); row.appendChild(chk);
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
  addEx.className = 'btn btn-glass tap'; addEx.style.cssText = 'width:100%;font-size:14px;margin-bottom:14px;';
  addEx.onclick = () => woOpenPicker(w);
  s.appendChild(addEx);

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
  discard.onclick = () => { if (confirm(LANG === 'en' ? 'Discard workout? Unsaved sets will be lost.' : 'Workout verwerfen? Nicht gespeicherte Sätze gehen verloren.')) { localStorage.removeItem('los_wo_active'); renderScreen('workout'); } };
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
    w.exercises.push({ exId: ex.id, name: ex.n, sets: [{ weight: '', reps: '', done: false }] });
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
  localStorage.removeItem('los_wo_active');
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
    (ex.sets || []).forEach((st, i) => { rows += '<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--t-2);padding:3px 0;"><span>Satz ' + (i + 1) + '</span><span>' + (st.weight || 0) + ' kg × ' + (st.reps || 0) + '</span></div>'; });
    card.innerHTML = '<div style="font-size:15px;font-weight:600;color:var(--t-1);margin-bottom:6px;">' + esc(ex.name) + '</div>' + rows;
    inner.appendChild(card);
  });
  const del = h('button', { textContent: '🗑  Workout löschen' });
  del.className = 'btn tap'; del.style.cssText = 'width:100%;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.3);color:#FF453A;font-weight:600;padding:12px;border-radius:var(--r-md);margin-top:6px;';
  del.onclick = () => { saveWorkouts(getWorkouts().filter(x => x.id !== id)); closeOverlay(); renderScreen('workout'); };
  inner.appendChild(del);
  openOverlay();
}

// Live session timer — ticks every second, updates only the timer element
// (no full re-render, so inputs keep focus). No-op when not in an active session.
setInterval(function () {
  const t = el('wo_timer'); if (!t) return;
  const w = getActiveWO(); if (!w) return;
  t.textContent = woFmtClock(Math.round((Date.now() - (w.startedAt || Date.now())) / 1000));
}, 1000);
