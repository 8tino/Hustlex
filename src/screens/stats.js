// ═══════════════════════════════════════════════════════
// STATS · Evaluation dashboard (rendered inside the LOG tab).
//   Pick metrics + a time range and compare them — time-based
//   metrics (sleep, log categories) as bars + a pie chart;
//   value metrics (water, kcal, tasks, XP) as averages.
//   Log entries are auto-categorised by keyword (editable).
//   Reads: los_log_<date>, los_daystat_<date>, los_tasks_done_<date>
// ═══════════════════════════════════════════════════════

const STAT_DEFAULT_CATS = [
  { id: 'arbeit',  name: 'Arbeit',   icon: '💼', color: '#0A84FF', keywords: ['arbeit', 'gearbeitet', 'work', 'meeting', 'deep', 'coding', 'projekt', 'büro'] },
  { id: 'lernen',  name: 'Lernen',   icon: '📖', color: '#BF5AF2', keywords: ['lern', 'gelesen', 'lesen', 'kurs', 'uni', 'schule', 'studier', 'vokabel'] },
  { id: 'sport',   name: 'Sport',    icon: '🏋', color: '#30D158', keywords: ['training', 'gym', 'sport', 'laufen', 'joggen', 'workout', 'schwimm', 'fahrrad'] },
  { id: 'scroll',  name: 'Scrollen', icon: '📱', color: '#FF453A', keywords: ['scroll', 'insta', 'tiktok', 'youtube', 'social', 'netflix', 'serie', 'handy'] },
  { id: 'musik',   name: 'Musik',    icon: '🎵', color: '#FF9F0A', keywords: ['musik', 'spotify', 'song', 'playlist', 'gitarre', 'klavier'] },
  { id: 'pause',   name: 'Erholung', icon: '🚶', color: '#64D2FF', keywords: ['pause', 'spazier', 'erholung', 'entspann', 'meditation'] },
];
const STAT_OTHER = { id: 'other', name: 'Sonstiges', icon: '▫', color: '#8E8E93' };
const SLEEP_METRIC = { id: 'sleep', name: 'Schlaf', icon: '😴', color: '#5E5CE6', kind: 'sleep' };

function getStatCats() { return ls('los_stat_cats') || STAT_DEFAULT_CATS.slice(); }
function saveStatCats(a) { ls('los_stat_cats', a); }
function statCategorize(text) {
  const t = (text || '').toLowerCase();
  for (const c of getStatCats()) if ((c.keywords || []).some(k => k && t.includes(k))) return c;
  return STAT_OTHER;
}

// minutes per category for one day
function statDayMinutes(dateStr) {
  const out = {};
  (ls('los_log_' + dateStr) || []).forEach(e => {
    const c = statCategorize(e.text);
    out[c.id] = (out[c.id] || 0) + (e.dur || 0);
  });
  return out;
}

// dashboard UI state
const STAT_STATE = { range: 30, metrics: null };
const STAT_RANGES = [[7, '7 T'], [30, '30 T'], [90, '3 M'], [180, '6 M']];

function statMetricList() {
  return [SLEEP_METRIC].concat(getStatCats().map(c => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, kind: 'cat' })));
}
function statDefaultMetrics() {
  const m = {}; ['sleep', 'arbeit', 'sport', 'scroll'].forEach(id => m[id] = true); return m;
}
function fmtH(h) { return (Math.round(h * 10) / 10).toString().replace('.', ',') + 'h'; }

