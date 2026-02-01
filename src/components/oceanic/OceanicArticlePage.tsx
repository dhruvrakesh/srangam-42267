import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, BookOpen, ExternalLink, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { SourcesAndPins } from './SourcesAndPins';
import { useLanguage } from '@/components/language/LanguageProvider';
import { getArticleTitle } from '@/lib/articleResolver';
import { ProfessionalTextFormatter } from '@/components/articles/enhanced/ProfessionalTextFormatter';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/gdriveProxy';
import { useArticle } from '@/hooks/useArticle';
import { ArticleFullSkeleton, ArticleError } from '@/components/oceanic/article';

const BASE_URL = 'https://srangam-db.lovable.app';

/**
 * Normalize slug: remove trailing punctuation, decode URI, trim whitespace
 */
function normalizeSlug(rawSlug: string | undefined): string | null {
  if (!rawSlug) return null;
  
  let slug = decodeURIComponent(rawSlug).trim();
  slug = slug.replace(/[.\-_/\\]+$/, '');
  slug = slug.trim();
  
  return slug || null;
}

export const OceanicArticlePage: React.FC = () => {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = normalizeSlug(rawSlug);
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMethodsDialog, setShowMethodsDialog] = useState(false);

  // Phase 1.4: Unified data hook (parallel fetching)
  const { 
    article, 
    bibliography, 
    crossReferences, 
    isLoading, 
    error 
  } = useArticle(slug || undefined);

  // Canonical redirect
  useEffect(() => {
    if (article?.slug_alias && article.slug_alias !== slug) {
      const isOceanic = window.location.pathname.includes('/oceanic/');
      const basePath = isOceanic ? '/oceanic/' : '/articles/';
      navigate(basePath + article.slug_alias, { replace: true });
    }
  }, [article, slug, navigate]);

  // Phase 1.4: Skeleton loading state
  if (isLoading) {
    return <ArticleFullSkeleton />;
  }

  // Phase 1.4: Error state with retry
  if (error || !article) {
    return <ArticleError error={error || 'Article not found'} slug={slug || undefined} />;
  }

  const handlePinClick = (pin: any) => {
    console.log('Pin clicked:', pin);
  };

  const handleOpenReadingRoom = () => {
    window.open('/reading-room', '_blank');
  };

  // Build SEO metadata
  const articleTitle = getArticleTitle(article, currentLanguage);
  const articleSlug = article.slug_alias || article.slug;
  const canonicalUrl = `${BASE_URL}/${articleSlug}`;
  const rawOgImageUrl = article.og_image_url || `${BASE_URL}/brand/og-image.svg`;
  const ogImageUrl = getProxiedImageUrl(rawOgImageUrl);
  const description = article.abstract.substring(0, 160);

  // Build ScholarlyArticle structured data
  const scholarlyArticleSchema = article.source === 'database' ? {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: articleTitle,
    description: description,
    image: ogImageUrl,
    datePublished: article.published_date,
    author: {
      '@type': 'Organization',
      name: 'Nartiang Foundation Research Team',
      url: BASE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Srangam',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/brand/og-image.svg`
      }
    },
    mainEntityOfPage: canonicalUrl,
    keywords: article.tags.join(', '),
    ...(article.word_count && { wordCount: article.word_count }),
    articleSection: article.theme || 'Research',
    ...(bibliography && bibliography.length > 0 && {
      citation: bibliography.map(b => 
        b.bibliography.full_citation_mla || 
        `${b.bibliography.authors?.[0]?.last || 'Unknown'}. ${(b.bibliography.title as Record<string, string>)?.en || 'Untitled'}. ${b.bibliography.year || ''}`
      )
    })
  } : null;

  // Build related articles from cross-references or fallback
  const relatedArticles = crossReferences && crossReferences.length > 0
    ? crossReferences.slice(0, 3).map(ref => ({
        slug: ref.target?.slug_alias || ref.target?.slug || '',
        title: (ref.target?.title as Record<string, string>)?.en || 'Related Article',
        read_time_min: ref.target?.read_time_minutes || 5,
      }))
    : [];

  return (
    <>
      {/* SEO Head */}
      <Helmet>
        <title>{articleTitle} | Srangam</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:title" content={articleTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={articleTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        <meta property="article:published_time" content={article.published_date} />
        <meta property="article:section" content={article.theme || 'Research'} />
        {article.tags.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}
        
        {scholarlyArticleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(scholarlyArticleSchema)}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => {
                const isOceanic = window.location.pathname.includes('/oceanic/');
                navigate(isOceanic ? '/oceanic' : '/articles');
              }}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {window.location.pathname.includes('/oceanic/') ? 'Back to Oceanic' : 'Back to Articles'}
            </Button>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold leading-tight">
                {getArticleTitle(article, currentLanguage)}
              </h1>

              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{article.read_time_min} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{article.pins.length} pins</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex gap-2 ml-auto"
                >
                  {sidebarCollapsed ? (
                    <>
                      <PanelRightOpen className="h-4 w-4" />
                      Show Sidebar
                    </>
                  ) : (
                    <>
                      <PanelRightClose className="h-4 w-4" />
                      Hide Sidebar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          {article.og_image_url && (
            <div className="mb-6 relative">
              <div className="overflow-hidden rounded-lg shadow-md bg-muted/20">
                <img
                  src={ogImageUrl}
                  alt={`Visual illustration for ${articleTitle}`}
                  className="w-full h-48 md:h-64 lg:h-72 object-cover transition-opacity duration-500"
                  loading="lazy"
                  onError={(e) => {
                    console.warn('[OceanicArticlePage] Hero image failed to load:', ogImageUrl);
                    const container = (e.target as HTMLImageElement).parentElement?.parentElement;
                    if (container) container.classList.add('hidden');
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground/60 mt-2 text-center italic">
                AI-generated illustration based on article themes
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className={cn(
            "grid gap-8 transition-all duration-300",
            sidebarCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-4"
          )}>
            <div className={cn(
              "space-y-8 transition-all duration-300",
              sidebarCollapsed ? "lg:col-span-1" : "lg:col-span-3"
            )}>
              {/* Full Article Content */}
              <Card>
                <CardContent className="pt-6">
                  {article.content ? (
                    <TooltipProvider>
                      <ProfessionalTextFormatter
                        content={article.content}
                        enableCulturalTerms={true}
                        enableDropCap={false}
                      />
                    </TooltipProvider>
                  ) : (
                    <p className="text-lg leading-relaxed text-foreground/90">
                      {article.abstract}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Pins Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Geographical Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {article.pins.map((pin, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start gap-2 h-auto p-3"
                        onClick={() => handlePinClick(pin)}
                      >
                        <MapPin className="h-4 w-4 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">{pin.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pin.lat.toFixed(2)}°, {pin.lon.toFixed(2)}°
                            {pin.approximate && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                Approx.
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <Button variant="secondary" className="w-full gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Interactive Map
                  </Button>
                </CardContent>
              </Card>

              {/* MLA References */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Bibliography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm font-mono bg-muted/20 p-4 rounded border">
                    {article.mla_refs.map((ref, index) => (
                      <p key={index} className="leading-relaxed">{ref}</p>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 gap-2" onClick={handleOpenReadingRoom}>
                    <ExternalLink className="h-4 w-4" />
                    Open in Reading Room
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Collapsible */}
            <div className={cn(
              "space-y-6 transition-all duration-300",
              sidebarCollapsed && "lg:hidden"
            )}>
              <SourcesAndPins pageOrCard={article.title} articleSlug={slug} />

              {/* Methods Modal Link */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">About this article</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn about our curation methodology, confidence indicators, and source verification process.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => setShowMethodsDialog(true)}
                  >
                    <BookOpen className="h-4 w-4" />
                    View Methods
                  </Button>
                </CardContent>
              </Card>

              {/* Related Articles - Now uses cross-references */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Related Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {relatedArticles.length > 0 ? (
                      relatedArticles.map((relatedArticle, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto text-left whitespace-normal"
                          onClick={() => navigate(`/articles/${relatedArticle.slug}`)}
                        >
                          <div className="text-left overflow-hidden">
                            <div className="font-medium text-sm break-words line-clamp-2">
                              {relatedArticle.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {relatedArticle.read_time_min} min
                            </div>
                          </div>
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No related articles found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Methods Dialog */}
          <Dialog open={showMethodsDialog} onOpenChange={setShowMethodsDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research Methodology
                </DialogTitle>
                <DialogDescription>
                  How we curate, verify, and present scholarly content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Source Verification</h4>
                  <p className="text-muted-foreground">
                    All claims are traced to primary sources including inscriptions, archaeological reports, 
                    and peer-reviewed publications. Secondary sources are cross-referenced for accuracy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Confidence Indicators</h4>
                  <p className="text-muted-foreground">
                    Evidence is categorized as <Badge variant="default" className="mx-1">Primary</Badge> (direct archaeological/textual evidence),
                    <Badge variant="secondary" className="mx-1">Secondary</Badge> (scholarly analysis), or
                    <Badge variant="outline" className="mx-1">Tradition</Badge> (oral/textual traditions requiring further verification).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Geographical Pins</h4>
                  <p className="text-muted-foreground">
                    Location data comes from survey reports and GPS coordinates. Pins marked "Approx." indicate 
                    general areas where exact coordinates are uncertain due to historical changes or incomplete records.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Citation Standards</h4>
                  <p className="text-muted-foreground">
                    All references follow MLA format. Primary sources include archive locations and accession numbers 
                    where available. Digital Object Identifiers (DOIs) are provided for accessible publications.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Audio Narration */}
          <NarrationErrorBoundary>
            <UniversalNarrator
              content={
                typeof article.content === 'object'
                  ? ((article.content as any)[currentLanguage] || (article.content as any).en || '')
                  : (article.content || article.abstract)
              }
              contentType="article"
              articleSlug={article.slug}
              variant="sticky-bottom"
              autoAnalyze={true}
            />
          </NarrationErrorBoundary>
        </div>
      </div>
    </>
  );
};

export default OceanicArticlePage;
