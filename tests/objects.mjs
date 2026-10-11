import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import './objects-controls.mjs';
import './objects-dialog-focus.mjs';
import './objects-mobile-sheet.mjs';
import './objects-language.mjs';
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const products=JSON.parse(readFileSync(new URL('../data/objects.json',import.meta.url),'utf8'));
const arithmetic=source.slice(source.indexOf('const mod ='),source.indexOf('  const visitOrders='));
const {indexAt,shuffleForCanvas,createVisitOrders}=vm.runInNewContext(arithmetic+'\n({indexAt,shuffleForCanvas,createVisitOrders});');
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
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const ordinaryShuffle=(items,random)=>{
 const result=items.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
};
// Sample the actual canvas, including its negative coordinates and wrap edges.
// Count each spatial direction separately even when small sets alias positions.
const brandNeighbors=items=>{
 let cardinal=0,diagonal=0;const keys=item=>item.brand.toLowerCase().split('×').map(key=>key.trim());
 for(let column=-items.length;column<0;column++)for(const [dx,dy] of [[1,0],[0,1],[-1,1],[1,1]]){
  const a=indexAt(column,-3,items.length),b=indexAt(column+dx,-3+dy,items.length);
  if(a!==b&&keys(items[a]).some(key=>keys(items[b]).includes(key))){if(dx&&dy)diagonal++;else cardinal++;}
 }
 return {cardinal,diagonal,score:cardinal*4+diagonal};
};
const ids=items=>Array.from(items,item=>item.id);
const signatures=new Set(),firstItems=new Set();let ordinaryCost=0,optimizedCost=0;
for(let seed=1;seed<=24;seed++){
 const frozen=Object.freeze(products.slice()),before=ids(frozen),mixed=shuffleForCanvas(frozen,seeded(seed));
 assert.deepEqual(ids(mixed).sort(),before.slice().sort());assert.deepEqual(ids(frozen),before);
 assert.ok(mixed.every(item=>frozen.includes(item))); // Product objects and ownership IDs survive unchanged.
 assert.deepEqual(ids(mixed),ids(shuffleForCanvas(frozen,seeded(seed))));
 const naive=brandNeighbors(ordinaryShuffle(frozen,seeded(seed))),optimized=brandNeighbors(mixed);
 assert.ok(optimized.score<=naive.score,`no worse than random, seed ${seed}`);
 ordinaryCost+=naive.score;optimizedCost+=optimized.score;
 signatures.add(ids(mixed).join(','));firstItems.add(mixed[0].id);
 for(const row of [-19,0,27])assert.equal(new Set(Array.from({length:mixed.length},(_,column)=>mixed[indexAt(column,row,mixed.length)].id)).size,mixed.length);
}
assert.equal(signatures.size,24);assert.ok(firstItems.size>=12);assert.ok(optimizedCost<ordinaryCost*.5);
for(const size of [0,1,2,3,4,5,8,30])for(const oneBrand of [false,true])for(let seed=1;seed<=8;seed++){
 const fixture=Array.from({length:size},(_,index)=>({id:String(index),brand:oneBrand||index<Math.ceil(size*.6)?'Common':`Brand ${index}`,category:'work'}));
 const mixed=shuffleForCanvas(Object.freeze(fixture),seeded(seed));
 assert.deepEqual(ids(mixed).sort(),ids(fixture).sort());
 assert.ok(brandNeighbors(mixed).score<=brandNeighbors(ordinaryShuffle(fixture,seeded(seed))).score);
}
// More than half the kitchen category is Alessi: unavoidable adjacency must
// spread out without losing those objects or filling a category with others.
for(let seed=1;seed<=12;seed++){
 const kitchen=products.filter(item=>item.category==='kitchen'),mixed=shuffleForCanvas(kitchen,seeded(seed));
 assert.deepEqual(ids(mixed).sort(),ids(kitchen).sort());assert.ok(brandNeighbors(mixed).score<=brandNeighbors(kitchen).score);
}
const collaborationFixture=Array.from({length:25},(_,index)=>({id:String(index),category:'living',brand:index===0?'Example':index===1?'EXAMPLE × Partner':`Other ${index}`}));
for(let seed=1;seed<=8;seed++)assert.equal(brandNeighbors(shuffleForCanvas(collaborationFixture,seeded(seed))).score,0);
let randomCalls=0;const visitRandom=seeded(42),visitOrders=createVisitOrders(products,()=>{randomCalls++;return visitRandom();});
const generatedCalls=randomCalls,visitSnapshot=new Map([...visitOrders].map(([category,items])=>[category,ids(items)]));
for(const [category,items] of visitOrders)assert.deepEqual(ids(items).sort(),ids(products.filter(item=>category==='all'||item.category===category)).sort());
assert.equal((source.match(/createVisitOrders\(catalog\)/g)||[]).length,1);
console.log('PASS visit shuffle: varied loads, real cardinal/diagonal wrap neighbors, collaboration brands, dominant brands, small/empty sets, identity preservation and full reachability.');
// Run the production pointer handlers with deterministic input and a minimal canvas.
class Surface{
 handlers=new Map(); listenerOptions=new Map(); captures=new Set(); classList={add(){},remove(){}};
 addEventListener(name,fn,options){this.handlers.set(name,fn);this.listenerOptions.set(name,options);}
 setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);}
 emit(name,args={}){const event={type:name,isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100,target:{closest:()=>null},defaultPrevented:false,stopped:false,preventDefault(){this.defaultPrevented=true},stopPropagation(){this.stopped=true},...args};this.handlers.get(name)?.(event);return event;}
}
const canvas=new Surface(),window=new Surface(),document=new Surface();canvas.clientWidth=390;canvas.clientHeight=844;document.querySelector=()=>null;
const lifecycle=source.slice(source.indexOf('  const canvasPointers='),source.indexOf("  canvas.addEventListener('wheel'"));
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
const spatial={canvas,document:{getElementById:()=>({})},geometry,indexAt,x:0,y:0,cell:200,row:252,zoom:35,focusMode:false,focusColumn:0,focusRow:0,active:visitOrders.get('all'),motion:null,motionFrame:0,wheelTimer:0,reduced:{matches:false},list:false,requestAnimationFrame(fn){queuedFrames.set(++rafId,fn);return rafId},cancelAnimationFrame(id){queuedFrames.delete(id)},clearTimeout(){},cancelGesture(){},schedule(){},clearTiles(){},page:{classList:{toggle(k,v){spatial.classes[k]=v}}},classes:{},zoomButtons:[],zoomStatus:{},zoomInput:{setAttribute(){}},t:x=>x};canvas.setAttribute=()=>{};
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
assert.match(css,/aspect-ratio:1 \/ 1;object-fit:cover/);assert.doesNotMatch(source,/carousel|slideControls|slideDrag/);
console.log('PASS spatial focus: 8 directions, interrupted animation, zoom-out context, reduced motion, neighbor versus focused clicks, square images and 40% neighbors.');
// Test the production count controller against controlled asynchronous responses.
const purchaseButton=new Surface(),purchaseRetry=new Surface(),purchaseStatus={};purchaseButton.setAttribute=()=>{};
const purchaseCode=source.slice(source.indexOf('  const purchaseButton='),source.indexOf('  let detailItem='));
let pendingRequests=[];
const purchaseContext={dialog:{querySelector:q=>q.includes('retry')?purchaseRetry:purchaseButton},document:{getElementById:()=>purchaseStatus},t:x=>x,fetch:(url,options)=>new Promise((resolve,reject)=>pendingRequests.push({url,options,resolve,reject})),encodeURIComponent};
vm.createContext(purchaseContext);vm.runInContext(purchaseCode,purchaseContext);
const api=vm.runInContext('({loadPurchased})',purchaseContext);
const respond=(request,data)=>request.resolve({ok:true,json:async()=>data});
let loading=api.loadPurchased({id:'hay-miz'});respond(pendingRequests.shift(),{count:2,purchased:false});await loading;assert.equal(purchaseButton.disabled,false);assert.match(purchaseStatus.textContent,/Owned by 2 users$/);
let saving=purchaseButton.handlers.get('click')();await purchaseButton.handlers.get('click')();assert.equal(pendingRequests.length,1);assert.equal(JSON.parse(pendingRequests[0].options.body).purchased,true);respond(pendingRequests.shift(),{count:3,purchased:true});await saving;assert.equal(purchaseButton.disabled,false);assert.equal(purchaseButton.textContent,'I have it ✓');
saving=purchaseButton.handlers.get('click')();pendingRequests.shift().reject(new Error('network'));await saving;assert.equal(purchaseButton.disabled,true);assert.equal(purchaseRetry.handlers.size,0);assert.match(purchaseStatus.textContent,/Could not confirm/);
let first=api.loadPurchased({id:'a'}),a=pendingRequests.shift();let second=api.loadPurchased({id:'b'}),b=pendingRequests.shift();respond(b,{count:9,purchased:false});await second;respond(a,{count:1,purchased:true});await first;assert.match(purchaseStatus.textContent,/Owned by 9 users$/);
loading=api.loadPurchased({id:'c'});respond(pendingRequests.shift(),{count:-1,purchased:false});await loading;assert.equal(purchaseButton.disabled,true);assert.equal(purchaseStatus.textContent,'');
console.log('PASS count UI: authoritative GET, duplicate-click guard, reversible desired state, failed mutation truthful feedback, stale-response isolation, invalid-data rejection.');

