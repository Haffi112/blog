# Website Refresh — Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Replace the Jekyll/Lanyon site with an Astro foundation that ships a new `/`, `/about/`, `/publications/`, and `/cv/` to `haffi112.github.io`, with the full design system, content collections schemas, and bibliography pipeline in place.

**Architecture:** Astro 5 static site generated from this repo, deployed by `rsync`-ing the build output into the sibling `haffi112.github.io` git repo (same model as today's `deploy.sh`, swapped from Jekyll to Astro). Publications data flows `references.bib` → `parse-bib.ts` → `publications.json` at build time, merged with a human-edited `pub-overrides.yaml` sidecar for themes, summaries, and links.

**Tech Stack:** Astro 5, TypeScript 5, Tailwind CSS 4 (`@astrojs/tailwind`), MDX (`@astrojs/mdx`), Astro content collections + Zod, `@retorquere/bibtex-parser` for the bib parser, `vitest` for unit tests on the parser only.

**Reference design:** `docs/plans/2026-05-11-website-refresh-design.md`

**Scope boundary:** This plan covers Phase 1 only. The other pages (`/research/`, `/teaching/`, `/group/`), blog migration, and polish are deferred to Phases 2-4 with their own plans. Jekyll files (`_config.yml`, `_layouts/`, `_includes/`, `_posts/`, `_drafts/`, `_bibliography/`) stay in place until Phase 3 deletes them — they don't interfere with the Astro build.

---

## Pre-flight checklist (verify before Task 1)

- [ ] Working directory: `/Users/hafsteinneinarsson/Dropbox/Personal/blog`
- [ ] Node ≥ 22 (`node --version` — currently v25)
- [ ] `npm --version` ≥ 10 (currently v11)
- [ ] `pandoc` available (for CV docx → PDF in Task 14)
- [ ] On branch `master`, clean working tree
- [ ] The sibling deploy repo at `haffi112.github.io/` is committed and clean

---

## Task 1: Gitignore, file moves, prep

**Goal:** Set up file paths so the rest of the plan can reference stable locations. Decide what's tracked vs. local.

**Files:**
- Modify: `.gitignore`
- Move: `references.txt` → `references.bib`
- Local-only (gitignored): `old_cvs/`, `personal_images/`

**Step 1: Append to `.gitignore`**

The new entries (added below the existing lines):

```
# Astro / Node
node_modules/
dist/
.astro/

# Generated bibliography data (regenerated from references.bib at build time)
src/data/publications.json

# Personal working files (contain PII like phone/DOB) — keep local
old_cvs/
personal_images/

# OS
.DS_Store
```

The existing `.DS_Store` line stays; the additions don't duplicate. (Note: the user can opt-in to tracking `old_cvs/` and `personal_images/` later if they want a git-backed working set; default is local-only because the CVs contain phone number and DOB.)

**Step 2: Rename `references.txt` → `references.bib`**

```bash
git mv references.txt references.bib
```

Note: `_bibliography/references.bib` already exists (the old Lanyon-era cited references like Hodgkin-Huxley). Leave it untouched; it's used by old blog posts and Phase 3 will reconcile. The user's own publications live at `./references.bib` (root).

**Step 3: Commit**

```bash
git add .gitignore references.bib
git commit -m "Prep: gitignore Astro outputs and PII; rename references.txt → references.bib"
```

**Verify:**
- `ls references.bib` succeeds
- `git status` shows `old_cvs/` and `personal_images/` as ignored (use `git status --ignored` to confirm)

---

## Task 2: Initialize Astro project

**Goal:** Create the `package.json`, Astro / TS configs, and install dependencies. After this task `npm run dev` should serve the default Astro "hello world".

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

**Step 1: Create `package.json`**

```json
{
  "name": "hafsteinn-site",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "npm run parse-bib && astro build",
    "preview": "astro preview",
    "parse-bib": "tsx scripts/parse-bib.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@retorquere/bibtex-parser": "^9.0.4"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  }
}
```

> Note for the executor: if any of these `^` versions resolve to something incompatible (e.g., `@astrojs/tailwind` major version doesn't yet support Tailwind 4 at install time), pin to whatever the current Astro docs recommend for Tailwind 4. Use `npm view <package> versions` to inspect. Don't silently downgrade Tailwind — instead use the official `@tailwindcss/vite` plugin path Astro 5 documents.

**Step 2: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://haffi112.github.io',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [
    mdx(),
    tailwind({ applyBaseStyles: false }) // we own base styles in src/styles
  ]
});
```

`trailingSlash: 'always'` + `format: 'directory'` preserves the old Jekyll URL style (`/about/index.html`) so existing inbound links keep working.

**Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

**Step 4: Install**

```bash
npm install
```

**Step 5: Smoke-test**

```bash
npx astro --version
```
Expected: version output starting with `5.`.

**Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json
git commit -m "Initialize Astro 5 project"
```

---

## Task 3: Tailwind config + design tokens

**Goal:** Wire up Tailwind 4 with the project's design tokens. After this task, classes like `text-ink bg-bg accent-primary` work.

**Files:**
- Create: `tailwind.config.mjs`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`

**Step 1: Create `tailwind.config.mjs`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,md,mdx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        rule: 'var(--rule)',
        'accent-primary': 'var(--accent-primary)',
        'accent-primary-soft': 'var(--accent-primary-soft)',
        'accent-warm': 'var(--accent-warm)',
        'accent-warm-soft': 'var(--accent-warm-soft)',
        'accent-energy': 'var(--accent-energy)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      maxWidth: {
        page: '1120px',
        prose: '680px',
        pubs: '75ch'
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }]
      }
    }
  },
  plugins: []
};
```

**Step 2: Create `src/styles/tokens.css`**

```css
:root {
  --bg: #FAFAF6;
  --bg-elev: #FFFFFF;
  --ink: #1A1418;
  --ink-muted: #5A5560;
  --rule: #E8E4E2;
  --accent-primary: #5B3A78;
  --accent-primary-soft: #F2EBF9;
  --accent-warm: #C58A2A;
  --accent-warm-soft: #F8F1DD;
  --accent-energy: #C45A2A;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  --motion-fast: 150ms;
  --motion-base: 200ms;
  --motion-slow: 400ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

[data-theme='dark'] {
  --bg: #131013;
  --bg-elev: #1A171C;
  --ink: #EDE9E3;
  --ink-muted: #8A8389;
  --rule: #292528;
  --accent-primary: #B79BDF;
  --accent-primary-soft: #2A1F37;
  --accent-warm: #E5C46E;
  --accent-warm-soft: #2E2716;
  --accent-energy: #E58A5E;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

**Step 3: Create `src/styles/base.css`**

```css
@import './tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    background: var(--bg);
    color: var(--ink);
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    min-height: 100dvh;
  }

  ::selection {
    background: var(--accent-primary-soft);
    color: var(--accent-primary);
  }

  a {
    color: var(--accent-primary);
    text-decoration: none;
    transition: color var(--motion-fast) var(--ease-out);
  }

  a:hover {
    color: var(--accent-warm);
  }

  a:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
    border-radius: 2px;
  }

  h1, h2, h3, h4 {
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.25;
  }
}

