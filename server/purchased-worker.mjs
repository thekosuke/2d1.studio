import objects from '../data/objects.json' with { type: 'json' };
import { purchasedStore } from './purchased-db.mjs';

const PRODUCT_IDS = new Set(objects.map(object => object.id));
const COOKIE = '__Host-2d1_purchased';
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MAX_BODY_BYTES = 1024;

function json(body, status = 200, extra = {}) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'private, no-store', 'Vary': 'Cookie',
    'X-Content-Type-Options': 'nosniff', ...extra,
  } });
}
function error(code, status) { return json({ error: code }, status); }
function browserToken(request) {
  const values = (request.headers.get('Cookie') || '').split(';')
    .map(part => part.trim()).filter(part => part.startsWith(`${COOKIE}=`));
  if (values.length !== 1) return null;
  const token = values[0].slice(COOKIE.length + 1);
  return TOKEN.test(token) ? token : null;
}
function sameOrigin(request, url, requireOrigin) {
  const origin = request.headers.get('Origin');
  if (origin !== null && origin !== url.origin) return false;
  if (requireOrigin && origin !== url.origin) return false;
  const site = request.headers.get('Sec-Fetch-Site');
  return site !== 'cross-site' && site !== 'same-site';
}
async function readBody(request) {
  const length = Number(request.headers.get('Content-Length'));
  if (length > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('INVALID_JSON');
  let lengthRead = 0;
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    lengthRead += value.byteLength;
    if (lengthRead > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(lengthRead);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
export async function handlePurchased(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  if (!['GET', 'PUT'].includes(method)) return json({ error: 'METHOD_NOT_ALLOWED' }, 405, { Allow: 'GET, PUT' });
  if (!sameOrigin(request, url, method === 'PUT')) return error('ORIGIN_NOT_ALLOWED', 403);
  let product;
  let desired;
  if (method === 'GET') {
    if (url.searchParams.getAll('product').length !== 1) return error('INVALID_PRODUCT', 400);
    product = url.searchParams.get('product');
  } else {
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return error('JSON_REQUIRED', 415);
    let body;
    try { body = await readBody(request); }
    catch (failure) { return error(failure.message === 'BODY_TOO_LARGE' ? 'BODY_TOO_LARGE' : 'INVALID_JSON', failure.message === 'BODY_TOO_LARGE' ? 413 : 400); }
    if (!body || Array.isArray(body) || typeof body.purchased !== 'boolean' || Object.keys(body).some(key => !['product', 'purchased'].includes(key))) return error('INVALID_REQUEST', 400);
    product = body.product;
    desired = body.purchased;
  }
  if (typeof product !== 'string' || !PRODUCT_IDS.has(product)) return error('INVALID_PRODUCT', 400);
  const existingToken = browserToken(request);
  if (method === 'PUT' && !existingToken) return error('COOKIE_REQUIRED', 409);
  const token = existingToken || crypto.randomUUID();
  try {
    const store = purchasedStore(env);
    const result = method === 'GET' ? await store.get(product, token) : await store.set(product, token, desired);
    // Refresh a first-party, opaque identifier. No IP, account, timestamp or personal data is stored.
    const cookie = `${COOKIE}=${token}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;
    return json(result, 200, { 'Set-Cookie': cookie });
  } catch {
    // Do not include identifiers, bodies, SQL errors or platform details in logs or responses.
    console.error('Purchased storage unavailable');
    return error('PURCHASED_UNAVAILABLE', 503);
  }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/purchased') return handlePurchased(request, env);
    if (url.pathname.startsWith('/api/')) return error('NOT_FOUND', 404);
    if (!env?.ASSETS?.fetch) return new Response('Site temporarily unavailable', { status: 503 });
    return env.ASSETS.fetch(request);
  },
};
