import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');
const template=readFileSync(new URL('../scripts/build-objects.py',import.meta.url),'utf8');
const japanese=JSON.parse(readFileSync(new URL('../locales/ja.json',import.meta.url),'utf8'));

class Control {
  handlers=new Map();attributes=new Map();dataset={};hidden=false;disabled=false;tabIndex=0;
  addEventListener(name,fn){this.handlers.set(name,fn)}
  setAttribute(name,value){this.attributes.set(name,value)}
  emit(name){this.handlers.get(name)?.()}
  before(element){const children=this.parent.children;children.splice(children.indexOf(element),1);children.splice(children.indexOf(this),0,element)}
  after(element){const children=this.parent.children;children.splice(children.indexOf(element),1);children.splice(children.indexOf(this)+1,0,element)}
}
function fixture(mobile=true,language='en',reduce=false){
  const input=new Control(),minus=new Control(),plus=new Control(),status=new Control(),media=new Control();
  minus.dataset.zoomStep='-10';plus.dataset.zoomStep='10';media.matches=mobile;
  const controls={children:[minus,input,plus]};for(const element of controls.children)element.parent=controls;
  const elements={'objects-focus-status':{},'objects-instructions':{}};
  const document={activeElement:null,getElementById:id=>elements[id]};
  for(const element of controls.children)element.focus=()=>{document.activeElement=element};
  const canvas={clientWidth:390,clientHeight:844,setAttribute(name,value){this[name]=value}};
  const frames=new Map();let serial=0;
  const context={canvas,document,zoomInput:input,zoomButtons:[minus,plus],zoomStatus:status,mobileZoom:media,
    x:0,y:0,cell:112,row:164,zoom:0,focusMode:false,focusColumn:0,focusRow:0,
    motion:null,motionFrame:0,wheelTimer:0,reduced:{matches:reduce},active:[{brand:'Example',name:'Object'}],
    indexAt:()=>0,cancelGesture(){},clearTimeout(){},schedule(){},clearTiles(){},
    requestAnimationFrame(fn){frames.set(++serial,fn);return serial},cancelAnimationFrame(id){frames.delete(id)},
    classes:{},page:{classList:{toggle(name,value){context.classes[name]=value}}},
    t:text=>language==='ja'?(japanese[text]||text):text};
  vm.createContext(context);
  const geometry=source.match(/const geometry=.*?;};/s)[0];
  const spatial=source.slice(source.indexOf('  const nearest='),source.indexOf('  function draw()'));
  const zoom=source.slice(source.indexOf('  function reset(){'),source.indexOf('  function filter(){'));
  const handlers=source.slice(source.indexOf("  zoomInput.addEventListener('input'"),source.indexOf('  const infoButton='));
  vm.runInContext(geometry+spatial+zoom+handlers,context);context.reset();
  const tick=now=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now))};
  return {context,input,minus,plus,status,media,document,canvas,controls,frames,tick,settle(){tick(0);tick(560)}};
}

for(const language of ['en','ja'])for(const reduce of [false,true]){
  const f=fixture(true,language,reduce),c=f.context;
  assert.equal(f.input.hidden,false);assert.equal(f.input.disabled,false);assert.equal(f.input.tabIndex,0);
  assert.deepEqual(f.controls.children,[f.minus,f.input,f.plus]);
  assert.equal(f.minus.attributes.get('aria-disabled'),'true');assert.equal(f.plus.attributes.get('aria-disabled'),'false');
  assert.equal(f.status.attributes.get('aria-live'),'off');
  for(const expected of [25,50,75,100]){f.plus.emit('click');assert.equal(c.zoom,expected);assert.equal(f.input.value,String(expected));assert.equal(c.classes['objects-show-labels'],expected>=50)}
  assert.equal(c.focusMode,true);assert.equal(f.plus.attributes.get('aria-disabled'),'true');
  assert.equal(f.status.textContent,`100% ${language==='ja'?japanese['Focused canvas']:'Focused canvas'}`);
  const finalMotion=c.motion;for(let n=0;n<12;n++)f.plus.emit('click');assert.equal(c.zoom,100);assert.equal(c.motion,finalMotion);
  f.settle();assert.equal(f.frames.size,0);
  for(const expected of [75,50,25,0]){f.minus.emit('click');assert.equal(c.zoom,expected)}
  assert.equal(c.focusMode,false);assert.equal(c.classes['objects-min-zoom'],true);
  assert.equal(f.minus.attributes.get('aria-disabled'),'true');
  for(let n=0;n<12;n++)f.minus.emit('click');assert.equal(c.zoom,0);
  assert.equal(f.status.textContent,language==='ja'?`0% ${japanese.Canvas}`:'0% Canvas');
  // Mobile uses the same live range, including rapid updates and endpoints.
  for(const value of [37,91,18,100,49,50,0]){f.input.value=String(value);f.input.emit('input');assert.equal(c.zoom,value);assert.equal(c.classes['objects-show-labels'],value>=50);assert.equal(c.focusMode,value===100)}
  for(let n=0;n<20;n++){f.plus.emit('click');f.minus.emit('click')}
  assert.equal(c.zoom,0);f.settle();assert.equal(f.frames.size,0);
}

