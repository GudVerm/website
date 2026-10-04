GudeliusVermessung – Website

Aktiver Vorproduktionsstand:
https://gudverm.github.io/website/

Produktionsziel:
https://gudeliusvermessung.de/

Die aktive Umgebung ist in site.environments.json als "staging" festgelegt.
Staging bleibt noindex; DNS, Wix und Mail werden nicht automatisch verändert.

Wichtige Bereiche:
- öffentliche Website: index.html, leistungen/, projekte/, technik/, unternehmen/, kontakt/
- gemeinsames Frontend: assets/
- Access-Admin: admin/
- Cloudflare Worker/D1/R2: cloudflare/
- automatisierte Qualitätsprüfungen: quality/
- GitHub-Actions-Workflows: .github/workflows/
- Releasekonfiguration: release.json
- Staging/Produktion: site.environments.json und STAGING_PRODUCTION.md
- Releaseablauf: RELEASE_CHECKLIST.md

CMS-Funktionen:
- Cloudflare Access mit serverseitiger E-Mail-Allowlist
- Entwurfsmodus und Access-geschützte Vorschau
- Einzel-/Mehrfachveröffentlichung von Entwürfen
- Inhaltsversionierung und Wiederherstellung
- Audit-Log
- Bild-Cropper mit Zielvorschau, Presets, Zoom, Position und Drehung
- zentrale Dirty-State-Warnung
- R2-Medienbibliothek mit Metadaten und Filtern
- Anfragen-Kanban mit Priorität, Wiedervorlage und CSV-Export
- anonymisierte Website-Statistik
- CMS-Backup ohne Kontaktformularinhalte

Automatische Qualitätsprüfung:
- statische HTML/JS/Asset-Prüfung
- Release- und Umgebungskonsistenz
- CMS-/Admin-Vertragscheck
- Chromium auf Mobil/Tablet/Desktop
- CMS-/CORS-Browserintegration
- visuelle Regression mit versionierten Referenzbildern und Diff-Artefakten
- WCAG-A/AA- und Fokusprüfung
- GitHub-Pages-Build
- regelmäßiges Website-/Worker-Monitoring

Quellcode und Website-Inhalte werden in diesem Repository gepflegt.
