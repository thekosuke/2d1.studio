/* Shared word-by-word reveal for explicitly marked editorial body copy. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heroCover = document.querySelector('.home-page > .masthead');
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
    return {block, words, count: -1};
  });
  // Non-overlapping scroll ranges keep a single reading cursor across blocks.
  function readingWindow(top, start, end, scroll, previousEnd, maxScroll) {
    const from = Math.min(maxScroll, Math.max(top + scroll - start, previousEnd));
    const to = Math.min(maxScroll, Math.max(from + 1, top + scroll - end));
    const progress = to <= from ? Number(scroll >= to)
      : Math.max(0, Math.min(1, (scroll - from) / (to - from)));
    return {progress, end: to};
  }
  let inkQueued = false;
  function inkIn() {
    inkQueued = false;
    const scroll = Math.max(0, scrollY);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    let previousEnd = -Infinity;
    inkBlocks.forEach(ink => {
      const box = ink.block.getBoundingClientRect();
      const coverBottom = ink.block.closest('.intro') && heroCover && !reduced.matches ? Math.max(0, heroCover.getBoundingClientRect().bottom) : 0;
      const start = innerHeight * .85 - coverBottom * .85;
      // Finish the whole block when its leading edge reaches mid-screen,
      // regardless of its height. readingWindow also clamps to the page end.
      const end = innerHeight * .5;
      const reading = readingWindow(box.top, start, end, scroll, previousEnd, maxScroll);
      previousEnd = reading.end;
      const progress = reduced.matches ? 1 : reading.progress;
      // The opening line reaches full opacity exactly when the cover reaches
      // 70vh, with a scroll-linked fade from 90vh and no time-based lag.
      if (ink.block.closest('.intro') && heroCover) {
        const firstWord = ink.words[0]?.getBoundingClientRect();
        const nextLine = firstWord
          ? ink.words.findIndex(word => word.getBoundingClientRect().top > firstWord.top + 2) : 0;
        const openingLength = nextLine === -1 ? ink.words.length : nextLine;
        if (openingLength !== ink.openingLength) {
          ink.openingLength = openingLength;
          ink.words.forEach((word, i) => word.classList.toggle('is-opening-line', i < openingLength));
        }
        const openingProgress = reduced.matches ? 1
          : Math.max(0, Math.min(1, (innerHeight * .9 - coverBottom) / (innerHeight * .2)));
        ink.block.style.setProperty('--opening-opacity', String(.25 + .75 * openingProgress));
      }
      // Drive opacity from scroll directly: a trailing timed fade would overlap
      // the next paragraph even after its predecessor's scroll range finishes.
      const cursor = progress * ink.words.length;
      ink.words.forEach((word, i) => {
        const amount = Math.max(0, Math.min(1, cursor - i));
        word.style.setProperty('--word-opacity', String(.25 + .75 * amount));
        word.classList.toggle('is-inked', amount === 1);
      });
    });
  }
  const queueInk = () => { if (!inkQueued) { inkQueued = true; requestAnimationFrame(inkIn); } };
  if (inkBlocks.length) {
    addEventListener('scroll', queueInk, {passive: true});
    addEventListener('resize', queueInk);
    reduced.addEventListener('change', queueInk);
    document.fonts.ready.then(queueInk);
    // Recalculate when the About essay unfolds or type reflows after loading.
    const resize = new ResizeObserver(queueInk);
    inkBlocks.forEach(ink => resize.observe(ink.block));
    const essay = document.querySelector('.essay-body');
    if (essay) new MutationObserver(queueInk).observe(essay, {attributes: true, attributeFilter: ['class']});
    inkIn();
  }
})();
