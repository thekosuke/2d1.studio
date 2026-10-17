/* Native scroll peels the index cards off their stack. Reversing scroll retraces
   the same transforms. Reduced motion and no JS retain ordinary, flat notes. */
(() => {
  const study = document.querySelector('.bag-study');
  if (!study) return;
  const features = [...study.querySelectorAll('[data-bag-feature]')];
  const points = [...study.querySelectorAll('[data-bag-point]')];
  const story = study.querySelector('.bag-story');
  const pin = study.querySelector('.bag-story-pin');
  const deck = study.querySelector('.bag-features');
  const stage = study.querySelector('.bag-study-stage');
  const spread = study.querySelector('.bag-product-spread');
  const editorial = study.querySelector('.bag-editorial');
  const specs = study.querySelector('.bag-study-notes');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 767px)');
  let current = null;
  let scheduled = false;
  let needsMeasure = true;
  let stacked = false;
  let step = 0;
  let pinTop = 80;
  let deckHeight = 0;
  let specHeight = 0;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const select = key => {
    if (key === current) return;
    current = key;
    study.classList.toggle('is-showing-interior', key === 'pockets');
    features.forEach(node => node.classList.toggle('is-focused', node.dataset.bagFeature === key));
    points.forEach(node => node.classList.toggle('is-active', node.dataset.bagPoint === key));
  };
  const measure = () => {
    needsMeasure = false;
    stacked = !reduce.matches;
    study.classList.toggle('has-card-stack', stacked);
    if (stacked && narrow.matches) pin.insertBefore(stage, deck);
    else if (stage.parentElement !== spread) spread.insertBefore(stage, editorial);
    if (stacked) {
      if (specs.parentElement !== pin) pin.append(specs);
      const height = pin.offsetHeight;
      pinTop = narrow.matches ? 72 : Math.max(80, (innerHeight - height) / 2);
      // Short viewports and enlarged text must never trap or clip readable copy.
      stacked = height <= innerHeight - pinTop - 24;
      if (stacked) {
        deckHeight = deck.offsetHeight;
        specHeight = specs.offsetHeight;
        editorial.style.setProperty('--spec-reserve', `${Math.max(0, specHeight - deckHeight)}px`);
        step = Math.max(440, Math.min(900, innerHeight * .95));
        story.style.setProperty('--pin-height', `${height}px`);
        story.style.setProperty('--pin-top', `${pinTop}px`);
        story.style.setProperty('--story-distance', `${step * features.length}px`);
      }
    }
    study.classList.toggle('has-card-stack', stacked);
    if (!stacked) {
      if (specs.parentElement !== editorial) editorial.append(specs);
      if (stage.parentElement !== spread) spread.insertBefore(stage, editorial);
      features.forEach(node => node.removeAttribute('style'));
    }
  };
  const update = () => {
    scheduled = false;
    if (needsMeasure) measure();
    if (document.hidden) { select(null); return; }
    if (!stacked) {
      const midpoint = innerHeight / 2;
      select(features.find(node => {
        const bounds = node.getBoundingClientRect();
        return bounds.top <= midpoint && bounds.bottom > midpoint;
      })?.dataset.bagFeature ?? null);
      return;
    }
    const bounds = story.getBoundingClientRect();
    const progress = clamp((pinTop - bounds.top) / step, 0, features.length);
    const index = Math.min(Math.floor(progress), features.length - 1);
    const flight = clamp((progress - index - .7) / .3);
    const active = index + (flight > .55 ? 1 : 0);
    select(bounds.top <= pinTop + 40 && active < features.length && progress < features.length
      ? features[active].dataset.bagFeature : null);
    const lastFlight = clamp((progress - (features.length - 1) - .7) / .3);
    // The complete specifications sit below the deck, then rise into its
    // vacated space during the final throw. Never crop the table.
    specs.style.setProperty('--spec-rise', `${-deckHeight * lastFlight}px`);
    features.forEach((node, i) => {
      const throwProgress = clamp((progress - i - .7) / .3);
      const depth = clamp(i - index - flight, 0, 3);
      node.style.setProperty('--card-order', features.length - i);
      node.style.setProperty('--card-x', `${throwProgress * deck.clientWidth * .14}px`);
      node.style.setProperty('--card-y', `${depth * 9 - throwProgress * (deck.offsetHeight + 80)}px`);
      node.style.setProperty('--card-angle', `${-throwProgress * 12}deg`);
      node.style.setProperty('--card-scale', 1 - depth * .025);
      node.style.setProperty('--card-opacity', 1 - clamp((throwProgress - .8) / .2));
      node.style.setProperty('--card-copy', clamp(1 - depth));
    });
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };
  const remeasure = () => { needsMeasure = true; schedule(); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', remeasure);
  document.addEventListener('visibilitychange', schedule);
  reduce.addEventListener('change', remeasure);
  new ResizeObserver(remeasure).observe(pin);
  document.fonts.ready.then(remeasure);
  study.classList.add('has-story-tracking');
  schedule();
})();
