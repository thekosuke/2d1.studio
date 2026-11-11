/* Small product interactions; the Shop grid uses normal document scrolling. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('.shop-card').forEach(project=>{
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
   project.addEventListener('focusin',turn);
   reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
  }
 });
})();
