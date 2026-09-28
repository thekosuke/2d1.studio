# 2D1 newsletter connection

The repository is a static website. There is no configured newsletter service or server runtime. The current form validates input and reports that signup is not open; it never stores an email or pretends a subscription succeeded.

## Connect a provider

1. Create a subscriber list with your chosen email provider and enable double opt-in if appropriate.
2. Deploy an HTTPS API endpoint on a server or serverless host. GitHub Pages cannot execute server code. Store the provider credentials in that host's environment variables (for example `NEWSLETTER_API_KEY` and `NEWSLETTER_LIST_ID`). Never put credentials in this repository or client JavaScript.
3. The endpoint must accept `POST` with `Content-Type: application/json` and a body of `{ "email": "visitor@example.com" }`.
4. Validate the address on the server, limit request sizes, rate-limit requests, and make repeated requests for the same email idempotent. Configure CORS to allow `https://2d1.studio` and the review origin when needed. Do not log email addresses unnecessarily.
5. Call the provider API and return HTTP 200 with `{ "status": "subscribed" }` only after it confirms acceptance. For double opt-in, return `{ "status": "pending_confirmation" }` instead. Return HTTP 429 for throttling and a non-2xx status for provider errors. Do not use a general form inbox as a mailing-list substitute.
6. Set `newsletterEndpoint` in `js/config.js` to the public endpoint URL. It is an endpoint address, never a secret.
7. Verify the real provider flow with a controlled test address, including confirmation and unsubscribe. Add the appropriate privacy information before accepting signups.

## Frontend behavior

- Visible, labeled email input with native validity checks; separate messages for an empty and a malformed address, which also mark the field invalid and return focus to it.
- Loading state, 12-second timeout, disabled submit button, and read-only email during requests; repeated submits are ignored while one is pending.
- Separate messages for success, confirmation required, rate limits (429), provider errors (non-2xx), unconfirmed or malformed responses, connectivity failures, and a non-HTTPS endpoint.
- An unconfigured endpoint shows a neutral notice (not an error): signup isn't open yet and the email hasn't been saved.
- Session-level duplicate protection; the endpoint must handle duplicates across sessions.
- No email storage in localStorage, sessionStorage, query strings, analytics, or the repository.

All of these states were exercised against mocked responses in a local browser; no provider was contacted. The form logic is isolated in `subscribe()` in `js/script.js`. Adapt this function if your provider uses a different public endpoint contract. The page layout does not need to change.
