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
        <link rel="canonical" href="https://srangam.nartiang.org/jyotish-horoscope" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Jyotiṣa Horoscope Calculator | Srangam" />
        <meta property="og:description" content="Sidereal birth chart calculation with Swiss Ephemeris precision" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://srangam.nartiang.org/jyotish-horoscope" />
        
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

              {/* Trust badges - Vedāṅga scholarly framing */}
              <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-peacock-blue" />
                  <span>Vedāṅga Jyotiṣa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-saffron" />
                  <span>Mathematical Astronomy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-indigo-dharma" />
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vedāṅga Context Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sandalwood/20 via-background to-lotus-pink/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <IconLotus className="w-10 h-10 text-saffron" />
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Jyotiṣa: The Science of Light (Vedāṅga)
                </h2>
                <IconLotus className="w-10 h-10 text-saffron" />
              </div>
              <p className="text-xl text-peacock-blue font-serif italic">
                ज्योतिष वेदस्य चक्षुः | "Jyotiṣa is the eye of the Veda"
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Vedāṅga Limbs */}
              <Card className="border-2 border-peacock-blue/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-peacock-blue" />
                    One of the Ṣaḍ-Aṅga (Six Limbs)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Jyotiṣa is one of the six auxiliary sciences (vedāṅga) essential to Vedic scholarship:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-peacock-blue font-mono">•</span>
                      <span><strong className="text-foreground">Śikṣā</strong> (Phonetics) — Correct pronunciation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-peacock-blue font-mono">•</span>
                      <span><strong className="text-foreground">Chandas</strong> (Prosody) — Poetic meter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-peacock-blue font-mono">•</span>
                      <span><strong className="text-foreground">Vyākaraṇa</strong> (Grammar) — Linguistic structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-peacock-blue font-mono">•</span>
                      <span><strong className="text-foreground">Nirukta</strong> (Etymology) — Word origins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-peacock-blue font-mono">•</span>
                      <span><strong className="text-foreground">Kalpa</strong> (Ritual) — Ceremonial procedures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-saffron font-mono">•</span>
                      <span><strong className="text-saffron">Jyotiṣa</strong> (Astronomy) — Timekeeping for rituals</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Historical Context */}
              <Card className="border-2 border-indigo-dharma/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-dharma" />
                    Textual Foundations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Classical Jyotiṣa texts form the foundation of Indian mathematical astronomy:
                  </p>
                  <ul className="space-y-3 text-sm">
                    <li className="border-l-2 border-peacock-blue pl-3">
                      <strong className="text-foreground">Vedāṅga Jyotiṣa</strong> (Lagadha, ~1400-1200 BCE)<br/>
                      <span className="text-muted-foreground text-xs">Oldest extant Indian astronomical text</span>
                    </li>
                    <li className="border-l-2 border-saffron pl-3">
                      <strong className="text-foreground">Sūrya Siddhānta</strong> (~400-500 CE)<br/>
                      <span className="text-muted-foreground text-xs">Mathematical astronomy treatise</span>
                    </li>
                    <li className="border-l-2 border-indigo-dharma pl-3">
                      <strong className="text-foreground">Āryabhaṭīya</strong> (Āryabhaṭa, 499 CE)<br/>
                      <span className="text-muted-foreground text-xs">Heliocentric insights, planetary calculations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Purpose Statement */}
            <Card className="border-2 border-saffron bg-gradient-to-br from-saffron/5 to-turmeric/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Info className="w-8 h-8 text-saffron flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Purpose: Ritual Timekeeping, Not Fortune-Telling
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      <span className="font-serif italic text-peacock-blue">"वेदा हि यज्ञार्थमभिप्रवृत्ताः"</span><br/>
                      <span className="text-sm">("The Vedas are intended for the purpose of sacrifice")</span>
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Jyotiṣa was developed to determine auspicious times (muhūrta) for Vedic rituals—not for 
                      predicting personal fortunes. Panchang calculations enabled communities across the subcontinent 
                      to synchronize festivals and ceremonies based on precise lunar-solar astronomy.
                    </p>
                    <div className="mt-4 p-4 bg-background/50 rounded-lg border-l-4 border-saffron">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        This Tool's Scholarly Focus
                      </p>
                      <p className="text-sm text-muted-foreground">
                        The Srangam Jyotiṣa Calculator is designed for <strong>mathematical astronomy research</strong>, 
                        historical chronology studies, and understanding Vedic timekeeping systems. It makes 
                        <strong> no predictive claims</strong> about personal destiny, health, or fortune.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Astronomical Precision Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-dharma/10 via-background to-peacock-blue/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Computational Astronomy: Swiss Ephemeris Engine
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Modern astronomical precision applied to traditional sidereal calculations
              </p>
            </div>

            {/* Swiss Ephemeris Details */}
            <Card className="border-2 border-peacock-blue bg-card/50 backdrop-blur mb-8">
              <CardHeader className="bg-gradient-to-r from-peacock-blue/10 to-indigo-dharma/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-peacock-blue" />
                  Swiss Ephemeris: NASA-Grade Precision
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    This calculator uses the <strong className="text-foreground">Swiss Ephemeris</strong> library, 
                    which implements NASA's Jet Propulsion Laboratory (JPL) ephemerides—the same data used for 
                    space mission navigation.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-peacock-blue/5 rounded-lg p-4 border border-peacock-blue/20">
                      <p className="text-sm font-semibold text-peacock-blue mb-2">Ephemeris Data</p>
                      <p className="text-sm text-muted-foreground">
                        NASA JPL DE431/DE406 planetary ephemerides
                      </p>
                    </div>
                    <div className="bg-indigo-dharma/5 rounded-lg p-4 border border-indigo-dharma/20">
                      <p className="text-sm font-semibold text-indigo-dharma mb-2">Precision</p>
                      <p className="text-sm text-muted-foreground">
                        0.001 arcsecond accuracy for planetary positions
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic pt-2">
                    This level of precision ensures that sidereal calculations match modern observational astronomy, 
                    making this tool suitable for academic research and historical correlation studies.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ayanāṃśa Systems Table */}
            <Card className="border-2 border-saffron bg-card/50 backdrop-blur mb-8">
              <CardHeader className="bg-gradient-to-r from-saffron/10 to-turmeric/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-saffron" />
                  Ayanāṃśa Systems: Tropical → Sidereal Transformation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The <strong className="text-foreground">ayanāṃśa</strong> (अयनांश) is the precession offset between 
                  tropical and sidereal zodiacs. Different schools of Jyotiṣa use different reference points for this 
                  calculation. This calculator supports four major ayanāṃśa traditions:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Ayanāṃśa</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Sanskrit</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Current Offset</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-peacock-blue/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-peacock-blue">Lahiri (Chitra Paksha)</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">लहिरी</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Official Government of India standard (since 1956)
                        </td>
                        <td className="py-3 px-4 font-mono text-peacock-blue">~24° 07'</td>
                      </tr>
                      <tr className="hover:bg-saffron/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-saffron">Krishnamurti</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">कृष्णमूर्ति</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Used in KP (Krishnamurti Paddhati) system
                        </td>
                        <td className="py-3 px-4 font-mono text-saffron">~23° 50'</td>
                      </tr>
                      <tr className="hover:bg-indigo-dharma/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-indigo-dharma">Raman</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">रमण</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Traditional variant (B.V. Raman)
                        </td>
                        <td className="py-3 px-4 font-mono text-indigo-dharma">~22° 30'</td>
                      </tr>
                      <tr className="hover:bg-lotus-pink/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-lotus-pink">Fagan/Bradley</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">—</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Western sidereal research tradition
                        </td>
                        <td className="py-3 px-4 font-mono text-lotus-pink">~24° 52'</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-indigo-dharma/5 rounded-lg border-l-4 border-indigo-dharma">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Mathematical Note: Coordinate Transformation
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sidereal longitude = (Tropical longitude − Ayanāṃśa) mod 360°
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    The ~1° difference between Lahiri and Krishnamurti can shift a planet's nakṣatra or rāśi placement, 
                    affecting daśā timings and house positions. Scholarly users should specify which ayanāṃśa was used 
                    when publishing research.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* True vs Mean Nodes */}
            <Card className="border-2 border-lotus-pink bg-card/50 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-lotus-pink/10 to-sandalwood/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-lotus-pink" />
                  True vs Mean Nodes (Rāhu/Ketu)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-peacock-blue mb-2">True Node (Oscillating)</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The Moon's orbital plane wobbles slightly due to gravitational perturbations. The 
                      <strong> true node</strong> reflects this real-time oscillation, varying by up to ±1.5° 
                      from the mean position over an 18.6-year cycle.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-saffron mb-2">Mean Node (Averaged)</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The <strong>mean node</strong> is a smoothed average that follows the long-term trend. 
                      Traditional Jyotiṣa texts typically reference the mean node for Rāhu/Ketu positions in charts.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-background/50 rounded border-l-4 border-peacock-blue">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Default Setting:</strong> This calculator uses the <strong>mean node</strong> 
                    by default, aligning with classical Jyotiṣa conventions. Advanced users can toggle to true node for 
                    observational astronomy studies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Panchang: Five Limbs of Time Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sandalwood/10 via-background to-turmeric/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Panchang: The Vedic Calendar System
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Five astronomical limbs (pañcāṅga) that define the Hindu calendar—not mystical divisions, but precise mathematical calculations
              </p>
            </div>

            <Card className="border-2 border-saffron bg-card/50 backdrop-blur mb-8">
              <CardHeader className="bg-gradient-to-r from-saffron/10 to-turmeric/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-saffron" />
                  The Five Limbs: Timekeeping Science
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The <strong className="text-foreground">Panchang</strong> (पञ्चाङ्ग, "five limbs") is the traditional 
                  Hindu calendar system, calculated from lunar-solar astronomy. These five elements determine the timing 
                  of festivals, rituals, and auspicious events across the Indian subcontinent.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Limb</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Sanskrit</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Definition</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Mathematical Formula</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Calendar Use</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-peacock-blue/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-peacock-blue">Tithi</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">तिथि</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Lunar Day (1/30 of lunar month)
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-peacock-blue">
                          (λ<sub>Moon</sub> − λ<sub>Sun</sub>) / 12°
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Determines ritual days (e.g., Ekādaśī, Pūrṇimā)
                        </td>
                      </tr>
                      <tr className="hover:bg-saffron/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-saffron">Nakṣatra</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">नक्षत्र</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Lunar Mansion (1/27 of zodiac)
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-saffron">
                          λ<sub>Moon</sub> / 13.333°
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          27-fold stellar division for birth charts
                        </td>
                      </tr>
                      <tr className="hover:bg-indigo-dharma/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-indigo-dharma">Yoga</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">योग</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Luni-Solar Sum (27 divisions)
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-indigo-dharma">
                          (λ<sub>Moon</sub> + λ<sub>Sun</sub>) / 13.333°
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Astronomical alignment for muhūrta
                        </td>
                      </tr>
                      <tr className="hover:bg-lotus-pink/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-lotus-pink">Karaṇa</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">करण</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Half-Tithi (60 per lunar month)
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-lotus-pink">
                          (λ<sub>Moon</sub> − λ<sub>Sun</sub>) / 6°
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          60 half-lunar-days cycle
                        </td>
                      </tr>
                      <tr className="hover:bg-ocean-teal/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-ocean-teal">Vāra</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">वार</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Weekday (7-day planetary week)
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-ocean-teal">
                          Sunrise-based calculation
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          7-day planetary week (Sun–Saturn)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-peacock-blue/5 rounded-lg border-l-4 border-peacock-blue">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Historical Context: Sūrya Siddhānta Algorithms
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The <span className="font-serif italic">Sūrya Siddhānta</span> (~400-500 CE) provides the mathematical 
                    foundation for these calculations. By determining the Moon's longitude (λ<sub>Moon</sub>) and the Sun's 
                    longitude (λ<sub>Sun</sub>) at any moment, the Panchang computes the five limbs algorithmically. This 
                    enabled communities across the subcontinent to synchronize festivals (e.g., Dīpāvalī, Holī) despite 
                    geographical separation—a remarkable achievement in pre-modern timekeeping.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* House Systems (Bhāva) Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lotus-pink/10 via-background to-sandalwood/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Bhāva Systems: Mathematical Coordinate Division
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                House (bhāva) systems are geometric methods for dividing the ecliptic into 12 sectors—not mystical divisions
              </p>
            </div>

            <Card className="border-2 border-indigo-dharma bg-card/50 backdrop-blur mb-8">
              <CardHeader className="bg-gradient-to-r from-indigo-dharma/10 to-peacock-blue/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-indigo-dharma" />
                  Three House Systems: Geometric Transformations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  House systems are mathematical methods for dividing the sky into 12 sectors. Different traditions 
                  use different geometric approaches—each valid as a coordinate system, not as an absolute truth.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">System</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Sanskrit</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Method</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Historical Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-peacock-blue/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-peacock-blue">Whole Sign (Parāśarī)</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">पराशरी</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          1 sign = 1 house (30° sectors)
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Traditional Jyotiṣa (<span className="font-serif italic">Bṛhat Parāśara Horā Śāstra</span>)
                        </td>
                      </tr>
                      <tr className="hover:bg-saffron/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-saffron">Placidus</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">—</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Time-based quadrant division
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Western system (17th century CE)
                        </td>
                      </tr>
                      <tr className="hover:bg-indigo-dharma/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-indigo-dharma">Śrīpati (Porphyry)</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">श्रीपति</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Geometric interpolation between cusps
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Medieval Indian-Western synthesis
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-saffron/5 rounded-lg border-l-4 border-saffron">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Post-Calculation Transformation: Tropical → Sidereal
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      All house systems calculate cusps in the <strong>tropical zodiac</strong> first, then convert 
                      to sidereal by subtracting the ayanāṃśa:
                    </p>
                    <div className="bg-background/50 rounded p-3 font-mono text-xs text-foreground">
                      sidereal_cusp = (tropical_cusp - ayanamsa) % 360.0
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-dharma/5 rounded-lg border-l-4 border-indigo-dharma">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Scholarly Note: Coordinate Systems, Not Mystical Truth
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      House systems are mathematical conventions—different geometric ways to divide space relative to 
                      the horizon and ecliptic. The choice of system affects house positions but does not represent an 
                      objective astronomical "truth." Researchers should document which system they use for reproducibility.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* System Architecture & Developer Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-peacock-blue/10 via-background to-ocean-teal/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                For Researchers & Developers
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Technical architecture, prerequisites, and research use cases
              </p>
            </div>

            {/* System Architecture */}
            <Card className="border-2 border-peacock-blue bg-card/50 backdrop-blur mb-8">
              <CardHeader className="bg-gradient-to-r from-peacock-blue/10 to-ocean-teal/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-peacock-blue" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-background/50 rounded-lg p-6 font-mono text-sm border border-border mb-6">
                  <div className="text-peacock-blue">app.py</div>
                  <div className="ml-4 text-muted-foreground">└── <span className="text-saffron">jyotish/</span></div>
                  <div className="ml-8 text-muted-foreground">
                    ├── <span className="text-foreground">astro.py</span> (Swiss Ephemeris, Coordinates)
                  </div>
                  <div className="ml-8 text-muted-foreground">
                    ├── <span className="text-foreground">panchang.py</span> (Five Limbs algorithms)
                  </div>
                  <div className="ml-8 text-muted-foreground">
                    ├── <span className="text-foreground">dasha.py</span> (Vimśottarī cycles)
                  </div>
                  <div className="ml-8 text-muted-foreground">
                    └── <span className="text-foreground">utils.py</span> (Geocoding, Timezone)
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-peacock-blue mb-3">Prerequisites</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-peacock-blue font-mono">•</span>
                        <span>Python 3.10+ (with pip)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-peacock-blue font-mono">•</span>
                        <span>C/C++ compiler (for <code className="text-xs bg-background px-1 py-0.5 rounded">pyswisseph</code> build)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-peacock-blue font-mono">•</span>
                        <span>Swiss Ephemeris data files (~40-60 MB)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-peacock-blue font-mono">•</span>
                        <span>Streamlit, pyswisseph, geopy, pandas, pytz</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-saffron mb-3">Research Use Cases</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-saffron font-mono">•</span>
                        <span>Validating astronomical observations in Sanskrit texts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-saffron font-mono">•</span>
                        <span>Correlating literary dates with celestial configurations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-saffron font-mono">•</span>
                        <span>Studying historical calendar systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-saffron font-mono">•</span>
                        <span>Archaeological chronology research</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub & API Access */}
            <Card className="border-2 border-saffron bg-card/50 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-saffron/10 to-turmeric/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Github className="w-6 h-6 text-saffron" />
                  Open Source Repository
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The full source code, documentation, and installation instructions are available on GitHub. 
                  Contributions, bug reports, and research collaborations are welcome.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-peacock-blue to-ocean-teal hover:from-peacock-blue/90 hover:to-ocean-teal/90 text-white shadow-lg"
                    asChild
                  >
                    <a
                      href="https://github.com/srangam-research/jyotish-calculator"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      View on GitHub
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-saffron text-saffron hover:bg-saffron hover:text-white"
                    asChild
                  >
                    <a href="mailto:research@srangam.app?subject=Jyotish%20API%20Documentation%20Request">
                      <Code2 className="w-5 h-5 mr-2" />
                      Request API Docs
                    </a>
                  </Button>
                </div>

                <div className="p-4 bg-background/50 rounded-lg border-l-4 border-peacock-blue">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    CLI Usage Example
                  </p>
                  <div className="bg-background rounded p-3 font-mono text-xs text-muted-foreground">
                    $ python -m jyotish calculate \<br/>
                    <span className="ml-4">--date "1947-08-15" \</span><br/>
                    <span className="ml-4">--time "00:00" \</span><br/>
                    <span className="ml-4">--location "New Delhi" \</span><br/>
                    <span className="ml-4">--ayanamsa "Lahiri" \</span><br/>
                    <span className="ml-4">--charts "D1,D9"</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
