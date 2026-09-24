# Gudelius CMS – Cloudflare Backend

Dieses Verzeichnis enthält das bestehende Cloudflare-Backend für GudeliusVermessung. Die öffentliche Website bleibt während der Backend-Härtung auf GitHub Pages; die produktive Wix-Seite und sämtliche produktiven DNS-/E-Mail-Einträge bleiben unangetastet.

## Architektur

- **Worker:** `gudelius-cms`
- **D1:** `DB` → `gudelius-cms-db`
- **R2:** `MEDIA` → `gudelius-media`
- **E-Mail-Binding:** `CONTACT_EMAIL` → ausschließlich `gudeliusvermessung@web.de`
- **Admin-Secret:** `CMS_ADMIN_TOKEN` als Cloudflare Secret, niemals im Repository
- **Erlaubter Browser-Origin:** `ALLOWED_ORIGIN=https://gudverm.github.io`
- **Öffentliche R2-Ausgabe:** `PUBLIC_MEDIA_ENABLED=false` bis zur bewussten Medienprüfung

Die Worker-Releasekennung steht in `GET /api/health`. Der Stand dieser Härtungsrunde ist `2026-09-24.1`.

## Lokale Prüfung

Im Ordner `cloudflare`:

```bash
npm install
npm run check
npm run deploy:dry
```

Für die Rate-Limiting-Bindings ist Wrangler **4.36.0 oder neuer** erforderlich.

## D1-Schema

`schema.sql` ist als Basisschema idempotent und enthält ausschließlich `CREATE TABLE IF NOT EXISTS` bzw. `CREATE INDEX IF NOT EXISTS`. Es löscht oder ersetzt keine Tabellen und überschreibt keine vorhandenen Datensätze.

Die bestehende additive Altbestandsmigration für `contact_requests.internal_note` bleibt im Worker: Vor einem `ALTER TABLE` wird mit `PRAGMA table_info(contact_requests)` geprüft, ob die Spalte fehlt. Dadurch kann ein bereits produktiv befüllter Datenbestand weiterverwendet werden.

Initialisierung bzw. erneute Basisschema-Prüfung:

```bash
npm run db:init:remote
```

## Bindings und Secrets

In `wrangler.jsonc` liegen nur nicht geheime Konfigurationswerte. Vor einem produktiven Deploy im Cloudflare-Konto prüfen:

- `DB` ist an `gudelius-cms-db` gebunden.
- `MEDIA` ist an `gudelius-media` gebunden.
- `CONTACT_EMAIL` ist vorhanden und auf `gudeliusvermessung@web.de` begrenzt.
- Der Absender ist auf `website@gudeliusvermessung.de` begrenzt.
- `CMS_ADMIN_TOKEN` ist als Secret gesetzt.
- `ALLOWED_ORIGIN` bleibt für die Testphase `https://gudverm.github.io`.
- `PUBLIC_MEDIA_ENABLED` bleibt `false`, bis alle R2-Medien geprüft sind.

Der echte `CMS_ADMIN_TOKEN` darf weder in GitHub noch in lokale Beispieldateien geschrieben werden.

## Rate Limiting

Drei Cloudflare-Rate-Limiting-Bindings schützen die öffentlich bzw. schreibend erreichbaren Pfade ohne eigene Besucher-/IP-Tabelle:

- Kontaktformular: 12 akzeptierte Verarbeitungsversuche pro Minute und Cloudflare-Standort.
- Analytics: 600 Ereignisse pro Minute und Cloudflare-Standort.
- Admin-Medienänderungen: 30 Upload-Versuche pro Minute und Cloudflare-Standort.

Die Schlüssel sind ressourcenbezogen und enthalten keine Formularfelder, IP-Adressen oder Besucherkennungen.

## Kontaktformular

`POST /api/contact`:

1. akzeptiert nur den konfigurierten Browser-Origin,
2. verlangt `application/json`,
3. begrenzt den Request auf 16 KiB,
4. verwendet das bestehende Honeypot-Feld,
5. validiert Pflichtfelder und E-Mail-Adresse,
6. normalisiert einzeilige Felder,
7. speichert die Anfrage zuerst in D1,
8. versucht anschließend den E-Mail-Versand,
9. speichert keine Formularinhalte in der Analytics-Tabelle.

Ein Fehler beim E-Mail-Versand löscht die bereits gespeicherte D1-Anfrage nicht.

Für einen vollständigen Live-E-Mail-Test muss im Cloudflare-Konto zusätzlich bestätigt sein, dass der Absender-Domainstatus für Email Service gültig ist und die Zieladresse als erlaubtes/verifiziertes Ziel akzeptiert wird. Dafür werden in diesem Repository keine DNS-Änderungen vorgenommen.

