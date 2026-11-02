/* Public configuration only. Never put a provider API key here.
 * Updates use footer social links; there is no active newsletter form.
 * newsletterEndpoint stays empty for dormant, archived form code only.
 */
// contactEndpoint: HTTPS endpoint that implements docs/CONTACT.md (it writes to
// the Notion "2D1 Website Inquiries" database; the Notion token stays on the server).
window.TWO_D_ONE_CONFIG = Object.freeze({ newsletterEndpoint: '', contactEndpoint: '' });

// With an empty contactEndpoint, js/contact.js checks the same-origin Worker
// at /api/contact/config. Static previews remain honestly unconnected.
