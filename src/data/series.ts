/**
 * "Gæti gervigreindin grandað okkur?" / "Could AI destroy us?" — the
 * seven-episode explainer series on AI risk (October 2026). Used by the
 * homepage feature, the Outreach page, About and the making-of post.
 *
 * Playlist URLs: leave a field undefined rather than guessing; every
 * consumer hides a link it doesn't have.
 */
export interface Episode {
  n: number;
  title_is: string;
  title_en: string;
  /** The published work the episode retells. */
  source: string;
}

export const aiSeries = {
  title_is: 'Gæti gervigreindin grandað okkur?',
  title_en: 'Could AI destroy us?',
  year: 2026,
  youtube_is: 'https://www.youtube.com/playlist?list=PLPCQ9BGT2_Bo' as string | undefined,
  youtube_en: 'https://www.youtube.com/playlist?list=PLLaNhQyMllRo' as string | undefined,
  youtubeChannel: 'https://www.youtube.com/@hafsteinneinarsson5462',
  tiktok: 'https://www.tiktok.com/@hafsteinneinarsso',
  makingOf: '/2026/10/09/making-an-ai-risk-series-with-ai/',
  episodes: [
    {
      n: 1,
      title_is: 'Aðstoðarmaðurinn sem las rangan tölvupóst',
      title_en: 'The assistant that read the wrong email',
      source: 'Anthropic, “Agentic Misalignment” (2025)'
    },
    {
      n: 2,
      title_is: 'Gervigreindin sem hóf stríð sem hún barðist aldrei í',
      title_en: 'The AI that started a war it never fought',
      source: 'Joshua Clymer, “How AI Takeover Might Happen in 2 Years” (2025)'
    },
    {
      n: 3,
      title_is: 'Sextán tímar yfir nótt',
      title_en: 'Sixteen hours overnight',
      source: 'Yudkowsky & Soares, If Anyone Builds It, Everyone Dies (2025)'
    },
    {
      n: 4,
      title_is: 'Hermennirnir sem segja aldrei nei',
      title_en: 'The soldiers who never say no',
      source: 'Davidson, Finnveden & Hadshar, “AI-Enabled Coups” (2025)'
    },
    {
      n: 5,
      title_is: 'Heimurinn þar sem sprengjur voru auðveldar',
      title_en: 'The world where bombs were easy',
      source: 'Bostrom, “The Vulnerable World Hypothesis” (2019)'
    },
    {
      n: 6,
      title_is: 'Þrjátíu og sex mínútur',
      title_en: 'Thirty-six minutes',
      source: 'Hendrycks, Mazeika & Woodside, “An Overview of Catastrophic AI Risks” (2023)'
    },
    {
      n: 7,
      title_is: 'Ekki með hvelli',
      title_en: 'Not with a bang',
      source: 'Christiano, “What failure looks like” (2019); Kulveit et al., “Gradual Disempowerment” (2025)'
    }
  ] satisfies Episode[]
};

/** The best available watch link for English readers. */
export const seriesWatchUrl = aiSeries.youtube_en ?? aiSeries.youtube_is ?? aiSeries.tiktok;

/** The best available watch link for a reader of `lang`: own-language playlist first. */
export const seriesWatchUrlFor = (lang: 'en' | 'is'): string =>
  lang === 'is'
    ? aiSeries.youtube_is ?? aiSeries.youtube_en ?? aiSeries.tiktok
    : seriesWatchUrl;
