# Gudelius CMS – Cloudflare Backend

Dieses Verzeichnis enthält das bestehende Cloudflare-Backend für GudeliusVermessung. Die öffentliche Website bleibt während der Backend-Härtung auf GitHub Pages; die produktive Wix-Seite und sämtliche produktiven DNS-/E-Mail-Einträge bleiben unangetastet.

## Architektur

- **Worker:** `gudelius-cms`
- **D1:** `DB` → `gudelius-cms-db`
- **R2:** `MEDIA` → `gudelius-media`
- **Transaktionsmail:** Brevo API über das Secret `BREVO_API_KEY`
- **Absender:** verifizierter Brevo-Sender `gudeliusvermessung@web.de`
- **Empfänger:** `gudeliusvermessung@web.de`
- **Admin-Zugang:** Cloudflare Access mit One-time PIN; der technische Token-Fallback ist deaktiviert
- **Admin-Allowlist:** zusätzlich serverseitig im Worker auf `gudeliusvermessung@web.de` und `jost@gudeliusvermessung.de` begrenzt (`ADMIN_ALLOWED_EMAILS`)
- **Erlaubter Browser-Origin:** `ALLOWED_ORIGIN=https://gudverm.github.io`
- **Öffentliche R2-Ausgabe:** `PUBLIC_MEDIA_ENABLED=true` – veröffentlichte CMS-Bilder werden live aus R2 ausgeliefert
- **Token-Fallback:** `ADMIN_TOKEN_FALLBACK_ENABLED=false`

Die kostenpflichtige Cloudflare-Email-Sending-Bindung wird nicht mehr verwendet. Damit entstehen für das Kontaktformular derzeit keine Cloudflare-Email-Sending-Kosten. Wix, Domain-DNS und bestehende E-Mail-DNS-Einträge werden dadurch nicht verändert.

Die aktuelle Worker-Releasekennung im Repository ist `2026-10-07.8`.

## Secrets

Folgendes Secret wird produktiv benötigt:

```text
BREVO_API_KEY
```

Für die optionale Turnstile-Aktivierung wird zusätzlich benötigt:

```text
TURNSTILE_SECRET_KEY
```

Solange `TURNSTILE_SECRET_KEY` nicht gesetzt ist, bleibt Turnstile serverseitig deaktiviert; Honeypot, Origin-Prüfung, Größenlimits und Rate Limiting bleiben weiterhin aktiv.

`CMS_ADMIN_TOKEN` ist seit der Access-Umstellung nicht mehr für den Admin-Workflow erforderlich; `ADMIN_TOKEN_FALLBACK_ENABLED=false` bleibt gesetzt.

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
PUBLIC_MEDIA_ENABLED=true
ADMIN_ALLOWED_EMAILS=gudeliusvermessung@web.de,jost@gudeliusvermessung.de
```

## Kontaktformular und E-Mail

`POST /api/contact`:

1. akzeptiert nur den konfigurierten Browser-Origin,
2. verlangt `application/json`,
3. begrenzt den Request auf 16 KiB,
4. verwendet das bestehende Honeypot-Feld,
5. validiert Pflichtfelder und E-Mail-Adresse,
6. validiert bei gesetztem `TURNSTILE_SECRET_KEY` den Browser-Token serverseitig über Cloudflare Siteverify,
7. speichert die Anfrage zuerst in D1,
8. sendet danach die Benachrichtigung über Brevos Transactional-Email-API,
9. setzt die Formularadresse als `Reply-To`,
10. speichert keine Formularinhalte in der Analytics-Tabelle.

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

`PUT /api/admin/media/<key>` ist über Cloudflare Access und die serverseitige E-Mail-Allowlist geschützt und prüft:

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
{"ok":true,"service":"gudelius-cms","release":"2026-10-04.5"}
```

Geschützt:

```text
GET /api/admin/health
Cloudflare-Access-Sitzung erforderlich
```

