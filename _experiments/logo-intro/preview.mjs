import {labels,duration,validateTiming,sourceAssets,renderSVG,stateAt} from './animation.mjs?v=center-caption-1';
const $ = id => document.getElementById(id);
let timing, assets, frame = 0, playing = false, time = 0, started = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function paint(ms) {
  time = Math.max(0,Math.min(duration(timing),ms));
  $('stage').innerHTML = renderSVG(time,timing,assets);
  $('scrub').max = duration(timing); $('scrub').value = time;
  $('time').textContent = `${(time/1000).toFixed(2)} / ${(duration(timing)/1000).toFixed(2)} s`;
  $('phase').textContent = (stateAt(time,timing).phase === 'construction' ? '2D1 · simultaneous construction' : labels[stateAt(time,timing).phase]);
}
function stop(){cancelAnimationFrame(frame);playing=false;$('pause').textContent='Play';}
function tick(now){paint((now-started)%duration(timing));frame=requestAnimationFrame(tick);}
function play(){stop();playing=true;$('pause').textContent='Pause';started=performance.now()-time;frame=requestAnimationFrame(tick);}
try {
  const responses = await Promise.all(['timing.json','../../img/brand/logo_red.svg','../../css/walla.css','../../img/brand/logo_beige.svg','../../img/brand/eyes-on-red.svg','caption.svg'].map(url=>fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Unable to load ${url}`);return r.text();})));
  timing=validateTiming(JSON.parse(responses[0]));assets=sourceAssets(responses[1],responses[2],responses[3],responses[4],responses[5]);
  for(const [key,label] of Object.entries(labels)){
    const row=document.createElement('label');row.textContent=label;
    const input=document.createElement('input');input.type='number';input.min=0;input.max=10000;input.step=10;input.value=timing[key];input.name=key;
    input.addEventListener('input',()=>{stop();const next={...timing,[key]:Number(input.value)};try{validateTiming(next);timing=next;paint(0);$('status').textContent='Timing updated. Replay to review; export again to update the MP4.';}catch(error){input.value=timing[key];$('status').textContent=error.message;}});
    row.append(input);$('timings').append(row);
  }
  $('replay').onclick=()=>{paint(0);play();};
  $('pause').onclick=()=>{if(playing)stop();else{if(time===duration(timing))paint(0);play();}};
  $('scrub').oninput=()=>{stop();paint(Number($('scrub').value));};
  $('save').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(timing,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='timing.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  reduced.addEventListener('change',()=>{if(reduced.matches){stop();paint(0);}});
  paint(0);$('status').textContent=reduced.matches?'Autoplay off for reduced motion. Replay explicitly starts the review.':'Original SVG geometry. Controls stay outside the export.';
  if(!reduced.matches)play();
} catch(error){$('status').textContent=error.message;}
