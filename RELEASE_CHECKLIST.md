# GudeliusVermessung – Release-Ablauf

Der Produktiv-/Pre-Launch-Prozess verwendet **eine zentrale Worker-Releasekennung** aus `release.json`.

## 1. Vor jedem Worker-Release

Im Repository müssen dieselbe Releasekennung verwenden:

- `release.json`
- `cloudflare/src/index.js`
- `cloudflare/smoke-test.mjs`
- `cloudflare/README.md`

`node quality/release-check.mjs` und der Workflow **Website quality** prüfen das automatisch.

## 2. Worker lokal prüfen und deployen

```bat
cd /d D:\00_Gudelius\website
git pull origin main
cd cloudflare
npm install
npm run check
npm run deploy:dry
npm run deploy
npm run smoke:remote
```

## 3. Release-Preflight

Nach dem Worker-Deploy in GitHub Actions den Workflow **Release preflight** starten. Ohne Eingabe verwendet er automatisch die Kennung aus `release.json`.

Der Preflight prüft:

- Versionskonsistenz im Repository
- statische Website-Qualität
- Erreichbarkeit von GitHub Pages
- tatsächlich deployte Worker-Release
- vorhandene Kontakt-/Brevo-Konfiguration
- lesbaren Zugriff auf `/api/site`

## 4. Admin-Kontrolle

Danach im Access-Admin:

- Dashboard: Backend **OK**
- neue/gesamte Anfragen plausibel
- Entwürfe prüfen
- bei Bedarf CMS-Backup herunterladen
- Audit-Log auf unerwartete Änderungen prüfen

## 5. Domain-/DNS-Umschaltung

DNS, Wix und Mail werden weiterhin **nicht** durch einen Release-Workflow verändert. Der spätere Domain-Cutover bleibt ein eigener, bewusst manueller Schritt mit vorheriger Sicherung der DNS- und Mailrecords.

## Rollback

Für redaktionelle Inhalte steht die CMS-Versionierung mit Wiederherstellung zur Verfügung. Für Code bleibt jeder Release als Git-Commit nachvollziehbar; ein problematischer Commit wird über einen neuen Revert-Commit zurückgenommen, nicht durch Force-Push.
