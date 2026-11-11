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

})();

// Measure the essay heading for its viewport-relative arrival position.
(() => {
  const heading = document.querySelector('.about-essay-page .essay-head');
  if (!heading) return;
  const measure = () => document.body.style.setProperty('--essay-head-half-height', `${heading.getBoundingClientRect().height / 2}px`);
  new ResizeObserver(measure).observe(heading);
  measure();
  document.fonts.ready.then(measure);
})();

/* Measure one sweep from the first label glyph through the icon's far edge. */
(() => {
  const units = new Map();
  function measure(unit, icon) {
    const box = unit.getBoundingClientRect();
    if (!box.width) return;
    const walker = document.createTreeWalker(unit, NodeFilter.SHOW_TEXT);
    const textRects = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const excluded = node.parentElement.closest('.pixel-arrow,[hidden],[aria-hidden="true"]');
      if (!node.textContent.trim() || (excluded && excluded !== unit && unit.contains(excluded))) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      textRects.push(...range.getClientRects());
    }
    if (!textRects.length) return;
    const start = Math.min(...textRects.map(rect => rect.left));
    const textEnd = Math.max(...textRects.map(rect => rect.right));
    let iconLeft, end;
    if (icon) {
      const rect = icon.getBoundingClientRect();
      iconLeft = rect.left;
      end = Math.max(textEnd, rect.right);
    } else {
      const pseudo = getComputedStyle(unit, '::after');
      iconLeft = textEnd + (parseFloat(getComputedStyle(unit).columnGap) || 0) + (parseFloat(pseudo.marginLeft) || 0);
      end = iconLeft + (parseFloat(pseudo.width) || 0);
    }
    unit.style.setProperty('--text-sweep-start', `${start - box.left}px`);
    unit.style.setProperty('--text-sweep-width', `${end - start}px`);
    (icon || unit).style.setProperty('--text-sweep-icon-offset', `${iconLeft - start}px`);
  }
  const observer = new ResizeObserver(entries => entries.forEach(entry => measure(entry.target, units.get(entry.target))));
  function register() {
    document.querySelectorAll('a .pixel-arrow,button .pixel-arrow').forEach(icon => {
      const unit = icon.closest('a,button');
      if (!units.has(unit)) { units.set(unit, icon); observer.observe(unit); }
    });
    document.querySelectorAll('.work-related-caption').forEach(unit => {
      if (!units.has(unit)) { units.set(unit, unit.querySelector('.work-related-arrow')); observer.observe(unit); }
    });
    document.querySelectorAll('.shop-card-action,.work-view').forEach(unit => {
      if (!units.has(unit)) { units.set(unit, null); observer.observe(unit); }
    });
    units.forEach((icon, unit) => measure(unit, icon));
  }
  register();
  document.fonts?.ready.then(register);
  // Drawers and project views can add controls after the initial page load.
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1))) register();
  }).observe(document.body, {childList:true, subtree:true});
  document.addEventListener('pointerover', event => {
    const unit = event.target.closest('a,button,summary');
    if (!unit) return;
    if (units.has(unit)) measure(unit, units.get(unit));
    unit.querySelectorAll('.shop-card-action,.work-view').forEach(item => measure(item, null));
  }, {passive:true});
})();

