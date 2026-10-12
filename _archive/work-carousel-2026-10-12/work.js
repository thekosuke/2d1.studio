/* An endless project deck. Preview clicks advance; phones retain swipe browsing. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('.work-project').forEach(project=>{
  const viewport=project.querySelector('.work-carousel');
  const originals=[...viewport.querySelectorAll('.work-slide')];
  const deck=document.createElement('div');deck.className='work-deck';
  originals.forEach((slide,i)=>{slide.dataset.index=i;deck.append(slide)});viewport.append(deck);
  const status=project.querySelector('.work-position');
  const nextLabel=document.documentElement.lang==='ja'?'次の画像':'Next image';
  const preview=document.createElement('button');preview.type='button';preview.className='work-preview';preview.setAttribute('aria-label',nextLabel);viewport.append(preview);
  let busy=false,touch=null,timer,suppressClickUntil=0;
  const slides=()=>[...deck.children];
  const step=()=>deck.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(deck).gap);
  const update=()=>{
   slides().forEach((slide,i)=>{
    slide.className='work-slide'+(i===0?' is-current':i===1?' is-next':'');
    slide.removeAttribute('role');slide.removeAttribute('tabindex');slide.removeAttribute('aria-label');
    slide.setAttribute('aria-hidden',i>1?'true':'false');
    if(i<3)slide.querySelector('img').loading='eager';
   });
   status.textContent=`${Number(deck.firstElementChild.dataset.index)+1} / ${originals.length}`;
  };
  const move=direction=>{
   if(busy)return;
   busy=true;
   if(deck.contains(document.activeElement))viewport.focus({preventScroll:true});
   deck.style.transition='none';
   if(direction<0){deck.prepend(deck.lastElementChild);deck.style.transform=`translateX(-${step()}px)`;update()}
   else deck.style.transform='translateX(0)';
   deck.classList.add('is-moving');
   deck.getBoundingClientRect();
   const finish=()=>{
    clearTimeout(timer);deck.removeEventListener('transitionend',ended);
    deck.style.transition='none';
    if(direction>0)deck.append(deck.firstElementChild);
    deck.style.transform='translateX(0)';update();deck.classList.remove('is-moving');busy=false;
   };
   const ended=e=>{if(e.target===deck&&e.propertyName==='transform')finish()};
   if(reduced.matches){finish();return}
   deck.style.transition='transform 520ms cubic-bezier(.25,.1,.25,1)';
   deck.style.transform=direction>0?`translateX(-${step()}px)`:'translateX(0)';
   deck.addEventListener('transitionend',ended);timer=setTimeout(finish,600);
  };
  viewport.addEventListener('click',e=>{if(performance.now()>suppressClickUntil&&e.target.closest('.work-preview'))move(1)});
  viewport.addEventListener('keydown',e=>{
   if(e.key==='ArrowRight'||((e.key==='Enter'||e.key===' ')&&e.target===viewport)){e.preventDefault();move(1)}
   else if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
  });
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')touch={x:e.clientX,y:e.clientY}});
  viewport.addEventListener('pointerup',e=>{
   if(!touch)return;
   const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;
   if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){suppressClickUntil=performance.now()+500;move(dx<0?1:-1)}
  });
  viewport.addEventListener('pointercancel',()=>{touch=null});
  update();
 });
})();
