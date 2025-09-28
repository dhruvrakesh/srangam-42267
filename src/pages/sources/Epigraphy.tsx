import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scroll, Filter, MapPin, Calendar, Languages } from 'lucide-react';
import { inscriptionRegistry } from '@/data/inscriptions/registry';
import { ScriptViewer } from '@/components/inscriptions/ScriptViewer';
import { TranslationPanel } from '@/components/inscriptions/TranslationPanel';
import { ContextualCommentary } from '@/components/inscriptions/ContextualCommentary';

export default function Epigraphy() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [scriptFilter, setScriptFilter] = useState('');
  const [selectedInscription, setSelectedInscription] = useState<string | null>(null);

  const allInscriptions = inscriptionRegistry.inscriptions;
  const allRegions = inscriptionRegistry.getAllRegions();
  const allPeriods = inscriptionRegistry.getAllPeriods();
  const allScriptTypes = [...new Set(allInscriptions.flatMap(i => i.scripts.map(s => s.scriptType)))];

  // Apply filters
  let filteredInscriptions = searchQuery ? inscriptionRegistry.search(searchQuery) : allInscriptions;
  
  if (regionFilter) {
    filteredInscriptions = filteredInscriptions.filter(inscription =>
      inscription.location.region.toLowerCase().includes(regionFilter.toLowerCase())
    );
  }
  
  if (periodFilter) {
    filteredInscriptions = filteredInscriptions.filter(inscription =>
      `${inscription.period.dynasty} (${inscription.period.century})` === periodFilter
    );
  }

  if (scriptFilter) {
    filteredInscriptions = filteredInscriptions.filter(inscription =>
      inscription.scripts.some(script => script.scriptType === scriptFilter)
    );
  }

  const selectedInscriptionData = selectedInscription 
    ? inscriptionRegistry.getById(selectedInscription)
    : null;

  return (
    <>
      <Helmet>
        <title>{t('sources.epigraphy.title')} | Srangam</title>
        <meta name="description" content={t('sources.epigraphy.description')} />
        <meta property="og:title" content={`${t('sources.epigraphy.title')} | Srangam`} />
        <meta property="og:description" content={t('sources.epigraphy.description')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Scroll className="text-primary mr-3" size={32} />
                <h1 className="text-4xl font-bold text-foreground">
                  {t('sources.epigraphy.title', 'Epigraphic Database')}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('sources.epigraphy.description', 'Comprehensive collection of ancient inscriptions from across the Indian subcontinent and Southeast Asia, spanning multiple scripts, languages, and historical periods.')}
              </p>
              <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Languages size={16} />
                  {allScriptTypes.length} Script Types
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {allRegions.length} Regions
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {allInscriptions.length} Inscriptions
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="database" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="database">Database Browser</TabsTrigger>
              <TabsTrigger value="detailed" disabled={!selectedInscription}>
                {selectedInscription ? 'Detailed Analysis' : 'Select Inscription'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="database" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter size={20} />
                    Search & Filter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        type="text"
                        placeholder="Search inscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Regions</SelectItem>
                        {allRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Periods</SelectItem>
                        {allPeriods.map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={scriptFilter} onValueChange={setScriptFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by script" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Scripts</SelectItem>
                        {allScriptTypes.map((script) => (
                          <SelectItem key={script} value={script}>
                            {script.charAt(0).toUpperCase() + script.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInscriptions.map((inscription) => (
                  <Card 
                    key={inscription.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedInscription(inscription.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {inscription.title}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {inscription.location.ancient}, {inscription.location.region}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {inscription.period.dynasty} • {inscription.period.century}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Scripts:</p>
                          <div className="flex flex-wrap gap-1">
                            {inscription.scripts.map((script, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {script.scriptType}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {inscription.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {inscription.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{inscription.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInscription(inscription.id);
                          }}
                        >
                          Analyze Inscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {filteredInscriptions.length === 0 && (
                <div className="text-center py-12">
                  <Scroll className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Inscriptions Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or clearing some filters.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              {selectedInscriptionData && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="border-l-4 border-primary pl-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedInscriptionData.title}
                    </h2>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {selectedInscriptionData.location.ancient}, {selectedInscriptionData.location.modern}
                      </span>
                      <span>
                        {selectedInscriptionData.period.dynasty} • {selectedInscriptionData.period.dating.approximate}
                      </span>
                    </div>
                  </div>

                  {/* Script Viewer */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Original Scripts</h3>
                    <ScriptViewer
                      scripts={selectedInscriptionData.scripts}
                      title={selectedInscriptionData.title}
                      layout="stacked"
                      showTransliteration={true}
                      interactive={true}
                    />
                  </div>

                  {/* Translation Panel */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Translations & Analysis</h3>
                    <TranslationPanel translations={selectedInscriptionData.translations} />
                  </div>

                  {/* Cultural Context */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Cultural Context</h3>
                    <ContextualCommentary
                      context={selectedInscriptionData.culturalContext}
                      expandable={true}
                      defaultExpanded={true}
                    />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedInscriptionData.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

