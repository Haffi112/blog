# Website refresh — design

**Date:** 2026-05-11
**Author:** Hafsteinn Einarsson, with Claude
**Status:** Approved (design); implementation plan to follow

## 1. Context

The site at `haffi112.github.io` is a Jekyll-based personal blog from 2016–2018, built on the Lanyon theme. The About page still says "data scientist at Íslandsbanki" — six years out of date. Since then the author has become Associate Professor of Computer Science at the University of Iceland (2020–) and Research Scientist at deCODE genetics (2021–), co-founded two companies (Prescriby 2019–2023, KatlaCode 2024–), published ~60 papers, and supervises three main-supervised PhD students plus ~10 master's students. The site needs to catch up.

## 2. Goals

- Reflect who the author *is now*: research lead in NLP for low-resource Germanic languages, with strands in computer vision for natural sciences, clinical AI, human genetics, and computational neuroscience (legacy + ongoing).
- Present a complete, link-rich publications page sourced from `references.bib`.
- Make the CV trivially discoverable.
- Refresh the visual language to "calm academic, Notion/Stripe-precise" with a distinctive aubergine/gold/orange palette.
- Keep the existing blog content and interactive simulations alive at their original URLs.
- Support active future writing — drafts, MDX, RSS.

## 3. Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| Site identity | Hybrid: academic homepage + active blog |
| Tech stack | Astro 5.x, TypeScript, Tailwind CSS 4, MDX, content collections |
| Hosting | GitHub Pages, via the existing `haffi112.github.io` deploy repo |
| Domain | Stay on `haffi112.github.io` |
| Analytics | None (Universal Analytics is dead; nothing replaces it) |
| Theme mode | Light + dark, system-preference default, manual toggle |
| Language | English only |
| Old posts | Keep and port; preserve permalinks |
| Old simulations | Port as Astro islands |
| Publications layout | Selected highlights at top; rest by theme |
| Pub summaries | Claude drafts, author reviews |
| Selected papers | Claude proposes ~8, author adjusts |
| News feed | Yes, dated bullets on home |
| Sequencing | Phased build (four phases, each deploys) |
| Bibliographic source of truth | `references.bib` + `pub-overrides.yaml` sidecar |

## 4. Architecture

### 4.1 Stack
- **Astro 5.x** SSG. Static output, zero JS by default, islands for interactivity.
- **TypeScript** in components and scripts; Markdown / MDX for content.
- **Tailwind CSS 4** via `@astrojs/tailwind`, with a thin CSS-variable token layer.
- **@astrojs/mdx** for blog posts that embed simulations.
- **Astro Content Collections** with Zod schemas for `blog`, `news`, `talks`, `projects`, `students`, `teaching`.
- **No React** in the base. React only on the few simulation islands that need it; preferable to keep simulations in vanilla JS or Astro-native where reasonable.

### 4.2 Bibliography pipeline
- `references.bib` stays as the source of truth.
- `scripts/parse-bib.ts` (using `@retorquere/bibtex-parser`) reads the bib, normalizes Icelandic LaTeX escapes (`{\TH}` → Þ, `{\dh}` → ð, `{\'i}` → í, etc.), and emits `src/data/publications.json` at build time.
- A sidecar `pub-overrides.yaml`, keyed by bibtex citation key, holds:
  - `theme`: one of `nlp-is`, `cv-nat`, `clinical-ai`, `genetics`, `comp-neuro`
  - `summary`: 1-2 sentences (3-4 for selected)
  - `selected`: boolean (top of publications page + featured on home)
  - `links`: `doi`, `arxiv`, `pdf`, `code`, `huggingface`, `dataset`
  - `notes`: optional; used to flag e.g. corresponding-author or equal contribution
- The build-time script merges bib data with the YAML overrides; missing required fields fail the build loudly.

