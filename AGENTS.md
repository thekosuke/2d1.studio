# AGENTS.md — 2D1 website: handoff and working agreement

This file is the full context for any agent continuing work on this site. It
was written at the end of a long series of design-review rounds with the
owner (Kosuke) so the work can continue without losing decisions, taste, or
constraints. Read all of it before changing anything. `README.md` describes
the current site in detail; this file explains how to work on it and why it
is the way it is.

---

## Current direction — 9 October, Figma 298:650 (supersedes history below)

Implement the owner’s updated single-column Figma frame 298:650. Home now contains Hero, intro, Studio, Shop, Connect and footer. Community, Relationship Advice and the profile dialog are removed at the owner’s explicit request. Preserve their previous source in `_archive/pre-cover-2026-10-09/`; do not load `js/profile.js` on the active pages. The remaining transparent page anchors keep their active states and 480ms entrance/exit animation. At desktop widths of 1100px and up, page anchors are a vertical list at the left again. Phone/tablet anchors remain inline around the centered docked logo. About and Found in the Wild follow the anchors below a divider, followed by another divider and Contact opening the existing form: vertical on desktop, a second inline row on phone/tablet. About has the same nav with home-section destinations and current-page semantics. These links replace the footer page links. Shop’s gallery CTA is Found in the Wild; the page name remains Objects. On Home, the EN/JA toggle is hidden and inert throughout the landing and hero, then appears at exactly the same threshold as the anchors, fading and sliding in from the right (opposite the anchors), reversing on return. Reduced motion is instant; About keeps its toggle visible; no-JS Home keeps the links at the page end.

Use the local Walla fonts. Desktop typography is 64px Bold section headings and 40px/48px Medium descriptions, subtitles, services and CTAs. Subtitles/details and supporting text share Sub Gray #807573 (`--sub-gray`); the former Subtitle Gray and Supporting Gray are merged. Phones use 44px headings and 28px/1.2 reading type. The shared column caps at 960px with a 128px desktop right gutter; phones/tablets use 24px side insets. Section padding is 128px desktop / 80px phone, main content gaps 96px / 64px. Studio’s opening gap is 64px desktop / 48px phone. Studio’s artwork strip supports direct horizontal touch/pen dragging with native vertical scrolling, wraparound and autoplay resuming on release; reduced motion keeps bounded manual browsing. Studio uses “Clear ideas, with character.” and the owner’s three-paragraph description, starting “At our core, we’re a design studio.” Keep its first paragraph above the full-width moving strip of 280px square artwork and the remaining two below. Services are stacked name/detail pairs, bounded above and below by 1px dark-brown rules with 32px padding. Brand Design details are “Art Direction, Graphic Design, Visual Identity”. Get in touch remains at the end. Intro has only More about us. The Shop’s opening paragraph precedes the live tote (4:3 transparent stage); the remaining two paragraphs follow it, then the specification list and notification CTA. Specifications follow the new Figma text (provisional 40 × 36 × 10 cm and magnetic opening); the procedural tote is unchanged. Connect has its new subtitle and a 40px email field at every width in both languages. No new decorative elements.

Hero fills the viewport including a 20px Icon Red border. The landing sequence shows the beige logo with blinking supplied pixel eyes on red, then wipes the red layer upward. Scrolling or keyboard navigation skips it; reduced motion and no-JS show the settled hero immediately. Hero then slides upward at native scroll speed while main content emerges underneath at 70% speed, returning to normal flow after the hero clears. On phones below 768px, adjust the main-content starting offset so the first intro line emerges after 25% less scroll distance; preserve desktop motion. Keep the intro low enough for the word-by-word ink reveal. The logo still docks without a background, and its uppercase caption scales and fades. Studio smoothly shifts the page ground from beige #FAF0E6 to Sand Gray #D6CEC5 on entry and back to beige on exit; reduced motion uses discrete changes, no-JS gives Studio a static gray ground. About keeps the existing essay fold and no hero. Read README for the current implementation.

Primary ink is now dark brown #320505 across active Home, About and dialogs, including text, rules, social icons, control fills, input carets and the 40% scrim. Keep muted supporting grays and original artwork/product colors. Connect has no initial or focus-triggered unconnected footnote; on attempted submission, explain truthfully that nothing was sent or saved. No-JS submission remains disabled.

Language support: English is the default. The fixed EN / JA links switch between `/` and `/ja/`, or `/about/` and `/ja/about/`, without JavaScript or stored preferences. Japanese uses self-hosted, OFL-licensed Noto Sans JP; English retains Walla. Edit English sources and `locales/ja.json`, then run `python3 scripts/build-japanese.py` to regenerate Japanese HTML and the dynamic translation dictionary. Preserve both languages when editing copy or UI.

Brand assets: use the owner’s updated 829 × 280 logo variants in `img/brand/logo_{red,black,white,brown}.svg`. The site uses the red mark; icons and social cards use Icon Red on soft beige. Keep the eye-overlay viewBox, logo-slot ratio and tote embroidery in sync with that geometry. Previous brand files are in `_archive/pre-logo-2026-10-08/`.

