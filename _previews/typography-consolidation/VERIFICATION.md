# Typography consolidation verification — 11 November 2026

- Captured 76 browser states before and after at 1440, 768 and 390px.
- Compared computed family, size, weight, style, leading, tracking and case.
  The only type differences are the requested About/Overview change from
  22px / 32px to the existing Regular UI style.
- About and Overview match the actual project Role list exactly in English and
  Japanese at all three widths: 16px / 24px EN, 16px / 25.6px JA, weight 400,
  normal tracking and sentence case.
- No horizontal overflow or browser runtime errors in the captured states.
- Opened/closed project dialogs and collection product dialogs; opened mobile
  menus and dismissed with Escape. Inspected desktop/mobile rendered captures.
- Exercised About with normal motion at 1440/390px in EN/JA: dim section preview,
  wheel-driven word wave, full reveal, reverse scroll, keyboard section links,
  clean URL and target focus. Reduced motion and no-JS remain readable.
- Seven font recipes remain; active CSS has no references to removed recipes.
- `python3 tests/site-language-delivery.py` and `git diff --check` pass.

Two existing isolated unit harnesses are stale and do not execute their tests:
`tests/reading-ink.mjs` extracts the removed `readingWindow` helper;
`tests/mobile-nav.mjs` lacks `URL` in its mock context. No behavior JavaScript was
changed in this consolidation. Live browser checks above verify the affected
reading and menu interactions directly; these unit harnesses were not rewritten.

Before/after JSON and screenshots are in this folder. Normal-motion reading
captures are in `../about-wave/`. Nothing was committed or deployed.
