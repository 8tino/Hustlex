// ═══════════════════════════════════════════════════════
// KURSE · One tidy area for both worlds:
//   1) KURRIKULUM — the shipped 10-course/179-chapter curriculum
//      (KURSE_DATA, embedded at build time). Sorted by reihenfolge.pfad,
//      phase filter via lernpfad, chapter full text + control questions.
//   2) EIGENE KURSE — self-built courses with lessons, exam & certificate.
//
//   Progress lives in localStorage like the rest of HustleX (→ cloud sync
//   + auto-backup):
//     los_kurse_fortschritt = { "m1.4": { done:true, checks:{0:true,2:true} } }
//     los_courses           = [ …custom courses… ]
// ═══════════════════════════════════════════════════════

const KURR_BUCKET_COLORS = { rot: '#FF453A', gelb: '#FF9F0A', gruen: '#30D158', ignorieren: '#8E8E93', neutral: '#6E6E73' };
const KURR_BUCKET_LABELS = { rot: '🔴 Jetzt', gelb: '🟡 Bald', gruen: '🟢 Später', ignorieren: '⚪ Skip' };

let KURS_OPEN = null;      // null | 'kurr:m1' | 'eigen:<id>'

// ─── curriculum data + progress ───────────────────────
function KURR() { return (typeof KURSE_DATA !== 'undefined' && KURSE_DATA) ? KURSE_DATA.manifest : null; }
function kurrText(courseId, nr) { return (typeof KURSE_DATA !== 'undefined' && KURSE_DATA.volltext) ? KURSE_DATA.volltext[courseId + '.' + nr] : ''; }
function kurrProg() { return ls('los_kurse_fortschritt') || {}; }
function saveKurrProg(p) { ls('los_kurse_fortschritt', p); }
function kapKey(courseId, nr) { return courseId + '.' + nr; }
function kapDone(courseId, nr) { const e = kurrProg()[kapKey(courseId, nr)]; return !!(e && e.done); }
function kursDoneCount(kurs) { return (kurs.kapitel || []).filter(k => kapDone(kurs.id, k.nr)).length; }
function kursPct(kurs) { const t = (kurs.kapitel || []).length; return t ? Math.round((kursDoneCount(kurs) / t) * 100) : 0; }

// Courses in recommended-path order.
function kurseByPfad() {
  const m = KURR(); if (!m) return [];
  const order = (m.reihenfolge?.pfad || []).map(x => x.id);
  const byId = {}; (m.kurse || []).forEach(k => byId[k.id] = k);
  const out = order.map(id => byId[id]).filter(Boolean);
  // any course not in the path → append at the end
  (m.kurse || []).forEach(k => { if (!order.includes(k.id)) out.push(k); });
  return out;
}

// Which lernpfad bucket a course sits in, for the selected phase.
function bucketOf(phaseNum, courseId) {
  const m = KURR(); if (!m) return 'neutral';
  const lp = m.lernpfad && m.lernpfad['phase' + phaseNum];
  if (!lp) return 'neutral';
  for (const b of ['rot', 'gelb', 'gruen', 'ignorieren']) if ((lp[b] || []).includes(courseId)) return b;
  return 'neutral';
}

// Next chapter to do: walk the path, first course chapter not yet done.
function kurrNext() {
  for (const kurs of kurseByPfad()) {
    const kap = (kurs.kapitel || []).slice().sort((a, b) => a.nr - b.nr).find(k => !kapDone(kurs.id, k.nr));
    if (kap) return { kurs, kap };
  }
  return null;
}

// ─── phase filter state ───────────────────────────────
function kursPhase() { return ls('los_kurse_phase') || 1; }
function kursBuckets() { return ls('los_kurse_buckets') || { rot: true, gelb: true, gruen: true, ignorieren: false, neutral: true }; }

// ─── ROOT DISPATCH ────────────────────────────────────
function renderKurse(s) {
  s.className = 'screen on';
  if (KURS_OPEN && KURS_OPEN.startsWith('kurr:')) {
    const kurs = (KURR()?.kurse || []).find(k => k.id === KURS_OPEN.slice(5));
    if (kurs) { renderKurrDetail(s, kurs); return; }
    KURS_OPEN = null;
  }
  if (KURS_OPEN && KURS_OPEN.startsWith('eigen:')) {
    const c = getCourse(KURS_OPEN.slice(6));
    if (c) {
      s.innerHTML = '<div class="label" style="margin-bottom:4px;">EIGENER KURS</div><div class="h2">Dein <span class="gold">Kurs</span></div>';
      renderCourseDetail(s, c); return;
    }
    KURS_OPEN = null;
  }
  renderKurseOverview(s);
}

