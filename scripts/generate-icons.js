const fs = require('fs');
const path = require('path');

// Source icon path
const srcIcon = 'C:\\Users\\Michael\\.gemini\\antigravity-ide\\brain\\9b8895ea-e801-4418-9027-2b6506eee3cf\\trip_app_icon_1783110413220.png';

// Android icon sizes per density
const sizes = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const resBase = 'android\\app\\src\\main\\res';

async function run() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch(e) {
    console.error('sharp not found, trying jimp...');
    return runJimp();
  }

  for (const { folder, size } of sizes) {
    const outDir = path.join(resBase, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // ic_launcher (square)
    await sharp(srcIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    // ic_launcher_round (circle mask)
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="black"/></svg>`
    );
    await sharp(srcIcon)
      .resize(size, size)
      .composite([{ input: circle, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground (slightly larger, 108dp equivalent)
    const fgSize = Math.round(size * 108/48);
    await sharp(srcIcon)
      .resize(fgSize, fgSize)
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`✅ ${folder} (${size}px) done`);
  }
  console.log('\n🎉 All icons replaced successfully!');
}

async function runJimp() {
  const Jimp = require('jimp');
  for (const { folder, size } of sizes) {
    const outDir = path.join(resBase, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const img = await Jimp.read(srcIcon);
    await img.clone().resize(size, size).writeAsync(path.join(outDir, 'ic_launcher.png'));
    await img.clone().resize(size, size).writeAsync(path.join(outDir, 'ic_launcher_round.png'));
    const fgSize = Math.round(size * 108/48);
    await img.clone().resize(fgSize, fgSize).writeAsync(path.join(outDir, 'ic_launcher_foreground.png'));
    console.log(`✅ ${folder} (${size}px) done`);
  }
  console.log('\n🎉 All icons replaced (jimp)!');
}

run().catch(console.error);
