/* The bar, on every page: the menu on phones, the logo's glances on inner
 * pages, and a clean address when another page links to a section of the home
 * page (/#studio lands on Studio, then the #studio is dropped, as it is for
 * links within the page). */
(() => {
  const bar = document.querySelector('.bar');
  if (!bar) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Menu. Open, the rest of the page is inert until it closes: a link, the
   * button, Escape, or a tap on the empty part of the panel. */
  const button = bar.querySelector('.bar-menu');
  const nav = bar.querySelector('.bar-nav');
  const phone = window.matchMedia('(max-width: 699px)');
  function setMenu(open, returnFocus) {
    bar.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('has-menu', open);
    [...document.body.children].forEach((el) => {
      if (el !== bar && el.tagName !== 'SCRIPT') el.inert = open;
    });
    if (!open && returnFocus) button.focus();
  }
  if (button && nav) {
    button.addEventListener('click', () => setMenu(!bar.classList.contains('is-open')));
    // Close before the page acts on the link (the home page scrolls to its section).
    nav.addEventListener('click', (event) => {
      if (bar.classList.contains('is-open') && (event.target === nav || event.target.closest('a'))) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && bar.classList.contains('is-open')) setMenu(false, true);
    });
    phone.addEventListener('change', () => {
      if (!phone.matches && bar.classList.contains('is-open')) setMenu(false);
    });
    // Coming back through the history with the menu open, start closed.
    window.addEventListener('pageshow', () => {
      if (bar.classList.contains('is-open')) setMenu(false);
    });
  }

  /* On inner pages the logo sits in the bar. Like the home page's, its eyes
   * are closed; every few seconds they open, glance one way, and close. */
  const mark = document.querySelector('.bar-logo');
  if (mark) {
    const peek = () => {
      if (!reducedMotion.matches && !document.hidden) {
        mark.classList.add('is-awake');
        mark.style.setProperty('--glance', `${Math.random() < 0.5 ? -1 : 1}`);
        window.setTimeout(() => mark.classList.add('is-glancing'), 380);
        window.setTimeout(() => mark.classList.remove('is-glancing'), 900);
        window.setTimeout(() => mark.classList.remove('is-awake'), 1250);
      }
      window.setTimeout(peek, 4200 + Math.random() * 3200);
    };
    window.setTimeout(peek, 2400);
  }

  /* Arriving at the home page with a section in the address. */
  if (location.hash && document.querySelector('.hero')) {
    let target = null;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (error) { /* a malformed hash */ }
    if (target) {
      const land = () => {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        history.replaceState(history.state, '', location.pathname + location.search);
        const email = target.id === 'updates' ? document.getElementById('email') : null;
        const focusable = email || target;
        if (!email && !focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1');
        focusable.focus({ preventScroll: true });
      };
      if (document.readyState === 'complete') land();
      else window.addEventListener('load', land, { once: true });
    }
  }
})();
