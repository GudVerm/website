(() => {
  "use strict";
  const data=window.GUDELIUS_ADMIN_DATA||{};
  const withArea=(items,area,href)=>(items||[]).map(item=>({...item,area,href}));
  const catalog=[
    ...withArea(data.startPageImages,"Startseite","./startseite/"),
    ...withArea(data.serviceImages,"Leistungen","./leistungen/"),
    ...withArea(data.servicePageImages,"Leistungen","./leistungen/"),
    ...withArea(data.defaultProjects,"Projekte","./projekte/"),
    ...withArea(data.techniqueGroupImages,"Technik","./technik/"),
    ...withArea(data.defaultEquipment,"Technik","./technik/"),
    ...withArea(data.companyImages,"Unternehmen","./unternehmen/")
  ].sort((a,b)=>a.area.localeCompare(b.area,"de")||String(a.name||a.title||a.key).localeCompare(String(b.name||b.title||b.key),"de"));

  const grid=document.getElementById("mediaLibraryGrid");
  const status=document.getElementById("mediaLibraryStatus");
  const summary=document.getElementById("mediaLibrarySummary");
  const search=document.getElementById("mediaLibrarySearch");
  const filter=document.getElementById("mediaLibraryFilter");
  if(!grid||!status||!summary||!search||!filter)return;

  const api=(window.GUDELIUS_CMS_API||location.origin).replace(/\/$/,"");
  let r2Keys=new Set();
  let content={};

  const encodeKey=key=>key.split("/").map(encodeURIComponent).join("/");
  const cropFor=key=>{
    const value=content["media-layout/"+key];
    return value&&typeof value==="object"?value:null;
  };
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const displayName=item=>item.name||item.title||item.key;

  function render(){
    const q=(search.value||"").trim().toLowerCase();
    const mode=filter.value;
    const rows=catalog.filter(item=>{
      const hasR2=r2Keys.has(item.key), crop=Boolean(cropFor(item.key));
      if(mode==="r2"&&!hasR2)return false;
      if(mode==="fallback"&&hasR2)return false;
      if(mode==="crop"&&!crop)return false;
      if(mode==="nocrop"&&crop)return false;
      if(q&&!([item.key,displayName(item),item.area,item.detail,item.fallback].join(" ").toLowerCase().includes(q)))return false;
      return true;
    });
    summary.textContent=rows.length+" von "+catalog.length+" Medien";
    grid.innerHTML=rows.map(item=>{
      const hasR2=r2Keys.has(item.key);
      const crop=cropFor(item.key);
      const preview=hasR2?api+"/api/admin/media/"+encodeKey(item.key):item.fallback;
      const cropText=crop
        ? "X "+Math.round(Number(crop.x??50))+" · Y "+Math.round(Number(crop.y??50))+" · Zoom "+Math.round(Number(crop.zoom??100))+" % · Drehung "+Math.round(Number(crop.rotation??0))+"°"
        : "Standard-Ausschnitt";
      const usage=item.detail||("Website-Bild im Bereich "+item.area);
      const fallback=item.fallback||"Kein lokaler Fallback hinterlegt";
      const source=hasR2?"R2-Medium aktiv":"Lokaler Fallback aktiv";
      return '<article class="media-library-card">'+
        '<div class="media-library-preview"><img src="'+esc(preview)+'" alt="'+esc(displayName(item))+'" loading="lazy" decoding="async"></div>'+
        '<div class="media-library-body"><div><span class="kicker">'+esc(item.area)+'</span><h3>'+esc(displayName(item))+'</h3></div>'+
        '<code>'+esc(item.key)+'</code>'+
        '<div class="media-library-meta"><span class="media-library-pill '+(hasR2?'is-r2':'')+'">'+(hasR2?'R2 vorhanden':'Fallback aktiv')+'</span>'+
        '<span class="media-library-pill '+(crop?'is-crop':'')+'">'+(crop?'Crop gespeichert':'Kein Crop')+'</span></div>'+
        '<dl class="media-library-context"><div><dt>Quelle</dt><dd>'+esc(source)+'</dd></div><div><dt>Verwendung</dt><dd>'+esc(usage)+'</dd></div><div><dt>Fallback</dt><dd><code>'+esc(fallback)+'</code></dd></div></dl>'+
        '<div class="media-library-crop">'+esc(cropText)+'</div>'+
        '<div class="media-library-actions"><a href="'+esc(item.href)+'">Bild/Crop bearbeiten</a><a class="secondary" href="'+esc(preview)+'" target="_blank" rel="noopener">Bild öffnen</a></div></div></article>';
    }).join("");
  }

  async function load(){
    status.textContent="Medien werden geladen …";
    try{
      const [mediaResponse,siteResponse]=await Promise.all([
        fetch(api+"/api/admin/media?limit=1000",{credentials:"include",cache:"no-store"}),
        fetch(api+"/api/site",{credentials:"include",cache:"no-store"})
      ]);
      const media=await mediaResponse.json().catch(()=>({objects:[]}));
      const site=await siteResponse.json().catch(()=>({content:{}}));
      if(!mediaResponse.ok)throw new Error(media.error||("HTTP "+mediaResponse.status));
      r2Keys=new Set((media.objects||[]).map(item=>item.key));
      content=site.content||{};
      status.textContent="Medienbibliothek geladen.";
      status.className="status ok";
      render();
    }catch(error){
      status.textContent="Medienbibliothek konnte nicht vollständig geladen werden: "+error.message;
      status.className="status bad";
      render();
    }
  }

  search.addEventListener("input",render);
  filter.addEventListener("change",render);
  load();
})();