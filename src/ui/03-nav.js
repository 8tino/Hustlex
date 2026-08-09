// ═══════════════════════════════════════════════════════
// NAV · 5 top sections, each a hub. Bottom bar = Heute · Körper ·
//   Aufgaben · Wachstum · Mehr. The middle three group the existing
//   screens so nothing lives more than one drill-in away.
//     · Körper / Aufgaben = sub-tab hubs (bar on top of the child screen)
//     · Wachstum          = a cards hub (tap a card → child + back link)
// ═══════════════════════════════════════════════════════

const HUBS = {
  koerper:  { kind: 'tabs', def: 'vitals', tabs: [
    { v: 'vitals', l: 'Vitals' },
    { v: 'habits', l: 'Gewohnheiten' },
    { v: 'quests', l: 'Quests' },
  ] },
  aufgaben: { kind: 'tabs', def: 'fokus', tabs: [
    { v: 'fokus', l: 'Tagesplan', ft: 'plan' },
    { v: 'tasks', l: 'Tasks' },
    { v: 'log',   l: 'Log' },
    { v: 'fokus', l: 'Disziplin', ft: 'disziplin' },
  ] },
  wachstumhub: { kind: 'cards' },
};

// child view → its hub
const CHILD_HUB = {
  vitals: 'koerper', quests: 'koerper', habits: 'koerper',
  fokus: 'aufgaben', tasks: 'aufgaben', log: 'aufgaben',
  ich: 'wachstumhub', kurse: 'wachstumhub', skills: 'wachstumhub', manifest: 'wachstumhub', wachstum: 'wachstumhub', intel: 'wachstumhub', finanzen: 'wachstumhub', markt: 'wachstumhub',
};

// Which bottom-nav button should light up for a given view.
function navParent(view) {
  if (view === 'home' || view === 'mehr') return view;
  if (HUBS[view]) return view === 'koerper' || view === 'aufgaben' ? view : 'wachstumhub';
  return CHILD_HUB[view] || 'mehr';
}

// Navigation history for the iOS-style edge-swipe-back gesture and the
// browser / Android hardware back button. Holds the trail of views we came
// through (view names only — reliable across the hub/sub-tab model).
let NAV_HIST = [];

function navTo(view, opts) {
  opts = opts || {};
  const from = STATE.view;
  // Resolve hub ids to a concrete screen.
  if (HUBS[view]) {
    if (HUBS[view].kind === 'tabs') view = (STATE.hubLast && STATE.hubLast[view]) || HUBS[view].def;
    // cards hub (wachstumhub) is itself a real screen
  }
  const scr = el('s_' + view);
  if (!scr) return;

  // Record where we came from so we can swipe/back our way there again.
  if (!opts.back && from && from !== view) {
    NAV_HIST.push(from);
    if (NAV_HIST.length > 60) NAV_HIST.shift();
    try { history.pushState({ los: 1 }, ''); } catch (e) {}
  }

  // Leaving the planner resets its selected day back to today.
  if (view !== 'fokus' && typeof PLAN_DATE !== 'undefined') PLAN_DATE = null;

  // Remember the last child of a sub-tab hub so re-tapping returns to it.
  const hubId = CHILD_HUB[view];
  if (hubId && HUBS[hubId] && HUBS[hubId].kind === 'tabs') {
    STATE.hubLast = STATE.hubLast || {};
    STATE.hubLast[hubId] = view;
  }

  const parent = navParent(view);
  $$('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.view === parent));
  $$('.screen').forEach(s => s.classList.remove('on'));

  STATE.view = view;
  scr.classList.add('on');
  if (opts.back) {                       // slide the revealed screen in from the left
    scr.classList.add('nav-back');
    setTimeout(() => scr.classList.remove('nav-back'), 380);
  }
  if (typeof renderScreen === 'function') renderScreen(view);
  el('content').scrollTop = 0;
}

// True while a real screen (not the root) sits below the current one.
function navCanBack() { return NAV_HIST.length > 0; }

// Step back to the previous screen. Returns false at the root.
let NAV_BACK_AT = 0;
function navBack() {
  if (!NAV_HIST.length) return false;
  // Swallow duplicate triggers (e.g. a native edge-swipe AND our custom gesture,
  // or touchend+touchcancel firing together) so ONE swipe never jumps back
  // several screens. Report "handled" so the caller doesn't re-push a root state.
  if (Date.now() - NAV_BACK_AT < 400) return true;
  NAV_BACK_AT = Date.now();
  const prev = NAV_HIST.pop();
  navTo(prev, { back: true });
  return true;
}

// Prepend the hub navigation (sub-tab bar or back link) to a child screen.
// Called by renderScreen so it stays in sync on every re-render.
function renderHubNav(view, s) {
  const hubId = CHILD_HUB[view];
  if (!hubId) return;
  const hub = HUBS[hubId];
  if (hub.kind === 'cards') {
    const bar = div('');
    bar.style.cssText = 'margin-bottom:8px;';
    const b = h('button', { textContent: '‹ Wachstum' });
    b.className = 'btn btn-ghost tap';
    b.style.cssText = 'font-size:12px;width:auto;padding:8px 14px;';
    b.onclick = () => navTo('wachstumhub');
    bar.appendChild(b);
    s.insertBefore(bar, s.firstChild);
    return;
  }
  // sub-tab bar — segmented control, sticky at the top of the scroll area
  const bar = div('hubbar');
  hub.tabs.forEach(t => {
    const active = view === t.v && (!t.ft || (typeof FOKUS_TAB !== 'undefined' && FOKUS_TAB === t.ft));
    const b = h('button', { textContent: t.l });
    b.className = 'tap' + (active ? ' on' : '');
    b.onclick = () => { if (t.ft && typeof FOKUS_TAB !== 'undefined') FOKUS_TAB = t.ft; navTo(t.v); };
    bar.appendChild(b);
  });
  s.insertBefore(bar, s.firstChild);
}

// Backward-compatible alias: accepts a view name or a nav-button element.
function nav(target) {
  navTo(typeof target === 'string' ? target : target?.dataset?.view);
}

function initNav() {
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navTo(btn.dataset.view));
  });
  initSwipeBack();
  initBackButton();
}

