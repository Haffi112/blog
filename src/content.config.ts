import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* Icelandic text lives beside the English in optional `*_is` fields. Pages
   under /is/ read the `_is` field and fall back to the English one when it
   is missing, so a new entry can ship in English first. See src/i18n/. */

/* Content Layer loaders. Blog entry ids are the file path without the
   extension, so an Icelandic translation at blog/is/<name>.mdx gets the id
   "is/<name>" (src/lib/posts.ts pairs them by that). */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      updated: z.date().optional(),
      excerpt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      hero: image().optional(),
      customCss: z.array(z.string()).default([]),
      cited: z.array(z.string()).default([])
    })
});

const news = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/news' }),
  schema: z.object({
    date: z.date(),
    text: z.string(),
    text_is: z.string().optional(),
    /** An absolute URL or a site path (e.g. /research/#talks). */
    link: z.string().regex(/^(https?:\/\/|\/)/).optional(),
    /** Where the Icelandic version should link, when it differs. */
    link_is: z.string().regex(/^(https?:\/\/|\/)/).optional(),
    /** How much of `date` is known. Year-only items (a position, a grant,
        a graduation) show just the year instead of an invented month; store
        them as YYYY-01-01. */
    precision: z.enum(['year', 'month']).default('month')
  })
});

const talks = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/talks' }),
  schema: z.object({
    date: z.date(),
    title: z.string(),
    title_is: z.string().optional(),
    venue: z.string(),
    venue_is: z.string().optional(),
    /** English place name; the Icelandic one comes from `places` in src/i18n/ui.ts. */
    location: z.string().optional(),
    link: z.string().url().optional(),
    type: z.enum(['invited', 'keynote', 'outreach', 'workshop']).default('invited')
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    /** Only when `name` is descriptive rather than a proper name. */
    name_is: z.string().optional(),
    summary: z.string(),
    summary_is: z.string().optional(),
    links: z
      .object({
        repo: z.string().url().optional(),
        huggingface: z.string().url().optional(),
        site: z.string().url().optional(),
        dataset: z.string().url().optional()
      })
      .default({}),
    tags: z.array(z.string()).default([]),
    status: z.enum(['active', 'maintenance', 'archived']).default('active')
  })
});

const students = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/students' }),
  schema: z.object({
    name: z.string(),
    role: z.enum(['phd-main', 'phd-committee', 'msc', 'alumni-phd', 'alumni-msc', 'alumni-phd-committee']),
    /** Thesis title, shown as written in both languages. */
    title: z.string().optional(),
    /** Only for entries whose `title` is a description rather than a thesis title. */
    title_is: z.string().optional(),
    startYear: z.number().int().optional(),
    endYear: z.number().int().optional(),
    link: z.string().url().optional(),
    nowAt: z.string().optional(),
    nowAt_is: z.string().optional(),
    supervisor: z.string().optional()
  })
});

const teaching = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/teaching' }),
  schema: z.object({
    title: z.string(),
    title_is: z.string().optional(),
    level: z.enum(['bsc', 'msc', 'phd', 'mixed']).default('mixed'),
    language: z.enum(['english', 'icelandic', 'mixed']).default('english'),
    semesters: z.array(z.string()).default([]),
    description: z.string(),
    description_is: z.string().optional(),
    syllabus: z.string().url().optional()
  })
});

export const collections = { blog, news, talks, projects, students, teaching };
