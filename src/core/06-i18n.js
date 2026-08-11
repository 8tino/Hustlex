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
  const prev = LANG;
  LANG = l;
  try { localStorage.setItem('los_lang', l); } catch (e) {}
  // Switching back to German: the cleanest way to restore the original source
  // strings (the DOM translator replaced them in place) is a reload.
  if (prev === 'en' && l === 'de') { location.reload(); return; }
  applyLang();
  startI18nTranslator();
}

// ─── Full-app DOM translation (DE source → EN) ────────────
// Instead of wrapping every string with t(), a MutationObserver watches the
// DOM and swaps known German text/placeholders for English from I18N_PHRASES.
// The user's own data (not in the dictionary) is left untouched.
let _i18nObs = null;
function _trExact(raw) {
  const d = (typeof I18N_PHRASES !== 'undefined' && I18N_PHRASES.en) || {};
  const lead = (raw.match(/^\s*/) || [''])[0];
  const trail = (raw.match(/\s*$/) || [''])[0];
  const core = raw.trim().replace(/\s+/g, ' ');
  if (core && d[core] != null) return lead + d[core] + trail;
  return null;
}
function _trWords(raw) {
  const w = (typeof I18N_WORDS !== 'undefined' && I18N_WORDS.en) || {};
  let out = raw, changed = false;
  for (const k in w) { const re = new RegExp('(^|[^\\p{L}])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^\\p{L}])', 'gu'); const nx = out.replace(re, (m, p1) => p1 + w[k]); if (nx !== out) { out = nx; changed = true; } }
  return changed ? out : null;
}
// Never translate dynamic content (AI answers, the user's own text). Any element
// tagged .notranslate — and its subtree — is left exactly as written.
function _isNoTr(node) {
  let e = node && node.nodeType === 3 ? node.parentElement : node;
  while (e) { if (e.classList && e.classList.contains('notranslate')) return true; e = e.parentElement; }
  return false;
}
function _trTextNode(n) {
  const raw = n.nodeValue;
  if (!raw || !/[A-Za-zÀ-ÿ]/.test(raw)) return;
  if (_isNoTr(n)) return;
  const ex = _trExact(raw); if (ex != null && ex !== raw) { n.nodeValue = ex; return; }
  const wd = _trWords(raw); if (wd != null && wd !== raw) n.nodeValue = wd;
}
function _trAttr(elm, attr) {
  if (_isNoTr(elm)) return;
  const v = elm.getAttribute(attr); if (!v) return;
  const ex = _trExact(v); if (ex != null && ex !== v) elm.setAttribute(attr, ex);
}
function translateTree(root) {
  if (LANG !== 'en' || !root) return;
  if (root.nodeType === 3) { _trTextNode(root); return; }
  if (root.nodeType !== 1) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; let n; while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(_trTextNode);
  ['placeholder', 'title'].forEach(a => {
    if (root.hasAttribute && root.hasAttribute(a)) _trAttr(root, a);
    root.querySelectorAll && root.querySelectorAll('[' + a + ']').forEach(e => _trAttr(e, a));
  });
}
function startI18nTranslator() {
  if (LANG !== 'en') return;
  translateTree(document.body);
  if (_i18nObs) return;
  _i18nObs = new MutationObserver(muts => {
    if (LANG !== 'en') return;
    for (const m of muts) {
      if (m.type === 'childList') m.addedNodes.forEach(nd => translateTree(nd));
      else if (m.type === 'characterData') _trTextNode(m.target);
      else if (m.type === 'attributes') _trAttr(m.target, m.attributeName);
    }
  });
  _i18nObs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title'] });
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

// Kick off the DOM translator on load for returning English users.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { if (LANG === 'en') startI18nTranslator(); });
} else if (LANG === 'en') {
  startI18nTranslator();
}
