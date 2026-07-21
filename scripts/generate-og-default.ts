import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Regenerates public/og/default.png, the site-wide 1200x630 social-share
// card (used by every page without a per-post OG image). Run manually
// after changing the portrait, titles, or domain:
//
//   npx tsx scripts/generate-og-default.ts
//
// The card is committed, not built in CI, so remember to commit the PNG.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const W = 1200;
const H = 630;
const SCALE = 2; // supersample text rendering, then downsize

// Brand tokens — match src/styles/global.css light theme and the
// aubergine used by the per-post OG generator (src/pages/og/[...slug].png.ts).
const BG = '#fafaf6';
const INK = '#1a1418';
const MUTED = '#5f5a64';
const AUBERGINE = '#5B3A78';
const HAIRLINE = '#e5e2da';

const PAD_X = 88;

// Portrait: native 330x409. Downscale so it sits clear of the name
// (the previous card upscaled it to ~365px wide and clipped the title).
const PORTRAIT_W = 280;
const PORTRAIT_H = Math.round((409 / 330) * PORTRAIT_W); // 347
const FRAME_PAD = 10;
const PORTRAIT_X = W - PAD_X - PORTRAIT_W; // 832
const PORTRAIT_Y = Math.round((H - PORTRAIT_H) / 2); // 141

// Single quotes inside the attribute — double quotes would end it early.
const sans =
  "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="${PORTRAIT_X - FRAME_PAD}" y="${PORTRAIT_Y - FRAME_PAD}"
        width="${PORTRAIT_W + 2 * FRAME_PAD}" height="${PORTRAIT_H + 2 * FRAME_PAD}"
        fill="#ffffff" stroke="${HAIRLINE}" stroke-width="1"/>
  <text x="${PAD_X}" y="225" font-family="${sans}" font-size="68" font-weight="800" fill="${INK}" letter-spacing="-1">Hafsteinn Einarsson</text>
  <text x="${PAD_X}" y="295" font-family="${sans}" font-size="30" font-weight="400" fill="${MUTED}">Associate Professor &#183; University of Iceland</text>
  <text x="${PAD_X}" y="343" font-family="${sans}" font-size="30" font-weight="400" fill="${MUTED}">Principal Scientist &#183; Amgen deCODE</text>
  <text x="${PAD_X}" y="${H - 72}" font-family="${sans}" font-size="22" font-weight="600" fill="${AUBERGINE}">hafst1.is</text>
</svg>`;

const background = await sharp(Buffer.from(svg))
  .resize(W, H)
  .png()
  .toBuffer();

const portrait = await sharp(path.join(root, 'src/assets/hafsteinn.png'))
  .resize(PORTRAIT_W, PORTRAIT_H)
  .png()
  .toBuffer();

await sharp(background)
  .composite([{ input: portrait, left: PORTRAIT_X, top: PORTRAIT_Y }])
  .png()
  .toFile(path.join(root, 'public/og/default.png'));

console.log(`Wrote public/og/default.png (${W}x${H})`);
