import React from 'react';
import { FileText, CheckCircle, Users, Award, BookOpen, Scroll, Download, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function SubmissionGuidelines() {
  const navigate = useNavigate();

  const handleSubmitResearch = () => {
    navigate('/research-submission');
  };

  const handleDownloadGuidelines = () => {
    const guidelines = `
SRANGAM SUBMISSION GUIDELINES
धर्मिक अनुसंधान योगदान मार्गदर्शन

SUBMISSION CATEGORIES:

1. RESEARCH ARTICLES (5,000-15,000 words)
   - Comprehensive studies based on primary source analysis
   - Review period: 6-12 months
   - Requires: Original Sanskrit/Prakrit source citations
   - Format: Academic paper with traditional Indian citation methods

2. TRANSLATION PROJECTS (Variable length)  
   - Sanskrit/Prakrit texts with scholarly commentary
   - Review period: 3-6 months
   - Requires: Manuscript evidence and traditional commentaries
   - Format: Bilingual presentation with IAST transliteration

3. FIELD REPORTS (2,000-8,000 words)
   - Archaeological, epigraphic, or ethnographic documentation
   - Review period: 2-4 months  
   - Requires: Photographic evidence and GPS coordinates
   - Format: Technical report with visual documentation

4. COMMENTARY SERIES (3,000-10,000 words)
   - Analysis of existing texts from indigenous perspective
   - Review period: 4-8 months
   - Requires: Traditional śāstra references
   - Format: Scholarly commentary following Indian traditions

SUBMISSION REQUIREMENTS:

Primary Source Foundation:
• Direct citation of original Sanskrit/Prakrit sources
• Photographic evidence of inscriptional material  
• Archaeological site reports and artifact documentation
• Traditional commentaries and śāstra references

Indigenous Methodology:
• Use of traditional Indian chronological systems
• Reference to indigenous mathematical and astronomical texts
• Consultation with traditional pāṇḍita scholarship
• Integration of dharmic philosophical frameworks

Interdisciplinary Integration:
• Cross-reference with genetic studies of Indian populations
• Astronomical verification of epic and purāṇic dates
• Geological correlation with ancient geographical descriptions
• Linguistic analysis supporting Sanskrit antiquity

Peer Review Standards:
• Review by certified Sanskrit scholars
• Archaeological verification by field experts
• Scientific data validation by relevant specialists
• Traditional pāṇḍita consultation for śāstric accuracy

FORMATTING GUIDELINES:
- Sanskrit terms in IAST transliteration
- Traditional Indian academic citation format
- Primary sources referenced in original languages
- Modern translations provided for accessibility
- Maps, charts, and photographs must be high resolution
- Ethical clearances for archaeological/cultural material

CONTACT: research@nartiang.org
SUBMISSION PORTAL: Available via Srangam Research Centre

विद्या ददाति विनयं | Knowledge bestows humility
    `;
    
    const blob = new Blob([guidelines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Srangam-Submission-Guidelines-2025.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContactEditors = () => {
    window.location.href = "mailto:editors@nartiang.org?subject=Editorial Inquiry&body=I have questions about the submission process or would like to discuss my research proposal with the editorial team.";
  };

  const guidelines = [
    {
      title: 'Primary Source Foundation',
      icon: <Scroll className="h-5 w-5" />,
      description: 'All submissions must be grounded in primary sources - Sanskrit texts, inscriptions, archaeological evidence, or palm-leaf manuscripts.',
      requirements: [
        'Direct citation of original Sanskrit/Prakrit sources',
        'Photographic evidence of inscriptional material',
        'Archaeological site reports and artifact documentation',
        'Traditional commentaries and śāstra references'
      ]
    },
    {
      title: 'Indigenous Perspective Methodology',
      icon: <Users className="h-5 w-5" />,
      description: 'Research should adopt indigenous Indian scholarly frameworks rather than colonial interpretative models.',
      requirements: [
        'Use of traditional Indian chronological systems',
        'Reference to indigenous mathematical and astronomical texts',
        'Consultation with traditional pāṇḍita scholarship',
        'Integration of dharmic philosophical frameworks'
      ]
    },
    {
      title: 'Interdisciplinary Integration', 
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Combine textual evidence with scientific disciplines: genetics, astronomy, geology, linguistics.',
      requirements: [
        'Cross-reference with genetic studies of Indian populations',
        'Astronomical verification of epic and purāṇic dates',
        'Geological correlation with ancient geographical descriptions',
        'Linguistic analysis supporting Sanskrit antiquity'
      ]
    },
    {
      title: 'Peer Review Standards',
      icon: <Award className="h-5 w-5" />,
      description: 'Academic rigor maintained through review by traditional scholars and modern academics.',
      requirements: [
        'Review by certified Sanskrit scholars',
        'Archaeological verification by field experts',
        'Scientific data validation by relevant specialists',
        'Traditional pāṇḍita consultation for śāstric accuracy'
      ]
    }
  ];

  const submissionCategories = [
    {
      name: 'Research Articles',
      description: 'Comprehensive studies based on primary source analysis',
      wordCount: '5,000-15,000 words',
      timeline: '6-12 months review'
    },
    {
      name: 'Translation Projects',
      description: 'Sanskrit/Prakrit texts with scholarly commentary',
      wordCount: 'Variable length',
      timeline: '3-6 months review'
    },
    {
      name: 'Field Reports',
      description: 'Archaeological, epigraphic, or ethnographic documentation',
      wordCount: '2,000-8,000 words',
      timeline: '2-4 months review'
    },
    {
      name: 'Commentary Series',
      description: 'Analysis of existing texts from indigenous perspective',
      wordCount: '3,000-10,000 words',
      timeline: '4-8 months review'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
          योगदान मार्गदर्शन | Contribution Guidelines
        </h3>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Inviting well-researched entries backed by primary references that support the indigenous origins framework
        </p>
      </div>

      {/* Submission Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {submissionCategories.map((category, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-lg text-foreground">
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                {category.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{category.wordCount}</Badge>
                <Badge variant="outline">{category.timeline}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guidelines Cards */}
      <div className="space-y-6">
        {guidelines.map((guideline, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-saffron/10 p-2 rounded-lg">
                  {guideline.icon}
                </div>
                <CardTitle className="font-serif text-xl text-foreground">
                  {guideline.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {guideline.description}
              </p>
              <ul className="space-y-2">
                {guideline.requirements.map((requirement, reqIndex) => (
                  <li key={reqIndex} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-ocean mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submission Process */}
      <Card className="bg-sandalwood/20 border-saffron/20">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-foreground text-center">
            Submission Process | प्रस्तुति प्रक्रिया
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Submit your research through our traditional peer-review process that honors both 
              academic rigor and dharmic scholarly traditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-saffron hover:bg-saffron/90 text-charcoal"
                onClick={handleSubmitResearch}
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit Research
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-indigo-dharma text-indigo-dharma hover:bg-indigo-dharma hover:text-cream"
                onClick={handleDownloadGuidelines}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Guidelines
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream"
                onClick={handleContactEditors}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Editors
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}