Der geschützte Check prüft D1, R2, `BREVO_API_KEY`, Brevo-Absender, Kontakt-Empfänger, Origin-Konfiguration sowie die Access-/Allowlist-Konfiguration. Ein vorhandenes altes `CMS_ADMIN_TOKEN` ist nicht erforderlich. Der Check verschickt selbst keine E-Mail.

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

Der aktuelle Remote-Smoke-Test benötigt keinen Admin-Token:

```bash
npm run smoke:remote
```

Er prüft den öffentlichen Healthcheck samt erwarteter Worker-Release, `/api/site`, CORS, die deaktivierte öffentliche R2-Ausgabe, Beacon-kompatible Analytics, abgeschaltete Legacy-Adminrouten und die Access-Grenze vor `/api/admin/*`.

Der Test meldet für `/api/admin/session` zusätzlich den manuellen Browser-Check, weil eine persönliche Cloudflare-Access-Sitzung nicht aus einem unbeaufsichtigten CLI-Test übernommen werden soll. Ein vollständiger Kontakt-End-to-End-Test mit D1/Brevo bleibt Teil des Pre-Launch-Checks und wird bewusst nicht automatisch mit Testanfragen im Produktivbestand ausgeführt.

## Analytics / Datenschutz

In D1 werden für Analytics ausschließlich Event-Typ, normalisierter Seitenpfad, kurzes Ziel/Label und Zeitstempel gespeichert. Nicht gespeichert werden IP-Adresse, Cookies, persistente Besucher-ID, Fingerprint, User-Agent oder Kontaktformular-Inhalte. Rohereignisse werden auf 370 Tage begrenzt.

## Turnstile

Turnstile bleibt vorerst optional. Rate Limiting, Honeypot, Origin-Prüfung und Größenlimits sind bereits aktiv.

## Cloudflare Access – aktueller Stand

Cloudflare Access ist auf der Worker-Adminadresse aktiv und schützt `/admin/*` sowie `/api/admin/*`. Die öffentliche Wix-Produktivdomain wird davon nicht berührt. Der technische Browser-Token ist deaktiviert; die serverseitige E-Mail-Allowlist bleibt als zusätzliche Schranke aktiv.

## R2-Medienprüfung

Die öffentliche R2-Medienausgabe bleibt mit `PUBLIC_MEDIA_ENABLED=false` deaktiviert. Das geschützte Inventar und die Einzelvorschau stehen im Access-Admin über die zentrale Medienbibliothek zur Verfügung.

Die früheren CLI-Skripte `media-audit.mjs` und `media-cleanup.mjs` wurden entfernt: Sie basierten auf dem inzwischen deaktivierten `CMS_ADMIN_TOKEN` und waren nach der Access-Umstellung nicht mehr funktionsfähig. Die historische Krokodilbereinigung ist abgeschlossen; weitere R2-Änderungen erfolgen nur gezielt über die geschützten Admin-Endpunkte bzw. die Medienbibliothek.

## Wix-Bilder unabhängig machen

Das Migrationsskript

```bash
npm run images:migrate-wix
```

sichert die neun tatsächlich verwendeten Wix-Originalbilder zunächst lokal unter `cloudflare/.wix-originals/`. Dieser Ordner ist absichtlich gitignored und dient als lokale Originalsicherung.

Für die Website lädt das Skript die bereits von Wix skalierten/komprimierten Web-Varianten, erkennt deren tatsächliches Bildformat anhand der Dateisignatur und speichert sie unter `assets/media/`. Danach werden produktive HTML-, JavaScript- und CSS-Dateien auf die lokalen Pfade umgestellt.

Der Lauf ist wiederholbar:

- bestehende lokale Bildreferenzen werden auf den aktuellen Dateinamen normalisiert,
- Dokumentation und Migrationsskript werden nicht als produktive Wix-Abhängigkeit gewertet,
- `static.wixstatic.com` darf nach dem Lauf in produktiven HTML-/JS-/CSS-Dateien nicht mehr vorkommen,
- Wix, DNS, D1 und R2 werden nicht verändert,
- die öffentliche R2-Ausgabe bleibt deaktiviert,
- Website-Cache-Versionen werden auf `20260924-38` erhöht.

Hinweis: Die vier Leistungsseiten liegen zwei Ebenen tief und verwenden deshalb lokale Medienpfade mit `../../assets/media/`; die übrigen öffentlichen Seiten nutzen ihre bestehende Base-URL-Struktur.

Die Pfadnormalisierung akzeptiert beliebig viele vorangestellte `../` und schreibt jeden Medienpfad deterministisch auf den für die jeweilige Seite richtigen lokalen Pfad zurück. Dadurch ist auch ein erneuter Lauf nach einer bereits begonnenen Migration sicher.


### Browserkompatible Bildausgabe

Die erste lokale Migration verwendete AVIF-Webvarianten. Auf der GitHub-Pages-Testseite konnte der Hero dadurch in einzelnen Browser-/Auslieferungskonstellationen nur als dunkler Hintergrund erscheinen. Das Migrationsskript fordert deshalb ab Version 0.3.7 keine AVIF-Ausgabe mehr an und bricht ab, falls Wix trotzdem AVIF liefert. JPEG, PNG und WebP bleiben zulässig.

Zusätzlich werden nun auch Bild-URLs in `assets/gudelius-site.css` migriert. Damit werden die verbliebenen Wix-Bildreferenzen in den Theme-/Kontakt-Hintergründen ebenfalls lokalisiert.


## Cloudflare Access – vorbereiteter Admin-Namespace

Seit Release `2026-09-24.4` liegen alle vom Browser-Admin benötigten geschützten Operationen kanonisch unter `/api/admin/*`:

```text
GET    /api/admin/session
GET    /api/admin/health
GET    /api/admin/analytics
GET    /api/admin/inquiries
PUT    /api/admin/inquiries/<id>
PUT    /api/admin/content/<key>
DELETE /api/admin/content/<key>
GET    /api/admin/media
GET    /api/admin/media/<key>
PUT    /api/admin/media/<key>
DELETE /api/admin/media/<key>
```

Öffentlich bleiben insbesondere:

```text
GET  /api/health
GET  /api/site
POST /api/contact
POST /api/analytics/event
GET  /media/<key>   (weiterhin durch PUBLIC_MEDIA_ENABLED=false gesperrt)
```

### Übergangs-Authentifizierung – abgeschlossen

Die frühere Übergangsphase mit technischem Browser-Token ist beendet. `ADMIN_TOKEN_FALLBACK_ENABLED=false` bleibt gesetzt; administrative Requests werden nur mit gültiger Cloudflare-Access-Sitzung und erlaubter E-Mail-Adresse akzeptiert.

`GET /api/admin/session` zeigt den aktiven Authentifizierungsmodus an, ohne Secret-Werte auszugeben. Die früheren administrativen Legacy-Routen außerhalb von `/api/admin/*` sind abgeschaltet und liefern `404`.

### Access-Aktivierung – abgeschlossen

Die Access-Anwendung schützt `/admin/*` und `/api/admin/*`; öffentliche APIs wie `/api/site`, `/api/contact` und `/api/analytics/event` bleiben erreichbar. Zusätzlich prüft der Worker die erlaubten Admin-E-Mail-Adressen serverseitig. Der Token-Fallback bleibt deaktiviert.

## Cloudflare Access – Admin-Oberfläche über den Worker

Seit Release `2026-09-24.5` steht die bestehende Admin-Oberfläche zusätzlich unter `/admin/` am Worker bereit. Der Worker lädt die weiterhin im Repository gepflegten Admin-Dateien serverseitig von der GitHub-Pages-Testseite und liefert sie unter derselben Origin wie `/api/admin/*` aus. Cloudflare Workers Static Assets wird bewusst nicht verwendet, damit `ctx.access` im Worker verfügbar bleibt.

`/admin/config.js` wird dynamisch erzeugt und setzt `GUDELIUS_CMS_USE_ACCESS=true`. Dadurch benötigt die Worker-Adminoberfläche keinen technischen Browser-Token. Die GitHub-Pages-Adminoberfläche verweist auf die Access-geschützte Worker-Adminoberfläche; ein Token-Fallback wird nicht verwendet.

