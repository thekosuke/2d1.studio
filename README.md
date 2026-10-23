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
- `work/index.html`, `css/work.css`, `js/work.js`, `js/studio-gallery.js`: Studio gallery and project dialog. The centered thumbnail lifts by 8px and tilts 2° counterclockwise on hover; its caption and index stay stationary. Hover motion is disabled for reduced motion and touch. Opening expands the thumbnail into its matching hero; closing contracts it back to the centered project, preserving gallery position. Interrupted transitions, resize and reduced motion settle cleanly; no-JavaScript retains inline project details.
- `shop/index.html`, `css/shop.css`, `js/shop.js`, `js/shop-finds-preview.js`: product gallery; the centered image tilts 2° counterclockwise and shifts 8px to the left; its caption and index stay stationary when its image or caption is hovered, with reduced motion respected. FC preview mounts on mouse or keyboard interaction, stops on leave, and is disposed offscreen.
- `data/objects.json`, `scripts/build-objects.py`, `css/objects.css`, `js/objects.js`, `js/finds-menus.js`: collection catalog, virtual canvas, filters and details. Current public name is Familiar Characters; URL is `/familiarcharacters/`.
- `data/finds-images.json`, `scripts/build-finds-images.py`: device-sized lossless catalog derivatives; native originals and provenance remain intact. Existing derivatives are content-hashed and cached immutably.
- `red-pixel/index.html`, `css/red-pixel.css`, `js/red-pixel.js`, `js/pong-physics.js`: grab then throw to start Pong on Ash Brown. Player is left, level-five 2D1 BOT right; first to three. Mouse/touch and Up/Down or W/S control the paddle; Click/tap or Space pauses/resumes, and Escape exits; dragging never toggles pause. The red puck plays on a court without lines, with Home-navigation labels, enlarged scores, and Soft Beige “First to 3” directly above the scoreboard. Enter grabs/throws for keyboard users. The opponent reads the ball every 220–360ms, accelerates and brakes smoothly, repositions between returns, and makes consistent aiming errors with occasional larger misreads. Square impact particles and a center burst on player scores respect reduced motion; visibility loss and resizing pause play. No-JavaScript retains the native BIGGER/SMALLER size control.
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
audit currently reports two missing legacy Rand font files in `css/fonts.css`,
following unrelated font-directory deletions; those changes were left intact.

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
spread now comes before the “2D Tote is our first everyday item” paragraph.
The divider above the bag study is removed. The closing development note follows.

Shop order follow-up — 22 October: the “2D Tote is our first everyday item”
paragraph is back above the animated bag/specification spread. The divider remains removed.

Home’s Studio artwork track sits immediately after “At our core, we’re a design studio.” The remaining two description paragraphs follow the full-width track, ahead of Services, in both languages.

Bag study photograph — 22 October: Home now uses the cooler hanging bicolor
concept, `img/shop/bag-study-2026-10-22/2d-tote-bicolor-daylight-hanging-neutral.webp`,
in both languages. Intrinsic dimensions and viewport-height sizing follow its
1086 × 1448 aspect ratio. The previous `img/shop/life-tote-studio-v4.webp`
remains available; the existing bag/specification scroll animation is preserved.

Shop’s Familiar Characters hover preview scales a predecoded grid as one layer to avoid missing image layers inside the rotated monitor. Its six-second zoom cycle resets on leave; the card tilts counterclockwise.

The Shop FC monitor shows a language-specific still captured from the live preview’s initial 1600×900 view while it loads. The still stays visible after loading; only hover or keyboard focus reveals the decoded live canvas. Both use the exact same screen bounds to prevent a size shift at the handoff. Reduced-motion and no-JavaScript visitors retain the still.


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

Tote colorway comparison — 22 October: a small Bicolor strap / Red handles
selector below the photo’s specifications action switches between the approved
v15 image and the new v16 concept with a solid dark shoulder strap and Icon Red
short handles. The original remains the default; selection is temporary and is
not stored. Both images share the same dimensions and crop. The alternate is
decoded before switching, and the strap description follows the selected view.
English and Japanese include translated controls and alt text. No-JS keeps the
original photo and working native specification disclosure. The alternate is a
generative edit, so it is not a pixel-identical recolor outside the straps.

Specifications sheet refinement — 22 October: the sheet fills 70% of the dynamic
viewport height, capped at the viewport height minus 48px, with internal
scrolling only when needed. Its fixed header aligns the title and close button on the same center
line. Entrance is 320ms with a soft ease-out; exit is 240ms. Reduced motion
remains instant, and the page remains undimmed and scrollable.

The tote specification trigger travels with the copy wipe, flush to its top and right edges, on a soft beige background with 12px padding. Two accessible, unlabeled circle selectors on the photo’s left switch strap concepts; the selected circle is filled.

The tote specification sheet opens upward from the viewport bottom with a gentle 640ms ease-out and closes downward over 480ms. Reduced motion remains instant.

Footer eyes and the Contact marker stay Icon Red. Pixel-arrow CTAs use one shared sweep coordinate space across label and arrow, so the color reaches the arrow after crossing the label.

Active page navigation keeps its 6px square visible, with the same 12px label offset as hover. The marker is Icon Red on desktop and Cranberry Brown to match the active link on the red mobile menu. Language and social controls are excluded.

Third tote colorway — 22 October: the photo comparison now includes Red logo,
with an Icon Red logo and dark shoulder strap and short handles (v17). The
three circle selectors form a compact vertical stack at the photo’s left edge,
with 32px row spacing and 44px-wide click targets. Switching is instantaneous
after decoding, preserves scroll position, and updates the strap description.
All three choices have translated accessible labels in Japanese. The original
remains the default. Like v16, v17 is a generative edit with minor texture
variation outside the requested color changes. Originals and prompts are saved.

### Shared typography roles — 22 October 2026

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
