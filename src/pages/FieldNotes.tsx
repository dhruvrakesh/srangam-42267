import { BookOpen, Calendar, MapPin, Search, Compass, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";
import { Link } from "react-router-dom";
import { IconDharmaChakra, IconSarnathLion } from "@/components/icons";

export default function FieldNotes() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Maritime Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-sand to-cream/80" />
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dharmic Archaeological Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-terracotta/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-terracotta/20 to-laterite/20 p-6 rounded-full backdrop-blur-sm border border-terracotta/30">
                <IconSarnathLion size={52} className="text-terracotta" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-burgundy to-burgundy-light p-8 rounded-full shadow-2xl border-2 border-saffron/20">
                <Search size={56} className="text-cream" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-dharma/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-indigo-dharma/20 to-peacock-blue/20 p-6 rounded-full backdrop-blur-sm border border-indigo-dharma/30">
                <IconDharmaChakra size={52} className="text-indigo-dharma" />
              </div>
            </div>
          </div>
          <div className="relative">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-terracotta via-burgundy to-terracotta bg-clip-text text-transparent">
                क्षेत्र टिप्पणी
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-burgundy mb-8">
              Archaeological Dharma
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-charcoal/80 leading-relaxed mb-6 font-medium">
                धर्म की खुदाई — Excavating dharma through stone, inscription, and artifact. 
                Chronicles from sacred sites where ancient wisdom meets archaeological discovery, 
                uncovering the maritime heritage of the Indian Ocean world.
              </p>
              <div className="h-1 w-32 bg-gradient-to-r from-terracotta via-burgundy to-saffron mx-auto rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Field Notes with Contextual Designs */}
        <div className="space-y-12">
          {/* Published Research - Premium Design */}
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-burgundy/20 via-gold-warm/20 to-burgundy/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-gradient-to-br from-cream/95 to-sand/95 backdrop-blur-sm border-2 border-burgundy/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgundy via-gold-warm to-burgundy rounded-t-lg"></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-burgundy/10 p-3 rounded-xl">
                      <BookOpen size={24} className="text-burgundy" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-serif text-2xl text-burgundy mb-2 group-hover:text-burgundy-light transition-colors">
                        Maritime Memories of South India: Major Publication Released
                      </CardTitle>
                      <div className="flex items-center gap-6 text-sm text-charcoal/70">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gold-warm" />
                          <span className="font-medium">March 2024</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gold-warm" />
                          <span>Berenike, Egypt & Muziris, India</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <TagChip variant="theme" className="bg-burgundy text-cream shadow-lg">
                      Published
                    </TagChip>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-warm rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-charcoal/80 leading-relaxed text-lg">
                  Our comprehensive study on Indo-Roman maritime trade networks has been published. 
                  The research integrates recent archaeological breakthroughs at Berenike, including 
                  the discovery of Indian pottery and 7.5kg of ancient pepper, with Tamil Sangam literature 
                  to reveal the true scale of ancient Indian Ocean globalization.
                </p>
                <div className="flex flex-wrap gap-3">
                  <TagChip className="bg-burgundy/10 text-burgundy border-burgundy/20">Indo-Roman Trade</TagChip>
                  <TagChip className="bg-ocean/10 text-ocean border-ocean/20">Berenike</TagChip>
                  <TagChip className="bg-gold/10 text-gold border-gold/20">Muziris</TagChip>
                  <TagChip className="bg-laterite/10 text-laterite border-laterite/20">Maritime Networks</TagChip>
                </div>
                <div className="border-t border-burgundy/20 pt-4">
                  <Link 
                    to="/maritime-memories-south-india" 
                    className="inline-flex items-center gap-2 text-lg font-semibold text-burgundy hover:text-burgundy-light transition-colors group/link"
                  >
                    <span className="relative">
                      Read Full Article
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-burgundy transition-all duration-300 group-hover/link:w-full"></span>
                    </span>
                    <span className="text-gold-warm">→</span>
                    <span className="text-sm text-charcoal/60">(18 min)</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Research - Ocean-themed Design */}
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-ocean/20 via-cyan-500/20 to-ocean/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-gradient-to-br from-sand/95 to-cyan-50/95 backdrop-blur-sm border-2 border-ocean/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ocean via-cyan-400 to-ocean rounded-t-lg"></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-ocean/10 p-3 rounded-xl">
                      <Compass size={24} className="text-ocean" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-serif text-2xl text-ocean mb-2 group-hover:text-ocean/80 transition-colors">
                        Riders on the Monsoon: Indigenous Navigation Study Published
                      </CardTitle>
                      <div className="flex items-center gap-6 text-sm text-charcoal/70">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-cyan-600" />
                          <span className="font-medium">March 2024</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-cyan-600" />
                          <span>Kerala Archives & Maritime India</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <TagChip variant="theme" className="bg-ocean text-cream shadow-lg">
                      Published
                    </TagChip>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-charcoal/80 leading-relaxed text-lg">
                  Our comprehensive analysis of newly discovered palm-leaf manuscripts reveals sophisticated 
                  indigenous navigation systems. The study demonstrates how South Asian mariners mastered 
                  monsoon patterns millennia before European "discoveries," using stellar navigation and 
                  seasonal wind knowledge encoded in ancient texts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <TagChip className="bg-ocean/10 text-ocean border-ocean/20">Navigation</TagChip>
                  <TagChip className="bg-emerald-100 text-emerald-700 border-emerald-200">Indigenous Knowledge</TagChip>
                  <TagChip className="bg-cyan-100 text-cyan-700 border-cyan-200">Monsoon</TagChip>
                  <TagChip className="bg-amber-100 text-amber-700 border-amber-200">Palm-leaf Manuscripts</TagChip>
                </div>
                <div className="border-t border-ocean/20 pt-4">
                  <Link 
                    to="/riders-on-monsoon" 
                    className="inline-flex items-center gap-2 text-lg font-semibold text-ocean hover:text-ocean/80 transition-colors group/link"
                  >
                    <span className="relative">
                      Read Full Article
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ocean transition-all duration-300 group-hover/link:w-full"></span>
                    </span>
                    <span className="text-cyan-600">→</span>
                    <span className="text-sm text-charcoal/60">(16 min)</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geological Research - Earth-themed Design */}
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-laterite/20 via-amber-500/20 to-laterite/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Card className="relative bg-gradient-to-br from-amber-50/95 to-orange-50/95 backdrop-blur-sm border-2 border-laterite/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-laterite via-amber-500 to-laterite rounded-t-lg"></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-laterite/10 p-3 rounded-xl">
                      <Layers size={24} className="text-laterite" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-serif text-2xl text-laterite mb-2 group-hover:text-orange-600 transition-colors">
                        Earth, Sea and Sangam: Geological Study Published
                      </CardTitle>
                      <div className="flex items-center gap-6 text-sm text-charcoal/70">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-amber-600" />
                          <span className="font-medium">March 2024</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-amber-600" />
                          <span>Kerala Coast & Western Ghats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <TagChip variant="theme" className="bg-laterite text-cream shadow-lg">
                      Published
                    </TagChip>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-charcoal/80 leading-relaxed text-lg">
                  Our comprehensive geological study reveals how tectonic forces, floods, and sea-level 
                  changes shaped South India's maritime geography. From Muziris' disappearance in 1341 CE 
                  to Puhār's submergence, geological evidence explains the rise and fall of ancient ports.
                </p>
                <div className="flex flex-wrap gap-3">
                  <TagChip className="bg-laterite/10 text-laterite border-laterite/20">Geology</TagChip>
                  <TagChip className="bg-orange-100 text-orange-700 border-orange-200">Coastal Change</TagChip>
                  <TagChip className="bg-amber-100 text-amber-700 border-amber-200">Ancient Ports</TagChip>
                  <TagChip className="bg-yellow-100 text-yellow-700 border-yellow-200">Tectonic History</TagChip>
                </div>
                <div className="border-t border-laterite/20 pt-4">
                  <Link 
                    to="/earth-sea-sangam" 
                    className="inline-flex items-center gap-2 text-lg font-semibold text-laterite hover:text-orange-600 transition-colors group/link"
                  >
                    <span className="relative">
                      Read Full Article
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-laterite transition-all duration-300 group-hover/link:w-full"></span>
                    </span>
                    <span className="text-amber-600">→</span>
                    <span className="text-sm text-charcoal/60">(16 min)</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Research Timeline Connection */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center gap-4 bg-gradient-to-r from-cream to-sand px-8 py-4 rounded-2xl border border-burgundy/20 shadow-lg">
            <div className="w-3 h-3 bg-burgundy rounded-full"></div>
            <span className="text-charcoal/80 font-medium">Maritime Memories Trilogy Complete</span>
            <div className="w-3 h-3 bg-ocean rounded-full"></div>
            <span className="text-charcoal/80 font-medium">→</span>
            <div className="w-3 h-3 bg-laterite rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}