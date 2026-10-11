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
let angle = 0, dragging = false, changes = 0;
bindTouchRotation({stage,limit,getAngle:()=>angle,setAngle:v=>{angle=v;changes++;},setDragging:v=>dragging=v});
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
// Every blank part of the presentation stage can begin a rotation.
for(const [x,y] of [[10,100],[320,100],[100,10],[100,230]]){
 const before=changes;stage.emit('pointerdown',{clientX:x,clientY:y});stage.emit('pointermove',{clientX:x+20,clientY:y});assert.equal(changes,before+1);stage.emit('pointerup');
}
const beforeControl=changes;stage.emit('pointerdown',{target:{closest:()=>({tagName:'BUTTON'})}});stage.emit('pointermove',{clientX:400});assert.equal(changes,beforeControl);
for(const ending of ['lostpointercapture','blur','hidden']){
 stage.emit('pointerdown');stage.emit('pointermove',{clientX:120});assert.equal(dragging,true);
 if(ending==='blur')window.emit('blur');else if(ending==='hidden'){document.hidden=true;document.emit('visibilitychange');document.hidden=false;}else stage.emit(ending);
 assert.equal(dragging,false);assert.equal(stage.captures.size,0);
}
console.log('PASS touch: threshold, vertical scroll release, mouse exclusion, capture transfer, pointer identity, bounds, repeat, cancel, blur, hidden.');
// Run the production cover calculation itself, with phone/desktop fixtures.
const source=readFileSync(new URL('../js/walla.js',import.meta.url),'utf8');
const calculation=source.slice(source.indexOf('let coverFactor = .3;'),source.indexOf("main.style.setProperty('--cover-offset'"));
for(const height of [568,667,740,844,896,932,1080]){
 for(const padding of [80,128]) {
  const context={intro:{},getComputedStyle:()=>({paddingTop:String(padding)}),innerHeight:height};
  const factor=vm.runInNewContext(calculation+'\ncoverFactor;',context);
  // At the requested trigger the opening line cannot still be behind the cover.
  const coverBottom=height*.7;
  const lineTop=coverBottom+padding-coverBottom*factor;
  assert.ok(lineTop>=coverBottom-1e-8);
  assert.ok(factor>0 && factor<=.3);
 }
}
console.log('PASS intro: opening line clears the cover at 70vh across phone and desktop heights.');

// Exercise the carousel's production binder without requiring WebGL or a browser.
const helper=source.slice(source.indexOf('function bindWorkTouch('),source.indexOf("  const belt = document.querySelector('[data-carousel]');"));
const bindWorkTouch=vm.runInNewContext(helper+'\nbindWorkTouch;',{window,document});
const belt=new Surface();belt.scrollLeft=100;belt.scrollWidth=1200;belt.clientWidth=300;belt.classList={add:()=>{}};
let active=false,wrap=true;
bindWorkTouch(belt,{setActive:value=>active=value,getPeriod:()=>600,shouldWrap:()=>wrap});
belt.emit('pointerdown');assert.equal(active,true);belt.emit('pointermove',{clientX:104});assert.equal(belt.scrollLeft,100);assert.equal(belt.captures.size,0);
belt.emit('pointermove',{clientX:50});assert.equal(belt.scrollLeft,150);assert.equal(belt.hasPointerCapture(1),true);
belt.emit('lostpointercapture',{target:{tagName:'IMG'}});assert.equal(active,true);
belt.emit('pointermove',{pointerId:2,clientX:0});assert.equal(belt.scrollLeft,150);
belt.emit('pointerup');assert.equal(active,false);assert.equal(belt.captures.size,0);
belt.scrollLeft=0;belt.emit('pointerdown');belt.emit('pointermove',{clientX:150});assert.equal(belt.scrollLeft,550);belt.emit('pointerup');
belt.scrollLeft=590;belt.emit('pointerdown');belt.emit('pointermove',{clientX:50});assert.equal(belt.scrollLeft,40);belt.emit('pointerup');
wrap=false;belt.scrollLeft=10;belt.emit('pointerdown');belt.emit('pointermove',{clientX:150});assert.equal(belt.scrollLeft,0);belt.emit('pointerup');
belt.scrollLeft=890;belt.emit('pointerdown');belt.emit('pointermove',{clientX:50});assert.equal(belt.scrollLeft,900);belt.emit('pointerup');
belt.scrollLeft=100;belt.emit('pointerdown');belt.emit('pointermove',{clientX:110,clientY:130});assert.equal(active,false);assert.equal(belt.scrollLeft,100);assert.equal(belt.captures.size,0);
for(const props of [{pointerType:'mouse'},{isPrimary:false},{target:{closest:()=>({tagName:'A'})}}]){belt.emit('pointerdown',props);belt.emit('pointermove',{clientX:50});assert.equal(active,false);assert.equal(belt.scrollLeft,100);}
for(const ending of ['pointercancel','lostpointercapture','blur','hidden']){
 belt.emit('pointerdown');belt.emit('pointermove',{clientX:120});assert.equal(active,true);
 if(ending==='blur')window.emit('blur');else if(ending==='hidden'){document.hidden=true;document.emit('visibilitychange');document.hidden=false;}else belt.emit(ending);
 assert.equal(active,false);assert.equal(belt.captures.size,0);
}
assert.match(readFileSync(new URL('../js/tote-preview.js',import.meta.url),'utf8'),/!down.moved.*tote.hitTest/);
console.log('PASS carousel: direct drag, both loop seams, reduced-motion bounds, vertical scroll, controls, pointer identity, capture transfer and interrupted gestures.');
console.log('PASS tote: all four surrounding stage areas rotate; silhouette-only tap X-ray gate remains.');

