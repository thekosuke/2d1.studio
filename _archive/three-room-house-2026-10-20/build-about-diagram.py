"""Draw the About toy-block house; run build-japanese.py afterward.

Each piece has one rounded outer silhouette. Face seams and hatching are
clipped inside it, so adjacent faces cannot create overlapping corner strokes.
"""
from pathlib import Path
from math import hypot

ROOT = Path(__file__).resolve().parent.parent


def project(p):
    x, y, z = p
    return (120 + .95*x + .5*y, 570 + .15*x - .4*y - z)


def fmt(p):
    return f'{p[0]:.1f},{p[1]:.1f}'


def line(points, close=False):
    return 'M' + ' L'.join(fmt(project(p)) for p in points) + (' Z' if close else '')


def rounded(vertices, radius=16):
    corners = []
    for i, vertex in enumerate(vertices):
        prev, nxt = vertices[i-1], vertices[(i+1) % len(vertices)]
        before, after = hypot(prev[0]-vertex[0], prev[1]-vertex[1]), hypot(nxt[0]-vertex[0], nxt[1]-vertex[1])
        trim = min(radius, before/3, after/3)
        entry = tuple(vertex[j] + (prev[j]-vertex[j])*trim/before for j in range(2))
        leave = tuple(vertex[j] + (nxt[j]-vertex[j])*trim/after for j in range(2))
        corners.append((fmt(entry), fmt(vertex), fmt(leave)))
    d = 'M' + corners[0][0]
    for i, (entry, vertex, leave) in enumerate(corners):
        d += ((' L' + entry) if i else '') + f' Q{vertex} {leave}'
    return d + ' Z'


def hull(points):
    points = sorted(set(map(project, points)))
    def cross(o, a, b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    def half(seq):
        result = []
        for p in seq:
            while len(result) >= 2 and cross(result[-2], result[-1], p) <= 0:
                result.pop()
            result.append(p)
        return result
    return half(points)[:-1] + half(reversed(points))[:-1]


def piece(index, pivot, outline, shade, seams, extra=''):
    d = rounded(hull(outline))
    clip = f'house-piece-clip-{index}'
    return [
        f'<g class="house-piece" data-house-piece="{index}" data-pivot="{pivot}">',
        f'<defs><clipPath id="{clip}"><path d="{d}"/></clipPath></defs>',
        f'<path class="house-solid" d="{d}"/>',
        f'<g clip-path="url(#{clip})">',
        f'<path class="house-shading" d="{line(shade, True)}"/>',
        *[f'<path class="house-edge" d="{line(seam)}"/>' for seam in seams],
        extra,
        '</g>',
        f'<path class="house-edge" d="{d}"/>',
        '</g>',
    ]


parts = [
    '<svg class="design-house-diagram" viewBox="30 -10 890 760" role="img" aria-labelledby="design-house-description">',
    '<title id="design-house-description">2D1 design house with three rooms: Studio, Shop, and Finds.</title>',
    '<defs><pattern id="house-section-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 8L8 0M7 9L9 7" fill="none" stroke="currentColor" stroke-width=".7"/></pattern></defs>',
    '<g aria-hidden="true">',
]

for index, (x, label) in enumerate([(0, 'Studio'), (232, 'Shop'), (464, 'Finds')]):
    right = x + 220
    a, b, c = (x,0,0), (right,0,0), (right,240,0)
    d, e, f, g = (right,240,240), (x,240,240), (x,0,240), (right,0,240)
    bevel = rounded([project(p) for p in [(x+10,0,10),(right-10,0,10),(right-10,0,230),(x+10,0,230)]], 6)
    px, py = project((x+110,0,110))
    extra = f'<path class="house-bevel" d="{bevel}"/><text class="house-room-label" text-anchor="middle" transform="matrix(.95 .15 0 1 {px:.1f} {py:.1f})">{label}</text>'
    pivot = ' '.join(f'{n:.1f}' for n in project((x+110,110,120)))
    parts += piece(index, pivot, [a,b,c,d,e,f], [b,c,d,g], [[f,g,d],[g,b]], extra)

# Triangular roof prism: one outline and one continuous ridge/gable junction.
a, b, f = (-20,-12,240), (704,-12,240), (342,-12,470)
c, d, e = (704,252,240), (342,252,470), (-20,252,240)
px, py = project((254,-12,351))
logo = f'<image href="../img/brand/logo_white.svg" width="176" height="59.4" transform="matrix(.95 .15 0 1 {px:.1f} {py:.1f})"/>'
parts += piece(3, '505 270', [a,b,c,d,e,f], [f,b,c,d], [[a,f,b],[f,d]], logo)
parts += ['</g>', '</svg>']
svg = '\n            '.join(parts)
page = ROOT / 'about/index.html'
source = page.read_text()
start = source.index('<svg class="design-house-diagram"')
end = source.index('</svg>', start) + len('</svg>')
page.write_text(source[:start] + svg + source[end:])
print('Updated About house with continuous rounded silhouettes')
