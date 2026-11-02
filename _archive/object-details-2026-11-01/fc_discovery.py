"""Build crawlable, bilingual discovery routes from the existing curated catalog.

No fabricated reviews, offers, stock, prices, or publication dates. The canvas
remains the primary experience; these are ordinary human-readable entry pages.
"""
from pathlib import Path
from html import escape
import json
import re
import xml.etree.ElementTree as ET
from site_seo import organization, PROJECTS

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://2d1.studio'
COLLECTION = 'familiarcharacters/'
TITLE = 'Familiar Characters by 2D1'
DESCRIPTION = 'Discover hand-picked design objects and everyday goods for your home, kitchen, workspace, and everyday carry. A curated collection by Kosuke at 2D1.'
CATEGORIES = {
    'home': ('Design objects for the home', '暮らしを彩るデザイン雑貨',
             'Furniture, lighting, clocks, toys, and decorative objects with a clear point of view. Explore everyday companions for the spaces you live in.',
             '家具、照明、時計、おもちゃ、オブジェ。明確な個性を持ち、暮らしの空間になじんでいくものを集めました。'),
    'kitchen': ('Well-designed kitchenware', 'デザインのあるキッチン用品',
                'Coffee makers, mills, bottles, tableware, and small kitchen tools. Useful objects with character for cooking, serving, and everyday rituals.',
                'コーヒーメーカー、ミル、ボトル、食器、キッチンツール。料理や食卓、毎日の習慣に寄り添う、実用性と個性のあるもの。'),
    'workspace': ('Objects for your workspace', '仕事場のデザイン雑貨',
                  'Stationery, desk accessories, electronics, and digital tools. A hand-picked selection of things to use, look at, and keep within reach while you work.',
                  '文房具、デスク小物、電子機器、デジタルツール。仕事中に使い、眺め、手の届くところに置いておきたいものを選びました。'),
    'everyday-carry': ('Everyday carry & accessories', '毎日持ち歩くもの',
                      'Bags, pouches, clothing, and personal accessories with character. Explore useful companions for the things you take with you.',
                      'バッグ、ポーチ、服、身の回りの小物。持ち歩くものにも個性を。毎日に連れ出したいものを集めました。'),
}
CATEGORY_MAP = {'living': 'home', 'home': 'home', 'kitchen': 'kitchen', 'work': 'workspace', 'wear': 'everyday-carry'}


def load():
    items = json.loads((ROOT / 'data/objects.json').read_text())
    assert len({i['id'] for i in items}) == len(items)
    assert all(re.fullmatch(r'[a-z0-9-]+', i['id']) for i in items)
    assert all(i['category'] in CATEGORY_MAP for i in items)
    return items


def url(route, lang='en'):
    return BASE + ('/ja/' if lang == 'ja' else '/') + route


def item_route(item):
    return COLLECTION + 'items/' + item['id'] + '/'


