import { Users, Mail, MapPin, BookOpen, Globe, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconMonsoon, IconScript, IconBasalt } from "@/components/icons";

export default function About() {
  const team = [
    {
      name: "Dr. Sarah Chennai",
      role: "Principal Investigator",
      expertise: "Maritime Archaeology, Roman-Indian Trade",
      institution: "University of Kerala"
    },
    {
      name: "Prof. Ahmed Hassan",
      role: "Co-Investigator", 
      expertise: "Navigation History, Arabic Sources",
      institution: "Cairo University"
    },
    {
      name: "Dr. Priya Venkat",
      role: "Epigraphy Lead",
      expertise: "South Indian Inscriptions, Paleography",
      institution: "Deccan College"
    },
    {
      name: "Dr. James Morton",
      role: "Geological Consultant",
      expertise: "Tectonic History, Deep Time Analysis",
      institution: "Oxford University"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center gap-4 mb-6">
            <IconMonsoon size={48} className="text-ocean" />
            <IconScript size={48} className="text-gold" />
            <IconBasalt size={48} className="text-laterite" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About Srangam
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Exploring the interconnected histories of the Indian Ocean through interdisciplinary 
            research that brings together archaeology, epigraphy, and deep time perspectives.
          </p>
        </div>

        {/* Mission - Sacred Purpose */}
        <div className="mb-20">
          <Card className="bg-card border-2 border-saffron/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 chakra-pattern opacity-5" />
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-foreground flex items-center gap-4 justify-center mb-4">
                <IconConch size={32} className="text-peacock-blue om-pulse" />
                <span>हमारा मिशन | Our Sacred Mission</span>
                <IconLotus size={32} className="text-lotus-pink lotus-bloom" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="text-indigo-dharma text-lg mb-4 font-serif text-center lg:text-left">
                    सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Srangam investigates the long history of the Indian Ocean world through 
                    a dharmic lens that combines material evidence, textual sources, 
                    and geological deep time. We seek to understand how मानसून (monsoon) rhythms, 
                    tectonic movements, and human agency shaped patterns of exchange, 
                    cultural transmission, and political organization.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our research challenges linear narratives by examining continuities 
                    and transformations across multiple timescales — from seasonal trading 
                    cycles to cosmic कल्प (kalpa) epochs — in the tradition of ancient 
                    Indian scholars who saw time as cyclical rather than linear.
                  </p>
                </div>
                <div className="bg-sandalwood/30 p-6 rounded-xl border border-saffron/20">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <IconDharmaChakra size={24} className="text-turmeric chakra-spin" />
                    अष्टांग पद्धति | Eightfold Research Path
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <IconOm size={16} className="text-saffron mt-1 flex-shrink-0" />
                      <span><strong>सम्यक् दृष्टि:</strong> Right understanding through multiscalar analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <IconLotus size={16} className="text-lotus-pink mt-1 flex-shrink-0" />
                      <span><strong>सम्यक् वाक्:</strong> Integration of archaeological and textual evidence</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <IconConch size={16} className="text-peacock-blue mt-1 flex-shrink-0" />
                      <span><strong>सम्यक् कर्म:</strong> Deep time perspectives on environmental change</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Team - Dharmic Scholars */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <IconSarnathLion size={48} className="text-saffron lotus-bloom" />
            </div>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              विद्वत् मण्डल | Scholar Assembly
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Our interdisciplinary आश्रम (ashram) brings together expertise in archaeology, history, 
              epigraphy, and earth sciences in the tradition of ancient Indian seats of learning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-card border-2 border-turmeric/20 relative overflow-hidden shadow-lg lotus-bloom" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="absolute inset-0 mandala-bg opacity-5" />
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-saffron/20 to-turmeric/20 rounded-full flex items-center justify-center">
                      <IconOm size={24} className="text-saffron" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-serif text-xl text-foreground">
                        {member.name}
                      </CardTitle>
                      <p className="text-indigo-dharma font-medium text-sm mb-1">{member.sanskrit}</p>
                      <p className="text-peacock-blue font-medium">{member.role}</p>
                      <p className="text-turmeric text-sm">{member.dharmic}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{member.expertise}</p>
                  <p className="text-sm text-muted-foreground">{member.institution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Methodology - Sacred Knowledge Systems */}
        <div className="mb-20">
          <Card className="bg-lotus-pink/10 border-2 border-lotus-pink/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 dharma-scroll opacity-20" />
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-foreground text-center mb-4">
                त्रिविद्या पद्धति | Sacred Knowledge Methodology
              </CardTitle>
              <p className="text-center text-muted-foreground text-lg max-w-3xl mx-auto">
                Following the ancient Indian tradition of त्रिविद्या (three sacred knowledges), 
                we integrate material, textual, and temporal evidence.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="bg-sandalwood/50 p-8 rounded-xl border border-turmeric/30 mb-6 group-hover:bg-turmeric/20 transition-all duration-300">
                    <IconScript size={56} className="mx-auto text-turmeric mb-4 om-pulse" />
                    <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                      शिलालेख विद्या | Epigraphy
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      श्रुति and स्मृति sources: Rock inscriptions, copper plates, and temple records 
                      across multiple scripts reveal political organization, trade guilds, and dharmic patronage 
                      following ancient Indian scholarly traditions.
                    </p>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="bg-sandalwood/50 p-8 rounded-xl border border-peacock-blue/30 mb-6 group-hover:bg-peacock-blue/20 transition-all duration-300">
                    <IconConch size={56} className="mx-auto text-peacock-blue mb-4 lotus-bloom" />
                    <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                      सागर पुरातत्त्व | Maritime Archaeology
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      वरुण साम्राज्य study: Port excavations, shipwreck analysis, and ceramic studies 
                      reveal patterns of maritime dharma, technology transfer, and cultural संग्राम 
                      across the sacred waters.
                    </p>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="bg-sandalwood/50 p-8 rounded-xl border border-terracotta/30 mb-6 group-hover:bg-terracotta/20 transition-all duration-300">
                    <IconBasalt size={56} className="mx-auto text-terracotta mb-4 chakra-spin" />
                    <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                      काल चक्र विज्ञान | Deep Time Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      महाकल्प perspective: Tectonic history, sea level changes, and monsoon climate 
                      data provide the cosmic time context for understanding human adaptations 
                      across geological युग (epochs).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact - Sacred Invitation */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-sandalwood/80 to-lotus-pink/20 border-2 border-saffron/30 max-w-3xl mx-auto relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 mandala-bg opacity-10" />
            <CardHeader>
              <div className="flex justify-center mb-4">
                <IconLotus size={48} className="text-lotus-pink lotus-bloom" />
              </div>
              <CardTitle className="font-serif text-3xl text-foreground mb-4">
                सहयोग आमंत्रण | Sacred Collaboration
              </CardTitle>
              <div className="text-indigo-dharma text-lg mb-4 font-serif">
                आगच्छन्तु विद्वांसः | आगच्छन्तु जिज्ञासवः
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Interested in joining our dharmic scholarly community? We welcome collaborations 
                from researchers, students, and seekers of knowledge who share our vision of 
                integrative, respectful scholarship rooted in Indian Ocean wisdom traditions.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button className="bg-saffron hover:bg-saffron-light text-charcoal-om shadow-xl hover:scale-105 transition-all duration-300">
                  <IconConch size={18} className="mr-2" />
                  Join Our आश्रम
                </Button>
                <Button variant="outline" className="border-2 border-indigo-dharma text-indigo-dharma hover:bg-indigo-dharma hover:text-sandalwood shadow-xl hover:scale-105 transition-all duration-300">
                  <IconOm size={18} className="mr-2" />
                  Visit Research Centre
                </Button>
                <Button variant="outline" className="border-2 border-turmeric text-turmeric hover:bg-turmeric hover:text-charcoal-om shadow-xl hover:scale-105 transition-all duration-300">
                  <IconDharmaChakra size={18} className="mr-2" />
                  Access Sacred Texts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}