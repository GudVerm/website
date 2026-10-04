import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root=resolve(import.meta.dirname,"..");
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
const errors=[];
const warnings=[];

function fail(message){errors.push(message)}
function warn(message){warnings.push(message)}
function read(path){return readFileSync(join(root,path),"utf8")}
function allFiles(dir=root){
  const out=[];
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if([".git","node_modules","quality-artifacts",".media-audit",".wix-originals"].includes(entry.name))continue;
    const full=join(dir,entry.name);
    if(entry.isDirectory())out.push(...allFiles(full));else out.push(full);
  }
  return out;
}
function localTarget(page,html,raw){
  if(!raw||/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|#)/i.test(raw))return null;
  const cleaned=raw.split("#")[0].split("?")[0];
  if(!cleaned)return null;
  const pageUrl=new URL(page,"http://quality.local/");
  const baseMatch=html.match(/<base\b[^>]*href=["']([^"']+)["']/i);
  const baseUrl=baseMatch?new URL(baseMatch[1],pageUrl):pageUrl;
  const target=new URL(cleaned,baseUrl);
  let pathname=decodeURIComponent(target.pathname).replace(/^\//,"");
  if(pathname.startsWith("website/"))pathname=pathname.slice("website/".length);
  if(!pathname||pathname.endsWith("/"))pathname+="index.html";
  return pathname;
}
function checkRef(page,html,raw,label){
  const target=localTarget(page,html,raw);
  if(!target)return;
  if(!existsSync(join(root,target)))fail(page+": "+label+" fehlt -> "+raw+" ("+target+")");
}

for(const page of publicPages){
  const full=join(root,page);
  if(!existsSync(full)){fail(page+": Datei fehlt");continue}
  const html=read(page);
  if(/\uFFFD|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]/.test(html))fail(page+": verdächtige Zeichencodierung");
  if((html.match(/<h1\b/gi)||[]).length!==1)fail(page+": genau eine H1 erwartet");
  if(!/<meta\s+name=["']description["'][^>]*content=["'][^"']+/i.test(html))fail(page+": Meta-Description fehlt");
  if(!/<meta\s+name=["']robots["'][^>]*content=["'][^"']+/i.test(html))fail(page+": robots-Meta fehlt");
  if(page!=="404.html"){
    if(!/<link\s+rel=["']canonical["'][^>]*href=["']https:\/\/gudeliusvermessung\.de/i.test(html))fail(page+": Canonical fehlt/ist unerwartet");
    if(!/<meta\s+property=["']og:url["'][^>]*content=["']https:\/\/gudeliusvermessung\.de/i.test(html))fail(page+": og:url fehlt/ist unerwartet");
  }
  if(!/class=["'][^"']*\bskip-link\b/i.test(html)||!/id=["']main-content["']/i.test(html))fail(page+": Skip-Link/main-content fehlt");
  if(/static\.wixstatic\.com/i.test(html))fail(page+": produktive Wix-Bildreferenz gefunden");

  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  const duplicates=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
  if(duplicates.length)fail(page+": doppelte IDs: "+duplicates.join(", "));

  for(const match of html.matchAll(/<img\b[^>]*>/gi)){
    const tag=match[0];
    const src=(tag.match(/\bsrc=["']([^"']+)["']/i)||[])[1]||"";
    if(!/\balt=["'][^"']*["']/i.test(tag)&&!/aria-hidden=["']true["']/i.test(tag))fail(page+": img ohne alt -> "+src);
    checkRef(page,html,src,"Bild");
  }
  for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi))checkRef(page,html,match[1],"lokale Referenz");
  for(const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)){
    for(const item of match[1].split(",")){const url=item.trim().split(/\s+/)[0];checkRef(page,html,url,"srcset")}
  }
}

const files=allFiles();
for(const full of files){
  const rel=relative(root,full).replaceAll("\\","/");
  const ext=extname(full).toLowerCase();
  if([".html",".css",".js",".mjs",".json",".md",".xml",".txt"].includes(ext)){
    const text=readFileSync(full,"utf8");
    if(/\uFFFD|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]/.test(text))fail(rel+": verdächtige Zeichencodierung");
    if([".html",".css",".js",".mjs"].includes(ext)&&rel!=="cloudflare/migrate-wix-images.mjs"&&/static\.wixstatic\.com/i.test(text))fail(rel+": produktive Wix-Referenz gefunden");
  }
  if(ext===".css"){
    const css=readFileSync(full,"utf8");
    for(const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)){
      const raw=match[2].trim();
      if(!raw||/^(?:data:|https?:|#)/i.test(raw))continue;
      const target=resolve(root,relative(root,join(root,rel,"..")),raw);
      if(!existsSync(target))fail(rel+": CSS-Asset fehlt -> "+raw);
    }
  }
  if([".js",".mjs"].includes(ext)){
    const result=spawnSync(process.execPath,["--check",full],{encoding:"utf8"});
    if(result.status!==0)fail(rel+": JavaScript-Syntaxfehler: "+(result.stderr||result.stdout).trim());
  }
  if([".jpg",".jpeg",".png",".webp",".avif"].includes(ext)&&!rel.startsWith("quality/visual-baselines/")){
    const bytes=statSync(full).size;
    if(bytes>2*1024*1024)fail(rel+": Bild größer als 2 MiB ("+Math.round(bytes/1024)+" KiB)");
    else if(bytes>1024*1024)warn(rel+": großes Bild ("+Math.round(bytes/1024)+" KiB)");
  }
}

console.log("Geprüft: "+publicPages.length+" öffentliche Seiten, "+files.length+" Repository-Dateien.");
for(const message of warnings)console.warn("WARN:",message);
if(errors.length){
  console.error("\nQualitätscheck fehlgeschlagen:");
  errors.forEach(message=>console.error("-",message));
  process.exit(1);
}
console.log("Statischer Qualitätscheck erfolgreich.");