@layer components {
  .prose-body {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1.0625rem;
    line-height: 1.55;
    color: var(--ink);
  }
}
```

**Step 4: Commit**

```bash
git add tailwind.config.mjs src/styles/
git commit -m "Design tokens, Tailwind config, base styles"
```

---

## Task 4: Content collections schema

**Goal:** Define the shape of every content collection up front so missing fields fail at build.

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/news/.gitkeep`
- Create: `src/content/talks/.gitkeep`
- Create: `src/content/projects/.gitkeep`
- Create: `src/content/students/.gitkeep`
- Create: `src/content/teaching/.gitkeep`
- Create: `src/content/blog/.gitkeep`

**Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      updated: z.date().optional(),
      excerpt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      hero: image().optional(),
      // legacy support: some 2016 posts referenced extra CSS
      customCss: z.array(z.string()).default([])
    })
});

const news = defineCollection({
  type: 'data',
  schema: z.object({
    date: z.date(),
    text: z.string(),
    link: z.string().url().optional()
  })
});

const talks = defineCollection({
  type: 'data',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    venue: z.string(),
    location: z.string().optional(),
    link: z.string().url().optional(),
    type: z.enum(['invited', 'keynote', 'outreach', 'workshop']).default('invited')
  })
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    links: z
      .object({
        repo: z.string().url().optional(),
        huggingface: z.string().url().optional(),
        site: z.string().url().optional(),
        dataset: z.string().url().optional()
      })
      .default({}),
    tags: z.array(z.string()).default([]),
    status: z.enum(['active', 'maintenance', 'archived']).default('active')
  })
});

const students = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.enum(['phd-main', 'phd-committee', 'msc', 'alumni-phd', 'alumni-msc']),
    title: z.string().optional(),
    startYear: z.number().int().optional(),
    endYear: z.number().int().optional(),
    link: z.string().url().optional(),
    nowAt: z.string().optional()
  })
});

const teaching = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    level: z.enum(['ba', 'msc', 'phd', 'mixed']).default('mixed'),
    language: z.enum(['english', 'icelandic', 'mixed']).default('english'),
    semesters: z.array(z.string()).default([]),
    description: z.string(),
    syllabus: z.string().url().optional()
  })
});

export const collections = { blog, news, talks, projects, students, teaching };
```

**Step 2: Create the empty `.gitkeep` files**

```bash
mkdir -p src/content/{blog,news,talks,projects,students,teaching}
touch src/content/{blog,news,talks,projects,students,teaching}/.gitkeep
```

**Step 3: Verify the build picks up the schemas**

```bash
npx astro sync
```
Expected: command exits 0 and `.astro/types.d.ts` regenerates. No type errors.

**Step 4: Commit**

```bash
git add src/content/
git commit -m "Define content collection schemas"
```

---

## Task 5: Bibliography parser — write the tests first

**Goal:** Pin the behavior of `parse-bib.ts` with concrete tests before writing it. The parser must handle the Icelandic LaTeX escapes that appear in `references.bib`.

**Files:**
- Create: `scripts/__tests__/parse-bib.test.ts`
- Create: `scripts/fixtures/sample.bib`
- Create: `vitest.config.ts`

**Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    environment: 'node'
  }
});
```

**Step 2: Create `scripts/fixtures/sample.bib`**

```bibtex
@article{snaebjarnarson2022warm,
  title={A warm start and a clean crawled corpus-a recipe for good language models},
  author={Sn{\ae}bjarnarson, V{\'e}steinn and Símonarson, Haukur Barri and Ragnarsson, P{\'e}tur Orri and Ing{\'o}lfsd{\'o}ttir, Svanhv{\'\i}t Lilja and J{\'o}nsson, Haukur and {\TH}orsteinsson, Vilhj{\'a}lmur and Einarsson, Hafsteinn},
  booktitle={Proceedings of the thirteenth language resources and evaluation conference},
  pages={4356--4366},
  year={2022}
}

@article{einarsson2024application,
  title={Application of ChatGPT for automated problem reframing across academic domains},
  author={Einarsson, Hafsteinn and Lund, Sigr{\'u}n Helga and J{\'o}nsd{\'o}ttir, Anna Helga},
  journal={Computers and Education: Artificial Intelligence},
  volume={6},
  pages={100194},
  year={2024}
}

@article{fridhriksdottir2022mim,
  title={MIM-GOLD-EL-entity linking corpus for Icelandic (22.01)},
  author={Fri{\dh}riksd{\'o}ttir, Steinunn Rut and Dan{\'\i}elsson, Hjalti and Eggertsson, Valdimar and J{\'o}hannesson, Benedikt Geir and Loftsson, Hrafn and Einarsson, Hafsteinn},
  year={2022}
}
```

**Step 3: Write the failing tests in `scripts/__tests__/parse-bib.test.ts`**

```ts
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
    // None of the sample titles need it, but the function should never
    // emit raw {\TH} or similar in title strings.
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
```

**Step 4: Run the tests, confirm they fail**

```bash
npm test
```
Expected: failures because `parse-bib.ts` doesn't exist yet. The error should be `Cannot find module '../parse-bib'`.

**Step 5: Commit the tests**

```bash
git add scripts/__tests__ scripts/fixtures vitest.config.ts
git commit -m "Tests for bibliography parser (failing)"
```

---

## Task 6: Implement the bibliography parser

**Goal:** Make the tests from Task 5 pass, then run end-to-end on `references.bib`.

**Files:**
- Create: `scripts/parse-bib.ts`
- Create: `src/data/pub-overrides.yaml` (initially empty mapping)
- Create: `src/data/publications.schema.ts`

**Step 1: Create `src/data/publications.schema.ts`**

```ts
export type Theme = 'nlp-is' | 'cv-nat' | 'clinical-ai' | 'genetics' | 'comp-neuro';

export interface Author {
  first: string;
  last: string;
}

export interface PublicationLinks {
  doi?: string;
  arxiv?: string;
  pdf?: string;
  code?: string;
  huggingface?: string;
  dataset?: string;
}

export interface RawEntry {
  id: string;
  type: string;
  title: string;
  authors: Author[];
  venue: string;
  year: number;
  pages?: string;
  volume?: string;
  number?: string;
  publisher?: string;
}

export interface Publication extends RawEntry {
  theme?: Theme;
  summary?: string;
  selected: boolean;
  links: PublicationLinks;
  notes?: string;
}
```

