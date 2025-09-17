import { BookOpen, FileText, Users, CheckCircle, Clock, Download, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface VolumeProgress {
  volume: string;
  title: string;
  chapters: number;
  completed: number;
  status: "planning" | "writing" | "review" | "complete";
  contributors: string[];
  targetDate: string;
}

export default function BookCompilation() {
  const volumes: VolumeProgress[] = [
    {
      volume: "Volume I",
      title: "Foundations: Geological, Archaeological, and Textual Authority",
      chapters: 8,
      completed: 6,
      status: "review",
      contributors: ["B.B. Lal", "Michel Danino", "Subhash Kak"],
      targetDate: "Q2 2025"
    },
    {
      volume: "Volume II", 
      title: "Maritime Expansion: Navigation, Trade Networks, Cultural Transmission",
      chapters: 10,
      completed: 8,
      status: "writing",
      contributors: ["K.A. Nilakanta Sastri", "Raj Vedam", "Nartiang Foundation"],
      targetDate: "Q4 2025"
    },
    {
      volume: "Volume III",
      title: "Contemporary Validation: Genetics, Linguistics, Recent Discoveries", 
      chapters: 6,
      completed: 2,
      status: "planning",
      contributors: ["Shrikant Talageri", "David Frawley", "Kapila Vatsyayan"],
      targetDate: "Q2 2026"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "bg-emerald-500";
      case "review": return "bg-amber-500";
      case "writing": return "bg-blue-500";
      case "planning": return "bg-slate-500";
      default: return "bg-slate-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete": return "Complete";
      case "review": return "Under Review";
      case "writing": return "In Progress";
      case "planning": return "Planning";
      default: return "Unknown";
    }
  };

  const overallProgress = volumes.reduce((acc, vol) => acc + vol.completed, 0) / 
                         volumes.reduce((acc, vol) => acc + vol.chapters, 0) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-saffron/20 to-turmeric/20 rounded-full">
            <BookOpen className="w-8 h-8 text-saffron" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Book Compilation Framework
          </h2>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Systematic compilation of research into a comprehensive academic publication 
          documenting India's role as a primary civilizational source through rigorous 
          interdisciplinary scholarship.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-sandalwood/30 to-cream border-saffron/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-xl">Overall Compilation Progress</CardTitle>
            <Badge className="bg-saffron text-white">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">Total Chapters</div>
              <div className="text-2xl font-bold text-saffron">24</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">Completed</div>
              <div className="text-2xl font-bold text-emerald-600">16</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">Target Completion</div>
              <div className="text-2xl font-bold text-indigo-dharma">Q2 2026</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Progress Cards */}
      <div className="grid gap-6">
        {volumes.map((volume, index) => (
          <Card key={index} className="border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {volume.volume}
                    </Badge>
                    <Badge className={`text-white ${getStatusColor(volume.status)}`}>
                      {getStatusText(volume.status)}
                    </Badge>
                  </div>
                  <CardTitle className="font-serif text-lg mb-2">
                    {volume.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Target: {volume.targetDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-saffron">
                    {volume.completed}/{volume.chapters}
                  </div>
                  <div className="text-xs text-muted-foreground">chapters</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress 
                value={(volume.completed / volume.chapters) * 100} 
                className="h-2 mb-4"
              />
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contributing Scholars
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {volume.contributors.map((contributor, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {contributor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    View Outline
                  </Button>
                  <Button size="sm" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Track Progress
                  </Button>
                  {volume.status === "complete" && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Academic Standards */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Academic Standards & Review Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Editorial Board</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Chief Editor: Senior scholar in Indian history/archaeology</li>
                <li>• Section Editors: Specialists in archaeology, linguistics, genetics</li>
                <li>• Regional Experts: Southeast Asian, Central Asian studies</li>
                <li>• Indigenous Knowledge Holders: Traditional scholars</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Review Process</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Double-blind peer review by qualified academics</li>
                <li>• Traditional knowledge holder consultation</li>
                <li>• Editorial board consensus requirement</li>
                <li>• Cultural authenticity validation</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold mb-3 text-foreground">Publication Standards</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <FileText className="w-6 h-6 mx-auto mb-2 text-saffron" />
                <div className="font-medium">Citation Format</div>
                <div className="text-xs text-muted-foreground">Chicago Manual of Style</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-saffron" />
                <div className="font-medium">Typography</div>
                <div className="text-xs text-muted-foreground">Devanagari & Tamil Support</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-saffron" />
                <div className="font-medium">Quality Assurance</div>
                <div className="text-xs text-muted-foreground">Multi-tier Validation</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              Submit Chapter
            </Button>
            <Button variant="outline">
              Review Guidelines
            </Button>
            <Button variant="outline">
              <GraduationCap className="w-4 h-4 mr-2" />
              Academic Tools
            </Button>
            <Button className="bg-saffron hover:bg-saffron/90 text-white">
              Editorial Board
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}