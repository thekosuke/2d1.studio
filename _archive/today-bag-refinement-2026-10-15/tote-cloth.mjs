import assert from 'node:assert/strict';
import { stepCloth, flexVertex, flexNormal } from '../js/tote-cloth.js';
const fresh=()=>({bend:0,bendVelocity:0,swing:0,swingVelocity:0});
for(const fps of [20,30,60,120]) {
  const s=fresh();
  for(let i=0;i<fps*4;i++) {
    stepCloth(s,Math.floor(i/fps*4)%2?12:-12,1/fps);
    assert(Object.values(s).every(Number.isFinite));
    assert(Math.abs(s.bend)<6 && Math.abs(s.swing)<9,'bounded fabric under rapid reversals');
  }
  for(let i=0;i<fps*6;i++) stepCloth(s,0,1/fps);
  assert(Object.values(s).every(v=>Math.abs(v)<.001),'fabric comes to rest');
  stepCloth(s,12,1/fps,true);
  assert.deepEqual(s,fresh(),'reduced motion stops every spring');
}
const rim=flexVertex(14,36,5,4,[]);
assert.deepEqual(rim,[14,36,5],'rim stays sewn to handles');
assert.notEqual(flexVertex(14,2,5,4,[])[0],14,'lower body flexes');
// Transformed normals must remain perpendicular to both transformed tangents.
for(const bend of [-4,0,4]) {
  const p=[9,14,5], eps=.0001;
  const origin=flexVertex(...p,bend,[]), normal=flexNormal(...p,0,0,1,bend,[]);
  for(const axis of [0,1]) {
    const q=p.slice();q[axis]+=eps;
    const end=flexVertex(...q,bend,[]);
    const dot=end.reduce((sum,v,i)=>sum+(v-origin[i])/eps*normal[i],0);
    assert(Math.abs(dot)<.0001,'smooth normals follow deformed fabric');
  }
}
console.log('PASS: bounded fabric motion, settling, reduced motion, sewn rim, deformation normals');
