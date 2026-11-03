# Staging und Produktion – Cloudflare Pages

## Architektur

- **Staging:** `main` → GitHub Pages: https://gudverm.github.io/website/ (weiterhin noindex)
- **Vorbereitete Produktion:** Branch `production-cutover-20261103` → **Cloudflare Pages**, zunächst `*.pages.dev`, später https://gudeliusvermessung.de/
- **Öffentliche Website:** reine statische HTML-, CSS-, JS- und Mediendateien; Buildskript `scripts/build-cloudflare-pages.mjs`
- **Ausgabeverzeichnis:** `dist`; enthält weder `admin/`, `cloudflare/`, `quality/` noch `.github/`
- **CMS/Admin:** bestehender Cloudflare-Worker https://gudelius-cms.gudeliusvermessung.workers.dev/admin/
- **Daten:** bestehende D1-Datenbank, R2-Bucket und Brevo bleiben unverändert.
- **Kein GitHub-Pages-CNAME:** Die Domain wird ausschließlich in **Cloudflare Pages → Custom domains** eingerichtet.

Die Konfiguration auf dem Produktions-Branch veröffentlicht **noch keine** Änderung an der Domain, am Worker oder an den DNS-Einträgen.

## Cloudflare-Pages-Projekt einrichten

1. Bei Cloudflare anmelden und **Workers & Pages → Create application → Pages → Import an existing Git repository** öffnen.
2. GitHub mit dem vorhandenen Repository `GudVerm/website` verbinden.
3. Folgende Werte verwenden:

   - Framework-Preset: **None**
   - Production branch: `production-cutover-20261103`
   - Root directory: Repository-Wurzel `/`
   - Build command: `node scripts/build-cloudflare-pages.mjs`
   - Build output directory: `dist`

4. **Save and Deploy** ausführen. Zuerst die von Cloudflare angezeigte `*.pages.dev`-Adresse auf Inhalt, Bilder, Navigation und Responsiveness prüfen. CMS-/Formular-Zugriffe über die neue Pages-Domain benötigen bei Bedarf eine zusätzliche explizite Origin-Freigabe – niemals CORS `*` setzen.
5. Vor Umstellung der Bestandsdomain den Worker-Stand, DNS und E-Mail vollständig prüfen.

Cloudflare Pages übernimmt nach der GitHub-Verbindung neue Commits auf dem gewählten Produktions-Branch automatisch.

## Domain-Umschaltung

1. Bestehende DNS-Zone vollständig sichern: Nameserver, A/AAAA/CNAME, MX, SPF, DKIM, DMARC, TXT, SRV, CAA und DNSSEC.
2. Domain `gudeliusvermessung.de` als Zone in Cloudflare hinterlegen. Für die **Apex-Domain** verlangt Cloudflare Pages eine Cloudflare-DNS-Zone mit passenden Nameservern.
3. Vor der Nameserverumstellung ALLE E-Mail-, Verifizierungs- und anderen weiterhin benötigten Records korrekt bei Cloudflare anlegen und vergleichen. Kein Mailrecord darf fehlen oder geändert werden.
4. Bei Cloudflare Pages im Projekt **Custom domains → Set up a domain** `gudeliusvermessung.de` hinzufügen. Cloudflare richtet den erforderlichen DNS-Bezug ein.
5. Optional `www.gudeliusvermessung.de` als weitere Custom Domain hinzufügen und eine kanonische HTTPS-Weiterleitung von www auf Apex konfigurieren.
6. Nach dem erforderlichen Cloudflare-Worker-Deploy prüfen, dass `ALLOWED_ORIGIN` die neue Domain enthält und `PUBLIC_SITE_URL` die neue öffentliche URL hat.
7. Alle Unterseiten, Kontaktformular, CMS, Medien, 404, SSL, Sitemap und Suchmaschinenfreigabe über die echte Domain testen.

**Keine** GitHub-Pages-A-Records (185.199.*), kein `www → gudverm.github.io` und keine GitHub-Pages-CNAME-Datei verwenden.

## Rollback

- Die bisherige Wix-Seite während des Cutovers mindestens 48 Stunden als Rückfalloption erhalten.
- Vorherige Website-DNS-Einträge sichern und bei Bedarf wiederherstellen; E-Mail-DNS dabei unangetastet lassen.
- Worker-Konfiguration bei Bedarf auf die vorherige funktionierende Version zurückstellen.
- GitHub-Branch `main` bleibt als Staging-/Rollback-Referenz erhalten.

**Status:** Cloudflare Pages und Domain-DNS müssen vom autorisierten Cloudflare-Konto aus eingerichtet werden. Dieser Branch allein schaltet noch nichts live.
