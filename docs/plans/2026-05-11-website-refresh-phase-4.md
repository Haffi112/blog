# Website Refresh — Phase 4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

**Goal:** Final polish on top of Phases 1-3. SEO meta + sitemap + JSON-LD so the site is properly discoverable; accessibility pass; performance optimization (image variants, font subset, Lighthouse 95+ on all four metrics); operational cleanup (Node 24 in Actions, retire the legacy `haffi112.github.io/` subdirectory).

**Architecture:** All changes live in the existing Astro app. Add three integrations (`@astrojs/sitemap`, an OG-image helper, optionally `astro-icon` if convenient). Augment `BaseLayout` with full meta tags. Add JSON-LD scripts to `/` and `/about/`. Image work uses Astro's built-in `astro:assets` `<Image>` component (Sharp under the hood) for responsive sources.

**Reference design:** `docs/plans/2026-05-11-website-refresh-design.md` Section 9 (Phase 4).

**Scope boundary:** This plan is intentionally tight. We're not redesigning, not adding new pages, not changing content. Pure polish.

---

## Pre-flight

- [ ] On `master`, working tree clean
- [ ] Phase 3 live (verify https://haffi112.github.io/blog/ returns 200)
- [ ] Create branch: `git checkout -b phase-4-polish`

---

## Task 1: SEO meta in BaseLayout — canonical, OpenGraph, Twitter card

**Goal:** Every page emits a complete set of head meta tags. The page-specific values come from `BaseLayout` props passed by each page; sensible defaults fill in the rest.

**Files:**
- Modify: `src/components/BaseLayout.astro`

**Step 1: Extend the `Props` interface and frontmatter logic:**

```astro
---
import '~/styles/global.css';
import Nav from './Nav.astro';
import Footer from './Footer.astro';
import ThemeToggle from './ThemeToggle.astro';

interface Props {
  title: string;
  description?: string;
  /** Optional explicit canonical path (defaults to current URL). */
  canonical?: string;
  /** Path under /og/ (e.g. "default.png") or absolute URL. */
  ogImage?: string;
  /** "website" for landing/index pages, "article" for blog posts. */
  ogType?: 'website' | 'article';
  /** Article-only fields (used when ogType === 'article'). */
  publishedTime?: Date;
}

const {
  title,
  description = 'Hafsteinn Einarsson — Associate Professor at the University of Iceland and Research Scientist at deCODE genetics.',
  canonical,
  ogImage = '/og/default.png',
  ogType = 'website',
  publishedTime
} = Astro.props;

const site = Astro.site ?? new URL('https://haffi112.github.io/');
const canonicalURL = new URL(canonical ?? Astro.url.pathname, site).toString();
const ogImageURL = ogImage.startsWith('http')
  ? ogImage
  : new URL(ogImage, site).toString();
const fullTitle = `${title} · Hafsteinn Einarsson`;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />

    <!-- OpenGraph -->
    <meta property="og:type" content={ogType} />
    <meta property="og:site_name" content="Hafsteinn Einarsson" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:image" content={ogImageURL} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    {ogType === 'article' && publishedTime && (
      <meta property="article:published_time" content={publishedTime.toISOString()} />
    )}
    {ogType === 'article' && (
      <meta property="article:author" content="Hafsteinn Einarsson" />
    )}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@hafsteinn" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageURL} />

    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-precomposed.png" />
    <link rel="preconnect" href="https://rsms.me" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/atom.xml" />
    <script is:inline>
      (() => {
        const saved = localStorage.getItem('theme');
        const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved ?? (sysDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
      })();
    </script>
    <slot name="head" />
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

Key additions:
- `Astro.site` from the config → absolute canonical URL
- `ogImage` defaults to `/og/default.png` (Task 2 creates this asset)
- Article-specific tags only emit when `ogType === 'article'`
- `<slot name="head" />` lets pages inject extra head content (used in Task 4 for JSON-LD)

**Step 2: Update every page that passes a description to pass clean, page-appropriate ones.** A quick pass:

- `/` Home — `"Hafsteinn Einarsson — Associate Professor at the University of Iceland and Research Scientist at deCODE genetics."` (matches default; no change needed but make explicit)
- `/about/` — `"About Hafsteinn Einarsson — research, group, and contact."`
- `/publications/` — `"Publications by Hafsteinn Einarsson — themed list with summaries and links."`
- `/cv/` — `"Curriculum Vitae — Hafsteinn Einarsson."`
- `/research/` — already has it
- `/group/` — already has it
- `/teaching/` — already has it
- `/blog/` — `"Notes on computational neuroscience, NLP, and applied ML."`
- `/2016/.../<slug>/` — use the post's `excerpt` from frontmatter; pass `ogType="article"` and `publishedTime={post.data.date}`

Modify `src/pages/[year]/[month]/[day]/[slug]/index.astro` to pass these through. Same with `src/layouts/PostLayout.astro` — update its Props to accept and forward `description`, `ogType`, `publishedTime` to BaseLayout. Pass the post's excerpt as the description; fall back to a generic if no excerpt.

**Step 3: Commit:**

```bash
git add src/components/BaseLayout.astro src/layouts/PostLayout.astro src/pages
git commit -m "SEO: canonical URL, OpenGraph, Twitter card meta in BaseLayout"
```

---

## Task 2: Default OG image

**Goal:** A single static `1200×630` PNG at `public/og/default.png` used by every page (until per-page OG images are generated in a future iteration).

**Files:**
- Create: `public/og/default.png`

**Step 1: Generate the image.** Two approaches:

**Option A — Use existing tools:**
- ImageMagick: `convert -size 1200x630 xc:'#FAFAF6' -font 'Inter' -pointsize 80 -fill '#1A1418' -gravity center -annotate +0+0 'Hafsteinn Einarsson' public/og/default.png`
- Or open the headshot + render with a quick Python script.

**Option B — Use the existing headshot + a simple Astro endpoint** (more complex; skip for Phase 4 — static is fine).

**Recommended:** Generate a simple branded image programmatically. Suggested layout:

```
+----------------------------------------+
|                                        |
|  HAFSTEINN EINARSSON                   |
|                                        |
|  Associate Professor · University of   |
|  Iceland                               |
|  Research Scientist · deCODE genetics  |
|                                        |
|                       [photo]          |
|                                        |
|       haffi112.github.io               |
+----------------------------------------+
```

Use the headshot at `public/img/hafsteinn.png`. Compose with ImageMagick:

```bash
mkdir -p public/og
# Step 1: Make the background canvas
convert -size 1200x630 \
  -background '#FAFAF6' \
  -font Inter \
  -fill '#1A1418' \
  -pointsize 60 \
  -gravity NorthWest \
  -annotate +80+120 'Hafsteinn Einarsson' \
  -pointsize 28 \
  -fill '#5A5560' \
  -annotate +80+220 'Associate Professor · University of Iceland\nResearch Scientist · deCODE genetics' \
  -pointsize 24 \
  -fill '#5B3A78' \
  -annotate +80+550 'haffi112.github.io' \
  /tmp/og-base.png

# Step 2: Composite the headshot (resized to 360x450, on the right)
convert public/img/hafsteinn.png -resize 360x450^ -gravity center -extent 360x450 /tmp/og-photo.png
composite -gravity East -geometry +80+0 /tmp/og-photo.png /tmp/og-base.png public/og/default.png
```

If ImageMagick's Inter font isn't installed, fall back to `Helvetica` or `Sans-Serif`. The result doesn't need to be pixel-perfect — just professional and recognizable.

Alternative: Just use the headshot at 1200×630 with `convert public/img/hafsteinn.png -resize 1200x630^ -gravity center -extent 1200x630 -background '#FAFAF6' public/og/default.png` and skip the text. Boring but acceptable.

**Step 2: Verify:**

```bash
file public/og/default.png
# Expect: PNG image data, 1200 x 630, 8-bit/color RGB, non-interlaced
```

**Step 3: Commit:**

```bash
git add public/og/default.png
git commit -m "Add default OpenGraph image"
```

---

## Task 3: Sitemap

**Goal:** Astro-generated `/sitemap-index.xml` (and sub-sitemaps) so search engines can crawl the full site.

**Files:**
- Modify: `astro.config.mjs`, `package.json`

**Step 1: Install:**

```bash
npm install @astrojs/sitemap
```

**Step 2: Wire up in `astro.config.mjs`:**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
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
    }),
    sitemap()
  ],
  vite: { plugins: [tailwindcss()] }
});
```

**Step 3: Add a `robots.txt`:**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://haffi112.github.io/sitemap-index.xml
```

**Step 4: Verify:**

```bash
npm run build
ls dist/sitemap*.xml
# Expect: sitemap-index.xml + sitemap-0.xml
/usr/bin/curl -s "file://$PWD/dist/sitemap-0.xml" | head -20  # or open it
```

Spot-check that the sitemap includes blog post URLs.

**Step 5: Commit:**

```bash
git add astro.config.mjs package.json package-lock.json public/robots.txt
git commit -m "Sitemap (@astrojs/sitemap) + robots.txt"
```

---

## Task 4: JSON-LD Person schema

**Goal:** Inject schema.org Person JSON-LD on `/` and `/about/` so Google can build a knowledge-graph card with role, employer, ORCID, etc.

**Files:**
- Create: `src/components/JsonLdPerson.astro`
- Modify: `src/pages/index.astro` and `src/pages/about/index.astro` to slot it into `<head>`

**Step 1: Create `src/components/JsonLdPerson.astro`:**

```astro
---
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Hafsteinn Einarsson',
  jobTitle: 'Associate Professor of Computer Science',
  affiliation: [
    {
      '@type': 'Organization',
      name: 'University of Iceland',
      url: 'https://www.hi.is/'
    },
    {
      '@type': 'Organization',
      name: 'deCODE genetics',
      url: 'https://www.decode.com/'
    }
  ],
  url: 'https://haffi112.github.io/',
  image: 'https://haffi112.github.io/img/hafsteinn.png',
  sameAs: [
    'https://orcid.org/0000-0001-5072-3678',
    'https://github.com/Haffi112',
    'https://scholar.google.com/citations?user=BVPxKzgAAAAJ',
    'https://www.linkedin.com/in/hafsteinn-einarsson-619a3711',
    'https://twitter.com/hafsteinn'
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'ETH Zurich'
  },
  knowsAbout: [
    'Natural Language Processing',
    'Computational Neuroscience',
    'Low-resource language modelling',
    'Icelandic language',
    'Machine learning for natural sciences'
  ]
};
---
<script type="application/ld+json" set:html={JSON.stringify(personJsonLd)}></script>
```

**Step 2: Use in `src/pages/index.astro`:**

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import JsonLdPerson from '~/components/JsonLdPerson.astro';
// … existing imports …
---
<BaseLayout title="Home" description="…">
  <JsonLdPerson slot="head" />
  <!-- existing page body -->
</BaseLayout>
```

