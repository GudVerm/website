import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const root=resolve(import.meta.dirname,"..");
const errors=[];
const warnings=[];

function read(path){return readFileSync(join(root,path),"utf8")}
function fail(message){errors.push(message)}
function warn(message){warnings.push(message)}

const adminData=read("admin/admin-data.js");
const adminJs=read("admin/admin.js");
const siteJs=read("assets/gudelius-site.js");
const worker=read("cloudflare/src/index.js");

const publicPages=[
  "index.html",
  "leistungen/ingenieurvermessung/index.html",
  "leistungen/gis-bauvermessung/index.html",
  "leistungen/3d-laserscanning/index.html",
  "leistungen/drohnenvermessung/index.html",
  "projekte/index.html",
  "technik/index.html",
  "unternehmen/index.html",
  "kontakt/index.html",
  "impressum/index.html",
  "datenschutz/index.html",
  "404.html"
];

const catalogKeys=[...adminData.matchAll(/\bkey:"([^"]+)"/g)].map(match=>match[1]);
const catalogSet=new Set(catalogKeys);
if(catalogSet.size!==catalogKeys.length)fail("Doppelte CMS-Medien-Keys im Admin-Katalog.");

const fallbacks=[...adminData.matchAll(/fallback:"([^"]+)"/g)].map(match=>match[1]);
for(const fallback of fallbacks){
  const target=resolve(root,"admin",fallback);
  if(!existsSync(target))fail("Fallback-Datei fehlt: "+fallback);
}

const publicAssetVersions={css:new Set(),js:new Set()};
for(const page of publicPages){
  const html=read(page);
  const css=(html.match(/gudelius-site\.css\?v=([0-9A-Za-z._-]+)/)||[])[1];
  const js=(html.match(/gudelius-site\.js\?v=([0-9A-Za-z._-]+)/)||[])[1];
  if(css)publicAssetVersions.css.add(css);
  if(js)publicAssetVersions.js.add(js);
}
if(publicAssetVersions.css.size>1)fail("Öffentliche Seiten verwenden unterschiedliche gudelius-site.css-Versionen: "+[...publicAssetVersions.css].join(", "));
if(publicAssetVersions.js.size>1)fail("Öffentliche Seiten verwenden unterschiedliche gudelius-site.js-Versionen: "+[...publicAssetVersions.js].join(", "));

const publicKeys=new Set();
for(const page of publicPages){
  const html=read(page);
  for(const match of html.matchAll(/data-cms-(?:media|bg)="([^"]+)"/g)){
    const key=match[1];
    publicKeys.add(key);
    if(!catalogSet.has(key))fail(page+": öffentlicher CMS-Bild-Key fehlt im Admin-Katalog: "+key);
  }
}

function block(source,startToken,endToken){
  const start=source.indexOf(startToken);
  if(start<0)return "";
  const end=source.indexOf(endToken,start);
  return end<0?source.slice(start):source.slice(start,end);
}
function slugKeyMap(source,keyName){
  const map=new Map();
  const regex=new RegExp('slug:["\\\']([^"\\\']+)["\\\'][^{}]*?'+keyName+':["\\\']([^"\\\']+)["\\\']',"g");
  for(const match of source.matchAll(regex))map.set(match[1],match[2]);
  return map;
}

const adminEquipmentBlock=block(adminData,"const defaultEquipment = [","const defaultProjects = [");
const publicEquipmentBlock=block(siteJs,"const equipmentData = {","const equipmentFallbackBySlug");
const adminEquipment=slugKeyMap(adminEquipmentBlock,"key");
const publicEquipment=slugKeyMap(publicEquipmentBlock,"mediaKey");

for(const [slug,key] of adminEquipment){
  const publicKey=publicEquipment.get(slug);
  if(!publicKey)fail("Öffentliche Technikdefinition fehlt: "+slug);
  else if(publicKey!==key)fail("Technik-Medien-Key weicht ab: "+slug+" · Admin "+key+" · Website "+publicKey);
}
for(const slug of publicEquipment.keys()){
  if(!adminEquipment.has(slug))fail("Technik-Medien-Key existiert nur auf der Website: "+slug);
}

if(!adminJs.includes('key:fallback?.key||("equipment/"+entry.slug)')){
  fail("Technik-Manifest überschreibt individuelle Medien-Keys.");
}
if(!siteJs.includes("mediaKey:base.mediaKey||('equipment/'+entry.slug)")){
  fail("Dynamische öffentliche Technik bewahrt individuelle Medien-Keys nicht.");
}

for(const token of [
  "Bild gespeichert und aus R2 bestätigt.",
  "Projektbild gespeichert und aus R2 bestätigt.",
  "Technikbild gespeichert und aus R2 bestätigt."
]){
  if(!adminJs.includes(token))fail("R2-Readback-Bestätigung fehlt: "+token);
}
if((adminJs.match(/loadProtectedMediaIntoImage\(img,item\.key/g)||[]).length<3){
  fail("Nicht alle dynamischen/generischen Admin-Bilduploads lesen das Bild nach dem Upload aus R2 zurück.");
}

for(const token of [
  'pathname.startsWith("/api/admin/media/") && (method === "PUT" || method === "DELETE")',
  'url.pathname.startsWith("/api/admin/media/") && request.method === "GET"',
  'url.pathname.startsWith("/api/media/")',
  'if (request.method === "PUT")',
  'url.pathname.startsWith("/media/") && request.method === "GET"'
]){
  if(!worker.includes(token))fail("Worker-Medienroute/-Rewrite fehlt: "+token);
}

for(const token of [
  'querySelectorAll("img[data-cms-media]")',
  'querySelectorAll("[data-cms-bg]")',
  "cmsMediaRequestVersion",
  "isFullBleedCmsImage"
]){
  if(!siteJs.includes(token))fail("Öffentliche CMS-Bildlogik fehlt: "+token);
}

const unusedCatalog=[...catalogSet].filter(key=>!publicKeys.has(key)&&!siteJs.includes(key));
if(unusedCatalog.length)warn("Medien-Keys ohne direkten öffentlichen Treffer: "+unusedCatalog.join(", "));

console.log("Medien-Integrität: "+catalogSet.size+" CMS-Bildplätze, "+publicKeys.size+" statische öffentliche Bindungen, "+adminEquipment.size+" dynamische Technikbilder.");
for(const message of warnings)console.warn("WARN:",message);
if(errors.length){
  console.error("\nMedien-Integritätscheck fehlgeschlagen:");
  errors.forEach(message=>console.error("- "+message));
  process.exit(1);
}
console.log("Medien-Integritätscheck erfolgreich.");
