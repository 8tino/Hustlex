// ═══════════════════════════════════════════════════════
// KALENDER · Fixed weekly blocks (e.g. "Arbeit Mo–Fr 9–17") +
//   calendar import via .ics (paste / file / URL). Feeds the day
//   planner and the KI day design. Client-only & private:
//     los_fixed_blocks = [{id,label,icon,days:[0-6],start,end,type}]
//     los_calendar     = { url, events:[{title,date,start,end,allday,freq,byday:[0-6]}] }
//   (0=So … 6=Sa, matching JS getDay())
// ═══════════════════════════════════════════════════════

const WD_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const ICS_DAYMAP = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function getFixed() { return ls('los_fixed_blocks') || []; }
function saveFixed(a) { ls('los_fixed_blocks', a); }
function getCal() { return ls('los_calendar') || { url: '', events: [] }; }
function saveCal(c) { ls('los_calendar', c); }

function dstr(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

// ─── ICS PARSER (pragmatic: one-off + weekly recurring) ──
function parseICS(text) {
  const unfolded = String(text || '').replace(/\r?\n[ \t]/g, '');
  const events = [];
  const chunks = unfolded.split('BEGIN:VEVENT').slice(1);
  for (const ch of chunks) {
    const body = ch.split('END:VEVENT')[0];
    const get = re => { const m = body.match(re); return m ? m[1].trim() : ''; };
    const summary = get(/\nSUMMARY(?:;[^:]*)?:(.*)/) || get(/^SUMMARY(?:;[^:]*)?:(.*)/);
    const dtRaw = get(/\nDTSTART[^:\n]*:([^\n]*)/) || get(/^DTSTART[^:\n]*:([^\n]*)/);
    const deRaw = get(/\nDTEND[^:\n]*:([^\n]*)/) || get(/^DTEND[^:\n]*:([^\n]*)/);
    const rrule = get(/\nRRULE:([^\n]*)/) || get(/^RRULE:([^\n]*)/);
    if (!dtRaw) continue;
    const parseDT = v => {
      const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
      if (!m) return null;
      return { date: m[1] + '-' + m[2] + '-' + m[3], time: m[4] ? m[4] + ':' + m[5] : null };
    };
    const s = parseDT(dtRaw), e = deRaw ? parseDT(deRaw) : null;
    if (!s) continue;
    let freq = '', byday = [];
    if (rrule) {
      const fm = rrule.match(/FREQ=([A-Z]+)/); if (fm) freq = fm[1];
      const bd = rrule.match(/BYDAY=([A-Z,]+)/);
      if (bd) byday = bd[1].split(',').map(x => ICS_DAYMAP[x.slice(-2)]).filter(x => x != null);
    }
    // Weekly recurring with no BYDAY → recurs on its own weekday.
    if (freq === 'WEEKLY' && !byday.length) { const d = new Date(s.date + 'T00:00'); byday = [d.getDay()]; }
    events.push({
      title: (summary || 'Termin').replace(/\\,/g, ',').replace(/\\n/g, ' ').slice(0, 80),
      date: s.date, start: s.time, end: e ? e.time : null,
      allday: !s.time, freq, byday,
    });
  }
  return events;
}

// Events (from imported calendar) that fall on a given date.
function calEventsForDate(d) {
  const cal = getCal(); const ds = dstr(d), wd = d.getDay();
  return (cal.events || []).filter(ev => {
    if (ev.freq === 'WEEKLY') return ev.byday && ev.byday.includes(wd) && ev.date <= ds;
    return ev.date === ds;
  });
}

// Fixed weekly blocks active on a given weekday.
function fixedForDate(d) { const wd = d.getDay(); return getFixed().filter(f => (f.days || []).includes(wd)); }

// Fixed + calendar anchors for a given Date, normalised for the planner.
function anchorsForDate(d) {
  const out = [];
  fixedForDate(d).forEach(f => out.push({ title: f.label, icon: f.icon || '📌', start: f.start, end: f.end, type: f.type || 'work', anchor: 'fix:' + f.id }));
  calEventsForDate(d).forEach(ev => {
    if (ev.allday || !ev.start) return; // all-day events aren't time-blocks
    out.push({ title: ev.title, icon: '📅', start: ev.start, end: ev.end || minToTime(timeToMin(ev.start) + 60), type: 'work', anchor: 'cal:' + ev.title + ev.start });
  });
  return out.filter(a => a.start && a.end).sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
}
function todaysAnchors() { return anchorsForDate(new Date()); }

// Push a date's fixed + calendar anchors into that day's plan (no duplicates).
function materializeDay(dateStr) {
  const ds = dateStr || today();
  const p = getPlan(ds);
  let added = 0;
  anchorsForDate(new Date(ds)).forEach(a => {
    if (p.blocks.some(b => b.anchor === a.anchor)) return;
    p.blocks.push({ id: Date.now() + Math.floor(Math.random() * 9999), start: a.start, end: a.end, title: a.title, icon: a.icon, type: a.type, done: false, anchor: a.anchor });
    added++;
  });
  p.blocks.sort((x, y) => timeToMin(x.start) - timeToMin(y.start));
  savePlan(p, ds);
  return added;
}

// ─── MANAGER OVERLAY ──────────────────────────────────
const FIXED_PRESETS = [
  { label: 'Arbeit', icon: '💼', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5], type: 'work' },
  { label: 'Uni/Schule', icon: '🎓', start: '08:00', end: '15:00', days: [1, 2, 3, 4, 5], type: 'work' },
  { label: 'Training', icon: '🏋', start: '18:00', end: '19:30', days: [1, 3, 5], type: 'training' },
  { label: 'Schlaf', icon: '🌙', start: '23:00', end: '07:00', days: [0, 1, 2, 3, 4, 5, 6], type: 'sleep' },
];

