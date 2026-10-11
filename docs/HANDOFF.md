## GitHub source checkpoint for Codex continuation — 10 October 2026

The owner requested the complete source push and repair of the interrupted synchronization workflow. That continuation supersedes every earlier held-sync notice below. This checkpoint includes the latest private version35 code, all catalog/source assets, shared mobile navigation, mobile Category hiding and centered zoom, tests, provenance, and the reusable sync helper and guide in [GITHUB-SYNC.md](GITHUB-SYNC.md).

All176 image blobs are uploaded and verified against their exact local Git blob SHAs, including the largest8,829,006-byte file. Transfers use bounded local reads, one GitHub write at a time, and a durable per-file ledger. No GitHub authentication or repository-permission failure was established: the earlier batch exposed only an interruption, while a separate local stdout truncation problem is handled by the bounded-read helper. The original large-image approval completed successfully; subsequent sequential uploads succeeded.

The last verified branch base is6bd73072f24f1588b76274aede1bbc8a83d390eb. Finalization uses a fresh complete source snapshot, exact tree comparison, a non-forced expected-head lease, and remote/local readback; the resulting commit SHA is reported separately rather than embedded in itself. No GitHub Actions workflow or required branch check is configured. The application checks recorded below passed; the helper additionally reconstructed real small/large binaries with exact hashes and rejected stale/invalid reads. Browser/device and live API limits below still apply. This source checkpoint does not merge or deploy production or change data/access settings.

## Earlier GitHub synchronization interruption — 10 October 2026, 09:37 UTC (superseded)

After the owner's explicit09:32 push request, the resumed upload worker was interrupted again by automatic approval review after repeated rejections. Do not resume that worker or its blocked uploads/branch writes until the user explicitly confirms continuation. No final commit/ref update was reported; last verified remote remains6bd73072f24f1588b76274aede1bbc8a83d390eb. The private Site version35 is successfully live. Canonical source and refreshed binary recovery patch/ZIP preserve all changes. This newer block supersedes the in-progress sync status below.

## Mobile Finds controls and source-sync resumption — 10 October 2026

Mobile Category is hidden with display:none and its disclosure is inert. Crossing into phone/short coarse-pointer landscape closes the panel immediately, cancels stagger timers and moves focus from its controls to the still-visible zoom range. Returning to desktop restores Category availability without reopening it. The horizontal zoom slider is centered at the bottom safe area with a180px width cap; pinch and both language routes remain synchronized. Desktop controls retain their existing placement. CSS42 / finds-menus5.

Full npm test, bilingual build, whitespace and exact867-file archive comparison passed. Tests include initially-mobile state, open/closing desktop-to-mobile transitions, focus restoration, return to desktop, reduced motion, portrait/landscape safe-area geometry and existing pinch/menu/modal regression coverage. Browser/device rendering and live API verification remain unperformed. Archive268,339,200expanded bytes remains under256MiB. Source: `308d75ac2204b1c4325da2657bb6b1bed8094ef7`; archive `tmp/2d1-mobile-centered-zoom-2026-10-10.tar.gz`. Private version35 publication succeeded at09:35:50UTC: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/ . Deployment `appgdep_6aca06e05a94819199ad716a4b3876a9`; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_430e5b3e9fdc8191a27221e5bb6f5f04`.

The user explicitly requested pushing all changes for continued Codex work at09:32UTC (Sentinel_3e6c994cb1688191a9b036a106b372ef), lifting the prior source-sync hold. GitHub synchronization is in progress; the last verified remote base is6bd73072f24f1588b76274aede1bbc8a83d390eb. Do not interpret older held-sync statements below as a new cancellation. Never force-push or overwrite concurrent Codex work. Final sync status will be reported separately.

For Codex continuation: read AGENTS.md, README.md, this handoff and docs/PURCHASED-BACKEND.md. Use Node24/Python3, npm ci, npm test and npm run build:hosted. Visual preview: python3 scripts/preview.py on localhost:4173 (shared counts honestly unavailable). Full isolated local Worker: npm run db:local, then npm run preview:worker on localhost:8787, with separate local ownership data. No remote Wrangler deployment/database command. Catalog has78items with audit exceptions in docs/FINDS-AUDIT.md; APTONE stays pending matching frosted-body/neon-lid images. Preserve user changes, source provenance, native masters and all existing data/access settings.

## Finds hamburger visibility correction — 10 October 2026

Root cause: shared mobile panel/item CSS required an ancestor `.js` marker that Home and About set, but Finds does not. The hamburger controller opened correctly while its panel and desktop-staggered links remained hidden. Shared CSS now relies on `.mobile-navigation-ready`, which the controller sets on every supported page. No global class is added to Finds, avoiding unrelated Home-style activation. Mobile stylesheet cache3 is used on all six routes.

Full npm test and bilingual hosted build passed. Added assertions reject the missing-class dependency and verify open panel/item visibility, opacity, pointer access and transform declarations. Existing controller tests cover rapid close/reopen, Escape, outside click, focus, resize, reduced motion, Info and Contact sequencing. These are source/controller checks, not browser computed-style or rendered-device verification, which remains unavailable. All867 archive files match the tested build; expanded268,339,200bytes is under256MiB. Backend/data/access and prior catalog changes are preserved.

Site source: `a7ac9726205473b9a25c3b11558bbb13ca8555c6`. Archive: `tmp/2d1-menu-visibility-2026-10-10.tar.gz`. Private version34 publication succeeded at09:06:59UTC: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/ . Deployment `appgdep_6aca001d61f88191a0bd7922ae782954`; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_25c06fe1ffbc8191890d30ec52037ae4`. Recovery patch/ZIP refreshed after this checkpoint. GitHub writes remain held; canonical edits are uncommitted on6bd73072f24f1588b76274aede1bbc8a83d390eb. APTONE stays excluded pending matching photos.

