import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { extractBibtexSources, parseBib } from '../parse-bib';

const FIXTURE = readFileSync(
  path.resolve(__dirname, '../fixtures/sample.bib'),
  'utf8'
);

describe('parseBib', () => {
  it('parses a non-empty list of entries', () => {
    const out = parseBib(FIXTURE);
    expect(out).toHaveLength(3);
  });

  it('captures the bibtex id', () => {
    const out = parseBib(FIXTURE);
    expect(out[0].id).toBe('snaebjarnarson2022warm');
  });

  it('decodes Icelandic LaTeX escapes in author names', () => {
    const out = parseBib(FIXTURE);
    const authors = out[0].authors.map((a) => a.last);
    expect(authors).toContain('Snæbjarnarson');
    expect(authors).toContain('Þorsteinsson');
  });

  it('decodes ð (eth) and í (i-acute) in author names', () => {
    const out = parseBib(FIXTURE);
    const authors = out[2].authors.map((a) => a.last);
    expect(authors).toContain('Friðriksdóttir');
    expect(authors).toContain('Daníelsson');
  });

  it('decodes Icelandic chars in titles', () => {
    const out = parseBib(FIXTURE);
    for (const entry of out) {
      expect(entry.title).not.toMatch(/\{\\/);
    }
  });

  it('extracts year as a number', () => {
    const out = parseBib(FIXTURE);
    expect(out[0].year).toBe(2022);
    expect(out[1].year).toBe(2024);
  });

  it('extracts venue from booktitle or journal', () => {
    const out = parseBib(FIXTURE);
    expect(out[0].venue).toContain('language resources');
    expect(out[1].venue).toContain('Computers and Education');
  });

  it('preserves author order', () => {
    const out = parseBib(FIXTURE);
    expect(out[1].authors[0].last).toBe('Einarsson');
    expect(out[1].authors[0].first).toMatch(/Hafsteinn/);
  });
});

describe('extractBibtexSources', () => {
  it('returns one source per entry, keyed by id', () => {
    const sources = extractBibtexSources(FIXTURE);
    expect([...sources.keys()]).toEqual(parseBib(FIXTURE).map((e) => e.id));
  });

  it('cuts each entry at its own closing brace', () => {
    const src = extractBibtexSources(FIXTURE).get('snaebjarnarson2022warm')!;
    expect(src.startsWith('@')).toBe(true);
    expect(src.endsWith('}')).toBe(true);
    expect(src.match(/@\w+\s*\{/g)).toHaveLength(1);
  });

  it('keeps nested braces and skips @string and @comment blocks', () => {
    const bib = [
      '@string{lrec = {LREC}}',
      '@comment{ignore me}',
      '@article{a1, title = {The {IceBERT} family}, year = {2022}}',
      '@inproceedings{b2,',
      '  title = {Second},',
      '  year = {2023}',
      '}'
    ].join('\n');
    const sources = extractBibtexSources(bib);
    expect([...sources.keys()]).toEqual(['a1', 'b2']);
    expect(sources.get('a1')).toBe('@article{a1, title = {The {IceBERT} family}, year = {2022}}');
    expect(sources.get('b2')).toContain('year = {2023}');
  });
});