// ─── iPhone-style edge-swipe-back ────────────────────────
// Start a drag within ~30px of the left edge and pull right → the current
// screen follows your finger; release past the threshold to go back.
function initSwipeBack() {
  const content = el('content');
  if (!content) return;
  // Only run our custom edge-swipe when installed as a standalone app. In a
  // normal browser tab the browser's OWN edge-swipe already goes back (via
  // popstate) — running both is exactly what made it jump back twice.
  const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (!standalone) return;

  let startX = 0, startY = 0, dx = 0;
  let tracking = false, decided = false, horizontal = false;
  const EDGE = 30;                 // must begin this close to the left edge
  const curScreen = () => document.querySelector('.screen.on');

  content.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || !navCanBack()) return;
    const t = e.touches[0];
    if (t.clientX > EDGE) return;          // only from the left edge
    startX = t.clientX; startY = t.clientY; dx = 0;
    tracking = true; decided = false; horizontal = false;
  }, { passive: true });

  content.addEventListener('touchmove', (e) => {
    if (!tracking) return;
    const t = e.touches[0];
    dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!decided) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;   // wait for a clear direction
      decided = true;
      horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
      if (horizontal) {
        const s = curScreen();
        if (s) s.style.transition = 'none';
      } else { tracking = false; return; } // vertical → let the page scroll
    }
    if (dx < 0) dx = 0;
    const s = curScreen();
    if (s) {
      s.style.transform = 'translateX(' + dx + 'px)';
      s.style.opacity = String(Math.max(0.45, 1 - dx / (window.innerWidth * 1.5)));
    }
    e.preventDefault();                    // stop the page from scrolling mid-swipe
  }, { passive: false });

  const finish = () => {
    if (!tracking) return;
    tracking = false;
    const s = curScreen();
    const w = window.innerWidth;
    const commit = horizontal && dx > Math.min(120, w * 0.3);
    if (!s) { if (commit) history.back(); return; }
    s.style.transition = 'transform .26s var(--ease-out), opacity .26s var(--ease-out)';
    if (commit) {
      s.style.transform = 'translateX(' + w + 'px)';
      s.style.opacity = '0';
      setTimeout(() => {
        history.back();                    // drives navBack via popstate
        s.style.transition = 'none'; s.style.transform = ''; s.style.opacity = '';
      }, 180);
    } else {
      s.style.transform = ''; s.style.opacity = '';
    }
  };
  content.addEventListener('touchend', finish, { passive: true });
  content.addEventListener('touchcancel', finish, { passive: true });
}

// ─── Hardware / browser back button ──────────────────────
// Keeps the app from exiting on back: a back press closes an open overlay,
// otherwise steps through the in-app history.
function initBackButton() {
  try { history.replaceState({ los: 1, root: 1 }, ''); } catch (e) {}
  window.addEventListener('popstate', () => {
    const ov = el('overlay');
    if (ov && ov.classList.contains('on')) {   // close a modal first
      if (typeof closeOverlay === 'function') closeOverlay();
      try { history.pushState({ los: 1 }, ''); } catch (e) {}
      return;
    }
    if (!navBack()) {                           // at the root → stay in the app
      try { history.pushState({ los: 1, root: 1 }, ''); } catch (e) {}
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}
