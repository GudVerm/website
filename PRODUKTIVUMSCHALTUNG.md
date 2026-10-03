# Produktivumschaltung Wix → Cloudflare / GitHub Pages

Stand: Vorbereitung. **Noch keine produktive Domainänderung durchführen.**

## Zielarchitektur

- Öffentliche Website: Repository `GudVerm/website` über GitHub Pages
- Staging: `https://gudverm.github.io/website/`
- Ziel-Canonical: `https://gudeliusvermessung.de/`
- `www.gudeliusvermessung.de`: auf die Apex-Domain weiterleiten
- DNS-Verwaltung: Cloudflare
- Admin/CMS: `https://gudelius-cms.gudeliusvermessung.workers.dev/admin/`
- D1, R2 und Worker bleiben unabhängig von der öffentlichen Domain bestehen
- `ADMIN_TOKEN_FALLBACK_ENABLED=false` bleibt unverändert

## GitHub-Pages-Zielwerte

Aktuelle GitHub-Pages-A-Records für die Apex-Domain:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optional zusätzlich IPv6:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Für `www`:

```text
CNAME www -> gudverm.github.io
```

Quelle: GitHub Pages – Managing a custom domain.

## Vor dem Cutover zwingend sichern

Vor jeder DNS- oder Nameserveränderung einen vollständigen Export/Screenshot der aktuellen Zone erstellen.

Mindestens sichern:

- aktuelle Nameserver
- A
- AAAA
- CNAME
- MX
- TXT
- SPF
- DKIM
- DMARC
- CAA
- SRV
- Verifizierungsrecords von Mail-/Drittanbietern
- TTL jedes Records

**Mail-Records werden beim Website-Umzug nicht geändert.** MX/SPF/DKIM/DMARC und sonstige Mailverifizierungen werden 1:1 übernommen.

## Reihenfolge der späteren Umschaltung

1. Aktuelle DNS-Zone vollständig sichern.
2. Mail-Records vollständig in Cloudflare nachbilden und gegen den Export vergleichen.
3. In GitHub → Repository Settings → Pages die Custom Domain `gudeliusvermessung.de` setzen.
4. Erst danach Website-DNS auf GitHub Pages umstellen.
5. Apex-A-Records auf die vier GitHub-Pages-IPv4-Adressen setzen.
6. Optional die vier GitHub-Pages-AAAA-Records ergänzen.
7. `www` als CNAME auf `gudverm.github.io` setzen.
8. Für den ersten Cutover Website-Records zunächst **DNS only** betreiben.
9. DNS-Propagation prüfen.
10. GitHub-Pages-Zertifikat abwarten und anschließend **Enforce HTTPS** aktivieren.
11. Apex und `www` prüfen; `www` soll auf die gewählte Canonical-Domain umleiten.
12. Erst nach stabiler HTTPS-Auslieferung optional Cloudflare-Proxy für die Website bewerten/aktivieren.
13. Wix erst nach erfolgreicher Nachkontrolle und Ablauf der Rollback-Frist deaktivieren.

## Code-/SEO-Schritte unmittelbar zum Produktivstart

Erst wenn DNS und HTTPS funktionieren:

- `robots.production.txt` als `robots.txt` übernehmen
- `noindex,nofollow,noarchive` auf den öffentlichen Seiten entfernen
- Canonicals auf `https://gudeliusvermessung.de/...` final prüfen
- Open-Graph-URLs final prüfen
- `sitemap.xml` veröffentlichen
- 404-Seite prüfen
- GitHub-Pages-Custom-Domain/CNAME prüfen
- Worker-Variable `ALLOWED_ORIGIN` auf `https://gudeliusvermessung.de` ändern
- Worker-Variable `PUBLIC_SITE_URL` auf `https://gudeliusvermessung.de/` ändern
- Worker neu deployen
- `PUBLIC_MEDIA_ENABLED=false` beibehalten, bis R2-Medien bewusst freigegeben werden

## E-Mail-Checkliste

Direkt vor und nach der DNS-Umschaltung prüfen:

- MX-Records identisch zum vorherigen Stand
- SPF unverändert und nur einmal vorhanden
- alle DKIM-Selectoren vorhanden
- DMARC unverändert
- sonstige Mail-Verifizierungs-TXT/CNAME vorhanden
- Empfang an `jost@gudeliusvermessung.de`
- Empfang an allen weiteren Domain-Postfächern
- Versand aus den Domain-Postfächern
- Kontaktformular → Brevo → Zielpostfach
- Reply-To des Kontaktformulars funktioniert

## Windows-Prüfbefehle

```powershell
Resolve-DnsName gudeliusvermessung.de -Type A
Resolve-DnsName gudeliusvermessung.de -Type AAAA
Resolve-DnsName gudeliusvermessung.de -Type MX
Resolve-DnsName gudeliusvermessung.de -Type TXT
Resolve-DnsName _dmarc.gudeliusvermessung.de -Type TXT
Resolve-DnsName www.gudeliusvermessung.de -Type CNAME
```

Zusätzlich die bekannten DKIM-Selectoren des aktuellen Mailproviders prüfen.

## Rollback

### Wenn nur Website-Records geändert wurden

1. Neue GitHub-Pages-A/AAAA/CNAME-Records entfernen/deaktivieren.
2. Die zuvor gesicherten Wix-Website-Records exakt wiederherstellen.
3. Mail-Records **nicht** verändern.
4. DNS-Propagation prüfen.
5. Wix-Seite testen.
6. Kontakt-/Mailfunktion erneut testen.

### Wenn Nameserver auf Cloudflare umgestellt wurden

1. Cloudflare-Zone nicht löschen.
2. Beim Registrar die zuvor gesicherten ursprünglichen Nameserver wieder eintragen.
3. Warten, bis die alten autoritativen Nameserver wieder aktiv sind.
4. Website und Mail getrennt prüfen.
5. Erst nach vollständiger Stabilisierung weitere Änderungen vornehmen.

## Nachkontrolle

Nach erfolgreichem Cutover prüfen:

- Apex-Domain
- www
- HTTPS/Zertifikat
- Startseite
- alle vier Leistungsseiten
- Projekte + Modals
- Technik + Modals
- Unternehmen
- Kontakt
- Impressum
- Datenschutz
- 404
- Kontaktformular
- Admin-Login mit beiden erlaubten E-Mail-Adressen
- fremde Admin-E-Mail weiterhin gesperrt
- Analytics
- D1
- R2
- Mailversand und Mailempfang

Nach 1–2 Stunden und am Folgetag erneut DNS, Website, Kontaktformular und Mail prüfen.

## Rollback-Frist

Wix und alte DNS-Zielwerte mindestens 48 Stunden nach stabiler Produktivumschaltung als Rückfalloption erhalten.
