import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const config=JSON.parse(read("site.environments.json"));
const release=JSON.parse(read("release.json"));
const mode=config.active_environment;
const active=config.environments?.[mode];
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message)};
assert(["staging","production"].includes(mode),"Aktive Umgebung muss staging oder production sein.");
assert(Boolean(active),"Aktive Umgebung fehlt.");
assert(release.public_site===active?.public_base,"Release public_site stimmt nicht mit der aktiven Umgebung überein.");
assert(active?.public_base?.startsWith("https://"),"Öffentliche Basis muss HTTPS verwenden.");
assert(active?.allowed_origin===new URL(active?.public_base||"https://invalid.example").origin,"Origin und Website-Basis stimmen nicht überein.");

const robots=read("robots.txt");
const productionRobots=read("robots.production.txt");
assert(/Allow:\s*\//i.test(productionRobots)&&/gudeliusvermessung\.de\/sitemap\.xml/i.test(productionRobots),
  "robots.production.txt ist nicht produktionsbereit.");
const wrangler=read("cloudflare/wrangler.jsonc");
const workerBase=(wrangler.match(/"PUBLIC_SITE_URL"\s*:\s*"([^"]+)"/)||[])[1]||"";
const workerOrigin=(wrangler.match(/"ALLOWED_ORIGIN"\s*:\s*"([^"]+)"/)||[])[1]||"";
assert(workerBase===active?.public_base,"Worker PUBLIC_SITE_URL stimmt nicht zur Umgebung.");
assert(workerOrigin.split(",").map(origin=>origin.trim()).includes(active?.allowed_origin),"Worker ALLOWED_ORIGIN erlaubt die aktive Umgebung nicht.");
const pages=[
  "index.html","projekte/index.html","technik/index.html","unternehmen/index.html","kontakt/index.html",
  "impressum/index.html","datenschutz/index.html",
  "leistungen/ingenieurvermessung/index.html","leistungen/gis-bauvermessung/index.html",
  "leistungen/3d-laserscanning/index.html","leistungen/drohnenvermessung/index.html"
];
for(const page of pages){
  const html=read(page);
  assert(/<link\s+rel=["']canonical["'][^>]*https:\/\/gudeliusvermessung\.de/i.test(html),
    page+": Produktions-Canonical fehlt.");
  const tag=(html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["']/i)||[])[1]||"";
  if(mode==="production"){
    assert(!/\bnoindex\b|\bnofollow\b/i.test(tag),page+": Staging-Robots-Meta muss entfernt sein.");
    assert(/\bindex\b/i.test(tag),page+": PROD-Robots-Meta fehlt.");
  }else{
    assert(/\bnoindex\b/i.test(tag),page+": Staging-noindex fehlt.");
  }
}
if(mode==="production"){
  assert(active?.indexable===true,"Production muss indexierbar sein.");
  assert(/Allow:\s*\//i.test(robots)&&!/Disallow:\s*\/\s*(?:\n|$)/i.test(robots),
    "robots.txt muss PROD-Crawling erlauben.");
  assert(robots.includes("https://gudeliusvermessung.de/sitemap.xml"),"Sitemap fehlt in robots.txt.");
  assert(read("scripts/build-cloudflare-pages.mjs").includes("dist"),"Cloudflare-Pages-Buildskript fehlt.");
}else{
  assert(active?.indexable===false,"Staging darf nicht indexierbar sein.");
  assert(/Disallow:\s*\//i.test(robots),"robots.txt muss Staging sperren.");
}
const sitemap=read("sitemap.xml");
assert(!sitemap.includes("gudverm.github.io"),"Sitemap enthält eine Staging-URL.");
assert(sitemap.includes("https://gudeliusvermessung.de/"),"Sitemap enthält keine Produktionsdomain.");
if(errors.length){console.error("Umgebungscheck fehlgeschlagen:\n- "+errors.join("\n- "));process.exit(1);}
console.log("Umgebungskonfiguration konsistent:",mode,"aktiv.");
