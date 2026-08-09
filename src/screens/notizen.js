// ═══════════════════════════════════════════════════════
// NOTIZEN-IMPORT · Paste a wall of notes → the tool splits it
//   into lines, suggests a target area for each (Task, Log, Ziel,
//   Journal, Ausgabe …), you re-order/adjust, then it inserts each
//   line into the right place. Works WITHOUT the AI key (keyword
//   heuristic); the "✦ KI sortieren" button refines it when a key
//   is configured.
// ═══════════════════════════════════════════════════════

const NOTE_TARGETS = [
  { v: 'task',     l: '☑  Task (täglich)' },
  { v: 'log',      l: '◷  Log-Eintrag' },
  { v: 'nn',       l: '◆  Non-Negotiable' },
  { v: 'idee',     l: '◎  Tagesplan-Idee' },
  { v: 'ziel',     l: '◇  Ziel' },
  { v: 'wert',     l: '♥  Wert' },
  { v: 'lernen',   l: '✎  Lernliste' },
  { v: 'journal',  l: '✒  Journal / Dankbar' },
  { v: 'ausgabe',  l: '€  Ausgabe' },
  { v: 'einnahme', l: '€  Einnahme' },
  { v: 'vorbild',  l: '★  Vorbild' },
  { v: 'ignore',   l: '–  Ignorieren' },
];
const NOTE_TARGET_LBL = Object.fromEntries(NOTE_TARGETS.map(t => [t.v, t.l.replace(/^\S+\s+/, '')]));

let NOTES_IMPORT = { items: [] };

// ─── Heuristik: welcher Bereich passt am ehesten? ─────
function suggestNoteTarget(line) {
  const s = line.toLowerCase();
  // money first
  if (/(\d+[.,]?\d*)\s*(€|eur|euro)|ausgegeben|bezahlt|gekostet|gekauft für|rechnung/.test(s)) return 'ausgabe';
  if (/gehalt|verdient|einnahme|honorar|ausgezahlt|überwiesen bekommen/.test(s)) return 'einnahme';
  // an explicit duration means it already happened → log (beats "lesen"→lernen)
  if (/(^|\s)\d+\s*(m|min|h|std|stunde)\b/.test(s)) return 'log';
  if (/dankbar|danke |grateful|schätze/.test(s)) return 'journal';
  if (/vorbild|bewundere|wie .+ werden|idol/.test(s)) return 'vorbild';
  if (/lernen|kurs\b|buch|skill|üben|tutorial|studieren|recherchieren/.test(s)) return 'lernen';
  if (/\bziel\b|will ich|möchte ich|erreichen|traum|vision|langfristig|bis 20\d\d/.test(s)) return 'ziel';
  if (/gemacht|gearbeitet|trainiert|gegessen|getrunken|geschlafen|gejoggt|gelesen|gelaufen/.test(s)) return 'log';
  if (/muss unbedingt|auf jeden fall|non.?negotiable|das wichtigste|heute zwingend/.test(s)) return 'nn';
  if (/kaufen|besorgen|anrufen|mailen|schreiben an|termin|buchen|abgeben|erledigen|aufräumen|putzen|waschen|bezahlen|checken/.test(s)) return 'task';
  return 'task';
}

function parseNoteAmount(text) {
  const m = text.replace(/\./g, '').match(/(\d+[.,]?\d*)/);
  return m ? Math.abs(parseFloat(m[1].replace(',', '.'))) : 0;
}

