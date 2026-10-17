/* Native scrolling advances the introduction and specifications.
   Every position derives from scroll, so upward scrolling retraces the motion.
   Reduced motion, short screens and no JS retain the full document instead. */
(() => {
  const study = document.querySelector('.bag-study');
  if (!study) return;
  const editorial = study.querySelector('.bag-editorial');
  const story = study.querySelector('.bag-story');
  const pin = study.querySelector('.bag-story-pin');
  const viewport = study.querySelector('.bag-editorial-viewport');
  const panels = [...study.querySelectorAll('[data-bag-panel]')];
  const introContent = panels[0].querySelector('.bag-panel-content');
  const specContent = panels[1].querySelector('.bag-panel-content');
  const stage = study.querySelector('.bag-study-stage');
  const spread = study.querySelector('.bag-product-spread');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 767px)');
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const ease = n => n * n * (3 - 2 * n);
  let enabled = false;
  let needsMeasure = true;
  let scheduled = false;
  let renderedDistance = null;
  let previousFrame = null;
  let pinTop = 80;
  let panelHeight = 0;
  let total = 0;
  let segments = [];
  let introHeight = 0;
  let specHeight = 0;
  const measure = () => {
    needsMeasure = false;
    renderedDistance = null;
    previousFrame = null;
    enabled = !reduce.matches;
    study.classList.toggle('has-story-panels', enabled);
    if (enabled && narrow.matches) pin.insertBefore(stage, viewport);
    else if (stage.parentElement !== spread) spread.insertBefore(stage, editorial);
    if (enabled) {
      pinTop = narrow.matches ? 72 : 80;
      const imageSpace = narrow.matches ? stage.offsetHeight + 24 : 0;
      panelHeight = Math.min(680, innerHeight - pinTop - (narrow.matches ? 64 : 80) - imageSpace);
      enabled = panelHeight >= 260;
      if (enabled) {
        story.style.setProperty('--panel-height', `${panelHeight}px`);
        introHeight = introContent.offsetHeight;
        specHeight = specContent.offsetHeight;
        const base = Math.max(520, Math.min(1100, innerHeight * 1.15));
        const overflows = [Math.max(0, introHeight - panelHeight), Math.max(0, specHeight - panelHeight)];
        total = 0;
        segments = overflows.map(overflow => {
          const segment = {start:total, length:base + overflow * 1.3};
          total += segment.length;
          return segment;
        });
        story.style.setProperty('--pin-top', `${pinTop}px`);
        story.style.setProperty('--pin-height', `${panelHeight + imageSpace}px`);
        story.style.setProperty('--story-distance', `${total}px`);
      }
    }
    study.classList.toggle('has-story-panels', enabled);
    if (!enabled) {
      if (stage.parentElement !== spread) spread.insertBefore(stage, editorial);
      panels.forEach(node => node.style.removeProperty('--panel-y'));
      [introContent, specContent].forEach(node => node.style.removeProperty('--content-y'));
    }
  };
  const update = timestamp => {
    scheduled = false;
    if (needsMeasure) measure();
    if (document.hidden) {
      renderedDistance = null;
      previousFrame = null;
      return;
    }
    if (!enabled) return;
    const bounds = story.getBoundingClientRect();
    const targetDistance = clamp(pinTop - bounds.top, 0, total);
    // A short, frame-rate-independent scrub softens discrete mouse-wheel steps.
    // Only the illustration/text response is eased; native page scroll is untouched.
    const outside = bounds.top > innerHeight || bounds.bottom < 0;
    if (renderedDistance === null || outside || targetDistance === 0 || targetDistance === total || Math.abs(targetDistance - renderedDistance) > innerHeight * 2) {
      renderedDistance = targetDistance;
    } else {
      const elapsed = previousFrame === null ? 16.67 : Math.min(64, timestamp - previousFrame);
      renderedDistance += (targetDistance - renderedDistance) * (1 - Math.exp(-elapsed / 85));
    }
    const settling = Math.abs(targetDistance - renderedDistance) > .15;
    if (!settling) renderedDistance = targetDistance;
    previousFrame = settling ? timestamp : null;
    const distance = renderedDistance;
    let scene = segments.findIndex(segment => distance < segment.start + segment.length);
    if (scene < 0) scene = segments.length - 1;
    const phase = clamp((distance - segments[scene].start) / segments[scene].length);
    const transition = ease(clamp((phase - .56) / .44));
    const positions = scene === 0 ? [-transition, 1 - transition] : [-1, 0];
    panels.forEach((node, i) => node.style.setProperty('--panel-y', `${positions[i] * panelHeight}px`));
    const pan = (content, height, fraction) => {
      const offset = height <= panelHeight ? (panelHeight - height) / 2 : -(height - panelHeight) * fraction;
      content.style.setProperty('--content-y', `${offset}px`);
    };
    pan(introContent, introHeight, scene === 0 ? ease(clamp(phase / .56)) : 1);
    pan(specContent, specHeight, scene === 1 ? ease(clamp((phase - .1) / .75)) : 0);
    study.dataset.bagScene = scene === 0 ? 'introduction' : 'specifications';
    if (settling) schedule();
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };
  const remeasure = () => { needsMeasure = true; schedule(); };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', remeasure);
  document.addEventListener('visibilitychange', schedule);
  reduce.addEventListener('change', remeasure);
  const observer = new ResizeObserver(remeasure);
  [introContent, specContent].forEach(node => observer.observe(node));
  document.fonts.ready.then(remeasure);
  schedule();
})();
