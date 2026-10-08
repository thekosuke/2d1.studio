/* Familiar Characters: native scroll, with a quiet, optional conveyor. */
(() => {
  const root = document.querySelector('[data-conveyor]');
  if (!root) return;
  const belt = root.querySelector('.characters-belt');
  const track = root.querySelector('.characters-track');
  const set = root.querySelector('.characters-set');
  const button = root.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, hovered = false, focused = false, visible = false;
  let frame = 0, last = 0, position = 0, clone;
  const running = () => !reduced.matches && !paused && !hovered && !focused && visible && !document.hidden;
  function tick(time) {
    if (!running()) { frame = 0; last = 0; return; }
    if (last) {
      position += Math.min(time - last, 64) * .026;
      const width = set.getBoundingClientRect().width;
      if (width) position %= width;
      belt.scrollLeft = position;
    }
    last = time;
    frame = requestAnimationFrame(tick);
  }
  function update() {
    if (running() && !frame) {
      position = belt.scrollLeft;
      last = 0;
      frame = requestAnimationFrame(tick);
    }
    button.innerHTML = paused ? 'Resume motion <span aria-hidden="true">→</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  }
  function preference() {
    if (reduced.matches) {
      clone?.remove(); clone = null;
      button.hidden = true;
    } else {
      if (!clone) {
        clone = set.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.inert = true;
        track.append(clone);
      }
      button.hidden = false;
    }
    update();
  }
  button.addEventListener('click', () => { paused = !paused; update(); });
  belt.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; update(); } });
  belt.addEventListener('pointerleave', () => { hovered = false; update(); });
  // Touch/manual scrolling stays still until the visitor explicitly resumes.
  belt.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') { paused = true; update(); } });
  belt.addEventListener('wheel', () => { paused = true; update(); }, { passive: true });
  belt.addEventListener('focusin', () => { focused = true; update(); });
  belt.addEventListener('focusout', () => { focused = false; update(); });
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(belt);
  reduced.addEventListener('change', preference);
  preference();
})();
