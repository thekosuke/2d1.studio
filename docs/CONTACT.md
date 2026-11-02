# Contact form → Notion + Google Workspace

Updated 29 October 2026. The owner chose their existing paid Notion plan and
Google Workspace mailbox instead of a separate email service.

## Current status

Created and verified in Notion:

- Database: **2D1 Website Inquiries**
  https://app.notion.com/p/3cfe57c7424143559adb49be620e5f42
- Data source: `3c50fdb8-1bc8-41ab-9245-d8a252f90881`
- Parent: Client Discovery
  https://app.notion.com/p/34f11de80e938024a941ccc3b1735361
- An inline **Website inquiries** table on that parent page, newest first.
- A **Needs reply** view filtered to New / In progress.

**Local end-to-end delivery verified on 30 October 2026.** The actual mobile
form saved one correct Notion entry, an identical retry created no duplicate,
and the corrected notification reached kosuke@2d1.studio. Its fixed database
link was verified in both email text and HTML. No further Notion setup is needed.
The local readiness gate is true. The source preview on 4173 is static; the
backend preview is http://127.0.0.1:8787/contact/.

**Production is still on hold at the owner's request.** The token has not been
installed into a public full-site runtime; remote D1 migration, host-level rate
limiting and production delivery verification belong to the release stage.
The configured coming-soon Worker does not host this backend.

The following setup instructions are retained for reference; account creation,
token saving and mail authorization are already complete. Historical checkpoints
at the end are superseded by the 30 October result.

## Completed account setup (reference)

### 1. Authorize the website to write to the new database

Create an internal integration in the same Notion workspace at
https://www.notion.so/profile/integrations with **Read content** and **Insert
content** capabilities. Read access is needed to recover a submission whose
previous response was lost. Open **2D1 Website Inquiries → ••• → Connections**
and grant that integration access to this database only as appropriate.

Put its secret in the server runtime as `NOTION_TOKEN`. For local testing, use
ignored `.dev.vars` (a blank, disabled template is prepared). Do not paste the
secret in chat, source code, the database, `js/config.js` or a tracked file.
Notion's database ID and data source ID are different; the endpoint uses the data
source ID above with API version `2025-09-03`.

### 2. Enable Notion's native email notification

In **2D1 Website Inquiries → ⚡ → New automation**:

