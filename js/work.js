/* Native modal semantics, with a bottom-up entrance and its exact reverse. */
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
 let stopTypeStudy=()=>{};
 const setupTypeStudy=()=>{
  stopTypeStudy();
  const figure=content.querySelector('[data-type-study]');
  if(!figure){stopTypeStudy=()=>{};return}
  const svg=figure.querySelector('.av-type');
  svg.removeAttribute('data-motion-static');
  const events=new AbortController();
  let visible=false;
  const update=()=>{
   svg.style.setProperty('--type-play-state',visible&&!reduced.matches&&!document.hidden?'running':'paused');

  };
  const observer=new IntersectionObserver(entries=>{
   visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.25;update();
  },{root:content,threshold:[0,.25]});
  observer.observe(figure);
  document.addEventListener('visibilitychange',update,{signal:events.signal});
  reduced.addEventListener('change',update,{signal:events.signal});
  update();
  stopTypeStudy=()=>{observer.disconnect();events.abort();svg.style.setProperty('--type-play-state','paused')};
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

 let opener=null,motion=null,closing=false,timer;
 const renderProject=project=>{
  showToolbar();lastDetailScroll=0;detailDirection=0;directionDistance=0;
  toolbar.classList.toggle('is-over-art',project.querySelector('.work-detail-hero')?.dataset.artTone!=='light');toolbar.classList.remove('is-returned');
  content.replaceChildren(project.querySelector('.work-project-content').cloneNode(true));
  dialog.querySelector('.work-breadcrumb-slot').replaceChildren(content.querySelector('.work-trail').cloneNode(true));
  const title=content.querySelector('.work-detail-title');title.id='work-dialog-title';title.tabIndex=-1;
  content.querySelector('img').loading='eager';
  content.scrollTop=0;
  title.focus({preventScroll:true});
  setupTypeStudy();
 };
 content.addEventListener('click',event=>{
  const link=event.target.closest('a[data-work-target]');
  if(!link)return;
  const project=originals.find(project=>project.id===link.dataset.workTarget);
  if(!project)return;
  event.preventDefault();
  opener=project.querySelector('summary');
  renderProject(project);
 });
 const finishClose=()=>{if(dialog.open)dialog.close()};
 const dismiss=()=>{
  if(!dialog.open||closing)return;
  closing=true;
  if(reduced.matches){finishClose();return}
  const pose=getComputedStyle(dialog).transform;
  motion?.cancel();
  motion=dialog.animate([{transform:pose==='none'?'translateY(0)':pose},{transform:'translateY(100%)'}],{duration:620,easing:'cubic-bezier(.8,0,.8,.2)',fill:'both'});
  motion.onfinish=finishClose;timer=setTimeout(finishClose,700);
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
   opener=trigger;closing=false;motion?.cancel();
   renderProject(project);
   dialog.showModal();document.documentElement.classList.add('has-dialog');content.scrollTop=0;
   if(!reduced.matches){
    motion=dialog.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
    motion.onfinish=()=>{if(!closing){motion.cancel();motion=null}};
   }
   content.querySelector('.work-detail-title').focus({preventScroll:true});
  });
 });
 close.addEventListener('click',dismiss);
 dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss()});
 dialog.addEventListener('close',()=>{
  stopTypeStudy();
  clearTimeout(timer);motion?.cancel();motion=null;closing=false;document.documentElement.classList.remove('has-dialog');
  opener?.focus({preventScroll:true});opener=null;content.replaceChildren();
 });
 reduced.addEventListener('change',()=>{if(reduced.matches){motion?.cancel();if(closing)finishClose()}});
})();
