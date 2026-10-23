/* Match the former About cover: hold the completed intro at 60vh while
   the following house rises over it at native scroll speed. */
(() => {
 const scene=document.querySelector('.home-house-scene');if(!scene)return;
 const lead=scene.querySelector('.home-house-lead'),copy=lead.querySelector('h1');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let queued=false;
 function measure(){
  queued=false;
  if(reduced.matches){scene.classList.remove('has-house-cover');return;}
  const bottom=copy.getBoundingClientRect().bottom-lead.getBoundingClientRect().top;
  const trailing=lead.offsetHeight-bottom;
  scene.style.setProperty('--house-lead-top',`${innerHeight*.6-bottom}px`);
  scene.style.setProperty('--house-cover-gap',`${Math.max(64,innerHeight*.4-trailing)}px`);
  scene.classList.add('has-house-cover');
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(measure)}}
 // Bring covered intro links back into view when keyboard users return to them.
 lead.addEventListener('focusin',event=>{
  if(reduced.matches)return;
  const target=event.target.getBoundingClientRect();
  if(scene.querySelector('.house-journey').getBoundingClientRect().top>=target.bottom)return;
  const localBottom=target.bottom-lead.getBoundingClientRect().top;
  window.scrollTo({top:Math.max(0,scrollY+scene.getBoundingClientRect().top+localBottom-innerHeight+100),behavior:'instant'});
 });
 addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 new ResizeObserver(schedule).observe(lead);document.fonts.ready.then(schedule);schedule();
})();

/* Pin only the house assembly and Studio handoff. Home’s Studio and Shop
   then follow ordinary document scrolling, with no section translation. */
(() => {
 const journey=document.querySelector('.house-journey');if(!journey)return;
 const animation=journey.querySelector('.house-animation');
 const viewport=journey.querySelector('.house-viewport'),panel=journey.querySelector('.design-house');
 const diagram=panel.querySelector('.design-house-diagram'),homeViewBox=diagram.getAttribute('viewBox');
 const studioLabel=panel.querySelector('.house-room-label');
 const pieces=[...panel.querySelectorAll('[data-house-piece]')],rooms=journey.querySelector('.house-destination');
 const studio=rooms.firstElementChild,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Keep one visible label across the diagram/HTML handoff. The overlay is
 // decorative; #studio-label remains the semantic heading throughout.
 const heading=studio.querySelector('#studio-label');
 const bridge=document.createElementNS('http://www.w3.org/2000/svg','svg');
 bridge.classList.add('house-title-bridge');bridge.setAttribute('aria-hidden','true');
 const movingLabel=studioLabel.cloneNode(true);
 movingLabel.removeAttribute('transform');movingLabel.setAttribute('text-anchor','start');
 movingLabel.textContent=heading.textContent;bridge.append(movingLabel);document.body.append(bridge);
 const baseline=document.createElement('span');baseline.className='house-title-baseline';
 baseline.setAttribute('aria-hidden','true');heading.append(baseline);
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 const placements=[{x:-100,y:10,angle:-12,start:0,duration:.55},{x:110,y:50,angle:12,start:.15,duration:.55},{x:20,y:-90,angle:-6,start:.4,duration:.6}];
 let queued=false,metrics;
 function measure(){
  journey.classList.toggle('has-room-journey',!reduced.matches);
  if(reduced.matches){diagram.setAttribute('viewBox',homeViewBox);studioLabel.style.opacity='';studioLabel.style.visibility='';heading.style.opacity='';bridge.style.display='none';animation.style.height='';panel.style.opacity='';rooms.style.cssText='';rooms.classList.remove('is-entered');pieces.forEach(p=>p.removeAttribute('transform'));heading.style.removeProperty('--house-heading-decoration');paintChrome();return}
  const h=viewport.clientHeight;
  const reveal=h*2.15;
  metrics={h,reveal};animation.style.height=`${reveal+h}px`;schedule();
 }
 function paint(){queued=false;if(reduced.matches||!metrics){paintChrome();return;}
  const {h,reveal}=metrics,distance=-journey.getBoundingClientRect().top;
  const entrance=clamp((distance+h*.42)/(h*1.02));
  pieces.forEach((piece,i)=>{const p=placements[i],remain=1-ease((entrance-p.start)/p.duration);if(!remain)piece.removeAttribute('transform');else piece.setAttribute('transform',`translate(${p.x*remain} ${p.y*remain}) rotate(${p.angle*remain} ${piece.dataset.pivot})`)});
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
  const handoff=ease((distance-h*2.05)/(h*.1));
  heading.style.opacity=distance<reveal?`${handoff}`:'';
  bridge.style.opacity=1-handoff;
  heading.style.setProperty('--house-heading-decoration',appear);
  if(bridging){
   const frame=viewport.getBoundingClientRect(),matrix=studioLabel.getScreenCTM();
   const bounds=studioLabel.getBBox();
   const type=getComputedStyle(heading),size=parseFloat(type.fontSize)/36;
   const textRange=document.createRange();textRange.selectNodeContents(heading.firstChild);
   const textLeft=textRange.getBoundingClientRect().left;
   const mix=(a,b)=>a+(b-a)*morph;
   const sourceX=matrix.a*bounds.x+matrix.e-frame.left;
   const sourceY=matrix.b*bounds.x+matrix.f-frame.top;
   movingLabel.setAttribute('transform',`matrix(${mix(matrix.a,size)} ${mix(matrix.b,0)} ${mix(matrix.c,0)} ${mix(matrix.d,size)} ${mix(sourceX,textLeft-frame.left)} ${mix(sourceY,baseline.getBoundingClientRect().top-frame.top)})`);
   movingLabel.style.fontWeight=`${Math.round(mix(700,parseFloat(type.fontWeight)))}`;
   movingLabel.style.letterSpacing=`${(parseFloat(type.letterSpacing)||0)/size*morph}px`;
   movingLabel.style.fill='var(--beige)';
  }
  paintChrome();
 }
 function paintChrome(){
  const ground=journey.getBoundingClientRect();
  const over=element=>{const r=element.getBoundingClientRect();return ground.top<=r.top+r.height/2&&ground.bottom>r.top+r.height/2};
  document.querySelectorAll('.page-nav a,.mobile-nav-toggle,body > .language-switch').forEach(el=>el.classList.toggle('is-on-house',over(el)));
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);addEventListener('pageshow',measure);reduced.addEventListener('change',measure);
 const observer=new ResizeObserver(measure);observer.observe(viewport);document.fonts.ready.then(measure);measure();
})();
