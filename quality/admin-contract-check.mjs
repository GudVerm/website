import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const errors=[];
const check=(condition,message)=>{if(!condition)errors.push(message)};
const contains=(path,needle,message)=>check(read(path).includes(needle),message||path+" enthält nicht: "+needle);

contains("cloudflare/wrangler.jsonc",'"ADMIN_TOKEN_FALLBACK_ENABLED": "false"',"Token-Fallback muss deaktiviert bleiben.");
contains("cloudflare/wrangler.jsonc",'"ADMIN_ALLOWED_EMAILS": "gudeliusvermessung@web.de,jost@gudeliusvermessung.de"',"Admin-Allowlist wurde verändert.");
contains("cloudflare/src/index.js",'"/api/admin/drafts/discard"',"Mehrfach-Verwerfen von Entwürfen fehlt.");
contains("cloudflare/src/index.js","live_value","Entwurfs-API liefert keinen Live-Wert.");
contains("cloudflare/src/index.js","draft_value","Entwurfs-API liefert keinen Entwurfswert.");
contains("admin/audit/index.html","draftPublishSelected","Entwurfs-Auswahl/Publish fehlt.");
contains("admin/audit/index.html","Live ↔ Entwurf vergleichen","Entwurfs-Differenzansicht fehlt.");

