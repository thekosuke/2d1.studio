/* Mobile disclosure keeps each page's existing navigation and desktop layout. */
(() => {
  const trigger = document.querySelector('.mobile-nav-toggle');
  const panel = trigger && document.getElementById(trigger.getAttribute('aria-controls'));
  if (!trigger || !panel) return;
  const mobile = matchMedia('(max-width: 767px), (max-width: 1023px) and (max-height: 500px) and (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const isFinds = panel.classList.contains('finds-page-nav');
  const desktopTrigger = document.querySelector('.finds-home-trigger');
  const logo = document.querySelector('.site-logo');
  const language = document.querySelector('.language-switch:not(.work-footer-language), .objects-language');
  // Shared footer content stays inside the disclosure on every route.
  const assetBase = new URL('../img/brand/logo_white.svg', document.currentScript.src).href;
  const menuMark = document.createElement('div');
  menuMark.className = 'mobile-menu-mark';
  const markImage = document.createElement('img');
  markImage.src = assetBase; markImage.alt = '2D1'; markImage.width = 829; markImage.height = 280;
  menuMark.append(markImage); panel.prepend(menuMark);
  const menuFooter = document.createElement('div');
  menuFooter.className = 'mobile-menu-footer';
  const copyright = document.createElement('p');
  copyright.textContent = `© ${new Date().getFullYear()} 2D1`;
  const socialMarkup = "<nav class=\"social-links\" aria-label=\"Social media\"><a href=\"https://www.instagram.com/2d1.studio/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"2D1 on Instagram (opens in a new tab)\"><svg viewBox=\"0 0 9 9\" aria-hidden=\"true\" focusable=\"false\" shape-rendering=\"crispEdges\"><g fill=\"currentColor\"><rect x=\"1\" y=\"0\" width=\"7\" height=\"1\"/><rect x=\"0\" y=\"1\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"1\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"2\" width=\"1\" height=\"1\"/><rect x=\"6\" y=\"2\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"2\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"3\" width=\"3\" height=\"1\"/><rect x=\"8\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"2\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"6\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"2\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"6\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"6\" width=\"3\" height=\"1\"/><rect x=\"8\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"7\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"7\" width=\"1\" height=\"1\"/><rect x=\"1\" y=\"8\" width=\"7\" height=\"1\"/></g></svg><span class=\"social-platform\" aria-hidden=\"true\">Instagram</span></a><a href=\"https://www.threads.com/@2d1.studio\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"2D1 on Threads (opens in a new tab)\"><svg viewBox=\"0 0 9 9\" aria-hidden=\"true\" focusable=\"false\" shape-rendering=\"crispEdges\"><g fill=\"currentColor\"><rect x=\"2\" y=\"0\" width=\"5\" height=\"1\"/><rect x=\"1\" y=\"1\" width=\"1\" height=\"1\"/><rect x=\"7\" y=\"1\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"2\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"2\" width=\"3\" height=\"1\"/><rect x=\"8\" y=\"2\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"2\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"6\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"2\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"5\" y=\"4\" width=\"2\" height=\"1\"/><rect x=\"8\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"5\" width=\"2\" height=\"1\"/><rect x=\"6\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"8\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"0\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"1\"/><rect x=\"1\" y=\"7\" width=\"1\" height=\"1\"/><rect x=\"2\" y=\"8\" width=\"6\" height=\"1\"/></g></svg><span class=\"social-platform\" aria-hidden=\"true\">Threads</span></a><a href=\"https://x.com/2d1_studio\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"2D1 on X (opens in a new tab)\"><svg viewBox=\"0 0 9 9\" aria-hidden=\"true\" focusable=\"false\" shape-rendering=\"crispEdges\"><g fill=\"currentColor\"><rect x=\"0.5\" y=\"0.5\" width=\"2\" height=\"1\"/><rect x=\"7.5\" y=\"0.5\" width=\"1\" height=\"1\"/><rect x=\"1.5\" y=\"1.5\" width=\"2\" height=\"1\"/><rect x=\"6.5\" y=\"1.5\" width=\"1\" height=\"1\"/><rect x=\"2.5\" y=\"2.5\" width=\"2\" height=\"1\"/><rect x=\"5.5\" y=\"2.5\" width=\"1\" height=\"1\"/><rect x=\"3.5\" y=\"3.5\" width=\"2\" height=\"1\"/><rect x=\"3.5\" y=\"4.5\" width=\"3\" height=\"1\"/><rect x=\"2.5\" y=\"5.5\" width=\"1\" height=\"1\"/><rect x=\"4.5\" y=\"5.5\" width=\"2\" height=\"1\"/><rect x=\"1.5\" y=\"6.5\" width=\"1\" height=\"1\"/><rect x=\"5.5\" y=\"6.5\" width=\"2\" height=\"1\"/><rect x=\"0.5\" y=\"7.5\" width=\"1\" height=\"1\"/><rect x=\"6.5\" y=\"7.5\" width=\"2\" height=\"1\"/></g></svg><span class=\"social-platform\" aria-hidden=\"true\">X</span></a><a href=\"https://www.linkedin.com/company/newfiction-org/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"New Fiction on LinkedIn (opens in a new tab)\"><svg viewBox=\"0 0 9 9\" aria-hidden=\"true\" focusable=\"false\" shape-rendering=\"crispEdges\"><g fill=\"currentColor\"><rect x=\"1\" y=\"1\" width=\"1\" height=\"1\"/><rect x=\"1\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"5\" y=\"3\" width=\"2\" height=\"1\"/><rect x=\"1\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"4\" width=\"2\" height=\"1\"/><rect x=\"7\" y=\"4\" width=\"1\" height=\"1\"/><rect x=\"1\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"7\" y=\"5\" width=\"1\" height=\"1\"/><rect x=\"1\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"7\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"1\" y=\"7\" width=\"1\" height=\"1\"/><rect x=\"3\" y=\"7\" width=\"1\" height=\"1\"/><rect x=\"7\" y=\"7\" width=\"1\" height=\"1\"/></g></svg><span class=\"social-platform\" aria-hidden=\"true\">LinkedIn</span></a></nav>";
  const existingSocials = document.querySelector('.social-links');
  if (existingSocials) menuFooter.append(existingSocials.cloneNode(true));
  else menuFooter.innerHTML = socialMarkup;
  const menuSocials = menuFooter.querySelector('.social-links');
  menuSocials.setAttribute('aria-label', document.documentElement.lang === 'ja' ? 'ソーシャルメディア' : 'Social media');
  menuFooter.prepend(copyright); panel.append(menuFooter);
  const languageHome = language?.parentElement, languageNext = language?.nextSibling;
  const duration = 480, step = 0;
  let background = [];
  function lockBackground(locked) {
    document.body.classList.toggle('mobile-menu-open', locked);
    document.documentElement.classList.toggle('mobile-menu-open', locked);
    if (locked) {
      background = [...document.body.children].filter(node => !node.contains(panel) && !node.contains(trigger));
      background = background.map(node => [node, node.inert]);
      background.forEach(([node]) => { node.inert = true; });
    } else {
      background.forEach(([node, inert]) => { node.inert = inert; });
      background = [];
    }
  }
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
    const target = mobile.matches ? menuFooter : languageHome;
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
    lockBackground(false);
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
    lockBackground(true);
    items[0]?.focus({preventScroll: true});
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
    if (event.key === 'Tab' && open) {
      const focusable = [trigger, ...items.filter(item => !item.disabled && !item.inert && item.getClientRects().length)];
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); trigger.focus(); }
    }
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
