# Responsive review — 11 November 2026

Checked in the local in-app browser at 390×844, 768×1024, 1280×800, 1440×900 and 1920×1080.

- Work, Shop, About and Contact: measured matching content edges in English and Japanese at every width; no document horizontal overflow.
- Familiar Characters: no horizontal overflow at the same widths; horizontal phone slider, vertical larger-screen slider.
- Exercised mobile menu opening and About navigation; project opening, closing and focus return; FC keyboard maximum zoom and product opening; details action, similar-product selection and closing; desktop gallery scrolling with sticky pane at top 0.
- No console errors reported in the FC interaction session.
- Fixed collapsing wide-screen columns, divergent Work widths, Contact override and duplicate project thumbnail during animation.

Limits: desktop browser viewport emulation, not physical touch-device testing. No full reduced-motion/no-JavaScript or cross-browser pass. Not every catalog photograph individually checked. Existing tests/site-language-delivery.py fails its work dictionary assertion; tests/objects.mjs fails in the source-extracting objects-controls fixture with Unexpected end of input. These suites do not provide a passing regression signal. Edited JavaScript syntax checks and git diff --check pass.

## Follow-up: tests and accessibility fallbacks

Both requested entry points now pass: `python3 tests/site-language-delivery.py` and `node tests/objects.mjs`. The vocabulary test now follows the actual project source and localized project URL instead of the Work redirect. FC fixtures now exercise current 25-point zoom stops, continuous pinch, reduced/animated closing, focus cleanup, catalog shuffling and current gallery contracts. Obsolete deck fixtures are preserved under `_archive/tests-pre-collection-view/`. Purchased backend tests also pass separately.

At 390px and 1440px, an isolated localhost preview served script-free HTML (including noscript contents), and a reduced-motion variant forced the existing reduced-motion branches in CSS/JS. Verified project navigation and instant modal open/close with focus return; FC zoom/open/close, details and similar selection; static 104-item catalog; English/Japanese Contact submit disabled; no horizontal overflow on About, Contact and FC. Saved `_previews/nojs-fc-mobile.png`. These are controlled fallback render checks, not OS preference or browser JavaScript-setting emulation; the in-app browser does not expose those switches. No production layouts or styles changed during this follow-up.

Functional fix: ignore wheel input while touch pointers own the FC gesture, preventing wheel/pinch state interference.
