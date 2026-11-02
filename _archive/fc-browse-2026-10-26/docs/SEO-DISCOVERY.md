# Familiar Characters: search and AI discovery

Implemented 26 October 2026. This work prepares public discovery; it does not
publish the site, submit URLs, or remove indexing protection from private previews.

## Search positioning

Familiar Characters is a human-curated directory of design objects and everyday
goods, selected by Kosuke Futsukaichi at 2D1. It is distinct from the studio and
2D1's original-product shop. Its difference is everyday objects with personality
and wit, rather than a generic catalog or claims of testing every product.

Goods describes itself through designed physical products and category browsing.
Curated Supply uses curated, design-led products, category/brand directories and
specific objects. These are evidence for vocabulary and information architecture,
not evidence of their traffic, keyword volume, backlinks or search performance.

The search-intent map below is inferred from those sites and this actual catalog.
No paid keyword-volume tool or Search Console data was available.

| Entry point | Search intent to serve |
| --- | --- |
| `/familiarcharacters/` | Familiar Characters, curated design objects, product discovery |
| `/familiarcharacters/browse/` | curated products, design objects, everyday goods, gift ideas for design lovers |
| `/familiarcharacters/browse/home/` | playful home objects, design home accessories, lamps, clocks, furniture |
| `/familiarcharacters/browse/kitchen/` | well-designed kitchenware, coffee makers, tableware, kitchen tools |
| `/familiarcharacters/browse/workspace/` | design desk accessories, stationery, workspace objects, digital tools |
| `/familiarcharacters/browse/everyday-carry/` | bags, pouches, everyday carry, personal accessories |
| `/familiarcharacters/items/<catalog-id>/` | specific brand + product names, photographs, object discovery |

All have corresponding Japanese routes. IDs provide stable permanent URLs; don't
rename them casually when a color, image or public product name changes. Four
existing `home` records join `living` in the Home discovery category; this does
not change canvas filtering or source catalog metadata.

## What changed

- Collection title/description/social previews now explain what visitors can find.
- 107 permanent object pages per language, four category pages and an all-object
  directory. They use actual descriptions, authentic photographs, image sources,
  brand/category facts, related objects and maker/retailer links. No fake reviews,
  firsthand ownership, prices, availability or ratings are invented.
- Ordinary HTML links connect the canvas info sheet and product dialog to those
  pages. The directory, categories and individual pages work without JavaScript.
  Canvas fallback cards expose descriptions and permanent detail links.
- `CollectionPage`/`ItemList`, `WebPage`/`Product`, `BreadcrumbList`, author and
  publisher JSON-LD describe visible content. Product schema intentionally has
  no offers or ratings. It is semantic data, not a promise of shopping rich results.
- Self-canonicals, reciprocal EN/JA/x-default alternates, social metadata and
  image previews are generated per page. Sitemap now covers 238 canonical URLs,
  including both languages, all existing current pages and product images.
  Redirects, filters, fake last-modified dates and priority scores are excluded.
- Production robots policy permits crawling, while excluding development folders
  and API paths. Wildcard permission includes AI search crawlers; training-bot
  policy has not been changed. Robots exclusions are not access control.
- Existing GA property `G-7YBDBXJWCG` now runs on the collection and discovery
  pages only at `2d1.studio` / `www.2d1.studio`. No analytics are sent from local
  review URLs or the private hosted preview.

## Regeneration and checks

Source catalog: `data/objects.json`; Japanese text: `locales/ja.json`.
`build-objects.py` and `build-japanese.py` both invoke `fc_discovery.py`, so adding
an object regenerates its permanent pages, category links and sitemap. Normal
packaging recursively includes all generated routes.

```sh
python3 scripts/build-objects.py
python3 scripts/build-japanese.py
python3 tests/fc-seo.py
python3 scripts/audit-site.py
python3 scripts/build-preview.py
python3 tests/fc-seo.py dist
python3 scripts/audit-site.py dist
```

