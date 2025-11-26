import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconOm, IconScript, IconLotus } from "@/components/icons";
import { BookOpen, FileText, MapPin, Languages, ArrowRight, Upload, Github, Code2, Terminal, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SanskritTranslator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Srangam Sanskrit Translation & Analysis",
    "applicationCategory": "EducationalApplication",
    "applicationSubCategory": "Research Tool",
    "description": "Deep linguistic processing tool for Sanskrit texts with sandhi splitting, morphological parsing, named-entity recognition and evidence-based translation.",
    "operatingSystem": "Web browser",
    "codeRepository": "https://github.com/srangam-research/sanskrit-automaton",
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
          content="Sanskrit translation, Pāṇinian grammar, sandhi splitting, morphological parsing, Sanskrit OCR, named entity recognition, Devanagari, IAST, critical editions, linguistic analysis, open source" 
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
                  className="border-2 border-peacock-blue text-peacock-blue hover:bg-peacock-blue hover:text-white"
                  asChild
                >
                  <a
                    href="https://github.com/srangam-research/sanskrit-automaton"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View on GitHub
                  </a>
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

        {/* How It Works - Pipeline Visualization */}
        <section className="py-16 bg-sandalwood/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-4">
              How the Pipeline Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A five-stage computational pipeline transforms raw Sanskrit into structured, analyzable knowledge
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[
                { step: '1', title: 'Normalize', desc: 'Clean diacritics & transliterate', icon: '🔤' },
                { step: '2', title: 'Sandhi Split', desc: 'Break compound words', icon: '✂️' },
                { step: '3', title: 'Morph Parse', desc: 'Identify roots & cases', icon: '🔬' },
                { step: '4', title: 'NER Tag', desc: 'Extract tribes & places', icon: '🏛️' },
                { step: '5', title: 'Translate', desc: 'Evidence-based rendering', icon: '📖' }
              ].map((stage) => (
                <div key={stage.step} className="bg-card p-6 rounded-lg border border-border text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-2">{stage.icon}</div>
                  <div className="text-xs font-bold text-saffron mb-1">STEP {stage.step}</div>
                  <div className="font-semibold text-foreground mb-2">{stage.title}</div>
                  <div className="text-xs text-muted-foreground">{stage.desc}</div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Built with <span className="text-peacock-blue font-medium">sanskrit_parser</span> • <span className="text-peacock-blue font-medium">Sanskrit Heritage API</span> • <span className="text-peacock-blue font-medium">IndicTrans2</span>
              </p>
            </div>
          </div>
        </section>

        {/* Upstream Sources */}
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-4">
              Standing on the Shoulders of Giants
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our tool builds upon decades of scholarly work in Sanskrit linguistics, lexicography, and digital humanities
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Sanskrit Heritage',
                  author: 'Gérard Huet',
                  desc: 'Morphological analyzer and reader providing computational Pāṇinian parsing',
                  link: 'https://sanskrit.inria.fr/'
                },
                {
                  title: 'sanskrit_parser',
                  author: 'Python Library',
                  desc: 'Open-source sandhi splitting and sentence analysis with karaka identification',
                  link: 'https://github.com/kmadathil/sanskrit_parser'
                },
                {
                  title: 'Cologne Sanskrit Lexicon',
                  author: 'Monier-Williams',
                  desc: 'Comprehensive digital Sanskrit-English dictionary for semantic lookup',
                  link: 'https://www.sanskrit-lexicon.uni-koeln.de/'
                },
                {
                  title: 'BORI Critical Edition',
                  author: 'Mahābhārata',
                  desc: 'Authoritative text for verse citations and cross-referencing translations',
                  link: 'https://bombay.indology.info/'
                },
                {
                  title: 'Bibek Debroy Translation',
                  author: 'Mahābhārata & Purāṇas',
                  desc: 'Modern English renderings for validation and comparative analysis',
                  link: null
                },
                {
                  title: 'IndicTrans2',
                  author: 'AI4Bharat',
                  desc: 'Neural MT model family with san_Deva support for explainable translation',
                  link: 'https://github.com/AI4Bharat/IndicTrans2'
                }
              ].map((source, idx) => (
                <div key={idx} className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-foreground mb-2">{source.title}</h3>
                  <p className="text-sm text-saffron mb-2">{source.author}</p>
                  <p className="text-sm text-muted-foreground mb-3">{source.desc}</p>
                  {source.link && (
                    <a 
                      href={source.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-peacock-blue hover:underline inline-flex items-center gap-1"
                    >
                      Visit Resource <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pāṇinian Grounding */}
        <section className="py-16 bg-turmeric/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <IconOm size={48} className="text-turmeric mx-auto mb-4 animate-pulse-gentle" />
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Pāṇinian Grounding
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Unlike black-box translation systems, our pipeline respects the <strong className="text-foreground">grammatical well-formedness</strong> principles 
                established by Pāṇini's Aṣṭādhyāyī. Every sandhi split and morphological parse is explainable, traceable back to 
                linguistic rules rather than statistical patterns alone.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-card p-6 rounded-lg border-l-4 border-saffron">
                  <h3 className="font-semibold text-foreground mb-2">Evidence-Based Translation</h3>
                  <p className="text-sm">
                    Translations cite parallel verses from BORI critical editions, traditional commentaries, and modern scholarship. 
                    When multiple interpretations exist, the tool explains its reasoning.
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border-l-4 border-peacock-blue">
                  <h3 className="font-semibold text-foreground mb-2">TEI/XML Compatibility</h3>
                  <p className="text-sm">
                    Export structured data compatible with Text Encoding Initiative standards, enabling integration 
                    with digital humanities workflows and scholarly archives.
                  </p>
                </div>
              </div>
              
              <p className="text-center text-sm italic">
                "A tool that shows its work is a tool scholars can trust"
              </p>
            </div>
          </div>
        </section>

        {/* For Developers */}
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Github size={48} className="text-foreground mx-auto mb-4" />
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                For Developers & Researchers
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The Sanskrit Automaton is fully open-source. Explore the codebase, run your own instance, 
                or contribute improvements to linguistic models.
              </p>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Code2 size={20} className="text-saffron" />
                    Project Structure
                  </h3>
                  <div className="font-mono text-xs text-muted-foreground space-y-1 bg-muted p-4 rounded">
                    <div>sanskrit-automaton/</div>
                    <div className="pl-4">├── scripts/</div>
                    <div className="pl-8">├── normalize_text.py</div>
                    <div className="pl-8">├── sandhi_split.py</div>
                    <div className="pl-8">├── morph_parse.py</div>
                    <div className="pl-8">├── ner_tag.py</div>
                    <div className="pl-8">└── infer_mt.py</div>
                    <div className="pl-4">├── data/</div>
                    <div className="pl-4">├── configs/</div>
                    <div className="pl-4">└── webui/</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Terminal size={20} className="text-peacock-blue" />
                    API Endpoints
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded">
                      <div className="font-mono text-xs text-peacock-blue mb-1">POST /analyze</div>
                      <div className="text-xs text-muted-foreground">Full pipeline analysis</div>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <div className="font-mono text-xs text-peacock-blue mb-1">GET /entities</div>
                      <div className="text-xs text-muted-foreground">Named entity extraction</div>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <div className="font-mono text-xs text-peacock-blue mb-1">POST /translate?explain=true</div>
                      <div className="text-xs text-muted-foreground">Translation with evidence</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-6 border-t border-border">
                <a
                  href="https://github.com/srangam-research/sanskrit-automaton"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-saffron hover:bg-saffron-light text-charcoal-om font-medium rounded-lg transition-colors"
                >
                  <Github size={20} />
                  View on GitHub
                </a>
                <p className="mt-4 text-sm text-muted-foreground">
                  Python 3.10+ • Label Studio templates included • Human-in-the-loop corrections supported
                </p>
              </div>
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
                  <IconScript size={20} className="mr-2" />
                  Start Translating
                </a>
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-indigo-dharma"
                asChild
              >
                <a
                  href="https://github.com/srangam-research/sanskrit-automaton"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={20} className="mr-2" />
                  View on GitHub
                </a>
              </Button>
            </div>

            <div className="mt-8 text-sm opacity-75">
              <p>Privacy-respecting • Export JSON/HTML • Open source • Human-in-the-loop corrections</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
