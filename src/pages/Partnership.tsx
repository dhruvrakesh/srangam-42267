import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Partnership() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institutionName: '',
    contactPerson: '',
    email: '',
    phone: '',
    partnershipType: '',
    description: '',
    resources: '',
    timeline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Partnership Inquiry: ${formData.institutionName}`);
    const body = encodeURIComponent(`
Partnership Inquiry Details:

Institution: ${formData.institutionName}
Contact Person: ${formData.contactPerson}
Email: ${formData.email}
Phone: ${formData.phone}
Partnership Type: ${formData.partnershipType}

Description:
${formData.description}

Available Resources:
${formData.resources}

Proposed Timeline:
${formData.timeline}

---
Submitted via Srangam Partnership Portal
    `);
    
    window.location.href = `mailto:partnerships@nartiang.org?subject=${subject}&body=${body}`;
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

        <Card className="bg-gradient-to-br from-peacock-blue/10 to-sandalwood/20 border-2 border-peacock-blue/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-peacock-blue/20 to-indigo-dharma/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building size={32} className="text-peacock-blue" />
            </div>
            <CardTitle className="font-serif text-3xl text-foreground">
              संस्थागत साझेदारी | Institutional Partnership
            </CardTitle>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Join our network of institutions supporting dharmic research excellence. 
              Together we advance indigenous scholarship through collaborative initiatives.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                    placeholder="University, Research Center, or Foundation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Primary Contact *</Label>
                  <Input
                    id="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="Director, Dean, or Department Head"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Official Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@institution.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 or international number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partnershipType">Partnership Type *</Label>
                <Select value={formData.partnershipType} onValueChange={(value) => setFormData({...formData, partnershipType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partnership category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research-collaboration">Research Collaboration</SelectItem>
                    <SelectItem value="manuscript-digitization">Manuscript Digitization</SelectItem>
                    <SelectItem value="student-exchange">Student Exchange Program</SelectItem>
                    <SelectItem value="joint-publication">Joint Publication Initiative</SelectItem>
                    <SelectItem value="conference-symposium">Conference & Symposium</SelectItem>
                    <SelectItem value="funding-sponsorship">Funding & Sponsorship</SelectItem>
                    <SelectItem value="other">Other (specify in description)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Partnership Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your proposed collaboration and its alignment with dharmic research principles"
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resources">Available Resources</Label>
                <Textarea
                  id="resources"
                  value={formData.resources}
                  onChange={(e) => setFormData({...formData, resources: e.target.value})}
                  placeholder="What resources can your institution contribute? (expertise, facilities, funding, manuscripts, etc.)"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeline">Proposed Timeline</Label>
                <Textarea
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  placeholder="When would you like to begin collaboration? Any key milestones or deadlines?"
                  rows={2}
                />
              </div>

              <div className="bg-peacock-blue/5 p-6 rounded-lg border border-peacock-blue/20">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-peacock-blue" />
                  Partnership Benefits
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>• Co-publication opportunities in our research volumes</p>
                    <p>• Access to digitized manuscript collections</p>
                    <p>• Joint conference and symposium participation</p>
                  </div>
                  <div className="space-y-2">
                    <p>• Student and faculty exchange programs</p>
                    <p>• Collaborative research funding opportunities</p>
                    <p>• Recognition in DKEGL CSR initiatives</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button type="submit" className="bg-peacock-blue hover:bg-peacock-blue/90 text-cream">
                  <Building className="h-4 w-4 mr-2" />
                  Submit Partnership Proposal
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/about')}
                  className="border-2 border-saffron text-saffron hover:bg-saffron hover:text-charcoal"
                >
                  Return to Research Centre
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}