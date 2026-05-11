# Website Refresh — Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` (or this controller can use `superpowers:subagent-driven-development`) to implement this plan task-by-task.

**Goal:** Add academic depth on top of the Phase 1 foundation: `/research/` (anchored themes / projects / talks), `/group/` (canonical students page), and `/teaching/`. Populate the `students`, `teaching`, `projects`, and `talks` content collections.

**Architecture:** Same Astro 5 + Tailwind 4 stack from Phase 1. New pages reuse `BaseLayout`. New collection-driven components (`PersonCard`, `CourseCard`, `ProjectCard`, `TalkItem`, `ThemeCard`) follow the conventions of `PubCard` / `NewsItem`. The publications page gets theme anchor IDs so the Research themes section can deep-link into it.

**Tech Stack:** No new packages — pure content + components on the existing stack.

**Reference design:** `docs/plans/2026-05-11-website-refresh-design.md` (Section 7).
**Reference for Phase 1 conventions:** `docs/plans/2026-05-11-website-refresh-phase-1.md`.

**Scope boundary:** This plan covers Phase 2. Blog migration + simulations are Phase 3; SEO/accessibility/performance polish is Phase 4.

**Content sources:**
- `old_cvs/2026/january/two_page_CV_2026_january.docx` — current students list, awards, teaching summary
- `old_cvs/2026/april/dff-track-record-Einarsson.docx` — research statement, selected outputs, contributions
- `old_cvs/2026/april/dff-cv-Einarsson.docx` — research statement, supervision counts, teaching list, talks, service

---

## Pre-flight

- [ ] On `master`, working tree clean
- [ ] Phase 1 live: https://haffi112.github.io/ returns 200
- [ ] Create a new feature branch: `git checkout -b phase-2-academic-depth`

---

## Task 1: Populate the `teaching` content collection

**Goal:** One markdown data file per course Hafsteinn currently teaches or has developed.

**Files:**
- Create one file per course under `src/content/teaching/`. Use kebab-case slugs.

