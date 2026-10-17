/* Native sticky layering: hold the last copy line at 60vh while the white
   product sheet rises over it. Measurements only run when the layout changes. */
(() => {
  const scene = document.querySelector('.bag-study-scene');
  if (!scene) return;
  const lead = scene.querySelector('.bag-study-lead');
  const copy = lead.querySelector('[data-ink]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  const measure = () => {
    queued = false;
    if (reduced.matches) {
      scene.classList.remove('has-bag-cover');
      return;
    }
    const words = copy.querySelectorAll('.ink');
    const last = words.length ? words[words.length - 1] : copy;
    const lastLineBottom = last.getBoundingClientRect().bottom - lead.getBoundingClientRect().top;
    scene.style.setProperty('--bag-lead-top', `${innerHeight * .6 - lastLineBottom}px`);
    scene.classList.add('has-bag-cover');
  };
  const schedule = () => {
    if (!queued) { queued = true; requestAnimationFrame(measure); }
  };
  window.addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(lead);
  document.fonts.ready.then(schedule);
  schedule();
})();
