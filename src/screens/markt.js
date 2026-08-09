// ═══════════════════════════════════════════════════════
// MARKT · Kapital-Radar — Morgen-Briefing, Indizes, Krypto,
//         Geldfluss/Sektoren, Insider, Analysten, Stimmen der
//         Entscheider, News, Watchlist (optional live via Finnhub)
//
// Die Inhalte unter MARKT_DATA sind ein recherchierter Schnappschuss
// (Stand siehe .asOf). Zum Aktualisieren bittet der Nutzer Claude um ein
// neues Briefing — Claude recherchiert frisch im Web und ersetzt MARKT_DATA.
// localStorage-Override (los_markt) erlaubt spätere Live-Updates ohne Rebuild.
// ═══════════════════════════════════════════════════════

const MARKT_DATA = {
  asOf: '18.06.2026',
  updated: 'Do, 18. Juni 2026',

  briefing: {
    headline: 'Erholung nach Fed-Schock — Geld rotiert in die Realwirtschaft',
    summary: 'Der Markt hat sich heute klar erholt: Der Iran-Friedensdeal nimmt Druck vom Ölpreis und brachte Risikofreude zurück, nachdem die Fed gestern mit einem überraschenden Zins­erhöhungs-Signal einen Ausverkauf ausgelöst hatte. Unter der Oberfläche läuft die eigentliche Geschichte 2026 weiter: Kapital fließt aus dem reinen KI-/Tech-Trade heraus in Energie, Industrie und defensive Konsumwerte. Insider kaufen klein bei Substanzwerten, während Großaktionäre über Platzierungen verkaufen.',
    points: [
      'US-Aktien erholt: S&P +1,15 %, Nasdaq +1,5 %, Dow +0,8 % — Small Caps (Russell 2000 −0,72 %) bleiben zurück.',
      'Fed (Warsh) hält bei 3,5–3,75 %, signalisiert aber als nächsten Schritt eher eine ANHEBUNG (Median 3,8 % zum Jahresende).',
      'Sektor-Rotation: Energie (+22 % YTD) und Defensive/Konsum (+13 %) führen, Tech verliert relative Führung.',
      'US-Iran-Interimsdeal unterzeichnet → Öl fällt (WTI 75,83 $), Sanktionen auf iranisches Öl fallen weg.',
      'Krypto schwach trotz Risk-on: BTC ~63.800 $ (−1,9 %), ETH ~1.733 $ (−1,1 %).',
      'Dimon warnt vor „zu viel Überschwang" & Inflation Richtung 4 %; NVIDIA fährt den lautesten Upgrade-Zyklus (Blackwell).',
    ],
  },

  // dir: 1 = grün/hoch, -1 = rot/runter, 0 = neutral
  indices: [
    { n: 'S&P 500',     chg: '+1,15 %', dir: 1 },
    { n: 'Nasdaq',      chg: '+1,50 %', dir: 1 },
    { n: 'Dow Jones',   chg: '+0,80 %', dir: 1 },
    { n: 'Russell 2000',chg: '−0,72 %', dir: -1 },
  ],
  indicesNote: 'Treiber: Iran-Friedensdeal + Verdauung der Fed-Entscheidung. Tech führt die Erholung an.',

  crypto: [
    { n: 'Bitcoin',  sym: 'BTC', px: '63.808 $', chg: '−1,9 %', dir: -1 },
    { n: 'Ethereum', sym: 'ETH', px: '1.733 $',  chg: '−1,1 %', dir: -1 },
  ],
  cryptoNote: 'Fällt trotz Iran-Deal — Krypto folgt aktuell nicht dem Aktien-Risk-on.',

  sectors: [
    { n: 'Energie',            ytd: '+22 %',   dir: 1,  flow: 'REIN' },
    { n: 'Konsum defensiv',    ytd: '+13,3 %', dir: 1,  flow: 'REIN' },
    { n: 'Industrie',          ytd: 'stark',   dir: 1,  flow: 'REIN' },
    { n: 'Materialien',        ytd: 'stark',   dir: 1,  flow: 'REIN' },
    { n: 'Technologie / KI',   ytd: 'hält',    dir: 0,  flow: 'RAUS (relativ)' },
  ],
  sectorsNote: 'Nach 2 Jahren KI-Dominanz fließt Kapital in die „Realwirtschaft". Profiteure: Caterpillar, Walmart, Exxon.',

  ideas: [
    { n: 'Energie', txt: 'Stärkstes Momentum 2026 (+22 % YTD). Aber: Iran-Deal & fallendes Öl bremsen kurzfristig.', risk: 'Ölpreis-Risiko hoch' },
    { n: 'Defensive Konsumwerte', txt: 'Walmart, Costco — profitieren von preisbewussten Konsumenten. Ruhiger Aufwärtstrend.', risk: 'Geringeres Wachstum' },
    { n: 'KI-Infrastruktur', txt: 'NVIDIA & Co.: Blackwell-Hochlauf, Analysten heben Ziele. Strukturelles Capex-Thema.', risk: 'Bewertung / Volatilität' },
    { n: 'Healthcare als Gegengewicht', txt: 'Berater empfehlen Tech + defensive Healthcare für Balance bis Jahresende.', risk: 'Defensiv, weniger Upside' },
  ],

  insiders: [
    { action: 'BUY',  who: 'Robert Spence',      role: 'Director',       co: 'Comstock (LODE)',     qty: '24.410',  px: '$3,97',   val: '~97 Tsd. $',  date: '03.06' },
    { action: 'BUY',  who: 'Steven Pei',          role: 'Director',       co: 'Comstock (LODE)',     qty: '—',       px: '—',       val: '~1,45 Mio. $', date: 'Anf. Juni' },
    { action: 'BUY',  who: 'Bradley C. Allen Jr.', role: 'Director',       co: 'Stewart Info (STC)',  qty: '1.000',   px: '$63,80',  val: '~64 Tsd. $',  date: '01.06' },
    { action: 'SELL', who: 'Sumedh Thakar',       role: 'CEO',            co: 'Qualys (QLYS)',       qty: '13.200',  px: '~$114',   val: '~1,5 Mio. $', date: '01.06' },
    { action: 'SELL', who: 'American Securities',  role: 'Großaktionär',   co: 'SOLV Energy',         qty: '7,7 Mio.',px: '$36,00',  val: '~277 Mio. $', date: '01.06' },
  ],
  insidersNote: 'Käufe = kleine Substanzwerte (Director-Käufe). Verkäufe = CEO-Planverkauf + große Platzierung (Follow-on).',

  analysts: [
    { type: 'up',   name: 'NVIDIA',        txt: 'Lautester Upgrade-Zyklus des Monats — mehrere Banken heben Kursziele nach Blackwell-Hochlauf.' },
    { type: 'up',   name: 'Micron',        txt: 'Analyst sieht ~44 % Aufwärtspotenzial.' },
    { type: 'up',   name: 'Triple Flag',   txt: 'Canaccord: Hochstufung auf „Buy", Ziel C$52 (Edelmetalle).' },
    { type: 'up',   name: 'Stevanato',     txt: 'TD Cowen startet Coverage mit „Buy", Ziel $25.' },
    { type: 'down', name: 'Lululemon',     txt: 'Kursziel auf $130 gesenkt (von $185), „Neutral".' },
    { type: 'down', name: 'Intuit',        txt: 'Abstufung durch Analysten.' },
    { type: 'down', name: 'Progressive',   txt: 'Kursziel gesenkt.' },
  ],

  voices: [
    { who: 'Jamie Dimon',  role: 'CEO · JPMorgan Chase', quote: 'Es gibt ein bisschen zu viel Überschwang in den Märkten.', take: 'Sieht Inflation als größtes Risiko — könnte „leicht 4 %" erreichen → höhere Anleiherenditen, Druck auf Aktienbewertungen. Warnt vor Geopolitik (Ukraine, China).' },
    { who: 'Kevin Warsh',  role: 'Fed-Chef',             quote: 'Wirtschaft wächst solide trotz erhöhter Unsicherheit.', take: 'Erste Sitzung als Chef: Zinsen gehalten (3,5–3,75 %), aber Signal Richtung ANHEBUNG. Median-Prognose: 3,8 % zum Jahresende.' },
    { who: 'Jensen Huang', role: 'CEO · NVIDIA',          quote: 'Der Übergang zu „AI-Fabriken" braucht Billionen an Capex.', take: 'Sieht den aktuellen Investitionszyklus nicht als Blase, sondern als Fundament einer neuen Wirtschaftsordnung.' },
    { who: 'Brian Moynihan', role: 'CEO · Bank of America', quote: 'Wachstum trotz Risiken in 2026.', take: 'Erwartet weiteres Wirtschaftswachstum trotz der bekannten Risiken.' },
  ],

  news: [
    { title: 'US-Iran-Interimsdeal unterzeichnet', src: 'RFE/RL', dir: 1, impact: 'Öl fällt (WTI −1,25 % auf 75,83 $, Brent 78,41 $); Sanktionen auf iranisches Öl fallen weg, Schifffahrtsroute öffnet.' },
    { title: 'Fed hält Zinsen, signalisiert Hike', src: 'CNBC / NBC', dir: -1, impact: 'Erste Warsh-Sitzung: 3,5–3,75 % gehalten, nächster Schritt eher Anhebung. Gestern Sell-off, heute Erholung.' },
    { title: 'Kapital rotiert in die Realwirtschaft', src: 'Morningstar', dir: 1, impact: 'Energie/Industrie/Defensive führen statt KI-Tech. Caterpillar, Walmart, Exxon profitieren.' },
    { title: 'NVIDIA: Banken heben Kursziele', src: 'Benzinga', dir: 1, impact: 'Blackwell-Auslieferungen für H2 angehoben → breiter Upgrade-Zyklus bei KI-Infrastruktur.' },
    { title: 'Dimon warnt vor Überschwang', src: 'TheStreet', dir: -1, impact: 'Inflation Richtung 4 % als Hauptsorge; Markt unterschätze Bewertungs- und Geopolitik-Risiken.' },
  ],

  sources: [
    { t: 'TheStreet — Markt heute (18.06.2026)', u: 'https://www.thestreet.com/stock-market-today/stock-market-today-dow-jones-sp-500-nasdaq-updates-june-18-2026' },
    { t: 'Yahoo Finance — Krypto (18.06.2026)', u: 'https://finance.yahoo.com/personal-finance/investing/article/bitcoin-and-ethereum-prices-today-thursday-june-18-2026-prices-sliding-despite-iran-peace-deal-115022443.html' },
    { t: 'NBC News — Fed unter Warsh', u: 'https://www.nbcnews.com/business/economy/inflation-kevin-warsh-fed-fomc-meeting-rcna350411' },
    { t: 'CNBC — Fed-Meeting Live (17.06.2026)', u: 'https://www.cnbc.com/2026/06/17/fed-meeting-today-live-updates.html' },
    { t: 'Morningstar — Sektor-Rotation 2026', u: 'https://www.morningstar.com/stocks/6-stocks-driving-2026-stock-market-rotation' },
    { t: 'Investing.com — Insider-Käufe/Verkäufe', u: 'https://m.investing.com/news/stock-market-news/top-insider-buys-and-sells-for-wednesday-june-3-93CH-4726769' },
    { t: 'StockTitan — Qualys Form 4', u: 'https://www.stocktitan.net/sec-filings/QLYS/form-4-qualys-inc-insider-trading-activity-360a32fcc82d.html' },
    { t: 'HeyGoTrade — Analysten-Upgrades Juni 2026', u: 'https://www.heygotrade.com/en/blog/wall-street-analyst-upgrades-june-2026/' },
    { t: 'TheStreet — Dimon Markt-Botschaft 2026', u: 'https://www.thestreet.com/investing/stocks/jpmorgan-jamie-dimon-stock-market-message-2026' },
    { t: 'RFE/RL — Iran-Deal & Öl', u: 'https://www.rferl.org/a/iran-war-us-hormuz-oil-blockade-gulf-israel/33640284.html' },
  ],
};

