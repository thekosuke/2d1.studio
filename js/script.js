/**************************************************
    HOME FOOTER CLOCK (JST)
**************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const clock = document.getElementById('home-footer-clock');

  if (!clock) {
    return;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const updateClock = () => {
    const time = formatter.format(new Date());
    clock.textContent = `${time} JST`;
  };

  updateClock();
  setInterval(updateClock, 1000);
});

/**************************************************
    HOME MINI SQUARE FLOAT
**************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const square = document.querySelector('.home-mini-square');
  const textEl = document.getElementById('home-center-text');

  if (!square || !textEl) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaultText = textEl.innerHTML;
  const container = square.closest('.home-shell') || document.body;

  if (prefersReducedMotion) {
    return;
  }

  square.style.position = 'absolute';
  square.style.left = '0';
  square.style.top = '0';

  const margin = 0;
  let posX = 0;
  let posY = 0;
  let dirX = Math.random() > 0.5 ? 1 : -1;
  let dirY = Math.random() > 0.5 ? 1 : -1;
  const speed = 0.8;

  const getBounds = () => {
    const containerRect = container.getBoundingClientRect();
    const squareRect = square.getBoundingClientRect();
    return {
      maxX: Math.max(0, containerRect.width - squareRect.width - margin * 2),
      maxY: Math.max(0, containerRect.height - squareRect.height - margin * 2),
    };
  };

  const initPosition = () => {
    const { maxX, maxY } = getBounds();
    posX = Math.random() * maxX;
    posY = Math.random() * maxY;
  };

  const tick = () => {
    const { maxX, maxY } = getBounds();

    if (!isPaused) {
      posX += dirX * speed;
      posY += dirY * speed;

      if (posX <= 0) {
        posX = 0;
        dirX = 1;
      } else if (posX >= maxX) {
        posX = maxX;
        dirX = -1;
      }

      if (posY <= 0) {
        posY = 0;
        dirY = 1;
      } else if (posY >= maxY) {
        posY = maxY;
        dirY = -1;
      }
    }

    square.style.setProperty('--square-x', `${posX}px`);
    square.style.setProperty('--square-y', `${posY}px`);
    requestAnimationFrame(tick);
  };

  initPosition();
  requestAnimationFrame(tick);

  let isHovering = false;
  let isRounded = false;
  let isPaused = false;

  const enterHover = () => {
    if (isHovering) {
      return;
    }
    isHovering = true;
    isRounded = true;
    isPaused = true;
    square.classList.add('is-rounded');
    showQuote();
  };

  const leaveHover = () => {
    if (!isHovering) {
      return;
    }
    isHovering = false;
    isRounded = false;
    isPaused = false;
    square.classList.remove('is-rounded');
    hideQuote();
  };

  const getPoint = (event) => {
    if (event.touches && event.touches[0]) {
      return event.touches[0];
    }
    if (event.changedTouches && event.changedTouches[0]) {
      return event.changedTouches[0];
    }
    return event;
  };

  const isHit = (event) => {
    const point = getPoint(event);
    const rect = square.getBoundingClientRect();
    return (
      point.clientX >= rect.left &&
      point.clientX <= rect.right &&
      point.clientY >= rect.top &&
      point.clientY <= rect.bottom
    );
  };

  const handlePointerMove = (event) => {
    const hit = isHit(event);

    if (hit !== isRounded) {
      isRounded = hit;
      square.classList.toggle('is-rounded', hit);
    }

    if (hit && !isHovering) {
      enterHover();
    } else if (!hit && isHovering) {
      leaveHover();
    }
  };

  window.addEventListener('mousemove', handlePointerMove);
  let touchIsDown = false;
  let touchStartedOnSquare = false;
  let touchStartTime = 0;
  let suppressClickUntil = 0;
  const tapMaxDuration = 220;
  const tapMaxMove = 10;
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener(
    'touchstart',
    (event) => {
      touchIsDown = true;
      touchStartedOnSquare = isHit(event);
      touchStartTime = Date.now();
      const point = getPoint(event);
      touchStartX = point.clientX;
      touchStartY = point.clientY;
      suppressClickUntil = Date.now() + 800;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (event) => {
      if (!touchIsDown) {
        return;
      }
      const point = getPoint(event);
      const moved =
        Math.abs(point.clientX - touchStartX) > tapMaxMove ||
        Math.abs(point.clientY - touchStartY) > tapMaxMove;
      if (moved && !isHovering && touchStartedOnSquare) {
        enterHover();
      }
      if (moved && isHovering && !isHit(event)) {
        leaveHover();
      }
      if (moved) {
        touchStartedOnSquare = false;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    'touchend',
    (event) => {
      const touchDuration = Date.now() - touchStartTime;
      const point = getPoint(event);
      const moved =
        Math.abs(point.clientX - touchStartX) > tapMaxMove ||
        Math.abs(point.clientY - touchStartY) > tapMaxMove;
      const wasTap =
        touchStartedOnSquare && touchDuration <= tapMaxDuration && !moved;
      if (wasTap && isHit(event)) {
        document.body.classList.toggle('is-inverted');
        triggerRipple();
        suppressClickUntil = Date.now() + 800;
      }
      suppressClickUntil = Date.now() + 800;
      touchIsDown = false;
      touchStartedOnSquare = false;
      leaveHover();
    },
    { passive: true }
  );

  window.addEventListener(
    'touchcancel',
    () => {
      touchIsDown = false;
      touchStartedOnSquare = false;
      leaveHover();
    },
    { passive: true }
  );

  const quotes = [
    { quote: 'Airmailing you strength.', author: 'Earl Sweatshirt' },
    { quote: 'Your power is your independence. Don’t give up your power.', author: 'White Lotus S1E2' },
    { quote: 'A lot of the dream is the pursuit of the dream.', author: 'Max Kellerman' },
    { quote: '最初に情報があると自分の眼で見れなくなります', author: '長岡賢明' },
    { quote: 'I was twenty, I won\'t let anyone say those are the best years of your life.', author: 'Paul Nizan' },
    { quote: 'The more personal you are, the more universal it is.', author: 'Roseanne Barr' },
    { quote: 'くだらない日々に乾杯、まともに生きるなんて論外', author: 'ハンブレッダーズ' },
    { quote: 'The heart gotta break so it can fill up with love.', author: 'Kevin Gates' },
    { quote: 'If we just allowed things to be meaningless as they are, life might actually start to make sense.', author: 'Louis CK' },
    { quote: 'Is it harder to believe in love or ghosts?', author: 'Lyle Forever (Therapy Gecko)' },
    { quote: 'Minor set back for a major comeback.', author: 'Freddie Gibbs' },
    { quote: 'Be good to yourself. Dream on. Fly.', author: 'Mac Miller' },
    { quote: 'Sun don’t feel good if it wasn’t for the rain.', author: 'Matt Barnes' },
    { quote: 'It’s better to be an honest street sweeper than a dishonest king.', author: 'Bhagavad Gita' },
    { quote: 'You love something and they didn’t love you as much as you loved it.', author: 'Joe Budden' },
    { quote: 'I also don’t want to betray the higher calling of what that is.', author: 'Josh Peck' },
    { quote: 'Look for a way of life. Decide how you want to live and then see what you can do to make a living within that way of life.', author: 'Hunter S. Thompson' },
    { quote: 'The world makes much less sense than you think. The coherence comes mostly from the way your mind works.', author: 'Daniel Kahneman' },
    { quote: 'It is better to have a retarded president who respects human values than a clever president without human values.', author: 'Ai Weiwei' },
    { quote: 'I believe that in design, 30 percent dignity, 20 percent beauty and 50 percent absurdity are necessary.', author: 'Shigeo Fukuda' },
    { quote: 'You never really met me. I don’t think anyone has.', author: 'Alex G' },
    { quote: '成功を考えるとその瞬間から保守的になる', author: '横尾忠則' },
    { quote: 'Sometimes you sacrifice legibility to increase impact.', author: 'Herb Lubalin' },
    { quote: 'If the path before you is clear, you\'re probably on someone else\'s.', author: 'Carl Jung' },
    { quote: 'Failure is simply the opportunity to begin again, this time more intelligently.', author: 'Chief Keef' },
    { quote: 'People are wonderful. I love individuals. I hate groups of people.', author: 'George Carlin' },
    { quote: 'I\'m not interested in how people move, but what moves them.', author: 'Pina Bausch' },
    { quote: 'Imagination is real.', author: 'Pablo Picasso' },
    { quote: 'The value of things is not the time they last, but the intensity with which they occur.', author: 'Fernando Pessoa' },
    { quote: 'By being natural and sincere, one can often create revolutions without having sought them.', author: 'Christian Dior' },
    { quote: 'Like you, I think, I feel, I wonder. I know some things, I believe a thousand things, and I\'m curious about a million more.', author: 'Frank Sinatra' },
    { quote: '天才ですから', author: '桜木花道' },
  ];

  const japaneseRegex = /([\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]+)/g;

  const wrapJapanese = (text) =>
    text.replace(japaneseRegex, '<span class="jp-text">$1</span>');

  let lastQuoteIndex = null;

  const getNextQuoteIndex = () => {
    if (quotes.length < 2) {
      return 0;
    }

    let nextIndex = Math.floor(Math.random() * quotes.length);
    while (nextIndex === lastQuoteIndex) {
      nextIndex = Math.floor(Math.random() * quotes.length);
    }

    return nextIndex;
  };

  const showQuote = () => {
    const quoteIndex = getNextQuoteIndex();
    const { quote, author } = quotes[quoteIndex];
    const quoteHtml = wrapJapanese(`"${quote}"`);
    const authorHtml = wrapJapanese(author);
    textEl.innerHTML = `${quoteHtml}<br>${authorHtml}`;
    textEl.classList.add('is-quote');
    lastQuoteIndex = quoteIndex;
  };

  const hideQuote = () => {
    textEl.innerHTML = defaultText;
    textEl.classList.remove('is-quote');
  };

  const triggerRipple = () => {
    square.classList.remove('is-rippling');
    void square.offsetWidth;
    square.classList.add('is-rippling');
  };

  window.addEventListener('click', (event) => {
    if (Date.now() < suppressClickUntil) {
      return;
    }
    if (!isHit(event)) {
      return;
    }
    document.body.classList.toggle('is-inverted');
    triggerRipple();
  });

  window.addEventListener('mouseleave', () => {
    leaveHover();
  });
});

/**************************************************
    HOME LINK HIGHLIGHT HOVER
**************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const highlightSelector =
    '.home-contact, .home-center-text a, .home-bottom-tagline a';
  const highlightColor = '#D7FF00';
  const highlightColorInverted = '#0000FF';

  const getHighlightTarget = (target) => target.closest(highlightSelector);

  const applyHighlight = (target) => {
    const color = document.body.classList.contains('is-inverted')
      ? highlightColorInverted
      : highlightColor;
    target.style.setProperty('--highlight-color', color);
    target.classList.add('home-highlight');
    target.classList.remove('is-highlighted');
    void target.offsetWidth;
    target.classList.add('is-highlighted');
  };

  const removeHighlight = (target) => {
    target.classList.remove('is-highlighted');
  };

  document.addEventListener('mouseover', (event) => {
    const target = getHighlightTarget(event.target);
    if (!target || target.contains(event.relatedTarget)) {
      return;
    }
    applyHighlight(target);
  });

  document.addEventListener('mouseout', (event) => {
    const target = getHighlightTarget(event.target);
    if (!target || target.contains(event.relatedTarget)) {
      return;
    }
    removeHighlight(target);
  });

  document.addEventListener('focusin', (event) => {
    const target = getHighlightTarget(event.target);
    if (!target) {
      return;
    }
    applyHighlight(target);
  });

  document.addEventListener('focusout', (event) => {
    const target = getHighlightTarget(event.target);
    if (!target) {
      return;
    }
    removeHighlight(target);
  });
});

/**************************************************
    HOME GLYPH BACKGROUND
**************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const layer = document.querySelector('.home-glyph-layer');
  if (!layer) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    layer.classList.add('is-static');
  }

  const canvas = layer;
  const ctx = canvas.getContext('2d');
  const pixelSize = 3;
  const spacing = 5;
  const points = [];
  const wavePhase = Math.random() * Math.PI * 2;
  const waveSpeed = 0.16;
  const waveFrequency = 0.015;
  const waveAmplitude = 18;
  const waveAngle = Math.PI / 4.5;
  const crossAngle = waveAngle + Math.PI / 2.4;
  let lastFrameTime = 0;

  const resizeCanvas = () => {
    const { innerWidth, innerHeight, devicePixelRatio } = window;
    const ratio = Math.max(1, Math.floor(devicePixelRatio || 1));
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const buildPoints = () => {
    const { innerWidth, innerHeight } = window;
    points.length = 0;
    const padding = waveAmplitude * 3;
    for (let y = -padding; y < innerHeight + padding; y += spacing) {
      for (let x = -padding; x < innerWidth + padding; x += spacing) {
        points.push({
          x,
          y,
          jitterX: Math.floor(Math.random() * 2),
          jitterY: Math.floor(Math.random() * 2),
          alpha: 0.15 + Math.random() * 0.25,
        });
      }
    }
  };

  const drawPixels = (time) => {
    const { innerWidth, innerHeight } = window;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const t = time * waveSpeed + wavePhase;
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const diag =
        (Math.cos(waveAngle) * point.x + Math.sin(waveAngle) * point.y) *
        waveFrequency;
      const cross =
        (Math.cos(crossAngle) * point.x + Math.sin(crossAngle) * point.y) *
        (waveFrequency * 0.7);
      const ripple =
        Math.sin(diag + t) * 1.1 + Math.sin(cross - t * 0.55) * 0.7;
      const ridge = Math.max(0, ripple);
      const offset = ridge * waveAmplitude;
      const x = point.x + point.jitterX + offset;
      const y = point.y + point.jitterY + offset * 0.7;
    ctx.fillStyle = 'rgba(215, 215, 215, 1)';
      ctx.globalAlpha = Math.min(1, point.alpha + ridge * 0.6);
      ctx.beginPath();
      ctx.arc(
        x + pixelSize / 2,
        y + pixelSize / 2,
        pixelSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const animate = (time) => {
    if (prefersReducedMotion) {
      drawPixels(0);
      return;
    }
    if (time - lastFrameTime < 33) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrameTime = time;
    drawPixels(time / 1000);
    requestAnimationFrame(animate);
  };

  resizeCanvas();
  buildPoints();
  drawPixels(0);
  requestAnimationFrame(animate);
  window.addEventListener('resize', () => {
    resizeCanvas();
    buildPoints();
    drawPixels(0);
  });
});
