"""Generate the static Objects shelf from the source-credited catalog."""
from pathlib import Path
from html import escape as e
import json
import re
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

def tracked_product_url(url):
    if not url:
        return ""
    parts = urlsplit(url)
    tracking = {"utm_source": "2d1.studio", "utm_medium": "referral", "utm_campaign": "finds"}
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key not in tracking]
    query.extend(tracking.items())
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

ROOT=Path(__file__).resolve().parent.parent
items=json.loads((ROOT/'data/objects.json').read_text())
family_assignments=json.loads((ROOT/'data/object-families.json').read_text())
assert set(family_assignments)=={item['id'] for item in items}, 'Family assignments must match the catalog'
items=[dict(item, family=family_assignments[item['id']]) for item in items]
delivery_path=ROOT/'data/finds-images.json'
delivery=json.loads(delivery_path.read_text()) if delivery_path.exists() else {}
def image_variants(item):
    variants={v['width']:v for v in item.get('imageVariants', [])}
    variants.update({v['width']:v for v in delivery.get(item['image'], [])})
    return sorted(variants.values(), key=lambda v:v['width'])
categories=[('all','All objects'),('living','Living'),('kitchen','Kitchen'),('wear','Wear'),('work','Work')]
families=('Characters','Companions','Classics','Oddities','Rituals')
assert all(value in families for value in family_assignments.values()), 'Unknown family assignment'
# Keep curation separate from product/source metadata. The generated runtime
# lookup needs neither an extra request nor changes to the static catalog HTML.
script_path=ROOT/'js/objects.js'
script=script_path.read_text()
lookup='  const objectFamilies = '+json.dumps(family_assignments, ensure_ascii=False, separators=(',',':'))+';'
script, count=re.subn(r'^  const objectFamilies = .*;$', lambda match:lookup, script, count=1, flags=re.M)
assert count==1, 'Missing generated Family lookup'
script_path.write_text(script)
cards=[]
for item in items:
    assert item.get('family') in families, f"Missing or unknown family: {item['id']}"
    assert (ROOT/item['image']).is_file(),item['image']
    variants = image_variants(item)
    for variant in variants:
        assert (ROOT/variant['image']).is_file(), variant['image']
    srcset = ', '.join(f'../{variant["image"]} {variant["width"]}w' for variant in variants)
    responsive = f' srcset="{e(srcset)}" sizes="(max-width: 600px) 45vw, 320px"' if variants else ''
    product_url = tracked_product_url(item.get('productUrl') or '')
    for_sale = item.get('forSale', True) and bool(product_url)
    assert not product_url or product_url.startswith('https://')
    assert item['sourceUrl'].startswith('https://')
    gallery = item.get('gallery', [item])
    assert 1 <= len(gallery) <= 4
    photos = []
    for index, photo in enumerate(gallery, 1):
        assert (ROOT/photo['image']).is_file(), photo['image']
        assert photo['sourceUrl'].startswith('https://')
        assert photo['width'] > 0 and photo['height'] > 0
        photo_variants=delivery.get(photo['image'], [])
        photo_srcset=', '.join(f'../{variant["image"]} {variant["width"]}w' for variant in photo_variants)
        cover_ratio=max(1, photo['width']/photo['height'])
        phone_vw=100*cover_ratio
        desktop_vw=60*cover_ratio
        photo_responsive=f' srcset="{e(photo_srcset)}" sizes="(max-width: 767px) {phone_vw:.2f}vw, {desktop_vw:.2f}vw"' if photo_variants else ''
        photos.append(f'<img{photo_responsive} src="../{e(photo["image"])}" alt="{e(item["name"])} by {e(item["brand"])} ({index}/{len(gallery)})" data-source="{e(photo["sourceUrl"])}" width="{photo["width"]}" height="{photo["height"]}" loading="lazy" decoding="async">')
    opening = f'<a class="object-open" href="{e(product_url)}" target="_blank" rel="noopener noreferrer">' if for_sale else '<div class="object-open">'
    closing = '</a>' if for_sale else '</div><p class="object-availability">Not for sale</p>'
    cards.append(f'''<article class="object-card" data-object="{e(item['id'])}" data-category="{e(item['category'])}" data-tags="{e(json.dumps(item['tags']))}" data-colors="{e(json.dumps(item.get('colors', [])))}" data-display-colors="{e(json.dumps(item.get('displayColors', [])[:5]))}">
{opening}<figure><img class="{e(item.get('imageClass',''))}" src="../{e(item['image'])}"{responsive} alt="{e(item['name'])} by {e(item['brand'])}" width="{item['width']}" height="{item['height']}" loading="lazy" decoding="async"><figcaption><span class="object-brand" translate="no">{e(item['brand'])}</span><h2 translate="no">{e(item['name'])}</h2></figcaption></figure>{closing}
<template class="object-gallery">{''.join(photos)}</template><p class="object-description" hidden>{e(item['description'])}</p><a class="object-source" href="{e(item['sourceUrl'])}" hidden>Image source</a></article>''')
html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>2D1 | Familiar Characters</title><meta name="description" content="An open shelf of everyday objects with character. Explore the 2D1 Familiar Characters collection.">
<meta name="robots" content="index, follow"><meta name="theme-color" content="#FAF0E6">
<link rel="canonical" href="https://2d1.studio/objects/">
<link rel="alternate" hreflang="en" href="https://2d1.studio/objects/"><link rel="alternate" hreflang="ja" href="https://2d1.studio/ja/objects/"><link rel="alternate" hreflang="x-default" href="https://2d1.studio/objects/">
<meta property="og:locale" content="en_US"><meta property="og:type" content="website"><meta property="og:title" content="Familiar Characters — 2D1"><meta property="og:description" content="An open shelf of everyday objects with character. Explore the 2D1 Familiar Characters collection."><meta property="og:url" content="https://2d1.studio/objects/"><meta property="og:image" content="https://2d1.studio/img/brand/2d1-social.png?v=2"><meta property="og:image:alt" content="The red 2D1 logo on a soft beige background.">
<link rel="icon" href="../img/brand/2d1-icon.svg?v=2" type="image/svg+xml"><link rel="apple-touch-icon" href="../img/brand/2d1-apple-touch.png?v=2">
<script>document.documentElement.classList.add('finds-js');setTimeout(()=>{{if(!document.querySelector('.objects-ready'))document.documentElement.classList.remove('finds-js');}},4000);</script>
<link rel="stylesheet" href="../css/fonts.css?v=7"><link rel="stylesheet" href="../css/walla.css?v=84"><link rel="stylesheet" href="../css/objects.css?v=112">
<link rel="stylesheet" href="../css/dialogs.css?v=18"><link rel="stylesheet" href="../css/mobile-nav.css?v=3">
<link rel="stylesheet" href="../css/typography.css?v=10">
<script src="../js/config.js" defer></script><script src="../js/drawers.js" defer></script><script src="../js/contact.js?v=12" defer></script><script src="../js/mobile-nav.js?v=2" defer></script><script src="../js/finds-menus.js?v=6" defer></script>
<script src="../js/language.js?v=1" defer></script><script src="../js/objects.js?v=60" defer></script>
</head>
<body class="objects-page">
<a class="skip-link" href="#objects-canvas">Skip to objects</a>
<header class="objects-header"><div class="finds-home-menu"><a class="finds-home-trigger" href="../"><span class="pixel-home-arrow" aria-hidden="true"></span>Home</a></div><a class="site-logo" href="../" aria-label="2D1, home"><img src="../img/brand/logo_red.svg?v=2" width="829" height="280" alt="2D1"></a></header>
<main class="objects-main" id="main">
<div class="objects-intro"><h1 translate="no">Familiar Characters</h1><p>Familiar characters for everyday life.</p></div>
<div class="objects-view-dock"><span class="objects-search-wrap"><div class="objects-search-suggestions" id="objects-search-suggestions" aria-label="Search suggestions" hidden></div><svg class="objects-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input class="objects-search" id="objects-search" type="search" disabled aria-label="Search familiar characters" placeholder="Search familiar characters..." autocomplete="off"></span></div>
<div class="objects-canvas" id="objects-canvas" tabindex="0" role="region" aria-label="Infinite object grid" aria-describedby="objects-instructions">
<div class="objects-layer" aria-hidden="true"></div><div class="objects-empty" hidden><p>No objects match these filters.</p><button class="objects-reset" type="button" data-reset-filters>Clear filters</button></div></div>
<p class="sr-only" id="objects-focus-status" role="status"></p>
<p class="sr-only" id="objects-instructions">Drag in any direction to explore. Arrow keys move the grid. Enter opens the object at the center.</p>
<div class="objects-collection" id="objects-collection">{''.join(cards)}</div>
<div class="objects-list-empty" hidden><p>No objects match these filters.</p><button class="objects-reset" type="button" data-reset-filters>Clear filters</button></div>
<noscript><p class="objects-noscript">This collection is shown as a grid without JavaScript. Product links are provided where available.</p></noscript>
</main>
<div class="objects-zoom" data-js-only><label for="objects-zoom">Zoom</label><button type="button" data-zoom-step="-10" aria-label="Zoom out" aria-describedby="objects-zoom-status" aria-disabled="true">−</button><input id="objects-zoom" type="range" min="0" max="100" value="0" step="1" aria-valuetext="0% Canvas"><button type="button" data-zoom-step="10" aria-label="Zoom in" aria-describedby="objects-zoom-status" aria-disabled="false">+</button><output class="sr-only" id="objects-zoom-status" aria-live="off" aria-atomic="true"></output></div>
<button class="objects-info" data-js-only type="button" aria-label="About this collection" aria-haspopup="dialog" aria-expanded="false" aria-controls="objects-info-dialog"><span translate="no">Familiar Characters</span><span aria-hidden="true">+</span></button>
<footer class="objects-footer"><p><span class="objects-status" id="objects-status" role="status">{len(items)} objects</span> <span aria-hidden="true">·</span> <span>Selected by Kosuke</span></p><p class="objects-hint" data-js-only>Drag to explore. Select to discover.</p><button class="objects-reset" data-reset-view data-js-only type="button">Reset view</button><nav class="objects-language" aria-label="Language"><a href="./" hreflang="en" lang="en" aria-current="page">EN</a><a href="../ja/objects/" hreflang="ja" lang="ja">JA</a></nav></footer>
<dialog class="objects-dialog" id="object-dialog" aria-labelledby="object-title"><button class="objects-dialog-close" type="button" data-close aria-label="Close"><span aria-hidden="true">×</span></button><button type="button" class="objects-product-peek" data-product-step="-1"></button><div class="objects-dialog-scroll"><div class="objects-dialog-layout"><div class="objects-dialog-gallery"><div class="objects-dialog-photo" role="region" tabindex="-1" aria-label="Product photographs"></div><p class="objects-dialog-credit"><span>Photography:</span> <span class="objects-dialog-sources"></span></p><span class="objects-photo-count" aria-hidden="true" hidden></span><p class="objects-photo-status sr-only" role="status" aria-atomic="true"></p></div><div class="objects-dialog-copy"><div class="objects-detail-summary"><p class="objects-dialog-brand" translate="no"></p><h2 class="objects-dialog-title" id="object-title" translate="no"></h2><p class="objects-dialog-description"></p></div><div class="objects-purchased" hidden><button type="button" class="objects-purchased-button" disabled aria-describedby="objects-purchased-status">I have it</button><p id="objects-purchased-status" role="status"></p><p>Anonymous browser-based tally.</p></div><div class="objects-detail-bottom"><div class="objects-dialog-action"><a class="objects-dialog-link" href="#" target="_blank" rel="noopener noreferrer">Product page <span class="pixel-external" aria-hidden="true"></span></a><p class="objects-dialog-availability" hidden>Not for sale</p></div><div class="objects-dialog-tags"></div><div class="objects-detail-colors" role="group" aria-label="Product colors"></div></div></div></div></div><button type="button" class="objects-product-peek" data-product-step="1"></button><div class="objects-dialog-footer" hidden><div class="objects-dialog-footer-action"></div><div class="objects-product-arrows" role="group" aria-label="Product navigation"><button type="button" class="objects-product-arrow" data-product-step="-1" data-product-arrow aria-label="Previous product"><span aria-hidden="true">←</span></button><button type="button" class="objects-product-arrow" data-product-step="1" data-product-arrow aria-label="Next product"><span aria-hidden="true">→</span></button></div></div></dialog>
<dialog class="objects-info-dialog objects-dialog" id="objects-info-dialog" aria-labelledby="objects-info-title"><button class="objects-info-close" type="button" aria-label="Close info sheet"><svg viewBox="0 0 9 9" aria-hidden="true" focusable="false"><path d="M0 0h2v2H0zM2 2h2v2H2zM4 4h1v1H4zM5 5h2v2H5zM7 7h2v2H7zM7 0h2v2H7zM5 2h2v2H5zM2 5h2v2H2zM0 7h2v2H0z"/></svg></button><img class="objects-info-eyes" src="../img/brand/eyes.svg" width="116" height="48" alt="" aria-hidden="true"><h2 id="objects-info-title">A growing collection of everyday companions that go from having character to becoming a character.</h2><p>Hi, I’m <a href="https://kosuke.com/" target="_blank" rel="noopener noreferrer" translate="no">Kosuke Futsukaichi</a>. I hand-pick the objects here and update the collection when I get a chance. I’m drawn to thoughtfully designed everyday things with a clear point of view and a little wit. I started calling these things Familiar Characters.</p><p>Explore the canvas to discover new companions to be part of your routine. I personally wish I owned everything here.</p><div class="objects-info-actions"><a class="objects-info-about" href="../about/">Learn more</a><a class="objects-info-contact" href="../contact/">Reach out</a></div></dialog>
</body></html>'''
(ROOT/'objects').mkdir(exist_ok=True)
(ROOT/'objects/index.html').write_text(html)
print(f'Objects: {len(items)} source-credited products')
