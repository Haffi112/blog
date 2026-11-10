import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { parse as parseBibtex } from '@retorquere/bibtex-parser';
import type {
  Author,
  Publication,
  RawEntry
} from '../src/data/publications.schema.ts';

// Path roots (script lives at scripts/parse-bib.ts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BIB_PATH = path.join(ROOT, 'references.bib');
const OVERRIDES_PATH = path.join(ROOT, 'src/data/pub-overrides.yaml');
const OUT_PATH = path.join(ROOT, 'src/data/publications.json');

// Fall-back LaTeX commands the underlying parser may not decode itself.
// The @retorquere/bibtex-parser already handles most accents, so this is
// only used for any escape that slips through.
const LATEX_MAP: Array<[RegExp, string]> = [
  [/\{\\TH\}/g, 'Þ'],
  [/\{\\th\}/g, 'þ'],
  [/\{\\DH\}/g, 'Ð'],
  [/\{\\dh\}/g, 'ð'],
  [/\{\\AE\}/g, 'Æ'],
  [/\{\\ae\}/g, 'æ'],
  [/\{\\OE\}/g, 'Œ'],
  [/\{\\oe\}/g, 'œ'],
  [/\{\\O\}/g, 'Ø'],
  [/\{\\o\}/g, 'ø'],
  [/\{\\AA\}/g, 'Å'],
  [/\{\\aa\}/g, 'å']
];

export function decodeLatex(s: string | undefined | null): string {
  if (!s) return '';
  let out = String(s);
  for (const [re, replacement] of LATEX_MAP) out = out.replace(re, replacement);
  // Strip leftover {…} grouping braces left by the parser.
  out = out.replace(/[{}]/g, '');
  // Fix dotless-i (U+0131) followed by a combining accent: the parser emits
  // this for \'\i but the desired output is the precomposed letter (e.g. í).
  out = out.replace(/ı([̀-ͯ])/g, (_match, mark) =>
    ('i' + mark).normalize('NFC')
  );
  // Compose any remaining decomposed sequences (e.g. o + combining acute → ó).
  out = out.normalize('NFC');
  return out.trim();
}

function authorsFrom(entry: any): Author[] {
  const raw: any[] = entry.fields?.author ?? [];
  return raw.map((a: any) => {
    const givenParts = [a.firstName, a.middleName, a.initial]
      .filter((p) => typeof p === 'string' && p.trim().length > 0);
    return {
      last: decodeLatex(a.lastName ?? a.family ?? a.literal ?? a.name ?? ''),
      first: decodeLatex(givenParts.join(' ') || a.given || '')
    };
  });
}

