// ═══════════════════════════════════════════════════════
// HELPERS · DOM utilities + computations + AI call
// ═══════════════════════════════════════════════════════

// ─── DOM ──────────────────────────────────────────────
const el = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function h(tag, attrs, html) {
  const e = document.createElement(tag);
  if (attrs) Object.assign(e, attrs);
  // Only set innerHTML when there's actual content — an empty string here used
  // to WIPE a textContent passed via attrs (e.g. h('button',{textContent:'x'},'')).
  if (html) e.innerHTML = html;
  return e;
}

function div(cls, inner) {
  const e = document.createElement('div');
  if (cls)   e.className = cls;
  if (inner) e.innerHTML = inner;
  return e;
}

// Uniform "done" checkbox used across the app (quests, supplements, tasks …).
// Returns a circular button; pass done=true for the green filled state.
function checkCircle(done) {
  const b = h('button', { textContent: '✓' });
  b.className = 'tap check-circle' + (done ? ' on' : '');
  return b;
}

// Customization: is a page module/section switched on? Default = on. The user
// toggles these under Mehr → 🎛 App anpassen (store los_modules).
function moduleOn(key) { const m = ls('los_modules') || {}; return m[key] !== false; }

// ─── Akzentfarbe (app-weit) ───
// Überschreibt die --gold-* Variablen zur Laufzeit. Standard: Apple-Blau.
const ACCENTS = [
  { id: 'blue',   name: 'Blau',    c: '#0A84FF', soft: '#409CFF', deep: '#0060DF', rgb: '10,132,255' },
  { id: 'gold',   name: 'Gold',    c: '#C5A45A', soft: '#D4B76A', deep: '#A88A3E', rgb: '197,164,90' },
  { id: 'green',  name: 'Grün',    c: '#30D158', soft: '#5CE07C', deep: '#24A845', rgb: '48,209,88' },
  { id: 'purple', name: 'Violett', c: '#BF5AF2', soft: '#D07EF6', deep: '#9A3FCF', rgb: '191,90,242' },
  { id: 'orange', name: 'Orange',  c: '#FF9F0A', soft: '#FFB340', deep: '#D9800A', rgb: '255,159,10' },
  { id: 'pink',   name: 'Pink',    c: '#FF375F', soft: '#FF6482', deep: '#D92448', rgb: '255,55,95' },
];
function applyAccent() {
  try {
    const a = ACCENTS.find(x => x.id === (ls('los_accent') || 'blue')) || ACCENTS[0];
    const r = document.documentElement.style;
    r.setProperty('--gold', a.c); r.setProperty('--gold-soft', a.soft); r.setProperty('--gold-deep', a.deep);
    r.setProperty('--gold-glow', 'rgba(' + a.rgb + ',0.30)'); r.setProperty('--gold-tint', 'rgba(' + a.rgb + ',0.14)');
  } catch (e) {}
}
if (typeof document !== 'undefined') applyAccent();

// Collapsible section — keeps long screens compact and remembers (per key)
// what the user expanded. Append content to the returned element's ._body.
function section(title, key, defaultOpen) {
  const det = document.createElement('details');
  det.className = 'sect';
  let open = !!defaultOpen;
  if (key) { const v = localStorage.getItem('ui_sect_' + key); if (v != null) open = v === '1'; }
  det.open = open;
  det.innerHTML = '<summary class="sect-sum">' + title + '</summary>';
  const body = div('sect-body'); det.appendChild(body); det._body = body;
  if (key) det.addEventListener('toggle', () => { try { localStorage.setItem('ui_sect_' + key, det.open ? '1' : '0'); } catch (e) {} });
  return det;
}

// ─── HAPTIC ───────────────────────────────────────────
function haptic(type) {
  if (!navigator.vibrate) return;
  const patterns = {
    light:       8,
    success:     [10, 5, 10, 5, 20],
    levelup:     [50, 20, 50, 20, 100],
    achievement: [20, 10, 20, 10, 60],
    warn:        [30, 30, 30],
  };
  navigator.vibrate(patterns[type] || 8);
}

// ─── COMPUTATIONS ─────────────────────────────────────
function getLvl(xp) {
  const l = LEVELS.find(x => xp >= x.min && xp <= x.max) || LEVELS[LEVELS.length - 1];
  const nx = LEVELS[l.l] || l;
  return { ...l, nx };
}

// Use-it-or-lose-it: XP decays on days the app wasn't opened, so a level has to
// be maintained. Runs once per day on start; never punishes the first ever day.
function decayXP() {
  const K = 'los_last_active';
  const last = ls(K);
  const t = today();
  if (!last) { ls(K, t); return; }
  if (last === t) return;
  const missed = Math.floor((new Date(t) - new Date(last)) / 86400000);
  if (missed >= 1 && STATE.totalXP > 0) {
    const dec = Math.min(STATE.totalXP, missed * 25); // 25 XP pro verpasstem Tag
    STATE.totalXP -= dec;
    ls('los_xp', STATE.totalXP);
    setTimeout(() => showToast('−' + dec + ' XP · ' + missed + ' Tag(e) inaktiv', '📉'), 1400);
  }
  ls(K, t);
}

