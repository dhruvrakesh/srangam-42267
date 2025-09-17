import React from 'react';
import { Building, Globe, BookOpen, Users, Award, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function InstitutionalPartnerships() {
  const corporatePartners = [
    {
      name: 'DKEGL (Dhruv Kumar Energy Group Ltd)',
      location: 'Mumbai, Maharashtra & Pan-India Operations',
      type: 'Primary Corporate Sponsor',
      specialization: 'Corporate Social Responsibility, Energy Infrastructure, Dharmic Research Patronage',
      description: 'Fortune 500 energy corporation committed to supporting traditional knowledge systems through comprehensive CSR initiatives. Leading patron of dharmic scholarship and cultural heritage preservation.',
      collections: ['Research Infrastructure Funding', 'Scholar Fellowship Programs', 'Digital Archive Development', 'Academic Publication Support'],
      website: 'https://dkegl.com',
      established: '1995',
      csrCommitment: '₹10 crores annually for dharmic research initiatives',
      culturalRole: 'मुख्य संरक्षक | Primary Patron of Dharmic Studies'
    },
    {
      name: 'Nartiang Foundation',
      location: 'Pan-India Heritage Sites',
      type: 'CSR Implementation Partner',
      specialization: 'Cultural Heritage Preservation, Academic Grant Management, Traditional Knowledge Documentation',
      description: 'DKEGL\'s dedicated CSR arm focusing on dharmic research, manuscript digitization, and traditional scholar support. Bridges corporate resources with indigenous knowledge systems.',
      collections: ['Manuscript Digitization Projects', 'Heritage Documentation', 'Scholar Grant Administration', 'Traditional Knowledge Archives'],
      established: '2020',
      csrCommitment: 'Direct implementation of ₹5 crores in cultural preservation',
      culturalRole: 'सांस्कृतिक संरक्षण प्रमुख | Cultural Preservation Leader'
    }
  ];

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
          Corporate social responsibility meeting dharmic scholarship through partnerships with leading Oriental research institutes and traditional knowledge centers
        </p>
      </div>

      {/* Corporate Sponsors Section */}
      <div className="space-y-6 mb-12">
        <div className="text-center">
          <h4 className="font-serif text-xl font-bold text-terracotta mb-2">
            कॉर्पोरेट संरक्षक | Corporate Patrons
          </h4>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Leading corporations supporting dharmic research through comprehensive CSR initiatives
          </p>
        </div>
        
        {corporatePartners.map((partner, index) => (
          <Card key={index} className="bg-gradient-to-br from-saffron/10 via-sandalwood/20 to-lotus-pink/10 border-2 border-saffron/30 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-5" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FF8C00' stroke-width='1'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Cpath d='M40 10 L50 30 L40 50 L30 30 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                 }} />
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-saffron/20 p-3 rounded-lg">
                      <Building className="h-6 w-6 text-saffron" />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-2xl text-foreground">
                        {partner.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {partner.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-saffron/20 text-saffron border-saffron/30 font-medium">
                      {partner.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Est. {partner.established}
                    </Badge>
                  </div>
                  <p className="text-peacock-blue font-medium text-sm mb-2">{partner.culturalRole}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Specialization</h4>
                  <p className="text-sm text-peacock-blue">{partner.specialization}</p>
                </div>
                
                <p className="text-muted-foreground">
                  {partner.description}
                </p>

                <div>
                  <h4 className="font-medium text-foreground mb-2">CSR Commitment & Key Initiatives</h4>
                  <div className="bg-sandalwood/20 p-3 rounded-lg mb-3">
                    <p className="text-saffron font-semibold">{partner.csrCommitment}</p>
                  </div>
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
                  <Button size="sm" variant="outline" className="border-saffron text-saffron hover:bg-saffron hover:text-charcoal">
                    <Users className="h-4 w-4 mr-1" />
                    CSR Partnership
                  </Button>
                  {partner.website && (
                    <Button size="sm" variant="outline">
                      <Globe className="h-4 w-4 mr-1" />
                      Corporate Website
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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

      {/* Enhanced Partnership Invitation */}
      <Card className="bg-gradient-to-br from-saffron/20 via-sandalwood/30 to-lotus-pink/20 border-2 border-saffron/40">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground text-center">
            संस्थागत सहयोग आमंत्रण | Partnership Invitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              <strong>Srangam meets Nartiang:</strong> Where corporate social responsibility supports dharmic research excellence through 
              comprehensive funding, academic partnerships, and cultural preservation initiatives. DKEGL's commitment to traditional 
              knowledge systems creates new pathways for institutional collaboration.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-sandalwood/20 p-4 rounded-lg">
                <h4 className="font-semibold text-terracotta mb-2">Corporate CSR</h4>
                <p className="text-sm text-muted-foreground">Multi-crore funding for dharmic research initiatives</p>
              </div>
              <div className="bg-sandalwood/20 p-4 rounded-lg">
                <h4 className="font-semibold text-terracotta mb-2">Academic Integration</h4>
                <p className="text-sm text-muted-foreground">Bridge traditional knowledge with modern scholarship</p>
              </div>
              <div className="bg-sandalwood/20 p-4 rounded-lg">
                <h4 className="font-semibold text-terracotta mb-2">Heritage Preservation</h4>
                <p className="text-sm text-muted-foreground">Comprehensive manuscript digitization programs</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-saffron hover:bg-saffron/90 text-charcoal">
                <Award className="h-4 w-4 mr-2" />
                Corporate Partnership
              </Button>
              <Button variant="outline" className="border-2 border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream">
                <Users className="h-4 w-4 mr-2" />
                Academic Collaboration
              </Button>
              <Button variant="outline" className="border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-cream">
                <BookOpen className="h-4 w-4 mr-2" />
                Heritage Partnership
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-sandalwood/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Next Application Cycle:</strong> March 2025 | Partnership proposals welcome year-round
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}