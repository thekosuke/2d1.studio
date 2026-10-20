'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const pad = (n) => String(n).padStart(2, '0');

/* Newsletter ---------------------------------------------------------------
 * Static hosts need a separate endpoint (docs/NEWSLETTER.md). A 2xx alone is
 * not enough: the endpoint must explicitly confirm the subscription.
 */
const form = document.querySelector('#subscribe-form');
const email = document.querySelector('#email');
const status = document.querySelector('#form-status');
const submit = form.querySelector('button');
const buttonLabel = submit.querySelector('.button-label');
let pending = false;
let subscribedEmail = '';

function showStatus(message, state) {
  status.textContent = message;
  status.dataset.state = state;
}

// A notice is not the visitor's mistake (for example, signup not open yet).
class Notice extends Error {}

async function subscribe(address) {
  const endpoint = window.TWO_D_ONE_CONFIG?.newsletterEndpoint;
  if (!endpoint) throw new Notice('Signup isn’t open just yet. Please check back soon. Your email hasn’t been saved.');
  const url = new URL(endpoint, window.location.origin);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error('Signup is temporarily unavailable. Please try again later.');
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: address }),
      signal: controller.signal,
      credentials: 'omit'
    });
    if (response.status === 429) throw new Error('A few too many attempts. Please wait a moment and try again.');
    if (!response.ok) throw new Error('We couldn’t complete your signup. Please try again in a moment.');
    const result = await response.json().catch(() => ({}));
    if (result?.status !== 'subscribed' && result?.status !== 'pending_confirmation') {
      throw new Error('We couldn’t confirm your signup. Please try again later.');
    }
    return result.status;
  } finally {
    window.clearTimeout(timeout);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (pending) return;
  email.value = email.value.trim();
  if (!email.validity.valid) {
    email.setAttribute('aria-invalid', 'true');
    showStatus(email.value ? 'Please check your email address.' : 'Please enter your email address.', 'error');
    email.focus();
    return;
  }
  email.removeAttribute('aria-invalid');
  const address = email.value;
  if (subscribedEmail && subscribedEmail.toLowerCase() === address.toLowerCase()) {
    showStatus('You’re already on the list. Thank you.', 'success');
    return;
  }
  pending = true;
  submit.disabled = true;
  email.readOnly = true;
  form.setAttribute('aria-busy', 'true');
  buttonLabel.textContent = 'sending…';
  showStatus('One moment…', 'loading');
  try {
    const result = await subscribe(address);
    subscribedEmail = address;
    showStatus(result === 'pending_confirmation'
      ? 'Almost there. Check your inbox to confirm your subscription.'
      : 'Thank you. You’re on the list.', 'success');
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'That took a little too long. Please try again.'
      : error instanceof TypeError
        ? 'We couldn’t connect. Please try again in a moment.'
        : error.message;
    showStatus(message, error instanceof Notice ? 'notice' : 'error');
  } finally {
    pending = false;
    submit.disabled = false;
    email.readOnly = false;
    form.removeAttribute('aria-busy');
    buttonLabel.textContent = 'stay updated';
  }
});
email.addEventListener('input', () => {
  if (pending) return;
  email.removeAttribute('aria-invalid');
  if (status.dataset.state !== 'loading') showStatus('', '');
});
// Enable only once submission is intercepted; without JS no address is sent.
email.disabled = false;
submit.disabled = false;

/* Project viewers -----------------------------------------------------------
 * One frame, several images, never a link. Moving the cursor across a Studio
 * slide picks the image under it; a click, tap, Enter, or Space
 * steps once. The next image is decoded before it moves, so the frame never
 * shows a blank. Moving forward pushes in from the right; back, from the left.
 */
const viewerStatus = document.querySelector('#viewer-status');
const viewers = new Map();

function loadFrame(image) {
  if (!image.dataset.src) return;
  const source = image.parentElement?.querySelector('source[data-srcset]');
  if (source) { source.srcset = source.dataset.srcset; delete source.dataset.srcset; }
  image.srcset = image.dataset.srcset;
  image.src = image.dataset.src;
  delete image.dataset.src;
  delete image.dataset.srcset;
}