// ─── OVERVIEW (curriculum + own) ──────────────────────
function renderKurseOverview(s) {
  const m = KURR();
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">KURSE</div>' +
    '<div class="h2">Deine <span class="gold">Akademie</span></div>';

  // Intelligente Suche über alle Kurse (Kurrikulum + eigene).
  // ksItems = filterbare Kurs-Karten, ksCtx = Kontext, das beim Suchen ausblendet.
  const ksItems = [], ksCtx = [];
  const ksSearch = h('input', { type: 'search', placeholder: '🔍 Kurs suchen…' }, '');
  ksSearch.className = 'inp'; ksSearch.style.cssText = 'width:100%;font-size:14px;margin-bottom:4px;';
  s.appendChild(ksSearch);

  // Next-up card
  const next = m ? kurrNext() : null;
  if (next) {
    const c = div('glass-hi tap', '');
    c.style.cssText = 'padding:16px;';
    c.innerHTML = '<div class="label" style="color:' + pColor() + ';margin-bottom:8px;">▶ NÄCHSTES DRAN</div>' +
      '<div style="font-size:16px;font-weight:650;color:var(--t-1);line-height:1.35;">' + next.kap.nr + '. ' + esc(next.kap.titel) + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:4px;">' + esc(next.kurs.kurztitel || next.kurs.titel) + ' · ' + kursDoneCount(next.kurs) + '/' + next.kurs.kapitel.length + ' Kapitel</div>';
    c.onclick = () => { KURS_OPEN = 'kurr:' + next.kurs.id; renderScreen('kurse'); setTimeout(() => openKapitel(next.kurs.id, next.kap.nr), 60); };
    s.appendChild(c); ksCtx.push(c);
  } else if (m) {
    const c = div('glass-success', 'Alle Kapitel erledigt. Respekt. 🎓');
    c.style.cssText = 'text-align:center;padding:16px;font-size:14px;color:var(--green);';
    s.appendChild(c); ksCtx.push(c);
  }

  // Phase filter
  if (m && m.lernpfad) {
    const phase = kursPhase(), buckets = kursBuckets();
    const pRow = div(''); ksCtx.push(pRow); pRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
    [1, 2, 3, 4].forEach(n => {
      const lp = m.lernpfad['phase' + n]; if (!lp) return;
      const b = h('button', { textContent: 'Phase ' + n });
      b.className = 'itab tap' + (phase === n ? ' on' : '');
      b.title = lp.titel || '';
      b.onclick = () => { ls('los_kurse_phase', n); renderScreen('kurse'); };
      pRow.appendChild(b);
    });
    s.appendChild(pRow);
    const lp = m.lernpfad['phase' + phase];
    if (lp) {
      const hint = div('', esc(lp.titel || '') + (lp.hinweis ? ' · ' + esc(lp.hinweis) : ''));
      hint.style.cssText = 'font-size:12px;color:var(--t-3);margin-top:6px;line-height:1.5;';
      s.appendChild(hint); ksCtx.push(hint);
    }
    const bRow = div(''); ksCtx.push(bRow); bRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;';
    ['rot', 'gelb', 'gruen', 'ignorieren'].forEach(bk => {
      const on = buckets[bk] !== false;
      const b = h('button', { textContent: KURR_BUCKET_LABELS[bk] });
      b.className = 'tap';
      b.style.cssText = 'padding:7px 11px;border-radius:99px;font-size:12px;border:1px solid ' + (on ? KURR_BUCKET_COLORS[bk] : 'var(--edge)') + ';background:' + (on ? KURR_BUCKET_COLORS[bk] + '22' : 'transparent') + ';color:' + (on ? KURR_BUCKET_COLORS[bk] : 'var(--t-3)') + ';';
      b.onclick = () => { const nb = kursBuckets(); nb[bk] = !on; ls('los_kurse_buckets', nb); renderScreen('kurse'); };
      bRow.appendChild(b);
    });
    s.appendChild(bRow);

    // Curriculum courses
    const kurrLbl = div('label', 'KURRIKULUM'); s.appendChild(kurrLbl); ksCtx.push(kurrLbl);
    const buck = kursBuckets();
    let shown = 0;
    kurseByPfad().forEach(kurs => {
      const bk = bucketOf(phase, kurs.id);
      if (buck[bk] === false) return;
      shown++;
      const pct = kursPct(kurs);
      const col = KURR_BUCKET_COLORS[bk] || pColor();
      const card = div('glass tap', '');
      card.style.cssText = 'display:flex;align-items:center;gap:14px;';
      card.appendChild(progressRing(pct, pct === 100 ? '#30D158' : col, 52, 6, '<span style="font-size:13px;font-weight:700;color:var(--t-1);">' + pct + '</span>'));
      card.insertAdjacentHTML('beforeend',
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:15px;font-weight:600;color:var(--t-1);">' + esc(kurs.titel) + '</div>' +
          '<div style="font-size:12px;color:var(--t-2);margin-top:2px;">' + esc(kurs.funktion || '') + '</div>' +
          '<div style="font-size:12px;color:var(--t-3);margin-top:3px;">' + kursDoneCount(kurs) + '/' + kurs.kapitel.length + ' Kapitel · <span style="color:' + col + ';">' + (KURR_BUCKET_LABELS[bk] || '') + '</span></div>' +
        '</div><span style="color:var(--t-3);font-size:18px;">›</span>');
      card.onclick = () => { KURS_OPEN = 'kurr:' + kurs.id; renderScreen('kurse'); };
      s.appendChild(card);
      ksItems.push({ el: card, q: (esc(kurs.titel) + ' ' + esc(kurs.funktion || '') + ' ' + esc(kurs.kurztitel || '')).toLowerCase() });
    });
    if (!shown) { const e = div('', 'Keine Kurse in dieser Auswahl – Filter anpassen.'); e.style.cssText = 'font-size:13px;color:var(--t-3);text-align:center;padding:10px;'; s.appendChild(e); ksCtx.push(e); }
  }

  // Companion guides (Leitfäden) — read-only full-text docs, in given order
  const guides = (typeof KURSE_DATA !== 'undefined' && KURSE_DATA.leitfaeden) || [];
  if (guides.length) {
    const gLbl = div('label', 'LEITFÄDEN'); s.appendChild(gLbl); ksCtx.push(gLbl);
    guides.forEach(g => {
      const gp = kurrProg()['guide.' + g.id];
      const card = div('glass tap', '');
      card.style.cssText = 'display:flex;align-items:center;gap:14px;';
      card.innerHTML = '<span style="font-size:24px;flex:none;">' + (g.icon || '📄') + '</span>' +
        '<div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + esc(g.titel) + '</div>' +
        '<div style="font-size:12px;color:var(--t-3);margin-top:2px;">' + (gp && gp.done ? '✓ gelesen' : 'Leitfaden lesen') + '</div></div>' +
        '<span style="color:var(--t-3);font-size:18px;">›</span>';
      card.onclick = () => openGuide(g.id);
      s.appendChild(card);
      ksItems.push({ el: card, q: esc(g.titel).toLowerCase() });
    });
  }

  // Own courses
  const ownLbl = div('label', 'EIGENE KURSE'); s.appendChild(ownLbl); ksCtx.push(ownLbl);
  const own = getCourses();
  if (!own.length) {
    const e = div('', 'Noch keine eigenen Kurse. Bau dir einen mit Lektionen, Prüfung und Zertifikat.');
    e.style.cssText = 'font-size:13px;color:var(--t-3);line-height:1.5;padding:2px 0 6px;';
    s.appendChild(e); ksCtx.push(e);
  }
  own.forEach(c => {
    const pct = courseProgress(c);
    const col = c.color || pColor();
    const card = div('glass tap', '');
    card.style.cssText = 'display:flex;align-items:center;gap:14px;';
    card.appendChild(progressRing(pct, c.passed ? '#30D158' : col, 52, 6, '<span style="font-size:15px;">' + (c.passed ? '🎓' : (c.icon || '📚')) + '</span>'));
    card.insertAdjacentHTML('beforeend',
      '<div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + esc(c.title) + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:2px;">' + courseDone(c) + '/' + (c.lessons || []).length + ' Lektionen' + (c.passed ? ' · ✓ bestanden' : '') + '</div></div>' +
      '<span style="color:var(--t-3);font-size:18px;">›</span>');
    card.onclick = () => { KURS_OPEN = 'eigen:' + c.id; renderScreen('kurse'); };
    s.appendChild(card);
    ksItems.push({ el: card, q: (esc(c.title) + ' ' + esc(c.desc || '')).toLowerCase() });
  });
  const add = h('button', { textContent: '＋  EIGENEN KURS ERSTELLEN' });
  add.className = 'btn btn-gold tap'; add.style.marginTop = '6px';
  add.onclick = () => openCreateCourse();
  s.appendChild(add); ksCtx.push(add);
  const ai = h('button', { textContent: '✦  KI-KURS ENTWERFEN' });
  ai.className = 'btn btn-glass tap';
  ai.onclick = () => openAICourse();
  s.appendChild(ai); ksCtx.push(ai);

  // No-results note (shown only while searching with no hits)
  const ksNone = div('', '<div style="font-size:13px;color:var(--t-3);padding:8px 4px;">Kein Kurs gefunden.</div>');
  ksNone.style.display = 'none'; s.appendChild(ksNone);

  // Wire the search: hide contextual blocks, show only matching course cards.
  // Remember each element's original inline display (cards use flex) so we can
  // restore it exactly when the query is cleared.
  ksCtx.forEach(el => el._d0 = el.style.display);
  ksItems.forEach(it => it._d0 = it.el.style.display);
  const applyKurseFilter = () => {
    const q = ksSearch.value.trim().toLowerCase();
    ksCtx.forEach(el => el.style.display = q ? 'none' : el._d0);
    let hits = 0;
    ksItems.forEach(it => {
      const show = !q || it.q.includes(q);
      it.el.style.display = show ? it._d0 : 'none';
      if (show && q) hits++;
    });
    ksNone.style.display = (q && hits === 0) ? 'block' : 'none';
  };
  ksSearch.oninput = applyKurseFilter;
}

