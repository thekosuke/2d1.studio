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
const canvas=new Surface(),window=new Surface(),document=new Surface();canvas.clientWidth=390;canvas.clientHeight=844;
const lifecycle=source.slice(source.indexOf('  function cancelGesture('),source.indexOf("  canvas.addEventListener('wheel'"));
const context={canvas,window,document,page:new Surface(),catalog:[{id:'first'}],x:0,y:0,gesture:null,carousel:false,slideDrag:0,suppressClick:false,schedule(){},show(){context.opens++;},opens:0};
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

const geometryLine=source.match(/const geometry=.*?;};/s)[0];
const geometry=vm.runInNewContext(geometryLine+'\ngeometry;');
for(const width of [320,390,768,1440]){assert.ok(geometry(width,99).cell>geometry(width,0).cell);}
const zoomCode=source.slice(source.indexOf('  function reset(){'),source.indexOf('  function filter(){'));
canvas.setAttribute=()=>{};
const zoomContext={document:{getElementById:()=>({})},canvas,geometry,x:0,y:0,cell:geometry(390,35).cell,row:geometry(390,35).row,zoom:35,carousel:false,slideIndex:0,slideDrag:0,active:products,list:false,mod:(n,d)=>((n%d)+d)%d,indexAt,cancelGesture(){},clearTiles(){},schedule(){},page:{classList:{toggle(){}}},zoomLabel:{},zoomInput:{setAttribute(){}},slideControls:{},t:x=>x};
vm.createContext(zoomContext);vm.runInContext(zoomCode,zoomContext);zoomContext.reset();
zoomContext.setZoom(100);assert.equal(zoomContext.carousel,true);assert.equal(zoomContext.slideIndex,0);assert.equal(zoomContext.slideControls.hidden,false);
zoomContext.advance(1);assert.equal(zoomContext.slideIndex,1);zoomContext.advance(-2);assert.equal(zoomContext.slideIndex,9);
zoomContext.setZoom(50);assert.equal(zoomContext.carousel,false);assert.equal(zoomContext.slideControls.hidden,true);assert.equal(indexAt(Math.floor((195-zoomContext.x)/zoomContext.cell),Math.floor((422-zoomContext.y)/zoomContext.row),10),9);
zoomContext.setZoom(100);zoomContext.setZoom(0);assert.equal(zoomContext.carousel,false);
context.carousel=true;context.advance=direction=>context.lastDirection=direction;canvas.emit('pointerdown');canvas.emit('pointermove',{clientX:200});canvas.emit('pointerup');assert.equal(context.lastDirection,-1);assert.equal(context.slideDrag,0);
console.log('PASS zoom: clamped size range, max-to-carousel, wrapped next/previous, selected-product continuity on return to grid, slide swipe.');
// Test the production count controller against controlled asynchronous responses.
const purchaseButton=new Surface(),purchaseRetry=new Surface(),purchaseStatus={};purchaseButton.setAttribute=()=>{};
const purchaseCode=source.slice(source.indexOf('  const purchaseButton='),source.indexOf('  function show('));
let pendingRequests=[];
const purchaseContext={dialog:{querySelector:q=>q.includes('retry')?purchaseRetry:purchaseButton},document:{getElementById:()=>purchaseStatus},t:x=>x,fetch:(url,options)=>new Promise((resolve,reject)=>pendingRequests.push({url,options,resolve,reject})),encodeURIComponent};
vm.createContext(purchaseContext);vm.runInContext(purchaseCode,purchaseContext);
const api=vm.runInContext('({loadPurchased})',purchaseContext);
const respond=(request,data)=>request.resolve({ok:true,json:async()=>data});
let loading=api.loadPurchased({id:'hay-miz'});respond(pendingRequests.shift(),{count:2,purchased:false});await loading;assert.equal(purchaseButton.disabled,false);assert.match(purchaseStatus.textContent,/Purchased count: 2$/);
let saving=purchaseButton.handlers.get('click')();await purchaseButton.handlers.get('click')();assert.equal(pendingRequests.length,1);assert.equal(JSON.parse(pendingRequests[0].options.body).purchased,true);respond(pendingRequests.shift(),{count:3,purchased:true});await saving;assert.equal(purchaseButton.disabled,false);assert.equal(purchaseButton.textContent,'Purchased ✓');
saving=purchaseButton.handlers.get('click')();pendingRequests.shift().reject(new Error('network'));await saving;assert.equal(purchaseButton.disabled,true);assert.equal(purchaseRetry.hidden,false);assert.match(purchaseStatus.textContent,/Could not confirm/);
let first=api.loadPurchased({id:'a'}),a=pendingRequests.shift();let second=api.loadPurchased({id:'b'}),b=pendingRequests.shift();respond(b,{count:9,purchased:false});await second;respond(a,{count:1,purchased:true});await first;assert.match(purchaseStatus.textContent,/Purchased count: 9$/);
loading=api.loadPurchased({id:'c'});respond(pendingRequests.shift(),{count:-1,purchased:false});await loading;assert.equal(purchaseButton.disabled,true);assert.match(purchaseStatus.textContent,/unavailable/);
console.log('PASS count UI: authoritative GET, duplicate-click guard, reversible desired state, failed mutation reload requirement, stale-response isolation, invalid-data rejection.');
