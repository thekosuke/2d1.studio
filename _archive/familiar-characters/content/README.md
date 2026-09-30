# Familiar Characters: adding to the collection

This folder is the source of the Familiar Characters pages. It isn't published
(GitHub Pages skips folders that start with `_`). The pages in
`familiar-characters/` and the images in `img/characters/` are built from it by
`scripts/build_characters.py`; don't edit those by hand.

```
_familiar-characters/
  collection.md          the index: intro, order, filter, essay links, categories, tags
  characters/
    _template.md         copy this for a new Character
    012-clear-water-bottle.md
    …
  images/                one original photograph per Character, any size and shape
```

## Add a Character

1. Put its photograph in `images/`: JPEG, PNG (transparency is kept), or WebP.
   Any shape, background, or camera. 1800 px wide or more is best. The grid
   and the sheet never crop it; the House shows the middle of it as a square,
   tinted red. Location data in phone photos is removed.
2. Copy `characters/_template.md` to `characters/013-short-name.md`: the next
   number, then a few lowercase words joined by hyphens. The file name is the
   address: `2d1.studio/familiar-characters/013-short-name/`.
3. Fill in its settings, and write the note under the second `---`.
4. Build, then look at it:

   ```
   python3 scripts/build_characters.py
   python3 scripts/preview.py
   ```

   and open http://localhost:4173/familiar-characters/
5. Commit the new file, its photograph, and everything the build changed
   (`familiar-characters/`, `img/characters/`, `sitemap.xml`).

The build stops and says what's wrong if a setting is missing or misspelled.
`python3 scripts/build_characters.py --check` checks without writing anything.
It needs Python 3.9+ and Pillow (`python3 -m pip install Pillow`).

## Settings

One per line, `setting: value`. Lines starting with `#` are notes to yourself.

| Setting | | |
|---|---|---|
| `title` | required | The object's name, as the maker writes it. |
| `category` | required | One of the categories in `collection.md`. |
| `image` | required | `file \| alt text \| credit`. One photograph per Character. Alt text says what the photograph shows, for people who can't see it. |
| `maker` | | Brand, publisher, or `Anonymous`. |
| `designer` | | Shown as “Designed by …”. |
| `designer-label` | | Replaces “Designed by”, e.g. `Written by` for a book. |
| `year` | | Free text: `1958`, `c. 1970`. |
| `country`, `material`, `dimensions` | | Listed under Details. |
| `source` | | The maker's page, or somewhere to find it. Full address. |
| `kind` | | `found` (the default), `made-with` (with 2D1), or `made-by-2d1`. The last two are noted on the page. |
| `tags` | | From the list in `collection.md`, separated by commas. Not shown: they choose Related Characters now, and can drive filters later. |
| `added` | | The date it joined, `2026-09-29`. Shown as the month. |
| `summary` | | One line for the index card and search results. Defaults to the note's first sentence. |
| `placeholder` | | `yes` keeps the page out of search engines and the sitemap. |

The note: 50 to 200 words is typical; longer is fine. A blank line starts a new
paragraph, and links are written `[like this](https://example.com)`.

## Rules worth keeping

- **Numbers are permanent.** Never renumber, reuse a number, or rename a
  published file: the number and the address are how people find it again.
- **The order is the numbering.** The index and the House show the newest
  first (`order: newest` in `collection.md`), and Previous and Next follow the
  same order.
- To take a Character down, delete its file (and photograph) and build; its
  page and images are removed.

## The placeholders

All twelve current Characters (001–012) are placeholders, marked
`placeholder: yes`, with photographs labelled PLACEHOLDER. They're noindex and
not in the sitemap, and the index stays noindex while any placeholder remains.
When the real collection moves in, delete their files and photographs and start
again at 001.

## The index (collection.md)

- The paragraphs under the second `---` are the introduction.
- `filters: category` shows one quiet row of categories above the index, each
  with its count; `off` hides it.
- `essay-url` (a full address, or a path on this site like `/essays/…/`) turns
  on the essay links: “About Familiar Characters →” in the introduction, and
  the From the House module at the end, titled `essay-title`.
- `end-note` is the line at the end of the collection.
- `categories` and `tags` are the allowed values; add to them as needed.
