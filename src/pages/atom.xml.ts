import rss from '@astrojs/rss';
import { getPosts, postUrl } from '~/lib/posts';

export async function GET(context: { site: URL }) {
  // getPosts() is newest first; feed readers that keep document order
  // would otherwise open on a 2016 post.
  const posts = await getPosts('en');
  return rss({
    title: 'Hafsteinn Einarsson',
    description: 'Notes on things I build with AI, bootstrap percolation and computational neuroscience.',
    site: context.site,
    customData: '<language>en</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt ?? '',
      categories: p.data.tags,
      link: postUrl(p)
    }))
  });
}
