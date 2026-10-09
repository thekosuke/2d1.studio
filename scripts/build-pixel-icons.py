"""Export the 2D1 contact icons as square-grid SVGs and transparent PNGs.

Development only: PNGs and the review sheet require Pillow.
Run from any directory with: python3 scripts/build-pixel-icons.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "img/icons"
PREVIEW = ROOT / "_previews/pixel-icons"
RED = "#FF2B00"
BEIGE = "#FAF0E6"
INK = "#16161A"

# One character = one square module. All icons share the existing 9 × 9 grid.
ICONS = {
    "email": ("Email", [
        ".........",
        "#########",
        "##.....##",
        "#.#...#.#",
        "#..#.#..#",
        "#...#...#",
        "#.......#",
        "#########",
        ".........",
    ]),
    "globe": ("Website", [
        "..#####..",
        ".#.#.#.#.",
        "#..#.#..#",
        "#..#.#..#",
        "#########",
        "#..#.#..#",
        "#..#.#..#",
        ".#.#.#.#.",
        "..#####..",
    ]),
    "at": ("At sign", [
        "..#####..",
        ".#.....#.",
        "#..###..#",
        "#.#..#..#",
        "#.#..#..#",
        "#..#####.",
        "#........",
        ".#.......",
        "..#####..",
    ]),
}


def rects(rows):
    """Combine each horizontal run to keep SVGs compact and editable."""
    for y, row in enumerate(rows):
        x = 0
        while x < 9:
            if row[x] == ".":
                x += 1
                continue
            end = x + 1
            while end < 9 and row[end] == "#":
                end += 1
            yield x, y, end - x
            x = end


def raster(rows, size, color=RED):
    image = Image.new("RGBA", (9, 9))
    draw = ImageDraw.Draw(image)
    for x, y, width in rects(rows):
        draw.rectangle((x, y, x + width - 1, y), fill=color)
    return image.resize((size, size), Image.Resampling.NEAREST)


def font(size):
    return ImageFont.truetype(str(ROOT / "fonts/SC Walla Trial/OTF/SCWallaUnlicensedTrial-Regular.otf"), size)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGB", (1200, 690), BEIGE)
    draw = ImageDraw.Draw(sheet)
    draw.text((60, 44), "2D1 / CONTACT ICONS", font=font(18), fill=INK)
    draw.text((60, 76), "Square pixels. A familiar language.", font=font(28), fill=INK)
    for i, (name, (label, rows)) in enumerate(ICONS.items()):
        assert len(rows) == 9 and all(len(row) == 9 for row in rows)
        rectangles = "\n".join(
            f'    <rect x="{x}" y="{y}" width="{width}" height="1"/>'
            for x, y, width in rects(rows)
        )
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" '
            'viewBox="0 0 9 9" fill="none" shape-rendering="crispEdges" '
            'role="img" aria-labelledby="title">\n'
            f'  <title id="title">{label}</title>\n'
            f'  <g fill="{RED}">\n{rectangles}\n  </g>\n</svg>\n'
        )
        (OUTPUT / f"pixel-{name}.svg").write_text(svg)
        raster(rows, 576).save(OUTPUT / f"pixel-{name}.png")
        center = 240 + i * 360
        large = raster(rows, 180)
        sheet.paste(large, (center - 90, 164), large)
        draw.text((center, 386), "@" if name == "at" else label,
                  anchor="mm", font=font(23), fill=INK)
        for offset, size in [(-70, 27), (0, 36), (79, 54)]:
            small = raster(rows, size, INK)
            x, y = center + offset - size // 2, 475 - size // 2
            sheet.paste(small, (x, y), small)
            draw.text((center + offset, 524), str(size),
                      anchor="mm", font=font(14), fill="#5B5B61")
    draw.text((60, 614), "9 × 9 grid / Icon Red #FF2B00 / Transparent SVG + PNG",
              font=font(17), fill=INK)
    sheet.save(PREVIEW / "contact-icons.png")
    print(f"Exported three SVGs, three transparent PNGs, and {PREVIEW / 'contact-icons.png'}")


if __name__ == "__main__":
    main()
