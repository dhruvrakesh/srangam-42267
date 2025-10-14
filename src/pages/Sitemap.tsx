import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IconDharmaChakra, 
  IconLotus, 
  IconScript, 
  IconBasalt, 
  IconEdict,
  IconPort,
  IconMonsoon,
  IconConch,
  IconOm,
  IconSarnathLion
} from "@/components/icons";
import { BookOpen, Map, Users, FileText, Archive, Search } from "lucide-react";

export default function Sitemap() {
  const shastraContent = [
    {
      title: "Featured Articles",
      icon: <IconScript size={20} />,
      items: [
        { title: "Monsoon Trade Clock", path: "/monsoon-trade-clock" },
        { title: "Scripts That Sailed", path: "/scripts-that-sailed" },
        { title: "Gondwana to Himalaya", path: "/gondwana-to-himalaya" },
        { title: "Indian Ocean Power Networks", path: "/indian-ocean-power-networks" },
        { title: "Ashoka's Kandahar Edicts", path: "/ashoka-kandahar-edicts" },
        { title: "Kutai Yūpa Borneo", path: "/kutai-yupa-borneo" },
        { title: "Maritime Memories South India", path: "/maritime-memories-south-india" },
        { title: "Riders on Monsoon", path: "/riders-on-monsoon" },
        { title: "Earth Sea Sangam", path: "/earth-sea-sangam" },
        { title: "Reassessing Rigveda Antiquity", path: "/reassessing-rigveda-antiquity" },
      ]
    },
    {
      title: "Research Themes",
      icon: <IconDharmaChakra size={20} />,
      items: [
        { title: "Ancient India", path: "/themes/ancient-india" },
        { title: "Indian Ocean World", path: "/themes/indian-ocean-world" },
        { title: "Scripts & Inscriptions", path: "/themes/scripts-inscriptions" },
        { title: "Geology & Deep Time", path: "/themes/geology-deep-time" },
        { title: "Empires & Exchange", path: "/themes/empires-exchange" },
      ]
    },
    {
      title: "Academic Resources",
      icon: <BookOpen size={20} />,
      items: [
        { title: "Reading Room", path: "/reading-room", description: "Academic library and resources" },
        { title: "Sources & Method", path: "/sources-method", description: "Research methodology and standards" },
        { title: "Field Notes", path: "/field-notes", description: "Ongoing research updates" },
      ]
    }
  ];

  const itihasaContent = [
    {
      title: "विशेष संग्रह | Featured Collections",
      icon: <IconEdict size={20} />,
      items: [
        { title: "लेख संग्रह | Scripts & Trade Empire", path: "/batch/muziris-kutai-ashoka", description: "Kandahar Edicts, Kutai Yūpa, Muziris Trade Corridors" },
        { title: "सागर जाल | Ocean Networks", path: "/batch/bujang-nagapattinam-ocean", description: "Bujang Valley, Nagapattinam, Maritime Archaeology" },
      ]
    },
    {
      title: "Interactive Visualizations",
      icon: <Map size={20} />,
      items: [
        { title: "Interactive Maps & Data", path: "/maps-data", description: "Geographic visualizations and data" },
        { title: "Timeline Visualizations", description: "Embedded in articles" },
        { title: "Archaeological Diagrams", description: "Context-specific components" },
      ]
    },
    {
      title: "Epigraphic Evidence",
      icon: <IconScript size={20} />,
      items: [
        { title: "Sanskrit Inscriptions", description: "Kutai Yūpa pillars, temple inscriptions" },
        { title: "Multilingual Edicts", description: "Greek-Aramaic Kandahar inscriptions" },
        { title: "Trade Documents", description: "Muziris papyrus, guild records" },
      ]
    }
  ];

  const puranaContent = [
    {
      title: "Cultural Contexts",
      icon: <IconLotus size={20} />,
      items: [
        { title: "Festival Calendar Integration", description: "Monsoon cycles and ritual calendars" },
        { title: "Cultural Diffusion Maps", description: "Spread of dharmic traditions" },
        { title: "Traditional Knowledge Systems", description: "Indigenous navigation and astronomy" },
      ]
    },
    {
      title: "Sanskrit Terminology",
      icon: <IconOm size={20} />,
      items: [
        { title: "IAST Transliteration Standards", description: "Academic transliteration protocols" },
        { title: "Cultural Authenticity Guidelines", description: "Proper Sanskrit usage and context" },
        { title: "Dharmic Color Symbolism", description: "Sacred geometry in design system" },
      ]
    },
    {
      title: "Digital Śāstra Architecture",
      icon: <IconDharmaChakra size={20} />,
      items: [
        { title: "Navigation Philosophy", description: "śāstra → adhyāya → pada structure" },
        { title: "Collection Taxonomy", description: "संग्रह (Saṅgraha) organizational principles" },
        { title: "Book Compilation Framework", description: "Academic publication preparation" },
      ]
    }
  ];

  const explorationContent = [
    {
      title: "Site Navigation",
      icon: <Search size={20} />,
      items: [
        { title: "About the Project", path: "/about", description: "Project overview and mission" },
        { title: "Brand Assets", path: "/brand", description: "Logo and visual identity resources" },
        { title: "Site Map", path: "/sitemap", description: "Complete site navigation" },
        { title: "Contact Information", description: "Available in footer" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header with Dharmic Elements */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <IconDharmaChakra size={64} className="text-turmeric animate-slow-spin" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            साइट मानचित्र | Site Map
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Traditional Indian knowledge organization applied to digital scholarship: 
            शास्त्र (Śāstra), इतिहास (Itihāsa), and पुराण (Purāṇa)
          </p>
        </div>

        {/* शास्त्र (Śāstra) - Core Academic Content */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <IconSarnathLion size={32} className="text-saffron" />
            <h2 className="font-serif text-3xl font-bold text-foreground">
              शास्त्र | Śāstra
            </h2>
            <div className="text-sm text-muted-foreground">Core Academic Content</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shastraContent.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-saffron">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.path ? (
                          <Link 
                            to={item.path}
                            className="text-sm text-foreground hover:text-saffron transition-colors underline-offset-4 hover:underline"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* इतिहास (Itihāsa) - Historical Narratives */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <IconPort size={32} className="text-peacock-blue" />
            <h2 className="font-serif text-3xl font-bold text-foreground">
              इतिहास | Itihāsa
            </h2>
            <div className="text-sm text-muted-foreground">Historical Narratives</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itihasaContent.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-peacock-blue">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.path ? (
                          <div>
                            <Link 
                              to={item.path}
                              className="text-sm font-medium text-foreground hover:text-peacock-blue transition-colors underline-offset-4 hover:underline"
                            >
                              {item.title}
                            </Link>
                            {item.description && (
                              <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* पुराण (Purāṇa) - Cultural Contexts */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <IconLotus size={32} className="text-lotus-pink" />
            <h2 className="font-serif text-3xl font-bold text-foreground">
              पुराण | Purāṇa
            </h2>
            <div className="text-sm text-muted-foreground">Cultural Contexts</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {puranaContent.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lotus-pink">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Exploration - Site Utilities */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <IconConch size={32} className="text-turmeric" />
            <h2 className="font-serif text-3xl font-bold text-foreground">
              अन्वेषण | Exploration
            </h2>
            <div className="text-sm text-muted-foreground">Site Navigation & Resources</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md">
            {explorationContent.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-turmeric">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.path ? (
                          <Link 
                            to={item.path}
                            className="text-sm text-foreground hover:text-turmeric transition-colors underline-offset-4 hover:underline"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sacred Footer */}
        <div className="text-center py-8 border-t border-border">
          <div className="flex justify-center gap-6 mb-4">
            <IconLotus size={24} className="text-lotus-pink animate-pulse-gentle" />
            <IconDharmaChakra size={24} className="text-turmeric animate-slow-spin" />
            <IconOm size={24} className="text-saffron animate-pulse-gentle" />
          </div>
          <p className="text-sm text-muted-foreground">
            सत्यमेव जयते | Truth Alone Triumphs
          </p>
        </div>
      </div>
    </div>
  );
}