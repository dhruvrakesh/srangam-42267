import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IconDharmaChakra, IconScript, IconLotus, IconOm } from '@/components/icons';
import { BookOpen, Dna, Globe, Telescope, Map, Users, Calendar, ArrowRight, ChevronRight } from 'lucide-react';

const evidenceCategories = [
  {
    id: 'archaeological',
    title: 'Archaeological Continuity',
    icon: <Map className="h-5 w-5" />,
    color: 'laterite',
    findings: [
      'Harappan-Vedic cultural continuity without invasion evidence',
      'Advanced urban planning predating supposed "Aryan migration"',
      'Ritual fire altars consistent across millennia',
      'Sophisticated metallurgy and craftsmanship traditions'
    ],
    keyEvidence: 'No archaeological evidence for large-scale migration or invasion around 1500 BCE'
  },
  {
    id: 'linguistic',
    title: 'Linguistic Analysis',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'gold',
    findings: [
      'Sanskrit complexity suggests ancient, not derived, status',
      'Dravidian-Sanskrit synthesis indicates indigenous coevolution',
      'Place name continuity from ancient to modern periods',
      'Technical vocabulary in earliest texts shows advanced knowledge'
    ],
    keyEvidence: 'Panini\'s 4th century BCE grammar describes Sanskrit as already ancient and established'
  },
  {
    id: 'genetic',
    title: 'Population Genetics',
    icon: <Dna className="h-5 w-5" />,
    color: 'ocean',
    findings: [
      'Genetic continuity of Indian populations for 10,000+ years',
      'Absence of major Central Asian admixture around 1500 BCE',
      'ANI-ASI gradients suggest ancient, not recent, admixture',
      'Mitochondrial DNA patterns support indigenous origins'
    ],
    keyEvidence: 'Recent studies show genetic stability rather than major migrations during proposed "Aryan" period'
  },
  {
    id: 'astronomical',
    title: 'Astronomical Dating',
    icon: <Telescope className="h-5 w-5" />,
    color: 'primary',
    findings: [
      'Vedic astronomical observations date to 4000-7000 BCE',
      'Sophisticated knowledge of precession cycles',
      'Star catalog accuracy requires direct observation',
      'Festival timing based on ancient astronomical calculations'
    ],
    keyEvidence: 'Astronomical references in Rigveda indicate composition much earlier than 1500 BCE'
  }
];

const methodologicalApproaches = [
  {
    title: 'Interdisciplinary Correlation',
    description: 'Cross-validating evidence from multiple fields to build comprehensive understanding',
    methods: ['Comparative linguistics', 'Archaeological stratigraphy', 'Genetic population studies', 'Astronomical calculations']
  },
  {
    title: 'Primary Source Priority',
    description: 'Emphasizing indigenous texts and traditions over colonial-era interpretations',
    methods: ['Sanskrit textual analysis', 'Oral tradition documentation', 'Epigraphic evidence', 'Indigenous knowledge systems']
  },
  {
    title: 'Cultural Continuity Mapping',
    description: 'Tracing unbroken traditions from ancient to modern periods',
    methods: ['Ritual practice evolution', 'Artistic motif continuity', 'Social structure analysis', 'Festival and calendar systems']
  }
];

export default function SourcesMethod() {
  const [activeEvidence, setActiveEvidence] = useState('archaeological');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const currentEvidence = evidenceCategories.find(cat => cat.id === activeEvidence);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sand/10 to-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-gold/10 to-laterite/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <IconDharmaChakra className="h-16 w-16 text-primary animate-spin-slow" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground">
              Sources & Method
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              An interdisciplinary approach to understanding India's role as a primary source 
              of global civilization, combining archaeology, linguistics, genetics, and astronomy 
              to reveal the indigenous origins of human knowledge.
            </p>
            <Badge variant="outline" className="text-sm px-4 py-2">
              Evidence-Based Research Framework
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Theoretical Framework */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              The Indigenous Origins Framework
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Moving beyond colonial interpretations to understand India as a civilization 
              source rather than merely a cultural crossroads.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <IconOm className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Cultural Transmission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Evidence for India as the source of spiritual, philosophical, and scientific 
                  knowledge that spread across the ancient world through maritime and overland networks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 hover:border-gold/40 transition-colors">
              <CardHeader className="text-center">
                <IconScript className="h-12 w-12 text-gold mx-auto mb-4" />
                <CardTitle className="text-lg">Linguistic Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Sanskrit's sophisticated grammar and vocabulary suggest it as ancestral 
                  to the Indo-European family, not a derivative branch from Central Asian sources.
                </p>
              </CardContent>
            </Card>

            <Card className="border-laterite/20 hover:border-laterite/40 transition-colors">
              <CardHeader className="text-center">
                <IconLotus className="h-12 w-12 text-laterite mx-auto mb-4" />
                <CardTitle className="text-lg">Civilizational Continuity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Unbroken traditions from the Indus Valley to modern India demonstrate 
                  indigenous development rather than external cultural imposition.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Evidence Categories */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              Converging Lines of Evidence
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Multiple independent fields of research support the indigenous origins hypothesis.
            </p>
          </div>

          <Tabs value={activeEvidence} onValueChange={setActiveEvidence} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {evidenceCategories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="flex items-center gap-2 text-sm"
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {evidenceCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-${category.color}/10`}>
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{category.title}</CardTitle>
                        <CardDescription className="text-lg">
                          {category.keyEvidence}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Key Findings:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {category.findings.map((finding, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{finding}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Methodological Approaches */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              Research Methodology
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Our approach combines rigorous academic standards with respect for indigenous knowledge systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {methodologicalApproaches.map((approach, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{approach.title}</CardTitle>
                  <CardDescription>{approach.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {approach.methods.map((method, methodIndex) => (
                      <div key={methodIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">{method}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Research Transparency */}
        <section className="space-y-8">
          <Card className="bg-gradient-to-br from-primary/5 to-gold/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-6 w-6" />
                Research Transparency & Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Primary Sources</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sanskrit texts with traditional commentaries</li>
                    <li>• Archaeological reports from ASI and international teams</li>
                    <li>• Peer-reviewed genetic and linguistic studies</li>
                    <li>• Indigenous oral traditions and knowledge systems</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Validation Methods</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Cross-disciplinary peer review</li>
                    <li>• Reproducible astronomical calculations</li>
                    <li>• Comparative analysis with global evidence</li>
                    <li>• Integration with latest archaeological discoveries</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  This research builds on the work of scholars like B.B. Lal, Michel Danino, 
                  Koenraad Elst, David Frawley, and many others who have challenged colonial-era 
                  interpretations with rigorous interdisciplinary evidence.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-serif font-semibold text-foreground">
            Explore the Evidence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Dive deeper into specific articles that apply this framework to understand 
            India's role in shaping global civilization.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link to="/themes/ancient-india" className="flex items-center gap-2">
                Ancient India <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/themes/indian-ocean-world" className="flex items-center gap-2">
                Indian Ocean World <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/reading-room" className="flex items-center gap-2">
                Reading Room <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}