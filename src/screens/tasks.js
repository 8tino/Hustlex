// ═══════════════════════════════════════════════════════
// TASKS · Daily recurring checklist — the same tasks appear
//   every morning, you tick them off; state resets each day.
//   Fully editable in-app: add, rename, delete.
//   Stores: los_tasks = [{id,icon,text}]  (templates)
//           los_tasks_done_<date> = [taskId,…]  (per-day state)
// ═══════════════════════════════════════════════════════

function getTasks() { return ls('los_tasks') || []; }
function saveTasks(a) { ls('los_tasks', a); }

// Task folders (customizable). Default set is created on first use so new users
// start with a clean structure; fully editable under Mehr → 🎛 App anpassen.
const TASK_DEFAULT_FOLDERS = ['🌅 Morgen', '💼 Arbeit', '🏋 Training', '🌙 Abend'];
function getTaskFolders() { const v = ls('los_task_folders'); return Array.isArray(v) ? v : TASK_DEFAULT_FOLDERS.slice(); }
function saveTaskFolders(a) { ls('los_task_folders', a); }

// Cross-linking: a task can mirror a Körper metric (Wasser/Protein/kcal/Schlaf).
// Then it auto-completes when that goal is reached — no double tracking.
const TASK_LINKS = [
  { k: 'water',   l: 'Wasser' },
  { k: 'protein', l: 'Protein' },
  { k: 'kcal',    l: 'Kalorien' },
  { k: 'sleep',   l: 'Schlaf' },
];
function taskLinkInfo(kind) {
  if (typeof getCfg !== 'function' || typeof getTotals !== 'function' || !STATE.day) return null;
  const cfg = getCfg(); const t = getTotals();
  if (kind === 'water')   { const cur = (STATE.day.water || 0) / 1000, goal = (cfg.waterGoal || 3000) / 1000; return { label: 'Wasser', cur: cur.toFixed(1), goal: goal.toFixed(1), u: 'L', done: cur >= goal }; }
  if (kind === 'protein') { const cur = t.p, goal = cfg.proteinGoal; return { label: 'Protein', cur, goal, u: 'g', done: cur >= goal }; }
  if (kind === 'kcal')    { const cur = t.kcal, goal = cfg.kcalGoal; return { label: 'Kalorien', cur, goal, u: '', done: cur >= goal }; }
  if (kind === 'sleep')   { const sh = parseFloat(getSleepHours() || 0), goal = cfg.sleepGoal || 7.5; return { label: 'Schlaf', cur: sh, goal, u: 'h', done: !!STATE.day.sleep && sh >= goal }; }
  return null;
}
// True if the task counts as done today (linked → derived from Körper goal).
function taskDone(t) { if (t.link) { const i = taskLinkInfo(t.link); return !!(i && i.done); } return getTasksDone().includes(t.id); }
// Auto-detect a link from the task text so "Trinken" just works.
function detectTaskLink(text) {
  const s = (text || '').toLowerCase();
  if (/trink|wasser|hydrat/.test(s)) return 'water';
  if (/protein|eiwei/.test(s)) return 'protein';
  if (/schlaf|sleep/.test(s)) return 'sleep';
  if (/kalorien|kcal/.test(s)) return 'kcal';
  return null;
}
function getTasksDone() { return ls('los_tasks_done_' + today()) || []; }
function saveTasksDone(a) { ls('los_tasks_done_' + today(), a); }

// Task ↔ Log bridge: ticking a task writes it into today's Log (folder
// "Tasks") so it shows up in the AUSWERTUNG/statistics. Un-ticking removes
// that auto-entry again. Auto-entries carry src:'task' + taskId so we never
// touch entries the user typed by hand.
function addTaskLog(t) {
  const a = getLog();
  if (a.some(e => e.taskId === t.id)) return;
  a.push({
    id: Date.now(), time: new Date().toTimeString().slice(0, 5),
    text: (t.icon ? t.icon + ' ' : '') + t.text, dur: 0,
    folder: 'Tasks', src: 'task', taskId: t.id,
  });
  a.sort((x, y) => (x.time || '').localeCompare(y.time || ''));
  saveLog(a);
}
function removeTaskLog(id) {
  const a = getLog();
  const rest = a.filter(e => e.taskId !== id);
  if (rest.length !== a.length) saveLog(rest);
}

