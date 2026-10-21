"""Build crisp square Home artwork tiles without cropping the web/mockup layouts."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'img/projects'
# Existing photographic square crops are intentional. Wide compositions receive
# their original project ground rather than losing the edges to a square crop.
SOURCES = {
    2: ('04-hq-1920.webp', '#deb5fe'),
    3: ('aviator/bottle-1279.webp', None),
    5: ('06-hq-2560.webp', '#ff2b00'),
    6: ('deepdrip/website-2816.webp', '#191416'),
    7: ('deepdrip/laptop-stickers-3200.webp', '#231712'),
    9: ('11-hq-2560.webp', '#e6eef4'),
}
for number in range(1, 12):
    name, ground = SOURCES.get(number, (f'studio-{number:02}-1120.webp', None))
    source = Image.open(DEST / name).convert('RGBA')
    if ground:
        base = Image.new('RGBA', source.size, ground)
        base.alpha_composite(source)
        source = base.convert('RGB')
    else:
        source = source.convert('RGB')
    for size in (560, 1120):
        if ground:
            canvas = Image.new('RGB', (size, size), ground)
            artwork = ImageOps.contain(source, (size, size), Image.Resampling.LANCZOS)
            canvas.paste(artwork, ((size-artwork.width)//2, (size-artwork.height)//2))
        else:
            canvas = ImageOps.fit(source, (size, size), Image.Resampling.LANCZOS)
        suffix = '-v2' if number == 3 else ''
        canvas.save(DEST / f'track-{number:02}{suffix}-{size}.webp', quality=95, method=6)