// Reverse an XP award when something is de-selected/un-done. No combo, no
// level-up — just give the points back cleanly (floored at 0).
function subXP(n, cat) {
  n = Math.max(0, Math.round(n || 0));
  if (!n) return;
  STATE.totalXP = Math.max(0, (STATE.totalXP || 0) - n);
  ls('los_xp', STATE.totalXP);
  if (cat) {
    const cx = ls('los_catxp') || { body: { xp: 0, lv: 1 }, mind: { xp: 0, lv: 1 }, discipline: { xp: 0, lv: 1 }, goals: { xp: 0, lv: 1 } };
    if (!cx[cat]) cx[cat] = { xp: 0, lv: 1 };
    cx[cat].xp = Math.max(0, cx[cat].xp - n);
    ls('los_catxp', cx);
  }
  if (typeof updateStatusBar === 'function') updateStatusBar();
}

function getTotals() {
  const base = STATE.day.meals.reduce(
    (a, m) => ({ kcal: a.kcal + (m.kcal || 0), p: a.p + (m.p || 0), c: a.c + (m.c || 0), f: a.f + (m.f || 0) }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
  // Eigene, frei definierte Makros (Ballaststoffe, Zucker …) aus meal.x summieren.
  base.x = {};
  if (typeof getMacros === 'function') {
    getMacros().forEach(mac => {
      base.x[mac.id] = STATE.day.meals.reduce((a, m) => a + ((m.x && m.x[mac.id]) || 0), 0);
    });
  }
  return base;
}

function getCats() {
  const qs = (typeof getQuests === 'function') ? getQuests() : HABITS;
  return {
    body:       qs.some(h => h.cat === 'body'       && STATE.day.habits.includes(h.id)),
    mind:       qs.some(h => h.cat === 'mind'       && STATE.day.habits.includes(h.id)),
    discipline: qs.some(h => h.cat === 'discipline' && STATE.day.habits.includes(h.id)),
  };
}

function getGateOpen() {
  const c = getCats();
  return STATE.day.xp >= 70 && c.body && c.mind && c.discipline;
}

function getSleepHours() {
  if (!STATE.day.sleep) return null;
  const [bh, bm] = STATE.day.sleep.bed.split(':').map(Number);
  const [wh, wm] = STATE.day.sleep.wake.split(':').map(Number);
  let m = (wh * 60 + wm) - (bh * 60 + bm);
  if (m < 0) m += 1440;
  return (m / 60).toFixed(1);
}

function getFScore() {
  const t = getTotals();
  let s = 0;
  s += Math.min(25, (STATE.day.xp / 70) * 25);
  const cfg = getCfg();
  s += Math.min(15, (t.p / cfg.proteinGoal) * 15);
  s += Math.min(10, (STATE.day.water / cfg.waterGoal) * 10);
  if (STATE.day.sleep)               s += Math.min(20, (STATE.day.sleep.quality / 5) * 20);
  if (STATE.day.mood && STATE.day.energy) s += Math.min(10, ((STATE.day.mood + STATE.day.energy) / 10) * 10);
  s += Math.min(10, (STATE.day.recovery.length / 4) * 10);
  s += Math.min(10, (Object.keys(STATE.day.supps).length / SUPPS.length) * 10);
  return Math.round(Math.min(100, s));
}

// Single accent colour app-wide (Apple blue) for a consistent iOS look,
// regardless of the per-goal colour stored on the profile.
function pColor() { return '#0A84FF'; }

// ─── AVATAR ───────────────────────────────────────────
// Avatars can be 1–2 emoji (e.g. "⚔🦾"). Count graphemes so a multi-emoji
// avatar gets a smaller font and never spills out of its round badge.
function graphemeCount(str) {
  if (!str) return 0;
  try { return [...new Intl.Segmenter('de').segment(str)].length; }
  catch { return Array.from(str).length; }
}
// Inline style for an avatar badge that always clips to its box.
function avatarStyle(box) {
  const av = STATE.profile?.avatar || '⚡';
  const n = graphemeCount(av);
  const fs = box <= 40 ? (n >= 2 ? Math.round(box * 0.34) : Math.round(box * 0.46))
                       : (n >= 2 ? Math.round(box * 0.32) : Math.round(box * 0.44));
  return 'display:flex;align-items:center;justify-content:center;overflow:hidden;line-height:1;' +
    'font-size:' + fs + 'px;letter-spacing:-1px;';
}

// User-configurable daily targets (with sensible defaults)
function getCfg() { return Object.assign({ proteinGoal: 160, waterGoal: 3000, kcalGoal: 2400, sleepGoal: 7.5, carbsGoal: 250, fatGoal: 70 }, ls('los_cfg') || {}); }
function saveCfg(patch) { ls('los_cfg', Object.assign(getCfg(), patch)); }
function goalP() { return GOALS[STATE.profile?.goalId] || GOALS.custom; }

// ─── PROGRESS RING (conic-gradient donut) ─────────────
function progressRing(pct, color, size, thickness, innerHtml) {
  pct = Math.max(0, Math.min(100, Math.round(pct)));
  size = size || 64; thickness = thickness || 8;
  const wrap = div('');
  wrap.style.cssText = 'position:relative;width:' + size + 'px;height:' + size + 'px;flex-shrink:0;';
  const ring = div('');
  ring.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:conic-gradient(' + color + ' ' + (pct * 3.6) + 'deg, rgba(255,255,255,.08) ' + (pct * 3.6) + 'deg);' + (pct >= 100 ? 'box-shadow:0 0 14px ' + color + '99;' : '');
  const hole = div('');
  hole.style.cssText = 'position:absolute;inset:' + thickness + 'px;border-radius:50%;background:#0a0b10;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;';
  if (innerHtml) hole.innerHTML = innerHtml;
  ring.appendChild(hole); wrap.appendChild(ring);
  return wrap;
}
function _avg(arr) { const v = arr.filter(x => x !== null && !isNaN(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; }

// ─── ACHIEVEMENTS ─────────────────────────────────────
function getUnlocked() { return ls('los_ach') || []; }

function checkAchievements() {
  const unlocked = getUnlocked();
  ACH.forEach(a => {
    if (!unlocked.includes(a.id)) {
      try {
        if (a.chk()) {
          unlocked.push(a.id);
          ls('los_ach', unlocked);
          haptic('achievement');
          showToast(a.name, ACH_IC[a.id]);
        }
      } catch (e) {}
    }
  });
}

// ─── AI ───────────────────────────────────────────────
// Reusable collapsible "ask the AI" block — used on Home & Vitals.
function aiBlock(label, prompt, color) {
  const wrap = div('');
  const btn = h('button', { textContent: '◈  ' + label }, '');
  btn.className = 'btn btn-glass tap';
  btn.style.cssText = 'margin-top:4px;font-size:11px;letter-spacing:1.5px;';
  if (color) btn.style.color = color;

  const res = div('glass notranslate', '');   // AI output is dynamic — never run it through the UI translator
  res.style.cssText = 'margin-top:8px;font-size:13px;color:var(--t-2);line-height:1.85;white-space:pre-line;display:none;';

  btn.onclick = async () => {
    if (res.style.display === 'block') { res.style.display = 'none'; btn.textContent = '◈  ' + label; return; }
    btn.textContent = '◈  ' + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'ANALYZING…' : 'ANALYSIERE…'); btn.style.opacity = '.5';
    const langHint = (typeof LANG !== 'undefined' && LANG === 'en') ? ' Answer in English.' : ' Antworte auf Deutsch.';
    try { res.textContent = await callAI(prompt + langHint); }
    catch (e) { res.textContent = '⚠ ' + (e.message || ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Connection error.' : 'Verbindungsfehler.')); }
    res.style.display = 'block';
    btn.style.opacity = '1'; btn.textContent = '◈  ' + label;
  };
  wrap.appendChild(btn); wrap.appendChild(res);
  return wrap;
}

// Routes through the Supabase Edge Function (aiFetch in 05-sync.js) so the
// Anthropic key stays server-side. Throws on error so callers can show it.
async function callAI(prompt, system, maxTokens, model) {
  const sys = system || 'Antworte auf Deutsch, direkt und konkret. Kein Intro.';
  const mt = maxTokens || 500;

  // BYOK: eigenes Anthropic-Konto. Wenn hinterlegt & aktiv, ruft die App die
  // Anthropic-API direkt auf (kein Server-Key nötig, keine Anmeldung nötig,
  // freie Modellwahl). Key liegt nur lokal (E2EE-gesynct), nie im Code.
  const byok = ls('los_byok');
  if (byok && byok.on && byok.key) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': byok.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: model || byok.model || BEST_AI_MODEL, max_tokens: mt, system: sys, messages: [{ role: 'user', content: prompt }] }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.error?.message || ('KI-Fehler ' + r.status));
    return d?.content?.[0]?.text || 'Fehler.';
  }

  // Sonst: über die Supabase Edge Function (Server-Key, Login nötig).
  // Gratis-Tageslimit prüfen (nur ohne eigenen Key & ohne Pro).
  if (typeof aiQuotaGate === 'function') aiQuotaGate();
  const payload = { system: sys, max_tokens: mt, messages: [{ role: 'user', content: prompt }] };
  if (model) payload.model = model;
  const d = await aiFetch(payload);
  if (typeof aiRecordUse === 'function') aiRecordUse();
  return d?.content?.[0]?.text || 'Fehler.';
}

// Bestes Modell für hochwertige Generierung (Kurse etc.).
const BEST_AI_MODEL = 'claude-opus-5';

// KI-Berechtigungen: Standard = Zugriff auf alles. Ein in los_ai_scopes auf
// false gesetzter Bereich ist zu 100 % gesperrt (wird der KI nie gezeigt und
// nicht exportiert). Bereiche: koerper, aufgaben, ziele, kurse, wissen, finanzen.
function aiScopeAllowed(area) {
  const sc = ls('los_ai_scopes') || {};
  return sc[area] !== false;
}