function createViewer(project) {
  const button = project.querySelector('.viewer');
  const frames = [...button.querySelectorAll('.frame')];
  const counter = project.querySelector('.count-now');
  const ticks = [...project.querySelectorAll('.slide-ticks i')];
  ticks[0]?.classList.add('is-on');
  const name = project.dataset.project;
  let index = 0;
  let busy = false;
  let pendingTarget = null;
  let motion = [];

  frames.forEach((frame, i) => { if (i !== index) frame.setAttribute('aria-hidden', 'true'); });
  const warm = (all) => (all ? frames : [frames[(index + 1) % frames.length]]).forEach(loadFrame);

  async function show(target, dir, announce, instant = false) {
    if (target === index) return;
    if (busy) { pendingTarget = { target, dir, announce, instant }; motion.forEach((a) => a.finish()); return; }
    busy = true;
    const incoming = frames[target], outgoing = frames[index];
    loadFrame(incoming);
    try { await incoming.decode(); } catch { busy = false; return; }
    index = target;
    outgoing.classList.remove('is-current');
    outgoing.setAttribute('aria-hidden', 'true');
    incoming.classList.add('is-current');
    incoming.removeAttribute('aria-hidden');
    counter.textContent = pad(index + 1);
    ticks.forEach((t, i) => t.classList.toggle('is-on', i === index));
    button.setAttribute('aria-label', `${name}, image ${index + 1} of ${frames.length}. Show next image.`);
    if (announce) viewerStatus.textContent = `${name}, ${index + 1} of ${frames.length}: ${incoming.alt}`;
    warm(false);
    if (!reducedMotion.matches && !instant) {
      const timing = { duration: 560, easing: 'cubic-bezier(.7, 0, .2, 1)' };
      outgoing.style.visibility = 'visible';
      motion = [
        incoming.animate([{ transform: `translateX(${dir * 100}%)` }, { transform: 'none' }], timing),
        outgoing.animate([{ transform: 'none' }, { transform: `translateX(${-dir * 100}%)` }], timing)
      ];
      await Promise.allSettled(motion.map((a) => a.finished));
      motion = [];
      outgoing.style.removeProperty('visibility');
    }
    busy = false;
    if (pendingTarget) { const p = pendingTarget; pendingTarget = null; show(p.target, p.dir, p.announce, p.instant); }
  }

  button.addEventListener('pointerenter', () => warm(true));
  button.addEventListener('focus', () => warm(true));
  button.addEventListener('click', () => show((index + 1) % frames.length, 1, true));

  return {
    warm,
    get count() { return frames.length; },
    goTo(target, instant = false) { if (target !== index) show(target, target > index ? 1 : -1, false, instant); },
    stop() { motion.forEach((a) => a.finish()); }
  };
}

document.querySelectorAll('.project').forEach((project) => viewers.set(project, createViewer(project)));

// Decode each viewer's next image shortly before it comes into view.
if ('IntersectionObserver' in window) {
  const warmer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      viewers.get(entry.target).warm(false);
      warmer.unobserve(entry.target);
    });
  }, { rootMargin: '300px' });
  viewers.forEach((viewer, project) => warmer.observe(project));
}

/* Studio slides: the layered reveal is pure CSS (fixed images clipped to their
 * slides). A fine pointer moving across a slide picks the image under it, left
 * to right, like a flipbook. */
const slides = [...document.querySelectorAll('.slide')];
slides.forEach((slide) => {
  const viewer = viewers.get(slide);
  if (!viewer) return;
  slide.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !fineHover.matches) return;
    const box = slide.getBoundingClientRect();
    const target = Math.min(viewer.count - 1, Math.floor(((event.clientX - box.left) / box.width) * viewer.count));
    viewer.goTo(target, true);
  });
});

/* Studio work: one card per project, looping without end. Copies of the three
 * cards sit on either side of the real ones; whenever the scroll comes to rest
 * on a copy, it jumps (invisibly) to the same card in the middle set. It plays
 * by itself: each card steps through its images, then the next slides in.
 * Pointing at the work or tabbing into it holds it; it never runs off screen,
 * in a hidden tab, or with reduced motion. Moving the pointer across the card
 * in front flips through its images (left to right, like a flipbook); a click
 * on any card slides the carousel on; swipe or scroll sideways too. */
