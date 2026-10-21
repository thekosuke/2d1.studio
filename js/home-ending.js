/* Measure the shared reveal layer so tall/mobile footers remain fully reachable. */
(() => {
  const ending=document.querySelector('.home-ending');
  if(!ending)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const language=document.querySelector('body > .language-switch');
  const main=document.getElementById('main');
  function measure(){ending.style.setProperty('--ending-bottom',`${Math.min(0,innerHeight-ending.offsetHeight)}px`);paint();}
  function paint(){
    const edge=main.getBoundingClientRect().bottom;
    if(language){const box=language.getBoundingClientRect();language.classList.toggle('on-ending',edge<=box.top+box.height/2);}
    document.querySelectorAll('.site-logo,.mobile-nav-toggle').forEach(control=>{const box=control.getBoundingClientRect();control.classList.toggle('on-ending',edge<box.bottom);});
    document.querySelectorAll('.page-nav a').forEach(link=>{const box=link.getBoundingClientRect();link.classList.toggle('on-ending',edge<=box.top+box.height/2);});
  }
  ending.addEventListener('focusin',()=>{
    if(!reduced.matches&&main.getBoundingClientRect().bottom>0)window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
  });
  new ResizeObserver(measure).observe(ending);
  addEventListener('resize',measure);
  addEventListener('scroll',()=>requestAnimationFrame(paint),{passive:true});
  measure();
})();