## Home hero-to-intro spacing — 10 October 2026

Home adds 48px of top padding to main below 768px and 64px at larger widths. With existing intro section padding, the settled gap is 128px / 192px instead of 80px / 128px. Both English and Japanese use the same rule. Keeping this extra space outside the intro section preserves the existing cover factor and halfway word-reveal implementation; no animation JavaScript changed. Home CSS cache is47.

Full npm test, bilingual hosted build, whitespace and exact867-file archive comparison passed. Expanded archive268,339,200bytes remains under256MiB. Real browser/device rendering remains unverified. GitHub writes are still held; canonical source is uncommitted on6bd73072f24f1588b76274aede1bbc8a83d390eb. APTONE remains excluded until matching photos are found, per the user's explicit decision; never substitute the supplied reference image.

Archive: `tmp/2d1-hero-intro-space-2026-10-10.tar.gz`. Site source: `f1212fcc18cc42a36999766975515497822c48b2`. Private publication succeeded at08:00:50UTC: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/ . Deployment `appgdep_6ac9f08d1ff081918c406e891eaacfa4`; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_92b0c97ff53c8191bb5600e58473ce88`. Recovery patch and ZIP refreshed after this checkpoint.

## Latest catalog and shared-navigation checkpoint — 10 October2026, version32

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `6fc9018a07a815a73def5f8e9497a3cd4018998e`. Deployment `appgdep_6ac9e8826bc88191aa7ed24d06293eae` succeeded at07:26:23UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_39d29b3ff9e48191a6e6ea92e0944b14`.

Added Playdate (five official photos), KINTO Water Bottle300ml Clear (two matching photos), JOURNAL STANDARD FURNITURE Glass Cup & Saucer Gray006 (seven photos), and Topologie6.0mm Rope Strap NavyOrange (six selected photos). The latter three are reversible representative selections from multi-variant reference photos after the optional clarification window; see provenance for evidence qualifications. Air-Chair returns to explicitly requested red, with a newly corrected alpha-only cutout and two distinct red views. Original RGB/alpha comparison and light/dark QA passed. All originals and prior white assets remain preserved.

APTONE MIX&MATCH is NOT included: only the supplied photograph verifies its frosted-body finish. An exact-reference cutout/one-photo proposal is ready at `../finds-new-products/aptone/manifest.json`, held at the user's explicit request until matching product photos are found (10 October, Sentinel_caa97f0206008191a70570593532b28a). Do not substitute the reference photograph. Current clear-body retailer photos are excluded. If included later, credit as “User-supplied reference image”, not an unsupported claim of photographer ownership, and implement honest non-link source credit. KINTO further downloads were stopped after canceled approval review; do not retry those held downloads without authorization. Other completed source requests are preserved in sibling `../finds-new-products/` directories.

Mobile Home, About and Finds now use shared menu label styling, spacing, no dividers, staircase motion and EN/JA inside navigation. The original language node returns to each desktop location on resize; Home reveal and current-language markers remain valid. This supersedes version31 Info placement. Menu/logo/Info centerline, bottom-right slider and pinch remain. Across all six routes, future shared-element changes must stay consistent; AGENTS.md records this user design direction.

The mobile product-photo overlay is a noninteractive mono current/total count (e.g.1/4) at the image's bottom-right without background. Real totals exclude loop clones; swipe, half-photo taps, rapid motion, product reset and orientation stay synchronized. Settled announcements avoid repeats on equivalent-copy rebasing. Horizontal product pushes and fixed mobile footer remain.

Validation: full npm test, syntax/whitespace, bilingual build, actual reference/original/cutout inspection and exact867-file archive checks passed. Browser/device rendering and live API checks remain unverified. Source/package JS SHA256 `206131a34c9c19028f3c725c9328b1dd2ea794f3da94fe14dcf047c0de81595d`. Caches: objects CSS/JS41/25; mobile-nav CSS/JS2; finds-menus4; Home walla28. Expanded TAR268,339,200bytes is below256MiB by only96,256bytes; additions need more size headroom.15PNG→losslessWebP conversions saved10,102,356bytes with identical complete RGBA pixels/dimensions. Topologie uses smaller unmodified original JPEG galleries; Playdate in-hand remains full2500×2365. No source resolution was reduced in this integration.

Audit:78transparent primaries;58galleries within4–8;51also meet1200px file floor;20short galleries;15with smaller photos;31low-subject-detail primaries;40qualified/unresolved color histories. Updated Library report same ID `libfile_e87693a1995c8191a0d5364d7b75b17c`, version4. Archive `tmp/2d1-catalog-navigation-counter-2026-10-10.tar.gz`; recovery patch/ZIP refreshed. GitHub remains held pending explicit continuation after review rejection, all canonical changes uncommitted on base `6bd73072f24f1588b76274aede1bbc8a83d390eb`. No production/access/schema/data changes.

