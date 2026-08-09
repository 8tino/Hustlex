# CLAUDE.md — Anweisungen für Claude Code

Dieses Projekt ist eine modulare Neugestaltung der ursprünglichen `LifeOS.html`.

## ⭐ AKTUELLER STAND / HANDOFF (2026-08-02) — für Fortsetzung auf anderem Rechner

**Live:** https://wonderful-meerkat-10ca3d.netlify.app/ · **Service-Worker:** `los-v39` (in `src/core/01-storage.js`; bei jedem Release +1).

**Build & Deploy (dieser Rechner, Node via fnm, npm läuft nicht direkt):**
- Node-Pfad Windows: `C:/Users/Gamer/AppData/Roaming/fnm/node-versions/v24.16.0/installation/node.exe`. Auf Mac: normal `node`/`npm` falls installiert.
- Bauen: `node build.mjs` → schreibt `dist/LifeOS.html` (+ `dist/index.html`).
- Deploy: `node tools/deploy.mjs` (Netlify-Token in `.netlify-token`). Oder `npm run deploy`.
- Preview: `py -m http.server 5179 --directory dist` → Seite `/LifeOS.html`.

**Diese Session (Aug 2026) neu gebaut & LIVE getestet (SW v28–v39):** iPhone-Swipe-back (nur in installierter PWA, 1 Schritt), „💬 Mit Claude besprechen" (keyless), einklappbare `section()`-Abschnitte in Körper/Aufgaben/Tasks/Ziele, ein Chevron (zu=oben/offen=unten), 103 Lebensmittel, Task-Ordner + Standard-Ordner, „App anpassen" (Sektionen an/aus via `los_modules`+`moduleOn`, Einheiten metrisch/imperial, Ordner-Manager), Task↔Körper-Verknüpfung (`link`/`taskDone`, Trinken hakt sich ab, auch im Home), Tutorial (`openTutorial`), Gramm-/oz-Eingabe + editierbare Food-Makros (`openFoodEdit`/`los_food_overrides`), beliebiges Zukunftsdatum im Tagesplan, Hilfe/Fehler/Verbesserung-Tabs (`openHelp`/`openReport`, `los_feedback`+mailto). Details je Feature in den Abschnitten unten. **Bug-Test:** alle 16 Views + Overlays fehlerfrei.

**OFFENE TODOs / nächste Schritte:**
1. **Consent-Gate** (zuletzt vorgeschlagen, Nutzer-Entscheidung offen): Onboarding-Häkchen für AGB/Datenschutz + separat Cloud & KI, versioniert gespeichert (Haftungsschutz). Rechtstexte selbst kommen von Anwalt/Generator.
2. Weitere Werte editierbar wie Foods (Supplements/Recovery/Quests).
3. Mehr Live-Integrationen (Kalender bidirektional, ChatGPT/Social) — braucht OAuth+Backend.
4. Vor öffentlichem Launch: KI-Metering/Limit + Anthropic-Key setzen, i18n, Zahlung (Merchant-of-Record), Legal-Docs. Siehe memory `ai-cost-economics`.

**Fortsetzung auf Mac:** Projektordner muss auf den Mac (Remote Control der Sitzung schlägt fehl). Robust: Ordner nach GitHub (privat) pushen ODER kopieren; dann Claude Code auf dem Mac im Ordner öffnen — diese CLAUDE.md liefert den vollen Kontext. Achtung: das auto-memory unter `~/.claude/...` ist rechner-lokal und wandert NICHT mit; der maßgebliche Stand steht daher hier in der CLAUDE.md (reist mit dem Projekt).

## Kontext

