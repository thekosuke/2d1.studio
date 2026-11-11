import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
// Execute the current close lifecycle, rather than the retired sliding-deck API.
for(const reduce of [true,false])for(const fromHero of [true,false]){
 const animations=[];let focused=0,canceled=0;
 const element=()=>({animate(frames,options){const a={frames,options,cancel(){},finished:Promise.resolve()};animations.push(a);return a;},getBoundingClientRect(){return {left:0,top:0,width:200,height:200}}});
 const handlers={};const dialog={...element(),open:true,addEventListener(n,fn){handlers[n]=fn},close(){this.open=false;handlers.close?.()}};
 const context={dialog,productClosing:false,productMotion:[],productOrigin:{left:10,top:10,width:50,height:50},reduced:{matches:reduce},detailSheet:{scrollTop:fromHero?0:900},heroImage:element(),productHero:element(),heroCaption:element(),productSteps:[element(),element()],close:element(),page:{querySelector:()=>element()},getComputedStyle:()=>({backgroundColor:'beige'}),canvas:{focus(){focused++}},returnFocus:{isConnected:true,tabIndex:0,focus(){focused++}},purchaseGeneration:0,cancelDetailPhotos(){canceled++}};
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('  function clearProductMotion()'),source.indexOf('  function animateProductIn('))+source.slice(source.indexOf('  function closeProduct()'),source.indexOf('  function show('))+source.slice(source.indexOf("  dialog.addEventListener('close',"),source.indexOf('  if(searchInput)searchInput.disabled=false;')),context);
 context.closeProduct();await Promise.resolve();await Promise.resolve();
 assert.equal(dialog.open,false);assert.equal(focused,1);assert.equal(canceled,1);assert.equal(context.returnFocus,null);assert.equal(context.productMotion.length,0);
 if(reduce)assert.equal(animations.length,0,'reduced motion never starts an exit animation');
 else assert.ok(animations.length>0);
 // A delayed old close event must not disrupt a reopened dialog.
 dialog.open=true;handlers.close();assert.equal(focused,1);
}
console.log('PASS current dialog close: reduced/animated exits, hero/details positions, cleanup, focus return and stale-close guard.');
