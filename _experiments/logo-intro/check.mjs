import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {duration,schedule,ease,validateTiming,stateAt,renderSVG,sourceAssets,logoWidth,logoBottom,blinkAt,gazeAt,revealAt,eyesAt,captionAt,compositionOffset} from './animation.mjs';
const read = path=>readFile(new URL(path,import.meta.url),'utf8');
const timing=validateTiming(JSON.parse(await read('timing.json')));
const assets=sourceAssets(await read('../../img/brand/logo_red.svg'),await read('../../css/walla.css'),await read('../../img/brand/logo_beige.svg'),await read('../../img/brand/eyes-on-red.svg'),await read('caption.svg'));
const starts=schedule(timing);
assert.equal(duration(timing),5000,'Social master is exactly five seconds.');
const during=stateAt(timing.openingHold+timing.one/2,timing);
assert.equal(during.phase,'construction');
for(const key of ['twoTop','twoBottom','one','dee']) assert.equal(during.progress[key],.5);
assert.equal(during.progress.dee,.5);
assert.equal(starts.dee,timing.openingHold);
assert.equal(schedule({...timing,one:1200}).logoHold,timing.openingHold+1200,'Completion tracks the longest extrusion.');
const raster=source=>sharp(Buffer.from(source)).removeAlpha().raw().toBuffer();
const scale=logoWidth/829, x=(1080-logoWidth)/2,y=(1080-280*scale)/2;
const expected=(bg,body,eyes='',caption='',offset=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><defs><clipPath id="caption-reveal"><rect x="0" y="${logoBottom}" width="1080" height="${1080-logoBottom}"/></clipPath></defs><rect width="1080" height="1080" fill="${bg}"/><g transform="translate(0 ${offset})">${caption}<g transform="translate(${x} ${y}) scale(${scale})">${body}${eyes}</g></g></svg>`;
assert.ok((await raster(renderSVG(starts.logoHold,timing,assets))).equals(await raster(expected(assets.red,assets.beigeBody))),'Complete beige logo must equal original asset.');
assert.ok((await raster(renderSVG(starts.endHold,timing,assets))).equals(await raster(expected(assets.beige,assets.body,`<g transform="translate(317 103)">${eyesAt(1,assets)}</g>`,captionAt(1,assets).replace('clip-path="url(#caption-reveal)"',''),compositionOffset(1,assets)))),'Beige hold must equal original red logo plus exact supplied eyes.');
assert.ok(!renderSVG(starts.caption-1,timing,assets).includes('data-caption'), 'Caption waits until the wipe crosses the logo bottom.');
assert.ok(Math.abs(1080*(1-ease((starts.caption-starts.wipe)/timing.wipe,.7,0,.2,1))-logoBottom)<1e-6,'Entrance starts at the logo bottom crossing.');
assert.ok(renderSVG(starts.caption+timing.caption,timing,assets).includes(captionAt(1,assets)), 'Caption reaches the website placement.');
for (const entry of [0,.25,.5,.75,1]) {
  for (const exit of [0,.25,.5,.75,1]) {
    const shift=compositionOffset(entry,assets,exit);
    const extension=(36+assets.captionInkBottom)*Math.max(0,ease(entry,.2,.8,.2,1)-ease(exit,.7,0,.85,.55));
    assert.ok(Math.abs((y+shift+logoBottom+extension+shift)/2-540)<1e-9,'Visible composition stays vertically centered.');
  }
}
const empty=await raster(renderSVG(0,timing,assets));
assert.ok(empty.equals(Buffer.alloc(empty.length,Buffer.from([255,43,0]))),'Opening is uniform Icon Red.');
assert.ok(!renderSVG(starts.eyes-1,timing,assets).includes('data-pupils'),'Eyes only appear after wipe.');
for (const ms of [378,1245,1540]) assert.equal(blinkAt(ms/2100),0);
assert.equal(blinkAt(1),1);
assert.equal(gazeAt(0),0);assert.equal(gazeAt(483/2100),0);
assert.equal(gazeAt(800/2100),12);assert.equal(gazeAt(1193/2100),0);
assert.equal(gazeAt(1),0);
assert.equal(revealAt(0),0);assert.equal(revealAt(1),1);
for (let i=1;i<=100;i++) assert.ok(revealAt(i/100)>=revealAt((i-1)/100), 'Extrusion never recoils.');
assert.ok(revealAt(.25)<.1 && revealAt(.75)>.85, 'Strong acceleration into completion.');
assert.ok(1-revealAt(.99)>.002, 'Keep the final edges moving through the end of extrusion.');
for (const ms of [0,150,400,700,900,1050]) {
  const markup=renderSVG(ms,timing,assets);
  assert.ok(!markup.includes('data-logo-pop'), 'No animated logo scale.');
  assert.equal((markup.match(/scale\(/g)||[]).length,2,'Only static logo placement transforms during extrusion.');
}
assert.ok(Math.abs(1080*ease((starts.captionOutEnd-starts.returnWipe)/timing.returnWipe,.7,0,.2,1)-logoBottom)<1e-6,'Exit finishes at the logo bottom crossing.');
assert.equal(stateAt(starts.captionOutEnd,timing).progress.captionOut,1);
const captionRegion = async time => sharp(Buffer.from(renderSVG(time,timing,assets)))
  .extract({left:180,top:Math.ceil(logoBottom),width:720,height:150}).removeAlpha().raw().toBuffer();
const hiddenCaption = await captionRegion(starts.captionOutEnd);
assert.ok(hiddenCaption.equals(Buffer.alloc(hiddenCaption.length,Buffer.from([250,240,230]))),'No text remains below the logo at the crossing.');
for(const frames of [1,3,6]) {
  assert.ok(!(await captionRegion(starts.captionOutEnd-frames*1000/60)).equals(hiddenCaption),'Caption remains visibly below the logo until the final frames.');
}
assert.equal(starts.reset,starts.returnWipe+timing.returnWipe);
for(const variant of [{...timing,wipe:1600,returnWipe:800},{...timing,captionOut:2000}]) {
  const t=schedule(variant);
  assert.ok(t.captionOut>=t.returnWipe);
  assert.equal(stateAt(t.captionOutEnd,variant).progress.captionOut,1);
  assert.ok(Math.abs(1080*ease((t.captionOutEnd-t.returnWipe)/variant.returnWipe,.7,0,.2,1)-logoBottom)<1e-6);
}
assert.ok((await raster(renderSVG(starts.reset,timing,assets))).equals(await raster(expected(assets.red,assets.beigeBody))), 'Return wipe restores beige logo on red before reset.');
assert.ok((await raster(renderSVG(duration(timing),timing,assets))).equals(empty),'Loop end exactly matches the opening.');
assert.ok((await raster(renderSVG(duration(timing)-1000/60,timing,assets))).equals(empty),'Last exported frame matches the opening.');
// Compare both sides of the wipe with the same caption exit position.
for(const seamY of [540,750]) {
  let lo=0,hi=1;
  for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(ease(mid,.7,0,.2,1)<seamY/1080)lo=mid;else hi=mid;}
  const time=starts.returnWipe+(lo+hi)/2*timing.returnWipe;
  const exitProgress=stateAt(time,timing).progress.captionOut;
  const returning=await raster(renderSVG(time,timing,assets));
  const before=await raster(expected(assets.beige,assets.body,`<g transform="translate(317 103)">${eyesAt(1,assets)}</g>`,captionAt(1,assets,exitProgress),compositionOffset(1,assets,exitProgress)));
  const after=await raster(expected(assets.red,assets.beigeBody,'',captionAt(1,assets,exitProgress,assets.beige),compositionOffset(1,assets,exitProgress)));
  const seam=seamY*1080*3;
  assert.ok(returning.subarray(0,seam).equals(after.subarray(0,seam)), 'Wipe inverts logo and caption above its edge.');
  assert.ok(returning.subarray(seam).equals(before.subarray(seam)), 'Below the wipe stays unchanged.');
}
assert.equal(stateAt(starts.captionOut+10,timing).phase,'captionOut');
for (const progress of [0,800/2100,1]) {
  const markup=renderSVG(starts.eyes+progress*timing.eyes,timing,assets);
  assert.ok(markup.includes('translate(317 127)'), 'Eye shell position stays fixed.');
  assert.ok(markup.includes(assets.eyeShell), 'Original white shapes remain unchanged.');
}
const first=await raster(renderSVG(720,timing,assets));
assert.ok(first.equals(await raster(renderSVG(720,timing,assets))));
assert.throws(()=>validateTiming({...timing,twoTop:-1}));
console.log('Verified fixed-size extrusion, caption entry/exit locked to wipe crossing and pixel-identical loop seam and pupil-only left → right → left gaze, original beige/red geometry and eyes, red opening, eye timing/blink, deterministic frames.');
