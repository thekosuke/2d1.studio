/* A finite photo sphere. Zoom moves the camera closer without rearranging objects. */
window.createFindsGlobe = ({canvas,page,onOpen,onZoom,initialZoom=0}) => {
 const root=document.createElement('div');root.className='finds-globe';root.hidden=true;
 root.setAttribute('role','group');root.setAttribute('aria-label','Collection globe');
 const stage=document.createElement('div');stage.className='finds-globe-stage';
 root.append(stage);canvas.append(root);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let entries=[],enabled=false,focused=false,drag=null,blocked=false,frame=0,last=0,yaw=0,pitch=-.15,selected=0,suppress=false,wheeling=false,wheelEnd=0;
 const layer=canvas.querySelector('.objects-layer');
 let cameraZoom=initialZoom,zoomFrame=0,touchPinch=null,currentZoom=initialZoom;
 let faceFrame=0,centered=0;
 const mix=(a,b,t)=>a+(b-a)*t;
 const rotate=(p)=>{const c=Math.cos(yaw),s=Math.sin(yaw),x=p.x*c+p.z*s,z=p.z*c-p.x*s;return{x,y:p.y*Math.cos(pitch)-z*Math.sin(pitch),z:p.y*Math.sin(pitch)+z*Math.cos(pitch)};};
 function render(){
  const w=stage.clientWidth,h=stage.clientHeight,r=Math.max(1,Math.min(w,h)*.41),size=Math.max(26,Math.min(100,r*.235))*.8;
  // One world-space arrangement at every zoom. Approach its front surface;
  // perspective expands nearby objects faster than those on the far side.
  const t=cameraZoom/100,distance=3-1.65*t,magnification=Math.pow(2.4,t);
  root.hidden=!enabled;root.inert=!enabled;layer.hidden=true;layer.inert=true;
  let front=-Infinity;
  entries.forEach((entry,i)=>{const z=rotate(entry.point).z;if(z>front){front=z;centered=i;}});
  entries.forEach(entry=>{const p=rotate(entry.point),depth=(p.z+1)/2,perspective=distance/(distance-p.z),scale=magnification*perspective;
   const width=size*scale,left=w/2+p.x*r*scale-width/2,top=h/2+p.y*r*scale-width/2;
   entry.button.style.transform=`translate3d(${left}px,${top}px,0)`;
   entry.button.style.width=`${width}px`;entry.button.style.height=`${width}px`;
   entry.button.style.opacity=String(.18+.82*Math.pow(depth,1.5));entry.button.style.zIndex=String(Math.round(depth*100));
   entry.button.style.setProperty('--globe-front',String(depth));
  });
 }
 function canSpin(){return enabled&&currentZoom===0&&!focused&&!faceFrame&&!drag&&!touchPinch&&!wheeling&&!blocked&&!document.hidden&&!reduced.matches&&entries.length>1;}
 function tick(time){frame=0;if(!canSpin()){last=0;return;}if(last)yaw+=(Math.min(time-last,40)/1000)*.075;last=time;render();frame=requestAnimationFrame(tick);}
 function sync(){
  // Unrelated hover/class updates must not restart the clock every frame.
  if(canSpin()){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
  else{if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
 }
 function choose(index){selected=(index+entries.length)%entries.length;entries.forEach((entry,i)=>entry.button.tabIndex=i===selected?0:-1);}
 function stopFacing(){cancelAnimationFrame(faceFrame);faceFrame=0;}
 function face(index){
  stopFacing();
  const p=entries[index].point,targetYaw=-Math.atan2(p.x,p.z),targetPitch=Math.atan2(p.y,Math.hypot(p.x,p.z));
  const fromYaw=yaw,fromPitch=pitch,deltaYaw=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw));
  if(reduced.matches){yaw+=deltaYaw;pitch=targetPitch;render();return;}
  const start=performance.now();
  const step=time=>{const progress=Math.min(1,(time-start)/560),ease=1-Math.pow(1-progress,3);yaw=fromYaw+deltaYaw*ease;pitch=mix(fromPitch,targetPitch,ease);render();if(progress<1)faceFrame=requestAnimationFrame(step);else{faceFrame=0;sync();}};
  faceFrame=requestAnimationFrame(step);
 }
 function setItems(items){
  if(entries.length===items.length&&entries.every((entry,i)=>entry.item.id===items[i].id))return;
  stopFacing();stage.replaceChildren();entries=items.map((item,i)=>{
   const y=1-2*(i+.5)/items.length,a=i*Math.PI*(3-Math.sqrt(5)),rad=Math.sqrt(1-y*y);
   const point={x:Math.cos(a)*rad,y,z:Math.sin(a)*rad};
   const button=document.createElement('button');button.type='button';button.className='finds-globe-object';button.setAttribute('aria-label',`${item.name} — ${item.brand}`);button.tabIndex=i===0?0:-1;
   const img=document.createElement('img');img.alt='';img.draggable=false;img.decoding='async';img.sizes='320px';if(item.imageSrcset)img.srcset=item.imageSrcset;img.src=item.image;
   button.append(img);stage.append(button);
   button.addEventListener('focus',()=>{focused=button.matches(':focus-visible');choose(i);sync()});
   button.addEventListener('click',e=>{
    e.stopPropagation();if(suppress){suppress=false;return;}choose(i);
    // Focus is spatial, not DOM focus (pointerdown focuses the clicked button).
    if(currentZoom===100){if(i!==centered){face(i);return;}if(faceFrame||zoomFrame)return;}
    onOpen(item,button);
   });
   return{point,button,item};
  });selected=0;render();
 }
 root.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=stage.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');sync()})});
 root.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
  e.stopPropagation();if(!entries.length)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?entries.length-1:(selected+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+entries.length)%entries.length;choose(next);face(next);entries[next].button.focus({preventScroll:true});}
 });
 stage.addEventListener('dragstart',e=>e.preventDefault());
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||touchPinch)return;e.stopPropagation();suppress=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch,moved:false};sync();});
 stage.addEventListener('pointermove',e=>{if(touchPinch||!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;stopFacing();drag.moved=true;suppress=true;stage.setPointerCapture(e.pointerId);yaw=drag.yaw+dx*.008;pitch=Math.max(-1.4,Math.min(1.4,drag.pitch-dy*.008));render();});
 const release=()=>{drag=null;sync()};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);
 // Two-finger touch zoom approaches the same sphere.
 const touchDistance=touches=>Math.hypot(touches[1].clientX-touches[0].clientX,touches[1].clientY-touches[0].clientY);
 root.addEventListener('touchstart',e=>{if(e.touches.length!==2)return;stopFacing();touchPinch={distance:touchDistance(e.touches),zoom:currentZoom};drag=null;suppress=true;e.preventDefault();sync();},{passive:false});
 root.addEventListener('touchmove',e=>{if(!touchPinch||e.touches.length!==2)return;e.preventDefault();e.stopPropagation();const distance=touchDistance(e.touches);if(touchPinch.distance<2||distance<2)return;onZoom?.(touchPinch.zoom+Math.log(distance/touchPinch.distance)*60,(e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2);},{passive:false});
 const endTouch=()=>{touchPinch=null;drag=null;sync();};root.addEventListener('touchend',endTouch);root.addEventListener('touchcancel',endTouch);
 // Native trackpad momentum supplies the glide; both axes remain independent.
 root.addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey)return;
  e.preventDefault();e.stopPropagation();
  const unit=e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1;
  stopFacing();wheeling=true;clearTimeout(wheelEnd);sync();
  yaw-=e.deltaX*unit*.003;
  pitch=Math.max(-1.4,Math.min(1.4,pitch+e.deltaY*unit*.003));
  render();wheelEnd=setTimeout(()=>{wheeling=false;sync()},180);
 },{passive:false});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(zoomFrame);zoomFrame=0;cameraZoom=currentZoom;render();}sync();});
 new ResizeObserver(render).observe(stage);
 new MutationObserver(()=>{const next=!!document.querySelector('dialog[open]')||page.classList.contains('mobile-menu-open');if(next!==blocked){blocked=next;sync();}}).observe(page,{subtree:true,attributes:true,attributeFilter:['open','class']});
 return {
  update(items,zoom){
   if(zoom!==currentZoom)stopFacing();currentZoom=zoom;enabled=items.length>0;setItems(items);
   page.classList.toggle('objects-globe',enabled);
   if(zoomFrame)cancelAnimationFrame(zoomFrame);
   if(reduced.matches){cameraZoom=currentZoom;render();sync();return;}
   const from=cameraZoom,start=performance.now();
   const step=time=>{const progress=Math.min(1,(time-start)/420);cameraZoom=mix(from,currentZoom,1-Math.pow(1-progress,3));render();if(progress<1)zoomFrame=requestAnimationFrame(step);else zoomFrame=0;};
   zoomFrame=requestAnimationFrame(step);sync();
  },
  focus(){if(entries.length){face(selected);entries[selected].button.focus({preventScroll:true});}}
 };
};