Vorgesehene Access-Pfade:

```text
/admin/*
/api/admin/*
```

`/admin` selbst leitet nur auf `/admin/` weiter. Öffentliche Website-APIs bleiben außerhalb dieser Pfade. Bis der Access-E2E-Test abgeschlossen ist, bleibt `ADMIN_TOKEN_FALLBACK_ENABLED=false`.


### Access-Verbindungsseite

Im Worker-Admin wird das technische Token-Feld vollständig ausgeblendet. Die Worker-URL ist schreibgeschützt und der Verbindungstest heißt dort `Access-Status prüfen`.

Solange die eigentliche Access-Anwendung noch nicht eingerichtet ist, antwortet `/api/admin/session` erwartungsgemäß mit HTTP 401. Die Oberfläche unterscheidet diesen Zustand jetzt von einem Worker-Ausfall: Wenn `/api/health` erreichbar ist, wird neutral gemeldet, dass Access noch nicht aktiv beziehungsweise noch keine gültige Access-Sitzung vorhanden ist.


## Punkt 9E – Cloudflare Access als alleinige Admin-Authentifizierung

Seit Release `2026-09-24.7` ist `ADMIN_TOKEN_FALLBACK_ENABLED=false`. Administrative Requests werden nur noch akzeptiert, wenn Cloudflare Access dem Worker eine gültige `ctx.access`-Sitzung liefert.

Die früheren administrativen Legacy-Routen außerhalb von `/api/admin/*` liefern nun `404`. Ein eventuell noch gespeichertes `CMS_ADMIN_TOKEN` kann diese Sperre nicht umgehen. Der Admin-Healthcheck hängt nicht mehr davon ab, ob dieses Secret vorhanden ist.

Die alte GitHub-Pages-Adminoberfläche verweist auf die Access-geschützte Worker-Adminoberfläche. Öffentliche Endpunkte (`/api/health`, `/api/site`, `POST /api/contact`, `POST /api/analytics/event`) bleiben unverändert öffentlich.

Der Remote-Smoke-Test benötigt keinen Admin-Token mehr. Nach erfolgreichem Produktivtest kann das nicht mehr verwendete Secret mit `npx wrangler secret delete CMS_ADMIN_TOKEN` vollständig entfernt werden.


## Kontaktformular / Analytics – Beacon-Kompatibilität

Seit Release `2026-09-24.8` akzeptiert `POST /api/analytics/event` sowohl `application/json` als auch `text/plain`. Das ist absichtlich so, weil die öffentliche Website Analytics-Ereignisse bevorzugt über `navigator.sendBeacon()` sendet. Der Body muss weiterhin gültiges JSON enthalten und durchläuft unverändert die Event-Typ-, Pfad-, Größen-, Origin- und Rate-Limit-Prüfungen.

Kontaktformular-Inhalte werden weiterhin ausschließlich in `contact_requests` gespeichert. Analytics speichert nur `event_type`, normalisierten `page_path`, `target`, `event_label` und `created_at`; Name, E-Mail, Betreff und Nachricht werden nicht in `analytics_events` übernommen.


## Admin-Asset-Versionierung nach Kanban-Umbau

Seit Release `2026-09-24.9` schreibt der Worker beim Ausliefern der Access-geschützten Admin-Oberfläche den Admin-JavaScript-Cache auf `admin.js?v=20260924-46` um. Zuvor wurde trotz neuer HTML-Version weiterhin `20260924-44` erzwungen. Dadurch konnten neue UI-Funktionen wie die Umschaltung zwischen Kanban- und Listenansicht im Worker-Admin fehlen, obwohl der aktuelle Quellcode bereits im Repository lag.


## Anfragen-Kanban: horizontale Navigation