/* One photograph travels between the selected card and the project hero. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected;
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const cards = () => [...document.querySelectorAll('.practice-card-link, .work-related-card')];
  const name = (image, returning) => {
    if (!image) return;
    document.documentElement.classList.add('project-image-transition');
    document.documentElement.classList.toggle('project-image-return', returning);
    image.style.viewTransitionName = 'project-hero';
    return () => {
      image.style.viewTransitionName = '';
      document.documentElement.classList.remove('project-image-transition', 'project-image-return');
    };
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    selected = event.target.closest('.practice-card-link, .work-related-card');
    const close = event.target.closest('.case-toolbar .work-close');
    const origin = read('project-image-origin');
    if (close && origin?.project === location.href) close.href = origin.page;
  });
  addEventListener('pageswap', event => {
    if (!event.viewTransition || reduced.matches) return;
    const destination = event.activation?.entry?.url;
    const origin = read('project-image-origin');
    let image, returning = false;
    if (selected && destination === selected.href) {
      image = selected.querySelector('img');
      write('project-image-origin', {page:location.href, project:selected.href, y:scrollY, source:image.currentSrc || image.src});
    } else if (origin?.project === location.href && destination === origin.page) {
      returning = true;
      // Closing from any point returns the hero to its original card.
      scrollTo({top:0, behavior:'instant'});
      image = document.querySelector('.work-detail-hero > img');
    } else return;
    write('project-image-arrival', {url:destination, returning});
    const clean = name(image, returning);
    event.viewTransition.finished.finally(() => clean?.());
  });
  addEventListener('pagereveal', event => {
    const arrival = read('project-image-arrival');
    write('project-image-arrival', null);
    if (!event.viewTransition || reduced.matches || arrival?.url !== location.href) return;
    const origin = read('project-image-origin');
    let image;
    if (arrival.returning) {
      scrollTo({top:origin.y, behavior:'instant'});
      image = cards().find(card => card.href === origin.project)?.querySelector('img');
    } else {
      scrollTo({top:0, behavior:'instant'});
      image = document.querySelector('.case-page .work-detail-hero > img');
      if (image && origin?.source) {
        image.removeAttribute('srcset');
        image.src = origin.source;
      }
    }
    const clean = name(image, arrival.returning);
    event.viewTransition.finished.finally(() => clean?.());
  });
})();

/* Standalone projects retain the immersive dialog's scroll-aware toolbar. */
(() => {
  const toolbar = document.querySelector('.case-page .case-toolbar');
  if (!toolbar) return;
  const art = [...document.querySelectorAll('.work-detail-hero, .work-detail-image, .work-project-ending')];
  let last = scrollY, direction = 0, distance = 0;
  const contrast = () => {
    const y = toolbar.offsetHeight / 2;
    toolbar.classList.toggle('is-over-art', art.some(el => {
      const box = el.getBoundingClientRect();
      return box.top <= y && box.bottom > y && el.dataset.artTone !== 'light';
    }));
  };
  const show = () => { toolbar.classList.remove('is-scroll-hidden'); toolbar.classList.toggle('is-returned', scrollY > 4); toolbar.inert = false; };
  addEventListener('scroll', () => {
    contrast();
    const top = Math.max(0, scrollY), delta = top - last;
    last = top;
    if (top <= 4 || innerHeight + top >= document.documentElement.scrollHeight - 4) { show(); return; }
    if (!delta) return;
    if (Math.sign(delta) !== direction) { direction = Math.sign(delta); distance = 0; }
    distance += Math.abs(delta);
    if (distance < 8) return;
    if (direction < 0 || toolbar.contains(document.activeElement)) show();
    else { toolbar.classList.add('is-scroll-hidden'); toolbar.inert = true; }
  }, {passive:true});
  addEventListener('keydown', event => { if (event.key === 'Tab') show(); });
  addEventListener('resize', contrast);
  addEventListener('load', contrast);
  contrast();
})();

/* Carry the previous sidebar selection across navigation, then release it with
   the same CSS transition as hover-out. aria-current always names the new page. */
(() => {
  const key = 'previous-page-nav';
  addEventListener('pageswap', () => {
    const current = document.querySelector('#page-navigation a[aria-current]');
    try { sessionStorage.setItem(key, current?.href || ''); } catch {}
  });
  addEventListener('pagereveal', event => {
    let previous;
    try { previous = sessionStorage.getItem(key); sessionStorage.removeItem(key); } catch {}
    if (!previous || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const link = [...document.querySelectorAll('#page-navigation a')].find(a => a.href === previous && !a.hasAttribute('aria-current'));
    if (!link) return;
    link.classList.add('is-nav-leaving');
    const release = () => requestAnimationFrame(() => requestAnimationFrame(() => link.classList.remove('is-nav-leaving')));
    if (event.viewTransition) event.viewTransition.finished.then(release, release);
    else release();
  });
})();

/* Keep the upward page wipe when native cross-document transitions are skipped. */
(() => {
  const key = 'page-wipe-destination';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cover, animation;
  const clear = () => { animation?.cancel(); cover?.remove(); cover = null; };
  let destination;
  try { destination = sessionStorage.getItem(key); sessionStorage.removeItem(key); } catch {}
  if (destination === location.href && !reduced.matches) {
    cover = document.createElement('div');
    cover.className = 'page-wipe-fallback';
    cover.setAttribute('aria-hidden', 'true');
    document.body.append(cover);
    requestAnimationFrame(() => {
      if (!cover) return;
      animation = cover.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}], {
        duration:480, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards'
      });
      animation.finished.then(clear, () => {});
    });
  }
  addEventListener('pagereveal', event => { if (event.viewTransition) clear(); });
  addEventListener('pagehide', clear);
  reduced.addEventListener('change', () => { if (reduced.matches) clear(); });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.download || (link.target && link.target !== '_self')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || target.pathname === location.pathname && target.search === location.search) return;
    // Modal handlers get first refusal; normal navigation remains entirely native.
    queueMicrotask(() => {
      if (event.defaultPrevented || reduced.matches) return;
      try { sessionStorage.setItem(key, target.href); } catch {}
    });
  });
})();