Courses (from the April 2026 CV's teaching section). Schema is defined at `src/content/config.ts` (Task 4 of Phase 1).

```
src/content/teaching/discrete-mathematics.yml
src/content/teaching/algorithms.yml
src/content/teaching/ai-lifecycle.yml
src/content/teaching/digital-literacy.yml
src/content/teaching/intro-deep-learning.yml
src/content/teaching/nlp-business-intelligence.yml
src/content/teaching/llms-in-icelandic.yml
```

Example `src/content/teaching/discrete-mathematics.yml`:
```yaml
title: Discrete Mathematics for Computer Science
level: ba
language: english
semesters: []
description: |
  Foundational discrete math course for first-year CS students: logic,
  proof techniques, combinatorics, graphs, and an introduction to
  probability on discrete sample spaces.
```

For each course, infer the level (ba/msc), language (english/icelandic/mixed), and write a 2-3 sentence description. Don't invent specific semester strings unless you know them — leave `semesters: []` if unknown. The `language: mixed` enum value is the right default for courses taught to a mixed Icelandic/international cohort.

Reference content from the April CV:
- **Discrete Mathematics for CS** — BA, mixed-language (Icelandic department but international students take it)
- **Analysis of Algorithms** — BA/MSc bridge, English
- **The AI Lifecycle** — MSc, developed by Hafsteinn, applied AI from problem framing to deployment
- **Computers / Operating Systems / Digital Literacy** — developed in 2020, BA, mixed
- **Introduction to Deep Learning** — MSc, English
- **NLP module in Business Intelligence** — MSc module, taught at the business school, English
- **LLMs in an Icelandic context** — co-taught at School of Humanities, MSc, Icelandic (it's the one where the language situates the content)

Commit:
```bash
git add src/content/teaching/
git commit -m "Populate teaching content collection (7 courses)"
```

---

## Task 2: Populate the `students` content collection

**Goal:** One file per current and recent student.

**Files:**
- Create files under `src/content/students/` for each entry in the lists below.

Use the schema fields: `name`, `role` (one of `phd-main`, `phd-committee`, `msc`, `alumni-phd`, `alumni-msc`), `title` (optional), `startYear`, `endYear`, `link`, `nowAt`.

**Current main-supervised PhDs:**
- Steinunn Rut Friðriksdóttir — Mitigating prejudice in language models — `phd-main`
- Annika Simonsen — TrustLLM: aligning language models for Germanic languages — `phd-main`
- Joao Rodrigo Da Silva Martins — PhD with the Marine and Freshwater Institute, Iceland — `phd-main`

**Current PhD committee positions:**
- Pétur Helgi Einarsson — `phd-committee`
- Andrea Rakel Sigurðardóttir — `phd-committee` (multispectral imaging; finishing PhD at the University of Iceland)
- Sindri Emmanúel Antonsson — `phd-committee`
- Þór Sverrisson — `phd-committee` (was MSc supervisee on abstractive summarization; now doing a PhD at the University of Iceland)
- Isidora Glisic — `phd-committee`
- Bjarki Ármannsson — `phd-committee`
- Amir Hamedpour — `phd-committee` (multispectral grasslands work)

**Currently supervising MSc (~3 students as of January 2026 CV):**
- Margrét Snorradóttir — *Sköpunargáfa og ADHD* (2025) — `msc`
- Steinar Bragi Sigurðarson — *Gervigreindarknúin bókameðmæli fyrir börn* (2025) — `msc`
- Joao Rodrigo Da Silva Martins — *Fish Species Classification in Controlled Underwater Environments Using Contrastive Language-Image Models* (2025; subsequently transitioned to PhD) — `msc`

(Note: Joao appears under both `phd-main` and `msc`. The MSc entry should have `endYear: 2025` and `nowAt: "PhD with the Marine and Freshwater Institute"`. The PhD entry has no endYear.)

**Recent MSc alumni:**
- Alexander Guðmundsson — *Evaluating Speech Technology Integration in Children's Reading Education* (2025) — `alumni-msc`
- Haraldur Orri Hauksson — ICD-10 classification for Icelandic (2024) — `alumni-msc`, `nowAt`: leave blank unless known
- Annika Simonsen — *Improving Machine Translation for Faroese using ChatGPT-Generated Parallel Data* (2023) — `alumni-msc`, `nowAt: "Now my PhD student"`
- Atli Snær Ásmundsson — Sentiment analysis with IceBERT for Icelandic blogs (2023) — `alumni-msc`
- Hrafnhildur Hauksdóttir — Heart failure pharmacotherapy after discharge at Landspítali (2023) — `alumni-msc`
- Þór Sverrisson — Abstractive summarization for Icelandic (2023) — `alumni-msc`, `nowAt: "PhD at University of Iceland"`
- Andrea Rakel Sigurðardóttir — Few-shot nematode detection with multi-spectral imaging (2022) — `alumni-msc`, `nowAt: "PhD at University of Iceland"`
- Kim Cosmo Ström — *Drawing Music* (2022) — `alumni-msc`
- Vésteinn Snæbjarnarson — QA method for Icelandic (2021) — `alumni-msc`, `nowAt: "PhD at University of Copenhagen and ETH Zurich"`

Example `src/content/students/steinunn-rut-fridriksdottir.yml`:
```yaml
name: Steinunn Rut Friðriksdóttir
role: phd-main
title: Mitigating prejudice in language models
startYear: 2023
```

Use Icelandic characters in names — UTF-8 is fine in YAML. Filenames should be ASCII-only (kebab-case, transliterating diacritics).

Don't guess `link` values unless you have a definite URL. `nowAt` should match the verifiable text from the CV.

Commit:
```bash
git add src/content/students/
git commit -m "Populate students content collection (current + alumni)"
```

---

## Task 3: Populate the `projects` content collection

**Goal:** One file per open-source / dataset / model release worth featuring.

**Files:**
- Create files under `src/content/projects/`.

Schema fields: `name`, `summary` (2-3 sentences), `links: { repo, huggingface, site, dataset }`, `tags: []`, `status` (active/maintenance/archived).

Featured projects (drawn from the publications + track-record CV's "Open research" section):

1. **IceBERT family** — Icelandic BERT language models trained on the Icelandic Crawled Corpus. `huggingface`: https://huggingface.co/mideind/IceBERT (verify; otherwise leave the field empty rather than guess). `tags: [nlp-is, language-model]`.
2. **NQiI — Natural Questions in Icelandic** — Icelandic question-answering dataset. `dataset`: leave blank unless verified. `tags: [nlp-is, dataset, qa]`.
3. **Icelandic WinoGrande** — Icelandic adaptation of the WinoGrande commonsense reasoning benchmark.
4. **Hotter and Colder** — Sentiment, emotion, toxicity, sarcasm, and bias annotations for Icelandic blog comments.
5. **FoQA** — Faroese question-answering dataset.
6. **GameQA** — Gamified mobile app platform for building multi-domain QA datasets.
7. **MazeEval** — Benchmark for testing sequential decision-making in language models.
8. **MIM-GOLD-EL** — Entity-linking corpus for Icelandic (with the University of Iceland).
9. **RUQuAD-1** — Reykjavik University Question-Answering Dataset.

For each, fill `summary` from the corresponding publication's summary in `pub-overrides.yaml` (synthesise, don't duplicate verbatim). `status: active` for ongoing work; `maintenance` if the release is stable but not actively extended; `archived` for completed-and-final.

Only include a link if you can verify it points somewhere real. The user reviews after Phase 2 deploy.

Commit:
```bash
git add src/content/projects/
git commit -m "Populate projects content collection"
```

---

## Task 4: Populate the `talks` content collection

**Goal:** One file per invited talk, keynote, public-outreach appearance.

**Files:**
- Create files under `src/content/talks/`.

Schema fields: `date`, `title`, `venue`, `location`, `link`, `type` (invited/keynote/outreach/workshop).

Drawn from the April 2026 track-record CV's "Public outreach" section. Limit to ones that have specific identifying details — don't pad the list.

Items to include:
1. **UNESCO forum on AI and ethics, 2023** — outreach
2. **UTmessan, 2022** — outreach (Icelandic IT conference)
3. **UTmessan, 2021** — outreach
4. **Icelandic teaching academy conference, 2023** — invited
5. **University of Akureyri teaching conference, 2023** — invited
6. **Menntakvika 2025, Reykjavik** — workshop (Schram et al on teacher perceptions of AI)
7. **ICERI 2025** — workshop (also Schram et al)
8. **RÚV nationally broadcast interview, 2021** — outreach (Icelandic national broadcaster)

Use ISO date format. If only year is known, use the first of the year: `2023-01-01`. Tell the reader by setting `date` to a marker like the first of the year. The schema accepts a date object, and YAML will parse `2023` as an integer (bad) — write `2023-01-01` explicitly.

Example `src/content/talks/2023-unesco-ai-ethics.yml`:
```yaml
date: 2023-01-01
title: Talk on AI and ethics
venue: UNESCO forum on AI and Ethics
type: outreach
```

Commit:
```bash
git add src/content/talks/
git commit -m "Populate talks content collection"
```

---

## Task 5: New components — PersonCard, CourseCard, ProjectCard, TalkItem, ThemeCard

**Goal:** Add the five components Phase 2 pages need.

**Files:**
- Create: `src/components/PersonCard.astro`
- Create: `src/components/CourseCard.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/TalkItem.astro`
- Create: `src/components/ThemeCard.astro`

**Step 1: `PersonCard.astro`**

```astro
---
interface Props {
  name: string;
  role: string;        // human-readable label, e.g. "PhD candidate" or "MSc 2025"
  title?: string;      // dissertation / thesis title
  link?: string;       // personal page, ORCID, etc.
  nowAt?: string;      // for alumni: "Now PhD student at X"
}
const { name, role, title, link, nowAt } = Astro.props;
---
<article class="py-4 border-t border-rule first:border-t-0">
  <div class="flex flex-col gap-1">
    <p class="font-medium text-ink">
      {link ? <a href={link}>{name}</a> : name}
    </p>
    <p class="text-sm text-ink-muted">{role}</p>
    {title && <p class="text-sm text-ink">{title}</p>}
    {nowAt && <p class="text-xs text-ink-muted italic">{nowAt}</p>}
  </div>
</article>
```

**Step 2: `CourseCard.astro`**

```astro
---
import Prose from './Prose.astro';

interface Props {
  title: string;
  level: 'ba' | 'msc' | 'phd' | 'mixed';
  language: 'english' | 'icelandic' | 'mixed';
  description: string;
  syllabus?: string;
}
const { title, level, language, description, syllabus } = Astro.props;

const levelLabel: Record<Props['level'], string> = {
  ba: 'BA',
  msc: 'MSc',
  phd: 'PhD',
  mixed: 'BA / MSc'
};
const languageLabel: Record<Props['language'], string> = {
  english: 'English',
  icelandic: 'Icelandic',
  mixed: 'Mixed'
};
---
<article class="py-5 border-t border-rule first:border-t-0">
  <h3 class="text-lg font-semibold text-ink">{title}</h3>
  <p class="mt-1 text-sm text-ink-muted">
    {levelLabel[level]} · {languageLabel[language]}
    {syllabus && <Fragment> · <a href={syllabus}>Syllabus</a></Fragment>}
  </p>
  <p class="mt-2 prose-body max-w-prose text-ink">{description}</p>
</article>
```

**Step 3: `ProjectCard.astro`**

```astro
---
interface Props {
  name: string;
  summary: string;
  links?: {
    repo?: string;
    huggingface?: string;
    site?: string;
    dataset?: string;
  };
  tags?: string[];
  status: 'active' | 'maintenance' | 'archived';
}
const { name, summary, links = {}, tags = [], status } = Astro.props;

const linkOrder: Array<{ key: keyof NonNullable<Props['links']>; label: string }> = [
  { key: 'huggingface', label: 'Hugging Face' },
  { key: 'repo', label: 'Code' },
  { key: 'dataset', label: 'Dataset' },
  { key: 'site', label: 'Site' }
];
const visibleLinks = linkOrder.filter((l) => links[l.key]);

const statusTone: Record<Props['status'], string> = {
  active: 'text-accent-energy',
  maintenance: 'text-ink-muted',
  archived: 'text-ink-muted'
};
---
<article class="py-5 border-t border-rule first:border-t-0">
  <div class="flex items-baseline gap-3">
    <h3 class="text-lg font-semibold text-ink">{name}</h3>
    <span class:list={['text-xs uppercase tracking-wide', statusTone[status]]}>{status}</span>
  </div>
  <p class="mt-2 prose-body max-w-prose text-ink">{summary}</p>
  {visibleLinks.length > 0 && (
    <ul class="mt-3 flex flex-wrap gap-3 text-sm">
      {visibleLinks.map((l) => (
        <li><a href={links[l.key]}>{l.label} →</a></li>
      ))}
    </ul>
  )}
</article>
```

**Step 4: `TalkItem.astro`**

```astro
---
interface Props {
  date: Date;
  title: string;
  venue: string;
  location?: string;
  type: 'invited' | 'keynote' | 'outreach' | 'workshop';
  link?: string;
}
const { date, title, venue, location, type, link } = Astro.props;
const year = date.getFullYear();
---
<li class="flex gap-4 py-3 border-t border-rule first:border-t-0">
  <span class="font-mono text-xs text-ink-muted shrink-0 w-12 mt-1">{year}</span>
  <div>
    <p class="text-ink">
      {link ? <a href={link}>{title}</a> : title}
    </p>
    <p class="text-sm text-ink-muted">
      {venue}{location && <Fragment>, {location}</Fragment>} · {type}
    </p>
  </div>
</li>
```

**Step 5: `ThemeCard.astro`**

```astro
---
import type { Theme } from '~/data/publications.schema';

interface Props {
  theme: Theme;
  title: string;
  body: string;
  anchor: string; // matching id on the publications page, e.g. "nlp-is"
}
const { title, body, anchor } = Astro.props;
---
<article class="bg-bg-elev border border-rule rounded-xl p-6">
  <h3 class="text-xl font-semibold text-ink">{title}</h3>
  <p class="mt-2 prose-body max-w-prose">{body}</p>
  <p class="mt-3 text-sm">
    <a href={`/publications/#${anchor}`}>Related publications →</a>
  </p>
</article>
```

**Step 6: Verify and commit**

```bash
npx astro check 2>&1 | tail -10
git add src/components/PersonCard.astro src/components/CourseCard.astro src/components/ProjectCard.astro src/components/TalkItem.astro src/components/ThemeCard.astro
git commit -m "Phase 2 components: PersonCard, CourseCard, ProjectCard, TalkItem, ThemeCard"
```

---

## Task 6: Add theme anchor IDs to the publications page

**Goal:** Each themed `<h3>` on `/publications/` gets an `id` attribute so the Research themes section can deep-link with `/publications/#nlp-is` etc.

**Files:**
- Modify: `src/pages/publications/index.astro`

**Step 1: Inside the `themeOrder.map(...)` block, change the `<h3>` to:**

```astro
<h3 id={t} class="text-xl font-semibold text-ink mb-2 scroll-mt-20">{themeLabels[t]}</h3>
```

The `scroll-mt-20` Tailwind utility provides a top margin when scrolling to the anchor so the sticky nav doesn't overlap. `id={t}` uses the theme code (`nlp-is`, `cv-nat`, `clinical-ai`, `genetics`, `comp-neuro`) directly.

**Step 2: Build + curl test:**

```bash
npm run build
npm run preview &
sleep 3
curl -s http://localhost:4321/publications/ | grep -oE 'id="(nlp-is|cv-nat|clinical-ai|genetics|comp-neuro)"' | sort -u
pkill -f "astro preview" || true
```

Expect: 5 matches, one per theme.

**Step 3: Commit:**

```bash
git add src/pages/publications/index.astro
git commit -m "Add theme anchor IDs on publications page for deep linking"
```

---

## Task 7: Build `/research/` page

**Goal:** Long-form, anchored Research overview. Three sections: `#themes`, `#projects`, `#talks` (Group is its own top-level page).

**File:**
- Create: `src/pages/research/index.astro`

**Step 1:**

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import ThemeCard from '~/components/ThemeCard.astro';
import ProjectCard from '~/components/ProjectCard.astro';
import TalkItem from '~/components/TalkItem.astro';
import { getCollection } from 'astro:content';

const projects = (await getCollection('projects')).map((p) => p.data);
const talks = (await getCollection('talks'))
  .map((t) => t.data)
  .sort((a, b) => b.date.getTime() - a.date.getTime());

const themes = [
  {
    code: 'nlp-is' as const,
    title: 'NLP for Icelandic and other Germanic languages',
    body: 'Language models, datasets, and evaluation resources for Icelandic, Faroese, and other under-resourced Germanic languages. The IceBERT family, FoQA, the gender-bias evaluation set, the Hotter and Colder sentiment corpus, and a strand of work on prompt engineering and fine-tuning for low-resource machine translation.'
  },
  {
    code: 'cv-nat' as const,
    title: 'Computer vision for natural and agricultural sciences',
    body: 'Applied vision in collaboration with the Marine and Freshwater Research Institute, agricultural science groups, and food-science partners. Few-shot otolith aging, multispectral nematode segmentation in Atlantic cod, gait classification for five-gaited horses, drought-response analysis on subarctic grasslands, and vision-language features for automated fish monitoring.'
  },
  {
    code: 'clinical-ai' as const,
    title: 'Clinical AI and cardiology',
    body: 'Joint work with the Icelandic National Hospital on automated clinical coding (ICD-10 from discharge summaries with Icelandic BERT models) and on the Icelandic Heart Failure Registry. Several international surveys on heart-failure management with preserved ejection fraction (HFpEF).'
  },
  {
    code: 'genetics' as const,
    title: 'Human genetics and computational biology',
    body: 'Research-scientist position at deCODE genetics. Genome-wide-association work on common conditions where the analysis intersects with NLP-style methods, including a Nature Communications paper on BMI-associated variants and disease risk.'
  },
  {
    code: 'comp-neuro' as const,
    title: 'Computational neuroscience',
    body: "PhD-era and ongoing work on emergent behaviour in models of cortical networks. Bootstrap percolation with inhibition, fast Hebbian spike-latency normalisation, and synfire-chain emergence under spike-timing-dependent plasticity."
  }
];
---
<BaseLayout
  title="Research"
  description="Research themes, open-source projects, and talks by Hafsteinn Einarsson's group."
>
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">Research</h1>
    <p class="mt-3 text-ink-muted max-w-prose">
      My group works across five themes. Open-source projects and recent talks are below.
    </p>

    <section id="themes" class="mt-12 scroll-mt-20">
      <h2 class="text-2xl font-semibold text-ink">Themes</h2>
      <div class="mt-6 grid md:grid-cols-2 gap-4">
        {themes.map((t) => (
          <ThemeCard theme={t.code} title={t.title} body={t.body} anchor={t.code} />
        ))}
      </div>
    </section>

    <section id="projects" class="mt-16 scroll-mt-20">
      <h2 class="text-2xl font-semibold text-ink">Open-source projects</h2>
      <p class="mt-3 text-ink-muted text-sm max-w-prose">
        Datasets, models, and tools released by the group. Most live on Hugging Face or GitHub; see the linked publication for context.
      </p>
      <div class="mt-4 max-w-prose">
        {projects.map((p) => <ProjectCard {...p} />)}
      </div>
    </section>

    <section id="talks" class="mt-16 scroll-mt-20">
      <h2 class="text-2xl font-semibold text-ink">Talks &amp; outreach</h2>
      <ul class="mt-4 max-w-prose">
        {talks.map((t) => <TalkItem {...t} />)}
      </ul>
    </section>
  </section>
</BaseLayout>
```

**Step 2: Build + verify:**

```bash
npm run build
# Verify: dist/research/index.html exists; contains "Themes", "Open-source projects", "Talks", and 5 theme cards
ls dist/research/
```

**Step 3: Commit:**

```bash
git add src/pages/research/index.astro
git commit -m "Research page with themes, projects, and talks sections"
```

---

## Task 8: Build `/group/` page

**Goal:** Dedicated page for current PhDs (main supervisor + committee), current MSc, and recent MSc alumni.

**File:**
- Create: `src/pages/group/index.astro`

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import PersonCard from '~/components/PersonCard.astro';
import { getCollection } from 'astro:content';

type Role = 'phd-main' | 'phd-committee' | 'msc' | 'alumni-phd' | 'alumni-msc';

const all = (await getCollection('students')).map((s) => s.data);

const groups: Array<{ role: Role; label: string; description?: string }> = [
  {
    role: 'phd-main',
    label: 'PhD students (main supervisor)',
    description: 'Three PhDs working at the intersection of language modelling, bias evaluation, and applied vision.'
  },
  {
    role: 'phd-committee',
    label: 'PhD committee positions',
    description: 'Committee memberships across the University of Iceland and partner institutions.'
  },
  {
    role: 'msc',
    label: 'Current master’s students'
  },
  {
    role: 'alumni-msc',
    label: 'Recent MSc alumni'
  }
];

const roleLabel: Record<Role, string> = {
  'phd-main': 'PhD candidate',
  'phd-committee': 'PhD candidate',
  msc: 'MSc student',
  'alumni-phd': 'PhD alumnus',
  'alumni-msc': 'MSc alumnus'
};
---
<BaseLayout
  title="Group"
  description="Current and recent PhD and master's students supervised by Hafsteinn Einarsson."
>
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">Group</h1>
    <p class="mt-3 text-ink-muted max-w-prose">
      Current PhD and master's students, recent alumni, and PhD-committee positions.
    </p>

    {groups.map((g) => {
      const members = all.filter((s) => s.role === g.role);
      if (members.length === 0) return null;
      return (
        <section class="mt-12 max-w-prose">
          <h2 class="text-2xl font-semibold text-ink">{g.label}</h2>
          {g.description && <p class="mt-2 text-ink-muted">{g.description}</p>}
          <div class="mt-4">
            {members.map((m) => (
              <PersonCard
                name={m.name}
                role={roleLabel[m.role]}
                title={m.title}
                link={m.link}
                nowAt={m.nowAt}
              />
            ))}
          </div>
        </section>
      );
    })}
  </section>
</BaseLayout>
```

**Step 2: Build + verify:**

```bash
npm run build
ls dist/group/
```

**Step 3: Commit:**

```bash
git add src/pages/group/index.astro
git commit -m "Group page with PhDs, committee, MSc students, and alumni"
```

---

## Task 9: Build `/teaching/` page

**Goal:** Card per course.

**File:**
- Create: `src/pages/teaching/index.astro`

```astro
---
import BaseLayout from '~/components/BaseLayout.astro';
import CourseCard from '~/components/CourseCard.astro';
import { getCollection } from 'astro:content';

const courses = (await getCollection('teaching')).map((c) => c.data);
// Sort: MSc/PhD before BA; within group, alphabetic
const levelOrder: Record<typeof courses[number]['level'], number> = {
  phd: 0,
  msc: 1,
  mixed: 2,
  ba: 3
};
courses.sort((a, b) =>
  levelOrder[a.level] - levelOrder[b.level] || a.title.localeCompare(b.title)
);
---
<BaseLayout
  title="Teaching"
  description="Courses taught and developed by Hafsteinn Einarsson at the University of Iceland."
>
  <section class="max-w-page mx-auto px-6 py-12">
    <h1 class="text-display font-semibold tracking-tight text-ink">Teaching</h1>
    <p class="mt-3 text-ink-muted max-w-prose">
      Courses I currently teach or have developed at the University of Iceland. Roughly 300+ students per academic year across these courses.
    </p>
    <div class="mt-8 max-w-prose">
      {courses.map((c) => <CourseCard {...c} />)}
    </div>
  </section>
</BaseLayout>
```

**Step 2: Build + verify:**

```bash
npm run build
ls dist/teaching/
```

**Step 3: Commit:**

```bash
git add src/pages/teaching/index.astro
git commit -m "Teaching page with course cards"
```

---

## Task 10: Local smoke test

**Goal:** Verify all new pages render with content.

```bash
rm -rf dist .astro
npm run build
npm run preview &
sleep 3

for path in / /about/ /publications/ /cv/ /research/ /research/#themes /research/#projects /research/#talks /group/ /teaching/; do
  url="http://localhost:4321$path"
  # Strip the fragment for HTTP status check
  base="${url%#*}"
  code=$(curl -s -o /dev/null -w '%{http_code}' "$base")
  printf '%-50s %s\n' "$path" "$code"
done

curl -s http://localhost:4321/research/ > /tmp/research.html
echo "themes section: $(grep -c 'id="themes"' /tmp/research.html)"
echo "projects section: $(grep -c 'id="projects"' /tmp/research.html)"
echo "talks section: $(grep -c 'id="talks"' /tmp/research.html)"
echo "5 theme cards: $(grep -c 'Related publications' /tmp/research.html)"

curl -s http://localhost:4321/group/ > /tmp/group.html
echo "PhD section: $(grep -c 'PhD students (main supervisor)' /tmp/group.html)"
echo "Friðriksdóttir present: $(grep -c 'Friðriksdóttir' /tmp/group.html)"

curl -s http://localhost:4321/teaching/ > /tmp/teaching.html
echo "AI Lifecycle present: $(grep -c 'AI Lifecycle' /tmp/teaching.html)"
echo "Course cards: $(grep -c '<article' /tmp/teaching.html)"

# Verify the publications anchors actually exist now
curl -s http://localhost:4321/publications/ | grep -oE 'id="(nlp-is|cv-nat|clinical-ai|genetics|comp-neuro)"' | sort -u

pkill -f "astro preview" || true
```

Expect: all paths return 200, all themes/projects/talks anchors exist, all 5 publication anchors exist, course count matches the number of `teaching/*.yml` files.

If any check fails, fix before deploying.

Tag:

```bash
git tag phase-2-ready
```

---

## Task 11: Merge to master and deploy

```bash
git checkout master
git merge --no-ff phase-2-academic-depth -m "Merge Phase 2: research, group, teaching pages"
git push origin master
```

This triggers the GitHub Actions workflow established in Phase 1. Watch the run:

```bash
gh run list --repo Haffi112/blog --limit 3
gh run watch <run-id> --repo Haffi112/blog --exit-status
```

Verify the live URLs after the deploy:

```bash
sleep 10
for path in /research/ /group/ /teaching/ /research/#themes; do
  base="https://haffi112.github.io${path%#*}"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$base")
  printf '%-50s %s\n' "$path" "$code"
done
```

Tag the milestone:

```bash
git tag phase-2-shipped
git push origin phase-2-ready phase-2-shipped
```

---

## What's done after Phase 2

- `/research/`, `/group/`, `/teaching/` live
- All four content collections populated (`teaching`, `students`, `projects`, `talks` — `news` was done in Phase 1)
- 5 new components in `src/components/`
- Publications page now has anchor IDs for deep links
- The site nav (built in Phase 1) is now fully functional — every nav link resolves to a real page

**Author review checklist for Phase 2:**
- Each student's `nowAt`, `title`, and `link` is accurate
- Course descriptions read true
- Project list isn't missing anything important
- Talks list isn't padded with things you didn't actually give
- Theme framing paragraphs read true

**Out of scope (Phase 3 / Phase 4):**
- Blog migration (Phase 3)
- Simulations port (Phase 3)
- SEO meta, sitemap, JSON-LD (Phase 4)
- Accessibility audit (Phase 4)
- Performance budget (Phase 4)
