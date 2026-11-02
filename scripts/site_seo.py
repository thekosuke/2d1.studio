"""Shared launch metadata and static project entry pages. Never deploys."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urljoin
import json
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://2d1.studio'
PROJECTS = {'aviator': ('aviator', 'Aviator'), 'supateam': ('supa', 'supa'), 'deepdrip': ('deepdrip', 'DeepDrip')}
PAGES = {
    '': ('2D1 — Design Studio in Japan & North America', '2D1 is an independent design studio working with founders and small businesses in Japan and North America on branding, websites, and digital products.', 'WebPage'),
    'about/': ('About 2D1 — Kosuke Futsukaichi’s Design Practice', 'Meet Kosuke Futsukaichi and 2D1, an independent design practice working across Japan and North America. Brand design, digital products, and Familiar Characters.', 'AboutPage'),
    'work/': ('Brand Identity & Web Design Projects — 2D1', 'Explore 2D1’s brand identity and website design work for Aviator, supa, and DeepDrip, across healthcare, AI, and developer publishing.', 'CollectionPage'),
    'shop/': ('Design Objects & Small Digital Tools — 2D1 Shop', 'Explore 2D1’s own objects and digital tools: My Bag canvas tote, Memoru notes, Red Pixel, and the Familiar Characters collection.', 'CollectionPage'),
    'contact/': ('Contact 2D1 — Branding, Websites & Digital Products', 'Talk with 2D1 about brand identity, website design, UX/UI, and design consulting for your business in Japan or North America.', 'ContactPage'),
}

def structured(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')

def organization():
    # Service area, not invented offices, postal addresses, reviews or awards.
    return {'@type': 'Organization', '@id': BASE + '/#organization', 'name': '2D1',
            'url': BASE + '/', 'logo': BASE + '/img/brand/logo_red.svg',
            'description': PAGES[''][1], 'founder': {'@id': 'https://kosuke.com/#person'},
            'areaServed': [{'@type': 'Country', 'name': 'Japan'}, {'@type': 'Place', 'name': 'North America'}],
            'sameAs': ['https://www.instagram.com/2d1.studio/', 'https://www.threads.com/@2d1.studio', 'https://x.com/2d1_studio']}

def graph(route, lang, title, description, kind):
    address = BASE + ('/ja/' if lang == 'ja' else '/') + route
    return {'@context': 'https://schema.org', '@graph': [organization(),
        {'@type': 'Person', '@id': 'https://kosuke.com/#person', 'name': 'Kosuke Futsukaichi', 'url': 'https://kosuke.com/'},
        {'@type': 'WebSite', '@id': BASE + '/#website', 'name': '2D1', 'url': BASE + '/',
         'inLanguage': ['en', 'ja'], 'publisher': {'@id': BASE + '/#organization'}},
        {'@type': kind, '@id': address + '#page', 'url': address, 'name': title,
         'description': description, 'inLanguage': lang, 'isPartOf': {'@id': BASE + '/#website'},
         'about': {'@id': BASE + '/#organization'}, 'publisher': {'@id': BASE + '/#organization'}}]}

def metadata(html, route, lang, title, description, schema, image=None):
    address = BASE + ('/ja/' if lang == 'ja' else '/') + route
    browser_title = {'': '2D1', 'work/': '2D1 Studio', 'shop/': '2D1 Shop', 'about/': 'About 2D1', 'contact/': 'Contact 2D1'}.get(route, title)
    html = re.sub(r'<title[^>]*>.*?</title>', '<title translate="no">' + escape(browser_title) + '</title>', html, count=1)
    def meta(key, value):
        nonlocal html
        pattern = r'<meta (?:name|property)="' + re.escape(key) + r'" content="[^"]*"\s*/?>'
        tag = '<meta ' + ('property' if key.startswith('og:') else 'name') + '="' + key + '" content="' + escape(value, quote=True) + '">'
        html, count = re.subn(pattern, lambda _: tag, html)
        if not count: html = html.replace('</head>', '  ' + tag + '\n</head>', 1)
    for key, value in {'description': description, 'og:title': title, 'twitter:title': title,
                       'og:description': description, 'twitter:description': description,
                       'og:url': address, 'og:type': 'website',
                       'og:locale:alternate': 'en_US' if lang == 'ja' else 'ja_JP',
                       'robots': 'index, follow, max-image-preview:large'}.items():
        meta(key, value)
    if image:
        meta('og:image', image); meta('twitter:image', image)
        meta('og:image:alt', title); meta('twitter:image:alt', title)
        # Project cover aspect ratio differs from the generic social image.
        html = re.sub(r'<meta property="og:image:(?:width|height)"[^>]*>\s*', '', html)
    html = re.sub(r'<link rel="canonical" href="[^"]+"\s*/?>', f'<link rel="canonical" href="{address}">', html)
    for code in ['en', 'ja', 'x-default']:
        dest = BASE + ('/ja/' if code == 'ja' else '/') + route
        html = re.sub(r'(<link rel="alternate" hreflang="' + code + r'" href=")[^"]+("\s*/?>)', lambda m: m[1] + dest + m[2], html)
    html = re.sub(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>\s*', '', html, flags=re.S)
    return html.replace('</head>', '<script type="application/ld+json">' + structured(schema) + '</script>\n</head>', 1)

def build_site_seo():
    tr = json.loads((ROOT / 'locales/ja.json').read_text())
    for lang in ['en', 'ja']:
        prefix = 'ja/' if lang == 'ja' else ''
        for route, (title, description, kind) in PAGES.items():
            if lang == 'ja': title, description = tr[title], tr[description]
            path = ROOT / prefix / route / 'index.html'
            schema = graph(route, lang, title, description, kind)
            if route == 'work/':
                schema['@graph'].append({'@type': 'ItemList', 'name': title, 'itemListElement': [
                    {'@type': 'ListItem', 'position': n, 'name': name,
                     'url': BASE + '/' + prefix + 'work/' + slug + '/'}
                    for n, (slug, name) in enumerate(PROJECTS.values(), 1)]})
            path.write_text(metadata(path.read_text(), route, lang, title, description, schema))
        source = (ROOT / prefix / 'work/index.html').read_text()
        for detail in re.findall(r'<details class="work-project".*?</details>', source, re.S):
            identity = re.search(r'\bid="([^"]+)"', detail)[1]
            slug, name = PROJECTS[identity]
            route = 'work/' + slug + '/'
            # Reuse the actual project, artwork, footer, navigation, and type.
            content = detail.split('<div class="work-project-content">', 1)[1].rsplit('</div></details>', 1)[0]
            content = '<div class="work-project-content">' + content + '</div>'
            content = re.sub(r'<h2 class="work-detail-title(.*?)</h2>', r'<h1 class="work-detail-title\1</h1>', content, count=1, flags=re.S)
            content = re.sub(r'<p class="work-case-link">.*?</p>', '', content, flags=re.S)
            html = re.sub(r'<main\b.*?</main>', lambda _: '<main id="main" class="case-main">' + content + '</main>', source, count=1, flags=re.S)
            html = re.sub(r'<dialog\b.*?</dialog>', '', html, flags=re.S)
            # Keep the project's own ending/footer, not the gallery's extra footer.
            head, tail = html.split('</main>', 1)
            tail = re.sub(r'<footer\b.*?</footer>', '', tail, flags=re.S)
            html = head + '</main>' + tail
            html = html.replace('class="about-page work-page"', 'class="about-page work-page case-page"')
            html = re.sub(r'<script[^>]+src="[^"]*/(?:work|studio-gallery)\.js[^>]*></script>', '', html)
            html = re.sub(r'(<video\b[^>]*?)\sautoplay\b', r'\1 controls', html)
            # Standalone pages use native, user-initiated video controls, including
            # without JavaScript and with reduced motion. The gallery owns its
            # separate autoplay lifecycle and must remain unchanged.
            html = re.sub(r'(<source\b[^>]*?)data-src=', r'\1src=', html)
            html = re.sub(r'(<video\b[^>]*?)data-poster=', r'\1poster=', html)
            html = re.sub(r'(<figure class="work-detail-hero"[^>]*><img\b[^>]*?)loading="lazy"', r'\1loading="eager" fetchpriority="high"', html)
            html = re.sub(r'<video\b([^>]*)>', lambda m: '<video' + re.sub(r'\s(?:tabindex|role|aria-pressed)="[^"]*"', '', m[1]) + '>', html)
            html = re.sub(r'<img class="work-video-poster"[^>]*>', '', html)
            # Absolute, locale-correct links prevent nested routes breaking assets.
            root_url = BASE + '/' + prefix + 'work/'
            def resolve(m):
                value = unescape(m[2])
                if value.startswith(('http:', 'https:', 'mailto:', 'data:', '#')): return m[0]
                return m[1] + urljoin(root_url, value).removeprefix(BASE) + m[3]
            html = re.sub(r'((?:href|src|poster|data-src)=")([^"]+)(")', resolve, html)
            html = re.sub(r'srcset="([^"]+)"', lambda m: 'srcset="' + ', '.join(urljoin(root_url, v.strip().split()[0]).removeprefix(BASE) + ' ' + ' '.join(v.strip().split()[1:]) for v in m[1].split(',')) + '"', html)
            for old, (other_slug, _) in PROJECTS.items():
                html = html.replace('href="#' + old + '"', 'href="/' + prefix + 'work/' + other_slug + '/"')
            html = re.sub(r'<a\b[^>]*hreflang="(en|ja)"[^>]*>', lambda m: re.sub(r'href="[^"]*"', 'href="' + ('/ja/' if m[1] == 'ja' else '/') + route + '"', m[0]), html)
            html = re.sub(r'(<a\b[^>]*data-work-nav) aria-current="page"', r'\1', html)
            overview = unescape(re.sub(r'<[^>]+>', '', re.search(r'<p class="work-description">(.*?)</p>', detail, re.S)[1]))
            title = name + (' — ブランド・ウェブデザイン | 2D1' if lang == 'ja' else ' — Brand Identity & Web Design | 2D1')
            image = BASE + re.search(r'<figure class="work-detail-hero"[^>]*><img src="([^"]+)"', html)[1]
            schema = graph(route, lang, title, overview, 'WebPage')
            address = BASE + '/' + prefix + route
            schema['@graph'][-1]['mainEntity'] = {'@id': address + '#project'}
            schema['@graph'].append({'@type': 'CreativeWork', '@id': address + '#project', 'name': name,
                'description': overview, 'url': address, 'image': image, 'inLanguage': lang,
                'creator': {'@id': BASE + '/#organization'}})
            schema['@graph'].append({'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': '2D1', 'item': BASE + '/' + prefix},
                {'@type': 'ListItem', 'position': 2, 'name': 'Studio', 'item': BASE + '/' + prefix + 'work/'},
                {'@type': 'ListItem', 'position': 3, 'name': name, 'item': address}]})
            html = metadata(html, route, lang, title, overview, schema, image)
            # project-page.css is inherited from the Studio source.
            path = ROOT / prefix / route / 'index.html'
            path.parent.mkdir(parents=True, exist_ok=True); path.write_text(html)
    print('Studio SEO: shared metadata and six bilingual project entry pages; nothing published.')

if __name__ == '__main__':
    build_site_seo()
