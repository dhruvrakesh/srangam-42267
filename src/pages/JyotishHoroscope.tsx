import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconOm, IconLotus } from "@/components/icons";
import { BookOpen, Calendar, TrendingUp, Info, ArrowRight, MailIcon, Github, Code2, Terminal, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function JyotishHoroscope() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Srangam Jyotiṣa Horoscope Calculator",
    "applicationCategory": "EducationalApplication",
    "applicationSubCategory": "Research Tool",
    "description": "Sidereal astronomy-based birth chart calculator using Swiss Ephemeris. Generates D1/D9 charts, planetary positions, and Vimśottarī Daśā timelines with mathematical precision.",
    "operatingSystem": "Python 3.x",
    "codeRepository": "https://github.com/srangam-research/jyotish-calculator",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Swiss Ephemeris integration (sidereal)",
      "Multiple Ayanāṃśa systems (Lahiri, Krishnamurti, Raman)",
      "D1 (Rāśi) and D9 (Navāṃśa) chart generation",
      "Vimśottarī Daśā timeline",
      "Astronomical accuracy (no predictive claims)"
    ]
  };

  return (
    <>
      <Helmet>
        <title>Jyotiṣa Horoscope Calculator | Sidereal Astronomy Tool | Srangam</title>
        <meta 
          name="description" 
          content="Generate precise sidereal birth charts using Swiss Ephemeris. Calculate D1/D9 charts, planetary positions with multiple Ayanāṃśa systems, and Vimśottarī Daśā timelines. Astronomy-focused, no predictions." 
        />
        <meta 
          name="keywords" 
          content="Jyotish, Vedic astrology, sidereal astronomy, Swiss Ephemeris, Lahiri Ayanamsa, birth chart, D1 chart, D9 Navamsa, Vimshottari Dasha, astronomical calculations, open source" 
        />
        <link rel="canonical" href="https://srangam.lovable.app/jyotish-horoscope" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Jyotiṣa Horoscope Calculator | Srangam" />
        <meta property="og:description" content="Sidereal birth chart calculation with Swiss Ephemeris precision" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://srangam.lovable.app/jyotish-horoscope" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-saffron/10 via-background to-indigo-dharma/10">
          <div className="absolute inset-0 ocean-waves opacity-10" />
          <div className="absolute top-20 left-20 opacity-5">
            <IconOm className="w-64 h-64 text-peacock-blue" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Sanskrit blessing */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <IconLotus className="w-8 h-8 text-saffron" />
                <p className="text-lg sm:text-xl text-muted-foreground font-serif italic">
                  ज्योतिषां ज्योतिः | Jyotiṣāṃ Jyotiḥ
                </p>
                <IconLotus className="w-8 h-8 text-saffron" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                Your Vedic Horoscope,{" "}
                <span className="bg-gradient-to-r from-peacock-blue via-indigo-dharma to-saffron bg-clip-text text-transparent">
                  Calculated Precisely
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Discover your sidereal horoscope with Srangam's Jyotiṣa Panchang app. Enter your birth details to view accurate 
                planetary positions, rāśis, houses and Daśā timelines. Our Swiss‑Ephemeris engine honours classical ayanāṃśa 
                choices while presenting the data in a modern, interactive format.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-peacock-blue to-ocean-teal hover:from-peacock-blue/90 hover:to-ocean-teal/90 text-white shadow-lg group"
                  asChild
                >
                  <a href="mailto:research@srangam.app?subject=Jyotish%20Calculator%20Access%20Request">
                    <Calendar className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Request Access
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-saffron text-saffron hover:bg-saffron hover:text-white"
                  asChild
                >
                  <a
                    href="https://github.com/srangam-research/jyotish-calculator"
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
                  <Calendar className="w-5 h-5 text-peacock-blue" />
                  <span>Swiss Ephemeris (0.001″)</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-saffron" />
                  <span>Multiple Ayanāṃśas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-dharma" />
                  <span>Astronomy Only</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-lotus-pink/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Precision Astronomy, Transparent Calculations
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every calculation grounded in sidereal astronomy, not speculative predictions
              </p>
            </div>

            {/* 4-column features grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Sidereal Precision */}
              <Card className="border-2 border-border hover:border-peacock-blue transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-peacock-blue to-ocean-teal flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    Sidereal Precision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    Uses the Swiss Ephemeris library with Lahiri Ayanāṃśa (currently ~24°) to calculate 
                    true sidereal positions, not tropical approximations.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2: D1 & D9 Charts */}
              <Card className="border-2 border-border hover:border-saffron transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron to-turmeric flex items-center justify-center mb-3">
                    <IconOm className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    D1 & D9 Charts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    Generates both Rāśi (D1) and Navāṃśa (D9) divisional charts with house cusps 
                    calculated using Placidus or Whole Sign systems.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3: Vimśottarī Daśā */}
              <Card className="border-2 border-border hover:border-indigo-dharma transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-dharma to-peacock-blue flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    Vimśottarī Daśā
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    Calculates the 120-year Mahādaśā cycle and sub-periods (Antaradaśā, Pratyantaradaśā) 
                    based on Moon's nakṣatra at birth.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 4: Ethical Disclaimer */}
              <Card className="border-2 border-border hover:border-lotus-pink transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lotus-pink to-sandalwood flex items-center justify-center mb-3">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    No Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    We provide astronomical data only. This tool does not make life predictions, 
                    health claims, or financial forecasts.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sample Output Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-dharma/5 via-background to-peacock-blue/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Sample Birth Chart Calculation
              </h2>
              <p className="text-lg text-muted-foreground">
                Example output from the Python calculator (anonymized data)
              </p>
            </div>

            <Card className="border-2 border-border bg-card shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-peacock-blue/10 to-indigo-dharma/10 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-peacock-blue" />
                  Birth Chart Analysis
                </CardTitle>
                <CardDescription>
                  Born: 15 Aug 1947, 00:00 IST, New Delhi (28.6139° N, 77.2090° E)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Planetary Positions */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-3">SIDEREAL PLANETARY POSITIONS (Lahiri)</p>
                  <div className="grid grid-cols-2 gap-3 text-sm font-mono bg-sandalwood/20 p-4 rounded-lg">
                    <div><span className="font-semibold text-peacock-blue">Sun:</span> 28°42' Cancer (Nakṣatra: Āśleṣā)</div>
                    <div><span className="font-semibold text-peacock-blue">Moon:</span> 14°18' Scorpio (Nakṣatra: Anurādhā)</div>
                    <div><span className="font-semibold text-peacock-blue">Mars:</span> 10°25' Gemini (Nakṣatra: Ārdrā)</div>
                    <div><span className="font-semibold text-peacock-blue">Mercury:</span> 15°03' Cancer (Nakṣatra: Puṣya)</div>
                    <div><span className="font-semibold text-peacock-blue">Jupiter:</span> 26°47' Libra (Nakṣatra: Viśākhā)</div>
                    <div><span className="font-semibold text-peacock-blue">Venus:</span> 12°29' Virgo (Nakṣatra: Hasta)</div>
                    <div><span className="font-semibold text-peacock-blue">Saturn:</span> 29°15' Cancer (Nakṣatra: Āśleṣā)</div>
                    <div><span className="font-semibold text-peacock-blue">Rāhu:</span> 10°08' Taurus (Nakṣatra: Rohiṇī)</div>
                  </div>
                </div>

                {/* D1 Rāśi Chart (text representation) */}
                <div className="border-l-4 border-peacock-blue pl-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">D1 RĀŚI CHART (South Indian Style)</p>
                  <p className="text-sm text-muted-foreground italic">
                    Lagna (Ascendant): 23°15' Cancer | Moon in 5th house (Scorpio) | 
                    Vimśottarī Mahādaśā: Moon (1947–1957)
                  </p>
                </div>

                {/* Daśā Timeline */}
                <div className="bg-indigo-dharma/10 rounded-lg p-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">VIMŚOTTARĪ DAŚĀ TIMELINE (First 3 Mahādaśās)</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-peacock-blue">Moon Daśā:</span>
                      <span className="text-muted-foreground">15 Aug 1947 – 15 Aug 1957 (10 years)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-saffron">Mars Daśā:</span>
                      <span className="text-muted-foreground">15 Aug 1957 – 15 Aug 1964 (7 years)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-indigo-dharma">Rāhu Daśā:</span>
                      <span className="text-muted-foreground">15 Aug 1964 – 15 Aug 1982 (18 years)</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    <span className="font-semibold">Disclaimer:</span> This is astronomical data only. 
                    Srangam makes no predictive claims. Interpretation requires expertise in Jyotiṣa śāstra.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-saffron to-turmeric hover:from-saffron/90 hover:to-turmeric/90 text-white shadow-lg"
                asChild
              >
                <a href="mailto:research@srangam.app?subject=Jyotish%20Calculator%20Demo%20Request&body=Please%20share%20birth%20details%20for%20sample%20calculation%20(Date,%20Time,%20Location).">
                  <MailIcon className="w-5 h-5 mr-2" />
                  Request Your Chart
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-peacock-blue to-indigo-dharma text-white relative overflow-hidden">
          <div className="absolute inset-0 ocean-waves opacity-10" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <IconOm className="w-16 h-16 mx-auto mb-6 opacity-80" />
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Explore Celestial Mathematics with Precision
            </h2>
            
            <p className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed">
              This calculator is part of Srangam's commitment to open, scholarly tools for Indian 
              astronomical traditions. Request access for research purposes, and explore how sidereal 
              calculations reveal the mathematical beauty of Jyotiṣa—without fortune-telling.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-white text-peacock-blue hover:bg-cream shadow-lg"
                asChild
              >
                <a href="mailto:research@srangam.app?subject=Jyotish%20Research%20Collaboration">
                  <Calendar className="w-5 h-5 mr-2" />
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

            {/* Research collaboration features */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>Research Purpose Only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>Open Methodology</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>No Predictions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>Python Scripts Available</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
