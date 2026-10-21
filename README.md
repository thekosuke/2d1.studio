# 2D1 website

Static HTML, CSS and JavaScript for 2D1. Read `AGENTS.md` before editing. Work stays on `site-redesign`; committing, publishing and deploying require an explicit request.

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
| `/` | `/ja/` | Home, Studio introduction, Daily Tote and signup |
| `/about/` | `/ja/about/` | About 2D1, toy-block house and Studio/Shop scroll journey |
| `/work/` | `/ja/work/` | Studio carousel and project details |
| `/shop/` | `/ja/shop/` | Familiar Characters, Daily Tote, Menu Pad and Red Pixel |
| `/familiarcharacters/` | `/ja/familiarcharacters/` | Familiar Characters collection and product details |
| `/contact/` | `/ja/contact/` | Contact form |
| `/red-pixel/` | `/ja/red-pixel/` | Red Pixel grab-to-play Pong |
| `/objects/` | `/ja/objects/` | Legacy collection redirects |

## Source map

- `css/walla.css`, `css/fonts.css`, shared navigation/control styles: common layout and brand typography.
- `js/site.js`: shared clean-hash links, viewport measurement, year and production-only analytics. `js/mobile-nav.js`: mobile menu.
- `js/walla.js`, `js/bag-*.js`, `css/today-bag.css`: Home and current photographic tote presentation.
- `about/index.html`, `css/about.css`, `css/about-rooms.css`, `js/about.js`, `js/house-assembly.js`: project-Overview-style labels and large body copy. The combined opening retains reading ink, followed by the house assembly and Studio zoom/title handoff. Studio settles onto Soft Beige; Studio and Shop then follow normal document scrolling. Interior drawings are archived. Reduced motion uses normal document flow.
- `work/index.html`, `css/work.css`, `js/work.js`, `js/studio-gallery.js`: Studio gallery and project dialog. The centered thumbnail lifts by 8px and tilts 2° clockwise on hover; its caption and index stay stationary. Hover motion is disabled for reduced motion and touch. Opening expands the thumbnail into its matching hero; closing contracts it back to the centered project, preserving gallery position. Interrupted transitions, resize and reduced motion settle cleanly; no-JavaScript retains inline project details.
- `shop/index.html`, `css/shop.css`, `js/shop.js`, `js/shop-finds-preview.js`: product gallery; the centered image tilts 2° clockwise and shifts 8px to the left; its caption and index stay stationary when its image or caption is hovered, with reduced motion respected. FC preview mounts on mouse or keyboard interaction, stops on leave, and is disposed offscreen.
- `data/objects.json`, `scripts/build-objects.py`, `css/objects.css`, `js/objects.js`, `js/finds-menus.js`: collection catalog, virtual canvas, filters and details. Current public name is Familiar Characters; URL is `/familiarcharacters/`.
- `data/finds-images.json`, `scripts/build-finds-images.py`: device-sized lossless catalog derivatives; native originals and provenance remain intact. Existing derivatives are content-hashed and cached immutably.
- `red-pixel/index.html`, `css/red-pixel.css`, `js/red-pixel.js`, `js/pong-physics.js`: grab then throw to start Pong on Ash Brown. Player is left, level-five 2D1 BOT right; first to five. Mouse/touch and Up/Down or W/S control the paddle; Click/tap or Space pauses/resumes, and Escape exits; dragging never toggles pause. The red puck plays on a court without lines, with Home-navigation labels, enlarged scores, and Soft Beige “First to 5” directly above the scoreboard. Enter grabs/throws for keyboard users. The opponent reads the ball every 220–360ms, accelerates and brakes smoothly, repositions between returns, and makes consistent aiming errors with occasional larger misreads. Square impact particles and a center burst on player scores respect reduced motion; visibility loss and resizing pause play. No-JavaScript retains native ZOOM.
- `contact/index.html`, `js/contact.js`, `css/contact-page.css`: contact page. Contact code loads only on that route; legacy drawer support remains available there.
- `locales/ja.json`, `scripts/build-japanese.py`, `js/language.js`, `js/ja.js`: English source plus generated Japanese HTML and dynamic translation dictionary.

Use local fonts, Icon Red `#FF2B00`, Soft Beige `#FAF0E6`, Ash Brown `#191416`, and Cranberry Brown `#320505`. Preserve keyboard access, reduced motion and no-JavaScript fallbacks. Forms are unconnected: do not claim submissions are sent or saved. Purchased-count backend notes are in `docs/PURCHASED-BACKEND.md`.

## Assets and packaging

`img/` retains supplied photographs, catalog sources, provenance and responsive delivery versions. Do not delete source images just because a smaller version is displayed. The preview packager follows active page scripts/styles and image references, includes catalog variants and required fonts, and omits historical source files and desktop font formats. It includes all 16 current routes, preserves no-index headers, and never publishes. `npm run build:hosted` also prepares the private Worker bundle; see `docs/HANDOFF.md` before using hosted workflows.

## Archives and review history

`_archive/` contains superseded designs and removed features. The October 20 cleanup manifest is `_archive/performance-cleanup-2026-10-20/manifest.json`; its README explains restoration. The former long README, including all design decisions and chronological notes, is preserved in `_archive/performance-cleanup-2026-10-20/README-history.md`. Temporary screenshots remain under `_previews/`; image research and the old preview checkout remain under ignored `tmp/`.

Latest performance findings, verification and remaining risks: `docs/PERFORMANCE-REVIEW-2026-10-20.md`.

About shares Home’s ash-brown ending reveal, using a Contact label, “Let’s work together” headline and
“Get in touch” link to the localized Contact page instead of the signup form.
Both signup and Contact sections are at least 70vh tall, with vertically centered
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

### Temporary typography controls
`js/type-tuner.js` appears only on localhost/127.0.0.1 previews across all active
routes. Select text, adjust size/weight/tracking/leading, and SAVE to copy a
source-update request (route, viewport, text and selectors). Controls edit all text sharing the selected typography style. Named style groups
(such as About overview) are preferred; other text is grouped by its computed
font family, size, weight, style, tracking, leading and capitalization. SAVE
identifies the shared group and every matching element on the current page, and
requests source updates across routes. Reset restores the entire selected group. SAVE also remembers
the request in local storage; previews are not written to source. A text-area
fallback supports blocked clipboard access. The panel follows native dialogs
and can collapse to a small label; remove its script tags to retire it.

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
