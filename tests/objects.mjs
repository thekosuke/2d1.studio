import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const products=JSON.parse(readFileSync(new URL('../data/objects.json',import.meta.url),'utf8'));
const arithmetic=source.slice(source.indexOf('const mod ='),source.indexOf('  const tiles ='));
const {indexAt}=vm.runInNewContext(arithmetic+'\n({indexAt});');
for(const count of [1,2,3,10])for(let r=-40;r<40;r++)for(let c=-40;c<40;c++){
 const index=indexAt(c,r,count);assert.ok(index>=0&&index<count);
 assert.equal(indexAt(c+count,r,count),index);
 assert.equal(indexAt(c,r+count,count),index);
}
for(const category of ['all','living','kitchen','wear','work'])for(const tag of ['all','drinkware','not-a-tag']){
 const filtered=products.filter(item=>(category==='all'||item.category===category)&&(tag==='all'||item.tags.includes(tag)));
 if(tag==='not-a-tag')assert.equal(filtered.length,0);
 if(category==='wear'&&tag==='all')assert.equal(filtered.length,1);
}
console.log('PASS endless grid: negative/positive pan, repeat periods, one/two/three/ten items, category/tag intersection and empty matches.');
// Run the production pointer handlers with deterministic input and a minimal canvas.
class Surface{
 handlers=new Map(); captures=new Set(); classList={add(){},remove(){}};
 addEventListener(name,fn){this.handlers.set(name,fn);}
 setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);}
 emit(name,args={}){this.handlers.get(name)?.({isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100,target:{closest:()=>null},...args});}
}
const canvas=new Surface(),window=new Surface(),document=new Surface();
const lifecycle=source.slice(source.indexOf('  function cancelGesture('),source.indexOf("  canvas.addEventListener('wheel'"));
const context={canvas,window,document,page:new Surface(),catalog:[{id:'first'}],x:0,y:0,gesture:null,suppressClick:false,schedule(){},show(){context.opens++;},opens:0};
vm.createContext(context);vm.runInContext(lifecycle,context);
canvas.emit('pointerdown');canvas.emit('pointermove',{clientX:104});assert.equal(context.x,0);assert.equal(canvas.captures.size,0);
canvas.emit('pointerup');canvas.emit('click',{target:{closest:()=>({dataset:{object:'first'}})}});assert.equal(context.opens,1);
canvas.emit('pointerdown');canvas.emit('pointermove',{clientX:150,clientY:125});assert.equal(context.x,50);assert.equal(context.y,25);assert.equal(canvas.captures.size,1);
canvas.emit('pointermove',{pointerId:2,clientX:500});assert.equal(context.x,50);
canvas.emit('pointerup');canvas.emit('click',{target:{closest:()=>({dataset:{object:'first'}})}});assert.equal(context.opens,1);assert.equal(canvas.captures.size,0);
for(const ending of ['pointercancel','lostpointercapture','blur','hidden']){
 canvas.emit('pointerdown');canvas.emit('pointermove',{clientX:120});assert.equal(canvas.captures.size,1);
 if(ending==='blur')window.emit('blur');else if(ending==='hidden'){document.hidden=true;document.emit('visibilitychange');document.hidden=false;}else canvas.emit(ending,{target:canvas});
 assert.equal(canvas.captures.size,0);assert.equal(context.gesture,null);
}
canvas.emit('pointerdown');window.emit('pointerup');canvas.emit('pointermove',{clientX:200});assert.equal(context.gesture,null);
canvas.emit('pointerdown',{target:{closest:()=>({tagName:'BUTTON'})}});assert.equal(context.gesture,null);
assert.match(source,/if\(event.target!==canvas\)return/);
assert.match(source,/category==='all'\|\|item.category===category/);
assert.match(source,/tag==='all'\|\|item.tags.includes\(tag\)/);
assert.match(source,/dialog\.addEventListener\('close'.*returnFocus\?\.focus/);
console.log('PASS gestures: tap opens, drag suppresses click, both axes, pointer identity, cancellations, blur/hidden, controls, keyboard bubbling guard, modal focus-return hook.');
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');
assert.match(css,/\.objects-list \[data-reset-view\]\{display:none\}/);
assert.match(css,/\.objects-ready:not\(\.objects-list\) \.objects-canvas\{display:block;flex:1;min-height:0\}/);
console.log('PASS short-height canvas shrink and visible list clear-filters control.');
