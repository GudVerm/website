/* Gudelius CMS: Live-Übersicht der Admin-Startseite. */
(() => {
  "use strict";
  const core=window.GUDELIUS_ADMIN_CORE;
  if(!core)return;
  const api=core.getApi();
  const status=document.getElementById("dashboardLiveStatus");
  const refresh=document.getElementById("dashboardRefresh");
  const backup=document.getElementById("dashboardBackup");
  const newInquiries=document.getElementById("dashboardNewInquiries");
  const inquiryNote=document.getElementById("dashboardInquiryNote");
  const drafts=document.getElementById("dashboardDrafts");
  const media=document.getElementById("dashboardMedia");
  const mediaNote=document.getElementById("dashboardMediaNote");
  const health=document.getElementById("dashboardHealth");
  const release=document.getElementById("dashboardRelease");
  const changes=document.getElementById("dashboardRecentChanges");
  if(!api||!status)return;

  backup.href=api+"/api/admin/backup";

  async function get(path){
    const response=await fetch(api+path,{headers:core.adminHeaders(),credentials:"include",cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||("HTTP "+response.status));
    return data;
  }
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const actionLabel=value=>({
    inhalt_gespeichert:"Inhalt gespeichert",crop_gespeichert:"Crop gespeichert",bild_hochgeladen:"Bild hochgeladen",
    projekt_angelegt:"Projekt angelegt",projekt_geaendert:"Projekt geändert",projekt_geloescht:"Projekt gelöscht",
    technik_angelegt:"Technik angelegt",technik_geaendert:"Technik geändert",technik_geloescht:"Technik gelöscht",
    entwurf_gespeichert:"Entwurf gespeichert",entwurf_veroeffentlicht:"Entwurf veröffentlicht",version_wiederhergestellt:"Version wiederhergestellt",
    anfrage_aktualisiert:"Anfrage aktualisiert"
  }[value]||value||"Änderung");

  async function load(){
    refresh.disabled=true;
    core.setStatus(status,"Dashboard wird aktualisiert …");
    const results=await Promise.allSettled([
      get("/api/admin/health"),
      get("/api/admin/inquiries"),
      get("/api/admin/drafts"),
      get("/api/admin/media?limit=1000"),
      get("/api/admin/audit?limit=5")
    ]);
    const [healthResult,inquiriesResult,draftsResult,mediaResult,auditResult]=results;
    let failures=0;
    if(healthResult.status==="fulfilled"){
      const data=healthResult.value;health.textContent=data.ok?"OK":"Warnung";release.textContent="Worker "+(data.release||"");
      health.closest(".dashboard-kpi")?.classList.toggle("is-ok",!!data.ok);health.closest(".dashboard-kpi")?.classList.toggle("is-bad",!data.ok);
    }else{failures++;health.textContent="Fehler";release.textContent=healthResult.reason.message;health.closest(".dashboard-kpi")?.classList.add("is-bad")}
    if(inquiriesResult.status==="fulfilled"){
      const list=Array.isArray(inquiriesResult.value.inquiries)?inquiriesResult.value.inquiries:[];
      const count=list.filter(item=>item.status==="neu").length;newInquiries.textContent=String(count);inquiryNote.textContent=list.length+" Anfragen gesamt";
    }else{failures++;newInquiries.textContent="?";inquiryNote.textContent=inquiriesResult.reason.message}
    if(draftsResult.status==="fulfilled")drafts.textContent=String(draftsResult.value.count||0);else{failures++;drafts.textContent="?"}
    if(mediaResult.status==="fulfilled"){
      const objects=Array.isArray(mediaResult.value.objects)?mediaResult.value.objects:[];media.textContent=String(objects.length);
      mediaNote.textContent=mediaResult.value.truncated?"mindestens "+objects.length+" Objekte":"R2-Objekte";
    }else{failures++;media.textContent="?"}
    if(auditResult.status==="fulfilled"){
      const entries=Array.isArray(auditResult.value.entries)?auditResult.value.entries:[];
      changes.innerHTML=entries.length?entries.map(entry=>'<div class="dashboard-change"><strong>'+esc(actionLabel(entry.action))+'</strong><code>'+esc(entry.target||entry.area||"–")+'</code><time>'+esc(entry.created_at||"")+'</time></div>').join(""):"Noch keine Änderungen protokolliert.";
    }else{failures++;changes.textContent="Audit-Log konnte nicht geladen werden."}
    core.setStatus(status,failures?failures+" Dashboard-Bereiche konnten nicht geladen werden.":"Dashboard aktuell.",failures===0);
    refresh.disabled=false;
  }
  refresh.addEventListener("click",load);
  load();
})();
