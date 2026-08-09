// ═══════════════════════════════════════════════════════
// ONBOARDING · 4-page intro flow → builds the profile + AI plan
// ═══════════════════════════════════════════════════════

let OB = {
  name: '', title: '', quote: '', goalIds: [], customGoal: '',
  age: '', weight: '', height: '',
  trainLvl: 'intermediate', sleep: '7', stress: 'medium', time: '60', focus: [],
};

// Inject the onboarding markup into #onboard (filled by JS in the modular build).
function renderOnboard() {
  el('onboard').innerHTML = `
  <div class="ob-page on" id="ob0">
    <div class="ob-inner" style="justify-content:center;text-align:center;">
      <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:52px;">
        <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold-deep))"></div>
        <div class="label" style="letter-spacing:7px;">LIFE OS</div>
        <div style="flex:1;height:1px;background:linear-gradient(90deg,var(--gold-deep),transparent)"></div>
      </div>
      <div class="label" style="letter-spacing:4px;margin-bottom:20px;">WILLKOMMEN</div>
      <div class="serif anim-fade-in" style="font-size:42px;font-weight:300;color:var(--t-1);line-height:1.1;margin-bottom:16px;">
        Das Leben als<br/><span class="shimmer" style="font-size:48px;">Meisterwerk</span>
      </div>
      <div class="serif italic" style="font-size:13px;color:var(--t-2);line-height:1.9;margin-bottom:10px;">
        Optimiere jeden Aspekt deiner Existenz.<br/>Werde wer du sein willst.
      </div>
      <div class="label" style="margin-bottom:56px;">Körper · Geist · Disziplin · Langlebigkeit</div>
      <button class="btn btn-gold tap" onclick="obGo(1)">JETZT STARTEN →</button>
      <div class="label" style="margin-top:12px;font-size:10px;">FÜR MENSCHEN DIE SICH ETWAS WERT SIND</div>
    </div>
  </div>

  <div class="ob-page" id="ob1">
    <div class="ob-inner">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
        <button class="tap" onclick="obGo(0)" style="background:none;color:var(--t-2);font-size:13px;display:flex;align-items:center;gap:6px;">← <span class="label">Zurück</span></button>
        <div class="ob-dots" id="dots1"></div>
      </div>
      <div class="label" style="margin-bottom:6px;">SCHRITT 1 VON 3</div>
      <div class="h1" style="margin-bottom:4px;">Dein Charakter</div>
      <div style="font-size:12px;color:var(--t-2);margin-bottom:28px;">Wie willst du dich nennen?</div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
        <div>
          <div class="label" style="margin-bottom:6px;">DEIN NAME *</div>
          <input id="ob_name" class="inp inp-serif" type="text" placeholder="Name eingeben…" style="font-size:16px;"/>
        </div>
        <div>
          <div class="label" style="margin-bottom:6px;">DEIN TITEL (OPTIONAL)</div>
          <input id="ob_title" class="inp" type="text" placeholder="z.B. Entrepreneur · Athlet · Optimierer"/>
        </div>
        <div>
          <div class="label" style="margin-bottom:6px;">PERSÖNLICHES MOTTO (OPTIONAL)</div>
          <input id="ob_quote" class="inp inp-serif" type="text" placeholder="Ein Satz der dich antreibt…" style="font-style:italic;"/>
        </div>
      </div>
      <button class="btn btn-gold tap" onclick="obStep1()">WEITER →</button>
    </div>
  </div>

  <div class="ob-page" id="ob2">
    <div class="ob-inner">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
        <button class="tap" onclick="obGo(1)" style="background:none;color:var(--t-2);font-size:13px;display:flex;align-items:center;gap:6px;">← <span class="label">Zurück</span></button>
        <div class="ob-dots" id="dots2"></div>
      </div>
      <div class="label" style="margin-bottom:6px;">SCHRITT 2 VON 3</div>
      <div class="h1" style="margin-bottom:4px;">Deine Ziele</div>
      <div style="font-size:12px;color:var(--t-2);margin-bottom:6px;">Was willst du erreichen?</div>
      <div class="italic" style="font-size:11px;color:var(--gold-soft);margin-bottom:18px;">Mehrere Ziele gleichzeitig möglich – wähle alles was passt.</div>
      <div class="stagger" style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;" id="goal_cards"></div>
      <div id="custom_goal_wrap" style="display:none;margin-bottom:16px;">
        <textarea id="ob_customgoal" class="inp inp-serif" rows="3" placeholder="Beschreibe dein Ziel so genau wie möglich…"></textarea>
      </div>
      <button class="btn btn-gold tap" onclick="obStep2()">WEITER →</button>
    </div>
  </div>

  <div class="ob-page" id="ob3">
    <div class="ob-inner">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
        <button class="tap" onclick="obGo(2)" style="background:none;color:var(--t-2);font-size:13px;display:flex;align-items:center;gap:6px;">← <span class="label">Zurück</span></button>
        <div class="ob-dots" id="dots3"></div>
      </div>
      <div class="label" style="margin-bottom:6px;">SCHRITT 3 VON 3</div>
      <div class="h1" style="margin-bottom:4px;">Dein Status</div>
      <div style="font-size:12px;color:var(--t-2);margin-bottom:20px;">Damit der Plan zu dir passt</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
        <div><div class="label" style="margin-bottom:6px;font-size:10px;">ALTER</div><input id="ob_age" class="inp serif" type="number" placeholder="–" style="text-align:center;font-size:15px;padding:11px 6px;"/></div>
        <div><div class="label" style="margin-bottom:6px;font-size:10px;">GEWICHT KG</div><input id="ob_weight" class="inp serif" type="number" placeholder="–" style="text-align:center;font-size:15px;padding:11px 6px;"/></div>
        <div><div class="label" style="margin-bottom:6px;font-size:10px;">GRÖSSE CM</div><input id="ob_height" class="inp serif" type="number" placeholder="–" style="text-align:center;font-size:15px;padding:11px 6px;"/></div>
      </div>
      <div id="q_selectors"></div>
      <div style="margin-bottom:20px;">
        <div class="label" style="margin-bottom:4px;">EXTRA-FOKUS</div>
        <div style="font-size:11px;color:var(--t-3);margin-bottom:10px;">Was ist dir besonders wichtig?</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;" id="focus_pills"></div>
      </div>
      <button class="btn btn-gold tap" onclick="obFinish()">MEINEN PLAN ERSTELLEN →</button>
    </div>
  </div>`;
}

