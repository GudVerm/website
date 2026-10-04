import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root=resolve(import.meta.dirname,"..");
const manifest=JSON.parse(readFileSync(resolve(root,"release.json"),"utf8"));
const expected=String(process.env.EXPECTED_RELEASE||manifest.worker_release||"").trim();
if(!expected)throw new Error("release.json enthält keine worker_release.");

const checks=[
  ["cloudflare/src/index.js",/WORKER_RELEASE\s*=\s*"([^"]+)"/],
  ["cloudflare/smoke-test.mjs",/DEFAULT_RELEASE\s*=\s*"([^"]+)"/],
  ["cloudflare/README.md",/aktuelle Worker-Releasekennung im Repository ist \x60([^\x60]+)\x60/]
];
let failed=false;
for(const [file,pattern] of checks){
  const content=readFileSync(resolve(root,file),"utf8");
  const match=content.match(pattern);
  const actual=match?.[1]||"";
  if(actual!==expected){console.error("FEHLER:",file,"Release",actual||"(fehlt)","erwartet",expected);failed=true}
  else console.log("OK:",file,actual);
}
if(String(manifest.worker_release)!==expected){console.error("FEHLER: release.json",manifest.worker_release,"erwartet",expected);failed=true}
if(failed)process.exit(1);
console.log("Release-Konsistenz erfolgreich:",expected);