def structured(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')


def collection_schema(items, lang='en', route=COLLECTION, title=TITLE, description=DESCRIPTION):
    address = url(route, lang)
    return {'@context': 'https://schema.org', '@graph': [
        organization(),
        {'@type': 'Person', '@id': 'https://kosuke.com/#person', 'name': 'Kosuke Futsukaichi', 'url': 'https://kosuke.com/'},
        {'@type': 'WebSite', '@id': BASE + '/#website', 'name': '2D1', 'url': BASE + '/', 'inLanguage': ['en', 'ja']},
        {'@type': 'CollectionPage', '@id': address + '#page', 'url': address, 'name': title,
         'description': description, 'inLanguage': lang, 'isPartOf': {'@id': BASE + '/#website'},
         'publisher': {'@id': BASE + '/#organization'}, 'author': {'@id': 'https://kosuke.com/#person'},
         'mainEntity': {'@id': address + '#collection'}},
        {'@type': 'ItemList', '@id': address + '#collection', 'name': title, 'numberOfItems': len(items),
         'itemListOrder': 'https://schema.org/ItemListUnordered',
         'itemListElement': [{'@type': 'ListItem', 'position': n, 'name': i['brand'] + ' ' + i['name'],
                              'url': url(item_route(i), lang)} for n, i in enumerate(items, 1)]}
    ]}


def build_discovery():
    items = load()
    translations = json.loads((ROOT / 'locales/ja.json').read_text())
    delivery = json.loads((ROOT / 'data/finds-images.json').read_text())
    generated = []

    def tr(value, lang):
        return translations.get(value, value) if lang == 'ja' else value

    def text(en, ja, lang):
        return ja if lang == 'ja' else en

    def primary(item):
        variants = delivery.get(item['image'], []) or item.get('imageVariants', [])
        suitable = sorted((v for v in variants if v['width'] >= 960), key=lambda v: v['width'])
        return suitable[0]['image'] if suitable else item['image']

    reading = 'min(960px, calc(100vw - min(27.7778vw, 400px) - 128px))'
    primary_sizes = f'(min-width: 1100px) calc(({reading} - 40px) / 2), (min-width: 768px) calc((min(960px, calc(100vw - 48px)) - 40px) / 2), calc(100vw - 48px)'
    gallery_sizes = f'(min-width: 1100px) calc(({reading} - 24px) / 2), (min-width: 768px) calc((min(960px, calc(100vw - 48px)) - 24px) / 2), calc((100vw - 64px) / 2)'
    card_sizes = f'(min-width: 1100px) calc(({reading} - 48px) / 3), (min-width: 768px) calc((min(960px, calc(100vw - 48px)) - 24px) / 2), (min-width: 360px) calc((100vw - 64px) / 2), calc(100vw - 48px)'

    def variants_for(item):
        variants={v['width']:v for v in item.get('imageVariants', [])}
        variants.update({v['width']:v for v in delivery.get(item['image'], [])})
        return sorted(variants.values(),key=lambda v:v['width'])

    def photo(src, alt, lang, eager=False, variants=None, sizes=primary_sizes):
        variants = variants or delivery.get(src, [])
        srcset = ' srcset="' + escape(', '.join('/' + v['image'] + ' ' + str(v['width']) + 'w' for v in variants)) + '" sizes="' + sizes + '"' if variants else ''
        return f'<img src="/{escape(src)}"{srcset} alt="{escape(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"' + (' fetchpriority="high"' if eager else '') + ' width="960" height="960">'

    def category_name(item, lang):
        c = CATEGORIES[CATEGORY_MAP[item['category']]]
        return c[1] if lang == 'ja' else c[0]

    def cards(selection, lang):
        output = []
        for n, item in enumerate(selection):
            address = url(item_route(item), lang).replace(BASE, '')
            name = item['name']
            alt = text(name + ' by ' + item['brand'], item['brand'] + 'の' + name, lang)
            output.append(f'<li><article class="discovery-card"><a href="{address}">' + photo(primary(item), alt, lang, variants=variants_for(item), sizes=card_sizes) +
                f'<p class="discovery-brand" translate="no">{escape(item["brand"])}</p><h2 translate="no">{escape(name)}</h2></a>' +
                f'<p>{escape(tr(item["description"], lang))}</p></article></li>')
        return '<ul class="discovery-grid">' + ''.join(output) + '</ul>'

    def breadcrumbs(entries, lang, address):
        links = '<nav class="discovery-breadcrumbs" aria-label="' + text('Breadcrumb', 'パンくずリスト', lang) + '"><ol>'
        elements = []
        for n, (label, route) in enumerate(entries, 1):
            dest = url(route, lang)
            links += '<li>' + (f'<a href="{dest.replace(BASE, "")}">{escape(label)}</a>' if n != len(entries) else f'<span aria-current="page">{escape(label)}</span>') + '</li>'
            elements.append({'@type': 'ListItem', 'position': n, 'name': label, 'item': dest})
        return links + '</ol></nav>', {'@type': 'BreadcrumbList', '@id': address + '#breadcrumbs', 'itemListElement': elements}

    def write(route, lang, title, description, body, schema, image=None, image_alt=None, crumbs=None):
        address = url(route, lang)
        img = BASE + '/' + (primary(image) if image else 'img/brand/2d1-social.png')
        alt = image_alt or 'Familiar Characters by 2D1'
        if crumbs:
            trail, crumb = breadcrumbs(crumbs, lang, address)
            body = trail + body
            schema['@graph'].append(crumb)
            page = next(n for n in schema['@graph'] if n['@type'] in ('CollectionPage', 'WebPage'))
            page['breadcrumb'] = {'@id': address + '#breadcrumbs'}
        language = ''.join(f'<a href="{url(route, code).replace(BASE, "")}" hreflang="{code}" lang="{code}"' + (' aria-current="page"' if code == lang else '') + f'>{code.upper()}</a>' for code in ['en', 'ja'])
        html = f'''<!doctype html>
<html lang="{lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description)}">
<meta name="robots" content="index, follow, max-image-preview:large"><meta name="theme-color" content="#FAF0E6">
<link rel="canonical" href="{address}">
<link rel="alternate" hreflang="en" href="{url(route)}"><link rel="alternate" hreflang="ja" href="{url(route, 'ja')}"><link rel="alternate" hreflang="x-default" href="{url(route)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="2D1"><meta property="og:locale" content="{'ja_JP' if lang == 'ja' else 'en_US'}"><meta property="og:locale:alternate" content="{'en_US' if lang == 'ja' else 'ja_JP'}">
<meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(description)}"><meta property="og:url" content="{address}"><meta property="og:image" content="{img}"><meta property="og:image:alt" content="{escape(alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(title)}"><meta name="twitter:description" content="{escape(description)}"><meta name="twitter:image" content="{img}"><meta name="twitter:image:alt" content="{escape(alt)}">
<link rel="icon" href="/img/brand/2d1-icon.svg?v=3" type="image/svg+xml"><link rel="apple-touch-icon" href="/img/brand/2d1-apple-touch.png?v=3">
<link rel="stylesheet" href="/css/fonts.css?v=9">{('<link rel="stylesheet" href="/css/japanese-font.css?v=4">' if lang == 'ja' else '')}
<link rel="stylesheet" href="/css/walla.css?v=102"><link rel="stylesheet" href="/css/fc-discovery.css?v=1"><link rel="stylesheet" href="/css/typography.css?v=33">
<script type="application/ld+json">{structured(schema)}</script><script src="/js/analytics.js?v=1" defer></script>
</head><body class="discovery-page">
<a class="skip-link" href="#main">{text('Skip to content', '本文へスキップ', lang)}</a>
<header class="discovery-shell discovery-header"><a class="discovery-logo" href="{'/ja/' if lang == 'ja' else '/'}" aria-label="{text('2D1, home', '2D1 ホーム', lang)}"><img src="/img/brand/logo_red.svg?v=2" width="829" height="280" alt="2D1"></a><nav aria-label="{text('Navigation', 'ナビゲーション', lang)}"><a href="{url(COLLECTION, lang).replace(BASE, '')}">{text('Explore canvas', 'キャンバスを見る', lang)}</a></nav><nav class="discovery-language" aria-label="{text('Language', '言語', lang)}">{language}</nav></header>
<main id="main" class="discovery-shell">{body}</main>
<footer class="discovery-shell discovery-footer"><p><a href="{url('privacy/', lang).replace(BASE, '')}">{text('Privacy', 'プライバシー', lang)}</a> · <a href="{url('legal/', lang).replace(BASE, '')}">{text('Legal', '法的事項', lang)}</a> · Familiar Characters · <a href="{url('about/', lang).replace(BASE, '')}">{text('Selected by Kosuke at 2D1', '2D1の二日一宏祐によるセレクション', lang)}</a></p><a href="{url(COLLECTION, lang).replace(BASE, '')}">{text('Explore the collection', 'コレクションを見る', lang)}</a></footer>
</body></html>'''
        path = ROOT / (('ja/' if lang == 'ja' else '') + route + 'index.html')
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(html)
        generated.append((route, lang, image))

    for lang in ['en', 'ja']:
        for item in items:
            route = item_route(item)
            title = item['brand'] + ' ' + item['name'] + text(' | Familiar Characters', '｜Familiar Charactersのセレクション', lang)
            description = tr(item['description'], lang)
            alt = text(item['name'] + ' by ' + item['brand'], item['brand'] + 'の' + item['name'], lang)
            related = sorted((i for i in items if i['id'] != item['id']), key=lambda i: (-(len(set(i['tags']) & set(item['tags'])) * 3 + (i['brand'] == item['brand']) * 2 + (i['category'] == item['category'])), i['name']))[:4]
            images = [dict(image=item['image'], sourceUrl=item['sourceUrl'])] + item.get('gallery', [])
            unique = list({p['image']: p for p in images}.values())
            gallery = ''
            primary_figure = ''
            for n, p in enumerate(unique):
                src = primary(item) if n == 0 else p['image']
                figure = '<figure' + (' class="discovery-primary"' if n == 0 else '') + '>' + photo(src, alt + (f' ({n + 1}/{len(unique)})' if n else ''), lang, eager=n == 0, variants=variants_for(item) if n == 0 else None, sizes=primary_sizes if n == 0 else gallery_sizes) + '<figcaption><a href="' + escape(p['sourceUrl']) + '" rel="noopener noreferrer" target="_blank">' + text('Image source', '画像の出典', lang) + '</a></figcaption></figure>'
                if n == 0: primary_figure = figure
                else: gallery += figure
            facts = '<dl class="discovery-facts"><dt>' + text('Brand', 'ブランド', lang) + '</dt><dd translate="no">' + escape(item['brand']) + '</dd><dt>' + text('Category', 'カテゴリー', lang) + '</dt><dd>' + category_name(item, lang) + '</dd><dt>' + text('Filed under', '分類', lang) + '</dt><dd>' + escape(', '.join(tr(tag, lang) for tag in item['tags'])) + '</dd></dl>'
            external = item.get('productUrl') or ''
            available = item.get('forSale', True) and bool(external)
            action = ('<a class="discovery-product-link" href="' + escape(external) + '" target="_blank" rel="noopener noreferrer">' + text('Visit product page', '商品ページを見る', lang) + ' ↗</a>') if available else '<p class="discovery-note">' + text('No purchase link is listed for this object.', 'このアイテムの購入リンクは掲載していません。', lang) + '</p>'
            note = text('Selected for Familiar Characters by Kosuke at 2D1. This is a curated find, not a product sold by 2D1. Check the linked site for current product details and availability.', '2D1の二日一宏祐が選んだアイテムです。2D1が販売する商品ではありません。最新の仕様や販売状況はリンク先でご確認ください。', lang)
            body = '<div class="discovery-product"><header class="discovery-product-heading"><p class="discovery-brand" translate="no">' + escape(item['brand']) + '</p><h1 translate="no">' + escape(item['name']) + '</h1></header>' + primary_figure + '<div class="discovery-product-copy"><p class="discovery-description">' + escape(description) + '</p>' + facts + action + '<p class="discovery-note">' + escape(note) + '</p></div></div><div class="discovery-gallery">' + gallery + '</div>'
            body += '<section class="discovery-related"><h2>' + text('More things with character.', 'ほかにも、個性のあるもの。', lang) + '</h2>' + cards(related, lang) + '</section>'
            address = url(route, lang)
            schema = collection_schema([], lang, route, title, description)
            schema['@graph'] = [n for n in schema['@graph'] if n['@type'] != 'ItemList']
            page = next(n for n in schema['@graph'] if n['@type'] == 'CollectionPage')
            page.update({'@type': 'WebPage', 'mainEntity': {'@id': address + '#product'}, 'citation': list(dict.fromkeys(p['sourceUrl'] for p in unique))})
            schema['@graph'].append({'@type': 'Product', '@id': address + '#product', 'name': item['name'], 'url': address, 'brand': {'@type': 'Brand', 'name': item['brand']}, 'description': description, 'category': category_name(item, lang), 'image': [BASE + '/' + (primary(item) if n == 0 else p['image']) for n, p in enumerate(unique)]})
            write(route, lang, title, description, body, schema, image=item, image_alt=alt, crumbs=[('Familiar Characters', COLLECTION), (item['name'], route)])

    # Canonical current routes only; no query filters, redirects, fake lastmod,
    # priority or changefreq. Include both languages and reciprocal alternates.
    ns, xhtml, image_ns = 'http://www.sitemaps.org/schemas/sitemap/0.9', 'http://www.w3.org/1999/xhtml', 'http://www.google.com/schemas/sitemap-image/1.1'
    ET.register_namespace('', ns); ET.register_namespace('xhtml', xhtml); ET.register_namespace('image', image_ns)
    sitemap = ET.Element('{' + ns + '}urlset')
    routes = [(r, l, None) for r in ['', 'about/', 'work/', 'shop/', COLLECTION, 'contact/', 'red-pixel/', 'privacy/', 'legal/'] + ['work/' + slug + '/' for slug, _ in PROJECTS.values()] for l in ['en', 'ja']] + generated
    for route, lang, item in routes:
        entry = ET.SubElement(sitemap, '{' + ns + '}url')
        ET.SubElement(entry, '{' + ns + '}loc').text = url(route, lang)
        for code in ['en', 'ja', 'x-default']:
            ET.SubElement(entry, '{' + xhtml + '}link', rel='alternate', hreflang=code, href=url(route, 'ja' if code == 'ja' else 'en'))
        if item:
            image = ET.SubElement(entry, '{' + image_ns + '}image')
            ET.SubElement(image, '{' + image_ns + '}loc').text = BASE + '/' + primary(item)
    ET.indent(sitemap, space='  ')
    ET.ElementTree(sitemap).write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    print(f'Discovery: {len(generated)} generated EN/JA pages; {len(routes)} canonical sitemap URLs')


if __name__ == '__main__':
    build_discovery()
