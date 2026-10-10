import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');
const translations=JSON.parse(readFileSync(new URL('../locales/ja.json',import.meta.url),'utf8'));
const spatial=source.slice(source.indexOf('  const nearest='),source.indexOf('  function draw()'));
const zoom=source.slice(source.indexOf('  function reset(){'),source.indexOf('  function filter(){'));
const pointers=source.slice(source.indexOf('  const canvasPointers='),source.indexOf("  collection.addEventListener('click'"));
const resize=source.slice(source.indexOf('  let measuredWidth='),source.lastIndexOf("  reduced.addEventListener('change'"));
const controls=source.slice(source.indexOf("  zoomInput.addEventListener('input'"),source.indexOf('  const infoButton='));

class Element {
  handlers=new Map();attributes=new Map();captures=new Set();classes=new Set();dataset={};
  classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),remove:(...names)=>names.forEach(name=>this.classes.delete(name)),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
  addEventListener(name,fn,options){if(!this.handlers.has(name))this.handlers.set(name,[]);this.handlers.get(name).push({fn,options})}
  setAttribute(name,value){this.attributes.set(name,value)}
  setPointerCapture(id){if(this.throwCapture)throw Error('Inactive pointer');this.captures.add(id)}
  hasPointerCapture(id){return this.captures.has(id)}
  releasePointerCapture(id){this.captures.delete(id);this.emit('lostpointercapture',{pointerId:id})}
  getBoundingClientRect(){return {left:21,top:37,width:this.clientWidth,height:this.clientHeight}}
  closest(){return null}
  before(){} after(){} focus(){}
  emit(type,props={}){const event={type,target:this,pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:121,clientY:137,defaultPrevented:false,preventDefault(){this.defaultPrevented=true},...props};for(const {fn} of this.handlers.get(type)||[])fn(event);return event}
}
function fixture({width=390,height=844,reduced=false,language='en',mobile=true}={}){
  const canvas=new Element(),page=new Element(),window=new Element(),document=new Element();canvas.clientWidth=width;canvas.clientHeight=height;
  const elements=new Map();document.getElementById=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id)};
  document.querySelector=()=>document.modalOpen?{open:true}:null;
  const zoomInput=new Element(),zoomStatus=new Element(),minus=new Element(),plus=new Element(),media=new Element();minus.dataset.zoomStep='-10';plus.dataset.zoomStep='10';media.matches=mobile;
  let frame=0,timer=0;const frames=new Map(),timers=new Map(),observers=[];
  const context={canvas,page,window,document,zoomInput,zoomStatus,zoomButtons:[minus,plus],mobileZoom:media,
    x:0,y:0,cell:112,row:164,zoom:0,focusMode:false,focusColumn:0,focusRow:0,gesture:null,suppressClick:false,
    motion:null,motionFrame:0,wheelTimer:0,list:false,reduced:{matches:reduced},active:[{id:'item',brand:'Brand',name:'Object'}],catalog:[{id:'item'}],
    indexAt:()=>0,t:text=>language==='ja'?(translations[text]||text):text,schedule(){},clearTiles(){},show(){context.opens++},opens:0,
    requestAnimationFrame(fn){frames.set(++frame,fn);return frame},cancelAnimationFrame(id){frames.delete(id)},
    setTimeout(fn){timers.set(++timer,fn);return timer},clearTimeout(id){timers.delete(id)},
    ResizeObserver:class {constructor(fn){observers.push(fn)}observe(){}}};
  vm.createContext(context);
  vm.runInContext(source.match(/const geometry=.*?;};/s)[0]+spatial+zoom+pointers+controls+resize,context);
  context.reset();observers.forEach(fn=>fn());
  const tick=time=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time))};
  const live=new Map();
  const point=(id,x,y)=>({pointerId:id,isPrimary:id===1,pointerType:'touch',clientX:x+21,clientY:y+37});
  return {c:context,canvas,page,window,document,zoomInput,zoomStatus,minus,plus,media,frames,timers,
    settle(){tick(0);tick(560)},tick,resize(){observers.forEach(fn=>fn())},
    down(id,x,y,extra={}){const props={...point(id,x,y),...extra};live.set(id,props);canvas.emit('pointerdown',props)},
    move(id,x,y){const props={...live.get(id),...point(id,x,y)};live.set(id,props);canvas.emit('pointermove',props)},
    up(id,target=canvas){target.emit('pointerup',live.get(id));live.delete(id)},
    cancel(id){canvas.emit('pointercancel',live.get(id));live.delete(id)},
    click(){canvas.emit('click',{target:{closest:()=>({dataset:{object:'item',column:context.focusColumn,line:context.focusRow}})}})},
    state(){return vm.runInContext('({count:canvasPointers.size,pinch:canvasPinch,cancelled:canvasGestureCancelled})',context)},
    world(cx,cy){return [(cx-context.x)/context.cell,(cy-context.y-context.cell/2)/context.row]},
    zoom(value){context.setZoom(value);tick(0);tick(560)}};
}
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-7,`${message||'coordinate'}: ${a} != ${b}`);
const samePoint=(a,b)=>a.forEach((value,index)=>near(value,b[index],'centroid anchor'));
const pose=c=>[c.x,c.y,c.cell,c.row,c.zoom];

