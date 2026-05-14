import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';

// Build a 1200x630 social-share PNG per blog post. Sharp rasterises an
// inline SVG containing the title (word-wrapped) on an aubergine tile
// matching the favicon and brand palette. Generated at build time and
// written to dist/og/<slug>.png.

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug.replace(/^\d{4}-\d{2}-\d{2}-/, '') },
    props: { title: post.data.title }
  }));
}

const W = 1200;
const H = 630;
const BG = '#5B3A78';
const INK = '#FAFAF6';
const ACCENT = 'rgba(250, 250, 246, 0.55)';
const PAD_X = 88;
const TITLE_FONT_SIZE = 84;
const TITLE_LINE_HEIGHT = 1.12;
const MAX_LINES = 4;

// Approximate character width at the title font size in our sans family.
// Empirically ~0.55em for Inter Bold at 84px; we wrap on whitespace.
const TITLE_AVG_CHAR_PX = TITLE_FONT_SIZE * 0.55;

function wrap(text: string, maxLines: number) {
  const maxCharsPerLine = Math.floor((W - 2 * PAD_X) / TITLE_AVG_CHAR_PX);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharsPerLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const truncated = lines.slice(0, maxLines);
  truncated[maxLines - 1] = truncated[maxLines - 1].replace(/\s+\S+$/, '') + '…';
  return truncated;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSvg(title: string) {
  const lines = wrap(title, MAX_LINES);
  const lineHeightPx = TITLE_FONT_SIZE * TITLE_LINE_HEIGHT;
  const blockHeight = lines.length * lineHeightPx;
  const startY = (H - blockHeight) / 2 + TITLE_FONT_SIZE * 0.85;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${PAD_X}" y="${startY + i * lineHeightPx}">${escapeXml(line)}</tspan>`
    )
    .join('');

  // Single quotes around multi-word family names — the SVG attribute
  // itself uses double quotes, so inner double quotes would terminate
  // the attribute mid-value.
  const sans =
    "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="${PAD_X}" y="76" width="56" height="56" rx="10" fill="${INK}"/>
  <text x="${PAD_X + 28}" y="116" font-family="${sans}" font-size="40" font-weight="800" fill="${BG}" text-anchor="middle">H</text>
  <text x="${PAD_X + 76}" y="116" font-family="${sans}" font-size="22" font-weight="500" fill="${INK}" opacity="0.85">Hafsteinn Einarsson</text>
  <text font-family="${sans}" font-size="${TITLE_FONT_SIZE}" font-weight="800" fill="${INK}" letter-spacing="-1.5">
    ${tspans}
  </text>
  <text x="${PAD_X}" y="${H - 72}" font-family="${sans}" font-size="22" font-weight="500" fill="${ACCENT}">haffi112.github.io</text>
</svg>`;
}

export async function GET(context: APIContext) {
  const title = (context.props as { title: string }).title;
  const svg = buildSvg(title);
  const png = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer();
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
