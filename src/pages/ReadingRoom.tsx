import { BookOpen, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/ui/TagChip";
import { IconLotus, IconOm } from "@/components/icons";
import { Link } from "react-router-dom";

export default function ReadingRoom() {
  const resources = [
    // Maritime & Navigation Studies
    {
      title: "Riders on the Monsoon: Indigenous Navigation and Maritime Knowledge",
      author: "Nartiang Foundation",
      type: "Research Article",
      description: "Long before European exploration, South Asian navigators developed sophisticated monsoon-based navigation systems. Recent palm-leaf manuscript discoveries reveal the scientific depth of indigenous maritime knowledge.",
      tags: ["Navigation", "Indigenous Knowledge", "Monsoon", "Palm-leaf Manuscripts"],
      available: true,
      slug: "/riders-on-monsoon",
      readTime: 16
    },
    {
      title: "Riding the Monsoon: How Winds Became an Engine of Commerce",
      author: "Prof. Ahmed Hassan",
      type: "Research Article", 
      description: "A logistics revolution long before steam—sailing the Arabian Sea on a seasonal clock. Discover how ancient mariners turned seasonal winds into reliable trade networks.",
      tags: ["Indian Ocean World", "Trade", "Monsoon", "Navigation"],
      available: true,
      slug: "/monsoon-trade-clock",
      readTime: 8
    },
    
    // Archaeological & Historical Studies
    {
      title: "Maritime Memories of South India: Emporia of the Ocean",
      author: "Nartiang Foundation",
      type: "Research Article",
      description: "Recent archaeological breakthroughs at Berenike confirm the vast scale of Indo-Roman maritime trade. From pepper markets to desert ports, this exploration traces how South India became a pivotal hub of the ancient world.",
      tags: ["Indo-Roman Trade", "Muziris", "Berenike", "Maritime Networks"],
      available: true,
      slug: "/maritime-memories-south-india",
      readTime: 18
    },
    {
      title: "Indian Ocean Power Networks: From the Malabar Spice Circuit to the Chola Expedition",
      author: "Nartiang Foundation",
      type: "Research Analysis",
      description: "How trade in spices and bullion fueled ancient economies, and how medieval Indian naval expeditions projected power across the waves—revealing the interconnected world of the pre-modern Indian Ocean.",
      tags: ["Empires & Exchange", "Maritime Networks", "Ancient Economics", "Naval History"],
      available: true,
      slug: "/indian-ocean-power-networks",
      readTime: 24
    },
    
    // Epigraphic & Script Studies
    {
      title: "Scripts that Sailed: From Southern Brāhmī to Kawi, Khmer, and Thai",
      author: "Dr. Priya Venkat",
      type: "Epigraphic Study",
      description: "Letterforms as shipping records: how Indic scripts adapted to new languages around the Bay of Bengal. Trace the maritime networks that carried writing systems across the ocean.",
      tags: ["Scripts & Inscriptions", "Epigraphy", "SE Asia", "Cultural Exchange"],
      available: true,
      slug: "/scripts-that-sailed",
      readTime: 12
    },
    {
      title: "Stones that Speak: Ashoka's Greek and Aramaic at Kandahar",
      author: "Dr. Epigraphy Specialist",
      type: "Epigraphic Study",
      description: "Imperial ethics in multiple languages at a cultural crossroads. Explore how Ashoka's multilingual edicts connected ancient India to the Hellenistic world.",
      tags: ["Ancient India", "Edicts", "Hellenistic Links", "Multilingual"],
      available: true,
      slug: "/ashoka-kandahar-edicts",
      readTime: 5
    },
    {
      title: "Rainforest Prashastis: The Kutai Yūpa Inscriptions of Borneo",
      author: "Dr. Epigraphic Studies",
      type: "Epigraphic Study",
      description: "Sanskrit verse and Vedic ritual vocabulary on sacrificial posts at the edge of the equator. Ancient Indian cultural influence reaches into the heart of Southeast Asia.",
      tags: ["Scripts & Inscriptions", "Sanskrit", "SE Asia", "Vedic Rituals"],
      available: true,
      slug: "/kutai-yupa-borneo",
      readTime: 8
    },
    
    // Geological & Environmental Studies
    {
      title: "India on the Move: From Gondwana to the Himalaya",
      author: "Dr. Geological Survey",
      type: "Scientific Study",
      description: "A plate that sprinted, a flood basalt that roared, a mountain range still rising. Discover how 200 million years of geological drama shaped the Indian subcontinent.",
      tags: ["Geology & Deep Time", "Plate Tectonics", "Deccan", "Himalayas"],
      available: true,
      slug: "/gondwana-to-himalaya",
      readTime: 10
    },
    {
      title: "Earth, Sea and Sangam: Geological Transformations and the Ancient Ports of South India",
      author: "Nartiang Foundation",
      type: "Interdisciplinary Study",
      description: "How tectonic forces, river floods, and rising seas shaped—and reshaped—the maritime geography of Southern India. From Muziris' disappearance to Kochi's birth, geology tells the story of ports in motion.",
      tags: ["Geology & Deep Time", "Maritime Networks", "Coastal Change", "Ancient Ports"],
      available: true,
      slug: "/earth-sea-sangam",
      readTime: 16
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred Manuscript Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sandalwood via-cream to-sandalwood/80" />
      <div className="absolute inset-0 opacity-[0.04]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238B4513' stroke-width='0.8' opacity='0.3'%3E%3Cpath d='M10 10 Q50 30 90 10 Q70 50 90 90 Q50 70 10 90 Q30 50 10 10' fill='none'/%3E%3Ccircle cx='50' cy='50' r='8' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-background/5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dharmic Header - Saraswati's Manuscript Hall */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-lotus-pink/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-saffron/20 to-turmeric/20 p-6 rounded-full backdrop-blur-sm border border-saffron/30">
                <IconLotus size={48} className="text-saffron" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-sandalwood/40 rounded-full blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-sandalwood to-terracotta p-8 rounded-full shadow-2xl border-2 border-saffron/20">
                <BookOpen size={64} className="text-cream" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-peacock-blue/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-peacock-blue/20 to-indigo-dharma/20 p-6 rounded-full backdrop-blur-sm border border-peacock-blue/30">
                <IconOm size={48} className="text-indigo-dharma" />
              </div>
            </div>
          </div>
          <div className="relative">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-saffron via-turmeric to-saffron bg-clip-text text-transparent">
                विद्या भवन
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-terracotta mb-8">
              Manuscript Hall
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              सरस्वती का पवित्र भंडार — Sacred repository of ancient wisdom texts, palm-leaf manuscripts, 
              and scholarly treatises from across the Indian Ocean world. Here knowledge flows like the 
              eternal rivers, preserving the voices of ancient mariners, philosophers, and scribes.
            </p>
            <div className="mt-6 h-1 w-32 bg-gradient-to-r from-saffron via-turmeric to-saffron mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-sm font-medium text-foreground">Filter by type:</span>
                <div className="flex flex-wrap gap-2">
                  <TagChip>All Sources</TagChip>
                  <TagChip>Research Articles</TagChip>
                  <TagChip>Epigraphic Studies</TagChip>
                  <TagChip>Scientific Studies</TagChip>
                  <TagChip>Interdisciplinary</TagChip>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resources List */}
        <div className="space-y-6">
          {resources.map((resource, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-xl text-foreground mb-2">
                      {resource.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {resource.author} • {resource.type}
                    </p>
                  </div>
                  <TagChip 
                    variant={resource.available ? "theme" : "default"}
                    className={resource.available ? "bg-ocean text-white" : "bg-muted text-muted-foreground"}
                  >
                    {resource.available ? "Available" : "Coming Soon"}
                  </TagChip>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {resource.description}
                </p>
                
                {resource.readTime && (
                  <p className="text-sm text-muted-foreground mb-4">
                    📖 {resource.readTime} min read
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <TagChip key={tag} className="text-xs">
                        {tag}
                      </TagChip>
                    ))}
                  </div>
                  
                  {resource.available && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={resource.slug}>
                          <ExternalLink size={14} className="mr-1" />
                          Read Online
                        </Link>
                      </Button>
                      <Button size="sm" className="bg-ocean hover:bg-ocean/90">
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Digital Archive Info */}
        <div className="mt-12">
          <Card className="bg-sand/20 border-border">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground text-center">
                Digital Archive Partnership
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our reading room is developed in partnership with leading digital humanities 
                archives and research institutions to provide open access to historical sources 
                and contemporary research on the Indian Ocean world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline">
                  Submit a Resource
                </Button>
                <Button variant="outline">
                  Request Access
                </Button>
                <Button variant="outline">
                  Archive Guidelines
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}