function obGo(page) {
  $$('.ob-page').forEach(p => p.classList.remove('on'));
  el('ob' + page).classList.add('on');
  el('onboard').scrollTop = 0;
  [1, 2, 3].forEach(i => {
    const d = el('dots' + i);
    if (!d) return;
    d.innerHTML = '';
    [1, 2, 3, 4].forEach(j => {
      const dot = div('ob-dot' + (j <= page ? ' on' : ''));
      d.appendChild(dot);
    });
  });
}

function obStep1() {
  const n = el('ob_name').value.trim();
  if (!n) { el('ob_name').classList.add('anim-shake'); setTimeout(() => el('ob_name').classList.remove('anim-shake'), 450); return; }
  OB.name = n;
  OB.title = el('ob_title').value.trim();
  OB.quote = el('ob_quote').value.trim();
  obGo(2); buildGoalCards();
}

function buildGoalCards() {
  const cont = el('goal_cards');
  cont.innerHTML = '';
  Object.values(GOALS).forEach(g => {
    const sel = OB.goalIds.includes(g.id);
    const c = div('option-card tap' + (sel ? ' on' : ''), '');
    c.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<span style="font-size:20px;flex-shrink:0;">' + g.icon + '</span>' +
        '<div style="flex:1;"><div class="serif" style="font-size:14px;color:' + (sel ? g.color : 'var(--t-1)') + ';margin-bottom:2px;">' + g.name + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);">' + g.desc + '</div></div>' +
        '<div class="check' + (sel ? ' on' : '') + '" style="width:20px;height:20px;"></div>' +
      '</div>';
    c.onclick = () => {
      const wasSel = OB.goalIds.includes(g.id);
      OB.goalIds = wasSel ? OB.goalIds.filter(x => x !== g.id) : [...OB.goalIds, g.id];
      el('custom_goal_wrap').style.display = OB.goalIds.includes('custom') ? 'block' : 'none';
      buildGoalCards();
    };
    cont.appendChild(c);
  });
  const counter = div('', OB.goalIds.length ? OB.goalIds.length + ' ausgewählt' : '');
  counter.id = 'goal_count';
  counter.style.cssText = 'font-size:11px;color:var(--gold-soft);text-align:center;letter-spacing:1px;height:16px;';
  cont.appendChild(counter);
}

function obStep2() {
  if (!OB.goalIds.length) return;
  OB.customGoal = el('ob_customgoal')?.value?.trim() || '';
  obGo(3); buildQSelectors(); buildFocusPills();
}

function buildQSelectors() {
  const cont = el('q_selectors');
  cont.innerHTML = '';
  const SELS = [
    { k: 'trainLvl', l: 'TRAININGSERFAHRUNG', opts: [{ v: 'beginner', l: 'Anfänger' }, { v: 'intermediate', l: 'Fortgeschritten' }, { v: 'advanced', l: 'Experte' }] },
    { k: 'sleep', l: 'DURCHSCHNITTLICHER SCHLAF', opts: [{ v: '5', l: '<6h' }, { v: '6', l: '6–7h' }, { v: '7', l: '7–8h' }, { v: '9', l: '8+h' }] },
    { k: 'stress', l: 'STRESSLEVEL', opts: [{ v: 'low', l: 'Niedrig' }, { v: 'medium', l: 'Mittel' }, { v: 'high', l: 'Hoch' }, { v: 'extreme', l: 'Extrem' }] },
    { k: 'time', l: 'VERFÜGBARE ZEIT/TAG', opts: [{ v: '30', l: '30 Min' }, { v: '60', l: '1 Std' }, { v: '90', l: '1,5 Std' }, { v: '120', l: '2+ Std' }] },
  ];
  SELS.forEach(sel => {
    const wrap = div('', '<div class="label" style="font-size:10px;margin-bottom:7px;">' + sel.l + '</div>');
    wrap.style.marginBottom = '14px';
    const row = div('');
    row.style.cssText = 'display:flex;gap:6px;';
    sel.opts.forEach(o => {
      const b = h('button', { textContent: o.l }, '');
      b.className = 'itab tap' + (OB[sel.k] === o.v ? ' on' : '');
      b.onclick = () => {
        OB[sel.k] = o.v;
        row.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', sel.opts[i].v === o.v));
      };
      row.appendChild(b);
    });
    wrap.appendChild(row); cont.appendChild(wrap);
  });
}

