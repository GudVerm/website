import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const base=(process.env.SITE_URL||"http://127.0.0.1:4173/").replace(/\/?$/,"/");
const out=resolve("quality-artifacts");
await mkdir(out,{recursive:true});

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
  ["datenschutz","datenschutz/"],
  ["404","404.html"]
];
const viewports=[
  ["mobile",{width:390,height:844}],
  ["tablet",{width:768,height:1024}],
  ["desktop",{width:1440,height:1000}]
];
const failures=[];
const reports=[];
const browser=await chromium.launch({headless:true});

for(const [viewportName,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:"reduce"});
  for(const [slug,path] of pages){
    const page=await context.newPage();
    const consoleErrors=[];
    const pageErrors=[];
    page.on("console",msg=>{if(msg.type()==="error")consoleErrors.push(msg.text())});
    page.on("pageerror",error=>pageErrors.push(error.message));
    await page.route("https://gudelius-cms.gudeliusvermessung.workers.dev/**",async route=>{
      const url=route.request().url();
      if(url.includes("/api/site"))return route.fulfill({status:200,contentType:"application/json",body:'{"content":{}}'});
      if(url.includes("/api/analytics/event"))return route.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
      return route.fulfill({status:404,contentType:"application/json",body:'{"error":"quality-stub"}'});
    });

    let response=null;
    try{
      response=await page.goto(new URL(path,base).href,{waitUntil:"networkidle",timeout:30000});
      await page.waitForTimeout(100);
    }catch(error){
      failures.push(viewportName+"/"+slug+": Navigation fehlgeschlagen: "+error.message);
    }

    const metrics=await page.evaluate(()=>{
      const root=document.documentElement;
      const broken=[...document.images].filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.currentSrc||img.src);
      const oversized=[...document.images].filter(img=>img.clientWidth>0&&img.naturalWidth>0&&img.naturalWidth/img.clientWidth>3.5).map(img=>({
        src:img.currentSrc||img.src,natural:img.naturalWidth,rendered:Math.round(img.clientWidth)
      }));
      const resources=performance.getEntriesByType("resource").map(entry=>({
        name:entry.name,initiatorType:entry.initiatorType,transferSize:entry.transferSize||0
      }));
      const imageBytes=resources.filter(r=>r.initiatorType==="img").reduce((sum,r)=>sum+r.transferSize,0);
      const totalBytes=resources.reduce((sum,r)=>sum+r.transferSize,0);
      const largestImage=Math.max(0,...resources.filter(r=>r.initiatorType==="img").map(r=>r.transferSize));
      return {
        overflow:Math.max(0,root.scrollWidth-root.clientWidth),
        broken,
        oversized,
        imageBytes,
        totalBytes,
        largestImage,
        title:document.title,
        h1:document.querySelectorAll("h1").length
      };
    });

    const prefix=viewportName+"/"+slug;
    if(response&&!response.ok())failures.push(prefix+": HTTP "+response.status());
    if(metrics.overflow>4)failures.push(prefix+": horizontales Überlaufen um "+metrics.overflow+"px");
    if(metrics.broken.length)failures.push(prefix+": kaputte Bilder: "+metrics.broken.join(", "));
    if(pageErrors.length)failures.push(prefix+": Browserfehler: "+pageErrors.join(" | "));
    const relevantConsole=consoleErrors.filter(message=>!/favicon|quality-stub|Failed to load resource/i.test(message));
    if(relevantConsole.length)failures.push(prefix+": console.error: "+relevantConsole.join(" | "));
    if(metrics.h1!==1)failures.push(prefix+": "+metrics.h1+" H1-Elemente");
    if(metrics.totalBytes>3*1024*1024)failures.push(prefix+": Seitenbudget > 3 MiB ("+Math.round(metrics.totalBytes/1024)+" KiB)");
    if(metrics.largestImage>800*1024)failures.push(prefix+": einzelnes geladenes Bild > 800 KiB");

    reports.push({viewport:viewportName,page:slug,path,status:response?.status()||0,...metrics,consoleErrors:relevantConsole,pageErrors});
    if(failures.some(item=>item.startsWith(prefix+":"))){
      await page.screenshot({path:resolve(out,viewportName+"-"+slug+".png"),fullPage:true});
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

await writeFile(resolve(out,"browser-report.json"),JSON.stringify({generatedAt:new Date().toISOString(),base,reports,failures},null,2),"utf8");
const lines=[
  "# Gudelius Website Browser-Check",
  "",
  "Basis: "+base,
  "",
  "| Viewport | Seite | Gesamt | Bilder | Größtes Bild | Oversize-Bilder |",
  "|---|---|---:|---:|---:|---:|"
];
for(const r of reports){
  lines.push("| "+r.viewport+" | "+r.page+" | "+Math.round(r.totalBytes/1024)+" KiB | "+Math.round(r.imageBytes/1024)+" KiB | "+Math.round(r.largestImage/1024)+" KiB | "+r.oversized.length+" |");
}
lines.push("");
if(failures.length){
  lines.push("## Fehler","");
  for(const failure of failures)lines.push("- "+failure);
}else{
  lines.push("## Ergebnis","","Alle Browser-/Viewport-Prüfungen bestanden.");
}
const markdown=lines.join("\n");
await writeFile(resolve(out,"browser-report.md"),markdown,"utf8");
console.log(markdown);
if(failures.length)process.exit(1);
