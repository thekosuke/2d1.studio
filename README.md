# 2D1 — Familiar Characters

An introduction to 2D1, an independent design studio with a shop for the everyday objects it makes itself: the home page and an About page with the essay. Plain HTML, CSS, and JavaScript; no build step.

## Preview

From the `2d1.studio` folder, run `python3 scripts/preview.py`, then open http://localhost:4173. The preview sends a noindex header and does not load analytics.

## Direction

One continuous sheet, designed phone-first, with room to breathe. The logo is the only heavy, bold mark on the page. Each section opens with a red square index tag (like the tote's), a large title in Rand Regular, and a few lines set in the same large reading voice as the About statement (`.big-text`). Small Rand and Rand Mono carry everything else. Lines appear only where they describe a real module (the cases, the capabilities). Wit lives in the copy and in one or two objects, in the manner of Craighill.

- **Get updates / Get notified** — skip the long scroll (and the Shop story): the red of the bar wipes down over the page with “03 Updates”, the page jumps behind it, the wipe lifts to reveal the signup, and the email field is focused. With reduced motion it jumps directly.
- **Hero** — red, 90% of the viewport; the caption (“An independent design studio and shop / making familiar things with character.”) sits directly under the logo; the logo docks into the fixed bar; clicking it (large or docked) scrolls to the top of About. Its eyes (two small square pixels in the D) are closed by default and open for a moment every few seconds to glance around; off with reduced motion.
- **About** — “2D1 is an independent design studio with a shop of its own…” — inks in, word by word, as you read. A red square steps out of the hero, like the tag steps out of the tote.
- **Studio** — contained, so the overview fits in one view, held together by space alone (no rules), like the rest of the site. One cell holds the “01 Studio” tag and the line (“Clear ideas, with character.”, on one line on wide screens) with its sub; the next (from the 8th column) holds What we do, a quiet two-column list (the service, its one line in grey, light hairlines between), its label level with the tag and the list settled to the bottom, level with the sub, with air in between. Below, the work, from column 1 and bleeding off the right edge: one card per project at the images' own 16:9 (the 3:4 crops on phones), each captioned only with its kind of work, looping without end (copies of the three cards on either side; when the scroll rests on a copy it jumps invisibly to the real one). It plays by itself: each card steps through its images, then the next slides in. Pointing at the work or tabbing into it holds it; it doesn't run off screen, in a hidden tab, or with reduced motion. Over the card in front the cursor is a left–right arrow: moving across it flips through its images like a flipbook. A click on any card slides the carousel on (the one in front to the next project, a peeking one to itself); swipe or scroll sideways too. Get in touch: “Say hello” (opens the contact form) sits level with the tag on wide screens and under the sub on phones. Cards size themselves so the section fits the screen. The earlier full-screen layered slides are parked in a `<template id="studio-slides">` in `index.html`; their CSS and JS are still in place, unused.
- **Shop** — on soft beige (the brand #FAF0E6, with a lighter glow behind the tote), a pinned scroll story (560svh) instead of a heading and description: 1 “Meet Character 01.” as the bag rises in, 2 logo (“Stitched, not printed.”), 3 tag, 4 canvas, 5 inside (the x-ray switches on by itself), 6 finale with the name, status and Get notified, where the dots become yours to hover and click. Each chapter turns and frames the bag and draws its blueprint callout; a vertical indicator on the right shows where you are: chapters are small squares, and the current one stretches into a tall bar that fills red as you scroll through it (after Apple TV's carousel indicator).
- **Updates + footer** — “Stay in the know. / New work and objects, every now and then.”, then the email field and button on their own line with room above, then the page's connecting sentence as a large closing line that inks in: “In the work we do for others, and the things we make for you.” Signup micro-interactions as before. The footer holds © 2D1, “Familiar Characters.”, a Contact us button, and original 9×9 pixel icons (one-pixel strokes, to sit with Rand Mono).

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

## Project images

- Aviator: 02, 03, 04, 05. DeepDrip: 06, 07, 08. Supateam: 09, 10, 11, 12.
- Phones get art-directed 3:4 variants (`NN-p600.webp`, `NN-p1200.webp`) from `scripts/portrait_crops.py`. The original 16:9 files are kept.
- A card's first image loads with the page (lazily); the rest load as the carousel comes near, and before they show.

## Spacing

- Horizontal: the 12-column grid with `--pad` margins (12px, 16px from 900px). Section tags, titles, the bar, and the footer start on column 1; statements (About, the madlib, the closing line) on column 2; What we do on column 8; the About essay on column 4.
- Vertical: `--space` between sections, `--space-in` within one (and above the footer), `--gap` from a tag or label to what it introduces.

## Scroll motion

- Logo dock (`placeLogo()`), reading ink on the About statement, and the tote's turn. Scrolling is always native.

## Code

- `css/style.css` — tokens at the top; sections in page order; the grid switches from 4 to 12 columns at 900px; the cases and capabilities go to one row at 700px.
- `js/script.js` — newsletter form, the Studio carousel (and the parked slide viewers), logo dock, reading ink, signup micro-interactions, tote loader, hotspots, production-only analytics.
- `js/tote.js` — the 3D tote (ES module, lazy-loaded).
- `js/config.js` — public newsletter and contact endpoints (empty until connected).
- `js/bar.js` — the bar on every page: the phone menu, the inner pages' logo, and clean addresses on arrival at a home section.
- `js/contact.js` — the contact dialog, on every page (it adds the dialog itself).
- `about/index.html`, `css/about.css`, `js/about.js` — the About page. The footer is repeated there from `index.html`; edit both.
- Checked at 390, 768, 1082, and 1440px wide, with touch emulation, keyboard, reduced motion, and without JavaScript.

## Contact form

“Contact us”, in the bar and the footer on every page, opens a native overlay (a `<dialog>`) with the Notion form's questions: Full name, Email, Company (optional), Category (New Business / Media Inquiry / Other), Message. The red wipes down, the sheet rises, and a pair of pixel eyes opens: they look at the field you're in and follow your typing, squint at a mistake, look up while sending, and hop when it's done. Submissions go to the Notion **Form Submissions** database through a small endpoint: see [docs/CONTACT.md](docs/CONTACT.md) and `server/contact-worker.js`. Until `contactEndpoint` is set in `js/config.js`, nothing is sent and the form says so, linking to the Notion form. Without JavaScript the buttons open the Notion form. In the bar, Contact us is solid and Get updates is drawn in outline; on phones Get updates moves into the Menu and Contact us stays in the bar.

## About

`/about/`: an article page for the essay (placeholder text for now: replace the title, subtitle, and paragraphs in `about/index.html`).

- The kicker, the title, the subtitle, and the first paragraph (the short version of About us, in larger type) are always shown. The essay follows, folded: a few lines fade to nothing and the page ends with the footer, so it stays short unless you want the long version.
- Clicking the fading lines (or Tab to them and Enter) unfolds the essay in place; the fade lifts a little when you point at it. No Read more button. Screen readers get the whole essay either way, and without JavaScript it's all there.
- One column on the 4th of 12 columns (the hero's first quarter line), header and essay on the same left edge; “Continue reading ↓” under the fade says it opens; subheads, a pull quote with its phrase in red, and the red square as the last full stop.
- The first paragraph is `.essay-lede`; everything in `.essay-rest` is folded. How much shows while folded is `--fold` in `css/about.css`.

The Familiar Characters page is gone from the site. Its source (the generator, the content, the House) is parked in `_archive/familiar-characters/`, which isn't published; see its README to restore it, or delete the folder.

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
