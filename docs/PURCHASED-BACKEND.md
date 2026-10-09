# Anonymous Purchased counts

The only connected workflow is Objects’ Purchased toggle. Contact and signup remain unconnected.

## Model and limits

The shared D1 database stores only `(product_id, browser_id)`. A composite primary key enforces one mark per product per opaque browser identifier. No starting counts, timestamps, IP addresses, profiles or account data are stored by this application. Hosting infrastructure may independently retain its normal request logs.

The first successful read sets a first-party `__Host-2d1_purchased` cookie: HttpOnly, Secure, SameSite=Lax, Path=/ and a one-year rolling lifetime. The server creates a random UUID; it is not an authentication account or API credential. Writes require the existing cookie. Disabling cookies prevents marking rather than creating a new mark for each click. Clearing cookies, expiration, private browsing or using another browser can count someone twice; this is a browser-based tally, not verified purchases or a unique-person count. Without the original cookie an old mark cannot be individually recovered or removed. No claim of fraud prevention should be made.

## API

- GET `/api/purchased?product=hay-miz` returns `{ "count": 0, "purchased": false }` when truly empty, and establishes or refreshes the cookie.
- PUT `/api/purchased`, with `Content-Type: application/json` and `{ "product": "hay-miz", "purchased": true }`, sets the desired state. False removes this browser’s mark. It returns the same response shape.
- Client fetches use same-origin credentials. Await the initial read and disable the toggle while loading or saving. Send changes serially. After a lost response, repeat the same desired state or re-read; never blindly invert.
- Product IDs are bundled from canonical `data/objects.json`; rebuild Worker when the catalogue changes.
- Writes require an exact same-origin Origin header and reject cross-origin fetch metadata. No CORS permissions are added.
- A failed load/save must remain a visible recoverable error. Do not turn API failure or a static-preview 404 into count zero or optimistic saved state.
- Errors are JSON `{ "error": "CODE" }`: invalid product/request/JSON 400, origin rejection 403, unknown API 404, method 405, missing cookie 409, oversized body 413, wrong content type 415, storage unavailable 503. Only 200 is success.

## Source integration

Canonical implementation: `server/purchased-worker.mjs`, `server/purchased-db.mjs`, `db/schema.ts`, `drizzle.config.ts`, `drizzle/` and `tests/purchased-backend.mjs`. Product metadata in `data/objects.json` remains authoritative. Development dependencies and exact versions are recorded in `package.json` and `package-lock.json`; generated packages and node_modules are ignored.

Runtime uses native D1 prepared statements and no Node dependencies. Migration generation needs drizzle-kit and drizzle-orm; bundling uses esbuild. Verified versions: drizzle-kit 0.31.11, drizzle-orm 0.45.4, esbuild 0.28.2. Preserve package-manager/lockfile choices and record these required dependencies in the owning project. On a schema change, run `drizzle-kit generate`, review the new SQL and include the generated SQL, snapshot and journal together. Existing applied migrations are immutable. Do not create tables at runtime.

## Existing private Site packaging

Keep the existing project ID and owner-private audience. Remove the old `static` field from its hosting manifest and use:

    { "project_id": "appgprj_6ac8448dc6f081919531a44b83b1c463", "d1": "DB", "r2": null }

Build the normal static preview first, keeping noindex headers and excluding production CNAME. In the separately opened Sites publishing checkout, place the static package beneath `dist/client/` rather than exposing server files publicly. Bundle:

    esbuild server/purchased-worker.mjs --bundle --format=esm --platform=browser --target=es2022 --outfile=dist/server/index.js

The bundle exports default `{ fetch }`. It handles `/api/purchased` before delegating other paths to `env.ASSETS.fetch(request)`. Preserve the native Sites static asset binding; do not route API misses through HTML fallback.

Copy `.openai/hosting.json` to `dist/.openai/hosting.json`, and include generated `drizzle/` source and `dist/.openai/drizzle/` migration metadata. This matches the starter’s output layout. The normal Sites packager also copies root drizzle into dist/.openai/drizzle. Sites owns DB provisioning and applies schema migrations before uploading the Worker. No Cloudflare API tokens or external database credentials are needed.

A plain Python or static-only preview does not run this API; show Purchased as unavailable there. A deployed Worker with DB is required for the actual shared feature. Source tests below verify logic and SQLite SQL, not the deployed binding or browser cookie behavior. The Site owner should verify deployment status and, where an authorized preview is available, the exact-origin/cookie round trip; never report static/local behavior as a real shared database test.

## Verification

Run `node tests/purchased-backend.mjs` on Node 24. It applies the actual generated migration to a fresh in-memory SQLite database and exercises the API through a D1 adapter: genuinely empty state, two distinct browsers, idempotent mark/unmark, product isolation, persistent reads, cookie attributes, invalid and duplicate cookies, no-cookie writes, request/JSON/body-size validation, origin checks, storage failure, unknown routes and static fallback. It checks database uniqueness and the product-leading covering index.

The response does not disclose internal SQL failures; logs contain only a generic storage-unavailable message. The batch mutation and summary read are one D1 transaction. No test mutates the hosted database or seeds any user-visible counts.

## Local full-feature preview

Use Node 24 and Python 3. Install the locked development tools with `npm ci`.
Run `npm run build:hosted` to regenerate static pages and produce the private
Worker bundle under `tmp/hosted-build/`. This does not publish anything.

For an isolated local database, run `npm run db:local`, then
`npm run preview:worker`. Open `http://localhost:8787` in the desktop browser.
The `wrangler.jsonc` binding is explicitly local-only; do not run remote database
commands or deploy it with Wrangler. Sites owns the real hosted database.
Local records live under ignored `.wrangler/` and do not change hosted counts.
The anonymous cookie is Secure; use localhost as the hostname. A browser that
rejects that cookie will show the truthful cookie/count error; use the private
hosted preview to test browser persistence rather than weakening cookie security.

`python3 scripts/preview.py` remains the buildless visual preview on port 4173.
It does not run the API, so the Purchased control reports an unavailable shared
count and does not manufacture a count or store ownership in localStorage.
