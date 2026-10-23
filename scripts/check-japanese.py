"""Catch untranslated English UI; approved proper names remain unchanged.
Run after build-japanese.py. This heuristic complements browser review.
"""
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALLOWED = {"2D Tote", "English", "Instagram", "LinkedIn", "Threads", "Russell Taylor", "Familiar Characters", "Familiar Characters by 2D1", "Red Pixel by 2D1"}
import re,json
class P(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.rows=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append((t,d))
  for k in ['alt','aria-label','placeholder','title']:
   if d.get(k):self.check(d[k],k)
 def handle_endtag(self,t):
  if self.stack and self.stack[-1][0]==t:self.stack.pop()
 def handle_data(self,s):
  if not any(t in ['script','style'] or a.get('translate')=='no' for t,a in self.stack):self.check(s,'text')
 def check(self,s,k):
  if s.strip() not in ALLOWED and re.search('[A-Za-z]{3}',s) and not re.search('[\u3040-\u30ff\u3400-\u9fff]',s):self.rows.append((k,s.strip()))

if __name__ == '__main__':
 failures = []
 for p in (ROOT / 'ja').rglob('index.html'):
  parser = P(); parser.feed(p.read_text())
  failures.extend(f'{p.relative_to(ROOT)}: {kind}: {text}' for kind, text in sorted(set(parser.rows)))
 dictionary = json.loads((ROOT / 'locales/ja.json').read_text())
 failures.extend(f'Translation key has surrounding whitespace: {key!r}' for key in dictionary if key != key.strip())
 for name in ['contact.js', 'objects.js', 'walla.js', 'tote-preview.js']:
  source = (ROOT / 'js' / name).read_text()
  keys = set(re.findall(r"\bt\('([^'\n]+)'\)", source))
  failures.extend(f'js/{name}: missing dynamic translation: {key}' for key in sorted(keys - dictionary.keys()))
 if failures:
  print('\n'.join(failures)); raise SystemExit(1)
 print('Japanese audit passed: all routes, template copy, accessibility labels and literal dynamic translation keys.')
