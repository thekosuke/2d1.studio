# Search and AI discovery — 27 October 2026

## Public now versus prepared for launch

The owner chose to keep the public page **eyes only**. The splash retains its
`2D1` browser title, colors, animation and interaction. Its description identifies
the design practice, services, and Japan/North America service area. The public
Worker allows indexing of `/`, serves the approved social card, and exposes a
sitemap containing **only https://2d1.studio/**. Other site routes remain 404 with
noindex headers. The complete site, assets, project pages, and catalog are not
part of this deployment.

This makes the splash eligible for crawling; it does not guarantee indexing.
With almost no visible content, it has little basis for ranking for competitive
service searches. The owner intentionally accepted that tradeoff until launch.

## Full-site changes prepared locally

- Distinct English and Japanese titles/descriptions for Home, About, Studio,
  Shop and Contact, with matching social metadata.
- Original Home and About copy is preserved in both languages. Service-area
  information is confined to metadata and structured data; SEO work must not
  rewrite visible copy or add content without an explicit request.
- Shared factual Organization, founder Person and WebSite identities, with
  localized WebPage types and stable identifiers across both languages.
- Native HTML project entry pages for Aviator, supa and DeepDrip at
  `/work/aviator/`, `/work/supa/`, `/work/deepdrip/`, plus `/ja/` counterparts.
  They reuse the approved project descriptions, images, typography and footer.
  Existing gallery overlays retain their original content. Standalone pages have
  related-project and language links that work without JavaScript. Videos use
  user-controlled native playback.
- Canonical URLs, reciprocal EN/JA/x-default links, project CreativeWork markup,
  breadcrumbs, and project-specific social images.
- The future full sitemap includes 236 canonical URLs: 16 existing main routes,
  six project routes and 214 existing bilingual object entries. No new category
  or browse-all directory was added.
- The existing object discovery pages now share the same business identity.
  Their authentic product names, source citations and descriptive content remain
  the broader discovery opportunity for people interested in everyday design.
- Preview server and packaged preview noindex protections remain in place.

`python3 scripts/build-japanese.py` regenerates Japanese HTML, object discovery
and shared site metadata/project pages. Edit English project content in
`work/index.html` and translations in `locales/ja.json`; generated project pages
are not independent copy sources. The generator is `scripts/site_seo.py`.

## Search topics to develop

These are editorial hypotheses, **not measured search-volume or ranking data**.
Use Search Console after launch to prioritize actual demand.

| Intent | English examples | Japanese examples | Natural landing content |
| --- | --- | --- | --- |
| Find a studio | independent design studio Japan; design studio Japan North America | 日本 北米 デザインスタジオ; 独立系デザインスタジオ | Home and About |
| Brand identity | brand identity studio; branding for startups | ブランドデザイン; スタートアップ ブランディング; ビジュアルアイデンティティ | Studio and real project stories |
| Websites and products | website design studio; digital product design; UX UI design | ウェブサイト制作 デザイン; デジタルプロダクトデザイン; UX UI デザイン | Studio, Contact, project descriptions |
| Specific sectors | AI company branding; healthcare brand identity; developer publication design | AI企業 ブランドデザイン; ヘルスケア ブランド; 開発者 メディア デザイン | supa, Aviator, DeepDrip |
| Design curiosity | everyday design objects; specific product and designer names | 日用品 デザイン; actual product/designer names | Familiar Characters item pages |

Do not manufacture location pages, repetitive keyword pages, or claims of offices
in cities where the practice has no office. Strong additional content would be
short, concrete project stories explaining the client problem, what 2D1 did, and
what changed. Add measurable outcomes only when verified and client-approved.
Original observations about the collected objects can attract a wider audience
without changing the studio's voice or turning the site into generic SEO copy.

## AI search approach

Google says its ordinary search requirements and SEO fundamentals also apply to
AI features; no special AI schema or separate AI text file is required. Prioritize
crawlable visible copy, specific answers, factual structured data, and consistent
business attribution. See [Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)
and [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

The crawl policy permits search crawlers through the wildcard rule, including
OAI-SearchBot and Bing. That is eligibility, not a promise of citation or referral
traffic. No claim is made that crawler access controls whether models have already
learned about a brand. Search access and model-training preferences are separate;
see [OpenAI's crawler documentation](https://developers.openai.com/api/docs/bots).
No training-specific policy was changed for this task.

## Launch and growth actions still outstanding

1. Verify 2d1.studio ownership in Google Search Console and Bing Webmaster Tools.
   Submit the single-URL public sitemap now if desired; replace with the full
   authorized sitemap only when the full site launches. No account verification
   or search-engine submission was performed in this task.
2. Launch the full site only after explicit approval and the existing client,
   image-rights and form-readiness checks. Do not deploy the private `dist/`
   unchanged: its noindex headers intentionally protect review copies.
3. Confirm the LinkedIn company profile/name. The footer still links to
   `newfiction-org`; it is intentionally omitted from the new Organization
   `sameAs` list until the 2D1 identity is confirmed there.
4. Request legitimate credits/links from clients when permitted; link the
   2D1 site from the founder portfolio and official social profiles. No outreach
   or profile edits were sent/made here.
5. Publish original case-study or object observations through the owner's
   established social channels, linking to the relevant page. Do not buy links,
   fabricate reviews, or publish automated keyword pages for volume.
6. Measure non-brand impressions, clicks, indexed pages, organic landing-page
   sessions and referral visits after launch. Compare 28-day periods and account
   for launch/seasonality. Bing's AI Performance can help inspect citations where
   available; [Bing guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a)
   explain discoverability expectations. More bots fetching a page is not more
   human visitors. No additional analytics or cookies were added to the splash.

## Verification

- `node tests/coming-soon.mjs`: splash routing, original artwork/script hash,
  single-URL sitemap, indexing headers, redirects, and unpublished-route isolation.
- `python3 tests/site-seo.py`: 16 launch pages, graph identity, locale/canonical
  links, local references, project video sources and preview protections.
- `python3 tests/fc-seo.py`: 236 sitemap URLs, locale alternates, catalog/schema
  agreement, source citations and crawl policy.
- Regeneration is idempotent for sampled Home, Japanese Home, Studio, project and
  sitemap outputs.
- Browser: desktop and 390 × 844 phone layouts; EN/JA project switching, mobile
  menu, gallery overlay → project page, related-project navigation and actual
  native video playback. No console errors observed on tested project pages.
- Visual evidence is in ignored `tmp/seo-2026-10-27/`.

These checks establish implementation integrity, not rankings, rich-result
eligibility, guaranteed indexing, or a forecast of traffic.
