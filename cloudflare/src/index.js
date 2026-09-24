const MAX_MEDIA_BYTES = 15 * 1024 * 1024;
const MAX_CONTENT_BYTES = 1024 * 1024;
const MAX_CONTACT_BYTES = 16 * 1024;
const MAX_CONTACT_UPDATE_BYTES = 8 * 1024;
const MAX_ANALYTICS_BYTES = 4096;
const ANALYTICS_RETENTION_DAYS = 370;
const WORKER_RELEASE = "2026-09-24.5";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ADMIN_PAGE_SLUGS = new Set(["verbindung", "startseite", "leistungen", "unternehmen", "technik", "projekte", "anfragen", "statistik", "kontakt"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    url.pathname = normalizeAdminRoute(url.pathname, request.method);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      if (!isCorsPreflightAllowed(request, env)) {
        return json({ error: "Origin not allowed" }, 403, cors);
      }
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true, service: "gudelius-cms", release: WORKER_RELEASE }, 200, cors);
      }

      if (url.pathname === "/admin") {
        const target = new URL(request.url);
        target.pathname = "/admin/";
        target.search = "";
        return Response.redirect(target.toString(), 308);
      }

      if (url.pathname.startsWith("/admin/")) {
        return handleAdminUi(request, env, url);
      }

      if (url.pathname.startsWith("/assets/") && (request.method === "GET" || request.method === "HEAD")) {
        return handlePublicAssetProxy(request, env, url);
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        if (!isAuthorized(request, env, ctx)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }

        let email = "";
        if (ctx?.access) {
          try {
            const identity = await ctx.access.getIdentity();
            email = cleanSingleLine(identity?.email, 240);
          } catch (error) {
            console.error("Access identity lookup failed:", error);
          }
        }

        return json({
          ok: true,
          auth_mode: adminAuthMode(request, env, ctx),
          email,
          access_aud: ctx?.access?.aud || "",
          token_fallback_enabled: isAdminTokenFallbackEnabled(env)
        }, 200, cors);
      }

      if (url.pathname === "/api/admin/health" && request.method === "GET") {
        if (!isAuthorized(request, env, ctx)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }
        return handleAdminHealth(env, cors);
      }

      if (url.pathname === "/api/site" && request.method === "GET") {
        await ensureContentTable(env);
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
          if (!isAllowedPublicOrigin(request, env)) {
            return json({ error: "Origin not allowed" }, 403, cors);
          }
          if (!isJsonRequest(request)) {
            return json({ error: "Content-Type muss application/json sein." }, 415, cors);
          }
          const contentLength = Number(request.headers.get("content-length") || 0);
          if (contentLength > MAX_CONTACT_BYTES) {
            return json({ error: "Anfrage zu groß." }, 413, cors);
          }
          const raw = await request.text();
          if (new TextEncoder().encode(raw).byteLength > MAX_CONTACT_BYTES) {
            return json({ error: "Anfrage zu groß." }, 413, cors);
          }
          let payload;
          try {
            payload = JSON.parse(raw);
          } catch {
            return json({ error: "Ungültige Anfrage." }, 400, cors);
          }

          const website = cleanText(payload.website, 200);
          if (website) {
            return json({ ok: true }, 200, cors);
          }

          if (await isRateLimited(env.CONTACT_RATE_LIMITER, "contact-form")) {
            return json(
              { error: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." },
              429,
              { ...cors, "retry-after": "60" }
            );
          }

          const name = cleanSingleLine(payload.name, 160);
          const email = cleanSingleLine(payload.email, 240);
          const subject = cleanSingleLine(payload.subject, 240);
          const message = cleanText(payload.message, 5000);
          const source = normalizeContactSource(payload.source);

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

          let notificationSent = false;
          try {
            await sendContactNotification(env, {
              id,
              name,
              email,
              subject,
              message,
              source
            });
            notificationSent = true;
          } catch (emailError) {
            console.error("Kontaktanfrage gespeichert, E-Mail-Benachrichtigung fehlgeschlagen:", emailError);
          }

          return json({
            ok: true,
            id,
            notificationSent,
            message: "Vielen Dank. Ihre Anfrage wurde übermittelt."
          }, 201, cors);
        }

        if (request.method === "GET") {
          if (!isAuthorized(request, env, ctx)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          await ensureContactTable(env);
          const { results = [] } = await env.DB.prepare(
            `SELECT id, name, email, subject, message, source, status, internal_note, created_at
             FROM contact_requests
             ORDER BY created_at DESC`
          ).all();

          return json({ inquiries: results }, 200, cors);
        }
      }

      if (url.pathname.startsWith("/api/contact/") && request.method === "PUT") {
        if (!isAuthorized(request, env, ctx)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }

        const id = decodeKey(url.pathname, "/api/contact/");
        if (!id) return json({ error: "Missing inquiry id" }, 400, cors);

        const updateLength = Number(request.headers.get("content-length") || 0);
        if (updateLength > MAX_CONTACT_UPDATE_BYTES) {
          return json({ error: "Änderung zu groß." }, 413, cors);
        }
        const updateRaw = await request.text();
        if (new TextEncoder().encode(updateRaw).byteLength > MAX_CONTACT_UPDATE_BYTES) {
          return json({ error: "Änderung zu groß." }, 413, cors);
        }

        let payload;
        try {
          payload = JSON.parse(updateRaw);
        } catch {
          return json({ error: "Ungültige Anfrage." }, 400, cors);
        }

        const hasStatus = Object.prototype.hasOwnProperty.call(payload, "status");
        const hasNote = Object.prototype.hasOwnProperty.call(payload, "internal_note");
        if (!hasStatus && !hasNote) return json({ error: "Keine Änderung übermittelt." }, 400, cors);

        const status = hasStatus ? cleanText(payload.status, 30) : "";
        const internalNote = hasNote ? cleanText(payload.internal_note, 2000) : "";
        const allowedStatuses = new Set(["neu", "in-arbeit", "erledigt", "archiviert", "spam"]);
        if (hasStatus && !allowedStatuses.has(status)) return json({ error: "Ungültiger Status." }, 400, cors);

        await ensureContactTable(env);
        const fields = [];
        const values = [];
        if (hasStatus) { fields.push("status = ?"); values.push(status); }
        if (hasNote) { fields.push("internal_note = ?"); values.push(internalNote); }
        values.push(id);

        const result = await env.DB.prepare(
          "UPDATE contact_requests SET " + fields.join(", ") + " WHERE id = ?"
        ).bind(...values).run();

        if (!result.meta?.changes) return json({ error: "Anfrage nicht gefunden." }, 404, cors);
        return json({ ok: true, id }, 200, cors);
      }


      if (url.pathname === "/api/analytics/event" && request.method === "POST") {
        return handleAnalyticsEvent(request, env, cors);
      }

      if (url.pathname === "/api/admin/analytics" && request.method === "GET") {
        return handleAnalyticsAdmin(request, env, cors, url, ctx);
      }

      if (url.pathname === "/api/admin/media" && request.method === "GET") {
        if (!isAuthorized(request, env, ctx)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }
        return handleAdminMediaList(env, cors, url);
      }

      if (url.pathname.startsWith("/api/admin/media/") && request.method === "GET") {
        if (!isAuthorized(request, env, ctx)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }

        const key = decodeKey(url.pathname, "/api/admin/media/");
        if (!key || !isSafeMediaKey(key)) {
          return json({ error: "Ungültiger Medien-Key." }, 400, cors);
        }

        const object = await env.MEDIA.get(key);
        if (!object) {
          return json({ error: "Not found" }, 404, cors);
        }

        const headers = new Headers(cors);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "no-store");
        headers.set("x-content-type-options", "nosniff");
        headers.set("content-disposition", "inline");
        return new Response(object.body, { status: 200, headers });
      }

      if (url.pathname.startsWith("/api/content/")) {
        const key = decodeKey(url.pathname, "/api/content/");
        if (!key) return json({ error: "Missing content key" }, 400, cors);
        await ensureContentTable(env);

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
          if (!isAuthorized(request, env, ctx)) {
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

        if (request.method === "DELETE") {
          if (!isAuthorized(request, env, ctx)) return json({ error: "Unauthorized" }, 401, cors);
          await env.DB.prepare("DELETE FROM content WHERE key = ?").bind(key).run();
          return json({ ok: true, key }, 200, cors);
        }
      }

      if (url.pathname.startsWith("/api/media/")) {
        const key = decodeKey(url.pathname, "/api/media/");
        if (!key) return json({ error: "Missing media key" }, 400, cors);

        if (request.method === "PUT") {
          if (!isAuthorized(request, env, ctx)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }
          if (!isSafeMediaKey(key)) {
            return json({ error: "Ungültiger Medien-Key." }, 400, cors);
          }
          if (await isRateLimited(env.MEDIA_RATE_LIMITER, "admin-media")) {
            return json(
              { error: "Zu viele Medienänderungen. Bitte versuchen Sie es in einer Minute erneut." },
              429,
              { ...cors, "retry-after": "60" }
            );
          }

          const contentLength = Number(request.headers.get("content-length") || 0);
          if (contentLength > MAX_MEDIA_BYTES) {
            return json({ error: "File too large" }, 413, cors);
          }

          const contentType = normalizeMediaType(request.headers.get("content-type"));
          if (!ALLOWED_MEDIA_TYPES.has(contentType)) {
            return json({ error: "Nicht unterstützter Dateityp." }, 415, cors);
          }

          const bytes = await request.arrayBuffer();
          if (bytes.byteLength > MAX_MEDIA_BYTES) {
            return json({ error: "File too large" }, 413, cors);
          }

          const detectedType = detectImageMime(new Uint8Array(bytes));
          if (!detectedType || detectedType !== contentType) {
            return json({ error: "Dateiinhalt und MIME-Typ stimmen nicht überein." }, 415, cors);
          }

          const originalName = sanitizeFileName(request.headers.get("x-file-name"), contentType);
          await env.MEDIA.put(key, bytes, {
            httpMetadata: {
              contentType,
              cacheControl: "public, max-age=3600"
            },
            customMetadata: {
              originalName
            }
          });

          return json({
            ok: true,
            key,
            url: new URL("/media/" + encodePath(key), url).toString()
          }, 200, cors);
        }

        if (request.method === "DELETE") {
          if (!isAuthorized(request, env, ctx)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          await env.MEDIA.delete(key);
          return json({ ok: true, key }, 200, cors);
        }
      }

      if (url.pathname.startsWith("/media/") && request.method === "GET") {
        if (!isPublicMediaEnabled(env)) {
          return new Response("Not found", {
            status: 404,
            headers: { ...cors, "cache-control": "no-store", "x-content-type-options": "nosniff" }
          });
        }

        const key = decodeKey(url.pathname, "/media/");
        if (!key || !isSafeMediaKey(key)) {
          return new Response("Not found", { status: 404, headers: cors });
        }

        const object = await env.MEDIA.get(key);
        if (!object) return new Response("Not found", { status: 404, headers: cors });

        const headers = new Headers(cors);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "public, max-age=3600");
        headers.set("x-content-type-options", "nosniff");
        headers.set("cross-origin-resource-policy", "cross-origin");

        return new Response(object.body, { headers });
      }

      return json({ error: "Not found" }, 404, cors);
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, 500, cors);
    }
  }
};

