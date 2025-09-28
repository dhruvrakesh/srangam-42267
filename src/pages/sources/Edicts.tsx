import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Globe, MapPin } from 'lucide-react';
import { inscriptionRegistry } from '@/data/inscriptions/registry';
import { ScriptViewer } from '@/components/inscriptions/ScriptViewer';
import { TranslationPanel } from '@/components/inscriptions/TranslationPanel';
import { ContextualCommentary } from '@/components/inscriptions/ContextualCommentary';

export default function Edicts() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdict, setSelectedEdict] = useState<string | null>(null);

  // Get all edicts (inscriptions with administrative/imperial context)
  const allEdicts = inscriptionRegistry.inscriptions.filter(inscription => 
    inscription.tags.some(tag => 
      tag.toLowerCase().includes('edict') || 
      tag.toLowerCase().includes('imperial') ||
      tag.toLowerCase().includes('ashoka') ||
      inscription.period.dynasty.toLowerCase().includes('mauryan')
    )
  );

  const filteredEdicts = searchQuery 
    ? inscriptionRegistry.search(searchQuery).filter(inscription => 
        allEdicts.some(edict => edict.id === inscription.id)
      )
    : allEdicts;

  const selectedInscription = selectedEdict 
    ? inscriptionRegistry.getById(selectedEdict)
    : null;
  
  return (
    <>
      <Helmet>
        <title>{t('sources.edicts.title')} | Srangam</title>
        <meta name="description" content={t('sources.edicts.description')} />
        <meta property="og:title" content={`${t('sources.edicts.title')} | Srangam`} />
        <meta property="og:description" content={t('sources.edicts.description')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <BookOpen className="text-primary mr-3" size={32} />
                <h1 className="text-4xl font-bold text-foreground">
                  {t('sources.edicts.title', 'Royal Edicts & Imperial Inscriptions')}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('sources.edicts.description', 'Multilingual royal proclamations from ancient Indian empires, showcasing administrative diversity and cultural synthesis across linguistic boundaries.')}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Collection</TabsTrigger>
              <TabsTrigger value="viewer" disabled={!selectedEdict}>
                {selectedEdict ? 'Detailed View' : 'Select an Edict'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  placeholder="Search edicts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Edicts Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEdicts.map((edict) => (
                  <Card 
                    key={edict.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedEdict(edict.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {edict.title}
                        </CardTitle>
                        <Globe className="text-primary flex-shrink-0 ml-2" size={16} />
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin size={14} />
                        {edict.location.ancient}, {edict.location.modern}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {edict.period.dynasty} • {edict.period.century}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {edict.period.ruler || 'Unknown Ruler'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Scripts:</p>
                          <div className="flex flex-wrap gap-1">
                            {edict.scripts.map((script, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {script.scriptType}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEdict(edict.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEdicts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No edicts found matching "${searchQuery}"`
                      : 'No edicts available'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="viewer" className="space-y-6">
              {selectedInscription && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="border-l-4 border-primary pl-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedInscription.title}
                    </h2>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {selectedInscription.location.ancient}, {selectedInscription.location.modern}
                      </span>
                      <span>
                        {selectedInscription.period.dynasty} • {selectedInscription.period.dating.approximate}
                      </span>
                    </div>
                  </div>

                  {/* Script Viewer */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Original Scripts</h3>
                    <ScriptViewer
                      scripts={selectedInscription.scripts}
                      title={selectedInscription.title}
                      layout="stacked"
                      showTransliteration={true}
                      interactive={true}
                    />
                  </div>

                  {/* Translation Panel */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Translations & Analysis</h3>
                    <TranslationPanel translations={selectedInscription.translations} />
                  </div>

                  {/* Contextual Commentary */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Historical Context</h3>
                    <ContextualCommentary
                      context={selectedInscription.culturalContext}
                      expandable={true}
                      defaultExpanded={true}
                    />
                  </div>

                  {/* Tags and Related */}
                  <div className="flex flex-wrap gap-2">
                    {selectedInscription.tags.map((tag) => (
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
