import page from '../_launch/coming-soon/index.html';
import socialImage from '../img/brand/2d1-social.png';
import analytics from '../js/analytics.js';
import {analyticsPolicy} from './analytics-region.mjs';
import favicon from '../img/brand/2d1-icon.svg';
import faviconIco from '../img/brand/2d1-icon.ico';
import touchIcon from '../img/brand/2d1-apple-touch.png';

// This deployment contains only the holding page. No main-site asset binding,
// database, contact credentials, private preview or production site is uploaded.
const redirectHosts = new Set(['newfiction.org', 'www.newfiction.org']);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (redirectHosts.has(url.hostname)) {
      return new Response(null, {status: 301, headers: {
        Location: 'https://2d1.studio/', 'Cache-Control': 'public, max-age=300',
      }});
    }
    if (url.hostname === 'www.2d1.studio' || url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      return new Response(null, {status: 301, headers: {
        Location: 'https://2d1.studio' + url.pathname + url.search,
        'Cache-Control': 'public, max-age=300',
      }});
    }
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': ['/', '/index.html'].includes(url.pathname) ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; script-src 'sha256-T4TWyZpglZ4xybryO3aOO5/NcUO0NLCC1s3qCkiLll0=' 'self' https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; img-src 'self' https://*.google-analytics.com https://www.googletagmanager.com; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    };
    if (url.pathname === '/robots.txt') {
      return new Response(request.method === 'HEAD' ? null : 'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /_\n\nSitemap: https://2d1.studio/sitemap.xml\n', {
        headers: {...headers, 'Content-Type': 'text/plain; charset=utf-8'},
      });
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response(null, {status: 405, headers: {...headers, Allow: 'GET, HEAD'}});
    }
    if (url.pathname === '/analytics.js') {
      return new Response(request.method === 'HEAD' ? null : analytics, {
        headers: {...headers, 'Content-Type': 'text/javascript; charset=utf-8'},
      });
    }
    const icons = {
      '/favicon.svg': [favicon, 'image/svg+xml'],
      '/favicon.ico': [faviconIco, 'image/x-icon'],
      '/apple-touch-icon.png': [touchIcon, 'image/png'],
    };
    if (Object.hasOwn(icons, url.pathname)) {
      const [body, type] = icons[url.pathname];
      return new Response(request.method === 'HEAD' ? null : body, {
        headers: {'Content-Type': type, 'Cache-Control': 'public, max-age=3600',
          'X-Content-Type-Options': 'nosniff'},
      });
    }
    if (url.pathname === '/sitemap.xml') {
      // Only the authorized public splash belongs in this deployment's sitemap.
      const sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://2d1.studio/</loc></url></urlset>';
      return new Response(request.method === 'HEAD' ? null : sitemap, {
        headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300'},
      });
    }
    if (url.pathname === '/og-image.png') {
      return new Response(request.method === 'HEAD' ? null : socialImage, {
        headers: {'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600',
          'X-Content-Type-Options': 'nosniff'},
      });
    }
    // Only Cloudflare's trusted country metadata selects the policy. Do not
    // trust a query parameter or a client-supplied country header. Never cache
    // a personalized policy across visitors; unknown paths keep analytics off.
    const policy = ['/', '/index.html'].includes(url.pathname)
      ? analyticsPolicy(request.cf?.country) : 'off';
    const content = page.replace('data-analytics-policy="off"', `data-analytics-policy="${policy}"`);
    return new Response(request.method === 'HEAD' ? null : content, {
      status: ['/', '/index.html'].includes(url.pathname) ? 200 : 404,
      headers,
    });
  },
};
