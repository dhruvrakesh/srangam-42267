import { ArticleCard } from "@/components/ui/ArticleCard";
import { getArticlesByTheme } from "@/lib/multilingualArticleUtils";
import { useLanguage } from "@/components/language/LanguageProvider";
import { IconScript, IconSarnathLion, IconOm, IconLotus } from "@/components/icons";
import { SourcesAndPins } from "@/components/oceanic/SourcesAndPins";
import { CorrelationTable } from "@/components/oceanic/CorrelationTable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function AncientIndia() {
  const { currentLanguage } = useLanguage();
  const themeArticles = getArticlesByTheme("Ancient India", currentLanguage);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mauryan Heritage Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-saffron/10 via-sandalwood/20 to-terracotta/10" />
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FF6600' stroke-width='1.5' opacity='0.4'%3E%3Cpath d='M40 10 L50 30 L40 50 L30 30 Z'/%3E%3Ccircle cx='40' cy='40' r='25' fill='none'/%3E%3Cpath d='M40 15 L45 20 L40 25 L35 20 Z' fill='%23D4A574' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dharmic Heritage Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-saffron/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-saffron/20 to-turmeric/20 p-6 rounded-full backdrop-blur-sm border border-saffron/30">
                <IconOm size={52} className="text-saffron" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-terracotta/20 rounded-full blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-terracotta to-saffron p-8 rounded-full shadow-2xl border-2 border-turmeric/30">
                <IconSarnathLion size={64} className="text-cream" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-turmeric/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-turmeric/20 to-sandalwood/20 p-6 rounded-full backdrop-blur-sm border border-turmeric/30">
                <IconScript size={52} className="text-turmeric" />
              </div>
            </div>
          </div>
          <div className="relative">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-saffron via-turmeric to-terracotta bg-clip-text text-transparent">
                प्राचीन भारत
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-terracotta mb-8">
              Dharmic Heritage & Maritime Trade
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              धर्म और व्यापार — Archaeological and textual evidence for dharmic maritime networks: 
              from Mauryan inscriptions to Roman coin hoards, from guild seals to pepper warehouses. 
              Exploring how dharmic principles guided ancient Indian Ocean trade.
            </p>
            <div className="mt-6 h-1 w-32 bg-gradient-to-r from-saffron via-turmeric to-terracotta mx-auto rounded-full"></div>
            
            {/* Sanskrit Shloka */}
            <div className="mt-8 p-6 bg-sandalwood/10 backdrop-blur-sm rounded-2xl border border-saffron/20 max-w-2xl mx-auto">
              <div className="text-saffron font-serif text-lg mb-2">वसुधैव कुटुम्बकम्</div>
              <div className="text-charcoal/70 text-sm italic">
                "The world is one family" — Maha Upanishad 6.72
              </div>
            </div>
          </div>
        </div>

        {/* Sacred Ecology Series Featured Section */}
        <div className="mb-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <IconLotus className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-2xl font-semibold">Sacred Ecology Series</h3>
              <p className="text-sm text-muted-foreground">Two-part exploration of ritual calendars and material culture</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Part 1 of 2</Badge>
                  <span className="text-xs text-muted-foreground">26 min read</span>
                </div>
                <CardTitle className="text-lg">Under the Sacred Tree</CardTitle>
                <CardDescription>Harvest Rhythms, Groves, and Sky-Time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  17 tree species across Bhāratavarṣa—from banyan council-grounds to śāl blossom rites in Sarna groves. Explores living ritual practices as <em>scores</em> synchronized with seasons, monsoons, and star-time.
                </p>
                <Link to="/sacred-tree-harvest-rhythms" className="text-primary hover:underline text-sm font-medium">
                  Read Part 1 →
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Part 2 of 2</Badge>
                  <span className="text-xs text-muted-foreground">32 min read</span>
                </div>
                <CardTitle className="text-lg">Stone, Song, and Sea</CardTitle>
                <CardDescription>Janajāti Memory from Petroglyphs to Monoliths</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Material <em>venues</em> that preserve ritual—acoustic archaeology at Kupgal, megalithic gardens in Nartiang, cupules at Daraki-Chattān, oral archives in the Andamans. Introduces the <strong>Venue vs. Score</strong> methodological framework.
                </p>
                <Link to="/stone-song-and-sea" className="text-primary hover:underline text-sm font-medium">
                  Read Part 2 →
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-background/50 rounded-lg border border-primary/10">
            <p className="text-sm">
              <strong>Methodological Innovation:</strong> The Venue vs. Score framework demonstrates how stone places preserve infrastructure while living rituals preserve performance—enabling rigorous study of <em>longue durée</em> continuity without essentialist claims.
            </p>
          </div>
        </div>

        {/* Indo-Iranian Origins Featured Section */}
        <div className="mb-12 bg-gradient-to-r from-saffron/10 to-turmeric/10 rounded-lg p-8 border-2 border-saffron/20">
          <div className="flex items-center gap-3 mb-4">
            <IconOm className="w-8 h-8 text-saffron" />
            <div>
              <h3 className="text-2xl font-semibold">Indo-Iranian Origins</h3>
              <p className="text-sm text-muted-foreground">Archaeological, linguistic, and mythological evidence for civilizational continuity</p>
            </div>
          </div>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Comprehensive Study</Badge>
                <span className="text-xs text-muted-foreground">48 min read</span>
              </div>
              <CardTitle className="text-lg">The Asura Exiles</CardTitle>
              <CardDescription>Indo-Iranian Origins, Mitanni, and the Vedic-Zoroastrian Schism</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Archaeological, linguistic, and mythological evidence for an Indo-Iranian homeland in ancient India. Explores the Mitanni connection, the Out of India theory, and the memory of a civilizational schism preserved in scripture and stone.
              </p>
              <Link to="/asura-exiles-indo-iranian" className="text-primary hover:underline text-sm font-medium">
                Read Full Article →
              </Link>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-background/50 rounded-lg border border-saffron/10">
            <p className="text-sm">
              <strong>Methodological Note:</strong> This article examines the controversial Out of India theory alongside mainstream scholarship. Interactive components allow readers to explore evidence with appropriate confidence levels and scholarly context.
            </p>
          </div>
        </div>

        {/* Vedic Knowledge Systems Featured Section */}
        <div className="mb-12 bg-gradient-to-r from-turmeric/10 to-sandalwood/10 rounded-lg p-8 border-2 border-turmeric/20">
          <div className="flex items-center gap-3 mb-4">
            <IconOm className="w-8 h-8 text-turmeric" />
            <div>
              <h3 className="text-2xl font-semibold">Vedic Knowledge Systems</h3>
              <p className="text-sm text-muted-foreground">Preservation technologies of oral tradition</p>
            </div>
          </div>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Textual Scholarship</Badge>
                <span className="text-xs text-muted-foreground">38 min read</span>
              </div>
              <CardTitle className="text-lg">Śarīra and Ātman</CardTitle>
              <CardDescription>The Preservation of the Vedas through the Anukramaṇīs and the Bhāṣya of Sāyaṇāchārya</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                How did oral texts survive millennia without corruption? The Anukramaṇīs provided the <em>śarīra</em> (body)—indexing each mantra by ṛṣi, devatā, and chandas. Sāyaṇāchārya's 14th-century commentary provided the <em>ātman</em> (soul)—preserving meaning during Vijayanagara's manuscript renaissance. Explores holographic preservation, metrical locks, and the technology of textual memory.
              </p>
              <Link to="/sarira-atman-vedic-preservation" className="text-primary hover:underline text-sm font-medium">
                Read Full Article →
              </Link>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-background/50 rounded-lg border border-turmeric/10">
            <p className="text-sm">
              <strong>Historical Context:</strong> Sāyaṇāchārya's comprehensive commentary project (1330s-1380s) coincided with the Vijayanagara Empire's patronage of Sanskrit learning following centuries of manuscript destruction during Islamic invasions. This article examines preservation as <em>technology</em>, not mysticism.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themeArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Placeholder for more content */}
        {themeArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">More articles coming soon...</p>
          </div>
        )}

        {/* Sources & Pins Integration */}
        <div className="mt-16 border-t border-saffron/20 pt-12">
          <SourcesAndPins pageOrCard="Ancient India" />
        </div>

        {/* QA Correlation Table */}
        <div className="mt-12">
          <CorrelationTable />
        </div>
      </div>
    </div>
  );
}