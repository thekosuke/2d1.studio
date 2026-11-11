# Typography

`css/typography.css` is the source of truth for shared type recipes. Component
styles own layout, color and interaction. Use an existing recipe before adding a
size or weight to a component. Change a shared recipe to update all its users.

Standing owner rule: every future typography change must use this shared system
and apply to all uses of the affected style on every active page in both English
and Japanese. A selected example identifies the shared style, not a one-off
element override, unless the owner explicitly requests a limited scope. Preserve
responsive sizing and language font selection, and verify both languages at
desktop and mobile widths.

## Current shared styles — 11 November 2026

Measured at 1440px and 390px. Values are type size / line height in px;
`desktop → phone` shows responsive changes (the shared breakpoint is 768px).
English uses SC Walla; Japanese pairs Walla Latin with Zen Kaku Gothic New.
Weights below are CSS weights; the existing Japanese optical font mapping remains.

| Style | Weight | English desktop → phone | Japanese desktop → phone | Tracking |
| --- | --- | --- | --- | --- |
| Display | Medium 500 | 48 / 57.6 → 44 / 52.8 | 48 / 72 → 44 / 66 | 0 |
| Statement / large CTA | Medium 500 | 32 / 44 → 28 / 33.6 | 32 / 44 → 24 / 40.8 | 0 |
| Section heading | Medium 500 | 32 / 35.2 | 32 / 48 | 0 |
| Body / project Overview | Regular 400 | 22 / 32 | 22 / 32 | EN −0.01em; JA 0 |
| Related project title | Medium 500 | 22 / 32 | 22 / 32 | EN −0.01em; JA 0 |
| UI heading / control | Medium 500 | 16 / 24 | 16 / 25.6 | 0 |
| UI body | Medium 500 | 16 / 24 | 16 / 28 | 0 |
| Regular UI / project metadata | Regular 400 | 16 / 24 | 16 / 25.6 | 0 |
| Regular UI body / project hero one-liner | Regular 400 | 16 / 24 | 16 / 28 | 0 |
| Caption / one-liner | Regular 400 | 14 / 21 | 14 / 23.1 | 0 |
| Medium caption / project title | Medium 500 | 14 / 21 | 14 / 23.1 | 0 |
| Uppercase UI | Medium 500 | 14 / 21 | 14 / 23.1 | +0.03em |
| Small supporting text | Regular 400 | 12 / 18 | 12 / 19.8 | +0.01em |
| Small labels / navigation | Medium 500 | 12 / 18 | 12 / 19.2 | 0; navigation, field labels and breadcrumbs +0.04em |
| Supporting copy (legacy role) | Medium 500 | 28 / 42 → 20 / 30 | 24 / 43.2 → 20 / 36 | 0 |

A single pair applies at both widths. Mobile menu links use Statement with
+0.04em tracking. Red Pixel text uses Small Label with +0.08em tracking and its
score uses 32 / 32 Bold (700). Fitted brand lettering and artwork are separate.
Overview is an alias of Reading; UI reading is an alias of UI body; medium
caption and small-caption variants share their corresponding base metrics.

## Use

```css
.component-title {
  font: var(--font-section) var(--font);
  letter-spacing: var(--type-track);
}
.component-description {
  font: var(--font-caption) var(--font);
  letter-spacing: var(--type-track);
}
```

The recipe deliberately excludes the family: `var(--font)` resolves on the
component, keeping English Walla and Japanese Zen Kaku Gothic New correct. Existing size aliases
(`--type-lead`, `--type-display`, etc.) remain for responsive layouts and scripts.
Don't redefine a size alias on a child and assume an inherited font recipe will
recompute: change the root/language metrics or define a documented role variant.

Use `--type-track` for normal tracking, `--type-small-track` (0.01em) for
regular Small text, and `--type-label-track` for small uppercase labels. The
selected uppercase UI variant uses `--type-ui-uppercase-track` (0.03em). Uppercase, color, spacing between blocks, decoration and interaction
remain separate from font recipes.

## Scope and exceptions

All active normal text is assigned a shared recipe by the canonical component
mapping at the end of `css/typography.css`. This stylesheet loads last on every
active route, including Red Pixel, and the FC generator preserves that order.
Component styles still own layout, color, case, decoration and interaction.

Only fitted brand captions, SVG/house artwork lettering, and graphical icon
glyphs stay outside the system. The temporary typography controls were removed
from all active routes on 23 October; their source is archived. Archived pages
are outside the active site.

Home statements and large CTAs now share Statement metrics. Contact titles and
related-work headings use Display. FC product titles use Section. Project copy
uses Overview, metadata uses UI/Caption, and supporting labels use Small.
Japanese uses Zen Kaku Gothic New and shared language-level responsive size tokens; there are
no page-specific Japanese leading/weight exceptions in the canonical mapping.

## Verification, 22 October 2026

Compared computed family, size, weight, leading and tracking before/after on
Home, About, Japanese About, Studio, Shop and Contact at desktop width. All
sampled text matched. Regenerate Japanese HTML after changing stylesheet links.

## Near-duplicate consolidation — 22 October

