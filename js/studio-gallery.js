/* Studio uses the former Shop gallery's native scrolling and loop geometry. */
(() => {
 const grid=document.querySelector('.work-grid');if(!grid)return;
 const originals=[...grid.querySelectorAll(':scope > .work-project')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 const projects=[];
 const originalCycle=2;
 const middle=originalCycle*originals.length;
 // Repeat summaries only; the three original project stories stay intact.
 for(let cycle=0;cycle<5;cycle++)originals.forEach((source,index)=>{
  const project=cycle===originalCycle?source:document.createElement('details');
  if(cycle!==originalCycle){project.className='work-project';project.append(source.querySelector('summary').cloneNode(true))}
  project.dataset.projectIndex=index;
  projects.push(project);
 });
 grid.replaceChildren(...projects);
 let paused=false,forwarding=false;
 let centered=null,scrollFrame=0,settleTimer=0,rebasing=false,restoreFrame=0;
 const updateCenter=()=>{
  scrollFrame=0;
  const next=projects.reduce((nearest,project,index)=>{
   const box=project.getBoundingClientRect();
   const distance=Math.abs(box.top+box.height/2-innerHeight/2);
   return !nearest||distance<nearest.distance?{project,distance}:nearest;
  },null)?.project;
  if(next===centered)return;
  centered=next;
  projects.forEach(project=>{
   const active=project===centered;
   project.classList.toggle('is-gallery-current',active);
   project.querySelector('summary').tabIndex=active?0:-1;
   // Repeated decorative copies stay out of the accessibility tree until current.
   if(originals.includes(project)||active)project.removeAttribute('aria-hidden');
   else project.setAttribute('aria-hidden','true');
  });
 };
 const jumpTo=(project,offset=0)=>{
  rebasing=true;root.classList.add('work-rebasing');
  cancelAnimationFrame(restoreFrame);
  const box=project.getBoundingClientRect();
  window.scrollTo({top:scrollY+box.top+box.height/2-innerHeight/2-offset,behavior:'instant'});
  updateCenter();
  // Resolve the equivalent copy before transitions/snap are enabled again.
  void grid.offsetHeight;
  restoreFrame=requestAnimationFrame(()=>{root.classList.remove('work-rebasing');rebasing=false});
 };
 const rebase=()=>{
  clearTimeout(settleTimer);
  if(paused||rebasing||!centered)return;
  const equivalent=projects[middle+Number(centered.dataset.projectIndex)];
  if(equivalent===centered)return;
  const box=centered.getBoundingClientRect();
  const hadFocus=centered.contains(document.activeElement);
  jumpTo(equivalent,box.top+box.height/2-innerHeight/2);
  if(hadFocus)equivalent.querySelector('summary').focus({preventScroll:true});
 };
 const layout=()=>{
  const social=[...document.querySelectorAll('.site-footer .social-links')].find(element=>element.getBoundingClientRect().width);
  if(social)grid.parentElement.style.marginLeft=`${social.getBoundingClientRect().left}px`;
  const left=grid.getBoundingClientRect().left;
  const logo=document.querySelector('.about-docked-logo')?.getBoundingClientRect();
  const center=logo?.width?logo.left+logo.width/2:innerWidth/2;
  grid.style.setProperty('--work-thumbnail-width',`${Math.max(1,2*(center-left))}px`);
  const current=centered||originals[0];
  const height=current.getBoundingClientRect().height;
  grid.style.setProperty('--work-edge',`${Math.max(24,(innerHeight-height)/2)}px`);
  grid.style.setProperty('--work-gap',`${Math.max(24,innerHeight/2-height*.8)}px`);
  jumpTo(projects[middle+Number(current.dataset.projectIndex)]);
 };
 const centerProject=project=>project.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
 addEventListener('scroll',()=>{
  if(paused||rebasing)return;
  if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{
   updateCenter();
   const index=projects.indexOf(centered);
   if(index<originals.length||index>=projects.length-originals.length)rebase();
  });
  clearTimeout(settleTimer);settleTimer=setTimeout(rebase,180);
 },{passive:true});
 addEventListener('scrollend',rebase);
 addEventListener('resize',()=>{if(!paused)layout();});
 layout();
 root.classList.add('work-scroll-gallery');

 // Preserve the thumbnail-to-story transition and return to the same project.
 addEventListener('work-gallery-pause',()=>{paused=true;clearTimeout(settleTimer)});
 addEventListener('work-gallery-return',event=>jumpTo(event.detail));
 document.getElementById('work-dialog')?.addEventListener('close',()=>{paused=false;layout()});
 grid.addEventListener('click',event=>{
  const summary=event.target.closest('summary');if(!summary||forwarding)return;
  const project=summary.parentElement;
  if(!projects.includes(project))return;
  if(project!==centered){event.preventDefault();event.stopImmediatePropagation();centerProject(project);return}
  if(!originals.includes(project)){
   event.preventDefault();event.stopImmediatePropagation();forwarding=true;
   originals[Number(project.dataset.projectIndex)].querySelector('summary').click();forwarding=false;
  }
 },true);
 grid.addEventListener('keydown',event=>{
  const summary=event.target.closest('summary');if(!summary)return;
  const step=event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0;if(!step)return;
  event.preventDefault();event.stopImmediatePropagation();
  const index=projects.indexOf(summary.parentElement);
  const next=projects[Math.max(0,Math.min(projects.length-1,index+step))];
  next.querySelector('summary').focus({preventScroll:true});centerProject(next);
 },true);
})();
