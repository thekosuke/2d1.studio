// Reviewed for the limited, advertising-free splash setup on 27 October 2026.
// This is deployment policy, not an exhaustive worldwide statement of law.
// GA retains visitor/event-level records, so we do not claim an aggregate-only
// audience measurement exemption. See docs/ANALYTICS-SEARCH-CONSOLE.md.
const priorConsent = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB',
]);

export function analyticsPolicy(country) {
  if (priorConsent.has(country)) return 'consent';
  if (country === 'JP' || country === 'US') return 'auto';
  // No precautionary banner for an unreviewed/unknown region: no GA instead.
  return 'off';
}