Active styling is now `css/walla.css`, plus `css/fonts.css` and `css/about.css`. Behavior is in `js/walla.js`, `js/site.js`, `js/about.js`, `js/tote-preview.js`, and `js/tote.js`. The previous iteration is preserved in `_archive/pre-walla-2026-10-08/`. Read README for details. The Connect field is unconnected: never claim data was sent or saved. Get in touch opens a floating white form card on the right (Notion remains its no-JS fallback). The contact form uses half the available width on desktop and the available width below 768px, with 12–24px outer margins and safe-area insets. Use a separate 40% dark-brown overlay; never shift the page or change its opacity. Animate the card and overlay together over 720ms. Shared lifecycle is in js/drawers.js; focus the heading on opening to avoid a mobile keyboard jump. Dialog fields are white; Connect’s field is transparent. Field focus uses an underline instead of an outline. Connect has a transparent large-type email field with a gray bold placeholder and red focus underline, followed by Sign up →; the tote CTA is Notify me when it’s out. The tote follows full-screen mouse position, bounded at ±135°, with the right side revealed at the left screen edge and the left side at the right edge. The Shop render sits between the first and second description paragraphs, with the product specification list after the remaining copy; specifications are provisional and follow the updated Figma frame. Its logo is centered near the top of the back; the front has subtle charcoal pixel eyes that reveal with angle. The tote keeps its mouse-position mapping; on touch/pen the full presentation stage (including space around the bag) supports horizontal finger dragging (8px direction threshold, ±135° stops, no momentum), while vertical swipes retain native page scrolling. Preserve hover X-ray, touch tap, and keyboard access. Icon Red, square UI, accessibility, reduced motion, and clean hashes still apply. The owner requested a new GitHub synchronization checkpoint for the mobile refinements on 9 October; see docs/HANDOFF.md. Production deployment and merging remain outside that request.

---

## Objects addition — 9 October

The owner requested a new Objects gallery, distinct from the archived Familiar Characters implementation. Preserve `/objects/` and `/ja/objects/`, the infinite draggable canvas, category/tag filters, list/no-JavaScript fallback, source-credited product imagery and accessible product dialogs. Its ten selections are explicitly placeholders. Read README and docs/OBJECTS-SOURCES.md. Objects now uses an immersive full-viewport canvas with floating controls and a zoom slider whose maximum enters a single-product horizontal carousel. Preserve its list fallback, info popup and accessible zoom/slide states. The user explicitly approved anonymous shared Purchased counts in the private preview: Worker + D1, reversible per-browser marks, no login or personal identity storage. Contact/signup remain unconnected. See docs/PURCHASED-BACKEND.md. Public hosting and image-usage clearance are outside the private preview request.

## 1. Your role

Act as a senior brand designer, art director, and design engineer for 2D1.
The owner gives prescriptive visual feedback in short bullet rounds, often
with screenshots of the live site or references. Your job is to translate
that feedback into polished, production-quality changes, verify them
visually, and report back plainly. Use judgement: when a request is broad
("polish it", "make it better"), propose a direction, ask a few focused
questions if the answer changes the structure, then build and edit down.

## 2. The brand

- **2D1**: an independent design studio with a shop of its own. For
  companies: design consulting, digital product design, branding & visual
  identity. For everyone else: everyday objects under its own name (the first
  is a tote bag, "Character 01").
- **Concept: Familiar Characters.** Character creates the connection;
  familiarity gives it meaning. "Objects become meaningful because life
  happens around them." The brand universe is "the House of Familiar Things".
- **Creative direction: "Industrial Playground: Reductionist with Wit."**
  Edit until the idea is clear, then keep the one detail that makes you
  smile. Personality: opinionated, restrained, witty, approachable, familiar,
  fun, simple, geometric, elementary, rational, asymmetric, clear
  construction.
- **Brand book**: `/Users/kosuke/Desktop/2D1/Brand/Brand Book/2D1 Brand Book.pdf`
  (too large to read whole; extract text with pypdf, render pages with sips).
- **Voice**: short, plain, warm, a little wry. No luxury or streetwear
  language, no hype, no scarcity, no cute copy for its own sake. Curly
  apostrophes in copy (’). Current key lines:
  - Hero: "An independent design studio and shop / making familiar things with character."
  - About statement: "2D1 is an independent design studio with a shop of its own. We work by editing until the idea is clear, then keeping *the one detail* that makes you smile."
  - Studio: "Clear ideas, with *character*." / "We help companies find a clear idea and give it character, from the first strategy to the products and brands people use every day."
  - Services: Design consulting (A fresh pair of eyes.) · Digital product design (Buttons that do what they say.) · Branding & visual identity (Faces for names.)
  - Shop: "Meet *Character 01*." … "Each one starts with a little character and hopes to become someone’s *favorite something*."
  - Updates: "Stay in the know. / New work and objects, every now and then."
  - Closing: "In the work we do *for others*, and the things we make *for you*."
  - Footer sign-off: "Familiar Characters." (red full stop)

## 3. Hard rules (non-negotiable)

1. **One red only: Icon Red `#FF2B00`** (`--red`). Never introduce another
   red/orange, even if a brief names one (a brief once said #FF4000; it was
   substituted and the owner was told).
