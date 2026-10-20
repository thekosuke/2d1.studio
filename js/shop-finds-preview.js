/* A fixed-order canvas preview: zoom on hover, reset on leave. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('.shop-finds-preview').forEach(preview=>{
  const card=preview.closest('.shop-card');
  const screen=preview.querySelector('.shop-finds-live');if(!screen)return;
  let frame=null,hovered=false;
  const send=()=>frame?.contentWindow?.postMessage(hovered&&!reduced.matches?'fc-preview-start':'fc-preview-stop',location.origin);
  const fit=()=>{if(frame)frame.style.transform=`scale(${screen.clientWidth/1600})`};
  const mount=()=>{
   if(frame)return;
   frame=document.createElement('iframe');frame.title='Familiar Characters canvas zoom preview';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');
   const url=new URL(preview.closest('a').href);url.searchParams.set('shop-preview','1');frame.src=url.href;
   frame.addEventListener('load',send);screen.append(frame);fit();
  };
  const start=()=>{if(reduced.matches)return;hovered=true;mount();send()};
  const stop=()=>{hovered=false;send()};
  card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')start()});
  card.addEventListener('pointerleave',stop);
  card.addEventListener('focusin',start);
  card.addEventListener('focusout',stop);
  new ResizeObserver(fit).observe(screen);
  new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting){stop();frame?.remove();frame=null}
  })).observe(preview);
  reduced.addEventListener('change',send);
 });
})();
