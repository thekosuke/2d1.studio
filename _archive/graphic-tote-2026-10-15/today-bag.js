/* Native click/tap disclosure, with a reversible mouse-only preview. */
(() => {
  const bag = document.getElementById('today-bag');
  if (!bag) return;
  const toggle = bag.querySelector('summary');
  function stopPreview() {
    bag.classList.remove('is-peeking');
  }
  toggle.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    bag.classList.add('is-peeking');
  });
  toggle.addEventListener('pointerleave', stopPreview);
  // Clicking a preview pins it open; clicking an open bag always closes it,
  // even while the mouse remains over the illustration.
  toggle.addEventListener('click', () => {
    if (bag.open) stopPreview();
  });
  bag.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    bag.open = false;
    stopPreview();
  });
  window.addEventListener('blur', stopPreview);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPreview();
  });
})();