## Latest mobile controls placement — 10 October 2026, version 31

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `ccbfce9e270d916e216a2c9ded4e88b9685b6a1a`. Deployment `appgdep_6ac9e36fac048191becf54d7993558cd` succeeded at 07:04:37 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_9981ee90597c8191aa8b247fd2808247`.

Finds mobile EN/JA links now live in Info, using the same node and localized destinations. They return to the existing desktop location at the breakpoint. Info starts at the top on first visit/manual reopening, and moving a focused link into a closed dialog or out of an open modal redirects focus to the visible control in the active layer. The bottom-right corner now contains a compact horizontal minus/range/plus slider (180px cap, 44px endpoint targets); the old vertical mobile buttons are superseded. The range stays live/focusable across rotation and synchronized with canvas pinch. Desktop controls retain their placement.

Menu, horizontally centered logo and Info share one safe-area-aware 44px mobile top row and vertical centerline, including short coarse-pointer landscape. Narrow-screen slider sizing reserves space for Category; opening Category hides the slider as before.

Validation: full npm test, syntax/whitespace, bilingual build and exact archive comparison passed. Tests cover EN/JA routes, single language node/no-JS fallback, closed/open-modal breakpoint focus, repeated reopen and stale close, 320px Category separation, portrait/landscape centerlines, live range/pinch synchronization and interruption. All 837 asset/migration files plus the correct helper manifest match the build (838 files). JS SHA256: `3d21d6b89e0e68ed1497315eb876db279bfba0ecc9369632a2fc72530bb6b21c`. Actual browser/device layout and gestures remain unverified; geometry checks are source/controller based.

CSS/JS caches40/24. Archive: `tmp/2d1-mobile-language-slider-2026-10-10.tar.gz`. Recovery patch/ZIP refreshed. GitHub remains held, changes uncommitted on base `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Catalog, backend and private access unchanged.

## Latest canvas pinch zoom — 10 October 2026, version 30

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `641a9ebf4ee1e645ebc8861db18e5b2b9175ebf8`. Deployment `appgdep_6ac9e0a48f4881918111cb4063497c94` succeeded at 06:52:42 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_e7182e5f36b4819190dc2d58741c1420`.

Two-finger pinch/spread now continuously zooms the Finds canvas around the fingers' moving centroid, using the existing 0–100 scale. One-finger dragging transitions into and out of pinch without jumping. A stable scale baseline avoids endpoint drift from separately delivered pointer events. Zoom controls stay synchronized, with rounded accessible percentage copy and full geometric precision. At maximum, finger anchoring continues until the final finger lifts, then the nearest item centers. Third fingers pause and safely rebase; cancellation, capture loss, orientation/resize, modal opening, controls, keyboard and hidden-tab interruptions clear the gesture. Compatibility clicks after pinch cannot open a product. Native photo and browser zoom outside the canvas remain available.

Validation: full npm test, syntax/whitespace, independent review, bilingual build and exact archive comparison passed. Production-controller tests cover 20 width/language/motion combinations, moving centroid, 1→2→1, both endpoint event orders, max-to-zoom-out continuity, focus settling, third fingers, capture failure, zero distance, interruptions and control/photo isolation. All 837 asset/migration files match the build plus the unchanged helper hosting manifest (838 files total). JS SHA256: `4579edad6697317a9d9ea4812270e07da094b3edbea729075d548ad428f7877d`. Browser/device gesture rendering and live API checks remain unverified.

JS cache23; CSS39 unchanged. Archive: `tmp/2d1-canvas-pinch-2026-10-10.tar.gz`. Recovery patch/ZIP refreshed. GitHub remains held and canonical changes uncommitted on base `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Catalog, backend data/schema and private access are unchanged.

## Latest horizontal product push — 10 October 2026, version 29

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `165b2d331304937e0978933d5cfac0d861bef8f3`. Deployment `appgdep_6ac9d6267d7c81919a5e1b24b49cb693` succeeded at 06:07:57 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_09c76c0115c88191af14cb5d89c3efa0`.

Product navigation now uses a coordinated horizontal push on every viewport. Next enters from the right while the current full-size card exits left; previous reverses. Both cards travel exactly one sheet width over the same 640ms timeline, with no scaling, folding, rotation or fading. This supersedes vertical rolodex instructions below. Desktop previews and mobile footer arrows both allow immediate reversal; the mobile 95dvh sheet footer and Close remain stationary. Photo-carousel motion, square cover frames, ownership generation, background-free pagination and Soft Beige focus behavior remain separate.

Validation: full npm test, JavaScript syntax, whitespace, bilingual hosted build and exact archive verification passed. Tests cover five viewport widths, touching card edges and equal timing, rapid next/previous reversal, canceled/closed/resized transitions, live reduced-motion changes, sanitized inert outgoing copies, focus, photo resets and stale ownership responses. All 837 asset/migration files match the build; the helper-generated hosting manifest retains this project and DB binding (838 total files). Source/package JS SHA256: `f9a113e68bdabdf76d765cccb32e27ca02b9530eb0805d6bf3738a5ec79c47df`. Real browser/device rendering and live API checks remain unverified.

CSS/JS cache versions are 39/22. Archive: `tmp/2d1-horizontal-product-push-2026-10-10.tar.gz`. Recovery patch/ZIP refreshed. Canonical GitHub source remains uncommitted on base `6bd73072f24f1588b76274aede1bbc8a83d390eb`; GitHub writes remain held pending explicit continuation approval. Catalog, database and access are unchanged.

## Latest mobile product sheet — 10 October 2026, version 28

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `462f217b13e1a1d9cd4f60d7236e2834e44b47d3`. Deployment `appgdep_6ac9d3d907b8819196d94948f8a3a475` succeeded at 05:58:06 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_6e870e425d148191a03f447d7075a46b`. Version 27 was the immediately superseded initial sheet package.

Mobile Finds product details now occupy the full viewport width and 95dvh, anchored to the bottom. The top/bottom preview controls are hidden on mobile. The primary Visit product page CTA (or honest Not for sale state) moves into a stationary footer with wrapping previous/next PRODUCT arrows; I have it, shared counts, description and credits remain in the scrolling content. The footer is a non-scrolling grid row with safe-area padding, so long content cannot cover it. Its single live action wrapper moves back to the desktop copy column on rotation. Footer controls do not join the rolling sheet animation. Desktop preview navigation is preserved.

