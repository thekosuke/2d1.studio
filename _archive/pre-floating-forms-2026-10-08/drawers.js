/* One motion/lifecycle for both native form dialogs. No form data handling. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new WeakMap();

  function prepare(dialog) {
    if (states.has(dialog)) return states.get(dialog);
    const state = { sheet: dialog.querySelector('.contact-sheet'), opener: null, cleanup: null };
    states.set(dialog, state);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(dialog); });
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('[data-close], [data-profile-close]')) close(dialog);
    });
    dialog.addEventListener('close', () => {
      state.cleanup?.();
      dialog.classList.remove('is-visible', 'is-closing');
      root.classList.remove('has-dialog', 'drawer-visible');
      state.opener?.focus({ preventScroll: true });
    });
    return state;
  }

  function open(dialog, opener) {
    if (dialog.open) return;
    const state = prepare(dialog);
    state.opener = opener;
    dialog.classList.remove('is-closing', 'is-visible');
    root.classList.add('has-dialog');
    dialog.showModal();
    state.sheet.scrollTop = 0;
    // Start at the heading: keyboard users can Tab through the form, and
    // phones do not resize around a keyboard during the entrance.
    const heading = dialog.querySelector('.contact-title');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    // Establish the off-screen start before transitioning both surfaces.
    state.sheet.getBoundingClientRect();
    root.classList.add('drawer-visible');
    dialog.classList.add('is-visible');
  }

  function close(dialog) {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    const state = prepare(dialog);
    dialog.classList.add('is-closing');
    dialog.classList.remove('is-visible');
    root.classList.remove('drawer-visible');
    if (reduced.matches) { dialog.close(); return; }
    // Keep the native modal/focus lock until the return motion has finished.
    const duration = parseFloat(getComputedStyle(state.sheet).transitionDuration) * 1000;
    let timer;
    const finish = () => { state.cleanup?.(); if (dialog.open) dialog.close(); };
    const ended = event => { if (event.target === state.sheet && event.propertyName === 'transform') finish(); };
    state.cleanup = () => {
      clearTimeout(timer);
      state.sheet.removeEventListener('transitionend', ended);
      state.cleanup = null;
    };
    state.sheet.addEventListener('transitionend', ended);
    timer = setTimeout(finish, duration + 80);
  }

  window.SiteDrawer = { open, close };
})();
