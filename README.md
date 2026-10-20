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
| `/shop/` | `/ja/shop/` | Familiar Characters, Daily Tote, Menu Pad and Red PX |
| `/finds/` | `/ja/finds/` | Familiar Characters collection and product details |
| `/contact/` | `/ja/contact/` | Contact form |
| `/red-pixel/` | `/ja/red-pixel/` | Red PX interaction |
| `/objects/` | `/ja/objects/` | Legacy collection redirects |

## Source map

- `css/walla.css`, `css/fonts.css`, shared navigation/control styles: common layout and brand typography.
- `js/site.js`: shared clean-hash links, viewport measurement, year and production-only analytics. `js/mobile-nav.js`: mobile menu.
- `js/walla.js`, `js/bag-*.js`, `css/today-bag.css`: Home and current photographic tote presentation.
- `about/index.html`, `css/about.css`, `js/about.js`, `js/house-assembly.js`: native-scroll house assembly, SVG camera/title morph and horizontal Studio-to-Shop transition. Each room stacks photo, heading, body copy. Studio is Ash Brown; Shop is Soft Beige. `js/about-slideshow.js` crossfades project images only while visible, with pause and reduced-motion support.
- `work/index.html`, `css/work.css`, `js/work.js`, `js/studio-gallery.js`: Studio gallery and project dialog.
- `shop/index.html`, `css/shop.css`, `js/shop.js`, `js/shop-finds-preview.js`: product gallery; FC preview mounts on mouse or keyboard interaction, stops on leave, and is disposed offscreen.
- `data/objects.json`, `scripts/build-objects.py`, `css/objects.css`, `js/objects.js`, `js/finds-menus.js`: collection catalog, virtual canvas, filters and details. Current public name is Familiar Characters; URL remains `/finds/`.
- `data/finds-images.json`, `scripts/build-finds-images.py`: device-sized lossless catalog derivatives; native originals and provenance remain intact. Existing derivatives are content-hashed and cached immutably.
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
