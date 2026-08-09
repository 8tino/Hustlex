// ═══════════════════════════════════════════════════════
// I18N · leichte Sprachumschaltung. Deutsch ist die Quellsprache
//   (wird als Fallback direkt im Code übergeben), Englisch kommt aus
//   dem EN-Wörterbuch. t('key', 'Deutscher Text') → gibt bei LANG='de'
//   den deutschen Text zurück, bei 'en' die Übersetzung (sonst DE).
// ═══════════════════════════════════════════════════════

const LANGS = [{ id: 'de', label: 'Deutsch', flag: '🇩🇪' }, { id: 'en', label: 'English', flag: '🇬🇧' }];

let LANG = (() => {
  try {
    const saved = localStorage.getItem('los_lang');
    if (saved) return saved;
    const nav = (navigator.language || 'de').slice(0, 2);
    return LANGS.some(l => l.id === nav) ? nav : 'de';
  } catch (e) { return 'de'; }
})();

// EN dictionary — only what the first-run shell (lock, nav, onboarding) needs.
// Anything without a key falls back to the German source string.
const I18N = {
  en: {
    // ── bottom navigation ──
    'nav.home': 'TODAY', 'nav.koerper': 'BODY', 'nav.aufgaben': 'TASKS',
    'nav.wachstumhub': 'GROWTH', 'nav.mehr': 'MORE',
    // ── lock / account ──
    'lock.langLabel': 'LANGUAGE',
    'lock.welcomeBack': 'Welcome <span class="gold italic">back</span>',
    'lock.vault': 'Your <span class="gold italic">private</span> vault',
    'lock.subReturning': 'Unlock your data with your password.',
    'lock.subNew': 'Create an account. Everything is end-to-end encrypted — only you can read it.',
    'lock.email': 'E-MAIL', 'lock.password': 'PASSWORD', 'lock.repeat': 'REPEAT PASSWORD',
    'lock.unlock': 'UNLOCK', 'lock.create': 'CREATE ACCOUNT & START',
    'lock.otherAccount': 'Other account / new device',
    'lock.e2eeWarn': '⚠ End-to-end encrypted: without your password the data <b>cannot</b> be recovered. Store it safely.',
    'lock.testHint': '🧪 Test version — not everything is final yet. Please don\'t enter sensitive data.',
    'lock.errEmail': 'Please enter a valid e-mail.',
    'lock.errPw': 'Password must be at least 8 characters.',
    'lock.errPw2': 'The passwords don\'t match.',
    'lock.unlocking': 'UNLOCKING…', 'lock.creating': 'CREATING…',
    // ── onboarding ──
    'ob.welcome': 'WELCOME',
    'ob.title': 'Life as a', 'ob.titleAccent': 'masterpiece',
    'ob.subtitle': 'Optimize every aspect of your existence.<br/>Become who you want to be.',
    'ob.domains': 'Body · Mind · Discipline · Longevity',
    'ob.start': 'START NOW →', 'ob.forPeople': 'FOR PEOPLE WHO VALUE THEMSELVES',
    'ob.back': 'Back', 'ob.next': 'NEXT →',
    'ob.step': 'STEP', 'ob.of': 'OF',
    'ob.character': 'Your character', 'ob.characterSub': 'What should we call you?',
    'ob.name': 'YOUR NAME *', 'ob.namePh': 'Enter name…',
    'ob.titleField': 'YOUR TITLE (OPTIONAL)', 'ob.titlePh': 'e.g. Entrepreneur · Athlete · Optimizer',
    'ob.motto': 'PERSONAL MOTTO (OPTIONAL)', 'ob.mottoPh': 'A sentence that drives you…',
    'ob.goals': 'Your goals', 'ob.goalsSub': 'What do you want to achieve?',
    'ob.goalsMulti': 'Several goals at once possible — pick everything that fits.',
    'ob.goalsPh': 'Describe your goal as precisely as possible…',
    'ob.selected': 'selected',
    'ob.status': 'Your status', 'ob.statusSub': 'So the plan fits you',
    'ob.age': 'AGE', 'ob.weight': 'WEIGHT KG', 'ob.height': 'HEIGHT CM',
    'ob.extraFocus': 'EXTRA FOCUS', 'ob.extraFocusSub': 'What matters most to you?',
    'ob.createPlan': 'CREATE MY PLAN →', 'ob.creatingPlan': 'CREATING PLAN…',
    'ob.trainExp': 'TRAINING EXPERIENCE', 'ob.avgSleep': 'AVERAGE SLEEP',
    'ob.stress': 'STRESS LEVEL', 'ob.timePerDay': 'AVAILABLE TIME/DAY',
    'ob.lvlBeginner': 'Beginner', 'ob.lvlInter': 'Intermediate', 'ob.lvlAdv': 'Expert',
    'ob.stressLow': 'Low', 'ob.stressMed': 'Medium', 'ob.stressHigh': 'High', 'ob.stressExtreme': 'Extreme',
    // settings
    'set.language': 'LANGUAGE', 'set.settings': 'SETTINGS', 'set.profilePlan': 'Profile & Plan',
    'assist.title': 'HUSTLEX ASSISTANT',
  },
};

