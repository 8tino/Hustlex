// ═══════════════════════════════════════════════════════
// MEHR · Tools & admin. The life areas now live under their own
//   sections (Körper / Aufgaben / Wachstum); this tab is just the
//   cross-cutting helpers and settings.
// ═══════════════════════════════════════════════════════

function renderMehr(s) {
  s.className = 'screen on stagger';
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">MEHR</div>' +
    '<div class="h2">Werkzeuge & <span class="gold">Einstellungen</span></div>';

  const acts = [
    { ic: '❔', name: 'Tutorial · So funktioniert HustleX', sub: 'Navigation, Gesten & alle Bereiche erklärt', fn: () => openTutorial() },
    { ic: '❓', name: 'Hilfe & FAQ', sub: 'Antworten & Kontakt, falls du nicht weiterkommst', fn: () => openHelp() },
    { ic: '🎛', name: 'App anpassen', sub: 'Sektionen ein-/ausblenden · Task-Ordner verwalten', fn: () => openCustomize() },
    { ic: '📥', name: 'Notizen einsortieren', sub: 'Notizen einfügen → automatisch in die Bereiche verteilen', fn: () => openNotesImport() },
    { ic: '✦', name: 'KI-Assistent', sub: 'Fragen stellen & Dinge eintragen', fn: () => openAssistant() },
    { ic: '📅', name: 'Kalender & feste Zeiten', sub: 'Arbeit, Termine, .ics-Import (auch im Tagesplan)', fn: () => openKalender() },
    { ic: '🔗', name: 'Verbindungen', sub: 'Eigenes Claude-Konto (KI) · Obsidian / Markdown-Export', fn: () => openConnections() },
    { ic: '🐞', name: 'Fehler melden', sub: 'Bug gefunden? Sag Bescheid', fn: () => openReport('bug') },
    { ic: '💡', name: 'Verbesserung vorschlagen', sub: 'Feature-Wunsch oder was dir fehlt (z. B. Social verknüpfen)', fn: () => openReport('idea') },
    { ic: '⚖️', name: 'Rechtliches', sub: 'Impressum · Datenschutz · AGB', fn: () => openLegal() },
    { ic: '⚙', name: 'Einstellungen', sub: 'Profil, Cloud-Sync, Backup, Export', fn: () => showSettings() },
  ];
  acts.forEach(a => {
    const row = div('row tap', '<span style="font-size:20px;width:42px;text-align:center;flex:none;">' + a.ic + '</span>' +
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + a.name + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:1px;">' + a.sub + '</div></div>' +
      '<span style="color:var(--t-3);font-size:18px;">›</span>');
    row.onclick = a.fn;
    s.appendChild(row);
  });
}

// ─── HILFE / FEEDBACK ───────────────────────────────────
const FEEDBACK_EMAIL = 'tinokarmann@gmail.com'; // Support/Feedback-Empfänger
const HELP_FAQ = [
  { q: 'Wie gehe ich zurück?', a: 'Wisch von der linken Kante nach rechts (wie am iPhone) oder nutze die Zurück-Taste.' },
  { q: 'Wie blende ich Sektionen aus?', a: 'Mehr → 🎛 App anpassen. Dort schaltest du einzelne Sektionen an/aus und legst Task-Ordner an.' },
  { q: 'Wie hängt die App zusammen?', a: 'Trägst du z. B. dein Wasser in Körper ein, hakt sich der „Trinken"-Task von selbst ab. Beim Task per ⛓ mit einem Körper-Wert verknüpfen.' },
  { q: 'Funktioniert die KI?', a: 'Die ✦-KI-Knöpfe brauchen eine Anbindung: entweder dein eigener Key (Mehr → 🔗 Verbindungen) oder der keyless-Weg „💬 Mit Claude besprechen".' },
  { q: 'Sind meine Daten sicher?', a: 'Ja — deine Daten sind Ende-zu-Ende-verschlüsselt gespeichert und liegen zuerst auf deinem Gerät. Ohne dein Passwort kommt niemand an den Tresor (auch wir nicht). Nur wenn du eine KI-Funktion aktiv nutzt, wird der jeweilige Ausschnitt an Anthropic gesendet, um die Antwort zu erzeugen.' },
  { q: 'Ich habe mein Passwort vergessen.', a: 'Aus Sicherheitsgründen (echtes E2EE) gibt es keinen Reset — ohne Passwort sind die Cloud-Daten nicht entschlüsselbar. Lokale Daten auf dem Gerät bleiben, solange du angemeldet bist.' },
];
function openHelp() {
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">HILFE</div>' +
    '<div class="h2" style="margin-bottom:14px;">Wie kann ich <span class="gold">helfen?</span></div>');
  const t = h('button', { textContent: '❔  Tutorial nochmal ansehen' }); t.className = 'btn btn-gold tap'; t.style.marginBottom = '8px';
  t.onclick = () => openTutorial(false); inner.appendChild(t);
  const c = h('button', { textContent: '💬  Mit Claude besprechen' }); c.className = 'btn btn-glass tap'; c.style.marginBottom = '14px';
  c.onclick = () => { closeOverlay(); if (typeof talkToClaude === 'function') talkToClaude(); }; inner.appendChild(c);
  inner.appendChild(div('label', 'HÄUFIGE FRAGEN'));
  HELP_FAQ.forEach(f => {
    const d = document.createElement('details'); d.className = 'glass'; d.style.cssText = 'padding:12px 14px;margin-bottom:8px;';
    d.innerHTML = '<summary style="cursor:pointer;font-size:14px;font-weight:600;color:var(--t-1);">' + f.q + '</summary>' +
      '<div style="font-size:13px;color:var(--t-2);line-height:1.6;margin-top:8px;">' + f.a + '</div>';
    inner.appendChild(d);
  });
  const still = h('button', { textContent: '🐞 Kommst du nicht weiter? Melde es uns' }); still.className = 'btn btn-ghost tap'; still.style.cssText = 'margin-top:8px;font-size:12px;';
  still.onclick = () => openReport('bug'); inner.appendChild(still);
  openOverlay();
}