2. **Nothing is round.** The visual identity is squares and pixels: square
   pixel eyes, square tags, square progress pips, no rounded corners, no
   circles in new UI (a few legacy tote hotspot dots are round; don't add more).
3. **No `#hash` in the address bar for in-page links.** Handle
   `a[href^="#"]` clicks with preventDefault + scrollIntoView + focus.
   Cross-page links like `../#updates` are fine: `js/bar.js` lands on the
   section and removes the hash with `history.replaceState`.
4. **Review-only engagement**: commit or push only when explicitly asked.
   The owner authorized committing and pushing the current checkpoint for
   collaboration with Saul; that is not standing approval for future pushes.
   Work on branch `site-redesign`. Never publish, deploy, change DNS, or
   rename the git remote without a separate request (it still points to
   `newfiction-web`). Leave tracked `.DS_Store` changes out of commits.
5. **Truthful forms**: the newsletter and contact form have no backend
   connected (`js/config.js` endpoints are empty). Never fake success, never
   store addresses locally, never expose keys, never connect a third-party
   service unless explicitly asked. The unconfigured state must say plainly
   that nothing was sent or saved.
6. **Keep code when asked to remove something the owner might revisit.**
   Precedents: the full-screen layered Studio slides are parked in a
   `<template id="studio-slides">` in `index.html` (their CSS/JS remain,
   dormant); the removed Familiar Characters page lives unpublished in
   `_archive/familiar-characters/`.
7. **Accessibility and motion**: semantic HTML, keyboard access, discernible
   `:focus-visible` through color/background, never outlines or focus-ring box shadows on links/buttons (owner direction, 9 October), alt text, and
   `prefers-reduced-motion` respected everywhere (autoplay off, eyes hidden,
   instant transitions). Everything must work without JavaScript.

## 4. Taste and preferences (learned over many rounds)

- **Calm, typographic, confident.** Negative space directs focus. One leading
  line per section; supporting type steps back (smaller, grey `--ink-soft`).
  The owner reacts badly to clutter, "amateur" detailing, and decorative UI.
- **Reduction from judgement, not emptiness.** Remove what doesn't earn its
  place (numbers, icons, labels, indicators) when asked; don't add chrome.
- **Cohesion over novelty.** New sections must feel like the same site:
  same type voice, same grid, same buttons, same motion character. When
  something "doesn't exist anywhere else on the site" (e.g. ink grid rules),
  it gets removed.
- **Locked-in alignment**: everything on the 12-column grid (see §6).
- **Big type only where it's the point.** Rand Regular, tight negative
  tracking (−.03 to −.05em) for display; Rand Mono uppercase 11–13px with
  +.05em tracking for labels, tags, buttons.
- **Buttons must read clearly as buttons**: solid rectangles (red or ink),
  mono uppercase label, arrow glyph, hover swaps red↔ink and nudges the arrow.
- **Wit lives in one or two details**, not everywhere: the logo's square
  pixel eyes that peek, the red square tag, the red full stop, "favorite
  something" in red.
- **Motion**: purposeful and tactile, never constant decoration. Native
  scrolling always (no scroll hijacking). Overshoot easing
  `cubic-bezier(.3, 1.4, .5, 1)` for small pops; `cubic-bezier(.7, 0, .2, 1)`
  for wipes; `cubic-bezier(.2, .8, .2, 1)` for slides.
- **Feedback style**: the owner writes terse bullets and expects every bullet
  addressed. Ask questions only when the answer changes the structure (use
  multiple-choice with a recommended option). Otherwise decide, build, and
  say what you chose.
- References the owner has cited for spirit (not copying): craighill.co
  (reduction with wit, the favourite), freshservice.jp/en, cwandt.com,
  spottedinprod.com, toyfight.co, play.date, faunarobotics.com, y-n10.com,
  odduniverse.xyz, telepathicinstruments.com, devouringdetails.com, pamir.ai,
  labasad.com, pi.website, Apple product pages (scroll stories, the "Get the
  highlights" carousel), Light Phone (layered reveal), Apple Music taste
  bubbles.

## 5. Stack and how to run

- Plain HTML/CSS/JS, no build step, no framework, no npm. Hosted later on
  GitHub Pages (`CNAME` = 2d1.studio). Jekyll ignores folders starting with `_`.
- Preview: `python3 scripts/preview.py` → http://localhost:4173 (sends a
  noindex header; analytics only load on the production domain).
- Fonts: Rand, Rand Mono (local, `fonts/`). Three.js 0.170.0 via import map
  from jsDelivr, lazy-loaded only for the Shop tote.
- Pages: `index.html` (home), `about/index.html` (About). The footer markup is
  duplicated in both; edit both.
- Key files:
  - `css/style.css` — tokens at the top, sections in page order, shared bar,
    footer, contact dialog, reduced-motion block at the end.
  - `css/about.css`, `js/about.js` — About page (essay fold).
  - `js/script.js` — home: newsletter, Studio carousel (and dormant slide
    viewers), logo dock, reading ink, signup micro-interactions, tote loader,
    Shop hotspots/chapters, Studio sticky stack, Updates wipe, in-page links,
    analytics.
  - `js/tote.js` — the procedural 3D tote (ES module).
  - `js/bar.js` — bar on every page: phone menu, inner-page logo eyes, clean
    hash on arrival.
  - `js/contact.js` — contact dialog on every page (it injects its own
    markup; links with `data-contact` open it; without JS they go to the
    Notion form).
  - `js/config.js` — public endpoints (empty).
  - `server/contact-worker.js`, `docs/CONTACT.md`, `docs/NEWSLETTER.md`.
  - `_archive/familiar-characters/` — parked, unpublished.

## 6. Design system

- **Palette**: `--red #FF2B00`, `--beige #FAF0E6` (Shop ground),
  `--beige-light #FDF8F2`, `--white #FFF`, `--gray #D3D5D9`,
  `--gray-light #E4E5E8`, `--ink #16161A`, `--ink-soft #5B5B61`,
  `--ink-faint #C9C9CD`, `--line rgba(22,22,26,.18)` (light hairlines).
- **Grid**: 4 columns on phones, 12 from 900px; margins `--pad` 12px / 16px.
  Left edges used: column 1 (`--pad`) for section tags, titles, bar, footer,
  the work carousel; column 2 (`calc(100% / 12 + var(--pad))`) for
  statements (About text, Studio line/sub/services, madlib, closing line);
  column 4 (`calc(25% + var(--pad))`) for the About essay; the Studio button
  aligns with the third services column.
- **Spacing tokens**: `--space` between sections, `--space-in` within a
  section (and above the footer), `--gap` from a tag/label to what it
  introduces. Avoid one-off values.
- **Components**: `.sec-idx` red square number tag (32px) + mono label as the
  section mark ("01 Studio", "02 Shop", "03 Updates"); `.big-text` statement
  size `clamp(30px, 4.3vw, 80px)` with `data-ink` reading-ink effect (words
  ink in from pale grey as you scroll; `em` inks red); bar buttons (`Get
  updates` outline, `Contact us` solid white); red/ink block buttons.

## 7. Current site, section by section (home)

1. **Bar** (fixed, red): Studio · Shop · About on the left; the logo docks
   into the centre as you scroll; Get updates (outline) + Contact us (solid)
   on the right. Phones: Menu button (red wipe-down panel with the three
   links + Get updates), logo, Contact us.
2. **Hero** — red, 90svh, the big white logo with closed square pixel eyes
   that peek every few seconds; caption under it. Owner is happy with it.
3. **About statement** — big text inking in, red notch square. Owner is happy.
4. **Studio** (most recently reworked; owner was unhappy with earlier
   versions, now on the "statement-led" direction they chose):
   - white; "01 Studio" tag on column 1; from column 2 the line "Clear
     ideas, with character." at `.big-text` size with `data-ink`, and
     **Say hello** (solid red block button, opens the contact form) to the
     right of the line, its left edge aligned with the third services column
     ("Branding & visual identity"); full width under the line on phones;
   - the sub in grey; **What we do** as three short columns (name + one
     line, light hairline above each), label "What we do" out on column 1 at
     ≥1100px; no numbers, no icons;
   - **`.work`** (owner is happy with it): full-bleed 16:9 project cards
     (3:4 portrait crops on phones) for Aviator, DeepDrip, Supateam; endless
     loop via cloned card sets with an invisible jump on scroll rest (clones
     are `aria-hidden` but must stay clickable — an `inert` clone caused a
     bug); autoplay steps through each project's images then slides on;
     holds while hovered or keyboard-focused, off screen, in hidden tabs,
     with reduced motion, or while covered by the Shop; front card has the
     `ew-resize` cursor and moving across it flips images like a flipbook;
     clicking any card slides the carousel (front → next, peeking → itself);
     caption is only the category; no name, no number box, no indicators,
     no play/pause button;
   - **Studio and Shop share a `.stack`**: Studio is `position: sticky`
     (top computed in JS so it sticks when its bottom meets the viewport
     bottom) and the beige Shop rises over it as a layer. `#studio` targets a
     zero-height `.studio-anchor` before the section so nav links land
     correctly.
   - The section does NOT need to fit in one viewport (that was a
     miscommunication, now dropped).
5. **Shop** — beige pinned scroll story around the live 3D tote (chapters:
   intro, logo, tag, canvas, strap, inside/x-ray, outro with Get notified);
   vertical story-progress (4px squares, current stretches to 56px and fills
   red). Owner is happy with it. Don't change without being asked.
6. **Updates + footer** — madlib signup (unconnected, truthful notice),
   closing line inking in; footer: © 2D1 · "Familiar Characters." · Contact
   us (ink) · four 9×9 pixel social icons (Instagram, Threads, X, New
   Fiction LinkedIn for now).
7. **Contact dialog** — red wipe, white sheet, pixel eyes that watch the
   field; Notion "Form Submissions" fields; unconnected → says so and links
   the Notion form.

**About page** (`/about/`): single column on column 4 (header and essay share
the left edge). Kicker "About", title (placeholder "Why familiar things
matter"), subtitle, the short "About us" paragraph always shown, then the
essay folded under a vertical opacity fade with "Continue reading ↓" below
it; clicking the fade or the label unfolds the essay in place (no
conventional Read more button). All essay text is placeholder drafted from
the brand book; the owner will write the real essay. Red square as the final
full stop.

## 8. Decision log (why things are the way they are)

- Contact CTA is "Contact us" in bar and footer (renamed from "Contact
  form"); Studio's own CTA copy went "Get in touch" → "Say hi · Set up an
  intro call" → "Set up an intro" → **"Say hello"**. It opens the form (no
  booking tool exists, so don't promise "book").
- "Boutique" was replaced everywhere by "independent", including meta/OG.
- Familiar Characters page (curated object index, House view with tinted
  floating squares, overlay sheets, Python generator) was built, then
  removed entirely in favour of About. Its source is parked in `_archive/`.
- Studio iterations, in order: layered full-screen slides (parked) → Apple
  highlights carousel with header/caps → ink-ruled FreshService-style grid
  (rejected: rules exist nowhere else) → current statement-led version.
- Tote: canvas look, embroidered logo top-right with square pixel eyes
  closed by default; procedural X-ray with inside pockets.
- Shop progress indicator style (squares stretching into a red-filling bar)
  is the site's progress vocabulary; reuse it if an indicator is needed.

## 9. How to verify (expected every round)

- Run the preview and look at real renders at 390×844 (touch), 768×1024,
  1280×800, 1440×900, 1920×1080. Check: no horizontal overflow, no console
  errors, alignment to the grid, keyboard focus, reduced motion, no-JS.
- Headless Chrome via the DevTools protocol (Node 24 has global WebSocket)
  works well for screenshots and scripted interactions; scroll-and-capture
  rather than full-page captures when `svh` units matter. SwiftShader flags
  (`--use-angle=swiftshader --enable-unsafe-swiftshader`) let WebGL render
  headless. Transient jsDelivr SSL errors for Three.js are network noise.
- Validate markup nesting and that local refs exist after big HTML edits.
- Update `README.md` when behaviour or structure changes (it is the
  owner-facing description of the site).

## 10. Reporting style

Lead with what changed and whether it's verified; one short paragraph or a
few bullets per area; flag decisions the owner should check (with the
reason); say plainly what was not done; no hedging, no filler. Send
screenshots when visual. Say "nothing is committed" unless asked to commit.

## 11. Historical open items (superseded by docs/HANDOFF.md)

- Uncommitted since checkpoint `a2952cf`: the statement-led Studio, the
  Studio/Shop sticky stack, Say hello placement, About single column and
  Continue reading, README updates. Commit only when asked.
- Owner wants the same calm, negative-space treatment applied across the
  rest of the site next (Updates, footer, About); ask which section first.
- Open questions previously offered: should the held Studio dim/recede as
  the Shop covers it?
- Real content still needed: the About essay; project captions beyond
  category; newsletter provider and contact endpoint (deploy
  `server/contact-worker.js` per `docs/CONTACT.md`) — only when asked.
- Pre-existing nit: the home page preloads Rand Bold but no longer uses it.

## Site-wide language and focus direction — 9 October

Use US English for interface and authored descriptive copy, including color and
colorful. Preserve exact official product identities (e.g. HAY Colour Crate) and
external source URLs. Never show focus outlines or ring-like shadows on any
control, including native selects, inputs, sliders, canvases, links and buttons.
Retain useful keyboard focus with color/background changes and existing input
underlines; authored normal borders remain. Apply both language routes.

About's archived hero template is inert. Keep the active docked logo and full
nav OUTSIDE it. Tests must check active DOM, not raw text presence. Preserve the
red square at the essay's end (explicitly liked by owner). Nav hover square
reveals by width 0→6px while label nudges 12px, with no sibling layout shift.

Finds: default Canvas; external Grid/Canvas toggle immediately left of bottom-
left Views menu. Grid is a regular responsive overview. Views retains categories
only: no tag selector or stale tag-filter state. Preserve modal ownership/zoom.

## Latest Finds override — canvas only

No Grid/Canvas toggle or visible regular Grid mode. Lower-left menu: Category.
At max zoom retain the 2D map, center nearest/selected image with smooth motion,
neighbors at40% opacity. Every image frame square, object-fit cover (owner’s 10 October override: fill frames without white margins). Neighbor
click recenters in any direction; centered image opens details. No horizontal
slide controls. Keep 2D drag, keyboard, reduced motion, category and zoom context.
Info auto-opens on first arrival, remembers dismissal per browser across EN/JA,
and remains manually reopenable. Local preference storage is not ownership data.

## Hero corner exception — 9 October

The owner explicitly requested 128px bottom-left and bottom-right corners on
Home’s hero. Top corners remain square. This is a scoped exception to the
square UI rule; keep the 20px red border and match the landing fill inside it.


## Finds catalog and product-deck direction — 10 October

Every catalog addition follows `docs/FINDS-CATALOG-PROCESS.md`: transparent primary product photograph, consistent square framing/reversible grade, authentic native-resolution images and source provenance. Include 1–4 distinct high-resolution gallery photographs (prefer four when quality permits); document unavailable sources rather than pad counts with duplicate crops or synthetic photos. Prefer verified original-launch or iconic colorways; preserve explicit owner selections such as BAGGU Pop Pink Happy. Display product names omit color; keep selected-variant information and evidence internally. Read `docs/FINDS-AUDIT.json` for unresolved quality/source issues.

Product detail navigation uses a coordinated horizontal card push: next enters from the right as the current card exits left; previous reverses. No vertical roll, folding or scaling. Preserve desktop preview controls, the stationary mobile footer, native scrolling, modal focus, reduced motion, cancellation cleanup and ownership-response isolation.

## Shared interface consistency — 10 October 2026

When changing an element shared across pages, apply the same design and behavior to every active route in English and Japanese. Finds is the reference for the mobile hamburger menu: shared type, spacing, bordered items, stagger and language links inside navigation. Preserve each page’s correct destinations, active state and Contact behavior; desktop layout and Home hero reveal remain intentional page-specific behavior. Check Home, About and Finds together after shared changes.


## Finds image workflow — 11 October 2026

For each new product, research its most iconic or well-recognized color, size and variation, with source evidence. Explicit owner-selected variants take precedence. Choose a clear photograph that best showcases the complete product as the main image, remove its background for the canvas, and apply the shared warm, natural photo treatment to match the collection. Preserve original product colors, geometry, detail and native resolution. Include no more than four authentic detail photos, combining different angles and real-use views where strong sources exist. Resolution and usable product detail take priority over reaching four images; never pad the gallery with duplicates or invented views. Follow `docs/FINDS-CATALOG-PROCESS.md` and disclose any unresolved quality or source gap.

## Verification scope — 12 October 2026

For every medium-to-large update, inspect the actual rendered result at desktop and mobile widths and exercise the affected interactions in the running site before reporting completion. Source review, automated checks, or screenshots alone do not replace interaction testing. Test the relevant opening, closing, navigation, selection, hover, touch, and keyboard behavior as applicable, and confirm the resulting UI state. Include affected English and Japanese routes and shared components. Save visual proof and report any verification that could not be completed.

Simple copy, spacing, and styling-only edits may use lighter verification appropriate to their scope; a full desktop/mobile interaction pass is not required for those changes. This scope guidance supersedes the expectation in section 9 to run every viewport and interaction check for every minor edit.


## Finds naming and routes — 14 October 2026

Use `/finds/` and `/ja/finds/` for the collection page. Page title and navigation
label are Finds. Familiar Characters remains the concept in the copy and info
button. Older route instructions above are superseded; `/objects/` redirects.

## Familiar Characters naming — 20 October 2026
The owner renamed Finds to Familiar Characters. Use Familiar Characters for all public-facing names, titles, links and descriptions in both languages. Keep `/finds/` and `/ja/finds/` as the existing routes. This supersedes the 14 October naming instruction above.

## Shared reading-edge alignment — 20 October 2026
The owner requires About’s Studio and Shop headings, paragraphs and CTAs to
share the exact left edge of the footer social links. Apply this rule to every
future element positioned in that same reading area, rather than choosing a
new inset. Desktop uses the shared 960px-capped column with a 128px right gutter;
phone/tablet uses 24px insets. Preserve full-bleed artwork separately.

## Icon surface treatment — 20 October 2026
Keep standalone decorative icons transparent, without an added background tile.
Invert the icon itself to beige/white on dark backgrounds; use cranberry brown
on light backgrounds. Apply this principle wherever relevant in future work.
About’s flat house icons explicitly use softly rounded block/roof corners and
a slightly heavier stroke to echo the playful 3D toy blocks. This is an approved
exception to the historical square-corner rule, not a change to all UI controls.

## Familiar Characters route — 21 October 2026

The collection now lives at `/familiarcharacters/` and `/ja/familiarcharacters/`.
Update active links and generators accordingly. `/finds/` and `/objects/` remain
redirects in both languages. Internal asset names beginning with finds stay unchanged.

## Square image framing — 21 October 2026

Project mockups in the work track need intentional square compositions. Never
leave white gutters or letterboxing as a generic fit fallback. Crop photographs
to fill the frame with per-image focal positions. For complete UI mockups,
extend the matching original background color or texture across the square.
Preserve authentic artwork and keep foreground images from current galleries.


## Shared reading-edge rule — 22 October 2026
On every page, text/form containers occupying the reading area must start at
the footer social-links edge. Use `--reading-left` and `--reading-width` from
`css/walla.css`; retain a narrower maximum line length when useful, with spare
space on the right. A request for a centered/comfortable column does not override
this alignment rule unless the owner explicitly asks to break it. About's earlier
independently centered essay is superseded. Check actual element edges in EN/JA
at desktop, tablet and phone sizes after changes. Full-bleed artwork and immersive
canvases retain their own framing.

About's centered-column clarification — 22 October: center the 680px reading
column and its Contact/footer social column together. The essay must have equal
left/right space in the viewport while sharing its left edge with its own footer
social links. Do not fix one requirement by breaking the other. About uses scoped
`--reading-width` / `--reading-left` values; other routes retain their own geometry.

About layout override — 22 October: the current desktop iteration (1100px+) uses
two columns, heading left and copy right, top aligned. Each heading sticks within
its own section. Preserve the social-links left edge; independent screen centering
is explicitly dropped for this iteration. Phone/tablet stay single-column.


Docked logo color — 22 October: keep the docked 2D1 logo Icon Red when crossing
into dark/footer backgrounds. Navigation may invert for contrast; do not turn
the docked logo white.

## Shared typography rule — 22 October 2026

All future typography changes must use the shared system in
`css/typography.css` and apply to every use of the affected style across every
active page in both English and Japanese. Update shared tokens, role recipes
and canonical mappings rather than individual elements or page-specific
typographic overrides. Reuse existing roles and variants; preserve responsive
sizing and language font selection. Follow `docs/TYPOGRAPHY.md`, regenerate
Japanese routes when needed, and verify affected styles across routes and both
languages at desktop and mobile widths. A request referring to one example
changes the shared style everywhere unless the owner explicitly limits its scope.

## Button hover direction — 23 October 2026
Use a continuous red sweep on button labels and icons, including modal actions.
Do not substitute an instant color swap or underline for this hover treatment.

## Sheet-trigger active state — 23 October 2026
For buttons matching the Familiar Characters/Favorites bordered trigger style, an open sheet means solid Icon Red fill with Soft Beige text and icons. Keep this active state while its sheet remains open, including beneath a detail modal; restore the white resting state on close. Use aria-expanded to expose the state. This is the shared rule for existing and future buttons of this style.


## Scoped control sweep — 23 October 2026
Only the ten owner-approved control types in js/control-fill.js receive the shared background/ink sweep. Do not broaden this allowlist to navigation, language toggles, text-only CTAs, overflow menus, product navigation or other controls. Preserve red-rest/brown-hover actions and existing selected/open states.


## Familiar Characters SEO scope — 26 October 2026
The owner explicitly rejected the all-objects browse directory. Keep the canvas
as the main collection experience; do not add a browse-all index or separate
category listing pages for SEO. The removed implementation is preserved under
`_archive/fc-browse-2026-10-26/`. Metadata, structured data and individual object
search-entry pages remain; object pages return to the canvas.


## Tote photograph — 27 October 2026
Use `2d-tote-red-handles-v16.webp` as Home's sole tote lifestyle image, with the
solid dark shoulder strap, red short handles and beige logo. The owner removed
the photo comparison toggle. Keep the specifications aligned with that image.
The prior comparison is archived in `_archive/tote-toggle-2026-10-27/`.


## Contact delivery — 27 October 2026
The owner requested a new Notion submissions database under Client Discovery
and email notifications to kosuke@2d1.studio. The database is created:
`3cfe57c7424143559adb49be620e5f42`, data source
`3c50fdb8-1bc8-41ab-9245-d8a252f90881`. The owner confirmed paid Notion plus
Google Workspace and chose Notion-native email instead of a separate provider.
See docs/CONTACT.md. Account authorization/automation/runtime activation remain
pending; do not claim submissions or emails work until a real test confirms them.
The server gate CONTACT_NOTION_EMAIL_READY must stay false until the native mail
automation is configured. Never expose NOTION_TOKEN in chat, source or client JS.


## Launch privacy and delivery — 27 October 2026
The owner authorized permissions/privacy, responsive, Safari, performance and
indexing checks. `/privacy/` and `/ja/privacy/` plus Contact/footer/info links are
new. Analytics is optional and off before consent; retain `js/analytics.js` as
the only active analytics boot path. Do not restore old automatic GA blocks when
regenerating catalog pages. Preserve the browser privacy signals and sanitized
page context. The owner will seek client portfolio approval; the catalog rights
inventory records no verified grant in checked sources, not a blanket legal
conclusion. See docs/image-permissions-2026-10-27/ and docs/LAUNCH-2026-10-27.md.
Package-only CSS bundling/JS minification is in scripts/optimize-preview.mjs;
source remains split. Keep preview noindex, package the actual sitemap and test
it. Lossless delivery adds 160px candidates; do not upscale or alter native photos.
Responsive fixes retain existing controls: <=389px product footer stacks two
rows, photo credits reserve the counter lane, filter height follows the visual
viewport. No Favorites redesign was needed. Physical Safari renders/menu/project
states passed, but full physical input/rotation and Duo second display remain
uncertified due automation limits. No public release or future Git approval is
implied by this audit. User-requested source preview on 4173 should remain live.


## Familiar Characters loading — 27 October 2026
Preserve the guarded dormant fallback, center-first image queue and unchanged
responsive/zoom sources and entrance animation. Japanese font delivery uses
complete Unicode banks generated by scripts/build-japanese-fonts.py; keep kana
and combining voicing marks together. Walla binaries stay original; CSS declares
their exact coverage. Keep fonts.css?v=9 and japanese-font.css?v=4 in generators.
The collection uses js/ja-objects.js, generated by build-japanese.py; other pages
retain the full dictionary. Extend its runtime inputs if adding a new collection
script. Verify translation coverage with tests/fc-language-delivery.py. See
docs/FC-MOBILE-PERFORMANCE-2026-10-27.md. This work adds no visible controls.


## Memoru repository boundary — 27 October 2026
Memoru app development belongs exclusively in `/Users/kosuke/Desktop/2D1/Projects/Memoru`, which has its own Git repository. Never stage, commit, or push its app source, Xcode projects, cloud backend, tests, builds, or app-design exports with this website. Memoru-related local experiments and previews here are ignored. Website Shop copy and published product images under `img/shop/menu-note/` are website assets and may remain here. Do not copy the app repository into this repository or add it as a submodule.

## Memoru repository separation — 27 October 2026

The owner explicitly requires Memoru work to stay separate from website commits
and pushes. The app repository is `/Users/kosuke/Desktop/2D1/Projects/Memoru`.
Do not copy, stage, commit or push its source, app changes, design experiments,
Figma scripts or review exports with this website. Local Memoru/Memore/MenuNote
experiments and previews in this checkout are ignored; preserve them locally.
The website's Shop listing and the displayed `img/shop/menu-note/memoru-app-icon.png`
are website content and may accompany a separately authorized website commit.
Historical tracked MenuNote Shop thumbnails remain website assets; do not erase
history or untrack them as part of this separation. Before any future website
commit/push, inspect staged paths for Memoru project files and exclude them.
Website commit authorization never authorizes committing or pushing the app repo.


## Site-wide delivery — 27 October 2026
All active JA pages now use generated per-page dictionaries; keep exact strings
and native locale navigation. build-japanese.py follows each page's local scripts;
run tests/site-language-delivery.py after changing runtime vocabulary. Studio's
closed project hero images stay lazy, video poster URLs use data-poster and load
on visibility. site_seo.py restores poster/eager hero/native controls in case
entries. Keep the shared thumbnail-to-hero motion unchanged. Shop preview image
hints include the iframe's rendered scale, both axes, Retina density and maximum
zoom. fc-preview-resize updates sources without rebuilding the canvas. Normal FC
canvas behavior remains unchanged. Object-entry source hints match actual slots.
build-lossless-page-images.py retains the PNG masters and verifies exact RGBA/ICC
for img/page-delivery/. Do not replace these assets with lossy encodings. See
docs/SITE-MOBILE-PERFORMANCE-2026-10-27.md; no public publishing/Git approval implied.


## SEO copy boundary — 27 October 2026
SEO/AIEO requests authorize technical code and metadata work only. Preserve the
owner’s visible copy and content in English and Japanese. Do not rewrite text,
add marketing claims or insert new visible content/CTAs for SEO unless the owner
explicitly requests those content changes. The unsolicited Home/About geographic
copy additions and Studio project-page CTAs were reverted to the pre-SEO copy.


## Social-only updates — 29 October 2026
The owner confirmed that updates should use social follows. Home's newsletter
was removed on 22 October and its former markup is archived. No active route
has a newsletter form. Do not carry newsletter-provider activation into the
launch checklist or restore the form; Contact email fields remain separate.


## Contact token verification — 29 October 2026
The owner saved the Notion runtime credential in ignored .dev.vars. A direct
read-only request verified that it is valid, can access the intended data source,
and sees all required properties. Do not ask the owner to create/save it again.
The native Google Workspace automation is still unverified; keep
CONTACT_NOTION_EMAIL_READY false until confirmed. No real inquiry or notification
has been tested, and no hosted runtime received the credential. Never print it.


## Contact live-test result — 29 October 2026
Real local mobile submission and identical-request retry passed: one correct
Notion record, no duplicate. Native Notion Gmail mail arrived in the owner inbox,
but its body contains literal @ placeholders instead of dynamic property mentions.
The email template needs owner correction in Notion's automation editor before
retesting. CONTACT_NOTION_EMAIL_READY was returned to false. Keep the labeled test
entry until final delivery is verified, then archive it. See docs/CONTACT.md and
tmp/contact-live-test/. Do not claim the complete notification flow is finished.


## Final private launch checks — 30 October 2026
Client project pages have been sent; replies pending. Owner explicitly holds
public deployment and indexing. Contact's corrected simple database-link email
passed a real local Notion/inbox test plus identical-request retry. Read
CONTACT.md's latest status; do not ask to set up Notion/token again. Local gate
true; hosted full-site runtime remains unconfigured. Physical iPhone unavailable,
owner business/retention confirmations pending. See LAUNCH-FINAL-2026-10-30.md
for current evidence and precise remaining actions. No new UI added.

## Owner sign-off — 30 October 2026
Operator/name/privacy mailbox and five-business-day response are confirmed.
Inquiries DB is private to intended collaborators. EN/JA privacy policy now
states 12-month retention after last meaningful contact for unsuccessful inquiries;
manual enforcement remains required, no automatic deletion exists. LinkedIn is
https://www.linkedin.com/company/2d1-studio/ . Tote specifications are removed,
archived at _archive/tote-specifications-2026-10-30/; do not restore until asked.
Phone HTTP preview needs crypto.getRandomValues UUID generation; do not restore
unguarded crypto.randomUUID in Contact. Physical keyboard/rotation now observed;
Send retest and remaining gestures pending. No physical Duo available.


## FC launch decision — November 1, 2026
Owner elects to proceed with FC retaining current photos despite unresolved license evidence; do not treat individual photo permission requests as a required next step. Additions are /legal/ and /ja/legal/ plus image-concern mailto links to kosuke@2d1.studio. These notices make no licensing or blanket fair-use claim. Favorites is removed; original JS/CSS are archived under _archive/favorites-2026-11-01/. Shared search/info/product styling and sweep measurement now live in objects-controls.css/js. The retired local key is cleared on visiting FC. Keep the feature absent from builds, translations and privacy descriptions. Browser tests passed EN/JA at 320,390,768,1440 widths; source links, locale and SEO checks pass. Production FC returned 404 on November 1. The preview package remains noindex and is not a release build. Do not publish unapproved client portfolio pages as a side effect of an FC release.


## Unified FC product details — November 1, 2026
The owner removed separate Object details pages and links. The modal is the
single product experience and extends to the viewport bottom. Keep photos,
description, source credits and external Product page action; omit the redundant
Brand/Category/Filed under table. Three similar products below the gallery replace
previous/next product navigation (shared tags, then brand/category relevance).
Selection updates the same modal and preserves the original return-focus target.
Detail tags are text-only filters; search filter chips remain unchanged. Old EN/JA
item URLs redirect to the collection's `?item=ID` modal and are noindex, outside
the 24-URL sitemap. Prior page generator/CSS: `_archive/object-details-2026-11-01/`.

FC modal visual refinement — November 1: reduce sheet width and height by 10% while keeping its bottom edge at the viewport bottom. Transparent backdrop (no dimming), 1px ash-brown border. Credit text has 24px bottom clearance at the gallery end. Category links have square-dashed underlines; related-product images use 72% of the card width with a 240px cap. Preserve EN/JA and mobile behavior.
