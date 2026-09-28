# 2D1 contact form connection

The site's contact form (the “Contact form” button in Studio) opens a native overlay with the same questions as the Notion form **Contact 2D1**: Full name, Email, Company (optional), Category (New Business / Media Inquiry / Other), and Message. Submissions are written to the same Notion database, **Form Submissions** (`2f111de80e9380749f67c8f9d437a79f`), with Status set to *New* and Submitted On set to the time sent — so they appear in your existing views (All Submissions, By Status, Pending Review).

A static site can't hold a Notion token, so a small endpoint does the writing. It isn't deployed yet. Until `contactEndpoint` is set, the form sends nothing and tells the visitor so, with a link to the Notion form.

## Connect

1. In Notion, create an internal integration (Settings → Connections → Develop or manage integrations). Give it *Insert content* capability. Copy its secret.
2. Open the **Form Submissions** database → ••• → Connections → add the integration.
3. Deploy `server/contact-worker.js` as a Cloudflare Worker (free plan is fine), e.g. `npx wrangler deploy server/contact-worker.js --name 2d1-contact`. Set:
   - secret `NOTION_TOKEN` — the integration secret (`npx wrangler secret put NOTION_TOKEN`)
   - variable `NOTION_DATABASE_ID` — `2f111de80e9380749f67c8f9d437a79f`
   - variable `ALLOWED_ORIGINS` — `https://2d1.studio,https://www.2d1.studio` (add `http://localhost:4173` while testing)
4. Add a Cloudflare rate-limiting rule for the Worker route (the Worker's own throttle is per-instance and best effort).
5. Put the Worker URL in `js/config.js` as `contactEndpoint`. It's an address, not a secret.
6. Send a test message and check it appears in Form Submissions. Delete the test row.

Any other host that can run a small function (Vercel, Netlify, your own server) works too; keep the contract below.

## Contract

- `POST` `application/json`: `{ "name", "email", "company", "category", "message" }` (plus a hidden `website` honeypot field that must stay empty).
- `200 { "status": "received" }` only after Notion accepts the page.
- `422` for invalid input, `429` when throttled, `403` for other origins, `502` if Notion rejects the request.

## Frontend behaviour

- Validation with specific messages; the field shakes and the eyes squint at a mistake.
- Sending state, 15-second timeout, double-submit protection; messages for success, 422, 429, connection failure, and timeout.
- Success replaces the form with a thank-you; reopening starts fresh.
- Nothing is stored in the browser. Without JavaScript, the button opens the Notion form.
