/* Each floating menu steps in from the top and leaves in the reverse order. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const menus=[];
  function staggerMenu(container,trigger,panel,items,details=false){
    const duration=260,step=44,total=duration+Math.max(0,items.length-1)*step;
    let open=false,closing=0;
    container.classList.add('finds-menu-motion');
    container.style.setProperty('--finds-menu-duration',`${duration}ms`);
    items.forEach((item,index)=>{
      item.classList.add('finds-menu-item');
      item.style.setProperty('--finds-menu-enter',`${index*step}ms`);
      item.style.setProperty('--finds-menu-exit',`${(items.length-1-index)*step}ms`);
    });
    const finishClose=()=>{
      clearTimeout(closing);closing=0;
      container.classList.remove('is-closing');
      if(details)container.open=false;
    };
    const setOpen=(next,restoreFocus=false)=>{
      if(panel.mobileNavigation?.active)return;
      if(restoreFocus&&panel.contains(document.activeElement))trigger.focus({preventScroll:true});
      if(next===open)return;
      open=next;clearTimeout(closing);closing=0;
      trigger.setAttribute('aria-expanded',String(open));
      panel.inert=!open;
      if(open){
        const wasClosing=container.classList.contains('is-closing');
        if(details)container.open=true;
        // Give a newly displayed details panel its hidden pose before entering.
        if(details&&!wasClosing)void panel.offsetWidth;
        container.classList.remove('is-closing');
        container.classList.add('is-open');
      }else{
        container.classList.remove('is-open');
        if(reduced.matches)finishClose();
        else{container.classList.add('is-closing');closing=setTimeout(finishClose,total);}
      }
    };
    trigger.setAttribute('aria-expanded','false');panel.inert=true;
    if(details)container.open=false;
    const api={container,trigger,panel,setOpen,get open(){return open;},settle(){if(!open)finishClose();},reset(){open=false;finishClose();container.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');panel.inert=true;}};
    menus.push(api);return api;
  }
  const menu=document.querySelector('.finds-home-menu');
  const trigger=menu?.querySelector('.finds-home-trigger');
  const nav=menu?.querySelector('nav');
  if(menu&&trigger&&nav){
    const home=staggerMenu(menu,trigger,nav,[...nav.querySelectorAll('a:not(.mobile-nav-home):not([hreflang])')]);
    nav.addEventListener('mobile-navigation-modechange',()=>home.reset());
    menu.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')home.setOpen(true);});
    menu.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!menu.contains(document.activeElement))home.setOpen(false);});
    menu.addEventListener('focusin',()=>home.setOpen(true));
    menu.addEventListener('focusout',e=>{if(!menu.contains(e.relatedTarget))home.setOpen(false);});
    let touchWasOpen=false;
    trigger.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')touchWasOpen=home.open;});
    trigger.addEventListener('click',e=>{if(e.pointerType&&e.pointerType!=='mouse'&&!touchWasOpen){e.preventDefault();home.setOpen(true);}});
    nav.addEventListener('click',e=>{if(e.target.closest('a'))home.setOpen(false);});
  }
  const categories=document.querySelector('.objects-tools');
  const summary=categories?.querySelector('summary');
  const panel=categories?.querySelector('.objects-tools-panel');
  if(categories&&summary&&panel){
    const category=staggerMenu(categories,summary,panel,[...panel.querySelectorAll('[data-category-filter]')],true);
    const mobile=matchMedia('(max-width:767px), (max-width:1023px) and (max-height:500px) and (pointer:coarse)');
    const syncCategory=()=>{
      if(mobile.matches){
        if(categories.contains(document.activeElement))document.getElementById('objects-zoom')?.focus({preventScroll:true});
        category.reset();
      }
      categories.inert=mobile.matches;
    };
    mobile.addEventListener('change',syncCategory);syncCategory();
    summary.addEventListener('click',e=>{e.preventDefault();if(!mobile.matches)category.setOpen(!category.open);});
    categories.addEventListener('focusout',e=>{if(!categories.contains(e.relatedTarget))category.setOpen(false);});
  }
  document.addEventListener('pointerdown',e=>{menus.forEach(menu=>{if(!menu.container.contains(e.target))menu.setOpen(false);});});
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    menus.forEach(menu=>{if(menu.open){e.preventDefault();menu.setOpen(false,true);}});
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)menus.forEach(menu=>menu.settle());});
})();