Photo indicators retain their in-image position but have no background, border or shadow. Normal squares are 8px on a 24px pitch (16px visual gap, previously 22px), with separate 24×44px targets. Selected squares stay red; keyboard focus enlarges a square without adding a backplate or outline. Native infinite swiping, clean image-half taps and direct indicator selection remain. CSS/JS caches are 38/21 and Japanese dictionary cache 9.

Validation: full npm test, bilingual generation/build, syntax/whitespace and exact 838-file package comparison passed. Tests cover footer CTA/availability, old ownership-response isolation, 1/2/8 photos, category wrapping/singletons, 11 rapid navigation steps, interrupted rolls/close, same-breakpoint orientation cleanup, desktop restoration and focus. The final source/package JS SHA256 is `717086bed86784627ea5f841f6660bc510bfb3390984fb00b247a8c734eb15a8`; expanded payload remains 254.97 MiB. Real browser/device layout, long-text rendering and live API checks remain unverified. GitHub writes remain held, local base `6bd73072f24f1588b76274aede1bbc8a83d390eb`; recovery patch/ZIP refreshed. No catalog/database changes.

## Latest photo tap refinement — 10 October 2026, version 26

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `49c90786f3cfff18eae0566f604f2f7f09244c78`. Deployment `appgdep_6ac9cf0d316481918680492c5e816615` succeeded at 05:37:39 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_fcaf4d8f1bbc8191814080c61eda08e6`.

Square pagination now overlays the bottom of the square mobile photo, on a compact solid-white, black-bordered strip. Visible photo arrows and the hint row are removed. A clean tap/click on the left half selects the previous photo; the right half selects the next. Indicator buttons select their own photo without bubbling into image advance. Native horizontal swiping and bidirectional looping remain.

Passive pointer/touch tracking rejects swipe, vertical movement, pinch, wheel, cancellation and resulting compatibility clicks. It supports Touch/Pointer start and end order in either sequence and legacy touch-only taps. Single-photo galleries remain noninteractive with no misleading controls. ArrowLeft/ArrowRight/Home/End and localized instructions remain available for keyboard access; region focus changes the pagination background rather than tinting transparent photos. Square cover fitting, mobile zoom, icon-only Close and the beige canvas fix are preserved. CSS/JS caches are 36/19 and Japanese dictionary cache 8.

Validation: full npm test, syntax/whitespace, bilingual generation/build and exact 838-file package comparison passed. Tests cover 1/2/8 photos, both halves, mouse/touch/legacy input, both Touch/Pointer event orders, indicator bubbling, interrupted commands, pinch/vertical/drag cancellation and compatibility-click suppression. Expanded payload is 254.97 MiB. Browser/device and live API verification remain unavailable; these are controller/source checks. GitHub writes remain held, with local base `6bd73072f24f1588b76274aede1bbc8a83d390eb`; recovery patch/ZIP refreshed. No catalog or database changes.

## Latest photo controls and canvas correction — 10 October 2026, version 25

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `d0d71eb3d4516e1496c5e378b6ee26c212645476`. Deployment `appgdep_6ac9c76cd7088191a85d62f034c6a2f5` succeeded at 05:05:04 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_e00c54c1f3148191935ed3b9b151020f`.

Mobile product photos now loop in both directions using native horizontal scrolling and equivalent duplicate sets. A small swipe/tap hint, square pagination and separate previous/next photo controls appear only for multi-photo mobile galleries. Duplicates use the same URLs and are inert/hidden from assistive technology. Real touch IDs prevent an iOS-style pointer-cancel takeover from triggering a rebase while fingers remain down; product changes and closure invalidate pending callbacks. Desktop keeps stacked photos. Detail images now fill their square frames with object-fit:cover (owner-approved cropping); canvas cutouts retain contain fitting. This supersedes the version 24 detail contain instruction.

Finds product/Info Close buttons are icon-only with localized accessible names and 44px targets. Mobile zoom has + above − on the right above EN/JA, in 25-point steps through the full 0–100 range. The mobile slider is hidden, disabled and nonfocusable; desktop retains its slider and 10-point buttons. Orientation updates focus and layout safely.

The reported dark canvas after modal close traced to the shared focus-visible rule: restoring focus to the full-viewport tabindex canvas applied Sand Gray. Its focused background now explicitly remains Soft Beige; the centered tile caption provides a small red keyboard cue instead. Native backdrop closure and rolodex cleanup were reviewed separately.

A queued-close rapid-reopen regression also exposed stale cleanup cancelling fresh photo state and stealing focus. Product and Info close handlers now ignore stale close events after reopening, and a fresh closed-to-open product transition clears old rolodex state.

Validation: full npm test, generation/build, syntax/whitespace and exact 838-file package comparison passed. Production-controller tests cover 1/2/8 photos, both seams and repeated swipes/taps/keys, touch takeover/pinch, interrupted settling, product resets, reduced motion, orientation focus, zoom endpoints, dismissal and rapid reopen. Expanded payload is 254.96 MiB. CSS/JS caches are 35/18 and Japanese dictionary cache 7. Browser/compositor/device and live authenticated API checks remain unverified. GitHub synchronization remains paused; all current source changes and refreshed recovery patch/ZIP are preserved on local base `6bd73072f24f1588b76274aede1bbc8a83d390eb`. No catalog or database data changed in this update.

