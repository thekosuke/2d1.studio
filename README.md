# 2D1 website

Static HTML, CSS and JavaScript for 2D1. Read `AGENTS.md` before editing. Work stays on `site-redesign`; committing, publishing and deploying require an explicit request.

Public domain setup (27 October): only the separate red-eyes coming-soon page
and newfiction.org redirect are authorized for publication. The complete website
remains unpublished. See [docs/DOMAIN-SETUP.md](docs/DOMAIN-SETUP.md) for Cloudflare
configuration, verification status, local preview and the later full-site launch.

## Responsive audit — 11 November 2026

See [the launch audit](docs/RESPONSIVE-AUDIT-2026-11-11.md) for fixes, viewport coverage, evidence and remaining release checks. Compact reading pages reserve a solid header area, and Work uses the shared 200px mobile content clearance for layout and snapping. Inner-page language links are available in both the footer and mobile menu, with focus preserved when resizing to desktop. Without JavaScript, the shared header falls back to normal document flow.

## Work-first structure — 10 November 2026

Home now leads directly with four projects: Aviator, DeepDrip,
supa and Red Pixel. The shared page navigation is Studio, About and Contact. A typography-only
Work / Shop / Collection switch connects `/`, `/shop/` and `/familiarcharacters/`;
Shop contains Day Bag and Memoru only. Both remain in development, with no
checkout or paid-unlock behavior added. Familiar Characters retains its separate
collection experience within the same navigation. The Work/Shop intro copy and
the extra collection promo below Work are removed. About carries the longer story. Its Russell Taylor and italiaDesign field school links reveal as whole phrases, keeping their underlines connected across spaces.

The old implementation is preserved in
`_archive/2d1-before-work-home-2026-11-10.tar` (source and assets, before this
redesign). Extract it into a separate directory to inspect or restore selected
files; do not extract over current work without first saving that work. Git
history, local secrets, caches, generated output and older archives are excluded.
The archive is local only and is excluded from preview/publication packages.

`css/practice.css` supplies the cards; `css/practice-shell.css` owns the latest
header and layout. The logo has a sentence-case byline beneath it—“An independent practice for digital product and brand design.”—using the shared small text style on both language routes. Navigation and the mobile switch leave room for the byline. The logo sits above the left navigation, with the section
switch aligned to the reading/footer-social edge and vertically centered with
the logo. The switch stays fixed while scrolling on Work, Shop and Collection. Its viewport-based anchor and shared link geometry keep it stationary across views, including when scrollbar visibility changes; page-nav labels share the same flex alignment. On phones it occupies a second row to avoid crowding. Work
uses the old Shop’s native vertical looping gallery: 4:3 desktop and 3:4 mobile project thumbnails, captions to their right on desktop and below on smaller screens, with faded neighboring projects and keyboard navigation (`js/practice-gallery.js`, `css/practice-studio.css`). Reduced motion uses a bounded list with all captions visible; no-JavaScript retains the full vertical list. The previous horizontal implementation is preserved in `_archive/practice-horizontal-2026-11-10/`. The switch shares navigation typography and is limited to the Studio/Shop/Collection views; page navigation uses its former compact spacing. Where the sidebar is visible, its top edge and the Work thumbnails, Shop grid, About/Contact headings and policy-page headings share `--practice-content-top` (128px). Sidebar labels and first headings trim their top font leading to align the visible letter edges with that line; desktop project names use the same trim to meet the thumbnail top. Work’s scroll snapping and keyboard navigation use that same start line; mobile retains its separate header clearance. Shop uses three desktop columns,
two on tablets and one on narrow phones, retaining the existing typography,
clockwise thumbnail tilt and reduced-motion handling. Home retains a fixed language control
on desktop; mobile uses the menu. The Studio footer shares its 24px bottom inset and vertical center with that control, with social links aligned to the left navigation edge. Copyright and Privacy/Legal links are hidden only in this Home/Studio footer. Inner pages retain footer language controls. Short pages stretch their main area so the footer keeps the same 24px bottom inset as longer pages.
Project copy and artwork are authored in `data/work-projects.html`; the Japanese
builder writes `data/work-projects-ja.html`, then the SEO generator creates the
six standalone project pages. `/work/` redirects to Home; old project hashes
redirect to their case-study routes. Earlier chronological notes below describe
superseded versions where they conflict with this section.

Collection fills the viewport beneath the shared navigation, without a framed
container. Collection shares the same 480ms vertical page swipe as Work and Shop, without a second canvas entrance. It uses the original infinite, virtualized flat canvas in `js/objects.js`; products repeat in every direction.
Two-finger scrolling or dragging pans the canvas. Pinching, the bottom-right slider, and keyboard +/− change zoom around the current position; arrow keys pan and Enter opens the centered product. Collection opens at minimum zoom (0%), showing the wide canvas overview. The compact slider keeps its 24px safe-area-aware inset on desktop and mobile. Search and info controls remain hidden. Reduced motion makes zoom and centering immediate.
The retired globe assets are preserved in `_archive/collection-globe-2026-11-11/` and are not loaded by active pages.

Canvas products continuously grow and become more opaque toward the viewport center, then shrink and fade toward its edges as the user pans or zooms. A smooth distance falloff preserves the flat grid and click targets without rearranging products. Hover labels retain their small text size regardless of product scaling. The center enlargement tapers away at maximum zoom; reduced motion keeps the opacity hierarchy but disables the additional scaling. The embedded Shop preview retains its original presentation.

At maximum zoom, selecting a neighboring product first glides it into the center; only selecting the focused product opens details. Dragging or scrolling can interrupt that glide. At wider zoom levels, products open directly. Selecting a product enlarges its cutout directly over the collection, while surrounding content fades away. No beige panel expands during the zoom; the opaque hero ground takes over at rest.
Left/right pixel arrows browse the collection in place and wrap at either end; keyboard arrows work while the hero controls are focused. The original canvas position is preserved on close. Exiting from the hero shrinks only the product cutout back into the collection while its full-size ground dissolves in place; exiting from the scrolled details uses a short dissolve without a scroll-back or shrinking panel.
On scroll, the hero stays pinned in place while an opaque white, bordered reading surface passes above it, with a 60:40 layout: gallery on the left and product information on the right, divided by an ash-brown rule. On phones, information stacks above the gallery. This stationary layering also applies with reduced motion. Gallery photographs retain their two-column grid without gutters and use their original aspect ratios so products are not cut off by square or panoramic crops. An odd final photo spans both columns; photo credits remain visible.
Scroll down (or click/tap the enlarged product image or its caption) for the description, product link, tags
and colors, followed by its credited photographs. Three similar products appear at the bottom, ranked by shared tags, brand and category. Selecting one updates the same dialog and returns to its hero; closing still returns to the original collection position.
The close control and Escape return to the same canvas position. The new
layout lives in `css/collection-view.css`; reduced motion skips the zoom, and the
no-JavaScript catalogue remains available.
FC is English-only. The shared mobile menu makes the background inert while open.

## Preview and checks

```sh
python3 scripts/preview.py           # http://localhost:4173
python3 scripts/build-japanese.py    # regenerate Japanese routes after English changes
npm run test:performance             # preview lifecycle, image delivery, local references
python3 scripts/build-preview.py     # generate private, no-index dist/; does not deploy
python3 scripts/audit-site.py dist   # verify packaged references
```

`npm test` is the older interaction suite. It currently contains stale DOM/source mocks; see `docs/PERFORMANCE-REVIEW-2026-10-20.md` for the baseline failures. Do not interpret the targeted checks as a passing full suite.

## Current routes

| English | Japanese | Purpose |
| --- | --- | --- |
| `/` | `/ja/` | Vertical portfolio and Work / Shop / Collection switch |
| `/about/` | `/ja/about/` | About the practice, its founder and Familiar Characters |
| `/work/` | `/ja/work/` | Legacy redirect to Home; nested case-study URLs remain |
| `/shop/` | `/ja/shop/` | Day Bag and Memoru; three-column desktop grid |
| `/familiarcharacters/` | English-only; Japanese route redirects | Familiar Characters collection and product details |
| `/contact/` | `/ja/contact/` | Contact form |
| `/red-pixel/` | `/ja/red-pixel/` | Red Pixel grab-to-play Pong |
| `/objects/` | `/ja/objects/` | Legacy collection redirects |

## Page navigation

Main-site pages share `css/page-transitions.css`: a 480ms bottom-to-top reveal
with a narrow Icon Red seam between the old and new page. Native cross-document
View Transitions cover Home, Studio, Shop, About, Contact, Privacy, Legal, Red
Pixel and standalone project pages in both languages, including history and
language navigation. No navigation is intercepted or delayed, and no page fades.
Reduced motion disables the transition; browsers without support use normal
navigation. External/new-tab links and in-page dialogs retain their own behavior.
Familiar Characters keeps its separate canvas/card motion and does not opt in.
English source pages own the stylesheet link; Japanese and project generators
carry it through to their output. The small navigation/layout entry scripts are
render-blocking so the incoming snapshot includes the initialized mobile menu
and gallery layout; imagery and lazy-loaded features are not held for the wipe.

## Source map

- `css/walla.css`, `css/fonts.css`, shared navigation/control styles: common layout and brand typography.
- `js/site.js`: shared clean-hash links, viewport measurement, year and production-only analytics. `js/mobile-nav.js`: mobile menu.
- `index.html`, `shop/index.html`, `css/practice.css`: current Work / Shop shell. Legacy Home scripts and tote assets remain available but are not loaded on Home.
- `about/index.html`, `css/about.css`, `css/about-rooms.css`, `js/about.js`, `js/house-assembly.js`: project-Overview-style labels and large body copy. The combined opening retains reading ink, followed by the house assembly and Studio zoom/title handoff. Studio settles onto Soft Beige; Studio and Shop then follow normal document scrolling. Interior drawings are archived. Reduced motion uses normal document flow.
- `data/work-projects.html`, `data/work-projects-ja.html`, `scripts/site_seo.py`, `css/work.css`: case-study source and generated standalone pages. Old Studio gallery scripts remain dormant; Home links directly to each case study.
- `shop/index.html`, `css/shop.css`, `js/shop.js`: Day Bag and Memoru gallery; existing clockwise tilt, red Coming soon hover labels and white thumbnail treatment. No collection preview is loaded here.
- `data/objects.json`, `scripts/build-objects.py`, `css/objects.css`, `js/objects.js`, `js/finds-menus.js`: collection catalog, virtual canvas, filters and details. Current public name is Familiar Characters; URL is `/familiarcharacters/`.
- `data/finds-images.json`, `scripts/build-finds-images.py`: device-sized lossless catalog derivatives; native originals and provenance remain intact. Existing derivatives are content-hashed and cached immutably.
- `red-pixel/index.html`, `css/red-pixel.css`, `js/red-pixel.js`, `js/pong-physics.js`: grab then throw to start Pong on Ash Brown. Player is left, level-five 2D1 BOT right; first to three. Mouse/touch and Up/Down or W/S control the paddle; Click/tap or Space pauses/resumes, and Escape exits; dragging never toggles pause. The red puck plays on a court without lines, with Home-navigation labels, enlarged scores, and Soft Beige “First to 3” directly above the scoreboard. Enter grabs/throws for keyboard users. The opponent reads the ball every 220–360ms, accelerates and brakes smoothly, repositions between returns, and makes consistent aiming errors with occasional larger misreads. Square impact particles and a center burst on player scores respect reduced motion; visibility loss and resizing pause play. No-JavaScript retains the native BIGGER/SMALLER size control.
- `contact/index.html`, `js/contact.js`, `css/contact-page.css`: contact page. Contact code loads only on that route; legacy drawer support remains available there.
- `locales/ja.json`, `scripts/build-japanese.py`, `js/language.js`, `js/ja.js`: English source plus generated Japanese HTML and dynamic translation dictionary.

