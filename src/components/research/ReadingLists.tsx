import React, { useState } from 'react';
import { BookOpen, Library, Scroll, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TagChip } from '@/components/ui/TagChip';

interface ReadingList {
  category: string;
  icon: React.ReactNode;
  description: string;
  sources: {
    title: string;
    author: string;
    type: 'Primary' | 'Archaeological' | 'Linguistic' | 'Scientific' | 'Contemporary';
    institution?: string;
    description: string;
    available: boolean;
    url?: string;
  }[];
}

export function ReadingLists() {
  const [activeCategory, setActiveCategory] = useState('primary');

  const readingLists: ReadingList[] = [
    {
      category: 'primary',
      icon: <Scroll className="h-5 w-5" />,
      description: 'Ancient texts, inscriptions, and palm-leaf manuscripts from traditional bharatiya sources',
      sources: [
        {
          title: 'Ṛgveda Saṃhitā - Geographical References',
          author: 'Various Ṛṣis',
          type: 'Primary',
          institution: 'Bhandarkar Oriental Research Institute',
          description: 'Sacred geographical knowledge embedded in Vedic hymns, revealing ancient Indian understanding of rivers, mountains, and maritime regions.',
          available: true,
          url: '#'
        },
        {
          title: 'Periplus Maris Erythraei - Indian Ocean Navigation',
          author: 'Anonymous (c. 1st century CE)',
          type: 'Primary',
          description: 'Greco-Roman merchant\'s guide documenting Indian ports, goods, and maritime trade routes from indigenous perspective.',
          available: true
        },
        {
          title: 'Aṣṭādhyāyī - Linguistic Geography',
          author: 'Pāṇini',
          type: 'Primary',
          institution: 'Hemchandra Raychaudhary Collection',
          description: 'Grammatical treatise containing geographical and cultural references supporting indigenous linguistic continuity.',
          available: true
        },
        {
          title: 'Arthaśāstra - Maritime Trade Regulations', 
          author: 'Kauṭilya',
          type: 'Primary',
          description: 'Ancient Indian economic treatise detailing port administration, maritime commerce, and naval organization.',
          available: true
        }
      ]
    },
    {
      category: 'archaeological',
      icon: <Library className="h-5 w-5" />,
      description: 'Archaeological evidence supporting indigenous continuity and maritime prowess',
      sources: [
        {
          title: 'Harappan Civilization: Maritime Connections',
          author: 'Kenoyer, J.M. & Meadow, R.H.',
          type: 'Archaeological',
          institution: 'University of Wisconsin-Madison',
          description: 'Archaeological evidence for sophisticated maritime trade networks predating Aryan Migration Theory timelines.',
          available: true
        },
        {
          title: 'Sangam Age Ports: Archaeological Evidence',
          author: 'Raman, K.V.',
          type: 'Archaeological',
          description: 'Excavations at Pattanam (Muziris) revealing indigenous port infrastructure and international connections.',
          available: true
        },
        {
          title: 'Maritime Archaeology of Western India',
          author: 'Gaur, A.S.',
          type: 'Archaeological',
          institution: 'National Institute of Oceanography',
          description: 'Underwater archaeological discoveries supporting continuous maritime activity from ancient times.',
          available: true
        }
      ]
    },
    {
      category: 'linguistic',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Linguistic studies supporting indigenous development of Sanskrit and Prakrits',
      sources: [
        {
          title: 'The Primacy of Sanskrit in Indo-European Studies',
          author: 'Kazanas, N.',
          type: 'Linguistic',
          description: 'Comprehensive analysis of Sanskrit\'s archaic features suggesting Indian origin of Indo-European languages.',
          available: true
        },
        {
          title: 'Saraswati-Sindhu Civilization: Linguistic Evidence',
          author: 'Kalyanaraman, S.',
          type: 'Linguistic',
          description: 'Linguistic archaeology connecting Harappan symbols with proto-Sanskrit terminology.',
          available: true
        }
      ]
    },
    {
      category: 'scientific',
      icon: <Users className="h-5 w-5" />,
      description: 'Genetic, astronomical, and environmental studies supporting indigenous continuity',
      sources: [
        {
          title: 'Ancient DNA and Indian Population Continuity',
          author: 'Narasimhan, V.M. et al.',
          type: 'Scientific',
          description: 'Genetic studies showing population continuity in Indian subcontinent contradicting migration theories.',
          available: true
        },
        {
          title: 'Astronomical Dating of Mahābhārata Events',
          author: 'Oak, N.S.',
          type: 'Scientific',
          description: 'Archaeoastronomical evidence for historical dating of Sanskrit epics supporting traditional chronology.',
          available: true
        }
      ]
    }
  ];

  const activeList = readingLists.find(list => list.category === activeCategory)!;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
          शास्त्र संग्रह | Research Collections
        </h3>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Curated bibliographies from leading Oriental research institutes supporting the indigenous origins framework
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {readingLists.map((list) => (
          <Button
            key={list.category}
            variant={activeCategory === list.category ? "default" : "outline"}
            onClick={() => setActiveCategory(list.category)}
            className="flex items-center gap-2"
          >
            {list.icon}
            {list.category.charAt(0).toUpperCase() + list.category.slice(1)} Sources
          </Button>
        ))}
      </div>

      {/* Active Category Description */}
      <Card className="bg-sandalwood/20 border-saffron/20">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            {activeList.description}
          </p>
        </CardContent>
      </Card>

      {/* Sources List */}
      <div className="space-y-4">
        {activeList.sources.map((source, index) => (
          <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="font-serif text-lg text-foreground mb-2">
                    {source.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {source.author}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {source.type}
                    </Badge>
                  </div>
                  {source.institution && (
                    <p className="text-xs text-peacock-blue font-medium">
                      {source.institution}
                    </p>
                  )}
                </div>
                <TagChip 
                  variant={source.available ? "theme" : "default"}
                  className={source.available ? "bg-ocean text-white" : ""}
                >
                  {source.available ? "Available" : "Coming Soon"}
                </TagChip>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {source.description}
              </p>
              {source.available && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <BookOpen className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {source.url && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Access Source
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}