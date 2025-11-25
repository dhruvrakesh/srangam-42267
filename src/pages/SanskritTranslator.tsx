import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconOm, IconScript, IconLotus } from "@/components/icons";
import { BookOpen, FileText, MapPin, Languages, ArrowRight, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function SanskritTranslator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Srangam Sanskrit Translation & Analysis",
    "applicationCategory": "EducationalApplication",
    "description": "Deep linguistic processing tool for Sanskrit texts with sandhi splitting, morphological parsing, named-entity recognition and evidence-based translation.",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Sandhi splitting with Pāṇinian grammar",
      "Morphological parsing (root, gender, number, case)",
      "Named-entity recognition (tribes, clans, places)",
      "Evidence-based translation with critical edition citations",
      "Multilingual support",
      "Export as JSON/HTML"
    ]
  };

  return (
    <>
      <Helmet>
        <title>Sanskrit Translation & Analysis | Pāṇinian Grammar-Based Tool | Srangam</title>
        <meta 
          name="description" 
          content="Upload Sanskrit manuscripts for detailed translation with sandhi splitting, morphological parsing, and named-entity recognition. Powered by Pāṇinian grammar and AI, with evidence-based citations." 
        />
        <meta 
          name="keywords" 
          content="Sanskrit translation, Pāṇinian grammar, sandhi splitting, morphological parsing, Sanskrit OCR, named entity recognition, Devanagari, IAST, critical editions, linguistic analysis" 
        />
        <link rel="canonical" href="https://srangam.lovable.app/sanskrit-translator" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Sanskrit Translation & Analysis | Srangam" />
        <meta property="og:description" content="Deep linguistic processing for Sanskrit texts with explainable translations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://srangam.lovable.app/sanskrit-translator" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-dharma/10 via-background to-lotus-pink/10">
          <div className="absolute inset-0 ocean-waves opacity-10" />
          <div className="absolute top-20 right-20 opacity-5">
            <IconOm className="w-64 h-64 text-saffron" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Sanskrit blessing */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <IconLotus className="w-8 h-8 text-saffron" />
                <p className="text-lg sm:text-xl text-muted-foreground font-serif italic">
                  सत्यं वद धर्मं चर | Satyaṃ Vada Dharmaṃ Chara
                </p>
                <IconLotus className="w-8 h-8 text-saffron" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                Unlock the Classics,{" "}
                <span className="bg-gradient-to-r from-saffron via-indigo-dharma to-peacock-blue bg-clip-text text-transparent">
                  Line by Line
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Srangam's Sanskrit Translation & Analysis tool lets you upload or paste classical texts 
                and receive detailed, explainable translations. Powered by Pāṇinian grammar, modern AI 
                and a growing database of tribes, clans and places, it turns manuscripts into living 
                stories – with every sandhi split and morphological tag at your fingertips.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-saffron to-turmeric hover:from-saffron/90 hover:to-turmeric/90 text-white shadow-lg group"
                  asChild
                >
                  <a href="mailto:research@srangam.app?subject=Sanskrit%20Translator%20Access%20Request">
                    <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Request Access
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-indigo-dharma text-indigo-dharma hover:bg-indigo-dharma hover:text-white"
                  asChild
                >
                  <Link to="/articles/sanskrit-translator-methodology">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read Methodology
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <IconScript className="w-5 h-5 text-saffron" />
                  <span>1,108 Sanskrit Terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-peacock-blue" />
                  <span>8 Language Outputs</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-dharma" />
                  <span>Export JSON/HTML</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-sandalwood/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Deep Linguistic Analysis, Made Transparent
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every layer of Sanskrit grammar exposed, from sandhi rules to cultural context
              </p>
            </div>

            {/* 3-column features grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1: Deep Linguistic Processing */}
              <Card className="border-2 border-border hover:border-indigo-dharma transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-dharma to-peacock-blue flex items-center justify-center mb-4">
                    <Languages className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">
                    Deep Linguistic Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    Your Sanskrit passage is cleaned, standardised and sandhi‑split using proven 
                    linguistic algorithms. Each word is morphologically parsed, so you see its root, 
                    gender, number and case, not just a rough translation. This transparency helps 
                    students and scholars follow the grammatical logic behind every line.
                  </CardDescription>
                  <Button 
                    variant="link" 
                    className="mt-4 p-0 h-auto text-indigo-dharma hover:text-indigo-light group"
                  >
                    Learn about sandhi splitting
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 2: Named-Entity Recognition */}
              <Card className="border-2 border-border hover:border-saffron transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-saffron to-turmeric flex items-center justify-center mb-4">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">
                    Named‑Entity Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    Beyond grammar, the tool detects cultural markers within the text. Tribes, clans, 
                    dynasties, places and rivers are extracted and cross‑referenced with our cultural 
                    terms database. Clicking a highlighted term reveals etymology and context, bridging 
                    narrative and geography.
                  </CardDescription>
                  <Button 
                    variant="link" 
                    className="mt-4 p-0 h-auto text-saffron hover:text-saffron-light group"
                    asChild
                  >
                    <Link to="/sources/sanskrit-terminology">
                      Explore cultural terms
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 3: Evidence-based Translation */}
              <Card className="border-2 border-border hover:border-peacock-blue transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-peacock-blue to-ocean-teal flex items-center justify-center mb-4">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">
                    Evidence‑based Translation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    Translations aren't hallucinations. The engine cites parallel verses from critical 
                    editions, traditional commentaries and modern scholarship. When multiple meanings 
                    are possible, the tool explains its choice, giving you confidence in the rendering 
                    and pointers for further exploration.
                  </CardDescription>
                  <Button 
                    variant="link" 
                    className="mt-4 p-0 h-auto text-peacock-blue hover:text-ocean-teal group"
                    asChild
                  >
                    <Link to="/reading-room">
                      View bibliography
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo/Preview Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lotus-pink/10 via-background to-indigo-dharma/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-muted-foreground">
                Sample translation workflow from manuscript to annotated narrative
              </p>
            </div>

            <Card className="border-2 border-border bg-card shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-indigo-dharma/10 to-peacock-blue/10 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <IconScript className="w-6 h-6 text-saffron" />
                  Sample Verse Analysis
                </CardTitle>
                <CardDescription>
                  From the Mahābhārata, Ādi Parva (1.1.1)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Original Sanskrit */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">ORIGINAL TEXT (Devanagari)</p>
                  <p className="text-2xl font-serif text-foreground leading-relaxed">
                    नारायणं नमस्कृत्य नरं चैव नरोत्तमम् ।
                  </p>
                </div>

                {/* Sandhi Split */}
                <div className="border-l-4 border-indigo-dharma pl-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">SANDHI SPLIT (IAST)</p>
                  <p className="text-lg font-mono text-foreground">
                    nārāyaṇam namaskṛtya naram ca eva narottamam
                  </p>
                </div>

                {/* Morphological Parse */}
                <div className="bg-sandalwood/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">MORPHOLOGICAL PARSE</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold text-indigo-dharma">nārāyaṇam:</span> acc. sg. m. (Viṣṇu)
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-dharma">namaskṛtya:</span> absolutive (bow)
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-dharma">naram:</span> acc. sg. m. (Arjuna)
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-dharma">narottamam:</span> acc. sg. m. (best of men)
                    </div>
                  </div>
                </div>

                {/* Translation */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">TRANSLATION (English)</p>
                  <p className="text-lg text-foreground leading-relaxed italic">
                    "Having bowed to Nārāyaṇa [Viṣṇu], and also to Nara, the best of men [Arjuna]..."
                  </p>
                </div>

                {/* Citations */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Critical Edition:</span> BORI CE (1933) | 
                    <span className="font-semibold ml-3">Commentary:</span> Nīlakaṇṭha Caturdhara
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-peacock-blue to-ocean-teal hover:from-peacock-blue/90 hover:to-ocean-teal/90 text-white shadow-lg"
                asChild
              >
                <a href="mailto:research@srangam.app?subject=Sanskrit%20Translator%20Demo%20Request&body=Please%20share%20a%20sample%20Sanskrit%20text%20you'd%20like%20analyzed.">
                  Request Analysis Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-dharma to-peacock-blue text-white relative overflow-hidden">
          <div className="absolute inset-0 ocean-waves opacity-10" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <IconOm className="w-16 h-16 mx-auto mb-6 opacity-80" />
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Explore Sanskrit Like Never Before?
            </h2>
            
            <p className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed">
              Try the Srangam Translator today for free and transform your manuscripts into 
              structured, annotated narratives. Sign in with your Srangam account to save your 
              translations, export results as JSON or HTML, and contribute corrections to improve 
              our models.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-white text-indigo-dharma hover:bg-cream shadow-lg"
                asChild
              >
                <a href="mailto:research@srangam.app?subject=Sanskrit%20Translator%20Research%20Collaboration">
                  <Upload className="w-5 h-5 mr-2" />
                  Request Research Access
                </a>
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to="/about">
                  Learn About Srangam
                </Link>
              </Button>
            </div>

            {/* Features list */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-left">
                  <p className="font-semibold">Private & Secure</p>
                  <p className="opacity-80">Encrypted database storage</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-left">
                  <p className="font-semibold">Open Source</p>
                  <p className="opacity-80">Contribute improvements</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-left">
                  <p className="font-semibold">Export Anywhere</p>
                  <p className="opacity-80">JSON, HTML, PDF formats</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