Same on `src/pages/about/index.astro`.

**Step 3: Verify** with `npm run build` and `grep '@type.*Person' dist/index.html` — expect 1 match.

**Step 4: Commit:**

```bash
git add src/components/JsonLdPerson.astro src/pages/index.astro src/pages/about/index.astro
git commit -m "JSON-LD Person schema on / and /about/"
```

---

## Task 5: Image optimization — AVIF/WebP/responsive

**Goal:** Convert `public/img/hafsteinn.png` (259 KB raw PNG) to multi-format, responsive variants so the homepage doesn't ship a quarter-megabyte raster.

**Files:**
- Modify: `src/components/Hero.astro` to use Astro's `<Image>`
- Move: `public/img/hafsteinn.png` → `src/assets/hafsteinn.png` (so Astro can process it)

**Step 1: Move the source image:**

```bash
mkdir -p src/assets
mv public/img/hafsteinn.png src/assets/hafsteinn.png
```

(The hero is the only place using this image; if anything else references `/img/hafsteinn.png`, find it and update.)

**Step 2: Rewrite `src/components/Hero.astro` to use `astro:assets`:**

```astro
---
import { Image } from 'astro:assets';
import hafsteinn from '~/assets/hafsteinn.png';

interface Props {
  // We no longer take a path - the import is the source of truth.
}
---
<section class="max-w-page mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
  <div class="grid md:grid-cols-[180px_1fr] gap-8 md:gap-12 items-start">
    <Image
      src={hafsteinn}
      alt="Hafsteinn Einarsson"
      width={360}
      height={450}
      densities={[1, 2]}
      formats={['avif', 'webp', 'png']}
      class="w-36 md:w-44 rounded-xl border border-rule"
      loading="eager"
      fetchpriority="high"
    />
    <div>
      <!-- rest of the hero exactly as before -->
    </div>
  </div>
</section>
```

