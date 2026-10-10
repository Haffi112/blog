# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Source for **haffi112.github.io** — the academic homepage of Hafsteinn Einarsson (Associate Professor, U. of Iceland; Principal Scientist, deCODE genetics). Built with **Astro 7** (MDX on the unified/remark pipeline), deployed via GitHub Actions to a separate `Haffi112/haffi112.github.io` repo on every push to `master`. The same site data drives two **Typst**-generated CV PDFs.

For a long-form tour see `README.md` — this file is the operator's cheat sheet.

## Commands

```bash
npm run dev          # dev server on http://localhost:4321
npm run build        # parse-bib → cv → astro build (full prod build)
npm run preview      # serve ./dist
npm run parse-bib    # references.bib + pub-overrides.yaml → src/data/publications.json
npm run cv           # regenerate public/cv.pdf and public/cv-long.pdf
npm test             # vitest (only the bib parser is tested)
npm run test:watch
npx vitest run scripts/__tests__/parse-bib.test.ts    # single test file
npx astro sync       # fix "Cannot find module 'astro:content'"
```

`npm run build` is **not optional in CI** — it runs `parse-bib` and `cv` first because `publications.json` and `cv/data.typ` are gitignored. Locally, run `npm run parse-bib` after editing `references.bib` or `pub-overrides.yaml` if you want the dev server to reflect changes.

Typst is required only for `npm run cv` (`brew install typst`). Committed PDFs are fine for dev/preview without it.

## Architecture in one screen

The site is **content-collection-driven**. Most edits are YAML or Markdown under `src/content/` — no `.astro` files touched.

```
references.bib  ──parse-bib.ts──►  src/data/publications.json  ──┐
pub-overrides.yaml ───────────────────────────────────────────────┤
cv-static.yaml ──┐                                                ├──► Astro pages (publications, home, research)
                 │                                                │
src/content/*/*.yml + *.mdx (Zod-validated by config.ts) ─────────┘
                 │
                 └──► generate-cv.ts ──► cv/data.typ ──► Typst ──► public/cv.pdf, cv-long.pdf
```

Key invariants:

- **`src/content.config.ts` is the source of truth for content shapes** (Content Layer `glob()` loaders; entries have `id`, render with `render(entry)` from `astro:content`). Adding a new field to a news item / talk / student / project / course means editing the Zod schema there first. The build fails loudly on schema violations — that's the safety net.
- **Two bibliographies, kept separate on purpose:**
  - `references.bib` at repo root = publications (drives `/publications/` and CV).
  - `_bibliography/references.bib` = legacy refs cited by old blog posts via `<Cite key="..." />`. Don't merge them.
