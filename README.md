# LifeOS · Glasmorph Edition

Modulares PWA-Projekt mit Live-Build und neuem Glasmorphismus-Design.

## Setup (Windows / PowerShell)

```powershell
# 1. Projekt-Ordner extrahieren / kopieren nach z.B.:
cd C:\Dev\
# Den lifeos-Ordner hier rein

cd lifeos

# 2. Dependencies installieren (nur einmalig)
npm install

# 3. Dev-Server starten
npm run dev
# → öffnet http://localhost:5173 mit Auto-Reload bei jeder Änderung
```

## Workflow mit Claude Code

```powershell
# Im Projekt-Ordner:
claude
```

Dann zu Claude Code sagen:

> "Migriere die bestehende LifeOS.html (im Root) in die `src/`-Struktur.
> Halte dich an die Build-Reihenfolge aus `src/manifest.json`.
> Verwende das neue Design-System aus `src/styles/01-base.css`.
> Splitte die Render-Funktionen in `src/screens/` (eine Datei pro Screen)."

Claude Code arbeitet dann inkrementell, mit Live-Preview im Browser. Jede Änderung kannst du sofort auf dem iPhone testen über deine lokale IP:

```powershell
# Deine lokale IP rausfinden
ipconfig | findstr IPv4
# z.B. 192.168.1.42 → am iPhone http://192.168.1.42:5173 öffnen
```

## Build für Production

```powershell
npm run build
# → erzeugt dist/LifeOS.html (single-file PWA, offline-fähig)
```

Die `dist/LifeOS.html` lädst du dann wie bisher auf GitHub Pages / Netlify hoch.

## Struktur

```
lifeos/
├── LifeOS.html           # die alte single-file Version (Backup, für Migration)
├── src/
│   ├── index.html        # HTML-Shell mit Inject-Markern
│   ├── manifest.json     # definiert Build-Reihenfolge
│   ├── styles/           # CSS-Module (werden alphabetisch konkateniert)
│   │   ├── 01-base.css       # ← Glasmorphismus Design-Tokens
│   │   ├── 02-components.css # ← Cards, Buttons, Inputs
│   │   └── 03-animations.css # ← Springs, Transitions, Glow
│   ├── core/             # Kern-Logik
│   │   ├── 01-storage.js     # localStorage Helper
│   │   ├── 02-constants.js   # GOALS, HABITS, SUPPS, etc.
│   │   ├── 03-state.js       # globaler State
│   │   └── 04-helpers.js     # getLvl, getCats, etc.
│   ├── ui/               # UI-Bausteine
│   │   ├── statusbar.js
│   │   ├── nav.js
│   │   ├── overlay.js
│   │   └── toast.js
│   └── screens/          # ein Screen pro Datei
│       ├── home.js
│       ├── fokus.js          # ← Discipline + Planner
│       ├── quests.js
│       ├── vitals.js
│       ├── intel.js
│       ├── ich.js
│       └── wachstum.js
├── dist/                 # generierte single-file Builds (gitignored)
├── build.mjs             # konkateniert src/ → dist/LifeOS.html
├── dev.mjs               # dev server mit watch + auto-reload
├── package.json
└── .gitignore
```

## Migration aus alter LifeOS.html

Die alte `LifeOS.html` ist im Root als Referenz. Daten (localStorage) bleiben kompatibel weil ich die `los_*` Keys nicht ändere.

**Schritt für Schritt mit Claude Code:**

1. `claude` im Projektordner starten
2. "Lies LifeOS.html und extrahiere die DATA-Konstanten in src/core/02-constants.js"
3. "Migriere die renderHome-Funktion in src/screens/home.js mit dem neuen Glasmorphismus-Styling"
4. Screen für Screen weitermachen
5. Nach jedem Screen: `npm run dev` checken ob alles läuft

## Git

```powershell
git init
git add .
git commit -m "Initial: LifeOS modular structure with glassmorphism design"
git remote add origin https://github.com/dein-user/lifeos.git
git push -u origin main
```

## iPhone PWA Update

Wenn du eine neue `dist/LifeOS.html` deployed hast:
1. Alte LifeOS-App vom Homescreen löschen
2. URL neu in Safari öffnen
3. Teilen-Button → "Zum Home-Bildschirm"

Der Service Worker hat eine Versions-Nummer (`los-v5`) — bei Updates die Nummer in `src/core/01-storage.js` hochzählen damit der Cache invalidiert wird.
