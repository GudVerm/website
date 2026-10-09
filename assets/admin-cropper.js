/* Gudelius CMS: eigenständiger, nicht-destruktiver Bildausschnitt-Editor. */
(() => {
  "use strict";

  function attachMediaCropEditor({card,img,item,status,dependencies}) {
    const {
      normalizeMediaLayout,
      clampMediaNumber,
      setStatus,
      getApi,
      hasAdminAuth,
      mediaLayoutContentKey,
      loadMediaLayoutContent,
      deleteMediaLayout,
      saveMediaLayout
    }=dependencies;
    if(!card||!img||!item?.key||card.querySelector(".media-crop-editor"))return;
    const imageWrap=img.closest(".image-wrap");
    const body=card.querySelector(".technik-media-body,.card-body")||card;
    if(!imageWrap||!body)return;
  
    imageWrap.classList.add("media-crop-stage");
    imageWrap.tabIndex=0;
    imageWrap.setAttribute("role","application");
    imageWrap.setAttribute("aria-label","Bild direkt verschieben, zoomen und drehen");
    const isFullBleedHero=item.key==="startseite/hero"||/\/hero$/.test(item.key);
    if(isFullBleedHero)imageWrap.classList.add("media-crop-stage-hero");
  
    const hud=document.createElement("div");
    hud.className="media-crop-hud";
    hud.innerHTML='<span class="media-crop-hint">Bild ziehen · Zoom-/Drehgriff direkt benutzen</span><strong class="media-crop-readout">100 % · 0°</strong>';
    imageWrap.appendChild(hud);
  
    const zoomHandle=document.createElement("button");
    zoomHandle.type="button";
    zoomHandle.className="media-crop-handle media-crop-zoom-handle";
    zoomHandle.innerHTML='<span aria-hidden="true">↗</span><small>Zoom</small>';
    zoomHandle.setAttribute("aria-label","Zoomgriff ziehen");
    imageWrap.appendChild(zoomHandle);
  
    const rotateHandle=document.createElement("button");
    rotateHandle.type="button";
    rotateHandle.className="media-crop-handle media-crop-rotate-handle";
    rotateHandle.innerHTML='<span aria-hidden="true">↻</span><small>Drehen</small>';
    rotateHandle.setAttribute("aria-label","Drehgriff ziehen");
    imageWrap.appendChild(rotateHandle);
  
    function targetProfilesForKey(key){
      if(key==="startseite/hero")return [
        {id:"hero",label:"Hero 16:9",ratio:16/9},
        {id:"hero-wide",label:"Hero breit",ratio:21/9},
        {id:"mobile",label:"Mobil",ratio:390/300}
      ];
      if(/^startseite\/(projekte|technik|unternehmen)$/.test(key))return [
        {id:"card",label:"Karte",ratio:4/3},
        {id:"card-mobile",label:"Karte mobil",ratio:390/190},
        {id:"portrait",label:"Portrait",ratio:4/5}
      ];
      if(/^projects\//.test(key))return [
        {id:"project",label:"Projektkarte",ratio:4/3},
        {id:"project-wide",label:"Projekt breit",ratio:16/9},
        {id:"mobile",label:"Mobil",ratio:390/260}
      ];
      if(/^technik\/|^equipment\//.test(key))return [
        {id:"technik",label:"Technik",ratio:16/10},
        {id:"square",label:"Quadrat",ratio:1},
        {id:"mobile",label:"Mobil",ratio:390/240}
      ];
      if(/^leistungsseiten\/.*\/hero$/.test(key))return [
        {id:"service-hero",label:"Leistungs-Hero",ratio:16/9},
        {id:"service-wide",label:"Hero breit",ratio:2},
        {id:"mobile",label:"Mobil",ratio:390/300}
      ];
      return [
        {id:"landscape",label:"16:9",ratio:16/9},
        {id:"card",label:"Karte",ratio:4/3},
        {id:"portrait",label:"Portrait",ratio:4/5},
        {id:"mobile",label:"Mobil",ratio:390/300}
      ];
    }
    const targetProfiles=targetProfilesForKey(item.key);
    let activeTarget=targetProfiles[0];

    const editor=document.createElement("div");
    editor.className="media-crop-editor media-crop-editor-direct";
    editor.innerHTML=`
      <div class="media-crop-direct-help">
        <strong>Direkt im Bild bearbeiten</strong>
        <span>Ziehen = verschieben · Zoomgriff/Mausrad/Pinch = zoomen · Drehgriff/Zwei-Finger-Geste = drehen · alternativ die Regler verwenden.</span>
      </div>
      <section class="media-crop-target" aria-label="Zielvorschau">
        <div class="media-crop-target-head">
          <div><strong>Zielvorschau</strong><span>Darstellung wie auf der Website</span></div>
          <button type="button" class="secondary media-crop-recommend">Empfohlenen Ausschnitt verwenden</button>
        </div>
        <div class="media-crop-target-tabs" role="tablist">
          ${targetProfiles.map((profile,index)=>'<button type="button" role="tab" class="media-crop-target-tab'+(index===0?' is-active':'')+'" data-target-id="'+profile.id+'">'+profile.label+'</button>').join("")}
        </div>
        <div class="media-crop-target-frame"><img class="media-crop-target-image" alt="" aria-hidden="true"></div>
        <div class="media-crop-target-readout"></div>
      </section>
      <div class="media-crop-sliders">
        <label><span>Horizontal</span><input class="media-crop-x" type="range" min="0" max="100" step="1" value="50"><output class="media-crop-value media-crop-x-value" for="">50 %</output></label>
        <label><span>Vertikal</span><input class="media-crop-y" type="range" min="0" max="100" step="1" value="50"><output class="media-crop-value media-crop-y-value" for="">50 %</output></label>
        <label><span>Zoom</span><input class="media-crop-zoom" type="range" min="25" max="300" step="5" value="100"><output class="media-crop-value media-crop-zoom-value" for="">100 %</output></label>
        <label><span>Drehung</span><input class="media-crop-rotation" type="range" min="-180" max="180" step="1" value="0"><output class="media-crop-value media-crop-rotation-value" for="">0°</output></label>
      </div>
      <div class="media-crop-actions">
        <button type="button" class="media-crop-save">Ausschnitt speichern</button>
        <button type="button" class="secondary media-crop-reset">Zurücksetzen</button>
      </div>
      <div class="media-crop-status status">Ausschnitt wird geladen …</div>
    `;
    body.appendChild(editor);
  
    const readout=hud.querySelector(".media-crop-readout");
    const cropStatus=editor.querySelector(".media-crop-status");
    const saveButton=editor.querySelector(".media-crop-save");
    const resetButton=editor.querySelector(".media-crop-reset");
    const xInput=editor.querySelector(".media-crop-x");
    const yInput=editor.querySelector(".media-crop-y");
    const zoomInput=editor.querySelector(".media-crop-zoom");
    const rotationInput=editor.querySelector(".media-crop-rotation");
    if(zoomInput)zoomInput.min=isFullBleedHero?"100":"25";
    const xValue=editor.querySelector(".media-crop-x-value");
    const yValue=editor.querySelector(".media-crop-y-value");
    const zoomValue=editor.querySelector(".media-crop-zoom-value");
    const rotationValue=editor.querySelector(".media-crop-rotation-value");
    const targetFrame=editor.querySelector(".media-crop-target-frame");
    const targetImage=editor.querySelector(".media-crop-target-image");
    const targetReadout=editor.querySelector(".media-crop-target-readout");
    const recommendButton=editor.querySelector(".media-crop-recommend");
    const targetTabs=[...editor.querySelectorAll(".media-crop-target-tab")];
    targetImage.src=img.currentSrc||img.src;
  
    let layout=normalizeMediaLayout(null);
    let savedLayout=normalizeMediaLayout(null);
    let cropDirty=false;
    const pointers=new Map();
    let panState=null;
    let pinchState=null;
    let handleState=null;
  
    function normalizeAngle(value){
      let angle=Number(value)||0;
      while(angle>180)angle-=360;
      while(angle<-180)angle+=360;
      return angle;
    }
    function pointerPoint(event){return {x:event.clientX,y:event.clientY}}
    function pointDistance(a,b){return Math.hypot(b.x-a.x,b.y-a.y)}
    function pointAngle(a,b){return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI}
    function midpoint(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
    function canonicalLayout(value){
      const normalized=normalizeMediaLayout({...value,rotation:normalizeAngle(value?.rotation)});
      return {
        x:Number(normalized.x),
        y:Number(normalized.y),
        zoom:isFullBleedHero?Math.max(100,Number(normalized.zoom)):Number(normalized.zoom),
        rotation:Number(normalized.rotation)
      };
    }
    function sameLayout(a,b){
      const left=canonicalLayout(a),right=canonicalLayout(b);
      return ["x","y","zoom","rotation"].every(key=>Math.abs(left[key]-right[key])<0.01);
    }
    function setDirtyState(nextDirty){
      const next=Boolean(nextDirty);
      if(cropDirty===next)return;
      cropDirty=next;
      card.classList.toggle("has-unsaved-crop",cropDirty);
      saveButton.classList.toggle("is-dirty",cropDirty);
      saveButton.textContent=cropDirty?"Ausschnitt speichern •":"Ausschnitt gespeichert";
      saveButton.disabled=!cropDirty;
      card.dispatchEvent(new CustomEvent("cms-crop-dirty-change",{
        bubbles:true,
        detail:{dirty:cropDirty,key:item.key,layout:canonicalLayout(layout)}
      }));
    }
    function syncDirtyState(message="Nicht gespeicherte Änderung."){
      const changed=!sameLayout(layout,savedLayout);
      setDirtyState(changed);
      if(changed)setStatus(cropStatus,message);
      else setStatus(cropStatus,"Ausschnitt entspricht dem gespeicherten Stand.",true);
    }
  
    function measure(currentLayout=layout){
      const rect=imageWrap.getBoundingClientRect();
      const stageW=Math.max(1,rect.width);
      const stageH=Math.max(1,rect.height);
      const naturalW=Math.max(1,img.naturalWidth||stageW);
      const naturalH=Math.max(1,img.naturalHeight||stageH);
      const cover=Math.max(stageW/naturalW,stageH/naturalH);
      const zoom=Math.max(isFullBleedHero?1:.25,currentLayout.zoom/100);
      const width=naturalW*cover*zoom;
      const height=naturalH*cover*zoom;
      const radians=(normalizeAngle(currentLayout.rotation)||0)*Math.PI/180;
      const cos=Math.abs(Math.cos(radians));
      const sin=Math.abs(Math.sin(radians));
      const rotatedW=Math.max(1,width*cos+height*sin);
      const rotatedH=Math.max(1,width*sin+height*cos);
      return {
        rect,stageW,stageH,width,height,rotatedW,rotatedH,
        travelX:stageW-rotatedW,
        travelY:stageH-rotatedH,
        rotationOffsetX:(rotatedW-width)/2,
        rotationOffsetY:(rotatedH-height)/2
      };
    }
  
    function visualPlacement(currentLayout=layout,metrics=measure(currentLayout)){
      const visualLeft=metrics.travelX*(currentLayout.x/100);
      const visualTop=metrics.travelY*(currentLayout.y/100);
      return {
        visualLeft,
        visualTop,
        elementLeft:visualLeft+metrics.rotationOffsetX,
        elementTop:visualTop+metrics.rotationOffsetY
      };
    }
  
    function keepAnchor(startLayout,startMetrics,nextLayout,nextMetrics,startPoint,currentPoint=startPoint){
      const startPlacement=visualPlacement(startLayout,startMetrics);
      const fractionX=(startPoint.x-startPlacement.visualLeft)/Math.max(1,startMetrics.rotatedW);
      const fractionY=(startPoint.y-startPlacement.visualTop)/Math.max(1,startMetrics.rotatedH);
      const nextLeft=currentPoint.x-(fractionX*nextMetrics.rotatedW);
      const nextTop=currentPoint.y-(fractionY*nextMetrics.rotatedH);
      const next={...nextLayout};
      next.x=Math.abs(nextMetrics.travelX)>0.5
        ? clampMediaNumber((nextLeft/nextMetrics.travelX)*100,0,100,50)
        : 50;
      next.y=Math.abs(nextMetrics.travelY)>0.5
        ? clampMediaNumber((nextTop/nextMetrics.travelY)*100,0,100,50)
        : 50;
      return next;
    }
  
    function renderTargetPreview(){
      if(!targetFrame||!targetImage||!activeTarget)return;
      targetFrame.style.aspectRatio=String(activeTarget.ratio);
      targetImage.style.objectFit="cover";
      targetImage.style.objectPosition=layout.x+"% "+layout.y+"%";
      targetImage.style.transformOrigin=layout.x+"% "+layout.y+"%";
      const previewZoom=isFullBleedHero?Math.max(100,layout.zoom):layout.zoom;
      targetImage.style.transform="scale("+(previewZoom/100)+") rotate("+layout.rotation+"deg)";
      targetReadout.textContent=activeTarget.label+" · "+Math.round(layout.zoom)+" % · "+Math.round(layout.rotation)+"° · X "+Math.round(layout.x)+" % · Y "+Math.round(layout.y)+" %";
    }
    function recommendedLayout(profile=activeTarget){
      const frameRatio=Math.max(.2,Number(profile?.ratio)||1);
      const naturalW=Math.max(1,img.naturalWidth||1600);
      const naturalH=Math.max(1,img.naturalHeight||900);
      const naturalRatio=naturalW/naturalH;
      let coverW,coverH;
      if(naturalRatio>=frameRatio){coverH=1;coverW=naturalRatio/frameRatio}
      else{coverW=1;coverH=frameRatio/naturalRatio}
      const radians=Math.abs(normalizeAngle(layout.rotation))*Math.PI/180;
      const cos=Math.abs(Math.cos(radians)),sin=Math.abs(Math.sin(radians));
      const needW=cos+sin/frameRatio;
      const needH=cos+sin*frameRatio;
      const scale=Math.max(needW/coverW,needH/coverH,1);
      return canonicalLayout({...layout,x:50,y:50,zoom:Math.min(300,Math.max(100,Math.ceil(scale*105)))});
    }
    function render(){
      layout=canonicalLayout({...layout,rotation:normalizeAngle(layout.rotation)});
      const metrics=measure(layout);
      const placement=visualPlacement(layout,metrics);
  
      img.style.setProperty("position","absolute","important");
      img.style.setProperty("display","block","important");
      img.style.setProperty("width",metrics.width+"px","important");
      img.style.setProperty("height",metrics.height+"px","important");
      img.style.setProperty("max-width","none","important");
      img.style.setProperty("max-height","none","important");
      img.style.setProperty("left",placement.elementLeft+"px","important");
      img.style.setProperty("top",placement.elementTop+"px","important");
      img.style.setProperty("margin","0","important");
      img.style.setProperty("padding","0","important");
      img.style.setProperty("object-fit","fill","important");
      img.style.setProperty("object-position","50% 50%","important");
      img.style.setProperty("transform-origin","50% 50%","important");
      img.style.setProperty("transform","rotate("+layout.rotation+"deg)","important");
  
      readout.textContent=Math.round(layout.zoom)+" % · "+Math.round(layout.rotation)+"°";
      const roundedX=Math.round(layout.x);
      const roundedY=Math.round(layout.y);
      const roundedZoom=Math.round(layout.zoom);
      const roundedRotation=Math.round(layout.rotation);
      xInput.value=String(roundedX);
      yInput.value=String(roundedY);
      zoomInput.value=String(Math.round(layout.zoom/5)*5);
      rotationInput.value=String(roundedRotation);
      xValue.textContent=roundedX+" %";
      yValue.textContent=roundedY+" %";
      zoomValue.textContent=roundedZoom+" %";
      rotationValue.textContent=roundedRotation+"°";
      renderTargetPreview();
    }
  
    function markChanged(message="Nicht gespeicherte Änderung."){
      render();
      syncDirtyState(message);
    }
  
    function panBy(dx,dy,startLayout,startMetrics){
      const next={...startLayout};
      if(Math.abs(startMetrics.travelX)>0.5){
        next.x=startLayout.x+(dx/startMetrics.travelX)*100;
      }
      if(Math.abs(startMetrics.travelY)>0.5){
        next.y=startLayout.y+(dy/startMetrics.travelY)*100;
      }
      next.x=clampMediaNumber(next.x,0,100,50);
      next.y=clampMediaNumber(next.y,0,100,50);
      layout=next;
    }
  
    function startHandle(event,type){
      event.preventDefault();
      event.stopPropagation();
      const rect=imageWrap.getBoundingClientRect();
      const center={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
      const p=pointerPoint(event);
      const startLayout={...layout};
      const startMetrics=measure(startLayout);
      const startPlacement=visualPlacement(startLayout,startMetrics);
      const imageCenter={
        x:startPlacement.visualLeft+startMetrics.rotatedW/2,
        y:startPlacement.visualTop+startMetrics.rotatedH/2
      };
      handleState={
        type,
        pointerId:event.pointerId,
        center,
        startDistance:Math.max(8,pointDistance(center,p)),
        startAngle:pointAngle(center,p),
        startLayout,
        startMetrics,
        imageCenter
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      imageWrap.classList.add(type==="zoom"?"is-crop-zooming":"is-crop-rotating");
    }
  
    function moveHandle(event,type){
      if(!handleState||handleState.type!==type||handleState.pointerId!==event.pointerId)return;
      const p=pointerPoint(event);
      let next={...handleState.startLayout};
      if(type==="zoom"){
        const ratio=pointDistance(handleState.center,p)/handleState.startDistance;
        next.zoom=clampMediaNumber(handleState.startLayout.zoom*ratio,isFullBleedHero?100:25,300,100);
      }else{
        const delta=pointAngle(handleState.center,p)-handleState.startAngle;
        next.rotation=normalizeAngle(handleState.startLayout.rotation+delta);
      }
      const nextMetrics=measure(next);
      layout=keepAnchor(
        handleState.startLayout,
        handleState.startMetrics,
        next,
        nextMetrics,
        handleState.imageCenter,
        handleState.imageCenter
      );
      markChanged();
    }
  
    function stopHandle(event){
      if(!handleState||handleState.pointerId!==event.pointerId)return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      handleState=null;
      imageWrap.classList.remove("is-crop-zooming","is-crop-rotating");
    }
  
    zoomHandle.addEventListener("pointerdown",event=>startHandle(event,"zoom"));
    zoomHandle.addEventListener("pointermove",event=>moveHandle(event,"zoom"));
    zoomHandle.addEventListener("pointerup",stopHandle);
    zoomHandle.addEventListener("pointercancel",stopHandle);
  
    rotateHandle.addEventListener("pointerdown",event=>startHandle(event,"rotate"));
    rotateHandle.addEventListener("pointermove",event=>moveHandle(event,"rotate"));
    rotateHandle.addEventListener("pointerup",stopHandle);
    rotateHandle.addEventListener("pointercancel",stopHandle);
  
    imageWrap.addEventListener("wheel",event=>{
      if(event.target.closest(".media-crop-handle"))return;
      event.preventDefault();
      const startLayout={...layout};
      const startMetrics=measure(startLayout);
      const anchor={
        x:event.clientX-startMetrics.rect.left,
        y:event.clientY-startMetrics.rect.top
      };
      const next={
        ...startLayout,
        zoom:clampMediaNumber(startLayout.zoom*(event.deltaY<0?1.08:1/1.08),25,300,100)
      };
      const nextMetrics=measure(next);
      layout=keepAnchor(startLayout,startMetrics,next,nextMetrics,anchor,anchor);
      markChanged();
    },{passive:false});
  
    imageWrap.addEventListener("pointerdown",event=>{
      if(event.target.closest(".media-crop-handle"))return;
      if(event.pointerType==="mouse"&&event.button!==0)return;
      if(pointers.size>=2&&!pointers.has(event.pointerId))return;
      const p=pointerPoint(event);
      pointers.set(event.pointerId,p);
      imageWrap.setPointerCapture?.(event.pointerId);
  
      if(pointers.size===1){
        panState={pointerId:event.pointerId,start:p,layout:{...layout},metrics:measure(layout)};
        pinchState=null;
      }else if(pointers.size===2){
        const pts=[...pointers.values()].slice(0,2);
        const startLayout={...layout};
        const startMetrics=measure(startLayout);
        const middlePoint=midpoint(pts[0],pts[1]);
        pinchState={
          distance:Math.max(8,pointDistance(pts[0],pts[1])),
          angle:pointAngle(pts[0],pts[1]),
          middle:{
            x:middlePoint.x-startMetrics.rect.left,
            y:middlePoint.y-startMetrics.rect.top
          },
          layout:startLayout,
          metrics:startMetrics
        };
        panState=null;
      }
      imageWrap.classList.add("is-crop-dragging");
      event.preventDefault();
    });
  
    imageWrap.addEventListener("pointermove",event=>{
      if(!pointers.has(event.pointerId)||handleState)return;
      const p=pointerPoint(event);
      pointers.set(event.pointerId,p);
  
      if(pointers.size>=2&&pinchState){
        const pts=[...pointers.values()].slice(0,2);
        const currentDistance=Math.max(8,pointDistance(pts[0],pts[1]));
        const currentAngle=pointAngle(pts[0],pts[1]);
        const currentMiddle=midpoint(pts[0],pts[1]);
  
        const next={
          ...pinchState.layout,
          zoom:clampMediaNumber(pinchState.layout.zoom*(currentDistance/pinchState.distance),25,300,100),
          rotation:normalizeAngle(pinchState.layout.rotation+(currentAngle-pinchState.angle))
        };
        const nextMetrics=measure(next);
        const currentAnchor={
          x:currentMiddle.x-nextMetrics.rect.left,
          y:currentMiddle.y-nextMetrics.rect.top
        };
        layout=keepAnchor(
          pinchState.layout,
          pinchState.metrics,
          next,
          nextMetrics,
          pinchState.middle,
          currentAnchor
        );
        markChanged();
        return;
      }
  
      if(pointers.size===1&&panState&&panState.pointerId===event.pointerId){
        panBy(p.x-panState.start.x,p.y-panState.start.y,panState.layout,panState.metrics);
        markChanged();
      }
    });
  
    function releasePointer(event){
      if(!pointers.has(event.pointerId))return;
      pointers.delete(event.pointerId);
      imageWrap.releasePointerCapture?.(event.pointerId);
  
      if(pointers.size===0){
        panState=null;
        pinchState=null;
        imageWrap.classList.remove("is-crop-dragging");
      }else if(pointers.size===1){
        const [pointerId,p]=[...pointers.entries()][0];
        panState={pointerId,start:p,layout:{...layout},metrics:measure(layout)};
        pinchState=null;
      }
    }
    imageWrap.addEventListener("pointerup",releasePointer);
    imageWrap.addEventListener("pointercancel",releasePointer);
    imageWrap.addEventListener("lostpointercapture",event=>{
      if(pointers.has(event.pointerId))releasePointer(event);
    });
  
    function updateFromSliders(event){
      if(event?.target===xInput||event?.target===yInput){
        layout.x=clampMediaNumber(xInput.value,0,100,50);
        layout.y=clampMediaNumber(yInput.value,0,100,50);
        markChanged();
        return;
      }
  
      const startLayout={...layout};
      const startMetrics=measure(startLayout);
      const startPlacement=visualPlacement(startLayout,startMetrics);
      const imageCenter={
        x:startPlacement.visualLeft+startMetrics.rotatedW/2,
        y:startPlacement.visualTop+startMetrics.rotatedH/2
      };
      const next={
        ...startLayout,
        zoom:clampMediaNumber(zoomInput.value,isFullBleedHero?100:25,300,100),
        rotation:normalizeAngle(clampMediaNumber(rotationInput.value,-180,180,0))
      };
      const nextMetrics=measure(next);
      layout=keepAnchor(startLayout,startMetrics,next,nextMetrics,imageCenter,imageCenter);
      markChanged();
    }
    targetTabs.forEach(button=>{
      button.addEventListener("click",()=>{
        const profile=targetProfiles.find(entry=>entry.id===button.dataset.targetId);
        if(!profile)return;
        activeTarget=profile;
        targetTabs.forEach(tab=>tab.classList.toggle("is-active",tab===button));
        renderTargetPreview();
      });
    });
    recommendButton.addEventListener("click",()=>{
      layout=recommendedLayout(activeTarget);
      markChanged("Empfohlener Ausschnitt für „"+activeTarget.label+"“ gesetzt.");
    });

    [xInput,yInput,zoomInput,rotationInput].forEach(input=>{
      input.addEventListener("input",updateFromSliders);
    });

    const valueResets=[
      {output:xValue,key:"x",value:50,label:"Horizontal",unit:"50 %"},
      {output:yValue,key:"y",value:50,label:"Vertikal",unit:"50 %"},
      {output:zoomValue,key:"zoom",value:100,label:"Zoom",unit:"100 %"},
      {output:rotationValue,key:"rotation",value:0,label:"Drehung",unit:"0°"}
    ];
    function resetSingleCropValue(entry){
      if(!entry)return;
      layout={...layout,[entry.key]:entry.value};
      markChanged(entry.label+" auf Standardwert "+entry.unit+" zurückgesetzt.");
    }
    valueResets.forEach(entry=>{
      const output=entry.output;
      if(!output)return;
      output.tabIndex=0;
      output.setAttribute("role","button");
      output.setAttribute("aria-label",entry.label+" auf Standardwert "+entry.unit+" zurücksetzen");
      output.title=entry.label+" auf Standardwert "+entry.unit+" zurücksetzen";
      output.addEventListener("click",()=>resetSingleCropValue(entry));
      output.addEventListener("keydown",event=>{
        if(event.key!=="Enter"&&event.key!==" ")return;
        event.preventDefault();
        resetSingleCropValue(entry);
      });
    });
  
    imageWrap.addEventListener("keydown",event=>{
      const move=event.shiftKey?8:2;
      if(event.key==="ArrowLeft")layout.x-=move;
      else if(event.key==="ArrowRight")layout.x+=move;
      else if(event.key==="ArrowUp")layout.y-=move;
      else if(event.key==="ArrowDown")layout.y+=move;
      else if(event.key==="+"||event.key==="=")layout.zoom+=5;
      else if(event.key==="-")layout.zoom-=5;
      else if(event.key==="[")layout.rotation-=2;
      else if(event.key==="]")layout.rotation+=2;
      else return;
      event.preventDefault();
      layout.x=clampMediaNumber(layout.x,0,100,50);
      layout.y=clampMediaNumber(layout.y,0,100,50);
      layout.zoom=clampMediaNumber(layout.zoom,25,300,100);
      layout.rotation=normalizeAngle(layout.rotation);
      markChanged();
    });
  
    const rerender=()=>requestAnimationFrame(render);
    img.addEventListener("load",()=>{targetImage.src=img.currentSrc||img.src;rerender()});
    if("ResizeObserver" in window){
      const resizeObserver=new ResizeObserver(rerender);
      resizeObserver.observe(imageWrap);
    }else{
      window.addEventListener("resize",rerender);
    }
  
    async function saveCurrentCrop(){
      if(!cropDirty)return canonicalLayout(savedLayout);
      if(!getApi()||!hasAdminAuth()){
        setStatus(cropStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
        throw new Error("Worker-URL oder Admin-Anmeldung fehlt.");
      }
      saveButton.disabled=true;
      setStatus(cropStatus,"Speichere Ausschnitt …");
      try{
        const value=canonicalLayout(layout);
        await saveMediaLayout(item.key,value);
        layout=value;
        savedLayout={...value};
        render();
        setDirtyState(false);
        setStatus(cropStatus,"Ausschnitt gespeichert.",true);
        return value;
      }catch(error){
        setStatus(cropStatus,"Speichern fehlgeschlagen: "+error.message,false);
        throw error;
      }finally{
        saveButton.disabled=!cropDirty;
      }
    }

    saveButton.addEventListener("click",()=>{
      saveCurrentCrop().catch(()=>{});
    });
  
    resetButton.addEventListener("click",async()=>{
      if(!getApi()||!hasAdminAuth())return setStatus(cropStatus,"Worker-URL oder Admin-Anmeldung fehlt.",false);
      resetButton.disabled=true;
      setStatus(cropStatus,"Setze Ausschnitt zurück …");
      try{
        await deleteMediaLayout(item.key);
        layout=normalizeMediaLayout(null);
        savedLayout=canonicalLayout(layout);
        render();
        setDirtyState(false);
        setStatus(cropStatus,"Standard-Ausschnitt wiederhergestellt.",true);
      }catch(error){
        setStatus(cropStatus,"Zurücksetzen fehlgeschlagen: "+error.message,false);
      }finally{
        resetButton.disabled=false;
      }
    });
  
    saveButton.disabled=true;
    saveButton.textContent="Ausschnitt gespeichert";

    loadMediaLayoutContent().then(content=>{
      layout=canonicalLayout(content[mediaLayoutContentKey(item.key)]);
      savedLayout={...layout};
      render();
      setDirtyState(false);
      saveButton.disabled=true;
      setStatus(cropStatus,content[mediaLayoutContentKey(item.key)]?"Gespeicherter Ausschnitt geladen.":"Standard-Ausschnitt aktiv.",true);
    }).catch(error=>{
      render();
      saveButton.disabled=false;
      saveButton.textContent="Ausschnitt speichern";
      setStatus(cropStatus,"Ausschnitt konnte nicht geladen werden: "+error.message,false);
    });

    return Object.freeze({
      save:saveCurrentCrop,
      isDirty:()=>cropDirty,
      getLayout:()=>canonicalLayout(layout),
      getSavedLayout:()=>canonicalLayout(savedLayout)
    });
  }

  window.GUDELIUS_CROPPER=Object.freeze({attach:attachMediaCropEditor});
})();