// ─── CURRICULUM COURSE DETAIL ─────────────────────────
function renderKurrDetail(s, kurs) {
  const back = h('button', { textContent: '← Alle Kurse' });
  back.className = 'btn btn-ghost tap'; back.style.cssText = 'font-size:12px;margin-bottom:2px;';
  back.onclick = () => { KURS_OPEN = null; renderScreen('kurse'); };
  s.appendChild(back);

  const pct = kursPct(kurs);
  const head = div('glass-hi', '');
  head.innerHTML = '<div style="font-size:20px;font-weight:700;color:var(--t-1);line-height:1.3;">' + esc(kurs.titel) + '</div>' +
    (kurs.funktion ? '<div style="font-size:13px;color:' + pColor() + ';margin-top:4px;">' + esc(kurs.funktion) + '</div>' : '') +
    (kurs.leitfrage ? '<div style="font-size:13px;color:var(--t-2);line-height:1.5;margin-top:8px;">' + esc(kurs.leitfrage) + '</div>' : '') +
    '<div class="bar" style="margin-top:12px;"><div class="bar-fill" style="width:' + pct + '%;' + (pct === 100 ? 'background:var(--green);' : '') + '"></div></div>' +
    '<div style="font-size:12px;color:var(--t-3);margin-top:6px;">' + kursDoneCount(kurs) + '/' + kurs.kapitel.length + ' Kapitel' + (kurs.geschaetzteZeit ? ' · ' + esc(kurs.geschaetzteZeit) : '') + '</div>';
  s.appendChild(head);

  if (kurs.warnung) {
    const w = div('glass-danger', '⚠ ' + esc(kurs.warnung));
    w.style.cssText = 'font-size:12px;line-height:1.5;color:var(--t-2);';
    s.appendChild(w);
  }
  if ((kurs.kernaussagen || []).length) {
    const det = document.createElement('details');
    det.className = 'glass'; det.style.cssText = 'padding:14px 16px;';
    det.innerHTML = '<summary style="cursor:pointer;font-size:13px;color:var(--t-2);">Kernaussagen dieses Kurses</summary>' +
      '<ul style="margin:10px 0 0;padding-left:18px;font-size:13px;color:var(--t-1);line-height:1.6;">' +
      kurs.kernaussagen.map(k => '<li>' + esc(k) + '</li>').join('') + '</ul>';
    s.appendChild(det);
  }

  s.appendChild(div('label', 'KAPITEL'));
  (kurs.kapitel || []).slice().sort((a, b) => a.nr - b.nr).forEach(kap => {
    const done = kapDone(kurs.id, kap.nr);
    const row = div('row tap', '');
    const cb = div('check' + (done ? ' on' : ''), '');
    cb.style.cssText = 'width:26px;height:26px;flex:none;';
    cb.onclick = e => { e.stopPropagation(); toggleKapDone(kurs.id, kap.nr); renderScreen('kurse'); updateStatusBar(); };
    row.appendChild(cb);
    row.insertAdjacentHTML('beforeend',
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:14px;color:var(--t-1);' + (done ? 'opacity:.55;' : '') + '">' + kap.nr + '. ' + esc(kap.titel) + '</div>' +
        (kap.kern ? '<div style="font-size:12px;color:var(--t-3);margin-top:3px;line-height:1.45;">' + esc(kap.kern) + '</div>' : '') +
        ((kap.checks || []).length ? '<div style="font-size:11px;color:var(--t-4);margin-top:4px;">' + kap.checks.length + ' Kontrollfrage(n)</div>' : '') +
      '</div><span style="color:var(--t-3);font-size:18px;align-self:center;">›</span>');
    row.onclick = () => openKapitel(kurs.id, kap.nr);
    s.appendChild(row);
  });
}