## Latest combined refinement — 10 October 2026, version 24

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `03dc528ea3387559a20f0764f68715a2ce56b061`. Deployment `appgdep_6ac9c26636d881919e8169cbc7d3f6eb` succeeded at 04:43:39 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_97868274e9588191b0acb6d0ec8851f6`.

Added Heinz Tomato Ketchup: exact owner-linked 32 oz inverted squeeze bottle, GTIN 00013000006057, in Kitchen. Eight matching classic-label views: official 2400px transparent primary and seven native 2200px retailer photographs. Metadata’s different 20 oz SKU and commemorative-label alternatives were excluded. Catalog now has 74 transparent primaries; 56 galleries meet 4–8 photos and 49 also pass the 1200px file-size floor. The prior 18 short galleries and 38 qualified color histories remain.

Mobile navigation is a hamburger disclosure on Home, About and Finds in both languages, including short coarse-pointer phone landscape. It retains each menu’s typography, grouping, dividers, red-square feedback and sequential item motion; desktop navigation and logo positions remain. Home’s trigger follows the existing reveal threshold. Menus close on selection, outside interaction, Escape and history traversal. Contact focus return remains valid after orientation changes.

Finds detail-photo frames are now square (1:1) with contain fitting on all viewport sizes. Mobile keeps its horizontal photo carousel; the sheet may scroll vertically, superseding version 22’s remaining-height photo sizing. Product navigation and ownership interactions remain separate.

Validation: full npm test, both-language generation, hosted build, native photo/source inspection and exact 838-file package comparison passed. The first archive exceeded the 256 MiB expanded limit; the corrected package is 254.95 MiB expanded, with a full-resolution quality-100 Heinz web derivative and retained original/lossless master. No existing product imagery changed. Real browser/device layout and live authenticated ownership API were not verified. GitHub writes remain paused; the attempted read-only remote check was cancelled by automatic approval review and not retried. Canonical local base remains `6bd73072f24f1588b76274aede1bbc8a83d390eb`, with all source edits preserved. Recovery patch/ZIP refreshed. The same Library photo-audit report is version 3.

## Latest tote specification checkpoint — 10 October 2026, version 23

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/
Site source: `6de2a7d30cc861226f4b7bded49e5c90e918d186`. Deployment `appgdep_6ac9b57d6bb0819189ac64920f79a4c6` succeeded at 03:48:34 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_e0b8fc8a4cc88191b1ab7412e896167d`.

Added the owner-supplied “Origin — Made in Japan” specification to the Shop tote using its existing definition-list styling; Japanese reads “生産国 — 日本製”. All version 22 changes remain. Build, npm test, whitespace and exact 825-file package comparison passed; both packaged Home pages contain the correct specification. Browser/device layout was not re-verified. GitHub writes remain paused; the read-only branch check still returned `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Recovery patch/archive refreshed for the current source.

## Latest mobile gallery checkpoint — 10 October 2026, version 22

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `e362f779a83130c6ce721b515584f675eda10ac2`. Deployment `appgdep_6ac9b3612de08191a2066696522382d4` succeeded at 03:39:33 UTC; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_7e425ee60c388191be9151a5b5cb14c5`.

Phone product photos now form a native horizontal scroll-snap gallery with full-image contain fitting, including coarse-pointer landscape phones below 1024px wide/500px high. The photo row takes remaining height above details with a 144px minimum. Long text and small screens retain vertical sheet overflow instead of clipping. Safe-area insets protect the sheet and Close control. Desktop keeps its stacked photographs.

Keyboard Left/Right/Home/End controls the focused multi-photo region; modified shortcuts retain browser behavior. EN/JA names and instructions are localized. Product switches reset to photo 1, and outgoing rolodex ghosts preserve their former photo position. Product navigation and ownership state are independent from photo browsing. CSS/JS cache versions are 33/17; the Japanese dictionary is version 6.

Validation: npm test, hosted build, syntax/whitespace and exact 825-file package comparison passed. The archive is 249.1 MiB. Tests cover eight photos, paging bounds/repetition, modifier and desktop guards, responsive width changes, localization, single-photo focus, product-change resets and outgoing animation position. Real mobile touch/layout and deployed API checks remain unverified. GitHub writes remain paused pending continuation confirmation after the earlier automatic review rejection. The prior frozen source/recovery patch has been refreshed for this update; catalog and audit counts below are unchanged.

## Current cloud checkpoint — 10 October 2026, version 21

Private preview: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/
Site source: `a5efd16c765fa8fe3f0c9b710b25217e587d1b02`. Deployment succeeded at 03:24:36 UTC. The source checkout is based on GitHub `6bd73072f24f1588b76274aede1bbc8a83d390eb` with uncommitted refinements. GitHub sync was approved, then stopped by automatic approval review during image-blob uploads; continuation confirmation is pending. No branch commit/ref was changed. Do not assume GitHub contains version 21.

Completed: 73 transparent canvas primaries; exact selected BAGGU and third-carousel Anya photo; authentic studio/lifestyle galleries; historically supported color corrections; color-free titles; product above brand in canvas captions; per-load brand-aware shuffle stable within each visit; rolodex product navigation; staircase menus; Familiar Characters linked to Finds; halfway-slower reading reveal with the intro entrance preserved.

Audit: 55 galleries have 4–8 photos, 48 also pass the 1200px file-dimension floor, 18 lack four photos, 14 contain smaller gallery photos, 29 primary sources have limited native subject detail, and 38 color histories remain qualified/unresolved. See FINDS-AUDIT.md/.json. Never fabricate, duplicate or upscale missing views. Conventional pixel-preserving primary masks are approved; keep lifestyle backgrounds.

Validation: automated interaction/backend tests, bilingual generation, build, local asset references and exact 825-file package alignment passed. The 249.1 MiB archive deployed successfully. Only the automatically captured Home landing frame and image cutouts were visually inspected; interactive browser/device and live ownership API checks remain unverified. Packaging excludes unused catalog images and font formats while source retains them. Run `npm test`, `npm run build:hosted`; static local preview is `python3 scripts/preview.py` on port 4173. Use PURCHASED-BACKEND.md for the local Worker/database.

