import { languages, ui, type Dict, type Lang } from './ui';

export { languages, type Lang, type Dict };

export const defaultLang: Lang = 'en';

/**
 * Pages that exist in both languages, as their English path. The Icelandic
 * twin is the same path under /is/ (src/pages/is/<same>/index.astro).
 * Anything not listed — blog posts, /404/, static files — is English only.
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

/** Normalise to a leading and trailing slash, matching trailingSlash: 'always'. */
const withSlash = (p: string) => {
  const s = p.startsWith('/') ? p : `/${p}`;
  return s.endsWith('/') ? s : `${s}/`;
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
 * prefixed; everything else (PDFs, blog posts, external links, mailto:) is
 * returned unchanged, so it is always safe to wrap an href in this.
 * Hash and query are preserved: '/#series' → '/is/#series'.
 */
export function localizePath(href: string, lang: Lang): string {
  if (!href.startsWith('/')) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const tail = cut === -1 ? '' : href.slice(cut);
  const base = stripLang(path);
  if (!translated.has(withSlash(base))) return href;
  return (lang === 'is' ? `/is${withSlash(base)}` : withSlash(base)) + tail;
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
 * one; for a blog post, the Icelandic writing index (posts are English
 * only); otherwise the other language's home page.
 */
export function switchHref(pathname: string): string {
  const lang = getLang(pathname);
  const target = otherLang(lang);
  const alt = alternates(pathname);
  if (alt) return alt[target];
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
