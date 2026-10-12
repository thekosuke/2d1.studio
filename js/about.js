/* About: a complete, continuously readable article. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
