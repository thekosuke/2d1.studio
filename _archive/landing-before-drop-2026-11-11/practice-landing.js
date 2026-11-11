/* Show the centered landing mark and upward red wipe on the first Home visit of the session. */
(() => {
  const root = document.documentElement;
  const cover = document.querySelector('.practice-home > .landing-cover');
  if (!cover || !root.classList.contains('is-landing')) return;
  const mark = cover.querySelector('.landing-mark');
  const caption = cover.querySelector('.brand-caption');
  const captionText = caption.querySelector('span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const animations = [];
  let timer;
  const finish = () => {
    root.classList.remove('is-landing');
    clearTimeout(timer);
    listeners.abort();
    animations.forEach(animation => animation.cancel());
  };
  const options = {signal: listeners.signal, passive: true};
  ['wheel', 'touchstart', 'pointerdown', 'keydown', 'pagehide', 'resize'].forEach(type => {
    window.addEventListener(type, finish, options);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) finish();
  }, options);
  if (reduced.matches) return finish();

  const fitCaption = () => {
    captionText.style.removeProperty('--landing-caption-fit');
    const width = captionText.getBoundingClientRect().width;
    if (width) captionText.style.setProperty('--landing-caption-fit', mark.getBoundingClientRect().width / width);
  };
  fitCaption();
  document.fonts.ready.then(() => {
    if (listeners.signal.aborted) return;
    fitCaption();
    timer = setTimeout(() => {
      if (listeners.signal.aborted) return;
      const timing = {duration: 1100, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards'};
      cover.classList.add('is-departing');
      const fade = caption.animate([{opacity: 1}, {opacity: 0}], timing);
      animations.push(fade);
      fade.finished.then(finish, () => {});
    }, 1100);
  });
})();
