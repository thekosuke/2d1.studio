"""Audit native Finds files, never alter photos. Requires Pillow (development only)."""
from pathlib import Path
from collections import Counter
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
items=json.loads((ROOT/'data/objects.json').read_text())
review_file=ROOT/'docs/FINDS-DISTINCTNESS-REVIEW.json'
visual_reviews={x['id']:x for x in json.loads(review_file.read_text()).get('products',[])} if review_file.exists() else {}
report=[]
for item in items:
    image=Image.open(ROOT/item['image'])
    alpha=image.convert('RGBA').getchannel('A') if 'A' in image.getbands() or 'transparency' in image.info else None
    transparent=alpha is not None and alpha.getextrema()[0]<255
    photos=[];hashes=[];fingerprints=[]
    for photo in item.get('gallery',[]):
        file=ROOT/photo['image'];im=Image.open(file);digest=hashlib.sha256(file.read_bytes()).hexdigest();hashes.append(digest)
        gray=im.convert('L').resize((9,8));pixels=[gray.getpixel((c,r)) for r in range(8) for c in range(9)];fingerprints.append(sum((pixels[r*9+c]>pixels[r*9+c+1]) << (r*8+c) for r in range(8) for c in range(8)))
        photos.append({'image':photo['image'],'width':im.width,'height':im.height,'nativeLongEdgeAtLeast1200':max(im.size)>=1200,'sha256':digest,'sourceUrl':photo['sourceUrl'],'sourceImageUrl':photo.get('sourceImageUrl')})
    possible_duplicates=[[a+1,b+1] for a in range(len(fingerprints)) for b in range(a+1,len(fingerprints)) if bin(fingerprints[a]^fingerprints[b]).count('1')<=4]
    native_subject=item.get('imageTreatment',{}).get('subjectPixels')
    issues=[]
    if native_subject and max(native_subject)<1200:issues.append('Primary native product detail below 1200px long edge')
    if not transparent:issues.append('Primary photograph has no transparency')
    if not 1<=len(photos)<=4:issues.append('Gallery needs 1–4 distinct photographs')
    if len(set(hashes))<len(hashes):issues.append('Byte-identical duplicate photographs')
    if any(not p['nativeLongEdgeAtLeast1200'] for p in photos):issues.append('One or more photographs below 1200px long edge')
    review=visual_reviews.get(item['id'],{})
    reviewed_distinct=review.get('decision')=='keep_flagged_images' and [x.get('sha256') for x in review.get('images',[])]==hashes
    if possible_duplicates and not reviewed_distinct:issues.append('Possible visually similar views need manual distinctness review')
    if item.get('colorwayEvidence',{}).get('status') not in ['verified_launch','verified_iconic','owner_exception','not_applicable']:issues.append('Original/iconic colorway evidence remains unresolved')
    report.append({'id':item['id'],'name':item['name'],'brand':item['brand'],'selectedVariant':item.get('variantName',item['name']),'transparentPrimary':transparent,'primaryPixels':list(image.size),'primaryNativeSubjectPixels':native_subject,'subjectBounds':list(alpha.getbbox()) if transparent else None,'galleryCount':len(photos),'possibleSimilarPhotoPairs':possible_duplicates,'distinctnessReview':review.get('finding') if reviewed_distinct else None,'photos':photos,'issues':issues,'colorwayEvidence':item.get('colorwayEvidence',{}),'editorialReview':item.get('catalogAudit',{})})
output={'criteria':{'minimumPhotos':1,'maximumPhotos':4,'minimumNativeLongEdge':1200,'note':'Dimensions alone do not prove sharpness, distinct views or original/iconic color. Human source and visual review remains required; never upscale or duplicate to pass.'},'products':report}
(ROOT/'docs/FINDS-AUDIT.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')

lines=['# Finds photograph audit','', 'Target: 1–4 distinct authentic photos per product, native long edge ≥1200px with meaningful resolved detail; transparent primary image; verified original/iconic colorway. Counts alone are not certification.','', '| Product | Gallery photos | Transparent primary | Issues / source review |','| --- | ---: | --- | --- |']
for product in report:
    note='; '.join(product['issues']) or 'Automated checks passed; visual/source review still required'
    review=product['editorialReview']
    if review:note+='; '+'; '.join(review.get('notes',[])+review.get('sourceLimitations',[]))
    lines.append(f"| {product['brand']} — {product['name']} | {product['galleryCount']} | {'Yes' if product['transparentPrimary'] else 'No'} | {note.replace('|','/')} |")
(ROOT/'docs/FINDS-AUDIT.md').write_text('\n'.join(lines)+'\n')

print(f'{len(report)} products; {sum(p["transparentPrimary"] for p in report)} transparent primary images; {sum(1<=p["galleryCount"]<=4 for p in report)} galleries within numeric target. See docs/FINDS-AUDIT.json; numeric target is not a quality certification.')
