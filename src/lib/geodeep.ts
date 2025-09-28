import { z } from 'zod';
import sourcesData from '@/data/geodeep/sources.json';
import caseStudiesData from '@/data/geodeep/case_studies.json';
import timelineData from '@/data/geodeep/timeline.json';

// Zod schemas for validation
const SourceSchema = z.object({
  id: z.string(),
  type: z.enum(['article', 'book', 'text', 'primary_text', 'report']),
  title: z.string(),
  authors: z.string(),
  year: z.number().optional(),
  journal: z.string().optional(),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  confidence: z.enum(['green', 'amber', 'red']),
  note: z.string().optional()
});

const ClaimSchema = z.object({
  text: z.string(),
  evidence: z.array(z.string()),
  confidence: z.enum(['green', 'amber', 'red'])
});

const TextMemorySchema = z.object({
  tradition: z.string(),
  reference: z.string(),
  excerpt: z.string(),
  source: z.string(),
  limitWords: z.number()
});

const CaseStudySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  claims: z.array(ClaimSchema),
  texts: z.array(TextMemorySchema),
  assets: z.array(z.string())
});

const TimelineEventSchema = z.object({
  ageMa: z.number(),
  label: z.string(),
  description: z.string(),
  type: z.enum(['tectonic', 'volcanic', 'collision', 'climate', 'fluvial', 'active'])
});

export type Source = z.infer<typeof SourceSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type TextMemory = z.infer<typeof TextMemorySchema>;
export type CaseStudy = z.infer<typeof CaseStudySchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

// Validate data on import
const sources = z.array(SourceSchema).parse(sourcesData);
const caseStudies = z.array(CaseStudySchema).parse(caseStudiesData);
const timeline = z.array(TimelineEventSchema).parse(timelineData);

// Create source lookup map
const sourceMap = new Map(sources.map(source => [source.id, source]));

// Citation guardrail function
export function assertCitations(claims: Claim[]): void {
  const missingCitations: string[] = [];
  
  claims.forEach(claim => {
    claim.evidence.forEach(evidenceId => {
      if (!sourceMap.has(evidenceId)) {
        missingCitations.push(evidenceId);
      }
    });
  });
  
  if (missingCitations.length > 0) {
    throw new Error(`CITATION MISSING: ${missingCitations.join(', ')}`);
  }
}

// Data access functions
export function getSources(): Source[] {
  return sources;
}

export function getCaseStudies(): CaseStudy[] {
  // Validate all citations before returning
  caseStudies.forEach(study => {
    assertCitations(study.claims);
  });
  return caseStudies;
}

export function getTimeline(): TimelineEvent[] {
  return timeline.sort((a, b) => b.ageMa - a.ageMa); // Sort newest to oldest
}

export function getSourceById(id: string): Source | undefined {
  return sourceMap.get(id);
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(study => study.slug === slug);
}

// Generate MLA citation
export function formatCitation(source: Source): string {
  const { authors, title, journal, publisher, year, doi } = source;
  
  if (source.type === 'article' && journal) {
    return `${authors}. "${title}." ${journal}, ${year}. ${doi ? `doi:${doi}` : ''}`.trim();
  } else if (source.type === 'book' && publisher) {
    return `${authors}. ${title}. ${publisher}, ${year}.`;
  } else if (source.type === 'text') {
    return `${title}. ${authors ? `Trans. ${authors}.` : ''} ${publisher ? `${publisher},` : ''} ${year || 'Traditional'}.`;
  }
  
  return `${authors}. ${title}. ${year || 'n.d.'}.`;
}

// Get confidence badge props
export function getConfidenceBadge(confidence: 'green' | 'amber' | 'red') {
  switch (confidence) {
    case 'green':
      return { variant: 'default' as const, label: 'Established' };
    case 'amber':
      return { variant: 'secondary' as const, label: 'Debated' };
    case 'red':
      return { variant: 'destructive' as const, label: 'Disputed' };
  }
}