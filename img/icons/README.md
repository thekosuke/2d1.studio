# 2D1 contact icons

Email, website globe, and a refined @ sign, drawn on the social icons’ 9 × 9
square grid. All geometry is horizontal/vertical, with transparent counters
and Icon Red (`#FF2B00`).

- `pixel-email.svg` / `.png`: envelope with a stepped fold.
- `pixel-globe.svg` / `.png`: stepped globe with meridians and an equator.
- `pixel-at.svg` / `.png`: open outer loop and distinct inner counter.

SVGs are editable vectors; PNGs are transparent 576 × 576 exports. SVGs
default to 27 × 27 px. Prefer multiples of nine (27, 36, 45, 54…) for crisp
pixel alignment. All three have the same canvas; the envelope is optically
centered with one blank row above and below.

For inline SVG use, replace the group’s fill with `currentColor`. Give each
inline instance a unique title ID, or remove its title and use
`aria-hidden="true"` when its containing link already has an accessible name.
For an image, supply an appropriate `alt` attribute.

Regenerate with `python3 scripts/build-pixel-icons.py` (Pillow required only
for development exports). The script also creates a review sheet in
`_previews/pixel-icons/contact-icons.png`, outside published Jekyll content.
These assets are not yet placed on the website.
