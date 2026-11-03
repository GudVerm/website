# Gudelius CMS – Freigabeprüfung der Veröffentlichung (Release 2026-11-03.1)

Stand: 03.11.2026. Diese Datei dokumentiert die Prüfpunkte, nicht eine bereits erfolgte Produktivfreigabe.

## Automatisch geprüft

- `node quality/release-check.mjs` – Versionskonsistenz
- `node quality/static-check.mjs` – 12 öffentliche Seiten, lokale Medien, Referenzen, JavaScript-Syntax
- `node quality/admin-contract-check.mjs` – Admin-/CMS-Routen und Schutzmaßnahmen
- `node --experimental-sqlite quality/cms-publication-d1-test.mjs` – D1-nahe Simulation: Rechte, Feldtypen, Mehrfach-Publish, abgelaufene Entwurfsrevisionen (409), fehlende Revision (428), ungültige Eingaben (422), Rollback, Versionshistorie, Projekt-/Techniklöschungen, R2-Warnungen
- GitHub Actions `Website quality` – Browserprüfungen für Kontakt, Medien, Turnstile, CMS-Integration, Responsiveness, Screenshots, Accessibility, visuelle Regression

## Erforderliche End-to-End-Abnahme vor produktiver Worker-Umstellung

1. Ein gültiges Cloudflare-D1- und R2-Backup sowie einen CMS-Backup-Export sichern. Den vorhandenen Live-Datenstand dokumentieren.
2. Mit Cloudflare Access als zugelassener Redakteur den Admin öffnen. Nicht berechtigten Account und abgelaufene Sitzung prüfen.
3. Startseite, vier Leistungen und Leistungsunterseiten: kurze/lange Texte, bewusst leere Texte, mehrere geänderte Felder, Vorschau, Veröffentlichung und öffentliche Anzeige kontrollieren.
4. Unternehmen: Kontaktperson, dieselbe Bildquelle auf Startseite/Unternehmen, Hero, Zeitachse, Sichtbarkeitsoptionen und Reihenfolge prüfen.
5. Kontakt: gültige/ungültige E-Mail, Mailto-Link nach Veröffentlichung, Kontaktformular inklusive Turnstile, Erfolg/Misserfolg des Brevo-Versands und Speicherung in den Anfragen prüfen. Keine echten Kundendaten als Testeingaben verwenden.
6. Projekte: neues Projekt anlegen, Titel und Leistungen speichern, Bild hochladen, Bildausschnitt ändern, sichtbar/unsichtbar, Archiv und endgültige Löschung in Entwurf und Live prüfen. Projekt-Löschung darf vor Veröffentlichung keine Live-Daten und keine R2-Bilder löschen.
7. Technik: neuen Eintrag anlegen, in der Vorschau sehen, Gruppen/Reihenfolge/Sichtbarkeit, Bild und Bildausschnitt prüfen. Technik-Löschung analog zu Projekten testen.
8. Medien: Upload, Nachladen nach Browser-Neustart, verschiedene Größen/Formate, Löschen, Fallback, ungültige Datei, Medien-Vorschau und korrekter Cache nach Änderung prüfen. **Achtung: Bilddatei-Uploads werden auch im Entwurfsmodus derzeit unmittelbar nach R2 geschrieben und sind nicht Bestandteil der D1-Transaktion.**
9. Impressum: Pflichttexte, E-Mail, Verlinkungen, Hero und publizierte Ansicht kontrollieren.
10. Alle speichern: simulierten Fehler nach mindestens einer Teiländerung auslösen, verifizieren, dass kein falscher Alles-gespeichert-Status erscheint.
11. Alle veröffentlichen: fehlende/alte Revision, konkurrierende Änderung durch zweiten Admin, leere Auswahl, ausgewählte Teilmenge, veröffentlichte Änderung und anschließenden öffentlichen Aufruf prüfen.
12. Veröffentlichungsabbruch: einen kontrollierten Fehler auf Staging-D1 während eines Mehrfach-Publish provozieren; Live-Inhalte, Entwürfe, Historie und Audit sollen konsistent bleiben.
13. Versionen: Vorher-/Nachher-Audit sowie Wiederherstellung einzelner Werte prüfen. Wiederherstellung eines kompletten gelöschten Projekts kann mehrere Werte umfassen und ist zusätzlich gesondert zu testen.
14. Mobil/Tablet/Desktop kontrollieren, ob Bilder, Texte, Kacheln und Hero-Bilder nach CMS-Änderungen tatsächlich geladen werden.
15. Nur wenn alle wesentlichen Prüfungen bestehen: Worker zunächst in einer separaten Staging-Umgebung deployen, `npm run smoke:remote` mit passender Zielkonfiguration ausführen, danach gezielt für Produktion freigeben.

## Freigabegrenzen

- Die automatisierte SQLite-Prüfung verwendet eine Test-Implementierung der D1-Schnittstelle, keinen echten Cloudflare-D1-Dienst.
- Cloudflare Access, R2-Konsistenz, Brevo und CDN-Cacheverhalten benötigen einen echten End-to-End-Test.
- „Perfekt“ bzw. absolute Fehlerfreiheit kann kein automatisierter Test garantieren. Freigabe erst nach dokumentierter Abnahme.
- Bis dahin ist der PR ein **Entwurf**. Kein Merge und kein produktiver Cloudflare-Deploy.
