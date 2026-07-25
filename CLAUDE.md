# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Source for **haffi112.github.io** — the academic homepage of Hafsteinn Einarsson (Associate Professor, U. of Iceland; Principal Scientist, deCODE genetics). Built with **Astro 5**, deployed via GitHub Actions to a separate `Haffi112/haffi112.github.io` repo on every push to `master`. The same site data drives two **Typst**-generated CV PDFs.

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

- **`src/content/config.ts` is the source of truth for content shapes.** Adding a new field to a news item / talk / student / project / course means editing the Zod schema there first. The build fails loudly on schema violations — that's the safety net.
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
| Add news item (homepage feed) | `src/content/news/YYYY-MM-slug.yml` |
| Add blog post | `src/content/blog/YYYY-MM-DD-slug.mdx` (set `draft: true` to exclude) |
| Add publication | Append to `references.bib`, then optionally enrich `src/data/pub-overrides.yaml` |
| Mark publication as "selected" / set theme | `src/data/pub-overrides.yaml` (key is the BibTeX citekey) |
| Add student / course / project / talk | One YAML in the matching `src/content/{students,teaching,projects,talks}/` |
| Change CV-only data (positions, education, awards) | `src/data/cv-static.yaml`, then `npm run cv` |
| Tweak hero text on homepage | `src/components/Hero.astro` |
| Tune the hero animation (density, thresholds, audio) | `src/components/PercolationField.astro` — model constants are the block near the top |
| Tweak any page prose | `src/pages/<section>/index.astro` |
| Tweak design tokens | `src/styles/global.css` (and mirror colours in `cv/theme.typ` for the CV) |
| Pick the social-share image for a post | Add `hero: ../../assets/<image>.png` to the post's frontmatter (otherwise a title card is generated) |
| Add a footnote in a post | Standard GFM syntax: `[^name]` inline + `[^name]: …` block; littlefoot turns it into a hover/click popover |

After editing anything that affects the CV (publications, students, awards, positions, summaries), run `npm run cv` and **commit both PDFs alongside the source change** — they're checked in.

## Blog post pipeline

Every `.mdx` post inherits a few things automatically. Worth knowing before touching post-layout code:

- **Per-post OG image.** `src/pages/[year]/[month]/[day]/[slug]/index.astro` computes the social-share URL: if the post has `hero:` in frontmatter, that image is resized to 1200×630 via `getImage({ position: 'attention' })`; otherwise the build runs `src/pages/og/[...slug].png.ts`, which composes an SVG title card (brand H tile + word-wrapped post title on the aubergine background) and rasterises it through `sharp`. `BaseLayout`'s `ogImage` prop still defaults to `/og/default.png` for everything outside `/blog/`.
- **Code blocks** go through **astro-expressive-code** (frames, syntax highlighting, copy button, word wrap on by default). The integration is registered in `astro.config.mjs` *and* its rehype plugin is wired directly into `mdx({ rehypePlugins })` — both are required, see "Things that have bitten people".
- **Footnotes** use GFM (`[^name]` syntax) at build time, then **littlefoot** at runtime swaps the inline `<sup>` for a small accent-coloured superscript with a popover. Mounted from `PostLayout.astro`; styling lives in `src/styles/global.css` **outside `@layer components`** so it can win against littlefoot's own CSS.
- **`<figure>` / `<figcaption>`.** Scoped styling in `.prose-body` gives captions a hairline rule, smaller italic centred serif type, and a 56ch cap. Use `<Picture {...pictureProps} src={imported} />` inside `<figure>` for AVIF + WebP + PNG fallback at multiple widths; the `pictureProps` spread is conventionally defined as `export const pictureProps = {...}` at the top of the MDX.

## Things that have bitten people

