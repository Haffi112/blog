import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { getPostsFor, postLang, postUrl } from '~/lib/posts';
import { fallbackLang, pick, type Lang } from '~/i18n/utils';

/** A photo attached to a news item, with its alt text in the page's language. */
export type NewsKind = 'paper' | 'talk' | 'media' | 'award' | 'grant' | 'role' | 'group' | 'video' | 'post';

export interface NewsImage {
  src: ImageMetadata;
  alt: string;
  /** `lang` for `alt` when it falls back to English on /is/. */
  altLang?: string;
}

/** One row in a news list, ready for NewsItem.astro. */
export interface NewsEntry {
  date: Date;
  text: string;
  link?: string;
  /** What the item is about, for the label above the text. */
  kind?: NewsKind;
  /** `lang` for `text` when it differs from the page (an English title on /is/). */
  textLang?: string;
  /** `hreflang` for the link, when it opens a page in another language. */
  hreflang?: string;
  /** 'year' when only the year is known. */
  precision?: 'year' | 'month';
  images?: NewsImage[];
}

/**
 * News items, newest first, in the page's language. The homepage feed mixes
 * in blog posts so new writing shows up there; the full list on the Writing
 * page leaves them out, because the posts are already listed above it.
 */
export async function getNews(lang: Lang, { withPosts = false } = {}): Promise<NewsEntry[]> {
  const items: NewsEntry[] = (await getCollection('news')).map((n) => ({
    date: n.data.date,
    text: pick(lang, n.data.text, n.data.text_is),
    textLang: lang === 'is' && !n.data.text_is ? 'en' : undefined,
    link: pick(lang, n.data.link, n.data.link_is),
    precision: n.data.precision,
    kind: n.data.kind,
    images: n.data.images.map((img) => ({
      src: img.src,
      alt: pick(lang, img.alt, img.alt_is),
      altLang: fallbackLang(lang, img.alt_is)
    }))
  }));

  if (withPosts) {
    /* The translation when there is one; an untranslated post keeps its
       English title, marked as such. */
    for (const post of await getPostsFor(lang)) {
      const foreign = postLang(post) === lang ? undefined : postLang(post);
      items.push({
        date: post.data.date,
        kind: 'post',
        text: post.data.title,
        textLang: foreign,
        hreflang: foreign,
        link: postUrl(post)
      });
    }
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime());
}
