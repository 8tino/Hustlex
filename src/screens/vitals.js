// ═══════════════════════════════════════════════════════
// VITALS · Macros, water, meals, sleep, supplements, recovery
// ═══════════════════════════════════════════════════════

function renderVitals(s) {
  const t = getTotals();
  s.className = 'screen on';

  s.innerHTML = '<div class="label" style="margin-bottom:4px;">VITALS</div>' +
    '<div class="h2">Körper <span class="gold italic">optimieren</span></div>';

  const cfg = getCfg();
  const sh = getSleepHours();

  // ── Tagesziele als Ringe ──
  const goalCard = div('glass-hi', '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
    '<div class="label">TAGESZIELE</div><button id="vt_goals2" class="tap" style="background:none;color:var(--gold);font-size:13px;">⚙ Ziele</button></div>');
  goalCard.querySelector('#vt_goals2').onclick = () => editGoals(s);
  const gr = div('');
  gr.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;';
  const ringData = [
    { pct: t.p / cfg.proteinGoal * 100, c: '#30D158', v: t.p + 'g', l: 'Protein' },
    { pct: STATE.day.water / cfg.waterGoal * 100, c: '#0A84FF', v: (STATE.day.water / 1000).toFixed(1) + 'L', l: 'Wasser' },
    { pct: t.kcal / cfg.kcalGoal * 100, c: '#FF9F0A', v: t.kcal, l: 'kcal' },
    { pct: STATE.day.sleep ? parseFloat(sh) / cfg.sleepGoal * 100 : 0, c: '#BF5AF2', v: sh ? sh + 'h' : '–', l: 'Schlaf (' + cfg.sleepGoal + 'h)' },
  ];
  ringData.forEach(rd => {
    const cell = div('');
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
    cell.appendChild(progressRing(rd.pct, rd.c, 62, 7, '<div style="font-size:13px;font-weight:700;color:#fff;">' + rd.v + '</div>'));
    cell.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;">' + rd.l + '</div>');
    gr.appendChild(cell);
  });
  goalCard.appendChild(gr);
  s.appendChild(goalCard);

  // Macros
  const mac = div('glass', '');
  mac.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
    '<div class="label">MAKROS</div>' +
    '<button id="vt_goals" class="tap" style="background:none;color:var(--gold);font-size:13px;">⚙ Ziele</button></div>';
  mac.querySelector('#vt_goals').onclick = () => editGoals(s);
  const mg = div('');
  mg.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;';
  [
    { l: 'KCAL', v: t.kcal, c: 'var(--gold)' },
    { l: 'PROTEIN', v: t.p + 'g', c: 'var(--green)' },
    { l: 'CARBS', v: t.c + 'g', c: 'var(--blue)' },
    { l: 'FETT', v: t.f + 'g', c: 'var(--purple)' },
  ].forEach(st => {
    mg.appendChild(div('', '<div style="text-align:center;font-size:18px;font-weight:700;color:' + st.c + ';">' + st.v +
      '</div><div class="label" style="text-align:center;font-size:10px;margin-top:2px;">' + st.l + '</div>'));
  });
  mac.appendChild(mg);
  mac.appendChild(macroBar('Protein', t.p, cfg.proteinGoal, 'g', 'var(--green)'));
  const kb = macroBar('Kalorien', t.kcal, cfg.kcalGoal, '', 'var(--gold)'); kb.style.marginTop = '10px'; mac.appendChild(kb);
  s.appendChild(mac);

  // Water
  const wGoal = cfg.waterGoal;
  const wc = div('glass', '');
  const wv = div('', (STATE.day.water / 1000).toFixed(1) + 'L / ' + (wGoal / 1000).toFixed(1) + 'L');
  wv.style.cssText = 'font-size:13px;color:var(--blue);font-weight:600;';
  const wh = div('');
  wh.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
  wh.appendChild(div('label', 'WASSER')); wh.appendChild(wv); wc.appendChild(wh);
  const wfill = div('bar-fill', '');
  wfill.style.cssText = 'width:' + Math.min(100, (STATE.day.water / wGoal) * 100) + '%;background:var(--blue);';
  const wtrack = div('bar', ''); wtrack.appendChild(wfill); wc.appendChild(wtrack);
  const addWater = ml => { STATE.day.water = Math.max(0, Math.min(STATE.day.water + ml, 8000)); saveDay(); wfill.style.width = Math.min(100, (STATE.day.water / wGoal) * 100) + '%'; wv.textContent = (STATE.day.water / 1000).toFixed(1) + 'L / ' + (wGoal / 1000).toFixed(1) + 'L'; updateStatusBar(); };
  const wbtns = div('');
  wbtns.style.cssText = 'display:flex;gap:6px;margin-top:10px;';
  // minus (undo) button first
  const minus = h('button', { textContent: '−250' }, '');
  minus.className = 'tap';
  minus.style.cssText = 'width:52px;flex:none;padding:10px 2px;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.25);border-radius:var(--r-sm);color:#FF453A;font-size:12px;font-weight:600;';
  minus.onclick = () => addWater(-250);
  wbtns.appendChild(minus);
  [150, 250, 500, 750].forEach(ml => {
    const b = h('button', { textContent: '+' + ml }, '');
    b.className = 'tap';
    b.style.cssText = 'flex:1;padding:10px 2px;background:rgba(10,132,255,.12);border:1px solid rgba(10,132,255,.25);border-radius:var(--r-sm);color:var(--blue);font-size:12px;font-weight:600;';
    b.onclick = () => addWater(ml);
    wbtns.appendChild(b);
  });
  const custom = h('button', { textContent: '✎' }, '');
  custom.className = 'tap';
  custom.style.cssText = 'width:40px;flex:none;padding:10px 2px;background:var(--glass-2);border:1px solid var(--edge);border-radius:var(--r-sm);color:var(--t-2);font-size:13px;';
  custom.title = 'Genaue Menge (negativ = abziehen)';
  custom.onclick = () => { const v = parseInt(prompt(LANG === 'en' ? 'Amount in ml (negative to subtract):' : 'Menge in ml (negativ zum Abziehen):') || ''); if (v) addWater(v); };
  wbtns.appendChild(custom);
  wc.appendChild(wbtns); s.appendChild(wc);

  // Meals — searchable + grouped into collapsible categories, tap opens a
  // quantity picker so you can log any amount (½, 1, 2 Portionen, frei).
  const mealSec = section('Mahlzeiten', 'v_meals', false); const mb = mealSec._body;
  mb.appendChild(renderMealAdd(s));

  const search = h('input', { type: 'search', placeholder: '🔍 Lebensmittel suchen…' });
  search.className = 'inp'; search.style.cssText = 'width:100%;font-size:14px;';
  mb.appendChild(search);
  const foodWrap = div(''); mb.appendChild(foodWrap);

  const foodRow = f => {
    const row = div('row tap', '<span style="font-size:18px;">' + (f.ic || '🍽') + '</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);">' + f.n + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + f.kcal + ' kcal · ' + f.p + 'g P · ' + f.c + 'g C · ' + f.f + 'g F</div></div>' +
      '<span class="gold" style="font-size:18px;">+</span>');
    row.onclick = () => openFoodQty(f, s);
    // ✎ = Werte (Makros) bearbeiten — für eigene UND vorgegebene Lebensmittel
    const edit = h('button', { textContent: '✎' }, '');
    edit.style.cssText = 'background:none;color:var(--t-4);font-size:13px;padding-left:6px;';
    edit.onclick = (e) => { e.stopPropagation(); openFoodEdit(f, s); };
    row.appendChild(edit);
    if (f.custom) {
      const del = h('button', { textContent: '×' }, '');
      del.style.cssText = 'background:none;color:var(--t-4);font-size:14px;padding-left:4px;';
      del.onclick = (e) => { e.stopPropagation(); delCustomFood(f.id); renderVitals(s); };
      row.appendChild(del);
    }
    return row;
  };
  const paintFoods = () => {
    foodWrap.innerHTML = '';
    const q = search.value.trim().toLowerCase();
    const all = getFoods();
    if (q) { // flat filtered list while searching
      const hits = all.filter(f => f.n.toLowerCase().includes(q));
      if (!hits.length) { foodWrap.appendChild(div('', '<div style="font-size:13px;color:var(--t-3);padding:8px 4px;">Nichts gefunden.</div>')); return; }
      hits.forEach(f => foodWrap.appendChild(foodRow(f)));
      return;
    }
    // grouped collapsible view
    const order = ['Eigene', 'Protein', 'Carbs', 'Gemüse & Obst', 'Fette & Nüsse'];
    const groups = {};
    all.forEach(f => { const c = f.custom ? 'Eigene' : (f.cat || 'Sonstiges'); (groups[c] = groups[c] || []).push(f); });
    const keys = order.filter(k => groups[k]).concat(Object.keys(groups).filter(k => !order.includes(k)));
    keys.forEach((k, i) => {
      const det = document.createElement('details');
      det.className = 'glass'; det.style.cssText = 'padding:10px 14px;margin-bottom:8px;';
      if (i === 0) det.open = true; // first group open by default
      det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">' + k + ' <span style="color:var(--t-3);font-weight:400;">· ' + groups[k].length + '</span></summary>';
      const body = div(''); body.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:6px;';
      groups[k].forEach(f => body.appendChild(foodRow(f)));
      det.appendChild(body); foodWrap.appendChild(det);
    });
  };
  search.oninput = paintFoods;
  paintFoods();

  const mlog = div(''); mlog.id = 'meal_log'; mb.appendChild(mlog);
  function refreshMealLog() {
    mlog.innerHTML = '';
    if (!STATE.day.meals.length) return;
    const mc = div('glass', '<div class="label" style="font-size:10px;margin-bottom:8px;">HEUTE GEGESSEN</div>');
    STATE.day.meals.forEach((m, i) => {
      const r = div('', '<span style="font-size:14px;">' + m.ic + '</span>' +
        '<div style="flex:1;"><div style="font-size:12px;">' + m.n + '</div><div style="font-size:11px;color:var(--t-3);">' + m.p + 'g P · ' + m.kcal + ' kcal</div></div>');
      r.style.cssText = 'display:flex;align-items:center;gap:9px;padding:6px 0;' + (i > 0 ? 'border-top:1px solid var(--edge)' : '');
      const del = h('button', { textContent: '×' }, '');
      del.style.cssText = 'background:none;color:var(--t-3);font-size:14px;';
      del.onclick = () => { STATE.day.meals = STATE.day.meals.filter(x => x.id !== m.id); saveDay(); refreshMealLog(); updateStatusBar(); };
      r.appendChild(del); mc.appendChild(r);
    });
    mlog.appendChild(mc);
  }
  refreshMealLog();
  if (moduleOn('v_meals')) s.appendChild(mealSec);

  // Ernährungsplan — feste Mahlzeiten pro Slot, per Tap als gegessen loggen
  if (moduleOn('v_plan')) {
    const planSec = section('Ernährungsplan', 'v_plan', false);
    planSec._body.appendChild(renderMealPlan(s));
    s.appendChild(planSec);
  }

  // Sleep
  if (moduleOn('v_sleep')) {
    const sleepSec = section('Schlaf', 'v_sleep', false);
    const slc = div(''); slc.id = 'sleep_container'; sleepSec._body.appendChild(slc); renderSleepWidget(slc);
    s.appendChild(sleepSec);
  }

  // Supplements — nach Tageszeit gruppiert (einklappbar), erledigte nach unten
  const suppSec = section('Supplements', 'v_supps', false); const spb = suppSec._body;
  spb.appendChild(renderSuppAdd(s));
  const nm = new Date().getHours() * 60 + new Date().getMinutes();
  const suppRow = sup => {
    const done = !!STATE.day.supps[sup.id];
    const parts = (sup.t || '12:00').split(':').map(Number);
    const isNow = Math.abs(parts[0] * 60 + parts[1] - nm) < 45;
    const row = div('row' + (done ? ' glass-success' : isNow ? ' glass-accent' : ''), '');
    row.innerHTML = '<span style="font-size:18px;">' + (sup.ic || '💊') + '</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:' + (done ? 'var(--green)' : 'var(--t-1)') + ';">' + sup.n + ' <span style="font-size:11px;color:var(--t-3);">' + (sup.d || '') + '</span></div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + (sup.t || '') + (isNow && !done ? '<span class="gold" style="font-weight:600;margin-left:6px;">← JETZT</span>' : '') + '</div></div>';
    const b = checkCircle(done);                       // uniform check control
    if (done) b.title = (LANG === 'en' ? 'Uncheck' : 'Abwählen');
    b.onclick = () => { if (STATE.day.supps[sup.id]) delete STATE.day.supps[sup.id]; else STATE.day.supps[sup.id] = true; saveDay(); updateStatusBar(); renderVitals(s); };
    row.appendChild(b);
    // Edit (time-of-day, intelligent, remove) — for EVERY supplement.
    const edit = h('button', { textContent: '✎' }, '');
    edit.className = 'tap'; edit.title = 'Bearbeiten';
    edit.style.cssText = 'width:34px;height:34px;flex:none;background:none;color:var(--t-3);font-size:14px;';
    edit.onclick = (e) => { e.stopPropagation(); openSuppEdit(sup, s); };
    row.appendChild(edit);
    return row;
  };
  const supps = getSupps();
  const suppBucket = sup => { const hh = parseInt((sup.t || '12:00').split(':')[0]) || 12; return hh < 11 ? 0 : hh < 16 ? 1 : 2; };
  const SUPP_BK = ['🌅 Morgen', '☀️ Mittag', '🌙 Abend'];
  const suppGroups = [[], [], []];
  supps.forEach(sup => suppGroups[suppBucket(sup)].push(sup));
  suppGroups.forEach((arr, i) => {
    if (!arr.length) return;
    arr.sort((a, b) => (STATE.day.supps[a.id] ? 1 : 0) - (STATE.day.supps[b.id] ? 1 : 0)); // erledigte unten
    const takenN = arr.filter(x => STATE.day.supps[x.id]).length;
    const det = document.createElement('details');
    det.className = 'glass'; det.style.cssText = 'padding:10px 14px;margin-bottom:8px;';
    det.open = true;
    det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">' + SUPP_BK[i] +
      ' <span style="color:var(--t-3);font-weight:400;">· ' + takenN + '/' + arr.length + '</span></summary>';
    const w = div(''); w.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:8px;';
    arr.forEach(sup => w.appendChild(suppRow(sup)));
    det.appendChild(w); spb.appendChild(det);
  });
  if (moduleOn('v_supps')) s.appendChild(suppSec);

  // Recovery — erledigte rutschen nach unten
  const recSec = section('Recovery', 'v_recovery', false); const rcb = recSec._body;
  RECOVERY.slice().sort((a, b) => (STATE.day.recovery.includes(a.id) ? 1 : 0) - (STATE.day.recovery.includes(b.id) ? 1 : 0)).forEach(m => {
    const done = STATE.day.recovery.includes(m.id);
    const row = div('row tap' + (done ? ' glass-success' : ''), '');
    row.innerHTML = '<span style="font-size:20px;">' + m.ic + '</span>' +
      '<div style="flex:1;"><div style="font-size:13px;color:' + (done ? 'var(--green)' : 'var(--t-1)') + ';">' + m.n + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + m.t + '</div></div>';
    row.appendChild(checkCircle(done));                 // uniform check control
    row.onclick = () => {
      if (STATE.day.recovery.includes(m.id)) STATE.day.recovery = STATE.day.recovery.filter(x => x !== m.id);
      else STATE.day.recovery.push(m.id);
      saveDay(); updateStatusBar(); renderVitals(s);
    };
    rcb.appendChild(row);
  });
  if (moduleOn('v_recovery')) s.appendChild(recSec);

  // AI nutrition tip
  const ctx2 = 'Gegessen: ' + (STATE.day.meals.map(m => m.n).join(', ') || 'nichts') + '. Protein: ' + t.p + 'g/' + cfg.proteinGoal + 'g. Wasser: ' + (STATE.day.water / 1000).toFixed(1) + 'L. Was als nächstes essen? 3 Vorschläge. Kein Intro. Deutsch.';
  s.appendChild(aiBlock('ERNÄHRUNG OPTIMIEREN', ctx2, 'var(--green)'));
}