**Step 2: Create `src/data/pub-overrides.yaml` (placeholder, populated in Task 7)**

```yaml
# Bibliography overrides keyed by bibtex citation id.
# Schema per entry (all fields optional):
#   theme: nlp-is | cv-nat | clinical-ai | genetics | comp-neuro
#   summary: 1-2 sentence summary (3-4 for selected)
#   selected: boolean (featured at top of publications page)
#   links: { doi, arxiv, pdf, code, huggingface, dataset }
#   notes: free text, e.g. "corresponding author"
```

**Step 3: Create `scripts/parse-bib.ts`**

```ts
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { parse as parseBibtex } from '@retorquere/bibtex-parser';
import type {
  Author,
  Publication,
  RawEntry,
  Theme
} from '../src/data/publications.schema.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const BIB_PATH = path.join(ROOT, 'references.bib');
const OVERRIDES_PATH = path.join(ROOT, 'src/data/pub-overrides.yaml');
const OUT_PATH = path.join(ROOT, 'src/data/publications.json');

// Targeted LaTeX → unicode decoder. The @retorquere parser handles most
// diacritics natively, but Icelandic-specific commands like {\TH} and
// {\dh} need an explicit pass.
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

export function decodeLatex(s: string): string {
  if (!s) return s;
  let out = s;
  for (const [re, replacement] of LATEX_MAP) {
    out = out.replace(re, replacement);
  }
  // Strip any remaining {…} grouping braces left by the parser
  out = out.replace(/\{|\}/g, '');
  return out.trim();
}

function authorsFrom(entry: any): Author[] {
  const raw = entry.fields?.author ?? entry.creators?.author ?? [];
  return raw.map((a: any) => ({
    last: decodeLatex(a.lastName ?? a.family ?? ''),
    first: decodeLatex(
      [a.firstName, a.middleName].filter(Boolean).join(' ') ||
        a.given ||
        ''
    )
  }));
}

function venueFrom(entry: any): string {
  const fields = entry.fields ?? {};
  const candidates = [
    fields.journal,
    fields.booktitle,
    fields.publisher,
    fields.howpublished,
    fields.school,
    fields.institution
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return decodeLatex(c);
  }
  return '';
}

function yearFrom(entry: any): number {
  const y = entry.fields?.year ?? entry.fields?.date ?? '';
  const m = String(y).match(/(\d{4})/);
  return m ? Number(m[1]) : 0;
}

export function parseBib(bibSource: string): RawEntry[] {
  const result = parseBibtex(bibSource, { sentenceCase: false });
  return result.entries.map((entry: any) => ({
    id: entry.key,
    type: entry.type,
    title: decodeLatex(entry.fields?.title ?? ''),
    authors: authorsFrom(entry),
    venue: venueFrom(entry),
    year: yearFrom(entry),
    pages: entry.fields?.pages,
    volume: entry.fields?.volume,
    number: entry.fields?.number,
    publisher: entry.fields?.publisher
  }));
}

function loadOverrides(): Record<string, Partial<Publication>> {
  if (!readFileSync) return {};
  const raw = readFileSync(OVERRIDES_PATH, 'utf8');
  return (yaml.load(raw) as Record<string, Partial<Publication>>) ?? {};
}

function merge(raw: RawEntry, overrides: Partial<Publication> = {}): Publication {
  return {
    ...raw,
    theme: overrides.theme,
    summary: overrides.summary,
    selected: overrides.selected ?? false,
    links: overrides.links ?? {},
    notes: overrides.notes
  };
}

async function main() {
  const bibSource = readFileSync(BIB_PATH, 'utf8');
  const raw = parseBib(bibSource);
  const overrides = loadOverrides();
  const merged = raw.map((entry) => merge(entry, overrides[entry.id]));
  merged.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
  writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2));
  console.log(`Wrote ${merged.length} publications to ${OUT_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

**Step 4: Add the YAML dependency**

```bash
npm install js-yaml
npm install --save-dev @types/js-yaml
```

**Step 5: Run the tests**

```bash
npm test
```
Expected: all 8 tests pass. If a test fails, inspect what the parser returned (`console.log` in the test) and refine `decodeLatex` or the field extraction.

**Step 6: Run the parser end-to-end on the real bib**

```bash
npm run parse-bib
```
Expected: console output `Wrote 72 publications to .../publications.json`. Open `src/data/publications.json` and spot-check that author names with Icelandic characters render correctly (e.g., `Friðriksdóttir`, `Þorsteinsson`, `Snæbjarnarson`).

**Step 7: Commit**

```bash
git add scripts/parse-bib.ts src/data/publications.schema.ts src/data/pub-overrides.yaml package.json package-lock.json
git commit -m "Bibliography parser with Icelandic LaTeX decoding"
```

---

## Task 7: Populate `pub-overrides.yaml`

**Goal:** Draft a `theme` and `summary` for every entry, mark ~8 as `selected: true`, and add links where findable.

**Files:**
- Modify: `src/data/pub-overrides.yaml`

This is the single most content-heavy step in the plan. I'll do the drafting; the user reviews after.

**Step 1: Draft summaries and themes**

Strategy:
- For each of the 72 entries in `references.bib`, write a 1-2 sentence summary.
- Lead author or sole author: write a more confident, content-rich summary.
- Middle author on a heart-failure conference abstract: write a short, generic-but-accurate framing ("Contribution to an international survey on HFpEF practice across regions").
- For ~8 selected papers, write 3-4 sentence summaries.

Theme assignments (use these mappings; adjust as you read each title):

| Bibtex id pattern | Theme |
|---|---|
| Anything by Snæbjarnarson/Friðriksdóttir/Simonsen/Hauksson/Scalvini/Debess/Arnardóttir on Icelandic/Faroese language | `nlp-is` |
| Davíðsson (horses), Sigurðardóttir/Hrólfsdóttir (multispectral / otolith / nematodes / fish), Hamedpour (grasslands), da Silva Martins (fish classification) | `cv-nat` |
| Ingimarsdóttir, Agnarsson, Gunnþórsdóttir, Hauksdottir, Bergmann, Saldarriaga, Guidetti, Gudjonsson, Myhre (heart-failure/cardiology) — and the BERT clinical coding paper (Hauksson & Einarsson 2024) | `clinical-ai` |
| Einarsson G./Thorolfsdottir (deCODE genetics papers, sequence variants, GWAS) | `genetics` |
| Einarsson H. 2014/2017/2018/2019 (Hebbian / synfire / percolation / hippocampal replay / bootstrap percolation with inhibition), Weissenberger, Matheus Gauy, Lengler co-authorships | `comp-neuro` |
| Schram / Jóhannesdóttir on AI in academia | `nlp-is` (closest fit; flag as `notes: "education / AI policy"`) |
| Proceedings of NB-REAL 2025 (Einarsson editor) | `nlp-is` |
| MazeEval (Einarsson 2025) | `nlp-is` |
| Chang et al 2025 global piqa | `nlp-is` |

**Selected highlights** (proposed; review and adjust):

1. `snaebjarnarson2022warm` — Icelandic GPT-style language models from a clean crawled corpus. *Foundation of the NLP-IS line.*
2. `hauksson2024applications` — BERT for automated clinical coding in Icelandic, NAACL 2024 Findings. *Won the UI Science Award 2024.*
3. `fridhriksdottir2024gendered` — Gender bias in Icelandic LMs (LREC-COLING 2024). *Set the agenda for fairness in morphologically gendered LMs.*
4. `einarsson2024application` — ChatGPT for academic problem reframing (Computers & Education: AI). *First-author work bridging AI and education.*
5. `einarsson2019bootstrap` — Bootstrap percolation with inhibition (Random Structures & Algorithms). *Premier journal in probabilistic combinatorics; PhD work.*
6. `sigurdhardottir2023otolith` — Otolith age determination with few-shot CV (Ecological Informatics). *Anchors the CV-for-natural-sciences line.*
7. `simonsen2025foqa` — Faroese question-answering dataset. *Extends the Icelandic NLP line to Faroese; RESOURCEFUL 2025.*
8. `einarsson2024sequence` (genetics) — Sequence variants associated with BMI affect disease risk through BMI itself (Nature Communications 2024). *Most prestigious venue in the list; deCODE collaboration.*

**Step 2: Write the YAML**

The structure (illustrative — write entries for all 72):

```yaml
# --- Selected highlights (3-4 sentence summaries) ---

snaebjarnarson2022warm:
  theme: nlp-is
  selected: true
  summary: |
    Releases the Icelandic Crawled Corpus and a warm-start protocol for
    training competitive Icelandic GPT-style language models on modest
    hardware. The recipe — clean web data plus initialisation from a
    multilingual checkpoint — became a template for low-resource LM work
    in Germanic languages and seeds much of the lab's subsequent NLP-IS
    research.
  links:
    arxiv: https://arxiv.org/abs/2207.05450
    pdf: https://aclanthology.org/2022.lrec-1.464.pdf

hauksson2024applications:
  theme: clinical-ai
  selected: true
  summary: |
    Adapts BERT-family Icelandic language models for automated ICD-10
    clinical coding on Landspítali (Icelandic National Hospital)
    discharge summaries. Won the University of Iceland Science Award in
    2024 for the best overall science work and best in the health
    science category.
  links:
    pdf: https://aclanthology.org/2024.findings-naacl.123/

# … 6 more selected …

# --- All other entries (1-2 sentence summaries) ---

einarsson2014high:
  theme: comp-neuro
  summary: |
    A high-capacity Hopfield-style associative-memory model for one-shot
    learning in the brain. Shows capacity scaling beyond classical
    Hebbian bounds under sparse-coding regimes.
  links:
    pdf: https://www.frontiersin.org/articles/10.3389/fncom.2014.00140/full

# … 63 more …
```

(The plan executor will produce the complete file. Use the heuristics above to assign themes and draft summaries from titles + venues. Look up links opportunistically: Frontiers / ACL Anthology / arXiv are easy hits.)

**Step 3: Re-run the parser**

```bash
npm run parse-bib
```
Verify `publications.json` now has populated `theme`, `summary`, `selected`, `links` fields.

**Step 4: Commit**

```bash
git add src/data/pub-overrides.yaml
git commit -m "Draft themes, summaries, links for all publications"
```

> **Author review checkpoint:** After Phase 1 ships, the user does a review pass on `pub-overrides.yaml`. This is expected; the drafts are working text.

---

## Task 8: Base layout, nav, footer, theme toggle

**Goal:** Build the shell every page uses. After this task the build serves a blank-but-styled page with working light/dark.

**Files:**
- Create: `src/components/BaseLayout.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/ThemeToggle.astro`

**Step 1: Create `src/components/ThemeToggle.astro`**

```astro
---
// Renders the toggle button. The early-init script lives in BaseLayout
// (head) to avoid FOUC.
---
<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle color scheme"
  class="p-2 rounded-full text-ink-muted hover:text-accent-warm transition-colors"
>
  <svg class="hidden dark:block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m17.07-7.07-1.41 1.41M6.34 17.66l-1.41 1.41m13.07 0-1.41-1.41M6.34 6.34 4.93 4.93"/></svg>
  <svg class="block dark:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
</button>

<script>
  const btn = document.getElementById('theme-toggle');
  btn?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>
```

**Step 2: Create `src/components/Nav.astro`**

```astro
---
const items = [
  { href: '/research/', label: 'Research' },
  { href: '/publications/', label: 'Publications' },
  { href: '/teaching/', label: 'Teaching' },
  { href: '/group/', label: 'Group' },
  { href: '/blog/', label: 'Blog' },
  { href: '/about/', label: 'About' }
];
const here = Astro.url.pathname;
const isActive = (href: string) =>
  here === href || (href !== '/' && here.startsWith(href));
---
<header class="sticky top-0 z-20 bg-bg/80 backdrop-blur-md border-b border-rule">
  <nav class="max-w-page mx-auto px-6 h-14 flex items-center justify-between">
    <a href="/" class="font-semibold tracking-tight text-ink">Hafsteinn Einarsson</a>
    <ul class="hidden md:flex items-center gap-6 text-sm">
      {items.map((it) => (
        <li>
          <a
            href={it.href}
            class:list={[
              'transition-colors',
              isActive(it.href) ? 'text-accent-warm' : 'text-ink-muted hover:text-ink'
            ]}
          >{it.label}</a>
        </li>
      ))}
    </ul>
    <div class="flex items-center gap-2">
      <slot name="end" />
    </div>
  </nav>
</header>
```

**Step 3: Create `src/components/Footer.astro`**

```astro
---
const profileLinks = [
  { href: 'https://scholar.google.com/citations?user=BVPxKzgAAAAJ', label: 'Scholar' },
  { href: 'https://orcid.org/0000-0001-5072-3678', label: 'ORCID' },
  { href: 'https://github.com/Haffi112', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/hafsteinn-einarsson-619a3711', label: 'LinkedIn' },
  { href: 'https://twitter.com/hafsteinn', label: 'X' },
  { href: '/atom.xml', label: 'RSS' }
];
const year = new Date().getFullYear();
---
<footer class="border-t border-rule mt-24">
  <div class="max-w-page mx-auto px-6 py-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-sm text-ink-muted">
    <span>© {year} Hafsteinn Einarsson</span>
    <ul class="flex flex-wrap gap-4">
      {profileLinks.map((l) => (
        <li><a href={l.href}>{l.label}</a></li>
      ))}
    </ul>
  </div>
</footer>
```

> **Note:** The Google Scholar URL above is a best-guess; replace with the user's actual profile URL when verified. Same for any other profile that the user wants pinned.

**Step 4: Create `src/components/BaseLayout.astro`**

```astro
---
import '~/styles/base.css';
import Nav from './Nav.astro';
import Footer from './Footer.astro';
import ThemeToggle from './ThemeToggle.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} · Hafsteinn Einarsson</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="preconnect" href="https://rsms.me" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <script is:inline>
      // No-FOUC theme init: must run before paint.
      (() => {
        const saved = localStorage.getItem('theme');
        const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved ?? (sysDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
      })();
    </script>
  </head>
  <body class="bg-bg text-ink">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-bg-elev focus:p-2 focus:border focus:border-accent-primary">Skip to content</a>
    <Nav>
      <ThemeToggle slot="end" />
    </Nav>
    <main id="main"><slot /></main>
    <Footer />
  </body>
</html>
```

**Step 5: Verify the build still completes**

```bash
npx astro check
```
Expected: 0 errors.

**Step 6: Commit**

```bash
git add src/components/BaseLayout.astro src/components/Nav.astro src/components/Footer.astro src/components/ThemeToggle.astro
git commit -m "BaseLayout, Nav, Footer, ThemeToggle"
```

---

## Task 9: PubCard, ThemeTag, Prose, Hero, NewsItem

**Goal:** Build the remaining components needed for Phase 1 pages.

**Files:**
- Create: `src/components/ThemeTag.astro`
- Create: `src/components/PubCard.astro`
- Create: `src/components/Prose.astro`
- Create: `src/components/Hero.astro`
- Create: `src/components/NewsItem.astro`
- Create: `src/lib/format-authors.ts`

**Step 1: Create `src/lib/format-authors.ts`**

```ts
import type { Author } from '~/data/publications.schema';

const YOUR_LAST_NAME = 'Einarsson';
const YOUR_FIRST_INITIAL = 'H';

export function formatAuthor(a: Author): string {
  const initials = a.first
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]}.`)
    .join(' ');
  return `${a.last}, ${initials}`;
}

