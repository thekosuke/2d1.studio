from pathlib import Path
import re,json
root=Path('.'); out=root/'_figma-export'
for lang in ['en','ja']:
 s=(root/('index.html' if lang=='en' else 'ja/index.html')).read_text()
 base='/' if lang=='en' else '/ja/'
 s=s.replace('<head>','<head>\n<base href="'+base+'">',1)
 s=s.replace('</head>','<link rel="stylesheet" href="/_figma-export/atlas.css"><link rel="stylesheet" href="/css/about.css?v=5"><script src="/_figma-export/atlas.js" defer></script><script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script></head>')
 s=s.replace('loading="lazy"','loading="eager"')
 (out/f'atlas-{lang}.html').write_text(s)
