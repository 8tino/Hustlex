// ═══════════════════════════════════════════════════════
// ICH · Goals · Values · Habits · Achievements (4 sub-tabs)
// ═══════════════════════════════════════════════════════

// KI zerlegt ein Ziel in konkrete Teilschritte (füllt z.subs).
async function aiGoalPlan(goal, getZ, saveZ) {
  showToast('KI erstellt Plan…', '✦');
  try {
    const prompt = 'Zerlege dieses Ziel in 5-7 konkrete, überprüfbare Teilschritte in sinnvoller Reihenfolge.\n' +
      'ZIEL: ' + goal.text + (goal.why ? '\nWARUM: ' + goal.why : '') + (goal.deadline ? '\nDEADLINE: ' + goal.deadline : '') +
      '\n\nAntworte NUR als JSON-Array kurzer Strings, z.B. ["Schritt 1","Schritt 2"].';
    const txt = await callAI(prompt, 'Du zerlegst Ziele in klare, machbare Schritte. Nur ein JSON-Array.', 700);
    let j = txt.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const a = j.indexOf('['), b = j.lastIndexOf(']'); if (a >= 0 && b >= 0) j = j.slice(a, b + 1);
    const steps = JSON.parse(j);
    if (!Array.isArray(steps) || !steps.length) throw new Error('empty');
    const list = getZ(); const g = list.find(x => x.id === goal.id); if (!g) return;
    g.subs = [...(g.subs || []), ...steps.map((t, i) => ({ id: Date.now() + i, text: String(t).slice(0, 120), done: false }))];
    g.maxProgress = Math.max(g.maxProgress || 10, g.subs.length);
    saveZ(list);
    haptic('success'); showToast(steps.length + ' Schritte hinzugefügt', '✦');
  } catch (e) {
    showToast('KI nicht verfügbar – Schritte manuell hinzufügen', '⚠');
  }
}

// KI bewertet, ob das Ziel realistisch in den Alltag passt (nutzt Log-Daten).
async function aiGoalFit(goal) {
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">ALLTAG-CHECK</div>' +
    '<div class="h2" style="margin-bottom:6px;">Passt das in deinen <span class="gold">Alltag?</span></div>' +
    '<div style="font-size:13px;color:var(--t-3);margin-bottom:14px;">Basierend auf deinen letzten 7 Tagen.</div>');
  const box = div('glass', '<span class="anim-spin">⚙</span> Analysiere deinen Alltag…');
  box.style.cssText = 'padding:18px;font-size:14px;line-height:1.65;color:var(--t-2);';
  inner.appendChild(box); openOverlay();

  // Gather a 7-day activity picture from the log.
  let mins = 0, entries = 0; const cats = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    (ls('los_log_' + d.toDateString()) || []).forEach(e => {
      entries++; mins += e.dur || 0;
      const f = (e.folder || 'Sonstiges').split('/')[0]; cats[f] = (cats[f] || 0) + (e.dur || 0);
    });
  }
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + ' ' + Math.round(v / 60) + 'h').join(', ') || 'wenig erfasst';
  const goalsN = (ls('los_ziele') || []).filter(z => !z.done).length;
  const tasksN = (ls('los_tasks') || []).length;
  const plan = (typeof getPlan === 'function') ? getPlan() : { blocks: [] };
  const sleep = (typeof getSleepHours === 'function') ? getSleepHours() : null;

  try {
    const ctx = 'GEPRÜFTES ZIEL: ' + goal.text + ' (Priorität ' + (goal.prio || 'mittel') + (goal.deadline ? ', bis ' + goal.deadline : '') + ')\n' +
      'AKTIVE ZIELE INSGESAMT: ' + goalsN + '\nTÄGLICHE TASKS: ' + tasksN + '\nHEUTE GEPLANTE BLÖCKE: ' + plan.blocks.length + '\nSCHLAF: ' + (sleep || '?') + 'h\n' +
      'ZEIT LETZTE 7 TAGE: ' + entries + ' Log-Einträge, ~' + Math.round(mins / 60) + 'h erfasst. Top-Bereiche: ' + topCats;
    const prompt = 'Analysiere ehrlich, ob dieses Ziel realistisch in den Alltag des Nutzers passt.\n\n' + ctx +
      '\n\nBeantworte konkret: (1) Ist genug Zeit da? (2) Was müsste er ggf. weniger priorisieren? (3) EIN konkreter täglicher Mini-Schritt Richtung Ziel. Max 6 Sätze, direkt, Deutsch.';
    const txt = await callAI(prompt, 'Du bist ein ehrlicher, konkreter Produktivitäts-Coach.', 500);
    box.style.color = 'var(--t-1)'; box.innerHTML = escapeHtml(txt).replace(/\n/g, '<br>');
  } catch (e) {
    box.style.color = 'var(--t-1)';
    box.innerHTML = 'KI ist gerade nicht verbunden – hier eine grobe Einschätzung aus deinen Daten:<br><br>' +
      'Du hast <b>' + goalsN + ' aktive Ziele</b>' + (tasksN ? ', <b>' + tasksN + ' tägliche Tasks</b>' : '') + '. ' +
      'Erfasst hast du zuletzt ~<b>' + Math.round(mins / 60) + 'h</b> (' + topCats + ').<br><br>' +
      'Faustregel: max. 3 Ziele gleichzeitig ernsthaft verfolgen. ' +
      (goalsN > 3 ? 'Überlege, welche 1–2 du pausierst, damit „' + goal.text + '" wirklich Platz bekommt.'
                  : 'Es ist Platz für dieses Ziel – plan dir täglich einen festen Block dafür ein, dann kommst du sicher an.');
  }
}

