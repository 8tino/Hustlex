// ═══════════════════════════════════════════════════════
// INSPIRATION · Daily start-of-day popup (motivational first
//   sentence of the day) + a library of book insights. Content is
//   curated so it works fully offline; the day's pick is stable
//   (deterministic by date) so re-opening shows the same one.
// ═══════════════════════════════════════════════════════

const QUOTES = [
  'Der erste Schritt entscheidet nicht über das Ziel, aber über den Tag.',
  'Disziplin ist die Brücke zwischen dem, was du willst, und dem, was du bekommst.',
  'Du wirst nicht der Mensch, der du sein willst, an guten Tagen – sondern an den schweren.',
  'Kleine Schritte, jeden Tag. So werden Berge versetzt.',
  'Motivation bringt dich in Bewegung, Gewohnheit hält dich dabei.',
  'Heute ist ein neuer Beweis dafür, wer du wirklich bist.',
  'Wer den Tag gewinnt, gewinnt das Leben – ein Tag nach dem anderen.',
  'Nicht die Zeit fehlt dir, sondern die Entscheidung.',
  'Fang an, bevor du bereit bist. Bereitschaft kommt durchs Tun.',
  'Das Unbequeme heute ist die Freiheit von morgen.',
  'Sei heute 1% besser als gestern. Das reicht.',
  'Deine Zukunft wird von dem gebaut, was du heute tust – nicht morgen.',
  'Konsequenz schlägt Intensität. Zeig einfach auf.',
  'Der Schmerz der Disziplin wiegt Gramm, der Schmerz der Reue wiegt Tonnen.',
  'Wer aufhört, besser zu werden, hört auf, gut zu sein.',
  'Du hast heute alles, was du brauchst, um einen Schritt zu machen.',
  'Große Ziele erschrecken – kleine tägliche Handlungen befreien.',
  'Energie folgt der Aufmerksamkeit. Richte sie auf das Wesentliche.',
  'Der beste Zeitpunkt war gestern. Der zweitbeste ist jetzt.',
  'Mach es schlecht, aber mach es. Perfektion kommt später.',
  'Ruhe ist Teil des Plans, nicht das Aufgeben davon.',
  'Was du regelmäßig tust, entscheidet mehr als was du selten tust.',
  'Du bist das, was du wiederholst. Wiederhole Gutes.',
  'Zwischen Reiz und Reaktion liegt dein Raum der Freiheit – nutze ihn.',
  'Fokus heißt: hundert gute Ideen ablehnen für die eine richtige.',
  'Vergleiche dich mit dem, der du gestern warst.',
  'Der Weg entsteht, während du gehst. Geh los.',
  'Stärke wächst genau dort, wo es unbequem wird.',
  'Wer weiß wofür, erträgt fast jedes Wie.',
  'Heute zählt. Nicht die Woche, nicht das Jahr – heute.',
];

// Insights distilled from well-known books — short takeaways, not verbatim
// text, each attributed so you know where to dig deeper.
const BOOK_INSIGHTS = [
  { insight: 'Verbessere dein System, nicht nur dein Ziel – du fällst auf das Niveau deiner Gewohnheiten.', book: 'Atomic Habits', author: 'James Clear' },
  { insight: 'Beginne mit dem Warum. Menschen folgen nicht dem Was, sondern der Überzeugung dahinter.', book: 'Start With Why', author: 'Simon Sinek' },
  { insight: 'Tiefe, ungestörte Arbeit ist die Superkraft des 21. Jahrhunderts.', book: 'Deep Work', author: 'Cal Newport' },
  { insight: 'Iss den Frosch zuerst: erledige die wichtigste, unangenehmste Aufgabe am Morgen.', book: 'Eat That Frog', author: 'Brian Tracy' },
  { insight: 'Das Wichtigste ist, das Wichtigste zum Wichtigsten zu machen.', book: 'Die 7 Wege zur Effektivität', author: 'Stephen Covey' },
  { insight: 'Suche die eine Sache, die alles andere leichter oder überflüssig macht.', book: 'The One Thing', author: 'Gary Keller' },
  { insight: 'Wer ein Warum hat, das ihn trägt, verträgt fast jedes Wie.', book: '…trotzdem Ja zum Leben sagen', author: 'Viktor Frankl' },
  { insight: 'Amor fati – liebe dein Schicksal. Das Hindernis auf dem Weg wird zum Weg.', book: 'Der Weg ist das Ziel (Stoa)', author: 'Ryan Holiday' },
  { insight: 'Kleine Gewinne summieren sich zu Selbstvertrauen. Mach dein Bett.', book: 'Make Your Bed', author: 'William McRaven' },
  { insight: 'Denke langsam, wenn es zählt – dein schnelles Bauchgefühl täuscht dich oft.', book: 'Schnelles Denken, langsames Denken', author: 'Daniel Kahneman' },
  { insight: 'Reichtum ist das, was du nicht siehst: nicht ausgegebenes Geld ist Freiheit.', book: 'Über die Psychologie des Geldes', author: 'Morgan Housel' },
  { insight: 'Setze Reize, dann erhole dich – Wachstum passiert in der Erholung.', book: 'Peak Performance', author: 'Brad Stulberg' },
  { insight: 'Halte den Kreis der Kontrolle klein: ändere, was bei dir liegt, lass den Rest los.', book: 'Handbüchlein der Moral', author: 'Epiktet' },
  { insight: 'Diszipliniere den Geist, indem du täglich das Schwere freiwillig wählst.', book: 'Can’t Hurt Me', author: 'David Goggins' },
  { insight: 'Klarheit entsteht durch Handlung, nicht durch Nachdenken allein.', book: 'The War of Art', author: 'Steven Pressfield' },
  { insight: 'Mut ist nicht Angstlosigkeit, sondern Handeln trotz der Angst.', book: 'Feel the Fear and Do It Anyway', author: 'Susan Jeffers' },
  { insight: 'Der Mensch mit fixem Selbstbild meidet Herausforderung – der wachsende sucht sie.', book: 'Selbstbild (Mindset)', author: 'Carol Dweck' },
  { insight: 'Grit – Leidenschaft plus Ausdauer über Jahre – schlägt Talent.', book: 'Grit', author: 'Angela Duckworth' },
];

