import type { Theme } from './publications.schema';
import type { Lang } from '~/i18n/ui';

/**
 * The six research themes, in display order, in both languages.
 *
 *  - `title` / `body`: the theme cards on /research/
 *  - `heading`: the section headings on /publications/
 *  - `tag`: the short mono label above each publication (ThemeTag)
 *
 * The CV keeps its own English labels in scripts/generate-cv.ts.
 */
type L10n = Record<Lang, string>;

export interface ThemeText {
  code: Theme;
  title: L10n;
  body: L10n;
  heading: L10n;
  tag: L10n;
}

export const themes: ThemeText[] = [
  {
    code: 'nlp-is',
    title: {
      en: 'NLP for Icelandic and other Germanic languages',
      is: 'Máltækni fyrir íslensku og önnur germönsk mál'
    },
    body: {
      en: 'Language models, datasets, and evaluation resources for Icelandic, Faroese, and other under-resourced Germanic languages. The IceBERT family, FoQA, the gender-bias evaluation set, the Hotter and Colder sentiment corpus, and a strand of work on prompt engineering and fine-tuning for low-resource machine translation.',
      is: 'Mállíkön, gagnasöfn og matsgögn fyrir íslensku, færeysku og önnur germönsk mál sem hafa lítið af stafrænum málföngum. Þar má nefna IceBERT-líkönin, FoQA, matsgagnasafn fyrir kynjabjögun, Hotter and Colder-málheildina fyrir tilfinningagreiningu og rannsóknir á fyrirmælagerð og fínstillingu fyrir vélþýðingar á tungumálum með lítið af gögnum.'
    },
    heading: {
      en: 'NLP for Icelandic and Germanic languages',
      is: 'Máltækni fyrir íslensku og önnur germönsk mál'
    },
    tag: { en: 'NLP for Icelandic & Germanic', is: 'Íslensk og germönsk máltækni' }
  },
  {
    code: 'cv-nat',
    title: {
      en: 'Computer vision for natural and agricultural sciences',
      is: 'Tölvusjón í náttúru- og landbúnaðarvísindum'
    },
    body: {
      en: 'Applied vision in collaboration with the Marine and Freshwater Research Institute, agricultural science groups, and food-science partners. Few-shot otolith aging, multispectral nematode segmentation in Atlantic cod, gait classification for five-gaited horses, drought-response analysis on subarctic grasslands, and vision-language features for automated fish monitoring.',
      is: 'Hagnýt tölvusjón í samstarfi við Hafrannsóknastofnun, rannsóknarhópa í landbúnaðarvísindum og samstarfsaðila í matvælafræði. Aldursgreining út frá kvörnum með fáum dæmum, fjölrófsgreining á hringormum í þorski, flokkun gangtegunda fimmgangshesta, greining á viðbrögðum norðlægs graslendis við þurrki og mynd- og textaeinkenni fyrir sjálfvirka vöktun á fiski.'
    },
    heading: {
      en: 'Machine learning for the natural sciences',
      is: 'Vélrænt nám í náttúruvísindum'
    },
    tag: { en: 'Machine Learning · Natural Sciences', is: 'Vélrænt nám · náttúruvísindi' }
  },
  {
    code: 'clinical-ai',
    title: {
      en: 'Clinical AI and cardiology',
      is: 'Klínísk gervigreind og hjartalækningar'
    },
    body: {
      en: 'Joint work with the Icelandic National Hospital on automated clinical coding (ICD-10 from discharge summaries with Icelandic BERT models) and on the Icelandic Heart Failure Registry. Several international surveys on heart-failure management with preserved ejection fraction (HFpEF).',
      is: 'Samstarf við Landspítala um sjálfvirka kóðun sjúkraskráa (ICD-10-kóðun útskriftarbréfa með íslenskum BERT-líkönum) og um íslensku hjartabilunarskrána. Einnig nokkrar alþjóðlegar kannanir á meðferð hjartabilunar með varðveittu útfallsbroti (HFpEF).'
    },
    heading: {
      en: 'Clinical AI and cardiology',
      is: 'Klínísk gervigreind og hjartalækningar'
    },
    tag: { en: 'Clinical AI', is: 'Klínísk gervigreind' }
  },
  {
    code: 'genetics',
    title: {
      en: 'Human genetics and computational biology',
      is: 'Mannerfðafræði og reiknilíffræði'
    },
    body: {
      en: 'Research-scientist position at Amgen deCODE. Genome-wide-association work on common conditions where the analysis intersects with NLP-style methods, including a Nature Communications paper on BMI-associated variants and disease risk.',
      is: 'Starf mitt sem vísindamaður hjá Íslenskri erfðagreiningu. Víðtækar erfðamengisrannsóknir (GWAS) á algengum sjúkdómum þar sem greiningin skarast við aðferðir úr máltækni, meðal annars grein í Nature Communications um breytileika sem tengjast líkamsþyngdarstuðli og sjúkdómsáhættu.'
    },
    heading: {
      en: 'Human genetics and computational biology',
      is: 'Mannerfðafræði og reiknilíffræði'
    },
    tag: { en: 'Genetics', is: 'Erfðafræði' }
  },
  {
    code: 'comp-neuro',
    title: {
      en: 'Computational neuroscience',
      is: 'Reiknileg taugavísindi'
    },
    body: {
      en: 'PhD-era and ongoing work on emergent behaviour in models of cortical networks: fast Hebbian spike-latency normalisation, synfire-chain emergence under spike-timing-dependent plasticity, and high-capacity one-shot association learning.',
      is: 'Rannsóknir frá doktorsárunum, sem standa enn, á því hvernig hegðun sprettur fram í líkönum af tauganetum heilabarkar: hröð Hebb-stöðlun á töf taugaboða, myndun synfire-keðja með tímaháðri taugamótamýkt (STDP) og tengslanám út frá einu dæmi með mikilli geymslugetu.'
    },
    heading: {
      en: 'Computational neuroscience',
      is: 'Reiknileg taugavísindi'
    },
    tag: { en: 'Computational Neuroscience', is: 'Reiknileg taugavísindi' }
  },
  {
    code: 'discrete-math',
    title: {
      en: 'Discrete mathematics and probabilistic combinatorics',
      is: 'Strjál stærðfræði og líkindafræðileg fléttufræði'
    },
    body: {
      en: 'Rigorous results on random processes in graphs: bootstrap percolation with inhibition, connectivity thresholds for bounded-size Achlioptas rules, and runtime analysis of the (1+1) evolutionary algorithm on the linear hidden subset problem.',
      is: 'Stærðfræðilega sannaðar niðurstöður um slembiferli á netum: bootstrap percolation með hömlun, samhengisþröskuldar fyrir Achlioptas-reglur af takmarkaðri stærð og greining á keyrslutíma (1+1)-þróunarreikniritsins á línulega falda hlutmengisverkefninu.'
    },
    heading: {
      en: 'Discrete mathematics and probabilistic combinatorics',
      is: 'Strjál stærðfræði og líkindafræðileg fléttufræði'
    },
    tag: { en: 'Discrete Mathematics', is: 'Strjál stærðfræði' }
  }
];

export const themeByCode = Object.fromEntries(themes.map((t) => [t.code, t])) as Record<
  Theme,
  ThemeText
>;