function toggleKapDone(courseId, nr) {
  const p = kurrProg(); const k = kapKey(courseId, nr);
  const e = p[k] || {}; e.done = !e.done; p[k] = e; saveKurrProg(p);
  if (e.done) { haptic('success'); addXP(20, 'goals'); }
}

// ─── CHAPTER READER (full text + control questions) ───
function openKapitel(courseId, nr) {
  const m = KURR(); if (!m) return;
  const kurs = m.kurse.find(k => k.id === courseId); if (!kurs) return;
  const kap = kurs.kapitel.find(k => k.nr === nr); if (!kap) return;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">' + esc(kurs.kurztitel || kurs.titel) + ' · KAPITEL ' + kap.nr + '</div>' +
    '<div class="h2" style="margin-bottom:14px;line-height:1.25;">' + esc(kap.titel) + '</div>');

  const body = div('glass', mdToHtml(kurrText(courseId, nr) || '_Kein Volltext hinterlegt._'));
  body.style.cssText = 'padding:18px;font-size:15px;line-height:1.7;color:var(--t-1);';
  inner.appendChild(body);

  // control questions
  if ((kap.checks || []).length) {
    inner.appendChild(div('label', '✅ KONTROLLFRAGEN'));
    const prog = kurrProg(); const key = kapKey(courseId, nr);
    const checksState = (prog[key] && prog[key].checks) || {};
    kap.checks.forEach((q, i) => {
      const row = div('row tap', '');
      const cb = div('check' + (checksState[i] ? ' on' : ''), '');
      cb.style.cssText = 'width:24px;height:24px;flex:none;';
      row.appendChild(cb);
      row.insertAdjacentHTML('beforeend', '<div style="flex:1;font-size:13px;line-height:1.5;color:var(--t-1);">' + esc(q) + '</div>');
      row.onclick = () => {
        const p = kurrProg(); const e = p[key] || {}; e.checks = e.checks || {};
        e.checks[i] = !e.checks[i]; p[key] = e; saveKurrProg(p);
        cb.classList.toggle('on'); haptic('light');
      };
      inner.appendChild(row);
    });
  }

  const doneBtn = h('button', { textContent: kapDone(courseId, nr) ? '✓ KAPITEL ERLEDIGT' : 'KAPITEL ALS ERLEDIGT MARKIEREN' });
  doneBtn.className = 'btn ' + (kapDone(courseId, nr) ? 'btn-success' : 'btn-gold') + ' tap';
  doneBtn.style.marginTop = '14px';
  doneBtn.onclick = () => {
    if (!kapDone(courseId, nr)) toggleKapDone(courseId, nr);
    closeOverlay(); renderScreen('kurse');
  };
  inner.appendChild(doneBtn);

  // jump to next chapter
  const nx = kurrNext();
  if (nx) {
    const nb = h('button', { textContent: 'Nächstes: ' + nx.kap.nr + '. ' + nx.kap.titel });
    nb.className = 'btn btn-glass tap'; nb.style.cssText = 'margin-top:8px;font-size:12px;';
    nb.onclick = () => { if (!kapDone(courseId, nr)) toggleKapDone(courseId, nr); KURS_OPEN = 'kurr:' + nx.kurs.id; openKapitel(nx.kurs.id, nx.kap.nr); };
    inner.appendChild(nb);
  }
  el('overlay_inner').scrollTop = 0;
  openOverlay();
}

// ─── GUIDE READER (companion markdowns) ───────────────
function openGuide(id) {
  const g = ((typeof KURSE_DATA !== 'undefined' && KURSE_DATA.leitfaeden) || []).find(x => x.id === id);
  if (!g) return;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:6px;">LEITFADEN</div>');
  const body = div('glass', mdToHtml(g.text));
  body.style.cssText = 'padding:18px;font-size:15px;line-height:1.7;color:var(--t-1);';
  inner.appendChild(body);
  const gp = kurrProg()['guide.' + id];
  const done = h('button', { textContent: gp && gp.done ? '✓ GELESEN' : 'ALS GELESEN MARKIEREN' });
  done.className = 'btn ' + (gp && gp.done ? 'btn-success' : 'btn-gold') + ' tap';
  done.style.marginTop = '14px';
  done.onclick = () => { const p = kurrProg(); p['guide.' + id] = { done: true }; saveKurrProg(p); haptic('success'); closeOverlay(); renderScreen('kurse'); };
  inner.appendChild(done);
  inner.scrollTop = 0;
  openOverlay();
}

