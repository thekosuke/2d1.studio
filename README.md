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
| `/finds/` | `/ja/finds/` | Familiar Characters collection and product details |
| `/contact/` | `/ja/contact/` | Contact form |
| `/red-pixel/` | `/ja/red-pixel/` | Red Pixel grab-to-play Pong |
| `/objects/` | `/ja/objects/` | Legacy collection redirects |

## Source map

- `css/walla.css`, `css/fonts.css`, shared navigation/control styles: common layout and brand typography.
- `js/site.js`: shared clean-hash links, viewport measurement, year and production-only analytics. `js/mobile-nav.js`: mobile menu.
- `js/walla.js`, `js/bag-*.js`, `css/today-bag.css`: Home and current photographic tote presentation.
- `about/index.html`, `css/about.css`, `css/about-rooms.css`, `js/about.js`, `js/house-assembly.js`: native-scroll house assembly followed by flat-on, two-column rooms. Shop slides in from the left. Studio is Ash Brown; Shop is Soft Beige. Longer copy receives vertical reading travel; reduced motion uses normal document flow.
- `work/index.html`, `css/work.css`, `js/work.js`, `js/studio-gallery.js`: Studio gallery and project dialog. The centered thumbnail and caption lift together by 8px on hover, with the image tilting 2° clockwise. Hover motion is disabled for reduced motion and touch. Opening expands the thumbnail into its matching hero; closing contracts it back to the centered project, preserving gallery position. Interrupted transitions, resize and reduced motion settle cleanly; no-JavaScript retains inline project details.
- `shop/index.html`, `css/shop.css`, `js/shop.js`, `js/shop-finds-preview.js`: product gallery; the centered image tilts 2° clockwise and lifts 8px toward the top-right when its image or caption is hovered, with reduced motion respected. FC preview mounts on mouse or keyboard interaction, stops on leave, and is disposed offscreen.
- `data/objects.json`, `scripts/build-objects.py`, `css/objects.css`, `js/objects.js`, `js/finds-menus.js`: collection catalog, virtual canvas, filters and details. Current public name is Familiar Characters; URL remains `/finds/`.
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

About shares Home’s ash-brown ending reveal, using a Contact heading and
“Get in touch” link to the localized Contact page instead of the signup form.
The shared ending script handles both routes, including language-control contrast,
keyboard uncovering and reduced-motion fallback.

About’s room titles align with the footer social-links edge; body copy and
CTAs occupy the second column. The shared social edge remains the reference for
future content placed in that area.

About 2D1 retains its transparent, rounded house icon. The Studio and Shop icons
were removed with the flat-room implementation; their earlier source is archived.
Standalone icons should remain transparent and invert on dark backgrounds.

### Inside-the-cube About study — 20 October

The revised interactive concept is at `_experiments/cube-rooms/` (local preview
`/_experiments/cube-rooms/`). It uses a flat-on room drawing with title and body in two columns, bare side
walls, and a horizontal Studio-to-Shop exchange without rotation or camera zoom. The approved direction is now implemented on the bilingual About page below;
the standalone English study remains available for reference.

### About flat rooms — implemented 20 October

The English and Japanese About pages now use the approved flat-on room layout
from the cube study. The toy-block diagram still assembles, then dissolves into
Studio. Native scrolling brings Shop in from the left while Studio slides right.
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
