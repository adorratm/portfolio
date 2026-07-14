const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function pngToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const buf of pngBuffers) {
    const meta = await sharp(buf).metadata();
    const w = meta.width >= 256 ? 0 : meta.width;
    const h = meta.height >= 256 ? 0 : meta.height;
    entries.push({ w, h, size: buf.length, offset, buf });
    offset += buf.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let entryOffset = 6;
  for (const e of entries) {
    out[entryOffset] = e.w;
    out[entryOffset + 1] = e.h;
    out[entryOffset + 2] = 0;
    out[entryOffset + 3] = 0;
    out.writeUInt16LE(1, entryOffset + 4);
    out.writeUInt16LE(32, entryOffset + 6);
    out.writeUInt32LE(e.size, entryOffset + 8);
    out.writeUInt32LE(e.offset, entryOffset + 12);
    e.buf.copy(out, e.offset);
    entryOffset += 16;
  }
  return out;
}

async function main() {
  const root = path.join(__dirname, '..');
  const src = path.join(root, 'public', 'icon.png');
  console.log('src', src, fs.existsSync(src));

  const sizes = [16, 32, 48, 256];
  const pngs = [];
  for (const s of sizes) {
    const buf = await sharp(src).resize(s, s).png().toBuffer();
    console.log('png', s, buf.length);
    pngs.push(buf);
  }

  const ico = await pngToIco(pngs);
  const appFavicon = path.join(root, 'src', 'app', 'favicon.ico');
  const publicFavicon = path.join(root, 'public', 'favicon.ico');
  const appIcon = path.join(root, 'src', 'app', 'icon.png');

  fs.writeFileSync(appFavicon, ico);
  fs.writeFileSync(publicFavicon, ico);
  await sharp(src).resize(512, 512).png().toFile(appIcon);

  console.log('wrote', appFavicon, ico.length);
  console.log('wrote', publicFavicon, ico.length);
  console.log('wrote', appIcon);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
