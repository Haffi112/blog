# Website Refresh — Phase 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` or `superpowers:subagent-driven-development`.

**Goal:** Port the 5 Jekyll-era blog posts (2016) and their interactive simulations to Astro MDX. Stand up `/blog/` (chronological index), `/atom.xml` (RSS feed), and `/simulations/` (standalone-sim index). Drop `keep_files: true` from the deploy workflow once everything is ported.

**Architecture:** Posts migrate to MDX with KaTeX for math, custom `<Cite>` / `<Bibliography>` components for jekyll-scholar-style citations, and a `<Simulation>` wrapper for inline interactive widgets. The original simulation JS (vis.js + D3 + jQuery 1.12-era code) is preserved as static assets and loaded per-page via Astro `<script>` tags rather than ported to modern frameworks — these are 2016 snapshots that should stay frozen.

**Tech Stack additions:** `remark-math`, `rehype-katex`, KaTeX CSS. Already have `@astrojs/mdx` (installed in Phase 1).

**Reference design:** `docs/plans/2026-05-11-website-refresh-design.md` Section 9 (Phase 3).
**Reference for Phase 1-2 conventions:** previous plan files.

---

## Pre-flight

- [ ] On `master`, working tree clean
- [ ] Phase 2 live
- [ ] Create branch: `git checkout -b phase-3-blog-migration`

---

## Task 1: MDX + KaTeX integration

**Goal:** Install math rendering, wire up MDX with `remark-math` + `rehype-katex`, drop KaTeX CSS into the global stylesheet.

**Files:**
- Modify: `astro.config.mjs` (add remark/rehype plugins)
- Modify: `package.json` (add deps)
- Modify: `src/styles/global.css` (import KaTeX CSS)

**Step 1: Install:**

```bash
npm install remark-math rehype-katex katex
```

**Step 2: Update `astro.config.mjs`:**