### 4.3 Repository layout
```
blog/                                       # source repo
  astro.config.mjs
  tailwind.config.mjs
  package.json
  tsconfig.json
  src/
    components/
      BaseLayout.astro, Nav.astro, Footer.astro,
      Hero.astro, NewsItem.astro, PubCard.astro,
      ThemeTag.astro, PersonCard.astro, Prose.astro,
      Simulation.astro, ThemeToggle.astro
    layouts/
      PageLayout.astro, PostLayout.astro
    content/
      blog/        *.mdx
      news/        *.md
      talks/       *.md
      projects/    *.md
      students/    *.md
      teaching/    *.md
      config.ts    # Zod schemas
    data/
      publications.json        # generated; gitignored
      pub-overrides.yaml       # human-edited
    pages/
      index.astro
      research/index.astro
      publications/index.astro
      teaching/index.astro
      group/index.astro
      blog/index.astro
      blog/[...slug].astro
      simulations/index.astro
      about/index.astro
      cv/index.astro
      atom.xml.ts              # RSS
    styles/
      tokens.css, base.css
  scripts/
    parse-bib.ts
  public/
    cv.pdf
    img/hafsteinn.png (+ avif/webp variants)
    favicon.ico, apple-touch-icon.png, etc.
  references.bib
  deploy.sh                    # updated to run astro build + rsync

haffi112.github.io/            # deploy target (separate git repo)
```

### 4.4 Deploy
Phase 1 ships with an updated `deploy.sh`:
```bash
#!/bin/bash
set -e
npm run build                          # astro build → ./dist
rsync -a --delete dist/ haffi112.github.io/
cd haffi112.github.io
git add -A
git commit -m "Deploy."
git push
```
Phase 4 optionally replaces this with a GitHub Actions workflow that builds on push to source `master` and deploys to the target repo via a deploy key.

### 4.5 Permalink preservation
| Old URL | New URL |
|---|---|
| `/` | `/` (new home), with `/blog/` as the chronological index |
| `/about/` | `/about/` |
| `/simulations/` | `/simulations/` |
| `/2016/03/27/bootstrap-percolation/` | same |
| `/2016/04/08/asynchronous-percolation/` | same |
| `/2016/04/25/percolation-with-inhibition/` | same |
| `/2016/04/29/percolation-with-inhibition-part2/` | same |
| `/2016/05/15/lif-neuron/` | same |
| `/atom.xml` | `/atom.xml` |

## 5. Information architecture

**Top nav:** Research · Publications · Teaching · Group · Blog · About. Wordmark on the left links home.

**Anchored sections inside `/research/`:** `#themes`, `#group` (canonical), `#projects`, `#talks`. `/group/` is the canonical permalink for the group section.

**Footer:** © 2026 Hafsteinn Einarsson · Scholar · ORCID · GitHub · LinkedIn · X (@hafsteinn) · RSS.

## 6. Design system

### 6.1 Typography
- UI / nav / labels: **Inter** (variable, 400/500/600).
- Long-form / prose: **Source Serif 4** (variable, 400/600).
- Code: **JetBrains Mono**.
- Type scale (1.250 ratio): xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36 · display 48.
- Line heights: 1.55 body, 1.40 headings, 1.25 display.
- Prose measure 65ch; publications list 75ch.

### 6.2 Color tokens

**Light**
| Token | Hex |
|---|---|
| `--bg` | `#FAFAF6` |
| `--bg-elev` | `#FFFFFF` |
| `--ink` | `#1A1418` |
| `--ink-muted` | `#5A5560` |
| `--rule` | `#E8E4E2` |
| `--accent-primary` (aubergine) | `#5B3A78` |
| `--accent-primary-soft` | `#F2EBF9` |
| `--accent-warm` (gold) | `#C58A2A` |
| `--accent-warm-soft` | `#F8F1DD` |
| `--accent-energy` (burnt orange) | `#C45A2A` |

**Dark**
| Token | Hex |
|---|---|
| `--bg` | `#131013` |
| `--bg-elev` | `#1A171C` |
| `--ink` | `#EDE9E3` |
| `--ink-muted` | `#8A8389` |
| `--rule` | `#292528` |
| `--accent-primary` | `#B79BDF` |
| `--accent-primary-soft` | `#2A1F37` |
| `--accent-warm` | `#E5C46E` |
| `--accent-warm-soft` | `#2E2716` |
| `--accent-energy` | `#E58A5E` |