Updates are social-only: Home has no email signup form. The former newsletter is
archived; it is not a launch dependency. The only active email inputs are on the
English and Japanese Contact pages. See `docs/CONTACT.md` for inquiry delivery.

Use local fonts, Icon Red `#FF2B00`, Soft Beige `#FAF0E6`, Ash Brown `#191416`, and Cranberry Brown `#320505`. Preserve keyboard access, reduced motion and no-JavaScript fallbacks. Forms are unconnected: do not claim submissions are sent or saved. Purchased-count backend notes are in `docs/PURCHASED-BACKEND.md`.

## Assets and packaging

`img/` retains supplied photographs, catalog sources, provenance and responsive delivery versions. Do not delete source images just because a smaller version is displayed. The preview packager follows active page scripts/styles and image references, includes catalog variants and required fonts, and omits historical source files and desktop font formats. It includes all current routes, including nested discovery pages, preserves no-index headers, and never publishes. `npm run build:hosted` also prepares the private Worker bundle; see `docs/HANDOFF.md` before using hosted workflows.

## Archives and review history

`_archive/` contains superseded designs and removed features. The October 20 cleanup manifest is `_archive/performance-cleanup-2026-10-20/manifest.json`; its README explains restoration. The former long README, including all design decisions and chronological notes, is preserved in `_archive/performance-cleanup-2026-10-20/README-history.md`. Temporary screenshots remain under `_previews/`; image research and the old preview checkout remain under ignored `tmp/`.

Latest performance findings, verification and remaining risks: `docs/PERFORMANCE-REVIEW-2026-10-20.md`.

Home and About share the ash-brown Contact ending and footer social links.
“Get in touch” leads to the localized Contact page. Email signup was removed on
22 October; the current Contact sections are at least 70vh tall, with vertically centered
content and balanced padding; they grow naturally when content needs more room.
The shared ending script handles both routes, including language-control contrast,
keyboard uncovering and reduced-motion fallback.

About’s room titles align with the footer social-links edge; body copy and
CTAs occupy the second column. The shared social edge remains the reference for
future content placed in that area.

The “mini house” is the transparent miniature of the toy-block house, with oblique
geometry, softly rounded edges and lightly shaded side faces. Open gaps separate
the roof and the two lower compartments at both desktop and mobile icon sizes.
About 2D1 fills the roof; Studio and Shop use the same mini house above their titles: the left block is
filled for Studio, the right block for Shop. Icons follow each room’s ink color,
including Soft Beige on the dark Studio wall. Hovering a mini house spreads and
slightly rotates its three pieces; leaving springs them back. The SVG hit area
stays fixed, and reduced motion keeps the house still.
Standalone icons should remain transparent and invert on dark backgrounds.

### Inside-the-cube About study — 20 October

The revised interactive concept is at `_experiments/cube-rooms/` (local preview
`/_experiments/cube-rooms/`). It uses a flat-on room drawing with title and body in two columns, bare side
walls, and a horizontal Studio-to-Shop exchange without rotation or camera zoom. The approved direction is now implemented on the bilingual About page below;
the standalone English study remains available for reference.

### About flat rooms — implemented 20 October

The English and Japanese About pages now use the approved flat-on room layout
from the cube study. The toy-block diagram assembles, then zooms into its Studio block on scroll
before revealing the flat-on Studio room. Its Studio label stays visible, straightens
and settles into the actual section heading through a decorative SVG overlay;
the handoff reverses on scrolling back. Native scrolling brings Shop in from the right while Studio slides left.
Rooms never tilt or zoom. Bare side walls, rounded frames and subtle hatching
surround a two-column layout: title left, existing copy, emphasis and CTA right.
The title edge is measured against the footer social links on desktop; mobile
uses 24px. Long copy gains vertical reading travel before the room exchange.

`css/about-rooms.css` scopes the production layout; `js/house-assembly.js` handles
assembly, the room handoff, reading travel and keyboard focus. The former media
banners and room icons are preserved with the previous About source in
`_archive/about-before-flat-rooms-2026-10-20/`. The slideshow script remains
available but is no longer loaded by About. The mobile menu icon follows the
dark/light room colors. Contact and the footer retain their underneath reveal.
Reduced-motion and no-JavaScript layouts keep both rooms in normal document flow.

Verified rendered English desktop/mobile and Japanese mobile, native room
scrolling, keyboard movement into Shop, the Shop CTA destination, footer reveal,
valid EN/JA nesting and JavaScript syntax. Reduced-motion/no-JavaScript branches
were source-reviewed but not browser-emulated in this pass.

### Related-project thumbnails — 20 October
“See more work” thumbnails share a 16:9 frame with automatic height, overriding native image height attributes. They use the Studio gallery’s 8px lift and 2-degree clockwise tilt on fine-pointer hover and keyboard focus; reduced motion disables the transition. Equal image dimensions, hover transforms, project navigation, and zero horizontal overflow were verified in English desktop and Japanese mobile previews.

### Stable project-opening captions — 20 October
The detail scroller keeps a stable scrollbar gutter while the shared-image handoff temporarily locks scrolling. This prevents its width from changing when the transition finishes, so the hero caption and one-liner do not jump. Frame-by-frame English desktop and Japanese mobile checks showed one unchanged caption geometry throughout opening; close behavior and zero horizontal overflow were also verified.

### Free Studio scrolling — 20 October
Studio retains its horizontal layout but follows Shop’s free-browsing behavior: gestures are no longer limited to adjacent cards, and releasing a gesture does not force a centered stop. Native horizontal input remains available; vertical wheel/touch input moves continuously through the gallery. Loop rebasing preserves the exact scroll offset. Explicit preview clicks and arrow keys still center projects. English desktop wheel/trackpad input, Japanese mobile swipes, free resting offsets, and project opening/closing were verified.

### Studio center snapping — 21 October
Studio still allows each gesture to travel across multiple projects. When input stops, it now settles the nearest project at the viewport center instead of retaining a partial offset. Native horizontal scrolling uses mandatory center snapping; vertical wheel/touch input eases to the nearest frame. Loop rebasing preserves the centered position. English desktop and Japanese mobile checks verified wheel, horizontal input, touch swipes, and project opening/closing, with resting center offsets below one pixel.

Home’s work-track uses 560/1120px square WebP tiles, rebuilt with
`python3 scripts/build-work-track.py`. Wide website and laptop compositions retain
their full framing inside square grounds. Desktop English and mobile Japanese
renders were checked; all eleven tiles load at 280 × 280 CSS pixels.

The wide Home artwork tiles now render over full-square project backgrounds in
`css/work-track.css`, preserving the complete composition. DeepDrip’s website uses
an extended pixel texture behind the unchanged native website image. The earlier
flat letterbox derivatives remain preserved but are no longer used for these tiles.

### Flat room view restored — 21 October
The owner reverted the furnished interiors and speech sheets to the previous
flat cube-interior view. The connected rounded frames, two-column copy, house
zoom/title handoff and horizontal Shop transition remain. The furnished study
is preserved in `_archive/about-furnished-rooms-2026-10-21/`. A clearer editorial
layout is under consideration; no replacement direction has been implemented.

The Armada material disclosure matches the FC info sheet: white paper, 2px Icon
Red border, 16px/1.6 body type, generous padding and a pixel close button with the
shared red hover treatment. Native disclosure remains usable without JavaScript;
mouse hover, pinned click, outside dismissal, close and Escape remain supported.
English desktop and Japanese mobile opening/closing were exercised in preview.

Legacy `/finds/` and `/ja/finds/` redirect to the corresponding Familiar Characters route, as do the older Objects routes.

Familiar Characters places its collection-info button at the top left and zoom at
the bottom left. The separate Home button is removed; the logo still links Home.
The info sheet opens beneath its button; on phones the logo sits at the top right.

### Editorial About layout — 21 October
The display title and opening icon are removed. A small About label introduces
one opening statement beginning “2D1 is an independent design practice by Kosuke
Futsukaichi. I call it a design house…”. The portfolio and FC links remain live.
Studio and Shop now use the project Overview arrangement: a muted label on the
left and 32px/1.3 body copy on the right, with shared reading-edge alignment.
Mobile stacks the label above 24px copy; Japanese uses 28px desktop / 22px mobile.
Interior frames, side-wall lines and room icons are removed from active markup.

The opening word reveal and native cover remain, with reading travel calibrated
for the smaller type. House assembly, Studio zoom and title morph remain.
Studio fades onto Soft Beige at the end of the handoff; the moving title settles
into muted label ink, and navigation returns to dark text. Studio then exits
upward as Shop enters from below. Longer copy retains vertical reading travel;
keyboard focus uncovers the appropriate section and link. The footer is unchanged.
No-JavaScript and reduced motion keep the complete text in normal document flow.
The previous flat room source is preserved in
`_archive/about-before-editorial-layout-2026-10-21/`.

About’s Studio section reuses Home’s Services table before “See the work”, with
the same names, details, ruled rows, type and responsive columns in EN/JA. The
scroll journey measures its added height so the full table remains reachable.

### Free-scrolling About sections — 21 October
Studio and Shop are ordinary full-height-of-content sections in document flow.
Their pinning, scripted vertical translation, reading-travel spacers and focus
scroll override are removed. Only the diagram retains a bounded sticky wrapper
for its assembly and zoom; Studio overlaps the final viewport for the existing
title handoff, then releases immediately into native scrolling. Sections move
one-to-one with document scroll, and the Services table is naturally reachable.
The previous pinned section implementation is preserved in
`_archive/about-before-free-sections-2026-10-21/`.

About’s text stays fully opaque; its word-by-word reading reveal and route-specific
reading-ink script load are removed. Home retains its existing word reveal.

