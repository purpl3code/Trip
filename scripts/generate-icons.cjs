const fs = require('fs');
const path = require('path');

const srcIcon = 'C:\\Users\\Michael\\.gemini\\antigravity-ide\\brain\\9b8895ea-e801-4418-9027-2b6506eee3cf\\media__1783205524329.png';

// Android icon sizes per density
const sizes = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const resBase = path.join('android', 'app', 'src', 'main', 'res');

async function run() {
  const sharp = require('sharp');

  for (const { folder, size } of sizes) {
    const outDir = path.join(resBase, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // ic_launcher (square)
    await sharp(srcIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    // ic_launcher_round (circle)
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="black"/></svg>`
    );
    await sharp(srcIcon)
      .resize(size, size)
      .composite([{ input: circle, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground (108dp scale)
    const fgSize = Math.round(size * 108 / 48);
    await sharp(srcIcon)
      .resize(fgSize, fgSize)
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`✅ ${folder} (${size}px) done`);
  }
  console.log('\n🎉 All icons replaced successfully!');
}

run().catch(console.error);
