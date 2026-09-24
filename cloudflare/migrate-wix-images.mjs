import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const cloudflareDir = process.cwd();
const repoRoot = resolve(cloudflareDir, "..");
const assetDir = join(repoRoot, "assets", "media");
const originalDir = join(cloudflareDir, ".wix-originals");
const tempDir = join(cloudflareDir, ".wix-migration-tmp");
const CACHE_VERSION = "20260924-36";

const assets = [
  {
    id: "bdad94_68fa5f6e3b884a37874930880d49817a~mv2",
    originalExt: ".png",
    base: "gudelius-logo",
    label: "Gudelius Vermessung Logo",
    webUrl: "https://static.wixstatic.com/media/bdad94_68fa5f6e3b884a37874930880d49817a~mv2.png/v1/fill/w_323%2Ch_321%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_68fa5f6e3b884a37874930880d49817a~mv2.png"
  },
  {
    id: "bdad94_b3c3899c62854fc2af846e55db7be150~mv2",
    originalExt: ".jpg",
    base: "mobiler-arbeitsplatz",
    label: "Mobiler Arbeitsplatz",
    webUrl: "https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg"
  },
  {
    id: "bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2",
    originalExt: ".jpg",
    base: "ingenieur-bauvermessung",
    label: "Ingenieur- und Bauvermessung",
    webUrl: "https://static.wixstatic.com/media/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_eba448583b9c4cde93a373781a5fa8b6~mv2.jpg"
  },
  {
    id: "bdad94_44c89c41036e46258f57a20400fc64a0~mv2",
    originalExt: ".png",
    base: "3d-laserscanning",
    label: "3D-Laserscanning",
    webUrl: "https://static.wixstatic.com/media/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_44c89c41036e46258f57a20400fc64a0~mv2.png"
  },
  {
    id: "bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2",
    originalExt: ".jpg",
    base: "drohnenvermessung",
    label: "Drohnenvermessung",
    webUrl: "https://static.wixstatic.com/media/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg/v1/fill/w_300%2Ch_300%2Cq_90%2Cenc_avif%2Cquality_auto/bdad94_a1998bb61ea946aca7d6f19f6643cb07~mv2.jpg"
  },
  {
    id: "bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2",
    originalExt: ".png",
    base: "gelaende-gewaesser",
    label: "Gelände und Gewässer",
    webUrl: "https://static.wixstatic.com/media/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png/v1/fill/w_980%2Ch_723%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_da5d693375a14f28ad2c5d25d450a7ee~mv2.png"
  },
  {
    id: "bdad94_7deed34091c6465aa82d25f8b981d966~mv2",
    originalExt: ".jpg",
    base: "bestand-planung",
    label: "Bestand und Planung",
    webUrl: "https://static.wixstatic.com/media/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg/v1/fill/w_980%2Ch_735%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_7deed34091c6465aa82d25f8b981d966~mv2.jpg"
  },
  {
    id: "bdad94_11e412ba9cd74e4695f923ef756c6b34~mv2",
    originalExt: ".jpg",
    base: "jost-gudelius",
    label: "Jost Gudelius",
    webUrl: "https://static.wixstatic.com/media/bdad94_11e412ba9cd74e4695f923ef756c6b34~mv2.jpg/v1/fill/w_250%2Ch_273%2Cal_c%2Cq_90%2Cenc_auto/bdad94_11e412ba9cd74e4695f923ef756c6b34~mv2.jpg"
  },
  {
    id: "bdad94_91e2d46020314618a1e009aab515dda3~mv2",
    originalExt: ".jpg",
    base: "pruefsachverstaendiger",
    label: "Prüfsachverständiger BayIkaBau",
    webUrl: "https://static.wixstatic.com/media/bdad94_91e2d46020314618a1e009aab515dda3~mv2.jpg/v1/fill/w_250%2Ch_250%2Cal_c%2Cq_90%2Cenc_auto/bdad94_91e2d46020314618a1e009aab515dda3~mv2.jpg"
  }
];

