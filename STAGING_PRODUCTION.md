# Produktionsumstellung GudeliusVermessung

## Status

Der Branch `production-cutover-20261103` enthält die **vorbereitete** Produktionskonfiguration.
Dieser Branch ist **noch nicht** die live erreichbare Website. Die Domain- und Cloudflare-Umschaltung steht aus.
`main` bleibt bis zur finalen Freigabe auf Staging.

## Vorbereitete Konfiguration

- Geplante öffentliche Website: https://gudeliusvermessung.de/
- GitHub Pages: `CNAME` mit `gudeliusvermessung.de`
- CMS: https://gudelius-cms.gudeliusvermessung.workers.dev/
- Cloudflare-Worker `PUBLIC_SITE_URL` = `https://gudeliusvermessung.de/`
- Cloudflare-Worker `ALLOWED_ORIGIN` = `https://gudeliusvermessung.de`
- Produktion erlaubt Suchmaschinen das Crawling; `sitemap.xml` nutzt Produktions-URLs
- 404-Seite und geschütztes CMS bleiben weiterhin `noindex`

## Kritische Schritte vor dem Zusammenführen in main

1. DNS-Zone der vorhandenen Domain sichern (inklusive A, AAAA, CNAME, MX, TXT, CAA und DNSSEC); Mailkonfiguration unverändert lassen.
2. Cloudflare-Worker anhand dieser Branch-Konfiguration mit `wrangler deploy` veröffentlichen. Erst danach wird die Domain im Kontaktformular korrekt als Origin akzeptiert.
3. Produktions-Origin per Preflight `OPTIONS /api/contact` und öffentlichen CMS-Zugriff `GET /api/site` prüfen.
4. GitHub Pages mit der Domain `gudeliusvermessung.de` verknüpfen, sobald die Worker-Seite bereit ist.
5. Nur die **Website-DNS-Einträge** umstellen:
   - `@` A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - optional `@` AAAA nach den GitHub-Pages-Werten
   - `www` CNAME: `gudverm.github.io`
   - alte Wix-A/AAAA/CNAME-Einträge für dieselben Hosts durch die neuen Werte **ersetzen**, nicht zusätzlich widersprüchliche Einträge stehen lassen
   - MX, SPF, DKIM, DMARC und andere Mail-Einträge **nicht ändern**
6. Branch erst nach den obigen Schritten freigeben und in `main` übernehmen, damit die Produktionsdatei `CNAME` aktiviert wird.
7. Bei GitHub Pages `Enforce HTTPS` aktivieren und sowohl Apex als auch `www` prüfen.
8. Browsercheck auf Mobil/Tablet/Desktop, alle Unterseiten, Kontaktformular, CMS-R2-Bilder, Admin-Vorschau, `robots.txt` und `sitemap.xml` prüfen.

## Rollback

- Bisherige Wix-Seite bis zur abgeschlossenen Abnahme erhalten.
- DNS-Änderungen schriftlich protokollieren; bei einem Fehler die zuvor gesicherten Website-DNS-Einträge wiederherstellen.
- Cloudflare-Worker bei Bedarf wieder auf den Staging-Origin konfigurieren.
- Änderungen am Code regulär revertieren, keine Force-Pushes.

**Wichtig:** Eine `CNAME`-Datei allein schaltet die Domain nicht um. DNS, HTTPS und der tatsächlich deployte Cloudflare-Worker müssen zusammenpassen.