- **Quelle:** `LifeOS.html` (im Root) — die alte single-file PWA, ~2000 Zeilen
- **Ziel:** Migration in `src/` · Design jetzt **iOS-Dark (Apple)**: echtes Schwarz, solide Karten (#1C1C1E/#2C2C2E), weißer Text, Apple-Blau `#0A84FF`, dünne Trennlinien, System-Font. Kein Glas-Blur/Gold/Serif. Token-Namen (`--glass-*`, `--gold`) bleiben aus Kompatibilität, halten aber jetzt solide/blaue Werte. `pColor()` liefert immer das Akzent-Blau.
- **Build:** `npm run build` konkateniert `src/` → `dist/LifeOS.html`
- **Dev:** `npm run dev` startet Live-Server auf http://localhost:5173

## Cloud-Sync & Verschlüsselung (E2EE, Supabase)

- **App startet hinter Passwort-Sperre** (`#lock`, `src/ui/00-lock.js`). Erststart = Konto anlegen (E-Mail+Passwort), danach Entsperren.
- **Ende-zu-Ende-verschlüsselt / Zero-Knowledge** (`src/core/05-sync.js`): Aus dem Passwort werden via PBKDF2+HKDF zwei Schlüssel abgeleitet — `authPass` (Supabase-Login) und `encKey` (AES-GCM, **verlässt das Gerät nie**). Supabase speichert nur Chiffretext (verifiziert: kein Klartext in der DB).
- **Local-first + versionierte Backups** (Bug-Schutz): localStorage ist die Quelle der Wahrheit; jeder Push legt über `save_vault()` eine neue Version an (letzte 15 in `public.vault_backups`), nie destruktiv. Leere/kaputte Stände werden nie hochgeladen.
- **Supabase-Projekt:** `lifeos` · ref `gnxwxoficcptpbrsltsx` (eu-central-1). Config (URL + publishable key) in `src/core/00-config.js`. Tabellen `vaults`/`vault_backups` mit RLS (nur `auth.uid()`), Auto-E-Mail-Bestätigung per Trigger.
- **⚠ Passwort vergessen = Daten weg** (echtes E2EE, kein Server-Reset). Bewusst so gewählt.
- `ls()` (`01-storage.js`) ruft nach jedem Write `markDirty()` → debounced verschlüsselter Push.

## Stand Juli 2026 (Umbau)

- **Design = Liquid Glass**: transluzente Blur-Flächen (`backdrop-filter`), Licht-Kante (inset highlight), Ambient-Glows (blau/violett) hinter dem Glas, Gradient-Zahlen/Bars, **schwebende Pill-Nav** (fixed, unten, scrollbar). `#content` unten 120px Padding wegen der Floating-Nav.
- **Tabs konsolidiert (10):** home · tasks · log · fokus · quests · vitals · intel · ich · wachstum · finanzen. **STATS ist jetzt Sub-Tab in LOG** (`LOG_TAB` heute|stats → `renderStatsPanel`), **MARKT ist Sub-Tab in FINANZEN/GELD** (`GELD_TAB` geld|markt; markt.js `renderScreen('markt')`→`'finanzen'`). Es gibt keine `s_stats`/`s_markt`-Screens mehr.
- **Quests**: Kategorien Körper/Geist/Disziplin sind jetzt umschaltbare Tabs (`QUESTS_CAT`), vorher nicht wechselbar. Micro-Habits aus Quests entfernt (Dopplung mit Tasks-Tab); `renderMicroHabits`/`getMicro` bleiben als Altcode, Assistant-Tool `add_micro_habit` entfernt.
- **Log-Ordner**: Einträge haben `folder` (Ordner/Unterordner, „/"), verwaltet über `los_log_folders`.
- **Dashboard-Vergleich** (`stats.js`): Metriken (Schlaf + Log-Kategorien + Wasser/kcal/Tasks) × Zeitraum (7/30/90/180 T) → Stunden-Bars + Kreisdiagramm (conic-gradient) + Wert-Kacheln. Zeit-Historie kommt aus `los_daystat_<date>` (von `saveDay()` geschrieben) + `los_log_<date>`.

## Umbau „Heute-Hub" (Juli 2026, SW `los-v13`)

- **HOME = „Heute"-Hub** (`screens/home.js`): `homeDomains()` berechnet drei Domains (Körper / Aufgaben / Geist) + Gesamt-%; Hero-Karte mit 3 verschachtelten Conic-Ringen (Apple-Activity-Stil) und Legende (Tap → vitals/tasks/wachstum). Darunter **„NOCH OFFEN HEUTE"** — die eine Liste, die zeigt was noch fehlt, damit man **nicht** mehr jeden Reiter durchklicken muss. Alles erledigt → Feier-Karte.
- **Ringe statt Kästen**: `progressRing(pct,color,size,thickness,innerHtml)` in `core/04-helpers.js`; Vitals hat oben eine `TAGESZIELE`-Karte mit 4 Ringen (Protein/Wasser/kcal/Schlaf) statt der Liste untereinander.
- **Tabs jetzt 7**: home · tasks · log · fokus · quests · vitals · **mehr**. `screens/mehr.js` bündelt Geld/Ich/Wachstum/Intel + KI-Assistent + Einstellungen. `navTo()` (`ui/03-nav.js`) akzeptiert Views ohne eigenen Tab-Button (`NAV_UNDER_MEHR`) und hält dann MEHR aktiv.
- **FOKUS in 2 Sub-Tabs** (`FOKUS_TAB`): **TAGESPLAN** (`renderPlanner`) und **DISZIPLIN** (`renderDisziplin`: Streak, NN, Vows, Abrechnung, Bilanz). Der Planer ist jetzt **1 Tap pro Block**: `PLAN_PRESETS` (3 Gruppen × 6 Bausteine mit Icon/Dauer/Typ) → `addBlock()` setzt den Block automatisch ab `nextFreeStart()`; Zeile antippen = `editBlock()`-Sheet (Name, Icon, Start, Dauer-Chips, Löschen); „Jetzt"-Karte mit ▶ STARTEN/✓ FERTIG. Weckzeiten, KI-Plan und Brain Dump liegen eingeklappt unter „Mehr Optionen" (`<details>`). Blöcke werden auf 23:59 geklemmt, damit nichts über Mitternacht wrappt.
- **Statusbar-Fix iPhone**: `#statusbar` mit `env(safe-area-inset-top)` + eigenem Blur-Layer und `z-index:20`.
- **Datenschutz gegen Update-Verlust**: `autoBackup()` (`screens/99-init.js`) legt bei jedem Start einen Snapshot aller `los_*`-Keys in `los_autobackup` (letzte 5); Wiederherstellen über Einstellungen → „↩ BACKUP WIEDERHERSTELLEN". `los_autobackup` ist in `LOCAL_ONLY_KEYS` (wird nie in die Cloud gepusht).
- **Log mit Nachtrag-Zeit**: Eingabezeile hat ein `type=time`-Feld; `addLogEntry(text, folder, time)` sortiert nach Uhrzeit.
- **Lesbarkeit**: alle Inline-`font-size` 7–12px app-weit angehoben (7/8→10, 9/10→11, 11→12, 12→13); `.tblock-title` 15px.

## Juli 2026 · Fixes & neue Tools (SW `los-v14`)

- **Avatar-Overflow behoben**: `avatarStyle(box)` + `graphemeCount()` (`core/04-helpers.js`) skalieren Mehr-Emoji-Avatare (z.B. „⚔🦾") und clippen sie (`overflow:hidden;line-height:1`). Angewandt in `ui/02-statusbar.js` (`sb_avatar`, 38px) und `screens/home.js` (Hero-Avatar, 40px).
- **Notizen-Import** (`screens/notizen.js`, `openNotesImport()` — im MEHR → Schnellzugriff): Textblock einfügen → `splitNotes()` teilt in Zeilen (Bullets „-/•/1./2)" entfernt, Inhalts-Zahlen wie „15€" bleiben) → `suggestNoteTarget()` (Keyword-Heuristik, **ohne KI**) schlägt Bereich vor → Nutzer korrigiert per `<select>` → `insertNote()` routet jede Zeile über die **bestehenden** `runAssistantTool`-Handler in den richtigen Store. Ziel-Bereiche: task/log/nn/idee/ziel/wert/lernen/journal/ausgabe/einnahme/vorbild/ignore. `✦ KI sortieren` (`notesAISort`) verfeinert per `callAI`, scheitert sauber ohne Key.
- **Task ↔ Log verknüpft** (`screens/tasks.js`): Task abhaken → `addTaskLog()` schreibt Eintrag in heutiges `los_log` (Ordner „Tasks", `src:'task'`, `taskId`), erscheint in LOG → AUSWERTUNG. Enthaken → `removeTaskLog()` entfernt genau diesen Auto-Eintrag (manuelle Log-Einträge bleiben unangetastet).

## Sortieren per Drag (SW `los-v15`)

- **`ui/07-sortable.js`**: wiederverwendbares Ziehen-zum-Umsortieren (Pointer-Events, Touch+Maus). `dragHandle()` liefert den Griff `⠿` (schluckt eigenen Klick, damit ein Grip-Tap nicht die Zeile auslöst); `makeSortable(listEl, onDrop)` sortiert das DOM live und ruft `onDrop(idOrder)`; `applyOrder(arr, ids)` bringt ein `{id}`-Array in die neue Reihenfolge. Container braucht Klasse `sortlist`, jede Zeile `data-sortid`. CSS (`.sortlist`, `.drag-handle`, `[data-sortid].dragging`) in `02-components.css`.
- Angewandt: **Tasks** (`tasks.js`), **Ziele** pro Kategorie (`ich.js`), **Werte** (`ich.js`), **Non-Negotiables** (`fokus.js`). Weitere Listen (Brain-Dump-Ideen, Log-Chips, Foods/Supps) können mit demselben Muster nachgezogen werden.

## Juli 2026 · Motivation, Kurse, Ziel-Upgrade (SW `los-v16`)

- **Täglicher Start-Popup** (`screens/inspiration.js`): beim ersten Öffnen pro Tag `showDailyStart()` (in `99-init.js` nach `navTo('home')`, 500ms) — „der erste Satz des Tages" (Motivationsspruch) + ein Buch-Gedanke. Auswahl deterministisch pro Tag (`getDailyItem`/`_dayNumber`), einmal/Tag (`los_daystart_<date>`). `QUOTES` (30) + `BOOK_INSIGHTS` (18 destillierte Kernaussagen mit Quelle, kein Verbatim-Copyright). Bibliothek als Wachstum-Subtab **INSPIRATION** (`renderInspiration`).
- **Kurse** (`screens/kurse.js`, MEHR → 🎓 Kurse, `NAV_UNDER_MEHR`): eigene Kurse mit Lektionen → Fortschritt → Abschlussprüfung (Multiple-Choice, `passPct` 80%) → **Zertifikat** (`showCertificate`). Store `los_courses`. Manueller Builder (`openCreateCourse`/`renderCreateCourse`, Draft `COURSE_DRAFT`, oninput ohne Rerender = kein Fokusverlust) **oder** KI-Entwurf (`openAICourse`→`callAI`, Fallback ohne Key). `coursesOpen()` speist den Home-Reminder. XP: +15/Lektion, +100/bestanden. `case 'kurse'` in `00-render.js`, `s_kurse` in `index.html`.
- **Ziele erweitert** (`ich.js`): Ziel-Objekt hat jetzt `type` (materiell/faehigkeit/gewohnheit/erlebnis/anders), `prio` (hoch/mittel/niedrig), `deadline` (ISO). `openAddZiel(getZ,saveZ,existing)` = Anlegen+Bearbeiten mit diesen Feldern. Karten zeigen Badges (Typ · Prio-Punkt · Deadline-Countdown via `deadlineInfo`) + Aktionen: **✎ Bearbeiten · ✦ KI-Plan** (`aiGoalPlan` zerlegt in Teilschritte → `subs`) · **📅 Alltag-Check** (`aiGoalFit` bewertet mit 7-Tage-Log-Daten, ob Zeit da ist / was zu depriorisieren; Heuristik-Fallback ohne Key). Manuelle Drag-Reihenfolge bleibt (kein Auto-Sort, um Sortable nicht zu überschreiben).
- **Ziele im Home verwoben** (`home.js`): „DEIN ZIEL IM FOKUS"-Karte (Top-Ziel nach Prio→Deadline, Fortschrittsbalken, → ich) + Kurs-Reminder in „NOCH OFFEN HEUTE".

## Kursbereich: Kurrikulum + eigene Kurse (SW `los-v17`)

- **Quelle**: `src/kurse/` (10 `.md` + `lifeos-kurse.json`, aus `C:\Users\Gamer\Documents\lifeos kurse ordner\lifeos kurse` ins Repo kopiert). Manifest: `kurse[10]` (id m1/m2/m2b/m3…m9, titel, kurztitel, funktion, leitfrage, phase[], prioritaet, geschaetzteZeit, warnung, kernaussagen[], datei, kapitel[]), `kapitel` (nr, titel, kern, checks[]) — **179 Kapitel / 212 Checks**; `reihenfolge.pfad` (Lernreihenfolge nach id ≠ Kursnummer), `lernpfad.phase1–4` (rot/gelb/gruen/ignorieren + titel + hinweis), `meta.phasen`, `faeden`.
- **Build bettet alles ein**: `buildKurseData()` in `build.mjs` liest das Manifest + schneidet pro Kapitel den Volltext aus dem Markdown (`^## <nr>. …` bis nächstes Kapitel/`# TEIL`/EOF — geprüft: 179/179 exakt) und emittiert `const KURSE_DATA = {manifest, volltext}` (Key `"<id>.<nr>"`) an den Anfang des JS-Bundles. Bundle dadurch ~800 KB, voll offline.
- **`screens/kurse.js` = ein vereinheitlichter Screen** (`renderKurse` dispatcht via `KURS_OPEN` = null | `kurr:<id>` | `eigen:<id>`):
  - **Übersicht**: „▶ Nächstes dran" (`kurrNext()` läuft `reihenfolge.pfad` × Fortschritt), Phasenfilter (Phase 1–4 + rot/gelb/gruen/ignorieren-Toggles, State `los_kurse_phase`/`los_kurse_buckets`), Sektion **KURRIKULUM** (Kurse nach `kurseByPfad()`, `progressRing`, funktion, Bucket-Farbe via `bucketOf`), Sektion **EIGENE KURSE** + „Kurs erstellen"/„KI-Kurs".
  - **Kurrikulum-Detail** (`renderKurrDetail`): Header (funktion, leitfrage, warnung, kernaussagen als `<details>`), Kapitelliste mit Kern-Vorschau + „erledigt"-Haken (zählt in Balken).
  - **Kapitel-Reader** (`openKapitel`): Volltext via `mdToHtml()` (kleiner, sicherer MD-Renderer), `checks` als abhakbare Checkboxen, „erledigt", „Nächstes Kapitel"-Sprung.
  - **Fortschritt** persistent wie überall: `ls('los_kurse_fortschritt', { "m7.1": {done, checks:{i:true}} })` → Cloud-Sync + Auto-Backup. XP +20/Kapitel.
  - **Eigene Kurse** = der bisherige Builder (Lektionen + Prüfung + Zertifikat, `los_courses`) — unverändert integriert.
- **Home**: „NOCH OFFEN HEUTE" zeigt das nächste Kurrikulum-Kapitel (`kurrNext`) + offene eigene Kurse.
- Regenerieren nach Kurrikulum-Änderung: einfach `node build.mjs` (liest `src/kurse/` neu).

## Ziele→Alltag, KI-Tagesplan mit Kalender, Leitfäden (SW `los-v18`)

- **Ziele werden zu Tagesaktion** (`ich.js` `goalToToday(goal)` + `home.js`): Button „▶ Heute daran arbeiten" auf jeder Ziel-Karte und auf der Home-Ziel-Karte → nächster offener Teilschritt (sonst Ziel-Text) landet als **Non-Negotiable** + **Tagesplan-Idee** (`brainDump`, prio high). So wird aus einem Ziel sofort etwas, das man heute anfängt.
- **Kalender & feste Zeiten** (`screens/kalender.js`, MEHR → 📅 + im Tagesplaner): `los_fixed_blocks` = wiederkehrende Wochenzeiten (Tage 0–6 = So–Sa, z.B. „Arbeit Mo–Fr 9–17", Presets vorhanden); `los_calendar` = via **.ics** importierte Termine (URL-Fetch best-effort/CORS, **Datei-Upload**, **Text-Einfügen**). `parseICS()` (unfold, DTSTART/DTEND/RRULE, one-off + FREQ=WEEKLY;BYDAY). `todaysAnchors()` = feste Zeiten + heutige Kalendertermine; `materializeDay()` setzt sie als Blöcke in `los_plan_<date>` (dedupe via `b.anchor`).
- **KI plant den Tag um die festen Termine** (`fokus.js` `aiPlanDay` erweitert): sammelt feste Termine (Anchors) + Brain-Dump + offene Tasks + Top-Ziel-Schritt (`topGoalStep`), Prompt „plane um die FESTEN TERMINE herum", merged fehlende Anchors nach der KI-Antwort wieder rein. Buttons im Tagesplaner: „✦ KI plant meinen Tag", „📅 Kalender & feste Zeiten", „↓ N feste einsetzen". Ohne KI-Key funktioniert „feste einsetzen" deterministisch offline.
- **Leitfäden** (`build.mjs` `leitfaeden` in `KURSE_DATA`, `kurse.js` `openGuide`): die 3 Begleit-Markdowns (00-START-HIER, Der-Kompass, Verkaufs-und-Netzwerk-Playbook) eingebettet in gegebener Reihenfolge, Sektion „LEITFÄDEN" im Kurse-Screen, Reader via `mdToHtml`, „gelesen"-Status in `los_kurse_fortschritt` (`guide.<id>`).

## Navigation: 5 Sektionen als Hubs (SW `los-v19`)

- **Bottom-Nav = 5 Tabs**: **Heute · Körper · Aufgaben · Wachstum · Mehr** (spiegelt die 3 Heute-Ringe). `index.html` nav-buttons `data-view` = home/koerper/aufgaben/wachstumhub/mehr; neuer Screen `s_wachstumhub`.
- **`ui/03-nav.js` neu**: `HUBS` (koerper/aufgaben = `kind:'tabs'`, wachstumhub = `kind:'cards'`) + `CHILD_HUB` (child→hub). `navTo` löst Hub-IDs auf (tabs→letztes/Default-Kind via `STATE.hubLast`), highlightet via `navParent` den Elternschalter. `renderHubNav(view,s)` hängt in `renderScreen` (00-render.js, jetzt `break` + Aufruf am Ende) die Unterreiter-Leiste (Körper/Aufgaben) bzw. den „‹ Wachstum"-Zurück-Link (Wachstum-Kinder) oben an.
  - **Körper** = [Vitals | Gewohnheiten] über `s_vitals`/`s_quests`.
  - **Aufgaben** = [Tagesplan | Tasks | Log | Disziplin]; Tagesplan/Disziplin sind `fokus` mit `FOKUS_TAB` (interner Fokus-Umschalter entfernt, die Hub-Leiste steuert ihn).
  - **Wachstum** = `renderWachstumHub` (Kacheln → ich/kurse/wachstum/intel/finanzen).
  - **Mehr** = nur noch Notizen · KI-Assistent · Kalender · Einstellungen (Bereiche sind in die Sektionen gewandert).
- Home-Ringe verlinken in koerper/aufgaben/wachstumhub; Streak→fokus(disziplin), aktueller Block→fokus(plan), NN-Item→fokus(disziplin) setzen `FOKUS_TAB` vor `navTo`. Nav passt auf 375px (kein Overflow).

## Tagesplan: Auto-Eintrag + prioritätsbasierter Planer ohne KI (SW `los-v20`)

- **Feste Zeiten landen automatisch im Tagesplan** (`fokus.js` `renderPlanner`): einmal pro Tag `materializeDay()` wenn `!plan.materialized` und heutige Anchors existieren; Flag `plan.materialized` verhindert Wiederholung (manuell gelöschte Blöcke bleiben gelöscht). Zusätzlich rufen die Kalender-Handler (`kalender.js` Preset-Add + alle drei .ics-Import-Pfade) direkt `materializeDay()` → neu eingetragene feste Zeit erscheint sofort in heute.
- **`planDayByPriority()`** (`fokus.js`) — deterministischer Tagesplaner **ohne KI**: baut den Tag um die festen Anchors (`todaysAnchors()`) herum; Warteschlange nach Priorität = Top-Ziel-Schritt (prio 0) + Brain-Dump (high=0/normal=2) + offene Tasks (1); füllt Lücken wake→sleep (Blöcke ≥25 min). Primärer Button „⚡ TAG NACH PRIORITÄTEN PLANEN"; KI ist optional („✦ Mit KI planen", `aiPlanDay`, greift nur mit Key).
- **API-Kosten** (Server-Secret nicht gesetzt): Modell der Edge-Function `claude-sonnet-4-6` = $3/1M Input, $15/1M Output; Haiku 4.5 = $1/$5. Typischer LifeOS-Aufruf ~1–3k Token → ~0,5–3 Cent; ein KI-Tagesplan ~2–4 Cent. Prioritäts-Planer kostet nichts (kein API-Call).

## Intuitiver + Mehrtages-Planer + Wünsche (SW `los-v21`)

- **Audit**: alle 13 Views + Fokus/Ich/Wachstum-Subtabs + Overlays (Kalender/Notizen/Settings/Daily) rendern fehlerfrei; keine JS-Fehler.
- **Hinzufügen-Buttons nach oben**: `tasks.js` (Eingabe direkt unter Fortschritt statt am Listenende) und `ich.js` Ziele („＋ NEUES ZIEL" oben im Panel). Log/Vitals hatten Add bereits über der Liste.
- **Mehrtages-Planer** (`fokus.js`): Pläne sind per-Tag (`los_plan_<toDateString>`). `getPlan(dateStr)`/`savePlan(p,dateStr)` **default = heute** (alle Nicht-Planer-Aufrufer bleiben auf heute). `let PLAN_DATE`/`planDate()` steuert nur den Planer. Datums-Leiste (Heute + 6 Tage) oben in `renderPlanner`; „JETZT"-Karte + Auto-Materialize nur an `today()`, Zukunftstage zeigen „PLAN FÜR …". Alle Planer-Aktionen (`nextFreeStart`, `addBlock`, `editBlock`, `planDayByPriority`, `aiPlanDay`, Block-Toggle/leeren, Brain-Dump, Wecker) threaden `planDate()`/`ds`. `getCurrentBlock` fix auf `today()`. `anchorsForDate(d)` in `kalender.js` (todaysAnchors = anchorsForDate(heute)); `materializeDay(dateStr)`. `navTo` setzt `PLAN_DATE=null` beim Verlassen von fokus. **Verifiziert**: Block an „Morgen" landet in Morgen-Key, heute unberührt.
- **Wünsche-Reiter** (`ich.js`, Tab WÜNSCHE zwischen ZIELE/WERTE): keine Ziele, sondern wants (kaufen/machen/erleben) mit Kosten (€), Bedingung (z.B. „wenn 5.000€ gespart") und Warum. Store `los_wants` = `[{id,text,type,cost,cond,why,got}]`. `openAddWunsch`-Overlay + Karten mit „✓ Erfüllt"-Toggle. `fmtEur` nutzt `eur()` wenn vorhanden.

## 3 neue Kurse + Lebensmittel + Standard-Ordner (SW `los-v22`)

- **Kurrikulum jetzt 13 Kurse / 216 Kapitel**: neu `m10` Content Creation (13 Kap.), `m11` Gedankenpalast (12), `m12` Luzides Träumen (12). Markdowns `Kurs-10/11/12-*.md` in `src/kurse/`, in `lifeos-kurse.json` mit vollen Metadaten + `kapitel[]` (nr/titel/kern/checks). Kern & Kontrollfragen wurden per Skript aus den `> **…**`-Prinzipien und `### ✅`-Zeilen der Markdowns extrahiert (Skript-Muster für weitere Kurse wiederverwendbar). In `reihenfolge.pfad` angehängt (m10/m11/m12); `lernpfad`: m10 phase1 gelb + phase2 grün, m11/m12 phase1 grün. Build-Slicer mappt 216/216, 0 fehlend.
- **Lebensmittel**: `FOODS` in `02-constants.js` von 6 → 31 (ganze, unverarbeitete: Protein/Carbs/Gemüse/Obst/Fette). `getFoods()` = eigene (`los_foods`) + FOODS.
- **Standard-Log-Ordner**: `LOG_DEFAULT_FOLDERS` in `log.js` (Arbeit/Deep Work·Meetings·Admin, Lernen/Kurse·Lesen, Körper/Training·Essen·Schlaf, Freizeit/Social·Scrollen); `getLogFolders()` liefert Defaults bis der Nutzer eigene hat.

## Bugfixes + Ordnung + Anpassbarkeit (SW `los-v23`)

- **Bug Ich-Reiter-Sprung**: `ICH_TAB` merkt aktiven Sub-Tab in `ich.js` → Aktionen in Wünsche/Werte springen nicht mehr auf ZIELE zurück.
- **Bug Schlaf-Ring**: Schlaf-Ziel jetzt in `getCfg()` (`sleepGoal`, Default 7.5), exakt gerechnet (6,5h/7,5h = 87 %, nicht mehr „voll"), in `editGoals` einstellbar; Home-Körper + Vitals-Ring nutzen `cfg.sleepGoal`.
- **Level langsamer + Verfall**: `LEVELS` 15 Stufen mit viel höheren Schwellen (02-constants.js), `getLvl`-Fallback korrigiert. Neu `decayXP()` (helpers) — 25 XP pro verpasstem Tag, `los_last_active`, Aufruf in `startApp`. „Use it or lose it".
- **Tasks in Ordner + Suche** (`tasks.js`): optionales `cat`-Feld, 📁-Button je Task, gruppierte einklappbare `<details>` je Kategorie (Reorder pro Gruppe), Suchfeld ab ≥6 Tasks; Add bleibt oben.
- **Ernährung geordnet + Menge** (`vitals.js` + `FOODS` in constants): `cat` an allen Lebensmitteln (Protein/Carbs/Gemüse & Obst/Fette & Nüsse + „Eigene"), Suchfeld, einklappbare Kategorie-Gruppen; Tap → `openFoodQty` Mengen-Overlay (×0,5/1/1,5/2/3 + frei) mit Live-Makro-Vorschau.
- **Wünsche nach Priorität** + `ZIEL_PRIOS`-Chips in `openAddWunsch`, Sortierung + Badge; **„→ Zu Wünschen"** auf Ziel-Karten verschiebt ein Ziel in die Wünsche.
- **Safe-Area**: `.overlay-inner` padding-top mit `env(safe-area-inset-top)` → „← Zurück" nicht mehr unter Notch/Dynamic Island.
- **Aufgeschoben (Public-Phase, Backend nötig)**: Premium-mit-Verifikation. In [[future-public-launch]] vermerkt.

## Ringe · Abwählen · Suche · Ernährungsplan (SW `los-v23`, 2. Batch)

- **Home-Ringe neu** (`home.js`): statt verschachtelter Apple-Ringe („Teil eines Teils") jetzt **3 einzelne Gauges** nebeneinander (Körper/Aufgaben/Geist), jeder mit eigener % im Zentrum + Gesamt-% in der Kopfzeile. `progressRing()` je Bereich.
- **Alles jederzeit abwählbar**: Quests-Habits (Tap auf erledigt → XP via `subXP()` zurück), Supplements (✓ antippen = un-take). Recovery/Micro waren schon toggelbar. Neuer Helper `subXP(n,cat)` in helpers (combofrei, floor 0).
- **Intelligente Suche in JEDEM Bereich**: Tasks + Ernährung (schon), jetzt zusätzlich **Ziele** (Text/Warum/Teilschritte, ab 5 Zielen), **Log** (Text+Ordner, ab 6 Einträgen), **Kurse** (Kurrikulum+eigene+Leitfäden, blendet Kontext aus, `_d0` merkt Original-Display).
- **Ernährungsplan** (`vitals.js`): `los_mealplan` mit Slots Frühstück/Mittag/Abend/Snack, Food-Picker-Overlay (`openPlanPicker`), je Item „→ loggen" + „Ganzen Slot loggen", geplante kcal/P im Header. Getrennt vom Mengen-Picker.

## Freies Drag · Log-Ordner · Erledigte nach unten (SW `los-v23`, 3. Batch)

- **Drag komplett neu** (`ui/07-sortable.js`): `makeSortable` reihenfolgt jetzt per Mittelpunkt-Scan aller Zeilen → man kann ein Item in EINER Bewegung an jede Position ziehen (ganz oben/unten, mehrere Slots), nicht mehr nur eins runter. Zusätzlich Auto-Scroll am Viewport-Rand (`el('content')`) für lange Listen. Verifiziert: 1→5 und 5→1 in einem Move.
- **Log endlich mit Ordnern** (`log.js`): Timeline gruppiert in einklappbare `<details>` je Top-Level-Ordner (mit Anzahl + Summe Min), „Ohne Ordner" zuletzt; beim Suchen flache Liste. Neu: 📁-Button je Eintrag verschiebt ihn nachträglich in einen anderen Ordner.
- **Erledigtes rutscht nach unten** (stabile Sortierung): Tasks (`sinkDone`), Ziele (je Horizont), Quests-Gewohnheiten. Wünsche waren schon (erfüllt → unten).
- **Freies Verschieben** über Wünsche hinaus: Ziel-Karte hat jetzt „⇄ Horizont" (kurz→mittel→lang durchschalten) zusätzlich zu „→ Zu Wünschen".
- **Wünsche + Supps gruppiert** (SW `los-v23`, 4. Batch): Wünsche in einklappbare Prioritäts-Gruppen (Hoch/Mittel/Niedrig, nur bei >1 Gruppe); Supplements in einklappbare Tageszeit-Gruppen (🌅 Morgen/☀️ Mittag/🌙 Abend) mit erledigt-nach-unten; Recovery erledigt-nach-unten.

## Skill-Tree-Bereich (SW `los-v23`, 5. Batch) — NEU

- Neuer Screen `src/screens/skills.js` (`renderSkills`), eingehängt unter **Wachstum** (Karte „🌳 Skill-Tree"). Registriert in 00-render.js, index.html (`s_skills`), nav.js `CHILD_HUB.skills='wachstumhub'`, wachstum.js Hub-Karte.
- Datenquelle: die beiden vom Nutzer gelieferten HTMLs (`skill-tree-detailliert.html` + `kurs-builder.html`, in `%TEMP%`). Der komplette Tree (`SKILL_TREE`) ist als Konstante embedded: **9 Phasen, 64 Skills**, je Skill note/core/lvl(L1-L3)/step.
- Features: Status je Skill (Offen→Lernen→Anwenden→Beherrscht, `los_skill_status`, +XP, synced), Gesamt-Ring + Zähler, Phasen als einklappbare `<details>`, Suche, Filter (Alle/Offen/Aktiv/Beherrscht). Pro Skill aufklappbar: Kernbausteine, Stufenleiter (je Stufe „✦ Kurs" → `openAICourse(prefill)`), erster Schritt, Aktionen „🌱 Schritt → Heute" (addNN + Plan) und „◇ Als Ziel" (mit L1-L3 als Teilschritte).
- `openAICourse(prefill)` nimmt jetzt optionales Prefill-Thema (kurse.js).

## Manifestier-Tool + Gehirn-Modul (SW `los-v24`) — NEU

- Neuer Screen `src/screens/manifest.js` (`renderManifest`), unter **Wachstum** (Karte „✨ Manifestieren"). Registriert in 00-render.js, index.html (`s_manifest`), nav.js `CHILD_HUB.manifest='wachstumhub'`, wachstum.js Hub-Karte.
- Quelle der Anforderung: Nutzer wollte ein praktisches Manifestier-Tool (nicht „sei es einfach") + ein Gehirn-Modul für die Kurse.
- Features (alle offline nutzbar): **Identität** („Ich bin jemand, der…"), **„Reiche Version → Jetzt-Version"** (kostenlose Variante des Zielverhaltens, je Brücke „🌱 Heute tun" → `skillToToday`/`addNN`), **3-Min-Verkörperung** (`openEmbodiment`, geführter Timer, +XP mind), **Beweis-Log** (RAS/Bestätigung, +XP), **🧠 „Warum das funktioniert"** = `BRAIN_BITS` (RAS, Neuroplastizität, Dopamin, Amygdala, mentales Training, Verhaltensaktivierung) als einklappbare Erklärungen + Button zum vollen Kurs. `los_manifest = {identity,why,feeling,bridges[],evidence[]}`.
- **Gehirn-Kurs im Kurrikulum**: `src/kurse/Kurs-13-Das-Gehirn.md` (8 Kapitel) + m13 in lifeos-kurse.json (kern+checks aus MD extrahiert, reihenfolge.pfad ergänzt). 14 Kurse gesamt. Manifest-Tool verlinkt via `KURS_OPEN='kurr:m13'`.
- **Bestes Modell für Kurs-Bau**: `callAI(prompt,system,maxTokens,model)` nimmt optionales `model`; Konstante `BEST_AI_MODEL='claude-opus-5'` (helpers). `openAICourse`/`skillBuildCourse` fordern es an. **ABER**: Modell wird serverseitig in der Supabase Edge Function `ai` gesetzt (Source NICHT im Repo, nur deployed) — Client-`model` wirkt nur, wenn die Function es übernimmt. Anthropic-Key weiterhin nicht gesetzt → KI liefert Fehler bis Key+Function aktiviert. Siehe [[ai-cost-economics]].

## Kompaktere Screens: Einklapp-Abschnitte (SW `los-v30`)

- **Neuer Helper `section(title, key, defaultOpen)`** (`core/04-helpers.js`): liefert ein `<details class="sect">` mit `._body` zum Befüllen; merkt Auf/Zu pro `key` in `localStorage['ui_sect_'+key]` (bewusst **nicht** `los_`-Präfix → kein Cloud-Sync/Backup-Ballast). CSS `.sect`/`.sect-sum`/`.sect-chev`/`.sect-body` (Segment-Look, rotierendes Chevron) in `02-components.css`.
- **Körper/Vitals** (`vitals.js`): Tagesziele-Ringe + Wasser bleiben oben sichtbar; **Mahlzeiten, Ernährungsplan, Schlaf, Supplements, Recovery** sind jetzt eingeklappte `section()`-Blöcke (Keys `v_meals`/`v_plan`/`v_sleep`/`v_supps`/`v_recovery`). Aus ~7 langen Sektionen werden 2 sichtbare + 5 dünne Balken.
- **Aufgaben/Tagesplan** (`fokus.js`): die 3 großen „Block hinzufügen"-Preset-Karten liegen in `section('＋ Block hinzufügen', 'f_add', false)` — Plan oben bleibt kompakt.
- **Tasks** (`tasks.js`): neuer `fillList(container, arr, sortable)` — **offene** Tasks sichtbar & sortierbar, **erledigte** falten in ein eingeklapptes „✓ Erledigt · N" (pro Kategorie und flach). Kategorie-Gruppen bleiben offen, werden aber kurz.
- **Ziele** (`ich.js`): pro Ziel-Karte liegen „▶ Heute", „✎ Bearbeiten/✦ KI-Plan/📅 Alltag-Check" und „⇄ Horizont/→ Zu Wünschen" jetzt in einem eingeklappten „Aktionen & Optionen"-`<details>`. Titel, Badges, Fortschritt, Teilschritte bleiben sichtbar → halbe Kartenhöhe.
- Verifiziert im Browser: `section` + `renderVitals`/`renderTasks`/`renderPlanner`/`renderIch` rendern fehlerfrei. Erledigt damit das offene **Aufgaben-Overhaul-TODO** (kompakter/geordneter), ausgeweitet auf Körper/Tasks/Ziele.

## Anpassbarkeit, Verknüpfung, Tutorial, Einheiten (SW `los-v33`–`los-v36`)

- **Task-Ordner** (`tasks.js`): `los_task_folders` (Default `🌅 Morgen/💼 Arbeit/🏋 Training/🌙 Abend` via `getTaskFolders`). paint() gruppiert in einklappbare Ordner (auch leere), Zustand je Ordner in `ui_tfold_<k>`. 📁-Button legt neue Ordner an. Offene Tasks ohne Ordner in „◻ Offen"-Abschnitt (`fillList(..., wrapOpen)`).
- **App anpassen** (`mehr.js` `openCustomize`, MEHR → 🎛): Einheiten metrisch/imperial (`los_cfg.units`), Sektionen an/aus (`los_modules`, `MODULES`-Registry + `moduleOn(key)` in helpers; gated in vitals `v_meals/v_plan/v_sleep/v_supps/v_recovery` und fokus `f_add/f_opt/f_vows`), Task-Ordner-Manager (add/rename/delete/reorder, zieht Tasks mit). Erststart öffnet es nach dem Tutorial.
- **Task ↔ Körper verknüpft** (`tasks.js`): Task-Feld `link` (`water/protein/kcal/sleep`), `taskLinkInfo()` liest Körper-Ziel vs. Ist, `taskDone(t)` = bei Link abgeleitet (kein Doppel-Tracking). `detectTaskLink()` verknüpft „Trinken/Protein/Schlaf…" beim Anlegen automatisch; ⛓/🔗-Button pro Task zum manuellen Setzen. Verknüpfter Task hakt sich ab, sobald das Körper-Ziel erreicht ist, Tap springt zu Körper.
- **Tutorial** (`mehr.js` `openTutorial`, `TUTORIAL_SLIDES` 6 Slides): erklärt 5 Bereiche, Swipe-back, Einklappen, Verknüpfung, Anpassen. Erststart (Onboarding-Ende) + einmalig für Bestandsnutzer (`los_tutorial_seen`); Menüeintrag „❔ Tutorial".
- **Ein Chevron statt zwei** (`02-components.css`): natives `<details>`-Dreieck app-weit in `#content` entfernt, ein CSS-`::after`-Chevron (zu = nach oben, offen = nach unten). `sect-chev`-Spans überall entfernt.
- **Ernährung in Gramm/oz** (`vitals.js` `openFoodQty`): zusätzlich zur ×-Portion ein Gramm-Feld (Basis aus „…150g" im Namen geparst), imperial → oz (×28,35); `syncExtra()` hält × und g synchron.
- **Lebensmittel-Werte bearbeitbar** (`vitals.js` `openFoodEdit`, SW `los-v37`): ✎ pro Food-Zeile öffnet Editor für Name/Icon/kcal/P/C/F. Eigene → in `los_foods` aktualisiert; vorgegebene → Override in `los_food_overrides` (by id), `getFoods()` merged es, „↩ zurücksetzen" entfernt Override. Verifiziert: Override greift, Reset stellt Standard her.
- **Bug-Test**: alle 16 Views + 6 Overlays rendern fehlerfrei (mit echtem `initState()`/`loadDay()`); Link/Toggle/Ordner/Gramm funktional verifiziert.
- **Home respektiert Verknüpfung** (`home.js`, SW `los-v38`): „Noch offen heute" + Aufgaben-Domain nutzen jetzt `taskDone(x)` statt `getTasksDone().includes` → verknüpfte Tasks (z. B. Trinken) verschwinden dort, sobald das Körper-Ziel erreicht ist.
- **Beliebiges Datum planen** (`fokus.js` `renderPlanner`): zusätzlich zur 7-Tage-Leiste ein `<input type=date>` (min=heute) → `PLAN_DATE` auf jedes Zukunftsdatum setzbar, nicht mehr nur die Woche. Blöcke tragen weiterhin Uhrzeiten.
- **Swipe-back exakt 1 Schritt** (`ui/03-nav.js`, SW `los-v39`): Ursache fürs „mehrfach zurück" war die *native* Browser-Wischgeste UND die eigene gleichzeitig (nur im Browser-Tab). Fix: `initSwipeBack()` läuft nur noch in der installierten PWA (`display-mode: standalone`/`navigator.standalone`); Browser-Tabs nutzen die native Geste über `popstate`. Zusätzlich Cooldown in `navBack()` (400 ms, `NAV_BACK_AT`) schluckt Doppel-Auslöser (touchend+touchcancel / native+custom). Verifiziert: 2. Back in <400 ms wird geschluckt.
- **Hilfe & Feedback-Tabs** (`mehr.js`): `openHelp` (Tutorial-Button, „Mit Claude besprechen", FAQ als `<details>`), `openReport('bug'|'idea')` — Titel+Text, gespeichert in `los_feedback` + `mailto:` an `FEEDBACK_EMAIL` (tinokarmann@gmail.com). Menüeinträge: ❓ Hilfe & FAQ, 🐞 Fehler melden, 💡 Verbesserung vorschlagen. (Öffentliche Version: später an ein Backend statt mailto.)

## Aufgaben-Sektion clean + mehr Lebensmittel (SW `los-v31`/`los-v32`)

- **Lebensmittel 31 → 103** (`core/02-constants.js` `FOODS`): viel mehr ganze/natürliche Foods — Protein 31 (Fisch/Fleisch/Milch/Hülsenfrüchte), Gemüse & Obst 40, Carbs 16 (inkl. **Honig**, Ahornsirup, Buchweizen/Hirse/Naturreis/Couscous/Dinkel-Roggenbrot/Müsli), Fette & Nüsse 16. IDs f32–f104 (bestehende f1–f31 unangetastet). Erscheinen automatisch in Mahlzeiten **und** Ernährungsplan-Picker (`getFoods`).
- **Aufgaben durchgehend eingeklappt** (`section()`-Helper, SW `los-v32`): **Tagesplan** (`fokus.js`) zeigt oben nur Datumsleiste + „Jetzt"-Karte + Ablauf + einen „⚡ Priorität planen"-Knopf; darunter zwei saubere Abschnitte „＋ Block hinzufügen" (`f_add`) und „📅 Kalender, KI-Plan & Ideen" (`f_opt`, bündelt Kalender/KI-Plan-Buttons + Weckzeiten + Brain-Dump — ersetzt das alte `.glass`-„Mehr Optionen"-`<details>`). **Disziplin**: Streak + Non-Negotiables bleiben offen (das Tägliche), **Iron Vows** in Abschnitt `f_vows` eingeklappt. **Tasks**: erledigte falten in „✓ Erledigt" (schon los-v30). **Log** war bereits nach Ordnern einklappbar.
- Verifiziert: renderPlanner/Disziplin/Log/Tasks/Vitals/Ich fehlerfrei; Planner hat 2 `.sect`-Abschnitte.

## Swipe-Back-Geste + Claude-ohne-Key (SW `los-v28`)

- **iPhone-Zurück-Wischen** (`ui/03-nav.js`): Ein View-Verlauf-Stack `NAV_HIST` + `navBack()`. `navTo(view, opts)` schiebt beim Vorwärts-Navigieren den `from`-View auf den Stack **und** `history.pushState` (nur wenn `!opts.back && from !== view`); `opts.back` verhindert Doppel-Push und hängt eine `nav-back`-Klasse für die Rein-von-links-Animation an. `initSwipeBack()` hört auf `#content`-Touchevents: Start ≤30px vom linken Rand + `navCanBack()`, Richtung wird nach 8px entschieden (horizontal vs. vertikal → sonst normales Scrollen), der aktive `.screen.on` folgt dem Finger (translateX+Opacity), ein `#swipeback-hint`-Chevron reitet mit; Loslassen über Schwelle (min(120px, 30% Breite)) → `history.back()`. `initBackButton()` fängt `popstate`: offenes Overlay wird zuerst geschlossen (re-push), sonst `navBack()`; an der Wurzel re-push `root` → App wird durch Android/Browser-Zurück **nicht** verlassen. Einziger Rückweg-Kanal ist `history.back()` → `popstate` → `navBack`, dadurch bleiben Browser-Stack und `NAV_HIST` synchron. CSS: `@keyframes screen-back` + `.screen.on.nav-back` + `#swipeback-hint` in `03-animations.css`. Verifiziert: `home→vitals→fokus→skills` ⇒ Stack `[home,vitals,fokus]`, viermal zurück landet sauber bei `home` und stoppt (root=false).
- **Verlauf ist view-basiert** (keine Sub-Tab-Snapshots): robust über das Hub/Sub-Tab-Modell; zurück zu `fokus` behält den aktuellen `FOKUS_TAB`. Bewusst so gewählt statt fragiler Global-Snapshots (Caller mutieren `FOKUS_TAB` **vor** `navTo`).
- **Claude ohne API-Key** (`screens/mehr.js` → Verbindungen, oberste Sektion): `talkToClaude()` baut ein Coaching-Briefing (Intro-Prompt + `buildMarkdownExport()`, respektiert `los_ai_scopes`), kopiert es in die Zwischenablage (`navigator.clipboard`, Fallback `execCommand('copy')` via Off-Screen-Textarea) und öffnet `claude.ai/new`. Läuft über das **normale Claude-Abo** des Nutzers — kein Key, keine API-Kosten. Rückweg: Claudes Listen-Antwort über „Notizen einsortieren" importieren. Ergänzt BYOK (Key nötig) und den Edge-Function-Weg (Server-Key nötig) um einen echt keyless-Pfad.

## KI-Assistent als Macher + Sprache (SW `los-v27`)

- **Assistent führt Aktionen aus** (ui/06-assistant.js): Tool-Loop bestehend; NEU `create_course` (baut kompletten KI-Kurs → los_courses) und `add_habit` (Habit-Tracker). `runAssistantTool` ist jetzt **async** (create_course awaited callAI mit BEST_AI_MODEL).
- **BYOK im Assistenten**: `assistantFetch()` nutzt bei aktivem `los_byok` Anthropic direkt (mit Tools), sonst `aiFetch`. → Assistent läuft über eigenes Claude-Konto, Opus 5, ohne Login.
- **Berechtigungen erzwungen**: `TOOL_AREA`-Map ordnet jedes Tool einem Bereich zu; `assistantTools()` filtert gesperrte weg, `assistantContext()` lässt gesperrte Bereiche + Daten weg (+ nennt „GESPERRT: …"), und `runAssistantTool` blockt hart bei direktem Aufruf. Gesperrt = 100 % kein Zugriff.
- **Sprachfunktion**: 🎤-Button im Assistenten (`assistantVoice`) via Web Speech API (`SpeechRecognition`, de-DE) → sprechen → Text ins Feld → auto-senden. Nur HTTPS/localhost.

## ⚠️ OFFEN / NÄCHSTER SCHRITT (Nutzer-Feedback 2026-08-01)
- **Aufgaben-Bereich überarbeiten** — Nutzer: „vor allem im Aufgaben-Bereich ist alles unübersichtlich, lang, nicht geordnet". Betrifft v. a. **Tagesplan (fokus.js)** + evtl. Tasks/Log-Zusammenspiel. Ziel: kompakter, weniger Scrollen, klare Ordnung (Blöcke einklappbar, weniger vertikale Höhe, evtl. Tagesplan-Blöcke gruppiert). Das ist die Top-Aufgabe für die nächste Session.
- Nutzer erwägt neue Code-Session (frisch weiterbauen) — Stand ist vollständig in Repo + CLAUDE.md + memory/, also verlustfrei fortsetzbar.

## Reiter-Optik + Verbindungen/BYOK + Berechtigungen (SW `los-v26`)

- **Hub-Sub-Tabs neu** (`.hubbar` in 02-components.css + renderHubNav): iOS-artiges Segment-Control, **sticky** oben im Scrollbereich (Reiter bleiben beim Scrollen sichtbar), gleich breite Tabs, aktiver Tab gefüllt+gold. Löst „billig/nicht gekonnt" + „muss zu weit scrollen".
- **Habit-Karten näher an Habit-Link** (habits.js): kräftigerer Farb-Fill (`c4d→c24→c0f`), dickere gerundete Segmente (9px, Glow bei erledigt), 38px Icon-Tile, 32px Häkchen mit Glow, weißer Titel.
- **Verbindungen** (mehr.js `openConnections`): Zeile „🔗 Verbindungen".
  - **Eigenes Claude-Konto (BYOK)**: `los_byok={key,on,model}`; `callAI` ruft bei aktivem BYOK Anthropic **direkt** im Browser auf (`x-api-key` + `anthropic-dangerous-direct-browser-access:true`), sonst Edge Function. → KI läuft über Nutzer-Key, freie Modellwahl (Opus 5), keine Server-Anmeldung/kein Edge-Key nötig. Test-Button.
  - **KI-Berechtigungen**: `los_ai_scopes` (koerper/aufgaben/ziele/kurse/wissen/finanzen), Default alle erlaubt; abgeschaltete Bereiche zu 100 % gesperrt. Helper `aiScopeAllowed(area)` (helpers). Aktuell erzwungen im Markdown-Export; für künftige KI-Kontexte vorgesehen.
  - **Obsidian/Markdown-Export**: `buildMarkdownExport()` (Ziele/Wünsche/Habits/Journal/Log/Finanzen, gated by scopes) → `downloadText()` lädt `.md`. Import via „Notizen einsortieren".
- **Offen/erklärt**: echte *live* MCP-Anbindung (externer Claude schreibt in LifeOS) braucht eigenen Server → später. In-App-KI (Kurse/Assistent über BYOK) respektiert Berechtigungen.

## Habit-Tracker (Karten-Style) + Wünsche-Arten (SW `los-v25`) — NEU

- **Habit-Tracker** `src/screens/habits.js` (`renderHabits`) im HabitKit-/Habit-Link-Look (Nutzer-Screenshot als Vorlage): farbige Gradient-Karten, erste Karte volle Breite (featured) + 2-Spalten-Grid, Icon oben links, Häkchen oben rechts (heute erledigt, +10 XP / subXP), 7 Wochen-Segmente (Mo–So), 🔥-Streak, flexible Frequenz (täglich / N× pro Woche / feste Wochentage), Icon-/Farb-/Rhythmus-Editor (`openHabitEdit`). `los_habits=[{id,icon,name,color,freq,n,days:[0-6 JS getDay],history:[]}]`.
- Eingehängt im **Körper-Hub** als neuer Tab: Vitals · **Gewohnheiten** (habits) · **Quests** (altes quests umbenannt). 00-render `case 'habits'`, index.html `s_habits`, nav.js HUBS.koerper.tabs + CHILD_HUB.habits.
- **Wünsche-Arten erweitert** (ich.js): WANT_TYPES jetzt Kaufen/🔧 Tool-Tech/✈️ Reise/Erleben/Machen; `wantTypeLabel()`; Art als Badge auf der Wunsch-Karte; ART-Chips mit flex-wrap.

## Feature-Module (neu)

- **Micro-Habits** (`screens/quests.js`): winzige 1-Tap-Gewohnheiten, eigene Streak. Store `los_micro` = `[{id,icon,text,history:[dateStr]}]`.
- **Finanzen** (`screens/finanzen.js`, eigener Tab „GELD"): Einnahmen/Ausgaben, Monatssaldo, Sparziele, KI-Spar-Tipp (kein Anlage-Rat). Store `los_fin` = `{tx:[{id,amount,type:'in'|'out',cat,note,date}], goals:[{id,name,target,saved}]}`.
- **Vorbild-Kurse** (`screens/vorbilder.js`, Wachstum→Vorbilder-Subtab): Personen nennen → KI leitet Skills ab + baut Lern-Pfad (Module/Übungen); kombinierter Pfad aus allen. Store `los_vorbilder`, `los_vorbild_pfad`. Übungen → „+ Lernliste".
- **Zeit/Accountability** (`screens/fokus.js`): Tagesplan-Blöcke zyklen offen→▶läuft→✓erledigt (`b.started`/`b.done`); „Tages-Bilanz"-Karte (Zeit sinnvoll genutzt? 1–5 + getan? ja/teils/nein), Store `los_bilanz_<date>`.
- **Assistent-Tools erweitert** (`ui/06-assistant.js`): add_micro_habit, log_expense, log_income, add_role_model.
- **Nav** hat jetzt 9 Tabs (… JOURNAL, GELD, MARKT). Wenn zu eng → später Overflow/„Mehr"-Menü.
- **Vitals flexibel** (`screens/vitals.js`): eigene Mahlzeiten (Store `los_foods`, voll Makros, wiederverwendbar), eigene Supplements (`los_supps`), einstellbare Tagesziele `getCfg()`/`los_cfg` (proteinGoal/waterGoal/kcalGoal — auch in `getFScore` & Home-Stats), freie Wassermenge.
- **Tasks** (`screens/tasks.js`, eigener Tab nach HOME): täglich wiederkehrende Checkliste, Haken resetten um Mitternacht (Status pro Tag in `los_tasks_done_<date>`), Templates in `los_tasks`, pro Task Streak, umbenennen/löschen in-app, +10 XP.
- **Log** (`screens/log.js`, eigener Tab): freies Aktivitäts-Protokoll mit Zeitstempel (`los_log_<date>`), „45m" im Text wird als Dauer geparst, Tages-Summen, anpassbare Schnell-Buttons (`los_log_chips`, Bearbeiten-Modus), Gestern-Ansicht. Assistant-Tools: add_daily_task, log_activity.
- **Nav** ist horizontal scrollbar (12 Tabs), `.nav-btn` min-width 46px.
- **Stats-Dashboard** (`screens/stats.js`, Tab STATS): wertet Log-Einträge per Stichwort-Kategorien aus (`los_stat_cats`, in-app editierbar inkl. eigener Kategorien); 7-Tage-Summary, Monats-Kalender (Farbe = erfasste Minuten, Tag antippen = Detail), Tages-Detail mit Kategorie-Balken + Chips aus `los_daystat_<date>` (Schlaf/Wasser/kcal — wird von `saveDay()` in `03-state.js` als Historie geschrieben), Tasks-done & Tages-Bilanz.

## PWA / Deployment

- App ist installierbar: `src/assets/icon.svg` → PNGs via `node tools/gen-icons.mjs` (braucht `sharp`); `src/assets/manifest.webmanifest`; Links im `index.html`. `build.mjs` schreibt zusätzlich `dist/index.html` und kopiert Manifest+Icons → `dist/` ist ein deploybarer Static-Ordner (Netlify Drop o. ä.). iPhone: Safari → „Zum Home-Bildschirm".
- Hosting hier nicht angebunden (kein GitHub/Netlify-Tool). Deploy: User zieht `dist/` auf netlify.com/drop, oder gibt Token für Auto-Deploy.

## KI (Edge Function + In-App-Assistent)

- **Alle KI-Aufrufe** laufen über die Supabase **Edge Function `ai`** (`…/functions/v1/ai`, `verify_jwt=true`). Der **Anthropic-Key liegt nur als Server-Secret** `ANTHROPIC_API_KEY` (nie im Client). Modell-Default `claude-sonnet-4-6`.
- `callAI()` (`core/04-helpers.js`) → `aiFetch()` (`core/05-sync.js`, schickt den User-JWT). Damit funktionieren Home-Tipp, Ernährung, Body Fix, KI-Doc, KI-Tagesplaner, Onboarding-Plan.
- **In-App-Assistent** (`ui/06-assistant.js`): Floating-Button (`.assist-fab`) + Chat-Sheet, **Tool-Use** (add_goal, add_non_negotiable, add_task, log_water, complete_habit, add_value, add_learning, add_journal_gratitude). Nach Aktionen werden Statusbar + aktueller Screen neu gerendert. Kontext (Profil/Tagesdaten/Streak) geht im System-Prompt mit.
- **Setup-Schritt (einmalig, manuell):** Secret `ANTHROPIC_API_KEY` im Supabase-Dashboard setzen (Project Settings → Edge Functions → Secrets). Ohne Secret liefert die Function 503 „nicht konfiguriert"; der Client zeigt das sauber an.
- Vorher rief der alte Code `api.anthropic.com` direkt aus dem Browser → CORS-Block + kein Key = „Failed to fetch". Das war die Haupt-Ursache der „leeren/unvollständigen" KI-Felder.

### Behobene Bugs (Stil/Funktion)
- **Leere Buttons/Felder app-weit:** `h(tag, {textContent:'x'}, '')` — das leere `''` als 3. Arg setzte `innerHTML=''` und löschte den Text. Fix in `core/04-helpers.js`: `if (html)` statt `if (html !== undefined)`. Damit zeigen Speichern/`+`/`✓`/`×`/Wasser-Buttons/FAB(✦)/Schlaf-Sterne wieder Inhalt. (`div()` war nie betroffen, nutzt schon `if(inner)`.)
- **Vitals-Schlaf:** Qualitäts-Sterne neu als sichtbare ★/☆ (blau/grau), Speichern-Button normal — vorher unsichtbar.
- **Premium/Tiefe:** Karten/Zeilen/Buttons mit dezentem Vertikal-Verlauf + Lichtkante + weichem Schatten (3D-Anmutung), runder (20px), bei vollem Kontrast.

### Build-Fallstricke (in `build.mjs` behoben)
1. **`$`-Bug:** Injektion via `String.replace(marker, code)` interpretierte `$'`,`$&`,`$\``,`$$` im Code als Sonderzeichen (z. B. `'63.808 $'` in `markt.js` zerschoss das Bundle). Fix: Replacer-**Funktion** (`() => code`).
2. **Run-Guard:** `file://${argv}`-Vergleich matchte nie auf Windows (`file:///C:/…`). Fix: `pathToFileURL(process.argv[1]).href`.
3. Dev-Server (`dev.mjs`) hat eine chokidar-Race (Rebuild während Schreiben → kurzzeitig abgeschnittene `dist`); nach Bedarf Server neu starten.

## Bereits erledigt

- ✅ Projekt-Skelett (`package.json`, `build.mjs`, `dev.mjs`)
- ✅ Neues Design-System (`src/styles/01-base.css`, `02-components.css`, `03-animations.css`)
- ✅ Core-Module: `01-storage.js`, `02-constants.js`, `03-state.js`, `04-helpers.js`
- ✅ UI: `01-toast.js`
- ✅ HTML-Shell mit Inject-Markern (`src/index.html`)
- ✅ Build-Manifest (`src/manifest.json`)

## Migration abgeschlossen (Juni 2026)

Die komplette `LifeOS.html` ist nach `src/` migriert. `npm run build` erzeugt ein lauffähiges `dist/LifeOS.html` (~166 KB). Verifiziert im Browser: alle 7 Screens, Overlays und Onboarding rendern fehlerfrei, keine Konsolenfehler.

**Wo liegt was (geteilte Logik):**
- **Discipline Engine + Day Planner** (`getDiscState`, `getNN`, `bumpStreak`/`breakStreak`, `getPlan`, `getCurrentBlock`, `aiPlanDay` …) → `screens/fokus.js`.
- **Achievements**: Daten (`ACH`, `ACH_IC`) + `INTEL_SECTIONS`/`BODYFIX_QUICK` → `core/02-constants.js`; `getUnlocked`/`checkAchievements` + der wiederverwendbare `aiBlock()` → `core/04-helpers.js`. `addXP` (in `ui/01-toast.js`) ruft jetzt `checkAchievements()`.
- **Daily Challenge** (`getDC`/`completeDC`) → `screens/home.js`. **Fix:** `getDC` hängt die `chk`-Funktion beim Laden neu an (localStorage kann keine Funktionen speichern — Original crashte beim 2. Home-Render).
- **Navigation** läuft jetzt entkoppelt über `navTo(view)` in `ui/03-nav.js` (Buttons im Markup ohne `onclick`, Handler via `initNav()`); `nav(elOrName)` bleibt als Kompat-Alias.
- Funktions-Hoisting macht die Build-Reihenfolge (`99-init.js` vor `fokus.js` etc.) unkritisch.

**Design-Politur (Glasmorphismus sichtbar gemacht):** Der erste Wurf wirkte flach, weil (a) der Hintergrund fast schwarz war — `backdrop-filter`-Blur hat dann nichts zum Brechen — und (b) die Tint-Modifier (`glass-accent/-hi/-danger/-success`) als reine Overrides gedacht waren, aber oft **allein** genutzt wurden, sodass Blur/Padding/Radius fehlten. Behoben in `styles/01-base.css` + `02-components.css`:
- `body` (App-Säule) hat jetzt gold/blau/violette Farb-Blooms als Gradient + die `.ambient`-Glows sind kräftiger (inkl. dritter Bloom via `.ambient::after`) → Frostglas hat echte Farbe dahinter.
- Die Glas-Tint-Klassen teilen sich jetzt eine gemeinsame Basis (`.glass, .glass-hi, .glass-accent, …`) und funktionieren eigenständig.
- Glasflächen heller + gerichteter Sheen-Gradient, Borders/Inner-Edge-Highlights kräftiger, tiefere Schatten (`--shadow-*`), mehr Blur-Sättigung. Auf einem echten Handy (430px ohne Ränder) füllen die Blooms die Säule stärker als im Desktop-Preview.

## Neuer Screen: MARKT (Kapital-Radar) — Juni 2026

Achter Screen `screens/markt.js` (`renderMarkt`) — ein Markt-/News-/Insider-Monitor mit täglichem Morgen-Briefing. Verdrahtet in `index.html` (Nav-Button `data-view="markt"`, Icon `↗`, + `<div id="s_markt">`) und `screens/00-render.js` (`case 'markt'`).

**Datenmodell:** Alle Inhalte stehen im Objekt `MARKT_DATA` (oben in `markt.js`) — ein **recherchierter Schnappschuss** (Feld `.asOf`). `getMarkt()` bevorzugt einen localStorage-Override `los_markt`, fällt sonst auf `MARKT_DATA` zurück.

**Briefing aktualisieren (manuell, auf Wunsch des Nutzers):** Claude recherchiert frisch im Web (Indizes, Krypto, Sektor-Rotation, Insider-Form-4, Analysten, Aussagen einflussreicher Personen, News) und ersetzt das `MARKT_DATA`-Objekt in `markt.js`, inkl. `asOf`/`updated` und `sources`. Danach Build reproduzieren (siehe unten). Quellen immer mit angeben.

**Watchlist:** `los_watch` (Default `['NVDA','XOM','WMT']`). Optional Live-Kurse über Finnhub — Key in `los_finnhub`, Endpoint `finnhub.io/api/v1/quote`. Ohne Key bleiben die Kurse als „—".

**Wichtig — h()-Falle:** `h(tag, attrs, html)` setzt `innerHTML` NACH den Attributen. Wird `''` als 3. Argument übergeben, löscht es ein über `textContent` gesetztes Label wieder. Für Buttons/Links mit `textContent` daher das 3. Argument **weglassen** (`h('button', {textContent:'…'})`).

## Build ohne Node (diese Maschine)

`npm` läuft hier nicht. Build von `build.mjs` per PowerShell reproduzieren: Template `src/index.html` lesen, `styles/*.css` (alphabetisch) → `/*<!--INJECT_CSS-->*/`, dann `core/*.js` + `ui/*.js` + `screens/*.js` (alphabetisch) → `//<!--INJECT_JS-->`, als UTF-8-ohne-BOM nach `dist/LifeOS.html` schreiben. Preview: `py -m http.server 5179 --directory …/dist` (Config `lifeos-static-preview` in `.claude/launch.json`), Seite `/LifeOS.html`.

## Migrations-Checkliste (alles erledigt ✅)

### Phase 1: UI-Bausteine migrieren
Aus `LifeOS.html` extrahieren und in `src/ui/` packen:

- [x] `02-statusbar.js` — Top-Statusleiste mit Avatar, Level-Bar, Streak, Focus-Ring. **Neu**: glasmorphes Design, sanfter Schatten, kein hartes Border-Bottom. Statt SVG-Ring evtl. Conic-Gradient-Ring.
- [x] `03-nav.js` — Bottom-Navigation. **Neu**: glasmorpher Floating-Bar mit Backdrop-Blur. Active-State mit sanftem Glow.
- [x] `04-overlay.js` — `openOverlay()`, `closeOverlay()`, `showSettings()`. **Neu**: Sheet-Animation von unten, glasmorpher Backdrop, Backdrop-Klick schließt.
- [x] `05-onboard.js` — Onboarding-Flow (4 Seiten). **Neu**: `renderOnboard()` injiziert das Markup; Fade-Übergänge, Glas-Option-Cards, Progress-Dots.

### Phase 2: Screens migrieren
Jeden Screen aus der alten `renderXxx()`-Funktion in eine eigene Datei:

- [x] `home.js` — Dashboard mit Current-Block, Non-Negotiables-Preview, Stats-Grid, Daily Challenge
- [x] `fokus.js` — **wichtigster neuer Screen**: Streak-Card, Non-Negotiables, KI-Tagesplaner mit Time-Blocks, Iron Vows, Abendliche Abrechnung. Code-Basis: `renderFokus`, `openAddVow`, `openEveningReview`, `aiPlanDay`, `getDiscState`, `getPlan` etc.
- [x] `quests.js` — Tages-Habits per Kategorie
- [x] `vitals.js` — Makros, Wasser, Food, Schlaf, Supplements, Recovery
- [x] `intel.js` — Wissens-Sektionen + Body Fix + KI-Doc
- [x] `ich.js` — Ziele, Werte, Gewohnheiten, Erfolge
- [x] `wachstum.js` — Journal + Lernen

### Phase 3: Render-Engine + Init
- [x] `src/screens/00-render.js` — `renderScreen(viewName)` Dispatch
- [x] `src/screens/99-init.js` — `boot()` (nutzt `initState()` aus `03-state.js`), Service-Worker via `registerSW()`, 60s-Re-Render-Loop, Evening-Review-Trigger

## Wichtige Regeln bei der Migration

1. **localStorage-Keys NIE ändern** — sonst verliert der User alle Daten. Alle Keys beginnen mit `los_`.
2. **Discipline Engine + Day Planner unverändert lassen** — Logik ist bewährt, nur Styling neu.
3. **Nur Styling modernisieren** — alte Klassen wie `card`, `card-hi`, `btn-gold` durch neue ersetzen:
   - `card` → `glass`
   - `card-hi` → `glass-hi` oder `glass-accent`
   - `btn-gold` → bleibt, hat aber neues Styling
   - Inline-styles mit harten Farben durch CSS-Variablen ersetzen (`--gold`, `--t-1`, etc.)
4. **Animationen nutzen** — `anim-fade-up`, `anim-spring`, `stagger` für Listen, `anim-pulse-glow` für aktive Time-Blocks.
5. **Konsistente Spacing** — Cards haben 16px padding, Lists 12px gap.

## Empfohlene Reihenfolge

```
1. UI-Bausteine (statusbar, nav, overlay)
2. home.js (zum Testen der Render-Engine)
3. fokus.js (priorität, da kernfeature)
4. quests.js
5. vitals.js
6. ich.js
7. wachstum.js
8. intel.js (am komplexesten, hat 3 Sub-Tabs)
9. onboard.js
10. init.js
```

Nach jedem Screen: `npm run dev` läuft schon, einfach im Browser refreshen und visuell prüfen.

## Tests

Keine automatisierten Tests. Manuelles Testen über Live-Preview:
- Desktop: http://localhost:5173
- iPhone (gleiches WLAN): http://[lokale-ip]:5173

## Bei Fragen

Wenn du als Claude Code im Zweifel bist: schau in die alte `LifeOS.html` für die genaue Logik, aber bleib beim neuen Styling. Das Verhalten soll identisch sein.
