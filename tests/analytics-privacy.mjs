import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../js/analytics.js',import.meta.url),'utf8');
function browser({host='2d1.studio',stored,dnt=false,gpc=false,blocked=false,policy}={}){
 const tags=[],data=new Map(stored?[['2d1:analytics-consent',stored]]:[]),events=new Map();let cookies='_ga=old; functional=keep';
 const doc={documentElement:{dataset:policy?{analyticsPolicy:policy}:{}},head:{append:tag=>tags.push(tag)},createElement:()=>({dataset:{}}),querySelectorAll:()=>[]};
 Object.defineProperty(doc,'cookie',{get:()=>cookies,set:value=>{if(value.startsWith('_ga=;'))cookies='functional=keep'}});
 const window={addEventListener:(key,cb)=>events.set(key,cb)};const context={window,document:doc,navigator:{doNotTrack:dnt?'1':'0',globalPrivacyControl:gpc},location:{hostname:host,origin:'https://'+host,pathname:'/privacy/',search:'?email=private@example.com',hash:'#private'},URL,Date,localStorage:{getItem:key=>{if(blocked)throw Error();return data.get(key)||null},setItem:(key,value)=>{if(blocked)throw Error();data.set(key,value)}},addEventListener:window.addEventListener};
 vm.runInNewContext(source,context);return {window,tags,data,events,cookies:()=>cookies};
}
const initial=browser();assert.equal(initial.tags.length,0);assert.equal(initial.window.SiteAnalytics.isAllowed(),false);initial.window.SiteAnalytics.setAllowed(true);assert.equal(initial.tags.length,1);assert.equal(initial.data.get('2d1:analytics-consent'),'granted');const events=initial.window.dataLayer.map(e=>Array.from(e));const config=events.find(e=>e[0]==='config')[2];assert.equal(config.page_location,'https://2d1.studio/privacy/');assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.ok(!JSON.stringify(events).includes('private@example.com'));initial.window.SiteAnalytics.setAllowed(false);assert.equal(initial.window['ga-disable-G-EJES69N4D2'],true);assert.equal(initial.cookies(),'functional=keep');
for(const signal of ['dnt','gpc']){const b=browser({stored:'granted',[signal]:true});b.window.SiteAnalytics.setAllowed(true);assert.equal(b.tags.length,0);assert.equal(b.window.SiteAnalytics.isAllowed(),false);}
for(const host of ['localhost','127.0.0.1','two-d-one-design-preview.kosuke-2d1.chatgpt.site']){const b=browser({host,stored:'granted'});assert.equal(b.tags.length,0);}
const blocked=browser({blocked:true});assert.equal(blocked.tags.length,0);blocked.window.SiteAnalytics.setAllowed(true);assert.equal(blocked.tags.length,1);
const revoked=browser({stored:'granted'});revoked.data.set('2d1:analytics-consent','denied');revoked.events.get('storage')({key:'2d1:analytics-consent'});assert.equal(revoked.window['ga-disable-G-EJES69N4D2'],true);
console.log('PASS analytics privacy: default off, explicit opt-in, revocation, browser privacy signals, local/private isolation, blocked storage, cross-tab changes and sanitized page context. No real requests sent.');

for (const policy of ['consent', 'off', 'invalid']) {
 const b=browser({policy}); assert.equal(b.tags.length,0);
 if(policy!=='consent'){b.window.SiteAnalytics.setAllowed(true);assert.equal(b.tags.length,0);}
}
const automatic=browser({policy:'auto'});assert.equal(automatic.tags.length,1);assert.equal(automatic.data.has('2d1:analytics-consent'),false,'Automatic policy is not a fabricated user choice');
automatic.window.SiteAnalytics.setAllowed(false);assert.equal(automatic.window.SiteAnalytics.isAllowed(),false);assert.equal(automatic.window['ga-disable-G-EJES69N4D2'],true);
assert.equal(browser({policy:'auto',stored:'denied'}).tags.length,0);
assert.equal(browser({policy:'auto',gpc:true}).tags.length,0);
assert.equal(browser({policy:'auto',dnt:true}).tags.length,0);
assert.equal(browser({policy:'off',stored:'granted'}).tags.length,0);
assert.equal(browser({policy:'consent',stored:'granted'}).tags.length,1);
console.log('PASS regional analytics: automatic policy, explicit refusal, required consent, unknown policy off, privacy opt-outs.');
