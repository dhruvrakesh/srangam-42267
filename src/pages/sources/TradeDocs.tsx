import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Ship, Coins, Warehouse, MapPin, TrendingUp } from 'lucide-react';
import { inscriptionRegistry } from '@/data/inscriptions/registry';
import { ScriptViewer } from '@/components/inscriptions/ScriptViewer';
import { TranslationPanel } from '@/components/inscriptions/TranslationPanel';

export default function TradeDocs() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Get trade-related inscriptions
  const tradeInscriptions = inscriptionRegistry.inscriptions.filter(inscription => 
    inscription.tags.some(tag => 
      tag.toLowerCase().includes('trade') || 
      tag.toLowerCase().includes('merchant') ||
      tag.toLowerCase().includes('guild') ||
      tag.toLowerCase().includes('commercial') ||
      tag.toLowerCase().includes('port')
    ) ||
    inscription.significance.politicalContext?.toLowerCase().includes('trade') ||
    inscription.location.description?.toLowerCase().includes('trade') ||
    inscription.culturalContext.geographicRelevance.tradingNetworks.length > 0
  );

  const filteredDocs = searchQuery 
    ? inscriptionRegistry.search(searchQuery).filter(inscription => 
        tradeInscriptions.some(trade => trade.id === inscription.id)
      )
    : tradeInscriptions;

  const selectedInscription = selectedDoc 
    ? inscriptionRegistry.getById(selectedDoc)
    : null;

  // Mock trade document categories for demonstration
  const tradeCategories = [
    {
      id: 'commercial-grants',
      title: 'Commercial Grants & Charters',
      description: 'Royal permissions and privileges granted to merchant guilds',
      icon: Warehouse,
      count: Math.floor(tradeInscriptions.length * 0.4)
    },
    {
      id: 'port-regulations',
      title: 'Port Regulations & Tariffs',
      description: 'Administrative inscriptions from major trading ports',
      icon: Ship,
      count: Math.floor(tradeInscriptions.length * 0.3)
    },
    {
      id: 'merchant-guilds',
      title: 'Merchant Guild Records',
      description: 'Inscriptions documenting guild activities and transactions',
      icon: Coins,
      count: Math.floor(tradeInscriptions.length * 0.3)
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('sources.tradeDocs.title')} | Srangam</title>
        <meta name="description" content={t('sources.tradeDocs.description')} />
        <meta property="og:title" content={`${t('sources.tradeDocs.title')} | Srangam`} />
        <meta property="og:description" content={t('sources.tradeDocs.description')} />
        <link rel="canonical" href="https://srangam.nartiang.org/sources/trade-docs" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Ship className="text-primary mr-3" size={32} />
                <h1 className="text-4xl font-bold text-foreground">
                  {t('sources.tradeDocs.title', 'Trade Documents & Commercial Inscriptions')}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('sources.tradeDocs.description', 'Ancient commercial inscriptions, merchant guild records, and trade regulations that reveal the economic networks spanning the Indian Ocean world.')}
              </p>
              <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp size={16} />
                  Maritime Trade Networks
                </span>
                <span className="flex items-center gap-1">
                  <Coins size={16} />
                  Guild Systems
                </span>
                <span className="flex items-center gap-1">
                  <Warehouse size={16} />
                  Commercial Regulations
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Overview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {tradeCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="text-primary" size={24} />
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {category.count} documents
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Document Collection</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!selectedDoc}>
                {selectedDoc ? 'Document Analysis' : 'Select Document'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  placeholder="Search trade documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Documents Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedDoc(doc.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {doc.title}
                        </CardTitle>
                        <Ship className="text-primary flex-shrink-0 ml-2" size={16} />
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {doc.location.ancient}, {doc.location.region}
                        </div>
                        <div className="text-sm text-foreground">
                          {doc.period.dynasty} • {doc.period.century}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {doc.culturalContext.geographicRelevance.tradingNetworks.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Trading Networks:</p>
                            <div className="flex flex-wrap gap-1">
                              {doc.culturalContext.geographicRelevance.tradingNetworks.slice(0, 2).map((network) => (
                                <Badge key={network} variant="secondary" className="text-xs">
                                  {network}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Document Type:</p>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.filter(tag => 
                              tag.toLowerCase().includes('trade') ||
                              tag.toLowerCase().includes('commercial') ||
                              tag.toLowerCase().includes('guild')
                            ).slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {doc.significance.politicalContext || doc.translations.primary}
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc.id);
                          }}
                        >
                          Analyze Document
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                  <Ship className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Trade Documents Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No documents found matching "${searchQuery}"`
                      : 'The trade document collection is being expanded'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
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

                  {/* Commercial Context */}
                  {selectedInscription.culturalContext.geographicRelevance.tradingNetworks.length > 0 && (
                    <Card className="bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp size={20} />
                          Trade Network Context
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Trading Networks</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedInscription.culturalContext.geographicRelevance.tradingNetworks.map((network) => (
                                <Badge key={network} variant="secondary">
                                  {network}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Cultural Area</h4>
                            <p className="text-muted-foreground">
                              {selectedInscription.culturalContext.geographicRelevance.culturalArea}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Script Analysis */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Original Document</h3>
                    <ScriptViewer
                      scripts={selectedInscription.scripts}
                      title={selectedInscription.title}
                      layout="stacked"
                      showTransliteration={true}
                      interactive={true}
                    />
                  </div>

                  {/* Translation Analysis */}
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Translation & Commercial Significance</h3>
                    <TranslationPanel translations={selectedInscription.translations} />
                  </div>

                  {/* Historical Significance */}
                  {selectedInscription.significance.politicalContext && (
                    <Card className="bg-card">
                      <CardHeader>
                        <CardTitle>Commercial & Political Context</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">
                          {selectedInscription.significance.politicalContext}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tags */}
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

