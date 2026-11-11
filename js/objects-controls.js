/* Keep continuous label/icon sweeps independent of retired Favorites. */
(() => {
  try { localStorage.removeItem('2d1-fc-saved-v1'); } catch {}
  let pending = false;
  const measure = () => {
    pending = false;
    document.querySelectorAll('.objects-page button,.objects-dialog-link').forEach(unit => {
      const box = unit.getBoundingClientRect();
      unit.style.setProperty('--fc-height', `${box.height}px`);
      unit.querySelectorAll('.pixel-external,.objects-product-arrow span,.objects-peek-arrow,.objects-info>span:last-child').forEach(icon => unit && icon.style.setProperty('--fc-offset', `${box.bottom-icon.getBoundingClientRect().bottom}px`));
    });
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(measure); } };
  new MutationObserver(schedule).observe(document.body, {childList:true,subtree:true});
  window.addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
