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
  const svg=figure.querySelector('.av-type'),button=figure.querySelector('.type-motion-toggle');
  svg.removeAttribute('data-motion-static');
  const events=new AbortController();
  let visible=false,paused=false;
  const update=()=>{
   svg.style.setProperty('--type-play-state',visible&&!paused&&!reduced.matches&&!document.hidden?'running':'paused');
   button.hidden=reduced.matches;
   button.setAttribute('aria-pressed',String(paused));
   const japanese=document.documentElement.lang==='ja';
   button.setAttribute('aria-label',paused?(japanese?'文字のアニメーションを再生':'Play typography animation'):(japanese?'文字のアニメーションを一時停止':'Pause typography animation'));
   button.firstElementChild.textContent=paused?'▶':'Ⅱ';
  };
  const observer=new IntersectionObserver(entries=>{
   visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.25;update();
  },{root:content,threshold:[0,.25]});
  observer.observe(figure);
  button.addEventListener('click',()=>{paused=!paused;update()},{signal:events.signal});
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
 const projects=[];
 const middle=2*originals.length;
 // Keep real detail content only once; repeated rows contain lightweight previews.
 for(let cycle=0;cycle<5;cycle++)originals.forEach((source,index)=>{
  const project=cycle===2?source:document.createElement('details');
  if(cycle!==2){project.className='work-project';project.append(source.querySelector('summary').cloneNode(true))}
  project.dataset.projectIndex=index;
  projects.push(project);
 });
 grid.replaceChildren(...projects);
 // The opening pass has a beginning. Reveal the wraparound only after all
 // three real projects have reached the center at least once.
 let loopReady=false;
 const visited=new Set();
 projects.slice(0,middle).forEach(project=>project.classList.add('is-before-first-pass'));
 let centered=null,scrollFrame=0,settleTimer=0,rebasing=false,restoreFrame=0;
 const updateCenter=()=>{
  scrollFrame=0;
  const next=projects.reduce((nearest,project,index)=>{
   if(!loopReady&&index<middle)return nearest;
   const box=project.querySelector('summary').getBoundingClientRect();
   const distance=Math.abs(box.top+box.height/2-innerHeight/2);
   return !nearest||distance<nearest.distance?{project,distance}:nearest;
  },null)?.project;
  if(next===centered)return;
  centered=next;
  visited.add(Number(centered.dataset.projectIndex));
  if(!loopReady&&visited.size===originals.length){
   loopReady=true;
   projects.forEach(project=>project.classList.remove('is-before-first-pass'));
  }
  projects.forEach(project=>{
   const active=project===centered;
   project.classList.toggle('is-centered',active);
   project.querySelector('summary').tabIndex=active?0:-1;
   // Repeated decorative copies stay out of the accessibility tree until current.
   if(originals.includes(project)||active)project.removeAttribute('aria-hidden');
   else project.setAttribute('aria-hidden','true');
  });
 };
 const jumpTo=(project,offset=0)=>{
  rebasing=true;root.classList.add('work-rebasing');
  cancelAnimationFrame(restoreFrame);
  const box=project.querySelector('summary').getBoundingClientRect();
  window.scrollTo({top:scrollY+box.top+box.height/2-innerHeight/2-offset,behavior:'instant'});
  updateCenter();
  // Resolve the equivalent copy before transitions/snap are enabled again.
  void grid.offsetHeight;
  restoreFrame=requestAnimationFrame(()=>{root.classList.remove('work-rebasing');rebasing=false});
 };
 const rebase=()=>{
  clearTimeout(settleTimer);
  if(rebasing||dialog.open||!centered)return;
  const equivalent=projects[middle+Number(centered.dataset.projectIndex)];
  if(equivalent===centered)return;
  const box=centered.querySelector('summary').getBoundingClientRect();
  const hadFocus=centered.contains(document.activeElement);
  jumpTo(equivalent,box.top+box.height/2-innerHeight/2);
  if(hadFocus)equivalent.querySelector('summary').focus({preventScroll:true});
 };
 const layout=()=>{
  const current=centered||originals[0];
  const height=current.querySelector('summary').getBoundingClientRect().height;
  grid.style.setProperty('--work-edge',`${Math.max(24,(innerHeight-height)/2)}px`);
  grid.style.setProperty('--work-gap',`${Math.max(24,innerHeight/2-height*.8)}px`);
  jumpTo(projects[middle+Number(current.dataset.projectIndex)]);
 };
 const centerProject=project=>project.querySelector('summary').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
 addEventListener('scroll',()=>{
  if(rebasing||dialog.open)return;
  if(!loopReady){
   const first=originals[0].querySelector('summary').getBoundingClientRect();
   if(first.top+first.height/2>innerHeight/2+1){jumpTo(originals[0]);return}
  }
  if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{
   updateCenter();
   const index=projects.indexOf(centered);
   if(index<originals.length||index>=projects.length-originals.length)rebase();
  });
  clearTimeout(settleTimer);settleTimer=setTimeout(rebase,180);
 },{passive:true});
 addEventListener('scrollend',rebase);
 addEventListener('resize',()=>{layout();if(dialog.open)updateToolbarContrast()});
 layout();
 root.classList.add('work-scroll-gallery');

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
  jumpTo(project);
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
   const index=projects.indexOf(project);
   if(!loopReady&&step<0&&index===middle)return;
   const next=projects[index+step]||projects[middle+(Number(project.dataset.projectIndex)+step+originals.length)%originals.length];
   next.querySelector('summary').focus({preventScroll:true});centerProject(next);
  });
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','work-dialog');
  trigger.addEventListener('click',event=>{
   event.preventDefault();
   if(dialog.open)return;
   if(project!==centered){centerProject(project);return}
   opener=trigger;closing=false;motion?.cancel();
   renderProject(originals[Number(project.dataset.projectIndex)]);
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
  opener?.focus({preventScroll:true});opener=null;content.replaceChildren();rebase();
 });
 reduced.addEventListener('change',()=>{if(reduced.matches){motion?.cancel();if(closing)finishClose()}});
})();
