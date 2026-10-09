// The 2D1 tote, rendered live. Loaded only when the Shop comes near.
// Units are centimetres. Based on the prototype drawing: black canvas body,
// one long strap (black outside, red inside) sewn to the side panels, a red
// square tag in the left seam, the logo embroidered tone on tone beside it,
// and every pocket on the inside. The front is kept visually square.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';

const W = 38, H = 38, D = 10, R = 1.5, WALL = 0.26;
const ARCH = 34;                    // strap apex above the rim
const TAG = 5.6;
const RED = 0xff2b00;                // Icon Red, the only red
const ASPECT = 0.66;                // the framing box; the poster uses the same box
const FOV = 24, ELEVATION = 11 * Math.PI / 180, DISTANCE = 262, TARGET_Y = 30;
const BASE_ANGLE = 0.6;             // three-quarter view: front and the tag side

// Front-face placements, in cm along the face (s from its left edge) and down from the rim.
// The logo, embroidered at the top right of the front face (s = cm from the face's
// left edge, top = cm down from the rim). Paths from img/brand/logo_eyes.svg.
const LOGO_VB = [610, 200];
const LOGO_W = 5.6;                                  // cm: subtle, not a billboard
const LOGO_H = LOGO_W * LOGO_VB[1] / LOGO_VB[0];
// Top right: the gap from the lower hem stitch (1.85 cm) to the logo equals the
// gap from the logo to the bag's visible right edge (the face ends R before it).
const LOGO_TOP = 4.4, LOGO_MARGIN = LOGO_TOP - 1.85;
const LOGO_AT = { s: (W - 2 * R) + R - LOGO_MARGIN - LOGO_W, top: LOGO_TOP };
const LOGO = [
  'M0.0055584 0H150C177 0 200 21.2281 200 50C200 75.9649 179 100 150 100H200V200H0C0 200 0 171.053 0 150C0 126 19 100 50 100H0L0.0055584 0Z',
  'M305 0C355 0 405 30 405 99.9996C405 170 355 200 305 200H205V0L305 0Z',
  'M609.438 0V200H460V100H410V0L609.438 0Z'
];
// Two square eyes (pixels) inside the D (logo units: centres and half-side). They blink.
const LOGO_EYES = [[253.2, 90.7], [280.3, 90.7]], LOGO_EYE_R = 9.3; // from the logo artwork (26-unit squares at 343/381, y 114 on the 775-unit logo)

