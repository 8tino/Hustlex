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
