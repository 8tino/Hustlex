// ═══════════════════════════════════════════════════════
// QUESTS · Daily habits by category (switchable) + custom task
// ═══════════════════════════════════════════════════════

let QUESTS_CAT = 'body';

// Quests = owner presets (HABITS, hidden in the public build) + the user's own,
// minus hidden presets. Everyone can add their own and delete/hide any quest.
function questHidden() { return ls('los_habits_hidden') || []; }
function userQuests() { return ls('los_habits_user') || []; }
function saveUserQuests(a) { ls('los_habits_user', a); }
function getQuests() {
  const base = (typeof HUSTLEX_PUBLIC !== 'undefined' && HUSTLEX_PUBLIC) ? [] : HABITS;
  const hidden = questHidden();
  return base.filter(x => !hidden.includes(x.id)).concat(userQuests());
}
function removeQuest(id) {
  const u = userQuests();
  if (u.some(x => x.id === id)) saveUserQuests(u.filter(x => x.id !== id));
  else { const h = questHidden(); if (!h.includes(id)) { h.push(id); ls('los_habits_hidden', h); } }
  if (STATE.day && STATE.day.habits) { STATE.day.habits = STATE.day.habits.filter(x => x !== id); saveDay(); }
}
function restoreHiddenQuests() { ls('los_habits_hidden', []); }
function addUserQuest(cat) {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const label = prompt(EN ? 'Quest name:' : 'Quest-Name:'); if (!label || !label.trim()) return;
  const icon = (prompt(EN ? 'Emoji icon:' : 'Emoji-Icon:', '✅') || '✅').trim().slice(0, 2) || '✅';
  const u = userQuests(); u.push({ id: 'uq' + Date.now(), label: label.trim(), icon, xp: 10, cat, user: true });
  saveUserQuests(u); renderScreen('quests');
}