Seit Release `2026-09-24.10` hat die Access-Adminseite für Anfragen oberhalb des Kanban eine synchronisierte horizontale Scrollleiste. Zusätzlich kann die freie Kanban-Fläche am Desktop per Maus horizontal gezogen und per Pfeiltasten verschoben werden. Karten bleiben weiterhin für den Statuswechsel zwischen den Spalten drag-and-drop-fähig. Auf Touch-Geräten bleibt horizontales Wischen aktiv.


## Technik-Admin: cachefeste helle Platzhalter

Seit Release `2026-09-24.11` verwenden Trimble SX12, RTK-Drohne und BBSOFT neue versionierte helle Platzhalterdateien. Der Worker versieht außerdem proxied `/assets/*`-Abrufe mit der Worker-Release als Upstream-Query und liefert sie mit `cache-control: no-store` aus. Damit können alte dunkle SVG-Versionen im Access-Admin nicht mehr aus Browser- oder Proxy-Caches weiterverwendet werden.


## Technik-Admin: Inline-Fallback für problematische Vorschauen

Seit Release `2026-09-24.12` erzeugt der Admin für Trimble SX12, RTK-Drohne und BBSOFT den hellen Platzhalter direkt als Data-URI im Browser. Diese drei Vorschauen sind damit vollständig unabhängig von externen SVG-Dateien, GitHub-Pages-Asset-Caches und dem Worker-Asset-Proxy. Das betrifft nur die Admin-Vorschau im Fallback-Modus; echte ausgewählte oder hochgeladene Bilder ersetzen den Platzhalter weiterhin normal.


## Audit-Log

Wichtige administrative Änderungen werden in D1 in `audit_log` protokolliert. Gespeichert werden Zeitpunkt, Access-E-Mail, Aktion, Bereich, Ziel-Key und eine kurze technische Detailangabe. Passwörter, Tokens und Inhalte aus Kontaktformularen werden nicht in das Audit-Log geschrieben. Änderungen an den Projekt- und Technik-Manifesten werden zusätzlich als `angelegt`, `geändert` oder `gelöscht` klassifiziert; geloggt werden dabei nur Slug/Key und technische Aktion, keine redaktionellen Inhalte.

Der Admin stellt die Historie unter `/admin/audit/` bereit; die API lautet `GET /api/admin/audit` und ist Access-geschützt.

## Medienbibliothek

Die zentrale Medienbibliothek im Admin liest den Medienkatalog aus `admin/admin-data.js`, zeigt R2-/Fallback-Status sowie gespeicherte Crop-Werte und verlinkt direkt in den zuständigen CMS-Bereich.

## Turnstile

Die Browser-Konfiguration enthält einen optionalen `GUDELIUS_TURNSTILE_SITE_KEY`. Solange dieser leer ist, wird kein Turnstile-Widget geladen. Honeypot, Origin-Prüfung, Größenlimits und Rate Limiting bleiben unabhängig davon aktiv.

Der Worker unterstützt die serverseitige Verifikation über Cloudflare Siteverify. Sie wird automatisch aktiv, sobald das Secret `TURNSTILE_SECRET_KEY` gesetzt ist. Ab diesem Zeitpunkt wird jede normale Kontaktanfrage ohne gültigen Turnstile-Token abgewiesen; Honeypot-Treffer werden weiterhin neutral beantwortet.

Aktivierungsreihenfolge, damit es keinen Formularausfall gibt:

1. Turnstile-Widget in Cloudflare für die tatsächlich verwendeten Website-Hosts anlegen.
2. Den öffentlichen Site-Key in `assets/cms-config.js` als `GUDELIUS_TURNSTILE_SITE_KEY` setzen und die Website veröffentlichen.
3. `npx wrangler secret put TURNSTILE_SECRET_KEY` ausführen.
4. Den Worker mit `npm run deploy` deployen.
5. Das Kontaktformular End-to-End testen.

Beim Deaktivieren zuerst das Worker-Secret entfernen und deployen, erst danach den öffentlichen Site-Key leeren. Secret-Werte werden niemals in Git oder Dokumentation eingetragen.


## CMS-Versionierung und Wiederherstellung

