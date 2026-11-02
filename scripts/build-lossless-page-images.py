"""Lossless delivery for two existing page PNGs. Originals are retained."""
from hashlib import sha256
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT/'img/page-delivery'
MANIFEST = ROOT/'data/page-image-build.json'
previous = {row['source']:row['output'] for row in json.loads(MANIFEST.read_text())} if MANIFEST.exists() else {}
OUTPUT.mkdir(exist_ok=True)
report=[]
for source, targets in (
    ('img/projects/deepdrip/work-track-background.png', ['css/work-track.css']),
    ('img/shop/menu-note/memoru-app-icon.png', ['shop/index.html']),
):
    master=ROOT/source
    image=Image.open(master)
    options={'lossless':True,'exact':True,'method':6}
    if image.info.get('icc_profile'):
        options['icc_profile']=image.info['icc_profile']
    temporary=OUTPUT/(master.stem+'.working.webp')
    if image.info.get('exif'):
        options['exif']=image.info['exif']
    image.save(temporary,**options)
    delivered=Image.open(temporary)
    assert image.size==delivered.size
    assert image.convert('RGBA').tobytes()==delivered.convert('RGBA').tobytes(),source
    assert image.info.get('icc_profile')==delivered.info.get('icc_profile'),source
    encoded=temporary.read_bytes()
    assert len(encoded)<master.stat().st_size,source
    output='img/page-delivery/'+master.stem+'-'+sha256(encoded).hexdigest()[:12]+'.webp'
    temporary.replace(ROOT/output)
    for name in targets:
        file=ROOT/name
        content=file.read_text()
        old=[source]
        if source in previous:old.append(previous[source])
        for path in old:content=content.replace(path,output)
        file.write_text(content)
    report.append({'source':source,'sourceSHA256':sha256(master.read_bytes()).hexdigest(),'output':output,
                   'width':image.width,'height':image.height,'sourceBytes':master.stat().st_size,
                   'deliveredBytes':len(encoded),'decodedPixelsIdentical':True,'iccPreserved':True})
    print(f'{source}: {master.stat().st_size:,} → {len(encoded):,} bytes; identical decoded pixels.')
MANIFEST.write_text(json.dumps(report,indent=2)+'\n')
