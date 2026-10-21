"""Build outlined Season specimen assets from locally installed desktop fonts.
No font binaries are copied to the site. Source trials: ~/Library/Fonts.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from xml.sax.saxutils import escape

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'img/projects/aviator'
FONTS=Path.home()/'Library/Fonts'
cache={}
def type_line(text,family,x,y,size,fill,max_width=None,italic=False):
    name=f'Season{family}-TRIAL-Regular'+('Italic' if italic else '')+'.ttf'
    if name not in cache:cache[name]=TTFont(FONTS/name)
    font=cache[name];glyphs=font.getGlyphSet();cmap=font.getBestCmap()
    width=sum(glyphs[cmap[ord(c)]].width for c in text)
    scale=size/font['head'].unitsPerEm
    if max_width:scale=min(scale,max_width/width)
    paths=[];offset=0
    for char in text:
        glyph=glyphs[cmap[ord(char)]];pen=SVGPathPen(glyphs);glyph.draw(pen)
        paths.append(f'<path transform="translate({offset} 0)" d="{pen.getCommands()}"/>')
        offset+=glyph.width
    return f'<g fill="{fill}" transform="translate({x} {y}) scale({scale} {-scale})">'+''.join(paths)+'</g>'

purple='#DDB4FA';ink='#230B3D';paper='#F7F2FC'
css='''
.av-type .av-scene{animation-duration:18s;animation-iteration-count:infinite;animation-timing-function:cubic-bezier(.2,.8,.2,1);animation-play-state:var(--type-play-state,running)}
.av-type[data-motion-static] .av-scene,.av-type[data-motion-static] .av-rise{animation:none;transform:none}
.av-type .av-scene-one{animation-name:av-scene-one}
.av-type .av-scene-two{opacity:0;animation-name:av-scene-two}
.av-type .av-scene-three{opacity:0;animation-name:av-scene-three}
.av-type .av-rise{animation:av-rise 18s cubic-bezier(.2,.8,.2,1) infinite;animation-play-state:var(--type-play-state,running)}
@keyframes av-scene-one{0%,27%{opacity:1;transform:translateY(0)}31%,94%{opacity:0;transform:translateY(-24px)}98%,100%{opacity:1;transform:translateY(0)}}
@keyframes av-scene-two{0%,29%{opacity:0;transform:translateY(48px)}34%,60%{opacity:1;transform:translateY(0)}64%,100%{opacity:0;transform:translateY(-24px)}}
@keyframes av-scene-three{0%,62%{opacity:0;transform:translateY(48px)}67%,92%{opacity:1;transform:translateY(0)}97%,100%{opacity:0;transform:translateY(-24px)}}
@keyframes av-rise{0%{transform:translateY(36px);clip-path:inset(0 0 25% 0)}7%,26%{transform:translateY(0);clip-path:inset(0 0 0 0)}32%,94%{transform:translateY(-24px);clip-path:inset(0 0 0 0)}100%{transform:translateY(36px);clip-path:inset(0 0 25% 0)}}
@media(prefers-reduced-motion:reduce){.av-type .av-scene,.av-type .av-rise{animation:none!important;transform:none!important}.av-type .av-scene-one{opacity:1!important}.av-type .av-scene-two,.av-type .av-scene-three{opacity:0!important}}
'''
scenes=[]
s='<g class="av-scene av-scene-one">'+f'<rect width="1280" height="720" fill="{purple}"/>'
s+=f'<path d="M640 40V625" stroke="{ink}" stroke-opacity=".2"/>'
s+=type_line('Season Sans','Sans',48,65,24,ink)+type_line('Season Serif','Sans',688,65,24,ink)
s+='<g class="av-rise">'+type_line('Aa','Sans',52,505,390,ink,540)+type_line('Aa','Serif',680,505,390,ink,540)+'</g>'
s+=type_line('A shared structure.','Sans',48,605,20,ink)+type_line('A different voice.','Serif',688,605,22,ink,italic=True)+'</g>'
scenes.append(s)
s='<g class="av-scene av-scene-two">'+f'<rect width="1280" height="720" fill="{ink}"/>'
s+=type_line('Season Sans + Season Serif Italic','Sans',48,65,24,purple)
s+=type_line('The front door','Sans',70,327,145,paper,1140)
s+=type_line('to healthcare.','Serif',70,494,162,purple,1140,italic=True)
s+='</g>';scenes.append(s)
s='<g class="av-scene av-scene-three">'+f'<rect width="1280" height="720" fill="{paper}"/>'
s+=type_line('Season Sans','Sans',48,65,24,ink)+type_line('Aa Rr Gg','Sans',54,285,220,ink,1172)
s+=f'<path d="M48 340H1232" stroke="{ink}" stroke-opacity=".2"/>'
s+=type_line('Season Serif','Sans',48,390,24,ink)+type_line('Aa Rr Gg','Serif',54,585,220,ink,1172)
s+='</g>';scenes.append(s)
start='<svg xmlns="http://www.w3.org/2000/svg" class="av-type" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Season Sans and Season Serif: an animated typography study for Aviator">'
footer=''
svg=start+'<style>'+css+'</style>'+f'<rect width="1280" height="720" fill="{purple}"/>'+''.join(scenes)+footer+'</svg>'
(OUT/'season-typography.svg').write_text(svg+'\n')
poster=start+scenes[0]+footer+'</svg>'
(OUT/'season-typography-poster.svg').write_text(poster+'\n')
# Keep the embedded specimen static until the page observes it in view.
inline=svg.replace('class="av-type"','class="av-type" data-motion-static style="--type-play-state:paused"')
figure='<figure class="work-detail-image work-type-study" data-type-study data-art-tone="light">'+inline+'</figure>'
p=ROOT/'work/index.html';html=p.read_text()
start_marker='<!-- AVIATOR TYPOGRAPHY START -->';end_marker='<!-- AVIATOR TYPOGRAPHY END -->'
if start_marker in html:
 a=html.index(start_marker);b=html.index(end_marker,a)+len(end_marker)
 html=html[:a]+start_marker+figure+end_marker+html[b:]
else:
 anchor='<figure class="work-detail-image"><img src="../img/projects/04-960.webp"'
 at=html.index(anchor);html=html[:at]+start_marker+figure+end_marker+html[at:]
p.write_text(html)
print('Built animated SVG, static poster, and inline project specimen.')
