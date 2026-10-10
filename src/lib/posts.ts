import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '~/i18n/utils';

export type Post = CollectionEntry<'blog'>;

/*
 * Posts are written in English at src/content/blog/YYYY-MM-DD-slug.mdx.
 * An Icelandic translation lives at src/content/blog/is/<same filename> and
 * is served under /is/YYYY/MM/DD/slug/. The two are paired by filename.
 */

const IS_PREFIX = 'is/';

/** The language a post is written in, from its folder. */
export function postLang(post: Post): Lang {
  return post.id.startsWith(IS_PREFIX) ? 'is' : 'en';
}

/** Filename without folder or extension: '2016-03-27-bootstrap-percolation'. */
function baseName(post: Post): string {
  return post.id.startsWith(IS_PREFIX) ? post.id.slice(IS_PREFIX.length) : post.id;
}

/** The URL slug: filename with its YYYY-MM-DD- prefix removed. */
export function postSlug(post: Post): string {
  return baseName(post).replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Date-derived URL, mirroring src/pages/[year]/[month]/[day]/[slug]/ (and its /is/ twin). */
export function postUrl(post: Post): string {
  const d = post.data.date;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${postLang(post) === 'is' ? '/is' : ''}/${y}/${m}/${day}/${postSlug(post)}/`;
}

const byDateDesc = (a: Post, b: Post) => b.data.date.getTime() - a.data.date.getTime();

async function allPosts(): Promise<Post[]> {
  return (await getCollection('blog', ({ data }) => !data.draft)).sort(byDateDesc);
}

/** Published posts written in `lang`, newest first. */
export async function getPosts(lang: Lang = 'en'): Promise<Post[]> {
  return (await allPosts()).filter((p) => postLang(p) === lang);
}

/**
 * What a reader of `lang` should see in a list: every post in that language,
 * plus the English original of any post that has not been translated yet.
 */
export async function getPostsFor(lang: Lang): Promise<Post[]> {
  if (lang === 'en') return getPosts('en');
  const all = await allPosts();
  const translated = new Set(all.filter((p) => postLang(p) === lang).map(baseName));
  return all.filter((p) => postLang(p) === lang || (postLang(p) === 'en' && !translated.has(baseName(p))));
}

/** URLs of a post in each language it exists in. */
export async function postAlternates(post: Post): Promise<Partial<Record<Lang, string>>> {
  const name = baseName(post);
  const out: Partial<Record<Lang, string>> = {};
  for (const p of await allPosts()) if (baseName(p) === name) out[postLang(p)] = postUrl(p);
  return out;
}

/** getStaticPaths entries for the post route of one language. */
export async function postPaths(lang: Lang) {
  const posts = await getPosts(lang);
  const link = (p?: Post) => (p ? { title: p.data.title, url: postUrl(p) } : undefined);
  return posts.map((post, i) => {
    const d = post.data.date;
    const params = {
      year: String(d.getUTCFullYear()),
      month: String(d.getUTCMonth() + 1).padStart(2, '0'),
      day: String(d.getUTCDate()).padStart(2, '0'),
      slug: postSlug(post)
    };
    // localizePath() finds translated posts by filename, so the URL has to
    // match it as well as the frontmatter.
    if (!baseName(post).startsWith(`${params.year}-${params.month}-${params.day}-`)) {
      throw new Error(`${post.id}: frontmatter date ${params.year}-${params.month}-${params.day} does not match the filename`);
    }
    return {
      params,
      // Sorted newest first, so the previous index is the newer post.
      props: { post, newer: link(posts[i - 1]), older: link(posts[i + 1]) }
    };
  });
}

/** Reading time at ~230 words a minute, ignoring MDX imports and markup. */
export function readingMinutes(post: Post): number {
  const text = (post.body ?? '')
    .replace(/^(import|export)\s.*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
