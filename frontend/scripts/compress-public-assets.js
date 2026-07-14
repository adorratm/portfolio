const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pub = path.join(__dirname, '..', 'public');

async function main() {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" rx="96" fill="#282a36"/>
    <text x="256" y="310" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="220" font-weight="700" fill="#8be9fd">EK</text>
  </svg>`);

  const iconPath = path.join(pub, 'icon.png');
  const applePath = path.join(pub, 'apple-touch-icon.png');
  const ogPath = path.join(pub, 'og-image.jpg');
  const ogTmp = path.join(pub, '_og-tmp.jpg');

  await sharp(svg).png({ compressionLevel: 9 }).toFile(iconPath);
  await sharp(svg).resize(180, 180).png({ compressionLevel: 9 }).toFile(applePath);
  await sharp(ogPath)
    .resize(1200, 630, { fit: 'inside' })
    .jpeg({ quality: 68, mozjpeg: true })
    .toFile(ogTmp);
  fs.renameSync(ogTmp, ogPath);

  console.log('icon', fs.statSync(iconPath).size);
  console.log('apple', fs.statSync(applePath).size);
  console.log('og', fs.statSync(ogPath).size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
