/* Native horizontal browsing; clones provide a continuous loop. */
(() => {
 const grid=document.querySelector('.work-grid');if(!grid)return;
 const originals=[...grid.children], reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const alignThumbnail=()=>{
  const main=grid.closest('.work-main');
  const socials=document.querySelector('body > .site-footer .social-links');
  if(innerWidth>=1100&&socials){
   const left=socials.getBoundingClientRect().left;
   main.style.setProperty('--studio-square',`${Math.max(1,innerWidth-2*left)}px`);
  }else main.style.removeProperty('--studio-square');
 };

 const cards=[];
 for(let cycle=0;cycle<3;cycle++) originals.forEach((source,index)=>{
  const card=cycle===1?source:document.createElement('details');
  if(cycle!==1){card.className='work-project';card.append(source.querySelector('summary').cloneNode(true));card.setAttribute('aria-hidden','true')}
  card.dataset.galleryIndex=index;cards.push(card);
 });
 grid.replaceChildren(...cards);
 let current=originals[0],frame=0,timer,gestureTimer,gesturing=false,suppressClick=false;
 const center=(card,behavior='smooth')=>grid.scrollTo({left:card.offsetLeft+card.offsetWidth/2-grid.clientWidth/2,behavior:reduced.matches?'instant':behavior});
 const update=()=>{
  frame=0;
  const middle=grid.getBoundingClientRect().left+grid.clientWidth/2;
  current=cards.reduce((best,card)=>Math.abs(card.getBoundingClientRect().left+card.offsetWidth/2-middle)<Math.abs(best.getBoundingClientRect().left+best.offsetWidth/2-middle)?card:best,current);
  cards.forEach(card=>{const active=card===current;card.classList.toggle('is-gallery-current',active);card.querySelector('summary').tabIndex=active?0:-1;card.style.visibility=''});
 };
 const settle=()=>{
  if(gesturing)return;
  update();const real=originals[Number(current.dataset.galleryIndex)];
  if(current!==real){grid.classList.add('is-rebasing');center(real,'instant');update();requestAnimationFrame(()=>grid.classList.remove('is-rebasing'))}
 };
 grid.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);clearTimeout(timer);timer=setTimeout(settle,180)},{passive:true});
 grid.addEventListener('click',event=>{
  if(suppressClick){event.preventDefault();event.stopImmediatePropagation();return}
  const card=event.target.closest('.work-project');if(!card)return;
  if(card!==current){event.preventDefault();event.stopImmediatePropagation();center(card);return}
  if(!originals.includes(card)){event.preventDefault();event.stopImmediatePropagation();originals[Number(card.dataset.galleryIndex)].querySelector('summary').click()}
 },true);
 grid.addEventListener('keydown',event=>{
  const step=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;if(!step)return;
  event.preventDefault();event.stopPropagation();const next=cards[cards.indexOf(current)+step];if(next)center(next);
 },true);
 let motionFrame=0,lastMotionTime=0,gestureOrigin=0,gestureCard=null,targetLeft=0,easedLeft=0,releasing=false;
 const cardLeft=card=>card.offsetLeft+card.offsetWidth/2-grid.clientWidth/2;
 const animateInput=time=>{
  const dt=Math.min(40,lastMotionTime?time-lastMotionTime:16);lastMotionTime=time;
  const difference=targetLeft-easedLeft;
  easedLeft+=difference*(1-Math.exp(-dt/95));grid.scrollLeft=easedLeft;
  if(Math.abs(difference)>.6){motionFrame=requestAnimationFrame(animateInput);return}
  motionFrame=0;lastMotionTime=0;
  if(releasing){
   grid.scrollLeft=targetLeft;gesturing=false;releasing=false;
   grid.classList.remove('is-gesturing');update();settle();
  }
 };
 const runMotion=()=>{
  if(reduced.matches){grid.scrollLeft=targetLeft;if(releasing){gesturing=false;releasing=false;grid.classList.remove('is-gesturing');update();settle()}return}
  if(!motionFrame)motionFrame=requestAnimationFrame(animateInput);
 };
 const beginGesture=()=>{
  if(!gesturing){update();gestureCard=current;gestureOrigin=cardLeft(current);targetLeft=grid.scrollLeft;easedLeft=grid.scrollLeft}
  gesturing=true;releasing=false;clearTimeout(timer);clearTimeout(gestureTimer);grid.classList.add('is-gesturing');
 };
 const moveGesture=left=>{
  const index=cards.indexOf(gestureCard);
  const minimum=cardLeft(cards[Math.max(0,index-1)]),maximum=cardLeft(cards[Math.min(cards.length-1,index+1)]);
  targetLeft=Math.max(minimum,Math.min(maximum,left));runMotion();
 };
 const finishGesture=()=>{
  if(!gesturing)return;
  const distance=targetLeft-gestureOrigin,index=cards.indexOf(gestureCard);
  const stride=gestureCard.offsetWidth+24;
  const step=Math.abs(distance)>stride*.18?Math.sign(distance):0;
  const destination=cards[Math.max(0,Math.min(cards.length-1,index+step))];
  targetLeft=cardLeft(destination);releasing=true;runMotion();
 };
 document.addEventListener('wheel',event=>{
  if(document.body.classList.contains('mobile-menu-open')||document.querySelector('#work-dialog[open]')||event.ctrlKey||Math.abs(event.deltaX)>=Math.abs(event.deltaY)||!event.deltaY)return;
  event.preventDefault();beginGesture();
  const unit=event.deltaMode===1?16:event.deltaMode===2?grid.clientWidth:1;
  moveGesture(targetLeft+event.deltaY*unit*.85);
  gestureTimer=setTimeout(finishGesture,190);
 },{passive:false});
 let swipe=null;
 grid.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'||event.button!==0)return;
  swipe={id:event.pointerId,x:event.clientX,y:event.clientY,left:grid.scrollLeft,vertical:false};
 });
 grid.addEventListener('pointermove',event=>{
  if(!swipe||event.pointerId!==swipe.id)return;
  const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
  if(!swipe.vertical){
   if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
   if(Math.abs(dx)>Math.abs(dy)){swipe=null;return}
   swipe.vertical=true;beginGesture();grid.setPointerCapture(event.pointerId);
  }
  event.preventDefault();moveGesture(swipe.left-dy);suppressClick=true;
 });
 const endSwipe=event=>{
  if(!swipe||event.pointerId!==swipe.id)return;
  const moved=swipe.vertical;swipe=null;
  if(moved){finishGesture();setTimeout(()=>{suppressClick=false},0)}
 };
 grid.addEventListener('pointerup',endSwipe);grid.addEventListener('pointercancel',endSwipe);
 addEventListener('resize',()=>{alignThumbnail();cancelAnimationFrame(motionFrame);motionFrame=0;gesturing=false;releasing=false;grid.classList.remove('is-gesturing');center(current,'instant');update()});
 alignThumbnail();center(current,'instant');update();
})();