// Bridge a goal into today: its next open step becomes a Non-Negotiable +
// a planner idea, so goals actually turn into daily action ("anfangen").
function goalToToday(goal) {
  const step = (goal.subs || []).find(s => !s.done);
  const text = (step ? step.text : goal.text) || '';
  const short = text.length > 72 ? text.slice(0, 70) + '…' : text;
  if (typeof addNN === 'function') addNN(short);
  if (typeof getPlan === 'function') { const p = getPlan(); p.brainDump.push({ id: Date.now(), text: '🎯 ' + short, duration: 60, priority: 'high' }); savePlan(p); }
  haptic('success');
  showToast('Als Non-Negotiable + Tagesplan-Idee gesetzt', '🎯');
  if (typeof updateStatusBar === 'function') updateStatusBar();
}

let ICH_TAB = 'ZIELE'; // remembered active sub-tab (fixes jump-back-to-Ziele bug)

// ─── WÜNSCHE (wants) ──────────────────────────────────
// Not goals — things you want to buy/do/experience, with a reason and an
// optional condition (e.g. "wenn 5.000€ gespart"). Store los_wants.
const WANT_TYPES = [
  { k: 'kaufen', l: '🛒 Kaufen' },
  { k: 'tool', l: '🔧 Tool/Tech' },
  { k: 'reise', l: '✈️ Reise' },
  { k: 'erleben', l: '✨ Erleben' },
  { k: 'machen', l: '✅ Machen' },
];
function wantIcon(k) { const t = WANT_TYPES.find(x => x.k === k); return t ? t.l.split(' ')[0] : '◇'; }
function wantTypeLabel(k) { const t = WANT_TYPES.find(x => x.k === k); return t ? t.l.split(' ').slice(1).join(' ') : ''; }
function getWants() { return ls('los_wants') || []; }
function saveWants(a) { ls('los_wants', a); }
function fmtEur(n) { return (typeof eur === 'function') ? eur(n) : (Math.round(n).toLocaleString('de-DE') + ' €'); }

function renderWuensche(p) {
  p.innerHTML = '';
  const addTop = h('button', { textContent: '＋  NEUER WUNSCH' });
  addTop.className = 'btn btn-gold tap';
  addTop.style.marginBottom = '4px';
  addTop.onclick = () => openAddWunsch();
  p.appendChild(addTop);
  const intro = div('', 'Dinge, die du willst — kaufen, machen oder erleben. Mit Grund und optional einer Bedingung (z.B. „wenn 5.000€ gespart"). Kein Ziel, ein Wunsch.');
  intro.style.cssText = 'font-size:12px;color:var(--t-3);line-height:1.5;';
  p.appendChild(intro);

  const wants = getWants();
  const prioRank = k => ({ hoch: 0, mittel: 1, niedrig: 2 }[k] != null ? { hoch: 0, mittel: 1, niedrig: 2 }[k] : 1);
  const open = wants.filter(w => !w.got).sort((a, b) => prioRank(a.prio) - prioRank(b.prio));
  const got = wants.filter(w => w.got);
  if (!wants.length) {
    const e = div('glass', 'Noch keine Wünsche. Tipp oben, um einen hinzuzufügen.');
    e.style.cssText = 'border-style:dashed;text-align:center;font-size:13px;color:var(--t-3);padding:16px;';
    p.appendChild(e);
  }
  const card = w => {
    const r = div('glass', '');
    r.style.cssText = 'padding:14px;' + (w.got ? 'opacity:.6;' : '');
    r.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:10px;">' +
        '<span style="font-size:22px;line-height:1;">' + wantIcon(w.type) + '</span>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:15px;font-weight:600;color:var(--t-1);' + (w.got ? 'text-decoration:line-through;' : '') + '">' + esc(w.text) + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:3px;">' +
            '<span style="font-size:11px;color:var(--t-2);">' + wantIcon(w.type) + ' ' + esc(wantTypeLabel(w.type)) + '</span>' +
            (!w.got && w.prio ? '<span style="font-size:11px;color:' + (zielPrio(w.prio).c) + ';">● ' + zielPrio(w.prio).l + '</span>' : '') +
          '</div>' +
          (w.cost ? '<div style="font-size:13px;color:var(--green);margin-top:2px;">' + fmtEur(w.cost) + '</div>' : '') +
          (w.cond ? '<div style="font-size:12px;color:var(--gold);margin-top:3px;">🎯 ' + esc(w.cond) + '</div>' : '') +
          (w.why ? '<div style="font-size:12px;color:var(--t-3);margin-top:4px;line-height:1.5;">' + esc(w.why) + '</div>' : '') +
        '</div></div>';
    const acts = div(''); acts.style.cssText = 'display:flex;gap:6px;margin-top:10px;';
    const gotBtn = h('button', { textContent: w.got ? '↩ Doch offen' : '✓ Erfüllt' });
    gotBtn.className = 'itab tap'; gotBtn.style.cssText = 'flex:1;font-size:12px;text-transform:none;letter-spacing:0;';
    gotBtn.onclick = () => { const a = getWants(); const x = a.find(y => y.id === w.id); x.got = !x.got; if (x.got) { haptic('success'); addXP(20, 'goals'); } saveWants(a); renderWuensche(p); };
    const ed = h('button', { textContent: '✎' }); ed.className = 'itab tap'; ed.style.cssText = 'width:44px;font-size:13px;';
    ed.onclick = () => openAddWunsch(w);
    const del = h('button', { textContent: '×' }); del.className = 'itab tap'; del.style.cssText = 'width:44px;font-size:15px;';
    del.onclick = () => { if (confirm('Wunsch löschen?')) { saveWants(getWants().filter(y => y.id !== w.id)); renderWuensche(p); } };
    acts.appendChild(gotBtn); acts.appendChild(ed); acts.appendChild(del);
    r.appendChild(acts);
    return r;
  };
  // Offene Wünsche in einklappbare Prioritäts-Gruppen (Hoch/Mittel/Niedrig)
  const PG = [['hoch', 'Hoch'], ['mittel', 'Mittel'], ['niedrig', 'Niedrig']];
  const pgroups = { hoch: [], mittel: [], niedrig: [] };
  open.forEach(w => { const k = pgroups[w.prio] ? w.prio : 'mittel'; pgroups[k].push(w); });
  const manyGroups = PG.filter(([k]) => pgroups[k].length).length > 1;
  PG.forEach(([k, l]) => {
    if (!pgroups[k].length) return;
    if (!manyGroups) { pgroups[k].forEach(w => p.appendChild(card(w))); return; }
    const col = zielPrio(k).c;
    const det = document.createElement('details');
    det.className = 'glass'; det.style.cssText = 'padding:10px 14px;';
    det.open = true;
    det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);"><span style="color:' + col + ';">●</span> ' + l +
      ' <span style="color:var(--t-3);font-weight:400;">· ' + pgroups[k].length + '</span></summary>';
    const body = div(''); body.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:10px;';
    pgroups[k].forEach(w => body.appendChild(card(w)));
    det.appendChild(body); p.appendChild(det);
  });
  if (got.length) {
    p.appendChild(div('label', 'ERFÜLLT · ' + got.length));
    got.forEach(w => p.appendChild(card(w)));
  }
}

