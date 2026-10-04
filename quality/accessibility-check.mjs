import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import axe from "axe-core";

const base=(process.env.SITE_URL||"http://127.0.0.1:4173/").replace(/\/?$/,"/");
const out=resolve("quality-artifacts");
await mkdir(out,{recursive:true});

const pages=[
  ["start","index.html"],["ingenieur","leistungen/ingenieurvermessung/"],["gis","leistungen/gis-bauvermessung/"],
  ["scan","leistungen/3d-laserscanning/"],["drohne","leistungen/drohnenvermessung/"],["projekte","projekte/"],
  ["technik","technik/"],["unternehmen","unternehmen/"],["kontakt","kontakt/"],["impressum","impressum/"],
  ["datenschutz","datenschutz/"],["404","404.html"]
];
const viewports=[["mobile",{width:390,height:844}],["desktop",{width:1440,height:1000}]];
const findings=[];
const keyboardFailures=[];
const browser=await chromium.launch({headless:true});

for(const [viewportName,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:"reduce"});
  for(const [slug,path] of pages){
    const page=await context.newPage();
    await page.route("https://gudelius-cms.gudeliusvermessung.workers.dev/**",async route=>{
      const url=route.request().url();
      if(url.includes("/api/site"))return route.fulfill({status:200,contentType:"application/json",body:'{"content":{}}'});
      if(url.includes("/api/analytics/event"))return route.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
      return route.fulfill({status:404,contentType:"application/json",body:'{"error":"a11y-stub"}'});
    });
    await page.goto(new URL(path,base).href,{waitUntil:"load",timeout:30000});
    await page.addStyleTag({content:"*,*::before,*::after{animation:none!important;transition:none!important}"});
    await page.addScriptTag({content:axe.source});
    const result=await page.evaluate(async()=>await axe.run(document,{
      runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa"]},
      resultTypes:["violations"]
    }));
    for(const violation of result.violations){
      findings.push({
        viewport:viewportName,page:slug,id:violation.id,impact:violation.impact||"unknown",
        help:violation.help,helpUrl:violation.helpUrl,
        nodes:violation.nodes.slice(0,8).map(node=>({target:node.target,html:node.html,summary:node.failureSummary}))
      });
    }

    const focusables=await page.locator('a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])').count();
    if(focusables>0){
      await page.keyboard.press("Tab");
      const focused=await page.evaluate(()=>({
        tag:document.activeElement?.tagName||"",
        body:document.activeElement===document.body,
        visible:document.activeElement?!!(document.activeElement.offsetWidth||document.activeElement.offsetHeight||document.activeElement.getClientRects().length):false
      }));
      if(focused.body||!focused.visible)keyboardFailures.push(viewportName+"/"+slug+": erster Tab-Fokus ist nicht sichtbar/fokussierbar.");
    }
    const main=await page.locator("main").count();
    const skip=await page.locator('a.skip-link[href="#main-content"]').count();
    if(!main||!skip)keyboardFailures.push(viewportName+"/"+slug+": Skip-Link oder main-Landmark fehlt.");
    await page.close();
  }
  await context.close();
}
await browser.close();

const report={generatedAt:new Date().toISOString(),base,violations:findings,keyboardFailures};
await writeFile(resolve(out,"accessibility-report.json"),JSON.stringify(report,null,2),"utf8");
const lines=[
  "# Accessibility-Check","",
  "Geprüft: "+pages.length+" Seiten × "+viewports.length+" Viewports","",
  "| Seite | Viewport | Regel | Impact | Knoten |","|---|---|---|---|---:|",
  ...findings.map(v=>"| "+v.page+" | "+v.viewport+" | "+v.id+" | "+v.impact+" | "+v.nodes.length+" |")
];
if(keyboardFailures.length)lines.push("","## Tastatur/Fokus","",...keyboardFailures.map(item=>"- "+item));
if(!findings.length&&!keyboardFailures.length)lines.push("","## Ergebnis","","Keine WCAG-A/AA-Verstöße oder Fokusfehler gefunden.");
await writeFile(resolve(out,"accessibility-report.md"),lines.join("\n"),"utf8");
console.log(lines.join("\n"));
if(findings.length||keyboardFailures.length)process.exit(1);