function renderSleepWidget(container) {
  container.innerHTML = '';
  const sh = getSleepHours();
  if (STATE.day.sleep) {
    const q = STATE.day.sleep.quality;
    const c = div('glass', '');
    c.innerHTML = '<div style="display:flex;gap:14px;align-items:center;">' +
      '<div style="text-align:center;min-width:62px;"><div style="font-size:30px;font-weight:700;letter-spacing:-1px;line-height:1;color:' + (parseFloat(sh) >= 7 ? 'var(--purple)' : 'var(--gold)') + ';">' + sh + '</div><div class="label" style="margin-top:2px;">Std</div></div>' +
      '<div style="flex:1;"><div style="font-size:14px;color:var(--t-2);">🌙 ' + STATE.day.sleep.bed + '   ☀️ ' + STATE.day.sleep.wake + '</div>' +
      '<div style="margin-top:6px;font-size:16px;letter-spacing:3px;">' + [1, 2, 3, 4, 5].map(v => '<span style="color:' + (v <= q ? 'var(--gold)' : 'var(--t-4)') + ';">' + (v <= q ? '★' : '☆') + '</span>').join('') + '</div></div>' +
      '<button class="btn-glass tap" style="padding:9px 14px;border-radius:12px;font-size:13px;" onclick="renderSleepForm(document.getElementById(\'sleep_container\'))">Ändern</button></div>';
    container.appendChild(c);
  } else {
    renderSleepForm(container);
  }
}

