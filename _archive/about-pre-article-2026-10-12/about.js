/* About: under the short version, the essay waits folded under a fade. A click
 * on the fading lines (or Enter, once they're focused) unfolds it in place.
 * Without JavaScript the whole essay is simply there. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.querySelector('.essay-body');
  const rest = document.getElementById('essay-rest');
  const more = document.querySelector('.essay-more');

  if (body && rest && more) {
    body.classList.add('is-folded');
    more.hidden = false;
    const unfold = () => {
      if (!body.classList.contains('is-folded')) return;
      const from = rest.offsetHeight;
      body.classList.replace('is-folded', 'is-open');
      more.setAttribute('aria-expanded', 'true');
      more.hidden = true;
      const to = rest.offsetHeight;
      const done = () => body.classList.add('is-done');
      if (reducedMotion.matches) {
        done();
      } else {
        rest.animate([{ height: `${from}px` }, { height: `${to}px` }], {
          duration: Math.min(1400, 700 + (to - from) / 8),
          easing: 'cubic-bezier(.2, .8, .2, 1)',
        }).finished.then(done, done);
      }
      rest.setAttribute('tabindex', '-1');
      rest.focus({ preventScroll: true });
    };
    more.addEventListener('click', unfold);
    rest.addEventListener('focusin', unfold);   // a link inside it, reached with Tab
  }

  /* In-page links (Skip to content) move focus without adding #main to the address. */
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // The site's analytics property, on the production domain only.
  if (location.hostname === '2d1.studio' || location.hostname === 'www.2d1.studio') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-7YBDBXJWCG');
    const analytics = document.createElement('script');
    analytics.async = true;
    analytics.src = 'https://www.googletagmanager.com/gtag/js?id=G-7YBDBXJWCG';
    document.head.append(analytics);
  }
})();
