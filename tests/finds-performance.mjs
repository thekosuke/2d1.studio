import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
const drawSource=source.slice(source.indexOf('  function draw(){'),source.indexOf('  function createTile('));
const tiles=new Map();
let assigned=0;
const context={frame:0,list:false,active:[{id:'a'},{id:'b'}],cell:100,row:152,x:0,y:0,motion:null,focusMode:false,focusColumn:0,focusRow:0,
 shopPreview:false,canvas:{clientWidth:200,clientHeight:200,style:{setProperty(){}}},nearest:()=>({column:0,line:0}),tileKey:(c,r)=>`${c}:${r}`,indexAt:(c,r)=>Math.abs(c+r)%2,
 tiles,layer:{append(){}},createTile(item){
  const image={sizes:'',getAttribute(name){return this[name]||null},set src(value){assigned++;this._src=value},get src(){return this._src}};
  const tile={_item:{image:`${item.id}.webp`,imageSrcset:`${item.id}-192.webp 192w`},dataset:{},style:{removeProperty(){}},classList:{toggle(){}},querySelector:()=>image,remove(){}};
  return tile;
 }};
vm.createContext(context);vm.runInContext(drawSource+'\nthis.draw=draw;',context);
context.draw();
assert.equal(assigned,4,'only the four intersecting photos request a source');
assert.ok(tiles.size>4,'virtual overscan still exists for smooth dragging');
for(const [key,tile] of tiles){const [column,row]=key.split(':').map(Number);const visible=column>=0&&column<2&&row>=0&&row<2;assert.equal(Boolean(tile.querySelector().src),visible);if(visible)assert.equal(tile.querySelector().sizes,'80px','phone padding included; rounded up, never undersized');}
const center=tiles.get('0:0').querySelector();
assert.equal(center.fetchPriority,'high','the center photo receives the high-priority slot');
for(const [key,tile] of tiles)if(key!=='0:0'&&tile.querySelector().src)assert.equal(tile.querySelector().fetchPriority,'auto','edge photos do not all compete at high priority');
context.draw();assert.equal(assigned,4,'stationary draws do not reload sources');
context.x=-100;context.draw();assert.equal(assigned,6,'dragging into new cells loads their photos');
context.canvas.clientWidth=1280;context.cell=300;context.draw();
for(const tile of tiles.values())assert.equal(tile.querySelector().sizes,'256px','desktop zoom selects a sufficiently large candidate');
context.motion={target:{cell:500}};context.cell=320;context.draw();
for(const tile of tiles.values())assert.equal(tile.querySelector().sizes,'464px','zoom requests the final source immediately, without intermediate sizes');
console.log('PASS Finds delivery: offscreen photos deferred, drag loads entering cells, repeat draws reuse sources, phone/desktop sizes round upward.');

// A scaled Shop iframe must cover the fully zoomed image, not its 1600px layout.
context.shopPreview=true;context.canvas.clientWidth=1600;context.canvas.clientHeight=900;context.cell=144;context.row=196;context.motion=null;
context.geometry=(width,zoom,height)=>({cell:zoom===0?144:576});
context.window={frameElement:{clientWidth:1600,clientHeight:900,getBoundingClientRect:()=>({width:160,height:90})}};
context.draw();assert.equal(tiles.get('0:0').querySelector().sizes,'48px','small preview covers full zoom, with upward rounding');
context.window.frameElement.getBoundingClientRect=()=>({width:640,height:360});
context.draw();assert.equal(tiles.get('0:0').querySelector().sizes,'160px','a larger iframe refreshes its sharp source hint');
console.log('PASS Shop preview density: maximum zoom and host resize use actual display size.');
