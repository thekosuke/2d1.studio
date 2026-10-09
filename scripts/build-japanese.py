"""Regenerate committed Japanese pages from English HTML and locales/ja.json.
Development helper only: deployment and preview need no build or dependencies.
"""
from html.parser import HTMLParser
from html import escape
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
TRANSLATIONS = json.loads((ROOT / 'locales/ja.json').read_text())
ATTRS = {'alt', 'aria-label', 'placeholder', 'title', 'content'}
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

def translate(value):
    key = value.strip()
    return TRANSLATIONS[key] if key in TRANSLATIONS else value

class JapanesePage(HTMLParser):
    def __init__(self, about):
        super().__init__(convert_charrefs=False)
        self.about = about
        self.path = 'about/' if about else ''
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
        for key in ATTRS & a.keys():
            if a[key]: a[key] = translate(a[key])
        for key in ['href','src']:
            val = a.get(key, '')
            if val.startswith(('css/','js/','fonts/','img/','../css/','../js/','../fonts/','../img/')):
                a[key] = '../' + val
        if tag == 'link' and a.get('rel') == 'canonical': a['href'] = self.japanese
        if tag == 'meta' and a.get('property') == 'og:url': a['content'] = self.japanese
        if tag == 'meta' and a.get('property') == 'og:locale': a['content'] = 'ja_JP'
        if tag == 'nav' and a.get('class') == 'language-switch': a['aria-label'] = '言語'
        if tag == 'a' and a.get('hreflang') in ('en','ja'):
            if a['hreflang'] == 'en':
                a['href'] = ('../../' if self.about else '../') + self.path
                a.pop('aria-current',None)
            else: a['href'] = './'; a['aria-current'] = 'page'
        if tag == 'script' and 'js/language.js' in a.get('src',''):
            prefix = '../../' if self.about else '../'
            self.output.append(f'<script src="{prefix}js/ja.js?v=4" defer></script>\n  ')
        self.output.append('<' + tag + ''.join(' '+k if v is None else ' '+k+'="'+escape(v,quote=True)+'"' for k,v in a.items()) + '>')
        if tag == 'link' and 'css/fonts.css' in a.get('href',''):
            prefix = '../../' if self.about else '../'
            self.output.append(f'\n  <link rel="stylesheet" href="{prefix}css/japanese-font.css?v=1">')
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
                    if isinstance(value,dict): return {k:localized(v) for k,v in value.items()}
                    if isinstance(value,list): return [localized(v) for v in value]
                    if isinstance(value,str): return self.japanese if value == self.english else translate(value)
                    return value
                data = json.dumps(localized(json.loads(data)),ensure_ascii=False)
            self.output.append(data)
        elif any(a.get('translate') == 'no' for _, a in self.stack):
            self.output.append(escape(data, quote=False))
        elif data.strip() == '.' and any('essay-lede' in a.get('class','') for _,a in self.stack):
            self.output.append('になれることを願って。')
        else: self.output.append(escape(translate(data),quote=False))

for about in [False,True]:
    source = ROOT / ('about/index.html' if about else 'index.html')
    destination = ROOT / ('ja/about/index.html' if about else 'ja/index.html')
    parser = JapanesePage(about)
    parser.feed(source.read_text())
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(''.join(parser.output))
    print(destination.relative_to(ROOT))
(ROOT/'js/ja.js').write_text('/* Generated from locales/ja.json by scripts/build-japanese.py. */\nwindow.TWO_D_ONE_JA = '+json.dumps(TRANSLATIONS,ensure_ascii=False,indent=2)+';\n')