function renderStatsPanel(p) {
  if (!STAT_STATE.metrics) STAT_STATE.metrics = statDefaultMetrics();
  const days = STAT_STATE.range;

  // ── range selector ──
  const rc = div(''); rc.style.cssText = 'display:flex;gap:6px;';
  STAT_RANGES.forEach(([d, l]) => {
    const b = h('button', { textContent: l }, '');
    b.className = 'itab tap' + (STAT_STATE.range === d ? ' on' : '');
    b.onclick = () => { STAT_STATE.range = d; renderScreen('log'); };
    rc.appendChild(b);
  });
  p.appendChild(rc);

  // ── metric picker ──
  const mc = div('glass', '<div class="label" style="margin-bottom:10px;">VERGLEICHEN</div>');
  const chips = div(''); chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;';
  const allM = statMetricList().concat([
    { id: 'water', name: 'Wasser', icon: '💧', color: '#64D2FF', kind: 'val' },
    { id: 'kcal', name: 'Kalorien', icon: '🔥', color: '#FF9F0A', kind: 'val' },
    { id: 'tasks', name: 'Tasks', icon: '☑', color: '#30D158', kind: 'val' },
  ]);
  allM.forEach(m => {
    const on = !!STAT_STATE.metrics[m.id];
    const b = h('button', { textContent: m.icon + ' ' + m.name }, '');
    b.className = 'pill tap' + (on ? ' pill-gold' : '');
    b.style.cssText = 'cursor:pointer;font-size:13px;padding:8px 12px;' + (on ? 'background:' + m.color + ';box-shadow:0 2px 8px ' + m.color + '66;' : '');
    b.onclick = () => { STAT_STATE.metrics[m.id] = !STAT_STATE.metrics[m.id]; renderScreen('log'); };
    chips.appendChild(b);
  });
  mc.appendChild(chips);
  p.appendChild(mc);

  // ── aggregate over range ──
  const timeTotals = {}; // id → hours
  const valSums = { water: 0, kcal: 0, tasks: 0 }; const valDays = { water: 0, kcal: 0 };
  const catById = {}; statMetricList().forEach(m => catById[m.id] = m);
  for (let i = 0; i < days; i++) {
    const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toDateString();
    const ds2 = ls('los_daystat_' + ds);
    if (STAT_STATE.metrics.sleep && ds2 && ds2.sleepH) timeTotals.sleep = (timeTotals.sleep || 0) + parseFloat(ds2.sleepH);
    const mins = statDayMinutes(ds);
    Object.keys(mins).forEach(cid => {
      if (STAT_STATE.metrics[cid] && catById[cid]) timeTotals[cid] = (timeTotals[cid] || 0) + mins[cid] / 60;
    });
    if (ds2) {
      if (ds2.water) { valSums.water += ds2.water; valDays.water++; }
      if (ds2.kcal) { valSums.kcal += ds2.kcal; valDays.kcal++; }
    }
    valSums.tasks += (ls('los_tasks_done_' + ds) || []).length;
  }

  // ── time metrics: bars + pie ──
  const timeMetrics = statMetricList().filter(m => STAT_STATE.metrics[m.id] && (timeTotals[m.id] || 0) > 0);
  const grandTotal = timeMetrics.reduce((a, m) => a + timeTotals[m.id], 0);

  if (timeMetrics.length && grandTotal > 0) {
    // Pie (conic-gradient)
    let acc = 0; const stops = [];
    timeMetrics.forEach(m => {
      const frac = timeTotals[m.id] / grandTotal;
      stops.push(m.color + ' ' + (acc * 100).toFixed(1) + '% ' + ((acc + frac) * 100).toFixed(1) + '%');
      acc += frac;
    });
    const pieCard = div('glass', '<div class="label" style="margin-bottom:14px;">ZEIT-VERTEILUNG · LETZTE ' + (days >= 30 ? Math.round(days / 30) + ' MON.' : days + ' TAGE') + '</div>');
    const pieRow = div(''); pieRow.style.cssText = 'display:flex;gap:18px;align-items:center;';
    const pie = div(''); pie.style.cssText = 'width:120px;height:120px;border-radius:50%;flex-shrink:0;background:conic-gradient(' + stops.join(',') + ');box-shadow:0 8px 20px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.1);';
    const hole = div(''); hole.style.cssText = 'width:56px;height:56px;border-radius:50%;background:#0b0c11;margin:32px;display:flex;align-items:center;justify-content:center;flex-direction:column;';
    hole.innerHTML = '<div style="font-size:15px;font-weight:800;color:#fff;">' + Math.round(grandTotal) + 'h</div><div style="font-size:10px;color:var(--t-3);">gesamt</div>';
    pie.appendChild(hole);
    const legend = div(''); legend.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;';
    timeMetrics.sort((a, b) => timeTotals[b.id] - timeTotals[a.id]).forEach(m => {
      const pct = Math.round((timeTotals[m.id] / grandTotal) * 100);
      legend.insertAdjacentHTML('beforeend',
        '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
        '<span style="width:10px;height:10px;border-radius:3px;background:' + m.color + ';flex:none;"></span>' +
        '<span style="flex:1;color:var(--t-1);">' + m.icon + ' ' + m.name + '</span>' +
        '<span style="color:var(--t-2);">' + fmtH(timeTotals[m.id]) + '</span>' +
        '<span style="color:var(--t-3);width:34px;text-align:right;">' + pct + '%</span></div>');
    });
    pieRow.appendChild(pie); pieRow.appendChild(legend);
    pieCard.appendChild(pieRow);
    p.appendChild(pieCard);

    // Bars (absolute hours)
    const barCard = div('glass', '<div class="label" style="margin-bottom:12px;">STUNDEN IM ZEITRAUM</div>');
    const maxH = Math.max(...timeMetrics.map(m => timeTotals[m.id]));
    timeMetrics.forEach(m => {
      const row = div('', '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
        '<span style="font-size:13px;color:var(--t-1);">' + m.icon + ' ' + m.name + '</span>' +
        '<span style="font-size:13px;color:var(--t-2);">' + fmtH(timeTotals[m.id]) + ' · ⌀ ' + fmtH(timeTotals[m.id] / days) + '/Tag</span></div>');
      row.style.marginBottom = '11px';
      row.appendChild(div('bar', '<div class="bar-fill" style="width:' + Math.max(3, Math.round((timeTotals[m.id] / maxH) * 100)) + '%;background:' + m.color + ';box-shadow:0 0 10px ' + m.color + '80;"></div>'));
      barCard.appendChild(row);
    });
    p.appendChild(barCard);
  } else {
    const e = div('glass', 'Wähle oben Metriken (z. B. Schlaf, Arbeit) — sobald du im LOG etwas mit Dauer („90m") einträgst und Schlaf in Vitals erfasst, erscheint hier deine Auswertung.');
    e.style.cssText = 'font-size:13px;color:var(--t-3);line-height:1.6;';
    p.appendChild(e);
  }

  // ── value metrics (averages / totals) ──
  const valMetrics = [];
  if (STAT_STATE.metrics.water) valMetrics.push({ label: '💧 Wasser ⌀', v: valDays.water ? (valSums.water / valDays.water / 1000).toFixed(1).replace('.', ',') + 'L' : '–', c: '#64D2FF' });
  if (STAT_STATE.metrics.kcal) valMetrics.push({ label: '🔥 Kalorien ⌀', v: valDays.kcal ? Math.round(valSums.kcal / valDays.kcal) : '–', c: '#FF9F0A' });
  if (STAT_STATE.metrics.tasks) valMetrics.push({ label: '☑ Tasks gesamt', v: valSums.tasks, c: '#30D158' });
  if (valMetrics.length) {
    const vc = div(''); vc.style.cssText = 'display:grid;grid-template-columns:repeat(' + Math.min(3, valMetrics.length) + ',1fr);gap:10px;';
    valMetrics.forEach(m => {
      const t = div('glass', '<div style="font-size:22px;font-weight:800;color:' + m.c + ';">' + m.v + '</div><div class="label" style="font-size:11px;margin-top:2px;">' + m.label + '</div>');
      t.style.cssText = 'padding:14px;';
      vc.appendChild(t);
    });
    p.appendChild(vc);
  }

  // ── category editor ──
  const catCard = div('glass', '');
  let edit = false;
  const chead = div(''); chead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
  chead.innerHTML = '<div class="label">KATEGORIEN</div>';
  const eBtn = h('button', { textContent: 'Bearbeiten' }, ''); eBtn.className = 'tap'; eBtn.style.cssText = 'background:none;color:var(--gold);font-size:13px;';
  chead.appendChild(eBtn); catCard.appendChild(chead);
  const cwrap = div(''); cwrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
  const paint = () => {
    cwrap.innerHTML = '';
    getStatCats().forEach(c => {
      const b = h('button', { textContent: (edit ? '✕ ' : '') + c.icon + ' ' + c.name }, '');
      b.className = 'pill tap';
      b.style.cssText = 'cursor:pointer;font-size:12px;padding:7px 12px;border-color:' + c.color + '55;' + (edit ? 'color:var(--red);' : 'color:var(--t-1);');
      b.title = (c.keywords || []).join(', ');
      b.onclick = () => {
        if (edit) { if (confirm('Kategorie "' + c.name + '" löschen?')) { saveStatCats(getStatCats().filter(x => x.id !== c.id)); paint(); } }
        else { const kw = prompt('Stichwörter für „' + c.name + '" (Komma-getrennt):', (c.keywords || []).join(', ')); if (kw !== null) { const a = getStatCats(); a.find(x => x.id === c.id).keywords = kw.split(',').map(x => x.trim().toLowerCase()).filter(Boolean); saveStatCats(a); renderScreen('log'); } }
      };
      cwrap.appendChild(b);
    });
    if (edit) {
      const nb = h('button', { textContent: '+ Neue Kategorie' }, ''); nb.className = 'pill tap'; nb.style.cssText = 'cursor:pointer;font-size:12px;padding:7px 12px;color:var(--gold);';
      nb.onclick = () => {
        const name = prompt('Name (z. B. Gaming):'); if (!name) return;
        const icon = prompt('Emoji-Icon:', '🎮') || '▫';
        const kw = prompt('Stichwörter (Komma-getrennt):', name.toLowerCase()) || '';
        const a = getStatCats();
        a.push({ id: 'u' + Date.now(), name: name.trim(), icon, color: '#0A84FF', keywords: kw.split(',').map(x => x.trim().toLowerCase()).filter(Boolean) });
        saveStatCats(a); paint();
      };
      cwrap.appendChild(nb);
    }
  };
  eBtn.onclick = () => { edit = !edit; eBtn.textContent = edit ? 'Fertig' : 'Bearbeiten'; paint(); };
  paint();
  catCard.appendChild(cwrap);
  catCard.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-4);margin-top:8px;line-height:1.5;">Log-Einträge werden über Stichwörter zugeordnet. Antippen = Stichwörter ändern.</div>');
  p.appendChild(catCard);
}
