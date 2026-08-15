// ═══════════════════════════════════════════════════════
// STATE · Global app state + day/profile loaders
// ═══════════════════════════════════════════════════════

let STATE = {
  profile: null,
  isPro:   false,
  totalXP: 0,
  day:     null,
  view:    'home',
};

function loadDay() {
  const d = ls('los_day');
  if (d && d.date === today()) return d;
  return {
    date:     today(),
    habits:   [],
    xp:       0,
    water:    0,
    meals:    [],
    supps:    {},
    sleep:    null,
    mood:     null,
    energy:   null,
    recovery: [],
    custom:   null,
  };
}

function saveDay() {
  ls('los_day', STATE.day);
  // Compact per-day snapshot so the STATS calendar has history
  // (los_day itself only ever holds the current day).
  try {
    const t = STATE.day.meals.reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.p }), { kcal: 0, p: 0 });
    ls('los_daystat_' + STATE.day.date, {
      sleepH: (typeof getSleepHours === 'function') ? getSleepHours() : null,
      water: STATE.day.water,
      kcal: t.kcal,
      p: t.p,
      habits: STATE.day.habits.length,
      xp: STATE.day.xp,
      mood: STATE.day.mood,
      energy: STATE.day.energy,
    });
    // Full meals snapshot per day so "copy yesterday" can rebuild the meals.
    ls('los_daymeals_' + STATE.day.date, STATE.day.meals);
    // Prune old meal snapshots — keep the most recent ~10 days.
    const mk = Object.keys(localStorage).filter(k => k.startsWith('los_daymeals_'));
    if (mk.length > 10) {
      mk.map(k => ({ k, d: new Date(k.slice(13)).getTime() || 0 }))
        .sort((a, b) => a.d - b.d).slice(0, mk.length - 10)
        .forEach(o => { try { localStorage.removeItem(o.k); } catch (e) {} });
    }
  } catch (e) {}
}

function initState() {
  STATE.profile = ls('los_profile');
  STATE.isPro   = ls('los_pro') || false;
  STATE.totalXP = ls('los_xp')  || 0;
  STATE.day     = loadDay();
}

// Combo state for XP multipliers
const COMBO = { count: 0, timer: null, multi: 1 };
