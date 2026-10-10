import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');
const shared=readFileSync(new URL('../css/walla.css',import.meta.url),'utf8');
const block=(text,selector)=>text.slice(text.indexOf(selector+'{')+selector.length+1).split('}')[0];
const globalFocus=':is(input,select,textarea,[tabindex]:not([tabindex="-1"])):focus-visible';
// Source-level cascade regression, not a browser/compositor test. Both
// declarations are important; the local ID selector wins over the global
// selector's two attribute/pseudo-class components, even if CSS order changes.
assert.match(block(shared,globalFocus),/background-color:var\(--sand\)!important/);
assert.match(block(css,'#objects-canvas:focus-visible'),/background-color:var\(--beige\)!important/);
assert.match(shared,/--sand:#d6cec5/);assert.match(shared,/--beige:#faf0e6/);
assert.match(css,/#objects-canvas:focus-visible \.objects-tile.is-keyboard-target figcaption\{opacity:1;visibility:visible;transform:none;color:var\(--red\)/);
assert.match(source,/show\(catalog.find\(item=>item.id===tile.dataset.object\),canvas\)/);
assert.match(source,/if\(active.length\)show\(active\[indexAt\(.*\)\],canvas\)/);
for(const route of ['../objects/index.html','../ja/objects/index.html']){
  const html=readFileSync(new URL(route,import.meta.url),'utf8');
  assert.match(html,/<div class="objects-canvas" id="objects-canvas" tabindex="0"/);
}
// Canvas/page receive no opacity or filter mutation; the warm filter belongs
// to product images. Closed product and Info backdrops are transparent.
assert.match(css,/\.objects-page\{--object-cell:280px;background:var\(--beige\)/);
assert.match(css,/\.objects-tile img,\.object-card img,#object-dialog \.objects-dialog-image\{filter:var\(--finds-photo-treatment\)\}/);
for(const id of ['object-dialog','objects-info-dialog']){
  assert.match(block(css,`#${id}::backdrop`),/background:rgba\(50,5,5,0\)/);
  assert.match(block(css,`#${id}[open]::backdrop`),/background:rgba\(50,5,5,\.4\)/);
}
assert.doesNotMatch(source,/(?:canvas|page)\.style\.(?:background|filter|opacity)/);

class Element {
  handlers=new Map();attributes=new Map();dataset={};style={};children=[];scrollTop=0;scrollLeft=0;inert=false;
  classes=new Set();classList={add:name=>this.classes.add(name),remove:name=>this.classes.delete(name),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
  addEventListener(name,handler){this.handlers.set(name,handler)}
  emit(name,event={}){return this.handlers.get(name)?.({target:this,...event})}
  setAttribute(name,value){this.attributes.set(name,value)}
  hasAttribute(name){return this.attributes.has(name)}
  removeAttribute(name){this.attributes.delete(name)}
  replaceChildren(...children){this.children=children}
  querySelectorAll(){return []}
  contains(node){return node===this||this.children.some(child=>child.contains(node))}
  remove(){this.removed=true}
}
function fixture(reduce=false){
  const document={activeElement:null,createElement:()=>new Element()};
  const element=()=>{const node=new Element();node.focus=()=>{document.activeElement=node};return node};
  const dialog=element(),close=element(),canvas=element(),infoDialog=element(),infoButton=element(),infoClose=element();
  const fields=new Map(),pending=[],ghosts=[],animations=[];
  dialog.querySelector=selector=>{if(!fields.has(selector))fields.set(selector,element());return fields.get(selector)};
  const back=element(),next=element();back.dataset.productStep='-1';next.dataset.productStep='1';
  dialog.querySelectorAll=selector=>selector==='[data-product-step]'?[back,next]:[];
  dialog.getBoundingClientRect=()=>({left:12,top:0,right:378,bottom:844});dialog.append=node=>dialog.children.push(node);
  for(const modal of [dialog,infoDialog]){
    modal.open=false;modal.showModal=()=>{modal.open=true};
    // HTML dialog.close() removes open synchronously, then queues close.
    modal.close=()=>{if(modal.open){modal.open=false;pending.push(()=>modal.emit('close'))}};
  }
  infoDialog.querySelector=()=>infoClose;infoDialog.getBoundingClientRect=()=>({left:12,top:12,right:378,bottom:400});
  const sheet=dialog.querySelector('.objects-dialog-scroll'),photos=dialog.querySelector('.objects-dialog-photo');
  sheet.getBoundingClientRect=()=>({left:12,top:60,width:366,height:688});
  for(const button of [back,next])button.getBoundingClientRect=()=>({left:12,top:button===next?760:8,width:350,height:44});
  const animate=()=>{let resolve;const animation={finished:new Promise(r=>resolve=r),cancel(){this.canceled=true;resolve()},finish(){resolve()}};animations.push(animation);return animation};
  sheet.animate=animate;sheet.cloneNode=()=>{const ghost=element(),children=new Map();ghost.querySelector=s=>{if(!children.has(s))children.set(s,element());return children.get(s)};ghost.animate=animate;ghosts.push(ghost);return ghost};
  const photo={dataset:{source:'https://example.com/photo'},cloneNode:element};
  const products=Array.from({length:3},(_,index)=>({id:String(index),name:'Product '+index,brand:'Brand',image:'image.webp',gallery:[photo],tags:[],url:'https://example.com/product',credit:'https://example.com/photo'}));
  const context={document,URL,dialog,close,canvas,infoDialog,infoButton,detailPhotos:photos,detailProductArrows:{},detailProductButtons:[back,next],detailMobile:{matches:false},active:products,reduced:{matches:reduce},returnFocus:null,purchaseGeneration:0,focusMode:false,mod:(value,count)=>(value%count+count)%count,t:text=>text,cancelGesture(){},stopMotion(){},settleGeometry(){},renderDetailPhotos(){},positionDetailPhotos(){},loadPurchased(){context.purchaseGeneration++},cancelDetailPhotos(){context.photosCanceled++},photosCanceled:0,localStorage:{setItem(){}}};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  let detailItem='),source.indexOf('  const detailPhotos='))+source.slice(source.indexOf('  function paintDetailNavigation('),source.indexOf('  function cancelGesture('))+source.slice(source.indexOf("  close.addEventListener('click'"),source.indexOf('  categoryButtons.forEach(button=>button.addEventListener'))+source.slice(source.indexOf('  const infoSeenKey='),source.indexOf('  let measuredWidth=')),context);
  return {context,document,canvas,dialog,close,infoDialog,infoButton,infoClose,sheet,back,next,ghosts,animations,products,open(){context.show(products[0],canvas)},flush(){pending.splice(0).forEach(fn=>fn())}};
}
for(const reduce of [false,true])for(const dismissal of ['button','escape','outside']){
  const f=fixture(reduce);
  for(let repeat=0;repeat<4;repeat++){
    f.open();assert.equal(f.dialog.open,true);assert.equal(f.document.activeElement,f.close);
    const sliding=f.next.emit('click'),repeated=f.next.emit('click');
    if(!reduce){assert.equal(f.sheet.inert,true);assert.equal(f.ghosts.at(-1).inert,true)}
    // Inside clicks never dismiss. Escape's native close is modeled here;
    // physical-key dispatch and compositor removal require browser QA.
    f.dialog.emit('click',{clientX:100,clientY:200});assert.equal(f.dialog.open,true);
    if(dismissal==='button')f.close.emit('click');
    else if(dismissal==='outside')f.dialog.emit('click',{clientX:0,clientY:200});
    else f.dialog.close();
    f.flush();await Promise.all([sliding,repeated]);
    assert.equal(f.dialog.open,false);assert.equal(f.document.activeElement,f.canvas);
    assert.equal(f.sheet.inert,false);assert.equal(f.dialog.classes.has('is-sliding'),false);
    assert.ok(f.ghosts.every(ghost=>ghost.removed));assert.ok(f.animations.every(animation=>animation.canceled));
    assert.equal(f.context.returnFocus,null);assert.equal(f.context.photosCanceled,repeat+1);
  }
  f.infoButton.emit('click');assert.equal(f.infoDialog.open,true);
  f.infoClose.emit('click');f.flush();assert.equal(f.infoDialog.open,false);assert.equal(f.document.activeElement,f.infoButton);
  f.open();f.infoButton.emit('click');assert.equal(f.infoDialog.open,false);
  f.close.emit('click');f.flush();f.infoButton.emit('click');assert.equal(f.infoDialog.open,true);
}
// A close event is queued: immediately reopening must not let the prior
// session steal focus or cancel the newly opened session's photo controller.
{
  const f=fixture();f.open();const rolling=f.next.emit('click');f.close.emit('click');f.open();f.flush();await rolling;
  assert.equal(f.dialog.open,true);assert.equal(f.document.activeElement,f.close);
  assert.equal(f.context.returnFocus,f.canvas);assert.equal(f.context.photosCanceled,0);
  assert.equal(f.sheet.inert,false);assert.ok(f.ghosts.every(ghost=>ghost.removed));
  f.close.emit('click');f.flush();assert.equal(f.document.activeElement,f.canvas);
  f.infoButton.emit('click');f.infoClose.emit('click');f.infoButton.emit('click');f.flush();
  assert.equal(f.infoDialog.open,true);assert.equal(f.document.activeElement,f.infoClose);
}
// The keyboard cue follows the object Enter opens, at every zoom level.
for(const focusMode of [false,true]){
  const tiles=new Map(),canvas={clientWidth:390,clientHeight:844,style:{setProperty(){}}};
  const context={canvas,tiles,layer:{append(){}},frame:1,list:false,active:[{}],x:100,y:-300,cell:112,row:164,focusMode,focusColumn:-1,focusRow:4,nearest:()=>({column:0,line:4}),tileKey:(column,line)=>column+':'+line,indexAt:()=>0,createTile:()=>{const tile=new Element();tile.querySelector=()=>({});return tile}};
  vm.runInNewContext(source.slice(source.indexOf('  function draw()'),source.indexOf('  function createTile('))+'draw();',context);
  const targets=[...tiles.values()].filter(tile=>tile.classes.has('is-keyboard-target'));
  assert.equal(targets.length,1);assert.equal(targets[0].dataset.column,focusMode?-1:0);assert.equal(targets[0].dataset.line,4);
}
console.log('PASS dialog focus regression: beige wins the global Sand Gray focus cascade; Close/native Escape model/outside dismissal, repeated reopen, interrupted horizontal slide cleanup, reduced motion, Info transitions and center-object keyboard cue. Browser rendering remains unverified.');