export function isYou(a: Author): boolean {
  return (
    a.last === YOUR_LAST_NAME && a.first.trim().startsWith(YOUR_FIRST_INITIAL)
  );
}
```

**Step 2: Create `src/components/ThemeTag.astro`**

```astro
---
import type { Theme } from '~/data/publications.schema';

interface Props {
  theme?: Theme;
  size?: 'sm' | 'md';
}

const { theme, size = 'sm' } = Astro.props;

const config: Record<Theme, { label: string; tone: string }> = {
  'nlp-is': {
    label: 'NLP for Icelandic & Germanic',
    tone: 'bg-accent-warm-soft text-accent-warm'
  },
  'cv-nat': {
    label: 'Computer Vision · Natural Sciences',
    tone: 'bg-orange-50 text-accent-energy'
  },
  'clinical-ai': {
    label: 'Clinical AI',
    tone: 'bg-accent-warm-soft text-accent-warm'
  },
  genetics: {
    label: 'Genetics',
    tone: 'bg-bg text-ink-muted border border-rule'
  },
  'comp-neuro': {
    label: 'Computational Neuroscience',
    tone: 'bg-accent-primary-soft text-accent-primary'
  }
};

const c = theme ? config[theme] : null;
---
{c && (
  <span
    class:list={[
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1',
      c.tone
    ]}
  >{c.label}</span>
)}
```

**Step 3: Create `src/components/PubCard.astro`**

```astro
---
import type { Publication } from '~/data/publications.schema';
import { formatAuthor, isYou } from '~/lib/format-authors';
import ThemeTag from './ThemeTag.astro';

