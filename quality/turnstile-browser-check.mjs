import {chromium} from "playwright";

const base=(process.env.SITE_URL||"http://127.0.0.1:4173/").replace(/\/?$/,"/");
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
const submissions=[];

await page.route("**/assets/cms-config.js*",route=>route.fulfill({
  contentType:"application/javascript",
  body:'window.GUDELIUS_CMS_API="https://gudelius-cms.gudeliusvermessung.workers.dev";'+
       'window.GUDELIUS_CMS_MEDIA_ENABLED=true;'+
       'window.GUDELIUS_TURNSTILE_SITE_KEY="test-public-sitekey";'
}));
await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*",route=>route.fulfill({
  contentType:"application/javascript",
  body:'window.turnstile={reset:function(){document.querySelectorAll("[name=cf-turnstile-response]").forEach(el=>el.value="")}};'
}));
await page.route("https://gudelius-cms.gudeliusvermessung.workers.dev/**",async route=>{
  const url=new URL(route.request().url());
  const headers={
    "access-control-allow-origin":"*",
    "access-control-allow-methods":"GET,POST,OPTIONS",
    "access-control-allow-headers":"content-type"
  };
  if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers});
  if(url.pathname==="/api/contact"){
    submissions.push(route.request().postDataJSON());
    return route.fulfill({status:201,contentType:"application/json",headers,body:'{"ok":true}'});
  }
  if(url.pathname==="/api/site"){
    return route.fulfill({status:200,contentType:"application/json",headers,body:'{"content":{}}'});
  }
  return route.fulfill({status:404,contentType:"application/json",headers,body:"{}"});
});
await page.goto(new URL("kontakt/",base).href,{waitUntil:"load",timeout:20000});
const widget=page.locator(".cf-turnstile");
if(await widget.count()!==1)errors.push("Cloudflare Turnstile-Widget fehlt.");
if(await widget.getAttribute("data-sitekey")!=="test-public-sitekey")errors.push("Turnstile-Site-Key fehlt.");
if(await widget.getAttribute("data-action")!=="contact")errors.push("Turnstile-Aktion muss contact sein.");

await page.fill("#name","Browser Pruefung");
await page.fill("#email","browser@example.org");
await page.fill("#subject","Kontaktformular-Test");
await page.fill("#message","Testnachricht fuer die sichere Anfrage.");
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(100);
if(submissions.length!==0)errors.push("Anfrage wurde trotz fehlendem Turnstile-Token versendet.");
if(!/Sicherheitsprüfung/.test(await page.locator(".form-note").innerText()))errors.push("Fehlender Token wird nicht erklärt.");

await widget.evaluate(node=>{
  const input=document.createElement("input");
  input.type="hidden";input.name="cf-turnstile-response";input.value="stubbed-token";
  node.appendChild(input);
});
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(300);
if(submissions.length!==1)errors.push("Kontakt wurde nicht genau einmal versendet.");
if(submissions[0]?.turnstileToken!=="stubbed-token")errors.push("Token fehlt im API-Payload.");
if(submissions[0]?.email!=="browser@example.org")errors.push("Kontaktdaten verändert.");
if(!/erfolgreich/.test(await page.locator(".form-note").innerText()))errors.push("Erfolgsmeldung fehlt.");
await browser.close();

if(errors.length){
  console.error("Turnstile-Browsertest fehlgeschlagen:\n"+errors.join("\n"));
  process.exit(1);
}
console.log("Turnstile-Browsertest erfolgreich: Widget, Blockade ohne Token und abgesicherter Versand.");
