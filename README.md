# 2D1 — Familiar characters

Independent design house working across brands, digital products, and ideas.

## Preview

Run `python3 scripts/preview.py`, then open http://localhost:4173. The preview sends a noindex header. There is no build step or package installation.

## Current design — 9 October, Figma 298:650

Source: [Website 2026 / updated Home](https://www.figma.com/design/z1J8lyfvwOqtHpQqfNin3x/Website-2026?node-id=298-650).

Home follows the updated single-column frame: a viewport-height, borderless hero → introduction and More about us → Studio → Shop → Connect and social links → copyright. Community, Relationship Advice, its page anchor and profile popup are removed from both languages. Their source is preserved in `_archive/pre-cover-2026-10-09/`; `js/profile.js` is dormant.

The shared column remains capped at 960px, with a 128px desktop right gutter and left inset scaling toward 400px. Phone/tablet side insets are 24px. Desktop section padding is 128px and content gaps are 96px; Studio’s heading-to-description gap and final text/service/CTA gaps are 64px. Phones use 80px section padding and 64px gaps. English uses local Walla Bold 64px section headings, Medium 40px/48px descriptions, services, subtitles and CTAs. Phone headings are 44px and reading text is 28px/1.2. Subtitles, service details and supporting text share Sub Gray #807573 (`--sub-gray`), including contact helper text and Finds metadata and zoom track. Japanese retains Noto Sans JP at a native 24px/28px reading scale. The previous mono section labels and rules have been replaced by the heading/subtitle pairs shown in Figma; the page anchors retain their previous appearance and animation.

The intro keeps its two paragraphs and scroll-driven reading ink. Studio uses “Clear ideas, with character.” and the owner’s revised three-paragraph description (the first above the artwork, the remaining two below), a full-width strip of 280px square artwork, stacked service names/details, and Get in touch at the end. Shop uses the revised subtitle and the owner’s three-paragraph description. The transparent live tote sits between the opening “The joy of making…” paragraph and “The tote bag is our first everyday item…”. The remaining description is followed by prototype specifications and the notification CTA. Connect adds the supplied subtitle and a 40px email field at every width and in both languages. About keeps its existing essay and short-version/expand interaction without a hero.

The active site’s primary ink is dark brown `#320505`, replacing black text, rules, icons, control fills and the dialog scrim. Input and textarea carets use the same brown. Muted gray supporting text, supplied project imagery and the black-canvas product render retain their intended colors.

## Languages

English is the default at `/` and `/about/`. A fixed, square EN / JA switch in the bottom-right links directly to the equivalent page in the other language. Japanese lives at `/ja/` and `/ja/about/`; internal About links retain the selected language. No browser-language redirect, cookies, or local storage are used. On Home, the switch stays hidden and inert during the landing animation and hero. It appears with the page anchors, fading and sliding in from the right over 480ms, and reverses on return to the hero. Reduced motion changes visibility instantly. About keeps the switch visible. Without JavaScript, Home places the language links at the page end; all translated pages remain accessible.

Japanese uses locally hosted Noto Sans JP (variable weights 400–700), an open-source font used by Japan’s Digital Agency. Its unmodified Unicode subsets load only as needed, with native Japanese fonts as fallbacks. License and provenance are in `fonts/Noto Sans JP/OFL.txt` and `SOURCE.txt`. English retains SC Walla. Japanese has adjusted line height and line breaking for readability.

Edit English HTML and `locales/ja.json`, then run `python3 scripts/build-japanese.py` to regenerate the Japanese HTML and `js/ja.js`. This is an editing helper, not a deployment build: all four pages are static HTML. `js/language.js` translates injected contact UI, validation, and status messages. Alt text, accessible names, page titles, metadata, and language links are localized too. Font source: https://design.digital.go.jp/dads/foundations/typography/

## Interactions

- A fixed top-left section index, with a transparent background, appears after the hero: Studio, Shop, Connect. It fades and slides in from the left over 480ms, then reverses on exit; hidden links are inert, and reduced motion switches instantly. On phones below 768px, Studio and Shop sit inline to the left of the centered logo, with Connect on its right and 44px-high targets. Studio and Shop use a doubled mobile gap of `clamp(12px, 4vw, 32px)` (15.6px at 390px). Tablets keep the horizontal row below the logo. The index highlights the current section and uses clean-hash scrolling with focus transfer. Without JavaScript it is ordinary in-page navigation.
- The home hero fills the viewport without a border or rounded corners. On arrival, a beige logo and blinking supplied pixel eyes appear on red; after 1.1 seconds, the red layer wipes bottom-to-top over 1.1 seconds. The settled hero is beige with the red mark. Scrolling or keyboard navigation dismisses the entrance immediately. There is no scroll lock. The CSS animation can finish independently of the main script.
- Clicking or tapping the hero (including its logo) scrolls to the intro and moves focus there without adding a hash. Swipes retain native scrolling; reduced motion jumps instantly. Once the hero clears, the docked logo retains its back-to-top action.
- On scroll, the hero moves upward at native scroll speed while the content beneath moves more slowly, settling into normal flow once the cover clears. The parallax offset is capped so the intro’s opening line clears the hero when its bottom edge reaches 70vh, on phones and desktop. The intro begins low enough to reveal its reading-ink effect. Reduced motion and no-JavaScript use ordinary scrolling with no landing sequence.
- The page background smoothly interpolates from Soft Beige #FAF0E6 to Ash Brown #191416 as Studio enters the reading area, then returns to beige as Studio exits. The interpolation uses scroll position and smoothstep easing, without a continuous idle animation. Reduced motion switches colors discretely; without JavaScript Studio has its own Ash Brown ground. Programmatically focused section destinations stay transparent, so arriving through an anchor cannot override the shared color blend.
- Primary CTAs are unboxed Icon Red text links with arrows and at least 48px hit height. The copyright and language switch share a 24px bottom inset and aligned line boxes. Language controls keep their 12px labels.

- The homepage logo scales from 240px (200px on phones) to 96px and stays 16px from the top, on a transparent background. “A DESIGN HOUSE” is uppercase and fitted to the logo’s width after fonts load and on resize. It moves upward and scales with the logo, then fades during the last quarter of docking. Page overscroll bounce is disabled and negative scroll offsets are clamped, keeping the opening anchored when scrolling upward at the top. Reduced motion uses discrete size and visibility changes. Without JavaScript it remains in the opening.
- The supplied `img/brand/eyes.svg` pixel eyes occasionally peek, glance, and blink inside the logo’s D, both in the opening and when docked. `eyes-on-red.svg` preserves the exact supplied geometry with beige eyes and red highlights for contrast on the red mark. The pair animates as one shape, preserving its pixels and highlights throughout each blink. The first peek is after 2.4 seconds, with subsequent peeks 4.2–7.4 seconds apart. Eyes stay hidden with reduced motion or without JavaScript; hidden tabs cancel the sequence, and open forms suppress new peeks.
- Services form a stacked typographic list: each service name is followed by its gray details. Both lines share the same left edge and Medium reading scale. A 1px dark-brown rule bounds the whole list above and below, with 32px inner padding and no card backgrounds. Brand Design lists Art Direction, Graphic Design, Visual Identity.
- Studio artwork moves continuously at 35px/second. It pauses offscreen, in hidden tabs, while keyboard-focused, or during a touch gesture/horizontal wheel browse. Touch dragging directly tracks the finger horizontally, wraps seamlessly across both ends, and pauses autoplay until release. An 8px direction threshold preserves vertical page scroll; reduced motion retains manual dragging with bounded ends and no autoplay. Pointer cancellation, lost capture, blur and hidden tabs release the drag safely. Touch release and the end of horizontal wheel browsing resume automatically. Clicks, taps, pointer focus, and vertical page scrolling do not pause it. Space toggles motion; arrow keys and native horizontal swipes browse the strip. Reduced motion disables autoplay and removes the duplicate image set. Hovering does not stop the strip, and its cursor stays the standard arrow. No added visible controls.
- The original procedural tote loads near the Shop section. It follows the mouse across the full viewport: center faces forward; the left edge turns −135° to reveal the right side and back, and the right edge turns +135° to reveal the left side and back. It settles at hard stops and returns to rest when the pointer leaves the window. The small embroidered logo sits high at the center of the back. Front pixel eyes match the owner’s ghost reference: compact 4 × 4 stepped silhouettes, a one-pixel square highlight in each, and a six-pixel gap, using a charcoal directional sheen that is faint head-on and reveals itself as the bag turns. Touch and pen can rotate the tote with a horizontal drag starting anywhere inside the presentation stage, including the blank space around the bag, bounded to the same ±135° range. An 8px direction threshold leaves vertical gestures to native page scrolling; only horizontal drags capture the pointer. Rotation stays at the released angle without momentum. Cancellation, lost capture, blur and hidden tabs end a drag safely. Moving a real mouse resumes the existing full-viewport mapping. Reduced motion permits direct touch rotation with instant updates. The older mouse-drag implementation remains dormant for the archived story. Raycasting triggers X-ray over the bag itself. A tap on the bag itself or Enter/Space toggles X-ray, and Escape resets the toggle. Reduced motion removes autonomous motion and uses instant manual rotation and X-ray changes. The transparent poster remains if JavaScript, WebGL, or the CDN is unavailable.
- The tote occupies a transparent 4:3 stage below the Shop description. Its specification labels, descriptions and prototype note use 15px type at every width. The label column is 200px on desktop and 100px on phones. Rows use 8px vertical padding, with 16px between the list and prototype note. Copy follows the updated owner-supplied frame: provisional 40 × 36 × 10 cm dimensions, shoulder strap, red tag, pockets, magnetic opening, front eyes and back logo. A visible prototype note makes clear that specifications may change. The procedural render itself retains its existing construction and interactions.
- Get in touch opens a floating white card from the right, using Walla type, pixel eyes, and white fields. All text inputs and textareas share the email field’s animated red underline on focus, without an outer outline; the underline remains visible for keyboard focus. The contact card occupies half the available width on desktop and the available width below 768px, inset 12–24px from the screen edges with safe-area support. A separate 40% dark-brown overlay dims the page, whose position and opacity remain unchanged. The card and overlay enter and exit together over 720ms. Opening and closing are coordinated by `js/drawers.js`; heading focus avoids an automatic mobile keyboard interrupting the entrance. The card scrolls independently and closes with Escape, Close, or a click outside. Reduced motion opens and closes instantly. Without JavaScript its existing Notion destination remains a fallback.
- Notify me when it’s out scrolls to and focuses the Connect email field. A red Sign up → text CTA sits below the required transparent email field, which uses a large bold gray placeholder and a red focus underline. Email focus has no outline; an underline preserves keyboard focus feedback. Signup remains a design preview: no footnote appears initially or on focus; an attempted submission explains that nothing was sent or saved. There is no backend, storage, or fake success. Without JavaScript submission is disabled. A provider connection needs a separate request.
- Social links use the original pixel icons without boxes, with accessible names and 44px hit areas. Existing destinations remain, including the New Fiction LinkedIn account.

## Active files

- `index.html`, `about/index.html`: English Home and About.
- `ja/index.html`, `ja/about/index.html`: generated Japanese equivalents.
- `locales/ja.json`, `scripts/build-japanese.py`, `js/language.js`, `js/ja.js`: translations and localization.
- `css/japanese-font.css`, `fonts/Noto Sans JP/`: locally hosted, openly licensed Japanese fonts.
- `css/fonts.css`, `css/walla.css`: fonts and shared single-column layout.
- `css/about.css`, `js/about.js`: About essay and fold.
- `css/dialogs.css`, `js/drawers.js`, `js/contact.js`: floating contact popup. The profile script remains on disk but is not loaded.
- `js/site.js`: shared navigation, clean hashes, and production-only analytics.
- `js/walla.js`: landing sequence, cover parallax, Studio background interpolation, reading ink, logo docking, artwork strip, and unconnected Connect field.
- `js/tote-preview.js`, `js/tote.js`, `js/tote-touch.js`: lazy loader, transparent model, mouse mapping, touch rotation, and X-ray.
- `img/projects/walla-01.png` through `walla-11.png`: exact Figma artwork tiles; node mapping in `img/projects/WALLA-SOURCES.md`.
- `img/brand/logo_red.svg`, `logo_black.svg`, `logo_white.svg`, `logo_brown.svg`: owner-supplied October 8 logo variants, with the updated 829 × 280 geometry. The active site uses the red version; legacy filename aliases contain the updated mark too.

Three.js 0.170.0 and addons load from jsDelivr. Public backend configuration stays empty. No framework or new runtime dependency was added.

## Preservation and collaboration

For cloud editing and iPhone review while the Mac is off, follow `docs/HANDOFF.md`. Run `python3 scripts/build-preview.py` to generate an ignored `dist/` package containing all four active pages and their assets. It adds no-index directives and excludes the production CNAME, archives, server code and repository files. Packaging does not upload or publish anything; the separate private preview is configured in `docs/HANDOFF.md`. No-index directives are not access control.

`_archive/pre-pixel-tote-2026-10-08/` preserves the previous tote and fallback render. `_archive/pre-walla-2026-10-08/` preserves the prior editorial version and documentation. Earlier archives remain intact. Old CSS/JS and form implementations remain on disk but are not loaded by the new Home. `_archive/pre-design-house-2026-10-08/` preserves the previous homepage, services, and drawer implementation. `_archive/pre-drawer-2026-10-08/` preserves the previous popup styling and caption behavior. The temporary Figma export folder is ignored by Git. The Figma design itself was not changed.

Work on `site-redesign`. Read `AGENTS.md` and `docs/HANDOFF.md` before continuing. The owner approved a new cloud collaboration checkpoint and private preview on 9 October 2026, followed by synchronizing the mobile refinements and doubled anchor gap to this branch for cross-device work. The production site is unchanged. Future commits, pushes, and deployments need explicit instructions.

### Historical typography revision — superseded by the 9 October frame

English Home uses the supplied Walla Bold for the caption and section statements (64px desktop, 40px phone), and Walla Regular at 20px/28px for descriptions and service details. Service names remain Medium at 20px/28px. Studio’s mono label is Bold with 1px tracking. Shop and Community CTA labels use Medium sans at 40px desktop / 28px phone in Icon Red, retaining their existing button containers and wording. Intro typography stays 40px/48px Medium. This pass changes typography only: the 540px column, spacing values, service grid, artwork, section order, About, forms, and Japanese typography remain as before. Text naturally reflows within the existing containers.

### Historical column and CTA refinement — Figma 298:660

All content sections on Home and About, plus the footer, share a maximum 960px column. At desktop widths of 1100px and up, the right gutter is 128px and the left inset scales toward the reference’s 400px; the column caps at 960px on wider screens. Smaller screens retain 24px side insets. Full-width artwork and the centered hero remain intact. Section rules extend exactly to the right content viewport edge. All primary CTAs, including signup, form submission and About’s Continue reading, share the intro text-link style; utility controls such as Close and language links retain their compact treatment. Connect’s transparent input scales from 24px to 80px in Walla Bold, with a muted placeholder, clear typed text and visible focus underline. The signup remains unconnected and truthful.

### Brand assets — 8 October

The updated logo is used by the hero, docked mark, eye overlay, tote embroidery and structured-data organization image. SVG/PNG/ICO favicons, the 180px Apple touch icon, 512px brand tile and 1200 × 630 social card use Icon Red on soft beige. Square assets match the supplied reference with the logo at 70% width; the social card uses a centered 600px mark with no extra copy. All four pages reference versioned assets, with English/Japanese social-image descriptions. The logo remains transparent wherever it overlays the site or appears on the tote. Original assets are preserved in `_archive/pre-logo-2026-10-08/`. `scripts/build-brand-assets.mjs` regenerates the branded exports from `logo_red.svg` using Sharp as a development-only dependency.


## Objects — private working collection

`/objects/` and `/ja/objects/` now contain 55 sourced selections from Kosuke’s Notion list and subsequent additions. Mr. CONTAC and Isabelle were removed at the
owner’s request; its catalog entry and translation are preserved in
`_archive/removed-mr-contac-2026-10-10/`. The waitlist-only Peepers
shows “Not for sale.” The old placeholder catalog is archived. Product names,
brands, images and source credits are verified; English and Japanese descriptions
are included. Twergi and Tinned Goods each use one representative item (ES19 and
Play). See `docs/OBJECTS-SOURCES.md` for the exact mapping and provenance.
Canvas and no-JavaScript thumbnails use genuine transparent cutouts with centered
`object-fit: contain` in square frames. Original-pixel masks, individual optical
scale adjustments and lossless WebP masters preserve product detail. Responsive
480px/960px copies keep the overview light; canvas zoom requests sharper sources. Product sheets use full-width, natural-proportion photography
without added padding; see the gallery update below.
Ownership IDs are never reused for a different product or variant.
Set `forSale: false` on a catalog entry to replace its product link with the
non-interactive “Not for sale” label (Japanese: “販売なし”). A missing product URL
uses the same state. Image-source credits remain separate. This also applies to
the no-JavaScript grid; a source/reference URL is not proof of availability.
The quiet, beige canvas repeats the filtered finite collection in all directions.
Drag with a mouse or finger, or use a trackpad/wheel. Category and tag filters
combine; empty results have a Clear filters control. A List view presents each
object once, supports normal tab navigation, and is the no-JavaScript default.
In Grid view, focus the canvas and use arrow keys to pan, Enter/Space to open the
center object, or Home to reset. A tap/click opens a native dialog with the full
image, factual description, tags, product link and image-source link. Escape,
Close and backdrop dismissal restore focus. Drag release/cancellation never
opens a product. There is no inertia, autoplay or saved browsing state. Purchased marks use the approved backend described below.
Virtualization bounds live tiles to the viewport rather than growing the DOM.

Canonical product metadata: `data/objects.json`; original-resolution local images:
`img/objects/`. `python3 scripts/build-objects.py` regenerates English HTML; then
run Japanese and preview generators. Sources/dimensions/rights caveats are in
`docs/OBJECTS-SOURCES.md`. Brand photography is retained for private review;
public-use clearance is not implied. The preview package now includes six pages.
`node tests/objects.mjs` checks indexing/filter edge cases and pointer lifecycles.
Phone/tablet page anchors place Studio and Shop left of the centered docked
logo and Connect right. Desktop anchors are vertical at the left.


## Immersive Objects and shared Purchased marks — 9 October

Desktop (1100px and up) restores the vertical page-anchor list at the left;
phone/tablet anchors remain inline. Shop now includes Explore Objects. Home and
About footer links sit inline after the copyright.

Objects’ enhanced canvas fills the viewport behind floating Home/About/logo,
filter/view controls, language links, info button and zoom slider. It starts
centered and supports dragging in all directions. The slider’s rightmost value
switches to a large, one-product horizontal carousel with swipe, arrow buttons
and keyboard navigation; lowering zoom returns to the same selected product in
the grid. Resize preserves the selected slide. List/no-JavaScript fallback
remains available. The info popup contains the owner-requested working copy and
describes the growing selection of everyday tools and vintage finds.

Purchased is a real anonymous, reversible shared mark, using the approved
private Site Worker and D1 database. One secure first-party browser cookie
identifies a visitor; a composite database key allows one mark per product per
browser. The count is not a verified purchase or unique-person tally: separate
browsers and cleared cookies can count twice. No fake counts, optimistic saves,
localStorage ownership, personal profile data or seed rows are used. GET must
succeed before marking; failed or uncertain writes require reloading the count.
Contact and signup remain unconnected.

Run `npm ci` and `npm test` for development checks. `npm run build:hosted` creates
an isolated Worker/static package in ignored `tmp/hosted-build/`, without
publishing. Local full-feature steps are in `docs/PURCHASED-BACKEND.md`.
The plain Python preview still works for layout but cannot serve shared counts.
The generated Drizzle migration must remain immutable after deployment.


### Navigation refinements — 9 October

Home’s About/Objects page links now follow the section anchors, separated by a
1px divider with matching typography and hover/focus behavior. Desktop keeps
the vertical list; phone/tablet adds a compact second row beneath the unchanged
Studio/Shop/logo/Connect row. Footer page links are removed in both languages.
Shop’s gallery CTA is “Found in the Wild” (“日常で見つけたもの” in Japanese); the
Objects page and navigation label remain Objects. Floating Objects controls use
solid white surfaces with existing red selected/focus states.
Objects’ About link is inside the info popup rather than floating on the canvas.
The zoom slider uses −/+ labels. At its far-left minimum, grid captions disappear;
raising zoom restores them. Accessible slider names and product details remain.
The intro retains only More about us; its duplicate Explore Objects CTA is removed.

Latest navigation labels supersede the above: About and Found in the Wild,
then another divider and a Contact button opening the existing contact form.
Home and About share this navigation; About links return to Home sections and
mark About as the current page. Phone/tablet Contact stays on the second row
with a vertical separator. The Objects route/title remain unchanged.

Objects controls now have black borders on white. Home hugs its contents;
Change view sits at bottom-left and opens its scrollable panel upward; info
sits at top-right. On phones the zoom rail sits above the bottom controls.
While the view panel is open at narrower widths, zoom/slide controls are hidden
to avoid overlap and return when it closes.
About’s single logo now shares Home’s settled fixed dock: 96px wide, centered,
16px from the top, in both languages and at every responsive size.

Final naming choice: Finds replaces Found in the Wild and the Objects page title
in navigation, Shop CTA and page metadata. Keep `/objects/` and `/ja/objects/`
URLs. Finds remains a curated collection of outside products, not 2D1 products.

Latest Shop correction: its CTA is “Objects found in the wild”; Finds remains
the page/nav name. The gallery CTA and Notify me are one vertical cluster with
16px desktop / 12px phone gap, based on the owner’s screenshot.
Links/buttons and button-like controls never show focus outlines or rings.
Keyboard focus instead uses a solid red background and dark-brown foreground;
authored button borders remain. Other input/canvas focus affordances remain.
The ownership toggle reads “I have it” (checked when selected); the authoritative
count reads “Owned by N users”, singular for 1. Browser-tally caveat remains
visible. Loading/errors still never manufacture counts; API/schema unchanged.

Latest focus correction includes native selects, inputs, sliders, canvas and
radio-label surfaces, not only links/buttons. Native outlines and focus shadows
are suppressed globally; keyboard focus uses fills and existing input underlines.
Authored control borders remain. UI/descriptive copy uses US English: color tag
and colorful description. Official HAY Colour Crate name/source URLs are intact.

About rendering correction: the old hero lives inside an inert template. The
active docked logo and navigation must be outside that template. Both About
routes now parse to one active logo/nav, with the essay-end red square retained.
Nav hover reveals a 6px red square by width while shifting the label 12px;
siblings and dividers stay fixed, reduced motion is instant and touch unchanged.

Finds view controls: the bottom-left Grid/Canvas toggle is outside and to the
left of Views. Grid is the normal 4/3/2-column overview; Canvas is the default
infinite draggable view, with its existing zoom/carousel. Views contains only
category filters. Tag filtering UI/state is removed; product tags remain factual
metadata in detail dialogs. Switching modes preserves the selected category.

### Canvas-only spatial focus — latest direction

Finds is now canvas-only. The toggle/visible regular Grid mode and horizontal
slide controls are removed; the lower-left menu is Category and retains only
categories. The no-JavaScript source remains a readable product fallback.
Every image frame is square with contain fitting. At maximum zoom the same 2D
canvas smoothly centers the nearest card; all surrounding cards remain at 40%
opacity. Select any surrounding card, including above/below/diagonal, to pan to
it. Select the centered card to open details. Arrow keys navigate neighbors;
Enter opens details. Drag/wheel retain both axes. Reduced motion settles
immediately. Zooming out preserves spatial context.

The info dialog opens on first arrival and stores dismissal under one local
browser key shared by both language routes. Closing by button, Escape or outside
click marks dismissal; the info button always reopens it. Storage errors never
break browsing; without writable storage the introduction may reappear on a
later load. This local preference is separate from shared ownership counts.


### About typography refinement

About retains its copy, fixed navigation and single-column essay fold. Its title
now uses Home’s 64px/44px Bold display scale; the gray subtitle, introduction and
Continue reading use the shared reading scale. The small About label no longer
has a viewport-wide rule. Header/body gaps are 96px desktop and 64px phone, with
28px/20px regular essay text, bold subsection headings and red phrase accents.
Japanese keeps Noto Sans JP and native line heights (24px desktop essay text).
The transparent expand target highlights only its CTA label on keyboard focus.


### Finds product cutouts — 10 October 2026

All 55 canvas images now have transparent backgrounds and consistent optical
weight. Native transparent sources are preserved; other views use local Apple
Vision masks with manual corrections. No products were regenerated or upscaled.
Original IDs and interactions are retained; 31 gallery photographs now use sharper native sources. Isabelle’s entry is archived in `_archive/removed-isabelle-2026-10-10/`.
Canvas/list backgrounds are transparent and blend normally. Product images share
a subtle, reversible warm grade (`sepia(.055) saturate(.98) contrast(.985)`),
including the detail gallery. Twelve main images use sharper source artwork,
including native HAY press photography and official App Store icons. Responsive
480/960/1440/1920px derivatives are generated only below native master size.
Some rare items still lack sharper published originals; no source is upscaled. See `docs/FINDS-CUTOUTS.md` for processing and source
limitations. This supersedes earlier white-backed contain and cover treatments.

Finds’ Category menu stacks its options vertically with left-aligned, full-width
44px targets in a compact 200px panel, in both languages at every viewport size.

Home’s Shop section now has only the tote notification CTA; the removed gallery
CTA is preserved in `_archive/removed-shop-gallery-cta-2026-10-09.html`. Finds
remains accessible from the page navigation in both languages.

The intro’s opening line fades directly with scrolling as the hero bottom
edge moves from 90vh to 70vh, reaching full opacity at 70vh. The main-content
starting offset keeps that line visible at the threshold. The rest keeps its
word-by-word reveal in both languages.

Home’s hero has 128px bottom corners with square top corners; the landing
fill follows its 108px inner radius inside the existing 20px red border.

Body copy on Home and About now shares the intro’s scroll-driven word opacity
reveal via `js/reading-ink.js`. Paragraphs and service names/details are marked explicitly; the product spec
sheet and its note stay fully visible. Other headings/subheadings, labels, controls, fields,
form feedback and navigation stay at normal contrast. About’s existing essay
fold remains intact. English and Japanese use the same behavior; reduced motion
and no-JavaScript keep full text opacity.

Reading-ink ranges run sequentially in document order: each paragraph finishes
before the next starts. Every block reaches full opacity by the time its top
edge reaches the viewport midpoint, regardless of block height. Opacity is tied directly to scroll, one word at a time,
so timed fades cannot overlap paragraph boundaries. Reverse scrolling retraces
the same order; the intro’s explicit first-line/70vh behavior is preserved.


## Finds product sheets — 9 October 2026

Product details open as a 90%-width sheet, flush with the viewport bottom and
94dvh tall, sliding upward over 620ms. Reduced motion opens/closes instantly.
The existing collection-introduction dialog is unchanged. The left column is
a continuous photo stack with no added gaps, padding, fixed square crop or
image blending. Original photographic backgrounds remain intact. At 768px and
above, the right-hand details stay sticky while photos scroll; a short viewport
allows the details to scroll independently. Below 768px, details precede the
photos in one accessible vertical flow. The close button stays available.

Gallery entries live in `data/objects.json` with per-image source URLs and
dimensions. Inert templates keep extra images off the initial canvas request
path; opening a product clones its gallery, loads the first image eagerly and
lazy-loads subsequent views. Switching products replaces the previous gallery
and resets both scroll positions. Every distinct photography source is linked
in the detail column. Canvas images, ownership IDs and no-JS product links are
unchanged. Run both page generators after catalog edits.

51 of 55 products currently have 2–5 distinct views. The supported maximum is
7. Four retain one verified view pending additional photography: Robi Boris, The Peepers, DAYPA-kun Backpack, Blue, Carbon Stack Signature Phone Case for iPhone 18 Pro.

Finds floating controls use a compact 33px height (roughly 25% shorter), with
unchanged type and horizontal padding. Category, Home, info, zoom, language and
dialog close controls share the tighter vertical rhythm in both languages.

The landing starts with square hero corners. After the eyes blink, the bottom
corners grow from 0 to 128px in sync with the red layer’s upward wipe (1.1s,
shared easing); the inner fill follows 0 to 108px. Skipping the landing, reduced
motion and no-JavaScript show the settled 128px corners immediately.

Studio service names participate in the sequential word reveal: each name inks
in before its corresponding service details, in English and Japanese.

### Finds floating menus — 10 October
Home has no arrow. Hover or keyboard focus reveals the shared page links from the left over 480ms; on touch, the first tap opens the menu and the next follows Home. Each link has its own white background. Category uses the same individual-label backgrounds and leftward fade/slide entrance and exit. Reduced motion is instant. Contact opens the shared form.

Finds opens at minimum zoom (0%). Canvas name/brand captions appear at 50% and above, hiding again below halfway. Detail dialogs and the no-JavaScript list retain their text.

### Finds controls and additions — 10 October
Floating labels share the language switch’s 12px regular Walla style (Noto Sans JP in Japanese), 1px dark-brown borders, and matching 6px/12px menu-item padding. Navigation dividers are removed. Zoom −/+ buttons step by 10 points and clamp at 0/100. Captions fade and gently rise at 50%; reduced motion is instant. The info dialog is a full-width, 60vh red sheet with white type, entering from the top and retaining Escape/outside-click dismissal and remembered first-visit behavior.

Yoto Player 4th Gen and Freckle Phone (Orange) bring the catalog to 57. Both use official product imagery and Japanese descriptions; Freckle is labeled as available for preorder. The Yoto retail link is the fourth generation, so imagery is not mixed with the supplied third-generation Pentagram reference.

Loop Cocoon Baby Earmuffs in Berry joins Finds as item 58, with a transparent main image and three official detail photographs. The linked Berry variant was unavailable when checked and is labeled Not for sale.

Finds now contains 63 selections, adding Magis × Iittala Linnut Sulo S, &Tradition Flowerpot VP9 (Zesty Orange), B-Line Boby 3/4 (Paprika), Hey Bag (Green Lines), and Hey Classic Cap. All five link to original-brand pages and include Japanese descriptions and transparent main photographs.

Intro reveal correction: the first line progresses word by word until the hero edge reaches 70vh. Remaining words use a separate 70vh-to-50vh reading range, preventing the moving cover from collapsing the reveal into a whole-block jump. Reduced motion remains fully visible.

Finds detail browsing now uses a vertical product deck: the active card places vertically stacked photographs beside sticky details on desktop, stacking the sections on phones, with persistent previous/next product previews. Tapping either preview slides to that item within the active category, wraps at the ends, and resets the gallery/details position. Native vertical scrolling remains available for long descriptions; product changes require a deliberate tap. Horizontal image controls are removed; reduced motion switches instantly, and ownership requests retain their stale-response protection. Canvas captions are centered.

Finds page-nav labels no longer shift, change color, or show a hover square; the Home-trigger menu reveal and keyboard focus cues remain. The info modal is now a white, content-sized floating card at the right, with contact-form margins, a 40% scrim, and a 720ms entrance from above. On phones it uses the available width and caps overflow to the viewport.


### Nine design selections — 10 October

Finds now contains 72 entries. Added La conica, First, Most Illustrious Achille, Frida 752, Valentine, Rabbit Chair (Light Blue), Magic Bunny (Black), Girotondo Round Tray, and Ray (White Dial). The latter three are one representative each from the linked Plastic, Girotondo, and Watches portfolios. Valentine and Ray use Not for sale. New entries have EN/JA descriptions, transparent optically sized original-photo cutouts, responsive derivatives, and source-credited galleries. No image was upscaled. Full provenance and native subject sizes are in docs/OBJECTS-SOURCES.md.


### 10 October cloud refinement

Built on Codex’s `6bd73072f24f1588b76274aede1bbc8a83d390eb` catalog and interaction update. Finds adds BAGGU Standard Baggu in Pop Pink Happy with three original official photos and removes Ray, White Dial (72 active items). Page-menu and Category items now enter sequentially and exit in reverse order; exit panels become inert immediately and reduced motion is instant. GitHub synchronization remains on hold; see the latest HANDOFF entry for preview/source status.


### Finds catalog quality and rolodex motion — 10 October

Product display names omit color; selected variant labels remain in catalog metadata. Future catalog work follows `docs/FINDS-CATALOG-PROCESS.md`, targeting transparent primary photography and 4–8 distinct native high-resolution detail images with verified source/colorway evidence. Run `python3 scripts/audit-finds.py` to refresh the per-product Markdown/JSON audit; its automated checks do not replace visual review.

The detail deck now expands the selected preview into the active card with a 640ms rolodex transition: bottom rolls upward, top downward. The outgoing sheet preserves its scroll positions, remains visually separate and inert, and is removed on completion or dismissal. Rapid repeat taps are guarded; reduced motion switches immediately; ownership requests change generation as soon as the product switches. Home’s intro underlines Familiar Characters without adding a link.


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


Private publication succeeded10 October2026 at03:24:36UTC: https://two-d-one-design-preview.kosuke-2d1.chatgpt.site/objects/ . Site source `a5efd16c765fa8fe3f0c9b710b25217e587d1b02`; saved version `appgprj_6ac8448dc6f081919531a44b83b1c463~appgver_e423d3cddc5881918142fb956792f0e2`; deployment `appgdep_6ac9afd3e2308191aaf0f9681e9f7120`.825 packaged files match the tested build; archive249.1MiB. Publication checkout is tmp/hosted-preview-refinements. Prior oversized attempts were not live versions.

GitHub synchronization remains unfinished despite the owner's03:09UTC approval: the upload worker was interrupted after three automatic approval rejections.35 of112 immutable image blobs are confirmed uploaded, but no final tree/commit/ref update was performed. Remote site-redesign remains `6bd73072f24f1588b76274aede1bbc8a83d390eb`. Do not resume blocked source writes until the owner confirms continuation. Resumable SHA ledger: ../github-finds-sync-ledger.json. Keep this technical transfer state separate from the successfully deployed private Site.

Recovery patch: tmp/2d1-finds-recovery/changes.patch, based on6bd73072f24f1588b76274aede1bbc8a83d390eb, includes new binary/text assets and tracked changes. It is verified by git apply --reverse --check against this checkout. Inspect/reconcile local work and run git apply --check before applying elsewhere. No credentials are included. The current per-product audit was also replaced at its existing Library identity, libfile_e87693a1995c8191a0d5364d7b75b17c, version1.


## Mobile product photographs — 10 October 2026

The Finds product dialog uses a native horizontal scroll-snap photo strip on phones, including short coarse-pointer landscape viewports. Images retain their complete proportions with contain fitting. The gallery uses the remaining sheet height above the details, with a144px minimum; long descriptions or short screens retain vertical sheet scrolling instead of clipping content. Desktop keeps its stacked gallery.

Arrow Left/Right and Home/End page through photos when the gallery has keyboard focus; modified shortcuts keep browser behavior. The gallery is a localized, named region and is focusable only for a multi-photo mobile strip. Horizontal photo browsing never changes the product or ownership state. Opening/switching a product resets to photo1; the outgoing rolodex clone preserves its current horizontal photo position. Native touch/scroll-snap and pinch zoom handle swipes without custom pointer capture.

Checks cover eight images, repeated paging, bounds, responsive width changes, EN/JA labels, single-photo focus, product replacement/reset, reduced motion and outgoing-animation position. Actual mobile browser swipes/rendering remain unverified under the existing browser restriction. CSS/JS cache versions33/17; Japanese dictionary version6. GitHub continuation remains paused pending explicit approval after automatic review rejection.


Mobile gallery publication verified: private version 22, Site source e362f779a83130c6ce721b515584f675eda10ac2, succeeded 10 October 2026 at 03:39:33 UTC. See the current top of docs/HANDOFF.md for source, validation and recovery status.

### Mobile navigation and Heinz addition — 10 October 2026

Home, About and Finds share a mobile hamburger disclosure (`css/mobile-nav.css`,
`js/mobile-nav.js`) with retained menu styling and accessible dismissal/focus
handling. It also covers short coarse-pointer phone landscape. Desktop navigation
is unchanged. `tests/mobile-nav.mjs` runs through the existing test command.
Finds detail photographs use square contain-fit frames; phones retain horizontal
photo scrolling while the outer product sheet may scroll vertically.

The catalog contains 74 products, including the owner-linked Heinz Tomato Ketchup
32 oz inverted squeeze bottle (GTIN 00013000006057) in Kitchen. Eight matching
classic-label photographs are documented in `docs/HEINZ-KETCHUP-SOURCES.json`.
The official primary is natively transparent, and retailer gallery originals
retain their studio backgrounds. The private preview is updated independently of
the paused GitHub synchronization; use the latest HANDOFF checkpoint.

### Photo controls and focus correction — 10 October 2026

Multi-photo mobile product galleries loop through native horizontal scrolling,
with square pagination, photo arrows and a swipe/tap hint. Single-photo controls
remain hidden. Detail photos fill square frames using cover fitting; canvas
cutouts retain contain fitting. Mobile zoom uses vertical +/− buttons above the
language toggle (25-point steps), while desktop retains its range. Finds Close
buttons are accessible icon-only 44px controls.

The canvas always keeps Soft Beige when focus returns after a dialog. Its center
caption supplies a compact keyboard cue, avoiding the shared Sand Gray region
focus fill. Queued close events are ignored after a dialog has reopened, so stale
cleanup cannot steal focus or cancel a fresh gallery session.

### Photo tap refinement — 10 October 2026

Mobile photo pagination sits inside the square image on a compact white, black-bordered overlay. Visible arrows are removed; clean left/right-half taps step backward/forward. Swiping and direct pagination remain, with passive gesture guards against accidental activation after scrolling or pinching. Keyboard controls and English/Japanese instructions remain available.

### Full-width mobile product sheet — 10 October 2026

Mobile Finds details use a full-width 95dvh sheet with a stationary safe-area footer. The single product-page CTA/availability state and previous/next product arrows remain visible while photos and information scroll. Desktop preview navigation is retained. Photo pagination is background-free with tighter 16px visual gaps and non-overlapping 24×44px targets.

### Horizontal product-card push — 10 October 2026

Product changes now slide horizontally on every viewport: next pushes the current card left while entering from the right; previous reverses. This supersedes the older vertical rolodex. The mobile CTA/product-arrow footer stays stationary, desktop preview controls remain, and photo swiping stays independent. Reduced motion switches immediately; interrupted navigation and dismissal clean up outgoing visual copies.

### Two-finger canvas zoom — 10 October 2026

Finds supports two-finger pinch/spread on its canvas, anchored between the fingers and synchronized with the zoom controls. One-finger dragging remains available; photo-gallery and browser gestures outside the canvas are independent. Releasing at maximum zoom settles into the focused spatial view.

### Mobile language and zoom placement — 10 October 2026

On Finds phones, EN/JA lives inside Info. The same route links return to their floating position on desktop. A compact horizontal zoom slider occupies the mobile bottom-right corner, replacing the vertical plus/minus stack; pinch and slider share one zoom state. Desktop placement remains unchanged.

Finds mobile menu, centered logo and Info use one safe-area-aware 44px row so their vertical centers align in portrait and short landscape.

### Catalog and shared navigation refinement — 10 October2026

Finds adds Playdate, KINTO Water Bottle300ml, JOURNAL STANDARD FURNITURE Glass Cup & Saucer, and Topologie6.0mm Rope Strap. Air-Chair returns to the owner-selected red. Authentic photo count/resolution gaps are documented rather than filled with duplicate or generated views. Shared mobile navigation now follows the Finds style across Home, About and Finds, including EN/JA links inside navigation. Photo pagination uses a discreet mono current/total count in the image’s bottom-right. See HANDOFF for the verified deployed checkpoint.

### Hero-to-intro breathing room — 10 October 2026

Home adds 48px before the intro below 768px and 64px at larger widths, shared by English and Japanese. The section’s existing 80px/128px top padding remains, making the combined settled spacing 128px/192px. This extra space belongs to main rather than the intro padding, preserving the hero parallax factor and the chosen halfway word-reveal pace.

### Mobile Finds menu visibility — 10 October 2026

Shared mobile menu styling is gated by the controller’s mobile-navigation-ready class alone. Finds does not have the Home/About html.js bootstrap marker; requiring it prevented the open panel and its items from becoming visible. The shared fix applies to all six routes while preserving no-JavaScript fallback and desktop menus.

### Mobile Finds controls — 10 October 2026

On phones, Category is hidden and excluded from keyboard/accessibility navigation. Entering the mobile breakpoint closes any open Category panel and returns its focus to zoom. The horizontal slider is centered at the bottom safe area, with pinch synchronization preserved. Desktop Category and zoom remain unchanged.


### Home copy and field refinement

Studio’s opening is split into two paragraphs above the artwork; the strategy paragraph and closing aim follow it. Shop uses “House of familiar things.” and places its development note after the specifications. The intro’s Familiar Characters link turns Icon Red on hover. Connect uses Medium body weight, stays transparent on focus, and retains a red underline. Both language routes share these changes. Section h2 headings match body size in uppercase; About essay h2 headings match essay body size.

Mono typography uses uppercase throughout the active site. Finds’ collection-info control is labeled Familiar Characters ℹ, with responsive wrapping beside the mobile logo.

Studio uses a 13px uppercase mono eyebrow above its dark-brown leading statement (64px desktop, 44px phone).

Finds floating controls and menu labels use uppercase Walla Mono. The collection-info label is Familiar Characters ⓘ.

Finds product details occupy a full-width, bottom-aligned 90dvh sheet. Desktop previous/next previews share one flush bottom row, previous left and next right; mobile retains its stationary action/arrow footer.

Finds product details and their bottom navigation are centered within 90vw × 90dvh, separated by a 12px gap.

Finds floating controls share Walla Mono uppercase labels, 6px × 12px label padding, and red text/borders on hover. Page navigation is a single Back to Home link on all screen sizes.

Finds collection info is a nonmodal disclosure below its floating trigger, with compact uppercase Walla Mono type. The trigger toggles +/− and Escape closes the sheet.

Finds enters with staggered center-scale product images, followed by the logo and floating controls sliding into view. Reduced motion skips the sequence; the initial info disclosure follows the entrance.

Finds uses live keyword search instead of Category. Terms match product names, brands, descriptions, categories and tags; clearing the field restores the collection. The same input filters the no-JavaScript grid when JavaScript becomes available.

Trackpad pinch zooms the Finds canvas around the pointer and synchronizes the zoom slider. Ctrl-wheel handles Chromium/Firefox pinch events; Safari gesture events use the same bounded 0–100 zoom. Ordinary two-finger scrolling pans the canvas.

Finds now includes the five owner-photographed shop selections: DETAIL INC. NASA Snow Globe, carpenter Hamburger Coaster, Super7 × BEAMS Charlie Brown, Running Press UFO Cow Abduction, and Notabag Original in Red. Names and variants are verified against official listings, with English/Japanese descriptions and 1–2 original source photos per entry. See the source log for native dimensions and remaining transparent-image treatment.

Product details now show 2–4 keyword tags for each Finds item. Clicking a tag closes the sheet and filters the canvas to products with that exact tag; editing or clearing search returns to ordinary keyword matching. Ownership copy is shortened to “Anonymous browser-based tally.” The reload control, unavailable-count message and ownership dividers are removed; unavailable ownership controls remain disabled.

Finds photo update (11 October): eleven recent canvas images now use native transparent cutouts, consistent optical framing and the shared warm CSS treatment. YÔKI, Bruna, UFO and Hamburger Coaster have improved original imagery; Notabag includes a real-use view. Galleries remain capped at four authentic photos. See `docs/FINDS-NEW-PHOTO-QA.json` for current source dimensions and treatment records. Sources are never upscaled.

The Finds photo counter uses the same transparent, 12px mono treatment on desktop and mobile, positioned 12px inside the bottom-right of the visible image area. Desktop keeps it above the separate product navigation row.

Finds additions (11 October): nine verified owner-photographed selections added, with transparent canvas images, 1–4 authentic detail photos, keyword tags and Japanese descriptions. Two ribbed vases await exact identification. Native source limitations and pixel-preserving treatments are documented in `docs/OBJECTS-SOURCES.md`.

TECTA Cat added in the owner-selected black finish, with its original transparent studio photograph and four authentic detail views (including an interior photograph). The catalog now contains 90 products; studio source-resolution limits are documented.

Inkerie Travel Jewelry Case added with a transparent striped canvas image and four high-resolution detail views. Finds now contains 91 products.

Songbird Ruth removed from the active Finds catalog at the owner’s request. Its metadata and image assets are retained for recovery. The catalog contains 90 products.

Finds adds MUJI Porcelain Toothbrush Stand (yellow), Best Years Knitted Triceratops (red), and Kay Bojesen Monkey Mini (vintage blue), using transparent native-photo primaries and respectively 3, 3, and 4 distinct detail views. The catalog contains 93 products.

CS Smart Toothbrush now uses a transparent gray/lime side profile on the canvas and four detail images showing assorted colors and bathroom use. Its stable product ID is preserved.

Eames Elephant’s Red Orange detail gallery now has four complementary views: side, front, face/ear detail, and upper construction detail. The canvas main image is unchanged.

MUJI Smooth Gel Ink Ballpoint Knock Pen added with a transparent color-lineup canvas photo and four colorful detail views. Finds now contains 94 products. Product names omit color variants.

The Curaprox selection is now CS 5460: orange/blue side-profile cutout, color assortment, bathroom, actual-use and color-pattern detail photos. Its stable catalog ID remains unchanged.

### Finds photo review — 11 October

All 94 display names and galleries were reviewed. Color suffixes were removed from Dombo Mug, Original, and 04 PILLAR while stable product IDs and internal variant metadata remain. Detail images now fit complete originals inside square frames on desktop and mobile, preventing wide handles and portrait products from clipping. Thirteen galleries received complementary native-resolution manufacturer/designer photos; Heinz repeated front views were removed. Dombo now includes colorful assortment, interior angle, and a real setting. Source and native-original metadata are retained in the catalog. The audit records remaining small-source exceptions; four photos are a goal, not a reason to enlarge or repeat source images.

### Finds detail photo fill — 11 October

Owner override: all detail photos now use centered cover fitting on desktop and mobile. Portrait and landscape photographs fill the container edge to edge without added white bars; excess height or width is cropped. This supersedes the earlier complete-image fit.

Finds adds ACTUS DECO Dot Photo Frame 5×7, ACTUS Object Flower Vase, and Iwachu Cat Candle Stand (the right-hand cat in the owner photo). Native transparent masters use alpha-only masks, preserving source RGB; galleries contain respectively four, two, and four authentic views. ACTUS native sources are900px and owner photographs1024px, recorded as source-resolution exceptions rather than enlarged. The lamp awaits reliable product identification. Both languages are generated; catalog count97.

Finds adds Aptone Mix & Match with owner-selected Clear + Neon Green transparent canvas image and four credited native-resolution gallery photos (full product, open construction, tabletop use, alternate angle). Product name omits color; both languages updated. Catalog count98.

Finds replaces the Desert Plants Cactus Tumbler’s amber variant with the owner-selected green cactus from Flymee, with a transparent canvas cutout and four official gallery views. Stable ownership ID and color-free display name retained in both languages.

Spun now uses the owner-selected red version on the Finds canvas and as its first detail photo, with four native-resolution gallery photographs.

Spun now uses the owner-selected red version on the Finds canvas and as its first detail photo, with four native-resolution gallery photographs.

Desktop Finds detail photographs match the sheet viewport height, excluding the navigation row and gap, so the following photo does not peek into the resting frame. Mobile keeps its square horizontal gallery.

The contact sheet shares Finds info typography, white ground, and thick Icon Red border. Category choices include Relationship advice in both languages. Its scrollbar has a transparent track and square dark-brown thumb.

Home services use the essay reading style (28px desktop /20px phone, Regular /1.5; Japanese desktop24px /1.85) in three desktop columns, stacking on phones. Shop’s tote description and development sentence share that style; the development sentence appears immediately above the specifications. The prior Home implementation is preserved in Figma section339:649, frame343:649.

Text CTAs use a shared square-pixel right arrow, scaled with the label and retaining the existing hover movement, in both languages and the contact form.

Home and About navigation now contains Home, About, Finds, Contact with no section anchors or dividers. Shop includes the email notification form labeled Notify when it’s out; signup remains unconnected and never sends or saves addresses. Connect is archived in _archive/connect-20261011.html. Social links sit inline with copyright in both page footers, with14px icons. Both languages generated.

Below1100px, Home uses a horizontal top navigation with Home, About and Finds on the left and Contact at the right. Phones place this row below the centered logo; the existing hero reveal threshold remains. Home no longer uses the hamburger disclosure. Other pages retain their mobile menus.

Services names and descriptions remain fully visible; they do not use the word-by-word opacity reveal, in either language.

Services now match the specification table:15px Medium names,15px Regular descriptions, dark-brown text and subtle top rules. The three-column desktop /stacked phone layout and fully visible copy remain.

CTA pixel arrows use an0.8em box with a tuned baseline offset to match the text’s optical height and center.

Footer social icons reveal mono platform labels above each icon on hover and keyboard focus, with a brief upward pop/slide entrance and downward exit. Reduced motion shows labels instantly.

Active typography uses only Regular (400), Medium (500), and Bold (700). Former Light styles now use Regular; the Light font face is no longer loaded.

Services uses the same two-column definition table as Shop specifications, with Medium labels, Regular details, and matching spacing and row rules.

Typography experiment: all former Walla Mono styles now use proportional Walla, preserving size, weight, line height and tracking. The previous implementation is saved in `_archive/pre-walla-sans-2026-10-11/`, with restoration instructions. Japanese keeps Noto Sans JP.

The Walla experiment is accepted: active styles now share --font throughout, with no Mono typography token or font-face declarations. English uses SC Walla; Japanese retains Noto Sans JP. Sizes and weights are unchanged. The pre-experiment archive remains available.

Section labels and page navigation use sentence case. Home’s compact top navigation centers Home/About and Finds/Contact on either side of the 96px docked logo. Section-heading gaps are 24px. Finds floating labels use Medium, with a balanced zoom rail and 24px pixel-eye thumb.

Shared typography is centralized in css/typography.css, loaded after page styles. The scale is 12px labels, 16px body/small headings, 20/28px reading copy, 28/40px lead copy, and 44/64px display. Uppercase labels are 12px, except h2 headings. Japanese retains its native reading rhythm.

Finds info uses one-third viewport width on desktop, the logo eyes above its sentence-case lead heading, and closes on outside pointer interaction. H2 headings carry an 8px red square. Hero caption restores its original fitted Bold style; the zoom thumb is a red logo eye.

Home Intro, Studio and Shop body copy uses Regular with 1.4 leading (supporting Shop copy 1.55; Japanese 1.75). Selective red emphasis identifies the design practice, defining detail, fresh perspective, intended qualities, making, red material detail, and development status. Wording and display headings are unchanged.

Word reveal now spans an additional 15vh of native scroll for calmer reading, keeping paragraph-height-aware pacing, non-overlapping reveal ranges and instant reduced-motion behavior.

Home body copy now uses Medium (500), preserving the open line spacing and red emphasis.

Studio now transitions the Home ground to dark brown #320505 while foreground text transitions to beige #FAF0E6. The existing scroll-driven entry/exit and reduced-motion behavior remain; no-JS Studio is dark brown with beige text. Red emphasis and artwork colors remain.

Studio background is now a separate muted raisin brown #241A1B (--studio-background). Original #320505 text, border and other ink uses are unchanged. The scene foreground still transitions from original ink to beige.

Studio ground deepened to #191416: near-black with a subdued red-brown/raisin undertone, informed by the Margaret Howell dark-brown trouser reference. Original ink #320505 remains unchanged.

The current named palette is documented in docs/COLOR-LIBRARY.md and exposed as CSS tokens: Icon Red, Soft Beige, Sand Gray, Sub Gray, Pure White, Cranberry Brown, Ash Brown, and Rich Black.

Shop’s development note follows Specifications; signup has a Stay updated h2. Nav hover moves the inner label, retaining a stationary hit area to prevent jitter.

Finds products enter in a center-out ripple, with a gentle hop, alternating tilt and small settling bounce over 760ms per object. Stagger is bounded at 640ms; floating-control entrance remains unchanged. Reduced motion skips the product animation.



Diffar now uses Tokyo Balance (11001), with native transparent canvas photography and four official square gallery scenes showing Tokyo Balance, Woody Earthy, Herbal Floral and Japanese Citrus. The stable catalog ID is retained for ownership counts.

Finds canvas hover keeps the transparent product image at its normal size and reveals the product name and brand in dark brown at every zoom. Original background photos are reserved for the detail gallery. Product-modal names retain their authored capitalization.

Studio’s complete description now precedes the full-width artwork carousel, which sits directly above the Services table. The copy uses “a fresh pair of eyes and a hands-on approach” in place of the earlier editing sentence.

Studio now carries its Ash Brown ground with the section, with crisp boundaries in the surrounding whitespace. Shop retains Soft Beige and dark-brown type; the whole viewport no longer blends through gray. Reduced motion uses solid section grounds.

Finds waits for the visible canvas photos to decode before playing its staggered product entrance. Initial canvas measurement preserves the animated tiles, including on a cold cache; reduced motion shows them immediately.

Finds product hover labels and pointer cursors activate only after page loading and the entrance sequence finish, followed by a fresh mouse movement over the canvas. A stationary pointer cannot reveal a label while products load beneath it. Reduced motion skips the entrance wait; keyboard access is unchanged.

Finds outgoing product links include `utm_source=2d1.studio`, `utm_medium=referral`, and `utm_campaign=finds`, generated centrally by `scripts/build-objects.py` for both language routes and the no-JavaScript catalog. The modal uses the same generated link. Other query parameters and fragments remain intact; photography credits remain untagged. This identifies referral traffic to retailers that read UTMs, without affiliate commissions or a new tracking service on 2D1.

Finds’ info sheet unfolds downward from the top-right collection button. While open, that same button sits inside the sheet and reads “Collapse −”; reduced motion opens it instantly. Finds now shares Home’s compact EN/JA toggle styling, and Home’s toggle inverts while positioned over Studio’s Ash Brown background. Sally and Pepe’s canvas image has a reversible, softer saturation and brightness treatment. Shop’s signup CTA reads “Notify me when it’s out.” Both language routes are regenerated.

Finds zoom buttons are square, with vertical separators adjoining the slider. Button clicks select the next of five stops (0, 25, 50, 75, 100); dragging the range remains continuous between stops.

Finds now uses lossless, content-hashed responsive delivery copies, requests only viewport-intersecting canvas photos, and preserves full-resolution originals for close viewing. Images enter independently as they decode. Detail galleries and adjacent previews select appropriately sized sources, and zoom avoids intermediate-resolution downloads. The build generates/caches delivery files automatically; `_headers` is ready for Cloudflare browser caching. See `docs/FINDS-PERFORMANCE.md` for measurements, quality verification, diagnostics and hosting notes. Initial canvas photo bytes dropped about 93% in the captured like-for-like desktop comparison; this is not a production network-speed benchmark.

Finds floating controls share equal screen-edge insets: 16px desktop and 12px phone/tablet, enlarged only for device safe areas. Search sits one shared gap above the phone zoom row; the info sheet keeps its equally inset internal Collapse button.

Finds’ info button now unfolds into its sheet over four sequential 250ms paper hinges, opening left then downward in three stages. The real button remains usable during the folds and moves into the top-right of the settled sheet. Temporary visual panels are hidden from assistive technology and removed on completion, close, resize or reduced-motion changes; reduced motion opens instantly.

The open Finds info sheet places Collapse at top/right zero inside its border, with the pixel eyes aligned on the same row. Tumbler 1709 is removed from the active collection; its catalog record remains in `_archive/finds-removed/`.

Finds info now assembles from growing square pixels originating at the disclosure. The button stays fixed, including its width, while open; eyes sit above the title. No decorative title square appears. Temporary pixels clean up on close/resize, and reduced motion opens instantly.

The Finds info entrance uses a shuffled square-pixel mask over the real sheet: scattered pixels multiply over 1.05 seconds until the text, white ground and border become one surface. The disclosure remains stationary; reduced motion skips the mask.

Finds keeps the Familiar Characters disclosure label while open (the indicator still changes to minus). The scattered reveal now uses approximately 12px squares for a denser pixel assembly.

The Finds info sheet starts directly beneath its stationary disclosure button, with aligned right edges.

Finds info sheet uses equal 24px top/bottom insets and a button-to-sheet gap matching the button’s top margin (16px desktop, 12px phone, respecting safe areas). Pixel assembly takes 650ms.

Finds search offers keyboard-accessible category, color and brand suggestions above the focused field. Search matches hidden color metadata and translated color/category names. Visible product badges use broad categories without “accessories”; The Peepers is Furniture. Colors combine native transparent-image coverage with variant metadata and remain absent from product badges.

Finds info now pops downward from its top-right origin with the canvas images’ scale overshoot and settle (720ms). Pixel masking is removed. Button position/label and sheet gap remain fixed; reduced motion opens instantly.

Finds swaps Search to the top-right and Familiar Characters to the bottom-left (above mobile zoom). Info opens vertically upward without scaling or horizontal motion. The search filters pop downward; brands are omitted. Categories and colors support multiple selection, with OR within each group and AND between groups. Selected chips show × for removal. Colors are accessible labeled square swatches. The panel scrollbar is Ash Brown on a transparent track.

The Finds product sheet follows Figma 358:649: photography credits sit on the image, a compact Product Page action follows the description; category tags and up to five actual product-color swatches sit at the bottom of the copy panel, and the ownership tally is hidden. The colors are image-derived display metadata separate from search color labels. Adjacent product previews remain below the desktop sheet; phones retain the stationary navigation footer.

On Finds arrival, the search field enters downward from above and the collection info button enters upward from below, with the existing 480ms control entrance and reduced-motion fallback.

Finds desktop floating controls share top and bottom centerlines; the language switch has a white ground. The product sheet follows the revised 358:649 spacing, with 16px color swatches and tags alongside them. Phones preserve the stacked controls and fixed product-action footer.

About reading copy is fully opaque immediately; the word-by-word ink reveal is limited to Home. The existing essay fold remains unchanged.

Contact now lives at `/contact/` and `/ja/contact/`, with a centered single-column form and real page links across active navigation and CTAs. Focus fills fields white; labels turn red, category squares respond to selection, and the pixel eyes follow field focus. The existing truthful unconnected submission handling is shared with the preserved drawer code.

About is now a flat article: a centered 680px reading column, 20px/1.7 Regular body copy (18px on phones), sentence-case 28px section headings, and a 56px maximum title. No fold, reveal, or Continue reading control. Body copy is preserved; four outline headings cover the studio, its founder (awaiting personal copy), origin, and purpose. Previous article sources are archived in `_archive/about-pre-article-2026-10-12/`.

Finds info uses the shared copy size for its heading and label size for compact body/note text. Two equal-width transparent red-outline actions sit flush against the inner left, right, and bottom edges: Learn more (About) and Reach out (Contact), without arrows.

Home landing adds a 1.5-second laptop-opening phase after the red wipe: the rounded cover rotates away around its bottom edge while native page position advances to reveal Intro and navigation. Wheel, touch, pointer and keyboard input interrupt immediately; reduced motion, restored scroll and hidden tabs skip the phase.

Contact categories have transparent unselected states and can be deselected by clicking the current choice (or pressing Space). Send is a centered, full-width rectangle with sentence-case text. The initial unconnected notice is removed; attempted submissions still explain honestly that nothing was sent.

Finds search is 320px wide on desktop and fills the available second control row on phones.

Contact uses two desktop columns: title/subtitle on the left and the form on the right, stacking in reading order below 768px.

Finds uses matching 33px Home/search frames and a heavier search icon. The info-sheet actions share a single red divider and fill Icon Red with white labels on hover or keyboard focus; the sheet supplies the outside border.

The Finds info sheet has a pixel-cross close button aligned with the eyes; closing returns focus to the info trigger.

UI icon review: square-grid SVG masks in `img/icons/` now unify Finds search/clear, Home and external arrows, product navigation/close, filter removal, plus/minus, and the shared mobile menu close state. Existing pixel eyes, social icons, hero marks and CTA arrows remain. Info-sheet actions reveal a right pixel arrow on hover and keyboard focus, with reduced-motion support. Native browser cursors are preserved.

Finds info-sheet paragraphs and action labels share the 16px body token; paragraph line-height is 1.6 for readability.

The Finds info-sheet title is “A growing collection of everyday companions that go from having character to becoming a character.” Familiar Characters remains the trigger label.

Finds search suggestions enter only vertically downward, without scaling or horizontal movement.

At desktop widths of 1100px and above, the Finds info sheet occupies 50% of the viewport width.

The Finds info-sheet body separates the personal introduction from the invitation to explore in two paragraphs.

Zoom plus/minus icons are positioned at the exact center of their square buttons. Small navigation/search symbols use 12px frames to balance the interface labels; larger CTA and standalone action icons retain their intended scale.

## Work

`/work/` and `/ja/work/` showcase Aviator, Supa Team and Deep Trip in that order, using the existing original project photographs. Desktop/tablet use three columns; phones stack the cards. Each card opens a right-side, single-column project sheet over a 40% brown scrim, retaining the Work URL and grid position. The shared drawer lifecycle supports Escape, backdrop dismissal, native modal focus containment, restored trigger focus, scrolling within the sheet and reduced motion. Desktop sheets cover 60% of the viewport; phones cover the full width. Project sheets touch the top, right and bottom screen edges, with no outer margins. Without JavaScript, native details disclose the same gallery inline. Work is linked from Home, About and Contact navigation and included in the preview/Japanese builds. Each sheet includes a short project description below the title, based on the existing identity and digital design work shown in the gallery.

Finds includes Jellycat’s Amuseables Sports Basketball, with a transparent original-pixel canvas image and four official gallery views. Its native 1000px photographs are recorded as a resolution exception.

Work’s portfolio presentation pairs a typographic studio introduction with three project columns, short project context, supporting application images, and a direct Contact invitation. Its right-side sheets retain their edge-to-edge 60% desktop/full-width phone layout. Home’s Studio strip uses high-resolution square artwork derived from the original masters; Work uses responsive high-quality WebP sources up to 2560px (or native size). See img/projects/WALLA-SOURCES.md for provenance.

Work uses a minimal, image-led three-column project index, inspired by Stockholm Design Lab’s Work page: a Selected work heading and a project name below each cover. Introductory marketing copy, card descriptions, secondary covers, and the inquiry section are removed. The full project descriptions and high-resolution galleries remain in the edge-to-edge right-side sheets. Phone layouts stack the projects.

Home landing now uses a full-bleed red wipe followed by the existing 1.5-second upward scroll to Intro. The red frame, rounded corners, corner animation, and laptop rotation are removed. Input interruption, reduced-motion behavior, and English/Japanese parity remain. This supersedes earlier border/corner/laptop notes.

Work project sheets explicitly override the shared form-dialog inset: fixed to the full viewport, with a 60vw sheet flush to the top, right, and bottom (100% wide on phones). Entrance and exit use a calm 640ms horizontal slide with cubic-bezier(.2,.8,.2,1), without bounce, scale, or rotation. Reduced motion is instant.

The copyright and inline social links share the page navigation’s left edge across Home, About, Work, and Contact in both languages: 24px desktop/phone, 32px tablet. The footer no longer inherits the asymmetric body reading column.

Footer refinement: desktop social links align with Home’s body column, while copyright remains at the navigation edge. About’s article and Contact’s complete two-column layout now begin at that same body/social edge. Tablet and phone content retains 24px insets.

Home’s logo docking now shares the hero-height scroll endpoint with the Intro reveal. Position, scale, and caption fade follow the same progress, so the logo reaches its 16px dock exactly as Intro reaches its initial reading position at the end of the landing scroll.

Contact is a single column: title and subtitle above the form, capped at 680px and aligned with the shared Home/social-links content edge on desktop. Phone layouts retain the 24px inset.

Work’s Selected work heading and three-column project grid now share the Home/body/social-links left edge, with the same 960px maximum and 128px desktop right gutter. The heading is left aligned; mobile stays a single column.

Work now shows a single sequence of large 16:9 project covers, with clear Medium project names and a restrained pixel arrow on hover/focus. The index keeps its shared body/social edge, high-resolution responsive delivery, and project sheets. This supersedes the earlier three-column Work grid.

About and Contact content are centered independently of the footer, with a 680px maximum reading width and 24px minimum side insets. Contact remains single column.

About and Contact retain left alignment with the social links and now use the full shared Home content width (960px maximum, 128px desktop right gutter), rather than a separately centered 680px column. Contact remains single column.

Work project sheets and the index now move together over 640ms: the sheet slides from the right, while the main content and footer shift 64px left (32px on phones). Closing reverses the shift. Navigation stays anchored; reduced motion is instant without the background shift.

Work now displays three inline horizontal project galleries, replacing the detail sheets. Each carousel includes the existing high-resolution project images, a fully visible current image, a 30% next-image preview, and hidden previous images. Pixel-arrow controls, mouse dragging, native touch/trackpad scrolling, and Left/Right/Home/End keys navigate each gallery independently. Navigation is bounded; reduced motion uses immediate scrolling. The project headings and shared content/social alignment remain. English and Japanese routes match, and the previous sheet implementation is preserved in `_archive/work-detail-sheet-2026-10-12/`.

Work carousel refinement: arrow controls and desktop dragging are removed. Click the faded next-image preview to advance through an endless deck; the first photograph follows the last without a reverse scroll or visible reset. Each gallery keeps its own position. A 640ms horizontal slide, soft opacity reveal, subtle image settling, and red client-name hover/focus response add restrained motion. The phone preview is wider for easier selection; touch/pen swipes and Left/Right keyboard navigation remain, with immediate changes for reduced motion. The no-JavaScript fallback remains a horizontally scrollable gallery.

Work motion refinement: navigation now uses one uninterrupted 520ms horizontal slide. Opacity transitions, outgoing fades, and image-scale reveals are removed. The resting next preview remains faded; both moving images stay fully visible during navigation, and the following preview is ready before the deck resets. The next two images are loaded ahead to avoid a late image reveal.

Sheets and popups reverse their entrance motion on dismissal. Finds info and search filters retain their animation while closing, including the reverse overshoot; refocusing/reopening reverses an in-flight exit. Product dialogs and shared navigation/drawers use mirrored exit easing, with reversed menu stagger order and instant reduced-motion dismissal.

Work uses a single column of three thumbnails, with title/category appearing to the right on hover or keyboard focus (visible on touch). Each opens a full-screen native dialog that slides up and reverses on close. The header occupies 30% of the viewport; each high-resolution image has its own viewport-height stage with 24px insets and cover framing. Escape/close restore focus and scrolling. Without JavaScript, native details expand the same content inline. The previous carousels are preserved in _archive/work-carousel-2026-10-12/.

Shared close controls use css/shared-controls.css: a square hit area with an 18px pixel cross, dark-brown idle ink, and Icon Red fill/white ink for both hover and keyboard focus. Finds info/product and Work project dialogs share 32px controls (44px on coarse pointers). The legacy form close icon uses the same behavior without rotation. Language-toggle focus matches hover, including Studio inversion.

All visible page and panel scrollbars share an 8px square dark-brown thumb and transparent track through css/shared-controls.css. Intentionally hidden gallery/carousel scrollbars remain hidden.

Home’s landing sequence plays once per tab session, using `sessionStorage` shared by English and Japanese. Returning to Home or reloading within that session skips the wipe and opening scroll and starts at the settled intro, while preserving restored scroll positions and explicit section destinations. A fresh tab session can play the sequence again; no persistent local-storage preference is used. If session storage is unavailable, the normal landing remains usable.

Project detail titles and descriptions share Home’s responsive section-title and reading-size tokens. Contribution and year sit below the description; Creative Direction, Visual Identity and Web apply to all three projects. The header is at least 30svh and expands to fit the larger copy and metadata. The dialog shell clips the slide animation while an inner content pane scrolls; the close control stays anchored 24px from the shell’s top/right throughout entrance, scrolling and exit. Project names and years: Aviator (2026), Supa (2026), and DeepDrip (2025).

Work gallery refinement: thumbnails retain their existing dimensions but center in the viewport. Native vertical scrolling uses proximity snapping, with spacing calculated so the next image’s top 30% peeks in at the bottom. Noncentered thumbnails are monochrome at 30% opacity; only the centered project shows its name, description and category. Clicking a preview centers it, while clicking the centered thumbnail opens its existing detail dialog. Up/Down keys move between projects. Hover/focus reveals a red View project label aligned to the image’s lower-right caption column. On phones, captions move below the image and the hover/focus prompt sits within its lower edge. Reduced motion removes the visual transitions and uses instant programmatic navigation; no-JavaScript retains native inline project details.

The centered Work gallery now loops in both directions: Deep Trip is followed by Aviator, and scrolling upward from Aviator reaches Deep Trip. Lightweight repeated thumbnails provide native scrolling space; an equivalent row replaces the current one at the same viewport position when scrolling settles or approaches the outer buffer. Repositioning suppresses snap and visual transitions for that frame, preserving the 30% preview, image treatment and focus. Detail content remains a single source per project. Preview clicks, Up/Down keys, both language routes and reduced-motion navigation all wrap.

Work gallery indicators: the centered thumbnail shows its project index (1/3–3/3) on the left. The red hover/focus View project label and pixel right arrow sit at the image’s vertical midpoint, aligned with the caption column. On phones the hover/focus label remains inside the image at the right; the index stays outside on the left.

### DeepDrip supplied artwork — 12 October

DeepDrip’s detail gallery contains all 17 owner-supplied images, ordered from the wordmark and concept through the identity system, website, and applications. Native-resolution PNG originals live in `img/projects/deepdrip/originals/`; lossless responsive WebP images retain crisp detail and lazy-load. Complete compositions are contained within the existing full-screen image stages in both languages.

Project detail images retain their native proportions. Their visible vertical gaps and page side margins both measure 24px across all projects and both languages.

Finds includes Tobeus Pick-up (Odo Fioravanti, 2008), with a transparent cedar toy master and three official designer photographs. Original sources, square overview crop, and native-resolution limits are documented in `docs/OBJECTS-SOURCES.md`.

The curated objects page is titled Familiar Characters across navigation, page headings, metadata, and both languages. Its existing `/objects/` routes remain stable.

Project details use the Wildling reference’s 20px page insets and 10px image gaps. The Walla headline pairs the client name and project description at the same size, with a 300px desktop / 150px mobile pause before client, role, and year metadata. Each gallery ends with the 2D1 mark and links to Studio and Contact. Native image proportions, modal scrolling, keyboard dismissal, and the existing slide transition remain.

Project-detail footers include About Us, Get in touch, shared social icons, and an inline language toggle on the copyright row. The footer reuses the shared footer-line layout on every viewport; the Role column follows its social-link edge on desktop. Bottom padding matches the 20px side insets, and the modal scrollbar sits at the outer viewport edge.


## Finds route — 14 October 2026

The collection page uses `/finds/` and `/ja/finds/`, with the page title and
navigation label “Finds.” Familiar Characters remains the collection concept
in the copy and info button. The old `/objects/` routes redirect to Finds.

## About essay — Draft 04, 14 October 2026

About now uses Kosuke’s revised Notion Draft 04, defining 2D1 as his independent
design practice in the form of a design house. Five titled sections connect his
background, reasons for starting 2D1, Familiar Characters, reduction with wit,
and making/curation. The closing invitation links to Contact; the red end square
and existing article alignment remain. Directly below the opening paragraph,
the owner-supplied `img/about/design-house.png` shows Studio, Shop, and Finds
under one roof. Both languages use the same artwork at its original 1138 × 813
proportions, with localized alt text. It is responsive and works without
JavaScript. Japanese copy, descriptions, and metadata are generated from
`locales/ja.json`.


## Today Bag — restored original render, 15 October 2026

At the owner's request the live Shop model is restored from
`_archive/pre-today-bag-2026-10-15/tote.js`: original body geometry, canvas
textures, lighting, shoulder-strap geometry and dynamics, front pixel eyes,
back embroidery, tag, bottle band and square pocket. The rejected redesign
and fabric-flex experiment are preserved in `_archive/today-bag-refinement-2026-10-15/`.

The limited updates are a dark #191416 shoulder strap on both sides, beige
#FAF0E6 embroidery, and the short #FF2B00 handle. The Today Bag name stays.
The earbuds and keys are scaled and positioned inside the original small
pocket with a full 3D bounds check. The pocket and bottle geometry are unchanged.
Mouse position still rotates the bag ±135°, touch uses the existing bounded
drag, and hover/tap/Enter/Space/Escape retain the X-ray controls. Reduced motion
keeps the original behavior. Both script URLs are versioned to refresh cached previews.
The lossless 1200 × 1818 poster is exported from this restored model.


## Today Bag — graphic presentation trial, 15 October 2026

The active EN/JA Home Shop now uses an inline SVG product portrait instead of
the procedural renderer. Dark #191416 canvas, a tonal shoulder strap, red
#FF2B00 short handle/tag and beige #FAF0E6 logo remain. Subtle illustrated
folds suggest volume; this is a concept illustration, not product photography.
Hover previews the inside, click/tap pins or closes it, Enter/Space toggles,
and Escape closes. The exterior and interior crossfade in place over 420ms
with the same reverse transition; reduced motion changes instantly. A notebook,
bottle in the short band, and earbuds/keys fully inside the square pocket
illustrate the interior without annotations or exploded parts.

`css/today-bag.css` and `js/today-bag.js` own this presentation. Native
`details`/`summary` keeps tap and keyboard disclosure functional without JS.
The SVG remains sharp at any size and needs no WebGL, CDN, images or animation
loop. Home no longer loads the Three.js import map or tote preview module.
The restored interactive render, poster and Home source are preserved in
`_archive/pre-graphic-tote-2026-10-15/`; the existing tote modules remain dormant.


## Today Bag — anatomical drawing, 15 October 2026

Supersedes the graphic portrait trial above. Home now shows a static, annotated
SVG working drawing: exterior/logo side and interior/pocket layout on a faint
drafting grid. The two views sit side by side on desktop and stack below 768px.
Dimension lines show the provisional 40 × 36 cm body; the key includes the
10 cm depth and seven construction details. A caption makes clear that the
design is in development and the drawing is not to scale. Brown linework,
dashed stitching and red handle/tag accents retain the site palette. Interior
contents are secondary linework, with small items contained in the pocket.

This presentation has no hover state, disclosure, rotation or motion; all
details remain visible without JavaScript. `css/today-bag.css` styles the
inline SVG and HTML key. The previous graphic illustration, CSS and interaction
script are preserved in `_archive/graphic-tote-2026-10-15/`; neither the graphic
interaction script nor the Three.js renderer loads on Home. EN and JA are
regenerated together.


## Today Bag — photographic exterior and anatomical inspection, 15 October 2026

Home defaults to an AI-generated photographic concept, with real-looking canvas
weave, longer shoulder drop, a compact red hand handle and a lower-left red tag.
Hover crossfades into a matching anatomical SVG; leaving reverses it. Click/tap
pins the view; clicking again, Space/Enter or Escape closes it. Native details
keeps click/keyboard access working without JavaScript. Reduced motion removes
transitions. Nothing rotates and inspecting does not move the page.

The square inner pocket now sits at the base of the bag. The earbuds and key
remain wholly within it. The bottle retains its short band. Both the diagram and
specifications reflect the new placements. Dimensions remain provisional, and
hip-level carry is a design intent rather than a verified physical fit.

The presentation uses restrained brown rules, small technical labels and a
material/dimension summary, replaced in place by six construction notes during
inspection. A visible concept caption distinguishes the generated image from
a manufactured sample. The PNG master and lossless 1024 × 1536 WebP live in
`img/shop/`; prompts and generation provenance are in `docs/TODAY-BAG-IMAGE.md`.
`css/today-bag.css`, `js/today-bag.js`, and EN/JA Home contain the presentation.
The prior static blueprint is in `_archive/blueprint-tote-2026-10-15/`.

### Today Bag photo polish — 15 October 2026
Home and Japanese Home now use `img/shop/today-bag-photo-polished.webp`, a native-resolution lossless export with clean transparency on the page ground. The anatomical illustration follows the revised long strap and enlarged tag; base pocket contents and the hover/native-disclosure interaction remain intact. The source, prompt and transparency verification are documented in `docs/TODAY-BAG-IMAGE.md`.

### Today Bag feature inspection — 15 October 2026
The exterior photo is unchanged. Six red dots identify the shoulder strap, hand handle, magnetic closure, woven tag, bottle band and inner pocket. Hover previews a note; click/tap pins it, a second activation or outside click closes it, and Escape dismisses it. Keyboard focus previews each feature and Enter/Space toggles it. Only the bottle-band and inner-pocket points reveal the monochrome architectural drawing, with seam allowances, section hatching, centerlines and millimeter dimension lines. Leaving an unpinned point restores the exterior; whole-image hover does nothing. Native details keeps the individual notes and interior reveal available without JavaScript. Reduced motion disables transitions.

The old bag header and Exterior/Anatomy control are removed. The eight existing specification entries and their provisional note are now permanently displayed in `.bag-study-notes`, led by Today Bag. The separate specification table is removed, and the screen-reader construction description remains. English and Japanese share the same behavior. Previous figure/CSS/JS are archived in `_archive/pre-hotspot-tote-2026-10-15/`.

### Today Bag material notes and disclosure — 15 October 2026
Eight inspection dots now include the embroidered logo and canvas material. On mouse devices the dots appear while the bag study is hovered; keyboard focus also reveals them, and touch devices keep them visible. Notes occupy a separate lane to the right on wide layouts and below the photograph on narrow layouts, without covering the bag or moving the permanent specifications. The narrow lane sizes to the longest translated note. Hover previews, pinned click/tap notes, second-activation dismissal, outside dismissal and Escape remain supported. The concept caption explicitly identifies the image as AI-generated. Earbuds now rest at the inner pocket’s bottom seam. English and Japanese layouts and note interactions were checked at desktop and mobile widths.

### Today Bag inspection refinement — 15 October 2026
The exterior tag is enlarged, with the updated PNG master and lossless WebP saved as `img/shop/today-bag-tag-enlarged.*`. Inspection points are beige outline circles; when a note opens, other points fade away until dismissal. The magnetic-closure point is centered on the opening. Notes use Icon Red text with a single left rule. Material copy identifies Armada No. 8 cotton canvas; pocket, band and tag notes explain their use and visual meaning. Specifications are aligned label/value rows separated by hairlines. The final two Shop paragraphs share one prose block and the normal paragraph gap.

Material reference: Senda’s [Armada No. 8 product listing](https://www.textile-senda.com/products-info/cotton-414/) and [canvas guide](https://www.textile-senda.com/news/collection_canvas/). The guide supports the substantial weave/structure and historical sailcloth context; no unverified finish, mill or certification is claimed.

### Today Bag suspended motion — 16 October 2026
The original exterior asset is unchanged. Mouse movement over the bag stage drives a restrained spring-based sway (up to 2.8 degrees), anchored near the top of the shoulder strap. A smaller delayed shear suggests fabric give on changes of direction. This is a 2D presentation effect, not a cloth simulation or a new view of the product. The photograph, construction overlay and feature targets share the pose; tooltip text and specifications remain stationary. Opening a feature freezes the pose. Dismissal and pointer exit settle it back to rest. No continuous idle animation runs. Touch/pen interaction stays static with native scrolling and feature tapping, and reduced motion disables the sway. Offscreen, hidden-tab and window-blur states reset and stop animation work.

The introductory Today Bag paragraph is now above the figure, and specification rows match Studio: 15px/1.3 type, 8px row padding, fine rules and the shared label/value column widths. English and Japanese remain synchronized. Desktop cursor sway and frozen inspection, mobile-width EN/JA layout, repeated activation, interior reveal and keyboard dismissal were exercised in the preview.

### Today Bag motion removed — 16 October 2026
Cursor-driven sway was removed at the owner’s request. The photo, construction overlay and dots remain stationary; existing hover/tap feature inspection is retained. The experiment is preserved in `_archive/cursor-sway-2026-10-16/`. The introduction above the figure and compact Studio-style specification rows remain. Further Shop interaction directions are discussion only.

### Today Bag photographic story — 16 October 2026
Shop uses an image-led vertical presentation within the existing shared column. A left-aligned Today Bag introduction precedes the unchanged exterior; a separate high-angle interior concept follows with concise band/pocket captions. The interior includes a reusable steel bottle, slim wallet and keys to illustrate intended storage. Both photographs are explicitly identified as AI-generated concepts, not physical samples or verified capacity tests. The new 1536 × 1024 image is served losslessly and lazy-loaded without cropping.

The six exterior feature points retain hover, click/tap and keyboard inspection; interior information is now always visible below its own photograph. The anatomical SVG and earlier hover presentation are archived in `_archive/pre-bag-editorial-2026-10-16/`. Compact specifications, the existing section boundaries, signup behavior and native scrolling remain. No cursor motion or scroll-controlled rotation is introduced. Both language routes are regenerated together. Image prompts and source records are in `docs/TODAY-BAG-IMAGE.md`.

Today Bag typography follows the shared left content edge: product introduction and interior heading/copy use the same 740px maximum reading width with no centered text or automatic side margins. Image framing and the vertical section order remain unchanged.

Today Bag is grouped in a white inset panel within the beige Shop section, with 48px desktop and 24px phone padding. Typography remains left-aligned. The interior pocket targets roughly 35% of bag height; its contents sit concealed below the lip. The latest lossless image is `today-bag-interior-low-pocket-v6.webp`.

### Exterior-only preview — 16 October 2026
The interior image, heading and accompanying feature captions are removed from both Home routes at the owner’s request. The HTML is preserved in `_archive/interior-study-2026-10-16/`, and generated assets remain available for reference but are not loaded. The approved exterior and inset product container remain. Further presentation directions are discussion only.

## Shop as a designer’s product study — 16 October 2026

Shop retains the shared section heading, reading column and signup alignment. Its introduction now describes the owner’s intention: making a personal favorite version of everyday things and sharing it with people who appreciate it. The white Today Bag panel breaks out to a wider, inset product spread. The unchanged exterior photograph sits beside six named, native disclosures covering Armada No. 8 canvas, proportions/carrying, pockets, magnetic opening, the Red Pixel and embroidery. Material is expanded initially; readers can open multiple notes. The image stays within the viewport height and is sticky within the desktop spread; mobile orders the title, image, then notes. No cursor motion or interior image is loaded.

The compact eight-row specification table and provisional/AI-image disclosures remain. Click/tap, Enter/Space and no-JavaScript disclosure behavior use native details; Escape additionally closes the focused note with JavaScript. Supported browsers animate opening and closing with the same height/opacity transition; reduced motion is instant. The unconnected signup still truthfully reports that nothing was sent or saved. English and Japanese share the layout and content. The previous hotspot implementation is preserved in `_archive/pre-shop-design-notes-2026-10-16/`.

Verification for this iteration: EN desktop (1440 × 900) and phone (390 × 844), plus JA at both widths; no horizontal overflow or console errors observed. All six notes were exercised, including click-to-close, Enter/Space and Escape. A script-free preview confirmed native note toggling and disabled signup. The live signup test returned its truthful unconnected message. Visual proof: `/tmp/shop-design-notes/desktop.png` and `/tmp/shop-design-notes/mobile.png`.

### Full-bleed package insert refinement — 16 October

The white Today Bag background now reaches both viewport edges. The right pane is capped at 400px with a 32px title, 16px introduction, 15px design notes and 14px specifications, giving it the scale of a printed package insert. All six notes are flat semantic headings/paragraphs; the accordion controls, icons and active script are removed. Specifications now follow within the same right pane, extending the native page scroll while the exterior remains sticky on desktop. Phones stack the heading, photo, notes and specifications with 24px inner gutters. The previous disclosure variant is archived in `_archive/shop-accordion-2026-10-16/`.

Verified the actual EN/JA desktop and phone layouts, visible note content, full-width background, native scrolling/sticky-image behavior and no horizontal overflow or console errors. Proof: `/tmp/shop-design-notes/full-bleed-desktop.png` and `/tmp/shop-design-notes/full-bleed-mobile.png`.

### Scroll-linked feature markers — 16 October

As each flat design note crosses the viewport’s vertical midpoint, its heading and body turn Icon Red and the corresponding marker appears on the stationary product image. Forward and reverse scrolling use the same viewport intersection rule; no note is active before the first note or after the last. Shape/carrying identifies both handles. The storage note reveals the architectural skeleton with separate pocket and band markers. Feature headings explicitly identify material, shape/carrying, inner pocket/band, magnetic closure, woven tag and embroidered logo in EN/JA.

On phones with JavaScript, a compact sticky photograph remains above the reading area. Without JavaScript, the normal static photograph and all flat notes remain readable. Markers are decorative (not additional controls or live announcements). Reduced motion keeps a steady marker and removes color transitions. The tracking uses one scheduled animation frame per scroll/resize update, with font/content resize updates; it does not change scrolling behavior.

### Steady markers and storage skeleton — 16 October

Feature markers are steady 16px Icon Red dots with a white border. When the inner-pocket and bottle-band note crosses the reading midpoint, the exterior crossfades to the archived architectural construction SVG, with a marker on each compartment. Scrolling to any other note restores the exterior with the same transition; reduced motion switches instantly. Both language routes share this behavior. The photographic interior remains archived.

Verified scroll activation and exterior restoration on desktop and phone, including English and Japanese routes. Markers render at 16px with no animation; no horizontal overflow or console errors observed. Visual proof: `/tmp/shop-design-notes/storage-skeleton-desktop.png` and `/tmp/shop-design-notes/storage-skeleton-mobile.png`.

### Scrollable index-card stack — 16 October

The six Today Bag design notes now form a stack of square beige index cards. Native document scrolling holds the product heading and stack in place while each top card translates upward with a slight rotation, revealing the next. Scrolling upward retraces those exact transforms. A reading pause precedes each throw. The heading releases only after all six cards have passed, followed by the compact specifications table. The active card remains red and controls the existing steady hotspots and storage skeleton.

Desktop keeps the photograph alongside the pinned notes; phones place a compact photograph between the heading and cards inside the same pinned group. Stack dimensions are measured from actual content, including Japanese text and loaded fonts. Reduced motion, no JavaScript, or a viewport too short for the complete group use flat, readable cards instead. There is no wheel interception, snap scrolling, autoplay, or hidden copy in the accessibility tree. The previous flat-note implementation is preserved in `_archive/pre-bag-card-stack-2026-10-16/`.

Verified actual EN/JA desktop (1280 × 720) and phone (400 × 754) renders, forward/reverse scrolling, card-linked skeleton/hotspots, heading retention and release, and Page Down keyboard scrolling. Fixed transform overflow on phones; no console errors observed. Temporary local fixtures verified the reduced-motion code/CSS path and script-free fallback, then were removed. Proof: `/tmp/shop-design-notes/cards-desktop.png` and `/tmp/shop-design-notes/cards-mobile-ja.png`.

### Index-card refinement — 16 October

Cards use white fills, Icon Red borders, and Feature 01–06 labels (特徴 01–06 in Japanese). The deck sits above the story heading in the stacking order and no longer clips thrown cards, so they visibly pass over the title and introduction. The actual specifications table peeks immediately beneath the stack. During the final throw it rises into the vacated deck and becomes fully visible, removing the previous empty gap; reverse scrolling restores the same positions. The table returns to ordinary document flow in the flat fallback.

Verified the overlap during a throw, forward/reverse table reveal, white/red styling and numbering, storage hotspot synchronization, and EN/JA desktop/mobile renders. No horizontal overflow or console errors observed. Proof: `/tmp/shop-design-notes/cards-over-heading.png`, `/tmp/shop-design-notes/cards-refined-desktop.png`, and `/tmp/shop-design-notes/cards-refined-mobile-ja.png`.

### Beige ground and complete specifications — 16 October

The product study returns to soft beige (#FAF0E6); cards remain white with red borders. Only the Feature number stays red: headings retain dark ink and descriptions retain supporting gray, including the active card. Removed the specification table's preview clipping entirely, so every row can appear below the stack and remains readable after the final throw. The table still rises into the deck's vacated space. Verified all eight rows and the final note on desktop EN and phone JA, with no horizontal overflow. Proof: `/tmp/shop-design-notes/full-specifications-desktop.png`.

### Shop opening restored — 16 October

Restored the archived “The joy of making…” Shop opening, including its red opening phrase, reading-ink treatment, shared lead typography, column alignment and section spacing. Removed the smaller shop-intent override. The bag introduction now begins “Our first everyday item: a canvas tote…” in English, with the Japanese translation regenerated. Verified the rendered desktop opening at 40px/56px, weight 500, with the shared 96px heading-to-copy gap.
