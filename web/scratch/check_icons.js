import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../src/assets/icons');
const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const buf = fs.readFileSync(path.join(iconsDir, file));
  let pos = 8;
  const idat = [];
  let w = 0, h = 0;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      w = buf.readUInt32BE(pos + 8);
      h = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idat.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * 4 + 1;

  console.log('=== ' + file + ' ===');
  for (let r = 0; r < 8; r++) {
    let line = '';
    const y = Math.floor(r * h / 8);
    for (let c = 0; c < 16; c++) {
      const x = Math.floor(c * w / 16);
      const idx = y * stride + 1 + x * 4;
      const a = raw[idx + 3];
      const red = raw[idx], grn = raw[idx + 1], blu = raw[idx + 2];
      if (a < 50) line += ' . ';
      else if (red > 200 && grn > 150 && blu < 100) line += 'YEL';
      else if (grn > 140 && red < 140) line += 'GRN';
      else if (blu > 160 && red < 140) line += 'BLU';
      else if (red > 180 && grn < 100 && blu < 100) line += 'RED';
      else line += 'BLK';
    }
    console.log(line);
  }
}
