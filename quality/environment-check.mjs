import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const root=resolve(import.meta.dirname,"..");
const config=JSON.parse(readFileSync(resolve(root,"site.environments.json"),"utf8"));
const release=JSON.parse(readFileSync(resolve(root,"release.json"),"utf8"));
const active=config.environments?.[config.active_environment];
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message)};
assert(config.active_environment==="staging","Aktive Umgebung muss vor Domain-Cutover staging bleiben.");
assert(active?.indexable===false,"Staging muss nicht indexierbar sein.");
assert(release.public_site===active?.public_base,"release.json public_site stimmt nicht mit Staging überein.");

const robots=readFileSync(resolve(root,"robots.txt"),"utf8");
const prodRobots=readFileSync(resolve(root,"robots.production.txt"),"utf8");
assert(/Disallow:\s*\//i.test(robots),"robots.txt muss Staging vollständig sperren.");
assert(/Allow:\s*\//i.test(prodRobots)&&/gudeliusvermessung\.de\/sitemap\.xml/i.test(prodRobots),"robots.production.txt ist nicht produktionsbereit.");

const sitemap=readFileSync(resolve(root,"sitemap.xml"),"utf8");
assert(!/gudverm\.github\.io/i.test(sitemap),"Produktions-Sitemap darf keine Staging-URLs enthalten.");
assert(/https:\/\/gudeliusvermessung\.de\//i.test(sitemap),"Produktions-Sitemap enthält keine Produktions-URLs.");

const wrangler=readFileSync(resolve(root,"cloudflare/wrangler.jsonc"),"utf8");
const publicSite=(wrangler.match(/"PUBLIC_SITE_URL"\s*:\s*"([^"]+)"/)||[])[1]||"";
const allowedOrigin=(wrangler.match(/"ALLOWED_ORIGIN"\s*:\s*"([^"]+)"/)||[])[1]||"";
assert(publicSite===active?.public_base,"Worker PUBLIC_SITE_URL stimmt nicht mit aktiver Staging-Umgebung überein.");
assert(allowedOrigin===active?.allowed_origin,"Worker ALLOWED_ORIGIN stimmt nicht mit aktiver Staging-Umgebung überein.");

const pages=[
 "index.html","projekte/index.html","technik/index.html","unternehmen/index.html","kontakt/index.html",
 "impressum/index.html","datenschutz/index.html",
 "leistungen/ingenieurvermessung/index.html","leistungen/gis-bauvermessung/index.html",
 "leistungen/3d-laserscanning/index.html","leistungen/drohnenvermessung/index.html"
];
for(const page of pages){
 const html=readFileSync(resolve(root,page),"utf8");
 assert(/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),page+": Staging-noindex fehlt.");
 assert(/<link\s+rel=["']canonical["'][^>]*https:\/\/gudeliusvermessung\.de/i.test(html),page+": Produktions-Canonical fehlt.");
}
if(errors.length){console.error("Umgebungscheck fehlgeschlagen:\n- "+errors.join("\n- "));process.exit(1)}
console.log("Umgebungskonfiguration konsistent: staging aktiv, production vorbereitet.");
