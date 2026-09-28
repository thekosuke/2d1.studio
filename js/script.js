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

/* Project viewers -----------------------------------------------------------
 * One square frame, several images, never a link. Scrolling across a project
 * in the Studio reel steps through its images; a click, tap, Enter, or Space
 * steps once. The next image is decoded before it moves, so the frame never
 * shows a blank. Moving forward pushes in from the right; back, from the left.
 */
const viewerStatus = document.querySelector('#viewer-status');
const viewers = new Map();

function loadFrame(image) {
  if (!image.dataset.src) return;
  image.srcset = image.dataset.srcset;
  image.src = image.dataset.src;
  delete image.dataset.src;
  delete image.dataset.srcset;
}

function createViewer(project) {
  const button = project.querySelector('.viewer');
  const frames = [...button.querySelectorAll('.frame')];
  const counter = project.querySelector('.count-now');
  const name = project.dataset.project;
  let index = 0;
  let busy = false;
  let pendingTarget = null;
  let motion = [];

  frames.forEach((frame, i) => { if (i !== index) frame.setAttribute('aria-hidden', 'true'); });
  const warm = (all) => (all ? frames : [frames[(index + 1) % frames.length]]).forEach(loadFrame);

  async function show(target, dir, announce) {
    if (target === index) return;
    if (busy) { pendingTarget = { target, dir, announce }; motion.forEach((a) => a.finish()); return; }
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
    button.setAttribute('aria-label', `${name}, image ${index + 1} of ${frames.length}. Show next image.`);
    if (announce) viewerStatus.textContent = `${name}, ${index + 1} of ${frames.length}: ${incoming.alt}`;
    warm(false);
    if (!reducedMotion.matches) {
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
    if (pendingTarget) { const p = pendingTarget; pendingTarget = null; show(p.target, p.dir, p.announce); }
  }

  button.addEventListener('pointerenter', () => warm(true));
  button.addEventListener('focus', () => warm(true));
  button.addEventListener('click', () => show((index + 1) % frames.length, 1, true));

  return {
    warm,
    get count() { return frames.length; },
    goTo(target) { if (target !== index) show(target, target > index ? 1 : -1, false); },
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

/* Studio reel: vertical scroll drives the reel sideways, 1px for 1px. The
 * panel nearest the middle is full size; the others step back. As a project
 * crosses the middle its images advance, one per slice of the crossing. */
const reel = document.querySelector('.reel');
const studioStage = document.querySelector('.studio-stage');
const studioScroll = document.querySelector('.studio-scroll');
const panels = reel ? [...reel.querySelectorAll('.panel')] : [];
let reelTravel = 0;
const reelOn = () => document.documentElement.classList.contains('js') && !reducedMotion.matches;
function sizeReel() {
  if (!reel) return;
  reel.style.setProperty('--reel-x', '0px');
  panels.forEach((p) => p.style.removeProperty('--s'));
  if (!reelOn()) { studioScroll.style.removeProperty('height'); reelTravel = 0; return; }
  const first = panels[0].getBoundingClientRect(), last = panels[panels.length - 1].getBoundingClientRect();
  const firstCenter = first.left + first.width / 2, lastCenter = last.left + last.width / 2;
  reelTravel = Math.max(0, lastCenter - firstCenter);
  // Start with the intro in the middle, end with what-we-do in the middle.
  reel.dataset.offset = String(window.innerWidth / 2 - firstCenter);
  studioScroll.style.height = `${studioStage.offsetHeight + reelTravel * 1.1}px`;
}
function driveReel() {
  if (!reel || !reelOn()) return;
  const box = studioScroll.getBoundingClientRect();
  const stick = parseFloat(getComputedStyle(studioStage).top) || 0;
  const t = clamp01((stick - box.top) / Math.max(1, box.height - studioStage.offsetHeight));
  const x = Number(reel.dataset.offset || 0) - t * reelTravel;
  reel.style.setProperty('--reel-x', `${x.toFixed(1)}px`);
  const mid = window.innerWidth / 2;
  let nearest = 0, best = Infinity;
  panels.forEach((panel, i) => {
    const w = panel.offsetWidth, left = panel.offsetLeft + x;
    const u = (mid - (left + w / 2)) / (w + 60);       // 0 when centred, ±1 a panel away
    const d = Math.min(1, Math.abs(u));
    panel.style.setProperty('--s', (1 - 0.16 * d).toFixed(4));
    panel.style.setProperty('--o', (1 - 0.45 * d).toFixed(4));
    panel.style.setProperty('--tag', Math.abs(u) < 0.5 ? '1' : '0');
    if (Math.abs(u) < best) { best = Math.abs(u); nearest = i; }
    const viewer = viewers.get(panel);
    if (viewer) {
      const k = viewer.count;
      const target = Math.max(0, Math.min(k - 1, Math.floor((u + 0.5) * k)));
      if (panel.dataset.target !== String(target)) { panel.dataset.target = String(target); viewer.goTo(target); }
    }
  });
  studioStage.dataset.panel = String(nearest);
}
// Keyboard: whatever gets focus in the reel scrolls into the middle.
reel?.addEventListener('focusin', (event) => {
  if (!reelOn()) return;
  const panel = event.target.closest('.panel');
  if (!panel) return;
  const i = panels.indexOf(panel);
  const t = panels.length > 1 ? i / (panels.length - 1) : 0;
  const box = studioScroll.getBoundingClientRect();
  const stick = parseFloat(getComputedStyle(studioStage).top) || 0;
  const top = box.top + window.scrollY - stick + t * (box.height - studioStage.offsetHeight);
  window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});

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
  driveReel();
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
window.addEventListener('resize', () => { sizeReel(); queue(); }, { passive: true });
window.addEventListener('load', () => { sizeReel(); queue(); });
document.fonts?.ready.then(() => { sizeReel(); queue(); });
reducedMotion.addEventListener('change', () => { sizeReel(); applyMotionPreference(); });
placeLogo();
sizeReel();
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

/* Contact ----------------------------------------------------------------------
 * A native dialog. Its pixel eyes open when it arrives, look at whichever field
 * you're in (and follow the text as you type), squint at a mistake, look up
 * while sending, and hop when it's done. Submissions go to the endpoint in
 * js/config.js, which writes to the Notion "Form Submissions" database (see
 * docs/CONTACT.md). Without an endpoint nothing is sent, and the form says so.
 */
const contact = document.querySelector('#contact');
const contactForm = document.querySelector('#contact-form');
if (contact && contactForm && typeof contact.showModal === 'function') {
  const eyes = contact.querySelector('.contact-eyes');
  const cStatus = contact.querySelector('#contact-status');
  const send = contactForm.querySelector('.contact-send');
  const sendLabel = send.querySelector('.send-label');
  const done = contact.querySelector('.contact-done');
  const fallback = contact.querySelector('.contact-fallback');
  const message = contactForm.querySelector('#c-message');
  const counter = contact.querySelector('#c-count');
  const fields = [...contactForm.querySelectorAll('.field-input, input[type="radio"]')];
  let sending = false, opener = null;

  const look = (x, y) => { eyes.style.setProperty('--lx', x.toFixed(2)); eyes.style.setProperty('--ly', y.toFixed(2)); };
  const mood = (name) => { eyes.dataset.mood = name || ''; };
  function glance(el) {
    const e = eyes.getBoundingClientRect(), r = el.getBoundingClientRect();
    let tx = r.left + Math.min(r.width, 24 + (el.value || '').length * 11);
    look(Math.max(-1, Math.min(1, (tx - (e.left + e.width / 2)) / 400)), Math.max(-1, Math.min(1, (r.top - e.bottom) / 500)));
  }

  function open(event) {
    if (event) { if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return; event.preventDefault(); }
    opener = document.activeElement;
    contact.classList.remove('is-closing');
    contact.showModal();
    document.documentElement.classList.add('has-dialog');
    mood('closed');
    window.setTimeout(() => mood(''), reducedMotion.matches ? 0 : 650);   // they open once it lands
    look(0, 0.4);
    if (!done.hidden) return;
    window.setTimeout(() => contactForm.querySelector('#c-name').focus({ preventScroll: true }), reducedMotion.matches ? 0 : 520);
  }
  function close() {
    if (!contact.open) return;
    if (reducedMotion.matches) { contact.close(); return; }
    contact.classList.add('is-closing');
    window.setTimeout(() => { contact.classList.remove('is-closing'); contact.close(); }, 380);
  }
  contact.addEventListener('close', () => { document.documentElement.classList.remove('has-dialog'); opener?.focus?.({ preventScroll: true }); });
  contact.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  contact.addEventListener('click', (event) => { if (event.target === contact || event.target.closest('[data-close]')) close(); });
  document.querySelectorAll('[data-contact]').forEach((link) => link.addEventListener('click', open));

  fields.forEach((field) => {
    field.addEventListener('focus', () => glance(field));
    field.addEventListener('input', () => {
      glance(field);
      field.removeAttribute('aria-invalid');
      field.closest('.field')?.classList.remove('is-wrong');
      if (cStatus.dataset.state === 'error') { cStatus.textContent = ''; cStatus.dataset.state = ''; mood(''); }
      contactForm.classList.toggle('is-ready', contactForm.checkValidity());
    });
  });
  contactForm.querySelectorAll('input[type="radio"]').forEach((r) => r.addEventListener('change', () => {
    contactForm.classList.toggle('is-ready', contactForm.checkValidity());
    mood('happy'); window.setTimeout(() => mood(''), 500);
  }));
  // The message box grows with what you write.
  message.addEventListener('input', () => {
    counter.textContent = message.value.length;
    message.style.height = 'auto';
    message.style.height = `${Math.min(message.scrollHeight, 320)}px`;
  });

  const say = (text, state) => { cStatus.textContent = text; cStatus.dataset.state = state; };

  async function deliver(data) {
    const endpoint = window.TWO_D_ONE_CONFIG?.contactEndpoint;
    if (!endpoint) { const e = new Error('not-configured'); e.code = 'not-configured'; throw e; }
    const url = new URL(endpoint, window.location.origin);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('The form is temporarily unavailable. Please try again later.');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data), signal: controller.signal, credentials: 'omit' });
      if (response.status === 429) throw new Error('A few too many messages. Please wait a moment and try again.');
      if (response.status === 422) throw new Error('Something in the form needs another look. Please check your details.');
      if (!response.ok) throw new Error('We couldn’t send your message. Please try again in a moment.');
      const result = await response.json().catch(() => ({}));
      if (result?.status !== 'received') throw new Error('We couldn’t confirm your message was received. Please try again.');
    } finally {
      window.clearTimeout(timeout);
    }
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    fallback.hidden = true;
    contactForm.querySelectorAll('.field-input').forEach((f) => { f.value = f.value.trim(); });
    const invalid = fields.find((f) => !f.checkValidity());
    if (invalid) {
      const field = invalid.closest('.field');
      field.classList.remove('is-wrong'); void field.offsetWidth; field.classList.add('is-wrong');
      invalid.setAttribute('aria-invalid', 'true');
      const label = field.querySelector('.field-label').childNodes[0].textContent.trim();
      say(invalid.type === 'email' && invalid.value ? 'Please check your email address.' : invalid.type === 'radio' ? 'Please choose a category.' : `Please add your ${label.toLowerCase()}.`, 'error');
      mood('squint');
      invalid.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(contactForm));
    if (data.website) { say('Thank you.', 'success'); return; } // a bot filled the hidden field
    delete data.website;
    sending = true;
    send.disabled = true;
    contactForm.setAttribute('aria-busy', 'true');
    sendLabel.textContent = 'Sending';
    contactForm.classList.add('is-sending');
    mood('up');
    say('One moment…', 'loading');
    try {
      await deliver(data);
      say('', '');
      done.querySelector('.done-name').textContent = data.name ? `, ${data.name.split(/\s+/)[0]}` : '';
      contactForm.hidden = true;
      done.hidden = false;
      contactForm.reset();
      counter.textContent = '0';
      mood('hop');
      done.querySelector('.contact-done-title').focus();
    } catch (error) {
      if (error.code === 'not-configured') {
        say('', '');
        fallback.hidden = false;
        mood('shrug');
      } else {
        say(error.name === 'AbortError' ? 'That took a little too long. Please try again.' : error instanceof TypeError ? 'We couldn’t connect. Please try again in a moment.' : error.message, 'error');
        mood('squint');
      }
    } finally {
      sending = false;
      send.disabled = false;
      contactForm.removeAttribute('aria-busy');
      contactForm.classList.remove('is-sending');
      sendLabel.textContent = 'Send';
    }
  });
  // Reopening after a sent message starts a fresh form.
  contact.addEventListener('close', () => { if (!done.hidden) { done.hidden = true; contactForm.hidden = false; contactForm.classList.remove('is-ready'); } });
}

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
