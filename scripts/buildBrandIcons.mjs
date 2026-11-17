/** Build platform icons from the original SynapseStudio infinity artwork.
 * No network access or third-party image processing is required.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { inflateSync, deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const isFlash = process.argv.includes('--flash');
const iconPath = resolve(ROOT, 'assets/synapse-icon.png');
const background = isFlash ? [8, 63, 79] : [37, 49, 31];
const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    }
  }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const label = Buffer.from(type, 'ascii');
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([label, data])));
  return Buffer.concat([head, label, data, crc]);
}
function readPng(path) {
  const file = readFileSync(path);
  if (!file.subarray(0, 8).equals(SIGNATURE)) throw new Error('Not PNG: ' + path);
  let cursor = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  let bitDepth = 0;
  let interlace = 0;
  const image = [];
  while (cursor < file.length) {
    const length = file.readUInt32BE(cursor);
    const kind = file.toString('ascii', cursor + 4, cursor + 8);
    const part = file.subarray(cursor + 8, cursor + 8 + length);
    cursor += length + 12;
    if (kind === 'IHDR') {
      width = part.readUInt32BE(0);
      height = part.readUInt32BE(4);
      bitDepth = part[8];
      channels = part[9] === 6 ? 4 : part[9] === 2 ? 3 : 0;
      interlace = part[12];
    } else if (kind === 'IDAT') image.push(part);
    else if (kind === 'IEND') break;
  }
  if (!width || !height || bitDepth !== 8 || !channels || interlace !== 0) {
    throw new Error('SynapseStudio source must be 8-bit, noninterlaced RGB(A) PNG');
  }
  const bytes = inflateSync(Buffer.concat(image));
  const pitch = width * channels;
  if (bytes.length !== height * (pitch + 1)) throw new Error('Invalid PNG scanlines');
  const rgba = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(pitch);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = bytes[pos++];
    const current = Buffer.allocUnsafe(pitch);
    for (let x = 0; x < pitch; x += 1) {
      const raw = bytes[pos++];
      const left = x >= channels ? current[x - channels] : 0;
      const up = prev[x];
      const topLeft = x >= channels ? prev[x - channels] : 0;
      let extra = 0;
      if (filter === 1) extra = left;
      else if (filter === 2) extra = up;
      else if (filter === 3) extra = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - topLeft;
        const a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - topLeft);
        extra = a <= b && a <= c ? left : b <= c ? up : topLeft;
      } else if (filter !== 0) throw new Error('Unexpected PNG filter ' + filter);
      current[x] = (raw + extra) & 255;
    }
    for (let x = 0; x < width; x += 1) {
      const src = x * channels, dst = (y * width + x) * 4;
      rgba[dst] = current[src];
      rgba[dst + 1] = current[src + 1];
      rgba[dst + 2] = current[src + 2];
      rgba[dst + 3] = channels === 4 ? current[src + 3] : 255;
    }
    prev = current;
  }
  return { width, height, rgba };
}
function sample(source, x, y) {
  const { width, height, rgba } = source;
  const x0 = Math.max(0, Math.min(width - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const dx = Math.max(0, Math.min(1, x - x0)), dy = Math.max(0, Math.min(1, y - y0));
  const weights = [(1 - dx) * (1 - dy), dx * (1 - dy), (1 - dx) * dy, dx * dy];
  const offsets = [(y0 * width + x0) * 4, (y0 * width + x1) * 4, (y1 * width + x0) * 4, (y1 * width + x1) * 4];
  let a = 0;
  const rgb = [0, 0, 0];
  for (let i = 0; i < 4; i += 1) {
    const alpha = (rgba[offsets[i] + 3] / 255) * weights[i];
    a += alpha;
    for (let k = 0; k < 3; k += 1) rgb[k] += rgba[offsets[i] + k] * alpha;
  }
  return [a, rgb];
}
function render(source, size, scale) {
  const rows = Buffer.alloc(size * (size * 4 + 1));
  const projected = size * scale;
  const origin = (size - projected) / 2;
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    rows[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const dst = row + 1 + 4 * x;
      const sx = (x + .5 - origin) * source.width / projected - .5;
      const sy = (y + .5 - origin) * source.height / projected - .5;
      let alpha = 0, rgb = [0, 0, 0];
      if (sx >= 0 && sx < source.width && sy >= 0 && sy < source.height) {
        [alpha, rgb] = sample(source, sx, sy);
      }
      for (let k = 0; k < 3; k += 1) rows[dst + k] = Math.round(rgb[k] + background[k] * (1 - alpha));
      rows[dst + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(rows, { level: 8 })), chunk('IEND', Buffer.alloc(0))]);
}

const source = readPng(iconPath);
if (source.width !== source.height || source.width < 512) throw new Error('Source must be square, >=512px');
const outputs = isFlash ? [
  ['public/icons/icon-192.png', 192, 0.90],
  ['public/icons/icon-512.png', 512, 0.90],
  ['public/icons/icon-maskable-512.png', 512, 0.64],
  ['public/icons/apple-touch-icon.png', 180, 0.90],
  ['assets/images/icon.png', 1024, 0.90],
  ['assets/images/favicon.png', 48, 0.90],
] : [
  ['public/pwa-icon-192.png', 192, 0.90],
  ['public/pwa-icon-512.png', 512, 0.90],
  ['public/pwa-maskable-512.png', 512, 0.64],
  ['public/apple-touch-icon.png', 180, 0.90],
  ['public/apple-touch-icon-180.png', 180, 0.90],
  ['assets/icon.png', 1024, 0.90],
  ['assets/favicon.png', 48, 0.90],
];
const cache = new Map();
for (const [relative, size, scale] of outputs) {
  const key = size + ':' + scale;
  if (!cache.has(key)) cache.set(key, render(source, size, scale));
  const path = resolve(ROOT, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, cache.get(key));
}
console.log('Prepared ' + outputs.length + (isFlash ? ' FlashMedic' : ' AmbuAssist') + ' icons from SynapseStudio artwork');
