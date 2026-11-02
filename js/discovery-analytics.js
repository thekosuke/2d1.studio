/* Reuse the site's existing GA property on its public domain only. */
(() => {
  if (!['2d1.studio', 'www.2d1.studio'].includes(location.hostname) || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', 'G-7YBDBXJWCG');
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-7YBDBXJWCG';
  document.head.append(script);
})();
