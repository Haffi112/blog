import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
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
  type: 'data',
  schema: z.object({
    date: z.date(),
    text: z.string(),
    link: z.string().url().optional()
  })
});

const talks = defineCollection({
  type: 'data',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    venue: z.string(),
    location: z.string().optional(),
    link: z.string().url().optional(),
    type: z.enum(['invited', 'keynote', 'outreach', 'workshop']).default('invited')
  })
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    summary: z.string(),
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
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.enum(['phd-main', 'phd-committee', 'msc', 'alumni-phd', 'alumni-msc']),
    title: z.string().optional(),
    startYear: z.number().int().optional(),
    endYear: z.number().int().optional(),
    link: z.string().url().optional(),
    nowAt: z.string().optional()
  })
});

const teaching = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    level: z.enum(['bsc', 'msc', 'phd', 'mixed']).default('mixed'),
    language: z.enum(['english', 'icelandic', 'mixed']).default('english'),
    semesters: z.array(z.string()).default([]),
    description: z.string(),
    syllabus: z.string().url().optional()
  })
});

export const collections = { blog, news, talks, projects, students, teaching };
