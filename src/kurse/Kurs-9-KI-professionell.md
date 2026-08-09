# KURS 9: KI PROFESSIONELL NUTZEN

### Vom Fragensteller zum Werkzeugbauer
*16 Kapitel · Stand Juli 2026*

---

> ⚠️ **Hinweis zur Haltbarkeit:** Dieser Kurs beschreibt bewusst überwiegend **Prinzipien**, nicht Produkte. Modelle, Preise und Funktionen ändern sich alle paar Monate — die Mechanik dahinter kaum. Wo konkrete Werkzeuge genannt sind, prüf den aktuellen Stand selbst. Kapitel 16 ist genau dafür da.

---

## Inhalt

**TEIL I — WIE ES FUNKTIONIERT**
1. [Was ein Sprachmodell tut — und was nicht](#1-was-ein-sprachmodell-tut)
2. [Kontext ist alles](#2-kontext-ist-alles)
3. [Warum dieselbe Frage verschiedene Antworten bekommt](#3-verschiedene-antworten)

**TEIL II — DAS HANDWERK**
4. [Frage vs. Auftrag](#4-frage-vs-auftrag)
5. [Die fünf Bausteine eines guten Auftrags](#5-die-fünf-bausteine)
6. [Beispiele schlagen Erklärungen](#6-beispiele-schlagen-erklärungen)
7. [Iteration: der zweite Prompt ist der bessere](#7-iteration)
8. [Struktur erzwingen](#8-struktur-erzwingen)

**TEIL III — VERLÄSSLICHKEIT**
9. [Halluzination verstehen und einplanen](#9-halluzination)
10. [Wo KI verlässlich ist und wo nicht](#10-wo-verlässlich)
11. [Prüfstrategien](#11-prüfstrategien)

**TEIL IV — ANWENDUNG**
12. [KI beim Programmieren](#12-ki-beim-programmieren)
13. [KI im Geschäft](#13-ki-im-geschäft)
14. [Vom Chat zum Workflow](#14-vom-chat-zum-workflow)

**TEIL V — GRENZEN**
15. [Recht, Vertraulichkeit, Verantwortung](#15-recht-und-verantwortung)
16. [Die Kompetenzfalle — und wie du am Ball bleibst](#16-die-kompetenzfalle)

---
---

# TEIL I — WIE ES FUNKTIONIERT

## 1. Was ein Sprachmodell tut

### Das mentale Modell, das trägt

Ein Sprachmodell sagt, vereinfacht gesagt, **immer wieder den nächsten Textbaustein voraus** — auf Basis dessen, was vorher steht. Es hat kein Nachschlagewerk im Kopf, keine Datenbank, in der es nachsieht, und keine Absicht.

**Warum das praktisch wichtig ist:** Es erklärt die zwei wichtigsten Eigenschaften auf einmal.

| Eigenschaft | Folgt daraus |
|---|---|
| Es ist **erstaunlich gut in Sprache und Struktur** | weil das genau die Aufgabe ist |
| Es **erfindet plausible Details** | weil plausibel und wahr für die Vorhersage dasselbe aussehen |

> **Merksatz: Es optimiert auf „klingt richtig", nicht auf „ist richtig". Meistens fällt das zusammen. Manchmal nicht — und genau dann merkst du es am schlechtesten.**

### Was daraus folgt

- Es kann sehr gut **umformen, strukturieren, erklären, vergleichen, entwerfen**
- Es ist unzuverlässig bei **exakten Fakten, Zahlen, Zitaten, Quellen**
- Es hat **kein Gedächtnis** über eine Unterhaltung hinaus, außer man gibt ihm eins
- Es **weiß nicht, was es nicht weiß** — Unsicherheit sieht genauso aus wie Sicherheit

### Der wichtigste Unterschied zu einer Suchmaschine

```
Suchmaschine:  findet, was jemand geschrieben hat
Sprachmodell:  erzeugt, was jemand geschrieben haben könnte
```

**Deshalb: Für Fakten → Suche (oder Modell mit Websuche). Für Denken, Formulieren, Strukturieren → Modell.**

Wer das verwechselt, bekommt sehr überzeugend formulierten Unsinn.

---

## 2. Kontext ist alles

### Der einzige Hebel, den du wirklich hast

> **Die Qualität der Antwort hängt fast vollständig davon ab, was im Kontext steht — nicht davon, wie höflich oder clever du fragst.**

Der **Kontext** ist alles, was das Modell gerade sieht: deine Nachricht, die bisherige Unterhaltung, angehängte Dateien, Systemanweisungen.

**Das ist die eine Erkenntnis, die Anfänger von Fortgeschrittenen trennt:**

```
❌ Anfänger:  denkt über die Formulierung nach
✅ Profi:     denkt darüber nach, welche Information fehlt
```

### Der Test vor jedem Prompt

> **Könnte ein fremder, kompetenter Mensch mit genau diesen Informationen die Aufgabe lösen?**

Wenn nein, fehlt Kontext — und keine Formulierungskunst der Welt gleicht das aus.

| Fehlt oft | Beispiel |
|---|---|
| **Zielgruppe** | „für einen Kunden" vs. „für einen Meister, der wenig Zeit hat" |
| **Zweck** | wofür wird das gebraucht |
| **Randbedingungen** | Länge, Ton, was auf keinen Fall vorkommen darf |
| **Vorwissen** | was du schon versucht hast |
| **Beispiele** | wie das Ergebnis aussehen soll |
| **Rohmaterial** | die tatsächlichen Daten, statt einer Beschreibung davon |

### Die häufigste vertane Chance

Menschen beschreiben etwas, statt es anzuhängen.

```
❌ „Ich hab eine Fehlermeldung, dass eine Variable nicht definiert ist"
✅ [komplette Fehlermeldung + relevanten Code einfügen]

❌ „Schreib mir einen Text im Stil meiner anderen Texte"
✅ [drei eigene Texte einfügen] + „schreib im selben Stil"
```

> **Mehr rohes Material schlägt jede Beschreibung.** Das Modell ist gut darin, aus Material zu extrahieren — und schlecht darin, zu raten, was du meinst.

---

## 3. Warum dieselbe Frage verschiedene Antworten bekommt

### Die drei Gründe

**1. Zufall ist eingebaut.** Die Ausgabe ist nicht deterministisch. Dieselbe Frage kann leicht unterschiedliche Antworten liefern. Das ist gewollt, nicht kaputt.

**2. Der Kontext ist nie derselbe.** In einer laufenden Unterhaltung sieht das Modell alles Vorherige. Dieselbe Frage in einem neuen Chat ist eine andere Frage.

**3. Kleine Formulierungsunterschiede verschieben viel.** „Erklär mir X" und „Erklär mir X für jemanden ohne Vorwissen" führen zu deutlich verschiedenen Antworten.

### Was du daraus machst

| Erkenntnis | Praxis |
|---|---|
| Zufall ist eingebaut | Bei wichtigen Sachen **mehrfach fragen** und vergleichen |
| Kontext bleibt hängen | Bei Themenwechsel **neuen Chat** anfangen |
| Alte Fehler bleiben im Kontext | Wenn es sich festgefahren hat: **neu starten**, nicht weiterdiskutieren |

> **Der Neustart-Trick:** Wenn ein Chat in eine falsche Richtung gelaufen ist, korrigier nicht endlos. Fang neu an und pack die richtige Information gleich rein. Ein verunreinigter Kontext lässt sich schlecht wieder säubern.

---
---

# TEIL II — DAS HANDWERK

## 4. Frage vs. Auftrag

### Der Unterschied, der die Qualität verdoppelt

```
FRAGE:   "Wie schreibe ich ein gutes Angebot?"
         → allgemeine Antwort, die du schon kanntest

AUFTRAG: "Schreib ein Angebot für [Kunde], für [Leistung],
          Preis [X], Lieferzeit [Y]. Ton: sachlich, kein Marketing-
          Sprech. Maximal eine Seite. Hier ist ein früheres
          Angebot als Stilvorlage: [...]"
         → brauchbares Ergebnis
```

**Fragen führen zu Wikipedia-Antworten. Aufträge führen zu Arbeit.**

### Die Faustregel

> **Wenn du die Antwort auch hättest googeln können, war es eine Frage. Nutze das Werkzeug für Dinge, die es nur für dich geben kann.**

---

## 5. Die fünf Bausteine

Ein guter Auftrag enthält fünf Dinge. Nicht immer alle — aber je wichtiger die Aufgabe, desto vollständiger.

```
1. ROLLE / PERSPEKTIVE   → aus wessen Sicht
2. AUFGABE               → was genau soll entstehen
3. KONTEXT / MATERIAL    → alles, was es wissen muss
4. FORMAT                → wie soll das Ergebnis aussehen
5. EINSCHRÄNKUNGEN       → was NICHT
```

### Baustein für Baustein

**1. Rolle** — wirkt weniger als oft behauptet, aber sie setzt den Kontext.
> „Du bist ein erfahrener Werkstattleiter, der Angebote prüft."

**2. Aufgabe** — das Verb entscheidet. *Schreib, prüfe, vergleiche, kürze, kritisiere, strukturiere.*
> „Prüfe dieses Angebot auf Lücken, aus Sicht des Kunden."

**3. Kontext** — siehe Kapitel 2. Der größte Hebel.

**4. Format** — sag es, sonst rät es.
> „Als Tabelle mit drei Spalten." / „Maximal 200 Wörter." / „Als Fließtext ohne Aufzählungen."

**5. Einschränkungen** — ⭐ der am meisten unterschätzte Baustein.
> „Keine Floskeln. Keine Einleitung. Wenn du etwas nicht weißt, schreib das hin, statt zu raten."

### Der Negativ-Trick

**Zu sagen, was du NICHT willst, ist oft wirksamer als zu sagen, was du willst.**

```
"Schreib den Text.
 NICHT: Marketing-Sprache, Superlative, 'in der heutigen Zeit',
        Aufzählungen, Fragen an den Leser, Emojis."
```

Damit schneidest du die Standardmuster ab, die sonst automatisch kommen.

---

## 6. Beispiele schlagen Erklärungen

### Das wirksamste einzelne Werkzeug

> **Ein Beispiel für gewünschtes Ergebnis ist mehr wert als drei Absätze Beschreibung.**

Der Grund liegt in Kapitel 1: Das Modell ist darauf ausgelegt, Muster fortzusetzen. Ein Beispiel *ist* ein Muster. Eine Beschreibung muss erst in eins übersetzt werden — und dabei geht viel verloren.

### Die Formen

**Ein Beispiel (One-Shot):**
```
So soll es aussehen:
[Beispiel]

Mach jetzt dasselbe für: [neue Eingabe]
```

**Mehrere Beispiele (Few-Shot):** ⭐ deutlich stärker
```
Eingabe: A  →  Ausgabe: X
Eingabe: B  →  Ausgabe: Y
Eingabe: C  →  Ausgabe: ?
```

**Gegenbeispiel:** ⭐⭐ am wirksamsten
```
GUT:     [Beispiel]
SCHLECHT:[Beispiel]  — und zwar weil [Grund]
```

**Das Gegenbeispiel-Paar ist der stärkste Hebel überhaupt**, weil es die Grenze zeigt, nicht nur die Richtung.

### Woher du die Beispiele nimmst

**Aus deiner eigenen Arbeit.** Drei deiner besten Angebote, drei Nachrichten, die funktioniert haben, ein Stück Code in deinem Stil. Das ist Material, das nur du hast — und es ist genau das, was aus generischen Ergebnissen deine macht.

> **Leg dir einen Ordner mit Vorlagen an.** Deine besten Beispiele, gesammelt. Das ist die persönlichste und wertvollste Sammlung, die du im Umgang mit KI aufbauen kannst.

---

## 7. Iteration

### Der Denkfehler des perfekten Prompts

Anfänger versuchen, den perfekten Prompt zu formulieren und sind enttäuscht, wenn das Ergebnis nicht stimmt.

> **Profis planen von vornherein mit zwei bis vier Runden.** Der erste Durchgang ist ein Entwurf, kein Ergebnis.

### Die Iterationsschleife

```
1. Erster Auftrag, grob
2. Ergebnis lesen — was fehlt konkret?
3. Nachschärfen: "Gut, aber X ist zu allgemein. Mach X konkreter,
   mit einem Beispiel aus [Bereich]."
4. Wiederholen
```

### Die Nachschärf-Formeln, die funktionieren

| Ziel | Formulierung |
|---|---|
| Konkreter | „Das ist zu allgemein. Gib für jeden Punkt ein konkretes Beispiel." |
| Kürzer | „Streich alles, was ein Fachmann schon weiß." |
| Kritischer | „Was spricht dagegen? Nenn die drei stärksten Gegenargumente." |
| Tiefer | „Geh bei Punkt 3 eine Ebene tiefer. Warum ist das so?" |
| Ehrlicher | „Wo bist du dir unsicher? Markier das." |

### ⭐ Der Kritik-Trick

**Lass das Modell seine eigene Arbeit auseinandernehmen:**

> „Kritisier deinen eigenen Entwurf. Was ist schwach, was fehlt, was ist Floskel? Sei streng."

Das funktioniert überraschend gut — die zweite Runde ist fast immer besser als die erste. **Der Grund:** Etwas zu bewerten ist eine andere Aufgabe als es zu erzeugen, und bei der Bewertung fallen Schwächen auf, die beim Erzeugen nicht aufgefallen sind.

### Die Rückfrage-Technik

Statt selbst zu raten, was du vergessen hast:

> „Bevor du anfängst: Stell mir die drei Fragen, deren Antworten das Ergebnis am meisten verbessern würden."

**Das ist der schnellste Weg zu einem guten Kontext**, ohne dass du wissen musst, was fehlt.

---

## 8. Struktur erzwingen

### Warum das wichtig wird

Sobald du KI nicht nur zum Lesen, sondern zum **Weiterverarbeiten** nutzt — in einer App, einem Skript, einer Tabelle — brauchst du vorhersehbare Struktur.

### Die Techniken

**1. Format explizit vorgeben**
> „Antworte ausschließlich als JSON nach diesem Schema: {...}. Keine Erklärung, kein Text davor oder danach, keine Code-Fences."

**2. Vorlage vorgeben**
```
Fülle exakt diese Struktur aus:

TITEL:
PROBLEM:
LÖSUNG:
AUFWAND:
```

**3. Trennzeichen benutzen**
> „Trenne die Abschnitte mit ---"

**4. Schrittweise denken lassen**
Bei komplexen Aufgaben:
> „Geh Schritt für Schritt vor. Erst analysieren, dann entscheiden, dann formulieren."

Das verbessert die Qualität bei mehrstufigen Aufgaben spürbar — weil Zwischenschritte im Kontext landen und die späteren Schritte darauf aufbauen können.

**5. Beim Weiterverarbeiten: immer defensiv parsen**
Auch mit klarer Anweisung kann Zusatztext kommen. Wer die Ausgabe programmatisch nutzt, fängt das ab, statt sich darauf zu verlassen.

---
---

# TEIL III — VERLÄSSLICHKEIT

## 9. Halluzination

### Was es ist

> **Das Modell erfindet plausible Details — mit derselben Selbstsicherheit wie bei korrekten.** Es lügt nicht; es kennt den Unterschied nicht.

Typische Fälle:
- Erfundene Paragrafen, Normen, DIN-Nummern
- Erfundene Quellen und Studien
- Falsche Zahlen, die richtig aussehen
- Erfundene Funktionen in Bibliotheken, die es nicht gibt
- Selbstsichere Antworten zu sehr speziellen Nischen

### Wann das Risiko steigt

| Risiko hoch | Risiko niedrig |
|---|---|
| Sehr spezielle Nischenfragen | Allgemeine, gut dokumentierte Themen |
| Exakte Zahlen, Daten, Namen | Struktur, Formulierung, Umformung |
| Aktuelles nach dem Wissensstand | Zeitlose Konzepte |
| „Nenn mir Quellen für X" | „Erklär mir das Konzept X" |
| Fragen, die eine Antwort erzwingen | Fragen, die ein Nichtwissen zulassen |

### Die praktischen Gegenmaßnahmen

**1. Explizit erlauben, nichts zu wissen.**
> „Wenn du dir nicht sicher bist, schreib das hin, statt zu raten."

Das senkt Halluzinationen messbar — weil der Standardpfad „eine Antwort liefern" ist und du ihm einen anderen anbietest.

**2. Unsicherheit markieren lassen.**
> „Markier alles, was du nicht sicher weißt, mit [UNSICHER]."

**3. Nachprüfbares verlangen.**
Nicht die Behauptung, sondern die Fundstelle — und die dann selbst prüfen.

**4. Zwei unabhängige Durchgänge.**
Dieselbe Frage in zwei frischen Chats. Wo die Antworten auseinandergehen, ist das Risiko.

> **Die härteste Regel: Jede Zahl, jeder Paragraf, jeder Name, den du weiterverwendest, wird geprüft. Ohne Ausnahme.**

---

## 10. Wo KI verlässlich ist

### Die ehrliche Landkarte

| Sehr verlässlich ⭐⭐⭐ | Mit Prüfung ⭐⭐ | Nicht verlassen ❌ |
|---|---|---|
| Text umformulieren, kürzen | Code schreiben | Rechtsauskunft |
| Struktur in Chaos bringen | Konzepte erklären | Steuerberatung |
| Zusammenfassen von Vorliegendem | Recherche mit Websuche | Medizinische Diagnose |
| Übersetzen | Analysen und Vergleiche | Exakte Zahlen aus dem Gedächtnis |
| Entwürfe, Varianten, Ideen | Fehlersuche | Zitate und Quellen |
| Als Sparringspartner denken | Rechnen | Alles Sicherheitskritische |
| Formate umwandeln | Fachtexte | Aktuelles ohne Suche |

### Die Grundregel

> **KI ist hervorragend im Umgang mit Material, das du lieferst. Sie ist unzuverlässig bei Material, das sie liefern soll.**

Das ist die nützlichste Faustregel überhaupt:
- „Fass diesen Text zusammen" → sehr verlässlich
- „Was steht in Norm XY?" → riskant
- „Prüf meinen Code auf Fehler" → gut
- „Wie viel kostet Maschine Z?" → erfunden

---

## 11. Prüfstrategien

### Die Prüfpflicht nach Einsatz

```
Nur für dich, unwichtig     → gar nicht prüfen
Für dich, wichtig           → grob prüfen
Geht an Kunden              → vollständig prüfen
Geld, Recht, Sicherheit     → ⚠️ Fachperson, nicht nur du
```

### Die Techniken

**Rückwärts prüfen.** Nimm das Ergebnis und frag: Ergibt das Sinn, wenn ich es von hinten aufrolle? Bei Rechnungen: Stimmt die Größenordnung?

**Gegen bekannte Fakten prüfen.** Wähl einen Punkt, den du sicher weißt, und schau, ob er stimmt. Wenn der falsch ist, misstraue dem Rest.

**Die zweite Meinung.** Ergebnis in einen frischen Chat und fragen: „Prüf das kritisch. Was ist falsch oder fragwürdig?"

**Die Größenordnungsprüfung.** Bei allem Zahlenmäßigen: grob überschlagen. Halluzinierte Zahlen sind oft plausibel formuliert, aber in der Größenordnung daneben.

---
---

# TEIL IV — ANWENDUNG

## 12. KI beim Programmieren

### Wo der Gewinn wirklich liegt

| Sehr stark | Schwach |
|---|---|
| Boilerplate, Gerüste, Standardstrukturen | Architekturentscheidungen |
| Sprache/Framework wechseln | Schwer reproduzierbare Fehler |
| Fehlermeldungen erklären | Große gewachsene Codebasen ohne Kontext |
| Tests schreiben | Performance-Feinarbeit |
| Code lesbar machen, refactoren | Subtile Logikfehler |
| Etwas Unbekanntes erklärt bekommen | |
| Erste Version von etwas Neuem | |

### Die Regeln, die den Unterschied machen

**1. Kontext, nicht Beschreibung.** Den tatsächlichen Code einfügen, die tatsächliche Fehlermeldung, die tatsächliche Datenstruktur. Nicht beschreiben.

**2. Kleine Schritte.** „Bau mir eine App" führt zu Code, den du nicht verstehst und nicht debuggen kannst. Eine Funktion nach der anderen führt zu Code, den du verstehst.

**3. ⚠️ Nichts einbauen, was du nicht verstehst.**
> **Die eiserne Regel: Wenn du nicht erklären kannst, was eine Zeile tut, gehört sie nicht in dein Projekt.**
>
> Nicht aus Prinzipienreiterei — sondern weil du sie sonst nicht warten kannst. Der Code, den du nicht verstehst, ist der, der dich in sechs Monaten zwei Tage kostet.

**4. Zuerst das Problem, dann die Lösung.** Statt „schreib mir X": „Ich will Y erreichen, hab Z versucht, das passiert. Was ist die Ursache?" Oft ist die Antwort ein anderer Ansatz.

**5. Review-Modus nutzen.** Das Modell ist als Prüfer oft stärker denn als Autor:
> „Prüf diesen Code auf Fehler, Randfälle und Sicherheitsprobleme. Sei streng."

### Agentische Werkzeuge

Werkzeuge, die direkt in deiner Codebasis arbeiten (Dateien lesen, ändern, Tests laufen lassen) sind ein anderer Modus als Chat — sie haben den echten Kontext.

**Was dort wichtig wird:**
- **Versionskontrolle ist Pflicht.** Alles committen, bevor größere Änderungen laufen.
- **Kleine, überprüfbare Schritte** statt eines großen Umbaus.
- **Jede Änderung durchsehen.** Auch die, die richtig aussieht.
- **Klarer Auftrag mit Abnahmekriterium**: „fertig, wenn die Tests grün sind und X funktioniert."

---

## 13. KI im Geschäft

### Die realistischen Anwendungsfälle

| Bereich | Konkret | Zeitgewinn |
|---|---|---|
| **Angebote** | Vorlage + Kundendaten → Entwurf | ⭐⭐⭐ hoch |
| **Kundenkommunikation** | Entwürfe für schwierige Nachrichten | ⭐⭐ |
| **Texte** | Website, Beiträge, Beschreibungen | ⭐⭐⭐ |
| **Recherche** | Marktüberblick, Vergleiche | ⭐⭐ (mit Prüfung) |
| **Analyse** | Zahlen sortieren, Muster suchen | ⭐⭐ |
| **Zusammenfassen** | Lange Dokumente, Protokolle | ⭐⭐⭐ |
| **Sparringspartner** | ⭐ Entscheidungen durchdenken | ⭐⭐⭐ |
| **Übersetzen** | Fachtexte, Kundenkommunikation | ⭐⭐⭐ |

### Der unterschätzteste Einsatz: Sparringspartner

Nicht „schreib mir X", sondern **„denk mit mir".**

> „Ich überlege, [Entscheidung]. Hier sind meine Gründe: [...]. Spiel den Gegenpart. Was übersehe ich? Was sind die stärksten Argumente dagegen?"

**Das ist der Einsatz mit dem höchsten Wert und dem geringsten Risiko** — weil du am Ende selbst entscheidest, und das Modell nur die Perspektiven liefert, die dir fehlen. Halluzination ist hier fast irrelevant.

### Die Verbindung zu den anderen Kursen

| Kurs | KI-Einsatz |
|---|---|
| **Kurs 2 (Verkauf)** | Einwände vorher durchspielen, Gespräche üben |
| **Kurs 3 (Marketing)** | Positionierungssätze in 20 Varianten, dann auswählen |
| **Kurs 6 (Systeme)** | Prozesse aus deiner Beschreibung strukturieren |
| **Kurs 7 (Durchziehen)** | Große Aufgaben zerlegen lassen |

> **Der Zerlege-Einsatz ist der wertvollste aus Kurs 7:** „Ich schiebe [Aufgabe] seit Wochen vor mir her. Zerleg das in Schritte, bis der erste unter zwei Minuten dauert." Das löst die Ambiguitätsfalle direkt.

---

## 14. Vom Chat zum Workflow

### Die Stufen der Nutzung

```
Stufe 1:  Einzelne Fragen stellen
Stufe 2:  Wiederverwendbare Vorlagen
Stufe 3:  Eigene Werkzeuge über die Schnittstelle
Stufe 4:  Automatisierte Abläufe
```

**Die meisten bleiben auf Stufe 1.** Der Sprung auf Stufe 2 kostet fast nichts und bringt am meisten.

### Stufe 2: Vorlagen

Eine Datei mit deinen wiederkehrenden Aufträgen — fertig formuliert, mit Platzhaltern.

```
### ANGEBOT ###
Rolle: Erfahrener Handwerksbetrieb, sachlicher Ton.
Aufgabe: Schreib ein Angebot.
Kunde: {KUNDE}
Leistung: {LEISTUNG}
Preis: {PREIS} | Lieferzeit: {ZEIT}
Format: Max. eine Seite, kein Marketing-Sprech.
Stilvorlage: {BEISPIEL_ANGEBOT}
```

**Zehn solcher Vorlagen sparen dir jede Woche Zeit** — und sie werden mit jeder Runde besser, weil du sie nachschärfst statt neu zu formulieren.

### Stufe 3: Eigene Werkzeuge

Wenn du programmieren kannst, ist die Schnittstelle (API) der eigentliche Hebel: Du baust dir kleine Werkzeuge, die eine Sache gut machen.

**Sinnvolle erste Projekte:**
- Ein Formular, aus dem ein fertiges Angebot fällt
- Ein Werkzeug, das Kundenanfragen kategorisiert
- Etwas, das aus einer Beschreibung eine Materialliste macht
- Auswertung eigener Daten in natürlicher Sprache

⚠️ **Die Falle aus Kurs 6, Kapitel 11:** Werkzeuge bauen macht mehr Spaß als sie zu benutzen. **Erst dreimal von Hand machen, dann automatisieren.**

### Stufe 4: Abläufe

Mehrere Schritte verkettet — Eingabe → Verarbeitung → Prüfung → Ausgabe. Hier gilt: **Je mehr automatisiert läuft, desto wichtiger wird die Prüfstufe.** Ein Fehler in einem manuellen Prozess betrifft einen Fall. In einem automatisierten betrifft er alle.

---
---

# TEIL V — GRENZEN

## 15. Recht und Verantwortung

### Die Punkte, die du kennen musst

**Vertraulichkeit.** Was du eingibst, verlässt deinen Rechner. Kundendaten, Personaldaten, Geschäftsgeheimnisse gehören nur in Dienste, deren Bedingungen du geprüft hast. Bei personenbezogenen Daten greift die DSGVO — das ist keine Formalie, das ist ein Bußgeldrisiko.

> **Praktische Regel: Anonymisieren, bevor du eingibst.** Namen durch Platzhalter ersetzen. Das kostet zehn Sekunden und löst das Problem meistens.

**Urheberrecht.** Die Rechtslage zu KI-erzeugten Inhalten ist in Bewegung und je nach Land unterschiedlich. Für dich praktisch relevant: Bei Texten und Bildern, die du kommerziell nutzt, die Nutzungsbedingungen des Dienstes prüfen — und bei allem Wichtigen den aktuellen Stand recherchieren, nicht auf einen Kursstand von heute vertrauen.

**Haftung.** ⚠️ **Du haftest für das, was du veröffentlichst oder lieferst.** Nicht der Anbieter. Ein fehlerhaftes Angebot, ein falscher Text auf deiner Website, ein Code mit einer Sicherheitslücke — das ist deins.

**Kennzeichnung.** Je nach Kontext und Land gibt es Kennzeichnungspflichten für KI-erzeugte Inhalte. Das Feld bewegt sich; im Zweifel prüfen.

### Die Grundhaltung

> **KI ist ein Werkzeug, kein Verantwortlicher. Die Verantwortung bleibt vollständig bei dir — und sie lässt sich nicht delegieren.**

---

## 16. Die Kompetenzfalle

### Der Punkt, an dem es gefährlich wird

> **Wer eine Fähigkeit nie erwirbt, weil KI sie ersetzt, kann das Ergebnis der KI nicht mehr beurteilen.**

Und das ist der Kern: **Du musst gut genug sein, um zu erkennen, wenn das Ergebnis schlecht ist.** Sonst ist das Werkzeug kein Verstärker, sondern ein Risiko mit Komfort.

```
Kompetenz + KI  →  sehr schnell, sehr gut
Keine Kompetenz + KI  →  schnell, und du merkst die Fehler nicht
```

### Was du trotzdem selbst können musst

| Bereich | Warum |
|---|---|
| **Dein Fach** | Du musst erkennen, wenn etwas fachlich Unsinn ist |
| **Grundlagen deines Codes** | Sonst kannst du nichts warten |
| **Rechnen und Größenordnungen** | Halluzinierte Zahlen erkennt nur, wer überschlagen kann |
| **Schreiben** | Sonst kannst du guten Text nicht von glattem unterscheiden |
| **Denken über ein Problem** | Das lässt sich nicht auslagern |

### Die praktische Regel

> **Nutze KI, um schneller zu werden in dem, was du kannst — und um zu lernen, was du noch nicht kannst. Nicht, um zu vermeiden, es zu lernen.**

Der Unterschied im Alltag:
```
❌ "Schreib mir den Code"          → du lernst nichts
✅ "Erklär mir, warum mein Ansatz
    nicht funktioniert"             → du lernst
✅ "Schreib den Code, dann erklär
    mir Zeile für Zeile warum"     → du lernst und bist schnell
```

### Wie du am Ball bleibst

Das Feld ändert sich alle paar Monate. Was hilft:

1. **Prinzipien statt Produkte lernen.** Kontext, Beispiele, Iteration, Prüfung — das gilt modellübergreifend und überdauert.
2. **Ein Werkzeug richtig statt fünf oberflächlich.** (Kurs 3, Kapitel 10 — dasselbe Prinzip.)
3. **Beim eigenen Anwendungsfall bleiben.** Nicht jeder Neuigkeit hinterherlaufen. Die Frage ist nicht „was ist neu", sondern „löst das ein Problem, das ich habe".
4. **Alle paar Monate den eigenen Werkzeugkasten prüfen.** Nicht wöchentlich.
5. **Die Dokumentation des Anbieters lesen.** Sie ist aktueller als jedes Video und jeder Kurs — auch als dieser.

> **Der beste Schutz gegen Veraltung ist nicht, alles Neue zu verfolgen. Es ist, die Mechanik so gut zu verstehen, dass du jedes neue Werkzeug in zwanzig Minuten einordnen kannst.**

---

## Die Kurzfassung

1. **Es optimiert auf „klingt richtig", nicht „ist richtig".**
2. **Kontext ist der einzige echte Hebel** — nicht die Formulierung.
3. **Material einfügen schlägt beschreiben.**
4. **Auftrag statt Frage.** Wenn du es googeln könntest, war es eine Frage.
5. **Beispiele schlagen Erklärungen.** Gegenbeispiele am meisten.
6. **Plan mit drei Runden**, nicht mit dem perfekten Prompt.
7. **Lass es sich selbst kritisieren.** Die zweite Runde ist besser.
8. **Gut bei Material, das du lieferst. Unzuverlässig bei Material, das es liefern soll.**
9. **Jede Zahl, jeder Paragraf, jeder Name wird geprüft.**
10. **Bau nichts ein, was du nicht erklären kannst.**

> **Und über allem: Du musst gut genug sein, um zu erkennen, wenn das Ergebnis schlecht ist. KI verstärkt Kompetenz — sie ersetzt sie nicht.**

---

*Kurs 9 Ende.*