// ─── tiny, safe markdown → HTML ───────────────────────
function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function mdInline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.08);padding:1px 5px;border-radius:5px;font-size:13px;">$1</code>');
}
function mdToHtml(md) {
  const lines = String(md || '').split('\n');
  let html = '', list = null;
  const closeList = () => { if (list) { html += '</' + list + '>'; list = null; } };
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { closeList(); continue; }
    let m;
    if ((m = line.match(/^#{1,6}\s+(.*)$/))) {
      closeList();
      const lvl = line.match(/^#+/)[0].length;
      const size = lvl <= 1 ? 20 : lvl === 2 ? 18 : 15;
      const col = lvl <= 2 ? 'var(--t-1)' : pColor();
      html += '<div style="font-size:' + size + 'px;font-weight:700;color:' + col + ';margin:16px 0 6px;line-height:1.3;">' + mdInline(m[1]) + '</div>';
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList(); html += '<div style="height:1px;background:var(--edge);margin:14px 0;"></div>';
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      if (list !== 'ul') { closeList(); html += '<ul style="margin:6px 0;padding-left:20px;">'; list = 'ul'; }
      html += '<li style="margin:3px 0;">' + mdInline(m[1]) + '</li>';
    } else if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      if (list !== 'ol') { closeList(); html += '<ol style="margin:6px 0;padding-left:22px;">'; list = 'ol'; }
      html += '<li style="margin:3px 0;">' + mdInline(m[1]) + '</li>';
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      closeList();
      html += '<div style="border-left:3px solid ' + pColor() + ';padding:4px 0 4px 12px;margin:8px 0;color:var(--t-2);">' + mdInline(m[1]) + '</div>';
    } else {
      closeList();
      html += '<p style="margin:8px 0;">' + mdInline(line) + '</p>';
    }
  }
  closeList();
  return html;
}

// ═══════════════════════════════════════════════════════
// EIGENE KURSE · self-built courses (lessons + exam + cert)
// ═══════════════════════════════════════════════════════
function getCourses() { return ls('los_courses') || []; }
function saveCourses(a) { ls('los_courses', a); }
function getCourse(id) { return getCourses().find(c => String(c.id) === String(id)); }
function updCourse(id, patch) {
  const a = getCourses();
  const c = a.find(x => String(x.id) === String(id));
  if (!c) return;
  Object.assign(c, typeof patch === 'function' ? patch(c) : patch);
  saveCourses(a);
}
function courseDone(c) { return (c.lessons || []).filter(l => l.done).length; }
function courseProgress(c) {
  const total = (c.lessons || []).length + ((c.exam || []).length ? 1 : 0);
  if (!total) return 0;
  const done = courseDone(c) + (c.passed ? 1 : 0);
  return Math.round((done / total) * 100);
}
// Open items for the Home reminder: unfinished custom courses.
function coursesOpen() { return getCourses().filter(c => !c.passed); }

function renderCourseDetail(s, c) {
  const back = h('button', { textContent: '← Alle Kurse' });
  back.className = 'btn btn-ghost tap';
  back.style.cssText = 'font-size:12px;margin-bottom:2px;';
  back.onclick = () => { KURS_OPEN = null; renderScreen('kurse'); };
  s.appendChild(back);

  const head = div('glass-hi', '');
  head.innerHTML = '<div style="font-size:20px;font-weight:700;color:var(--t-1);">' + (c.icon || '📚') + ' ' + esc(c.title) + '</div>' +
    (c.desc ? '<div style="font-size:13px;color:var(--t-2);line-height:1.5;margin-top:6px;">' + esc(c.desc) + '</div>' : '') +
    '<div class="bar" style="margin-top:12px;"><div class="bar-fill" style="width:' + courseProgress(c) + '%;' + (c.passed ? 'background:var(--green);' : '') + '"></div></div>' +
    '<div style="font-size:11px;color:var(--t-3);margin-top:6px;">' + courseProgress(c) + '% abgeschlossen</div>';
  s.appendChild(head);

  s.appendChild(div('label', 'LEKTIONEN'));
  (c.lessons || []).forEach((l, i) => {
    const row = div('row tap', '');
    const cb = div('check' + (l.done ? ' on' : ''), '');
    cb.style.cssText = 'width:26px;height:26px;flex:none;';
    row.appendChild(cb);
    row.insertAdjacentHTML('beforeend',
      '<div style="flex:1;min-width:0;"><div style="font-size:14px;color:var(--t-1);' + (l.done ? 'text-decoration:line-through;opacity:.6;' : '') + '">' +
      (i + 1) + '. ' + esc(l.title) + '</div></div><span style="color:var(--t-3);">›</span>');
    row.onclick = () => openLesson(c.id, l.id);
    s.appendChild(row);
  });

  if ((c.exam || []).length) {
    const allRead = courseDone(c) === (c.lessons || []).length && (c.lessons || []).length > 0;
    if (c.passed) {
      const cert = h('button', { textContent: '🎓  ZERTIFIKAT ANSEHEN' });
      cert.className = 'btn btn-success tap'; cert.style.marginTop = '8px';
      cert.onclick = () => showCertificate(c.id);
      s.appendChild(cert);
      const retry = h('button', { textContent: 'Prüfung wiederholen' });
      retry.className = 'btn btn-ghost tap'; retry.style.cssText = 'font-size:12px;margin-top:6px;';
      retry.onclick = () => startExam(c.id);
      s.appendChild(retry);
    } else {
      const exam = h('button', { textContent: allRead ? '📝  PRÜFUNG STARTEN' : '📝  Prüfung (erst alle Lektionen lesen)' });
      exam.className = 'btn ' + (allRead ? 'btn-gold' : 'btn-glass') + ' tap';
      exam.style.marginTop = '8px';
      if (!allRead) exam.style.opacity = '.55';
      exam.onclick = () => { if (allRead) startExam(c.id); else showToast('Erst alle Lektionen abschließen', '📖'); };
      s.appendChild(exam);
      if (c.bestScore) {
        const bs = div('', 'Bester Versuch: ' + c.bestScore + '% (nötig: ' + (c.passPct || 80) + '%)');
        bs.style.cssText = 'font-size:12px;color:var(--t-3);text-align:center;margin-top:6px;';
        s.appendChild(bs);
      }
    }
  }

  const del = h('button', { textContent: 'Kurs löschen' });
  del.className = 'btn btn-ghost tap';
  del.style.cssText = 'font-size:11px;margin-top:14px;color:var(--red);border-color:rgba(225,104,104,.25);';
  del.onclick = () => { if (confirm('Kurs "' + c.title + '" löschen?')) { saveCourses(getCourses().filter(x => x.id !== c.id)); KURS_OPEN = null; renderScreen('kurse'); } };
  s.appendChild(del);
}

function openLesson(courseId, lessonId) {
  const c = getCourse(courseId); if (!c) return;
  const l = c.lessons.find(x => x.id === lessonId); if (!l) return;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">LEKTION</div>' +
    '<div class="h2" style="margin-bottom:14px;">' + esc(l.title) + '</div>' +
    '<div class="glass" style="padding:18px;font-size:15px;line-height:1.7;color:var(--t-1);white-space:pre-wrap;">' +
    esc(l.content || 'Kein Inhalt hinterlegt.') + '</div>');
  const done = h('button', { textContent: l.done ? '✓ ABGESCHLOSSEN' : 'ALS GELESEN MARKIEREN' });
  done.className = 'btn ' + (l.done ? 'btn-success' : 'btn-gold') + ' tap';
  done.style.marginTop = '14px';
  done.onclick = () => {
    updCourse(courseId, cc => { cc.lessons.find(x => x.id === lessonId).done = true; return cc; });
    addXP(15, 'goals'); haptic('success');
    closeOverlay(); renderScreen('kurse');
  };
  inner.appendChild(done);
  openOverlay();
}

