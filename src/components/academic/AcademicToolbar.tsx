import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Share, 
  Quote, 
  Search,
  Filter,
  BookMarked,
  GraduationCap,
  Languages,
  CheckCircle
} from 'lucide-react';
import { InscriptionShastra } from '@/data/inscriptions/interfaces';
import { generateCitation, CitationStyle, validateSanskritTerm } from '@/lib/academicCitation';
import { createCompilationManager, defaultCompilationSettings } from '@/lib/bookCompilation';

interface AcademicToolbarProps {
  inscription?: InscriptionShastra;
  inscriptions?: InscriptionShastra[];
  showCompilationTools?: boolean;
  className?: string;
}

export const AcademicToolbar: React.FC<AcademicToolbarProps> = ({
  inscription,
  inscriptions = [],
  showCompilationTools = false,
  className = ''
}) => {
  const [selectedCitationStyle, setSelectedCitationStyle] = useState<CitationStyle>('dharmic');
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [validationTerm, setValidationTerm] = useState('');
  const [compilationQueue, setCompilationQueue] = useState<InscriptionShastra[]>([]);

  const citationStyles: { value: CitationStyle; label: string; description: string }[] = [
    { value: 'dharmic', label: 'Dharmic', description: 'Traditional Indic scholarly format' },
    { value: 'apa', label: 'APA', description: 'American Psychological Association' },
    { value: 'mla', label: 'MLA', description: 'Modern Language Association' },
    { value: 'chicago', label: 'Chicago', description: 'Chicago Manual of Style' },
    { value: 'iast', label: 'IAST', description: 'International Alphabet of Sanskrit Transliteration' }
  ];

  const handleCitation = (style: CitationStyle) => {
    if (!inscription) return;
    
    const citation = generateCitation(inscription, style);
    navigator.clipboard.writeText(citation);
    
    // You could add a toast notification here
    console.log(`Citation copied: ${citation}`);
  };

  const handleAddToCompilation = (inscr: InscriptionShastra) => {
    if (!compilationQueue.find(item => item.id === inscr.id)) {
      setCompilationQueue([...compilationQueue, inscr]);
    }
  };

  const handleValidateTerm = () => {
    if (!validationTerm.trim()) return;
    
    const validation = validateSanskritTerm(validationTerm);
    console.log('Validation result:', validation);
    // You could show results in a modal or panel
  };

  const exportCompilation = (format: 'markdown' | 'latex' | 'pdf') => {
    if (compilationQueue.length === 0) return;
    
    const manager = createCompilationManager(defaultCompilationSettings);
    const chapter = manager.createChapterFromGroup(compilationQueue, 'theme');
    
    // Create a simple volume for export
    const volume = {
      id: 'compilation-' + Date.now(),
      title: 'Srangam Inscription Collection',
      subtitle: 'Selected Inscriptions for Academic Study',
      editors: ['Srangam Research Team'],
      chapters: [chapter],
      introduction: 'This compilation presents selected inscriptions from the Srangam Digital Archive for comprehensive academic analysis.',
      targetWordCount: 50000,
      publicationDate: new Date().getFullYear().toString(),
      publisher: 'Srangam Academic Press'
    };
    
    let exportedContent = '';
    switch (format) {
      case 'markdown':
        exportedContent = manager.exportToMarkdown(volume);
        break;
      case 'latex':
        exportedContent = manager.exportToLaTeX(volume);
        break;
      case 'pdf':
        // PDF generation would use the existing PDF generator
        console.log('PDF export requested');
        return;
    }
    
    // Download the file
    const blob = new Blob([exportedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srangam_compilation.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Citation Tools */}
      <Card className="border-dharma/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="w-5 h-5 text-saffron" />
            Academic Citation Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {citationStyles.map(style => (
              <Button
                key={style.value}
                variant={selectedCitationStyle === style.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCitationStyle(style.value);
                  if (inscription) handleCitation(style.value);
                }}
                className="h-auto p-2 flex flex-col items-center"
              >
                <span className="font-semibold">{style.label}</span>
                <span className="text-xs opacity-70">{style.description}</span>
              </Button>
            ))}
          </div>
          
          {inscription && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Current Citation:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {generateCitation(inscription, selectedCitationStyle)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sanskrit Validation */}
      <Card className="border-dharma/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="w-5 h-5 text-saffron" />
            Sanskrit Term Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Sanskrit term for IAST validation..."
              value={validationTerm}
              onChange={(e) => setValidationTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
            />
            <Button onClick={handleValidateTerm} size="sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Validate
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Validates IAST transliteration compliance and suggests corrections
          </div>
        </CardContent>
      </Card>

      {/* Book Compilation Tools */}
      {showCompilationTools && (
        <Card className="border-dharma/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookMarked className="w-5 h-5 text-saffron" />
              Book Compilation Queue
              {compilationQueue.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {compilationQueue.length} items
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inscription && (
              <Button
                onClick={() => handleAddToCompilation(inscription)}
                size="sm"
                variant="outline"
                disabled={compilationQueue.find(item => item.id === inscription.id) !== undefined}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {compilationQueue.find(item => item.id === inscription.id) ? 'Already Added' : 'Add to Compilation'}
              </Button>
            )}
            
            {compilationQueue.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Compilation Queue:</p>
                  <div className="flex flex-wrap gap-1">
                    {compilationQueue.map(item => (
                      <Badge key={item.id} variant="secondary" className="text-xs">
                        {item.title.substring(0, 30)}...
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => exportCompilation('markdown')}
                    size="sm"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Export MD
                  </Button>
                  <Button
                    onClick={() => exportCompilation('latex')}
                    size="sm"
                    variant="outline"
                  >
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Export LaTeX
                  </Button>
                  <Button
                    onClick={() => exportCompilation('pdf')}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Research Ecosystem Tools */}
      <Card className="border-dharma/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-saffron" />
            Research Ecosystem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Cross-Reference
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-1" />
              Share Research
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicToolbar;