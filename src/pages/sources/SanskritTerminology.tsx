import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Languages, BookOpen, Info } from 'lucide-react';
import { culturalTermsDatabase } from '@/data/articles/cultural-terms';
import { devanagariToIAST, iastToSimple } from '@/lib/sanskritUtils';
import { SupportedLanguage } from '@/lib/i18n';

export default function SanskritTerminology() {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [scriptView, setScriptView] = useState<'devanagari' | 'iast' | 'simple'>('iast');
  const currentLang = i18n.language as SupportedLanguage;

  // Convert cultural terms database to array
  const allTerms = useMemo(() => {
    return Object.entries(culturalTermsDatabase).map(([key, term]) => ({
      id: key,
      ...term
    }));
  }, []);

  // Filter terms based on search query
  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return allTerms;
    
    const query = searchQuery.toLowerCase();
    return allTerms.filter(term => {
      const termLower = term.term.toLowerCase();
      const enTranslation = term.translations.en?.translation?.toLowerCase() || '';
      const currentLangTranslation = term.translations[currentLang]?.translation?.toLowerCase() || '';
      
      return termLower.includes(query) || 
             enTranslation.includes(query) || 
             currentLangTranslation.includes(query);
    });
  }, [allTerms, searchQuery, currentLang]);

  // Format term based on script view
  const formatTerm = (term: string) => {
    switch (scriptView) {
      case 'devanagari':
        // If already in Devanagari, return as is
        if (/[\u0900-\u097F]/.test(term)) return term;
        return term; // Keep as is if not in Devanagari
      case 'simple':
        return iastToSimple(term);
      case 'iast':
      default:
        return term;
    }
  };

  // Get term context in current language
  const getTermContext = (term: typeof allTerms[0]) => {
    const langData = term.translations[currentLang] || term.translations.en;
    return {
      translation: langData?.translation || term.term,
      transliteration: langData?.transliteration || term.term,
      etymology: langData?.etymology || '',
      culturalContext: langData?.culturalContext || ''
    };
  };

  return (
    <>
      <Helmet>
        <title>Sanskrit & Dharmic Terminology | Srangam</title>
        <meta name="description" content="Interactive database of Sanskrit and Dharmic terms with IAST transliteration, etymology, and cultural context across 9 Indian languages." />
        <meta property="og:title" content="Sanskrit & Dharmic Terminology | Srangam" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Languages className="text-primary mr-3" size={40} />
                <h1 className="text-4xl font-bold text-foreground">
                  Sanskrit & Dharmic Terminology
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                Navigate the rich vocabulary of Dharmic civilization. This interactive reference provides 
                standardized transliterations, etymologies, and cultural context for Sanskrit terms used throughout Srangam.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">{allTerms.length}+</span> Terms
                </div>
                <div>
                  <span className="font-semibold text-foreground">9</span> Languages
                </div>
                <div>
                  <span className="font-semibold text-foreground">IAST</span> Standard
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  placeholder="Search terms (e.g., dharma, yajna, maharaja)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Script Toggle */}
              <Tabs value={scriptView} onValueChange={(v) => setScriptView(v as any)} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="iast" className="text-xs">IAST</TabsTrigger>
                  <TabsTrigger value="devanagari" className="text-xs">देवनागरी</TabsTrigger>
                  <TabsTrigger value="simple" className="text-xs">Simple</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Info Banner */}
            <div className="bg-card/50 border border-border rounded-lg p-4 flex items-start gap-3">
              <Info className="text-primary flex-shrink-0 mt-0.5" size={16} />
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">
                  <span className="font-semibold text-foreground">IAST (International Alphabet of Sanskrit Transliteration)</span> 
                  {' '}is the academic standard for representing Sanskrit in Roman script with diacritical marks.
                </p>
                <p className="text-xs">
                  Example: Sanskrit धर्म becomes <span className="font-mono">dharma</span> in IAST, 
                  or <span className="font-mono">dharma</span> in simplified form.
                </p>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredTerms.length} of {allTerms.length} terms
          </div>

          {/* Terms Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTerms.map((term) => {
              const context = getTermContext(term);
              
              return (
                <Card key={term.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-1">
                          {formatTerm(term.term)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {context.translation}
                        </CardDescription>
                      </div>
                      <BookOpen className="text-primary flex-shrink-0 ml-2" size={16} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Transliteration */}
                    {context.transliteration && context.transliteration !== term.term && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Transliteration</p>
                        <p className="text-sm font-mono text-foreground">{context.transliteration}</p>
                      </div>
                    )}

                    {/* Etymology */}
                    {context.etymology && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Etymology</p>
                        <p className="text-sm text-foreground leading-relaxed">{context.etymology}</p>
                      </div>
                    )}

                    {/* Cultural Context */}
                    {context.culturalContext && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cultural Context</p>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                          {context.culturalContext}
                        </p>
                      </div>
                    )}

                    {/* Language Availability */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Available in</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(term.translations).map((lang) => (
                          <Badge 
                            key={lang} 
                            variant={lang === currentLang ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No terms found matching "{searchQuery}". Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Usage Guidelines */}
        <section className="bg-card/30 border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Using This Reference</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">For Scholars</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <li>• IAST transliterations follow Unicode standards</li>
                    <li>• Etymology includes root words and derivational morphology</li>
                    <li>• All diacritics are preserved for academic citation</li>
                    <li>• Cross-linguistic equivalents aid comparative studies</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">For General Readers</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <li>• Switch to "Simple" view for easier pronunciation</li>
                    <li>• Devanagari script available for native readers</li>
                    <li>• Cultural context explains significance and usage</li>
                    <li>• Hover over terms throughout Srangam for quick reference</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
