# 2D1 website

Static HTML, CSS and JavaScript for 2D1. Read `AGENTS.md` before editing. Work stays on `site-redesign`; committing, publishing and deploying require an explicit request.

Public domain setup (27 October): only the separate red-eyes coming-soon page
and newfiction.org redirect are authorized for publication. The complete website
remains unpublished. See [docs/DOMAIN-SETUP.md](docs/DOMAIN-SETUP.md) for Cloudflare
configuration, verification status, local preview and the later full-site launch.

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
| `/` | `/ja/` | Home, Studio introduction, Daily Tote, Contact and social updates |
| `/about/` | `/ja/about/` | About 2D1, toy-block house and Studio/Shop scroll journey |
| `/work/` | `/ja/work/` | Studio carousel and project details |
| `/shop/` | `/ja/shop/` | Familiar Characters, Daily Tote, Memoru and Red Pixel |
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
spread now comes before the “My Bag is our first everyday item” paragraph.
The divider above the bag study is removed. The closing development note follows.

Shop order follow-up — 22 October: the “My Bag is our first everyday item”
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

The My Bag Shop thumbnail uses Home's sole selected
`2d-tote-red-handles-v16.webp` image. The photo fills its square frame’s height with `max-height:100%` and
`object-fit:cover`, cropping the sides while keeping the bag in view. Both products retain Coming soon status.


### Familiar Characters search discovery — 26 October 2026

Familiar Characters keeps its canvas experience. As of 1 November, product
information and photos live in one modal, extending to the bottom viewport edge.
The sheet is 10% smaller than its former dimensions, with an ash-brown border
and a transparent backdrop. The surrounding collection and controls fade to 30%
opacity while the product modal is open and restore on close. Credits have bottom spacing; related images are
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

My Bag naming — 27 October: the product name is My Bag throughout active English/Japanese copy, metadata, image descriptions, dynamic translations and source generators. Historical asset filenames remain stable. The Shop photo fills the existing square frame’s height, preserving its proportions and cropping the sides.

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
