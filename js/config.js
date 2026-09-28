/* Public configuration only. Never put a provider API key here.
 * Set to a HTTPS endpoint that implements the contract in docs/NEWSLETTER.md.
 * An empty endpoint intentionally never reports a successful subscription.
 */
// contactEndpoint: HTTPS endpoint that implements docs/CONTACT.md (it writes to
// the Notion "Form Submissions" database; the Notion token stays on the server).
window.TWO_D_ONE_CONFIG = Object.freeze({ newsletterEndpoint: '', contactEndpoint: '' });
