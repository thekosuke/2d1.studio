import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const products=JSON.parse(readFileSync(new URL('../data/objects.json',import.meta.url),'utf8'));
const arithmetic=source.slice(source.indexOf('const mod ='),source.indexOf('  const tiles ='));
const {indexAt}=vm.runInNewContext(arithmetic+'\n({indexAt});');
for(const count of [1,2,3,10,products.length])for(let r=-40;r<40;r++)for(let c=-40;c<40;c++){
 const index=indexAt(c,r,count);assert.ok(index>=0&&index<count);
 assert.equal(indexAt(c+count,r,count),index);
 assert.equal(indexAt(c,r+count,count),index);
}
for(const category of ['all','living','kitchen','wear','work','missing']){
 const filtered=products.filter(item=>category==='all'||item.category===category);
 if(category==='missing')assert.equal(filtered.length,0);
 if(category==='wear')assert.ok(filtered.length>0);
}
console.log('PASS endless canvas: repeat periods, small sets, categories and empty results.');
// Run the production pointer handlers with deterministic input and a minimal canvas.
class Surface{
 handlers=new Map(); captures=new Set(); classList={add(){},remove(){}};
 addEventListener(name,fn){this.handlers.set(name,fn);}
 setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);}
 emit(name,args={}){this.handlers.get(name)?.({isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100,target:{closest:()=>null},...args});}
}
const canvas=new Surface(),window=new Surface(),document=new Surface();canvas.clientWidth=390;canvas.clientHeight=844;
const lifecycle=source.slice(source.indexOf('  function cancelGesture('),source.indexOf("  canvas.addEventListener('wheel'"));
const context={canvas,window,document,page:new Surface(),catalog:[{id:'first'}],x:0,y:0,gesture:null,focusMode:false,motion:null,focusColumn:0,focusRow:0,cell:200,row:252,zoom:100,geometry:()=>({cell:200,row:252}),suppressClick:false,settleGeometry(){},stopMotion(){},nearest:()=>({column:0,line:0}),focusAt(){},schedule(){},show(){context.opens++;},opens:0};
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
assert.match(source,/dialog\.addEventListener\('close'.*returnFocus\?\.focus/);
console.log('PASS gestures: tap opens, drag suppresses click, both axes, pointer identity, cancellations, blur/hidden, controls, keyboard bubbling guard, modal focus-return hook.');
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');
assert.match(css,/\.objects-list \[data-reset-view\]\{display:none\}/);
assert.match(css,/\.objects-ready:not\(\.objects-list\) \.objects-canvas\{display:block;flex:1;min-height:0\}/);
console.log('PASS short-height canvas shrink and visible list clear-filters control.');

const geometryLine=source.match(/const geometry=.*?;};/s)[0];
const geometry=vm.runInNewContext(geometryLine+'\ngeometry;',{canvas});
for(const [width,height] of [[320,844],[390,844],[844,390],[1440,900]]){assert.ok(geometry(width,100,height).cell>geometry(width,0,height).cell);assert.ok(geometry(width,100,height).cell<Math.min(width,height));}
let rafId=0;const queuedFrames=new Map();
const spatial={canvas,document:{getElementById:()=>({})},geometry,indexAt,x:0,y:0,cell:200,row:252,zoom:35,focusMode:false,focusColumn:0,focusRow:0,active:products,motion:null,motionFrame:0,wheelTimer:0,reduced:{matches:false},list:false,requestAnimationFrame(fn){queuedFrames.set(++rafId,fn);return rafId},cancelAnimationFrame(id){queuedFrames.delete(id)},clearTimeout(){},cancelGesture(){},schedule(){},clearTiles(){},page:{classList:{toggle(k,v){spatial.classes[k]=v}}},classes:{},zoomInput:{setAttribute(){}},t:x=>x};canvas.setAttribute=()=>{};
vm.createContext(spatial);
vm.runInContext(source.slice(source.indexOf('  const nearest='),source.indexOf('  function draw()'))+source.slice(source.indexOf('  function reset(){'),source.indexOf('  function filter(){')),spatial);
const step=now=>{const callbacks=[...queuedFrames.values()];queuedFrames.clear();callbacks.forEach(f=>f(now));};const settle=()=>{step(0);step(560);};
spatial.reset();spatial.setZoom(100);assert.equal(spatial.focusMode,true);settle();
for(const [column,line] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){spatial.focusAt(column,line);settle();assert.equal(spatial.focusColumn,column);assert.equal(spatial.focusRow,line);assert.ok(Math.abs(spatial.x+column*spatial.cell+spatial.cell/2-195)<1e-8);assert.ok(Math.abs(spatial.y+line*spatial.row+spatial.cell/2-422)<1e-8);}
spatial.focusAt(3,2);step(0);step(280);const interruptedX=spatial.x;spatial.focusAt(-2,-3);assert.equal(spatial.motion.from.x,interruptedX);settle();assert.equal(queuedFrames.size,0);
spatial.setZoom(40);settle();assert.equal(spatial.focusMode,false);assert.equal(Math.round((195-spatial.x)/spatial.cell-.5),-2);assert.equal(Math.round((422-spatial.y-spatial.cell/2)/spatial.row),-3);
spatial.reduced.matches=true;spatial.setZoom(100);assert.equal(spatial.motion,null);spatial.focusAt(2,-1);assert.equal(spatial.motion,null);assert.equal(queuedFrames.size,0);
spatial.setZoom(0);assert.equal(spatial.classes['objects-min-zoom'],true);spatial.setZoom(1);assert.equal(spatial.classes['objects-min-zoom'],false);
context.focusMode=true;context.focusAt=(column,line)=>{context.focusColumn=column;context.focusRow=line;context.x=195-column*context.cell-context.cell/2;context.y=422-line*context.row-context.cell/2;};
for(const [column,line] of [[1,0],[0,1],[-1,-1],[2,-2]]){const before=context.opens;canvas.emit('pointerdown');canvas.emit('pointerup');canvas.emit('click',{target:{closest:()=>({dataset:{object:'first',column,line}})}});assert.equal(context.opens,before);assert.equal(context.focusColumn,column);assert.equal(context.focusRow,line);canvas.emit('click',{target:{closest:()=>({dataset:{object:'first',column,line}})}});assert.equal(context.opens,before+1);}
assert.match(css,/\.objects-focused \.objects-tile\{opacity:\.4\}/);assert.match(css,/\.objects-focused \.objects-tile.is-focused\{opacity:1\}/);
assert.match(css,/aspect-ratio:1 \/ 1;object-fit:contain/);assert.doesNotMatch(source,/carousel|slideControls|slideDrag/);
console.log('PASS spatial focus: 8 directions, interrupted animation, zoom-out context, reduced motion, neighbor versus focused clicks, square images and 40% neighbors.');
// Test the production count controller against controlled asynchronous responses.
const purchaseButton=new Surface(),purchaseRetry=new Surface(),purchaseStatus={};purchaseButton.setAttribute=()=>{};
const purchaseCode=source.slice(source.indexOf('  const purchaseButton='),source.indexOf('  function show('));
let pendingRequests=[];
const purchaseContext={dialog:{querySelector:q=>q.includes('retry')?purchaseRetry:purchaseButton},document:{getElementById:()=>purchaseStatus},t:x=>x,fetch:(url,options)=>new Promise((resolve,reject)=>pendingRequests.push({url,options,resolve,reject})),encodeURIComponent};
vm.createContext(purchaseContext);vm.runInContext(purchaseCode,purchaseContext);
const api=vm.runInContext('({loadPurchased})',purchaseContext);
const respond=(request,data)=>request.resolve({ok:true,json:async()=>data});
let loading=api.loadPurchased({id:'hay-miz'});respond(pendingRequests.shift(),{count:2,purchased:false});await loading;assert.equal(purchaseButton.disabled,false);assert.match(purchaseStatus.textContent,/Owned by 2 users$/);
let saving=purchaseButton.handlers.get('click')();await purchaseButton.handlers.get('click')();assert.equal(pendingRequests.length,1);assert.equal(JSON.parse(pendingRequests[0].options.body).purchased,true);respond(pendingRequests.shift(),{count:3,purchased:true});await saving;assert.equal(purchaseButton.disabled,false);assert.equal(purchaseButton.textContent,'I have it ✓');
saving=purchaseButton.handlers.get('click')();pendingRequests.shift().reject(new Error('network'));await saving;assert.equal(purchaseButton.disabled,true);assert.equal(purchaseRetry.hidden,false);assert.match(purchaseStatus.textContent,/Could not confirm/);
let first=api.loadPurchased({id:'a'}),a=pendingRequests.shift();let second=api.loadPurchased({id:'b'}),b=pendingRequests.shift();respond(b,{count:9,purchased:false});await second;respond(a,{count:1,purchased:true});await first;assert.match(purchaseStatus.textContent,/Owned by 9 users$/);
loading=api.loadPurchased({id:'c'});respond(pendingRequests.shift(),{count:-1,purchased:false});await loading;assert.equal(purchaseButton.disabled,true);assert.match(purchaseStatus.textContent,/unavailable/);
console.log('PASS count UI: authoritative GET, duplicate-click guard, reversible desired state, failed mutation reload requirement, stale-response isolation, invalid-data rejection.');

