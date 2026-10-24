// Pure time → SVG renderer shared by the browser and the offline exporter.
// Paths are loaded directly from img/brand/logo_red.svg, never redrawn.
export const labels = {
  openingHold: 'Empty canvas', twoTop: '2 · upper half →',
  twoBottom: '2 · lower half ←', one: '1 · upward ↑', dee: 'D · rightward →',
  logoHold: 'Complete beige logo', wipe: 'Red sheet wipes upward', caption: 'A DESIGN HOUSE · slide down', eyes: 'Eyes · blink, right, left, blink', endHold: 'Red logo on beige', returnWipe: 'Red sheet returns downward', captionOut: 'A DESIGN HOUSE · tuck away', reset: 'Logo retracts for loop', loopHold: 'Empty red · loop seam'
};
export const size = 1080;
export const logoWidth = 720;
export const logoBottom = (size+280*logoWidth/829)/2;
// Find the exact time fraction at a spatial point on the existing wipe easing.
export function wipeTimeAt(fraction) {
  let lo=0,hi=1;
  for(let i=0;i<40;i++) {
    const mid=(lo+hi)/2;
    if(ease(mid,.7,0,.2,1)<fraction) lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}
export function validateTiming(timing) {
  for (const key of Object.keys(labels)) {
    if (!Number.isFinite(timing[key]) || timing[key] < 0 || timing[key] > 10000)
      throw new Error(`${key} must be between 0 and 10000 milliseconds`);
  }
  if (duration(timing) <= 0) throw new Error('The sequence needs a positive duration.');
  return timing;
}
export function schedule(timing) {
  const starts = {openingHold: 0, twoTop: timing.openingHold, twoBottom: timing.openingHold, one: timing.openingHold};
  starts.dee = timing.openingHold;
  starts.logoHold = timing.openingHold + Math.max(timing.twoTop, timing.twoBottom, timing.one, timing.dee);
  starts.wipe = starts.logoHold + timing.logoHold;
  starts.eyes = starts.wipe + timing.wipe;
  starts.caption = starts.wipe + timing.wipe*wipeTimeAt(1-logoBottom/size);
  starts.endHold = Math.max(starts.eyes+timing.eyes,starts.caption+timing.caption);
  starts.returnWipe = starts.endHold + timing.endHold;
  starts.captionOutEnd = starts.returnWipe + timing.returnWipe*wipeTimeAt(logoBottom/size);
  starts.captionOut = Math.max(starts.returnWipe,starts.captionOutEnd-timing.captionOut);
  starts.reset = starts.returnWipe + timing.returnWipe;
  starts.loopHold = starts.reset + timing.reset;
  return starts;
}
export const duration = timing => schedule(timing).loopHold + timing.loopHold;
// Solve the CSS cubic-bezier's x coordinate before evaluating y.
export function ease(t, x1, y1, x2, y2) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cubic = (u, a, b) => 3*(1-u)**2*u*a + 3*(1-u)*u*u*b + u**3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (cubic(mid, x1, x2) < t) lo = mid; else hi = mid;
  }
  return cubic((lo + hi) / 2, y1, y2);
}
export function stateAt(time, timing) {
  const starts = schedule(timing);
  let phase = 'loopHold';
  const progress = {};
  for (const key of Object.keys(labels)) {
    const start = starts[key], length = key === 'captionOut' ? starts.captionOutEnd-starts.captionOut : timing[key];
    progress[key] = Math.max(0, Math.min(1, length ? (time-start)/length : time >= start ? 1 : 0));
    if (time >= start && time < start + length) phase = key;
  }
  if (time >= starts.twoTop && time < starts.logoHold) phase = 'construction';
  return {progress, phase};
}
export function sourceAssets(svg, css, beigeSVG, eyesSVG, captionSVG) {
  const inner = source => source?.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  const body = inner(svg), beigeBody = inner(beigeSVG), eyesBody = inner(eyesSVG), captionBody = inner(captionSVG);
  const captionInkBottom = Number(captionSVG?.match(/data-ink-bottom="([\d.]+)"/)?.[1]);
  const ink = css.match(/--ink:\s*(#[\da-f]+)/i)?.[1];
  const red = css.match(/--red:\s*(#[\da-f]+)/i)?.[1];
  const beige = css.match(/--beige:\s*(#[\da-f]+)/i)?.[1];
  if (!captionInkBottom || !captionBody || !ink || !body || !beigeBody || !eyesBody || !red || !beige || !svg.includes('0 0 829 280')) throw new Error('Brand source assets changed; inspect before exporting.');
  const eyePaths = eyesBody.match(/<path\b[^>]*\/>/g) || [];
  const pupils = eyePaths.filter(path => /fill="#FF2B00"/i.test(path)).join('');
  const eyeShell = eyePaths.filter(path => !/fill="#FF2B00"/i.test(path)).join('');
  if (eyePaths.length !== 6 || !pupils || !eyeShell) throw new Error('Inspect supplied eye geometry before separating pupils.');
  return {body, beigeBody, eyesBody, eyeShell, pupils, red, beige, ink, captionBody, captionInkBottom};
}
// Preserve the original first landing blink (0–483ms), then insert the
// 180ms pupil-only glance before the remaining playful blink beats.
// All eye beats scale with timing.eyes; no randomness or browser timers.
function keyframeAt(progress, keys, curve) {
  const ms = Math.max(0, Math.min(1, progress)) * 2100;
  for (let i=1;i<keys.length;i++) {
    if (ms <= keys[i][0]) {
      const [a,from]=keys[i-1], [b,to]=keys[i];
      return from+(to-from)*ease((ms-a)/(b-a),...curve);
    }
  }
  return keys.at(-1)[1];
}
export function blinkAt(progress) {
  return keyframeAt(progress, [[0,1],[126,1],[378,0],[483,1],
    [1193,1],[1245,0],[1319,1],[1460,1],[1540,0],[1620,1],[2100,1]], [.25,.1,.25,1]);
}
export function gazeAt(progress) {
  return keyframeAt(progress, [[0,0],[483,0],[663,12],[1013,12],
    [1193,0],[2100,0]], [.2,.8,.2,1]);
}
// Directional clips reveal the original mark at a constant size.
export function revealAt(progress) {
  return ease(progress, .76, 0, .16, .8);
}
export function eyesAt(progress, assets) {
  return `${assets.eyeShell}<g data-pupils="true" transform="translate(${gazeAt(progress)} 0)">${assets.pupils}</g>`;
}
// Center the visible logo + caption bounds together as the caption emerges.
export function compositionOffset(progress, assets, exitProgress=0) {
  const extension=(12*(logoWidth/240)+assets.captionInkBottom)
    * Math.max(0,ease(progress,.2,.8,.2,1)-ease(exitProgress,.7,0,.85,.55));
  return -extension/2;
}
export function captionAt(progress, assets, exitProgress=0, color=assets.ink) {
  const gap = 12*(logoWidth/240);
  // Start/end at the actual glyph bottom so visible motion matches the crossing.
  const travel=gap+assets.captionInkBottom;
  // Exit accelerates into the mask: no long ease-out tail that looks finished early.
  const offset=-travel*(1-ease(progress,.2,.8,.2,1)+ease(exitProgress,.7,0,.85,.55));
  return `<g data-caption="true" clip-path="url(#caption-reveal)"><g fill="${color}" transform="translate(${(size-logoWidth)/2} ${logoBottom+gap+offset})">${assets.captionBody}</g></g>`;
}
export function renderSVG(time, timing, assets) {
  const {progress: p} = stateAt(time, timing);
  const offset=compositionOffset(p.caption,assets,p.captionOut);
  // Only the clips move; the logo keeps its original size.
  const remaining = 1-ease(p.reset,.7,0,.2,1);
  const slide = key => revealAt(p[key])*remaining;
  const top = slide('twoTop'), bottom = slide('twoBottom');
  const one = slide('one'), dee = slide('dee');
  const wipe = ease(p.wipe, .7, 0, .2, 1);
  const returnWipe = ease(p.returnWipe,.7,0,.2,1);
  const assembled = [top,bottom,one,dee].every(value => value === 1);
  const scale = logoWidth / 829;
  const x = (size-logoWidth)/2, y = (size-280*scale)/2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <defs>
      <clipPath id="caption-reveal"><rect x="0" y="${y+280*scale}" width="1080" height="${size-y-280*scale}"/></clipPath>
      <g id="mark">${assets.body}</g><g id="beige-mark">${assets.beigeBody}</g>
      <clipPath id="scene"><rect width="1080" height="${size*Math.max(1-wipe,returnWipe)}"/></clipPath>
      <clipPath id="construction" clipPathUnits="userSpaceOnUse">
        <rect x="0" y="0" width="${280*top}" height="140"/>
        <rect x="${280*(1-bottom)}" y="140" width="${280*bottom}" height="140"/>
        <rect x="576.8" y="${280*(1-one)}" width="252.2" height="${280*one}"/>
        <rect x="288.4" y="0" width="${280*dee}" height="280"/>
      </clipPath>
    </defs>
    <rect width="1080" height="1080" fill="${assets.beige}"/>
    <g data-composition="true" transform="translate(0 ${offset})">
    ${time >= schedule(timing).caption ? captionAt(p.caption,assets,p.captionOut) : ''}
    <g transform="translate(${x} ${y}) scale(${scale})"><use href="#mark"/>
      ${time >= schedule(timing).eyes ? `<g transform="translate(317 127) scale(1 ${blinkAt(p.eyes)}) translate(0 -24)">${eyesAt(p.eyes,assets)}</g>` : ''}
    </g>
    </g>
    <g clip-path="url(#scene)">
      <rect width="1080" height="1080" fill="${assets.red}"/>
      <g data-composition="true" transform="translate(0 ${offset})">
      ${time >= schedule(timing).returnWipe ? captionAt(p.caption,assets,p.captionOut,assets.beige) : ''}
      <g transform="translate(${x} ${y}) scale(${scale})">
        <use href="#beige-mark" ${assembled ? '' : 'clip-path="url(#construction)"'}/>
      </g>
      </g>
    </g>
  </svg>`;
}
