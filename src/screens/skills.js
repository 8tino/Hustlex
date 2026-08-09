// ═══════════════════════════════════════════════════════
// SKILL-TREE · Dein mehrjähriger Lernweg. 9 Phasen, je Skill
//   ein Status (Offen→Lernen→Anwenden→Beherrscht), eine Stufen-
//   leiter L1/L2/L3, Kernbausteine + erster Schritt. Verzahnt mit
//   Kursen (Kurs bauen), Zielen und dem Heute-Plan.
//   Stores: los_skill_status = { "p0s0": 0..3, … }
// ═══════════════════════════════════════════════════════

const SKILL_TREE = [
  { n: 0, mode: 'zuerst', title: 'Fundament — Kopf-Betriebssystem', why: 'Gated alles. Macht jedes spätere Modul schneller lernbar und haltbarer.', s: [
    { name: 'Lernen lernen', note: 'Wissen schnell aufnehmen und behalten.', core: ['Active Recall', 'Spaced Repetition', 'Feynman', 'Interleaving'], lvl: ['Recall & Spaced Rep verstehen', 'System aufsetzen, Interleaving nutzen', 'Lernen designen: Transfer & Deliberate Practice'], step: 'Eine Sache nur per Selbst-Abfrage lernen statt Wiederlesen.' },
    { name: 'Gedächtnispalast & Merktechnik', note: 'Große Mengen sicher abspeichern.', core: ['Method of Loci', 'Major-System', 'PAO', 'Chunking'], lvl: ['Loci-Prinzip + 1 Palast bauen', 'Major-System & PAO für Zahlen/Namen', 'Mehrere Paläste, live schnell enkodieren'], step: 'Palast aus deiner Wohnung, 10 Begriffe ablegen, 3× ablaufen.' },
    { name: 'Fokus & Deep Work', note: 'Tiefe, ungestörte Blöcke.', core: ['Ablenkung killen', 'Zeitblöcke', 'Single-Tasking'], lvl: ['Ablenkungen raus, 1 Block schaffen', 'Blockstruktur & Rituale etablieren', '3–4h Deep Work nachhaltig'], step: 'Ein 60-min-Block ohne Handy in Sichtweite.' },
    { name: 'Strategisches Denken', note: 'Erst richtig denken, dann handeln.', core: ['Erste Prinzipien', 'Inversion', 'Second-Order', 'Mental Models'], lvl: ['Erste Prinzipien & Inversion', 'Mental-Model-Toolkit aufbauen', 'Second-Order & Szenarien routiniert'], step: 'Ein Problem rückwärts: Was garantiert das Scheitern?' },
    { name: 'Entscheiden unter Druck', note: 'Schnell und klar reagieren.', core: ['OODA-Loop', 'Tempo > Perfektion', 'Priorisierung'], lvl: ['OODA verstehen', 'Unter Zeitdruck üben', 'Ruhe + Tempo im Ernstfall'], step: 'Eine offene Entscheidung heute in <2 min mit 70%-Info.' },
    { name: 'Metakognition & Reflexion', note: 'Aus dem eigenen Handeln lernen.', core: ['Journaling', 'After-Action-Review', 'Denkfehler-Check'], lvl: ['Tägliche Reflexion', 'AAR-Format nutzen', 'Eigene Muster & Bias steuern'], step: 'Abends 3 Zeilen: gut / nicht gut / ändere ich.' },
  ] },
  { n: 1, mode: 'vor Kampf & Tricks', title: 'Körper-Fundament — Athletik', why: 'Voraussetzung für Kampfsport, Backflip, Apnoe & Beweglichkeit — schützt vor Verletzung.', s: [
    { name: 'Mobilität & Beweglichkeit', note: "Freie Gelenke, Basis für 'biegsam'.", core: ['Hüfte/Schulter', 'Aktive Dehnung', 'CARs'], lvl: ['Tägliche Gelenkroutine', 'Zielbereiche öffnen', 'Volle Endbereich-Kontrolle'], step: '8-min-Gelenk-Routine jeden Morgen.' },
    { name: 'Kraft-Grundlagen', note: 'Solide Basiskraft.', core: ['Squat', 'Hinge', 'Push', 'Pull', 'Carry'], lvl: ['Technik der 5 Muster', 'Progressive Überlastung', 'Kraftstandards erreichen'], step: '3×/Woche Ganzkörper, Technik vor Gewicht.' },
    { name: 'Explosivkraft & Schnelligkeit', note: 'Schneller, härter schlagen.', core: ['Plyometrie', 'Sprint-Mechanik', 'Rate of Force'], lvl: ['Sprung & Landung sauber', 'Plyo-Progression', 'Kraft in Speed umsetzen'], step: '2×/Woche Box Jumps + kurze Sprints.' },
    { name: 'Kondition & Ausdauer', note: 'Gastank fürs Sparring.', core: ['Zone-2', 'Anaerobe Kapazität', 'Intervalle'], lvl: ['Zone-2-Basis aufbauen', 'Intervalle einbauen', 'Sport-spezifische Rounds-Ausdauer'], step: '1× langer Zone-2 + 1× Intervalle pro Woche.' },
    { name: 'Koordination & Balance', note: 'Körperkontrolle als Basis.', core: ['Propriozeption', 'Agility', 'Rhythmus'], lvl: ['Balance-Basics', 'Komplexe Muster', 'Stabil unter Ermüdung/Druck'], step: 'Tägliche 2-min-Balance-Drills, Augen zu.' },
    { name: 'Atemtechnik & CO₂-Toleranz', note: 'Basis fürs Luftanhalten.', core: ['Nasenatmung', 'Box Breathing', 'Zwerchfell'], lvl: ['Nasen- & Zwerchfellatmung', 'Box Breathing & CO₂-Toleranz', 'Lange Ruhe-Holds'], step: 'Box Breathing 4-4-4-4, 5 min täglich.' },
    { name: 'Regeneration, Schlaf & Ernährung', note: 'Damit Training hält.', core: ['Schlafhygiene', 'Protein/Timing', 'Deload'], lvl: ['Schlaf fixieren', 'Ernährung & Timing', 'Load-Management & Deloads'], step: 'Feste Schlafenszeit setzen, 7 Tage halten.' },
  ] },
  { n: 2, mode: 'Reihenfolge', title: 'Kampfsport — dein Kurs', why: "Du trainierst schon MMA — hier wird's zum System: Basis → Striking → Grappling → Integration.", s: [
    { name: 'Kampf-Grundlagen', note: 'Fundament jeder Disziplin.', core: ['Stance & Guard', 'Footwork', 'Distanz/Timing', 'Fallschule'], lvl: ['Stance/Guard/Footwork', 'Distanz & Timing', 'Unbewusst sauber im Sparring'], step: 'Nur Footwork-Shadow, 3×3 min pro Session.' },
    { name: 'Muay Thai / Striking', note: 'Alle acht Waffen.', core: ['Boxhände', 'Kicks', 'Knie & Ellbogen', 'Clinch'], lvl: ['Grundschläge & Kicks', 'Combos & Clinch', 'Timing & Counter im Sparring'], step: 'Jab-Cross-Low-Kick sauber, 100 Reps am Sack.' },
    { name: 'Boxen-Feinheiten', note: 'Hände und Kopf.', core: ['Kopfbewegung', 'Combos', 'Counter', 'Ring-IQ'], lvl: ['Grundschläge & Deckung', 'Kopfbewegung & Combos', 'Counter & Ring-IQ'], step: 'Slip-Drill gegen leichte Schläge, entspannt.' },
    { name: 'Ringen / Wrestling', note: 'Bindeglied Stand↔Boden.', core: ['Takedowns', 'Sprawl', 'Level Change'], lvl: ['Stance & Level Change', 'Takedowns & Sprawl', 'Ketten & Scrambles'], step: 'Penetration-Step + Sprawl je 50 Reps.' },
    { name: 'BJJ / Grappling', note: 'Kontrolle & Abschluss am Boden.', core: ['Positionen', 'Escapes', 'Sweeps', 'Submissions'], lvl: ['Positionen & Escapes', 'Sweeps & Submissions', 'Passing/Retention flüssig'], step: 'Nur Escapes drillen bis Untenliegen keine Panik ist.' },
    { name: 'MMA-Integration', note: 'Bereiche verbinden.', core: ['Übergänge', 'Ground & Pound', 'Cage-Work'], lvl: ['Bereiche einzeln', 'Übergänge verbinden', 'Nahtlos Stand↔Boden im Sparring'], step: 'Ein Übergang: Schlag → Takedown → Kontrolle, langsam.' },
    { name: 'Sparring-Methodik & Prävention', note: 'Klug hart werden.', core: ['Progressive Intensität', 'Ego ablegen', 'Tapping'], lvl: ['Leicht & kontrolliert', 'Intensität steuern', 'Hart & verletzungsarm'], step: 'Nächstes Sparring auf 50% — technisch, nicht siegen.' },
    { name: 'Selbstverteidigung & Awareness', note: 'Real-world statt Ring.', core: ['Situational Awareness', 'Deeskalation', 'Fluchtwege'], lvl: ['Awareness & Deeskalation', 'Distanz & Flucht', 'Realszenarien ruhig lösen'], step: 'In Räumen bewusst Ausgänge & Verhalten scannen.' },
  ] },
  { n: 3, mode: 'nach Körper-Basis', title: 'Körperliche Spezial-Skills', why: 'Baut direkt auf Phase 1 auf — beeindruckend UND nützlich.', s: [
    { name: 'Extremes Luftanhalten / Apnoe', note: 'Static Apnea sicher.', core: ['O₂/CO₂-Tabellen', 'Zwerchfell', 'Blackout-Sicherheit'], lvl: ['Entspannung & CO₂-Tabellen', 'O₂-Tabellen & Technik', 'Lange Statics (betreut)'], step: 'CO₂-Tabelle mit Ruhe-Holds, trocken & beaufsichtigt.' },
    { name: 'Beweglichkeit / Contortion', note: 'Extreme aktive Flexibilität.', core: ['Splits', 'Backbend', 'PNF'], lvl: ['Tägliche Dehnroutine', 'Splits/Backbend-Fortschritt', 'Aktive Endbereich-Kontrolle'], step: 'Täglich Frosch + Hüftbeuger, 2×60 s pro Seite.' },
    { name: 'Backflip & Bodenakrobatik', note: 'Sicher zum Salto.', core: ['Handstand', 'Absprung-Timing', 'Matte/Spotter'], lvl: ['Handstand/Rolle/Absprung', 'Salto mit Hilfe/Matte', 'Frei & sicher'], step: 'Rückwärts-Sprung auf erhöhte Matte, erst mit Hilfe.' },
    { name: 'Handstand & Calisthenics', note: 'Eigengewicht meistern.', core: ['Handstand', 'Muscle-up', 'L-Sit'], lvl: ['Wand-Handstand & Reihen', 'Muscle-up / Freistand', 'Planche/Flag-Fortschritt'], step: 'Wand-Handstand, täglich 5×30 s halten.' },
    { name: 'Klettern & Parkour-Basics', note: 'Körper im Raum.', core: ['Grifftechnik', 'Präzisionssprung', 'Rolle/Landung'], lvl: ['Landen & Abrollen', 'Präzision & Vaults', 'Fluss über Hindernisse'], step: 'Sichere Landung & Abrollen auf weichem Grund.' },
    { name: 'Kältetoleranz & Wim-Hof', note: 'Belegte Stress-Adaptation.', core: ['WH-Atmung', 'Kaltdusche', 'Ruhe im Reiz'], lvl: ['Atmung + Kaltdusche', 'Längere Kälte, Ruhe', 'Eisbad kontrolliert'], step: '30 s kalt am Duschende, ruhig atmen.' },
    { name: 'Kettlebell / Olympisches Heben', note: 'Roher Power-Ausdruck.', core: ['Swing', 'Clean & Jerk', 'Snatch'], lvl: ['Swing & Technik', 'Clean & Jerk', 'Snatch & Komplexe'], step: 'KB-Swing-Technik mit leichtem Gewicht lernen.' },
  ] },
  { n: 4, mode: 'parallel', title: 'Geist & innere Stärke', why: "Mentale + physische Standhaftigkeit. Hier stecken die echten 'Mönchs-Techniken'.", s: [
    { name: 'Meditation', note: 'Basis-Fähigkeit des Geistes.', core: ['Atem-Fokus', 'Vipassana', 'Konsistenz'], lvl: ['10 min Atem täglich', 'Längere Sitzungen / Vipassana', 'Stabile Konzentration & Gleichmut'], step: '10 min Atem beobachten, Gedanken ziehen lassen.' },
    { name: 'Mentale Härte', note: 'Ruhe unter Druck.', core: ['Stress-Inokulation', 'Panik-Kontrolle', 'Selbstgespräch'], lvl: ['Kleine Unannehmlichkeiten suchen', 'Stress-Exposition dosiert', 'Ruhig im echten Druck'], step: 'Bewusst eine unangenehme Kleinigkeit täglich tun.' },
    { name: 'Emotionsregulation', note: 'Reagieren statt getrieben.', core: ['Impulskontrolle', 'Reframing', 'Pause vor Reaktion'], lvl: ['Trigger benennen', 'Reframing & Pause', 'Souverän im Konflikt'], step: 'Bei Ärger: 3 Atemzüge vor der Reaktion.' },
    { name: 'Visualisierung / mentales Training', note: 'Im Geist üben, physisch besser.', core: ['Motor Imagery', 'Alle Sinne', '1st-Person'], lvl: ['Kurze Bewegungsbilder', 'Volle Sinne / Routine', 'Wettkampf-Simulation im Kopf'], step: 'Vor dem Training Bewegungen 2 min lebhaft durchspielen.' },
    { name: 'Unbehagen- & Schmerztoleranz', note: 'Komfortzone dehnen.', core: ['Kontrollierte Reize', 'Atem im Schmerz'], lvl: ['Atem im Unbehagen', 'Längere Reize', 'Fokus trotz Schmerz halten'], step: 'Bei Belastung Atem ruhig halten statt anspannen.' },
    { name: 'Tummo / innere Wärme', note: 'Tibetisch, Harvard-dokumentiert.', core: ['Atem-Retention', 'Wärme-Visualisierung', 'fortgeschritten'], lvl: ['Meditation & Atmung solide', 'Retention & Wärmebild', 'Geführte Tummo-Praxis'], step: 'Erst solide Meditation, dann geführte Tummo-Session.' },
    { name: 'Flow gezielt auslösen', note: 'Zustand höchster Leistung.', core: ['Klares Ziel', 'Skill/Challenge', 'Trigger-Ritual'], lvl: ['Bedingungen kennen', 'Trigger-Ritual bauen', 'Flow verlässlich abrufen'], step: 'Aufgabe leicht über Level wählen, Ablenkung raus.' },
    { name: 'Tiefen- & Bewusstseinsmeditation', note: 'Reale Zustands-Techniken (Gateway).', core: ['Body-Scan', 'Klang/Rhythmus', "kein 'Kräfte'-Mythos"], lvl: ['Body-Scan', 'Lange Zustände', 'Stabile Tiefe ohne Erwartung'], step: '20-min-Body-Scan — Wahrnehmung statt Erwartung.' },
  ] },
  { n: 5, mode: 'parallel', title: 'Präsenz & soziale Meisterschaft', why: 'Die Bond/Shelby-Ausstrahlung — Auftreten, Menschen lesen, führen.', s: [
    { name: 'Körpersprache & Präsenz', note: 'Ruhige Dominanz ohne Worte.', core: ['Haltung', 'Raum einnehmen', 'Blickkontakt'], lvl: ['Haltung & Ruhe', 'Raum & Gesten bewusst', 'Präsenz ohne Nachdenken'], step: 'Beim Reden Hände & Blick ruhig halten.' },
    { name: 'Stimme & Sprechen', note: 'Wie du klingst, wirkt.', core: ['Resonanz', 'Tempo', 'Pausen'], lvl: ['Tempo & Pausen', 'Resonanz & Tiefe', 'Kommandostimme situativ'], step: 'Sätze mit Pause enden, nicht hochziehen.' },
    { name: 'Charisma & Rapport', note: 'Sofort Verbindung.', core: ['Wärme+Kompetenz', 'Storytelling', 'Zuhören'], lvl: ['Zuhören & Wärme', 'Storytelling', 'Räume für sich einnehmen'], step: 'Die andere Person mehr reden lassen.' },
    { name: 'Micro-Expressions & Menschen lesen', note: 'Ekman/FACS.', core: ['7 Basis-Emotionen', 'Baseline', 'Cluster'], lvl: ['7 Basisemotionen', 'Mikro erkennen', 'Baseline & Cluster live lesen'], step: 'Gesichter still beobachten, Emotion raten.' },
    { name: 'Rhetorik & Überzeugen', note: 'Argumente, die ankommen.', core: ['Ethos/Pathos/Logos', 'Framing', 'Struktur'], lvl: ['Klar strukturieren', 'Ethos/Pathos/Logos', 'Frei überzeugen & Einwände drehen'], step: 'Ein Anliegen in 3 klaren Sätzen formulieren.' },
    { name: 'Verhandeln', note: 'Bekommen, ohne zu drücken.', core: ['Tactical Empathy', 'BATNA', 'Anker'], lvl: ['Zuhören & Spiegeln', 'Anker & kalibrierte Fragen', 'High-Stakes ruhig führen'], step: 'Erst zuhören & spiegeln, dann fragen.' },
    { name: 'Netzwerkaufbau & Beziehungen', note: 'Echte Connections, nach oben.', core: ['Value-first', 'Follow-up', 'Sichtbarkeit'], lvl: ['Value-first-Kontakt', 'Follow-up-System', 'Nach oben netzwerken / Zugang'], step: 'Einer Person diese Woche ungefragt echten Nutzen liefern.' },
    { name: 'Konfliktlösung & Deeskalation', note: 'Souverän statt reaktiv.', core: ['Ich-Botschaften', 'Ruhe halten'], lvl: ['Ruhe halten', 'Ich-Botschaften', 'Deeskalieren & Lösung führen'], step: 'Im Streit Tempo raus, Frage statt Vorwurf.' },
    { name: 'Stil, Etikette & Auftreten', note: 'Geschmack als Signal.', core: ['Passform > Marke', 'Manieren', 'Kultur'], lvl: ['Passform-Basis', 'Anlass-Gespür', 'Müheloser eigener Stil'], step: 'Ein gut sitzendes Basis-Outfit definieren.' },
  ] },
  { n: 6, mode: 'parallel', title: 'Money-Engine & Business', why: 'Der Multiplikator auf deinen Fertigungs- und Coding-Stack.', s: [
    { name: 'Verkauf & Closing', note: 'L1 schon gebaut.', core: ['Discovery', 'Ergebnis verkaufen', 'Einwände'], lvl: ['Discovery & Closen', 'Skripte & Einwände', 'High-Ticket-Calls'], step: 'Einer Person mit dem 5-Schritt-Gerüst etwas anbieten.' },
    { name: 'Verkaufs- & Verhaltenspsychologie', note: 'Warum Menschen kaufen.', core: ['Trigger', 'Bias', 'Framing'], lvl: ['Kern-Trigger', 'Bias & Framing', 'Ethisch anwenden'], step: 'Bei einem Kauf analysieren: Was hat überzeugt?' },
    { name: 'Positionierung & Angebotsbau', note: 'Unwiderstehlich.', core: ['Grand-Slam-Offer', 'Preisanker', 'Nische'], lvl: ['Ergebnis + Preis', 'Grand-Slam-Offer', 'Nische besitzen'], step: 'Angebot als Ergebnis + Preis + Garantie schreiben.' },
    { name: 'Schreiben & Copywriting', note: 'Worte, die handeln lassen.', core: ['Hook', 'PAS/AIDA', 'Nutzen>Feature'], lvl: ['Klar & Nutzen', 'Hook & Struktur', 'Conversion-stark schreiben'], step: 'Einen Absatz halbieren ohne Bedeutungsverlust.' },
    { name: 'Performance Marketing & Ads', note: 'Nachfrage kommt zu dir.', core: ['Funnel', 'Targeting', 'Metriken'], lvl: ['Funnel-Logik', 'Kampagne live', 'Skalieren nach Zahlen'], step: 'Simplen Funnel skizzieren: Anzeige → Seite → Aktion.' },
    { name: 'KI-Entwicklung als Hebel', note: 'Automatisieren → halb-passiv.', core: ['Automatisierung', 'Agenten', 'Skalierung'], lvl: ['1 Automatisierung', 'Workflows / Agenten', 'Produkt & Skalierung'], step: 'Eine wiederkehrende Aufgabe mit KI automatisieren.' },
    { name: 'Systeme, Ops & Delegation', note: 'Dich ersetzbar machen.', core: ['SOPs', 'Prozesse', 'Delegieren'], lvl: ['1 SOP schreiben', 'Prozesse dokumentieren', 'Delegieren & ersetzbar'], step: 'Eine Aufgabe als Schritt-für-Schritt-SOP dokumentieren.' },
  ] },
  { n: 7, mode: 'parallel', title: 'Kapital, Zugang & Ressourcen', why: 'Geld, Deals und Türen, die sich öffnen.', s: [
    { name: 'Finanzbildung', note: 'Mit Geld & Bank umgehen.', core: ['Cashflow', 'Steuer-Basics', 'Bonität'], lvl: ['Cashflow-Überblick', 'Steuer & Kredit-Basics', 'Mit der Bank verhandeln'], step: 'Einnahmen/Ausgaben eines Monats sauber auflisten.' },
    { name: 'Investieren', note: 'Geld arbeiten lassen.', core: ['Anlageklassen', 'Risiko/Streuung', 'Compounding'], lvl: ['Anlageklassen', 'Portfolio & Risiko', 'Langfrist-Strategie'], step: 'Diversifikation in eigenen Worten erklären.' },
    { name: 'Immobilien-Business', note: 'Wie es funktioniert.', core: ['Finanzierung', 'Bewertung', 'Cashflow-Objekt'], lvl: ['Objekt rechnen', 'Finanzierung & Bewertung', 'Deal strukturieren'], step: 'Ein Objekt aus dem Netz durchrechnen: Miete vs. Kosten.' },
    { name: 'Sourcing & Supplier', note: 'Beste Qualität finden & prüfen.', core: ['Hersteller finden', 'Muster/QC', 'MOQ'], lvl: ['Hersteller finden', 'Muster & QC', 'Preis / MOQ verhandeln'], step: '3 Hersteller anfragen + Musterprozess klären.' },
    { name: 'Deal-Making & Zugang', note: 'An Preise, Orte & Menschen kommen.', core: ['Win-Win', 'Türöffner', 'Timing'], lvl: ['Win-Win denken', 'Türöffner nutzen', 'Zugang schaffen'], step: 'Wer hat schon Zugang — und was will er?' },
  ] },
  { n: 8, mode: 'laufend', title: 'Weltkompetenz & Life-Basics', why: 'Die Basics, die dich in jeder Situation handlungsfähig machen.', s: [
    { name: 'Sprachen', note: 'Überall kommunizieren.', core: ['Comprehensible Input', 'Spaced Rep', 'Kernwortschatz'], lvl: ['Kernwortschatz + Sätze', 'Input & Sprechen', 'Fließend im Alltag'], step: '50 häufigste Wörter in dein Review legen.' },
    { name: 'Reise- & Auslands-Kompetenz', note: 'Sich zurechtfinden.', core: ['Buchen', 'Navigieren', 'Kultur-Codes'], lvl: ['Buchen & navigieren', 'Vor Ort lösen', 'Überall souverän'], step: 'Eine fiktive Reise komplett durchplanen.' },
    { name: 'Erste Hilfe & Notfall', note: 'In jeder Lage helfen.', core: ['Seitenlage', 'CPR', 'Notruf'], lvl: ['Basics & CPR', 'Kurs & Praxis', 'Ruhe im Notfall'], step: 'Erste-Hilfe-Kurs eintragen — Praxis schlägt Theorie.' },
    { name: 'Alltags- & Survival-Skills', note: 'Improvisieren & lösen.', core: ['Orientierung', 'Reparaturen', 'Knoten'], lvl: ['Orientierung & Knoten', 'Grund-Reparaturen', 'Improvisieren unter Druck'], step: 'Eine kleine Reparatur ohne Anleitung lösen.' },
    { name: 'Kochen & Ernährung', note: 'Sich gut versorgen.', core: ['5 Gerichte', 'Meal-Prep', 'Makros'], lvl: ['5 solide Gerichte', 'Meal-Prep & Makros', 'Frei kochen'], step: 'Ein gesundes Gericht auswendig kochen lernen.' },
    { name: 'Fahr- & Fahrzeugtechnik', note: 'Auf deinem KFZ-Wissen.', core: ['Defensiv', 'Grenzbereich', 'Fahrphysik'], lvl: ['Defensiv & Blicktechnik', 'Grenzbereich', 'Fahrphysik nutzen'], step: 'Blick-/Bremstechnik auf freier Strecke üben.' },
    { name: 'Digitale Sicherheit & Privacy', note: 'Daten & Spuren schützen.', core: ['Passwortmanager', '2FA', 'OPSEC'], lvl: ['2FA & Manager', 'Datensparsamkeit', 'OPSEC-Routine'], step: 'Wichtigste Konten auf 2FA + Manager umstellen.' },
  ] },
];

