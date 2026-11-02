import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';

const bundle = await build({entryPoints: ['server/coming-soon.mjs'], bundle: true,
  write: false, platform: 'node', target: 'node20', format: 'esm', plugins:[{name:'analytics-text',setup(b){b.onLoad({filter:/js\/analytics\.js$/},async(args)=>({contents:await readFile(args.path,'utf8'),loader:'text'}));}}], loader: {'.html': 'text', '.svg': 'text', '.png': 'binary', '.ico': 'binary'}});
const {default: worker} = await import('data:text/javascript;base64,' +
  Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const request = (url, init) => worker.fetch(new Request(url, init));
for (const host of ['newfiction.org', 'www.newfiction.org']) {
  for (const protocol of ['http', 'https']) {
    for (const path of ['/', '/old-page?source=test']) {
      const response = await request(`${protocol}://${host}${path}`);
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('location'), 'https://2d1.studio/');
    }
  }
}
const home = await request('https://2d1.studio/');
assert.equal(home.status, 200);
assert.equal(home.headers.get('x-robots-tag'), 'index, follow, max-image-preview:large');
const html = await home.text();
assert.equal(html, await readFile('_launch/coming-soon/index.html', 'utf8'), 'Local and hosted pages must be identical.');
const originalPaths = (await readFile('img/brand/eyes.svg', 'utf8')).match(/<path[^>]+\/>/g);
for (const path of originalPaths) assert.ok(html.includes(path), 'Preserve original eye geometry.');
assert.ok(html.includes('prefers-reduced-motion: reduce'));
for (const text of ['<svg', '#FF2B00', '#FAF0E6']) assert.ok(html.includes(text));
for (const text of ['<!-- EYES -->']) assert.ok(!html.includes(text));
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const hash = createHash('sha256').update(script).digest('base64');
assert.ok(home.headers.get('content-security-policy').includes(`script-src 'sha256-${hash}'`), 'CSP must allow the original cursor script.');
// The full website and submission backend must never be exposed by this deploy.
for (const path of ['/about/', '/ja/', '/api/contact', '/img/brand/logo_red.svg']) {
  const response = await request('https://2d1.studio' + path);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(await response.text(), /Coming soon/);
}
for (const url of ['https://www.2d1.studio/', 'http://2d1.studio/']) {
  assert.equal((await request(url)).headers.get('location'), 'https://2d1.studio/');
}
assert.equal((await request('https://2d1.studio/', {method:'POST'})).status, 405);
assert.equal(await (await request('https://2d1.studio/', {method:'HEAD'})).text(), '');
assert.match(await (await request('https://2d1.studio/robots.txt')).text(), /Sitemap: https:\/\/2d1.studio\/sitemap.xml/);
const sitemap = await (await request('https://2d1.studio/sitemap.xml')).text();
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), ['https://2d1.studio/']);
console.log('Holding-page routing, artwork, private-site isolation and redirects pass.');

const og = await request('https://2d1.studio/og-image.png');
assert.equal(og.status, 200);
assert.equal(og.headers.get('content-type'), 'image/png');
assert.deepEqual(Buffer.from(await og.arrayBuffer()), await readFile('img/brand/2d1-social.png'));
assert.ok(html.includes('https://2d1.studio/og-image.png'));
assert.equal((await request('https://2d1.studio/og-image.png', {method: 'HEAD'})).status, 200);

const {analyticsPolicy}=await import('../server/analytics-region.mjs');
for(const country of ['DE','FR','IE','NO','IS','LI','GB']) assert.equal(analyticsPolicy(country),'consent');
for(const country of ['JP','US']) assert.equal(analyticsPolicy(country),'auto');
for(const country of ['CA','CH','BR','XX','T1',undefined]) assert.equal(analyticsPolicy(country),'off');
for(const country of ['JP','US','DE','GB','CH',undefined]){
 const req=new Request('https://2d1.studio/');Object.defineProperty(req,'cf',{value:{country}});
 const response=await worker.fetch(req);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.ok((await response.text()).includes('data-analytics-policy="'+analyticsPolicy(country)+'"'));
}
const spoofed=await request('https://2d1.studio/?country=JP',{headers:{'CF-IPCountry':'JP'}});
assert.ok((await spoofed.text()).includes('data-analytics-policy="off"'));
const scriptResponse=await request('https://2d1.studio/analytics.js');assert.equal(scriptResponse.headers.get('content-type'),'text/javascript; charset=utf-8');
assert.equal(await scriptResponse.text(),await readFile('js/analytics.js','utf8'));
assert.equal(await(await request('https://2d1.studio/analytics.js',{method:'HEAD'})).text(),'');
assert.ok(!home.headers.get('content-security-policy').includes("script-src 'unsafe-inline'"));
console.log('Regional splash policy, no-store isolation, trusted country metadata and exact analytics script pass.');

for(const [route,file,type] of [
 ['/favicon.svg','img/brand/2d1-icon.svg','image/svg+xml'],
 ['/favicon.ico','img/brand/2d1-icon.ico','image/x-icon'],
 ['/apple-touch-icon.png','img/brand/2d1-apple-touch.png','image/png'],
]){
 const response=await request('https://2d1.studio'+route+'?v=3');
 assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),type);
 assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(file));
 assert.equal(await(await request('https://2d1.studio'+route,{method:'HEAD'})).text(),'');
 assert.ok(html.includes(route+'?v=3'));
}
console.log('Supplied favicon and compatible ICO/Apple variants pass.');
