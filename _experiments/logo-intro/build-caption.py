"""Outline the purchased font at the website's measured caption positions.
FontTools reads WOFF2 using Node's built-in Brotli decoder (no extra packages).
"""
import json, subprocess, sys, types
from pathlib import Path
brotli = types.ModuleType('brotli')
brotli.decompress = lambda data: subprocess.run(['node', '-e', "let a=[];process.stdin.on('data',d=>a.push(d));process.stdin.on('end',()=>process.stdout.write(require('zlib').brotliDecompressSync(Buffer.concat(a))))"], input=data, capture_output=True, check=True).stdout
sys.modules['brotli'] = brotli
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
here = Path(__file__).resolve().parent
reference = json.loads((here/'caption-reference.json').read_text())
font = TTFont(here/'../../fonts/SC Walla/SCWalla-Bold.woff2')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
# Captured while the website's 240px hero unit was docked at 40% (96px).
# Preserve all relative positions at the social animation's 720px logo width.
ratio = 720 / reference['logo']['width']
font_size = float(reference['fontSize'].removesuffix('px')) * .4 * ratio
unit = font_size/font['head'].unitsPerEm
height = 720*.16
baseline = height/2 + (font['hhea'].ascent+font['hhea'].descent)*unit/2
left = (reference['span']['x']-reference['logo']['x'])*ratio
paths = []
ink_bottom = 0
for char in reference['chars']:
    glyph = glyphs[cmap[ord(char['ch'].upper())]]
    pen = SVGPathPen(glyphs); glyph.draw(pen)
    if pen.getCommands():
        bounds=BoundsPen(glyphs); glyph.draw(bounds)
        ink_bottom=max(ink_bottom,baseline-bounds.bounds[1]*unit)
        paths.append(f'<path transform="translate({left+char["x"]*ratio:.6f} {baseline:.6f}) scale({unit:.8f} {-unit:.8f})" d="{pen.getCommands()}"/>')
(here/'caption.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 115.2" data-ink-bottom="{ink_bottom:.8f}">\n'+''.join(paths)+'\n</svg>\n')
