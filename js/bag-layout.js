/* Scroll reveals the package insert beside a centered product. Native scroll
   drives both directions; no wheel interception or time-based catch-up. */
(() => {
  const track = document.querySelector('.bag-layout-scroll');
  if (!track) return;
  const spread = track.querySelector('.bag-product-spread');
  const stage = track.querySelector('.bag-study-stage');
  const image = track.querySelector('.bag-study-image');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 768px)');
  let top = 0, distance = 0, shift = 0, queued = false;
  function paint() {
    queued = false;
    if (!track.classList.contains('has-bag-layout')) return;
    const progress = Math.max(0, Math.min(1, (top - track.getBoundingClientRect().top) / distance));
    const eased = progress * progress * (3 - 2 * progress);
    track.style.setProperty('--bag-layout-x', `${shift * (1 - eased)}px`);
    track.style.setProperty('--bag-layout-progress', eased);
    track.style.setProperty('--bag-editorial-x', `${64 * (1 - eased)}px`);
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }
  function measure() {
    track.classList.remove('has-bag-layout');
    if (motion.matches || !desktop.matches) return;
    const bounds = spread.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();
    top = Math.max(24, (innerHeight - image.offsetHeight) / 2);
    distance = Math.max(320, innerHeight * .65);
    shift = bounds.left + bounds.width / 2 - (stageBounds.left + stageBounds.width / 2);
    track.style.setProperty('--bag-layout-top', `${top}px`);
    track.style.setProperty('--bag-layout-height', `${spread.offsetHeight + distance + innerHeight * .3}px`);
    track.classList.add('has-bag-layout');
    paint();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure);
  motion.addEventListener('change', measure);
  desktop.addEventListener('change', measure);
  new ResizeObserver(measure).observe(spread);
  document.fonts.ready.then(measure);
  measure();
})();
