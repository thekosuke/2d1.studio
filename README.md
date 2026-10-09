# 2D1 — Familiar characters

Independent design house working across brands, digital products, and ideas.

## Preview

Run `python3 scripts/preview.py`, then open http://localhost:4173. The preview sends a noindex header. There is no build step or package installation.

## Current design — 9 October, Figma 298:650

Source: [Website 2026 / updated Home](https://www.figma.com/design/z1J8lyfvwOqtHpQqfNin3x/Website-2026?node-id=298-650).

Home follows the updated single-column frame: a viewport-height, red-bordered hero → introduction and More about us → Studio → Shop → Connect and social links → copyright. Community, Relationship Advice, its page anchor and profile popup are removed from both languages. Their source is preserved in `_archive/pre-cover-2026-10-09/`; `js/profile.js` is dormant.

The shared column remains capped at 960px, with a 128px desktop right gutter and left inset scaling toward 400px. Phone/tablet side insets are 24px. Desktop section padding is 128px and content gaps are 96px; Studio’s heading-to-description gap and final text/service/CTA gaps are 64px. Phones use 80px section padding and 64px gaps. English uses local Walla Bold 64px section headings, Medium 40px/48px descriptions, services, subtitles and CTAs. Phone headings are 44px and reading text is 28px/1.2. Subtitles and service details use warm gray #807E7D. Japanese retains Noto Sans JP at a native 24px/28px reading scale. The previous mono section labels and rules have been replaced by the heading/subtitle pairs shown in Figma; the page anchors retain their previous appearance and animation.

The intro keeps its two paragraphs and scroll-driven reading ink. Studio uses “Clear ideas, with character.” and the owner’s revised three-paragraph description (the first above the artwork, the remaining two below), a full-width strip of 280px square artwork, stacked service names/details, and Get in touch at the end. Shop uses the revised subtitle and the owner’s three-paragraph description. The transparent live tote sits between the opening “The joy of making…” paragraph and “The tote bag is our first everyday item…”. The remaining description is followed by prototype specifications and the notification CTA. Connect adds the supplied subtitle and a 40px email field at every width and in both languages. About keeps its existing essay and short-version/expand interaction without a hero.

The active site’s primary ink is dark brown `#140B00`, replacing black text, rules, icons, control fills and the dialog scrim. Input and textarea carets use the same brown. Muted gray supporting text, supplied project imagery and the black-canvas product render retain their intended colors.

## Languages

English is the default at `/` and `/about/`. A fixed, square EN / JA switch in the bottom-right links directly to the equivalent page in the other language. Japanese lives at `/ja/` and `/ja/about/`; internal About links retain the selected language. No browser-language redirect, cookies, or local storage are used. On Home, the switch stays hidden and inert during the landing animation and hero. It appears with the page anchors, fading and sliding in from the right over 480ms, and reverses on return to the hero. Reduced motion changes visibility instantly. About keeps the switch visible. Without JavaScript, Home places the language links at the page end; all translated pages remain accessible.

Japanese uses locally hosted Noto Sans JP (variable weights 400–700), an open-source font used by Japan’s Digital Agency. Its unmodified Unicode subsets load only as needed, with native Japanese fonts as fallbacks. License and provenance are in `fonts/Noto Sans JP/OFL.txt` and `SOURCE.txt`. English retains SC Walla. Japanese has adjusted line height and line breaking for readability.

Edit English HTML and `locales/ja.json`, then run `python3 scripts/build-japanese.py` to regenerate the Japanese HTML and `js/ja.js`. This is an editing helper, not a deployment build: all four pages are static HTML. `js/language.js` translates injected contact UI, validation, and status messages. Alt text, accessible names, page titles, metadata, and language links are localized too. Font source: https://design.digital.go.jp/dads/foundations/typography/

## Interactions

- A fixed top-left section index, with a transparent background, appears after the hero: Studio, Shop, Connect. It fades and slides in from the left over 480ms, then reverses on exit; hidden links are inert, and reduced motion switches instantly. On phones below 768px, Studio and Shop sit inline to the left of the centered logo, with Connect on its right and 44px-high targets. Studio and Shop use a doubled mobile gap of `clamp(12px, 4vw, 32px)` (15.6px at 390px). Tablets keep the horizontal row below the logo. The index highlights the current section and uses clean-hash scrolling with focus transfer. Without JavaScript it is ordinary in-page navigation.
- The home hero fills the viewport including its 20px Icon Red border. On arrival, a beige logo and blinking supplied pixel eyes appear on red; after 1.1 seconds, the red layer wipes bottom-to-top over 1.1 seconds. The settled hero is beige with the red mark. Scrolling or keyboard navigation dismisses the entrance immediately. There is no scroll lock. The CSS animation can finish independently of the main script.
- On scroll, the hero moves upward at native scroll speed while the content beneath moves at 70% speed, settling into normal flow once the cover clears. On phones below 768px, its starting offset is adjusted so the first intro line emerges from beneath the hero after 25% less scroll distance (about 433px instead of 577px in an 844px-high viewport); desktop motion is unchanged. The intro begins low enough to reveal its reading-ink effect. Reduced motion and no-JavaScript use ordinary scrolling with no landing sequence.
- The page background smoothly interpolates from beige #FAF0E6 to Sand Gray #E0DCD7 as Studio enters the reading area, then returns to beige as Studio exits. The interpolation uses scroll position and smoothstep easing, without a continuous idle animation. Reduced motion switches colors discretely; without JavaScript Studio has its own gray ground.
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

English Home uses the supplied Walla Bold for the caption and section statements (64px desktop, 40px phone), and Walla Light at 20px/28px for descriptions and service details. Service names remain Medium at 20px/28px. Studio’s mono label is Bold with 1px tracking. Shop and Community CTA labels use Medium sans at 40px desktop / 28px phone in Icon Red, retaining their existing button containers and wording. Intro typography stays 40px/48px Medium. This pass changes typography only: the 540px column, spacing values, service grid, artwork, section order, About, forms, and Japanese typography remain as before. Text naturally reflows within the existing containers.

### Historical column and CTA refinement — Figma 298:660

All content sections on Home and About, plus the footer, share a maximum 960px column. At desktop widths of 1100px and up, the right gutter is 128px and the left inset scales toward the reference’s 400px; the column caps at 960px on wider screens. Smaller screens retain 24px side insets. Full-width artwork and the centered hero remain intact. Section rules extend exactly to the right content viewport edge. All primary CTAs, including signup, form submission and About’s Continue reading, share the intro text-link style; utility controls such as Close and language links retain their compact treatment. Connect’s transparent input scales from 24px to 80px in Walla Bold, with a muted placeholder, clear typed text and visible focus underline. The signup remains unconnected and truthful.

### Brand assets — 8 October

The updated logo is used by the hero, docked mark, eye overlay, tote embroidery and structured-data organization image. SVG/PNG/ICO favicons, the 180px Apple touch icon, 512px brand tile and 1200 × 630 social card use Icon Red on soft beige. Square assets match the supplied reference with the logo at 70% width; the social card uses a centered 600px mark with no extra copy. All four pages reference versioned assets, with English/Japanese social-image descriptions. The logo remains transparent wherever it overlays the site or appears on the tote. Original assets are preserved in `_archive/pre-logo-2026-10-08/`. `scripts/build-brand-assets.mjs` regenerates the branded exports from `logo_red.svg` using Sharp as a development-only dependency.


## Objects — private working collection

`/objects/` and `/ja/objects/` show ten source-credited placeholder selections,
including HAY’s Miz water bottle, Alessi’s Anna G. corkscrew and Dusen Dusen
slippers. Objects is linked from the home introduction and both existing page
footers. Brand/product names remain original; interface text and descriptions
are translated. Extra selections are placeholders, not confirmed personal endorsements.

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
explicitly identifies the selection as placeholders.

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
