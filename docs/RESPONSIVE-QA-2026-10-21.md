# Responsive QA — 21 October 2026

## Scope and evidence

Local Chromium review of all seven active pages in English and Japanese: Home,
About, Studio (`/work/`), Shop, Contact, Familiar Characters, and Red Pixel.
Initial matrix: 320×568, 390×844, 768×1024, 1024×768, 1280×800,
1440×900 and 1920×1080 (98 page/viewport combinations). No uncaught JavaScript
exceptions were recorded. Initial overflow was limited to Shop at 768/1024px.

After repair, Shop passed 320, 390, 768, 1024 and 1440px in both languages.
Project dialogs for Aviator, Supa and DeepDrip opened, fit the mobile viewport,
and closed with Escape in both languages. Mobile menus opened and restored
background interactivity on Escape across About, Studio, Shop and Contact.
Collection info, empty search, zoom buttons, product opening and closing were
exercised. Zoom reached 25% in both languages. Valid Contact entries displayed
the unconnected Notion fallback, with no submission sent. Keyboard Enter/Enter
started Pong and Escape exited in both languages.

Normal-motion ending checks covered Home/About/Shop at phone, landscape and
desktop sizes in both languages. Reduced-motion rendering was used for the
98-layout matrix. All 14 active routes were also loaded with JavaScript disabled;
no horizontal overflow was found. Contact's repaired no-JavaScript fallback was
then explicitly verified in both languages.

Screenshots and machine-readable observations: `_previews/responsive-qa/`.
`matrix.json` records the BEFORE state; `fixes-verified.json` records the repaired
Shop and collection/contact checks. `controls-final.json` records zoom, form and
Pong behavior after asset cache versions were updated. Some earlier intermediate
scripts used translated labels or clicked while scrolling; their preliminary
failures were retested with stable positioning and language-independent selectors.

## Changes

- Shop captions move below images up to 1099px rather than overflowing the
  tablet viewport. Captions participate in card height, preventing translated
  copy from overlapping the following product. Desktop side captions remain.
- Temporary typography controls start collapsed on phones. Their open/closed
  preference persists for the browser session across routes.
- The typography panel sits above Familiar Characters' zoom controls rather
  than intercepting their clicks.
- Contact category chips have 44px minimum touch targets on coarse pointers;
  desktop styling is preserved.
- Contact's static Send button is disabled until its JavaScript controller is
  ready. Without JavaScript, the existing localized Notion fallback is visible.
- Shared asset versions were refreshed and Japanese pages regenerated.

## Checks and limitations

- Local reference audit: 18 routes, 1,604 local references, zero missing files.
- Changed JavaScript syntax checks and `git diff --check` pass.
- Existing Node suites: six pass, nine fail. The failing suites use stale source
  extraction boundaries, outdated expectations, or incomplete browser mocks
  (e.g. missing `window`, `documentElement`, `matchMedia.addEventListener`). Their
  results are saved in `unit-tests.json`. They were not suppressed or represented
  as passing; the old harness needs maintenance independently of browser QA.
- This is Chromium emulation, not physical iPhone/iPad/Android or Safari/Firefox
  certification. It does not exhaust every catalog item, gesture sequence,
  browser zoom setting, network failure, or game outcome.
- Contact/signup remain intentionally unconnected. No endpoint was configured.
- Some catalog originals are 6–10 MB. Responsive/lazy delivery is present, but
  mobile-network performance and original-image optimization deserve a separate pass.
- The LinkedIn destination still points to New Fiction, as previously retained.
- Existing bright red small text is a brand/accessibility contrast tradeoff;
  no alternate brand red was introduced during this layout repair.

Nothing committed, pushed or deployed.
