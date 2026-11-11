/* First-visit rigid block drop: three rebounds, three impact color inversions. */
(() => {
  const root = document.documentElement;
  const cover = document.querySelector('.practice-home > .landing-cover');
  if (!cover || !root.classList.contains('is-landing')) return;
  const mark = cover.querySelector('.landing-mark');
  const eye = cover.querySelector('.landing-eye-blink');
  const pupils = cover.querySelector('.landing-eye-pupils');
  // Original logo-intro eye geometry and timing, including pupil-only gaze.
function ease(t, x1, y1, x2, y2) {
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
function keyframeAt(progress, keys, curve, length=2100) {
  const ms = Math.max(0, Math.min(1, progress)) * length;
  for (let i=1;i<keys.length;i++) {
    if (ms <= keys[i][0]) {
      const [a,from]=keys[i-1], [b,to]=keys[i];
      return from+(to-from)*ease((ms-a)/(b-a),...curve);
    }
  }
  return keys.at(-1)[1];
}
function blinkAt(progress) {
  return keyframeAt(progress, [[0,0],[300,1],
    [1193,1],[1245,0],[1319,1],[1460,1],[1540,0],[1620,1],[2100,1]], [.25,.1,.25,1]);
}
function gazeAt(progress) {
  return keyframeAt(progress, [[0,0],[483,0],[663,12],[1013,12],
    [1193,0],[2100,0]], [.2,.8,.2,1]);
}

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  let frame, start;
  const entrances=[];
  function revealPage() {
    root.classList.add('is-landing-revealing');
    const entranceStart = document.timeline.currentTime;
    const groups=[
      ['.practice-byline', 'left', 0],
      ['#page-navigation, .mobile-nav-toggle', 'left', 60],
      ['.practice-switch', 'top', 40],
      ['.fixed-social-links, .site-footer .social-links, .practice-fixed-language, .persistent-language', 'bottom', 120],
      ['.practice-caption', 'right', 140],
      ['.practice-media', 'depth', 0]
    ];
    groups.forEach(([selector,direction,delay]) => {
      document.querySelectorAll(selector).forEach(element => {
        const box=element.getBoundingClientRect();
        const style=getComputedStyle(element);
        if (!box.width || !box.height || box.bottom<0 || box.top>innerHeight || style.visibility==='hidden' || Number(style.opacity)===0) return;
        const opacity=style.opacity;
        let frames;
        if (direction==='depth') {
          frames=[{transform:'perspective(1000px) translateZ(-900px)',opacity:0},
                  {transform:style.transform==='none'?'perspective(1000px) translateZ(0)':style.transform,opacity}];
        } else {
          const offset=direction==='left'?`${-box.right-24}px 0`:
            direction==='right'?`${innerWidth-box.left+24}px 0`:
            direction==='top'?`0 ${-box.bottom-24}px`:`0 ${innerHeight-box.top+24}px`;
          frames=[{translate:offset,opacity:0},{translate:'0 0',opacity}];
        }
        const animation = element.animate(frames,{duration:900,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
        animation.startTime = entranceStart;
        entrances.push(animation);
      });
    });
  }
  const finish = () => {
    root.classList.remove('is-landing', 'is-landing-revealing');
    cancelAnimationFrame(frame);
    entrances.forEach(animation=>animation.cancel());
    listeners.abort();
  };
  const options = {signal:listeners.signal, passive:true};
  ['wheel','touchstart','pointerdown','keydown','pagehide','resize'].forEach(type => window.addEventListener(type,finish,options));
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); },options);
  if (reduced.matches) return finish();
  const width = mark.offsetWidth;
  const height = mark.offsetHeight;
  const fall = innerHeight + height;
  const lift = Math.min(innerHeight * .24, width * .2);
  // Fall, then three successively smaller ballistic rebounds. Last contact rests.
  const impacts = [850,1510,1910];
  const rest = 2150;
  // Hold for 0.7 seconds after the final blink has reopened.
  const dockAt = rest + 1439 * (1620 / 2100) + 700;
  const phases = [
    {from:850,to:1510,lift,angle:-6,end:3},
    {from:1510,to:1910,lift:lift*.34,angle:3,end:-1.2},
    {from:1910,to:rest,lift:lift*.09,angle:-1.2,end:0}
  ];
  let inversions = -1, settled = false, dock;
  function tick(now) {
    if (listeners.signal.aborted) return;
    start ??= now;
    const elapsed = now-start;
    let y=0, angle=0;
    if (elapsed < impacts[0]) {
      const p=elapsed/impacts[0];
      y=-fall*(1-p*p);
      angle=-14+8*p;
    } else if (elapsed < rest) {
      const phase=phases.find(phase=>elapsed<phase.to);
      const p=(elapsed-phase.from)/(phase.to-phase.from);
      y=-4*phase.lift*p*(1-p);
      angle=phase.angle+(phase.end-phase.angle)*p;
    }
    // Lift the lower rotated corner so the rigid logo never penetrates the floor.
    y-=Math.abs(Math.sin(angle*Math.PI/180))*width/2;
    mark.style.transform=`translateY(${y}px) rotate(${angle}deg)`;
    const count=impacts.filter(time=>elapsed>=time).length;
    if (count!==inversions) {
      inversions=count;
      cover.classList.toggle('is-inverted',count%2===1);

    }
    const eyeProgress=Math.max(0,Math.min(1,(elapsed-rest)/1439));
    eye.setAttribute('transform',`translate(317 127) scale(1 ${blinkAt(eyeProgress)}) translate(0 -24)`);
    pupils.setAttribute('transform',`translate(${gazeAt(eyeProgress)} 0)`);
    if (elapsed>=rest && !settled) { settled=true;cover.classList.add('is-settled'); }
    if (elapsed>=dockAt) {
      if (!dock) {
        const from=mark.getBoundingClientRect();
        const to=document.querySelector('.practice-home > .site-logo').getBoundingClientRect();
        dock={x:to.left-from.left,y:to.top-from.top,scale:to.width/from.width};
        mark.style.transformOrigin='0 0';
        cover.classList.add('is-docking');
        revealPage();
      }
      // Ease gently out of the resting pose, then settle softly into the header.
      const progress=Math.min(1,(elapsed-dockAt)/1550);
      const amount=ease(progress,.45,0,.25,1);
      mark.style.transform=`translate(${dock.x*amount}px,${dock.y*amount}px) scale(${1+(dock.scale-1)*amount})`;
      cover.style.backgroundColor=`rgba(250,240,230,${1-amount})`;
      // Close the eyes as docking begins, using the original blink easing.
      const closing=1-ease(Math.min(1,progress*1100/120),.25,.1,.25,1);
      eye.setAttribute('transform',`translate(317 127) scale(1 ${closing}) translate(0 -24)`);
      if (progress===1) return finish();
    }
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
})();
