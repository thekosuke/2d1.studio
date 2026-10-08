/* Load the existing tote only when the compact preview approaches the viewport. */
(() => {
  const stage = document.getElementById('tote-preview-stage');
  if (!stage) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  async function mount() {
    if (started || reducedMotion.matches) return;
    started = true;
    try {
      const { mountTote } = await import('./tote.js?v=3');
      if (reducedMotion.matches) { started = false; return; }
      mountTote({ stage, reducedMotion, presentation: 'contained' });
      stage.classList.add('is-ready');
    } catch {
      // The original rendered poster stays visible if WebGL or the CDN is unavailable.
      stage.querySelector('.tote-canvas')?.remove();
      stage.classList.remove('is-ready');
    }
  }
  let near = false;
  const observer = new IntersectionObserver(([entry]) => {
    near = entry.isIntersecting;
    if (near) mount();
  }, { rootMargin: '300px' });
  observer.observe(stage);
  reducedMotion.addEventListener('change', () => { if (near) mount(); });
})();
