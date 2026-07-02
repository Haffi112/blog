# Design overhaul — refined editorial + canvas motion

**Date:** 2026-07-02
**Status:** approved direction (user selected all recommended options in the
brainstorming survey: lightweight canvas motion, curated themes, refined
editorial personality, whole-site scope). The depth question timed out; the
recommended "editorial rebuild" depth was chosen as the default.

## Goals

1. A more professional, distinctive visual identity — "refined editorial":
   serif display type, generous whitespace, hairline rules, one restrained
   accent (the existing brand aubergine `#5B3A78`, already used in OG images).
2. Tasteful motion: an animated knowledge-graph particle field in the
   homepage hero, plus scroll-reveals and cross-document view transitions.
   No three.js — a hand-rolled Canvas2D field keeps the JS budget ~5 KB.
3. No performance regression. The site stays static, framework-free, and
   fast; the theme cut actually shrinks the CSS payload substantially.
4. Fully responsive; reduced-motion and no-JS users get a complete page.

## Decisions

### Theme system: 35 themes → 3

- Keep `light` (redesigned editorial paper), `dark` (redesigned editorial
  dark), `reader` (unchanged accessibility theme: OpenDyslexic etc.).
- `@plugin "daisyui" { themes: … }` lists only these three; `light` and
  `dark` become custom `daisyui/theme` blocks overriding the built-ins.
- `ThemeToggle.astro` becomes a 3-option switcher; `BaseLayout`'s no-FOUC
  script migrates any stored dropped-theme name to light/dark by the old
  theme's color-scheme.

### Design tokens

- **Palette (light):** warm paper base, near-black warm ink, aubergine
  primary (`oklch(0.40 0.10 305)` ≈ #5B3A78), bronze secondary, hairline
  rules at low contrast.
- **Palette (dark):** aubergine-tinted near-black base, warm off-white ink,
  lifted mauve primary, amber secondary.
- **Type:** Source Serif 4 for display headings (already shipped — no new
  font cost); Inter stays for UI/body; prose stays serif. `--text-display`
  becomes fluid: `clamp(2.5rem, 1.6rem + 3.5vw, 4rem)`.
- **Texture:** hairline rules, small-caps mono eyebrows, numbered section
  headings ("01 — News").

### Motion

- **`GraphField.astro`** — Canvas2D drifting node/edge field in the hero
  background. ~70 nodes (scaled by area), edges fade in under a distance
  threshold, gentle cursor attraction. Theme-aware colors read from CSS
  custom properties (re-read on `data-theme` change via MutationObserver).
  DPR-aware (capped at 2), paused when off-screen (IntersectionObserver)
  or tab-hidden, static single frame under `prefers-reduced-motion`,
  content unaffected with JS disabled. Inline script, no dependencies.
- **Scroll reveals:** `data-reveal` + one small IntersectionObserver in
  BaseLayout; CSS-gated behind an `html.js` class so no-JS renders fully;
  disabled under reduced motion.
- **View transitions:** CSS-only `@view-transition { navigation: auto }`
  crossfade; progressive enhancement, zero JS.
- **Micro-interactions:** link underline transitions, card hover lifts —
  CSS only.

### Structure

- **Hero:** full-bleed section, canvas behind, serif display name, eyebrow
  line, lede, portrait on the right (md+), arrow links. Bottom edge fades
  into the page background.
- **New components:** `GraphField.astro`, `PageHeader.astro` (eyebrow +
  serif title + lede for section pages), `SectionHeading.astro` (numbered
  homepage/section headings).
- **PubCard:** ledger style — hairline-ruled rows; `selected` variant gets
  an aubergine left rule instead of a boxed card.
- **Footer:** colophon with three columns (identity, explore, elsewhere).
- **Nav:** same behavior, refined styling (active underline, tighter
  wordmark).
- **Section pages** (research, publications, teaching, group, writing,
  about, simulations, cv): adopt `PageHeader`; content restyled via the
  shared components, not restructured.
- **Blog posts:** light touch — inherit tokens; PostLayout unchanged
  structurally.

## Non-goals

- No CV PDF changes (accent color unchanged, so `cv/template.typ` needs no
  mirror edit).
- No content-schema changes; no new content.
- No JS framework, no three.js.

## Error handling / degradation

- No JS: hero renders without canvas; reveals show content (gated on
  `html.js`); theme falls back to `prefers-color-scheme` default.
- Reduced motion: static graph frame, no reveals, no view transitions
  (media-query-gated).
- Old stored theme names: migrated in the no-FOUC script, no flash.

## Testing / verification

- `npm run parse-bib && npx astro build` (typst-independent path) must pass.
- Existing vitest suite must pass (bib parser — untouched, sanity check).
- Manual verification in a headless browser: screenshots of home,
  publications, research at 375px and 1280px in light and dark; console
  clean; canvas pauses off-screen.
- Payload check: compare dist CSS/JS sizes before/after.

## Implementation order

1. Tokens + theme cut (`global.css`, `ThemeToggle`, `BaseLayout` script).
2. `GraphField` + new `Hero`.
3. `PageHeader` / `SectionHeading`; homepage rebuild.
4. `PubCard`, `NewsItem`, `Footer`, `Nav` restyles.
5. Section pages adopt `PageHeader`.
6. Reveals + view transitions.
7. Build, screenshots, payload comparison.
