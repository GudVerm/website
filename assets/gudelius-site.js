document.addEventListener('DOMContentLoaded', () => {
  const cmsApi = (window.GUDELIUS_CMS_API || "").replace(/\/$/, "");
  const cmsMediaEnabled = window.GUDELIUS_CMS_MEDIA_ENABLED !== false;
  let cmsSiteContentPromise=null;

  async function loadCmsSiteContent(){
    if(!cmsApi) return null;
    if(!cmsSiteContentPromise){
      cmsSiteContentPromise=fetch(cmsApi+"/api/site")
        .then(async response=>{
          if(!response.ok) throw new Error("HTTP "+response.status);
          const data=await response.json();
          return data.content||{};
        })
        .catch(error=>{
          cmsSiteContentPromise=null;
          throw error;
        });
    }
    return cmsSiteContentPromise;
  }


  function normalizeAnalyticsPath(pathname=window.location.pathname){
    let path=String(pathname||"/").split("?")[0].split("#")[0].replace(/\/+/g,"/");
    if(path==="/website") path="/";
    if(path.startsWith("/website/")) path=path.slice("/website".length);
    if(!path.startsWith("/")) path="/"+path;
    if(path.length>1&&!path.endsWith("/")&&!path.includes(".")) path+="/";
    return path;
  }

  function sendAnalyticsEvent(eventType,target="",label=""){
    if(!cmsApi) return;
    const pagePath=normalizeAnalyticsPath();
    if(pagePath.startsWith("/admin/")) return;

    const payload={
      event_type:String(eventType||"").slice(0,40),
      page_path:pagePath,
      target:String(target||"").slice(0,80),
      event_label:String(label||"").slice(0,140)
    };
    const body=JSON.stringify(payload);
    try{
      if(navigator.sendBeacon){
        const blob=new Blob([body],{type:"text/plain;charset=UTF-8"});
        if(navigator.sendBeacon(cmsApi+"/api/analytics/event",blob)) return;
      }
      fetch(cmsApi+"/api/analytics/event",{
        method:"POST",
        headers:{"content-type":"text/plain;charset=UTF-8"},
        body,
        keepalive:true
      }).catch(()=>{});
    }catch{}
  }

  window.gudeliusTrack=sendAnalyticsEvent;

  function serviceSlugFromHref(href){
    try{
      const path=new URL(href,window.location.href).pathname;
      const match=path.match(/\/leistungen\/([^/]+)\/?$/);
      return match?.[1]||"";
    }catch{return ""}
  }

  document.addEventListener("click",(event)=>{
    const target=event.target.closest("a,button,.service-card");
    if(!target) return;

    const marked=target.closest("[data-analytics-event]");
    if(marked){
      sendAnalyticsEvent(
        marked.dataset.analyticsEvent,
        marked.dataset.analyticsTarget||"",
        marked.dataset.analyticsLabel||marked.textContent.trim()
      );
      return;
    }

    const anchor=target.closest("a");
    const href=anchor?.getAttribute("href")||"";

    if(anchor&&href.startsWith("tel:")){
      sendAnalyticsEvent("contact_action","phone","Telefon");
      return;
    }
    if(anchor&&href.startsWith("mailto:")){
      sendAnalyticsEvent("contact_action","email","E-Mail");
      return;
    }

    const serviceCard=target.closest(".service-card");
    const serviceLink=serviceCard?.dataset.href||href;
    const serviceSlug=serviceSlugFromHref(serviceLink);
    if(serviceSlug){
      const label=serviceCard?.querySelector("h3")?.textContent?.trim()||anchor?.textContent?.trim()||serviceSlug;
      sendAnalyticsEvent("service_open",serviceSlug,label);
      return;
    }

    if(anchor?.classList.contains("flyover-item")){
      const slug=serviceSlugFromHref(href);
      if(slug) sendAnalyticsEvent("service_open",slug,anchor.querySelector("strong")?.textContent?.trim()||slug);
      return;
    }

    if(anchor?.classList.contains("btn")){
      if(href.includes("#kontakt")) sendAnalyticsEvent("cta_click","contact",anchor.textContent.trim());
      else if(href.includes("#leistungen")) sendAnalyticsEvent("cta_click","services",anchor.textContent.trim());
      else sendAnalyticsEvent("cta_click","button",anchor.textContent.trim());
      return;
    }

    if(anchor&&href.includes("#kontakt")){
      sendAnalyticsEvent("cta_click","contact",anchor.textContent.trim()||"Kontakt");
      return;
    }

    if(anchor&&anchor.closest("header nav")){
      const label=anchor.textContent.replace(/\s+/g," ").trim().slice(0,140);
      sendAnalyticsEvent("nav_click","navigation",label);
    }
  },{passive:true});

  sendAnalyticsEvent("pageview","","");


  function cmsMediaUrl(key) {
    return cmsApi + "/media/" + key.split("/").map(encodeURIComponent).join("/");
  }

  function applyCmsMedia(root = document) {
    if (!cmsApi || !cmsMediaEnabled) return;
    root.querySelectorAll("img[data-cms-media]").forEach((img) => {
      if (img.dataset.cmsApplied === "1") return;
      const fallback = img.currentSrc || img.src;
      img.dataset.cmsApplied = "1";
      img.addEventListener("error", function restoreFallback() {
        img.removeEventListener("error", restoreFallback);
        img.src = fallback;
      });
      img.src = cmsMediaUrl(img.dataset.cmsMedia);
    });

    root.querySelectorAll("[data-cms-bg]").forEach((element) => {
      if (element.dataset.cmsApplied === "1") return;
      element.dataset.cmsApplied = "1";
      const image = new Image();
      image.onload = () => {
        const url = cmsMediaUrl(element.dataset.cmsBg);
        if (element.classList.contains("hero")) {
          element.style.setProperty("--hero-image", `url("${url}")`);
        } else if (element.classList.contains("service-hero")) {
          element.style.setProperty("--service-image", `url("${url}")`);
        } else {
          element.style.backgroundImage = `url("${url}")`;
          element.removeAttribute("data-bg");
          element.classList.remove("lazy-bg");
        }
      };
      image.src = cmsMediaUrl(element.dataset.cmsBg);
    });
  }

  applyCmsMedia();

  async function applyCmsText(root = document) {
    if (!cmsApi) return;
    const elements = [...root.querySelectorAll("[data-cms-text]")];
    const hasCmsContent=elements.length||root.querySelector("[data-cms-list],[data-cms-timeline],[data-cms-link],[data-cms-placeholder],[data-cms-value]");
    if (!hasCmsContent) return;

    try {
      const content = await loadCmsSiteContent();
      if(!content) return;

      root.querySelectorAll("[data-cms-list]").forEach((container)=>{
        const items=content[container.dataset.cmsList];if(!Array.isArray(items))return;
        const cleaned=items.filter(value=>typeof value==="string"&&value.trim()).map(value=>value.trim());
        if(container.matches("ul")){container.innerHTML="";cleaned.forEach(value=>{const li=document.createElement("li");li.textContent=value;container.appendChild(li)})}
        else if(container.classList.contains("scope-grid")){container.innerHTML="";cleaned.forEach((value,index)=>{const item=document.createElement("div");item.className="scope-item";const no=document.createElement("span");no.className="scope-no";no.textContent=String(index+1).padStart(2,"0");const strong=document.createElement("strong");strong.textContent=value;item.append(no,strong);container.appendChild(item)})}
      });


      root.querySelectorAll("[data-cms-timeline]").forEach((container)=>{
        const items=content[container.dataset.cmsTimeline];if(!Array.isArray(items))return;
        const visible=items.filter(item=>item&&item.visible!==false&&(item.period||item.text||item.description));
        container.innerHTML="";
        visible.forEach(item=>{
          const row=document.createElement("div");
          const period=document.createElement("b");period.textContent=String(item.period||"");
          const title=document.createElement("span");title.textContent=String(item.text||"");
          row.append(period,title);
          if(item.description){const description=document.createElement("small");description.textContent=String(item.description);row.appendChild(description)}
          container.appendChild(row);
        });
      });

      elements.forEach((element) => {
        const value = content[element.dataset.cmsText];
        if (typeof value === "string" && value.trim()) {
          element.textContent = value;
        }
      });

      root.querySelectorAll("[data-cms-link]").forEach((element) => {
        const value = content[element.dataset.cmsLink];
        if (typeof value !== "string" || !value.trim()) return;

        const type = element.dataset.cmsLinkType;
        if (type === "mailto") {
          element.href = "mailto:" + value.trim();
        } else if (type === "tel") {
          const normalized = value.trim().replace(/[^+\d]/g, "");
          element.href = "tel:" + normalized;
        }
      });

      root.querySelectorAll("[data-cms-placeholder]").forEach((element) => {
        const value = content[element.dataset.cmsPlaceholder];
        if (typeof value === "string" && value.trim()) {
          element.setAttribute("placeholder", value);
        }
      });

      root.querySelectorAll("[data-cms-value]").forEach((element) => {
        const value = content[element.dataset.cmsValue];
        if (typeof value === "string" && value.trim()) {
          element.value = value;
        }
      });

      if (typeof content["kontakt/email"] === "string" && content["kontakt/email"].trim()) {
        window.GUDELIUS_CONTACT_EMAIL = content["kontakt/email"].trim();
      }
    } catch (error) {
      console.warn("CMS-Texte konnten nicht geladen werden.", error);
    }
  }

  applyCmsText();

  const lazyBackgrounds = document.querySelectorAll('.lazy-bg[data-bg]');

  const loadBackground = (element) => {
    if (!element?.dataset?.bg) return;
    element.style.backgroundImage = `url("${element.dataset.bg}")`;
    element.removeAttribute('data-bg');
    element.classList.remove('lazy-bg');
  };

  if ('IntersectionObserver' in window) {
    const backgroundObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadBackground(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });

    lazyBackgrounds.forEach((element) => backgroundObserver.observe(element));
  } else {
    lazyBackgrounds.forEach(loadBackground);
  }

  const menuBtn = document.getElementById('menuBtn');
  const navlinks = document.getElementById('navlinks');
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const mobileQuery = window.matchMedia('(max-width: 1000px)');

  if (menuBtn && navlinks) {
    menuBtn.addEventListener('click', () => {
      navlinks.classList.toggle('open');
    });

    navlinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach((a) => {
      a.addEventListener('click', () => {
        navlinks.classList.remove('open');
        dropdowns.forEach((dropdown) => dropdown.classList.remove('open'));
      });
    });
  }

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      if (!mobileQuery.matches) return;
      event.preventDefault();
      const willOpen = !dropdown.classList.contains('open');
      dropdowns.forEach((item) => item.classList.remove('open'));
      dropdown.classList.toggle('open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!mobileQuery.matches || event.target.closest('.nav-dropdown')) return;
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('open');
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.service-card[data-href]').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      window.location.href = card.dataset.href;
    });
  });



  const projectDisplayTitles={
    "ingenieur-bauvermessung":"Ingenieur- & Bauvermessung",
    "3d-laserscanning":"3D-Bestandsaufnahme & Laserscanning",
    "rtk-drohnenvermessung":"RTK-Drohnenvermessung",
    "gelaende-gewaesser":"Gelände- & Gewässervermessung",
    "mobiler-einsatz":"Mobiler Projekteinsatz",
    "bestand-planung":"Bestandsaufnahme & Planungsgrundlagen"
  };
  const projectDisplayMeta={
    "ingenieur-bauvermessung":"Absteckung · Kontrolle · Bestand",
    "3d-laserscanning":"Punktwolke · Aufmaß · Dokumentation",
    "rtk-drohnenvermessung":"Orthophoto · Fläche · Geländedaten",
    "gelaende-gewaesser":"Topografie · Bestand · Geländemodell",
    "mobiler-einsatz":"Datenkontrolle · Auswertung vor Ort",
    "bestand-planung":"Aufmaß · Bestand · Weiterverarbeitung"
  };
  function projectDisplayTitle(slug,value){
    const text=String(value||"").trim();
    if(!text||text===slug||text.toLowerCase()===slug.replace(/-/g," ")||text===text.toLocaleLowerCase("de-DE")||/^[a-z0-9äöüß]+(?:[- ][a-z0-9äöüß]+)+$/.test(text)){
      return projectDisplayTitles[slug]||text.replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());
    }
    return text;
  }

  async function loadDynamicProjects(){
    const grid=document.querySelector('.projects-grid');
    if(!cmsApi||!grid)return;
    const fallbackCards=[...grid.children].map(card=>({
      slug:card.querySelector('[data-cms-media]')?.dataset.cmsMedia?.replace(/^projects\//,'')||'',
      image:card.querySelector('img')?.getAttribute('src')||''
    }));
    try{
      const content=await loadCmsSiteContent();if(!content)return;
      const manifest=content['projekte/index'];
      if(!Array.isArray(manifest))return;
      const fallbackMap=new Map(fallbackCards.map(item=>[item.slug,item]));
      const items=manifest.filter(entry=>entry&&typeof entry.slug==='string'&&entry.visible!==false&&entry.archived!==true)
        .sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
      if(!items.length){grid.innerHTML='';return}
      grid.innerHTML='';
      items.forEach(entry=>{
        const slug=entry.slug,fallback=fallbackMap.get(slug)||{},rawTitle=typeof content['projekte/'+slug+'/title']==='string'?content['projekte/'+slug+'/title']:'';
        const title=projectDisplayTitle(slug,rawTitle),location=typeof content['projekte/'+slug+'/location']==='string'?content['projekte/'+slug+'/location']:'',year=typeof content['projekte/'+slug+'/year']==='string'?content['projekte/'+slug+'/year']:'';
        const card=document.createElement('div');card.className='project';card.dataset.project=slug;if(entry.featured)card.dataset.featured='true';
        const img=document.createElement('img');img.src=fallback.image||'assets/dummy-aussendienst-02.svg';img.dataset.cmsMedia='projects/'+slug;img.alt=title;img.loading='lazy';img.decoding='async';img.fetchPriority='low';
        const caption=document.createElement('div');caption.className='project-caption';const strong=document.createElement('strong');strong.textContent=title;caption.appendChild(strong);
        const meta=[location,year].filter(Boolean).join(' · ')||projectDisplayMeta[slug]||'';if(meta){const small=document.createElement('small');small.textContent=meta;caption.appendChild(small)}
        card.append(img,caption);grid.appendChild(card);
      });
      const featured=grid.querySelector('[data-featured="true"]');if(featured&&featured!==grid.firstElementChild)grid.prepend(featured);
      applyCmsMedia(grid);
    }catch(error){console.warn('Dynamische Projekte konnten nicht geladen werden; Fallback bleibt aktiv.',error)}
  }

  loadDynamicProjects();

  const equipmentModal = document.getElementById('equipmentModal');
  const equipmentClose = document.getElementById('equipmentModalClose');
  const equipmentTitle = document.getElementById('equipmentModalTitle');
  const equipmentKicker = document.getElementById('equipmentModalKicker');
  const equipmentLead = document.getElementById('equipmentModalLead');
  const equipmentSummary = document.getElementById('equipmentModalSummary');
  const equipmentGallery = document.getElementById('equipmentModalGallery');

  const equipmentData = {
    aussendienst: {
      kicker: 'Außendienst',
      title: 'Präzise Messtechnik vor Ort.',
      lead: 'Die Außendienst-Ausstattung folgt der Technikliste der aktuellen Gudelius-Seite. Hersteller- und Produktbilder dienen in der Beta nur als vorläufige Bildmotive.',
      summary: 'Die eigenen Gerätefotos von Jost ersetzen später diese Hersteller-/Produktbilder eins zu eins.',
      devices: [
        { slug:'trimble-sx12', name:'Trimble SX12', category:'Scanning-Totalstation', manufacturer:'Trimble', model:'SX12', description:'Scanning-Totalstation für präzise Vermessung und 3D-Datenerfassung im Außendienst.', details:'Kombiniert klassische Totalstationsmessung mit 3D-Erfassung für Absteckung, Aufnahme und Dokumentation.', image:'https://images.ctfassets.net/1nvkn1423yot/7bouK6GUtWnVuxunCfxZML/4bd3307e16c06e17b898f32965eec7db/geo-sx12-productpage-fullbackgroundproducthero-800x960.png', mediaKey:'equipment/trimble-sx12', source:'https://geospatial.trimble.com/de/products/hardware/trimble-sx12', sourceLabel:'Trimble' },
        { slug:'trimble-s6', name:'Trimble S6', category:'Robotik-Totalstation', manufacturer:'Trimble', model:'S6', description:'Robotik-Totalstation für präzise Winkel- und Streckenmessungen im Außendienst.', details:'Für Absteckung, Bestandsaufnahme und Kontrollmessungen mit motorisierter Messunterstützung.', image:'assets/equipment-trimble-s6.svg', mediaKey:'equipment/trimble-s6', source:'https://help.fieldsystems.trimble.com/trimble-access/latest/de/equipment-supported.htm', sourceLabel:'Trimble · S6 Support' },
        { slug:'trimble-r2', name:'Trimble R2 GNSS-Empfänger', category:'GNSS-Positionierung', manufacturer:'Trimble', model:'R2', description:'GNSS-Empfänger für präzise Positionsbestimmung bei Aufnahme und Absteckung.', details:'RTK- und GNSS-gestützte Vermessung für flexible Punktaufnahme im Projektumfeld.', image:'https://www.allnav.com/wp-content/uploads/2020/04/R2_4.jpg', mediaKey:'equipment/trimble-r2', source:'https://www.allnav.com/produkte/gnss-systeme/r2/', sourceLabel:'Trimble-Partner ALLNAV' },
        { slug:'trimble-dini07', name:'Trimble DiNi 07 Ingenieurnivellier', category:'Digitalnivellement', manufacturer:'Trimble', model:'DiNi 07', description:'Digitales Ingenieurnivellier für präzise Höhenmessungen und Höhenübertragungen.', details:'Geeignet für Nivellements, Kontrollmessungen und die nachvollziehbare Bestimmung von Höhenunterschieden.', image:'https://images.ctfassets.net/1nvkn1423yot/64MgxNSI4ha3AwrJajbI1D/bc2639be1307bec5571be1197bd07a1b/geo-dinilevel-productpage-fullbackgroundproducthero-800x960.png', mediaKey:'equipment/trimble-dini07', source:'https://geospatial.trimble.com/de/products/hardware/trimble-dini-level', sourceLabel:'Trimble' }
      ]
    },
    digital: {
      kicker: '3D & Drohne',
      title: 'Digitale Erfassung aus Boden und Luft.',
      lead: 'Laserscanning, RTK-Drohne, Wärmebild und photogrammetrische Auswertung bilden den digitalen Technikblock.',
      summary: 'TX8 und die Drohnenbilder werden später durch die tatsächlich verwendeten Geräteaufnahmen ersetzt.',
      devices: [
        { slug:'trimble-tx8', name:'Trimble TX8 3D-Laserscanner', category:'Terrestrisches 3D-Laserscanning', manufacturer:'Trimble', model:'TX8', description:'Terrestrischer 3D-Laserscanner für flächenhafte Bestands- und Gebäudedokumentation.', details:'Erzeugt dichte Punktwolken als Grundlage für Bestandspläne, 3D-Auswertung und Dokumentation.', image:'assets/equipment-trimble-tx8.svg', mediaKey:'equipment/trimble-tx8', source:'https://geospatial.trimble.com/de/support/discontinued-products-technical-support', sourceLabel:'Trimble · TX8 Support' },
        { slug:'rtk-drohne', name:'RTK-Drohne', category:'Vermessung & Orthophoto', manufacturer:'DJI Enterprise', model:'RTK-Drohne', description:'RTK-gestützte Drohne für großflächige Vermessung, Luftbilder und Orthophotos.', details:'Für Geländeaufnahme, Dokumentation und photogrammetrische Auswertung aus der Luft.', image:'https://www1.djicdn.com/cms/uploads/3185f8d17b7211aad1a326f604fc0022.png', mediaKey:'equipment/rtk-drohne', source:'https://enterprise.dji.com/news/detail/matrice-4-series-release', sourceLabel:'DJI Enterprise · Platzhalter' },
        { slug:'infrarotkamera', name:'RTK-Drohne mit Infrarotkamera', category:'Thermische Bildaufnahme', manufacturer:'DJI Enterprise', model:'RTK-Drohne mit Infrarotkamera', description:'Drohnenbasierte Wärmebildaufnahme zur ergänzenden visuellen und thermischen Dokumentation.', details:'Verbindet RTK-gestützte Befliegung mit Infrarotaufnahmen für projektbezogene Inspektionsaufgaben.', image:'https://www1.djicdn.com/cms/uploads/6a4fe5870d86bb43d58dcc1f364895da.png', mediaKey:'equipment/infrarotkamera', source:'https://enterprise.dji.com/news/detail/matrice-4-series-release', sourceLabel:'DJI Enterprise · Platzhalter' },
        { slug:'photogrammetrie', name:'Punktwolken & Photogrammetrie', category:'Workflow / Ergebnisdarstellung', manufacturer:'–', model:'Punktwolken & Photogrammetrie', description:'Digitaler Workflow zur Ableitung und Aufbereitung räumlicher Daten aus Scan- und Bildmaterial.', details:'Punktwolken, Orthophotos und 3D-Auswertungen werden für Planung, Bestand und Dokumentation weiterverarbeitet.', image:'https://www.agisoft.com/images/cloud-try-now.png', mediaKey:'equipment/photogrammetrie', source:'https://www.agisoft.com/', sourceLabel:'Agisoft · Platzhalter' }
      ]
    },
    software: {
      kicker: 'Programme & Arbeitsplatz',
      title: 'Auswertung und Datenaufbereitung.',
      lead: 'CAD, Tiefbauplanung, Punktwolken und Photogrammetrie werden mit den auf der Originalseite genannten Programmen abgedeckt.',
      summary: 'Bei Software zeigen die Platzhalter Hersteller- bzw. Produktmotive. Der mobile Büroarbeitsplatz bleibt als eigener visueller Eintrag erhalten.',
      devices: [
        { slug:'bricscad', name:'BricsCAD', category:'CAD-Bearbeitung', manufacturer:'Bricsys', model:'BricsCAD', description:'CAD-Software für die zeichnerische Aufbereitung und Weiterbearbeitung von Vermessungsdaten.', details:'Für 2D-/3D-CAD, Bestandspläne und projektbezogene Planbearbeitung.', image:'https://www.bbsoft.de/assets/logo/extern/octave_weiss.webp', mediaKey:'equipment/bricscad', source:'https://bricscad.octave.com/de', sourceLabel:'Octave / BricsCAD' },
        { slug:'bbsoft', name:'BBSOFT', category:'Tiefbau, Vermessung & DGM', manufacturer:'BBSOFT', model:'BBSOFT', description:'Fachsoftware für vermessungsnahe Tiefbauplanung, Geländemodelle und Massenermittlung.', details:'Unterstützt die Bearbeitung von Vermessungsdaten, DGM und projektbezogenen Tiefbauaufgaben.', image:'https://www.bbsoft.de/assets/images/uberuns/bbsoft-planung-computer.webp', mediaKey:'equipment/bbsoft', source:'https://www.bbsoft.de/', sourceLabel:'BBSoft' },
        { slug:'realworks', name:'Trimble RealWorks', category:'Punktwolken-Auswertung', manufacturer:'Trimble', model:'RealWorks', description:'Software zur Registrierung, Auswertung und Aufbereitung terrestrischer Punktwolken.', details:'Für Scanregistrierung, Punktwolkenanalyse und die Ableitung weiterverwendbarer 2D-/3D-Ergebnisse.', image:'https://images.ctfassets.net/citn2sn5tdjr/2qHLMpxFWko4vex8bZItdi/f3295ad93a3fd7aaaa384a895ab3e13e/trimble-realworks-pipes-office-laptop-2880x1440.jpg?f=right&fit=fill&fm=webp&h=810&q=85&w=1920', mediaKey:'equipment/realworks', source:'https://www.trimble.com/de/products/building-construction-field-systems/trimble-realworks', sourceLabel:'Trimble' },
        { slug:'metashape', name:'Agisoft Metashape', category:'Photogrammetrie', manufacturer:'Agisoft', model:'Metashape', description:'Photogrammetrie-Software zur Verarbeitung georeferenzierter Bilddaten.', details:'Für Bildausrichtung, Punktwolken, Oberflächenmodelle und Orthophotos aus Drohnen- und Kameradaten.', image:'https://www.agisoft.com/images/cloud-try-now.png', mediaKey:'equipment/metashape', source:'https://www.agisoft.com/', sourceLabel:'Agisoft' },
        { slug:'mobile-arbeitsplatz', name:'Mobiler Büroarbeitsplatz', category:'Auswertung direkt im Projektumfeld', manufacturer:'GudeliusVermessung', model:'Mobiler Büroarbeitsplatz', description:'Mobiler Arbeitsplatz für Datenkontrolle, Auswertung und Abstimmung direkt im Projektumfeld.', details:'Ermöglicht kurze Wege zwischen Messung, Prüfung und digitaler Weiterverarbeitung vor Ort.', image:'https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg', mediaKey:'equipment/mobile-arbeitsplatz', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' }
      ]
    }
  };

  const equipmentFallbackBySlug = new Map(Object.values(equipmentData).flatMap(group=>group.devices).map(device=>[device.slug,{...device}]));
  const equipmentGroupKeys = {'Außendienst':'aussendienst','3D & Drohne':'digital','Programme & Arbeitsplatz':'software'};
  function escapeEquipmentHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  function equipmentFallbackImage(group){if(group==='3D & Drohne')return 'assets/dummy-3d-01.svg';if(group==='Programme & Arbeitsplatz')return 'assets/dummy-software-01.svg';return 'assets/dummy-aussendienst-01.svg'}
  function equipmentCmsValue(content,slug,field,fallback=''){const value=content['technik/'+slug+'/'+field];return typeof value==='string'?value:fallback}
  function renderDynamicEquipmentOverview(){
    document.querySelectorAll('.equip-open[data-equipment]').forEach(card=>{
      const group=equipmentData[card.dataset.equipment];if(!group)return;
      const devices=group.devices||[];card.hidden=!devices.length;if(!devices.length)return;
      const main=card.querySelector(':scope > img');
      if(main){const first=devices[0];delete main.dataset.cmsApplied;main.src=first.image;main.dataset.cmsMedia=first.mediaKey;main.alt=first.name}
      const list=card.querySelector('.equip-copy ul');
      if(list){list.innerHTML='';devices.forEach(device=>{const li=document.createElement('li');li.textContent=device.name;list.appendChild(li)})}
      const strip=card.querySelector('.equip-preview-strip');
      if(strip){strip.innerHTML='';devices.forEach(device=>{const img=document.createElement('img');img.src=device.image;img.dataset.cmsMedia=device.mediaKey;img.alt=device.name;img.loading='lazy';img.decoding='async';strip.appendChild(img)})}
      applyCmsMedia(card);
    });
  }
  async function loadDynamicTechnique(){
    if(!cmsApi||!document.querySelector('.equip-open[data-equipment]'))return;
    try{
      const content=await loadCmsSiteContent();if(!content)return;
      const manifest=content['technik/index'];
      if(!Array.isArray(manifest))return;
      const grouped={aussendienst:[],digital:[],software:[]};
      manifest.filter(entry=>entry&&typeof entry.slug==='string'&&entry.visible!==false&&entry.archived!==true)
        .sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).forEach(entry=>{
          const groupKey=equipmentGroupKeys[entry.group];if(!groupKey)return;
          const base=equipmentFallbackBySlug.get(entry.slug)||{};
          grouped[groupKey].push({...base,slug:entry.slug,
            name:equipmentCmsValue(content,entry.slug,'name',base.name||entry.slug),
            category:equipmentCmsValue(content,entry.slug,'category',base.category||''),
            manufacturer:equipmentCmsValue(content,entry.slug,'manufacturer',base.manufacturer||''),
            model:equipmentCmsValue(content,entry.slug,'model',base.model||''),
            description:equipmentCmsValue(content,entry.slug,'description',base.description||''),
            details:equipmentCmsValue(content,entry.slug,'details',base.details||''),
            image:base.image||equipmentFallbackImage(entry.group),mediaKey:'equipment/'+entry.slug,source:base.source||'',sourceLabel:base.sourceLabel||''});
        });
      Object.entries(grouped).forEach(([key,devices])=>{equipmentData[key].devices=devices});renderDynamicEquipmentOverview();
    }catch(error){console.warn('Dynamische Technik konnte nicht geladen werden; Fallback bleibt aktiv.',error)}
  }

  function openEquipmentModal(key) {
    if (!equipmentModal || !equipmentData[key]) return;
    const data = equipmentData[key];

    equipmentKicker.textContent = data.kicker;
    equipmentTitle.textContent = data.title;
    equipmentLead.textContent = data.lead;
    equipmentSummary.textContent = data.summary;
    equipmentGallery.innerHTML = data.devices
      .map((device) => {
        const cmsBase = 'technik/' + device.slug;
        return `
          <article class="equipment-device-card" data-technique="${device.slug}">
            <img src="${device.image}" data-cms-media="${device.mediaKey || ''}" alt="${escapeEquipmentHtml(device.name)} Platzhalterbild" loading="lazy" decoding="async" fetchpriority="low">
            <div class="equipment-device-copy">
              <span class="equipment-device-category" data-cms-text="${cmsBase}/category">${escapeEquipmentHtml(device.category)}</span>
              <strong data-cms-text="${cmsBase}/name">${escapeEquipmentHtml(device.name)}</strong>
              <dl class="equipment-device-meta">
                <div><dt>Hersteller</dt><dd data-cms-text="${cmsBase}/manufacturer">${escapeEquipmentHtml(device.manufacturer)}</dd></div>
                <div><dt>Modell</dt><dd data-cms-text="${cmsBase}/model">${escapeEquipmentHtml(device.model)}</dd></div>
              </dl>
              <p class="equipment-device-description" data-cms-text="${cmsBase}/description">${escapeEquipmentHtml(device.description)}</p>
              <p class="equipment-device-details"><b>Besonderheiten</b><span data-cms-text="${cmsBase}/details">${escapeEquipmentHtml(device.details)}</span></p>
              ${device.source ? `<a class="equipment-source" href="${escapeEquipmentHtml(device.source)}" target="_blank" rel="noopener">Bildquelle: ${escapeEquipmentHtml(device.sourceLabel)} ↗</a>` : ''}
            </div>
          </article>
        `;
      })
      .join('');
    applyCmsMedia(equipmentGallery);

    sendAnalyticsEvent('equipment_open',key,data.title||data.kicker||key);

    equipmentModal.classList.add('open');
    equipmentModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (equipmentClose) equipmentClose.focus();
  }

  function closeEquipmentModal() {
    if (!equipmentModal) return;
    equipmentModal.classList.remove('open');
    equipmentModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.equip-open[data-equipment]').forEach((card) => {
    card.addEventListener('click', () => openEquipmentModal(card.dataset.equipment));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEquipmentModal(card.dataset.equipment);
      }
    });
  });

  loadDynamicTechnique();

  if (equipmentClose) equipmentClose.addEventListener('click', closeEquipmentModal);

  if (equipmentModal) {
    equipmentModal.addEventListener('click', (event) => {
      if (event.target === equipmentModal) closeEquipmentModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && equipmentModal?.classList.contains('open')) {
      closeEquipmentModal();
    }
  });
});

