"""Regenerate committed Japanese pages from English HTML and locales/ja.json.
Development helper only: deployment and preview need no build or dependencies.
"""
from html.parser import HTMLParser
from html import escape, unescape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
TRANSLATIONS = {key.strip(): value for key, value in json.loads((ROOT / 'locales/ja.json').read_text()).items()}
ATTRS = {'alt', 'aria-label', 'placeholder', 'title', 'content'}
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

def translate(value):
    key = value.strip()
    if key in TRANSLATIONS: return TRANSLATIONS[key]
    count = re.fullmatch(r'(\d+) objects', key)
    if count: return count[1] + '点'
    return value

class JapanesePage(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=False)
        self.about = bool(path)
        self.path = path
        self.english = 'https://2d1.studio/' + self.path
        self.japanese = 'https://2d1.studio/ja/' + self.path
        self.output = []
        self.stack = []
        self.raw = None
    def handle_decl(self, decl): self.output.append('<!' + decl + '>')
    def handle_comment(self, text): self.output.append('<!--' + text + '-->')
    def handle_entityref(self, name): self.output.append('&' + name + ';')
    def handle_charref(self, name): self.output.append('&#' + name + ';')
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        # Japanese pages do not preload an unused Latin font.
        if tag == 'link' and a.get('rel') == 'preload' and a.get('as') == 'font': return
        if tag == 'html': a['lang'] = 'ja'
        if a.get('id') in ('about-2d1', 'about-me'):
            a.pop('translate', None)
            a.pop('lang', None)
        for key in ATTRS & a.keys():
            if a[key]:
                a[key] = translate(a[key])
                if key == 'alt' and ' by ' in a[key]:
                    product, brand = a[key].rsplit(' by ', 1)
                    photo = re.fullmatch(r'(.+?)( \(\d+/\d+\))?', brand)
                    a[key] = f'{photo[1]}の{product}{photo[2] or ""}'
        for key in ['href','src','poster','data-src','data-poster']:
            val = a.get(key, '')
            if val.startswith(('css/','js/','fonts/','img/','../css/','../js/','../fonts/','../img/')):
                a[key] = '../' + val.replace('canvas-start-en.jpg', 'canvas-start-ja.jpg')
        if a.get('srcset'):
            a['srcset'] = ', '.join(
                '../' + candidate.strip() if candidate.strip().startswith(('img/', '../img/')) else candidate.strip()
                for candidate in a['srcset'].split(',')
            )
        if tag == 'link' and a.get('rel') == 'canonical': a['href'] = self.japanese
        if tag == 'meta' and a.get('property') == 'og:url': a['content'] = self.japanese
        if tag == 'meta' and a.get('property') == 'og:locale': a['content'] = 'ja_JP'
        if tag == 'meta' and a.get('property') == 'og:locale:alternate': a['content'] = 'en_US'
        if tag == 'nav' and a.get('class') == 'language-switch': a['aria-label'] = '言語'
        if tag == 'a' and a.get('hreflang') in ('en','ja'):
            if a['hreflang'] == 'en':
                a['href'] = ('../../' if self.about else '../') + self.path
                a.pop('aria-current',None)
            else: a['href'] = './'; a['aria-current'] = 'page'
        if tag == 'script' and 'js/language.js' in a.get('src',''):
            prefix = '../../' if self.about else '../'
            dictionary = 'ja-' + ('objects' if self.path == 'familiarcharacters/' else self.path.strip('/') or 'home') + '.js?v=1'
            self.output.append(f'<script src="{prefix}js/{dictionary}" defer></script>\n  ')
        self.output.append('<' + tag + ''.join(' '+k if v is None else ' '+k+'="'+escape(v,quote=True)+'"' for k,v in a.items()) + '>')
        if tag == 'link' and 'css/fonts.css' in a.get('href',''):
            prefix = '../../' if self.about else '../'
            self.output.append(f'\n  <link rel="stylesheet" href="{prefix}css/japanese-font.css?v=4">')
        if tag not in VOID: self.stack.append((tag,a))
        if tag in ('script','style'): self.raw = (tag,a)
    def handle_endtag(self, tag):
        self.output.append('</'+tag+'>')
        if self.stack and self.stack[-1][0] == tag: self.stack.pop()
        if self.raw and self.raw[0] == tag: self.raw = None
    def handle_data(self, data):
        if self.raw:
            if self.raw[1].get('type') == 'application/ld+json':
                def localized(value):
                    if isinstance(value,dict): return {k:('ja' if k == 'inLanguage' and v == 'en' else localized(v)) for k,v in value.items()}
                    if isinstance(value,list): return [localized(v) for v in value]
                    if isinstance(value,str): return value.replace('https://2d1.studio/familiarcharacters/', 'https://2d1.studio/ja/familiarcharacters/', 1) if value.startswith('https://2d1.studio/familiarcharacters/') else (self.japanese if value == self.english else translate(value))
                    return value
                data = json.dumps(localized(json.loads(data)),ensure_ascii=False)
            self.output.append(data)
        elif any(a.get('translate') == 'no' for _, a in self.stack):
            self.output.append(escape(data, quote=False))
        elif data.strip() == '.' and any('privacy-controller' in a.get('class','') for _,a in self.stack):
            self.output.append('までご連絡ください。')
        elif data.strip() == '.' and any('privacy-analytics' in a.get('class','') for _,a in self.stack):
            self.output.append('をご覧ください。')
        elif data.strip() == '.' and any('contact-privacy' in a.get('class','') for _,a in self.stack):
            self.output.append('をご確認ください。')
        elif data.strip() == '.' and any('contact-done-title' in a.get('class','') for _,a in self.stack):
            self.output.append('。')
        elif data.strip() == '.' and any('about-opening' in a.get('class','') for _,a in self.stack):
            self.output.append('」。その3つに取り組む場所です。')
        elif data.strip() == '.' and any('essay-lede' in a.get('class','') for _,a in self.stack):
            self.output.append('になれることを願って。')
        else: self.output.append(escape(translate(data),quote=False))

