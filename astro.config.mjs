// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import expressiveCode from 'astro-expressive-code';
import rehypeExpressiveCode from 'rehype-expressive-code';

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
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Inline small stylesheets to eliminate render-blocking CSS requests.
    // The global CSS bundle is ~17 KB; "auto" inlines anything under ~4 KB,
    // so we lift the threshold via "always" — Astro will deduplicate.
    inlineStylesheets: 'always'
  },
  // /blog/ is stuck in GitHub Pages cache serving a Lanyon-era file from
  // 2016. The new index lives at /writing/. If Pages ever invalidates the
  // /blog/ cache, this redirect will kick in. Until then, anyone hitting
  // /blog/ gets the stale page, but no in-site link points there.
  redirects: {
    '/blog': '/writing/',
    '/blog/': '/writing/'
  },
  integrations: [
    // expressive-code must come before mdx() so it pre-processes fenced
    // code blocks inside .mdx files. Wrap is enabled so long lines (e.g.
    // BibTeX URLs, frontmatter descriptions) wrap instead of overflowing.
    expressiveCode(ecOptions),
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, [rehypeExpressiveCode, ecOptions]]
    }),
    sitemap()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