function originalUrl(asset) {
  return "https://static.wixstatic.com/media/" + asset.id + asset.originalExt;
}

function detectMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (bytes.length >= 12) {
    const brand = Buffer.from(bytes.slice(4, 12)).toString("ascii");
    if (brand.startsWith("ftypavif") || brand.startsWith("ftypavis")) return "image/avif";
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) return "image/webp";
  }
  return "";
}

function extensionForMime(mime) {
  return {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/avif": ".avif",
    "image/webp": ".webp"
  }[mime] || "";
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchImage(url, label) {
  const response = await fetch(url, {
    headers: {
      "accept": "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
      "user-agent": "GudeliusVermessung-Wix-Migration/1.1"
    },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(label + " -> HTTP " + response.status);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const mime = detectMime(bytes);
  if (!mime) throw new Error(label + ": unbekannte Bildsignatur.");
  if (bytes.byteLength < 1024) throw new Error(label + ": Datei ist verdächtig klein.");
  return { bytes, mime };
}

async function prepareImages() {
  await mkdir(originalDir, { recursive: true });
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const prepared = [];
  for (const asset of assets) {
    const originalPath = join(originalDir, asset.base + asset.originalExt);
    if (!(await exists(originalPath))) {
      console.log("Sichere Original: " + asset.label + " …");
      const original = await fetchImage(originalUrl(asset), asset.label + " Original");
      await writeFile(originalPath, original.bytes);
      console.log("✓ Original gesichert (" + original.bytes.byteLength.toLocaleString("de-DE") + " Byte)");
    } else {
      console.log("✓ Original bereits lokal gesichert: " + asset.base + asset.originalExt);
    }

    console.log("Lade Web-Version: " + asset.label + " …");
    const web = await fetchImage(asset.webUrl, asset.label + " Web-Version");
    const ext = extensionForMime(web.mime);
    const webFile = asset.base + ext;
    await writeFile(join(tempDir, webFile), web.bytes);
    prepared.push({ ...asset, webFile, webBytes: web.bytes.byteLength, webMime: web.mime });
    console.log("✓ " + webFile + " (" + web.bytes.byteLength.toLocaleString("de-DE") + " Byte, " + web.mime + ")");
  }
  return prepared;
}

async function collectDeployableSourceFiles(dir = repoRoot) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", "node_modules", "cloudflare"].includes(entry.name) && dir === repoRoot) continue;
    if (["node_modules", ".media-audit", ".wix-migration-tmp", ".wix-originals"].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectDeployableSourceFiles(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (![".html", ".js"].includes(extname(entry.name).toLowerCase())) continue;
    files.push(full);
  }
  return files;
}

function localReference(filePath, asset) {
  const rel = relative(repoRoot, filePath).split(sep).join("/");
  if (rel === "admin/admin.js") return "../assets/media/" + asset.webFile;
  if (rel.startsWith("leistungen/") && rel.endsWith("/index.html")) {
    return "../../assets/media/" + asset.webFile;
  }
  return "assets/media/" + asset.webFile;
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
}

function wixRegex(asset) {
  const escaped = escapeRegex(asset.id);
  const extension = escapeRegex(asset.originalExt);
  return new RegExp(
    "https://static\\.wixstatic\\.com/media/" + escaped + extension + "(?:/[^\\\"'\\s)]+)?",
    "g"
  );
}

function localMediaRegex(asset) {
  return new RegExp(
    "(?:\\.\\./)*assets/media/" + escapeRegex(asset.base) + "\\.(?:jpg|jpeg|png|webp|avif)",
    "g"
  );
}

async function planReplacements(prepared) {
  const sourceFiles = await collectDeployableSourceFiles();
  const changes = [];
  const totals = new Map(prepared.map(asset => [asset.id, 0]));

  for (const filePath of sourceFiles) {
    let content = await readFile(filePath, "utf8");
    const original = content;

    for (const asset of prepared) {
      const replacement = localReference(filePath, asset);
      const wixMatches = content.match(wixRegex(asset)) || [];
      const localMatches = content.match(localMediaRegex(asset)) || [];
      const count = wixMatches.length + localMatches.length;
      if (!count) continue;
      totals.set(asset.id, totals.get(asset.id) + count);
      content = content.replace(wixRegex(asset), replacement);
      content = content.replace(localMediaRegex(asset), replacement);
    }

    if (filePath.endsWith(".html")) {
      content = content.replace(
        /gudelius-site\.js\?v=[0-9A-Za-z._-]+/g,
        "gudelius-site.js?v=" + CACHE_VERSION
      );
      content = content.replace(
        /admin\.js\?v=[0-9A-Za-z._-]+/g,
        "admin.js?v=" + CACHE_VERSION
      );
    }

    if (content !== original) changes.push({ filePath, content });
  }

  for (const asset of prepared) {
    if (!totals.get(asset.id)) {
      throw new Error("Keine Projekt-Referenz für " + asset.id + " gefunden.");
    }
  }

  return { changes, totals };
}

async function installWebImages(prepared) {
  await mkdir(assetDir, { recursive: true });

  const existing = await readdir(assetDir).catch(() => []);
  for (const asset of prepared) {
    for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".avif"]) {
      await rm(join(assetDir, asset.base + ext), { force: true });
    }
    await writeFile(
      join(assetDir, asset.webFile),
      await readFile(join(tempDir, asset.webFile))
    );
  }

  return existing.length;
}

async function verify(prepared) {
  const files = await collectDeployableSourceFiles();
  const wixRemaining = [];
  const missingRefs = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    if (content.includes("static.wixstatic.com")) {
      wixRemaining.push(relative(repoRoot, filePath).split(sep).join("/"));
    }
  }

  for (const asset of prepared) {
    if (!(await exists(join(assetDir, asset.webFile)))) {
      missingRefs.push(asset.webFile);
    }
  }

  if (wixRemaining.length) {
    throw new Error("Noch produktive Wix-Referenzen vorhanden: " + wixRemaining.join(", "));
  }
  if (missingRefs.length) {
    throw new Error("Lokale Web-Bilder fehlen: " + missingRefs.join(", "));
  }
}

