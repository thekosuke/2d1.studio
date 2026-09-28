# 2D1 — Familiar Characters

A one-page introduction to 2D1: a boutique design studio, and a shop for the everyday objects it makes itself. Plain HTML, CSS, and JavaScript; no build step, no dependencies.

## Preview

From the `2d1.studio` folder, run `python3 scripts/preview.py`, then open http://localhost:4173. The preview sends a noindex header and does not load analytics.

## Direction

One continuous sheet, designed phone-first, with room to breathe. The logo is the only heavy, bold mark on the page. Each section opens with a red square index tag (like the tote's), a large title in Rand Regular, and a few lines set in the same large reading voice as the About statement (`.big-text`). Small Rand and Rand Mono carry everything else. Lines appear only where they describe a real module (the cases, the capabilities). Wit lives in the copy and in one or two objects, in the manner of Craighill.

- **Get updates / Get notified** — skip the long scroll (and the Shop story): the red of the bar wipes down over the page with “03 Updates”, the page jumps behind it, the wipe lifts to reveal the signup, and the email field is focused. With reduced motion it jumps directly.
- **Hero** — red, 90% of the viewport; the caption (“An independent design studio and shop / making familiar things with character.”) sits directly under the logo; the logo docks into the fixed bar as the home link. Its eyes (two small square pixels in the D) are closed by default and open for a moment every few seconds to glance around; off with reduced motion.
- **About** — “2D1 is an independent design studio with a shop of its own…” — inks in, word by word, as you read. A red square steps out of the hero, like the tag steps out of the tote.
- **Studio** — a pinned reel, like the Shop's stage but travelling sideways: vertical scroll moves it 1:1. Panels: “Clear ideas, with character.” (intro), three square project “characters” each with the tote's red tag (Aviator 01, DeepDrip 02, Supateam 03), and What we do (three services with square-only glyphs) ending in the Contact form button. The panel in the middle is full size, the others step back; scrolling across a project steps through its images (push from the right going forward, from the left going back); click, tap, Enter, or Space also steps. Keyboard focus scrolls the focused project to the middle. Five ticks beside “01 Studio” show where you are. With reduced motion or without JS the reel stacks vertically.
- **Shop** — on soft beige (the brand #FAF0E6, with a lighter glow behind the tote), a pinned scroll story (560svh) instead of a heading and description: 1 “Meet Character 01.” as the bag rises in, 2 logo (“Stitched, not printed.”), 3 tag, 4 canvas, 5 inside (the x-ray switches on by itself), 6 finale with the name, status and Get notified, where the dots become yours to hover and click. Each chapter turns and frames the bag and draws its blueprint callout; six ticks beside the “02 Shop” tag, top left, show where you are.
- **Updates + footer** — “Stay in the know. / New work and objects, every now and then.”, then the email field and button on their own line with room above, then the page's connecting sentence as a large closing line that inks in: “In the work we do for others, and the things we make for you.” Signup micro-interactions as before. The footer holds © 2D1, “Familiar Characters.”, and original 9×9 pixel icons (one-pixel strokes, to sit with Rand Mono).

One red only: Icon Red #FF2B00, for UI, type, and the tote's tag and strap lining alike.

## Shop: the tote in 3D

`js/tote.js` builds the bag procedurally from the prototype drawing and mockup: black canvas body with a visually square front, soft panels and a rolled bottom, double topstitch at the hem, one long strap (black webbing outside, red inside) sewn to the side panels, the red square tag in the front-left seam, and the logo (5.6 cm wide, kept subtle) embroidered in dark grey thread at the top right of the face, under the hem stitching, with two square eyes in the D that are closed by default and peek open for a moment every few seconds, like the logo in the bar. `img/brand/logo_eyes.svg` has no eye shapes yet, so the eyes are drawn in `js/tote.js` (`LOGO_EYES`); replace them with the final artwork when it's exported. Materials are physically based: a procedurally generated plain-weave canvas (7 threads/cm, per-yarn tone and slubs, 2-ply twist) layered on every fabric surface at real scale, plus the folded, topstitched hem, seam puckers, creases, wear on the edges, and a little lint. The strap is canvas with rolled, stitched edges. The embroidery is real raised geometry (fill stitches at 45°, a slightly glossier thread with an anisotropic highlight, a contact shadow and pucker in the canvas), tessellated so it follows the bag's curves.

- The stage stays pinned while you scroll 250svh; scrolling turns the bag one full revolution, and the strap lags and settles like fabric. Drag turns it too (horizontal only; vertical swipes still scroll).
- The bag tilts toward a fine pointer anywhere over the stage (mostly vertically, with a little turn).
- Hotspots follow the bag and hide when their side turns away. In the finale, hover, keyboard focus, or a tap draws a red dashed leader (ending in a tick, the label 12px clear with its title on the rule) to a spec-sheet label in Rand Mono. The close-ups themselves happen through the scroll story; there is no click-to-zoom.
- **X-ray**: opening “Inside” (hover, tap, or Enter; Escape or tapping elsewhere closes it) darkens the set and cross-fades the bag into a see-through shell with glowing edges. The red tag stays red. Dashed stitching marks the two inside pockets from the drawing: a band as wide as the strap, sewn inside the front, wraps a slim bottle (two-thirds full); pocket ① (flat and square) is on the inside of the back wall, away from the logo, and holds an AirPods case, with both earbuds visible through it, and a ring of keys. Metal reads brightest, as on a real x-ray. The small items are drawn about 20% larger than life so they read on phones.
- Three.js 0.170.0 is loaded from jsDelivr through the import map in `index.html`, only when the Shop comes near. Everything else stays dependency-free. For production you may prefer to vendor `three.module.min.js` and the two addons locally and point the import map at them.
- `img/shop/tote-poster.webp` is rendered from the same scene (`stage.tote.snapshot(1200, 1818)`) and shows before WebGL starts, if it fails, or without JavaScript. It uses the same 0.66 framing box as the live camera, so the hand-off doesn't jump.
- With reduced motion the stage isn't pinned and the bag rests at its three-quarter view; drag still works.
- Only what the drawing states is described (canvas, tag, embroidery, long strap, pockets inside). No dimensions, price, or date are shown.

## Project viewers

- Aviator: 02, 03, 04, 05. DeepDrip: 06, 07, 08. Supateam: 09, 10, 11, 12.
- Tiles use art-directed 3:4 variants (`NN-p600.webp`, `NN-p1200.webp`) from `scripts/portrait_crops.py`. The original 16:9 files are kept.
- Each viewer is a button, not a link. A resting mouse pushes the next image in from the edge it entered every 1.5 s; click, tap, Enter, and Space step once. Images are decoded before they move. With reduced motion, images swap instantly and never cycle.

## Scroll motion

- Logo dock (`placeLogo()`), reading ink on the About statement, and the tote's turn. Scrolling is always native.

## Code

- `css/style.css` — tokens at the top; sections in page order; the grid switches from 4 to 12 columns at 900px; the cases and capabilities go to one row at 700px.
- `js/script.js` — newsletter form, project viewers, logo dock, reading ink, signup micro-interactions, tote loader, hotspots, production-only analytics.
- `js/tote.js` — the 3D tote (ES module, lazy-loaded).
- `js/config.js` — public newsletter endpoint (empty until a provider is connected).
- Checked at 390, 768, 1082, and 1440px wide, with touch emulation, keyboard, and reduced motion.

## Contact form

“Contact form” opens a native overlay (a `<dialog>`) with the Notion form's questions: Full name, Email, Company (optional), Category (New Business / Media Inquiry / Other), Message. The red wipes down, the sheet rises, and a pair of pixel eyes opens: they look at the field you're in and follow your typing, squint at a mistake, look up while sending, and hop when it's done. Submissions go to the Notion **Form Submissions** database through a small endpoint: see [docs/CONTACT.md](docs/CONTACT.md) and `server/contact-worker.js`. Until `contactEndpoint` is set in `js/config.js`, nothing is sent and the form says so, linking to the Notion form. Without JavaScript the button opens the Notion form.

## Social links

Footer app icons, edited in the `.apps` list in `index.html`:

- Instagram: https://www.instagram.com/2d1.studio/
- Threads: https://www.threads.com/@2d1.studio
- X: https://x.com/2d1_studio
- LinkedIn: https://www.linkedin.com/company/newfiction-org/ (New Fiction, for now; its label says so. Replace when 2D1 has a page.)

## Newsletter

The frontend is complete but no provider is connected. See [connection instructions](docs/NEWSLETTER.md). Until an endpoint is configured, submitting shows a neutral notice that signup isn't open and that the email wasn't saved. Nothing is stored locally. Provider credentials must stay server-side.

## Domain and launch

Canonical URLs, sharing metadata (`img/brand/2d1-social.png`), `CNAME`, robots, and sitemap target `https://2d1.studio/`. The local folder is named `2d1.studio`; the GitHub remote keeps its existing `newfiction-web` URL. No remote rename, push, DNS change, or deployment has been done.

Before launch: connect the newsletter; point the GoDaddy domain at the hosting provider; confirm HTTPS and the preferred www redirect. The `CNAME` file alone does not connect the domain. The existing Google Analytics property loads only on `2d1.studio` or `www.2d1.studio`; review its settings at launch.
