"""Page vocabularies retain exact authored/static and dynamic JA translations."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import ast,json,re
ROOT=Path(__file__).resolve().parent.parent
full={k.strip():v for k,v in json.loads((ROOT/'locales/ja.json').read_text()).items()}
class Scripts(HTMLParser):
    def __init__(self):super().__init__();self.names=[]
    def handle_starttag(self,t,a):
        d=dict(a)
        if t=='script' and d.get('src','').startswith(('js/','../js/')):self.names.append(d['src'].split('?',1)[0].split('/')[-1])
count=0
for path in ['', 'about/', 'work/', 'shop/', 'contact/', 'privacy/', 'legal/', 'familiarcharacters/']:
    page=(ROOT/(path+'index.html')).read_text();parser=Scripts();parser.feed(page)
    name='objects' if path=='familiarcharacters/' else path.strip('/') or 'home'
    source=(ROOT/f'js/ja-{name}.js').read_text()
    scoped=json.loads(source.split('window.TWO_D_ONE_JA=',1)[1].rsplit(';',1)[0])
    assert scoped and len(scoped)<len(full)
    assert all(full[k]==v for k,v in scoped.items()),name
    required=set(k for k in full if k in unescape(page))
    pending=list(parser.names);visited=set()
    while pending:
        script=pending.pop()
        if script in visited:continue
        visited.add(script);text=(ROOT/'js'/script).read_text()
        pending.extend(re.findall(r'''['"]\./([\w.-]+\.js)(?:\?[^'"]*)?['"]''',text))
        for m in re.finditer(r'''\bt\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\)''',text):required.add(ast.literal_eval(m[1]).strip())
    assert not [k for k in required if k in full and k not in scoped],name
    localized=(ROOT/'ja'/path/'index.html').read_text()
    assert f'js/ja-{name}.js?v=1' in localized and 'js/ja.js?' not in localized,name
    count+=1
print(f'PASS: {count} route vocabularies retain exact static/dynamic translations and locale load order.')
