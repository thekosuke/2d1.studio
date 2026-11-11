import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');
// Execute the actual purchase, photo, responsive layout and product controllers
// together. This DOM/event model verifies state and order, not browser layout.
function fixture({mobile=true,reduced=false,count=3,language='en',width=390}={}){
  const document={activeElement:null,hidden:false,handlers:new Map()};
  const animations=[],requests=[],observers=[],timers=new Map();let timerId=0;
  class Element{
    children=[];parentNode=null;attributes=new Map();dataset={};style={};classes=new Set();handlers=new Map();className='';textContent='';hidden=false;inert=false;disabled=false;scrollLeft=0;scrollTop=0;clientWidth=width;
    classList={add:(name)=>this.classes.add(name),remove:(name)=>this.classes.delete(name),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
    setAttribute(name,value){this.attributes.set(name,String(value));if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value)}
    hasAttribute(name){return this.attributes.has(name)}
    removeAttribute(name){this.attributes.delete(name);if(name==='href')delete this.href}
    addEventListener(name,handler){const all=this.handlers.get(name)||[];all.push(handler);this.handlers.set(name,all)}
    emit(name,extra={}){const event={type:name,target:this,button:0,preventDefault(){},stopPropagation(){},...extra};return Promise.all((this.handlers.get(name)||[]).map(handler=>handler(event)))}
    matches(selector){if(selector.startsWith('.'))return this.className.split(' ').includes(selector.slice(1))||this.classes.has(selector.slice(1));const match=selector.match(/^\[([^=\]]+)(?:="([^"]+)")?\]$/);return !!match&&this.hasAttribute(match[1])&&(match[2]===undefined||this.attributes.get(match[1])===match[2])}
    querySelectorAll(selector){return this.children.flatMap(child=>[...(selector.split(',').some(part=>child.matches(part))?[child]:[]),...child.querySelectorAll(selector)])}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null}
    append(...children){for(const child of children){child.remove();child.parentNode=this;this.children.push(child)}}
    before(child){const parent=this.parentNode;if(!parent)return;child.remove();child.parentNode=parent;parent.children.splice(parent.children.indexOf(this),0,child)}
    remove(){if(this.parentNode){this.parentNode.children.splice(this.parentNode.children.indexOf(this),1);this.parentNode=null}}
    replaceChildren(...children){for(const child of this.children)child.parentNode=null;this.children=[];this.append(...children)}
    contains(node){return node===this||this.children.some(child=>child.contains(node))}
    focus(){document.activeElement=this}
    getBoundingClientRect(){return {left:0,top:this.top||0,right:390,bottom:844,width:this.clientWidth,height:this.height||640}}
    scrollTo({left}){this.scrollLeft=left}
    cloneNode(deep){const node=new Element();Object.assign(node,{dataset:{...this.dataset},className:this.className,src:this.src,srcset:this.srcset,alt:this.alt,width:this.width,height:this.height,loading:this.loading,clientWidth:this.clientWidth,textContent:this.textContent,hidden:this.hidden});node.attributes=new Map(this.attributes);node.classes=new Set(this.classes);if(deep)node.append(...this.children.map(child=>child.cloneNode(true)));return node}
    animate(frames,options){let resolve;const animation={element:this,frames,options,finished:new Promise(r=>resolve=r),cancel(){this.canceled=true;resolve()},finish(){resolve()}};animations.push(animation);return animation}
  }
  const make=(className='')=>Object.assign(new Element(),{className});
  document.createElement=()=>make();document.addEventListener=Element.prototype.addEventListener;document.emit=Element.prototype.emit;
  const dialog=make(),close=make('objects-dialog-close'),sheet=make('objects-dialog-scroll'),layout=make('objects-dialog-layout'),gallery=make('objects-dialog-gallery'),photos=make('objects-dialog-photo'),photoCount=make('objects-photo-count'),photoStatus=make('objects-photo-status'),copy=make('objects-dialog-copy'),brand=make('objects-dialog-brand'),title=make('objects-dialog-title'),description=make('objects-dialog-description'),tags=make('objects-dialog-tags'),ownership=make('objects-purchased'),purchase=make('objects-purchased-button'),purchaseStatus=make(),retry=make(),action=make('objects-dialog-action'),link=make('objects-dialog-link'),availability=make('objects-dialog-availability'),credit=make('objects-dialog-credit'),sources=make('objects-dialog-sources'),footer=make('objects-dialog-footer'),footerAction=make('objects-dialog-footer-action'),arrows=make('objects-product-arrows');
  close.setAttribute('data-close','');retry.setAttribute('data-purchased-retry','');title.setAttribute('id','object-title');purchaseStatus.setAttribute('id','objects-purchased-status');purchaseStatus.setAttribute('role','status');photoStatus.setAttribute('role','status');link.href='#';
  const button=(step,isArrow)=>{const node=make(isArrow?'objects-product-arrow':'objects-product-peek');node.setAttribute('data-product-step',step);if(isArrow){node.setAttribute('data-product-arrow','');const icon=make();icon.textContent=step<0?'←':'→';node.append(icon)}return node};
  const back=button(-1,false),next=button(1,false),arrowBack=button(-1,true),arrowNext=button(1,true);
  gallery.append(photos,photoCount,photoStatus);ownership.append(purchase,purchaseStatus,retry);action.append(link,availability);credit.append(sources);copy.append(brand,title,description,tags,ownership,action,credit);layout.append(gallery,copy);sheet.append(layout);arrows.append(arrowBack,arrowNext);footer.append(footerAction,arrows);dialog.append(close,back,sheet,next,footer);
  dialog.open=false;dialog.showModal=()=>{dialog.open=true};dialog.close=()=>{dialog.open=false;return dialog.emit('close')};
  const canvas=make(),window=make(),media=Object.assign(make(),{matches:mobile}),motion=Object.assign(make(),{matches:reduced});
  const photoSet=n=>Array.from({length:n},(_,i)=>Object.assign(make(),{src:`photo-${n}-${i}.jpg`,alt:`Photo ${i+1}`,width:1200,height:1200,dataset:{source:'https://example.com/photos'}}));
  const products=Array.from({length:count},(_,i)=>({id:`item-${i}`,category:'wear',brand:'Brand',name:`Product ${i}`,description:i===1?'Long detail '.repeat(300):'Description',image:'product.png',url:i===1?null:`https://example.com/product-${i}`,credit:'https://example.com/source',tags:['color'],gallery:photoSet([1,2,8][i%3])}));
  document.getElementById=()=>purchaseStatus;
  const t=text=>language==='ja'?({'Previous product':'前の商品','Next product':'次の商品','I have it':'持っています','I have it ✓':'持っています ✓'}[text]||text):text;
  const context={searchInput:null,URL,document,window,dialog,close,canvas,active:products,matchMedia:()=>media,reduced:motion,t,mod:(v,n)=>(v%n+n)%n,returnFocus:null,focusMode:false,motion:null,cancelGesture(){},stopMotion(){},settleGeometry(){},ResizeObserver:class{constructor(callback){observers.push(callback)}observe(){}},setTimeout(callback){timers.set(++timerId,callback);return timerId},clearTimeout(id){timers.delete(id)},fetch:(url,options)=>new Promise((resolve,reject)=>requests.push({url,options,resolve,reject})),encodeURIComponent};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  const purchaseButton='),source.indexOf('  function cancelGesture('))+source.slice(source.indexOf("  close.addEventListener('click'"),source.indexOf('  categoryButtons.forEach(button=>button.addEventListener')),context);
  vm.runInContext(source.slice(source.indexOf("  reduced.addEventListener('change',()=>{if(reduced.matches)"),source.indexOf("  document.querySelector('.skip-link')")),context);
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  const respond=async(request,data)=>{request.resolve({ok:true,json:async()=>data});await flush()};
  const click=node=>{node.focus();return node.emit('click')};
  const finish=async()=>{animations.filter(a=>!a.canceled).forEach(a=>a.finish());await flush()};
  return {context,document,dialog,close,canvas,sheet,copy,photos,photoCount,title,brand,description,credit,action,link,availability,footer,footerAction,arrows,back,next,arrowBack,arrowNext,purchase,purchaseStatus,retry,media,motion,products,requests,animations,observers,timers,click,finish,respond,open(index=0){context.show(products[index],canvas)},async resize(mobile){media.matches=mobile;await media.emit('change')}};
}

// Test the actual animation keyframes, not a second transition implementation:
// both full-size cards share timing and remain edge-to-edge throughout a push.
function assertPush(pair,width,step){
  assert.equal(pair.length,2);
  const [outgoing,incoming]=pair;
  assert.deepEqual(outgoing.options,incoming.options);
  assert.ok(outgoing.options.duration>0);
  const positions=pair.map(animation=>animation.frames.map(frame=>{
    assert.deepEqual(Object.keys(frame),['transform'],'no fading, shrinking or rotating cards');
    const match=frame.transform.match(/^translateX\((-?\d+(?:\.\d+)?)px\)$/);
    assert.ok(match,frame.transform);return Number(match[1]);
  }));
  assert.equal(positions[0][0],0);assert.equal(positions[0][1],-step*width);
  assert.equal(positions[1][0],step*width);assert.equal(positions[1][1],0);
  for(const progress of [0,.1,.25,.5,.75,.9,1]){
    const x=positions.map(([start,end])=>start+(end-start)*progress);
    assert.ok(Math.abs(x[1]-x[0]-step*width)<.001,'card edges touch at every shared eased progress');
  }
}

for(const [mobile,width] of [[true,320],[true,390],[true,844],[false,690],[false,900]]){
  const f=fixture({mobile,width});f.open();
  const next=mobile?f.arrowNext:f.next,back=mobile?f.arrowBack:f.back;
  const first=f.click(next);assertPush(f.animations.slice(-2),width,1);
  assert.equal(next.disabled,false);assert.equal(back.disabled,false);
  const initialGhost=f.dialog.querySelector('.objects-detail-ghost');
  assert.equal(initialGhost.inert,true);assert.equal(initialGhost.attributes.get('aria-hidden'),'true');
  assert.equal(initialGhost.querySelectorAll('[id],[role="status"],[aria-live]').length,0);
  const reverse=f.click(back);assertPush(f.animations.slice(-2),width,-1);
  assert.equal(f.title.textContent,'Product 0');assert.equal(initialGhost.parentNode,null);
  assert.ok(f.animations.slice(0,2).every(animation=>animation.canceled));
  assert.equal(f.dialog.querySelectorAll('.objects-detail-ghost').length,1);
  const last=f.click(back);assertPush(f.animations.slice(-2),width,-1);
  assert.equal(f.title.textContent,'Product 2');
  f.close.focus();await f.finish();await Promise.all([first,reverse,last]);
  assert.equal(f.document.activeElement,f.close,'completion cannot steal focus from Close on any viewport');
  assert.equal(f.sheet.inert,false);assert.equal(f.dialog.classes.has('is-sliding'),false);
  assert.equal(f.dialog.querySelectorAll('.objects-detail-ghost').length,0);
  // Reduced motion toggled while pushing settles the selected card immediately.
  const reducing=f.click(next);f.motion.matches=true;await f.motion.emit('change');await reducing;
  assert.equal(f.title.textContent,'Product 0');assert.equal(f.sheet.inert,false);
  assert.equal(f.document.activeElement,mobile?next:f.title);
  assert.equal(f.dialog.querySelectorAll('.objects-detail-ghost').length,0);
  const animationCount=f.animations.length;await f.click(back);
  assert.equal(f.animations.length,animationCount);assert.equal(f.title.textContent,'Product 2');
  // Same-breakpoint reflow invalidates measured width as well as orientation changes.
  f.motion.matches=false;const resizing=f.click(next);f.sheet.clientWidth=width+32;f.observers[1]();await resizing;
  assert.equal(f.sheet.inert,false);assert.equal(f.dialog.querySelectorAll('.objects-detail-ghost').length,0);
  const resized=f.click(next);assertPush(f.animations.slice(-2),width+32,1);
  await f.close.emit('click');await resized;
  assert.equal(f.document.activeElement,f.canvas);assert.equal(f.sheet.inert,false);
  assert.equal(f.dialog.querySelectorAll('.objects-detail-ghost').length,0);
  assert.ok(f.animations.every(animation=>animation.canceled));
}
console.log('PASS coordinated product push: phone/landscape/tablet/desktop widths, next/previous, immediate reversals, touching card edges, identical timing, inert sanitized ghosts, current-product focus, close/resize cancellation and live reduced-motion changes.');

for(const language of ['en','ja'])for(const reduced of [false,true]){
  const f=fixture({language,reduced});f.open();
  assert.equal(f.action.parentNode,f.footerAction);assert.equal(f.footer.hidden,false);assert.equal(f.footer.inert,false);assert.equal(f.back.hidden,true);assert.equal(f.next.hidden,true);assert.equal(f.document.activeElement,f.close);
  assert.equal(f.link.href,'https://example.com/product-0');assert.equal(f.link.hidden,false);assert.equal(f.availability.hidden,true);assert.equal(f.arrowBack.children[0].textContent,'←');assert.equal(f.arrowNext.children[0].textContent,'→');
  assert.equal(f.arrowNext.attributes.get('aria-label'),`${language==='ja'?'次の商品':'Next product'}: Product 1`);
  const oldRequest=f.requests.shift();await f.respond(oldRequest,{count:7,purchased:true});assert.equal(f.purchase.attributes.get('aria-pressed'),'true');
  const saving=f.click(f.purchase),oldSave=f.requests.shift();assert.equal(JSON.parse(oldSave.options.body).product,'item-0');
  const changing=f.click(f.arrowNext);assert.equal(f.title.textContent,'Product 1');assert.equal(f.link.hidden,true);assert.equal(f.link.href,undefined);assert.equal(f.availability.hidden,false);assert.equal(f.purchase.disabled,true);assert.equal(f.purchase.attributes.get('aria-pressed'),'false');assert.equal(f.photos.children.length,6);assert.equal(f.description.textContent,f.products[1].description);assert.equal(f.action.parentNode,f.footerAction);
  const nextRequest=f.requests.shift();await f.respond(nextRequest,{count:2,purchased:false});await f.respond(oldSave,{count:6,purchased:false});await saving;assert.equal(f.purchaseStatus.textContent,'Owned by 2 users');
  assert.ok(f.animations.every(animation=>animation.element!==f.footer&&!f.footer.contains(animation.element)));
  assert.ok(f.dialog.children.filter(node=>node.classes.has('objects-detail-ghost')).every(ghost=>!ghost.querySelector('.objects-dialog-link')));
  if(!reduced){assert.equal(f.sheet.inert,true);assert.equal(f.arrowNext.disabled,false);assert.equal(f.animations[1].frames[0].transform,'translateX(390px)')}
  await f.finish();await changing;assert.equal(f.sheet.inert,false);assert.equal(f.document.activeElement,f.arrowNext);
  // Wrap only the category's current visit order, with no preview markup in arrows.
  let change=f.click(f.arrowNext);await f.finish();await change;assert.equal(f.title.textContent,'Product 2');assert.equal(f.photos.children.length,24);assert.equal(f.link.href,'https://example.com/product-2');assert.equal(f.link.hidden,false);assert.equal(f.availability.hidden,true);
  change=f.click(f.arrowNext);await f.finish();await change;assert.equal(f.title.textContent,'Product 0');assert.equal(f.photos.children.length,1);assert.equal(f.photos.tabIndex,-1);
  change=f.click(f.arrowBack);await f.finish();await change;assert.equal(f.title.textContent,'Product 2');assert.equal(f.arrowBack.children.length,1);assert.equal(f.arrowNext.children.length,1);
  // Responsive order and focus follow the same action/step in either direction.
  f.link.focus();await f.resize(false);assert.equal(f.action.parentNode,f.copy);assert.equal(f.copy.children.indexOf(f.action)+1,f.copy.children.indexOf(f.credit));assert.equal(f.document.activeElement,f.link);assert.equal(f.footer.hidden,true);assert.equal(f.footer.inert,true);assert.equal(f.arrowNext.hidden,true);assert.equal(f.next.hidden,false);assert.equal(f.photos.children.length,8);
  f.next.focus();await f.resize(true);assert.equal(f.document.activeElement,f.arrowNext);assert.equal(f.action.parentNode,f.footerAction);assert.equal(f.photos.children.length,24);
  f.arrowBack.focus();await f.resize(false);assert.equal(f.document.activeElement,f.back);assert.equal(f.action.parentNode,f.copy);
  await f.resize(true);await f.close.emit('click');assert.equal(f.dialog.open,false);assert.equal(f.document.activeElement,f.canvas);
}

// Repeated interruption keeps the latest product and cancels every old ghost,
// animation and ownership generation. Closing cannot leave an inert live sheet.
{
  const f=fixture();f.open();const transitions=[];
  for(let i=0;i<11;i++)transitions.push(f.click(f.arrowNext));
  assert.equal(f.title.textContent,'Product 2');assert.equal(f.dialog.children.filter(node=>node.classes.has('objects-detail-ghost')).length,1);
  const last=f.requests.at(-1);await f.respond(last,{count:22,purchased:true});
  for(const request of f.requests.slice(0,-1))await f.respond(request,{count:99,purchased:false});
  assert.equal(f.purchaseStatus.textContent,'Owned by 22 users');assert.equal(f.purchase.attributes.get('aria-pressed'),'true');
  f.close.focus();await f.finish();await Promise.all(transitions);assert.equal(f.document.activeElement,f.close,'finishing a slide must not steal focus from Close');
  // Portrait and short coarse landscape both match the phone query, so a
  // sheet-size observer must also clear obsolete motion in that same mode.
  const rotating=f.click(f.arrowNext);f.observers[1]();await rotating;assert.equal(f.title.textContent,'Product 0');assert.equal(f.sheet.inert,false);assert.equal(f.document.activeElement,f.arrowNext);assert.equal(f.dialog.children.filter(node=>node.classes.has('objects-detail-ghost')).length,0);
  const restore=f.click(f.arrowBack);await f.finish();await restore;
  const changing=f.click(f.arrowBack);await f.resize(false);await changing;assert.equal(f.sheet.inert,false);assert.equal(f.document.activeElement,f.back);assert.equal(f.title.textContent,'Product 1');assert.equal(f.action.parentNode,f.copy);assert.equal(f.link.hidden,true);assert.equal(f.availability.hidden,false);
  await f.resize(true);const closing=f.click(f.arrowNext);await f.close.emit('click');await closing;
  assert.equal(f.dialog.open,false);assert.equal(f.sheet.inert,false);assert.equal(f.document.activeElement,f.canvas);assert.equal(f.dialog.children.filter(node=>node.classes.has('objects-detail-ghost')).length,0);assert.ok(f.animations.every(animation=>animation.canceled));
  f.open();assert.equal(f.link.href,'https://example.com/product-0');assert.equal(f.link.hidden,false);assert.equal(f.document.activeElement,f.close);
}
for(const count of [1,2]){
  const f=fixture({count,reduced:true});f.open();
  for(const arrow of [f.arrowBack,f.arrowNext])assert.equal(arrow.hidden,count<2);assert.equal(f.arrows.hidden,count<2);
  const generation=f.requests.length;
  if(count===1){await f.arrowNext.emit('click');assert.equal(f.requests.length,generation);assert.equal(f.title.textContent,'Product 0')}
  else for(let i=1;i<=6;i++){await f.click(f.arrowNext);assert.equal(f.title.textContent,`Product ${i%2}`)}
  await f.resize(false);assert.equal(f.back.hidden,count<2);assert.equal(f.next.hidden,count<2);assert.equal(f.action.parentNode,f.copy);
}
// Static layout contract: full-width bottom sheet, stationary sibling footer,
// safe-area padding, scrollable content and square photos at both phone modes.
const mobileCss=css.slice(css.indexOf('/* A native photo track on phones'),css.indexOf('/* Adjacent products push'));
assert.match(mobileCss,/width:100%;height:90dvh;max-height:90dvh;padding:0;gap:0;grid-template-rows:minmax\(0,1fr\) auto/);
assert.match(mobileCss,/objects-dialog-scroll\{grid-column:1;grid-row:1;min-width:0;min-height:0\}/);
assert.match(mobileCss,/objects-dialog-footer:not\(\[hidden\]\)\{position:relative;z-index:4;grid-column:1;grid-row:2;display:flex/);
assert.match(mobileCss,/calc\(12px \+ env\(safe-area-inset-bottom\)\) max\(20px,env\(safe-area-inset-left\)\)/);
assert.match(mobileCss,/objects-dialog-copy\{[^}]*max-height:none;overflow:visible/);
assert.match(mobileCss,/height:auto!important;aspect-ratio:1 \/ 1;object-fit:cover/);
assert.match(mobileCss,/objects-product-arrow\{[^}]*width:48px;height:48px/);
assert.match(mobileCss,/objects-dialog-close span\{font-size:36px\}/);
assert.doesNotMatch(source,/detailFooter\.animate|detailAction\.cloneNode/);
const transitionCss=css.slice(css.indexOf('/* Adjacent products push'),css.indexOf('/* Named collection disclosure'));
assert.doesNotMatch(transitionCss,/perspective|backface-visibility|transform-origin|will-change:transform,opacity|objects-product-peek/);
assert.match(transitionCss,/#object-dialog.is-sliding \.objects-dialog-scroll\{will-change:transform;pointer-events:none\}/);
assert.match(css,/#object-dialog\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\);grid-template-rows:minmax\(0,1fr\) 64px;gap:0;overflow:hidden\}/);
const generator=readFileSync(new URL('../scripts/build-objects.py',import.meta.url),'utf8');
assert.equal((generator.match(/class="objects-dialog-link"/g)||[]).length,1);
assert.match(generator,/class="objects-product-arrows" role="group" aria-label="Product navigation"/);
console.log('PASS mobile product sheet: live footer CTA/availability, ownership response isolation, 1/2/8 photos, category wrapping, small categories, rapid slide interruption/close, fixed footer animation boundary, responsive DOM/focus restoration and safe-area scroll layout contract. Browser rendering remains unverified.');
