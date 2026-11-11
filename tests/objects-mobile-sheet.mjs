import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../css/collection-view.css',import.meta.url),'utf8');
const source=readFileSync(new URL('../js/objects.js',import.meta.url),'utf8');
// The old swipe deck was replaced by a native vertical square-photo gallery.
assert.match(css,/objects-dialog-photo\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
assert.match(css,/aspect-ratio:1;object-fit:cover/);
assert.match(css,/@media\(max-width:767px\)/);
assert.match(css,/objects-dialog-copy\{grid-column:1;grid-row:1/);
assert.match(css,/position:sticky;top:0;min-height:100dvh/);
assert.match(source,/objects-dialog-credit'\)\.before\(detailAction\)/);
assert.match(source,/animateProductIn\(origin\);/);
assert.match(source,/productOrigin=canvasOrigin/);
assert.match(source,/if\(reduced.matches\|\|!origin\?\.width\)return/);
console.log('PASS current gallery contracts: vertical square cover frames, mobile flow, desktop sticky pane, credit order and reduced-motion entrance guard.');
