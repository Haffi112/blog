export type Theme =
  | 'nlp-is'
  | 'cv-nat'
  | 'clinical-ai'
  | 'genetics'
  | 'comp-neuro'
  | 'discrete-math';

export interface Author {
  first: string;
  last: string;
}

export interface PublicationLinks {
  doi?: string;
  arxiv?: string;
  pdf?: string;
  code?: string;
  huggingface?: string;
  dataset?: string;
}

export interface RawEntry {
  id: string;
  type: string;
  title: string;
  authors: Author[];
  venue: string;
  year: number;
  pages?: string;
  volume?: string;
  number?: string;
  publisher?: string;
}

export interface Publication extends RawEntry {
  theme?: Theme;
  summary?: string;
  selected: boolean;
  links: PublicationLinks;
  notes?: string;
}
