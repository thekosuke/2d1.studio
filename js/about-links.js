/* Run after reading-ink so each link remains a single reveal/underline unit. */
(() => {
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(document.documentElement.lang, {granularity: 'grapheme'}) : null;
  document.querySelectorAll('.about-essay-page .essay a[href]').forEach(link => {
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const parts = nodes.map(node => ({node, letters: segmenter
      ? [...segmenter.segment(node.textContent)].map(part => part.segment)
      : Array.from(node.textContent)}));
    const count = parts.reduce((total, part) => total + part.letters.filter(letter => !/\s/.test(letter)).length, 0);
    const step = Math.min(18, 240 / Math.max(1, count - 1));
    let index = 0;
    parts.forEach(({node, letters}) => {
      const fragment = document.createDocumentFragment();
      letters.forEach(letter => {
        // Keep real spaces and native inline wrapping, without duplicate text.
        if (/\s/.test(letter)) { fragment.append(letter); return; }
        const span = document.createElement('span');
        span.className = 'link-letter';
        span.style.setProperty('--letter-delay', `${index++ * step}ms`);
        span.textContent = letter;
        fragment.append(span);
      });
      node.replaceWith(fragment);
    });
  });
})();

// Reflect the reading position; site.js owns clean-hash scrolling and focus.
(() => {
  const links = [...document.querySelectorAll('.about-section-switch a')];
  const headings = links.map(link => document.getElementById(link.hash.slice(1)));
  if (!links.length || headings.some(heading => !heading)) return;
  let pending = false;
  function update() {
    pending = false;
    const reading = document.querySelector('.essay-page .essay');
    const switchBottom = document.querySelector('.about-section-switch').getBoundingClientRect().bottom;
    reading.style.setProperty('--about-header-edge', `${switchBottom - reading.getBoundingClientRect().top}px`);
    const edge = parseFloat(getComputedStyle(headings[0]).scrollMarginTop) + 2;
    let active = 0;
    headings.forEach((heading, index) => {
      if (heading.getBoundingClientRect().top <= edge) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  update();
})();