const work = document.querySelector('.work');
if (work) {
  const track = work.querySelector('.work-track');
  const real = [...track.querySelectorAll('.work-card')];
  const n = real.length;
  const STEP = 2200;   // ms per image
  const copy = () => real.map((card) => {
    const c = card.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');   // clickable (it slides to itself), but not announced twice
    return c;
  });
  track.prepend(...copy());
  track.append(...copy());
  const cards = [...track.querySelectorAll('.work-card')];   // copies, real, copies
  let at = n, shown = 0, elapsed = 0, last = 0, loop = 0, held = false, onScreen = false, steering = false;
  const project = (i) => ((i % n) + n) % n;
  const pitch = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const copiesOf = (p) => cards.filter((_, i) => project(i) === p);
  const frameCount = (p) => real[p].querySelectorAll('.work-frame').length;

  function show(p, f) {
    copiesOf(p).forEach((card) => {
      card.querySelectorAll('.work-frame').forEach((img, i) => { if (i === f) loadFrame(img); img.classList.toggle('is-current', i === f); });
    });
  }
  function jump(i) {   // to the same place, instantly
    track.classList.add('is-jumping');
    track.scrollLeft = i * pitch();
    track.classList.remove('is-jumping');
  }
  function become(i) {
    const before = project(at), now = project(i);
    at = i;
    cards.forEach((card, j) => card.classList.toggle('is-front', j === i));
    if (now === before) return;
    show(before, 0);
    shown = 0; elapsed = 0;
    copiesOf(now).forEach((c) => c.querySelectorAll('.work-frame').forEach(loadFrame));
  }
  function goTo(i) {
    steering = true;
    become(i);
    track.scrollTo({ left: i * pitch(), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  // When the scroll rests: settle on the card in front, back in the middle set.
  function settle() {
    steering = false;
    const i = Math.round(track.scrollLeft / pitch());
    become(i);
    if (i < n || i >= 2 * n) { at = project(i) + n; jump(at); }
  }
  let rest = 0;
  track.addEventListener('scroll', () => {
    window.clearTimeout(rest);
    rest = window.setTimeout(settle, 140);
    if (!steering) {
      const i = Math.round(track.scrollLeft / pitch());
      if (project(i) !== project(at)) become(i);
    }
  }, { passive: true });

  const shop = document.querySelector('.shop');
  const covered = () => shop && shop.getBoundingClientRect().top < track.getBoundingClientRect().top + track.offsetHeight / 2;   // the Shop is over it
  const running = () => !held && onScreen && !covered() && !document.hidden && !reducedMotion.matches;
  function tick(now) {
    loop = 0;
    if (!running()) return;
    elapsed += Math.min(100, now - last);
    last = now;
    const p = project(at), count = frameCount(p);
    const f = Math.min(count - 1, Math.floor(elapsed / STEP));
    if (f !== shown) { shown = f; show(p, f); }
    if (elapsed >= count * STEP) goTo(at + 1);
    loop = window.requestAnimationFrame(tick);
  }
  function resume() {
    if (!running() || loop) return;
    last = performance.now();
    loop = window.requestAnimationFrame(tick);
  }
  const hold = (on) => { held = on; if (on) { window.cancelAnimationFrame(loop); loop = 0; } else resume(); };

  cards.forEach((card, i) => {
    card.addEventListener('click', () => goTo(i === at ? at + 1 : i));   // slide on: the next one, or the one clicked
    card.addEventListener('pointermove', (event) => {
      if (i !== at || event.pointerType !== 'mouse' || !fineHover.matches) return;
      const box = card.getBoundingClientRect();
      const p = project(i), count = frameCount(p);
      const f = Math.min(count - 1, Math.max(0, Math.floor(((event.clientX - box.left) / box.width) * count)));
      if (f !== shown) { shown = f; elapsed = f * STEP; show(p, f); }
    });
  });
  work.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold(true); });
  work.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hold(false); });
  work.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hold(true); });
  work.addEventListener('focusout', () => { if (!work.matches(':hover')) hold(false); });
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('scroll', resume, { passive: true });
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; resume(); }, { threshold: 0.5 }).observe(track);
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    real[project(at)].querySelectorAll('.work-frame').forEach(loadFrame);
    observer.disconnect();
  }, { rootMargin: '400px 0px' }).observe(track);
  const start = () => { jump(at); cards[at].classList.add('is-front'); };
  start();
  window.addEventListener('resize', () => jump(at), { passive: true });
  document.fonts?.ready.then(start);
}

