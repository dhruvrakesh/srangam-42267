import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, PlayCircle, Gauge, FileText } from 'lucide-react';

interface ArticleHealth {
  slug: string;
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'error';
  narratorIntegrated: boolean;
  visualizationCount: number;
  lastChecked?: string;
  issues: string[];
}

const ARTICLE_INVENTORY: ArticleHealth[] = [
  // Simple Articles
  { slug: 'ashoka-kandahar-edicts', name: 'Ashoka Kandahar Edicts', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 0, issues: [] },
  { slug: 'chola-naval-raid', name: 'Chola Naval Raid', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 0, issues: [] },
  { slug: 'earth-sea-sangam', name: 'Earth Sea Sangam', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 0, issues: [] },
  { slug: 'gondwana-to-himalaya', name: 'Gondwana to Himalaya', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 0, issues: [] },
  { slug: 'kutai-yupa-borneo', name: 'Kutai Yupa Borneo', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 0, issues: [] },
  { slug: 'monsoon-trade-clock', name: 'Monsoon Trade Clock', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 2, issues: [] },
  { slug: 'pepper-and-bullion', name: 'Pepper and Bullion', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 0, issues: [] },
  { slug: 'reassessing-ashoka-legacy', name: 'Reassessing Ashoka Legacy', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 4, issues: [] },
  { slug: 'scripts-that-sailed', name: 'Scripts That Sailed', category: 'simple', status: 'healthy', narratorIntegrated: true, visualizationCount: 5, issues: [] },
  
  // Complex Visualizations
  { slug: 'geomythology-land-reclamation', name: 'Geomythology Land Reclamation', category: 'complex', status: 'healthy', narratorIntegrated: true, visualizationCount: 3, issues: [] },
  { slug: 'indian-ocean-power-networks', name: 'Indian Ocean Power Networks', category: 'complex', status: 'healthy', narratorIntegrated: true, visualizationCount: 6, issues: [] },
  { slug: 'riders-on-monsoon', name: 'Riders on Monsoon', category: 'complex', status: 'warning', narratorIntegrated: true, visualizationCount: 60, issues: ['60+ visualizations may cause performance concerns'] },
  { slug: 'sacred-tree-harvest-rhythms', name: 'Sacred Tree Harvest Rhythms', category: 'complex', status: 'healthy', narratorIntegrated: true, visualizationCount: 7, issues: [] },
  { slug: 'scripts-that-sailed-ii', name: 'Scripts That Sailed II', category: 'complex', status: 'healthy', narratorIntegrated: true, visualizationCount: 5, issues: [] },
  { slug: 'stone-purana', name: 'Stone Purana', category: 'complex', status: 'warning', narratorIntegrated: true, visualizationCount: 9, issues: ['Load time may exceed 4s'] },
  { slug: 'stone-song-and-sea', name: 'Stone Song and Sea', category: 'complex', status: 'healthy', narratorIntegrated: true, visualizationCount: 11, issues: [] },
  
  // i18n Articles
  { slug: 'cosmic-island-sacred-land', name: 'Cosmic Island Sacred Land', category: 'i18n', status: 'healthy', narratorIntegrated: true, visualizationCount: 4, issues: [] },
  { slug: 'janajati-oral-traditions', name: 'Janajati Oral Traditions', category: 'i18n', status: 'healthy', narratorIntegrated: true, visualizationCount: 3, issues: [] },
  { slug: 'maritime-memories-south-india', name: 'Maritime Memories South India', category: 'i18n', status: 'healthy', narratorIntegrated: true, visualizationCount: 2, issues: [] },
  
  // Not Integrated
  { slug: 'asura-exiles-indo-iranian', name: 'Asura Exiles Indo-Iranian', category: 'simple', status: 'error', narratorIntegrated: false, visualizationCount: 5, issues: ['Narrator not integrated'] },
  { slug: 'reassessing-rigveda-antiquity', name: 'Reassessing Rigveda Antiquity', category: 'simple', status: 'error', narratorIntegrated: false, visualizationCount: 5, issues: ['Narrator not integrated'] },
  { slug: 'rishi-genealogies-vedic-tradition', name: 'Rishi Genealogies Vedic Tradition', category: 'simple', status: 'error', narratorIntegrated: false, visualizationCount: 4, issues: ['Narrator not integrated'] },
  { slug: 'sarira-atman-vedic-preservation', name: 'Sarira Atman Vedic Preservation', category: 'simple', status: 'error', narratorIntegrated: false, visualizationCount: 5, issues: ['Narrator not integrated'] },
  { slug: 'jambudvipa-connected', name: 'Jambudvipa Connected', category: 'i18n', status: 'error', narratorIntegrated: false, visualizationCount: 8, issues: ['Narrator not integrated'] },
];

export default function ArticleHealthDashboard() {
  const [articles, setArticles] = useState<ArticleHealth[]>(ARTICLE_INVENTORY);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'error'>('all');
  
  const stats = {
    total: articles.length,
    healthy: articles.filter(a => a.status === 'healthy').length,
    warning: articles.filter(a => a.status === 'warning').length,
    error: articles.filter(a => a.status === 'error').length,
    integrated: articles.filter(a => a.narratorIntegrated).length,
  };
  
  const filteredArticles = filter === 'all' 
    ? articles 
    : articles.filter(a => a.status === filter);
  
  const getStatusIcon = (status: ArticleHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };
  
  const getCategoryBadge = (category: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      simple: 'default',
      complex: 'secondary',
      i18n: 'outline',
    };
    return <Badge variant={variants[category] || 'default'}>{category}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Article Health Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of UniversalNarrator integration status</p>
          <Badge variant="outline" className="mt-2">DEV MODE ONLY</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilter('healthy')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Healthy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.healthy}</div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilter('warning')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.warning}</div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilter('error')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.error}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Integrated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.integrated}</div>
              <p className="text-xs text-muted-foreground mt-1">{Math.round((stats.integrated / stats.total) * 100)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Articles
          </Button>
          <Button 
            variant={filter === 'healthy' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('healthy')}
          >
            Healthy Only
          </Button>
          <Button 
            variant={filter === 'warning' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('warning')}
          >
            Warnings Only
          </Button>
          <Button 
            variant={filter === 'error' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('error')}
          >
            Errors Only
          </Button>
        </div>

        {/* Articles List */}
        <div className="space-y-3">
          {filteredArticles.map(article => (
            <Card key={article.slug} className="hover:bg-accent/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(article.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{article.name}</h3>
                        {getCategoryBadge(article.category)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">/{article.slug}</p>
                      
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          <span className={article.narratorIntegrated ? 'text-green-600' : 'text-red-600'}>
                            {article.narratorIntegrated ? 'Narrator ✓' : 'No Narrator'}
                          </span>
                        </div>
                        
                        {article.visualizationCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Gauge className="w-4 h-4" />
                            <span className="text-muted-foreground">
                              {article.visualizationCount} visualization{article.visualizationCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {article.issues.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {article.issues.map((issue, idx) => (
                            <p key={idx} className="text-xs text-yellow-600 dark:text-yellow-500">
                              ⚠️ {issue}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">This dashboard is only visible in development mode</p>
        </div>
      </div>
    </div>
  );
}
