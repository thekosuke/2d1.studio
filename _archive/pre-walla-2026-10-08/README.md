# 2D1 — Familiar Characters

An independent design studio working with founders, small teams, and independent businesses on branding and digital products. Familiar Characters is the editorial side: a point of view on everyday design, starting with writing and potentially growing into curation and a select shop later.

## Preview

Run `python3 scripts/preview.py`, then open http://localhost:4173. The server sends a noindex header. Nothing is deployed or committed automatically.

## Current iteration — 7 October 2026

The owner requested a fresh start: clarity, reduction with wit, a mobile-first editorial layout, black grid rules, white/grey ground, and much less red. Rand and Rand Mono remain. Their rough sketch sets the opening: red logo at top left, one black Contact us button at top right, and the existing About statement given room to breathe. The statement is preserved verbatim, including “with a shop of its own”, at the owner’s request; the business direction is still evolving.

The site has two pages:

- **Home**: compact three-part header (logo, unchanged introduction, Contact) → selected work → Studio description and services → Familiar Characters essay link → contained tote preview and waitlist → inline contact form.
- **About** (`/about/`): the existing placeholder essay and Continue reading fold, retained with the new shared header and footer. The owner will supply the final essay.

The three selected projects are Aviator, DeepDrip, and Supateam. Their existing images are preserved. Native `<details>` disclosures show the rest of each project’s images in place, with touch and keyboard access, including without JavaScript. The covers are square at every width, using the existing portrait crops so the identities remain visible. Each disclosure grows independently; neighbouring cards keep their own height.

The third round uses bold Rand for headings and project names, grey supporting copy, and stronger surface contrast. Desktop has an asymmetric three-part header; on phones the small introduction sits below the logo and Contact button. Selected work now precedes the Studio description and services. Existing introduction, Studio, editorial, contact, and About copy is unchanged.

The Familiar Characters feature is the sole homepage link to the existing About essay. The placeholder conveyor has been removed and preserved in the previous-round archive. In its place, Character 01 is introduced as **Coming soon**, with the original 3D tote in a compact grey panel and a **Join the waitlist** form. This is an expression of interest, not a preorder or payment flow. The owner explicitly chose to keep it unconnected for this design round.

No newsletter, full-page shop story, signup overlay, or contact dialog is active. Section rules meet without spacer bands. The header scrolls with the page.

## Files

- `index.html`: home markup and inline contact form.
- `css/editorial.css`: new shared, mobile-first design system and home layout. One red: `#FF2B00`; square controls; 1px ink rules.
- `js/site.js`: clean in-page navigation, focus, cross-page hash removal, year, and production-only analytics.
- `js/contact-inline.js`: native validation, field micro-interactions, and truthful, endpoint-aware contact submission.
- `js/tote-preview.js`: lazy-loads the original model near the viewport, retaining the poster on failure or reduced motion.
- `js/tote.js`: original model, with a new contained presentation option; the archived story behavior remains available.
- `js/waitlist.js`: preview-only validation and a truthful unconnected notice. It sends and stores nothing.
- `js/conveyor.js` and `img/characters/`: preserved but inactive.
- `about/index.html`, `css/about.css`, `js/about.js`: preserved essay and disclosure.
- `js/config.js`: public endpoints, still empty. No provider or backend was connected.
- `server/contact-worker.js`, `docs/CONTACT.md`: existing optional backend and contract.

The old `css/style.css`, `js/script.js`, `js/bar.js`, and `js/contact.js` remain on disk but are not loaded by either active page. Three.js 0.170.0 and its original addons are loaded from jsDelivr only when the tote approaches the viewport. The original poster remains available with no JavaScript, reduced motion, or a failed WebGL/CDN load.

## Contact

The form is a single column aligned toward the left, with bold labels, pale grey boxed fields, clear focus outlines, and a solid Icon Red submit button, with name, email, optional company, category, and message. A small square appears beside the active field and settles to black when it contains text; it indicates content, not validation. The textarea grows while typing. Before an endpoint is connected, an upfront notice says nothing is sent or saved and links to the existing Notion contact form. Submitting repeats that notice; it never reports false success. Without JavaScript, fields and submit stay disabled and the Notion link works. No browser storage is used.

If configured later, the client uses the existing JSON contract, native required/email validation, a 15-second timeout, duplicate-submit protection, and only reports success after `{ "status": "received" }`. Configuration and deployment require a separate request.

## Waitlist

The owner chose an unconnected preview. Native email validation runs, but submitting only explains that nothing was sent or saved. Without JavaScript the input and button remain disabled beside the same notice. No endpoint, provider, preorder, or payment connection was added. A dedicated waitlist connection is required before collecting demand; the legacy newsletter configuration is not reused implicitly.

## Motion and accessibility

Native scrolling, visible keyboard focus, semantic headings, labelled controls, image alt text, and native project disclosures. Reduced motion disables CSS transitions and smooth scrolling. The About fold also respects reduced motion. The contained tote gently turns and tilts with a fine pointer inside its panel and can be dragged horizontally; vertical swipes retain native scrolling. It has no scroll-driven camera sequence, automatic spin, or blinking eyes. Rendering settles when idle and pauses offscreen or in a hidden tab. Reduced motion uses the still poster. Non-JavaScript navigation falls back to standard anchors.

## Preservation

`_archive/pre-editorial-2026-10-07/` contains the previous home, About, CSS, JavaScript, README, and working agreement as a source snapshot. Assets remain in their original folders; the archive is for restoration, not a standalone preview. The older `_archive/familiar-characters/` remains intact. `_archive/editorial-round-1-2026-10-07/` preserves the first editorial layout before the asymmetric revision. `_archive/editorial-round-2-2026-10-07/` preserves the conveyor iteration and original tote module before this round. Jekyll excludes underscore-prefixed folders.

The working branch is `site-redesign`. See [the collaboration handoff](docs/HANDOFF.md) for setup, the Figma frames, and the next step. The owner authorized committing and pushing this checkpoint; deployment, DNS, and remote changes remain outside this request.