// Page destinations share anchor styling but never intercept section scrolling.
for (const path of ['../index.html','../ja/index.html']) {
 const html=readFileSync(new URL(path,import.meta.url),'utf8');
 const nav=html.match(/<nav class="page-nav"[\s\S]*?<\/nav>/)[0];
 assert.doesNotMatch(nav, /href="#|page-nav-pages/);
 assert.match(nav, /data-contact/);
 assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['./','about/','objects/']);
 assert.doesNotMatch(html, /class="footer-pages"/);
}
const navCss=readFileSync(new URL('../css/walla.css',import.meta.url),'utf8');
assert.match(navCss,/\.page-nav \.page-nav-contact\{border:0!important/);
console.log('PASS page navigation: Home, About, Finds, Contact in both languages without section anchors or dividers.');

const homeMarkup=readFileSync(new URL('../index.html',import.meta.url),'utf8');
for(const path of ['../index.html','../ja/index.html']){
 const markup=readFileSync(new URL(path,import.meta.url),'utf8'),intro=markup.match(/<section[^>]*class="intro[^"]*"[\s\S]*?<\/section>/)[0];
 assert.match(intro,/<a class="familiar-characters copy-emphasis" href="objects\/" translate="no">Familiar Characters<\/a>/);
 assert.doesNotMatch(intro,/<a class="intro-cta" href="objects\/"/);
}
assert.doesNotMatch(homeMarkup.match(/<section[^>]*id="shop"[\s\S]*?<\/section>/)[0],/href="objects\/"/);

for (const path of ['../about/index.html','../ja/about/index.html']){
 const html=readFileSync(new URL(path,import.meta.url),'utf8');
 assert.match(html,/class="page-nav is-visible"/);assert.match(html,/href="\.\.\/"/);
 assert.match(html,/href="\.\/" aria-current="page"/);
 assert.match(html,/type="button" data-contact aria-haspopup="dialog" aria-controls="contact"/);
 assert.match(html,/js\/contact.js/);assert.match(html,/js\/drawers.js/);
}

// Existing contact drawer lifecycle: duplicate open, close, reopen, focus return.
const tokens=new Set(), events=new Map();let focusReturned=0, headingFocused=0, opened=0;
const opener={focus(){focusReturned++}};
const modal={open:false,classList:{add(...v){v.forEach(x=>tokens.add(x))},remove(...v){v.forEach(x=>tokens.delete(x))},contains:x=>tokens.has(x)},addEventListener(n,f){events.set(n,f)},querySelector(s){return s==='.contact-sheet'?{scrollTop:0,getBoundingClientRect(){}}:{focus(){headingFocused++}}},showModal(){this.open=true;opened++},close(){this.open=false;events.get('close')()}};
const drawers={window:{},document:{documentElement:{classList:{add(){},remove(){}}}},matchMedia:()=>({matches:true})};
vm.createContext(drawers);vm.runInContext(readFileSync(new URL('../js/drawers.js',import.meta.url),'utf8'),drawers);
for(let n=0;n<3;n++){drawers.window.SiteDrawer.open(modal,opener);drawers.window.SiteDrawer.open(modal,opener);assert.equal(modal.open,true);drawers.window.SiteDrawer.close(modal);assert.equal(modal.open,false);}
assert.equal(opened,3);assert.equal(headingFocused,3);assert.equal(focusReturned,3);
console.log('PASS contact: native button hooks, repeat open/close, initial heading focus and opener restoration; no submission.');

assert.match(navCss,/\.about-page \.about-docked-logo\{position:fixed;top:16px;left:50%;width:96px/);
for(const route of ['../about/index.html','../ja/about/index.html']){
 const markup=readFileSync(new URL(route,import.meta.url),'utf8');
 const active=markup.replace(/<template\b[\s\S]*?<\/template>/g,'');
 assert.equal((active.match(/class="site-logo about-docked-logo"/g)||[]).length,1);
 assert.match(active, /class="page-nav is-visible"/);
 assert.match(active,/data-contact/);
}

assert.match(homeMarkup, /class="shop-actions"[\s\S]*class="connect-form"/);
assert.doesNotMatch(homeMarkup, /<section id="connect"/);
assert.match(navCss, /:focus\{outline:none!important;box-shadow:none!important/);
assert.match(navCss, /:focus-visible\{[^}]*background-color:var\(--red\)!important;color:var\(--ink\)!important/);

assert.match(navCss,/\.page-nav :is\(a,button\)::before\{[^}]*width:0;height:6px/);
assert.match(navCss,/:hover::before\{width:6px\}/);
assert.match(navCss,/:hover\{transform:translateX\(12px\)\}/);

await import('./mobile-nav.mjs');
