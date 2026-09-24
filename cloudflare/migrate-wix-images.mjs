import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const cloudflareDir = process.cwd();
const repoRoot = resolve(cloudflareDir, "..");
const assetDir = join(repoRoot, "assets", "media");
const tempDir = join(cloudflareDir, ".wix-migration-tmp");

const assets = [
  { id: "bdad94_68fa5f6e3b884a37874930880d49817a~mv2", ext: ".png", file: "gudelius-logo.png", label: "Gudelius Vermessung Logo" },
  { id: "bdad94_b3c3899c62854fc2af846e55db7be150~mv2", ext: ".jpg", file: "mobiler-arbeitsplatz.jpg", label: "Mobiler Arbeitsplatz" },
  { id: "bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2", ext: ".jpg", file: "ingenieur-bauvermessung.jpg", label: "Ingenieur- und Bauvermessung" },
  { id: "bdad94_44c89c41036e46258f57a20400fc64a0~mv2", ext: ".png", file: "3d-laserscanning.png", label: "3D-Laserscanning" },
  { id: "bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2", ext: ".jpg", file: "drohnenvermessung.jpg", label: "Drohnenvermessung" },
  { id: "bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2", ext: ".png", file: "gelaende-gewaesser.png", label: "Gelände und Gewässer" },
  { id: "bdad94_7deed34091c6465aa82d25f8b981d966~mv2", ext: ".jpg", file: "bestand-planung.jpg", label: "Bestand und Planung" },
  { id: "bdad94_11e412ba9cd74e4695f923ef756c6b34~mv2", ext: ".jpg", file: "jost-gudelius.jpg", label: "Jost Gudelius" },
  { id: "bdad94_91e2d46020314618a1e009aab515dda3~mv2", ext: ".jpg", file: "pruefsachverstaendiger.jpg", label: "Prüfsachverständiger BayIkaBau" }
];

function wixOriginalUrl(asset) {
  return "https://static.wixstatic.com/media/" + asset.id + asset.ext;
}

function detectMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  return "";
}

function expectedMime(asset) {
  return asset.ext === ".png" ? "image/png" : "image/jpeg";
}

async function downloadAll() {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const downloaded = [];
  for (const asset of assets) {
    const url = wixOriginalUrl(asset);
    console.log("Lade " + asset.label + " …");
    const response = await fetch(url, {
      headers: {
        "accept": "image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
        "user-agent": "GudeliusVermessung-Wix-Migration/1.0"
      },
      redirect: "follow"
    });
    if (!response.ok) throw new Error(url + " -> HTTP " + response.status);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const detected = detectMime(bytes);
    const expected = expectedMime(asset);
    if (detected !== expected) {
      throw new Error(asset.file + ": Dateisignatur " + (detected || "unbekannt") + ", erwartet " + expected);
    }
    if (bytes.byteLength < 1024) {
      throw new Error(asset.file + ": Datei ist verdächtig klein (" + bytes.byteLength + " Byte).");
    }

    await writeFile(join(tempDir, asset.file), bytes);
    downloaded.push({ ...asset, bytes: bytes.byteLength });
    console.log("✓ " + asset.file + " (" + bytes.byteLength.toLocaleString("de-DE") + " Byte)");
  }
  return downloaded;
}

async function collectSourceFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", "node_modules", ".media-audit", ".wix-migration-tmp"].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (![".html", ".js", ".md"].includes(extname(entry.name).toLowerCase())) continue;
    files.push(full);
  }
  return files;
}

function localReference(filePath, asset) {
  const rel = relative(repoRoot, filePath).split(sep).join("/");
  if (rel === "admin/admin.js") return "../assets/media/" + asset.file;
  return "assets/media/" + asset.file;
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
}

function assetRegex(asset) {
  const escaped = escapeRegex(asset.id);
  const extension = escapeRegex(asset.ext);
  return new RegExp(
    "https://static\\.wixstatic\\.com/media/" + escaped + extension + "(?:/[^\\\"'\\s)]+)?",
    "g"
  );
}

async function planReplacements() {
  const sourceFiles = await collectSourceFiles(repoRoot);
  const changes = [];
  const totals = new Map(assets.map(asset => [asset.id, 0]));

  for (const filePath of sourceFiles) {
    let content = await readFile(filePath, "utf8");
    const original = content;

    for (const asset of assets) {
      const regex = assetRegex(asset);
      const matches = content.match(regex);
      if (!matches?.length) continue;
      totals.set(asset.id, totals.get(asset.id) + matches.length);
      content = content.replace(regex, localReference(filePath, asset));
    }

    if (content !== original) changes.push({ filePath, content });
  }

  for (const asset of assets) {
    if (!totals.get(asset.id)) {
      throw new Error("Keine Quelltext-Referenz für " + asset.id + " gefunden. Abbruch vor Änderungen.");
    }
  }

  return { changes, totals };
}

async function installAssets(downloaded) {
  await mkdir(assetDir, { recursive: true });
  for (const asset of downloaded) {
    const from = join(tempDir, asset.file);
    const to = join(assetDir, asset.file);
    await rm(to, { force: true });
    await rename(from, to);
  }
}

async function verifyNoWixReferences() {
  const files = await collectSourceFiles(repoRoot);
  const remaining = [];
  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    if (content.includes("static.wixstatic.com")) {
      remaining.push(relative(repoRoot, filePath).split(sep).join("/"));
    }
  }
  if (remaining.length) {
    throw new Error("Noch Wix-Referenzen vorhanden: " + remaining.join(", "));
  }
}

async function main() {
  console.log("GudeliusVermessung · Wix-Bildmigration");
  console.log("Repository: " + repoRoot);
  console.log("");

  const downloaded = await downloadAll();
  const { changes, totals } = await planReplacements();

  console.log("");
  console.log("Geplante Quelltextänderungen: " + changes.length + " Datei(en)");
  for (const asset of assets) {
    console.log("- " + asset.file + ": " + totals.get(asset.id) + " Referenz(en)");
  }

  await installAssets(downloaded);
  for (const change of changes) {
    await writeFile(change.filePath, change.content, "utf8");
  }

  await verifyNoWixReferences();
  await rm(tempDir, { recursive: true, force: true });

  console.log("");
  console.log("✓ 9 Wix-Originalbilder unter assets/media/ gesichert.");
  console.log("✓ Alle static.wixstatic.com-Referenzen im Projekt ersetzt.");
  console.log("✓ Wix selbst, DNS und R2-Konfiguration wurden nicht verändert.");
  console.log("");
  console.log("Als Nächstes: git status prüfen und die Testseite visuell testen.");
}

main().catch(error => {
  console.error("✗ " + error.message);
  console.error("Quelltexte werden erst geändert, wenn alle 9 Bilder erfolgreich geladen und validiert wurden.");
  process.exitCode = 1;
});