function openAddWunsch(existing) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  const f = existing ? Object.assign({}, existing) : { id: Date.now(), text: '', type: 'kaufen', prio: 'mittel', cost: '', cond: '', why: '', got: false };
  if (!f.prio) f.prio = 'mittel';
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (existing ? 'WUNSCH BEARBEITEN' : 'NEUER WUNSCH') + '</div>' +
    '<div class="h2" style="margin-bottom:16px;">Was <span class="gold">willst</span> du?</div>');

  const ti = h('input', { type: 'text', value: f.text, placeholder: 'z.B. MacBook Pro' });
  ti.className = 'inp'; ti.style.cssText = 'width:100%;font-size:15px;margin-bottom:12px;';
  ti.oninput = e => f.text = e.target.value;
  inner.appendChild(ti);

  inner.appendChild(div('label', 'ART'));
  const typeRow = div(''); typeRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 12px;';
  WANT_TYPES.forEach(t => {
    const b = h('button', { textContent: t.l });
    b.className = 'itab tap' + (f.type === t.k ? ' on' : '');
    b.style.cssText = 'flex:0 0 auto;text-transform:none;letter-spacing:0;font-size:13px;padding:8px 12px;';
    b.onclick = () => { f.type = t.k; typeRow.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', WANT_TYPES[i].k === t.k)); };
    typeRow.appendChild(b);
  });
  inner.appendChild(typeRow);

  inner.appendChild(div('label', 'PRIORITÄT'));
  const prioRow = div(''); prioRow.style.cssText = 'display:flex;gap:6px;margin:4px 0 12px;';
  ZIEL_PRIOS.forEach(pr => {
    const b = h('button', { textContent: pr.l });
    b.className = 'itab tap' + (f.prio === pr.k ? ' on' : '');
    b.onclick = () => { f.prio = pr.k; prioRow.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', ZIEL_PRIOS[i].k === pr.k)); };
    prioRow.appendChild(b);
  });
  inner.appendChild(prioRow);

  inner.appendChild(div('label', 'KOSTEN (optional, €)'));
  const ci = h('input', { type: 'number', value: f.cost, placeholder: 'z.B. 2500', min: '0' });
  ci.className = 'inp'; ci.style.cssText = 'width:100%;font-size:15px;margin:4px 0 12px;';
  ci.oninput = e => f.cost = e.target.value;
  inner.appendChild(ci);

  inner.appendChild(div('label', 'BEDINGUNG (optional)'));
  const cond = h('input', { type: 'text', value: f.cond, placeholder: 'z.B. wenn 5.000€ gespart / nach dem Projekt' });
  cond.className = 'inp'; cond.style.cssText = 'width:100%;font-size:14px;margin:4px 0 12px;';
  cond.oninput = e => f.cond = e.target.value;
  inner.appendChild(cond);

  inner.appendChild(div('label', 'WARUM (optional)'));
  const why = h('textarea', { value: f.why, placeholder: 'Warum willst du das?' });
  why.className = 'inp'; why.style.cssText = 'width:100%;min-height:56px;font-size:14px;margin:4px 0 16px;resize:vertical;';
  why.oninput = e => f.why = e.target.value;
  inner.appendChild(why);

  const sv = h('button', { textContent: existing ? 'ÄNDERN' : 'SPEICHERN' });
  sv.className = 'btn btn-gold tap';
  sv.onclick = () => {
    if (!f.text.trim()) { showToast('Name fehlt', '⚠'); return; }
    f.text = f.text.trim(); f.cost = parseFloat(f.cost) || 0; f.cond = (f.cond || '').trim(); f.why = (f.why || '').trim();
    const a = getWants(); const idx = a.findIndex(x => x.id === f.id);
    if (idx >= 0) a[idx] = f; else a.push(f);
    saveWants(a);
    closeOverlay();
    if (STATE.view === 'ich') renderScreen('ich');
  };
  inner.appendChild(sv);
  openOverlay();
}

function renderIch(s) {
  s.className = 'screen on';
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">CHARAKTER</div>' +
    '<div class="h2">Wer du <span class="gold italic">bist</span></div>';

  const tabs = ['ZIELE', 'WÜNSCHE', 'WERTE', 'GEWOHNHEITEN', 'ERFOLGE'];
  if (!tabs.includes(ICH_TAB)) ICH_TAB = 'ZIELE';
  const tabRow = div('');
  tabRow.style.cssText = 'display:flex;gap:6px;margin-top:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;';
  const panels = {};
  tabs.forEach((t) => {
    const active = t === ICH_TAB;
    const tb = h('button', { textContent: t }, '');
    tb.className = 'itab tap' + (active ? ' on' : '');
    tb.style.flex = '0 0 auto';
    tb.onclick = () => {
      ICH_TAB = t; // remember → interactions inside a tab stay in that tab
      tabRow.querySelectorAll('.itab').forEach(x => x.classList.remove('on'));
      tb.classList.add('on');
      Object.values(panels).forEach(p => p.style.display = 'none');
      panels[t].style.display = 'flex';
    };
    tabRow.appendChild(tb);
    panels[t] = div('');
    panels[t].style.cssText = 'flex-direction:column;gap:10px;padding-top:4px;' + (active ? 'display:flex;' : 'display:none;');
  });
  s.appendChild(tabRow);

  // ─── ZIELE ───
  const Z = () => ls('los_ziele') || [];
  const SZ = v => { ls('los_ziele', v); renderZiele(panels['ZIELE']); };
  function renderZiele(p) {
    p.innerHTML = '';
    // Add button at the TOP — no scrolling to add a goal
    const addTop = h('button', { textContent: '＋  NEUES ZIEL' }, '');
    addTop.className = 'btn btn-gold tap';
    addTop.style.marginBottom = '4px';
    addTop.onclick = () => openAddZiel(Z, SZ);
    p.appendChild(addTop);
    // Intelligente Suche über alle Ziele (Text, Warum, Teilschritte)
    const search = h('input', { type: 'search', placeholder: '🔍 Ziel suchen…' }, '');
    if (Z().length >= 5) {
      search.className = 'inp'; search.style.cssText = 'width:100%;font-size:14px;margin:2px 0 4px;';
      p.appendChild(search);
    }
    const listWrap = div(''); listWrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;'; p.appendChild(listWrap);
    const CATS = [
      { k: 'kurzfristig', l: 'KURZFRISTIG', c: 'var(--blue)' },
      { k: 'mittelfristig', l: 'MITTELFRISTIG', c: 'var(--green)' },
      { k: 'langfristig', l: 'LANGFRISTIG', c: 'var(--gold)' },
    ];
    const paint = () => {
    listWrap.innerHTML = '';
    const q = search.value.trim().toLowerCase();
    const match = z => !q || (z.text || '').toLowerCase().includes(q) || (z.why || '').toLowerCase().includes(q) || (z.subs || []).some(sg => (sg.text || '').toLowerCase().includes(q));
    CATS.forEach(cat => {
      // erledigte Ziele ans Ende (stabil)
      const cz = Z().filter(z => z.cat === cat.k && match(z)).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));
      if (q && !cz.length) return; // leere Kategorien beim Suchen ausblenden
      const lbl = div('label', cat.l);
      lbl.style.cssText = 'font-size:10px;color:' + cat.c + ';margin-top:4px;';
      listWrap.appendChild(lbl);
      if (!cz.length) {
        const empty = div('italic', 'Noch keine Ziele');
        empty.style.cssText = 'font-size:12px;color:var(--t-3);padding:4px 0;';
        listWrap.appendChild(empty);
      }
      const catList = div('sortlist');
      cz.forEach(z => {
        const prog = z.progress || 0, maxP = z.maxProgress || 10, pct = Math.min(100, Math.round((prog / maxP) * 100));
        const r = div('glass', '');
        r.dataset.sortid = z.id;
        if (z.done) r.style.borderColor = 'rgba(92,184,117,.3)';
        const top = div('');
        top.style.cssText = 'display:flex;align-items:flex-start;gap:10px;';
        const grip = dragHandle();
        grip.style.marginTop = '-2px';
        const cb = h('button', { textContent: z.done ? '✓' : '' }, '');
        cb.style.cssText = 'width:18px;height:18px;border-radius:50%;border:1.5px solid ' + (z.done ? 'var(--green)' : cat.c) + ';background:' + (z.done ? 'rgba(92,184,117,.18)' : 'transparent') + ';flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;color:var(--green);font-size:11px;';
        cb.onclick = () => { if (!z.done) addXP(30, 'goals'); SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { done: !x.done }) : x)); };
        const info = div('', '<div class="serif" style="font-size:13px;color:' + (z.done ? 'var(--t-3)' : 'var(--t-1)') + ';text-decoration:' + (z.done ? 'line-through' : 'none') + ';line-height:1.4;">' + z.text + '</div>' +
          (z.why ? '<div class="italic" style="font-size:11px;color:var(--t-3);margin-top:3px;">"' + z.why + '"</div>' : ''));
        info.style.flex = '1';
        const del = h('button', { textContent: '×' }, '');
        del.style.cssText = 'background:none;color:var(--t-3);font-size:13px;';
        del.onclick = () => SZ(Z().filter(x => x.id !== z.id));
        top.appendChild(grip); top.appendChild(cb); top.appendChild(info); top.appendChild(del); r.appendChild(top);

        // Badges: type · priority · deadline
        if (!z.done) {
          const dl = deadlineInfo(z.deadline);
          const pr = zielPrio(z.prio || 'mittel');
          const badges = [];
          if (z.type && z.type !== 'anders') badges.push('<span style="font-size:11px;color:var(--t-2);">' + zielTypeLabel(z.type) + '</span>');
          badges.push('<span style="font-size:11px;color:' + pr.c + ';">● ' + pr.l + '</span>');
          if (dl) badges.push('<span style="font-size:11px;color:' + dl.c + ';">📅 ' + dl.txt + '</span>');
          const bl = div(''); bl.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;padding-left:28px;';
          bl.innerHTML = badges.join('');
          r.appendChild(bl);

          // Start today: push next step into Non-Negotiables + planner
          const nextStep = (z.subs || []).find(x => !x.done);
          const todayBtn = h('button', { textContent: '▶ Heute daran arbeiten' + (nextStep ? ': ' + (nextStep.text.length > 26 ? nextStep.text.slice(0, 24) + '…' : nextStep.text) : '') });
          todayBtn.className = 'btn btn-glass tap';
          todayBtn.style.cssText = 'margin:9px 0 0 28px;width:calc(100% - 28px);font-size:12px;';
          todayBtn.onclick = () => goalToToday(z);
          todayBtn.style.cssText = 'margin-top:9px;width:100%;font-size:12px;';

          // Actions fold away so the goal list stays compact.
          const more = document.createElement('details'); more.className = 'sect'; more.style.marginTop = '8px';
          more.innerHTML = '<summary class="sect-sum" style="padding:8px 2px;">Bearbeiten · KI-Plan · mehr</summary>';
          const mbody = div('sect-body'); mbody.style.paddingBottom = '4px';
          mbody.appendChild(todayBtn);

          // Actions: edit · KI plan · Alltag-Check
          const acts = div(''); acts.style.cssText = 'display:flex;gap:6px;';
          const mkAct = (label, fn) => { const b = h('button', { textContent: label }); b.className = 'itab tap'; b.style.cssText = 'flex:1;padding:8px 4px;font-size:11px;text-transform:none;letter-spacing:0;'; b.onclick = fn; return b; };
          acts.appendChild(mkAct('✎ Bearbeiten', () => openAddZiel(Z, SZ, z)));
          acts.appendChild(mkAct('✦ KI-Plan', () => aiGoalPlan(z, Z, SZ)));
          acts.appendChild(mkAct('📅 Alltag-Check', () => aiGoalFit(z)));
          mbody.appendChild(acts);
          const acts2 = div(''); acts2.style.cssText = 'display:flex;gap:6px;';
          acts2.appendChild(mkAct('⇄ Horizont', () => {
            const seq = ['kurzfristig', 'mittelfristig', 'langfristig'];
            const nxt = seq[(seq.indexOf(z.cat) + 1) % 3];
            SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { cat: nxt }) : x));
            showToast('Verschoben → ' + ({ kurzfristig: 'Kurzfristig', mittelfristig: 'Mittelfristig', langfristig: 'Langfristig' }[nxt]), '⇄');
          }));
          acts2.appendChild(mkAct('→ Zu Wünschen', () => {
            if (!confirm('„' + z.text + '" als Wunsch verschieben (aus Zielen entfernen)?')) return;
            const w = getWants(); w.push({ id: Date.now(), text: z.text, type: 'machen', prio: z.prio || 'mittel', cost: 0, cond: '', why: z.why || '', got: false }); saveWants(w);
            SZ(Z().filter(x => x.id !== z.id));
            ICH_TAB = 'WÜNSCHE'; renderScreen('ich'); showToast('Als Wunsch verschoben', '✨');
          }));
          mbody.appendChild(acts2);
          more.appendChild(mbody); r.appendChild(more);
        }

        if (!z.done) {
          const pbWrap = div('');
          pbWrap.style.marginTop = '9px';
          const pbHead = div('');
          pbHead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';
          const decBtn = h('button', { textContent: '−' }, '');
          decBtn.style.cssText = 'width:24px;height:24px;border-radius:var(--r-sm);background:var(--glass-2);border:1px solid var(--edge);color:var(--t-2);font-size:14px;font-weight:700;' + (prog <= 0 ? 'opacity:.3;pointer-events:none' : '');
          decBtn.onclick = () => SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { progress: Math.max(0, (x.progress || 0) - 1) }) : x));
          const progLabel = div('', prog + '/' + maxP);
          progLabel.style.cssText = 'font-size:11px;color:var(--t-2);font-weight:600;';
          const incBtn = h('button', { textContent: '+' }, '');
          incBtn.style.cssText = 'width:24px;height:24px;border-radius:var(--r-sm);background:' + cat.c + '22;border:1px solid ' + cat.c + '44;color:' + cat.c + ';font-size:14px;font-weight:700;';
          incBtn.onclick = () => { haptic('light'); SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { progress: Math.min(maxP, (x.progress || 0) + 1) }) : x)); addXP(5, 'goals'); };
          pbHead.appendChild(decBtn); pbHead.appendChild(progLabel); pbHead.appendChild(incBtn);
          const track = div('bar', '<div class="bar-fill" style="width:' + pct + '%;background:' + cat.c + ';"></div>');
          pbWrap.appendChild(pbHead); pbWrap.appendChild(track); r.appendChild(pbWrap);

          const subs = z.subs || [];
          if (subs.length) {
            const subWrap = div('');
            subWrap.style.cssText = 'margin-top:8px;padding-top:8px;border-top:1px solid var(--edge);';
            subs.forEach(sg => {
              const sr = div('');
              sr.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;' + (sg.done ? 'opacity:.5' : '');
              const scb = h('button', { textContent: sg.done ? '✓' : '' }, '');
              scb.style.cssText = 'width:16px;height:16px;border-radius:4px;border:1px solid ' + (sg.done ? 'var(--green)' : cat.c) + ';background:' + (sg.done ? 'rgba(92,184,117,.18)' : 'transparent') + ';color:var(--green);font-size:10px;flex-shrink:0;';
              scb.onclick = () => { if (!sg.done) haptic('light'); SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { subs: (x.subs || []).map(ss => ss.id === sg.id ? Object.assign({}, ss, { done: !ss.done }) : ss) }) : x)); };
              const st = div('', sg.text);
              st.style.cssText = 'font-size:12px;color:' + (sg.done ? 'var(--t-3)' : 'var(--t-2)') + ';flex:1;text-decoration:' + (sg.done ? 'line-through' : 'none') + ';';
              const sd = h('button', { textContent: '×' }, '');
              sd.style.cssText = 'background:none;color:var(--t-3);font-size:12px;';
              sd.onclick = () => SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { subs: (x.subs || []).filter(ss => ss.id !== sg.id) }) : x));
              sr.appendChild(scb); sr.appendChild(st); sr.appendChild(sd); subWrap.appendChild(sr);
            });
            r.appendChild(subWrap);
          }
          const siRow = div('');
          siRow.style.cssText = 'display:flex;gap:6px;margin-top:7px;';
          const sinp = h('input', { type: 'text', placeholder: 'Unter-Ziel hinzufügen…' }, '');
          sinp.className = 'inp';
          sinp.style.cssText = 'flex:1;font-size:12px;padding:7px 10px;';
          const sadd = h('button', { textContent: '+' }, '');
          sadd.style.cssText = 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:var(--r-sm);background:' + cat.c + '22;border:1px solid ' + cat.c + '44;color:' + cat.c + ';font-size:16px;font-weight:700;flex-shrink:0;';
          sadd.onclick = () => { const v = sinp.value.trim(); if (!v) return; SZ(Z().map(x => x.id === z.id ? Object.assign({}, x, { subs: [...(x.subs || []), { id: Date.now(), text: v, done: false }] }) : x)); sinp.value = ''; };
          sinp.onkeydown = e => { if (e.key === 'Enter') sadd.onclick(); };
          siRow.appendChild(sinp); siRow.appendChild(sadd); r.appendChild(siRow);
        }
        catList.appendChild(r);
      });
      if (cz.length) {
        listWrap.appendChild(catList);
        if (!q) makeSortable(catList, ids => {
          const all = Z();
          const ordered = applyOrder(all.filter(z => z.cat === cat.k), ids);
          let i = 0;
          SZ(all.map(z => z.cat === cat.k ? ordered[i++] : z));
        });
      }
    });
    if (q && !listWrap.children.length) {
      listWrap.appendChild(div('', '<div style="font-size:13px;color:var(--t-3);padding:8px 4px;">Kein Ziel gefunden.</div>'));
    }
    };
    search.oninput = paint;
    paint();
  }
  renderZiele(panels['ZIELE']);

  // ─── WÜNSCHE (wants: buy/do/experience — with reason, cost, condition) ───
  renderWuensche(panels['WÜNSCHE']);

  // ─── WERTE ───
  const W = () => ls('los_werte') || [];
  const SW = v => { ls('los_werte', v); renderWerte(panels['WERTE']); };
  function renderWerte(p) {
    p.innerHTML = '';
    const desc = div('serif italic', 'Deine Werte sind der Kompass deines Lebens. Sie definieren wer du bist.');
    desc.style.cssText = 'font-size:13px;color:var(--t-2);line-height:1.7;padding:4px 0;';
    p.appendChild(desc);
    const wList = div('sortlist');
    W().forEach(w => {
      const r = div('row', '');
      r.dataset.sortid = w.id;
      r.appendChild(dragHandle());
      r.insertAdjacentHTML('beforeend', '<span class="dot"></span><div style="flex:1;"><div class="serif gold" style="font-size:14px;letter-spacing:.5px;">' + w.text + '</div></div>');
      const del = h('button', { textContent: '×' }, '');
      del.style.cssText = 'background:none;color:var(--t-3);font-size:13px;';
      del.onclick = () => SW(W().filter(x => x.id !== w.id));
      r.appendChild(del); wList.appendChild(r);
    });
    if (W().length) { p.appendChild(wList); makeSortable(wList, ids => SW(applyOrder(W(), ids))); }
    const EW = ['Disziplin', 'Ehrlichkeit', 'Wachstum', 'Gesundheit', 'Familie', 'Freiheit', 'Exzellenz', 'Mut', 'Loyalität', 'Selbstbeherrschung'];
    const plbl = div('label', 'HINZUFÜGEN'); plbl.style.cssText = 'font-size:10px;margin-top:4px;'; p.appendChild(plbl);
    const pillrow = div('');
    pillrow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;';
    EW.filter(e => !W().find(w => w.text === e)).forEach(e => {
      const b = h('button', { textContent: '+ ' + e }, '');
      b.className = 'pill tap';
      b.style.cssText = 'cursor:pointer;font-size:11px;padding:6px 12px;';
      b.onclick = () => SW([...W(), { id: Date.now(), text: e }]);
      pillrow.appendChild(b);
    });
    p.appendChild(pillrow);
    const row2 = div('');
    row2.style.cssText = 'display:flex;gap:7px;';
    const inp = h('input', { type: 'text', placeholder: 'Eigener Wert…' }, '');
    inp.className = 'inp';
    const ab = h('button', { textContent: '+' }, '');
    ab.className = 'btn btn-glass tap';
    ab.style.cssText = 'width:48px;height:44px;padding:0;border-radius:var(--r-md);font-size:14px;flex-shrink:0;';
    ab.onclick = () => { const v = inp.value.trim(); if (v) { SW([...W(), { id: Date.now(), text: v }]); inp.value = ''; } };
    inp.onkeydown = e => { if (e.key === 'Enter') ab.onclick(); };
    row2.appendChild(inp); row2.appendChild(ab); p.appendChild(row2);
  }
  renderWerte(panels['WERTE']);

  // ─── GEWOHNHEITEN ───
  const G = () => ls('los_gew') || [];
  const SG = v => { ls('los_gew', v); renderGew(panels['GEWOHNHEITEN']); };
  function renderGew(p) {
    p.innerHTML = '';
    const doing = G().filter(g => g.status === 'doing'), want = G().filter(g => g.status === 'want');
    if (doing.length) {
      const lbl = div('label', '✓ ICH TUE BEREITS'); lbl.style.cssText = 'font-size:10px;color:var(--green);'; p.appendChild(lbl);
      doing.forEach(g => {
        const r = div('row glass-success', '<span class="dot" style="background:var(--green);box-shadow:0 0 8px var(--green-glow);"></span><div style="flex:1;font-size:13px;">' + g.text + '</div>');
        const del = h('button', { textContent: '×' }, '');
        del.style.cssText = 'background:none;color:var(--t-3);font-size:13px;';
        del.onclick = () => SG(G().filter(x => x.id !== g.id));
        r.appendChild(del); p.appendChild(r);
      });
    }
    if (want.length) {
      const lbl2 = div('label gold', '◇ ICH WILL WERDEN'); lbl2.style.cssText = 'font-size:10px;margin-top:6px;'; p.appendChild(lbl2);
      want.forEach(g => {
        const r = div('row', '<span class="dot" style="background:var(--gold-soft);"></span><div style="flex:1;font-size:13px;">' + g.text + '</div>');
        const mb = h('button', { textContent: '✓ TUE ES' }, '');
        mb.style.cssText = 'padding:4px 9px;background:rgba(92,184,117,.12);border:1px solid rgba(92,184,117,.25);border-radius:var(--r-sm);color:var(--green);font-size:11px;';
        mb.onclick = () => SG(G().map(x => x.id === g.id ? Object.assign({}, x, { status: 'doing' }) : x));
        const del = h('button', { textContent: '×' }, '');
        del.style.cssText = 'background:none;color:var(--t-3);font-size:13px;';
        del.onclick = () => SG(G().filter(x => x.id !== g.id));
        r.appendChild(mb); r.appendChild(del); p.appendChild(r);
      });
    }
    const EG = ['Täglich meditieren', 'Kein Social Media morgens', '8h Schlafen', 'Täglich lesen', 'Kalt duschen', 'Journaling abends', 'Täglich trainieren'];
    const plbl = div('label', 'HINZUFÜGEN'); plbl.style.cssText = 'font-size:10px;margin-top:4px;'; p.appendChild(plbl);
    const pillrow = div('');
    pillrow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;';
    EG.filter(e => !G().find(g => g.text === e)).forEach(e => {
      const b = h('button', { textContent: '+ ' + e }, '');
      b.className = 'pill tap';
      b.style.cssText = 'cursor:pointer;font-size:11px;padding:6px 12px;';
      b.onclick = () => SG([...G(), { id: Date.now(), text: e, status: 'want' }]);
      pillrow.appendChild(b);
    });
    p.appendChild(pillrow);
    const row2 = div('');
    row2.style.cssText = 'display:flex;gap:7px;';
    const inp = h('input', { type: 'text', placeholder: 'Eigene Gewohnheit…' }, '');
    inp.className = 'inp';
    const ab = h('button', { textContent: '+' }, '');
    ab.className = 'btn btn-glass tap';
    ab.style.cssText = 'width:48px;height:44px;padding:0;border-radius:var(--r-md);font-size:14px;flex-shrink:0;';
    ab.onclick = () => { const v = inp.value.trim(); if (v) { SG([...G(), { id: Date.now(), text: v, status: 'want' }]); inp.value = ''; } };
    inp.onkeydown = e => { if (e.key === 'Enter') ab.onclick(); };
    row2.appendChild(inp); row2.appendChild(ab); p.appendChild(row2);
  }
  renderGew(panels['GEWOHNHEITEN']);

  // ─── ERFOLGE ───
  (function buildErfolge(p) {
    const unlocked = getUnlocked();
    const catXP = ls('los_catxp') || { body: { xp: 0, lv: 1 }, mind: { xp: 0, lv: 1 }, discipline: { xp: 0, lv: 1 }, goals: { xp: 0, lv: 1 } };

    const clbl = div('label', 'KATEGORIE-LEVEL'); clbl.style.fontSize = '7px'; p.appendChild(clbl);
    const cgrid = div('');
    cgrid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:12px;';
    [
      { k: 'body', l: 'Körper', c: 'var(--gold)' },
      { k: 'mind', l: 'Geist', c: 'var(--purple)' },
      { k: 'discipline', l: 'Disziplin', c: 'var(--blue)' },
      { k: 'goals', l: 'Ziele', c: 'var(--green)' },
    ].forEach(cat => {
      const d = catXP[cat.k] || { lv: 1, xp: 0 };
      const needed = d.lv * 100 + Math.floor(d.lv / 5) * 50;
      const pct = Math.round(Math.min(100, (d.xp / needed) * 100));
      const b = div('glass', '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
        '<div style="font-size:13px;font-weight:600;color:var(--t-1);">' + cat.l + '</div>' +
        '<div style="font-size:14px;font-weight:700;color:' + cat.c + ';">Lv ' + d.lv + '</div></div>');
      b.appendChild(div('bar', '<div class="bar-fill" style="width:' + pct + '%;background:' + cat.c + ';"></div>'));
      b.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-3);margin-top:4px;">' + d.xp + ' / ' + needed + ' XP</div>');
      cgrid.appendChild(b);
    });
    p.appendChild(cgrid);

    const albl = div('label', 'ACHIEVEMENTS · ' + unlocked.length + '/' + ACH.length + ' FREIGESCHALTET');
    albl.style.fontSize = '7px';
    p.appendChild(albl);
    const apct = Math.round((unlocked.length / ACH.length) * 100);
    p.appendChild(div('bar', '<div class="bar-fill" style="width:' + apct + '%;"></div>'));

    const agrid = div('');
    agrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;';
    ACH.forEach(a => {
      const done = unlocked.includes(a.id);
      const card = div(done ? 'glass-accent' : 'glass', '');
      if (!done) card.style.opacity = '.5';
      card.innerHTML = '<div style="font-size:24px;margin-bottom:7px;">' + (ACH_IC[a.id] || '★') + '</div>' +
        '<div style="font-size:13px;font-weight:700;color:' + (done ? 'var(--gold)' : 'var(--t-2)') + ';margin-bottom:3px;">' + a.name + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);line-height:1.5;">' + a.desc + '</div>' +
        '<div style="font-size:11px;color:' + (done ? 'var(--green)' : 'var(--t-3)') + ';margin-top:6px;font-weight:600;">' + (done ? '✓ ERREICHT' : '🔒 Gesperrt') + '</div>';
      agrid.appendChild(card);
    });
    p.appendChild(agrid);
  })(panels['ERFOLGE']);

  Object.values(panels).forEach(p => s.appendChild(p));
}