function normalizeBaseUrl(value, fallback) {
  const raw = cleanSingleLine(value || fallback, 500).trim();
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    parsed.search = "";
    if (!parsed.pathname.endsWith("/")) parsed.pathname += "/";
    return parsed.toString();
  } catch {
    return fallback;
  }
}

function publicSiteUrl(env) {
  return normalizeBaseUrl(env.PUBLIC_SITE_URL, "https://gudverm.github.io/website/");
}

function adminAppUrl(env) {
  return normalizeBaseUrl(env.ADMIN_APP_URL, "https://gudelius-cms.gudeliusvermessung.workers.dev/admin/");
}

function adminSourcePath(pathname) {
  if (pathname === "/admin/") return "admin/index.html";
  if (pathname === "/admin/admin.css") return "admin/admin.css";
  if (pathname === "/admin/admin.js") return "admin/admin.js";
  const match = pathname.match(/^\/admin\/([a-z0-9-]+)\/?$/);
  if (match && ADMIN_PAGE_SLUGS.has(match[1])) return "admin/" + match[1] + "/index.html";
  return "";
}

function adminUiHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "x-robots-tag": "noindex, nofollow, noarchive"
  };
}

function renderAdminConfig(env, requestUrl) {
  const origin = new URL(requestUrl).origin;
  return [
    "window.GUDELIUS_CMS_API = " + JSON.stringify(origin) + ";",
    "window.GUDELIUS_CMS_MEDIA_ENABLED = " + JSON.stringify(isPublicMediaEnabled(env)) + ";",
    "window.GUDELIUS_CMS_USE_ACCESS = true;",
    "window.GUDELIUS_PUBLIC_SITE_URL = " + JSON.stringify(publicSiteUrl(env)) + ";"
  ].join("\n") + "\n";
}

