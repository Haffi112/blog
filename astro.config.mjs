// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://haffi112.github.io',
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
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    }),
    sitemap()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