// Bug- & Verbesserungs-Meldungen: lokal gespeichert (los_feedback) + optional
// als E-Mail-Entwurf. (Für eine öffentliche Version später an ein Backend.)
function getFeedback() { return ls('los_feedback') || []; }
function openReport(kind) {
  const isBug = kind === 'bug';
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + (isBug ? 'FEHLER MELDEN' : 'VERBESSERUNG VORSCHLAGEN') + '</div>' +
    '<div class="h2" style="margin-bottom:8px;">' + (isBug ? '🐞 Was ist schiefgelaufen?' : '💡 Was fehlt dir?') + '</div>');
  inner.insertAdjacentHTML('beforeend', '<div style="font-size:13px;color:var(--t-3);line-height:1.6;margin-bottom:12px;">' +
    (isBug ? 'Beschreib kurz den Fehler und was du gemacht hast. Je genauer, desto schneller lässt er sich beheben.'
           : 'Sag uns, was dir fehlt oder besser sein könnte — z. B. „Instagram verknüpfen", ein neuer Bereich, ein Wert. Die besten Ideen bauen wir ein.') + '</div>');
  const title = h('input', { type: 'text', placeholder: isBug ? 'Kurz: der Fehler…' : 'Kurz: deine Idee…', maxLength: 100 }); title.className = 'inp'; title.style.cssText = 'width:100%;font-size:15px;margin-bottom:8px;';
  inner.appendChild(title);
  const body = h('textarea', { placeholder: isBug ? 'Was ist passiert? Was hast du erwartet? Welcher Bereich?' : 'Beschreib deine Idee genauer…' }); body.className = 'inp'; body.style.cssText = 'width:100%;min-height:120px;font-size:14px;line-height:1.6;resize:vertical;margin-bottom:14px;';
  inner.appendChild(body);
  const send = h('button', { textContent: '✓ Absenden' }); send.className = 'btn btn-gold tap';
  send.onclick = () => {
    const ti = title.value.trim(); if (!ti) { showToast('Bitte kurz einen Titel eingeben', '✎'); return; }
    const entry = { id: Date.now(), kind, title: ti, body: body.value.trim(), at: new Date().toISOString(), v: (typeof SW_VERSION !== 'undefined' ? SW_VERSION : '') };
    const all = getFeedback(); all.unshift(entry); ls('los_feedback', all);
    const subject = encodeURIComponent('[HustleX ' + (isBug ? 'Bug' : 'Idee') + '] ' + ti);
    const mailBody = encodeURIComponent((body.value.trim() || '(keine Details)') + '\n\n—\nVersion: ' + entry.v + '\nGesendet aus HustleX');
    try { window.open('mailto:' + FEEDBACK_EMAIL + '?subject=' + subject + '&body=' + mailBody, '_blank'); } catch (e) {}
    haptic('success'); showToast(isBug ? 'Danke! Fehler notiert' : 'Danke! Idee notiert', '💚'); closeOverlay();
  };
  inner.appendChild(send);
  // Bisherige eigene Meldungen anzeigen
  const mine = getFeedback().filter(f => f.kind === kind);
  if (mine.length) {
    inner.appendChild(div('label', 'DEINE BISHERIGEN MELDUNGEN'));
    mine.slice(0, 8).forEach(f => {
      const row = div('glass', '<div style="font-size:13px;color:var(--t-1);">' + f.title + '</div>' +
        '<div style="font-size:11px;color:var(--t-4);margin-top:2px;">' + new Date(f.at).toLocaleDateString('de-DE') + '</div>');
      row.style.cssText = 'padding:10px 12px;margin-bottom:6px;';
      inner.appendChild(row);
    });
  }
  openOverlay();
}

