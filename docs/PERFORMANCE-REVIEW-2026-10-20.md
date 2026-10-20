# Performance and cleanup review — 20 October 2026

## Scope and method

Reviewed all 16 current English/Japanese routes, active script/style dependencies, image delivery, animation lifecycle, generated packaging, directory size, and existing automated checks. Used local browser interactions at desktop and phone widths, source/package reference audits, and targeted runtime tests. This is not a production Lighthouse or real-user Core Web Vitals benchmark; no network-throttled score or frame-rate improvement is claimed.

## Changes and measured evidence

| Area | Finding | Change / evidence |
| --- | --- | --- |
| Shop loading | Merely seeing FC mounted its full collection iframe, including canvas code, fonts and images. | Mount only on mouse hover or keyboard focus. Reduced motion retains the poster. Browser verified iframe count 0 initially → 1 on focus → 0 offscreen. Existing stop-on-leave and disposal retained. |
| About images | Five full-width images had only their largest source. The first slideshow image was 4,471,050 bytes. | Added existing 640/1280/native srcsets with `sizes="100vw"`. Phone browser selected the 210,904-byte 640px image (95.3% smaller); larger screens retain sharper candidates. Native images untouched. |
| Scroll work | About slideshow read layout/computed opacity on native scroll and again on camera events. | Cache the room reference and coalesce both event streams into requestAnimationFrame. Autoplay still stops when offscreen, paused, reduced-motion or hidden. |
| Shared behavior | About duplicated clean-hash click handling, year handling and analytics setup already owned by the shared script. | Remove duplicated About code; shared site.js owns production-only analytics on all pages using it. Contact and other About-class pages now receive the same production analytics behavior. No analytics loads locally. |
| Unused network/code | Home, About, Studio and FC loaded Contact/drawer scripts despite having no drawer triggers or form. | Removed those requests in EN, generated JA and the FC generator. Contact retains its form code. Preserved legacy drawer implementation for future use. |
| Runtime directories | Eight CSS/JS files had no active page/import/build/test consumers. | Archived 96,446 bytes across `bar.js`, `script.js`, `profile.js`, `conveyor.js`, `waitlist.js`, `contact-inline.js`, `style.css`, `editorial.css`. |
| Old markup/docs | An inert About hero lived inside live HTML; README had accumulated a long chronological history. | Archived the template; replaced README with a current guide while preserving the complete prior document. Archived standalone Figma fixtures and FC export image. |
| Generated files | `dist/` and `tmp/hosted-build/` were old marked generated outputs, each about 608 MiB allocated. | Removed both; regenerated one validated `dist/` at about 562 MiB allocated (558.7 MiB file content). Net generated disk reduction is approximately 650 MiB. |
| Packaging correctness | Old packager omitted Shop/Red PX and copied unused code/source images. | Discover all 16 routes, follow page runtime references/imports, package referenced images and catalog variants/fonts. Support video extensions. Add no-index metadata when a route lacks it. Source and generated package both pass local-reference audits. No deployment performed. |

## Verification

- `npm run test:performance`: PASS. Exercises deferred iframe creation, reduced-motion/touch behavior, focus/hover start, leave stop, disposal/re-entry, existing FC image virtualization, and local URL validation.
- `python3 scripts/audit-site.py dist`: PASS — 16 pages, 1,637 directly referenced local files, zero broken references. Includes srcset candidates and CSS font/image URLs.
- Syntax checks: changed JavaScript passed `node --check`; preview helper executed successfully.
- Browser: EN Shop initial state, keyboard preview playback, and offscreen disposal; JA About phone responsive image selection and mobile menu opening/closing; EN Home scrolling; EN Studio project opening/closing; EN Contact category/placeholder update; EN FC zoom. No console errors in the inspected states.
- Evidence: `/tmp/performance-about-mobile.png`, `/tmp/performance-fc-desktop.png`.
- Contact submission was not performed; its unconnected behavior remains unchanged.

### Pre-existing full-suite failures

The baseline `npm test` already failed before cleanup at obsolete navigation expectations (`data-contact`, Home/About/Finds-only links). Running individual files also found stale mocks/source-extraction assumptions:

- `mobile-nav.mjs`: missing mocked element/classList.
- `objects-canvas-pinch.mjs`: outdated source extraction produces incomplete JavaScript.
- `objects-controls.mjs`: reduced-motion mock lacks `addEventListener`.
- `objects-dialog-focus.mjs`: document mock lacks `getElementById`.
- `objects-language.mjs`: missing `window`.
- `objects-mobile-sheet.mjs`: missing `catalog`.
- `reading-ink.mjs`: missing `readingWindow`.
- `objects.mjs` is blocked by its imported controls fixture.

The existing family, purchased-backend and Finds performance checks pass. Old tests were not deleted or weakened to manufacture a green result. The new targeted command is separate; full regression-suite modernization remains follow-up work.

## Preserved deliberately

- Native catalog/project photos, cutouts, font sources and their provenance. The large repository size is mostly source media, not initial page transfer. Some native gallery candidates are over 8 MiB; existing responsive derivatives and lazy loading limit ordinary requests, but unusually large/high-DPI displays can still select heavy originals.
- All generated FC responsive variants: reference scan found none that could safely be pruned from the current catalog/manifests/pages.
- Old `tmp/hosted-preview/` contains its own Git repository; preserved rather than deleting possibly unique history. Other `tmp/` image research/candidate files are also preserved.
- Legacy procedural tote code and its tests are retained for revisiting the model. It is not requested by current pages and is excluded from the new package.
- Shared layered stylesheets remain: aggressive selector pruning based on one viewport would risk hidden dialogs, translated pages and interaction states. No design-changing CSS rewrite was made.
- Existing screenshots/older archives remain as review evidence. No `.git`, local Worker database, installed dependencies, or credentials were removed.

## Remaining priorities

1. Modernize the stale interaction tests around real current DOM/API contracts, especially FC controls and mobile navigation.
2. Measure cold-load LCP/INP/CLS on the intended host with realistic mobile throttling. Local source size alone is not a timing measurement.
3. If transfer at extreme zoom is a problem, add visually verified delivery caps or modern image formats while retaining source originals. Avoid recompressing the catalog indiscriminately.
4. Consolidate shared CSS by component with a screenshot regression matrix; current cascaded design history is a maintainability issue rather than a reason to risk visual regressions during file deletion.

Archive inventory and restoration notes: `_archive/performance-cleanup-2026-10-20/README.md` and `manifest.json`. Nothing was committed, pushed or deployed.
