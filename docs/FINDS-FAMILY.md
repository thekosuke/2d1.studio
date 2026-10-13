# Family search filter

The Familiar Characters search panel includes Family before Category and Color.
The same controls work in English and Japanese, on desktop and mobile layouts.

These are provisional editorial groups, independent of product categories:

- Characters: literal or figurative personalities (27 items)
- Companions: useful everyday sidekicks (24 items)
- Classics: simple, enduring staples (24 items)
- Oddities: playful, unusual forms (20 items)
- Rituals: objects that give everyday routines a little care (13 items)

All 108 catalog items have one explicit family assignment in
`data/object-families.json`, keyed by their unchanged product IDs.
Edit that map to revise an assignment. The product catalog stays untouched. The generator validates the five
supported values and updates the generated `objectFamilies` lookup in
`js/objects.js`. The runtime looks up each unchanged product ID, with no extra
network request. Both static HTML catalogs remain unchanged.

Multiple selected values within one facet match any of those values (OR).
Family, Category, Color, and typed search words combine to narrow results (AND).
Selected buttons toggle off; Clear filters resets every facet and the query.
Family names are searchable in English and the current interface language.
The canvas, zoom, product navigation and no-JavaScript collection are preserved.

## Verification

`npm run test:family` passes against the production filter and suggestions
controller: catalog completeness, both languages, all five options, selection,
facet/text intersection, focus restoration, empty/reset and Escape/reopen.
JavaScript syntax, bilingual generation, hosted build, existing purchased-backend
and Finds image-delivery checks pass.

The full existing test suite is not green. Home navigation's old `data-contact`
assertion, an Objects reduced-motion mock missing `addEventListener`, and a
reading-ink integration-position assertion fail identically on the unchanged
base commit. These unrelated tests were not rewritten for this feature.

Rendered desktop/mobile interaction testing remains unverified because the
available browser cannot reach the development server. This is controller and
source coverage, not a visual QA pass.