// ─── TUTORIAL · Navigation & Bereiche erklärt ───────────
const TUTORIAL_SLIDES = [
  { ic: '👋', t: 'Willkommen bei HustleX', b: 'Dein persönliches Betriebssystem fürs Leben — Körper, Aufgaben, Ziele, Wissen an einem Ort. Ganz unten wechselst du zwischen <b>5 Bereichen</b>.' },
  { ic: '🧭', t: 'Die 5 Bereiche unten', b: '<b>◈ Heute</b> — dein Überblick für den Tag.<br><b>♡ Körper</b> — Essen, Wasser, Schlaf, Gewohnheiten.<br><b>◎ Aufgaben</b> — Tagesplan, Tasks, Log, Disziplin.<br><b>✦ Wachstum</b> — Ziele, Kurse, Skills, Finanzen.<br><b>⋯ Mehr</b> — Werkzeuge & Einstellungen.' },
  { ic: '👉', t: 'Navigieren & Gesten', b: 'Von der <b>linken Kante nach rechts wischen</b> = eine Ebene zurück (wie am iPhone).<br><br>Überschriften mit einem <b>Pfeil</b> kannst du antippen zum <b>Auf- und Zuklappen</b> — so bleibt alles kurz und übersichtlich.' },
  { ic: '🔗', t: 'Alles hängt zusammen', b: 'Trägst du dein <b>Wasser</b> in Körper ein, hakt sich der „Trinken"-Task von selbst ab — kein doppeltes Eintragen. Beim Task tippst du auf <b>⛓</b>, um ihn mit einem Körper-Wert zu verknüpfen.' },
  { ic: '🎛', t: 'Mach sie zu deiner App', b: 'Unter <b>Mehr → 🎛 App anpassen</b> blendest du Sektionen aus, die du nicht brauchst, und legst <b>eigene Task-Ordner</b> an.<br><br>Unter <b>🔗 Verbindungen</b> koppelst du die KI (dein Claude-Konto).' },
  { ic: '🚀', t: 'Leg los!', b: 'Trag heute in <b>Körper</b> dein Essen & Wasser ein, plane in <b>Aufgaben</b> deinen Tag mit einem Tap, und setz dir in <b>Wachstum</b> ein Ziel. Du schaffst das. 💪' },
];
const TUTORIAL_SLIDES_EN = [
  { ic: '👋', t: 'Welcome to HustleX', b: 'Your personal operating system for life — body, tasks, goals, knowledge in one place. At the very bottom you switch between <b>5 areas</b>.' },
  { ic: '🧭', t: 'The 5 areas at the bottom', b: '<b>◈ Today</b> — your overview for the day.<br><b>♡ Body</b> — food, water, sleep, habits.<br><b>◎ Tasks</b> — day plan, tasks, log, discipline.<br><b>✦ Growth</b> — goals, courses, skills, finances.<br><b>⋯ More</b> — tools & settings.' },
  { ic: '👉', t: 'Navigate & gestures', b: '<b>Swipe from the left edge to the right</b> = go back one level (like on iPhone).<br><br>Headings with an <b>arrow</b> can be tapped to <b>expand and collapse</b> — keeping everything short and tidy.' },
  { ic: '🔗', t: 'Everything connects', b: 'Log your <b>water</b> in Body and the „Drink" task checks itself off — no double entry. On a task, tap <b>⛓</b> to link it to a body metric.' },
  { ic: '🎛', t: 'Make it your app', b: 'Under <b>More → 🎛 Customize app</b> you hide sections you don\'t need and create <b>your own task folders</b>.<br><br>Under <b>🔗 Connections</b> you link the AI (your Claude account).' },
  { ic: '🚀', t: 'Get started!', b: 'Today, log your food & water in <b>Body</b>, plan your day with one tap in <b>Tasks</b>, and set a goal in <b>Growth</b>. You\'ve got this. 💪' },
];
function openTutorial(firstRun) {
  let idx = 0;
  const inner = el('overlay_inner');
  const slides = (typeof LANG !== 'undefined' && LANG === 'en') ? TUTORIAL_SLIDES_EN : TUTORIAL_SLIDES;
  const render = () => {
    inner.innerHTML = '';
    if (!firstRun) inner.appendChild(overlayBackBtn());
    const sl = slides[idx];
    const card = div('glass-accent', '');
    card.style.cssText = 'padding:26px 20px;text-align:center;';
    card.innerHTML = '<div style="font-size:52px;line-height:1;margin-bottom:14px;">' + sl.ic + '</div>' +
      '<div class="h2" style="margin-bottom:12px;">' + sl.t + '</div>' +
      '<div style="font-size:14px;color:var(--t-2);line-height:1.7;">' + sl.b + '</div>';
    inner.appendChild(card);
    // dots
    const dots = div(''); dots.style.cssText = 'display:flex;justify-content:center;gap:7px;margin:16px 0;';
    slides.forEach((_, i) => { const d = div(''); d.style.cssText = 'width:8px;height:8px;border-radius:50%;background:' + (i === idx ? 'var(--gold)' : 'var(--edge)') + ';'; dots.appendChild(d); });
    inner.appendChild(dots);
    const EN = (typeof LANG !== 'undefined' && LANG === 'en');
    // nav buttons
    const row = div(''); row.style.cssText = 'display:flex;gap:8px;';
    if (idx > 0) { const back = h('button', { textContent: EN ? '‹ Back' : '‹ Zurück' }); back.className = 'btn btn-glass tap'; back.onclick = () => { idx--; render(); }; row.appendChild(back); }
    const next = h('button', { textContent: idx < slides.length - 1 ? (EN ? 'Next ›' : 'Weiter ›') : (EN ? '✓ Let’s go' : '✓ Los geht’s') });
    next.className = 'btn btn-gold tap';
    next.onclick = () => {
      if (idx < slides.length - 1) { idx++; render(); }
      else { closeOverlay(); if (firstRun) setTimeout(() => { try { openCustomize(true); } catch (e) {} }, 250); }
    };
    row.appendChild(next); inner.appendChild(row);
    if (firstRun) {
      const skip = h('button', { textContent: (typeof LANG !== 'undefined' && LANG === 'en') ? 'Skip' : 'Überspringen' }); skip.className = 'btn btn-ghost tap'; skip.style.cssText = 'margin-top:8px;font-size:12px;';
      skip.onclick = () => { closeOverlay(); setTimeout(() => { try { openCustomize(true); } catch (e) {} }, 250); };
      inner.appendChild(skip);
    }
  };
  render();
  openOverlay();
}

