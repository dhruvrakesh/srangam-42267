import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, BookOpen, Palette, Music } from 'lucide-react';

type DiffusionCategory = 'religious' | 'scripts' | 'arts' | 'festivals';

const diffusionData = {
  religious: {
    title: 'Religious Traditions',
    icon: Building,
    color: 'saffron',
    items: [
      { region: 'Cambodia', example: 'Angkor Wat - Hindu temple-mountains', period: '9th-12th century' },
      { region: 'Indonesia', example: 'Borobudur & Prambanan - Buddhist/Hindu synthesis', period: '8th-9th century' },
      { region: 'Bali', example: '"Ya Śiva! Ya Buddha!" - Shaiva-Buddhist fusion', period: 'Ongoing' },
      { region: 'Thailand', example: 'Wat temples with Ramayana murals', period: '13th+ century' }
    ]
  },
  scripts: {
    title: 'Scripts & Languages',
    icon: BookOpen,
    color: 'indigo-dharma',
    items: [
      { region: 'Khmer', example: 'Brahmi → Old Khmer script evolution', period: '7th+ century' },
      { region: 'Java', example: 'Pallava → Kawi script for Sanskrit texts', period: '8th+ century' },
      { region: 'Thailand/Laos', example: 'Pali Buddhist texts in Indic scripts', period: '11th+ century' },
      { region: 'Cham', example: 'Sanskrit inscriptions in Cham script', period: '4th+ century' }
    ]
  },
  arts: {
    title: 'Arts & Architecture',
    icon: Palette,
    color: 'lotus-pink',
    items: [
      { region: 'Java', example: 'Ramayana relief carvings at Prambanan', period: '9th century' },
      { region: 'Cambodia', example: 'Churning of Ocean (Samudra Manthan) reliefs', period: '12th century' },
      { region: 'Bali', example: 'Hindu dance dramas (Kecak, Legong)', period: 'Medieval+' },
      { region: 'Thailand', example: 'Classical Thai dance from Indian traditions', period: '14th+ century' }
    ]
  },
  festivals: {
    title: 'Festivals & Calendars',
    icon: Music,
    color: 'turmeric',
    items: [
      { region: 'Bali', example: 'Nyepi (Day of Silence) - lunar calendar links', period: 'Ancient' },
      { region: 'Cambodia', example: 'Bon Chol Vassa - Buddhist monsoon retreat', period: 'Medieval' },
      { region: 'Java', example: 'Waisak (Vesak) - Buddha birth celebration', period: '8th+ century' },
      { region: 'Thailand', example: 'Songkran - Sanskrit solar new year', period: '13th+ century' }
    ]
  }
};

export function CulturalDiffusionMap() {
  const [activeCategory, setActiveCategory] = useState<DiffusionCategory>('religious');
  const currentData = diffusionData[activeCategory];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="lotus-gradient">
        <CardTitle className="flex items-center gap-2 text-charcoal">
          <currentData.icon className="text-charcoal" size={24} />
          Cultural Diffusion via Monsoon Routes
        </CardTitle>
        <CardDescription className="text-charcoal/80">
          How Indian traditions spread across Southeast Asia through maritime trade networks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {(Object.keys(diffusionData) as DiffusionCategory[]).map((category) => {
            const data = diffusionData[category];
            return (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category)}
                className="flex flex-col items-center gap-1 h-auto p-3"
              >
                <data.icon size={18} />
                <span className="text-xs">{data.title.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>

        <div className={`bg-${currentData.color}/10 p-4 rounded-lg border border-${currentData.color}/30 mb-4`}>
          <h3 className={`font-semibold text-${currentData.color} mb-3 flex items-center gap-2`}>
            <currentData.icon size={20} />
            {currentData.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentData.items.map((item, index) => (
              <div key={index} className="bg-card p-3 rounded border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">{item.region}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {item.period}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2">Maritime Cultural Exchange</h4>
          <p className="text-sm text-muted-foreground">
            Merchant fleets became vectors of culture. The same monsoon winds that carried spices and textiles 
            also transported Sanskrit manuscripts, temple architects, Buddhist monks, and Hindu priests. 
            Local traditions absorbed and adapted these influences, creating unique regional syntheses.
          </p>
        </div>

        <div className="mt-4 text-xs text-muted-foreground italic">
          Archaeological and epigraphic evidence from temple inscriptions, relief carvings, and cultural practices across maritime Southeast Asia
        </div>
      </CardContent>
    </Card>
  );
}