**Hierarchy rules**
- Aubergine: primary brand. Links, brand wordmark, primary action, theme tag for `comp-neuro`.
- Gold: secondary. Active/current nav, "Selected" call-out, awards/grants emphasis, theme tags for `nlp-is` and `clinical-ai`.
- Burnt orange: tertiary, used sparingly. "New" badges, hot/active items, theme tag for `cv-nat`.
- `genetics` theme tag uses ink-muted (neutral) so it doesn't compete.

### 6.3 Spacing & layout
- 4px base unit. Space scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Page max width 1120px; prose column 680px.
- Section gaps 96px desktop, 64px mobile.

### 6.4 Motion
- 150ms / 200ms ease-out for hover, focus, in-page interactions.
- 400ms ease-in-out for view transitions if used.
- No parallax, no scroll-jacking.
- `prefers-reduced-motion: reduce` honored.

### 6.5 Theme mode
- CSS variables at `:root` for light, overridden by `[data-theme="dark"]`.
- Initial theme: `prefers-color-scheme` (no FOUC; inline script in `<head>`).
- Manual toggle persists to `localStorage`.

## 7. Page-level designs

### 7.1 `/` Home
- Hero: photo (left or above), name (display weight), two-line role description, three-line research framing, three quick action links (Research → / Publications → / CV ↓).
- News: ~5 latest items (date, prefix dot for newest in burnt-orange, one-line summary, optional link), "See all" link to a future `/news/` if needed.
- Selected publications: ~3 highlighted cards (subset of the publications-page selected list).
- Footer.

### 7.2 `/research/` Research overview
Long anchored page.
- **`#themes`** — five theme cards: NLP for Icelandic & Germanic, Computer vision for natural sciences, Clinical AI / cardiology, Human genetics & computational biology, Computational neuroscience. Each has a 2-sentence framing and links into the publications page filtered by theme.
- **`#group`** — Current PhDs (Steinunn Rut Friðriksdóttir, Annika Simonsen, Joao Rodrigo Da Silva Martins), current MSc students, PhD-committee memberships, then a collapsible alumni list.
- **`#projects`** — Highlighted open-source: IceBERT family on Hugging Face, NQiI dataset, Icelandic WinoGrande, Hotter & Colder, FoQA, GameQA, MazeEval. Each: name, one-line summary, link to repo / Hugging Face.
- **`#talks`** — Reverse-chrono list: title, venue, date, link if available. Includes UNESCO 2023, RÚV interview 2021, UTmessan, SKÝ events, etc.

### 7.3 `/publications/` Publications
- Page header: count, last-updated, links to Scholar and ORCID.
- Theme filter pills.
- **Selected publications** section (~8 cards, 3-4-sentence summaries).
- **All publications by theme** (5 theme sections; within each theme, reverse-chrono).
- Each `PubCard`: theme tag · title · author list with **Hafsteinn Einarsson bold** · venue · year · summary · link row (DOI / arXiv / PDF / code / Hugging Face / dataset, in that priority).

### 7.4 `/about/`
- Lead paragraph: role, employer, group framing.
- Research statement paragraph drawn from the April 2026 track-record CV, lightly edited.
- "Beyond research" paragraph: modernized echo of the canonical-microcircuit / emergence interest, anchored in present curiosity.
- CV: Download (PDF) button + "View inline" link to `/cv/`.
- Contact: email, ORCID, Scholar, GitHub, X, LinkedIn.

### 7.5 `/cv/`
- Embeds the CV PDF in an iframe with a download fallback. Updates whenever `public/cv.pdf` is replaced.

### 7.6 `/teaching/`
Cards per course (Discrete Mathematics for CS, Analysis of Algorithms, The AI Lifecycle, Computers/OS/Digital Literacy, Introduction to Deep Learning, NLP module in Business Intelligence, LLMs in an Icelandic context). Each card: title, level, language of instruction, when offered, 2-sentence description, optional public-syllabus link.

