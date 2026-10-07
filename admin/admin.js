if (window.GUDELIUS_LEGACY_ADMIN_DISABLED === true && window.GUDELIUS_ADMIN_APP_URL) {
  const page = String(document.body?.dataset?.adminPage || "").trim();
  const suffix = page && page !== "dashboard" ? page + "/" : "";
  const target = new URL(suffix, window.GUDELIUS_ADMIN_APP_URL);
  if (location.href !== target.href) location.replace(target.href);
}

const {
  defaultEquipment,
  defaultProjects,
  startPageImages,
  serviceImages,
  servicePageImages,
  companyImages,
  techniqueGroupImages
}=window.GUDELIUS_ADMIN_DATA||{};

if(!Array.isArray(defaultEquipment)||!Array.isArray(defaultProjects)){
  throw new Error("admin-data.js wurde nicht geladen.");
}

let equipment=defaultEquipment.map((item,index)=>({...item,order:index+1,visible:true,archived:false}));
let projects=defaultProjects.map((item,index)=>({...item,order:index+1,visible:true,archived:false,featured:index===0}));

const apiUrlInput=document.getElementById("apiUrl");
const tokenInput=document.getElementById("adminToken");
const saveButton=document.getElementById("saveConnection");
const testButton=document.getElementById("testConnection");
const connectionStatus=document.getElementById("connectionStatus");
const grid=document.getElementById("equipmentGrid");
const projectGrid=document.getElementById("projectGrid");
const startPageGrid=document.getElementById("startPageGrid");
const startPageTileGrid=document.getElementById("startPageTileGrid");
const companyGrid=document.getElementById("companyGrid");
const techniqueGroupGrid=document.getElementById("technikGroupGrid");
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
const technikAddButton=document.getElementById("technikAddButton");
const technikCreatePanel=document.getElementById("technikCreatePanel");
const technikCreateName=document.getElementById("technikCreateName");
const technikCreateGroup=document.getElementById("technikCreateGroup");
const technikCreateSave=document.getElementById("technikCreateSave");
const technikCreateCancel=document.getElementById("technikCreateCancel");
const technikCreateStatus=document.getElementById("technikCreateStatus");




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
  "unternehmen/page-eyebrow":document.getElementById("companyPageEyebrow"),
  "unternehmen/page-title":document.getElementById("companyPageTitle"),
  "unternehmen/page-lead":document.getElementById("companyPageLead"),
  "unternehmen/eyebrow":document.getElementById("companyEyebrow"),
  "unternehmen/title":document.getElementById("companyTitle"),
  "unternehmen/name":document.getElementById("companyName"),
  "unternehmen/lead":document.getElementById("companyLead"),
};
const saveCompanyTexts=document.getElementById("saveCompanyTexts");
const reloadCompanyTexts=document.getElementById("reloadCompanyTexts");
const companyTextStatus=document.getElementById("companyTextStatus");
const companyTimelineEditor=document.getElementById("companyTimelineEditor");
const addCompanyTimeline=document.getElementById("addCompanyTimeline");
const saveCompanyTimeline=document.getElementById("saveCompanyTimeline");
const reloadCompanyTimeline=document.getElementById("reloadCompanyTimeline");
const companyTimelineStatus=document.getElementById("companyTimelineStatus");
let companyTimelineItems=[];
const projectSelect=document.getElementById("projectSelect");
const projectEditor=document.getElementById("projectEditor");
const projectEditorTemplate=document.getElementById("projectEditorTemplate");
const projectAddButton=document.getElementById("projectAddButton");
const projectCreatePanel=document.getElementById("projectCreatePanel");
const projectCreateTitle=document.getElementById("projectCreateTitle");
const projectCreateSave=document.getElementById("projectCreateSave");
const projectCreateCancel=document.getElementById("projectCreateCancel");
const projectCreateStatus=document.getElementById("projectCreateStatus");
let projectContentCache={};
let activeProjectSlug="";
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

const imprintTextFields={
  "impressum/hero-lead":document.getElementById("imprintHeroLead"),
  "impressum/provider-name":document.getElementById("imprintProviderName"),
  "impressum/provider-role":document.getElementById("imprintProviderRole"),
  "impressum/street":document.getElementById("imprintStreet"),
  "impressum/city":document.getElementById("imprintCity"),
  "impressum/phone":document.getElementById("imprintPhone"),
  "impressum/fax":document.getElementById("imprintFax"),
  "impressum/email":document.getElementById("imprintEmail"),
  "impressum/profession":document.getElementById("imprintProfession"),
  "impressum/chamber":document.getElementById("imprintChamber"),
  "impressum/country":document.getElementById("imprintCountry"),
  "impressum/regulations":document.getElementById("imprintRegulations"),
  "impressum/insurer-name":document.getElementById("imprintInsurerName"),
  "impressum/insurer-street":document.getElementById("imprintInsurerStreet"),
  "impressum/insurer-city":document.getElementById("imprintInsurerCity"),
  "impressum/insurance-area":document.getElementById("imprintInsuranceArea"),
  "impressum/dispute":document.getElementById("imprintDispute"),
  "impressum/liability-content-1":document.getElementById("imprintLiabilityContent1"),
  "impressum/liability-content-2":document.getElementById("imprintLiabilityContent2"),
  "impressum/liability-links-1":document.getElementById("imprintLiabilityLinks1"),
  "impressum/liability-links-2":document.getElementById("imprintLiabilityLinks2"),
  "impressum/copyright-1":document.getElementById("imprintCopyright1"),
  "impressum/copyright-2":document.getElementById("imprintCopyright2")
};
const saveImprintTexts=document.getElementById("saveImprintTexts");
const reloadImprintTexts=document.getElementById("reloadImprintTexts");
const imprintTextStatus=document.getElementById("imprintTextStatus");

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
const cmsAccessMode=window.GUDELIUS_CMS_USE_ACCESS===true;
if(tokenInput){
  tokenInput.value=cmsAccessMode ? "" : (sessionStorage.getItem("gudelius-cms-token")||"");
  if(cmsAccessMode){
    sessionStorage.removeItem("gudelius-cms-token");
    const tokenLabel=tokenInput.closest("label");
    if(tokenLabel){
      tokenLabel.hidden=true;
      tokenLabel.style.display="none";
    }
    if(apiUrlInput) apiUrlInput.readOnly=true;
    if(saveButton) saveButton.style.display="none";
    if(testButton) testButton.textContent="Access-Status prüfen";
  }
}

function getApi(){
  let value=(apiUrlInput?.value||window.GUDELIUS_CMS_API||localStorage.getItem("gudelius-cms-api")||"").trim().replace(/\/$/,"");
  if(value && !/^https?:\/\//i.test(value)) value="https://"+value;
  return value;
}
function getToken(){
  return (tokenInput?.value||sessionStorage.getItem("gudelius-cms-token")||"").trim();
}
function hasAdminAuth(){ return cmsAccessMode || Boolean(getToken()); }
function adminHeaders(extra={}){
  const token=getToken();
  return token ? {...extra,"authorization":"Bearer "+token} : {...extra};
}

const draftCapablePages=new Set(["startseite","leistungen","unternehmen","technik","projekte","kontakt","impressum"]);
const currentAdminPage=document.body?.dataset?.adminPage||"";

/* Zentraler, abschnittsbezogener Dirty-State. */
const adminDirtyKeys=new Set();
const adminDirtyScopes=new Map();
const adminDirtyDetails=new Map();
const adminDirtyElements=new Map();
const adminDirtyScopeIds=new WeakMap();
let adminDirtyScopeSeq=0;
function dirtyScopeFor(element){
  return element?.closest?.(".project-editor-card,.technik-editor-card,.equipment-card,.service-department,.admin-section,.cms-subpanel,.panel,main")||document.querySelector("main")||document.body;
}
function dirtyScopeId(scope){
  if(!scope)return "page";
  if(!adminDirtyScopeIds.has(scope))adminDirtyScopeIds.set(scope,"scope-"+(++adminDirtyScopeSeq));
  return adminDirtyScopeIds.get(scope);
}
function dirtyKey(element,type="fields"){return dirtyScopeId(dirtyScopeFor(element))+":"+type}
function cleanDirtyLabel(value,fallback=""){
  const text=String(value||"").replace(/\s+/g," ").trim();
  return (text||fallback).slice(0,100);
}
function dirtyScopeLabel(scope){
  const pageFallback={
    startseite:"Startseite",leistungen:"Leistungen",unternehmen:"Unternehmen",
    technik:"Technik",projekte:"Projekte",kontakt:"Kontakt",impressum:"Impressum"
  }[currentAdminPage]||"Aktueller Bereich";
  if(!scope)return pageFallback;
  const text=selector=>cleanDirtyLabel(scope.querySelector(selector)?.textContent);
  if(scope.matches?.(".project-editor-card"))return "Projekt: "+(text(".project-editor-name")||pageFallback);
  if(scope.matches?.(".technik-editor-card"))return "Technik: "+(text(".technik-editor-name")||pageFallback);
  if(scope.matches?.(".service-department"))return "Leistung: "+(text(":scope > .cms-subpanel-head h3")||text("h3")||pageFallback);
  return text(":scope > .cms-subpanel-head h3")
    ||text(":scope > .admin-section-head h2")
    ||text(":scope > .section-head h2")
    ||text(":scope > h3")
    ||text(":scope > h2")
    ||pageFallback;
}
function dirtyFieldLabel(element){
  if(!element)return "Inhalte";
  const explicit=cleanDirtyLabel(element.getAttribute?.("aria-label")||element.getAttribute?.("data-dirty-label"));
  if(explicit)return explicit;
  const id=element.id;
  if(id){
    const linked=document.querySelector('label[for="'+CSS.escape(id)+'"]');
    const linkedText=cleanDirtyLabel(linked?.textContent);
    if(linkedText)return linkedText;
  }
  const label=element.closest?.("label");
  if(label){
    const directSpan=cleanDirtyLabel(label.querySelector(":scope > span")?.textContent);
    if(directSpan)return directSpan;
    const clone=label.cloneNode(true);
    clone.querySelectorAll("input,textarea,select,button").forEach(node=>node.remove());
    const text=cleanDirtyLabel(clone.textContent);
    if(text)return text;
  }
  return cleanDirtyLabel(
    element.dataset?.projectField
    ||element.dataset?.techniqueField
    ||element.name
    ||element.id,
    "Inhalte"
  );
}
function dirtyDetailLabel(element,type){
  return type==="crop"?"Bildausschnitt":dirtyFieldLabel(element);
}
let adminChangeHighlightTimer=null;
function adminHighlightNode(element){
  if(!element)return null;
  if(element.matches?.("input,textarea,select"))return element.closest("label")||element;
  if(element.matches?.(".media-crop-x,.media-crop-y,.media-crop-zoom,.media-crop-rotation"))return element.closest("label")||element;
  return element;
}
function clearAdminChangeHighlights(){
  document.querySelectorAll(".admin-change-highlight").forEach(node=>node.classList.remove("admin-change-highlight"));
  clearTimeout(adminChangeHighlightTimer);
}
function focusAdminChangeTargets(elements){
  const targets=[...new Set([...(elements||[])].map(adminHighlightNode).filter(node=>node?.isConnected))];
  if(!targets.length)return false;
  clearAdminChangeHighlights();
  targets.forEach(node=>node.classList.add("admin-change-highlight"));
  const first=targets[0];
  first.scrollIntoView({behavior:"smooth",block:"center"});
  const focusTarget=first.matches?.("input,textarea,select,button")?first:first.querySelector?.("input,textarea,select,button,[tabindex]");
  setTimeout(()=>focusTarget?.focus?.({preventScroll:true}),350);
  adminChangeHighlightTimer=setTimeout(clearAdminChangeHighlights,8000);
  return true;
}
function renderAdminDirtyTooltip(indicator){
  const tooltip=indicator?.querySelector(".admin-global-dirty-tooltip");
  if(!tooltip)return;
  tooltip.innerHTML="";
  const title=document.createElement("strong");
  title.className="admin-global-dirty-tooltip-title";
  title.textContent="Offene Änderungen · anklicken zum Anzeigen";
  tooltip.appendChild(title);

  const grouped=new Map();
  for(const key of adminDirtyKeys){
    const scope=adminDirtyScopes.get(key);
    const scopeId=dirtyScopeId(scope);
    if(!grouped.has(scopeId))grouped.set(scopeId,{label:dirtyScopeLabel(scope),details:new Set(),elements:new Set(),scope});
    const group=grouped.get(scopeId);
    const details=adminDirtyDetails.get(key);
    if(details?.size)for(const detail of details)group.details.add(detail);
    else group.details.add(key.endsWith(":crop")?"Bildausschnitt":"Inhalte");
    const elements=adminDirtyElements.get(key);
    if(elements?.size)for(const element of elements)group.elements.add(element);
  }

  for(const group of grouped.values()){
    const row=document.createElement("button");
    row.type="button";
    row.className="admin-global-dirty-tooltip-row";
    row.title="Zu dieser Änderung springen";
    const section=document.createElement("b");
    section.textContent=group.label;
    const details=document.createElement("span");
    details.textContent=[...group.details].join(", ");
    const jump=document.createElement("small");
    jump.textContent="Anzeigen →";
    row.append(section,details,jump);
    row.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      focusAdminChangeTargets(group.elements.size?group.elements:[group.scope]);
    });
    tooltip.appendChild(row);
  }

  const summary=[...grouped.values()].map(group=>group.label+": "+[...group.details].join(", ")).join("; ");
  indicator.setAttribute("aria-label","Ungespeichert. "+summary+". Einträge können angeklickt werden.");
}
function updateAdminDirtyUi(){
  const indicator=document.querySelector(".admin-global-dirty");
  const dirty=adminDirtyKeys.size>0;
  document.body.classList.toggle("has-unsaved-admin-changes",dirty);
  if(indicator){
    indicator.hidden=!dirty;
    indicator.querySelector("b").textContent=String(adminDirtyKeys.size);
    renderAdminDirtyTooltip(indicator);
  }
  updateAdminSaveDock();
}
function markAdminDirty(element,type="fields"){
  if(!draftCapablePages.has(currentAdminPage))return;
  const key=dirtyKey(element,type);
  adminDirtyKeys.add(key);
  adminDirtyScopes.set(key,dirtyScopeFor(element));
  if(!adminDirtyDetails.has(key))adminDirtyDetails.set(key,new Set());
  adminDirtyDetails.get(key).add(dirtyDetailLabel(element,type));
  if(!adminDirtyElements.has(key))adminDirtyElements.set(key,new Set());
  adminDirtyElements.get(key).add(element);
  updateAdminDirtyUi();
}
function clearAdminDirty(element,type="fields"){
  const key=dirtyKey(element,type);
  adminDirtyKeys.delete(key);
  adminDirtyScopes.delete(key);
  adminDirtyDetails.delete(key);
  adminDirtyElements.delete(key);
  updateAdminDirtyUi();
}
function clearAdminDirtyForElements(elements,type="fields"){
  let changed=false;
  for(const element of elements||[]){
    if(!element)continue;
    const key=dirtyKey(element,type);
    if(adminDirtyKeys.delete(key))changed=true;
    adminDirtyScopes.delete(key);
    adminDirtyDetails.delete(key);
    adminDirtyElements.delete(key);
  }
  if(changed)updateAdminDirtyUi();
}
function clearAllAdminDirty(){adminDirtyKeys.clear();adminDirtyScopes.clear();adminDirtyDetails.clear();adminDirtyElements.clear();updateAdminDirtyUi()}
function hasAdminDirty(){return adminDirtyKeys.size>0}
let adminSaveDockBusy=false;
function adminElementInMap(element,map){
  return Object.values(map||{}).some(field=>field===element);
}
function adminSaveButtonForElement(element){
  if(!element)return null;
  const projectCard=element.closest?.(".project-editor-card");
  if(projectCard)return projectCard.querySelector(".project-save");
  const technikCard=element.closest?.(".technik-editor-card");
  if(technikCard)return technikCard.querySelector(".technik-save");
  if(companyTimelineEditor&&(element===companyTimelineEditor||companyTimelineEditor.contains(element)))return saveCompanyTimeline;
  if([heroEyebrow,heroTitle,heroLead].includes(element))return saveHeroTexts;
  if(adminElementInMap(element,companyTextFields))return saveCompanyTexts;
  if(adminElementInMap(element,contactTextFields))return saveContactTexts;
  if(adminElementInMap(element,serviceContactTextFields))return saveServiceContactTexts;
  if(adminElementInMap(element,imprintTextFields))return saveImprintTexts;
  for(const control of serviceTextControls||[]){
    if(control.keys.some(key=>serviceTextFields[key]===element))return control.save;
  }
  const id=element.id||"";
  if(/^eng/.test(id))return saveEngineerPageTexts;
  if(/^gis/.test(id))return saveGisPageTexts;
  if(/^scan/.test(id))return saveScanPageTexts;
  if(/^drone/.test(id))return saveDronePageTexts;
  const scope=dirtyScopeFor(element);
  const local=[...(scope?.querySelectorAll?.(draftFieldSaveSelector)||[])].filter(button=>!button.hidden);
  if(local.length===1)return local[0];
  const section=scope?.closest?.(".admin-section");
  const sectionButtons=[...(section?.querySelectorAll?.(draftFieldSaveSelector)||[])].filter(button=>!button.hidden);
  return sectionButtons.length===1?sectionButtons[0]:null;
}
async function waitForAdminSaveButton(button,timeout=15000){
  if(!button)return;
  const started=Date.now();
  let sawDisabled=button.disabled;
  await new Promise(resolve=>setTimeout(resolve,0));
  while(Date.now()-started<timeout){
    if(button.disabled)sawDisabled=true;
    if(sawDisabled&&!button.disabled)return;
    if(!sawDisabled&&Date.now()-started>500)return;
    await new Promise(resolve=>setTimeout(resolve,60));
  }
  throw new Error("Speichern hat zu lange gedauert.");
}
function updateAdminSaveDock(){
  const dock=document.querySelector(".admin-save-dock");
  if(!dock)return;
  const button=dock.querySelector("[data-admin-save-all]");
  const status=dock.querySelector("[data-admin-save-status]");
  const count=adminDirtyKeys.size;
  dock.classList.toggle("has-changes",count>0);
  if(button){
    button.disabled=adminSaveDockBusy||count===0;
    button.textContent=adminSaveDockBusy?"Speichert …":(cmsDraftMode?"Als Entwurf speichern":"Änderungen speichern");
  }
  if(status&&!adminSaveDockBusy){
    status.textContent=count?count+" offener "+(count===1?"Bereich":"Bereiche"):"Alles gespeichert";
  }
}
async function saveAllAdminDirtyChanges(){
  if(adminSaveDockBusy||!hasAdminDirty())return;
  const dock=document.querySelector(".admin-save-dock");
  const status=dock?.querySelector("[data-admin-save-status]");
  adminSaveDockBusy=true;
  updateAdminSaveDock();
  if(status)status.textContent="Änderungen werden gespeichert …";
  try{
    const buttonEntries=new Map();
    for(const key of [...adminDirtyKeys].filter(key=>key.endsWith(":fields"))){
      const elements=[...(adminDirtyElements.get(key)||[])].filter(element=>element?.isConnected);
      let button=null;
      for(const element of elements){
        button=adminSaveButtonForElement(element);
        if(button)break;
      }
      if(!button)button=visibleEnabledSaveButton(adminDirtyScopes.get(key));
      if(!button)continue;
      if(!buttonEntries.has(button))buttonEntries.set(button,new Set());
      buttonEntries.get(button).add(key);
    }
    for(const button of buttonEntries.keys()){
      if(button.disabled)await waitForAdminSaveButton(button);
      button.click();
      await waitForAdminSaveButton(button);
    }
    await saveAllPendingMediaCrops();
    if(cmsDraftMode)await refreshDraftToolbar(document.querySelector(".cms-draft-toolbar"));
    await new Promise(resolve=>setTimeout(resolve,120));
    if(status)status.textContent=hasAdminDirty()?adminDirtyKeys.size+" Änderung(en) noch offen":"Alles gespeichert";
  }catch(error){
    if(status)status.textContent="Speichern fehlgeschlagen: "+error.message;
    dock?.classList.add("is-error");
    setTimeout(()=>dock?.classList.remove("is-error"),3500);
  }finally{
    adminSaveDockBusy=false;
    updateAdminSaveDock();
  }
}
function ensureAdminSaveDock(){
  if(!draftCapablePages.has(currentAdminPage)||document.querySelector(".admin-save-dock"))return;
  const dock=document.createElement("aside");
  dock.className="admin-save-dock";
  dock.setAttribute("aria-label","Speicherstatus");
  dock.innerHTML='<div class="admin-save-dock-state"><i aria-hidden="true"></i><span data-admin-save-status>Alles gespeichert</span></div><button type="button" data-admin-save-all disabled>Änderungen speichern</button>';
  dock.querySelector("[data-admin-save-all]").addEventListener("click",saveAllAdminDirtyChanges);
  document.body.appendChild(dock);
  document.body.classList.add("has-admin-save-dock");
  updateAdminSaveDock();
}
function ensureAdminDirtyUi(){
  if(!draftCapablePages.has(currentAdminPage))return;
  const actions=document.querySelector(".admin-header-actions")||document.querySelector(".admin-header");
  if(!actions||actions.querySelector(".admin-global-dirty"))return;
  const indicator=document.createElement("span");
  indicator.className="admin-global-dirty";
  indicator.hidden=true;
  indicator.tabIndex=0;
  indicator.innerHTML='<i aria-hidden="true"></i><span>Ungespeichert</span><b>0</b><span class="admin-global-dirty-tooltip" role="tooltip"></span>';
  indicator.setAttribute("role","status");
  indicator.setAttribute("aria-live","polite");
  actions.prepend(indicator);
}
function shouldTrackAdminField(target){
  if(!draftCapablePages.has(currentAdminPage)||!target?.matches?.("input,textarea,select"))return false;
  if(target.closest(".cms-draft-toolbar"))return false;
  if(target.matches('input[type="search"],input[type="hidden"],input[type="file"]'))return false;
  if(target.closest(".media-crop-editor"))return false;
  return Boolean(target.closest("main"));
}
document.addEventListener("input",event=>{if(shouldTrackAdminField(event.target))markAdminDirty(event.target,"fields")},true);
document.addEventListener("change",event=>{if(shouldTrackAdminField(event.target))markAdminDirty(event.target,"fields")},true);
document.addEventListener("cms-crop-dirty-change",event=>{
  if(event.detail?.dirty)markAdminDirty(event.target,"crop");
  else clearAdminDirty(event.target,"crop");
});
window.addEventListener("beforeunload",event=>{
  if(!hasAdminDirty())return;
  event.preventDefault();
  event.returnValue="";
});
document.addEventListener("click",event=>{
  if(!hasAdminDirty())return;
  const link=event.target.closest?.("a[href]");
  if(!link||link.target==="_blank"||link.hasAttribute("download"))return;
  const href=link.getAttribute("href")||"";
  if(!href||href.startsWith("#")||href.startsWith("javascript:"))return;
  if(!confirm("Es gibt noch nicht gespeicherte Änderungen. Seite wirklich verlassen und Änderungen verwerfen?")){
    event.preventDefault();event.stopImmediatePropagation();
  }else clearAllAdminDirty();
},true);
["projectSelect","technikSelect"].forEach(id=>{
  const select=document.getElementById(id);
  if(!select)return;
  let previous=select.value;
  select.addEventListener("focus",()=>{previous=select.value});
  select.addEventListener("pointerdown",()=>{previous=select.value});
  select.addEventListener("change",event=>{
    if(!hasAdminDirty()){previous=select.value;return}
    if(!confirm("Es gibt noch nicht gespeicherte Änderungen. Datensatz wechseln und Änderungen verwerfen?")){
      event.preventDefault();event.stopImmediatePropagation();select.value=previous;
    }else{clearAllAdminDirty();previous=select.value}
  },true);
});
ensureAdminDirtyUi();

