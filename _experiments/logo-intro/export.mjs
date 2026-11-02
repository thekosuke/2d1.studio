import {readFile,writeFile,mkdir,mkdtemp,rm,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {duration,schedule,validateTiming,sourceAssets,renderSVG,getFormat} from './animation.mjs';
const here=fileURLToPath(new URL('.',import.meta.url)), root=resolve(here,'../..');
const args=process.argv.slice(2);
const formatOption=args.find(arg=>arg.startsWith('--format='));
const formatName=formatOption?.split('=')[1] || 'square';
const canvas=getFormat(formatName);
const timingFile=args.find(arg=>!arg.startsWith('--'));
const timing=validateTiming(JSON.parse(await readFile(timingFile || join(here,'timing.json'),'utf8')));
const filename=formatName==='square'?'2d1-intro-1080.mp4':'2d1-intro-reels-1080x1920.mp4';
const suffix=formatName==='square'?'':'-reels';
const assets=sourceAssets(await readFile(join(root,'img/brand/logo_red.svg'),'utf8'),await readFile(join(root,'css/walla.css'),'utf8'),await readFile(join(root,'img/brand/logo_beige.svg'),'utf8'),await readFile(join(root,'img/brand/eyes-on-red.svg'),'utf8'),await readFile(join(here,'caption.svg'),'utf8'));
const fps=60, count=Math.ceil(duration(timing)/1000*fps);
const temp=await mkdtemp(join(tmpdir(),'2d1-logo-'));
const out=join(here,'exports');await mkdir(out,{recursive:true});
const run=(command,args)=>{const r=spawnSync(command,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(`${command} failed (${r.status})`);};
try{
  // Sample the same pure renderer at exact frame timestamps. No screen recording.
  for(let first=0;first<count;first+=8){
    await Promise.all(Array.from({length:Math.min(8,count-first)},async(_,n)=>{
      const i=first+n;
      await sharp(Buffer.from(renderSVG(i*1000/fps,timing,assets,canvas))).png().toFile(join(temp,`${String(i).padStart(5,'0')}.png`));
    }));
  }
  console.log(`Rendered ${count} exact frames.`);
  const destination=join(temp,filename);
  if(process.platform==='darwin'){
    run('swiftc',['-suppress-warnings','-module-cache-path',join(temp,'module-cache'),join(here,'encode.swift'),'-o',join(temp,'encode')]);
    run(join(temp,'encode'),[temp,destination,String(count),String(fps),String(canvas.width),String(canvas.height)]);
  }else{
    run('ffmpeg',['-y','-framerate',String(fps),'-i',join(temp,'%05d.png'),'-c:v','libx264','-crf','16','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart','-an',destination]);
  }
  await rename(destination,join(out,filename));
  const logoTime=schedule(timing).endHold;
  await sharp(Buffer.from(renderSVG(logoTime,timing,assets,canvas))).png().toFile(join(out,`poster${suffix}.png`));
  await writeFile(join(out,`export-settings${suffix}.json`),JSON.stringify({...canvas,format:formatName,fps,frames:count,durationSeconds:count/fps,timing,logoAssets:['img/brand/logo_red.svg','img/brand/logo_beige.svg'],eyesAsset:'img/brand/eyes-on-red.svg',captionAsset:'_experiments/logo-intro/caption.svg',phaseStarts:schedule(timing,canvas),wipe:`${timing.wipe}ms cubic-bezier(.7,0,.2,1), upward`,returnWipe:`${timing.returnWipe}ms cubic-bezier(.7,0,.2,1), downward`,loop:true,audio:false},null,2)+'\n');
  console.log(`Saved ${join(out,filename)}`);
}finally{await rm(temp,{recursive:true,force:true});}