for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1440,900]])for(const reduced of [false,true])for(const language of ['en','ja']){
  const f=fixture({width,height,reduced,language}),c=f.c;f.zoom(35);
  const size=c.cell,anchor=f.world(130,200);
  f.down(1,80,200);f.down(2,180,200);assert.equal(f.canvas.captures.size,2);
  f.move(2,215,225);samePoint(f.world(147.5,212.5),anchor);
  near(c.cell,size*Math.hypot(135,25)/100);assert.equal(c.motion,null);assert.equal(f.frames.size,0);
  f.move(1,90,210);samePoint(f.world(152.5,217.5),anchor);
  assert.equal(f.zoomInput.value,String(c.zoom));assert.match(f.zoomStatus.textContent,/^\d+% /);
  assert.equal(f.page.classes.has('objects-show-labels'),c.zoom>=50);
  const afterPinch=pose(c);f.up(2);assert.deepEqual(pose(c),afterPinch);assert.equal(f.state().count,1);
  const [x,y]=pose(c);f.move(1,110,240);near(c.x,x+20);near(c.y,y+30);f.up(1);
  assert.equal(f.canvas.captures.size,0);assert.equal(f.state().count,0);assert.equal(c.gesture,null);
  f.click();f.click();assert.equal(c.opens,0,'all compatibility clicks after pinch stay suppressed');
  f.down(1,100,200);f.up(1);f.click();assert.equal(c.opens,1,'fresh deliberate tap opens again');
}
console.log('PASS canvas pinch: 20 phone/landscape/tablet/desktop × language × motion configurations, continuous actual-scale zoom, moving centroid, fractional geometry/rounded speech, shared controls and 1→2→1 pan continuity.');

for(const reduced of [false,true]){
  const f=fixture({reduced}),c=f.c;f.zoom(50);f.down(1,30,180);f.down(2,130,180);
  f.move(2,630,180);assert.equal(c.zoom,100);assert.equal(c.focusMode,true);assert.equal(c.motion,null);
  assert.equal(f.plus.attributes.get('aria-disabled'),'true');assert.equal(f.page.classes.has('objects-focused'),true);
  const anchored=pose(c);f.move(2,650,180);near(c.cell,anchored[2]);near(c.x,anchored[0]+10);
  f.move(2,160,180);assert.ok(c.zoom<100,'pinching back into the scale range leaves focus before release');assert.equal(c.focusMode,false);
  f.move(2,50,180);assert.equal(c.zoom,0);assert.equal(f.minus.attributes.get('aria-disabled'),'true');
  f.move(2,45,180);assert.equal(c.zoom,0);f.move(2,100,180);assert.ok(c.zoom>0,'spreading back into the scale range leaves minimum');
  f.move(2,700,180);assert.equal(c.zoom,100);const finalAnchor=pose(c);f.up(2);assert.deepEqual(pose(c),finalAnchor);
  f.up(1);assert.equal(!!c.motion,!reduced);f.settle();
  near(c.x+c.focusColumn*c.cell+c.cell/2,195);near(c.y+c.focusRow*c.row+c.cell/2,422);
  const selected=[c.focusColumn,c.focusRow];f.minus.emit('click');f.settle();assert.equal(c.zoom,75);assert.equal(c.focusMode,false);
  samePoint([Math.round((195-c.x)/c.cell-.5),Math.round((422-c.y-c.cell/2)/c.row)],selected);
}
for(const limit of [0,100])for(const order of [[1,2],[2,1]]){
  const f=fixture();f.zoom(limit);f.down(1,80,200);f.down(2,180,200);const before=pose(f.c);
  for(const id of order)f.move(id,id===1?90:190,225);
  near(f.c.zoom,limit,'two-finger pan retains endpoint zoom');near(f.c.cell,before[2]);near(f.c.x,before[0]+10);near(f.c.y,before[1]+25);
  for(const id of order)f.move(id,id===1?80:180,200);
  pose(f.c).forEach((value,index)=>near(value,before[index],'repeated endpoint pan has no drift'));
}
console.log('PASS pinch limits: paired two-finger translations in either event order have no clamp drift, continuous 100%→zoom-out before release, deferred nearest-object focus, reduced motion and minus-button spatial context.');

