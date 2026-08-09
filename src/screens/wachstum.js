// ═══════════════════════════════════════════════════════
// WACHSTUM · Journal (auto-save) + Lernen (spaced learning)
// ═══════════════════════════════════════════════════════

// Cards hub for the "Wachstum" section — the areas that aren't daily.
function renderWachstumHub(s) {
  s.className = 'screen on stagger';
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">WACHSTUM</div>' +
    '<div class="h2">Wohin du <span class="gold">wächst</span></div>';

  const areas = [
    { view: 'ich',      ic: '◇', name: 'Ziele',            sub: 'Ziele, Werte, Gewohnheiten, Erfolge', c: '#0A84FF' },
    { view: 'skills',   ic: '🌳', name: 'Skill-Tree',       sub: '9 Phasen · Status, Stufenleiter, erster Schritt', c: '#5AC8FA' },
    { view: 'manifest', ic: '✨', name: 'Manifestieren',     sub: 'Identität, freie Version, fühlen, Gehirn-Modul', c: '#FFD60A' },
    { view: 'kurse',    ic: '🎓', name: 'Kurse & Leitfäden', sub: 'Kurrikulum, eigene Kurse, Leitfäden', c: '#FF9F0A' },
    { view: 'wachstum', ic: '✒', name: 'Journal & Lernen',  sub: 'Journal, Lernliste, Vorbilder, Inspiration', c: '#BF5AF2' },
    { view: 'intel',    ic: '◉', name: 'Wissen',            sub: 'Wissens-Sektionen, Body Fix, KI-Doc', c: '#64D2FF' },
    { view: 'finanzen', ic: '€', name: 'Finanzen',          sub: 'Einnahmen, Ausgaben, Sparziele, Markt', c: '#30D158' },
  ];
  areas.forEach(x => {
    const row = div('row tap', '');
    row.innerHTML =
      '<div style="width:42px;height:42px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;font-size:19px;' +
      'background:' + x.c + '22;border:1px solid ' + x.c + '55;color:' + x.c + ';">' + x.ic + '</div>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + x.name + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:1px;">' + x.sub + '</div></div>' +
      '<span style="color:var(--t-3);font-size:18px;">›</span>';
    row.onclick = () => navTo(x.view);
    s.appendChild(row);
  });
}

function renderWachstum(s) {
  s.className = 'screen on';
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">WACHSTUM</div>' +
    '<div class="h2">Journal & <span class="gold italic">Lernen</span></div>';

  const tabs = ['JOURNAL', 'LERNEN', 'VORBILDER', 'INSPIRATION'];
  const tabRow = div('');
  tabRow.style.cssText = 'display:flex;gap:6px;margin-top:10px;';
  const panels = {};
  tabs.forEach((t, i) => {
    const tb = h('button', { textContent: t }, '');
    tb.className = 'itab tap' + (i === 0 ? ' on' : '');
    tb.onclick = () => {
      tabRow.querySelectorAll('.itab').forEach(x => x.classList.remove('on'));
      tb.classList.add('on');
      Object.values(panels).forEach(p => p.style.display = 'none');
      panels[t].style.display = 'flex';
    };
    tabRow.appendChild(tb);
    panels[t] = div('');
    panels[t].style.cssText = 'flex-direction:column;gap:10px;padding-top:4px;' + (i === 0 ? 'display:flex;' : 'display:none;');
  });
  s.appendChild(tabRow);

  renderJournal(panels['JOURNAL']);
  renderLernen(panels['LERNEN']);
  renderVorbilder(panels['VORBILDER']);
  renderInspiration(panels['INSPIRATION']);

  Object.values(panels).forEach(p => s.appendChild(p));
}