function t(key, de) {
  if (LANG === 'de') return de != null ? de : key;
  const d = I18N[LANG];
  if (d && d[key] != null) return d[key];
  return de != null ? de : key;
}

function setLang(l) {
  if (!LANGS.some(x => x.id === l)) return;
  LANG = l;
  try { localStorage.setItem('los_lang', l); } catch (e) {}
  applyLang();
}

// Re-render the language-dependent surfaces after a switch.
function applyLang() {
  applyNavLabels();
  const lock = el('lock');
  const lockOpen = lock && lock.style.display !== 'none';
  if (lockOpen && typeof showLock === 'function') { try { showLock(); } catch (e) {} }
  const ob = el('onboard');
  const obOpen = ob && ob.style.display !== 'none' && ob.innerHTML.trim();
  if (obOpen && typeof renderOnboard === 'function') {
    const cur = document.querySelector('.ob-page.on');
    const page = cur ? +(cur.id.replace('ob', '')) : 0;
    try { renderOnboard(); obGo(page); } catch (e) {}
  }
  // Only re-render the app itself once it's actually running (past lock/onboard
  // and with a loaded day) — otherwise the screens hit not-yet-loaded state.
  const appRunning = !lockOpen && !obOpen && typeof STATE !== 'undefined' && STATE.view && STATE.day;
  if (appRunning && typeof renderScreen === 'function') { try { renderScreen(STATE.view); } catch (e) {} }
  if (appRunning && typeof updateStatusBar === 'function') { try { updateStatusBar(); } catch (e) {} }
}

function applyNavLabels() {
  document.querySelectorAll('.nav-btn').forEach(b => {
    const lbl = b.querySelector('.nav-lbl');
    const v = b.dataset.view;
    if (!lbl || !v) return;
    const de = { home: 'HEUTE', koerper: 'KÖRPER', aufgaben: 'AUFGABEN', wachstumhub: 'WACHSTUM', mehr: 'MEHR' }[v];
    if (de) lbl.textContent = t('nav.' + v, de);
  });
}

// A small DE/EN toggle. onChange runs after the language is applied.
function langPicker(compact) {
  const wrap = div('');
  wrap.style.cssText = 'display:flex;gap:6px;justify-content:center;';
  LANGS.forEach(l => {
    const b = h('button', { textContent: l.flag + (compact ? '' : '  ' + l.label) });
    b.className = 'tap';
    const on = LANG === l.id;
    b.style.cssText = 'font-size:' + (compact ? '13px' : '12px') + ';padding:' + (compact ? '6px 12px' : '8px 14px') + ';border-radius:var(--r-sm);cursor:pointer;' +
      (on ? 'background:rgba(10,132,255,.14);border:1px solid rgba(10,132,255,.5);color:var(--gold);font-weight:600;'
          : 'background:var(--glass-1);border:1px solid var(--edge);color:var(--t-2);');
    b.onclick = () => { if (LANG !== l.id) setLang(l.id); };
    wrap.appendChild(b);
  });
  return wrap;
}
