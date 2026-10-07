import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const root=resolve(import.meta.dirname,"..");
const baselineRevision="2026-10-04.5-stable-hero"; void baselineRevision;
const base=(process.env.SITE_URL||"http://127.0.0.1:4173/").replace(/\/?$/,"/");
const update=process.env.UPDATE_VISUAL_BASELINES==="1";
const baselineDir=resolve(root,"quality/visual-baselines");
const actualDir=resolve(root,"quality-artifacts/visual/actual");
const diffDir=resolve(root,"quality-artifacts/visual/diff");
await Promise.all([mkdir(baselineDir,{recursive:true}),mkdir(actualDir,{recursive:true}),mkdir(diffDir,{recursive:true})]);

const pages=[
  ["start","index.html"],
  ["ingenieur","leistungen/ingenieurvermessung/"],
  ["projekte","projekte/"],
  ["technik","technik/"],
  ["kontakt","kontakt/"],
  ["unternehmen","unternehmen/"]
];
const viewports=[
  ["mobile",{width:390,height:844}],
  ["tablet",{width:768,height:1024}],
  ["desktop",{width:1440,height:1000}]
];
const maxDiffRatio=0.003;
const threshold=0.10;
const failures=[];
const results=[];
const transparentSvg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#eef0ec"/></svg>';

const browser=await chromium.launch({headless:true});
for(const [viewportName,viewport] of viewports){
  const context=await browser.newContext({
    viewport,
    deviceScaleFactor:1,
    reducedMotion:"reduce",
    locale:"de-DE",
    timezoneId:"Europe/Berlin"
  });
  for(const [slug,path] of pages){
    const page=await context.newPage();
    await page.route("https://**/*",async route=>{
      const request=route.request();
      const url=request.url();
      if(url.startsWith("https://gudelius-cms.gudeliusvermessung.workers.dev/")){
        if(url.includes("/api/site"))return route.fulfill({status:200,contentType:"application/json",body:'{"content":{}}'});
        if(url.includes("/api/analytics/event"))return route.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
        return route.fulfill({status:404,contentType:"application/json",body:'{"error":"visual-stub"}'});
      }
      if(request.resourceType()==="image")return route.fulfill({status:200,contentType:"image/svg+xml",body:transparentSvg});
      return route.abort();
    });
    await page.goto(new URL(path,base).href,{waitUntil:"load",timeout:30000});
    await page.addStyleTag({content:`
      *,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
      html{scroll-behavior:auto!important}
      [data-image-review-badge],.image-review-badge{display:none!important}
      /* Technik-Gerätebilder werden über den globalen Bild-Stub neutralisiert;
         Navigations- und Typografieänderungen bleiben als Regression sichtbar. */
      /* Hero-Fotos werden im visuellen Regressionstest bewusst neutralisiert.
         Layout, Text, Buttons, Höhe und Überlagerungen bleiben prüfbar; wechselnde
         oder neu angebundene CMS-/Fallback-Fotos erzeugen aber keine falschen Diffs. */
      .home-page .hero,.directory-hero{background:#172026!important}
      .home-page .hero-background,.directory-hero-media{visibility:hidden!important}
    `});
    await page.evaluate(async()=>{
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      for(const fraction of [0.25,0.5,0.75,1]){window.scrollTo(0,Math.round(max*fraction));await wait(70)}
      window.scrollTo(0,0);
      if(document.fonts?.ready)await document.fonts.ready.catch(()=>{});
      await Promise.all([...document.images].map(img=>{
        if(img.complete&&img.naturalWidth>0)return img.decode?.().catch(()=>{});
        return new Promise(resolve=>{
          const done=()=>{img.decode?.().catch(()=>{}).finally(resolve)};
          img.addEventListener("load",done,{once:true});
          img.addEventListener("error",resolve,{once:true});
          setTimeout(resolve,3000);
        });
      }));
      await wait(160);
    });

    const name=viewportName+"-"+slug+".png";
    const actualPath=resolve(actualDir,name);
    const baselinePath=resolve(baselineDir,name);
    await page.screenshot({path:actualPath,fullPage:true,animations:"disabled",caret:"hide"});

    if(update){
      await copyFile(actualPath,baselinePath);
      results.push({name,status:"baseline-updated",diffRatio:0});
      await page.close();
      continue;
    }
    if(!existsSync(baselinePath)){
      failures.push(name+": Referenzbild fehlt.");
      results.push({name,status:"missing-baseline",diffRatio:1});
      await page.close();
      continue;
    }

    const [baselineBuffer,actualBuffer]=await Promise.all([readFile(baselinePath),readFile(actualPath)]);
    const baseline=PNG.sync.read(baselineBuffer);
    const actual=PNG.sync.read(actualBuffer);
    if(baseline.width!==actual.width||baseline.height!==actual.height){
      failures.push(name+": Abmessungen geändert ("+baseline.width+"×"+baseline.height+" → "+actual.width+"×"+actual.height+").");
      results.push({name,status:"dimension-change",diffRatio:1});
      await page.close();
      continue;
    }

    const diff=new PNG({width:actual.width,height:actual.height});
    const diffPixels=pixelmatch(
      baseline.data,actual.data,diff.data,actual.width,actual.height,
      {threshold,includeAA:false,alpha:0.65,diffColor:[220,0,0],aaColor:[255,180,0]}
    );
    const diffRatio=diffPixels/(actual.width*actual.height);
    if(diffPixels>0)await writeFile(resolve(diffDir,name),PNG.sync.write(diff));
    const status=diffRatio>maxDiffRatio?"changed":"ok";
    results.push({name,status,diffPixels,diffRatio});
    if(status==="changed")failures.push(name+": "+(diffRatio*100).toFixed(3)+" % Pixelabweichung (Grenze "+(maxDiffRatio*100).toFixed(2)+" %).");
    await page.close();
  }
  await context.close();
}
await browser.close();

const lines=[
  "# Visuelle Regression",
  "",
  "Pixel-Toleranz: "+(maxDiffRatio*100).toFixed(2)+" %, Pixelmatch threshold: "+threshold,
  "",
  "| Ansicht | Ergebnis | Abweichung |",
  "|---|---|---:|",
  ...results.map(r=>"| "+r.name+" | "+r.status+" | "+((r.diffRatio||0)*100).toFixed(3)+" % |")
];
if(failures.length)lines.push("","## Fehler","",...failures.map(f=>"- "+f));
else lines.push("","## Ergebnis","","Alle visuellen Referenzvergleiche bestanden.");
const report=lines.join("\n");
await writeFile(resolve(root,"quality-artifacts/visual-report.md"),report,"utf8");
console.log(report);
if(failures.length)process.exit(1);
