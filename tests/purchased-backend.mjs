import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import worker from '../server/purchased-worker.mjs';

// Real SQLite schema/SQL behind a minimal D1 interface; no network or production writes.
const sqlite = new DatabaseSync(':memory:');
for (const name of readdirSync(new URL('../drizzle/', import.meta.url)).filter(name => name.endsWith('.sql')).sort()) {
  sqlite.exec(readFileSync(new URL(`../drizzle/${name}`, import.meta.url), 'utf8'));
}
const DB = {
  prepare(sql) {
    assert.ok(!sql.includes(';'), 'Exactly one statement per D1 prepare');
    const statement = sqlite.prepare(sql);
    return { bind(...args) { return {
      first: async () => statement.get(...args),
      execute: () => sql.trim().startsWith('SELECT') ? { success: true, results: statement.all(...args) } : { success: true, results: [], meta: statement.run(...args) },
    }; } };
  },
  async batch(statements) {
    sqlite.exec('BEGIN');
    try { const results = statements.map(statement => statement.execute()); sqlite.exec('COMMIT'); return results; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
const origin = 'https://preview.example';
const env = { DB, ASSETS: { fetch: async request => new Response(`asset:${new URL(request.url).pathname}`) } };
const make = (path, options = {}) => new Request(origin + path, options);
async function get(product = 'hay-miz-dark-green', cookie) {
  return worker.fetch(make('/api/purchased?product=' + encodeURIComponent(product), { headers: cookie ? { Cookie: cookie } : {} }), env);
}
async function put(cookie, purchased, product = 'hay-miz-dark-green', extra = {}) {
  return worker.fetch(make('/api/purchased', { method: 'PUT', headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...extra }, body: JSON.stringify({ product, purchased }) }), env);
}
let response = await get();
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { count: 0, purchased: false });
assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Lax/);
assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
const browserA = response.headers.get('Set-Cookie').split(';')[0];
const browserB = (await get()).headers.get('Set-Cookie').split(';')[0];
assert.notEqual(browserA, browserB);
assert.deepEqual(await (await put(browserA, true)).json(), { count: 1, purchased: true });
assert.deepEqual(await (await put(browserA, true)).json(), { count: 1, purchased: true });
assert.deepEqual(await (await get('hay-miz-dark-green', browserA)).json(), { count: 1, purchased: true });
assert.deepEqual(await (await get('hay-miz-dark-green', browserB)).json(), { count: 1, purchased: false });
assert.deepEqual(await (await put(browserB, true)).json(), { count: 2, purchased: true });
assert.deepEqual(await (await put(browserA, false)).json(), { count: 1, purchased: false });
assert.deepEqual(await (await put(browserA, false)).json(), { count: 1, purchased: false });
assert.deepEqual(await (await get('alessi-anna-g-black', browserB)).json(), { count: 0, purchased: false });
assert.deepEqual(await (await put(browserB, false)).json(), { count: 0, purchased: false });
assert.equal((await put(null, true)).status, 409);
assert.equal((await put('__Host-2d1_purchased=bad', true)).status, 409);
assert.equal((await put(browserA + '; ' + browserA, true)).status, 409);
assert.equal((await get("hay-miz-dark-green'; DROP TABLE purchased_marks;--")).status, 400);
assert.equal((await put(browserA, 'true')).status, 400);
assert.equal((await put(browserA, true, 'not-a-product')).status, 400);
assert.equal((await put(browserA, true, 'hay-miz-dark-green', { Origin: 'https://evil.example' })).status, 403);
assert.equal((await put(browserA, true, 'hay-miz-dark-green', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
assert.equal((await put(browserA, true, 'hay-miz-dark-green', { 'Content-Type': 'text/plain' })).status, 415);
for (const [body, status] of [['{', 400], [JSON.stringify({ product: 'hay-miz-dark-green', purchased: true, browser: 'spoof' }), 400], [' '.repeat(1025), 413]]) {
  assert.equal((await worker.fetch(make('/api/purchased', { method: 'PUT', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: browserA }, body }), env)).status, status);
}
assert.equal((await worker.fetch(make('/api/purchased', { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: browserA }, body: '{}' }), env)).status, 403);
assert.equal((await worker.fetch(make('/api/purchased'), env)).status, 400);
assert.equal((await worker.fetch(make('/api/purchased?product=hay-miz-dark-green&product=alessi-anna-g'), env)).status, 400);
assert.equal((await worker.fetch(make('/api/purchased', { method: 'POST' }), env)).status, 405);
const originalError = console.error;
console.error = () => {};
for (const broken of [{}, { DB: { prepare() { throw new Error('secret'); }, batch() {} } }]) {
  const unavailable = await worker.fetch(make('/api/purchased?product=hay-miz-dark-green'), broken);
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { error: 'PURCHASED_UNAVAILABLE' });
  assert.equal(unavailable.headers.get('Set-Cookie'), null);
}
console.error = originalError;
assert.equal(await (await worker.fetch(make('/objects/'), env)).text(), 'asset:/objects/');
assert.equal((await worker.fetch(make('/api/unknown'), env)).status, 404);
assert.equal(sqlite.prepare('SELECT count(*) AS n FROM purchased_marks').get().n, 0);
const plan = sqlite.prepare('EXPLAIN QUERY PLAN SELECT count(*) FROM purchased_marks WHERE product_id = ?').all('hay-miz-dark-green');
assert.match(plan.map(row => row.detail).join(' '), /USING COVERING INDEX/);
// Direct SQL uniqueness remains enforced independently of handler idempotency.
sqlite.prepare('INSERT INTO purchased_marks VALUES (?, ?)').run('hay-miz-dark-green', 'one');
assert.throws(() => sqlite.prepare('INSERT INTO purchased_marks VALUES (?, ?)').run('hay-miz-dark-green', 'one'));
sqlite.close();
console.log('Purchased backend: cookie ownership, shared counts, idempotent changes, removal, validation, CSRF, failures, static fallback and real SQLite migration/index tests passed.');
