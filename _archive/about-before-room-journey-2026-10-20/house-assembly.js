/* Three toy blocks assemble with native scroll; the roof is placed last.
   A native sticky stage holds the view; there is no wheel handling or timer. */
(() => {
  const panel = document.querySelector('.design-house');
  if (!panel) return;
  const pieces = [...panel.querySelectorAll('[data-house-piece]')];
  if (pieces.length !== 3) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const placements = [
    { x: -100, y: 10, angle: -12, start: 0, duration: .55 },
    { x: 110, y: 50, angle: 12, start: .15, duration: .55 },
    { x: 20, y: -90, angle: -6, start: .4, duration: .6 },
  ];
  let queued = false, previous = null;
  const clamp = value => Math.max(0, Math.min(1, value));

  function paint() {
    queued = false;
    panel.classList.toggle('has-house-assembly', !reduced.matches);
    const progress = reduced.matches ? 1 : clamp(
      (innerHeight * .42 - panel.getBoundingClientRect().top) / (innerHeight * 1.02)
    );
    if (progress === previous) return;
    previous = progress;
    const travel = innerWidth < 768 ? .6 : 1;
    // Keep the floating roof away from the panel's entering top edge, then
    // return the completed house to its established centered composition.
    const entrySpace = innerWidth < 768 ? 48 : 80;
    const entryRemaining = 1 - progress * progress * (3 - 2 * progress);
    panel.style.setProperty('--house-entry-offset', `${entrySpace * entryRemaining}px`);
    pieces.forEach((piece, index) => {
      const placement = placements[index];
      const t = clamp((progress - placement.start) / placement.duration);
      // Smoothstep keeps both the pickup and the final placement calm.
      const remaining = 1 - t * t * (3 - 2 * t);
      if (!remaining) { piece.removeAttribute('transform'); return; }
      piece.setAttribute('transform',
        `translate(${placement.x * remaining * travel} ${placement.y * remaining * travel}) ` +
        `rotate(${placement.angle * remaining * travel} ${piece.dataset.pivot})`);
    });
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { previous = null; schedule(); });
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', () => { previous = null; schedule(); });
  new ResizeObserver(schedule).observe(panel);
  document.fonts.ready.then(schedule);
  paint();
})();