interface Props {
  pub: Publication;
  variant?: 'selected' | 'list';
}

const { pub, variant = 'list' } = Astro.props;

const linkOrder: Array<{ key: keyof Publication['links']; label: string }> = [
  { key: 'doi', label: 'DOI' },
  { key: 'arxiv', label: 'arXiv' },
  { key: 'pdf', label: 'PDF' },
  { key: 'code', label: 'Code' },
  { key: 'huggingface', label: 'Hugging Face' },
  { key: 'dataset', label: 'Dataset' }
];

const links = linkOrder.filter((l) => pub.links?.[l.key]);
---
<article class:list={[
  'py-5 border-t border-rule first:border-t-0',
  variant === 'selected' && 'bg-bg-elev rounded-xl border border-rule p-6 mb-3'
]}>
  <div class="flex items-center gap-3 mb-2">
    <ThemeTag theme={pub.theme} />
    {variant === 'selected' && (
      <span class="text-xs uppercase tracking-wide text-accent-warm">Selected</span>
    )}
  </div>
  <h3 class="text-lg md:text-xl font-semibold text-ink leading-snug">
    {pub.title}
  </h3>
  <p class="mt-1 text-sm text-ink-muted">
    {pub.authors.map((a, i) => (
      <Fragment>
        {isYou(a)
          ? <strong class="text-ink">{formatAuthor(a)}</strong>
          : formatAuthor(a)}
        {i < pub.authors.length - 1 ? ', ' : ''}
      </Fragment>
    ))}
    {pub.venue && <span class="text-ink-muted"> · {pub.venue}</span>}
    {pub.year ? <span class="text-ink-muted"> · {pub.year}</span> : null}
  </p>
  {pub.summary && (
    <p class="mt-2 text-ink prose-body max-w-prose">{pub.summary}</p>
  )}
  {links.length > 0 && (
    <ul class="mt-3 flex flex-wrap gap-3 text-sm">
      {links.map((l) => (
        <li>
          <a href={pub.links[l.key]}>{l.label} →</a>
        </li>
      ))}
    </ul>
  )}
</article>
```

**Step 4: Create `src/components/Prose.astro`**

```astro
---
---
<div class="prose-body max-w-prose [&>p]:my-4 [&>h2]:mt-12 [&>h2]:mb-3 [&>h2]:text-2xl [&>h2]:font-semibold [&>h3]:mt-8 [&>h3]:mb-2 [&>h3]:text-xl [&>h3]:font-semibold [&>ul]:my-4 [&>ul]:pl-6 [&>ul>li]:list-disc [&>ol]:my-4 [&>ol]:pl-6 [&>ol>li]:list-decimal">
  <slot />
