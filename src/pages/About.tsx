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
    <div className="min-h-screen relative overflow-hidden">
      {/* Dharmic Ashram Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sandalwood/20 via-cream to-saffron/10" />
      <div className="absolute inset-0 opacity-[0.04]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FF6600' stroke-width='1.5' opacity='0.4'%3E%3Ccircle cx='50' cy='50' r='35' fill='none'/%3E%3Cpath d='M50 15 L55 35 L50 55 L45 35 Z' fill='%23D4A574' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dharmic Header */}
        <div className="text-center mb-16">
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
                श्रंगम परिचय
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-terracotta mb-8">
              About Our Dharmic Research Community
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              विद्या ददाति विनयं — Knowledge bestows humility. Exploring the interconnected histories 
              of the Indian Ocean through dharmic scholarly traditions that honor ancient wisdom 
              while advancing contemporary understanding.
            </p>
            <div className="mt-6 h-1 w-32 bg-gradient-to-r from-saffron via-turmeric to-terracotta mx-auto rounded-full"></div>
            
            {/* Sanskrit Shloka */}
            <div className="mt-8 p-6 bg-sandalwood/10 backdrop-blur-sm rounded-2xl border border-saffron/20 max-w-2xl mx-auto">
              <div className="text-saffron font-serif text-lg mb-2">सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</div>
              <div className="text-charcoal/70 text-sm italic">
                "May all beings be happy, may all beings be healthy" — Brihadaranyaka Upanishad
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
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
              <Card key={index} className="bg-card border-2 border-turmeric/20 relative overflow-hidden shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-saffron/20 to-turmeric/20 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-saffron" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-serif text-xl text-foreground">
                        {member.name}
                      </CardTitle>
                      <p className="text-peacock-blue font-medium">{member.role}</p>
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

        {/* Contact Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-sandalwood/80 to-lotus-pink/20 border-2 border-saffron/30 max-w-3xl mx-auto relative overflow-hidden shadow-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-foreground mb-4">
                सहयोग आमंत्रण | Sacred Collaboration
              </CardTitle>
              <div className="text-indigo-dharma text-lg mb-4 font-serif">
                आगच्छन्तु विद्वांसः | आगच्छन्तु जिज्ञासवः
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Interested in joining our dharmic scholarly community? We welcome collaborations 
                from researchers, students, and seekers of knowledge who share our vision of 
                integrative, respectful scholarship rooted in Indian Ocean wisdom traditions.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button className="bg-saffron hover:bg-saffron/90 text-charcoal shadow-xl">
                  Join Our आश्रम
                </Button>
                <Button variant="outline" className="border-2 border-indigo-dharma text-indigo-dharma hover:bg-indigo-dharma hover:text-sandalwood shadow-xl">
                  Visit Research Centre
                </Button>
                <Button variant="outline" className="border-2 border-turmeric text-turmeric hover:bg-turmeric hover:text-charcoal shadow-xl">
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