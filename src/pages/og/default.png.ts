import { renderCard } from '~/og/card';

// Social card for every English page that isn't a blog post.
export async function GET() {
  const png = await renderCard({
    eyebrow: 'hafst1.is',
    title: 'Hafsteinn Einarsson',
    subtitle:
      'Associate Professor and Head of Faculty, University of Iceland. Principal Scientist, Amgen deCODE.',
    seed: 'default',
    byline: false
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
