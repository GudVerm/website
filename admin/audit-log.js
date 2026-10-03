(() => {
  "use strict";
  const rows=document.getElementById("auditRows");
  const status=document.getElementById("auditStatus");
  const summary=document.getElementById("auditSummary");
  const actor=document.getElementById("auditActor");
  const area=document.getElementById("auditArea");
  const from=document.getElementById("auditFrom");
  const to=document.getElementById("auditTo");
  const refresh=document.getElementById("auditRefresh");
  const reset=document.getElementById("auditReset");
  if(!rows||!status||!summary||!actor||!area||!from||!to||!refresh||!reset)return;

  const api=(window.GUDELIUS_CMS_API||location.origin).replace(/\/$/,"");
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const actionLabel=value=>({
    inhalt_gespeichert:"Inhalt gespeichert",
    inhalt_geloescht:"Inhalt gelöscht",
    crop_gespeichert:"Crop gespeichert",
    crop_zurueckgesetzt:"Crop zurückgesetzt",
    bild_hochgeladen:"Bild hochgeladen",
    bild_geloescht:"Bild gelöscht",
    anfrage_aktualisiert:"Anfrage aktualisiert"
  }[value]||value||"–");

  function query(){
    const params=new URLSearchParams({limit:"100"});
    if(actor.value)params.set("actor",actor.value);
    if(area.value)params.set("area",area.value);
    if(from.value)params.set("from",from.value+" 00:00:00");
    if(to.value)params.set("to",to.value+" 23:59:59");
    return params.toString();
  }

  function render(entries){
    rows.innerHTML=entries.map(entry=>'<tr>'+
      '<td>'+esc(entry.created_at||"")+'</td>'+
      '<td>'+esc(entry.actor_email||"–")+'</td>'+
      '<td>'+esc(actionLabel(entry.action))+'</td>'+
      '<td>'+esc(entry.area||"–")+'</td>'+
      '<td><code>'+esc(entry.target||"–")+'</code></td>'+
      '<td>'+esc(entry.details||"")+'</td>'+
      '</tr>').join("");
    summary.textContent=entries.length+" Einträge angezeigt.";
    if(!entries.length)rows.innerHTML='<tr><td colspan="6">Keine passenden Änderungen gefunden.</td></tr>';
  }

  async function load(){
    refresh.disabled=true;
    status.textContent="Lade Audit-Log …";
    status.className="status";
    try{
      const response=await fetch(api+"/api/admin/audit?"+query(),{credentials:"include",cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||("HTTP "+response.status));
      const entries=Array.isArray(data.entries)?data.entries:[];
      const known=[...new Set(entries.map(item=>item.actor_email).filter(Boolean))];
      const selected=actor.value;
      known.forEach(email=>{
        if([...actor.options].some(option=>option.value===email))return;
        const option=document.createElement("option");option.value=email;option.textContent=email;actor.appendChild(option);
      });
      if([...actor.options].some(option=>option.value===selected))actor.value=selected;
      render(entries);
      status.textContent="Audit-Log geladen.";
      status.className="status ok";
    }catch(error){
      status.textContent="Audit-Log konnte nicht geladen werden: "+error.message;
      status.className="status bad";
      render([]);
    }finally{
      refresh.disabled=false;
    }
  }

  refresh.addEventListener("click",load);
  [actor,area,from,to].forEach(control=>control.addEventListener("change",load));
  reset.addEventListener("click",()=>{actor.value="";area.value="";from.value="";to.value="";load()});
  load();
})();