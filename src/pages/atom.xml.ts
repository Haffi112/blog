import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'Hafsteinn Einarsson',
    description: 'Notes on computational neuroscience, NLP, and applied ML.',
    site: context.site,
    items: posts.map((p) => {
      const d = p.data.date;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const slug = p.slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return {
        title: p.data.title,
        pubDate: p.data.date,
        description: p.data.excerpt ?? '',
        link: `/${y}/${m}/${dd}/${slug}/`
      };
    })
  });
}
