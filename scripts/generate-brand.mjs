import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'docs/brand');
await mkdir(out, { recursive: true });
const symbol = await readFile(path.join(root, 'src/assets/trip-symbol.svg'), 'utf8');
const wordmark = await readFile(path.join(root, 'src/assets/trip-wordmark.svg'), 'utf8');
const contents = source => [...source.matchAll(/<path\b[^>]*\/>/g)].map(m => m[0]).join('');
const mark = contents(symbol);
const word = contents(wordmark);
const svg = (w,h,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>Trip — Norte aberto</title>${body}</svg>\n`;
for (const [name,color] of Object.entries({ink:'#221506',black:'#000000',white:'#ffffff',amber:'#ffad32'})) {
  const variants = {
    symbol: svg(256,256,`<g fill="${color}">${mark}</g>`),
    horizontal: svg(480,160,`<g fill="${color}"><g transform="scale(.625)">${mark}</g><g transform="translate(190 42) scale(1.1)">${word}</g></g>`),
    stacked: svg(256,350,`<g fill="${color}">${mark}<g transform="translate(9 266)">${word}</g></g>`),
    wordmark: svg(238,76,`<g fill="${color}">${word}</g>`),
  };
  for (const [layout,source] of Object.entries(variants)) await writeFile(path.join(out,`trip-${layout}-${name}.svg`),source);
}
const icon = svg(256,256,`<rect width="256" height="256" rx="56" fill="#ffad32"/><g transform="translate(32 32) scale(.75)" fill="#221506">${mark}</g>`);
await writeFile(path.join(out,'trip-app-icon.svg'),icon);
await writeFile(path.join(root,'public/favicon.svg'),icon);
for (const size of [16,32,48,64,192,512]) {
  const png = await sharp(Buffer.from(icon)).resize(size,size).png().toBuffer();
  await writeFile(path.join(out,`trip-icon-${size}.png`),png);
  if ([192,512].includes(size)) await writeFile(path.join(root,`public/icon-${size}.png`),png);
}
await sharp(Buffer.from(icon)).resize(180,180).png().toFile(path.join(root,'public/apple-touch-icon.png'));
const png = await sharp(Buffer.from(icon)).resize(32,32).png().toBuffer();
const ico = Buffer.alloc(22); ico.writeUInt16LE(1,2); ico.writeUInt16LE(1,4);
ico[6]=32; ico[7]=32; ico.writeUInt16LE(1,10); ico.writeUInt16LE(32,12);
ico.writeUInt32LE(png.length,14); ico.writeUInt32LE(22,18);
await writeFile(path.join(root,'public/favicon.ico'),Buffer.concat([ico,png]));
await writeFile(path.join(root,'public/site.webmanifest'),JSON.stringify({name:'Trip',short_name:'Trip',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}],theme_color:'#ffad32',background_color:'#0d1117',display:'standalone',start_url:'/'},null,2)+'\n');
console.log('Generated Trip logo kit, favicon and web icons.');
