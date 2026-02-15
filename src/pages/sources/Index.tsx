import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Database, FileText, Languages, Scroll, Archive } from 'lucide-react';

export default function SourcesIndex() {
  const { t } = useTranslation();

  const sourceCategories = [
    {
      id: 'edicts',
      title: 'Royal Edicts & Imperial Inscriptions',
      description: 'Multilingual royal proclamations from ancient Indian empires, showcasing administrative diversity and cultural synthesis across linguistic boundaries.',
      icon: Scroll,
      path: '/sources/edicts',
      stats: { items: '24+', languages: '8', period: '320 BCE - 300 CE' },
      available: true
    },
    {
      id: 'epigraphy',
      title: 'Epigraphic Database',
      description: 'Comprehensive collection of ancient inscriptions from across the Indian subcontinent, documenting political, religious, and commercial activities.',
      icon: Archive,
      path: '/sources/epigraphy',
      stats: { items: '2,000+', languages: '12', period: '600 BCE - 1200 CE' },
      available: true
    },
    {
      id: 'trade-docs',
      title: 'Trade Documents & Commercial Records',
      description: 'Ancient maritime trade agreements, customs records, and merchant guild documents revealing extensive Indo-Roman and Southeast Asian commerce.',
      icon: FileText,
      path: '/sources/trade-docs',
      stats: { items: '150+', languages: '6', period: '100 BCE - 500 CE' },
      available: true
    },
    {
      id: 'sanskrit-terminology',
      title: 'Sanskrit & Dharmic Terminology',
      description: 'Interactive database of Sanskrit terms with IAST transliteration, etymology, and cultural context across 9 Indian languages.',
      icon: Languages,
      path: '/sources/sanskrit-terminology',
      stats: { items: '500+', languages: '9', category: 'Reference' },
      available: true
    },
    {
      id: 'bibliography',
      title: 'Scholarly Bibliography',
      description: 'Curated collection of academic sources, archaeological reports, and authoritative translations supporting Srangam research.',
      icon: BookOpen,
      path: '/sources/bibliography',
      stats: { items: '300+', type: 'Academic', category: 'Reference' },
      available: false
    },
    {
      id: 'methodology',
      title: 'Research Methodology',
      description: 'Transparent documentation of Srangam\'s research approach, correlation methods, and standards for multilingual scholarship.',
      icon: Database,
      path: '/sources/methodology',
      stats: { type: 'Methods', category: 'Meta', points: '69 correlations' },
      available: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>Sources & References | Srangam</title>
        <meta name="description" content="Comprehensive collection of primary sources, inscriptions, and scholarly references documenting ancient India's cultural and commercial networks." />
        <meta property="og:title" content="Sources & References | Srangam" />
        <meta property="og:description" content="Multilingual primary sources and scholarly references for ancient Indian history." />
        <link rel="canonical" href="https://srangam.nartiang.org/sources-method" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Database className="text-primary mr-3" size={40} />
                <h1 className="text-4xl font-bold text-foreground">
                  Sources & References
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                Srangam's source collection represents rigorous academic standards and transparent methodology. 
                Every claim is grounded in archaeological evidence, epigraphic records, and peer-reviewed scholarship.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">2,500+</span> Primary Sources
                </div>
                <div>
                  <span className="font-semibold text-foreground">12</span> Ancient Scripts
                </div>
                <div>
                  <span className="font-semibold text-foreground">9</span> Modern Languages
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Source Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Source Collections</h2>
            <p className="text-muted-foreground">
              Multilingual primary sources and research tools for exploring ancient India's civilizational heritage
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sourceCategories.map((category) => {
              const IconComponent = category.icon;
              
              return (
                <Card 
                  key={category.id}
                  className={`group relative overflow-hidden transition-all ${
                    category.available 
                      ? 'hover:shadow-lg hover:border-primary cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {category.available ? (
                    <Link to={category.path}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <IconComponent className="text-primary group-hover:text-saffron transition-colors" size={24} />
                          {category.available && (
                            <Badge variant="secondary" className="text-xs">Available</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {Object.entries(category.stats).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="font-medium text-foreground">{value}</span>
                              <span className="capitalize">{key}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Link>
                  ) : (
                    <>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <IconComponent className="text-muted-foreground" size={24} />
                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                        </div>
                        <CardTitle className="text-lg font-semibold">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {Object.entries(category.stats).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="font-medium">{value}</span>
                              <span className="capitalize">{key}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Standards Section */}
        <section className="bg-card/30 border-y border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Academic Standards & Transparency
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  All sources in Srangam's collection adhere to rigorous academic standards. 
                  Inscriptions are presented with original scripts, IAST transliteration, and multiple scholarly translations. 
                  Archaeological dating follows established chronologies with uncertainties clearly noted.
                </p>
                <p>
                  Our multilingual approach ensures accessibility across 9 Indian languages (English, Hindi, Tamil, Telugu, 
                  Kannada, Bengali, Punjabi, Assamese, Marathi) while maintaining scholarly precision through standardized 
                  transliteration systems (IAST for Sanskrit, ISO 15919 for regional languages).
                </p>
                <p>
                  Every inscription includes metadata: location (ancient and modern), dynastic period, script types, 
                  material substrate, preservation status, and bibliographic references to published editions and translations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Using the Sources</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">For Scholars</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cite specific inscriptions using our standardized IDs</li>
                  <li>• Access original scripts and transliterations for linguistic analysis</li>
                  <li>• Cross-reference multiple translations and commentaries</li>
                  <li>• Export data for computational research</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">For General Readers</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse by region, dynasty, or time period</li>
                  <li>• Read translations in your preferred Indian language</li>
                  <li>• Discover cultural context through interactive tooltips</li>
                  <li>• Explore connections between inscriptions and trade routes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
