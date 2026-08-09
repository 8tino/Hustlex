// ═══════════════════════════════════════════════════════
// MANIFEST · Identitäts-basiertes Manifestieren — nicht "sei es
//   einfach", sondern das konkrete WIE: die Identität definieren,
//   die kostenlose Version dessen tun was die "reiche" Version tut,
//   es wirklich fühlen (Verkörperungs-Meditation), Beweise sammeln.
//   Plus ein Gehirn-Modul, das erklärt WARUM das funktioniert (RAS,
//   Neuroplastizität, Dopamin, Amygdala, mentales Training).
//   Stores: los_manifest = { identity, why, feeling, bridges:[], evidence:[] }
// ═══════════════════════════════════════════════════════

function getManifest() {
  const m = ls('los_manifest') || {};
  return { identity: m.identity || '', why: m.why || '', feeling: m.feeling || '', bridges: m.bridges || [], evidence: m.evidence || [] };
}
function saveManifest(m) { ls('los_manifest', m); }

function renderManifest(s) {
  s.className = 'screen on';
  const m = getManifest();
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">MANIFESTIEREN</div>' +
    '<div class="h2">Werde, wer du <span class="gold">sein willst</span></div>';

  const intro = div('', 'Manifestieren heißt nicht „wünschen". Es heißt: die Identität wählen — und ab heute so handeln und fühlen. Du kannst mit wenig Geld schon die <b>kostenlose Version</b> dessen tun, was die „reiche" Version tut. Genau dabei hilft dieses Tool.');
  intro.style.cssText = 'font-size:12px;color:var(--t-3);line-height:1.6;margin-bottom:4px;';
  s.appendChild(intro);

  // ── 1. IDENTITÄT ──────────────────────────────────────
  const idc = div('glass-hi', '');
  idc.style.cssText = 'padding:16px;';
  idc.innerHTML = '<div class="label" style="margin-bottom:8px;">DEINE IDENTITÄT</div>' +
    (m.identity
      ? '<div class="serif" style="font-size:17px;color:var(--t-1);line-height:1.4;">„Ich bin jemand, der ' + esc(m.identity) + '"</div>' +
        (m.why ? '<div class="italic" style="font-size:13px;color:var(--t-3);margin-top:8px;line-height:1.5;">' + esc(m.why) + '</div>' : '')
      : '<div style="font-size:13px;color:var(--t-3);line-height:1.5;">Noch nicht gesetzt. Wer willst du sein? Nicht „was", sondern „wer" — z. B. „diszipliniert früh aufsteht und trainiert", „ruhig und präsent im Raum ist".</div>');
  const idBtn = h('button', { textContent: m.identity ? '✎ Identität bearbeiten' : '＋ Identität festlegen' });
  idBtn.className = 'btn btn-glass tap'; idBtn.style.cssText = 'font-size:13px;margin-top:12px;';
  idBtn.onclick = () => {
    const iv = prompt('Ich bin jemand, der… (Verhalten, nicht Besitz)', m.identity || '');
    if (iv === null) return;
    const wv = prompt('Warum? Was ändert das für dich? (optional)', m.why || '');
    const mm = getManifest(); mm.identity = iv.trim(); if (wv !== null) mm.why = wv.trim();
    saveManifest(mm); renderManifest(s);
  };
  idc.appendChild(idBtn);
  s.appendChild(idc);

  // ── 2. REICHE VERSION → JETZT-VERSION (der Kern) ──────
  s.appendChild(div('label', 'DIE „REICHE" VERSION → WAS DU JETZT TUST'));
  const bridgeIntro = div('', 'Hinter jeder Sache, die viel Geld kostet, steckt ein <b>Verhalten</b>, das du auch mit 0 € leben kannst. Trag ein, was die Version von dir mit viel täte — und die freie Variante, die du <b>heute</b> tun kannst.');
  bridgeIntro.style.cssText = 'font-size:12px;color:var(--t-3);line-height:1.6;margin-bottom:6px;';
  s.appendChild(bridgeIntro);

  const addBridge = h('button', { textContent: '＋  BRÜCKE HINZUFÜGEN' });
  addBridge.className = 'btn btn-gold tap'; addBridge.style.marginBottom = '4px';
  addBridge.onclick = () => {
    const r = prompt('Was täte die „reiche"/erfolgreiche Version? (z. B. „Personal Trainer 5×/Woche")');
    if (!r || !r.trim()) return;
    const f = prompt('Die kostenlose Version davon, die du JETZT tun kannst? (z. B. „5×/Woche selbst nach Plan trainieren")');
    if (f === null) return;
    const mm = getManifest(); mm.bridges.unshift({ id: Date.now(), rich: r.trim(), free: (f || '').trim() }); saveManifest(mm); renderManifest(s);
  };
  s.appendChild(addBridge);

  if (!m.bridges.length) {
    const e = div('glass', 'Beispiel: „Erste Klasse fliegen" → „Reisen bewusst & ausgeruht angehen, Rituale statt Hektik." · „Teure Uhr" → „Pünktlichkeit & Zeit bewusst wertschätzen."');
    e.style.cssText = 'border-style:dashed;font-size:12px;color:var(--t-3);line-height:1.6;';
    s.appendChild(e);
  }
  m.bridges.forEach(b => {
    const card = div('glass', '');
    card.style.cssText = 'padding:13px;';
    card.innerHTML = '<div style="font-size:12px;color:var(--t-3);">💰 Reiche Version</div>' +
      '<div style="font-size:14px;color:var(--t-2);margin:2px 0 8px;">' + esc(b.rich) + '</div>' +
      '<div style="font-size:12px;color:var(--green);">✅ Was du JETZT tust</div>' +
      '<div style="font-size:14px;color:var(--t-1);font-weight:600;margin-top:2px;">' + esc(b.free || '—') + '</div>';
    const acts = div(''); acts.style.cssText = 'display:flex;gap:6px;margin-top:10px;';
    const toToday = h('button', { textContent: '🌱 Heute tun' }); toToday.className = 'itab tap'; toToday.style.cssText = 'flex:1;font-size:11.5px;text-transform:none;letter-spacing:0;';
    toToday.onclick = () => { if (b.free && typeof skillToToday === 'function') skillToToday(b.free, b.free); else if (b.free) { if (typeof addNN === 'function') addNN(b.free); haptic('success'); showToast('Als Non-Negotiable gesetzt', '🌱'); } };
    const del = h('button', { textContent: '×' }); del.className = 'itab tap'; del.style.cssText = 'width:44px;font-size:15px;';
    del.onclick = () => { const mm = getManifest(); mm.bridges = mm.bridges.filter(x => x.id !== b.id); saveManifest(mm); renderManifest(s); };
    acts.appendChild(toToday); acts.appendChild(del); card.appendChild(acts);
    s.appendChild(card);
  });

  // ── 3. FÜHL-ÜBUNG (Verkörperung, mit Meditation) ──────
  s.appendChild(div('label', 'ES WIRKLICH FÜHLEN'));
  const feelCard = div('glass', '');
  feelCard.innerHTML = '<div style="font-size:13px;color:var(--t-2);line-height:1.6;">Dein Gehirn unterscheidet lebhaft Vorgestelltes kaum von Erlebtem. 3 Minuten täglich, in denen du die Identität <b>fühlst</b> (nicht nur denkst), bahnen die neuronalen Muster, die dein Verhalten steuern.</div>';
  const feelBtn = h('button', { textContent: '🧘  3-Minuten-Verkörperung starten' });
  feelBtn.className = 'btn btn-gold tap'; feelBtn.style.marginTop = '12px';
  feelBtn.onclick = () => openEmbodiment(s);
  feelCard.appendChild(feelBtn);
  s.appendChild(feelCard);

  // ── 4. BEWEIS-LOG (RAS / Bestätigung) ─────────────────
  s.appendChild(div('label', 'BEWEIS-LOG · DU WIRST ES SCHON'));
  const evIntro = div('', 'Notiere kleine Belege, dass du schon zu dieser Person wirst. Das trainiert dein Gehirn (RAS), aktiv nach mehr davon zu suchen — statt nach Gründen, warum es nicht geht.');
  evIntro.style.cssText = 'font-size:12px;color:var(--t-3);line-height:1.6;margin-bottom:4px;';
  s.appendChild(evIntro);
  const evRow = div(''); evRow.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;';
  const evInp = h('input', { type: 'text', placeholder: 'z. B. „Heute trotz Müdigkeit trainiert"', maxLength: 120 }); evInp.className = 'inp'; evInp.style.cssText = 'flex:1;font-size:14px;';
  const evAdd = h('button', { textContent: '+' }); evAdd.className = 'btn btn-gold tap'; evAdd.style.cssText = 'width:48px;height:48px;padding:0;flex:none;border-radius:var(--r-md);font-size:20px;';
  const doEv = () => { const v = evInp.value.trim(); if (!v) return; const mm = getManifest(); mm.evidence.unshift({ id: Date.now(), date: today(), text: v }); saveManifest(mm); addXP(10, 'goals'); haptic('success'); renderManifest(s); };
  evAdd.onclick = doEv; evInp.onkeydown = e => { if (e.key === 'Enter') doEv(); };
  evRow.appendChild(evInp); evRow.appendChild(evAdd); s.appendChild(evRow);
  m.evidence.slice(0, 30).forEach(ev => {
    const r = div('row', '<span style="font-size:15px;">✓</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);">' + esc(ev.text) + '</div>' +
      '<div style="font-size:11px;color:var(--t-4);margin-top:1px;">' + new Date(ev.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + '</div></div>');
    const del = h('button', { textContent: '×' }); del.style.cssText = 'background:none;color:var(--t-4);font-size:15px;';
    del.onclick = () => { const mm = getManifest(); mm.evidence = mm.evidence.filter(x => x.id !== ev.id); saveManifest(mm); renderManifest(s); };
    r.appendChild(del); s.appendChild(r);
  });

  // ── 5. 🧠 SO FUNKTIONIERT DEIN GEHIRN DABEI ───────────
  // Curated brain-science explainer + course link — owner build only (stripped
  // from the public/tester build together with the rest of the loaded content).
  if (typeof HUSTLEX_PUBLIC === 'undefined' || !HUSTLEX_PUBLIC) {
    s.appendChild(div('label', '🧠 WARUM DAS FUNKTIONIERT'));
    BRAIN_BITS.forEach((bit, i) => {
      const det = document.createElement('details');
      det.className = 'glass'; det.style.cssText = 'padding:12px 14px;margin-bottom:8px;';
      det.innerHTML = '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--t-1);">' + bit.ic + ' ' + esc(bit.t) + '</summary>' +
        '<div style="font-size:13px;color:var(--t-2);line-height:1.65;margin-top:8px;">' + bit.body + '</div>' +
        '<div style="font-size:12px;color:var(--gold);margin-top:8px;line-height:1.5;">→ ' + esc(bit.use) + '</div>';
      s.appendChild(det);
    });
    const courseBtn = h('button', { textContent: '🎓  Ganzen Gehirn-Kurs öffnen' });
    courseBtn.className = 'btn btn-glass tap'; courseBtn.style.marginTop = '4px';
    courseBtn.onclick = () => {
      if (typeof KURR === 'function' && KURR()) {
        const g = (KURR().kurse || []).find(k => k.id === 'm13');
        if (g && typeof KURS_OPEN !== 'undefined') { KURS_OPEN = 'kurr:m13'; navTo('kurse'); return; }
      }
      navTo('kurse');
    };
    s.appendChild(courseBtn);
  }
}

// Kompakte, ehrliche Neuro-Erklärungen (kein Eso — belegte Mechanismen),
// jede mit konkretem Bezug zur Manifestier-Praxis oben.
const BRAIN_BITS = [
  { ic: '🎯', t: 'RAS — dein Aufmerksamkeits-Filter', use: 'Identität + Beweis-Log klar halten → dein Gehirn zeigt dir Wege, die du vorher übersehen hast.',
    body: 'Das <b>Retikuläre Aktivierungssystem</b> im Hirnstamm filtert die Millionen Reize pro Sekunde auf das, was du für wichtig hältst. Deshalb siehst du „plötzlich überall" ein Auto, das du kaufen willst. Wenn du deine Identität und deine Beweise bewusst machst, priorisiert das RAS passende Chancen und Verhaltensweisen — es ist kein Zauber, sondern gelenkte Wahrnehmung.' },
  { ic: '🌱', t: 'Neuroplastizität — Wiederholung formt dich', use: 'Täglich die freie Version tun → aus Anstrengung wird Automatik.',
    body: '„Neurons that fire together, wire together." Jede Wiederholung eines Gedankens oder Verhaltens verstärkt die zuständige Nervenbahn (Myelinisierung). Ein neues Selbstbild ist anfangs mühsam, weil die Bahn dünn ist — durch tägliches Handeln wird sie zur Autobahn. Identität entsteht durch <b>Häufigkeit</b>, nicht durch Intensität.' },
  { ic: '⚡', t: 'Dopamin — Vorfreude treibt Verhalten', use: 'Kleine Beweise feiern (Beweis-Log, +XP) → dein Gehirn will mehr davon.',
    body: 'Dopamin wird v. a. bei der <b>Erwartung</b> einer Belohnung ausgeschüttet, nicht erst beim Erreichen. Wenn du kleine Fortschritte sichtbar machst und markierst, koppelt dein Gehirn das Verhalten an Belohnung — und zieht dich zurück zur Handlung. Genau darum funktioniert das Abhaken.' },
  { ic: '🛡', t: 'Amygdala — Sicherheit vor Neuem', use: 'Klein anfangen (30-Sek-Schritte) → keine Alarmreaktion, das Neue bleibt.',
    body: 'Die <b>Amygdala</b> wittert bei allem Ungewohnten Gefahr und bremst Veränderung. Große Sprünge lösen Widerstand/Aufschieben aus. Winzige Schritte fliegen unter ihrem Radar — deshalb schlägt „2 Minuten" fast immer „alles auf einmal". Selbstbeobachtung (Metakognition) senkt zusätzlich die Alarmreaktion.' },
  { ic: '🎬', t: 'Mentales Training — der Geist als Übungsraum', use: 'Die 3-Min-Verkörperung ernst nehmen → körperlich messbar besser.',
    body: 'Beim lebhaften Vorstellen einer Bewegung feuern <b>fast dieselben Areale</b> wie beim realen Tun (Motor Imagery). Sportler und Chirurgen nutzen das nachweislich zur Leistungssteigerung. „Fühl es, als wäre es schon so" ist also echtes Training — solange es mit allen Sinnen und in der Ich-Perspektive geschieht.' },
  { ic: '🏃', t: 'Verhaltensaktivierung — Handeln vor Gefühl', use: 'Erst die freie Version tun, das Gefühl folgt — nicht umgekehrt warten.',
    body: 'Man muss sich nicht erst „wie die Person fühlen", um zu handeln. Aus der Psychologie: <b>Handlung erzeugt Gefühl</b> mindestens so oft wie umgekehrt. Wer die Verhaltensweisen der Zielidentität ausführt, empfindet die passende Identität zunehmend als echt. Deshalb steht Handeln in diesem Tool vor dem Fühlen.' },
];

// 3-Minuten-Verkörperungs-Meditation (geführt, mit Timer).
function openEmbodiment(s) {
  const m = getManifest();
  const inner = el('overlay_inner'); inner.innerHTML = ''; inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">VERKÖRPERUNG · 3 MIN</div>' +
    '<div class="h2" style="margin-bottom:6px;">Fühl es, als wäre es <span class="gold">schon so</span></div>' +
    (m.identity ? '<div class="serif italic" style="font-size:14px;color:var(--t-2);margin-bottom:12px;line-height:1.5;">„Ich bin jemand, der ' + esc(m.identity) + '"</div>' : ''));

  const steps = [
    { t: 45, txt: '🌬 Ruhig atmen. 4 Sekunden ein, 6 Sekunden aus. Lass die Schultern sinken.' },
    { t: 60, txt: '🎬 Stell dir einen ganz normalen Tag vor — als die Person, die du sein willst. Wie stehst du? Wie bewegst du dich? Was tust du zuerst?' },
    { t: 45, txt: '❤️ Spür das Gefühl: ruhig, sicher, fähig. Nicht denken „ich werde" — fühlen „ich bin".' },
    { t: 30, txt: '✅ Sieh einen kleinen Beweis von heute vor dir. Das bist schon du.' },
  ];
  let idx = 0, remaining = steps[0].t;
  const box = div('glass-hi', ''); box.style.cssText = 'padding:20px;text-align:center;margin-bottom:12px;min-height:150px;display:flex;flex-direction:column;justify-content:center;';
  const timeEl = div('serif', ''); timeEl.style.cssText = 'font-size:44px;font-weight:300;color:var(--gold);line-height:1;margin-bottom:12px;';
  const txtEl = div('', ''); txtEl.style.cssText = 'font-size:15px;color:var(--t-1);line-height:1.6;';
  box.appendChild(timeEl); box.appendChild(txtEl); inner.appendChild(box);
  const paint = () => { timeEl.textContent = remaining + 's'; txtEl.innerHTML = steps[idx].txt; };
  paint();
  const done = div('', ''); done.style.cssText = 'display:none;text-align:center;';
  inner.appendChild(done);
  const timer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      idx++;
      if (idx >= steps.length) {
        clearInterval(timer);
        box.style.display = 'none';
        done.style.display = 'block';
        done.innerHTML = '<div style="font-size:40px;">🌟</div><div class="h2" style="margin-top:6px;">Stark.</div><div style="font-size:14px;color:var(--t-2);margin-top:6px;line-height:1.5;">Jetzt tu eine kleine Sache, die dazu passt — solange das Gefühl frisch ist.</div>';
        addXP(15, 'mind'); haptic('success');
        const b = h('button', { textContent: 'FERTIG' }); b.className = 'btn btn-gold tap'; b.style.marginTop = '16px';
        b.onclick = () => { closeOverlay(); if (STATE.view === 'manifest') renderManifest(s); };
        done.appendChild(b);
        return;
      }
      remaining = steps[idx].t;
    }
    paint();
  }, 1000);
  openOverlay();
}
