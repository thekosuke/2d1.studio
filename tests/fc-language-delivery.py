"""Familiar Characters has one English entry point and preserves legacy Japanese links."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
collection = (ROOT / 'familiarcharacters/index.html').read_text()
redirect = (ROOT / 'ja/familiarcharacters/index.html').read_text()

assert '<html lang="en">' in collection
assert 'objects-language' not in collection
assert 'hreflang="ja"' not in collection
assert 'location.replace("/familiarcharacters/"+location.search+location.hash)' in redirect
assert 'content="noindex"' in redirect

for page in ('index.html', 'about/index.html', 'shop/index.html'):
    html = (ROOT / 'ja' / page).read_text()
    assert 'href="/familiarcharacters/"' in html, page

print('PASS: English-only collection, query-preserving legacy redirect, and direct Japanese site links.')
