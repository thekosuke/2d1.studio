# Domain setup — 27 October 2026

The owner authorized **only a coming-soon page** and the newfiction.org redirect.
The complete local website must remain unpublished until separately requested.

## Current setup

- Cloudflare account **2D1**: `17a311d4f9c02bb265da393443348f86`.
- Free zones: `2d1.studio` and `newfiction.org`; GoDaddy remains the registrar.
- Worker `2d1-coming-soon`, configured by `wrangler.coming-soon.jsonc`.
- Only `_launch/coming-soon/index.html`, `server/coming-soon.mjs`, and the approved
  `img/brand/2d1-social.png` social preview plus `js/analytics.js` are uploaded.
  Original `img/brand/eyes.svg` paths are embedded in the HTML, so opening the
  local file directly shows the same eyes as the hosted page.
- No full-site asset binding, database, form credentials or fonts. Optional
  regional Google Analytics is documented in ANALYTICS-SEARCH-CONSOLE.md. workers.dev and version previews are disabled.
- Main page: original red pixel eyes centered on #FAF0E6; no visible text.
  CSS animates occasional pupil glances and blinks in a 12-second cycle; reduced
  motion leaves the eyes still. The self-contained cursor script follows mouse/pen position and triggers a blink
  on pointer entry. A CSP hash allows the eye script; Analytics uses a separate same-origin
  loader with restricted Google endpoints. Without JavaScript the original CSS animation remains.
- `www.2d1.studio` redirects to the canonical HTTPS apex.
- `newfiction.org` and `www.newfiction.org`, including old paths, redirect with
  HTTP 301 to `https://2d1.studio/`. Old paths intentionally land at the root.
- Other paths on 2d1.studio return the holding design with HTTP 404, not the
  complete website. HTML responses are no-store. The root is indexable; unknown
  routes remain noindex. The public sitemap lists only the root.

## DNS migration

GoDaddy confirmed both domains now use `georgia.ns.cloudflare.com` and
`jobs.ns.cloudflare.com`. Cloudflare verification was requested for both.
At 19:21 JST, public DNS/HTTPS still reached GoDaddy/GitHub: propagation and
certificate activation were pending. Configuration acceptance is not a successful
public HTTP check; verify both HTTP/HTTPS and apex/www before calling it live.

Later checks at 19:26–19:31 JST: newfiction.org's registry delegation had changed
to Cloudflare and its dashboard reported active. 2d1.studio's registry still
returned the old nameservers despite GoDaddy confirming the new pair. Public
local DNS still reached old hosting; direct Cloudflare HTTPS checks could not
complete a TLS handshake while certificates activated. No bypass was used.

GoDaddy retains an old **2d1.studio → newfiction.org (302)** forwarding rule.
Two deletion attempts returned a GoDaddy service error. Do not claim it was
removed. It becomes unused after 2d1.studio DNS moves to the Worker, but during
mixed propagation a browser may encounter that old redirect. Check or remove the
obsolete forwarding when the registrar finishes processing; do not restore old
nameservers just to edit it. Both Cloudflare nameserver rechecks were requested.

At 19:32 JST, both registry delegations and public DNS pointed to Cloudflare.
Direct checks against the new Cloudflare addresses verified HTTPS 200 for the
2d1.studio holding page, HTTPS 301 for www.2d1.studio, and HTTP 301 to the
canonical HTTPS root for all four hosts. TLS certificate validation was enabled.
newfiction.org and www.newfiction.org HTTPS still failed: Cloudflare's Edge
Certificates screen explicitly reported **Pending Validation (TXT)** for its
managed certificates. Local cached DNS still reached the old hosting. The
remaining completion check is certificate activation and normal-resolver HTTPS
redirect verification for both old-domain hostnames. Evidence: `edge-check.json`
in the ignored DNS-baseline folder. No certificate/security bypass was used.

