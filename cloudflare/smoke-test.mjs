const DEFAULT_API = "https://gudelius-cms.gudeliusvermessung.workers.dev";
const DEFAULT_ORIGIN = "https://gudverm.github.io";
const DEFAULT_RELEASE = "2026-09-24.2";

const api = String(process.env.CMS_API || DEFAULT_API).replace(/\/$/, "");
const origin = String(process.env.CMS_ALLOWED_ORIGIN || DEFAULT_ORIGIN);
const token = String(process.env.CMS_ADMIN_TOKEN || "");
const expectedRelease = String(process.env.EXPECTED_RELEASE || DEFAULT_RELEASE);
const runContactTest = process.env.RUN_CONTACT_TEST === "1";

function fail(message) {
  throw new Error(message);
}

function authHeaders(extra = {}) {
  if (!token) fail("CMS_ADMIN_TOKEN fehlt. Nur als Shell-Umgebungsvariable setzen, niemals committen.");
  return { ...extra, authorization: "Bearer " + token };
}

async function call(path, options = {}, expectedStatuses = [200]) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(api + path, { ...options, signal: controller.signal });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!expectedStatuses.includes(response.status)) {
      const preview = typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data)?.slice(0, 300);
      fail(path + " -> HTTP " + response.status + ", erwartet " + expectedStatuses.join("/") + (preview ? ": " + preview : ""));
    }
    return { response, data };
  } finally {
    clearTimeout(timer);
  }
}

function ok(label) {
  console.log("✓ " + label);
}

async function testPublicEndpoints() {
  const health = await call("/api/health");
  if (!health.data?.ok || health.data?.service !== "gudelius-cms") fail("/api/health meldet keinen gültigen Dienststatus.");
  if (health.data?.release !== expectedRelease) {
    fail("/api/health meldet Release " + String(health.data?.release) + ", erwartet " + expectedRelease + ".");
  }
  ok("Öffentlicher Healthcheck + Release");

  const site = await call("/api/site");
  if (!site.data || typeof site.data.content !== "object") fail("/api/site liefert keine CMS-Inhalte.");
  ok("Öffentliche CMS-Ausgabe");

  const deniedPreflight = await call("/api/contact", {
    method: "OPTIONS",
    headers: {
      origin: "https://example.invalid",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type"
    }
  }, [403]);
  if (deniedPreflight.response.headers.get("access-control-allow-origin")) {
    fail("Nicht erlaubter Origin erhält unerwartet Access-Control-Allow-Origin.");
  }
  ok("CORS verweigert fremden Origin");

  const allowedPreflight = await call("/api/contact", {
    method: "OPTIONS",
    headers: {
      origin,
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type"
    }
  }, [204]);
  if (allowedPreflight.response.headers.get("access-control-allow-origin") !== origin) {
    fail("Erlaubter Origin fehlt im Preflight.");
  }
  ok("CORS erlaubt Test-Origin");

  await call("/api/contact", { method: "GET" }, [401]);
  ok("Anfragen ohne Token geschützt");

  await call("/api/admin/analytics", { method: "GET" }, [401]);
  ok("Analytics-Admin ohne Token geschützt");
}

async function testAdminEndpoints() {
  const adminHealth = await call("/api/admin/health", {
    headers: authHeaders()
  });
  if (!adminHealth.data?.ok) fail("Geschützter Backend-Healthcheck ist nicht vollständig grün.");
  if (adminHealth.data?.public_media_enabled !== false) fail("Öffentliche R2-Ausgabe ist unerwartet aktiviert.");
  ok("D1/R2/Bindings + R2-Ausgabesperre");

  const inquiries = await call("/api/contact", {
    headers: authHeaders()
  });
  if (!Array.isArray(inquiries.data?.inquiries)) fail("Admin-Anfragen liefern keine Liste.");
  ok("Admin-Anfragen lesbar");

  const analytics = await call("/api/admin/analytics?period=30&offset_minutes=-120", {
    headers: authHeaders()
  });
  if (!analytics.data?.summary) fail("Admin-Analytics liefert keine Summary.");
  ok("Admin-Analytics lesbar");

  const ignoredAnalytics = await call("/api/analytics/event", {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      event_type: "pageview",
      page_path: "/admin/smoke-test/",
      target: "",
      event_label: ""
    })
  }, [202]);
  if (!ignoredAnalytics.data?.ignored) fail("Admin-Smoke-Event wurde nicht wie erwartet ignoriert.");
  ok("Analytics-Test ohne persistente Testdaten");

  const invalidMediaPath = "/api/media/__smoke__/invalid-signature";
  await call(invalidMediaPath, {
    method: "PUT",
    headers: authHeaders({
      "content-type": "image/png",
      "x-file-name": "invalid.png"
    }),
    body: new TextEncoder().encode("not-a-png")
  }, [415]);
  ok("Upload lehnt falsche Dateisignatur ab");

  await call("/media/__smoke__/invalid-signature", { method: "GET" }, [404]);
  ok("Öffentliche R2-Ausgabe bleibt deaktiviert");
}

async function testContactEndToEnd() {
  if (!runContactTest) {
    console.log("– Kontakt-E2E übersprungen. Für eine echte Testanfrage RUN_CONTACT_TEST=1 setzen.");
    return;
  }

  const stamp = new Date().toISOString();
  let inquiryId = "";
  let notificationSent = false;

  try {
    const created = await call("/api/contact", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Cloudflare Smoke Test",
        email: "smoke-test@example.com",
        subject: "[TEST] Cloudflare Kontaktformular " + stamp,
        message: "Automatischer Produktions-Smoke-Test. Keine Kundenanfrage. Bitte ignorieren.",
        website: "",
        source: "/website/kontakt/"
      })
    }, [201]);

    inquiryId = String(created.data?.id || "");
    notificationSent = created.data?.notificationSent === true;
    if (!inquiryId) fail("Kontakt-Test wurde nicht mit Anfrage-ID bestätigt.");
    ok("Testanfrage in D1 angenommen");

    const inquiries = await call("/api/contact", {
      headers: authHeaders()
    });
    const found = inquiries.data?.inquiries?.some(item => item.id === inquiryId);
    if (!found) fail("Testanfrage erscheint nicht im Admin-Datenbestand.");
    ok("Testanfrage im Admin-Datenbestand sichtbar");
  } finally {
    if (inquiryId) {
      try {
        await call("/api/contact/" + encodeURIComponent(inquiryId), {
          method: "PUT",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify({
            status: "spam",
            internal_note: "Automatischer Smoke-Test; bewusst als spam markiert, damit die KPI nicht verfälscht wird."
          })
        });
        ok("Testanfrage für KPI-Neutralität als spam markiert");
      } catch (error) {
        console.error("! Testanfrage konnte nicht automatisch als spam markiert werden:", error.message);
      }
    }
  }

  if (!notificationSent) fail("D1-Speicherung war erfolgreich, aber notificationSent ist false.");
  ok("Worker meldet erfolgreichen E-Mail-Versand");
  console.log("MANUELL: Eingang der Testmail bei gudeliusvermessung@web.de im Zielpostfach bestätigen.");
}

async function main() {
  console.log("Cloudflare Smoke-Test gegen " + api);
  await testPublicEndpoints();
  await testAdminEndpoints();
  await testContactEndToEnd();
  console.log("Smoke-Test abgeschlossen.");
}

main().catch(error => {
  console.error("✗ " + error.message);
  process.exitCode = 1;
});
