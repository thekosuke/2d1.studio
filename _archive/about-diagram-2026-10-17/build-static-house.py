"""Draw the About toy-block house. Run build-japanese.py afterward.

Three solid blocks support one triangular roof block. The shallow parallel
projection preserves the familiar house silhouette and keeps room names legible.
Output is static SVG: no runtime drawing or motion is required.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def point(x, y, z=0):
    return f'{120 + .95*x + .5*y:.1f},{570 + .15*x - .4*y - z:.1f}'


def path(points, close=False, cls='house-edge'):
    d = 'M' + ' L'.join(point(*p) for p in points) + (' Z' if close else '')
    return f'<path class="{cls}" d="{d}"/>'


parts = [
    '<svg class="design-house-diagram" viewBox="30 -10 890 760" role="img" aria-labelledby="design-house-description">',
    '<title id="design-house-description">2D1 design house with three rooms: Studio, Shop, and Finds.</title>',
    '<defs><pattern id="house-section-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 8L8 0M7 9L9 7" fill="none" stroke="currentColor" stroke-width=".7"/></pattern></defs>',
    '<g aria-hidden="true">',
]

# Three building blocks. Draw the farthest block first so all joints occlude
# correctly. Each visible side shares the exact same parallel projection.
for x in [0, 224, 448]:
    right = x + 220
    parts += [
        path([(x,0,220),(right,0,220),(right,220,220),(x,220,220)], True, 'house-wall'),
        path([(right,0,0),(right,220,0),(right,220,220),(right,0,220)], True, 'house-wall'),
        path([(right,0,0),(right,220,0),(right,220,220),(right,0,220)], True, 'house-shading'),
        path([(x,0,0),(right,0,0),(right,0,220),(x,0,220)], True, 'house-wall'),
    ]

# One solid triangular prism sits directly on the blocks. The front gable is
# dominant, with just enough depth to read as a wooden construction toy.
left, right, ridge = -16, 684, 334
front, back, eave, peak = -12, 232, 220, 490
parts += [
    path([(left,front,eave),(ridge,front,peak),(ridge,back,peak),(left,back,eave)], True, 'house-roof'),
    path([(ridge,front,peak),(right,front,eave),(right,back,eave),(ridge,back,peak)], True, 'house-roof'),
    path([(ridge,front,peak),(right,front,eave),(right,back,eave),(ridge,back,peak)], True, 'house-shading'),
    path([(left,front,eave),(right,front,eave),(ridge,front,peak)], True, 'house-roof'),
]

# Logo and room names are printed on the front faces, following their plane.
px, py = point(246, front, 351).split(',')
parts.append(f'<image href="../img/brand/logo_white.svg" width="176" height="59.4" transform="matrix(.95 .15 0 1 {px} {py})"/>')
for x, label in [(110, 'Studio'), (334, 'Shop'), (558, 'Finds')]:
    px, py = point(x, 0, 102).split(',')
    parts.append(f'<text class="house-room-label" text-anchor="middle" transform="matrix(.95 .15 0 1 {px} {py})">{label}</text>')

parts += ['</g>', '</svg>']
svg = '\n            '.join(parts)
page = ROOT / 'about/index.html'
source = page.read_text()
start = source.index('<svg class="design-house-diagram"')
end = source.index('</svg>', start) + len('</svg>')
page.write_text(source[:start] + svg + source[end:])
print('Updated About toy-block house')
