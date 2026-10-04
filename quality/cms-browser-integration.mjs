import { chromium } from "playwright";

const siteUrl=process.env.SITE_URL||"https://gudverm.github.io/website/";
const cmsUrl="https://gudelius-cms.gudeliusvermessung.workers.dev/api/site";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800}});
const page=await context.newPage();
const consoleErrors=[];
const pageErrors=[];
let cmsResponseStatus=null;
let cmsResponseSeen=false;

page.on("console",msg=>{if(msg.type()==="error")consoleErrors.push(msg.text())});
page.on("pageerror",error=>pageErrors.push(error.message));
page.on("response",response=>{
  if(response.url().startsWith(cmsUrl)){
    cmsResponseSeen=true;
    cmsResponseStatus=response.status();
  }
});

await page.goto(siteUrl,{waitUntil:"load",timeout:30000});
await page.waitForTimeout(1500);

const result=await page.evaluate(async()=>{
  const api=window.GUDELIUS_CMS_API||"";
  let direct=null;
  try{
    const response=await fetch(api+"/api/site",{credentials:"omit",cache:"no-store"});
    const data=await response.json();
    direct={ok:response.ok,status:response.status,hasContent:!!data?.content,heroLayout:data?.content?.["media-layout/startseite/hero"]??null};
  }catch(error){
    direct={ok:false,error:String(error?.message||error)};
  }
  const hero=document.querySelector('.hero-background');
  return {
    api,
    direct,
    heroTransform:hero?.style?.transform||"",
    heroObjectPosition:hero?.style?.objectPosition||""
  };
});

await browser.close();

console.log(JSON.stringify({cmsResponseSeen,cmsResponseStatus,result,consoleErrors,pageErrors},null,2));

if(!result.api)throw new Error("GUDELIUS_CMS_API fehlt auf der öffentlichen Website.");
if(!result.direct?.ok||!result.direct?.hasContent)throw new Error("Browser-CORS-Zugriff auf /api/site fehlgeschlagen.");
if(pageErrors.length)throw new Error("Browserfehler: "+pageErrors.join(" | "));
const corsErrors=consoleErrors.filter(message=>/cors|blocked by|access-control/i.test(message));
if(corsErrors.length)throw new Error("CORS-Fehler: "+corsErrors.join(" | "));
console.log("Öffentliche CMS-Browserintegration erfolgreich.");
