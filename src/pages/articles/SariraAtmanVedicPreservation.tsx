import { Helmet } from 'react-helmet-async';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { sariraAndAtmanVedicPreservation } from '@/data/articles/sarira-and-atman-vedic-preservation';
import { AnukramaniTriadVisualization } from '@/components/articles/AnukramaniTriadVisualization';
import { VedicPreservationTimeline } from '@/components/articles/VedicPreservationTimeline';
import { AnukramaniTable } from '@/components/articles/AnukramaniTable';
import { GayatriMantraExplainer } from '@/components/articles/GayatriMantraExplainer';
import { SayanaMethodologyDiagram } from '@/components/articles/SayanaMethodologyDiagram';
import { IconOm } from '@/components/icons';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

export default function SariraAtmanVedicPreservation() {
  // Extract English content for narration
  const contentForNarration = typeof sariraAndAtmanVedicPreservation.content === 'object'
    ? (sariraAndAtmanVedicPreservation.content.en as string || '')
    : sariraAndAtmanVedicPreservation.content;

  return (
    <>
      <NarrationErrorBoundary>
        <UniversalNarrator 
          content={contentForNarration}
          contentType="article"
          articleSlug="sarira-atman-vedic-preservation"
          variant="sticky-bottom"
          autoAnalyze
        />
      </NarrationErrorBoundary>
      <Helmet>
        <title>Śarīra and Ātman: The Preservation of the Vedas | Srangam Digital</title>
        <meta 
          name="description" 
          content="How the Anukramaṇīs preserved Vedic form and Sāyaṇāchārya's bhāṣya preserved its meaning during the Vijayanagara Renaissance. A scholarly exploration of Vedic preservation technology." 
        />
        <meta property="og:title" content="Śarīra and Ātman: The Preservation of the Vedas" />
        <meta property="og:description" content="The technology of Vedic preservation: Anukramaṇīs as śarīra (body) and Sāyaṇa's commentary as ātman (soul)" />
        <meta property="og:type" content="article" />
        <meta name="keywords" content="Vedas, Anukramani, Sayanacharya, Vijayanagara, Sanskrit, oral tradition, manuscript culture, preservation" />
      </Helmet>

      <ArticlePage
        title={sariraAndAtmanVedicPreservation.title}
        dek={sariraAndAtmanVedicPreservation.dek}
        content={sariraAndAtmanVedicPreservation.content}
        tags={sariraAndAtmanVedicPreservation.tags}
        icon={IconOm}
        readTime={38}
        author="Nartiang Foundation Research Team"
        date="2025-10-07"
        articleSlug="sarira-atman-vedic-preservation"
        dataComponents={[
          <AnukramaniTriadVisualization key="triad" />,
          <VedicPreservationTimeline key="timeline" />,
          <AnukramaniTable key="table" />,
          <GayatriMantraExplainer key="gayatri" />,
          <SayanaMethodologyDiagram key="sayana" />
        ]}
      />
    </>
  );
}
