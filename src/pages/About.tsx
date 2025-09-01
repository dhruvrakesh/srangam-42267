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

        {/* Mission */}
        <div className="mb-16">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground flex items-center gap-2">
                <Target size={24} className="text-ocean" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Srangam investigates the long history of the Indian Ocean world through 
                    an interdisciplinary lens that combines material evidence, textual sources, 
                    and geological deep time. We seek to understand how monsoon rhythms, 
                    tectonic movements, and human agency shaped patterns of exchange, 
                    cultural transmission, and political organization.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our research challenges linear narratives of "ancient" versus "modern" 
                    by examining continuities and transformations across multiple timescales, 
                    from seasonal trading cycles to geological epochs.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                    Research Approach
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Globe size={16} className="text-ocean mt-1 flex-shrink-0" />
                      <span>Multiscalar analysis from local sites to ocean-wide networks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BookOpen size={16} className="text-gold mt-1 flex-shrink-0" />
                      <span>Integration of archaeological and textual evidence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin size={16} className="text-laterite mt-1 flex-shrink-0" />
                      <span>Deep time perspectives on environmental and geological change</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Team */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Research Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our interdisciplinary team brings together expertise in archaeology, history, 
              epigraphy, and earth sciences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-foreground">
                    {member.name}
                  </CardTitle>
                  <p className="text-ocean font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{member.expertise}</p>
                  <p className="text-sm text-muted-foreground">{member.institution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="mb-16">
          <Card className="bg-sand/20 border-border">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground text-center">
                Methodology & Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <IconScript size={48} className="mx-auto text-gold mb-4" />
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Epigraphy
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rock inscriptions, copper plates, and temple records across multiple 
                    scripts and languages provide evidence for political organization, 
                    trade guilds, and religious patronage.
                  </p>
                </div>
                <div className="text-center">
                  <IconMonsoon size={48} className="mx-auto text-ocean mb-4" />
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Maritime Archaeology
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Port excavations, shipwreck analysis, and ceramic studies reveal 
                    patterns of maritime trade, technology transfer, and cultural exchange 
                    across the Indian Ocean.
                  </p>
                </div>
                <div className="text-center">
                  <IconBasalt size={48} className="mx-auto text-laterite mb-4" />
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Geological Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tectonic history, sea level changes, and monsoon climate data provide 
                    the deep time context for understanding human adaptations and 
                    environmental constraints.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <div className="text-center">
          <Card className="bg-card border-border max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground">
                Get Involved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Interested in collaborating, accessing our data, or learning more about our research? 
                We welcome inquiries from scholars, students, and the general public.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-ocean hover:bg-ocean/90">
                  <Mail size={16} className="mr-2" />
                  Contact Team
                </Button>
                <Button variant="outline">
                  <Users size={16} className="mr-2" />
                  Join Mailing List
                </Button>
                <Button variant="outline">
                  <MapPin size={16} className="mr-2" />
                  Visit Lab
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}