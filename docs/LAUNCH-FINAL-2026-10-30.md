# Final private launch review — 30 October 2026

## Release hold

Owner has sent the three project pages to clients and is awaiting replies.
Client approval is pending, not presumed. Public deployment and indexing are
explicitly on hold. Catalog photo permissions are separate from portfolio
approval; the existing inventory remains unresolved. No new visible UI added.

## Contact

Local end-to-end delivery passed: one complete Notion entry, no duplicate on
retry, actual mobile success view, one Gmail inbox notification with a correct
fixed database link. Owner's Notion setup is finished. See CONTACT.md.
Production secret/D1 migration/global rate limiting and public smoke test are
release-stage tasks, deferred with publication. Two labeled test rows remain.

## Device and responsive checks

Fresh tests of the current source:
- 599 EN/JA route/state checks across 12 phone, tablet, breakpoint and desktop
  sizes (320–1440px, including 844×390 landscape): no detected overflow,
  control-bound issues or runtime errors. Menus, form editing/fallback,
  project transitions/Overview, Shop keyboard and Red Pixel exercised.
- 14 focused collection footer/credit/Favorites cases: no runtime errors;
  touch save/remove, previous/next, viewport rotation and keyboard paths passed.
- 34 privacy/layout/consent browser cases passed; Google requests were mocked.
- 240 HTML files: zero broken local references.
- Contact backend, analytics privacy and seven locale vocabulary checks passed.

Physical iPhone 15 Pro is unavailable in CoreDevice on 30 October. No new
physical pass is claimed. Prior renders/menu checks are retained; keyboard,
checkbox taps, canvas gestures and physical rotation still need completion.
The physical Duo second display/fold remains unverified. Resized browser
viewports are not evidence of physical folding or native Safari behavior.

When the phone is connected/unlocked (Safari Remote Automation enabled), test:
1. EN and JA Contact: keyboard opening, long-message editing, category selection,
   scroll to Send, dismiss keyboard, rotate with values retained.
2. Privacy: trusted taps toggle analytics; browser privacy signals remain honored.
3. Familiar Characters: drag/zoom, product open/close, photo swipe, next/previous,
   save/remove and Categories/Favorites with Safari bars expanded/collapsed.
4. Rotate portrait/landscape while a menu or product is open; check safe areas,
   reachable close/CTA controls, no trapped scrolling and restored focus.
5. On an actual Duo, repeat folded/open and both orientations during these states.

Two old Node fixture suites remain stale: mobile-nav lacks browser URL/currentScript
and newer DOM support; mobile-interactions expects removed data-contact/objects
navigation. Their failures are not counted as site passes or as proven site bugs.
Current rendered interactions were verified separately above. Evidence is under
ignored tmp/launch-final-2026-10-30/.

## Content review

Reviewed current Home, About, Shop, Contact, Privacy, the three project pages and
Japanese equivalents. Japanese tone remains professional and plain; 二日一宏祐
is preserved. Project copy is left unchanged while client review is pending.
Memoru and My Bag remain Coming soon; tote has an AI concept-image disclosure
and development notice. No newsletter form; updates use social follows.
Corrected one English agreement error: “their ideas ... give it shape” →
“their ideas ... give them shape”; regenerated Japanese assets, preserving translation.

Owner confirmations still needed:
- Operator is Kosuke Futsukaichi / 二日一宏祐 trading as 2D1; privacy mailbox is
  kosuke@2d1.studio. Confirm if there is a different registered operator.
- Can the promised response within five business days be maintained?
- Tote claims: Armada No. 8 canvas, Japan manufacture and provisional dimensions,
  magnetic closure/pockets/embroidery accurately describe intended development.
- LinkedIn remains https://www.linkedin.com/company/newfiction-org/; confirm it
  is the right current destination or provide the replacement.
- Inquiry retention: choose an actual practice for unsuccessful inquiries.
  Suggested operational policy for approval: review/delete after 12 months from
  last meaningful contact; retain active project/contract/accounting records
  according to their applicable requirements. This is a proposal, not implemented
  automatic deletion or a claim about a legally required retention period.

## Privacy review

EN/JA notice matches full-site form fields, Notion storage, Google Workspace mail,
Cloudflare processing, duplicate-prevention metadata, functional preferences,
Purchased cookie/server marks, optional analytics and deletion contact. Contact
explains its purpose and links the notice before submission. Full-site analytics
requires opt-in; the independently deployed splash has its own regional policy.
No form values go into analytics or browser storage. Consent/revocation, DNT/GPC,
URL scrubbing and blocked-storage behavior passed. No inquiry retention duration
or deletion scheduler is invented. Provider account terms/access and owner facts
cannot be signed off from public source code alone.

Owner should verify: inquiry database is not public; only intended people have
access; Notion/Google/Cloudflare account terms cover the business's use; retention
and access/deletion requests are handled in Notion and email, not just one copy.
This is technical/editorial review, not legal certification.

Primary reference checked: https://www.ppc.go.jp/all_faq_index/faq1-q4-17/
Notion automation reference: https://www.notion.com/help/database-automations

## Physical Safari follow-up
The owner reconnected the iPhone; physical Safari now connects. Native inputs
remain unverified because automation returns without performing the expected
input. Owner-assisted manual testing is prepared; see SAFARI-FINAL-2026-10-30.md.
Owner confirmed no physical Duo is available. Do not request one again or label
simulator/layout coverage as a physical Duo pass.

## Owner factual sign-off and implementation — 30 October 2026

Owner confirmed 二日一宏祐 / Kosuke Futsukaichi trading as 2D1, privacy contact
kosuke@2d1.studio, the five-business-day response commitment, and a private
inquiries database limited to intended collaborators. Approved retention for
unsuccessful inquiries: 12 months after last meaningful contact. EN/JA notices
now state this policy; no automatic deletion process is configured. Owner must
apply it to Notion and related Google Workspace correspondence, preserving
records required for active projects or applicable recordkeeping obligations.

LinkedIn updated across active routes, mobile fallback and generators to
https://www.linkedin.com/company/2d1-studio/ . Tote specifications and their
trigger were removed from both languages and archived for later restoration at
_archive/tote-specifications-2026-10-30/specifications.html. No replacement UI.
The image and development copy remain. These confirmations supersede the
corresponding open factual questions above. Client/image approvals and release
remain separately pending; no public deployment or indexing action.

## Safari Send defect fixed

Owner reported no response on Send. The private LAN preview is HTTP, where
crypto.randomUUID is unavailable. It was called before the submission error
handler. Replaced it with cryptographically random UUIDv4 generation using
crypto.getRandomValues (supported in insecure contexts), retaining server UUID
validation and retry identity. No Math.random fallback. Same-address browser
verification confirmed a valid submission now displays the honest unconfigured
message, retains fields, and re-enables Send. EN/JA content, locale delivery,
backend tests and all 240 pages' local references passed. Physical retest pending.

Physical manual diagnostics support native input and rotation (393px portrait,
734px landscape, visual height down to 283px with keyboard), no document overflow,
and owner reports text retained. Remaining native controls require owner report.
