/* The House of Familiar Things: the Index's Characters as red-tinted squares
 * that live together. Three sizes, packed like Apple Music's bubbles and
 * loosened so they don't sit in rows; each drifts a little (CSS). Point at one
 * and it grows while the others make room; pick one up (mouse or pen) and toss
 * it, and it finds its way home; now and then one opens its eyes, like the
 * logo. With reduced motion they simply stay put. Loaded by js/characters.js. */

const SIZES = [1, 0.72, 0.52];   // large, medium, small, as shares of the unit
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// The same Character always gets the same size and drift.
function seeded(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function square(card, index) {
  const link = card.querySelector('.fc-card-link');
  const title = link.textContent.trim();
  const no = card.dataset.no;
  const rand = seeded(`fc-${no}`);
  // Sizes follow the golden ratio through the numbers, so any stretch of the
  // collection gets a fair mix, and a Character keeps its size as others arrive.
  const phase = (Number(no) * 0.6180339887) % 1;
  const size = index === 0 ? 0 : phase < 0.26 ? 0 : phase < 0.64 ? 1 : 2;   // the newest is always large

  const el = document.createElement('li');
  el.className = 'fc-sq';
  el.dataset.slug = card.dataset.slug;
  const a = document.createElement('a');
  a.className = 'fc-sq-link';
  a.href = link.getAttribute('href');
  a.draggable = false;
  a.setAttribute('aria-label', `No. ${no}, ${title}`);
  const float = document.createElement('span');
  float.className = 'fc-sq-float';
  const img = document.createElement('img');
  img.className = 'fc-sq-img';
  img.alt = '';
  img.draggable = false;
  img.loading = 'lazy';
  img.decoding = 'async';
  if (!card.querySelector('.fc-img').style.backgroundColor) img.classList.add('is-cutout');   // transparent PNGs
  img.srcset = card.dataset.tint;
  const eyes = document.createElement('span');
  eyes.className = 'fc-sq-eyes';
  eyes.setAttribute('aria-hidden', 'true');
  eyes.innerHTML = '<i></i><i></i>';
  const label = document.createElement('span');
  label.className = 'fc-sq-label';
  label.setAttribute('aria-hidden', 'true');
  label.innerHTML = '<span class="fc-sq-no"></span><span class="fc-sq-name"></span>';
  label.firstChild.textContent = no;
  label.lastChild.textContent = title;
  float.append(img, eyes, label);
  a.append(float);
  el.append(a);
  // A slow, private drift for each one.
  const drift = () => `${((rand() - 0.5) * 8).toFixed(1)}px`;
  el.style.cssText = `--fd:${(7 + rand() * 6).toFixed(2)}s;--fdelay:${(-rand() * 8).toFixed(2)}s;--fx0:${drift()};--fy0:${drift()};--fx1:${drift()};--fy1:${drift()}`;

  return {
    el, link: a, img, card, size, ratio: Number(card.dataset.ratio) || 1, jitter: [rand() - 0.5, rand() - 0.5], u: rand(), ty: 0,
    s: 0, hx: 0, hy: 0, x: 0, y: 0, vx: 0, vy: 0, scale: 0, sv: 0, goal: 1, heavy: false, drag: false, appearAt: 0,
  };
}

export function createHouse(root, cards, { reducedMotion }) {
  const list = document.createElement('ul');
  list.className = 'fc-house-list';
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', 'The House of Familiar Things');
  root.append(list);
  const everyone = cards.map(square);
  let items = everyone.slice();
  everyone.forEach((it) => list.append(it.el));

  let gap = 10;
  let frame = 0;
  let last = 0;
  let pointer = null;        // {x, y} in the list's coordinates, while a fine pointer is over it
  let lifted = null;         // the square being pointed at or focused
  let grab = null;           // {it, dx, dy, x0, y0, moved}
  let suppressClick = false;
  let peekTimer = 0;
  let shown = false;
  let onScreen = true;
  const still = () => reducedMotion.matches;

  /* Layout: pick a unit so a small collection fills about a screen and a large
   * one keeps its squares a comfortable size. Pack them tight in index order
   * (newest first, top to bottom), then break the rows: each square steps up or
   * down by its own amount and the top edge goes ragged; then everything drifts
   * up into the gaps, pushed apart where squares meet, like bubbles. */
  function layout() {
    const W = root.clientWidth;
    gap = W < 700 ? 6 : 10;
    const top = gap * 2;
    const wall = W >= 900 ? 16 : 12;   // the page margin
    const inner = W - wall * 2;
    const minH = Math.max(420, window.innerHeight * (W < 700 ? 0.7 : 0.78));
    const area = items.reduce((t, it) => t + SIZES[it.size] ** 2, 0) || 1;
    const lo = W < 700 ? W * 0.54 : W < 1100 ? W * 0.29 : Math.max(220, W * 0.16);
    const hi = W < 700 ? W * 0.66 : W * 0.3;
    const unit = clamp(Math.sqrt((inner * minH * 0.72) / area), lo, hi);
    items.forEach((it) => { it.s = Math.round(SIZES[it.size] * unit); });

    // Tight packing: each square where the skyline is lowest, leftmost first.
    let sky = [{ x: 0, w: inner + gap, y: 0 }];
    for (const it of items) {
      const w = it.s + gap;
      let best = null;
      for (let i = 0; i < sky.length; i++) {
        const x = sky[i].x;
        if (x + w > inner + gap + 0.5) break;
        let y = 0;
        for (let j = i; j < sky.length && sky[j].x < x + w - 0.5; j++) y = Math.max(y, sky[j].y);
        if (!best || y < best.y - 0.5) best = { x, y };
      }
      if (!best) best = { x: 0, y: Math.max(...sky.map((seg) => seg.y)) };
      it.hx = wall + best.x + it.s / 2;
      it.hy = top + best.y + it.s / 2;
      const next = [];
      for (const seg of sky) {
        const end = seg.x + seg.w;
        if (end <= best.x || seg.x >= best.x + w) { next.push(seg); continue; }
        if (seg.x < best.x) next.push({ x: seg.x, w: best.x - seg.x, y: seg.y });
        if (end > best.x + w) next.push({ x: best.x + w, w: end - best.x - w, y: seg.y });
      }
      next.push({ x: best.x, w, y: best.y + w });
      next.sort((p, q) => p.x - q.x);
      sky = next;
    }
    // Break the rows, then let them rise and settle.
    items.forEach((it) => {
      it.hx += it.jitter[0] * it.s * 0.16;
      it.hy += it.jitter[1] * it.s * 0.4;
      it.ceiling = top + it.s / 2 + Math.max(0, it.jitter[1]) * it.s * 0.35;
    });
    for (let k = 0; k < 260; k++) {
      const rise = k < 190 ? 1.5 : 0;
      items.forEach((it) => { it.hy -= rise; });
      crowd(items);
      items.forEach((it) => {
        it.hx = clamp(it.hx, wall + it.s / 2, W - wall - it.s / 2);
        it.hy = Math.max(it.hy, it.ceiling);
      });
    }
    items.forEach((it) => {
      it.el.style.width = `${it.s}px`;
      it.el.style.height = `${it.s}px`;
      it.el.style.setProperty('--es', `${Math.max(4, Math.round(it.s * 0.042))}px`);
      it.el.style.setProperty('--label', `${clamp(it.s * 0.07, 13, 20).toFixed(1)}px`);
      it.el.classList.toggle('is-small', it.s < 150);
      it.img.sizes = `${Math.round(it.s * Math.max(1, it.ratio))}px`;
    });
    const height = Math.max(...items.map((it) => it.hy + it.s / 2), 0) + top;
    list.style.height = `${Math.round(height)}px`;
  }

  // Separate every overlapping pair among many, checking only near neighbours.
  function crowd(group) {
    const cell = Math.max(...group.map((it) => it.s)) + gap;
    const buckets = new Map();
    group.forEach((it) => {
      const key = `${Math.floor(it.hx / cell)},${Math.floor(it.hy / cell)}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(it);
    });
    group.forEach((a) => {
      const cx = Math.floor(a.hx / cell);
      const cy = Math.floor(a.hy / cell);
      for (let x = cx - 1; x <= cx + 1; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) {
          (buckets.get(`${x},${y}`) || []).forEach((b) => { if (a !== b && a.u < b.u) separate(a, b, 'hx', 'hy', 1, 1); });
        }
      }
    });
  }

  // Push two overlapping squares apart along the shorter overlap, by weight.
  function separate(a, b, kx, ky, wa, wb) {
    const ha = (a.s * (kx === 'x' ? a.scale : 1)) / 2 + gap / 2;
    const hb = (b.s * (kx === 'x' ? b.scale : 1)) / 2 + gap / 2;
    const dx = b[kx] - a[kx];
    const dy = b[ky] - a[ky];
    const ox = ha + hb - Math.abs(dx);
    if (ox <= 0) return;
    const oy = ha + hb - Math.abs(dy);
    if (oy <= 0) return;
    const share = wa + wb;
    if (ox < oy) {
      const push = ox * (dx < 0 ? -1 : 1);
      a[kx] -= (push * wa) / share;
      b[kx] += (push * wb) / share;
    } else {
      const push = oy * (dy < 0 ? -1 : 1);
      a[ky] -= (push * wa) / share;
      b[ky] += (push * wb) / share;
    }
  }

  function place(it) {
    it.el.style.transform = `translate3d(${(it.x - it.s / 2).toFixed(2)}px, ${(it.y - it.s / 2).toFixed(2)}px, 0) scale(${it.scale.toFixed(4)})`;
  }

  /* Physics: springs home, grow when pointed at, give way on contact. It only
   * runs while something is moving or a pointer is inside; the drift is CSS. */
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;
    const box = list.getBoundingClientRect();
    const top = -box.top - 300;
    const bottom = -box.top + window.innerHeight + 300;
    const active = items.filter((it) => it.hy + it.s > top && it.hy - it.s < bottom);
    let moving = false;
    for (const it of active) {
      if (now >= it.appearAt && it.goal === 0) it.goal = 1;
      const goal = it.goal === 0 ? 0 : it === lifted ? (grab && grab.it === it && grab.pressed && !grab.moved ? 0.97 : 1.1) : 1;
      it.sv += ((goal - it.scale) * 260 - it.sv * 17) * dt;
      it.scale = Math.max(0, it.scale + it.sv * dt);
      let tx = it.hx;
      let ty = it.hy;
      let k = 110;
      let c = 15;
      if (it.drag && pointer) { tx = pointer.x - grab.dx; ty = pointer.y - grab.dy; k = 900; c = 55; }
      it.vx += ((tx - it.x) * k - it.vx * c) * dt;
      it.vy += ((ty - it.y) * k - it.vy * c) * dt;
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      if (it.drag || Math.abs(it.vx) + Math.abs(it.vy) > 1.5 || Math.abs(tx - it.x) + Math.abs(ty - it.y) > 0.4 || Math.abs(goal - it.scale) > 0.002 || Math.abs(it.sv) > 0.01) moving = true;
    }
    // Only squares that are grown, carried, or already nudged push one another;
    // at rest everyone sits exactly at home.
    const stirred = (it) => it.heavy || it.drag || it.scale > 1.001 || Math.abs(it.x - it.hx) + Math.abs(it.y - it.hy) > 0.5;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i];
          const b = active[j];
          if (stirred(a) || stirred(b)) separate(a, b, 'x', 'y', a.heavy || a.drag ? 0.08 : 1, b.heavy || b.drag ? 0.08 : 1);
        }
      }
    }
    active.forEach(place);
    frame = moving || grab ? window.requestAnimationFrame(tick) : 0;
  }
  function wake() {
    if (still() || frame || !shown) return;
    last = performance.now();
    frame = window.requestAnimationFrame(tick);
  }
  function settle(it) {
    it.x = it.hx; it.y = it.hy; it.vx = it.vy = it.sv = 0; it.scale = 1; it.goal = 1;
    place(it);
  }
  function settleAll() { items.forEach(settle); }
  // After a new layout, the ones out of sight go straight home; the rest travel.
  function relayout() {
    layout();
    if (still()) { settleAll(); return; }
    const box = list.getBoundingClientRect();
    items.forEach((it) => {
      const y = box.top + it.hy;
      if (y + it.s < -200 || y - it.s > window.innerHeight + 200) settle(it);
    });
    wake();
  }

  /* Eyes: closed until you point at a square, which then watches the pointer;
   * and every few seconds one of them glances round on its own. */
  function look(it, x, y) {
    const dx = clamp((x - it.x) / (it.s / 2), -1, 1);
    const dy = clamp((y - it.y) / (it.s / 2), -1, 1);
    it.el.style.setProperty('--lx', dx.toFixed(2));
    it.el.style.setProperty('--ly', dy.toFixed(2));
  }
  function peek() {
    window.clearTimeout(peekTimer);
    peekTimer = window.setTimeout(peek, 2800 + Math.random() * 2800);
    if (!shown || !onScreen || still() || document.hidden) return;
    const box = list.getBoundingClientRect();
    const seen = items.filter((it) => it !== lifted && it.el.isConnected && box.top + it.hy > 60 && box.top + it.hy < window.innerHeight - 40);
    if (!seen.length) return;
    const it = seen[Math.floor(Math.random() * seen.length)];
    it.el.style.setProperty('--lx', '0');
    it.el.style.setProperty('--ly', '0');
    it.el.classList.add('is-awake');
    window.setTimeout(() => it.el.style.setProperty('--lx', Math.random() < 0.5 ? '-1' : '1'), 380);
    window.setTimeout(() => it.el.style.setProperty('--lx', '0'), 900);
    window.setTimeout(() => { if (it !== lifted) it.el.classList.remove('is-awake'); }, 1250);
  }

  function lift(it) {
    if (lifted === it) return;
    if (lifted) drop(lifted);
    lifted = it;
    it.heavy = true;
    it.el.classList.add('is-lifted');
    if (!still()) it.el.classList.add('is-awake');
    wake();
  }
  function drop(it) {
    if (lifted !== it) return;
    lifted = null;
    it.heavy = false;
    it.el.classList.remove('is-lifted', 'is-awake');
    it.el.style.setProperty('--lx', '0');
    it.el.style.setProperty('--ly', '0');
    wake();
  }
  const find = (target) => items.find((it) => it.el.contains(target));
  const local = (e) => {
    const box = list.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  list.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const it = find(e.target);
    if (it && !grab) lift(it);
  });
  list.addEventListener('pointerleave', () => { pointer = null; if (lifted && !grab) drop(lifted); });
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointer = local(e);
    const it = grab ? grab.it : find(e.target);
    if (!grab && it !== lifted) { if (it) lift(it); else if (lifted) drop(lifted); }
    if (lifted) look(lifted, pointer.x, pointer.y);
    if (grab && !grab.moved && Math.hypot(e.clientX - grab.x0, e.clientY - grab.y0) > 5 && !still()) {
      grab.moved = true;
      grab.it.drag = true;
      grab.it.link.setPointerCapture(e.pointerId);   // only now, so a plain click keeps its target
      root.classList.add('is-dragging');
    }
    if (grab) wake();
  });
  list.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || (e.pointerType !== 'mouse' && e.pointerType !== 'pen')) return;
    const it = find(e.target);
    if (!it) return;
    e.preventDefault();   // no text selection or image drag; the click still comes
    pointer = local(e);
    grab = { it, dx: pointer.x - it.x, dy: pointer.y - it.y, x0: e.clientX, y0: e.clientY, moved: false, pressed: true };
    lift(it);
    wake();
  });
  const release = (e) => {
    if (!grab) return;
    const { it, moved } = grab;
    it.drag = false;
    grab = null;
    root.classList.remove('is-dragging');
    if (moved) suppressClick = true;   // a toss, not a click
    if (e.type === 'pointercancel' || !it.el.contains(document.elementFromPoint(e.clientX, e.clientY))) drop(it);
    wake();
  };
  list.addEventListener('pointerup', release);
  list.addEventListener('pointercancel', release);
  list.addEventListener('click', (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
  }, true);
  list.addEventListener('focusin', (e) => { const it = find(e.target); if (it) lift(it); });
  list.addEventListener('focusout', (e) => { const it = find(e.target); if (it && !list.contains(e.relatedTarget)) drop(it); });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { if (shown) relayout(); }, 150);
  }, { passive: true });
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(root);
  // Only the squares near the screen drift, so a large House stays light.
  const near = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-near', entry.isIntersecting));
  }, { rootMargin: '300px 0px' });
  everyone.forEach((it) => near.observe(it.el));
  reducedMotion.addEventListener('change', () => { if (shown && still()) settleAll(); });

  return {
    show(instant) {
      shown = true;
      layout();
      if (instant || still()) {
        settleAll();
      } else {
        // Everyone arrives, in order, with a small bounce.
        const t = performance.now();
        items.forEach((it, i) => {
          it.x = it.hx; it.y = it.hy; it.vx = it.vy = it.sv = 0; it.scale = 0; it.goal = 0;
          it.appearAt = t + Math.min(i * 45, 700);
          place(it);
        });
        wake();
      }
      peek();
    },
    hide() {
      shown = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
      window.clearTimeout(peekTimer);
      if (lifted) drop(lifted);
    },
    update(visibleCards) {
      const keep = new Set(visibleCards);
      items = everyone.filter((it) => keep.has(it.card));
      everyone.forEach((it) => { it.el.hidden = !keep.has(it.card); });
      if (shown) relayout();
    },
  };
}
