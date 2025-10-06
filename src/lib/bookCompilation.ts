// Advanced Book Compilation System for Academic Publication
import { InscriptionShastra } from '@/data/inscriptions/interfaces';
import { generateCitation, generateBibliography, CitationStyle } from './academicCitation';

export interface BookChapter {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  content: InscriptionShastra[];
  introduction: string;
  conclusion: string;
  bibliography: string[];
  wordCount: number;
  status: 'draft' | 'review' | 'approved' | 'published';
  lastModified: Date;
}

export interface BookVolume {
  id: string;
  title: string;
  subtitle: string;
  editors: string[];
  chapters: BookChapter[];
  introduction: string;
  targetWordCount: number;
  publicationDate: string;
  publisher: string;
  isbn?: string;
  doi?: string;
}

export interface CompilationSettings {
  citationStyle: CitationStyle;
  includeTransliterations: boolean;
  includeSanskritTerms: boolean;
  generateIndex: boolean;
  includeGlossary: boolean;
  exportFormat: 'markdown' | 'latex' | 'docx' | 'pdf';
  academicLevel: 'undergraduate' | 'graduate' | 'research' | 'popular';
}

// Citation generator
export const generateInTextCitation = (
  inscription: InscriptionShastra,
  style: CitationStyle = 'dharmic'
): string => {
  return generateCitation(inscription, style);
};

// Chapter outline generator
export const generateChapterOutline = (
  inscriptions: InscriptionShastra[],
  criteria: 'region' | 'period' | 'script' | 'theme'
): string[] => {
  const outline: string[] = [];

  switch (criteria) {
    case 'region':
      const regions = [...new Set(inscriptions.map(i => i.location.region))];
      regions.forEach(region => {
        outline.push(`Inscriptions from ${region}`);
        const regionInscriptions = inscriptions.filter(i => i.location.region === region);
        regionInscriptions.forEach(inscription => {
          outline.push(`- ${inscription.title}`);
        });
      });
      break;
    case 'period':
      const periods = [...new Set(inscriptions.map(i => i.period.dynasty))];
      periods.forEach(period => {
        outline.push(`Inscriptions from the ${period} Period`);
        const periodInscriptions = inscriptions.filter(i => i.period.dynasty === period);
        periodInscriptions.forEach(inscription => {
          outline.push(`- ${inscription.title}`);
        });
      });
      break;
    case 'script':
      const scripts = [...new Set(inscriptions.flatMap(i => i.scripts.map(s => s.scriptType)))];
      scripts.forEach(script => {
        outline.push(`Inscriptions in the ${script} Script`);
        const scriptInscriptions = inscriptions.filter(i =>
          i.scripts.some(s => s.scriptType === script)
        );
        scriptInscriptions.forEach(inscription => {
          outline.push(`- ${inscription.title}`);
        });
      });
      break;
    case 'theme':
      const themes = [...new Set(inscriptions.map(i => i.tags).flat())];
      themes.forEach(theme => {
        outline.push(`Inscriptions related to ${theme}`);
        const themeInscriptions = inscriptions.filter(i => i.tags.includes(theme));
        themeInscriptions.forEach(inscription => {
          outline.push(`- ${inscription.title}`);
        });
      });
      break;
    default:
      outline.push('Thematic Inscription Collection');
      inscriptions.forEach(inscription => {
        outline.push(`- ${inscription.title}`);
      });
  }

  return outline;
};

// Glossary generator
export const generateGlossary = (inscriptions: InscriptionShastra[]): { [term: string]: string } => {
  const glossary: { [term: string]: string } = {};

  inscriptions.forEach(inscription => {
    inscription.tags.forEach(tag => {
      glossary[tag] = `Definition of ${tag} from inscription ${inscription.title}`;
    });
  });

  return glossary;
};

// Index generator
export const generateIndex = (inscriptions: InscriptionShastra[]): string[] => {
  const index: string[] = [];

  inscriptions.forEach(inscription => {
    index.push(inscription.title);
    index.push(inscription.location.ancient);
    index.push(inscription.location.modern);
    index.push(inscription.period.dynasty);
    inscription.scripts.forEach(script => {
      index.push(script.scriptType);
    });
  });

  return [...new Set(index)];
};

