const MAX_MEDIA_BYTES = 15 * 1024 * 1024;
const MAX_CONTENT_BYTES = 1024 * 1024;
const MAX_ANALYTICS_BYTES = 4096;
const ANALYTICS_RETENTION_DAYS = 180;

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
          if (!isAuthorized(request, env)) {
            return json({ error: "Unauthorized" }, 401, cors);
          }

          await ensureContactTable(env);
          const { results = [] } = await env.DB.prepare(
            `SELECT id, name, email, subject, message, source, status, internal_note, created_at
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
        return handleAnalyticsAdmin(request, env, cors, url);
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

        if (request.method === "DELETE") {
          if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, 401, cors);
          await env.DB.prepare("DELETE FROM content WHERE key = ?").bind(key).run();
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

async function sendContactNotification(env, inquiry) {
  if (!env.CONTACT_EMAIL || !env.CONTACT_EMAIL_FROM) {
    throw new Error("Email binding or sender is not configured.");
  }

  const recipient = "gudeliusvermessung@web.de";
  const adminUrl = "https://gudverm.github.io/website/admin/anfragen/";
  const subject = `Neue Projektanfrage: ${inquiry.subject}`;

  const text = [
    "Neue Projektanfrage über gudeliusvermessung.de",
    "",
    "Name: " + inquiry.name,
    "E-Mail: " + inquiry.email,
    "Betreff: " + inquiry.subject,
    "Quelle: " + inquiry.source,
    "",
    "Nachricht:",
    inquiry.message,
    "",
    "Anfrage-ID: " + inquiry.id,
    "Im CMS öffnen: " + adminUrl
  ].join("\n");

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

  await env.CONTACT_EMAIL.send({
    from: env.CONTACT_EMAIL_FROM,
    to: recipient,
    replyTo: inquiry.email,
    subject,
    text,
    html
  });
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
  if (!isAllowedAnalyticsOrigin(request, env)) return json({ error: "Origin not allowed" }, 403, cors);

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

  await env.DB.prepare(
    "DELETE FROM analytics_events WHERE created_at < datetime('now', ?)"
  ).bind("-" + ANALYTICS_RETENTION_DAYS + " days").run();

  return json({ ok: true }, 201, cors);
}

async function handleAnalyticsAdmin(request, env, cors, url) {
  if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, 401, cors);

  await ensureAnalyticsTable(env);
  await ensureContactTable(env);

  const period = normalizeAnalyticsPeriod(url.searchParams.get("period"));
  const offsetMinutes = clampNumber(url.searchParams.get("offset_minutes"), -840, 840, 0);
  const window = analyticsWindow(period, offsetMinutes);
  const filter = analyticsSqlFilter(window);

  const summary = await env.DB.prepare(
    "SELECT " +
    "COALESCE(SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END), 0) AS pageviews, " +
    "COALESCE(SUM(CASE WHEN event_type <> 'pageview' THEN 1 ELSE 0 END), 0) AS interactions, " +
    "COALESCE(SUM(CASE WHEN event_type IN ('contact_action','form_submit') THEN 1 ELSE 0 END), 0) AS contact_actions " +
    "FROM analytics_events" + filter.sql
  ).bind(...filter.bindings).first();

  const inquiries = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM contact_requests" + filter.sql
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
    "COALESCE(SUM(CASE WHEN event_type IN ('contact_action','form_submit') THEN 1 ELSE 0 END), 0) AS contact_actions " +
    "FROM analytics_events" + filter.sql + " GROUP BY label ORDER BY label ASC";
  const { results: timeline = [] } = await env.DB.prepare(timelineQuery).bind(localModifier, ...filter.bindings).all();

  const contactQuery =
    "SELECT event_type, target, COUNT(*) AS count FROM analytics_events " +
    filter.wherePrefix + " event_type IN ('contact_action','form_submit') " +
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

function isAllowedAnalyticsOrigin(request, env) {
  const origin = request.headers.get("origin") || "";
  if (!origin) return true;
  const allowed = env.ALLOWED_ORIGIN || "*";
  return allowed === "*" || origin === allowed;
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
  else granularity = "month";

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