// localStorage-Override hat Vorrang (für spätere Live-Updates ohne Rebuild)
function getMarkt() {
  const o = ls('los_markt');
  return o && o.briefing ? o : MARKT_DATA;
}

// dir → Farbe
function mFlowColor(dir) { return dir > 0 ? 'var(--green)' : dir < 0 ? 'var(--red)' : 'var(--t-2)'; }
function mArrow(dir)     { return dir > 0 ? '▲' : dir < 0 ? '▼' : '◆'; }

function renderMarkt(s) {
  const D = getMarkt();
  s.className = 'screen on stagger';

  // ── Header ─────────────────────────────────────────────
  const head = div('');
  head.innerHTML = screenHead('KAPITAL · STAND ' + D.asOf, 'Markt-', 'Radar') +
    '<div style="font-size:11px;color:var(--t-3);margin-top:4px;">Letztes Briefing: ' + D.updated + ' · keine Anlageberatung</div>';
  s.appendChild(head);

  // ── Morgen-Briefing (Hero) ─────────────────────────────
  const b = D.briefing;
  const bc = div('glass-accent', '');
  let bHtml = '<div class="label gold" style="margin-bottom:6px;">◈ MORGEN-BRIEFING</div>' +
    '<div class="h3" style="margin-bottom:8px;line-height:1.35;">' + b.headline + '</div>' +
    '<div class="serif" style="font-size:13px;color:var(--t-2);line-height:1.7;margin-bottom:12px;">' + b.summary + '</div>' +
    '<div class="label" style="margin-bottom:8px;">KERNPUNKTE</div>';
  b.points.forEach((p, i) => {
    bHtml += '<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '') + '">' +
      '<span class="dot dot-sm" style="margin-top:6px;background:var(--gold);flex:none;"></span>' +
      '<div style="font-size:13px;color:var(--t-2);line-height:1.55;">' + p + '</div></div>';
  });
  bc.innerHTML = bHtml;
  s.appendChild(bc);

  // ── Markt-Überblick (Indizes) ──────────────────────────
  const ic = div('glass', '<div class="label" style="margin-bottom:10px;">📈 MARKT-ÜBERBLICK</div>');
  const ig = div('');
  ig.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:7px;';
  D.indices.forEach(x => {
    const c = mFlowColor(x.dir);
    const t = div('glass', '');
    t.style.cssText = 'padding:11px 12px;border-color:' + c + '33;';
    t.innerHTML = '<div style="font-size:12px;color:var(--t-2);margin-bottom:3px;">' + x.n + '</div>' +
      '<div class="mono" style="font-size:17px;font-weight:600;color:' + c + ';">' + mArrow(x.dir) + ' ' + x.chg + '</div>';
    ig.appendChild(t);
  });
  ic.appendChild(ig);
  ic.appendChild(div('', '<div style="font-size:11px;color:var(--t-3);margin-top:10px;line-height:1.5;">' + D.indicesNote + '</div>'));
  s.appendChild(ic);

  // ── Krypto ─────────────────────────────────────────────
  const cc = div('glass', '<div class="label" style="margin-bottom:10px;">◎ KRYPTO</div>');
  D.crypto.forEach((x, i) => {
    const col = mFlowColor(x.dir);
    const r = div('', '');
    r.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:7px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<div><span style="font-size:13px;color:var(--t-1);">' + x.n + '</span> <span class="label" style="font-size:10px;">' + x.sym + '</span></div>' +
      '<div style="text-align:right;"><span class="mono" style="font-size:13px;color:var(--t-1);">' + x.px + '</span> ' +
      '<span class="mono" style="font-size:13px;color:' + col + ';margin-left:6px;">' + mArrow(x.dir) + ' ' + x.chg + '</span></div>';
    cc.appendChild(r);
  });
  cc.appendChild(div('', '<div style="font-size:11px;color:var(--t-3);margin-top:8px;line-height:1.5;">' + D.cryptoNote + '</div>'));
  s.appendChild(cc);

  // ── Geldfluss / Sektor-Rotation ────────────────────────
  const sc = div('glass', '<div class="label" style="margin-bottom:12px;">💧 GELDFLUSS · SEKTOR-ROTATION</div>');
  D.sectors.forEach((x, i) => {
    const col = mFlowColor(x.dir);
    const r = div('', '');
    r.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<span class="mono" style="color:' + col + ';font-size:13px;width:14px;">' + mArrow(x.dir) + '</span>' +
      '<div style="flex:1;"><div style="font-size:13px;color:var(--t-1);">' + x.n + '</div>' +
      '<div style="font-size:11px;color:var(--t-3);">YTD: ' + x.ytd + '</div></div>' +
      '<span class="pill" style="font-size:11px;color:' + col + ';border-color:' + col + '44;">' + x.flow + '</span>';
    sc.appendChild(r);
  });
  sc.appendChild(div('', '<div style="font-size:11px;color:var(--t-3);margin-top:10px;line-height:1.5;">' + D.sectorsNote + '</div>'));
  s.appendChild(sc);

  // ── Wo könnte das Geld hinfließen (Ideen) ──────────────
  const ideac = div('glass-hi', '<div class="label gold" style="margin-bottom:4px;">◇ WO KÖNNTE DAS GELD HINFLIESSEN?</div>' +
    '<div style="font-size:11px;color:var(--t-3);margin-bottom:12px;">Beobachtungen, keine Empfehlung. Eigene Recherche nötig.</div>');
  D.ideas.forEach((x, i) => {
    const r = div('', '');
    r.style.cssText = 'padding:10px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<div style="font-size:13px;font-weight:600;color:var(--t-1);margin-bottom:3px;">' + x.n + '</div>' +
      '<div style="font-size:12px;color:var(--t-2);line-height:1.55;">' + x.txt + '</div>' +
      '<div style="font-size:11px;color:var(--red);margin-top:4px;">⚠ Risiko: ' + x.risk + '</div>';
    ideac.appendChild(r);
  });
  s.appendChild(ideac);

  // ── Insider-Transaktionen ──────────────────────────────
  const insc = div('glass', '<div class="label" style="margin-bottom:12px;">🕵 INSIDER-TRANSAKTIONEN <span style="color:var(--t-3);font-weight:400;">(öffentlich gemeldet)</span></div>');
  D.insiders.forEach((x, i) => {
    const buy = x.action === 'BUY';
    const col = buy ? 'var(--green)' : 'var(--red)';
    const r = div('', '');
    r.style.cssText = 'display:flex;gap:10px;padding:9px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<span class="pill" style="font-size:11px;height:fit-content;color:' + col + ';border-color:' + col + '44;flex:none;">' + (buy ? '▲ KAUF' : '▼ VERKAUF') + '</span>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:13px;color:var(--t-1);">' + x.who + ' <span style="color:var(--t-3);font-size:11px;">· ' + x.role + '</span></div>' +
        '<div style="font-size:12px;color:var(--t-2);">' + x.co + '</div>' +
        '<div style="font-size:11px;color:var(--t-3);margin-top:2px;">' + x.qty + ' Stk · ' + x.px + ' · <span style="color:' + col + ';">' + x.val + '</span> · ' + x.date + '</div>' +
      '</div>';
    insc.appendChild(r);
  });
  insc.appendChild(div('', '<div style="font-size:11px;color:var(--t-3);margin-top:10px;line-height:1.5;">' + D.insidersNote + '</div>'));
  s.appendChild(insc);

  // ── Analysten-Aktionen ─────────────────────────────────
  const ac = div('glass', '<div class="label" style="margin-bottom:12px;">🎯 ANALYSTEN-AKTIONEN</div>');
  D.analysts.forEach((x, i) => {
    const up = x.type === 'up';
    const col = up ? 'var(--green)' : 'var(--red)';
    const r = div('', '');
    r.style.cssText = 'display:flex;gap:9px;padding:8px 0;align-items:flex-start;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<span style="color:' + col + ';font-size:13px;flex:none;">' + (up ? '↑' : '↓') + '</span>' +
      '<div style="flex:1;"><span style="font-size:13px;font-weight:600;color:var(--t-1);">' + x.name + '</span>' +
      '<div style="font-size:12px;color:var(--t-2);line-height:1.5;">' + x.txt + '</div></div>';
    ac.appendChild(r);
  });
  s.appendChild(ac);

  // ── Stimmen der Entscheider ────────────────────────────
  const vc = div('glass', '<div class="label" style="margin-bottom:12px;">🗣 STIMMEN DER ENTSCHEIDER</div>');
  D.voices.forEach((x, i) => {
    const r = div('', '');
    r.style.cssText = 'padding:11px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<div class="serif italic" style="font-size:13px;color:var(--t-1);line-height:1.6;">„' + x.quote + '"</div>' +
      '<div class="label gold" style="margin-top:6px;">' + x.who + ' · <span style="color:var(--t-3);">' + x.role + '</span></div>' +
      '<div style="font-size:12px;color:var(--t-2);line-height:1.55;margin-top:5px;">' + x.take + '</div>';
    vc.appendChild(r);
  });
  s.appendChild(vc);

  // ── News-Feed ──────────────────────────────────────────
  const nc = div('glass', '<div class="label" style="margin-bottom:12px;">📰 NEWS-FEED</div>');
  D.news.forEach((x, i) => {
    const col = mFlowColor(x.dir);
    const r = div('', '');
    r.style.cssText = 'display:flex;gap:9px;padding:9px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    r.innerHTML = '<span style="color:' + col + ';font-size:12px;margin-top:2px;flex:none;">' + mArrow(x.dir) + '</span>' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--t-1);">' + x.title + ' <span class="label" style="font-size:10px;color:var(--t-3);">· ' + x.src + '</span></div>' +
      '<div style="font-size:12px;color:var(--t-2);line-height:1.55;margin-top:2px;">' + x.impact + '</div></div>';
    nc.appendChild(r);
  });
  s.appendChild(nc);

  // ── Watchlist (mit optionalem Finnhub-Live) ────────────
  s.appendChild(renderWatchlist());

  // ── Quellen (einklappbar) ──────────────────────────────
  const srcWrap = div('');
  const srcBtn = h('button', { textContent: '◈  QUELLEN (' + D.sources.length + ')' });
  srcBtn.className = 'btn btn-glass tap';
  srcBtn.style.cssText = 'font-size:11px;letter-spacing:1.5px;';
  const srcBox = div('glass', '');
  srcBox.style.cssText = 'margin-top:8px;display:none;';
  D.sources.forEach((x, i) => {
    const a = h('a', { href: x.u, target: '_blank', textContent: x.t });
    a.style.cssText = 'display:block;font-size:12px;color:var(--blue);text-decoration:none;padding:6px 0;line-height:1.4;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
    srcBox.appendChild(a);
  });
  srcBtn.onclick = () => { srcBox.style.display = srcBox.style.display === 'none' ? 'block' : 'none'; };
  srcWrap.appendChild(srcBtn); srcWrap.appendChild(srcBox);
  s.appendChild(srcWrap);

  // ── Disclaimer ─────────────────────────────────────────
  s.appendChild(div('', '<div style="font-size:11px;color:var(--t-4);text-align:center;line-height:1.6;padding:8px 4px;">Keine Anlageberatung. Daten sind ein recherchierter Schnappschuss (Stand ' + D.asOf + ') und können fehlerhaft oder veraltet sein. Eigene Prüfung erforderlich.</div>'));
}