function renderSleepForm(container) {
  container.innerHTML = '';
  let f = { bed: '22:30', wake: '06:30', quality: 4 };
  const c = div('glass-hi', '<div class="label" style="margin-bottom:12px;">Schlaf eintragen</div>');

  const row2 = div('');
  row2.style.cssText = 'display:flex;gap:10px;margin-bottom:14px;';
  [['bed', 'Eingeschlafen'], ['wake', 'Aufgewacht']].forEach(([k, l]) => {
    const cell = div('', '<div class="label" style="margin-bottom:6px;">' + l + '</div>');
    cell.style.flex = '1';
    const inp = h('input', { type: 'time', value: f[k] }, '');
    inp.className = 'inp';
    inp.style.fontSize = '17px';
    inp.oninput = e => f[k] = e.target.value;
    cell.appendChild(inp); row2.appendChild(cell);
  });
  c.appendChild(row2);

  c.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:8px;">Qualität</div>');
  const qrow = div('');
  qrow.style.cssText = 'display:flex;gap:6px;margin-bottom:16px;';
  const stars = [];
  const paint = () => stars.forEach((b, i) => {
    b.textContent = i < f.quality ? '★' : '☆';
    b.style.color = i < f.quality ? 'var(--gold)' : 'var(--t-4)';
  });
  [1, 2, 3, 4, 5].forEach(v => {
    const b = h('button', {}, '');
    b.className = 'tap';
    b.style.cssText = 'flex:1;font-size:30px;line-height:1;background:none;padding:2px 0;';
    b.onclick = () => { f.quality = v; paint(); haptic('light'); };
    stars.push(b); qrow.appendChild(b);
  });
  paint();
  c.appendChild(qrow);

  const sv = h('button', { textContent: 'Speichern' }, '');
  sv.className = 'btn btn-gold tap';
  sv.onclick = () => { STATE.day.sleep = f; saveDay(); renderSleepWidget(container); updateStatusBar(); };
  c.appendChild(sv); container.appendChild(c);
}

