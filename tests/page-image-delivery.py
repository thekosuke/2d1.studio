"""Verify lossless page assets against retained PNG masters, including alpha/ICC."""
from hashlib import sha256
from pathlib import Path
import json
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
rows=json.loads((ROOT/'data/page-image-build.json').read_text())
for row in rows:
    source=ROOT/row['source'];target=ROOT/row['output']
    assert sha256(source.read_bytes()).hexdigest()==row['sourceSHA256'],row['source']
    assert sha256(target.read_bytes()).hexdigest()[:12] in target.name,row['output']
    a,b=Image.open(source),Image.open(target)
    assert a.size==b.size==(row['width'],row['height']),row['output']
    assert a.convert('RGBA').tobytes()==b.convert('RGBA').tobytes(),row['output']
    assert a.info.get('icc_profile')==b.info.get('icc_profile'),row['output']
    assert target.stat().st_size<source.stat().st_size,row['output']
print(f'PASS: {len(rows)} lossless page derivatives retain every decoded RGBA pixel, dimensions and ICC data.')
