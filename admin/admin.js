const equipment = [
  { key:"equipment/trimble-sx12", name:"Trimble SX12", detail:"Scanning-Totalstation", fallback:"../assets/equipment-trimble-sx12.svg" },
  { key:"equipment/trimble-s6", name:"Trimble S6", detail:"Robotik-Totalstation", fallback:"../assets/equipment-trimble-s6.svg" },
  { key:"equipment/trimble-r2", name:"Trimble R2 GNSS-Empfänger", detail:"GNSS-Positionierung", fallback:"../assets/equipment-trimble-r2.svg" },
  { key:"equipment/trimble-dini07", name:"Trimble DiNi 07 Ingenieurnivellier", detail:"Digitalnivellement", fallback:"../assets/equipment-trimble-dini07.svg" },
  { key:"equipment/trimble-tx8", name:"Trimble TX8 3D-Laserscanner", detail:"Terrestrisches 3D-Laserscanning", fallback:"../assets/equipment-trimble-tx8.svg" },
  { key:"equipment/rtk-drohne", name:"RTK-Drohne", detail:"Vermessung & Orthophoto", fallback:"../assets/equipment-rtk-drohne.svg" },
  { key:"equipment/infrarotkamera", name:"RTK-Drohne mit Infrarotkamera", detail:"Thermische Bildaufnahme", fallback:"../assets/equipment-infrarotkamera.svg" },
  { key:"equipment/photogrammetrie", name:"Punktwolken & Photogrammetrie", detail:"Workflow / Ergebnisdarstellung", fallback:"../assets/equipment-photogrammetrie.svg" },
  { key:"equipment/bricscad", name:"BricsCAD", detail:"CAD-Bearbeitung", fallback:"../assets/equipment-bricscad.svg" },
  { key:"equipment/bbsoft", name:"BBSOFT", detail:"Tiefbau, Vermessung & DGM", fallback:"../assets/equipment-bbsoft.svg" },
  { key:"equipment/realworks", name:"Trimble RealWorks", detail:"Punktwolken-Auswertung", fallback:"../assets/equipment-realworks.svg" },
  { key:"equipment/metashape", name:"Agisoft Metashape", detail:"Photogrammetrie", fallback:"../assets/equipment-metashape.svg" },
  { key:"equipment/mobile-arbeitsplatz", name:"Mobiler Büroarbeitsplatz", detail:"Auswertung direkt im Projektumfeld", fallback:"https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg" }
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
const serviceGrid=document.getElementById("serviceGrid");
const servicePageGrid=document.getElementById("servicePageGrid");
const template=document.getElementById("equipmentTemplate");
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
const saveServiceTexts=document.getElementById("saveServiceTexts");
const reloadServiceTexts=document.getElementById("reloadServiceTexts");
const serviceTextStatus=document.getElementById("serviceTextStatus");
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

apiUrlInput.value=(window.GUDELIUS_CMS_API||"").replace(/\/$/,"");
tokenInput.value=sessionStorage.getItem("gudelius-cms-token")||"";

function getApi(){
  let value=apiUrlInput.value.trim().replace(/\/$/,"");
  if(value && !/^https?:\/\//i.test(value)) value="https://"+value;
  return value;
}
function getToken(){return tokenInput.value.trim()}
function mediaUrl(key){return getApi()+"/media/"+key.split("/").map(encodeURIComponent).join("/")}

saveButton.addEventListener("click",()=>{
  const api=getApi();
  if(api){ apiUrlInput.value=api; localStorage.setItem("gudelius-cms-api",api); }
  else localStorage.removeItem("gudelius-cms-api");
  if(getToken()) sessionStorage.setItem("gudelius-cms-token",getToken());
  else sessionStorage.removeItem("gudelius-cms-token");
  setStatus(connectionStatus,"Verbindungsdaten gespeichert.",true);
  render();
  loadInquiries();
});

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

const heroTextDefaults={
  "startseite/hero-eyebrow":"Vermessung für anspruchsvolle Projekte",
  "startseite/hero-title":"Von der Planung bis zum Bestand.",
  "startseite/hero-lead":"Wir begleiten Bau- und Infrastrukturprojekte mit präziser Vermessung und digitalen Geodaten – zuverlässig, nachvollziehbar und mit moderner Technik."
};

function contentUrl(key){
  return getApi()+"/api/content/"+key.split("/").map(encodeURIComponent).join("/");
}

async function loadHeroTexts(){
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
  if(!getApi()) return setStatus(serviceTextStatus,"Worker-URL fehlt.",false);
  setStatus(serviceTextStatus,"Lade Leistungstexte …");
  try{
    const response=await fetch(getApi()+"/api/site");
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(serviceTextFields).forEach(([key,field])=>{
      if(field) field.value=typeof content[key]==="string" ? content[key] : serviceTextDefaults[key];
    });
    setStatus(serviceTextStatus,"Leistungstexte geladen.",true);
  }catch(error){
    Object.entries(serviceTextFields).forEach(([key,field])=>{
      if(field) field.value=serviceTextDefaults[key];
    });
    setStatus(serviceTextStatus,"Leistungstexte konnten nicht geladen werden: "+error.message,false);
  }
}

if(saveServiceTexts){
  saveServiceTexts.addEventListener("click",async()=>{
    if(!getApi()||!getToken()) return setStatus(serviceTextStatus,"Worker-URL und Admin-Token fehlen.",false);
    saveServiceTexts.disabled=true;
    setStatus(serviceTextStatus,"Speichere Leistungstexte …");
    try{
      await Promise.all(Object.entries(serviceTextFields).map(([key,field])=>
        saveHeroText(key,field.value.trim())
      ));
      setStatus(serviceTextStatus,"Leistungstexte erfolgreich gespeichert.",true);
    }catch(error){
      setStatus(serviceTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveServiceTexts.disabled=false;
    }
  });
}

if(reloadServiceTexts) reloadServiceTexts.addEventListener("click",loadServiceTexts);

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

function setStatus(el,text,ok){
  el.textContent=text;
  el.classList.remove("ok","bad");
  if(ok===true) el.classList.add("ok");
  if(ok===false) el.classList.add("bad");
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
  renderCollection(serviceGrid, serviceImages);
  renderCollection(servicePageGrid, servicePageImages);
  renderCollection(companyGrid, companyImages);
  renderCollection(grid, equipment);
  renderCollection(projectGrid, projects);
}

render();
loadHeroTexts();
loadServiceTexts();
loadCompanyTexts();
loadProjectTitles();
loadContactTexts();
loadServiceContactTexts();
loadEngineerPageTexts();
loadInquiries();


const adminNavLinks=[...document.querySelectorAll(".admin-nav-link")];
const adminSections=adminNavLinks
  .map(link=>document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveAdminNav(id){
  adminNavLinks.forEach(link=>{
    link.classList.toggle("active",link.getAttribute("href")==="#"+id);
  });
}

adminNavLinks.forEach(link=>{
  link.addEventListener("click",()=>{
    const id=link.getAttribute("href").slice(1);
    setActiveAdminNav(id);
  });
});

if("IntersectionObserver" in window){
  const adminNavObserver=new IntersectionObserver(entries=>{
    const visible=entries
      .filter(entry=>entry.isIntersecting)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible?.target?.id) setActiveAdminNav(visible.target.id);
  },{rootMargin:"-70px 0px -55% 0px",threshold:[0,.1,.25,.5]});
  adminSections.forEach(section=>adminNavObserver.observe(section));
}