// ─── CUSTOM FOOD / SUPPLEMENT LIBRARIES ───────────────
// Built-in FOODS can be tweaked via los_food_overrides (by id); custom foods
// live in los_foods and are edited in place.
function getFoodOverrides() { return ls('los_food_overrides') || {}; }
function getFoods() {
  const ov = getFoodOverrides();
  const builtin = FOODS.map(f => ov[f.id] ? Object.assign({}, f, ov[f.id]) : f);
  return (ls('los_foods') || []).concat(builtin);
}
function saveFoodOverride(id, patch) { const o = getFoodOverrides(); o[id] = Object.assign({}, o[id], patch); ls('los_food_overrides', o); }
function resetFoodOverride(id) { const o = getFoodOverrides(); delete o[id]; ls('los_food_overrides', o); }
function updateCustomFood(f) { const a = ls('los_foods') || []; const i = a.findIndex(x => x.id === f.id); if (i >= 0) { a[i] = f; ls('los_foods', a); } }
function addCustomFood(f) { const a = ls('los_foods') || []; a.unshift(f); ls('los_foods', a); }
function delCustomFood(id) { ls('los_foods', (ls('los_foods') || []).filter(x => x.id !== id)); }

// Edit the macro values of any food (built-in → stored as an override).
function openFoodEdit(f, s) {
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">WERTE BEARBEITEN</div>' +
    '<div class="h2" style="margin-bottom:4px;">' + (f.ic || '🍽') + ' ' + f.n + '</div>' +
    '<div style="font-size:12px;color:var(--t-3);margin-bottom:14px;">Passe Name, Icon und Makros an. Gilt pro Portion.</div>');
  const mkField = (label, val, key, wide) => {
    const wrap = div(''); wrap.style.cssText = wide ? 'margin-bottom:10px;' : '';
    wrap.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:4px;">' + label + '</div>');
    const inp = h('input', { type: wide ? 'text' : 'number', value: String(val != null ? val : ''), inputmode: wide ? 'text' : 'decimal' });
    inp.className = 'inp'; inp.style.cssText = 'width:100%;font-size:15px;'; inp.dataset.key = key;
    wrap.appendChild(inp); return wrap;
  };
  inner.appendChild(mkField('NAME', f.n, 'n', true));
  const iconRow = div(''); iconRow.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;';
  const icoW = mkField('ICON', f.ic || '🍽', 'ic', true); icoW.style.cssText = 'flex:0 0 90px;'; iconRow.appendChild(icoW);
  const kcalW = mkField('KCAL', f.kcal, 'kcal'); kcalW.style.cssText = 'flex:1;'; iconRow.appendChild(kcalW);
  inner.appendChild(iconRow);
  const macRow = div(''); macRow.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
  [['PROTEIN g', f.p, 'p'], ['CARBS g', f.c, 'c'], ['FETT g', f.f, 'f']].forEach(([l, v, k]) => { const w = mkField(l, v, k); w.style.cssText = 'flex:1;'; macRow.appendChild(w); });
  inner.appendChild(macRow);

  const read = () => {
    const get = k => inner.querySelector('input[data-key="' + k + '"]').value;
    return {
      n: get('n').trim() || f.n, ic: get('ic').trim() || '🍽',
      kcal: Math.round(parseFloat(get('kcal')) || 0), p: Math.round(parseFloat(get('p')) || 0),
      c: Math.round(parseFloat(get('c')) || 0), f: Math.round(parseFloat(get('f')) || 0),
    };
  };
  const save = h('button', { textContent: '✓ Speichern' }); save.className = 'btn btn-gold tap';
  save.onclick = () => {
    const patch = read();
    if (f.custom) updateCustomFood(Object.assign({}, f, patch));
    else saveFoodOverride(f.id, patch);
    haptic('success'); showToast('Werte gespeichert', '✎'); closeOverlay(); renderVitals(s);
  };
  inner.appendChild(save);
  if (!f.custom && getFoodOverrides()[f.id]) {
    const rst = h('button', { textContent: '↩ Auf Standard zurücksetzen' }); rst.className = 'btn btn-ghost tap'; rst.style.cssText = 'margin-top:8px;font-size:12px;';
    rst.onclick = () => { resetFoodOverride(f.id); showToast('Zurückgesetzt', '↩'); closeOverlay(); renderVitals(s); };
    inner.appendChild(rst);
  }
  openOverlay();
}
// Supplements = built-in stack + own, minus hidden ones, with per-supp time
// overrides applied (so built-ins can be re-timed AND removed too).
function suppHidden() { return ls('los_supps_hidden') || []; }
function suppTimes() { return ls('los_supp_time') || {}; }
function getSupps() {
  const hidden = suppHidden(), times = suppTimes();
  return SUPPS.concat(ls('los_supps') || [])
    .filter(x => !hidden.includes(x.id))
    .map(x => times[x.id] ? Object.assign({}, x, { t: times[x.id] }) : x);
}
function addCustomSupp(s) { const a = ls('los_supps') || []; a.push(s); ls('los_supps', a); }
// Remove: delete own supps outright; hide built-ins so they stay removable/restorable.
function removeSupp(id) {
  const own = ls('los_supps') || [];
  if (own.some(x => x.id === id)) ls('los_supps', own.filter(x => x.id !== id));
  else { const h = suppHidden(); if (!h.includes(id)) { h.push(id); ls('los_supps_hidden', h); } }
  if (STATE.day && STATE.day.supps) { delete STATE.day.supps[id]; saveDay(); }
}
function delCustomSupp(id) { removeSupp(id); }         // kept for compatibility
function restoreHiddenSupps() { ls('los_supps_hidden', []); }
// Set a supplement's time-of-day (HH:MM). Built-ins get an override entry.
function setSuppTime(id, t) { const m = suppTimes(); m[id] = t; ls('los_supp_time', m); }