Then update `src/pages/index.astro` to call `<Hero />` without the `photoSrc` prop.

**Step 3: Build + measure:**

```bash
rm -rf dist
npm run build
# Confirm dist/_astro/ has the generated AVIF + WebP variants
ls dist/_astro/*hafsteinn* | head
# Inspect file sizes
du -h dist/_astro/*hafsteinn*
```

Expect ~20-40 KB AVIF, ~50-80 KB WebP, ~150 KB PNG. The browser picks AVIF when supported.

**Step 4: Commit:**

```bash
git add src/assets/hafsteinn.png src/components/Hero.astro src/pages/index.astro
git rm public/img/hafsteinn.png  # if not already removed by the mv
git commit -m "Image optimization: AVIF + WebP + PNG hafsteinn variants via astro:assets"
```

---

## Task 6: Font subsetting and self-hosting

**Goal:** Stop loading Inter / Source Serif 4 / JetBrains Mono from Google Fonts and rsms.me CDNs. Self-host subset versions covering Latin + Icelandic ranges. Improves both performance (no extra DNS lookups, no FOUT) and privacy.

**Files:**
- Create: `public/fonts/*.woff2` (downloaded + subset)
- Modify: `src/styles/global.css` (use local `@font-face`)
- Modify: `src/components/BaseLayout.astro` (remove the Google Fonts and rsms.me `<link>` tags)

