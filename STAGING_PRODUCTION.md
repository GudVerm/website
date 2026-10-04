# Staging und Produktion

Die aktive Website-Umgebung ist in `site.environments.json` deklariert.

## Aktueller Zustand

- **staging** ist aktiv: `https://gudverm.github.io/website/`
- Staging bleibt per Meta-Robots und `robots.txt` auf **noindex / Disallow**
- Der Worker verwendet aktuell die Staging-URL als `PUBLIC_SITE_URL` und `ALLOWED_ORIGIN`
- `gudeliusvermessung.de` ist nur als vorbereitete Produktionsumgebung hinterlegt
- DNS, Wix und Mailrecords werden durch keinen Workflow verändert

## Produktionsziel

Die Produktionskonfiguration ist in `site.environments.json` vollständig beschrieben:

- Public Base: `https://gudeliusvermessung.de/`
- Allowed Origin: `https://gudeliusvermessung.de`
- Robots: `robots.production.txt`
- Sitemap: `https://gudeliusvermessung.de/sitemap.xml`

Die HTML-Dateien tragen bereits Produktions-Canonicals, bleiben im Staging jedoch durch `noindex` nicht indexierbar.

## Späterer Cutover

Erst beim bewusst manuellen Produktivstart werden nacheinander:

1. Domain verifiziert und DNS-/Mailrecords gesichert.
2. GitHub Pages Custom Domain gesetzt.
3. ausschließlich Website-DNS umgestellt.
4. Worker `PUBLIC_SITE_URL` und `ALLOWED_ORIGIN` auf Produktion gesetzt.
5. `robots.production.txt` als aktive `robots.txt` verwendet.
6. Staging-`noindex` aus den Produktionsartefakten entfernt.
7. Release-Preflight und Browser-/SEO-Checks ausgeführt.

Der aktuelle Quality-Workflow blockiert versehentliche Mischzustände über `quality/environment-check.mjs`.
