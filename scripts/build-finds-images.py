"""Lossless, device-sized delivery copies; native photos remain untouched.

Requires Pillow (also used by the catalog audit). Content hashes make generated
URLs safe to cache. Re-running skips existing outputs. Never upscale a source.
"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'img/objects/responsive'
MANIFEST = ROOT / 'data/finds-images.json'
CACHE = ROOT / 'data/finds-image-build.json'
PREVIOUS = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
FINGERPRINTS = json.loads(CACHE.read_text()) if CACHE.exists() else {}
NEXT_FINGERPRINTS = {}


def variants(task):
    name, widths = task
    source = ROOT / name
    digest = sha256(source.read_bytes()).hexdigest()[:12]
    fingerprint = {'hash': digest, 'widths': sorted(widths), 'recipe': 'lossless-lanczos-v1'}
    NEXT_FINGERPRINTS[name] = fingerprint
    if FINGERPRINTS.get(name) == fingerprint and name in PREVIOUS and all((ROOT / v['image']).is_file() for v in PREVIOUS[name]):
        return name, PREVIOUS[name]
    with Image.open(source) as opened:
        original = ImageOps.exif_transpose(opened)
        original.load()
        width, height = original.size
        result = [{'image': name, 'width': width}]
        for target in widths:
            if target >= width:
                continue
            destination = OUTPUT / f'{source.stem}-{digest}-{target}.webp'
            if not destination.exists():
                resized = original.resize((target, round(height * target / width)), Image.Resampling.LANCZOS)
                resized.save(destination, 'WEBP', lossless=True, exact=True, method=6,
                             icc_profile=opened.info.get('icc_profile', b''))
            # A smaller pixel count is not a benefit if its transfer is larger.
            if destination.stat().st_size < source.stat().st_size:
                result.append({'image': destination.relative_to(ROOT).as_posix(), 'width': target})
        return name, sorted(result, key=lambda v: v['width'])


def build():
    OUTPUT.mkdir(exist_ok=True)
    items = json.loads((ROOT / 'data/objects.json').read_text())
    tasks = {item['image']: {192, 256, 480, 960, 1440} for item in items}
    # Existing larger canvas derivatives remain available through the catalog.
    for item in items:
        for photo in item['gallery']:
            tasks.setdefault(photo['image'], set()).update((640, 960, 1440, 1920))
    with ThreadPoolExecutor(max_workers=4) as pool:
        manifest = dict(pool.map(variants, sorted(tasks.items())))
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    CACHE.write_text(json.dumps(NEXT_FINGERPRINTS, indent=2, sort_keys=True) + '\n')
    used = {v['image'] for group in manifest.values() for v in group}
    for generated in OUTPUT.glob('*.webp'):
        if generated.relative_to(ROOT).as_posix() not in used:
            generated.unlink()
    print(f'Finds responsive delivery: {len(manifest)} original photos; lossless copies, no upscaling')


if __name__ == '__main__':
    build()
