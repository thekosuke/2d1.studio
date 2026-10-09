/* Finds menus share the site's left-edge reveal, with keyboard/touch access. */
(() => {
  const menu=document.querySelector('.finds-home-menu');
  const trigger=menu?.querySelector('.finds-home-trigger');
  const nav=menu?.querySelector('nav');
  if(!menu||!trigger||!nav)return;
  const setOpen=open=>{menu.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));nav.inert=!open;};
  setOpen(false);
  menu.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setOpen(true);});
  menu.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!menu.contains(document.activeElement))setOpen(false);});
  menu.addEventListener('focusin',()=>setOpen(true));
  menu.addEventListener('focusout',e=>{if(!menu.contains(e.relatedTarget))setOpen(false);});
  let touchWasOpen=false;
  trigger.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')touchWasOpen=menu.classList.contains('is-open');});
  trigger.addEventListener('click',e=>{if(e.pointerType&&e.pointerType!=='mouse'&&!touchWasOpen){e.preventDefault();setOpen(true);}});
  document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))setOpen(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('is-open')){trigger.focus();setOpen(false);}});
})();