async function handleAdminUi(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { ...adminUiHeaders("text/plain; charset=utf-8"), "allow": "GET, HEAD" } });
  }
  if (url.pathname === "/admin/config.js") {
    return new Response(request.method === "HEAD" ? null : renderAdminConfig(env, request.url), {
      status: 200,
      headers: adminUiHeaders("application/javascript; charset=utf-8")
    });
  }

  const sourcePath = adminSourcePath(url.pathname);
  if (!sourcePath) return new Response("Not found", { status: 404, headers: adminUiHeaders("text/plain; charset=utf-8") });

  const sourceUrl = new URL(sourcePath, publicSiteUrl(env));
  const upstream = await fetch(sourceUrl, { method: "GET", headers: { "user-agent": "GudeliusVermessung-AdminProxy/1.0" }, redirect: "follow" });
  if (!upstream.ok) {
    console.error("Admin UI source failed:", sourceUrl.toString(), upstream.status);
    return new Response("Admin-Oberfläche konnte nicht geladen werden.", {
      status: upstream.status === 404 ? 404 : 502,
      headers: adminUiHeaders("text/plain; charset=utf-8")
    });
  }

  let body = await upstream.text();
  const contentType = sourcePath.endsWith(".css") ? "text/css; charset=utf-8"
    : sourcePath.endsWith(".js") ? "application/javascript; charset=utf-8"
    : "text/html; charset=utf-8";

  if (contentType.startsWith("text/html")) {
    body = body
      .replaceAll('href="../">Website öffnen ↗', 'href="' + publicSiteUrl(env) + '">Website öffnen ↗')
      .replace(/config\.js\?v=[0-9A-Za-z._-]+/g, "config.js?v=20260924-42")
      .replace(/admin\.js\?v=[0-9A-Za-z._-]+/g, "admin.js?v=20260924-42")
      .replace("Cloudflare Worker und Admin-Token verwalten.", "Cloudflare-Verbindung und Admin-Anmeldung verwalten.")
      .replace("<h3>Worker & Admin-Token</h3>", "<h3>CMS-Zugang</h3>")
      .replace("Die Worker-URL ist fest hinterlegt. Das Admin-Token wird nur in dieser Browser-Sitzung gespeichert.", "Auf dieser Cloudflare-Adminadresse erfolgt die Anmeldung über Cloudflare Access. Ein Browser-Token ist hier nicht erforderlich.");
  }

  return new Response(request.method === "HEAD" ? null : body, { status: 200, headers: adminUiHeaders(contentType) });
}

