# 2D1 — cloud and iPhone handoff

## Start here

Read `AGENTS.md` completely, then `README.md`. The current-direction block
supersedes historical design notes. The latest design source is
[Figma frame 298:650](https://www.figma.com/design/z1J8lyfvwOqtHpQqfNin3x/Website-2026?node-id=298-650),
with the subsequent copy, color, spacing and interaction changes recorded in
README. Do not implement from the older exported Figma frames.

The GitHub repository currently resolves to
https://github.com/thekosuke/2d1.studio.
The local `origin` still uses the old `newfiction-web` URL; leave that remote
unchanged unless the owner requests otherwise. Work on `site-redesign`, not
`main`. The latest local changes must be committed and pushed before a cloud
clone can use them. Do not assume an older remote checkpoint is current.

## Cloud work with Saul

The owner wants to work from the iOS app with the Mac switched off. Use Saul’s
cloud computer or a cloud coding environment connected to the repository.
A local desktop task or `localhost:4173` on this Mac cannot satisfy that goal.
GitHub access in this desktop session does not establish Saul’s cloud access;
verify the repository connection in Saul’s environment before starting.

In a new cloud checkout:

```sh
git clone --branch site-redesign https://github.com/thekosuke/2d1.studio.git
cd 2d1.studio
python3 scripts/preview.py
```

In an existing checkout, inspect `git status` and the branch first. Fetch and
fast-forward only when the checkout is clean. Do not reset, discard, or
force-push someone else’s work. Coordinate one active editor at a time on
`site-redesign`, or use an explicitly requested separate branch.

For the buildless layout preview, no npm install or API key is required.
The approved Purchased feature additionally needs the Worker/D1 path below. The local
server is for the agent’s browser checks; iPhone review requires the separately
hosted preview URL. Keep the production domain, `main`, GitHub Pages settings,
DNS and `CNAME` unchanged.

## Prepare the hosted preview

```sh
python3 scripts/build-japanese.py
python3 scripts/build-preview.py
```

The second command writes the ignored `dist/` directory, with six active pages
and their assets. The package excludes repository metadata, archives, private
configuration, handoff documents, server code and the production CNAME.
It adds noindex/nofollow metadata and a disallow-all robots file. A compatible
host can also use the generated `_headers` file. These indexing controls are
not access controls: use the chosen host’s private/authenticated access policy.

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site

Sites project ID: `appgprj_6ac8448dc6f081919531a44b83b1c463`. Reuse this Site; do not create a duplicate. Sign in with the owner's ChatGPT account to view it. The local publishing checkout is `tmp/hosted-preview/` (ignored); its `.openai/hosting.json` stores the same ID. To update from another computer, use the Sites skill to open this existing Site, rebuild the latest approved GitHub source with `scripts/build-preview.py`, copy the resulting `dist/` into the Site checkout, and publish through the Sites workflow. GitHub remains the canonical editable source; changes do not automatically deploy. The owner approved this checkpoint and private preview on 9 October 2026; later publication still requires authorization. Once it is, record the exact preview URL,
project identity and refresh command here. Do not substitute the production
site URL or claim localhost is accessible from an iPhone with the Mac off.
Publishing a preview must not deploy to `2d1.studio`.

## Current implementation

- Home: viewport-height bordered hero with landing wipe and blinking eyes;
  intro → Studio → Shop → Connect. Community and its profile form are removed.
- Hero rises over slower-moving main content. Studio smoothly changes the
  page ground from beige to gray and back. Native scrolling is preserved.
- Page anchors enter from the left after the hero; the language switch enters
  from the right at the same threshold. Both hide on returning to the hero. Phone/tablet widths place Studio/Shop inline left of the centered logo and Connect right; desktop 1100px+ uses a vertical list at the left. The phone intro emerges after 25% less scroll distance; desktop motion is unchanged.
- Dark brown `#320505` primary ink, Icon Red `#FF2B00`, beige `#FAF0E6`,
  Studio gray `#D6CEC5`. Square UI, local SC Walla, Noto Sans JP for Japanese.
- Shop render sits between the first and second description paragraphs.
  Specifications use 15px text, 8px row padding and a 16px note gap.
- Live tote follows the mouse; touch/pen horizontal dragging rotates it with ±135° stops and no momentum. Vertical swipes retain page scroll; hover/tap/keyboard X-ray is preserved.
- Connect input is 40px. No initial/focus footnote; submission truthfully says
  nothing was sent or saved. Contact is also unconnected. Only Objects Purchased has an approved backend.
- About retains the short-version/expand essay and has no hero.
- English sources: `index.html`, `about/index.html`; edit `locales/ja.json` and
  regenerate Japanese with `python3 scripts/build-japanese.py`.
- Active CSS: `css/walla.css`, `css/fonts.css`, `css/dialogs.css`, `css/about.css`.
  Active behavior is documented in README; old archived implementations are
  not the active site.

## Verification and Git boundaries

Check Home and About in both languages. Visual changes need phone/tablet/
desktop review, no horizontal overflow, keyboard focus, reduced motion and
no-JavaScript fallbacks. Three.js loads from jsDelivr; the tote poster remains
when WebGL or the CDN is unavailable. Preserve clean in-page URLs.

Do not commit, push or deploy without the owner’s approval for that checkpoint.
Keep tracked `.DS_Store` changes out of commits. Do not include unrelated local
font deletions unless the owner explicitly asks. Never merge to `main` or alter
production hosting as part of a preview update.

## Suggested first message to Saul

> Continue the 2D1 website in the cloud so I can work from my iPhone with my Mac
> off. Use thekosuke/2d1.studio on branch site-redesign. Read AGENTS.md, README.md
> and docs/HANDOFF.md before editing, and verify you have the latest approved
> checkpoint. Use the separate hosted preview for my review. Preserve the
> English/Japanese site, current design and truthful unconnected forms. Do not
> change production, merge to main, or publish new changes without my approval.

## Cloud mobile review — 9 October 2026

Private preview version 4 is published at the same URL above, from Sites source
commit `d310688931d0be34ba589ca2ba4cbd5b840508e9`. It includes the owner's mobile
anchor placement, touch tote rotation, and 25%-earlier intro-entry requests.
Version 3 doubles only the mobile Studio–Shop gap from `clamp(6px,2vw,16px)`
to `clamp(12px,4vw,32px)` in both languages (7.8px → 15.6px at 390px).
Version 4 adds direct horizontal touch/pen dragging to the Studio artwork strip,
with looping and safe vertical-scroll/cancellation handling. Tote rotation can
now start anywhere in its presentation stage, including the surrounding blank
space shown in the owner’s screenshot. A stationary tap still toggles X-ray only
on the bag itself. Both languages retain the same behavior.
The owner requested synchronizing these accumulated refinements to GitHub for
cross-device work. The `site-redesign` checkpoint containing this handoff includes
all three mobile changes and the doubled gap. The separate Sites source commit
above has the same generated site content; GitHub and Sites have different commit
IDs because the Sites repository contains only the packaged preview.

For desktop browser review, open the private URL above with the owner's ChatGPT
account. For local editing, inspect local changes first, then fetch and fast-forward
`site-redesign` only when clean. Never reset a dirty desktop checkout to synchronize
it. Continue using one active editor at a time; requested preview refinements must
be kept aligned between canonical source and the private preview, without changing
production hosting.

`node tests/mobile-interactions.mjs` checks touch direction, capture, cancellation,
bounds and repeated gestures, all four surrounding tote-stage areas, carousel
loop seams and reduced-motion bounds, plus intro-entry calculations at six phone heights.
JavaScript syntax, Japanese generation, local references and packaging pass.
Real-browser visual/touch verification remains outstanding: standalone Chromium
cannot open its required sockets in this executor, and the separate browser
cannot access its localhost. No production hosting or backend was changed.


## Objects checkpoint — 9 October 2026

Private preview version 5 is published from Sites source
`cfd6e5d7a651c684bf92354eb38e1217b6809282`. Objects is available at `/objects/`
and `/ja/objects/` on the same private preview URL. It contains ten placeholder
selections with original-resolution, source-credited product photographs,
category/tag filters, a bounded-DOM infinite draggable canvas, accessible List
mode and native product dialogs. Home intro and Home/About footers link to it.
Desktop/tablet anchors now use the phone’s horizontal, inline arrangement.

Product metadata is in `data/objects.json`; provenance and rights notes are in
`docs/OBJECTS-SOURCES.md`. Regenerate with `python3 scripts/build-objects.py`,
then `python3 scripts/build-japanese.py` and `python3 scripts/build-preview.py`.
The preview now includes six pages. `node tests/objects.mjs` checks repeating
coordinates, empty/small filter sets, tap versus drag, interrupted gestures,
keyboard event isolation and focus-return hooks. Existing mobile tests remain.
All automated/source/package checks passed. Real rendered browser/device QA
remains unverified because the cloud browser cannot reach this executor’s
preview and standalone Chromium cannot create its required sockets.

The collection explicitly calls these placeholders; extra products are not
confirmed personal recommendations. No public-use image license is implied;
review rights before any public deployment. Source and private preview are
synchronized in the branch checkpoint containing this handoff. Production,
backend and access settings remain unchanged.

## Immersive Objects checkpoint — 9 October 2026

Private preview version 7 is successfully published from Sites source
`f97a48d84cc6f096de634c5ea7bef6dbed93b95b`, at the same owner-private URL.
This supersedes the layout notes for version 5: desktop anchors are vertical
at the left; mobile/tablet keep the inline layout. Shop adds Explore Objects,
and Home/About footer links follow the copyright inline.

Objects now fills the viewport with a centered, all-direction draggable grid.
Header, filters, view, language, info and zoom controls float above it. Maximum
zoom becomes a one-product horizontal carousel; reducing zoom preserves the
selected product in the grid. List/no-JavaScript browsing remains available.
The info popup contains the requested working Familiar Characters description
and identifies the collection as placeholders. Preserve both language routes.

The owner explicitly approved a small anonymous shared Purchased database,
one mark per browser/product and no login. The private Site now uses a Worker
and D1; the initial migration was applied by the successful version 6 deployment
and must not be edited. Version 7 retains that schema. Cookie-based reversible
marks are idempotent and counts are shared, but separate browsers or cleared
cookies can count twice. Nothing was seeded. Contact/signup remain unconnected.
Details, privacy limits, API and local setup: `docs/PURCHASED-BACKEND.md`.

For a full local preview with Node 24 and Python 3:

```sh
npm ci
npm run build:hosted
npm run db:local
npm run preview:worker
```

Open `http://localhost:8787`. This uses an isolated local database, not hosted
counts. The existing `python3 scripts/preview.py` on port 4173 still supports
layout review but reports Purchased unavailable, never a fabricated zero.
Do not run remote Wrangler database commands or deploy with Wrangler.

`npm run build:hosted` regenerates all pages and creates ignored
`tmp/hosted-build/`: static files in `dist/client`, bundled Worker in
`dist/server/index.js`, the existing project manifest with `d1: "DB"`, and
immutable Drizzle migrations. Copy that generated package to the existing
Sites publishing checkout, preserving its history, then use the Sites workflow.
Do not use the old static-only package when publishing the Purchased feature.

Verification: `npm test` passes prior mobile/tote/Studio regression checks,
finite-repeat grid and empty/small filters, interrupted pointer gestures,
zoom/carousel transitions, focus-return hooks, async count race/failure handling,
and backend tests applying the actual migration/SQL to real local SQLite via a
D1 adapter (two browser IDs, repeat toggles, shared reads and uniqueness).
The local Wrangler migration also succeeded. These are NOT live deployed API
tests. Hosted publication and source package alignment are verified; actual
hosted cookie/API persistence and rendered desktop/iPhone interactions remain
unverified. The authenticated preview has no available authorized cloud browser
session; standalone Chromium sockets and the local Worker server's network
interface operation are blocked in this executor. No hosted test votes were
created. Do not claim screenshots or on-device verification.

Keep requested refinements aligned between canonical `site-redesign` source and
this private preview. Fetch before edits/pushes and preserve concurrent local
work; never force-push or reset another editor's dirty checkout. No production
merge, public audience, DNS or production domain change is included.

## Navigation and white controls checkpoint — 9 October 2026

Private preview version 8 published successfully from Sites source
`d799031a2a3f1176e27e481d9bf1585a872eda86`, at the same owner-private URL.
Home now groups About/Objects below the page anchors with a 1px divider and
matching type/casing/hover/focus behavior. Desktop remains vertical; mobile and
tablet retain the Studio/Shop/logo/Connect top row, with page links in a second
inline row below. Home/About footer page links are removed. Shop’s gallery CTA
is “Found in the Wild” (Japanese: “日常で見つけたもの”), still linking to Objects.
The intro’s Explore Objects link and Objects page/navigation name are unchanged.

Objects floating controls use solid white surfaces, retaining red selected and
focus states. Its floating About link is moved into the info popup; the logo
remains centered. Both language routes use their corresponding About destination.

`npm test`, generation, package alignment and diff checks pass. Added source
regressions cover grouped links, both language routes, mobile second-row CSS,
footer removal, Shop destination and About’s popup placement. Previous touch,
gallery and Purchased SQL/async tests still pass. Real rendered desktop/iPhone
QA remains unavailable under the previously documented executor restrictions.
Worker bundle, D1 schema/migrations and persisted data are unchanged; no hosted
votes were created or modified. Preview remains owner-only. Canonical branch
and packaged private preview are synchronized in this checkpoint.

### Latest combined refinement checkpoint

Version 10 supersedes the above version 8 notes; Sites source is
`3b7e0c9d88867f1c54eebcc3df53bc323ff6995a`.
Home and About share the section/page/action navigation: Studio, Shop, Connect;
divider; About and Found in the Wild; divider; Contact. About uses Home-section
URLs, current-page semantics, and loads the existing contact drawer and styles.
Contact is a real button opening that same unconnected form. Desktop groups
are vertical; mobile/tablet use two compact rows with Contact separated on the
right. About's small-screen masthead has additional top clearance. Footer page
links are removed. Objects keeps its immersive navigation, not this left menu.

The intro's Explore Objects link is removed; More about us remains. Found in
the Wild remains only in Shop and page navigation, leading to `/objects/` (or
the Japanese equivalent); the route/page title is still Objects.

Objects: −/+ zoom labels, visually hidden grid captions only at the far-left
minimum, restored above minimum; accessible slider name/value and full product
details remain. Home control hugs its contents. Floating control surfaces are
white with black borders. Change view is at bottom-left; its bounded scrollable
panel opens upward. Info is top-right and contains the About link. On phones,
zoom is above the bottom row; at narrow widths zoom/slide controls temporarily
hide while the view panel is open to avoid overlap.

All automated tests pass, including repeated contact open/close, heading focus,
opener focus return, current-page/route checks, intro CTA containment and
minimum-zoom caption-state transitions. Generated files and Worker bundle match
the published package. Backend source/schema are unchanged and no hosted votes
were touched. Rendered browser/device and live authenticated API verification
remain unverified, for the limitations recorded above.

### Finds and About logo — latest preview / source-sync pending

Private preview version 12 succeeded from Sites source
`58f6a133c29186ef819485397be21f5c32219de6`.
The owner selected the name **Finds**. It now replaces Found in the Wild in
Home/About navigation and Shop CTA, and replaces Objects in the gallery title,
heading and metadata, including Japanese brand labels. URLs remain `/objects/`
and `/ja/objects/`. The single About logo now matches Home's settled dock:
96px wide, fixed, centered, 16px from the top. No duplicate logo was added.
All earlier version-10 changes are included; tests and exact package alignment
pass. Backend/schema/data remain unchanged.

GitHub synchronization is PAUSED: the create-tree tool was cancelled by the
user during the source-sync step, and permission to retry is pending. Do not
claim GitHub contains these refinements or retry GitHub writes until the owner
confirms. Canonical cloud HEAD/remote last verified commit remains
`3a9da3887b2433c51db042bbf71ed61f333b0b34`; current working/index changes hold this
new checkpoint. Recovery patch is at the adjacent cloud workspace file
`../2d1-nav-source.patch`, with package archive `../2d1-nav-preview.tar`.

### Shop cluster and no-outline focus — latest preview

Version 13 succeeded from Sites source
`0747a27f677013ed44ac1f401f74c342a14fbdf4`. It includes all preceding refinements.
The Shop CTA now reads exactly **Objects found in the Wild** in English;
Finds remains the nav/page name. The owner’s screenshot was inspected: this
CTA and Notify me when it’s out are grouped vertically with a 16px desktop /
12px phone gap instead of inheriting the large section gap.

Persistent project design direction: never show focus outlines or outline-like
box shadows on links/buttons (including button/link roles and summary controls).
Keyboard focus remains discernible through solid Icon Red fill and dark-brown
text, with no focus ring. Authored black button borders remain. Other input and
canvas focus styles are unchanged. This applies to Home, About, Finds, floating
controls and dialogs in both languages. Tests/build/package alignment pass;
real-browser/device limits remain as above. GitHub sync is STILL HELD pending
explicit approval after cancellation; no GitHub writes were retried.

### Ownership wording — latest preview

Version 14 succeeded from Sites source
`88f4d985989e2eea77b71222dd89e58aadfd2699`. The ownership button reads **I have it**
(with a checkmark and aria-pressed when selected). The authoritative count reads
**Owned by N users**, singular **Owned by 1 user**. Zero remains plural; no
count is shown until a successful server response. Loading/unavailable/retry
behavior is preserved. A small visible note explains that the anonymous tally
is browser-based and using another browser can count twice. Both languages are
updated. API/schema and actual stored data are unchanged. Automated tests cover
0/1/2 wording and existing async/idempotence cases. All previous refinements are
included; visual/live API verification limitations and the GitHub hold remain.

### About active-DOM fix, focus and US English — latest preview

Version 16 succeeded from Sites source
`719c74c2c79b76fff1d187f8b862c399ab984464`.
Root cause of missing About nav/logo: both were inside the existing inert
`about-hero-archive` template. Earlier raw-source presence tests missed this.
There is now one active docked logo and full navigation OUTSIDE the template,
visible without Home's scroll trigger. The archived hero remains preserved.
Both English/Japanese source and packaged pages were parsed with template depth
tracking: exactly one active logo, nav and essay-end red square. The square the
owner liked is unchanged. Source/package checks are not a rendered browser test.

Screenshot-verified focus correction: the missed ring was the native Tag select.
All control focus outlines/shadows are now suppressed, including selects,
inputs, sliders, canvases and radio-label surfaces. Keyboard focus retains
filled cues/input underlines; authored borders remain. The color tag and
colorful description use US English. Official HAY Colour Crate name and its
source URLs stay original. US English is the ongoing authored-copy convention.

Screenshot-verified hover scope is Home/About navigation including Contact:
red square literal width 0→6px, label translation 12px, no sibling/divider layout
shift. Hover-capable pointers only; reduced motion switches instantly.

All automated regression/build/diff checks pass; exact generated package matches
published source. Live rendered/private-auth browser verification remains
unavailable. No claim of on-device verification. GitHub synchronization remains
HELD after cancellation; no GitHub writes retried. Recovery patch refreshed.

### Canvas-only spatial focus and introduction — latest preview

Version 18 succeeded from Sites source
`17d267556a033b06469e545bf03f48fd4593e47a`. Version 17's temporary Grid/Canvas
toggle is superseded: canvas-only browsing, menu label Category, categories
only, no tag selector and no horizontal slide controls. All image frames use
square contain fitting. Maximum zoom smoothly focuses a card within the same
2D map, keeping neighbors at 40% opacity. Any neighbor, including vertical or
diagonal, recenters; a settled centered card opens its details. Drag, wheel,
arrow keys, Enter, reduced motion and zoom-out preserve meaningful spatial
context. A screen-reader live label identifies the keyboard-focused object.
No-JavaScript source retains a readable product fallback, not an enhanced mode.

First arrival opens the info dialog immediately. Closing records a local
browser dismissal key shared by both languages; Info always reopens it. Storage
errors do not break browsing, though the intro may reappear on later visits
when storage is unavailable. This local preference is separate from shared
ownership. No backend/schema/data changes were made.

Tests pass for eight neighbor directions, real pointer/motion interruption,
zoom-out context, landscape vertical-neighbor visibility, reduced motion,
category/empty states, neighbor versus centered activation, first-visit and
remembered dismissal, unavailable storage, existing focus/navigation/contact,
tote/Studio and shared ownership regressions. Static package and bundled Worker
match the exact published source. Rendered browser/device and deployed API
verification remain unverified. GitHub writes are STILL HELD after cancellation.

Recovery patch `../2d1-nav-source.patch` includes all changes since canonical
base `3a9da3887b2433c51db042bbf71ed61f333b0b34`. Inspect local work first, run
`git apply --check` before applying, and reconcile manually if a checkout has
diverged. Never reset local edits or force-push. A fresh pull alone does not
include this patch while synchronization remains held.


## Local Finds catalog replacement — 9 October 2026

The owner requested replacement of all placeholder items with their Notion list.
24 entries are installed in `data/objects.json`, with verified images, proper
product/brand names, EN/JA descriptions and source credits. Mr. CONTAC (entry 13)
awaits the owner’s figurine image; the Mercari link is deleted. No guessed item
is shown. Twergi and Tinned Goods use one representative each: yellow ES19 and
Play. Full provenance and decisions: `docs/OBJECTS-SOURCES.md`. Old catalog/source
notes are archived in `_archive/placeholder-finds-2026-10-09/`. The chrome Anna G.
placeholder is replaced by the reference’s black variant with a new ID. Only
HAY Miz retains its existing ID; no ownership data is reassigned or deleted.
The backend allowlist derives from the catalog on local rebuild. GitHub/cloud/
production writes remain paused; this does not update the private cloud preview.


## Expanded Finds selections — 9 October 2026

The catalog now contains 56 items: the 24 Notion selections plus the owner’s
31 additional selections and the identified Mr. CONTAC phone-holding figure.
All have local source-credited images and English/Japanese descriptions.
MOODULO’s Pop Culture: Act II and Gift&Stock remain collection entries.
Mr. CONTAC uses the exact pose from a 1000 × 1250 retailer photo, not the
user’s attachment. Its sold-out listing and the waitlist-only Peepers use the
noninteractive “Not for sale” state. All prior product IDs remain unchanged.
See docs/OBJECTS-SOURCES.md for canonical pages, original image URLs and sizes.
Local builds update the Worker allowlist; no database migration is needed.
GitHub/cloud/production writes remain paused.


## Finds image fitting and colorways — 9 October 2026

All photographs now use centered contain fitting in square frames across canvas,
dialogs and no-JS views. Miz is Dark Green (0.72 L), Chroma Scissors is Primary,
and HAY Regn is Gray / Blue. These three variants use new IDs so previous
ownership marks are not reassigned. The previous catalog is preserved in
`_archive/finds-image-refinements-2026-10-09/objects-before.json`. Pikmin uses a
Nintendo shelf photo; Girard uses the official folded Orange / Fuchsia packshot.
Isabelle retains the clean 460 × 325 source because the researched alternatives
were either the same resolution or promotional collages. EN/JA rebuilt; checks
pass. GitHub/cloud/production writes remain paused.


## Latest local round: Finds product sheets

The product modal is now a bottom-opening 90%-width, 94dvh sheet. Desktop
details stay sticky while a flush full-width image stack scrolls; phones place
details before photographs. Inert gallery templates defer photo loading until
opening, reset on product changes and preserve EN/JA, source credits, native
modal focus return and existing ownership behavior. The canvas and info modal
are unchanged. 52 products have 2–5 verified photographs, with capacity for 7.
Remaining single-view items: Robi Boris, The Peepers, DAYPA-kun Backpack, Blue, Carbon Stack Signature Phone Case for iPhone 18 Pro. Additional matching images are needed;
do not substitute other variants or duplicate the hero photo to pad a gallery.
See data/objects.json and docs/OBJECTS-SOURCES.md for per-photo provenance.
GitHub writes and production deployment remain paused.

## Mr. CONTAC removal — 10 October 2026

Removed Mr. CONTAC from the active Finds catalog in both languages at the owner’s request. The collection now contains 55 items. Its entry and Japanese description are preserved in `_archive/removed-mr-contac-2026-10-10/entry.json`; photography and historical provenance remain available for restoration. Existing ownership records are untouched.


### 10 October — Finds photography refinement

Removed Isabelle (entry/translation archived). 55 active items remain. Twelve
main photos/artworks and 31 gallery photos use sharper authentic sources; all
product imagery has a light shared warm CSS grade. Full native cutout masters
and non-upscaled 480/960/1440/1920 derivatives serve both languages. See
`docs/FINDS-CUTOUTS.md` for sources, exact usable pixel dimensions, and the eight
remaining sub-800px source limitations. No GitHub write or deployment.

## GitHub checkpoint — 10 October 2026

The owner explicitly authorized pushing all current changes to `site-redesign`.
This checkpoint includes the revised Home/About typography and interactions,
55-item Finds catalog, transparent warm-treated imagery and responsive assets,
Robi Persi replacement, floating page/category menus, shared Sub Gray #807573,
Sand Gray #D6CEC5, section-focus transition fix, and hero click-to-intro.
English and Japanese are regenerated. `npm test` and `git diff --check` pass.
Tracked `.DS_Store` edits are excluded. No production or private-preview deployment
is part of this checkpoint. Future commits/pushes require new authorization.
