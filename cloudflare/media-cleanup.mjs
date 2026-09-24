const DEFAULT_API = "https://gudelius-cms.gudeliusvermessung.workers.dev";
const api = String(process.env.CMS_API || DEFAULT_API).replace(/\/$/, "");
const token = String(process.env.CMS_ADMIN_TOKEN || "");
const apply = process.argv.includes("--apply");

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

async function apiJson(path, options = {}) {
  const response = await fetch(api + path, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });
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
    if (data.truncated && !cursor) {
      throw new Error("R2-Liste ist abgeschnitten, aber Cursor fehlt.");
    }
  } while (cursor);
  return all;
}

function isKnownBadCrocodile(object) {
  const original = String(object.custom_metadata?.original_name || "").trim().toLowerCase();
  return original === "krokodil.png";
}

async function main() {
  const objects = await listAll();
  const targets = objects.filter(isKnownBadCrocodile);
  const untouched = objects.filter(object => !isKnownBadCrocodile(object));

  console.log("R2 gesamt: " + objects.length);
  console.log("Eindeutig als krokodil.png erkannte Fehldateien: " + targets.length);
  console.log("Nicht betroffene Objekte: " + untouched.length);
  console.log("");

  for (const object of targets) {
    console.log("- " + object.key + " | " + object.size + " Byte | " + (object.custom_metadata?.original_name || "–"));
  }

  if (untouched.length) {
    console.log("");
    console.log("NICHT ANGETASTET:");
    for (const object of untouched) {
      console.log("- " + object.key + " | Original: " + (object.custom_metadata?.original_name || "–"));
    }
  }

  if (!targets.length) {
    console.log("");
    console.log("Keine krokodil.png-Objekte gefunden. Nichts zu tun.");
    return;
  }

  if (!apply) {
    console.log("");
    console.log("DRY-RUN: Es wurde nichts gelöscht.");
    console.log("Wenn die Liste korrekt ist, ausführen:");
    console.log("npm run media:cleanup -- --apply");
    return;
  }

  console.log("");
  console.log("Lösche ausschließlich die oben gelisteten krokodil.png-Objekte …");

  let deleted = 0;
  for (const object of targets) {
    await apiJson("/api/media/" + encodeKey(object.key), { method: "DELETE" });
    deleted += 1;
    console.log("✓ gelöscht: " + object.key);
  }

  const after = await listAll();
  const remainingBad = after.filter(isKnownBadCrocodile);

  console.log("");
  console.log("Gelöscht: " + deleted);
  console.log("R2 verbleibend: " + after.length);
  console.log("Verbleibende krokodil.png-Objekte: " + remainingBad.length);

  if (remainingBad.length) {
    throw new Error("Bereinigung unvollständig: Es sind noch krokodil.png-Objekte vorhanden.");
  }

  console.log("Bereinigung abgeschlossen. Öffentliche R2-Ausgabe bleibt deaktiviert.");
}

main().catch(error => {
  console.error("✗ " + error.message);
  process.exitCode = 1;
});
