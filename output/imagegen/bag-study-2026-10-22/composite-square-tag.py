"""User-authorized local composite: v13 photograph + v14 tag only."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
name = '2d-tote-bicolor-everyday-outdoor-v15'
base = Image.open(ROOT / 'originals/2d-tote-bicolor-everyday-outdoor-v13.png').convert('RGB')
donor = Image.open(ROOT / 'originals/2d-tote-bicolor-everyday-outdoor-v14.png').convert('RGB')
assert base.size == donor.size

# Include the protruding square, the old wrapped tag, and its small seam attachment.
# Feather only the outer perimeter; preserve all pixels elsewhere exactly.
box = (327, 550, 412, 639)
mask = Image.new('L', base.size, 0)
draw = ImageDraw.Draw(mask)
draw.polygon([(343, 557), (394, 564), (405, 575),
              (394, 628), (345, 624), (332, 608)], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(2))
bounded = Image.new('L', base.size, 0)
bounded.paste(mask.crop(box), box[:2])
result = Image.composite(donor, base, bounded)

png = ROOT / 'originals' / (name + '.png')
webp = REPO / 'img/shop/bag-study-2026-10-22' / (name + '.webp')
result.save(png)
# Lossless export keeps the promised unchanged pixels unchanged after decoding.
result.save(webp, 'WEBP', lossless=True, method=6)
diff = ImageChops.difference(base, result)
outside = diff.copy()
outside.paste((0, 0, 0), box)
assert outside.getbbox() is None, 'Pixels outside tag region changed'
assert Image.open(webp).convert('RGB').tobytes() == result.tobytes()
r, g, b = diff.split()
changed = ImageChops.lighter(ImageChops.lighter(r, g), b)
changed_count = base.width * base.height - changed.histogram()[0]
report = {
    'base': 'v13 original PNG', 'tag_donor': 'v14 original PNG',
    'method': 'User-authorized feathered local composite; no generation',
    'changed_bounds': list(diff.getbbox()),
    'changed_pixels': changed_count,
    'changed_percent': round(changed_count / (base.width * base.height) * 100, 4),
    'outside_region_identical': True, 'webp_decodes_identically': True,
    'bytes': webp.stat().st_size,
}
(ROOT / 'square-tag-composite-verification.json').write_text(json.dumps(report, indent=2) + '\n')
manifest = ROOT / 'manifest.json'
items = json.loads(manifest.read_text())
items = [item for item in items if item['name'] != name]
items.append({'name': name, 'path': str(webp.relative_to(REPO)),
              'width': base.width, 'height': base.height, 'bytes': webp.stat().st_size,
              'source': str(png.relative_to(REPO)), 'edit_method': report['method']})
manifest.write_text(json.dumps(items, indent=2) + '\n')
result.crop((310, 530, 425, 650)).resize((690, 720)).save('/tmp/bag-tag-composite-detail.png')
print(json.dumps(report))