Recovery: `tmp/2d1-finds-recovery/changes.patch`, base above; run `git apply --check` before applying and preserve concurrent work. GitHub image-upload ledger is `../github-finds-sync-ledger.json` (35 of 112 confirmed at the pause). No credentials are persisted. Further historical-source or gallery exceptions are documented; current requested UI work is live. The older chronological notes below are superseded where they conflict.

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


## Collaboration checkpoint — 10 October 2026, 72 Finds

The owner authorized committing and pushing all accumulated updates after the
previous `6862f32` checkpoint so Saul can continue on `site-redesign`. This
section supersedes older gallery-layout and catalog-count notes above.

- Finds has 72 entries, EN/JA descriptions, local source-credited galleries,
  transparent cutouts, and responsive assets. The Boby is Paprika; Provence
  metadata is archived. Plastic, Girotondo, and Watches each have one selected
  representative: Magic Bunny, Girotondo Round Tray, and Alessi Ray.
- Canvas starts at minimum zoom. Labels appear at 50% with a small entrance
  animation; −/+ buttons operate zoom. Canvas captions are centered.
- Floating labels, padding, and border weight match. Page-nav dividers and
  item hover effects are removed; the Home-trigger menu reveal remains.
- Product details use two columns on desktop: vertically stacked photos left,
  sticky details right. Phones stack photos and details. Previous/next cards
  above and below switch products within the active category via a vertical
  transition. No horizontal image carousel.
- Info is a white, content-sized floating card on the right, with contact-card
  margins and a 40% scrim. It slides DOWN from ABOVE over 720ms; reduced motion
  is instant. First-visit dismissal behavior is unchanged.
- Home intro ink reveal now finishes the first line at hero edge=70vh, then
  reveals the remaining words continuously instead of snapping the block on.

Continue from a fresh fetch of `site-redesign`; preserve concurrent local work.
Read AGENTS.md and README.md before editing. Edit data/objects.json and
locales/ja.json for catalog changes; run the Objects and Japanese generators.
Use docs/OBJECTS-SOURCES.md for photograph provenance and selected variants.

Validation: npm test, bilingual generation, local hosted-package build, and
git diff --check. Browser checks covered the info card at 390, 768, 1280,
1440, and 1920px, plus new product details on phone/desktop.

Local layout preview: `python3 scripts/preview.py` at http://127.0.0.1:4173/.
The static preview cannot serve shared ownership counts. For the local Worker
and isolated database, follow docs/PURCHASED-BACKEND.md. No hosted votes, schema,
backend configuration, production deployment, or private cloud publication were
changed. GitHub source synchronization alone does not update chatgpt.site.
Tracked .DS_Store changes stay local and are excluded. Future commits/pushes
require fresh authorization.


## 10 October cloud BAGGU and menu refinement

Source base: `6bd73072f24f1588b76274aede1bbc8a83d390eb` (latest Codex branch fetched and fast-forwarded before changes). All 71 retained catalog entries are unchanged. Added BAGGU Standard Baggu, Pop Pink Happy matching the supplied screenshot, with three official original 2048×2560 photographs. Removed Ray, White Dial from active EN/JA catalog; entry/translations are archived and old images/ownership rows remain. The catalog remains 72 items. BAGGU retains its original pale photographic background to preserve exact print/color fidelity; other cutouts and native image derivatives are unchanged.

Finds page-nav and Category menu items enter top-to-bottom with a 44ms stagger and 260ms fade/16px translation, and exit in reverse. Closed/closing panels are inert immediately; rapid reopen cancels pending close, Escape restores focus, touch Home behavior remains, and reduced-motion changes are supported. CSS cache version30 and menu JS version2.

Validation: npm test (including menu lifecycle/interruption tests), hosted Worker/static package build, and git diff --check passed. Image files/variant were visually inspected. Rendered browser QA remains blocked by the cloud socket restriction; no live authenticated ownership API verification was performed. Backend/schema are unchanged; the bundled product allowlist reflects the catalog update.

GitHub writes remain held following the earlier cancellation. These changes are local and uncommitted on top of the SHA above; do not claim they are available by pulling GitHub. Private preview publishing result and recovery bundle are recorded below once verified.

Private publication verified 2026-10-10 02:23:47 UTC: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site . Deployment `appgdep_6ac9a17e35fc819198a7fe0c549841ed` succeeded; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_fe384c522934819180d297f0ba65edb8`; Site source `0bac12e28bb1edd9513505cef33ca990f5f4fd01`. All 988 packaged files match the tested build byte-for-byte. This is owner-private Sites publication, not a GitHub branch push or production-domain change.

Recovery: `tmp/2d1-baggu-menu-recovery/changes.patch` includes tracked edits and all new binary photos/archives, based on `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Bundle: `tmp/2d1-baggu-menu-recovery.zip`. Apply only after `git apply --check` in a clean checkout of that base; reconcile newer work rather than overwrite it.


## 10 October catalog audit and rolodex, partial checkpoint