### Typography controls removed — 23 October
The temporary type settings panel is removed from every active English and
Japanese route and the collection generator. Its source is preserved in
`_archive/type-tuner-2026-10-23/` and is never loaded by the active site.
Typography changes are maintained through the shared styles in `css/typography.css`.

### Home house sequence and restored About essay — 21 October
This supersedes the editorial About and free-scrolling About section layouts above.
Home now places the toy-block house immediately before its existing Studio section.
`css/house-journey.css` and `js/house-assembly.js` retain the assembly, zoom into the
Studio block, and traveling Studio label. The handoff settles onto Soft Beige;
Studio and Shop then continue in native document flow. The label overlay sits
outside Home’s transformed main element so it stays in viewport coordinates.
Navigation and the language toggle remain legible over the dark diagram, with
Home’s active link still red. Reduced motion and no JavaScript show the assembled
house followed by ordinary sections, without the pinned zoom.

About is a single continuous essay again, using the complete text from the owner's
Google Doc `1sINg_Qx3vVPTlpX6IsUj54eOt4_PU95da5y2o5YQRZU` (20 October copy).
Repeated navigation rows from the document are omitted. The original headings,
paragraphs, emphasis and useful links are restored; collection links use the
current Familiar Characters route. Its `css/about-essay.css` uses the site's
Walla/Noto fonts, a restrained reading column, generous paragraph spacing and a
Soft Beige ground. About no longer loads the diagram, room or reading-reveal
scripts/styles. Its Studio/Shop service sections are removed; the red essay-end
square and Contact/footer remain. English and Japanese are both updated.
The previous About implementation is in
`_archive/about-before-home-house-2026-10-21/`.

Verified in preview: desktop English forward/reverse house transition, mobile
Japanese house-to-Studio transition, essay layouts, mobile navigation and Studio
keyboard access. The restored English prose matches all 16 source paragraphs.
The performance/reference audit passes with zero broken local references.

Home’s intro uses the owner’s saved typesetting from 21 October: 40px, weight
500, −0.01em tracking and 1.35 line height from 768px in both languages. Phone
reading sizes and spacing retain their existing rules.

Both About overview paragraphs share the saved 28px / 500 / −0.01em / 1.4 settings
from 768px in both languages; other essay paragraphs and phone styles retain
their existing hierarchy.

Home color refinement — 21 October: the diagram-to-Studio handoff now stays on
Ash Brown, with Soft Beige text and a matching light traveling label. Navigation
and language controls remain inverted throughout Studio. Home’s sign-up/sign-off
and footer use Soft Beige with Cranberry Brown text, fields and social links.
Other pages retain their existing ending colors. Both language routes are updated.

Home’s house entrance retains the former About cover behavior: the intro holds
with its final line at 60% of the viewport while the opaque house panel rises
over it at native scroll speed. Reverse scrolling uncovers the intro cleanly.
The reading reveal follows the intro’s original document position, and keyboard
focus brings covered intro links back into view. Reduced motion and no-JavaScript
use ordinary document flow. Verified forward/reverse scrolling on desktop English
and mobile Japanese, plus keyboard return to the intro.

About’s essay, including its header and overview, caps at 680px and centers with
auto side margins at every width. Mobile retains 24px insets. This replaces the
previous desktop offset to the footer social-links edge for this essay.

The shared About essay body style uses saved tokens: 24px, weight 400, 0.01em
tracking and 1.5 leading at desktop/tablet widths in both languages. Mobile
reading rules and emphasized text retain their existing hierarchy.

All `.section-copy` text shares Home’s intro typesetting from 768px: 40px,
weight 500, −0.01em tracking and 1.35 leading, including tote introduction and
closing copy in English and Japanese. Phone reading scales remain unchanged.

About’s Contact ending and all project-detail footers use Icon Red with white
text, social icons, navigation and inverted language controls. About’s docked
logo and menu invert when the ending passes behind them. Home keeps its own
Soft Beige ending; scroll reveals retain the same behavior.

Home’s work track contains only current project-gallery assets (11 selections),
including current Supa branding and Aviator mockups. It reuses gallery srcsets;
the DeepDrip laptop sticker frame uses a height-filling crop anchored left. UI mockups retain their full composition on matching extended grounds; photos
and brand marks use individual full-bleed square crops.

Work-track photography must fill every square with no letterboxing or white
gutters. Use per-image focal positions; complete UI mockups can use their own
matching background color/texture extended across the frame. Do not add white
as a generic fallback for an image that does not fill its frame.

Home’s house assembly now follows scroll progress on every pass. Scrolling back
up returns the blocks to their exploded positions, so the assembly replays on
re-entry rather than remaining built after its first appearance. Verified a full
assemble → reset → assemble cycle in the running preview. Both languages share
this behavior; reduced motion retains the static assembled diagram.

### Responsive QA — 21 October
Shop captions stack below images through tablet widths and participate in card
height, preventing overflow and translated-copy overlap. Contact category chips
use 44px touch targets, and the no-JavaScript contact page disables Send while
showing its Notion fallback. Local typography controls start collapsed on phones,
remember their session state, and clear the collection zoom controls.
See `docs/RESPONSIVE-QA-2026-10-21.md` for the viewport matrix, interaction checks,
remaining test-harness failures, and browser coverage limits.

About’s essay now shares the footer social-links left edge at desktop widths,
expanding to a 128px right gutter. From 1280px, complete sections alternate left
and right in two equal columns with a 64px gutter and 96px between sections:
An eye for things → Room for more → Familiar Characters → Reduction with wit →
Things of my own and things worth sharing. The title and introduction retain a
680px reading cap. Smaller screens use a single column in source order. English
and Japanese desktop placement and Japanese mobile reading/overflow were checked
in the running preview.

About refinement: the alternating section layout is reverted. All essay sections
now share one 680px reading column at the footer social-links edge; the wider
opening remains above it. The named about-overview style is 32px / 1.3, weight
500, with −0.01em tracking on desktop, retaining the responsive 24px phone size.
Both language routes share these rules. Verified desktop section alignment,
English/Japanese overview styles and mobile width without horizontal overflow.

Red Pixel’s native size control reads BIGGER at 1px and SMALLER at 24px. Growing
is immediate; shrinking retains the 720ms overshoot transition. The labels also
work without JavaScript through the details element. Verified both states and
transition durations on English and Japanese routes using keyboard activation.

Releasing or cancelling a pixel grab without throwing now restores the size
selected before the grab: a small pixel shrinks back, while an enlarged pixel
stays at 24px. Throwing still starts Pong. Verified small and large pointer
releases in preview, including the Japanese route.

Red Pixel returns to the flat pixel and Pong. Throwing carries the red pixel
from its release position into the court over 240ms, shrinking it into the puck
before play continues. Exit reverses the handoff: the current puck moves back to
the center and shrinks to the original red pixel over 240ms while the page returns
to beige. Enter twice provides the same entrance handoff. Reduced motion
starts immediately; Exit, resize, hidden tabs and interruption clean up the handoff.
The superseded cube sequence is preserved in `_archive/red-pixel-cube-2026-10-21/`.

### Aviator gallery — 21 October 2026

The Studio project gallery follows Figma frame `413:4414`: looping website
walkthrough, paired color/Season type studies, the family message, social and
care UI, mobile website and app icon, photography collage, bottle/cap pair, and
website-footer mockup. The existing cover/hero handoff remains in place.
`img/projects/aviator/gallery.json` records the Figma nodes and source exports;
`python3 scripts/assets/build-project-gallery.py aviator` regenerates responsive WebP
versions without upscaling. Original PNG exports are preserved in
`img/projects/aviator/originals/gallery-2026-10-21/`; the previous gallery markup
is in `_archive/aviator-gallery-2026-10-21/`.

The website movie uses the owner’s `img/projects/aviator/aviator-website.mp4` export, delivered as
an optimized 1080p MP4. It autoplays muted, inline, and loops when at least 25%
visible; it pauses offscreen, in hidden tabs, and when the project closes.
Controls stay hidden; clicking the video or pressing Space/Enter while focused pauses/resumes it. Reduced motion and no-JavaScript show the static
poster. English and Japanese use the same gallery, with translated image text.

The owner’s updated `Frame 1000008025.png` and `1484.png` replace the color/type
and photography studies. Transparent gaps/corners are preserved. The color/type
export is split at its existing transparent gutter for responsive stacking, with
no change to the artwork. Superseded exports are preserved alongside the old
gallery in `_archive/aviator-gallery-2026-10-21/superseded-exports/`.

Verified the updated gallery in the running English desktop and Japanese mobile
project views: all 12 artwork slots load, image pairs have equal heights, the
new collage retains transparency, and the 5.2 MB video autoplays/loops muted
without controls, pauses offscreen, and can be paused/resumed with click or
keyboard. Gallery-local reference and dimension checks pass. The broader site
audit reported two missing legacy Rand font files in `css/fonts.css` at that
checkpoint. Those unused declarations were removed during the purchased Walla
font replacement on 23 October; preview packaging now passes.

### DeepDrip gallery — 21 October 2026

The project gallery follows Figma frame `413:5289`: laptop stickers, cap, hoodie,
color palette, D monogram, browser tab, editorial website,
paired category tags/article cards, category illustrations, website footer, and
the owner-supplied eye movie. Responsive artwork preserves the exported aspect
ratios and transparency, with paired panels stacked on phones. The cover/hero
and existing project transition are retained.

`img/projects/deepdrip/gallery.json` records Figma node identities and original
exports. Run `python3 scripts/assets/build-project-gallery.py deepdrip` to
regenerate WebP delivery files without upscaling. Source PNGs are retained under
`img/projects/deepdrip/originals/gallery-2026-10-21/`; previous gallery markup is
preserved in `_archive/deepdrip-gallery-2026-10-21/`. The 77 KB eye video is
already efficient and is copied without re-encoding. It shares Aviator’s muted,
inline autoplay/looping behavior, hidden controls, offscreen/hidden-tab pause,
click/keyboard pause, and static reduced-motion/no-JavaScript poster. Both
language routes use the new gallery with translated descriptions.

The DeepDrip social-profile mockup was subsequently removed at the owner’s
request. Its original and responsive exports are preserved in
`_archive/deepdrip-gallery-2026-10-21/removed-social-profile/`.

SUPA’s project gallery follows Figma frame `413:5755`: stage wordmark, symbol, symbol concept, paired badge and business cards, owner-supplied color palette, Supa.ai wordmark, website and app dock. Native exports and node provenance are in `img/projects/supa/gallery.json`; regenerate responsive WebPs with `python3 scripts/assets/build-project-gallery.py supa`. The previous gallery markup is archived in `_archive/supa-gallery-2026-10-21/`. The separately supplied header banner is retained.