Local preview server and packaged `dist/` remain noindex. The package's robots.txt
blocks crawling and its headers/meta tags prevent indexing. Do not publish that
private build as a public SEO release. Current production hosting configuration
and live indexing could not be confirmed from the public URL during this pass.

## Public launch and acquisition

Publishing is a separate owner-authorized step. At launch:

1. Serve canonical `https://2d1.studio/` routes with HTTP 200, HTTPS and matching
   canonical tags. Redirect legacy `/finds/` and `/objects/` at the host with
   permanent redirects; HTML fallback redirects alone are not equivalent.
2. Use the production robots.txt and sitemap; remove private noindex headers and
   meta only from the authorized public release. Keep review hosts protected.
   Verify crawler access at CDN/WAF level as well as robots.txt. Confirm the
   existing image/source clearance decisions for the public catalog.
3. Verify the domain in Google Search Console and Bing Webmaster Tools using
   owner accounts. Submit `https://2d1.studio/sitemap.xml`. Inspect the collection,
   directory, a category and a product in Search Console. Do not create fake
   verification tokens or bulk indexing requests. Check rendered HTML and
   actual response headers, then use Google's Rich Results Test/schema validator.
4. Confirm GA pageviews on the new paths. Measure organic impressions, clicks,
   unique organic visitors, indexed entry pages and landing-page CTR. Review
   search queries and inbound AI referrers after launch; missing referrers do
   not prove zero AI visits. AI answers can also satisfy users without a click.
5. Grow distribution with owner-approved directory/design-community submissions,
   editorial links and social sharing of specific objects and categories. No
   submissions or third-party messages were sent by this task.

For broad reach, develop a few genuine editorial selections (for example playful
kitchen tools or gifts for design lovers) with the owner's reasons for choosing
each object. Search Console should guide which themes to expand. A product's
existing facts and source photographs support a detail page; they don't replace
original curation, and indexing of every object page is not guaranteed. Avoid
mass-producing near-identical gift/"best" pages, unsupported hands-on reviews,
competitor-name stuffing, or pages for categories with no real selection.

## AI search evidence and limits

Google says normal SEO foundations apply to AI Overviews and AI Mode: indexable
content, crawlable links, readable text, appropriate images and accurate structured
data. There is no special required AI schema or AI text file. `llms.txt` was not
added as a purported ranking fix. OpenAI documents OAI-SearchBot as its search
crawler, separately from GPTBot training controls. Our production wildcard already
allows it. None of this guarantees indexing, citations, ranking or clicks.

References checked 26 October 2026:
- https://goods.so/
- https://www.curated.supply/
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/essentials
- https://developers.openai.com/api/docs/bots


## Verification completed

- Source and private package: 238 canonical sitemap URLs validated against real
  files, reciprocal language alternates, localized metadata, catalog facts,
  JSON-LD and crawl policy. 242 HTML files (including legacy redirects) have
  zero broken local references in both source and package.
- 42 rendered page checks across 320px, 390px and 1440px, in English/Japanese;
  an additional 12 final photo/text-bound checks after the mobile layout polish.
  No browser JavaScript errors or viewport overflow in these checks.
- Exercised the canvas info link, directory-to-object links, language switching,
  canvas product-dialog permanent links and no-JavaScript navigation.
- Private package headers/meta/robots remain non-indexable. Source and packaged
  SEO checks pass; JavaScript syntax and git whitespace checks pass.
- Two older controller suites were attempted and still fail on their documented
  stale fixtures: `finds-performance.mjs` lacks `shopPreview` in its VM context;
  `objects-family.mjs` mocks a search input without `.before()`. Those fixture
  paths were not changed by this task. No claim is made that the full historical
  suite passes. Actual interaction checks above passed in Chromium.
- Visual proof: `_previews/fc-seo/`. Actual search indexing, ranking and traffic
  have not been tested because this work has not been publicly deployed.

The preview packager also now follows quoted local CSS imports, fixing its
omission of `css/close-controls.css` from the shared typography dependency chain.
