import { languages, ui, type Dict, type Lang } from './ui';

export { languages, type Lang, type Dict };

export const defaultLang: Lang = 'en';

/**
 * Pages that exist in both languages, as their English path. The Icelandic
 * twin is the same path under /is/ (src/pages/is/<same>/index.astro).
 * Blog posts are paired separately (translatedPosts below); anything else —
 * /404/, PDFs, static files — is English only.
 * Add a route here when you add its /is/ wrapper.
 */
export const translatedRoutes = [
  '/',
  '/research/',
  '/publications/',
  '/teaching/',
  '/group/',
  '/writing/',
  '/about/',
  '/cv/',
  '/simulations/'
] as const;

const translated = new Set<string>(translatedRoutes);

/**
 * English URLs of the posts that have an Icelandic translation, read from
 * the filenames in src/content/blog/is/ (drafts left out). A post's URL is
 * its filename's date and slug; postPaths() in src/lib/posts.ts fails the
 * build if a frontmatter date ever disagrees with its filename.
 */
const translatedPosts = Object.entries(
  import.meta.glob<string>('/src/content/blog/is/*.{md,mdx}', { query: '?raw', import: 'default', eager: true })
).flatMap(([file, source]) => {
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const m = file.match(/(\d{4})-(\d{2})-(\d{2})-([^/]+)\.mdx?$/);
  return m && !/^draft:\s*true\s*$/m.test(front) ? [`/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`] : [];
});

/** Everything localizePath() moves under /is/: the pages, the translated posts and the feed. */
const localizable = new Set<string>([...translatedRoutes, ...translatedPosts, '/atom.xml']);

/** Normalise to a leading and trailing slash, matching trailingSlash: 'always'. Files keep their extension. */
const withSlash = (p: string) => {
  const s = p.startsWith('/') ? p : `/${p}`;
  return s.endsWith('/') || /\.\w+$/.test(s) ? s : `${s}/`;
};

/** The language a path belongs to: anything under /is/ is Icelandic. */
export function getLang(url: URL | string): Lang {
  const path = typeof url === 'string' ? url : url.pathname;
  return path === '/is' || path.startsWith('/is/') ? 'is' : 'en';
}

/** Remove the /is prefix: '/is/research/' → '/research/', '/is/' → '/'. */
export function stripLang(path: string): string {
  if (path === '/is' || path === '/is/') return '/';
  return path.startsWith('/is/') ? path.slice(3) : path;
}

/**
 * The URL of an internal page in `lang`. Only paths with a translation are
 * prefixed (pages, translated blog posts, the feed); everything else (PDFs,
 * untranslated posts, external links, mailto:) is returned unchanged, so it
 * is always safe to wrap an href in this — and any internal link on a
 * bilingual page should be wrapped.
 * Hash and query are preserved: '/#series' → '/is/#series'.
 */
export function localizePath(href: string, lang: Lang): string {
  if (!href.startsWith('/')) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const tail = cut === -1 ? '' : href.slice(cut);
  const base = withSlash(stripLang(path));
  if (!localizable.has(base)) return href;
  return (lang === 'is' ? `/is${base}` : base) + tail;
}

/** Both language versions of the current page, or null if it has no twin. */
export function alternates(pathname: string): Record<Lang, string> | null {
  const base = withSlash(stripLang(pathname));
  if (!translated.has(base)) return null;
  return { en: base, is: base === '/' ? '/is/' : `/is${base}` };
}

export const otherLang = (lang: Lang): Lang => (lang === 'is' ? 'en' : 'is');

/**
 * Where the language switcher points: the twin of this page when there is
 * one; for a blog post, its translation, or the Icelandic writing index if
 * it has none; otherwise the other language's home page. (Post pages pass
 * their own alternates to BaseLayout, so this is the fallback.)
 */
export function switchHref(pathname: string): string {
  const lang = getLang(pathname);
  const target = otherLang(lang);
  const alt = alternates(pathname);
  if (alt) return alt[target];
  const post = localizePath(pathname, target);
  if (post !== pathname) return post;
  if (target === 'is' && /^\/\d{4}\/\d{2}\/\d{2}\//.test(pathname)) return '/is/writing/';
  return target === 'is' ? '/is/' : '/';
}

export function useTranslations(lang: Lang): Dict {
  return ui[lang];
}

/** The Icelandic field when on an Icelandic page and it exists, else the English one. */
export function pick<T>(lang: Lang, en: T, is: T | undefined): T {
  return lang === 'is' && is !== undefined && is !== null && is !== '' ? is : en;
}

/** `lang` attribute for content that fell back to English on an Icelandic page. */
export function fallbackLang(lang: Lang, is: unknown): 'en' | undefined {
  return lang === 'is' && (is === undefined || is === null || is === '') ? 'en' : undefined;
}

/** Dates are stored as UTC midnight; always format in UTC. */
export function formatDate(d: Date, lang: Lang, opts: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString(languages[lang].locale, { timeZone: 'UTC', ...opts });
}