{
  const f=fixture(),c=f.c;f.zoom(35);f.down(1,80,200);f.move(1,110,220);const pan=pose(c);
  f.down(2,210,220);assert.deepEqual(pose(c),pan);f.move(2,235,235);const beforeThird=pose(c);
  f.down(3,280,300);f.move(1,150,260);f.move(2,260,260);f.move(3,310,340);assert.deepEqual(pose(c),beforeThird);
  f.up(1);assert.deepEqual(pose(c),beforeThird);assert.equal(f.state().count,2);
  const anchor=f.world(285,300);f.move(3,325,345);samePoint(f.world(292.5,302.5),anchor);
  f.up(3);const [x,y]=pose(c);f.move(2,270,285);near(c.x,x+10);near(c.y,y+25);f.up(2);f.click();assert.equal(c.opens,0);
}
for(const ending of ['cancel','lost capture','blur','hidden','orientation','resize','modal focus','modal move','reset','zoom button','zoom range','keyboard']){
  const f=fixture(),c=f.c;f.zoom(35);f.down(1,80,200);f.down(2,180,200);f.move(2,220,220);
  if(ending==='cancel')f.cancel(2);
  else if(ending==='lost capture')f.canvas.emit('lostpointercapture',{pointerId:2});
  else if(ending==='blur')f.window.emit('blur');
  else if(ending==='hidden'){f.document.hidden=true;f.document.emit('visibilitychange')}
  else if(ending==='orientation')f.window.emit('orientationchange');
  else if(ending==='resize'){f.canvas.clientWidth=844;f.canvas.clientHeight=390;f.resize()}
  else if(ending==='modal focus'){f.document.modalOpen=true;f.document.emit('focusin')}
  else if(ending==='modal move'){f.document.modalOpen=true;f.move(1,85,205)}
  else if(ending==='reset')c.reset();
  else if(ending==='zoom button')f.plus.emit('click');
  else if(ending==='zoom range'){f.zoomInput.value='61';f.zoomInput.emit('input');assert.equal(c.zoom,61);}
  else f.canvas.emit('keydown',{key:'ArrowRight'});
  f.settle();const after=pose(c);assert.equal(f.canvas.captures.size,0,ending);assert.equal(c.gesture,null,ending);
  f.move(1,120,240);f.move(2,260,260);assert.deepEqual(pose(c),after,ending);
  f.down(3,300,300);f.move(3,320,320);assert.deepEqual(pose(c),after,`${ending}: secondary finger cannot revive canceled gesture`);
  f.up(1);f.up(2);f.up(3);f.click();f.click();assert.equal(c.opens,0,ending);
  f.document.modalOpen=false;f.document.hidden=false;f.down(1,100,200);f.up(1);f.click();assert.equal(c.opens,1,ending);
}
console.log('PASS pinch interruptions: third-finger pause/rebase, either-finger release, cancel/lost capture, blur/hidden, orientation/resize, modal opening, reset, controls, keyboard and late compatibility-click suppression.');

{
  const f=fixture({mobile:false}),c=f.c;f.zoom(35);c.setZoom(100);f.tick(0);f.tick(180);
  const actualCell=c.cell;f.down(1,80,200);f.down(2,180,200);f.move(2,190,200);near(c.cell,actualCell*1.1);
  assert.equal(c.motion,null);assert.equal(f.frames.size,0);f.up(2);f.up(1);
  f.zoomInput.value='61';f.zoomInput.emit('input');f.settle();assert.equal(c.zoom,61);
  f.plus.emit('click');f.settle();assert.equal(c.zoom,71);
  f.down(1,100,200);const before=pose(c);f.canvas.emit('wheel',{deltaX:40,deltaY:20,deltaMode:0});assert.deepEqual(pose(c),before);
  const browserZoom=f.canvas.emit('wheel',{ctrlKey:true,deltaX:0,deltaY:30,deltaMode:0});assert.equal(browserZoom.defaultPrevented,false);f.up(1);
  f.window.emit('pointercancel',{pointerId:777});assert.deepEqual(pose(c),before,'unrelated modal pointers do not affect canvas');
  f.down(1,100,200,{pointerType:'mouse'});f.down(2,200,200);assert.equal(f.state().count,1);f.up(1);
  f.down(1,100,200,{target:{closest:()=>({tagName:'BUTTON'})}});assert.equal(f.state().count,0);
}
{
  const f=fixture(),c=f.c;f.zoom(35);f.down(1,80,200);f.down(2,80,200);const before=pose(c);
  f.move(2,81,200);f.move(2,90,200);assert.deepEqual(pose(c),before,'coincident fingertips rebase safely');
  f.move(2,91,200);assert.ok(c.zoom>35);assert.ok(pose(c).every(Number.isFinite));
  f.cancel(1);f.up(2);f.canvas.throwCapture=true;f.down(1,80,200);f.down(2,180,200);assert.equal(c.gesture,null);assert.equal(f.canvas.captures.size,0);
}
assert.match(css,/\.objects-canvas\{[^}]*touch-action:none/);
assert.match(css,/touch-action:pan-x pan-y pinch-zoom/);
for(const route of ['../objects/index.html','../ja/objects/index.html'])assert.doesNotMatch(readFileSync(new URL(route,import.meta.url),'utf8'),/user-scalable=no|maximum-scale=1/);
console.log('PASS pinch integration: in-flight zoom handoff uses rendered scale, desktop slider/buttons synchronize, wheel/key ownership, mixed-pointer/control exclusion, zero-distance/capture-failure recovery and native photo/browser zoom scope. Browser/device rendering remains unverified.');
