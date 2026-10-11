import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const controller=source.slice(source.indexOf('  const infoSeenKey='),source.indexOf('  let measuredWidth='));
const boot=source.slice(source.indexOf('  let infoSeen=false;'),source.lastIndexOf('})();'));
const css=readFileSync(new URL('../css/objects.css',import.meta.url),'utf8');

function fixture({seen=false,blocked=false}={}){
  const document={addEventListener(){},activeElement:null};let stored=seen?'1':null;const pending=[];
  class Element {
    handlers=new Map();scrollTop=0;
    addEventListener(name,fn){if(!this.handlers.has(name))this.handlers.set(name,[]);this.handlers.get(name).push(fn)}
    emit(name,event={}){for(const fn of this.handlers.get(name)||[])fn({target:this,...event})}
    focus(){document.activeElement=this}
  }
  const infoButton=new Element(),infoClose=new Element(),infoDialog=new Element(),dialog=new Element();
  for(const modal of [infoDialog,dialog]){
    modal.open=false;modal.show=modal.showModal=()=>{modal.open=true};
    modal.close=()=>{if(modal.open){modal.open=false;pending.push(()=>modal.emit('close'))}};
  }
  infoDialog.querySelector=()=>infoClose;
  infoDialog.getBoundingClientRect=()=>({left:12,top:12,right:378,bottom:600});
  infoButton.lastElementChild={};infoButton.setAttribute=()=>{};infoButton.getBoundingClientRect=()=>({bottom:44});infoDialog.style={setProperty(){}};
  const context={reduced:{matches:true},ResizeObserver:class{observe(){}},document,infoButton,infoDialog,dialog,cancelGesture(){},stopMotion(){},settleGeometry(){},localStorage:{getItem(){if(blocked)throw Error();return stored},setItem(key,value){if(blocked)throw Error();stored=value}}};
  vm.createContext(context);vm.runInContext(controller+boot,context);
  return {document,infoButton,infoClose,infoDialog,dialog,stored:()=>stored,flush(){pending.splice(0).forEach(fn=>fn())},dismiss(){infoButton.emit('click');this.flush()},open(){infoButton.emit('click')}};
}
for(const blocked of [false,true]){
  const f=fixture({blocked});assert.equal(f.infoDialog.open,true);
  f.infoDialog.scrollTop=300;f.dismiss();assert.equal(f.document.activeElement,f.infoButton);if(!blocked)assert.equal(f.stored(),'1');
  for(let repeat=0;repeat<4;repeat++){f.open();assert.equal(f.infoDialog.scrollTop,0);f.infoDialog.scrollTop=200;f.dismiss()}
}
const f=fixture({seen:true});assert.equal(f.infoDialog.open,false);
f.dialog.showModal();f.open();assert.equal(f.infoDialog.open,false,'Info never interrupts a product sheet');
f.dialog.close();f.flush();f.open();f.infoButton.emit('click');f.open();f.flush();
assert.equal(f.infoDialog.open,true);

for(const [path,locale] of [['../objects/index.html','en'],['../ja/objects/index.html','ja']]){
  const html=readFileSync(new URL(path,import.meta.url),'utf8');
  assert.equal((html.match(/class="objects-language"/g)||[]).length,1);
  assert.match(html,/<footer class="objects-footer">[\s\S]*<nav class="objects-language"/);
  assert.doesNotMatch(html,/objects-info-language/);
  const info=html.match(/<dialog[^>]*id="objects-info-dialog"[\s\S]*?<\/dialog>/)[0];assert.doesNotMatch(info,/hreflang/);
  const nav=html.match(/<nav class="objects-language"[^>]*>([\s\S]*?)<\/nav>/)[1];
  const links=[...nav.matchAll(/<a ([^>]+)>(EN|JA)<\/a>/g)];assert.equal(links.length,2);
  for(const [,attrs,label] of links){
    const href=attrs.match(/href="([^"]+)"/)[1],base=`https://preview.test/${locale==='ja'?'ja/':''}objects/`;
    assert.equal(new URL(href,base).pathname,label==='EN'?'/objects/':'/ja/objects/');
    assert.equal(attrs.includes('aria-current="page"'),label.toLowerCase()===locale);
  }
}
assert.doesNotMatch(css,/objects-info-language/);
assert.match(css,/max-height:calc\(100dvh - max\(var\(--dialog-margin\),env\(safe-area-inset-top\)\) - max\(var\(--dialog-margin\),env\(safe-area-inset-bottom\)\)\)/);
console.log('PASS Info and language fallback: first visit/manual reopen, scroll reset, blocked storage, product-modal guard, stale-close recovery, no language links in Info and one original bilingual no-JS footer nav.');