// Time-of-day buckets used across the supplement UI.
const SUPP_TOD = [
  { key: 'morgens', label: '🌅 Morgens', t: '08:00' },
  { key: 'mittags', label: '☀️ Mittags', t: '13:00' },
  { key: 'abends',  label: '🌙 Abends',  t: '21:00' },
];
function suppTodOf(t) { const hh = parseInt((t || '12:00').split(':')[0]) || 12; return hh < 11 ? 'morgens' : hh < 16 ? 'mittags' : 'abends'; }

// Intelligent guess for WHEN to take a supplement, from its name. Returns HH:MM.
function suggestSuppTime(name) {
  const n = (name || '').toLowerCase();
  const has = (...ks) => ks.some(k => n.includes(k));
  if (has('magnesium', 'ashwagand', 'melatonin', 'zink', 'zma', 'glycin', 'baldrian', 'cbd', 'l-theanin', 'theanin', 'gaba', 'tryptophan', 'nacht')) return '21:00'; // beruhigend → abends
  if (has('vitamin d', 'vit d', 'vitd', 'koffein', 'kaffee', 'pre-work', 'preworkout', 'pre workout', 'b12', 'b-komplex', 'b komplex', 'vitamin c', 'vit c', 'eisen', 'multivit', 'multi-vit', 'tyrosin', 'guarana', 'ginseng', 'rhodiola')) return '08:00'; // aktivierend → morgens
  if (has('omega', 'fischöl', 'fischoel', 'fish oil', 'krill', 'protein', 'kreatin', 'creatin', 'kurkuma', 'curcumin', 'coq10', 'q10')) return '13:00'; // mit Mahlzeit → mittags
  return '13:00';
}
// Assign intelligent times to every currently visible supplement.
function autoAssignSuppTimes() {
  const m = suppTimes();
  getSupps().forEach(sup => { m[sup.id] = suggestSuppTime(sup.n); });
  ls('los_supp_time', m);
}

// Macro progress bar (value / goal)
function macroBar(label, val, goal, unit, color) {
  const pct = goal > 0 ? Math.min(100, Math.round((val / goal) * 100)) : 0;
  const wrap = div('', '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
    '<span class="label">' + label + '</span>' +
    '<span style="font-size:12px;color:' + (val >= goal ? 'var(--green)' : 'var(--t-2)') + ';">' + val + unit + ' / ' + goal + unit + '</span></div>');
  wrap.appendChild(div('bar', '<div class="bar-fill" style="width:' + pct + '%;background:' + color + ';"></div>'));
  return wrap;
}