// ─── APP ANPASSEN · Sektionen ein/aus + Task-Ordner ─────
// Registry of toggleable page sections. Keys match the section() keys used in
// the screens; moduleOn(key) (helpers) gates their rendering. Default = on.
const MODULES = [
  { area: 'KÖRPER', items: [
    { k: 'v_meals',    l: 'Mahlzeiten' },
    { k: 'v_plan',     l: 'Ernährungsplan' },
    { k: 'v_sleep',    l: 'Schlaf' },
    { k: 'v_supps',    l: 'Supplements' },
    { k: 'v_recovery', l: 'Recovery' },
  ] },
  { area: 'AUFGABEN', items: [
    { k: 'f_add',  l: 'Block-Bausteine (Tagesplan)' },
    { k: 'f_opt',  l: 'Kalender, KI-Plan & Ideen' },
    { k: 'f_vows', l: 'Iron Vows (Disziplin)' },
  ] },
];

function openCustomize(firstRun) {
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">PERSONALISIEREN</div>' +
    '<div class="h2" style="margin-bottom:14px;">App <span class="gold">anpassen</span></div>');
  if (firstRun) {
    const intro = div('glass-accent', '<div style="font-size:13px;color:var(--t-2);line-height:1.6;">Richte dir HustleX ein, wie du es willst: blende Sektionen aus, die du nicht brauchst, und leg dir Task-Ordner an. <b>Alles ist jederzeit hier änderbar</b> — du findest das später unter <b>Mehr → 🎛 App anpassen</b>.</div>');
    intro.style.marginBottom = '14px'; inner.appendChild(intro);
    try { ls('los_customize_seen', true); } catch (e) {}
  }

  // ── 0. Einheiten (metrisch / imperial) ──
  inner.appendChild(div('label', 'EINHEITEN'));
  const uRow = div('row', '<div style="flex:1;font-size:14px;color:var(--t-1);">Maßeinheit für Lebensmittel</div>');
  const uBtn = h('button', {}); uBtn.className = 'tap';
  const paintU = () => { const imp = getCfg().units === 'imperial'; uBtn.textContent = imp ? 'lb / oz' : 'Gramm'; uBtn.style.cssText = 'width:96px;padding:8px 0;border-radius:99px;font-size:12px;font-weight:700;border:1px solid var(--edge);background:var(--glass-2);color:var(--gold);'; };
  paintU();
  uBtn.onclick = () => { saveCfg({ units: getCfg().units === 'imperial' ? 'metric' : 'imperial' }); paintU(); haptic('light'); };
  uRow.appendChild(uBtn); inner.appendChild(uRow);

  // ── 1. Sektionen ein-/ausblenden ──
  inner.appendChild(div('label', 'SEKTIONEN'));
  inner.insertAdjacentHTML('beforeend', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;margin-bottom:8px;">Schalte aus, was du auf den Seiten <b>nicht</b> sehen willst. Standard: alles an.</div>');
  MODULES.forEach(grp => {
    inner.appendChild(div('label', grp.area));
    grp.items.forEach(m => {
      const row = div('row', '');
      row.innerHTML = '<div style="flex:1;min-width:0;font-size:14px;color:var(--t-1);">' + m.l + '</div>';
      const b = h('button', {}); b.className = 'tap';
      const paint = () => { const on = moduleOn(m.k); b.textContent = on ? 'An' : 'Aus'; b.style.cssText = 'width:74px;padding:8px 0;border-radius:99px;font-size:12px;font-weight:700;border:1px solid ' + (on ? 'rgba(92,184,117,.4)' : 'var(--edge)') + ';background:' + (on ? 'rgba(92,184,117,.12)' : 'var(--glass-2)') + ';color:' + (on ? 'var(--green)' : 'var(--t-3)') + ';'; };
      paint();
      b.onclick = () => { const mo = ls('los_modules') || {}; mo[m.k] = !moduleOn(m.k) ? true : false; ls('los_modules', mo); paint(); haptic('light'); };
      row.appendChild(b); inner.appendChild(row);
    });
  });

  // ── 2. Task-Ordner verwalten ──
  inner.appendChild(div('label', 'TASK-ORDNER'));
  inner.insertAdjacentHTML('beforeend', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;margin-bottom:8px;">Deine Ordner im Tasks-Bereich. Umbenennen ✎, löschen ×, sortieren ▲▼. Neue unten hinzufügen.</div>');
  const foldWrap = div(''); inner.appendChild(foldWrap);
  const paintFolders = () => {
    foldWrap.innerHTML = '';
    const folders = getTaskFolders();
    folders.forEach((name, i) => {
      const row = div('row', '<div style="flex:1;min-width:0;font-size:14px;color:var(--t-1);">' + name + '</div>');
      const mk = (txt, fn) => { const b = h('button', { textContent: txt }); b.className = 'tap'; b.style.cssText = 'background:none;color:var(--t-3);font-size:15px;padding:4px 6px;'; b.onclick = fn; return b; };
      row.appendChild(mk('▲', () => { if (i === 0) return; const f = getTaskFolders();[f[i - 1], f[i]] = [f[i], f[i - 1]]; saveTaskFolders(f); paintFolders(); }));
      row.appendChild(mk('▼', () => { const f = getTaskFolders(); if (i === f.length - 1) return;[f[i + 1], f[i]] = [f[i], f[i + 1]]; saveTaskFolders(f); paintFolders(); }));
      row.appendChild(mk('✎', () => {
        const nv = prompt('Ordner umbenennen:', name); if (!nv || !nv.trim()) return;
        const nn = nv.trim(); const f = getTaskFolders(); f[i] = nn; saveTaskFolders(f);
        const ts = getTasks(); ts.forEach(t => { if (t.cat === name) t.cat = nn; }); saveTasks(ts); // Tasks mitziehen
        paintFolders();
      }));
      row.appendChild(mk('×', () => {
        if (!confirm('Ordner „' + name + '" löschen? Tasks darin werden „Ohne Ordner".')) return;
        saveTaskFolders(getTaskFolders().filter((_, j) => j !== i));
        const ts = getTasks(); ts.forEach(t => { if (t.cat === name) t.cat = null; }); saveTasks(ts);
        paintFolders();
      }));
      foldWrap.appendChild(row);
    });
    // add new
    const addRow = div(''); addRow.style.cssText = 'display:flex;gap:8px;margin-top:8px;';
    const inp = h('input', { type: 'text', placeholder: 'Neuer Ordner… (Emoji vorne = Icon)' }); inp.className = 'inp'; inp.style.cssText = 'flex:1;font-size:14px;';
    const ab = h('button', { textContent: '+' }); ab.className = 'btn btn-gold tap'; ab.style.cssText = 'width:48px;flex:none;font-size:20px;';
    const add = () => { const v = inp.value.trim(); if (!v) return; const f = getTaskFolders(); if (!f.includes(v)) { saveTaskFolders(f.concat([v])); } inp.value = ''; paintFolders(); };
    ab.onclick = add; inp.onkeydown = e => { if (e.key === 'Enter') add(); };
    addRow.appendChild(inp); addRow.appendChild(ab); foldWrap.appendChild(addRow);
  };
  paintFolders();

  // Re-render the current screen on close so toggles take effect immediately.
  const applyBtn = h('button', { textContent: '✓ Fertig' }); applyBtn.className = 'btn btn-gold tap'; applyBtn.style.marginTop = '16px';
  applyBtn.onclick = () => { closeOverlay(); if (STATE.view) renderScreen(STATE.view); };
  inner.appendChild(applyBtn);

  openOverlay();
}

// ─── VERBINDUNGEN (BYOK Claude · KI-Berechtigungen · Obsidian) ───
const AI_AREAS = [
  { k: 'koerper', l: 'Körper', sub: 'Vitals, Gewohnheiten, Ernährung' },
  { k: 'aufgaben', l: 'Aufgaben', sub: 'Tasks, Log, Tagesplan' },
  { k: 'ziele', l: 'Ziele & Wachstum', sub: 'Ziele, Wünsche, Skills, Manifest' },
  { k: 'kurse', l: 'Kurse', sub: 'Kurrikulum & eigene Kurse' },
  { k: 'wissen', l: 'Wissen & Journal', sub: 'Journal, Lernen, Wissen' },
  { k: 'finanzen', l: 'Finanzen', sub: 'Einnahmen, Ausgaben, Markt' },
];

function openConnections() {
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">VERBINDUNGEN</div>' +
    '<div class="h2" style="margin-bottom:14px;">KI & <span class="gold">Integrationen</span></div>');

  // Gratis-Kontingent heute (nur ohne eigenen Key & ohne Pro relevant).
  if (typeof aiUsageLeft === 'function') {
    const _EN = (typeof LANG !== 'undefined' && LANG === 'en');
    const left = aiUsageLeft();
    const tot = (typeof AI_FREE_DAILY !== 'undefined' ? AI_FREE_DAILY : 12);
    const qc = div('glass', ''); qc.style.cssText = 'padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;';
    if (left === Infinity) {
      qc.innerHTML = '<span style="font-size:18px;">∞</span><div class="notranslate" style="font-size:12.5px;color:var(--t-2);line-height:1.5;">' +
        (isProActive() ? (_EN ? 'Pro active — unlimited AI.' : 'Pro aktiv — unbegrenzte KI.') : (_EN ? 'Own key active — unlimited AI.' : 'Eigener Key aktiv — unbegrenzte KI.')) + '</div>';
    } else {
      qc.innerHTML = '<span style="font-size:18px;">⚡</span><div class="notranslate" style="flex:1;font-size:12.5px;color:var(--t-2);line-height:1.5;">' +
        (_EN ? '<b>' + left + '</b> of ' + tot + ' free AI requests left today. Own key or Pro = unlimited.'
             : 'Heute noch <b>' + left + '</b> von ' + tot + ' gratis KI-Anfragen. Eigener Key oder Pro = unbegrenzt.') + '</div>';
      const up = h('button', { textContent: 'Pro' }); up.className = 'tap';
      up.style.cssText = 'flex:none;padding:7px 14px;border-radius:99px;font-size:12px;font-weight:700;border:1px solid var(--gold);background:rgba(197,164,90,.14);color:var(--gold);';
      up.onclick = () => { if (typeof openUpgrade === 'function') openUpgrade(); };
      qc.appendChild(up);
    }
    inner.appendChild(qc);
  }

  // ── 0. Mit Claude besprechen (ohne Key, über dein Abo) ──
  inner.appendChild(div('label', 'MIT CLAUDE BESPRECHEN · OHNE KEY'));
  const tc = div('glass', ''); tc.style.cssText = 'padding:14px;margin-bottom:16px;';
  tc.insertAdjacentHTML('beforeend', '<div style="font-size:13px;color:var(--t-2);line-height:1.6;">Der einfachste Weg — <b>gratis & ohne API-Key</b>, über dein normales Claude-Abo: Tipp auf den Knopf, dann liegt dein aktueller HustleX-Stand in der Zwischenablage und Claude öffnet sich. Einfügen (⌘/Strg + V) — und Claude ist dein Coach. Antworten mit neuen Aufgaben/Zielen holst du über „Notizen einsortieren" zurück in die App.</div>');
  const tcb = h('button', { textContent: '💬  Mit Claude besprechen' }); tcb.className = 'btn btn-gold tap'; tcb.style.marginTop = '12px';
  tcb.onclick = () => talkToClaude();
  tc.appendChild(tcb);
  tc.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-4);margin-top:10px;line-height:1.5;">Gesperrte Bereiche (weiter unten) bleiben auch hier ausgeblendet. Dein Gerät verlässt nur der Text, den du selbst in Claude einfügst — kein automatischer Upload.</div>');
  inner.appendChild(tc);

  // ── 1. Eigenes Claude-Konto (BYOK) ──
  const byok = ls('los_byok') || { key: '', on: false, model: BEST_AI_MODEL };
  if (!byok.model) byok.model = BEST_AI_MODEL;
  inner.appendChild(div('label', 'EIGENES CLAUDE-KONTO (KI)'));
  const bcard = div('glass', ''); bcard.style.cssText = 'padding:14px;margin-bottom:14px;';
  bcard.insertAdjacentHTML('beforeend', '<div style="font-size:13px;color:var(--t-2);line-height:1.6;">Verbinde dein eigenes Anthropic-Konto. Dann läuft die KI (KI-Kurse, Tipps, Assistent) über <b>deinen</b> Key — mit freier Modellwahl und ohne Server-Limit. Der Key bleibt nur auf deinem Gerät (E2EE-gesichert), nie im Code.</div>');

  // Step-by-step so a non-technical user can set it up in a minute.
  bcard.insertAdjacentHTML('beforeend',
    '<div style="margin:14px 0 4px;padding:12px 14px;border-radius:12px;background:var(--glass-2);border:1px solid var(--edge);">' +
    '<div class="label" style="margin-bottom:8px;">IN 3 SCHRITTEN</div>' +
    '<div style="font-size:12.5px;color:var(--t-2);line-height:1.8;">' +
    '<b>1.</b> Auf <b>console.anthropic.com</b> anmelden (oder registrieren).<br>' +
    '<b>2.</b> Links auf <b>API Keys</b> → <b>Create Key</b> → kopieren (beginnt mit <code>sk-ant-…</code>).<br>' +
    '<b>3.</b> Key unten einfügen, <b>Testen</b>, dann <b>AN</b> schalten. Fertig.' +
    '</div></div>');
  const getKeyLink = h('a', { textContent: '↗ Key holen · console.anthropic.com', href: 'https://console.anthropic.com/settings/keys', target: '_blank', rel: 'noopener' });
  getKeyLink.style.cssText = 'display:inline-block;margin:10px 0 2px;font-size:12.5px;color:var(--gold);text-decoration:none;font-weight:600;';
  bcard.appendChild(getKeyLink);

  const keyInp = h('input', { type: 'password', value: byok.key || '', placeholder: 'sk-ant-…' });
  keyInp.className = 'inp'; keyInp.style.cssText = 'width:100%;font-size:14px;margin:10px 0 8px;';
  bcard.appendChild(keyInp);

  // Modellwahl
  bcard.insertAdjacentHTML('beforeend', '<div class="label" style="margin:8px 0 6px;">MODELL</div>');
  const modSel = h('select'); modSel.className = 'inp'; modSel.style.cssText = 'width:100%;font-size:13px;margin-bottom:4px;';
  [
    { v: 'claude-opus-5', l: 'Opus 5 · stärkstes Modell (teurer)' },
    { v: 'claude-sonnet-5', l: 'Sonnet 5 · schnell & günstig (empfohlen)' },
    { v: 'claude-haiku-4-5-20251001', l: 'Haiku 4.5 · am günstigsten' },
  ].forEach(m => { const o = h('option', { value: m.v, textContent: m.l }); if (byok.model === m.v) o.selected = true; modSel.appendChild(o); });
  modSel.onchange = () => { byok.model = modSel.value; };
  bcard.appendChild(modSel);
  bcard.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-4);margin:0 0 10px;line-height:1.5;">Tipp: <b>Sonnet 5</b> reicht für fast alles und kostet dich am wenigsten. Opus nur für die anspruchsvollsten Aufgaben.</div>');

  // on/off toggle
  const tRow = div(''); tRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;';
  tRow.innerHTML = '<span style="flex:1;font-size:13px;color:var(--t-1);">KI über meinen Key nutzen</span>';
  const tBtn = h('button', { textContent: byok.on ? 'AN' : 'AUS' }); tBtn.className = 'tap';
  const paintT = () => { tBtn.textContent = byok.on ? 'AN' : 'AUS'; tBtn.style.cssText = 'width:64px;padding:8px 0;border-radius:99px;font-size:12px;font-weight:700;border:1px solid ' + (byok.on ? 'var(--green)' : 'var(--edge)') + ';background:' + (byok.on ? 'rgba(92,184,117,.15)' : 'var(--glass-2)') + ';color:' + (byok.on ? 'var(--green)' : 'var(--t-3)') + ';'; };
  paintT(); tBtn.onclick = () => { byok.on = !byok.on; paintT(); }; tRow.appendChild(tBtn); bcard.appendChild(tRow);
  const saveB = h('button', { textContent: '✓ Speichern' }); saveB.className = 'btn btn-gold tap'; saveB.style.cssText = 'font-size:13px;';
  saveB.onclick = () => { ls('los_byok', { key: keyInp.value.trim(), on: byok.on, model: byok.model }); showToast('Claude-Konto gespeichert', '🔗'); };
  bcard.appendChild(saveB);
  const testB = h('button', { textContent: '⚡ Testen' }); testB.className = 'btn btn-glass tap'; testB.style.cssText = 'font-size:13px;margin-top:6px;';
  testB.onclick = async () => {
    const k = keyInp.value.trim();
    if (!k) { showToast('Bitte zuerst einen Key einfügen', '⚠'); return; }
    ls('los_byok', { key: k, on: true, model: byok.model });
    testB.disabled = true; testB.innerHTML = '<span class="anim-spin">⚙</span> Teste…';
    try {
      const r = await callAI('Antworte nur mit: OK', 'Du bist ein Test.', 20, byok.model);
      byok.on = true; paintT();
      showToast(r && r.length ? 'Verbindung ok ✓' : 'Antwort leer — Key prüfen', '✅');
    }
    catch (e) { showToast('Fehler: ' + (e.message || e), '⚠'); }
    finally { testB.disabled = false; testB.textContent = '⚡ Testen'; }
  };
  bcard.appendChild(testB);
  bcard.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-4);margin-top:10px;line-height:1.5;">💡 Setz auf console.anthropic.com unter <b>Billing → Limits</b> ein Monats-Limit (z. B. 10 €), dann kann nichts entgleisen. Sicherheit: gib den Key nur hier ein, teile ihn nirgends.</div>');
  inner.appendChild(bcard);

  // ── 2. KI-Berechtigungen (Zugriff pro Bereich) ──
  inner.appendChild(div('label', 'KI-ZUGRIFF · BERECHTIGUNGEN'));
  inner.insertAdjacentHTML('beforeend', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;margin:2px 0 8px;">Standard: die KI darf auf <b>alles</b> zugreifen. Schalte Bereiche ab, die sie zu <b>100 %</b> nicht sehen oder verändern darf (z. B. Finanzen).</div>');
  const scopes = ls('los_ai_scopes') || {};
  AI_AREAS.forEach(a => {
    const on = scopes[a.k] !== false;
    const row = div('row', '');
    row.innerHTML = '<div style="flex:1;min-width:0;"><div style="font-size:14px;color:var(--t-1);">' + (on ? '' : '🔒 ') + a.l + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + a.sub + '</div></div>';
    const b = h('button', {}); b.className = 'tap';
    const paint = () => { const v = (ls('los_ai_scopes') || {})[a.k] !== false; b.textContent = v ? 'Erlaubt' : 'Gesperrt'; b.style.cssText = 'width:84px;padding:8px 0;border-radius:99px;font-size:12px;font-weight:600;border:1px solid ' + (v ? 'rgba(92,184,117,.4)' : 'rgba(255,69,58,.4)') + ';background:' + (v ? 'rgba(92,184,117,.12)' : 'rgba(255,69,58,.12)') + ';color:' + (v ? 'var(--green)' : 'var(--red)') + ';'; };
    paint();
    b.onclick = () => {
      const sc = ls('los_ai_scopes') || {};
      const cur = sc[a.k] !== false; // aktuell erlaubt?
      sc[a.k] = !cur;                // umschalten
      ls('los_ai_scopes', sc);
      paint();
      row.querySelector('div div').textContent = (sc[a.k] !== false ? '' : '🔒 ') + a.l;
      haptic('light');
    };
    row.appendChild(b); inner.appendChild(row);
  });

  // ── 3. Obsidian / Markdown ──
  inner.appendChild(div('label', 'OBSIDIAN / MARKDOWN'));
  const ocard = div('glass', ''); ocard.style.cssText = 'padding:14px;';
  ocard.insertAdjacentHTML('beforeend', '<div style="font-size:13px;color:var(--t-2);line-height:1.6;">Exportiere deine Daten als eine Markdown-Datei — direkt in deinen Obsidian-Vault ziehbar. Gesperrte Bereiche (oben) werden <b>nicht</b> exportiert. Notizen aus Obsidian zurück holst du über „Notizen einsortieren".</div>');
  const exp = h('button', { textContent: '⬇  Als Markdown exportieren' }); exp.className = 'btn btn-gold tap'; exp.style.marginTop = '12px';
  exp.onclick = () => { const md = buildMarkdownExport(); downloadText('HustleX-Export-' + today().replace(/[^a-z0-9]+/gi, '-') + '.md', md); showToast('Markdown exportiert', '📄'); };
  ocard.appendChild(exp);
  inner.appendChild(ocard);

  inner.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-4);margin-top:14px;line-height:1.6;">Hinweis: Eine echte „live" MCP-Anbindung, bei der dein Claude von außen direkt in HustleX schreibt, braucht einen eigenen Server (später geplant). Schon jetzt möglich: KI-Kurse & Assistent laufen über dein Konto und respektieren die Berechtigungen oben.</div>');
  openOverlay();
}