Latest GitHub branch rechecked read-only: still `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Preserve all local uncommitted v19 refinements. GitHub writes remain held after cancellation.

Implemented rolodex detail navigation (bottom rolls up, top down), selected-preview expansion, outgoing scroll preservation, inert visual ghosts, immediate ownership-generation switch, interruption cleanup and reduced motion. Product display names omit color with full variant labels retained internally. Home intro underlines Familiar Characters as plain text in EN/JA.

All72 products have source-review records. Integrated31 unmodified native studio/product files; Natural Tripp Trapp uses an official transparent3000px original, confirmed by Stokke as the first finish. Product IDs and ownership rows remain stable. A full pre-integration catalog is preserved in `_archive/pre-finds-audit-2026-10-10/objects.json`. Sources are in `docs/FINDS-SOURCE-REVIEW.json`; current checks are in `docs/FINDS-AUDIT.md` and `.json`; future additions follow `docs/FINDS-CATALOG-PROCESS.md`.

Partial audit state:42 of72 galleries have4–8 entries;30 remain below4;19 include at least one image below1200px native long edge;31 meet both count and dimension checks. These numeric checks do not certify distinctness, meaningful subject resolution, or original/iconic color history.71 primary images have transparency. Existing retained cutouts use the shared grade; new images are not upscaled.

Pending decisions: BAGGU conventional pixel-preserving masking (two generated extractions rejected for changed detail); whether gallery lifestyle/in-use images should retain their setting; approval retries for canceled public-source retrievals. Verified contextual candidates and source proposals persist under `/workspace/shared/finds-audit/{first,middle,last}/`; do not repeat denied retrievals or infer approval from silence. Flowerpot Mustard launch-color candidate needs an accurate transparent primary before coordinated replacement.

Tests pass, including direction/geometry, repeated taps, close cleanup, focus, reduced motion and ownership response isolation. Browser visual QA remains blocked by the existing cloud socket restriction. No live authenticated API test or backend/schema change. Private checkpoint publication result follows below.

Partial checkpoint deployed successfully at2026-10-10 02:52:19 UTC: Site source `0fdda95d820a8053452106879c9c6a6855c0958d`, saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_224fb09ae8cc8191975cb41216ac385c`, deployment `appgdep_6ac9a83edcf08191acf380f58a864822`.

Subsequently the owner explicitly approved keeping gallery lifestyle/in-use settings, conventional pixel-preserving BAGGU masking, and retrying held public image retrievals. These do not authorize GitHub writes. BAGGU masking was completed with exact RGB preservation and accepted visual QA; contextual proposals are now integrated for the next checkpoint. The earlier pending-gallery/mask statements describe the partial checkpoint only.


## 10 October — transparent photography and catalog follow-through

BAGGU Pop Pink Happy now uses an owner-approved conventional alpha mask that preserves every retained original RGB pixel. Added Anya Hindmarch Eyes Tote using exactly the third official carousel image (open mouth pocket) as its transparent primary, with seven authentic original gallery photographs. Both selected variants are explicit owner exceptions to the launch/iconic-color preference. Higher-resolution native primaries also replace the Dusen clock and yellow Twergi mill; master-pixel comparison and edge QA are recorded in the matching mask reports. All73 primary images now have transparency; this does not mean every source has sufficient native product detail.

Lifestyle/in-use gallery settings are retained as requested. Verified studio and contextual additions bring53 of73 galleries to4–8 distinct photos;46 also pass the1200px native-file long-edge check.20 remain below4. Genuine source-resolution and historical-color gaps are itemized in docs/FINDS-AUDIT.json/.md; no images were invented, duplicated, or enlarged to meet a count. Source history now has dedicated middle/last-range evidence records, distinguishing proof from inference. Current Air-Chair Red1825C, Boby Paprika and VP9 ZestyOrange are later colors; matching historical replacements are under review and are not silently mislabeled as originals.

Canvas captions place product name above brand in both locales, preserving typography and the minimum-zoom hidden state. Modal title/brand positions are unchanged. The prior rolodex transition, color-free display names, Home intro underline, and staircase menus remain included.

The owner approved conventional pixel-preserving catalog masking going forward, with before/after geometry, color, edge and transparency checks. Keep originals, exact source links, native usable dimensions and QA records. Gallery photos retain their real setting.

GitHub writes are still HELD; current work is uncommitted on base6bd73072f24f1588b76274aede1bbc8a83d390eb. The private Site publishing workflow is separately authorized. Do not push GitHub or imply pulling it includes this work. Backend configuration, schema and stored ownership rows are unchanged; rebuilding updates the product allowlist for the new entry. Real browser/device QA and authenticated deployed API checks remain unverified because the existing cloud browser restriction was not bypassed.


Latest interaction additions: the underlined Familiar Characters phrase is a real same-tab Finds link; relative objects/ resolves to /objects/ and /ja/objects/ respectively. Reading-ink wrapping preserves the anchor. Each fresh Finds document generates a randomized brand-aware canvas order, scoring the actual horizontal/vertical/diagonal repeating-grid offsets. All and each category keep their own fixed permutation for that visit, including modal navigation. The heuristic reduces brand clusters without dropping any product or changing IDs. Seeded tests cover24 catalog permutations, dominant brands, tiny sets and order stability; JavaScript cache version16.


GitHub authorization update,10 October2026 03:09UTC: the owner explicitly approved GitHub sync. The previous hold is lifted. Fetch site-redesign, preserve concurrent changes, commit/push the completed source safely without force, and verify its remote SHA. Production deployment/merge and access changes remain outside this approval. The actual source-sync result is recorded after verification.


The owner requested a halfway pace for paragraph word reveals. Current6bd7307 and6862f32 both finished at50vh; the earlier3a9da38 implementation used min(25vh,70vh − block height). The new finish is their exact midpoint: min(37.5vh,60vh − half the block height). Short paragraphs reveal over47.5vh rather than35vh (old slower60vh). Intro first-line completion at70vh and hero/mobile entrance logic are preserved. Reading-ink cache version6; focused controller tests cover reflow, reverse scroll, reduced motion and completion.


## Final10 October photographic checkpoint