</div>
```

**Step 5: Create `src/components/Hero.astro`**

```astro
---
interface Props {
  photoSrc: string;
}
const { photoSrc } = Astro.props;
---
<section class="max-w-page mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
  <div class="grid md:grid-cols-[180px_1fr] gap-8 md:gap-12 items-start">
    <img
      src={photoSrc}
      alt="Hafsteinn Einarsson"
      width="180"
      height="225"
      class="w-36 md:w-44 rounded-xl border border-rule"
      loading="eager"
      fetchpriority="high"
    />
    <div>
      <h1 class="text-display font-semibold tracking-tight text-ink leading-tight">
        Hafsteinn Einarsson
      </h1>
      <p class="mt-3 text-lg text-ink-muted">
        Associate Professor, University of Iceland<br />
        Research Scientist, deCODE genetics
      </p>
      <p class="mt-6 prose-body max-w-prose">
        I lead a research group working on natural-language processing for
        low-resource Germanic languages — Icelandic and Faroese — with active
        projects in computer vision for the natural sciences, clinical AI,
        and human genetics.
      </p>
      <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <li><a href="/research/">Research →</a></li>
        <li><a href="/publications/">Publications →</a></li>
        <li><a href="/cv.pdf">Download CV ↓</a></li>
      </ul>
    </div>
  </div>
</section>
```

**Step 6: Create `src/components/NewsItem.astro`**

```astro
---
interface Props {
  date: Date;
  text: string;
  link?: string;
  newest?: boolean;
}

const { date, text, link, newest = false } = Astro.props;
const formatted = date.toISOString().slice(0, 7); // YYYY-MM
---
<li class="flex gap-4 py-2 border-t border-rule first:border-t-0">
  <span class="font-mono text-xs text-ink-muted shrink-0 w-16 mt-1 flex items-center gap-1.5">
    {newest && <span class="inline-block w-1.5 h-1.5 rounded-full bg-accent-energy" aria-hidden />}
    {formatted}
  </span>
  <p class="text-ink">
    {link ? <a href={link}>{text}</a> : text}
  </p>
</li>
```

**Step 7: Commit**

```bash
git add src/components/ThemeTag.astro src/components/PubCard.astro src/components/Prose.astro src/components/Hero.astro src/components/NewsItem.astro src/lib/format-authors.ts
git commit -m "PubCard, ThemeTag, Prose, Hero, NewsItem components"
```

---

## Task 10: Photo and CV assets

**Goal:** Get the headshot and CV into `public/` so pages can reference them.

**Files:**
- Create: `public/img/hafsteinn.png` (copied)
- Create: `public/img/hafsteinn.avif`
- Create: `public/img/hafsteinn.webp`
- Create: `public/cv.pdf` (converted from docx)

**Step 1: Copy the headshot**

```bash
mkdir -p public/img
cp personal_images/hafsteinn_einarsson.png public/img/hafsteinn.png
```

The source PNG is 259KB at the original resolution. Phase 4 will generate AVIF/WebP variants and responsive `srcset`. For Phase 1 a single PNG is acceptable; Astro will inline a small one well enough.

**Step 2: Convert CV docx → PDF**

```bash
# Requires LibreOffice or pandoc with a TeX backend.
# Pandoc → PDF needs xelatex (for Icelandic chars). Try:
pandoc old_cvs/2026/january/two_page_CV_2026_january.docx \
  -o public/cv.pdf \
  --pdf-engine=xelatex \
  -V mainfont="Times" \
  -V geometry:margin=2.5cm
```

Fallback if xelatex isn't installed: open the docx in LibreOffice and export as PDF. Or:

```bash
soffice --headless --convert-to pdf --outdir public/ old_cvs/2026/january/two_page_CV_2026_january.docx
mv public/two_page_CV_2026_january.pdf public/cv.pdf
```

**Step 3: Verify the PDF**

```bash
ls -la public/cv.pdf
# Open visually to verify Icelandic characters render correctly.
open public/cv.pdf
```

**Step 4: Commit**

```bash
git add public/img/hafsteinn.png public/cv.pdf
git commit -m "Add headshot and CV PDF to public assets"
```

---

## Task 11: Home page

**Goal:** `/` renders with hero, news, selected publications.

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/content/news/2026-04-fish-classification.yml`
- Create: `src/content/news/2026-02-microsoft-lingua.yml`
- Create: `src/content/news/2025-09-mazeeval.yml`
- Create: `src/content/news/2025-05-foqa.yml`
- Create: `src/content/news/2025-01-nb-real.yml`

**Step 1: Add some seed news items**

Example (`src/content/news/2026-04-fish-classification.yml`):

```yaml
date: 2026-04-15
text: "New paper on temporal vision-language features for fish classification (Ecological Informatics)."
link: https://doi.org/10.1016/j.ecoinf.2025.103462
```

Repeat with the other four; dates and text drawn from the most recent items in `references.bib` and the April 2026 track-record CV.

**Step 2: Create `src/pages/index.astro`**

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import Hero from '~/components/Hero.astro';
import NewsItem from '~/components/NewsItem.astro';
import PubCard from '~/components/PubCard.astro';
import { getCollection } from 'astro:content';
import pubs from '~/data/publications.json';

const news = (await getCollection('news'))
  .map((n) => ({ ...n.data, id: n.id }))
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 5);

const selected = (pubs as any[])
  .filter((p) => p.selected)
  .slice(0, 3);
---
<BaseLayout
  title="Home"
  description="Hafsteinn Einarsson — Associate Professor at the University of Iceland and Research Scientist at deCODE genetics."
>
  <Hero photoSrc="/img/hafsteinn.png" />

  <section class="max-w-page mx-auto px-6 py-12">
    <div class="flex items-baseline justify-between">
      <h2 class="text-2xl font-semibold text-ink">News</h2>
    </div>
    <ul class="mt-4 max-w-prose">
      {news.map((n, i) => (
        <NewsItem
          date={n.date}
          text={n.text}
          link={n.link}
          newest={i === 0}
        />
      ))}
    </ul>
  </section>

  <section class="max-w-page mx-auto px-6 py-12">
    <div class="flex items-baseline justify-between">
      <h2 class="text-2xl font-semibold text-ink">Selected publications</h2>
      <a href="/publications/" class="text-sm">All publications →</a>
    </div>
    <div class="mt-4">
      {selected.map((p) => <PubCard pub={p} variant="selected" />)}
    </div>
  </section>
