# 00 — START HIER

### Der komplette Kurs · 10 Module · 173 Kapitel
*Stand: 24. Juli 2026 — alle Module fertig*

---

## Die Lernreihenfolge

⚠️ **Die Kursnummern sind Themengebiete, nicht der Pfad.** Diese Liste ist der Pfad.

| # | Kurs | Datei | Kapitel | Warum an dieser Stelle |
|---|---|---|---|---|
| **1** | Anfangen & Durchziehen | `Kurs-7-Anfangen-und-Durchziehen.md` | 17 | Ohne Umsetzung bleibt alles andere Theorie |
| **2** | Timemaxxing | `Kurs-8-Timemaxxing.md` | 17 | Ohne Zeit gibt es nichts umzusetzen |
| **3** | Verkauf & Netzwerk | `Verkaufs-und-Netzwerk-Playbook.md` | 10 | Die Fähigkeit, die sofort Geld bringt |
| **4** | Verkauf fortgeschritten | `Kurs-2b-Verkauf-Fortgeschritten.md` | 16 | Alles an jeden — und dich selbst |
| **5** | Psychologie | `Kurs-4-Psychologie.md` | 21 | Das Fundament darunter — inkl. Social Media |
| **6** | Marketing & Preis | `Kurs-3-Marketing-Positionierung-Preis.md` | 14 | 1:viele statt 1:1 |
| **7** | KI professionell | `Kurs-9-KI-professionell.md` | 16 | Werkzeug, das alles andere beschleunigt |
| **8** | Geld, Steuern, Banken | `Kurs-Modul-1-Geld-Steuern-Banken-Systeme.md` | 25 | Behalten, was reinkommt |
| **9** | Systeme | `Kurs-6-Systeme.md` | 15 | Erst wenn es etwas zu systematisieren gibt |
| **10** | Vermögen & Strukturen | `Kurs-Modul-5-Vermoegen-Strukturen-Assets.md` | 22 | Zuletzt — Struktur multipliziert, sie erschafft nicht |

**Dazu:** `Der-Kompass.md` — die Querverbindungen zwischen allen Modulen. Kein Kurs, sondern die Karte darüber. Am besten nach Kurs 3 lesen.

---

## Warum diese Reihenfolge

```
1-2   Fähigkeit zur Umsetzung      ← ohne das ist der Rest Papier
3-5   Menschen und Geld verdienen  ← der Faktor
6-7   Verstärken                   ← Marketing und Werkzeug
8     Behalten                     ← Steuern und Struktur
9-10  Multiplizieren               ← erst wenn es was zu multiplizieren gibt
```

> **Der Leitsatz über allem: Multiplikation braucht einen Faktor. Bau erst den Faktor.**

---

## Für LifeOS

### Die Datei

`lifeos-kurse.json` — Version 2.0. Enthält:

```
meta          → Version, Phasen-Definitionen
faeden        → 7 rote Fäden mit Querverweisen zwischen Kursen
kurse[]       → 10 Kurse, je mit:
                 - status, datei, funktion, leitfrage
                 - phase[], prioritaet, voraussetzungen[]
                 - kernaussagen[]
                 - kapitel[] → nr, titel, kern, checks[]
reihenfolge   → der Lernpfad oben, maschinenlesbar
lernpfad      → Priorisierung je Phase (rot/gelb/gruen/ignorieren)
kurzfassung   → 7 Sätze
```

### Vorschlag für die Architektur

```
JSON     →  Struktur, Fortschritt, Kontrollfragen (interaktiv)
Markdown →  Volltext, per datei-Feld verlinkt
```

Ein Single-File-PWA will keine 173 Kapitel Prosa im JSON-Blob. Die Checks sind der interaktive Teil — die Prosa wird nur angezeigt.

### Was sich direkt bauen lässt

- **Kursliste** mit Fortschrittsbalken (erledigte Kapitel / gesamt)
- **Kapitelansicht** mit `kern` als Vorschau
- **Kontrollfragen** als abhakbare Elemente pro Kapitel
- **Phasen-Filter** über `lernpfad` — zeigt nur, was gerade dran ist
- **Fäden-Ansicht** — ein Prinzip quer durch alle Kurse
- **Nächstes Kapitel** aus `reihenfolge` + Fortschritt

### Der Prompt für Claude Code

> „In `lifeos-kurse.json` liegt ein Kurriculum mit 10 Kursen und 173 Kapiteln. Bau einen Kursbereich: Kursliste sortiert nach `reihenfolge.pfad`, Kapitelansicht, Kontrollfragen als abhakbare Elemente, Fortschritt persistent. Die Volltexte liegen als Markdown im selben Ordner, verlinkt über das Feld `datei`."

---

## Die Kurzfassung des Ganzen

1. Etwas können, das selten ist
2. Es verkaufen, indem du diagnostizierst statt überredest
3. Gefunden werden von den Richtigen
4. Weniger ausgeben, als reinkommt
5. Es so bauen, dass es ohne dich läuft
6. Den Überschuss in Produktives stecken
7. Struktur drumherum, wenn es genug zu strukturieren gibt

---

## Die Grenzen

**Was der Kurs kann:** Mechanik erklären, Zusammenhänge zeigen, dir sagen welche Frage du wem stellst, Blödsinn erkennbar machen.

**Was er nicht kann:**
- ⚠️ **Beratung ersetzen.** Steuern, Recht, Anlage — da haftest du.
- ⚠️ **Aktuell bleiben.** Alle Zahlen sind Stand 2026 und veralten. Vor dem Handeln prüfen.
- ⚠️ **Übung ersetzen.** Eine Landkarte ist kein Weg.

Wo im Text ein ⚠️ steht, ist das kein Deko-Symbol.

---

*Alle Module fertig. Fragen zu einzelnen Kapiteln: jederzeit.*