function startExam(courseId) {
  const c = getCourse(courseId); if (!c || !(c.exam || []).length) return;
  const answers = {};
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">ABSCHLUSSPRÜFUNG</div>' +
    '<div class="h2" style="margin-bottom:6px;">' + esc(c.title) + '</div>' +
    '<div style="font-size:13px;color:var(--t-3);margin-bottom:16px;">' + c.exam.length + ' Fragen · ' + (c.passPct || 80) + '% zum Bestehen</div>');
  c.exam.forEach((q, qi) => {
    const card = div('glass', '');
    card.style.cssText = 'padding:15px;margin-bottom:10px;';
    card.insertAdjacentHTML('beforeend', '<div style="font-size:15px;font-weight:600;color:var(--t-1);margin-bottom:10px;">' + (qi + 1) + '. ' + esc(q.q) + '</div>');
    (q.options || []).forEach((opt, oi) => {
      if (!opt) return;
      const b = h('button', { textContent: opt });
      b.className = 'tap';
      b.style.cssText = 'display:block;width:100%;text-align:left;padding:11px 13px;margin-bottom:7px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid var(--edge);color:var(--t-1);font-size:14px;';
      b.onclick = () => {
        answers[qi] = oi;
        card.querySelectorAll('button').forEach(x => { x.style.borderColor = 'var(--edge)'; x.style.background = 'rgba(255,255,255,.05)'; });
        b.style.borderColor = pColor(); b.style.background = pColor() + '22';
      };
      card.appendChild(b);
    });
    inner.appendChild(card);
  });
  const submit = h('button', { textContent: 'PRÜFUNG ABGEBEN' });
  submit.className = 'btn btn-gold tap'; submit.style.marginTop = '8px';
  submit.onclick = () => {
    if (Object.keys(answers).length < c.exam.length) { showToast('Bitte alle Fragen beantworten', '⚠'); return; }
    let correct = 0;
    c.exam.forEach((q, qi) => { if (answers[qi] === q.answer) correct++; });
    const score = Math.round((correct / c.exam.length) * 100);
    const passed = score >= (c.passPct || 80);
    updCourse(courseId, cc => {
      cc.bestScore = Math.max(cc.bestScore || 0, score);
      if (passed && !cc.passed) { cc.passed = true; cc.certDate = new Date().toISOString(); }
      return cc;
    });
    if (passed) { addXP(100, 'goals'); haptic('levelup'); showCertificate(courseId, score); }
    else { haptic('warn'); showExamResult(courseId, score, correct, c.exam.length); }
  };
  inner.appendChild(submit);
  openOverlay();
}

