# 2D1 — Familiar Characters

An independent design studio working with founders, small teams, and independent businesses on branding and digital products. Familiar Characters is the editorial side: a point of view on everyday design, starting with writing and potentially growing into curation and a select shop later.

## Preview

Run `python3 scripts/preview.py`, then open http://localhost:4173. The server sends a noindex header. Nothing is deployed or committed automatically.

## Current iteration — 7 October 2026

The owner requested a fresh start: clarity, reduction with wit, a mobile-first editorial layout, black grid rules, white/grey ground, and much less red. Rand and Rand Mono remain. Their rough sketch sets the opening: red logo at top left, one black Contact us button at top right, and the existing About statement given room to breathe. The statement is preserved verbatim, including “with a shop of its own”, at the owner’s request; the business direction is still evolving.

The site has two pages:

- **Home**: introduction → Studio and two service categories → selected work in a ruled grid → Familiar Characters editorial feature → inline contact form.
- **About** (`/about/`): the existing placeholder essay and Continue reading fold, retained with the new shared header and footer. The owner will supply the final essay.

The three selected projects are Aviator, DeepDrip, and Supateam. Their existing images are preserved. Native `<details>` disclosures show the rest of each project’s images in place, with touch and keyboard access, including without JavaScript. The covers are square at every width, using the existing portrait crops so the identities remain visible. Each disclosure grows independently; neighbouring cards keep their own height.

The opening is shorter, with smaller type and no duplicate About link. Studio is one grouped block aligned toward the left. Familiar Characters has a single text column offset farther right and a full-width conveyor of six placeholder object illustrations, followed directly by Contact. Section rules meet without spacer bands.

The Familiar Characters feature is the sole homepage link to the existing About essay. There is no product catalogue, shop, tote introduction, newsletter, signup CTA, scroll story, or contact dialog in the active pages. Contact us is the sole primary CTA; About and essay links are secondary navigation. The header scrolls with the page.

## Files

- `index.html`: home markup and inline contact form.
- `css/editorial.css`: new shared, mobile-first design system and home layout. One red: `#FF2B00`; square controls; 1px ink rules.
- `js/site.js`: clean in-page navigation, focus, cross-page hash removal, year, and production-only analytics.
- `js/contact-inline.js`: native validation, field micro-interactions, and truthful, endpoint-aware contact submission.
- `js/conveyor.js`: optional, pausable horizontal motion for Familiar Characters.
- `img/characters/`: six existing placeholder illustrations copied from the archived Familiar Characters project; these are layout studies, not published product selections.
- `about/index.html`, `css/about.css`, `js/about.js`: preserved essay and disclosure.
- `js/config.js`: public endpoints, still empty. No provider or backend was connected.
- `server/contact-worker.js`, `docs/CONTACT.md`: existing optional backend and contract.

The old `css/style.css`, `js/script.js`, `js/bar.js`, `js/contact.js`, and `js/tote.js` remain on disk but are not loaded by either active page. No Three.js or other remote runtime is loaded by the new design.

## Contact

The form is a single column aligned toward the left, with name, email, optional company, category, and message. A small square appears beside the active field and settles to black when it contains text; it indicates content, not validation. The textarea grows while typing. Before an endpoint is connected, an upfront notice says nothing is sent or saved and links to the existing Notion contact form. Submitting repeats that notice; it never reports false success. Without JavaScript, fields and submit stay disabled and the Notion link works. No browser storage is used.

If configured later, the client uses the existing JSON contract, native required/email validation, a 15-second timeout, duplicate-submit protection, and only reports success after `{ "status": "received" }`. Configuration and deployment require a separate request.

## Motion and accessibility

Native scrolling, visible keyboard focus, semantic headings, labelled controls, image alt text, and native project disclosures. Reduced motion disables CSS transitions and smooth scrolling. The About fold also respects reduced motion. The object conveyor moves at 26 pixels per second only while visible. Pause/Resume is persistent; hover and keyboard focus hold motion, and touch/manual wheel interaction pauses it until resumed. Reduced motion disables autoplay and removes duplicates; without JavaScript the original six images are a native horizontal scroller. Duplicates are hidden from assistive technology. There are no animated eyes, wipes, or scroll-driven effects on the home page. Non-JavaScript navigation falls back to standard anchors.

## Preservation

`_archive/pre-editorial-2026-10-07/` contains the previous home, About, CSS, JavaScript, README, and working agreement as a source snapshot. Assets remain in their original folders; the archive is for restoration, not a standalone preview. The older `_archive/familiar-characters/` remains intact. `_archive/editorial-round-1-2026-10-07/` preserves the first editorial layout before the asymmetric revision. Jekyll excludes underscore-prefixed folders.

No commits, pushes, deployment, DNS changes, or remote changes have been made. The branch remains `site-redesign`.
