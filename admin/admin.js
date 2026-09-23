const equipment = [
  { key:"equipment/trimble-sx12", name:"Trimble SX12", detail:"Scanning-Totalstation", fallback:"../assets/equipment-trimble-sx12.svg" },
  { key:"equipment/trimble-s6", name:"Trimble S6", detail:"Robotik-Totalstation", fallback:"../assets/equipment-trimble-s6.svg" },
  { key:"equipment/trimble-r2", name:"Trimble R2 GNSS-Empfänger", detail:"GNSS-Positionierung", fallback:"../assets/equipment-trimble-r2.svg" },
  { key:"equipment/trimble-dini07", name:"Trimble DiNi 07 Ingenieurnivellier", detail:"Digitalnivellement", fallback:"../assets/equipment-trimble-dini07.svg" },
  { key:"equipment/trimble-tx8", name:"Trimble TX8 3D-Laserscanner", detail:"Terrestrisches 3D-Laserscanning", fallback:"../assets/equipment-trimble-tx8.svg" },
  { key:"equipment/rtk-drohne", name:"RTK-Drohne", detail:"Vermessung & Orthophoto", fallback:"../assets/equipment-rtk-drohne.svg" },
  { key:"equipment/infrarotkamera", name:"RTK-Drohne mit Infrarotkamera", detail:"Thermische Bildaufnahme", fallback:"../assets/equipment-infrarotkamera.svg" },
  { key:"equipment/photogrammetrie", name:"Punktwolken & Photogrammetrie", detail:"Workflow / Ergebnisdarstellung", fallback:"../assets/equipment-photogrammetrie.svg" },
  { key:"equipment/bricscad", name:"BricsCAD", detail:"CAD-Bearbeitung", fallback:"../assets/equipment-bricscad.svg" },
  { key:"equipment/bbsoft", name:"BBSOFT", detail:"Tiefbau, Vermessung & DGM", fallback:"../assets/equipment-bbsoft.svg" },
  { key:"equipment/realworks", name:"Trimble RealWorks", detail:"Punktwolken-Auswertung", fallback:"../assets/equipment-realworks.svg" },
  { key:"equipment/metashape", name:"Agisoft Metashape", detail:"Photogrammetrie", fallback:"../assets/equipment-metashape.svg" }
];

const apiUrlInput=document.getElementById("apiUrl");
const tokenInput=document.getElementById("adminToken");
const saveButton=document.getElementById("saveConnection");
const testButton=document.getElementById("testConnection");
const connectionStatus=document.getElementById("connectionStatus");
const grid=document.getElementById("equipmentGrid");
const template=document.getElementById("equipmentTemplate");

apiUrlInput.value=(window.GUDELIUS_CMS_API||"").replace(/\/$/,"");
tokenInput.value=sessionStorage.getItem("gudelius-cms-token")||"";

function getApi(){
  let value=apiUrlInput.value.trim().replace(/\/$/,"");
  if(value && !/^https?:\/\//i.test(value)) value="https://"+value;
  return value;
}
function getToken(){return tokenInput.value.trim()}
function mediaUrl(key){return getApi()+"/media/"+key.split("/").map(encodeURIComponent).join("/")}

saveButton.addEventListener("click",()=>{
  const api=getApi();
  if(api){ apiUrlInput.value=api; localStorage.setItem("gudelius-cms-api",api); }
  else localStorage.removeItem("gudelius-cms-api");
  if(getToken()) sessionStorage.setItem("gudelius-cms-token",getToken());
  else sessionStorage.removeItem("gudelius-cms-token");
  setStatus(connectionStatus,"Verbindungsdaten gespeichert.",true);
  render();
});

testButton.addEventListener("click",async()=>{
  if(!getApi()) return setStatus(connectionStatus,"Bitte zuerst die Worker-URL eintragen.",false);
  setStatus(connectionStatus,"Teste Verbindung …");
  try{
    const r=await fetch(getApi()+"/api/health");
    if(!r.ok) throw new Error("HTTP "+r.status);
    const data=await r.json();
    setStatus(connectionStatus,data.ok?"Cloudflare Worker erreichbar.":"Unerwartete Antwort.",!!data.ok);
  }catch(e){
    setStatus(connectionStatus,"Worker nicht erreichbar: "+e.message,false);
  }
});

function setStatus(el,text,ok){
  el.textContent=text;
  el.classList.remove("ok","bad");
  if(ok===true) el.classList.add("ok");
  if(ok===false) el.classList.add("bad");
}

function render(){
  grid.innerHTML="";
  for(const item of equipment){
    const node=template.content.cloneNode(true);
    const card=node.querySelector(".equipment-card");
    const img=node.querySelector("img");
    const title=node.querySelector("h3");
    const detail=node.querySelector(".detail");
    const file=node.querySelector(".file-input");
    const upload=node.querySelector(".upload");
    const reset=node.querySelector(".reset");
    const status=node.querySelector(".card-status");

    title.textContent=item.name;
    detail.textContent=item.detail;
    img.src=getApi()?mediaUrl(item.key):item.fallback;
    img.onerror=()=>{img.onerror=null;img.src=item.fallback};

    file.addEventListener("change",()=>{
      const selected=file.files?.[0];
      if(!selected) return;
      img.src=URL.createObjectURL(selected);
      setStatus(status,selected.name+" ausgewählt.");
    });

    upload.addEventListener("click",async()=>{
      const selected=file.files?.[0];
      if(!selected) return setStatus(status,"Bitte zuerst ein Bild auswählen.",false);
      if(!getApi()||!getToken()) return setStatus(status,"Worker-URL und Admin-Token fehlen.",false);

      upload.disabled=true;
      setStatus(status,"Upload läuft …");
      try{
        const r=await fetch(getApi()+"/api/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
          method:"PUT",
          headers:{
            "authorization":"Bearer "+getToken(),
            "content-type":selected.type||"application/octet-stream",
            "x-file-name":selected.name
          },
          body:selected
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data.error||("HTTP "+r.status));
        img.src=mediaUrl(item.key)+"?v="+Date.now();
        setStatus(status,"Bild erfolgreich in Cloudflare gespeichert.",true);
      }catch(e){
        setStatus(status,"Upload fehlgeschlagen: "+e.message,false);
      }finally{
        upload.disabled=false;
      }
    });

    reset.addEventListener("click",async()=>{
      if(!getApi()||!getToken()) return setStatus(status,"Worker-URL und Admin-Token fehlen.",false);
      reset.disabled=true;
      setStatus(status,"Lösche Cloudflare-Bild …");
      try{
        const r=await fetch(getApi()+"/api/media/"+item.key.split("/").map(encodeURIComponent).join("/"),{
          method:"DELETE",
          headers:{"authorization":"Bearer "+getToken()}
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data.error||("HTTP "+r.status));
        img.src=item.fallback;
        file.value="";
        setStatus(status,"Cloudflare-Bild gelöscht; Platzhalter wird verwendet.",true);
      }catch(e){
        setStatus(status,"Löschen fehlgeschlagen: "+e.message,false);
      }finally{
        reset.disabled=false;
      }
    });

    grid.appendChild(node);
  }
}

render();
