/* Pin only the house assembly and Studio handoff. Both editorial sections
   then follow ordinary document scrolling, with no section translation. */
(() => {
 const journey=document.querySelector('.house-journey');if(!journey)return;
 const animation=journey.querySelector('.house-animation');
 const viewport=journey.querySelector('.house-viewport'),panel=journey.querySelector('.design-house');
 const diagram=panel.querySelector('.design-house-diagram'),homeViewBox=diagram.getAttribute('viewBox');
 const studioLabel=panel.querySelector('.house-room-label');
 const pieces=[...panel.querySelectorAll('[data-house-piece]')],rooms=journey.querySelector('.about-services');
 const studio=rooms.firstElementChild,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Keep one visible label across the diagram/HTML handoff. The overlay is
 // decorative; #about-studio remains the semantic heading throughout.
 const heading=studio.querySelector('#about-studio');
 const bridge=document.createElementNS('http://www.w3.org/2000/svg','svg');
 bridge.classList.add('house-title-bridge');bridge.setAttribute('aria-hidden','true');
 const movingLabel=studioLabel.cloneNode(true);
 movingLabel.removeAttribute('transform');movingLabel.setAttribute('text-anchor','start');
 movingLabel.textContent=heading.textContent;bridge.append(movingLabel);journey.append(bridge);
 const baseline=document.createElement('span');baseline.className='house-title-baseline';
 baseline.setAttribute('aria-hidden','true');heading.append(baseline);
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 const placements=[{x:-100,y:10,angle:-12,start:0,duration:.55},{x:110,y:50,angle:12,start:.15,duration:.55},{x:20,y:-90,angle:-6,start:.4,duration:.6}];
 let queued=false,metrics,assembled=false;
 function measure(){
  journey.classList.toggle('has-room-journey',!reduced.matches);
  if(reduced.matches){diagram.setAttribute('viewBox',homeViewBox);studioLabel.style.opacity='';studioLabel.style.visibility='';heading.style.opacity='';bridge.style.display='none';animation.style.height='';panel.style.opacity='';rooms.style.cssText='';rooms.classList.remove('is-entered');pieces.forEach(p=>p.removeAttribute('transform'));document.body.style.removeProperty('--editorial-copy-left');dispatchEvent(new Event('about-ground-change'));return}
  const w=document.documentElement.clientWidth,h=viewport.clientHeight;
  const social=document.querySelector('.site-footer .social-links');
  const edge=w>=1100?social.getBoundingClientRect().left:24;
  document.body.style.setProperty('--editorial-copy-left',`${edge}px`);
  const reveal=h*2.15;
  metrics={h,reveal};animation.style.height=`${reveal+h}px`;schedule();
 }
 function paint(){queued=false;if(reduced.matches||!metrics)return;
  const {h,reveal}=metrics,distance=-journey.getBoundingClientRect().top;
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
   movingLabel.style.fill=`rgb(${mix(255,128)},${mix(255,117)},${mix(255,115)})`;
  }
  dispatchEvent(new Event('about-ground-change'));
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);addEventListener('pageshow',measure);reduced.addEventListener('change',measure);
 const observer=new ResizeObserver(measure);observer.observe(viewport);document.fonts.ready.then(measure);measure();
})();
