"""Build collection metadata, legacy object redirects, and the bilingual sitemap."""
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
                              'url': url(COLLECTION, lang)+'?item='+i['id']} for n, i in enumerate(items, 1)]}
    ]}


def build_discovery():
    items = load()
    # Retired detail pages redirect into the unified collection modal.
    for lang in ['en', 'ja']:
        for item in items:
            destination=url(COLLECTION, lang).replace(BASE, '')+'?item='+item['id']
            path=ROOT / (('ja/' if lang=='ja' else '')+item_route(item)+'index.html')
            path.parent.mkdir(parents=True, exist_ok=True)
            label='Familiar Charactersで見る' if lang=='ja' else 'Open in Familiar Characters'
            path.write_text(f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url={escape(destination)}"><link rel="canonical" href="{url(COLLECTION,lang)}"><title>Familiar Characters by 2D1</title></head><body><a href="{escape(destination)}">{label}</a></body></html>')

    # Canonical current routes only; no query filters, redirects, fake lastmod,
    # priority or changefreq. Include both languages and reciprocal alternates.
    ns, xhtml, image_ns = 'http://www.sitemaps.org/schemas/sitemap/0.9', 'http://www.w3.org/1999/xhtml', 'http://www.google.com/schemas/sitemap-image/1.1'
    ET.register_namespace('', ns); ET.register_namespace('xhtml', xhtml); ET.register_namespace('image', image_ns)
    sitemap = ET.Element('{' + ns + '}urlset')
    routes = [(r, l, None) for r in ['', 'about/', 'work/', 'shop/', COLLECTION, 'contact/', 'red-pixel/', 'privacy/', 'legal/'] + ['work/' + slug + '/' for slug, _ in PROJECTS.values()] for l in ['en', 'ja']]
    for route, lang, item in routes:
        entry = ET.SubElement(sitemap, '{' + ns + '}url')
        ET.SubElement(entry, '{' + ns + '}loc').text = url(route, lang)
        for code in ['en', 'ja', 'x-default']:
            ET.SubElement(entry, '{' + xhtml + '}link', rel='alternate', hreflang=code, href=url(route, 'ja' if code == 'ja' else 'en'))
    ET.indent(sitemap, space='  ')
    ET.ElementTree(sitemap).write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    print(f'Discovery: {len(items)*2} legacy redirects; {len(routes)} canonical sitemap URLs')


if __name__ == '__main__':
    build_discovery()
