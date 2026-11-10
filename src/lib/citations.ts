import cited from '~/data/cited-refs.json';
import type { Publication } from '~/data/publications.schema';

/* References cited by blog posts (from _bibliography/references.bib, via
   scripts/parse-bib.ts). A post lists the keys it cites in its `cited`
   frontmatter; <Cite> and <Bibliography> both number them through
   citedRefs(), so an inline "[2]" is always entry 2 of that post's list. */
const all = cited as unknown as Publication[];

/** A post's references in the order its reference list prints them: newest first, then by key. */
export function citedRefs(keys: string[]): Publication[] {
  const unknown = keys.filter((k) => !all.some((r) => r.id === k));
  if (unknown.length) {
    throw new Error(`Unknown citation key(s) in "cited": ${unknown.join(', ')} (not in _bibliography/references.bib)`);
  }
  return all
    .filter((r) => keys.includes(r.id))
    .sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
}
