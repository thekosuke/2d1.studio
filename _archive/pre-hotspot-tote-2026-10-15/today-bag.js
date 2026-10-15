/* Hover is a temporary inspection; native disclosure supports touch and keyboard. */
(() => {
  const study = document.querySelector('.bag-study-disclosure');
  if (!study) return;
  const toggle = study.querySelector('summary');
  const stopPreview = () => study.classList.remove('is-peeking');
  toggle.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') study.classList.add('is-peeking');
  });
  toggle.addEventListener('pointerleave', stopPreview);
  toggle.addEventListener('click', () => {
    if (study.open) stopPreview();
  });
  study.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      study.open = false;
      stopPreview();
    }
  });
  window.addEventListener('blur', stopPreview);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPreview();
  });
})();
