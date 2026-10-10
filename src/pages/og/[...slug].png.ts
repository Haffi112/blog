import type { APIContext } from 'astro';
import { renderCard } from '~/og/card';
import { getPosts, postSlug } from '~/lib/posts';
import { formatDate, type Lang } from '~/i18n/utils';

// A 1200x630 social card per blog post, in both languages: /og/<slug>.png
// and /og/is/<slug>.png. Posts with a `hero` image use that instead (see
// src/views/PostPage.astro), but every post gets a card so the fallback
// always exists.
export async function getStaticPaths() {
  const out = [];
  for (const lang of ['en', 'is'] as Lang[]) {
    for (const post of await getPosts(lang)) {
      const slug = postSlug(post);
      out.push({
        params: { slug: lang === 'is' ? `is/${slug}` : slug },
        props: { title: post.data.title, date: post.data.date, lang, seed: slug }
      });
    }
  }
  return out;
}

export async function GET(context: APIContext) {
  const { title, date, lang, seed } = context.props as {
    title: string;
    date: Date;
    lang: Lang;
    seed: string;
  };
  const png = await renderCard({
    eyebrow: formatDate(date, lang, { day: 'numeric', month: 'long', year: 'numeric' }),
    title,
    seed
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' }
  });
}
