/* Explicit allowlist: do not add navigation, language, text CTAs or media controls. */
(() => {
  const groups = [
    ['.objects-dialog-link', 'red'],
    ['.contact-page .contact-send', 'outline-red'],
    ['.objects-info', 'white'],
    ['.tote-spec-trigger', 'beige'],
    ['.objects-save', 'save'],
    ['.objects-info-close,.objects-dialog-close,.work-close,.tote-spec-close,.contact-close', 'close'],
    ['.objects-search-suggestions button', 'white'],
    ['.objects-search-chip-remove', 'chip'],
    ['#contact .chip > span', 'choice'],
    ['.objects-zoom button', 'beige'],
    ['.objects-reset', 'utility'],
    ['.objects-save-shortcut', 'brown']
  ];
  const units = new Set();
  function measure(unit) {
    if(unit.dataset.controlFill === 'close' && unit.parentElement) unit.style.setProperty('--control-close-ink',getComputedStyle(unit.parentElement).color);
    const box = unit.getBoundingClientRect();
    if (!box.height) return;
    unit.style.setProperty('--control-height', box.height + 'px');
    unit.style.setProperty('--control-marker-offset', ((box.height - parseFloat(getComputedStyle(unit, '::before').height)) / 2) + 'px');
    unit.querySelectorAll('[data-control-icon],.send-arrow').forEach(icon => {
      icon.style.setProperty('--control-offset', (box.bottom - icon.getBoundingClientRect().bottom) + 'px');
    });
  }
  const resize = new ResizeObserver(entries => entries.forEach(({target}) => measure(target)));
  function register() {
    for (const unit of units) if (!unit.isConnected) { resize.unobserve(unit); units.delete(unit); }
    for (const [selector,kind] of groups) document.querySelectorAll(selector).forEach(unit => {
      if (units.has(unit)) return;
      if (kind === 'close') unit.style.setProperty('--control-close-ink',getComputedStyle(unit).color);
      unit.dataset.controlFill = kind;
      unit.querySelectorAll('span').forEach(span => {
        const cs = getComputedStyle(span);
        if (cs.maskImage !== 'none' || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) span.dataset.controlIcon = '';
        else if (span.textContent.trim()) span.dataset.controlLabel = '';
      });
      // These cross drawings use SVG or pseudo-elements instead of a mask.
      unit.querySelectorAll('svg,.contact-x').forEach(icon => { icon.dataset.controlIcon = ''; icon.dataset.controlCross = ''; });
      units.add(unit); resize.observe(unit); measure(unit);
    });
  }
  register();
  new MutationObserver(register).observe(document.body,{childList:true,subtree:true});
  document.fonts?.ready.then(() => units.forEach(measure));
  document.addEventListener('pointerover',event => { const unit=event.target.closest('[data-control-fill]'); if(unit)measure(unit); });
  document.addEventListener('focusin',event => { const unit=event.target.closest('[data-control-fill]'); if(unit)measure(unit); });
})();