- **`publications.json` is gitignored.** If `astro dev` shows stale pubs, run `npm run parse-bib`.
- **Typst `--` parsing.** `#start--present` is parsed as one identifier. Use string concatenation (`str(start) + "–" + str(end)`) in template helpers. Already worked around in `cv/template.typ`.
- **Typst variable fonts.** Typst is picky in `set text` mode. Use static (not variable) TTFs in `cv/fonts/` and register with `--font-path`.
- **GitHub Pages stale after deploy.** Wait 1–3 minutes. The Actions tab shows when `peaceiris/actions-gh-pages@v4` finished; then hard-reload.
- **CI uses Node 24 with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.** Local Node 22 is fine; don't add Node-version-specific syntax beyond that.
- **expressive-code's MDX wiring.** Registering `expressiveCode(opts)` before `mdx()` in `integrations` is necessary but not sufficient: on Astro 5 + `@astrojs/mdx` 4 the rehype plugin doesn't reach `.mdx` files via `extendMarkdownConfig`. The fix in `astro.config.mjs` is belt-and-suspenders — `expressiveCode(opts)` keeps the vite plugin emitting the CSS chunk, *and* `rehypeExpressiveCode` is added directly to `mdx({ rehypePlugins })`. No duplication occurs because `.md` files aren't used.
- **`@layer components` loses to unlayered CSS.** Vite-imported third-party stylesheets (littlefoot, anything imported from a `<script>` block) arrive unlayered and always beat layered rules regardless of source order. Overrides for those libraries belong **outside** `@layer components` in `src/styles/global.css`.
- **littlefoot anchor pattern.** The library's default `anchorPattern` expects kramdown-style `#fn:1` hrefs; GFM (what Astro emits) writes `#user-content-fn-…`, so the default silently matches nothing. The init in `PostLayout.astro` overrides to `/(?:user-content-)?fn[:\-_\d]/i`.
- **SVG attribute quoting in the OG generator.** If you template a font-family list into an SVG attribute, inner double quotes terminate the attribute. Use single quotes for `'Helvetica Neue'` etc. (the outer attribute is double-quoted). sharp's error message ("tag mismatch") is misleading; the real cause is always a prematurely closed attribute.
- **Never parse RGB components out of `getComputedStyle().color`.** Chrome returns the colour in its *authored* space, so probing an oklch() token gives back `"oklch(0.91 0.008 88)"`, not `rgb(...)`. Reading those three numbers as R,G,B yields near-black in *both* themes — which looks plausible on paper and is completely invisible on the dark surface. This is exactly how the hero graph went missing in dark mode. Assign the returned string straight to `fillStyle`/`strokeStyle` (canvas accepts CSS Color 4) and put alpha on `ctx.globalAlpha`.
- **The nav's tightest moment is exactly 768px.** That is where `hidden md:flex` swaps the hamburger for the full link row while the theme switcher is still on screen. Mono caps are appreciably wider than sans at the same size, so anything added to that row must be checked at 768 specifically — the CV button is `hidden lg:block` for this reason. Check with a loop over widths (320/360/375/390/414/640/767/768/820/900/1023/1024) comparing `documentElement.scrollWidth` against the viewport, not by eye.
- **The brand mark is still aubergine.** `public/favicon.svg`, `public/favicon.ico`, `public/og/default.png` and the OG card generator (`src/pages/og/[...slug].png.ts`, `BG = '#5B3A78'`) were deliberately left on the pre-redesign brand colour. They are the one place the site is not "quiet paper". Converting them means regenerating all four together.
- **Favicon caches everywhere.** `public/favicon.ico` is what Chrome and Safari hit first — keep it in sync with `favicon.svg`. Regenerate from the SVG with `magick -background none -density 384 favicon.svg \( -resize 16x16 \) \( -resize 32x32 \) … favicon.ico` after design changes.

## Deploy

Push to `master` triggers `.github/workflows/deploy.yml`, which builds and pushes `./dist` to `Haffi112/haffi112.github.io` via SSH deploy key (`PAGES_DEPLOY_KEY` secret). The `deploy.sh` script is a local convenience wrapper — it does **not** deploy itself. `workflow_dispatch` is enabled if you need to redeploy without a code change.