const ZIEL_TYPES = [
  { k: 'materiell',  l: '💰 Materiell' },
  { k: 'faehigkeit', l: '🧠 Fähigkeit' },
  { k: 'gewohnheit', l: '🔁 Gewohnheit' },
  { k: 'erlebnis',   l: '✨ Erlebnis' },
  { k: 'anders',     l: '◇ Anderes' },
];
const ZIEL_PRIOS = [
  { k: 'hoch',    l: 'Hoch',    c: '#FF453A' },
  { k: 'mittel',  l: 'Mittel',  c: '#FF9F0A' },
  { k: 'niedrig', l: 'Niedrig', c: '#8E8E93' },
];
function zielTypeLabel(k) { const t = ZIEL_TYPES.find(x => x.k === k); return t ? t.l : ''; }
function zielPrio(k) { return ZIEL_PRIOS.find(x => x.k === k) || ZIEL_PRIOS[1]; }
function zielPrioRank(k) { return { hoch: 0, mittel: 1, niedrig: 2 }[k] != null ? { hoch: 0, mittel: 1, niedrig: 2 }[k] : 1; }
function deadlineInfo(iso) {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).setHours(23, 59, 59) - Date.now()) / 86400000);
  const txt = days < 0 ? Math.abs(days) + 'd überfällig' : days === 0 ? 'heute fällig' : days === 1 ? 'morgen fällig' : 'noch ' + days + ' Tage';
  const c = days < 0 ? '#FF453A' : days <= 7 ? '#FF9F0A' : 'var(--t-3)';
  return { days, txt, c };
}

