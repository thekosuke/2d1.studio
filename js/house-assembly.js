/* Assemble the toy house, dissolve into its flat-on rooms, then slide Shop in
   from the left. Native scrolling supplies reading travel for long copy. */
(() => {
 const journey=document.querySelector('.house-journey');if(!journey)return;
 const viewport=journey.querySelector('.house-viewport'),panel=journey.querySelector('.design-house');
 const pieces=[...panel.querySelectorAll('[data-house-piece]')],rooms=journey.querySelector('.about-services');
 const [studio,shop]=rooms.children,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 const placements=[{x:-100,y:10,angle:-12,start:0,duration:.55},{x:110,y:50,angle:12,start:.15,duration:.55},{x:20,y:-90,angle:-6,start:.4,duration:.6}];
 let queued=false,metrics,assembled=false;
 function measure(){
  journey.classList.toggle('has-room-journey',!reduced.matches);
  if(reduced.matches){journey.style.height='';panel.style.opacity='';rooms.style.cssText='';rooms.classList.remove('is-entered');pieces.forEach(p=>p.removeAttribute('transform'));[studio,shop].forEach(r=>r.style.cssText='');journey.style.removeProperty('--flat-room-left');dispatchEvent(new Event('about-ground-change'));return}
  const w=document.documentElement.clientWidth,h=viewport.clientHeight;
  const social=document.querySelector('.site-footer .social-links');
  const edge=w>=1100?social.getBoundingClientRect().left:24;
  journey.style.setProperty('--flat-room-left',`${Math.max(9,edge-(w<768?12:w*.15)-3)}px`);
  const travel=r=>Math.max(0,r.querySelector('.about-service-grid').offsetHeight-r.querySelector('.about-room-frame').clientHeight);
  const studioTravel=travel(studio),shopTravel=travel(shop),reveal=h*1.65,cross=reveal+studioTravel+h*1.25,shopStart=cross+h*1.25;
  metrics={h,studioTravel,shopTravel,reveal,cross,shopStart};journey.style.height=`${shopStart+shopTravel+h*2.1}px`;schedule();
 }
 function paint(){queued=false;if(reduced.matches||!metrics)return;
  const {h,studioTravel,shopTravel,reveal,cross,shopStart}=metrics,distance=-journey.getBoundingClientRect().top;
  const entrance=clamp((distance+h*.42)/(h*1.02));assembled ||= entrance===1;
  pieces.forEach((piece,i)=>{const p=placements[i],remain=1-ease(((assembled?1:entrance)-p.start)/p.duration);if(!remain)piece.removeAttribute('transform');else piece.setAttribute('transform',`translate(${p.x*remain} ${p.y*remain}) rotate(${p.angle*remain} ${piece.dataset.pivot})`)});
  const appear=ease((distance-h*1.15)/(h*.5));panel.style.opacity=1-appear;rooms.style.setProperty('--rooms-opacity',appear);rooms.classList.toggle('is-entered',appear>.95);
  const across=ease((distance-cross)/(h*1.25));studio.style.setProperty('--flat-room-x',`${across*100}%`);shop.style.setProperty('--flat-room-x',`${(across-1)*100}%`);
  studio.style.setProperty('--room-y',`${-Math.min(studioTravel,Math.max(0,distance-reveal-h*.35))}px`);shop.style.setProperty('--room-y',`${-Math.min(shopTravel,Math.max(0,distance-shopStart-h*.35))}px`);
  dispatchEvent(new Event('about-ground-change'));
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
 rooms.addEventListener('focusin',event=>{if(reduced.matches||!metrics||!event.target.closest('a'))return;const isShop=shop.contains(event.target),r=isShop?shop:studio;const start=isShop?metrics.shopStart:metrics.reveal,travel=isShop?metrics.shopTravel:metrics.studioTravel;const rect=event.target.getBoundingClientRect(),frame=r.querySelector('.about-room-frame').getBoundingClientRect();if(rect.left>=0&&rect.right<=innerWidth&&rect.top>=frame.top&&rect.bottom<=frame.bottom&&rooms.classList.contains('is-entered'))return;scrollTo({top:scrollY+journey.getBoundingClientRect().top+start+travel+metrics.h*.35,behavior:'instant'})});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);addEventListener('pageshow',measure);reduced.addEventListener('change',measure);
 const observer=new ResizeObserver(measure);[studio,shop].forEach(r=>observer.observe(r.querySelector('.about-service-grid')));document.fonts.ready.then(measure);measure();
})();