/* Studio holds still at the end of its scroll while the Shop rises over it:
 * it sticks where its bottom meets the bottom of the screen (or under the
 * bar, if it's shorter than the screen). */
const studio = document.querySelector('.studio');
function stickStudio() {
  if (!studio) return;
  const bar = document.querySelector('.bar').offsetHeight;
  studio.style.setProperty('--studio-stick', `${Math.min(bar, window.innerHeight - studio.offsetHeight)}px`);
}
stickStudio();
window.addEventListener('resize', stickStudio, { passive: true });
document.fonts?.ready.then(stickStudio);
window.addEventListener('load', stickStudio);

/* Scroll: logo dock, reading ink -------------------------------------------
 * The logo starts centred in the hero at half the viewport width, then scales
 * down and rises into the middle of the bar, where it stays as the home link.
 * It is locked exactly when the red hero has scrolled under the bar.
 * With reduced motion it switches between the two states without scaling.
 */
const logo = document.querySelector('.logo');
const hero = document.querySelector('.hero');
const bar = document.querySelector('.bar');
const LOGO_RATIO = 280 / 775;

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
let framePending = false;

function placeLogo() {
  const width = window.innerWidth;
  const barHeight = bar.offsetHeight;
  const heroHeight = hero.offsetHeight;
  const startWidth = Math.min(width * 0.5, 1180); // the middle two grid quarters
  const endWidth = width < 700 ? 58 : 80;
  const startTop = heroHeight / 2 - (startWidth * LOGO_RATIO) / 2;
  const endTop = (barHeight - endWidth * LOGO_RATIO) / 2;
  const travel = Math.max(1, heroHeight - barHeight);
  const raw = clamp01(window.scrollY / travel);
  const p = reducedMotion.matches ? (raw > 0.5 ? 1 : 0) : smooth(raw);
  const scale = 1 + (endWidth / startWidth - 1) * p;
  const top = startTop + (endTop - startTop) * p;
  logo.style.top = '0px';
  logo.style.width = `${startWidth}px`;
  logo.style.transform = `translate(-50%, ${top.toFixed(2)}px) scale(${scale.toFixed(4)})`;
  hero.style.setProperty('--hero-fade', (1 - clamp01(raw * 2.5)).toFixed(3));
}

/* Reading ink: the About statement is set in pale grey and inks in, word by
 * word, as it moves up the screen. It is always fully present; without JS or
 * with reduced motion it is simply dark. */
const inkBlocks = [...document.querySelectorAll('[data-ink]')].map((block) => {
  const words = [];
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const word = document.createElement('span');
          word.className = 'ink';
          word.textContent = part;
          words.push(word);
          frag.append(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrap(child);
      }
    });
  };
  wrap(block);
  block.classList.add('is-inking');
  return { block, words, inked: -1 };
});
function inkIn() {
  const height = window.innerHeight;
  inkBlocks.forEach((ink) => {
    let count = ink.words.length;
    if (!reducedMotion.matches) {
      // Finish by the upper quarter of the screen, or by wherever the block
      // stops when the page can't scroll any further (the closing line).
      const box = ink.block.getBoundingClientRect();
      const left = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - window.scrollY);
      const start = height * 0.85, end = Math.max(height * 0.25, box.top - left);
      count = end >= start - 1 ? ink.words.length : Math.round(clamp01((start - box.top) / (start - end)) * ink.words.length);
    }
    if (count === ink.inked) return;
    ink.inked = count;
    ink.words.forEach((word, i) => word.classList.toggle('is-inked', i < count));
  });
}