// Edit daily targets
// Quantity picker — log any portion of a food (½, 1, 2, or a custom factor).
function openFoodQty(f, s) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  let qty = 1;
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">MENGE WÄHLEN</div>' +
    '<div class="h2" style="margin-bottom:6px;">' + (f.ic || '🍽') + ' ' + f.n + '</div>' +
    '<div style="font-size:12px;color:var(--t-3);margin-bottom:14px;">1 Portion = ' + f.kcal + ' kcal · ' + f.p + 'g P · ' + f.c + 'g C · ' + f.f + 'g F</div>');
  const prev = div('glass-hi', ''); prev.style.cssText = 'padding:16px;text-align:center;margin-bottom:12px;';
  let syncExtra = () => {};   // keeps the gram/oz field in sync with qty
  const paint = () => {
    prev.innerHTML = '<div style="font-size:26px;font-weight:800;color:var(--gold);">' + Math.round(f.kcal * qty) + ' kcal</div>' +
      '<div style="font-size:13px;color:var(--t-2);margin-top:4px;">' + Math.round(f.p * qty) + 'g P · ' + Math.round(f.c * qty) + 'g C · ' + Math.round(f.f * qty) + 'g F</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:6px;">Menge: ' + (qty % 1 === 0 ? qty : qty.toFixed(1)) + '× Portion</div>';
    syncExtra();
  };
  inner.appendChild(prev);
  const quick = div(''); quick.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;';
  [0.5, 1, 1.5, 2, 3].forEach(m => {
    const b = h('button', { textContent: (m % 1 === 0 ? m : m.toFixed(1)) + '×' });
    b.className = 'itab tap'; b.style.cssText = 'flex:1;min-width:56px;';
    b.onclick = () => { qty = m; paint(); };
    quick.appendChild(b);
  });
  inner.appendChild(quick);
  const customRow = div(''); customRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:16px;';
  customRow.insertAdjacentHTML('beforeend', '<span style="font-size:13px;color:var(--t-3);flex:1;">Eigene Menge (×):</span>');
  const ci = h('input', { type: 'number', value: '1', min: '0.1', step: '0.1', inputmode: 'decimal' });
  ci.className = 'inp'; ci.style.cssText = 'width:90px;text-align:center;font-size:15px;';
  ci.oninput = e => { const v = parseFloat(e.target.value); if (v > 0) { qty = v; paint(); } };
  customRow.appendChild(ci); inner.appendChild(customRow);

  // Menge direkt in Gramm (oder oz/lb im imperialen System) — sofern die
  // Portion eine Grammangabe hat (z. B. „Hähnchenbrust 150g").
  const baseG = parseInt((f.n.match(/(\d+)\s*g\b/) || [])[1]) || 0;
  if (baseG) {
    const units = getCfg().units || 'metric';
    const imp = units === 'imperial';
    const gRow = div(''); gRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:16px;';
    gRow.insertAdjacentHTML('beforeend', '<span style="font-size:13px;color:var(--t-3);flex:1;">Oder direkt in ' + (imp ? 'oz' : 'Gramm') + ' (1 Portion = ' + baseG + ' g):</span>');
    const gi = h('input', { type: 'number', min: '1', step: imp ? '0.1' : '1', inputmode: 'decimal' });
    gi.className = 'inp'; gi.style.cssText = 'width:96px;text-align:center;font-size:15px;';
    gi.oninput = e => { let g = parseFloat(e.target.value); if (!(g > 0)) return; if (imp) g *= 28.35; qty = g / baseG; ci.value = (qty % 1 === 0 ? qty : qty.toFixed(2)); paint(); };
    gRow.appendChild(gi); inner.appendChild(gRow);
    syncExtra = () => { const grams = qty * baseG; if (document.activeElement !== gi) gi.value = imp ? (grams / 28.35).toFixed(1) : Math.round(grams); };
  }
  paint();

  const log = h('button', { textContent: '＋  LOGGEN' });
  log.className = 'btn btn-gold tap';
  log.onclick = () => {
    STATE.day.meals.push({
      id: Date.now(), n: f.n + (qty !== 1 ? ' ×' + (qty % 1 === 0 ? qty : qty.toFixed(1)) : ''),
      kcal: Math.round(f.kcal * qty), p: Math.round(f.p * qty), c: Math.round(f.c * qty), f: Math.round(f.f * qty), ic: f.ic || '🍽',
    });
    saveDay(); updateStatusBar(); haptic('success'); closeOverlay(); renderVitals(s);
  };
  inner.appendChild(log);
  openOverlay();
}

// ─── ERNÄHRUNGSPLAN (meal-plan template) ──────────────
// A reusable plan of meals per slot; each planned item can be logged as eaten
// with one tap (or the whole slot at once). Stored in los_mealplan.
const MEAL_SLOTS = ['Frühstück', 'Mittag', 'Abend', 'Snack'];
function getMealPlan() { const p = ls('los_mealplan') || {}; MEAL_SLOTS.forEach(k => { if (!p[k]) p[k] = []; }); return p; }
function saveMealPlan(p) { ls('los_mealplan', p); }
function mealPlanTotals(p) {
  let kcal = 0, prot = 0;
  MEAL_SLOTS.forEach(k => (p[k] || []).forEach(it => { kcal += it.kcal || 0; prot += it.p || 0; }));
  return { kcal, prot };
}

function renderMealPlan(s) {
  const cfg = getCfg();
  const plan = getMealPlan();
  const tot = mealPlanTotals(plan);
  const det = document.createElement('details');
  det.className = 'glass'; det.style.cssText = 'padding:12px 14px;';
  det.open = MEAL_SLOTS.some(k => (plan[k] || []).length);
  det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">🍱 Mein Plan ' +
    '<span style="color:var(--t-3);font-weight:400;">· ' + tot.kcal + ' kcal · ' + tot.prot + 'g P geplant</span></summary>';
  const body = div(''); body.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:12px;';
  const hint = div('', 'Plane feste Mahlzeiten pro Slot. „→ loggen" trägt sie als gegessen ein. Ziel: ' + cfg.kcalGoal + ' kcal · ' + cfg.proteinGoal + 'g P.');
  hint.style.cssText = 'font-size:11px;color:var(--t-3);line-height:1.5;';
  body.appendChild(hint);

  MEAL_SLOTS.forEach(slot => {
    const items = plan[slot] || [];
    const slotKcal = items.reduce((a, it) => a + (it.kcal || 0), 0);
    const sec = div(''); sec.style.cssText = 'border:1px solid var(--edge);border-radius:12px;padding:10px 12px;';
    const head = div('', '<div style="font-size:13px;font-weight:600;color:var(--t-1);">' + slot +
      ' <span style="font-size:11px;color:var(--t-3);font-weight:400;">· ' + slotKcal + ' kcal</span></div>');
    head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
    const addB = h('button', { textContent: '＋' });
    addB.className = 'tap';
    addB.style.cssText = 'width:30px;height:30px;flex:none;border-radius:8px;background:var(--glass-2);border:1px solid var(--edge);color:var(--gold);font-size:16px;';
    addB.onclick = () => openPlanPicker(slot, s);
    head.appendChild(addB); sec.appendChild(head);

    if (!items.length) sec.appendChild(div('', '<div style="font-size:12px;color:var(--t-4);padding:2px 0;">Noch nichts geplant.</div>'));
    items.forEach((it, idx) => {
      const r = div(''); r.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 0;' + (idx > 0 ? 'border-top:1px solid var(--edge);' : '');
      r.innerHTML = '<span style="font-size:15px;">' + (it.ic || '🍽') + '</span>' +
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);">' + it.n + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);">' + it.kcal + ' kcal · ' + it.p + 'g P</div></div>';
      const logB = h('button', { textContent: '→ loggen' });
      logB.className = 'tap';
      logB.style.cssText = 'flex:none;padding:6px 10px;border-radius:8px;background:rgba(92,184,117,.12);border:1px solid rgba(92,184,117,.25);color:var(--green);font-size:11px;';
      logB.onclick = () => {
        STATE.day.meals.push({ id: Date.now(), n: it.n, kcal: it.kcal, p: it.p, c: it.c, f: it.f, ic: it.ic || '🍽' });
        saveDay(); updateStatusBar(); haptic('success'); showToast(it.n + ' geloggt', '🍽'); renderVitals(s);
      };
      const delB = h('button', { textContent: '×' });
      delB.style.cssText = 'background:none;color:var(--t-4);font-size:14px;flex:none;';
      delB.onclick = () => { const pl = getMealPlan(); pl[slot].splice(idx, 1); saveMealPlan(pl); renderVitals(s); };
      r.appendChild(logB); r.appendChild(delB); sec.appendChild(r);
    });
    if (items.length) {
      const allB = h('button', { textContent: '→ Ganzen Slot loggen' });
      allB.className = 'btn btn-glass tap'; allB.style.cssText = 'font-size:12px;margin-top:8px;';
      allB.onclick = () => {
        items.forEach((it, i) => STATE.day.meals.push({ id: Date.now() + i, n: it.n, kcal: it.kcal, p: it.p, c: it.c, f: it.f, ic: it.ic || '🍽' }));
        saveDay(); updateStatusBar(); haptic('success'); showToast(slot + ' komplett geloggt', '🍱'); renderVitals(s);
      };
      sec.appendChild(allB);
    }
    body.appendChild(sec);
  });
  det.appendChild(body);
  return det;
}