async function handlePublicAssetProxy(request, env, url) {
  if (!/^\/assets\/[A-Za-z0-9._~!$&'()*+,;=:@%\/-]+$/.test(url.pathname) || url.pathname.includes("..")) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }
  const sourceUrl = new URL(url.pathname.slice(1), publicSiteUrl(env));
  const upstream = await fetch(sourceUrl, { method: "GET", headers: { "user-agent": "GudeliusVermessung-AssetProxy/1.0" }, redirect: "follow" });
  if (!upstream.ok) return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

  const headers = new Headers();
  const type = upstream.headers.get("content-type");
  if (type) headers.set("content-type", type);
  const etag = upstream.headers.get("etag");
  if (etag) headers.set("etag", etag);
  headers.set("cache-control", "public, max-age=300");
  headers.set("x-content-type-options", "nosniff");
  headers.set("cross-origin-resource-policy", "same-origin");
  return new Response(request.method === "HEAD" ? null : upstream.body, { status: 200, headers });
}

async function handleAdminHealth(env, cors) {
  let dbOk = false;
  let mediaOk = false;
  let schema = {
    content: false,
    contact_requests: false,
    analytics_events: false
  };

  try {
    await ensureContentTable(env);
    await ensureContactTable(env);
    await ensureAnalyticsTable(env);

    const [contentInfo, contactInfo, analyticsInfo] = await Promise.all([
      env.DB.prepare("PRAGMA table_info(content)").all(),
      env.DB.prepare("PRAGMA table_info(contact_requests)").all(),
      env.DB.prepare("PRAGMA table_info(analytics_events)").all()
    ]);

    schema = {
      content: hasColumns(contentInfo.results || [], ["key", "value", "updated_at"]),
      contact_requests: hasColumns(contactInfo.results || [], ["id", "name", "email", "subject", "message", "source", "status", "internal_note", "created_at"]),
      analytics_events: hasColumns(analyticsInfo.results || [], ["id", "event_type", "page_path", "target", "event_label", "created_at"])
    };
    dbOk = Object.values(schema).every(Boolean);
  } catch (error) {
    console.error("Admin health D1 check failed:", error);
  }

  try {
    if (env.MEDIA?.head) {
      await env.MEDIA.head("__gudelius_healthcheck__");
      mediaOk = true;
    }
  } catch (error) {
    console.error("Admin health R2 check failed:", error);
  }

  const bindings = {
    db: dbOk,
    media: mediaOk,
    brevo_api_key: Boolean(env.BREVO_API_KEY),
    brevo_from_email: Boolean(env.BREVO_FROM_EMAIL),
    contact_email_to: Boolean(env.CONTACT_EMAIL_TO),
    allowed_origin: getAllowedOrigins(env).length > 0,
    admin_token: Boolean(env.CMS_ADMIN_TOKEN)
  };

  const ok = Object.values(bindings).every(Boolean) && Object.values(schema).every(Boolean);
  return json({
    ok,
    service: "gudelius-cms",
    release: WORKER_RELEASE,
    public_media_enabled: isPublicMediaEnabled(env),
    bindings,
    schema
  }, ok ? 200 : 503, cors);
}

function hasColumns(rows, expected) {
  const names = new Set(rows.map(row => row.name));
  return expected.every(name => names.has(name));
}

async function handleAdminMediaList(env, cors, url) {
  const limit = clampNumber(url.searchParams.get("limit"), 1, 1000, 200);
  const prefix = cleanText(url.searchParams.get("prefix") || "", 240);
  const cursor = cleanText(url.searchParams.get("cursor") || "", 2048);

  const options = {
    limit,
    include: ["httpMetadata", "customMetadata"]
  };
  if (prefix) options.prefix = prefix;
  if (cursor) options.cursor = cursor;

  const listed = await env.MEDIA.list(options);
  const objects = (listed.objects || []).map(object => ({
    key: object.key,
    size: Number(object.size || 0),
    etag: object.etag || "",
    uploaded: object.uploaded instanceof Date ? object.uploaded.toISOString() : String(object.uploaded || ""),
    http_metadata: {
      content_type: object.httpMetadata?.contentType || "",
      cache_control: object.httpMetadata?.cacheControl || ""
    },
    custom_metadata: {
      original_name: object.customMetadata?.originalName || ""
    }
  }));

  return json({
    objects,
    truncated: Boolean(listed.truncated),
    cursor: listed.truncated ? (listed.cursor || "") : "",
    public_media_enabled: isPublicMediaEnabled(env)
  }, 200, cors);
}

async function sendContactNotification(env, inquiry) {
  if (!env.BREVO_API_KEY || !env.BREVO_FROM_EMAIL || !env.CONTACT_EMAIL_TO) {
    throw new Error("Brevo API key, sender or recipient is not configured.");
  }

  const recipient = env.CONTACT_EMAIL_TO;
  const senderName = cleanSingleLine(env.BREVO_FROM_NAME || "GudeliusVermessung", 120) || "GudeliusVermessung";
  const adminUrl = new URL("anfragen/", adminAppUrl(env)).toString();
  const subject = `Neue Projektanfrage: ${inquiry.subject}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#172026">
      <div style="background:#172026;color:#fff;padding:22px 26px;border-radius:14px 14px 0 0">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#e5c533;font-weight:700">GudeliusVermessung</div>
        <h1 style="font-size:22px;margin:8px 0 0">Neue Projektanfrage</h1>
      </div>
      <div style="border:1px solid #dce1dd;border-top:0;padding:26px;border-radius:0 0 14px 14px">
        <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p>
        <p><strong>E-Mail:</strong> <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p>
        <p><strong>Betreff:</strong> ${escapeHtml(inquiry.subject)}</p>
        <p><strong>Quelle:</strong> ${escapeHtml(inquiry.source)}</p>
        <div style="margin:22px 0;padding:18px;background:#f5f4ee;border-radius:10px">
          <strong>Nachricht</strong>
          <p style="white-space:pre-wrap;line-height:1.6;margin:10px 0 0">${escapeHtml(inquiry.message)}</p>
        </div>
        <p style="margin:22px 0 0">
          <a href="${adminUrl}" style="display:inline-block;background:#172026;color:#fff;text-decoration:none;padding:11px 15px;border-radius:8px;font-weight:700">Anfrage im CMS öffnen</a>
        </p>
        <p style="font-size:12px;color:#67757b;margin-top:22px">Anfrage-ID: ${escapeHtml(inquiry.id)}</p>
      </div>
    </div>
  `;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: env.BREVO_FROM_EMAIL
      },
      to: [{
        name: "GudeliusVermessung",
        email: recipient
      }],
      replyTo: {
        name: inquiry.name,
        email: inquiry.email
      },
      subject,
      htmlContent: html,
      tags: ["kontaktformular"]
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const detail = cleanSingleLine(
      data?.message || data?.code || ("HTTP " + response.status),
      300
    );
    throw new Error("Brevo API: " + detail);
  }

  const data = await response.json().catch(() => ({}));
  return data?.messageId || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


async function handleAnalyticsEvent(request, env, cors) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_ANALYTICS_BYTES) return json({ error: "Analytics payload too large" }, 413, cors);
  if (!isAllowedPublicOrigin(request, env)) return json({ error: "Origin not allowed" }, 403, cors);
  if (!isJsonRequest(request)) return json({ error: "Content-Type muss application/json sein." }, 415, cors);
  if (await isRateLimited(env.ANALYTICS_RATE_LIMITER, "analytics-events")) {
    return json({ error: "Too many analytics events" }, 429, { ...cors, "retry-after": "60" });
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (looksLikeBot(userAgent)) return json({ ok: true, ignored: true }, 202, cors);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_ANALYTICS_BYTES) {
    return json({ error: "Analytics payload too large" }, 413, cors);
  }

  let payload;
  try { payload = JSON.parse(raw); } catch { return json({ error: "Ungültiges Analytics-Ereignis." }, 400, cors); }

  const allowedTypes = new Set(["pageview","nav_click","cta_click","service_open","equipment_open","project_open","contact_action","form_submit"]);
  const eventType = cleanText(payload.event_type, 40);
  if (!allowedTypes.has(eventType)) return json({ error: "Ungültiger Event-Typ." }, 400, cors);

  const pagePath = normalizeAnalyticsPath(payload.page_path);
  if (!pagePath || pagePath.startsWith("/admin/") || pagePath.startsWith("/api/")) {
    return json({ ok: true, ignored: true }, 202, cors);
  }

  const target = cleanText(payload.target, 80);
  const eventLabel = cleanText(payload.event_label, 140);

  await ensureAnalyticsTable(env);
  await env.DB.prepare(
    "INSERT INTO analytics_events (event_type, page_path, target, event_label, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
  ).bind(eventType, pagePath, target, eventLabel).run();

  await purgeOldAnalytics(env);

  return json({ ok: true }, 201, cors);
}