const SKILL_STATUS = ['Offen', 'Lernen', 'Anwenden', 'Beherrscht'];
const SKILL_STATUS_C = ['#8E8E93', '#0A84FF', '#30D158', '#FF9F0A'];
const SKILL_PAR = new Set(['parallel', 'laufend']);

function getSkillStatus() { return ls('los_skill_status') || {}; }
function saveSkillStatus(o) { ls('los_skill_status', o); }
function skillKey(p, i) { return 'p' + p + 's' + i; }
function skillStat(p, i) { return getSkillStatus()[skillKey(p, i)] || 0; }
function cycleSkill(p, i) {
  const o = getSkillStatus(); const k = skillKey(p, i);
  const nv = ((o[k] || 0) + 1) % 4; o[k] = nv; saveSkillStatus(o);
  if (nv === 3) { haptic('success'); addXP(40, 'goals'); }
  else if (nv === 1) { haptic('light'); addXP(10, 'goals'); }
  return nv;
}

// Skill tree = owner's curated SKILL_TREE (hidden in public build) + the user's
// own skills, grouped into a "My skills" phase (n:90). Everyone can add their own.
function userSkills() { return ls('los_user_skills') || []; }
function saveUserSkills(a) { ls('los_user_skills', a); }
function getSkillTree() {
  const base = (typeof HUSTLEX_PUBLIC !== 'undefined' && HUSTLEX_PUBLIC) ? [] : SKILL_TREE;
  const us = userSkills();
  if (!us.length) return base;
  return base.concat([{ n: 90, mode: '', user: true, title: (typeof LANG !== 'undefined' && LANG === 'en') ? 'My skills' : 'Meine Skills', why: '', s: us }]);
}
function addUserSkill() {
  const EN = (typeof LANG !== 'undefined' && LANG === 'en');
  const name = prompt(EN ? 'Skill name:' : 'Skill-Name:'); if (!name || !name.trim()) return;
  const note = prompt(EN ? 'Short description (optional):' : 'Kurze Beschreibung (optional):', '') || '';
  const a = userSkills(); a.push({ name: name.trim(), note: note.trim(), core: [], lvl: [] }); saveUserSkills(a); renderScreen('skills');
}

