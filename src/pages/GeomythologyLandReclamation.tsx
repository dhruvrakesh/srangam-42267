import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/components/language/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mountain, Waves, MapPin, Book, Calendar, Clock } from 'lucide-react';
import { MULTILINGUAL_ARTICLES } from '@/data/articles';
import { ARTICLE_METADATA } from '@/data/articles';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ArticleNarrator } from '@/components/tts/ArticleNarrator';

export default function GeomythologyLandReclamation() {
  const { currentLanguage } = useLanguage();
  
  const article = MULTILINGUAL_ARTICLES.find(a => a.id === 'geomythology-land-reclamation');
  const metadata = ARTICLE_METADATA['geomythology-land-reclamation'];
  
  if (!article) {
    return <div>Article not found</div>;
  }

  const getLocalizedString = (field: any): string => {
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field !== null) {
      return (field[currentLanguage] as string) || (field.en as string) || '';
    }
    return '';
  };

  const title = getLocalizedString(article.title);
  const dek = getLocalizedString(article.dek);
  const content = getLocalizedString(article.content);

  return (
    <>
      <Helmet>
        <title>{title} | Srangam Digital</title>
        <meta name="description" content={dek} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={dek} />
        <meta name="keywords" content="geomythology, Kerala, Kashmir, Parashurama, Kashyapa, coastal emergence, sacred ecology" />
      </Helmet>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <header className="mb-12 space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Mountain className="w-3 h-3 mr-1" />
              {metadata.theme}
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Waves className="w-3 h-3 mr-1" />
              Geomythology
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {dek}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {metadata.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {metadata.readTime} min read
            </div>
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              {metadata.author}
            </div>
          </div>
        </header>

        <Separator className="my-8" />

        {/* Interactive Map Section */}
        <div className="mb-12 p-6 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Geomythology Sites
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Kerala Sites (Paraśurāma)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Gokarṇa (Starting Point)</li>
                <li>• Kanyakumari (Axe Landing)</li>
                <li>• Mannarsala (Serpent Temple)</li>
                <li>• Nāgappaṭṭinam (Nāga Cult Site)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Kashmir Sites (Kaśyapa)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Kashmir Valley (Satisaras)</li>
                <li>• Baramulla (Drainage Point)</li>
                <li>• Wular Lake (Remnant)</li>
                <li>• Karewa Terraces (Geological Evidence)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:leading-relaxed prose-p:text-foreground/90
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1
          prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-table:border-collapse prose-table:w-full
          prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
          prose-td:border prose-td:border-border prose-td:p-3
          prose-ul:list-disc prose-ul:pl-6
          prose-ol:list-decimal prose-ol:pl-6
          prose-li:my-1">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Citation Notice */}
        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            Academic Citations
          </h3>
          <p className="text-sm text-muted-foreground">
            This article contains 74 primary source citations spanning geology, archaeology, anthropology, 
            and folklore studies. Full bibliography available in the published version.
          </p>
        </div>

        {/* Geological Evidence Callout */}
        <div className="mt-8 p-6 bg-muted/30 border border-border rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-primary" />
            Geological Evidence Summary
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Kerala Coastal Emergence</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Mid-Holocene sea-level drop (4000-3000 BP)</li>
                <li>• Shoreline advance 5-10 km westward</li>
                <li>• Coastal cores show marine → freshwater transition</li>
                <li>• Laterite formations with Miocene fossils</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Kashmir Lake Drainage</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Pleistocene lake (~85,000 BP drainage)</li>
                <li>• Karewa deposits up to 1400m thick</li>
                <li>• Visible lake terraces on valley slopes</li>
                <li>• Freshwater diatoms in sediment cores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cultural Continuity Section */}
        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            Living Traditions
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Kerala: Theyyam Performances</h4>
              <p className="text-muted-foreground">
                Annual Paraśurāma thottam rituals in North Kerala (Kannur, Kasaragod) reenact 
                the axe-throw narrative with invocations to Varuṇa and nāga deities.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Kashmir: Toponymic Memory</h4>
              <p className="text-muted-foreground">
                Place-names like Bārāmūla ("Great Breach"), Kaśī-vān ("Kaśyapa's Forest"), 
                and Satī-sar preserve pre-literate memory of lake drainage.
              </p>
            </div>
          </div>
        </div>
      </article>
      
      <ArticleNarrator
        articleSlug="geomythology-land-reclamation"
        content={content}
        language={currentLanguage}
        title={title}
      />
    </>
  );
}
