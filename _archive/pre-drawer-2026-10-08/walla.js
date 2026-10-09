/* Figma iteration: a docking logo, continuous work strip, and honest signup preview. */
(() => {
  const t = window.SiteLanguage?.t || (text => text);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const slot = document.querySelector('.logo-slot');
  const logo = slot?.querySelector('.site-logo');
  const pageNav = document.querySelector('.page-nav');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const caption = document.querySelector('.masthead .brand-caption');
  if (logo) {
    const hero = slot.closest('.masthead');
    // Keep the docked logo above the content sheet, outside the hero’s stacking context.
    hero.insertAdjacentElement('afterend', logo);
    let queued = false;
    function position() {
      queued = false;
      if (pageNav) {
        pageNav.classList.toggle('is-visible', document.getElementById('main').getBoundingClientRect().top <= 0);
        const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
        const active = atEnd ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= 150).at(-1);
        pageNav.querySelectorAll('a').forEach(link => {
          if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
      const box = slot.getBoundingClientRect();
      const start = box.top - hero.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, scrollY / Math.max(1, start - 16)));
      const scale = reduced.matches ? (progress === 1 ? 96 / box.width : 1) : 1 - progress * (1 - 96 / box.width);
      if (caption) caption.style.opacity = reduced.matches ? (progress === 1 ? '0' : '1') : String(1 - progress);
      logo.style.width = `${box.width}px`;
      logo.style.transform = `translate(-50%, ${Math.max(16, start - scrollY)}px) scale(${scale})`;
    }
    logo.classList.add('home-logo');
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(position); } };
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    position();
  }
  const belt = document.querySelector('[data-carousel]');
  if (belt) {
    const track = belt.querySelector('.work-track'), set = belt.querySelector('.work-set');
    const copy = set.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
    track.append(copy);
    let frame=0, last=0, position=0, visible=false, focused=false, paused=false, touching=false;
    const run = () => visible && !document.hidden && !reduced.matches && !focused && !paused && !touching;
    function tick(now) {
      frame=0;
      if (!run()) {last=0;return;}
      const width=set.getBoundingClientRect().width;
      if(last && width){position=(position+Math.min(64,now-last)*.035)%width;belt.scrollLeft=position;}
      last=now;frame=requestAnimationFrame(tick);
    }
    function update(){if(run()&&!frame){position=belt.scrollLeft;last=0;frame=requestAnimationFrame(tick);}}
    function toggle(){paused=!paused;if(!paused)focused=false;update();}
    // Pointer focus must not turn a click into an accidental pause.
    belt.addEventListener('pointerdown',e=>{focused=false;touching=e.pointerType!=='mouse';update();});
    const releaseTouch=()=>{touching=false;update();};
    window.addEventListener('pointerup',releaseTouch,{passive:true});
    window.addEventListener('pointercancel',releaseTouch,{passive:true});
    belt.addEventListener('focusin',()=>{focused=belt.matches(':focus-visible');update();});
    belt.addEventListener('focusout',()=>{focused=false;paused=false;update();});
    belt.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();focused=false;toggle();}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();paused=true;belt.scrollBy({left:e.key==='ArrowRight'?277:-277,behavior:reduced.matches?'instant':'smooth'});}});
    // Native horizontal browsing briefly holds the belt, then resumes by itself.
    let browseTimer;
    belt.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;touching=true;clearTimeout(browseTimer);browseTimer=setTimeout(releaseTouch,250);},{passive:true});
    document.addEventListener('visibilitychange',update);
    reduced.addEventListener('change',()=>{copy.hidden=reduced.matches;update();});
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();}).observe(belt);
    copy.hidden=reduced.matches;
    // Match the middle of the strip shown in the desktop frame.
    if(innerWidth>=768)belt.scrollLeft=Math.max(0,4*277-(innerWidth/2-39.5));
  }
  const form=document.querySelector('.connect-form'), email=document.getElementById('connect-email'), status=document.getElementById('connect-status');
  if(form&&email&&status){
    const explain=()=>{status.hidden=false;};
    email.disabled=false;
    form.querySelector('button[type="submit"]').disabled=false;
    email.addEventListener('focus',explain);
    form.addEventListener('submit',e=>{e.preventDefault();explain();status.textContent=t('Signup isn’t connected yet. Your email was not sent or saved.');});
    document.querySelector('[data-interest]')?.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();explain();document.getElementById('connect').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});email.focus({preventScroll:true});});
  }
})();