The catalog contains73 entries. All73 primary images have real transparency.55 galleries contain4–8 distinct authentic images;48 also pass the1200px long-edge file-dimension floor.18 galleries remain below4;14 include at least one smaller image.29 primary sources have less than1200px of actual subject detail. These are disclosed source limitations, not fabricated/upscaled passes. Perceptual near-pair warnings for seven products were visually reviewed against29 originals: genuine angles, mechanisms, lighting states and details, no duplicate removals required. Hash-bound review results are preserved in docs/FINDS-DISTINCTNESS-REVIEW.json.

Historical corrections are now installed coherently: Air-Chair White1730C (five views; documented early designer/manufacturer presentation, not a claim of sole launch color), Flowerpot VP9 Mustard (four views; one of the original2020 colors, contextual fourth image has small lamps), and classic-red Boby B34 (exact four-drawer configuration, one verified1200×900 photo with447×646 subject detail). Product IDs retain their old color suffixes to preserve ownership association; display names omit color. Earlier notes saying these corrections were pending are superseded. Original photos and removed selections remain recoverable.

One Nintendo source PNG was51.4MB and one Stokke PNG25.1MB, exceeding publication source-object limits. Stokke now uses pixel-identical native lossless WebP. Nintendo uses a3840×2561 web derivative of its7659×5108 original, lossless after downsampling; full original and native lossless encoding are retained in /workspace/shared/finds-audit/source-originals. No enlargement or generated replacement was used. Every packaged file is below10MiB.

The final application build contains1097 files and passes source/package byte checks, npm test and git diff --check. It includes the slower midpoint reading reveal, clickable underlined Familiar Characters link, fresh brand-aware per-load canvas orders, product-above-brand captions, Anya/BAGGU cutouts, all gallery work, rolodex and staircase menus. Only image pixels were visually reviewed; live rendered browser/device and authenticated deployed API checks were not performed. Shared data/schema/access remain unchanged.


Packaging correction: the host enforces256MiB archive and per-object limits. scripts/build-preview.py now includes only active catalog image/gallery/srcset files and fonts referenced by CSS, while retaining all original/retired source files in the repository. The final static package is252.6MiB before compression; catalog/font presence is asserted during build. Previous1097-file/raw288MiB attempt was rejected before saving a version; it is not a live deployment.


Private publication succeeded10 October2026 at03:24:36UTC: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/ . Site source `a5efd16c765fa8fe3f0c9b710b25217e587d1b02`; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_e423d3cddc5881918142fb956792f0e2`; deployment `appgdep_6ac9afd3e2308191aaf0f9681e9f7120`.825 packaged files match the tested build; archive249.1MiB. Publication checkout is tmp/hosted-preview-refinements. Prior oversized attempts were not live versions.

GitHub synchronization remains unfinished despite the owner's03:09UTC approval: the upload worker was interrupted after three automatic approval rejections.35 of112 immutable image blobs are confirmed uploaded, but no final tree/commit/ref update was performed. Remote site-redesign remains `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Do not resume blocked source writes until the owner confirms continuation. Resumable SHA ledger: ../github-finds-sync-ledger.json. Keep this technical transfer state separate from the successfully deployed private Site.

Recovery patch: tmp/2d1-finds-recovery/changes.patch, based on6bd73072f24f1588b76274aede1bbc8a83d390eb, includes new binary/text assets and tracked changes. It is verified by git apply --reverse --check against this checkout. Inspect/reconcile local work and run git apply --check before applying elsewhere. No credentials are included. The current per-product audit was also replaced at its existing Library identity, libfile_e87693a1995c8191a0d5364d7b75b17c, version1.


## Mobile product photographs — 10 October 2026

The Finds product dialog uses a native horizontal scroll-snap photo strip on phones, including short coarse-pointer landscape viewports. Images retain their complete proportions with contain fitting. The gallery uses the remaining sheet height above the details, with a144px minimum; long descriptions or short screens retain vertical sheet scrolling instead of clipping content. Desktop keeps its stacked gallery.

Arrow Left/Right and Home/End page through photos when the gallery has keyboard focus; modified shortcuts keep browser behavior. The gallery is a localized, named region and is focusable only for a multi-photo mobile strip. Horizontal photo browsing never changes the product or ownership state. Opening/switching a product resets to photo1; the outgoing rolodex clone preserves its current horizontal photo position. Native touch/scroll-snap and pinch zoom handle swipes without custom pointer capture.

Checks cover eight images, repeated paging, bounds, responsive width changes, EN/JA labels, single-photo focus, product replacement/reset, reduced motion and outgoing-animation position. Actual mobile browser swipes/rendering remain unverified under the existing browser restriction. CSS/JS cache versions33/17; Japanese dictionary version6. GitHub continuation remains paused pending explicit approval after automatic review rejection.

## 11 October 2026 — collaboration checkpoint for Saul

Owner authorized committing and pushing the current site-redesign checkpoint. Includes the 98-product Finds catalog/image refinements, shared typography system, Home layout/signup/navigation changes, contact categories and placeholders, dark Studio scene (Ash Brown #191416), and cheerful Finds product entrance. Mono predecessor remains in _archive/pre-walla-sans-2026-10-11/. Current palette is docs/COLOR-LIBRARY.md; typography is css/typography.css.

Validation: hosted/private preview build passes (958 files); purchased backend checks pass. Full npm test is not green: mobile-nav fixture still expects Home's removed hamburger/inert panel, and reading-ink integration fixture still expects the prior reveal completion at its old sample position. Calmer reveal range checks pass. Earlier Objects focus regression was also reported; recheck after fixture updates. No production publication requested or performed. Contact/signup remain unconnected. .DS_Store changes excluded.
