"""Check bilingual launch pages, graph identity, media and nested-route links."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote
import json
import re
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
from site_seo import ROOT, BASE, PAGES, PROJECTS

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.tags=[]; self.feed(source)
    def handle_starttag(self, tag, attrs): self.tags.append((tag, dict(attrs)))

count=0
for lang in ['en', 'ja']:
    prefix='ja/' if lang=='ja' else ''
    for route in list(PAGES) + ['work/'+p[0]+'/' for p in PROJECTS.values()]:
        path=ROOT/prefix/route/'index.html'; html=path.read_text(); p=Page(html)
        address=BASE+'/'+prefix+route
        metas={a.get('name',a.get('property')):a.get('content') for t,a in p.tags if t=='meta'}
        assert metas['og:url']==address
        assert metas['og:locale']==('ja_JP' if lang=='ja' else 'en_US')
        assert metas['robots']=='index, follow, max-image-preview:large'
        assert len([1 for t,a in p.tags if t=='h1'])==1, path
        assert [(a['href']) for t,a in p.tags if t=='link' and a.get('rel')=='canonical']==[address]
        graphs=re.findall(r'<script type="application/ld\+json">(.*?)</script>',html,re.S)
        assert len(graphs)==1
        graph=json.loads(graphs[0])['@graph']
        org=next(g for g in graph if g['@type']=='Organization')
        assert org['@id']==BASE+'/#organization'
        assert [a['name'] for a in org['areaServed']]==['Japan','North America']
        assert not any(k in org for k in ['address','aggregateRating','review'])
        for tag,attrs in p.tags:
            for attr in ['href','src','poster']:
                value=attrs.get(attr,'')
                if not value or value.startswith(('#','data:','mailto:')): continue
                target=urlsplit(urljoin(address,value))
                if target.netloc!='2d1.studio':continue
                local=ROOT/unquote(target.path.lstrip('/'))
                assert local.exists(), (path,attr,value)
        if route.count('/')==2:
            assert 'case-page' in html and 'id="work-dialog"' not in html
            assert not re.search(r'src="[^"]*/work.js',html)
            assert 'View project page</a>' not in html
            assert not re.search(r'<source[^>]*data-src=',html)
            for t,a in p.tags:
                if t=='video': assert 'controls' in a and 'autoplay' not in a
                if t=='a' and a.get('hreflang') in ['en','ja']:
                    assert a['href']==('/ja/' if a['hreflang']=='ja' else '/')+route
            project=next(g for g in graph if g['@type']=='CreativeWork')
            assert project['description'] in re.sub('<[^>]+>','',html)
        count+=1
assert 'noindex' in (ROOT/'scripts/preview.py').read_text()
assert 'noindex' in (ROOT/'scripts/build-preview.py').read_text()
print(f'PASS: {count} launch pages; canonical identity, bilingual links, schema, local references, native video and private preview protection.')