function showExamResult(courseId, score, correct, total) {
  const c = getCourse(courseId);
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div style="text-align:center;font-size:48px;margin:10px 0;">📊</div>' +
    '<div class="h2" style="text-align:center;">Noch nicht bestanden</div>' +
    '<div class="glass" style="padding:20px;text-align:center;margin-top:14px;">' +
    '<div style="font-size:40px;font-weight:800;color:var(--gold);">' + score + '%</div>' +
    '<div style="font-size:13px;color:var(--t-2);margin-top:6px;">' + correct + '/' + total + ' richtig · nötig: ' + (c.passPct || 80) + '%</div>' +
    '<div style="font-size:13px;color:var(--t-3);margin-top:10px;line-height:1.5;">Schau dir die Lektionen nochmal an und versuch es erneut.</div></div>');
  const retry = h('button', { textContent: 'NOCHMAL VERSUCHEN' });
  retry.className = 'btn btn-gold tap'; retry.style.marginTop = '14px';
  retry.onclick = () => startExam(courseId);
  inner.appendChild(retry);
  const close = h('button', { textContent: 'Später' });
  close.className = 'btn btn-ghost tap'; close.style.cssText = 'margin-top:6px;font-size:12px;';
  close.onclick = () => { closeOverlay(); renderScreen('kurse'); };
  inner.appendChild(close);
}

function showCertificate(courseId, score) {
  const c = getCourse(courseId); if (!c) return;
  const date = c.certDate ? new Date(c.certDate) : new Date();
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  const cert = div('glass-hi anim-spring', '');
  cert.style.cssText = 'padding:26px 20px;text-align:center;border:1.5px solid ' + pColor() + '66;';
  cert.innerHTML =
    '<div style="font-size:46px;margin-bottom:6px;">🎓</div>' +
    '<div class="label" style="letter-spacing:2px;color:' + pColor() + ';">ZERTIFIKAT</div>' +
    '<div style="font-size:13px;color:var(--t-3);margin:16px 0 4px;">Hiermit wird bestätigt, dass</div>' +
    '<div class="serif" style="font-size:22px;color:var(--t-1);">' + esc(STATE.profile?.name || 'Du') + '</div>' +
    '<div style="font-size:13px;color:var(--t-3);margin:10px 0 4px;">den Kurs erfolgreich abgeschlossen hat:</div>' +
    '<div class="serif gold" style="font-size:19px;line-height:1.4;">' + esc(c.title) + '</div>' +
    (score != null ? '<div style="font-size:13px;color:var(--green);margin-top:12px;">Ergebnis: ' + score + '%</div>' : '') +
    '<div style="height:1px;background:var(--edge);margin:18px 0;"></div>' +
    '<div style="font-size:12px;color:var(--t-3);">' + date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · HustleX</div>';
  inner.appendChild(cert);
  const ok = h('button', { textContent: 'STARK! →' });
  ok.className = 'btn btn-gold tap'; ok.style.marginTop = '16px';
  ok.onclick = () => { closeOverlay(); renderScreen('kurse'); };
  inner.appendChild(ok);
  openOverlay();
}

let COURSE_DRAFT = null;
function openCreateCourse(existing) {
  COURSE_DRAFT = existing || { id: Date.now(), title: '', desc: '', icon: '📚', color: pColor(), lessons: [], exam: [], passPct: 80, passed: false, certDate: null, bestScore: 0, createdAt: Date.now() };
  renderCreateCourse();
  openOverlay();
}

