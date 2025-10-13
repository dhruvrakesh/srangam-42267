import { Helmet } from 'react-helmet-async';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { rishiGenealogiesVedicTradition } from '@/data/articles/rishi-genealogies-vedic-tradition';
import { RishiLineageChart } from '@/components/articles/RishiLineageChart';
import { MandalaAttributionTable } from '@/components/articles/MandalaAttributionTable';
import { RishiOverlapVisualization } from '@/components/articles/RishiOverlapVisualization';
import { RishiGenealogiesBibliography } from '@/components/articles/RishiGenealogiesBibliography';
import { IconOm } from '@/components/icons';

export default function RishiGenealogiesVedicTradition() {
  return (
    <>
      <Helmet>
        <title>Ṛṣi Genealogies in Vedic Tradition | Srangam Digital</title>
        <meta 
          name="description" 
          content="Explore the three venerable ṛṣi families of the Ṛgveda: Bhṛgu, Āṅgiras, and Kāśyapa lineages, their hymn attributions, and thematic legacies through the Anukramaṇī tradition." 
        />
        <meta property="og:title" content="Ṛṣi Genealogies: Bhṛgu, Āṅgiras, and Kāśyapa Lineages" />
        <meta property="og:description" content="A source-led exploration of Vedic seer families through the Anukramaṇī tradition" />
        <meta property="og:type" content="article" />
        <meta name="keywords" content="Rigveda, Bhrigu, Angirasa, Kashyapa, Vedic seers, Anukramani, rishis, Vedic genealogy, Sanskrit, Vedic tradition" />
        <link rel="canonical" href="https://srangam.in/rishi-genealogies-vedic-tradition" />
      </Helmet>

      <ArticlePage
        title={rishiGenealogiesVedicTradition.title}
        dek={rishiGenealogiesVedicTradition.dek}
        content={rishiGenealogiesVedicTradition.content}
        tags={rishiGenealogiesVedicTradition.tags}
        icon={IconOm}
        readTime={42}
        author="Nartiang Foundation Research Team"
        date="2025-10-13"
        dataComponents={[
          <RishiLineageChart key="bhrigu" lineage="bhrigu" />,
          <RishiLineageChart key="angirasa" lineage="angirasa" />,
          <RishiLineageChart key="kashyapa" lineage="kashyapa" />,
          <MandalaAttributionTable key="mandala" />,
          <RishiOverlapVisualization key="overlap" />,
          <RishiGenealogiesBibliography key="bibliography" />
        ]}
      />
    </>
  );
}
