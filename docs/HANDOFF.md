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

No npm install, framework build, API key or backend is required. The local
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
  from the right at the same threshold. Both hide on returning to the hero. All viewport widths place Studio/Shop inline left of the centered logo and Connect right. The phone intro emerges after 25% less scroll distance; desktop motion is unchanged.
- Dark brown `#140B00` primary ink, Icon Red `#FF2B00`, beige `#FAF0E6`,
  Studio gray `#E0DCD7`. Square UI, local SC Walla, Noto Sans JP for Japanese.
- Shop render sits between the first and second description paragraphs.
  Specifications use 15px text, 8px row padding and a 16px note gap.
- Live tote follows the mouse; touch/pen horizontal dragging rotates it with ±135° stops and no momentum. Vertical swipes retain page scroll; hover/tap/keyboard X-ray is preserved.
- Connect input is 40px. No initial/focus footnote; submission truthfully says
  nothing was sent or saved. Contact is also unconnected. Do not add a backend.
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
