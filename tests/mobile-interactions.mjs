import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { bindTouchRotation } from '../js/tote-touch.js';
class Surface {
  handlers = new Map(); captures = new Set();
  addEventListener(name, fn) { const list = this.handlers.get(name) || []; list.push(fn); this.handlers.set(name,list); }
  emit(name, props = {}) { for(const fn of this.handlers.get(name) || [])fn({ pointerId:1,pointerType:'touch',isPrimary:true,clientX:100,clientY:100,target:this,...props }); }
  hasPointerCapture(id) { return this.captures.has(id); }
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  getBoundingClientRect() { return {width:342}; }
}
globalThis.window = new Surface(); globalThis.document = new Surface();
const stage = new Surface(), limit = Math.PI * .75;
let angle = 0, dragging = false, changes = 0, hit = true;
bindTouchRotation({stage,limit,hitTest:()=>hit,getAngle:()=>angle,setAngle:v=>{angle=v;changes++;},setDragging:v=>dragging=v});
stage.emit('pointerdown'); stage.emit('pointermove',{clientX:104});
assert.equal(changes,0); assert.equal(stage.captures.size,0);
stage.emit('pointerup'); assert.equal(changes,0);
stage.emit('pointerdown'); stage.emit('pointermove',{clientY:125,clientX:110});
assert.equal(changes,0); assert.equal(dragging,false); assert.equal(stage.captures.size,0);
stage.emit('pointermove',{clientX:250}); assert.equal(changes,0);
stage.emit('pointerdown'); stage.emit('pointermove',{clientX:150});
assert.equal(dragging,true); assert.equal(stage.hasPointerCapture(1),true); assert.ok(angle>0);
stage.emit('lostpointercapture',{target:{tagName:'CANVAS'}}); assert.equal(dragging,true);
stage.emit('pointermove',{pointerId:2,clientX:300}); const held = angle;
stage.emit('pointerup',{pointerId:2}); assert.equal(dragging,true);
stage.emit('pointerup'); assert.equal(dragging,false); assert.equal(angle,held); assert.equal(stage.captures.size,0);
stage.emit('pointerdown'); stage.emit('pointermove',{clientX:1100}); assert.equal(angle,limit);
stage.emit('pointermove',{clientX:-1000}); assert.equal(angle,-limit);
stage.emit('pointercancel'); assert.equal(dragging,false); assert.equal(stage.captures.size,0);
const beforeMouse = changes;
stage.emit('pointerdown',{pointerType:'mouse'}); stage.emit('pointermove',{pointerType:'mouse',clientX:400});assert.equal(changes,beforeMouse);
stage.emit('pointerdown',{isPrimary:false}); stage.emit('pointermove',{clientX:400}); assert.equal(changes,beforeMouse);
hit=false;stage.emit('pointerdown');stage.emit('pointermove',{clientX:400});assert.equal(changes,beforeMouse);hit=true;
for(const ending of ['lostpointercapture','blur','hidden']){
 stage.emit('pointerdown');stage.emit('pointermove',{clientX:120});assert.equal(dragging,true);
 if(ending==='blur')window.emit('blur');else if(ending==='hidden'){document.hidden=true;document.emit('visibilitychange');document.hidden=false;}else stage.emit(ending);
 assert.equal(dragging,false);assert.equal(stage.captures.size,0);
}
console.log('PASS touch: threshold, vertical scroll release, mouse exclusion, capture transfer, pointer identity, bounds, repeat, cancel, blur, hidden.');
// Run the production cover calculation itself, with phone/desktop fixtures.
const source=readFileSync(new URL('../js/walla.js',import.meta.url),'utf8');
const calculation=source.slice(source.indexOf('let coverFactor = .3;'),source.indexOf("main.style.setProperty('--cover-offset'"));
for(const height of [568,667,740,844,896,932]){
 const context={mobile:{matches:true},intro:{},getComputedStyle:()=>({paddingTop:'80px'}),heroCover:{offsetHeight:height}};
 const factor=vm.runInNewContext(calculation+'\ncoverFactor;',context);
 const oldEntry=height-80/.3,newEntry=height-80/factor;
 assert.ok(Math.abs(newEntry/oldEntry-.75)<1e-10);
 context.mobile.matches=false;assert.equal(vm.runInNewContext(calculation+'\ncoverFactor;',{...context}),.3);
}
console.log('PASS intro: 25% less entry scroll at six phone heights; desktop factor unchanged.');