for(const route of ['../objects/index.html','../ja/objects/index.html']){
 const html=readFileSync(new URL(route,import.meta.url),'utf8');
 assert.doesNotMatch(html,/<nav class="finds-page-nav"/);
 assert.match(html,/class="finds-home-trigger" href="\.\.\/"/);
 assert.match(html, /class="objects-info-about objects-dialog-link" href="\.\.\/about\/"/);
}
console.log('PASS Finds About links remain available in localized info dialog and collapsible page navigation.');

for(const count of [0,1,2]){
 const load=api.loadPurchased({id:'hay-miz'});respond(pendingRequests.shift(),{count,purchased:false});await load;
 assert.equal(purchaseStatus.textContent,`Owned by ${count} ${count===1?'user':'users'}`);
 assert.equal(purchaseButton.textContent,'I have it');
}

assert.ok(products.every(item=>!item.tags.includes('colour')));
assert.ok(products.some(item=>item.tags.includes('color')));
assert.ok(products.some(item=>item.name==='Regn Umbrella'&&item.variantName==='Regn Umbrella, Gray / Blue')); // Official product names remain untranslated.
const sharedCss=readFileSync(new URL('../css/walla.css',import.meta.url),'utf8');
assert.match(sharedCss,/\*:focus,\*:focus-visible\{outline:none!important;box-shadow:none!important/);
assert.match(sharedCss,/:is\(input,select,textarea,\[tabindex\]:not\(\[tabindex="-1"\]\)\):focus-visible\{background-color:/);
console.log('PASS all-control no-outline policy and US color copy with official product name retained.');

const filterCode=source.slice(source.indexOf('  function filter()'),source.indexOf('  const purchaseButton='));
const emptyGrid={};
const filterContext={selectedTag:'',searchQuery:"",catalog:products,visitOrders,active:products,category:'all',list:false,cards:products.map(p=>({dataset:{object:p.id}})),status:{},empty:{},categoryButtons:[],document:{querySelector:()=>emptyGrid},cancelGesture(){},stopMotion(){},reset(){},t:x=>x};
vm.createContext(filterContext);vm.runInContext(filterCode,filterContext);
for(const category of ['all','wear','kitchen','missing','wear','all','kitchen','all']){
 filterContext.category=category;filterContext.filter();assert.equal(filterContext.active.length,products.filter(p=>category==='all'||p.category===category).length);
 if(visitOrders.has(category)){assert.deepEqual(ids(filterContext.active),visitSnapshot.get(category));}
 for(const card of filterContext.cards)assert.equal(card.hidden,!filterContext.active.some(item=>item.id===card.dataset.object));
}
for(const route of ['../objects/index.html','../ja/objects/index.html']){const html=readFileSync(new URL(route,import.meta.url),'utf8');assert.doesNotMatch(html,/id="objects-tag"|data-view=|objects-slide-controls/);assert.match(html,/id="objects-search"/);}
assert.doesNotMatch(source,/objects-tag|tags.addEventListener|setView/);
console.log('PASS canvas-only categories: repeated filters, empty states, no tag/toggle/carousel UI.');
// First visit is immediate; dismissal persists across languages, manual reopen remains.
const infoCode=source.slice(source.indexOf('  const infoSeenKey='),source.indexOf('  let measuredWidth='));
const boot=source.slice(source.indexOf('  let infoSeen=false;'),source.lastIndexOf('})();'));
for(const blocked of [false,true]){
 let stored=null,opens=0,focused=0;const infoButton=new Surface(),infoDialog=new Surface();infoDialog.open=false;infoDialog.show=()=>{infoDialog.open=true;opens++};infoDialog.close=()=>{infoDialog.open=false;infoDialog.emit('close')};infoDialog.querySelector=()=>({focus(){},addEventListener(){}});infoButton.focus=()=>focused++;
 infoButton.lastElementChild={textContent:'+'};infoButton.setAttribute=()=>{};infoButton.getBoundingClientRect=()=>({bottom:44});infoDialog.style={setProperty(){}};
 const c={reduced:{matches:true},ResizeObserver:class{observe(){}},infoButton,infoDialog,dialog:{open:false},cancelGesture(){},stopMotion(){},settleGeometry(){},localStorage:{getItem(){if(blocked)throw Error();return stored},setItem(k,v){if(blocked)throw Error();stored=v}}};
 vm.createContext(c);vm.runInContext(infoCode+boot,c);assert.equal(opens,1);infoDialog.close();assert.equal(focused,1);if(!blocked)assert.equal(stored,'1');
 infoButton.emit('click');assert.equal(opens,2);infoDialog.close();
 if(!blocked){vm.runInContext("infoSeen=localStorage.getItem(infoSeenKey)==='1';if(!infoSeen)openInfo();",c);assert.equal(opens,2);}
}
console.log('PASS info: fresh visit auto-open, persisted dismissal, manual reopen and blocked-storage recovery.');

// Integrate real motion functions with real production pointer handlers.
spatial.reduced.matches=false;spatial.window=new Surface();spatial.document.addEventListener=()=>{};spatial.document.querySelector=()=>null;
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

// Exercise the real modal/photo controller with native-scroll events and a
// deliberately asynchronous smooth scroll (rapid commands must not lose taps).
class PhotoElement extends Surface{
 children=[];attributes=new Map();dataset={};style={};classes=new Set();textContent='';scrollLeft=0;scrollTop=0;hidden=false;inert=false;
 classList={add:(name)=>this.classes.add(name),remove:(name)=>this.classes.delete(name),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
 setAttribute(name,value){this.attributes.set(name,value)}
 removeAttribute(name){this.attributes.delete(name);if(name==='href')delete this.href}
 hasAttribute(name){return this.attributes.has(name)}
 before(){}
 replaceChildren(...children){this.children=children}
 append(...children){this.children.push(...children)}
 contains(target){return target===this||this.children.some(child=>child.contains(target))}
 focus(){photoDocument.activeElement=this}
 getBoundingClientRect(){return {left:this.left??12,top:this.top??64,width:this.clientWidth||0,height:this.clientWidth||0}}
 cloneNode(){const node=new PhotoElement();Object.assign(node,{dataset:{...this.dataset},src:this.src,srcset:this.srcset,width:this.width,height:this.height,alt:this.alt,loading:this.loading,className:this.className});node.attributes=new Map(this.attributes);return node}
}
const dialogFields=new Map(),photoWindow=new Surface(),photoDocument=new Surface();
const saleDialog={open:false,querySelector(selector){if(!dialogFields.has(selector))dialogFields.set(selector,new PhotoElement());return dialogFields.get(selector)},querySelectorAll:()=>[],showModal(){this.open=true}};
const photoTrack=saleDialog.querySelector('.objects-dialog-photo');let photoViewportWidth=366;
Object.defineProperty(photoTrack,'clientWidth',{get:()=>saleDialog.open?photoViewportWidth:0});
const scrollRequests=[];let smoothDestination=null;
photoTrack.scrollTo=options=>{scrollRequests.push({...options});if(options.behavior==='smooth')smoothDestination=options.left;else{smoothDestination=null;photoTrack.scrollLeft=options.left}};
const detailMedia=Object.assign(new Surface(),{matches:true}),photoReduced=Object.assign(new Surface(),{matches:true});
let photoTime=0,photoTimerId=0;const photoTimers=new Map(),photoObservers=[];
photoDocument.createElement=()=>new PhotoElement();
const saleContext={URL,document:photoDocument,window:photoWindow,dialog:saleDialog,active:[],matchMedia:()=>detailMedia,reduced:photoReduced,t:x=>x,mod:(value,count)=>(value%count+count)%count,close:{focus(){}},focusMode:false,cancelGesture(){},stopMotion(){},settleGeometry(){},loadPurchased(){},paintDetailNavigation(){},setTimeout(callback,delay){photoTimers.set(++photoTimerId,{callback,time:photoTime+delay});return photoTimerId},clearTimeout(id){photoTimers.delete(id)},ResizeObserver:class{constructor(callback){photoObservers.push(callback)}observe(){}}};
const advancePhotoTime=milliseconds=>{photoTime+=milliseconds;for(const [id,timer] of [...photoTimers])if(timer.time<=photoTime){photoTimers.delete(id);timer.callback()}};
vm.createContext(saleContext);
saleContext.cancelDetailTransition=()=>{};saleContext.detailSheet=saleDialog.querySelector('.objects-dialog-scroll');
const photoCode=source.slice(source.indexOf('  const detailPhotos='),source.indexOf('  function paintDetailNavigation('));
vm.runInContext(photoCode,saleContext);
vm.runInContext(source.slice(source.indexOf('  function show('),source.indexOf('  function cancelGesture(')),saleContext);
const photoGallery=length=>Array.from({length},(_,index)=>Object.assign(new PhotoElement(),{src:`/photo-${index}.webp`,srcset:`/photo-${index}.webp 1200w`,width:1200,height:1200,alt:`Sample photo ${index+1}`,dataset:{source:index?'https://photos.example.com/second':'https://example.com/source'}}));
const showPhotos=(length=8,extra={})=>saleContext.show({name:'Sample product',url:'https://example.com/product',credit:'https://example.com/source',tags:[],gallery:photoGallery(length),...extra},null);
const photoCount=saleDialog.querySelector('.objects-photo-count');
const selectedPhoto=()=>Number(photoCount.textContent.split('/')[0])-1;
const photoStatus=saleDialog.querySelector('.objects-photo-status');
let statusText='',statusWrites=0;
Object.defineProperty(photoStatus,'textContent',{get:()=>statusText,set:value=>{statusText=value;statusWrites++}});
const finishPhotoScroll=()=>{if(smoothDestination!==null){photoTrack.scrollLeft=smoothDestination;smoothDestination=null;}photoTrack.emit('scroll');photoTrack.emit('scrollend')};
const tapPhoto=(step,{touch=false,...extra}={})=>{
 const bounds=photoTrack.getBoundingClientRect(),point={target:photoTrack,pointerId:42,pointerType:touch?'touch':'mouse',clientX:bounds.left+bounds.width*(step<0?.25:.75),clientY:bounds.top+bounds.height*.45,...extra};
 photoTrack.emit('pointerdown',point);
 const finger={identifier:420,clientX:point.clientX,clientY:point.clientY};
 if(touch)photoTrack.emit('touchstart',{changedTouches:[finger],touches:[finger]});
 photoWindow.emit('pointerup',point);
 if(touch)photoWindow.emit('touchend',{changedTouches:[finger],touches:[]});
 return photoTrack.emit('click',point);
};

for(const [url,length] of [['https://example.com/first',8],[null,2],['https://example.com/second',1],[null,8]]){
 saleDialog.querySelector('.objects-dialog-scroll').scrollTop=400;saleDialog.querySelector('.objects-dialog-copy').scrollTop=150;photoTrack.scrollLeft=1464;
 showPhotos(length,{url});
 const photos=photoTrack.children,real=photos.filter(photo=>!photo.inert),copies=photos.filter(photo=>photo.inert);
 assert.equal(photos.length,length>1?length*3:length);assert.equal(real.length,length);
 assert.equal(real[0].loading,'eager');assert.ok(real.slice(1).every(photo=>photo.loading==='lazy'));
 assert.ok(copies.every(photo=>photo.attributes.get('aria-hidden')==='true'&&photo.alt===''&&photo.tabIndex===-1&&photo.loading==='lazy'));
 assert.equal(new Set(photos.map(photo=>photo.src)).size,length);assert.equal(new Set(photos.map(photo=>photo.srcset)).size,length);
 assert.equal(dialogFields.get('.objects-dialog-scroll').scrollTop,0);assert.equal(dialogFields.get('.objects-dialog-copy').scrollTop,0);
 assert.equal(photoTrack.scrollLeft,length>1?length*366:0);assert.equal(photoTrack.tabIndex,length>1?0:-1);
 assert.equal(photoCount.hidden,false);assert.equal(photoCount.textContent,`1/${length}`);assert.equal(selectedPhoto(),0);assert.equal(photoCount.children.length,0);assert.equal(photoCount.handlers.size,0);
 assert.equal(photoTrack.attributes.get('aria-label'),'Product photographs: Sample product');
 const link=dialogFields.get('.objects-dialog-link'),label=dialogFields.get('.objects-dialog-availability');
 assert.equal(link.hidden,!url);assert.equal(label.hidden,!!url);if(url)assert.equal(link.href,url);else assert.equal(link.href,undefined);
 assert.deepEqual(Array.from(dialogFields.get('.objects-dialog-sources').children,link=>link.href),length>1?['https://example.com/source','https://photos.example.com/second']:['https://example.com/source']);
}
console.log('PASS modal replacement: hidden-dialog initial width, real-photo identity, inert hidden duplicate copies with identical source URLs, lazy extras, singleton controls, scroll resets, sources and sale state.');

let photoPrevented=0,photoStopped=0;
const pagePhoto=(key,extra={})=>photoTrack.emit('keydown',{target:photoTrack,key,preventDefault(){photoPrevented++},stopPropagation(){photoStopped++},...extra});
for(const count of [2,8]){
 showPhotos(count);
 for(let i=1;i<=count*3+1;i++){pagePhoto('ArrowRight');assert.equal(selectedPhoto(),i%count);assert.equal(photoTrack.scrollLeft,(count+i%count)*366);}
 for(let i=1;i<=count*3+1;i++)pagePhoto('ArrowLeft');assert.equal(selectedPhoto(),0);
 pagePhoto('ArrowLeft');assert.equal(selectedPhoto(),count-1);pagePhoto('ArrowRight');assert.equal(selectedPhoto(),0);
 pagePhoto('End');assert.equal(selectedPhoto(),count-1);pagePhoto('Home');assert.equal(selectedPhoto(),0);
 // Native swipes cross the trailing/leading copies. No jump occurs under a held finger.
 for(const [physical,expected] of [[count*2,0],[count-1,count-1]]){
  photoTrack.emit('pointerdown',{pointerId:8});photoTrack.scrollLeft=physical*366;photoTrack.emit('scroll');photoTrack.emit('scrollend');
  advancePhotoTime(500);assert.equal(photoTrack.scrollLeft,physical*366);
  photoWindow.emit('pointerup',{pointerId:8});photoTrack.emit('scrollend');
  assert.equal(photoTrack.scrollLeft,(count+expected)*366);assert.equal(selectedPhoto(),expected);
 }
}
// Native touch scroll hands Pointer Events back via pointercancel before the
// finger lifts. Multi-touch must keep a stationary seam from rebasing early.
showPhotos(8);photoTrack.emit('pointerdown',{pointerId:9});
photoTrack.emit('touchstart',{changedTouches:[{identifier:90},{identifier:91}]});
photoWindow.emit('pointercancel',{pointerId:9});photoTrack.scrollLeft=16*366;photoTrack.emit('scroll');photoTrack.emit('scrollend');
advancePhotoTime(1000);assert.equal(photoTrack.scrollLeft,16*366);
photoWindow.emit('touchend',{changedTouches:[{identifier:90}]});advancePhotoTime(1000);assert.equal(photoTrack.scrollLeft,16*366);
photoWindow.emit('touchend',{changedTouches:[{identifier:91}]});advancePhotoTime(160);assert.equal(photoTrack.scrollLeft,8*366);
photoTrack.emit('touchstart',{changedTouches:[{identifier:92}]});photoTrack.scrollLeft=7*366;photoTrack.emit('scroll');
photoWindow.emit('touchcancel',{changedTouches:[{identifier:92}]});advancePhotoTime(160);assert.equal(photoTrack.scrollLeft,15*366);
// Many back-to-back native swipes without any scrollend/debounce window retain
// runway in both directions, even on the two-photo gallery.
showPhotos(2);
for(const direction of [1,-1])for(let i=0;i<40;i++){
 photoTrack.emit('pointerdown',{pointerId:5});photoTrack.emit('touchstart',{changedTouches:[{identifier:50}]});photoWindow.emit('pointercancel',{pointerId:5});
 photoTrack.scrollLeft+=direction*366;photoTrack.emit('scroll');
 assert.ok(photoTrack.scrollLeft>=0&&photoTrack.scrollLeft<=5*366);
 photoWindow.emit('touchend',{changedTouches:[{identifier:50}]});
}
advancePhotoTime(160);assert.equal(selectedPhoto(),0);
const guarded=photoPrevented;
for(const extra of [{altKey:true},{ctrlKey:true},{metaKey:true},{target:{}}])pagePhoto('ArrowLeft',extra);
pagePhoto('ArrowDown');pagePhoto('Escape');assert.equal(photoPrevented,guarded);assert.equal(photoStopped,photoPrevented);
// No pointer capture/preventDefault handlers: native vertical scroll and pinch survive.
assert.equal(photoTrack.captures.size,0);assert.ok(!photoTrack.handlers.has('pointermove'));assert.ok(!photoTrack.handlers.has('touchmove'));
showPhotos(1);const singletonOffset=photoTrack.scrollLeft;pagePhoto('ArrowRight');tapPhoto(1);assert.equal(photoTrack.scrollLeft,singletonOffset);assert.equal(photoTimers.size,0);
console.log('PASS native photo loops: 1/2/8 photos, repeated bidirectional keys, Home/End, both swipe seams, held-touch guards, singleton behavior and keyboard/gesture isolation.');

// Real click activation needs a clean gesture; compatibility clicks after native
// scrolling must not advance once more. Exercise both Pointer/Touch event orders.
for(const count of [1,2,8]){
 showPhotos(count);let expected=0;
 for(const touch of [false,true])for(const direction of [-1,1])for(let i=0;i<count*3+1;i++){
  tapPhoto(direction,{touch});expected=count>1?(expected+1+count)%count:0;assert.equal(selectedPhoto(),expected);
 }
 assert.equal(photoTrack.classes.has('is-interactive'),count>1);
 assert.equal(photoTrack.attributes.has('aria-description'),count>1);
 if(count===1)assert.equal(photoTimers.size,0);
}
const photoPoint=(side=.75)=>{const bounds=photoTrack.getBoundingClientRect();return {target:photoTrack,pointerId:77,pointerType:'touch',clientX:bounds.left+bounds.width*side,clientY:bounds.top+bounds.height*.4}};
for(const touchFirst of [false,true])for(const touchEndsFirst of [false,true])for(const side of [.25,.75]){
 showPhotos(8);const point=photoPoint(side),finger={identifier:770,clientX:point.clientX,clientY:point.clientY};
 const startPointer=()=>photoTrack.emit('pointerdown',point),startTouch=()=>photoTrack.emit('touchstart',{changedTouches:[finger],touches:[finger]});
 if(touchFirst){startTouch();startPointer()}else{startPointer();startTouch()}
 const endPointer=()=>photoWindow.emit('pointerup',point),endTouch=()=>photoWindow.emit('touchend',{changedTouches:[finger],touches:[]});
 if(touchEndsFirst){endTouch();endPointer()}else{endPointer();endTouch()}
 photoTrack.emit('click',point);assert.equal(selectedPhoto(),1);
 photoTrack.emit('click',point);assert.equal(selectedPhoto(),1,'duplicate compatibility click is consumed');
}
for(const side of [.25,.75]){
 showPhotos(8);const point=photoPoint(side),finger={identifier:770,clientX:point.clientX,clientY:point.clientY};
 photoTrack.emit('touchstart',{changedTouches:[finger],touches:[finger]});
 photoWindow.emit('touchend',{changedTouches:[finger],touches:[]});photoTrack.emit('click',point);
 assert.equal(selectedPhoto(),1,'touch-only browsers retain clean taps');
}
for(const scenario of ['horizontal','vertical','release movement','pointer cancel','touch cancel','pinch','outside pinch','parent scroll','resize','blur','hidden','wheel','secondary button','nonprimary']){
 showPhotos(8);const point=photoPoint(),finger={identifier:770,clientX:point.clientX,clientY:point.clientY};
 const start={...point,...(scenario==='secondary button'?{button:2}:{}),...(scenario==='nonprimary'?{isPrimary:false}:{})};
 photoTrack.emit('pointerdown',start);photoTrack.emit('touchstart',{changedTouches:[finger],touches:[finger]});
 if(scenario==='horizontal'||scenario==='vertical'){
  photoWindow.emit('pointermove',{...point,clientX:point.clientX+(scenario==='horizontal'?30:0),clientY:point.clientY+(scenario==='vertical'?30:0)});
  photoWindow.emit('pointermove',point); // Returning to the origin is still a drag.
 }
 if(scenario==='release movement')photoWindow.emit('pointerup',{...point,clientY:point.clientY+30});
 if(scenario==='pointer cancel')photoWindow.emit('pointercancel',point);
 if(scenario==='touch cancel')photoWindow.emit('touchcancel',{changedTouches:[finger],touches:[]});
 if(scenario==='pinch'||scenario==='outside pinch'){
  const second={identifier:771,clientX:point.clientX+20,clientY:point.clientY+20};
  if(scenario==='pinch')photoTrack.emit('touchstart',{changedTouches:[second],touches:[finger,second]});
  else photoWindow.emit('touchstart',{changedTouches:[second],touches:[finger,second]});
  photoWindow.emit('touchmove',{changedTouches:[second],touches:[finger,second]});
  photoWindow.emit('touchend',{changedTouches:[second],touches:[finger]});
 }
 if(scenario==='parent scroll')photoTrack.top=14;
 if(scenario==='resize'){photoViewportWidth=400;photoObservers[0]()}
 if(scenario==='blur')photoWindow.emit('blur');
 if(scenario==='hidden'){photoDocument.hidden=true;photoDocument.emit('visibilitychange');photoDocument.hidden=false}
 if(scenario==='wheel')photoTrack.emit('wheel');
 photoWindow.emit('pointerup',point);photoWindow.emit('touchend',{changedTouches:[finger],touches:[]});
 photoTrack.emit('click',point);assert.equal(selectedPhoto(),0,scenario+' must not click through');
 delete photoTrack.top;if(scenario==='resize'){photoViewportWidth=366;photoObservers[0]()}
}
// Legacy touch movement alone and native scroll takeover both reject the later
// click, while preserving the photo that the swipe already selected.
for(const pointerCancel of [false,true]){
 showPhotos(8);const point=photoPoint(),finger={identifier:770,clientX:point.clientX,clientY:point.clientY};
 if(pointerCancel)photoTrack.emit('pointerdown',point);
 photoTrack.emit('touchstart',{changedTouches:[finger],touches:[finger]});
 if(pointerCancel)photoWindow.emit('pointercancel',point);
 else photoWindow.emit('touchmove',{changedTouches:[{...finger,clientX:finger.clientX-40}],touches:[finger]});
 photoTrack.scrollLeft=9*366;photoTrack.emit('scroll');photoTrack.emit('scrollend');
 advancePhotoTime(500);assert.equal(photoTrack.scrollLeft,9*366);
 photoWindow.emit('touchend',{changedTouches:[finger],touches:[]});advancePhotoTime(160);
 photoTrack.emit('click',point);assert.equal(selectedPhoto(),1);assert.equal(photoTrack.scrollLeft,9*366);
}
showPhotos(4);tapPhoto(1);assert.equal(photoCount.textContent,'2/4');
assert.equal(photoCount.children.length,0,'counter has no interactive dots');
for(const name of ['pointermove','touchmove','touchstart'])assert.equal(photoWindow.listenerOptions.get(name).passive,true);
for(const name of ['pointerdown','touchstart','scroll'])assert.equal(photoTrack.listenerOptions.get(name).passive,true);
assert.equal(photoTrack.captures.size,0);
console.log('PASS image halves: 1/2/8 photos; mouse/touch/legacy taps; both event orders; drag/vertical/pinch/cancel compatibility suppression; resize, blur and wheel cleanup; passive native gestures; noninteractive photo count.');


showPhotos(8);photoReduced.matches=false;
for(let i=0;i<29;i++)tapPhoto(1);
assert.equal(vm.runInContext('mod(detailPhotoTarget,detailPhotoImages.length)',saleContext),5);
assert.ok(smoothDestination>photoTrack.scrollLeft);finishPhotoScroll();assert.equal(selectedPhoto(),5);assert.equal(photoTrack.scrollLeft,13*366);
for(let i=0;i<31;i++)pagePhoto('ArrowLeft');finishPhotoScroll();assert.equal(selectedPhoto(),6);
// Home uses shortest-path wrapping; the visual count excludes all loop copies.
pagePhoto('Home');assert.equal(smoothDestination,16*366);finishPhotoScroll();
assert.equal(selectedPhoto(),0);assert.equal(dialogFields.get('.objects-photo-status').textContent,'Photo 1 of 8');
assert.equal(photoCount.textContent,'1/8');
const settledWrites=statusWrites;photoTrack.emit('scrollend');photoTrack.emit('scroll');advancePhotoTime(160);assert.equal(statusWrites,settledWrites,'equivalent loop rebases never repeat the announcement');
// A stale scrollend from interrupted native smoothing must not force the old target.
tapPhoto(1);photoTrack.scrollLeft=8.25*366;photoTrack.emit('scrollend');assert.equal(photoTrack.scrollLeft,8.25*366);
photoTrack.emit('pointerdown',{pointerId:2});smoothDestination=null;photoTrack.scrollLeft=7*366;photoTrack.emit('scroll');photoWindow.emit('pointercancel',{pointerId:2});
advancePhotoTime(160);assert.equal(selectedPhoto(),7);assert.equal(photoTrack.scrollLeft,15*366);
// Fallback debounce waits for actual motion, then rebases without a backward animation.
photoTrack.scrollLeft=16*366;photoTrack.emit('scroll');photoTrack.scrollLeft=17*366;advancePhotoTime(160);assert.equal(photoTrack.scrollLeft,17*366);
advancePhotoTime(160);assert.equal(photoTrack.scrollLeft,9*366);assert.equal(selectedPhoto(),1);
// Mid-motion rotation keeps the commanded real photo; old width/timers cannot win.
tapPhoto(1);photoViewportWidth=796;photoObservers[0]();assert.equal(photoTrack.scrollLeft,10*796);assert.equal(selectedPhoto(),2);
advancePhotoTime(500);assert.equal(photoTrack.scrollLeft,10*796);
tapPhoto(1);photoReduced.matches=true;photoReduced.emit('change');assert.equal(photoTrack.scrollLeft,11*796);assert.equal(selectedPhoto(),3);assert.equal(smoothDestination,null);
// Desktop removes duplicates and controls; returning to mobile preserves the photo.
photoTrack.focus();
detailMedia.matches=false;detailMedia.emit('change');assert.equal(photoDocument.activeElement,dialogFields.get('.objects-dialog-title'));assert.equal(photoTrack.children.length,8);assert.equal(photoTrack.tabIndex,-1);assert.equal(photoCount.hidden,true);
assert.equal(photoTrack.attributes.has('aria-description'),false);pagePhoto('ArrowRight');assert.equal(photoTrack.scrollLeft,0);
detailMedia.matches=true;detailMedia.emit('change');assert.equal(photoTrack.children.length,24);assert.equal(photoTrack.scrollLeft,11*796);assert.equal(selectedPhoto(),3);
photoTrack.focus();detailMedia.matches=false;detailMedia.emit('change');assert.equal(photoDocument.activeElement,dialogFields.get('.objects-dialog-title'));detailMedia.matches=true;detailMedia.emit('change');
// Media-query events can precede ResizeObserver: preserve a pending command in
// either order, even when mobile controls disappear before scrolling settles.
photoReduced.matches=false;tapPhoto(1);detailMedia.matches=false;detailMedia.emit('change');
assert.equal(photoCount.hidden,true);assert.equal(photoCount.textContent,'5/8');assert.equal(smoothDestination,null);
detailMedia.matches=true;detailMedia.emit('change');assert.equal(photoCount.textContent,'5/8');assert.equal(photoTrack.scrollLeft,12*796);
// Canceled callback generations cannot repaint a replacement product or a closed dialog.
photoReduced.matches=false;tapPhoto(1);const oldCallback=[...photoTimers.values()][0].callback;
showPhotos(2);oldCallback();assert.equal(selectedPhoto(),0);assert.equal(photoTrack.scrollLeft,2*796);
tapPhoto(1);const closeCallback=[...photoTimers.values()][0].callback;saleDialog.open=false;saleContext.cancelDetailPhotos();const beforeClose=photoTrack.scrollLeft;closeCallback();advancePhotoTime(1000);assert.equal(photoTrack.scrollLeft,beforeClose);assert.equal(photoTimers.size,0);photoObservers[0]();assert.equal(photoTrack.scrollLeft,beforeClose);
photoViewportWidth=366;showPhotos(8);assert.equal(photoTrack.scrollLeft,8*366);
// Runtime labels translate independently of catalog text.
saleContext.t=x=>x==='Product photographs'?'商品写真':x==='Swipe, tap the left or right half of the photo, or use Left and Right arrow keys to browse photos. Home and End select the first and last photo.'?'スワイプ、写真の左半分・右半分のタップ、または左右の矢印キーで写真を切り替えられます。HomeキーとEndキーで最初と最後の写真を選択できます。':x==='Photo {number} of {count}'?'写真 {number} / {count}':x==='Show photo {number} of {count}'?'写真 {number} / {count} を表示':x;
showPhotos(8,{name:'サンプル'});assert.equal(photoTrack.attributes.get('aria-label'),'商品写真: サンプル');assert.match(photoTrack.attributes.get('aria-description'),/スワイプ/);
photoReduced.matches=true;pagePhoto('End');assert.equal(dialogFields.get('.objects-photo-status').textContent,'写真 8 / 8');assert.equal(photoCount.textContent,'8/8');
console.log('PASS photo controls: asynchronous rapid taps, accurate real-photo totals and settled announcements, stale scrollend, interrupted touch/cancel, momentum debounce, orientation, reduced-motion changes, desktop mode, stale callback/close cleanup and Japanese labels.');
const phoneCss=css.slice(css.indexOf('/* A native photo track on phones'),css.indexOf('/* Adjacent products push'));
assert.match(phoneCss,/@media\(max-width:767px\),\(max-width:1023px\) and \(max-height:500px\) and \(pointer:coarse\)/);
assert.match(phoneCss,/inset:auto 0 0;margin:0;width:100%;height:90dvh;max-height:90dvh;padding:0;gap:0;grid-template-rows:minmax\(0,1fr\) auto/);
assert.match(phoneCss,/grid-template-rows:auto max-content;min-height:0;height:auto/);
assert.match(css,/#object-dialog \.objects-dialog-image\{width:100%;height:auto!important;max-height:none;aspect-ratio:1 \/ 1;object-fit:cover/);
assert.match(phoneCss,/overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory/);
assert.match(phoneCss,/overscroll-behavior-y:auto;touch-action:pan-x pan-y pinch-zoom/);
assert.match(phoneCss,/height:auto!important;aspect-ratio:1 \/ 1;object-fit:cover;object-position:center/);
assert.match(phoneCss,/objects-dialog-copy\{grid-column:1;grid-row:2;position:static;max-height:none;overflow:visible/);
assert.doesNotMatch(phoneCss,/objects-photo-pagination|objects-photo-controls/);
assert.match(phoneCss,/objects-dialog-gallery\{position:relative;grid-column:1;grid-row:1\}/);
assert.match(phoneCss,/objects-photo-count:not\(\[hidden\]\)\{position:absolute;z-index:1;right:12px;bottom:12px;display:block/);
assert.match(phoneCss,/objects-photo-count[^}]*border:0;background:transparent;box-shadow:none;[^}]*font:400 12px\/1.4 var\(--mono\);[^}]*pointer-events:none/);
assert.match(phoneCss,/objects-dialog-photo:focus-visible\{background-color:transparent!important\}/);
assert.match(phoneCss,/objects-dialog-photo:focus-visible \+ \.objects-photo-count\{color:var\(--red\);text-decoration:underline/);
const objectsGenerator=readFileSync(new URL('../scripts/build-objects.py',import.meta.url),'utf8');
assert.doesNotMatch(objectsGenerator,/data-photo-step|objects-photo-hint/);
assert.match(objectsGenerator,/<div class="objects-dialog-gallery"><div class="objects-dialog-photo"[^>]*><\/div><span class="objects-photo-count" aria-hidden="true" hidden><\/span>/);
assert.doesNotMatch(objectsGenerator,/objects-photo-pagination|objects-photo-controls/);

assert.match(phoneCss,/objects-product-arrow:focus-visible\{color:var\(--red\);background:/);
assert.match(css,/#object-dialog \.objects-dialog-scroll\{overflow-y:auto\}/);
assert.match(sharedCss,/\[tabindex\]:not\(\[tabindex="-1"\]\)\):focus-visible\{background-color:/);
assert.match(source,/cancelDetailTransition\(\);cancelDetailPhotos\(\);purchaseGeneration\+\+/);
console.log('PASS mobile gallery layout: square cover frames, bottom-right background-free mono count, color/underline keyboard focus, native two-axis gestures and vertical sheet overflow.');

// Product cards push horizontally; old cards are inert visual ghosts.
const peekBack=new Surface(),peekNext=new Surface();
peekBack.dataset={productStep:'-1'};peekNext.dataset={productStep:'1'};
for(const button of [peekBack,peekNext]){button.hasAttribute=()=>false;button.replaceChildren=(...children)=>button.children=children;button.setAttribute=()=>{};button.getBoundingClientRect=()=>({left:0,top:button===peekNext?760:0,width:860,height:48});}
const transitions=[],poses=[];
const animated=()=>({animate(frames,options){poses.push({frames,options});let resolve;const finished=new Promise(r=>resolve=r);const animation={finished,cancel(){resolve();},finish(){resolve();}};transitions.push({resolve,animation});return animation;}});
const ghosts=[];
const sheet={...animated(),scrollTop:140,inert:false,contains:()=>false,getBoundingClientRect:()=>({left:0,top:60,width:900,height:688}),cloneNode(){const children={'.objects-dialog-copy':{scrollTop:0},'.objects-dialog-photo':{scrollLeft:0}};const ghost={...animated(),style:{},classList:{add(){}},removeAttribute(){},setAttribute(){},querySelector:s=>children[s],querySelectorAll:()=>[],remove(){this.removed=true;}};ghosts.push(ghost);return ghost;}};
photoTrack.scrollLeft=1098;
const fields={'.objects-dialog-scroll':sheet,'.objects-dialog-title':{focus(){}},'.objects-dialog-copy':{scrollTop:85},'.objects-dialog-photo':photoTrack};
const detailContext={dialog:{open:true,classList:{add(){},remove(){}},getBoundingClientRect:()=>({left:0,top:0}),append(){},querySelector:s=>fields[s],querySelectorAll:s=>s==='[data-product-step]'?[peekBack,peekNext]:[]},detailProductArrows:{},detailProductButtons:[peekBack,peekNext],detailMobile:{matches:false},active:products.filter(p=>p.category==='wear').slice(0,3).map(p=>({...p,gallery:[{},{}]})),mod:(v,n)=>(v%n+n)%n,document:{createElement:()=>({})},detailPhotos:photoTrack,matchMedia:()=>detailMedia,t:x=>x,reduced:{matches:false},returnFocus:{},show(item){detailContext.seen=item.id;detailContext.paintDetailNavigation(item);photoTrack.scrollLeft=0}};
vm.createContext(detailContext);vm.runInContext(source.slice(source.indexOf('  let detailItem='),source.indexOf('  const detailPhotos='))+source.slice(source.indexOf('  function paintDetailNavigation('),source.indexOf('  function show(')),detailContext);
detailContext.paintDetailNavigation(detailContext.active[0]);assert.match(peekBack.children[1].textContent,new RegExp(detailContext.active[2].brand));
const changing=peekNext.handlers.get('click')();assert.equal(transitions.length,2);assert.equal(detailContext.seen,detailContext.active[1].id);assert.equal(sheet.inert,true);assert.notEqual(peekNext.disabled,true);
assert.equal(ghosts[0].scrollTop,140);assert.equal(ghosts[0].querySelector('.objects-dialog-copy').scrollTop,85);assert.equal(ghosts[0].querySelector('.objects-dialog-photo').scrollLeft,1098);assert.equal(photoTrack.scrollLeft,0);
assert.equal(poses[0].frames[1].transform,'translateX(-900px)');assert.equal(poses[1].frames[0].transform,'translateX(900px)');
assert.deepEqual(poses[0].options,poses[1].options);
const repeated=peekNext.handlers.get('click')();assert.equal(transitions.length,4);assert.equal(detailContext.seen,detailContext.active[2].id);assert.equal(ghosts[0].removed,true);
transitions.splice(0).forEach(x=>x.resolve());await Promise.all([changing,repeated]);assert.equal(sheet.inert,false);assert.equal(ghosts[1].removed,true);assert.equal(peekNext.disabled,false);
const returning=peekBack.handlers.get('click')();assert.equal(poses[4].frames[1].transform,'translateX(900px)');assert.equal(poses[5].frames[0].transform,'translateX(-900px)');
detailContext.cancelDetailTransition();await returning;assert.equal(sheet.inert,false);assert.equal(ghosts[2].removed,true);
transitions.length=0;detailContext.reduced.matches=true;const count=poses.length;await peekBack.handlers.get('click')();assert.equal(poses.length,count);assert.equal(detailContext.seen,detailContext.active[0].id);
assert.doesNotMatch(source,/scrollBy/);assert.match(source,/cancelDetailTransition\(\);cancelDetailPhotos\(\);purchaseGeneration\+\+/);
assert.match(css,/objects-dialog-photo\{display:block;height:auto/);
console.log('PASS horizontal product push: filtered wrapping, matched full-width translations/timing, desktop rapid taps, preserved scroll positions, canceled ghosts/inert state and reduced motion.');

// Exercise the complete floating-menu controller, including delayed native close.
const menuSource=readFileSync(new URL('../js/finds-menus.js',import.meta.url),'utf8');
class MenuElement{
 handlers=new Map();attributes=new Map();properties=new Map();classes=new Set();children=[];inert=false;open=false;parent=null;
 classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),remove:(...names)=>names.forEach(name=>this.classes.delete(name)),contains:name=>this.classes.has(name)};
 style={setProperty:(name,value)=>this.properties.set(name,value)};
 addEventListener(name,fn){const handlers=this.handlers.get(name)||[];handlers.push(fn);this.handlers.set(name,handlers)}
 setAttribute(name,value){this.attributes.set(name,value)}
 querySelector(selector){return this.selectors?.[selector]||null}
 querySelectorAll(){return this.children}
 contains(target){return !!target&&(target===this||this.children.some(child=>child.contains(target)))}
 append(...children){this.children.push(...children);children.forEach(child=>child.parent=this)}
 emit(name,props={}){const event={target:this,pointerType:'mouse',defaultPrevented:false,preventDefault(){this.defaultPrevented=true},...props};this.handlers.get(name)?.forEach(fn=>fn(event));return event}
}
function menuFixture(reduce=false,mobileMode=false){
 const home=new MenuElement(),trigger=new MenuElement(),nav=new MenuElement(),categories=new MenuElement(),summary=new MenuElement(),panel=new MenuElement(),outside=new MenuElement(),document=new MenuElement(),media=new MenuElement(),mobile=new MenuElement(),zoom=new MenuElement();
 nav.append(...Array.from({length:6},()=>new MenuElement()));panel.append(...Array.from({length:5},()=>new MenuElement()));home.append(trigger,nav);categories.append(summary,panel);
 home.selectors={'.finds-home-trigger':trigger,nav};categories.selectors={summary,'.objects-tools-panel':panel};document.selectors={'.finds-home-menu':home,'.objects-tools':categories};document.activeElement=outside;media.matches=reduce;mobile.matches=mobileMode;document.getElementById=id=>id==='objects-zoom'?zoom:null;zoom.focus=()=>{document.activeElement=zoom};
 for(const root of [home,categories])for(const element of [root,...root.children,...root.children.flatMap(child=>child.children)])element.focus=()=>{document.activeElement=element;root.emit('focusin',{target:element})};
 let serial=0,now=0;const timers=new Map();
 const context={document,matchMedia:query=>query.includes('max-width')?mobile:media,setTimeout(fn,ms){timers.set(++serial,{fn,time:now+ms});return serial},clearTimeout(id){timers.delete(id)}};
 vm.runInNewContext(menuSource,context);
 const advance=ms=>{now+=ms;for(const [id,timer] of timers)if(timer.time<=now){timers.delete(id);timer.fn()}};
 return {home,trigger,nav,categories,summary,panel,outside,document,media,mobile,zoom,timers,advance};
}
for(const reduced of [false,true]){
 const f=menuFixture(reduced);f.summary.emit('click');f.panel.children[1].focus();
 f.mobile.matches=true;f.mobile.emit('change');
 assert.equal(f.document.activeElement,f.zoom);assert.equal(f.categories.open,false);assert.equal(f.categories.inert,false);assert.equal(f.panel.inert,true);assert.equal(f.timers.size,0);
 f.summary.emit('click');assert.equal(f.categories.open,true);
 f.summary.emit('click');f.advance(1000);f.mobile.matches=false;f.mobile.emit('change');assert.equal(f.categories.inert,false);f.summary.emit('click');assert.equal(f.categories.open,true);
 f.summary.emit('click');f.mobile.matches=true;f.mobile.emit('change');f.advance(1000);assert.equal(f.categories.open,false);
 const fresh=menuFixture(reduced,true);assert.equal(fresh.categories.inert,false);assert.equal(fresh.categories.open,false);
}
const menu=menuFixture();
assert.equal(menu.nav.inert,true);assert.equal(menu.panel.inert,true);assert.equal(menu.categories.open,false);
assert.deepEqual(menu.nav.children.map(item=>item.properties.get('--finds-menu-enter')),['0ms','44ms','88ms','132ms','176ms','220ms']);
assert.deepEqual(menu.nav.children.map(item=>item.properties.get('--finds-menu-exit')),['220ms','176ms','132ms','88ms','44ms','0ms']);
menu.home.emit('pointerenter',{pointerType:'touch'});assert.equal(menu.nav.inert,true);
menu.home.emit('pointerenter');assert.equal(menu.nav.inert,false);assert.equal(menu.trigger.attributes.get('aria-expanded'),'true');
menu.home.emit('pointerleave');assert.equal(menu.nav.inert,true);assert.equal(menu.home.classes.has('is-closing'),true);
menu.advance(100);menu.home.emit('pointerenter');menu.advance(600);assert.equal(menu.home.classes.has('is-open'),true);assert.equal(menu.home.classes.has('is-closing'),false);assert.equal(menu.nav.inert,false);
menu.nav.children[2].focus();menu.document.emit('keydown',{key:'Escape'});assert.equal(menu.document.activeElement,menu.trigger);assert.equal(menu.nav.inert,true);assert.equal(menu.trigger.attributes.get('aria-expanded'),'false');
menu.advance(480);assert.equal(menu.home.classes.has('is-closing'),false);
// A touch first tap only opens Home; the next tap keeps its ordinary destination.
menu.trigger.emit('pointerdown',{pointerType:'touch'});menu.trigger.focus();assert.equal(menu.trigger.emit('click',{pointerType:'touch'}).defaultPrevented,true);
menu.trigger.emit('pointerdown',{pointerType:'touch'});assert.equal(menu.trigger.emit('click',{pointerType:'touch'}).defaultPrevented,false);
menu.document.emit('pointerdown',{target:menu.outside});assert.equal(menu.nav.inert,true);menu.advance(480);
assert.equal(menu.summary.emit('click').defaultPrevented,true);assert.equal(menu.categories.open,true);assert.equal(menu.panel.inert,false);
menu.summary.emit('click');assert.equal(menu.categories.open,true);assert.equal(menu.panel.inert,true);assert.equal(menu.summary.attributes.get('aria-expanded'),'false');
menu.advance(100);menu.summary.emit('click');menu.advance(600);assert.equal(menu.categories.open,true);assert.equal(menu.panel.inert,false);
menu.panel.children[3].focus();menu.document.emit('keydown',{key:'Escape'});assert.equal(menu.document.activeElement,menu.summary);assert.equal(menu.panel.inert,true);
menu.advance(435);assert.equal(menu.categories.open,true);menu.advance(1);assert.equal(menu.categories.open,false);
menu.summary.emit('click');menu.categories.emit('focusout',{relatedTarget:menu.panel.children[0]});assert.equal(menu.panel.inert,false);
menu.categories.emit('focusout',{relatedTarget:menu.outside});assert.equal(menu.panel.inert,true);menu.advance(436);assert.equal(menu.categories.open,false);
menu.summary.emit('click');menu.document.emit('pointerdown',{target:menu.outside});assert.equal(menu.panel.inert,true);
menu.media.matches=true;menu.media.emit('change');assert.equal(menu.categories.open,false);assert.equal(menu.timers.size,0);
for(const fixture of [menu,menuFixture(true)]){
 fixture.summary.emit('click');assert.equal(fixture.panel.inert,false);fixture.summary.emit('click');assert.equal(fixture.categories.open,false);assert.equal(fixture.timers.size,0);
 fixture.home.emit('pointerenter');fixture.home.emit('focusout',{relatedTarget:fixture.outside});assert.equal(fixture.nav.inert,true);assert.equal(fixture.home.classes.has('is-closing'),false);
}
assert.match(css,/\.finds-menu-motion \.finds-menu-item\{[^}]*opacity:0;transform:translateX\(-16px\);visibility:hidden;pointer-events:none/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.finds-menu-motion \.finds-menu-item\{transition:none;transform:none\}\}/);
console.log('PASS menu staircase: ordered delays, reverse exit, repeated open/close, canceled timers, Escape focus return, touch Home, outside/focus dismissal, inert closed panels and reduced-motion changes.');
for(const [category,items] of visitOrders)assert.deepEqual(ids(items),visitSnapshot.get(category));
assert.equal(randomCalls,generatedCalls);
assert.equal(spatial.active,visitOrders.get('all'));
console.log('PASS visit stability: repeated category filters, pan/zoom/focus and dialog interactions retain the generated orders without fresh randomness.');
await import('./objects-canvas-pinch.mjs');
