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

/* Native layering lets the diagram rise over the completed opening paragraph. */
(() => {
  const scene = document.querySelector('.about-story-scene');
  if (!scene) return;
  const lead = scene.querySelector('.about-story-lead');
  const copy = lead.querySelector('.essay-lede:last-child');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function measure() {
    queued = false;
    if (reduced.matches) { scene.classList.remove('has-about-cover'); return; }
    const bottom = copy.getBoundingClientRect().bottom - lead.getBoundingClientRect().top;
    const trailing = lead.offsetHeight - bottom;
    scene.style.setProperty('--about-lead-top', `${innerHeight * .6 - bottom}px`);
    scene.style.setProperty('--about-cover-gap', `${Math.max(64, innerHeight * .4 - trailing)}px`);
    scene.classList.add('has-about-cover');
  }
  const schedule = () => {
    if (!queued) { queued = true; requestAnimationFrame(measure); }
  };
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(lead);
  document.fonts.ready.then(schedule);
  schedule();
})();

/* Fixed chrome follows the ground beneath it, without shifting its geometry. */
(() => {
  const panel = document.querySelector('.about-story-page .design-house');
  const logo = document.querySelector('.about-docked-logo');
  if (!panel || !logo) return;
  const mark = logo.querySelector('img');
  const red = mark.src;
  const light = new URL('logo_beige.svg', red).href;
  let queued = false, onPanel = false;
  function paint() {
    queued = false;
    const grounds = [document.querySelector('.essay-head'), panel].map(el => el.getBoundingClientRect());
    const over = element => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      return grounds.some(ground => ground.top <= center && ground.bottom > center);
    };
    const logoBox = logo.getBoundingClientRect();
    const logoCenter = logoBox.top + logoBox.height / 2;
    // Beige only over the red header; the dark diagram keeps the red mark.
    const next = grounds[0].top <= logoCenter && grounds[0].bottom > logoCenter;
    if (next !== onPanel) {
      onPanel = next;
      mark.src = next ? light : red;
      logo.classList.toggle('is-on-diagram', next);
    }
    document.querySelectorAll('.page-nav a').forEach(link => link.classList.toggle('is-on-diagram', over(link)));
    const language = document.querySelector('body > .language-switch');
    if (language) {
      language.classList.toggle('is-on-diagram', over(language));
      const center = language.getBoundingClientRect().top + language.offsetHeight / 2;
      language.style.setProperty('--toggle-dark-ground', grounds[0].bottom > center ? 'var(--red)' : 'var(--studio-background)');
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
