import { cp, mkdir, rm, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";

// Nur oeffentliche Dateien ins Cloudflare-Pages-Artefakt uebernehmen.
// CMS, Worker-Quellcode, GitHub-Workflows und interne Checks werden nicht publiziert.
const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist");
const files = ["index.html", "404.html", "robots.txt", "sitemap.xml"];
const directories = ["assets", "leistungen", "projekte", "technik", "unternehmen", "kontakt", "impressum", "datenschutz"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const path of files) {
  await cp(join(root, path), join(output, path));
}
for (const path of directories) {
  await cp(join(root, path), join(output, path), { recursive: true });
}
// Diese Skripte gehoeren ausschliesslich zum geschuetzten Worker-CMS.
for (const path of ["admin-analytics.js", "admin-cropper.js", "admin-inquiries.js"]) {
  await rm(join(output, "assets", path), { force: true });
}

const publicPages = [
  "index.html", "projekte/index.html", "technik/index.html",
  "unternehmen/index.html", "kontakt/index.html",
  "impressum/index.html", "datenschutz/index.html",
  "leistungen/ingenieurvermessung/index.html",
  "leistungen/gis-bauvermessung/index.html",
  "leistungen/3d-laserscanning/index.html",
  "leistungen/drohnenvermessung/index.html"
];
for (const page of publicPages) {
  const content = await readFile(join(output, page), "utf8");
  if (!content.includes("https://gudeliusvermessung.de/")) {
    throw new Error("Produktions-Canonical fehlt: " + page);
  }
  if (/<meta\s+name=["']robots["'][^>]*\bnoindex\b/i.test(content)) {
    throw new Error("Seite ist noch noindex: " + page);
  }
}
const robots = await readFile(join(output, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://gudeliusvermessung.de/sitemap.xml")) {
  throw new Error("Produktions-robots.txt fehlt oder ist falsch.");
}
const size = (await stat(join(output, "index.html"))).size;
console.log("Cloudflare Pages bereit:", publicPages.length, "oeffentliche Seiten, index.html:", size, "Bytes.");
console.log("Verzeichnis: dist/ (ohne admin/, cloudflare/, quality/ und .github/)");
