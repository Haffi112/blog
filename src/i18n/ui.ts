/**
 * Every UI string on the site, in English and Icelandic.
 *
 * `en` is the reference shape; `is` is typed as `Dict`, so TypeScript fails
 * the build if a key is missing (or extra) in the Icelandic dictionary.
 * Strings that take a number are functions, so plural rules stay with the
 * language that needs them.
 *
 * Long prose with inline links (About page, panel copy) lives in the view
 * components as an `lang === 'is' ? … : …` branch instead of being split
 * into fragments here. Content entries (news, talks, projects, courses)
 * carry their own optional `*_is` fields — see src/content/config.ts.
 */

export const languages = {
  en: { name: 'English', short: 'EN', locale: 'en-GB', og: 'en_GB', hreflang: 'en' },
  is: { name: 'Íslenska', short: 'IS', locale: 'is-IS', og: 'is_IS', hreflang: 'is' }
} as const;

export type Lang = keyof typeof languages;

/* Icelandic plural: 1, 21, 31 … take the singular, 11 does not. */
const isOne = (n: number) => new Intl.PluralRules('is-IS').select(n) === 'one';

const en = {
  meta: {
    description:
      'Hafsteinn Einarsson — Associate Professor at the University of Iceland and Principal Scientist at Amgen deCODE.',
    skipToContent: 'Skip to content'
  },
  nav: {
    research: 'Research',
    publications: 'Publications',
    teaching: 'Teaching',
    group: 'Group',
    writing: 'Writing',
    about: 'About',
    cv: 'CV ↓',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu'
  },
  theme: {
    switch: 'Switch theme',
    light: 'Light',
    dark: 'Dark'
  },
  footer: {
    blurb:
      'Machine learning research at the University of Iceland and Amgen deCODE: language, vision, clinical AI, and human genetics.',
    explore: 'Explore',
    elsewhere: 'Elsewhere',
    sectionsLabel: 'Site sections',
    profilesLabel: 'Profiles elsewhere',
    downloadCv: 'Download CV ↓'
  },
  hero: {
    eyebrow: 'Machine learning research',
    affiliation: [
      'Associate Professor and Head of Faculty, University of Iceland',
      'Principal Scientist, Amgen deCODE'
    ],
    bioBefore:
      'I lead a research group working on language technology for Icelandic and Faroese, with projects in computer vision for the natural sciences, clinical AI and human genetics. I also talk about AI in public a lot, most recently in a ',
    bioLink: 'seven-part video series',
    bioAfter: '.',
    ctaResearch: 'Research →',
    ctaPublications: 'Publications →',
    ctaCv: 'Download CV ↓'
  },
  perc: {
    about: 'About this animation and its controls',
    hint: 'Click to ignite. Hold to widen the ignition front.',
    threshold: 'Threshold',
    thresholdAria: (r: number) => `Threshold ${r}`,
    inhibition: 'Inhibition',
    randomDelays: 'Random delays',
    ambient: 'Ambient waves',
    sound: 'Sound',
    ignite: 'Ignite a cascade',
    newGraph: 'New graph',
    hudTitle: 'bootstrap percolation',
    firing: 'firing',
    lastCascade: 'last cascade',
    best: 'your best',
    /* Templates filled in by the inline script: {n} {m} {s}. */
    msgIdle: 'click anywhere to start a cascade',
    msgPercolated: 'percolated: half the graph in {s} s',
    firingOf: '{n} of {m}',
    /* Passed to the script rather than left to Intl: browsers with trimmed
       ICU data (some headless/mobile builds) have no Icelandic locale and
       would silently print "7.7". */
    decimal: '.'
  },
  home: {
    title: 'Home',
    news: 'News',
    selected: 'Selected publications',
    all: 'All',
    newPost: 'New post: '
  },
  series: {
    heading: 'Video series',
    figAlt:
      "Cartoon of Hafsteinn in a University of Iceland T-shirt, waving in front of the university's main building",
    figCaption: 'The host of the series, drawn by an image model from four photos of me.',
    description:
      'It is hard to picture how AI could actually harm us, so I made seven short films that each retell one serious argument, from an experiment in which an AI tried to blackmail an executive to a future where we lose control without noticing. I wrote the scripts. The images, music and my voice are generated with AI.',
    tiktok: 'Watch on TikTok',
    makingOf: 'How I made it'
  },
  research: {
    title: 'Research',
    description: "Research themes, open-source projects, and talks by Hafsteinn Einarsson's group.",
    lede: 'My group works across six themes. Below them are the datasets and models we have released, my public writing and interviews about AI, and talks.',
    themes: 'Themes',
    relatedPubs: 'Related publications →',
    projects: 'Open-source projects',
    projectsIntro:
      'Datasets, models, and tools released by the group. Most live on Hugging Face or GitHub; see the linked publication for context.',
    media: 'In the media',
    showEarlier: (n: number) => `Show ${n} earlier appearances`,
    hideEarlier: 'Hide earlier appearances',
    talks: 'Talks & outreach',
    talksSummary: (n: number, since: number) =>
      `${n} talks since ${since}, from research venues to schools, hospitals and professional associations.`,
    talkCount: (n: number) => `${n} ${n === 1 ? 'talk' : 'talks'}`
  },
  media: {
    types: {
      article: 'Article',
      opinion: 'Op-ed',
      explainer: 'Explainer',
      radio: 'Radio',
      podcast: 'Podcast',
      livestream: 'Livestream',
      tv: 'Television',
      video: 'Video'
    }
  },
  talkTypes: {
    invited: 'invited',
    keynote: 'keynote',
    outreach: 'outreach',
    workshop: 'workshop'
  },
  project: {
    status: { active: 'active', maintenance: 'maintenance', archived: 'archived' },
    links: { huggingface: 'Hugging Face', repo: 'Code', dataset: 'Dataset', site: 'Site' }
  },
  pub: {
    links: {
      doi: 'DOI',
      arxiv: 'arXiv',
      pdf: 'PDF',
      code: 'Code',
      huggingface: 'Hugging Face',
      dataset: 'Dataset'
    },
    cite: 'Cite',
    copied: 'BibTeX copied',
    /** Shown when the clipboard is unavailable and the BibTeX is revealed instead. */
    select: 'Select and copy the BibTeX below'
  },
  publications: {
    title: 'Publications',
    description: 'Publications by Hafsteinn Einarsson — themed list with summaries and links.',
    count: (n: number) => `${n} publications`,
    lastUpdated: 'last updated',
    /** Shown under the header on pages whose summaries are not in the page language. */
    languageNote: '',
    authorship: 'Authorship convention',
    authorshipBody:
      'In NLP and ML venues, last author typically denotes the senior/PI position; first author is the lead executor (often a student I supervise). In cardiology, food science, and human genetics, the author position has different meanings — typically lead author is the primary investigator and middle authors contribute data, methods, or analysis.',
    selected: 'Selected',
    all: 'All publications'
  },
  teaching: {
    title: 'Teaching',
    description: 'Courses taught and developed by Hafsteinn Einarsson at the University of Iceland.',
    lede: 'Courses I currently teach or have developed at the University of Iceland. More than 300 students a year take them.'
  },
  course: {
    level: { bsc: 'BSc', msc: 'MSc', phd: 'PhD', mixed: 'BSc / MSc' },
    language: { english: 'English', icelandic: 'Icelandic', mixed: 'Mixed' },
    syllabus: 'Syllabus',
    taught: 'Taught:',
    semester: (s: string) => s
  },
  group: {
    title: 'Group',
    description: "Current and recent PhD and master's students supervised by Hafsteinn Einarsson.",
    lede: "Current PhD and master's students, recent alumni, and PhD-committee positions.",
    sections: {
      'phd-main': {
        label: 'PhD students (main supervisor)',
        description:
          'Three PhDs working at the intersection of language modelling, bias evaluation, and applied vision.'
      },
      'phd-committee': {
        label: 'PhD committee positions',
        description: 'Committee memberships across the University of Iceland and partner institutions.'
      },
      msc: { label: 'Current master’s students', description: '' },
      'alumni-phd': { label: 'PhD alumni', description: '' },
      'alumni-phd-committee': {
        label: 'PhD alumni (committee)',
        description: 'Doctoral graduates whose committees I served on.'
      },
      'alumni-msc': { label: 'Recent MSc alumni', description: '' }
    },
    roles: {
      'phd-main': 'PhD candidate',
      'phd-committee': 'PhD candidate',
      msc: 'MSc student',
      'alumni-phd': 'PhD graduate',
      'alumni-phd-committee': 'PhD graduate',
      'alumni-msc': 'MSc graduate'
    },
    mainSupervisor: 'Main supervisor:'
  },
  writing: {
    title: 'Writing',
    description: 'Notes on building things with AI, bootstrap percolation, and computational neuroscience.',
    lede: 'Notes on things I build with AI, and the occasional detour into the maths of networks. The 2016 posts are from my PhD years.',
    minRead: (n: number) => `${n} min read`,
    /** Shown on pages whose posts are not in the page language. */
    languageNote: '',
    newsJump: 'News and announcements',
    elsewhereTitle: 'Elsewhere',
    elsewhereLede: 'Op-eds and explainers I have written for other outlets, mostly in Icelandic.',
    newsTitle: 'News',
    newsLede: 'Papers, grants, talks and interviews, newest first. New posts are listed above.'
  },
  post: {
    back: 'All writing',
    older: 'Older',
    newer: 'Newer',
    references: 'References',
    tags: 'Tags',
    /** Shown on a translated post, linking to the original. */
    original: 'Originally written in English',
    moreWriting: 'More writing',
    author: 'Hafsteinn Einarsson'
  },
  about: {
    title: 'About',
    description: 'About Hafsteinn Einarsson — research, group, and contact.'
  },
  cv: {
    title: 'CV',
    heading: 'Curriculum Vitae',
    description: 'Curriculum Vitae — Hafsteinn Einarsson.',
    lede: "Two versions, both generated from this site's content via a Typst template that mirrors the site's typography and palette.",
    short: 'Short CV (2 pages) ↓',
    long: 'Full CV (all publications) ↓',
    embedLabel: "Hafsteinn Einarsson's short CV",
    fallback: 'Your browser cannot display the embedded PDF.',
    fallbackLink: 'Download the short CV here.'
  },
  simulations: {
    title: 'Simulations',
    description:
      "Standalone interactive d3.js simulations from Hafsteinn Einarsson's PhD years on bootstrap percolation and neural dynamics.",
    sims: {
      standard: 'Synchronous bootstrap percolation',
      dscaling: 'Local homeostatic plasticity',
      izhikevich: 'NMDA enhanced, conductance based Izhikevich neuron',
      dice: 'Dice parser'
    }
  }
};

