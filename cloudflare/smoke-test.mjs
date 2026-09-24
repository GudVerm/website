const DEFAULT_API = "https://gudelius-cms.gudeliusvermessung.workers.dev";
const DEFAULT_ORIGIN = "https://gudverm.github.io";
const DEFAULT_RELEASE = "2026-09-24.12";

const api = String(process.env.CMS_API || DEFAULT_API).replace(/\/$/, "");
const origin = String(process.env.CMS_ALLOWED_ORIGIN || DEFAULT_ORIGIN);
const expectedRelease = String(process.env.EXPECTED_RELEASE || DEFAULT_RELEASE);
const legacyToken = String(process.env.CMS_ADMIN_TOKEN || "");

function fail(message) { throw new Error(message); }
function ok(label) { console.log("✓ " + label); }

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
  } finally { clearTimeout(timer); }
}

async function callManual(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(api + path, { ...options, redirect: "manual", signal: controller.signal });
  } finally { clearTimeout(timer); }
}

async function testPublicEndpoints() {
  const health = await call("/api/health");
  if (!health.data?.ok || health.data?.service !== "gudelius-cms") fail("/api/health meldet keinen gültigen Dienststatus.");
  if (health.data?.release !== expectedRelease) fail("/api/health meldet Release " + String(health.data?.release) + ", erwartet " + expectedRelease + ".");
  ok("Öffentlicher Healthcheck + Release");

  const site = await call("/api/site");
  if (!site.data || typeof site.data.content !== "object") fail("/api/site liefert keine CMS-Inhalte.");
  ok("Öffentliche CMS-Ausgabe");

  await call("/api/contact", {
    method:"OPTIONS",
    headers:{origin:"https://example.invalid","access-control-request-method":"POST","access-control-request-headers":"content-type"}
  }, [403]);
  ok("CORS verweigert fremden Origin");

  const allowed = await call("/api/contact", {
    method:"OPTIONS",
    headers:{origin,"access-control-request-method":"POST","access-control-request-headers":"content-type"}
  }, [204]);
  if (allowed.response.headers.get("access-control-allow-origin") !== origin) fail("Erlaubter Origin fehlt im Preflight.");
  ok("CORS erlaubt Test-Origin");

  await call("/media/__smoke__/not-public",{method:"GET"},[404]);
  ok("Öffentliche R2-Ausgabe bleibt deaktiviert");

  await call("/api/analytics/event", {
    method:"POST",
    headers:{origin,"content-type":"text/plain;charset=UTF-8","user-agent":"Mozilla/5.0 Gudelius-Smoke"},
    body:JSON.stringify({event_type:"__invalid_smoke__",page_path:"/kontakt/",target:"",event_label:""})
  }, [400]);
  ok("Analytics akzeptiert Beacon-kompatibles text/plain ohne Testdaten zu speichern");
}

async function testLegacyAdminDisabled() {
  const headers = legacyToken ? {authorization:"Bearer "+legacyToken} : {};
  await call("/api/contact",{method:"GET",headers},[404]);
  await call("/api/contact/__smoke__",{method:"PUT",headers:{...headers,"content-type":"application/json"},body:"{}"},[404]);
  await call("/api/content/__smoke__",{method:"PUT",headers:{...headers,"content-type":"application/json"},body:JSON.stringify("blocked")},[404]);
  await call("/api/media/__smoke__",{method:"DELETE",headers},[404]);
  ok("Legacy-Adminrouten sind abgeschaltet");
  if (legacyToken) ok("CMS_ADMIN_TOKEN erhält keinen Legacy-Zugriff mehr");
}

async function testAccessBoundary() {
  const response = await callManual("/api/admin/session");
  if (![302,303,307,308,401,403].includes(response.status)) {
    fail("/api/admin/session ist ohne Access-Sitzung unerwartet erreichbar: HTTP "+response.status);
  }
  ok("Cloudflare Access schützt /api/admin/* vor nicht angemeldeten Clients");
  console.log("MANUELL: Im angemeldeten Browser /api/admin/session prüfen; erwartet auth_mode=access und token_fallback_enabled=false.");
}

async function main(){
  console.log("Cloudflare Smoke-Test gegen "+api);
  await testPublicEndpoints();
  await testLegacyAdminDisabled();
  await testAccessBoundary();
  console.log("Smoke-Test abgeschlossen.");
}
main().catch(error=>{console.error("✗ "+error.message);process.exitCode=1;});
