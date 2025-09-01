import { BookOpen, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/ui/TagChip";

export default function ReadingRoom() {
  const resources = [
    {
      title: "The Periplus of the Erythraean Sea",
      author: "Anonymous (1st-3rd c. CE)",
      type: "Primary Source",
      description: "Ancient navigational guide to Indian Ocean trade routes, describing ports, peoples, and commodities.",
      tags: ["navigation", "trade", "Roman", "geography"],
      available: true
    },
    {
      title: "Inscriptions of Ancient India: A Select Bibliography",
      author: "Srangam Research Team",
      type: "Bibliography",
      description: "Comprehensive bibliography of epigraphic sources across South and Southeast Asia.",
      tags: ["epigraphy", "inscriptions", "bibliography"],
      available: true
    },
    {
      title: "Monsoon Navigation in Medieval Arabic Sources",
      author: "Ibn Majid & Al-Idrisi",
      type: "Primary Source",
      description: "Medieval Arabic texts on seasonal navigation and port descriptions.",
      tags: ["Arabic", "navigation", "medieval", "monsoon"],
      available: false
    },
    {
      title: "Archaeological Reports: Muziris Excavations 2020-2024",
      author: "Various Contributors",
      type: "Research Report",
      description: "Recent archaeological findings from the ancient port of Muziris.",
      tags: ["archaeology", "Muziris", "excavation", "Kerala"],
      available: true
    },
    {
      title: "Geological Survey: Western Ghats Formation",
      author: "Geological Society of India",
      type: "Scientific Report",
      description: "Tectonic history and formation of the Western Ghats mountain range.",
      tags: ["geology", "Western Ghats", "tectonics", "deep time"],
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen size={64} className="text-laterite" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Reading Room
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Access our collection of primary sources, research reports, and bibliographic resources 
            for studying Indian Ocean histories — from ancient navigation manuals to modern archaeological reports.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-sm font-medium text-foreground">Filter by type:</span>
                <div className="flex flex-wrap gap-2">
                  <TagChip>All Sources</TagChip>
                  <TagChip>Primary Sources</TagChip>
                  <TagChip>Research Reports</TagChip>
                  <TagChip>Bibliographies</TagChip>
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
                      <Button size="sm" variant="outline">
                        <ExternalLink size={14} className="mr-1" />
                        Read Online
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