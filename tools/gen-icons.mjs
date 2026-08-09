// Rasterise src/assets/icon.svg → PNG app icons. Run: node tools/gen-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..'));

const svg = readFileSync('./src/assets/icon.svg');
const out = './src/assets';
const targets = {
  'icon-192.png': 192,
  'icon-512.png': 512,
  'icon-maskable-512.png': 512,
  'apple-touch-icon.png': 180,
};
for (const [name, size] of Object.entries(targets)) {
  await sharp(svg).resize(size, size).png().toFile(join(out, name));
  console.log('✓ wrote', name, size + 'px');
}
