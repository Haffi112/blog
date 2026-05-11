import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseBib } from '../parse-bib';

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