for path in ['', 'about/', 'familiarcharacters/', 'contact/', 'work/', 'red-pixel/', 'shop/', 'privacy/', 'legal/']:
    source = ROOT / (path + 'index.html')
    destination = ROOT / ('ja/' + path + 'index.html')
    parser = JapanesePage(path)
    parser.feed(source.read_text())
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(''.join(parser.output))
    print(destination.relative_to(ROOT))
(ROOT/'js/ja.js').write_text('/* Generated from locales/ja.json by scripts/build-japanese.py. */\nwindow.TWO_D_ONE_JA = '+json.dumps(TRANSLATIONS,ensure_ascii=False,indent=2)+';\n')


# Retain the exact vocabulary each page can render dynamically. The full legacy
# dictionary stays generated for compatibility; active pages receive their own.
class RuntimeScripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag == 'script' and a.get('src','').startswith(('js/','../js/')):
            self.scripts.append(a['src'].split('?',1)[0].split('/')[-1])

for path in ['', 'about/', 'familiarcharacters/', 'contact/', 'work/', 'shop/', 'privacy/', 'legal/']:
    html=(ROOT/(path+'index.html')).read_text()
    parser=RuntimeScripts();parser.feed(html)
    if 'language.js' not in parser.scripts:continue
    pending=list(parser.scripts);visited=set();sources=[unescape(html)]
    while pending:
        name=pending.pop()
        if name in visited:continue
        visited.add(name)
        source=(ROOT/'js'/name).read_text();sources.append(source)
        pending.extend(re.findall(r"['\"]\./([\w.-]+\.js)(?:\?[^'\"]*)?['\"]",source))
    haystack='\n'.join(sources).replace("\\'", "'").replace('\\"','"')
    selected={key:value for key,value in TRANSLATIONS.items() if key in haystack}
    name='objects' if path == 'familiarcharacters/' else path.strip('/') or 'home'
    (ROOT/f'js/ja-{name}.js').write_text('/* Page vocabulary, generated from locales/ja.json. */\nwindow.TWO_D_ONE_JA='+json.dumps(selected,ensure_ascii=False,separators=(',',':'))+';\n')

# Nested discovery pages have explicit localized URLs and page-level metadata.
from fc_discovery import build_discovery
build_discovery()

# Apply shared entity metadata and create human-readable project URLs in both languages.
from site_seo import build_site_seo
build_site_seo()
