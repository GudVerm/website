const equipment = [
  { slug:"trimble-sx12", group:"Außendienst", key:"equipment/trimble-sx12", name:"Trimble SX12", category:"Scanning-Totalstation", detail:"Scanning-Totalstation", manufacturer:"Trimble", model:"SX12", description:"Scanning-Totalstation für präzise Vermessung und 3D-Datenerfassung im Außendienst.", details:"Kombiniert klassische Totalstationsmessung mit 3D-Erfassung für Absteckung, Aufnahme und Dokumentation.", fallback:"../assets/equipment-trimble-sx12.svg" },
  { slug:"trimble-s6", group:"Außendienst", key:"equipment/trimble-s6", name:"Trimble S6", category:"Robotik-Totalstation", detail:"Robotik-Totalstation", manufacturer:"Trimble", model:"S6", description:"Robotik-Totalstation für präzise Winkel- und Streckenmessungen im Außendienst.", details:"Für Absteckung, Bestandsaufnahme und Kontrollmessungen mit motorisierter Messunterstützung.", fallback:"../assets/equipment-trimble-s6.svg" },
  { slug:"trimble-r2", group:"Außendienst", key:"equipment/trimble-r2", name:"Trimble R2 GNSS-Empfänger", category:"GNSS-Positionierung", detail:"GNSS-Positionierung", manufacturer:"Trimble", model:"R2", description:"GNSS-Empfänger für präzise Positionsbestimmung bei Aufnahme und Absteckung.", details:"RTK- und GNSS-gestützte Vermessung für flexible Punktaufnahme im Projektumfeld.", fallback:"../assets/equipment-trimble-r2.svg" },
  { slug:"trimble-dini07", group:"Außendienst", key:"equipment/trimble-dini07", name:"Trimble DiNi 07 Ingenieurnivellier", category:"Digitalnivellement", detail:"Digitalnivellement", manufacturer:"Trimble", model:"DiNi 07", description:"Digitales Ingenieurnivellier für präzise Höhenmessungen und Höhenübertragungen.", details:"Geeignet für Nivellements, Kontrollmessungen und die nachvollziehbare Bestimmung von Höhenunterschieden.", fallback:"../assets/equipment-trimble-dini07.svg" },
  { slug:"trimble-tx8", group:"3D & Drohne", key:"equipment/trimble-tx8", name:"Trimble TX8 3D-Laserscanner", category:"Terrestrisches 3D-Laserscanning", detail:"Terrestrisches 3D-Laserscanning", manufacturer:"Trimble", model:"TX8", description:"Terrestrischer 3D-Laserscanner für flächenhafte Bestands- und Gebäudedokumentation.", details:"Erzeugt dichte Punktwolken als Grundlage für Bestandspläne, 3D-Auswertung und Dokumentation.", fallback:"../assets/equipment-trimble-tx8.svg" },
  { slug:"rtk-drohne", group:"3D & Drohne", key:"equipment/rtk-drohne", name:"RTK-Drohne", category:"Vermessung & Orthophoto", detail:"Vermessung & Orthophoto", manufacturer:"DJI Enterprise", model:"RTK-Drohne", description:"RTK-gestützte Drohne für großflächige Vermessung, Luftbilder und Orthophotos.", details:"Für Geländeaufnahme, Dokumentation und photogrammetrische Auswertung aus der Luft.", fallback:"../assets/equipment-rtk-drohne.svg" },
  { slug:"infrarotkamera", group:"3D & Drohne", key:"equipment/infrarotkamera", name:"RTK-Drohne mit Infrarotkamera", category:"Thermische Bildaufnahme", detail:"Thermische Bildaufnahme", manufacturer:"DJI Enterprise", model:"RTK-Drohne mit Infrarotkamera", description:"Drohnenbasierte Wärmebildaufnahme zur ergänzenden visuellen und thermischen Dokumentation.", details:"Verbindet RTK-gestützte Befliegung mit Infrarotaufnahmen für projektbezogene Inspektionsaufgaben.", fallback:"../assets/equipment-infrarotkamera.svg" },
  { slug:"photogrammetrie", group:"3D & Drohne", key:"equipment/photogrammetrie", name:"Punktwolken & Photogrammetrie", category:"Workflow / Ergebnisdarstellung", detail:"Workflow / Ergebnisdarstellung", manufacturer:"–", model:"Punktwolken & Photogrammetrie", description:"Digitaler Workflow zur Ableitung und Aufbereitung räumlicher Daten aus Scan- und Bildmaterial.", details:"Punktwolken, Orthophotos und 3D-Auswertungen werden für Planung, Bestand und Dokumentation weiterverarbeitet.", fallback:"../assets/equipment-photogrammetrie.svg" },
  { slug:"bricscad", group:"Programme & Arbeitsplatz", key:"equipment/bricscad", name:"BricsCAD", category:"CAD-Bearbeitung", detail:"CAD-Bearbeitung", manufacturer:"Bricsys", model:"BricsCAD", description:"CAD-Software für die zeichnerische Aufbereitung und Weiterbearbeitung von Vermessungsdaten.", details:"Für 2D-/3D-CAD, Bestandspläne und projektbezogene Planbearbeitung.", fallback:"../assets/equipment-bricscad.svg" },
  { slug:"bbsoft", group:"Programme & Arbeitsplatz", key:"equipment/bbsoft", name:"BBSOFT", category:"Tiefbau, Vermessung & DGM", detail:"Tiefbau, Vermessung & DGM", manufacturer:"BBSOFT", model:"BBSOFT", description:"Fachsoftware für vermessungsnahe Tiefbauplanung, Geländemodelle und Massenermittlung.", details:"Unterstützt die Bearbeitung von Vermessungsdaten, DGM und projektbezogenen Tiefbauaufgaben.", fallback:"../assets/equipment-bbsoft.svg" },
  { slug:"realworks", group:"Programme & Arbeitsplatz", key:"equipment/realworks", name:"Trimble RealWorks", category:"Punktwolken-Auswertung", detail:"Punktwolken-Auswertung", manufacturer:"Trimble", model:"RealWorks", description:"Software zur Registrierung, Auswertung und Aufbereitung terrestrischer Punktwolken.", details:"Für Scanregistrierung, Punktwolkenanalyse und die Ableitung weiterverwendbarer 2D-/3D-Ergebnisse.", fallback:"../assets/equipment-realworks.svg" },
  { slug:"metashape", group:"Programme & Arbeitsplatz", key:"equipment/metashape", name:"Agisoft Metashape", category:"Photogrammetrie", detail:"Photogrammetrie", manufacturer:"Agisoft", model:"Metashape", description:"Photogrammetrie-Software zur Verarbeitung georeferenzierter Bilddaten.", details:"Für Bildausrichtung, Punktwolken, Oberflächenmodelle und Orthophotos aus Drohnen- und Kameradaten.", fallback:"../assets/equipment-metashape.svg" },
  { slug:"mobile-arbeitsplatz", group:"Programme & Arbeitsplatz", key:"equipment/mobile-arbeitsplatz", name:"Mobiler Büroarbeitsplatz", category:"Auswertung direkt im Projektumfeld", detail:"Auswertung direkt im Projektumfeld", manufacturer:"GudeliusVermessung", model:"Mobiler Büroarbeitsplatz", description:"Mobiler Arbeitsplatz für Datenkontrolle, Auswertung und Abstimmung direkt im Projektumfeld.", details:"Ermöglicht kurze Wege zwischen Messung, Prüfung und digitaler Weiterverarbeitung vor Ort.", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" }
];

const projects = [
  { key:"projects/ingenieur-bauvermessung", name:"Ingenieur- & Bauvermessung", detail:"Projektbild auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg" },
  { key:"projects/3d-laserscanning", name:"3D-Laserscanning", detail:"Projektbild auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png" },
  { key:"projects/rtk-drohnenvermessung", name:"RTK-Drohnenvermessung", detail:"Projektbild auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg" },
  { key:"projects/gelaende-gewaesser", name:"Gelände & Gewässer", detail:"Projektbild auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png/v1/fill/w_980%2Ch_723%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png" },
  { key:"projects/mobiler-einsatz", name:"Mobiler Einsatz", detail:"Projektbild auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" },
  { key:"projects/bestand-planung", name:"Bestand & Planung", detail:"Projektbild auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg" }
];

const startPageImages = [
  { key:"startseite/hero", name:"Hero / Startseitenbild", detail:"Großes Hintergrundbild im Kopfbereich", fallback:"https://static.wixstatic.com/media/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png/v1/fill/w_980%2Ch_723%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png" }
];

const serviceImages = [
  { key:"leistungen/ingenieurvermessung", name:"Ingenieurvermessung", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg" },
  { key:"leistungen/gis-bauvermessung", name:"GIS & Bauvermessung", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png/v1/fill/w_980%2Ch_723%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png" },
  { key:"leistungen/3d-laserscanning", name:"3D-Laserscanning", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png" },
  { key:"leistungen/drohnenvermessung", name:"Drohnenvermessung", detail:"Bild der Leistungs-Kachel auf der Startseite", fallback:"https://static.wixstatic.com/media/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg" }
];

const servicePageImages = [
  { key:"leistungsseiten/ingenieurvermessung/hero", name:"Ingenieurvermessung · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"https://static.wixstatic.com/media/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg" },
  { key:"leistungsseiten/ingenieurvermessung/ergebnis-1", name:"Ingenieurvermessung · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg" },
  { key:"leistungsseiten/ingenieurvermessung/ergebnis-2", name:"Ingenieurvermessung · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" },

  { key:"leistungsseiten/gis-bauvermessung/hero", name:"GIS & Bauvermessung · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"https://static.wixstatic.com/media/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png/v1/fill/w_980%2Ch_723%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png" },
  { key:"leistungsseiten/gis-bauvermessung/ergebnis-1", name:"GIS & Bauvermessung · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg" },
  { key:"leistungsseiten/gis-bauvermessung/ergebnis-2", name:"GIS & Bauvermessung · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" },

  { key:"leistungsseiten/3d-laserscanning/hero", name:"3D-Laserscanning · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"https://static.wixstatic.com/media/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png" },
  { key:"leistungsseiten/3d-laserscanning/ergebnis-1", name:"3D-Laserscanning · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg" },
  { key:"leistungsseiten/3d-laserscanning/ergebnis-2", name:"3D-Laserscanning · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" },

  { key:"leistungsseiten/drohnenvermessung/hero", name:"Drohnenvermessung · Hero", detail:"Großes Kopfbild der Unterseite", fallback:"https://static.wixstatic.com/media/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg" },
  { key:"leistungsseiten/drohnenvermessung/ergebnis-1", name:"Drohnenvermessung · Ergebnis 1", detail:"Erstes Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png/v1/fill/w_980%2Ch_723%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png" },
  { key:"leistungsseiten/drohnenvermessung/ergebnis-2", name:"Drohnenvermessung · Ergebnis 2", detail:"Zweites Bild im Ergebnisbereich", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" }
];

const companyImages = [
  { key:"unternehmen/jost-gudelius", name:"Jost Gudelius", detail:"Portrait im Bereich Unternehmen", fallback:"https://static.wixstatic.com/media/bdad94_11e412ba9cd74e4695f923ef756c6b34~mv2.jpg/v1/fill/w_250%2Ch_273%2Cal_c%2Cq_90%2Cenc_auto/bdad94_11e412ba9cd74e4695f923ef756c6b34~mv2.jpg" },
  { key:"unternehmen/pruefsachverstaendiger", name:"Prüfsachverständiger BayIkaBau", detail:"Zweites Bild im Unternehmensbereich", fallback:"https://static.wixstatic.com/media/bdad94_91e2d46020314618a1e009aab515dda3~mv2.jpg/v1/fill/w_250%2Ch_250%2Cal_c%2Cq_90%2Cenc_auto/bdad94_91e2d46020314618a1e009aab515dda3~mv2.jpg" }
];

const apiUrlInput=document.getElementById("apiUrl");
const tokenInput=document.getElementById("adminToken");
const saveButton=document.getElementById("saveConnection");
const testButton=document.getElementById("testConnection");
const connectionStatus=document.getElementById("connectionStatus");
const grid=document.getElementById("equipmentGrid");
const projectGrid=document.getElementById("projectGrid");
const startPageGrid=document.getElementById("startPageGrid");
const companyGrid=document.getElementById("companyGrid");
const service1Grid=document.getElementById("service1Grid");
const service2Grid=document.getElementById("service2Grid");
const service3Grid=document.getElementById("service3Grid");
const service4Grid=document.getElementById("service4Grid");
const servicePage1Grid=document.getElementById("servicePage1Grid");
const servicePage2Grid=document.getElementById("servicePage2Grid");
const servicePage3Grid=document.getElementById("servicePage3Grid");
const servicePage4Grid=document.getElementById("servicePage4Grid");
const template=document.getElementById("equipmentTemplate");
const technikSelect=document.getElementById("technikSelect");
const technikEditor=document.getElementById("technikEditor");
const technikEditorTemplate=document.getElementById("technikEditorTemplate");
let technikContentCache={};
let activeTechnikSlug="";
const inquiriesList=document.getElementById("inquiriesList");
const inquiriesStatus=document.getElementById("inquiriesStatus");
const inquiryFilter=document.getElementById("inquiryFilter");
const refreshInquiries=document.getElementById("refreshInquiries");
const inquiryCountNew=document.getElementById("inquiryCountNew");
const inquiryCountProgress=document.getElementById("inquiryCountProgress");
const inquiryCountDone=document.getElementById("inquiryCountDone");
const inquiryNavCount=document.getElementById("inquiryNavCount");
let inquiriesCache=[];
const heroEyebrow=document.getElementById("heroEyebrow");
const heroTitle=document.getElementById("heroTitle");
const heroLead=document.getElementById("heroLead");
const saveHeroTexts=document.getElementById("saveHeroTexts");
const reloadHeroTexts=document.getElementById("reloadHeroTexts");
const heroTextStatus=document.getElementById("heroTextStatus");
const serviceTextFields={
  "leistungen/01-title":document.getElementById("service1Title"),
  "leistungen/01-text":document.getElementById("service1Text"),
  "leistungen/02-title":document.getElementById("service2Title"),
  "leistungen/02-text":document.getElementById("service2Text"),
  "leistungen/03-title":document.getElementById("service3Title"),
  "leistungen/03-text":document.getElementById("service3Text"),
  "leistungen/04-title":document.getElementById("service4Title"),
  "leistungen/04-text":document.getElementById("service4Text")
};
const serviceTextControls=[
  {
    keys:["leistungen/01-title","leistungen/01-text"],
    save:document.getElementById("saveService1Texts"),
    reload:document.getElementById("reloadService1Texts"),
    status:document.getElementById("service1TextStatus"),
    label:"Ingenieurvermessung"
  },
  {
    keys:["leistungen/02-title","leistungen/02-text"],
    save:document.getElementById("saveService2Texts"),
    reload:document.getElementById("reloadService2Texts"),
    status:document.getElementById("service2TextStatus"),
    label:"GIS & Bauvermessung"
  },
  {
    keys:["leistungen/03-title","leistungen/03-text"],
    save:document.getElementById("saveService3Texts"),
    reload:document.getElementById("reloadService3Texts"),
    status:document.getElementById("service3TextStatus"),
    label:"3D-Laserscanning"
  },
  {
    keys:["leistungen/04-title","leistungen/04-text"],
    save:document.getElementById("saveService4Texts"),
    reload:document.getElementById("reloadService4Texts"),
    status:document.getElementById("service4TextStatus"),
    label:"Drohnenvermessung"
  }
];
const companyTextFields={
  "unternehmen/eyebrow":document.getElementById("companyEyebrow"),
  "unternehmen/title":document.getElementById("companyTitle"),
  "unternehmen/name":document.getElementById("companyName"),
  "unternehmen/lead":document.getElementById("companyLead"),
  "unternehmen/timeline-1-year":document.getElementById("companyTimeline1Year"),
  "unternehmen/timeline-1-text":document.getElementById("companyTimeline1Text"),
  "unternehmen/timeline-2-year":document.getElementById("companyTimeline2Year"),
  "unternehmen/timeline-2-text":document.getElementById("companyTimeline2Text"),
  "unternehmen/timeline-3-year":document.getElementById("companyTimeline3Year"),
  "unternehmen/timeline-3-text":document.getElementById("companyTimeline3Text")
};
const saveCompanyTexts=document.getElementById("saveCompanyTexts");
const reloadCompanyTexts=document.getElementById("reloadCompanyTexts");
const companyTextStatus=document.getElementById("companyTextStatus");
const projectTitleFields={
  "projekte/01-title":document.getElementById("project1Title"),
  "projekte/02-title":document.getElementById("project2Title"),
  "projekte/03-title":document.getElementById("project3Title"),
  "projekte/04-title":document.getElementById("project4Title"),
  "projekte/05-title":document.getElementById("project5Title"),
  "projekte/06-title":document.getElementById("project6Title")
};
const saveProjectTitles=document.getElementById("saveProjectTitles");
const reloadProjectTitles=document.getElementById("reloadProjectTitles");
const projectTitleStatus=document.getElementById("projectTitleStatus");
const contactTextFields={
  "kontakt/eyebrow":document.getElementById("contactEyebrow"),
  "kontakt/title":document.getElementById("contactTitle"),
  "kontakt/lead":document.getElementById("contactLead"),
  "kontakt/telefon-label":document.getElementById("contactPhoneLabel"),
  "kontakt/telefon-1":document.getElementById("contactPhone1"),
  "kontakt/telefon-2":document.getElementById("contactPhone2"),
  "kontakt/email-label":document.getElementById("contactEmailLabel"),
  "kontakt/email":document.getElementById("contactEmail"),
  "kontakt/adresse-label":document.getElementById("contactAddressLabel"),
  "kontakt/adresse":document.getElementById("contactAddress"),
  "kontakt/form-title":document.getElementById("contactFormTitle"),
  "kontakt/form-lead":document.getElementById("contactFormLead"),
  "kontakt/name-label":document.getElementById("contactNameLabel"),
  "kontakt/name-placeholder":document.getElementById("contactNamePlaceholder"),
  "kontakt/email-field-label":document.getElementById("contactEmailFieldLabel"),
  "kontakt/email-placeholder":document.getElementById("contactEmailPlaceholder"),
  "kontakt/subject-label":document.getElementById("contactSubjectLabel"),
  "kontakt/subject-placeholder":document.getElementById("contactSubjectPlaceholder"),
  "kontakt/message-label":document.getElementById("contactMessageLabel"),
  "kontakt/message-placeholder":document.getElementById("contactMessagePlaceholder"),
  "kontakt/button":document.getElementById("contactButtonText"),
  "kontakt/form-note":document.getElementById("contactFormNote")
};
const saveContactTexts=document.getElementById("saveContactTexts");
const reloadContactTexts=document.getElementById("reloadContactTexts");
const contactTextStatus=document.getElementById("contactTextStatus");

const serviceContactTextFields={
  "kontakt/service-eyebrow":document.getElementById("contactServiceEyebrow"),
  "kontakt/ingenieurvermessung/title":document.getElementById("contactEngineerTitle"),
  "kontakt/ingenieurvermessung/lead":document.getElementById("contactEngineerLead"),
  "kontakt/ingenieurvermessung/subject":document.getElementById("contactEngineerSubject"),
  "kontakt/gis-bauvermessung/title":document.getElementById("contactGisTitle"),
  "kontakt/gis-bauvermessung/lead":document.getElementById("contactGisLead"),
  "kontakt/gis-bauvermessung/subject":document.getElementById("contactGisSubject"),
  "kontakt/3d-laserscanning/title":document.getElementById("contactScanTitle"),
  "kontakt/3d-laserscanning/lead":document.getElementById("contactScanLead"),
  "kontakt/3d-laserscanning/subject":document.getElementById("contactScanSubject"),
  "kontakt/drohnenvermessung/title":document.getElementById("contactDroneTitle"),
  "kontakt/drohnenvermessung/lead":document.getElementById("contactDroneLead"),
  "kontakt/drohnenvermessung/subject":document.getElementById("contactDroneSubject")
};
const saveServiceContactTexts=document.getElementById("saveServiceContactTexts");
const reloadServiceContactTexts=document.getElementById("reloadServiceContactTexts");
const serviceContactTextStatus=document.getElementById("serviceContactTextStatus");

if(apiUrlInput){
  apiUrlInput.value=(window.GUDELIUS_CMS_API||localStorage.getItem("gudelius-cms-api")||"").replace(/\/$/,"");
}
if(tokenInput){
  tokenInput.value=sessionStorage.getItem("gudelius-cms-token")||"";
}

function getApi(){
  let value=(apiUrlInput?.value||window.GUDELIUS_CMS_API||localStorage.getItem("gudelius-cms-api")||"").trim().replace(/\/$/,"");
  if(value && !/^https?:\/\//i.test(value)) value="https://"+value;
  return value;
}
function getToken(){
  return (tokenInput?.value||sessionStorage.getItem("gudelius-cms-token")||"").trim();
}
function mediaUrl(key){return getApi()+"/media/"+key.split("/").map(encodeURIComponent).join("/")}

if(saveButton){
  saveButton.addEventListener("click",()=>{
    const api=getApi();
    if(api){
      apiUrlInput.value=api;
      localStorage.setItem("gudelius-cms-api",api);
    }else{
      localStorage.removeItem("gudelius-cms-api");
    }
    if(getToken()) sessionStorage.setItem("gudelius-cms-token",getToken());
    else sessionStorage.removeItem("gudelius-cms-token");
    setStatus(connectionStatus,"Verbindungsdaten gespeichert.",true);
    render();
    loadInquiries();
  });
}

if(testButton){
  testButton.addEventListener("click",async()=>{
    if(!getApi()) return setStatus(connectionStatus,"Bitte zuerst die Worker-URL eintragen.",false);
    setStatus(connectionStatus,"Teste Verbindung …");
    try{
      const r=await fetch(getApi()+"/api/health");
      if(!r.ok) throw new Error("HTTP "+r.status);
      const data=await r.json();
      setStatus(connectionStatus,data.ok?"Cloudflare Worker erreichbar.":"Unerwartete Antwort.",!!data.ok);
    }catch(e){
      setStatus(connectionStatus,"Worker nicht erreichbar: "+e.message,false);
    }
  });
}

const heroTextDefaults={
  "startseite/hero-eyebrow":"Vermessung für anspruchsvolle Projekte",
  "startseite/hero-title":"Von der Planung bis zum Bestand.",
  "startseite/hero-lead":"Wir begleiten Bau- und Infrastrukturprojekte mit präziser Vermessung und digitalen Geodaten – zuverlässig, nachvollziehbar und mit moderner Technik."
};

function contentUrl(key){
  return getApi()+"/api/content/"+key.split("/").map(encodeURIComponent).join("/");
}

async function loadHeroTexts(){
  if(!heroTextStatus) return;
  if(!getApi()) return setStatus(heroTextStatus,"Worker-URL fehlt.",false);
  setStatus(heroTextStatus,"Lade Texte …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    heroEyebrow.value=typeof content["startseite/hero-eyebrow"]==="string" ? content["startseite/hero-eyebrow"] : heroTextDefaults["startseite/hero-eyebrow"];
    heroTitle.value=typeof content["startseite/hero-title"]==="string" ? content["startseite/hero-title"] : heroTextDefaults["startseite/hero-title"];
    heroLead.value=typeof content["startseite/hero-lead"]==="string" ? content["startseite/hero-lead"] : heroTextDefaults["startseite/hero-lead"];
    setStatus(heroTextStatus,"Texte geladen.",true);
  }catch(error){
    heroEyebrow.value=heroTextDefaults["startseite/hero-eyebrow"];
    heroTitle.value=heroTextDefaults["startseite/hero-title"];
    heroLead.value=heroTextDefaults["startseite/hero-lead"];
    setStatus(heroTextStatus,"CMS-Texte konnten nicht geladen werden: "+error.message,false);
  }
}

async function saveHeroText(key,value){
  const response=await fetch(contentUrl(key),{
    method:"PUT",
    headers:{
      "authorization":"Bearer "+getToken(),
      "content-type":"application/json"
    },
    body:JSON.stringify(value)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
}

if(saveHeroTexts){
  saveHeroTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(heroTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    saveHeroTexts.disabled=true;
    setStatus(heroTextStatus,"Speichere Texte …");
    try{
      await Promise.all([
        saveHeroText("startseite/hero-eyebrow",heroEyebrow.value.trim()),
        saveHeroText("startseite/hero-title",heroTitle.value.trim()),
        saveHeroText("startseite/hero-lead",heroLead.value.trim())
      ]);
      setStatus(heroTextStatus,"Startseitentexte erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(heroTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveHeroTexts.disabled=false;
    }
  });
}

if(reloadHeroTexts) reloadHeroTexts.addEventListener("click",loadHeroTexts);

const serviceTextDefaults={
  "leistungen/01-title":"Ingenieurvermessung",
  "leistungen/01-text":"Bauabsteckung, Kontrollen, Planungsgrundlagen, Bestands- und Innenaufmaß sowie Kataster- und Überwachungsmessungen.",
  "leistungen/02-title":"GIS & Bauvermessung",
  "leistungen/02-text":"Leitungsdokumentation, Tief- und Straßenbau, DGM/Massen, Maschinensteuerung und präzise Absteckung.",
  "leistungen/03-title":"3D-Laserscanning",
  "leistungen/03-text":"Verformungsgerechtes Aufmaß, 2D-/3D-Auswertung sowie CAD- und BIM-Schnittstellen.",
  "leistungen/04-title":"Drohnenvermessung",
  "leistungen/04-text":"RTK-Drohne für Massenermittlung, Inspektion, Orthophotos und Infrastruktur-Bestand."
};

async function loadServiceTexts(){
  const activeControls=serviceTextControls.filter(control=>control.status);
  if(!activeControls.length) return;

  if(!getApi()){
    activeControls.forEach(control=>setStatus(control.status,"Worker-URL fehlt.",false));
    return;
  }

  activeControls.forEach(control=>setStatus(control.status,"Lade Kacheltext …"));

  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};

    Object.entries(serviceTextFields).forEach(([key,field])=>{
      if(field) field.value=typeof content[key]==="string" ? content[key] : serviceTextDefaults[key];
    });

    activeControls.forEach(control=>setStatus(control.status,control.label+" geladen.",true));
  }catch(error){
    Object.entries(serviceTextFields).forEach(([key,field])=>{
      if(field) field.value=serviceTextDefaults[key];
    });
    activeControls.forEach(control=>setStatus(control.status,"Kacheltext konnte nicht geladen werden: "+error.message,false));
  }
}

serviceTextControls.forEach(control=>{
  if(control.save){
    control.save.addEventListener("click",async()=>{
      if(!getApi()||!getToken()){
        return setStatus(control.status,"Worker-URL und Admin-Token fehlen.",false);
      }

      control.save.disabled=true;
      setStatus(control.status,"Speichere Kacheltext …");
      try{
        await Promise.all(control.keys.map(key=>{
          const field=serviceTextFields[key];
          return saveHeroText(key,field?.value.trim()||"");
        }));
        setStatus(control.status,control.label+" erfolgreich gespeichert.",true);
      }catch(error){
        setStatus(control.status,"Speichern fehlgeschlagen: "+error.message,false);
      }finally{
        control.save.disabled=false;
      }
    });
  }

  if(control.reload){
    control.reload.addEventListener("click",loadServiceTexts);
  }
});

const companyTextDefaults={
  "unternehmen/eyebrow":"Ihr Ansprechpartner",
  "unternehmen/title":"Persönlich geführt. Direkt erreichbar.",
  "unternehmen/name":"Jost Gudelius, B. Eng. (FH)",
  "unternehmen/lead":"ist Vermessungsingenieur mit langjähriger Projekterfahrung im Hoch-, Tief- und Straßenbau. Seit 2020 führt er sein eigenes Vermessungsbüro in Jachenau.",
  "unternehmen/timeline-1-year":"Seit 2020",
  "unternehmen/timeline-1-text":"GudeliusVermessung",
  "unternehmen/timeline-2-year":"2013 – 2020",
  "unternehmen/timeline-2-text":"Projektleitende Tätigkeit als Vermessungsingenieur",
  "unternehmen/timeline-3-year":"2013",
  "unternehmen/timeline-3-text":"Geoinformatik und Satellitenpositionierung · FH München"
};

async function loadCompanyTexts(){
  if(!companyTextStatus) return;
  if(!getApi()) return setStatus(companyTextStatus,"Worker-URL fehlt.",false);
  setStatus(companyTextStatus,"Lade Unternehmenstexte …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(companyTextFields).forEach(([key,field])=>{
      if(field) field.value=typeof content[key]==="string" ? content[key] : companyTextDefaults[key];
    });
    setStatus(companyTextStatus,"Unternehmenstexte geladen.",true);
  }catch(error){
    Object.entries(companyTextFields).forEach(([key,field])=>{
      if(field) field.value=companyTextDefaults[key];
    });
    setStatus(companyTextStatus,"Unternehmenstexte konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveCompanyTexts){
  saveCompanyTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(companyTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    saveCompanyTexts.disabled=true;
    setStatus(companyTextStatus,"Speichere Unternehmenstexte …");
    try{
      await Promise.all(Object.entries(companyTextFields).map(([key,field])=>
        saveHeroText(key,field.value.trim())
      ));
      setStatus(companyTextStatus,"Unternehmenstexte erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(companyTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveCompanyTexts.disabled=false;
    }
  });
}

if(reloadCompanyTexts) reloadCompanyTexts.addEventListener("click",loadCompanyTexts);

const projectTitleDefaults={
  "projekte/01-title":"Ingenieur- & Bauvermessung",
  "projekte/02-title":"3D-Laserscanning",
  "projekte/03-title":"RTK-Drohnenvermessung",
  "projekte/04-title":"Gelände & Gewässer",
  "projekte/05-title":"Mobiler Einsatz",
  "projekte/06-title":"Bestand & Planung"
};

async function loadProjectTitles(){
  if(!projectTitleStatus) return;
  if(!getApi()) return setStatus(projectTitleStatus,"Worker-URL fehlt.",false);
  setStatus(projectTitleStatus,"Lade Projekt-Titel …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(projectTitleFields).forEach(([key,field])=>{
      if(field) field.value=typeof content[key]==="string" ? content[key] : projectTitleDefaults[key];
    });
    setStatus(projectTitleStatus,"Projekt-Titel geladen.",true);
  }catch(error){
    Object.entries(projectTitleFields).forEach(([key,field])=>{
      if(field) field.value=projectTitleDefaults[key];
    });
    setStatus(projectTitleStatus,"Projekt-Titel konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveProjectTitles){
  saveProjectTitles.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(projectTitleStatus,"Worker-URL und Admin-Token fehlen.",false);
    saveProjectTitles.disabled=true;
    setStatus(projectTitleStatus,"Speichere Projekt-Titel …");
    try{
      await Promise.all(Object.entries(projectTitleFields).map(([key,field])=>
        saveHeroText(key,field.value.trim())
      ));
      setStatus(projectTitleStatus,"Projekt-Titel erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(projectTitleStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveProjectTitles.disabled=false;
    }
  });
}

if(reloadProjectTitles) reloadProjectTitles.addEventListener("click",loadProjectTitles);

const contactTextDefaults={
  "kontakt/eyebrow":"Kontakt",
  "kontakt/title":"Welches Projekt dürfen wir vermessen?",
  "kontakt/lead":"Kurze Eckdaten genügen für den ersten Austausch.",
  "kontakt/telefon-label":"Telefon",
  "kontakt/telefon-1":"08043 / 9187958",
  "kontakt/telefon-2":"01511 / 5653694",
  "kontakt/email-label":"E-Mail",
  "kontakt/email":"gudeliusvermessung@web.de",
  "kontakt/adresse-label":"Adresse",
  "kontakt/adresse":"Bäcker 25 · 83676 Jachenau",
  "kontakt/form-title":"Projektanfrage",
  "kontakt/form-lead":"Was soll vermessen werden?",
  "kontakt/name-label":"Name",
  "kontakt/name-placeholder":"Vor- und Nachname",
  "kontakt/email-field-label":"E-Mail",
  "kontakt/email-placeholder":"name@firma.de",
  "kontakt/subject-label":"Projekt / Betreff",
  "kontakt/subject-placeholder":"z. B. Bauvermessung Mehrfamilienhaus",
  "kontakt/message-label":"Nachricht",
  "kontakt/message-placeholder":"Projekt, Ort und gewünschte Leistung",
  "kontakt/button":"Anfrage senden →",
  "kontakt/form-note":"Die Anfrage wird direkt und ohne Öffnen eines E-Mail-Programms übermittelt."
};

const serviceContactTextDefaults={
  "kontakt/service-eyebrow":"Projektanfrage",
  "kontakt/ingenieurvermessung/title":"Ingenieurvermessung für Ihr Projekt anfragen.",
  "kontakt/ingenieurvermessung/lead":"Kurze Eckdaten zu Projekt, Ort und gewünschter Leistung reichen für den ersten Austausch.",
  "kontakt/ingenieurvermessung/subject":"Anfrage Ingenieurvermessung",
  "kontakt/gis-bauvermessung/title":"Bau- oder Infrastrukturprojekt besprechen.",
  "kontakt/gis-bauvermessung/lead":"Kurze Eckdaten zu Projekt, Ort und gewünschter Leistung reichen für den ersten Austausch.",
  "kontakt/gis-bauvermessung/subject":"Anfrage GIS & Bauvermessung",
  "kontakt/3d-laserscanning/title":"Bestand digital erfassen lassen.",
  "kontakt/3d-laserscanning/lead":"Kurze Eckdaten zu Projekt, Ort und gewünschter Leistung reichen für den ersten Austausch.",
  "kontakt/3d-laserscanning/subject":"Anfrage 3D-Laserscanning",
  "kontakt/drohnenvermessung/title":"Drohnenvermessung für Ihr Projekt anfragen.",
  "kontakt/drohnenvermessung/lead":"Kurze Eckdaten zu Projekt, Ort und gewünschter Leistung reichen für den ersten Austausch.",
  "kontakt/drohnenvermessung/subject":"Anfrage Drohnenvermessung"
};

async function loadContactTexts(){
  if(!contactTextStatus) return;
  if(!getApi()) return setStatus(contactTextStatus,"Worker-URL fehlt.",false);
  setStatus(contactTextStatus,"Lade Kontaktdaten …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(contactTextFields).forEach(([key,field])=>{
      if(field) field.value=typeof content[key]==="string" ? content[key] : contactTextDefaults[key];
    });
    setStatus(contactTextStatus,"Kontaktdaten geladen.",true);
  }catch(error){
    Object.entries(contactTextFields).forEach(([key,field])=>{
      if(field) field.value=contactTextDefaults[key];
    });
    setStatus(contactTextStatus,"Kontaktdaten konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveContactTexts){
  saveContactTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(contactTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    saveContactTexts.disabled=true;
    setStatus(contactTextStatus,"Speichere Kontaktdaten …");
    try{
      await Promise.all(Object.entries(contactTextFields).map(([key,field])=>
        saveHeroText(key,field.value.trim())
      ));
      setStatus(contactTextStatus,"Kontaktdaten erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(contactTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveContactTexts.disabled=false;
    }
  });
}

if(reloadContactTexts) reloadContactTexts.addEventListener("click",loadContactTexts);

async function loadServiceContactTexts(){
  if(!serviceContactTextStatus) return;
  if(!getApi()) return setStatus(serviceContactTextStatus,"Worker-URL fehlt.",false);
  setStatus(serviceContactTextStatus,"Lade Leistungs-Kontakttexte …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(serviceContactTextFields).forEach(([key,field])=>{
      if(field) field.value=typeof content[key]==="string" ? content[key] : serviceContactTextDefaults[key];
    });
    setStatus(serviceContactTextStatus,"Leistungs-Kontakttexte geladen.",true);
  }catch(error){
    Object.entries(serviceContactTextFields).forEach(([key,field])=>{
      if(field) field.value=serviceContactTextDefaults[key];
    });
    setStatus(serviceContactTextStatus,"Leistungs-Kontakttexte konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveServiceContactTexts){
  saveServiceContactTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(serviceContactTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    saveServiceContactTexts.disabled=true;
    setStatus(serviceContactTextStatus,"Speichere Leistungs-Kontakttexte …");
    try{
      await Promise.all(Object.entries(serviceContactTextFields).map(([key,field])=>
        saveHeroText(key,field.value.trim())
      ));
      setStatus(serviceContactTextStatus,"Leistungs-Kontakttexte erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(serviceContactTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveServiceContactTexts.disabled=false;
    }
  });
}

if(reloadServiceContactTexts) reloadServiceContactTexts.addEventListener("click",loadServiceContactTexts);


function inquiryStatusLabel(status){
  if(status==="in-arbeit") return "In Arbeit";
  if(status==="erledigt") return "Erledigt";
  return "Neu";
}

function formatInquiryDate(value){
  if(!value) return "–";
  const normalized=value.includes("T") ? value : value.replace(" ","T")+"Z";
  const date=new Date(normalized);
  if(Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE",{
    dateStyle:"medium",
    timeStyle:"short"
  }).format(date);
}

function updateInquiryStats(){
  const counts={neu:0,"in-arbeit":0,erledigt:0};
  inquiriesCache.forEach(item=>{
    if(Object.prototype.hasOwnProperty.call(counts,item.status)) counts[item.status]+=1;
  });

  if(inquiryCountNew) inquiryCountNew.textContent=counts.neu;
  if(inquiryCountProgress) inquiryCountProgress.textContent=counts["in-arbeit"];
  if(inquiryCountDone) inquiryCountDone.textContent=counts.erledigt;

  if(inquiryNavCount){
    inquiryNavCount.textContent=counts.neu;
    inquiryNavCount.hidden=counts.neu===0;
  }
}

function renderInquiries(){
  if(!inquiriesList) return;
  inquiriesList.innerHTML="";

  const filter=inquiryFilter?.value||"alle";
  const items=filter==="alle"
    ? inquiriesCache
    : inquiriesCache.filter(item=>item.status===filter);

  if(!items.length){
    const empty=document.createElement("div");
    empty.className="inquiry-empty";
    empty.textContent=filter==="alle"
      ? "Noch keine Projektanfragen vorhanden."
      : "Für diesen Status sind aktuell keine Anfragen vorhanden.";
    inquiriesList.appendChild(empty);
    return;
  }

  for(const inquiry of items){
    const card=document.createElement("article");
    card.className="inquiry-card";
    card.dataset.status=inquiry.status||"neu";

    const top=document.createElement("div");
    top.className="inquiry-card-top";

    const identity=document.createElement("div");
    identity.className="inquiry-identity";

    const name=document.createElement("strong");
    name.textContent=inquiry.name||"Ohne Name";

    const email=document.createElement("a");
    email.href="mailto:"+(inquiry.email||"");
    email.textContent=inquiry.email||"Keine E-Mail";

    identity.append(name,email);

    const badge=document.createElement("span");
    badge.className="inquiry-status-badge";
    badge.textContent=inquiryStatusLabel(inquiry.status);

    top.append(identity,badge);

    const meta=document.createElement("div");
    meta.className="inquiry-meta";

    const created=document.createElement("span");
    created.textContent=formatInquiryDate(inquiry.created_at);

    const source=document.createElement("span");
    source.textContent="Quelle: "+(inquiry.source||"/");

    meta.append(created,source);

    const subject=document.createElement("h3");
    subject.textContent=inquiry.subject||"Ohne Betreff";

    const message=document.createElement("p");
    message.className="inquiry-message";
    message.textContent=inquiry.message||"";

    const actions=document.createElement("div");
    actions.className="inquiry-actions";

    const statusLabel=document.createElement("label");
    statusLabel.textContent="Status";

    const select=document.createElement("select");
    [
      ["neu","Neu"],
      ["in-arbeit","In Arbeit"],
      ["erledigt","Erledigt"]
    ].forEach(([value,label])=>{
      const option=document.createElement("option");
      option.value=value;
      option.textContent=label;
      if(value===inquiry.status) option.selected=true;
      select.appendChild(option);
    });

    select.addEventListener("change",async()=>{
      const previous=inquiry.status;
      const next=select.value;
      select.disabled=true;
      badge.textContent="Speichert …";

      try{
        const response=await fetch(getApi()+"/api/contact/"+encodeURIComponent(inquiry.id),{
          method:"PUT",
          headers:{
            "authorization":"Bearer "+getToken(),
            "content-type":"application/json"
          },
          body:JSON.stringify({status:next})
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok) throw new Error(data.error||("HTTP "+response.status));

        inquiry.status=next;
        card.dataset.status=next;
        badge.textContent=inquiryStatusLabel(next);
        updateInquiryStats();

        if((inquiryFilter?.value||"alle")!=="alle"){
          renderInquiries();
        }
      }catch(error){
        select.value=previous;
        badge.textContent=inquiryStatusLabel(previous);
        setStatus(inquiriesStatus,"Status konnte nicht gespeichert werden: "+error.message,false);
      }finally{
        select.disabled=false;
      }
    });

    statusLabel.appendChild(select);

    const reply=document.createElement("a");
    reply.className="inquiry-reply";
    reply.href="mailto:"+(inquiry.email||"")+"?subject="+encodeURIComponent("Re: "+(inquiry.subject||"Ihre Anfrage"));
    reply.textContent="Per E-Mail antworten ↗";

    actions.append(statusLabel,reply);

    card.append(top,meta,subject,message,actions);
    inquiriesList.appendChild(card);
  }
}

async function loadInquiries(){
  if(!inquiriesList||!inquiriesStatus) return;

  if(!getApi()||!getToken()){
    inquiriesCache=[];
    updateInquiryStats();
    inquiriesList.innerHTML="";
    setStatus(inquiriesStatus,"Zum Laden der Anfragen bitte zuerst Worker-URL und Admin-Token verbinden.",false);
    return;
  }

  if(refreshInquiries) refreshInquiries.disabled=true;
  setStatus(inquiriesStatus,"Lade Projektanfragen …");

  try{
    const response=await fetch(getApi()+"/api/contact",{
      headers:{"authorization":"Bearer "+getToken()}
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||("HTTP "+response.status));

    inquiriesCache=Array.isArray(data.inquiries)?data.inquiries:[];
    updateInquiryStats();
    renderInquiries();
    setStatus(
      inquiriesStatus,
      inquiriesCache.length===1 ? "1 Anfrage geladen." : inquiriesCache.length+" Anfragen geladen.",
      true
    );
  }catch(error){
    inquiriesCache=[];
    updateInquiryStats();
    inquiriesList.innerHTML="";
    setStatus(inquiriesStatus,"Anfragen konnten nicht geladen werden: "+error.message,false);
  }finally{
    if(refreshInquiries) refreshInquiries.disabled=false;
  }
}

if(refreshInquiries) refreshInquiries.addEventListener("click",loadInquiries);
if(inquiryFilter) inquiryFilter.addEventListener("change",renderInquiries);


const engineerPageFields = [
  ["leistungsseiten/ingenieurvermessung/text/hero-eyebrow","engHeroEyebrow","Hochbau · Kontrolle · Bestand"],
  ["leistungsseiten/ingenieurvermessung/text/hero-title","engHeroTitle","Ingenieurvermessung"],
  ["leistungsseiten/ingenieurvermessung/text/hero-lead","engHeroLead","Präzise Vermessung für Bauvorhaben – von der Absteckung über Kontrollen bis zum Gebäudeaufmaß."],
  ["leistungsseiten/ingenieurvermessung/text/hero-primary","engHeroPrimary","Projekt anfragen →"],
  ["leistungsseiten/ingenieurvermessung/text/hero-secondary","engHeroSecondary","Leistung ansehen"],

  ["leistungsseiten/ingenieurvermessung/text/overview-eyebrow","engOverviewEyebrow","Im Überblick"],
  ["leistungsseiten/ingenieurvermessung/text/overview-title","engOverviewTitle","Vermessung als verlässliche Grundlage für den Bau."],
  ["leistungsseiten/ingenieurvermessung/text/overview-text-1","engOverviewText1","Bei Bauprojekten müssen Planung und Ausführung eindeutig zusammenpassen. GudeliusVermessung begleitet diese Aufgaben mit präziser Absteckung, Kontrollen und nachvollziehbaren Ergebnissen."],
  ["leistungsseiten/ingenieurvermessung/text/overview-text-2","engOverviewText2","Der Schwerpunkt liegt auf einer direkten, projektbezogenen Zusammenarbeit und einer klaren Übergabe der Vermessungsdaten."],
  ["leistungsseiten/ingenieurvermessung/text/overview-back","engOverviewBack","← Alle Leistungsfelder"],
  ["leistungsseiten/ingenieurvermessung/text/tasks-eyebrow","engTasksEyebrow","Leistungsumfang"],
  ["leistungsseiten/ingenieurvermessung/text/tasks-title","engTasksTitle","Typische Aufgaben"],

  ["leistungsseiten/ingenieurvermessung/text/scope-eyebrow","engScopeEyebrow","Vollständiger Leistungsumfang"],
  ["leistungsseiten/ingenieurvermessung/text/scope-title","engScopeTitle","Alle Leistungen im Überblick."],
  ["leistungsseiten/ingenieurvermessung/text/scope-lead","engScopeLead","Die aktuelle Gudelius-Website führt für die Ingenieurvermessung folgende Einzelleistungen auf:"],
  ["leistungsseiten/ingenieurvermessung/text/scope-note","engScopeNote","Inhaltliche Basis: aktueller Leistungsumfang von GudeliusVermessung."],

  ["leistungsseiten/ingenieurvermessung/text/detail-eyebrow","engDetailEyebrow","Leistung im Detail"],
  ["leistungsseiten/ingenieurvermessung/text/detail-title","engDetailTitle","Präzision in jeder Bauphase."],
  ["leistungsseiten/ingenieurvermessung/text/detail-lead","engDetailLead","Die Leistungen decken typische vermessungstechnische Aufgaben im Hochbau und bei Bestandsaufnahmen ab."],
  ["leistungsseiten/ingenieurvermessung/text/detail-01-title","engDetail1Title","Absteckung"],
  ["leistungsseiten/ingenieurvermessung/text/detail-01-text","engDetail1Text","Planungsdaten werden in die Örtlichkeit übertragen und als Grundlage für die Ausführung bereitgestellt."],
  ["leistungsseiten/ingenieurvermessung/text/detail-02-title","engDetail2Title","Kontrolle"],
  ["leistungsseiten/ingenieurvermessung/text/detail-02-text","engDetail2Text","Lage und Ausführung können im Projektverlauf vermessungstechnisch überprüft werden."],
  ["leistungsseiten/ingenieurvermessung/text/detail-03-title","engDetail3Title","Bestand"],
  ["leistungsseiten/ingenieurvermessung/text/detail-03-text","engDetail3Text","Gebäude und vorhandene Situationen werden aufgenommen und für Planung oder Dokumentation aufbereitet."],

  ["leistungsseiten/ingenieurvermessung/text/results-eyebrow","engResultsEyebrow","Ergebnisse"],
  ["leistungsseiten/ingenieurvermessung/text/results-title","engResultsTitle","Vom Messwert zur nutzbaren Grundlage."],
  ["leistungsseiten/ingenieurvermessung/text/results-lead","engResultsLead","Je nach Aufgabenstellung entstehen klassische Planunterlagen, Bestandsdaten oder digitale Grundlagen für die weitere Planung."],
  ["leistungsseiten/ingenieurvermessung/text/result-01-title","engResult1Title","CAD & Pläne"],
  ["leistungsseiten/ingenieurvermessung/text/result-01-text","engResult1Text","Aufbereitete Vermessungsgrundlagen für die weitere Projektbearbeitung."],
  ["leistungsseiten/ingenieurvermessung/text/result-02-title","engResult2Title","PDF & Dokumentation"],
  ["leistungsseiten/ingenieurvermessung/text/result-02-text","engResult2Text","Nachvollziehbare Ergebnisse für Abstimmung und Projektdokumentation."],
  ["leistungsseiten/ingenieurvermessung/text/result-03-title","engResult3Title","Bestandsdaten"],
  ["leistungsseiten/ingenieurvermessung/text/result-03-text","engResult3Text","Erfasste Geometrie als Grundlage für weitere Planungsschritte."],
  ["leistungsseiten/ingenieurvermessung/text/result-04-title","engResult4Title","Direkte Abstimmung"],
  ["leistungsseiten/ingenieurvermessung/text/result-04-text","engResult4Text","Ein Ansprechpartner vom Außendienst bis zur Auswertung."],

  ["leistungsseiten/ingenieurvermessung/text/process-eyebrow","engProcessEyebrow","Projektablauf"],
  ["leistungsseiten/ingenieurvermessung/text/process-title","engProcessTitle","Klare Schritte. Direkte Abstimmung."],
  ["leistungsseiten/ingenieurvermessung/text/process-01-title","engProcess1Title","Anforderung klären"],
  ["leistungsseiten/ingenieurvermessung/text/process-01-text","engProcess1Text","Projekt, Ort und gewünschtes Ergebnis gemeinsam festlegen."],
  ["leistungsseiten/ingenieurvermessung/text/process-02-title","engProcess2Title","Vermessung"],
  ["leistungsseiten/ingenieurvermessung/text/process-02-text","engProcess2Text","Passende Methode und Technik für die Aufgabe einsetzen."],
  ["leistungsseiten/ingenieurvermessung/text/process-03-title","engProcess3Title","Auswertung"],
  ["leistungsseiten/ingenieurvermessung/text/process-03-text","engProcess3Text","Messdaten prüfen, aufbereiten und projektbezogen auswerten."],
  ["leistungsseiten/ingenieurvermessung/text/process-04-title","engProcess4Title","Übergabe"],
  ["leistungsseiten/ingenieurvermessung/text/process-04-text","engProcess4Text","Ergebnisse nachvollziehbar und in nutzbarer Form bereitstellen."],

  ["leistungsseiten/ingenieurvermessung/text/related-eyebrow","engRelatedEyebrow","Weitere Leistungen"],
  ["leistungsseiten/ingenieurvermessung/text/related-title","engRelatedTitle","Passende Ergänzungen für Ihr Projekt."],
  ["leistungsseiten/ingenieurvermessung/text/related-link-label","engRelatedLinkLabel","Mehr erfahren →"],
  ["leistungsseiten/ingenieurvermessung/text/related-01-title","engRelated1Title","GIS & Bauvermessung"],
  ["leistungsseiten/ingenieurvermessung/text/related-01-text","engRelated1Text","Tiefbau, Leitungen, Straßenbau und digitale Geländemodelle."],
  ["leistungsseiten/ingenieurvermessung/text/related-02-title","engRelated2Title","3D-Laserscanning"],
  ["leistungsseiten/ingenieurvermessung/text/related-02-text","engRelated2Text","Punktwolken und digitale Modelle für komplexe Bestände."],
  ["leistungsseiten/ingenieurvermessung/text/related-03-title","engRelated3Title","Drohnenvermessung"],
  ["leistungsseiten/ingenieurvermessung/text/related-03-text","engRelated3Text","Orthophotos, Flächen und Massenermittlung aus der Luft."]
];

const engineerTaskDefaults = [
  "Bauabsteckung & Schnurgerüst",
  "Kontrollmessungen",
  "Planungsgrundlagen",
  "Bestands- & Innenaufmaß",
  "Kataster & Grundstücksteilung"
];

const engineerScopeDefaults = [
  "Bauabsteckung/Schnurgerüst; Nachweise: Einmessprotokoll, -bestätigung, -bescheinigung",
  "Sockel- und Wandkontrollen während der Bauphase mit Nachweisen",
  "Baustellenvorbereitung: Lage- und Höhenfestpunkte für Folgegewerke",
  "Planungsgrundlagen: Eingabe-, Bebauungs-, Garten-, Gelände- und Straßenplanung",
  "Abstandsflächen bestehender Gebäude nach BayBO",
  "Innenaufmaß für Umbau, Anbau, Renovierung sowie Wohn-/Nutzflächen",
  "Gewässer-Bestand: Flussprofile und Schnitte",
  "Retentionsberechnung bei Bauvorhaben in Überschwemmungsgebieten",
  "Gebäudeeinmessung nach GÜVO für die Katasterübernahme",
  "Grundstücksteilung: Parzellierung/Zerlegung, Neupunkt-Koordinaten, NAS, ADBV-Antragsvorbereitung",
  "Überwachungsmessungen: Gebäude, Bauwerke, Gruben-/Hangverbau, Altablagerungen"
];

const engineerTasksInput=document.getElementById("engTasksItems");
const engineerScopeInput=document.getElementById("engScopeItems");
const saveEngineerPageTexts=document.getElementById("saveEngineerPageTexts");
const reloadEngineerPageTexts=document.getElementById("reloadEngineerPageTexts");
const engineerPageTextStatus=document.getElementById("engineerPageTextStatus");

function engineerListValue(content,prefix,defaults){
  return defaults.map((fallback,index)=>{
    const key=prefix+String(index+1).padStart(2,"0");
    return typeof content[key]==="string" ? content[key] : fallback;
  }).join("\n");
}

async function loadEngineerPageTexts(){
  if(!engineerPageTextStatus) return;
  if(!getApi()) return setStatus(engineerPageTextStatus,"Worker-URL fehlt.",false);

  setStatus(engineerPageTextStatus,"Lade Ingenieurvermessung …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};

    engineerPageFields.forEach(([key,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=typeof content[key]==="string" ? content[key] : fallback;
    });

    if(engineerTasksInput){
      engineerTasksInput.value=engineerListValue(
        content,
        "leistungsseiten/ingenieurvermessung/text/task-",
        engineerTaskDefaults
      );
    }

    if(engineerScopeInput){
      engineerScopeInput.value=engineerListValue(
        content,
        "leistungsseiten/ingenieurvermessung/text/scope-",
        engineerScopeDefaults
      );
    }

    setStatus(engineerPageTextStatus,"Ingenieurvermessung geladen.",true);
  }catch(error){
    engineerPageFields.forEach(([,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=fallback;
    });
    if(engineerTasksInput) engineerTasksInput.value=engineerTaskDefaults.join("\n");
    if(engineerScopeInput) engineerScopeInput.value=engineerScopeDefaults.join("\n");
    setStatus(engineerPageTextStatus,"Texte konnten nicht geladen werden: "+error.message,false);
  }
}

async function saveCmsEntriesInBatches(entries,batchSize=6){
  for(let index=0;index<entries.length;index+=batchSize){
    await Promise.all(
      entries.slice(index,index+batchSize).map(([key,value])=>saveHeroText(key,value))
    );
  }
}

if(saveEngineerPageTexts){
  saveEngineerPageTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()){
      return setStatus(engineerPageTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    }

    const taskLines=(engineerTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(engineerScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    if(taskLines.length!==5){
      return setStatus(engineerPageTextStatus,"Bei „Typische Aufgaben“ bitte genau 5 Zeilen verwenden.",false);
    }
    if(scopeLines.length!==11){
      return setStatus(engineerPageTextStatus,"Beim vollständigen Leistungsumfang bitte genau 11 Zeilen verwenden.",false);
    }

    const entries=engineerPageFields.map(([key,id])=>[
      key,
      document.getElementById(id)?.value.trim()||""
    ]);

    taskLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/ingenieurvermessung/text/task-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    scopeLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/ingenieurvermessung/text/scope-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    saveEngineerPageTexts.disabled=true;
    setStatus(engineerPageTextStatus,"Speichere Ingenieurvermessung …");
    try{
      await saveCmsEntriesInBatches(entries);
      setStatus(engineerPageTextStatus,"Ingenieurvermessung erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(engineerPageTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveEngineerPageTexts.disabled=false;
    }
  });
}

if(reloadEngineerPageTexts){
  reloadEngineerPageTexts.addEventListener("click",loadEngineerPageTexts);
}


const gisPageFields = [
  ["leistungsseiten/gis-bauvermessung/text/hero-eyebrow","gisHeroEyebrow","Tiefbau · Infrastruktur · Gelände"],
  ["leistungsseiten/gis-bauvermessung/text/hero-title","gisHeroTitle","GIS & Bauvermessung"],
  ["leistungsseiten/gis-bauvermessung/text/hero-lead","gisHeroLead","Vermessungsdaten für Tiefbau, Leitungen, Straßenbau und digitale Geländemodelle – projektbezogen und weiterverwendbar."],
  ["leistungsseiten/gis-bauvermessung/text/hero-primary","gisHeroPrimary","Projekt anfragen →"],
  ["leistungsseiten/gis-bauvermessung/text/hero-secondary","gisHeroSecondary","Leistung ansehen"],

  ["leistungsseiten/gis-bauvermessung/text/overview-eyebrow","gisOverviewEyebrow","Im Überblick"],
  ["leistungsseiten/gis-bauvermessung/text/overview-title","gisOverviewTitle","Geodaten für Bau und Infrastruktur."],
  ["leistungsseiten/gis-bauvermessung/text/overview-text-1","gisOverviewText1","Bei Infrastruktur- und Tiefbauprojekten müssen Gelände, Leitungen und Bauzustände zuverlässig erfasst und weiterverarbeitet werden können."],
  ["leistungsseiten/gis-bauvermessung/text/overview-text-2","gisOverviewText2","GudeliusVermessung verbindet klassische Bauvermessung mit digitalen Geländedaten und unterstützt damit Planung, Ausführung und Mengenermittlung."],
  ["leistungsseiten/gis-bauvermessung/text/overview-back","gisOverviewBack","← Alle Leistungsfelder"],
  ["leistungsseiten/gis-bauvermessung/text/tasks-eyebrow","gisTasksEyebrow","Leistungsumfang"],
  ["leistungsseiten/gis-bauvermessung/text/tasks-title","gisTasksTitle","Typische Aufgaben"],

  ["leistungsseiten/gis-bauvermessung/text/scope-eyebrow","gisScopeEyebrow","Vollständiger Leistungsumfang"],
  ["leistungsseiten/gis-bauvermessung/text/scope-title","gisScopeTitle","Alle Leistungen im Überblick."],
  ["leistungsseiten/gis-bauvermessung/text/scope-lead","gisScopeLead","Für GIS & Bauvermessung nennt Gudelius aktuell diese konkreten Leistungen:"],
  ["leistungsseiten/gis-bauvermessung/text/scope-note","gisScopeNote","Inhaltliche Basis: aktueller Leistungsumfang von GudeliusVermessung."],

  ["leistungsseiten/gis-bauvermessung/text/detail-eyebrow","gisDetailEyebrow","Leistung im Detail"],
  ["leistungsseiten/gis-bauvermessung/text/detail-title","gisDetailTitle","Gelände und Infrastruktur digital erfassen."],
  ["leistungsseiten/gis-bauvermessung/text/detail-lead","gisDetailLead","Von der örtlichen Aufnahme bis zur digitalen Grundlage für Planung und Bauausführung."],
  ["leistungsseiten/gis-bauvermessung/text/detail-01-title","gisDetail1Title","Geländemodelle"],
  ["leistungsseiten/gis-bauvermessung/text/detail-01-text","gisDetail1Text","Gelände und Höheninformationen werden erfasst und als digitale Grundlage aufbereitet."],
  ["leistungsseiten/gis-bauvermessung/text/detail-02-title","gisDetail2Title","Bauvermessung"],
  ["leistungsseiten/gis-bauvermessung/text/detail-02-text","gisDetail2Text","Vermessungsarbeiten begleiten Tiefbau-, Leitungs- und Straßenbauaufgaben."],
  ["leistungsseiten/gis-bauvermessung/text/detail-03-title","gisDetail3Title","Mengen & Steuerung"],
  ["leistungsseiten/gis-bauvermessung/text/detail-03-text","gisDetail3Text","Vermessungsdaten können für Mengenbetrachtungen und Maschinensteuerung genutzt werden."],

  ["leistungsseiten/gis-bauvermessung/text/results-eyebrow","gisResultsEyebrow","Ergebnisse"],
  ["leistungsseiten/gis-bauvermessung/text/results-title","gisResultsTitle","Vom Messwert zur nutzbaren Grundlage."],
  ["leistungsseiten/gis-bauvermessung/text/results-lead","gisResultsLead","Die Ergebnisse werden so aufbereitet, dass sie in den weiteren Projektablauf übernommen werden können."],
  ["leistungsseiten/gis-bauvermessung/text/result-01-title","gisResult1Title","Digitale Geländemodelle"],
  ["leistungsseiten/gis-bauvermessung/text/result-01-text","gisResult1Text","Aufbereitete Gelände- und Höhendaten für Planung und Ausführung."],
  ["leistungsseiten/gis-bauvermessung/text/result-02-title","gisResult2Title","CAD & PDF"],
  ["leistungsseiten/gis-bauvermessung/text/result-02-text","gisResult2Text","Planbare und nachvollziehbare Ergebnisse für die Projektbeteiligten."],
  ["leistungsseiten/gis-bauvermessung/text/result-03-title","gisResult3Title","Mengengrundlagen"],
  ["leistungsseiten/gis-bauvermessung/text/result-03-text","gisResult3Text","Messdaten als Basis für projektbezogene Mengenbetrachtungen."],
  ["leistungsseiten/gis-bauvermessung/text/result-04-title","gisResult4Title","Geodaten"],
  ["leistungsseiten/gis-bauvermessung/text/result-04-text","gisResult4Text","Strukturierte Daten für GIS- und Bauprozesse."],

  ["leistungsseiten/gis-bauvermessung/text/process-eyebrow","gisProcessEyebrow","Projektablauf"],
  ["leistungsseiten/gis-bauvermessung/text/process-title","gisProcessTitle","Klare Schritte. Direkte Abstimmung."],
  ["leistungsseiten/gis-bauvermessung/text/process-01-title","gisProcess1Title","Anforderung klären"],
  ["leistungsseiten/gis-bauvermessung/text/process-01-text","gisProcess1Text","Projekt, Ort und gewünschtes Ergebnis gemeinsam festlegen."],
  ["leistungsseiten/gis-bauvermessung/text/process-02-title","gisProcess2Title","Vermessung"],
  ["leistungsseiten/gis-bauvermessung/text/process-02-text","gisProcess2Text","Passende Methode und Technik für die Aufgabe einsetzen."],
  ["leistungsseiten/gis-bauvermessung/text/process-03-title","gisProcess3Title","Auswertung"],
  ["leistungsseiten/gis-bauvermessung/text/process-03-text","gisProcess3Text","Messdaten prüfen, aufbereiten und projektbezogen auswerten."],
  ["leistungsseiten/gis-bauvermessung/text/process-04-title","gisProcess4Title","Übergabe"],
  ["leistungsseiten/gis-bauvermessung/text/process-04-text","gisProcess4Text","Ergebnisse nachvollziehbar und in nutzbarer Form bereitstellen."],

  ["leistungsseiten/gis-bauvermessung/text/related-eyebrow","gisRelatedEyebrow","Weitere Leistungen"],
  ["leistungsseiten/gis-bauvermessung/text/related-title","gisRelatedTitle","Passende Ergänzungen für Ihr Projekt."],
  ["leistungsseiten/gis-bauvermessung/text/related-link-label","gisRelatedLinkLabel","Mehr erfahren →"],
  ["leistungsseiten/gis-bauvermessung/text/related-01-title","gisRelated1Title","Ingenieurvermessung"],
  ["leistungsseiten/gis-bauvermessung/text/related-01-text","gisRelated1Text","Absteckung, Kontrollen und Gebäudeaufmaß für Bauprojekte."],
  ["leistungsseiten/gis-bauvermessung/text/related-02-title","gisRelated2Title","3D-Laserscanning"],
  ["leistungsseiten/gis-bauvermessung/text/related-02-text","gisRelated2Text","Detaillierte Bestandsaufnahme mit Punktwolken."],
  ["leistungsseiten/gis-bauvermessung/text/related-03-title","gisRelated3Title","Drohnenvermessung"],
  ["leistungsseiten/gis-bauvermessung/text/related-03-text","gisRelated3Text","Flächen, Orthophotos und Massenermittlung aus der Luft."]
];

const gisTaskDefaults = [
  "Leitungsdokumentation",
  "Tief- & Straßenbau",
  "Digitale Geländemodelle",
  "Maschinensteuerung",
  "Massen & Abrechnung"
];

const gisScopeDefaults = [
  "Breitband-Leitungsdokumentation im offenen Graben, RIWA-GIS-fähig",
  "Absteckung vorhandener Sparten aus behördlicher GIS-Planauskunft",
  "Kommunale Leitungsdokumentation: Wasser, Fernwärme, Regen-/Schmutzwasser",
  "Grobabsteckung für Tiefbau: Gelände-, Hochwasser-, Lawinen-/Murenmaßnahmen",
  "Massenermittlung per DGM für Bauabrechnung",
  "Massenermittlung für Kiesgruben zur Finanzamt-Vorlage",
  "Maschinensteuerung: Festpunktfeld sowie Lage-/Höhenkontrollpunkte",
  "Aushubpläne mit DGM; Übergabe: DXF, DG1, XML, REB",
  "Absteckung: Verbauachsen, Bohrpfähle, Spritzbetonwände, Bermen, Ankeransatzpunkte",
  "Straßenbau: Trassierung, Böschungsschablonen, 3D-Feinabsteckung, Neubestand"
];

const gisTasksInput=document.getElementById("gisTasksItems");
const gisScopeInput=document.getElementById("gisScopeItems");
const saveGisPageTexts=document.getElementById("saveGisPageTexts");
const reloadGisPageTexts=document.getElementById("reloadGisPageTexts");
const gisPageTextStatus=document.getElementById("gisPageTextStatus");

async function loadGisPageTexts(){
  if(!gisPageTextStatus) return;
  if(!getApi()) return setStatus(gisPageTextStatus,"Worker-URL fehlt.",false);

  setStatus(gisPageTextStatus,"Lade GIS & Bauvermessung …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};

    gisPageFields.forEach(([key,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=typeof content[key]==="string" ? content[key] : fallback;
    });

    if(gisTasksInput){
      gisTasksInput.value=engineerListValue(
        content,
        "leistungsseiten/gis-bauvermessung/text/task-",
        gisTaskDefaults
      );
    }

    if(gisScopeInput){
      gisScopeInput.value=engineerListValue(
        content,
        "leistungsseiten/gis-bauvermessung/text/scope-",
        gisScopeDefaults
      );
    }

    setStatus(gisPageTextStatus,"GIS & Bauvermessung geladen.",true);
  }catch(error){
    gisPageFields.forEach(([,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=fallback;
    });
    if(gisTasksInput) gisTasksInput.value=gisTaskDefaults.join("\n");
    if(gisScopeInput) gisScopeInput.value=gisScopeDefaults.join("\n");
    setStatus(gisPageTextStatus,"Texte konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveGisPageTexts){
  saveGisPageTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()){
      return setStatus(gisPageTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    }

    const taskLines=(gisTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(gisScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    if(taskLines.length!==5){
      return setStatus(gisPageTextStatus,"Bei „Typische Aufgaben“ bitte genau 5 Zeilen verwenden.",false);
    }
    if(scopeLines.length!==10){
      return setStatus(gisPageTextStatus,"Beim vollständigen Leistungsumfang bitte genau 10 Zeilen verwenden.",false);
    }

    const entries=gisPageFields.map(([key,id])=>[
      key,
      document.getElementById(id)?.value.trim()||""
    ]);

    taskLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/gis-bauvermessung/text/task-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    scopeLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/gis-bauvermessung/text/scope-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    saveGisPageTexts.disabled=true;
    setStatus(gisPageTextStatus,"Speichere GIS & Bauvermessung …");
    try{
      await saveCmsEntriesInBatches(entries);
      setStatus(gisPageTextStatus,"GIS & Bauvermessung erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(gisPageTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveGisPageTexts.disabled=false;
    }
  });
}

if(reloadGisPageTexts){
  reloadGisPageTexts.addEventListener("click",loadGisPageTexts);
}



const scanPageFields = [
  ["leistungsseiten/3d-laserscanning/text/hero-eyebrow","scanHeroEyebrow","Punktwolke · Bestand · 3D"],
  ["leistungsseiten/3d-laserscanning/text/hero-title","scanHeroTitle","3D-Laserscanning"],
  ["leistungsseiten/3d-laserscanning/text/hero-lead","scanHeroLead","Detaillierte digitale Bestandserfassung mit 3D-Laserscanning – für Punktwolken, Aufmaß und digitale Modelle."],
  ["leistungsseiten/3d-laserscanning/text/hero-primary","scanHeroPrimary","Projekt anfragen →"],
  ["leistungsseiten/3d-laserscanning/text/hero-secondary","scanHeroSecondary","Leistung ansehen"],

  ["leistungsseiten/3d-laserscanning/text/overview-eyebrow","scanOverviewEyebrow","Im Überblick"],
  ["leistungsseiten/3d-laserscanning/text/overview-title","scanOverviewTitle","Komplexe Geometrien vollständig erfassen."],
  ["leistungsseiten/3d-laserscanning/text/overview-text-1","scanOverviewText1","3D-Laserscanning eignet sich für Situationen, in denen viele räumliche Informationen präzise und nachvollziehbar erfasst werden sollen."],
  ["leistungsseiten/3d-laserscanning/text/overview-text-2","scanOverviewText2","Aus der Aufnahme entstehen Punktwolken und digitale Grundlagen, die für weitere Planungs- und Dokumentationsschritte genutzt werden können."],
  ["leistungsseiten/3d-laserscanning/text/overview-back","scanOverviewBack","← Alle Leistungsfelder"],
  ["leistungsseiten/3d-laserscanning/text/tasks-eyebrow","scanTasksEyebrow","Leistungsumfang"],
  ["leistungsseiten/3d-laserscanning/text/tasks-title","scanTasksTitle","Typische Aufgaben"],

  ["leistungsseiten/3d-laserscanning/text/scope-eyebrow","scanScopeEyebrow","Vollständiger Leistungsumfang"],
  ["leistungsseiten/3d-laserscanning/text/scope-title","scanScopeTitle","Alle Leistungen im Überblick."],
  ["leistungsseiten/3d-laserscanning/text/scope-lead","scanScopeLead","Der Bereich 3D-Laserscanning umfasst auf der aktuellen Website diese Punkte:"],
  ["leistungsseiten/3d-laserscanning/text/scope-note","scanScopeNote","Inhaltliche Basis: aktueller Leistungsumfang von GudeliusVermessung."],

  ["leistungsseiten/3d-laserscanning/text/detail-eyebrow","scanDetailEyebrow","Leistung im Detail"],
  ["leistungsseiten/3d-laserscanning/text/detail-title","scanDetailTitle","Bestand als digitales 3D-Abbild."],
  ["leistungsseiten/3d-laserscanning/text/detail-lead","scanDetailLead","Der Laserscan erfasst räumliche Strukturen umfassend und bildet die Grundlage für digitale Auswertungen."],
  ["leistungsseiten/3d-laserscanning/text/detail-01-title","scanDetail1Title","Aufnahme"],
  ["leistungsseiten/3d-laserscanning/text/detail-01-text","scanDetail1Text","Räumliche Geometrien werden mit dem Laserscanner detailliert erfasst."],
  ["leistungsseiten/3d-laserscanning/text/detail-02-title","scanDetail2Title","Punktwolke"],
  ["leistungsseiten/3d-laserscanning/text/detail-02-text","scanDetail2Text","Die Messdaten bilden eine dreidimensionale Punktwolke des aufgenommenen Bestands."],
  ["leistungsseiten/3d-laserscanning/text/detail-03-title","scanDetail3Title","Modell & Auswertung"],
  ["leistungsseiten/3d-laserscanning/text/detail-03-text","scanDetail3Text","Aus den Daten können digitale Modelle und weitere Planungsgrundlagen abgeleitet werden."],

  ["leistungsseiten/3d-laserscanning/text/results-eyebrow","scanResultsEyebrow","Ergebnisse"],
  ["leistungsseiten/3d-laserscanning/text/results-title","scanResultsTitle","Vom Messwert zur nutzbaren Grundlage."],
  ["leistungsseiten/3d-laserscanning/text/results-lead","scanResultsLead","Die räumlichen Messdaten werden projektbezogen aufbereitet und können als Punktwolke, Modell oder Planungsgrundlage weitergegeben werden."],
  ["leistungsseiten/3d-laserscanning/text/result-01-title","scanResult1Title","Punktwolke"],
  ["leistungsseiten/3d-laserscanning/text/result-01-text","scanResult1Text","Dreidimensionale Messdaten als Grundlage für Auswertung und Planung."],
  ["leistungsseiten/3d-laserscanning/text/result-02-title","scanResult2Title","Digitale Modelle"],
  ["leistungsseiten/3d-laserscanning/text/result-02-text","scanResult2Text","Aufbereitete 3D-Grundlagen für die weitere Bearbeitung."],
  ["leistungsseiten/3d-laserscanning/text/result-03-title","scanResult3Title","Bestandsaufmaß"],
  ["leistungsseiten/3d-laserscanning/text/result-03-text","scanResult3Text","Detaillierte Erfassung vorhandener Geometrien."],
  ["leistungsseiten/3d-laserscanning/text/result-04-title","scanResult4Title","CAD & PDF"],
  ["leistungsseiten/3d-laserscanning/text/result-04-text","scanResult4Text","Ergänzende Pläne und Dokumentation je nach Projektanforderung."],

  ["leistungsseiten/3d-laserscanning/text/process-eyebrow","scanProcessEyebrow","Projektablauf"],
  ["leistungsseiten/3d-laserscanning/text/process-title","scanProcessTitle","Klare Schritte. Direkte Abstimmung."],
  ["leistungsseiten/3d-laserscanning/text/process-01-title","scanProcess1Title","Anforderung klären"],
  ["leistungsseiten/3d-laserscanning/text/process-01-text","scanProcess1Text","Projekt, Ort und gewünschtes Ergebnis gemeinsam festlegen."],
  ["leistungsseiten/3d-laserscanning/text/process-02-title","scanProcess2Title","Vermessung"],
  ["leistungsseiten/3d-laserscanning/text/process-02-text","scanProcess2Text","Passende Methode und Technik für die Aufgabe einsetzen."],
  ["leistungsseiten/3d-laserscanning/text/process-03-title","scanProcess3Title","Auswertung"],
  ["leistungsseiten/3d-laserscanning/text/process-03-text","scanProcess3Text","Messdaten prüfen, aufbereiten und projektbezogen auswerten."],
  ["leistungsseiten/3d-laserscanning/text/process-04-title","scanProcess4Title","Übergabe"],
  ["leistungsseiten/3d-laserscanning/text/process-04-text","scanProcess4Text","Ergebnisse nachvollziehbar und in nutzbarer Form bereitstellen."],

  ["leistungsseiten/3d-laserscanning/text/related-eyebrow","scanRelatedEyebrow","Weitere Leistungen"],
  ["leistungsseiten/3d-laserscanning/text/related-title","scanRelatedTitle","Passende Ergänzungen für Ihr Projekt."],
  ["leistungsseiten/3d-laserscanning/text/related-link-label","scanRelatedLinkLabel","Mehr erfahren →"],
  ["leistungsseiten/3d-laserscanning/text/related-01-title","scanRelated1Title","Ingenieurvermessung"],
  ["leistungsseiten/3d-laserscanning/text/related-01-text","scanRelated1Text","Klassische Vermessung für Bau, Kontrolle und Bestand."],
  ["leistungsseiten/3d-laserscanning/text/related-02-title","scanRelated2Title","GIS & Bauvermessung"],
  ["leistungsseiten/3d-laserscanning/text/related-02-text","scanRelated2Text","Geländedaten und Bauvermessung für Infrastrukturprojekte."],
  ["leistungsseiten/3d-laserscanning/text/related-03-title","scanRelated3Title","Drohnenvermessung"],
  ["leistungsseiten/3d-laserscanning/text/related-03-text","scanRelated3Text","Erfassung größerer Flächen aus der Luft."]
];

const scanTaskDefaults = [
  "Verformungsgerechtes Aufmaß",
  "2D-Auswertung",
  "3D-Auswertung",
  "CAD-/BIM-Schnittstellen"
];

const scanScopeDefaults = [
  "Verformungsgerechtes Aufmaß mit 3D-Laserscanner",
  "Auswertung in 2D und 3D",
  "2D-Schnittstellen: PDF, DWG, DXF",
  "3D-Schnittstellen: Archicad PLA/PLN, IFC"
];

const scanTasksInput=document.getElementById("scanTasksItems");
const scanScopeInput=document.getElementById("scanScopeItems");
const saveScanPageTexts=document.getElementById("saveScanPageTexts");
const reloadScanPageTexts=document.getElementById("reloadScanPageTexts");
const scanPageTextStatus=document.getElementById("scanPageTextStatus");

async function loadScanPageTexts(){
  if(!scanPageTextStatus) return;
  if(!getApi()) return setStatus(scanPageTextStatus,"Worker-URL fehlt.",false);

  setStatus(scanPageTextStatus,"Lade 3D-Laserscanning …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};

    scanPageFields.forEach(([key,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=typeof content[key]==="string" ? content[key] : fallback;
    });

    if(scanTasksInput){
      scanTasksInput.value=engineerListValue(
        content,
        "leistungsseiten/3d-laserscanning/text/task-",
        scanTaskDefaults
      );
    }

    if(scanScopeInput){
      scanScopeInput.value=engineerListValue(
        content,
        "leistungsseiten/3d-laserscanning/text/scope-",
        scanScopeDefaults
      );
    }

    setStatus(scanPageTextStatus,"3D-Laserscanning geladen.",true);
  }catch(error){
    scanPageFields.forEach(([,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=fallback;
    });
    if(scanTasksInput) scanTasksInput.value=scanTaskDefaults.join("\n");
    if(scanScopeInput) scanScopeInput.value=scanScopeDefaults.join("\n");
    setStatus(scanPageTextStatus,"Texte konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveScanPageTexts){
  saveScanPageTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()){
      return setStatus(scanPageTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    }

    const taskLines=(scanTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(scanScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    if(taskLines.length!==4){
      return setStatus(scanPageTextStatus,"Bei „Typische Aufgaben“ bitte genau 4 Zeilen verwenden.",false);
    }
    if(scopeLines.length!==4){
      return setStatus(scanPageTextStatus,"Beim vollständigen Leistungsumfang bitte genau 4 Zeilen verwenden.",false);
    }

    const entries=scanPageFields.map(([key,id])=>[
      key,
      document.getElementById(id)?.value.trim()||""
    ]);

    taskLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/3d-laserscanning/text/task-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    scopeLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/3d-laserscanning/text/scope-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    saveScanPageTexts.disabled=true;
    setStatus(scanPageTextStatus,"Speichere 3D-Laserscanning …");
    try{
      await saveCmsEntriesInBatches(entries);
      setStatus(scanPageTextStatus,"3D-Laserscanning erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(scanPageTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveScanPageTexts.disabled=false;
    }
  });
}

if(reloadScanPageTexts){
  reloadScanPageTexts.addEventListener("click",loadScanPageTexts);
}


const dronePageFields = [
  ["leistungsseiten/drohnenvermessung/text/hero-eyebrow","droneHeroEyebrow","RTK · Orthophoto · Fläche"],
  ["leistungsseiten/drohnenvermessung/text/hero-title","droneHeroTitle","Drohnenvermessung mit RTK-Drohne"],
  ["leistungsseiten/drohnenvermessung/text/hero-lead","droneHeroLead","Effiziente Erfassung aus der Luft für Orthophotos, Flächen, Infrastruktur, Inspektionen und Massenermittlung."],
  ["leistungsseiten/drohnenvermessung/text/hero-primary","droneHeroPrimary","Projekt anfragen →"],
  ["leistungsseiten/drohnenvermessung/text/hero-secondary","droneHeroSecondary","Leistung ansehen"],

  ["leistungsseiten/drohnenvermessung/text/overview-eyebrow","droneOverviewEyebrow","Im Überblick"],
  ["leistungsseiten/drohnenvermessung/text/overview-title","droneOverviewTitle","Große Bereiche aus der Luft erfassen."],
  ["leistungsseiten/drohnenvermessung/text/overview-text-1","droneOverviewText1","Drohnenvermessung ergänzt die terrestrische Vermessung dort, wo Flächen und Strukturen effizient aus der Luft aufgenommen werden sollen."],
  ["leistungsseiten/drohnenvermessung/text/overview-text-2","droneOverviewText2","Die Aufnahmen können als Grundlage für Orthophotos, Flächenauswertungen, Infrastrukturprojekte oder Massenermittlung genutzt werden."],
  ["leistungsseiten/drohnenvermessung/text/overview-back","droneOverviewBack","← Alle Leistungsfelder"],
  ["leistungsseiten/drohnenvermessung/text/tasks-eyebrow","droneTasksEyebrow","Leistungsumfang"],
  ["leistungsseiten/drohnenvermessung/text/tasks-title","droneTasksTitle","Typische Aufgaben"],

  ["leistungsseiten/drohnenvermessung/text/scope-eyebrow","droneScopeEyebrow","Vollständiger Leistungsumfang"],
  ["leistungsseiten/drohnenvermessung/text/scope-title","droneScopeTitle","Alle Leistungen im Überblick."],
  ["leistungsseiten/drohnenvermessung/text/scope-lead","droneScopeLead","Bei der Drohnenvermessung mit RTK-Drohne sind aktuell diese Leistungen genannt:"],
  ["leistungsseiten/drohnenvermessung/text/scope-note","droneScopeNote","Inhaltliche Basis: aktueller Leistungsumfang von GudeliusVermessung."],

  ["leistungsseiten/drohnenvermessung/text/detail-eyebrow","droneDetailEyebrow","Leistung im Detail"],
  ["leistungsseiten/drohnenvermessung/text/detail-title","droneDetailTitle","Luftbilder werden zu Vermessungsdaten."],
  ["leistungsseiten/drohnenvermessung/text/detail-lead","droneDetailLead","Die Drohne erfasst große Bereiche effizient und liefert Daten für digitale Auswertung und Dokumentation."],
  ["leistungsseiten/drohnenvermessung/text/detail-01-title","droneDetail1Title","Befliegung"],
  ["leistungsseiten/drohnenvermessung/text/detail-01-text","droneDetail1Text","Das Projektgebiet wird passend zur Aufgabenstellung aus der Luft aufgenommen."],
  ["leistungsseiten/drohnenvermessung/text/detail-02-title","droneDetail2Title","Auswertung"],
  ["leistungsseiten/drohnenvermessung/text/detail-02-text","droneDetail2Text","Die Bilddaten werden photogrammetrisch verarbeitet und räumlich ausgewertet."],
  ["leistungsseiten/drohnenvermessung/text/detail-03-title","droneDetail3Title","Ergebnis"],
  ["leistungsseiten/drohnenvermessung/text/detail-03-text","droneDetail3Text","Orthophotos, Flächen- oder Mengengrundlagen werden für das Projekt bereitgestellt."],

  ["leistungsseiten/drohnenvermessung/text/results-eyebrow","droneResultsEyebrow","Ergebnisse"],
  ["leistungsseiten/drohnenvermessung/text/results-title","droneResultsTitle","Vom Messwert zur nutzbaren Grundlage."],
  ["leistungsseiten/drohnenvermessung/text/results-lead","droneResultsLead","Die Luftbilddaten werden zu projektbezogenen Ergebnissen aufbereitet, die mit anderen Vermessungsdaten kombiniert werden können."],
  ["leistungsseiten/drohnenvermessung/text/result-01-title","droneResult1Title","Orthophotos"],
  ["leistungsseiten/drohnenvermessung/text/result-01-text","droneResult1Text","Entzerrte Bildgrundlagen für Übersicht und Dokumentation."],
  ["leistungsseiten/drohnenvermessung/text/result-02-title","droneResult2Title","Flächendaten"],
  ["leistungsseiten/drohnenvermessung/text/result-02-text","droneResult2Text","Erfasste Flächen als Grundlage für weitere Projektbearbeitung."],
  ["leistungsseiten/drohnenvermessung/text/result-03-title","droneResult3Title","Massenermittlung"],
  ["leistungsseiten/drohnenvermessung/text/result-03-text","droneResult3Text","Datenbasis für projektbezogene Mengen- und Volumenbetrachtungen."],
  ["leistungsseiten/drohnenvermessung/text/result-04-title","droneResult4Title","Infrastruktur & Inspektion"],
  ["leistungsseiten/drohnenvermessung/text/result-04-text","droneResult4Text","Bild- und Geodaten zur Unterstützung von Infrastrukturaufgaben."],

  ["leistungsseiten/drohnenvermessung/text/process-eyebrow","droneProcessEyebrow","Projektablauf"],
  ["leistungsseiten/drohnenvermessung/text/process-title","droneProcessTitle","Klare Schritte. Direkte Abstimmung."],
  ["leistungsseiten/drohnenvermessung/text/process-01-title","droneProcess1Title","Anforderung klären"],
  ["leistungsseiten/drohnenvermessung/text/process-01-text","droneProcess1Text","Projekt, Ort und gewünschtes Ergebnis gemeinsam festlegen."],
  ["leistungsseiten/drohnenvermessung/text/process-02-title","droneProcess2Title","Vermessung"],
  ["leistungsseiten/drohnenvermessung/text/process-02-text","droneProcess2Text","Passende Methode und Technik für die Aufgabe einsetzen."],
  ["leistungsseiten/drohnenvermessung/text/process-03-title","droneProcess3Title","Auswertung"],
  ["leistungsseiten/drohnenvermessung/text/process-03-text","droneProcess3Text","Messdaten prüfen, aufbereiten und projektbezogen auswerten."],
  ["leistungsseiten/drohnenvermessung/text/process-04-title","droneProcess4Title","Übergabe"],
  ["leistungsseiten/drohnenvermessung/text/process-04-text","droneProcess4Text","Ergebnisse nachvollziehbar und in nutzbarer Form bereitstellen."],

  ["leistungsseiten/drohnenvermessung/text/related-eyebrow","droneRelatedEyebrow","Weitere Leistungen"],
  ["leistungsseiten/drohnenvermessung/text/related-title","droneRelatedTitle","Passende Ergänzungen für Ihr Projekt."],
  ["leistungsseiten/drohnenvermessung/text/related-link-label","droneRelatedLinkLabel","Mehr erfahren →"],
  ["leistungsseiten/drohnenvermessung/text/related-01-title","droneRelated1Title","Ingenieurvermessung"],
  ["leistungsseiten/drohnenvermessung/text/related-01-text","droneRelated1Text","Absteckung, Kontrolle und Bestandsaufnahme."],
  ["leistungsseiten/drohnenvermessung/text/related-02-title","droneRelated2Title","GIS & Bauvermessung"],
  ["leistungsseiten/drohnenvermessung/text/related-02-text","droneRelated2Text","Gelände, Tiefbau und digitale Baugrundlagen."],
  ["leistungsseiten/drohnenvermessung/text/related-03-title","droneRelated3Title","3D-Laserscanning"],
  ["leistungsseiten/drohnenvermessung/text/related-03-text","droneRelated3Text","Punktwolken und digitale Modelle für komplexe Geometrien."]
];

const droneTaskDefaults = [
  "Großflächen & Massen",
  "Inspektion",
  "Orthophotos",
  "Infrastruktur-Bestand"
];

const droneScopeDefaults = [
  "Großflächige Massenermittlung",
  "Inspektion",
  "Orthophoto",
  "Bestandsaufnahmen von Infrastruktur"
];

const droneTasksInput=document.getElementById("droneTasksItems");
const droneScopeInput=document.getElementById("droneScopeItems");
const saveDronePageTexts=document.getElementById("saveDronePageTexts");
const reloadDronePageTexts=document.getElementById("reloadDronePageTexts");
const dronePageTextStatus=document.getElementById("dronePageTextStatus");

async function loadDronePageTexts(){
  if(!dronePageTextStatus) return;
  if(!getApi()) return setStatus(dronePageTextStatus,"Worker-URL fehlt.",false);

  setStatus(dronePageTextStatus,"Lade Drohnenvermessung …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};

    dronePageFields.forEach(([key,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=typeof content[key]==="string" ? content[key] : fallback;
    });

    if(droneTasksInput){
      droneTasksInput.value=engineerListValue(
        content,
        "leistungsseiten/drohnenvermessung/text/task-",
        droneTaskDefaults
      );
    }

    if(droneScopeInput){
      droneScopeInput.value=engineerListValue(
        content,
        "leistungsseiten/drohnenvermessung/text/scope-",
        droneScopeDefaults
      );
    }

    setStatus(dronePageTextStatus,"Drohnenvermessung geladen.",true);
  }catch(error){
    dronePageFields.forEach(([,id,fallback])=>{
      const field=document.getElementById(id);
      if(field) field.value=fallback;
    });
    if(droneTasksInput) droneTasksInput.value=droneTaskDefaults.join("\n");
    if(droneScopeInput) droneScopeInput.value=droneScopeDefaults.join("\n");
    setStatus(dronePageTextStatus,"Texte konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveDronePageTexts){
  saveDronePageTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()){
      return setStatus(dronePageTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    }

    const taskLines=(droneTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(droneScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    if(taskLines.length!==4){
      return setStatus(dronePageTextStatus,"Bei „Typische Aufgaben“ bitte genau 4 Zeilen verwenden.",false);
    }
    if(scopeLines.length!==4){
      return setStatus(dronePageTextStatus,"Beim vollständigen Leistungsumfang bitte genau 4 Zeilen verwenden.",false);
    }

    const entries=dronePageFields.map(([key,id])=>[
      key,
      document.getElementById(id)?.value.trim()||""
    ]);

    taskLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/drohnenvermessung/text/task-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    scopeLines.forEach((value,index)=>{
      entries.push([
        "leistungsseiten/drohnenvermessung/text/scope-"+String(index+1).padStart(2,"0"),
        value
      ]);
    });

    saveDronePageTexts.disabled=true;
    setStatus(dronePageTextStatus,"Speichere Drohnenvermessung …");
    try{
      await saveCmsEntriesInBatches(entries);
      setStatus(dronePageTextStatus,"Drohnenvermessung erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(dronePageTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveDronePageTexts.disabled=false;
    }
  });
}

if(reloadDronePageTexts){
  reloadDronePageTexts.addEventListener("click",loadDronePageTexts);
}

function setupServiceFlyover(){
  const nav=document.getElementById("serviceFlyover");
  if(!nav) return;

  const departments=[...document.querySelectorAll("[data-service-department]")];
  const menuItems=[...nav.querySelectorAll("[data-service-menu]")];
  const serviceButtons=[...nav.querySelectorAll("[data-service-target]")];
  const sectionButtons=[...nav.querySelectorAll("[data-section-target]")];

  const sectionMap={
    "Hero":"hero",
    "Überblick":"overview",
    "Vollständiger Leistungsumfang":"scope",
    "Leistung im Detail":"detail",
    "Ergebnisse":"results",
    "Projektablauf":"process",
    "Weitere Leistungen":"related"
  };

  departments.forEach(department=>{
    department.querySelectorAll(".form-editor-block").forEach(block=>{
      const title=block.querySelector(".form-editor-block-head strong")?.textContent?.trim();
      const key=sectionMap[title];
      if(key && !block.dataset.flySection) block.dataset.flySection=key;
    });
  });

  const validServices=new Set(departments.map(el=>el.dataset.serviceDepartment));
  const hashValue=decodeURIComponent(location.hash.replace(/^#/,""));
  const [hashService,hashSection]=hashValue.split(":");
  const remembered=localStorage.getItem("gudelius-admin-service");
  let activeService=validServices.has(hashService)
    ? hashService
    : validServices.has(remembered)
      ? remembered
      : "ingenieurvermessung";

  function getDepartment(service){
    return departments.find(el=>el.dataset.serviceDepartment===service)||null;
  }

  function closeFlyouts(except=null){
    menuItems.forEach(item=>{
      if(item!==except) item.classList.remove("is-open");
    });
    serviceButtons.forEach(button=>{
      button.setAttribute(
        "aria-expanded",
        button.closest("[data-service-menu]")?.classList.contains("is-open")?"true":"false"
      );
    });
  }

  function refreshFlyoutAvailability(){
    sectionButtons.forEach(button=>{
      const department=getDepartment(button.dataset.service);
      button.disabled=!department?.querySelector('[data-fly-section="'+button.dataset.sectionTarget+'"]');
    });
  }

  function showService(service,{scroll=false,section=null,updateHash=true}={}){
    if(!validServices.has(service)) return;
    activeService=service;
    localStorage.setItem("gudelius-admin-service",service);

    departments.forEach(department=>{
      const active=department.dataset.serviceDepartment===service;
      department.hidden=!active;
      department.classList.toggle("flyover-active",active);
    });

    serviceButtons.forEach(button=>{
      const active=button.dataset.serviceTarget===service;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",active?"true":"false");
    });

    const department=getDepartment(service);
    let target=department;
    if(section){
      target=department?.querySelector('[data-fly-section="'+section+'"]')||department;
    }

    if(updateHash){
      history.replaceState(null,"","#"+service+(section?":"+section:""));
    }

    closeFlyouts();

    if(scroll && target){
      requestAnimationFrame(()=>target.scrollIntoView({behavior:"smooth",block:"start"}));
    }
  }

  serviceButtons.forEach(button=>{
    button.addEventListener("click",event=>{
      const service=button.dataset.serviceTarget;
      const item=button.closest("[data-service-menu]");
      const isTouchLike=window.matchMedia("(hover: none)").matches;

      if(isTouchLike && activeService===service){
        event.preventDefault();
        const open=!item.classList.contains("is-open");
        closeFlyouts(item);
        item.classList.toggle("is-open",open);
        button.setAttribute("aria-expanded",open?"true":"false");
        return;
      }

      showService(service,{scroll:true});
    });
  });

  sectionButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      if(button.disabled) return;
      showService(button.dataset.service,{
        scroll:true,
        section:button.dataset.sectionTarget
      });
    });
  });

  menuItems.forEach(item=>{
    item.addEventListener("mouseenter",()=>{
      closeFlyouts(item);
    });
  });

  document.addEventListener("click",event=>{
    if(!nav.contains(event.target)) closeFlyouts();
  });

  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      closeFlyouts();
      document.activeElement?.blur?.();
    }
  });

  refreshFlyoutAvailability();
  showService(activeService,{updateHash:false});

  if(validServices.has(hashService) && hashSection){
    const target=getDepartment(hashService)?.querySelector('[data-fly-section="'+hashSection+'"]');
    if(target){
      requestAnimationFrame(()=>target.scrollIntoView({block:"start"}));
    }
  }
}

function setStatus(el,text,ok){
  if(!el) return;
  el.textContent=text;
  el.classList.remove("ok","bad");
  if(ok===true) el.classList.add("ok");
  if(ok===false) el.classList.add("bad");
}


const techniqueTextFields=["name","category","manufacturer","model","description","details"];

function techniqueContentKey(item,field){
  return "technik/"+item.slug+"/"+field;
}

function techniqueValue(item,field){
  const value=technikContentCache[techniqueContentKey(item,field)];
  return typeof value==="string" ? value : (item[field]||"");
}

function techniqueBySlug(slug){
  return equipment.find(item=>item.slug===slug)||equipment[0];
}

function refreshTechniqueSelectLabels(){
  if(!technikSelect) return;
  [...technikSelect.querySelectorAll("option[data-technik-slug]")].forEach(option=>{
    const item=techniqueBySlug(option.dataset.technikSlug);
    const index=equipment.indexOf(item)+1;
    const name=techniqueValue(item,"name").trim()||item.name;
    option.textContent=String(index).padStart(2,"0")+" · "+name;
  });
}

function populateTechniqueSelect(){
  if(!technikSelect) return;
  technikSelect.innerHTML="";
  const groups=[...new Set(equipment.map(item=>item.group))];
  groups.forEach(group=>{
    const optgroup=document.createElement("optgroup");
    optgroup.label=group;
    equipment.filter(item=>item.group===group).forEach(item=>{
      const option=document.createElement("option");
      option.value=item.slug;
      option.dataset.technikSlug=item.slug;
      optgroup.appendChild(option);
    });
    technikSelect.appendChild(optgroup);
  });
  refreshTechniqueSelectLabels();
}

function renderTechniqueEditor(item){
  if(!technikEditor||!technikEditorTemplate||!item) return;
  activeTechnikSlug=item.slug;
  technikEditor.innerHTML="";
  const node=technikEditorTemplate.content.cloneNode(true);
  const card=node.querySelector(".technik-editor-card");
  const img=node.querySelector("img");
  const heading=node.querySelector(".technik-editor-name");
  const categoryLabel=node.querySelector(".technik-editor-category");
  const indexLabel=node.querySelector(".technik-editor-index");
  const mediaKey=node.querySelector(".technik-media-key");
  const file=node.querySelector(".file-input");
  const upload=node.querySelector(".upload");
  const reset=node.querySelector(".reset");
  const mediaStatus=node.querySelector(".card-status");
  const save=node.querySelector(".technik-save");
  const reload=node.querySelector(".technik-reload");
  const textStatus=node.querySelector(".technik-text-status");
  const fields={};

  techniqueTextFields.forEach(field=>{
    const input=node.querySelector('[data-technique-field="'+field+'"]');
    if(input){
      input.value=techniqueValue(item,field);
      fields[field]=input;
    }
  });

  const displayName=techniqueValue(item,"name").trim()||item.name;
  const displayCategory=techniqueValue(item,"category").trim()||item.category;
  heading.textContent=displayName;
  categoryLabel.textContent=displayCategory;
  indexLabel.textContent=String(equipment.indexOf(item)+1).padStart(2,"0");
  mediaKey.textContent=item.key;
  card.dataset.technikSlug=item.slug;

  img.src=getApi()?mediaUrl(item.key):item.fallback;
  img.alt=displayName;
  img.onerror=()=>{img.onerror=null;img.src=item.fallback};

  file.addEventListener("change",()=>{
    const selected=file.files?.[0];
    if(!selected) return;
    img.src=URL.createObjectURL(selected);
    setStatus(mediaStatus,selected.name+" ausgewählt.");
  });

  upload.addEventListener("click",async()=>{
    const selected=file.files?.[0];
    if(!selected) return setStatus(mediaStatus,"Bitte zuerst ein Bild auswählen.",false);
    if(!getApi()||!getToken()) return setStatus(mediaStatus,"Worker-URL und Admin-Token fehlen.",false);
    upload.disabled=true;
    setStatus(mediaStatus,"Upload läuft …");
    try{
      const response=await fetch(getApi()+"/api/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
        method:"PUT",
        headers:{
          "authorization":"Bearer "+getToken(),
          "content-type":selected.type||"application/octet-stream",
          "x-file-name":selected.name
        },
        body:selected
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
      img.src=mediaUrl(item.key)+"?v="+Date.now();
      setStatus(mediaStatus,"Bild erfolgreich in Cloudflare gespeichert.",true);
    }catch(error){
      setStatus(mediaStatus,"Upload fehlgeschlagen: "+error.message,false);
    }finally{
      upload.disabled=false;
    }
  });

  reset.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(mediaStatus,"Worker-URL und Admin-Token fehlen.",false);
    reset.disabled=true;
    setStatus(mediaStatus,"Lösche Cloudflare-Bild …");
    try{
      const response=await fetch(getApi()+"/api/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
        method:"DELETE",
        headers:{"authorization":"Bearer "+getToken()}
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
      img.src=item.fallback;
      file.value="";
      setStatus(mediaStatus,"Cloudflare-Bild gelöscht; Fallback wird verwendet.",true);
    }catch(error){
      setStatus(mediaStatus,"Löschen fehlgeschlagen: "+error.message,false);
    }finally{
      reset.disabled=false;
    }
  });

  save.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(textStatus,"Worker-URL und Admin-Token fehlen.",false);
    save.disabled=true;
    setStatus(textStatus,"Speichere Techniktexte …");
    try{
      const values={};
      techniqueTextFields.forEach(field=>{values[field]=fields[field]?.value.trim()||""});
      await Promise.all(techniqueTextFields.map(field=>
        saveHeroText(techniqueContentKey(item,field),values[field])
      ));
      techniqueTextFields.forEach(field=>{
        technikContentCache[techniqueContentKey(item,field)]=values[field];
      });
      heading.textContent=values.name||item.name;
      categoryLabel.textContent=values.category||item.category;
      img.alt=values.name||item.name;
      refreshTechniqueSelectLabels();
      setStatus(textStatus,"Techniktexte erfolgreich in D1 gespeichert.",true);
    }catch(error){
      setStatus(textStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      save.disabled=false;
    }
  });

  reload.addEventListener("click",()=>loadTechniqueTexts());

  technikEditor.appendChild(node);
}

async function loadTechniqueTexts(){
  if(!technikEditor) return;
  const current=techniqueBySlug(activeTechnikSlug||technikSelect?.value);
  const status=technikEditor.querySelector(".technik-text-status");
  if(!getApi()){
    technikContentCache={};
    renderTechniqueEditor(current);
    const fallbackStatus=technikEditor.querySelector(".technik-text-status");
    return setStatus(fallbackStatus,"Worker-URL fehlt; Fallback-Texte werden angezeigt.",false);
  }
  setStatus(status,"Lade Techniktexte …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    technikContentCache=data.content||{};
    refreshTechniqueSelectLabels();
    renderTechniqueEditor(techniqueBySlug(activeTechnikSlug||technikSelect.value));
    setStatus(technikEditor.querySelector(".technik-text-status"),"Techniktexte geladen.",true);
  }catch(error){
    technikContentCache={};
    renderTechniqueEditor(current);
    setStatus(technikEditor.querySelector(".technik-text-status"),"CMS-Texte konnten nicht geladen werden; Fallbacks aktiv: "+error.message,false);
  }
}

function setupTechniqueEditor(){
  if(!technikSelect||!technikEditor||!technikEditorTemplate) return;
  populateTechniqueSelect();
  const hashSlug=decodeURIComponent(location.hash.replace(/^#/,""));
  const initial=equipment.some(item=>item.slug===hashSlug)?hashSlug:equipment[0].slug;
  activeTechnikSlug=initial;
  technikSelect.value=initial;
  renderTechniqueEditor(techniqueBySlug(initial));

  technikSelect.addEventListener("change",()=>{
    activeTechnikSlug=technikSelect.value;
    history.replaceState(null,"","#"+encodeURIComponent(activeTechnikSlug));
    renderTechniqueEditor(techniqueBySlug(activeTechnikSlug));
  });

  loadTechniqueTexts();
}

function renderCollection(target, items){
  if(!target) return;
  target.innerHTML="";
  for(const item of items){
    const node=template.content.cloneNode(true);
    const card=node.querySelector(".equipment-card");
    const img=node.querySelector("img");
    const title=node.querySelector("h3");
    const detail=node.querySelector(".detail");
    const file=node.querySelector(".file-input");
    const upload=node.querySelector(".upload");
    const reset=node.querySelector(".reset");
    const status=node.querySelector(".card-status");

    title.textContent=item.name;
    detail.textContent=item.detail;
    img.src=getApi()?mediaUrl(item.key):item.fallback;
    img.onerror=()=>{img.onerror=null;img.src=item.fallback};

    file.addEventListener("change",()=>{
      const selected=file.files?.[0];
      if(!selected) return;
      img.src=URL.createObjectURL(selected);
      setStatus(status,selected.name+" ausgewählt.");
    });

    upload.addEventListener("click",async()=>{
      const selected=file.files?.[0];
      if(!selected) return setStatus(status,"Bitte zuerst ein Bild auswählen.",false);
      if(!getApi()||!getToken()) return setStatus(status,"Worker-URL und Admin-Token fehlen.",false);

      upload.disabled=true;
      setStatus(status,"Upload läuft …");
      try{
        const r=await fetch(getApi()+"/api/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
          method:"PUT",
          headers:{
            "authorization":"Bearer "+getToken(),
            "content-type":selected.type||"application/octet-stream",
            "x-file-name":selected.name
          },
          body:selected
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data.error||("HTTP "+r.status));
        img.src=mediaUrl(item.key)+"?v="+Date.now();
        setStatus(status,"Bild erfolgreich in Cloudflare gespeichert.",true);
      }catch(e){
        setStatus(status,"Upload fehlgeschlagen: "+e.message,false);
      }finally{
        upload.disabled=false;
      }
    });

    reset.addEventListener("click",async()=>{
      if(!getApi()||!getToken()) return setStatus(status,"Worker-URL und Admin-Token fehlen.",false);
      reset.disabled=true;
      setStatus(status,"Lösche Cloudflare-Bild …");
      try{
        const r=await fetch(getApi()+"/api/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
          method:"DELETE",
          headers:{"authorization":"Bearer "+getToken()}
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data.error||("HTTP "+r.status));
        img.src=item.fallback;
        file.value="";
        setStatus(status,"Cloudflare-Bild gelöscht; Platzhalter wird verwendet.",true);
      }catch(e){
        setStatus(status,"Löschen fehlgeschlagen: "+e.message,false);
      }finally{
        reset.disabled=false;
      }
    });

    target.appendChild(node);
  }
}

function render(){
  renderCollection(startPageGrid, startPageImages);

  renderCollection(service1Grid, serviceImages.filter(item=>item.key==="leistungen/ingenieurvermessung"));
  renderCollection(service2Grid, serviceImages.filter(item=>item.key==="leistungen/gis-bauvermessung"));
  renderCollection(service3Grid, serviceImages.filter(item=>item.key==="leistungen/3d-laserscanning"));
  renderCollection(service4Grid, serviceImages.filter(item=>item.key==="leistungen/drohnenvermessung"));

  renderCollection(servicePage1Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/ingenieurvermessung/")));
  renderCollection(servicePage2Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/gis-bauvermessung/")));
  renderCollection(servicePage3Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/3d-laserscanning/")));
  renderCollection(servicePage4Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/drohnenvermessung/")));

  renderCollection(companyGrid, companyImages);
  renderCollection(grid, equipment);
  renderCollection(projectGrid, projects);
}

render();
setupTechniqueEditor();
setupServiceFlyover();
loadHeroTexts();
loadServiceTexts();
loadCompanyTexts();
loadProjectTitles();
loadContactTexts();
loadServiceContactTexts();
loadEngineerPageTexts();
loadGisPageTexts();
loadScanPageTexts();
loadDronePageTexts();
loadInquiries();


const adminNavLinks=[...document.querySelectorAll(".admin-nav-link")];
const activeAdminPage=document.body.dataset.adminPage||"";

adminNavLinks.forEach(link=>{
  const page=link.dataset.page||"";
  link.classList.toggle("active",page===activeAdminPage);
});