function renderJournal(p) {
  const todayKey = 'los_j_' + new Date().toDateString();
  const allKey = 'los_j_list';
  const E = () => ls(todayKey) || { dankbar: ['', '', ''], gelernt: '', intention: '', freitext: '', mood: null };
  const allE = () => ls(allKey) || [];

  const todayLbl = div('', new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }));
  todayLbl.style.cssText = 'font-size:11px;color:var(--t-2);';
  p.appendChild(todayLbl);

  let entry = E();
  let saveTimer = null;
  const autoSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      ls(todayKey, entry);
      const list = allE();
      const dk = new Date().toDateString();
      const ei = list.findIndex(x => x.date === dk);
      const rec = { date: dk, label: new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }), preview: (entry.freitext || entry.gelernt || 'Eintrag').slice(0, 50) };
      if (ei >= 0) list[ei] = rec; else list.unshift(rec);
      ls(allKey, list.slice(0, 30));
    }, 600);
  };

  const dc = div('glass-hi', '<div class="label" style="font-size:10px;margin-bottom:10px;">DANKBARKEIT · 3 DINGE</div>');
  entry.dankbar.forEach((d, i) => {
    const inp = h('input', { type: 'text', placeholder: (i + 1) + '. Wofür bin ich heute dankbar…', value: d }, '');
    inp.className = 'inp inp-serif';
    inp.style.cssText = 'font-size:13px;margin-bottom:' + (i < 2 ? '6px' : '0') + ';';
    inp.oninput = e => { entry.dankbar[i] = e.target.value; autoSave(); };
    dc.appendChild(inp);
  });
  p.appendChild(dc);

  const gc = div('glass', '<div class="label" style="font-size:10px;margin-bottom:7px;">WAS HABE ICH HEUTE GELERNT?</div>');
  const gi = h('textarea', { placeholder: 'Einsicht, Erkenntnis, neue Fähigkeit…' }, '');
  gi.className = 'inp inp-serif'; gi.rows = 2; gi.value = entry.gelernt || '';
  gi.oninput = e => { entry.gelernt = e.target.value; gi.style.height = 'auto'; gi.style.height = Math.min(gi.scrollHeight, 120) + 'px'; autoSave(); };
  gc.appendChild(gi); p.appendChild(gc);

  const ic2 = div('glass', '<div class="label" style="font-size:10px;margin-bottom:7px;">INTENTION FÜR MORGEN</div>');
  const ii = h('input', { type: 'text', placeholder: 'Was nehme ich mir vor…', value: entry.intention || '' }, '');
  ii.className = 'inp inp-serif'; ii.style.fontSize = '12px';
  ii.oninput = e => { entry.intention = e.target.value; autoSave(); };
  ic2.appendChild(ii); p.appendChild(ic2);

  const fc = div('glass', '<div class="label" style="font-size:10px;margin-bottom:7px;">FREIE GEDANKEN</div>');
  const fi = h('textarea', { placeholder: 'Was geht dir durch den Kopf? Alles erlaubt.' }, '');
  fi.className = 'inp inp-serif'; fi.rows = 3; fi.value = entry.freitext || '';
  fi.oninput = e => { entry.freitext = e.target.value; fi.style.height = 'auto'; fi.style.height = Math.min(fi.scrollHeight, 150) + 'px'; autoSave(); };
  fc.appendChild(fi); p.appendChild(fc);

  const hist = allE().filter(e => e.date !== new Date().toDateString());
  if (hist.length) {
    const hlbl = div('label', 'FRÜHERE EINTRÄGE'); hlbl.style.fontSize = '7px'; p.appendChild(hlbl);
    hist.slice(0, 5).forEach(e => {
      const r = div('row tap', '<span style="font-size:14px;">✒</span>' +
        '<div style="flex:1;"><div class="serif" style="font-size:13px;color:var(--t-1);">' + e.label + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);margin-top:1px;">' + e.preview + (e.preview.length >= 50 ? '…' : '') + '</div></div>' +
        '<span style="color:var(--t-3);font-size:13px;">›</span>');
      r.onclick = () => openJournalEntry(e.date);
      p.appendChild(r);
    });
  }
}

function openJournalEntry(dateKey) {
  const e = ls('los_j_' + dateKey);
  if (!e) return;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:14px;">' + new Date(dateKey).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '</div>');
  if (e.dankbar && e.dankbar.filter(Boolean).length) {
    const c = div('glass', '<div class="label" style="font-size:10px;margin-bottom:8px;">DANKBARKEIT</div>');
    c.style.marginBottom = '10px';
    e.dankbar.filter(Boolean).forEach((d, i) => { c.insertAdjacentHTML('beforeend', '<div class="serif" style="font-size:13px;color:var(--t-1);padding:4px 0;' + (i > 0 ? 'border-top:1px solid var(--edge)' : '') + '">' + d + '</div>'); });
    inner.appendChild(c);
  }
  if (e.gelernt) {
    const c = div('glass', '<div class="label" style="font-size:10px;margin-bottom:6px;">GELERNT</div><div class="serif" style="font-size:13px;color:var(--t-2);line-height:1.7;">' + e.gelernt + '</div>');
    c.style.marginBottom = '10px';
    inner.appendChild(c);
  }
  if (e.freitext) {
    const c = div('glass', '<div class="label" style="font-size:10px;margin-bottom:6px;">GEDANKEN</div><div class="serif" style="font-size:13px;color:var(--t-2);line-height:1.75;">' + e.freitext + '</div>');
    inner.appendChild(c);
  }
  openOverlay();
}