Every GoDaddy record was reviewed: 16 for 2d1.studio, 17 for newfiction.org.
Cloudflare supplies NS/SOA; old web A/CNAME targets were replaced with Worker
custom domains. Google Workspace MX/TXT records were preserved and compared
directly with the assigned authoritative server. All backed-up MX/TXT values
matched. `_domainconnect` is DNS-only. Both automatic imports missed
`dc-aa8e722993._spfm`; both were restored (newfiction.org's SPF depends on it).
Neither domain had a published DS record; no DNSSEC protection was disabled.

DNS baseline and browser proof: ignored `tmp/domain-launch-2026-10-27/`.

## Local preview and future holding-page updates

```sh
node tests/coming-soon.mjs
WRANGLER_LOG_PATH=tmp/wrangler-logs npx wrangler dev --config wrangler.coming-soon.jsonc --local --local-upstream localhost --port 4180
```

Preview: http://localhost:4180/. The local-upstream flag avoids Wrangler's
custom-domain host rewriting during preview.

Only after authorization to update the public holding page:

```sh
WRANGLER_LOG_PATH=tmp/wrangler-logs npx wrangler deploy --config wrangler.coming-soon.jsonc
```

## Full-site launch later

Do not deploy `dist/` or `npm run build:hosted` unchanged: both are private
noindex packages. Prepare a separate production build with approved routes,
assets, robots/sitemap and headers; complete the release decisions in
`docs/LAUNCH-2026-10-27.md` and contact activation in `docs/CONTACT.md`.
Keep the full site's credentials out of this holding Worker.

At launch, bind only 2d1.studio/www to the production Worker. Keep newfiction.org
redirecting separately, and remove the main-domain bindings from this holding
config so a future redeploy cannot reclaim them. Another nameserver change will
not be necessary. Do not publish the complete site without the owner's request.

## Validation

- Tests cover eight old-domain redirect combinations, canonicalization, methods,
  indexing policy, original artwork and exclusion of full-site routes/assets/API.
- Real browser: desktop and 390 × 844; mobile eye center `(195, 422)`, no overflow.
- Successful four-domain deployment: `c6e0e713-8d24-44e0-82a4-b088927d8c3b`.
- No Git commit or push performed.

## Animated holding-page update

Deployed version `77e959ec-8c45-47ba-95b5-5f743b55726d` adds inline original
eye geometry and CSS glances/blinks. Live Cloudflare HTTPS HTML was verified
byte-for-byte against the standalone file. Browser sampling confirmed pupil
movement and eyelid closure/reopening. Direct file-URL browser verification was
blocked by the browser tool URL policy; the HTTP preview was inspected instead.
The old-domain HTTPS certificates were still pending at this update.

Cursor update: eyes are 75% of their previous dimensions (87px minimum, 9vw,
130.5px maximum). Actual browser interactions verified opposite cursor directions
and a hover-triggered blink; the mobile viewport has centered 87 × 36px eyes
and no overflow. Reduced-motion changes cancel cursor and hover motion.

Hover palettes: each pointer entry cycles red eyes/beige → beige eyes/red →
red eyes/ash brown (#191416) → repeat. The chosen palette stays on exit; a reload
starts beige. Touch taps and keyboard activation also cycle colors. Background, eye fill and browser theme color update together, including reduced
motion. Pupils stay soft beige in both red-eye palettes; the beige-eye/red-ground
palette keeps red pupils.
Browser verification confirmed all three palettes, keyboard cycling and no console
errors. Only the isolated splash Worker is deployed.

19:56 JST recheck: browser title is now just `2D1` (Worker version
`286c4d6c-8eca-4220-a59c-5ce6799a2126`). HTTPS certificates for both
newfiction.org hosts are active and their redirects pass. 1.1.1.1 resolves
2d1.studio to Cloudflare, but 8.8.8.8 still returns the GoDaddy forwarding IPs.
The browser encountered a redirect loop through that cached route. Another
GoDaddy deletion attempt returned the same service error; forwarding remains.
Cloudflare directly serves the exact splash HTML and returns 404 for full-site
paths. Global DNS-cache convergence remains outstanding; no extra site uploaded.

20:02 JST: normal-resolver HTTPS checks, following redirects, return the exact
splash HTML for all four hostnames. Both 1.1.1.1 and 8.8.8.8 now resolve the apex
to Cloudflare. The existing desktop browser still reports a redirect loop, even
with a fresh query; browser-specific cached DNS/connection state remains suspected
but not proven. The owner unlocked both registrar transfer locks; this is unrelated
to DNS hosting and relocking was recommended. No registrar transfer initiated.

OGP: `/og-image.png` serves the existing 1200 × 630 red-logo/beige artwork.
Open Graph and Twitter large-image tags use its absolute HTTPS URL. No full-site
assets directory is bound; only this individual image is imported. Social preview
bots can fetch the splash/image via robots.txt. The later SEO update enables
root indexing and a single-URL sitemap; the visual splash is unchanged.
See `docs/SEO-LAUNCH-PLAN.md`.

SEO update deployed as `b4636ff9-4c50-4a77-8319-2288401c88a5`.
Normal HTTPS curl checks confirm the exact splash HTML and index/follow header,
robots and a one-URL sitemap; `/work/supa/` and `/ja/` remain 404/noindex.
The OG image matches the approved original bytes. All three alternate hostnames
resolve to the main splash. Browser inspection confirms title `2D1`, eyes-only
appearance and no console errors. No complete-site files were uploaded.
Evidence: `tmp/seo-2026-10-27/live-check.json` and `splash-live.png`.


Favicon update (27 October): the splash deployment additionally includes the
owner-supplied SVG favicon, its ICO fallback, and Apple touch PNG. The public
endpoints are `/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`. No other
website assets are exposed.


Splash refinement — November 2, 2026: at the owner’s request, removed the
Privacy button and its splash-only settings panel/styles. The previous page is
preserved in `_archive/splash-privacy-2026-11-02/`. Shared analytics behavior
and regional policy selection remain unchanged; without a splash consent
control, consent-required regions stay off unless consent was already stored.
Deployed only the isolated `2d1-coming-soon` Worker, version
`ca8a9b90-fb7c-4945-a1b7-f8c406064d51`. Live HTML matches source (apart from the
trusted regional policy attribute); splash routing, redirects, CSP and favicon
checks pass. No full-site deployment or Git commit.
