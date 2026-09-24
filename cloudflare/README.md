# Gudelius CMS – Cloudflare Backend

Dieses Verzeichnis enthält das bestehende Cloudflare-Backend für GudeliusVermessung. Die öffentliche Website bleibt während der Backend-Härtung auf GitHub Pages; die produktive Wix-Seite und sämtliche produktiven DNS-/E-Mail-Einträge bleiben unangetastet.

## Architektur

- **Worker:** `gudelius-cms`
- **D1:** `DB` → `gudelius-cms-db`
- **R2:** `MEDIA` → `gudelius-media`
- **Transaktionsmail:** Brevo API über das Secret `BREVO_API_KEY`
- **Absender:** verifizierter Brevo-Sender `gudeliusvermessung@web.de`
- **Empfänger:** `gudeliusvermessung@web.de`
- **Admin-Secret:** `CMS_ADMIN_TOKEN` als Cloudflare Secret
- **Erlaubter Browser-Origin:** `ALLOWED_ORIGIN=https://gudverm.github.io`
- **Öffentliche R2-Ausgabe:** `PUBLIC_MEDIA_ENABLED=false` bis zur bewussten Medienprüfung

Die kostenpflichtige Cloudflare-Email-Sending-Bindung wird nicht mehr verwendet. Damit entstehen für das Kontaktformular derzeit keine Cloudflare-Email-Sending-Kosten. Wix, Domain-DNS und bestehende E-Mail-DNS-Einträge werden dadurch nicht verändert.

Die aktuelle Worker-Releasekennung ist `2026-09-24.3`.

## Secrets

Folgende Secrets müssen im Cloudflare-Worker gesetzt sein:

```text
CMS_ADMIN_TOKEN
BREVO_API_KEY
```

Prüfung:

```bash
npx wrangler secret list
```

Die Secret-Werte dürfen niemals in GitHub, Konfigurationsdateien oder Dokumentation geschrieben werden.

## Nicht geheime Worker-Variablen

`wrangler.jsonc` enthält:

```text
ALLOWED_ORIGIN=https://gudverm.github.io
BREVO_FROM_EMAIL=gudeliusvermessung@web.de
BREVO_FROM_NAME=GudeliusVermessung
CONTACT_EMAIL_TO=gudeliusvermessung@web.de
PUBLIC_MEDIA_ENABLED=false
```

## Kontaktformular und E-Mail

`POST /api/contact`:

1. akzeptiert nur den konfigurierten Browser-Origin,
2. verlangt `application/json`,
3. begrenzt den Request auf 16 KiB,
4. verwendet das bestehende Honeypot-Feld,
5. validiert Pflichtfelder und E-Mail-Adresse,
6. speichert die Anfrage zuerst in D1,
7. sendet danach die Benachrichtigung über Brevos Transactional-Email-API,
8. setzt die Formularadresse als `Reply-To`,
9. speichert keine Formularinhalte in der Analytics-Tabelle.

Ein Fehler beim E-Mail-Versand löscht die bereits gespeicherte D1-Anfrage nicht.

Der Worker nutzt:

```text
POST https://api.brevo.com/v3/smtp/email
```

mit dem Cloudflare-Secret `BREVO_API_KEY`. Der API-Key wird weder an den Browser noch an GitHub ausgegeben.

## D1-Schema

`schema.sql` ist idempotent und enthält ausschließlich additive `CREATE ... IF NOT EXISTS`-Operationen. Bestehende Daten werden nicht gelöscht oder überschrieben. Die additive Altbestandsmigration für `contact_requests.internal_note` prüft vor `ALTER TABLE` per `PRAGMA table_info`, ob die Spalte fehlt.

## Rate Limiting

- Kontaktformular: 12 Verarbeitungsversuche pro 60 Sekunden
- Analytics: 600 Ereignisse pro 60 Sekunden
- Admin-Medienänderungen: 30 Upload-Versuche pro 60 Sekunden

Die Schlüssel enthalten keine Formularfelder, IP-Adressen oder Besucherkennungen.

## Upload-Sicherheit

`PUT /api/media/<key>` bleibt mit `CMS_ADMIN_TOKEN` geschützt und prüft:

- maximal 15 MiB,
- JPEG, PNG, WebP oder AVIF,
- MIME-Type gegen Dateisignatur,
- sichere Medienkeys,
- bereinigte Originaldateinamen,
- Rate Limiting.

Die öffentliche Ausgabe `GET /media/<key>` bleibt mit `PUBLIC_MEDIA_ENABLED=false` deaktiviert.

## Healthchecks

Öffentlich:

```text
GET /api/health
```

Erwartet:

```json
{"ok":true,"service":"gudelius-cms","release":"2026-09-24.3"}
```

Geschützt:

```text
GET /api/admin/health
Authorization: Bearer <CMS_ADMIN_TOKEN>
```

Der geschützte Check prüft D1, R2, `BREVO_API_KEY`, Brevo-Absender, Kontakt-Empfänger, Origin-Konfiguration und Admin-Token. Er verschickt selbst keine E-Mail.

## Lokale Prüfung und Deploy

