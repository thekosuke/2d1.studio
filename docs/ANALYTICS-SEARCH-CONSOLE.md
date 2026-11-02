# Analytics and Search Console — 27 October 2026

Only the public splash is deployed. The complete website and Memoru app remain
unpublished by this workflow. No commit or push is implied.

## Google accounts

- Existing Analytics account `340772201`: renamed from **New Fiction** to **2D1**.
- That account had no GA4 properties available. Created **2d1.studio**, property
  `560890595`, within the same account (Google requires at least four characters
  for a property name).
- Web stream **2D1 website**, `https://2d1.studio`, stream `16213326586`.
- Measurement ID **G-EJES69N4D2**. Replaces the archived New Fiction tag
  `G-7YBDBXJWCG`; the archived website itself is untouched.
- Enhanced measurement, Google Signals, user-provided data collection and ad
  personalization are off. Granular location/device collection is off.
- Event and user data retention are two months; reset on new activity is off.
  Aggregate standard reports are governed separately by Google's retention rules.

## Splash policy

`server/analytics-region.mjs` selects a policy from Cloudflare's trusted
`request.cf.country`. HTML is `no-store`, so it is never shared across visitors
with different policies. Client country headers/query parameters are ignored.

- **Japan, US:** no automatic consent prompt. Advertising-free GA loads unless
  the visitor previously declined or the browser sends DNT/GPC.
- **EEA and UK:** prior consent before any Google Analytics script, cookie or
  measurement request. Equal Allow/Decline controls; closing without choosing
  leaves GA off. A saved choice prevents the initial prompt from recurring.
- **Other/unknown countries:** GA off, no automatic prompt. This avoids adding
  precautionary banners where the requirement has not been established. It is
  not a claim that those countries require consent. Those visits are absent
  from GA. Country inference is approximate (for example, VPN exit locations).
- A small **Privacy** control exposes the disclosure and preferences. A refusal
  overrides the automatic policy. Browser privacy signals override permission.
- Local/private previews never load Google. Unknown production paths return 404
  and an off policy. No-JavaScript browsing sends no GA data.

This is a limited implementation policy, not a worldwide legal certification.
The GA setup retains visitor-level event data; we do not claim the UK's narrow
aggregate-statistics exemption. Google contractual requirements and applicable
law are separate. Reassess before enabling advertising, cross-service tracking,
additional countries, or publishing the full site.

References checked during setup:
- [ICO statistical-purpose exception](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [CNIL audience analytics guidance](https://www.cnil.fr/fr/node/677)
- [Google EU user consent policy](https://www.google.com/about/company/user-consent-policy/)
- [Google data retention](https://support.google.com/analytics/answer/7667196)

## Implementation

`js/analytics.js` is shared by the splash and private full-site routes. It keeps
full-site behavior explicit-opt-in unless a server-authored splash policy is
present. It sends path-only page URLs and origin-only referrers, not query
strings/fragments. Ad consent remains denied, Google Signals are disabled, and
GA cookie expiry is six months without renewal on each visit. Functional consent
preferences remain in local storage and can be changed at any time.

The Worker imports this one script as text and serves `/analytics.js`. Its CSP
allows the original eye-script hash, the same-origin script, and the required
Google Analytics/tag endpoints. No full-site asset binding or database exists.

## Search Console

Domain property **2d1.studio** verified by an additional Cloudflare TXT record.
Linked successfully to the **2D1 website** stream in GA4; Search Console reports
are available in the Analytics navigation.
Existing DNS verification/mail records were preserved. Submitted
`https://2d1.studio/sitemap.xml`; Google reported **Success**, **1 discovered
page** on 27 October. The sitemap lists only the authorized splash root.
Verification and successful sitemap processing do not guarantee indexing or
ranking. The full site's sitemap must not be submitted until launch approval.

## Verification and release

- `node tests/analytics-privacy.mjs`: explicit consent, automatic policy,
  refusal/revocation, DNT/GPC, blocked storage, cross-tab preferences, no tracking
  in private/local previews, stripped query/fragment data.
- `node tests/coming-soon.mjs`: country policy, cache isolation, spoofed-country
  rejection, script delivery, original eye artwork/CSP, redirects and private
  route exclusion.
- Browser interactions: allow/decline, persistent refusal, manual preferences,
  Escape/focus return, automatic/no-prompt region and unknown/off region.
  Rendered at 390 × 844 and 1440 × 900, with no horizontal overflow or local
  console errors. Proof in ignored `tmp/analytics-qa/`.
- Wrangler dry run contains only the splash HTML, analytics script, Worker and
  approved OGP image. No bindings.
- Deployed version: `7458ba58-d771-4130-94c8-c18da7f4e32b`.
- Public HTML and analytics script checked against source; live browser receives
  automatic policy here and loads `G-EJES69N4D2` without a consent prompt.
- GA4 Realtime confirmed **1 active user**, **1 view of 2D1**, and a `page_view`
  event after the live check. Screenshot: `tmp/analytics-qa/ga-realtime.png`.
- Production checks confirmed `/about/` still returns 404, the old domain still
  redirects with 301, and the public sitemap still contains only the splash.
