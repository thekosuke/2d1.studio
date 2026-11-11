/* Shop uses the Studio gallery's native scrolling and loop geometry. */
(() => {
 const grid=document.querySelector('.shop-grid');if(!grid)return;
 const originals=[...grid.querySelectorAll('.shop-card')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 const projects=[];
 const middle=2*originals.length;
 // Repeat product previews for the same seamless loop used by Studio.
 for(let cycle=0;cycle<5;cycle++)originals.forEach((source,index)=>{
  const project=cycle===2?source:document.createElement('article');
  if(cycle!==2){project.className='shop-card';project.innerHTML=source.innerHTML}
  project.dataset.projectIndex=index;
  projects.push(project);
 });
 grid.replaceChildren(...projects);
 // The opening pass has a beginning. Reveal the wraparound only after all
 // real products have reached the center at least once.
 let loopReady=false;
 const visited=new Set();
 projects.slice(0,middle).forEach(project=>project.classList.add('is-before-first-pass'));
 let centered=null,scrollFrame=0,settleTimer=0,rebasing=false,restoreFrame=0;
 const updateCenter=()=>{
  scrollFrame=0;
  const next=projects.reduce((nearest,project,index)=>{
   if(!loopReady&&index<middle)return nearest;
   const box=project.getBoundingClientRect();
   const distance=Math.abs(box.top+box.height/2-innerHeight/2);
   return !nearest||distance<nearest.distance?{project,distance}:nearest;
  },null)?.project;
  if(next===centered)return;
  centered=next;
  visited.add(Number(centered.dataset.projectIndex));
  projects.forEach(project=>{
   const active=project===centered;
   project.classList.toggle('is-centered',active);
   project.tabIndex=active?0:-1;
   // Repeated decorative copies stay out of the accessibility tree until current.
   if(originals.includes(project)||active)project.removeAttribute('aria-hidden');
   else project.setAttribute('aria-hidden','true');
  });
 };
 const jumpTo=(project,offset=0)=>{
  rebasing=true;root.classList.add('shop-rebasing');
  cancelAnimationFrame(restoreFrame);
  const box=project.getBoundingClientRect();
  window.scrollTo({top:scrollY+box.top+box.height/2-innerHeight/2-offset,behavior:'instant'});
  updateCenter();
  // Resolve the equivalent copy before transitions/snap are enabled again.
  void grid.offsetHeight;
  restoreFrame=requestAnimationFrame(()=>{root.classList.remove('shop-rebasing');rebasing=false});
 };
 const rebase=()=>{
  clearTimeout(settleTimer);
  if(rebasing||!centered)return;
  if(!loopReady&&visited.size===originals.length){
   const box=centered.getBoundingClientRect();
   const offset=box.top+box.height/2-innerHeight/2;
   loopReady=true;
   projects.forEach(project=>project.classList.remove('is-before-first-pass'));
   // Unlock only after scrolling settles, keeping the viewed item in place.
   jumpTo(centered,offset);
   return;
  }
  const equivalent=projects[middle+Number(centered.dataset.projectIndex)];
  if(equivalent===centered)return;
  const box=centered.getBoundingClientRect();
  const hadFocus=centered.contains(document.activeElement);
  jumpTo(equivalent,box.top+box.height/2-innerHeight/2);
  if(hadFocus)equivalent.focus({preventScroll:true});
 };
 const layout=()=>{
  const current=centered||originals[0];
  const height=current.getBoundingClientRect().height;
  grid.style.setProperty('--shop-edge',`${Math.max(24,(innerHeight-height)/2)}px`);
  grid.style.setProperty('--shop-gap',`${Math.max(24,innerHeight/2-height*.8)}px`);
  jumpTo(projects[middle+Number(current.dataset.projectIndex)]);
 };
 const centerProject=project=>project.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
 addEventListener('scroll',()=>{
  if(rebasing)return;
  if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{
   updateCenter();
   const index=projects.indexOf(centered);
   if(index<originals.length||index>=projects.length-originals.length)rebase();
  });
  clearTimeout(settleTimer);settleTimer=setTimeout(rebase,180);
 },{passive:true});
 addEventListener('scrollend',rebase);
 addEventListener('resize',()=>{layout();});
 layout();
 root.classList.add('shop-scroll-gallery');

 projects.forEach(project=>{
  const preview=project.querySelector('.shop-red-pixel-preview');
  if(preview){
   const square=preview.querySelector('span');
   let spin=null,target=0;
   const stop=()=>{if(spin)spin.cancel();spin=null;target=0};
   const turn=()=>{
    if(reduced.matches)return;
    const current=parseFloat(getComputedStyle(square).rotate)||0;
    target=(spin?target:current)+180;
    if(spin)spin.cancel();
    const animation=square.animate([{rotate:`${current}deg`},{rotate:`${target}deg`}],{
     duration:(target-current)/180*720,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'
    });
    spin=animation;
    animation.onfinish=()=>{if(spin===animation)stop()};
   };
   project.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')turn()});
   project.addEventListener('focus',turn);
   reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
  }
  const link=project.querySelector('a.shop-card-link');
  if(link)link.tabIndex=-1;
  project.addEventListener('click',event=>{
   if(project!==centered){event.preventDefault();centerProject(project)}
  });
  project.addEventListener('keydown',event=>{
   const step=event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0;
   if(step){
    event.preventDefault();const index=projects.indexOf(project);
    if(!loopReady&&step<0&&index===middle)return;
    const next=projects[index+step]||projects[middle+(Number(project.dataset.projectIndex)+step+originals.length)%originals.length];
    next.focus({preventScroll:true});centerProject(next);
   }else if(event.key==='Enter'&&link){event.preventDefault();link.click()}
  });
 });
})();
