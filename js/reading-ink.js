/* Shared word-by-word reveal for explicitly marked editorial body copy. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Preserve the real heading and emphasis; wrap only text for reading ink.
  const inkBlocks = [...document.querySelectorAll('[data-ink]')].map(block => {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const words = [];
    const segmenter = document.documentElement.lang === 'ja' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter('ja', {granularity: 'word'}) : null;
    const linkedUnits = new Set();
    nodes.forEach(node => {
      // Keep marked linked phrases together so spaces share one underline.
      const link = node.parentElement.closest('a.familiar-characters, a[data-ink-link]');
      if (link) {
        if (!linkedUnits.has(link)) {
          linkedUnits.add(link);
          const unit = document.createElement('span');
          unit.className = 'ink';
          link.replaceWith(unit);
          unit.append(link);
          words.push(unit);
        }
        return;
      }
      const parts = segmenter ? [...segmenter.segment(node.textContent)].map(part => part.segment)
        : node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.append(part); return; }
        const word = document.createElement('span');
        word.className = 'ink';
        word.textContent = part;
        words.push(word);
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    // The closing square is the final reveal unit, just like the final word.
    block.querySelectorAll('.essay-end').forEach(marker => {
      const unit = document.createElement('span');
      unit.className = 'ink';
      marker.replaceWith(unit);
      unit.append(marker);
      words.push(unit);
    });
    block.classList.add('is-inking');
    return {block, words, lines: []};
  });
  // Cache visual lines after reflow, retaining the original emphasis markup.
  function measureLines() {
    inkBlocks.forEach(ink => {
      const blockTop = ink.block.getBoundingClientRect().top;
      ink.lines = [];
      ink.words.forEach(word => {
        const box = word.getBoundingClientRect();
        let line = ink.lines.at(-1);
        if (!line || Math.abs(box.top - blockTop - line.top) > 2) {
          line = {top: box.top - blockTop, center: box.top + box.height / 2 - blockTop, words: []};
          ink.lines.push(line);
        }
        line.words.push(word);
      });
    });
    queueInk();
  }
  let inkQueued = false;
  function inkIn() {
    inkQueued = false;
    inkBlocks.forEach(ink => {
      const box = ink.block.getBoundingClientRect();
      if (ink.block.hasAttribute('data-section-ink')) {
        // Keep the upcoming section dim, then sweep through its words as it
        // approaches the active reading edge. Native reverse scroll unwinds it.
        const end = (parseFloat(getComputedStyle(ink.block).scrollMarginTop) || innerHeight * .2) + 2;
        const start = Math.max(innerHeight * .5, end + 80);
        const progress = reduced.matches ? 1
          : Math.max(0, Math.min(1, (start - box.top) / (start - end)));
        const wave = 8;
        const cursor = progress * (ink.words.length + wave - 1);
        ink.words.forEach((word, index) => {
          const amount = Math.max(0, Math.min(1, (cursor - index) / wave));
          word.style.setProperty('--word-opacity', String(.25 + .75 * amount));
          word.classList.toggle('is-inked', amount === 1);
        });
        return;
      }
      // Continue the reading cursor through sticky Shop and house-intro underlays.
      const lead = ink.block.closest('[data-bag-cover-lead], .about-story-lead, .home-house-lead');
      const flowTop = lead
        ? lead.parentElement.getBoundingClientRect().top + box.top - lead.getBoundingClientRect().top + (parseFloat(lead.style.getPropertyValue('--reading-reveal-offset')) || 0)
        : box.top;
      ink.lines.forEach(line => {
        // Each line reads from 75vh to 55vh, finishing inside the 50–60% band.
        const center = flowTop + line.center;
        const progress = reduced.matches ? 1
          : Math.max(0, Math.min(1, (innerHeight * .75 - center) / (innerHeight * .2)));
        const cursor = progress * line.words.length;
        line.words.forEach((word, index) => {
          const amount = Math.max(0, Math.min(1, cursor - index));
          word.style.setProperty('--word-opacity', String(.25 + .75 * amount));
          word.classList.toggle('is-inked', amount === 1);
        });
      });
    });
  }
  const queueInk = () => { if (!inkQueued) { inkQueued = true; requestAnimationFrame(inkIn); } };
  if (inkBlocks.length) {
    addEventListener('scroll', queueInk, {passive: true});
    addEventListener('resize', measureLines);
    reduced.addEventListener('change', queueInk);
    document.fonts.ready.then(measureLines);
    // Recalculate when the About essay unfolds or type reflows after loading.
    const resize = new ResizeObserver(measureLines);
    inkBlocks.forEach(ink => resize.observe(ink.block));
    const essay = document.querySelector('.essay-body');
    if (essay) new MutationObserver(queueInk).observe(essay, {attributes: true, attributeFilter: ['class']});
    measureLines();
  }
})();
