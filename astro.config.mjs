// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import expressiveCode from 'astro-expressive-code';
import rehypeExpressiveCode from 'rehype-expressive-code';

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const ecOptions = {
  themes: ['github-dark'],
  defaultProps: {
    wrap: true,
    preserveIndent: true
  },
  styleOverrides: {
    // Square frames and IBM Plex Mono, matching the paper design's chrome.
    borderRadius: '0',
    codeFontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    codeFontSize: '0.875rem',
    codeLineHeight: '1.6'
  }
};

export default defineConfig({
  site: 'https://hafst1.is',
  // Astro 7 changed the default to stricter whitespace removal; keep the
  // HTML-aware compression the templates' inline spacing was written for.
  compressHTML: true,
  trailingSlash: 'always',
  // Bilingual site. English stays at the existing URLs; Icelandic mirrors
  // the same path segments under /is/ (src/pages/is/), so the language
  // switcher is a pure prefix swap. Strings live in src/i18n/ui.ts.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'is'],
    routing: { prefixDefaultLocale: false }
  },
  build: {
    format: 'directory',
    // The site stylesheet is served as one external, cacheable file rather
    // than inlined: inlined, it was ~150 KB of every page's HTML and was
    // re-downloaded on each navigation. "auto" still inlines tiny sheets.
    inlineStylesheets: 'auto'
  },
  // /blog/ is stuck in GitHub Pages cache serving a Lanyon-era file from
  // 2016. The new index lives at /writing/. If Pages ever invalidates the
  // /blog/ cache, this redirect will kick in. Until then, anyone hitting
  // /blog/ gets the stale page, but no in-site link points there.
  // One entry: '/blog' and '/blog/' normalise to the same route, and
  // listing both is a route collision (a hard error in newer Astro).
  redirects: {
    '/blog': '/writing/'
  },
  integrations: [
    // expressive-code must come before mdx() so it pre-processes fenced
    // code blocks inside .mdx files. Wrap is enabled so long lines (e.g.
    // BibTeX URLs, frontmatter descriptions) wrap instead of overflowing.
    expressiveCode(ecOptions),
    // Astro 7 renders Markdown with Sätteri by default; MDX stays on the
    // unified (remark/rehype) pipeline because the posts depend on
    // remark-math, rehype-katex and expressive-code's rehype plugin.
    mdx({
      processor: unified({
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex, [rehypeExpressiveCode, ecOptions]]
      })
    }),
    sitemap({
      // Pairs /x/ with /is/x/ as hreflang alternates in the sitemap.
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-GB', is: 'is-IS' }
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