Im Ordner `cloudflare`:

```bash
npm install
npm run check
npm run deploy:dry
npm run deploy
```

Ein erneutes `npm run db:init:remote` ist nur erforderlich, wenn das D1-Basisschema ausdrücklich erneut angewendet werden soll.

## Automatisierter Remote-Smoke-Test

Standardtest:

```bash
CMS_ADMIN_TOKEN="…" npm run smoke:remote
```

Kontakt-End-to-End:

```bash
CMS_ADMIN_TOKEN="…" RUN_CONTACT_TEST=1 npm run smoke:remote
```

Der E2E-Test erzeugt eine eindeutig gekennzeichnete Anfrage, prüft D1 und Admin-Anzeige, erwartet `notificationSent: true` und markiert die Testanfrage anschließend als `spam`, damit sie nicht in die Projektanfragen-KPI eingeht. Der tatsächliche E-Mail-Eingang muss zusätzlich im Zielpostfach bestätigt werden.

## Analytics / Datenschutz

In D1 werden für Analytics ausschließlich Event-Typ, normalisierter Seitenpfad, kurzes Ziel/Label und Zeitstempel gespeichert. Nicht gespeichert werden IP-Adresse, Cookies, persistente Besucher-ID, Fingerprint, User-Agent oder Kontaktformular-Inhalte. Rohereignisse werden auf 370 Tage begrenzt.

## Turnstile

Turnstile bleibt vorerst optional. Rate Limiting, Honeypot, Origin-Prüfung und Größenlimits sind bereits aktiv.

## Späterer Schritt: Cloudflare Access

Cloudflare Access wird bewusst noch nicht auf der produktiven Wix-Domain umgesetzt. Die spätere Zielarchitektur soll eine Cloudflare-kontrollierte Admin-Domain/Subdomain verwenden und den technischen Browser-Token für den Kunden ersetzen.


## R2-Medienprüfung

Die R2-Medienausgabe bleibt öffentlich deaktiviert. Für die Prüfung existieren ausschließlich mit `CMS_ADMIN_TOKEN` geschützte Audit-Endpunkte:

```text
GET /api/admin/media
GET /api/admin/media/<key>
```

`GET /api/admin/media` liefert Key, Größe, Uploadzeitpunkt, MIME-Type und den gespeicherten Originaldateinamen. Der zweite Endpunkt liefert das konkrete R2-Objekt nur nach erfolgreicher Admin-Authentifizierung.

Für eine lokale, visuelle Gesamtprüfung:

```bash
CMS_ADMIN_TOKEN="…" npm run media:audit
```

Unter `cloudflare/.media-audit/` werden anschließend ausschließlich lokal erzeugt:

- `inventory.json`
- `index.html`
- lokale Kopien der R2-Objekte zur Sichtprüfung

Der Ordner ist per `.gitignore` ausgeschlossen. Das Audit löscht und verändert keine R2-Dateien und aktiviert die öffentliche Medienausgabe nicht.


## R2-Krokodilbereinigung

Nach der visuellen Prüfung wurde bestätigt, dass die fehlerhaften R2-Objekte als Originaldatei `krokodil.png` hinterlegt sind.

Der Cleanup läuft standardmäßig nur als Dry-Run:

```bash
npm run media:cleanup
```

Dabei werden ausschließlich Objekte mit `custom_metadata.original_name = krokodil.png` als Löschziele markiert. Andere R2-Objekte werden separat als **nicht betroffen** angezeigt und niemals automatisch mitgelöscht.

Erst nach Sichtprüfung der Dry-Run-Liste:

```bash
npm run media:cleanup -- --apply
```

Der Apply-Lauf löscht nur die zuvor anhand des Originaldateinamens identifizierten Krokodil-Objekte und prüft anschließend erneut, ob noch solche Objekte vorhanden sind. Die öffentliche R2-Ausgabe bleibt währenddessen deaktiviert.

## Wix-Bilder unabhängig machen

Das Migrationsskript

```bash
npm run images:migrate-wix
```

sichert die neun tatsächlich verwendeten Wix-Originalbilder zunächst lokal unter `cloudflare/.wix-originals/`. Dieser Ordner ist absichtlich gitignored und dient als lokale Originalsicherung.

Für die Website lädt das Skript die bereits von Wix skalierten/komprimierten Web-Varianten, erkennt deren tatsächliches Bildformat anhand der Dateisignatur und speichert sie unter `assets/media/`. Danach werden ausschließlich produktive HTML-/JavaScript-Dateien auf die lokalen Pfade umgestellt.

Der Lauf ist wiederholbar:

- bestehende lokale Bildreferenzen werden auf den aktuellen Dateinamen normalisiert,
- Dokumentation und Migrationsskript werden nicht als produktive Wix-Abhängigkeit gewertet,
- `static.wixstatic.com` darf nach dem Lauf in produktiven HTML-/JS-Dateien nicht mehr vorkommen,
- Wix, DNS, D1 und R2 werden nicht verändert,
- die öffentliche R2-Ausgabe bleibt deaktiviert,
- JS-Cache-Versionen werden auf `20260924-34` erhöht.
