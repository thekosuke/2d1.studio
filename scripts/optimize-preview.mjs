/* Package-only optimization. Source styles and scripts stay editable separately. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {transformSync} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','dist');
if(!fs.existsSync(path.join(root,'.2d1-preview-build')))throw new Error('Expected generated preview directory');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const bundles=new Map(),cssCache=new Map();
const inside=name=>{if(!name.startsWith(root+path.sep))throw new Error('Asset escapes package');return name};
function css(file,chain=[]){
 if(chain.includes(file))throw new Error('Circular CSS import');if(cssCache.has(file))return cssCache.get(file);
 let text=fs.readFileSync(file,'utf8');
 text=text.replace(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]\s*\)?\s*;/g,(_,url)=>{
  if(/^(?:https?:|data:|\/\/)/.test(url))throw new Error('Remote CSS import cannot be bundled');
  const source=inside(path.resolve(path.dirname(file),decodeURIComponent(url.split('?')[0])));return css(source,[...chain,file]);
 });
 // Resolve each source's URLs before joining it to the page bundle.
 text=text.replace(/url\(\s*(['"]?)([^)'"\n]+)\1\s*\)/g,(whole,quote,url)=>{
  url=url.trim();if(/^(?:[a-z]+:|\/|#)/i.test(url))return whole;
  const parsed=new URL(url,'https://package.local/'+path.relative(root,file).split(path.sep).join('/'));
  return 'url('+JSON.stringify(parsed.pathname+parsed.search+parsed.hash)+')';
 });
 cssCache.set(file,text);return text;
}
let linkCount=0;
for(const file of walk(root).filter(file=>file.endsWith('.html'))){
 let html=fs.readFileSync(file,'utf8');const tags=[...html.matchAll(/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/gi)];if(!tags.length)continue;
 const files=tags.map(([tag])=>{const href=tag.match(/\bhref=["']([^"']+)["']/i)?.[1];if(!href||/^(https?:|\/\/)/.test(href))throw new Error('Expected local stylesheet');if(/\bmedia=/.test(tag))throw new Error('Preserve media styles explicitly before bundling');return inside(path.resolve(href.startsWith('/')?root:path.dirname(file),decodeURIComponent(href.replace(/^\//,'').split('?')[0])))});
 const key=JSON.stringify(files);let address=bundles.get(key);
 if(!address){const joined=files.map(file=>css(file)).join('\n');const minified=transformSync(joined,{loader:'css',minify:true,legalComments:'none',charset:'utf8',target:['safari16','chrome110','firefox110']}).code;const hash=createHash('sha256').update(minified).digest('hex').slice(0,16);address='/css/bundles/site-'+hash+'.css';fs.mkdirSync(path.dirname(path.join(root,address)),{recursive:true});fs.writeFileSync(path.join(root,address),minified);bundles.set(key,address);}
 let first=true;html=html.replace(/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/gi,()=>{linkCount++;if(!first)return '';first=false;return '<link rel="stylesheet" href="'+address+'">'});fs.writeFileSync(file,html);
}
let before=0,after=0;
for(const file of walk(path.join(root,'js')).filter(file=>file.endsWith('.js'))){const source=fs.readFileSync(file,'utf8');const code=transformSync(source,{loader:'js',minify:true,legalComments:'none',charset:'utf8',target:['safari16','chrome110','firefox110']}).code;before+=Buffer.byteLength(source);after+=Buffer.byteLength(code);fs.writeFileSync(file,code);}
console.log(`Optimized package: ${bundles.size} page-style bundles replace ${linkCount} stylesheet links; JS ${(before/1024).toFixed(0)}→${(after/1024).toFixed(0)} KiB. Source files unchanged.`);