- **Theme tokens live in CSS, not JS.** `src/styles/global.css` has an `@theme` block + a `[data-theme="dark"]` override. Tailwind 4 reads CSS variables directly; there is no `tailwind.config.*` of substance. To match a color change in the CV, also edit `cv/theme.typ` (the CV's colour tokens; `cv/template.typ` is layout).
- **Two themes only: light and dark.** The accessibility-focused "reader" theme (OpenDyslexic, italics→bold) was removed in the redesign. BaseLayout's no-FOUC script migrates anyone still holding `theme: 'reader'` in localStorage to light via the same legacy path as the retired 35-theme names — don't delete that branch.
- **The design is "quiet paper".** Newsreader carries display, headings and body prose; IBM Plex Mono carries all metadata (eyebrows, dates, nav, tags, theme labels); IBM Plex Sans is the UI sans. Corners are square everywhere — the paper themes set daisyUI's `--radius-*` to `0`, so `rounded-card` resolves to nothing. The single accent is a warm rust; ink and hairlines do the rest of the work.
- **Links are ink + hairline, not coloured.** The base rule gives every `<a>` `color: inherit` with a hairline `text-decoration`, and rust only on hover. Chrome links opt out automatically inside `<header>`, `<footer>` and `<nav>`, or explicitly via `.link-plain`. If you add a link that should not be underlined and it lives outside those elements, reach for `.link-plain` rather than `no-underline`.
- **Blog URLs are date-derived.** A post at `src/content/blog/2026-05-12-foo.mdx` is served at `/2026/05/12/foo/` via `src/pages/[year]/[month]/[day]/[slug]/index.astro`. The date prefix is stripped from the slug.
- **`/blog/` is a redirect**, not a route — it points at `/writing/` due to a stale GitHub Pages cache from the 2016 Jekyll era. New blog index is `/writing/`.

## Common edits (where to look)

| Task | File or directory |
|---|---|
| Add news item (homepage feed) | `src/content/news/YYYY-MM-slug.yml` — the homepage shows the latest five (blog posts included); the full list is at the bottom of `/writing/` (`src/lib/news.ts`) |
| Op-eds and explainers on the Writing page | Not a separate list: the "Elsewhere" section shows `media_appearances` of type `opinion` or `explainer` from `cv-static.yaml` |
| Add blog post | `src/content/blog/YYYY-MM-DD-slug.mdx` (set `draft: true` to exclude) |
| Add publication | Append to `references.bib`, then optionally enrich `src/data/pub-overrides.yaml` (`summary`, `summary_is`, links). The "Cite" button shows the entry's own BibTeX, extracted by `scripts/parse-bib.ts` |
| Translate a blog post | Copy it to `src/content/blog/is/<same filename>.mdx` and translate (see "Bilingual site") |
| Mark publication as "selected" / set theme | `src/data/pub-overrides.yaml` (key is the BibTeX citekey) |
| Add student / course / project / talk | One YAML in the matching `src/content/{students,teaching,projects,talks}/` |
| Change CV-only data (positions, education, awards) | `src/data/cv-static.yaml`, then `npm run cv` |
| Tweak hero text on homepage | Strings in `src/i18n/ui.ts` (`hero.*`, both languages); layout in `src/components/Hero.astro` |
| Tune the hero animation (density, thresholds, inhibition, audio) | `src/components/PercolationField.astro` — model constants are the block near the top; see "Things that have bitten people" before changing them |
| Add a press / media appearance | `media_appearances` in `src/data/cv-static.yaml` — the one list feeds both the CV and `/research/#media` (read at build time by `src/lib/media.ts`). Needs `title_is`, `title_en`, `outlet`, `type`, `url` |
| Video series (episodes, YouTube/TikTok links) | `src/data/series.ts` — used by the homepage feature, About, Research, footer and JSON-LD |
| Tweak any page prose | `src/views/<Name>Page.astro` (the files in `src/pages/` are thin wrappers); short strings in `src/i18n/ui.ts` |
| Tweak design tokens | `src/styles/global.css` (and mirror colours in `cv/theme.typ` for the CV) |
| Pick the social-share image for a post | Add `hero: ../../assets/<image>.png` to the post's frontmatter (otherwise a title card is generated) |
| Add a footnote in a post | Standard GFM syntax: `[^name]` inline + `[^name]: …` block; littlefoot turns it into a hover/click popover |
| Change or add a UI string (nav, headings, buttons, labels) | `src/i18n/ui.ts`, in **both** `en` and `is` (the build fails if one is missing) |
| Icelandic text for a news item / talk / project / course | The entry's optional `*_is` field: `text_is`, `title_is`, `venue_is`, `summary_is`, `description_is` (see `src/content/config.ts`) |
| Icelandic name for a talk location | `places` in `src/i18n/ui.ts` |
| Research theme text, publication theme headings, theme tags | `src/data/themes.ts` (both languages) |
| Add a page in both languages | View in `src/views/`, wrappers in `src/pages/x/` and `src/pages/is/x/`, path in `translatedRoutes` (`src/i18n/utils.ts`) |

After editing anything that affects the CV (publications, students, awards, positions, summaries), run `npm run cv` and **commit both PDFs alongside the source change** — they're checked in.

## Bilingual site (English + Icelandic)

- **Routing.** Astro's built-in i18n (`astro.config.mjs`): `defaultLocale: 'en'`, `prefixDefaultLocale: false`. English keeps its URLs; Icelandic lives under `/is/` with the **same** path segments (`/is/research/`, `/is/publications/` …), so the language switcher is a pure prefix swap. `@astrojs/sitemap` pairs them as `en-GB` / `is-IS` alternates.
- **One view, two wrappers.** Each bilingual page's body is `src/views/<Name>Page.astro`, which takes `lang`. `src/pages/x/index.astro` and `src/pages/is/x/index.astro` are three-line wrappers. Edit the view. A new bilingual page needs both wrappers **and** its path in `translatedRoutes` (`src/i18n/utils.ts`), which drives hreflang, `localizePath()` and the switcher.
- **Strings** live in `src/i18n/ui.ts`. `en` is the reference shape and `is` is typed as `Dict`, so a missing or extra key fails `astro check`/the build. Count-dependent strings are functions (Icelandic plural: 21 takes the singular). First-person prose with inline links (About, the percolation panel copy, the research media intro, simulations intro) is written as a `lang === 'is' ? … : …` branch in the view instead.
- **Helpers** (`src/i18n/utils.ts`): `getLang(url)`, `localizePath(href, lang)` (safe on any href: translated routes, translated posts and `/atom.xml` get the `/is` prefix; PDFs, untranslated posts and external links pass through. Wrap **every** internal link on a bilingual page in it, including post links such as `aiSeries.makingOf`; a bare post URL sends Icelandic readers to the English original. Translated posts are found by filename in `src/content/blog/is/`, which is why `postPaths()` fails the build if a post's frontmatter date disagrees with its filename), `alternates()`, `switchHref()`, `pick(lang, en, is)`, `fallbackLang()`, `formatDate()` (UTC, `en-GB` / `is-IS`). Components take `lang` (default `'en'`); `BaseLayout` derives it from the URL and emits `<html lang>`, the `en`/`is`/`x-default` hreflang trio for pages with a twin, a per-language canonical and `og:locale` + `og:locale:alternate`.
- **Content.** Optional `*_is` fields on news (`text_is`, `link_is`), talks (`title_is`, `venue_is`), projects (`name_is`, `summary_is`), teaching (`title_is`, `description_is`) and students (`nowAt_is`, `title_is` only where the title is a description). Missing ones fall back to English and are marked `lang="en"`. Media appearances lead with `title_is` on `/is/` (the outlet's own headline, no gloss); `ENGLISH_OUTLETS` in `src/lib/media.ts` flags the outlets whose original is English.
- **Blog posts are translated by file.** An Icelandic version of `src/content/blog/<name>.mdx` lives at `src/content/blog/is/<name>.mdx` (same filename, `hero:` path one `../` deeper, imports via `~/`, internal links prefixed `/is/`) and is served at `/is/YYYY/MM/DD/slug/`. `src/lib/posts.ts` pairs the two by filename: `getPosts(lang)`, `getPostsFor(lang)` (Icelandic list falls back to the English original for an untranslated post), `postAlternates()`. Post pages pass explicit `alternates` to `BaseLayout`, so hreflang and the switcher point at the twin; a translation shows "Upprunalega skrifað á ensku" linking to the original. Each language has its own feed (`/atom.xml`, `/is/atom.xml`) and its own social cards (`/og/<slug>.png`, `/og/is/<slug>.png`).
- **What stays English:** publication titles/authors/venues (summaries have `summary_is` in `pub-overrides.yaml`), thesis titles, both CV PDFs and the whole CV pipeline (`scripts/generate-cv.ts` keeps its own English theme labels), RSS, OG cards, JSON-LD. The 404 is one page with the Icelandic message under the English one.
- **Nav.** The switcher (`EN`/`IS`, labelled in its own language, `hreflang` + `lang`) sits beside the theme toggle from `md` and is the last row of the mobile menu below that. At 768px the row keeps a 21px (EN) / 24px (IS) minimum gap with the theme label still shown — re-measure if anything joins it.
- **Browser `Intl` has no Icelandic in some builds.** Headless and trimmed-ICU Chromium return `supportedLocalesOf(['is']) = []` and silently format `7.7` instead of `7,7`. Format at build time (Node has full ICU) or pass the piece in, as `PercolationField` does with `data-decimal` and its `data-msg-*` templates.

## Blog post pipeline

Every `.mdx` post inherits a few things automatically. Worth knowing before touching post-layout code:

- **Per-post OG image.** `src/views/PostPage.astro` computes the social-share URL: if the post has `hero:` in frontmatter, that image is resized to 1200×630 via `getImage({ position: 'attention' })`; otherwise it uses the card from `src/pages/og/[...slug].png.ts`. Cards (and `/og/default.png`, `/og/default-is.png` for every other page) are drawn by `src/og/card.ts`: paper ground, a seeded percolation-graph motif, the title in Newsreader. **All card text is converted to outlines with opentype.js** from the static fonts in `src/og/fonts/` (instances cut from the OFL variable fonts with `fonttools varLib.instancer`). Don't switch back to SVG `<text>` or sharp's Pango `text` input: both resolve fonts through the OS, and on macOS sharp silently ignores a supplied `fontfile` and renders a system sans.
- **Math** (remark-math + rehype-katex): a post with math adds `import 'katex/dist/katex.min.css';` to its own MDX imports, so the 29 KB stylesheet loads only there. A literal dollar amount in prose must be written `\$` or remark-math may pair it with another one.
- **Code blocks** go through **astro-expressive-code** (frames, syntax highlighting, copy button, word wrap on by default). The integration is registered in `astro.config.mjs` *and* its rehype plugin is wired into `mdx({ processor: unified({ rehypePlugins }) })` — both are required, see "Things that have bitten people".
- **Footnotes** use GFM (`[^name]` syntax) at build time, then **littlefoot** at runtime swaps the inline `<sup>` for a small accent-coloured superscript with a popover. Mounted from `PostLayout.astro`; styling lives in `src/styles/global.css` **outside `@layer components`** so it can win against littlefoot's own CSS.
- **`<figure>` / `<figcaption>`.** Scoped styling in `.prose-body` gives captions a hairline rule, smaller italic centred serif type, and a 56ch cap. Use `<Picture {...pictureProps} src={imported} />` inside `<figure>` for AVIF + WebP + PNG fallback at multiple widths; the `pictureProps` spread is conventionally defined as `export const pictureProps = {...}` at the top of the MDX.

## Things that have bitten people

- **`publications.json` is gitignored.** If `astro dev` shows stale pubs, run `npm run parse-bib`.
- **Typst `--` parsing.** `#start--present` is parsed as one identifier. Use string concatenation (`str(start) + "–" + str(end)`) in template helpers. Already worked around in `cv/template.typ`.
- **Typst variable fonts.** Typst is picky in `set text` mode. Use static (not variable) TTFs in `cv/fonts/` and register with `--font-path`.
- **GitHub Pages stale after deploy.** Wait 1–3 minutes. The Actions tab shows when `peaceiris/actions-gh-pages@v4` finished; then hard-reload.
- **CI uses Node 24 with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.** Local Node 22 is fine; don't add Node-version-specific syntax beyond that.
- **expressive-code's MDX wiring.** Registering `expressiveCode(opts)` before `mdx()` in `integrations` is necessary but not sufficient: the rehype plugin doesn't reach `.mdx` files via `extendMarkdownConfig`. The fix in `astro.config.mjs` is belt-and-suspenders — `expressiveCode(opts)` keeps the vite plugin, *and* `rehypeExpressiveCode` is added directly to the MDX processor. No duplication occurs because `.md` files aren't used.
- **Astro 7 renders Markdown with Sätteri by default.** This site keeps MDX on remark/rehype via `mdx({ processor: unified({ remarkPlugins, rehypePlugins }) })` from `@astrojs/markdown-remark` (math, KaTeX and expressive-code are unified plugins). `compressHTML: true` keeps the v6 whitespace behaviour the templates were written for.
- **Default imports from CommonJS packages in client `<script>`s.** Vite 8 resolves littlefoot (no `exports` map) to its CJS build, where `import littlefoot from 'littlefoot'` yields an object ("littlefoot is not a function") and the footnote popovers silently disappear. Use the named import, and check the console on a post with footnotes after any dependency bump.
- **Content-layer order is not file order.** Sort explicitly wherever order matters (the Group page sorts by start/end year, projects by id).
- **daisyUI provides the theme system only.** `include:` in `global.css` limits it to the base layer; with all components it shipped ~100 KB of unused CSS on every page. The site's stylesheet is external and cached (`inlineStylesheets: 'auto'`) — it used to be inlined into every page's HTML.
- **Contrast tokens.** `--color-ink-faint` (60% ink) and `--color-ink-muted` (70%) both clear WCAG AA on paper and on the footer surface in both themes; the design's original 44% grey measured 3.1:1. Re-measure (a canvas round-trip, not by parsing the colour string) before lightening either.
- **`@layer components` loses to unlayered CSS.** Vite-imported third-party stylesheets (littlefoot, anything imported from a `<script>` block) arrive unlayered and always beat layered rules regardless of source order. Overrides for those libraries belong **outside** `@layer components` in `src/styles/global.css`.
- **littlefoot anchor pattern.** The library's default `anchorPattern` expects kramdown-style `#fn:1` hrefs; GFM (what Astro emits) writes `#user-content-fn-…`, so the default silently matches nothing. The init in `PostLayout.astro` overrides to `/(?:user-content-)?fn[:\-_\d]/i`.
- **SVG attribute quoting in the OG generator.** If you template a font-family list into an SVG attribute, inner double quotes terminate the attribute. Use single quotes for `'Helvetica Neue'` etc. (the outer attribute is double-quoted). sharp's error message ("tag mismatch") is misleading; the real cause is always a prematurely closed attribute.
- **Never parse RGB components out of `getComputedStyle().color`.** Chrome returns the colour in its *authored* space, so probing an oklch() token gives back `"oklch(0.91 0.008 88)"`, not `rgb(...)`. Reading those three numbers as R,G,B yields near-black in *both* themes — which looks plausible on paper and is completely invisible on the dark surface. This is exactly how the hero graph went missing in dark mode. Assign the returned string straight to `fillStyle`/`strokeStyle` (canvas accepts CSS Color 4) and put alpha on `ctx.globalAlpha`.
- **The nav's tightest moment is exactly 768px.** That is where `hidden md:flex` swaps the hamburger for the full link row while the theme switcher is still on screen. Mono caps are appreciably wider than sans at the same size, so anything added to that row must be checked at 768 specifically — the CV button is `hidden lg:block` for this reason. Check with a loop over widths (320/360/375/390/414/640/767/768/820/900/1023/1024) comparing `documentElement.scrollWidth` against the viewport, not by eye.
- **Tailwind 4 builds `max-w-*` from `--container-*`, not `--width-*`.** A `--width-page` token generates nothing, so `max-w-page` silently resolved to `none` and every page ran edge to edge on wide screens until it was renamed `--container-page`. `max-w-prose` is Tailwind's built-in 65ch.
- **The hero model sits near a sharp threshold on purpose.** At r = 2 with inhibition on, about half of all cascades percolate — that bimodality (fizzle or sweep) is what makes it worth watching. Small changes to `DENSITY`, `FANOUT`, `INH_FRAC` or `INH_W` swing it to "always fizzles" or "always floods". Re-tune by fast-forwarding: expose `step`/`randomSeed` temporarily, run a few hundred seeded cascades with `step(0.05)` in a loop, and look at the median size and percolation rate — not by watching it. Inhibitory hits subtract from charge (excitatory minus inhibitory ≥ r), which is the PhD model; a blocking/refractory version of inhibition killed almost every front.
- **The brand mark is "quiet paper" now.** `public/favicon.svg` is an ink tile with a paper Newsreader "H" (bold, small optical size — the regular cut's crossbar vanishes at 16px) and a rust node dot; it flips to paper-on-ink under `prefers-color-scheme: dark`. `favicon.ico` (16/32/48) and `apple-touch-icon-precomposed.png` (180) are rasterised from a static variant with `rsvg-convert` + `magick`. Keep all three in sync.
- **Favicon caches everywhere.** `public/favicon.ico` is what Chrome and Safari hit first — after changing the SVG, regenerate it and the touch icon too.
- **Link checking.** `.github/workflows/links.yml` builds the site weekly and runs lychee over every link in `dist/`. Sites that block bots (mbl.is, LinkedIn, X, TikTok, Scholar) are listed in `.lycheeignore`; add to it rather than accepting 403s globally.

## Deploy

Push to `master` triggers `.github/workflows/deploy.yml`, which builds and pushes `./dist` to `Haffi112/haffi112.github.io` via SSH deploy key (`PAGES_DEPLOY_KEY` secret). The `deploy.sh` script is a local convenience wrapper — it does **not** deploy itself. `workflow_dispatch` is enabled if you need to redeploy without a code change.
