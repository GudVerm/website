import { chromium } from "playwright";

const base=(process.env.SITE_URL||"http://127.0.0.1:4173/").replace(/\/?$/,"/");
const cmsOrigin="https://gudelius-cms.gudeliusvermessung.workers.dev";
const pages=[
  ["start","index.html"],
  ["ingenieur","leistungen/ingenieurvermessung/"],
  ["gis","leistungen/gis-bauvermessung/"],
  ["scan","leistungen/3d-laserscanning/"],
  ["drohne","leistungen/drohnenvermessung/"],
  ["projekte","projekte/"],
  ["technik","technik/"],
  ["unternehmen","unternehmen/"],
  ["kontakt","kontakt/"],
  ["impressum","impressum/"],
  ["datenschutz","datenschutz/"]
];

const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADUlEQVR42mNk+M/wHwAEAQH/2Vq6WQAAAABJRU5ErkJggg==","base64");
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const failures=[];
let checkedBindings=0;

for(const [slug,path] of pages){
  const page=await context.newPage();

  await page.route(cmsOrigin+"/**",async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==="/api/site"){
      return route.fulfill({
        status:200,
        contentType:"application/json",
        headers:{"access-control-allow-origin":"*","cache-control":"no-store"},
        body:JSON.stringify({content:{}})
      });
    }
    if(url.pathname.startsWith("/media/")){
      return route.fulfill({
        status:200,
        contentType:"image/png",
        headers:{"cache-control":"no-store"},
        body:png
      });
    }
    if(url.pathname==="/api/analytics/event"){
      return route.fulfill({
        status:200,
        contentType:"application/json",
        headers:{"access-control-allow-origin":"*"},
        body:JSON.stringify({ok:true})
      });
    }
    return route.fulfill({status:404,contentType:"application/json",body:'{"error":"media-browser-stub"}'});
  });

  await page.goto(new URL(path,base).href,{waitUntil:"load",timeout:20000});
  await page.waitForTimeout(500);

  const result=await page.evaluate(()=>{
    const normalizeKey=key=>String(key||"").split("/").map(encodeURIComponent).join("/");
    const imageProblems=[];
    const backgroundProblems=[];
    let bindings=0;

    for(const img of document.querySelectorAll("img[data-cms-media]")){
      bindings++;
      const key=img.dataset.cmsMedia||"";
      const expected="/media/"+normalizeKey(key);
      const src=img.currentSrc||img.src||"";
      if(!src.includes(expected)||!img.complete||img.naturalWidth<=0){
        imageProblems.push({key,src,complete:img.complete,naturalWidth:img.naturalWidth});
      }
    }

    for(const element of document.querySelectorAll("[data-cms-bg]")){
      bindings++;
      const key=element.dataset.cmsBg||"";
      const expected="/media/"+normalizeKey(key);
      let rendered="";
      if(element.classList.contains("hero")){
        const img=element.querySelector(".hero-background");
        rendered=img?.currentSrc||img?.src||"";
      }else if(element.classList.contains("service-hero")){
        rendered=element.style.getPropertyValue("--service-image")||"";
      }else{
        rendered=element.style.backgroundImage||"";
      }
      if(!rendered.includes(expected))backgroundProblems.push({key,rendered});
    }

    return {bindings,imageProblems,backgroundProblems};
  });

  checkedBindings+=result.bindings;
  if(result.imageProblems.length){
    failures.push(slug+": CMS-Bilder nicht übernommen: "+JSON.stringify(result.imageProblems));
  }
  if(result.backgroundProblems.length){
    failures.push(slug+": CMS-Hintergrundbilder nicht übernommen: "+JSON.stringify(result.backgroundProblems));
  }
  await page.close();
}

await browser.close();

console.log("CMS-Medien-Browsertest: "+checkedBindings+" Bildbindungen auf "+pages.length+" Seiten geprüft.");
if(failures.length){
  console.error("\nCMS-Medien-Browsertest fehlgeschlagen:");
  failures.forEach(message=>console.error("- "+message));
  process.exit(1);
}
console.log("CMS-Medien-Browsertest erfolgreich: erfolgreiche Medienantworten werden öffentlich angezeigt.");
