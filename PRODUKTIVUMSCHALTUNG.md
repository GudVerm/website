# Produktionsstart – GudeliusVermessung mit Cloudflare Pages

## Ziel (nicht GitHub Pages)

`gudeliusvermessung.de` soll die neue Website über **Cloudflare Pages** ausliefern. Das CMS bleibt als separater Cloudflare-Worker mit D1/R2 bestehen.

## Projekt auf Cloudflare Pages

In Cloudflare **Workers & Pages → Create application → Pages → Import an existing Git repository**:

| Einstellung | Wert |
|---|---|
| GitHub-Repository | `GudVerm/website` |
| Produktionsbranch | `production-cutover-20261103` |
| Framework | None |
| Build-Befehl | `node scripts/build-cloudflare-pages.mjs` |
| Build-Ausgabeverzeichnis | `dist` |
| Root directory | Repository-Wurzel |

Das Buildskript kopiert nur öffentliche Seiten und Assets nach `dist`. Der geschützte Admin wird weiterhin über den CMS-Worker und Cloudflare Access bereitgestellt.

## Voraussetzung: Domain und E-Mail

Die bislang live genutzte Wix-Seite erst nach erfolgreichem Cloudflare-Test ersetzen.

- DNS-Zone und Nameserver vollständig sichern.
- Domain als Cloudflare-Zone hinzufügen, bestehende MX/TXT/CNAME/SRV/CAA/DNSSEC-Einträge prüfen.
- Besonders MX, SPF, DKIM und DMARC **unverändert übernehmen**.
- Falls bisher fremde Nameserver gesetzt sind, die Cloudflare-Nameserver erst umstellen, wenn sämtliche notwendigen DNS-Einträge korrekt bei Cloudflare angelegt sind.
- Keine GitHub-Pages-A-Records auf 185.199.* setzen und keine GitHub-Pages-`CNAME`-Datei verwenden.
- Unter **Pages → Custom domains** die Apex-Domain `gudeliusvermessung.de` hinzufügen. Cloudflare übernimmt DNS-Ziel und TLS-Verknüpfung. `www` bei Bedarf separat hinzufügen und auf Apex weiterleiten.

## Backend-Cutover

Der bestehende Worker `gudelius-cms` erhält über `cloudflare/wrangler.jsonc` den zusätzlichen Produktions-Origin und die neue `PUBLIC_SITE_URL`. Der Staging-Origin bleibt während der Übergangsphase explizit erlaubt. Umstellung per autorisiertem `wrangler deploy`, **nicht** durch GitHub-Commit allein.

Danach Test: `OPTIONS /api/contact` vom Produktions-Origin, `GET /api/site`, Geräte-/Projektbilder, Formular inklusive Benachrichtigung, Access-Admin und CMS-Vorschau.

## Abnahme

- HTTPS auf Apex und optional www
- Startseite und vier Leistungsseiten
- Projekte, Technik, Unternehmen, Kontakt, Impressum und Datenschutz
- Bilder und Mobile-/Desktop-Crops
- Kontaktformular und Benachrichtigungs-E-Mail
- `robots.txt` und `sitemap.xml`, korrekte Canonical-URLs
- CMS-Admin, D1, R2 und Access unverändert sicher

## Rollback

Wix bis nach stabiler Abnahme behalten. Website-DNS bei Problemen auf dokumentierte Vorher-Werte zurücksetzen. E-Mail-Einträge bleiben erhalten. `main` bleibt Staging. Worker-Deploy kann mit vorheriger Wrangler-Konfiguration rückgängig gemacht werden.

**Status:** Produktionsdateien auf separatem Branch vorbereitet. Es besteht noch **kein bestätigter Cloudflare-Pages-Deploy**, keine DNS-Umstellung und kein Live-Cutover.
