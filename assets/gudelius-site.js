document.addEventListener('DOMContentLoaded', () => {
  const mainContent=document.querySelector("main");
  if(mainContent){
    if(!mainContent.id)mainContent.id="main-content";
    if(!document.querySelector(".skip-link")){
      const skip=document.createElement("a");
      skip.className="skip-link";
      skip.href="#"+mainContent.id;
      skip.textContent="Zum Inhalt springen";
      document.body.prepend(skip);
    }
  }

  const cmsApi = (window.GUDELIUS_CMS_API || "").replace(/\/$/, "");
  const cmsSiteEndpoint = String(window.GUDELIUS_CMS_SITE_ENDPOINT || "/api/site");
  const cmsMediaEnabled = window.GUDELIUS_CMS_MEDIA_ENABLED !== false;
  let cmsSiteContentPromise=null;

  async function loadCmsSiteContent(){
    if(!cmsApi) return null;
    if(!cmsSiteContentPromise){
      const fetchOptions=window.GUDELIUS_CMS_PREVIEW===true
        ? {credentials:"include",cache:"no-store"}
        : {credentials:"omit",cache:"no-store"};
      cmsSiteContentPromise=fetch(cmsApi+cmsSiteEndpoint,fetchOptions)
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

  function normalizeCmsMediaLayout(value){
    const source=value&&typeof value==="object"?value:{};
    const clamp=(number,min,max,fallback)=>{
      const parsed=Number(number);
      return Number.isFinite(parsed)?Math.min(max,Math.max(min,parsed)):fallback;
    };
    return {x:clamp(source.x,0,100,50),y:clamp(source.y,0,100,50),zoom:clamp(source.zoom,25,300,100),rotation:clamp(source.rotation,-180,180,0)};
  }
  function cmsMediaLayout(content,key){return normalizeCmsMediaLayout(content?.["media-layout/"+key])}
  function applyCmsImageLayout(img,layout){
    if(!img)return;
    const value=normalizeCmsMediaLayout(layout);
    img.style.objectFit="cover";
    img.style.objectPosition=value.x+"% "+value.y+"%";
    img.style.transformOrigin=value.x+"% "+value.y+"%";
    img.style.transform="scale("+(value.zoom/100)+") rotate("+value.rotation+"deg)";
  }
  function applyCmsBackgroundLayout(element,layout){
    const value=normalizeCmsMediaLayout(layout);
    const position=value.x+"% "+value.y+"%";
    if(element.classList.contains("service-hero")){
      element.style.setProperty("--cms-media-position",position);
      element.style.setProperty("--cms-media-origin",position);
      element.style.setProperty("--cms-media-scale",String(value.zoom/100));
      element.style.setProperty("--cms-media-rotation",value.rotation+"deg");
    }else{
      element.style.backgroundPosition=position;
      element.style.transformOrigin=position;
      element.style.transform="scale("+(value.zoom/100)+") rotate("+value.rotation+"deg)";
    }
  }

  async function applyCmsMedia(root = document) {
    if (!cmsApi) return;
    let content={};
    try{content=await loadCmsSiteContent()||{}}catch{}

    root.querySelectorAll("img[data-cms-media]").forEach((img) => {
      const key=img.dataset.cmsMedia||"";
      if(!key)return;
      applyCmsImageLayout(img,cmsMediaLayout(content,key));
      if(!cmsMediaEnabled||img.dataset.cmsApplied==="1")return;
      const fallback=img.currentSrc||img.src;
      const fallbackSrcset=img.getAttribute("srcset");
      const fallbackSizes=img.getAttribute("sizes");
      img.dataset.cmsApplied="1";
      img.addEventListener("error",function restoreFallback(){
        img.removeEventListener("error",restoreFallback);
        img.src=fallback;
        if(fallbackSrcset)img.setAttribute("srcset",fallbackSrcset);else img.removeAttribute("srcset");
        if(fallbackSizes)img.setAttribute("sizes",fallbackSizes);else img.removeAttribute("sizes");
      });
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.src=cmsMediaUrl(key);
    });

    root.querySelectorAll("[data-cms-bg]").forEach((element) => {
      const key=element.dataset.cmsBg||"";
      if(!key)return;
      const layout=cmsMediaLayout(content,key);

      if(element.classList.contains("hero")){
        const heroImage=element.querySelector(".hero-background");
        if(heroImage)applyCmsImageLayout(heroImage,layout);
      }else{
        applyCmsBackgroundLayout(element,layout);
      }

      if(!cmsMediaEnabled||element.dataset.cmsApplied==="1")return;
      element.dataset.cmsApplied="1";
      const url=cmsMediaUrl(key);
      const image=new Image();
      image.onload=()=>{
        if(element.classList.contains("hero")){
          const heroImage=element.querySelector(".hero-background");
          if(heroImage){
            const fallback=heroImage.currentSrc||heroImage.src;
            const fallbackSrcset=heroImage.getAttribute("srcset");
            const fallbackSizes=heroImage.getAttribute("sizes");
            heroImage.onerror=()=>{heroImage.onerror=null;heroImage.src=fallback;if(fallbackSrcset)heroImage.setAttribute("srcset",fallbackSrcset);else heroImage.removeAttribute("srcset");if(fallbackSizes)heroImage.setAttribute("sizes",fallbackSizes);else heroImage.removeAttribute("sizes")};
            heroImage.removeAttribute("srcset");
            heroImage.removeAttribute("sizes");
            heroImage.src=url;
            applyCmsImageLayout(heroImage,layout);
          }else{
            element.style.setProperty("--hero-image",`url("${url}")`);
          }
        }else if(element.classList.contains("service-hero")){
          element.style.setProperty("--service-image",`url("${url}")`);
          applyCmsBackgroundLayout(element,layout);
        }else{
          element.style.backgroundImage=`url("${url}")`;
          element.removeAttribute("data-bg");
          element.classList.remove("lazy-bg");
          applyCmsBackgroundLayout(element,layout);
        }
      };
      image.src=url;
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

      const legacyCompanyText={
        "unternehmen/eyebrow":{"Ihr Ansprechpartner":"Persönlicher Ansprechpartner"},
        "unternehmen/title":{"Persönlich geführt. Direkt erreichbar.":"Vermessung mit direkter Verantwortung."},
        "unternehmen/lead":{"ist Vermessungsingenieur mit langjähriger Projekterfahrung im Hoch-, Tief- und Straßenbau. Seit 2020 führt er sein eigenes Vermessungsbüro in Jachenau.":"steht für persönliche Betreuung, kurze Abstimmungswege und langjährige Projekterfahrung im Hoch-, Tief- und Straßenbau. Seit 2020 führt er sein eigenes Vermessungsbüro in Jachenau."}
      };
      elements.forEach((element) => {
        const key=element.dataset.cmsText;
        let value = content[key];
        if(typeof value==="string"&&legacyCompanyText[key]?.[value]) value=legacyCompanyText[key][value];
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

  function setupTurnstile(){
    const siteKey=String(window.GUDELIUS_TURNSTILE_SITE_KEY||"").trim();
    if(!siteKey)return;
    const forms=[...document.querySelectorAll('form[onsubmit*="sendMail"]')];
    if(!forms.length)return;
    forms.forEach(form=>{
      if(form.querySelector(".cf-turnstile"))return;
      const widget=document.createElement("div");
      widget.className="cf-turnstile";
      widget.dataset.sitekey=siteKey;
      widget.dataset.theme="auto";
      const submit=form.querySelector('button[type="submit"]');
      submit?.before(widget);
    });
    if(!document.querySelector('script[data-gudelius-turnstile]')){
      const script=document.createElement("script");
      script.src="https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async=true;script.defer=true;script.dataset.gudeliusTurnstile="1";
      document.head.appendChild(script);
    }
  }
  setupTurnstile();

  const modalFocusableSelector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function trapModalFocus(event,modal){
    if(event.key!=="Tab"||!modal?.classList.contains("open"))return;
    const focusable=[...modal.querySelectorAll(modalFocusableSelector)].filter(el=>!el.hidden&&el.getClientRects().length);
    if(!focusable.length){event.preventDefault();return}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }

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
      const isOpen=navlinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded',String(isOpen));
      menuBtn.setAttribute('aria-label',isOpen?'Menü schließen':'Menü öffnen');
    });

    navlinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach((a) => {
      a.addEventListener('click', () => {
        navlinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded','false');
        menuBtn.setAttribute('aria-label','Menü öffnen');
        dropdowns.forEach((dropdown) => {
          dropdown.classList.remove('open');
          const toggle=dropdown.querySelector('.nav-dropdown-toggle');
          if(toggle)toggle.setAttribute('aria-expanded','false');
        });
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

  document.addEventListener('keydown',event=>{
    if(event.key!=="Escape"||!mobileQuery.matches)return;
    if(navlinks?.classList.contains("open")){
      navlinks.classList.remove("open");
      menuBtn?.setAttribute("aria-expanded","false");
      menuBtn?.setAttribute("aria-label","Menü öffnen");
      menuBtn?.focus();
    }
    dropdowns.forEach(dropdown=>{
      dropdown.classList.remove("open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded","false");
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


  const projectServiceLabels={
    "ingenieurvermessung":"Ingenieurvermessung",
    "gis-bauvermessung":"GIS & Bauvermessung",
    "3d-laserscanning":"3D-Laserscanning",
    "drohnenvermessung":"Drohnenvermessung"
  };
  const projectFallbackDetails={
    "ingenieur-bauvermessung":{
      description:"Präzise Absteckung, Kontrollmessungen und Bestandsaufnahme bilden die verlässliche Datengrundlage für Planung und Bauausführung.",
      services:["ingenieurvermessung"]
    },
    "3d-laserscanning":{
      description:"Flächenhafte 3D-Erfassung für Bestandsdokumentation, Punktwolken und die anschließende Ableitung von Planungs- und Aufmaßdaten.",
      services:["3d-laserscanning"]
    },
    "rtk-drohnenvermessung":{
      description:"RTK-gestützte Luftbildaufnahme für Orthophotos, Flächenerfassung und großräumige Geländedaten mit effizienter Aufnahme vor Ort.",
      services:["drohnenvermessung"]
    },
    "gelaende-gewaesser":{
      description:"Topografische Gelände- und Gewässeraufnahme als Grundlage für Bestandspläne, Geländemodelle und weitere fachliche Auswertungen.",
      services:["gis-bauvermessung"]
    },
    "mobiler-einsatz":{
      description:"Messung, Datenkontrolle und erste Auswertung direkt im Projektumfeld – für kurze Wege und unmittelbar prüfbare Ergebnisse.",
      services:["ingenieurvermessung","gis-bauvermessung"]
    },
    "bestand-planung":{
      description:"Strukturierte Bestandsaufnahme zur Erstellung belastbarer Planungsgrundlagen und zur Weiterverarbeitung in CAD- und Projektworkflows.",
      services:["ingenieurvermessung","3d-laserscanning"]
    }
  };
  const projectModalRecords=new Map();
  const projectModal=document.getElementById("projectModal");
  const projectModalClose=document.getElementById("projectModalClose");
  const projectModalImage=document.getElementById("projectModalImage");
  const projectModalTitle=document.getElementById("projectModalTitle");
  const projectModalMeta=document.getElementById("projectModalMeta");
  const projectModalDescription=document.getElementById("projectModalDescription");
  const projectModalServices=document.getElementById("projectModalServices");
  const projectModalTags=document.getElementById("projectModalTags");
  let projectModalPreviousFocus=null;

  function normalizeProjectServices(value){
    if(Array.isArray(value))return value.filter(item=>typeof item==="string"&&item.trim());
    if(typeof value==="string"){
      try{const parsed=JSON.parse(value);if(Array.isArray(parsed))return parsed.filter(Boolean)}catch{}
      return value.split(",").map(item=>item.trim()).filter(Boolean);
    }
    return [];
  }
  function fallbackProjectRecord(card){
    const slug=card?.dataset.project||card?.querySelector("[data-cms-media]")?.dataset.cmsMedia?.replace(/^projects\//,"")||"";
    const fallback=projectFallbackDetails[slug]||{};
    return {
      slug,
      title:card?.querySelector(".project-caption strong")?.textContent?.trim()||projectDisplayTitles[slug]||projectDisplayTitle(slug,slug),
      description:fallback.description||"Ein ausgewähltes Referenzprojekt von GudeliusVermessung.",
      location:"",
      year:"",
      services:fallback.services||[],
      image:card?.querySelector("img")?.currentSrc||card?.querySelector("img")?.src||"assets/dummy-aussendienst-02.svg",
      mediaKey:card?.querySelector("img")?.dataset.cmsMedia||""
    };
  }
  function registerFallbackProjectCards(){
    document.querySelectorAll(".projects-grid .project").forEach(card=>{
      const record=fallbackProjectRecord(card);
      if(record.slug)projectModalRecords.set(record.slug,record);
      card.dataset.project=record.slug;
      card.tabIndex=0;
      card.setAttribute("role","button");
      card.setAttribute("aria-label","Projekt "+record.title+" öffnen");
    });
  }
  function openProjectModal(card){
    if(!projectModal||!card)return;
    const slug=card.dataset.project||"";
    const base=projectModalRecords.get(slug)||fallbackProjectRecord(card);
    const image=card.querySelector("img");
    const record={
      ...base,
      image:image?.currentSrc||image?.src||base.image,
      mediaKey:image?.dataset.cmsMedia||base.mediaKey||""
    };

    projectModalImage.src=record.image||"assets/dummy-aussendienst-02.svg";
    projectModalImage.alt=record.title||"Projekt";
    if(record.mediaKey){
      projectModalImage.dataset.cmsMedia=record.mediaKey;
      delete projectModalImage.dataset.cmsApplied;
    }else{
      delete projectModalImage.dataset.cmsMedia;
      delete projectModalImage.dataset.cmsApplied;
    }
    projectModalTitle.textContent=record.title||"Projekt";
    projectModalDescription.textContent=record.description||"Ein ausgewähltes Referenzprojekt von GudeliusVermessung.";

    const meta=[record.location,record.year].filter(Boolean);
    projectModalMeta.innerHTML="";
    meta.forEach(value=>{const span=document.createElement("span");span.textContent=value;projectModalMeta.appendChild(span)});
    projectModalMeta.hidden=!meta.length;

    const services=normalizeProjectServices(record.services);
    projectModalTags.innerHTML="";
    services.forEach(service=>{
      const tag=document.createElement("span");
      tag.textContent=projectServiceLabels[service]||service;
      projectModalTags.appendChild(tag);
    });
    projectModalServices.hidden=!services.length;

    projectModalPreviousFocus=document.activeElement;
    applyCmsMedia(projectModal);
    projectModal.classList.add("open");
    projectModal.setAttribute("aria-hidden","false");
    projectModal.setAttribute("role","dialog");
    projectModal.setAttribute("aria-modal","true");
    document.body.classList.add("modal-open");
    projectModalClose?.focus();
    sendAnalyticsEvent("project_open",slug,record.title||slug);
  }
  function closeProjectModal(){
    if(!projectModal)return;
    projectModal.classList.remove("open");
    projectModal.setAttribute("aria-hidden","true");
    document.body.classList.remove("modal-open");
    projectModalPreviousFocus?.focus?.();
  }
  registerFallbackProjectCards();
  document.addEventListener("click",event=>{
    const card=event.target.closest(".projects-grid .project");
    if(card){openProjectModal(card);return}
    if(event.target.closest("[data-project-modal-close]")||event.target.closest("#projectModalClose"))closeProjectModal();
  });
  document.addEventListener("keydown",event=>{
    if(projectModal?.classList.contains("open")){
      trapModalFocus(event,projectModal);
      if(event.key==="Escape"){closeProjectModal();return}
    }
    if((event.key==="Enter"||event.key===" ")&&event.target.matches(".projects-grid .project")){
      event.preventDefault();openProjectModal(event.target);
    }
  });

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
        const description=typeof content['projekte/'+slug+'/description']==='string'?content['projekte/'+slug+'/description'].trim():'';
        const services=normalizeProjectServices(content['projekte/'+slug+'/services']);
        const rawImageTitle=typeof content['projekte/'+slug+'/image-title']==='string'?content['projekte/'+slug+'/image-title'].trim():'';
        const rawImageDescription=typeof content['projekte/'+slug+'/image-description']==='string'?content['projekte/'+slug+'/image-description'].trim():'';
        const imageTitle=rawImageTitle||projectDisplayTitles[slug]||title;
        const imageDescription=rawImageDescription||[location,year].filter(Boolean).join(' · ')||projectDisplayMeta[slug]||'';
        const card=document.createElement('div');card.className='project';card.dataset.project=slug;card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Projekt '+title+' öffnen');if(entry.featured)card.dataset.featured='true';
        const img=document.createElement('img');img.src=fallback.image||'assets/dummy-aussendienst-02.svg';img.dataset.cmsMedia='projects/'+slug;img.alt=imageTitle;img.loading='lazy';img.decoding='async';img.fetchPriority='low';
        const caption=document.createElement('div');caption.className='project-caption';const strong=document.createElement('strong');strong.textContent=imageTitle;caption.appendChild(strong);
        if(imageDescription){const small=document.createElement('small');small.textContent=imageDescription;caption.appendChild(small)}
        card.append(img,caption);grid.appendChild(card);
        projectModalRecords.set(slug,{slug,title,description:description||(projectFallbackDetails[slug]?.description||"Ein ausgewähltes Referenzprojekt von GudeliusVermessung."),location,year,services:services.length?services:(projectFallbackDetails[slug]?.services||[]),image:img.src});
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
  const equipmentPrevDevice = document.getElementById('equipmentPrevDevice');
  const equipmentNextDevice = document.getElementById('equipmentNextDevice');
  const equipmentModalPosition = document.getElementById('equipmentModalPosition');

  const equipmentData = {
    aussendienst: {
      kicker: 'Außendienst',
      title: 'Präzise Messtechnik vor Ort.',
      lead: 'Die Außendienst-Ausstattung verbindet klassische Vermessung mit moderner digitaler Datenerfassung für präzise Ergebnisse direkt im Projekt.',
      summary: 'Die Geräte sind auf unterschiedliche Aufgaben von Absteckung und Bestandsaufnahme bis zur 3D-Erfassung abgestimmt.',
      devices: [
        { slug:'trimble-sx12', name:'Trimble SX12', category:'Scanning-Totalstation', manufacturer:'Trimble', model:'SX12', description:'Scanning-Totalstation für präzise Vermessung und 3D-Datenerfassung im Außendienst.', details:'Kombiniert klassische Totalstationsmessung mit 3D-Erfassung für Absteckung, Aufnahme und Dokumentation.', image:'assets/media/2026-10-02-technik-sx12.webp', mediaKey:'equipment/trimble-sx12', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' },
        { slug:'trimble-s6', name:'Trimble S6', category:'Robotik-Totalstation', manufacturer:'Trimble', model:'S6', description:'Robotik-Totalstation für präzise Winkel- und Streckenmessungen im Außendienst.', details:'Für Absteckung, Bestandsaufnahme und Kontrollmessungen mit motorisierter Messunterstützung.', image:'assets/equipment-trimble-s6.svg', mediaKey:'equipment/trimble-s6', source:'https://help.fieldsystems.trimble.com/trimble-access/latest/de/equipment-supported.htm', sourceLabel:'Trimble · S6 Support' },
        { slug:'trimble-r2', name:'Trimble R2 GNSS-Empfänger', category:'GNSS-Positionierung', manufacturer:'Trimble', model:'R2', description:'GNSS-Empfänger für präzise Positionsbestimmung bei Aufnahme und Absteckung.', details:'RTK- und GNSS-gestützte Vermessung für flexible Punktaufnahme im Projektumfeld.', image:'https://www.allnav.com/wp-content/uploads/2020/04/R2_4.jpg', mediaKey:'equipment/trimble-r2', source:'https://www.allnav.com/produkte/gnss-systeme/r2/', sourceLabel:'Trimble-Partner ALLNAV' },
        { slug:'trimble-dini07', name:'Trimble DiNi 07 Ingenieurnivellier', category:'Digitalnivellement', manufacturer:'Trimble', model:'DiNi 07', description:'Digitales Ingenieurnivellier für präzise Höhenmessungen und Höhenübertragungen.', details:'Geeignet für Nivellements, Kontrollmessungen und die nachvollziehbare Bestimmung von Höhenunterschieden.', image:'https://images.ctfassets.net/1nvkn1423yot/64MgxNSI4ha3AwrJajbI1D/bc2639be1307bec5571be1197bd07a1b/geo-dinilevel-productpage-fullbackgroundproducthero-800x960.png', mediaKey:'equipment/trimble-dini07', source:'https://geospatial.trimble.com/de/products/hardware/trimble-dini-level', sourceLabel:'Trimble' }
      ]
    },
    digital: {
      kicker: '3D & Drohne',
      title: 'Digitale Erfassung aus Boden und Luft.',
      lead: 'Laserscanning, RTK-Drohne, Wärmebild und photogrammetrische Auswertung bilden den digitalen Technikblock.',
      summary: '3D-Laserscanning, RTK-Drohne und photogrammetrische Auswertung ergänzen die klassische Vermessung um flächenhafte und digitale Datenerfassung.',
      devices: [
        { slug:'trimble-tx8', name:'Trimble TX8 3D-Laserscanner', category:'Terrestrisches 3D-Laserscanning', manufacturer:'Trimble', model:'TX8', description:'Terrestrischer 3D-Laserscanner für flächenhafte Bestands- und Gebäudedokumentation.', details:'Erzeugt dichte Punktwolken als Grundlage für Bestandspläne, 3D-Auswertung und Dokumentation.', image:'assets/media/2026-10-02-technik-tx8.webp', mediaKey:'equipment/trimble-tx8', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' },
        { slug:'rtk-drohne', name:'RTK-Drohne', category:'Vermessung & Orthophoto', manufacturer:'DJI Enterprise', model:'RTK-Drohne', description:'RTK-gestützte Drohne für großflächige Vermessung, Luftbilder und Orthophotos.', details:'Für Geländeaufnahme, Dokumentation und photogrammetrische Auswertung aus der Luft.', image:'assets/media/2026-10-02-technik-digital.webp', mediaKey:'equipment/rtk-drohne', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' },
        { slug:'infrarotkamera', name:'RTK-Drohne mit Infrarotkamera', category:'Thermische Bildaufnahme', manufacturer:'DJI Enterprise', model:'RTK-Drohne mit Infrarotkamera', description:'Drohnenbasierte Wärmebildaufnahme zur ergänzenden visuellen und thermischen Dokumentation.', details:'Verbindet RTK-gestützte Befliegung mit Infrarotaufnahmen für projektbezogene Inspektionsaufgaben.', image:'https://www1.djicdn.com/cms/uploads/6a4fe5870d86bb43d58dcc1f364895da.png', mediaKey:'equipment/infrarotkamera', source:'https://enterprise.dji.com/news/detail/matrice-4-series-release', sourceLabel:'DJI Enterprise' },
        { slug:'photogrammetrie', name:'Punktwolken & Photogrammetrie', category:'Workflow / Ergebnisdarstellung', manufacturer:'–', model:'Punktwolken & Photogrammetrie', description:'Digitaler Workflow zur Ableitung und Aufbereitung räumlicher Daten aus Scan- und Bildmaterial.', details:'Punktwolken, Orthophotos und 3D-Auswertungen werden für Planung, Bestand und Dokumentation weiterverarbeitet.', image:'assets/media/2026-10-02-technik-photogrammetrie.webp', mediaKey:'equipment/photogrammetrie', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' }
      ]
    },
    software: {
      kicker: 'Programme & Arbeitsplatz',
      title: 'Auswertung und Datenaufbereitung.',
      lead: 'CAD, Tiefbauplanung, Punktwolken und Photogrammetrie werden mit den auf der Originalseite genannten Programmen abgedeckt.',
      summary: 'CAD-, Auswerte- und Photogrammetrie-Software bildet zusammen mit dem mobilen Arbeitsplatz den digitalen Workflow vom Messwert bis zur fertigen Projektgrundlage.',
      devices: [
        { slug:'bricscad', name:'BricsCAD', category:'CAD-Bearbeitung', manufacturer:'Bricsys', model:'BricsCAD', description:'CAD-Software für die zeichnerische Aufbereitung und Weiterbearbeitung von Vermessungsdaten.', details:'Für 2D-/3D-CAD, Bestandspläne und projektbezogene Planbearbeitung.', image:'https://www.bbsoft.de/assets/logo/extern/octave_weiss.webp', mediaKey:'equipment/bricscad', source:'https://bricscad.octave.com/de', sourceLabel:'Octave / BricsCAD' },
        { slug:'bbsoft', name:'BBSOFT', category:'Tiefbau, Vermessung & DGM', manufacturer:'BBSOFT', model:'BBSOFT', description:'Fachsoftware für vermessungsnahe Tiefbauplanung, Geländemodelle und Massenermittlung.', details:'Unterstützt die Bearbeitung von Vermessungsdaten, DGM und projektbezogenen Tiefbauaufgaben.', image:'https://www.bbsoft.de/assets/images/uberuns/bbsoft-planung-computer.webp', mediaKey:'equipment/bbsoft', source:'https://www.bbsoft.de/', sourceLabel:'BBSoft' },
        { slug:'realworks', name:'Trimble RealWorks', category:'Punktwolken-Auswertung', manufacturer:'Trimble', model:'RealWorks', description:'Software zur Registrierung, Auswertung und Aufbereitung terrestrischer Punktwolken.', details:'Für Scanregistrierung, Punktwolkenanalyse und die Ableitung weiterverwendbarer 2D-/3D-Ergebnisse.', image:'https://images.ctfassets.net/citn2sn5tdjr/2qHLMpxFWko4vex8bZItdi/f3295ad93a3fd7aaaa384a895ab3e13e/trimble-realworks-pipes-office-laptop-2880x1440.jpg?f=right&fit=fill&fm=webp&h=810&q=85&w=1920', mediaKey:'equipment/realworks', source:'https://www.trimble.com/de/products/building-construction-field-systems/trimble-realworks', sourceLabel:'Trimble' },
        { slug:'metashape', name:'Agisoft Metashape', category:'Photogrammetrie', manufacturer:'Agisoft', model:'Metashape', description:'Photogrammetrie-Software zur Verarbeitung georeferenzierter Bilddaten.', details:'Für Bildausrichtung, Punktwolken, Oberflächenmodelle und Orthophotos aus Drohnen- und Kameradaten.', image:'https://www.agisoft.com/images/cloud-try-now.png', mediaKey:'equipment/metashape', source:'https://www.agisoft.com/', sourceLabel:'Agisoft' },
        { slug:'mobile-arbeitsplatz', name:'Mobiler Büroarbeitsplatz', category:'Auswertung direkt im Projektumfeld', manufacturer:'GudeliusVermessung', model:'Mobiler Büroarbeitsplatz', description:'Mobiler Arbeitsplatz für Datenkontrolle, Auswertung und Abstimmung direkt im Projektumfeld.', details:'Ermöglicht kurze Wege zwischen Messung, Prüfung und digitaler Weiterverarbeitung vor Ort.', image:'assets/media/2026-10-02-technik-mobiler-arbeitsplatz.webp', mediaKey:'equipment/mobile-arbeitsplatz', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' }
      ]
    }
  };

  const equipmentFallbackBySlug = new Map(Object.values(equipmentData).flatMap(group=>group.devices).map(device=>[device.slug,{...device}]));
  const equipmentGroupKeys = {'Außendienst':'aussendienst','3D & Drohne':'digital','Programme & Arbeitsplatz':'software'};
  const equipmentGroupMedia = {
    aussendienst:{image:'assets/media/2026-10-02-technik-aussendienst.webp',mediaKey:'technik/gruppen/aussendienst',alt:'Vermessungstechnik im Außeneinsatz'},
    digital:{image:'assets/media/2026-10-02-technik-digital.webp',mediaKey:'technik/gruppen/3d-drohne',alt:'RTK-Drohne und Vermessungstechnik im Außeneinsatz'},
    software:{image:'assets/media/2026-10-02-technik-software.webp',mediaKey:'technik/gruppen/programme-arbeitsplatz',alt:'Arbeitsplatz für Auswertung und Datenaufbereitung'}
  };
  function escapeEquipmentHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  function equipmentFallbackImage(group){if(group==='3D & Drohne')return 'assets/dummy-3d-01.svg';if(group==='Programme & Arbeitsplatz')return 'assets/dummy-software-01.svg';return 'assets/dummy-aussendienst-01.svg'}
  function equipmentCmsValue(content,slug,field,fallback=''){const value=content['technik/'+slug+'/'+field];return typeof value==='string'?value:fallback}
  function renderDynamicEquipmentOverview(){
    document.querySelectorAll('.equip-open[data-equipment]').forEach(card=>{
      const group=equipmentData[card.dataset.equipment];if(!group)return;
      const devices=group.devices||[];card.hidden=!devices.length;if(!devices.length)return;
      card.removeAttribute('tabindex');
      card.removeAttribute('role');
      card.removeAttribute('aria-label');
      const main=card.querySelector(':scope > img');
      const groupMedia=equipmentGroupMedia[card.dataset.equipment];
      if(main&&groupMedia){
        delete main.dataset.cmsApplied;
        main.src=groupMedia.image;
        main.dataset.cmsMedia=groupMedia.mediaKey;
        main.alt=groupMedia.alt;
      }
      const list=card.querySelector('.equip-copy ul');
      if(list){
        list.innerHTML='';
        devices.forEach(device=>{
          const li=document.createElement('li');
          const button=document.createElement('button');
          button.type='button';
          button.className='equip-device-trigger';
          button.dataset.equipmentDevice=device.slug;
          button.textContent=device.name;
          button.setAttribute('aria-label',device.name+' im Detail öffnen');
          li.appendChild(button);
          list.appendChild(li);
        });
      }
      const strip=card.querySelector('.equip-preview-strip');
      if(strip){
        strip.innerHTML='';
        devices.forEach(device=>{
          const button=document.createElement('button');
          button.type='button';
          button.className='equip-preview-trigger';
          button.dataset.equipmentDevice=device.slug;
          button.setAttribute('aria-label',device.name+' im Detail öffnen');
          const img=document.createElement('img');
          img.src=device.image;
          img.dataset.cmsMedia=device.mediaKey;
          img.alt=device.name;
          img.loading='lazy';
          img.decoding='async';
          button.appendChild(img);
          strip.appendChild(button);
        });
      }
      const more=card.querySelector('.equip-more');
      if(more) more.hidden=true;
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

  function equipmentDeviceBySlug(slug){
    for(const [groupKey,group] of Object.entries(equipmentData)){
      const device=(group.devices||[]).find(item=>item.slug===slug);
      if(device)return {groupKey,group,device};
    }
    return null;
  }

  function equipmentModalSequence(){
    return Object.values(equipmentData).flatMap(group=>group.devices||[]).filter(device=>device&&device.slug);
  }

  function updateEquipmentModalNav(slug){
    const devices=equipmentModalSequence();
    const index=devices.findIndex(device=>device.slug===slug);
    const hasMany=devices.length>1&&index>=0;
    if(equipmentPrevDevice){
      equipmentPrevDevice.disabled=!hasMany;
      if(hasMany){
        const prev=devices[(index-1+devices.length)%devices.length];
        equipmentPrevDevice.setAttribute('aria-label','Vorheriges Gerät: '+prev.name);
        equipmentPrevDevice.title=prev.name;
      }
    }
    if(equipmentNextDevice){
      equipmentNextDevice.disabled=!hasMany;
      if(hasMany){
        const next=devices[(index+1)%devices.length];
        equipmentNextDevice.setAttribute('aria-label','Nächstes Gerät: '+next.name);
        equipmentNextDevice.title=next.name;
      }
    }
    if(equipmentModalPosition){
      equipmentModalPosition.textContent=index>=0?(index+1)+' / '+devices.length:'';
    }
  }

  function moveEquipmentModal(step){
    const devices=equipmentModalSequence();
    if(devices.length<2)return;
    const current=equipmentModal?.dataset.device||'';
    const index=devices.findIndex(device=>device.slug===current);
    if(index<0)return;
    const nextIndex=(index+step+devices.length)%devices.length;
    openEquipmentModal(devices[nextIndex].slug);
  }

  let equipmentModalPreviousFocus=null;

  function openEquipmentModal(slug) {
    if (!equipmentModal) return;
    const record=equipmentDeviceBySlug(slug);
    if(!record)return;
    const {group,device}=record;
    const cmsBase='technik/'+device.slug;

    equipmentKicker.textContent=group.kicker;
    equipmentTitle.textContent=device.name;
    equipmentLead.textContent=device.description||'';
    equipmentSummary.textContent=group.summary||device.details||'';
    equipmentTitle.dataset.cmsText=cmsBase+'/name';
    equipmentLead.dataset.cmsText=cmsBase+'/description';
    delete equipmentSummary.dataset.cmsText;

    equipmentGallery.innerHTML=`
      <article class="equipment-device-card equipment-device-card-single" data-technique="${escapeEquipmentHtml(device.slug)}">
        <img src="${escapeEquipmentHtml(device.image)}" data-cms-media="${escapeEquipmentHtml(device.mediaKey||'')}" alt="${escapeEquipmentHtml(device.name)}" loading="eager" decoding="async" fetchpriority="high">
        <div class="equipment-device-copy">
          <span class="equipment-device-category" data-cms-text="${cmsBase}/category">${escapeEquipmentHtml(device.category)}</span>
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

    applyCmsText(equipmentModal);
    applyCmsMedia(equipmentGallery);
    sendAnalyticsEvent('equipment_open',device.slug,device.name||device.slug);

    const modalWasOpen=equipmentModal.classList.contains('open');
    if(!modalWasOpen) equipmentModalPreviousFocus=document.activeElement;
    equipmentModal.dataset.device=device.slug;
    updateEquipmentModalNav(device.slug);
    equipmentModal.classList.add('open');
    equipmentModal.setAttribute('aria-hidden','false');
    equipmentModal.setAttribute('role','dialog');
    equipmentModal.setAttribute('aria-modal','true');
    document.body.classList.add('modal-open');
    if(!modalWasOpen) equipmentClose?.focus();
  }

  function closeEquipmentModal() {
    if (!equipmentModal) return;
    equipmentModal.classList.remove('open');
    equipmentModal.setAttribute('aria-hidden','true');
    delete equipmentModal.dataset.device;
    document.body.classList.remove('modal-open');
    equipmentModalPreviousFocus?.focus?.();
  }

  document.addEventListener('click',(event)=>{
    const trigger=event.target.closest('[data-equipment-device]');
    if(trigger && trigger.closest('.equipment-grid')){
      event.preventDefault();
      openEquipmentModal(trigger.dataset.equipmentDevice);
    }
  });

  renderDynamicEquipmentOverview();

  loadDynamicTechnique();

  if (equipmentClose) equipmentClose.addEventListener('click', closeEquipmentModal);
  if (equipmentPrevDevice) equipmentPrevDevice.addEventListener('click',()=>moveEquipmentModal(-1));
  if (equipmentNextDevice) equipmentNextDevice.addEventListener('click',()=>moveEquipmentModal(1));

  if (equipmentModal) {
    equipmentModal.addEventListener('click', (event) => {
      if (event.target === equipmentModal) closeEquipmentModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!equipmentModal?.classList.contains('open')) return;
    trapModalFocus(event,equipmentModal);
    if (event.key === 'Escape') {
      closeEquipmentModal();
      return;
    }
    if (event.target?.matches?.('input,textarea,select')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveEquipmentModal(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveEquipmentModal(1);
    }
  });
});

document.addEventListener("DOMContentLoaded",()=>{
  const forms=[...document.querySelectorAll('form[onsubmit*="sendMail"]')];
  const serviceLabels={
    "ingenieurvermessung":"Ingenieurvermessung",
    "gis-bauvermessung":"GIS & Bauvermessung",
    "3d-laserscanning":"3D-Laserscanning",
    "drohnenvermessung":"Drohnenvermessung",
    "sonstiges":"Allgemeine Projektanfrage"
  };
  const requested=new URLSearchParams(location.search).get("service")||"";
  forms.forEach(form=>{
    const service=form.querySelector("#service");
    const subject=form.querySelector("#subject");
    if(service&&requested&&serviceLabels[requested]){
      service.value=requested;
      if(subject&&!subject.value.trim()){subject.value="Anfrage "+serviceLabels[requested];subject.dataset.serviceAuto="1"}
    }
    service?.addEventListener("change",()=>{
      if(!subject)return;
      const label=serviceLabels[service.value]||"";
      if(!label)return;
      if(!subject.value.trim()||subject.dataset.serviceAuto==="1"){subject.value=service.value==="sonstiges"?label:"Anfrage "+label;subject.dataset.serviceAuto="1"}
    });
    subject?.addEventListener("input",()=>{delete subject.dataset.serviceAuto});
    form.querySelectorAll("[required]").forEach(field=>{
      field.addEventListener("invalid",()=>field.setAttribute("aria-invalid","true"));
      field.addEventListener("input",()=>{if(field.checkValidity())field.removeAttribute("aria-invalid")});
      field.addEventListener("blur",()=>field.toggleAttribute("aria-invalid",!field.checkValidity()));
    });
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
    turnstileToken: form.querySelector('[name="cf-turnstile-response"]')?.value || "",
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
    try{window.turnstile?.reset?.()}catch{}
    if (status) {
      status.textContent = "Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.";
      status.classList.add("success");
    }
  } catch (error) {
    if (status) {
      const detail=String(error?.message||"");
      status.textContent = detail && !/^HTTP\s+\d+/i.test(detail)
        ? detail
        : "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder nutzen Sie die angegebene E-Mail-Adresse.";
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
