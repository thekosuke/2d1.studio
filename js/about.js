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
  let queued = false;
  function paint() {
    queued = false;
    const roomsVisible = document.querySelector('.about-services.is-entered');
    const studioRoom = document.querySelector('.about-room-studio');
    const surfaces = [roomsVisible ? studioRoom : panel];
    if (!document.querySelector('.has-room-journey')) surfaces.push(studioRoom);
    const grounds = surfaces.filter(Boolean).map(el => el.getBoundingClientRect());
    const over = element => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const x = rect.left + rect.width / 2;
      return grounds.some(ground => ground.top <= center && ground.bottom > center && ground.left <= x && ground.right > x);
    };
    document.querySelectorAll('.page-nav a').forEach(link => link.classList.toggle('is-on-diagram', over(link)));
    const language = document.querySelector('body > .language-switch');
    if (language) {
      language.classList.toggle('is-on-diagram', over(language));
      language.style.setProperty('--toggle-dark-ground', 'var(--studio-background)');
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('about-ground-change', schedule);
  addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