// Keyless bridge to Claude: copy a coaching briefing (your HustleX snapshot,
// respecting the scope toggles) to the clipboard and open claude.ai. The user
// pastes it into their normal Claude subscription — no API key, no cost.
async function talkToClaude() {
  const intro =
    'Du bist mein persönlicher Coach. Unten ist mein aktueller Stand aus meiner HustleX-App ' +
    '(Ziele, Wünsche, Gewohnheiten, Journal, Log, Finanzen — je nach Freigabe). ' +
    'Lies ihn und hilf mir konkret weiter: erkenne Muster, nenn mir die 3 wichtigsten nächsten ' +
    'Schritte für heute und frag nach, wenn dir etwas fehlt.\n\n' +
    'Wenn du mir Aufgaben, Ziele oder Notizen zurückgibst, schreib sie als einfache Liste (eine pro Zeile) — ' +
    'die importiere ich in HustleX über „Notizen einsortieren".\n\n---\n\n';
  const text = intro + buildMarkdownExport();

  let copied = false;
  try { await navigator.clipboard.writeText(text); copied = true; } catch (e) {}
  if (!copied) {                       // fallback for older / non-secure contexts
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta); ta.focus(); ta.select();
      copied = document.execCommand('copy');
      ta.remove();
    } catch (e) {}
  }
  try { window.open('https://claude.ai/new', '_blank'); } catch (e) {}
  showToast(copied ? 'Kopiert – in Claude einfügen (⌘/Strg + V)' : 'Claude geöffnet – dann „Notizen einsortieren" für den Rückweg', '💬');
  haptic('success');
}