</BaseLayout>
```

**Step 3: Build and view**

```bash
npm run build
npm run preview
```
Expected: `/` renders with hero (photo + intro), news list, and three selected publication cards. Test light/dark toggle.

**Step 4: Commit**

```bash
git add src/pages/index.astro src/content/news/
git commit -m "Home page with hero, news, selected publications"
```

---

## Task 12: About page

**Goal:** `/about/` ships with bio, photo (text-led, no duplicate photo), CV link, and contact.

**Files:**
- Create: `src/pages/about/index.astro`

**Step 1: Write the page**

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import Prose from '~/components/Prose.astro';
---
<BaseLayout
  title="About"
  description="About Hafsteinn Einarsson — research, group, and contact."
>
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">About</h1>
    <div class="mt-8 max-w-prose">
      <Prose>
        <p>
          I am an Associate Professor of Computer Science at the University of
          Iceland and a Research Scientist at deCODE genetics. I lead a research
          group focused on natural-language processing for low-resource Germanic
          languages — primarily Icelandic and Faroese — with active strands in
          computer vision for the natural sciences, clinical AI, and human
          genetics.
        </p>

        <p>
          I trained in mathematical models of neural systems at ETH Zurich
          (PhD 2017), drawing on probability theory, distributed computing,
          and differential equations. After a postdoc in systems neuroscience
          and two years as a data scientist in banking, I joined the University
          of Iceland in 2020 and built a group around language modelling and
          dataset creation for under-resourced languages. The group has
          contributed Icelandic and Faroese language models, automated clinical
          coding pipelines, gender-bias evaluations for morphologically gendered
          languages, sentiment-annotation resources for Icelandic, and
          machine-translation work for Faroese. I currently supervise three PhD
          students as main supervisor and serve on a further seven committees.
        </p>

        <h2>Beyond research</h2>
        <p>
          I came to language modelling from the brain — specifically the long
          question of how small, identical-looking circuits could give rise to
          the staggering complexity of cortex. I no longer expect to find the
          “canonical microcircuit” in my career. But the underlying habit — of
          asking how complex behaviour falls out of simple components and simple
          rules — is the same habit I now apply to language: a small grammar,
          a few million tokens, and a corpus that captures a place.
        </p>

        <h2>CV</h2>
        <p>
          <a href="/cv.pdf">Download CV (PDF)</a> · <a href="/cv/">View inline</a>
        </p>

        <h2>Contact</h2>
        <ul>
          <li>Email · <a href="mailto:hafsteinne@hi.is">hafsteinne@hi.is</a></li>
          <li>ORCID · <a href="https://orcid.org/0000-0001-5072-3678">0000-0001-5072-3678</a></li>
          <li>Google Scholar · <a href="https://scholar.google.com/citations?user=BVPxKzgAAAAJ">profile</a></li>
          <li>GitHub · <a href="https://github.com/Haffi112">@Haffi112</a></li>
          <li>X · <a href="https://twitter.com/hafsteinn">@hafsteinn</a></li>
          <li>LinkedIn · <a href="https://www.linkedin.com/in/hafsteinn-einarsson-619a3711">profile</a></li>
        </ul>
      </Prose>
    </div>
  </section>
</BaseLayout>
```

**Step 2: Build and view**

```bash
npm run build
npm run preview
# Visit http://localhost:4321/about/
```

**Step 3: Commit**

```bash
git add src/pages/about/index.astro
git commit -m "About page"
```

---

## Task 13: Publications page

**Goal:** `/publications/` renders selected highlights and themed all-pubs sections from `publications.json`.

**Files:**
- Create: `src/pages/publications/index.astro`

**Step 1: Write the page**

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import PubCard from '~/components/PubCard.astro';
import pubs from '~/data/publications.json';
import type { Publication, Theme } from '~/data/publications.schema';

const all = pubs as Publication[];
const selected = all.filter((p) => p.selected);
const themeOrder: Theme[] = ['nlp-is', 'cv-nat', 'clinical-ai', 'genetics', 'comp-neuro'];
const themeLabels: Record<Theme, string> = {
  'nlp-is': 'NLP for Icelandic and Germanic languages',
  'cv-nat': 'Computer vision for natural sciences',
  'clinical-ai': 'Clinical AI and cardiology',
  genetics: 'Human genetics and computational biology',
  'comp-neuro': 'Computational neuroscience'
};

const byTheme: Record<Theme, Publication[]> = {
  'nlp-is': [], 'cv-nat': [], 'clinical-ai': [], genetics: [], 'comp-neuro': []
};
for (const p of all) {
  if (p.theme) byTheme[p.theme].push(p);
}
// Within each theme, newest first (already sorted by parse-bib by year desc)

const lastBuild = new Date();
---
<BaseLayout
  title="Publications"
  description="Publications by Hafsteinn Einarsson — themed list with summaries and links."
>
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">Publications</h1>
    <p class="mt-3 text-ink-muted text-sm">
      {all.length} publications · last updated {lastBuild.toISOString().slice(0, 10)} ·
      <a href="https://orcid.org/0000-0001-5072-3678">ORCID</a> ·
      <a href="https://scholar.google.com/citations?user=BVPxKzgAAAAJ">Google Scholar</a>
    </p>

    {selected.length > 0 && (
      <section class="mt-12 max-w-pubs">
        <h2 class="text-2xl font-semibold text-ink mb-4">Selected</h2>
        {selected.map((p) => <PubCard pub={p} variant="selected" />)}
      </section>
    )}

    <section class="mt-16 max-w-pubs">
      <h2 class="text-2xl font-semibold text-ink">All publications</h2>
      {themeOrder.map((t) => (
        byTheme[t].length > 0 && (
          <section class="mt-10">
            <h3 class="text-xl font-semibold text-ink mb-2">{themeLabels[t]}</h3>
            {byTheme[t].map((p) => <PubCard pub={p} variant="list" />)}
          </section>
        )
      ))}
    </section>
  </section>
</BaseLayout>
```

**Step 2: Build and view**

```bash
npm run build
npm run preview
# Visit http://localhost:4321/publications/
```
Expected: all 72 publications appear, themed correctly. Hafsteinn's name is bold in each author list. Theme tags render in the right colors. Links work.

**Step 3: Commit**

```bash
git add src/pages/publications/index.astro
git commit -m "Publications page with selected highlights and themed sections"
```

---

## Task 14: CV view page

**Goal:** `/cv/` embeds the PDF with a download fallback.

**Files:**
- Create: `src/pages/cv/index.astro`

**Step 1: Write the page**

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
---
<BaseLayout title="CV" description="Curriculum Vitae — Hafsteinn Einarsson.">
  <section class="max-w-page mx-auto px-6 py-12">
    <div class="flex items-baseline justify-between mb-4">
      <h1 class="text-3xl font-semibold text-ink">Curriculum Vitae</h1>
      <a href="/cv.pdf" download class="text-sm">Download PDF ↓</a>
    </div>
    <object
      data="/cv.pdf"
      type="application/pdf"
      class="w-full h-[80vh] border border-rule rounded"
      aria-label="Hafsteinn Einarsson's CV"
    >
      <p class="prose-body p-6">
        Your browser cannot display the embedded PDF.
        <a href="/cv.pdf">Download the CV here.</a>
      </p>
    </object>
  </section>
</BaseLayout>
```

