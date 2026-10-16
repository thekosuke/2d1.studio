/* The viewport midpoint connects one reading note to the product photograph.
   All copy remains ordinary document content, including without JavaScript. */
(() => {
  const study = document.querySelector('.bag-study');
  if (!study) return;
  const features = [...study.querySelectorAll('[data-bag-feature]')];
  const points = [...study.querySelectorAll('[data-bag-point]')];
  let current = null;
  let scheduled = false;
  const select = key => {
    if (key === current) return;
    current = key;
    study.classList.toggle('is-showing-interior', key === 'pockets');
    features.forEach(node => node.classList.toggle('is-focused', node.dataset.bagFeature === key));
    points.forEach(node => node.classList.toggle('is-active', node.dataset.bagPoint === key));
  };
  const update = () => {
    scheduled = false;
    if (document.hidden) { select(null); return; }
    const midpoint = window.innerHeight / 2;
    const active = features.find(node => {
      const bounds = node.getBoundingClientRect();
      return bounds.top <= midpoint && bounds.bottom > midpoint;
    });
    select(active?.dataset.bagFeature ?? null);
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  new ResizeObserver(schedule).observe(study);
  document.fonts.ready.then(schedule);
  study.classList.add('has-story-tracking');
  schedule();
})();
