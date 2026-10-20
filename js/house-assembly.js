/* A native-scroll camera journey: assemble, enter Studio, cross into Shop.
   No wheel/touch interception. Short viewports get enough travel to read each room. */
(() => {
  const journey = document.querySelector('.house-journey');
  if (!journey) return;
  const viewport = journey.querySelector('.house-viewport');
  const panel = journey.querySelector('.design-house');
  const diagram = panel.querySelector('svg');
  const homeViewBox = diagram.getAttribute('viewBox');
  const pieces = [...panel.querySelectorAll('[data-house-piece]')];
  const rooms = journey.querySelector('.about-services');
  const studio = rooms.children[0], shop = rooms.children[1];
  const heading = studio.querySelector('h2');
  const label = pieces[0].querySelector('.house-room-label');
  // A single SVG label bridges the diagram and the real, semantic heading.
  const ns = 'http://www.w3.org/2000/svg';
  const bridge = document.createElementNS(ns, 'svg');
  bridge.classList.add('house-title-bridge');
  bridge.setAttribute('aria-hidden', 'true');
  const movingLabel = label.cloneNode(true);
  movingLabel.removeAttribute('transform');
  movingLabel.setAttribute('text-anchor', 'start');
  movingLabel.textContent = heading.textContent;
  bridge.append(movingLabel); viewport.append(bridge);
  const baseline = document.createElement('span');
  baseline.className = 'house-title-baseline';
  baseline.setAttribute('aria-hidden', 'true'); heading.append(baseline);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { const t = clamp(n); return t*t*(3-2*t); };
  const placements = [
    {x:-100,y:10,angle:-12,start:0,duration:.55},
    {x:110,y:50,angle:12,start:.15,duration:.55},
    {x:20,y:-90,angle:-6,start:.4,duration:.6}
  ];
  let queued = false, metrics, assembled = false;
  function measure() {
    journey.classList.toggle('has-room-journey', !reduced.matches);
    if (reduced.matches) {
      assembled = true;
      bridge.style.display = 'none'; label.style.visibility = ''; heading.style.opacity = '';
      journey.style.height = '';
      diagram.setAttribute('viewBox', homeViewBox); panel.style.opacity = '';
      rooms.style.cssText = ''; rooms.classList.remove('is-entered');
      [studio,shop].forEach(room => room.style.removeProperty('--room-y'));
      pieces.forEach(piece => piece.removeAttribute('transform'));
      schedule(); return;
    }
    const h = viewport.clientHeight;
    const studioTravel = Math.max(0, studio.firstElementChild.offsetHeight-h);
    const shopTravel = Math.max(0, shop.firstElementChild.offsetHeight-h);
    const reveal = h*2.15;
    const cross = reveal + studioTravel + h*.9;
    const shopStart = cross + h*1.25;
    metrics = {h, studioTravel, shopTravel, reveal, cross, shopStart};
    journey.style.height = `${shopStart+shopTravel+h*1.8}px`;
    schedule();
  }
  function paint() {
    queued = false;
    if (reduced.matches || !metrics) return;
    const {h,studioTravel,shopTravel,reveal,cross,shopStart} = metrics;
    const distance = -journey.getBoundingClientRect().top;
    const entrance = clamp((distance+h*.42)/(h*1.02));
    // Assembly is an entrance, not part of the reversible camera journey.
    // Once seated, keep every piece seated when revisiting the house.
    assembled ||= entrance === 1;
    const assembly = assembled ? 1 : entrance;
    pieces.forEach((piece,index) => {
      const p = placements[index], remain = 1-ease((assembly-p.start)/p.duration);
      if (!remain) piece.removeAttribute('transform');
      else piece.setAttribute('transform',`translate(${p.x*remain} ${p.y*remain}) rotate(${p.angle*remain} ${piece.dataset.pivot})`);
    });
    const zoom = ease((distance-h*.95)/(h*1.2));
    // Move the SVG camera rather than scaling its composited surface. The
    // viewport stays fixed, so zoomed clipping cannot persist on the way back.
    const scale = Math.pow(14,zoom);
    const width = 730/scale, height = 720/scale;
    const centerX = 224.5+(395-224.5)*(1-zoom)/scale;
    const centerY = 466.5+(360-466.5)*(1-zoom)/scale;
    diagram.setAttribute('viewBox', `${centerX-width/2} ${centerY-height/2} ${width} ${height}`);
    const appear = ease((distance-h*1.85)/(h*.3));
    panel.style.opacity = `${1-appear}`;
    rooms.style.setProperty('--rooms-opacity',appear);
    rooms.classList.toggle('is-entered',appear>.95);
    const across = ease((distance-cross)/(h*1.25));
    rooms.style.setProperty('--rooms-x',`${-50*across}%`);
    studio.style.setProperty('--room-y',`${-Math.min(studioTravel,Math.max(0,distance-reveal-h*.25))}px`);
    shop.style.setProperty('--room-y',`${-Math.min(shopTravel,Math.max(0,distance-shopStart-h*.25))}px`);
    const morph = ease((distance-h*1.15)/h);
    const bridging = distance >= h*1.15 && distance < reveal;
    bridge.style.display = bridging ? 'block' : 'none';
    label.style.visibility = distance >= h*1.15 ? 'hidden' : '';
    heading.style.opacity = distance < reveal ? '0' : '';
    if (bridging) {
      const frame = viewport.getBoundingClientRect();
      const matrix = label.getScreenCTM();
      const bounds = label.getBBox();
      const destination = heading.getBoundingClientRect();
      const type = getComputedStyle(heading);
      const size = parseFloat(type.fontSize)/36;
      // The block's shear relaxes to upright type, while its baseline moves
      // precisely onto the heading baseline. No duplicate-title crossfade.
      const mix = (a,b) => a+(b-a)*morph;
      const sourceX = matrix.a*bounds.x + matrix.e-frame.left;
      const sourceY = matrix.b*bounds.x + matrix.f-frame.top;
      movingLabel.setAttribute('transform', `matrix(${mix(matrix.a,size)} ${mix(matrix.b,0)} ${mix(matrix.c,0)} ${mix(matrix.d,size)} ${mix(sourceX,destination.left-frame.left+parseFloat(type.paddingLeft))} ${mix(sourceY,baseline.getBoundingClientRect().top-frame.top)})`);
      movingLabel.style.letterSpacing = `${(parseFloat(type.letterSpacing)||0)/size*morph}px`;
      movingLabel.style.fill = `rgb(${255-5*morph},${255-15*morph},${255-25*morph})`;
    }
    // Shared chrome checks the actual visible room after the camera has moved.
    dispatchEvent(new Event('about-ground-change'));
  }
  function schedule() { if (!queued) { queued=true; requestAnimationFrame(paint); } }
  // Keyboard traversal brings a room's link into view without horizontal browser scrolling.
  rooms.addEventListener('focusin',event => {
    if (reduced.matches || !metrics || !event.target.closest('a')) return;
    const inShop = shop.contains(event.target);
    const destination = inShop ? metrics.shopStart+metrics.shopTravel+metrics.h*.25 : metrics.reveal+metrics.studioTravel+metrics.h*.25;
    scrollTo({top:scrollY+journey.getBoundingClientRect().top+destination,behavior:'instant'});
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  reduced.addEventListener('change',measure);
  new ResizeObserver(measure).observe(studio.firstElementChild);
  new ResizeObserver(measure).observe(shop.firstElementChild);
  document.fonts.ready.then(measure);
  measure();
})();