let cmsDraftMode=sessionStorage.getItem("gudelius-cms-draft-mode")==="1"&&draftCapablePages.has(currentAdminPage);
ensureAdminSaveDock();
function draftContentUrl(key){return getApi()+"/api/admin/drafts/"+key.split("/").map(encodeURIComponent).join("/")}
let draftToolbarRefreshTimer=null;
const knownDraftKeys=new Set();
const knownDraftRecords=new Map();
function draftPrettyPart(value){
  const dictionary={
    index:"Liste & Reihenfolge",title:"Titel",description:"Beschreibung",location:"Ort",year:"Jahr",services:"Leistungen",
    "image-title":"Bildtitel","image-description":"Bildbeschreibung",name:"Name",category:"Kategorie",manufacturer:"Hersteller",
    model:"Modell",details:"Details",group:"Gruppe",visible:"Sichtbarkeit",featured:"Hervorgehoben",
    x:"Position X",y:"Position Y",zoom:"Zoom",rotation:"Drehung"
  };
  const raw=String(value||"").trim();
  if(dictionary[raw])return dictionary[raw];
  return raw.replace(/[-_]+/g," ").replace(/\b\w/g,char=>char.toUpperCase())||"Inhalt";
}
function draftKeyLabel(key){
  const parts=String(key||"").split("/").filter(Boolean);
  const isLayout=parts[0]==="media-layout";
  const contentParts=isLayout?parts.slice(1):parts;
  const area=contentParts[0]||"cms";
  const areaLabels={startseite:"Startseite",leistungen:"Leistungen",unternehmen:"Unternehmen",technik:"Technik",projekte:"Projekte",kontakt:"Kontakt",impressum:"Impressum"};
  const areaLabel=areaLabels[area]||draftPrettyPart(area);
  if(isLayout){
    if(area==="projects"||area==="projekte")return "Projektbild: "+draftPrettyPart(contentParts[1]||"");
    if(area==="equipment"||area==="technik")return "Technikbild: "+draftPrettyPart(contentParts[1]||"");
    return areaLabel+" · Bildausschnitt";
  }
  if(area==="projekte"&&contentParts.length>=3)return "Projekt: "+draftPrettyPart(contentParts[1])+" · "+draftPrettyPart(contentParts.slice(2).join("-"));
  if(area==="technik"&&contentParts.length>=3)return "Technik: "+draftPrettyPart(contentParts[1])+" · "+draftPrettyPart(contentParts.slice(2).join("-"));
  if(contentParts.length===2)return areaLabel+" · "+draftPrettyPart(contentParts[1]);
  if(contentParts.length>2)return areaLabel+" · "+draftPrettyPart(contentParts.slice(1).join("-"));
  return areaLabel;
}
function draftValuePreview(value){
  if(value===undefined)return "—";
  if(value===null)return "leer";
  if(typeof value==="boolean")return value?"Ja":"Nein";
  if(typeof value==="number")return String(value);
  if(typeof value==="string"){
    const clean=value.replace(/\s+/g," ").trim();
    if(!clean)return "leer";
    return clean.length>52?clean.slice(0,49)+"…":clean;
  }
  if(Array.isArray(value))return value.length+" Einträge";
  return "Struktur";
}
function draftChangeSummary(draft){
  if(!draft)return "Gespeicherter Entwurf";
  const live=draft.live_value,next=draft.draft_value;
  if(!draft.has_live_value)return "Neu: "+draftValuePreview(next);
  if(live&&next&&typeof live==="object"&&typeof next==="object"&&!Array.isArray(live)&&!Array.isArray(next)){
    const keys=[...new Set([...Object.keys(live),...Object.keys(next)])];
    const changed=keys.filter(key=>JSON.stringify(live[key])!==JSON.stringify(next[key]));
    if(!changed.length)return "Keine inhaltliche Differenz";
    return changed.slice(0,4).map(key=>draftPrettyPart(key)+": "+draftValuePreview(live[key])+" → "+draftValuePreview(next[key])).join(" · ")+(changed.length>4?" · …":"");
  }
  if(Array.isArray(live)&&Array.isArray(next)){
    if(JSON.stringify(live)===JSON.stringify(next))return "Keine inhaltliche Differenz";
    if(live.length!==next.length)return "Liste: "+live.length+" → "+next.length+" Einträge";
    return "Liste / Reihenfolge / Eigenschaften geändert";
  }
  if(JSON.stringify(live)===JSON.stringify(next))return "Keine inhaltliche Differenz";
  return draftValuePreview(live)+" → "+draftValuePreview(next);
}
function draftAdminPageForKey(key){
  const raw=String(key||"").replace(/^media-layout\//,"");
  if(raw.startsWith("projects/")||raw.startsWith("projekte/"))return "projekte";
  if(raw.startsWith("equipment/")||raw.startsWith("technik/"))return "technik";
  if(raw.startsWith("leistungsseiten/"))return "leistungen";
  if(raw.startsWith("leistungen/"))return "startseite";
  if(raw.startsWith("unternehmen/"))return "unternehmen";
  if(raw.startsWith("kontakt/"))return "kontakt";
  if(raw.startsWith("impressum/"))return "impressum";
  if(raw.startsWith("startseite/"))return "startseite";
  return "";
}
function staticDraftTarget(key){
  const maps=[serviceTextFields,companyTextFields,contactTextFields,imprintTextFields,serviceContactTextFields];
  for(const map of maps){
    const target=map?.[key];
    if(target)return target;
  }
  const heroMap={
    "startseite/hero-eyebrow":heroEyebrow,
    "startseite/hero-title":heroTitle,
    "startseite/hero-lead":heroLead
  };
  if(heroMap[key])return heroMap[key];
  if(key==="unternehmen/timeline")return companyTimelineEditor;
  const groups=[];
  try{groups.push(engineerPageFields,gisPageFields,scanPageFields,dronePageFields)}catch{}
  for(const fields of groups){
    for(const entry of fields||[]){
      if(entry?.[0]===key)return document.getElementById(entry[1]);
    }
  }
  return null;
}
function confirmDraftRecordSwitch(kind,name){
  if(!hasAdminDirty())return true;
  return confirm("Es gibt noch nicht gespeicherte Änderungen. Zu "+kind+" „"+name+"“ springen und diese Änderungen verwerfen?");
}
function ensureProjectDraftRecord(slug){
  if(currentAdminPage!=="projekte")return false;
  const item=projectBySlug(slug);
  if(!item)return false;
  if(activeProjectSlug!==slug){
    if(!confirmDraftRecordSwitch("Projekt",item.title||item.name||slug))return false;
    clearAllAdminDirty();
    activeProjectSlug=slug;
    if(projectSelect)projectSelect.value=slug;
    renderProjectEditor(item);
  }
  return true;
}
function ensureTechniqueDraftRecord(slug){
  if(currentAdminPage!=="technik")return false;
  const item=techniqueBySlug(slug);
  if(!item)return false;
  if(activeTechnikSlug!==slug){
    if(!confirmDraftRecordSwitch("Technik",techniqueValue(item,"name")||item.name||slug))return false;
    clearAllAdminDirty();
    activeTechnikSlug=slug;
    if(technikSelect)technikSelect.value=slug;
    renderTechniqueEditor(item);
  }
  return true;
}
function cropDraftTargets(mediaKey,draft){
  if(mediaKey.startsWith("projects/"))ensureProjectDraftRecord(mediaKey.split("/")[1]||"");
  if(mediaKey.startsWith("equipment/"))ensureTechniqueDraftRecord(mediaKey.split("/")[1]||"");
  const card=document.querySelector('[data-media-key="'+CSS.escape(mediaKey)+'"]');
  const editor=card?.querySelector(".media-crop-editor")||card;
  if(!editor)return [];
  const live=draft?.live_value,next=draft?.draft_value;
  if(live&&next&&typeof live==="object"&&typeof next==="object"){
    const classMap={x:".media-crop-x",y:".media-crop-y",zoom:".media-crop-zoom",rotation:".media-crop-rotation"};
    const changed=Object.keys(classMap).filter(name=>JSON.stringify(live[name])!==JSON.stringify(next[name]));
    const fields=changed.map(name=>editor.querySelector(classMap[name])).filter(Boolean);
    if(fields.length)return fields;
  }
  return [editor];
}
function draftTargetElements(key,draft){
  const raw=String(key||"");
  if(raw.startsWith("media-layout/"))return cropDraftTargets(raw.slice("media-layout/".length),draft);
  if(raw==="projekte/index")return [projectSelect||projectEditor].filter(Boolean);
  if(raw==="technik/index")return [technikSelect||technikEditor].filter(Boolean);

  if(raw.startsWith("projekte/")){
    const parts=raw.split("/"),slug=parts[1],field=parts.slice(2).join("/");
    if(!ensureProjectDraftRecord(slug))return [];
    const card=document.querySelector('.project-editor-card[data-project-slug="'+CSS.escape(slug)+'"]')||document.querySelector(".project-editor-card");
    if(!card)return [];
    const fieldMap={"image-title":"imageTitle","image-description":"imageDescription"};
    if(field==="services")return [card.querySelector(".project-services")].filter(Boolean);
    const target=card.querySelector('[data-project-field="'+CSS.escape(fieldMap[field]||field)+'"]');
    return [target||card].filter(Boolean);
  }

  if(raw.startsWith("technik/")&&raw!=="technik/index"){
    const parts=raw.split("/"),slug=parts[1],field=parts.slice(2).join("/");
    if(parts[1]==="gruppen"){
      const card=document.querySelector('[data-media-key="'+CSS.escape(raw)+'"]');
      return [card||document.querySelector("#technikGroupGrid")].filter(Boolean);
    }
    if(!ensureTechniqueDraftRecord(slug))return [];
    const card=document.querySelector('.technik-editor-card[data-technik-slug="'+CSS.escape(slug)+'"]')||document.querySelector(".technik-editor-card");
    if(!card)return [];
    if(field==="group")return [card.querySelector('[data-technique-meta="group"]')||card].filter(Boolean);
    const target=card.querySelector('[data-technique-field="'+CSS.escape(field)+'"]');
    return [target||card].filter(Boolean);
  }

  const direct=staticDraftTarget(raw);
  if(direct)return [direct];

  const mediaCard=document.querySelector('[data-media-key="'+CSS.escape(raw.replace(/^media-layout\//,""))+'"]');
  return [mediaCard].filter(Boolean);
}
function jumpToDraftKey(key,draft){
  const targetPage=draftAdminPageForKey(key);
  if(targetPage&&targetPage!==currentAdminPage){
    sessionStorage.setItem("gudelius-admin-pending-draft-jump",key);
    const clearTimer=setTimeout(()=>sessionStorage.removeItem("gudelius-admin-pending-draft-jump"),2500);
    location.href=adminAreaUrl(targetPage);
    window.addEventListener("pagehide",()=>clearTimeout(clearTimer),{once:true});
    return;
  }
  const targets=draftTargetElements(key,draft);
  if(!focusAdminChangeTargets(targets)){
    const fallback=document.querySelector("main");
    if(fallback)focusAdminChangeTargets([fallback]);
  }
}
function consumePendingDraftJump(attempt=0){
  const key=sessionStorage.getItem("gudelius-admin-pending-draft-jump");
  if(!key)return;
  const targetPage=draftAdminPageForKey(key);
  if(targetPage&&targetPage!==currentAdminPage)return;
  if(key.startsWith("media-layout/")&&!knownDraftRecords.has(key)&&attempt<24){
    setTimeout(()=>consumePendingDraftJump(attempt+1),250);
    return;
  }
  const draft=knownDraftRecords.get(key);
  const targets=draftTargetElements(key,draft);
  if(targets.length){
    sessionStorage.removeItem("gudelius-admin-pending-draft-jump");
    focusAdminChangeTargets(targets);
    return;
  }
  if(attempt<24)setTimeout(()=>consumePendingDraftJump(attempt+1),250);
}

function renderDraftToolbarDetails(toolbar=document.querySelector(".cms-draft-toolbar")){
  const badge=toolbar?.querySelector(".cms-draft-count");
  const tooltip=badge?.querySelector(".cms-draft-tooltip");
  if(!badge||!tooltip)return;
  tooltip.innerHTML="";
  const title=document.createElement("strong");
  title.className="cms-draft-tooltip-title";
  title.textContent="Änderungen in Entwürfen · anklicken zum Anzeigen";
  tooltip.appendChild(title);
  if(!knownDraftKeys.size){
    const empty=document.createElement("span");
    empty.className="cms-draft-tooltip-empty";
    empty.textContent="Keine offenen Entwürfe.";
    tooltip.appendChild(empty);
    return;
  }
  for(const key of knownDraftKeys){
    const draft=knownDraftRecords.get(key);
    const row=document.createElement("button");
    row.type="button";
    row.className="cms-draft-tooltip-row";
    row.title="Zu dieser Entwurfsänderung springen";
    const label=document.createElement("b");
    label.textContent=draftKeyLabel(key);
    const summary=document.createElement("span");
    summary.textContent=draftChangeSummary(draft);
    const jump=document.createElement("small");
    jump.textContent="Anzeigen →";
    row.append(label,summary,jump);
    row.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      jumpToDraftKey(key,draft);
    });
    tooltip.appendChild(row);
  }
}
function renderDraftToolbarCount(toolbar=document.querySelector(".cms-draft-toolbar"),serverCount=null){
  if(!toolbar)return;
  const count=toolbar.querySelector("[data-draft-count]");
  if(!count)return;
  const numeric=Number.isFinite(Number(serverCount))?Number(serverCount):knownDraftKeys.size;
  count.textContent=String(Math.max(0,numeric));
  const badge=count.closest(".cms-draft-count");
  badge?.setAttribute("aria-label",numeric+" gespeicherte Entwürfe. Hover oder Fokus zeigt die Änderungen.");
  renderDraftToolbarDetails(toolbar);
}
function registerDraftKey(key,authoritativeCount=null){
  if(!cmsDraftMode||!key)return;
  knownDraftKeys.add(key);
  if(Number.isFinite(Number(authoritativeCount)))renderDraftToolbarCount(undefined,Number(authoritativeCount));
  else renderDraftToolbarCount();
}
function unregisterDraftKeys(keys){
  for(const key of keys||[]){
    knownDraftKeys.delete(key);
    knownDraftRecords.delete(key);
  }
  renderDraftToolbarCount();
}
function scheduleDraftToolbarRefresh(){
  if(!cmsDraftMode)return;
  renderDraftToolbarCount();
  clearTimeout(draftToolbarRefreshTimer);
  draftToolbarRefreshTimer=setTimeout(()=>{
    refreshDraftToolbar(document.querySelector(".cms-draft-toolbar"));
  },120);
}
const draftFieldSaveSelector=[
  "#saveHeroTexts","#saveService1Texts","#saveService2Texts","#saveService3Texts","#saveService4Texts",
  "#saveEngineerPageTexts","#saveGisPageTexts","#saveScanPageTexts","#saveDronePageTexts",
  "#saveCompanyTexts","#saveCompanyTimeline","#saveContactTexts","#saveServiceContactTexts","#saveImprintTexts",
  ".project-save",".technik-save"
].join(",");
function visibleEnabledSaveButton(scope){
  return [...(scope?.querySelectorAll?.(draftFieldSaveSelector)||[])].find(button=>{
    if(button.disabled||button.hidden)return false;
    const style=getComputedStyle(button);
    return style.display!=="none"&&style.visibility!=="hidden";
  })||null;
}
async function waitForDirtyKeyToClear(key,timeout=12000){
  const started=Date.now();
  while(adminDirtyKeys.has(key)){
    if(Date.now()-started>timeout)throw new Error("Änderung konnte nicht automatisch als Entwurf gespeichert werden.");
    await new Promise(resolve=>setTimeout(resolve,80));
  }
}
async function savePendingDraftFieldChanges(){
  if(!cmsDraftMode)return 0;
  const entries=[...adminDirtyKeys]
    .filter(key=>key.endsWith(":fields"))
    .map(key=>({key,scope:adminDirtyScopes.get(key)}))
    .filter(entry=>entry.scope?.isConnected);
  const handled=new Set();
  let saved=0;
  for(const entry of entries){
    if(!adminDirtyKeys.has(entry.key)||handled.has(entry.scope))continue;
    const button=visibleEnabledSaveButton(entry.scope);
    if(!button)continue;
    handled.add(entry.scope);
    button.click();
    await waitForDirtyKeyToClear(entry.key);
    saved++;
  }
  return saved;
}
async function fetchSiteSnapshot(){
  const endpoint=cmsDraftMode?"/api/admin/preview-site":"/api/site";
  return fetch(getApi()+endpoint,{headers:cmsDraftMode?adminHeaders():{},credentials:cmsDraftMode?"include":"same-origin",cache:"no-store"});
}
function previewPathForAdminPage(){
  return {
    startseite:"index.html",
    leistungen:"leistungen/ingenieurvermessung/",
    unternehmen:"unternehmen/",
    technik:"technik/",
    projekte:"projekte/",
    kontakt:"kontakt/",
    impressum:"impressum/"
  }[currentAdminPage]||"index.html";
}
async function refreshDraftToolbar(toolbar){
  if(!toolbar||!getApi())return;
  const count=toolbar.querySelector("[data-draft-count]");
  try{
    const r=await fetch(getApi()+"/api/admin/drafts",{headers:adminHeaders(),credentials:"include",cache:"no-store"});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
    const drafts=Array.isArray(data.drafts)?data.drafts:[];
    if(drafts.length){
      knownDraftKeys.clear();
      knownDraftRecords.clear();
      for(const draft of drafts){
        if(!draft?.key)continue;
        knownDraftKeys.add(draft.key);
        knownDraftRecords.set(draft.key,draft);
      }
    }else if(Number(data.count)===0){
      knownDraftKeys.clear();
      knownDraftRecords.clear();
    }
    const serverCount=Array.isArray(data.drafts)?drafts.length:Number(data.count||0);
    renderDraftToolbarCount(toolbar,Math.max(serverCount,knownDraftKeys.size));
  }catch{
    if(count&&knownDraftKeys.size===0)count.textContent="?";
    else renderDraftToolbarCount(toolbar);
  }
}
function ensureDraftToolbar(){
  if(!draftCapablePages.has(currentAdminPage)||!cmsAccessMode)return;
  const main=document.querySelector("main");
  if(!main||main.querySelector(".cms-draft-toolbar"))return;
  const toolbar=document.createElement("section");
  toolbar.className="cms-draft-toolbar";
  toolbar.innerHTML='<div><strong>Entwurf & Vorschau</strong><span>Texte, Strukturen sowie Bildausschnitt, Zoom und Drehung werden im Entwurfsmodus erst als Entwurf gespeichert. Bilddatei-Uploads bleiben direkte Medienänderungen.</span></div>'+
    '<label class="cms-draft-switch"><input type="checkbox" data-draft-toggle> Entwurfsmodus</label>'+
    '<span class="cms-draft-count" role="status" aria-live="polite" tabindex="0"><b data-draft-count>…</b> Entwürfe<span class="cms-draft-tooltip" role="tooltip"></span></span>'+
    '<button type="button" class="secondary" data-draft-preview>Vorschau öffnen ↗</button>'+
    '<button type="button" data-draft-publish>Alle veröffentlichen</button>'+
    '<button type="button" class="secondary" data-draft-discard>Alle verwerfen</button>';
  main.prepend(toolbar);
  const toggle=toolbar.querySelector("[data-draft-toggle]");
  toggle.checked=cmsDraftMode;
  toggle.addEventListener("change",()=>{sessionStorage.setItem("gudelius-cms-draft-mode",toggle.checked?"1":"0");location.reload()});
  toolbar.querySelector("[data-draft-preview]").addEventListener("click",async event=>{
    const button=event.currentTarget;
    button.disabled=true;
    const originalLabel=button.textContent;
    try{
      if(cmsDraftMode){
        button.textContent="Speichere Änderungen …";
        const savedFields=await savePendingDraftFieldChanges();
        const savedCrops=await saveAllPendingMediaCrops();
        await refreshDraftToolbar(toolbar);
        const savedTotal=savedFields+savedCrops;
        if(savedTotal>0)button.textContent=savedTotal+" Änderung"+(savedTotal===1?"":"en")+" als Entwurf gespeichert …";
      }else if(hasPendingMediaCrops()){
        alert("Der Bildausschnitt ist noch nicht gespeichert. Aktiviere den Entwurfsmodus oder speichere den Ausschnitt zuerst, damit er in der Vorschau erscheint.");
        return;
      }
      const previewUrl=getApi()+"/admin/preview/"+previewPathForAdminPage()+"?v="+Date.now();
      window.open(previewUrl,"_blank","noopener");
    }catch(error){
      alert("Vorschau konnte nicht vorbereitet werden: "+error.message);
    }finally{
      button.disabled=false;
      button.textContent=originalLabel;
    }
  });
  toolbar.querySelector("[data-draft-publish]").addEventListener("click",async event=>{
    if(!confirm("Alle gespeicherten Entwürfe jetzt veröffentlichen?"))return;
    const button=event.currentTarget;button.disabled=true;
    try{
      const r=await fetch(getApi()+"/api/admin/drafts/publish",{method:"POST",headers:adminHeaders({"content-type":"application/json"}),credentials:"include",body:"{}"});
      const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
      alert((data.count||0)+" Entwürfe veröffentlicht.");
      await refreshDraftToolbar(toolbar);
      if(cmsDraftMode)location.reload();
    }catch(error){alert("Veröffentlichen fehlgeschlagen: "+error.message)}finally{button.disabled=false}
  });
  toolbar.querySelector("[data-draft-discard]").addEventListener("click",async event=>{
    if(!confirm("Alle Entwürfe verwerfen? Veröffentlichte Inhalte bleiben unverändert."))return;
    const button=event.currentTarget;button.disabled=true;
    try{
      const r=await fetch(getApi()+"/api/admin/drafts",{method:"DELETE",headers:adminHeaders(),credentials:"include"});
      if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.error||("HTTP "+r.status))}
      await refreshDraftToolbar(toolbar);if(cmsDraftMode)location.reload();
    }catch(error){alert("Verwerfen fehlgeschlagen: "+error.message)}finally{button.disabled=false}
  });
  const style=document.createElement("style");
  style.textContent=".cms-draft-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 22px;padding:14px 16px;border:1px solid #ded8c9;border-radius:16px;background:#fff8cf}.cms-draft-toolbar>div{display:grid;gap:2px;flex:1 1 280px}.cms-draft-toolbar>div span{font-size:.72rem;color:#665b30}.cms-draft-switch,.cms-draft-count{display:inline-flex;align-items:center;gap:7px;font-size:.75rem;font-weight:850}.cms-draft-count{position:relative;padding:7px 9px;border-radius:999px;background:#fff;cursor:help;outline:none}.cms-draft-count::after{content:'';position:absolute;z-index:129;top:100%;left:-6px;right:-6px;height:14px}.cms-draft-count:focus-visible{box-shadow:0 0 0 3px rgba(155,131,32,.24)}.cms-draft-tooltip{position:absolute;z-index:130;top:calc(100% + 9px);right:0;display:grid;gap:8px;width:max-content;min-width:300px;max-width:min(480px,calc(100vw - 28px));padding:12px 13px;border:1px solid #d9deda;border-radius:12px;background:#172026;color:#fff;box-shadow:0 14px 36px rgba(20,32,38,.22);white-space:normal;text-align:left;opacity:0;visibility:hidden;transform:translateY(-4px);pointer-events:none;transition:opacity .14s ease,transform .14s ease,visibility .14s ease}.cms-draft-count:hover .cms-draft-tooltip,.cms-draft-count:focus .cms-draft-tooltip,.cms-draft-count:focus-within .cms-draft-tooltip,.cms-draft-tooltip:hover{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto}.cms-draft-tooltip::before{content:'';position:absolute;top:-6px;right:18px;width:10px;height:10px;background:#172026;border-left:1px solid #d9deda;border-top:1px solid #d9deda;transform:rotate(45deg)}.cms-draft-tooltip-title{position:relative;z-index:1;font-size:.7rem;letter-spacing:.04em;text-transform:uppercase;color:#f0d64f}.cms-draft-tooltip-row{display:grid;gap:2px;width:100%;padding:8px 7px;border:0;border-top:1px solid rgba(255,255,255,.14);border-radius:7px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.cms-draft-tooltip-row:hover,.cms-draft-tooltip-row:focus-visible{background:rgba(255,255,255,.09);outline:none}.cms-draft-tooltip-row b{font-size:.74rem;color:#fff;line-height:1.35}.cms-draft-tooltip-row span,.cms-draft-tooltip-empty{font-size:.68rem;font-weight:650;color:#cbd4d1;line-height:1.45}.cms-draft-tooltip-row small{margin-top:2px;font-size:.61rem;font-weight:900;color:#f0d64f}.cms-draft-toolbar button{min-height:36px}.cms-draft-toolbar button.secondary{background:#fff}.cms-draft-switch input{width:16px;height:16px}@media(max-width:620px){.cms-draft-tooltip{position:fixed;top:auto;left:14px;right:14px;bottom:14px;width:auto;max-width:none}.cms-draft-tooltip::before{display:none}}";
  document.head.appendChild(style);
  refreshDraftToolbar(toolbar);
}