// Food picker overlay for planning (adds 1 portion of a food to a slot).
function openPlanPicker(slot, s) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">PLANEN · ' + slot + '</div>' +
    '<div class="h2" style="margin-bottom:12px;">Was einplanen?</div>');
  const search = h('input', { type: 'search', placeholder: '🔍 Lebensmittel suchen…' });
  search.className = 'inp'; search.style.cssText = 'width:100%;font-size:14px;margin-bottom:10px;';
  inner.appendChild(search);
  const wrap = div(''); inner.appendChild(wrap);
  const paint = () => {
    wrap.innerHTML = '';
    const q = search.value.trim().toLowerCase();
    const all = getFoods().filter(f => !q || f.n.toLowerCase().includes(q));
    if (!all.length) { wrap.appendChild(div('', '<div style="font-size:13px;color:var(--t-3);padding:8px 4px;">Nichts gefunden.</div>')); return; }
    all.slice(0, 60).forEach(f => {
      const row = div('row tap', '<span style="font-size:18px;">' + (f.ic || '🍽') + '</span>' +
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);">' + f.n + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);">' + f.kcal + ' kcal · ' + f.p + 'g P</div></div><span class="gold" style="font-size:18px;">＋</span>');
      row.onclick = () => {
        const pl = getMealPlan();
        pl[slot].push({ n: f.n, kcal: f.kcal, p: f.p, c: f.c, f: f.f, ic: f.ic || '🍽' });
        saveMealPlan(pl); haptic('success'); showToast(f.n + ' → ' + slot, '🍱');
      };
      wrap.appendChild(row);
    });
  };
  search.oninput = paint; paint();
  const done = h('button', { textContent: 'FERTIG' });
  done.className = 'btn btn-gold tap'; done.style.marginTop = '14px';
  done.onclick = () => { closeOverlay(); renderVitals(s); };
  inner.appendChild(done);
  openOverlay();
}

function editGoals(s) {
  const cfg = getCfg();
  const p = parseInt(prompt('Protein-Ziel (g/Tag):', cfg.proteinGoal) || cfg.proteinGoal);
  const w = parseInt(prompt('Wasser-Ziel (ml/Tag):', cfg.waterGoal) || cfg.waterGoal);
  const k = parseInt(prompt('Kalorien-Ziel (kcal/Tag):', cfg.kcalGoal) || cfg.kcalGoal);
  const sl = parseFloat((prompt('Schlaf-Ziel (h/Tag, z. B. 7.5):', cfg.sleepGoal) || cfg.sleepGoal).toString().replace(',', '.'));
  saveCfg({ proteinGoal: p || cfg.proteinGoal, waterGoal: w || cfg.waterGoal, kcalGoal: k || cfg.kcalGoal, sleepGoal: (sl > 0 ? sl : cfg.sleepGoal) });
  showToast('Ziele gespeichert', '🎯'); renderVitals(s); updateStatusBar();
}

// Collapsible "own meal" form
function renderMealAdd(s) {
  const wrap = div('');
  const btn = h('button', { textContent: '+ Eigene Mahlzeit' }, '');
  btn.className = 'btn btn-glass tap'; btn.style.cssText = 'font-size:13px;margin-bottom:6px;';
  const form = div('glass-hi', ''); form.style.cssText = 'display:none;margin-bottom:6px;';
  const nI = h('input', { type: 'text', placeholder: 'Name (z. B. Bowl mit Reis)' }, ''); nI.className = 'inp'; nI.style.marginBottom = '8px';
  const mkNum = ph => { const i = h('input', { type: 'number', inputmode: 'numeric', placeholder: ph }, ''); i.className = 'inp'; i.style.flex = '1'; return i; };
  const kI = mkNum('kcal'), pI = mkNum('Protein g'), cI = mkNum('Carbs g'), fI = mkNum('Fett g');
  const r1 = div(''); r1.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;'; r1.appendChild(kI); r1.appendChild(pI);
  const r2 = div(''); r2.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;'; r2.appendChild(cI); r2.appendChild(fI);
  const save = h('button', { textContent: 'Hinzufügen & loggen' }, ''); save.className = 'btn btn-gold tap';
  save.onclick = () => {
    const n = nI.value.trim(); const kcal = parseInt(kI.value) || 0;
    if (!n || !kcal) { nI.classList.add('anim-shake'); setTimeout(() => nI.classList.remove('anim-shake'), 450); return; }
    const food = { id: 'c' + Date.now(), n, kcal, p: parseInt(pI.value) || 0, c: parseInt(cI.value) || 0, f: parseInt(fI.value) || 0, ic: '🍽', custom: true };
    addCustomFood(food);
    STATE.day.meals.push(Object.assign({}, food, { id: Date.now() })); saveDay(); updateStatusBar();
    haptic('success'); renderVitals(s);
  };
  form.appendChild(nI); form.appendChild(r1); form.appendChild(r2); form.appendChild(save);
  btn.onclick = () => { form.style.display = form.style.display === 'none' ? 'block' : 'none'; };
  wrap.appendChild(btn); wrap.appendChild(form);
  return wrap;
}