// Split a pasted blob into clean candidate lines.
function splitNotes(raw) {
  return (raw || '')
    .split(/[\r\n]+|(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
    // strip list bullets ("- ", "• ", "1. ", "2) ") but keep content numbers like "15€"
    .map(l => l.replace(/^\s*(?:[-*•·–—◦]+\s+|\d{1,3}[.)]\s+)/, '').trim())
    .filter(l => l.length >= 2);
}

// Route one line into the correct store (reuses the assistant handlers).
function insertNote(target, text) {
  text = (text || '').trim();
  if (!text || target === 'ignore') return null;
  switch (target) {
    case 'task':     return runAssistantTool('add_daily_task', { text });
    case 'log':      return runAssistantTool('log_activity', { text });
    case 'nn':       return runAssistantTool('add_non_negotiable', { text });
    case 'idee':     return runAssistantTool('add_task', { text });
    case 'ziel':     return runAssistantTool('add_goal', { text });
    case 'wert':     return runAssistantTool('add_value', { text });
    case 'lernen':   return runAssistantTool('add_learning', { text });
    case 'journal':  return runAssistantTool('add_journal_gratitude', { text });
    case 'ausgabe':  return runAssistantTool('log_expense', { amount: parseNoteAmount(text), note: text });
    case 'einnahme': return runAssistantTool('log_income', { amount: parseNoteAmount(text), note: text });
    case 'vorbild':  return runAssistantTool('add_role_model', { name: text });
    default:         return null;
  }
}

// ─── OVERLAY UI ───────────────────────────────────────
function openNotesImport() {
  NOTES_IMPORT = { items: [] };
  renderNotesImport();
  openOverlay();
}

function renderNotesImport() {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">NOTIZEN-IMPORT</div>' +
    '<div class="h2" style="margin-bottom:6px;">Notizen <span class="gold">einsortieren</span></div>' +
    '<div style="font-size:13px;color:var(--t-3);line-height:1.55;margin-bottom:16px;">' +
    'Füg deine Notizen ein — das Tool teilt sie in Zeilen und schlägt für jede einen Bereich vor. Du korrigierst, dann wird alles automatisch eingetragen.</div>');

  if (!NOTES_IMPORT.items.length) {
    // ── Step A: paste ──
    const ta = h('textarea', { placeholder: 'Hier alle Notizen einfügen…\n\nz.B.\nMilch & Eier kaufen\n2h an YouTube-Video gearbeitet\nWill dieses Jahr 100kg Bankdrücken\nDankbar für meine Familie\n32€ für Essen ausgegeben' });
    ta.className = 'inp';
    ta.style.cssText = 'width:100%;min-height:190px;resize:vertical;font-size:14px;line-height:1.5;';
    inner.appendChild(ta);

    const analyze = h('button', { textContent: 'ANALYSIEREN' });
    analyze.className = 'btn btn-gold tap';
    analyze.style.marginTop = '12px';
    analyze.onclick = () => {
      const lines = splitNotes(ta.value);
      if (!lines.length) { showToast('Keine Zeilen erkannt', '⚠'); return; }
      NOTES_IMPORT.items = lines.map((text, i) => ({ id: Date.now() + i, text, target: suggestNoteTarget(text) }));
      renderNotesImport();
    };
    inner.appendChild(analyze);
    return;
  }

  // ── Step B: review + assign ──
  const head = div('');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;';
  head.innerHTML = '<div class="label">' + NOTES_IMPORT.items.length + ' ZEILEN · BEREICH WÄHLEN</div>';
  const aiBtn = h('button', { textContent: '✦ KI sortieren' });
  aiBtn.style.cssText = 'background:none;color:' + pColor() + ';font-size:12px;font-weight:600;';
  aiBtn.onclick = () => notesAISort(aiBtn);
  head.appendChild(aiBtn);
  inner.appendChild(head);

  NOTES_IMPORT.items.forEach(it => {
    const card = div('glass', '');
    card.style.cssText = 'padding:12px;margin-bottom:8px;';
    const row1 = div('');
    row1.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
    const txt = h('textarea', { value: it.text });
    txt.className = 'inp';
    txt.style.cssText = 'flex:1;min-height:38px;font-size:14px;line-height:1.4;resize:vertical;padding:9px 11px;';
    txt.oninput = e => { it.text = e.target.value; };
    const del = h('button', { textContent: '×' });
    del.style.cssText = 'background:none;color:var(--t-3);font-size:20px;flex:none;padding:2px 6px;';
    del.onclick = () => { NOTES_IMPORT.items = NOTES_IMPORT.items.filter(x => x.id !== it.id); renderNotesImport(); };
    row1.appendChild(txt); row1.appendChild(del);
    card.appendChild(row1);

    const sel = h('select', {});
    sel.className = 'inp';
    sel.style.cssText = 'width:100%;margin-top:8px;font-size:13px;padding:9px 11px;';
    NOTE_TARGETS.forEach(t => {
      const o = h('option', { value: t.v, textContent: t.l });
      if (t.v === it.target) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = e => { it.target = e.target.value; };
    card.appendChild(sel);
    inner.appendChild(card);
  });

  const addLine = h('button', { textContent: '＋ Zeile' });
  addLine.className = 'btn btn-glass tap';
  addLine.style.cssText = 'margin-top:2px;font-size:12px;';
  addLine.onclick = () => { NOTES_IMPORT.items.push({ id: Date.now(), text: '', target: 'task' }); renderNotesImport(); };
  inner.appendChild(addLine);

  const save = h('button', { textContent: '✓  ALLE EINTRAGEN' });
  save.className = 'btn btn-gold tap';
  save.style.marginTop = '10px';
  save.onclick = () => {
    let n = 0;
    NOTES_IMPORT.items.forEach(it => {
      if (it.target === 'ignore' || !it.text.trim()) return;
      insertNote(it.target, it.text); n++;
    });
    closeOverlay();
    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (STATE.view) renderScreen(STATE.view);
    haptic('success');
    showToast(n + ' Einträge einsortiert', '📥');
  };
  inner.appendChild(save);

  const back = h('button', { textContent: '← Andere Notizen' });
  back.className = 'btn btn-ghost tap';
  back.style.cssText = 'margin-top:8px;font-size:12px;';
  back.onclick = () => { NOTES_IMPORT.items = []; renderNotesImport(); };
  inner.appendChild(back);
}

// Refine the target assignment with the AI (no-op-friendly if no key).
async function notesAISort(btn) {
  const orig = btn.textContent;
  btn.textContent = '⚙ …'; btn.disabled = true;
  try {
    const list = NOTES_IMPORT.items.map((it, i) => i + ': ' + it.text).join('\n');
    const valids = NOTE_TARGETS.map(t => t.v).join(', ');
    const prompt = 'Ordne jede Notiz-Zeile einem Bereich zu. Bereiche: ' + valids + '.\n' +
      '- task: konkrete To-dos/Besorgungen\n- log: bereits Getanes (mit Zeit/Dauer)\n- nn: heute zwingend\n- idee: für den Tagesplan\n- ziel: langfristige Ziele\n- wert: Werte/Prinzipien\n- lernen: Lernen/Skills\n- journal: Dankbarkeit/Reflexion\n- ausgabe/einnahme: Geld\n- vorbild: bewunderte Personen\n- ignore: unbrauchbar\n\nZEILEN:\n' + list +
      '\n\nAntworte NUR als JSON-Array [{"i":0,"target":"task"}], nichts sonst.';
    const txt = await callAI(prompt, 'Du bist ein präziser Sortier-Assistent. Antworte nur mit gültigem JSON.', 800);
    let j = txt.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const a = j.indexOf('['), b = j.lastIndexOf(']');
    if (a >= 0 && b >= 0) j = j.slice(a, b + 1);
    const arr = JSON.parse(j);
    arr.forEach(r => { if (NOTES_IMPORT.items[r.i] && NOTE_TARGET_LBL[r.target]) NOTES_IMPORT.items[r.i].target = r.target; });
    renderNotesImport();
    showToast('KI hat sortiert', '✦');
  } catch (e) {
    btn.textContent = orig; btn.disabled = false;
    showToast('KI nicht verfügbar – bitte manuell wählen', '⚠');
  }
}
