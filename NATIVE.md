# HustleX als native App (iOS + Android)

Die App ist mit **Capacitor** vorbereitet. Web-Code bleibt wie bisher (`src/` → `node build.mjs` → `dist/`). Capacitor packt `dist/` in eine echte iOS-/Android-App und liefert native Push-Erinnerungen.

- **appId:** `com.hustlex.app`  (bleibt dauerhaft — nach Store-Upload nicht mehr ändern)
- **appName:** `HustleX`
- **webDir:** `dist`

## Einmalig einrichten
```bash
cd ~/hustlex
npm install
npx cap add android      # erzeugt android/  (braucht Android Studio)
npx cap add ios          # erzeugt ios/      (braucht Mac + Xcode + CocoaPods)
```

## Nach jeder Code-Änderung
```bash
npm run cap:sync         # baut dist/ neu + synct in die nativen Projekte
```

## Android bauen & hochladen (kein Mac nötig)
1. Android Studio installieren (+ JDK).
2. `npm run cap:android` → öffnet das Projekt in Android Studio.
3. Build → **Generate Signed Bundle (AAB)** → Upload-Key erstellen (einmalig, sicher aufbewahren!).
4. In der **Google Play Console** neue App anlegen, AAB hochladen, Store-Listing + Data-Safety + Alterseinstufung ausfüllen → zur Prüfung einreichen.

## iOS bauen & hochladen (Mac + Xcode)
1. Xcode + CocoaPods installieren.
2. `npm run cap:ios` → öffnet das Projekt in Xcode.
3. Signing: Apple-Developer-Team wählen (99 USD/Jahr).
4. Product → Archive → **Distribute App** → App Store Connect.
5. In **App Store Connect** App anlegen, Metadaten + Screenshots + Privacy-Labels ausfüllen → zur Prüfung einreichen.

## Push-Erinnerungen
- Einstellungen → 🔔 Erinnerungen. Zeiten/Texte frei einstellbar.
- Nur in der installierten App aktiv (im Browser No-op). Code: `src/core/10-native.js`.
