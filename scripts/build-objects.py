"""Generate the static Objects shelf from the source-credited catalog."""
from pathlib import Path
from html import escape as e
import json
ROOT=Path(__file__).resolve().parent.parent
items=json.loads((ROOT/'data/objects.json').read_text())
tags=sorted({tag for item in items for tag in item['tags']},key=str.lower)
categories=[('all','All objects'),('living','Living'),('kitchen','Kitchen'),('wear','Wear'),('work','Work')]
cards=[]
for item in items:
    assert (ROOT/item['image']).is_file(),item['image']
    assert item['productUrl'].startswith('https://') and item['sourceUrl'].startswith('https://')
    cards.append(f'''<article class="object-card" data-object="{e(item['id'])}" data-category="{e(item['category'])}" data-tags="{e(json.dumps(item['tags']))}">
<a class="object-open" href="{e(item['productUrl'])}" target="_blank" rel="noopener noreferrer"><figure><img src="../{e(item['image'])}" alt="{e(item['name'])} by {e(item['brand'])}" width="{item['width']}" height="{item['height']}" loading="lazy" decoding="async"><figcaption><span class="object-brand" translate="no">{e(item['brand'])}</span><h2 translate="no">{e(item['name'])}</h2></figcaption></figure></a>
<p class="object-description" hidden>{e(item['description'])}</p><a class="object-source" href="{e(item['sourceUrl'])}" hidden>Image source</a></article>''')
html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Objects — 2D1</title><meta name="description" content="An open shelf of everyday objects with character. Explore the 2D1 Objects collection.">
<meta name="robots" content="index, follow"><meta name="theme-color" content="#FAF0E6">
<link rel="canonical" href="https://2d1.studio/objects/">
<link rel="alternate" hreflang="en" href="https://2d1.studio/objects/"><link rel="alternate" hreflang="ja" href="https://2d1.studio/ja/objects/"><link rel="alternate" hreflang="x-default" href="https://2d1.studio/objects/">
<meta property="og:locale" content="en_US"><meta property="og:type" content="website"><meta property="og:title" content="Objects — 2D1"><meta property="og:description" content="An open shelf of everyday objects with character. Explore the 2D1 Objects collection."><meta property="og:url" content="https://2d1.studio/objects/"><meta property="og:image" content="https://2d1.studio/img/brand/2d1-social.png?v=2"><meta property="og:image:alt" content="The red 2D1 logo on a soft beige background.">
<link rel="icon" href="../img/brand/2d1-icon.svg?v=2" type="image/svg+xml"><link rel="apple-touch-icon" href="../img/brand/2d1-apple-touch.png?v=2">
<link rel="stylesheet" href="../css/fonts.css?v=4"><link rel="stylesheet" href="../css/walla.css?v=28"><link rel="stylesheet" href="../css/objects.css?v=1">
<script src="../js/language.js?v=1" defer></script><script src="../js/objects.js?v=1" defer></script>
</head>
<body class="objects-page">
<a class="skip-link" href="#objects-collection">Skip to objects</a>
<header class="objects-header"><a href="../">← Home</a><a class="site-logo" href="../" aria-label="2D1, home"><img src="../img/brand/logo_red.svg?v=2" width="829" height="280" alt="2D1"></a><a href="../about/">About</a></header>
<main class="objects-main" id="main">
<div class="objects-intro"><h1 translate="no">Objects</h1><p>Familiar characters for everyday life.</p></div>
<div class="objects-tools" data-js-only>
<div class="objects-categories" role="group" aria-label="Filter by category">{''.join(f'<button type="button" data-category-filter="{key}" aria-pressed="{str(key=="all").lower()}">{label}</button>' for key,label in categories)}</div>
<div class="objects-options"><label class="objects-tags" for="objects-tag"><span>Tag</span><select id="objects-tag"><option value="all">All tags</option>{''.join(f'<option value="{e(tag)}">{e(tag)}</option>' for tag in tags)}</select></label><div class="objects-view" role="group" aria-label="Collection view"><button type="button" data-view="grid" aria-pressed="true">Grid</button><button type="button" data-view="list" aria-pressed="false">List</button></div></div>
</div>
<div class="objects-canvas" id="objects-canvas" tabindex="0" role="region" aria-label="Infinite object grid" aria-describedby="objects-instructions">
<div class="objects-layer" aria-hidden="true"></div><div class="objects-empty" hidden><p>No objects match these filters.</p><button class="objects-reset" type="button" data-reset-filters>Clear filters</button></div></div>
<p class="sr-only" id="objects-instructions">Drag in any direction to explore. Arrow keys move the grid. Enter opens the object at the center. Use List for all objects in reading order.</p>
<div class="objects-collection" id="objects-collection">{''.join(cards)}</div>
<div class="objects-list-empty" hidden><p>No objects match these filters.</p><button class="objects-reset" type="button" data-reset-filters>Clear filters</button></div>
<noscript><p class="objects-noscript">This collection is shown as a list without JavaScript. Select an object to visit its maker.</p></noscript>
</main>
<footer class="objects-footer"><p><span class="objects-status" id="objects-status" role="status">{len(items)} objects</span> <span aria-hidden="true">·</span> <span>Placeholder collection</span></p><p class="objects-hint" data-js-only>Drag to explore. Select to discover.</p><button class="objects-reset" data-reset-view data-js-only type="button">Reset view</button><nav class="objects-language" aria-label="Language"><a href="./" hreflang="en" lang="en" aria-current="page">EN</a><a href="../ja/objects/" hreflang="ja" lang="ja">JA</a></nav></footer>
<dialog class="objects-dialog" id="object-dialog" aria-labelledby="object-title"><button class="objects-dialog-close" type="button" data-close>Close ×</button><div class="objects-dialog-layout"><div class="objects-dialog-photo"><img class="objects-dialog-image" alt=""></div><div class="objects-dialog-copy"><p class="objects-dialog-brand" translate="no"></p><h2 class="objects-dialog-title" id="object-title" translate="no"></h2><p class="objects-dialog-description"></p><div class="objects-dialog-tags"></div><a class="objects-dialog-link" href="#" target="_blank" rel="noopener noreferrer">Visit product page ↗</a><p class="objects-dialog-credit"><span>Product photography:</span> <a href="#" target="_blank" rel="noopener noreferrer">view source</a></p></div></div></dialog>
</body></html>'''
(ROOT/'objects').mkdir(exist_ok=True)
(ROOT/'objects/index.html').write_text(html)
print(f'Objects: {len(items)} source-credited products')