- Name: `Email new website inquiry`
- Trigger: **Page added**
- Action: **Send mail to**
- From: authorize the owner's Google Workspace/Gmail account.
- To: **kosuke@2d1.studio** (fixed recipient, never the visitor's address).
- Subject: `New 2D1 website inquiry`
- Body (owner's chosen simple alert, verified 30 October):

```text
A new inquiry has arrived through the 2D1 website.

View the sender’s details and message in the Website Inquiries database:
https://app.notion.com/p/3cfe57c7424143559adb49be620e5f42
```

No dynamic @ mentions are needed. Open the database to read the sender details
and message; the email is an alert, not a copy of the inquiry. Reply using the
entry's Email property. The `Email notification` select stays Pending unless a
separate Notion action changes it; it is not a reliable delivery monitor.

Once the automation is enabled, set `CONTACT_NOTION_EMAIL_READY=true` in the
server runtime. This explicit gate prevents accepting inquiries before the
owner's requested email path has been set up. It cannot verify Gmail delivery;
the live test below is required before calling the integration complete.

## Runtime / local preview

`server/purchased-worker.mjs` now also routes:

- `GET /api/contact/config`: returns only `ready` / `not-configured`; no secrets.
- `POST /api/contact`: validates and writes one inquiry to Notion.

The public config can retain `contactEndpoint: ''`. On submission the frontend
checks the same-origin readiness endpoint and uses `/api/contact` only when
ready. The ordinary Python preview has no backend and stays honestly unconnected.
If a separate hosted endpoint is used, put its public HTTPS URL in
`js/config.js` and allow the site's exact origin in `ALLOWED_ORIGINS`.

After setting up the account steps, for a real local test:

```sh
python3 scripts/build-preview.py
npm run db:local
npm run preview:worker
```

Open http://localhost:8787/contact/ or /ja/contact/. The existing Python preview
on port 4173 remains for static/design review. Do not expect it to send inquiries.

Production uses the existing Worker + logical D1 binding `DB`. Apply the new
`drizzle/0001_foamy_wild_pack.sql` migration before activation. Configure secrets
using the host's secret storage; `.dev.vars` is local-only. Publication requires
a separate request under the repository's working agreement. No publication,
DNS or GitHub changes were made here.

## Fields and delivery contract

Notion properties: Full name (title), Email (email), Company (text), Category
(select), Message (text), Status (status), Submitted On (date), Email notification
(select), Submission ID (text), Source URL (URL), Language (select).

POST JSON fields:

```
name, email, company, category, message, submissionId, language, sourceUrl
```

The accepted categories match the form: New Business, Media Inquiry,
Collaboration and Other. Names/company are limited to 120 characters, email 254
and message 2000. Types, UUIDs, language, URL origin, body size and content type
are checked server-side. Blank-company and Japanese submissions are supported.
The hidden website trap is rejected; no fake success is returned for it.

The browser keeps a retry ID in memory for an unchanged submission. A D1 ledger
contains only that UUID, payload hash, lease metadata and resulting Notion page
ID; it does not store names, emails or messages. Atomic leases prevent concurrent
writers. Successful retries return the saved receipt without another page/email.
A lost Notion response is recovered by querying **Submission ID** before writing
again. Absolute exactly-once delivery across every provider failure is not
promised. Changed content gets a new browser submission ID.

The server strips query strings/fragments from Source URL and never logs bodies,
credentials or provider error details. A best-effort in-memory limit allows
three new delivery attempts per IP per ten minutes. Add host-level rate limiting
before making this endpoint public; the per-isolate limit is not global.

`200 {"status":"received"}` means Notion accepted the entry, **not** that an
email reached an inbox. Notion handles email asynchronously. The endpoint returns
422 invalid, 403 unauthorized origin, 409 retry conflict/in-progress, 413 too
large, 415 wrong content type, 429 throttled, 503 unconfigured or 502 unconfirmed
provider/storage failure. Failed or unconfigured submissions retain form text.

## Verification and final activation

Passed: server JavaScript syntax; new backend suite with real in-memory SQLite
and mocked Notion API; existing Purchased backend regression suite. Backend tests
cover categories/locale/optional fields, retry identity, payload conflicts,
concurrent requests, response-loss recovery, provider failures, rate limits,
origin/type/body validation and the unconfigured gate.

Browser tests cover EN/JA at desktop/phone sizes with mocked readiness/delivery:
honest unconfigured fallback, preserved input after failure, reuse of retry ID,
duplicate-submit protection and success only after a confirmed-storage response.
No real submission or test email has been sent, so end-to-end activation remains
unverified until the account setup is completed.

Then submit one clearly labeled integration test through the actual form:

1. Confirm exactly one Notion entry and the correct fields under Client Discovery.
2. Confirm the notification actually appears at **kosuke@2d1.studio**. Notion says
   its Gmail automation can take up to two minutes. Check spam/filtering if needed.
3. Reply to the sender using the Email property; don't assume the notification's
   From/Reply-To address is the visitor's address.
4. Test a retry without producing a second database row or a second email.
5. Remove/archive the clearly labeled test entry after verifying delivery.

References:
- https://www.notion.com/help/database-automations
- https://www.notion.com/help/forms
- https://developers.notion.com/reference/post-page

## Activation preparation — 29 October 2026

The database and Needs reply view were reverified. The local Notion token is
still blank, CONTACT_NOTION_EMAIL_READY remains false, and connected tools have
no integration-secret or automation-settings operation. Account authorization
was requested from the owner; no live inquiry or notification has been sent.

The contact backend suite passed again using real in-memory SQLite plus mocked
Notion. Migration 0001_foamy_wild_pack.sql has now also been applied successfully
to the local Wrangler D1 database. This does not migrate a remote database or
activate the public site. The local Worker can be used for the real test once
the credential and native Gmail automation are ready; keep the ordinary design
preview on port 4173 available.

## Runtime credential verified — 29 October 2026

Supersedes the earlier missing-token checkpoint. The owner saved NOTION_TOKEN in
the ignored local .dev.vars file. A server-side GET to the intended data source,
using Notion-Version 2025-09-03, succeeded and confirmed the full required schema.
Only sanitized pass/fail information was printed; the credential was not exposed.
The local secret file is owner-readable/writable only (0600).

CONTACT_NOTION_EMAIL_READY remains false. Native Gmail automation must be
confirmed before opening the form for real submissions and running the controlled
end-to-end Notion/inbox test. No record or email was created by this verification.
The local credential has not been installed into a hosted production runtime.

## Live local delivery test — 29 October 2026

The owner confirmed the Notion mail automation was enabled. The local Worker was
restarted with the verified token and readiness flag. A real mobile browser form
submission returned 200/received, displayed the success view, and created exactly
one Notion record. Every inquiry field matched. An identical request retry
returned 200/received without creating a duplicate row.

The native Google Workspace automation delivered one message to
kosuke@2d1.studio, confirmed in Gmail with INBOX and SENT labels. However, its body
contains literal @Full name, @Email, @Company, @Category, @Message, @Submitted On
and @Trigger page placeholders. These have not been inserted as dynamic Notion
mentions, so the email does not contain the actual inquiry details or record link.
The owner must replace them with real @ mentions in the automation editor, then
a fresh controlled test should verify populated email fields.

CONTACT_NOTION_EMAIL_READY was returned to false until this template defect is
fixed. The labeled test entry remains for inspection; archive it after the final
notification test succeeds. No public deployment or hosted secret installation
was performed. Evidence: tmp/contact-live-test/test.json and form-success.png.

## Final local delivery verification — 30 October 2026

Supersedes all earlier incomplete-token/template checkpoints. Owner confirmed
the simple fixed-link template is saved and enabled. Real browser submission
and identical-request retry both returned 200/received. Direct Notion query
found exactly one entry, with all eight submitted fields matching. Mobile
success state was visually inspected. Gmail confirmed one corrected inbox
notification with the expected database URL and no literal @ placeholders.

Evidence: tmp/contact-final-2026-10-30/test.json and form-success.png.
Test page: 40911de8-0e93-8162-832e-d6ce025f0e79.
Prior test page: 40811de8-0e93-81e8-82c0-d9b09038ee43.
Both clearly labeled test entries are retained; the connector requires an
explicit request to trash specific pages. No real client inquiry was altered.
No public deployment, Git push, DNS or search-indexing action was performed.

## Owner privacy policy — 30 October 2026
Unsuccessful inquiries and related email correspondence must be deleted 12 months
after last meaningful contact. Operator/contact and database access restrictions
are owner-confirmed. This is a manual retention policy, not an automated purge.
For periodic review, use the last substantive exchange in Notion or email rather
than the original Submitted On timestamp. Keep records needed for ongoing work
or applicable obligations. A deletion request must consider both stores.

Contact UUIDv4 generation now uses crypto.getRandomValues so private HTTP phone
previews can display validation/delivery feedback; production HTTPS behavior and
idempotency contract are unchanged. The phone's port4177 preview intentionally
has no API and must show an honest unconfigured fallback, not fake success.