**Step 1: Pick fonts and subsets.**

Latin (basic ASCII + Western European accents) + Icelandic supplement covers Þ, ð, æ, í, etc. Inter has a built-in "latin" subset that includes these. Source Serif 4 ships separate Latin / Latin-Ext subsets — use latin-ext to get Icelandic glyphs.

**Step 2: Download font files** (use the official `inter`, `source-serif-4`, `jetbrains-mono` npm packages, or the `fontsource` family — the easiest path):

```bash
npm install @fontsource-variable/inter @fontsource-variable/source-serif-4 @fontsource-variable/jetbrains-mono
```

Then import in `src/styles/global.css`:

```css
@import "katex/dist/katex.min.css";
@import "@fontsource-variable/inter/wght.css";
@import "@fontsource-variable/source-serif-4/wght.css";
@import "@fontsource-variable/jetbrains-mono/wght.css";
@import "tailwindcss";

/* @custom-variant, @theme, … */
```

(Note: fontsource ships subsets; the default `wght.css` import covers Latin + Latin-Ext + Cyrillic by default. That's fine for our content.)

**Step 3: Remove CDN font `<link>` tags in `BaseLayout.astro`:**

Delete these four lines from the `<head>`:

```html
<link rel="preconnect" href="https://rsms.me" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500&display=swap" />
```

**Step 4: Verify:**

```bash
rm -rf dist && npm run build
# Confirm font files are bundled
ls dist/_astro/ | grep -E '\.(woff2|woff)$' | head
# And NO references to googleapis.com or rsms.me in the built HTML
grep -r 'googleapis\|rsms' dist/ | head
# Expect: NO matches
```

**Step 5: Commit:**

```bash
git add package.json package-lock.json src/styles/global.css src/components/BaseLayout.astro
git commit -m "Self-host fonts via fontsource; drop Google Fonts and rsms.me CDNs"
```

---

## Task 7: Accessibility pass

**Goal:** Fix a set of likely-to-fail accessibility issues. We run `pa11y` or `@axe-core/cli` against a clean build, fix what comes up, then re-run.

**Files:**
- Modify various components/pages as the audit dictates

**Step 1: Run accessibility audit on local preview:**

```bash
npm run build
npm run preview &
sleep 4
# Try axe first; fall back to pa11y if needed
npx --yes @axe-core/cli http://localhost:4321/ --exit || true
npx --yes @axe-core/cli http://localhost:4321/publications/ --exit || true
npx --yes @axe-core/cli http://localhost:4321/2016/05/15/lif-neuron/ --exit || true
pkill -f "astro preview" || true
```

**Step 2: Fix issues that come up.** Likely-to-find issues based on what's in the code:

- **Heading order**: ensure no h3 follows an h1 directly without an intervening h2 (the home page has `h1` → `h2 News` → `h2 Selected publications` → `h3 inside PubCard` — that's fine).
- **Color contrast on accent-warm (#C58A2A on #F8F1DD)**: this combination is borderline for WCAG AA. Audit and either darken the gold on light backgrounds or reserve gold-on-soft for non-text decorative uses.
- **`<button>` without accessible name on the theme toggle**: should already have `aria-label="Toggle color scheme"` — verify it remains.
- **Missing `<main>` landmark on standalone simulation pages** in `public/simulations/`: these are inherited Lanyon HTML. They're standalone, not wrapped in BaseLayout. Acceptable for now — they're archival artifacts.
- **Skip link contrast when focused**: verify the `focus:bg-bg-elev focus:border-accent-primary` looks legible.
- **`alt=""` on decorative images**: the headshot has descriptive alt, which is correct. Verify no decorative SVG is missing `aria-hidden="true"`.
- **Form fields missing labels in simulation widgets**: the percolation forms have `<label for="...">` — already correct.
- **`<a>` without `href`**: shouldn't exist; verify.

For each fix, commit incrementally with a focused message.

**Step 3: Final audit pass:**

```bash
npm run build
npm run preview &
sleep 4
npx @axe-core/cli http://localhost:4321/ --exit
npx @axe-core/cli http://localhost:4321/about/ --exit
npx @axe-core/cli http://localhost:4321/publications/ --exit
npx @axe-core/cli http://localhost:4321/research/ --exit
npx @axe-core/cli http://localhost:4321/2016/05/15/lif-neuron/ --exit
pkill -f "astro preview"
```

Expect 0 violations.

**Step 4: Commit:**

```bash
git add -A
git commit -m "Accessibility fixes from axe-core audit"
```

(Or commit per-fix if multiple distinct changes.)

---

## Task 8: Performance / Lighthouse

**Goal:** Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO across the four most-trafficked pages (home, about, publications, blog index).

**Step 1: Run Lighthouse:**

```bash
npm run build
npm run preview &
sleep 4
# Use the headless Chrome Lighthouse CLI
npx --yes lighthouse http://localhost:4321/ --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-home.json
# Repeat for /about/, /publications/, /blog/
node -e "const r = require('/tmp/lh-home.json'); for (const [k,v] of Object.entries(r.categories)) console.log(k, v.score)"
pkill -f "astro preview"
```

**Step 2: Fix issues.** Common things to check:

- **Render-blocking resources**: KaTeX CSS is loaded on every page even though only blog posts use math. Lazy-load KaTeX CSS only on pages that import math content. (Astro doesn't make this trivial — could split into a separate stylesheet that posts import.)
- **Font-display**: ensure `font-display: swap` or `optional` is set. The fontsource imports default to `swap` which is fine.
- **Unused JS**: Astro should ship 0 JS by default; verify with the Lighthouse "Reduce unused JavaScript" report.
- **Image LCP**: hero photo is `loading="eager" fetchpriority="high"` — already set.
- **Cumulative Layout Shift**: ensure `width` and `height` on every `<img>` (Astro's `<Image>` does this automatically).
- **Server response time**: not relevant on GitHub Pages — static.

**Step 3: Iterate until 95+:**

```bash
# After fixes
npm run build && npm run preview &
sleep 4
npx lighthouse http://localhost:4321/ --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-home.json
node -e "const r = require('/tmp/lh-home.json'); for (const [k,v] of Object.entries(r.categories)) console.log(k, v.score)"
pkill -f "astro preview"
```

**Step 4: Commit:**

```bash
git add -A
git commit -m "Performance: Lighthouse 95+ across home, about, publications, blog"
```

---

## Task 9: Operational cleanup

**Goal:** Bump GitHub Actions to Node 24 (the deprecation warning that fires on every deploy) and retire the legacy `haffi112.github.io/` subdirectory in the source repo.

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Delete: `haffi112.github.io/` (the Jekyll-era mirror, no longer in use)

**Step 1: Bump Node in `deploy.yml`:**

The deprecation warning is about the *runner* using Node.js 20 for the action implementations (not our `node-version: 22` for the build). To opt into Node 24 early, add this env var to the workflow:

```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'
    steps:
      # ...
```

Also bump `node-version: 22` → `node-version: 24`.

**Step 2: Retire the legacy `haffi112.github.io/` directory:**

This subdirectory was the Jekyll build output, committed to the source repo from 2014-2018. It's been stale since Phase 1. The live site is now driven entirely by the Actions workflow pushing to `Haffi112/haffi112.github.io` (separate repo).

```bash
git rm -r haffi112.github.io/
git commit -m "Remove legacy haffi112.github.io/ subdirectory (Jekyll-era mirror, no longer used)"
```

Note: this is destructive of git history within the source repo, but only of files that are NOT referenced by anything else in the current state. The deploy repo on GitHub is unaffected.

**Step 3: Commit Node bump separately:**

```bash
git add .github/workflows/deploy.yml
git commit -m "Bump Actions to Node 24 (silences Node 20 deprecation warning)"
```

---

## Task 10: Content polish

**Goal:** Small content additions that improve scannability without changing the architecture.

**Files:**
- Modify: `src/pages/publications/index.astro` — add an author-convention note at the top
- Modify: `src/pages/blog/index.astro` — slight polish

**Step 1: Author-convention note on `/publications/`:**

Right under the `<p>` with the count, add:

```astro
<details class="mt-4 text-sm text-ink-muted max-w-prose">
  <summary class="cursor-pointer">Authorship convention</summary>
  <p class="mt-2">
    In NLP and ML venues, last author typically denotes the senior/PI position;
    first author is the lead executor (often a student I supervise). In
    cardiology, food science, and human genetics, the author position has
    different meanings — typically lead author is the primary investigator
    and middle authors contribute data, methods, or analysis.
  </p>
</details>
```

(A `<details>` is appropriate here — it's a tooltip-style note for readers unfamiliar with NLP authorship conventions; not central content.)

**Step 2: Commit:**

```bash
git add src/pages/publications/index.astro
git commit -m "Add authorship convention note on /publications/"
```

---

## Task 11: Local smoke test

**Goal:** End-to-end verification before the final deploy.

```bash
rm -rf dist .astro
npm run build
npm run preview &
sleep 4

echo "=== Page HTTP checks ==="
for path in / /about/ /publications/ /cv/ /research/ /group/ /teaching/ /blog/ /atom.xml \
  /sitemap-index.xml /sitemap-0.xml /robots.txt /og/default.png /404 \
  /2016/03/27/bootstrap-percolation/ /2016/05/15/lif-neuron/; do
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321$path")
  printf "%-50s %s\n" "$path" "$code"
done

echo ""
echo "=== Meta tag checks ==="
/usr/bin/curl -s http://localhost:4321/ > /tmp/home.html
echo "OpenGraph tags: $(grep -c 'property="og:' /tmp/home.html)"
echo "Twitter tags: $(grep -c 'name="twitter:' /tmp/home.html)"
echo "Canonical: $(grep -c 'rel="canonical"' /tmp/home.html)"
echo "JSON-LD: $(grep -c 'application/ld+json' /tmp/home.html)"
echo "Sitemap link: $(grep -c '/sitemap-index.xml' /tmp/home.html || true)"

echo ""
echo "=== Performance markers ==="
echo "AVIF variants in dist: $(ls dist/_astro/*hafsteinn*.avif 2>/dev/null | wc -l)"
echo "WebP variants: $(ls dist/_astro/*hafsteinn*.webp 2>/dev/null | wc -l)"
echo "No Google Fonts links: $(grep -r 'googleapis' dist/ | wc -l)"
echo "No rsms.me links: $(grep -r 'rsms' dist/ | wc -l)"

pkill -f "astro preview" 2>/dev/null
```

Expect all 200s, multiple OG and Twitter tags, canonical present, JSON-LD on home, multiple image variants, zero Google Fonts references.

Tag:

```bash
git tag phase-4-ready
```

---

## Task 12: Merge and deploy

```bash
git checkout master
git merge --no-ff phase-4-polish -m "Merge Phase 4: SEO, sitemap, JSON-LD, accessibility, performance"
git push origin master
```

Watch the run:

```bash
gh run list --repo Haffi112/blog --limit 1
gh run watch <id> --repo Haffi112/blog --exit-status
```

Verify live:

```bash
sleep 15
/usr/bin/curl -s https://haffi112.github.io/sitemap-index.xml | head
/usr/bin/curl -s https://haffi112.github.io/og/default.png -o /tmp/og.png && file /tmp/og.png
/usr/bin/curl -s https://haffi112.github.io/ | grep -c 'application/ld+json'  # 1
```

Tag:

```bash
git tag phase-4-shipped
git push origin phase-4-ready phase-4-shipped
```

---

## What's done after Phase 4

- Full SEO: per-page title/description, canonical URLs, OpenGraph, Twitter card on every page
- `/sitemap-index.xml` for crawlers
- `Person` JSON-LD on `/` and `/about/` for Google knowledge graph
- Headshot served as AVIF/WebP/PNG with `srcset` densities
- Fonts self-hosted via fontsource (no Google Fonts, no rsms.me)
- Accessibility: axe-core clean across core pages
- Lighthouse: 95+ on Performance, Accessibility, Best Practices, SEO across core pages
- Actions: Node 24
- Source repo: stale `haffi112.github.io/` mirror retired
- Publications page: authorship-convention note

**This concludes the website refresh.** Subsequent work is content (new blog posts, new students added to the group, new publications appended to references.bib) rather than infrastructure.

**Future ideas (not Phase 4):**
- Per-page OG images generated at build via satori
- Search across publications + blog (Pagefind, Algolia DocSearch)
- A talks RSS feed for invited-talks tracking
- Dark mode tuning based on user feedback
- Comments on blog posts (probably never — adds maintenance and surveillance)