function openAddZiel(getZ, saveZ, existing) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  let f = existing
    ? Object.assign({}, existing)
    : { id: Date.now(), text: '', why: '', cat: 'langfristig', type: 'anders', prio: 'mittel', deadline: '', maxProgress: 10, progress: 0, done: false, subs: [] };
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (existing ? 'ZIEL BEARBEITEN' : 'NEUES ZIEL') + '</div>' +
    '<div class="h1" style="margin-bottom:18px;">Was willst du <span class="gold italic">erreichen?</span></div>');
  const ti = h('input', { type: 'text', value: f.text, placeholder: 'Dein Ziel…' }, '');
  ti.className = 'inp inp-serif';
  ti.style.cssText = 'font-size:14px;margin-bottom:8px;';
  ti.oninput = e => f.text = e.target.value;
  inner.appendChild(ti);
  const wi = h('input', { type: 'text', value: f.why, placeholder: 'Warum ist das wichtig? (optional)' }, '');
  wi.className = 'inp';
  wi.style.marginBottom = '14px';
  wi.oninput = e => f.why = e.target.value;
  inner.appendChild(wi);

  // Art des Ziels
  inner.appendChild(div('label', 'ART'));
  const typeRow = div(''); typeRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 14px;';
  ZIEL_TYPES.forEach(t => {
    const b = h('button', { textContent: t.l });
    b.className = 'itab tap' + (f.type === t.k ? ' on' : '');
    b.style.cssText = 'flex:0 0 auto;padding:8px 12px;text-transform:none;letter-spacing:0;font-size:13px;';
    b.onclick = () => { f.type = t.k; typeRow.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', ZIEL_TYPES[i].k === t.k)); };
    typeRow.appendChild(b);
  });
  inner.appendChild(typeRow);

  // Priorität
  inner.appendChild(div('label', 'PRIORITÄT'));
  const prioRow = div(''); prioRow.style.cssText = 'display:flex;gap:6px;margin:4px 0 14px;';
  ZIEL_PRIOS.forEach(pr => {
    const b = h('button', { textContent: pr.l });
    b.className = 'itab tap' + (f.prio === pr.k ? ' on' : '');
    b.onclick = () => { f.prio = pr.k; prioRow.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', ZIEL_PRIOS[i].k === pr.k)); };
    prioRow.appendChild(b);
  });
  inner.appendChild(prioRow);

  // Zeitlimit
  inner.appendChild(div('label', 'ZEITLIMIT (optional)'));
  const dl = h('input', { type: 'date', value: f.deadline || '' });
  dl.className = 'inp'; dl.style.cssText = 'width:100%;margin:4px 0 14px;font-size:15px;';
  dl.oninput = e => f.deadline = e.target.value;
  inner.appendChild(dl);

  // Schritte + Kategorie
  const mpRow = div('', '<div style="font-size:12px;color:var(--t-2);flex:1;">Schritte bis zum Ziel:</div>');
  mpRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
  const mpInp = h('input', { type: 'number', value: String(f.maxProgress || 10), min: '1', max: '100' }, '');
  mpInp.className = 'inp serif';
  mpInp.style.cssText = 'width:70px;flex:none;text-align:center;font-size:15px;font-weight:700;padding:9px;';
  mpInp.oninput = e => f.maxProgress = parseInt(e.target.value) || 10;
  mpRow.appendChild(mpInp); inner.appendChild(mpRow);

  inner.appendChild(div('label', 'ZEITHORIZONT'));
  const catrow = div('');
  catrow.style.cssText = 'display:flex;gap:6px;margin:4px 0 20px;';
  const CATS = [{ k: 'kurzfristig', l: 'Kurz' }, { k: 'mittelfristig', l: 'Mittel' }, { k: 'langfristig', l: 'Lang' }];
  CATS.forEach(c => {
    const b = h('button', { textContent: c.l }, '');
    b.className = 'itab tap' + (f.cat === c.k ? ' on' : '');
    b.onclick = () => { f.cat = c.k; catrow.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', CATS[i].k === c.k)); };
    catrow.appendChild(b);
  });
  inner.appendChild(catrow);

  const sv = h('button', { textContent: existing ? 'ÄNDERN' : 'SPEICHERN' }, '');
  sv.className = 'btn btn-gold tap';
  sv.onclick = () => {
    if (!f.text.trim()) return;
    f.text = f.text.trim(); f.why = (f.why || '').trim();
    const list = getZ();
    const idx = list.findIndex(x => x.id === f.id);
    if (idx >= 0) { list[idx] = Object.assign(list[idx], f); saveZ(list); }
    else { saveZ([...list, Object.assign({ progress: 0, done: false, subs: [] }, f)]); addXP(10, 'goals'); }
    closeOverlay();
  };
  inner.appendChild(sv); openOverlay();
}
