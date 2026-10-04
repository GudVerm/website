# GudeliusVermessung – Release-Ablauf

Der Release-Prozess verwendet die zentrale Worker-Releasekennung aus `release.json`. Die aktive Website-Umgebung kommt aus `site.environments.json`.

## 1. Automatische Prüfungen vor einem Worker-Deploy

Der Workflow **Website quality** muss für den finalen Commit grün sein. Er prüft:

- Release-Konsistenz
- statische Website-/Asset-Regeln
- Staging-/Produktionskonsistenz
- CMS-/Admin-Verträge
- Chromium auf Mobil, Tablet und Desktop
- öffentliche CMS-/CORS-Integration
- visuelle Regression gegen versionierte Baselines
- WCAG-A/AA, Labels, ARIA und ersten Tastaturfokus

GitHub Pages muss für denselben Commit ebenfalls erfolgreich gebaut sein.

## 2. Worker-Release konsistent halten

Dieselbe Kennung muss stehen in:

- `release.json`
- `cloudflare/src/index.js`
- `cloudflare/smoke-test.mjs`
- `cloudflare/README.md`

`node quality/release-check.mjs` erzwingt diese Übereinstimmung.

## 3. Worker genau einmal deployen

Nur wenn Worker-Code, D1-Schema oder Worker-Konfiguration geändert wurden:

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

Der Worker führt additive D1-Migrationen beim ersten Zugriff idempotent aus; bestehende Anfragen werden nicht gelöscht.

## 4. Release preflight

Nach dem Worker-Deploy in GitHub Actions **Release preflight** auf `main` starten. Ohne Eingabe verwendet er `release.json`.

Der Preflight prüft:

- Repository-Releasekonsistenz
- statische Website
- Staging-/Produktionskonfiguration
- CMS-/Admin-Verträge
- GitHub Pages
- tatsächlich deployte Worker-Release
- Kontakt-/Brevo-Konfiguration
- öffentlichen CMS-Datenzugriff

## 5. Admin-Abnahme

Im Access-Admin prüfen:

- Dashboard: Backend OK
- Entwürfe: Einzeln/Mehrfachauswahl funktioniert
- Audit: neue Aktionen erscheinen
- Medienbibliothek: R2-/Fallback-, Crop- und Metadaten plausibel
- Cropper: Zielvorschau und sichtbare Zahlenwerte
- Anfragen: Priorität, Wiedervorlage, Antwort-ausstehend, CSV
- bei Bedarf CMS-Backup herunterladen

## 6. Staging und Domain

Staging bleibt bis zum bewussten Domain-Cutover `noindex`.
Kein Workflow verändert DNS, Wix, MX, SPF, DKIM oder DMARC.
Der spätere Cutover folgt ausschließlich `STAGING_PRODUCTION.md`.

## Rollback

- redaktionelle Inhalte: Versionshistorie/Wiederherstellen
- unveröffentlichte Inhalte: Entwurf verwerfen
- Code: neuer Git-Revert-Commit, kein Force-Push
- Wix: bis zum abgeschlossenen Produktiv-Cutover als externer Rollback erhalten