// Timeline generator
export const generateTimeline = (inscriptions: InscriptionShastra[]): { year: number; event: string }[] => {
  const timeline: { year: number; event: string }[] = [];

  inscriptions.forEach(inscription => {
    timeline.push({
      year: parseInt(inscription.period.dating.approximate.split(' ')[0]),
      event: inscription.title
    });
  });

  return timeline.sort((a, b) => a.year - b.year);
};

// Map data generator
export const generateMapData = (inscriptions: InscriptionShastra[]): { location: string; count: number }[] => {
  const mapData: { location: string; count: number }[] = [];

  const locations: string[] = inscriptions.map(inscription => inscription.location.modern);

  const locationCounts: { [location: string]: number } = locations.reduce((acc, location) => {
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  for (const location in locationCounts) {
    mapData.push({ location, count: locationCounts[location] });
  }

  return mapData;
};

// Book compilation management
export class BookCompilationManager {
  private volumes: BookVolume[] = [];
  private settings: CompilationSettings;

  constructor(settings: CompilationSettings) {
    this.settings = settings;
  }

  // Add inscription to compilation queue
  addToCompilation(inscription: InscriptionShastra, chapterId?: string): void {
    if (chapterId) {
      this.addToExistingChapter(inscription, chapterId);
    } else {
      this.createNewChapter(inscription);
    }
  }

  // Create chapter from inscription group
  createChapterFromGroup(
    inscriptions: InscriptionShastra[], 
    groupingCriteria: 'region' | 'period' | 'script' | 'theme'
  ): BookChapter {
    const groupTitle = this.generateGroupTitle(inscriptions, groupingCriteria);
    const authors = this.extractAuthors(inscriptions);
    
    return {
      id: `chapter-${Date.now()}`,
      title: groupTitle,
      authors,
      content: inscriptions,
      introduction: this.generateChapterIntroduction(inscriptions, groupingCriteria),
      conclusion: this.generateChapterConclusion(inscriptions, groupingCriteria),
      bibliography: generateBibliography(inscriptions),
      wordCount: this.estimateWordCount(inscriptions),
      status: 'draft',
      lastModified: new Date()
    };
  }

  // Generate LaTeX export
  exportToLaTeX(volume: BookVolume): string {
    let latex = this.generateLaTeXHeader(volume);
    
    latex += `\\\\begin{document}\\\\n\\\\n`;
    latex += this.generateTitlePage(volume);
    latex += this.generateTableOfContents();
    latex += volume.introduction + '\\\\n\\\\n';
    
    volume.chapters.forEach(chapter => {
      latex += this.generateChapterLaTeX(chapter);
    });
    
    latex += this.generateBibliographyLaTeX(volume);
    latex += this.generateIndexLaTeX(volume);
    latex += `\\\\end{document}`;
    
    return latex;
  }

  exportToMarkdown(volume: BookVolume): string {
    let markdown = `# ${volume.title}\\\\n`;
    if (volume.subtitle) {
      markdown += `## ${volume.subtitle}\\\\n`;
    }
    
    markdown += `**Editors:** ${volume.editors.join(', ')}\\\\n\\\\n`;
    markdown += `---\\\\n\\\\n`;
    
    // Table of contents
    markdown += `## Table of Contents\\\\n\\\\n`;
    volume.chapters.forEach((chapter, index) => {
      markdown += `${index + 1}. [${chapter.title}](#chapter-${index + 1})\\\\n`;
    });
    markdown += `\\\\n---\\\\n\\\\n`;
    
    // Introduction
    markdown += `## Introduction\\\\n\\\\n${volume.introduction}\\\\n\\\\n---\\\\n\\\\n`;
    
    // Chapters
    volume.chapters.forEach((chapter, index) => {
      markdown += this.generateChapterMarkdown(chapter, index + 1);
    });
    
    // Bibliography
    markdown += this.generateBibliographyMarkdown(volume);
    
    return markdown;
  }

  prepareManuscript(volume: BookVolume): {
    mainText: string;
    supplementaryMaterial: string;
    metadata: any;
    statistics: any;
  } {
    const mainText = this.exportToMarkdown(volume);
    const supplementaryMaterial = this.generateSupplementaryMaterial(volume);
    
    const metadata = {
      title: volume.title,
      subtitle: volume.subtitle,
      editors: volume.editors,
      chapterCount: volume.chapters.length,
      totalWordCount: volume.chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      publicationDate: volume.publicationDate,
      publisher: volume.publisher,
      isbn: volume.isbn,
      doi: volume.doi,
      academicLevel: this.settings.academicLevel,
      citationStyle: this.settings.citationStyle
    };
    
    const statistics = this.generateStatistics(volume);
    
    return {
      mainText,
      supplementaryMaterial,
      metadata,
      statistics
    };
  }

  private generateIndexTerms(volume: BookVolume): { [category: string]: string[] } {
    const index: { [category: string]: string[] } = {
      'Dynasties': [],
      'Rulers': [],
      'Locations': [],
      'Scripts': [],
      'Terms': [],
      'Concepts': []
    };
    
    volume.chapters.forEach(chapter => {
      chapter.content.forEach(inscription => {
        index['Dynasties'].push(inscription.period.dynasty);
        if (inscription.period.ruler) {
          index['Rulers'].push(inscription.period.ruler);
        }
        index['Locations'].push(inscription.location.ancient);
        index['Locations'].push(inscription.location.modern);
        inscription.scripts.forEach(script => {
          index['Scripts'].push(script.scriptType);
        });
        inscription.tags.forEach(tag => {
          index['Terms'].push(tag);
        });
      });
    });
    
    Object.keys(index).forEach(category => {
      index[category] = [...new Set(index[category])]
        .filter(term => term && term.trim())
        .sort();
    });
    
    return index;
  }

  private generateLaTeXHeader(volume: BookVolume): string {
    return `\\\\documentclass[11pt,a4paper]{book}\\n\\\\usepackage[utf8]{inputenc}\\n\\\\usepackage[T1]{fontenc}\\n\\\\usepackage{xcolor}\\n\\\\usepackage{fontspec}\\n\\\\usepackage{polyglossia}\\n\\\\setdefaultlanguage{english}\\n\\\\setotherlanguage{sanskrit}\\n\\\\usepackage{geometry}\\n\\\\geometry{margin=1in}\\n\\\\usepackage{fancyhdr}\\n\\\\usepackage{titlesec}\\n\\\\usepackage{tocloft}\\n\\\\usepackage{biblatex}\\n\\\\usepackage{makeidx}\\n\\\\makeindex\\n\\n% Sanskrit font configuration\\n\\\\newfontfamily\\\\sanskritfont[Scale=1.0]{Noto Sans Devanagari}\\n\\n% Custom colors\\n\\\\definecolor{saffron}{RGB}{255,153,51}\\n\\\\definecolor{dharma}{RGB}{70,130,180}\\n\\n% Title formatting\\n\\\\titleformat{\\\\\chapter}[display]\\n  {\\\\\normalfont\\\\huge\\\\bfseries\\\\color{saffron}}\\n  {\\\\\chaptertitlename\\\\ \\\\\\thechapter}{20pt}{\\\\\Huge\\\\color{dharma}}\\n\\n\\\\title{${volume.title}}\\n\\\\author{${volume.editors.join(' \\\\\\\\\\\\\\\\\\\\\\\\and ')}}\\n\\\\date{${volume.publicationDate}}\\n\\n`;
  }

  private generateChapterLaTeX(chapter: BookChapter): string {
    let latex = `\\\\chapter{${chapter.title}}\\\\n`;
    if (chapter.subtitle) {
      latex += `\\\\textit{${chapter.subtitle}}\\\\n\\\\n`;
    }
    
    latex += `\\\\textbf{Authors:} ${chapter.authors.join(', ')}\\\\n\\\\n`;
    latex += chapter.introduction + '\\\\n\\\\n';
    
    chapter.content.forEach(inscription => {
      latex += this.generateInscriptionLaTeX(inscription);
    });
    
    latex += chapter.conclusion + '\\\\n\\\\n';
    
    return latex;
  }

  private generateInscriptionLaTeX(inscription: InscriptionShastra): string {
    let latex = `\\\\section{${inscription.title}}\\\\n\\\\n`;
    
    latex += `\\\\textbf{Location:} ${inscription.location.ancient} (${inscription.location.modern}), ${inscription.location.region}\\\\\\\\\\\\\\\\\\\\n`;
    latex += `\\\\textbf{Period:} ${inscription.period.dynasty}, ${inscription.period.century}\\\\\\\\\\\\\\\\\\\\n`;
    latex += `\\\\textbf{Dating:} ${inscription.period.dating.approximate}\\\\n\\\\n`;
    
    inscription.scripts.forEach(script => {
      latex += `\\\\subsection{${script.scriptType} Script}\\\\n`;
      if (script.text) {
        latex += `\\\\begin{sanskrit}${script.text}\\\\\end{sanskrit}\\\\n\\\\n`;
      }
      if (script.transliteration && this.settings.includeTransliterations) {
        latex += `\\\\textit{Transliteration:} ${script.transliteration}\\\\n\\\\n`;
      }
      latex += `\\\\textbf{Translation:} ${script.translation}\\\\n\\\\n`;
    });
    
    latex += `\\\\textbf{Significance:} ${inscription.translations.primary}\\\\n\\\\n`;
    
    return latex;
  }

  private generateChapterMarkdown(chapter: BookChapter, chapterNumber: number): string {
    let markdown = `## Chapter ${chapterNumber}: ${chapter.title}\\\\n\\\\n`;
    
    if (chapter.subtitle) {
      markdown += `*${chapter.subtitle}*\\\\n\\\\n`;
    }
    
    markdown += `**Authors:** ${chapter.authors.join(', ')}\\\\n\\\\n`;
    markdown += `### Introduction\\\\n\\\\n${chapter.introduction}\\\\n\\\\n`;
    
    chapter.content.forEach(inscription => {
      markdown += this.generateInscriptionMarkdown(inscription);
    });
    
    markdown += `### Conclusion\\\\n\\\\n${chapter.conclusion}\\\\n\\\\n`;
    markdown += `---\\\\n\\\\n`;
    
    return markdown;
  }

  private generateInscriptionMarkdown(inscription: InscriptionShastra): string {
    let markdown = `### ${inscription.title}\\\\n\\\\n`;
    
    markdown += `**Location:** ${inscription.location.ancient} (${inscription.location.modern}), ${inscription.location.region}  \\\\n`;
    markdown += `**Period:** ${inscription.period.dynasty}, ${inscription.period.century}  \\\\n`;
    markdown += `**Dating:** ${inscription.period.dating.approximate}\\\\n\\\\n`;
    
    inscription.scripts.forEach(script => {
      markdown += `#### ${script.scriptType} Script\\\\n\\\\n`;
      if (script.text) {
        markdown += `**Original Text:** ${script.text}\\\\n\\\\n`;
      }
      if (script.transliteration && this.settings.includeTransliterations) {
        markdown += `**Transliteration:** *${script.transliteration}*\\\\n\\\\n`;
      }
      markdown += `**Translation:** ${script.translation}\\\\n\\\\n`;
    });
    
    markdown += `**Historical Significance:** ${inscription.translations.primary}\\\\n\\\\n`;
    
    return markdown;
  }

  private estimateWordCount(inscriptions: InscriptionShastra[]): number {
    let wordCount = 0;
    inscriptions.forEach(inscription => {
      wordCount += inscription.title.split(' ').length;
      wordCount += inscription.translations.primary.split(' ').length;
      if (inscription.translations.contextual) {
        wordCount += inscription.translations.contextual.split(' ').length;
      }
      inscription.scripts.forEach(script => {
        wordCount += script.translation.split(' ').length;
      });
    });
    return wordCount + 500;
  }

  private generateGroupTitle(inscriptions: InscriptionShastra[], criteria: string): string {
    switch (criteria) {
      case 'region':
        const regions = [...new Set(inscriptions.map(i => i.location.region))];
        return regions.length === 1 ? `Inscriptions of ${regions[0]}` : 'Regional Inscription Collection';
      case 'period':
        const dynasties = [...new Set(inscriptions.map(i => i.period.dynasty))];
        return dynasties.length === 1 ? `${dynasties[0]} Dynasty Inscriptions` : 'Dynastic Inscription Collection';
      case 'script':
        const scripts = [...new Set(inscriptions.flatMap(i => i.scripts.map(s => s.scriptType)))];
        return scripts.length === 1 ? `${scripts[0]} Script Collection` : 'Multi-Script Inscription Collection';
      default:
        return 'Thematic Inscription Collection';
    }
  }

  private generateChapterIntroduction(inscriptions: InscriptionShastra[], criteria: string): string {
    return `This chapter examines ${inscriptions.length} inscriptions grouped by ${criteria}, providing comprehensive analysis of their historical, cultural, and linguistic significance within the broader context of Indic civilization studies.`;
  }

  private generateChapterConclusion(inscriptions: InscriptionShastra[], criteria: string): string {
    return `The inscriptions presented in this chapter demonstrate the rich diversity and continuity of Indic cultural traditions, offering valuable insights into the ${criteria}-based patterns of cultural transmission and adaptation across time and space.`;
  }

  private extractAuthors(inscriptions: InscriptionShastra[]): string[] {
    const authors = inscriptions
      .flatMap(i => i.bibliography || [])
      .map(ref => ref.split('.')[0])
      .filter(author => author && author.length > 0);
    
    return authors.length > 0 ? [...new Set(authors)] : ['Srangam Research Team'];
  }

  private addToExistingChapter(inscription: InscriptionShastra, chapterId: string): void {
    // Implementation for adding to existing chapter
  }

  private createNewChapter(inscription: InscriptionShastra): void {
    // Implementation for creating new chapter
  }

  private generateTitlePage(volume: BookVolume): string {
    return `\\\\maketitle\\\\n\\\\n`;
  }

  private generateTableOfContents(): string {
    return `\\\\tableofcontents\\\\n\\\\n`;
  }

  private generateBibliographyLaTeX(volume: BookVolume): string {
    return `\\\\printbibliography\\\\n\\\\n`;
  }

  private generateIndexLaTeX(volume: BookVolume): string {
    return `\\\\printindex\\\\n\\\\n`;
  }

  private generateBibliographyMarkdown(volume: BookVolume): string {
    const allBibliography = volume.chapters.flatMap(ch => ch.bibliography);
    const uniqueBibliography = [...new Set(allBibliography)].sort();
    
    let markdown = `## Bibliography\\\\n\\\\n`;
    uniqueBibliography.forEach(item => {
      markdown += `- ${item}\\\\n`;
    });
    markdown += `\\\\n`;
    
    return markdown;
  }

  private generateSupplementaryMaterial(volume: BookVolume): string {
    return `# Supplementary Material\\\\n\\\\n## Index Terms\\\\n\\\\n${JSON.stringify(this.generateIndexTerms(volume), null, 2)}`;
  }

  private generateStatistics(volume: BookVolume): any {
    return {
      totalChapters: volume.chapters.length,
      totalInscriptions: volume.chapters.reduce((sum, ch) => sum + ch.content.length, 0),
      totalWordCount: volume.chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      averageChapterLength: volume.chapters.reduce((sum, ch) => sum + ch.wordCount, 0) / volume.chapters.length,
      scriptTypes: [...new Set(volume.chapters.flatMap(ch => ch.content.flatMap(i => i.scripts.map(s => s.scriptType))))],
      periods: [...new Set(volume.chapters.flatMap(ch => ch.content.map(i => i.period.dynasty)))],
      regions: [...new Set(volume.chapters.flatMap(ch => ch.content.map(i => i.location.region)))]
    };
  }
}

// Export utilities
export const createCompilationManager = (settings: CompilationSettings): BookCompilationManager => {
  return new BookCompilationManager(settings);
};

export const defaultCompilationSettings: CompilationSettings = {
  citationStyle: 'dharmic',
  includeTransliterations: true,
  includeSanskritTerms: true,
  generateIndex: true,
  includeGlossary: true,
  exportFormat: 'markdown',
  academicLevel: 'research'
};

// Volume I structure with Sacred Ecology Series integration
export const volumeIStructure = {
  volume: 1,
  title: "Foundations of Bhāratīya Civilization",
  chapters: [
    {
      chapter: 4,
      title: "Sacred Ecology and Ritual Calendars",
      description: "Exploring the longue durée through complementary lenses: living ritual practices (the 'score') and material culture venues (stone, sound, space).",
      articles: [
        {
          id: "sacred-tree-harvest-rhythms",
          title: "Under the Sacred Tree (Part 1)",
          subtitle: "Harvest Rhythms, Groves, and Sky-Time across Bhāratavarṣa",
          summary: "17 tree species, festival calendars, and the living 'scores' of ritual practice—from banyan council-grounds to śāl blossom rites in Sarna groves."
        },
        {
          id: "stone-song-and-sea",
          title: "Stone, Song, and Sea (Part 2)",
          subtitle: "Janajāti Memory from Petroglyphs to Monoliths",
          summary: "Material 'venues' that preserve ritual—acoustic archaeology at Kupgal, megalithic gardens in Nartiang, oral archives in the Andamans, and the Venue vs. Score methodological framework."
        }
      ]
    }
  ]
};