function asString(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function venueFrom(entry: any): string {
  const f = entry.fields ?? {};
  const candidates = [
    f.journal,
    f.booktitle,
    f.publisher,
    f.howpublished,
    f.school,
    f.institution
  ];
  for (const c of candidates) {
    const s = asString(c);
    if (s.trim()) return decodeLatex(s);
  }
  return '';
}

function yearFrom(entry: any): number {
  const y = asString(entry.fields?.year) || asString(entry.fields?.date);
  const m = y.match(/(\d{4})/);
  return m ? Number(m[1]) : 0;
}

function maybeString(value: unknown): string | undefined {
  const s = asString(value);
  if (!s.trim()) return undefined;
  return decodeLatex(s);
}

export function parseBib(bibSource: string): RawEntry[] {
  const result = parseBibtex(bibSource);
  const entries: any[] = result?.entries ?? [];
  // The parser sentence-cases English fields. That is what we want for
  // paper titles, but it also lower-cases journal and conference names
  // ("Nature communications"), so venues are read from a second pass with
  // the casing left as written in the .bib file.
  const asWritten: any[] = parseBibtex(bibSource, { sentenceCase: false })?.entries ?? [];
  const venues = new Map<string, string>(asWritten.map((entry: any) => [entry.key, venueFrom(entry)]));
  return entries.map((entry: any) => ({
    id: entry.key,
    type: entry.type,
    title: decodeLatex(asString(entry.fields?.title)),
    authors: authorsFrom(entry),
    venue: venues.get(entry.key) ?? venueFrom(entry),
    year: yearFrom(entry),
    pages: maybeString(entry.fields?.pages),
    volume: maybeString(entry.fields?.volume),
    number: maybeString(entry.fields?.number),
    publisher: maybeString(entry.fields?.publisher)
  }));
}

/**
 * The source text of each entry, keyed by citation id, for the "Cite"
 * button on the publications page. Entries are cut out by brace depth, so
 * nested {…} in titles are fine; @string, @preamble and @comment blocks
 * are skipped.
 */
export function extractBibtexSources(bibSource: string): Map<string, string> {
  const out = new Map<string, string>();
  const head = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g;
  let m: RegExpExecArray | null;
  while ((m = head.exec(bibSource))) {
    const type = m[1].toLowerCase();
    if (type === 'string' || type === 'preamble' || type === 'comment') continue;
    let depth = 0;
    let end = -1;
    for (let i = bibSource.indexOf('{', m.index); i < bibSource.length; i++) {
      const c = bibSource[i];
      if (c === '{') depth++;
      else if (c === '}' && --depth === 0) {
        end = i + 1;
        break;
      }
    }
    if (end === -1) break; // unbalanced: stop rather than swallow the rest
    out.set(m[2], bibSource.slice(m.index, end).trim());
    head.lastIndex = end;
  }
  return out;
}

function loadOverrides(): Record<string, Partial<Publication>> {
  if (!existsSync(OVERRIDES_PATH)) return {};
  const raw = readFileSync(OVERRIDES_PATH, 'utf8');
  return (yaml.load(raw) as Record<string, Partial<Publication>>) ?? {};
}

function merge(raw: RawEntry, overrides: Partial<Publication> = {}): Publication {
  return {
    ...raw,
    theme: overrides.theme,
    summary: overrides.summary,
    summary_is: overrides.summary_is,
    selected: overrides.selected ?? false,
    links: overrides.links ?? {},
    notes: overrides.notes
  };
}

async function processBibFile(
  bibPath: string,
  outPath: string,
  overrides: Record<string, Partial<Publication>>
) {
  const bibSource = readFileSync(bibPath, 'utf8');
  const raw = parseBib(bibSource);
  const sources = extractBibtexSources(bibSource);

  // A repeated citekey gives two entries one override and one "Cite" text.
  const ids = raw.map((entry) => entry.id);
  const repeated = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (repeated.length) {
    throw new Error(`Duplicate citation key(s) in ${path.relative(ROOT, bibPath)}: ${repeated.join(', ')}`);
  }
  const orphans = Object.keys(overrides).filter((key) => !ids.includes(key));
  if (orphans.length) {
    console.warn(`Warning: pub-overrides.yaml has entries with no BibTeX entry: ${orphans.join(', ')}`);
  }
  const merged = raw.map((entry) => ({
    ...merge(entry, overrides[entry.id]),
    bibtex: sources.get(entry.id)
  }));
  merged.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
  // The publications page and the long CV list entries by theme only.
  if (Object.keys(overrides).length) {
    const unthemed = merged.filter((entry) => !entry.theme).map((entry) => entry.id);
    if (unthemed.length) {
      console.warn(`Warning: no theme in pub-overrides.yaml, so not listed on /publications/: ${unthemed.join(', ')}`);
    }
  }
  writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`Wrote ${merged.length} publications to ${outPath}`);
}

async function main() {
  const overrides = loadOverrides();
  await processBibFile(BIB_PATH, OUT_PATH, overrides);
  // Cited refs from old blog posts
  const citedBib = path.join(ROOT, '_bibliography/references.bib');
  const citedOut = path.join(ROOT, 'src/data/cited-refs.json');
  await processBibFile(citedBib, citedOut, {});
}

// Run only as a script (`tsx scripts/parse-bib.ts`), not when imported by the tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
