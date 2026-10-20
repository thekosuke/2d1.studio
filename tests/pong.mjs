import assert from 'node:assert/strict';
import '../js/pong-physics.js';
const make=()=>{const g=new PixelPong(1000,600);g.delay=0;return g};
let g=make();g.x=g.pad+g.pw+g.r+1;g.y=g.player;g.vx=-500;g.vy=0;
assert.equal(g.step(1/120)[0].type,'paddle');assert.ok(g.vx>0);
g=make();g.y=6;g.vy=-300;assert.equal(g.step(1/120)[0].type,'wall');assert.ok(g.vy>0);
g=make();g.x=g.w+5;g.vx=500;assert.deepEqual(g.step(1/120),[{type:'score',side:0}]);assert.deepEqual(g.scores,[1,0]);
for(let i=0;i<50;i++)g.step(1/120);assert.deepEqual(g.scores,[1,0],'serve delay cannot repeat a point');
g=make();g.x=-5;g.vx=-500;assert.deepEqual(g.step(1/120),[{type:'score',side:1}]);
g=make();g.target=-9999;for(let i=0;i<200;i++)g.step(1/120);assert.equal(g.player,g.ph/2);
g=new PixelPong(1000,600,()=>.5);g.delay=0;g.x=500;g.y=15;g.vx=500;g.vy=0;
const previous=g.ai;
for(let i=0;i<20;i++)g.step(1/120);
assert.equal(g.ai,previous,'opponent waits to read an unexpected return');
for(let i=0;i<50;i++){
 const before=g.ai,velocity=g.aiVelocity;g.step(1/120);
 assert.ok(Math.abs(g.ai-before)<=g.base*.68/120+.001,'AI speed is bounded');
 assert.ok(Math.abs(g.aiVelocity-velocity)<=g.base*3.2/120+.001,'AI accelerates and brakes instead of snapping');
}
assert.ok(g.ai<previous,'opponent moves toward the return after reacting');
assert.equal(g.error,0,'a return keeps its aiming error between reads');
g=make();g.scores=[3,2];g.resize(390,624);g.serve(1);assert.deepEqual(g.scores,[3,2]);assert.ok(g.x>0&&g.x<390);assert.ok(Number.isFinite(g.vx));
for(const [w,h] of [[390,624],[1440,680],[844,224]]){
 g=new PixelPong(w,h);
 for(let i=0;i<120*90;i++){g.target=g.y;g.step(1/120);assert.ok(Number.isFinite(g.x+g.y+g.ai));assert.ok(g.ai>=g.ph/2&&g.ai<=g.h-g.ph/2)}
}
console.log('Pong: collisions, scoring, serve delay, bounds, AI speed and resize passed.');
