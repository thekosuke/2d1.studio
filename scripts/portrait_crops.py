# Art-directed 3:4 portrait variants of the supplied 16:9 project images.
import sys
from PIL import Image, ImageFilter
SRC = {'02':'02.webp','03':'03.webp','04':'04-poster.webp','05':'05.webp','06':'06.webp','07':'07.webp','08':'08.webp','09':'09.webp','10':'10.webp','11':'11.webp','12':'12.webp'}
# cover: focal x (0..1). extend: keep x-range, fill 'blur' or 'flat'.
PLAN = {'02':('extend',.155,.845,'blur'),'06':('extend',.155,.845,'flat'),
        '03':('cover',.245),'04':('cover',.345),'05':('cover',.55),'07':('cover',.28),'08':('cover',.6),
        '09':('cover',.5),'10':('cover',.215),'11':('cover',.36),'12':('cover',.47)}
def build(n, W=1500):
    im = Image.open(SRC[n]).convert('RGB'); w, h = im.size; T = int(W * 4 / 3)
    p = PLAN[n]
    if p[0] == 'cover':
        cw = h * 3 / 4; x0 = min(max(p[1] * w - cw / 2, 0), w - cw)
        return im.crop((round(x0), 0, round(x0 + cw), h)).resize((W, T), Image.LANCZOS)
    _, a, b, fill = p
    crop = im.crop((round(a * w), 0, round(b * w), h))
    sh = round(crop.height * W / crop.width); crop = crop.resize((W, sh), Image.LANCZOS)
    pad = (T - sh) // 2; out = Image.new('RGB', (W, T))
    if fill == 'flat':
        out.paste(crop.getpixel((W // 2, 4)), (0, 0, W, T)); out.paste(crop, (0, pad)); return out
    top = crop.crop((0, 0, W, pad)).transpose(Image.FLIP_TOP_BOTTOM)
    bot = crop.crop((0, sh - (T - sh - pad), W, sh)).transpose(Image.FLIP_TOP_BOTTOM)
    out.paste(crop, (0, pad)); out.paste(top, (0, 0)); out.paste(bot, (0, pad + sh))
    blurred = out.filter(ImageFilter.GaussianBlur(60))
    mask = Image.new('L', (W, T), 0); feather = 140
    for y in range(T):
        d = min(y - pad, pad + sh - y)  # distance inside the original image
        mask.paste(0 if d > feather else int(255 * (1 - max(d, 0) / feather)), (0, y, W, y + 1))
    return Image.composite(blurred, out, mask)
if __name__ == '__main__':
    outdir = sys.argv[1]
    for n in PLAN:
        big = build(n)
        for width in (600, 1200):
            big.resize((width, width * 4 // 3), Image.LANCZOS).save(f'{outdir}/{n}-p{width}.webp', 'WEBP', quality=80, method=6)
        print(n, 'ok')
