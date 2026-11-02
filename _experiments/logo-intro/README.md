# 2D1 social introduction

Separate local animation. No production page or landing script is changed.

## Preview

From the repository root, run `python3 scripts/preview.py`, then open
http://localhost:4173/_experiments/logo-intro/.
Playback loops continuously. Replay starts from the beginning; Play/Pause and the timeline allow close review.
Reduced motion disables autoplay; Replay explicitly opts into playback.
All controls are outside the exported canvas. JavaScript is needed for playback;
without it, the original SVG remains visible.

## Fidelity and composition

- Original paths loaded directly from `img/brand/logo_red.svg` and
  `logo_beige.svg` (829 × 280). Eyes reuse `eyes-on-red.svg` at x=317, y=103,
  width=116, height=48 in logo coordinates, exactly as on the website.
- Brand colors read from `css/walla.css`: Icon Red and Soft Beige.
- Centered 720px-wide logo in a 1080px square, original aspect ratio preserved.
  As the caption emerges, both move upward by half its visible extension (up to
  50.6px), keeping their combined visible bounds centered. The move reverses as
  the caption tucks away. Both color layers and the eyes travel together.
  This is an intentional feed-sized enlargement of the website's centered mark.
- Starts on solid Icon Red. Beige upper 2 left→right, lower 2 right→left and
  1 bottom→top and D left→right all start together.
  The 2 splits at the asset's exact y=140 join. No path morphing.
- Construction: 616ms each, all clips start together.
  A pronounced `cubic-bezier(.76,0,.16,.8)` gives the extrusion a deliberate start,
  quick middle, and moving finish. The clips do not recoil.
- The logo stays at its original 720px width throughout: no animated scaling,
  whole-logo overshoot, or pop. Opening hold is 103ms.
  Small rigid-body gestures now accompany construction: each character leans
  into its arrival and settles with one tiny counter-motion. The two halves of
  2 move as one piece so their seam stays connected. 1 settles in 135ms, 2 in
  160ms, and D in 195ms after extrusion; all are at their exact original
  positions before the wipe. Translation is bounded to 8 logo units horizontally
  and 4 vertically, rotation to 3 degrees. No stretching or path deformation.
  Tune `characterMotion` in `animation.mjs`; the original reveal curve is unchanged.
- Wipe: exact `landing-wipe` bottom-inset geometry, 754ms,
  `cubic-bezier(.7,0,.2,1)` from `css/walla.css:137–142`.
  After a 480ms complete-logo hold, the red sheet with its beige mark recedes
  upward, revealing a perfectly registered red mark on beige underneath.
- After the wipe, the supplied eyes open from closed over approximately 206ms, looking left. Eye outlines stay fixed; only the two
  original pupil paths move horizontally inside them. The first landing blink is removed: the eyes stay open,
  glance right over 123ms, hold, then return left over 123ms.
  Two quick blinks finish the sequence. Pupils travel 12 logo units between right and left;
  the complete eye beat lasts 1439ms and scales with the timing control.
  Hold with open eyes looking left on the red logo/beige ground.
- “A DESIGN HOUSE” slides down from a masked layer behind the logo over 445ms,
  starting exactly when the upward wipe crosses the logo’s bottom edge, using
  `cubic-bezier(.2,.8,.2,1)`.
  It reuses SC Walla Bold, the website's fitted glyph spacing, dark-brown ink,
  the website’s literal 12px layout gap (previously scaled to 36px), and a
  0.16×logo-width caption slot. Glyph geometry remains scaled to the 720px mark. The caption retains its position relative to the logo; the whole composition recenters vertically.
  `caption-reference.json` records measured website layout; `build-caption.py`
  extracts the purchased font's exact outlines into `caption.svg` for identical
  browser/offline rendering without font substitution. Rebuild with Python
  FontTools and Node's built-in Brotli decoder if the source caption changes.
- Loop: after the beige hold, a 754ms red sheet descends from top to bottom
  with the same wipe easing. The red sheet erases the mark precisely as it crosses it; the logo is no
  longer inverted to beige on the returning sheet. The caption’s 343ms slide upward ends exactly when the returning wipe
  crosses the logo’s bottom edge. Its inverted beige layer follows the same motion.
  Both cues are calculated from logo geometry and the wipe easing, so changing
  wipe duration keeps them aligned. Long exits are fitted inside the return wipe.
  Travel uses the actual glyph bounds so visible entry/exit meets the mask edge.
  Exit uses `cubic-bezier(.7,0,.85,.55)` to accelerate into that edge, keeping
  text visibly moving through the final frames instead of disappearing during
  a long ease-out tail. The logo and caption finish disappearing together at the logo-bottom crossing.
  The eyes sit above the wipe and remain visible after the logo disappears.
  Once the wipe fills the canvas, a 1274ms eye-only beat lets them glance
  right, look back left, pause briefly, then close over the final 274ms, followed by the
  existing 100ms empty-red loop hold. The same supplied eye artwork is used
  throughout, with no position jump or new facial details.
  The final exported frame is pixel-identical to the first; there is no hard reset.
  `returnWipe`, `captionOut`, `reset`, and `loopHold` are separately adjustable.
- No opacity fade, distortion, extra effects or audio.

## Timing and export

The six-second master preserves the previous entrance and wipe timing and adds one second for the final eye-only glance and return before closing.
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
16Mbps target on macOS, network-optimized MP4. Current sequence: exactly 6 seconds,
360 frames. Suitable as
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

## Instagram Reels · native 9:16

Preview: http://localhost:4173/_experiments/logo-intro/?format=reels
The format link switches between square and vertical previews. Both use the same
renderer, timing JSON, source SVGs and caption outlines. `formats` in
`animation.mjs` defines the canvas dimensions; `renderSVG` accepts a format as its
fourth argument, defaulting to square.

The Reel is 1080 × 1920. The logo stays 720px wide (the same two-thirds of canvas
width as the square), with 420px more space above and below. Logo and caption
recenter together using the existing movement. The backgrounds and wipe clipping
are rendered at the full native height. All phase durations and curves remain those of the square master. The caption
exit cue follows the returning wipe’s logo-bottom crossing in each format so
the logo and caption finish disappearing together at either canvas height. The aspect-ratio adaptation itself leaves the square render unchanged; subsequent motion refinements are shared by both formats.

```sh
node _experiments/logo-intro/export.mjs --format=reels
# Optional custom timing:
node _experiments/logo-intro/export.mjs /absolute/path/to/timing.json --format=reels
```

Output: `exports/2d1-intro-reels-1080x1920.mp4`, with separate
`poster-reels.png` and `export-settings-reels.json`. H.264 High, 24Mbps target on
macOS, Rec.709, 60fps, exactly 6 seconds / 360 frames, silent and optimized for
progressive playback. The FFmpeg fallback uses yuv420p and faststart. The square
export remains the default and is never overwritten by the Reels command.

## Character motion review · 25 October

The version before character gestures is preserved in
`versions/pre-character-motion/`: renderer, timing, square MP4 and Reels MP4.
The current six-second masters share the added construction gestures; all
caption, eye and wipe choreography after the opening hold is unchanged.
