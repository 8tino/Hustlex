// ═══════════════════════════════════════════════════════
// VORBILDER · You name people you admire → AI extracts their
//   skills/principles and builds you a personal learning path.
//   (Sub-tab inside Wachstum.) Needs the AI proxy (login + key).
// ═══════════════════════════════════════════════════════

function getVorbilder() { return ls('los_vorbilder') || []; }
function saveVorbilder(a) { ls('los_vorbilder', a); }

// Defensive JSON extraction from an AI reply.
function parseAIJson(txt) {
  let j = (txt || '').trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const a = j.indexOf('{'), b = j.lastIndexOf('}');
  if (a >= 0 && b >= 0) j = j.slice(a, b + 1);
  return JSON.parse(j);
}

async function aiBuildCourse(person) {
  const prompt =
    'Ich bewundere ' + person.name + '.' + (person.why ? ' Warum: ' + person.why + '.' : '') +
    '\n\nAnalysiere ' + person.name + ': Welche 4–6 konkreten Skills, Gewohnheiten und Denkweisen machen diese Person aus?' +
    ' Erstelle dann einen umsetzbaren Lern-Pfad mit 3–5 Modulen; jedes Modul mit kurzem Titel und 2–3 konkreten täglichen/wöchentlichen Übungen.' +
    '\n\nAntworte NUR mit JSON (kein Text drumherum):' +
    '\n{"skills":["..."],"modules":[{"title":"...","practices":["...","..."]}]}';
  const txt = await callAI(prompt, 'Du bist ein Mentor & Skill-Coach. Antworte NUR mit gültigem JSON.', 1400);
  const data = parseAIJson(txt);
  if (!Array.isArray(data.skills) || !Array.isArray(data.modules)) throw new Error('Unerwartetes Format');
  return data;
}

function renderVorbilder(p) {
  p.innerHTML = '';
  const desc = div('', 'Nenne Menschen, die du bewunderst. Die KI findet heraus, was sie ausmacht, und baut dir einen Lern-Pfad, um diese Skills selbst zu entwickeln.');
  desc.style.cssText = 'font-size:13px;color:var(--t-2);line-height:1.6;padding:2px 0 6px;';
  p.appendChild(desc);

  const list = getVorbilder();
  list.forEach(v => p.appendChild(renderVorbildCard(v)));

  // Add new role model
  const addLbl = div('label', 'NEUES VORBILD'); addLbl.style.cssText = 'font-size:10px;margin-top:6px;'; p.appendChild(addLbl);
  const nameI = h('input', { type: 'text', placeholder: 'Name (z. B. David Goggins, Steve Jobs …)' }, ''); nameI.className = 'inp'; nameI.style.marginBottom = '8px';
  const whyI = h('input', { type: 'text', placeholder: 'Was bewunderst du an dieser Person? (optional)' }, ''); whyI.className = 'inp'; whyI.style.marginBottom = '8px';
  const addBtn = h('button', { textContent: '+ Vorbild hinzufügen' }, ''); addBtn.className = 'btn btn-glass tap';
  addBtn.onclick = () => {
    const name = nameI.value.trim(); if (!name) return;
    const arr = getVorbilder(); arr.push({ id: Date.now(), name, why: whyI.value.trim(), course: null });
    saveVorbilder(arr); renderVorbilder(p);
  };
  p.appendChild(nameI); p.appendChild(whyI); p.appendChild(addBtn);

  // Combined path
  if (list.length >= 2) {
    const cLbl = div('label gold', '★ KOMBINIERTER SKILL-PFAD'); cLbl.style.cssText = 'margin-top:14px;'; p.appendChild(cLbl);
    const cDesc = div('', 'Ein gemeinsamer Plan aus allen deinen Vorbildern.'); cDesc.style.cssText = 'font-size:12px;color:var(--t-3);margin-bottom:6px;'; p.appendChild(cDesc);
    const combined = ls('los_vorbild_pfad');
    if (combined) p.appendChild(renderCourseBody(combined, 'combined'));
    const cBtn = h('button', { textContent: combined ? '↻ Plan neu erstellen' : '✦ Kombinierten Plan erstellen' }, '');
    cBtn.className = 'btn btn-gold tap'; cBtn.style.marginTop = '6px';
    cBtn.onclick = async () => {
      cBtn.disabled = true; cBtn.style.opacity = '.5'; cBtn.innerHTML = '<span class="anim-spin">⚙</span> Erstelle…';
      try {
        const names = getVorbilder().map(v => v.name + (v.why ? ' (' + v.why + ')' : '')).join('; ');
        const txt = await callAI('Meine Vorbilder: ' + names + '.\n\nBaue EINEN kombinierten, umsetzbaren Skill-Entwicklungs-Pfad, der die wichtigsten Stärken dieser Personen vereint. 4–6 Module, je Titel + 2–3 konkrete Übungen.\n\nNUR JSON: {"skills":["..."],"modules":[{"title":"...","practices":["..."]}]}',
          'Du bist ein Mentor & Skill-Coach. Antworte NUR mit gültigem JSON.', 1600);
        ls('los_vorbild_pfad', parseAIJson(txt));
        haptic('success'); renderVorbilder(p);
      } catch (e) { showToast('Konnte Plan nicht erstellen: ' + (e.message || ''), '⚠'); cBtn.disabled = false; cBtn.style.opacity = '1'; cBtn.textContent = '✦ Kombinierten Plan erstellen'; }
    };
    p.appendChild(cBtn);
  }
}

