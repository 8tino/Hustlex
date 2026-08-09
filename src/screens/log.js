// ═══════════════════════════════════════════════════════
// LOG · Activity journal + evaluation in one tab.
//   Sub-tabs: HEUTE (log entries) | AUSWERTUNG (stats dashboard).
//   Entries support folders/subfolders ("Arbeit/YouTube") and
//   durations ("45m" in the text). Quick-chips are customizable.
//   Stores: los_log_<date> = [{id,time,text,dur,folder}]
//           los_log_chips  = [{id,label}]
//           los_log_folders = ["Arbeit","Arbeit/YouTube",…]
// ═══════════════════════════════════════════════════════

const LOG_DEFAULT_CHIPS = [
  { id: 'c1', label: '💧 Getrunken' },
  { id: 'c2', label: '🍽 Gegessen' },
  { id: 'c3', label: '💼 Gearbeitet 60m' },
  { id: 'c4', label: '📖 Gelernt 30m' },
  { id: 'c5', label: '🚶 Pause sinnvoll genutzt' },
];

let LOG_TAB = 'heute';
let LOG_FOLDER = '';

function getLog() { return ls('los_log_' + today()) || []; }
function saveLog(a) { ls('los_log_' + today(), a); }
function getLogChips() { return ls('los_log_chips') || LOG_DEFAULT_CHIPS.slice(); }
function saveLogChips(a) { ls('los_log_chips', a); }
// A few sensible starter folders/subfolders so the Log looks organised from
// day one. Only used until the user has created their own (then their list wins).
const LOG_DEFAULT_FOLDERS = [
  'Arbeit', 'Arbeit/Deep Work', 'Arbeit/Meetings', 'Arbeit/Admin',
  'Lernen', 'Lernen/Kurse', 'Lernen/Lesen',
  'Körper', 'Körper/Training', 'Körper/Essen', 'Körper/Schlaf',
  'Freizeit', 'Freizeit/Social', 'Freizeit/Scrollen',
];
function getLogFolders() {
  const saved = ls('los_log_folders');
  return (saved && saved.length) ? saved : LOG_DEFAULT_FOLDERS.slice();
}
function saveLogFolders(a) { ls('los_log_folders', a.sort()); }

// "Arbeit 90m" / "30 min Lesen" → minutes (or 0)
function parseDur(text) {
  const m = text.match(/(\d+)\s*(m|min)\b/i);
  return m ? parseInt(m[1]) : 0;
}

function addLogEntry(text, folder, time) {
  const t = (text || '').trim(); if (!t) return;
  const a = getLog();
  a.push({ id: Date.now(), time: time || new Date().toTimeString().slice(0, 5), text: t, dur: parseDur(t), folder: (folder !== undefined ? folder : LOG_FOLDER) || null });
  a.sort((x, y) => (x.time || '').localeCompare(y.time || ''));
  saveLog(a); haptic('light');
}

function renderLog(s) {
  s.className = 'screen on';
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">LOG · ' + new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>' +
    '<div class="h2">Was hast du <span class="gold">gemacht</span>?</div>';

  const tabRow = div('');
  tabRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
  [['heute', 'HEUTE'], ['stats', 'AUSWERTUNG']].forEach(([k, l]) => {
    const b = h('button', { textContent: l }, '');
    b.className = 'itab tap' + (LOG_TAB === k ? ' on' : '');
    b.onclick = () => { LOG_TAB = k; renderScreen('log'); };
    tabRow.appendChild(b);
  });
  s.appendChild(tabRow);

  const panel = div('');
  panel.style.cssText = 'display:flex;flex-direction:column;gap:14px;';
  if (LOG_TAB === 'heute') renderLogHeute(panel);
  else renderStatsPanel(panel);
  s.appendChild(panel);
}