function renderCreateCourse() {
  const d = COURSE_DRAFT;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">NEUER KURS</div>' +
    '<div class="h2" style="margin-bottom:14px;">Kurs <span class="gold">bauen</span></div>');

  const title = h('input', { type: 'text', value: d.title, placeholder: 'Kurs-Titel' });
  title.className = 'inp'; title.style.cssText = 'width:100%;margin-bottom:8px;font-size:15px;';
  title.oninput = e => d.title = e.target.value;
  inner.appendChild(title);

  const desc = h('textarea', { value: d.desc, placeholder: 'Kurze Beschreibung (optional)' });
  desc.className = 'inp'; desc.style.cssText = 'width:100%;min-height:56px;margin-bottom:14px;font-size:14px;resize:vertical;';
  desc.oninput = e => d.desc = e.target.value;
  inner.appendChild(desc);

  inner.appendChild(div('label', 'LEKTIONEN · ' + d.lessons.length));
  d.lessons.forEach((l, i) => {
    const card = div('glass', ''); card.style.cssText = 'padding:12px;margin-bottom:8px;';
    const lt = h('input', { type: 'text', value: l.title, placeholder: 'Lektion ' + (i + 1) + ' – Titel' });
    lt.className = 'inp'; lt.style.cssText = 'width:100%;font-size:14px;margin-bottom:6px;';
    lt.oninput = e => l.title = e.target.value;
    const lc = h('textarea', { value: l.content, placeholder: 'Inhalt der Lektion…' });
    lc.className = 'inp'; lc.style.cssText = 'width:100%;min-height:70px;font-size:13px;line-height:1.5;resize:vertical;';
    lc.oninput = e => l.content = e.target.value;
    const del = h('button', { textContent: '× Lektion entfernen' });
    del.style.cssText = 'background:none;color:var(--t-3);font-size:12px;margin-top:6px;';
    del.onclick = () => { d.lessons = d.lessons.filter(x => x.id !== l.id); renderCreateCourse(); };
    card.appendChild(lt); card.appendChild(lc); card.appendChild(del);
    inner.appendChild(card);
  });
  const addL = h('button', { textContent: '＋ Lektion' });
  addL.className = 'btn btn-glass tap'; addL.style.cssText = 'font-size:13px;margin-bottom:14px;';
  addL.onclick = () => { d.lessons.push({ id: Date.now(), title: '', content: '', done: false }); renderCreateCourse(); };
  inner.appendChild(addL);

  inner.appendChild(div('label', 'PRÜFUNGSFRAGEN · ' + d.exam.length));
  d.exam.forEach((q, qi) => {
    const card = div('glass', ''); card.style.cssText = 'padding:12px;margin-bottom:8px;';
    const qt = h('input', { type: 'text', value: q.q, placeholder: 'Frage ' + (qi + 1) });
    qt.className = 'inp'; qt.style.cssText = 'width:100%;font-size:14px;margin-bottom:8px;';
    qt.oninput = e => q.q = e.target.value;
    card.appendChild(qt);
    card.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--t-3);margin-bottom:6px;">Antworten (die richtige markieren):</div>');
    q.options.forEach((opt, oi) => {
      const rowo = div(''); rowo.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';
      const mark = h('button', { textContent: q.answer === oi ? '●' : '○' });
      mark.style.cssText = 'background:none;color:' + (q.answer === oi ? 'var(--green)' : 'var(--t-3)') + ';font-size:18px;flex:none;';
      mark.onclick = () => { q.answer = oi; renderCreateCourse(); };
      const oin = h('input', { type: 'text', value: opt, placeholder: 'Antwort ' + (oi + 1) });
      oin.className = 'inp'; oin.style.cssText = 'flex:1;font-size:13px;padding:8px 10px;';
      oin.oninput = e => q.options[oi] = e.target.value;
      rowo.appendChild(mark); rowo.appendChild(oin); card.appendChild(rowo);
    });
    const del = h('button', { textContent: '× Frage entfernen' });
    del.style.cssText = 'background:none;color:var(--t-3);font-size:12px;margin-top:4px;';
    del.onclick = () => { d.exam = d.exam.filter(x => x !== q); renderCreateCourse(); };
    card.appendChild(del);
    inner.appendChild(card);
  });
  const addQ = h('button', { textContent: '＋ Frage' });
  addQ.className = 'btn btn-glass tap'; addQ.style.cssText = 'font-size:13px;margin-bottom:16px;';
  addQ.onclick = () => { d.exam.push({ q: '', options: ['', '', '', ''], answer: 0 }); renderCreateCourse(); };
  inner.appendChild(addQ);

  const save = h('button', { textContent: '✓  KURS SPEICHERN' });
  save.className = 'btn btn-gold tap';
  save.onclick = () => {
    if (!d.title.trim()) { showToast('Titel fehlt', '⚠'); return; }
    d.lessons = d.lessons.filter(l => l.title.trim());
    d.exam = d.exam.filter(q => q.q.trim() && q.options.filter(o => o.trim()).length >= 2);
    const a = getCourses();
    const idx = a.findIndex(x => x.id === d.id);
    if (idx >= 0) a[idx] = d; else a.push(d);
    saveCourses(a);
    closeOverlay(); KURS_OPEN = null; renderScreen('kurse');
    showToast('Kurs gespeichert', '📚');
  };
  inner.appendChild(save);
}

function openAICourse(prefill) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:6px;">KI-KURS</div>' +
    '<div class="h2" style="margin-bottom:6px;">Thema <span class="gold">eingeben</span></div>' +
    '<div style="font-size:13px;color:var(--t-3);line-height:1.5;margin-bottom:14px;">Die KI entwirft Lektionen und eine Abschlussprüfung. Du kannst danach alles bearbeiten.</div>');
  const inp = h('input', { type: 'text', placeholder: 'z.B. Grundlagen des Investierens', value: prefill || '' });
  inp.className = 'inp'; inp.style.cssText = 'width:100%;font-size:15px;margin-bottom:12px;';
  inner.appendChild(inp);
  const go = h('button', { textContent: '✦  KURS ENTWERFEN' });
  go.className = 'btn btn-gold tap';
  go.onclick = async () => {
    const topic = inp.value.trim(); if (!topic) return;
    go.disabled = true; go.innerHTML = '<span class="anim-spin">⚙</span>  ENTWIRFT…';
    try {
      const prompt = 'Entwirf einen kompakten Selbstlern-Kurs zum Thema "' + topic + '". ' +
        '4–6 Lektionen mit je 4–8 Sätzen echtem Lehrinhalt (kein Platzhalter), danach 5 Multiple-Choice-Prüfungsfragen mit je 4 Optionen. ' +
        'Antworte NUR als JSON: {"title":"","desc":"","icon":"📚","lessons":[{"title":"","content":""}],"exam":[{"q":"","options":["","","",""],"answer":0}]}';
      const txt = await callAI(prompt, 'Du bist ein Kurs-Autor. Antworte ausschließlich mit gültigem JSON.', 2600, typeof BEST_AI_MODEL !== 'undefined' ? BEST_AI_MODEL : undefined);
      let j = txt.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      const a = j.indexOf('{'), b = j.lastIndexOf('}');
      if (a >= 0 && b >= 0) j = j.slice(a, b + 1);
      const data = JSON.parse(j);
      const draft = {
        id: Date.now(), title: data.title || topic, desc: data.desc || '', icon: data.icon || '📚', color: pColor(),
        lessons: (data.lessons || []).map((l, i) => ({ id: Date.now() + i, title: l.title || ('Lektion ' + (i + 1)), content: l.content || '', done: false })),
        exam: (data.exam || []).map(q => ({ q: q.q || '', options: (q.options || []).slice(0, 4), answer: typeof q.answer === 'number' ? q.answer : 0 })),
        passPct: 80, passed: false, certDate: null, bestScore: 0, createdAt: Date.now(),
      };
      openCreateCourse(draft);
      showToast('Entwurf erstellt – prüfen & speichern', '✦');
    } catch (e) {
      go.disabled = false; go.textContent = '✦  KURS ENTWERFEN';
      showToast('KI nicht verfügbar – erstell den Kurs manuell', '⚠');
    }
  };
  inner.appendChild(go);
  openOverlay();
}