function renderQuests(s) {
  const pc = pColor();
  const cats = getCats();
  s.className = 'screen on';

  s.innerHTML = '<div class="label" style="margin-bottom:4px;">TAGES-QUESTS</div>' +
    '<div class="h2">Vervollständige deinen <span class="gold italic">Charakter</span></div>';

  // Category tabs — switch between Körper / Geist / Disziplin
  const CATS = [{ k: 'body', l: '⚔ Körper' }, { k: 'mind', l: '🧠 Geist' }, { k: 'discipline', l: '🛡 Disziplin' }];
  if (!QUESTS_CAT) QUESTS_CAT = 'body';
  const cr = div('');
  cr.style.cssText = 'display:flex;gap:6px;margin-top:10px;';
  CATS.forEach(c => {
    const b = h('button', { textContent: c.l + (cats[c.k] ? ' ✓' : '') }, '');
    b.className = 'itab tap' + (QUESTS_CAT === c.k ? ' on' : '');
    b.onclick = () => { QUESTS_CAT = c.k; renderScreen('quests'); };
    cr.appendChild(b);
  });
  s.appendChild(cr);

  // Habits of the selected category — erledigte rutschen ans Ende
  const catQuests = getQuests().filter(hh => hh.cat === QUESTS_CAT)
    .sort((a, b) => (STATE.day.habits.includes(a.id) ? 1 : 0) - (STATE.day.habits.includes(b.id) ? 1 : 0));
  if (!catQuests.length) {
    s.appendChild(div('', '<div style="font-size:12px;color:var(--t-3);line-height:1.6;padding:10px 2px;">' +
      (LANG === 'en' ? 'No quests here yet. Add your own below.' : 'Noch keine Quests hier. Füge unten deine eigenen hinzu.') + '</div>'));
  }
  catQuests.forEach(hb => {
    const done = STATE.day.habits.includes(hb.id);
    const row = div('row' + (done ? ' done' : ''), '');
    if (done) row.style.borderColor = pc + '30';
    const tapArea = div('tap', '<span style="font-size:20px;">' + hb.icon + '</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:14px;color:' + (done ? 'var(--t-3)' : 'var(--t-1)') + ';">' + esc(hb.label) + '</div>' +
      (done ? '<div style="font-size:11px;color:var(--t-4);margin-top:1px;">' + (LANG === 'en' ? 'Tap to deselect' : 'Tippen zum Abwählen') + '</div>' : '') + '</div>' +
      '<div style="font-size:12px;font-weight:600;color:' + (done ? pc : 'var(--gold-soft)') + ';">' + (done ? '✓' : '+' + hb.xp + ' XP') + '</div>');
    tapArea.style.cssText = 'flex:1;display:flex;align-items:center;gap:12px;min-width:0;';
    tapArea.onclick = () => {
      if (STATE.day.habits.includes(hb.id)) {
        STATE.day.habits = STATE.day.habits.filter(x => x !== hb.id);
        STATE.day.xp = Math.max(0, STATE.day.xp - hb.xp);
        if (typeof subXP === 'function') subXP(hb.xp, hb.cat);
      } else {
        STATE.day.habits.push(hb.id); STATE.day.xp += hb.xp; addXP(hb.xp, hb.cat);
      }
      saveDay(); renderScreen('quests'); updateStatusBar();
    };
    row.appendChild(tapArea);
    const del = h('button', { textContent: '×' });
    del.className = 'tap'; del.title = (LANG === 'en' ? 'Delete' : 'Löschen');
    del.style.cssText = 'background:none;color:var(--t-4);font-size:16px;padding:0 4px;flex:none;';
    del.onclick = (e) => { e.stopPropagation(); removeQuest(hb.id); renderScreen('quests'); };
    row.appendChild(del);
    s.appendChild(row);
  });

  // Add your own quest (into the current category) + restore hidden presets
  const addQ = h('button', { textContent: (LANG === 'en' ? '＋ Add quest' : '＋ Quest hinzufügen') });
  addQ.className = 'btn btn-glass tap'; addQ.style.cssText = 'width:100%;font-size:13px;margin-top:6px;';
  addQ.onclick = () => addUserQuest(QUESTS_CAT);
  s.appendChild(addQ);
  if (questHidden().length) {
    const restore = h('button', { textContent: '↩ ' + questHidden().length + (LANG === 'en' ? ' hidden — restore' : ' ausgeblendete zurückholen') });
    restore.className = 'tap'; restore.style.cssText = 'font-size:11px;color:var(--t-3);background:none;margin-top:6px;';
    restore.onclick = () => { restoreHiddenQuests(); showToast(LANG === 'en' ? 'Restored' : 'Wieder eingeblendet', '↩'); renderScreen('quests'); };
    s.appendChild(restore);
  }

  // Custom task
  const ct = div('glass', '<div class="label" style="font-size:10px;margin-bottom:7px;">EIGENE AUFGABE +20 XP</div>');
  ct.style.marginTop = '6px';
  if (STATE.day.custom) {
    ct.insertAdjacentHTML('beforeend', '<div class="serif italic" style="font-size:13px;color:' + pc + ';">"' + STATE.day.custom + '"</div>');
  } else {
    const row = div('');
    row.style.cssText = 'display:flex;gap:7px;';
    const inp = h('input', { type: 'text', placeholder: 'Was hast du heute getan?' }, '');
    inp.className = 'inp';
    inp.style.cssText = 'flex:1;font-size:12px;';
    const btn = h('button', { textContent: '✓' }, '');
    btn.className = 'btn btn-glass tap';
    btn.style.cssText = 'width:48px;height:44px;padding:0;flex-shrink:0;border-radius:var(--r-md);font-size:14px;';
    btn.onclick = () => {
      const v = inp.value.trim();
      if (!v || STATE.day.custom) return;
      STATE.day.custom = v; STATE.day.habits.push('custom'); STATE.day.xp += 20; addXP(20); saveDay(); updateStatusBar();
      renderScreen('quests');
    };
    row.appendChild(inp); row.appendChild(btn); ct.appendChild(row);
  }
  s.appendChild(ct);

  // Earned social-media access
  if (getGateOpen()) {
    const earned = Math.round((STATE.day.xp / 70) * 30);
    const gt = div('glass-success', '<div class="label" style="font-size:10px;color:var(--green);margin-bottom:8px;">🔓 ZUGANG GEWÄHRT · ' + earned + ' MIN VERDIENT</div>');
    const br = div('');
    br.style.cssText = 'display:flex;gap:5px;';
    [5, 10, 15, 20].filter(m => m <= earned).forEach(m => {
      const b = h('button', { textContent: m + 'm' }, '');
      b.className = 'tap';
      b.style.cssText = 'flex:1;padding:9px;background:rgba(92,184,117,.08);border:1px solid rgba(92,184,117,.2);border-radius:var(--r-sm);color:var(--green);font-size:11px;font-weight:600;';
      b.onclick = () => openGateTimer(m);
      br.appendChild(b);
    });
    gt.appendChild(br); s.appendChild(gt);
  }
}

