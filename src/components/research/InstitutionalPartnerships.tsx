import React from 'react';
import { Building, Globe, BookOpen, Users, Award, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function InstitutionalPartnerships() {
  const partnerships = [
    {
      name: 'Bhandarkar Oriental Research Institute',
      location: 'Pune, Maharashtra',
      type: 'Primary Partner',
      specialization: 'Ancient manuscripts, Śāstric collections, Epigraphic research',
      description: 'Premier repository of Sanskrit manuscripts and inscriptional material supporting indigenous scholarly traditions.',
      collections: ['25,000+ Sanskrit manuscripts', 'Epigraphic archives', 'Vedic literature collection'],
      website: 'https://bori.ac.in',
      established: '1917'
    },
    {
      name: 'Hemchandra Raychaudhary Collection',
      location: 'Various Locations',
      type: 'Archive Partner', 
      specialization: 'Historical linguistics, Geographical studies, Indigenous chronology',
      description: 'Specialized collection focusing on linguistic archaeology and geographical references in ancient Indian texts.',
      collections: ['Historical linguistic materials', 'Geographic manuscripts', 'Chronological studies'],
      established: 'Legacy Collection'
    },
    {
      name: 'Deccan College Post-Graduate & Archaeological Institute',
      location: 'Pune, Maharashtra',
      type: 'Research Collaborator',
      specialization: 'Archaeological excavation, Anthropological research, Carbon dating',
      description: 'Leading archaeological institute providing scientific validation for historical continuity studies.',
      collections: ['Archaeological site reports', 'Anthropological data', 'Dating methodologies'],
      website: 'https://deccancollegepune.ac.in',
      established: '1821'
    },
    {
      name: 'Rashtriya Sanskrit Sansthan',
      location: 'New Delhi & Centers',
      type: 'Academic Partner',
      specialization: 'Sanskrit education, Traditional scholarship, Śāstra research',
      description: 'National institution preserving and promoting Sanskrit learning through traditional guru-śiṣya paramparā.',
      collections: ['Sanskrit curriculum', 'Traditional commentaries', 'Śāstric research'],
      website: 'https://sanskrit.nic.in',
      established: '1970'
    },
    {
      name: 'Indian National Science Academy',
      location: 'New Delhi',
      type: 'Scientific Collaborator',
      specialization: 'Archaeoastronomy, Genetic studies, Environmental science',
      description: 'Providing scientific methodologies for validating traditional Indian knowledge systems.',
      collections: ['Astronomical calculations', 'Genetic research data', 'Environmental studies'],
      website: 'https://www.insa.nic.in',
      established: '1935'
    },
    {
      name: 'International Association of Sanskrit Studies',
      location: 'Global Network',
      type: 'International Collaborator',
      specialization: 'Global Sanskrit scholarship, Cross-cultural studies, Academic exchange',
      description: 'Worldwide network of Sanskrit scholars supporting indigenous perspectives in global academia.',
      collections: ['International research', 'Comparative studies', 'Academic exchanges'],
      established: '1979'
    }
  ];

  const collaborationAreas = [
    {
      title: 'Manuscript Digitization',
      description: 'Collaborative digitization of palm-leaf manuscripts and ancient texts',
      partners: '4+ institutions',
      projects: '15 active projects'
    },
    {
      title: 'Archaeological Validation',
      description: 'Scientific dating and analysis of archaeological finds supporting textual evidence',
      partners: '3+ institutions', 
      projects: '8 ongoing excavations'
    },
    {
      title: 'Linguistic Research',
      description: 'Comparative linguistic studies supporting Sanskrit\'s antiquity and indigenous development',
      partners: '6+ institutions',
      projects: '12 research initiatives'
    },
    {
      title: 'Genetic Studies Integration',
      description: 'Correlating genetic research with traditional accounts of population continuity',
      partners: '2+ institutions',
      projects: '5 collaborative studies'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
          संस्थागत सहयोग | Institutional Partnerships
        </h3>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Collaborating with leading Oriental research institutes and traditional scholarship centers across Bharat and internationally
        </p>
      </div>

      {/* Collaboration Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {collaborationAreas.map((area, index) => (
          <Card key={index} className="bg-sandalwood/10 border-turmeric/20">
            <CardHeader>
              <CardTitle className="font-serif text-lg text-foreground">
                {area.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                {area.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {area.partners}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {area.projects}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Partner Institutions */}
      <div className="space-y-6">
        {partnerships.map((partner, index) => (
          <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-saffron/10 p-2 rounded-lg">
                      <Building className="h-5 w-5 text-saffron" />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-xl text-foreground">
                        {partner.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {partner.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-ocean/10 text-ocean border-ocean/20">
                      {partner.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Est. {partner.established}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Specialization</h4>
                  <p className="text-sm text-peacock-blue">{partner.specialization}</p>
                </div>
                
                <p className="text-muted-foreground">
                  {partner.description}
                </p>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Key Collections & Resources</h4>
                  <ul className="space-y-1">
                    {partner.collections.map((collection, colIndex) => (
                      <li key={colIndex} className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-3 w-3 text-turmeric" />
                        <span className="text-muted-foreground">{collection}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    View Collaboration
                  </Button>
                  {partner.website && (
                    <Button size="sm" variant="outline">
                      <Globe className="h-4 w-4 mr-1" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Partnership Invitation */}
      <Card className="bg-gradient-to-br from-sandalwood/80 to-lotus-pink/20 border-2 border-saffron/30">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground text-center">
            संस्थागत सहयोग आमंत्रण | Partnership Invitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Srangam meets Nartiang: Where corporate social responsibility supports dharmic research excellence. 
              Institutions interested in supporting indigenous scholarship frameworks are invited to join our network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-saffron hover:bg-saffron/90 text-charcoal">
                <Award className="h-4 w-4 mr-2" />
                Become a Partner
              </Button>
              <Button variant="outline" className="border-2 border-indigo-dharma text-indigo-dharma hover:bg-indigo-dharma hover:text-cream">
                Partnership Guidelines
              </Button>
              <Button variant="outline" className="border-2 border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream">
                Research Collaboration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}