## Upload-Sicherheit

`PUT /api/media/<key>` bleibt mit `CMS_ADMIN_TOKEN` geschützt und prüft serverseitig:

- maximales Uploadvolumen 15 MiB,
- nur JPEG, PNG, WebP und AVIF,
- MIME-Type gegen Dateisignatur/Magic Bytes,
- sichere Medienkeys ohne leere, `.`- oder `..`-Segmente,
- bereinigte Originaldateinamen nur als R2-Metadatum,
- Rate Limiting.

Die öffentliche Ausgabe `GET /media/<key>` liefert solange 404, wie `PUBLIC_MEDIA_ENABLED=false` ist. Upload und Löschen bleiben davon unabhängig funktionsfähig.

## CORS

CORS arbeitet fail-closed. Ohne passende `ALLOWED_ORIGIN`-Konfiguration werden Browser-POSTs nicht freigegeben. Nicht erlaubte Preflight-Anfragen erhalten 403. Die aktuelle Testumgebung benötigt als Origin ausschließlich:

```text
https://gudverm.github.io
```

Die produktive Domain wird erst beim späteren, ausdrücklich freigegebenen Livegang ergänzt bzw. umgestellt.

## Healthchecks

Öffentlich, ohne interne Details:

```text
GET /api/health
```

Erwartet u. a.:

```json
{"ok":true,"service":"gudelius-cms","release":"2026-09-24.1"}
```

Geschützt mit `Authorization: Bearer <CMS_ADMIN_TOKEN>`:

```text
GET /api/admin/health
```

Dieser Check verifiziert D1-Tabellen/Spalten, R2-Binding sowie das Vorhandensein der notwendigen Worker-Bindings, ohne ein Testmedium zu schreiben und ohne eine Test-E-Mail zu versenden.

## Funktionsprüfung nach Deploy

Nach dem Deploy nacheinander prüfen:

1. `GET /api/health` zeigt Release `2026-09-24.1`.
2. `GET /api/site` liefert die öffentliche CMS-Ausgabe.
3. `GET /api/admin/health` mit Admin-Token liefert `ok: true`.
4. Admin-Schreibzugriff auf einen bestehenden Test-/CMS-Key funktioniert nur mit Token.
5. `GET /api/contact` ist ohne Token 401 und mit Token erreichbar.
6. `GET /api/admin/analytics` ist ohne Token 401 und mit Token erreichbar.
7. Medien-Upload mit falschem MIME bzw. falscher Dateisignatur wird mit 415 abgewiesen.
8. Gültiger Bild-Upload wird gespeichert; direkte `GET /media/...`-Ausgabe bleibt wegen `PUBLIC_MEDIA_ENABLED=false` deaktiviert.
9. Eine klar gekennzeichnete Testanfrage wird in D1 gespeichert, erscheint im Admin und meldet `notificationSent: true`.
10. Der tatsächliche Eingang der Testmail bei `gudeliusvermessung@web.de` wird im Zielpostfach bestätigt.

## Deploy

Nach Prüfung:

```bash
npm run db:init:remote
npm run check
npm run deploy:dry
npm run deploy
```

Der Worker wird derzeit **nicht** automatisch durch GitHub Actions deployt. Deshalb muss der Cloudflare-Deploy separat ausgeführt und anschließend über die Releasekennung im Healthcheck verifiziert werden.

## Analytics / Datenschutz

Die Website sendet anonyme Ereignisse an `POST /api/analytics/event`. In D1 werden ausschließlich Event-Typ, normalisierter Seitenpfad, kurzes Ziel/Label und Zeitstempel gespeichert. Nicht gespeichert werden IP-Adresse, Cookies, persistente Besucher-ID, Fingerprint, User-Agent oder Kontaktformular-Inhalte.

Rohereignisse werden auf **370 Tage** begrenzt. `GET /api/admin/analytics` ist durch `CMS_ADMIN_TOKEN` geschützt.

## Turnstile

Turnstile bleibt vorerst optional und ist in dieser Runde nicht aktiviert. Rate Limiting, Honeypot, Origin-Prüfung und Größenlimits sind bereits aktiv. Turnstile sollte erst ergänzt werden, wenn Site-Key/Secret sauber in der Testumgebung eingerichtet werden können; das Secret gehört dann ausschließlich in Cloudflare und nie in GitHub.

## Späterer Schritt: Cloudflare Access

Cloudflare Access wird bewusst **nicht** auf der produktiven Wix-Domain umgesetzt. Die spätere Zielarchitektur soll eine Cloudflare-kontrollierte Admin-Domain/Subdomain verwenden und den technischen Browser-Token für den Kunden ersetzen.
