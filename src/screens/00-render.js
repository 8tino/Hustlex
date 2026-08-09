// ═══════════════════════════════════════════════════════
// RENDER ENGINE · dispatches a view name to its screen renderer
// ═══════════════════════════════════════════════════════

function renderScreen(v) {
  const s = el('s_' + v);
  if (!s) return;
  s.innerHTML = '';
  switch (v) {
    case 'home':        renderHome(s); break;
    case 'tasks':       renderTasks(s); break;
    case 'log':         renderLog(s); break;
    case 'fokus':       renderFokus(s); break;
    case 'quests':      renderQuests(s); break;
    case 'habits':      renderHabits(s); break;
    case 'vitals':      renderVitals(s); break;
    case 'intel':       renderIntel(s); break;
    case 'ich':         renderIch(s); break;
    case 'wachstum':    renderWachstum(s); break;
    case 'wachstumhub': renderWachstumHub(s); break;
    case 'finanzen':    renderFinanzen(s); break;
    case 'kurse':       renderKurse(s); break;
    case 'skills':      renderSkills(s); break;
    case 'manifest':    renderManifest(s); break;
    case 'mehr':        renderMehr(s); break;
  }
  // Prepend the section's hub navigation (sub-tabs or back link).
  if (typeof renderHubNav === 'function') renderHubNav(v, s);
}

// Shared screen header: small label + serif headline with a gold accent word.
function screenHead(label, plain, accent, tail) {
  return '<div class="label" style="margin-bottom:4px;">' + label + '</div>' +
    '<div class="h2">' + plain + ' <span class="gold italic">' + accent + '</span>' + (tail || '') + '</div>';
}
