"""Generate the static Objects shelf from the source-credited catalog."""
from pathlib import Path
from html import escape as e
import json
ROOT=Path(__file__).resolve().parent.parent
items=json.loads((ROOT/'data/objects.json').read_text())
categories=[('all','All objects'),('living','Living'),('kitchen','Kitchen'),('wear','Wear'),('work','Work')]
cards=[]
for item in items:
    assert (ROOT/item['image']).is_file(),item['image']
    variants = item.get('imageVariants', [])
    for variant in variants:
        assert (ROOT/variant['image']).is_file(), variant['image']
    srcset = ', '.join(f'../{variant["image"]} {variant["width"]}w' for variant in variants)
    responsive = f' srcset="{e(srcset)}" sizes="(max-width: 600px) 45vw, 320px"' if variants else ''
    product_url = item.get('productUrl') or ''
    for_sale = item.get('forSale', True) and bool(product_url)
    assert not product_url or product_url.startswith('https://')
    assert item['sourceUrl'].startswith('https://')
    gallery = item.get('gallery', [item])
    assert 1 <= len(gallery) <= 7
    photos = []
    for index, photo in enumerate(gallery, 1):
        assert (ROOT/photo['image']).is_file(), photo['image']
        assert photo['sourceUrl'].startswith('https://')
        assert photo['width'] > 0 and photo['height'] > 0
        photos.append(f'<img src="../{e(photo["image"])}" alt="{e(item["name"])} by {e(item["brand"])} ({index}/{len(gallery)})" data-source="{e(photo["sourceUrl"])}" width="{photo["width"]}" height="{photo["height"]}" loading="lazy" decoding="async">')
    opening = f'<a class="object-open" href="{e(product_url)}" target="_blank" rel="noopener noreferrer">' if for_sale else '<div class="object-open">'
    closing = '</a>' if for_sale else '</div><p class="object-availability">Not for sale</p>'
    cards.append(f'''<article class="object-card" data-object="{e(item['id'])}" data-category="{e(item['category'])}" data-tags="{e(json.dumps(item['tags']))}">
{opening}<figure><img src="../{e(item['image'])}"{responsive} alt="{e(item['name'])} by {e(item['brand'])}" width="{item['width']}" height="{item['height']}" loading="lazy" decoding="async"><figcaption><span class="object-brand" translate="no">{e(item['brand'])}</span><h2 translate="no">{e(item['name'])}</h2></figcaption></figure>{closing}
<template class="object-gallery">{''.join(photos)}</template><p class="object-description" hidden>{e(item['description'])}</p><a class="object-source" href="{e(item['sourceUrl'])}" hidden>Image source</a></article>''')
html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>2D1 | Finds</title><meta name="description" content="An open shelf of everyday objects with character. Explore the 2D1 Finds collection.">
<meta name="robots" content="index, follow"><meta name="theme-color" content="#FAF0E6">
<link rel="canonical" href="https://2d1.studio/objects/">
<link rel="alternate" hreflang="en" href="https://2d1.studio/objects/"><link rel="alternate" hreflang="ja" href="https://2d1.studio/ja/objects/"><link rel="alternate" hreflang="x-default" href="https://2d1.studio/objects/">
<meta property="og:locale" content="en_US"><meta property="og:type" content="website"><meta property="og:title" content="Finds — 2D1"><meta property="og:description" content="An open shelf of everyday objects with character. Explore the 2D1 Finds collection."><meta property="og:url" content="https://2d1.studio/objects/"><meta property="og:image" content="https://2d1.studio/img/brand/2d1-social.png?v=2"><meta property="og:image:alt" content="The red 2D1 logo on a soft beige background.">
<link rel="icon" href="../img/brand/2d1-icon.svg?v=2" type="image/svg+xml"><link rel="apple-touch-icon" href="../img/brand/2d1-apple-touch.png?v=2">
<link rel="stylesheet" href="../css/fonts.css?v=4"><link rel="stylesheet" href="../css/walla.css?v=45"><link rel="stylesheet" href="../css/objects.css?v=22">
<link rel="stylesheet" href="../css/dialogs.css?v=12">
<script src="../js/config.js" defer></script><script src="../js/drawers.js" defer></script><script src="../js/contact.js" defer></script><script src="../js/finds-menus.js?v=1" defer></script>
<script src="../js/language.js?v=1" defer></script><script src="../js/objects.js?v=10" defer></script>
</head>
<body class="objects-page">
<a class="skip-link" href="#objects-canvas">Skip to objects</a>
<header class="objects-header"><div class="finds-home-menu"><a class="finds-home-trigger" href="../" aria-expanded="false" aria-controls="finds-page-nav">Home</a><nav class="finds-page-nav" id="finds-page-nav" aria-label="Sections and pages"><a href="../#studio">Studio</a><a href="../#shop">Shop</a><a href="../#connect">Connect</a><span class="finds-nav-divider"></span><a href="../about/">About</a><a href="./" aria-current="page">Finds</a><span class="finds-nav-divider"></span><a data-contact href="https://temporal-sight-127.notion.site/966aab52301b4588a1c875bf81ac421a?pvs=105" aria-haspopup="dialog" aria-controls="contact">Contact</a></nav></div><a class="site-logo" href="../" aria-label="2D1, home"><img src="../img/brand/logo_red.svg?v=2" width="829" height="280" alt="2D1"></a></header>
<main class="objects-main" id="main">
<div class="objects-intro"><h1 translate="no">Finds</h1><p>Familiar characters for everyday life.</p></div>
<div class="objects-view-dock" data-js-only><details class="objects-tools"><summary>Category</summary><div class="objects-tools-panel">
<div class="objects-categories" role="group" aria-label="Filter by category">{''.join(f'<button type="button" data-category-filter="{key}" aria-pressed="{str(key=="all").lower()}">{label}</button>' for key,label in categories)}</div>
</div></details></div>
<div class="objects-canvas" id="objects-canvas" tabindex="0" role="region" aria-label="Infinite object grid" aria-describedby="objects-instructions">
<div class="objects-layer" aria-hidden="true"></div><div class="objects-empty" hidden><p>No objects match these filters.</p><button class="objects-reset" type="button" data-reset-filters>Clear filters</button></div></div>
<p class="sr-only" id="objects-focus-status" role="status"></p>
<p class="sr-only" id="objects-instructions">Drag in any direction to explore. Arrow keys move the grid. Enter opens the object at the center.</p>
<div class="objects-collection" id="objects-collection">{''.join(cards)}</div>
<div class="objects-list-empty" hidden><p>No objects match these filters.</p><button class="objects-reset" type="button" data-reset-filters>Clear filters</button></div>
<noscript><p class="objects-noscript">This collection is shown as a grid without JavaScript. Product links are provided where available.</p></noscript>
</main>
<div class="objects-zoom" data-js-only><label for="objects-zoom">Zoom</label><span aria-hidden="true">−</span><input id="objects-zoom" type="range" min="0" max="100" value="35" step="1" aria-valuetext="35% Canvas"><span aria-hidden="true">+</span></div>
<button class="objects-info" data-js-only type="button" aria-label="About this collection" aria-haspopup="dialog">i</button>
<footer class="objects-footer"><p><span class="objects-status" id="objects-status" role="status">{len(items)} objects</span> <span aria-hidden="true">·</span> <span>Selected by Kosuke</span></p><p class="objects-hint" data-js-only>Drag to explore. Select to discover.</p><button class="objects-reset" data-reset-view data-js-only type="button">Reset view</button><nav class="objects-language" aria-label="Language"><a href="./" hreflang="en" lang="en" aria-current="page">EN</a><a href="../ja/objects/" hreflang="ja" lang="ja">JA</a></nav></footer>
<dialog class="objects-dialog" id="object-dialog" aria-labelledby="object-title"><button class="objects-dialog-close" type="button" data-close>Close ×</button><div class="objects-dialog-scroll"><div class="objects-dialog-layout"><div class="objects-dialog-photo"></div><div class="objects-dialog-copy"><p class="objects-dialog-brand" translate="no"></p><h2 class="objects-dialog-title" id="object-title" translate="no"></h2><p class="objects-dialog-description"></p><div class="objects-dialog-tags"></div><div class="objects-purchased"><button type="button" class="objects-purchased-button" disabled aria-describedby="objects-purchased-status">I have it</button><p id="objects-purchased-status" role="status">Shared purchase counts aren’t connected yet. Nothing is recorded.</p><button type="button" data-purchased-retry hidden>Reload count</button><p>Anonymous browser-based tally. Using another browser can count twice.</p></div><a class="objects-dialog-link" href="#" target="_blank" rel="noopener noreferrer">Visit product page ↗</a><p class="objects-dialog-availability" hidden>Not for sale</p><p class="objects-dialog-credit"><span>Product photography:</span> <span class="objects-dialog-sources"></span></p></div></div></div></dialog>
<dialog class="objects-info-dialog objects-dialog" id="objects-info-dialog" aria-labelledby="objects-info-title"><button class="objects-dialog-close" type="button" data-info-close>Close ×</button><h2 id="objects-info-title" translate="no">Familiar Characters</h2><p>Hand-picked by Kosuke: everyday objects he believes carry the spirit of Familiar Characters. Useful, full of character, and worth keeping around.</p><p class="objects-info-note">A growing collection of familiar characters, from everyday tools to vintage finds.</p><a class="objects-info-about" href="../about/">About</a></dialog>
</body></html>'''
(ROOT/'objects').mkdir(exist_ok=True)
(ROOT/'objects/index.html').write_text(html)
print(f'Objects: {len(items)} source-credited products')
