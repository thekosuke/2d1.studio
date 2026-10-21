/* Native project dialog with a shared thumbnail-to-hero image transition. */
(() => {
 const dialog=document.getElementById('work-dialog');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const content=dialog.querySelector('.work-detail-content');
 const close=dialog.querySelector('.work-close');
 const originals=[...document.querySelectorAll('.work-project')];
 const grid=document.querySelector('.work-grid');
 const root=document.documentElement;
 const toolbar=dialog.querySelector('.work-dialog-bar');
 let stopProjectMedia=()=>{};
 const setupProjectMedia=()=>{
  stopProjectMedia();
  const videos=[...content.querySelectorAll('[data-project-video]')];
  if(!videos.length){stopProjectMedia=()=>{};return}
  const events=new AbortController();
  const visible=new Set();
  const update=()=>{
   for(const video of videos){
    const source=video.querySelector('source[data-src]');
    const active=visible.has(video)&&!reduced.matches&&!document.hidden;
    video.closest('figure').classList.toggle('is-video-active',active&&!!source);
    if(!active||!source){video.pause();continue}
    if(!source.hasAttribute('src')){source.src=source.dataset.src;video.load()}
    video.muted=true;video.controls=false;
    if(video.dataset.userPaused!=='true')video.play().catch(()=>{});
   }
  };
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);
    else visible.delete(entry.target);
   }
   update();
  },{root:content,threshold:[0,.25]});
  videos.forEach(video=>observer.observe(video));
  for(const video of videos){
   const toggle=()=>{
    if(reduced.matches)return;
    const paused=!video.paused;
    video.dataset.userPaused=String(paused);
    if(paused)video.pause();else video.play().catch(()=>{});
   };
   video.addEventListener('click',toggle,{signal:events.signal});
   video.addEventListener('keydown',event=>{
    if(event.key===' '||event.key==='Enter'){event.preventDefault();if(!event.repeat)toggle()}
   },{signal:events.signal});
   const announce=()=>video.setAttribute('aria-pressed',String(!video.paused));
   video.addEventListener('play',announce,{signal:events.signal});
   video.addEventListener('pause',announce,{signal:events.signal});
  }
  document.addEventListener('visibilitychange',update,{signal:events.signal});
  reduced.addEventListener('change',update,{signal:events.signal});
  update();
  stopProjectMedia=()=>{observer.disconnect();events.abort();videos.forEach(video=>video.pause())};
 };
 const updateToolbarContrast=()=>{
  const center=toolbar.offsetHeight/2;
  const onArt=[...content.querySelectorAll('.work-detail-hero,.work-detail-image,.work-related-card>img,.work-studio-footer')].some(element=>{
   const box=element.getBoundingClientRect();
   return box.top<=center&&box.bottom>center&&element.dataset.artTone!=='light';
  });
  toolbar.classList.toggle('is-over-art',onArt);
 };
 let lastDetailScroll=0,detailDirection=0,directionDistance=0;
 const showToolbar=()=>{toolbar.classList.remove('is-scroll-hidden');toolbar.classList.toggle('is-returned',content.scrollTop>4);toolbar.inert=false};
 content.addEventListener('scroll',()=>{
  updateToolbarContrast();
  const top=Math.max(0,content.scrollTop),delta=top-lastDetailScroll;
  lastDetailScroll=top;
  if(top<=4){showToolbar();return}
  if(!delta)return;
  const direction=Math.sign(delta);
  if(direction!==detailDirection){detailDirection=direction;directionDistance=0}
  directionDistance+=Math.abs(delta);
  if(directionDistance<8)return;
  if(direction<0||toolbar.contains(document.activeElement)){showToolbar();return}
  toolbar.classList.add('is-scroll-hidden');toolbar.inert=true;
 },{passive:true});
 dialog.addEventListener('keydown',event=>{if(event.key==='Tab')showToolbar()});
 content.addEventListener('focusin',event=>{
  // Sticky footer controls must be uncovered when reached by keyboard.
  if(event.target.closest('.work-studio-footer'))content.scrollTo({top:content.scrollHeight,behavior:'instant'});
 });
 const projects=originals;
 addEventListener('resize',()=>{if(dialog.open)updateToolbarContrast()});

 let opener=null,closing=false,flight=null,animations=[],timer,transitionDone=null;
 const clearMotion=()=>{
  clearTimeout(timer);animations.forEach(animation=>animation.cancel());animations=[];
  flight?.remove();flight=null;
  dialog.querySelector('.work-transition-wash')?.remove();
  dialog.classList.remove('is-project-transition');
  content.querySelector('.work-detail-hero img')?.style.removeProperty('visibility');
  transitionDone=null;
 };
 const transitionImage=(from,to,source,returning,done)=>{
  clearMotion();
  const hero=content.querySelector('.work-detail-hero img');
  dialog.classList.add('is-project-transition');
  hero.style.visibility='hidden';
  const wash=document.createElement('div');wash.className='work-transition-wash';
  flight=document.createElement('div');flight.className='work-transition-image';flight.setAttribute('aria-hidden','true');
  const image=document.createElement('img');image.src=source;image.alt='';flight.append(image);
  dialog.append(wash,flight);
  const box=rect=>({left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
  Object.assign(flight.style,box(to));
  const duration=returning?560:720,easing='cubic-bezier(.2,.8,.2,1)';
  const moving=flight.animate([box(from),box(to)],{duration,easing,fill:'both'});
  const fading={duration:returning?260:360,delay:returning?0:260,fill:'both'};
  animations=[moving,wash.animate([{opacity:returning?1:0},{opacity:returning?0:1}],{duration,easing,fill:'both'}),
   content.animate([{opacity:returning?1:0},{opacity:returning?0:1}],fading),
   toolbar.animate([{opacity:returning?1:0},{opacity:returning?0:1}],fading)];
  let finished=false;
  transitionDone=()=>{if(finished)return;finished=true;clearMotion();done()};
  moving.onfinish=transitionDone;
  timer=setTimeout(()=>transitionDone?.(),duration+100);
 };
 const renderProject=project=>{
  dialog.dataset.project=project.id;
  showToolbar();lastDetailScroll=0;detailDirection=0;directionDistance=0;
  toolbar.classList.toggle('is-over-art',project.querySelector('.work-detail-hero')?.dataset.artTone!=='light');toolbar.classList.remove('is-returned');
  content.replaceChildren(project.querySelector('.work-project-content').cloneNode(true));
  dialog.querySelector('.work-breadcrumb-slot').replaceChildren(content.querySelector('.work-trail').cloneNode(true));
  const title=content.querySelector('.work-detail-title');title.id='work-dialog-title';title.tabIndex=-1;
  const hero=content.querySelector('.work-detail-hero img');
  const thumbnail=project.querySelector('summary>img');
  // Use the same artwork on both sides of the handoff, then sharpen in place.
  hero.src=thumbnail.currentSrc||thumbnail.src;hero.removeAttribute('srcset');
  hero.width=thumbnail.width;hero.height=thumbnail.height;hero.alt=thumbnail.alt;
  hero.loading='eager';
  hero.dataset.heroSrcset=thumbnail.getAttribute('srcset')||'';
  content.scrollTop=0;
  title.focus({preventScroll:true});
  setupProjectMedia();
 };
 content.addEventListener('click',event=>{
  const link=event.target.closest('a[data-work-target]');
  if(!link)return;
  const project=originals.find(project=>project.id===link.dataset.workTarget);
  if(!project)return;
  event.preventDefault();
  if(closing||flight)return;
  opener=project.querySelector('summary');
  renderProject(project);
  const hero=content.querySelector('.work-detail-hero img');hero.sizes='100vw';hero.srcset=hero.dataset.heroSrcset;
 });
 const finishClose=()=>{if(dialog.open)dialog.close()};
 const dismiss=()=>{
  if(!dialog.open||closing)return;
  closing=true;
  if(reduced.matches){clearMotion();finishClose();return}
  const currentHero=content.querySelector('.work-detail-hero img');
  const source=flight?.querySelector('img').src||currentHero.currentSrc||currentHero.src;
  const from=flight?.getBoundingClientRect();
  clearMotion();
  // The carousel may have looped, or the user may have followed a related project.
  dispatchEvent(new CustomEvent('work-gallery-return',{detail:opener.closest('.work-project')}));
  content.scrollTop=0;showToolbar();
  const hero=content.querySelector('.work-detail-hero img');
  const target=opener.querySelector('img').getBoundingClientRect();
  if(!target.width||!target.height){finishClose();return}
  transitionImage(from||hero.getBoundingClientRect(),target,source,true,finishClose);
 };
 projects.forEach(project=>{
  const trigger=project.querySelector('summary');
  trigger.addEventListener('keydown',event=>{
   const step=event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0;
   if(!step)return;event.preventDefault();
   const next=projects[Math.max(0,Math.min(projects.length-1,projects.indexOf(project)+step))];
   next.querySelector('summary').focus();
  });
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','work-dialog');
  trigger.addEventListener('click',event=>{
   event.preventDefault();
   if(dialog.open)return;
   opener=trigger;closing=false;clearMotion();
   dispatchEvent(new Event('work-gallery-pause'));
   const thumbnail=grid.querySelector('.is-gallery-current>summary>img')||trigger.querySelector('img');
   const from=thumbnail.getBoundingClientRect(),source=thumbnail.currentSrc||thumbnail.src;
   renderProject(project);
   dialog.showModal();root.classList.add('has-dialog');content.scrollTop=0;
   const hero=content.querySelector('.work-detail-hero img');
   const sharpen=()=>{hero.sizes='100vw';hero.srcset=hero.dataset.heroSrcset;updateToolbarContrast()};
   if(!reduced.matches&&from.width&&from.height)transitionImage(from,hero.getBoundingClientRect(),source,false,sharpen);
   else sharpen();
   content.querySelector('.work-detail-title').focus({preventScroll:true});
  });
 });
 close.addEventListener('click',dismiss);
 dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss()});
 dialog.addEventListener('close',()=>{
  stopProjectMedia();
  clearMotion();closing=false;root.classList.remove('has-dialog');
  opener?.focus({preventScroll:true});opener=null;content.replaceChildren();
 });
 // Resize or a preference change settles the current handoff without stale geometry.
 const settleTransition=()=>transitionDone?.();
 addEventListener('resize',settleTransition);
 reduced.addEventListener('change',()=>{if(reduced.matches)settleTransition()});
})();
