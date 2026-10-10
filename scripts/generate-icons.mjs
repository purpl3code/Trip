import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await readFile(path.join(root, 'src/assets/app-icon.svg'), 'utf8');
const res = path.join(root, 'android/app/src/main/res');
const densities = [
  ['mdpi', 48], ['hdpi', 72], ['xhdpi', 96], ['xxhdpi', 144], ['xxxhdpi', 192],
];

// Adaptive layers are 108dp; launchers display the central 72dp region.
const legacy = Buffer.from(source.replace('viewBox="0 0 108 108"', 'viewBox="18 18 72 72"'));
const foreground = Buffer.from(source.replace(/<rect[^>]*\/>/, ''));

for (const [density, size] of densities) {
  const directory = path.join(res, `mipmap-${density}`);
  await mkdir(directory, { recursive: true });
  const icon = await sharp(legacy, { density: 384 }).resize(size, size).png().toBuffer();
  await sharp(icon).toFile(path.join(directory, 'ic_launcher.png'));
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`);
  await sharp(icon).composite([{ input: mask, blend: 'dest-in' }]).png().toFile(path.join(directory, 'ic_launcher_round.png'));
  const foregroundSize = size * 108 / 48;
  await sharp(foreground, { density: 384 }).resize(foregroundSize, foregroundSize).png().toFile(path.join(directory, 'ic_launcher_foreground.png'));
  console.log(`Updated ${density}: ${size}px, foreground ${foregroundSize}px`);
}
