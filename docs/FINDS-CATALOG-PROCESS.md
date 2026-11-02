# Finds catalog requirements

For every addition or replacement, retain the complete original photo and its exact product/source URLs. Use the original launch colorway, or a demonstrably iconic/recognized version when the original is unavailable. Record the evidence and any owner-selected exception in catalog metadata; do not assert a color is iconic without evidence. Display names omit color; `variantName` preserves the selected variant internally.

The primary canvas photograph must have real background transparency, consistent square framing and optical weight, and the shared reversible CSS grade. Preserve complete product geometry, printed details, original color and logos. The owner approved conventional pixel-preserving masking for catalog cutouts on10 October2026. Change alpha only in the native master; retain original RGB, inspect edges/holes on light and dark grounds, and record a pixel comparison. Compare the result against the original before integrating it. Reject distorted image edits. Retain native detail and generate responsive derivatives only below original resolution; never enlarge an image to call it high resolution.

Keep authentic lifestyle/in-use photographs with their real settings; background removal applies to primary canvas product images. Include 1–4 distinct authentic detail-gallery photographs per product, preferring four only when quality permits. Select complementary angles and real-use photographs rather than repetitive views. Resolution takes priority over image count. The quality floor is a native long edge of at least 1200 pixels, with a clearly resolved product. Larger background padding is not additional usable detail. Prefer official original files; use credible designer/publisher sources with explicit credit when necessary. Multiple crops, alternate compression sizes and color swaps of the same view do not satisfy the distinct-view requirement. Never synthesize missing product photos. Record genuine unavailable-source exceptions for review instead of silently claiming compliance.

Run `python3 scripts/audit-finds.py` (development dependency: Pillow), inspect its per-product report and perform visual/source review. This report detects dimensions, alpha, counts and byte-identical duplicates; it cannot certify perceptual duplicates or historical colorway evidence. Update `docs/OBJECTS-SOURCES.md`, generate both languages, run `npm test` and `npm run build:hosted`, and check the final private package. Product IDs remain stable so ownership counts are not lost when names or photos change.

## Gallery composition and framing

Aim for four complementary authentic photographs: a clear complete product view, a second angle or mechanism, a close view of material/construction, and real use in a believable setting. Adapt the selection to the product; retain fewer when verified native-resolution sources are unavailable. Owner override, 11 October: fill detail containers edge to edge (`object-fit: cover`), centered at every viewport, with no letterboxing. Portrait photos fill the width; landscape photos fill the height. Choose compositions that keep the important product features within this crop. The canvas uses its separate transparent master.

## Required modal framing check — owner correction, 11 October

The first detail image is a complete product overview: the entire product must remain visible, including its top and base, with breathing room. Do not use a tight portrait crop with the square cover container. Prepare a native square crop that includes the whole product whenever the source allows; retain the original and never enlarge. Intentional close-ups belong later in the gallery.

Before reporting any addition or image replacement complete, open the actual detail modal at desktop and phone widths and inspect the first image. A source-file preview or transparent canvas preview does not replace this check. Verify the product’s top, sides and bottom remain visible in the rendered cover crop. Save a screenshot of the modal as proof. Repeat whenever a gallery’s first image changes.

## Product color swatches — November 1, 2026

`displayColors` in `data/objects.json` is the curated modal palette, separate
from the broad `colors` search labels. Review the actual product photograph
for every entry. Use one to five representative material/printed colors of the
featured product, with product-specific hex values. Do not count shadows,
highlights, reflections, scenery or several brightnesses of the same finish as
separate colors. Silver and gold represent metallic finishes; Clear represents
transparent material with a light neutral preview. These are visual photo
approximations, not manufacturer color specifications.

All 107 current palettes were visually reviewed against the primary product
photographs on November 1. DAYPA's featured blue backpack retains a blue-led
palette with its black, white and red details; the alternative canvas/fleece
colors in the supplementary group photographs do not change the selected
variant. Recheck this palette when the featured variant or image changes.
Preserve curated values during image regeneration instead of replacing them
with unreviewed dominant-pixel extraction. Regenerate both language routes
after updating palette data.
