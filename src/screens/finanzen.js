// ═══════════════════════════════════════════════════════
// FINANZEN · Personal money tracker — income/expense, monthly
//   balance, savings goals. (Tracking only — no investment advice.)
// ═══════════════════════════════════════════════════════

function getFin() { return ls('los_fin') || { tx: [], goals: [] }; }
function saveFin(f) { ls('los_fin', f); }
function eur(n) { return (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }

const FIN_CATS = [
  { k: 'gehalt', l: 'Gehalt', ic: '💰', type: 'in' },
  { k: 'extra', l: 'Extra', ic: '➕', type: 'in' },
  { k: 'essen', l: 'Essen', ic: '🍽' },
  { k: 'wohnen', l: 'Wohnen', ic: '🏠' },
  { k: 'transport', l: 'Transport', ic: '🚗' },
  { k: 'freizeit', l: 'Freizeit', ic: '🎮' },
  { k: 'gesundheit', l: 'Gesundheit', ic: '💊' },
  { k: 'sonstiges', l: 'Sonstiges', ic: '🧾' },
];
function finCat(k) { return FIN_CATS.find(c => c.k === k) || FIN_CATS[FIN_CATS.length - 1]; }

let GELD_TAB = 'geld';

function renderFinanzen(s) {
  s.className = 'screen on';
  s.innerHTML = '';
  const tabRow = div('');
  tabRow.style.cssText = 'display:flex;gap:6px;';
  [['geld', '💶 Finanzen'], ['markt', '📈 Markt']].forEach(([k, l]) => {
    const b = h('button', { textContent: l }, '');
    b.className = 'itab tap' + (GELD_TAB === k ? ' on' : '');
    b.onclick = () => { GELD_TAB = k; renderScreen('finanzen'); };
    tabRow.appendChild(b);
  });
  s.appendChild(tabRow);
  const panel = div('');
  panel.style.cssText = 'display:flex;flex-direction:column;gap:14px;margin-top:6px;';
  s.appendChild(panel);
  if (GELD_TAB === 'markt') renderMarkt(panel); else renderFinanzenPanel(panel);
}

function renderFinanzenPanel(s) {
  s.className = 'stagger';
  const f = getFin();
  const now = new Date();
  const thisMonth = t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); };
  const monthTx = f.tx.filter(thisMonth);
  const income = monthTx.filter(t => t.type === 'in').reduce((a, t) => a + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'out').reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;

  s.innerHTML = '<div class="label" style="margin-bottom:4px;">FINANZEN · ' + now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) + '</div>' +
    '<div class="h2">Geld im <span class="gold">Griff</span></div>';

  // Month summary
  const sum = div('glass-accent', '');
  sum.innerHTML =
    '<div class="label" style="margin-bottom:10px;">DIESER MONAT</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-end;">' +
      '<div><div class="label" style="font-size:11px;">SALDO</div><div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;color:' + (balance >= 0 ? 'var(--green)' : 'var(--red)') + ';">' + eur(balance) + '</div></div>' +
    '</div>' +
    '<div style="display:flex;gap:10px;margin-top:14px;">' +
      '<div style="flex:1;"><div class="label" style="font-size:11px;color:var(--green);">EIN</div><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + eur(income) + '</div></div>' +
      '<div style="flex:1;"><div class="label" style="font-size:11px;color:var(--red);">AUS</div><div style="font-size:15px;font-weight:600;color:var(--t-1);">' + eur(expense) + '</div></div>' +
    '</div>';
  s.appendChild(sum);

  // Quick add
  s.appendChild(renderFinAdd(s));

  // Transactions list (this month)
  const lbl = div('label', 'BUCHUNGEN'); lbl.style.cssText = 'font-size:10px;margin-top:6px;'; s.appendChild(lbl);
  if (!monthTx.length) {
    const e = div('glass', 'Noch keine Buchungen diesen Monat.');
    e.style.cssText = 'border-style:dashed;text-align:center;font-size:13px;color:var(--t-3);';
    s.appendChild(e);
  }
  monthTx.slice().reverse().slice(0, 30).forEach(t => {
    const c = finCat(t.cat);
    const row = div('row', '<span style="font-size:18px;">' + c.ic + '</span>' +
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t-1);">' + (t.note || c.l) + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);">' + c.l + ' · ' + new Date(t.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + '</div></div>' +
      '<div style="font-size:14px;font-weight:600;color:' + (t.type === 'in' ? 'var(--green)' : 'var(--t-1)') + ';">' + (t.type === 'in' ? '+' : '−') + eur(t.amount).replace('−', '') + '</div>');
    const del = h('button', { textContent: '×' }, '');
    del.style.cssText = 'background:none;color:var(--t-4);font-size:14px;padding-left:8px;';
    del.onclick = () => { const ff = getFin(); ff.tx = ff.tx.filter(x => x.id !== t.id); saveFin(ff); renderScreen('finanzen'); };
    row.appendChild(del);
    s.appendChild(row);
  });

  // Savings goals
  const glbl = div('label', '🎯 SPARZIELE'); glbl.style.cssText = 'font-size:10px;margin-top:10px;'; s.appendChild(glbl);
  f.goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const card = div('glass', '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">' +
      '<div style="font-size:14px;font-weight:600;color:var(--t-1);">' + g.name + '</div>' +
      '<div style="font-size:13px;color:var(--t-2);">' + eur(g.saved) + ' / ' + eur(g.target) + '</div></div>');
    card.appendChild(div('bar', '<div class="bar-fill" style="width:' + pct + '%;"></div>'));
    const row = div(''); row.style.cssText = 'display:flex;gap:7px;margin-top:10px;';
    const inp = h('input', { type: 'number', placeholder: 'Betrag €', inputmode: 'decimal' }, '');
    inp.className = 'inp'; inp.style.cssText = 'flex:1;font-size:13px;';
    const addB = h('button', { textContent: '+ Sparen' }, ''); addB.className = 'btn btn-glass tap'; addB.style.cssText = 'width:auto;padding:0 14px;font-size:13px;';
    addB.onclick = () => { const v = parseFloat((inp.value || '').replace(',', '.')); if (!v) return; const ff = getFin(); const gg = ff.goals.find(x => x.id === g.id); gg.saved += v; saveFin(ff); haptic('success'); addXP(10, 'goals'); renderScreen('finanzen'); };
    const delB = h('button', { textContent: '×' }, ''); delB.className = 'btn-ghost tap'; delB.style.cssText = 'width:40px;flex:none;font-size:13px;';
    delB.onclick = () => { if (confirm('Sparziel löschen?')) { const ff = getFin(); ff.goals = ff.goals.filter(x => x.id !== g.id); saveFin(ff); renderScreen('finanzen'); } };
    row.appendChild(inp); row.appendChild(addB); row.appendChild(delB);
    card.appendChild(row);
    s.appendChild(card);
  });
  const addGoal = h('button', { textContent: '+ Sparziel hinzufügen' }, '');
  addGoal.className = 'btn btn-glass tap'; addGoal.style.cssText = 'font-size:13px;';
  addGoal.onclick = () => {
    const name = prompt('Name des Sparziels (z. B. Notgroschen, Urlaub):'); if (!name) return;
    const target = parseFloat((prompt('Zielbetrag in €:') || '').replace(',', '.')); if (!target) return;
    const ff = getFin(); ff.goals.push({ id: Date.now(), name: name.trim(), target, saved: 0 }); saveFin(ff); renderScreen('finanzen');
  };
  s.appendChild(addGoal);

  // AI budget tip (no investment advice)
  const ctx = 'Monats-Einnahmen: ' + income.toFixed(0) + '€, Ausgaben: ' + expense.toFixed(0) + '€, Saldo: ' + balance.toFixed(0) + '€. Top-Ausgaben-Kategorien: ' +
    Object.entries(monthTx.filter(t => t.type === 'out').reduce((a, t) => { a[finCat(t.cat).l] = (a[finCat(t.cat).l] || 0) + t.amount; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0] + ' ' + e[1].toFixed(0) + '€').join(', ') +
    '. Gib 3 konkrete, alltagstaugliche Spar-/Budget-Tipps. KEINE Anlageberatung. Kurz, Deutsch.';
  s.appendChild(aiBlock('SPAR-TIPPS', ctx));

  s.appendChild(div('', '<div style="font-size:11px;color:var(--t-4);text-align:center;padding-top:6px;">Reines Tracking · keine Finanz-/Anlageberatung</div>'));
}

