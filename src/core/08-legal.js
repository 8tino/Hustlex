// ═══════════════════════════════════════════════════════
// LEGAL · Impressum · Datenschutz · AGB + Einwilligung (Consent-Gate)
//   Die Texte hier sind PLATZHALTER. Ersetze sie durch die aus einem
//   Generator (z. B. datenschutz-generator.de) — dann ist die App
//   rechtlich einsatzbereit. Einwilligung wird versioniert gespeichert.
// ═══════════════════════════════════════════════════════

// ⚠️ Beim Ändern der Texte CONSENT_VERSION erhöhen → Nutzer müssen neu zustimmen.
const CONSENT_VERSION = 1;

// Kontakt/Anbieter — TODO: durch echte Daten ersetzen.
const LEGAL_CONTACT = { name: 'DEIN NAME', email: 'kontakt@deine-domain.de', address: 'Straße Nr, PLZ Ort, Deutschland' };

const LEGAL = {
  impressum:
    'Angaben gemäß § 5 DDG\n\n' + LEGAL_CONTACT.name + '\n' + LEGAL_CONTACT.address + '\n\n' +
    'Kontakt\nE-Mail: ' + LEGAL_CONTACT.email + '\n\n' +
    '⚠️ PLATZHALTER — bitte durch deine echten Anbieterangaben ersetzen (Name, Anschrift, Kontakt). ' +
    'Bei einem Gewerbe zusätzlich USt-IdNr. bzw. Kleinunternehmer-Hinweis.',
  datenschutz:
    'Datenschutzerklärung\n\n⚠️ PLATZHALTER — ersetze diesen Text durch die generierte Datenschutzerklärung ' +
    '(z. B. datenschutz-generator.de). Dabei diese Dienste angeben:\n\n' +
    '• Hosting: Cloudflare\n' +
    '• Konto & verschlüsselte Datenspeicherung: Supabase (EU, eu-central-1) — Auftragsverarbeitung\n' +
    '• KI-Funktionen (optional): Anthropic (USA) — nur wenn KI genutzt wird, Übermittlung über Standardvertragsklauseln\n\n' +
    'Hinweis Verschlüsselung: Deine Inhalte sind Ende-zu-Ende verschlüsselt (Zero-Knowledge). Ohne dein Passwort ' +
    'sind sie nicht wiederherstellbar — auch nicht durch den Anbieter.\n\n' +
    'Betroffenenrechte: Auskunft, Löschung (in der App: Einstellungen → Konto & Daten löschen), Widerspruch. ' +
    'Kontakt: ' + LEGAL_CONTACT.email,
  agb:
    'Nutzungsbedingungen\n\n⚠️ PLATZHALTER — ersetze/ergänze mit einem Template. Kernpunkte für HustleX:\n\n' +
    '1. HustleX ist ein Selbstoptimierungs-Tool. Es ersetzt keine ärztliche, ernährungswissenschaftliche, ' +
    'psychologische, rechtliche oder finanzielle Beratung. Nutzung auf eigene Verantwortung.\n\n' +
    '2. Konto & Verschlüsselung: Der Zugang ist passwortgeschützt und Ende-zu-Ende verschlüsselt. ' +
    'Bei Verlust des Passworts sind die Daten unwiederbringlich verloren — es gibt kein Zurücksetzen.\n\n' +
    '3. Mindestalter: 16 Jahre (bzw. mit Einwilligung der Erziehungsberechtigten).\n\n' +
    '4. KI-Funktionen sind optional. Bei „eigener Schlüssel" (BYOK) gelten zusätzlich die Bedingungen des KI-Anbieters.\n\n' +
    '5. Keine missbräuchliche Nutzung. Kündigung jederzeit durch Löschen des Kontos.',
};

// Editable override so du die Texte auch ohne Code-Änderung einsetzen kannst
// (Einstellungen → Rechtliches bearbeiten). Fällt auf die Defaults oben zurück.
function getLegal() { const o = ls('los_legal') || {}; return { impressum: o.impressum || LEGAL.impressum, datenschutz: o.datenschutz || LEGAL.datenschutz, agb: o.agb || LEGAL.agb }; }

// ─── Consent ──────────────────────────────────────────
function getConsent() { return ls('los_consent') || null; }
function consentOk() { const c = getConsent(); return !!(c && c.v >= CONSENT_VERSION && c.accepted); }
function setConsent() { ls('los_consent', { v: CONSENT_VERSION, accepted: true, at: new Date().toISOString() }); }

// ─── Rechtliches-Overlay ──────────────────────────────
function openLegal(section) {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const L = getLegal();
  const inner = el('overlay_inner');
  inner.innerHTML = '';
  inner.appendChild(overlayBackBtn());
  inner.insertAdjacentHTML('beforeend',
    '<div class="label" style="margin-bottom:4px;">' + (EN ? 'LEGAL' : 'RECHTLICHES') + '</div>' +
    '<div class="h2" style="margin-bottom:14px;">' + (EN ? 'Imprint · Privacy · Terms' : 'Impressum · Datenschutz · AGB') + '</div>');

  const tabs = [
    { k: 'impressum', l: EN ? 'Imprint' : 'Impressum', t: L.impressum },
    { k: 'datenschutz', l: EN ? 'Privacy' : 'Datenschutz', t: L.datenschutz },
    { k: 'agb', l: EN ? 'Terms' : 'AGB', t: L.agb },
  ];
  let active = section || 'impressum';
  const bar = div(''); bar.style.cssText = 'display:flex;gap:6px;margin-bottom:12px;';
  const body = div('glass notranslate'); body.style.cssText = 'white-space:pre-line;font-size:13px;color:var(--t-2);line-height:1.7;';
  const paint = () => { const tb = tabs.find(x => x.k === active); body.textContent = tb.t; bar.querySelectorAll('.itab').forEach(b => b.classList.toggle('on', b.dataset.k === active)); };
  tabs.forEach(tb => { const b = h('button', { textContent: tb.l }); b.className = 'itab tap'; b.dataset.k = tb.k; b.onclick = () => { active = tb.k; paint(); }; bar.appendChild(b); });
  inner.appendChild(bar); inner.appendChild(body); paint();
  openOverlay();
}
