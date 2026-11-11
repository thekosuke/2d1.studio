import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../familiarcharacters/index.html',import.meta.url),'utf8');
const redirect=readFileSync(new URL('../ja/familiarcharacters/index.html',import.meta.url),'utf8');
const data=JSON.parse(readFileSync(new URL('../data/objects.json',import.meta.url),'utf8'));
assert.match(redirect,/url=\/familiarcharacters\//);
assert.equal((html.match(/class="object-card"/g)||[]).length,data.length);
for(const item of data){assert.ok(html.includes(item.name.replaceAll('&','&amp;').replaceAll('"','&quot;')),item.id);}
assert.match(html,/class="object-open"/);
assert.doesNotMatch(html,/muji-porcelain-toothbrush-stand/);
console.log('PASS canonical collection route and complete static catalog fallback.');
