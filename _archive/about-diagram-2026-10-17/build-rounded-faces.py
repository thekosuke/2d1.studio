"""Draw the About toy-block house. Run build-japanese.py afterward.

Three solid blocks support one triangular roof block. The shallow parallel
projection preserves the familiar house silhouette and keeps room names legible.
Output is static SVG, enhanced by house-assembly.js when motion is enabled.
"""
from pathlib import Path
from math import hypot

ROOT = Path(__file__).resolve().parent.parent


def point(x, y, z=0):
    return f'{120 + .95*x + .5*y:.1f},{570 + .15*x - .4*y - z:.1f}'


def path(points, close=False, cls='house-edge'):
    if close:
        # Small quadratic fillets soften the actual silhouette, not only the
        # stroke joins. Identical face geometry keeps fills and hatching aligned.
        vertices = [tuple(map(float, point(*p).split(','))) for p in points]
        radius = 6 if cls == 'house-bevel' else 16
        corners = []
        for i, vertex in enumerate(vertices):
            prev, nxt = vertices[i-1], vertices[(i+1) % len(vertices)]
            before = hypot(prev[0]-vertex[0], prev[1]-vertex[1])
            after = hypot(nxt[0]-vertex[0], nxt[1]-vertex[1])
            trim = min(radius, before/3, after/3)
            entry = tuple(vertex[j] + (prev[j]-vertex[j])*trim/before for j in range(2))
            leave = tuple(vertex[j] + (nxt[j]-vertex[j])*trim/after for j in range(2))
            fmt = lambda p: f'{p[0]:.1f},{p[1]:.1f}'
            corners.append((fmt(entry), fmt(vertex), fmt(leave)))
        d = 'M' + corners[0][0]
        for i, (entry, vertex, leave) in enumerate(corners):
            d += ((' L' + entry) if i else '') + f' Q{vertex} {leave}'
        d += ' Z'
    else:
        d = 'M' + ' L'.join(point(*p) for p in points)
    return f'<path class="{cls}" d="{d}"/>'


parts = [
    '<svg class="design-house-diagram" viewBox="30 -10 890 760" role="img" aria-labelledby="design-house-description">',
    '<title id="design-house-description">2D1 design house with three rooms: Studio, Shop, and Finds.</title>',
    '<defs><pattern id="house-section-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 8L8 0M7 9L9 7" fill="none" stroke="currentColor" stroke-width=".7"/></pattern></defs>',
    '<g aria-hidden="true">',
]

# Three building blocks. Draw the farthest block first so all joints occlude
# correctly. Each visible side shares the exact same parallel projection.
for index, (x, label) in enumerate([(0, 'Studio'), (232, 'Shop'), (464, 'Finds')]):
    right = x + 220
    cx, cy = point(x + 110, 110, 120).split(',')
    parts += [f'<g class="house-piece" data-house-piece="{index}" data-pivot="{cx} {cy}">']
    parts += [
        path([(x,0,240),(right,0,240),(right,240,240),(x,240,240)], True, 'house-wall'),
        path([(right,0,0),(right,240,0),(right,240,240),(right,0,240)], True, 'house-wall'),
        path([(right,0,0),(right,240,0),(right,240,240),(right,0,240)], True, 'house-shading'),
        path([(x,0,0),(right,0,0),(right,0,240),(x,0,240)], True, 'house-wall'),
    ]

    # The inset face makes the pieces feel like substantial, milled toy blocks.
    parts.append(path([(x+10,0,10),(right-10,0,10),(right-10,0,230),(x+10,0,230)], True, 'house-bevel'))
    px, py = point(x + 110, 0, 110).split(',')
    parts += [f'<text class="house-room-label" text-anchor="middle" transform="matrix(.95 .15 0 1 {px} {py})">{label}</text>', '</g>']

# One solid triangular prism sits directly on the blocks. The front gable is
# dominant, with just enough depth to read as a wooden construction toy.
left, right, ridge = -20, 704, 342
front, back, eave, peak = -12, 252, 240, 470
parts.append('<g class="house-piece" data-house-piece="3" data-pivot="505 270">')
parts += [
    path([(left,front,eave),(ridge,front,peak),(ridge,back,peak),(left,back,eave)], True, 'house-roof'),
    path([(ridge,front,peak),(right,front,eave),(right,back,eave),(ridge,back,peak)], True, 'house-roof'),
    path([(ridge,front,peak),(right,front,eave),(right,back,eave),(ridge,back,peak)], True, 'house-shading'),
    path([(left,front,eave),(right,front,eave),(ridge,front,peak)], True, 'house-roof'),
]

# Logo and room names are printed on the front faces, following their plane.
px, py = point(254, front, 351).split(',')
parts.append(f'<image href="../img/brand/logo_white.svg" width="176" height="59.4" transform="matrix(.95 .15 0 1 {px} {py})"/>')
parts.append('</g>')

parts += ['</g>', '</svg>']
svg = '\n            '.join(parts)
page = ROOT / 'about/index.html'
source = page.read_text()
start = source.index('<svg class="design-house-diagram"')
end = source.index('</svg>', start) + len('</svg>')
page.write_text(source[:start] + svg + source[end:])
print('Updated About toy-block house')
