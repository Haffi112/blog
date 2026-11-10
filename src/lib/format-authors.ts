import type { Author } from '~/data/publications.schema';

const YOUR_LAST_NAME = 'Einarsson';
const YOUR_FIRST_INITIAL = 'H';

/** BibTeX's "and others", which the parser hands over as an author. */
const isEtAl = (a: Author) => !a.first.trim() && a.last.toLowerCase() === 'others';

/** "Einarsson, H." — or "et al." for BibTeX's "and others", and the bare
    name for an author without given names (a consortium). */
export function formatAuthor(a: Author): string {
  if (isEtAl(a)) return 'et al.';
  const initials = a.first
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]}.`)
    .join(' ');
  return initials ? `${a.last}, ${initials}` : a.last;
}

export function isYou(a: Author): boolean {
  if (a.last !== YOUR_LAST_NAME) return false;
  // The site owner has a single given name ("Hafsteinn", or just the
  // initial "H" in some clinical-paper bib entries). A namesake co-author
  // with a middle name (e.g. "Hafsteinn Birgir Einarsson") must not match.
  const given = a.first.trim().split(/\s+/).filter(Boolean);
  return given.length === 1 && given[0].startsWith(YOUR_FIRST_INITIAL);
}

/** One piece of a printed author list; `me` marks the site owner. */
export interface AuthorToken {
  text: string;
  me: boolean;
}

/** Lists up to this many authors are printed in full. */
const MAX_AUTHORS = 6;
/** How many leading authors a longer list keeps. */
const LEAD_AUTHORS = 3;

/**
 * The author list as it is printed on the site and in the CV (the CV gets
 * it through scripts/generate-cv.ts, so the two cannot drift).
 *
 * Short lists are printed in full. A long one keeps its first three
 * authors and the owner: "A, B, C, …, Einarsson, H., et al.". Consortium
 * papers whose BibTeX stops at "and others" before reaching the owner get
 * the same treatment, so his name is always visible; the ellipsis says
 * that names were left out. The "Cite" button still gives the full entry.
 */
export function displayAuthors(authors: Author[]): AuthorToken[] {
  const named = authors.filter((a) => !isEtAl(a));
  const truncated = named.length < authors.length;
  const tok = (a: Author): AuthorToken => ({ text: formatAuthor(a), me: isYou(a) });
  const etAl: AuthorToken = { text: 'et al.', me: false };
  const gap: AuthorToken = { text: '…', me: false };
  const me = named.findIndex(isYou);

  if (named.length <= MAX_AUTHORS && (me !== -1 || !truncated)) {
    return truncated ? [...named.map(tok), etAl] : named.map(tok);
  }
  const out = named.slice(0, LEAD_AUTHORS).map(tok);
  if (me === -1) {
    // Hidden behind "and others": an author, position unknown.
    return truncated
      ? [...out, gap, { text: `${YOUR_LAST_NAME}, ${YOUR_FIRST_INITIAL}.`, me: true }, etAl]
      : [...out, etAl];
  }
  if (me < LEAD_AUTHORS) return [...out, etAl];
  if (me > LEAD_AUTHORS) out.push(gap);
  out.push(tok(named[me]));
  if (me < named.length - 1 || truncated) out.push(etAl);
  return out;
}
