import { readFileSync } from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

/*
 * 1200×630 social cards in the site's "quiet paper" look: paper ground, ink
 * type, one rust accent, and a small percolation graph as the brand motif
 * (a cascade spreading from one node — the same model as the hero).
 *
 * All text is converted to vector outlines with opentype.js before sharp
 * rasterises the SVG. That is deliberate: an SVG <text> or sharp's Pango
 * `text` input both resolve fonts through the machine's font system, and on
 * macOS sharp silently ignores a supplied font file and falls back to the
 * system sans. Outlines render identically on a laptop and in CI.
 *
 * The fonts in src/og/fonts are static instances cut from the OFL-licensed
 * Newsreader and IBM Plex Mono (opentype.js cannot apply variable-font
 * axes): `fonttools varLib.instancer Newsreader[opsz,wght].ttf wght=300
 * opsz=72`, etc. They are resolved from the project root because this
 * module is bundled before it runs.
 */

const W = 1200;
const H = 630;
const PAD = 88;
const TEXT_W = 620;
const RULE_Y = H - 118;

const PAPER = '#F7F5F0';
const INK = '#1C1A17';
const MUTED = '#5D5953';
const FAINT = '#7A756D';
const RUST = '#B6592B';

const FONTS = path.join(process.cwd(), 'src/og/fonts');
const load = (file: string) => {
  const buf = readFileSync(path.join(FONTS, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const fonts = {
  display: load('Newsreader-Light-Display.ttf'),
  text: load('Newsreader-Regular.ttf'),
  italic: load('Newsreader-LightItalic.ttf'),
  mono: load('IBMPlexMono-Regular.ttf')
};

/** Width of a line, with kerning, plus any extra tracking per glyph. */
const measure = (font: opentype.Font, s: string, size: number, tracking = 0) =>
  font.getAdvanceWidth(s, size, { kerning: true }) + tracking * Math.max(0, [...s].length - 1);

/** Greedy word wrap to `width`. */
function wrap(font: opentype.Font, s: string, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of s.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(font, next, size) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** One line of text as an SVG path; `tracking` is extra px between glyphs. */
function textPath(font: opentype.Font, s: string, x: number, y: number, size: number, fill: string, tracking = 0) {
  let d = '';
  if (!tracking) d = font.getPath(s, x, y, size, { kerning: true }).toPathData(2);
  else {
    let cx = x;
    for (const ch of s) {
      d += font.getPath(ch, cx, y, size).toPathData(2);
      cx += font.getAdvanceWidth(ch, size) + tracking;
    }
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Small deterministic PRNG so each card's graph is stable between builds. */
function rng(seedText: string) {
  let h = 2166136261;
  for (const c of seedText) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** The motif: a random geometric graph with one cascade lit in rust. */
function graph(seed: string): string {
  const rand = rng(seed);
  const nodes = Array.from({ length: 46 }, () => ({ x: 690 + rand() * 560, y: -30 + rand() * (H + 60) }));
  const R = 118;
  const nb: number[][] = nodes.map(() => []);
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < R) {
        edges.push([i, j]);
        nb[i].push(j);
        nb[j].push(i);
      }

  // Cascade: breadth-first from a well-connected node near the middle.
  const start = nodes
    .map((n, i) => ({ i, score: nb[i].length - Math.abs(n.y - H / 2) / 120 - Math.abs(n.x - 930) / 160 }))
    .sort((a, b) => b.score - a.score)[0].i;
  const gen = new Map<number, number>([[start, 0]]);
  const lit: Array<[number, number, number]> = [];
  let frontier = [start];
  for (let g = 1; g <= 3; g++) {
    const next: number[] = [];
    for (const a of frontier)
      for (const b of nb[a].slice(0, g === 1 ? 5 : 3))
        if (!gen.has(b)) {
          gen.set(b, g);
          lit.push([a, b, g]);
          next.push(b);
        }
    frontier = next;
  }

  const seg = ([a, b]: [number, number]) =>
    `M${nodes[a].x.toFixed(1)} ${nodes[a].y.toFixed(1)}L${nodes[b].x.toFixed(1)} ${nodes[b].y.toFixed(1)}`;
  const cascade = lit
    .map(([a, b, g]) => `<path d="${seg([a, b])}" stroke="${RUST}" stroke-opacity="${(0.95 - g * 0.18).toFixed(2)}" stroke-width="${(3.2 - g * 0.5).toFixed(1)}"/>`)
    .join('');
  const dots = nodes
    .map((n, i) => {
      const g = gen.get(i);
      return g === undefined
        ? `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="3.4" fill="${INK}" fill-opacity="0.42"/>`
        : `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${g === 0 ? 8 : 5.2}" fill="${RUST}" fill-opacity="${(1 - g * 0.15).toFixed(2)}"/>`;
    })
    .join('');
  const s = nodes[start];
  return `<path d="${edges.map(seg).join('')}" stroke="${INK}" stroke-opacity="0.16" stroke-width="1.6" fill="none"/>
  <g fill="none" stroke-linecap="round">${cascade}</g>
  <circle cx="${s.x}" cy="${s.y}" r="22" fill="none" stroke="${RUST}" stroke-opacity="0.45" stroke-width="2"/>
  <circle cx="${s.x}" cy="${s.y}" r="40" fill="none" stroke="${RUST}" stroke-opacity="0.2" stroke-width="1.5"/>
  ${dots}`;
}

export interface CardOptions {
  /** Small mono line above the title: a date, or the site name. */
  eyebrow: string;
  title: string;
  /** Optional italic line under the title. */
  subtitle?: string;
  /** Seeds the graph so each card gets its own, stable motif. */
  seed: string;
  /** Print the author's name in the footer (off when it is the title). */
  byline?: boolean;
}

export async function renderCard({ eyebrow, title, subtitle, seed, byline = true }: CardOptions): Promise<Buffer> {
  const parts: string[] = [];

  parts.push(textPath(fonts.mono, eyebrow.toUpperCase(), PAD, 112, 21, RUST, 3.2));

  // Step the title size down until it fits between the eyebrow and the rule.
  const subtitleRoom = subtitle ? 110 : 0;
  let size = 76;
  let lines = wrap(fonts.display, title, size, TEXT_W);
  while (size > 40 && lines.length * size * 1.08 > RULE_Y - 190 - subtitleRoom) {
    size -= 4;
    lines = wrap(fonts.display, title, size, TEXT_W);
  }
  const lead = size * 1.08;
  let y = 172 + size * 0.78;
  for (const line of lines) {
    parts.push(textPath(fonts.display, line, PAD - 3, y, size, INK));
    y += lead;
  }

  if (subtitle) {
    y += 14;
    for (const line of wrap(fonts.italic, subtitle, 29, TEXT_W)) {
      parts.push(textPath(fonts.italic, line, PAD, y, 29, MUTED));
      y += 38;
    }
  }

  if (byline) parts.push(textPath(fonts.text, 'Hafsteinn Einarsson', PAD, H - 66, 30, INK));
  const domain = 'hafst1.is';
  parts.push(textPath(fonts.mono, domain, PAD + TEXT_W - measure(fonts.mono, domain, 21), H - 70, 21, FAINT));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0.5" stop-color="${PAPER}" stop-opacity="1"/>
      <stop offset="0.7" stop-color="${PAPER}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  ${graph(seed)}
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect x="${PAD}" y="${RULE_Y}" width="${TEXT_W}" height="1.5" fill="${INK}" fill-opacity="0.18"/>
  ${parts.join('\n  ')}
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
