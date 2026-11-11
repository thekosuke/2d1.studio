# Typography

`css/typography.css` defines seven shared size/line-height recipes and the
canonical component assignments. Weight, tracking and capitalization are
separate choices. Page styles own layout, color, decoration and interaction.
Use this system for future typography changes across every affected English
and Japanese route, including dialogs and responsive layouts.

## Seven base styles — 11 November 2026

Values are size / line height in px. Desktop → phone changes below 768px.
A single pair applies at every width. Capitalization is set by the component;
Japanese characters have no uppercase form.

| Base style | English desktop → phone | Japanese desktop → phone | Current weights and uses | All uppercase? |
| --- | --- | --- | --- | --- |
| Display | 48 / 57.6 → 44 / 52.8 | 48 / 72 → 44 / 66 | Medium 500: page titles | No |
| Statement | 32 / 44 → 28 / 33.6 | 32 / 44 → 24 / 40.8 | Medium 500: large statements, CTAs and mobile navigation | Mobile navigation only |
| Section | 32 / 35.2 | 32 / 48 | Medium 500: section and product headings | No |
| Body | 22 / 32 | 22 / 32 | Regular 400: Contact introduction, Privacy/Legal prose; Medium 500: related project titles | No |
| UI | 16 / 24 | 16 / 25.6 | Regular 400: About, project Overview, Role list and metadata; Medium 500: controls and sheet headings | No |
| Caption | 14 / 21 | 14 / 23.1 | Regular 400: supporting descriptions, one-liners, “or follow us below” and project metadata labels; Medium 500: project/shop titles and selected labels | Section/ending labels only |
| Small | 12 / 18 | 12 / 19.8 | Regular 400: supporting text and footer; Medium 500: navigation, language controls, labels and breadcrumbs | Navigation, language controls, field labels, breadcrumbs and collection tags; footer copy stays sentence case |

Contextual rhythm preserves existing Japanese typography without extra font
recipes: UI prose (project hero one-liners, form fields and collection copy)
uses 28px leading, while Small medium labels use 19.2px. English uses 24px and
18px respectively. Home project titles retain 21px leading in both languages.
Standalone project Overview labels retain their existing 22px / 32px size,
becoming 16px / 32px on phones; dialog Overview labels use UI prose leading.
These label exceptions do not affect the Overview paragraphs.

## About and Overview match the Role list

All About body paragraphs and project Overview paragraphs now use the same
Regular UI recipe as `.work-role-list`, including standalone project pages and
project dialogs:

| Property | English | Japanese |
| --- | --- | --- |
| Size | 16px | 16px |
| Weight | Regular 400 | Regular 400 (existing optical font mapping) |
| Line height | 24px | 25.6px |
| Letter spacing | 0 | 0 |
| All uppercase | No | No |

The existing section opacity wave and closing red square reveal are preserved.

## Use

```css
.component-title {
  font: var(--weight-medium) var(--font-section) var(--font);
  letter-spacing: var(--type-track);
}
.component-copy {
  font: var(--weight-regular) var(--font-ui) var(--font);
  letter-spacing: var(--type-track);
}
```

The seven recipes are `--font-display`, `--font-statement`, `--font-section`,
`--font-body`, `--font-ui`, `--font-caption` and `--font-small`. Each contains
only size and leading; use `--weight-regular` (400), `--weight-medium` (500) or
`--weight-bold` (700) separately. Family resolves from `--font` at the component.
Older weight/case aliases and duplicate Reading/Overview recipes are removed.
Existing size aliases remain where layout and dormant components need them.

Tracking is normally 0. Body uses −0.01em in English (−0.22px) and 0 in Japanese.
Regular Small supporting text uses +0.01em. Small uppercase navigation, field
labels and breadcrumbs use +0.04em; selected uppercase Caption labels use
+0.03em. Mobile navigation uses +0.04em. Case, color and spacing between blocks
are not part of the font recipes.

## Fonts and exceptions

English uses local SC Walla. Japanese uses SC Walla for Latin/numerals and
self-hosted Zen Kaku Gothic New for Japanese glyphs. The existing optical
mapping pairs CSS 400 with Zen Medium, 500 with Bold, and 600–700 with Black.
Font license and provenance remain in the font folder.

Fitted brand lettering, SVG/artwork text and graphical icon glyphs remain
outside the normal text system. Red Pixel uses Small Medium with +0.08em
tracking; its score is a deliberate 32px / 32px Bold exception.

The previous recipes and documentation are preserved in
`_archive/typography-before-consolidation-2026-11-11/`. Browser comparison data
and desktop/mobile visual proof are in `_previews/typography-consolidation/`.
