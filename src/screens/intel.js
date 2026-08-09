// ═══════════════════════════════════════════════════════
// INTEL · Knowledge base + Body Fix (AI) + KI-Doc (AI chat)
// ═══════════════════════════════════════════════════════

function renderIntel(s) {
  s.className = 'screen on';
  s.innerHTML = '<div class="label" style="margin-bottom:4px;">INTEL BASE</div>' +
    '<div class="h2">Dein <span class="gold italic">Wissen</span></div>';

  const tabs = ['WISSEN', 'BODY FIX', 'KI-DOC'];
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
      panels[t].style.display = 'block';
    };
    tabRow.appendChild(tb);
    panels[t] = div('');
    panels[t].style.display = i === 0 ? 'block' : 'none';
  });
  s.appendChild(tabRow);

  // WISSEN grid
  const grd = div('stagger');
  grd.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;';
  INTEL_SECTIONS.forEach(sec => {
    const c = div('glass tap', '<div style="font-size:22px;margin-bottom:8px;">' + sec.ic + '</div>' +
      '<div class="serif" style="font-size:13px;color:var(--t-1);">' + sec.label + '</div>' +
      '<div style="height:1px;background:linear-gradient(90deg,' + sec.color + '55,transparent);margin-top:8px;border-radius:99px;"></div>');
    c.onclick = () => openIntelDetail(sec);
    grd.appendChild(c);
  });
  panels['WISSEN'].appendChild(grd);

  renderBodyFix(panels['BODY FIX']);
  renderKIDoc(panels['KI-DOC']);

  Object.values(panels).forEach(p => s.appendChild(p));
}

function openIntelDetail(sec) {
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="color:' + sec.color + ';margin-bottom:6px;">' + sec.ic + ' ' + sec.label.toUpperCase() + '</div>' +
    '<div class="h1" style="margin-bottom:18px;">' + sec.label + '</div>');
  sec.items.forEach(item => {
    const c = div('glass', '<div class="label" style="font-size:10px;color:' + item.c + ';margin-bottom:10px;">' + item.h.toUpperCase() + '</div>');
    c.style.marginBottom = '10px';
    item.tips.forEach((tip, j) => {
      const r = div('', '<span class="dot dot-sm" style="margin-top:6px;background:' + item.c + ';"></span>' +
        '<div style="font-size:13px;color:var(--t-2);line-height:1.65;">' + tip + '</div>');
      r.style.cssText = 'display:flex;gap:8px;align-items:flex-start;padding:5px 0;' + (j > 0 ? 'border-top:1px solid var(--edge)' : '');
      c.appendChild(r);
    });
    inner.appendChild(c);
  });
  openOverlay();
}

function renderBodyFix(container) {
  const history = () => { try { return JSON.parse(localStorage.getItem('los_bodyfix') || '[]'); } catch { return []; } };
  const saveHistory = arr => { try { localStorage.setItem('los_bodyfix', JSON.stringify(arr)); } catch {} };

  container.style.cssText = 'padding-top:10px;display:flex;flex-direction:column;gap:10px;';

  const wrap = div('');
  const inp = h('textarea', { placeholder: 'Beschreibe dein Problem… z.B. "Plattfuß und schlechte Haltung"' }, '');
  inp.className = 'inp inp-serif';
  inp.rows = 2;
  inp.oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 80) + 'px'; };

  const sendBtn = h('button', { textContent: '→' }, '');
  sendBtn.className = 'btn-gold tap';
  sendBtn.style.cssText = 'width:44px;height:44px;border-radius:var(--r-md);font-size:18px;flex-shrink:0;';

  const row = div('');
  row.style.cssText = 'display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;';
  row.appendChild(inp); row.appendChild(sendBtn); wrap.appendChild(row);

  const result = div('');
  result.style.display = 'none';
  wrap.appendChild(result);

  const solve = async query => {
    if (!query) return;
    sendBtn.style.opacity = '.5'; sendBtn.textContent = '…';
    result.style.display = 'block';
    result.innerHTML = '<div style="text-align:center;padding:20px;"><span class="anim-spin" style="font-size:24px;">⚙</span><div style="font-size:13px;color:var(--t-2);margin-top:10px;font-style:italic;">Heilungsplan wird erstellt…</div></div>';
    try {
      const txt = await callAI('Problem: "' + query + '"\n\nErstelle einen Heilungs- und Korrekturplan:\n\n**URSACHE** – Was anatomisch falsch läuft.\n**SOFORT-MASSNAHMEN** – 2–3 Dinge die sofort helfen.\n**ÜBUNGSPROGRAMM** – Phase 1 (Wo 1–2) Mobilisierung, Phase 2 (Wo 3–6) Kräftigung, Phase 3 (Wo 7+) Stabilisierung. Konkret mit Wiederholungen.\n**HILFSMITTEL** – Falls sinnvoll.\n**ZEITRAHMEN** – Wann Verbesserung zu erwarten.\n**VERMEIDEN** – Was das Problem verschlimmert.\n\nDeutsch, direkt, keine Einleitung.',
        'Du bist Experte für Physiotherapie und Corrective Exercise. Erstelle konkrete Heilungspläne. Nur natürliche Methoden.', 1000);
      result.innerHTML = '<div class="glass-accent serif italic" style="margin-bottom:10px;font-size:12px;color:var(--t-2);">✦ ' + query + '</div>' +
        '<div class="glass" style="font-size:13px;color:var(--t-2);line-height:1.85;white-space:pre-line;">' +
        txt.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--t-1)">$1</strong>').replace(/\n/g, '<br/>') + '</div>';
      const h2 = history();
      h2.unshift({ id: Date.now(), problem: query, plan: txt, date: new Date().toLocaleDateString('de-DE') });
      saveHistory(h2.slice(0, 8));
    } catch {
      result.innerHTML = '<div style="padding:12px;color:var(--t-3);font-size:13px;">Verbindungsfehler.</div>';
    }
    sendBtn.style.opacity = '1'; sendBtn.textContent = '→';
  };

  sendBtn.onclick = () => solve(inp.value.trim());
  inp.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); solve(inp.value.trim()); } };
  container.appendChild(wrap);

  const ql = div('', '<div class="label" style="font-size:10px;margin-bottom:8px;">HÄUFIGE PROBLEME</div>');
  BODYFIX_QUICK.forEach(p => {
    const r = div('row tap', '<span style="font-size:18px;">' + p.ic + '</span>' +
      '<span style="flex:1;font-size:13px;color:var(--t-2);">' + p.t + '</span><span class="gold-soft" style="color:var(--gold-soft);font-size:13px;">→</span>');
    r.style.marginBottom = '4px';
    r.onclick = () => { inp.value = p.t; solve(p.t); };
    ql.appendChild(r);
  });
  container.appendChild(ql);
}