async function handleAnalyticsAdmin(request, env, cors, url, ctx) {
  if (!isAuthorized(request, env, ctx)) return json({ error: "Unauthorized" }, 401, cors);

  await ensureAnalyticsTable(env);
  await ensureContactTable(env);
  await purgeOldAnalytics(env);

  const period = normalizeAnalyticsPeriod(url.searchParams.get("period"));
  const offsetMinutes = clampNumber(url.searchParams.get("offset_minutes"), -840, 840, 0);
  const window = analyticsWindow(period, offsetMinutes);
  const filter = analyticsSqlFilter(window);

  const summary = await env.DB.prepare(
    "SELECT " +
    "COALESCE(SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END), 0) AS pageviews, " +
    "COALESCE(SUM(CASE WHEN event_type <> 'pageview' THEN 1 ELSE 0 END), 0) AS interactions, " +
    "COALESCE(SUM(CASE WHEN event_type IN ('contact_action','form_submit') OR (event_type = 'cta_click' AND target = 'contact') THEN 1 ELSE 0 END), 0) AS contact_actions " +
    "FROM analytics_events" + filter.sql
  ).bind(...filter.bindings).first();

  const inquiries = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM contact_requests " + filter.wherePrefix + " status <> 'spam'"
  ).bind(...filter.bindings).first();

  const topPagesQuery =
    "SELECT page_path, COUNT(*) AS count FROM analytics_events " +
    filter.wherePrefix + " event_type = 'pageview' " +
    "GROUP BY page_path ORDER BY count DESC, page_path ASC LIMIT 20";
  const { results: topPages = [] } = await env.DB.prepare(topPagesQuery).bind(...filter.bindings).all();

  const topActionsQuery =
    "SELECT event_type, target, event_label, COUNT(*) AS count FROM analytics_events " +
    filter.wherePrefix + " event_type <> 'pageview' " +
    "GROUP BY event_type, target, event_label ORDER BY count DESC, event_label ASC LIMIT 20";
  const { results: topActions = [] } = await env.DB.prepare(topActionsQuery).bind(...filter.bindings).all();

  const localModifier = formatSqliteMinuteModifier(-offsetMinutes);
  const bucketFormat = window.granularity === "hour" ? "%H:00" : (window.granularity === "month" ? "%Y-%m" : "%Y-%m-%d");
  const timelineQuery =
    "SELECT strftime('" + bucketFormat + "', datetime(created_at, ?)) AS label, " +
    "COALESCE(SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END), 0) AS pageviews, " +
    "COALESCE(SUM(CASE WHEN event_type IN ('contact_action','form_submit') OR (event_type = 'cta_click' AND target = 'contact') THEN 1 ELSE 0 END), 0) AS contact_actions " +
    "FROM analytics_events" + filter.sql + " GROUP BY label ORDER BY label ASC";
  const { results: timeline = [] } = await env.DB.prepare(timelineQuery).bind(localModifier, ...filter.bindings).all();

  const contactQuery =
    "SELECT event_type, target, COUNT(*) AS count FROM analytics_events " +
    filter.wherePrefix + " (event_type IN ('contact_action','form_submit') OR (event_type = 'cta_click' AND target = 'contact')) " +
    "GROUP BY event_type, target ORDER BY count DESC";
  const { results: contactBreakdown = [] } = await env.DB.prepare(contactQuery).bind(...filter.bindings).all();

  const serviceDefinitions = [
    ["ingenieurvermessung", "/leistungen/ingenieurvermessung/"],
    ["gis-bauvermessung", "/leistungen/gis-bauvermessung/"],
    ["3d-laserscanning", "/leistungen/3d-laserscanning/"],
    ["drohnenvermessung", "/leistungen/drohnenvermessung/"]
  ];
  const services = [];
  for (const [slug, path] of serviceDefinitions) {
    const query =
      "SELECT " +
      "COALESCE(SUM(CASE WHEN event_type = 'pageview' AND page_path = ? THEN 1 ELSE 0 END), 0) AS pageviews, " +
      "COALESCE(SUM(CASE WHEN event_type = 'service_open' AND target = ? THEN 1 ELSE 0 END), 0) AS card_clicks, " +
      "COALESCE(SUM(CASE WHEN event_type = 'cta_click' AND page_path = ? AND target = 'contact' THEN 1 ELSE 0 END), 0) AS contact_cta " +
      "FROM analytics_events" + filter.sql;
    const row = await env.DB.prepare(query).bind(path, slug, path, ...filter.bindings).first();
    services.push({ slug, pageviews: Number(row?.pageviews || 0), card_clicks: Number(row?.card_clicks || 0), contact_cta: Number(row?.contact_cta || 0) });
  }

  let previousPageviews = null;
  if (window.previousStart && window.previousEnd) {
    const previousFilter = analyticsSqlFilter({ start: window.previousStart, end: window.previousEnd });
    const previousQuery = "SELECT COUNT(*) AS count FROM analytics_events " + previousFilter.wherePrefix + " event_type = 'pageview'";
    const previous = await env.DB.prepare(previousQuery).bind(...previousFilter.bindings).first();
    previousPageviews = Number(previous?.count || 0);
  }

  return json({
    period,
    retention_days: ANALYTICS_RETENTION_DAYS,
    summary: {
      pageviews: Number(summary?.pageviews || 0),
      interactions: Number(summary?.interactions || 0),
      contact_actions: Number(summary?.contact_actions || 0),
      inquiries: Number(inquiries?.count || 0),
      previous_pageviews: previousPageviews
    },
    top_pages: topPages,
    top_actions: topActions,
    services,
    contact_breakdown: contactBreakdown,
    timeline
  }, 200, cors);
}