const cmsMediaEnabled=window.GUDELIUS_CMS_MEDIA_ENABLED!==false;
function initialMediaSrc(item){return getApi()&&(cmsMediaEnabled||cmsAccessMode)?mediaUrl(item.key):item.fallback}
function showMediaModeNotice(){
  if(cmsMediaEnabled)return;
  const hasMediaUi=document.querySelector("#startPageGrid,#startPageTileGrid,#companyGrid,#service1Grid,#service2Grid,#service3Grid,#service4Grid,#servicePage1Grid,#servicePage2Grid,#servicePage3Grid,#servicePage4Grid,#technikEditor,#projectEditor");
  if(!hasMediaUi)return;
  const section=hasMediaUi.closest(".admin-section")||document.querySelector(".admin-section");
  const head=section?.querySelector(".admin-section-head");
  if(!section||!head||section.querySelector(".media-mode-notice"))return;
  const notice=document.createElement("div");
  notice.className="media-mode-notice";
  notice.setAttribute("role","status");
  notice.textContent="Bildmodus: Auf der öffentlichen Website sind derzeit bewusst die Initialbilder aktiv. R2-Uploads werden gespeichert, aber erst nach Reaktivierung der Medienausgabe öffentlich angezeigt.";
  notice.style.cssText="margin:0 0 18px;padding:12px 14px;border:1px solid #e0cf7b;border-radius:12px;background:#fff8cf;color:#5f531d;font-size:.78rem;line-height:1.5;font-weight:750";
  head.insertAdjacentElement("afterend",notice);
}
function mediaUrl(key){
  const prefix=cmsAccessMode?"/api/admin/media/":"/media/";
  return getApi()+prefix+key.split("/").map(encodeURIComponent).join("/");
}
const adminMediaObjectUrls=new WeakMap();
async function loadProtectedMediaIntoImage(img,key,fallback=""){
  if(!img||!key)return false;
  const response=await fetch(getApi()+"/api/admin/media/"+key.split("/").map(encodeURIComponent).join("/"),{
    method:"GET",
    headers:adminHeaders(),
    credentials:"include",
    cache:"no-store"
  });
  if(!response.ok){
    if(fallback)img.src=fallback;
    return false;
  }
  const blob=await response.blob();
  const oldUrl=adminMediaObjectUrls.get(img);
  if(oldUrl)URL.revokeObjectURL(oldUrl);
  const objectUrl=URL.createObjectURL(blob);
  adminMediaObjectUrls.set(img,objectUrl);
  img.src=objectUrl;
  return true;
}
async function imageFileDimensions(file){
  if(!file||!String(file.type||"").startsWith("image/"))return {width:0,height:0};
  const objectUrl=URL.createObjectURL(file);
  try{
    const image=new Image();
    const result=await new Promise(resolve=>{
      image.onload=()=>resolve({width:image.naturalWidth||0,height:image.naturalHeight||0});
      image.onerror=()=>resolve({width:0,height:0});
      image.src=objectUrl;
    });
    return result;
  }finally{URL.revokeObjectURL(objectUrl)}
}
async function mediaUploadHeaders(file){
  const dimensions=await imageFileDimensions(file);
  return adminHeaders({
    "content-type":file.type||"application/octet-stream",
    "x-file-name":file.name,
    "x-image-width":String(dimensions.width||0),
    "x-image-height":String(dimensions.height||0)
  });
}