Project detail endings now reuse About’s dark-brown Contact invitation and shared footer
markup/styles: “Let’s work together”, Get in touch, copyright and social links.
The language toggle stays inside the project footer. The ending uses the same
sticky reveal, with its height measured inside the project’s own scroll container.
All three projects were checked on English desktop and Japanese mobile, including
opening, scrolling to the ending, keyboard focus, and closing. No horizontal
overflow was found.

Studio’s centered loop copies forward project-opening clicks directly to their canonical project without recentering the carousel. Click selection measures the current visible center synchronously, including while settling.

About and project ending sections use Ash Brown (#191416), with a red Contact
label square, white text
and social icons, red link hover, and inverted white/brown language controls.

Project details automatically reveal the top bar at the bottom of the scroll,
keeping breadcrumbs and Close available without needing to scroll upward.

About copy refinement — 22 October: the opening remains unchanged. The essay body
is condensed to four sections: Background, Familiar Characters, Reduction with
wit, and Studio and Shop. Childhood and business-origin anecdotes are removed;
the copy focuses on education/career, design principles, and the exchange between
client work, original products, and curation. English and Japanese are updated.

About copy/typesetting — 22 October: applies the owner's revised text, including
the Japan/Arizona background. All essay copy uses the shared `--type-spec` caption
and Home specification size at 1.5 leading with zero tracking; headings use Medium
and paragraphs Regular. Both language routes are updated.

About reading width — 22 October: the title, opening and essay share a centered
680px maximum column, with 24px side insets on smaller screens. This supersedes
the previous desktop social-links offset for About's essay.

About reading refinement — 22 October: essay text and headings use 16px type
with 1.5 leading; paragraph gaps are 24px on desktop and mobile in both languages.

Shared alignment correction — 22 October: About's reading column starts at the
footer social-links edge again, while retaining a 680px line-length cap. Home,
About, Contact and footer use shared `--reading-left` / `--reading-width` geometry;
tablet footers now follow the same capped reading edge. This supersedes the
previous independently centered About column. The rule is recorded in AGENTS.md.

About copy revision — 22 October: the owner's latest text is organized as About
me, Studio & Shop, and Familiar Characters. Reduction with Wit is introduced in
About me. The opening, 16px typography, 24px paragraph spacing and shared footer
social-links alignment are retained. English and Japanese are updated.

About centered alignment — 22 October: About scopes the shared reading tokens to
a centered 680px maximum column. Its essay, Contact CTA and footer social links
move together, satisfying both screen centering and same-page left alignment.

About desktop columns — 22 October: from 1100px, each section uses a title column
and body column, aligned at the top. Titles stick 96px below the viewport top and
release at the end of their own section. The opening uses the same arrangement.
About returns to the shared desktop social-links reading edge and uses its full
available width; the earlier centered-column iteration is superseded on desktop.
Phone/tablet retain the single-column 680px-capped layout. No scroll scripting is
needed for sticky headings, and both languages share the layout.

The shared mobile menu now follows the red project footer: white logo, route navigation, copyright, pixel social links and an EN/JA segmented language toggle. Extra footer content is hidden in desktop navigation; the existing mobile focus trap, Escape, page scroll locking and reduced-motion behavior remain shared across routes.

The Shop Familiar Characters hover preview warms its live canvas while the card is visible, retains decoded tiles and stable image sources, and keeps the static monitor until a same-origin ready handshake. Its full zoom-in/out loop lasts six seconds (three each way), resets on leave, and stays static with reduced motion.

Contact centered column — 22 October: the heading and form share a centered
680px maximum column with 24px minimum side insets. The Contact footer social
links use the same scoped reading edge, preserving left alignment in both languages.

Familiar Characters’ info sheet now enters downward from its top-mounted FC control and dismisses upward. Its About 2D1 action navigates to the language-matched About page; the former nested-sheet opener is archived under `_archive/fc-info-about-2026-10-22/`.

Home bag/signup refinement — 22 October: the Shop introduction and bag study now
scroll in normal document flow, separated by a top divider. The former cover and
pinned image/specification scripts remain in source but are no longer loaded.
Signup and footer retain the reveal below the main content, now on Ash Brown
with light text and controls. Signup reads “Sign up for updates” / “Sign up”;
the email placeholder uses a lighter weight. Both languages share this behavior.

Home ending/bag follow-up — 22 October: the bag image-to-specification scroll
animation is restored via bag-layout.js; the outer Shop-to-bag cover remains off.
Home now uses About’s “CONTACT” invitation, blinking eyes,
Get in touch link, and compact footer on Ash Brown, retaining the reveal below
main content. The superseded signup markup is preserved in
`_archive/home-signup-2026-10-22/ending.html`. The tote closing now invites visitors
to follow for activity updates. English and Japanese are updated together.

Shop order — 22 October: after “The joy of making”, the animated bag/specification
spread now comes before the “Day Bag is our first everyday item” paragraph.
The divider above the bag study is removed. The closing development note follows.

Shop order follow-up — 22 October: the “Day Bag is our first everyday item”
paragraph is back above the animated bag/specification spread. The divider remains removed.

Home’s Studio artwork track sits immediately after “At our core, we’re a design studio.” The remaining two description paragraphs follow the full-width track, ahead of Services, in both languages.

Bag study photograph — 22 October: Home now uses the cooler hanging bicolor
concept, `img/shop/bag-study-2026-10-22/2d-tote-bicolor-daylight-hanging-neutral.webp`,
in both languages. Intrinsic dimensions and viewport-height sizing follow its
1086 × 1448 aspect ratio. The previous `img/shop/life-tote-studio-v4.webp`
remains available; the existing bag/specification scroll animation is preserved.

Shop’s Familiar Characters hover preview scales a predecoded grid as one layer to avoid missing image layers inside the rotated monitor. Its six-second zoom cycle resets on leave; the card tilts counterclockwise.

The Shop FC monitor shows a language-specific still captured from the live preview’s initial 1600×900 view while it loads. Once decoded, the live canvas stays visible at rest; hover or keyboard focus animates that same canvas. This prevents product changes between a stale poster and the current catalog. Both use the exact same screen bounds to prevent a size shift at the handoff. Reduced-motion and no-JavaScript visitors retain the still.


Home tote lifestyle story — 22 October: the approved v15 lifestyle photograph
now follows “The joy of making” as full-bleed artwork. Native sticky positioning
holds it beneath the introduction and the following Soft Beige product copy;
there is no scroll interception. Desktop/tablet use viewport height; very tall
phone crops cap at twice the viewport width to keep the square tag and logo
visible. Reduced motion and no-JS use normal flow. The earlier hanging photo
and image/specification spread are retained in assets and
`_archive/bag-spread-2026-10-22/bag-study.html`; bag-layout.js is no longer loaded.

“View specifications” sits halfway down the lifestyle photo, right-aligned with
24px safe-area-aware inset, in Soft Beige at the shared 14px action size. It
opens a borderless, flush-right sheet, 50dvh tall and vertically centered,
with a Soft Beige ground and dark brown type. The compact 15px heading / 14px
specifications are shared across English and Japanese. The sheet is nonmodal:
no scrim, page dimming, or page scroll lock. Close, Escape, and clicking outside
dismiss it; keyboard dismissal returns focus to the trigger. Specifications
scroll independently beneath the fixed close control. Without JavaScript the
photo button remains a native details disclosure. Armada notes expand inline.
The development note follows the product paragraph. The concept disclaimer and
provisional dimensions remain in the specifications.

Tote image selection — 27 October: the red-short-handles v16 image is the
single active lifestyle photograph. The comparison toggle, alternate image and
switching code have been removed. Specifications now describe the solid dark
shoulder strap and red short handles in both English and Japanese. The former
comparison implementation is preserved in `_archive/tote-toggle-2026-10-27/`.

Specifications sheet refinement — 22 October: the sheet fills 70% of the dynamic
viewport height, capped at the viewport height minus 48px, with internal
scrolling only when needed. Its fixed header aligns the title and close button on the same center
line. Entrance is 320ms with a soft ease-out; exit is 240ms. Reduced motion
remains instant, and the page remains undimmed and scrollable.

The tote specification trigger travels with the copy wipe, flush to its top and right edges, on a soft beige background with 12px padding.

The tote specification sheet opens upward from the viewport bottom with a gentle 640ms ease-out and closes downward over 480ms. Reduced motion remains instant.

Footer eyes and the Contact marker stay Icon Red. Pixel-arrow CTAs use one shared sweep coordinate space across label and arrow, so the color reaches the arrow after crossing the label.

Active page navigation keeps its 6px square visible, with the same 12px label offset as hover. The marker is Icon Red on desktop and Cranberry Brown to match the active link on the red mobile menu. Language and social controls are excluded.

Tote comparison — 25 October: removed the Red logo (v17) option at the owner’s request. The active comparison contains only Bicolor strap (default) and Red handles. Removed markup is preserved in `_archive/tote-red-logo-2026-10-25/`; the source image remains available for future review. Both language routes share the two-option comparison.

### Shared typography roles — 22 October 2026

11 November: About uses shared Display headings (48px) and Statement body copy
(32px/44px) from 768px upward, in English and Japanese. All other consumers of
those roles inherit the update; smaller mobile metrics remain unchanged.

`css/typography.css` defines eight core roles and named weight/leading variants.
Repeated font recipes across active stylesheets use these tokens; About’s
previous heading/body override chain is consolidated there, and Shop captions
use their caption recipes directly. Responsive sizes, Japanese font selection,
and intentional display exceptions are preserved. See [Typography](docs/TYPOGRAPHY.md)
for the role table and rules for adding or changing text styles.

Near-duplicate typography was subsequently merged: ordinary UI text uses 1.5
leading, Contact uses the shared 20px reading style, and small FC metadata uses
the 12px/14px roles. See the typography guide for the deliberate visual changes.

Red heading markers share a single typography rule: square sides are 75% of the font’s capital height, centered against the capitals, with a 0.4em label gap. This applies to section, signup and Contact headings in both languages.

Unified CTA sweep — 22 October: text links with pixel arrows now measure one
sweep from the first label glyph to the far edge of the arrow. The label and
masked icon sample that same moving edge in pixels, including Studio project
and Shop external-link actions. Resize, font loading, and dynamically added
controls refresh the shared measurements. Hover and keyboard focus use the same
480ms timing; reduced motion is instant. Both language routes share the fix.

Normal text now uses the canonical shared-role mapping at the end of
`css/typography.css`, loaded last on every active route. Home statements,
Contact titles, project headings/metadata and FC dialogs no longer retain
separate typographic recipes. Only fitted logo/artwork lettering and icon
glyphs are exempt. Language sizing is defined at the shared-token level.


### Foldable touch navigation — 22 October 2026

The shared compact navigation now applies to coarse-pointer viewports below
1100px, as well as all viewports below 768px. This prevents the Japanese inline
navigation from overlapping the docked logo on wider foldable screens. CSS and
`js/mobile-nav.js` use the same query; desktop pointer layouts remain unchanged.
Representative folded/unfolded, portrait/landscape and split-window sizes were
checked in Chromium emulation. Apple publishes physical display resolutions,
not Safari CSS viewport sizes, so these are layout probes rather than certified
iPhone Duo emulation. Actual-device Safari, safe areas and keyboard behavior
still require verification.

### Japanese font trial — 22 October 2026

Japanese now uses self-hosted Zen Kaku Gothic New, paired with SC Walla first
in the font stack for Latin letters and numbers. Regular/Medium/Bold weights
match the shared hierarchy; 600–700 uses the real Bold face. English is
unchanged. `css/japanese-font.css` and `scripts/build-japanese.py` apply the
pairing across Japanese routes. The previous Noto font assets remain dormant
for reversibility. See `fonts/Zen Kaku Gothic New/README.md` for provenance.

Japanese optical-weight correction: Zen now maps CSS 400 to Medium, 500 to
Bold, and 600–700 to Black, bringing Japanese strokes closer to SC Walla.
Latin letters/numerals and the shared type sizes remain unchanged.

### Japanese translation checks — 22 October 2026

Translation keys are trimmed consistently in the static generator and dynamic
lookup, including text split by inline emphasis. After regenerating Japanese
pages, run `python3 scripts/check-japanese.py` to flag untranslated English UI
in every Japanese route (including templates and accessibility labels) and
missing literal dynamic translation keys. Approved brand and product names
remain original. The check is a heuristic; review mixed-language copy visually.

Japanese reading-reveal spans stay inline so strict Japanese line breaking keeps
closing punctuation such as 。 and 、 with the preceding text, including across
emphasis boundaries. Latin reveal words retain their existing block treatment.

Japanese shared line-height settings: display/section headings 1.5; statements
and overviews 1.7; reading/copy 1.8; UI labels 1.6; UI body 1.75; captions and
small supporting text 1.65. These unitless leading tokens apply at every
breakpoint, keeping existing sizes, weights and English metrics. This follows
the Digital Agency’s minimum 1.5 reading-text guidance with extra room for
Japanese paragraphs: https://design.digital.go.jp/dads/foundations/typography/

Purchased Walla fonts — 23 October: active pages now load the purchased Regular
(400), Medium (500), and Bold (700) WOFF2 files from `fonts/SC Walla/`.
Font preloads and the icon-sheet generator use the purchased files as well;
the trial family alias is removed from active styling. Japanese keeps its
existing Japanese glyph font and uses purchased Walla for Latin characters.

### Familiar Characters saved items — 23 October 2026

Products use pixel-heart save controls, with a count beside the top-right heart.
The Favorites sheet is white with a red frame, aligned to the heart button’s right
edge and the Info sheet’s top edge. It slides from right to left using the same
720ms settling animation as Info, without moving the page. Outside clicks dismiss
it; selecting an image opens its detail immediately above Favorites, which stays open
underneath and refreshes when details close. The frame extends to the bottom of the language toggle. Padding shares Info’s 48px inset at every width; title and description share Info’s UI typography.
Its responsive image grid uses three columns at every width; its compact desktop frame preserves the previous image size uses bottom-right overflow
menus for Remove and Product page; clicking an image reopens its detail dialog.
A top-center “View My Favorites” popover opens the collection after saving and
dismisses after four seconds. Desktop card overflow controls appear on hover or
keyboard focus; touch devices keep them visible. Menus offer Remove from Favorites
and View Product, with a compact external-link arrow. Product page keeps a red
background with sentence-case text.
Controls use a continuous red sweep, sentence-case labels, and shared type roles. `js/objects-saved.js` stores only catalog IDs under
`2d1-fc-saved-v1` in localStorage, shared across EN/JA on the same origin.
There is no account, backend, or device sync. The drawer explains that clearing
site data removes saves; blocked storage falls back to the current page session
with an explicit notice. Storage changes from other tabs update the UI.
Saved products reopen the existing product dialog; removal is immediate.
Info, search, and Saved share a 44px height and top alignment; mobile uses
a compact FC info label to fit the row. No-JS retains the existing catalog.

Shared dismiss controls load through `css/close-controls.css`: transparent at rest,
with a red background and beige cross on hover or keyboard focus.

FC’s upper-left disclosure enters downward from above, alongside the other top controls.

FC disclosure and detail tags share a synchronized red fill/text-inversion sweep.
Detail color swatches are keyboard-accessible copy buttons: hover/focus explains
“Copy hex code”; a successful clipboard write shows “Copied to clipboard”.
Clipboard failures show a truthful message with the hex value.
All 107 product palettes are curated in `data/objects.json` using the featured
product’s main material colors, without duplicate shadow/highlight shades.
Metallic and transparent finishes are labeled Silver, Gold and Clear. See
`docs/FINDS-CATALOG-PROCESS.md` before changing a featured variant or palette.

Selected FC category/color filters appear as removable square red chips inside
the search field. Family is no longer a filter. The chip row hides its scrollbar
and fades its right edge while more tags remain offscreen. Filter buttons keep
their DOM nodes during selection so the sweep continues without restarting.
Selected filters keep a solid red fill with beige text.


Scoped control sweeps (23 October): `js/control-fill.js` explicitly registers only primary filled actions, FC sheet triggers, the specification trigger, save hearts, close controls, filter tags/chip removal, contact choices, FC zoom buttons, and reset/save-notification actions. `css/control-fill.css` paints background and ink with one moving edge. Red resting controls retain brown hover fills. Navigation, language toggles, text CTAs, overflow menus, media/product navigation, and color-copy controls are excluded. Reduced motion is instant.

## Social logo introduction — 24 October 2026

A separate six-second, 1080px square animation lives at `_experiments/logo-intro/`:
[local preview](http://localhost:4173/_experiments/logo-intro/). It constructs the
original beige logo on red: both halves of 2, D, and 1 reveal together with a 493ms extrusion at a fixed logo size. The landing's upward 603ms wipe reveals the red logo on beige. The original fitted “A DESIGN HOUSE” caption slides down from behind the logo during the eye sequence; the supplied
fixed eyes then blink; their pupils glance right, return left, and finish with two quick blinks. Includes replay, scrubbing, adjustable step timing and
frame-by-frame H.264 MP4 export. Caption entrance starts at the upward wipe’s logo-bottom crossing; its exit finishes at the downward wipe’s crossing of that same edge; the logo and caption recenter together as the caption appears and retracts. The returning red wipe erases the logo as the caption finishes tucking away, then holds empty red for the seamless loop. See `_experiments/logo-intro/README.md`.
The website's existing landing remains unchanged.

The Shop Familiar Characters thumbnail excludes LOVOT from its preview-only collection and centers Spun. Its resting frame, hover zoom, and language-specific fallback screenshots share that composition; the full Familiar Characters catalog retains LOVOT.

The logo introduction also has a native 1080 × 1920 Reels format at
`/_experiments/logo-intro/?format=reels`, sharing the same six-second/60fps
animation and assets. Export it with
`node _experiments/logo-intro/export.mjs --format=reels`; it saves a separate
`exports/2d1-intro-reels-1080x1920.mp4` without replacing the square master.

The social logo construction adds small per-character anticipatory leans and
staggered settling gestures, without changing the extrusion curve or the
five-second loop. Both square and Reels use the same motion configuration;
previous exports are preserved in `_experiments/logo-intro/versions/pre-character-motion/`.

In the social introduction, the eyes now open gently on first appearance without
the initial blink. They remain visible over the returning red wipe after the
logo disappears, then close during the final 274ms beat before the blank loop seam.

The social animation now lasts six seconds: its final eye-only beat glances right, returns left, then gently closes without blinking. Earlier phase timings are preserved in both formats.

### Navigation usability review — 25 October 2026

The shared mobile typography and focus rules now use the same breakpoint as the
menu controller: below 768px, or coarse-pointer screens below 1100px. Fine-pointer
tablets from 768–1099px use one shared inline grid, reserving its center for the
logo. Anchor placement uses `nth-of-type` so the injected mobile logo cannot
shift destinations into the wrong columns or rows. Desktop keeps the left list.
Large touch screens retain that list with 44px targets. Mobile language cells
also have 44px targets and explicit selected/focus contrast on the red panel.

Reviewed Home, About, Studio, Shop and Contact in English and Japanese at phone,
tablet and desktop widths. Additional probes covered 320px, 767/768px,
1099/1100px, landscape and 1920px widths. Checked current-page semantics, link
bounds, opening/closing, keyboard focus wrap, Escape/return focus, resize cleanup,
Home's delayed reveal and Japanese route navigation. Small menus scroll to their
footer while the close control stays fixed. These are browser viewport checks;
physical Safari/touch hardware and operating-system safe areas remain unverified.
Familiar Characters retains its existing direct logo link home and immersive
collection controls rather than receiving a new navigation layout.

### Shop thumbnails — 27 October 2026

Memoru is still in development. Its active Shop thumbnail is the actual app icon,
`img/shop/menu-note/memoru-app-icon.png`, centered on flat Cranberry Brown with a
soft CSS drop shadow. This icon comes directly from the owner's Memoru app
asset catalog. Earlier UI mockups and composition sources remain inactive in
`_experiments/memore-thumbnail/` and `img/shop/menu-note/`.

The Day Bag Shop thumbnail uses Home's sole selected
`2d-tote-red-handles-v16.webp` image. The photo fills its square frame’s height with `max-height:100%` and
`object-fit:cover`, cropping the sides while keeping the bag in view. Both products retain Coming soon status.


### Familiar Characters search discovery — 26 October 2026

Familiar Characters keeps its canvas experience. As of 1 November, product
information and photos live in one modal, extending to the bottom viewport edge.
The sheet spans the full viewport width and sits at the bottom at 90dvh, with
a white details pane and a transparent backdrop. Opening it moves the canvas,
logo and controls backward as one square-edged card with equal top and side insets over an ash-brown
ground. The product card rises a short 28px and settles from slightly forward in depth with a small tilt,
a tightening shadow and a brief edge reveal, with no opacity fade. Subtle edge shadows separate the cards without dimming the collection.
Both layers settle over 520ms; the edge reveal takes 360ms. Closing retracts
the card and restores the canvas together in 260ms, with no delay before removal.
Reduced motion changes state instantly. Credits have bottom spacing; related images are
compact, and detail tags use square-dashed underlines. `js/objects-credit.js`
samples the photo beneath the credit line and chooses cranberry brown or soft
beige for both the label and source links. It updates on scroll, photo load and
resize, using cached small image samples.
Three similar products appear below the photo gallery, ranked by shared tags,
brand and category; selecting one updates the same modal. Product previous/next
controls and the duplicate metadata table are removed. Detail tags are text-only
filters. Photo navigation and the mobile product-page action remain available.

Separate Object details pages and their UI links are retired. Old EN/JA item
URLs redirect into the matching collection modal using `?item=…`. These redirects
are excluded from the sitemap, which contains 24 canonical current URLs.
`scripts/fc_discovery.py` maintains the redirects, collection schema and sitemap.
The old generator and stylesheet are preserved in
`_archive/object-details-2026-11-01/`.

Run `python3 tests/fc-seo.py` and `python3 scripts/audit-site.py` after generation.
The private preview retains noindex; public launch and Search Console submission
require separate authorization. See [docs/SEO-DISCOVERY.md](docs/SEO-DISCOVERY.md).
The removed directory is preserved in `_archive/fc-browse-2026-10-26/`.


### Notion contact integration — 27 October 2026

The new **2D1 Website Inquiries** database lives under the owner's Client
Discovery page, with an inline newest-first view and a Needs reply queue.
The contact backend now writes to that data source; Notion's native automation
will send email to kosuke@2d1.studio using the owner's existing paid Notion and
Google Workspace accounts. No separate email service is used.

**Activation is pending:** the Notion integration token, Gmail authorization,
Page added → Send mail automation and runtime deployment still need setup.
The frontend checks `/api/contact/config`; static preview remains honestly
unconnected. It preserves retry identity and reports success only after storage.
D1 contains a retry ledger, not contact message content. The existing Purchased
endpoint is preserved. See [docs/CONTACT.md](docs/CONTACT.md) for exact setup,
real-delivery verification and test results. Run `node tests/contact-backend.mjs`
and `node tests/purchased-backend.mjs` after backend changes.


### Launch copy and review — 27 October 2026

Reviewed Japanese across the seven main routes, collection/info/about sheets,
project Overviews, object descriptions, form states and metadata. Revised 91
existing dictionary entries, fixed sentence fragments around inline links,
localized About headings, and retained the owner-confirmed name 二日一宏祐.
The three English project Overviews already match the latest saved revisions
(commit `8b17aad`, 23 October); their Japanese versions were refined.

Shop's external CTA arrow now uses the same continuous gradient as its label;
a more specific pseudo-element background had been replacing it. Verified
start/middle/end hover and keyboard focus in both languages, plus Home and
Studio arrows. Shop and Red Pixel now have complete sharing metadata.

Browser proof and scripts are in ignored `tmp/launch-2026-10-27/`. The main pass
covers 42 rendered EN/JA pages and 16 interaction checks. A further 60 checks
cover narrow/wide phones, landscape, breakpoints, wide desktop, no-JS forms and
shared CTA arrows. Local reference and 228-URL SEO audits pass. These are Chrome
viewport checks, not physical iPhone/Safari certification. See
[the launch checklist](docs/LAUNCH-2026-10-27.md) for remaining public-release work.

Memoru icon presentation — 27 October: Shop uses the original
`img/shop/menu-note/memoru-app-icon.png` without an additional corner mask.
The enlarged peel and Dock-mask experiment was reverted after visual review:
the original paper edge, peel size and silhouette are restored in both languages.
The inactive experiment assets remain available for reference.

### Mobile menu composition — 27 October 2026

The shared full-screen menu now uses Ash Brown (#191416), with beige destinations
and Home's red text sweep, 6px square marker and 12px label shift. Active page
labels remain red. Navigation is bottom-aligned, followed immediately by social
links. Copyright and the EN/JA toggle share a top utility row, with language on
the right. These utility elements and the social row use existing type roles.

On opening, a decorative red logo overlay copies the live docked logo's rendered
bounds, so its center, size and top position do not change or slide with the
panel. The original logo is restored on close; the overlay is hidden outside
mobile mode and excluded from accessibility navigation. Short viewports retain
scrolling, the fixed close button, keyboard focus wrapping and Escape/return
focus. Resizing to tablet/desktop closes the menu and restores the language
control to its page position. Verified English/Japanese Home, About and Shop at
390×844, 320×568 and 767×390, plus restoration at 768px and 1440px.

Day Bag naming — 27 October: the product name is Day Bag throughout active English/Japanese copy, metadata, image descriptions, dynamic translations and source generators. Historical asset filenames remain stable. The Shop photo fills the existing square frame’s height, preserving its proportions and cropping the sides.

### Red Pixel match nicknames — 27 October 2026

Every completed first-to-three match adds a randomly selected two-word nickname
beneath the result, using the requested English format `Your are [nickname].`
The Japanese route localizes the surrounding sentence and keeps the two-word
nickname in English. `js/pong-nicknames.js` selects from style pools using actual
paddle travel per second, player returns, angled returns and the longest rally.
Travel is normalized by court height; pauses do not count as play time. Choices
avoid immediately repeating the previous exact nickname. Nicknames and match
metrics exist only for the current page session, without storage or network calls.
Replay resets metrics and hides the old nickname; pause/resume shows no nickname.
The result, nickname and score are announced together through the existing status
region. `node tests/pong-nicknames.mjs` verifies style selection, two-word names,
random pool coverage and replay variation; `node tests/pong.mjs` covers physics.

The coming-soon HTML also works when opened directly as a local file. Its original
pixel eyes are 25% smaller, follow the cursor, blink on hover, and blink occasionally
while resting. Reduced motion keeps them still; the no-JavaScript fallback retains
the CSS glances and blinks.

Splash eye hover cycles three brand palettes: red on beige, beige on red, and red
on ash brown. Each entry advances once; taps and keyboard activation work too.


The public splash includes Open Graph/Twitter metadata using the approved red
2D1 logo centered on beige (1200 × 630 PNG), served only at `/og-image.png`.


### Launch readiness audit — 27 October 2026

Added `/privacy/` and `/ja/privacy/`, a short Contact privacy note, quiet footer/
collection-info links and one optional analytics checkbox. `js/analytics.js` is
the sole active measurement entry: no Google tag/request before opt-in, browser
Do Not Track/GPC respected, ads personalization disabled, page URLs/referrers
sanitized, revocation clears accessible GA cookies. No popup banner. The form,
Notion and Google Workspace data flow is described without a guessed retention
period. `node tests/analytics-privacy.mjs` checks this contract without network.

Fixed narrow-phone product-footer overlap and mobile photo-credit/count overlap.
The collection filter panel follows visual-viewport changes above iOS keyboards;
its semantic heading stays screen-reader-accessible without an initial visual
flash. The fallback mobile LinkedIn label now says 2D1. Favorites passed mouse,
keyboard and touch testing and needed no behavior change.

Generated packages bundle each page's styles into one content-hashed stylesheet
and minify copied JS with esbuild. Source stays split and the Python source
preview needs no build. Packaging now requires Node plus the existing esbuild
dev dependency. CSS URLs/imports are resolved without changing the cascade;
`_headers` caches immutable bundles. The private package remains noindex and now
includes its actual sitemap. There are 230 canonical URLs / 234 HTML files.

Canvas delivery adds lossless 160px variants and closer sizing hints, preserving
native files and zoom sharpness. All 107 new derivatives match the exact expected
resized RGBA pixels. Across the same source set, 160px bytes are 25.1% below the
192px set; this is not a blanket whole-page transfer claim. The registered rights
status carries through to all 1,583 source/delivery files.

Full evidence/status: [launch audit](docs/LAUNCH-2026-10-27.md),
[image-rights review](docs/image-permissions-2026-10-27/IMAGE-PERMISSIONS-REVIEW.md).
Ignored proof is in `tmp/launch-readiness-2026-10-27/`. Physical iPhone 15 Pro Safari
rendering/menu/project states and iPhone Duo simulator evidence are separated
from keyboard/gesture states that Safari automation could not certify. No public
release, domain change, real form submission, email, commit or push was made.

## Search preparation — 27 October 2026

The eyes-only public splash is eligible for indexing and has its own one-URL
sitemap. The full site remains unpublished. Local launch preparation adds
Japan/North America service-area metadata, shared bilingual metadata and business schema,
and standalone project pages at `/work/aviator/`, `/work/supa/` and
`/work/deepdrip/` (also under `/ja/`). Existing project overlays and original Home/About copy remain unchanged.
The standalone pages reuse the project content and provide native
video controls, language switching and related-project links.

Regenerate through `python3 scripts/build-japanese.py`; edit English source and
`locales/ja.json`, not generated project copies. `scripts/site_seo.py` owns shared
metadata and project generation. The future full sitemap has 236 canonical URLs;
the splash Worker never imports it. Preview noindex safeguards remain unchanged.
See [the search launch plan](docs/SEO-LAUNCH-PLAN.md) for search topics, AI discovery,
verification and outstanding Search Console/Bing setup. No ranking is promised.


### Familiar Characters mobile loading — 27 October 2026

The canvas requests visible photos center first and keeps the fallback catalog
dormant during successful startup, with full no-JS/error recovery. All original
images, responsive/zoom candidates, placement and entrance motion are preserved.
Japanese fonts now use losslessly verified Unicode banks with complete coverage;
SC Walla declares its original character coverage to avoid a serial fallback
download. The collection receives a scoped, identical Japanese dictionary.
No new visible elements. See [measurements and quality proof](docs/FC-MOBILE-PERFORMANCE-2026-10-27.md).


## Public splash analytics — 27 October 2026

Google Analytics uses the renamed 2D1 account and new `2d1.studio` GA4 property
(`G-EJES69N4D2`). Only the splash and its small shared analytics script are
published. Japan/US have no initial consent prompt; the EEA/UK require an
explicit choice; unreviewed or unknown regions have GA off without a prompt.
The Privacy control allows preferences to be changed. DNT/GPC and stored
refusals are respected. Private full-site routes retain explicit opt-in.
Search Console domain ownership and the one-page sitemap are verified.
See [docs/ANALYTICS-SEARCH-CONSOLE.md](docs/ANALYTICS-SEARCH-CONSOLE.md) for
settings, regional limitations, sources and checks.


### Site-wide mobile delivery — 27 October 2026

Remaining Japanese pages now load exact per-page dictionaries. Studio defers
unopened heroes/video posters; standalone cases keep native poster/controls.
Shop's live canvas keeps its appearance and interaction while sizing photos
for its actual display, Retina density and maximum zoom, including resizing.
Object-entry gallery/related srcsets follow the real responsive slots. Two PNGs
use lossless WebP delivery with exact decoded pixels; originals remain. No new
visible elements. [Measurements and proof](docs/SITE-MOBILE-PERFORMANCE-2026-10-27.md).


Favicon (27 October): `img/brand/2d1-icon.svg` is the owner-supplied
`Downloads/favicon.svg`, preserved exactly. Matching PNG, ICO and Apple touch
icons are rasterized from it. Active EN/JA routes and generators use cache
version 3; the splash Worker serves `/favicon.svg`, `/favicon.ico` and
`/apple-touch-icon.png`. Earlier icons are in `_archive/favicon-2026-10-27/`.

Red Pixel grows through four steps (1 → 6 → 12 → 18 → 24px) when the idle
page or BIGGER control is clicked. At the maximum, the control becomes SMALLER
and steps back down to 1px. Background clicks only enlarge it. Pong interactions,
the pixel/puck handoffs, reduced motion and native no-JavaScript size toggle remain.


## FC launch preparation — November 1, 2026
Favorites is removed from the collection; legacy local saved IDs are cleared on visiting FC. Search, categories and photos remain. Shared control styles and sweep measurement now live in objects-controls.css/js. Legal information is at /legal/ and /ja/legal/, with image concerns sent to kosuke@2d1.studio. This adds no license claim for third-party photographs. Owner elects to retain the photos despite unresolved license evidence. Full-site client approval and production configuration remain separate release tasks.

Verification: EN/JA Legal and FC at widths 320, 390, 768 and 1440; info-sheet controls and object next/close passed, no runtime errors. Narrow Japanese footer fixed by wrapping its text area while keeping socials right. 242 active pages have no broken local references; 238 sitemap URLs pass SEO checks. Local preview is http://localhost:4173/familiarcharacters/ . Production FC currently returns 404. Remaining release work: prepare production package without private noindex restrictions; configure hosted contact runtime and verify Notion/email delivery there; verify public domain routing, security headers, mobile image delivery and indexing after deployment. Client approvals still govern portfolio publication; an FC-only release must exclude those pages. Existing images/data were not changed.

Studio’s infinite carousel now rebases into equivalent middle copies during
wheel/touch motion, keeping the input target and easing position together instead
of waiting for release at a finite end stop. Horizontal and vertical gestures
share this loop; release still centers the nearest project. The three cover
images load eagerly and copy swaps suppress image transitions. Verified sustained
forward/reverse wheel input (14 wraps) and horizontal/vertical touch browsing
(9 wraps), with no end-stop hits, centered settling, and project open/close on
English desktop and Japanese mobile. Proof: /private/tmp/studio-continuous-en.png
and /private/tmp/studio-continuous-ja.png. Nothing published.

Red Pixel text shares the Small Label role throughout, with .08em tracking.
Match-end nicknames use “PLAY STYLE: …” and a square-dashed underline on the
name. Names describe measured movement, successful returns, edge-hit preference
and sustained rally length, without assuming improvement or defensive skill.
Random variation stays within the observed style; no match data is persisted.

Pong score numbers use 32px bold type, with 20px player-label gaps, 24px between the scores, and
24px separation below “First to 3”. Other Red Pixel text retains the shared
Small Label styling and .08em tracking.

MUJI image refresh (1 November): Porcelain Toothbrush Stand now uses official Blue (4549738912620), with three native 2000px MUJI photos and an RGB-preserving transparent canvas cutout. The product ID stays unchanged; old yellow files and metadata remain available. See docs/OBJECTS-SOURCES.md.

DAYPA’s gallery includes the owner-supplied canvas-color and fleece-color group
photographs after its original blue backpack photo. Original 3000px PNG files are
retained unchanged with lossless responsive delivery and EN/JA descriptive alt text.
The main blue cutout remains unchanged. All three photos and closing were checked
in English desktop and Japanese phone modals; site references and language checks
passed. Proof: /private/tmp/daypa-en-1.png and /private/tmp/daypa-ja-2.png.


Footer layout — November 2, 2026: every standard page and project footer shares
one flex composition in `css/walla.css`. Copyright, Privacy/Legal links, social
links and any in-footer language switch sit on one centered row whenever they
fit; groups wrap naturally on narrow screens. The desktop social edge retains
the reading-column alignment. Retired tablet forced-stacking and page-specific
social offsets are removed. Standalone project entries show only the footer
language switch, without the duplicate fixed control. Immersive Shop, Red Pixel
and Familiar Characters controls keep their existing page-specific placements.


### Gallery widths — 2 November 2026
Shop and Studio share `--gallery-thumbnail-width`: 80vw below 1100px, then
Studio’s existing centered desktop width aligned to the reading grid. Shop cards
fill their column; captions remain below on phone/tablet and to the right on
desktop. Verified matching 312px thumbnails at 390px, 614.4px at 768px, and
640px at 1440px, including Japanese Shop and native scrolling.


### Studio and Shop layouts — 8 November 2026
Studio now uses the former Shop vertical gallery: a centered square thumbnail,
project name, description and View project action on the right. Captions move
below the image below 1100px. Native vertical scrolling, centered-item emphasis,
looping after the first complete pass, keyboard arrows and the existing
thumbnail-to-project dialog transition are preserved. All three project stories,
client information, media, related projects and standalone entry URLs are unchanged.

Shop is now a regular three-column grid, with two columns below 1100px and one
below 600px. All four products retain their images, descriptions, status labels
and destinations. Captions are always visible. The live Familiar Characters
preview and Red Pixel interaction remain; Shop no longer repeats or recenters
cards before a link can open. Both language routes share these layouts and the
existing type tokens. Previous gallery CSS/scripts are preserved in
`_archive/studio-shop-layout-2026-11-08/`.

Verified native Studio scrolling, keyboard navigation, project opening/closing,
and English/Japanese layouts at desktop and phone sizes; Shop also checked at
768px. Language, SEO and local-reference checks pass. Local preview remains on
http://localhost:4173. No deployment or commit made.

### Shared footer alignment — 9 November 2026

Home, About, Contact, Shop, and Studio use the same compact footer row: 24px vertical padding, the shared reading edge for desktop social links, and 24px mobile insets. Shop includes copyright, Privacy, Legal, and the four social links. Contact’s centered form width is scoped to the form rather than inherited by its footer. Studio retains its fixed footer for the looping gallery, with a beige ground so thumbnails cannot show through it. The viewport language toggle stays 24px from the bottom and right edges (with safe-area clearance), independent of page content or footer visibility; no scroll-driven positioning. Mobile navigation retains its language links. Both language routes share these rules.

Shop uses three columns at desktop widths (1100px and above), two on tablet, and one below 600px. Both language routes share the same grid and reading-edge alignment.

Inner-page EN/JA links live in the normal-flow footer. Home retains its fixed language switch.

Footer language controls are contained within the footer row, with the active sliding fill bounded by the control itself. On mobile they align with the social links; on desktop they center within the footer row. Studio ends after its three projects so its normal-flow footer remains reachable. Home retains its existing fixed/reveal behavior.

Studio loop — November 9, 2026: the vertical project gallery loops in both directions immediately, including when the page has footer language links. Repeated summaries wrap back to their equivalent middle copy without changing the visible position; project details retain their original content and return target.

### About scroll reading — 10 November 2026

About now presents the existing essay in a single shared reading column, aligned with the footer socials, using the former Home’s display and statement typography. All nine paragraphs opt into the unchanged `js/reading-ink.js` reveal: words move from 25% to full opacity as each line passes the 75–55vh reading band. Scrolling backward reverses it; reduced motion and no JavaScript retain fully readable text. Headings remain static above each section. English body type is 40px desktop / 28px phone; Japanese retains the shared 28px / 24px reading scale and line rhythm. Copy, links, navigation, and footer content are unchanged. Previous About markup/styles are retained in `_archive/about-before-scroll-2026-11-10/`.

About hyperlinks now lift their letters 2px in left-to-right order on hover or keyboard focus. `js/about-links.js` runs after reading-ink, preserving continuous underlines, text colors and native wrapping in both languages. Reduced motion disables the lift.

### Contact reading-edge alignment — 10 November 2026
Contact uses the footer’s shared left edge and adjusts its width to give equal left/right space. The form stays within the shared column, with a 320px minimum on unusually wide layouts to prevent collapse (smaller viewports use their available width). This replaces the independently centered 680px cap. English and Japanese share the rule; no form behavior or copy changed.

### Landing preview — 11 November 2026

Home shows the original red landing cover, beige logo and blinking pixel eyes only on the first Home load per browser-tab session. Refreshing or returning Home skips it. English and Japanese share the same session flag. “A DESIGN HOUSE” is fitted to the logo’s width. During the upward red wipe, the beige logo stays centered and clears with the cover while the caption fades out. The red header logo remains in its normal top-left position underneath. This reveals the current Work layout without restoring the former hero or automatically scrolling. `css/practice-landing.css` and `js/practice-landing.js` adapt the existing landing animation to this layout. Pointer, scroll-wheel, touch or keyboard input skips it; reduced motion and no JavaScript show the page immediately.

Footer group order — 11 November 2026: social links now occupy the left edge, aligned with the navigation. Copyright, Privacy, and Legal occupy the former social-link column on desktop and stack below socials on phones. The footer language toggle remains right-aligned and centered on the social row on phones. Studio keeps its legal group hidden. Both language routes share the layout.


Persistent social links — 11 November 2026: social links remain fixed at the bottom left across the shared website shell, aligned with the navigation. They switch between cranberry brown and soft beige for the surface beneath them. The footer retains its layout without duplicate interactive links; the mobile menu keeps its own social group. Small-screen footers reserve room for the dock and language toggle, and Collection’s horizontal zoom control sits above the dock at the bottom right. Without JavaScript, footer links remain available.

Standalone project entries use edge-to-edge artwork with no site sidebar or top spacer. Their breadcrumb and close link sit at the top; close returns to the corresponding language’s Work view. The project class and toolbar are generated in `scripts/site_seo.py`.

Collection zoom refinement — 11 November 2026: the slider sits at the bottom right. It is vertical on desktop and horizontal on mobile. The five zoom stops apply equal magnification ratios across the full range. Depth scaling follows the interpolated canvas geometry to avoid jumps during slider movement. Detail gallery cells are square with contained photographs; product tags and colors stay grouped with the summary rather than stretching to the gallery bottom.

Project navigation — 11 November 2026: project thumbnails expand into the project hero using shared-image page transitions where supported. Reduced motion keeps navigation instant. Standalone project pages keep social links in the footer instead of the fixed dock. Their fixed breadcrumb/close toolbar hides while scrolling down and returns while scrolling up, with beige controls over artwork and a beige surface when returned. English and Japanese project routes share this behavior.

Project hero sizing — 11 November 2026: standalone case-study hero artwork shrinks as needed to keep the full title/one-liner caption and 32px of breathing room inside the initial small viewport. The shared rule adapts to wrapped captions in both languages, keeps full-bleed imagery undistorted, and leaves gallery images unchanged.

Familiar Characters sphere refinement — 11 November 2026: the canvas projects its grid onto a curved surface, with stronger center enlargement and receding edge items. The maximum uses the earlier 640px/64%-viewport limit and original shelf spacing, retaining diagonal neighbor selection. Zoom levels use equal magnification ratios. The desktop zoom control is 25% shorter overall and shares the language toggle’s beige and cranberry palette; mobile remains horizontal.

About reading width — 11 November 2026: About uses the same responsive column width and left edge as the Contact form in both languages, including its 320px minimum where space permits.

FC zoom image stability — 11 November 2026: decoded product photos remain visible during zoom. Sharper responsive versions load after movement settles and replace the displayed photo only after decoding; zooming back out retains the sharper image.

FC canvas captions — 11 November 2026: product names and brands appear on mouse hover or keyboard focus at every zoom level. Zooming in alone keeps captions hidden. Touch users read product information in the detail view.

FC overview spacing and responsiveness — 11 November 2026: extra shelf space separates images most noticeably when zoomed out. Tiles outside the projected viewport and a small buffer are culled before DOM updates. Image delivery excludes spacing from its resolution calculation. Zoom buttons use beige; the pressed knob turns red while the control border stays cranberry.

Button wipes — 11 November 2026: shared filled buttons, close controls, language cells and FC controls now fill from bottom to top. Icon and checkbox color boundaries use the control height and bottom offset to follow the same edge; reduced motion remains instant.

FC product gallery — 11 November 2026: detail photographs form a single vertical column in their source order, with one square frame per row on desktop and mobile.

FC product details — 11 November 2026: the right-hand information pane sticks within the image section on desktop/tablet. Long content can scroll within the viewport-height pane; the phone layout follows its normal single-column flow.

Project navigation uses one opaque shared image snapshot instead of crossfading two copies. Closing returns the hero to the originating thumbnail and restores the gallery scroll position. Project close-icon ink follows toolbar contrast directly, including before hover. Reduced-motion navigation remains immediate.

The product detail pane places photography credit after the Product page action. On desktop its category tag and color swatches sit at the bottom of the sticky viewport-height pane; small screens retain natural content height.

Similar products uses the smaller shared UI heading typography (16px Medium), centered above the related cards at every width. Selecting a related card reuses the canvas cutout-to-center scale/translation animation, while retaining the original canvas return target and reduced-motion behavior.

Product gallery photos fill their square frames edge to edge with centered cover cropping instead of contain letterboxing. The --gallery-position custom property supports image-specific focal positioning when needed.

Work, Shop, About and Contact share --page-content-width and the reading left edge. About body copy uses 28px/1.35 desktop and 22px/1.35 mobile, with 32px/24px paragraph gaps; Japanese uses 1.55 leading. Display headings and the large contact CTA retain their scale.

Sidebar navigation carries the previous selected marker through page navigation, then reverses its hover motion on arrival. Current-page semantics update immediately; reduced motion skips the visual handoff.

Practice tabs use slash separators. Project breadcrumbs share their label typography, 8px spacing and plain hover treatment, retaining light ink over artwork for contrast.

Studio project cards again open the original work.js modal with its single flying-image opening and closing animation. Standalone URLs remain the no-JavaScript and direct-link fallback. project-dialog-loader.js loads current project content into the existing dialog implementation.

At maximum FC canvas zoom, the centered product displays its name and brand without hover. Other canvas captions retain hover/keyboard behavior.

Familiar Characters restores the original center-out staggered item entrance on arrival, with a small pop and tilt. Reduced-motion users see the settled canvas immediately.

Responsive review (11 November): core EN/JA content edges checked at 390, 768, 1280, 1440 and 1920px. Corrected double subtraction of sidebar space, a Contact specificity override, and Work width divergence. Work captions sit below the wider cards to remain inside the column. The original thumbnail is hidden during the flying-image transition to prevent duplicate artwork.

The product information pane carries its own 1px ash-brown top and bottom borders, keeping both edges visible while it sticks alongside the scrolling gallery. On phones these borders frame the information block above the photos.

Width correction: Work, About and Contact retain the previously approved narrower --page-content-width. Shop alone uses the full --reading-width for its two-column grid.

Work captions are restored to the right of the project images on desktop; below 1100px they remain underneath as before.

About reuses the fixed practice switch for 2D1, Kosuke Futsukaichi and Familiar Characters. These section links scroll with header clearance and move keyboard focus without adding a URL hash; the current section follows scrolling. Reduced motion is instant and native anchors remain available without JavaScript.

About’s section headings are removed visually and from the content flow; named section anchors retain navigation and focus targets. The uppercase section switch identifies each section. Body text shares the project metadata UI-body recipe (16px Regular, with language-specific leading).

About’s switch has no background. Reading content passing behind the fixed header fades to 10% opacity, returning to full opacity over 40px below the switch. Native scrolling, reading-ink reveal and no-JavaScript content remain intact.

Project overview paragraphs have one blank line of separation (1lh) across standalone case studies and project dialogs, in English and Japanese. Spacing follows each paragraph’s responsive line height.

Project breadcrumb links use full-opacity Icon Red on hover and keyboard focus, without the legacy opacity dimming.

Regular same-origin navigation retains the native upward page transition, with a 480ms beige/red arrival wipe when the browser skips native snapshots. The fallback does not intercept navigation or section anchors, and reduced motion disables it.

About body copy is fully opaque throughout each section; the word-by-word reading reveal is no longer loaded on About. The separate 10% fade beneath the fixed section switch remains.

About body copy now previews the shared Medium UI role (500), retaining its current size and spacing in both languages.

About now reveals by section: the opening 2D1 section is fully opaque, while Kosuke Futsukaichi and Familiar Characters start at 25%. Each entire section reveals word by word as its top crosses 75% to 45% of viewport height, then stays fully opaque. Reduced motion and no-JavaScript show all copy immediately; the fixed-switch fade remains separate.

Project client, role and year values use the shared Medium UI typography (500) across all case-study pages and dialogs, including Japanese routes.

All shared non-uppercase typography roles now use Medium (500), including headings, prose, captions, metadata and supporting text. Uppercase navigation/label roles and the fitted uppercase landing caption retain their existing weights. Sizes, leading and language font pairing are unchanged.

Home landing: a viewport-wide rigid 2D1 logo drops tilted onto a floor at the shared page inset, rebounds three times with diminishing height, and alternates red/beige at each rebound. After settling, the supplied eyes blink and look left/right, then the cover wipes upward. First visit per session; `?preview-intro` replays for review. Input skips immediately; reduced motion/no-JavaScript bypass it. Previous landing source: `_archive/landing-before-drop-2026-11-11/`.

About paragraph spacing — 11 November 2026: paragraph gaps are 16px on desktop
and 12px on phones; section gaps remain 96px / 64px. Upcoming sections stay at
25% opacity until their top reaches the viewport midpoint, then reveal in a
soft eight-word wave, finishing at the fixed section switch's reading position.
Scrolling backward reverses the wave. The opening 2D1 section, reduced motion
and no-JavaScript copy remain fully readable. Verified English and Japanese at
1440px and 390px, including scroll, keyboard section navigation and clean URLs.
Visual proof is saved in `_previews/about-wave/`.

About body typography — 11 November 2026: the essay uses the shared Reading
role at 22px Regular on desktop and phones. English uses 32px leading and
−0.22px tracking; Japanese uses 32px leading and normal tracking. Reading-role
tracking is shared across the site. Paragraph gaps and the section opacity
wave retain their current behavior.
Verified both languages at 1440px and 390px, including the reveal and section
navigation. Mobile header rules now retain the intended 240px opening clearance
and allow the section switch to grow when it wraps. The updated 24px body metrics
and wrapping were checked in both languages at desktop and phone widths; previews
are saved in `_previews/about-24px/`.

Landing eyes reuse the original logo-intro sequence: gentle opening, pupil-only right/left glance and two blinks, with the original 1439ms timing and supplied eye paths. Eye shells never slide sideways.

After the landing eye sequence, the same logo shrinks and travels to the measured top-left site-logo slot over 1100ms. Its beige cover dissolves to reveal Studio; the eyes close and the static header logo takes over at the exact final bounds. This replaces the final upward cover wipe and follows mobile/desktop header dimensions.

The Contact invitation’s pixel eyes follow the mouse with bounded pupil movement, including in project dialogs. Their existing hover blink and layout remain unchanged; reduced motion disables tracking and no-JavaScript retains the original image.

About’s header reading fade applies only to the essay text, leaving its beige main surface opaque during fast scrolling over the dark Contact ending.

About’s final red square participates in the reading wave, starting at 25%
opacity and revealing after the last word. Reduced motion and no JavaScript
keep it solid. Verified the dim/reveal/reverse states in English and Japanese.

Project Overview paragraphs share About's body typography through the Reading
recipe: 22px Regular, 32px line height and −0.22px tracking in English; 22px Regular,
32px line height and normal tracking in Japanese. Verified all three case-study
pages and project dialog opening/closing at desktop and mobile widths in both
languages. Previews: `_previews/overview-body/`.

Landing docking begins as the last eye blink closes (about 3.2 seconds after the drop starts), with no post-blink pause; the eyes stay closed through the shrink.

During the logo’s final docking move, bio/navigation enter from the left, the practice switch from above, socials/language from below, project captions from the right, and visible thumbnails advance from depth using perspective. Entrances finish within the 1100ms docking phase and clean up on skip; hidden/offscreen gallery clones are excluded. Socials follow the owner’s later bottom-edge instruction.

Landing timing: wait one second after the last blink finishes reopening, then start the logo docking and coordinated page entrances.

Language controls stay fixed at the bottom right across views and invert over dark surfaces, including project dialogs. Familiar Characters retains its existing control behavior.

Body and project Overview now use Regular (400), 22px / 32px at every width,
with −0.22px tracking in English and normal tracking in Japanese. Other roles
retain their weights. Computed bilingual desktop/mobile style tables are in
`docs/TYPOGRAPHY.md`; current previews are in `_previews/reading-22-regular/`.

Supporting text refinement: Small and Caption use Regular (400). Project
Overview eyebrows, Client/Role/Year labels and values, and one-liners on Studio
cards and project heroes are Regular in both languages, including dialogs.
The shared Regular UI variants preserve existing size/leading and keep Medium
controls/titles separate. Current style table: `docs/TYPOGRAPHY.md`.

“See more work” project titles use Medium (500), retaining 22px / 32px and
existing tracking in both languages, on standalone pages and in dialogs.

The landing eyes close over 120ms as logo docking begins, using the original blink easing with no opacity fade. The preceding blink sequence and one-second pause are unchanged.


Typography consolidation — 11 November: seven shared size/leading recipes
(Display, Statement, Section, Body, UI, Caption and Small), with weight,
tracking and case selected separately. Canonical component assignments live in
`css/typography.css`; redundant editorial font overrides were removed from
page styles. About and project Overview now match the Role list: 16px Regular,
24px English / 25.6px Japanese leading, and 0 tracking at every width, including
project dialogs. This supersedes the earlier 22px About/Overview notes above.
Other type metrics and capitalization are preserved. See `docs/TYPOGRAPHY.md`
for the seven-style table and uppercase usage; the previous source is archived
in `_archive/typography-before-consolidation-2026-11-11/`.
