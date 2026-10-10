import { renderCard } from '~/og/card';

// Social card for every Icelandic page that isn't a blog post.
export async function GET() {
  const png = await renderCard({
    eyebrow: 'hafst1.is',
    title: 'Hafsteinn Einarsson',
    subtitle: 'Dósent og deildarforseti við Háskóla Íslands. Vísindamaður hjá Íslenskri erfðagreiningu.',
    seed: 'default',
    byline: false
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