// Edit sheet for one supplement: time-of-day, intelligent assign, remove.
function openSuppEdit(sup, s) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:4px;">SUPPLEMENT</div>' +
    '<div class="h2" style="margin-bottom:4px;">' + (sup.ic || '💊') + ' ' + esc(sup.n) + '</div>' +
    (sup.d ? '<div style="font-size:12px;color:var(--t-3);margin-bottom:18px;">' + esc(sup.d) + '</div>' : '<div style="margin-bottom:18px;"></div>'));

  const card = div('glass', '<div class="label" style="font-size:10px;margin-bottom:10px;">WANN NEHMEN?</div>');
  card.style.marginBottom = '12px';
  const chips = div(''); chips.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
  const curTod = suppTodOf(sup.t);
  SUPP_TOD.forEach(tod => {
    const b = h('button', { textContent: tod.label });
    b.className = 'tap tp-chip' + (tod.key === curTod ? ' on' : '');
    b.onclick = () => { setSuppTime(sup.id, tod.t); haptic('light'); renderVitals(s); openSuppEdit(Object.assign({}, sup, { t: tod.t }), s); };
    chips.appendChild(b);
  });
  card.appendChild(chips);

  const ai = h('button', { textContent: '✦ Intelligent zuweisen' });
  ai.className = 'btn btn-glass tap'; ai.style.cssText = 'width:100%;margin-top:12px;font-size:13px;';
  ai.onclick = () => {
    const t = suggestSuppTime(sup.n); setSuppTime(sup.id, t);
    const todLabel = (SUPP_TOD.find(x => x.key === suppTodOf(t)) || {}).label || t;
    showToast(sup.n + ' → ' + todLabel, '✦'); haptic('success');
    renderVitals(s); openSuppEdit(Object.assign({}, sup, { t }), s);
  };
  card.appendChild(ai);
  inner.appendChild(card);

  const rm = h('button', { textContent: '🗑  Entfernen' });
  rm.className = 'btn tap'; rm.style.cssText = 'width:100%;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.3);color:#FF453A;font-weight:600;padding:12px;border-radius:var(--r-md);';
  rm.onclick = () => { removeSupp(sup.id); haptic('warn'); closeOverlay(); renderVitals(s); };
  inner.appendChild(rm);

  openOverlay();
}

// Collapsible "own supplement" form + intelligent tools.
function renderSuppAdd(s) {
  const wrap = div('');

  // Top row: add own + auto-assign-all.
  const tools = div(''); tools.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap;';
  const btn = h('button', { textContent: '+ Eigenes Supplement' }, '');
  btn.className = 'btn btn-glass tap'; btn.style.cssText = 'font-size:13px;flex:1;';
  const autoAll = h('button', { textContent: '✦ Zeiten automatisch' }, '');
  autoAll.className = 'btn btn-glass tap'; autoAll.style.cssText = 'font-size:13px;flex:1;';
  autoAll.onclick = () => { autoAssignSuppTimes(); showToast('Tageszeiten intelligent zugewiesen', '✦'); haptic('success'); renderVitals(s); };
  tools.appendChild(btn); tools.appendChild(autoAll);
  wrap.appendChild(tools);

  const form = div('glass-hi', ''); form.style.cssText = 'display:none;margin-bottom:6px;';
  const nI = h('input', { type: 'text', placeholder: 'Name (z. B. Magnesium)' }, ''); nI.className = 'inp'; nI.style.marginBottom = '8px';
  const dI = h('input', { type: 'text', placeholder: 'Dosis (z. B. 400mg)' }, ''); dI.className = 'inp'; dI.style.marginBottom = '8px';

  // Time-of-day chips (default: intelligent by name); an ✦ auto chip re-detects.
  let chosenT = '';                       // '' = auto/intelligent
  const todLbl = div('label', 'WANN? (leer = automatisch)'); todLbl.style.cssText = 'font-size:10px;margin-bottom:6px;';
  const todRow = div(''); todRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;';
  const paint = () => todRow.querySelectorAll('.tp-chip').forEach(c => c.classList.toggle('on', c.dataset.t === chosenT));
  const autoChip = h('button', { textContent: '✦ Auto' }); autoChip.className = 'tap tp-chip on'; autoChip.dataset.t = '';
  autoChip.onclick = () => { chosenT = ''; paint(); };
  todRow.appendChild(autoChip);
  SUPP_TOD.forEach(tod => {
    const b = h('button', { textContent: tod.label }); b.className = 'tap tp-chip'; b.dataset.t = tod.t;
    b.onclick = () => { chosenT = tod.t; paint(); };
    todRow.appendChild(b);
  });

  const save = h('button', { textContent: 'Hinzufügen' }, ''); save.className = 'btn btn-gold tap'; save.style.width = '100%';
  save.onclick = () => {
    const n = nI.value.trim();
    if (!n) { nI.classList.add('anim-shake'); setTimeout(() => nI.classList.remove('anim-shake'), 450); return; }
    const t = chosenT || suggestSuppTime(n);        // empty → intelligent guess
    addCustomSupp({ id: 'cs' + Date.now(), n, d: dI.value.trim(), ic: '💊', t, custom: true });
    haptic('success'); renderVitals(s);
  };
  form.appendChild(nI); form.appendChild(dI); form.appendChild(todLbl); form.appendChild(todRow); form.appendChild(save);
  btn.onclick = () => { form.style.display = form.style.display === 'none' ? 'block' : 'none'; };
  wrap.appendChild(form);

  // Restore hidden built-ins, if any were removed.
  if (suppHidden().length) {
    const restore = h('button', { textContent: '↩ ' + suppHidden().length + ' ausgeblendete zurückholen' }, '');
    restore.className = 'tap'; restore.style.cssText = 'font-size:11px;color:var(--t-3);background:none;margin-bottom:6px;';
    restore.onclick = () => { restoreHiddenSupps(); showToast('Wieder eingeblendet', '↩'); renderVitals(s); };
    wrap.appendChild(restore);
  }
  return wrap;
}
