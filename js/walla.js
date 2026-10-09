/* Figma iteration: a docking logo, continuous work strip, and honest signup preview. */
(() => {
  const t = window.SiteLanguage?.t || (text => text);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heroCover = document.querySelector('.home-page > .masthead');
  const main = document.getElementById('main');
  const intro = main?.querySelector('.intro');
  const mobile = matchMedia('(max-width: 767px)');
  const studio = document.getElementById('studio');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const n = clamp(value); return n * n * (3 - 2 * n); };
  let sceneQueued = false;
  function paintScene() {
    sceneQueued = false;
    if (heroCover && main) {
      // The cover travels at native scroll speed; the page beneath travels at
      // 70% on desktop; phones reveal the intro sooner. Native scroll is never held.
      const remaining = Math.max(0, heroCover.offsetHeight - Math.max(0, scrollY));
      let coverFactor = .3;
      if (mobile.matches && intro) {
        // The first line emerges when intro padding exceeds the cover offset.
        // Reduce that scroll distance by 25%, rather than shortening a timer.
        const padding = parseFloat(getComputedStyle(intro).paddingTop) || 0;
        const originalEntry = Math.max(0, heroCover.offsetHeight - padding / .3);
        const earlierEntry = originalEntry * .75;
        coverFactor = Math.min(.3, padding / Math.max(1, heroCover.offsetHeight - earlierEntry));
      }
      main.style.setProperty('--cover-offset', `${reduced.matches ? 0 : -remaining * coverFactor}px`);
    }
    if (studio) {
      const box = studio.getBoundingClientRect();
      const height = innerHeight;
      const mix = reduced.matches ? Number(box.top <= height * .5 && box.bottom > height * .5)
        : Math.min(smooth((height * .85 - box.top) / (height * .65)), smooth((box.bottom - height * .15) / (height * .65)));
      const warm = [250,240,230], cool = [224,220,215];
      const color = warm.map((channel,i) => Math.round(channel + (cool[i] - channel) * mix));
      document.documentElement.style.setProperty('--page-background', `rgb(${color.join(',')})`);
    }
  }
  const queueScene = () => { if (!sceneQueued) { sceneQueued = true; requestAnimationFrame(paintScene); } };
  addEventListener('scroll', queueScene, {passive:true});
  addEventListener('resize', queueScene);
  reduced.addEventListener('change', queueScene);
  document.fonts.ready.then(queueScene);
  paintScene();
  // Never hold a user on the landing sequence if they start navigating.
  const finishLanding = () => document.documentElement.classList.remove('is-landing');
  document.querySelector('.landing-cover')?.addEventListener('animationend', event => {
    if (event.animationName === 'landing-wipe') finishLanding();
  });
  addEventListener('scroll', () => { if (scrollY > 4) finishLanding(); }, {passive:true});
  addEventListener('keydown', event => { if (['Tab','PageDown','End','ArrowDown',' '].includes(event.key)) finishLanding(); });
  addEventListener('pageshow', () => { if (scrollY > 4) finishLanding(); });
  reduced.addEventListener('change', () => { if (reduced.matches) finishLanding(); });
  if (scrollY > 4 || reduced.matches) finishLanding();
  // Preserve the real heading and emphasis; wrap only text for reading ink.
  const inkBlocks = [...document.querySelectorAll('[data-ink]')].map(block => {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const words = [];
    const segmenter = document.documentElement.lang === 'ja' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter('ja', {granularity: 'word'}) : null;
    nodes.forEach(node => {
      const parts = segmenter ? [...segmenter.segment(node.textContent)].map(part => part.segment)
        : node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.append(part); return; }
        const word = document.createElement('span');
        word.className = 'ink';
        word.textContent = part;
        words.push(word);
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    block.classList.add('is-inking');
    return {block, words, count: -1};
  });
  let inkQueued = false;
  function inkIn() {
    inkQueued = false;
    inkBlocks.forEach(ink => {
      const box = ink.block.getBoundingClientRect();
      const coverBottom = heroCover && !reduced.matches ? Math.max(0, heroCover.getBoundingClientRect().bottom) : 0;
      const start = innerHeight * .85 - coverBottom * .85;
      // Longer phone paragraphs finish as their final lines enter the reading area.
      const end = Math.min(innerHeight * .25, innerHeight * .7 - box.height);
      const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (start - box.top) / Math.max(1, start - end)));
      const count = Math.round(progress * ink.words.length);
      if (count === ink.count) return;
      ink.count = count;
      ink.words.forEach((word, i) => word.classList.toggle('is-inked', i < count));
    });
  }
  const queueInk = () => { if (!inkQueued) { inkQueued = true; requestAnimationFrame(inkIn); } };
  if (inkBlocks.length) {
    addEventListener('scroll', queueInk, {passive: true});
    addEventListener('resize', queueInk);
    reduced.addEventListener('change', queueInk);
    document.fonts.ready.then(queueInk);
    inkIn();
  }
  const slot = document.querySelector('.logo-slot');
  const logo = slot?.querySelector('.site-logo');
  const pageNav = document.querySelector('.page-nav');
  const languageSwitch = document.querySelector('.home-page > .language-switch');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const caption = document.querySelector('.masthead .brand-caption');
  if (logo) {
    const hero = slot.closest('.masthead');
    // Keep the docked logo above the content sheet, outside the hero’s stacking context.
    hero.insertAdjacentElement('afterend', logo);
    function fitCaption() {
      const text = caption?.querySelector('span');
      if (!text) return;
      caption.style.fontSize = '32px';
      const width = text.offsetWidth;
      if (width) caption.style.fontSize = `${32 * slot.offsetWidth / width}px`;
      const landingCaption = document.querySelector('.landing-cover .brand-caption');
      if (landingCaption) landingCaption.style.fontSize = caption.style.fontSize;
    }
    fitCaption();
    let queued = false;
    function position() {
      queued = false;
      if (pageNav) {
        const showNav = hero.getBoundingClientRect().bottom <= 0;
        pageNav.classList.toggle('is-visible', showNav);
        pageNav.inert = !showNav;
        if (languageSwitch) {
          languageSwitch.classList.toggle('is-visible', showNav);
          languageSwitch.inert = !showNav;
        }
        const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
        const active = atEnd ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= 150).at(-1);
        pageNav.querySelectorAll('a').forEach(link => {
          if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
      const box = slot.getBoundingClientRect();
      const start = box.top - hero.getBoundingClientRect().top;
      // Elastic overscroll can report negative offsets; keep the opening anchored.
      const scrollTop = Math.max(0, scrollY);
      const progress = Math.max(0, Math.min(1, scrollTop / Math.max(1, start - 16)));
      const scale = reduced.matches ? (progress === 1 ? 96 / box.width : 1) : 1 - progress * (1 - 96 / box.width);
      const logoTop = Math.max(16, start - scrollTop);
      if (caption) {
        // Keep the caption attached beneath the shrinking mark; fade only in
        // the final quarter of the docking movement.
        const naturalTop = hero.getBoundingClientRect().top + hero.clientTop + caption.offsetTop;
        const targetTop = logoTop + (box.height + 12) * scale;
        caption.style.transform = reduced.matches ? 'none' : `translateY(${targetTop - naturalTop}px) scale(${scale})`;
        const fade = Math.max(0, Math.min(1, (progress - .75) / .25));
        caption.style.opacity = reduced.matches ? (progress === 1 ? '0' : '1') : String(1 - fade);
      }
      logo.style.width = `${box.width}px`;
      logo.style.transform = `translate(-50%, ${logoTop}px) scale(${scale})`;
    }
    // Supplied pixel-eye artwork, reversed to beige with red highlights on the red D.
    const eyesUrl = new URL('eyes-on-red.svg?v=2', logo.querySelector('img').src).href;
    logo.insertAdjacentHTML('beforeend', `<svg class="logo-eyes" viewBox="0 0 829 280" aria-hidden="true" focusable="false"><image class="logo-eye" href="${eyesUrl}" x="317" y="103" width="116" height="48"/></svg>`);
    const eyeTimers = new Set();
    const later = (fn, delay) => {
      const timer = setTimeout(() => { eyeTimers.delete(timer); fn(); }, delay);
      eyeTimers.add(timer);
    };
    const resetEyes = () => {
      eyeTimers.forEach(clearTimeout);
      eyeTimers.clear();
      logo.classList.remove('is-awake', 'is-glancing', 'is-blinking');
    };
    function peek() {
      if (reduced.matches || document.hidden) return;
      if (!document.documentElement.classList.contains('has-dialog')) {
        logo.style.setProperty('--glance', Math.random() < .5 ? '-1' : '1');
        logo.classList.add('is-awake');
        later(() => logo.classList.add('is-glancing'), 380);
        later(() => logo.classList.add('is-blinking'), 630);
        later(() => logo.classList.remove('is-blinking'), 760);
        later(() => logo.classList.remove('is-glancing'), 900);
        later(() => logo.classList.remove('is-awake'), 1250);
      }
      later(peek, 4200 + Math.random() * 3200);
    }
    function resumeEyes() {
      resetEyes();
      if (!reduced.matches && !document.hidden) later(peek, 2400);
    }
    document.addEventListener('visibilitychange', resumeEyes);
    reduced.addEventListener('change', resumeEyes);
    resumeEyes();
    logo.classList.add('home-logo');
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(position); } };
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', () => { fitCaption(); schedule(); });
    document.fonts.ready.then(() => { fitCaption(); schedule(); });
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
    belt.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();focused=false;toggle();}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();paused=true;belt.scrollBy({left:e.key==='ArrowRight'?312:-312,behavior:reduced.matches?'instant':'smooth'});}});
    // Native horizontal browsing briefly holds the belt, then resumes by itself.
    let browseTimer;
    belt.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;touching=true;clearTimeout(browseTimer);browseTimer=setTimeout(releaseTouch,250);},{passive:true});
    document.addEventListener('visibilitychange',update);
    reduced.addEventListener('change',()=>{copy.hidden=reduced.matches;update();});
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();}).observe(belt);
    copy.hidden=reduced.matches;
    // Match the middle of the strip shown in the desktop frame.
    if(innerWidth>=768)belt.scrollLeft=Math.max(0,4*312-(innerWidth/2-39.5));
  }
  const form=document.querySelector('.connect-form'), email=document.getElementById('connect-email'), status=document.getElementById('connect-status');
  if(form&&email&&status){
    const explain=()=>{status.hidden=false;};
    email.disabled=false;
    form.querySelector('button[type="submit"]').disabled=false;
    form.addEventListener('submit',e=>{e.preventDefault();explain();status.textContent=t('Signup isn’t connected yet. Your email was not sent or saved.');});
    document.querySelector('[data-interest]')?.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();document.getElementById('connect').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});email.focus({preventScroll:true});});
  }
})();
