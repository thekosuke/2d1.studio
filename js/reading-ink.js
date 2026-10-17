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
    nodes.forEach(node => {
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
      // Continue the reading cursor through sticky Shop and About underlays.
      const lead = ink.block.closest('[data-bag-cover-lead], .about-story-lead');
      const flowTop = lead
        ? lead.parentElement.getBoundingClientRect().top + box.top - lead.getBoundingClientRect().top
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
