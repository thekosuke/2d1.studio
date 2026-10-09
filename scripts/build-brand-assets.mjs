/* Development-only SVG exports. Requires Sharp; no website runtime dependency. */
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');
const brand = new URL('../img/brand/', import.meta.url);
const logo = await readFile(new URL('logo_red.svg', brand), 'utf8');
const artwork = logo.replace(/<svg[^>]*>/, '').replace('</svg>', '').trim();
const [,, logoWidth, logoHeight] = logo.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
function tile(width, height, markWidth) {
  const scale = markWidth / logoWidth;
  const x = (width - markWidth) / 2;
  const y = (height - logoHeight * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#FAF0E6"/><g transform="translate(${x} ${y}) scale(${scale})">${artwork}</g></svg>\n`;
}
const square = tile(400, 400, 280);
await writeFile(new URL('2d1-icon.svg', brand), square);
for (const [name, size] of [['2d1-icon.png', 32], ['2d1-apple-touch.png', 180], ['2d1-brand.png', 512]]) {
  await sharp(Buffer.from(square), { density: 384 }).resize(size, size).png().toFile(new URL(name, brand).pathname);
}
const social = tile(1200, 630, 600);
await writeFile(new URL('2d1-social.svg', brand), social);
await sharp(Buffer.from(social)).png().toFile(new URL('2d1-social.png', brand).pathname);
// Multi-resolution ICO: PNG entries retain clean antialiasing at small sizes.
const sizes = [16, 32, 48];
const entries = await Promise.all(sizes.map(size => sharp(Buffer.from(square), { density: 384 }).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + 16 * entries.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(entries.length, 4);
let offset = directory.length;
entries.forEach((entry, i) => {
  const pos = 6 + i * 16;
  directory[pos] = sizes[i]; directory[pos + 1] = sizes[i];
  directory.writeUInt16LE(1, pos + 4); directory.writeUInt16LE(32, pos + 6);
  directory.writeUInt32LE(entry.length, pos + 8); directory.writeUInt32LE(offset, pos + 12);
  offset += entry.length;
});
await writeFile(new URL('2d1-icon.ico', brand), Buffer.concat([directory, ...entries]));
console.log('Exported red-on-beige browser icons, Apple touch icon, brand tile and social card.');