// ─── WATCHLIST ──────────────────────────────────────────
// Eigene Ticker, optional live über Finnhub (kostenloser Key in Settings).
function getWatch()  { return ls('los_watch') || ['NVDA', 'XOM', 'WMT']; }
function setWatch(a) { ls('los_watch', a); }
function getFinnhubKey() { return ls('los_finnhub') || ''; }

function renderWatchlist() {
  const card = div('glass-hi', '<div class="label gold" style="margin-bottom:10px;">★ WATCHLIST</div>');

  const list = div('');
  list.id = 'watch_list';
  const watch = getWatch();
  if (!watch.length) {
    list.innerHTML = '<div style="font-size:12px;color:var(--t-3);padding:4px 0;">Noch keine Ticker. Unten hinzufügen.</div>';
  } else {
    watch.forEach((sym, i) => {
      const r = div('');
      r.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;' + (i > 0 ? 'border-top:1px solid var(--edge);' : '');
      r.innerHTML = '<span style="font-size:13px;color:var(--t-1);font-weight:600;">' + sym + '</span>' +
        '<span class="mono" id="wq_' + sym + '" style="font-size:13px;color:var(--t-3);">—</span>';
      const rm = h('button', { textContent: '✕' });
      rm.className = 'tap';
      rm.style.cssText = 'color:var(--t-4);font-size:13px;padding:0 0 0 12px;';
      rm.onclick = () => { setWatch(getWatch().filter(x => x !== sym)); renderScreen('finanzen'); };
      r.appendChild(rm);
      list.appendChild(r);
    });
  }
  card.appendChild(list);

  // Quick-Add Chips
  const chips = div('');
  chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;';
  ['NVDA', 'AAPL', 'MSFT', 'XOM', 'WMT', 'CAT', 'SPY', 'QQQ'].forEach(sym => {
    if (getWatch().includes(sym)) return;
    const c = h('button', { textContent: '+ ' + sym });
    c.className = 'pill tap';
    c.style.cssText = 'font-size:11px;';
    c.onclick = () => { const w = getWatch(); if (!w.includes(sym)) { w.push(sym); setWatch(w); } renderScreen('finanzen'); };
    chips.appendChild(c);
  });
  card.appendChild(chips);

  // Eigenen Ticker eingeben
  const addRow = div('');
  addRow.style.cssText = 'display:flex;gap:8px;margin-top:10px;';
  const inp = h('input', { type: 'text', placeholder: 'Ticker (z. B. TSLA)' }, '');
  inp.style.cssText = 'flex:1;padding:9px 12px;border-radius:var(--r-sm);border:1px solid var(--edge);background:var(--glass-1);font-size:13px;text-transform:uppercase;';
  const addBtn = h('button', { textContent: '+' });
  addBtn.className = 'btn btn-glass tap';
  addBtn.style.cssText = 'flex:none;width:44px;font-size:16px;';
  const doAdd = () => {
    const sym = (inp.value || '').trim().toUpperCase();
    if (!sym) return;
    const w = getWatch(); if (!w.includes(sym)) w.push(sym); setWatch(w);
    renderScreen('finanzen');
  };
  addBtn.onclick = doAdd;
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
  addRow.appendChild(inp); addRow.appendChild(addBtn);
  card.appendChild(addRow);

  // Live-Update via Finnhub
  const liveBtn = h('button', { textContent: '⟳  LIVE AKTUALISIEREN' });
  liveBtn.className = 'btn btn-glass tap';
  liveBtn.style.cssText = 'margin-top:10px;font-size:11px;letter-spacing:1.5px;';
  liveBtn.onclick = () => refreshWatchQuotes(liveBtn);
  card.appendChild(liveBtn);

  // Finnhub-Key Einstellung (einklappbar)
  const keyBtn = h('button', { textContent: getFinnhubKey() ? '⚙ API-Key ändern' : '⚙ Finnhub-Key eintragen (für Live)' });
  keyBtn.className = 'tap';
  keyBtn.style.cssText = 'display:block;width:100%;text-align:center;font-size:11px;color:var(--t-3);margin-top:8px;';
  const keyBox = div('');
  keyBox.style.cssText = 'display:none;margin-top:8px;';
  const keyInp = h('input', { type: 'text', placeholder: 'Finnhub API-Key', value: getFinnhubKey() }, '');
  keyInp.style.cssText = 'width:100%;padding:9px 12px;border-radius:var(--r-sm);border:1px solid var(--edge);background:var(--glass-1);font-size:12px;';
  const keySave = h('button', { textContent: 'Speichern' });
  keySave.className = 'btn btn-glass tap';
  keySave.style.cssText = 'margin-top:6px;font-size:12px;';
  keySave.onclick = () => { ls('los_finnhub', (keyInp.value || '').trim()); showToast('API-Key gespeichert', '🔑'); };
  const keyHint = div('', '<div style="font-size:11px;color:var(--t-4);margin-top:6px;line-height:1.5;">Kostenlos auf finnhub.io registrieren → Key kopieren. Wird nur lokal auf diesem Gerät gespeichert.</div>');
  keyBox.appendChild(keyInp); keyBox.appendChild(keySave); keyBox.appendChild(keyHint);
  keyBtn.onclick = () => { keyBox.style.display = keyBox.style.display === 'none' ? 'block' : 'none'; };
  card.appendChild(keyBtn); card.appendChild(keyBox);

  return card;
}

