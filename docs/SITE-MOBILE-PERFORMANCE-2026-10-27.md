# Website-wide mobile delivery — 27 October 2026

The remaining pages are optimized locally, retaining the existing design,
animation timing, original imagery and native-resolution sources. No new UI,
public deployment, DNS change, commit or push was performed.

[Source preview](http://localhost:4173/) remains live. The separate compressed
package server used for measurements is temporary internal QA.

## Changes

- Studio's three unopened project heroes are lazy rather than eager. Its first
  visible project thumbnail has high priority. Project-video posters are deferred
  with their existing visibility-controlled player; the existing still-image
  fallback remains. Opening still uses the same cached thumbnail-to-hero handoff,
  then the same sharp source. Native standalone project pages retain their eager
  hero, poster and manual video controls, including without JavaScript.
- Shop's live Familiar Characters thumbnail requests sources for the actual
  transformed iframe size, both axes, device density and maximum zoom. Previously
  it requested 320 CSS px per photo inside a 1600px iframe even when the entire
  preview was tiny. The preview still mounts on visibility, uses the same fixed
  object order, zooms on hover/focus, stops on leave and disposes offscreen.
  Resizing messages refresh the source hints without rebuilding the canvas.
- Each remaining Japanese page receives only its exact page vocabulary instead
  of the full site dictionary. Static translated HTML is unchanged. Dynamic form,
  navigation and gallery strings retain the same values; the full legacy file
  remains for compatibility. Project entries inherit the Studio vocabulary.
- Existing individual object-entry pages now describe the real responsive widths
  of their primary photo, gallery and related thumbnails. Available native/larger
  sources remain; galleries avoid fetching desktop-sized photos for half-width
  mobile tiles. This does not add a browse-all or category index.
- Two PNGs have pixel-identical, content-hashed lossless WebP delivery files.
  Original PNGs remain locally. Dimensions, every decoded RGBA sample and ICC
  metadata match, including transparent pixels. The Home artwork background is
  1,319,337→848,878 bytes (35.7% smaller); Memoru's Shop icon is 208,232→50,960
  bytes (75.5% smaller). These are encoding changes, not retouching or lossy
  recompression. Existing photo files, crop/color and composition are unchanged.

The Japanese dictionary was about 69 KB gzip before. Current page dictionaries
are approximately 2.2–5.3 KB gzip, reducing that request by about 92–97%. The
existing shared font banks, typefaces, weights, glyph outlines and typography
remain as verified in the earlier Familiar Characters optimization.

## Measurements and their limits

Cold browser/cache, Chrome at 393×852 CSS px, 3× DPR, 150ms latency, 200,000 B/s
download, 4× CPU slowdown; compressed generated package, identical settings.
These are representative paired lab runs (one per route), not production field
measurements, physical iPhone Safari results, or statistically stable guarantees.

Representative LCP observations:

| Route | Before | After |
| --- | ---: | ---: |
| / | 0.77 s | 0.79 s |
| /about/ | 0.72 s | 0.72 s |
| /work/ | 2.76 s | 1.54 s |
| /shop/ | 1.79 s | 1.80 s |
| /contact/ | 0.76 s | 0.75 s |
| /privacy/ | 0.73 s | 0.73 s |
| /red-pixel/ | 0.43 s | 0.44 s |
| /ja/ | 0.83 s | 0.78 s |
| /ja/about/ | 0.76 s | 0.64 s |
| /ja/work/ | 4.60 s | 1.13 s |
| /ja/shop/ | 2.17 s | 2.07 s |
| /ja/contact/ | 0.80 s | 0.65 s |
| /ja/privacy/ | 0.79 s | 0.64 s |
| /ja/red-pixel/ | 0.50 s | 0.49 s |

The strongest main-page change is Studio: 2.76→1.54 s EN and 4.60→1.13 s JA.
Text-only English pages and Red Pixel were already small; no layout or creative
motion was changed to force a score gain. Most of their timings remain similar.
Home's entrance and reveal are unchanged, so early hero LCP remains similar;
the lossless background saves 470,459 bytes when that artwork is requested.

Shop needs a separate measure because the live preview is inside an iframe.
The original was still **not ready at 60.8 s EN / 61.9 s JA**, after receiving
about 11.4 / 11.6 MiB across the page and iframe. The optimized preview became
ready at **12.6 s EN / 13.5 s JA**, receiving about 2.2 / 2.4 MiB. The old static
poster remained available while it loaded; the existing live replacement/zoom
behavior is preserved. The old transfer is a lower bound at the timeout, not a
completed total. Parent-only transfer totals would mislead here, so they are not
used as a whole-page saving claim. The preview remains network-sensitive on a
slow cold connection; it is not described as instant.

Six native project entries and EN/JA object-entry samples were also measured.
Native project hero priority improved their early delivery; generated image-slot
hints retain enough detail at 3× DPR and do not upscale beyond the source.

## Verification

- 80 before/after page renders: Home, About, Studio, Shop, Contact, Privacy,
  Red Pixel and all three project entry pages, both languages at 393px and
  1440px. No document overflow or runtime errors.
- 52 visual pairs include Home artwork/tote and Memoru's Shop image. 44 are
  exactly pixel-identical; remaining differences are at most **1/255 per RGB
  channel** in small antialias/compositing regions. Type, layout, artwork and
  component geometry match. New lossless image files separately pass complete
  decoded RGBA equality against their PNG masters.
- 32 interaction/lifecycle cases at 393px, 768px and 1440px in both languages:
  Home strip keyboard browsing and tote specs; every project/gallery/related
  transition; Shop's four-product loop; required form fields, categories and
  honest fallback using mocks; optional analytics controls. No real inquiries,
  Notion writes or email were sent. No-JS Home/Studio and native case video
  fallbacks pass.
- Eight full-zoom Retina/resize preview cases cover 393×852, 1440×900, 844×390
  and back in both languages at 3× DPR. Every photo's chosen source covers the
  maximum painted size, not just the initial zoom. Offscreen disposal passes.
- Six additional media/input cases verify normal project opening, video source/
  poster/play on visibility and teardown, Red Pixel keyboard launch/input/exit,
  and primary/gallery/related object photo density in both languages.
- All 240 packaged HTML files have zero broken local references. Source/package
  SEO tests and targeted image, vocabulary, delivery and analytics tests pass.
  No general npm-suite pass is claimed; historical mock-DOM failures remain.

Raw traces, source snapshots and screenshots are retained under the ignored
`tmp/site-mobile-performance/` folder. For maintenance:

```sh
python3 scripts/build-lossless-page-images.py  # Pillow; retains originals
python3 scripts/build-japanese.py             # exact per-page dictionaries + HTML
python3 scripts/build-preview.py              # private package; never publishes
python3 tests/page-image-delivery.py
python3 tests/site-language-delivery.py
```

Preserve the prior full-coverage font proof and normal collection delivery in
[the Familiar Characters performance report](FC-MOBILE-PERFORMANCE-2026-10-27.md).
