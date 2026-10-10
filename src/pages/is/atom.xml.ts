import rss from '@astrojs/rss';
import { getPosts, postUrl } from '~/lib/posts';

// Icelandic feed: only posts that have been translated.
export async function GET(context: { site: URL }) {
  const posts = await getPosts('is');
  return rss({
    title: 'Hafsteinn Einarsson',
    description: 'Pistlar um það sem ég smíða með gervigreind, bootstrap percolation og reiknileg taugavísindi.',
    // The channel links to the Icelandic home page; item links are
    // root-relative (/is/…), so they resolve the same against either base.
    site: new URL('/is/', context.site),
    customData: '<language>is</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt ?? '',
      categories: p.data.tags,
      link: postUrl(p)
    }))
  });
}
