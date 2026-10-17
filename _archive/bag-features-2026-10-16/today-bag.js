/* Native scrolling advances three panels and six clipped feature texts.
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
  const specContent = panels[2].querySelector('.bag-panel-content');
  const features = [...study.querySelectorAll('[data-bag-feature]')];
  const points = [...study.querySelectorAll('[data-bag-point]')];
  const progressbar = study.querySelector('.bag-feature-progress');
  const pips = [...progressbar.children];
  const stage = study.querySelector('.bag-study-stage');
  const spread = study.querySelector('.bag-product-spread');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 767px)');
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const ease = n => n * n * (3 - 2 * n);
  let enabled = false;
  let needsMeasure = true;
  let scheduled = false;
  let current = null;
  let renderedDistance = null;
  let previousFrame = null;
  let pinTop = 80;
  let panelHeight = 0;
  let featureHeight = 0;
  let total = 0;
  let segments = [];
  let heights = [];
  let introHeight = 0;
  let specHeight = 0;
  const select = key => {
    if (key === current) return;
    current = key;
    study.classList.toggle('is-showing-interior', key === 'pockets');
    features.forEach(node => node.classList.toggle('is-focused', node.dataset.bagFeature === key));
    points.forEach(node => node.classList.toggle('is-active', node.dataset.bagPoint === key));
  };
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
        heights = features.map(node => node.offsetHeight);
        featureHeight = Math.min(Math.max(...heights), panelHeight - (narrow.matches ? 32 : 40));
        story.style.setProperty('--feature-height', `${featureHeight}px`);
        introHeight = introContent.offsetHeight;
        specHeight = specContent.offsetHeight;
        const base = Math.max(520, Math.min(1100, innerHeight * 1.15));
        const overflows = [Math.max(0, introHeight - panelHeight), ...heights.map(h => Math.max(0, h - featureHeight)), Math.max(0, specHeight - panelHeight)];
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
      features.forEach(node => node.style.removeProperty('--feature-y'));
    }
  };
  const update = timestamp => {
    scheduled = false;
    if (needsMeasure) measure();
    if (document.hidden) {
      renderedDistance = null;
      previousFrame = null;
      select(null);
      return;
    }
    if (!enabled) {
      const midpoint = innerHeight / 2;
      select(features.find(node => {
        const rect = node.getBoundingClientRect();
        return rect.top <= midpoint && rect.bottom > midpoint;
      })?.dataset.bagFeature ?? null);
      return;
    }
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
    const positions = [
      scene === 0 ? -transition : -1,
      scene === 0 ? 1 - transition : scene < 6 ? 0 : scene === 6 ? -transition : -1,
      scene < 6 ? 1 : scene === 6 ? 1 - transition : 0
    ];
    panels.forEach((node, i) => node.style.setProperty('--panel-y', `${positions[i] * panelHeight}px`));
    const pan = (content, height, fraction) => {
      const offset = height <= panelHeight ? (panelHeight - height) / 2 : -(height - panelHeight) * fraction;
      content.style.setProperty('--content-y', `${offset}px`);
    };
    pan(introContent, introHeight, scene === 0 ? ease(clamp(phase / .56)) : 1);
    pan(specContent, specHeight, scene === 7 ? ease(clamp((phase - .1) / .75)) : 0);
    const featurePosition = scene === 0 ? 0 : scene <= 5 ? scene - 1 + transition : 5;
    const active = Math.round(featurePosition);
    features.forEach((node, i) => {
      const overflow = Math.max(0, heights[i] - featureHeight);
      const read = scene > i + 1 ? 1 : scene === i + 1 ? ease(clamp((phase - .06) / .5)) : 0;
      node.style.setProperty('--feature-y', `${(i - featurePosition) * (featureHeight + 32) - overflow * read}px`);
    });
    pips.forEach((node, i) => {
      node.classList.toggle('is-current', i === active);
      node.classList.toggle('is-past', i < active);
    });
    const value = String(active + 1);
    if (progressbar.getAttribute('aria-valuenow') !== value) progressbar.setAttribute('aria-valuenow', value);
    const featureVisible = (scene === 0 && transition > .5) || (scene > 0 && scene < 6) || (scene === 6 && transition < .5);
    select(featureVisible && bounds.top <= pinTop && distance < total ? features[active].dataset.bagFeature : null);
    study.dataset.bagScene = scene === 0 ? 'introduction' : scene === 7 ? 'specifications' : features[active].dataset.bagFeature;
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
  [introContent, specContent, ...features].forEach(node => observer.observe(node));
  document.fonts.ready.then(remeasure);
  study.classList.add('has-story-tracking');
  schedule();
})();