**Step 2: Build and view**

```bash
npm run build
npm run preview
# Visit http://localhost:4321/cv/
```

**Step 3: Commit**

```bash
git add src/pages/cv/index.astro
git commit -m "CV view page with embedded PDF"
```

---

## Task 15: Update deploy.sh

**Goal:** Replace the Jekyll-era deploy.sh with the Astro equivalent.

**Files:**
- Modify: `deploy.sh`

**Step 1: Snapshot the current deploy repo before risk**

```bash
cd haffi112.github.io
git tag pre-astro-snapshot
git push origin pre-astro-snapshot
cd ..
```
Now if Phase 1 deploy goes sideways the previous live site is recoverable.

**Step 2: Rewrite `deploy.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

# Build the Astro site
echo "→ Building Astro site"
npm run build

# Mirror dist/ into the deploy repo, preserving:
#   - .git (deploy repo's own history)
#   - CNAME (if present)
#   - 2016/, simulations/, public/, assets/, atom.xml — old URLs that
#     Phase 3 will replace with Astro-rendered equivalents. Keep them
#     alive in the meantime so external links don't break.
echo "→ Syncing dist/ into haffi112.github.io/"
rsync -a --delete \
  --exclude='.git/' \
  --exclude='CNAME' \
  --exclude='2016/' \
  --exclude='simulations/' \
  --exclude='public/' \
  --exclude='assets/' \
  --exclude='atom.xml' \
  dist/ haffi112.github.io/

# Commit and push the deploy repo
cd haffi112.github.io
echo "→ Committing deploy"
git add -A
if git diff --staged --quiet; then
  echo "  No changes to deploy"
else
  git commit -m "Deploy."
  git push
fi
```

Make it executable:

```bash
chmod +x deploy.sh
```

**Step 3: Test a dry-run build only**

```bash
npm run build
# Check dist/ contains: index.html, about/index.html, publications/index.html,
# cv/index.html, cv.pdf, img/hafsteinn.png, _astro/<css and js>.
ls dist/
```

**Step 4: Commit (don't deploy yet)**

```bash
git add deploy.sh
git commit -m "Astro deploy script"
```

---

## Task 16: Full smoke test before first deploy

**Goal:** Catch any issues before they hit `haffi112.github.io`.

**Step 1: Build clean**

```bash
rm -rf dist .astro
npm run build
```
Expected: build completes with no errors. Build output reports the pages generated (`/`, `/about/`, `/publications/`, `/cv/`, plus any `404`).

**Step 2: Preview**

```bash
npm run preview
```

**Step 3: Manual smoke checklist** (visit each URL)

- [ ] `/` — hero photo loads, name and roles correct, news list renders, three selected pubs visible, theme toggle flips correctly
- [ ] `/about/` — bio reads correctly, links work, CV download triggers
- [ ] `/publications/` — 72 entries appear, themes color-tag correctly, Hafsteinn bolded in every author list, no raw `{\TH}` or `{\dh}` strings visible
- [ ] `/cv/` — PDF embedded and viewable, download link works
- [ ] Dark mode flips for all four pages without FOUC
- [ ] Mobile responsive: resize to 375px width and verify nav, hero, pub cards
- [ ] No console errors in browser devtools

**Step 4: Run accessibility quick-check**

```bash
npx @axe-core/cli http://localhost:4321/ --exit
```
Expected: no critical violations. (If axe-core isn't installed: `npx pa11y http://localhost:4321/` is a fallback.)

**Step 5: If everything passes, commit a marker**

```bash
git tag phase-1-ready
```

---

## Task 17: First deploy

**Goal:** Push the new site to `haffi112.github.io` and verify it's live.

**Step 1: Deploy**

```bash
./deploy.sh
```
Expected output: build succeeds, rsync reports the changes, commit message `Deploy.`, push succeeds.

**Step 2: Verify**

After GitHub Pages picks up the push (usually 30s to a few minutes), visit https://haffi112.github.io/ in a browser:

- [ ] Home loads with photo and bio
- [ ] About page works
- [ ] Publications page renders all 72 entries
- [ ] CV page embeds the PDF
- [ ] `/cv.pdf` resolves directly
- [ ] Theme toggle works
- [ ] No 404s in the network panel
- [ ] Old URLs still resolve (verifying the rsync excludes worked):
  - https://haffi112.github.io/simulations/
  - https://haffi112.github.io/2016/03/27/bootstrap-percolation/
  - https://haffi112.github.io/2016/05/15/lif-neuron/

**Step 3: If anything is broken**

- Roll back: `cd haffi112.github.io && git reset --hard pre-astro-snapshot && git push --force-with-lease`
- Investigate locally, redeploy.

**Step 4: Push the source repo**

```bash
git push origin master
git push origin phase-1-ready
```

---

## What's done after Phase 1

After all 17 tasks, the live site has:
- Modern home, about, publications, CV pages.
- The full design system (typography, color tokens, light/dark, motion).
- A live publications list of 72 papers with summaries, themes, and links.
- Updated deploy script.
- A snapshot tag to roll back to if needed.

**Author review checklist for Phase 1:**
- [ ] All author summaries in `pub-overrides.yaml` are correct (no factual errors)
- [ ] The 8 "selected" papers are the right 8
- [ ] News items are accurate and dated correctly
- [ ] About page text reads true to voice
- [ ] CV is the right version
- [ ] Profile links (Scholar, ORCID, GitHub, LinkedIn, X) all resolve

## What Phase 1 explicitly does NOT do

- No `/research/`, `/teaching/`, `/group/`, `/blog/`, `/simulations/`. Old Jekyll-generated copies of `/about/` and `/simulations/` in the deploy repo are *overwritten* by the rsync `--delete`. If the old `/simulations/` and old blog posts are important to preserve as live URLs through the Phase 2-3 gap, we add an exclusion to the rsync or pre-copy them out before deploying.

**Old-URL preservation policy (decided 2026-05-11):** Task 15's rsync excludes `2016/`, `simulations/`, `public/`, `assets/`, and `atom.xml`. After Phase 1 deploys, those URLs keep serving the Lanyon-era versions until Phase 3 replaces them with Astro-rendered equivalents. Task 17 should verify that a sampling of those old URLs still resolves after deploy (e.g., `/simulations/`, `/2016/03/27/bootstrap-percolation/`).

---

## Plan complete

Plan saved to `docs/plans/2026-05-11-website-refresh-phase-1.md`.
