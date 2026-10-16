/* Discrete inspection points. Specifications never participate in interaction state. */
(() => {
  const study = document.querySelector('.bag-study');
  if (!study) return;
  const points = [...study.querySelectorAll('.bag-hotspot')];
  // Reserve one stable note lane below the image on narrow screens, including Japanese copy.
  const image = study.querySelector('.bag-study-image');
  const sizeNotes = () => {
    const height = Math.max(...points.map(point => point.querySelector('.bag-hotspot-tip').getBoundingClientRect().height));
    study.style.setProperty('--bag-tip-space', `${Math.ceil(height) + 24}px`);
  };
  new ResizeObserver(sizeNotes).observe(image);
  document.fonts.ready.then(sizeNotes);
  let active = null;
  let pinned = false;
  let closeTimer;
  let hoverDismissed = null;
  const show = (point, pin = false) => {
    clearTimeout(closeTimer);
    active = point;
    pinned = pin;
    points.forEach(item => {
      item.open = item === point;
      item.querySelector('summary').setAttribute('aria-expanded', String(item.open));
    });
  };
  points.forEach(point => {
    const button = point.querySelector('summary');
    button.setAttribute('aria-expanded', 'false');
    point.addEventListener('pointerenter', event => {
      clearTimeout(closeTimer);
      if (event.pointerType === 'mouse' && !pinned && hoverDismissed !== point) show(point);
    });
    point.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && active === point && !pinned) {
        closeTimer = setTimeout(() => { if (active === point && !pinned) show(null); }, 180);
      }
    });
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) show(point);
    });
    button.addEventListener('click', event => {
      event.preventDefault();
      const closing = active === point && pinned;
      hoverDismissed = closing ? point : null;
      show(closing ? null : point, !closing);
    });
    point.addEventListener('focusout', event => {
      if (!point.contains(event.relatedTarget) && active === point && !pinned) show(null);
    });
  });
  document.addEventListener('pointermove', event => {
    if (hoverDismissed && !hoverDismissed.contains(event.target)) hoverDismissed = null;
  });
  document.addEventListener('pointerdown', event => {
    if (active && !event.target.closest('.bag-hotspot')) show(null);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) { hoverDismissed = active; show(null); }
  });
  window.addEventListener('blur', () => show(null));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) show(null);
  });
})();