Vor jeder Änderung eines bereits vorhandenen CMS-Keys sowie vor jeder Löschung speichert der Worker den vorherigen Wert in D1 in `content_history`. Die Historie ist auf die jüngsten 2000 Snapshots begrenzt.

Im Access-geschützten Audit-Bereich können Versionen nach Key gesucht und wiederhergestellt werden. Vor einer Wiederherstellung wird der aktuelle Stand ebenfalls als `restore_backup` gesichert, sodass auch ein versehentliches Zurücksetzen wieder rückgängig gemacht werden kann. Wiederherstellungen werden zusätzlich im Audit-Log protokolliert. Kontaktanfragen, Passwörter und Tokens sind nicht Bestandteil dieser Inhaltsversionierung.


## Entwurfsmodus, Vorschau und CMS-Backup

Für Startseite, Leistungen, Unternehmen, Technik, Projekte und Kontakt steht im Access-Admin ein Entwurfsmodus zur Verfügung. Ist er aktiv, werden über die normalen Speichern-Funktionen erzeugte Text- und Strukturwerte in `content_drafts` abgelegt. Die öffentliche Website liest weiterhin ausschließlich `content`.

Die Schaltfläche **Vorschau öffnen** lädt die jeweilige öffentliche Seite Access-geschützt über `/admin/preview/*` und mischt dabei veröffentlichte Inhalte mit den aktuellen Entwürfen. **Alle veröffentlichen** übernimmt die Entwürfe in `content`; vorherige Live-Werte werden dabei wie gewohnt in `content_history` gesichert. **Alle verwerfen** löscht nur die Entwürfe.

Medienuploads sowie explizite Lösch-/Archivierungsaktionen bleiben direkte administrative Änderungen und werden nicht durch den Entwurfsmodus verzögert.

`GET /api/admin/backup` erzeugt einen Access-geschützten JSON-Export aus veröffentlichten CMS-Inhalten, Entwürfen und Inhaltsversionen. Kontaktanfragen und deren personenbezogene Inhalte sind bewusst nicht Teil dieses CMS-Backups.


## Monitoring und Admin-Dashboard

Der Workflow `.github/workflows/website-monitor.yml` prüft alle sechs Stunden die öffentliche GitHub-Pages-Website, den öffentlichen Worker-Healthcheck und den lesenden Zugriff auf `/api/site`. Fehler werden als fehlgeschlagener GitHub-Actions-Lauf sichtbar; es werden dafür keine zusätzlichen Secrets benötigt.

Die Admin-Startseite zeigt live den Backendstatus, die Worker-Releasekennung, neue/gesamte Anfragen, vorhandene Entwürfe, die Zahl der R2-Objekte und die letzten Audit-Ereignisse. Von dort kann außerdem der Access-geschützte CMS-Backup-Export direkt heruntergeladen werden.


## Release 2026-10-04.5 – Admin- und Qualitätsausbau

Dieses Release bündelt alle Worker-/D1-relevanten Änderungen des aktuellen Ausbaus:

- Entwurfs-API liefert Live- und Entwurfswerte gemeinsam.
- Mehrere ausgewählte Entwürfe können Access-geschützt verworfen werden; Veröffentlichung unterstützt weiterhin Key-Auswahl und versioniert den vorherigen Live-Wert.
- R2-Uploads können Bildbreite/-höhe als nicht-sensitive Custom Metadata speichern; das Inventar gibt Dateigröße, Typ, Uploadzeit und diese Abmessungen zurück.
- `contact_requests` erhält additiv `priority` und `follow_up_at`. Bestehende Tabellen werden per `PRAGMA table_info` geprüft und ausschließlich um fehlende Spalten ergänzt.
- Gültige Prioritäten: `niedrig`, `normal`, `hoch`, `dringend`.
- Der zusätzliche Status `antwort-ausstehend` ist zulässig.
- Audit-Logging bleibt für Anfrageänderungen, Entwurfspublish/-verwerfen und Inhaltsänderungen aktiv.

### D1-Migration

Die Migration ist nicht destruktiv. Beim Aufruf von `ensureContactTable()` werden nur fehlende Spalten ergänzt:

