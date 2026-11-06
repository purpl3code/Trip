import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const symbol = await readFile(path.join(root, 'src/assets/trip-symbol.svg'), 'utf8');
const paths = [...symbol.matchAll(/<path\b[^>]*\/>/g)].map(match => match[0]);
const drawing = paths.join('\n');
const source = `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108"><title>Trip — Norte aberto</title><rect width="108" height="108" fill="#ffad32"/><g transform="translate(21 21) scale(0.2578125)" fill="#221506">${drawing}</g></svg>\n`;
await writeFile(path.join(root, 'src/assets/app-icon.svg'), source);
const res = path.join(root, 'android/app/src/main/res');
const vectorPaths = paths.map(p => `<path android:fillColor="#221506" android:fillType="evenOdd" android:pathData="${p.match(/\bd="([^"]+)"/)[1]}"/>`).join('\n    ');
await writeFile(path.join(res, 'drawable/ic_launcher_foreground.xml'), `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><group android:translateX="21" android:translateY="21" android:scaleX="0.2578125" android:scaleY="0.2578125">\n    ${vectorPaths}\n</group></vector>\n`);
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
