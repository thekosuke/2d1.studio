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

## Eight core roles

| Role | Token | Default desktop metrics | Use |
| --- | --- | --- | --- |
| Display | `--font-display` | 64px / 1.2, Semibold | Large section titles |
| Statement | `--font-statement` | 40px / 1.2, Medium | Large copy and CTAs |
| Section | `--font-section` | 32px / 1.1, Bold | About title and section headings |
| Overview | `--font-overview` | 32px / 1.3, Regular | Project overview |
| Reading | `--font-reading` | 20px / 1.5, Regular | About prose |
| UI | `--font-ui` | 16px / 1.5, Medium | Interface headings and controls |
| Caption | `--font-caption` | 14px / 1.5, Regular | Shop/Studio supporting captions |
| Small | `--font-small` | 12px / 1.5, Regular | Notes and supporting interface text |

These are roles, not a claim that every rendered text combination is identical.
Named variants preserve the current design: UI body/reading, medium captions,
small uppercase labels and small medium captions. `--font-copy` retains the
existing responsive supporting-copy role for legacy/shared selectors. Home’s
large reading copy retains its 1.35 desktop leading and -.01em tracking; CTAs
retain 1.2. Japanese uses Zen Kaku Gothic New and language-specific rhythm.

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
glyphs stay outside the system. Temporary typography controls are a development
tool, and archived pages are outside the active site.

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
