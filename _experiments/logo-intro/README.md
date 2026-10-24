# 2D1 social introduction

Separate local animation. No production page or landing script is changed.

## Preview

From the repository root, run `python3 scripts/preview.py`, then open
http://localhost:4173/_experiments/logo-intro/.
Playback loops continuously. Replay starts from the beginning; Play/Pause and the timeline allow close review.
Reduced motion disables autoplay; Replay explicitly opts into playback.
All controls are outside the exported square. JavaScript is needed for playback;
without it, the original SVG remains visible.

## Fidelity and composition

- Original paths loaded directly from `img/brand/logo_red.svg` and
  `logo_beige.svg` (829 × 280). Eyes reuse `eyes-on-red.svg` at x=317, y=103,
  width=116, height=48 in logo coordinates, exactly as on the website.
- Brand colors read from `css/walla.css`: Icon Red and Soft Beige.
- Centered 720px-wide logo in a 1080px square, original aspect ratio preserved.
  As the caption emerges, both move upward by half its visible extension (up to
  62.6px), keeping their combined visible bounds centered. The move reverses as
  the caption tucks away. Both color layers and the eyes travel together.
  This is an intentional feed-sized enlargement of the website's centered mark.
- Starts on solid Icon Red. Beige upper 2 left→right, lower 2 right→left and
  1 bottom→top and D left→right all start together.
  The 2 splits at the asset's exact y=140 join. No path morphing.
- Construction: 616ms each, all clips start together.
  A pronounced `cubic-bezier(.76,0,.16,.8)` gives the extrusion a deliberate start,
  quick middle, and moving finish. The clips do not recoil.
- The logo stays at its original 720px width throughout: no animated scaling,
  overshoot, or pop. Only the extrusion clips move. Opening hold is 103ms.
- Wipe: exact `landing-wipe` bottom-inset geometry, 754ms,
  `cubic-bezier(.7,0,.2,1)` from `css/walla.css:137–142`.
  After a 480ms complete-logo hold, the red sheet with its beige mark recedes
  upward, revealing a perfectly registered red mark on beige underneath.
- After the wipe, the supplied eyes appear looking left. Eye outlines stay fixed; only the two
  original pupil paths move horizontally inside them. Preserve the first
  landing blink, glance right over 123ms, hold, then return left over 123ms.
  Two quick blinks finish the sequence. Pupils travel 12 logo units between right and left;
  the complete eye beat lasts 1439ms and scales with the timing control.
  Hold with open eyes looking left on the red logo/beige ground.
- “A DESIGN HOUSE” slides down from a masked layer behind the logo over 445ms,
  starting exactly when the upward wipe crosses the logo’s bottom edge, using
  `cubic-bezier(.2,.8,.2,1)`.
  It reuses SC Walla Bold, the website's fitted glyph spacing, dark-brown ink,
  12px gap and 0.16×logo-width caption slot, scaled from the 240px desktop mark
  to this 720px mark. The caption retains its position relative to the logo; the whole composition recenters vertically.
  `caption-reference.json` records measured website layout; `build-caption.py`
  extracts the purchased font's exact outlines into `caption.svg` for identical
  browser/offline rendering without font substitution. Rebuild with Python
  FontTools and Node's built-in Brotli decoder if the source caption changes.
- Loop: after the beige hold, a 754ms red sheet descends from top to bottom
  with the same wipe easing. The registered beige mark replaces the red mark
  precisely as the sheet crosses it. The caption’s 343ms slide upward ends exactly when the returning wipe
  crosses the logo’s bottom edge. Its inverted beige layer follows the same motion.
  Both cues are calculated from logo geometry and the wipe easing, so changing
  wipe duration keeps them aligned. Long exits are fitted inside the return wipe.
  Travel uses the actual glyph bounds so visible entry/exit meets the mask edge.
  Exit uses `cubic-bezier(.7,0,.85,.55)` to accelerate into that edge, keeping
  text visibly moving through the final frames instead of disappearing during
  a long ease-out tail. The logo reset waits for both the wipe and caption.
  A 274ms reverse extrusion clears the beige logo, followed by 100ms empty red.
  The final exported frame is pixel-identical to the first; there is no hard reset.
  `returnWipe`, `captionOut`, `reset`, and `loopHold` are separately adjustable.
- No opacity fade, distortion, extra effects or audio.

## Timing and export

The five-second master proportionally extends the previous four-second sequence.
Edit `timing.json` (milliseconds), or adjust fields in the preview and save the
JSON back to that file. Browser timing changes are temporary until saved.

From the repository root:

```sh
node _experiments/logo-intro/export.mjs
# Optional alternate settings file:
node _experiments/logo-intro/export.mjs /absolute/path/to/timing.json
```

Requires existing local Node + `sharp`. macOS uses Swift/AVFoundation (Xcode
command-line tools); other platforms use FFmpeg with libx264 on PATH. macOS
encoding needs access to its video encoder and will not work in a sandbox that
blocks that service. No packages are downloaded by the exporter.

Output: `exports/2d1-intro-1080.mp4`, H.264 High, 1080 × 1080, 60fps, silent,
16Mbps target on macOS, network-optimized MP4. Current sequence: exactly 5 seconds,
300 frames. Suitable as
one square master for Instagram, Threads, LinkedIn and X; platforms may reencode.
The preview's Download MP4 link downloads the last export, not unsaved timing edits.

The pure `renderSVG(time, timing, assets)` function is shared by both playback
and export. Every output frame is sampled at exactly `index × 1000 / 60` ms;
no screen recording, random state, browser frame rate, or session storage.
Temporary frame files are removed after export. A poster and settings manifest
are saved beside the MP4. The H.264 file is lossy; SVG/PNG source colors remain exact.

Run `node _experiments/logo-intro/check.mjs` to verify concurrent timing, exact
asset geometry, original eye placement, blink timing and deterministic output.
Earlier exports are retained as `exports/2d1-intro-1080-v1.mp4` and
`exports/2d1-intro-1080-v2.mp4` and `exports/2d1-intro-1080-v3.mp4`. The hopping version is
`exports/2d1-intro-1080-v4.mp4`. The scale-up reveal is
`exports/2d1-intro-1080-v5.mp4`.