```text
priority     TEXT NOT NULL DEFAULT 'normal'
follow_up_at TEXT NOT NULL DEFAULT ''
```

Zusätzlich entstehen Indizes für `priority` und `follow_up_at`.

### Neue Admin-Funktionen

- Cropper-Zielvorschau für Hero/Karte/Portrait/Mobil mit identischer XY-/Zoom-/Drehlogik wie das Frontend.
- zentrale Warnung vor ungespeicherten Änderungen.
- Entwurfsmanager mit Live↔Entwurf-Differenz, Einzeln-/Mehrfach-Publish und -Verwerfen.
- Medienbibliothek mit Größe, Abmessungen, Typ, Verwendung, Crop, Fallback/R2 und Filtern für ungenutzte/große/externe Medien.
- Anfrageverwaltung mit Priorität, Wiedervorlage, Überfälligkeitsanzeige, „seit X Tagen unbeantwortet“, Status „Antwort ausstehend“ und lokalem CSV-Export.

### Quality-Workflows

`Website quality` enthält zusätzlich visuelle Regression, axe-core/WCAG, Staging-/Produktionsprüfung und CMS-/Admin-Vertragsprüfung. Referenzbilder liegen versioniert unter `quality/visual-baselines/`; Abweichungen erzeugen Diff-Artefakte statt automatisch akzeptiert zu werden.

`Visual baseline initialize` ist ausschließlich zur bewussten Initialisierung/Aktualisierung von Referenzen vorgesehen. Eine Änderung der Website akzeptiert visuelle Abweichungen nicht automatisch.


## Release 2026-10-06.1 – Autoritativer Entwurfszähler

- Jeder erfolgreiche Draft-Speichervorgang liefert die tatsächliche Anzahl der D1-Einträge in `content_drafts`.
- Der Admin übernimmt diese Anzahl sofort und validiert zusätzlich `draft:true`.
- Der Admin-Proxy versioniert `admin.js` und `config.js` mit der Worker-Releasekennung statt mit fest verdrahteten Altwerten.


## Release 2026-10-06.2 – Vorschau mit eingebettetem Draft-Snapshot

- Die Access-Vorschau bettet den zusammengeführten Live+Draft-Datenbestand direkt in das ausgelieferte HTML ein.
- `gudelius-site.js` verwendet in der Vorschau zuerst diesen Snapshot und benötigt dafür keinen zweiten API-Request.
- Dadurch können Access-Cookie-, Timing- oder Fetch-Probleme die Vorschau nicht mehr auf Live-/Fallback-Inhalte zurückfallen lassen.


## Release 2026-10-06.3 – Preview-Konfiguration inline

- Die Access-Vorschau bettet CMS-API, Preview-Flag und den zusammengeführten Live+Draft-Snapshot direkt in die HTML-Seite ein.
- Der frühere relative Request auf `/admin/preview/config.js` entfällt.
- Damit kann das in der Vorschau gesetzte `<base href>` die Preview-Konfiguration nicht mehr versehentlich auf GitHub Pages umleiten.


## Release 2026-10-07.1 – Geschützte Projektbilder in Admin und Vorschau

- Admin und Access-Vorschau laden R2-Bilder über `/api/admin/media/<key>`.
- `PUBLIC_MEDIA_ENABLED=false` bleibt unverändert; die öffentliche Medienausgabe wird nicht geöffnet.
- Die öffentliche Website verwendet weiterhin `/media/<key>` und bleibt dadurch geschützt.


## Release 2026-10-07.2 – Konsistenter Projektbild-Upload

- Admin-Uploads auf `/api/admin/media/<key>` liefern als Rückgabe-URL ebenfalls den Access-geschützten Medienpfad statt des bei `PUBLIC_MEDIA_ENABLED=false` gesperrten öffentlichen `/media/<key>`-Pfads.
- Der Projekt-Admin bestätigt den Upload weiterhin durch direktes Rücklesen aus R2 über `GET /api/admin/media/<key>`.
- Die Access-Vorschau verwendet weiterhin `GUDELIUS_CMS_MEDIA_ENDPOINT='/api/admin/media'`; die öffentliche Medienausgabe bleibt unverändert deaktiviert.
- Der CMS-Vertragscheck sichert diesen Projektbild-Pfad gegen Regressionen ab.