function render() {
  framePending = false;
  placeLogo();
  inkIn();
}

function queue() {
  if (framePending) return;
  framePending = true;
  window.requestAnimationFrame(render);
}

function applyMotionPreference() {
  if (reducedMotion.matches) viewers.forEach((viewer) => viewer.stop());
  queue();
}

window.addEventListener('scroll', queue, { passive: true });
window.addEventListener('resize', queue, { passive: true });
reducedMotion.addEventListener('change', applyMotionPreference);
placeLogo();
applyMotionPreference();

/* Signup micro-interactions --------------------------------------------------
 * A small red tag rides at the end of what you type (the tote's tag, again).
 * When the address looks complete the button lights up and the tag jumps onto
 * it; a bad address gets a short mechanical shake; sending steps the tag along
 * the line; success sends it hopping. All of it is decoration: the status text
 * says what happened.
 */
const signupRow = form.querySelector('.signup-row');
const signupTag = form.querySelector('.signup-tag');
const measure = document.createElement('canvas').getContext('2d');
function placeTag() {
  const style = getComputedStyle(email);
  measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  measure.letterSpacing = style.letterSpacing;
  const text = email.value || '';
  const pad = parseFloat(style.paddingLeft);
  const width = Math.min(measure.measureText(text).width, email.clientWidth - pad - 16);
  signupRow.style.setProperty('--tag-x', `${(pad + width + (text ? 6 : 0)).toFixed(1)}px`);
  const ready = email.validity.valid && text.includes('.') && !pending;
  [signupRow, form].forEach((el) => { el.classList.toggle('is-ready', ready); el.classList.toggle('has-text', Boolean(text)); });
}
function pulse(name) {
  signupRow.classList.remove(name);
  void signupRow.offsetWidth; // restart the animation
  signupRow.classList.add(name);
}
signupRow.addEventListener('animationend', (event) => {
  if (event.target === signupRow) signupRow.classList.remove('is-shaking');
  if (event.target === signupTag) signupRow.classList.remove('is-hopping');
});
email.addEventListener('input', placeTag);
email.addEventListener('focus', placeTag);
window.addEventListener('resize', placeTag, { passive: true });
document.fonts?.ready.then(placeTag);
placeTag();
new MutationObserver(() => {
  const state = status.dataset.state;
  [signupRow, form].forEach((el) => el.classList.toggle('is-sending', state === 'loading'));
  if (state === 'error') pulse('is-shaking');
  if (state === 'success') pulse('is-hopping');
  if (state === 'notice') pulse('is-shrugging');
  placeTag();
}).observe(status, { attributes: true, attributeFilter: ['data-state'] });

/* Shop: the tote is rendered live once the Shop comes near. Until then (and if
 * WebGL or the module is unavailable) the poster stands in. */
const toteStage = document.querySelector('.tote-stage');
const toteScroll = document.querySelector('.tote-scroll');
/* Hotspots (in the finale): hover or keyboard focus draws the leader and label;
 * on touch, a tap does the same. "Inside" also switches on the x-ray. The
 * close-ups themselves happen through the scroll story. */
let chapter = 'intro';
const exploring = () => chapter === 'outro';
const spotList = [...document.querySelectorAll('.spot')];
let openSpotKey = null;
function showSpot(key) {
  openSpotKey = key;
  spotList.forEach((spot) => {
    const on = spot.dataset.anchor === key;
    spot.classList.toggle('is-open', on);
    spot.querySelector('.spot-btn').setAttribute('aria-expanded', String(on));
  });
  toteStage?.tote?.setOpen(key);
  const xray = key === 'inside' && Boolean(toteStage?.tote);
  toteStage?.classList.toggle('is-xray', xray);
  toteStage?.tote?.setXray(xray);
}
spotList.forEach((spot) => {
  const key = spot.dataset.anchor;
  const button = spot.querySelector('.spot-btn');
  // A click only closes a label it didn't just open (a tap fires focus, then click;
  // a mouse opens it on hover first).
  let openedAt = 0;
  const open = () => { if (exploring() && openSpotKey !== key) { showSpot(key); openedAt = performance.now(); } };
  button.addEventListener('click', () => {
    if (!exploring()) return;
    if (openSpotKey === key && performance.now() - openedAt > 450 && !button.matches(':hover')) showSpot(null);
    else open();
  });
  spot.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') open(); });
  spot.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse' && exploring()) showSpot(null); });
  button.addEventListener('focus', open);
  button.addEventListener('blur', () => { if (exploring()) showSpot(null); });
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && exploring() && openSpotKey) showSpot(null); });
document.addEventListener('pointerdown', (event) => { if (exploring() && openSpotKey && !event.target.closest('.spot')) showSpot(null); });