export type Dict = typeof en;

const is: Dict = {
  meta: {
    description:
      'Hafsteinn Einarsson – dósent við Háskóla Íslands og vísindamaður hjá Íslenskri erfðagreiningu.',
    skipToContent: 'Fara beint í efnið'
  },
  nav: {
    research: 'Rannsóknir',
    publications: 'Ritaskrá',
    teaching: 'Kennsla',
    group: 'Hópurinn',
    writing: 'Skrif',
    about: 'Um mig',
    cv: 'Ferilskrá ↓',
    openMenu: 'Opna valmynd',
    closeMenu: 'Loka valmynd'
  },
  theme: {
    switch: 'Skipta um útlit',
    light: 'Ljóst',
    dark: 'Dökkt'
  },
  footer: {
    blurb:
      'Rannsóknir í vélrænu námi við Háskóla Íslands og hjá Íslenskri erfðagreiningu: máltækni, tölvusjón, klínísk gervigreind og mannerfðafræði.',
    explore: 'Á síðunni',
    elsewhere: 'Annars staðar',
    sectionsLabel: 'Hlutar síðunnar',
    profilesLabel: 'Annars staðar á netinu',
    downloadCv: 'Sækja ferilskrá (á ensku) ↓'
  },
  hero: {
    eyebrow: 'Rannsóknir í vélrænu námi',
    affiliation: [
      'Dósent og deildarforseti, Háskóli Íslands',
      'Vísindamaður, Íslensk erfðagreining'
    ],
    bioBefore:
      'Ég stýri rannsóknarhópi sem vinnur að máltækni fyrir íslensku og færeysku, auk verkefna í tölvusjón fyrir náttúruvísindi, klínískri gervigreind og mannerfðafræði. Ég fjalla líka mikið um gervigreind á opinberum vettvangi, nú síðast í ',
    bioLink: 'sjö þátta myndbandaröð',
    bioAfter: '.',
    ctaResearch: 'Rannsóknir →',
    ctaPublications: 'Ritaskrá →',
    ctaCv: 'Ferilskrá ↓'
  },
  perc: {
    about: 'Um þessa hreyfimynd og stillingar hennar',
    hint: 'Smelltu til að hefja keðjuverkun. Haltu inni til að stækka svæðið sem kviknar.',
    threshold: 'Þröskuldur',
    thresholdAria: (r: number) => `Þröskuldur ${r}`,
    inhibition: 'Hömlun',
    randomDelays: 'Slembnar tafir',
    ambient: 'Sjálfvirkar bylgjur',
    sound: 'Hljóð',
    ignite: 'Hefja keðjuverkun',
    newGraph: 'Nýtt net',
    hudTitle: 'bootstrap percolation',
    firing: 'virkir',
    lastCascade: 'síðasta keðjuverkun',
    best: 'þitt met',
    msgIdle: 'smelltu hvar sem er til að hefja keðjuverkun',
    msgPercolated: 'hálft netið kviknaði á {s} s',
    firingOf: '{n} af {m}',
    decimal: ','
  },
  home: {
    title: 'Forsíða',
    news: 'Fréttir',
    selected: 'Valdar greinar',
    all: 'Allar',
    newPost: 'Ný færsla: '
  },
  series: {
    heading: 'Myndbandaröð',
    figAlt:
      'Teiknuð mynd af Hafsteini í bol merktum Háskóla Íslands þar sem hann veifar fyrir framan Aðalbyggingu háskólans',
    figCaption: 'Kynnir þáttanna, teiknaður af myndlíkani eftir fjórum ljósmyndum af mér.',
    description:
      'Það er erfitt að sjá fyrir sér hvernig gervigreind gæti í raun skaðað okkur, svo ég gerði sjö stuttmyndir sem endursegja hver eina alvarlega röksemdafærslu, allt frá tilraun þar sem gervigreind reyndi að kúga stjórnanda til framtíðar þar sem við missum stjórnina án þess að taka eftir því. Ég skrifaði handritin. Myndirnar, tónlistin og röddin mín eru búnar til með gervigreind.',
    tiktok: 'Horfa á TikTok',
    makingOf: 'Svona gerði ég þær'
  },
  research: {
    title: 'Rannsóknir',
    description:
      'Rannsóknarsvið, opin gögn og hugbúnaður, fjölmiðlaumfjöllun og erindi rannsóknarhóps Hafsteins Einarssonar.',
    lede: 'Hópurinn minn vinnur á sex sviðum. Hér fyrir neðan eru líka gagnasöfnin og líkönin sem við höfum gefið út, greinar mínar og viðtöl um gervigreind og erindi sem ég hef haldið.',
    themes: 'Rannsóknarsvið',
    relatedPubs: 'Tengdar greinar →',
    projects: 'Opin gögn og hugbúnaður',
    projectsIntro:
      'Gagnasöfn, líkön og tól sem hópurinn hefur gefið út. Flest eru á Hugging Face eða GitHub og nánar er fjallað um þau í tengdum greinum.',
    media: 'Í fjölmiðlum',
    showEarlier: (n: number) => `Sýna ${n} eldri viðtöl og greinar`,
    hideEarlier: 'Fela eldri viðtöl og greinar',
    talks: 'Erindi og kynningar',
    talksSummary: (n: number, since: number) =>
      `${n} erindi frá árinu ${since}, á vísindaráðstefnum, í skólum, á sjúkrahúsum og hjá fagfélögum.`,
    talkCount: (n: number) => `${n} erindi`
  },
  media: {
    types: {
      article: 'Frétt',
      opinion: 'Aðsend grein',
      explainer: 'Fræðsluefni',
      radio: 'Útvarp',
      podcast: 'Hlaðvarp',
      livestream: 'Bein útsending',
      tv: 'Sjónvarp',
      video: 'Myndband'
    }
  },
  talkTypes: {
    invited: 'boðserindi',
    keynote: 'aðalerindi',
    outreach: 'fræðsla',
    workshop: 'vinnustofa'
  },
  project: {
    status: { active: 'virkt', maintenance: 'í viðhaldi', archived: 'í geymslu' },
    links: { huggingface: 'Hugging Face', repo: 'Kóði', dataset: 'Gagnasafn', site: 'Vefsíða' }
  },
  pub: {
    links: {
      doi: 'DOI',
      arxiv: 'arXiv',
      pdf: 'PDF',
      code: 'Kóði',
      huggingface: 'Hugging Face',
      dataset: 'Gagnasafn'
    },
    cite: 'Vitna í',
    copied: 'BibTeX afritað',
    select: 'Veldu og afritaðu BibTeX-færsluna hér fyrir neðan'
  },
  publications: {
    title: 'Ritaskrá',
    description: 'Ritaskrá Hafsteins Einarssonar, flokkuð eftir rannsóknarsviðum, með samantektum og tenglum.',
    count: (n: number) => `${n} ${isOne(n) ? 'grein' : 'greinar'}`,
    lastUpdated: 'síðast uppfært',
    languageNote: 'Titlar eru á frummálinu.',
    authorship: 'Um röð höfunda',
    authorshipBody:
      'Í máltækni og vélrænu námi er síðasti höfundur yfirleitt sá sem stýrir verkefninu og fyrsti höfundur sá sem vann verkið að mestu (oft nemandi sem ég leiðbeini). Í hjartalækningum, matvælafræði og mannerfðafræði hefur röðin aðra merkingu: þar er fyrsti höfundur yfirleitt sá sem leiðir rannsóknina og höfundar í miðjunni leggja til gögn, aðferðir eða greiningu.',
    selected: 'Valdar greinar',
    all: 'Allar greinar'
  },
  teaching: {
    title: 'Kennsla',
    description: 'Námskeið sem Hafsteinn Einarsson kennir og hefur byggt upp við Háskóla Íslands.',
    lede: 'Námskeið sem ég kenni eða hef byggt upp við Háskóla Íslands. Yfir 300 nemendur sitja þau á hverju ári.'
  },
  course: {
    level: { bsc: 'Grunnnám', msc: 'Framhaldsnám', phd: 'Doktorsnám', mixed: 'Grunn- og framhaldsnám' },
    language: { english: 'Kennt á ensku', icelandic: 'Kennt á íslensku', mixed: 'Kennt á íslensku og ensku' },
    syllabus: 'Kennsluskrá',
    taught: 'Kennt:',
    semester: (s: string) => s.replace(/^Spring\b/, 'vor').replace(/^Fall\b/, 'haust')
  },
  group: {
    title: 'Rannsóknarhópurinn',
    description: 'Doktors- og meistaranemar sem Hafsteinn Einarsson leiðbeinir eða hefur leiðbeint.',
    lede: 'Núverandi doktors- og meistaranemar, nýlega brautskráðir nemendur og seta í doktorsnefndum.',
    sections: {
      'phd-main': {
        label: 'Doktorsnemar (aðalleiðbeinandi)',
        description:
          'Þrír doktorsnemar sem vinna á mótum mállíkana, mats á bjögun og hagnýtrar tölvusjónar.'
      },
      'phd-committee': {
        label: 'Seta í doktorsnefndum',
        description: 'Doktorsnefndir við Háskóla Íslands og samstarfsstofnanir.'
      },
      msc: { label: 'Núverandi meistaranemar', description: '' },
      'alumni-phd': { label: 'Brautskráðir doktorar', description: '' },
      'alumni-phd-committee': {
        label: 'Brautskráðir doktorar (doktorsnefnd)',
        description: 'Doktorar sem ég sat í doktorsnefnd hjá.'
      },
      'alumni-msc': { label: 'Nýlega brautskráðir meistaranemar', description: '' }
    },
    roles: {
      'phd-main': 'Doktorsnemi',
      'phd-committee': 'Doktorsnemi',
      msc: 'Meistaranemi',
      'alumni-phd': 'Lauk doktorsprófi',
      'alumni-phd-committee': 'Lauk doktorsprófi',
      'alumni-msc': 'Lauk meistaraprófi'
    },
    mainSupervisor: 'Aðalleiðbeinandi:'
  },
  writing: {
    title: 'Skrif',
    description:
      'Pistlar um að smíða hluti með gervigreind, bootstrap percolation og reiknileg taugavísindi.',
    lede: 'Pistlar um það sem ég smíða með gervigreind og stöku útúrdúrar í stærðfræði neta. Færslurnar frá 2016 eru frá doktorsárunum.',
    minRead: (n: number) => `${n} mín. lestur`,
    languageNote: 'Sumar færslur eru enn bara til á ensku.',
    newsJump: 'Fréttir og tilkynningar',
    elsewhereTitle: 'Annars staðar',
    elsewhereLede: 'Pistlar og fræðsluefni sem ég hef skrifað fyrir aðra miðla.',
    newsTitle: 'Fréttir',
    newsLede: 'Greinar, styrkir, erindi og viðtöl, nýjast efst. Nýjar færslur eru taldar upp hér fyrir ofan.'
  },
  post: {
    back: 'Öll skrif',
    older: 'Eldri',
    newer: 'Nýrri',
    references: 'Heimildir',
    tags: 'Efnisorð',
    original: 'Upprunalega skrifað á ensku',
    moreWriting: 'Fleiri skrif',
    author: 'Hafsteinn Einarsson'
  },
  about: {
    title: 'Um mig',
    description: 'Um Hafstein Einarsson: rannsóknir, rannsóknarhópur og samskiptaupplýsingar.'
  },
  cv: {
    title: 'Ferilskrá',
    heading: 'Ferilskrá',
    description: 'Ferilskrá Hafsteins Einarssonar (á ensku).',
    lede: 'Tvær útgáfur, báðar unnar sjálfvirkt úr efni þessarar síðu með Typst-sniðmáti sem fylgir letri og litum síðunnar. Ferilskráin er á ensku.',
    short: 'Stutt ferilskrá (2 síður) ↓',
    long: 'Ítarleg ferilskrá (allar greinar) ↓',
    embedLabel: 'Stutt ferilskrá Hafsteins Einarssonar',
    fallback: 'Vafrinn þinn getur ekki birt PDF-skjalið hér.',
    fallbackLink: 'Sæktu stuttu ferilskrána hér.'
  },
  simulations: {
    title: 'Hermanir',
    description:
      'Gagnvirkar d3.js-hermanir frá doktorsárum Hafsteins Einarssonar um bootstrap percolation og virkni taugakerfa.',
    sims: {
      standard: 'Samstillt bootstrap percolation',
      dscaling: 'Staðbundin samvægismýkt',
      izhikevich: 'Izhikevich-taugungur með leiðnilíkani og NMDA-styrkingu',
      dice: 'Teningaþáttari'
    }
  }
};

export const ui: Record<Lang, Dict> = { en, is };

/**
 * Talk locations are a small closed vocabulary, so their Icelandic names
 * live here rather than in a `location_is` field on every talk. Anything
 * not listed falls back to the English name.
 */
export const places: Record<string, string> = {
  'Reykjavik, Iceland': 'Reykjavík',
  'Seltjarnarnes, Iceland': 'Seltjarnarnes',
  'Hvanneyri, Iceland': 'Hvanneyri',
  'Bifröst, Iceland': 'Bifröst',
  'Akureyri, Iceland': 'Akureyri',
  'Marseille, France': 'Marseille, Frakklandi',
  'Mexico City, Mexico': 'Mexíkóborg, Mexíkó'
};
