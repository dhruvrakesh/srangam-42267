import React, { useState } from 'react';
import { BookOpen, Users, Building, FileText, Award, Scroll } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingLists, SubmissionGuidelines, InstitutionalPartnerships } from '@/components/research';
import { useNavigate } from 'react-router-dom';

export function ResearchCentre() {
  const navigate = useNavigate();

  const handleSubmitResearch = () => {
    navigate('/research-submission');
  };

  const handlePartnership = () => {
    navigate('/partnership');
  };

  const handleSupport = () => {
    navigate('/support-research');
  };

  return (
    <div className="space-y-8">
      {/* Research Centre Header */}
      <Card className="bg-gradient-to-br from-sandalwood/80 to-lotus-pink/20 border-2 border-saffron/30 relative overflow-hidden shadow-2xl">
        <CardHeader>
          <CardTitle className="font-serif text-3xl text-foreground mb-4 text-center">
            अनुसंधान केंद्र | Research Centre
          </CardTitle>
          <div className="text-indigo-dharma text-lg mb-4 font-serif text-center">
            श्रंगम meets नार्तिआंग | Where Scholarship Meets Service
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed text-center max-w-4xl mx-auto">
            A comprehensive digital research center supporting the indigenous origins framework through 
            curated reading lists from premier Oriental institutes, submission guidelines for original research, 
            and partnerships with traditional scholarship centers across Bharat. Here, corporate social 
            responsibility meets dharmic research excellence.
          </p>
          
          {/* Mission Statement */}
          <div className="bg-sandalwood/20 p-6 rounded-xl border border-saffron/20 mb-6">
            <div className="text-center">
              <div className="text-saffron font-serif text-lg mb-2">
                विद्या ददाति विनयं विनयाद् याति पात्रताम्
              </div>
              <div className="text-charcoal/70 text-sm italic">
                "Knowledge bestows humility, from humility comes worthiness" — Supporting research that honors traditional wisdom while advancing contemporary understanding
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Our research framework emphasizes primary source analysis, interdisciplinary correlation, 
              and indigenous scholarly methodologies that challenge colonial interpretative frameworks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Research Centre Tabs */}
      <Tabs defaultValue="reading-lists" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reading-lists" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Reading Lists
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Partnerships
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reading-lists" className="mt-8">
          <ReadingLists />
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-8">
          <SubmissionGuidelines />
        </TabsContent>
        
        <TabsContent value="partnerships" className="mt-8">
          <InstitutionalPartnerships />
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-br from-saffron/5 to-lotus-pink/5 border border-saffron/20 mandala-vatika">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground text-center flex items-center justify-center gap-2">
            <Scroll className="h-6 w-6 text-saffron" />
            Join the Indigenous Research Movement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Whether you're a traditional scholar, modern academic, or interested supporter, 
              there are multiple ways to contribute to research that honors India's intellectual heritage 
              while advancing rigorous contemporary scholarship.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="text-center">
                    <Scroll className="h-8 w-8 text-saffron mx-auto mb-2" />
                    <CardTitle className="text-lg">Research Contributors</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Submit original research based on primary sources and indigenous methodologies
                  </p>
                  <Button 
                    className="w-full bg-saffron hover:bg-saffron/90 text-charcoal"
                    onClick={handleSubmitResearch}
                  >
                    Submit Research
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-peacock-blue mx-auto mb-2" />
                    <CardTitle className="text-lg">Institutional Partners</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Academic institutions supporting indigenous scholarship frameworks
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-white"
                    onClick={handlePartnership}
                  >
                    Partner With Us
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="text-center">
                    <Award className="h-8 w-8 text-turmeric mx-auto mb-2" />
                    <CardTitle className="text-lg">Support & Funding</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Corporate and individual support for dharmic research initiatives
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-turmeric text-turmeric hover:bg-turmeric hover:text-charcoal"
                    onClick={handleSupport}
                  >
                    Support Research
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sacred Geometry Design Philosophy */}
          <div className="mt-8 pt-6 border-t border-saffron/10">
            <h4 className="text-lg font-semibold text-indigo-dharma mb-3 flex items-center justify-center gap-2">
              <Award className="w-4 h-4" />
              Sacred Geometry in Our Design
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p><strong className="text-saffron">Mandala Vatika:</strong> Concentric patterns representing cosmic harmony and the cyclical nature of knowledge</p>
                <p><strong className="text-lotus-pink">Sri Yantra Elements:</strong> Interlocking triangular forms symbolizing the union of consciousness and energy</p>
                <p><strong className="text-terracotta">Temple Kolam:</strong> Dotted geometric patterns from South Indian temple traditions, representing divine order</p>
              </div>
              <div className="space-y-2">
                <p><strong className="text-peacock-blue">Lotus Mandala:</strong> Radiating petal designs symbolizing the unfolding of wisdom from the spiritual center</p>
                <p><strong className="text-indigo-dharma">Dharma Chakra:</strong> Spoke patterns representing the eternal wheel of cosmic law and righteous knowledge</p>
                <p className="text-xs italic pt-2">These patterns serve as subtle reminders of the sophisticated mathematical and spiritual understanding embedded in Sanatan civilization.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}