async function refreshWatchQuotes(btn) {
  const key = getFinnhubKey();
  if (!key) { showToast('Erst Finnhub-Key eintragen', '🔑'); return; }
  const watch = getWatch();
  if (btn) { btn.textContent = '⟳  LADE…'; btn.style.opacity = '.5'; }
  for (const sym of watch) {
    const cell = el('wq_' + sym);
    try {
      const r = await fetch('https://finnhub.io/api/v1/quote?symbol=' + encodeURIComponent(sym) + '&token=' + encodeURIComponent(key));
      const d = await r.json();
      if (cell && typeof d.c === 'number' && d.c > 0) {
        const dp = typeof d.dp === 'number' ? d.dp : 0;
        const col = dp > 0 ? 'var(--green)' : dp < 0 ? 'var(--red)' : 'var(--t-2)';
        cell.style.color = col;
        cell.textContent = '$' + d.c.toFixed(2) + '  ' + (dp >= 0 ? '+' : '') + dp.toFixed(2) + '%';
      } else if (cell) {
        cell.textContent = 'n/a';
      }
    } catch {
      if (cell) cell.textContent = 'Fehler';
    }
  }
  if (btn) { btn.textContent = '⟳  LIVE AKTUALISIEREN'; btn.style.opacity = '1'; }
  showToast('Watchlist aktualisiert', '📈');
}