// Overall + per-phase progress (0..1 of max = 3 per skill).
function skillTotals() {
  let sum = 0, cnt = 0, c0 = 0, cA = 0, c3 = 0;
  getSkillTree().forEach(p => p.s.forEach((s, i) => {
    const v = skillStat(p.n, i); sum += v; cnt++;
    if (v === 0) c0++; else if (v === 3) c3++; else cA++;
  }));
  return { pct: cnt ? Math.round(sum / (cnt * 3) * 100) : 0, c0, cA, c3, cnt };
}
function phasePct(p) {
  const max = p.s.length * 3; if (!max) return 0;
  let sum = 0; p.s.forEach((s, i) => sum += skillStat(p.n, i));
  return Math.round(sum / max * 100);
}

let SKILL_FILTER = 'all';       // all | 0 | active | 3
let SKILL_OPEN = new Set();     // expanded skill keys
let SKILL_Q = '';

function skillMatchesFilter(v) {
  if (SKILL_FILTER === 'all') return true;
  if (SKILL_FILTER === 'active') return v === 1 || v === 2;
  return v === +SKILL_FILTER;
}

// Erster Schritt / Skill in den Heute-Plan + Non-Negotiables bringen.
function skillToToday(name, step) {
  const txt = step || name;
  const short = txt.length > 72 ? txt.slice(0, 70) + '…' : txt;
  if (typeof addNN === 'function') addNN(short);
  if (typeof getPlan === 'function') { const pl = getPlan(); pl.brainDump.push({ id: Date.now(), text: '🌱 ' + short, duration: 30, priority: 'high' }); savePlan(pl); }
  haptic('success'); showToast('Als Non-Negotiable + Tagesplan-Idee gesetzt', '🌱');
  if (typeof updateStatusBar === 'function') updateStatusBar();
}