function renderKIDoc(container) {
  container.style.cssText = 'padding-top:10px;display:flex;flex-direction:column;gap:10px;';
  const hdr = div('glass-danger', '<div class="label" style="color:var(--red);margin-bottom:6px;">🩺 KI-DOC</div>' +
    '<div style="font-size:13px;color:var(--t-2);line-height:1.65;">Frage mich warum dir etwas nicht gut tut, welche Supplements sich nicht vertragen oder was hinter deinen Symptomen steckt.</div>');
  container.appendChild(hdr);

  const chatWrap = div('');
  chatWrap.style.cssText = 'display:flex;flex-direction:column;gap:9px;';

  const inp = h('textarea', { placeholder: 'Beschreibe dein Symptom…' }, '');
  inp.className = 'inp inp-serif';
  inp.rows = 2;
  inp.oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 80) + 'px'; };

  const sendBtn = h('button', { textContent: '→' }, '');
  sendBtn.className = 'tap';
  sendBtn.style.cssText = 'width:44px;height:44px;background:linear-gradient(135deg,#5C1F1F,#C44545);border-radius:var(--r-md);color:#fff;font-size:18px;flex-shrink:0;';

  const sendRow = div('');
  sendRow.style.cssText = 'display:flex;gap:8px;align-items:flex-end;border-top:1px solid var(--edge);padding-top:10px;';
  sendRow.appendChild(inp); sendRow.appendChild(sendBtn);

  const send = async text => {
    const q = text || inp.value.trim();
    if (!q) return;
    inp.value = '';
    const um = div('', '');
    um.style.cssText = 'align-self:flex-end;max-width:82%;padding:10px 13px;background:linear-gradient(135deg,var(--purple),#6B5BA5);border-radius:16px 16px 4px 16px;font-size:13px;color:#fff;line-height:1.65;';
    um.textContent = q;
    chatWrap.appendChild(um);
    const lm = div('', '<div style="width:26px;height:26px;border-radius:var(--r-sm);background:rgba(225,104,104,.18);border:1px solid rgba(225,104,104,.3);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">🩺</div>');
    lm.style.cssText = 'display:flex;gap:8px;align-items:flex-end;';
    const lb = div('glass', '…');
    lb.style.cssText = 'max-width:82%;font-size:13px;color:var(--t-2);line-height:1.75;border-radius:16px 16px 16px 4px;';
    lm.appendChild(lb); chatWrap.appendChild(lm);
    try {
      const ctx = 'Nutzer: ' + (STATE.profile?.name || '?') + ', Ziel: ' + goalP().name + '. Energie: ' + (STATE.day.energy || '?') + '/5. Schlaf: ' + (getSleepHours() || '?') + 'h.';
      const txt = await callAI(ctx + '\n\nFrage: ' + q,
        'Du bist KI-Doc, ein Gesundheitsassistent. Du bist KEIN Arzt. Hilf bei möglichen Ursachen für Symptome, besonders in Bezug auf Supplements, Ernährung, Schlaf, Training. Bei ernsthaften Symptomen empfehle einen Arzt. Antworte auf Deutsch, kurz und direkt mit 2–3 möglichen Ursachen + 1–2 Lösungen.', 600);
      lb.innerHTML = txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
    } catch {
      lb.textContent = 'Verbindungsfehler.';
    }
  };
  sendBtn.onclick = () => send();
  inp.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const qqrow = div('');
  qqrow.style.cssText = 'display:flex;flex-direction:column;gap:5px;';
  [
    { ic: '😴', t: 'Ich bin den ganzen Tag müde – warum?' },
    { ic: '💊', t: 'Welche meiner Supplements vertragen sich nicht?' },
    { ic: '🧠', t: 'Ich kann mich schlecht konzentrieren – was fehlt mir?' },
    { ic: '💪', t: 'Ich erhole mich nicht gut vom Training' },
  ].forEach(q => {
    const r = div('row tap', '<span style="font-size:16px;">' + q.ic + '</span><span style="flex:1;font-size:12px;color:var(--t-2);">' + q.t + '</span>');
    r.onclick = () => send(q.t);
    qqrow.appendChild(r);
  });
  container.appendChild(qqrow);
  container.appendChild(chatWrap);
  container.appendChild(sendRow);
  container.appendChild(div('', '<div style="font-size:11px;color:var(--t-3);text-align:center;padding-top:4px;">KI-Doc ersetzt keinen Arzt · Notfall: 112</div>'));
}
