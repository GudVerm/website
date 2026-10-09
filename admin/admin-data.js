/* Gudelius CMS: statische Fallback-Daten und Medienzuordnungen. */
(() => {
const defaultEquipment = [
  { slug:"trimble-sx12", group:"Außendienst", key:"equipment/trimble-sx12-gudelius", name:"Trimble SX12", category:"Scanning-Totalstation", detail:"Scanning-Totalstation", manufacturer:"Trimble", model:"SX12", description:"Scanning-Totalstation für präzise Vermessung und 3D-Datenerfassung im Außendienst.", details:"Kombiniert klassische Totalstationsmessung mit 3D-Erfassung für Absteckung, Aufnahme und Dokumentation.", fallback:"../assets/equipment-trimble-placeholder.svg" },
  { slug:"trimble-s6", group:"Außendienst", key:"equipment/trimble-s6-gudelius", name:"Trimble S6", category:"Robotik-Totalstation", detail:"Robotik-Totalstation", manufacturer:"Trimble", model:"S6", description:"Robotik-Totalstation für präzise Winkel- und Streckenmessungen im Außendienst.", details:"Für Absteckung, Bestandsaufnahme und Kontrollmessungen mit motorisierter Messunterstützung.", fallback:"../assets/equipment-trimble-placeholder.svg" },
  { slug:"trimble-r2", group:"Außendienst", key:"equipment/trimble-r2-gudelius", name:"Trimble R2 GNSS-Empfänger", category:"GNSS-Positionierung", detail:"GNSS-Positionierung", manufacturer:"Trimble", model:"R2", description:"GNSS-Empfänger für präzise Positionsbestimmung bei Aufnahme und Absteckung.", details:"RTK- und GNSS-gestützte Vermessung für flexible Punktaufnahme im Projektumfeld.", fallback:"../assets/equipment-trimble-placeholder.svg" },
  { slug:"trimble-dini07", group:"Außendienst", key:"equipment/trimble-dini07-gudelius", name:"Trimble DiNi 07 Ingenieurnivellier", category:"Digitalnivellement", detail:"Digitalnivellement", manufacturer:"Trimble", model:"DiNi 07", description:"Digitales Ingenieurnivellier für präzise Höhenmessungen und Höhenübertragungen.", details:"Geeignet für Nivellements, Kontrollmessungen und die nachvollziehbare Bestimmung von Höhenunterschieden.", fallback:"../assets/equipment-trimble-placeholder.svg" },
  { slug:"trimble-tx8", group:"3D & Drohne", key:"equipment/trimble-tx8-gudelius", name:"Trimble TX8 3D-Laserscanner", category:"Terrestrisches 3D-Laserscanning", detail:"Terrestrisches 3D-Laserscanning", manufacturer:"Trimble", model:"TX8", description:"Terrestrischer 3D-Laserscanner für flächenhafte Bestands- und Gebäudedokumentation.", details:"Erzeugt dichte Punktwolken als Grundlage für Bestandspläne, 3D-Auswertung und Dokumentation.", fallback:"../assets/equipment-trimble-placeholder.svg" },
  { slug:"rtk-drohne", group:"3D & Drohne", key:"equipment/rtk-drohne", name:"RTK-Drohne", category:"Vermessung & Orthophoto", detail:"Vermessung & Orthophoto", manufacturer:"DJI Enterprise", model:"RTK-Drohne", description:"RTK-gestützte Drohne für großflächige Vermessung, Luftbilder und Orthophotos.", details:"Für Geländeaufnahme, Dokumentation und photogrammetrische Auswertung aus der Luft.", fallback:"../assets/media/2026-10-02-technik-digital.webp" },
  { slug:"infrarotkamera", group:"3D & Drohne", key:"equipment/infrarotkamera-gudelius", name:"RTK-Drohne mit Infrarotkamera", category:"Thermische Bildaufnahme", detail:"Thermische Bildaufnahme", manufacturer:"DJI Enterprise", model:"RTK-Drohne mit Infrarotkamera", description:"Drohnenbasierte Wärmebildaufnahme zur ergänzenden visuellen und thermischen Dokumentation.", details:"Verbindet RTK-gestützte Befliegung mit Infrarotaufnahmen für projektbezogene Inspektionsaufgaben.", fallback:"../assets/equipment-neutral-placeholder.svg" },
  { slug:"photogrammetrie", group:"3D & Drohne", key:"equipment/photogrammetrie", name:"Punktwolken & Photogrammetrie", category:"Workflow / Ergebnisdarstellung", detail:"Workflow / Ergebnisdarstellung", manufacturer:"–", model:"Punktwolken & Photogrammetrie", description:"Digitaler Workflow zur Ableitung und Aufbereitung räumlicher Daten aus Scan- und Bildmaterial.", details:"Punktwolken, Orthophotos und 3D-Auswertungen werden für Planung, Bestand und Dokumentation weiterverarbeitet.", fallback:"../assets/media/2026-10-02-technik-photogrammetrie.webp" },
  { slug:"bricscad", group:"Programme & Arbeitsplatz", key:"equipment/bricscad-gudelius", name:"BricsCAD", category:"CAD-Bearbeitung", detail:"CAD-Bearbeitung", manufacturer:"Bricsys", model:"BricsCAD", description:"CAD-Software für die zeichnerische Aufbereitung und Weiterbearbeitung von Vermessungsdaten.", details:"Für 2D-/3D-CAD, Bestandspläne und projektbezogene Planbearbeitung.", fallback:"../assets/equipment-neutral-placeholder.svg" },
  { slug:"bbsoft", group:"Programme & Arbeitsplatz", key:"equipment/bbsoft-gudelius", name:"BBSOFT", category:"Tiefbau, Vermessung & DGM", detail:"Tiefbau, Vermessung & DGM", manufacturer:"BBSOFT", model:"BBSOFT", description:"Fachsoftware für vermessungsnahe Tiefbauplanung, Geländemodelle und Massenermittlung.", details:"Unterstützt die Bearbeitung von Vermessungsdaten, DGM und projektbezogenen Tiefbauaufgaben.", fallback:"../assets/equipment-neutral-placeholder.svg" },
  { slug:"realworks", group:"Programme & Arbeitsplatz", key:"equipment/realworks-gudelius", name:"Trimble RealWorks", category:"Punktwolken-Auswertung", detail:"Punktwolken-Auswertung", manufacturer:"Trimble", model:"RealWorks", description:"Software zur Registrierung, Auswertung und Aufbereitung terrestrischer Punktwolken.", details:"Für Scanregistrierung, Punktwolkenanalyse und die Ableitung weiterverwendbarer 2D-/3D-Ergebnisse.", fallback:"../assets/equipment-trimble-placeholder.svg" },
  { slug:"metashape", group:"Programme & Arbeitsplatz", key:"equipment/metashape-gudelius", name:"Agisoft Metashape", category:"Photogrammetrie", detail:"Photogrammetrie", manufacturer:"Agisoft", model:"Metashape", description:"Photogrammetrie-Software zur Verarbeitung georeferenzierter Bilddaten.", details:"Für Bildausrichtung, Punktwolken, Oberflächenmodelle und Orthophotos aus Drohnen- und Kameradaten.", fallback:"../assets/equipment-neutral-placeholder.svg" },
  { slug:"mobile-arbeitsplatz", group:"Programme & Arbeitsplatz", key:"equipment/mobile-arbeitsplatz", name:"Mobiler Büroarbeitsplatz", category:"Auswertung direkt im Projektumfeld", detail:"Auswertung direkt im Projektumfeld", manufacturer:"GudeliusVermessung", model:"Mobiler Büroarbeitsplatz", description:"Mobiler Arbeitsplatz für Datenkontrolle, Auswertung und Abstimmung direkt im Projektumfeld.", details:"Ermöglicht kurze Wege zwischen Messung, Prüfung und digitaler Weiterverarbeitung vor Ort.", fallback:"../assets/media/2026-10-02-technik-mobiler-arbeitsplatz.webp" }
];

const defaultProjects = [
  { slug:"ingenieur-bauvermessung", key:"projects/ingenieur-bauvermessung", title:"Ingenieur- & Bauvermessung", name:"Ingenieur- & Bauvermessung", detail:"Projektbild auf der Startseite", description:"", location:"", year:"", services:["ingenieurvermessung"], fallback:"../assets/media/2026-10-02-projekt-ingenieur.webp" },
  { slug:"3d-laserscanning", key:"projects/3d-laserscanning", title:"3D-Laserscanning", name:"3D-Laserscanning", detail:"Projektbild auf der Startseite", description:"", location:"", year:"", services:["3d-laserscanning"], fallback:"../assets/media/2026-10-02-projekt-3d.webp" },
  { slug:"rtk-drohnenvermessung", key:"projects/rtk-drohnenvermessung", title:"RTK-Drohnenvermessung", name:"RTK-Drohnenvermessung", detail:"Projektbild auf der Startseite", description:"", location:"", year:"", services:["drohnenvermessung"], fallback:"../assets/media/2026-10-02-projekt-drohne.webp" },
  { slug:"gelaende-gewaesser", key:"projects/gelaende-gewaesser", title:"Gelände & Gewässer", name:"Gelände & Gewässer", detail:"Projektbild auf der Startseite", description:"", location:"", year:"", services:["gis-bauvermessung"], fallback:"../assets/media/2026-10-02-projekt-gelaende.webp" },
  { slug:"mobiler-einsatz", key:"projects/mobiler-einsatz", title:"Mobiler Einsatz", name:"Mobiler Einsatz", detail:"Projektbild auf der Startseite", description:"", location:"", year:"", services:[], fallback:"../assets/media/2026-10-02-projekt-mobil.webp" },
  { slug:"bestand-planung", key:"projects/bestand-planung", title:"Bestand & Planung", name:"Bestand & Planung", detail:"Projektbild auf der Startseite", description:"", location:"", year:"", services:["ingenieurvermessung"], fallback:"../assets/media/2026-10-02-projekt-bestand.webp" }
];

const startPageImages = [
  { key:"startseite/hero", name:"Hero / Startseitenbild", detail:"Großes Hintergrundbild im Kopfbereich", fallback:"../assets/media/home-hero.webp" },
  { key:"startseite/projekte", name:"Startseite · Projekte", detail:"Bild der großen Projekte-Karte", fallback:"../assets/media/home-projekte.webp" },
  { key:"startseite/technik", name:"Startseite · Technik", detail:"Bild der großen Technik-Karte", fallback:"../assets/media/home-technik.webp" },
  { key:"startseite/unternehmen", name:"Unternehmen · Ansprechpartnerfoto", detail:"Gemeinsames Foto auf der Startseite und im Unternehmen-Portrait", fallback:"../assets/media/jost-gudelius.jpg" }
];

const serviceImages = [
  { key:"leistungen/ingenieurvermessung", name:"Ingenieurvermessung", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"../assets/media/home-service-ingenieur.webp" },
  { key:"leistungen/gis-bauvermessung", name:"GIS & Bauvermessung", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"../assets/media/home-service-gis.webp" },
  { key:"leistungen/3d-laserscanning", name:"3D-Laserscanning", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"../assets/media/home-service-3d.webp" },
  { key:"leistungen/drohnenvermessung", name:"Drohnenvermessung", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"../assets/media/home-service-drohne.webp" }
];

const servicePageImages = [
  { key:"leistungsseiten/ingenieurvermessung/hero", name:"Ingenieurvermessung · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"../assets/media/2026-10-02-ingenieur-hero.webp" },
  { key:"leistungsseiten/ingenieurvermessung/ergebnis-1", name:"Ingenieurvermessung · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-ingenieur-ergebnis-1.webp" },
  { key:"leistungsseiten/ingenieurvermessung/ergebnis-2", name:"Ingenieurvermessung · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-ingenieur-ergebnis-2.webp" },

  { key:"leistungsseiten/gis-bauvermessung/hero", name:"GIS & Bauvermessung · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"../assets/media/2026-10-02-gis-hero.webp" },
  { key:"leistungsseiten/gis-bauvermessung/ergebnis-1", name:"GIS & Bauvermessung · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-gis-ergebnis-1.webp" },
  { key:"leistungsseiten/gis-bauvermessung/ergebnis-2", name:"GIS & Bauvermessung · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-gis-ergebnis-2.webp" },

  { key:"leistungsseiten/3d-laserscanning/hero", name:"3D-Laserscanning · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"../assets/media/2026-10-02-3d-hero.webp" },
  { key:"leistungsseiten/3d-laserscanning/ergebnis-1", name:"3D-Laserscanning · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-3d-ergebnis-1.webp" },
  { key:"leistungsseiten/3d-laserscanning/ergebnis-2", name:"3D-Laserscanning · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-3d-ergebnis-2.webp" },

  { key:"leistungsseiten/drohnenvermessung/hero", name:"Drohnenvermessung · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"../assets/media/2026-10-02-drohne-hero.webp" },
  { key:"leistungsseiten/drohnenvermessung/ergebnis-1", name:"Drohnenvermessung · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-drohne-ergebnis-1.webp" },
  { key:"leistungsseiten/drohnenvermessung/ergebnis-2", name:"Drohnenvermessung · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"../assets/media/2026-10-02-drohne-ergebnis-2.webp" }
];

const projectHeroImages = [
  { key:"projekte/hero", name:"Projekte · Hero", detail:"Großes Kopfbild der Projektseite", fallback:"../assets/media/2026-10-02-projekt-ingenieur.webp" }
];

const techniqueHeroImages = [
  { key:"technik/hero", name:"Technik · Hero", detail:"Großes Kopfbild der Technikseite", fallback:"../assets/media/2026-10-02-technik-aussendienst.webp" }
];

const contactHeroImages = [
  { key:"kontakt/hero", name:"Kontakt · Hero", detail:"Großes Kopfbild der Kontaktseite", fallback:"../assets/media/home-hero.webp" }
];

const imprintHeroImages = [
  { key:"impressum/hero", name:"Impressum · Hero", detail:"Großes Kopfbild der Impressumsseite", fallback:"../assets/media/home-hero.webp" }
];

const companyImages = [
  { key:"unternehmen/hero", name:"Unternehmen · Hero", detail:"Großes Kopfbild der Unternehmensseite", fallback:"../assets/media/jost-gudelius.jpg" },
  { sharedKey:"startseite/unternehmen", name:"Jost Gudelius", detail:"Gemeinsames Ansprechpartnerfoto · Startseite und Unternehmen", fallback:"../assets/media/jost-gudelius.jpg" },
  { key:"unternehmen/pruefsachverstaendiger", name:"Prüfsachverständiger BayIkaBau", detail:"Zweites Bild im Unternehmensbereich", fallback:"../assets/media/pruefsachverstaendiger.jpg" }
];

const techniqueGroupImages = [
  { key:"technik/gruppen/aussendienst", name:"Technik · Außendienst", detail:"Großes Gruppenbild oberhalb der Außendienst-Geräte", fallback:"../assets/media/2026-10-02-technik-aussendienst.webp" },
  { key:"technik/gruppen/3d-drohne", name:"Technik · 3D & Drohne", detail:"Großes Gruppenbild oberhalb der 3D- und Drohnen-Geräte", fallback:"../assets/media/2026-10-02-technik-digital.webp" },
  { key:"technik/gruppen/programme-arbeitsplatz", name:"Technik · Programme & Arbeitsplatz", detail:"Großes Gruppenbild oberhalb der Software- und Arbeitsplatz-Einträge", fallback:"../assets/media/2026-10-02-technik-software.webp" }
];

  window.GUDELIUS_ADMIN_DATA = Object.freeze({ defaultEquipment, defaultProjects, startPageImages, serviceImages, servicePageImages, projectHeroImages, techniqueHeroImages, contactHeroImages, imprintHeroImages, companyImages, techniqueGroupImages });
})();
