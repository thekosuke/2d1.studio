/* Inline project galleries: native touch scrolling, restrained directional slides. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('.work-project').forEach(project=>{
  const track=project.querySelector('.work-carousel');
  const slides=[...track.querySelectorAll('.work-slide')];
  const previous=project.querySelector('.work-previous');
  const next=project.querySelector('.work-next');
  const status=project.querySelector('.work-position');
  let current=0,frame=0,drag=null;
  const offset=i=>slides[i].offsetLeft-slides[0].offsetLeft;
  const update=()=>{
   frame=0;
   const nearest=slides.reduce((best,_,i)=>Math.abs(offset(i)-track.scrollLeft)<Math.abs(offset(best)-track.scrollLeft)?i:best,0);
   current=nearest;
   slides.forEach((slide,i)=>{slide.classList.toggle('is-current',i===current);slide.classList.toggle('is-past',i<current)});
   previous.disabled=current===0;next.disabled=current===slides.length-1;
   status.textContent=`${current+1} / ${slides.length}`;
  };
  const go=i=>track.scrollTo({left:offset(Math.max(0,Math.min(slides.length-1,i))),behavior:reduced.matches?'instant':'smooth'});
  previous.addEventListener('click',()=>go(current-1));
  next.addEventListener('click',()=>go(current+1));
  track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});
  track.addEventListener('keydown',e=>{
   const destinations={ArrowLeft:current-1,ArrowRight:current+1,Home:0,End:slides.length-1};
   if(e.key in destinations){e.preventDefault();go(destinations[e.key])}
  });
  track.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='mouse'||e.button!==0)return;
   drag={x:e.clientX,left:track.scrollLeft};track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove',e=>{if(drag)track.scrollLeft=drag.left+drag.x-e.clientX});
  const release=()=>{if(!drag)return;drag=null;track.classList.remove('is-dragging');update();go(current)};
  track.addEventListener('pointerup',release);track.addEventListener('pointercancel',release);
  new ResizeObserver(()=>{track.scrollTo({left:offset(current),behavior:'instant'});update()}).observe(track);
  update();
 });
})();
