# Gudelius CMS – Cloudflare Backend

Dieses Verzeichnis enthält das Cloudflare-Backend für die GudeliusVermessung-Website.

## Architektur

- **Worker:** `gudelius-cms`
- **D1:** `gudelius-cms-db` für Texte/Inhalte
- **R2:** `gudelius-media` für Bilder und Dateien
- **Admin-Token:** als Cloudflare Secret `CMS_ADMIN_TOKEN`

Die öffentliche Website bleibt zunächst auf GitHub Pages. Dadurch kann das CMS ohne Ausfall parallel aufgebaut und getestet werden.

## Einmalige Cloudflare-Einrichtung

1. D1-Datenbank `gudelius-cms-db` erstellen.
2. Die angezeigte Database-ID in `wrangler.jsonc` bei `database_id` einsetzen.
3. R2-Bucket `gudelius-media` erstellen.
4. Im Ordner `cloudflare`:
   - `npm install`
   - `npx wrangler login`
   - `npm run db:init:remote`
   - `npx wrangler secret put CMS_ADMIN_TOKEN`
   - `npm run deploy`

Nach dem Deploy erhält der Worker eine URL wie:
`https://gudelius-cms.<account>.workers.dev`

Diese URL wird anschließend in `admin/config.js` bzw. im Admin-Bereich hinterlegt.

## Sicherheit

Schreibzugriffe funktionieren nur mit dem Secret `CMS_ADMIN_TOKEN`. Das Token gehört niemals ins Git-Repository. Der Admin speichert es nur in `sessionStorage` des Browsers.

Später kann die Token-Lösung durch Cloudflare Access ersetzt werden.


## Statistik / KPI

Die Website kann anonyme Nutzungsereignisse an `POST /api/analytics/event` senden. Gespeichert werden ausschließlich Event-Typ, normalisierter Seitenpfad, ein kurzes Ziel/Label und der Zeitstempel. Es werden **keine** IP-Adressen, Cookies, persistenten Besucher-IDs, Fingerprints, User-Agent-Zeichenketten oder Kontaktformular-Inhalte in der Analytics-Tabelle gespeichert.

Rohereignisse werden auf **370 Tage** begrenzt. Die Admin-Auswertung unter `GET /api/admin/analytics` ist mit dem bestehenden `CMS_ADMIN_TOKEN` geschützt und liefert ausschließlich aggregierte Kennzahlen.

Nach Änderungen am Worker weiterhin wie bisher im Ordner `cloudflare` deployen:

- `npm run db:init:remote` (idempotent)
- `npm run deploy`

Die öffentliche Website funktioniert vollständig weiter, wenn der Analytics-Endpunkt nicht erreichbar ist.
