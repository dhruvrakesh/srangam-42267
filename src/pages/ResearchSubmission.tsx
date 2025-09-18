import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResearchSubmission() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    email: '',
    institution: '',
    abstract: '',
    methodology: '',
    keywords: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create mailto link with form data
    const subject = encodeURIComponent(`Research Submission: ${formData.title}`);
    const body = encodeURIComponent(`
Research Submission Details:

Title: ${formData.title}
Author: ${formData.author}
Institution: ${formData.institution}
Email: ${formData.email}

Abstract:
${formData.abstract}

Methodology:
${formData.methodology}

Keywords: ${formData.keywords}

---
Submitted via Srangam Research Portal
    `);
    
    window.location.href = `mailto:research@nartiang.org?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/about')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research Centre
        </Button>

        <Card className="bg-gradient-to-br from-sandalwood/20 to-lotus-pink/10 border-2 border-saffron/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-saffron/20 to-turmeric/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-saffron" />
            </div>
            <CardTitle className="font-serif text-3xl text-foreground">
              अनुसंधान प्रस्तुति | Research Submission
            </CardTitle>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Submit your research following dharmic scholarly traditions. All submissions undergo 
              traditional peer review honoring both academic rigor and indigenous methodologies.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Research Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter your research title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Principal Author *</Label>
                  <Input
                    id="author"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@institution.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution/Affiliation</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    placeholder="University or research institution"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="abstract">Research Abstract *</Label>
                <Textarea
                  id="abstract"
                  required
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  placeholder="Provide a concise summary of your research (250-500 words)"
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="methodology">Methodology & Sources</Label>
                <Textarea
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                  placeholder="Describe your research methodology and primary sources"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="5-8 keywords separated by commas"
                />
              </div>

              <div className="bg-sandalwood/10 p-6 rounded-lg border border-saffron/20">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-saffron" />
                  Manuscript Upload
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  After submitting this form, you will receive detailed instructions for manuscript upload 
                  and formatting guidelines via email.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Manuscripts should follow traditional Indian academic citation formats</p>
                  <p>• Sanskrit terms must include IAST transliteration</p>
                  <p>• Primary source citations required for all claims</p>
                  <p>• Maximum length: 8,000 words including references</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button type="submit" className="bg-saffron hover:bg-saffron/90 text-charcoal">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Research Proposal
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/about')}
                  className="border-2 border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-cream"
                >
                  Save as Draft & Return
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}