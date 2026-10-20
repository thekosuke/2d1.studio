(() => {
const root=document.documentElement,journey=document.querySelector('.journey'),studio=document.querySelector('.studio'),shop=document.querySelector('.shop'),note=document.querySelector('.scroll-note');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=v=>Math.max(0,Math.min(1,v));const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
let frame=0;
function measure(){
 const w=document.documentElement.clientWidth;
 const edge=w>=1100?Math.max(Math.min(w*.277778,400),w-960-128):24;
 root.style.setProperty('--copy-left',`${Math.max(9,edge-(w<768?12:w*.15)-3)}px`);
 paint();
}
function paint(){frame=0;if(reduced.matches){studio.inert=false;shop.inert=false;return}
 const d=-journey.getBoundingClientRect().top/innerHeight;
 const cross=ease((d-2.1)/1.25);
 studio.style.transform=`translateX(${cross*100}%)`;
 shop.style.visibility=d>1.8?'visible':'hidden';
 shop.style.transform=`translateX(${(cross-1)*100}%)`;
 studio.inert=cross>.5;shop.inert=cross<=.5;
 document.querySelectorAll('[data-room]').forEach(button=>{
  if((button.dataset.room==='studio')===(cross<.5))button.setAttribute('aria-current','true');
  else button.removeAttribute('aria-current');
 });
 const message=d<2.1?'Keep going. Shop is next ←':d<3.35?'Through to Shop ←':'You’re in Shop';
 if(note.textContent!==message)note.textContent=message;
}
function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
function go(room){const target=room==='shop'?3.6:1.3;if(reduced.matches){document.querySelector('.'+room).scrollIntoView();return}scrollTo({top:scrollY+journey.getBoundingClientRect().top+target*innerHeight,behavior:'smooth'})}
document.querySelectorAll('[data-room]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.room)));
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);reduced.addEventListener('change',measure);document.fonts.ready.then(measure);measure();
})();
