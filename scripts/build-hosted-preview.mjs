/* Build static pages and their private Worker preview; never deploy from this helper. */
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
for(const script of ['build-objects.py','build-japanese.py','build-preview.py']){
 const result=spawnSync('python3',[resolve(root,'scripts',script)],{cwd:root,stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
const target=resolve(root,'tmp','hosted-build');
rmSync(target,{recursive:true,force:true});mkdirSync(resolve(target,'dist/server'),{recursive:true});mkdirSync(resolve(target,'.openai'),{recursive:true});
cpSync(resolve(root,'dist'),resolve(target,'dist/client'),{recursive:true});
cpSync(resolve(root,'drizzle'),resolve(target,'drizzle'),{recursive:true});
const hosting={project_id:'appgprj_6ac8448dc6f081919531a44b83b1c463',d1:'DB',r2:null};
writeFileSync(resolve(target,'.openai/hosting.json'),JSON.stringify(hosting,null,2)+'\n');
await build({entryPoints:[resolve(root,'server/purchased-worker.mjs')],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:resolve(target,'dist/server/index.js')});
console.log(`Private Worker package: ${target}`);
