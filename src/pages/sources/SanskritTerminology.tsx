import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, Globe, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function SanskritTerminology() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scriptView, setScriptView] = useState<'iast' | 'devanagari' | 'simple'>('iast');
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  // Fetch all cultural terms from Supabase with pagination
  const { data: allTerms = [], isLoading } = useQuery({
    queryKey: ['cultural-terms-all'],
    queryFn: async () => {
      const allData = [];
      let from = 0;
      const batchSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('srangam_cultural_terms')
          .select('*')
          .order('usage_count', { ascending: false })
          .range(from, from + batchSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allData.push(...data);
        if (data.length < batchSize) break;
        from += batchSize;
      }
      
      return allData;
    }
  });

  const filteredTerms = useMemo(() => {
    if (!allTerms || !searchQuery.trim()) return allTerms || [];
    
    const query = searchQuery.toLowerCase();
    return allTerms.filter(term => {
      const translations = typeof term.translations === 'string' 
        ? JSON.parse(term.translations) 
        : term.translations;
      
      const searchableText = [
        term.display_term?.toLowerCase(),
        term.term?.toLowerCase(),
        term.transliteration?.toLowerCase(),
        translations?.en?.toLowerCase(),
        translations?.en?.translation?.toLowerCase(),
        translations?.en?.etymology?.toLowerCase(),
        term.module?.toLowerCase(),
        ...(term.synonyms || []).map(s => s.toLowerCase()),
        ...(term.related_terms || []).map(r => r.toLowerCase())
      ].filter(Boolean).join(' ');
      
      return searchableText.includes(query);
    });
  }, [allTerms, searchQuery]);

  const formatTerm = (term: any) => {
    switch (scriptView) {
      case 'devanagari':
        return term.display_term || term.transliteration || term.term;
      case 'simple':
        return term.term || term.display_term;
      default:
        return term.transliteration || term.display_term || term.term;
    }
  };

  const getTermContext = (term: any) => {
    const lang = currentLanguage === 'en' ? 'en' : currentLanguage;
    const translations = typeof term.translations === 'string' 
      ? JSON.parse(term.translations) 
      : term.translations;
    
    return translations?.[lang] || translations?.en || {};
  };

  return (
    <>
      <Helmet>
        <title>{`Sanskrit & Dharmic Terminology - ${allTerms.length}+ AI-Enhanced Terms | Srangam`}</title>
        <meta name="description" content={`Explore ${allTerms.length}+ Sanskrit and Dharmic terms with AI-enhanced etymology, translations, and cultural context across multiple languages.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-vedic/10 via-background to-ocean/10 border-b border-border">
          <div className="container mx-auto px-4 py-16">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Research', href: '/sources-method' },
                { label: 'Sanskrit Terminology' }
              ]} 
            />
            
            <div className="mt-8 max-w-4xl">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Sanskrit & Dharmic Terminology
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Navigate the rich vocabulary of Dharmic civilization. This AI-enhanced database provides standardized transliterations, etymologies, and cultural context for Sanskrit terms used throughout Srangam research.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              <div className="text-center">
                <div className="text-5xl font-bold text-ocean mb-2">{isLoading ? '...' : `${allTerms.length}+`}</div>
                <div className="text-muted-foreground">Terms</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-vedic mb-2">8</div>
                <div className="text-muted-foreground">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-maritime mb-2">AI</div>
                <div className="text-muted-foreground">Enhanced</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-geology mb-2">IAST</div>
                <div className="text-muted-foreground">Standard</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search terms (e.g., dharma, mahābhārata, yajña)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={scriptView} onValueChange={(v) => setScriptView(v as any)} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="iast">IAST</TabsTrigger>
                  <TabsTrigger value="devanagari">देवनागरी</TabsTrigger>
                  <TabsTrigger value="simple">Simple</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredTerms.length} of {allTerms.length} terms
            </div>
          </div>
        </section>

        {/* Terms Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading {allTerms.length || 940}+ cultural terms...</div>
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No terms found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredTerms.map((term) => {
              const context = getTermContext(term);
              const etymology = typeof term.etymology === 'string' 
                ? JSON.parse(term.etymology) 
                : term.etymology;
              const termContext = typeof term.context === 'string' 
                ? JSON.parse(term.context) 
                : term.context;

              return (
                <Card 
                  key={term.id} 
                  className="group hover:shadow-lg transition-all duration-300 hover:border-ocean/50 bg-card/95 backdrop-blur-sm"
                >
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl text-ocean group-hover:text-ocean/80 transition-colors">
                      {formatTerm(term)}
                    </CardTitle>
                    {term.transliteration && scriptView !== 'iast' && (
                      <p className="text-sm text-muted-foreground italic">
                        {term.transliteration}
                      </p>
                    )}
                    {term.module && (
                      <Badge variant="outline" className="w-fit text-xs">
                        {term.module}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-1">Translation</h4>
                      <p className="text-muted-foreground">
                        {context.translation || context || 'Translation unavailable'}
                      </p>
                    </div>

                    {etymology?.[currentLanguage] && (
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Etymology
                        </h4>
                        <p className="text-muted-foreground text-sm">{etymology[currentLanguage]}</p>
                      </div>
                    )}

                    {termContext?.[currentLanguage] && (
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Cultural Context
                        </h4>
                        <p className="text-muted-foreground text-sm">{termContext[currentLanguage]}</p>
                      </div>
                    )}

                    {term.usage_count > 0 && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Used {term.usage_count} times across articles
                      </div>
                    )}

                    {term.related_terms && term.related_terms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Related Terms
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {term.related_terms.slice(0, 5).map((relatedTerm: string) => (
                            <Badge key={relatedTerm} variant="secondary" className="text-xs">
                              {relatedTerm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-gradient-to-br from-vedic/5 to-ocean/5 border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Using This Reference</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">For Scholars</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <li>• IAST transliterations follow Unicode standards</li>
                    <li>• AI-enhanced etymology with root derivations</li>
                    <li>• All diacritics preserved for academic citation</li>
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
