/* Gudelius CMS: Anfragen/Kanban als eigenständiges Admin-Modul. */
(() => {
  "use strict";
  const core=window.GUDELIUS_ADMIN_CORE;
  if(!core)return;
  const {getApi,hasAdminAuth,adminHeaders,setStatus}=core;

  const inquiriesList=document.getElementById("inquiriesList");
  const inquiryKanban=document.getElementById("inquiryKanban");
  const inquiryKanbanScrollbarWrap=document.getElementById("inquiryKanbanScrollbarWrap");
  const inquiryKanbanScrollbar=document.getElementById("inquiryKanbanScrollbar");
  const inquiryKanbanScrollbarTrack=document.getElementById("inquiryKanbanScrollbarTrack");
  const inquiriesStatus=document.getElementById("inquiriesStatus");
  const inquiryFilter=document.getElementById("inquiryFilter");
  const inquirySearch=document.getElementById("inquirySearch");
  const inquiryPeriod=document.getElementById("inquiryPeriod");
  const inquirySort=document.getElementById("inquirySort");
  const inquiryPageSize=document.getElementById("inquiryPageSize");
  const inquiryResultSummary=document.getElementById("inquiryResultSummary");
  const inquiryResultHint=document.getElementById("inquiryResultHint");
  const inquiryPagination=document.getElementById("inquiryPagination");
  const inquiryPrevPage=document.getElementById("inquiryPrevPage");
  const inquiryNextPage=document.getElementById("inquiryNextPage");
  const inquiryPageLabel=document.getElementById("inquiryPageLabel");
  const inquiryViewKanban=document.getElementById("inquiryViewKanban");
  const inquiryViewList=document.getElementById("inquiryViewList");
  const refreshInquiries=document.getElementById("refreshInquiries");
  const inquiryCountAll=document.getElementById("inquiryCountAll");
  const inquiryCountNew=document.getElementById("inquiryCountNew");
  const inquiryCountProgress=document.getElementById("inquiryCountProgress");
  const inquiryCountDone=document.getElementById("inquiryCountDone");
  const inquiryQuickFilters=[...document.querySelectorAll("[data-inquiry-quick-filter]")];
  const inquiryNavCount=document.getElementById("inquiryNavCount");
  let inquiriesCache=[];
  let inquiryPage=1;
  let inquiryView="kanban";

  function inquiryStatusLabel(status){
    if(status==="in-arbeit") return "In Arbeit";
    if(status==="erledigt") return "Erledigt";
    if(status==="archiviert") return "Archiviert";
    if(status==="spam") return "Spam";
    return "Neu";
  }
  
  function formatInquiryDate(value){
    if(!value) return "–";
    const normalized=value.includes("T") ? value : value.replace(" ","T")+"Z";
    const date=new Date(normalized);
    if(Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("de-DE",{dateStyle:"medium",timeStyle:"short"}).format(date);
  }
  
  function inquiryDate(value){
    if(!value) return null;
    const normalized=value.includes("T") ? value : value.replace(" ","T")+"Z";
    const date=new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  
  function inquiryMatchesPeriod(inquiry,period){
    if(period==="alle") return true;
    const date=inquiryDate(inquiry.created_at);
    if(!date) return false;
    const now=new Date();
    if(period==="heute") return date.toDateString()===now.toDateString();
    const days=period==="7"?7:period==="30"?30:0;
    return !days || date.getTime()>=now.getTime()-days*86400000;
  }
  
  function updateInquiryStats(){
    const counts={neu:0,"in-arbeit":0,erledigt:0};
    inquiriesCache.forEach(item=>{
      if(Object.prototype.hasOwnProperty.call(counts,item.status)) counts[item.status]+=1;
    });
    if(inquiryCountAll) inquiryCountAll.textContent=inquiriesCache.length;
    if(inquiryCountNew) inquiryCountNew.textContent=counts.neu;
    if(inquiryCountProgress) inquiryCountProgress.textContent=counts["in-arbeit"];
    if(inquiryCountDone) inquiryCountDone.textContent=counts.erledigt;
    if(inquiryNavCount){
      inquiryNavCount.textContent=counts.neu;
      inquiryNavCount.hidden=counts.neu===0;
    }
    const activeStatus=inquiryView==="kanban"?"alle":(inquiryFilter?.value||"alle");
    inquiryQuickFilters.forEach(button=>{
      const active=button.dataset.inquiryQuickFilter===activeStatus;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",active?"true":"false");
    });
  }
  
  async function saveInquiryUpdate(inquiry,payload){
    const response=await fetch(getApi()+"/api/admin/inquiries/"+encodeURIComponent(inquiry.id),{
      method:"PUT",
      headers:adminHeaders({"content-type":"application/json"}),
      body:JSON.stringify(payload)
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
    return data;
  }
  
  function filteredInquiries({ignoreStatus=false}={}){
    const status=inquiryFilter?.value||"alle";
    const period=inquiryPeriod?.value||"alle";
    const query=(inquirySearch?.value||"").trim().toLocaleLowerCase("de-DE");
    const direction=inquirySort?.value==="oldest"?1:-1;
    return inquiriesCache.filter(item=>{
      if(!ignoreStatus&&status!=="alle"&&item.status!==status) return false;
      if(!inquiryMatchesPeriod(item,period)) return false;
      if(!query) return true;
      return [item.name,item.email,item.subject,item.message,item.internal_note].some(value=>
        String(value||"").toLocaleLowerCase("de-DE").includes(query)
      );
    }).sort((a,b)=>{
      const aTime=inquiryDate(a.created_at)?.getTime()||0;
      const bTime=inquiryDate(b.created_at)?.getTime()||0;
      return (aTime-bTime)*direction;
    });
  }
  
  function resetInquiryPageAndRender(){
    inquiryPage=1;
    renderInquiries();
  }
  
  async function updateInquiryStatus(inquiry,next){
    const previous=inquiry.status;
    if(next===previous) return true;
    try{
      await saveInquiryUpdate(inquiry,{status:next});
      inquiry.status=next;
      updateInquiryStats();
      return true;
    }catch(error){
      setStatus(inquiriesStatus,"Status konnte nicht gespeichert werden: "+error.message,false);
      return false;
    }
  }
  
  function createInquiryCard(inquiry,{kanban=false}={}){
    const card=document.createElement("article");
    card.className=kanban?"inquiry-card inquiry-kanban-card":"inquiry-card";
    card.dataset.status=inquiry.status||"neu";
    card.dataset.inquiryId=inquiry.id||"";
    if(kanban){
      card.draggable=true;
      card.addEventListener("dragstart",event=>{
        card.classList.add("is-dragging");
        event.dataTransfer.effectAllowed="move";
        event.dataTransfer.setData("text/plain",inquiry.id||"");
      });
      card.addEventListener("dragend",()=>card.classList.remove("is-dragging"));
    }
  
    const top=document.createElement("div");
    top.className="inquiry-card-top";
    const identity=document.createElement("div");
    identity.className="inquiry-identity";
    const name=document.createElement("strong");
    name.textContent=inquiry.name||"Ohne Name";
    const subject=document.createElement("h3");
    subject.textContent=inquiry.subject||"Ohne Betreff";
    identity.append(name,subject);
  
    const badge=document.createElement("span");
    badge.className="inquiry-status-badge";
    badge.textContent=inquiryStatusLabel(inquiry.status);
    top.append(identity,badge);
  
    const meta=document.createElement("div");
    meta.className="inquiry-meta";
    const created=document.createElement("span");
    created.textContent=formatInquiryDate(inquiry.created_at);
    const metaEmail=document.createElement("span");
    metaEmail.className="inquiry-summary-email";
    metaEmail.textContent=inquiry.email||"Keine E-Mail";
    const source=document.createElement("span");
    source.textContent="Quelle: "+(inquiry.source||"/");
    meta.append(created,metaEmail,source);
  
    const toggle=document.createElement("button");
    toggle.type="button";
    toggle.className="secondary inquiry-detail-toggle";
    toggle.textContent="Details";
    toggle.setAttribute("aria-expanded","false");
  
    const detail=document.createElement("div");
    detail.className="inquiry-detail";
    detail.hidden=true;
    toggle.addEventListener("click",()=>{
      detail.hidden=!detail.hidden;
      toggle.textContent=detail.hidden?"Details":"Details schließen";
      toggle.setAttribute("aria-expanded",detail.hidden?"false":"true");
    });
  
    const email=document.createElement("a");
    email.href="mailto:"+(inquiry.email||"");
    email.className="inquiry-detail-email";
    email.textContent=inquiry.email||"Keine E-Mail";
    const message=document.createElement("p");
    message.className="inquiry-message";
    message.textContent=inquiry.message||"";
  
    const noteLabel=document.createElement("label");
    noteLabel.className="inquiry-note";
    noteLabel.textContent="Interne Notiz";
    const note=document.createElement("textarea");
    note.rows=3;
    note.maxLength=2000;
    note.placeholder="Nur intern sichtbar, z. B. Rückruf vereinbart …";
    note.value=inquiry.internal_note||"";
    noteLabel.appendChild(note);
  
    const noteActions=document.createElement("div");
    noteActions.className="inquiry-note-actions";
    const noteSave=document.createElement("button");
    noteSave.type="button";
    noteSave.className="secondary";
    noteSave.textContent="Notiz speichern";
    const noteStatus=document.createElement("span");
    noteStatus.className="status";
    noteSave.addEventListener("click",async()=>{
      if(!getApi()||!hasAdminAuth()) return setStatus(noteStatus,"Admin-Anmeldung fehlt.",false);
      noteSave.disabled=true;
      setStatus(noteStatus,"Speichere …");
      try{
        await saveInquiryUpdate(inquiry,{internal_note:note.value});
        inquiry.internal_note=note.value;
        setStatus(noteStatus,"Interne Notiz gespeichert.",true);
      }catch(error){
        setStatus(noteStatus,"Notiz konnte nicht gespeichert werden: "+error.message,false);
      }finally{
        noteSave.disabled=false;
      }
    });
    noteActions.append(noteSave,noteStatus);
    detail.append(email,message,noteLabel,noteActions);
  
    const actions=document.createElement("div");
    actions.className="inquiry-actions";
    const statusLabel=document.createElement("label");
    statusLabel.textContent="Status";
    const select=document.createElement("select");
    [["neu","Neu"],["in-arbeit","In Arbeit"],["erledigt","Erledigt"],["archiviert","Archiviert"],["spam","Spam"]].forEach(([value,label])=>{
      const option=document.createElement("option");
      option.value=value;
      option.textContent=label;
      if(value===inquiry.status) option.selected=true;
      select.appendChild(option);
    });
  
    select.addEventListener("change",async()=>{
      const previous=inquiry.status;
      const next=select.value;
      select.disabled=true;
      badge.textContent="Speichert …";
      const ok=await updateInquiryStatus(inquiry,next);
      if(!ok){
        select.value=previous;
        badge.textContent=inquiryStatusLabel(previous);
      }else{
        renderInquiries();
      }
      select.disabled=false;
    });
    statusLabel.appendChild(select);
  
    const reply=document.createElement("a");
    reply.className="inquiry-reply";
    reply.href="mailto:"+(inquiry.email||"")+"?subject="+encodeURIComponent("Re: "+(inquiry.subject||"Ihre Anfrage"));
    reply.textContent="Antworten ↗";
  
    actions.append(statusLabel,toggle,reply);
    card.append(top,meta,actions,detail);
    return card;
  }
  
  function syncInquiryKanbanScroller(){
    if(!inquiryKanban||!inquiryKanbanScrollbar||!inquiryKanbanScrollbarTrack) return;
    inquiryKanbanScrollbarTrack.style.width=Math.max(inquiryKanban.scrollWidth,inquiryKanban.clientWidth)+"px";
    if(Math.abs(inquiryKanbanScrollbar.scrollLeft-inquiryKanban.scrollLeft)>1){
      inquiryKanbanScrollbar.scrollLeft=inquiryKanban.scrollLeft;
    }
    if(inquiryKanbanScrollbarWrap){
      inquiryKanbanScrollbarWrap.hidden=inquiryView!=="kanban"||inquiryKanban.scrollWidth<=inquiryKanban.clientWidth+2;
    }
  }
  
  function renderInquiryKanban(){
    if(!inquiryKanban) return;
    inquiryKanban.innerHTML="";
    const items=filteredInquiries({ignoreStatus:true});
    const definitions=[
      ["neu","Neu"],
      ["in-arbeit","In Arbeit"],
      ["erledigt","Erledigt"],
      ["archiviert","Archiviert"],
      ["spam","Spam"]
    ];
  
    if(inquiryResultSummary) inquiryResultSummary.textContent=items.length===1?"1 Anfrage im Kanban":items.length+" Anfragen im Kanban";
    if(inquiryResultHint) inquiryResultHint.textContent="Am Desktop Karten zwischen Spalten ziehen; mobil den Status in der Karte ändern.";
  
    for(const [status,label] of definitions){
      const column=document.createElement("section");
      column.className="inquiry-kanban-column";
      column.dataset.kanbanStatus=status;
  
      const header=document.createElement("div");
      header.className="inquiry-kanban-column-head";
      const title=document.createElement("strong");
      title.textContent=label;
      const count=document.createElement("span");
      const columnItems=items.filter(item=>(item.status||"neu")===status);
      count.textContent=columnItems.length;
      header.append(title,count);
  
      const body=document.createElement("div");
      body.className="inquiry-kanban-column-body";
      if(!columnItems.length){
        const empty=document.createElement("div");
        empty.className="inquiry-kanban-empty";
        empty.textContent="Keine Anfragen";
        body.appendChild(empty);
      }else{
        columnItems.forEach(inquiry=>body.appendChild(createInquiryCard(inquiry,{kanban:true})));
      }
  
      body.addEventListener("dragover",event=>{
        event.preventDefault();
        event.dataTransfer.dropEffect="move";
        column.classList.add("drag-over");
      });
      body.addEventListener("dragleave",event=>{
        if(!body.contains(event.relatedTarget)) column.classList.remove("drag-over");
      });
      body.addEventListener("drop",async event=>{
        event.preventDefault();
        column.classList.remove("drag-over");
        const id=event.dataTransfer.getData("text/plain");
        const inquiry=inquiriesCache.find(item=>item.id===id);
        if(!inquiry||inquiry.status===status) return;
        setStatus(inquiriesStatus,"Status wird aktualisiert …");
        const ok=await updateInquiryStatus(inquiry,status);
        if(ok){
          setStatus(inquiriesStatus,"Status aktualisiert.",true);
          renderInquiries();
        }
      });
  
      column.append(header,body);
      inquiryKanban.appendChild(column);
    }
    requestAnimationFrame(syncInquiryKanbanScroller);
  }
  
  function renderInquiryList(){
    if(!inquiriesList) return;
    inquiriesList.innerHTML="";
    const items=filteredInquiries();
    const pageSize=Math.max(10,Number(inquiryPageSize?.value)||20);
    const pageCount=Math.max(1,Math.ceil(items.length/pageSize));
    inquiryPage=Math.min(Math.max(1,inquiryPage),pageCount);
    const startIndex=(inquiryPage-1)*pageSize;
    const visibleItems=items.slice(startIndex,startIndex+pageSize);
  
    if(inquiryResultSummary){
      if(items.length){
        const from=startIndex+1;
        const to=Math.min(startIndex+pageSize,items.length);
        inquiryResultSummary.textContent=from+"–"+to+" von "+items.length+" Anfragen";
      }else{
        inquiryResultSummary.textContent="0 Anfragen";
      }
    }
    if(inquiryResultHint) inquiryResultHint.textContent="Listenansicht mit Seitenaufteilung.";
    if(inquiryPageLabel) inquiryPageLabel.textContent="Seite "+inquiryPage+" von "+pageCount;
    if(inquiryPrevPage) inquiryPrevPage.disabled=inquiryPage<=1;
    if(inquiryNextPage) inquiryNextPage.disabled=inquiryPage>=pageCount;
    if(inquiryPagination) inquiryPagination.hidden=items.length<=pageSize;
  
    if(!items.length){
      const empty=document.createElement("div");
      empty.className="inquiry-empty";
      empty.textContent=inquiriesCache.length
        ? "Keine Anfragen entsprechen den aktuellen Filtern."
        : "Noch keine Projektanfragen vorhanden.";
      inquiriesList.appendChild(empty);
      return;
    }
  
    visibleItems.forEach(inquiry=>inquiriesList.appendChild(createInquiryCard(inquiry)));
  }
  
  function renderInquiries(){
    if(!inquiriesList) return;
    const isKanban=inquiryView==="kanban";
    const inbox=document.querySelector(".inquiry-inbox");
    if(inbox) inbox.dataset.view=inquiryView;
    if(inquiryViewKanban){
      inquiryViewKanban.classList.toggle("active",isKanban);
      inquiryViewKanban.setAttribute("aria-pressed",isKanban?"true":"false");
    }
    if(inquiryViewList){
      inquiryViewList.classList.toggle("active",!isKanban);
      inquiryViewList.setAttribute("aria-pressed",isKanban?"false":"true");
    }
    if(inquiryKanban) inquiryKanban.hidden=!isKanban;
    if(inquiryKanbanScrollbarWrap) inquiryKanbanScrollbarWrap.hidden=!isKanban;
    inquiriesList.hidden=isKanban;
    if(inquiryPagination) inquiryPagination.hidden=isKanban;
  
    if(isKanban) renderInquiryKanban();
    else renderInquiryList();
  
    updateInquiryStats();
  }
  async function loadInquiries(){
    if(!inquiriesList||!inquiriesStatus) return;
  
    if(!getApi()||!hasAdminAuth()){
      inquiriesCache=[];
      updateInquiryStats();
      inquiriesList.innerHTML="";
      setStatus(inquiriesStatus,"Zum Laden der Anfragen ist eine gültige Cloudflare-Access-Sitzung erforderlich.",false);
      return;
    }
  
    if(refreshInquiries) refreshInquiries.disabled=true;
    setStatus(inquiriesStatus,"Lade Projektanfragen …");
  
    try{
      const response=await fetch(getApi()+"/api/admin/inquiries",{
        headers:adminHeaders()
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
  
      inquiriesCache=Array.isArray(data.inquiries)?data.inquiries:[];
      inquiryPage=1;
      updateInquiryStats();
      renderInquiries();
      setStatus(
        inquiriesStatus,
        inquiriesCache.length===1 ? "1 Anfrage geladen." : inquiriesCache.length+" Anfragen geladen.",
        true
      );
    }catch(error){
      inquiriesCache=[];
      updateInquiryStats();
      inquiriesList.innerHTML="";
      setStatus(inquiriesStatus,"Anfragen konnten nicht geladen werden: "+error.message,false);
    }finally{
      if(refreshInquiries) refreshInquiries.disabled=false;
    }
  }
  
  if(inquiryKanban&&inquiryKanbanScrollbar){
    let syncingKanbanScroll=false;
    inquiryKanban.addEventListener("scroll",()=>{
      if(syncingKanbanScroll)return;
      syncingKanbanScroll=true;
      inquiryKanbanScrollbar.scrollLeft=inquiryKanban.scrollLeft;
      syncingKanbanScroll=false;
    },{passive:true});
    inquiryKanbanScrollbar.addEventListener("scroll",()=>{
      if(syncingKanbanScroll)return;
      syncingKanbanScroll=true;
      inquiryKanban.scrollLeft=inquiryKanbanScrollbar.scrollLeft;
      syncingKanbanScroll=false;
    },{passive:true});
  
    let panActive=false;
    let panStartX=0;
    let panStartScroll=0;
    inquiryKanban.addEventListener("pointerdown",event=>{
      if(event.pointerType==="touch")return;
      if(event.target.closest("button,a,input,select,textarea,label,.inquiry-card"))return;
      panActive=true;
      panStartX=event.clientX;
      panStartScroll=inquiryKanban.scrollLeft;
      inquiryKanban.classList.add("is-panning");
      inquiryKanban.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    inquiryKanban.addEventListener("pointermove",event=>{
      if(!panActive)return;
      inquiryKanban.scrollLeft=panStartScroll-(event.clientX-panStartX);
    });
    const stopPan=event=>{
      if(!panActive)return;
      panActive=false;
      inquiryKanban.classList.remove("is-panning");
      if(event?.pointerId!=null) inquiryKanban.releasePointerCapture?.(event.pointerId);
    };
    inquiryKanban.addEventListener("pointerup",stopPan);
    inquiryKanban.addEventListener("pointercancel",stopPan);
    inquiryKanban.addEventListener("keydown",event=>{
      if(event.key==="ArrowRight"){
        inquiryKanban.scrollBy({left:280,behavior:"smooth"});
        event.preventDefault();
      }else if(event.key==="ArrowLeft"){
        inquiryKanban.scrollBy({left:-280,behavior:"smooth"});
        event.preventDefault();
      }
    });
    window.addEventListener("resize",()=>requestAnimationFrame(syncInquiryKanbanScroller),{passive:true});
  }
  
  if(refreshInquiries) refreshInquiries.addEventListener("click",loadInquiries);
  if(inquiryFilter) inquiryFilter.addEventListener("change",resetInquiryPageAndRender);
  if(inquiryPeriod) inquiryPeriod.addEventListener("change",resetInquiryPageAndRender);
  if(inquirySort) inquirySort.addEventListener("change",resetInquiryPageAndRender);
  if(inquiryPageSize) inquiryPageSize.addEventListener("change",resetInquiryPageAndRender);
  if(inquirySearch) inquirySearch.addEventListener("input",resetInquiryPageAndRender);
  if(inquiryViewKanban) inquiryViewKanban.addEventListener("click",()=>{
    inquiryView="kanban";
    if(inquiryFilter) inquiryFilter.value="alle";
    inquiryPage=1;
    renderInquiries();
  });
  if(inquiryViewList) inquiryViewList.addEventListener("click",()=>{
    inquiryView="list";
    inquiryPage=1;
    renderInquiries();
  });
  if(inquiryPrevPage) inquiryPrevPage.addEventListener("click",()=>{if(inquiryPage>1){inquiryPage-=1;renderInquiries();window.scrollTo({top:inquiriesList?.offsetTop-130||0,behavior:"smooth"})}});
  if(inquiryNextPage) inquiryNextPage.addEventListener("click",()=>{inquiryPage+=1;renderInquiries();window.scrollTo({top:inquiriesList?.offsetTop-130||0,behavior:"smooth"})});
  inquiryQuickFilters.forEach(button=>button.addEventListener("click",()=>{
    const status=button.dataset.inquiryQuickFilter||"alle";
    if(inquiryView==="kanban"){
      if(status==="alle"){
        inquiryKanban?.scrollTo({left:0,behavior:"smooth"});
        return;
      }
      document.querySelector('[data-kanban-status="'+status+'"]')?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
      return;
    }
    if(inquiryFilter) inquiryFilter.value=status;
    resetInquiryPageAndRender();
  }));

  window.GUDELIUS_INQUIRIES=Object.freeze({load:loadInquiries});
  loadInquiries();
})();