/* Deterministic noise ---------------------------------------------------------- */
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function noise2(seed) {
  const r = rng(seed), N = 256, g = new Float32Array(N * N);
  for (let i = 0; i < g.length; i++) g[i] = r() * 2 - 1;
  const at = (x, y) => g[((y & 255) << 8) | (x & 255)];
  const f = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), u = f(x - xi), v = f(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
const n1 = noise2(7), n2 = noise2(19), n3 = noise2(31);
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* Body: a rounded-rectangle tube with soft panels ---------------------------------- */
const SW = W - 2 * R, SD = D - 2 * R, ARC = Math.PI * R / 2;
const SEGS = [
  { k: 'front', len: SW }, { k: 'corner', len: ARC, c: [W / 2 - R, D / 2 - R], a: [Math.PI / 2, 0] },
  { k: 'side', len: SD }, { k: 'corner', len: ARC, c: [W / 2 - R, -D / 2 + R], a: [0, -Math.PI / 2] },
  { k: 'back', len: SW }, { k: 'corner', len: ARC, c: [-W / 2 + R, -D / 2 + R], a: [-Math.PI / 2, -Math.PI] },
  { k: 'side', len: SD, left: true }, { k: 'corner', len: ARC, c: [-W / 2 + R, D / 2 - R], a: [Math.PI, Math.PI / 2] }
];
const PERIM = SEGS.reduce((sum, seg) => sum + seg.len, 0);

function section(s) {
  s = ((s % PERIM) + PERIM) % PERIM;
  for (const seg of SEGS) {
    if (s <= seg.len) {
      const t = s / seg.len;
      if (seg.k === 'front') return { k: 'panel', x: -W / 2 + R + t * SW, z: D / 2, nx: 0, nz: 1, t };
      if (seg.k === 'back') return { k: 'panel', x: W / 2 - R - t * SW, z: -D / 2, nx: 0, nz: -1, t };
      if (seg.k === 'side') return seg.left
        ? { k: 'side', x: -W / 2, z: -D / 2 + R + t * SD, nx: -1, nz: 0, t }
        : { k: 'side', x: W / 2, z: D / 2 - R - t * SD, nx: 1, nz: 0, t };
      const ang = seg.a[0] + (seg.a[1] - seg.a[0]) * t, cx = Math.cos(ang), cz = Math.sin(ang);
      return { k: 'corner', x: seg.c[0] + R * cx, z: seg.c[1] + R * cz, nx: cx, nz: cz, t: 0 };
    }
    s -= seg.len;
  }
  return section(0);
}

function bulge(sec, v, s) {
  const prof = Math.pow(Math.sin(Math.PI * Math.pow(v, 0.82)), 0.75);
  const across = Math.sin(Math.PI * sec.t);
  let b = 0;
  if (sec.k === 'panel') b = 1.75 * Math.pow(across, 0.85) * prof;
  else if (sec.k === 'side') b = 0.55 * across * prof - 0.75 * across * smoothstep(0.62, 1, v);
  const y = v * H;
  // Canvas never sits perfectly still: soft, low wrinkles, strongest mid-panel.
  b += (0.16 * n1(s * 0.11, y * 0.11) + 0.025 * n2(s * 0.5, y * 0.5)) * (0.25 + prof);
  // Two relaxed diagonal folds rising from the bottom corners of each panel.
  if (sec.k === 'panel') {
    const fold = (d) => Math.exp(-(d * d) / 3);
    b -= 0.35 * fold((sec.t * SW) - y * 0.55 - 2) * (1 - v) + 0.3 * fold(((1 - sec.t) * SW) - y * 0.5 - 3) * (1 - v);
  }
  return b - 0.75 * (1 - smoothstep(0, 0.07, v)); // the bottom seam rolls under
}

function sag(sec) { return sec.k === 'panel' ? 0.6 * Math.sin(Math.PI * sec.t) : 0; }

function wall(s, v, inset, out) {
  const sec = section(s);
  const off = bulge(sec, v, s) - inset;
  return out.set(sec.x + sec.nx * off, v * (H - sag(sec)), sec.z + sec.nz * off);
}

function buildBody() {
  const NS = 260, NV = 84;
  const outer = { pos: [], nrm: [], uv: [] }, inner = { pos: [], nrm: [], uv: [] };
  const p = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3(), n = new THREE.Vector3();
  const e = 0.02;
  const v0 = WALL / H;
  for (let j = 0; j <= NV; j++) {
    for (let i = 0; i <= NS; i++) {
      const s = (i / NS) * PERIM;
      for (const [set, inset, vMin, sign] of [[outer, 0, 0, 1], [inner, WALL, v0, -1]]) {
        const v = vMin + (1 - vMin) * (j / NV);
        wall(s, v, inset, p);
        wall(s + e, v, inset, a); wall(s - e, v, inset, b);
        wall(s, Math.min(1, v + e / H), inset, c); wall(s, Math.max(0, v - e / H), inset, d);
        n.crossVectors(a.sub(b), c.sub(d)).normalize().multiplyScalar(sign);
        set.pos.push(p.x, p.y, p.z); set.nrm.push(n.x, n.y, n.z); set.uv.push(i / NS, v);
      }
    }
  }
  const idx = (flip) => {
    const out = [];
    for (let j = 0; j < NV; j++) for (let i = 0; i < NS; i++) {
      const q = j * (NS + 1) + i, r = q + 1, t = q + NS + 1, u = t + 1;
      if (flip) out.push(q, t, r, r, t, u); else out.push(q, r, t, r, u, t);
    }
    return out;
  };
  const geo = (set, flip) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(set.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(set.nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(set.uv, 2));
    g.setIndex(idx(flip));
    return g;
  };

  // Bottom (outside, facing down), floor (inside, facing up), and the rim.
  const ring = (inset, v, y) => {
    const pts = [];
    for (let i = 0; i < NS; i++) { wall((i / NS) * PERIM, v, inset, p); pts.push([p.x, y ?? p.y, p.z]); }
    return pts;
  };
  const cap = (pts, up) => {
    const pos = [0, pts[0][1], 0], nrm = [0, up ? 1 : -1, 0], uv = [0.5, 0.5], index = [];
    pts.forEach(([x, y, z]) => { pos.push(x, y, z); nrm.push(0, up ? 1 : -1, 0); uv.push(0.5 + x / 80, 0.5 + z / 80); });
    for (let i = 1; i <= pts.length; i++) {
      const j = i === pts.length ? 1 : i + 1;
      if (up) index.push(0, i, j); else index.push(0, j, i); // ring runs counter-clockwise seen from above
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(index);
    return g;
  };
  const rim = () => {
    const o = ring(0, 1), k = ring(WALL, 1), pos = [], nrm = [], uv = [], index = [];
    for (let i = 0; i < NS; i++) {
      pos.push(...o[i], ...k[i]); nrm.push(0, 1, 0, 0, 1, 0); uv.push(i / NS, 1, i / NS, 0.99);
      const a0 = i * 2, a1 = ((i + 1) % NS) * 2;
      index.push(a0, a1, a0 + 1, a1, a1 + 1, a0 + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(index);
    return g;
  };
  return {
    outer: geo(outer, false),
    inner: geo(inner, true),
    bottom: cap(ring(0, 0), false),
    floor: cap(ring(WALL, v0, WALL + 0.02), true),
    rim: rim()
  };
}

/* Textures, drawn once ---------------------------------------------------------- */
function heightToNormal(ctx, w, h, strength) {
  const src = ctx.getImageData(0, 0, w, h).data;
  const out = new ImageData(w, h), o = out.data;
  const H0 = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H0(x + 1, y) - H0(x - 1, y)) * strength, dy = (H0(x, y + 1) - H0(x, y - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
    o[i] = (-dx / l * 0.5 + 0.5) * 255; o[i + 1] = (dy / l * 0.5 + 0.5) * 255; o[i + 2] = (1 / l * 0.5 + 0.5) * 255; o[i + 3] = 255;
  }
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').putImageData(out, 0, 0);
  return c;
}

// Height field → RGBA normal map as a DataTexture (height kept in alpha).
function dataNormal(hgt, size, strength, tone) {
  const data = new Uint8Array(size * size * 4);
  const at = (x, y) => hgt[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
    data[i] = (-dx / l * 0.5 + 0.5) * 255; data[i + 1] = (dy / l * 0.5 + 0.5) * 255; data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
    data[i + 3] = Math.max(0, Math.min(255, (tone ? tone[y * size + x] : at(x, y)) * 255));
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

// Plain-weave canvas, 2 cm square, 8 threads per cm. Warp and weft pass over
// and under each other; each yarn has its own thickness (slubs), a 2-ply
// twist, and loose fibres. Alpha holds height, used to shade the gaps.
function weaveTexture(size = 512, threads = 14) {
  const T = size / threads, r = rng(21), warpK = [], weftK = [], warpT = [], weftT = [];
  for (let i = 0; i < threads; i++) { warpK.push(0.8 + r() * 0.32); weftK.push(0.8 + r() * 0.32); warpT.push(0.72 + r() * 0.4); weftT.push(0.72 + r() * 0.4); }
  const slub = noise2(44);
  const cs = (t) => Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.55);
  const arch = (t) => 0.5 + 0.5 * Math.sin(Math.PI * t);
  const hgt = new Float32Array(size * size), tone = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / T, v = y / T, iu = Math.floor(u), iv = Math.floor(v), fu = u - iu, fv = v - iv;
    const over = ((iu + iv) & 1) === 0;
    // Slubs: each yarn thickens and thins along its length (tileable: sampled on a loop).
    const sw = 0.85 + 0.3 * slub(iu * 7.1 + Math.cos(v / threads * Math.PI * 2) * 2, Math.sin(v / threads * Math.PI * 2) * 2);
    const sf = 0.85 + 0.3 * slub(Math.cos(u / threads * Math.PI * 2) * 2 + 40, iv * 7.1 + Math.sin(u / threads * Math.PI * 2) * 2);
    const twistW = 0.9 + 0.1 * Math.sin((fv * 3 + fu * 1.3) * Math.PI * 2);
    const twistF = 0.9 + 0.1 * Math.sin((fu * 3 + fv * 1.3) * Math.PI * 2);
    const warp = cs(fu) * warpK[iu % threads] * sw * (over ? arch(fv) : 0.3 + 0.3 * arch(fv)) * twistW;
    const weft = cs(fv) * weftK[iv % threads] * sf * (over ? 0.3 + 0.3 * arch(fu) : arch(fu)) * twistF;
    const top = Math.max(warp, weft), fuzz = (r() - 0.5) * 0.1;
    hgt[y * size + x] = Math.min(1, top * 0.9 + fuzz * 0.6);
    // Tone: the visible yarn's own shade (heathered black), darker in the gaps.
    const yarn = warp > weft ? warpT[iu % threads] * sw : weftT[iv % threads] * sf;
    tone[y * size + x] = Math.min(1, Math.max(0, 0.18 + 0.72 * Math.pow(top, 0.7) * yarn + fuzz));
  }
  return dataNormal(hgt, size, 3.2, tone);
}

// Fill ("tatami") stitches for the embroidery, 1 cm square: rows of short
// stitches, offset by a third each row, with needle gaps and twisted thread.
function stitchTexture(size = 256) {
  const rows = 21, len = size / 2, rowH = size / rows, r = rng(8);
  const hgt = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const row = Math.floor(y / rowH), fr = (y % rowH) / rowH;
    const fs = ((x + (row % 3) * (len / 3)) % len) / len;
    const prof = Math.pow(Math.sin(Math.PI * fr), 0.5);
    const ends = smoothstep(0, 0.05, fs) * smoothstep(1, 0.95, fs);
    const twist = 0.9 + 0.1 * Math.sin((x / 5 + y / 3) * Math.PI * 2);
    hgt[y * size + x] = prof * (0.25 + 0.75 * ends) * twist + (r() - 0.5) * 0.04;
  }
  return dataNormal(hgt, size, 4);
}

// Woven label, 1 cm square: dense warp threads (22 per cm) running across the
// label with fine weft picks showing between them, like a jacquard name tag.
function labelTexture(size = 256) {
  const warps = 22, picks = 44, r = rng(13), hgt = new Float32Array(size * size), tone = new Float32Array(size * size);
  const W0 = size / warps, P0 = size / picks;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fw = (y % W0) / W0, fp = (x % P0) / P0, iw = Math.floor(y / W0), ip = Math.floor(x / P0);
    const warp = Math.pow(Math.sin(Math.PI * fw), 0.6) * (0.85 + 0.15 * Math.sin(Math.PI * fp + (iw & 1) * Math.PI));
    const pick = ((ip + iw) % 4 === 0) ? 0.55 * Math.pow(Math.sin(Math.PI * fp), 0.8) : 0;
    const h = Math.max(warp, pick) + (r() - 0.5) * 0.05;
    hgt[y * size + x] = h;
    tone[y * size + x] = Math.min(1, 0.3 + 0.7 * h);
  }
  return dataNormal(hgt, size, 3, tone);
}

function flatNormal() {
  const t = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

// Large-scale surface of the body, drawn in cm along the perimeter: hem and
// stitching, seam puckers, creases, wear, lint, and the pucker around the
// embroidery. The weave itself comes from the tiled detail layer.
function bodyTextures(px) {
  const w = Math.round(PERIM * px), h = Math.round(H * px);
  const color = document.createElement('canvas'); color.width = w; color.height = h;
  const height = document.createElement('canvas'); height.width = w; height.height = h;
  const cc = color.getContext('2d'), hc = height.getContext('2d');
  const r = rng(11);
  const X = (cm) => cm * px;

  cc.fillStyle = '#29292d'; cc.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = r() * h, rad = X(8 + r() * 18);
    const g = cc.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, r() > 0.5 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.03)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cc.fillStyle = g; cc.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  hc.fillStyle = '#808080'; hc.fillRect(0, 0, w, h);

  // Bottom seam in shadow; the rolled edges catch a little wear.
  const ao = cc.createLinearGradient(0, h, 0, h - X(2.5));
  ao.addColorStop(0, 'rgba(0,0,0,0.3)'); ao.addColorStop(1, 'rgba(0,0,0,0)');
  cc.fillStyle = ao; cc.fillRect(0, h - X(2.5), w, X(2.5));
  const wear = (x0, y0, x1, y1, a) => { const g = cc.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); return g; };
  cc.fillStyle = wear(0, 0, 0, X(0.5), 0.07); cc.fillRect(0, 0, w, X(0.5));
  cc.fillStyle = wear(0, h - X(0.2), 0, h - X(0.9), 0.05); cc.fillRect(0, h - X(0.9), w, X(0.7));

  // Folded hem: two layers (slightly raised), a crisp fold line, double topstitch.
  const hem = hc.createLinearGradient(0, 0, 0, X(2.7));
  hem.addColorStop(0, '#8e8e8e'); hem.addColorStop(0.93, '#8a8a8a'); hem.addColorStop(1, '#6a6a6a');
  hc.fillStyle = hem; hc.fillRect(0, 0, w, X(2.7));
  const stitch = (yCm) => {
    const y = X(yCm), dash = X(0.3), gap = X(0.14);
    hc.strokeStyle = '#626262'; hc.lineWidth = Math.max(2, X(0.12)); hc.beginPath(); hc.moveTo(0, y); hc.lineTo(w, y); hc.stroke();
    hc.setLineDash([dash, gap]); hc.strokeStyle = '#c8c8c8'; hc.lineWidth = Math.max(1.4, X(0.07)); hc.beginPath(); hc.moveTo(0, y); hc.lineTo(w, y); hc.stroke();
    cc.setLineDash([dash, gap]); cc.strokeStyle = '#46464c'; cc.lineWidth = Math.max(1.2, X(0.06)); cc.beginPath(); cc.moveTo(0, y); cc.lineTo(w, y); cc.stroke();
    hc.setLineDash([]); cc.setLineDash([]);
  };
  stitch(1.2); stitch(1.85);

  // Side seams: a soft groove, light wear on the fold, and puckering where the
  // stitching pulls the canvas.
  let s = 0;
  for (const seg of SEGS) {
    if (seg.k === 'corner') {
      const x = X(s + seg.len / 2);
      const g = hc.createLinearGradient(x - X(0.4), 0, x + X(0.4), 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      hc.fillStyle = g; hc.fillRect(x - X(0.4), 0, X(0.8), h);
      cc.fillStyle = cc.createLinearGradient(x - X(0.5), 0, x + X(0.5), 0);
      const wg = cc.createLinearGradient(x - X(0.5), 0, x + X(0.5), 0);
      wg.addColorStop(0, 'rgba(255,255,255,0)'); wg.addColorStop(0.5, 'rgba(255,255,255,0.045)'); wg.addColorStop(1, 'rgba(255,255,255,0)');
      cc.fillStyle = wg; cc.fillRect(x - X(0.5), 0, X(1), h);
      hc.save(); hc.filter = `blur(${Math.max(1, X(0.08))}px)`;
      for (let y = X(3); y < h - X(1); y += X(1.05 + r() * 0.5)) {
        for (const side of [-1, 1]) {
          hc.strokeStyle = 'rgba(255,255,255,0.35)'; hc.lineWidth = X(0.14);
          hc.beginPath(); hc.moveTo(x + side * X(0.35), y); hc.quadraticCurveTo(x + side * X(0.8), y - X(0.2), x + side * X(1.3), y - X(0.45)); hc.stroke();
          hc.strokeStyle = 'rgba(0,0,0,0.3)';
          hc.beginPath(); hc.moveTo(x + side * X(0.35), y + X(0.35)); hc.quadraticCurveTo(x + side * X(0.8), y + X(0.15), x + side * X(1.3), y - X(0.1)); hc.stroke();
        }
      }
      hc.restore();
    }
    s += seg.len;
  }

  // Creases: canvas remembers folds as crisp grooves with a lit ridge beside.
  const crease = (pts, depth = 1) => {
    hc.save(); hc.filter = `blur(${Math.max(1, X(0.12))}px)`; hc.lineCap = 'round';
    const path = () => { hc.beginPath(); hc.moveTo(X(pts[0][0]), X(pts[0][1])); hc.quadraticCurveTo(X(pts[1][0]), X(pts[1][1]), X(pts[2][0]), X(pts[2][1])); };
    hc.strokeStyle = `rgba(0,0,0,${0.5 * depth})`; hc.lineWidth = X(0.16); path(); hc.stroke();
    hc.translate(X(0.16), -X(0.12)); hc.strokeStyle = `rgba(255,255,255,${0.4 * depth})`; hc.lineWidth = X(0.2); path(); hc.stroke();
    hc.restore();
    cc.save(); cc.filter = `blur(${Math.max(1, X(0.2))}px)`; cc.strokeStyle = 'rgba(255,255,255,0.03)'; cc.lineWidth = X(0.3);
    cc.beginPath(); cc.moveTo(X(pts[0][0] + 0.2), X(pts[0][1])); cc.quadraticCurveTo(X(pts[1][0] + 0.2), X(pts[1][1]), X(pts[2][0] + 0.2), X(pts[2][1])); cc.stroke();
    cc.restore();
  };
  const back = 46.7;
  crease([[3, 37], [9, 27], [19, 17]]);
  crease([[32, 37.4], [28, 31], [24, 25]], 0.8);
  crease([[9, 21.5], [18, 20.2], [27, 21.8]], 0.55);
  crease([[back + 4, 36], [back + 12, 30], [back + 16, 19]], 0.9);
  crease([[back + 30, 37], [back + 24, 28], [back + 21, 22]], 0.7);
  crease([[back + 7, 14], [back + 16, 13], [back + 28, 15]], 0.5);

  // A little lint: black canvas always collects some.
  for (let i = 0; i < 60; i++) {
    const x = r() * w, y = r() * h;
    cc.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.12})`;
    if (r() > 0.7) { cc.strokeStyle = cc.fillStyle; cc.lineWidth = 1; cc.beginPath(); cc.moveTo(x, y); cc.quadraticCurveTo(x + X(0.1), y - X(0.06), x + X(0.18), y + X(0.02)); cc.stroke(); }
    else cc.fillRect(x, y, 1.2, 1.2);
  }

  // Where the embroidery sits: a contact shadow and the pull of the stitches.
  const logoScale = X(LOGO_W) / LOGO_VB[0];
  const paths = LOGO.map((d) => new Path2D(d));
  const marks = (ctx) => {
    ctx.save(); ctx.translate(X(LOGO_AT.s), X(LOGO_AT.top)); ctx.scale(logoScale, logoScale); paths.forEach((p) => ctx.fill(p)); ctx.restore();
  };
  cc.save(); cc.shadowColor = 'rgba(0,0,0,0.75)'; cc.shadowBlur = X(0.18); cc.fillStyle = '#3a3a3f'; marks(cc); cc.restore();
  hc.save(); hc.shadowColor = '#000'; hc.shadowBlur = X(0.22); hc.fillStyle = '#9a9a9a'; marks(hc); hc.restore();

  return { color, normal: heightToNormal(hc, w, h, 2.2) };
}

// Strap: canvas, rolled edges, a line of topstitching along each edge.
function strapTextures() {
  const S = 128; // 4 cm along the strap by its full width
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
  const hC = mk(), hc = hC.getContext('2d');
  const edge = hc.createLinearGradient(0, 0, 0, S);
  edge.addColorStop(0, '#3c3c3c'); edge.addColorStop(0.07, '#808080'); edge.addColorStop(0.93, '#808080'); edge.addColorStop(1, '#3c3c3c');
  hc.fillStyle = edge; hc.fillRect(0, 0, S, S);
  const lines = [0.13, 0.87].map((f) => f * S);
  lines.forEach((y) => { hc.strokeStyle = '#5e5e5e'; hc.lineWidth = 3; hc.beginPath(); hc.moveTo(0, y); hc.lineTo(S, y); hc.stroke(); });
  hc.setLineDash([10, 6]); hc.strokeStyle = '#cfcfcf'; hc.lineWidth = 2;
  lines.forEach((y) => { hc.beginPath(); hc.moveTo(0, y); hc.lineTo(S, y); hc.stroke(); });
  const face = (base, thread) => {
    const c = mk(), ctx = c.getContext('2d');
    ctx.fillStyle = base; ctx.fillRect(0, 0, S, S);
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.08, 'rgba(0,0,0,0)'); g.addColorStop(0.92, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.setLineDash([10, 6]); ctx.strokeStyle = thread; ctx.lineWidth = 2;
    lines.forEach((y) => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke(); });
    return c;
  };
  return { black: face('#26262a', '#48484e'), red: face('#ff2b00', 'rgba(0,0,0,0.2)'), normal: heightToNormal(hc, S, S, 2.4) };
}

// The logo's SVG paths as shapes, in cm with y up and the origin top-left.
function shapeFromPath(d, scale) {
  const sh = new THREE.Shape(), t = d.match(/[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  let i = 0, cmd = '', x = 0, y = 0;
  const P = (a, b) => [a * scale, -b * scale];
  while (i < t.length) {
    if (/^[MLCHVZ]$/i.test(t[i])) cmd = t[i++].toUpperCase();
    if (cmd === 'M') { x = +t[i++]; y = +t[i++]; sh.moveTo(...P(x, y)); cmd = 'L'; }
    else if (cmd === 'L') { x = +t[i++]; y = +t[i++]; sh.lineTo(...P(x, y)); }
    else if (cmd === 'H') { x = +t[i++]; sh.lineTo(...P(x, y)); }
    else if (cmd === 'V') { y = +t[i++]; sh.lineTo(...P(x, y)); }
    else if (cmd === 'C') { const q = t.slice(i, i + 6).map(Number); i += 6; sh.bezierCurveTo(...P(q[0], q[1]), ...P(q[2], q[3]), ...P(q[4], q[5])); x = q[4]; y = q[5]; }
    else if (cmd === 'Z') { sh.closePath(); cmd = ''; }
    else i++;
  }
  return sh;
}

// Raised embroidery that sits on the canvas: extrude, then wrap each vertex
// onto the face (following its bulge) with its normal carried along.
function embroidery(shapes, s0, top, lift = 0) {
  // Clean the outlines first: drop repeated points and pull the points either
  // side of a hairpin cusp apart slightly, so the bevel can't spike.
  const clean = shapes.map((sh) => {
    const pts = sh.getPoints(16).filter((p, i, arr) => i === 0 || p.distanceTo(arr[i - 1]) > 1e-3);
    if (pts.length > 2 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-3) pts.pop();
    return new THREE.Shape(pts);
  });
  // Split into small triangles (≤ 4 mm) so the patch follows the canvas's bulge
  // instead of cutting chords through it.
  const g = new TessellateModifier(0.4, 8).modify(new THREE.ExtrudeGeometry(clean, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.016, bevelOffset: -0.016, bevelSegments: 3, curveSegments: 1 }));
  const pos = g.attributes.position, nrm = g.attributes.normal, uv = g.attributes.uv;
  const P = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), D2 = new THREE.Vector3();
  const T = new THREE.Vector3(), U = new THREE.Vector3(), N = new THREE.Vector3(), n = new THREE.Vector3();
  const e = 0.03, k = Math.SQRT1_2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i) - 0.012 + lift;
    const s = s0 + x, v = 1 - (top - y) / H;
    wall(s, v, 0, P); wall(s + e, v, 0, A); wall(s - e, v, 0, B); wall(s, v + e / H, 0, C); wall(s, v - e / H, 0, D2);
    T.subVectors(A, B).normalize(); U.subVectors(C, D2).normalize(); N.crossVectors(T, U).normalize();
    pos.setXYZ(i, P.x + N.x * z, P.y + N.y * z, P.z + N.z * z);
    n.set(nrm.getX(i), nrm.getY(i), nrm.getZ(i));
    const wx = T.x * n.x + U.x * n.y + N.x * n.z, wy = T.y * n.x + U.y * n.y + N.y * n.z, wz = T.z * n.x + U.z * n.y + N.z * n.z;
    const l = Math.hypot(wx, wy, wz) || 1;
    nrm.setXYZ(i, wx / l, wy / l, wz / l);
    uv.setXY(i, (x + y) * k, (y - x) * k); // fill stitches at 45°
  }
  g.computeBoundingSphere();
  return g;
}

// Layer the woven detail onto any fabric material: its relief is blended into
// the material's own normal map and its gaps darken the colour a little.
function wovenCanvas(material, weave, repeat, { strength = 0.65, cavity = 0.42 } = {}) {
  const uniforms = { weaveMap: { value: weave }, weaveRepeat: { value: new THREE.Vector2(...repeat) }, weaveStrength: { value: strength }, weaveCavity: { value: cavity } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vWeaveUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvWeaveUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D weaveMap; uniform vec2 weaveRepeat; uniform float weaveStrength; uniform float weaveCavity; varying vec2 vWeaveUv;')
      .replace('#include <map_fragment>', '#include <map_fragment>\nfloat weaveH = texture2D( weaveMap, vWeaveUv * weaveRepeat ).a;\ndiffuseColor.rgb *= mix( 1.0 - weaveCavity, 1.0 + weaveCavity * 0.55, weaveH );')
      .replace('#include <normal_fragment_maps>', [
        '#ifdef USE_NORMALMAP_TANGENTSPACE',
        '  vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
        '  mapN.xy *= normalScale;',
        '  vec3 wN = texture2D( weaveMap, vWeaveUv * weaveRepeat ).xyz * 2.0 - 1.0;',
        '  wN.xy *= weaveStrength;',
        '  mapN = normalize( vec3( mapN.xy + wN.xy, mapN.z * wN.z ) );',
        '  normal = normalize( tbn * mapN );',
        '#endif'
      ].join('\n'));
  };
  material.customProgramCacheKey = () => 'woven';
  return material;
}

function shadowBlob() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d'), g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return c;
}

/* Strap: a flat ribbon, black outside, red inside --------------------------------- */
const STRAP_W = 3.6, STRAP_T = 0.3, STRAP_N = 140;
const strapX = W / 2 + 0.28;
function strapCurve(swing) {
  const pts = [];
  const side = (sgn) => [
    [sgn * strapX, H - 7.5, 0],
    [sgn * strapX, H + 1.5, 0],
    [sgn * (strapX + 0.9), H + ARCH * 0.42, swing * 0.35],
    [sgn * strapX * 0.8, H + ARCH * 0.83, swing * 0.8],
    [sgn * strapX * 0.34, H + ARCH * 0.99, swing]
  ];
  side(-1).forEach((q) => pts.push(new THREE.Vector3(...q)));
  side(1).reverse().forEach((q) => pts.push(new THREE.Vector3(...q)));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

function buildStrap() {
  const g = new THREE.BufferGeometry();
  const count = STRAP_N * 8; // 4 faces × 2 edges
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const uv = [];
  for (let i = 0; i < STRAP_N; i++) {
    const u = (i / (STRAP_N - 1)) * 120; // cm along the strap
    for (let f = 0; f < 4; f++) uv.push(u, 0, u, 1);
  }
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const index = [[], [], []]; // outer, inner, edges
  for (let i = 0; i < STRAP_N - 1; i++) {
    for (let f = 0; f < 4; f++) {
      const a = (i * 4 + f) * 2, b = ((i + 1) * 4 + f) * 2;
      const list = f === 0 ? index[0] : f === 1 ? index[1] : index[2];
      list.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const all = [...index[0], ...index[1], ...index[2]];
  g.setIndex(all);
  g.addGroup(0, index[0].length, 0);
  g.addGroup(index[0].length, index[1].length, 1);
  g.addGroup(index[0].length + index[1].length, index[2].length, 0);
  return g;
}

const center = new THREE.Vector3(0, H + ARCH * 0.35, 0);
function shapeStrap(geo, swing) {
  const curve = strapCurve(swing);
  const pos = geo.attributes.position.array, nrm = geo.attributes.normal.array;
  const p = new THREE.Vector3(), t = new THREE.Vector3(), wdir = new THREE.Vector3(), n = new THREE.Vector3(), tmp = new THREE.Vector3();
  const Z = new THREE.Vector3(0, 0, 1);
  const put = (k, v, nn) => { pos[k] = v.x; pos[k + 1] = v.y; pos[k + 2] = v.z; nrm[k] = nn.x; nrm[k + 1] = nn.y; nrm[k + 2] = nn.z; };
  for (let i = 0; i < STRAP_N; i++) {
    const u = i / (STRAP_N - 1);
    curve.getPointAt(u, p); curve.getTangentAt(u, t);
    wdir.copy(Z).addScaledVector(t, -Z.dot(t)).normalize();
    n.crossVectors(t, wdir).normalize();
    if (n.dot(tmp.subVectors(p, center)) < 0) { n.negate(); wdir.negate(); } // outward, keeping n = t × w
    const hw = STRAP_W / 2, ht = STRAP_T / 2;
    const oL = p.clone().addScaledVector(wdir, -hw).addScaledVector(n, ht), oR = p.clone().addScaledVector(wdir, hw).addScaledVector(n, ht);
    const iL = p.clone().addScaledVector(wdir, -hw).addScaledVector(n, -ht), iR = p.clone().addScaledVector(wdir, hw).addScaledVector(n, -ht);
    const base = i * 4 * 2 * 3;
    const ni = n.clone().negate(), wl = wdir.clone().negate();
    // outer (black), inner (red), and the two edges
    put(base, oL, n); put(base + 3, oR, n);
    put(base + 6, iR, ni); put(base + 9, iL, ni);
    put(base + 12, iL, wl); put(base + 15, oL, wl);
    put(base + 18, oR, wdir); put(base + 21, iR, wdir);
  }
  geo.attributes.position.needsUpdate = true;
  geo.attributes.normal.needsUpdate = true;
  geo.computeBoundingSphere();
}

/* X-ray: see-through canvas, the pockets, and what's in them ----------------------- */
// Edges glow, faces stay clear (a fresnel term), written as premultiplied colour
// so layers stack like light on the dark stage.
function xrayMaterial({ color = 0xeef1ff, base = 0.02, edge = 0.55, power = 2.2 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uBase: { value: base }, uEdge: { value: edge }, uPower: { value: power }, uOpacity: { value: 0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uBase, uEdge, uPower, uOpacity; varying vec3 vN; varying vec3 vV; void main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower); float a = clamp((uBase + f * uEdge) * uOpacity, 0.0, 1.0); gl_FragColor = vec4(uColor * a, a); }',
    transparent: true, premultipliedAlpha: true, depthWrite: false, side: THREE.DoubleSide
  });
}

function dashed(points, closed, max = 0.75) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  const m = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.45, gapSize: 0.3, transparent: true, opacity: 0, depthWrite: false });
  m.userData.max = max;
  const line = new (closed ? THREE.LineLoop : THREE.Line)(g, m);
  line.computeLineDistances();
  return line;
}

function keyShape() {
  // A house key: round bow with a hole, a blade with a toothed edge.
  const sh = new THREE.Shape();
  sh.moveTo(-0.38, -1.03);
  sh.lineTo(-0.38, -5.0); sh.lineTo(-0.12, -5.35); sh.lineTo(0.38, -5.1);
  [[0.62, -4.8], [0.38, -4.5], [0.62, -4.2], [0.62, -3.9], [0.38, -3.6], [0.6, -3.3], [0.38, -3.0], [0.38, -1.03]].forEach(([x, y]) => sh.lineTo(x, y));
  sh.absarc(0, 0, 1.1, Math.atan2(-1.03, 0.38), Math.atan2(-1.03, -0.38) + Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0.3, 0.33, 0, Math.PI * 2, true); sh.holes.push(hole);
  return new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 16 });
}

function buildXray(geometries) {
  const group = new THREE.Group();
  const mats = [];
  const dashes = [];
  const mat = (o) => { const m = xrayMaterial(o); mats.push(m); return m; };
  const shell = mat({ base: 0.015, edge: 0.5, power: 2.4 });
  const metal = mat({ base: 0.06, edge: 1, power: 1.6 });
  const plastic = mat({ base: 0.03, edge: 0.55, power: 2 });
  const water = mat({ color: 0x9cc4ff, base: 0.05, edge: 0.3, power: 1.8 });
  const faint = mat({ base: 0.02, edge: 0.22, power: 2 });
  const hot = mat({ color: RED, base: 0.55, edge: 0.5, power: 1.4 });
  const mesh = (geo, m) => { const x = new THREE.Mesh(geo, m); x.renderOrder = 2; group.add(x); return x; };

  geometries.shell.forEach((g) => mesh(g, shell));
  mesh(geometries.strap, shell);
  const tag = mesh(geometries.tag.geometry, hot);
  tag.userData.follow = geometries.tag; // placed from the solid tag each frame

  // Hem stitching, all the way round.
  const hem = [];
  const p = new THREE.Vector3();
  for (let i = 0; i < 240; i++) { wall((i / 240) * PERIM, 1 - 1.25 / H, 0.05, p); hem.push(p.clone()); }
  dashes.push(dashed(hem, true, 0.35));

  const zFront = D / 2 - 0.7, zBack = -D / 2 + 0.7;
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const circlePts = (x, y, z, r, n = 64) => Array.from({ length: n }, (_, i) => v(x + Math.cos((i / n) * Math.PI * 2) * r, y, z + Math.sin((i / n) * Math.PI * 2) * r));

  // ② A band, as wide as the strap, sewn to the inside of the front and wrapped
  // round the bottle's body.
  const BOTTLE = { x: -13.2, z: zFront - 3.35 };
  const bandY = 8.2, bandR = 3.42;
  const band = mesh(new THREE.CylinderGeometry(bandR, bandR, STRAP_W, 64, 1, true), mat({ base: 0.08, edge: 0.7, power: 1.6 }));
  band.position.set(BOTTLE.x, bandY + STRAP_W / 2, BOTTLE.z);
  dashes.push(dashed(circlePts(BOTTLE.x, bandY + 0.3, BOTTLE.z, bandR + 0.02), true, 0.5));
  dashes.push(dashed(circlePts(BOTTLE.x, bandY + STRAP_W - 0.3, BOTTLE.z, bandR + 0.02), true, 0.5));
  // Where it's sewn to the wall: two short box-tacks either side.
  for (const dx of [-bandR * 0.72, bandR * 0.72]) {
    const x = BOTTLE.x + dx, z0 = zFront - 0.05;
    dashes.push(dashed([v(x, bandY + 0.3, z0), v(x, bandY + STRAP_W - 0.3, z0)], false, 0.75));
  }

  // ① Flat and square, on the back wall, inside: AirPods and keys.
  const flat = { x0: -2, x1: 14, y0: 0.6, y1: 16.6 };
  mesh(new THREE.PlaneGeometry(16, 16), faint).position.set((flat.x0 + flat.x1) / 2, (flat.y0 + flat.y1) / 2, zBack + 2.2);
  dashes.push(dashed([v(flat.x0, flat.y1, zBack + 0.4), v(flat.x0, flat.y0, zBack + 0.4), v(flat.x1, flat.y0, zBack + 0.4), v(flat.x1, flat.y1, zBack + 0.4)], false));
  dashes.push(dashed([v(flat.x0, flat.y1, zBack + 2.2), v(flat.x1, flat.y1, zBack + 2.2)], false, 0.4));

  // A slim aluminium bottle, two-thirds full.
  const profile = [[0, 0], [2.95, 0], [3.2, 0.35], [3.2, 15.6], [3.05, 16.9], [2.25, 18.6], [1.45, 19.6], [1.45, 20.5], [0, 20.5]].map(([r, y]) => new THREE.Vector2(r, y));
  const bottle = new THREE.Group();
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 56), metal); body.renderOrder = 2; bottle.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 2.5, 40), metal); cap.position.y = 21.7; cap.renderOrder = 2; bottle.add(cap);
  const liquid = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.3], [2.9, 0.3], [3.0, 0.6], [3.0, 11.5], [0, 11.5]].map(([r, y]) => new THREE.Vector2(r, y)), 48), water); liquid.renderOrder = 2; bottle.add(liquid);
  bottle.position.set(BOTTLE.x, 1.1, BOTTLE.z);
  bottle.rotation.z = 0.035;
  group.add(bottle);

  // AirPods case (landscape), with both earbuds visible through the lid.
  const pods = new THREE.Group();
  const shellCase = new THREE.Mesh(new RoundedBoxGeometry(6.1, 4.6, 2.2, 5, 1.05), plastic); shellCase.renderOrder = 2; pods.add(shellCase);
  const seam = [];
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; seam.push(v(Math.cos(a) * 3.02, 0.75, Math.sin(a) * 1.08)); }
  const seamLine = dashed(seam, true, 0.55); seamLine.material.dashSize = 100; seamLine.material.gapSize = 0; pods.add(seamLine);
  for (const side of [-1, 1]) {
    const bud = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 16), metal); head.scale.set(1, 0.86, 0.8); head.renderOrder = 2; bud.add(head);
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 1.6, 6, 16), metal); stem.position.set(side * 0.35, -1.25, 0); stem.renderOrder = 2; bud.add(stem);
    bud.position.set(side * 1.35, 0.55, 0);
    bud.rotation.z = side * 0.18;
    pods.add(bud);
  }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), metal); led.position.set(0, -0.1, 1.12); led.renderOrder = 2; pods.add(led);
  pods.position.set(3.2, flat.y0 + 2.9, zBack + 1.3);
  pods.rotation.z = -0.1;
  pods.scale.setScalar(1.2); // a touch larger than life, so it reads at phone size
  group.add(pods);

  // Keys on a ring, resting at the bottom of the pocket.
  const keys = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.1, 10, 48), metal); ring.renderOrder = 2; keys.add(ring);
  const kGeo = keyShape();
  [[-0.5, -0.35], [0.45, 0.55]].forEach(([at, turn]) => {
    const k = new THREE.Mesh(kGeo, metal); k.renderOrder = 2;
    k.position.set(Math.sin(at) * 1.35, -Math.cos(at) * 1.35 - 0.3, -0.08);
    k.rotation.z = turn;
    keys.add(k);
  });
  keys.position.set(9.6, flat.y0 + 7.4, zBack + 1.1);
  keys.rotation.z = 0.1;
  keys.scale.setScalar(1.2);
  group.add(keys);

  dashes.forEach((d) => group.add(d));
  group.visible = false;
  return { group, mats, dashes: [...dashes, seamLine] };
}

/* Mount ------------------------------------------------------------------------- */
export function mountTote({ stage, scroller = stage, reducedMotion, spots = [], onChapter = () => {}, presentation = 'story' }) {
  const contained = presentation === 'contained';
  const canvas = document.createElement('canvas');
  canvas.className = 'tote-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-70, 150, 110);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 40, far: 420 });
  key.target.position.set(0, 30, 0);
  scene.add(key.target);
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.06; key.shadow.radius = 4;
  scene.add(key);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.55);
  rimLight.position.set(90, 60, -120);
  scene.add(rimLight);

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const tex = bodyTextures(small ? 16 : 24);
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const canvasTex = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const bodyMap = canvasTex(tex.color, true), bodyNormal = canvasTex(tex.normal, false);
  const weave = weaveTexture(); weave.anisotropy = aniso;
  const stitches = stitchTexture(); stitches.anisotropy = aniso;
  const flat = flatNormal();
  const strapTex = strapTextures();
  const strapTile = (c, srgb) => { const t = canvasTex(c, srgb); t.repeat.set(1 / 4, 1); return t; };
  const strapNormal = strapTile(strapTex.normal, false);

  // Canvas: very rough, a soft fibre sheen, and the weave layered on each
  // surface at its real size (2 cm per tile in that surface's UV units).
  const fabric = { roughness: 0.93, sheen: 0.45, sheenRoughness: 0.75 };
  const WEAVE_BODY = [PERIM / 2, H / 2];
  const canvasMat = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...fabric, map: bodyMap, normalMap: bodyNormal, normalScale: new THREE.Vector2(0.6, 0.6), sheenColor: 0x3a3a40 }), weave, WEAVE_BODY);
  const bottomMat = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...fabric, color: 0x29292d, normalMap: flat, sheenColor: 0x3a3a40 }), weave, [40, 40]);
  const innerMat = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...fabric, color: 0x1c1c1f, normalMap: flat, sheenColor: 0x2e2e34 }), weave, WEAVE_BODY);
  const floorMat = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...fabric, color: 0x1c1c1f, normalMap: flat, sheenColor: 0x2e2e34 }), weave, [40, 40]);
  const hemMat = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...fabric, color: 0x2b2b2f, normalMap: flat, sheenColor: 0x3a3a40 }), weave, [PERIM / 2, 0.6]);
  const webbing = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...fabric, map: strapTile(strapTex.black, true), normalMap: strapNormal, sheenColor: 0x3a3a40 }), weave, [0.5, STRAP_W / 2]);
  const red = { ...fabric, sheenColor: 0xff9a70, sheen: 0.5 };
  const redStrap = wovenCanvas(new THREE.MeshPhysicalMaterial({ ...red, map: strapTile(strapTex.red, true), normalMap: strapNormal }), weave, [0.5, STRAP_W / 2]);
  const label = labelTexture(); label.anisotropy = aniso;
  const redTag = wovenCanvas(new THREE.MeshPhysicalMaterial({ color: RED, roughness: 0.66, sheen: 0.8, sheenRoughness: 0.4, sheenColor: 0xffb08a, normalMap: flat }), label, [TAG, TAG], { strength: 1.7, cavity: 0.5 });
  // Embroidery thread: dark grey, a little glossier than the canvas, with the
  // stretched highlight that runs along stitches.
  const threadMat = new THREE.MeshPhysicalMaterial({ color: 0x5c5c62, roughness: 0.46, normalMap: stitches, normalScale: new THREE.Vector2(1.3, 1.3), sheen: 0.7, sheenRoughness: 0.35, sheenColor: 0x8e8e96, anisotropy: 0.75 });

  const body = buildBody();
  const bag = new THREE.Group();
  const solid = new THREE.Group();
  bag.add(solid);
  const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; solid.add(m); return m; };
  add(body.outer, canvasMat); add(body.bottom, bottomMat); add(body.inner, innerMat); add(body.floor, floorMat); add(body.rim, hemMat);

  // The folded hem rolls over the top edge.
  const hemPts = [];
  const hp = new THREE.Vector3();
  for (let i = 0; i < 260; i++) { wall((i / 260) * PERIM, 1, WALL / 2, hp); hemPts.push(new THREE.Vector3(hp.x, hp.y - 0.1, hp.z)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hemPts, true, 'centripetal'), 520, 0.2, 10, true), hemMat);

  // Embroidery: the logo at the top right of the face.
  const logoShapes = LOGO.map((d) => shapeFromPath(d, LOGO_W / LOGO_VB[0]));
  add(embroidery(logoShapes, LOGO_AT.s, LOGO_AT.top), threadMat).castShadow = false;
  // The eyes: two square pixels of canvas-black thread, raised a touch above the
  // logo so they can blink (each scaled about its own centre).
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x1b1b1e, roughness: 0.5, normalMap: stitches, normalScale: new THREE.Vector2(1.1, 1.1), sheen: 0.5, sheenRoughness: 0.4, sheenColor: 0x55555c });
  const k = LOGO_W / LOGO_VB[0], eyeR = LOGO_EYE_R * k;
  const eyes = LOGO_EYES.map(([cx, cy]) => {
    const d = eyeR * 2;
    const pixel = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(d, 0), new THREE.Vector2(d, -d), new THREE.Vector2(0, -d)]);
    const g = embroidery([pixel], LOGO_AT.s + (cx - LOGO_EYE_R) * k, LOGO_AT.top + (cy - LOGO_EYE_R) * k, 0.03);
    g.computeBoundingBox();
    const c = g.boundingBox.getCenter(new THREE.Vector3());
    g.translate(-c.x, -c.y, -c.z);
    const m = new THREE.Mesh(g, eyeMat);
    m.position.copy(c);
    m.visible = false; // closed until they peek
    solid.add(m);
    return m;
  });

  const strapGeo = buildStrap();
  shapeStrap(strapGeo, 0);
  add(strapGeo, [webbing, redStrap]);
  // The red tag, sewn into the front-left seam and sticking out.
  const tagGroup = new THREE.Group();
  const tag = new THREE.Mesh(new RoundedBoxGeometry(TAG, TAG, 0.3, 4, 0.14), redTag); // folded at the outer edge
  tag.castShadow = tag.receiveShadow = true;
  tag.position.x = -TAG / 2 + 0.9;
  tag.updateMatrix();
  tagGroup.add(tag);
  tagGroup.position.set(-W / 2 + 0.35, 8.6, D / 2 - 0.45);
  tagGroup.rotation.set(0, -0.28, -0.035);
  solid.add(tagGroup);
  const solidMats = [canvasMat, bottomMat, innerMat, floorMat, hemMat, webbing, redStrap, redTag, threadMat, eyeMat];
  solidMats.forEach((m) => { m.transparent = true; });

  const xray = buildXray({ shell: [body.outer, body.bottom], strap: strapGeo, tag });
  bag.add(xray.group);
  // Dark X-ray lines stay readable on the transparent, white-ground preview.
  if (contained) {
    xray.mats.forEach(m => { if (m.uniforms.uColor.value.getHex() !== RED) m.uniforms.uColor.value.setHex(0x303038); });
    xray.dashes.forEach(d => d.material.color.setHex(0x303038));
  }
  const xrayTag = xray.group.children.find((c) => c.userData.follow);
  tagGroup.updateMatrix();
  xrayTag.matrixAutoUpdate = false;
  xrayTag.matrix.multiplyMatrices(tagGroup.matrix, tag.matrix);

  // Spin around the bag's own axis, lean the whole thing a little: airy, not flat.
  const spin = new THREE.Group();
  spin.add(bag);
  const lean = new THREE.Group();
  lean.rotation.set(0.05, 0, -0.045);
  lean.add(spin);
  scene.add(lean);

  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowBlob()), color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.scale.set(W * 1.25, D * 3.4, 1);
  const blobSpin = new THREE.Group();
  blobSpin.position.y = -11;
  blobSpin.add(blob);
  scene.add(blobSpin);

  const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 10, 1000);
  camera.position.set(0, TARGET_Y + DISTANCE * Math.sin(ELEVATION), DISTANCE * Math.cos(ELEVATION));
  camera.lookAt(0, TARGET_Y, 0);

  /* Hotspot anchors, in bag space */
  const anchors = {};
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const onWall = (s, v, name) => {
    wall(s, v, 0, tmp); wall(s + 0.05, v, 0, tmp2);
    const up = new THREE.Vector3(); wall(s, v + 0.002, 0, up);
    const nrm = new THREE.Vector3().crossVectors(tmp2.sub(tmp), up.sub(tmp)).normalize();
    anchors[name] = { p: tmp.clone(), n: nrm };
  };
  onWall(LOGO_AT.s + LOGO_W * 0.12, 1 - (LOGO_AT.top - 0.9) / H, 'logo'); // just above the logo's top-left
  onWall(SW * 0.78, 0.24, 'canvas');                                       // empty lower right of the face
  tagGroup.updateMatrix();
  anchors.tag = { p: new THREE.Vector3(tag.position.x - TAG * 0.2, TAG * 0.5 + 2.2, 0.22).applyMatrix4(tagGroup.matrix), n: new THREE.Vector3(0, 0, 1).applyEuler(tagGroup.rotation) };
  anchors.inside = { p: new THREE.Vector3(0, H - 3, -D / 2 + 1.2), n: new THREE.Vector3(0, 0.7, 0.7).normalize() };
  // Where the story's close-ups look.
  tagGroup.updateMatrix();
  const logoCenter = new THREE.Vector3(); wall(LOGO_AT.s + LOGO_W / 2, 1 - (LOGO_AT.top + LOGO_H / 2) / H, 0, logoCenter);
  const tagCenter = new THREE.Vector3(tag.position.x, 0, 0).applyMatrix4(tagGroup.matrix);
  // The story: scroll progress runs through six chapters. Each has a view the
  // camera eases toward, plus a little drift tied to the scroll within it.
  const CHAPTERS = [
    { key: 'intro', to: 0.13 },
    { key: 'logo', to: 0.27, at: logoCenter, yaw: 0.1, drift: 0.3, dist: 105 },           // 01
    { key: 'tag', to: 0.41, at: tagCenter, yaw: 0.36, drift: 0.3, dist: 100 },            // 02
    { key: 'canvas', to: 0.55, at: new THREE.Vector3(0, H * 0.5, D / 2), yaw: 0.34, drift: 0.7, dist: 175 }, // 03
    { key: 'strap', to: 0.69, at: new THREE.Vector3(0, H + ARCH * 0.3, 0), yaw: 1.15, drift: 0.5, dist: 215 }, // 04
    { key: 'inside', to: 0.84, at: new THREE.Vector3(0, H * 0.42, 0), yaw: 0.46, drift: 0.4, dist: 150, xray: true }, // 05
    { key: 'outro', to: 1 }
  ];
  let chapterKey = null;
  function chapterAt(p) {
    let from = 0;
    for (const c of CHAPTERS) { if (p <= c.to || c.key === 'outro') return { c, t: Math.min(1, Math.max(0, (p - from) / (c.to - from))) }; from = c.to; }
  }
  const strapAnchor = () => {
    const c = strapCurve(swingPos);
    return { p: c.getPointAt(0.78), n: new THREE.Vector3(1, 0.4, 0.4).normalize() };
  };

  /* Framing: always the same 4:5 box, fitted into the stage. */
  let width = 0, height = 0, stickTop = 0;
  function resize() {
    stickTop = parseFloat(getComputedStyle(stage).top) || 0;
    const box = stage.getBoundingClientRect();
    width = Math.max(1, Math.round(box.width)); height = Math.max(1, Math.round(box.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.75 : 2));
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.aspect = aspect;
    camera.fov = aspect >= ASPECT ? FOV : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (ASPECT / aspect)));
    camera.updateProjectionMatrix();
    dirty = true;
  }

  /* Motion state */
  let xr = 0, xrTarget = 0, xrHover = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function hitTest(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    pointer.set((clientX-box.left)/box.width*2-1, -(clientY-box.top)/box.height*2+1);
    bag.updateWorldMatrix(true,true);
    raycaster.setFromCamera(pointer,camera);
    return raycaster.intersectObject(solid,true).length > 0;
  }
  let progress = 0, angle = BASE_ANGLE, drag = 0, dragVel = 0, swingPos = 0, swingVel = 0;
  let last = performance.now(), dirty = true, visible = false, raf = 0, dragging = false, lastX = 0, lastT = 0;
  // Camera: where it looks and how far away, eased toward the current view.
  const DIR = new THREE.Vector3(0, Math.sin(ELEVATION), Math.cos(ELEVATION));
  const look = new THREE.Vector3(0, TARGET_Y, 0), lookGoal = new THREE.Vector3();
  let dist = DISTANCE, offset = 0;
  // Cursor: the bag tilts toward it (vertically), with a little turn.
  let tilt = 0, tiltGoal = 0, turn = 0, turnGoal = 0;
  // Peek: the eyes in the D are closed, and open for a moment every few seconds.
  let blinkAt = performance.now() + 2500, blinkT = -1;
  const PEEK = 1.1; // seconds the eyes stay open
  const still = () => reducedMotion.matches;

  function readScroll() {
    if (contained) { progress = 1; return; }
    const box = scroller.getBoundingClientRect();
    const travel = Math.max(1, box.height - stage.offsetHeight);
    progress = Math.min(1, Math.max(0, (stickTop - box.top) / travel));
  }

  const spotEls = spots.map((el) => ({ el, key: el.dataset.anchor, card: el.querySelector('.spot-card') }));
  // Leader lines: a red dashed rule from the dot out to the label, drawn in an
  // overlay like a spec sheet.
  const NS_SVG = 'http://www.w3.org/2000/svg';
  const leaderSvg = document.createElementNS(NS_SVG, 'svg');
  leaderSvg.setAttribute('class', 'leaders'); leaderSvg.setAttribute('aria-hidden', 'true');
  const leader = document.createElementNS(NS_SVG, 'path'); leader.setAttribute('class', 'leader');
  const tick = document.createElementNS(NS_SVG, 'path'); tick.setAttribute('class', 'leader-tick');
  leaderSvg.append(leader, tick);
  stage.querySelector('.spots')?.prepend(leaderSvg);
  let openKey = null;
  const corners = [];
  for (const x of [-W / 2 - 3, W / 2 + 1]) for (const y of [0, H + ARCH]) for (const z of [-D / 2, D / 2]) corners.push(new THREE.Vector3(x, y, z));
  const world = new THREE.Vector3(), nWorld = new THREE.Vector3(), toCam = new THREE.Vector3(), nm = new THREE.Matrix3(), cp = new THREE.Vector3();
  const project = (v) => { v.project(camera); return [(v.x + 1) / 2 * width, (1 - v.y) / 2 * height]; };
  function placeSpots() {
    bag.updateWorldMatrix(true, false);
    nm.getNormalMatrix(bag.matrixWorld);
    let bagL = Infinity, bagR = -Infinity, bagB = -Infinity;
    for (const c of corners) { const [x, y] = project(cp.copy(c).applyMatrix4(bag.matrixWorld)); bagL = Math.min(bagL, x); bagR = Math.max(bagR, x); bagB = Math.max(bagB, y); }
    let drawn = false;
    for (const { el, key, card } of spotEls) {
      const a = key === 'strap' ? strapAnchor() : anchors[key];
      world.copy(a.p).applyMatrix4(bag.matrixWorld);
      nWorld.copy(a.n).applyMatrix3(nm).normalize();
      const facing = nWorld.dot(toCam.subVectors(camera.position, world).normalize());
      const [x, y] = project(world);
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.classList.toggle('is-away', key !== 'strap' && facing < 0.12 && key !== openKey);
      if (key !== openKey || !card) continue;
      // Wide screens: a horizontal rule to the side of the bag. Narrow: straight down.
      const wide = width >= 700;
      let lx, ly, d, t;
      if (wide) {
        const story = chapterKey && chapterKey !== 'outro' && chapterKey !== 'intro';
        // Story chapters: the spec sits in the left column, under the caption.
        const right = story ? false : x > width / 2;
        if (story) lx = Math.min(x - 40, Math.max(300, width * 0.3));
        else lx = right ? Math.min(width - 300, Math.max(bagR + 36, x + 56)) : Math.max(300, Math.min(bagL - 36, x - 56));
        ly = story ? Math.min(height - 140, Math.max(y, height * 0.56)) : Math.min(height - 220, Math.max(110, y));
        d = `M${x.toFixed(1)} ${y.toFixed(1)} L${lx.toFixed(1)} ${ly.toFixed(1)}`;
        t = `M${lx.toFixed(1)} ${(ly - 7).toFixed(1)} V${(ly + 7).toFixed(1)}`;
        card.className = `spot-card ${right ? 'at-right' : 'at-left'}`;
      } else {
        // Elbow out to the right margin first, so the rule never crosses the object.
        // Story chapters: the label sits just under the caption, above the bag.
        const story = chapterKey && chapterKey !== 'outro' && chapterKey !== 'intro';
        lx = 16;
        const edge = width - 18;
        const cap = story && stage.querySelector(`.chapter[data-chapter="${chapterKey}"]`);
        const capBottom = cap ? cap.getBoundingClientRect().bottom - stage.getBoundingClientRect().top : 0;
        ly = story ? Math.round(Math.max(height * 0.2, capBottom + 22)) : Math.min(height - 250, Math.max(y + 48, bagB + 16));
        d = `M${x.toFixed(1)} ${y.toFixed(1)} H${edge} V${(ly - 10).toFixed(1)}`;
        t = `M${edge - 7} ${(ly - 10).toFixed(1)} H${edge + 7}`;
        card.className = 'spot-card at-below';
      }
      card.style.setProperty('--lx', `${(lx - x).toFixed(1)}px`);
      card.style.setProperty('--ly', `${(ly - y).toFixed(1)}px`);
      leader.setAttribute('d', d); tick.setAttribute('d', t);
      drawn = true;
    }
    leaderSvg.classList.toggle('is-on', drawn);
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!still()) readScroll();
    if (!dragging && !contained) { drag += dragVel * dt; dragVel *= Math.exp(-dt * 3.2); }
    const { c: ch, t: ct } = chapterAt(still() ? 1 : progress);
    if (ch.key !== chapterKey) { chapterKey = ch.key; onChapter(chapterKey); }
    stage.style.setProperty('--chapter-t', ct.toFixed(3)); // fills the current chapter's bar
    // The view: the chapter decides.
    const story = ch.at ? { at: ch.at, yaw: ch.yaw + (ct - 0.5) * ch.drift, dist: ch.dist } : null;
    const f = story;
    let yawGoal;
    if (f) yawGoal = f.yaw;
    else if (contained) yawGoal = BASE_ANGLE;
    else if (ch.key === 'intro') yawGoal = BASE_ANGLE - (1 - ct) * 2.6;          // turning in
    else yawGoal = BASE_ANGLE + (still() ? 0 : smoothstep(0, 0.7, ct) * Math.PI * 2); // one full lap, ending where it started
    // Wrap around the complete goal, including drag, so crossing half a turn
    // cannot add another revolution on every frame. The contained tote has hard stops.
    const draggedYaw = yawGoal + drag;
    let target = contained ? draggedYaw : draggedYaw + Math.PI * 2 * Math.round((angle - draggedYaw) / (Math.PI * 2));
    const ease = (rate) => (still() ? 1 : 1 - Math.exp(-dt * rate));
    if (still()) { tiltGoal = 0; turnGoal = 0; dragVel = 0; }
    tilt += (tiltGoal - tilt) * ease(5);
    turn += (turnGoal - turn) * ease(5);
    target += turn;
    const prev = angle;
    angle = still() ? target : angle + (target - angle) * (1 - Math.exp(-dt * 7));
    const omega = (angle - prev) / Math.max(dt, 1e-3);
    // The strap lags behind the spin and settles like fabric does.
    const force = still() ? 0 : -omega * 1.6;
    swingVel += ((force - swingPos) * 38 - swingVel * 7.5) * dt;
    swingPos += swingVel * dt;
    swingPos = Math.max(-9, Math.min(9, swingPos));
    if (still()) { swingVel = 0; swingPos = 0; }
    shapeStrap(strapGeo, swingPos);
    spin.rotation.y = angle;
    blobSpin.rotation.y = angle;
    // X-ray: cross-fade the solid bag into the see-through one.
    const xrGoal = xrTarget || xrHover || ch.xray ? 1 : 0;
    if(contained) stage.dataset.xray = xrGoal ? 'true' : 'false';
    xr = still() ? xrGoal : xr + (xrGoal - xr) * (1 - Math.exp(-dt * 8));
    if (Math.abs(xrGoal - xr) < 0.002) xr = xrGoal;
    solidMats.forEach((m) => { m.opacity = 1 - xr; m.depthWrite = xr < 0.5; });
    xray.mats.forEach((m) => { m.uniforms.uOpacity.value = xr; });
    xray.dashes.forEach((d) => { d.material.opacity = xr * d.material.userData.max; });
    solid.visible = xr < 0.999;
    xray.group.visible = xr > 0.001;
    blob.material.opacity = 0.2 * (1 - xr);
    const rise = !still() && ch.key === 'intro' ? -(1 - ct) * 16 : 0;          // the bag rises in
    lean.position.y += (rise - lean.position.y) * ease(6);
    lean.rotation.x = 0.05 + tilt;
    // Blink.
    if (!contained && !still() && now >= blinkAt && blinkT < 0) blinkT = 0;
    // Closed by default: every few seconds they open for a moment, like the logo in the bar.
    if (blinkT >= 0) { blinkT += dt; if (blinkT > PEEK) { blinkT = -1; blinkAt = now + 3400 + Math.random() * 2800; } }
    const lid = !still() && blinkT >= 0 ? Math.min(1, blinkT / 0.12, (PEEK - blinkT) / 0.12) : 0;
    eyes.forEach((e) => { e.visible = lid > 0.01; e.scale.y = Math.max(0.01, lid); });
    // Camera toward the focus (or back to the whole bag), label room to the side.
    lean.updateWorldMatrix(true, true);
    if (f) lookGoal.copy(f.at).applyMatrix4(bag.matrixWorld);
    else lookGoal.set(0, TARGET_Y + (ch.key === 'intro' && !still() ? (1 - ct) * 26 : 0), 0); // intro: the bag sits low, under the title
    look.lerp(lookGoal, ease(4.5));
    const introDist = ch.key === 'intro' && !still() ? DISTANCE + (1 - ct) * 170 : DISTANCE;
    const phoneBack = width < 700 ? 1.6 : 1;                                             // phones: step back so the words have room
    const fDist = f ? f.dist * phoneBack : introDist;
    dist += (fDist - dist) * ease(4.5);
    // Room for words: a story chapter pushes the bag right (caption on the
    // left); phones shift it down instead.
    const offGoal = contained ? 0 : story ? -0.8 : (width < 700 && ch.key === 'outro' ? -0.45 : 0);
    offset += (offGoal - offset) * ease(4.5);
    camera.position.copy(look).addScaledVector(DIR, dist);
    camera.lookAt(look);
    if (Math.abs(offset) > 0.001) {
      if (width >= 700) camera.setViewOffset(width, height, width * 0.12 * offset, 0, width, height);
      else camera.setViewOffset(width, height, 0, height * 0.3 * offset, width, height); // phones: bag low, words on top
    } else camera.clearViewOffset();
    lean.rotation.z = -0.045 + (still() ? 0 : Math.max(-0.05, Math.min(0.05, omega * -0.012)));
    renderer.render(scene, camera);
    placeSpots();
    const moving = blinkT >= 0 || look.distanceTo(lookGoal) > 0.01 || Math.abs(dist - fDist) > 0.01 || Math.abs(offset - offGoal) > 0.001 || Math.abs(lean.position.y - rise) > 0.01 || Math.abs(tilt - tiltGoal) > 1e-4 || Math.abs(turn - turnGoal) > 1e-4 || xr !== xrGoal || Math.abs(target - angle) > 1e-4 || Math.abs(swingVel) > 1e-3 || Math.abs(swingPos) > 1e-3 || Math.abs(dragVel) > 1e-3 || dirty;
    dirty = false;
    if (visible && !document.hidden && moving) request();
  }
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const wake = () => { dirty = true; request(); };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }, { rootMargin: '10% 0px' });
  io.observe(stage);
  const ro = new ResizeObserver(() => { resize(); wake(); });
  ro.observe(stage);
  if (!contained) window.addEventListener('scroll', wake, { passive: true });
  reducedMotion.addEventListener('change', wake);
  if (!contained) window.setInterval(() => { if (visible && !still() && performance.now() >= blinkAt) request(); }, 500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) wake(); });
  // The bag follows a fine pointer anywhere over the stage.
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  (contained ? stage : window).addEventListener('pointermove', (e) => {
    if (!visible || still() || !fine.matches || dragging || e.pointerType !== 'mouse') return;
    const box = stage.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / (box.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (box.top + box.height / 2)) / (box.height / 2)));
    tiltGoal = ny * 0.2; turnGoal = nx * 0.22;
    request();
  }, { passive: true });
  if (contained) stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !fine.matches) return;
    const next = hitTest(e.clientX,e.clientY);
    if (next !== xrHover) { xrHover=next; request(); }
  }, {passive:true});
  stage.addEventListener('pointerleave', () => { xrHover=false; tiltGoal = 0; turnGoal = 0; request(); });

  // Preserve the older story interaction; the current contained tote only follows the pointer.
  if (!contained) {
  // Drag to turn it yourself (horizontal only; vertical swipes still scroll).
  canvas.addEventListener('pointerdown', (e) => {
    if (still()) return;
    dragging = true; lastX = e.clientX; lastT = e.timeStamp; dragVel = 0;
    canvas.setPointerCapture(e.pointerId); stage.classList.add('is-grabbing');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || still()) return;
    const dx = e.clientX - lastX, dtm = Math.max(1, e.timeStamp - lastT);
    if (contained) {
      drag = Math.max(-Math.PI, Math.min(Math.PI, drag + dx * 0.004));
      dragVel = 0;
    } else { drag += dx * 0.012; dragVel = (dx * 0.012) / (dtm / 1000); }
    lastX = e.clientX; lastT = e.timeStamp; wake();
  });
  const release = () => { dragging = false; if (still() || contained) dragVel = 0; stage.classList.remove('is-grabbing'); wake(); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);

  }

  resize();
  readScroll();
  angle = BASE_ANGLE;
  stage.prepend(canvas);
  renderer.render(scene, camera);
  placeSpots();

  return {
    canvas,
    hitTest,
    setXray(on) { xrTarget = on ? 1 : 0; wake(); },
    setOpen(key) { openKey = key; wake(); },
    // Renders the resting three-quarter view into a transparent PNG (used to make the poster).
    snapshot(w = 960, h = 1200) {
      const keep = [width, height, angle, swingPos];
      renderer.setPixelRatio(1); renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.fov = FOV; camera.updateProjectionMatrix();
      camera.clearViewOffset(); camera.position.set(0, TARGET_Y + DISTANCE * Math.sin(ELEVATION), DISTANCE * Math.cos(ELEVATION)); camera.lookAt(0, TARGET_Y, 0);
      spin.rotation.y = blobSpin.rotation.y = BASE_ANGLE; shapeStrap(strapGeo, 0); lean.position.y = 0; lean.rotation.set(0.05, 0, -0.045); eyes.forEach((e) => { e.visible = false; });
      renderer.render(scene, camera);
      const url = canvas.toDataURL('image/png');
      [width, height, angle, swingPos] = keep;
      resize(); wake();
      return url;
    }
  };
}