// Streak: consecutive days on which ALL tasks of that day were completed
function taskStreak(id) {
  let n = 0;
  const d = new Date();
  if (!getTasksDone().includes(id)) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const done = ls('los_tasks_done_' + d.toDateString()) || [];
    if (done.includes(id)) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}

function renderTasks(s) {
  s.className = 'screen on';
  const tasks = getTasks();
  const doneCount = tasks.filter(taskDone).length;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  s.innerHTML = '<div class="label" style="margin-bottom:4px;">TASKS · ' + new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>' +
    '<div class="h2">Deine <span class="gold">täglichen</span> Aufgaben</div>';

  // Progress card
  if (tasks.length) {
    const pct = Math.round((doneCount / tasks.length) * 100);
    const pc = div(allDone ? 'glass-success' : 'glass-accent', '');
    pc.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">' +
      '<div class="label">' + (allDone ? '✓ ALLES ERLEDIGT' : 'HEUTE') + '</div>' +
      '<div style="font-size:22px;font-weight:700;color:' + (allDone ? 'var(--green)' : 'var(--gold)') + ';">' + doneCount + '<span style="font-size:14px;color:var(--t-3);"> / ' + tasks.length + '</span></div></div>';
    pc.appendChild(div('bar', '<div class="bar-fill" style="width:' + pct + '%;' + (allDone ? 'background:var(--green);' : '') + '"></div>'));
    s.appendChild(pc);
  }

  // Add — at the TOP so you never scroll to add a task
  const addRow = div('');
  addRow.style.cssText = 'display:flex;gap:8px;margin-top:2px;';
  const inp = h('input', { type: 'text', placeholder: 'Neue Aufgabe… (Emoji vorne = Icon)', maxLength: 80 }, '');
  inp.className = 'inp';
  inp.style.cssText = 'flex:1;font-size:14px;';
  const ab = h('button', { textContent: '+' }, '');
  ab.className = 'btn btn-gold tap';
  ab.style.cssText = 'width:48px;height:48px;padding:0;flex-shrink:0;border-radius:var(--r-md);font-size:20px;';
  const add = () => {
    const raw = inp.value.trim(); if (!raw) return;
    const m = raw.match(/^(\p{Emoji}️?|\p{Extended_Pictographic})\s*(.+)$/u);
    const text = m ? m[2] : raw;
    const a = getTasks();
    a.push({ id: Date.now(), icon: m ? m[1] : '', text, link: detectTaskLink(text) }); // z. B. „Trinken" ↔ Körper/Wasser
    saveTasks(a); inp.value = ''; renderScreen('tasks');
  };
  ab.onclick = add;
  inp.onkeydown = e => { if (e.key === 'Enter') add(); };
  addRow.appendChild(inp); addRow.appendChild(ab);
  s.appendChild(addRow);

  if (!tasks.length) {
    const empty = div('glass', 'Noch keine Tasks. Leg oben deine täglichen Aufgaben an — sie erscheinen ab dann jeden Tag neu zum Abhaken.');
    empty.style.cssText = 'border-style:dashed;text-align:center;font-size:13px;color:var(--t-3);line-height:1.6;';
    s.appendChild(empty);
  }

  // Search (only shown when there's enough to warrant it)
  const search = h('input', { type: 'search', placeholder: '🔍 Aufgabe suchen…' });
  if (tasks.length >= 6) {
    search.className = 'inp'; search.style.cssText = 'width:100%;font-size:14px;margin:2px 0 6px;';
    s.appendChild(search);
  }
  const listArea = div(''); s.appendChild(listArea);

  // One task row — reused by both flat (search) and grouped views.
  const taskRow = t => {
    const linked = t.link ? taskLinkInfo(t.link) : null;
    const isDone = taskDone(t);
    const streak = linked ? 0 : taskStreak(t.id);
    const row = div('row tap' + (isDone ? ' done' : ''), '');
    row.dataset.sortid = t.id;
    const grip = dragHandle();
    const cb = div('check' + (isDone ? ' on' : ''), '');
    cb.style.cssText = 'width:28px;height:28px;';
    const sub = linked
      ? '<div style="font-size:11px;color:' + (linked.done ? 'var(--green)' : 'var(--blue)') + ';margin-top:2px;">🔗 ' + linked.label + ' · ' + linked.cur + '/' + linked.goal + linked.u + ' → Körper</div>'
      : (streak > 1 ? '<div style="font-size:11px;color:var(--gold);margin-top:2px;">🔥 ' + streak + ' Tage in Folge</div>' : '');
    const info = div('', '<div style="font-size:14px;color:var(--t-1);' + (isDone ? 'text-decoration:line-through;' : '') + '">' + (t.icon ? t.icon + ' ' : '') + t.text + '</div>' + sub);
    info.style.cssText = 'flex:1;min-width:0;';
    row.onclick = () => {
      if (linked) { navTo('vitals'); showToast('Trag es in Körper ein — der Task hakt sich dann selbst ab', '🔗'); return; }
      let d = getTasksDone();
      if (d.includes(t.id)) { d = d.filter(x => x !== t.id); removeTaskLog(t.id); }
      else { d.push(t.id); haptic('success'); addXP(10, 'discipline'); addTaskLog(t); }
      saveTasksDone(d); renderScreen('tasks'); updateStatusBar();
    };
    // 🔗 = mit Körper-Wert verknüpfen (Wasser/Protein/kcal/Schlaf)
    const lnk = h('button', { textContent: t.link ? '🔗' : '⛓' }, '');
    lnk.style.cssText = 'background:none;color:' + (t.link ? 'var(--blue)' : 'var(--t-4)') + ';font-size:12px;padding:4px 4px;';
    lnk.title = 'Mit Körper verknüpfen';
    lnk.onclick = (e) => {
      e.stopPropagation();
      const cur = TASK_LINKS.findIndex(x => x.k === t.link);
      const opts = TASK_LINKS.map((x, i) => (i + 1) + ') ' + x.l).join('   ');
      const v = prompt('Mit welchem Körper-Wert verknüpfen?\n0) keine   ' + opts, cur >= 0 ? String(cur + 1) : '0');
      if (v === null) return;
      const n = parseInt(v);
      const a = getTasks(); const tt = a.find(x => x.id === t.id);
      tt.link = (n >= 1 && n <= TASK_LINKS.length) ? TASK_LINKS[n - 1].k : null;
      saveTasks(a); renderScreen('tasks');
    };
    // 📁 = Kategorie/Ordner zuweisen
    const fld = h('button', { textContent: '📁' }, '');
    fld.style.cssText = 'background:none;color:var(--t-4);font-size:12px;padding:4px 4px;';
    fld.title = 'Kategorie';
    fld.onclick = (e) => {
      e.stopPropagation();
      const folders = getTaskFolders();
      const nv = prompt('Ordner (leer = ohne):' + (folders.length ? '\nVorhanden: ' + folders.join(', ') : ''), t.cat || '');
      if (nv !== null) {
        const name = nv.trim();
        if (name && !folders.includes(name)) saveTaskFolders(folders.concat([name])); // neuer Ordner wird gemerkt
        const a = getTasks(); a.find(x => x.id === t.id).cat = name || null; saveTasks(a); renderScreen('tasks');
      }
    };
    const edit = h('button', { textContent: '✎' }, '');
    edit.style.cssText = 'background:none;color:var(--t-4);font-size:13px;padding:4px 4px;';
    edit.onclick = (e) => {
      e.stopPropagation();
      const nv = prompt('Task umbenennen:', t.text);
      if (nv && nv.trim()) { const a = getTasks(); a.find(x => x.id === t.id).text = nv.trim(); saveTasks(a); renderScreen('tasks'); }
    };
    const del = h('button', { textContent: '×' }, '');
    del.style.cssText = 'background:none;color:var(--t-4);font-size:16px;padding:4px 4px;';
    del.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Task "' + t.text + '" dauerhaft löschen?')) { saveTasks(getTasks().filter(x => x.id !== t.id)); renderScreen('tasks'); }
    };
    row.appendChild(grip); row.appendChild(cb); row.appendChild(info); row.appendChild(lnk); row.appendChild(fld); row.appendChild(edit); row.appendChild(del);
    return row;
  };

  // Render a set of tasks: OPEN ones stay visible (sortable), DONE ones fold
  // away into a collapsed "✓ Erledigt · N" so the active list never gets long.
  const fillList = (container, arr, sortable, wrapOpen) => {
    const open = arr.filter(t => !taskDone(t));
    const doneArr = arr.filter(t => taskDone(t));
    const w = div('sortlist'); open.forEach(t => w.appendChild(taskRow(t)));
    // Offene Tasks (ohne Ordner) in einen einklappbaren „Offen"-Abschnitt.
    if (wrapOpen && open.length) {
      const od = section('◻ Offen · ' + open.length, 't_open', true);
      od._body.appendChild(w); container.appendChild(od);
    } else {
      container.appendChild(w);
    }
    if (sortable) makeSortable(w, ids => saveTasks(applyOrder(getTasks(), ids)));
    if (doneArr.length) {
      const dd = document.createElement('details');
      dd.className = 'sect'; dd.style.marginTop = '4px';
      dd.innerHTML = '<summary class="sect-sum" style="color:var(--green);">✓ Erledigt · ' + doneArr.length + '</summary>';
      const dw = div('sect-body'); doneArr.forEach(t => dw.appendChild(taskRow(t))); dd.appendChild(dw);
      container.appendChild(dd);
    }
  };

  const paint = () => {
    listArea.innerHTML = '';
    const all = getTasks();
    const q = search.value.trim().toLowerCase();
    if (q) { // flat filtered
      const hits = all.filter(t => t.text.toLowerCase().includes(q));
      if (!hits.length) { listArea.appendChild(div('', '<div style="font-size:13px;color:var(--t-3);padding:8px 4px;">Nichts gefunden.</div>')); return; }
      fillList(listArea, hits, false, false);
      return;
    }
    // grouped by folder (collapsible). Defined folders show even when empty so
    // you always have a structure to drop tasks into; "Ohne Ordner" comes last.
    const groups = {};
    all.forEach(t => { const c = t.cat || '__none'; (groups[c] = groups[c] || []).push(t); });
    const folders = getTaskFolders();
    const usedExtra = Object.keys(groups).filter(k => k !== '__none' && !folders.includes(k));
    const named = folders.concat(usedExtra);
    const order = named.concat(groups.__none ? ['__none'] : []);
    // No folders at all → plain collapsible open/done list.
    if (named.length === 0) {
      fillList(listArea, groups.__none || [], true, true);
      return;
    }
    order.forEach((k) => {
      const arr = groups[k] || [];
      const label = k === '__none' ? 'Ohne Ordner' : k;
      const doneN = arr.filter(taskDone).length;
      const det = document.createElement('details');
      det.className = 'glass'; det.style.cssText = 'padding:10px 14px;margin-bottom:8px;';
      det.open = localStorage.getItem('ui_tfold_' + k) !== '0';
      det.addEventListener('toggle', () => { try { localStorage.setItem('ui_tfold_' + k, det.open ? '1' : '0'); } catch (e) {} });
      det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">📁 ' + label +
        ' <span style="color:var(--t-3);font-weight:400;">· ' + doneN + '/' + arr.length + '</span></summary>';
      const body = div(''); body.style.marginTop = '8px';
      if (!arr.length) body.appendChild(div('', '<div style="font-size:12px;color:var(--t-4);padding:2px;">Leer — weise Tasks per 📁 zu.</div>'));
      fillList(body, arr, true, false);
      det.appendChild(body); listArea.appendChild(det);
    });
  };
  search.oninput = paint;
  paint();

  s.appendChild(div('', '<div style="font-size:11px;color:var(--t-4);text-align:center;padding-top:6px;line-height:1.6;">Täglich wiederkehrend · Haken resetten um Mitternacht · +10 XP je Task.<br/>📁 = Kategorie/Ordner zuweisen · erledigte Tasks landen im Log → Auswertung.</div>'));
}