if(cmsAccessMode && connectionStatus){
  setStatus(connectionStatus,"Cloudflare Access-Modus aktiv. Kein Admin-Token im Browser erforderlich.",true);
}

function ensureAdminSessionUi(){
  if(!cmsAccessMode)return null;
  const header=document.querySelector(".admin-header");
  if(!header)return null;

  let actions=header.querySelector(".admin-header-actions");
  if(!actions){
    const existing=[...header.children].filter(child=>child!==header.firstElementChild);
    actions=document.createElement("div");
    actions.className="admin-header-actions";
    existing.forEach(child=>actions.appendChild(child));
    header.appendChild(actions);
  }

  let session=actions.querySelector(".admin-session");
  if(session)return session;

  session=document.createElement("div");
  session.className="admin-session";
  session.innerHTML=`
    <div class="admin-session-copy">
      <span>Angemeldet als</span>
      <strong class="admin-session-email">wird geprüft …</strong>
    </div>
    <a class="admin-session-logout" href="#" rel="nofollow">Abmelden</a>
  `;
  actions.appendChild(session);

  const logout=session.querySelector(".admin-session-logout");
  const logoutUrl=new URL("/cdn-cgi/access/logout",getApi()||location.origin);
  logout.href=logoutUrl.href;
  return session;
}

async function loadAdminSessionUi(){
  const session=ensureAdminSessionUi();
  if(!session||!getApi())return;
  const emailNode=session.querySelector(".admin-session-email");
  try{
    const response=await fetch(getApi()+"/api/admin/session",{
      headers:adminHeaders(),
      credentials:"include",
      cache:"no-store"
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.ok){
      emailNode.textContent="Sitzung nicht freigegeben";
      session.classList.add("is-error");
      return;
    }
    const label=(data.email||"Cloudflare Access").trim();
    emailNode.textContent=label;
    session.classList.toggle("is-access",data.auth_mode==="access");
  }catch(error){
    emailNode.textContent="Sitzung konnte nicht geprüft werden";
    session.classList.add("is-error");
  }
}

if(cmsAccessMode){
  loadAdminSessionUi();
}
ensureDraftToolbar();

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
    window.GUDELIUS_INQUIRIES?.load?.();
  });
}

