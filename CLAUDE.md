# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Source for **haffi112.github.io** — the academic homepage of Hafsteinn Einarsson (Associate Professor, U. of Iceland; Research Scientist, deCODE genetics). Built with **Astro 5**, deployed via GitHub Actions to a separate `Haffi112/haffi112.github.io` repo on every push to `master`. The same site data drives two **Typst**-generated CV PDFs.

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
- **Theme tokens live in CSS, not JS.** `src/styles/global.css` has an `@theme` block + a `[data-theme="dark"]` override. Tailwind 4 reads CSS variables directly; there is no `tailwind.config.*` of substance. To match a color change in the CV, also edit `cv/template.typ`.
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
| Tweak any page prose | `src/pages/<section>/index.astro` |
| Tweak design tokens | `src/styles/global.css` (and mirror in `cv/template.typ` for the CV) |

After editing anything that affects the CV (publications, students, awards, positions, summaries), run `npm run cv` and **commit both PDFs alongside the source change** — they're checked in.

## Things that have bitten people

- **`publications.json` is gitignored.** If `astro dev` shows stale pubs, run `npm run parse-bib`.
- **Typst `--` parsing.** `#start--present` is parsed as one identifier. Use string concatenation (`str(start) + "–" + str(end)`) in template helpers. Already worked around in `cv/template.typ`.
- **Typst variable fonts.** Typst is picky in `set text` mode. Use static (not variable) TTFs in `cv/fonts/` and register with `--font-path`.
- **GitHub Pages stale after deploy.** Wait 1–3 minutes. The Actions tab shows when `peaceiris/actions-gh-pages@v4` finished; then hard-reload.
- **CI uses Node 24 with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.** Local Node 22 is fine; don't add Node-version-specific syntax beyond that.

## Deploy

Push to `master` triggers `.github/workflows/deploy.yml`, which builds and pushes `./dist` to `Haffi112/haffi112.github.io` via SSH deploy key (`PAGES_DEPLOY_KEY` secret). The `deploy.sh` script is a local convenience wrapper — it does **not** deploy itself. `workflow_dispatch` is enabled if you need to redeploy without a code change.