## Release 2026-10-07.3 – Impressum und Audit-Veröffentlichungsdetails

- `/admin/impressum/` ist als Access-geschützter Admin-Bereich freigeschaltet und unterstützt Entwürfe sowie Vorschau.
- Das öffentliche Impressum liest die editierbaren rechtlichen Angaben über `impressum/*`-CMS-Keys.
- Admin-Navigation normalisiert Audit- und Impressum-Links auf die geschützten Worker-Pfade `/admin/audit/` und `/admin/impressum/`.
- Veröffentlichungen im Audit-Log werden mit der Inhalts-Historie verknüpft. Beim Hover/Fokus kann der Admin den rekonstruierten Vorher-/Nachher-Stand der jeweiligen Veröffentlichung sehen.


## Release 2026-10-07.4 – Echte Draft-Differenzen und leere CMS-Werte

- Entwürfe werden nur noch gespeichert, wenn ihr Wert tatsächlich vom Live-Stand abweicht.
- Bereits vorhandene Entwürfe ohne inhaltliche Differenz werden beim Laden der Draft-Liste automatisch bereinigt.
- Der Impressum-Editor vergleicht vor dem Speichern mit dem aktuellen CMS-/Entwurfsstand und schreibt nur geänderte Felder.
- Explizit leere CMS-Textwerte überschreiben statische Fallback-Texte. Damit sind bewusst gelöschte Texte auch in der Vorschau und nach Veröffentlichung wirklich leer.


## Release 2026-10-07.5 – Medien als eigener Admin-Bereich

- `/admin/medien/` ist jetzt ein eigener Access-geschützter Admin-Bereich.
- Der Menüpunkt Medien führt nicht mehr auf einen Anker der Dashboard-Seite, sondern direkt in die Medienbibliothek.
- Dashboard-KPI und Dashboard-Kachel verlinken ebenfalls auf den neuen Medienbereich.
- Die große Medienbibliothek wurde aus der Dashboard-Übersicht entfernt, damit die Startseite wieder ausschließlich als Übersicht dient.


## Release 2026-10-07.6 – Öffentliche CMS-Medien aktiviert

- `PUBLIC_MEDIA_ENABLED=true`: veröffentlichte CMS-Bilder werden auf der öffentlichen GitHub-Pages-Website über `/media/<key>` aus R2 ausgeliefert.
- Die öffentliche `assets/cms-config.js` setzt `GUDELIUS_CMS_MEDIA_ENABLED=true`.
- Damit ersetzen hochgeladene Bilder – unter anderem die Leistungskarten auf der Startseite – ihre statischen Fallback-Bilder auch live.
- Admin- und Preview-Medienpfade bleiben unverändert Access-geschützt.


## Release 2026-10-07.7 – Vorschau-Basispfade korrigiert

- Die Admin-Vorschau respektiert vorhandene `<base href>`-Angaben der öffentlichen Seite und löst sie absolut gegen deren echte URL auf.
- Dadurch laden Unterseiten wie `unternehmen/` ihre CSS-, JS- und Bild-Assets wieder von der korrekten Website-Basis statt fälschlich unter `/admin/preview/.../assets/`.
- Seiten ohne eigenes `<base>` erhalten weiterhin automatisch eine passende absolute Basis.


## Release 2026-10-07.8 – Medien-Cache revalidieren

- Öffentliche R2-Medien werden nicht mehr eine Stunde blind unter demselben Medien-Key gecacht.
- `/media/<key>` liefert jetzt `Cache-Control: public, max-age=0, must-revalidate` zusammen mit dem R2-ETag.
- Nach einem Bild-Upload unter einem bestehenden Key prüft der Browser beim nächsten Laden sofort auf die neue R2-Version.
