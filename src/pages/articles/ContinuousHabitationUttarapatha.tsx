import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { continuousHabitationUttarapatha } from '@/data/articles/continuous-habitation-uttarapatha';
import ArticleHeader from '@/components/articles/ArticleHeader';

const ContinuousHabitationUttarapatha = () => {
  const { language } = useLanguage();
  const article = continuousHabitationUttarapatha;
  const title = typeof article.title === 'string' ? article.title : article.title[language] || article.title.en;
  const dek = typeof article.dek === 'string' ? article.dek : article.dek[language] || article.dek.en;

  return (
    <>
      <Helmet>
        <title>{title} | Srangam</title>
        <meta name="description" content={dek} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={dek} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="min-h-screen bg-background">
        <ArticleHeader
          title={title}
          dek={dek}
          author="NF Research Team"
          date="2025-01-15"
          readTime={55}
          tags={article.tags}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Introduction</h2>
            <p>
              In the annals of world history, few phenomena rival the extraordinary endurance of urban centers in South Asia. While empires rose and fell across Eurasia, and many ancient cities faded into archaeological footnotes, a cluster of settlements in the Indian subcontinent maintained an unbroken chain of habitation spanning millennia. This phenomenon of <strong>continuous habitation</strong> is not merely a matter of geographical luck or economic necessity; it represents a deeper civilizational pattern—one in which memory, ritual, trade, and community interweave to sustain urban life across epochs.
            </p>

            <h2>The Uttarāpatha: India's Great Northern Route</h2>
            <p>
              The <strong>Uttarāpatha</strong> (the "Northern Road") was ancient India's primary artery of trade and cultural exchange. Stretching from the port cities of the Gujarat coast through the heartlands of the Gangetic plain to the foothills of the Himalayas, this network connected diverse ecological and cultural zones. Cities along this route became nodes of continuous settlement, knowledge transmission, and commercial activity.
            </p>

            <h2>Patterns of Urban Continuity</h2>
            <p>
              What enabled certain cities to survive when others perished? The answer lies in a complex interplay of factors: strategic location at trade junctions, proximity to perennial water sources, religious significance as pilgrimage centers, and perhaps most importantly, the transmission of specialized knowledge through guild systems and scholarly lineages.
            </p>

            <p>
              Cities like <strong>Varanasi</strong>, <strong>Prayagraj</strong>, <strong>Mathura</strong>, and <strong>Ujjain</strong> demonstrate this pattern. They were not merely trade posts but living repositories of Vedic learning, astronomical calculation, metallurgical expertise, and textile production. Their continuity was guaranteed by networks of specialists who passed down knowledge across generations.
            </p>

            <h2>Cultural Memory and Transmission</h2>
            <p>
              The concept of <em>paramparā</em> (lineage tradition) played a crucial role in maintaining urban continuity. Whether in priestly families maintaining temple rituals, merchant guilds preserving trade practices, or craftsmen passing down technical skills, these chains of transmission ensured that urban culture remained vibrant even through political upheavals.
            </p>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground italic">
                <strong>Note:</strong> This article is currently in development. Interactive maps of the Uttarāpatha trade network, timelines of continuous settlement, and data visualizations comparing urban continuity patterns will be added in subsequent updates.
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default ContinuousHabitationUttarapatha;