async function sendMail(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const api = (window.GUDELIUS_CMS_API || "").replace(/\/$/, "");
  const status = form.querySelector(".form-note");
  const submit = form.querySelector('button[type="submit"]');

  if (!api) {
    if (status) status.textContent = "Das Kontaktformular ist momentan nicht verfügbar.";
    return;
  }

  const payload = {
    name: form.querySelector("#name")?.value || "",
    email: form.querySelector("#email")?.value || "",
    subject: form.querySelector("#subject")?.value || "",
    message: form.querySelector("#message")?.value || "",
    website: form.querySelector('[name="website"]')?.value || "",
    source: window.location.pathname
  };

  if (submit) {
    submit.disabled = true;
    submit.dataset.originalText = submit.textContent;
    submit.textContent = "Wird gesendet …";
  }
  if (status) {
    status.textContent = "Ihre Anfrage wird sicher übermittelt …";
    status.classList.remove("success", "error");
  }

  try {
    const response = await fetch(api + "/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ("HTTP " + response.status));

    window.gudeliusTrack?.("form_submit","contact-form","Projektanfrage");
    form.reset();
    if (status) {
      status.textContent = "Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.";
      status.classList.add("success");
    }
  } catch (error) {
    if (status) {
      status.textContent = "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder nutzen Sie die angegebene E-Mail-Adresse.";
      status.classList.add("error");
    }
    console.error("Kontaktformular:", error);
  } finally {
    if (submit) {
      submit.disabled = false;
      submit.textContent = submit.dataset.originalText || "Anfrage senden →";
    }
  }
}
