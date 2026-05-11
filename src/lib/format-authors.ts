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
  return (
    a.last === YOUR_LAST_NAME && a.first.trim().startsWith(YOUR_FIRST_INITIAL)
  );
}
