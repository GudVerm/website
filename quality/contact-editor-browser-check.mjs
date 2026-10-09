import { chromium } from "playwright";

const base=(process.env.SITE_URL||"http://127.0.0.1:4173/").replace(/\/?$/,"/");
const cmsOrigin="https://gudelius-cms.gudeliusvermessung.workers.dev";
const initialEmail="gudeliusvermessung@web.de";
const browser=await chromium.launch({headless:true});
const failures=[];

for(const draftMode of [false,true]){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const email="kontakt-check-"+(draftMode?"entwurf":"live")+"@example.org";
  const live={"kontakt/email":initialEmail};
  const drafts={};
  const writes=[];
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));

  if(draftMode){
    await page.addInitScript(()=>sessionStorage.setItem("gudelius-cms-draft-mode","1"));
  }
  // On production the Worker serves /admin/kontakt/ with scripts resolved
  // from /admin/. Reproduce that mapping in the local test server.
  await page.route("**/admin/kontakt/",async route=>{
    const response=await route.fetch();
    const html=await response.text();
    await route.fulfill({response,body:html.replace(/<head>/i,'<head><base href="/admin/">')});
  });
  await page.route("**/admin/config.js*",route=>route.fulfill({
    status:200,contentType:"application/javascript",body:[
      'window.GUDELIUS_CMS_API="'+cmsOrigin+'";',
      'window.GUDELIUS_CMS_MEDIA_ENABLED=true;',
      'window.GUDELIUS_CMS_USE_ACCESS=true;',
      'window.GUDELIUS_LEGACY_ADMIN_DISABLED=false;'
    ].join("\n")
  }));
  await page.route(cmsOrigin+"/**",async route=>{
    const url=new URL(route.request().url());
    const path=url.pathname;
    const method=route.request().method();
    const json=(data,status=200)=>route.fulfill({status,contentType:"application/json",body:JSON.stringify(data)});
    if(method==="GET"&&path==="/api/site")return json({content:{...live}});
    if(method==="GET"&&path==="/api/admin/preview-site")return json({content:{...live,...drafts}});
    if(method==="GET"&&path==="/api/admin/drafts"){
      return json({count:Object.keys(drafts).length,drafts:Object.keys(drafts).map(key=>({key}))});
    }
    if(method==="GET"&&path==="/api/admin/session")return json({ok:true,auth_mode:"access",token_fallback_enabled:false});
    if(method==="GET"&&path==="/api/admin/media")return json({objects:[]});
    const draftPrefix="/api/admin/drafts/",livePrefix="/api/content/";
    if(method==="PUT"&&(path.startsWith(draftPrefix)||path.startsWith(livePrefix))){
      const isDraft=path.startsWith(draftPrefix);
      const key=path.slice((isDraft?draftPrefix:livePrefix).length).split("/").map(decodeURIComponent).join("/");
      const value=route.request().postDataJSON();
      (isDraft?drafts:live)[key]=value;
      writes.push({key,value,isDraft});
      return json({ok:true,key,...(isDraft?{draft:true,count:Object.keys(drafts).length}:{})});
    }
    return json({ok:true,content:{}});
  });

  try{
    const response=await page.goto(new URL("admin/kontakt/",base).href,{waitUntil:"load",timeout:25000});
    if(!response?.ok())throw new Error("Admin-Seite HTTP "+response?.status());
    await page.waitForFunction(()=>document.querySelector("#contactEmail")?.value==="gudeliusvermessung@web.de",{timeout:12000});
    await page.locator("#contactEmail").fill(email);
    await page.waitForFunction(()=>document.querySelector("[data-admin-save-status]")?.textContent?.includes("offener"));
    await page.locator("[data-admin-save-all]").click();
    await page.waitForFunction(()=>document.querySelector("[data-admin-save-status]")?.textContent==="Alles gespeichert",{timeout:14000});
    const text=await page.locator("#contactTextStatus").innerText();
    if(!text.includes(draftMode?"als Entwurf gespeichert":"veröffentlicht")){
      throw new Error("Falsche Speichermeldung: "+text);
    }
    if(writes.length!==1||writes[0].key!=="kontakt/email"||writes[0].value!==email||writes[0].isDraft!==draftMode){
      throw new Error("Falsche CMS-Schreibvorgänge: "+JSON.stringify(writes));
    }
    if(draftMode){
      if(live["kontakt/email"]!==initialEmail||drafts["kontakt/email"]!==email){
        throw new Error("Entwurf wurde fälschlich live oder nicht als Entwurf gespeichert.");
      }
    }else{
      await page.goto(new URL("kontakt/",base).href,{waitUntil:"load",timeout:25000});
      await page.waitForFunction(expected=>{
        const element=document.querySelector('a[data-cms-link="kontakt/email"]');
        return element?.textContent?.trim()===expected&&element.getAttribute("href")==="mailto:"+expected;
      },email,{timeout:12000});
    }
  }catch(error){
    failures.push((draftMode?"Entwurf":"Live")+": "+error.message);
  }
  if(errors.length)failures.push((draftMode?"Entwurf":"Live")+" Browser-JS: "+errors.slice(0,5).join(" | "));
  await context.close();
}
await browser.close();
if(failures.length){
  console.error("Kontakt-CMS-Browsertest fehlgeschlagen:\n"+failures.join("\n"));
  process.exit(1);
}
console.log("Kontakt-CMS-Browsertest erfolgreich: E-Mail wird gespeichert, geprüft und Dirty-Status bereinigt; Entwürfe bleiben unveröffentlicht.");
