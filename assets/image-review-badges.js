/* INTERNES BILDPRUEFWERKZEUG: temporaere Kennzeichnung alter/neuer Bilder; Anzeige per Startseiten-Checkbox steuerbar. */
(() => {
  "use strict";

  const REVIEW_DATE = "02.10.2026";
  const STORAGE_KEY = "gudelius-image-review-badges";
  const NEW_IMAGE_RE = /(?:^|\/)(?:home-[^/?#]+\.webp|2026-10-02-[^/?#]+\.webp)(?:[?#].*)?$/i;
  const EXCLUDE_RE = /(?:gudelius-logo|favicon|apple-touch-icon)/i;

  const style = document.createElement("style");
  style.id = "gv-image-review-style";
  style.textContent = `
    #gv-image-review-layer{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden}
    .gv-image-review-badge{position:fixed;display:inline-flex;align-items:center;min-height:25px;max-width:min(250px,calc(100vw - 20px));padding:5px 9px;border:1px solid rgba(255,255,255,.38);border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.22);font:800 11px/1.15 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.01em;white-space:nowrap;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
    .gv-image-review-badge.is-old{background:rgba(23,32,39,.92);color:#fff}
    .gv-image-review-badge.is-new{background:rgba(244,190,24,.97);border-color:rgba(23,32,39,.28);color:#172027}
    @media(max-width:650px){.gv-image-review-badge{min-height:22px;padding:4px 7px;font-size:9px}}
    @media print{#gv-image-review-layer{display:none!important}}
  `;
  document.head.appendChild(style);

  const layer=document.createElement("div");
  layer.id="gv-image-review-layer";
  layer.setAttribute("aria-hidden","true");
  document.body.appendChild(layer);

  const entries=new Map();
  let framePending=false;
  let reviewEnabled=true;

  function readReviewEnabled(){
    try{
      const stored=localStorage.getItem(STORAGE_KEY);
      return stored===null ? true : stored!=="0";
    }catch{
      return true;
    }
  }

  function syncReviewToggles(){
    document.querySelectorAll("[data-image-review-toggle]").forEach(input=>{
      if(input instanceof HTMLInputElement) input.checked=reviewEnabled;
    });
  }

  function setReviewEnabled(enabled,persist=true){
    reviewEnabled=Boolean(enabled);
    layer.style.display=reviewEnabled?"":"none";
    if(persist){
      try{localStorage.setItem(STORAGE_KEY,reviewEnabled?"1":"0")}catch{}
    }
    syncReviewToggles();
    if(reviewEnabled)schedule();
  }

  function bindReviewToggles(){
    document.querySelectorAll("[data-image-review-toggle]").forEach(input=>{
      if(!(input instanceof HTMLInputElement)||input.dataset.imageReviewBound==="1")return;
      input.dataset.imageReviewBound="1";
      input.addEventListener("change",()=>setReviewEnabled(input.checked,true));
    });
    syncReviewToggles();
  }

  function sourceFor(element){
    if(element.tagName==="IMG") return element.currentSrc||element.getAttribute("src")||"";
    const dataBg=element.getAttribute("data-bg")||"";
    if(dataBg) return dataBg;
    const inline=element.getAttribute("style")||"";
    let m=inline.match(/(?:--service-image|background(?:-image)?)\s*:\s*url\((['"]?)(.*?)\1\)/i);
    if(m&&m[2]) return m[2];
    const computed=getComputedStyle(element);
    const serviceImage=computed.getPropertyValue("--service-image")||"";
    m=serviceImage.match(/url\((['"]?)(.*?)\1\)/i);
    if(m&&m[2]) return m[2];
    const bg=computed.backgroundImage||"";
    m=bg.match(/url\((['"]?)(.*?)\1\)/i);
    return m&&m[2]?m[2]:"";
  }

  function shouldSkip(element,source){
    if(!source||source==="none") return true;
    if(EXCLUDE_RE.test(source)) return true;
    if(element.closest(".brand")) return true;
    return false;
  }

  function isNew(source){ return NEW_IMAGE_RE.test(source); }

  function register(element){
    if(!(element instanceof Element)||entries.has(element)) return;
    const source=sourceFor(element);
    if(shouldSkip(element,source)) return;
    const badge=document.createElement("span");
    badge.className="gv-image-review-badge "+(isNew(source)?"is-new":"is-old");
    badge.textContent=isNew(source)?`Bild vom ${REVIEW_DATE}`:"Bisheriges Bild";
    layer.appendChild(badge);
    entries.set(element,{badge,source});
  }

  function collect(){
    document.querySelectorAll("img").forEach(register);
    document.querySelectorAll(".service-card .pic,.service-hero,[data-cms-bg]:not(.hero)").forEach(el=>{
      if(el.querySelector("img")) return;
      register(el);
    });
    schedule();
  }

  function refresh(){
    for(const [el,entry] of entries){
      if(!document.documentElement.contains(el)){
        entry.badge.remove();entries.delete(el);continue;
      }
      const source=sourceFor(el);
      if(shouldSkip(el,source)){
        entry.badge.remove();entries.delete(el);continue;
      }
      if(!source||source===entry.source) continue;
      entry.source=source;
      const newer=isNew(source);
      entry.badge.textContent=newer?`Bild vom ${REVIEW_DATE}`:"Bisheriges Bild";
      entry.badge.classList.toggle("is-new",newer);
      entry.badge.classList.toggle("is-old",!newer);
    }
  }

  function position(){
    framePending=false;
    if(!reviewEnabled)return;
    refresh();
    const vw=innerWidth,vh=innerHeight;
    const modalOpen=document.body.classList.contains("modal-open");
    for(const [el,entry] of entries){
      const inOpenModal=!!el.closest(".equipment-modal.open,.project-modal.open");
      if(modalOpen&&!inOpenModal){
        entry.badge.style.display="none";
        continue;
      }
      const r=el.getBoundingClientRect();
      const visible=r.width>=40&&r.height>=30&&r.bottom>0&&r.right>0&&r.top<vh&&r.left<vw;
      if(!visible){entry.badge.style.display="none";continue}
      entry.badge.style.display="inline-flex";
      entry.badge.style.left=Math.max(6,Math.min(vw-140,r.left+8))+"px";
      entry.badge.style.top=Math.max(6,Math.min(vh-32,r.top+8))+"px";
    }
  }

  function schedule(){if(!reviewEnabled||framePending)return;framePending=true;requestAnimationFrame(position)}
  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule,{passive:true});
  addEventListener("load",()=>{bindReviewToggles();collect();schedule()});
  new MutationObserver(()=>{bindReviewToggles();collect();schedule()}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["src","style","data-bg"]});
  reviewEnabled=readReviewEnabled();
  bindReviewToggles();
  setReviewEnabled(reviewEnabled,false);
  collect();
})();