function openKalender() {
  renderKalender();
  openOverlay();
}

function renderKalender() {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">KALENDER & FESTE ZEITEN</div>' +
    '<div class="h2" style="margin-bottom:6px;">Dein <span class="gold">Rhythmus</span></div>' +
    '<div style="font-size:13px;color:var(--t-3);line-height:1.5;margin-bottom:14px;">Feste Zeiten (z.B. Arbeit) laufen jede Woche automatisch. Dazu kannst du deinen Kalender importieren. Die KI plant den Rest drumherum.</div>');

  // ── Fixed weekly blocks ──
  inner.appendChild(div('label', 'FESTE WOCHENZEITEN'));
  const fixed = getFixed();
  if (!fixed.length) {
    const e = div('', 'Noch keine festen Zeiten. Tipp unten eine Vorlage an.');
    e.style.cssText = 'font-size:13px;color:var(--t-3);padding:2px 0 8px;';
    inner.appendChild(e);
  }
  fixed.forEach(f => {
    const card = div('glass', ''); card.style.cssText = 'padding:12px;margin-bottom:8px;';
    card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;">' +
      '<span style="font-size:20px;">' + (f.icon || '📌') + '</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + esc(f.label) + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:2px;">' + f.start + '–' + f.end + ' · ' + (f.days || []).map(d => WD_SHORT[d]).join(' ') + '</div></div></div>';
    const daysRow = div(''); daysRow.style.cssText = 'display:flex;gap:4px;margin-top:10px;flex-wrap:wrap;';
    for (let d = 1; d <= 6; d++) daysRow.appendChild(dayToggle(f, d));
    daysRow.appendChild(dayToggle(f, 0));
    card.appendChild(daysRow);
    const timeRow = div(''); timeRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:10px;';
    const ts = h('input', { type: 'time', value: f.start }); ts.className = 'inp'; ts.style.cssText = 'flex:1;font-size:14px;';
    ts.onchange = e => { const a = getFixed(); a.find(x => x.id === f.id).start = e.target.value; saveFixed(a); };
    const te = h('input', { type: 'time', value: f.end }); te.className = 'inp'; te.style.cssText = 'flex:1;font-size:14px;';
    te.onchange = e => { const a = getFixed(); a.find(x => x.id === f.id).end = e.target.value; saveFixed(a); };
    const del = h('button', { textContent: '×' }); del.style.cssText = 'background:none;color:var(--t-3);font-size:20px;flex:none;';
    del.onclick = () => { saveFixed(getFixed().filter(x => x.id !== f.id)); renderKalender(); };
    timeRow.appendChild(ts); timeRow.insertAdjacentHTML('beforeend', '<span style="color:var(--t-3);">–</span>'); timeRow.appendChild(te); timeRow.appendChild(del);
    card.appendChild(timeRow);
    inner.appendChild(card);
  });
  const presetRow = div(''); presetRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;';
  FIXED_PRESETS.forEach(pr => {
    const b = h('button', { textContent: '＋ ' + pr.icon + ' ' + pr.label });
    b.className = 'itab tap'; b.style.cssText = 'flex:0 0 auto;padding:8px 12px;text-transform:none;letter-spacing:0;font-size:13px;';
    b.onclick = () => { const a = getFixed(); a.push(Object.assign({ id: Date.now() }, pr)); saveFixed(a); materializeDay(); renderKalender(); showToast('Feste Zeit gesetzt & in heute übernommen', '📌'); };
    presetRow.appendChild(b);
  });
  inner.appendChild(presetRow);

  // ── Calendar import ──
  inner.appendChild(div('label', 'KALENDER IMPORTIEREN (.ICS)'));
  const cal = getCal();
  const info = div('', cal.events && cal.events.length ? '✓ ' + cal.events.length + ' Termine importiert' + (cal.url ? ' · ' + esc(cal.url.slice(0, 40)) : '') : 'Noch kein Kalender verbunden.');
  info.style.cssText = 'font-size:13px;color:var(--t-2);margin:2px 0 8px;';
  inner.appendChild(info);

  const urlInp = h('input', { type: 'url', value: cal.url || '', placeholder: 'ICS-/Webcal-URL (z.B. geheime iCal-Adresse)' });
  urlInp.className = 'inp'; urlInp.style.cssText = 'width:100%;font-size:13px;margin-bottom:8px;';
  inner.appendChild(urlInp);
  const urlBtn = h('button', { textContent: '↧ Von URL importieren' });
  urlBtn.className = 'btn btn-glass tap'; urlBtn.style.cssText = 'font-size:13px;margin-bottom:8px;';
  urlBtn.onclick = async () => {
    const u = urlInp.value.trim().replace(/^webcal:/i, 'https:'); if (!u) return;
    urlBtn.disabled = true; urlBtn.innerHTML = '<span class="anim-spin">⚙</span> lädt…';
    try {
      const res = await fetch(u); const txt = await res.text();
      const ev = parseICS(txt);
      if (!ev.length) throw new Error('keine Termine');
      saveCal({ url: u, events: ev }); haptic('success'); materializeDay(); renderKalender(); showToast(ev.length + ' Termine importiert', '📅');
    } catch (err) {
      urlBtn.disabled = false; urlBtn.textContent = '↧ Von URL importieren';
      showToast('URL-Import blockiert (CORS) – nutz Datei/Einfügen', '⚠');
    }
  };
  inner.appendChild(urlBtn);

  const fileInp = h('input', { type: 'file', accept: '.ics,text/calendar' });
  fileInp.style.cssText = 'display:block;width:100%;font-size:13px;color:var(--t-2);margin-bottom:8px;';
  fileInp.onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const ev = parseICS(r.result); if (ev.length) { saveCal({ url: getCal().url, events: ev }); haptic('success'); materializeDay(); renderKalender(); showToast(ev.length + ' Termine importiert', '📅'); } else showToast('Keine Termine in Datei', '⚠'); };
    r.readAsText(f);
  };
  inner.appendChild(fileInp);

  const pasteTa = h('textarea', { placeholder: 'oder ICS-Text hier einfügen…' });
  pasteTa.className = 'inp'; pasteTa.style.cssText = 'width:100%;min-height:60px;font-size:12px;resize:vertical;margin-bottom:8px;';
  inner.appendChild(pasteTa);
  const pasteBtn = h('button', { textContent: 'Aus Text importieren' });
  pasteBtn.className = 'btn btn-glass tap'; pasteBtn.style.cssText = 'font-size:13px;margin-bottom:14px;';
  pasteBtn.onclick = () => { const ev = parseICS(pasteTa.value); if (ev.length) { saveCal({ url: getCal().url, events: ev }); haptic('success'); materializeDay(); renderKalender(); showToast(ev.length + ' Termine importiert', '📅'); } else showToast('Keine Termine erkannt', '⚠'); };
  inner.appendChild(pasteBtn);

  // ── Today's anchors + apply ──
  const anchors = todaysAnchors();
  inner.appendChild(div('label', 'HEUTE FEST (' + anchors.length + ')'));
  if (!anchors.length) {
    const e = div('', 'Heute keine festen Zeiten/Termine.'); e.style.cssText = 'font-size:13px;color:var(--t-3);padding:2px 0 8px;';
    inner.appendChild(e);
  }
  anchors.forEach(a => {
    const r = div('row', ''); r.innerHTML = '<span style="font-size:18px;">' + a.icon + '</span>' +
      '<div style="flex:1;"><div style="font-size:14px;color:var(--t-1);">' + esc(a.title) + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);">' + a.start + '–' + a.end + '</div></div>';
    inner.appendChild(r);
  });
  if (anchors.length) {
    const apply = h('button', { textContent: '↓  IN HEUTIGEN TAGESPLAN EINSETZEN' });
    apply.className = 'btn btn-gold tap'; apply.style.marginTop = '8px';
    apply.onclick = () => { const n = materializeDay(); closeOverlay(); if (STATE.view === 'fokus') renderScreen('fokus'); showToast(n + ' feste Blöcke eingesetzt', '📌'); };
    inner.appendChild(apply);
  }
}

function dayToggle(f, d) {
  const on = (f.days || []).includes(d);
  const b = h('button', { textContent: WD_SHORT[d] });
  b.className = 'tap';
  b.style.cssText = 'width:34px;height:32px;border-radius:9px;font-size:12px;border:1px solid ' + (on ? pColor() : 'var(--edge)') + ';background:' + (on ? pColor() + '22' : 'transparent') + ';color:' + (on ? pColor() : 'var(--t-3)') + ';';
  b.onclick = () => {
    const a = getFixed(); const ff = a.find(x => x.id === f.id);
    ff.days = ff.days || [];
    if (ff.days.includes(d)) ff.days = ff.days.filter(x => x !== d); else ff.days.push(d);
    saveFixed(a); renderKalender();
  };
  return b;
}