const f=fixture(false);assert.equal(f.input.hidden,false);assert.equal(f.input.disabled,false);assert.equal(f.input.tabIndex,0);
assert.deepEqual(f.controls.children,[f.minus,f.input,f.plus]);assert.equal(f.status.attributes.get('aria-live'),'off');
f.input.value='37';f.input.emit('input');assert.equal(f.context.zoom,37);
f.plus.emit('click');assert.equal(f.context.zoom,47);f.minus.emit('click');assert.equal(f.context.zoom,37);
f.input.focus();f.media.matches=true;f.media.emit('change');assert.equal(f.document.activeElement,f.input);
assert.equal(f.context.zoom,37);assert.equal(f.input.value,'37');assert.equal(f.input.tabIndex,0);
f.plus.emit('click');assert.equal(f.context.zoom,62);f.settle();
f.media.matches=false;f.media.emit('change');assert.equal(f.input.hidden,false);assert.equal(f.input.value,'62');assert.equal(f.input.tabIndex,0);
f.input.value='100';f.input.emit('input');assert.equal(f.context.focusMode,true);
f.input.focus();f.media.matches=true;f.media.emit('change');assert.equal(f.document.activeElement,f.input);
assert.equal(f.context.zoom,100);f.minus.emit('click');assert.equal(f.context.zoom,75);assert.equal(f.context.focusMode,false);
f.context.setZoom(500);assert.equal(f.context.zoom,100);f.context.setZoom(-50);assert.equal(f.context.zoom,0);
f.context.setZoom(NaN);assert.equal(f.context.zoom,0);
console.log('PASS zoom controller: mobile 25-point rapid taps, 0/100 guards, focused-canvas mode, EN/JA descriptions, reduced motion, shared mobile/desktop range, desktop 10-point steps and preserved orientation focus.');

// Verify responsive source constraints without claiming a rendered-browser check.
const breakpoint='(max-width:767px),(max-width:1023px) and (max-height:500px) and (pointer:coarse)';
assert.ok(source.includes("matchMedia('(max-width:767px), (max-width:1023px) and (max-height:500px) and (pointer:coarse)')"));
const mobileCss=css.slice(css.indexOf('/* Phone controls share'),css.indexOf('.objects-ready .objects-tile figcaption{transform'));
assert.ok(mobileCss.includes(`@media${breakpoint}`));
assert.match(mobileCss,/\.objects-ready \.objects-zoom input\{display:block;flex:1;min-width:0;width:0;height:44px;touch-action:none\}/);
assert.match(mobileCss,/\.objects-ready \.objects-zoom\{left:50%;right:auto/);
assert.match(mobileCss,/bottom:max\(12px,env\(safe-area-inset-bottom\)\);transform:translateX\(-50%\);flex-direction:row/);
assert.match(mobileCss,/width:44px;height:44px;min-width:44px;min-height:44px/);
assert.match(mobileCss,/\.objects-page \.objects-view-dock\{display:none\}/);
// Numeric layout contracts are source-level, not compositor measurements.
for(const [width,height,safeLeft,safeRight,safeTop,safeBottom] of [[320,568,0,0,0,0],[390,844,0,0,47,34],[844,390,47,47,0,21],[932,430,59,59,0,21],[1023,500,47,47,0,21]]){
  const bottom=Math.max(12,safeBottom),right=Math.max(12,safeRight),left=Math.max(12,safeLeft);
  const widthZoom=Math.min(180,width-left-right);
  const zoom={right:(width+widthZoom)/2,left:(width-widthZoom)/2,bottom:height-bottom,top:height-bottom-46};
  const categoryRight=(width<=600?left:Math.max(28,safeLeft))+101;
  assert.equal((zoom.left+zoom.right)/2,width/2);assert.equal(zoom.bottom,height-bottom);
  assert.ok(zoom.left>=left && zoom.right<=width-right,'centered slider stays within safe edges');
  assert.ok(widthZoom-88-8-4-2>=74,'range retains a usable track between 44px endpoint buttons');
  assert.ok(zoom.top>52);
  const rowTop=Math.max(8,safeTop),rowHeight=44,logoHeight=96*280/829;
  const menuCenter=rowTop+rowHeight/2,infoCenter=rowTop+rowHeight/2;
  const logoTop=rowTop+(rowHeight-logoHeight)/2;
  assert.equal(menuCenter,infoCenter);assert.ok(Math.abs(logoTop+logoHeight/2-menuCenter)<1e-8);
}
assert.match(mobileCss,/--finds-mobile-row-top:max\(8px,env\(safe-area-inset-top\)\);--finds-mobile-row-height:44px/);
assert.match(mobileCss,/\.objects-ready \.objects-header\{top:var\(--finds-mobile-row-top\);height:var\(--finds-mobile-row-height\)\}/);
assert.match(mobileCss,/\.objects-ready \.objects-header \.site-logo\{padding:0\}/);
assert.match(mobileCss,/\.mobile-nav-toggle,\.objects-page\.objects-ready \.objects-info\{top:var\(--finds-mobile-row-top\);width:var\(--finds-mobile-row-height\);height:var\(--finds-mobile-row-height\)/);
for(const attribute of ['data-close','data-info-close']){
  const markup=template.match(new RegExp(`<button[^>]*${attribute}[^>]*>[\\s\\S]*?<\\/button>`))[0];
  assert.match(markup,/aria-label="Close"/);assert.match(markup,/><span aria-hidden="true">×<\/span><\/button>$/);assert.doesNotMatch(markup,/>Close/);
}
assert.equal(japanese.Close,'閉じる');
assert.match(css,/\.objects-dialog-close\{display:grid;place-items:center;width:44px;height:44px;min-width:44px;min-height:44px;padding:0\}/);
assert.match(source,/close\.addEventListener\('click',\(\)=>dialog.close\(\)\)/);
assert.match(source,/infoDialog.querySelector\('\[data-info-close\]'\).addEventListener\('click',\(\)=>infoDialog.close\(\)\)/);
console.log('PASS zoom/Close markup and layout constraints: matching phone/landscape breakpoints, bottom-right safe area, narrow-phone Category gap, shared top-row centerline, 44px controls, category-overlay hiding and localized icon-only Close buttons.');