function renderVorbildCard(v) {
  const card = div('glass', '');
  card.innerHTML = '<div style="display:flex;align-items:flex-start;gap:10px;">' +
    '<div style="flex:1;"><div style="font-size:15px;font-weight:700;color:var(--t-1);">' + v.name + '</div>' +
    (v.why ? '<div style="font-size:12px;color:var(--t-3);margin-top:2px;">' + v.why + '</div>' : '') + '</div></div>';
  const del = h('button', { textContent: '×' }, '');
  del.style.cssText = 'position:absolute;top:14px;right:14px;background:none;color:var(--t-4);font-size:15px;';
  del.onclick = () => { saveVorbilder(getVorbilder().filter(x => x.id !== v.id)); renderScreen('wachstum'); };
  card.appendChild(del);

  if (v.course) {
    card.appendChild(renderCourseBody(v.course, v.id));
    const re = h('button', { textContent: '↻ Kurs neu generieren' }, ''); re.className = 'btn btn-ghost tap'; re.style.cssText = 'margin-top:10px;font-size:12px;';
    re.onclick = () => genCourseFor(v, card, re);
    card.appendChild(re);
  } else {
    const gen = h('button', { textContent: '✦ Kurs erstellen' }, ''); gen.className = 'btn btn-gold tap'; gen.style.marginTop = '12px';
    gen.onclick = () => genCourseFor(v, card, gen);
    card.appendChild(gen);
  }
  return card;
}

async function genCourseFor(v, card, btn) {
  btn.disabled = true; btn.style.opacity = '.5'; btn.innerHTML = '<span class="anim-spin">⚙</span> Analysiere ' + v.name + '…';
  try {
    const course = await aiBuildCourse(v);
    const arr = getVorbilder(); const it = arr.find(x => x.id === v.id); it.course = course; saveVorbilder(arr);
    haptic('success'); renderScreen('wachstum');
  } catch (e) {
    showToast('Kurs fehlgeschlagen: ' + (e.message || ''), '⚠');
    btn.disabled = false; btn.style.opacity = '1'; btn.textContent = '✦ Kurs erstellen';
  }
}

function renderCourseBody(course, key) {
  const wrap = div(''); wrap.style.cssText = 'margin-top:12px;';
  if (course.skills && course.skills.length) {
    wrap.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin-bottom:6px;">KERN-SKILLS</div>');
    const chips = div(''); chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;';
    course.skills.forEach(sk => chips.insertAdjacentHTML('beforeend', '<span class="pill" style="font-size:11px;">' + sk + '</span>'));
    wrap.appendChild(chips);
  }
  (course.modules || []).forEach((m, i) => {
    const mod = div('glass-hi', '<div style="font-size:13px;font-weight:700;color:var(--gold);margin-bottom:6px;">' + (i + 1) + '. ' + m.title + '</div>');
    mod.style.cssText = 'margin-bottom:8px;padding:13px;';
    (m.practices || []).forEach(pr => {
      const r = div('', '<span class="dot dot-sm" style="margin-top:7px;"></span><div style="flex:1;font-size:13px;color:var(--t-2);line-height:1.5;">' + pr + '</div>');
      r.style.cssText = 'display:flex;gap:8px;align-items:flex-start;padding:4px 0;';
      const add = h('button', { textContent: '+ Lernliste' }, '');
      add.className = 'tap'; add.style.cssText = 'background:none;color:var(--gold);font-size:11px;white-space:nowrap;flex:none;';
      add.onclick = () => {
        const d = ls('los_lernen') || { learning: [], mastered: [], review: [] };
        d.learning.push({ id: Date.now(), text: pr, note: '', added: new Date().toLocaleDateString('de-DE') });
        ls('los_lernen', d); showToast('Zur Lernliste hinzugefügt', '📚');
      };
      r.appendChild(add); mod.appendChild(r);
    });
    wrap.appendChild(mod);
  });
  return wrap;
}
