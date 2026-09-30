# Familiar Characters (parked)

The Familiar Characters page (an index of objects, the House view, and the
overlay each one opened in) was removed from the site on 2026-09-30 and
replaced by the About page. Nothing here is published: GitHub Pages skips
folders that start with `_`.

Its source is kept here in case it comes back:

- `content/`: the Characters, their photographs, and `collection.md`
- `build_characters.py`: the generator (Python 3.9+, Pillow)
- `characters.css`, `characters.js`, `house.js`: its styles and scripts

To bring it back, move `content/` to `_familiar-characters/`,
`build_characters.py` to `scripts/`, the CSS to `css/`, the scripts to `js/`,
add a link in the bar, and run `python3 scripts/build_characters.py`.

To remove it for good, delete this folder.
