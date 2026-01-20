import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { getOceanicCards } from '@/lib/oceanicCardsLoader';

export const OceanicIndex: React.FC = () => {
  const navigate = useNavigate();
  const cards = getOceanicCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean/5 via-ocean-teal/5 to-peacock-blue/5 dark:from-ocean/10 dark:via-ocean-teal/10 dark:to-peacock-blue/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-ocean via-ocean-teal to-peacock-blue bg-clip-text text-transparent">
              Oceanic Bharat
            </span>
          </h1>
          <h2 className="text-2xl lg:text-3xl font-semibold text-ocean dark:text-ocean mb-8">
            Maritime Networks of the Indian Ocean
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Discover the rich maritime heritage of India through archaeological evidence, 
            textual sources, and geographical analysis of ancient ocean trade networks.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <Card key={card.slug} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-3">
                  {card.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-xl leading-tight">
                  {card.title}
                </CardTitle>
                {card.title_hi && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.title_hi}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {card.abstract.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{card.read_time_min} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{card.pins.length} pins</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={() => navigate(`/oceanic/${card.slug}`)}
                >
                  Read Article
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Each article integrates archaeological evidence with textual sources, 
            following academic standards with full MLA citations and geographical verification.
          </p>
        </div>
      </div>
    </div>
  );
};