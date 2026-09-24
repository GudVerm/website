import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_API = "https://gudelius-cms.gudeliusvermessung.workers.dev";
const api = String(process.env.CMS_API || DEFAULT_API).replace(/\/$/, "");
const token = String(process.env.CMS_ADMIN_TOKEN || "");
const outDir = join(process.cwd(), ".media-audit");

if (!token) {
  console.error("CMS_ADMIN_TOKEN fehlt. Nur als lokale Umgebungsvariable setzen.");
  process.exit(1);
}

function authHeaders() {
  return { authorization: "Bearer " + token };
}

function encodeKey(key) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function safeName(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 90) || "media";
}

function extensionFor(type, originalName) {
  const fromOriginal = String(originalName || "").match(/\.[a-zA-Z0-9]{2,5}$/)?.[0]?.toLowerCase();
  if (fromOriginal) return fromOriginal;
  return {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif"
  }[String(type || "").toLowerCase()] || ".bin";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiJson(path) {
  const response = await fetch(api + path, { headers: authHeaders() });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!response.ok) {
    throw new Error(path + " -> HTTP " + response.status + ": " + (data?.error || text || "Unbekannter Fehler"));
  }
  return data;
}

async function listAll() {
  const all = [];
  let cursor = "";
  do {
    const params = new URLSearchParams({ limit: "200" });
    if (cursor) params.set("cursor", cursor);
    const data = await apiJson("/api/admin/media?" + params.toString());
    if (data.public_media_enabled !== false) {
      throw new Error("Abbruch: öffentliche R2-Medienausgabe ist unerwartet aktiviert.");
    }
    all.push(...(data.objects || []));
    cursor = data.truncated ? String(data.cursor || "") : "";
    if (data.truncated && !cursor) throw new Error("R2-Liste ist abgeschnitten, aber Cursor fehlt.");
  } while (cursor);
  return all;
}

async function downloadObject(object, index) {
  const type = object.http_metadata?.content_type || "";
  const originalName = object.custom_metadata?.original_name || "";
  const ext = extensionFor(type, originalName);
  const file = String(index + 1).padStart(3, "0") + "-" + safeName(object.key) + ext;
  const response = await fetch(api + "/api/admin/media/" + encodeKey(object.key), {
    headers: authHeaders()
  });
  if (!response.ok) {
    throw new Error("Download " + object.key + " -> HTTP " + response.status);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(join(outDir, file), bytes);
  return file;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  console.log("Lese geschütztes R2-Inventar …");
  const objects = await listAll();
  console.log(objects.length + " R2-Objekt(e) gefunden.");

  const inventory = [];
  for (let index = 0; index < objects.length; index += 1) {
    const object = objects[index];
    const file = await downloadObject(object, index);
    inventory.push({ ...object, local_file: file });
    console.log("✓ " + object.key + " -> " + file);
  }

  await writeFile(
    join(outDir, "inventory.json"),
    JSON.stringify({ generated_at: new Date().toISOString(), objects: inventory }, null, 2),
    "utf8"
  );

  const cards = inventory.map(item => {
    const type = item.http_metadata?.content_type || "";
    const image = type.startsWith("image/")
      ? `<img src="${encodeURI(item.local_file)}" alt="">`
      : `<div class="placeholder">Keine Bildvorschau</div>`;
    return `
      <article>
        ${image}
        <div class="meta">
          <strong>${escapeHtml(item.key)}</strong>
          <span>Original: ${escapeHtml(item.custom_metadata?.original_name || "–")}</span>
          <span>Typ: ${escapeHtml(type || "–")}</span>
          <span>Größe: ${Number(item.size || 0).toLocaleString("de-DE")} Byte</span>
          <span>Upload: ${escapeHtml(item.uploaded || "–")}</span>
        </div>
      </article>`;
  }).join("\n");

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gudelius R2 Medienprüfung</title>
<style>
body{font-family:Arial,sans-serif;margin:24px;background:#f5f5f2;color:#172026}
h1{margin-bottom:8px}.note{max-width:900px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
article{background:white;border:1px solid #d8ddd9;border-radius:12px;overflow:hidden}
img,.placeholder{width:100%;aspect-ratio:4/3;object-fit:cover;background:#eceeea;display:block}
.placeholder{display:grid;place-items:center;color:#667}
.meta{padding:14px;display:grid;gap:6px}.meta strong{word-break:break-all}.meta span{font-size:13px;color:#536066;word-break:break-word}
</style>
</head>
<body>
<h1>GudeliusVermessung · R2-Medienprüfung</h1>
<p class="note">Lokale, geschützte Prüfübersicht. Die öffentliche R2-Ausgabe bleibt deaktiviert. Nichts aus diesem Ordner committen.</p>
<div class="grid">${cards || "<p>Keine R2-Objekte vorhanden.</p>"}</div>
</body>
</html>`;

  await writeFile(join(outDir, "index.html"), html, "utf8");
  console.log("");
  console.log("Fertig: " + join(outDir, "index.html"));
  console.log("Öffne diese Datei lokal im Browser und prüfe die Bilder. Es wurde nichts gelöscht.");
}

main().catch(error => {
  console.error("✗ " + error.message);
  process.exitCode = 1;
});