function renderFinAdd(parent) {
  const c = div('glass-hi', '<div class="label" style="margin-bottom:10px;">BUCHUNG HINZUFÜGEN</div>');
  let typ = 'out';
  // type toggle
  const tg = div(''); tg.style.cssText = 'display:flex;gap:7px;margin-bottom:10px;';
  const inB = h('button', { textContent: '＋ Einnahme' }, ''); const outB = h('button', { textContent: '－ Ausgabe' }, '');
  const paint = () => { inB.className = 'itab tap' + (typ === 'in' ? ' on' : ''); outB.className = 'itab tap' + (typ === 'out' ? ' on' : ''); };
  inB.onclick = () => { typ = 'in'; paint(); }; outB.onclick = () => { typ = 'out'; paint(); };
  paint(); tg.appendChild(outB); tg.appendChild(inB); c.appendChild(tg);

  const amt = h('input', { type: 'number', placeholder: 'Betrag €', inputmode: 'decimal' }, ''); amt.className = 'inp'; amt.style.marginBottom = '8px';
  const note = h('input', { type: 'text', placeholder: 'Notiz (optional)' }, ''); note.className = 'inp'; note.style.marginBottom = '8px';
  c.appendChild(amt); c.appendChild(note);

  let cat = 'essen';
  const catWrap = div(''); catWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;';
  const paintCats = () => Array.from(catWrap.children).forEach(b => b.className = 'pill tap' + (b.dataset.k === cat ? ' pill-gold' : ''));
  FIN_CATS.forEach(cc => {
    const b = h('button', { textContent: cc.ic + ' ' + cc.l }, ''); b.dataset.k = cc.k; b.style.cssText = 'cursor:pointer;font-size:12px;padding:6px 11px;';
    b.onclick = () => { cat = cc.k; paintCats(); }; catWrap.appendChild(b);
  });
  paintCats(); c.appendChild(catWrap);

  const save = h('button', { textContent: 'Speichern' }, ''); save.className = 'btn btn-gold tap';
  save.onclick = () => {
    const v = parseFloat((amt.value || '').replace(',', '.'));
    if (!v || v <= 0) { amt.classList.add('anim-shake'); setTimeout(() => amt.classList.remove('anim-shake'), 450); return; }
    const f = getFin();
    f.tx.push({ id: Date.now(), amount: v, type: typ, cat, note: note.value.trim(), date: new Date().toISOString() });
    saveFin(f); haptic('success'); renderScreen('finanzen');
  };
  c.appendChild(save);
  return c;
}