contains("assets/admin-cropper.js","media-crop-target-frame","Cropper-Zielvorschau fehlt.");
contains("assets/admin-cropper.js","Empfohlenen Ausschnitt verwenden","Cropper-Empfehlungs-Preset fehlt.");
contains("assets/admin-cropper.js","media-crop-x-value","Cropper-Zahlenwerte fehlen.");
contains("admin/admin.css",'grid-template-columns:minmax(0,1fr) 62px',"Cropper-Wertpillen besitzen keine feste, kollisionsfreie Wertspalte.");
contains("admin/admin.css","border-radius:999px","Cropper-Wertpillen sind nicht als stabile Pills gestaltet.");
contains("admin/admin.css","@container (max-width:230px)","Cropper besitzt keine containerbasierte Absicherung für schmale Karten.");
contains("admin/admin.css","grid-template-columns:repeat(2,minmax(0,1fr))","Cropper-Aktionsbuttons können in schmalen Karten überlaufen.");
contains("assets/admin-cropper.js","cms-crop-dirty-change","Crop-Dirty-Event fehlt.");
contains("admin/admin.js","beforeunload","Schutz vor Verlassen mit offenen Änderungen fehlt.");
contains("admin/admin.js","cmsDraftMode?draftContentUrl(key):contentUrl(key)","Text-/Layout-Speicherung ist nicht draft-aware.");
contains("admin/admin.js","savePendingDraftFieldChanges","Vorschau speichert offene Textänderungen nicht als Entwurf.");
contains("admin/admin.js","cms-draft-tooltip","Entwurfszähler zeigt keine Hover-/Fokus-Details.");
contains("admin/admin.js","draftChangeSummary","Entwurfs-Hover vergleicht Live- und Entwurfswert nicht.");
contains("admin/admin.js","knownDraftRecords","Entwurfs-Hover speichert keine Draft-Detaildaten.");
contains("cloudflare/src/index.js",'"impressum", "audit"',"Impressum ist nicht als geschützte Admin-Seite freigeschaltet.");
contains("admin/admin.js",'ensureNavLink("impressum","Impressum")',"Impressum fehlt in der Admin-Navigation.");
contains("admin/admin.js",'ensureNavLink("medien","Medien")',"Medien fehlt als globaler Admin-Menüpunkt.");
contains("cloudflare/src/index.js",'"medien", "impressum", "audit"',"Medien ist nicht als geschützte Admin-Seite freigeschaltet.");
contains("admin/index.html",'href="./medien/"',"Dashboard verlinkt nicht auf den eigenständigen Medienbereich.");
contains("admin/admin.js",'api+"/admin/"+page+"/"',"Admin-Navigation verwendet nicht den eindeutigen Worker-Adminpfad.");
contains("admin/admin.js","loadImprintTexts","Impressum-Editor ist nicht an das CMS angebunden.");
contains("admin/admin.js","clearAdminDirtyForElements","Gespeicherte Formularfelder können ihren Dirty-State nicht gezielt zurücksetzen.");
contains("admin/admin.js",'clearAdminDirtyForElements(Object.values(imprintTextFields),"fields")',"Impressum bleibt nach erfolgreichem Speichern fälschlich als ungespeichert markiert.");
contains("admin/admin.js","const changed=Object.entries(imprintTextFields).filter","Impressum schreibt weiterhin unveränderte Felder als Entwürfe.");
contains("assets/gudelius-site.js",'if (typeof value === "string")',"Explizit leere CMS-Texte werden in der Vorschau nicht angewendet.");
contains("cloudflare/src/index.js","DELETE FROM content_drafts WHERE EXISTS","Drafts ohne Live-Differenz werden nicht bereinigt.");
contains("cloudflare/src/index.js","unchanged:true","Worker erkennt identische Draft-/Live-Werte nicht.");
contains("impressum/index.html",'data-cms-text="impressum/provider-name"',"Öffentliches Impressum ist nicht CMS-fähig.");
contains("cloudflare/src/index.js","resolveAuditPublicationChange","Audit-Veröffentlichungen besitzen keinen Vorher-/Nachher-Abgleich.");
contains("admin/audit/index.html","audit-publication-hover","Audit-Oberfläche zeigt Veröffentlichungsänderungen nicht per Hover/Fokus.");
contains("admin/admin.js","visible:draftVisible","Neue Projekte werden im Entwurfsmodus nicht sichtbar für die Vorschau angelegt.");
contains("cloudflare/src/index.js","previewConfig=renderPreviewConfig","Preview-Konfiguration wird nicht inline eingebettet.");
contains("cloudflare/src/index.js","GUDELIUS_CMS_PREVIEW_CONTENT","Preview-Draft-Snapshot fehlt.");
contains("admin/admin.js","loadProtectedMediaIntoImage(img,item.key,item.fallback)","Projekt-Admin bestätigt Projektbild-Uploads nicht über den geschützten R2-GET.");
contains("admin/admin.js","if(cmsAccessMode&&getApi())","Generische Admin-Medien werden bei Access nicht geschützt aus R2 geladen.");
contains("admin/admin.js",'setStatus(status,"Bild gespeichert und aus R2 bestätigt.",true)',"Startseiten-Kachelbilder werden nach Upload nicht aus R2 bestätigt.");
contains("admin/admin.js",'credentials:"include"',"Admin-Medienupload sendet keine Access-Credentials.");
contains("assets/cms-config.js","GUDELIUS_CMS_MEDIA_ENABLED = true","Öffentliche CMS-Medien sind im Site-Config weiterhin deaktiviert.");
contains("cloudflare/wrangler.jsonc",'"PUBLIC_MEDIA_ENABLED": "true"',"Öffentliche R2-Medienausgabe ist im Worker weiterhin deaktiviert.");
contains("index.html",'data-cms-bg="leistungen/ingenieurvermessung"',"Leistungsbilder sind auf der Live-Startseite nicht an CMS-Medienkeys gebunden.");
contains("admin/startseite/index.html","Vier Leistungs-Kacheln der Startseite","Die vier Leistungs-Kacheln fehlen im Startseiten-Admin.");
contains("admin/startseite/index.html",'id="service1Grid"',"Ingenieurvermessungs-Kachel fehlt im Startseiten-Admin.");
check(!read("admin/leistungen/index.html").includes("<strong>Startseiten-Kachel</strong>"),"Startseiten-Leistungskacheln sind weiterhin im Leistungen-Admin eingebettet.");
contains("admin/admin.js",'if(raw.startsWith("leistungen/"))return "startseite";',"Entwurfs-Sprünge für Startseiten-Leistungskacheln führen nicht zur Startseite.");
contains("admin/media-library.js",'withArea(data.serviceImages,"Startseite","./startseite/")',"Medienbibliothek verlinkt Startseiten-Leistungskacheln weiterhin zum Leistungen-Admin.");
contains("cloudflare/src/index.js",'url: new URL("/api/admin/media/" + encodePath(key), url).toString()', "Admin-Medienupload liefert weiterhin einen ungeschützten/öffentlichen Medienpfad zurück.");
contains("cloudflare/src/index.js",'url.pathname.startsWith("/api/admin/media/") && request.method === "GET"',"Geschützter GET-Endpunkt für Admin-Medien fehlt.");
contains("cloudflare/src/index.js","GUDELIUS_CMS_MEDIA_ENDPOINT = '/api/admin/media';","Preview verwendet nicht den geschützten Medien-Endpunkt.");
contains("assets/gudelius-site.js","img.src=cmsMediaUrl(key);","Frontend wendet den konfigurierten CMS-Medien-Endpunkt nicht auf Projektbilder an.");
contains("admin/admin.js","Bilddatei-Uploads bleiben direkte Medienänderungen","Entwurfsmodus-Hinweis für Bildlayouts fehlt.");
contains("admin/admin.js","admin-global-dirty","Globaler Dirty-Indikator fehlt.");
contains("admin/admin.js","admin-global-dirty-tooltip","Hover-/Fokus-Details für ungespeicherte Änderungen fehlen.");
contains("admin/admin.js","focusAdminChangeTargets","Ungespeichert-/Entwurfs-Hinweise können nicht zur Änderung springen.");
contains("admin/admin.js","admin-save-dock","Feste Speicherleiste fehlt auf bearbeitbaren CMS-Seiten.");
contains("admin/admin.js","saveAllAdminDirtyChanges","Feste Speicherleiste kann offene Änderungen nicht speichern.");
contains("admin/admin.js","saveAllPendingMediaCrops","Feste Speicherleiste berücksichtigt offene Bildausschnitte nicht.");
contains("admin/admin.css",".admin-save-dock{","Feste Speicherleiste besitzt kein sichtbares Layout.");
contains("admin/admin.js","adminDirtyElements","Ungespeichert-Hinweise merken sich nicht die tatsächlich geänderten Felder.");
contains("admin/admin.js","jumpToDraftKey","Entwurfs-Hinweise sind nicht als Sprungnavigation umgesetzt.");
contains("admin/admin.js","gudelius-admin-pending-draft-jump","Entwurfs-Sprung über Admin-Bereiche hinweg fehlt.");
contains("admin/admin.css",".admin-change-highlight","Geänderte Felder werden nach dem Sprung nicht rot hervorgehoben.");
contains("admin/admin.css",".admin-global-dirty::after","Hover-Brücke für Ungespeichert fehlt.");
contains("admin/admin.js",".cms-draft-count::after","Hover-Brücke für Entwürfe fehlt.");
contains("admin/admin.js",".cms-draft-tooltip:hover","Entwurfs-Popup bleibt beim direkten Hover nicht offen.");
contains("admin/admin.js","dirtyFieldLabel","Dirty-State merkt sich keine konkreten Feldnamen.");
contains("admin/admin.css",".admin-global-dirty:hover .admin-global-dirty-tooltip","Dirty-Tooltip wird beim Hover nicht eingeblendet.");

