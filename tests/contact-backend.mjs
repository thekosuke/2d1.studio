import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../server/purchased-worker.mjs';
import {CONTACT_DATA_SOURCE_ID} from '../server/contact-worker.mjs';
const sqlite=new DatabaseSync(':memory:');
for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
const DB={prepare(sql){assert.ok(!sql.includes(';'));const query=sqlite.prepare(sql);return{bind(...args){return{first:async()=>query.get(...args),execute:()=>sql.trim().startsWith('SELECT')?{success:true,results:query.all(...args)}:{success:true,results:[],meta:query.run(...args)}}}}},async batch(queries){sqlite.exec('BEGIN');try{const result=queries.map(q=>q.execute());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
const env={DB,NOTION_TOKEN:'mock-server-only-token',CONTACT_NOTION_EMAIL_READY:'true',ASSETS:{fetch:async()=>new Response('static')}};
const origin='https://preview.example';let ip=0;const pages=new Map();let creates=0,queries=0,mode='ok';let payload,gateRelease,gate;
const original=globalThis.fetch;
globalThis.fetch=async(address,options)=>{
 assert.ok(address.startsWith('https://api.notion.com/v1/'));assert.equal(options.headers.Authorization,'Bearer mock-server-only-token');assert.equal(options.headers['Notion-Version'],'2025-09-03');
 const data=JSON.parse(options.body);
 if(mode==='reject')return Response.json({secret:'must never be exposed'}, {status:403});
 if(address.endsWith('/query')){
  queries++;assert.ok(address.includes(CONTACT_DATA_SOURCE_ID));const found=pages.get(data.filter.rich_text.equals);
  if(mode==='invalid-query')return Response.json({wrong:true});
  return Response.json({results:found?[found]:[]});
 }
 assert.ok(address.endsWith('/pages'));creates++;payload=data;assert.equal(data.parent.data_source_id,CONTACT_DATA_SOURCE_ID);
 const page={id:crypto.randomUUID()};pages.set(data.properties['Submission ID'].rich_text[0].text.content,page);
 if(mode==='gate'){await gate;}
 if(mode==='lost-response')throw new Error('network response lost after saved');
 return Response.json(page);
};
const valid=(extra={})=>({name:'Integration test',email:'sender@example.com',company:'Example',category:'Collaboration',message:'Hello, this is a test.',submissionId:crypto.randomUUID(),language:'en',sourceUrl:origin+'/contact/?private=query#fragment',...extra});
const request=(data,options={})=>new Request(origin+'/api/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':String(++ip),...options.headers},body:JSON.stringify(data)});
const post=(data,configuration=env)=>worker.fetch(request(data),configuration);
try{
 let r=await worker.fetch(new Request(origin+'/api/contact/config'),{});assert.deepEqual(await r.json(),{status:'not-configured'});
 r=await worker.fetch(new Request(origin+'/api/contact/config'),env);assert.deepEqual(await r.json(),{status:'ready'});
 let data=valid();r=await post(data);assert.equal(r.status,200);assert.deepEqual(await r.json(),{status:'received'});assert.equal(creates,1);
 assert.equal(payload.properties.Category.select.name,'Collaboration');assert.equal(payload.properties['Email notification'].select.name,'Pending');assert.equal(payload.properties.Status.status.name,'New');assert.equal(payload.properties['Source URL'].url,origin+'/contact/');assert.equal(payload.properties.Message.rich_text[0].text.content,data.message);
 const count=creates;r=await post(data);assert.equal(r.status,200);assert.equal(creates,count,'successful retries never call Notion again');
 assert.equal((await post({...data,message:'changed'})).status,409,'same ID cannot be used for a different payload');
 for(const category of ['New Business','Media Inquiry','Other']){r=await post(valid({category,company:'',language:'ja',message:'日本語の問い合わせです。'}));assert.equal(r.status,200);assert.equal(payload.properties.Company.rich_text.length,0);assert.equal(payload.properties.Language.select.name,'ja');}
 for(const change of [{email:'bad'},{category:'unsupported'},{submissionId:'bad'},{message:'x'.repeat(2001)},{name:' '},{website:'bot'},{sourceUrl:'https://evil.example/'},{language:'xx'},{extra:'unexpected'},{email:['sender@example.com']}])assert.equal((await post(valid(change))).status,422,JSON.stringify(change));
 r=await worker.fetch(request(valid(),{headers:{Origin:'https://evil.example'}}),env);assert.equal(r.status,403);
 r=await worker.fetch(request(valid(),{headers:{Origin:''}}),env);assert.equal(r.status,403);
 r=await worker.fetch(request(valid(),{headers:{'Content-Type':'text/plain'}}),env);assert.equal(r.status,415);
 r=await worker.fetch(new Request(origin+'/api/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{'}),env);assert.equal(r.status,422);
 r=await worker.fetch(new Request(origin+'/api/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:' '.repeat(16001)}),env);assert.equal(r.status,413);
 r=await worker.fetch(new Request(origin+'/api/contact',{method:'OPTIONS',headers:{Origin:origin}}),env);assert.equal(r.status,204);
 r=await worker.fetch(new Request(origin+'/api/contact',{headers:{Origin:origin}}),env);assert.equal(r.status,405);
 const before=creates;for(const configuration of [{}, {...env,NOTION_TOKEN:''},{...env,CONTACT_NOTION_EMAIL_READY:'false'}]){r=await post(valid(),configuration);assert.equal(r.status,503);assert.equal((await r.json()).error,'CONTACT_NOT_CONFIGURED');}assert.equal(creates,before);
 mode='reject';r=await post(valid());assert.equal(r.status,502);assert.ok(!(await r.text()).includes('secret'));
 mode='invalid-query';r=await post(valid());assert.equal(r.status,502);
 // Notion saved the first write, but its response was lost. Retry recovers the row.
 mode='lost-response';data=valid();r=await post(data);assert.equal(r.status,502);const savedCount=creates;mode='ok';r=await post(data);assert.equal(r.status,200);assert.equal(creates,savedCount);
 // Two in-flight identical requests have one provider write.
 mode='gate';gate=new Promise(resolve=>gateRelease=resolve);data=valid();const first=post(data);
 while(!pages.has(data.submissionId))await new Promise(resolve=>setTimeout(resolve,0));
 r=await post(data);assert.equal(r.status,409);assert.equal((await r.json()).error,'SUBMISSION_IN_PROGRESS');gateRelease();assert.equal((await first).status,200);mode='ok';
 // The rate limit includes unsuccessful delivery attempts, rather than just successes.
 for(let i=0;i<3;i++){const req=request(valid(),{headers:{'CF-Connecting-IP':'limited'}});assert.equal((await worker.fetch(req,env)).status,200);}
 assert.equal((await worker.fetch(request(valid(),{headers:{'CF-Connecting-IP':'limited'}}),env)).status,429);
 assert.deepEqual(sqlite.prepare('PRAGMA table_info(contact_submissions)').all().map(c=>c.name),['submission_id','payload_hash','lease_token','lease_until','notion_page_id','created_at']);
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM purchased_marks').get().n,0);
 console.log('PASS contact backend: real SQLite migration/leases; all form fields/categories; origin/JSON/size validation; configuration gate; retry/conflict/concurrency/recovery; Notion failures; throttling; no payload persistence or email-delivery claims.');
}finally{globalThis.fetch=original;sqlite.close();}
