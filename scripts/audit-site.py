"""Check live local references and report asset weight; no server or dependencies.

Usage: python3 scripts/audit-site.py [dist]
Checks source or the generated preview, including srcset and inline SVG images.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
root = (ROOT / sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT
pages = [root / 'index.html']
for folder in ('about', 'contact', 'familiarcharacters', 'finds', 'objects', 'work', 'shop', 'red-pixel', 'ja'):
    pages += sorted((root / folder).rglob('*.html'))
errors = []
assets = set()


def check(value, source):
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path or '{' in value:
        return
    path = unquote(url.path)
    target = (root / path.lstrip('/') if path.startswith('/') else source.parent / path).resolve()
    if not target.is_relative_to(root):
        errors.append(f'{source.relative_to(root)}: escapes package: {value}')
        return
    if target.is_dir():
        target /= 'index.html'
    if not target.is_file():
        errors.append(f'{source.relative_to(root)}: missing {value}')
    else:
        assets.add(target)


class Refs(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ('src', 'href', 'poster'):
            if name in attrs:
                check(attrs[name], self.source)
        for entry in attrs.get('srcset', '').split(','):
            if entry.strip():
                check(entry.strip().split()[0], self.source)


for page in pages:
    parser = Refs()
    parser.source = page
    parser.feed(page.read_text())
for css in list(assets):
    if css.suffix == '.css':
        for url in re.findall(r"url\(\s*['\"]?([^)'\"]+)", css.read_text()):
            check(url, css)
for error in sorted(set(errors)):
    print(error)
print(f'{len(pages)} pages; {len(assets)} directly referenced local files; {len(set(errors))} broken references.')
print('Largest directly referenced files (not a page-load measurement):')
for asset in sorted(assets, key=lambda p: p.stat().st_size, reverse=True)[:8]:
    print(f'  {asset.stat().st_size / 1024:.0f} KiB  {asset.relative_to(root)}')
sys.exit(bool(errors))
