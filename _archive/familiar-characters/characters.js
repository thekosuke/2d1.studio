/* Familiar Characters. The pages are complete without this; it adds the House
 * (js/house.js, loaded the first time it's opened), opens each Character over
 * the collection instead of on its own page, and moves between Characters. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const script = document.currentScript;
  const grid = document.querySelector('.fc-grid');
  const dialog = document.querySelector('.fc-dialog');       // the index
  const page = document.querySelector('main.fc-sheet');       // a Character's own page
  const sheet = dialog ? dialog.querySelector('.fc-sheet') : page;
  const status = document.getElementById('fc-sheet-status');
  const indexURL = dialog ? location.href.split(/[?#]/)[0] : new URL('../', location.href).href;
  const indexTitle = document.title;
  const wait = (ms) => new Promise((resolve) => { window.setTimeout(resolve, ms); });

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

  /* Sheets ---------------------------------------------------------------------
   * Every Character's page holds its sheet. The overlay borrows it: fetched
   * once (on hover, focus, or touch, so it's usually there before the click),
   * its links made absolute, dropped into the dialog. */
  const sheets = new Map();
  function absolute(root, base) {
    root.querySelectorAll('[href]').forEach((el) => el.setAttribute('href', new URL(el.getAttribute('href'), base).href));
    root.querySelectorAll('[src]').forEach((el) => el.setAttribute('src', new URL(el.getAttribute('src'), base).href));
    root.querySelectorAll('[srcset]').forEach((el) => {
      el.setAttribute('srcset', el.getAttribute('srcset').split(',').map((part) => {
        const [url, width] = part.trim().split(/\s+/);
        return `${new URL(url, base).href}${width ? ` ${width}` : ''}`;
      }).join(', '));
    });
  }
  function load(href) {
    const url = new URL(href, location.href).href;
    if (!sheets.has(url)) {
      sheets.set(url, fetch(url, { credentials: 'same-origin' })
        .then((response) => { if (!response.ok) throw new Error(`${response.status}`); return response.text(); })
        .then((text) => {
          const doc = new DOMParser().parseFromString(text, 'text/html');
          const main = doc.querySelector('main.fc-sheet');
          if (!main) throw new Error('No sheet');
          absolute(main, url);
          return { url, slug: main.dataset.slug, no: main.dataset.no, title: doc.title, main };
        })
        .catch((error) => { sheets.delete(url); throw error; }));
    }
    return sheets.get(url);
  }
  function preloadImage(data) {
    const img = data.main.querySelector('.fc-sheet-img');
    if (!img || data.preloaded) return;
    data.preloaded = true;
    const early = new Image();
    early.sizes = img.getAttribute('sizes');
    early.srcset = img.getAttribute('srcset');
    early.src = img.getAttribute('src');
  }
  function neighbours() {
    sheet.querySelectorAll('a.fc-sheet-step').forEach((a) => load(a.href).then(preloadImage).catch(() => {}));
  }
  function retag(el, tag) {
    const next = document.createElement(tag);
    [...el.attributes].forEach((a) => next.setAttribute(a.name, a.value));
    next.append(...el.childNodes);
    el.replaceWith(next);
  }
  function render(data) {
    const fresh = data.main.cloneNode(true);
    if (dialog) {   // in the dialog, a level under the index's own headings
      fresh.querySelectorAll('h2').forEach((h) => retag(h, 'h3'));
      fresh.querySelectorAll('h1').forEach((h) => retag(h, 'h2'));
    }
    sheet.replaceChildren(...fresh.childNodes);
    sheet.dataset.slug = data.slug;
    sheet.dataset.no = data.no;
  }

  /* Where a Character lives on the index right now: its square in the House,
   * or its picture in the grid. */
  function home(slug) {
    const house = document.querySelector('.fc-house:not([hidden])');
    if (house) return house.querySelector(`.fc-sq[data-slug="${slug}"]`);
    const card = document.querySelector(`.fc-card[data-slug="${slug}"]:not([hidden])`);
    return card ? card.querySelector('.fc-img') : null;
  }
  function visible(el) {
    if (!el || !el.isConnected) return false;
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
  }

  /* The photograph flies between its place on the index and the sheet. From
   * the House it leaves red and arrives in colour (and goes back red). */
  async function fly(source, direction) {
    const target = sheet.querySelector('.fc-sheet-img');
    if (reducedMotion.matches || !target || !visible(source)) return;
    const square = source.classList.contains('fc-sq');
    const sourceImg = square ? source.querySelector('.fc-sq-img') : source;
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const clone = document.createElement('div');
    clone.className = `fc-fly${square ? ' is-tinted' : ''}${square && sourceImg.classList.contains('is-cutout') ? ' is-contained' : ''}`;
    const first = new Image();
    first.alt = '';
    first.src = sourceImg.currentSrc || sourceImg.src;
    const colour = new Image();
    colour.alt = '';
    colour.className = 'fc-fly-colour';
    colour.sizes = target.sizes;
    colour.srcset = target.srcset;
    clone.append(first, colour);
    dialog.append(clone);
    const at = (box) => ({ left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    target.style.visibility = 'hidden';
    if (direction === 'in') {
      if (!square) clone.classList.add('is-developed');   // already in colour
      await clone.animate([at(from), at(to)], { duration: 560, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' }).finished;
      await Promise.race([colour.decode().catch(() => {}), wait(1200)]);
      clone.classList.add('is-developed');
      clone.classList.remove('is-tinted');
      if (square) await wait(520);
      target.style.visibility = '';
      clone.remove();
    } else {
      clone.classList.add('is-developed');
      if (square) window.requestAnimationFrame(() => { clone.classList.remove('is-developed'); clone.classList.add('is-tinted'); });
      await clone.animate([at(to), at(from)], { duration: 440, easing: 'cubic-bezier(.5, 0, .2, 1)', fill: 'forwards' }).finished;
      clone.remove();
    }
  }

  /* Open, move, close ------------------------------------------------------- */
  const state = { open: false, slug: '', busy: false, closing: false };
  let entering = 0;

  async function open(href, source, fromHistory) {
    if (!dialog) { location.href = href; return; }
    if (state.busy || state.closing) return;
    state.busy = true;
    const pending = load(href);
    const slow = window.setTimeout(() => dialog.classList.add('is-waiting'), 250);
    window.clearTimeout(entering);
    dialog.classList.remove('is-closing');
    dialog.classList.add('is-entering');
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('has-dialog');
    let data;
    try {
      data = await pending;
    } catch (error) {
      location.href = href;   // offline or missing: the page itself
      return;
    } finally {
      window.clearTimeout(slow);
      dialog.classList.remove('is-waiting');
    }
    render(data);
    state.open = true;
    state.slug = data.slug;
    if (!fromHistory) history.pushState({ fc: data.slug }, '', data.url);
    document.title = data.title;
    const title = sheet.querySelector('.fc-entry-title');
    if (title) title.focus({ preventScroll: true });
    entering = window.setTimeout(() => dialog.classList.remove('is-entering'), 1100);
    neighbours();
    await fly(source, 'in');
    state.busy = false;
  }

  async function step(link, direction) {
    if (!link || state.busy) return;
    state.busy = true;
    let data;
    try {
      data = await load(link.href);
    } catch (error) {
      location.href = link.href;
      return;
    }
    const d = direction === 'next' ? 1 : -1;
    const main = sheet.querySelector('.fc-sheet-main');
    const kept = document.activeElement && document.activeElement.closest('a.fc-sheet-step') ? direction : '';
    if (dialog) dialog.classList.remove('is-entering');
    if (main && !reducedMotion.matches) {
      await main.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-d * 36}px)` }],
        { duration: 160, easing: 'cubic-bezier(.5, 0, 1, 1)', fill: 'forwards' }).finished;
    }
    render(data);
    const fresh = sheet.querySelector('.fc-sheet-main');
    if (fresh && !reducedMotion.matches) {
      fresh.animate([{ opacity: 0, transform: `translateX(${d * 36}px)` }, { opacity: 1, transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    }
    sheet.scrollTop = 0;
    state.slug = data.slug;
    history.replaceState(dialog ? { fc: data.slug } : null, '', data.url);
    document.title = data.title;
    if (status) status.textContent = `No. ${data.no}, ${data.title.split(' — ')[0]}`;
    const again = kept && sheet.querySelector(`a.fc-sheet-${kept}`);
    (again || sheet.querySelector('.fc-entry-title')).focus({ preventScroll: true });
    neighbours();
    state.busy = false;
  }

  function close() {
    if (!state.open || state.closing) return;
    if (history.state && history.state.fc) { history.back(); return; }   // popstate finishes it
    finish();
  }

  async function finish() {
    if (!state.open || state.closing) return;
    state.closing = true;
    window.clearTimeout(entering);
    let source = home(state.slug);
    if (source && !visible(source)) {
      // You've moved on since opening: return to where this one lives.
      source.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    dialog.classList.remove('is-entering');
    dialog.classList.add('is-closing');
    await Promise.all([fly(source, 'out'), wait(reducedMotion.matches ? 0 : 380)]);
    dialog.close();
    dialog.classList.remove('is-closing');
    sheet.replaceChildren();
    document.documentElement.classList.remove('has-dialog');
    document.title = indexTitle;
    const focusable = source && (source.closest('.fc-card') ? source.closest('.fc-card').querySelector('.fc-card-link') : source.querySelector('a'));
    if (focusable) focusable.focus({ preventScroll: true });
    state.open = false;
    state.closing = false;
    state.busy = false;
    state.slug = '';
  }

  if (dialog) {
    // Open from the grid or the House, instead of going to the page.
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a.fc-card-link, a.fc-sq-link');
      if (!link) return;
      event.preventDefault();
      open(link.href, link.classList.contains('fc-sq-link') ? link.closest('.fc-sq') : link.closest('.fc-card').querySelector('.fc-img'));
    });
    const intent = (event) => {
      const link = event.target.closest && event.target.closest('a.fc-card-link, a.fc-sq-link');
      if (link) load(link.href).catch(() => {});
    };
    document.addEventListener('pointerover', intent, { passive: true });
    document.addEventListener('focusin', intent);
    document.addEventListener('touchstart', intent, { passive: true });

    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });   // the red around the sheet
    window.addEventListener('popstate', (event) => {
      const slug = event.state && event.state.fc;
      if (!slug && state.open) finish();
      else if (slug && !state.open) open(new URL(`${slug}/`, indexURL).href, home(slug), true);
    });
  }

  if (sheet) {
    sheet.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a');
      if (!link) return;
      if (dialog && (link.matches('[data-close]') || link.classList.contains('fc-sheet-index'))) {
        event.preventDefault();
        close();
      } else if (link.classList.contains('fc-sheet-step')) {
        event.preventDefault();
        step(link, link.classList.contains('fc-sheet-next') ? 'next' : 'prev');
      }
    });
    // Arrow keys step; on a Character's own page, Escape goes to the index.
    document.addEventListener('keydown', (event) => {
      if ((dialog && !state.open) || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); step(sheet.querySelector('a.fc-sheet-next'), 'next'); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(sheet.querySelector('a.fc-sheet-prev'), 'prev'); }
      if (event.key === 'Escape' && page) location.href = indexURL;
    });
    // Swipe the photograph for the next or previous one.
    sheet.addEventListener('pointerdown', (event) => {
      const figure = event.target.closest('.fc-sheet-figure');
      if (!figure || event.pointerType === 'mouse' || state.busy) return;
      const img = figure.querySelector('.fc-sheet-img');
      const x0 = event.clientX;
      const y0 = event.clientY;
      const t0 = performance.now();
      let dx = 0;
      let axis = '';
      const move = (e) => {
        dx = e.clientX - x0;
        if (!axis && Math.hypot(dx, e.clientY - y0) > 8) axis = Math.abs(dx) > Math.abs(e.clientY - y0) ? 'x' : 'y';
        if (axis === 'x') img.style.transform = `translateX(${dx * 0.85}px)`;
      };
      const end = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        img.style.transition = 'transform .25s cubic-bezier(.2, .8, .2, 1)';
        img.style.transform = '';
        window.setTimeout(() => { img.style.transition = ''; }, 260);
        const quick = Math.abs(dx) / (performance.now() - t0) > 0.5;
        if (axis === 'x' && (Math.abs(dx) > 70 || (quick && Math.abs(dx) > 30))) {
          step(sheet.querySelector(dx < 0 ? 'a.fc-sheet-next' : 'a.fc-sheet-prev'), dx < 0 ? 'next' : 'prev');
        }
      };
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
    if (page) neighbours();
  }

  /* Index or House --------------------------------------------------------------
   * The House is drawn from the grid's cards. The choice lasts for the visit;
   * ?view=house opens it directly (the address isn't changed). */
  const views = document.querySelector('.fc-views');
  const houseRoot = document.querySelector('.fc-house');
  let house = null;
  let houseLoading = null;
  async function setView(view, instant) {
    views.querySelectorAll('.fc-view-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    try { sessionStorage.setItem('fc-view', view); } catch (error) { /* private mode */ }
    if (view === 'house') {
      grid.hidden = true;
      houseRoot.hidden = false;
      if (!house) {
        houseLoading = houseLoading || import(new URL('house.js', script.src).href)
          .then((module) => module.createHouse(houseRoot, [...grid.querySelectorAll('.fc-card:not([hidden])')], { reducedMotion }));
        house = await houseLoading;
      }
      if (!houseRoot.hidden) house.show(instant);
    } else {
      if (house) house.hide();
      houseRoot.hidden = true;
      grid.hidden = false;
    }
  }
  if (views && houseRoot && grid) {
    views.hidden = false;
    views.closest('.fc-head').classList.add('has-views');
    views.addEventListener('click', (event) => {
      const button = event.target.closest('.fc-view-btn');
      if (button && button.getAttribute('aria-pressed') !== 'true') setView(button.dataset.view);
    });
    let remembered = '';
    try { remembered = sessionStorage.getItem('fc-view') || ''; } catch (error) { /* private mode */ }
    if (new URLSearchParams(location.search).get('view') === 'house' || remembered === 'house') setView('house', true);
  }

  /* Category filter (filters: category in collection.md). */
  const filter = document.querySelector('.fc-filter');
  if (filter) {
    const cards = [...document.querySelectorAll('.fc-index .fc-card')];
    const count = document.querySelector('.fc-count');
    const all = count.textContent;
    filter.hidden = false;
    filter.addEventListener('click', (event) => {
      const choice = event.target.closest('.fc-filter-btn');
      if (!choice) return;
      const value = choice.dataset.filter;
      filter.querySelectorAll('.fc-filter-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === choice)));
      let shown = 0;
      cards.forEach((card) => {
        const on = !value || card.dataset.category === value;
        card.hidden = !on;
        if (on) shown += 1;
      });
      count.textContent = value ? `${shown} of ${count.dataset.count}` : all;
      if (house) house.update(cards.filter((card) => !card.hidden));
    });
  }

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