Add to the `mdx()` integration:

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://haffi112.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    })
  ],
  vite: { plugins: [tailwindcss()] }
});
```

**Step 3: Import KaTeX CSS in `src/styles/global.css`** — add at the top, after `@import "tailwindcss";`:

```css
@import "katex/dist/katex.min.css";
```

**Step 4: Verify** with `npm run build` (no posts yet using math, so just checking the config compiles).

**Step 5: Commit:**

```bash
git add astro.config.mjs package.json package-lock.json src/styles/global.css
git commit -m "MDX with KaTeX math rendering via remark-math + rehype-katex"
```

---

## Task 2: Bibliography infrastructure

**Goal:** Parse `_bibliography/references.bib` (7 academic references cited by old posts) to a JSON file. Create `<Cite>` and `<Bibliography>` components for MDX use.

**Files:**
- Modify: `scripts/parse-bib.ts` (also emit `src/data/cited-refs.json` from `_bibliography/references.bib`)
- Create: `src/data/cited-refs.json` (gitignored, generated)
- Create: `src/components/Cite.astro`
- Create: `src/components/Bibliography.astro`

**Step 1: Extend `scripts/parse-bib.ts`:**

After the existing main() body that writes `publications.json`, add a parallel run on `_bibliography/references.bib` → `src/data/cited-refs.json`. Use the same parsing logic; only difference is the input and output paths.

Refactor `main()` to:
```ts
async function processBibFile(bibPath: string, outPath: string, overrides: Record<string, Partial<Publication>>) {
  const bibSource = readFileSync(bibPath, 'utf8');
  const raw = parseBib(bibSource);
  const merged = raw.map((entry) => merge(entry, overrides[entry.id]));
  merged.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
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
```

**Step 2: Add `cited-refs.json` to .gitignore:**

```
src/data/cited-refs.json
```

**Step 3: Run parser:**

```bash
npm run parse-bib
```

Verify both JSON files exist; `cited-refs.json` should have 7 entries.

**Step 4: Create `src/components/Cite.astro`:**

```astro
---
import cited from '~/data/cited-refs.json';
import type { Publication } from '~/data/publications.schema';

interface Props {
  key: string;
}

const refs = cited as unknown as Publication[];
const ref = refs.find((r) => r.id === Astro.props.key);
const number = ref ? refs.indexOf(ref) + 1 : null;

if (!ref) {
  // Surface broken citations at build time
  console.warn(`[Cite] Unknown bibtex key: ${Astro.props.key}`);
}
---
{ref ? (
  <a href={`#ref-${ref.id}`} class="text-sm align-baseline">[{number}]</a>
) : (
  <span class="text-accent-energy">[?{Astro.props.key}]</span>
)}
```

**Step 5: Create `src/components/Bibliography.astro`:**

```astro
---
import cited from '~/data/cited-refs.json';
import type { Publication } from '~/data/publications.schema';

interface Props {
  keys: string[];  // bibtex ids cited in the page
}

const refs = (cited as unknown as Publication[]).filter((r) =>
  Astro.props.keys.includes(r.id)
);
// Preserve order: by year desc then alpha by id (matches parse-bib order)
refs.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
---
<ol class="mt-8 max-w-prose text-sm text-ink-muted space-y-2 list-decimal pl-6">
  {refs.map((r) => (
    <li id={`ref-${r.id}`} class="scroll-mt-20">
      {r.authors.map((a) => `${a.last}, ${a.first.split(' ').map(p => p[0] + '.').join(' ')}`).join('; ')}
      {' '}({r.year}).{' '}
      <span class="text-ink">{r.title}</span>.
      {r.venue && <span> {r.venue}.</span>}
    </li>
  ))}
</ol>
```

**Step 6: Commit:**

```bash
git add scripts/parse-bib.ts src/components/Cite.astro src/components/Bibliography.astro .gitignore
git commit -m "Citation infrastructure: parse _bibliography/references.bib + Cite/Bibliography components"
```

---

## Task 3: Simulation wrapper component

**Goal:** Component that renders an inline interactive simulation: the HTML control block + a slot for the visualization container, and loads the relevant JS as a page-scoped `<script>` (jQuery first, then per-simulation scripts).

**Files:**
- Create: `src/components/Simulation.astro`

```astro
---
interface Props {
  scripts: string[];  // public-relative paths, e.g. ['/js/vis.min.js', '/js/bootstrap_percolation_visjs.js']
  styles?: string[];  // public-relative paths
  needsJquery?: boolean;
}

const { scripts, styles = [], needsJquery = true } = Astro.props;
---
{styles.map((href) => <link rel="stylesheet" href={href} />)}
<div class="my-8 border border-rule rounded-xl bg-bg-elev p-4 overflow-x-auto">
  <slot />
</div>
{needsJquery && (
  <script is:inline src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
)}
{scripts.map((src) => <script is:inline src={src}></script>)}
```

Note: `is:inline` keeps the scripts unminified by Astro and ensures load order. jQuery 1.12.4 (CDN) replaces the old googleapis URL.

**Step 1: Commit:**

```bash
git add src/components/Simulation.astro
git commit -m "Simulation wrapper component for inline 2016-era interactive widgets"
```

---

## Task 4: Blog content schema verification

**Goal:** The `blog` content collection schema was defined in Phase 1 Task 4. Verify it accepts the frontmatter we'll use; tweak if needed.

**Files:**
- Possibly modify: `src/content/config.ts`

The schema is:
```ts
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
      customCss: z.array(z.string()).default([])
    })
});
```

We'll likely want to add `customJs: z.array(z.string()).default([])` for parity with the old Jekyll frontmatter, and that's already there in spirit (`customCss`). Add a `cited: z.array(z.string()).default([])` field to track which bibtex keys this post cites (used by the layout to render `<Bibliography>`).

Apply this patch:

```ts
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
      customCss: z.array(z.string()).default([]),
      cited: z.array(z.string()).default([])
    })
});
```

Run `npx astro sync` and confirm no errors.

Commit:

```bash
git add src/content/config.ts
git commit -m "Add 'cited' field to blog frontmatter schema"
```

---

## Task 5: Blog post layout

**Goal:** A layout that wraps each blog post — title, date, prose container, automatic bibliography section.

**Files:**
- Create: `src/layouts/PostLayout.astro`

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import Bibliography from '~/components/Bibliography.astro';
import { Prose } from '~/components/Prose.astro';

interface Props {
  title: string;
  date: Date;
  cited?: string[];
}

const { title, date, cited = [] } = Astro.props;
---
<BaseLayout title={title}>
  <article class="max-w-page mx-auto px-6 py-12">
    <header class="max-w-prose">
      <p class="text-sm text-ink-muted font-mono">{date.toISOString().slice(0, 10)}</p>
      <h1 class="mt-2 text-4xl font-semibold tracking-tight text-ink leading-tight">{title}</h1>
    </header>
    <div class="mt-10 prose-body max-w-prose [&>p]:my-5 [&>h2]:mt-12 [&>h2]:mb-3 [&>h2]:text-2xl [&>h2]:font-semibold [&>h3]:mt-8 [&>h3]:mb-2 [&>h3]:text-xl [&>h3]:font-semibold [&>ul]:my-4 [&>ul]:pl-6 [&>ul>li]:list-disc [&>ol]:my-4 [&>ol]:pl-6 [&>ol>li]:list-decimal [&>blockquote]:border-l-4 [&>blockquote]:border-rule [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-ink-muted">
      <slot />
    </div>
    {cited.length > 0 && (
      <section class="mt-16 max-w-prose">
        <h2 class="text-xl font-semibold text-ink">References</h2>
        <Bibliography keys={cited} />
      </section>
    )}
  </article>
</BaseLayout>
```

