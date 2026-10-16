/* Discrete inspection points. Specifications never participate in interaction state. */
(() => {
  const study = document.querySelector('.bag-study');
  if (!study) return;
  const points = [...study.querySelectorAll('.bag-hotspot')];
  // Reserve one stable note lane below the image on narrow screens, including Japanese copy.
  const image = study.querySelector('.bag-study-image');
  const sizeNotes = () => {
    const height = Math.max(...points.map(point => point.querySelector('.bag-hotspot-tip').getBoundingClientRect().height));
    study.style.setProperty('--bag-tip-space', `${Math.ceil(height) + 24}px`);
  };
  new ResizeObserver(sizeNotes).observe(image);
  document.fonts.ready.then(sizeNotes);
  let active = null;
  let pinned = false;
  let closeTimer;
  let hoverDismissed = null;
  let inspectMotion = () => {};
  const show = (point, pin = false) => {
    clearTimeout(closeTimer);
    active = point;
    pinned = pin;
    inspectMotion(Boolean(point));
    points.forEach(item => {
      item.open = item === point;
      item.querySelector('summary').setAttribute('aria-expanded', String(item.open));
    });
  };
  points.forEach(point => {
    const button = point.querySelector('summary');
    button.setAttribute('aria-expanded', 'false');
    point.addEventListener('pointerenter', event => {
      clearTimeout(closeTimer);
      if (event.pointerType === 'mouse' && !pinned && hoverDismissed !== point) show(point);
    });
    point.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && active === point && !pinned) {
        closeTimer = setTimeout(() => { if (active === point && !pinned) show(null); }, 180);
      }
    });
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) show(point);
    });
    button.addEventListener('click', event => {
      event.preventDefault();
      const closing = active === point && pinned;
      hoverDismissed = closing ? point : null;
      show(closing ? null : point, !closing);
    });
    point.addEventListener('focusout', event => {
      if (!point.contains(event.relatedTarget) && active === point && !pinned) show(null);
    });
  });
  document.addEventListener('pointermove', event => {
    if (hoverDismissed && !hoverDismissed.contains(event.target)) hoverDismissed = null;
  });
  document.addEventListener('pointerdown', event => {
    if (active && !event.target.closest('.bag-hotspot')) show(null);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) { hoverDismissed = active; show(null); }
  });
  window.addEventListener('blur', () => show(null));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) show(null);
  });
  // A suspended photograph: rotation around the strap tip, with a smaller,
  // delayed shear suggesting fabric give. No new views or continuous idle loop.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const stage = study.querySelector('.bag-study-stage');
  let frame = 0, previous = 0, inView = true, inspecting = false;
  let angle = 0, speed = 0, flex = 0, flexSpeed = 0, target = 0;
  let width = image.clientWidth, height = image.clientHeight;
  const anchors = points.map(point => ({
    button: point.querySelector('summary'),
    x: parseFloat(point.style.getPropertyValue('--x')) / 100,
    y: parseFloat(point.style.getPropertyValue('--y')) / 100
  }));
  const paint = () => {
    const r = angle * Math.PI / 180, shear = Math.tan(flex * Math.PI / 180);
    const a = Math.cos(r), b = Math.sin(r), c = a * shear - b, d = b * shear + a;
    image.style.setProperty('--bag-motion', `matrix(${a},${b},${c},${d},0,0)`);
    const ox = width * .5, oy = height * .015;
    anchors.forEach(({button,x,y}) => {
      const px = x * width - ox, py = y * height - oy;
      button.style.setProperty('--motion-x', `${(a - 1) * px + c * py}px`);
      button.style.setProperty('--motion-y', `${b * px + (d - 1) * py}px`);
    });
  };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const reset = () => {
    stop(); angle = speed = flex = flexSpeed = target = 0; paint();
  };
  const enabled = () => !reduced.matches && finePointer.matches && inView && !document.hidden;
  const tick = time => {
    frame = 0;
    if (!enabled() || inspecting) return;
    const dt = Math.min((time - (previous || time - 16.67)) / 1000, .032);
    previous = time;
    speed += ((target - angle) * 65 - speed * 12) * dt;
    angle += speed * dt;
    const flexTarget = Math.max(-.65, Math.min(.65, -speed * .035));
    flexSpeed += ((flexTarget - flex) * 90 - flexSpeed * 15) * dt;
    flex += flexSpeed * dt;
    paint();
    if (Math.abs(target-angle) + Math.abs(speed) + Math.abs(flex) + Math.abs(flexSpeed) > .006) {
      frame = requestAnimationFrame(tick);
    } else { angle = target; speed = flex = flexSpeed = 0; previous = 0; paint(); }
  };
  const start = () => { if (!frame && enabled() && !inspecting) frame = requestAnimationFrame(tick); };
  inspectMotion = open => {
    inspecting = open;
    if (open) { stop(); speed = flexSpeed = 0; }
    else { target = 0; start(); }
  };
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !enabled() || inspecting) return;
    const rect = image.getBoundingClientRect();
    target = -Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * 2.8;
    start();
  }, {passive:true});
  stage.addEventListener('pointerleave', () => { target = 0; start(); });
  new ResizeObserver(() => { width = image.clientWidth; height = image.clientHeight; reset(); }).observe(image);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (!inView) reset(); }).observe(image);
  reduced.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
})();