This pass intentionally makes small visual adjustments:
- UI regular and medium text use 1.5 leading. The old UI-reading token is an alias.
- Small medium labels/captions share 1.5 leading. Their two token names are aliases.
- Contact introduction uses the 20px/1.5 reading role instead of 22px/1.4.
- Project metadata uses 16px/1.5 UI body instead of 18px/1.45; overview labels
  use the 20px/1.5 reading role instead of 20px/1.45.
- FC 11px tags/credits become 12px/1.5 small text with normal tracking;
  13px brand metadata becomes 14px/1.5 caption text. Info-sheet body/headings
  use the shared 16px/1.5 UI recipes.
- Tote supporting headings/tooltips reuse UI/caption recipes.
- Home supporting copy uses 1.5 rather than 1.55 leading.

Large display sizes, bold-versus-medium hierarchy, Japanese long-form reading
rhythm, icon sizing and fitted artwork lettering remain intentional exceptions.
Verified Contact on desktop and Japanese mobile, and opened the FC info sheet
at phone width to check wrapping and action visibility.

## Final role coverage

The final normal-text mapping supersedes the earlier preserved-exception notes.
Checked computed size, weight and leading against the twelve recipes across
Home, About, Contact, Studio, Shop, FC and Red Pixel, plus Japanese routes and
390px layouts. Opened a project sheet and FC product dialog to find and remove
legacy title/action overrides. Visually checked desktop Contact and Japanese
mobile Contact. Fitted Home caption excluded intentionally.

## Saved typography refinements — 22 October

The eight core roles remain unchanged. Selected uppercase UI text (Home section
labels, Contact ending headings and FC Product page links) uses
`--font-ui-uppercase`, an alias of the existing 14px/1.5 Medium caption recipe,
with 0.03em tracking. It does not change the 16px UI role or small navigation
labels. Regular Small text keeps its 12px/1.5 recipe and gains 0.01em tracking.
Both variants are assigned in the canonical mapping, including mobile product
footers, and use the existing English/Japanese family selection. Heading-marker
sizing is proportional decoration, separate from the type recipes.

## Japanese font pairing — 22 October

Japanese routes use `"SC Walla", "Zen Kaku Gothic New", ...` in that order.
Walla supplies Latin letters and numerals; Zen supplies Japanese glyphs. The
Japanese stylesheet is self-hosted and only included on Japanese routes.
Regular pairs with Regular (400), Medium with Medium (500), and the real Bold
face serves 600–700, matching Walla’s available bold face at those weights.
No size, line-height or spacing recipes changed for this font trial.
Verified mixed-script About at desktop and 390px, all Japanese route font
stacks, and English remaining Walla-only. License/provenance is in the font folder.

Japanese optical-weight correction: Zen now maps CSS 400 to Medium, 500 to
Bold, and 600–700 to Black, bringing Japanese strokes closer to SC Walla.
Latin letters/numerals and the shared type sizes remain unchanged.

Japanese shared line-height settings: display/section headings 1.5; statements
and overviews 1.7; reading/copy 1.8; UI labels 1.6; UI body 1.75; captions and
small supporting text 1.65. These unitless leading tokens apply at every
breakpoint, keeping existing sizes, weights and English metrics. This follows
the Digital Agency’s minimum 1.5 reading-text guidance with extra room for
Japanese paragraphs: https://design.digital.go.jp/dads/foundations/typography/

## Medium text — 11 November 2026
All non-uppercase roles now use Medium (500): Display, Section, Overview, Reading, UI body, Caption, Small and Copy join the existing Medium roles. This supersedes the Regular/Bold weights in the historical tables above. Keep existing uppercase label recipes and fitted uppercase brand lettering. Sizes and language-specific leading stay unchanged.

## Body reading metrics — 11 November 2026
About's body paragraphs now use the existing Reading role at every viewport:
22px Regular (400), 32px line height and −0.01em letter spacing (−0.22px)
in English. Japanese uses 22px Regular with 32px line height and normal
letter spacing. `--type-reading-track` applies consistently to every Reading
assignment, including Contact introductory copy and Privacy/Legal prose.
The UI role remains separate. About's paragraph gaps stay 16px desktop and
12px mobile; the section reveal wave is unchanged.

Project Overview copy now aliases the Reading recipe, matching About exactly:
22px Regular, 32px leading and −0.22px tracking in English; 22px Regular, 32px
leading and normal tracking in Japanese. This applies to every project overview
in standalone pages and dialogs, on desktop and mobile. The Overview label and
existing one-line paragraph separation retain their own layout roles.

## Regular supporting details — 11 November 2026
Small supporting text and Caption now use Regular (400) throughout the site.
Project metadata values use the Regular UI variant, while the hero one-liner
and dialog Overview eyebrow use Regular UI body. Standalone Overview labels
retain their existing Reading mapping and responsive size; metadata labels use
Caption. Project thumbnail one-liners share Caption with other supporting
captions. Medium captions, project titles, uppercase UI and navigation retain
500. Sizes, line heights, tracking and casing are unchanged.

“See more work” project names use the shared Medium Reading variant (500),
retaining 22px / 32px and their current language-specific tracking in every
project page and dialog. Body and Overview remain Regular.