### 7.7 `/blog/` and `/blog/<slug>/`
- Blog index is reverse-chrono with date + title + ~2-line excerpt. Old 2016 posts are mixed in at their original dates.
- Single posts: 680px reading column, KaTeX for math, MDX with islands for embedded simulations. Footnote support. Optional sticky ToC on desktop.

### 7.8 `/simulations/`
Index page listing standalone simulations (bootstrap percolation, asynchronous percolation, percolation with inhibition, LIF neuron, Izhikevich neuron). Thumbnails + links to the post that uses them.

## 8. Content model (Zod schemas)

```ts
// src/content/config.ts (sketch)
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    hero: image().optional(),
    customCss: z.array(z.string()).default([]),
  })
});

const news = defineCollection({
  type: 'data',
  schema: z.object({
    date: z.date(),
    text: z.string(),
    link: z.string().url().optional(),
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
    type: z.enum(['invited', 'keynote', 'outreach', 'workshop']).default('invited'),
  })
});

// projects, students, teaching: similar shape.
```

`publications.json` has its own TypeScript type checked at build, populated from `parse-bib.ts`.

## 9. Phases

### Phase 1 — Foundation (first shipping milestone)
- Astro scaffold, Tailwind, tokens, light/dark, components.
- `parse-bib.ts` + `pub-overrides.yaml` complete (drafts of all summaries; 8 selected).
- Pages: `/`, `/about/`, `/publications/`, `/cv/`.
- Updated `deploy.sh`, deploys to `haffi112.github.io`.

### Phase 2 — Academic depth
- `/research/` with all four anchored sections.
- `/teaching/`.
- Content collections populated: news, talks, projects, students, teaching.
- News feed on home reading from `news`.
- Profile-link footer wired.

### Phase 3 — Blog migration
- `/blog/` + individual post URLs at original 2016 paths.
- 5 posts ported to MDX, KaTeX for math.
- D3 / vis.js simulations ported as Astro islands; light fixes if old jQuery dependencies broke.
- `/simulations/` index.
- `/atom.xml` regenerated.

### Phase 4 — Polish
- SEO meta per page, canonical URLs, OG + Twitter card.
- Sitemap.
- Person JSON-LD on `/` and `/about/`.
- Accessibility audit: focus, skip link, contrast, alt text, keyboard navigation.
- Performance: image AVIF, font subset to Latin + Icelandic ranges, JS-only-where-needed, target Lighthouse 95+ across the board.
- Optional: GitHub Actions deploy replaces local `deploy.sh`.

## 10. Out of scope

- No comments system (Disqus / utterances / Giscus).
- No newsletter signup.
- No analytics.
- No CMS layer; content is edited as markdown in the repo.
- No bilingual (English + Icelandic) version — English-only.
- No major retheming of the ported 2016 simulations (only the wrapping; the simulations themselves stay).

## 11. Risks

- **Icelandic LaTeX escape coverage in `parse-bib.ts`**: must handle Þ, ð, æ, ö, á, í, ó, ú, ý and the various combinations in `{\TH}`, `{\dh}`, `{\ae}`, `{\"o}`, `{\'a}`, etc. Mitigation: targeted unit tests over a sampled set from `references.bib`.
- **Summary drafts being wrong**: for ~50 of the ~60 papers I am middle-author or further down, my summaries are inferred. Mitigation: author review pass; mark entries with `summary_status: draft` until reviewed.
- **Simulation port regressions**: the 2016 simulations depend on jQuery 1.12 + vis.js + D3 (older versions). Mitigation: bundle the simulation islands with their exact original dependencies pinned, rather than upgrading them. They're frozen-in-time.
- **Deploy mechanism quirks**: rsync `--delete` will wipe files unique to the deploy repo. Mitigation: snapshot the deploy repo before Phase 1's first deploy, and ensure CNAME / 404 / atom.xml are reproduced by the build.

## 12. Approval

Approved by author 2026-05-11 (this conversation). Implementation plan (Phase 1) to follow via the `writing-plans` skill.
