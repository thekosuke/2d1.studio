"""Collection-scoped JA delivery must retain every static/dynamic translation."""
import ast
import json
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parent.parent
full = {k.strip():v for k,v in json.loads((ROOT/'locales/ja.json').read_text()).items()}
source = (ROOT/'js/ja-objects.js').read_text()
scoped = json.loads(source.split('window.TWO_D_ONE_JA=',1)[1].rsplit(';',1)[0])
assert scoped and len(scoped) < len(full)
assert all(full[key] == value for key,value in scoped.items()), 'Translation text changed'
required = set()
for name in ('objects.js','objects-controls.js','mobile-nav.js','finds-menus.js','language.js','control-fill.js'):
    text = (ROOT/'js'/name).read_text()
    for match in re.finditer(r'''\bt\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\)''',text):
        required.add(ast.literal_eval(match[1]).strip())
for item in json.loads((ROOT/'data/objects.json').read_text()):
    required.update(item.get('tags', []) + item.get('colors', []))
    required.update(item.get(key,'') for key in ('name','brand','description','category'))
required.update(json.loads((ROOT/'data/object-families.json').read_text()).values())
missing = sorted(key for key in required if key in full and key not in scoped)
assert not missing, missing
html = (ROOT/'ja/familiarcharacters/index.html').read_text()
assert 'js/ja-objects.js?v=1' in html and 'js/ja.js?' not in html
print(f'PASS JA collection delivery: {len(scoped)} identical translations; all runtime literals and catalog/category/color/family keys retained.')
