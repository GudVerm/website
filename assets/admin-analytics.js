/* Gudelius CMS: Statistik-Dashboard als eigenständiges Admin-Modul. */
(() => {
  "use strict";
  const core=window.GUDELIUS_ADMIN_CORE;
  if(!core)return;
  const {getApi,hasAdminAuth,adminHeaders,setStatus}=core;

  const analyticsDashboard=document.getElementById("analyticsDashboard");
  const analyticsStatus=document.getElementById("analyticsStatus");
  const analyticsEmpty=document.getElementById("analyticsEmpty");
  const analyticsPeriodButtons=[...document.querySelectorAll("[data-analytics-period]")];
  const analyticsRefresh=document.getElementById("analyticsRefresh");
  const analyticsExport=document.getElementById("analyticsExport");
  const analyticsPageviews=document.getElementById("analyticsPageviews");
  const analyticsInteractions=document.getElementById("analyticsInteractions");
  const analyticsContacts=document.getElementById("analyticsContacts");
  const analyticsInquiries=document.getElementById("analyticsInquiries");
  const analyticsCompare=document.getElementById("analyticsCompare");
  const analyticsTimeline=document.getElementById("analyticsTimeline");
  const analyticsTopPages=document.getElementById("analyticsTopPages");
  const analyticsTopActions=document.getElementById("analyticsTopActions");
  const analyticsServices=document.getElementById("analyticsServices");
  const analyticsContactBreakdown=document.getElementById("analyticsContactBreakdown");
  let analyticsPeriod="30";
  let analyticsCache=null;

  const analyticsPageNames={
    "/":"Startseite",
    "/index.html":"Startseite",
    "/leistungen/ingenieurvermessung/":"Ingenieurvermessung",
    "/leistungen/gis-bauvermessung/":"GIS & Bauvermessung",
    "/leistungen/3d-laserscanning/":"3D-Laserscanning",
    "/leistungen/drohnenvermessung/":"Drohnenvermessung",
    "/impressum/":"Impressum",
    "/datenschutz/":"Datenschutz",
    "/projekte/":"Projekte",
    "/technik/":"Technik",
    "/unternehmen/":"Unternehmen",
    "/kontakt/":"Kontakt"
  };
  const analyticsServiceNames={
    "ingenieurvermessung":"Ingenieurvermessung",
    "gis-bauvermessung":"GIS & Bauvermessung",
    "3d-laserscanning":"3D-Laserscanning",
    "drohnenvermessung":"Drohnenvermessung"
  };
  function analyticsPageName(path){return analyticsPageNames[path]||path||"–"}
  function analyticsActionName(row){
    if(row.event_type==="contact_action"&&row.target==="phone")return "Telefon angeklickt";
    if(row.event_type==="contact_action"&&row.target==="email")return "E-Mail angeklickt";
    if(row.event_type==="form_submit")return "Formular abgeschickt";
    if(row.event_type==="cta_click"&&row.target==="contact")return row.event_label||"Kontaktbereich geöffnet";
    if(row.event_type==="service_open")return (row.event_label||analyticsServiceNames[row.target]||row.target)+" geöffnet";
    if(row.event_type==="equipment_open")return "Technik geöffnet · "+(row.event_label||row.target);
    if(row.event_type==="cta_click")return row.event_label||"CTA angeklickt";
    if(row.event_type==="nav_click")return "Navigation · "+(row.event_label||row.target);
    return row.event_label||row.target||row.event_type;
  }
  function analyticsNumber(value){return Number(value||0).toLocaleString("de-DE")}
  function renderAnalyticsTable(target,rows,columns,emptyText){
    if(!target)return;target.innerHTML="";
    if(!rows.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=columns.length;td.className="analytics-table-empty";td.textContent=emptyText;tr.appendChild(td);target.appendChild(tr);return}
    rows.forEach(row=>{
      const tr=document.createElement("tr");
      columns.forEach(column=>{
        const td=document.createElement("td"),value=column.value(row);
        if(column.className)td.className=column.className;
        if(value instanceof Node)td.appendChild(value);else td.textContent=value;
        tr.appendChild(td);
      });
      target.appendChild(tr);
    });
  }
  function renderAnalyticsTimeline(rows){
    if(!analyticsTimeline)return;analyticsTimeline.innerHTML="";
    if(!rows.length){analyticsTimeline.innerHTML='<div class="analytics-chart-empty">Noch keine Daten für diesen Zeitraum.</div>';return}
    const max=Math.max(1,...rows.map(row=>Number(row.pageviews||0)));
    rows.forEach(row=>{
      const column=document.createElement("div");column.className="analytics-chart-column";
      const bars=document.createElement("div");bars.className="analytics-chart-bars";
      const bar=document.createElement("div");bar.className="analytics-chart-bar";bar.style.height=Math.max(3,Math.round(Number(row.pageviews||0)/max*100))+"%";bar.title=analyticsNumber(row.pageviews)+" Seitenaufrufe";
      if(Number(row.contact_actions||0)>0){const contact=document.createElement("span");contact.className="analytics-contact-dot";contact.title=analyticsNumber(row.contact_actions)+" Kontaktaktionen";bars.appendChild(contact)}
      bars.appendChild(bar);
      const count=document.createElement("strong");count.textContent=analyticsNumber(row.pageviews);
      const label=document.createElement("span");label.textContent=row.label||"";
      column.append(count,bars,label);analyticsTimeline.appendChild(column);
    });
  }
  function renderAnalytics(data){
    analyticsCache=data;
    const summary=data.summary||{};
    if(analyticsPageviews)analyticsPageviews.textContent=analyticsNumber(summary.pageviews);
    if(analyticsInteractions)analyticsInteractions.textContent=analyticsNumber(summary.interactions);
    if(analyticsContacts)analyticsContacts.textContent=analyticsNumber(summary.contact_actions);
    if(analyticsInquiries)analyticsInquiries.textContent=analyticsNumber(summary.inquiries);
  
    if(analyticsCompare){
      const previous=summary.previous_pageviews;
      if(previous===null||previous===undefined){analyticsCompare.textContent="";analyticsCompare.hidden=true}
      else if(Number(previous)===0){analyticsCompare.textContent=Number(summary.pageviews)>0?"Neue Aufrufe gegenüber dem vorherigen Zeitraum":"Keine Veränderung zum vorherigen Zeitraum";analyticsCompare.hidden=false}
      else{const change=Math.round((Number(summary.pageviews)-Number(previous))/Number(previous)*100);analyticsCompare.textContent=(change>0?"+":"")+change+" % Seitenaufrufe gegenüber dem vorherigen Zeitraum";analyticsCompare.hidden=false}
    }
  
    const total=Number(summary.pageviews||0)+Number(summary.interactions||0)+Number(summary.inquiries||0);
    if(analyticsEmpty)analyticsEmpty.hidden=total>0;
  
    renderAnalyticsTimeline(data.timeline||[]);
    renderAnalyticsTable(analyticsTopPages,data.top_pages||[],[
      {value:row=>analyticsPageName(row.page_path)},
      {value:row=>analyticsNumber(row.count),className:"analytics-number"}
    ],"Noch keine Seitenaufrufe.");
    renderAnalyticsTable(analyticsTopActions,data.top_actions||[],[
      {value:row=>analyticsActionName(row)},
      {value:row=>analyticsNumber(row.count),className:"analytics-number"}
    ],"Noch keine Interaktionen.");
    renderAnalyticsTable(analyticsServices,data.services||[],[
      {value:row=>analyticsServiceNames[row.slug]||row.slug},
      {value:row=>analyticsNumber(row.pageviews),className:"analytics-number"},
      {value:row=>analyticsNumber(row.card_clicks),className:"analytics-number"},
      {value:row=>analyticsNumber(row.contact_cta),className:"analytics-number"}
    ],"Noch keine Leistungsdaten.");
  
    const contacts=(data.contact_breakdown||[]).map(row=>({...row,label:row.event_type==="form_submit"?"Formular abgeschickt":row.target==="phone"?"Telefon angeklickt":row.target==="email"?"E-Mail angeklickt":row.event_type==="cta_click"&&row.target==="contact"?"Kontaktbereich / Projekt anfragen":row.target||row.event_type}));
    renderAnalyticsTable(analyticsContactBreakdown,contacts,[
      {value:row=>row.label},
      {value:row=>analyticsNumber(row.count),className:"analytics-number"}
    ],"Noch keine Kontaktaktionen.");
  }
  async function loadAnalytics(){
    if(!analyticsDashboard)return;
    if(!getApi()||!hasAdminAuth()){setStatus(analyticsStatus,"Zum Laden der Statistik bitte zuerst die Admin-Verbindung herstellen.",false);return}
    analyticsRefresh.disabled=true;if(analyticsExport)analyticsExport.disabled=true;
    setStatus(analyticsStatus,"Lade Statistik …");
    try{
      const offset=new Date().getTimezoneOffset();
      const response=await fetch(getApi()+"/api/admin/analytics?period="+encodeURIComponent(analyticsPeriod)+"&offset_minutes="+encodeURIComponent(offset),{headers:adminHeaders()});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||("HTTP "+response.status));
      renderAnalytics(data);setStatus(analyticsStatus,"Statistik geladen · Rohdaten werden maximal "+(data.retention_days||370)+" Tage gespeichert.",true);
      if(analyticsExport)analyticsExport.disabled=false;
    }catch(error){setStatus(analyticsStatus,"Statistik konnte momentan nicht geladen werden: "+error.message,false)}
    finally{analyticsRefresh.disabled=false}
  }
  function exportAnalyticsCsv(){
    if(!analyticsCache)return;
    const rows=[["Bereich","Bezeichnung","Wert"]];
    rows.push(["KPI","Seitenaufrufe",analyticsCache.summary?.pageviews||0],["KPI","Interaktionen",analyticsCache.summary?.interactions||0],["KPI","Kontaktaktionen",analyticsCache.summary?.contact_actions||0],["KPI","Projektanfragen",analyticsCache.summary?.inquiries||0]);
    (analyticsCache.top_pages||[]).forEach(row=>rows.push(["Seite",analyticsPageName(row.page_path),row.count]));
    (analyticsCache.top_actions||[]).forEach(row=>rows.push(["Aktion",analyticsActionName(row),row.count]));
    (analyticsCache.services||[]).forEach(row=>{rows.push(["Leistung · Aufrufe",analyticsServiceNames[row.slug]||row.slug,row.pageviews],["Leistung · Kachelklicks",analyticsServiceNames[row.slug]||row.slug,row.card_clicks],["Leistung · Kontakt-CTA",analyticsServiceNames[row.slug]||row.slug,row.contact_cta])});
    const csv="\uFEFF"+rows.map(row=>row.map(value=>'"'+String(value??"").replaceAll('"','""')+'"').join(";")).join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="gudelius-statistik-"+analyticsPeriod+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function setupAnalyticsDashboard(){
    if(!analyticsDashboard)return;
    analyticsPeriodButtons.forEach(button=>button.addEventListener("click",()=>{
      analyticsPeriod=button.dataset.analyticsPeriod||"30";
      analyticsPeriodButtons.forEach(item=>item.classList.toggle("active",item===button));
      loadAnalytics();
    }));
    analyticsRefresh?.addEventListener("click",loadAnalytics);
    analyticsExport?.addEventListener("click",exportAnalyticsCsv);
    loadAnalytics();
  }

  setupAnalyticsDashboard();
})();