Drop the `Prose` import if unused — the inline class string above replaces it for the post body so we can add post-specific styling like blockquote.

Commit:

```bash
git add src/layouts/PostLayout.astro
git commit -m "PostLayout with auto-bibliography from frontmatter.cited"
```

---

## Task 6: Migrate posts 1-2 (bootstrap percolation + asynchronous percolation)

**Goal:** Port these two related posts to MDX. Both have inline vis.js simulations and citations.

**Files:**
- Create: `src/content/blog/2016-03-27-bootstrap-percolation.mdx`
- Create: `src/content/blog/2016-04-08-asynchronous-percolation.mdx`

For each:
1. Read the original `.md` from `_posts/`.
2. Copy the prose as-is, replacing Liquid templates:
   - `{% cite key %}` → `<Cite key="key" />`
   - `{% post_url 2016-04-08-asynchronous-percolation %}` → `/2016/04/08/asynchronous-percolation/`
   - `{% bibliography --cited %}` → DELETE (the layout renders the bibliography from `cited` frontmatter)
3. Convert math: jekyll uses `$$...$$` for both inline and display. In KaTeX MDX:
   - Inline: `$...$` (single dollar, but inside MDX you need to escape with `\$` if it's actual currency)
   - Display: `$$...$$` on its own line
4. Preserve inline HTML for simulation form/divs.
5. Replace the `<script>` references in the old custom_js frontmatter with a `<Simulation>` component import.
6. Add frontmatter: title, date (from filename), cited keys, customCss/customJs lists become metadata for the Simulation component.

Example skeleton for the bootstrap post:

```mdx
---
title: Bootstrap percolation
date: 2016-03-27
cited:
  - amini2014inhomogeneous
  - chalupa1979bootstrap
  - balogh2012sharp
  - einarsson2014bootstrap
  - janson2012bootstrap
---

import Cite from '~/components/Cite.astro';
import Simulation from '~/components/Simulation.astro';

If you have ever heard about *[percolation](https://en.wikipedia.org/wiki/Percolation)*...

[prose, with <Cite key="amini2014inhomogeneous" /> inline where citations were]

The [next post](/2016/04/08/asynchronous-percolation/) discusses a variation...

<Simulation
  scripts={['/js/vis.min.js', '/js/vis_utils.js', '/js/bootstrap_percolation_visjs.js']}
  styles={['/css/vis.min.css']}
>
  <div id="mynetwork" style="max-width: 720px; height: 720px;border: 1px solid lightgray;"></div>

  <form onsubmit="draw(); return false;" style="margin-bottom:20px">
    [the existing form]
  </form>

  <p class="message" id="message" style="visibility:hidden;"></p>
</Simulation>

## Acknowledgements
Thanks to [Guðmundur](http://www2.compute.dtu.dk/~guei/) for reading a draft of this post.
```

**Check public/js/ has the required files:**

```bash
ls public/js/vis.min.js public/js/vis_utils.js public/js/bootstrap_percolation_visjs.js public/css/vis.min.css 2>&1
```

If `public/js/vis.min.js` is missing (the original `.gitignore` excluded `public/js/vis.min.js`), grab it from CDN or commit it (it's vendored vis.js). Easiest fix: change the script URL to `https://unpkg.com/vis-network@9/standalone/umd/vis-network.min.js` or similar — but this changes the API. Safer: vendor the exact version from the legacy site. Check what's in the legacy deploy repo at `haffi112.github.io/public/js/vis.min.js` (which is preserved).

If the file exists in haffi112.github.io/public/js/, copy it:
```bash
cp haffi112.github.io/public/js/vis.min.js public/js/
cp haffi112.github.io/public/css/vis.min.css public/css/
```
(These were originally gitignored because they're vendored; we now need them in the new build.)

Add an exception to `.gitignore`:
```
!public/js/vis.min.js
!public/js/vis.map
```
Wait — the current `.gitignore` has `public/js/vis.map` and `public/js/vis.min.js`. Either remove those lines (so the files get tracked) or copy the files in but keep them gitignored (then they're rebuilt by Astro's public/ copy at build, BUT they need to actually be present in public/ at build time). Cleanest: REMOVE those lines from `.gitignore` and commit the vendored files.

**Step:** Edit `.gitignore` to remove `public/js/vis.map` and `public/js/vis.min.js`. Copy the files from `haffi112.github.io/public/`. Verify with `ls public/js/vis.min.js`.

**Astro URL preservation:**

Astro will route blog content collection entries via a `[...slug]` page (created next). To get `/2016/03/27/bootstrap-percolation/` URLs, we'll need a static-paths setup in Task 7. So we just put the MDX files in `src/content/blog/` and the routing page handles the date-based URL.

**Commit:**

```bash
git add src/content/blog/2016-03-27-bootstrap-percolation.mdx src/content/blog/2016-04-08-asynchronous-percolation.mdx public/js/vis.min.js public/js/vis.map public/css/vis.min.css .gitignore
git commit -m "Migrate posts: bootstrap percolation and asynchronous percolation"
```

---

## Task 7: Blog post route (`/[year]/[month]/[day]/[slug]/`)

**Goal:** Render every MDX file in the blog content collection at its original 2016 URL.

**Files:**
- Create: `src/pages/[year]/[month]/[day]/[slug]/index.astro`

```astro
---
import { getCollection, getEntry } from 'astro:content';
import PostLayout from '~/layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => {
    const d = post.data.date;
    const year = String(d.getUTCFullYear());
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    // Strip leading "YYYY-MM-DD-" from slug if present
    const slug = post.slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return {
      params: { year, month, day, slug },
      props: { post }
    };
  });
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<PostLayout title={post.data.title} date={post.data.date} cited={post.data.cited}>
  <Content />
</PostLayout>
```

**Verify:**

```bash
npm run build
ls dist/2016/03/27/bootstrap-percolation/
```

Expect: `index.html` to exist.

**Commit:**

```bash
git add src/pages
git commit -m "Date-based blog post route preserving /YYYY/MM/DD/slug/ URLs"
```

---

## Task 8: Migrate posts 3-4 (percolation with inhibition × 2)

**Goal:** Port the remaining two percolation posts.

**Files:**
- Create: `src/content/blog/2016-04-25-percolation-with-inhibition.mdx`
- Create: `src/content/blog/2016-04-29-percolation-with-inhibition-part2.mdx`

Follow the same migration pattern as Task 6. Post 4 is large (581 lines) and math-heavy (17 expressions). The 4th post has no jQuery simulation but does have a few d3-based widgets. Check the original frontmatter for custom_js entries; use the `<Simulation>` component or inline `<script>` tags as appropriate.

Commit:

```bash
git add src/content/blog/2016-04-25-percolation-with-inhibition.mdx src/content/blog/2016-04-29-percolation-with-inhibition-part2.mdx
git commit -m "Migrate posts: percolation with inhibition and part 2"
```

---

## Task 9: Migrate post 5 (LIF neuron)

**Goal:** Port the LIF neuron post — D3 simulation, 19 math expressions, 1 citation.

**File:**
- Create: `src/content/blog/2016-05-15-lif-neuron.mdx`

Same pattern. The D3 simulation script is at `public/js/lifneuron.js` (or similar — check the original frontmatter `custom_js: d3/d3.min`). The original loads `d3.min.js` and the post has an inline D3 visualization defined in markdown.

If the original post defines the D3 sim inline (not in a separate JS file), keep it inline as an Astro `<script>` block.

Commit:

```bash
git add src/content/blog/2016-05-15-lif-neuron.mdx
git commit -m "Migrate post: leaky integrate-and-fire neuron"
```

---

## Task 10: `/blog/` index page

**Goal:** Reverse-chronological list of all blog posts.

**File:**
- Create: `src/pages/blog/index.astro`

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const postUrl = (slug: string, date: Date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const stripped = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return `/${y}/${m}/${d}/${stripped}/`;
};
---
<BaseLayout title="Blog" description="Blog posts on computational neuroscience and applied ML.">
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">Blog</h1>
    <p class="mt-3 text-ink-muted max-w-prose">
      Notes on computational neuroscience and applied machine learning. Older posts (2016) are from my PhD years; new posts will pick up the thread.
    </p>
    <ul class="mt-12 max-w-prose">
      {posts.map((p) => (
        <li class="py-5 border-t border-rule first:border-t-0">
          <p class="font-mono text-xs text-ink-muted">{p.data.date.toISOString().slice(0, 10)}</p>
          <h2 class="mt-1 text-xl font-semibold text-ink">
            <a href={postUrl(p.slug, p.data.date)}>{p.data.title}</a>
          </h2>
          {p.data.excerpt && <p class="mt-2 prose-body text-ink-muted">{p.data.excerpt}</p>}
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>
```

Commit:

```bash
git add src/pages/blog/index.astro
git commit -m "Blog index page"
```

---

## Task 11: `/atom.xml` RSS feed

**Goal:** Astro-rendered RSS feed at `/atom.xml`. Use `@astrojs/rss`.

**Files:**
- Modify: `package.json` (add dep)
- Create: `src/pages/atom.xml.ts`

```bash
npm install @astrojs/rss
```

```ts
// src/pages/atom.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'Hafsteinn Einarsson',
    description: 'Notes on computational neuroscience, NLP, and applied ML.',
    site: context.site,
    items: posts.map((p) => {
      const d = p.data.date;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const slug = p.slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return {
        title: p.data.title,
        pubDate: p.data.date,
        description: p.data.excerpt ?? '',
        link: `/${y}/${m}/${dd}/${slug}/`
      };
    })
  });
}
```

Commit:

```bash
git add package.json package-lock.json src/pages/atom.xml.ts
git commit -m "Astro-rendered RSS feed at /atom.xml"
```

---

## Task 12: `/simulations/` index page + standalone HTML

**Goal:** Recreate `/simulations/` listing (was a Lanyon page) and copy the standalone simulation HTML files into `public/simulations/` so they serve at the same URLs.

**Files:**
- Create: `src/pages/simulations/index.astro`
- Copy: existing `simulations/*.html` into `public/simulations/` (after URL rewriting from `/public/css/...` → `/css/...`)

**Step 1: Create the listing page** (mirror of the old Jekyll page content):

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';

const sims = [
  { href: '/simulations/standard-percolation.html', label: 'Synchronous bootstrap percolation' },
  { href: '/simulations/dscaling.html', label: 'Local homeostatic plasticity' },
  { href: '/simulations/izhikevich_neuron.html', label: 'NMDA enhanced, conductance based Izhikevich neuron' },
  { href: '/simulations/dice_parser.html', label: 'Dice parser' }
];
---
<BaseLayout title="Simulations">
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">Simulations</h1>
    <p class="mt-3 prose-body max-w-prose">
      Standalone interactive simulations from my PhD years. Most use <a href="https://d3js.org/">d3.js</a> for the visuals. Feel free to use them for educational purposes; the code lives in <a href="https://github.com/Haffi112/blog">the GitHub repo</a>.
    </p>
    <ul class="mt-8 max-w-prose">
      {sims.map((s) => (
        <li class="py-3 border-t border-rule first:border-t-0">
          <a href={s.href}>{s.label} →</a>
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>
```

**Step 2: Copy + rewrite the standalone HTML files:**

```bash
mkdir -p public/simulations
for f in simulations/*.html; do
  fname=$(basename "$f")
  # rewrite /public/ → / for new path layout
  sed 's|/public/|/|g' "$f" > "public/simulations/$fname"
done
ls public/simulations/
```

Spot-check one of them:
```bash
grep -E '<script|<link' public/simulations/dscaling.html | head
```

**Step 3: Commit:**

```bash
git add src/pages/simulations/index.astro public/simulations/
git commit -m "Simulations page and standalone simulation HTML"
```

---

## Task 13: Drop `keep_files: true` from the deploy workflow

**Goal:** Now that everything is ported, the deploy can be a clean overwrite. The legacy `2016/`, `simulations/`, `public/`, `assets/`, and `atom.xml` paths in the deploy repo are all replaced by what our build generates.

**File:**
- Modify: `.github/workflows/deploy.yml`

Change `keep_files: true` to `keep_files: false`. This makes the next deploy a *clean overwrite*. Anything in our `dist/` is what the live site is — period.

Be careful: if Phase 3 missed something (e.g., a path that used to work like `/assets/cv.pdf` from old Jekyll), it'll 404 after this change. Mitigation: search the live deploy repo for any unique paths before the flip.

**Step 1: Inventory legacy paths still in deploy repo:**

```bash
ls haffi112.github.io/
# Expect: 2016/, about/, assets/, atom.xml, cv/, _astro/ (from Phase 1), favicon, img/, index.html, simulations/, public/
```

Anything in `assets/`, `public/`, `2016/`, `simulations/` that ISN'T being regenerated by our Astro build needs to be either ported now or accepted as dropped.

Known regenerated paths:
- All Astro pages (/, /about/, /publications/, /research/, /group/, /teaching/, /cv/, /blog/, /2016/.../, /simulations/)
- /atom.xml (Task 11)
- /img/hafsteinn.png, /cv.pdf
- /css/, /js/ (from public/)

Known NOT regenerated:
- /assets/ (Jekyll-era SVG icons that are no longer referenced anywhere in the new site)
- /assets/cv.pdf (Jekyll-era CV PDF; our new CV is at /cv.pdf)
- /LICENSE.md (Jekyll-era; ignore)

If any external link/citation references `/assets/cv.pdf`, you'd want a redirect. For now, accept that those few legacy paths go away.

**Step 2: Modify `.github/workflows/deploy.yml`** — change `keep_files: true` to `keep_files: false`.

**Step 3: Commit (but don't push yet — the smoke test in Task 14 happens before deploy):**

```bash
git add .github/workflows/deploy.yml
git commit -m "Deploy workflow: drop keep_files now that Phase 3 ported all legacy paths"
```

---

## Task 14: Local smoke test

**Goal:** Verify every page renders, math renders, citations link, simulations load, RSS validates.

```bash
rm -rf dist .astro
npm run build
npm run preview &
sleep 4

# All routes
for path in / /about/ /publications/ /cv/ /research/ /group/ /teaching/ /blog/ /atom.xml \
  /2016/03/27/bootstrap-percolation/ \
  /2016/04/08/asynchronous-percolation/ \
  /2016/04/25/percolation-with-inhibition/ \
  /2016/04/29/percolation-with-inhibition-part2/ \
  /2016/05/15/lif-neuron/ \
  /simulations/ \
  /simulations/standard-percolation.html \
  /simulations/dscaling.html \
  /simulations/izhikevich_neuron.html \
  /simulations/dice_parser.html \
  /js/bootstrap_percolation_visjs.js \
  /js/vis.min.js \
  /css/vis.min.css; do
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321$path")
  printf "%-60s %s\n" "$path" "$code"
done

# Math rendering check
/usr/bin/curl -s http://localhost:4321/2016/05/15/lif-neuron/ | grep -c 'katex'  # KaTeX HTML markers

# Citations check
/usr/bin/curl -s http://localhost:4321/2016/03/27/bootstrap-percolation/ | grep -c 'ref-hodgkin\|ref-amini'  # at least one bibliography anchor

# Atom feed
/usr/bin/curl -s http://localhost:4321/atom.xml | head -20

pkill -f "astro preview" 2>/dev/null
```

All routes should return 200. If any return 404, fix before deploying.

Tag:

```bash
git tag phase-3-ready
```

---

## Task 15: Merge and deploy

```bash
git checkout master
git merge --no-ff phase-3-blog-migration -m "Merge Phase 3: blog migration, simulations, RSS"
git push origin master
```

Watch Actions:

```bash
gh run list --repo Haffi112/blog --limit 1
gh run watch <id> --repo Haffi112/blog --exit-status
```

Verify live URLs (especially the legacy 2016 paths now serve our Astro version instead of Lanyon):

```bash
for path in /blog/ /2016/03/27/bootstrap-percolation/ /2016/05/15/lif-neuron/ /simulations/ /atom.xml; do
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" "https://haffi112.github.io$path")
  printf "%-50s %s\n" "$path" "$code"
done
```

Tag:

```bash
git tag phase-3-shipped
git push origin phase-3-ready phase-3-shipped
```

---

## What's done after Phase 3

- 5 blog posts live at their original `/YYYY/MM/DD/slug/` URLs, re-themed in the new design
- `/blog/` index, `/atom.xml` RSS feed
- `/simulations/` index + 4 standalone simulations
- KaTeX math rendering, working citations with auto-bibliography per post
- `keep_files: false` — the deploy repo is now a pure mirror of `dist/`

**Author review checklist for Phase 3:**
- Math renders correctly (especially the differential equations in lif-neuron)
- All 5 inline simulations still actually work (the percolation widgets, the LIF widget)
- Citations link to the right reference
- The acknowledgements survive into the new posts
- The four standalone simulations (dscaling, izhikevich, dice parser, standard-percolation) still run

**Out of scope (Phase 4):**
- SEO meta, sitemap, JSON-LD
- Accessibility audit
- Performance budget
- Optional: Actions Node 24 upgrade
- Optional: cleanup commit removing the legacy `haffi112.github.io/` mirror from source
