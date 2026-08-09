// ═══════════════════════════════════════════════════════
// ASSISTANT · In-app AI chat with tool-use.
//   Answers questions with full app context AND performs actions
//   (add goals, non-negotiables, tasks, water, habits, …) via tools.
//   All AI calls go through the Supabase Edge Function (aiFetch).
// ═══════════════════════════════════════════════════════

const ASSIST = { msgs: [], busy: false };

// Jedes Tool gehört zu einem Bereich. Ein in den KI-Berechtigungen
// (los_ai_scopes) gesperrter Bereich → Tool wird der KI gar nicht erst
// angeboten UND bei Ausführung zusätzlich hart geblockt.
const TOOL_AREA = {
  add_goal: 'ziele', add_value: 'ziele', add_habit: 'koerper',
  add_non_negotiable: 'aufgaben', add_task: 'aufgaben', add_daily_task: 'aufgaben', log_activity: 'aufgaben',
  log_water: 'koerper', complete_habit: 'koerper',
  add_learning: 'wissen', add_journal_gratitude: 'wissen', add_role_model: 'wissen',
  log_expense: 'finanzen', log_income: 'finanzen',
  create_course: 'kurse',
};

// ─── Tools the model may call (gefiltert nach Berechtigungen) ─────────────
function assistantTools() {
  const all = [
    { name: 'create_course', description: 'Erstellt per KI einen kompletten Kurs (Lektionen + Prüfung) zu einem Thema und speichert ihn unter Kurse. Nutze das, wenn der Nutzer einen Kurs/ein Lernmodul will.', input_schema: { type: 'object', properties: {
        topic: { type: 'string', description: 'Thema des Kurses, z. B. "Grundlagen des Investierens"' } }, required: ['topic'] } },
    { name: 'add_goal', description: 'Legt ein neues Ziel an.', input_schema: { type: 'object', properties: {
        text: { type: 'string' }, why: { type: 'string' },
        cat: { type: 'string', enum: ['kurzfristig', 'mittelfristig', 'langfristig'] },
        steps: { type: 'number', description: 'Anzahl Teilschritte bis zum Ziel' } }, required: ['text'] } },
    { name: 'add_habit', description: 'Legt eine neue Gewohnheit im Habit-Tracker an. freq: daily | week | days. Bei week: n = Tage pro Woche. Bei days: days = Array von Wochentagen (0=So…6=Sa).', input_schema: { type: 'object', properties: {
        name: { type: 'string' }, icon: { type: 'string' }, freq: { type: 'string', enum: ['daily', 'week', 'days'] }, n: { type: 'number' }, days: { type: 'array', items: { type: 'number' } } }, required: ['name'] } },
    { name: 'add_non_negotiable', description: 'Fügt ein Non-Negotiable für heute hinzu (max 7).', input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
    { name: 'add_task', description: 'Fügt eine Aufgabe zum Brain Dump des Tagesplans hinzu.', input_schema: { type: 'object', properties: {
        text: { type: 'string' }, duration: { type: 'number' }, priority: { type: 'string', enum: ['normal', 'high'] } }, required: ['text'] } },
    { name: 'log_water', description: 'Trägt getrunkenes Wasser in Millilitern ein.', input_schema: { type: 'object', properties: { ml: { type: 'number' } }, required: ['ml'] } },
    { name: 'complete_habit', description: 'Markiert eine Tages-Quest als erledigt. Gültige IDs: ' + HABITS.map(h => h.id).join(', '), input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'add_value', description: 'Fügt einen persönlichen Wert hinzu.', input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
    { name: 'add_learning', description: 'Fügt einen Eintrag zur Lernliste hinzu.', input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
    { name: 'add_journal_gratitude', description: 'Ergänzt einen Dankbarkeits-Eintrag im heutigen Journal.', input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
    { name: 'log_expense', description: 'Trägt eine Ausgabe in den Finanz-Tracker ein.', input_schema: { type: 'object', properties: { amount: { type: 'number' }, category: { type: 'string', enum: ['essen', 'wohnen', 'transport', 'freizeit', 'gesundheit', 'sonstiges'] }, note: { type: 'string' } }, required: ['amount'] } },
    { name: 'log_income', description: 'Trägt eine Einnahme in den Finanz-Tracker ein.', input_schema: { type: 'object', properties: { amount: { type: 'number' }, note: { type: 'string' } }, required: ['amount'] } },
    { name: 'add_role_model', description: 'Fügt ein Vorbild (bewunderte Person) hinzu, aus dem später ein Lern-Kurs gebaut wird.', input_schema: { type: 'object', properties: { name: { type: 'string' }, why: { type: 'string' } }, required: ['name'] } },
    { name: 'add_daily_task', description: 'Legt eine täglich wiederkehrende Aufgabe im Tasks-Reiter an.', input_schema: { type: 'object', properties: { text: { type: 'string' }, icon: { type: 'string' } }, required: ['text'] } },
    { name: 'log_activity', description: 'Schreibt einen Eintrag ins heutige Log (Aktivität, optional mit Dauer in Minuten).', input_schema: { type: 'object', properties: { text: { type: 'string' }, minutes: { type: 'number' } }, required: ['text'] } },
  ];
  const allow = a => typeof aiScopeAllowed !== 'function' || aiScopeAllowed(a);
  return all.filter(t => allow(TOOL_AREA[t.name] || 'ziele'));
}

function assistantContext() {
  const allow = a => typeof aiScopeAllowed !== 'function' || aiScopeAllowed(a);
  const t = getTotals();
  const sh = getSleepHours();
  const disc = (typeof getDiscState === 'function') ? getDiscState() : { streak: 0 };
  const nn = (typeof getNN === 'function') ? getNN() : { items: [] };
  const lines = [
    'Du bist der LifeOS-Assistent: knapp, direkt, motivierend, auf Deutsch.',
    'Du kannst Aktionen per Tool ausführen (Ziele, Aufgaben, Gewohnheiten, Kurse, Journal, Finanzen …). Nutze ein Tool NUR, wenn der Nutzer wirklich etwas anlegen/eintragen will; sonst antworte einfach. Bestätige ausgeführte Aktionen in einem kurzen Satz.',
    '',
    'NUTZER-KONTEXT:',
    '- Name: ' + (STATE.profile?.name || '?') + ' · Level ' + getLvl(STATE.totalXP).l + ' · ' + STATE.totalXP + ' XP · Streak ' + disc.streak,
  ];
  if (allow('ziele')) lines.push('- Ziel(e): ' + (STATE.profile?.goalNames || goalP().name));
  if (allow('koerper')) {
    lines.push('- Körper heute: ' + STATE.day.habits.length + ' Habits · Protein ' + t.p + 'g · Wasser ' + STATE.day.water + 'ml · Schlaf ' + (sh || '?') + 'h · Energie ' + (STATE.day.energy || '?') + '/5');
    lines.push('- Habit-IDs: ' + HABITS.map(h => h.id + '=' + h.label).join(', '));
  }
  if (allow('aufgaben')) lines.push('- Non-Negotiables heute: ' + (nn.items.map(i => i.text + (i.done ? ' ✓' : '')).join('; ') || 'keine'));
  // Gesperrte Bereiche der KI klar mitteilen.
  const blocked = ['koerper', 'aufgaben', 'ziele', 'kurse', 'wissen', 'finanzen'].filter(a => !allow(a));
  if (blocked.length) lines.push('', 'GESPERRT (kein Zugriff, nicht darauf eingehen): ' + blocked.join(', '));
  lines.push('', 'Antworten kurz halten (2–5 Sätze).');
  return lines.join('\n');
}

async function runAssistantTool(name, input) {
  input = input || {};
  // Hartes Berechtigungs-Gate: gesperrter Bereich → Aktion verweigern.
  const area = TOOL_AREA[name];
  if (area && typeof aiScopeAllowed === 'function' && !aiScopeAllowed(area)) {
    return '⛔ Zugriff auf „' + area + '" ist gesperrt — Aktion nicht ausgeführt.';
  }
  try {
    switch (name) {
      case 'create_course': {
        const topic = (input.topic || '').trim();
        if (!topic) return 'Thema fehlt.';
        const prompt = 'Entwirf einen kompakten Selbstlern-Kurs zum Thema "' + topic + '". ' +
          '4–6 Lektionen mit je 4–8 Sätzen echtem Lehrinhalt (kein Platzhalter), danach 5 Multiple-Choice-Prüfungsfragen mit je 4 Optionen. ' +
          'Antworte NUR als JSON: {"title":"","desc":"","icon":"📚","lessons":[{"title":"","content":""}],"exam":[{"q":"","options":["","","",""],"answer":0}]}';
        const txt = await callAI(prompt, 'Du bist ein Kurs-Autor. Antworte ausschließlich mit gültigem JSON.', 2600, typeof BEST_AI_MODEL !== 'undefined' ? BEST_AI_MODEL : undefined);
        let j = txt.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
        const a = j.indexOf('{'), b = j.lastIndexOf('}'); if (a >= 0 && b >= 0) j = j.slice(a, b + 1);
        const data = JSON.parse(j);
        const course = {
          id: Date.now(), title: data.title || topic, desc: data.desc || '', icon: data.icon || '📚', color: pColor(),
          lessons: (data.lessons || []).map((l, i) => ({ id: Date.now() + i, title: l.title || ('Lektion ' + (i + 1)), content: l.content || '', done: false })),
          exam: (data.exam || []).map(q => ({ q: q.q || '', options: (q.options || []).slice(0, 4), answer: typeof q.answer === 'number' ? q.answer : 0 })),
          passPct: 80, passed: false, certDate: null, bestScore: 0, createdAt: Date.now(),
        };
        const list = getCourses(); list.push(course); saveCourses(list);
        return 'Kurs „' + course.title + '" erstellt (' + course.lessons.length + ' Lektionen, ' + course.exam.length + ' Prüfungsfragen) — unter Wachstum → Kurse.';
      }
      case 'add_habit': {
        const a = getHabits ? getHabits() : (ls('los_habits') || []);
        const col = (typeof HABIT_COLORS !== 'undefined') ? HABIT_COLORS[a.length % HABIT_COLORS.length] : '#0A84FF';
        const freq = ['daily', 'week', 'days'].includes(input.freq) ? input.freq : 'daily';
        const hb = { id: Date.now(), icon: input.icon || '🎯', name: input.name, color: col, freq, n: Math.min(7, Math.max(1, parseInt(input.n) || 3)), days: Array.isArray(input.days) ? input.days.filter(x => x >= 0 && x <= 6) : [1, 3, 5], history: [] };
        if (freq === 'days' && !hb.days.length) hb.days = [1, 3, 5];
        a.push(hb); (typeof saveHabits === 'function' ? saveHabits : (v => ls('los_habits', v)))(a);
        return 'Gewohnheit „' + hb.name + '" angelegt (' + (typeof habitFreqLabel === 'function' ? habitFreqLabel(hb) : freq) + ').';
      }
      case 'add_goal': {
        const z = ls('los_ziele') || [];
        z.push({ id: Date.now(), text: input.text, why: input.why || '', cat: input.cat || 'langfristig', done: false, progress: 0, maxProgress: input.steps || 10, subs: [] });
        ls('los_ziele', z); addXP(10, 'goals');
        return 'Ziel "' + input.text + '" angelegt.';
      }
      case 'add_non_negotiable': {
        const before = getNN().items.length;
        addNN(input.text);
        return getNN().items.length > before ? 'Non-Negotiable "' + input.text + '" hinzugefügt.' : 'Konnte nicht hinzufügen (Max 7 erreicht).';
      }
      case 'add_task': {
        const p = getPlan();
        p.brainDump.push({ id: Date.now(), text: input.text, duration: input.duration || null, priority: input.priority || 'normal' });
        savePlan(p);
        return 'Aufgabe "' + input.text + '" zum Tagesplan hinzugefügt.';
      }
      case 'log_water': {
        const ml = Math.max(0, parseInt(input.ml) || 0);
        STATE.day.water = Math.min((STATE.day.water || 0) + ml, 5000); saveDay();
        return ml + 'ml eingetragen — gesamt ' + STATE.day.water + 'ml.';
      }
      case 'complete_habit': {
        const hb = HABITS.find(h => h.id === input.id);
        if (!hb) return 'Unbekannte Habit-ID: ' + input.id;
        if (STATE.day.habits.includes(hb.id)) return hb.label + ' ist bereits erledigt.';
        STATE.day.habits.push(hb.id); STATE.day.xp += hb.xp; addXP(hb.xp, hb.cat); saveDay();
        return hb.label + ' erledigt (+' + hb.xp + ' XP).';
      }
      case 'add_value': {
        const w = ls('los_werte') || [];
        w.push({ id: Date.now(), text: input.text }); ls('los_werte', w);
        return 'Wert "' + input.text + '" hinzugefügt.';
      }
      case 'add_learning': {
        const d = ls('los_lernen') || { learning: [], mastered: [], review: [] };
        d.learning.push({ id: Date.now(), text: input.text, note: '', added: new Date().toLocaleDateString('de-DE') });
        ls('los_lernen', d);
        return 'Zur Lernliste: "' + input.text + '".';
      }
      case 'add_journal_gratitude': {
        const k = 'los_j_' + new Date().toDateString();
        const e = ls(k) || { dankbar: ['', '', ''], gelernt: '', intention: '', freitext: '', mood: null };
        const slot = e.dankbar.findIndex(x => !x);
        if (slot >= 0) e.dankbar[slot] = input.text; else e.dankbar.push(input.text);
        ls(k, e);
        return 'Dankbarkeit ergänzt: "' + input.text + '".';
      }
      case 'log_expense': {
        const amt = Math.abs(parseFloat(input.amount) || 0); if (!amt) return 'Betrag fehlt.';
        const f = getFin(); f.tx.push({ id: Date.now(), amount: amt, type: 'out', cat: input.category || 'sonstiges', note: input.note || '', date: new Date().toISOString() }); saveFin(f);
        return 'Ausgabe ' + eur(amt) + ' eingetragen.';
      }
      case 'log_income': {
        const amt = Math.abs(parseFloat(input.amount) || 0); if (!amt) return 'Betrag fehlt.';
        const f = getFin(); f.tx.push({ id: Date.now(), amount: amt, type: 'in', cat: 'extra', note: input.note || '', date: new Date().toISOString() }); saveFin(f);
        return 'Einnahme ' + eur(amt) + ' eingetragen.';
      }
      case 'add_role_model': {
        const a = getVorbilder();
        a.push({ id: Date.now(), name: input.name, why: input.why || '', course: null });
        saveVorbilder(a);
        return 'Vorbild "' + input.name + '" hinzugefügt — Kurs kannst du in Wachstum → Vorbilder erstellen.';
      }
      case 'add_daily_task': {
        const a = getTasks();
        a.push({ id: Date.now(), icon: input.icon || '', text: input.text });
        saveTasks(a);
        return 'Tägliche Aufgabe "' + input.text + '" angelegt.';
      }
      case 'log_activity': {
        addLogEntry(input.text + (input.minutes ? ' ' + input.minutes + 'm' : ''));
        return 'Ins Log eingetragen: "' + input.text + '".';
      }
      default: return 'Unbekanntes Tool: ' + name;
    }
  } catch (e) {
    return 'Fehler bei ' + name + ': ' + e.message;
  }
}

// ─── UI ───────────────────────────────────────────────
function initAssistant() {
  if (el('assist_fab')) return;
  const fab = h('button', { id: 'assist_fab', textContent: '✦' }, '');
  fab.className = 'assist-fab tap';
  fab.title = 'KI-Assistent';
  fab.onclick = openAssistant;
  document.body.appendChild(fab);

  const panel = div('');
  panel.id = 'assist';
  panel.innerHTML =
    '<div class="assist-backdrop"></div>' +
    '<div class="assist-sheet">' +
      '<div class="assist-head">' +
        '<div class="label gold">✦ LIFEOS ASSISTENT</div>' +
        '<button id="assist_close" class="tap" style="background:none;color:var(--t-3);font-size:18px;">×</button>' +
      '</div>' +
      '<div id="assist_msgs" class="assist-msgs"></div>' +
      '<div class="assist-input">' +
        '<button id="assist_mic" class="btn btn-glass tap" style="width:46px;height:46px;padding:0;flex-shrink:0;border-radius:var(--r-md);font-size:18px;" title="Sprechen">🎤</button>' +
        '<input id="assist_inp" class="inp" type="text" placeholder="Sag oder schreib, was dir fehlt…"/>' +
        '<button id="assist_send" class="btn btn-gold tap" style="width:46px;height:46px;padding:0;flex-shrink:0;border-radius:var(--r-md);font-size:18px;">➤</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(panel);

  panel.querySelector('.assist-backdrop').onclick = closeAssistant;
  el('assist_close').onclick = closeAssistant;
  el('assist_send').onclick = assistantSend;
  el('assist_mic').onclick = assistantVoice;
  el('assist_inp').onkeydown = e => { if (e.key === 'Enter') assistantSend(); };
}

function openAssistant() {
  el('assist').classList.add('on');
  if (!ASSIST.msgs.length) {
    el('assist_msgs').innerHTML =
      '<div class="assist-bubble assist-ai">Hi ' + (STATE.profile?.name || '') + '! Ich kann Fragen zu deinem Tag beantworten oder Dinge eintragen — z. B. „füge das Ziel 100kg Bankdrücken hinzu", „log 500ml Wasser", „mach Training als erledigt".</div>';
  }
  setTimeout(() => el('assist_inp').focus(), 60);
}
function closeAssistant() { el('assist').classList.remove('on'); }

function assistantRender() {
  const box = el('assist_msgs');
  let html = '';
  ASSIST.msgs.forEach(m => {
    if (m.role === 'user' && typeof m.content === 'string') {
      html += '<div class="assist-bubble assist-me">' + escapeHtml(m.content) + '</div>';
    } else if (m.role === 'assistant' && Array.isArray(m.content)) {
      m.content.forEach(b => {
        if (b.type === 'text' && b.text.trim()) html += '<div class="assist-bubble assist-ai">' + escapeHtml(b.text) + '</div>';
        else if (b.type === 'tool_use') html += '<div class="assist-action">⚙ ' + b.name.replace(/_/g, ' ') + '</div>';
      });
    } else if (m.role === 'user' && Array.isArray(m.content)) {
      m.content.forEach(b => { if (b.type === 'tool_result') html += '<div class="assist-result">✓ ' + escapeHtml(String(b.content)) + '</div>'; });
    }
  });
  if (ASSIST.busy) html += '<div class="assist-bubble assist-ai"><span class="anim-spin">⚙</span> denkt…</div>';
  box.innerHTML = html;
  box.scrollTop = box.scrollHeight;
}
function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

// BYOK-aware: nutzt das eigene Claude-Konto direkt (mit Tools), sonst Edge Function.
async function assistantFetch(payload) {
  const byok = ls('los_byok');
  if (byok && byok.on && byok.key) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': byok.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: byok.model || (typeof BEST_AI_MODEL !== 'undefined' ? BEST_AI_MODEL : 'claude-opus-5'), max_tokens: payload.max_tokens, system: payload.system, tools: payload.tools, messages: payload.messages }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.error?.message || ('KI-Fehler ' + r.status));
    return d;
  }
  return aiFetch(payload);
}

// Spracheingabe: Mikro antippen → sprechen → Text landet im Feld & wird gesendet.
function assistantVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = el('assist_mic');
  if (!SR) { showToast('Spracheingabe wird hier nicht unterstützt', '⚠'); return; }
  if (ASSIST.rec) { try { ASSIST.rec.stop(); } catch (_) {} return; }
  const rec = new SR(); rec.lang = 'de-DE'; rec.interimResults = true; rec.continuous = false;
  ASSIST.rec = rec;
  const stop = () => { mic.textContent = '🎤'; mic.style.color = ''; mic.style.background = ''; ASSIST.rec = null; };
  mic.textContent = '⏺'; mic.style.color = '#fff'; mic.style.background = 'var(--red)';
  let finalText = '';
  rec.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript; }
    el('assist_inp').value = (finalText + interim).trim();
  };
  rec.onerror = ev => { stop(); if (ev && ev.error === 'not-allowed') showToast('Mikrofon-Zugriff nötig', '🎤'); };
  rec.onend = () => { stop(); const v = (el('assist_inp').value || '').trim(); if (v) assistantSend(); };
  try { rec.start(); haptic('light'); } catch (_) { stop(); }
}

