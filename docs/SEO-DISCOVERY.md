# Familiar Characters: search and AI discovery

Updated 1 November 2026 after the owner combined product pages into the modal.
Familiar Characters keeps its immersive canvas. There is no browse-all page or
separate category listing. The removed implementation is archived under
`_archive/fc-browse-2026-10-26/` and is excluded from the active site and package.

## Current SEO implementation

- Collection title and description identify curated design objects and everyday
  goods for the home, kitchen, workspace and everyday carry. These phrases are
  inferred search intents from the actual catalog and reference sites, not
  measured keyword-volume claims.
- The main collection retains factual `CollectionPage` / `ItemList` JSON-LD,
  visible descriptive copy in its info sheet, author/publisher identity, Open
  Graph and Twitter metadata, and large-image preview permission.
- Product information now lives in the collection modal, with a three-product
  related section. Separate Object details pages, metadata tables, links and
  previous/next product controls have been removed.
- All 214 old EN/JA item paths are noindex redirects to the corresponding
  collection modal via `?item=ID`. Collection schema uses these modal URLs;
  individual Product/Breadcrumb page schema is retired.
- The sitemap contains 24 canonical routes. Redirects and query URLs are excluded.
  The previous detail-page implementation is archived in
  `_archive/object-details-2026-11-01/`.
- Production robots permits search and AI search crawlers while excluding
  development folders and API routes. Existing training-bot policy is unchanged.
  Robots exclusions are not access control.
- The existing GA property `G-7YBDBXJWCG` runs on collection pages only
  at the public production domains. Local and private previews send no analytics.

## Build and verification

`data/objects.json` is the catalog; `locales/ja.json` supplies Japanese copy.
`scripts/fc_discovery.py` generates legacy item redirects and the sitemap.
Both catalog and Japanese build workflows invoke it. They cannot recreate the
removed directory or category pages.

```sh
python3 scripts/build-objects.py
python3 scripts/build-japanese.py
python3 tests/fc-seo.py
python3 scripts/audit-site.py
python3 scripts/build-preview.py
python3 tests/fc-seo.py dist
python3 scripts/audit-site.py dist
```

SEO checks cover all canonical URLs, catalog/schema agreement, image files,
localized metadata, reciprocal alternates and absence of browse routes/links.
The 234 HTML files include legacy redirects. Local references are audited in
source and the private package. Browser checks exercise English/Japanese phone
and desktop canvas-to-object navigation, return navigation and removed routes.

The private package remains noindex through meta tags, robots and headers.
The packager follows quoted local CSS imports so shared close-control styling
is included. Nothing has been publicly deployed or submitted to search engines.

Earlier broader QA covered metadata and object layouts in 42 rendered-page
checks plus 12 photo/text-bound checks. Two older controller suites still have
stale fixtures (`finds-performance.mjs`: missing `shopPreview` VM variable;
`objects-family.mjs`: mocked input lacks `.before()`). Those fixture paths were
not changed by the SEO work; the full historical suite is not claimed to pass.

## Launch and traffic measurement

Public publishing requires a separate request. At public release:

1. Serve the canonical HTTPS routes with HTTP 200 and the production robots
   policy/sitemap. Remove noindex only from the authorized public deployment;
   retain private-preview protection. Confirm access through the CDN/WAF.
2. Use owner accounts to verify Google Search Console and Bing Webmaster Tools.
   Submit `https://2d1.studio/sitemap.xml` and inspect the collection plus a sample
   object page. Validate actual response headers, rendered text and structured
   data. No verification credentials or submissions were created by this task.
3. Confirm GA pageviews. Track organic impressions, clicks, unique visitors,
   indexed entry pages and landing-page CTR; review queries and AI referrers.
   AI answers can cite content without sending visitors, and absent referrers
   don't prove zero AI visits.
4. Use actual search-query evidence to refine object descriptions and collection
   positioning. Owner-approved design-community submissions, editorial links and
   social sharing can broaden reach; none were sent by this task.

## Reference evidence

Goods and Curated Supply use designed physical products and product/category
vocabulary. Their public pages informed positioning, not traffic estimates.
Google says the normal SEO foundations apply to AI Overviews and AI Mode;
there is no required special AI schema or AI text file. OpenAI documents
OAI-SearchBot as its search crawler, independently from GPTBot training controls.
The production wildcard already permits search crawling. Indexing, rankings,
AI citations and visits are not guaranteed.

- https://goods.so/
- https://www.curated.supply/
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots


## Launch audit update — 27 October 2026

Privacy adds two localized canonical routes. The actual packaged sitemap is now
copied and validated, not inferred from the source tree. Brand-only titles may
match across language alternatives; uniqueness is checked within each locale.
The catalog generator preserves the opt-in analytics script and current shared
cache revisions. Private packaging still sets noindex in HTML, robots and headers.
See `LAUNCH-2026-10-27.md` for observed public-domain failures and verification limits.
