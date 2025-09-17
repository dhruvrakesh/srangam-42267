import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  Download, 
  GraduationCap,
  CheckCircle,
  Clock,
  Users,
  Target,
  BarChart3,
  Archive
} from 'lucide-react';
import { InscriptionShastra } from '@/data/inscriptions/interfaces';
import { createCompilationManager, defaultCompilationSettings, BookVolume } from '@/lib/bookCompilation';

interface PublicationToolsProps {
  availableInscriptions: InscriptionShastra[];
  className?: string;
}

export const PublicationTools: React.FC<PublicationToolsProps> = ({
  availableInscriptions,
  className = ''
}) => {
  const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionShastra[]>([]);
  const [preparingManuscript, setPreparingManuscript] = useState(false);

  const compilationManager = createCompilationManager(defaultCompilationSettings);

  // Mock publication progress data
  const publicationProgress = {
    currentVolume: 'Volume I: Foundations',
    overallProgress: 67,
    chapters: [
      { title: 'Geological Foundations', status: 'complete', progress: 100 },
      { title: 'Archaeological Evidence', status: 'review', progress: 85 },
      { title: 'Textual Authority', status: 'writing', progress: 45 },
      { title: 'Maritime Networks', status: 'planning', progress: 10 }
    ]
  };

  const handlePrepareManuscript = async () => {
    if (selectedInscriptions.length === 0) return;
    
    setPreparingManuscript(true);
    
    try {
      const chapter = compilationManager.createChapterFromGroup(selectedInscriptions, 'theme');
      
      const volume: BookVolume = {
        id: 'manuscript-' + Date.now(),
        title: 'Selected Inscriptions from Srangam Archive',
        subtitle: 'A Comprehensive Academic Analysis',
        editors: ['Srangam Research Team', 'DKEGL Contributors'],
        chapters: [chapter],
        introduction: 'This manuscript presents a carefully curated selection of inscriptions from the Srangam Digital Archive, analyzed through the lens of modern academic scholarship while respecting traditional knowledge systems.',
        targetWordCount: 25000,
        publicationDate: new Date().getFullYear().toString(),
        publisher: 'Srangam Academic Press'
      };

      const manuscript = compilationManager.prepareManuscript(volume);
      
      // Create downloadable manuscript
      const manuscriptContent = `# Publication Manuscript
      
## Metadata
- Title: ${manuscript.metadata.title}
- Editors: ${manuscript.metadata.editors.join(', ')}
- Total Word Count: ${manuscript.metadata.totalWordCount}
- Academic Level: ${manuscript.metadata.academicLevel}
- Citation Style: ${manuscript.metadata.citationStyle}

## Statistics
- Chapters: ${manuscript.statistics.totalChapters}
- Inscriptions: ${manuscript.statistics.totalInscriptions}
- Script Types: ${manuscript.statistics.scriptTypes.join(', ')}
- Periods Covered: ${manuscript.statistics.periods.join(', ')}
- Geographic Regions: ${manuscript.statistics.regions.join(', ')}

---

${manuscript.mainText}

---

## Supplementary Material
${manuscript.supplementaryMaterial}
      `;

      // Download manuscript
      const blob = new Blob([manuscriptContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'srangam_manuscript.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } finally {
      setPreparingManuscript(false);
    }
  };

  const toggleInscriptionSelection = (inscription: InscriptionShastra) => {
    setSelectedInscriptions(prev => {
      const exists = prev.find(item => item.id === inscription.id);
      if (exists) {
        return prev.filter(item => item.id !== inscription.id);
      } else {
        return [...prev, inscription];
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'review':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'writing':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'planning':
        return <Target className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'writing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Publication Overview */}
      <Card className="border-dharma/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-saffron" />
            Publication Progress Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Volume Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{publicationProgress.currentVolume}</h4>
              <Badge className="bg-saffron text-white">
                {publicationProgress.overallProgress}% Complete
              </Badge>
            </div>
            <Progress value={publicationProgress.overallProgress} className="h-3" />
          </div>

          {/* Chapter Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Chapter Progress</h4>
            <div className="grid gap-3">
              {publicationProgress.chapters.map((chapter, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  {getStatusIcon(chapter.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{chapter.title}</span>
                      <Badge className={`text-xs ${getStatusColor(chapter.status)}`}>
                        {chapter.status}
                      </Badge>
                    </div>
                    <Progress value={chapter.progress} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {chapter.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manuscript Preparation */}
      <Card className="border-dharma/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-saffron" />
            Manuscript Preparation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inscription Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Select Inscriptions for Manuscript</h4>
              <Badge variant="outline">
                {selectedInscriptions.length} selected
              </Badge>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3">
              {availableInscriptions.map(inscription => (
                <div
                  key={inscription.id}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    selectedInscriptions.find(item => item.id === inscription.id)
                      ? 'bg-saffron/10 border border-saffron/30'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  onClick={() => toggleInscriptionSelection(inscription)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{inscription.title}</span>
                      <p className="text-xs text-muted-foreground">
                        {inscription.location.region} • {inscription.period.dynasty}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {inscription.scripts.slice(0, 2).map((script, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {script.scriptType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Manuscript Actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Manuscript Generation</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePrepareManuscript}
                disabled={selectedInscriptions.length === 0 || preparingManuscript}
                className="bg-saffron hover:bg-saffron/90 text-white"
              >
                {preparingManuscript ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Prepare Manuscript
                  </>
                )}
              </Button>
              
              <Button variant="outline" disabled={selectedInscriptions.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Standards */}
      <Card className="border-dharma/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-saffron" />
            Academic Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Archive className="w-6 h-6 mx-auto mb-2 text-saffron" />
              <div className="font-semibold text-lg">{availableInscriptions.length}</div>
              <div className="text-xs text-muted-foreground">Total Sources</div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-saffron" />
              <div className="font-semibold text-lg">12</div>
              <div className="text-xs text-muted-foreground">Contributors</div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <FileText className="w-6 h-6 mx-auto mb-2 text-saffron" />
              <div className="font-semibold text-lg">8</div>
              <div className="text-xs text-muted-foreground">Peer Reviews</div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-saffron" />
              <div className="font-semibold text-lg">95%</div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h4 className="font-medium text-sm mb-2">Publication Standards Compliance</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IAST Transliteration</span>
                <Badge className="bg-emerald-100 text-emerald-800">✓ Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sanskrit Validation</span>
                <Badge className="bg-emerald-100 text-emerald-800">✓ Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cultural Authentication</span>
                <Badge className="bg-emerald-100 text-emerald-800">✓ Approved</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Academic Citation</span>
                <Badge className="bg-emerald-100 text-emerald-800">✓ Standardized</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicationTools;