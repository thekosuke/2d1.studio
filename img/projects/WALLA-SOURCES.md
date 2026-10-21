# Figma carousel artwork

Exported from Website 2026, file z1J8lyfvwOqtHpQqfNin3x, frame 242:341. These are artwork tiles, not rasterized website UI. Each tile is a 245px square, as in the design. Their order is preserved in index.html.

- walla-01.png: 267:562
- walla-02.png: 267:566
- walla-03.png: 267:564
- walla-04.png: 267:568
- walla-05.png: 267:627
- walla-06.png: 267:5337
- walla-07.png: 267:5334
- walla-08.png: 267:5340
- walla-09.png: 267:5342
- walla-10.png: 267:7626
- walla-11.png: 267:5344

## Active high-resolution delivery — 12 October 2026

Home now uses studio-01–11 WebP files, with 560px and 1120px sources for 280px slots, replacing the 245px exports above. Native project masters (1920–4000px wide) remain intact. Bottle, badge and business-card views use crops from the original project compositions; the cap comes from native Figma node 267:657 (1184 × 1328). Wordmarks retain their complete width in square artwork grounds. All resizing stays below native source dimensions. Work cards and detail sheets use responsive 640/1280/2560px delivery files; the existing 1920px website still is retained at native size. No artwork is upscaled.

## Home work-track framing — 21 October 2026

`track-01–11-{560,1120}.webp` now provide the active 280px square tiles.
Rebuild with `python3 scripts/build-work-track.py`. Website compositions and the
laptop use their full native project masters, contained on square project grounds
so screen edges and stickers remain visible. DeepDrip’s full wordmark is composited
on Icon Red. Existing bottle, cap, event, badge and card square crops are preserved.
All output is 560px or 1120px, with no source upscaling; previous assets remain intact.

The wide tiles now use the original responsive project images directly over square
backgrounds (`css/work-track.css`). `deepdrip/work-track-background.png` is an
AI-generated extension of the original pixel texture; the website artwork itself
remains the authentic native project image, composited by CSS without modification.