function renderLernen(p) {
  const LK = () => ls('los_lernen') || { learning: [], mastered: [], review: [] };
  const SL = v => ls('los_lernen', v);

  function refresh() {
    p.innerHTML = '';
    const data = LK();

    const ll = div('label', '◐ ICH LERNE GERADE'); ll.style.cssText = 'font-size:10px;color:var(--blue);'; p.appendChild(ll);
    if (!data.learning.length) {
      const e = div('italic', 'Noch nichts eingetragen');
      e.style.cssText = 'font-size:12px;color:var(--t-3);padding:4px 0;';
      p.appendChild(e);
    }
    data.learning.forEach(item => {
      const r = div('row', '<span class="dot" style="background:var(--blue);box-shadow:0 0 8px var(--blue-glow);"></span>' +
        '<div style="flex:1;"><div style="font-size:13px;">' + item.text + '</div>' + (item.note ? '<div style="font-size:11px;color:var(--t-3);margin-top:2px;">' + item.note + '</div>' : '') + '</div>');
      const mb = h('button', { textContent: '✓ KANN ICH' }, '');
      mb.style.cssText = 'padding:4px 9px;background:rgba(92,184,117,.12);border:1px solid rgba(92,184,117,.25);border-radius:var(--r-sm);color:var(--green);font-size:11px;white-space:nowrap;';
      mb.onclick = () => { const d = LK(); d.mastered = [...d.mastered, Object.assign({}, item, { masteredDate: new Date().toLocaleDateString('de-DE') })]; d.learning = d.learning.filter(x => x.id !== item.id); SL(d); refresh(); };
      const rv = h('button', { textContent: '↺', title: 'Zur Wiederholung' }, '');
      rv.style.cssText = 'padding:4px 8px;background:rgba(224,190,126,.1);border:1px solid rgba(224,190,126,.22);border-radius:var(--r-sm);color:var(--gold);font-size:11px;';
      rv.onclick = () => { const d = LK(); d.review = [...d.review, Object.assign({}, item, { due: new Date().toLocaleDateString('de-DE') })]; d.learning = d.learning.filter(x => x.id !== item.id); SL(d); refresh(); };
      r.appendChild(mb); r.appendChild(rv); p.appendChild(r);
    });

    if (data.review.length) {
      const rl = div('label', '↺ WIEDERHOLUNG NÖTIG'); rl.style.cssText = 'font-size:10px;color:var(--gold);margin-top:8px;'; p.appendChild(rl);
      data.review.forEach(item => {
        const r = div('row glass-accent', '<span style="font-size:14px;">↺</span>' +
          '<div style="flex:1;"><div style="font-size:13px;">' + item.text + '</div><div style="font-size:11px;color:var(--t-3);margin-top:1px;">Seit ' + item.due + '</div></div>');
        const mb = h('button', { textContent: '✓' }, '');
        mb.style.cssText = 'padding:4px 9px;background:rgba(92,184,117,.12);border:1px solid rgba(92,184,117,.25);border-radius:var(--r-sm);color:var(--green);font-size:11px;';
        mb.onclick = () => { const d = LK(); d.mastered = [...d.mastered, Object.assign({}, item)]; d.review = d.review.filter(x => x.id !== item.id); SL(d); refresh(); };
        const bl = h('button', { textContent: 'Wieder lernen' }, '');
        bl.style.cssText = 'padding:4px 9px;background:rgba(107,165,212,.1);border:1px solid rgba(107,165,212,.2);border-radius:var(--r-sm);color:var(--blue);font-size:11px;white-space:nowrap;';
        bl.onclick = () => { const d = LK(); d.learning = [...d.learning, Object.assign({}, item)]; d.review = d.review.filter(x => x.id !== item.id); SL(d); refresh(); };
        r.appendChild(mb); r.appendChild(bl); p.appendChild(r);
      });
    }

    if (data.mastered.length) {
      const ml = div('label', '✓ ICH KANN BEREITS'); ml.style.cssText = 'font-size:10px;color:var(--green);margin-top:8px;'; p.appendChild(ml);
      data.mastered.slice(0, 8).forEach(item => {
        const r = div('row done', '<span style="color:var(--green);font-size:13px;">✓</span><div style="flex:1;font-size:12px;">' + item.text + '</div>' +
          (item.masteredDate ? '<span style="font-size:10px;color:var(--t-3);">' + item.masteredDate + '</span>' : ''));
        p.appendChild(r);
      });
    }

    const addlbl = div('label', 'NEU HINZUFÜGEN'); addlbl.style.cssText = 'font-size:10px;margin-top:8px;'; p.appendChild(addlbl);
    const row2 = div('');
    row2.style.cssText = 'display:flex;gap:7px;';
    const inp = h('input', { type: 'text', placeholder: 'Was lernst du gerade? (Sprache, Fähigkeit, Wissen…)' }, '');
    inp.className = 'inp';
    const ab = h('button', { textContent: '+' }, '');
    ab.style.cssText = 'width:48px;height:44px;display:flex;align-items:center;justify-content:center;background:rgba(107,165,212,.12);border:1px solid rgba(107,165,212,.25);border-radius:var(--r-md);color:var(--blue);font-size:14px;flex-shrink:0;';
    ab.onclick = () => { const v = inp.value.trim(); if (!v) return; const d = LK(); d.learning = [...d.learning, { id: Date.now(), text: v, note: '', added: new Date().toLocaleDateString('de-DE') }]; SL(d); inp.value = ''; refresh(); };
    inp.onkeydown = e => { if (e.key === 'Enter') ab.onclick(); };
    row2.appendChild(inp); row2.appendChild(ab); p.appendChild(row2);
  }
  refresh();
}
