// ═══════════════════════════════════════════════════════
// TRAININGSPLAN · Plan-Ersteller (portiert aus Plan-Ersteller.html)
//   Baut aus Tagen/Schwerpunkt/Arten eine sinnvolle Trainingswoche mit
//   eingebauter Erholung. Ergebnis-Tage lassen sich direkt als
//   Non-Negotiable (heute) oder Tagesplan-Idee übernehmen.
// ═══════════════════════════════════════════════════════

const TP_MOD = {
  mma:          { label: 'MMA',                 block: 'MMA-Training (Technik & Sparring, aller Art)' },
  kraft:        { label: 'Kraft',               block: 'Kraft: Grundübungen (Kniebeuge/Kreuzheben/Drücken/Ziehen), 3–5 schwere Sätze' },
  calisthenics: { label: 'Calisthenics',        block: 'Calisthenics: Klimmzüge, Dips, Push/Pull + Skills (Handstand, Muscle-up)' },
  plyometrics:  { label: 'Plyometrics',         block: 'Plyometrics: Box Jumps, Bounds, Sprünge — explosiv' },
  sprints:      { label: 'Sprints/Speed',       block: 'Sprints: 6–10× kurz & maximal, volle Pause' },
  ausdauer:     { label: 'Ausdauer',            block: 'Ausdauer: Zone-2 locker oder harte Intervalle' },
  faszien:      { label: 'Faszien/Mobility',    block: 'Faszien & Mobility: Rollen, Dehnen, Beweglichkeit' },
  reaktion:     { label: 'Nervensystem/Reaktion', block: 'Reaktion & Nervensystem: schnelle Füße, Reaktionsdrills, Koordination' },
};
const TP_DAYNAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// weekly templates by training-day count. each day = {t:title, i:intensity, m:[mods]}
const TP_TEMPLATES = {
  3: [
    { t: 'MMA + Kraft (Ganzkörper)', i: 'hard', m: ['mma', 'kraft', 'calisthenics'] },
    { t: 'Athletik: Speed & Explosivität', i: 'hard', m: ['sprints', 'plyometrics', 'reaktion', 'ausdauer'] },
    { t: 'MMA + Skills + Mobility', i: 'med', m: ['mma', 'calisthenics', 'faszien'] },
    { t: 'Ruhe & Erholung', i: 'rest', m: [] },
    { t: 'Ruhe & Erholung', i: 'rest', m: [] },
  ],
  4: [
    { t: 'MMA + Kraft (Ganzkörper)', i: 'hard', m: ['mma', 'kraft'] },
    { t: 'Athletik: Sprints & Plyo', i: 'hard', m: ['sprints', 'plyometrics', 'reaktion'] },
    { t: 'Aktive Erholung', i: 'rec', m: ['ausdauer', 'faszien'] },
    { t: 'MMA + Calisthenics', i: 'med', m: ['mma', 'calisthenics'] },
    { t: 'Ruhe & Erholung', i: 'rest', m: [] },
  ],
  5: [
    { t: 'MMA + Kraft (Unterkörper)', i: 'hard', m: ['mma', 'kraft'] },
    { t: 'Athletik: Sprints & Plyo', i: 'hard', m: ['sprints', 'plyometrics', 'reaktion'] },
    { t: 'MMA + Calisthenics', i: 'med', m: ['mma', 'calisthenics'] },
    { t: 'Aktive Erholung', i: 'rec', m: ['ausdauer', 'faszien'] },
    { t: 'MMA + Kraft + Kondition', i: 'hard', m: ['mma', 'kraft', 'ausdauer'] },
    { t: 'Ruhe & Erholung', i: 'rest', m: [] },
  ],
  6: [
    { t: 'MMA + Kraft (Unterkörper)', i: 'hard', m: ['mma', 'kraft'] },
    { t: 'Athletik: Sprints, Plyo & Reaktion', i: 'hard', m: ['sprints', 'plyometrics', 'reaktion'] },
    { t: 'MMA + Calisthenics (Oberkörper)', i: 'med', m: ['mma', 'calisthenics'] },
    { t: 'Aktive Erholung: Ausdauer & Faszien', i: 'rec', m: ['ausdauer', 'faszien'] },
    { t: 'MMA + Kraft (Oberkörper)', i: 'hard', m: ['mma', 'kraft'] },
    { t: 'Intervalle, Skills & Balance', i: 'med', m: ['ausdauer', 'calisthenics', 'reaktion'] },
  ],
};
const TP_FOCUS_EMPH = {
  allround: '',
  kampfsport: 'Schwerpunkt Kampfsport: an MMA-Tagen mehr Sparring & Technik-Runden.',
  kraft: 'Schwerpunkt Kraft & Muskel: schwerer heben (3–6 Reps), Woche für Woche steigern.',
  athletik: 'Schwerpunkt Athletik & Speed: Sprint/Plyo in Top-Qualität, voll erholt, nie ins Erschöpfte.',
};
const TP_FOCI = [['allround', 'Allround Peak'], ['kampfsport', 'Mehr Kampfsport'], ['kraft', 'Mehr Kraft & Muskel'], ['athletik', 'Mehr Athletik & Speed']];
const TP_INTENSITY = {
  hard: { badge: 'Hart', c: '#FF453A' },
  med:  { badge: 'Mittel', c: '#FF9F0A' },
  rec:  { badge: 'Erholung', c: '#30D158' },
  rest: { badge: 'Ruhe', c: '#8E8E93' },
};