/* Contact eyes follow the pointer; the original image remains the no-JS fallback. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointer = null;
  function paint() {
    frame = 0;
    document.querySelectorAll('.ending-contact-eyes').forEach(eye => {
      const box = eye.getBoundingClientRect();
      if (!box.width || box.bottom < 0 || box.top > innerHeight) return;
      if (eye.tagName === 'IMG') {
        if (!pointer || reduced.matches) return;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 116 48');
        svg.setAttribute('width', '116');
        svg.setAttribute('height', '48');
        svg.setAttribute('class', 'ending-contact-eyes');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.innerHTML = '<path fill="#FF2B00" d="M12 0h24v12h12v24H36v12H12V36H0V12h12zM80 0h24v12h12v24h-12v12H80V36H68V12h12z"/><g class="ending-eye-pupils" fill="#FAF0E6"><path d="M11.7949 12.0938h12v12h-12zM79.7949 12.0938h12v12h-12z"/></g>';
        eye.replaceWith(svg);
        eye = svg;
      }
      const pupils = eye.querySelector('.ending-eye-pupils');
      if (!pupils) return;
      const x = pointer && !reduced.matches ? 6 + 6 * Math.tanh((pointer.x - box.left - box.width / 2) / 180) : 0;
      const y = pointer && !reduced.matches ? 6 + 6 * Math.tanh((pointer.y - box.top - box.height / 2) / 180) : 0;
      pupils.setAttribute('transform', `translate(${x} ${y})`);
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reduced.matches) return;
    pointer = {x:event.clientX, y:event.clientY};
    schedule();
  }, {passive:true});
  function reset() { pointer = null; schedule(); }
  document.documentElement.addEventListener('pointerleave', reset);
  addEventListener('blur', reset);
  addEventListener('scroll', () => { if (pointer) schedule(); }, {passive:true});
  reduced.addEventListener('change', reset);
})();

/* Keep a viewport language control outside scrolling/footer containers. */
(() => {
  if (document.body.matches('.practice-collection-page,.objects-page')) return;
  let frame = 0;
  function sync() {
    frame = 0;
    const dialog = document.querySelector('#work-dialog[open]');
    const host = dialog || document.body;
    let toggle = host.querySelector(':scope > .persistent-language');
    if (!toggle) {
      const source = host.querySelector('.site-footer .language-switch') || document.querySelector('.language-switch');
      if (!source) return;
      toggle = source.cloneNode(true);
      toggle.className = 'language-switch persistent-language';
      toggle.removeAttribute('id');
      toggle.querySelectorAll('a').forEach((a, i) => { a.href = source.querySelectorAll('a')[i].href; });
      host.append(toggle);
    }
    const box = toggle.getBoundingClientRect();
    const below = document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      .find(el => !el.closest('.persistent-language'));
    let dark = false;
    for (let el = below; el; el = el.parentElement) {
      if (el.dataset.artTone) { dark = el.dataset.artTone === 'dark'; break; }
      const color = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if (color && (color.length < 4 || color[3] > .9)) {
        dark = color[0] * .2126 + color[1] * .7152 + color[2] * .0722 < 140;
        break;
      }
    }
    toggle.classList.toggle('on-dark-surface', dark);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(sync); }
  addEventListener('scroll', schedule, {capture:true, passive:true});
  addEventListener('resize', schedule);
  new MutationObserver(schedule).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['open']});
  sync();
})();
