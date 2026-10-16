/* Native disclosures retain all design notes when JavaScript is unavailable. */
(() => {
  const study = document.querySelector('.bag-study');
  if (!study) return;
  study.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const feature = event.target.closest('.bag-feature[open]');
    if (!feature) return;
    feature.open = false;
    feature.querySelector('summary').focus();
  });
})();