function tpState() {
  return Object.assign({ days: 5, focus: 'allround', mods: Object.keys(TP_MOD), shown: false }, ls('los_trainingsplan') || {});
}
function tpSave(st) { ls('los_trainingsplan', st); }

function renderTrainingsplan(s) {
  s.className = 'screen on';
  const st = tpState();

  s.innerHTML = '<div class="label" style="margin-bottom:4px;">KÖRPER · PEAK PERFORMANCE</div>' +
    '<div class="h2">Trainings<span class="gold italic">plan</span></div>' +
    '<div style="font-size:12px;color:var(--t-3);margin:6px 0 14px;line-height:1.5;">Sag mir, was du trainieren willst — ich stelle dir eine sinnvolle Trainingswoche zusammen, mit Erholung eingebaut.</div>';

  // ── chip helper ──
  const chip = (label, active, onClick) => {
    const b = h('button', { textContent: label });
    b.className = 'tap tp-chip' + (active ? ' on' : '');
    b.onclick = () => onClick(b);
    return b;
  };
  const chipRow = () => { const r = div(''); r.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;'; return r; };

  // ── SETUP ──
  const setup = div(''); setup.style.cssText = 'display:flex;flex-direction:column;gap:20px;';

  // 1 · Trainingstage
  const g1 = div('', '<div class="label" style="font-size:10px;margin-bottom:9px;">1 · TRAININGSTAGE PRO WOCHE</div>');
  const daysRow = chipRow();
  [3, 4, 5, 6].forEach(n => {
    daysRow.appendChild(chip(n + ' Tage', n === st.days, (b) => {
      st.days = n; tpSave(st);
      daysRow.querySelectorAll('.tp-chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
    }));
  });
  g1.appendChild(daysRow); setup.appendChild(g1);

  // 2 · Schwerpunkt
  const g2 = div('', '<div class="label" style="font-size:10px;margin-bottom:9px;">2 · DEIN SCHWERPUNKT</div>');
  const focusRow = chipRow();
  TP_FOCI.forEach(([k, l]) => {
    focusRow.appendChild(chip(l, k === st.focus, (b) => {
      st.focus = k; tpSave(st);
      focusRow.querySelectorAll('.tp-chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
    }));
  });
  g2.appendChild(focusRow); setup.appendChild(g2);

  // 3 · Trainingsarten (multi)
  const g3 = div('', '<div class="label" style="font-size:10px;margin-bottom:9px;">3 · WAS SOLL REIN? <span style="color:var(--t-3);">(mehrfach)</span></div>');
  const modsRow = chipRow();
  Object.entries(TP_MOD).forEach(([k, v]) => {
    modsRow.appendChild(chip(v.label, st.mods.includes(k), (b) => {
      if (st.mods.includes(k)) { st.mods = st.mods.filter(x => x !== k); b.classList.remove('on'); }
      else { st.mods = [...st.mods, k]; b.classList.add('on'); }
      tpSave(st);
    }));
  });
  g3.appendChild(modsRow); setup.appendChild(g3);

  const buildBtn = h('button', { textContent: 'Trainingswoche erstellen' });
  buildBtn.className = 'btn tap';
  buildBtn.style.cssText = 'width:100%;background:var(--blue);color:#fff;font-weight:600;font-size:15px;padding:14px;border:none;border-radius:var(--r-md);margin-top:4px;';
  buildBtn.onclick = () => {
    if (!st.mods.length) { showToast('Wähle mindestens eine Trainingsart', '⚠️'); return; }
    st.shown = true; tpSave(st); renderScreen('trainingsplan');
    haptic('success');
  };
  setup.appendChild(buildBtn);

  // ── RESULT ──
  if (st.shown) {
    setup.style.display = 'none';
    s.appendChild(setup);
    s.appendChild(tpRenderResult(st));
  } else {
    s.appendChild(setup);
  }
}

function tpRenderResult(st) {
  const wrap = div(''); wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
  const focusLabel = (TP_FOCI.find(f => f[0] === st.focus) || TP_FOCI[0])[1];
  const sel = st.mods;

  wrap.insertAdjacentHTML('beforeend',
    '<div class="label" style="font-size:10px;margin-top:6px;">DEINE WOCHE · <b style="color:var(--t-1);">' + st.days + '</b> TAGE · ' +
    focusLabel.toUpperCase() + ' · <b style="color:var(--t-1);">' + sel.length + '</b> ARTEN</div>');

  const tpl = TP_TEMPLATES[st.days] || TP_TEMPLATES[5];
  tpl.forEach((day, idx) => {
    let mods = day.m.filter(m => sel.includes(m));
    let title = day.t, intensity = day.i;
    // a training day that lost all selected modalities becomes active recovery
    if (day.i !== 'rest' && mods.length === 0) { title = 'Aktive Erholung'; intensity = 'rec'; mods = []; }
    const info = TP_INTENSITY[intensity];

    const card = div('glass');
    card.style.cssText = 'border-left:3px solid ' + info.c + ';';
    let blocks;
    if (intensity === 'rest') blocks = '<li>Kein Training. Schlaf, Spaziergang, Sauna/Eisbad, Atemarbeit.</li>';
    else if (mods.length === 0) blocks = '<li>Lockerer Spaziergang / Zone-2, Mobility & Dehnen, Atemübungen.</li>';
    else blocks = mods.map(m => '<li>' + TP_MOD[m].block + '</li>').join('');
    const primer = intensity !== 'rest' ? '<li style="color:var(--t-3);">+ 10 Min Warm-up & Nervensystem-Primer · 5 Min ruhige Nasenatmung zum Ausklang</li>' : '';
    const emph = (intensity === 'hard' || intensity === 'med') && TP_FOCUS_EMPH[st.focus]
      ? '<div style="font-size:11px;color:' + info.c + ';margin-top:8px;padding-top:8px;border-top:1px solid var(--edge);">' + TP_FOCUS_EMPH[st.focus] + '</div>' : '';

    card.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
        '<span style="font-family:monospace;font-size:12px;color:var(--t-3);width:22px;">' + (TP_DAYNAMES[idx] || ('T' + (idx + 1))) + '</span>' +
        '<span style="flex:1;font-size:14px;font-weight:600;color:var(--t-1);">' + title + '</span>' +
        '<span style="font-size:10px;font-weight:600;color:' + info.c + ';background:' + info.c + '22;border:1px solid ' + info.c + '55;padding:2px 8px;border-radius:8px;">' + info.badge + '</span>' +
      '</div>' +
      '<ul style="margin:0 0 0 16px;padding:0;font-size:12px;color:var(--t-2);line-height:1.7;">' + blocks + primer + '</ul>' + emph;

    // integration buttons (only for real training / recovery days)
    if (intensity !== 'rest') {
      const acts = div(''); acts.style.cssText = 'display:flex;gap:7px;margin-top:10px;flex-wrap:wrap;';
      const nnLabel = TP_DAYNAMES[idx] + ': ' + title;
      const bNN = h('button', { textContent: '＋ Non-Negotiable heute' });
      bNN.className = 'tap'; bNN.style.cssText = 'font-size:11px;padding:6px 10px;background:rgba(255,255,255,.06);border:1px solid var(--edge);border-radius:var(--r-sm);color:var(--t-2);';
      bNN.onclick = () => { if (typeof addNN === 'function') { addNN(nnLabel); showToast('Als Non-Negotiable gesetzt', '🔥'); haptic('success'); } };
      const bPlan = h('button', { textContent: '＋ Idee in Tagesplan' });
      bPlan.className = 'tap'; bPlan.style.cssText = 'font-size:11px;padding:6px 10px;background:rgba(255,255,255,.06);border:1px solid var(--edge);border-radius:var(--r-sm);color:var(--t-2);';
      bPlan.onclick = () => {
        if (typeof getPlan === 'function') {
          const p = getPlan(); p.brainDump = p.brainDump || [];
          p.brainDump.push({ id: Date.now(), text: title, duration: 75, priority: 'normal' });
          savePlan(p); showToast('Zum Tagesplan hinzugefügt', '📅'); haptic('success');
        }
      };
      acts.appendChild(bNN); acts.appendChild(bPlan);
      card.appendChild(acts);
    }
    wrap.appendChild(card);
  });

  // nutrition + recovery cards
  const nutri = div('glass', '<div style="font-size:14px;font-weight:600;color:var(--t-1);margin-bottom:6px;">🍽️ Ernährung & Portionen</div>' +
    '<div style="font-size:12px;color:var(--t-2);line-height:1.6;">Iss dich satt — bei dem Pensum ist zu <em>wenig</em> das Risiko, nicht zu viel. Pro Mahlzeit grob:</div>' +
    '<ul style="margin:8px 0 0 16px;padding:0;font-size:12px;color:var(--t-2);line-height:1.7;">' +
    '<li>Protein: 1–2 Handflächen · Carbs: 1–2 Fäuste (mehr an harten Tagen)</li>' +
    '<li>Gemüse: halber Teller · Fette: 1–2 Daumen</li>' +
    '<li>Details im Ernährungsplan · Kreatin täglich, Magnesium abends</li></ul>');
  wrap.appendChild(nutri);

  const recov = div('glass', '<div style="font-size:14px;font-weight:600;color:var(--t-1);margin-bottom:6px;">🌙 Erholung (wo die Anpassung passiert)</div>' +
    '<ul style="margin:0 0 0 16px;padding:0;font-size:12px;color:var(--t-2);line-height:1.7;">' +
    '<li>Schlaf zuerst — dein stärkstes „Supplement"</li>' +
    '<li>Harte Tage nie stapeln · alle 4 Wochen eine leichte Deload-Woche</li>' +
    '<li>Sauna/Eisbad, Faszienrollen, ruhige Nasenatmung nach dem Training</li></ul>');
  wrap.appendChild(recov);

  const disc = div('glass', '<div style="font-size:13px;font-weight:600;color:var(--t-2);margin-bottom:4px;">⚠️ Hinweis</div>' +
    '<div style="font-size:11px;color:var(--t-3);line-height:1.6;">Dieser Plan ist ein Vorschlag, kein medizinischer oder rechtlich verbindlicher Rat. MMA, Plyometrics und schweres Heben haben Verletzungsrisiko — Technik vor Last, bei Schmerzen stoppen, im Zweifel einen Coach fragen.</div>');
  disc.style.cssText = 'opacity:.85;';
  wrap.appendChild(disc);

  const again = h('button', { textContent: '↺ Neu erstellen' });
  again.className = 'btn btn-ghost tap';
  again.style.cssText = 'width:100%;margin-top:4px;';
  again.onclick = () => { const s2 = tpState(); s2.shown = false; tpSave(s2); renderScreen('trainingsplan'); };
  wrap.appendChild(again);

  return wrap;
}
