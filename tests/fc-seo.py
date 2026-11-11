"""Check discovery SEO integrity against the catalog, both locales and sitemap.

Usage: python3 tests/fc-seo.py [dist]
This validates generated output, not rankings or rich-result eligibility.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, parse_qs
from urllib.robotparser import RobotFileParser
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
site = ROOT / sys.argv[1] if len(sys.argv) > 1 else ROOT
preview = site != ROOT
BASE = 'https://2d1.studio'
items = json.loads((ROOT / 'data/objects.json').read_text())
translations = json.loads((ROOT / 'locales/ja.json').read_text())

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(); self.meta={};self.links=[];self.anchors=[];self.schemas=[];self.raw=None;self.h1=0;self.title='';self.in_title=False
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='h1':self.h1+=1
        if tag=='meta':self.meta[a.get('name') or a.get('property')]=a.get('content')
        if tag=='link':self.links.append(a)
        if tag=='a':self.anchors.append(a.get('href',''))
        if tag=='script' and a.get('type')=='application/ld+json':self.raw=''
        if tag=='title':self.in_title=True
    def handle_data(self, data):
        if self.raw is not None:self.raw+=data
        if self.in_title:self.title+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.raw is not None:self.schemas.append(json.loads(self.raw));self.raw=None
        if tag=='title':self.in_title=False

ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}
sitemap=ET.parse(site/'sitemap.xml')
entries=sitemap.findall('s:url',ns)
locations=[entry.find('s:loc',ns).text for entry in entries]
assert len(locations)==len(set(locations))==23
assert not any('/finds/' in u or '/objects/' in u or '/browse/' in u or '?' in u or '#' in u for u in locations)
assert not (site/'familiarcharacters/browse').exists()
assert not (site/'ja/familiarcharacters/browse').exists()
seen_titles=set()
for address in locations:
    path=urlsplit(address).path
    p=Page((site/path.lstrip('/')/'index.html').read_text())
    canonical=[x['href'] for x in p.links if x.get('rel')=='canonical']
    assert canonical==[address],(path,canonical)
    alternatives={x['hreflang']:x['href'] for x in p.links if x.get('rel')=='alternate' and x.get('hreflang')}
    expected={'en':BASE+path.replace('/ja/','/',1),'ja':BASE+('/ja'+path if not path.startswith('/ja/') else path),'x-default':BASE+path.replace('/ja/','/',1)}
    assert alternatives==({} if path == "/familiarcharacters/" else expected),(path,alternatives)
    if 'familiarcharacters/' not in path:continue
    assert p.h1==1,(path,'H1 count',p.h1)
    assert p.meta['og:url']==address
    assert p.meta['og:title']==p.title
    assert p.meta['twitter:card']=='summary_large_image'
    assert 'noindex' in p.meta['robots'] if preview else 'noindex' not in p.meta['robots']
    lang='ja' if path.startswith('/ja/') else 'en'
    # Brand-only titles may intentionally match across hreflang alternatives.
    assert (lang,p.title) not in seen_titles,(path,'duplicate title within locale');seen_titles.add((lang,p.title))
    assert p.meta['og:locale']==('ja_JP' if lang=='ja' else 'en_US')
    assert len(p.schemas)==1,(path,'schema count')
    graph=p.schemas[0]['@graph']
    webpage=next(x for x in graph if x['@type'] in ['WebPage','CollectionPage'])
    assert webpage['url']==address and webpage['inLanguage']==lang
    listing=next(x for x in graph if x['@type']=='ItemList')
    assert listing['numberOfItems']==len(listing['itemListElement'])
    assert len({x['url'] for x in listing['itemListElement']})==listing['numberOfItems']
    assert {parse_qs(urlsplit(x['url']).query)['item'][0] for x in listing['itemListElement']}=={i['id'] for i in items}
    assert all(x['url'].split('?')[0]==address for x in listing['itemListElement'])
    for href in p.anchors:
        assert '/browse/' not in href and not href.startswith('browse/'), (path, href)
        u=urlsplit(href)
        if u.netloc==urlsplit(BASE).netloc or href.startswith('/'):
            target=u.path
            assert (site/target.lstrip('/')).exists(),(path,href)
for lang in ['en','ja']:
    prefix='/ja' if lang=='ja' else ''
    for item in items:
        raw=(site/f"{prefix.lstrip('/')+'/' if prefix else ''}familiarcharacters/items/{item['id']}/index.html").read_text()
        p=Page(raw)
        assert 'noindex' in p.meta['robots'].split(', ')
        assert p.anchors==[f"/familiarcharacters/?item={item['id']}"]
        assert 'http-equiv="refresh"' in raw and not p.schemas
raw=(site/'familiarcharacters/index.html').read_text()
assert 'objects-similar-grid' in raw
assert not any(x in raw for x in ['objects-dialog-permalink','object-permalink','objects-product-peek','objects-product-arrows'])
for entry in entries:
    address=entry.find('s:loc',ns).text
    assert len(entry.findall('x:link',ns))==(0 if address == BASE+'/familiarcharacters/' else 3)
robots=RobotFileParser();robots.parse((site/'robots.txt').read_text().splitlines())
for bot in ['Googlebot','bingbot','OAI-SearchBot','PerplexityBot']:
    assert robots.can_fetch(bot,BASE+'/familiarcharacters/') is not preview
    if not preview:assert not robots.can_fetch(bot,BASE+'/tmp/private-preview.html')
if preview:
    assert 'X-Robots-Tag: noindex, nofollow' in (site/'_headers').read_text()
print(f'PASS SEO: {len(locations)} canonical URLs; EN/JA alternates, unique discovery titles, catalog/schema agreement, source citations, links and crawl policy' + ('; private package stays noindex.' if preview else '.'))