function buildMarkdownExport() {
  const L = []; const p = STATE.profile || {};
  L.push('# HustleX Export — ' + new Date().toLocaleDateString('de-DE'));
  if (p.name) L.push('', '**Profil:** ' + p.name);

  if (aiScopeAllowed('ziele')) {
    const z = ls('los_ziele') || [];
    if (z.length) { L.push('', '## Ziele'); z.forEach(g => L.push('- [' + (g.done ? 'x' : ' ') + '] ' + g.text + (g.why ? ' — _' + g.why + '_' : ''))); }
    const w = ls('los_wants') || [];
    if (w.length) { L.push('', '## Wünsche'); w.forEach(x => L.push('- ' + (x.got ? '~~' + x.text + '~~' : x.text) + (x.cost ? ' (' + x.cost + '€)' : '') + (x.type ? ' [' + x.type + ']' : ''))); }
  }
  if (aiScopeAllowed('koerper')) {
    const hb = ls('los_habits') || [];
    if (hb.length) { L.push('', '## Gewohnheiten'); hb.forEach(x => L.push('- ' + (x.icon || '') + ' ' + x.name + ' (' + (typeof habitFreqLabel === 'function' ? habitFreqLabel(x) : '') + ')' + (typeof habitStreak === 'function' ? ' · 🔥' + habitStreak(x) : ''))); }
  }
  if (aiScopeAllowed('wissen')) {
    const jl = []; for (let i = 0; i < 60; i++) { const d = new Date(); d.setDate(d.getDate() - i); const j = ls('los_j_' + d.toDateString()); if (j && (j.gelernt || j.freitext || (j.dankbar || []).some(Boolean))) { jl.push('', '### ' + d.toLocaleDateString('de-DE')); if (j.gelernt) jl.push('- **Gelernt:** ' + j.gelernt); const dk = (j.dankbar || []).filter(Boolean); if (dk.length) jl.push('- **Dankbar:** ' + dk.join(', ')); if (j.freitext) jl.push('', j.freitext); } }
    if (jl.length) { L.push('', '## Journal'); L.push(...jl); }
  }
  if (aiScopeAllowed('aufgaben')) {
    const ll = []; for (let i = 0; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() - i); const l = ls('los_log_' + d.toDateString()) || []; if (l.length) { ll.push('', '### ' + d.toLocaleDateString('de-DE')); l.forEach(e => ll.push('- `' + e.time + '` ' + e.text + (e.folder ? ' — 📁 ' + e.folder : ''))); } }
    if (ll.length) { L.push('', '## Log'); L.push(...ll); }
  }
  if (aiScopeAllowed('finanzen')) {
    const f = ls('los_fin'); const tx = (f && f.tx) || [];
    if (tx.length) { L.push('', '## Finanzen (letzte 30)'); tx.slice(-30).forEach(t => L.push('- ' + (t.date || t.d || '') + ' ' + (t.text || t.desc || t.note || t.n || '') + ': ' + (t.amount != null ? t.amount : (t.betrag != null ? t.betrag : (t.value != null ? t.value : ''))) + '€')); }
  }
  L.push('', '---', '_Exportiert aus HustleX · ' + new Date().toISOString() + '_');
  return L.join('\n');
}

function downloadText(name, text) {
  try {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  } catch (e) { showToast('Export fehlgeschlagen', '⚠'); }
}
