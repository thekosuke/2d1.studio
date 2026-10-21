"""Optimize the owner-supplied Figma gallery exports without upscaling.

Sources and Figma node identities live in img/projects/PROJECT/gallery.json.
Run from any directory; original PNG exports remain available for future edits.
"""
import argparse
import json
from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('project', choices=('aviator', 'deepdrip', 'supa'))
OUT = ROOT / 'img/projects' / parser.parse_args().project
manifest_path = OUT / 'gallery.json'
manifest = json.loads(manifest_path.read_text())
for asset in manifest['assets']:
    with Image.open(OUT / asset['source']) as source:
        if 'crop' in asset:
            source = source.crop(tuple(asset['crop']))
        source = source.convert('RGBA' if 'A' in source.getbands() else 'RGB')
        width, height = source.size
        asset['width'], asset['height'] = width, height
        widths = sorted({min(size, width) for size in (640, 1280, 2560)})
        asset['variants'] = []
        for size in widths:
            image = source if size == width else source.resize(
                (size, round(height * size / width)), Image.Resampling.LANCZOS)
            filename = f"gallery-{asset['name']}-{size}.webp"
            encoded = BytesIO()
            image.save(encoded, 'WEBP', quality=90, method=6)
            temporary = OUT / (filename + '.tmp')
            temporary.write_bytes(encoded.getvalue())
            temporary.replace(OUT / filename)
            asset['variants'].append({'src': filename, 'width': size})
        print(asset['name'], f'{width} × {height}')
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