async function assistantSend() {
  if (ASSIST.busy) return;
  const inp = el('assist_inp');
  const text = (inp.value || '').trim();
  if (!text) return;
  inp.value = '';
  ASSIST.msgs.push({ role: 'user', content: text });
  ASSIST.busy = true;
  assistantRender();

  try {
    let didAction = false;
    for (let i = 0; i < 5; i++) {
      const data = await assistantFetch({
        system: assistantContext(),
        max_tokens: 1024,
        tools: assistantTools(),
        messages: ASSIST.msgs,
      });
      const blocks = Array.isArray(data.content) ? data.content : [];
      ASSIST.msgs.push({ role: 'assistant', content: blocks });
      const toolUses = blocks.filter(b => b.type === 'tool_use');
      if (!toolUses.length || data.stop_reason !== 'tool_use') { assistantRender(); break; }
      didAction = true;
      const results = [];
      for (const tu of toolUses) results.push({ type: 'tool_result', tool_use_id: tu.id, content: await runAssistantTool(tu.name, tu.input) });
      ASSIST.msgs.push({ role: 'user', content: results });
      assistantRender();
    }
    if (didAction) { if (typeof updateStatusBar === 'function') updateStatusBar(); if (STATE.view) renderScreen(STATE.view); }
  } catch (e) {
    ASSIST.msgs.push({ role: 'assistant', content: [{ type: 'text', text: '⚠ ' + (e.message || 'Fehler') }] });
  } finally {
    ASSIST.busy = false;
    assistantRender();
  }
}
