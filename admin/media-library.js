(() => {
  "use strict";
  const data=window.GUDELIUS_ADMIN_DATA||{};
  const withArea=(items,area,href)=>(items||[]).map(item=>({...item,area,href,assigned:true}));
  const baseCatalog=[
    ...withArea(data.startPageImages,"Startseite","./startseite/"),
    ...withArea(data.serviceImages,"Leistungen","./leistungen/"),
    ...withArea(data.servicePageImages,"Leistungen","./leistungen/"),
    ...withArea(data.defaultProjects,"Projekte","./projekte/"),
    ...withArea(data.techniqueGroupImages,"Technik","./technik/"),
    ...withArea(data.defaultEquipment,"Technik","./technik/"),
    ...withArea(data.companyImages,"Unternehmen","./unternehmen/")
  ];
  const catalogMap=new Map(baseCatalog.map(item=>[item.key,item]));
  const grid=document.getElementById("mediaLibraryGrid");
  const status=document.getElementById("mediaLibraryStatus");
  const summary=document.getElementById("mediaLibrarySummary");
  const search=document.getElementById("mediaLibrarySearch");
  const filter=document.getElementById("mediaLibraryFilter");
  if(!grid||!status||!summary||!search||!filter)return;

  const api=(window.GUDELIUS_CMS_API||location.origin).replace(/\/$/,"");
  let mediaObjects=[],mediaByKey=new Map(),content={},hydrated=new Map();
  const encodeKey=key=>key.split("/").map(encodeURIComponent).join("/");
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const displayName=item=>item.name||item.title||item.key;
  const cropFor=key=>{const value=content["media-layout/"+key];return value&&typeof value==="object"?value:null};
  const bytes=value=>{const n=Number(value||0);if(!n)return "–";if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(n<10240?1:0)+" KiB";return (n/1048576).toFixed(2)+" MiB"};
  function allItems(){
    const orphans=mediaObjects.filter(obj=>!catalogMap.has(obj.key)).map(obj=>({key:obj.key,name:obj.custom_metadata?.original_name||obj.key,detail:"R2-Objekt ohne Zuordnung im Website-Medienkatalog",fallback:"",area:"Nicht zugeordnet",href:"./",assigned:false}));
    return [...baseCatalog,...orphans].sort((a,b)=>String(a.area).localeCompare(String(b.area),"de")||displayName(a).localeCompare(displayName(b),"de"));
  }
  const isExternal=item=>/^https?:\/\//i.test(String(item.fallback||item.externalSource||""));
  const previewFor=(item,obj)=>obj?api+"/api/admin/media/"+encodeKey(item.key):(item.fallback||"");
  function metadataFor(item,obj){
    const cached=hydrated.get(item.key)||{};
    const path=String(item.fallback||"").split("?")[0].toLowerCase();
    const ext=path.match(/\.([a-z0-9]+)$/)?.[1]||"";
    return {
      width:Number(obj?.custom_metadata?.image_width||cached.width||0),
      height:Number(obj?.custom_metadata?.image_height||cached.height||0),
      size:Number(obj?.size||cached.size||0),
      contentType:obj?.http_metadata?.content_type||cached.contentType||(ext?("image/"+(ext==="jpg"?"jpeg":ext)):"–")
    };
  }
  function matchesMode(item,obj,meta){
    const crop=Boolean(cropFor(item.key)),mode=filter.value;
    if(mode==="r2"&&!obj)return false;
    if(mode==="fallback"&&!item.fallback)return false;
    if(mode==="crop"&&!crop)return false;
    if(mode==="nocrop"&&crop)return false;
    if(mode==="unused"&&item.assigned!==false)return false;
    if(mode==="large"&&meta.size<=1048576)return false;
    if(mode==="external"&&!isExternal(item))return false;
    return true;
  }
  function render(){
    const q=(search.value||"").trim().toLowerCase();
    const items=allItems();
    const rows=items.filter(item=>{
      const obj=mediaByKey.get(item.key),meta=metadataFor(item,obj);
      if(!matchesMode(item,obj,meta))return false;
      return !q||[item.key,displayName(item),item.area,item.detail,item.fallback,obj?.custom_metadata?.original_name].join(" ").toLowerCase().includes(q);
    });
    const unused=mediaObjects.filter(obj=>!catalogMap.has(obj.key)).length;
    const large=items.filter(item=>metadataFor(item,mediaByKey.get(item.key)).size>1048576).length;
    summary.textContent=rows.length+" von "+items.length+" Medien · "+unused+" ungenutzt · "+large+" groß";
    grid.innerHTML=rows.map(item=>{
      const obj=mediaByKey.get(item.key),crop=cropFor(item.key),meta=metadataFor(item,obj),preview=previewFor(item,obj);
      const cropText=crop?"X "+Math.round(Number(crop.x??50))+" · Y "+Math.round(Number(crop.y??50))+" · Zoom "+Math.round(Number(crop.zoom??100))+" % · Drehung "+Math.round(Number(crop.rotation??0))+"°":"Standard-Ausschnitt";
      const usage=item.assigned===false?"Keine bekannte Verwendung":(item.detail||("Website-Bild im Bereich "+item.area));
      const dimensions=meta.width&&meta.height?meta.width+" × "+meta.height+" px":"wird ermittelt";
      const fallback=item.fallback||"Kein Fallback hinterlegt";
      return '<article class="media-library-card" data-media-key="'+esc(item.key)+'">'+
        '<div class="media-library-preview">'+(preview?'<img src="'+esc(preview)+'" alt="'+esc(displayName(item))+'" loading="lazy" decoding="async">':'<div class="media-library-no-preview">Keine Vorschau</div>')+'</div>'+
        '<div class="media-library-body"><div><span class="kicker">'+esc(item.area)+'</span><h3>'+esc(displayName(item))+'</h3></div><code>'+esc(item.key)+'</code>'+
        '<div class="media-library-meta"><span class="media-library-pill '+(obj?'is-r2':'')+'">'+(obj?'R2-Medium':'Lokaler Fallback')+'</span><span class="media-library-pill '+(crop?'is-crop':'')+'">'+(crop?'Crop gespeichert':'Kein Crop')+'</span>'+(item.assigned===false?'<span class="media-library-pill is-warning">Ungenutzt</span>':'')+(isExternal(item)?'<span class="media-library-pill is-warning">Extern</span>':'')+'</div>'+
        '<dl class="media-library-context"><div><dt>Dateigröße</dt><dd data-media-size>'+esc(bytes(meta.size))+'</dd></div><div><dt>Abmessungen</dt><dd data-media-dimensions>'+esc(dimensions)+'</dd></div><div><dt>Dateityp</dt><dd data-media-type>'+esc(meta.contentType)+'</dd></div><div><dt>Verwendung</dt><dd>'+esc(usage)+'</dd></div><div><dt>Fallback</dt><dd><code>'+esc(fallback)+'</code></dd></div><div><dt>Upload</dt><dd>'+esc(obj?.uploaded||"lokales Repository")+'</dd></div></dl>'+
        '<div class="media-library-crop">'+esc(cropText)+'</div><div class="media-library-actions">'+(item.assigned!==false?'<a href="'+esc(item.href)+'">Bild/Crop bearbeiten</a>':'')+(preview?'<a class="secondary" href="'+esc(preview)+'" target="_blank" rel="noopener">Bild öffnen</a>':'')+'</div></div></article>';
    }).join("");
    hydrateVisible();
  }
  async function hydrateItem(item,img){
    if(hydrated.get(item.key)?.complete)return;
    const meta=hydrated.get(item.key)||{};
    if(img){
      if(img.complete&&img.naturalWidth){meta.width=img.naturalWidth;meta.height=img.naturalHeight}
      else await new Promise(resolve=>{img.addEventListener("load",()=>{meta.width=img.naturalWidth;meta.height=img.naturalHeight;resolve()},{once:true});img.addEventListener("error",resolve,{once:true})});
    }
    if(!mediaByKey.has(item.key)&&item.fallback&&!isExternal(item)){
      try{
        const response=await fetch(item.fallback,{method:"HEAD",cache:"no-store"});
        meta.size=Number(response.headers.get("content-length")||0);meta.contentType=response.headers.get("content-type")||meta.contentType||"";
      }catch{}
    }
    meta.complete=true;hydrated.set(item.key,meta);
    const card=grid.querySelector('[data-media-key="'+CSS.escape(item.key)+'"]');
    if(card){
      const full=metadataFor(item,mediaByKey.get(item.key));
      card.querySelector("[data-media-size]").textContent=bytes(full.size);
      card.querySelector("[data-media-dimensions]").textContent=full.width&&full.height?full.width+" × "+full.height+" px":"–";
      card.querySelector("[data-media-type]").textContent=full.contentType||"–";
    }
  }
  function hydrateVisible(){
    const items=allItems();
    grid.querySelectorAll(".media-library-card").forEach(card=>{const item=items.find(entry=>entry.key===card.dataset.mediaKey);if(item)hydrateItem(item,card.querySelector("img"))});
  }
  async function load(){
    status.textContent="Medien werden geladen …";status.className="status";
    try{
      const [mediaResponse,siteResponse]=await Promise.all([
        fetch(api+"/api/admin/media?limit=1000",{credentials:"include",cache:"no-store"}),
        fetch(api+"/api/site",{credentials:"include",cache:"no-store"})
      ]);
      const media=await mediaResponse.json().catch(()=>({objects:[]})),site=await siteResponse.json().catch(()=>({content:{}}));
      if(!mediaResponse.ok)throw new Error(media.error||("HTTP "+mediaResponse.status));
      mediaObjects=Array.isArray(media.objects)?media.objects:[];mediaByKey=new Map(mediaObjects.map(item=>[item.key,item]));content=site.content||{};
      status.textContent="Medienbibliothek geladen.";status.className="status ok";render();
    }catch(error){status.textContent="Medienbibliothek konnte nicht vollständig geladen werden: "+error.message;status.className="status bad";render()}
  }
  search.addEventListener("input",render);filter.addEventListener("change",render);load();
})();