function _dayNumber() { return Math.floor(Date.now() / 86400000); }
function getDailyItem(arr, salt) { return arr[(_dayNumber() + (salt || 0)) % arr.length]; }

// The once-a-day welcome popup. Shows the "first sentence of the day" plus a
// book insight. Marked as seen per day; `force` re-opens it on demand.
function showDailyStart(force) {
  if (!STATE.profile) return;
  const key = 'los_daystart_' + today();
  if (!force && ls(key)) return;
  ls(key, true);

  const q = getDailyItem(QUOTES, 0);
  const bi = getDailyItem(BOOK_INSIGHTS, 3);
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Schön, dass du da bist' : 'Guten Abend';

  const inner = el('overlay_inner');
  inner.innerHTML = '';
  const wrap = div('anim-fade-up');
  wrap.innerHTML =
    '<div style="text-align:center;font-size:34px;margin:4px 0 10px;">☀️</div>' +
    '<div class="label" style="text-align:center;margin-bottom:6px;">' + greet + ', ' + (STATE.profile.name || '') + '</div>' +
    '<div class="label" style="text-align:center;color:' + pColor() + ';margin-bottom:14px;">DER ERSTE SATZ DES TAGES</div>' +
    '<div class="glass-hi" style="padding:22px;text-align:center;">' +
      '<div class="serif" style="font-size:20px;line-height:1.5;color:var(--t-1);">' + q + '</div>' +
    '</div>' +
    '<div class="label" style="margin:16px 0 6px;">📖 GEDANKE AUS EINEM BUCH</div>' +
    '<div class="glass" style="padding:16px;">' +
      '<div style="font-size:14px;line-height:1.55;color:var(--t-1);">' + bi.insight + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:8px;">— ' + bi.book + ', ' + bi.author + '</div>' +
    '</div>';
  inner.appendChild(wrap);

  const go = h('button', { textContent: 'LOS GEHT’S →' });
  go.className = 'btn btn-gold tap';
  go.style.marginTop = '18px';
  go.onclick = closeOverlay;
  inner.appendChild(go);
  openOverlay();
}

// Library view (Wachstum → INSPIRATION): browse all insights, reroll a quote.
let INSP_QUOTE_I = null;
function renderInspiration(p) {
  p.innerHTML = '';
  if (INSP_QUOTE_I === null) INSP_QUOTE_I = (_dayNumber()) % QUOTES.length;

  const qc = div('glass-hi', '');
  qc.style.cssText = 'padding:20px;text-align:center;';
  qc.innerHTML = '<div class="label" style="margin-bottom:10px;">MOTIVATION</div>' +
    '<div class="serif" id="insp_q" style="font-size:18px;line-height:1.5;color:var(--t-1);">' + QUOTES[INSP_QUOTE_I] + '</div>';
  const shuffle = h('button', { textContent: '↻ Neuer Spruch' });
  shuffle.className = 'btn btn-glass tap';
  shuffle.style.marginTop = '14px';
  shuffle.onclick = () => { INSP_QUOTE_I = (INSP_QUOTE_I + 1) % QUOTES.length; el('insp_q').textContent = QUOTES[INSP_QUOTE_I]; haptic('light'); };
  qc.appendChild(shuffle);
  p.appendChild(qc);

  p.appendChild(div('label', '📖 EINSICHTEN AUS BÜCHERN'));
  BOOK_INSIGHTS.forEach(bi => {
    const c = div('glass', '');
    c.style.padding = '15px';
    c.innerHTML = '<div style="font-size:14px;line-height:1.55;color:var(--t-1);">' + bi.insight + '</div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:8px;">— ' + bi.book + ', ' + bi.author + '</div>';
    p.appendChild(c);
  });
}