// Each chapter shows its caption and draws its callout; the finale hands the dots over.
function setChapter(key) {
  chapter = key;
  toteStage.dataset.chapter = key;
  showSpot(['logo', 'tag', 'canvas', 'strap', 'inside'].includes(key) ? key : null);
}

if (toteStage && 'IntersectionObserver' in window) {
  const loader = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    loader.disconnect();
    try {
      const { mountTote } = await import('./tote.js');
      const tote = mountTote({ stage: toteStage, scroller: toteScroll, reducedMotion, spots: [...toteStage.querySelectorAll('.spot')], onChapter: setChapter });
      toteStage.tote = tote;
      requestAnimationFrame(() => toteStage.classList.add('is-live'));
    } catch (error) {
      toteStage.classList.add('is-static');
    }
  }, { rootMargin: '120% 0px' });
  loader.observe(toteStage);
} else if (toteStage) {
  toteStage.classList.add('is-static');
}

/* The logo's eyes are closed by default (invisible). Every few seconds they
 * open, glance one way, and close again. */
const logoEl = document.querySelector('.logo');
function peek() {
  if (!reducedMotion.matches && !document.hidden) {
    logoEl.classList.add('is-awake');
    logoEl.style.setProperty('--glance', `${Math.random() < 0.5 ? -1 : 1}`);
    window.setTimeout(() => logoEl.classList.add('is-glancing'), 380);
    window.setTimeout(() => logoEl.classList.remove('is-glancing'), 900);
    window.setTimeout(() => logoEl.classList.remove('is-awake'), 1250);
  }
  window.setTimeout(peek, 4200 + Math.random() * 3200);
}
window.setTimeout(peek, 2400);

/* In-page links scroll without writing a #hash into the address bar; focus
 * follows, for keyboard and screen-reader users. */
function focusTarget(target) {
  if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

/* Links to Updates skip the long scroll (and the whole Shop story): a red wipe
 * covers the page, it jumps, the wipe lifts, and the email field is ready. */
const wipe = document.querySelector('.wipe');
let wiping = false;
function goToUpdates() {
  const target = document.querySelector('#updates');
  const top = target.getBoundingClientRect().top + window.scrollY - bar.offsetHeight;
  const land = () => {
    window.scrollTo({ top, behavior: 'instant' });
    email.focus({ preventScroll: true });
  };
  if (reducedMotion.matches || !wipe) { land(); return; }
  if (wiping) return;
  wiping = true;
  wipe.classList.remove('is-out');
  void wipe.offsetWidth;
  wipe.classList.add('is-in');
  window.setTimeout(() => {
    land();
    window.setTimeout(() => {
      wipe.classList.replace('is-in', 'is-out');
      window.setTimeout(() => { wipe.classList.remove('is-out'); wiping = false; }, 520);
    }, 260);
  }, 460);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const id = link.getAttribute('href').slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  if (id === 'updates') { goToUpdates(); return; }
  target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  focusTarget(target);
});

document.querySelector('#year').textContent = new Date().getFullYear();

// Retain the existing analytics property on the production domain only.
if (location.hostname === '2d1.studio' || location.hostname === 'www.2d1.studio') {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-7YBDBXJWCG');
  const analytics = document.createElement('script');
  analytics.async = true;
  analytics.src = 'https://www.googletagmanager.com/gtag/js?id=G-7YBDBXJWCG';
  document.head.append(analytics);
}
