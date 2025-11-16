import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashanamiAsceticsSacredGeography } from '@/data/articles/dashanami-ascetics-sacred-geography';
import ArticleHeader from '@/components/articles/ArticleHeader';

const DashanamiAsceticsSacredGeography = () => {
  const { language } = useLanguage();
  const article = dashanamiAsceticsSacredGeography;
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
          readTime={45}
          tags={article.tags}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Introduction</h2>
            <p>
              In the grand sweep of Bharatiya civilizational history, the evolution of ascetic orders and sacred geographies reflects an unbroken continuum of spiritual memory. Monastic lineages founded by Ādi <strong>Śaṅkarācārya</strong> – notably the <strong>Daśanāmi Sampradāya</strong> – alongside the <strong>Nāth</strong> yogis and even the long-vanished <strong>Ājīvikas</strong>, have each contributed to India's religious tapestry.
            </p>

            <p>
              These traditions are not isolated phenomena; they intersect through philosophy, ritual practice, and pilgrimage networks, all anchored in India's living landscape of <em>tīrthas</em> (sacred places). The present study traverses this landscape – from the hermitages of Vedic seers to medieval yogic <em>akhāṛās</em>, and from nearly forgotten ascetic sects to the holiest <strong>Jyotirliṅga</strong> shrines.
            </p>

            <h2>Adi Shankara and the Dashanami Order</h2>
            <p>
              Adi Śaṅkara's establishment of the Dashanami monastic order in the 8th century CE was a watershed in this continuum. According to tradition, he appeared at a time when <strong>Sanātana Dharma</strong> was imperiled by what were then called <em>nāstika</em> or "non-Vedic" schools. His response was a renaissance: revitalizing Vedic knowledge, propagating <strong>Advaita Vedānta</strong> philosophy, and organizing Hindu ascetics under a single, coordinated fold.
            </p>

            <h2>The Nāth Yogis</h2>
            <p>
              The Nāth Yogī <em>sampradāya</em>, which crystallized a few centuries after Śaṅkara, inherited both Vedic-Āgamic theology and Tantric-yogic techniques, emphasizing <em>Haṭha Yoga</em> and inner alchemy. Far from operating in silos, these currents often converged: Śaṅkara's own order interacted with Nāth yogis at pilgrimage sites and Kumbh Melā gatherings.
            </p>

            <h2>The Sacred Geography of Jyotirliṅgas</h2>
            <p>
              India's sacred geography – rivers, mountains, and especially the <strong>twelve Jyotirliṅgas</strong> of Lord Śiva – provided the physical stage on which this drama of dharma unfolded. These holy sites, from Kedāranāth in the Himalayas to Rāmeśvaram on the southern sea, are more than points on a map; they are living "archives of memory etched in stone, soil, and water."
            </p>

            <p>
              The Jyotirliṅgas in particular form a mandala of pilgrimage that has, for over a millennium, knit India's disparate regions into a sacred whole.
            </p>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground italic">
                <strong>Note:</strong> This article is currently in development. Interactive maps showing the network of Jyotirlingas, timelines of ascetic traditions, and geographical visualizations will be added in subsequent updates.
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default DashanamiAsceticsSacredGeography;
