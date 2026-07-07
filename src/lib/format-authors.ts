import type { Author } from '~/data/publications.schema';

const YOUR_LAST_NAME = 'Einarsson';
const YOUR_FIRST_INITIAL = 'H';

export function formatAuthor(a: Author): string {
  const initials = a.first
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]}.`)
    .join(' ');
  return `${a.last}, ${initials}`;
}

export function isYou(a: Author): boolean {
  if (a.last !== YOUR_LAST_NAME) return false;
  // The site owner has a single given name ("Hafsteinn", or just the
  // initial "H" in some clinical-paper bib entries). A namesake co-author
  // with a middle name (e.g. "Hafsteinn Birgir Einarsson") must not match.
  const given = a.first.trim().split(/\s+/).filter(Boolean);
  return given.length === 1 && given[0].startsWith(YOUR_FIRST_INITIAL);
}
