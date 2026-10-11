# 2D1 — Familiar characters

Independent design house working across brands, digital products, and ideas.

## Preview

Run `python3 scripts/preview.py`, then open http://localhost:4173. The preview sends a noindex header. There is no build step or package installation.

## Current design — 9 October, Figma 298:650

Source: [Website 2026 / updated Home](https://www.figma.com/design/z1J8lyfvwOqtHpQqfNin3x/Website-2026?node-id=298-650).

Home follows the updated single-column frame: a viewport-height, red-bordered hero → introduction and More about us → Studio → Shop → Connect and social links → copyright. Community, Relationship Advice, its page anchor and profile popup are removed from both languages. Their source is preserved in `_archive/pre-cover-2026-10-09/`; `js/profile.js` is dormant.

The shared column remains capped at 960px, with a 128px desktop right gutter and left inset scaling toward 400px. Phone/tablet side insets are 24px. Desktop section padding is 128px and content gaps are 96px; Studio’s heading-to-description gap and final text/service/CTA gaps are 64px. Phones use 80px section padding and 64px gaps. English uses local Walla Bold 64px section headings, Medium 40px/48px descriptions, services, subtitles and CTAs. Phone headings are 44px and reading text is 28px/1.2. Subtitles, service details and supporting text share Sub Gray #807573 (`--sub-gray`), including contact helper text and Finds metadata and zoom track. Japanese retains Noto Sans JP at a native 24px/28px reading scale. The previous mono section labels and rules have been replaced by the heading/subtitle pairs shown in Figma; the page anchors retain their previous appearance and animation.

The intro keeps its two paragraphs and scroll-driven reading ink. Studio uses “Clear ideas, with character.” and the owner’s revised three-paragraph description (the first above the artwork, the remaining two below), a full-width strip of 280px square artwork, stacked service names/details, and Get in touch at the end. Shop uses the revised subtitle and the owner’s three-paragraph description. The transparent live tote sits between the opening “The joy of making…” paragraph and “The tote bag is our first everyday item…”. The remaining description is followed by prototype specifications and the notification CTA. Connect adds the supplied subtitle and a 40px email field at every width and in both languages. About keeps its existing essay and short-version/expand interaction without a hero.

The active site’s primary ink is dark brown `#320505`, replacing black text, rules, icons, control fills and the dialog scrim. Input and textarea carets use the same brown. Muted gray supporting text, supplied project imagery and the black-canvas product render retain their intended colors.

## Languages

English is the default at `/` and `/about/`. A fixed, square EN / JA switch in the bottom-right links directly to the equivalent page in the other language. Japanese lives at `/ja/` and `/ja/about/`; internal About links retain the selected language. No browser-language redirect, cookies, or local storage are used. On Home, the switch stays hidden and inert during the landing animation and hero. It appears with the page anchors, fading and sliding in from the right over 480ms, and reverses on return to the hero. Reduced motion changes visibility instantly. About keeps the switch visible. Without JavaScript, Home places the language links at the page end; all translated pages remain accessible.

Japanese uses locally hosted Noto Sans JP (variable weights 400–700), an open-source font used by Japan’s Digital Agency. Its unmodified Unicode subsets load only as needed, with native Japanese fonts as fallbacks. License and provenance are in `fonts/Noto Sans JP/OFL.txt` and `SOURCE.txt`. English retains SC Walla. Japanese has adjusted line height and line breaking for readability.

Edit English HTML and `locales/ja.json`, then run `python3 scripts/build-japanese.py` to regenerate the Japanese HTML and `js/ja.js`. This is an editing helper, not a deployment build: all four pages are static HTML. `js/language.js` translates injected contact UI, validation, and status messages. Alt text, accessible names, page titles, metadata, and language links are localized too. Font source: https://design.digital.go.jp/dads/foundations/typography/

## Interactions

- A fixed top-left section index, with a transparent background, appears after the hero: Studio, Shop, Connect. It fades and slides in from the left over 480ms, then reverses on exit; hidden links are inert, and reduced motion switches instantly. On phones below 768px, Studio and Shop sit inline to the left of the centered logo, with Connect on its right and 44px-high targets. Studio and Shop use a doubled mobile gap of `clamp(12px, 4vw, 32px)` (15.6px at 390px). Tablets keep the horizontal row below the logo. The index highlights the current section and uses clean-hash scrolling with focus transfer. Without JavaScript it is ordinary in-page navigation.
- The home hero fills the viewport including its 20px Icon Red border. On arrival, a beige logo and blinking supplied pixel eyes appear on red; after 1.1 seconds, the red layer wipes bottom-to-top over 1.1 seconds. The settled hero is beige with the red mark. Scrolling or keyboard navigation dismisses the entrance immediately. There is no scroll lock. The CSS animation can finish independently of the main script.
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
