/* Assemble the toy house, zoom into Studio, then slide Shop in
   from the right. Native scrolling supplies reading travel for long copy. */
(() => {
 const journey=document.querySelector('.house-journey');if(!journey)return;
 const viewport=journey.querySelector('.house-viewport'),panel=journey.querySelector('.design-house');
 const diagram=panel.querySelector('.design-house-diagram'),homeViewBox=diagram.getAttribute('viewBox');
 const studioLabel=panel.querySelector('.house-room-label');
 const pieces=[...panel.querySelectorAll('[data-house-piece]')],rooms=journey.querySelector('.about-services');
 const [studio,shop]=rooms.children,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Keep one visible label across the diagram/HTML handoff. The overlay is
 // decorative; #about-studio remains the semantic heading throughout.
 const heading=studio.querySelector('#about-studio');
 const bridge=document.createElementNS('http://www.w3.org/2000/svg','svg');
 bridge.classList.add('house-title-bridge');bridge.setAttribute('aria-hidden','true');
 const movingLabel=studioLabel.cloneNode(true);
 movingLabel.removeAttribute('transform');movingLabel.setAttribute('text-anchor','start');
 movingLabel.textContent=heading.textContent;bridge.append(movingLabel);viewport.append(bridge);
 const baseline=document.createElement('span');baseline.className='house-title-baseline';
 baseline.setAttribute('aria-hidden','true');heading.append(baseline);
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 const placements=[{x:-100,y:10,angle:-12,start:0,duration:.55},{x:110,y:50,angle:12,start:.15,duration:.55},{x:20,y:-90,angle:-6,start:.4,duration:.6}];
 let queued=false,metrics,assembled=false;
 function measure(){
  journey.classList.toggle('has-room-journey',!reduced.matches);
  if(reduced.matches){diagram.setAttribute('viewBox',homeViewBox);studioLabel.style.opacity='';studioLabel.style.visibility='';heading.style.opacity='';bridge.style.display='none';journey.style.height='';panel.style.opacity='';rooms.style.cssText='';rooms.classList.remove('is-entered');pieces.forEach(p=>p.removeAttribute('transform'));[studio,shop].forEach(r=>r.style.cssText='');journey.style.removeProperty('--flat-room-left');dispatchEvent(new Event('about-ground-change'));return}
  const w=document.documentElement.clientWidth,h=viewport.clientHeight;
  const social=document.querySelector('.site-footer .social-links');
  const edge=w>=1100?social.getBoundingClientRect().left:24;
  journey.style.setProperty('--flat-room-left',`${Math.max(9,edge-(w<768?12:w*.15)-3)}px`);
  // Meet the actual rounded border, including its stroke center, instead of
  // stopping at the empty corner of its rectangular bounding box.
  [studio,shop].forEach(room=>{
   const frame=room.querySelector('.about-room-frame'),outline=room.querySelector('.about-room-outline path');
   const style=getComputedStyle(frame),half=parseFloat(style.borderTopWidth)/2;
   const radius=Math.max(0,parseFloat(style.borderTopLeftRadius)-half);
   const inset=half+radius*(1-Math.SQRT1_2);
   const x1=(frame.offsetLeft+inset)/room.clientWidth*1000;
   const x2=(frame.offsetLeft+frame.offsetWidth-inset)/room.clientWidth*1000;
   const y1=(frame.offsetTop+inset)/room.clientHeight*1000;
   const y2=(frame.offsetTop+frame.offsetHeight-inset)/room.clientHeight*1000;
   outline.setAttribute('d',`M0 0L${x1} ${y1}M1000 0L${x2} ${y1}M0 1000L${x1} ${y2}M1000 1000L${x2} ${y2}`);
  });
  const travel=r=>Math.max(0,r.querySelector('.about-service-grid').offsetHeight-r.querySelector('.about-room-frame').clientHeight);
  const studioTravel=travel(studio),shopTravel=travel(shop),reveal=h*2.15,cross=reveal+studioTravel+h*1.25,shopStart=cross+h*1.25;
  metrics={h,studioTravel,shopTravel,reveal,cross,shopStart};journey.style.height=`${shopStart+shopTravel+h*2.1}px`;schedule();
 }
 function paint(){queued=false;if(reduced.matches||!metrics)return;
  const {h,studioTravel,shopTravel,reveal,cross,shopStart}=metrics,distance=-journey.getBoundingClientRect().top;
  const entrance=clamp((distance+h*.42)/(h*1.02));assembled ||= entrance===1;
  pieces.forEach((piece,i)=>{const p=placements[i],remain=1-ease(((assembled?1:entrance)-p.start)/p.duration);if(!remain)piece.removeAttribute('transform');else piece.setAttribute('transform',`translate(${p.x*remain} ${p.y*remain}) rotate(${p.angle*remain} ${piece.dataset.pivot})`)});
  // Zoom the SVG viewBox toward the Studio block, keeping its artwork crisp.
  // This camera belongs only to the diagram; the room remains flat-on.
  const zoom=ease((distance-h*.95)/(h*1.2)),scale=Math.pow(14,zoom);
  const width=730/scale,height=720/scale;
  const centerX=224.5+(395-224.5)*(1-zoom)/scale;
  const centerY=466.5+(360-466.5)*(1-zoom)/scale;
  diagram.setAttribute('viewBox',`${centerX-width/2} ${centerY-height/2} ${width} ${height}`);

  const appear=ease((distance-h*1.85)/(h*.3));panel.style.opacity=1-appear;rooms.style.setProperty('--rooms-opacity',appear);rooms.classList.toggle('is-entered',appear>.95);
  const across=ease((distance-cross)/(h*1.25));studio.style.setProperty('--flat-room-x',`${-across*100}%`);shop.style.setProperty('--flat-room-x',`${(1-across)*100}%`);
  studio.style.setProperty('--room-y',`${-Math.min(studioTravel,Math.max(0,distance-reveal-h*.35))}px`);shop.style.setProperty('--room-y',`${-Math.min(shopTravel,Math.max(0,distance-shopStart-h*.35))}px`);
  const morph=ease((distance-h*1.15)/h);
  const bridging=distance>=h*1.15&&distance<reveal;
  bridge.style.display=bridging?'block':'none';
  studioLabel.style.visibility=distance>=h*1.15?'hidden':'';
  heading.style.opacity=distance<reveal?'0':'';
  if(bridging){
   const frame=viewport.getBoundingClientRect(),matrix=studioLabel.getScreenCTM();
   const bounds=studioLabel.getBBox(),destination=heading.getBoundingClientRect();
   const type=getComputedStyle(heading),size=parseFloat(type.fontSize)/36;
   const mix=(a,b)=>a+(b-a)*morph;
   const sourceX=matrix.a*bounds.x+matrix.e-frame.left;
   const sourceY=matrix.b*bounds.x+matrix.f-frame.top;
   movingLabel.setAttribute('transform',`matrix(${mix(matrix.a,size)} ${mix(matrix.b,0)} ${mix(matrix.c,0)} ${mix(matrix.d,size)} ${mix(sourceX,destination.left-frame.left+parseFloat(type.paddingLeft))} ${mix(sourceY,baseline.getBoundingClientRect().top-frame.top)})`);
   movingLabel.style.fontWeight=`${Math.round(mix(700,parseFloat(type.fontWeight)))}`;
   movingLabel.style.letterSpacing=`${(parseFloat(type.letterSpacing)||0)/size*morph}px`;
   movingLabel.style.fill=`rgb(${mix(255,250)},${mix(255,240)},${mix(255,230)})`;
  }
  dispatchEvent(new Event('about-ground-change'));
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
 rooms.addEventListener('focusin',event=>{if(reduced.matches||!metrics||!event.target.closest('a'))return;const isShop=shop.contains(event.target),r=isShop?shop:studio;const start=isShop?metrics.shopStart:metrics.reveal,travel=isShop?metrics.shopTravel:metrics.studioTravel;const rect=event.target.getBoundingClientRect(),frame=r.querySelector('.about-room-frame').getBoundingClientRect();if(rect.left>=0&&rect.right<=innerWidth&&rect.top>=frame.top&&rect.bottom<=frame.bottom&&rooms.classList.contains('is-entered'))return;scrollTo({top:scrollY+journey.getBoundingClientRect().top+start+travel+metrics.h*.35,behavior:'instant'})});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);addEventListener('pageshow',measure);reduced.addEventListener('change',measure);
 const observer=new ResizeObserver(measure);[studio,shop].forEach(r=>observer.observe(r.querySelector('.about-service-grid')));document.fonts.ready.then(measure);measure();
})();
