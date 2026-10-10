import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/reading-ink.js',import.meta.url),'utf8');
const functionSource=source.slice(source.indexOf('  function readingWindow('),source.indexOf('  let inkQueued'));
const {readingWindow,readingEnd,introCursor}=vm.runInNewContext(functionSource+'\n({readingWindow,readingEnd,introCursor});');
// 3a9da38 used min(25vh, 70vh - block height); 6862f32 and 6bd7307
// both finished at 50vh. The new range is exactly halfway between them.
for(const viewport of [568,844,900,1080])for(const height of [40,220,520,1200]){
 const start=viewport*.85,fastEnd=viewport*.5,slowEnd=Math.min(viewport*.25,viewport*.7-height);
 const midpoint=readingEnd(viewport,height);
 assert.ok(Math.abs((start-midpoint)-((start-fastEnd)+(start-slowEnd))/2)<1e-9);
 assert.ok(midpoint<fastEnd&&midpoint>slowEnd);
 const top=1500,scroll=top-(fastEnd+midpoint)/2;
 const fast=readingWindow(top-scroll,start,fastEnd,scroll,-Infinity,10000);
 const medium=readingWindow(top-scroll,start,midpoint,scroll,-Infinity,10000);
 const slow=readingWindow(top-scroll,start,slowEnd,scroll,-Infinity,10000);
 assert.equal(fast.progress,1);assert.ok(medium.progress<fast.progress&&medium.progress>slow.progress);
}
assert.equal(readingEnd(1000,100),375);
assert.equal(readingEnd(1000,800),200);
console.log('PASS halfway pace: exact midpoint of historical scroll distances, short and tall paragraphs, phone and desktop viewports.');
// Adjacent paragraphs and short specification rows have overlapping natural
// reading ranges. Only one word across that sequence may be mid-reveal.
for(const viewport of [568,844,900,1080]) {
 const blocks=[{top:500,height:520,words:97},{top:1050,height:260,words:54},
  {top:1360,height:40,words:5},{top:1420,height:40,words:7},{top:1480,height:220,words:42}];
 const maxScroll=Math.max(1,1750-viewport);
 const sample=scroll=>{
  let previousEnd=-Infinity;
  return blocks.map(block=>{
   const top=block.top-scroll;
   const end=readingEnd(viewport,block.height);
   const result=readingWindow(top,viewport*.85,end,scroll,previousEnd,maxScroll);
   previousEnd=result.end;
   return result.progress;
  });
 };
 for(let scroll=0;scroll<=maxScroll;scroll+=3) {
  const values=sample(scroll);
  for(let i=1;i<values.length;i++) if(values[i]>0) assert.equal(values[i-1],1);
  blocks.forEach((block,i)=>{if(block.top-scroll<=readingEnd(viewport,block.height)) assert.equal(values[i],1,'entire block finishes at its halfway reading endpoint');});
  const words=values.flatMap((progress,i)=>Array.from({length:blocks[i].words},(_,word)=>Math.max(0,Math.min(1,progress*blocks[i].words-word))));
  assert.ok(words.filter(amount=>amount>0 && amount<1).length<=1);
  assert.deepEqual(sample(scroll),values,'scroll reversal has no retained reveal state');
 }
 assert.ok(sample(maxScroll).every(progress=>progress===1),'last paragraph finishes at page end');
}
console.log('PASS reading ink: sequential paragraphs, a single partial word, reversible scroll, halfway completion, and complete page-end reveal.');

for (const height of [568,844,900,1080]) {
 const count=90, opening=8,end=readingEnd(height,520);
 assert.equal(introCursor(0,height*.9,height,opening,count),0);
 assert.equal(introCursor(0,height*.7,height,opening,count),opening);
 let last=opening;
 for(let top=height*.7;top>=end;top-=1) {
  const scroll=height-top;
  const reading=readingWindow(top,height*.7,end,scroll,-Infinity,10000);
  const cursor=introCursor(reading.progress,top,height,opening,count);
  assert.ok(cursor>=last && cursor-last<2,'intro progresses without a whole-block jump');
  last=cursor;
 }
 const atOldFinish=readingWindow(height*.5,height*.7,end,height*.5,-Infinity,10000);
 assert.ok(atOldFinish.progress<1,'intro remainder now keeps revealing beyond its former 50vh finish');
 assert.equal(introCursor(1,0,height,opening,count),count);
}
console.log('PASS intro: first line at 70vh and continuous remaining-word progression.');

// Exercise the production opacity writer, including reflow and motion changes.
let blockTop=612.5,blockHeight=100,isIntro=false,coverBottom=0;
const written=Array(20).fill(null);
const words=written.map((_,index)=>({style:{setProperty(name,value){assert.equal(name,'--word-opacity');written[index]=Number(value);}},classList:{toggle(){}},getBoundingClientRect:()=>({top:blockTop+(index<5?0:40)})}));
const ink={block:{getBoundingClientRect:()=>({top:blockTop,height:blockHeight}),closest:()=>isIntro?{}:null},words};
const controller={inkBlocks:[ink],innerHeight:1000,scrollY:987.5,document:{documentElement:{scrollHeight:5000}},reduced:{matches:false},heroCover:{getBoundingClientRect:()=>({bottom:coverBottom})}};
vm.createContext(controller);
const paintSource=source.slice(source.indexOf('  let inkQueued'),source.indexOf('  const queueInk'));
vm.runInContext(functionSource+paintSource,controller);
controller.inkIn();assert.ok(written.slice(0,10).every(value=>value===1));assert.ok(written.slice(10).every(value=>value===.25));
controller.reduced.matches=true;controller.inkIn();assert.ok(written.every(value=>value===1));
controller.reduced.matches=false;controller.innerHeight=600;blockHeight=1200;
blockTop=(600*.85+readingEnd(600,1200))/2;controller.scrollY=1600-blockTop;controller.inkIn();
assert.ok(written.slice(0,10).every(value=>value===1));assert.ok(written.slice(10).every(value=>value===.25));
controller.innerHeight=1000;blockHeight=100;isIntro=true;coverBottom=blockTop=700;controller.scrollY=900;controller.inkIn();
assert.ok(written.slice(0,5).every(value=>value===1));assert.ok(written.slice(5).every(value=>value===.25));
coverBottom=0;blockTop=375;controller.scrollY=1225;controller.inkIn();assert.ok(written.every(value=>value===1));
console.log('PASS production opacity: midpoint progress, responsive tall-copy reflow, reduced-motion toggle, preserved intro opening and complete remainder.');
