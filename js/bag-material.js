/* Keep native tap/keyboard disclosure; add desktop hover and dismissal. */
(() => {
  const info = document.querySelector('.material-info');
  if (!info) return;
  let pinned = false;
  info.querySelector('summary').addEventListener('click', event => {
    event.preventDefault();
    pinned = !pinned;
    info.open = pinned;
  });
  info.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') info.open = true;
  });
  info.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !pinned && !info.contains(document.activeElement)) info.open = false;
  });
  info.addEventListener('focusout', event => {
    if (!info.contains(event.relatedTarget)) { pinned = false; info.open = false; }
  });
  document.addEventListener('pointerdown', event => {
    if (!info.contains(event.target)) { pinned = false; info.open = false; }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && info.open) {
      pinned = false;
      info.open = false;
      if (info.contains(document.activeElement)) info.querySelector('summary').focus();
    }
  });
})();