function openGateTimer(mins) {
  let secs = (mins || 10) * 60;
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  const wrap = div('');
  wrap.style.cssText = 'text-align:center;padding:40px 20px;';
  wrap.appendChild(overlayBackBtn());
  wrap.insertAdjacentHTML('beforeend', '<div class="label" style="margin-bottom:20px;">SOCIAL MEDIA TIMER</div>');
  const display = div('serif', '');
  display.style.cssText = 'font-size:60px;font-weight:300;color:var(--green);line-height:1;margin-bottom:8px;';
  const sub = div('', 'Minuten verdient');
  sub.style.cssText = 'font-size:12px;color:var(--t-2);';
  const fmt = x => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
  display.textContent = fmt(secs);
  const t = setInterval(() => {
    secs--;
    display.textContent = fmt(secs);
    display.style.color = secs < 30 ? 'var(--red)' : 'var(--green)';
    if (secs <= 0) { clearInterval(t); display.textContent = 'ZEIT UM'; sub.textContent = 'Phone weglegen'; sub.style.color = 'var(--red)'; }
  }, 1000);
  wrap.appendChild(display); wrap.appendChild(sub);
  inner.appendChild(wrap);
  openOverlay();
}

// ─── MICRO-HABITS ─────────────────────────────────────
// Tiny daily habits (1-tap). Each: {id, icon, text, history:[dateStr]}.
function getMicro() { return ls('los_micro') || []; }
function saveMicro(a) { ls('los_micro', a); }
function microDoneToday(m) { return (m.history || []).includes(today()); }
function microStreak(m) {
  const set = new Set(m.history || []);
  let n = 0;
  const d = new Date();
  // count back from today (today optional) over consecutive days
  if (!set.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (set.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function renderMicroHabits(s) {
  const lbl = div('label', '⚡ MICRO-HABITS');
  lbl.style.cssText = 'font-size:10px;margin-top:10px;';
  s.appendChild(lbl);
  const sub = div('', 'Winzige Gewohnheiten — 1 Tap. Klein anfangen, dranbleiben.');
  sub.style.cssText = 'font-size:11px;color:var(--t-3);margin-bottom:2px;';
  s.appendChild(sub);

  const micros = getMicro();
  micros.forEach(m => {
    const done = microDoneToday(m);
    const streak = microStreak(m);
    const row = div('row tap' + (done ? ' done' : ''), '');
    const cb = div('check' + (done ? ' on' : ''), '');
    cb.style.cssText = 'width:26px;height:26px;';
    const info = div('', '<div style="font-size:13px;color:var(--t-1);">' + (m.icon ? m.icon + ' ' : '') + m.text + '</div>' +
      (streak > 0 ? '<div style="font-size:11px;color:var(--gold);margin-top:2px;">🔥 ' + streak + ' Tage</div>' : ''));
    info.style.flex = '1';
    const del = h('button', { textContent: '×' }, '');
    del.style.cssText = 'background:none;color:var(--t-4);font-size:14px;';
    del.onclick = (e) => { e.stopPropagation(); saveMicro(getMicro().filter(x => x.id !== m.id)); renderScreen('quests'); };
    row.onclick = () => {
      const arr = getMicro();
      const it = arr.find(x => x.id === m.id);
      it.history = it.history || [];
      const td = today();
      if (it.history.includes(td)) { it.history = it.history.filter(d => d !== td); }
      else { it.history.push(td); haptic('success'); addXP(5, 'discipline'); }
      saveMicro(arr); renderScreen('quests'); updateStatusBar();
    };
    row.appendChild(cb); row.appendChild(info); row.appendChild(del);
    s.appendChild(row);
  });

  if (micros.length < 8) {
    const addRow = div('');
    addRow.style.cssText = 'display:flex;gap:7px;margin-top:4px;';
    const inp = h('input', { type: 'text', placeholder: 'z. B. 🧊 1 Min kalt duschen', maxLength: 60 }, '');
    inp.className = 'inp';
    inp.style.cssText = 'flex:1;font-size:13px;';
    const ab = h('button', { textContent: '+' }, '');
    ab.className = 'btn btn-glass tap';
    ab.style.cssText = 'width:48px;height:46px;padding:0;flex-shrink:0;border-radius:var(--r-md);font-size:18px;';
    const add = () => {
      const raw = inp.value.trim();
      if (!raw) return;
      // optional leading emoji as icon
      const m = raw.match(/^(\p{Emoji}️?|\p{Extended_Pictographic})\s*(.+)$/u);
      const icon = m ? m[1] : '';
      const text = m ? m[2] : raw;
      const arr = getMicro();
      arr.push({ id: Date.now(), icon, text, history: [] });
      saveMicro(arr); inp.value = ''; renderScreen('quests');
    };
    ab.onclick = add;
    inp.onkeydown = e => { if (e.key === 'Enter') add(); };
    addRow.appendChild(inp); addRow.appendChild(ab);
    s.appendChild(addRow);
  }
}