async function main() {
  console.log("GudeliusVermessung · Wix-Bildmigration");
  console.log("Repository: " + repoRoot);
  console.log("");

  const prepared = await prepareImages();
  const { changes, totals } = await planReplacements(prepared);

  console.log("");
  console.log("Quelltextänderungen: " + changes.length + " Datei(en)");
  for (const asset of prepared) {
    console.log("- " + asset.webFile + ": " + totals.get(asset.id) + " Referenz(en)");
  }

  await installWebImages(prepared);
  for (const change of changes) {
    await writeFile(change.filePath, change.content, "utf8");
  }

  await verify(prepared);
  await rm(tempDir, { recursive: true, force: true });

  const totalWebBytes = prepared.reduce((sum, asset) => sum + asset.webBytes, 0);
  console.log("");
  console.log("✓ 9 Originalbilder lokal unter cloudflare/.wix-originals/ gesichert.");
  console.log("✓ 9 weboptimierte Varianten unter assets/media/ gespeichert.");
  console.log("✓ Produktive HTML-/JS-Dateien enthalten keine Wix-Medien-URLs mehr.");
  console.log("✓ Cache-Version für geänderte JS-Dateien: " + CACHE_VERSION);
  console.log("✓ Gesamtgröße der Web-Bilder: " + totalWebBytes.toLocaleString("de-DE") + " Byte.");
  console.log("✓ Wix, DNS und R2-Konfiguration wurden nicht verändert.");
  console.log("");
  console.log("Die cloudflare/.wix-originals/ sind ein lokales Backup und werden nicht committed.");
}

main().catch(error => {
  console.error("✗ " + error.message);
  process.exitCode = 1;
});
