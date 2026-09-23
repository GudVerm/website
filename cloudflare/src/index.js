const MAX_MEDIA_BYTES = 15 * 1024 * 1024;
const MAX_CONTENT_BYTES = 1024 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true, service: "gudelius-cms" }, 200, cors);
      }

      if (url.pathname === "/api/site" && request.method === "GET") {
        const { results = [] } = await env.DB.prepare(
          "SELECT key, value, updated_at FROM content ORDER BY key"
        ).all();

        const content = {};
        for (const row of results) {
          try {
            content[row.key] = JSON.parse(row.value);
          } catch {
            content[row.key] = row.value;
          }
        }

        if (content["kontakt/email"] === "jost@gudeliusvermessung.de") {
          content["kontakt/email"] = "gudeliusvermessung@web.de";
          await env.DB.prepare(
            "UPDATE content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?"
          ).bind(JSON.stringify("gudeliusvermessung@web.de"), "kontakt/email").run();
        }

        return json({ content }, 200, cors);
      }


      if (url.pathname === "/api/contact") {
        if (request.method === "POST") {
          let payload;
          try {
            payload = await request.json();
          } catch {
            return json({ error: "Ungültige Anfrage." }, 400, cors);
          }

          const website = cleanText(payload.website, 200);
          if (website) {
            return json({ ok: true }, 200, cors);
          }

          const name = cleanText(payload.name, 160);
          const email = cleanText(payload.email, 240);
          const subject = cleanText(payload.subject, 240);
          const message = cleanText(payload.message, 5000);
          const source = cleanText(payload.source, 300) || "/";

          if (!name || !email || !subject || !message) {
            return json({ error: "Bitte alle Pflichtfelder ausfüllen." }, 400, cors);
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, 400, cors);
          }

          await ensureContactTable(env);
          const id = crypto.randomUUID();

          await env.DB.prepare(
            `INSERT INTO contact_requests
              (id, name, email, subject, message, source, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'neu', CURRENT_TIMESTAMP)`
          ).bind(id, name, email, subject, message, source).run();

          return json({
            ok: true,
            id,
            message: "Vielen Dank. Ihre Anfrage wurde übermittelt."
          }, 201, cors);
        }

        if (request.method === "GET") {
          if (!isAuthorized(request, env)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          await ensureContactTable(env);
          const { results = [] } = await env.DB.prepare(
            `SELECT id, name, email, subject, message, source, status, created_at
             FROM contact_requests
             ORDER BY created_at DESC
             LIMIT 100`
          ).all();

          return json({ inquiries: results }, 200, cors);
        }
      }

      if (url.pathname.startsWith("/api/contact/") && request.method === "PUT") {
        if (!isAuthorized(request, env)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }

        const id = decodeKey(url.pathname, "/api/contact/");
        if (!id) return json({ error: "Missing inquiry id" }, 400, cors);

        let payload;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Ungültige Anfrage." }, 400, cors);
        }

        const status = cleanText(payload.status, 30);
        const allowedStatuses = new Set(["neu", "in-arbeit", "erledigt"]);
        if (!allowedStatuses.has(status)) {
          return json({ error: "Ungültiger Status." }, 400, cors);
        }

        await ensureContactTable(env);
        const result = await env.DB.prepare(
          "UPDATE contact_requests SET status = ? WHERE id = ?"
        ).bind(status, id).run();

        if (!result.meta?.changes) {
          return json({ error: "Anfrage nicht gefunden." }, 404, cors);
        }

        return json({ ok: true, id, status }, 200, cors);
      }

      if (url.pathname.startsWith("/api/content/")) {
        const key = decodeKey(url.pathname, "/api/content/");
        if (!key) return json({ error: "Missing content key" }, 400, cors);

        if (request.method === "GET") {
          const row = await env.DB.prepare(
            "SELECT key, value, updated_at FROM content WHERE key = ?"
          ).bind(key).first();

          if (!row) return json({ error: "Not found" }, 404, cors);

          let value = row.value;
          try { value = JSON.parse(value); } catch {}

          return json({ key: row.key, value, updated_at: row.updated_at }, 200, cors);
        }

        if (request.method === "PUT") {
          if (!isAuthorized(request, env)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          const raw = await request.text();
          if (new TextEncoder().encode(raw).byteLength > MAX_CONTENT_BYTES) {
            return json({ error: "Content payload too large" }, 413, cors);
          }

          let value;
          try {
            value = JSON.parse(raw);
          } catch {
            return json({ error: "Body must be valid JSON" }, 400, cors);
          }

          await env.DB.prepare(
            `INSERT INTO content (key, value, updated_at)
             VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(key) DO UPDATE SET
               value = excluded.value,
               updated_at = CURRENT_TIMESTAMP`
          ).bind(key, JSON.stringify(value)).run();

          return json({ ok: true, key }, 200, cors);
        }
      }

      if (url.pathname.startsWith("/api/media/")) {
        const key = decodeKey(url.pathname, "/api/media/");
        if (!key) return json({ error: "Missing media key" }, 400, cors);

        if (request.method === "PUT") {
          if (!isAuthorized(request, env)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          const contentLength = Number(request.headers.get("content-length") || 0);
          if (contentLength > MAX_MEDIA_BYTES) {
            return json({ error: "File too large" }, 413, cors);
          }

          const bytes = await request.arrayBuffer();
          if (bytes.byteLength > MAX_MEDIA_BYTES) {
            return json({ error: "File too large" }, 413, cors);
          }

          const contentType = request.headers.get("content-type") || "application/octet-stream";
          await env.MEDIA.put(key, bytes, {
            httpMetadata: {
              contentType,
              cacheControl: "public, max-age=3600"
            },
            customMetadata: {
              originalName: request.headers.get("x-file-name") || key
            }
          });

          return json({
            ok: true,
            key,
            url: new URL("/media/" + encodePath(key), url).toString()
          }, 200, cors);
        }

        if (request.method === "DELETE") {
          if (!isAuthorized(request, env)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          await env.MEDIA.delete(key);
          return json({ ok: true, key }, 200, cors);
        }
      }

      if (url.pathname.startsWith("/media/") && request.method === "GET") {
        const key = decodeKey(url.pathname, "/media/");
        if (!key) return new Response("Not found", { status: 404, headers: cors });

        const object = await env.MEDIA.get(key);
        if (!object) return new Response("Not found", { status: 404, headers: cors });

        const headers = new Headers(cors);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "public, max-age=3600");

        return new Response(object.body, { headers });
      }

      return json({ error: "Not found" }, 404, cors);
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, 500, cors);
    }
  }
};

async function ensureContactTable(env) {
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS contact_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT '/',
        status TEXT NOT NULL DEFAULT 'neu',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at)"
    )
  ]);
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isAuthorized(request, env) {
  if (!env.CMS_ADMIN_TOKEN) return false;
  return request.headers.get("authorization") === `Bearer ${env.CMS_ADMIN_TOKEN}`;
}

function decodeKey(pathname, prefix) {
  const raw = pathname.slice(prefix.length);
  if (!raw) return "";
  return raw.split("/").map(part => decodeURIComponent(part)).join("/");
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = env.ALLOWED_ORIGIN || "*";
  const allowOrigin = allowed === "*" || origin === allowed ? (origin || allowed) : allowed;

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-file-name",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "content-type": "application/json; charset=utf-8"
    }
  });
}
