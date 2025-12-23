import { Users, Mail, MapPin, BookOpen, Globe, Target, Award, Network, Database, Mountain, Map, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconMonsoon, IconScript, IconBasalt, IconDharmaChakra, IconSarnathLion } from "@/components/icons";
import { ResearchCentre } from "@/components/research/ResearchCentre";
import { useNavigate } from 'react-router-dom';
import { useResearchStats } from "@/hooks/useResearchStats";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function About() {
  const navigate = useNavigate();
  const { totalArticles, crossReferences, culturalTerms, isLoading } = useResearchStats();
  
  // Intersection observers for scroll animations
  const missionSection = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const researchSection = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const scholarsSection = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const sponsorsSection = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  
  const handleApplicationGuidelines = () => {
    const guidelines = `
SRANGAM/NARTIANG FELLOWSHIP APPLICATION GUIDELINES

धर्मिक अनुसंधान छात्रवृत्ति | Dharmic Research Fellowship

ELIGIBILITY:
• Traditional scholars with gurukula training
• Academic researchers with PhD in relevant fields  
• Heritage institution representatives
• Minimum 3 years experience in primary source research

APPLICATION PROCESS:
1. Submit research proposal (max 2000 words)
2. Provide CV with publication list
3. Include 3 academic references
4. Demonstrate Sanskrit/regional language proficiency
5. Submit digital portfolio of previous work

FELLOWSHIP DETAILS:
• Duration: 12 months (renewable)
• Stipend: ₹50,000/month + research expenses
• Office space at Nartiang Research Center
• Access to digitized manuscript collections
• Mentorship from senior scholars
• Publication support for research output

EVALUATION CRITERIA:
• Adherence to indigenous methodologies (30%)
• Academic rigor and innovation (25%)
• Contribution to dharmic scholarship (25%)
• Feasibility and timeline (20%)

SUBMISSION DEADLINE: March 31, 2025
NOTIFICATION: June 15, 2025
FELLOWSHIP COMMENCEMENT: August 1, 2025

For detailed application form and requirements:
Email: fellowships@nartiang.org
Phone: +91-11-4567-8901

विद्या ददाति विनयं | Knowledge bestows humility
    `;
    
    const blob = new Blob([guidelines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Srangam-Fellowship-Guidelines-2025.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFellowshipDetails = () => {
    window.location.href = "mailto:fellowships@nartiang.org?subject=Fellowship Details Inquiry&body=Please provide detailed information about Srangam/Nartiang Fellowship programs, including application requirements, selection criteria, and fellowship benefits.";
  };

  const handleContactNartiang = () => {
    window.location.href = "mailto:contact@nartiang.org?subject=General Inquiry - Nartiang Foundation&body=I would like to learn more about Nartiang Foundation's dharmic research initiatives and how I can get involved.";
  };

  // Research themes for the overview section
  const researchThemes = [
    { name: "Ancient India", icon: IconSarnathLion, color: "text-saffron" },
    { name: "Indian Ocean World", icon: IconMonsoon, color: "text-peacock-blue" },
    { name: "Scripts & Inscriptions", icon: IconScript, color: "text-indigo-dharma" },
    { name: "Geology & Deep Time", icon: IconBasalt, color: "text-terracotta" },
    { name: "Empires & Exchange", icon: IconDharmaChakra, color: "text-turmeric" },
  ];

  const principalInvestigators = [
    {
      name: "Kanika Rakesh",
      role: "Principal Investigator",
      expertise: "Ancient Indian History, Maritime Studies, Indo-Roman Trade Networks, Archaeological Analysis", 
      institution: "Lead Research Director",
      culturalRole: "मुख्य अन्वेषक | Principal Investigator",
      articles: ["Maritime Memories of South India", "Scripts that Sailed", "Indian Ocean Power Networks", "Earth Sea Sangam", "Riders on the Monsoon"],
      specializations: ["Epigraphic Analysis", "Trade Network Mapping", "Cultural Exchange Patterns"]
    },
    {
      name: "Dhruv Rakesh", 
      role: "Co-Principal Investigator",
      expertise: "Historical Analysis, Digital Humanities, Computational Archaeology, Data Visualization",
      institution: "Research Technology Director", 
      culturalRole: "सह-मुख्य अन्वेषक | Co-Principal Investigator",
      articles: ["Interactive Maps Development", "Digital Timeline Creation", "Database Architecture"],
      specializations: ["Digital Archaeological Methods", "Interactive Visualization", "Database Design"]
    }
  ];

  const subjectMatterExperts = [
    {
      name: "Mrs. Rekha Bansal, MA History",
      role: "Subject Matter Expert",
      expertise: "Indian Ocean Maritime Systems, Historical Navigation, Cultural History",
      institution: "Historical Research Specialist",
      culturalRole: "विषय विशेषज्ञ | Domain Expert",
      articles: ["Monsoon Trade Clock"],
      specializations: ["Historical Analysis", "Maritime Studies", "Cultural Documentation"]
    },
    {
      name: "Dr. Geological Survey Team",
      role: "Geological Consultant",
      expertise: "Plate Tectonics, Geological Dating, Coastal Evolution, Deep Time Analysis", 
      institution: "Earth Sciences Research Group",
      culturalRole: "भूविज्ञान सलाहकार | Geological Advisor",
      articles: ["Gondwana to Himalaya"],
      specializations: ["Tectonic Analysis", "Geological Dating", "Coastal Change Studies"]
    },
    {
      name: "Dr. Epigraphy Specialist",
      role: "Epigraphic Consultant", 
      expertise: "Ancient Inscriptions, Multi-script Analysis, Paleographic Dating",
      institution: "Epigraphic Studies Institute",
      culturalRole: "शिलालेख विशेषज्ञ | Inscription Expert", 
      articles: ["Ashoka Kandahar Edicts"],
      specializations: ["Greek Epigraphy", "Aramaic Scripts", "Imperial Inscriptions"]
    },
    {
      name: "Dr. Epigraphic Studies Team",
      role: "Sanskrit Inscription Specialist",
      expertise: "Sanskrit Epigraphy, Southeast Asian Inscriptions, Vedic Terminology Analysis",
      institution: "Sanskrit Studies Research Center", 
      culturalRole: "संस्कृत शिलालेख विद्वान | Sanskrit Inscription Scholar",
      articles: ["Kutai Yupa Borneo"],
      specializations: ["Sanskrit Paleography", "Vedic Ritual Terminology", "Southeast Asian Studies"]
    }
  ];

  const institutionalSponsors = [
    {
      name: "DKEGL (D K Enterprises Global Limited)",
      role: "Primary Institutional Sponsor",
      expertise: "Sustainable Packaging Solutions, Corporate Social Responsibility, Dharmic Research Patronage",
      institution: "NSE-Listed SME Manufacturing Corporation (Market Cap: ₹48.8 crores)",
      culturalRole: "मुख्य संरक्षक | Primary Patron",
      contributions: ["Research Infrastructure", "Scholar Fellowships", "Digital Archive Development", "Publication Support"]
    },
    {
      name: "Nartiang Foundation",
      role: "CSR Implementation Partner", 
      expertise: "Cultural Heritage Preservation, Academic Grant Management, Traditional Knowledge Systems",
      institution: "DKEGL Corporate Social Responsibility Initiative",
      culturalRole: "सांस्कृतिक संरक्षण | Cultural Preservation",
      contributions: ["Manuscript Digitization", "Scholar Grants", "Heritage Documentation", "Academic Conferences"]
    }
  ];

  const csrInitiatives = [
    {
      name: "Srangam Research Fellowships",
      type: "Academic Scholarship Program",
      description: "Annual fellowships supporting graduate and post-doctoral research in dharmic studies and indigenous knowledge systems",
      eligibility: ["PhD candidates in Indology", "Post-docs in Archaeological Sciences", "Traditional Sanskrit scholars"],
      funding: "₹10 lakhs per fellowship annually",
      culturalFocus: "परम्परागत विद्या | Traditional Knowledge Systems"
    },
    {
      name: "Nartiang Manuscript Initiative", 
      type: "Digital Heritage Program",
      description: "Comprehensive digitization of palm-leaf manuscripts, temple archives, and traditional knowledge repositories",
      eligibility: ["Heritage institutions", "Traditional libraries", "Gurukula archives"],
      funding: "₹25 lakhs for institutional partnerships",
      culturalFocus: "पुस्तक संरक्षण | Manuscript Preservation"
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dharmic Ashram Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sandalwood/20 via-cream to-saffron/10" />
      <div className="absolute inset-0 opacity-[0.04]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FF6600' stroke-width='1.5' opacity='0.4'%3E%3Ccircle cx='50' cy='50' r='35' fill='none'/%3E%3Cpath d='M50 15 L55 35 L50 55 L45 35 Z' fill='%23D4A574' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ============ SECTION 1: MISSION STATEMENT (NEW - AT TOP) ============ */}
        <div 
          ref={missionSection.ref}
          className={`mb-20 transition-all duration-700 ease-out ${
            missionSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Dharmic Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-ocean/20 rounded-full blur-2xl transform scale-110"></div>
                <div className="relative bg-gradient-to-br from-ocean to-peacock-blue p-8 rounded-full shadow-2xl border-2 border-lotus-pink/20">
                  <IconMonsoon size={48} className="text-cream" />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-saffron/20 rounded-full blur-2xl transform scale-110"></div>
                <div className="relative bg-gradient-to-br from-saffron to-turmeric p-8 rounded-full shadow-2xl border-2 border-terracotta/20">
                  <IconScript size={48} className="text-cream" />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-laterite/20 rounded-full blur-2xl transform scale-110"></div>
                <div className="relative bg-gradient-to-br from-laterite to-terracotta p-8 rounded-full shadow-2xl border-2 border-saffron/20">
                  <IconBasalt size={48} className="text-cream" />
                </div>
              </div>
            </div>
            <div className="relative">
              <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-saffron via-turmeric to-terracotta bg-clip-text text-transparent">
                  श्रंगम दृष्टि
                </span>
              </h1>
              <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-terracotta mb-8">
                The Srangam Vision
              </h2>
            </div>
          </div>

          {/* Mission Statement Card */}
          <Card className="bg-gradient-to-br from-saffron/5 via-sandalwood/10 to-lotus-pink/5 border-2 border-saffron/20 shadow-xl mb-12">
            <CardContent className="p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <p className="text-lg lg:text-xl text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-saffron">Srangam is a civilizational research initiative</strong> dedicated to recovering, 
                  preserving, and presenting the interconnected histories of the Indian Ocean World through 
                  indigenous methodological frameworks.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  We don't just <em>translate</em> the past — we <strong>triangulate</strong> it. Our scholarship 
                  weaves together archaeological evidence, textual traditions, and sacred geography to illuminate 
                  how civilizations traded, believed, and remembered across millennia.
                </p>
                <div className="mt-8 p-6 bg-sandalwood/10 backdrop-blur-sm rounded-2xl border border-saffron/20">
                  <div className="text-saffron font-serif text-lg mb-2">विद्या ददाति विनयं विनयाद्याति पात्रताम्</div>
                  <div className="text-muted-foreground text-sm italic">
                    "Knowledge bestows humility; from humility comes worthiness" — Hitopadesha
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Three Methodological Pillars */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card/80 border-terracotta/30 hover:border-terracotta transition-colors">
              <CardHeader className="text-center pb-2">
                <Mountain className="w-10 h-10 mx-auto mb-3 text-terracotta" />
                <CardTitle className="font-serif text-lg text-foreground">Archaeological</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Epigraphy, numismatics, and material culture — the stone records of civilization
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-burgundy/30 hover:border-burgundy transition-colors">
              <CardHeader className="text-center pb-2">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-burgundy" />
                <CardTitle className="font-serif text-lg text-foreground">Textual</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Purāṇas, itihāsa, śāstric literature — the living memory of tradition
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-peacock-blue/30 hover:border-peacock-blue transition-colors">
              <CardHeader className="text-center pb-2">
                <Map className="w-10 h-10 mx-auto mb-3 text-peacock-blue" />
                <CardTitle className="font-serif text-lg text-foreground">Geo-mythological</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Sacred geography meets geological memory — place as palimpsest
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ============ SECTION 2: RESEARCH OVERVIEW (NEW) ============ */}
        <div 
          ref={researchSection.ref}
          className={`mb-20 transition-all duration-700 ease-out ${
            researchSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              ज्ञान संग्रह | Knowledge Corpus
            </h2>
            <p className="text-muted-foreground max-w-4xl mx-auto text-lg">
              Our growing research corpus represents years of scholarly work, connecting primary sources 
              across languages, regions, and disciplines.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-saffron/10 to-transparent border-saffron/30 text-center p-6">
              <div className="text-4xl lg:text-5xl font-bold text-saffron mb-2">
                {isLoading ? <Skeleton className="h-12 w-16 mx-auto" /> : `${totalArticles}+`}
              </div>
              <div className="font-medium text-foreground">Research Articles</div>
              <div className="text-xs text-muted-foreground">Long-form scholarship</div>
            </Card>
            <Card className="bg-gradient-to-br from-peacock-blue/10 to-transparent border-peacock-blue/30 text-center p-6">
              <div className="text-4xl lg:text-5xl font-bold text-peacock-blue mb-2">
                {isLoading ? <Skeleton className="h-12 w-16 mx-auto" /> : crossReferences.toLocaleString()}
              </div>
              <div className="font-medium text-foreground">Cross-References</div>
              <div className="text-xs text-muted-foreground">Interconnected insights</div>
            </Card>
            <Card className="bg-gradient-to-br from-terracotta/10 to-transparent border-terracotta/30 text-center p-6">
              <div className="text-4xl lg:text-5xl font-bold text-terracotta mb-2">
                {isLoading ? <Skeleton className="h-12 w-16 mx-auto" /> : culturalTerms.toLocaleString()}
              </div>
              <div className="font-medium text-foreground">Cultural Terms</div>
              <div className="text-xs text-muted-foreground">Sanskrit & regional vocabulary</div>
            </Card>
            <Card className="bg-gradient-to-br from-turmeric/10 to-transparent border-turmeric/30 text-center p-6">
              <div className="text-4xl lg:text-5xl font-bold text-turmeric mb-2">5</div>
              <div className="font-medium text-foreground">Research Themes</div>
              <div className="text-xs text-muted-foreground">Multidisciplinary pillars</div>
            </Card>
          </div>

          {/* Research Themes */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {researchThemes.map((theme, index) => {
              const IconComponent = theme.icon;
              return (
                <div 
                  key={theme.name}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-saffron/50 transition-colors"
                >
                  <IconComponent size={18} className={theme.color} />
                  <span className="text-sm font-medium text-foreground">{theme.name}</span>
                </div>
              );
            })}
          </div>

          {/* CTA to Research Network */}
          <div className="text-center">
            <Button asChild variant="outline" className="border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream">
              <Link to="/research-network">
                <Network className="w-4 h-4 mr-2" />
                Explore Research Network
              </Link>
            </Button>
          </div>
        </div>

        {/* ============ SECTION 3: SCHOLAR ASSEMBLY (MOVED DOWN) ============ */}
        <div 
          ref={scholarsSection.ref}
          className={`mb-20 transition-all duration-700 ease-out ${
            scholarsSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              विद्वत् मण्डल | Scholar Assembly
            </h2>
            <p className="text-muted-foreground max-w-4xl mx-auto text-lg">
              Our interdisciplinary आश्रम (ashram) brings together expertise in archaeology, history, 
              epigraphy, and earth sciences in the tradition of ancient Indian seats of learning.
            </p>
          </div>

          {/* Principal Investigators */}
          <div className="mb-12">
            <h3 className="font-serif text-2xl font-bold text-center mb-8 text-terracotta">
              मुख्य अन्वेषकगण | Principal Investigators
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {principalInvestigators.map((member, index) => (
                <Card key={index} className="bg-card border-2 border-turmeric/30 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-saffron/20 to-turmeric/20 rounded-full flex items-center justify-center">
                        <Users size={24} className="text-saffron" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-serif text-xl text-foreground mb-1">
                          {member.name}
                        </CardTitle>
                        <p className="text-saffron font-medium text-sm mb-1">{member.culturalRole}</p>
                        <p className="text-peacock-blue font-medium">{member.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{member.expertise}</p>
                    <p className="text-sm text-muted-foreground mb-3">{member.institution}</p>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-foreground mb-2 text-sm">Research Contributions</h4>
                      <p className="text-xs text-peacock-blue">{member.articles.length} articles published</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2 text-sm">Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.specializations.map((spec, specIndex) => (
                          <span key={specIndex} className="text-xs px-2 py-1 bg-sandalwood/20 text-terracotta rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Subject Matter Experts */}
          <div className="mb-12">
            <h3 className="font-serif text-2xl font-bold text-center mb-8 text-terracotta">
              विषय विशेषज्ञगण | Subject Matter Experts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjectMatterExperts.map((expert, index) => (
                <Card key={index} className="bg-card border border-turmeric/20 relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-peacock-blue/20 to-ocean/20 rounded-full flex items-center justify-center">
                        <BookOpen size={18} className="text-peacock-blue" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-serif text-lg text-foreground leading-tight">
                          {expert.name}
                        </CardTitle>
                        <p className="text-xs text-saffron font-medium">{expert.culturalRole}</p>
                      </div>
                    </div>
                    <p className="text-peacock-blue font-medium text-sm">{expert.role}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{expert.expertise}</p>
                    <p className="text-xs text-muted-foreground mb-3">{expert.institution}</p>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-foreground mb-1 text-xs">Specializations</h4>
                      <div className="space-y-1">
                        {expert.specializations.slice(0,2).map((spec, specIndex) => (
                          <span key={specIndex} className="block text-xs px-2 py-0.5 bg-sandalwood/15 text-terracotta rounded text-center">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* ============ SECTION 4: INSTITUTIONAL SPONSORS (MOVED TO BOTTOM) ============ */}
        <div 
          ref={sponsorsSection.ref}
          className={`mb-20 transition-all duration-700 ease-out ${
            sponsorsSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              संस्थागत संरक्षक | Institutional Support
            </h2>
            <p className="text-muted-foreground max-w-4xl mx-auto text-lg">
              विद्यादानं महादानम् — The gift of knowledge is the greatest gift. Corporate social responsibility 
              meeting dharmic scholarship traditions in support of indigenous knowledge systems.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 mb-12">
            {institutionalSponsors.map((sponsor, index) => (
              <Card key={index} className="bg-gradient-to-br from-saffron/10 via-sandalwood/20 to-lotus-pink/10 border-2 border-saffron/30 relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5" 
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FF8C00' stroke-width='1'%3E%3Ccircle cx='30' cy='30' r='25'/%3E%3Cpath d='M30 5 L35 25 L30 45 L25 25 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                     }} />
                <CardHeader className="relative z-10">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-saffron/20 to-turmeric/30 rounded-full flex items-center justify-center border-2 border-saffron/20">
                      <Target size={32} className="text-saffron" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-serif text-2xl text-foreground mb-2">
                        {sponsor.name}
                      </CardTitle>
                      <p className="text-saffron font-semibold text-lg mb-1">{sponsor.culturalRole}</p>
                      <p className="text-peacock-blue font-medium">{sponsor.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground mb-4 text-lg">{sponsor.expertise}</p>
                  <p className="text-sm text-muted-foreground mb-4">{sponsor.institution}</p>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Contributions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sponsor.contributions.map((contribution, contIndex) => (
                        <div key={contIndex} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-saffron rounded-full"></div>
                          <span className="text-muted-foreground">{contribution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CSR Initiatives */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                भावी छात्रवृत्ति योजना | Future Scholarship Programs  
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Nartiang/Srangam CSR initiatives supporting the next generation of dharmic scholars.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {csrInitiatives.map((initiative, index) => (
                <Card key={index} className="bg-gradient-to-br from-sandalwood/20 to-lotus-pink/10 border-2 border-terracotta/20 relative overflow-hidden shadow-lg">
                  <CardHeader className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-saffron/30 to-terracotta/30 rounded-full flex items-center justify-center">
                        <Award size={20} className="text-saffron" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-serif text-xl text-foreground mb-2">
                          {initiative.name}
                        </CardTitle>
                        <p className="text-saffron font-medium text-sm mb-1">{initiative.culturalFocus}</p>
                        <p className="text-peacock-blue font-medium text-sm">{initiative.type}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground mb-4 leading-relaxed">{initiative.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2 text-sm">Funding Support</h4>
                      <p className="text-saffron font-bold">{initiative.funding}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-sm">Eligibility</h4>
                      <ul className="space-y-1">
                        {initiative.eligibility.map((criteria, critIndex) => (
                          <li key={critIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-terracotta rounded-full"></div>
                            <span className="text-muted-foreground">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Application Process */}
          <Card className="bg-gradient-to-br from-saffron/10 via-sandalwood/20 to-turmeric/10 border-2 border-saffron/30">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground text-center">
                आवेदन प्रक्रिया | Application Process  
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                  Applications for Srangam/Nartiang fellowships open annually in March. Traditional scholars, 
                  academic researchers, and heritage institutions are encouraged to apply.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-saffron hover:bg-saffron/90 text-charcoal"
                    onClick={handleApplicationGuidelines}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Application Guidelines
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream"
                    onClick={handleFellowshipDetails}
                  >
                    Fellowship Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-cream"
                    onClick={handleContactNartiang}
                  >
                    Contact Nartiang Foundation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Centre Section */}
        <ResearchCentre />
      </div>
    </div>
  );
}
