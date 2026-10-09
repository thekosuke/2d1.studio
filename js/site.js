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
  if (!document.body.classList.contains('about-page') && ['2d1.studio','www.2d1.studio'].includes(location.hostname)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    gtag('js',new Date()); gtag('config','G-7YBDBXJWCG');
    const script=document.createElement('script'); script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id=G-7YBDBXJWCG'; document.head.append(script);
  }
})();