function renderLogHeute(p) {
  const entries = getLog();
  const totalMin = entries.reduce((a, e) => a + (e.dur || 0), 0);

  // Summary
  const sum = div('glass-accent', '');
  sum.innerHTML = '<div style="display:flex;gap:14px;">' +
    '<div style="flex:1;"><div style="font-size:24px;font-weight:800;color:var(--gold);">' + entries.length + '</div><div class="label" style="font-size:11px;margin-top:2px;">EINTRÄGE HEUTE</div></div>' +
    '<div style="flex:1;"><div style="font-size:24px;font-weight:800;color:var(--blue);">' + (totalMin >= 60 ? Math.floor(totalMin / 60) + 'h ' + (totalMin % 60) + 'm' : totalMin + 'm') + '</div><div class="label" style="font-size:11px;margin-top:2px;">ERFASSTE ZEIT</div></div>' +
    '</div>';
  p.appendChild(sum);

  // Quick chips (customizable)
  const chipCard = div('glass', '');
  let editMode = false;
  const chipHead = div('', '');
  chipHead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
  chipHead.innerHTML = '<div class="label">SCHNELL EINTRAGEN</div>';
  const editBtn = h('button', { textContent: 'Bearbeiten' }, '');
  editBtn.className = 'tap';
  editBtn.style.cssText = 'background:none;color:var(--gold);font-size:13px;';
  chipHead.appendChild(editBtn);
  chipCard.appendChild(chipHead);

  const chipWrap = div('');
  chipWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;';
  const paintChips = () => {
    chipWrap.innerHTML = '';
    getLogChips().forEach(c => {
      const b = h('button', { textContent: (editMode ? '✕ ' : '') + c.label }, '');
      b.className = 'pill tap';
      b.style.cssText = 'cursor:pointer;font-size:13px;padding:8px 13px;' + (editMode ? 'color:var(--red);border-color:rgba(255,69,58,.4);' : '');
      b.onclick = () => {
        if (editMode) { saveLogChips(getLogChips().filter(x => x.id !== c.id)); paintChips(); }
        else { addLogEntry(c.label); renderScreen('log'); }
      };
      chipWrap.appendChild(b);
    });
    if (editMode) {
      const nb = h('button', { textContent: '+ Neuer Button' }, '');
      nb.className = 'pill tap';
      nb.style.cssText = 'cursor:pointer;font-size:13px;padding:8px 13px;color:var(--gold);border-color:rgba(10,132,255,.4);';
      nb.onclick = () => {
        const v = prompt('Text für den Schnell-Button (z. B. "🏋 Training 45m"):');
        if (v && v.trim()) { const a = getLogChips(); a.push({ id: 'c' + Date.now(), label: v.trim() }); saveLogChips(a); paintChips(); }
      };
      chipWrap.appendChild(nb);
    }
  };
  editBtn.onclick = () => { editMode = !editMode; editBtn.textContent = editMode ? 'Fertig' : 'Bearbeiten'; paintChips(); };
  paintChips();
  chipCard.appendChild(chipWrap);
  p.appendChild(chipCard);

  // Folder picker (folders + subfolders, fully user-managed)
  const folderRow = div('');
  folderRow.style.cssText = 'display:flex;gap:8px;align-items:center;';
  const sel = h('select', {}, '');
  sel.className = 'inp';
  sel.style.cssText = 'flex:1;font-size:13px;';
  const paintFolders = () => {
    sel.innerHTML = '';
    const o0 = h('option', { value: '', textContent: '📂 Ohne Ordner' }, ''); sel.appendChild(o0);
    getLogFolders().forEach(f => {
      const depth = f.split('/').length - 1;
      const o = h('option', { value: f, textContent: (depth ? '   '.repeat(depth) + '↳ ' : '📁 ') + f.split('/').pop() }, '');
      sel.appendChild(o);
    });
    const oNew = h('option', { value: '__new', textContent: '＋ Neuer Ordner…' }, ''); sel.appendChild(oNew);
    sel.value = LOG_FOLDER || '';
  };
  sel.onchange = () => {
    if (sel.value === '__new') {
      const path = prompt('Ordnerpfad (Unterordner mit „/", z. B. "Arbeit" oder "Arbeit/YouTube"):');
      if (path && path.trim()) {
        const clean = path.trim().replace(/^\/+|\/+$/g, '');
        const a = getLogFolders();
        // also create missing parent folders
        const parts = clean.split('/');
        for (let i = 1; i <= parts.length; i++) {
          const sub = parts.slice(0, i).join('/');
          if (!a.includes(sub)) a.push(sub);
        }
        saveLogFolders(a);
        LOG_FOLDER = clean;
      }
      paintFolders();
    } else {
      LOG_FOLDER = sel.value;
    }
  };
  paintFolders();
  const delF = h('button', { textContent: '🗑' }, '');
  delF.className = 'tap';
  delF.style.cssText = 'width:44px;height:46px;flex:none;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:16px;font-size:14px;';
  delF.title = 'Aktuellen Ordner löschen';
  delF.onclick = () => {
    if (!LOG_FOLDER) return;
    if (confirm('Ordner "' + LOG_FOLDER + '" (inkl. Unterordner) aus der Liste löschen? Einträge bleiben erhalten.')) {
      saveLogFolders(getLogFolders().filter(f => f !== LOG_FOLDER && !f.startsWith(LOG_FOLDER + '/')));
      LOG_FOLDER = '';
      renderScreen('log');
    }
  };
  folderRow.appendChild(sel); folderRow.appendChild(delF);
  p.appendChild(folderRow);

  // Free entry (with editable time — log things you forgot earlier)
  const addRow = div('');
  addRow.style.cssText = 'display:flex;gap:8px;';
  const timeI = h('input', { type: 'time', value: new Date().toTimeString().slice(0, 5) }, '');
  timeI.className = 'inp';
  timeI.style.cssText = 'width:92px;flex:none;font-size:14px;';
  const inp = h('input', { type: 'text', placeholder: 'Eintrag… z. B. "Deep Work 90m"', maxLength: 120 }, '');
  inp.className = 'inp';
  inp.style.cssText = 'flex:1;font-size:14px;';
  const ab = h('button', { textContent: '+' }, '');
  ab.className = 'btn btn-gold tap';
  ab.style.cssText = 'width:48px;height:48px;padding:0;flex-shrink:0;border-radius:16px;font-size:20px;';
  const add = () => { if (!inp.value.trim()) return; addLogEntry(inp.value, undefined, timeI.value); inp.value = ''; renderScreen('log'); };
  ab.onclick = add;
  inp.onkeydown = e => { if (e.key === 'Enter') add(); };
  addRow.appendChild(timeI); addRow.appendChild(inp); addRow.appendChild(ab);
  p.appendChild(addRow);
  p.appendChild(div('', '<div style="font-size:11px;color:var(--t-4);padding:0 4px;">Uhrzeit links anpassbar (auch nachträglich). Zahl + „m" (z. B. „45m") = Dauer. Ordner oben wählen.</div>'));

  // Timeline (with intelligent search across text + folder)
  const tl = div('label', 'HEUTE'); tl.style.cssText = 'font-size:10px;margin-top:2px;'; p.appendChild(tl);
  const tlSearch = h('input', { type: 'search', placeholder: '🔍 Einträge / Ordner durchsuchen…' }, '');
  if (entries.length >= 6) {
    tlSearch.className = 'inp'; tlSearch.style.cssText = 'width:100%;font-size:14px;margin-bottom:6px;';
    p.appendChild(tlSearch);
  }
  const tlWrap = div(''); tlWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;'; p.appendChild(tlWrap);

  // One timeline row — reused by the flat (search) and grouped (folder) views.
  const entryRow = e => {
    const row = div('row', '<span class="mono" style="font-size:13px;color:var(--gold);min-width:44px;">' + e.time + '</span>' +
      '<div style="flex:1;min-width:0;font-size:13px;color:var(--t-1);">' + e.text +
      (e.dur ? ' <span style="font-size:12px;color:var(--blue);">· ' + e.dur + ' Min</span>' : '') +
      (e.folder ? '<div style="font-size:11px;color:var(--t-3);margin-top:2px;">📁 ' + e.folder + '</div>' : '') + '</div>');
    // 📁 = Ordner dieses Eintrags nachträglich ändern (frei verschieben)
    const mv = h('button', { textContent: '📁' }, '');
    mv.style.cssText = 'background:none;color:var(--t-4);font-size:12px;padding:2px 4px;';
    mv.title = 'Ordner ändern';
    mv.onclick = () => {
      const opts = getLogFolders();
      const nv = prompt('Ordner für diesen Eintrag (leer = ohne):' + (opts.length ? '\nVorhanden: ' + opts.join(', ') : ''), e.folder || '');
      if (nv === null) return;
      const clean = nv.trim().replace(/^\/+|\/+$/g, '');
      const a = getLog(); const it = a.find(x => x.id === e.id); if (it) it.folder = clean || null;
      if (clean) { const fs = getLogFolders(); const parts = clean.split('/'); for (let i = 1; i <= parts.length; i++) { const sub = parts.slice(0, i).join('/'); if (!fs.includes(sub)) fs.push(sub); } saveLogFolders(fs); }
      saveLog(a); renderScreen('log');
    };
    const del = h('button', { textContent: '×' }, '');
    del.style.cssText = 'background:none;color:var(--t-4);font-size:15px;';
    del.onclick = () => { saveLog(getLog().filter(x => x.id !== e.id)); renderScreen('log'); };
    row.appendChild(mv); row.appendChild(del);
    return row;
  };

  const paintTL = () => {
    tlWrap.innerHTML = '';
    if (!entries.length) {
      const empty = div('glass', 'Noch nichts eingetragen. Nutze die Schnell-Buttons oder schreib frei rein.');
      empty.style.cssText = 'border-style:dashed;text-align:center;font-size:13px;color:var(--t-3);';
      tlWrap.appendChild(empty); return;
    }
    const q = tlSearch.value.trim().toLowerCase();
    if (q) { // flat filtered list while searching
      const list = entries.slice().reverse().filter(e => !q || (e.text || '').toLowerCase().includes(q) || (e.folder || '').toLowerCase().includes(q));
      if (!list.length) { tlWrap.appendChild(div('', '<div style="font-size:13px;color:var(--t-3);padding:8px 4px;">Nichts gefunden.</div>')); return; }
      list.forEach(e => tlWrap.appendChild(entryRow(e)));
      return;
    }
    // grouped by top-level folder into collapsible <details> ("Ohne Ordner" last)
    const groups = {};
    entries.slice().reverse().forEach(e => { const top = (e.folder || '').split('/')[0] || 'Ohne Ordner'; (groups[top] = groups[top] || []).push(e); });
    const named = Object.keys(groups).filter(k => k !== 'Ohne Ordner').sort();
    const order = named.concat(groups['Ohne Ordner'] ? ['Ohne Ordner'] : []);
    // If everything is unfoldered, just show the plain list (no wrapper).
    if (named.length === 0) { (groups['Ohne Ordner'] || []).forEach(e => tlWrap.appendChild(entryRow(e))); return; }
    order.forEach(k => {
      const mins = groups[k].reduce((a, e) => a + (e.dur || 0), 0);
      const det = document.createElement('details');
      det.className = 'glass'; det.style.cssText = 'padding:10px 14px;';
      det.open = true;
      det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">📁 ' + k +
        ' <span style="color:var(--t-3);font-weight:400;">· ' + groups[k].length + ' · ' + (mins >= 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + 'm') + '</span></summary>';
      const w = div(''); w.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:6px;';
      groups[k].forEach(e => w.appendChild(entryRow(e)));
      det.appendChild(w); tlWrap.appendChild(det);
    });
  };
  tlSearch.oninput = paintTL;
  paintTL();

  // Yesterday recap (collapsed)
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yEntries = ls('los_log_' + y.toDateString()) || [];
  if (yEntries.length) {
    const yBtn = h('button', { textContent: '◂ Gestern ansehen (' + yEntries.length + ')' }, '');
    yBtn.className = 'btn btn-ghost tap';
    yBtn.style.cssText = 'margin-top:2px;font-size:13px;';
    const yBox = div('glass', '');
    yBox.style.cssText = 'display:none;';
    yEntries.forEach((e, i) => {
      yBox.insertAdjacentHTML('beforeend', '<div style="display:flex;gap:10px;padding:5px 0;font-size:13px;color:var(--t-2);' + (i > 0 ? 'border-top:1px solid var(--edge);' : '') + '">' +
        '<span class="mono" style="color:var(--t-3);">' + e.time + '</span><span style="flex:1;">' + e.text + (e.folder ? ' <span style="color:var(--t-4);">· 📁 ' + e.folder + '</span>' : '') + '</span></div>');
    });
    yBtn.onclick = () => { yBox.style.display = yBox.style.display === 'none' ? 'block' : 'none'; };
    p.appendChild(yBtn); p.appendChild(yBox);
  }
}