for(const route of ['../objects/index.html','../ja/objects/index.html']){
 const html=readFileSync(new URL(route,import.meta.url),'utf8');
 assert.match(html.match(/<nav class="finds-page-nav"[\s\S]*?<\/nav>/)[0],/href="\.\.\/about\/"/);
 assert.match(html,/class="finds-home-trigger"[^>]*aria-expanded="false"/);
 assert.match(html, /class="objects-info-about" href="\.\.\/about\/"/);
}
console.log('PASS Finds About links remain available in localized info dialog and collapsible page navigation.');

for(const count of [0,1,2]){
 const load=api.loadPurchased({id:'hay-miz'});respond(pendingRequests.shift(),{count,purchased:false});await load;
 assert.equal(purchaseStatus.textContent,`Owned by ${count} ${count===1?'user':'users'}`);
 assert.equal(purchaseButton.textContent,'I have it');
}

assert.ok(products.every(item=>!item.tags.includes('colour')));
assert.ok(products.some(item=>item.tags.includes('color')));
assert.ok(products.some(item=>item.name==='Regn Umbrella, Gray / Blue')); // Official product names remain untranslated.
const sharedCss=readFileSync(new URL('../css/walla.css',import.meta.url),'utf8');
assert.match(sharedCss,/\*:focus,\*:focus-visible\{outline:none!important;box-shadow:none!important/);
assert.match(sharedCss,/:is\(input,select,textarea,\[tabindex\]:not\(\[tabindex="-1"\]\)\):focus-visible\{background-color:/);
console.log('PASS all-control no-outline policy and US color copy with official product name retained.');

const filterCode=source.slice(source.indexOf('  function filter()'),source.indexOf('  const purchaseButton='));
const emptyGrid={};
const filterContext={catalog:products,active:products,category:'all',list:false,cards:products.map(p=>({dataset:{object:p.id}})),status:{},empty:{},categoryButtons:[],document:{querySelector:()=>emptyGrid},cancelGesture(){},stopMotion(){},reset(){},t:x=>x};
vm.createContext(filterContext);vm.runInContext(filterCode,filterContext);
for(const category of ['all','wear','kitchen','missing']){filterContext.category=category;filterContext.filter();assert.equal(filterContext.active.length,products.filter(p=>category==='all'||p.category===category).length);}
for(const route of ['../objects/index.html','../ja/objects/index.html']){const html=readFileSync(new URL(route,import.meta.url),'utf8');assert.doesNotMatch(html,/id="objects-tag"|data-view=|objects-slide-controls/);assert.match(html,/data-category-filter=/);}
assert.doesNotMatch(source,/objects-tag|tags.addEventListener|setView/);
console.log('PASS canvas-only categories: repeated filters, empty states, no tag/toggle/carousel UI.');
// First visit is immediate; dismissal persists across languages, manual reopen remains.
const infoCode=source.slice(source.indexOf('  const infoSeenKey='),source.indexOf('  let measuredWidth='));
const boot=source.slice(source.indexOf('  let infoSeen=false;'),source.lastIndexOf('})();'));
for(const blocked of [false,true]){
 let stored=null,opens=0,focused=0;const infoButton=new Surface(),infoDialog=new Surface();infoDialog.open=false;infoDialog.showModal=()=>{infoDialog.open=true;opens++};infoDialog.close=()=>{infoDialog.open=false;infoDialog.emit('close')};infoDialog.querySelector=()=>({focus(){},addEventListener(){}});infoButton.focus=()=>focused++;
 const c={infoButton,infoDialog,dialog:{open:false},cancelGesture(){},stopMotion(){},settleGeometry(){},localStorage:{getItem(){if(blocked)throw Error();return stored},setItem(k,v){if(blocked)throw Error();stored=v}}};
 vm.createContext(c);vm.runInContext(infoCode+boot,c);assert.equal(opens,1);infoDialog.close();assert.equal(focused,1);if(!blocked)assert.equal(stored,'1');
 infoButton.emit('click');assert.equal(opens,2);infoDialog.close();
 if(!blocked){vm.runInContext("infoSeen=localStorage.getItem(infoSeenKey)==='1';if(!infoSeen)openInfo();",c);assert.equal(opens,2);}
}
console.log('PASS info: fresh visit auto-open, persisted dismissal, manual reopen and blocked-storage recovery.');

// Integrate real motion functions with real production pointer handlers.
spatial.reduced.matches=false;spatial.window=new Surface();spatial.document.addEventListener=()=>{};
spatial.page.classList.add=()=>{};spatial.page.classList.remove=()=>{};
spatial.gesture=null;spatial.suppressClick=false;spatial.catalog=products;spatial.opens=0;spatial.show=()=>spatial.opens++;
vm.runInContext(lifecycle,spatial);
spatial.setZoom(35);settle();spatial.setZoom(80);step(0);step(200);
assert.notEqual(spatial.cell,geometry(390,80).cell);canvas.emit('pointerdown');canvas.emit('pointerup');settle();assert.equal(spatial.cell,geometry(390,80).cell);
spatial.setZoom(100);settle();spatial.focusAt(1,1);step(0);step(200);
canvas.emit('pointerdown');canvas.emit('pointerup');canvas.emit('click',{target:{closest:()=>({dataset:{object:products[0].id,column:1,line:1}})}});assert.equal(spatial.opens,0);
settle();canvas.emit('pointerdown');canvas.emit('pointerup');canvas.emit('click',{target:{closest:()=>({dataset:{object:products[0].id,column:1,line:1}})}});assert.equal(spatial.opens,1);
for(const [width,height] of [[390,844],[844,390],[1440,900]]){const {cell,row}=geometry(width,100,height),padding=width<=600?16:24;const aboveBottom=(height-cell)/2-row+cell-padding;assert.ok(aboveBottom>=16,`vertical neighbor visible at ${width}×${height}`);}
console.log('PASS integrated interruption: blank tap resumes zoom, moving target cannot open early, settled target opens, landscape vertical neighbors remain visible.');

// A non-sale item must not inherit the previous item's live destination.
const dialogFields=new Map();
const saleDialog={querySelector(selector){if(!dialogFields.has(selector))dialogFields.set(selector,{hidden:false,href:null,replaceChildren(...children){this.children=children},removeAttribute(name){delete this[name]}});return dialogFields.get(selector)},showModal(){}};
const saleContext={URL,document:{createElement:()=>({})},dialog:saleDialog,close:{focus(){}},focusMode:false,cancelGesture(){},stopMotion(){},settleGeometry(){},loadPurchased(){}};
vm.createContext(saleContext);
vm.runInContext(source.slice(source.indexOf('  function show('),source.indexOf('  function cancelGesture(')),saleContext);
for(const url of ['https://example.com/first',null,'https://example.com/second',null]){
 const gallery=Array.from({length:url?3:2},(_,index)=>({dataset:{source:index?'https://photos.example.com/second':'https://example.com/source'},cloneNode(){return {dataset:this.dataset,index}}}));
 saleDialog.querySelector('.objects-dialog-scroll').scrollTop=400;
 saleDialog.querySelector('.objects-dialog-copy').scrollTop=150;
 saleContext.show({url,credit:'https://example.com/source',tags:[],gallery},null);
 const photos=dialogFields.get('.objects-dialog-photo').children;
 assert.equal(photos.length,gallery.length);
 assert.equal(photos[0].loading,'eager');assert.ok(photos.slice(1).every(photo=>photo.loading==='lazy'));
 assert.equal(dialogFields.get('.objects-dialog-scroll').scrollTop,0);
 assert.equal(dialogFields.get('.objects-dialog-copy').scrollTop,0);
 const link=dialogFields.get('.objects-dialog-link'),label=dialogFields.get('.objects-dialog-availability');
 assert.equal(link.hidden,!url);assert.equal(label.hidden,!!url);
 if(url)assert.equal(link.href,url);else assert.equal(link.href,undefined);
 assert.deepEqual(Array.from(dialogFields.get('.objects-dialog-sources').children,link=>link.href),['https://example.com/source','https://photos.example.com/second']);
}
console.log('PASS sale state: sequential dialogs clear stale URLs, restore live links and replace galleries, reset scrolling, defer extra images and retain all source credits.');