// Skill als Ziel anlegen (mit Stufenleiter als Teilschritte).
function skillToGoal(sk) {
  const z = ls('los_ziele') || [];
  if (z.some(x => x.text === sk.name && !x.done)) { showToast('Ist schon ein Ziel', '◇'); return; }
  z.push({
    id: Date.now(), text: sk.name, why: sk.note || '', cat: 'mittelfristig', type: 'faehigkeit', prio: 'mittel',
    deadline: '', maxProgress: 3, progress: 0, done: false,
    subs: (sk.lvl || []).map((t, i) => ({ id: Date.now() + i, text: 'L' + (i + 1) + ': ' + t, done: false })),
  });
  ls('los_ziele', z); addXP(10, 'goals'); haptic('success');
  showToast('„' + sk.name + '" als Ziel angelegt', '◇');
}

// Kurs zu einem Skill bauen → reuse the existing AI course builder, prefilled.
function skillBuildCourse(sk, lvlIdx) {
  const lvl = 'L' + (lvlIdx + 1);
  const topic = sk.name + ' — ' + lvl + ': ' + (sk.lvl[lvlIdx] || '');
  if (typeof openAICourse === 'function') openAICourse(topic);
  else showToast('Kurs-Builder nicht verfügbar', '⚠');
}

function renderSkills(s) {
  s.className = 'screen on';
  const t = skillTotals();

  s.innerHTML = '<div class="label" style="margin-bottom:4px;">SKILL-TREE</div>' +
    '<div class="h2">Dein <span class="gold">Lernweg</span></div>';

  // Overall progress card
  const head = div('glass-hi', '');
  head.style.cssText = 'display:flex;align-items:center;gap:16px;padding:16px;';
  head.appendChild(progressRing(t.pct, 'var(--gold)', 66, 7, '<div style="font-size:15px;font-weight:800;color:#fff;">' + t.pct + '<span style="font-size:9px;">%</span></div>'));
  head.insertAdjacentHTML('beforeend',
    '<div style="flex:1;min-width:0;">' +
    '<div style="font-size:13px;color:var(--t-1);font-weight:600;margin-bottom:4px;">' + t.cnt + ' Skills · ' + getSkillTree().length + ' Phasen</div>' +
    '<div style="font-size:12px;color:var(--t-3);line-height:1.6;">' +
    '<span style="color:var(--blue);">●</span> ' + t.cA + ' aktiv · ' +
    '<span style="color:var(--gold);">●</span> ' + t.c3 + ' beherrscht · ' +
    '<span style="color:var(--t-4);">●</span> ' + t.c0 + ' offen</div></div>');
  s.appendChild(head);

  // Add your own skill
  const addSkillBtn = h('button', { textContent: '＋ Skill hinzufügen' });
  addSkillBtn.className = 'btn btn-glass tap'; addSkillBtn.style.cssText = 'width:100%;font-size:13px;margin-top:10px;';
  addSkillBtn.onclick = () => addUserSkill();
  s.appendChild(addSkillBtn);

  // Search
  const search = h('input', { type: 'search', placeholder: '🔍 Skill suchen…' }, '');
  search.className = 'inp'; search.style.cssText = 'width:100%;font-size:14px;margin-top:8px;';
  search.value = SKILL_Q;
  s.appendChild(search);

  // Filter chips
  const fRow = div(''); fRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;';
  [['all', 'Alle'], ['0', 'Offen'], ['active', 'Aktiv'], ['3', 'Beherrscht']].forEach(([k, l]) => {
    const b = h('button', { textContent: l });
    b.className = 'itab tap' + (SKILL_FILTER === k ? ' on' : '');
    b.onclick = () => { SKILL_FILTER = k; renderScreen('skills'); };
    fRow.appendChild(b);
  });
  s.appendChild(fRow);

  const listWrap = div(''); listWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:8px;'; s.appendChild(listWrap);

  const paint = () => {
    listWrap.innerHTML = '';
    const q = search.value.trim().toLowerCase();
    let anyShown = false;

    getSkillTree().forEach(p => {
      const isPar = SKILL_PAR.has(p.mode);
      // which skills of this phase pass filter + search
      const visible = p.s.map((sk, i) => ({ sk, i, v: skillStat(p.n, i) }))
        .filter(({ sk, v }) => skillMatchesFilter(v) &&
          (!q || sk.name.toLowerCase().includes(q) || (sk.note || '').toLowerCase().includes(q) || (sk.core || []).some(c => c.toLowerCase().includes(q))));
      if (!visible.length) return;
      anyShown = true;

      const pp = phasePct(p);
      const det = document.createElement('details');
      det.className = 'glass'; det.style.cssText = 'padding:12px 14px;';
      det.open = q || SKILL_FILTER !== 'all' || p.n <= 2; // open early phases / when filtering
      det.innerHTML = '<summary style="cursor:pointer;font-size:14px;font-weight:600;color:var(--t-1);">' +
        '<span style="color:var(--gold);">' + p.n + '</span> · ' + esc(p.title) +
        ' <span style="color:var(--t-3);font-weight:400;font-size:12px;">· ' + pp + '% · ' + (isPar ? 'parallel' : p.mode) + '</span></summary>';
      const body = div(''); body.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:8px;';
      const why = div('', esc(p.why)); why.style.cssText = 'font-size:12px;color:var(--t-3);line-height:1.5;margin-bottom:2px;';
      body.appendChild(why);

      visible.forEach(({ sk, i, v }) => body.appendChild(skillCard(p, sk, i, v)));
      det.appendChild(body); listWrap.appendChild(det);
    });

    if (!anyShown) listWrap.appendChild(div('', '<div style="font-size:13px;color:var(--t-3);padding:10px 4px;text-align:center;">Nichts in dieser Auswahl.</div>'));
  };

  const skillCard = (p, sk, i, v) => {
    const key = skillKey(p.n, i);
    const open = SKILL_OPEN.has(key);
    const card = div(''); card.style.cssText = 'border:1px solid var(--edge);border-left:3px solid ' + SKILL_STATUS_C[v] + ';border-radius:12px;overflow:hidden;';
    // header row
    const row = div('tap', '');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:11px 12px;';
    row.innerHTML = '<div style="flex:1;min-width:0;">' +
      '<div style="font-size:14px;font-weight:600;color:var(--t-1);">' + esc(sk.name) + ' <span style="color:var(--t-4);font-size:11px;">' + (open ? '▾' : '▸') + '</span></div>' +
      '<div style="font-size:12px;color:var(--t-3);margin-top:2px;line-height:1.4;">' + esc(sk.note || '') + '</div></div>';
    const pill = h('button', { textContent: SKILL_STATUS[v] });
    pill.className = 'tap';
    pill.style.cssText = 'flex:none;font-size:10.5px;font-weight:700;padding:6px 11px;border-radius:99px;white-space:nowrap;' +
      (v === 0 ? 'background:var(--glass-2);border:1px solid var(--edge);color:var(--t-3);'
               : 'background:' + SKILL_STATUS_C[v] + '22;border:1px solid ' + SKILL_STATUS_C[v] + '66;color:' + SKILL_STATUS_C[v] + ';');
    pill.onclick = (e) => { e.stopPropagation(); cycleSkill(p.n, i); renderScreen('skills'); };
    row.appendChild(pill);
    row.onclick = () => { if (open) SKILL_OPEN.delete(key); else SKILL_OPEN.add(key); paint(); };
    card.appendChild(row);

    if (open) {
      const d = div(''); d.style.cssText = 'padding:0 12px 12px;border-top:1px solid var(--edge);';
      if (!p.user) {
        // Kernbausteine
        d.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin:10px 0 6px;">KERNBAUSTEINE</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + (sk.core || []).map(c => '<span style="font-size:11.5px;color:var(--t-1);background:var(--glass-2);border:1px solid var(--edge);border-radius:8px;padding:4px 9px;">' + esc(c) + '</span>').join('') + '</div>');
        // Stufenleiter with per-level "Kurs bauen"
        d.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin:12px 0 6px;">STUFENLEITER</div>');
        (sk.lvl || []).forEach((lt, li) => {
          const lr = div(''); lr.style.cssText = 'display:flex;align-items:flex-start;gap:8px;padding:5px 0;';
          lr.innerHTML = '<span style="flex:none;font-size:10px;font-weight:700;color:#241a09;background:' + SKILL_STATUS_C[li + 1] + ';border-radius:6px;padding:2px 6px;margin-top:1px;">L' + (li + 1) + '</span>' +
            '<span style="flex:1;font-size:12.5px;color:var(--t-2);line-height:1.4;">' + esc(lt) + '</span>';
          const kb = h('button', { textContent: '✦ Kurs' });
          kb.className = 'tap'; kb.style.cssText = 'flex:none;font-size:11px;color:var(--gold);background:none;padding:2px 4px;';
          kb.onclick = () => skillBuildCourse(sk, li);
          lr.appendChild(kb); d.appendChild(lr);
        });
        // Erster Schritt
        d.insertAdjacentHTML('beforeend', '<div class="label" style="font-size:10px;margin:12px 0 6px;">ERSTER SCHRITT</div>' +
          '<div style="font-size:12.5px;color:var(--t-2);line-height:1.5;">' + esc(sk.step || '') + '</div>');
      }
      // Actions
      const acts = div(''); acts.style.cssText = 'display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;';
      const mk = (label, fn) => { const b = h('button', { textContent: label }); b.className = 'itab tap'; b.style.cssText = 'flex:1;min-width:120px;font-size:11.5px;text-transform:none;letter-spacing:0;padding:9px 6px;'; b.onclick = fn; return b; };
      acts.appendChild(mk('🌱 Schritt → Heute', () => skillToToday(sk.name, sk.step)));
      acts.appendChild(mk('◇ Als Ziel', () => { skillToGoal(sk); }));
      if (p.user) acts.appendChild(mk('🗑 Löschen', () => { const a = userSkills(); a.splice(i, 1); saveUserSkills(a); renderScreen('skills'); }));
      d.appendChild(acts);
      card.appendChild(d);
    }
    return card;
  };

  search.oninput = () => { SKILL_Q = search.value; paint(); };
  paint();

  s.appendChild(div('', '<div style="font-size:11px;color:var(--t-4);text-align:center;padding:10px 0 2px;line-height:1.6;">Status tippen: Offen → Lernen → Anwenden → Beherrscht (+XP).<br>Phase 0–2 bauen aufeinander auf, 4–8 laufen parallel. Start: <b>Lernen lernen</b>.</div>'));
}