function buildFocusPills() {
  const cont = el('focus_pills');
  cont.innerHTML = '';
  ['Luzides Träumen', 'Kortisol ↓', 'Height Maxxing', 'VO2max', 'Immunsystem', 'Reaktionszeit', 'Mobilität', 'Longevity'].forEach(f => {
    const b = h('button', { textContent: f }, '');
    const on = OB.focus.includes(f);
    b.className = 'pill tap' + (on ? ' pill-gold' : '');
    b.style.cssText = 'cursor:pointer;font-size:11px;padding:6px 12px;';
    b.onclick = () => {
      OB.focus = OB.focus.includes(f) ? OB.focus.filter(x => x !== f) : [...OB.focus, f];
      buildFocusPills();
    };
    cont.appendChild(b);
  });
}

async function obFinish() {
  OB.age = el('ob_age').value;
  OB.weight = el('ob_weight').value;
  OB.height = el('ob_height').value;

  const selectedGoals = OB.goalIds.map(id => GOALS[id]).filter(Boolean);
  const mainGoal = selectedGoals[0] || GOALS.custom;
  const goalNames = selectedGoals.map(g => g.name).join(' + ');
  const goalDescs = selectedGoals.map(g => g.desc).join(' · ');
  const mainColor = selectedGoals.length === 1 ? mainGoal.color : '#E0BE7E';
  const avatarIcons = selectedGoals.slice(0, 2).map(g => g.icon).join('');

  const finBtn = el('ob3').querySelector('button.btn');
  finBtn.textContent = 'PLAN WIRD ERSTELLT…';
  finBtn.style.opacity = '.6';

  const goalStr = OB.goalIds.includes('custom') && OB.customGoal
    ? OB.customGoal + (goalNames ? ' + ' + goalNames : '')
    : goalNames || 'Eigene Ziele';

  const prompt = 'Erstelle einen personalisierten Wochen-Masterplan.\nNutzer: ' + OB.name + '\nZiele: ' + goalStr + '\n' +
    (selectedGoals.length > 1 ? 'Hinweis: Mehrere Ziele gleichzeitig – erstelle einen intelligenten Mix.' : '') +
    '\nAlter: ' + (OB.age || '?') + ' J, Gewicht: ' + (OB.weight || '?') + ' kg, Größe: ' + (OB.height || '?') + ' cm\n' +
    'Training: ' + OB.trainLvl + ', Schlaf: ' + OB.sleep + 'h/Nacht, Stress: ' + OB.stress + ', Zeit: ' + OB.time + ' Min/Tag\n' +
    'Extra-Fokus: ' + (OB.focus.join(', ') || '–') +
    '\n\nErstelle:\n1. WOCHENPROGRAMM Mo–So\n2. TOP 3 PRIORITÄTEN (sofort starten)\n3. SUPPLEMENT-EMPFEHLUNG\n4. MORGENROUTINE (passend zur verfügbaren Zeit)\n5. WIE DIE ZIELE KOMBINIERT WERDEN (falls mehrere)\n\nDeutsch, konkret, kein Intro.';

  let plan = '';
  try { plan = await callAI(prompt, null, 1000); }
  catch { plan = 'Plan wird nach dem Start angezeigt.'; }

  const profile = {
    name: OB.name,
    titleTxt: OB.title || (selectedGoals.length > 1 ? goalNames : mainGoal.name),
    quote: OB.quote || goalDescs,
    avatar: avatarIcons || mainGoal.icon,
    color: mainColor,
    goalId: mainGoal.id,
    goalIds: OB.goalIds,
    goalNames: goalNames,
    plan: plan,
  };
  ls('los_profile', profile);
  ls('los_xp', 0);
  STATE.profile = profile;
  STATE.totalXP = 0;
  STATE.day = loadDay();
  el('onboard').style.display = 'none';
  updateStatusBar();
  navTo('home');
  // Erststart: Tutorial (erklärt Navigation) → danach App anpassen.
  try { ls('los_tutorial_seen', true); } catch (e) {}
  setTimeout(() => { try { openTutorial(true); } catch (e) {} }, 600);
}
