import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/reading-ink.js',import.meta.url),'utf8');
const functionSource=source.slice(source.indexOf('  function readingWindow('),source.indexOf('  let inkQueued'));
const readingWindow=vm.runInNewContext(functionSource+'\nreadingWindow;');
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
   const end=viewport*.5;
   const result=readingWindow(top,viewport*.85,end,scroll,previousEnd,maxScroll);
   previousEnd=result.end;
   return result.progress;
  });
 };
 for(let scroll=0;scroll<=maxScroll;scroll+=3) {
  const values=sample(scroll);
  for(let i=1;i<values.length;i++) if(values[i]>0) assert.equal(values[i-1],1);
  blocks.forEach((block,i)=>{if(block.top-scroll<=viewport*.5) assert.equal(values[i],1,'entire block finishes by its leading edge reaching the viewport center');});
  const words=values.flatMap((progress,i)=>Array.from({length:blocks[i].words},(_,word)=>Math.max(0,Math.min(1,progress*blocks[i].words-word))));
  assert.ok(words.filter(amount=>amount>0 && amount<1).length<=1);
  assert.deepEqual(sample(scroll),values,'scroll reversal has no retained reveal state');
 }
 assert.ok(sample(maxScroll).every(progress=>progress===1),'last paragraph finishes at page end');
}
console.log('PASS reading ink: sequential paragraphs, a single partial word, reversible scroll, mid-screen completion, and complete page-end reveal.');
