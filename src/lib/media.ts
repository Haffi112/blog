import yaml from 'js-yaml';
// Single source of truth: the CV's media list. The site reads it raw at
// build time rather than keeping a second copy that would drift.
import raw from '~/data/cv-static.yaml?raw';

export type MediaType =
  | 'article'
  | 'opinion'
  | 'explainer'
  | 'radio'
  | 'podcast'
  | 'livestream'
  | 'tv'
  | 'video';

export interface MediaItem {
  date: Date;
  title_is?: string;
  title_en: string;
  outlet: string;
  type: MediaType;
  url?: string;
}

/* Type labels (Article, Op-ed …) live in src/i18n/ui.ts under media.types. */

/**
 * Outlets that publish in English. Everything else in the list is an
 * Icelandic outlet, so its `title_is` is the original headline and
 * `title_en` a gloss; for these it is the other way round.
 */
const ENGLISH_OUTLETS = new Set(['The Guardian']);

/** The language the linked piece itself is in. */
export const sourceLang = (m: MediaItem): 'en' | 'is' =>
  ENGLISH_OUTLETS.has(m.outlet) ? 'en' : 'is';

const data = yaml.load(raw) as { media_appearances?: MediaItem[] };

/** All media appearances, newest first. */
export const media: MediaItem[] = (data.media_appearances ?? [])
  .map((m) => ({ ...m, date: new Date(m.date) }))
  .sort((a, b) => b.date.getTime() - a.date.getTime());