const media=read("admin/media-library.js");
for(const token of ['mode==="unused"','mode==="large"','mode==="external"',"value_size","Abmessungen","Dateigröße"]){
  check(media.includes(token)||media.includes(token.replace("value_size","contentType")), "Medienbibliothek-Funktion fehlt: "+token);
}
contains("cloudflare/src/index.js","image_width","R2-Bildabmessungen fehlen in Medienmetadaten.");

const inquiryWorker=read("cloudflare/src/index.js");
for(const token of ["priority","follow_up_at","antwort-ausstehend"])check(inquiryWorker.includes(token),"Anfragen-Backend-Feld fehlt: "+token);
const inquiryUi=read("assets/admin-inquiries.js");
for(const token of ["inquiryPriorityLabel","Wiedervorlage","unbeantwortet","exportCsv"])check(inquiryUi.includes(token),"Anfragen-UI-Funktion fehlt: "+token);
const schema=read("cloudflare/schema.sql");
for(const token of ["priority TEXT","follow_up_at TEXT","idx_contact_requests_follow_up_at"])check(schema.includes(token),"D1-Schema fehlt: "+token);

const quality=read(".github/workflows/website-quality.yml");
for(const token of ["browser-check.mjs","cms-browser-integration.mjs","visual-regression.mjs","accessibility-check.mjs","environment-check.mjs"]){
  check(quality.includes(token),"Website-quality enthält Check nicht: "+token);
}
const baselines=existsSync(resolve(root,"quality/visual-baselines"))
  ? readdirSync(resolve(root,"quality/visual-baselines")).filter(name=>name.endsWith(".png"))
  : [];
check(baselines.length>=18,"Visuelle Baselines fehlen oder sind unvollständig (gefunden "+baselines.length+").");

const publicHtml=["index.html","technik/index.html","projekte/index.html","unternehmen/index.html","kontakt/index.html"];
for(const path of publicHtml){
  const html=read(path);
  const externalImages=[...html.matchAll(/<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi)].map(match=>match[1]);
  check(externalImages.length===0,path+" enthält externe Laufzeit-Bildquelle(n): "+externalImages.join(", "));
}

const env=JSON.parse(read("site.environments.json"));
check(env.active_environment==="staging","Vor Domain-Cutover muss staging aktiv sein.");
check(env.environments?.staging?.indexable===false,"Staging darf nicht indexierbar sein.");

if(errors.length){
  console.error("CMS-Vertragscheck fehlgeschlagen:\n- "+errors.join("\n- "));
  process.exit(1);
}
console.log("CMS-Vertragscheck erfolgreich: Sicherheits-, CMS-, Medien-, Entwurfs- und Anfragenfunktionen vorhanden.");

contains("admin/medien/index.html",'data-admin-page="medien"',"Eigenständige Medien-Adminseite fehlt.");
contains("admin/medien/index.html","mediaLibraryGrid","Medien-Adminseite enthält keine Medienbibliothek.");
