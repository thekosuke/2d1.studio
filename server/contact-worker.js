// 2D1 contact endpoint — a Cloudflare Worker that files each message in the
// Notion "Form Submissions" database (the same database the Notion form uses).
//
// Secrets / variables (set in the Worker, never in this repository):
//   NOTION_TOKEN        Internal integration secret (secret_… / ntn_…). The
//                       database must be shared with the integration.
//   NOTION_DATABASE_ID  2f111de80e9380749f67c8f9d437a79f
//   ALLOWED_ORIGINS     https://2d1.studio,https://www.2d1.studio[,http://localhost:4173]
//
// Contract (see docs/CONTACT.md):
//   POST application/json { name, email, company?, category, message }
//   200 { status: "received" } | 422 invalid | 429 too many | 502 Notion error
//
// Property names match the database: Full name (title), Email (email),
// Company (text), Category (select), Message (text), Status (status),
// Submitted On (date).

const CATEGORIES = ['New Business', 'Media Inquiry', 'Other'];
const LIMITS = { name: 120, email: 254, company: 120, message: 2000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recent = new Map(); // per-isolate, best effort; add a Cloudflare rate-limit rule too

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin'
    };
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { error: 'method' });
    if (!allowed.includes(origin)) return reply(403, { error: 'origin' });
    if (Number(request.headers.get('Content-Length') || 0) > 16000) return reply(413, { error: 'size' });

    // Throttle: at most 3 messages per address per 10 minutes.
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const hits = (recent.get(ip) || []).filter((t) => now - t < 600000);
    if (hits.length >= 3) return reply(429, { error: 'rate' });

    let data;
    try { data = await request.json(); } catch { return reply(422, { error: 'json' }); }
    const clean = (v, max) => String(v ?? '').trim().slice(0, max);
    const name = clean(data.name, LIMITS.name);
    const email = clean(data.email, LIMITS.email);
    const company = clean(data.company, LIMITS.company);
    const category = clean(data.category, 40);
    const message = clean(data.message, LIMITS.message);
    if (data.website) return reply(200, { status: 'received' }); // honeypot: pretend, store nothing
    if (!name || !EMAIL.test(email) || !CATEGORIES.includes(category) || !message) return reply(422, { error: 'invalid' });

    const text = (s) => (s ? s.match(/[\s\S]{1,2000}/g).map((c) => ({ text: { content: c } })) : []);
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: env.NOTION_DATABASE_ID },
        properties: {
          'Full name': { title: text(name) },
          Email: { email },
          Company: { rich_text: text(company) },
          Category: { select: { name: category } },
          Message: { rich_text: text(message) },
          Status: { status: { name: 'New' } },
          'Submitted On': { date: { start: new Date().toISOString() } }
        }
      })
    });
    if (!res.ok) return reply(502, { error: 'notion' });
    hits.push(now);
    recent.set(ip, hits);
    return reply(200, { status: 'received' });
  }
};
