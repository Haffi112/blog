// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://haffi112.github.io',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()]
  }
});
