# Finds performance review — 11 October 2026

## Measured delivery

At 1280 × 720, default canvas zoom, the captured original map contained 84 unique requested product photos, of which 45 intersected the viewport. The requested files totaled 11,275,628 bytes. This is a file-byte inventory, not a production network-speed test.

For exactly those same products and positions, viewport-only delivery with the new candidates at a 2× display density totals 814,682 bytes: **92.8% fewer initial canvas photo bytes**, and 45 rather than 84 product photo requests. The map randomizes each visit; totals vary with its products, viewport and display density.

A fresh browser visit after the changes selected 45 product photos and two brand images, totaling 835,548 encoded image bytes. The fallback catalog had zero loaded photos; no detail-gallery photos loaded before opening a product. The first visible photo decoded about 97ms after canvas script initialization on localhost. Controls/entrance completion took about 1,978ms, including the intentional entrance animation. These timings do not represent real Internet or mobile-network performance.

## Changes

- Generate lossless WebP delivery copies of all 107 canvas masters, including the eight products previously missing responsive candidates. Add small 192px and 256px candidates for the overview.
- Preserve original images and existing larger sources; never upscale. Browser `srcset` selection accounts for device pixel density and the current rendered size.
- Keep virtual overscan tiles for smooth dragging, but assign image URLs only when the tile intersects the viewport. Newly exposed cells load during drag/keyboard movement.
- Hide the static fallback grid before lazy loading begins when JavaScript is enabled. A four-second initialization failure restores it; no-JavaScript users retain the normal catalog.
- Decode/animate visible images independently; one slow image no longer blocks the whole collection. Controls retain their entrance timing, and hover remains gated during loading.
- During zoom animation, select a source sufficient for the final/current square instead of downloading every intermediate resolution. Compute source sizing once per draw to avoid repeated layout reads.
- Detail photos have responsive candidates where a lossless derivative is smaller than its original. Original resolution remains selectable. Cover framing accounts for landscape source ratios; original compositions and crops are unchanged.
- Adjacent-product previews use thumbnail-sized responsive sources instead of native masters.
- Generated image URLs contain a source hash. `_headers` caches these for one year, with `immutable` and `no-transform`, ready for Cloudflare static hosting. Mutable original filenames do not receive this permanent cache policy.

## Build and quality

`python3 scripts/build-finds-images.py` requires Pillow, the same development dependency used by the catalog audit. It generates only below native resolution, preserves embedded color profiles, skips derivatives larger than their originals, and cleans unused generated files within its own output directory. `data/finds-image-build.json` fingerprints source bytes and the generation recipe so unchanged photos do not re-encode on every build. `npm run build:hosted` runs this before page generation and packages the referenced delivery files.

Validation: all manifest dimensions match their declared widths and remain at or below native dimensions. Thirty sampled cutout/gallery derivatives exactly match the expected resized RGBA bytes after WebP decoding. No native photos were edited. Catalog audit still reports 107 transparent masters and 107 galleries within count limits; existing source/quality issues remain documented in FINDS-AUDIT.json.

`node tests/finds-performance.mjs` verifies deferred offscreen delivery, loading when dragging into new cells, source reuse, correct phone/desktop sizes and final-size zoom selection. Desktop and phone canvas/modal renders and Japanese delivery were checked. Purchased backend tests pass. The broad existing test suite remains blocked by stale mobile-nav expectations; older zoom and Studio reading tests also reflect superseded design behavior.

For opt-in browser diagnostics, open `/objects/?finds-perf` and read the `Finds performance` console entry. It reports aggregate local timings and image-resource sizes; no telemetry is transmitted. Normal visits do not log diagnostics. Warm-cache transfer bytes can be zero even when encoded sizes are nonzero.

## Hosting recommendations

When publication is requested, use Cloudflare static asset hosting and include `_headers` in the output. Cloudflare Pages serves uploaded static assets from its Tiered Cache; the additional browser cache policy avoids repeat downloads of unchanged generated photos. Keep HTML revalidating so catalog updates are picked up. Do not enable lossy image recompression on these delivery assets; they are already optimized losslessly. No paid image service is required by this implementation.

Retain high-resolution source files for future catalog additions and regenerate delivery copies rather than manually shrinking the masters. Adding more products will grow the catalog/package, but the canvas only requests viewport-intersecting photos.

The generated hosted package is approximately 530 MiB because it contains retained originals plus alternative delivery sizes; visitors do not download the complete package. This optimization trades more deployment storage for much smaller browser transfers. Nothing was published, committed or pushed by this review.

Sources: https://developers.cloudflare.com/pages/configuration/serving-pages/ and https://developers.cloudflare.com/pages/configuration/headers/