if(testButton){
  testButton.addEventListener("click",async()=>{
    if(!getApi()) return setStatus(connectionStatus,"Bitte zuerst die Worker-URL eintragen.",false);
    setStatus(connectionStatus,"Teste Verbindung …");
    try{
      const headers=adminHeaders();
      const r=await fetch(getApi()+"/api/admin/session",{headers});
      if(r.status===401 && cmsAccessMode){
        const health=await fetch(getApi()+"/api/health");
        if(!health.ok) throw new Error("Healthcheck HTTP "+health.status);
        setStatus(connectionStatus,"Backend erreichbar. Cloudflare Access ist noch nicht aktiv oder diese Sitzung ist noch nicht über Access angemeldet.");
        return;
      }
      if(!r.ok) throw new Error("HTTP "+r.status);
      const data=await r.json();
      const authLabel=data.auth_mode==="access"?"Cloudflare Access":data.auth_mode==="token"?"Admin-Token":"unbekannt";
      setStatus(connectionStatus,data.ok?"Admin-Verbindung erfolgreich · "+authLabel+".":"Unerwartete Antwort.",!!data.ok);
    }catch(e){
      if(cmsAccessMode){
        try{
          const health=await fetch(getApi()+"/api/health");
          if(health.ok){
            setStatus(connectionStatus,"Backend erreichbar. Für den Admin ist noch eine gültige Cloudflare-Access-Sitzung erforderlich.");
            return;
          }
        }catch{}
      }
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
  return getApi()+"/api/admin/content/"+key.split("/").map(encodeURIComponent).join("/");
}

const mediaLayoutPrefix="media-layout/";
let mediaLayoutContentPromise=null;
let mediaLayoutContentCache={};

function mediaLayoutContentKey(mediaKey){return mediaLayoutPrefix+mediaKey}
function clampMediaNumber(value,min,max,fallback){
  const number=Number(value);
  return Number.isFinite(number)?Math.min(max,Math.max(min,number)):fallback;
}
function normalizeMediaLayout(value){
  const source=value&&typeof value==="object"?value:{};
  return {
    x:clampMediaNumber(source.x,0,100,50),
    y:clampMediaNumber(source.y,0,100,50),
    zoom:clampMediaNumber(source.zoom,25,300,100),
    rotation:clampMediaNumber(source.rotation,-180,180,0)
  };
}
async function loadMediaLayoutContent(){
  if(!getApi())return {};
  if(!mediaLayoutContentPromise){
    mediaLayoutContentPromise=fetchSiteSnapshot()
      .then(async response=>{
        if(!response.ok)throw new Error("HTTP "+response.status);
        const data=await response.json();
        mediaLayoutContentCache=data.content||{};
        return mediaLayoutContentCache;
      })
      .catch(error=>{mediaLayoutContentPromise=null;throw error});
  }
  return mediaLayoutContentPromise;
}
async function deleteMediaLayout(mediaKey){
  const key=mediaLayoutContentKey(mediaKey);
  if(cmsDraftMode){
    const standard=normalizeMediaLayout(null);
    const response=await fetch(draftContentUrl(key),{
      method:"PUT",
      headers:adminHeaders({"content-type":"application/json"}),
      credentials:"include",
      body:JSON.stringify(standard)
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||("HTTP "+response.status));
    mediaLayoutContentCache[key]=standard;
    scheduleDraftToolbarRefresh();
    return;
  }
  const response=await fetch(contentUrl(key),{method:"DELETE",headers:adminHeaders()});
  if(!response.ok&&response.status!==404){
    const data=await response.json().catch(()=>({}));
    throw new Error(data.error||("HTTP "+response.status));
  }
  delete mediaLayoutContentCache[key];
}
async function saveMediaLayout(mediaKey,value){
  const key=mediaLayoutContentKey(mediaKey);
  const response=await fetch(cmsDraftMode?draftContentUrl(key):contentUrl(key),{
    method:"PUT",
    headers:adminHeaders({"content-type":"application/json"}),
    credentials:cmsDraftMode?"include":"same-origin",
    body:JSON.stringify(value)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||("HTTP "+response.status));
  if(cmsDraftMode&&data.draft!==true)throw new Error("Worker hat die Bildlayout-Änderung nicht als Entwurf bestätigt.");
  mediaLayoutContentCache[key]=value;
  if(cmsDraftMode)registerDraftKey(key,data.count);
  scheduleDraftToolbarRefresh();
}
const mediaCropControllers=new WeakMap();
const activeMediaCropControllers=new Set();
function attachMediaCropEditor(card,img,item,status){
  const cropper=window.GUDELIUS_CROPPER;
  if(!cropper?.attach)throw new Error("cropper.js wurde nicht geladen.");
  const controller=cropper.attach({
    card,img,item,status,
    dependencies:{
      normalizeMediaLayout,
      clampMediaNumber,
      setStatus,
      getApi,
      hasAdminAuth,
      mediaLayoutContentKey,
      loadMediaLayoutContent,
      deleteMediaLayout,
      saveMediaLayout
    }
  });
  if(controller){
    mediaCropControllers.set(card,controller);
    activeMediaCropControllers.add({card,controller});
  }
  return controller;
}
function activeDirtyMediaCrops(){
  const dirty=[];
  for(const entry of [...activeMediaCropControllers]){
    if(!entry.card?.isConnected){
      activeMediaCropControllers.delete(entry);
      continue;
    }
    if(entry.controller?.isDirty?.())dirty.push(entry);
  }
  return dirty;
}
function hasPendingMediaCrops(){
  return activeDirtyMediaCrops().length>0;
}
async function saveAllPendingMediaCrops(){
  const dirty=activeDirtyMediaCrops();
  for(const entry of dirty)await entry.controller.save();
  return dirty.length;
}
async function savePendingMediaCrop(card){
  const controller=mediaCropControllers.get(card);
  if(controller?.isDirty?.())await controller.save();
}
async function loadHeroTexts(){
  if(!heroTextStatus) return;
  if(!getApi()) return setStatus(heroTextStatus,"Worker-URL fehlt.",false);
  setStatus(heroTextStatus,"Lade Texte …");
  try{
    const response=await fetchSiteSnapshot();
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
  const response=await fetch(cmsDraftMode?draftContentUrl(key):contentUrl(key),{
    method:"PUT",
    headers:adminHeaders({"content-type":"application/json"}),
    credentials:cmsDraftMode?"include":"same-origin",
    body:JSON.stringify(value)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
  if(cmsDraftMode&&data.draft!==true)throw new Error("Worker hat die Textänderung nicht als Entwurf bestätigt.");
  if(cmsDraftMode)registerDraftKey(key,data.count);
  scheduleDraftToolbarRefresh();
}

if(saveHeroTexts){
  saveHeroTexts.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(heroTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
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
    const response=await fetchSiteSnapshot();
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
      if(!getApi()||!hasAdminAuth()){
        return setStatus(control.status,"Worker-URL oder Admin-Anmeldung fehlt.",false);
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
  "unternehmen/page-eyebrow":"Vermessungsbüro aus der Jachenau",
  "unternehmen/page-title":"Persönlich geführt. Präzise gearbeitet.",
  "unternehmen/page-lead":"GudeliusVermessung steht für direkte Ansprechpartner, moderne Messtechnik und verlässliche Vermessungsdaten – von der ersten Aufnahme bis zur fertigen Planungsgrundlage.",
  "unternehmen/eyebrow":"Persönlicher Ansprechpartner",
  "unternehmen/title":"Vermessung mit direkter Verantwortung.",
  "unternehmen/name":"Jost Gudelius, B. Eng. (FH)",
  "unternehmen/lead":"steht für persönliche Betreuung, kurze Abstimmungswege und langjährige Projekterfahrung im Hoch-, Tief- und Straßenbau. Seit 2020 führt er sein eigenes Vermessungsbüro in Jachenau.",
  "unternehmen/timeline-1-year":"Seit 2020",
  "unternehmen/timeline-1-text":"GudeliusVermessung",
  "unternehmen/timeline-2-year":"2013 – 2020",
  "unternehmen/timeline-2-text":"Projektleitende Tätigkeit als Vermessungsingenieur",
  "unternehmen/timeline-3-year":"2013",
  "unternehmen/timeline-3-text":"Geoinformatik und Satellitenpositionierung · FH München"
};

const companyLegacyTextValues={
  "unternehmen/eyebrow":"Ihr Ansprechpartner",
  "unternehmen/title":"Persönlich geführt. Direkt erreichbar.",
  "unternehmen/lead":"ist Vermessungsingenieur mit langjähriger Projekterfahrung im Hoch-, Tief- und Straßenbau. Seit 2020 führt er sein eigenes Vermessungsbüro in Jachenau."
};

async function loadCompanyTexts(){
  if(!companyTextStatus) return;
  if(!getApi()) return setStatus(companyTextStatus,"Worker-URL fehlt.",false);
  setStatus(companyTextStatus,"Lade Unternehmenstexte …");
  try{
    const response=await fetchSiteSnapshot();
    if(!response.ok) throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(companyTextFields).forEach(([key,field])=>{
      if(!field)return;
      const stored=typeof content[key]==="string"?content[key]:"";
      field.value=(companyLegacyTextValues[key]&&stored===companyLegacyTextValues[key])?companyTextDefaults[key]:(stored||companyTextDefaults[key]);
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
    if(!getApi()||!hasAdminAuth()) return setStatus(companyTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
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


const companyTimelineDefaults=[
  {id:"station-1",period:"Seit 2020",text:"GudeliusVermessung",description:"",visible:true},
  {id:"station-2",period:"2013 – 2020",text:"Projektleitende Tätigkeit als Vermessungsingenieur",description:"",visible:true},
  {id:"station-3",period:"2013",text:"Geoinformatik und Satellitenpositionierung · FH München",description:"",visible:true}
];
function normalizeCompanyTimeline(value,content={}){
  if(Array.isArray(value)){
    return value.filter(item=>item&&typeof item==="object").map((item,index)=>({
      id:typeof item.id==="string"&&item.id?item.id:"station-"+(index+1),
      period:String(item.period||"").slice(0,80),text:String(item.text||"").slice(0,220),description:String(item.description||"").slice(0,500),visible:item.visible!==false
    }));
  }
  return companyTimelineDefaults.map((fallback,index)=>({
    ...fallback,
    period:typeof content["unternehmen/timeline-"+(index+1)+"-year"]==="string"?content["unternehmen/timeline-"+(index+1)+"-year"]:fallback.period,
    text:typeof content["unternehmen/timeline-"+(index+1)+"-text"]==="string"?content["unternehmen/timeline-"+(index+1)+"-text"]:fallback.text
  }));
}
function renderCompanyTimeline(){
  if(!companyTimelineEditor)return;companyTimelineEditor.innerHTML="";
  companyTimelineItems.forEach((item,index)=>{
    const card=document.createElement("div");card.className="timeline-dynamic-card form-editor-block";
    const head=document.createElement("div");head.className="form-editor-block-head";
    const strong=document.createElement("strong");strong.textContent="Station "+(index+1);
    const controls=document.createElement("div");controls.className="timeline-row-controls";
    const up=document.createElement("button");up.type="button";up.className="secondary";up.textContent="↑";up.disabled=index===0;
    const down=document.createElement("button");down.type="button";down.className="secondary";down.textContent="↓";down.disabled=index===companyTimelineItems.length-1;
    const remove=document.createElement("button");remove.type="button";remove.className="danger-soft";remove.textContent="Entfernen";
    up.addEventListener("click",()=>{[companyTimelineItems[index-1],companyTimelineItems[index]]=[companyTimelineItems[index],companyTimelineItems[index-1]];renderCompanyTimeline()});
    down.addEventListener("click",()=>{[companyTimelineItems[index+1],companyTimelineItems[index]]=[companyTimelineItems[index],companyTimelineItems[index+1]];renderCompanyTimeline()});
    remove.addEventListener("click",()=>{companyTimelineItems.splice(index,1);renderCompanyTimeline()});controls.append(up,down,remove);head.append(strong,controls);
    const grid=document.createElement("div");grid.className="text-editor-grid";
    const makeField=(label,value,max,area=false)=>{
      const wrap=document.createElement("label");wrap.textContent=label;const field=document.createElement(area?"textarea":"input");if(area)field.rows=2;field.maxLength=max;field.value=value;wrap.appendChild(field);return [wrap,field];
    };
    const [periodWrap,period]=makeField("Zeitraum / Jahr",item.period,80),[textWrap,text]=makeField("Titel / Station",item.text,220),[descWrap,description]=makeField("Zusatzbeschreibung",item.description,500,true);
    descWrap.classList.add("text-editor-wide");
    const visibleWrap=document.createElement("label");visibleWrap.className="check-option text-editor-wide";const visible=document.createElement("input");visible.type="checkbox";visible.checked=item.visible!==false;visibleWrap.append(visible,document.createTextNode(" Auf der Website anzeigen"));
    period.addEventListener("input",()=>item.period=period.value);text.addEventListener("input",()=>item.text=text.value);description.addEventListener("input",()=>item.description=description.value);visible.addEventListener("change",()=>item.visible=visible.checked);
    grid.append(periodWrap,textWrap,descWrap,visibleWrap);card.append(head,grid);companyTimelineEditor.appendChild(card);
  });
  if(!companyTimelineItems.length){companyTimelineEditor.innerHTML='<div class="service-list-empty">Noch keine Timeline-Stationen vorhanden.</div>'}
}
async function loadCompanyTimeline(){
  if(!companyTimelineEditor)return;
  if(!getApi()){companyTimelineItems=normalizeCompanyTimeline(null);renderCompanyTimeline();return setStatus(companyTimelineStatus,"Worker-URL fehlt; Fallback-Timeline aktiv.",false)}
  setStatus(companyTimelineStatus,"Lade Timeline …");
  try{const r=await fetchSiteSnapshot();if(!r.ok)throw new Error("HTTP "+r.status);const data=await r.json(),content=data.content||{};companyTimelineItems=normalizeCompanyTimeline(content["unternehmen/timeline"],content);renderCompanyTimeline();setStatus(companyTimelineStatus,Array.isArray(content["unternehmen/timeline"])?"Timeline geladen.":"Legacy-Timeline geladen; beim Speichern wird sie dynamisch.",true)}
  catch(error){companyTimelineItems=normalizeCompanyTimeline(null);renderCompanyTimeline();setStatus(companyTimelineStatus,"Timeline konnte nicht geladen werden; Fallback aktiv: "+error.message,false)}
}
async function persistCompanyTimeline(){
  if(!getApi()||!hasAdminAuth())return setStatus(companyTimelineStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
  saveCompanyTimeline.disabled=true;setStatus(companyTimelineStatus,"Speichere Timeline …");
  try{
    const normalized=companyTimelineItems.map((item,index)=>({id:item.id||"station-"+(index+1),period:item.period.trim(),text:item.text.trim(),description:item.description.trim(),visible:item.visible!==false}));
    await saveHeroText("unternehmen/timeline",normalized);
    for(let index=0;index<3;index++){
      const item=normalized[index]||{period:"",text:""};
      await saveHeroText("unternehmen/timeline-"+(index+1)+"-year",item.period);
      await saveHeroText("unternehmen/timeline-"+(index+1)+"-text",item.text);
    }
    companyTimelineItems=normalized;renderCompanyTimeline();setStatus(companyTimelineStatus,"Timeline erfolgreich gespeichert.",true);
  }catch(error){setStatus(companyTimelineStatus,"Speichern fehlgeschlagen: "+error.message,false)}finally{saveCompanyTimeline.disabled=false}
}
addCompanyTimeline?.addEventListener("click",()=>{companyTimelineItems.push({id:"station-"+Date.now(),period:"",text:"",description:"",visible:true});renderCompanyTimeline();companyTimelineEditor.lastElementChild?.scrollIntoView({block:"nearest"})});
saveCompanyTimeline?.addEventListener("click",persistCompanyTimeline);
reloadCompanyTimeline?.addEventListener("click",loadCompanyTimeline);


const projectManifestKey="projekte/index";
const projectFields=["title","imageTitle","imageDescription","description","location","year","services"];
const projectFieldKeyMap={imageTitle:"image-title",imageDescription:"image-description"};
const projectImageTextDefaults={
  "ingenieur-bauvermessung":{imageTitle:"Ingenieur- & Bauvermessung",imageDescription:"Absteckung · Kontrolle · Bestand"},
  "3d-laserscanning":{imageTitle:"3D-Bestandsaufnahme & Laserscanning",imageDescription:"Punktwolke · Aufmaß · Dokumentation"},
  "rtk-drohnenvermessung":{imageTitle:"RTK-Drohnenvermessung",imageDescription:"Orthophoto · Fläche · Geländedaten"},
  "gelaende-gewaesser":{imageTitle:"Gelände- & Gewässervermessung",imageDescription:"Topografie · Bestand · Geländemodell"},
  "mobiler-einsatz":{imageTitle:"Mobiler Projekteinsatz",imageDescription:"Datenkontrolle · Auswertung vor Ort"},
  "bestand-planung":{imageTitle:"Bestandsaufnahme & Planungsgrundlagen",imageDescription:"Aufmaß · Bestand · Weiterverarbeitung"}
};
const projectServiceOptions=[
  ["ingenieurvermessung","Ingenieurvermessung"],
  ["gis-bauvermessung","GIS & Bauvermessung"],
  ["3d-laserscanning","3D-Laserscanning"],
  ["drohnenvermessung","Drohnenvermessung"]
];

function projectContentKey(item,field){return "projekte/"+item.slug+"/"+(projectFieldKeyMap[field]||field)}
function projectValue(item,field){
  const value=projectContentCache[projectContentKey(item,field)];
  if(field==="services") return Array.isArray(value)?value:(Array.isArray(item.services)?item.services:[]);
  if(typeof value==="string") return value;
  if(field==="imageTitle") return item.imageTitle||projectImageTextDefaults[item.slug]?.imageTitle||item.title||item.slug;
  if(field==="imageDescription") return item.imageDescription||projectImageTextDefaults[item.slug]?.imageDescription||"";
  return item[field]||"";
}
function projectFallbackImage(){return "../assets/dummy-aussendienst-02.svg"}
function projectBySlug(slug){return projects.find(item=>item.slug===slug)||projects[0]||null}
function normalizeProjectManifest(raw){
  if(!Array.isArray(raw)){
    return defaultProjects.map((item,index)=>({slug:item.slug,order:index+1,visible:true,archived:false,featured:index===0}));
  }
  const seen=new Set();
  return raw.filter(entry=>entry&&typeof entry.slug==="string"&&entry.slug.trim()).map((entry,index)=>({
    slug:entry.slug.trim(),order:Number.isFinite(Number(entry.order))?Number(entry.order):index+1,
    visible:entry.visible!==false,archived:entry.archived===true,featured:entry.featured===true
  })).filter(entry=>{if(seen.has(entry.slug))return false;seen.add(entry.slug);return true}).sort((a,b)=>a.order-b.order);
}
function applyProjectManifest(raw){
  projects=normalizeProjectManifest(raw).map((entry,index)=>{
    const fallback=defaultProjects.find(item=>item.slug===entry.slug);
    return {...(fallback||{slug:entry.slug,key:"projects/"+entry.slug,title:entry.slug,name:entry.slug,description:"",location:"",year:"",services:[],detail:"Projektbild",fallback:projectFallbackImage()}),
      slug:entry.slug,key:"projects/"+entry.slug,order:index+1,visible:entry.visible,archived:entry.archived,featured:entry.featured};
  });
}
function projectManifest(){return projects.map((item,index)=>({slug:item.slug,order:index+1,visible:item.visible!==false,archived:item.archived===true,featured:item.featured===true}))}
async function saveProjectManifest(){const manifest=projectManifest();await saveHeroText(projectManifestKey,manifest);projectContentCache[projectManifestKey]=manifest}
function slugifyProject(value){
  return String(value||"").trim().toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,72);
}
function uniqueProjectSlug(title){const base=slugifyProject(title)||"projekt";let slug=base,index=2;const used=new Set(projects.map(item=>item.slug));while(used.has(slug))slug=base+"-"+index++;return slug}
function refreshProjectSelect(){
  if(!projectSelect)return;
  const current=activeProjectSlug||projectSelect.value;projectSelect.innerHTML="";
  projects.forEach((item,index)=>{
    const option=document.createElement("option");option.value=item.slug;
    const title=projectValue(item,"title")||item.title||item.slug;
    option.textContent=String(index+1).padStart(2,"0")+" · "+title+(item.archived?" · Archiv":(item.visible===false?" · Ausgeblendet":""));
    projectSelect.appendChild(option);
  });
  const next=projects.some(item=>item.slug===current)?current:(projects[0]?.slug||"");projectSelect.value=next;activeProjectSlug=next;
}
function setProjectDirty(card,dirty=true,source="content"){
  if(!card)return;
  if(source==="crop")card.dataset.projectCropDirty=dirty?"1":"0";
  else card.dataset.projectContentDirty=dirty?"1":"0";
  const badge=card.querySelector(".project-dirty-badge");
  if(badge)badge.hidden=!(card.dataset.projectContentDirty==="1"||card.dataset.projectCropDirty==="1");
}
async function deleteProjectContent(item){
  const headers=adminHeaders();
  for(const field of projectFields){
    const response=await fetch(contentUrl(projectContentKey(item,field)),{method:"DELETE",headers});
    if(!response.ok&&response.status!==404){const data=await response.json().catch(()=>({}));throw new Error(data.error||("HTTP "+response.status))}
  }
}
function renderProjectEditor(item){
  if(!projectEditor||!projectEditorTemplate||!item)return;
  activeProjectSlug=item.slug;projectEditor.innerHTML="";
  const node=projectEditorTemplate.content.cloneNode(true),card=node.querySelector(".project-editor-card");
  const img=node.querySelector("img"),heading=node.querySelector(".project-editor-name"),indexLabel=node.querySelector(".project-editor-index"),mediaKey=node.querySelector(".project-media-key");
  const file=node.querySelector(".file-input"),upload=node.querySelector(".upload"),reset=node.querySelector(".reset"),mediaStatus=node.querySelector(".card-status");
  const save=node.querySelector(".project-save"),reload=node.querySelector(".project-reload"),status=node.querySelector(".project-status");
  const visibility=node.querySelector(".project-visibility"),archive=node.querySelector(".project-archive"),duplicate=node.querySelector(".project-duplicate"),remove=node.querySelector(".project-delete");
  const up=node.querySelector(".project-up"),down=node.querySelector(".project-down"),visibleBadge=node.querySelector(".project-visible-badge"),archiveBadge=node.querySelector(".project-archive-badge"),orderLabel=node.querySelector(".project-order");
  const title=node.querySelector('[data-project-field="title"]'),imageTitle=node.querySelector('[data-project-field="imageTitle"]'),imageDescription=node.querySelector('[data-project-field="imageDescription"]'),description=node.querySelector('[data-project-field="description"]'),location=node.querySelector('[data-project-field="location"]'),year=node.querySelector('[data-project-field="year"]'),featured=node.querySelector('[data-project-meta="featured"]');
  const servicesWrap=node.querySelector(".project-services");
  card.dataset.projectSlug=item.slug;
  card.dataset.mediaKey=item.key;
  projectServiceOptions.forEach(([value,label])=>{
    const l=document.createElement("label");l.className="check-option";const input=document.createElement("input");input.type="checkbox";input.value=value;
    input.checked=projectValue(item,"services").includes(value);input.addEventListener("change",()=>setProjectDirty(card,true));l.append(input,document.createTextNode(label));servicesWrap.appendChild(l);
  });
  title.value=projectValue(item,"title");imageTitle.value=projectValue(item,"imageTitle");imageDescription.value=projectValue(item,"imageDescription");description.value=projectValue(item,"description");location.value=projectValue(item,"location");year.value=projectValue(item,"year");featured.checked=item.featured===true;
  [title,imageTitle,imageDescription,description,location,year].forEach(field=>field.addEventListener("input",()=>setProjectDirty(card,true)));featured.addEventListener("change",()=>setProjectDirty(card,true));
  const displayTitle=title.value||item.title||item.slug;heading.textContent=displayTitle;indexLabel.textContent=String(projects.indexOf(item)+1).padStart(2,"0");mediaKey.textContent=item.key;orderLabel.textContent=String(projects.indexOf(item)+1);
  visibleBadge.textContent=item.visible===false?"Ausgeblendet":"Sichtbar";visibleBadge.classList.toggle("is-off",item.visible===false);archiveBadge.hidden=!item.archived;
  visibility.textContent=item.visible===false?"Einblenden":"Ausblenden";archive.textContent=item.archived?"Aus Archiv holen":"Archivieren";remove.hidden=!item.archived;up.disabled=projects.indexOf(item)===0;down.disabled=projects.indexOf(item)===projects.length-1;
  img.alt=displayTitle;
  img.onerror=()=>{img.onerror=null;img.src=item.fallback};
  if(cmsAccessMode&&getApi()){
    loadProtectedMediaIntoImage(img,item.key,item.fallback).catch(()=>{img.src=item.fallback});
  }else{
    img.src=initialMediaSrc(item);
  }
  attachMediaCropEditor(card,img,item,mediaStatus);
  card.addEventListener("cms-crop-dirty-change",event=>{
    setProjectDirty(card,Boolean(event.detail?.dirty),"crop");
  });
  file.addEventListener("change",()=>{const selected=file.files?.[0];if(!selected)return;img.src=URL.createObjectURL(selected);setStatus(mediaStatus,selected.name+" ausgewählt.")});
  upload.addEventListener("click",async()=>{
    const selected=file.files?.[0];if(!selected)return setStatus(mediaStatus,"Bitte zuerst ein Bild auswählen.",false);if(!getApi()||!hasAdminAuth())return setStatus(mediaStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    upload.disabled=true;setStatus(mediaStatus,"Upload läuft …");
    try{
      const r=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
        method:"PUT",
        headers:await mediaUploadHeaders(selected),
        credentials:"include",
        body:selected
      });
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
      const readable=await loadProtectedMediaIntoImage(img,item.key,item.fallback);
      if(!readable)throw new Error("Bild wurde gespeichert, konnte aber nicht wieder aus R2 geladen werden.");
      file.value="";
      setStatus(mediaStatus,"Projektbild gespeichert und aus R2 bestätigt.",true);
    }catch(error){
      setStatus(mediaStatus,"Upload fehlgeschlagen: "+error.message,false);
    }finally{upload.disabled=false}
  });
  reset.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth())return setStatus(mediaStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);if(!confirm("Cloudflare-Bild für „"+displayTitle+"“ löschen?"))return;
    reset.disabled=true;try{const r=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{method:"DELETE",headers:adminHeaders()});
      const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||("HTTP "+r.status));img.src=item.fallback;file.value="";setStatus(mediaStatus,"Cloudflare-Bild gelöscht; Fallback aktiv.",true)}
    catch(error){setStatus(mediaStatus,"Löschen fehlgeschlagen: "+error.message,false)}finally{reset.disabled=false}
  });
  save.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth())return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);save.disabled=true;setStatus(status,"Speichere Projekt …");
    try{
      const values={title:title.value.trim(),imageTitle:imageTitle.value.trim(),imageDescription:imageDescription.value.trim(),description:description.value.trim(),location:location.value.trim(),year:year.value.trim(),services:[...servicesWrap.querySelectorAll('input:checked')].map(i=>i.value)};
      if(!values.title)throw new Error("Titel darf nicht leer sein.");
      if(featured.checked){projects.forEach(p=>{p.featured=p.slug===item.slug})}else item.featured=false;
      for(const field of projectFields){await saveHeroText(projectContentKey(item,field),values[field]);projectContentCache[projectContentKey(item,field)]=values[field]}
      await saveProjectManifest();
      await savePendingMediaCrop(card);
      heading.textContent=values.title;img.alt=values.title;refreshProjectSelect();projectSelect.value=item.slug;setProjectDirty(card,false,"content");setStatus(status,"Projekt erfolgreich gespeichert.",true);
    }catch(error){setStatus(status,"Speichern fehlgeschlagen: "+error.message,false)}finally{save.disabled=false}
  });
  reload.addEventListener("click",loadProjectsCms);
  visibility.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth())return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);const old=item.visible;item.visible=item.visible===false;
    try{await saveProjectManifest();refreshProjectSelect();projectSelect.value=item.slug;renderProjectEditor(item);setStatus(projectEditor.querySelector(".project-status"),item.visible?"Projekt ist sichtbar.":"Projekt ist ausgeblendet.",true)}
    catch(error){item.visible=old;setStatus(status,"Sichtbarkeit konnte nicht gespeichert werden: "+error.message,false)}
  });
  archive.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth())return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);if(!item.archived&&!confirm("„"+displayTitle+"“ archivieren?"))return;
    const oldA=item.archived,oldV=item.visible;item.archived=!item.archived;if(item.archived)item.visible=false;
    try{await saveProjectManifest();refreshProjectSelect();projectSelect.value=item.slug;renderProjectEditor(item);setStatus(projectEditor.querySelector(".project-status"),item.archived?"Projekt archiviert.":"Projekt reaktiviert.",true)}
    catch(error){item.archived=oldA;item.visible=oldV;setStatus(status,"Archivstatus konnte nicht gespeichert werden: "+error.message,false)}
  });
  duplicate.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth())return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    const copiedTitle=(projectValue(item,"title")||item.title||item.slug)+" Kopie",slug=uniqueProjectSlug(copiedTitle),copy={...item,slug,key:"projects/"+slug,title:copiedTitle,name:copiedTitle,fallback:projectFallbackImage(),visible:false,archived:false,featured:false,order:projects.length+1};
    duplicate.disabled=true;
    try{projects.push(copy);for(const field of projectFields){const value=field==="title"?copiedTitle:projectValue(item,field);projectContentCache[projectContentKey(copy,field)]=value;await saveHeroText(projectContentKey(copy,field),value)}
      await saveProjectManifest();refreshProjectSelect();activeProjectSlug=slug;projectSelect.value=slug;renderProjectEditor(copy);setStatus(projectEditor.querySelector(".project-status"),"Projektkopie angelegt und ausgeblendet.",true)}
    catch(error){projects=projects.filter(p=>p.slug!==slug);setStatus(status,"Duplizieren fehlgeschlagen: "+error.message,false)}finally{duplicate.disabled=false}
  });
  const move=async direction=>{
    if(!getApi()||!hasAdminAuth())return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);const index=projects.indexOf(item),target=index+direction;if(target<0||target>=projects.length)return;
    [projects[index],projects[target]]=[projects[target],projects[index]];
    try{await saveProjectManifest();refreshProjectSelect();projectSelect.value=item.slug;renderProjectEditor(item);setStatus(projectEditor.querySelector(".project-status"),"Reihenfolge gespeichert.",true)}
    catch(error){[projects[index],projects[target]]=[projects[target],projects[index]];setStatus(status,"Reihenfolge konnte nicht gespeichert werden: "+error.message,false)}
  };
  up.addEventListener("click",()=>move(-1));down.addEventListener("click",()=>move(1));
  remove.addEventListener("click",async()=>{
    if(!item.archived||!getApi()||!hasAdminAuth())return;
    if(!confirm("„"+displayTitle+"“ endgültig löschen? Dieser Schritt kann nicht rückgängig gemacht werden."))return;
    remove.disabled=true;
    const previousProjects=projects.slice();
    projects=projects.filter(p=>p.slug!==item.slug);
    try{
      await saveProjectManifest();
    }catch(error){
      projects=previousProjects;refreshProjectSelect();projectSelect.value=item.slug;renderProjectEditor(item);
      return setStatus(projectEditor.querySelector(".project-status"),"Löschen abgebrochen: Projekt-Manifest konnte nicht gespeichert werden: "+error.message,false);
    }
    const cleanupErrors=[];
    try{
      const mr=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{method:"DELETE",headers:adminHeaders()});
      if(!mr.ok&&mr.status!==404){const d=await mr.json().catch(()=>({}));throw new Error(d.error||("Medien-HTTP "+mr.status))}
    }catch(error){cleanupErrors.push("Bild")}
    try{await deleteProjectContent(item)}catch(error){cleanupErrors.push("Texte")}
    projectFields.forEach(f=>delete projectContentCache[projectContentKey(item,f)]);
    activeProjectSlug=projects[0]?.slug||"";refreshProjectSelect();
    if(projects.length){
      renderProjectEditor(projects[0]);
      setStatus(projectEditor.querySelector(".project-status"),cleanupErrors.length?"Projekt entfernt. Einzelne Cloudflare-Daten konnten nicht vollständig bereinigt werden.":"Projekt endgültig entfernt.",cleanupErrors.length===0);
    }else{
      projectEditor.innerHTML='<div class="cms-subpanel empty-state"><h3>Noch keine Projekte</h3><p>Lege die erste Referenz an.</p></div>';
    }
  });
  projectEditor.appendChild(node);
}
async function loadProjectsCms(){
  if(!projectEditor)return;const previous=activeProjectSlug||projectSelect?.value;
  if(!getApi()){projectContentCache={};applyProjectManifest(null);refreshProjectSelect();const current=projectBySlug(previous)||projects[0];if(current)renderProjectEditor(current);return setStatus(projectEditor.querySelector(".project-status"),"Worker-URL fehlt; sechs Fallback-Projekte aktiv.",false)}
  try{const r=await fetchSiteSnapshot();if(!r.ok)throw new Error("HTTP "+r.status);const data=await r.json();projectContentCache=data.content||{};applyProjectManifest(projectContentCache[projectManifestKey]);refreshProjectSelect();const current=projectBySlug(previous)||projects[0];
    if(current){activeProjectSlug=current.slug;projectSelect.value=current.slug;renderProjectEditor(current);setStatus(projectEditor.querySelector(".project-status"),Array.isArray(projectContentCache[projectManifestKey])?"Projekt-Manifest geladen.":"Fallback-Manifest aktiv; beim nächsten Speichern wird es angelegt.",true)}
    else{activeProjectSlug="";projectEditor.innerHTML='<div class="cms-subpanel empty-state"><h3>Noch keine Projekte</h3><p>Das Projekt-Manifest ist leer. Lege eine neue Referenz an.</p></div>'}}
  catch(error){projectContentCache={};applyProjectManifest(null);refreshProjectSelect();const current=projectBySlug(previous)||projects[0];if(current)renderProjectEditor(current);setStatus(projectEditor.querySelector(".project-status"),"CMS nicht erreichbar; Fallback-Projekte aktiv: "+error.message,false)}
}
function openProjectCreate(){projectCreatePanel.hidden=false;projectCreateTitle.value="";setStatus(projectCreateStatus,"");projectCreateTitle.focus()}
function closeProjectCreate(){projectCreatePanel.hidden=true;setStatus(projectCreateStatus,"")}
async function createProject(){
  const title=projectCreateTitle?.value.trim()||"";if(!title)return setStatus(projectCreateStatus,"Bitte einen Projekttitel eingeben.",false);if(!getApi()||!hasAdminAuth())return setStatus(projectCreateStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
  const draftVisible=cmsDraftMode===true;
  const slug=uniqueProjectSlug(title),item={slug,key:"projects/"+slug,title,name:title,imageTitle:title,imageDescription:"",description:"",location:"",year:"",services:[],detail:"Projektbild",fallback:projectFallbackImage(),visible:draftVisible,archived:false,featured:false,order:projects.length+1};
  projectCreateSave.disabled=true;setStatus(projectCreateStatus,"Lege Projekt an …");
  try{projects.push(item);const values={title,imageTitle:title,imageDescription:"",description:"",location:"",year:"",services:[]};for(const field of projectFields){await saveHeroText(projectContentKey(item,field),values[field]);projectContentCache[projectContentKey(item,field)]=values[field]}
    await saveProjectManifest();refreshProjectSelect();activeProjectSlug=slug;projectSelect.value=slug;closeProjectCreate();renderProjectEditor(item);setStatus(projectEditor.querySelector(".project-status"),cmsDraftMode?"Neues Projekt als sichtbarer Entwurf angelegt. Es erscheint jetzt in der Vorschau.":"Neues Projekt angelegt und zunächst ausgeblendet.",true);history.replaceState(null,"","#"+encodeURIComponent(slug))}
  catch(error){projects=projects.filter(p=>p.slug!==slug);setStatus(projectCreateStatus,"Anlegen fehlgeschlagen: "+error.message,false)}finally{projectCreateSave.disabled=false}
}
function setupProjectEditor(){
  if(!projectSelect||!projectEditor||!projectEditorTemplate)return;applyProjectManifest(null);refreshProjectSelect();const hash=decodeURIComponent(location.hash.replace(/^#/,"")),initial=projects.some(p=>p.slug===hash)?hash:projects[0]?.slug;activeProjectSlug=initial||"";projectSelect.value=activeProjectSlug;const first=projectBySlug(activeProjectSlug);if(first)renderProjectEditor(first);
  projectSelect.addEventListener("change",()=>{activeProjectSlug=projectSelect.value;history.replaceState(null,"","#"+encodeURIComponent(activeProjectSlug));renderProjectEditor(projectBySlug(activeProjectSlug))});
  projectAddButton?.addEventListener("click",openProjectCreate);projectCreateCancel?.addEventListener("click",closeProjectCreate);projectCreateSave?.addEventListener("click",createProject);projectCreateTitle?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();createProject()}});
  loadProjectsCms();
}


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
    const response=await fetchSiteSnapshot();
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
    if(!getApi()||!hasAdminAuth()) return setStatus(contactTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
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

const imprintTextDefaults={
  "impressum/hero-lead":"Angaben gemäß § 5 DDG und weitere rechtliche Hinweise von GudeliusVermessung.",
  "impressum/provider-name":"Jost Gudelius",
  "impressum/provider-role":"Vermessungsbüro",
  "impressum/street":"Bäcker 25",
  "impressum/city":"83676 Jachenau",
  "impressum/phone":"+49 (0) 8043 9187958",
  "impressum/fax":"+49 (0) 8043 9189672",
  "impressum/email":"gudeliusvermessung@web.de",
  "impressum/profession":"Vermessungsingenieur",
  "impressum/chamber":"–",
  "impressum/country":"Deutschland",
  "impressum/regulations":"Es gelten folgende berufsrechtliche Regelungen:\nRegelungen einsehbar unter:\nhttp://",
  "impressum/insurer-name":"Allianz Versicherungs-Aktiengesellschaft",
  "impressum/insurer-street":"Albert-Schäffenacker-Straße 5",
  "impressum/insurer-city":"83646 Bad Tölz",
  "impressum/insurance-area":"Deutschland",
  "impressum/dispute":"Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  "impressum/liability-content-1":"Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Für die Verantwortlichkeit für fremde Informationen gelten die jeweils anwendbaren gesetzlichen Vorschriften.",
  "impressum/liability-content-2":"Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.",
  "impressum/liability-links-1":"Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.",
  "impressum/liability-links-2":"Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.",
  "impressum/copyright-1":"Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.",
  "impressum/copyright-2":"Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen."
};

async function loadImprintTexts(){
  if(!imprintTextStatus)return;
  if(!getApi())return setStatus(imprintTextStatus,"Worker-URL fehlt.",false);
  setStatus(imprintTextStatus,"Lade Impressum …");
  try{
    const response=await fetchSiteSnapshot();
    if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json();
    const content=data.content||{};
    Object.entries(imprintTextFields).forEach(([key,field])=>{
      if(field)field.value=typeof content[key]==="string"?content[key]:imprintTextDefaults[key];
    });
    setStatus(imprintTextStatus,"Impressum geladen.",true);
  }catch(error){
    Object.entries(imprintTextFields).forEach(([key,field])=>{if(field)field.value=imprintTextDefaults[key]});
    setStatus(imprintTextStatus,"Impressum konnte nicht geladen werden: "+error.message,false);
  }
}

if(saveImprintTexts){
  saveImprintTexts.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth())return setStatus(imprintTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    saveImprintTexts.disabled=true;
    setStatus(imprintTextStatus,"Prüfe Änderungen …");
    try{
      const snapshotResponse=await fetchSiteSnapshot();
      if(!snapshotResponse.ok)throw new Error("Aktueller CMS-Stand konnte nicht geladen werden (HTTP "+snapshotResponse.status+").");
      const snapshotData=await snapshotResponse.json();
      const currentContent=snapshotData.content||{};
      const changed=Object.entries(imprintTextFields).filter(([key,field])=>{
        const next=field?.value.trim()||"";
        const current=typeof currentContent[key]==="string"?currentContent[key]:imprintTextDefaults[key];
        return next!==current;
      });
      if(changed.length){
        setStatus(imprintTextStatus,"Speichere "+changed.length+" Änderung"+(changed.length===1?"":"en")+" …");
        await Promise.all(changed.map(([key,field])=>saveHeroText(key,field?.value.trim()||"")));
      }
      clearAdminDirtyForElements(Object.values(imprintTextFields),"fields");
      if(cmsDraftMode)await refreshDraftToolbar(document.querySelector(".cms-draft-toolbar"));
      const message=changed.length
        ? (cmsDraftMode?changed.length+" Änderung"+(changed.length===1?"":"en")+" als Entwurf gespeichert.":changed.length+" Änderung"+(changed.length===1?"":"en")+" veröffentlicht.")
        : "Keine inhaltlichen Änderungen.";
      setStatus(imprintTextStatus,message,true);
    }catch(error){
      setStatus(imprintTextStatus,"Speichern fehlgeschlagen: "+error.message,false);
    }finally{
      saveImprintTexts.disabled=false;
    }
  });
}
if(reloadImprintTexts)reloadImprintTexts.addEventListener("click",loadImprintTexts);