async function ensureContentTable(env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS content (" +
    "key TEXT PRIMARY KEY, " +
    "value TEXT NOT NULL, " +
    "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
  ).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_content_updated_at ON content(updated_at)").run();
}

async function ensureAnalyticsTable(env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS analytics_events (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "event_type TEXT NOT NULL, " +
    "page_path TEXT NOT NULL DEFAULT '/', " +
    "target TEXT NOT NULL DEFAULT '', " +
    "event_label TEXT NOT NULL DEFAULT '', " +
    "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
  ).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_analytics_type_path ON analytics_events(event_type, page_path)").run();
}

function normalizeAnalyticsPath(value) {
  if (typeof value !== "string") return "";
  let path = value.trim().split("?")[0].split("#")[0].slice(0, 220);
  if (!path.startsWith("/")) path = "/" + path;
  path = path.replace(/\/+/g, "/");
  if (path === "/website") path = "/";
  if (path.startsWith("/website/")) path = path.slice("/website".length);
  if (path.length > 1 && !path.endsWith("/") && !path.includes(".")) path += "/";
  return path;
}

function looksLikeBot(userAgent) {
  return /bot|crawler|spider|headless|lighthouse|pagespeed|uptime|monitor/i.test(userAgent || "");
}

async function purgeOldAnalytics(env) {
  await env.DB.prepare(
    "DELETE FROM analytics_events WHERE created_at < datetime('now', ?)"
  ).bind("-" + ANALYTICS_RETENTION_DAYS + " days").run();
}

