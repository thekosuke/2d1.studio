/* Website -> Notion. Email is sent by the owner's native Notion automation.
   Only the server receives NOTION_TOKEN; no contact payload is logged or stored
   in D1. The ledger contains UUIDs/hashes, a Notion page ID and lease metadata. */
export const CONTACT_DATA_SOURCE_ID = '3c50fdb8-1bc8-41ab-9245-d8a252f90881';
const NOTION_VERSION = '2025-09-03';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORIES = new Set(['New Business', 'Media Inquiry', 'Collaboration', 'Other']);
const EMAIL = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const limiter = new Map();
const MAX_BYTES = 16000;
const LEASE_MS = 60000;

export function contactConfigured(env) {
  return Boolean(env?.NOTION_TOKEN && env?.DB?.prepare && env?.DB?.batch && env.CONTACT_NOTION_EMAIL_READY === 'true');
}
function origins(request, env) {
  return new Set([new URL(request.url).origin, ...(env?.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean)]);
}
function response(request, env, status, body, extra = {}) {
  const origin = request.headers.get('Origin');
  return Response.json(body, {status, headers:{
    'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin',
    ...(origin && origins(request,env).has(origin) ? {'Access-Control-Allow-Origin':origin} : {}), ...extra,
  }});
}
async function bodyJSON(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new Error('TOO_LARGE');
  const reader=request.body?.getReader(); if(!reader)throw new Error('INVALID_JSON');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('TOO_LARGE');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.length;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
function clean(data, key, max, optional=false) {
  const value=data[key];
  if(optional && value==null)return '';
  if(typeof value!=='string')throw new Error('INVALID');
  const result=value.trim();
  if((!optional&&!result)||result.length>max||result.includes('\0'))throw new Error('INVALID');
  return result;
}
function validate(data, request, env) {
  if(!data || typeof data!=='object' || Array.isArray(data))throw new Error('INVALID');
  const allowed=new Set(['name','email','company','category','message','submissionId','language','sourceUrl','website']);
  if(Object.keys(data).some(key=>!allowed.has(key)) || data.website)throw new Error('INVALID');
  const result={name:clean(data,'name',120),email:clean(data,'email',254),company:clean(data,'company',120,true),category:clean(data,'category',40),message:clean(data,'message',2000),submissionId:clean(data,'submissionId',36),language:clean(data,'language',2),sourceUrl:clean(data,'sourceUrl',2048)};
  if(!EMAIL.test(result.email)||!UUID.test(result.submissionId)||!CATEGORIES.has(result.category)||!['en','ja'].includes(result.language))throw new Error('INVALID');
  const source=new URL(result.sourceUrl);
  if(!origins(request,env).has(source.origin)||!['http:','https:'].includes(source.protocol)||source.username||source.password)throw new Error('INVALID');
  // The path and locale are useful context; query strings and fragments may carry private information.
  result.sourceUrl=source.origin+source.pathname;
  return result;
}
async function fingerprint(data) {
  const {submissionId,...payload}=data;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload))))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function store(env) {
  const db=env.DB;
  const query=(sql,...args)=>db.prepare(sql).bind(...args);
  return {
    get:id=>query('SELECT * FROM contact_submissions WHERE submission_id = ?',id).first(),
    async claim(id,hash,lease,now){
      const statements=[query(`INSERT INTO contact_submissions (submission_id, payload_hash, lease_token, lease_until, created_at)
        VALUES (?, ?, ?, ?, ?) ON CONFLICT(submission_id) DO UPDATE SET lease_token = excluded.lease_token, lease_until = excluded.lease_until
        WHERE contact_submissions.notion_page_id IS NULL AND contact_submissions.payload_hash = excluded.payload_hash AND contact_submissions.lease_until < ?`,id,hash,lease,now+LEASE_MS,now,now),query('SELECT * FROM contact_submissions WHERE submission_id = ?',id)];
      const results=await db.batch(statements);if(results.some(r=>r.success===false))throw new Error('LEDGER');return results[1]?.results?.[0];
    },
    async save(id,lease,pageId){
      const result=await db.batch([query('UPDATE contact_submissions SET notion_page_id = ?, lease_token = NULL, lease_until = 0 WHERE submission_id = ? AND lease_token = ?',pageId,id,lease)]);
      if(result.some(r=>r.success===false))throw new Error('LEDGER');
    },
    async release(id,lease){await db.batch([query('UPDATE contact_submissions SET lease_token = NULL, lease_until = 0 WHERE submission_id = ? AND lease_token = ?',id,lease)]);},
  };
}
function throttle(request) {
  const now=Date.now();
  for(const [key,value]of limiter)if(value.until<=now)limiter.delete(key);
  const key=request.headers.get('CF-Connecting-IP')||'local';
  let bucket=limiter.get(key);
  if(!bucket){if(limiter.size>=2000)return false;bucket={count:0,until:now+600000};limiter.set(key,bucket);}
  if(bucket.count>=3)return false;bucket.count++;return true;
}
async function notion(env,path,data) {
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);
  try{
    const reply=await fetch('https://api.notion.com/v1/'+path,{method:'POST',headers:{Authorization:`Bearer ${env.NOTION_TOKEN}`,'Notion-Version':NOTION_VERSION,'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
    if(!reply.ok)throw new Error('NOTION');return await reply.json();
  }finally{clearTimeout(timer);}
}
const rich=value=>value?[{type:'text',text:{content:value}}]:[];
export function notionProperties(data, now=new Date().toISOString()) {
  return {
    'Full name':{title:rich(data.name)},Email:{email:data.email},Company:{rich_text:rich(data.company)},Category:{select:{name:data.category}},Message:{rich_text:rich(data.message)},
    Status:{status:{name:'New'}},'Submitted On':{date:{start:now}},'Email notification':{select:{name:'Pending'}},'Submission ID':{rich_text:rich(data.submissionId)},'Source URL':{url:data.sourceUrl},Language:{select:{name:data.language}},
  };
}
export async function handleContact(request, env) {
  const origin=request.headers.get('Origin');
  if(!origin || !origins(request,env).has(origin))return response(request,env,403,{error:'ORIGIN_NOT_ALLOWED'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'}});
  if(request.method!=='POST')return response(request,env,405,{error:'METHOD_NOT_ALLOWED'},{Allow:'POST, OPTIONS'});
  if(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')return response(request,env,415,{error:'JSON_REQUIRED'});
  let data;
  try{data=validate(await bodyJSON(request),request,env);}catch(error){return response(request,env,error.message==='TOO_LARGE'?413:422,{error:'INVALID_SUBMISSION'});}
  if(!contactConfigured(env))return response(request,env,503,{error:'CONTACT_NOT_CONFIGURED'});
  const ledger=store(env);const lease=crypto.randomUUID();const id=data.submissionId;
  let claimed=false;
  try{
    const hash=await fingerprint(data);const previous=await ledger.get(id);
    if(previous?.payload_hash!==undefined&&previous.payload_hash!==hash)return response(request,env,409,{error:'SUBMISSION_CHANGED'});
    if(previous?.notion_page_id)return response(request,env,200,{status:'received'});
    if(!throttle(request))return response(request,env,429,{error:'RATE_LIMITED'},{'Retry-After':'600'});
    const row=await ledger.claim(id,hash,lease,Date.now());
    if(row?.payload_hash!==hash)return response(request,env,409,{error:'SUBMISSION_CHANGED'});
    if(row?.notion_page_id)return response(request,env,200,{status:'received'});
    if(row?.lease_token!==lease)return response(request,env,409,{error:'SUBMISSION_IN_PROGRESS'},{'Retry-After':'60'});
    claimed=true;
    const source=env.NOTION_DATA_SOURCE_ID||CONTACT_DATA_SOURCE_ID;
    // Recover a write whose response was lost, without creating another page or email.
    const existing=await notion(env,`data_sources/${source}/query`,{filter:{property:'Submission ID',rich_text:{equals:id}},page_size:1});
    if(!Array.isArray(existing.results))throw new Error('NOTION');
    let page=existing.results[0];
    if(!page)page=await notion(env,'pages',{parent:{type:'data_source_id',data_source_id:source},properties:notionProperties(data)});
    if(!page?.id || !/^[0-9a-f-]{32,36}$/i.test(page.id))throw new Error('NOTION');
    await ledger.save(id,lease,page.id);claimed=false;
    // This confirms storage only. Native Notion automation sends the email asynchronously.
    return response(request,env,200,{status:'received'});
  }catch{
    return response(request,env,502,{error:'CONTACT_DELIVERY_UNCONFIRMED'});
  }finally{
    if(claimed)try{await ledger.release(id,lease);}catch{/* Do not log submissions or credentials. */}
  }
}
export default {fetch:handleContact};
