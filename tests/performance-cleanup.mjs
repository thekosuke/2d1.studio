import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const listeners={};let observer,created=0,removed=0;const messages=[];
const reduced={matches:false,addEventListener(){}};
const screen={clientWidth:800,append(){}};
const card={addEventListener(name,fn){listeners[name]=fn}};
const preview={closest(selector){return selector==='.shop-card'?card:{href:'http://localhost/finds/'}},querySelector(){return screen}};
const context={matchMedia:()=>reduced,location:{origin:'http://localhost'},URL,
 document:{querySelectorAll:()=>[preview],createElement(){created++;return {style:{},setAttribute(){},addEventListener(){},contentWindow:{postMessage:msg=>messages.push(msg)},remove(){removed++}}}},
 ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){observer=fn}observe(){}}};
vm.runInNewContext(readFileSync(new URL('../js/shop-finds-preview.js',import.meta.url),'utf8'),context);
observer([{isIntersecting:true}]);assert.equal(created,0,'visibility alone must not load the collection');
listeners.pointerenter({pointerType:'touch'});assert.equal(created,0);
reduced.matches=true;listeners.focusin();assert.equal(created,0,'reduced motion retains poster');
reduced.matches=false;listeners.focusin();assert.equal(created,1);assert.equal(messages.at(-1),'fc-preview-start');
listeners.pointerleave();assert.equal(messages.at(-1),'fc-preview-stop');
listeners.pointerenter({pointerType:'mouse'});assert.equal(created,1,'reuse loaded preview');
observer([{isIntersecting:false}]);assert.equal(removed,1);assert.equal(messages.at(-1),'fc-preview-stop');
listeners.focusin();assert.equal(created,2,'returning interaction can reload disposed preview');
console.log('PASS preview lifecycle: no pre-hover iframe, touch/reduced-motion poster, focus/hover start, leave stop, offscreen disposal and re-entry.');
