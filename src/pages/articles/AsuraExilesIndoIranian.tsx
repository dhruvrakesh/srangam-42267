import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconOm } from '@/components/icons/IconOm';
import { InteractiveQuote } from '@/components/articles/enhanced';
import { asuraExilesIndoIranian } from '@/data/articles/asura-exiles-indo-iranian';
import { IndoIranianPantheonComparison } from '@/components/articles/IndoIranianPantheonComparison';
import { MitanniLinguisticCorpus } from '@/components/articles/MitanniLinguisticCorpus';
import { AsuraExilesTimeline } from '@/components/articles/AsuraExilesTimeline';
import { AsuraExilesBibliography } from '@/components/articles/AsuraExilesBibliography';
import { IndoIranianMap } from '@/components/articles/IndoIranianMap';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

export default function AsuraExilesIndoIranian() {
  // Extract English content for narration
  const contentForNarration = typeof asuraExilesIndoIranian.content === 'object'
    ? (asuraExilesIndoIranian.content.en as string || '')
    : asuraExilesIndoIranian.content;

  return (
    <>
      <NarrationErrorBoundary>
        <UniversalNarrator 
          content={contentForNarration}
          contentType="article"
          articleSlug="asura-exiles-indo-iranian"
          variant="sticky-bottom"
          autoAnalyze
        />
      </NarrationErrorBoundary>
      <Helmet>
        <title>The Asura Exiles: Indo-Iranian Origins, Mitanni, and the Vedic-Zoroastrian Schism | Srangam</title>
        <meta 
          name="description" 
          content="Archaeological, linguistic, and mythological evidence for an Indo-Iranian homeland in ancient India. Explores the Mitanni connection, Vedic-Zoroastrian schism, and echoes of this civil war in Baudhayana memory, Massagetae-Jats traditions, and Shiva's Central Asian iconography." 
        />
        <meta property="og:title" content="The Asura Exiles: Indo-Iranian Origins and the Vedic-Zoroastrian Schism" />
        <meta property="og:description" content="Evidence for Indo-Iranian origins in ancient India through archaeology, linguistics, and mythology." />
        <meta property="og:type" content="article" />
        <link rel="canonical" href="https://srangam.nartiang.org/asura-exiles-indo-iranian" />
      </Helmet>
      
      <ArticlePage
        title={asuraExilesIndoIranian.title}
        dek={asuraExilesIndoIranian.dek}
        content={asuraExilesIndoIranian.content}
        tags={asuraExilesIndoIranian.tags}
        icon={IconOm}
        readTime={52}
        author="Nartiang Foundation Research Team"
        date="2025-10-07"
        dataComponents={[
          <IndoIranianMap key="map" />,
          <AsuraExilesTimeline key="timeline" />,
          <IndoIranianPantheonComparison key="pantheon" />,
          <MitanniLinguisticCorpus key="corpus" />,
          <InteractiveQuote
            key="baudhayana"
            author="Baudhāyana Śrautasūtra"
            source="Ancient Vedic Text (c. 800 BCE)"
            date="c. 800 BCE"
            type="primary"
          >
            Ayu went eastward; his are the Kuru-Pañchāla and Kāśi-Videha. Amāvasu went westward; his are the Gandhārī, Parśu, and Aratta.
          </InteractiveQuote>,
          <InteractiveQuote
            key="mitanni-treaty"
            author="Hittite-Mitanni Treaty"
            source="Boğazköy Archives"
            date="c. 1380 BCE"
            type="primary"
          >
            The gods Mitrašil, Uruwanaššil, Indar, and Našattianna shall witness this treaty.
          </InteractiveQuote>,
          <InteractiveQuote
            key="avesta-daeva"
            author="Yasna 32.3"
            source="Avesta"
            date="c. 1500-1000 BCE"
            type="primary"
          >
            The daevas chose the worst action; they did not choose truth. Delusion came upon them as they gathered in council, so that they chose the Worst Mind.
          </InteractiveQuote>,
          <AsuraExilesBibliography key="bibliography" />
        ]}
      />
    </>
  );
}
