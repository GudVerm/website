import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import sharp from "sharp";

const root=resolve(import.meta.dirname,"..");
const widths=[640,960,1280];
const htmlFiles=[];
function walk(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if([".git","node_modules","admin","kanban","quality-artifacts"].includes(entry.name))continue;
    const full=resolve(dir,entry.name);
    if(entry.isDirectory())walk(full);else if(entry.name.endsWith(".html"))htmlFiles.push(full);
  }
}
walk(root);
function localImagePath(htmlFile,raw){
  if(!raw||/^(?:https?:|data:|blob:|\/)/i.test(raw))return null;
  const clean=raw.split("?")[0].split("#")[0];
  const full=resolve(dirname(htmlFile),clean);
  if(!full.startsWith(root))return null;
  return full;
}
function variantName(full,width){const ext=extname(full);return full.slice(0,-ext.length)+"-"+width+"w.webp"}
function relForHtml(htmlFile,full){return relative(dirname(htmlFile),full).replaceAll("\\","/")}
function sizesForTag(tag){
  if(/\bhero-background\b/.test(tag))return "100vw";
  if(/\bhome-path-card\b/.test(tag))return "(max-width: 620px) 100vw, (max-width: 900px) 45vw, 33vw";
  if(/\bservice-image/i.test(tag))return "(max-width: 650px) 100vw, 50vw";
  return "(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 1180px";
}
const generated=new Set();
let htmlChanged=0;
for(const htmlFile of htmlFiles){
  let html=readFileSync(htmlFile,"utf8");
  let changed=false;
  html=html.replace(/<img\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>/gi,(tag,src)=>{
    if(/\bsrcset=["\']/i.test(tag))return tag;
    const full=localImagePath(htmlFile,src);
    if(!full||!existsSync(full))return tag;
    const ext=extname(full).toLowerCase();
    if(![".jpg",".jpeg",".png",".webp",".avif"].includes(ext))return tag;
    const relRoot=relative(root,full).replaceAll("\\","/");
    if(!relRoot.startsWith("assets/media/"))return tag;
    changed=true;
    return tag.replace(/>$/," data-responsive-source=\""+relRoot+"\">");
  });
  const responsive=[...html.matchAll(/<img\b[^>]*\bdata-responsive-source=["\']([^"\']+)["\'][^>]*>/gi)];
  for(const match of responsive){
    const source=resolve(root,match[1]);
    if(!existsSync(source))continue;
    const meta=await sharp(source).metadata();
    const originalWidth=Number(meta.width||0);
    if(originalWidth<700)continue;
    const entries=[];
    for(const width of widths){
      if(width>=originalWidth)continue;
      const variant=variantName(source,width);
      if(!generated.has(variant)){await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:80,effort:5}).toFile(variant);generated.add(variant)}
      entries.push(relForHtml(htmlFile,variant)+" "+width+"w");
    }
    if(!entries.length)continue;
    entries.push(relForHtml(htmlFile,source)+" "+originalWidth+"w");
    const originalTag=match[0];
    const cleanTag=originalTag.replace(/\sdata-responsive-source=["\'][^"\']+["\']/i,"");
    const enhanced=cleanTag.replace(/>$/," srcset=\""+entries.join(", ")+"\" sizes=\""+sizesForTag(originalTag)+"\">");
    html=html.replace(originalTag,enhanced);
    changed=true;
  }
  html=html.replace(/\sdata-responsive-source=["\'][^"\']+["\']/gi,"");
  if(changed){writeFileSync(htmlFile,html,"utf8");htmlChanged++}
}
console.log("Responsive Bildvarianten:",generated.size,"HTML-Dateien geändert:",htmlChanged);