function isAllowedPublicOrigin(request, env) {
  const origin = request.headers.get("origin") || "";
  if (!origin || origin === "null") return false;
  return isOriginAllowed(origin, env);
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, env) {
  const allowed = getAllowedOrigins(env);
  return allowed.includes("*") || allowed.includes(origin);
}

function isCorsPreflightAllowed(request, env) {
  const origin = request.headers.get("origin") || "";
  return !origin || isOriginAllowed(origin, env);
}

function normalizeAnalyticsPeriod(value) {
  return new Set(["today","7","30","year","all"]).has(value) ? value : "30";
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function sqliteTimestamp(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function analyticsWindow(period, offsetMinutes) {
  const now = new Date();
  const localNow = new Date(now.getTime() - offsetMinutes * 60000);
  const year = localNow.getUTCFullYear();
  const month = localNow.getUTCMonth();
  const day = localNow.getUTCDate();
  const localDateUtc = (y, m, d) => new Date(Date.UTC(y, m, d) + offsetMinutes * 60000);

  let start = null;
  let granularity = "day";
  if (period === "today") { start = localDateUtc(year, month, day); granularity = "hour"; }
  else if (period === "7") start = localDateUtc(year, month, day - 6);
  else if (period === "30") start = localDateUtc(year, month, day - 29);
  else if (period === "year") { start = localDateUtc(year, 0, 1); granularity = "month"; }
  else { start = localDateUtc(year, month, day - (ANALYTICS_RETENTION_DAYS - 1)); granularity = "month"; }

  let previousStart = null;
  let previousEnd = null;
  if ((period === "7" || period === "30") && start) {
    const duration = now.getTime() - start.getTime();
    previousEnd = start;
    previousStart = new Date(start.getTime() - duration);
  }
  return { start, end: now, previousStart, previousEnd, granularity };
}

function analyticsSqlFilter(window) {
  if (!window?.start) return { sql: "", wherePrefix: "WHERE", bindings: [] };
  const bindings = [sqliteTimestamp(window.start), sqliteTimestamp(window.end || new Date())];
  return { sql: " WHERE created_at >= ? AND created_at < ?", wherePrefix: "WHERE created_at >= ? AND created_at < ? AND", bindings };
}

function formatSqliteMinuteModifier(minutes) {
  const value = Number(minutes) || 0;
  return (value >= 0 ? "+" : "") + value + " minutes";
}

async function ensureContactTable(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '/',
      status TEXT NOT NULL DEFAULT 'neu',
      internal_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  const { results = [] } = await env.DB.prepare("PRAGMA table_info(contact_requests)").all();
  if (!results.some(column => column.name === "internal_note")) {
    await env.DB.prepare("ALTER TABLE contact_requests ADD COLUMN internal_note TEXT NOT NULL DEFAULT ''").run();
  }
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at)").run();
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanSingleLine(value, maxLength) {
  return cleanText(value, maxLength).replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ");
}

function normalizeContactSource(value) {
  const source = cleanSingleLine(value, 300);
  if (!source) return "/";
  const path = source.split("?")[0].split("#")[0];
  return path.startsWith("/") ? path : "/";
}

function isJsonRequest(request) {
  const contentType = request.headers.get("content-type") || "";
  return contentType.toLowerCase().split(";")[0].trim() === "application/json";
}

async function isRateLimited(binding, key) {
  if (!binding?.limit) return false;
  const result = await binding.limit({ key });
  return result?.success === false;
}

function isPublicMediaEnabled(env) {
  return /^(1|true|yes)$/i.test(String(env.PUBLIC_MEDIA_ENABLED || ""));
}

function normalizeMediaType(value) {
  return String(value || "").toLowerCase().split(";")[0].trim();
}

function isSafeMediaKey(key) {
  if (!key || key.length > 240 || key.startsWith("/") || key.includes("\\")) return false;
  if (/[\u0000-\u001f\u007f]/.test(key)) return false;
  const parts = key.split("/");
  return parts.every(part => part && part !== "." && part !== ".." && part.length <= 120);
}

function sanitizeFileName(value, contentType) {
  const extension = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif"
  }[contentType] || "";
  let name = String(value || "").split(/[\\/]/).pop() || ("upload" + extension);
  name = name.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[^a-zA-Z0-9._ -]/g, "_").trim();
  if (!name || name === "." || name === "..") name = "upload" + extension;
  return name.slice(0, 120);
}

function detectImageMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 16 && ascii(bytes, 4, 8) === "ftyp") {
    const end = Math.min(bytes.length, 64);
    for (let offset = 8; offset + 4 <= end; offset += 4) {
      const brand = ascii(bytes, offset, offset + 4);
      if (brand === "avif" || brand === "avis") return "image/avif";
    }
  }
  return "";
}

function ascii(bytes, start, end) {
  return String.fromCharCode(...bytes.slice(start, end));
}

function normalizeAdminRoute(pathname, method) {
  if (pathname === "/api/admin/inquiries" && method === "GET") {
    return "/api/contact";
  }
  if (pathname.startsWith("/api/admin/inquiries/") && method === "PUT") {
    return "/api/contact/" + pathname.slice("/api/admin/inquiries/".length);
  }
  if (pathname.startsWith("/api/admin/content/") && (method === "PUT" || method === "DELETE")) {
    return "/api/content/" + pathname.slice("/api/admin/content/".length);
  }
  if (pathname.startsWith("/api/admin/media/") && (method === "PUT" || method === "DELETE")) {
    return "/api/media/" + pathname.slice("/api/admin/media/".length);
  }
  return pathname;
}

function isAdminTokenFallbackEnabled(env) {
  return String(env.ADMIN_TOKEN_FALLBACK_ENABLED ?? "true").trim().toLowerCase() !== "false";
}

function adminAuthMode(request, env, ctx) {
  if (ctx?.access) return "access";
  if (!isAdminTokenFallbackEnabled(env) || !env.CMS_ADMIN_TOKEN) return "none";
  return request.headers.get("authorization") === `Bearer ${env.CMS_ADMIN_TOKEN}` ? "token" : "none";
}

function isAuthorized(request, env, ctx) {
  return adminAuthMode(request, env, ctx) !== "none";
}

function decodeKey(pathname, prefix) {
  const raw = pathname.slice(prefix.length);
  if (!raw) return "";
  try {
    return raw.split("/").map(part => decodeURIComponent(part)).join("/");
  } catch {
    return "";
  }
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const headers = {
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-file-name",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };

  if (origin && isOriginAllowed(origin, env)) {
    headers["access-control-allow-origin"] = origin;
  } else if (!origin && getAllowedOrigins(env).includes("*")) {
    headers["access-control-allow-origin"] = "*";
  }

  return headers;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
