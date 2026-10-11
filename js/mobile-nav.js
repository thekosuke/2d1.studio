/* Mobile disclosure keeps each page's existing navigation and desktop layout. */
(() => {
  const trigger = document.querySelector('.mobile-nav-toggle');
  const panel = trigger && document.getElementById(trigger.getAttribute('aria-controls'));
  if (!trigger || !panel) return;
  // Home keeps its page links in a horizontal bar at compact widths.
  if (document.body.classList.contains('home-page')) return;
  const mobile = matchMedia('(max-width: 767px), (max-width: 1023px) and (max-height: 500px) and (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const isFinds = panel.classList.contains('finds-page-nav');
  const desktopTrigger = document.querySelector('.finds-home-trigger');
  const logo = document.querySelector('.site-logo');
  const language = document.querySelector('.language-switch, .objects-language');
  const languageHome = language?.parentElement, languageNext = language?.nextSibling;
  const duration = 260, step = 44;
  let items = [], total = duration;
  let available = !document.body.classList.contains('home-page') || panel.classList.contains('is-visible');
  let open = false, closing = 0;
  function refreshItems() {
    const next = [...panel.querySelectorAll('a,button')];
    items.filter(item => !next.includes(item)).forEach(item => item.classList.remove('mobile-nav-item'));
    items = next;
    total = duration + Math.max(0, items.length - 1) * step;
    items.forEach((item, index) => {
      item.classList.add('mobile-nav-item');
      item.style.setProperty('--mobile-nav-enter', `${index * step}ms`);
      item.style.setProperty('--mobile-nav-exit', `${(items.length - 1 - index) * step}ms`);
    });
  }
  function moveLanguage() {
    if (!language) return;
    const target = mobile.matches ? panel : languageHome;
    if (language.parentElement !== target) {
      if (!mobile.matches && languageNext?.parentElement === target) target.insertBefore(language, languageNext);
      else target.append(language);
    }
    language.classList.add('mobile-nav-language');
  }
  panel.classList.add('mobile-nav-panel');
  const settle = () => {
    clearTimeout(closing); closing = 0;
    panel.classList.remove('is-mobile-closing');
  };
  function close(restoreFocus = false, instant = false) {
    if (restoreFocus && (panel.contains(document.activeElement) || document.activeElement === trigger)) {
      (mobile.matches && available ? trigger : (desktopTrigger || logo))?.focus({preventScroll: true});
    }
    const wasOpen = open;
    open = false;
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-mobile-open');
    settle();
    if (mobile.matches) panel.inert = true;
    if (wasOpen && mobile.matches && !instant && !reduced.matches) {
      panel.classList.add('is-mobile-closing');
      closing = setTimeout(settle, total);
    }
  }
  function show() {
    if (!mobile.matches || !available || document.querySelector('dialog[open]')) return;
    settle(); open = true;
    trigger.setAttribute('aria-expanded', 'true');
    panel.inert = false;
    panel.classList.add('is-mobile-open');
  }
  function setAvailable(next) {
    available = next;
    trigger.classList.toggle('is-visible', available);
    trigger.inert = !mobile.matches || !available;
    if (!available) close(true, true);
    panel.inert = mobile.matches ? !open || !available : !available || isFinds;
    if (language) language.inert = !available;
  }
  function syncMode() {
    const focused = document.activeElement;
    const languageFocus = language?.contains(focused);
    const ownedFocus = panel.contains(focused) || focused === trigger || focused === desktopTrigger;
    // Reset the desktop hover controller before this controller assigns inert.
    panel.dispatchEvent(new Event('mobile-navigation-modechange'));
    close(false, true);
    moveLanguage(); refreshItems();
    setAvailable(available);
    if (ownedFocus || languageFocus) {
      const target = mobile.matches ? (available ? trigger : logo)
        : (languageFocus && available ? focused : (desktopTrigger || (available && panel.contains(focused) ? focused : logo)));
      target?.focus({preventScroll: true});
    }
  }
  // The Contact drawer keeps this live target if orientation changes while open.
  const returnFocus = {focus(options) { (mobile.matches && available ? trigger : (desktopTrigger || logo))?.focus(options); }};
  panel.mobileNavigation = {setAvailable, refreshItems, returnFocus, get active() { return mobile.matches; }};
  document.body.classList.add('mobile-navigation-ready');
  trigger.addEventListener('click', () => { if (open) close(true); else show(); });
  trigger.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' || !mobile.matches || !available) return;
    event.preventDefault(); show();
    if (open) items[0]?.focus({preventScroll: true});
  });
  // Capture runs before Contact stores its return target and opens the dialog.
  panel.addEventListener('click', event => {
    if (!mobile.matches || !event.target.closest('a,button') || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    trigger.focus({preventScroll: true});
    close(false);
  }, true);
  document.addEventListener('pointerdown', event => {
    if (open && !panel.contains(event.target) && !trigger.contains(event.target)) close(true);
  });
  document.addEventListener('focusin', event => {
    if (open && !panel.contains(event.target) && !trigger.contains(event.target)) close(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !open || document.querySelector('dialog[open]')) return;
    event.preventDefault(); close(true);
  });
  // BFCache and history traversal should never revive an expanded stale panel.
  addEventListener('pageshow', () => close(true, true));
  addEventListener('pagehide', () => close(true, true));
  addEventListener('popstate', () => close(true, true));
  mobile.addEventListener('change', syncMode);
  reduced.addEventListener('change', () => { if (reduced.matches) settle(); });
  syncMode();
})();
