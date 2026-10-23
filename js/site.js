/* Shared navigation: native scrolling, clean addresses, explicit focus. */
(() => {
  // Use the usable viewport width so the edge rules exclude scrollbars.
  const measureViewport = () => document.documentElement.style.setProperty('--viewport-width', `${document.body.clientWidth}px`);
  measureViewport();
  addEventListener('resize', measureViewport);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function land(target, behavior) {
    target.scrollIntoView({behavior, block: 'start'});
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    land(target, reduced.matches ? 'instant' : 'smooth');
  });
  function arrival() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = id && document.getElementById(id);
    if (!target) return;
    land(target, 'instant');
    history.replaceState(history.state, '', location.pathname + location.search);
  }
  if (document.readyState === 'complete') arrival();
  else window.addEventListener('load', arrival, {once:true});
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  if (['2d1.studio','www.2d1.studio'].includes(location.hostname)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    gtag('js',new Date()); gtag('config','G-7YBDBXJWCG');
    const script=document.createElement('script'); script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id=G-7YBDBXJWCG'; document.head.append(script);
  }
})();

// Measure the essay heading for its viewport-relative arrival position.
(() => {
  const heading = document.querySelector('.about-essay-page .essay-head');
  if (!heading) return;
  const measure = () => document.body.style.setProperty('--essay-head-half-height', `${heading.getBoundingClientRect().height / 2}px`);
  new ResizeObserver(measure).observe(heading);
  measure();
  document.fonts.ready.then(measure);
})();

/* Measure one sweep from the first label glyph through the icon's far edge. */
(() => {
  const units = new Map();
  function measure(unit, icon) {
    const box = unit.getBoundingClientRect();
    if (!box.width) return;
    const walker = document.createTreeWalker(unit, NodeFilter.SHOW_TEXT);
    const textRects = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || node.parentElement.closest('.pixel-arrow,[hidden],[aria-hidden="true"]')) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      textRects.push(...range.getClientRects());
    }
    if (!textRects.length) return;
    const start = Math.min(...textRects.map(rect => rect.left));
    const textEnd = Math.max(...textRects.map(rect => rect.right));
    let iconLeft, end;
    if (icon) {
      const rect = icon.getBoundingClientRect();
      iconLeft = rect.left;
      end = Math.max(textEnd, rect.right);
    } else {
      const pseudo = getComputedStyle(unit, '::after');
      iconLeft = textEnd + (parseFloat(getComputedStyle(unit).columnGap) || 0) + (parseFloat(pseudo.marginLeft) || 0);
      end = iconLeft + (parseFloat(pseudo.width) || 0);
    }
    unit.style.setProperty('--text-sweep-start', `${start - box.left}px`);
    unit.style.setProperty('--text-sweep-width', `${end - start}px`);
    (icon || unit).style.setProperty('--text-sweep-icon-offset', `${iconLeft - start}px`);
  }
  const observer = new ResizeObserver(entries => entries.forEach(entry => measure(entry.target, units.get(entry.target))));
  function register() {
    document.querySelectorAll('a .pixel-arrow,button .pixel-arrow').forEach(icon => {
      const unit = icon.closest('a,button');
      if (!units.has(unit)) { units.set(unit, icon); observer.observe(unit); }
    });
    document.querySelectorAll('.shop-card-action,.work-view').forEach(unit => {
      if (!units.has(unit)) { units.set(unit, null); observer.observe(unit); }
    });
    units.forEach((icon, unit) => measure(unit, icon));
  }
  register();
  document.fonts?.ready.then(register);
  // Drawers and project views can add controls after the initial page load.
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1))) register();
  }).observe(document.body, {childList:true, subtree:true});
  document.addEventListener('pointerover', event => {
    const unit = event.target.closest('a,button,summary');
    if (!unit) return;
    if (units.has(unit)) measure(unit, units.get(unit));
    unit.querySelectorAll('.shop-card-action,.work-view').forEach(item => measure(item, null));
  }, {passive:true});
})();