async function loadServiceContactTexts(){
  if(!serviceContactTextStatus) return;
  if(!getApi()) return setStatus(serviceContactTextStatus,"Worker-URL fehlt.",false);
  setStatus(serviceContactTextStatus,"Lade Leistungs-Kontakttexte …");
  try{
    const response=await fetchSiteSnapshot();
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
    if(!getApi()||!hasAdminAuth()) return setStatus(serviceContactTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
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


function setupServiceListEditor(element){
  if(!element||element.dataset.listReady==="1")return;
  element.dataset.listReady="1";
  let items=[];
  const render=()=>{
    element.innerHTML="";
    items.forEach((value,index)=>{
      const row=document.createElement("div");row.className="service-list-row";
      const number=document.createElement("span");number.className="service-list-no";number.textContent=String(index+1).padStart(2,"0");
      const input=document.createElement("input");input.type="text";input.value=value;input.maxLength=700;input.setAttribute("aria-label","Listeneintrag "+(index+1));
      input.addEventListener("input",()=>{items[index]=input.value});
      const controls=document.createElement("div");controls.className="service-list-controls";
      const up=document.createElement("button");up.type="button";up.className="secondary";up.textContent="↑";up.disabled=index===0;up.title="Nach oben";
      const down=document.createElement("button");down.type="button";down.className="secondary";down.textContent="↓";down.disabled=index===items.length-1;down.title="Nach unten";
      const remove=document.createElement("button");remove.type="button";remove.className="danger-soft";remove.textContent="×";remove.title="Eintrag entfernen";
      up.addEventListener("click",()=>{[items[index-1],items[index]]=[items[index],items[index-1]];render()});
      down.addEventListener("click",()=>{[items[index+1],items[index]]=[items[index],items[index+1]];render()});
      remove.addEventListener("click",()=>{items.splice(index,1);render()});
      controls.append(up,down,remove);row.append(number,input,controls);element.appendChild(row);
    });
    if(!items.length){const empty=document.createElement("div");empty.className="service-list-empty";empty.textContent="Noch keine Einträge. Mit „+ Eintrag“ beginnen.";element.appendChild(empty)}
  };
  Object.defineProperty(element,"value",{configurable:true,get(){return items.map(value=>value.trim()).filter(Boolean).join("\n")},set(value){items=String(value||"").split(/\r?\n/).map(line=>line.trim()).filter(Boolean);render()}});
  const add=document.querySelector('[data-list-add="'+element.id+'"]');
  add?.addEventListener("click",()=>{items.push("");render();const inputs=element.querySelectorAll("input");inputs[inputs.length-1]?.focus()});
  render();
}
function setupServiceListEditors(){document.querySelectorAll(".service-list-editor").forEach(setupServiceListEditor)}


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
  const listKey=prefix.includes("/task-")?prefix.replace(/\/text\/task-$/,"/lists/tasks"):prefix.replace(/\/text\/scope-$/,"/lists/scope");
  const list=content[listKey];
  if(Array.isArray(list)) return list.filter(value=>typeof value==="string"&&value.trim()).join("\n");
  return defaults.map((fallback,index)=>{const key=prefix+String(index+1).padStart(2,"0");return typeof content[key]==="string" ? content[key] : fallback}).join("\n");
}

async function loadEngineerPageTexts(){
  if(!engineerPageTextStatus) return;
  if(!getApi()) return setStatus(engineerPageTextStatus,"Worker-URL fehlt.",false);

  setStatus(engineerPageTextStatus,"Lade Ingenieurvermessung …");
  try{
    const response=await fetchSiteSnapshot();
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
    if(!getApi()||!hasAdminAuth()){
      return setStatus(engineerPageTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    }

    const taskLines=(engineerTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(engineerScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

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

    entries.push(["leistungsseiten/ingenieurvermessung/lists/tasks",taskLines]);
    entries.push(["leistungsseiten/ingenieurvermessung/lists/scope",scopeLines]);

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
    const response=await fetchSiteSnapshot();
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
    if(!getApi()||!hasAdminAuth()){
      return setStatus(gisPageTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    }

    const taskLines=(gisTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(gisScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

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

    entries.push(["leistungsseiten/gis-bauvermessung/lists/tasks",taskLines]);
    entries.push(["leistungsseiten/gis-bauvermessung/lists/scope",scopeLines]);

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
    const response=await fetchSiteSnapshot();
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
    if(!getApi()||!hasAdminAuth()){
      return setStatus(scanPageTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    }

    const taskLines=(scanTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(scanScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

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

    entries.push(["leistungsseiten/3d-laserscanning/lists/tasks",taskLines]);
    entries.push(["leistungsseiten/3d-laserscanning/lists/scope",scopeLines]);

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
    const response=await fetchSiteSnapshot();
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
    if(!getApi()||!hasAdminAuth()){
      return setStatus(dronePageTextStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    }

    const taskLines=(droneTasksInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

    const scopeLines=(droneScopeInput?.value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean);

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

    entries.push(["leistungsseiten/drohnenvermessung/lists/tasks",taskLines]);
    entries.push(["leistungsseiten/drohnenvermessung/lists/scope",scopeLines]);

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
  if(ok===true){
    el.classList.add("ok");
    if(el.classList.contains("media-crop-status"))clearAdminDirty(el,"crop");
    else if(el.closest("main"))clearAdminDirty(el,"fields");
  }
  if(ok===false) el.classList.add("bad");
}


const techniqueTextFields=["name","category","manufacturer","model","description","details"];
const techniqueManifestKey="technik/index";
const techniqueGroups=["Außendienst","3D & Drohne","Programme & Arbeitsplatz"];

function techniqueContentKey(item,field){
  return "technik/"+item.slug+"/"+field;
}
function techniqueValue(item,field){
  const value=technikContentCache[techniqueContentKey(item,field)];
  return typeof value==="string" ? value : (item[field]||"");
}
function techniqueBySlug(slug){
  return equipment.find(item=>item.slug===slug)||equipment[0]||null;
}
function techniqueFallbackForGroup(group){
  if(group==="3D & Drohne") return "../assets/dummy-3d-01.svg";
  if(group==="Programme & Arbeitsplatz") return "../assets/dummy-software-01.svg";
  return "../assets/dummy-aussendienst-01.svg";
}

function techniqueInlinePlaceholder(item){
  const labels={
    "trimble-sx12":["Trimble SX12","Scanning-Totalstation","SX12"],
    "rtk-drohne":["RTK-Drohne","Vermessung & Orthophoto","RTK"],
    "bbsoft":["BBSOFT","Tiefbau · Vermessung · DGM","BBSOFT"]
  };
  const data=labels[item?.slug];
  if(!data) return "";
  const [name,category,mark]=data;
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf4"/><stop offset="1" stop-color="#e7ece8"/></linearGradient></defs>
    <rect width="900" height="620" fill="url(#g)"/>
    <circle cx="760" cy="105" r="150" fill="#e5c533" opacity=".28"/>
    <circle cx="780" cy="545" r="220" fill="#172026" opacity=".04"/>
    <rect x="64" y="68" width="132" height="32" rx="16" fill="#e5c533"/>
    <text x="130" y="89" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#172026">PLATZHALTER</text>
    <text x="64" y="220" font-family="Arial,sans-serif" font-size="68" font-weight="800" fill="#172026">${esc(mark)}</text>
    <text x="64" y="310" font-family="Arial,sans-serif" font-size="48" font-weight="800" fill="#172026">${esc(name)}</text>
    <text x="64" y="357" font-family="Arial,sans-serif" font-size="23" fill="#526067">${esc(category)}</text>
    <line x1="64" y1="395" x2="590" y2="395" stroke="#c8a900" stroke-width="5"/>
    <text x="64" y="450" font-family="Arial,sans-serif" font-size="19" fill="#67757b">Noch kein individuelles Gerätebild hinterlegt</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}

function techniqueFallbackSrc(item){
  return techniqueInlinePlaceholder(item)||item?.fallback||techniqueFallbackForGroup(item?.group||"Außendienst");
}
function normalizeTechniqueManifest(raw){
  if(!Array.isArray(raw)){
    return defaultEquipment.map((item,index)=>({slug:item.slug,group:item.group,order:index+1,visible:true,archived:false}));
  }
  const seen=new Set();
  return raw.filter(entry=>entry&&typeof entry.slug==="string"&&entry.slug.trim()).map((entry,index)=>({
    slug:entry.slug.trim(),
    group:techniqueGroups.includes(entry.group)?entry.group:"Außendienst",
    order:Number.isFinite(Number(entry.order))?Number(entry.order):index+1,
    visible:entry.visible!==false,
    archived:entry.archived===true
  })).filter(entry=>{
    if(seen.has(entry.slug)) return false;
    seen.add(entry.slug);
    return true;
  }).sort((a,b)=>a.order-b.order);
}
function applyTechniqueManifest(raw){
  const manifest=normalizeTechniqueManifest(raw);
  equipment=manifest.map((entry,index)=>{
    const fallback=defaultEquipment.find(item=>item.slug===entry.slug);
    return {
      ...(fallback||{slug:entry.slug,name:entry.slug,category:"",detail:"",manufacturer:"",model:"",description:"",details:"",fallback:techniqueFallbackForGroup(entry.group)}),
      slug:entry.slug,key:"equipment/"+entry.slug,group:entry.group,order:index+1,visible:entry.visible,archived:entry.archived
    };
  });
}
function techniqueManifest(){
  return equipment.map((item,index)=>({slug:item.slug,group:item.group,order:index+1,visible:item.visible!==false,archived:item.archived===true}));
}
async function saveTechniqueManifest(){
  const manifest=techniqueManifest();
  await saveHeroText(techniqueManifestKey,manifest);
  technikContentCache[techniqueManifestKey]=manifest;
}
function slugifyTechnique(value){
  return String(value||"").trim().toLowerCase()
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"").slice(0,72);
}
function uniqueTechniqueSlug(name){
  const base=slugifyTechnique(name)||"technik";
  let slug=base,index=2;
  const used=new Set(equipment.map(item=>item.slug));
  while(used.has(slug)) slug=base+"-"+index++;
  return slug;
}
function refreshTechniqueSelectLabels(){
  if(!technikSelect) return;
  [...technikSelect.querySelectorAll("option[data-technik-slug]")].forEach(option=>{
    const item=techniqueBySlug(option.dataset.technikSlug);
    if(!item) return;
    const index=equipment.indexOf(item)+1;
    const name=techniqueValue(item,"name").trim()||item.name||item.slug;
    const status=item.archived?" · Archiv":(item.visible===false?" · Ausgeblendet":"");
    option.textContent=String(index).padStart(2,"0")+" · "+name+status;
  });
}
function populateTechniqueSelect(){
  if(!technikSelect) return;
  const current=activeTechnikSlug||technikSelect.value;
  technikSelect.innerHTML="";
  techniqueGroups.forEach(group=>{
    const items=equipment.filter(item=>item.group===group);
    if(!items.length) return;
    const optgroup=document.createElement("optgroup");
    optgroup.label=group;
    items.forEach(item=>{
      const option=document.createElement("option");
      option.value=item.slug;
      option.dataset.technikSlug=item.slug;
      optgroup.appendChild(option);
    });
    technikSelect.appendChild(optgroup);
  });
  refreshTechniqueSelectLabels();
  const next=equipment.some(item=>item.slug===current)?current:(equipment[0]?.slug||"");
  technikSelect.value=next;
  activeTechnikSlug=next;
}
function setTechniqueDirty(card,dirty=true,source="content"){
  if(!card)return;
  if(source==="crop")card.dataset.technikCropDirty=dirty?"1":"0";
  else card.dataset.technikContentDirty=dirty?"1":"0";
  const badge=card.querySelector(".technik-dirty-badge");
  if(badge)badge.hidden=!(card.dataset.technikContentDirty==="1"||card.dataset.technikCropDirty==="1");
}
async function deleteTechniqueContent(item){
  const headers=adminHeaders();
  for(const field of techniqueTextFields){
    const response=await fetch(contentUrl(techniqueContentKey(item,field)),{method:"DELETE",headers});
    if(!response.ok&&response.status!==404){
      const data=await response.json().catch(()=>({}));
      throw new Error(data.error||("HTTP "+response.status));
    }
  }
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
  const groupField=node.querySelector('[data-technique-meta="group"]');
  const visibilityButton=node.querySelector(".technik-visibility");
  const archiveButton=node.querySelector(".technik-archive");
  const duplicateButton=node.querySelector(".technik-duplicate");
  const moveUp=node.querySelector(".technik-up");
  const moveDown=node.querySelector(".technik-down");
  const permanentDelete=node.querySelector(".technik-delete");
  const visibleBadge=node.querySelector(".technik-visible-badge");
  const archiveBadge=node.querySelector(".technik-archive-badge");
  const orderLabel=node.querySelector(".technik-order");
  const fields={};

  techniqueGroups.forEach(group=>{
    const option=document.createElement("option");
    option.value=group; option.textContent=group; groupField.appendChild(option);
  });
  groupField.value=item.group;
  techniqueTextFields.forEach(field=>{
    const input=node.querySelector('[data-technique-field="'+field+'"]');
    if(input){input.value=techniqueValue(item,field);fields[field]=input;input.addEventListener("input",()=>setTechniqueDirty(card,true));}
  });
  groupField.addEventListener("change",()=>setTechniqueDirty(card,true));

  const displayName=techniqueValue(item,"name").trim()||item.name||item.slug;
  const displayCategory=techniqueValue(item,"category").trim()||item.category||"Technik";
  heading.textContent=displayName; categoryLabel.textContent=displayCategory;
  indexLabel.textContent=String(equipment.indexOf(item)+1).padStart(2,"0");
  mediaKey.textContent=item.key; orderLabel.textContent=String(equipment.indexOf(item)+1); card.dataset.technikSlug=item.slug; card.dataset.mediaKey=item.key;
  visibleBadge.textContent=item.visible===false?"Ausgeblendet":"Sichtbar";
  visibleBadge.classList.toggle("is-off",item.visible===false);
  archiveBadge.hidden=!item.archived;
  archiveButton.textContent=item.archived?"Aus Archiv holen":"Archivieren";
  visibilityButton.textContent=item.visible===false?"Einblenden":"Ausblenden";
  permanentDelete.hidden=!item.archived;
  moveUp.disabled=equipment.indexOf(item)===0;
  moveDown.disabled=equipment.indexOf(item)===equipment.length-1;

  const techniqueFallback=techniqueFallbackSrc(item);
  img.src=cmsMediaEnabled?initialMediaSrc(item):techniqueFallback; img.alt=displayName;
  img.onerror=()=>{img.onerror=null;img.src=techniqueFallback};
  attachMediaCropEditor(card,img,item,mediaStatus);
  card.addEventListener("cms-crop-dirty-change",event=>{
    setTechniqueDirty(card,Boolean(event.detail?.dirty),"crop");
  });

  file.addEventListener("change",()=>{
    const selected=file.files?.[0]; if(!selected) return;
    img.src=URL.createObjectURL(selected); setStatus(mediaStatus,selected.name+" ausgewählt.");
  });
  upload.addEventListener("click",async()=>{
    const selected=file.files?.[0];
    if(!selected) return setStatus(mediaStatus,"Bitte zuerst ein Bild auswählen.",false);
    if(!getApi()||!hasAdminAuth()) return setStatus(mediaStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    upload.disabled=true; setStatus(mediaStatus,"Upload läuft …");
    try{
      const response=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
        method:"PUT",headers:await mediaUploadHeaders(selected),body:selected
      });
      const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
      img.src=mediaUrl(item.key)+"?v="+Date.now(); setStatus(mediaStatus,"Bild erfolgreich in Cloudflare gespeichert.",true);
    }catch(error){setStatus(mediaStatus,"Upload fehlgeschlagen: "+error.message,false)}finally{upload.disabled=false}
  });
  reset.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(mediaStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    if(!confirm("Cloudflare-Bild für „"+displayName+"“ löschen? Der lokale Fallback bleibt erhalten.")) return;
    reset.disabled=true; setStatus(mediaStatus,"Lösche Cloudflare-Bild …");
    try{
      const response=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{method:"DELETE",headers:adminHeaders()});
      const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
      img.src=techniqueFallback; file.value=""; setStatus(mediaStatus,"Cloudflare-Bild gelöscht; Fallback wird verwendet.",true);
    }catch(error){setStatus(mediaStatus,"Löschen fehlgeschlagen: "+error.message,false)}finally{reset.disabled=false}
  });
  save.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(textStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    save.disabled=true; setStatus(textStatus,"Speichere Technik …");
    try{
      const values={}; techniqueTextFields.forEach(field=>{values[field]=fields[field]?.value.trim()||""});
      item.group=techniqueGroups.includes(groupField.value)?groupField.value:item.group;
      await Promise.all(techniqueTextFields.map(field=>saveHeroText(techniqueContentKey(item,field),values[field])));
      techniqueTextFields.forEach(field=>{technikContentCache[techniqueContentKey(item,field)]=values[field]});
      await saveTechniqueManifest();
      await savePendingMediaCrop(card);
      heading.textContent=values.name||item.name||item.slug; categoryLabel.textContent=values.category||item.category||"Technik"; img.alt=values.name||item.name||item.slug;
      populateTechniqueSelect(); technikSelect.value=item.slug; setTechniqueDirty(card,false,"content"); setStatus(textStatus,"Technik-Eintrag erfolgreich gespeichert.",true);
    }catch(error){setStatus(textStatus,"Speichern fehlgeschlagen: "+error.message,false)}finally{save.disabled=false}
  });
  reload.addEventListener("click",()=>loadTechniqueTexts());
  visibilityButton.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(textStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    const old=item.visible; item.visible=item.visible===false;
    try{
      await saveTechniqueManifest(); populateTechniqueSelect(); technikSelect.value=item.slug; renderTechniqueEditor(item);
      setStatus(technikEditor.querySelector(".technik-text-status"),item.visible?"Eintrag ist öffentlich sichtbar.":"Eintrag ist öffentlich ausgeblendet.",true);
    }catch(error){item.visible=old;setStatus(textStatus,"Sichtbarkeit konnte nicht gespeichert werden: "+error.message,false)}
  });
  archiveButton.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(textStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    if(!item.archived&&!confirm("„"+displayName+"“ archivieren? Der Eintrag verschwindet von der öffentlichen Website.")) return;
    const oldArchived=item.archived,oldVisible=item.visible; item.archived=!item.archived; if(item.archived)item.visible=false;
    try{
      await saveTechniqueManifest(); populateTechniqueSelect(); technikSelect.value=item.slug; renderTechniqueEditor(item);
      setStatus(technikEditor.querySelector(".technik-text-status"),item.archived?"Eintrag archiviert.":"Eintrag aus dem Archiv geholt.",true);
    }catch(error){item.archived=oldArchived;item.visible=oldVisible;setStatus(textStatus,"Archivstatus konnte nicht gespeichert werden: "+error.message,false)}
  });
  duplicateButton.addEventListener("click",async()=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(textStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    const copiedName=(techniqueValue(item,"name")||item.name||item.slug)+" Kopie";
    const slug=uniqueTechniqueSlug(copiedName);
    const copy={...item,slug,key:"equipment/"+slug,name:copiedName,fallback:techniqueFallbackForGroup(item.group),visible:false,archived:false,order:equipment.length+1};
    duplicateButton.disabled=true;
    try{
      equipment.push(copy);
      for(const field of techniqueTextFields){
        const value=field==="name"?copiedName:techniqueValue(item,field);
        technikContentCache[techniqueContentKey(copy,field)]=value; await saveHeroText(techniqueContentKey(copy,field),value);
      }
      await saveTechniqueManifest(); populateTechniqueSelect(); activeTechnikSlug=slug; technikSelect.value=slug; renderTechniqueEditor(copy);
      setStatus(technikEditor.querySelector(".technik-text-status"),"Kopie angelegt und zunächst ausgeblendet.",true);
    }catch(error){equipment=equipment.filter(entry=>entry.slug!==slug);setStatus(textStatus,"Duplizieren fehlgeschlagen: "+error.message,false)}finally{duplicateButton.disabled=false}
  });
  const move=async direction=>{
    if(!getApi()||!hasAdminAuth()) return setStatus(textStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    const index=equipment.indexOf(item),target=index+direction; if(target<0||target>=equipment.length)return;
    [equipment[index],equipment[target]]=[equipment[target],equipment[index]];
    try{
      await saveTechniqueManifest(); populateTechniqueSelect(); technikSelect.value=item.slug; renderTechniqueEditor(item);
      setStatus(technikEditor.querySelector(".technik-text-status"),"Reihenfolge gespeichert.",true);
    }catch(error){[equipment[index],equipment[target]]=[equipment[target],equipment[index]];setStatus(textStatus,"Reihenfolge konnte nicht gespeichert werden: "+error.message,false)}
  };
  moveUp.addEventListener("click",()=>move(-1)); moveDown.addEventListener("click",()=>move(1));
  permanentDelete.addEventListener("click",async()=>{
    if(!item.archived) return;
    if(!getApi()||!hasAdminAuth()) return setStatus(textStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
    if(!confirm("„"+displayName+"“ endgültig aus dem CMS entfernen? Dieser Schritt kann nicht rückgängig gemacht werden.")) return;
    permanentDelete.disabled=true;
    const previousEquipment=equipment.slice();
    equipment=equipment.filter(entry=>entry.slug!==item.slug);
    try{
      await saveTechniqueManifest();
    }catch(error){
      equipment=previousEquipment;populateTechniqueSelect();technikSelect.value=item.slug;renderTechniqueEditor(item);
      return setStatus(technikEditor.querySelector(".technik-text-status"),"Löschen abgebrochen: Technik-Manifest konnte nicht gespeichert werden: "+error.message,false);
    }
    const cleanupErrors=[];
    try{
      const mediaResponse=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{method:"DELETE",headers:adminHeaders()});
      if(!mediaResponse.ok&&mediaResponse.status!==404){const d=await mediaResponse.json().catch(()=>({}));throw new Error(d.error||("Medien-HTTP "+mediaResponse.status))}
    }catch(error){cleanupErrors.push("Bild")}
    try{await deleteTechniqueContent(item)}catch(error){cleanupErrors.push("Texte")}
    techniqueTextFields.forEach(field=>delete technikContentCache[techniqueContentKey(item,field)]);
    activeTechnikSlug=equipment[0]?.slug||"";populateTechniqueSelect();
    if(equipment.length){
      renderTechniqueEditor(equipment[0]);
      setStatus(technikEditor.querySelector(".technik-text-status"),cleanupErrors.length?"Technik-Eintrag entfernt. Einzelne Cloudflare-Daten konnten nicht vollständig bereinigt werden.":"Technik-Eintrag endgültig entfernt.",cleanupErrors.length===0);
    }else{
      technikEditor.innerHTML='<div class="cms-subpanel empty-state"><h3>Noch keine Technik-Einträge</h3><p>Lege ein neues Gerät oder eine Software an.</p></div>';
    }
  });
  technikEditor.appendChild(node);
}
async function loadTechniqueTexts(){
  if(!technikEditor) return;
  const previousSlug=activeTechnikSlug||technikSelect?.value;
  if(!getApi()){
    technikContentCache={}; applyTechniqueManifest(null); populateTechniqueSelect();
    const current=techniqueBySlug(previousSlug)||equipment[0]; if(current)renderTechniqueEditor(current);
    return setStatus(technikEditor.querySelector(".technik-text-status"),"Worker-URL fehlt; Fallback-Technik wird angezeigt.",false);
  }
  setStatus(technikEditor.querySelector(".technik-text-status"),"Lade Technik …");
  try{
    const response=await fetchSiteSnapshot(); if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json(); technikContentCache=data.content||{}; applyTechniqueManifest(technikContentCache[techniqueManifestKey]); populateTechniqueSelect();
    const current=techniqueBySlug(previousSlug)||equipment[0];
    if(current){activeTechnikSlug=current.slug;technikSelect.value=current.slug;renderTechniqueEditor(current);setStatus(technikEditor.querySelector(".technik-text-status"),Array.isArray(technikContentCache[techniqueManifestKey])?"Technik-Manifest und Texte geladen.":"Fallback-Manifest aktiv; beim nächsten Speichern wird es in D1 angelegt.",true)}
    else{activeTechnikSlug="";technikEditor.innerHTML='<div class="cms-subpanel empty-state"><h3>Noch keine Technik-Einträge</h3><p>Das Technik-Manifest ist leer. Lege ein neues Gerät oder eine Software an.</p></div>'}
  }catch(error){
    technikContentCache={};applyTechniqueManifest(null);populateTechniqueSelect();const current=techniqueBySlug(previousSlug)||equipment[0];if(current)renderTechniqueEditor(current);
    setStatus(technikEditor.querySelector(".technik-text-status"),"CMS konnte nicht geladen werden; vollständiger Fallback aktiv: "+error.message,false);
  }
}
function openTechniqueCreatePanel(){if(!technikCreatePanel)return;technikCreatePanel.hidden=false;technikCreateName.value="";technikCreateGroup.value="Außendienst";setStatus(technikCreateStatus,"");technikCreateName.focus()}
function closeTechniqueCreatePanel(){if(!technikCreatePanel)return;technikCreatePanel.hidden=true;setStatus(technikCreateStatus,"")}
async function createTechnique(){
  const name=technikCreateName?.value.trim()||"",group=technikCreateGroup?.value||"Außendienst";
  if(!name)return setStatus(technikCreateStatus,"Bitte einen Anzeigenamen eingeben.",false);
  if(!getApi()||!hasAdminAuth())return setStatus(technikCreateStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
  const slug=uniqueTechniqueSlug(name);
  const item={slug,group:techniqueGroups.includes(group)?group:"Außendienst",key:"equipment/"+slug,name,category:"",detail:"",manufacturer:"",model:"",description:"",details:"",fallback:techniqueFallbackForGroup(group),visible:false,archived:false,order:equipment.length+1};
  technikCreateSave.disabled=true;setStatus(technikCreateStatus,"Lege Eintrag an …");
  try{
    equipment.push(item);const initialValues={name,category:"",manufacturer:"",model:"",description:"",details:""};
    await Promise.all(techniqueTextFields.map(field=>saveHeroText(techniqueContentKey(item,field),initialValues[field])));
    Object.entries(initialValues).forEach(([field,value])=>{technikContentCache[techniqueContentKey(item,field)]=value});
    await saveTechniqueManifest();populateTechniqueSelect();activeTechnikSlug=slug;technikSelect.value=slug;closeTechniqueCreatePanel();renderTechniqueEditor(item);
    setStatus(technikEditor.querySelector(".technik-text-status"),"Neuer Eintrag angelegt und zunächst ausgeblendet. Ergänze die Angaben und lade ein Bild hoch.",true);history.replaceState(null,"","#"+encodeURIComponent(slug));
  }catch(error){equipment=equipment.filter(entry=>entry.slug!==slug);setStatus(technikCreateStatus,"Anlegen fehlgeschlagen: "+error.message,false)}finally{technikCreateSave.disabled=false}
}
function setupTechniqueEditor(){
  if(!technikSelect||!technikEditor||!technikEditorTemplate)return;
  applyTechniqueManifest(null);populateTechniqueSelect();
  const hashSlug=decodeURIComponent(location.hash.replace(/^#/,""));const initial=equipment.some(item=>item.slug===hashSlug)?hashSlug:equipment[0]?.slug;
  activeTechnikSlug=initial||"";technikSelect.value=activeTechnikSlug;const initialItem=techniqueBySlug(activeTechnikSlug);if(initialItem)renderTechniqueEditor(initialItem);
  technikSelect.addEventListener("change",()=>{activeTechnikSlug=technikSelect.value;history.replaceState(null,"","#"+encodeURIComponent(activeTechnikSlug));renderTechniqueEditor(techniqueBySlug(activeTechnikSlug))});
  technikAddButton?.addEventListener("click",openTechniqueCreatePanel);technikCreateCancel?.addEventListener("click",closeTechniqueCreatePanel);technikCreateSave?.addEventListener("click",createTechnique);
  technikCreateName?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();createTechnique()}});
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
    card.dataset.mediaKey=item.key;

    title.textContent=item.name;
    detail.textContent=item.detail;

    const fallbackPlaceholder="../assets/dummy-aussendienst-02.svg";
    function showFallback(){
      const fallbackUrl=new URL(item.fallback,document.baseURI).href;
      img.onerror=()=>{
        img.onerror=null;
        img.src=new URL(fallbackPlaceholder,document.baseURI).href;
        setStatus(status,"Initialbild konnte nicht geladen werden; neutrale Vorschau aktiv.",false);
      };
      img.src=fallbackUrl;
    }

    if(cmsAccessMode&&getApi()){
      loadProtectedMediaIntoImage(img,item.key,item.fallback).catch(showFallback);
    }else if(getApi()&&cmsMediaEnabled){
      img.onerror=showFallback;
      img.src=mediaUrl(item.key);
    }else{
      showFallback();
    }

    let previewObjectUrl="";
    file.addEventListener("change",()=>{
      const selected=file.files?.[0];
      if(!selected) return;
      if(previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl=URL.createObjectURL(selected);
      img.onerror=()=>{
        img.onerror=null;
        showFallback();
        setStatus(status,"Die ausgewählte Datei konnte nicht als Bildvorschau geladen werden.",false);
      };
      img.src=previewObjectUrl;
      setStatus(status,selected.name+" ausgewählt · lokale Vorschau.");
    });

    upload.addEventListener("click",async()=>{
      const selected=file.files?.[0];
      if(!selected) return setStatus(status,"Bitte zuerst ein Bild auswählen.",false);
      if(!getApi()||!hasAdminAuth()) return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);

      upload.disabled=true;
      setStatus(status,"Upload läuft …");
      try{
        const r=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
          method:"PUT",
          headers:await mediaUploadHeaders(selected),
          credentials:"include",
          body:selected
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data.error||("HTTP "+r.status));
        if(cmsAccessMode){
          const readable=await loadProtectedMediaIntoImage(img,item.key,item.fallback);
          if(!readable)throw new Error("Bild wurde gespeichert, konnte aber nicht wieder aus R2 geladen werden.");
          if(previewObjectUrl){
            URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl="";
          }
          file.value="";
          setStatus(status,"Bild gespeichert und aus R2 bestätigt.",true);
        }else if(cmsMediaEnabled){
          img.onerror=showFallback;
          img.src=mediaUrl(item.key)+"?v="+Date.now();
          file.value="";
          setStatus(status,"Bild erfolgreich in Cloudflare gespeichert.",true);
        }else{
          setStatus(status,"Bild erfolgreich in R2 gespeichert.",true);
        }
      }catch(e){
        setStatus(status,"Upload fehlgeschlagen: "+e.message,false);
      }finally{
        upload.disabled=false;
      }
    });

    reset.addEventListener("click",async()=>{
      if(!getApi()||!hasAdminAuth()) return setStatus(status,"Worker-URL oder Admin-Anmeldung fehlt.",false);
      if(!confirm("Cloudflare-Bild „"+item.name+"“ löschen? Danach wird der hinterlegte Fallback angezeigt.")) return;
      reset.disabled=true;
      setStatus(status,"Lösche Cloudflare-Bild …");
      try{
        const r=await fetch(getApi()+"/api/admin/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
          method:"DELETE",
          headers:adminHeaders()
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data.error||("HTTP "+r.status));
        if(previewObjectUrl){
          URL.revokeObjectURL(previewObjectUrl);
          previewObjectUrl="";
        }
        file.value="";
        showFallback();
        setStatus(status,"Cloudflare-Bild gelöscht; Initialbild wird angezeigt.",true);
      }catch(e){
        setStatus(status,"Löschen fehlgeschlagen: "+e.message,false);
      }finally{
        reset.disabled=false;
      }
    });

    attachMediaCropEditor(card,img,item,status);
    target.appendChild(node);
  }
}


function render(){
  renderCollection(startPageGrid, startPageImages.filter(item=>item.key==="startseite/hero"));
  renderCollection(startPageTileGrid, startPageImages.filter(item=>item.key!=="startseite/hero"));

  renderCollection(service1Grid, serviceImages.filter(item=>item.key==="leistungen/ingenieurvermessung"));
  renderCollection(service2Grid, serviceImages.filter(item=>item.key==="leistungen/gis-bauvermessung"));
  renderCollection(service3Grid, serviceImages.filter(item=>item.key==="leistungen/3d-laserscanning"));
  renderCollection(service4Grid, serviceImages.filter(item=>item.key==="leistungen/drohnenvermessung"));

  renderCollection(servicePage1Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/ingenieurvermessung/")));
  renderCollection(servicePage2Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/gis-bauvermessung/")));
  renderCollection(servicePage3Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/3d-laserscanning/")));
  renderCollection(servicePage4Grid, servicePageImages.filter(item=>item.key.startsWith("leistungsseiten/drohnenvermessung/")));

  renderCollection(companyGrid, companyImages);
  renderCollection(techniqueGroupGrid, techniqueGroupImages);
  renderCollection(grid, equipment);
  renderCollection(projectGrid, projects);
}

showMediaModeNotice();
render();
setupTechniqueEditor();
setupProjectEditor();
setupServiceListEditors();
setupServiceFlyover();
loadHeroTexts();
loadServiceTexts();
loadCompanyTexts();
loadCompanyTimeline();
loadContactTexts();
loadImprintTexts();
loadServiceContactTexts();
loadEngineerPageTexts();
loadGisPageTexts();
loadScanPageTexts();
loadDronePageTexts();
window.GUDELIUS_ADMIN_CORE=Object.freeze({
  getApi,
  hasAdminAuth,
  adminHeaders,
  setStatus
});

const adminNavInner=document.querySelector(".admin-nav-inner");
function adminAreaUrl(page){
  const api=getApi();
  if(api)return api+"/admin/"+page+"/";
  const root=window.GUDELIUS_ADMIN_APP_URL||new URL("./",location.href).toString();
  return new URL(page+"/",root).toString();
}
if(adminNavInner){
  const ensureNavLink=(page,label)=>{
    let link=adminNavInner.querySelector('[data-page="'+page+'"]');
    if(!link){
      link=document.createElement("a");
      link.className="admin-nav-link";
      link.dataset.page=page;
      link.textContent=label;
      adminNavInner.appendChild(link);
    }
    link.href=adminAreaUrl(page);
    return link;
  };
  ensureNavLink("medien","Medien");
  ensureNavLink("impressum","Impressum");
  ensureNavLink("audit","Audit-Log");
}
document.querySelectorAll('a[href="./audit/"],a[href="../audit/"],a[href="/audit/"],a[href="/admin/audit/"]').forEach(link=>{link.href=adminAreaUrl("audit")});
document.querySelectorAll('a[href="./impressum/"],a[href="../impressum/"],a[href="/admin/impressum/"]').forEach(link=>{link.href=adminAreaUrl("impressum")});
const adminNavLinks=[...document.querySelectorAll(".admin-nav-link")];
const activeAdminPage=document.body.dataset.adminPage||"";

adminNavLinks.forEach(link=>{
  const page=link.dataset.page||"";
  link.classList.toggle("active",page===activeAdminPage);
});
setTimeout(()=>consumePendingDraftJump(),450);
