# Responsive launch audit — 11 November 2026

## Scope and outcome

Audited the current implementation, preserving the established layout and visual language. Changes are local; nothing was committed or deployed. The existing working tree contained extensive prior work, which was preserved.

126 route/viewport combinations were checked in Chromium at widths of 320, 390, 768, 1024, 1280 and 1920 CSS pixels, plus targeted landscape and short-screen checks. English and Japanese coverage includes Studio/Home, Shop, About, Contact, Privacy, Legal, all three case studies and Red Pixel. Familiar Characters is intentionally English-only. No horizontal overflow or JavaScript runtime exceptions were found in these checks. This is representative breakpoint coverage, not certification of every possible device/browser combination.

## Fixes

- Inner pages now expose their footer language links inside the mobile menu too. The desktop footer retains its original control; mobile uses a menu copy. Switching EN About to JA About was exercised.
- Resizing from the open mobile menu to desktop transfers language-link focus back to the real footer link rather than leaving focus on a detached copy.
- Compact Work layouts and scroll snapping use the shared 200px content clearance, keeping project artwork below the fixed section switch. Desktop retains its existing content alignment.
- Compact reading pages have an opaque header surface so scrolling text and images do not collide visually with the logo/byline and section switch. The dark ending uses the corresponding dark surface. Collection retains its immersive canvas.
- The fixed Studio footer has a small background clearance behind its controls.
- With JavaScript disabled, the logo, byline, page navigation and section switch use normal document flow. This resolves overlaps in the fallback header while retaining readable project and Collection lists.
- Updated shared asset version references in active English/Japanese pages and the Collection generator to avoid stale cached styling/scripts.

## Rendered and interaction verification

Inspected desktop, tablet, phone and landscape renders. Exercised mobile-menu opening/closing, EN-to-JA navigation, footer alignment after scrolling, resize focus, Collection item opening, previous/next navigation, image-to-details scrolling, closing and Escape. Checked reduced-motion layouts and no-JavaScript fallback rendering. No-JavaScript screenshots were inspected after the header correction at 390px and 1280px.

Evidence is saved locally in `_previews/launch-audit-2026-11-11/`, including viewport result JSON and representative screenshots. `finish.json` includes the initial no-JavaScript structural checks; `nojs-final.json` and the `nojs-*` screenshots record the corrected fallback. This directory is preview evidence, not site content.

## Automated checks

- JavaScript syntax checks passed for the modified navigation and gallery controllers.
- `scripts/audit-site.py`: 242 pages, 1,687 directly referenced local files, zero broken local references.
- Analytics/privacy checks and page-image delivery checks passed.
- The complete legacy test suite is not green. Failures include assumptions about the old Japanese FC catalog, old navigation markup, removed reading-window code, source-extracted dialog/pinch functions, language vocabulary scoping and the former `/work/` page. These failures were recorded rather than hidden or weakened to obtain a pass. They need maintenance against the current design.

## Still required before launch

- Test on physical iOS Safari and desktop Safari. This audit used Chromium with touch/viewport emulation, which cannot verify Safari-specific behavior or real touch performance.
- Verify production contact-form delivery with the deployed backend. No real inquiry was submitted during the audit. The local unconnected state remains truthful.
- Run a production network/performance pass. Several existing Collection gallery sources are 6–10 MB; source-reference validation does not measure actual transfer costs or mobile loading performance.
- Refresh the stale regression tests before treating the full test command as a release gate.
