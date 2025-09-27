import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, BookOpen, ExternalLink } from 'lucide-react';
import { SourcesAndPins } from './SourcesAndPins';
import { useLanguage } from '@/components/language/LanguageProvider';
import { getOceanicCardBySlug, getOceanicCards } from '@/lib/oceanicCardsLoader';

export const OceanicArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  const article = getOceanicCardBySlug(slug);
  const allCards = getOceanicCards();

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-4">Article Not Found</h1>
            <p className="text-center text-muted-foreground mb-4">
              The requested article could not be found.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePinClick = (pin: any) => {
    // Open map modal or navigate to map view with pin highlighted
    console.log('Pin clicked:', pin);
  };

  const handleOpenReadingRoom = () => {
    // Navigate to reading room with this article's sources
    window.open('/reading-room', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Themes
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
              {currentLanguage === 'hi' && article.title_hi ? article.title_hi : article.title}
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Abstract */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed text-foreground/90">
                  {article.abstract}
                </p>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sources & Pins Integration */}
            <SourcesAndPins pageOrCard={article.title} />

            {/* Methods Modal Link */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">About this article</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn about our curation methodology, confidence indicators, and source verification process.
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  View Methods
                </Button>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allCards
                    .filter(card => card.slug !== slug)
                    .slice(0, 3)
                    .map((relatedCard, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto text-left"
                        onClick={() => navigate(`/oceanic/${relatedCard.slug}`)}
                      >
                        <div>
                          <div className="font-medium text-sm">{relatedCard.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {relatedCard.read_time_min} min
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanicArticlePage;