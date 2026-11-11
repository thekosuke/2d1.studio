import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import './objects-controls.mjs';
import './objects-canvas-pinch.mjs';
import './objects-dialog-focus.mjs';
import './objects-mobile-sheet.mjs';
import './objects-language.mjs';
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const products=JSON.parse(readFileSync(new URL('../data/objects.json',import.meta.url),'utf8'));
const arithmetic=source.slice(source.indexOf('const mod ='),source.indexOf('  // Generate once per document'));
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
assert.equal((source.match(/const visitOrders=createVisitOrders\(/g)||[]).length,1);
console.log('PASS visit shuffle: varied loads, real cardinal/diagonal wrap neighbors, collaboration brands, dominant brands, small/empty sets, identity preservation and full reachability.');
