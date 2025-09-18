import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Heart, Building2, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportResearch() {
  const navigate = useNavigate();

  const supportOptions = [
    {
      title: "Individual Donations",
      icon: Heart,
      description: "Support dharmic research through direct contributions to our scholarship fund",
      actions: [
        { 
          label: "Donate via UPI", 
          onClick: () => window.open("upi://pay?pa=donations@nartiang.org&pn=Nartiang Foundation&mc=8661&tr=SRANGAM001&tn=Dharmic Research Support", "_blank")
        },
        { 
          label: "Bank Transfer Details", 
          onClick: () => window.location.href = "mailto:donations@nartiang.org?subject=Bank Transfer Details Request&body=Please provide bank transfer details for research donations."
        }
      ]
    },
    {
      title: "Corporate Sponsorship",
      icon: Building2,
      description: "Corporate Social Responsibility partnerships with tax benefits under 80G",
      actions: [
        { 
          label: "CSR Partnership Inquiry", 
          onClick: () => window.location.href = "mailto:csr@dkegl.com?subject=CSR Partnership - Srangam Research Initiative&body=We are interested in corporate sponsorship for dharmic research initiatives. Please provide partnership details and tax benefit information."
        },
        { 
          label: "Download CSR Brochure", 
          onClick: () => alert("CSR brochure download will be available soon. Please contact csr@dkegl.com for immediate information.")
        }
      ]
    },
    {
      title: "Research Endowment",
      icon: Award,
      description: "Establish named fellowships or fund specific research projects",
      actions: [
        { 
          label: "Endowment Options", 
          onClick: () => window.location.href = "mailto:endowments@nartiang.org?subject=Research Endowment Inquiry&body=I am interested in establishing a research endowment. Please provide information about available options and minimum contributions."
        },
        { 
          label: "Named Fellowship Program", 
          onClick: () => window.location.href = "mailto:fellowships@nartiang.org?subject=Named Fellowship Inquiry&body=I would like to establish a named fellowship for dharmic research. Please provide program details and requirements."
        }
      ]
    },
    {
      title: "Volunteer Support",
      icon: Users,
      description: "Contribute your time and expertise to our research initiatives",
      actions: [
        { 
          label: "Research Volunteer Application", 
          onClick: () => window.location.href = "mailto:volunteers@nartiang.org?subject=Research Volunteer Application&body=I would like to volunteer my time and expertise to support dharmic research initiatives. Please provide volunteer opportunities and application process."
        },
        { 
          label: "Technical Support Volunteers", 
          onClick: () => window.location.href = "mailto:tech@nartiang.org?subject=Technical Volunteer Inquiry&body=I have technical skills and would like to volunteer for digital research initiatives. Please let me know how I can contribute."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/about')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research Centre
        </Button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-turmeric/20 to-saffron/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={40} className="text-turmeric" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            अनुसंधान सहायता | Support Research
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            यज्ञशिष्टाशिनः सन्तो मुच्यन्ते सर्वकिल्बिषैः — Those who support righteous knowledge 
            are freed from all obstacles. Join us in advancing dharmic research that honors 
            India's intellectual heritage while supporting contemporary scholarship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {supportOptions.map((option, index) => (
            <Card key={index} className="bg-gradient-to-br from-turmeric/10 to-sandalwood/20 border-2 border-turmeric/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-turmeric/20 to-saffron/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <option.icon size={32} className="text-turmeric" />
                </div>
                <CardTitle className="font-serif text-xl text-foreground">
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-6">
                  {option.description}
                </p>
                <div className="space-y-3">
                  {option.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      onClick={action.onClick}
                      variant={actionIndex === 0 ? "default" : "outline"}
                      className={actionIndex === 0 
                        ? "w-full bg-turmeric hover:bg-turmeric/90 text-charcoal" 
                        : "w-full border-2 border-turmeric text-turmeric hover:bg-turmeric hover:text-charcoal"
                      }
                    >
                      {action.label}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-saffron/10 to-lotus-pink/10 border-2 border-saffron/30">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-foreground text-center">
              Why Support Dharmic Research?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-saffron/20 to-turmeric/20 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-saffron" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Preserve Indigenous Knowledge
                </h3>
                <p className="text-muted-foreground">
                  Support the documentation and preservation of traditional Indian scholarly 
                  methodologies that risk being lost to time.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-peacock-blue/20 to-indigo-dharma/20 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="h-6 w-6 text-peacock-blue" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Advance Academic Excellence
                </h3>
                <p className="text-muted-foreground">
                  Fund cutting-edge research that challenges colonial frameworks while 
                  maintaining the highest standards of academic rigor.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-sandalwood/20 rounded-lg border border-saffron/20">
              <h4 className="font-semibold text-foreground mb-3 text-center">
                Tax Benefits & Recognition
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="text-center">
                  • All donations to Nartiang Foundation are eligible for 80G tax deductions
                </p>
                <p className="text-center">
                  • Corporate sponsors receive CSR compliance documentation
                </p>
                <p className="text-center">
                  • Major contributors are recognized in our annual research publications
                </p>
                <p className="text-center">
                  • Endowment contributors have research projects named in their honor
                </p>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button 
                onClick={() => window.location.href = "mailto:info@nartiang.org?subject=General Support Inquiry&body=I would like more information about supporting dharmic research initiatives. Please provide details about available opportunities."}
                className="bg-saffron hover:bg-saffron/90 text-charcoal"
              >
                <Heart className="h-4 w-4 mr-2" />
                Get More Information
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}