/* The original tote, lazy-loaded into the transparent Shop stage. */
(() => {
  const stage = document.getElementById('tote-preview-stage');
  if (!stage) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  async function mount() {
    if (started) return;
    started = true;
    try {
      const { mountTote } = await import('./tote.js?v=9');
      const tote = mountTote({ stage, reducedMotion, presentation: 'contained' });
      stage.classList.add('is-ready');
      stage.tabIndex = 0;
      stage.setAttribute('role','button');
      stage.setAttribute('aria-label',(window.SiteLanguage?.t || (text => text))('2D1 tote. Hover over the bag to see inside; tap or press Enter to toggle X-ray.'));
      stage.setAttribute('aria-pressed','false');
      let pinned=false, down;
      function toggle(){pinned=!pinned;tote.setXray(pinned);stage.setAttribute('aria-pressed',String(pinned));}
      stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}if(e.key==='Escape'){pinned=false;tote.setXray(false);stage.setAttribute('aria-pressed','false');}});
      stage.addEventListener('pointerdown',e=>{down=e.pointerType==='mouse'?null:{x:e.clientX,y:e.clientY};});
      stage.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<8&&tote.hitTest(e.clientX,e.clientY))toggle();down=null;});
      stage.addEventListener('pointercancel',()=>{down=null;});
    } catch {
      stage.querySelector('.tote-canvas')?.remove();
      stage.classList.remove('is-ready');
    }
  }
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){mount();observer.disconnect();}},{rootMargin:'300px'});
  observer.observe(stage);
})();
